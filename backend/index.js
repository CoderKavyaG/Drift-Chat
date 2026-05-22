require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const jwt = require('jsonwebtoken');

const { initSignaling } = require('./ws/signaling');
const identityRoutes = require('./routes/identity');
const roomsRoutes = require('./routes/rooms');
const friendsRoutes = require('./routes/friends');
const locationsRoutes = require('./routes/locations');

const app = express();

// Try to use real Redis, fall back to in-memory mock if not available
const redisContainer = { current: null };
let usesMock = false;

const redis = new Proxy({}, {
  get(target, prop) {
    const client = redisContainer.current;
    if (!client) return undefined;
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

// Check environment variable for forcing mock
if (process.env.USE_REDIS_MOCK === 'true') {
  console.log('[REDIS] Forcing in-memory mock');
  usesMock = true;
  const InMemoryRedis = require('./lib/redis-mock');
  redisContainer.current = new InMemoryRedis();
} else {
  // Try to use real Redis, but be quick about falling back to mock
  try {
    const Redis = require('ioredis');
    const redisOptions = {
      retryStrategy: () => null, // Disable auto-retry
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      enableOfflineQueue: false,
      connectTimeout: 5000 // 5 seconds for secure TLS handshakes
    };

    if (process.env.REDIS_URL) {
      // Upstash and secure connections need TLS enabled in ioredis options
      if (process.env.REDIS_URL.startsWith('rediss://') || process.env.REDIS_URL.includes('upstash.io') || process.env.REDIS_URL.includes('aivencloud.com')) {
        console.log('[REDIS] Enabling secure TLS connection options');
        redisOptions.tls = { rejectUnauthorized: false };
      }
      console.log('[REDIS] Connecting via URL:', process.env.REDIS_URL.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
      redisContainer.current = new Redis(process.env.REDIS_URL, redisOptions);
    } else {
      console.log('[REDIS] No REDIS_URL provided, connecting to localhost');
      redisContainer.current = new Redis({
        host: 'localhost',
        port: 6379,
        ...redisOptions
      });
    }
    
    // Don't wait for connection - use mock if connection fails
    redisContainer.current.on('error', (err) => {
      if (!usesMock) {
        console.error('[REDIS] Live Redis error:', err.message);
        console.log('[REDIS] Real Redis unavailable, switching to in-memory mock');
        usesMock = true;
        const InMemoryRedis = require('./lib/redis-mock');
        redisContainer.current = new InMemoryRedis();
      }
    });
  } catch (err) {
    console.error('[REDIS] Creation error:', err.message);
    console.log('[REDIS] Using in-memory mock instead of ioredis');
    usesMock = true;
    const InMemoryRedis = require('./lib/redis-mock');
    redisContainer.current = new InMemoryRedis();
  }
}

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

console.log('[REDIS] Redis client initialized', usesMock ? '(in-memory mock)' : '(will try to connect to real Redis)');


// Make redis available in routes
app.use((req, res, next) => {
  req.redis = redis;
  next();
});

// JWT verification middleware
function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Routes
app.use('/api/identity', identityRoutes);
app.use('/api/rooms', requireAuth, roomsRoutes);
app.use('/api/friends', requireAuth, friendsRoutes);
app.use('/api/locations', requireAuth, locationsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket signaling
const signalingModule = initSignaling(server, redis);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('[SERVER] HTTP server closed');
    redis.quit(() => {
      console.log('[SERVER] Redis connection closed');
      process.exit(0);
    });
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[SERVER] Drift Chat backend listening on port ${PORT}`);
});

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const IdentityContext = createContext();

const STORAGE_KEY = 'drift_identity_token';

/**
 * Identity persistence strategy:
 * - Token stored in localStorage → survives refreshes AND is shared across tabs (same browser = same person)
 * - On init, send the existing token so the backend returns the same ghostId/ghostName
 * - If token is expired or missing, backend generates a fresh identity
 * - Token has 24h expiry; backend auto-refreshes if < 6h remain
 *
 * This keeps the platform no-login while still letting users retain their
 * ghost identity (and friend chats) across reloads.
 */
function getStoredToken() {
  try {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) return null;
    // Quick client-side expiry check (no signature verification — backend does that)
    const decoded = jwtDecode(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function IdentityProvider({ children }) {
  const [identity, setIdentity] = useState({
    ghostId: null,
    ghostName: null,
    avatarId: null,
    token: null,
    isLoaded: false
  });

  useEffect(() => {
    const initializeIdentity = async () => {
      try {
        const existingToken = getStoredToken();

        const headers = { 'Content-Type': 'application/json' };
        // Send existing token → backend will reuse the same identity if valid
        if (existingToken) {
          headers['Authorization'] = `Bearer ${existingToken}`;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/identity/init`, {
          method: 'POST',
          headers
        });

        if (!response.ok) {
          throw new Error('Failed to initialize identity');
        }

        const data = await response.json();

        // Persist token in localStorage (survives refresh, shared across tabs in same browser)
        localStorage.setItem(STORAGE_KEY, data.token);
        // Also keep in sessionStorage for backward-compat with api.js getAuthHeader()
        sessionStorage.setItem('drift_token', data.token);

        setIdentity({
          ghostId: data.ghostId,
          ghostName: data.ghostName,
          avatarId: data.avatarId,
          token: data.token,
          isLoaded: true
        });

        console.log('[Identity] ✓ Identity ready:', data.ghostName, data.ghostId, existingToken ? '(reused)' : '(new)');
      } catch (err) {
        console.error('Identity initialization error:', err);
        setIdentity(prev => ({ ...prev, isLoaded: true }));
      }
    };

    initializeIdentity();
  }, []);

  return (
    <IdentityContext.Provider value={identity}>
      {children}
    </IdentityContext.Provider>
  );
}

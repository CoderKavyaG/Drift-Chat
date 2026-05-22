import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getSavedFriends, removeFriend } from '../lib/friends';
import { getFriends } from '../lib/api';
import { useIdentity } from '../hooks/useIdentity';
import { GhostIdentityBadge } from '../components/GhostIdentityBadge';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9D08E',
  '#FFC0CB', '#87CEEB', '#DDA0DD', '#FFB347', '#90EE90',
  '#FF69B4', '#20B2AA', '#FFD700', '#FF7F50', '#6495ED'
];

const getAvatarColor = (id) => AVATAR_COLORS[((id || 1) - 1) % AVATAR_COLORS.length];

function formatExpiry(expiresAt) {
  if (!expiresAt) return null;
  const ms = expiresAt - Date.now();
  if (ms <= 0) return 'Expired';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export function Friends() {
  const navigate = useNavigate();
  const { token, isLoaded } = useIdentity();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !token) return;

    const load = async () => {
      // Start with what's in localStorage
      const saved = getSavedFriends();

      if (saved.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // Validate against backend (filter out expired / unauthorized)
      try {
        const { friends: verified } = await getFriends(saved.map(f => f.chatId));
        const verifiedIds = new Set(verified.map(f => f.chatId?.toLowerCase()));

        // Merge localStorage metadata with backend-verified data
        const merged = saved
          .filter(f => verifiedIds.has(f.chatId?.toLowerCase()))
          .map(f => {
            const backendData = verified.find(v => v.chatId?.toLowerCase() === f.chatId?.toLowerCase());
            return { ...f, expiresAt: backendData?.expiresAt };
          });

        // Remove expired ones from localStorage
        saved
          .filter(f => !verifiedIds.has(f.chatId?.toLowerCase()))
          .forEach(f => removeFriend(f.chatId));

        setFriends(merged);
      } catch {
        // If backend unavailable, show what we have locally
        setFriends(saved);
      }
      setLoading(false);
    };

    load();
  }, [isLoaded, token]);

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#1A1A0F' }}>
      <GhostIdentityBadge />

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(26,26,15,0.9)', borderBottom: '1px solid rgba(244,96,12,0.15)' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="font-['Anton'] text-2xl uppercase tracking-wide text-[#F5F0E8] hover:text-[#F4600C] transition-colors"
          >
            drift
          </button>
          <nav className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="text-white/50 hover:text-[#F4600C] text-sm uppercase tracking-widest font-semibold transition-colors"
            >
              ← Home
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-16">

        {/* Page heading */}
        <div className="mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.3em] mb-6"
            style={{ backgroundColor: 'rgba(244,96,12,0.15)', color: '#F4600C', border: '1px solid rgba(244,96,12,0.3)' }}>
            Your Connections
          </div>
          <h1 className="font-['Anton'] text-6xl md:text-8xl uppercase text-[#F5F0E8] leading-none">
            FRIENDS
          </h1>
          <p className="text-white/40 mt-4 text-lg">
            People you've connected with. Chats last 72 hours.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex gap-2">
              {[0, 0.2, 0.4].map((delay, i) => (
                <div key={i} className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: '#F4600C', animationDelay: `${delay}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && friends.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="text-8xl mb-6">👻</div>
            <h2 className="font-['Anton'] text-4xl uppercase text-[#F5F0E8] mb-4">No friends yet</h2>
            <p className="text-white/40 text-lg mb-8 max-w-sm">
              Meet someone in a Drift chat and send them a friend request!
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all active:scale-95"
              style={{ backgroundColor: '#F4600C', color: '#F5F0E8' }}
            >
              Start Drifting
            </button>
          </motion.div>
        )}

        {/* Friends grid */}
        {!loading && friends.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {friends.map((friend, idx) => {
                const expiry = formatExpiry(friend.expiresAt);
                const avatarColor = getAvatarColor(friend.partnerAvatarId);
                const initial = (friend.partnerGhostName || '?')[0].toUpperCase();

                return (
                  <motion.div
                    key={friend.chatId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex flex-col gap-4 p-6 rounded-2xl cursor-pointer group"
                    style={{
                      backgroundColor: '#0f0f0a',
                      border: '1px solid rgba(244,96,12,0.15)',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(244,96,12,0.5)';
                      e.currentTarget.style.boxShadow = '0 0 30px rgba(244,96,12,0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(244,96,12,0.15)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => navigate(`/friends/${friend.chatId}`)}
                  >
                    {/* Avatar + name */}
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center font-['Anton'] text-2xl text-white flex-shrink-0"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#F5F0E8] truncate">{friend.partnerGhostName}</p>
                        <p className="text-xs text-white/40 mt-0.5 uppercase tracking-widest">Anonymous</p>
                      </div>
                    </div>

                    {/* Expiry + open button */}
                    <div className="flex items-center justify-between">
                      {expiry && (
                        <span className="text-xs font-bold uppercase tracking-widest"
                          style={{ color: expiry === 'Expired' ? '#ef4444' : 'rgba(244,96,12,0.7)' }}>
                          ⏱ {expiry}
                        </span>
                      )}
                      <span
                        className="text-xs font-bold uppercase tracking-widest ml-auto group-hover:translate-x-1 transition-transform"
                        style={{ color: '#F4600C' }}
                      >
                        Chat →
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

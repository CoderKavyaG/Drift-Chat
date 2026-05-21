import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIdentity } from '../hooks/useIdentity';
import { useSignaling } from '../hooks/useSignaling';
import { getFriendChat, getFriendChatMessages, postFriendChatMessage } from '../lib/api';
import { GhostIdentityBadge } from '../components/GhostIdentityBadge';
import { getSavedFriends } from '../lib/friends';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9D08E',
  '#FFC0CB', '#87CEEB', '#DDA0DD', '#FFB347', '#90EE90',
  '#FF69B4', '#20B2AA', '#FFD700', '#FF7F50', '#6495ED'
];
const getAvatarColor = (id) => AVATAR_COLORS[((id || 1) - 1) % AVATAR_COLORS.length];

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatExpiry(expiresAt) {
  if (!expiresAt) return null;
  const ms = expiresAt - Date.now();
  if (ms <= 0) return 'Expired';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export function FriendChat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { token, ghostId, ghostName, avatarId, isLoaded } = useIdentity();

  const [friendship, setFriendship] = useState(null);
  const [partnerInfo, setPartnerInfo] = useState({ ghostName: 'Friend', avatarId: 1 });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle incoming real-time friend messages
  const handleMessage = useCallback((message) => {
    if (message.type === 'friend-chat-message' && message.chatId === chatId) {
      setMessages(prev => [...prev, {
        ghostId: message.ghostId,
        ghostName: message.ghostName,
        text: message.text,
        timestamp: message.timestamp,
        isLocal: message.ghostId === ghostId
      }]);
    }
  }, [chatId, ghostId]);

  const { send: signalingsSend } = useSignaling(token, handleMessage);

  // Load friendship + message history
  useEffect(() => {
    if (!isLoaded || !token) return;

    const loadFriendship = async () => {
      try {
        const data = await getFriendChat(chatId);
        setFriendship(data);

        // Determine partner info from localStorage saved friends
        const saved = getSavedFriends();
        const savedEntry = saved.find(f => f.chatId === chatId);
        if (savedEntry) {
          setPartnerInfo({
            ghostName: savedEntry.partnerGhostName,
            avatarId: savedEntry.partnerAvatarId
          });
        }

        const messagesData = await getFriendChatMessages(chatId);
        const msgs = (messagesData.messages || []).map(m => ({
          ...m,
          isLocal: m.ghostId === ghostId
        }));
        setMessages(msgs);
        setLoading(false);
      } catch (err) {
        console.error('Error loading friend chat:', err);
        setError('Chat not found or has expired');
        setLoading(false);
      }
    };

    loadFriendship();
  }, [chatId, isLoaded, token, ghostId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);

    const optimistic = {
      ghostId,
      ghostName,
      text,
      timestamp: Date.now(),
      isLocal: true
    };

    // Optimistically add message
    setMessages(prev => [...prev, optimistic]);

    try {
      // Save via REST (persistent)
      await postFriendChatMessage(chatId, text);
      // Broadcast via WS (real-time to other peer)
      signalingsSend({ type: 'friend-chat-message', chatId, text });
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center" style={{ backgroundColor: '#1A1A0F' }}>
        <div className="flex gap-2">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div key={i} className="w-3 h-3 rounded-full animate-bounce"
              style={{ backgroundColor: '#F4600C', animationDelay: `${delay}s` }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────
  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-6" style={{ backgroundColor: '#1A1A0F' }}>
        <div className="text-6xl">💨</div>
        <h2 className="font-['Anton'] text-4xl uppercase text-[#F5F0E8]">Chat Expired</h2>
        <p className="text-white/40 text-center max-w-sm">{error}</p>
        <button
          onClick={() => navigate('/friends')}
          className="px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm"
          style={{ backgroundColor: '#F4600C', color: '#F5F0E8' }}
        >
          Back to Friends
        </button>
      </div>
    );
  }

  const expiry = formatExpiry(friendship?.expiresAt);
  const partnerAvatarColor = getAvatarColor(partnerInfo.avatarId);
  const partnerInitial = (partnerInfo.ghostName || '?')[0].toUpperCase();
  const myAvatarColor = getAvatarColor(avatarId);
  const myInitial = (ghostName || '?')[0].toUpperCase();

  return (
    <div className="w-full h-screen flex flex-col" style={{ backgroundColor: '#1A1A0F' }}>
      <GhostIdentityBadge />

      {/* ── Header ── */}
      <div
        className="flex-shrink-0 flex items-center gap-4 px-6 py-4"
        style={{ backgroundColor: '#0f0f0a', borderBottom: '1px solid rgba(244,96,12,0.2)' }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/friends')}
          className="text-white/40 hover:text-[#F4600C] transition-colors mr-1 text-xl"
          title="Back to Friends"
        >
          ←
        </button>

        {/* Partner avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
          style={{ backgroundColor: partnerAvatarColor }}
        >
          {partnerInitial}
        </div>

        {/* Partner info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#F5F0E8] truncate">{partnerInfo.ghostName}</p>
          {expiry && (
            <p className="text-xs mt-0.5 uppercase tracking-widest font-semibold"
              style={{ color: expiry === 'Expired' ? '#ef4444' : 'rgba(244,96,12,0.7)' }}>
              ⏱ {expiry}
            </p>
          )}
        </div>

        {/* Drift wordmark */}
        <button
          onClick={() => navigate('/')}
          className="font-['Anton'] text-xl uppercase tracking-wide text-white/20 hover:text-[#F4600C] transition-colors"
        >
          drift
        </button>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3" style={{ backgroundColor: '#1A1A0F' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-['Anton'] text-3xl text-white"
              style={{ backgroundColor: partnerAvatarColor }}
            >
              {partnerInitial}
            </div>
            <p className="text-white/30 text-sm uppercase tracking-widest font-semibold">Say hello to {partnerInfo.ghostName}</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isLocal = msg.isLocal;
          const avatarCol = isLocal ? myAvatarColor : partnerAvatarColor;
          const initial = isLocal ? myInitial : partnerInitial;

          return (
            <div key={idx} className={`flex items-end gap-2 ${isLocal ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar bubble */}
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: avatarCol }}
              >
                {initial}
              </div>

              {/* Message bubble */}
              <div className={`max-w-[70%] flex flex-col ${isLocal ? 'items-end' : 'items-start'}`}>
                <div
                  className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={
                    isLocal
                      ? { backgroundColor: '#F4600C', color: '#F5F0E8', borderBottomRightRadius: '4px' }
                      : { backgroundColor: '#1e1e18', color: '#F5F0E8', border: '1px solid rgba(255,255,255,0.08)', borderBottomLeftRadius: '4px' }
                  }
                >
                  {msg.text}
                </div>
                <span className="text-xs text-white/20 mt-1 px-1">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ── */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-4 py-4"
        style={{ backgroundColor: '#0f0f0a', borderTop: '1px solid rgba(244,96,12,0.15)' }}
      >
        <div
          className="flex-1 flex items-center rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#1e1e18', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            maxLength={500}
            autoFocus
            className="flex-1 bg-transparent text-[#F5F0E8] text-sm px-5 py-3.5 outline-none placeholder-white/20"
          />
          {input.length > 400 && (
            <span className="text-xs px-3 font-mono" style={{ color: input.length > 480 ? '#ef4444' : 'rgba(244,96,12,0.5)' }}>
              {500 - input.length}
            </span>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-lg transition-all active:scale-90 disabled:opacity-30"
          style={{ backgroundColor: '#F4600C', color: '#F5F0E8' }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

import React from 'react';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9D08E',
  '#FFC0CB', '#87CEEB', '#DDA0DD', '#FFB347', '#90EE90',
  '#FF69B4', '#20B2AA', '#FFD700', '#FF7F50', '#6495ED'
];

export function FriendRequestModal({ isOpen, onClose, request, onAccept, onReject }) {
  const getAvatarColor = (id) => AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];

  if (!isOpen || !request) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100]"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
    >
      <div
        className="rounded-2xl p-7 w-[22rem] flex flex-col gap-5"
        style={{ backgroundColor: '#111', border: '2px solid #000', boxShadow: '0 20px 60px rgba(0,0,0,0.9)' }}
      >
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-white mb-0.5">Friend Request</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest">Someone wants to connect</p>
        </div>

        {/* Requester card */}
        <div
          className="flex items-center gap-4 p-4 rounded-xl"
          style={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}
        >
          <div
            className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-lg"
            style={{ backgroundColor: getAvatarColor(request.avatarId || 1) }}
          >
            {(request.ghostName || '?')[0]}
          </div>
          <div>
            <p className="font-bold text-white text-sm">{request.ghostName}</p>
            <p className="text-white/50 text-xs mt-0.5">wants to be your friend</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 py-3 rounded-xl font-semibold text-white/70 text-sm transition-all active:scale-95"
            style={{ backgroundColor: '#2a2a2a', border: '1px solid #444' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#333'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2a2a2a'}
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
            style={{ backgroundColor: '#F4600C' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e05509'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F4600C'}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from '../components/LandingPage';
import { joinRoom } from '../lib/api';
import { GhostIdentityBadge } from '../components/GhostIdentityBadge';

export function Landing() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomLink, setRoomLink] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStartDrifting = async () => {
    setIsLoading(true);
    try {
      const result = await joinRoom('random');
      navigate(`/room/${result.roomId}`);
    } catch (err) {
      console.error('Error joining room:', err);
      showToast('Failed to join room — try again', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      const result = await joinRoom('group');
      setRoomLink(`${window.location.origin}/room/${result.roomId}?code=${result.roomCode}`);
      setShowRoomModal(true);
    } catch (err) {
      console.error('Error creating room:', err);
      showToast('Failed to create room — try again', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMap = () => {
    navigate('/map');
  };

  return (
    <div className="relative w-full">
      <GhostIdentityBadge />

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest shadow-2xl transition-all ${
            toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-[#F4600C] text-[#F5F0E8]'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Landing page component with button handlers */}
      <LandingPage
        onStartDrifting={handleStartDrifting}
        onCreateRoom={handleCreateRoom}
        onViewMap={handleViewMap}
        isLoading={isLoading}
      />

      {/* Modal overlay for room creation */}
      {showRoomModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowRoomModal(false); }}
        >
          <div
            className="rounded-2xl p-8 w-[26rem] flex flex-col gap-5"
            style={{
              backgroundColor: '#111111',
              border: '2px solid #000000',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
            }}
          >
            {/* Title */}
            <div>
              <h2 className="text-[22px] font-bold text-white mb-1">Room Created</h2>
              <p className="text-white/50 text-sm">Share this link with others:</p>
            </div>

            {/* Link field */}
            <div
              className="rounded-xl px-4 py-3"
              style={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}
            >
              <p className="text-white/80 text-sm truncate select-all font-mono">
                {roomLink}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(roomLink);
                  showToast('Link copied! Share it with your friend 🎉');
                }}
                className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition-all active:scale-95"
                style={{ backgroundColor: '#2563eb' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                Copy Link
              </button>
              <button
                onClick={() => {
                  const roomId = roomLink.split('/room/')[1].split('?')[0];
                  navigate(`/room/${roomId}?code=${roomLink.split('code=')[1]}`);
                }}
                className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition-all active:scale-95"
                style={{ backgroundColor: '#2a2a2a', border: '1px solid #444' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#333'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2a2a2a'}
              >
                Enter Room
              </button>
            </div>

            {/* Close */}
            <button
              onClick={() => setShowRoomModal(false)}
              className="text-white/30 hover:text-white/60 text-sm transition-colors text-center"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

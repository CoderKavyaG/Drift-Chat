import React, { useState } from 'react';

function IconButton({ icon: Icon, label, onClick, isActive, isRed, isDisabled }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 shadow-md ${
          isDisabled
            ? 'opacity-40 cursor-not-allowed bg-[#F5F0E8]/5 text-[#F5F0E8]/40 border border-white/5'
            : isRed
            ? 'bg-gradient-to-tr from-[#DC2626] to-[#EF4444] text-[#F5F0E8] border border-red-500 shadow-lg shadow-red-900/30 hover:shadow-red-500/20'
            : isActive
            ? 'bg-gradient-to-tr from-[#F4600C] to-[#FF7A33] text-[#1A1A0F] border border-[#F4600C] shadow-lg shadow-[#F4600C]/25'
            : 'bg-[#2A2A1F]/50 hover:bg-[#3A3A2F]/80 text-[#F5F0E8] border border-[#F5F0E8]/10 hover:border-[#F4600C]/40 hover:shadow-lg hover:shadow-[#F4600C]/10'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={label}
      >
        <Icon />
      </button>

      {showTooltip && (
        <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-[#1A1A0F]/90 backdrop-blur-md text-[#F5F0E8] text-xs px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none border border-[#F4600C]/30 font-medium shadow-xl shadow-black/40 transition-all duration-200">
          {label}
        </div>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="2" x2="22" y1="2" y2="22" />
      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 11v-1" />
      <path d="M9 9a3 3 0 0 0 3 3" />
      <path d="M10.18 4.54A3 3 0 0 1 15 7v4.5" />
      <path d="M5 10v1a7 7 0 0 0 7 7" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}

function CameraOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="2" x2="22" y1="2" y2="22" />
      <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" />
      <path d="M10.66 6H14a2 2 0 0 1 2 2v3.34" />
      <path d="m22 8-6 4 6 4V8Z" />
    </svg>
  );
}

function ScreenShareIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="m17 8-5-5-5 5" />
      <path d="M12 3v10" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" x2="19" y1="5" y2="19" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function HangupIcon() {
  return (
    <svg className="w-5 h-5 transform rotate-[135deg]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
    </svg>
  );
}

export function ControlBar({
  isMuted,
  onToggleMute,
  isCameraOff,
  onToggleCamera,
  isScreenSharing,
  onStartScreenShare,
  onStopScreenShare,
  onToggleChat,
  unreadCount,
  onNextStranger,
  onReport,
  onSettings,
  onHangup
}) {
  return (
    <div className="flex items-center justify-center gap-5 px-6 py-4 bg-gradient-to-t from-[#1A1A0F]/90 via-[#1A1A0F]/70 to-transparent backdrop-blur-md border-t border-[#F5F0E8]/5">
      <IconButton icon={isMuted ? MicOffIcon : MicIcon} label={isMuted ? 'Unmute' : 'Mute'} onClick={onToggleMute} isActive={!isMuted} />
      <IconButton icon={isCameraOff ? CameraOffIcon : CameraIcon} label={isCameraOff ? 'Turn on camera' : 'Turn off camera'} onClick={onToggleCamera} isActive={!isCameraOff} />
      <IconButton icon={ScreenShareIcon} label={isScreenSharing ? 'Stop sharing' : 'Share screen'} onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare} isActive={isScreenSharing} />
      
      <div className="relative">
        <IconButton icon={ChatIcon} label="Chat" onClick={onToggleChat} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#F4600C] rounded-full flex items-center justify-center text-[10px] text-white font-black border border-[#1A1A0F] shadow-lg shadow-[#F4600C]/30 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>

      <IconButton icon={SkipIcon} label="Next stranger" onClick={onNextStranger} />
      <IconButton icon={FlagIcon} label="Report" onClick={onReport} />
      <IconButton icon={SettingsIcon} label="Settings" onClick={onSettings} />
      <IconButton icon={HangupIcon} label="Hang up" onClick={onHangup} isRed />
    </div>
  );
}

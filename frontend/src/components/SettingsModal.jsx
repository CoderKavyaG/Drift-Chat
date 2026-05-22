import React, { useState, useEffect, useRef } from 'react';
import { enumerateDevices } from '../lib/webrtc';

function CustomSelect({ icon: Icon, label, value, onChange, options, placeholder, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5F0E8]/70 mb-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-[#F4600C]" />}
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#1A1A0F]/60 border ${
          isOpen ? 'border-[#F4600C] shadow-lg shadow-[#F4600C]/5' : 'border-white/10 hover:border-white/20'
        } text-white rounded-xl px-4 py-3 text-sm flex items-center justify-between transition-all duration-200 ${
          disabled ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/5 text-white/40' : 'cursor-pointer'
        }`}
      >
        <span className="truncate font-medium text-left pr-2">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-[#F5F0E8]/60 shrink-0 transition-transform duration-200 ${isOpen ? 'transform rotate-180 text-[#F4600C]' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 w-full bg-[#1A1A0F] border border-white/10 rounded-xl shadow-2xl shadow-black/90 max-h-48 overflow-y-auto py-1 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-[#F5F0E8]/40 text-center">No devices found</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm text-[#F5F0E8]/80 hover:bg-[#F4600C] hover:text-[#1A1A0F] cursor-pointer transition-all duration-150 flex items-center justify-between font-semibold ${
                  opt.value === value ? 'bg-[#F4600C]/10 text-[#F4600C] border-l-2 border-[#F4600C]' : ''
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {opt.value === value && (
                  <svg className="w-4 h-4 text-[#F4600C] hover:text-inherit shrink-0 ml-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function CameraOutlineIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}

function MicOutlineIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function SpeakerOutlineIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

export function SettingsModal({ isOpen, onClose, onCameraChange, onAudioChange, localStream }) {
  const [cameras, setCameras] = useState([]);
  const [microphones, setMicrophones] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMicrophone, setSelectedMicrophone] = useState('');
  const previewVideoRef = useRef(null);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await enumerateDevices();
        
        // Map native MediaDeviceInfo objects to { value, label } format for custom selector
        const formattedCams = devices.videoinput.map((cam, idx) => ({
          value: cam.deviceId,
          label: cam.label || `Camera ${idx + 1}`
        }));
        
        const formattedMics = devices.audioinput.map((mic, idx) => ({
          value: mic.deviceId,
          label: mic.label || `Microphone ${idx + 1}`
        }));
        
        const formattedSpeakers = devices.audiooutput.map((spk, idx) => ({
          value: spk.deviceId,
          label: spk.label || `Speaker ${idx + 1}`
        }));

        setCameras(formattedCams);
        setMicrophones(formattedMics);
        setSpeakers(formattedSpeakers);

        // Intelligently pre-populate active tracks from running stream if they exist
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          const audioTrack = localStream.getAudioTracks()[0];
          
          if (videoTrack) {
            const trackDeviceId = videoTrack.getSettings()?.deviceId;
            if (trackDeviceId) {
              setSelectedCamera(trackDeviceId);
            } else if (formattedCams.length > 0) {
              setSelectedCamera(formattedCams[0].value);
            }
          } else if (formattedCams.length > 0) {
            setSelectedCamera(formattedCams[0].value);
          }

          if (audioTrack) {
            const trackDeviceId = audioTrack.getSettings()?.deviceId;
            if (trackDeviceId) {
              setSelectedMicrophone(trackDeviceId);
            } else if (formattedMics.length > 0) {
              setSelectedMicrophone(formattedMics[0].value);
            }
          } else if (formattedMics.length > 0) {
            setSelectedMicrophone(formattedMics[0].value);
          }
        }
      } catch (err) {
        console.error('[SettingsModal] Failed to load media devices:', err);
      }
    };

    if (isOpen) {
      loadDevices();
    }
  }, [isOpen, localStream]);

  // Handle preview mounting
  useEffect(() => {
    if (previewVideoRef.current && localStream && isOpen) {
      previewVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isOpen]);

  const handleCameraChange = (deviceId) => {
    if (!deviceId) return;
    setSelectedCamera(deviceId);
    if (typeof onCameraChange === 'function') onCameraChange(deviceId);
  };

  const handleMicChange = (deviceId) => {
    if (!deviceId) return;
    setSelectedMicrophone(deviceId);
    if (typeof onAudioChange === 'function') onAudioChange(deviceId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#030303]/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#1E1E14]/95 via-[#13130F]/98 to-[#0E0E0B]/98 border border-[#F4600C]/20 rounded-2xl p-6 md:p-8 shadow-2xl shadow-[#F4600C]/5 flex flex-col gap-6 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F5F0E8]/5">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-[#F4600C]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <h2 className="text-lg font-bold text-[#F5F0E8] tracking-wide">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#F5F0E8]/50 hover:text-[#F4600C] hover:bg-[#F5F0E8]/5 transition-all duration-200 cursor-pointer"
            aria-label="Close settings"
          >
            <span className="text-sm font-bold">✕</span>
          </button>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col gap-5">
          {/* Camera Dropdown */}
          <CustomSelect
            icon={CameraOutlineIcon}
            label="Camera"
            value={selectedCamera}
            onChange={handleCameraChange}
            options={cameras}
            placeholder="Select camera..."
          />

          {/* Microphone Dropdown */}
          <CustomSelect
            icon={MicOutlineIcon}
            label="Microphone"
            value={selectedMicrophone}
            onChange={handleMicChange}
            options={microphones}
            placeholder="Select microphone..."
          />

          {/* Speaker Dropdown */}
          <CustomSelect
            icon={SpeakerOutlineIcon}
            label="Speaker"
            value=""
            onChange={() => {}}
            options={[]}
            placeholder="Speaker selection not available"
            disabled
          />

          {/* Live Preview Screen */}
          {localStream && (
            <div className="flex flex-col mt-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5F0E8]/70 mb-2">
                <svg className="w-3.5 h-3.5 text-[#F4600C]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                </svg>
                Stream Preview
              </label>
              <div className="w-full aspect-video bg-black/60 rounded-xl overflow-hidden border border-white/5 ring-1 ring-white/10 shadow-inner flex items-center justify-center">
                <video
                  ref={previewVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>
            </div>
          )}
        </div>

        {/* DONE BUTTON */}
        <button
          onClick={onClose}
          className="w-full mt-3 bg-gradient-to-r from-[#F4600C] to-[#FF7A33] hover:brightness-110 active:scale-[0.98] text-[#1A1A0F] font-black py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-[#F4600C]/25 cursor-pointer text-sm tracking-wider uppercase"
        >
          Done
        </button>
      </div>
    </div>
  );
}

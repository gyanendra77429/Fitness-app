import React, { useState, useEffect } from 'react';
import { Flame, Volume2, VolumeX, Code2, Settings, Smartphone, Wifi, Battery, LogOut } from 'lucide-react';
import { db } from '../../services/db';
import { voiceCoach } from '../../services/voiceCoach';
import { User } from 'firebase/auth';

interface Material3TopBarProps {
  onOpenSettings: () => void;
  onOpenAndroidCode: () => void;
  isSimulatedDevice: boolean;
  onToggleDeviceFrame: () => void;
  streakDays: number;
  currentUser?: User | null;
  onSignOut?: () => void;
}

export const Material3TopBar: React.FC<Material3TopBarProps> = ({
  onOpenSettings,
  onOpenAndroidCode,
  isSimulatedDevice,
  onToggleDeviceFrame,
  streakDays,
  currentUser,
  onSignOut,
}) => {
  const [profile, setProfile] = useState(db.getUserProfile());
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleTts = () => {
    const updated = db.updateUserProfile({ ttsEnabled: !profile.ttsEnabled });
    setProfile(updated);
    if (updated.ttsEnabled) {
      voiceCoach.speak('Voice coach enabled');
    }
  };

  return (
    <header className="w-full bg-[#121418] border-b border-white/8 sticky top-0 z-30 select-none">
      {/* Android System Status Bar Simulation */}
      <div className="px-4 py-1 flex items-center justify-between text-xs text-slate-400 bg-black/40 font-mono tracking-wider border-b border-white/4">
        <span>{currentTime}</span>
        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] text-emerald-400 font-semibold px-1 rounded bg-emerald-950/60 border border-emerald-500/20">5G</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px]">96%</span>
            <Battery className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>
      </div>

      {/* Main Material 3 Top App Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-black font-black text-lg tracking-tighter">FP</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-heading font-bold text-base text-white tracking-tight leading-tight">
                FitPulse
              </h1>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                M3 Native
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-none">
              Android Kotlin & Jetpack Suite
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5">
          {/* Streak pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-950/60 border border-orange-500/30 text-orange-400 text-xs font-semibold shadow-inner">
            <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400 animate-pulse" />
            <span>{streakDays}d Streak</span>
          </div>

          {/* TTS voice mute/unmute */}
          <button
            onClick={toggleTts}
            title={profile.ttsEnabled ? 'Voice Coach Active (Click to mute)' : 'Voice Coach Muted'}
            className={`p-2 rounded-full transition-all ${
              profile.ttsEnabled
                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {profile.ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Android Kotlin Source Code Inspector */}
          <button
            onClick={onOpenAndroidCode}
            title="Inspect Android Kotlin & Room Code"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-all"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kotlin Code</span>
          </button>

          {/* Phone Frame Toggle */}
          <button
            onClick={onToggleDeviceFrame}
            title={isSimulatedDevice ? 'Switch to Full Width View' : 'Simulate Android Pixel Frame'}
            className={`p-2 rounded-full transition-all ${
              isSimulatedDevice
                ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Google User Avatar / Account Button */}
          {currentUser ? (
            <button
              onClick={onOpenSettings}
              title={`Signed in as ${currentUser.displayName || currentUser.email} (Click for Settings)`}
              className="relative p-0.5 rounded-full ring-2 ring-emerald-500/40 hover:ring-emerald-400 transition-all flex items-center justify-center group"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center font-mono">
                  {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                </div>
              )}
              {/* Little Google dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#121418]" />
            </button>
          ) : (
            /* Settings */
            <button
              onClick={onOpenSettings}
              title="App Settings & Room DB"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

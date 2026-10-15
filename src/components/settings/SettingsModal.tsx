import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  User as UserIcon, 
  Volume2, 
  Zap, 
  Database, 
  Download, 
  RotateCcw, 
  Check, 
  Sliders, 
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { db } from '../../services/db';
import { UserProfile } from '../../types/fitness';
import { voiceCoach } from '../../services/voiceCoach';
import { vibrator } from '../../services/vibrator';
import { User } from 'firebase/auth';

interface SettingsModalProps {
  onClose: () => void;
  onDataUpdated: () => void;
  currentUser?: User | null;
  onSignOut?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  onClose, 
  onDataUpdated,
  currentUser,
  onSignOut
}) => {
  const [profile, setProfile] = useState<UserProfile>(db.getUserProfile());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    setVoices(voiceCoach.getVoices());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    vibrator.victoryFanfare();
    db.updateUserProfile(profile);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
    onDataUpdated();
  };

  const testVoice = () => {
    vibrator.repBuzz();
    voiceCoach.speak('FitPulse audio coach online! Rest for sixty seconds. Three, two, one, conquer your set!');
  };

  const handleExportData = () => {
    vibrator.repBuzz();
    const data = db.exportDataJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitpulse_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (confirm('Reset Room Database to rich initial sample data? All local customizations will be restored.')) {
      vibrator.victoryFanfare();
      db.resetToSample();
      setProfile(db.getUserProfile());
      onDataUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#1b1e24] border border-white/10 rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-heading">
              Settings & Preferences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSave} className="p-4 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Google Account Section */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Google Gmail Account
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                {currentUser ? 'Authenticated' : 'Guest Mode'}
              </span>
            </div>

            {currentUser ? (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google User'}
                      className="w-10 h-10 rounded-full border border-emerald-500/40 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-sm flex items-center justify-center font-mono">
                      {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-white text-xs">
                      {currentUser.displayName || 'Google Athlete'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      vibrator.repBuzz();
                      onSignOut();
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition-all"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign Out
                  </button>
                )}
              </div>
            ) : (
              <div className="text-slate-400 text-[11px]">
                Currently running in local guest mode. Sign in with Google to sync your profile.
              </div>
            )}
          </div>

          {/* Section 1: User Profile & Physical Stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider font-mono text-[10px]">
              <UserIcon className="w-3.5 h-3.5" />
              User Profile
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Fitness Goal</label>
                <select
                  value={profile.fitnessGoal}
                  onChange={(e) => setProfile({ ...profile, fitnessGoal: e.target.value as any })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-2 text-white"
                >
                  <option value="muscle">Build Muscle</option>
                  <option value="calisthenics">Calisthenics Mastery</option>
                  <option value="fat_loss">Fat Loss & Cut</option>
                  <option value="endurance">Endurance & Cardio</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={profile.weightKg}
                  onChange={(e) => setProfile({ ...profile, weightKg: parseFloat(e.target.value) || 70 })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={profile.heightCm}
                  onChange={(e) => setProfile({ ...profile, heightCm: parseInt(e.target.value, 10) || 175 })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Daily Targets */}
          <div className="space-y-3 pt-2 border-t border-white/8">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider font-mono text-[10px]">
              <Sliders className="w-3.5 h-3.5" />
              Daily Targets & Targets
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Daily Steps</label>
                <input
                  type="number"
                  value={profile.targetSteps}
                  onChange={(e) => setProfile({ ...profile, targetSteps: parseInt(e.target.value, 10) || 10000 })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Water Target (ml)</label>
                <input
                  type="number"
                  value={profile.targetWaterMl}
                  onChange={(e) => setProfile({ ...profile, targetWaterMl: parseInt(e.target.value, 10) || 3000 })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Target Calories (kcal)</label>
                <input
                  type="number"
                  value={profile.targetCalories}
                  onChange={(e) => setProfile({ ...profile, targetCalories: parseInt(e.target.value, 10) || 2400 })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">Target Protein (g)</label>
                <input
                  type="number"
                  value={profile.targetProteinG}
                  onChange={(e) => setProfile({ ...profile, targetProteinG: parseInt(e.target.value, 10) || 150 })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Audio Voice Coach & Hardware Sensors */}
          <div className="space-y-3 pt-2 border-t border-white/8">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold uppercase tracking-wider font-mono text-[10px]">
              <Volume2 className="w-3.5 h-3.5" />
              Voice Coach & Hardware Sensors
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5">
              <div>
                <div className="font-bold text-white">Audio Voice Coach</div>
                <div className="text-[10px] text-slate-400">Speaks exercise names, reps, countdowns</div>
              </div>
              <input
                type="checkbox"
                checked={profile.ttsEnabled}
                onChange={(e) => setProfile({ ...profile, ttsEnabled: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
            </div>

            {profile.ttsEnabled && (
              <div className="space-y-2 p-2.5 rounded-xl bg-black/20 border border-white/5">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono block mb-1">Speech Voice</label>
                  <select
                    value={profile.ttsVoiceURI}
                    onChange={(e) => setProfile({ ...profile, ttsVoiceURI: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-1.5 text-[11px] text-white"
                  >
                    <option value="">Default English Voice</option>
                    {voices.map((v, i) => (
                      <option key={i} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="text-[9px] text-slate-400 font-mono block">Speech Rate: {profile.ttsRate}x</label>
                    <input
                      type="range"
                      min="0.8"
                      max="1.4"
                      step="0.05"
                      value={profile.ttsRate}
                      onChange={(e) => setProfile({ ...profile, ttsRate: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={testVoice}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold text-[11px] border border-purple-500/30"
                  >
                    Test Voice
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5">
              <div>
                <div className="font-bold text-white">Auto-Rest on Phone Down</div>
                <div className="text-[10px] text-slate-400">Accelerometer detects when phone is put on bench</div>
              </div>
              <input
                type="checkbox"
                checked={profile.autoRestPhoneDown}
                onChange={(e) => setProfile({ ...profile, autoRestPhoneDown: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5">
              <div>
                <div className="font-bold text-white">Vibrator Haptic Pulses</div>
                <div className="text-[10px] text-slate-400">Tactile alerts on rep peaks and rest completion</div>
              </div>
              <input
                type="checkbox"
                checked={profile.hapticEnabled}
                onChange={(e) => setProfile({ ...profile, hapticEnabled: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
            </div>
          </div>

          {/* Section 4: Room Database Management */}
          <div className="space-y-3 pt-2 border-t border-white/8">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider font-mono text-[10px]">
              <Database className="w-3.5 h-3.5" />
              Room Database Storage
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportData}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="flex-1 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Sample DB
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 sticky bottom-0 bg-[#1b1e24] pb-1">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              Save All Preferences
            </button>
            {saveToast && (
              <div className="text-center text-[11px] text-emerald-400 font-semibold mt-1 font-mono">
                ✓ Preferences updated in Room DB!
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Flame, 
  Dumbbell, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { googleSignIn } from '../../services/auth';
import { User } from 'firebase/auth';
import { db } from '../../services/db';
import { vibrator } from '../../services/vibrator';
import { voiceCoach } from '../../services/voiceCoach';

interface GoogleLoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onContinueAsGuest?: () => void;
}

export const GoogleLoginScreen: React.FC<GoogleLoginScreenProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      vibrator.repBuzz();

      const result = await googleSignIn();
      if (result && result.user) {
        vibrator.victoryFanfare();
        // Update user profile in local Room database with Google info
        if (result.user.displayName) {
          db.updateUserProfile({
            name: result.user.displayName,
          });
        }
        voiceCoach.speak(`Welcome to FitPulse, ${result.user.displayName || 'Athlete'}!`);
        onLoginSuccess(result.user);
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('Pop-up was blocked by browser. Please allow popups for Google Sign In.');
      } else {
        setErrorMessage(err.message || 'Failed to authenticate with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b0e] text-white flex flex-col items-center justify-center p-4 select-none relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="max-w-md w-full bg-[#15181e] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <span className="text-black font-black text-2xl tracking-tighter">FP</span>
          </div>

          <div className="pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              FitPulse Suite
            </div>
            <h1 className="text-3xl font-black font-heading text-white tracking-tight mt-2">
              Welcome to FitPulse
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              All-in-One Workout, Cardio & Nutrition Tracker powered by phone sensors and voice coaching.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="space-y-2.5 py-1">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Dual Workout Engine</div>
              <div className="text-[11px] text-slate-400">Home Calisthenics & Gym Weight Training</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Motion Sensors & Voice Coach</div>
              <div className="text-[11px] text-slate-400">Accelerometer rep counter & automated rest timer</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/30 border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Secure Google Account Sync</div>
              <div className="text-[11px] text-slate-400">Personalized profile synced with your Gmail</div>
            </div>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Sign In With Google Button (Standard Google Branding) */}
        <div className="space-y-3 pt-1">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-white/10 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
            )}
            <span>{isLoading ? 'Signing In with Google...' : 'Sign in with Google Gmail'}</span>
          </button>

          {/* Continue as Guest option */}
          {onContinueAsGuest && (
            <button
              onClick={() => {
                vibrator.repBuzz();
                onContinueAsGuest();
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all text-center"
            >
              Continue in Guest Demo Mode →
            </button>
          )}
        </div>

        {/* Security & Privacy Footer */}
        <div className="pt-2 border-t border-white/5 text-center">
          <p className="text-[11px] text-slate-500 font-sans">
            By signing in, you connect your Google Gmail account securely to track workouts and daily health metrics.
          </p>
        </div>
      </div>
    </div>
  );
};

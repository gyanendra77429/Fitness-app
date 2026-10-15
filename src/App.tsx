import React, { useState, useEffect } from 'react';
import { Material3TopBar } from './components/common/Material3TopBar';
import { Material3NavigationBar, NavTab } from './components/common/Material3NavigationBar';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { WorkoutSuiteScreen } from './components/workouts/WorkoutSuiteScreen';
import { ActiveWorkoutModal } from './components/workouts/ActiveWorkoutModal';
import { CardioTrackerScreen } from './components/cardio/CardioTrackerScreen';
import { NutritionWaterScreen } from './components/nutrition/NutritionWaterScreen';
import { AnalyticsScreen } from './components/analytics/AnalyticsScreen';
import { SettingsModal } from './components/settings/SettingsModal';
import { AndroidCodeViewerModal } from './components/android/AndroidCodeViewerModal';
import { GoogleLoginScreen } from './components/auth/GoogleLoginScreen';
import { Exercise, WorkoutRoutine } from './types/fitness';
import { db } from './services/db';
import { sensorManager } from './services/sensorManager';
import { initAuth, logout } from './services/auth';
import { User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSimulatedDevice, setIsSimulatedDevice] = useState(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAndroidCodeOpen, setIsAndroidCodeOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);

  // Active workout state
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null);
  const [singleExercise, setSingleExercise] = useState<Exercise | null>(null);

  // Today metrics state for streak & rings
  const [todayMetrics, setTodayMetrics] = useState(db.getTodayMetrics());

  const refreshData = () => {
    setTodayMetrics(db.getTodayMetrics());
  };

  useEffect(() => {
    // Request motion sensor permission
    sensorManager.requestPermission();

    // Listen to Firebase Google auth state
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        setIsAuthChecking(false);
        if (user?.displayName) {
          db.updateUserProfile({ name: user.displayName });
        }
      },
      () => {
        setCurrentUser(null);
        setIsAuthChecking(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setIsGuestMode(false);
  };

  const handleStartRoutine = (routine?: WorkoutRoutine) => {
    setActiveRoutine(routine || null);
    setSingleExercise(null);
    setIsWorkoutActive(true);
  };

  const handleStartCustomExercise = (exercise: Exercise) => {
    setSingleExercise(exercise);
    setActiveRoutine(null);
    setIsWorkoutActive(true);
  };

  const handleFinishWorkout = () => {
    setIsWorkoutActive(false);
    setActiveRoutine(null);
    setSingleExercise(null);
    refreshData();
    setActiveTab('analytics');
  };

  const handleQuickLogWater = (ml: number) => {
    db.logWater(ml);
    refreshData();
  };

  const handleOpenMealModal = () => {
    setActiveTab('nutrition');
  };

  // Initial Auth Loading Screen
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#090b0e] text-white flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-xl shadow-cyan-500/20 mb-4 animate-pulse">
          <span className="text-black font-black text-xl tracking-tighter">FP</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Initializing FitPulse & Google Services...</span>
        </div>
      </div>
    );
  }

  // Google Login Screen (First gate if not signed in and not guest)
  if (!currentUser && !isGuestMode) {
    return (
      <GoogleLoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsGuestMode(false);
          refreshData();
        }}
        onContinueAsGuest={() => {
          setIsGuestMode(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090b0e] text-slate-100 flex flex-col items-center justify-start antialiased">
      {/* Outer wrapper: Full-width or simulated Google Pixel Android Device chassis */}
      <div
        className={`w-full transition-all duration-300 relative ${
          isSimulatedDevice
            ? 'max-w-[430px] my-4 md:my-8 rounded-[48px] border-[10px] border-[#222731] shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden ring-1 ring-white/10 bg-[#0d0f12]'
            : 'max-w-2xl bg-[#0d0f12] min-h-screen'
        }`}
      >
        {/* Pixel Camera Punch-hole Notch for simulated device */}
        {isSimulatedDevice && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border border-white/10 z-40 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#121b29]" />
          </div>
        )}

        {/* Material 3 Top App Bar */}
        <Material3TopBar
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAndroidCode={() => setIsAndroidCodeOpen(true)}
          isSimulatedDevice={isSimulatedDevice}
          onToggleDeviceFrame={() => setIsSimulatedDevice(!isSimulatedDevice)}
          streakDays={todayMetrics.streakDays}
          currentUser={currentUser}
          onSignOut={handleSignOut}
        />

        {/* Main Tab Screen Content */}
        <main className="w-full">
          {activeTab === 'dashboard' && (
            <DashboardScreen
              onStartWorkout={handleStartRoutine}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onQuickLogWater={handleQuickLogWater}
              onOpenMealModal={handleOpenMealModal}
            />
          )}

          {activeTab === 'workouts' && (
            <WorkoutSuiteScreen
              onStartRoutine={handleStartRoutine}
              onStartCustomExerciseWorkout={handleStartCustomExercise}
            />
          )}

          {activeTab === 'cardio' && <CardioTrackerScreen />}

          {activeTab === 'nutrition' && <NutritionWaterScreen />}

          {activeTab === 'analytics' && <AnalyticsScreen />}
        </main>

        {/* Material 3 Bottom Navigation Bar */}
        <Material3NavigationBar activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>

      {/* Active Workout Screen Overlay */}
      {isWorkoutActive && (
        <ActiveWorkoutModal
          routine={activeRoutine}
          singleExercise={singleExercise}
          onClose={() => setIsWorkoutActive(false)}
          onFinishWorkout={handleFinishWorkout}
        />
      )}

      {/* App Settings Modal with Google Account & Sign Out */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onDataUpdated={refreshData}
          currentUser={currentUser}
          onSignOut={handleSignOut}
        />
      )}

      {/* Android Kotlin & Room Code Viewer Modal */}
      {isAndroidCodeOpen && (
        <AndroidCodeViewerModal onClose={() => setIsAndroidCodeOpen(false)} />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Flame, 
  Footprints, 
  Clock, 
  Droplet, 
  Zap, 
  ChevronRight, 
  Activity, 
  Compass,
  Trophy,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { db } from '../../services/db';
import { DailyMetrics, WorkoutRoutine } from '../../types/fitness';
import { DEFAULT_ROUTINES } from '../../data/defaultExercises';
import { vibrator } from '../../services/vibrator';
import { voiceCoach } from '../../services/voiceCoach';

interface DashboardScreenProps {
  onStartWorkout: (routine?: WorkoutRoutine) => void;
  onNavigateToTab: (tab: 'dashboard' | 'workouts' | 'cardio' | 'nutrition' | 'analytics') => void;
  onQuickLogWater: (amountMl: number) => void;
  onOpenMealModal: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onStartWorkout,
  onNavigateToTab,
  onQuickLogWater,
  onOpenMealModal,
}) => {
  const [metrics, setMetrics] = useState<DailyMetrics>(db.getTodayMetrics());
  const [profile, setProfile] = useState(db.getUserProfile());
  const [recentWorkouts, setRecentWorkouts] = useState(db.getWorkoutSessions());
  const [waterAnimation, setWaterAnimation] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setMetrics(db.getTodayMetrics());
      setProfile(db.getUserProfile());
      setRecentWorkouts(db.getWorkoutSessions());
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAddWater = (ml: number) => {
    vibrator.repBuzz();
    db.logWater(ml);
    setMetrics(db.getTodayMetrics());
    setWaterAnimation(true);
    setTimeout(() => setWaterAnimation(false), 800);
    voiceCoach.speak(`Added ${ml} milliliters of water. Stay hydrated!`);
  };

  // Helper for radial ring calculations
  const stepProgress = Math.min(1, metrics.steps / (profile.targetSteps || 10000));
  const timeProgress = Math.min(1, metrics.activeMinutes / 60);
  const calProgress = Math.min(1, metrics.caloriesBurned / (profile.targetCalories || 2400));
  const waterProgress = Math.min(1, metrics.waterIntakeMl / (profile.targetWaterMl || 3000));

  // Circular SVG ring renderer
  const renderCircle = (progress: number, strokeColor: string, radius: number = 38) => {
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - progress * circumference;

    return (
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="stroke-white/10"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={strokeColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
    );
  };

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

  const recommendedRoutine = DEFAULT_ROUTINES[0];

  return (
    <div className="pb-28 px-4 pt-4 max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* User Greeting & Date Banner */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-cyan-400 font-mono">
            Daily Activity
          </span>
          <h2 className="text-2xl font-bold font-heading text-white tracking-tight">
            Hello, {profile.name.split(' ')[0]} 👋
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Room DB Synced
          </span>
        </div>
      </div>

      {/* 4 Multi-Ring Activity Cards */}
      <div className="bg-[#1b1e24] border border-white/8 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            Activity Rings
          </h3>
          <span className="text-xs text-slate-400 font-mono">Goal 100%</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Steps */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="w-16 h-16 relative flex items-center justify-center my-1">
              {renderCircle(stepProgress, '#00E5FF')}
              <Footprints className="w-5 h-5 text-cyan-400 absolute" />
            </div>
            <span className="text-base font-bold font-heading text-white mt-1">
              {metrics.steps.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 leading-tight">
              / {profile.targetSteps.toLocaleString()} steps
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold font-mono mt-0.5">
              {Math.round(stepProgress * 100)}%
            </span>
          </div>

          {/* 2. Active Time */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="w-16 h-16 relative flex items-center justify-center my-1">
              {renderCircle(timeProgress, '#A855F7')}
              <Clock className="w-5 h-5 text-purple-400 absolute" />
            </div>
            <span className="text-base font-bold font-heading text-white mt-1">
              {metrics.activeMinutes}m
            </span>
            <span className="text-[11px] text-slate-400 leading-tight">/ 60 min goal</span>
            <span className="text-[10px] text-purple-400 font-semibold font-mono mt-0.5">
              {Math.round(timeProgress * 100)}%
            </span>
          </div>

          {/* 3. Calories */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="w-16 h-16 relative flex items-center justify-center my-1">
              {renderCircle(calProgress, '#F97316')}
              <Flame className="w-5 h-5 text-orange-400 absolute" />
            </div>
            <span className="text-base font-bold font-heading text-white mt-1">
              {metrics.caloriesBurned}
            </span>
            <span className="text-[11px] text-slate-400 leading-tight">
              / {profile.targetCalories} kcal
            </span>
            <span className="text-[10px] text-orange-400 font-semibold font-mono mt-0.5">
              {Math.round(calProgress * 100)}%
            </span>
          </div>

          {/* 4. Water Intake */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center relative overflow-hidden group">
            <div className={`w-16 h-16 relative flex items-center justify-center my-1 ${waterAnimation ? 'scale-110 transition-transform' : ''}`}>
              {renderCircle(waterProgress, '#38BDF8')}
              <Droplet className="w-5 h-5 text-sky-400 absolute" />
            </div>
            <span className="text-base font-bold font-heading text-white mt-1">
              {(metrics.waterIntakeMl / 1000).toFixed(1)}L
            </span>
            <span className="text-[11px] text-slate-400 leading-tight">
              / {(profile.targetWaterMl / 1000).toFixed(1)}L
            </span>
            <span className="text-[10px] text-sky-400 font-semibold font-mono mt-0.5">
              {Math.round(waterProgress * 100)}%
            </span>
          </div>
        </div>

        {/* Weekly Consistency Dots */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between px-1">
          <span className="text-xs text-slate-400">Weekly Target</span>
          <div className="flex items-center gap-2">
            {daysOfWeek.map((day, idx) => {
              const isPastOrToday = idx <= todayIdx;
              const isToday = idx === todayIdx;

              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className={`text-[10px] font-medium ${isToday ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                    {day}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isPastOrToday
                        ? isToday
                          ? 'bg-gradient-to-tr from-cyan-500 to-emerald-400 text-black shadow-md shadow-cyan-500/25'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-white/5 text-slate-600'
                    }`}
                  >
                    {isPastOrToday ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions (Material 3 Expressive Action Row) */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
          Quick Actions
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Start Workout Primary FAB */}
          <button
            onClick={() => onStartWorkout()}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-black font-bold shadow-lg shadow-cyan-500/20 hover:opacity-95 active:scale-[0.98] transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center">
              <Play className="w-5 h-5 fill-black text-black" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight">Start Workout</div>
              <div className="text-[11px] font-medium opacity-80">Calisthenics / Gym</div>
            </div>
          </button>

          {/* Cardio Run */}
          <button
            onClick={() => onNavigateToTab('cardio')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#1f242c] hover:bg-[#252b35] border border-white/8 text-white font-bold active:scale-[0.98] transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">Track Cardio</div>
              <div className="text-[11px] text-slate-400 font-normal">Sensor Step GPS</div>
            </div>
          </button>

          {/* Log Meal */}
          <button
            onClick={onOpenMealModal}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#1f242c] hover:bg-[#252b35] border border-white/8 text-white font-bold active:scale-[0.98] transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold">Log Meal</div>
              <div className="text-[11px] text-slate-400 font-normal">Calories & Macros</div>
            </div>
          </button>

          {/* Quick Water Chips */}
          <div className="flex items-center gap-1.5 bg-[#1f242c] border border-white/8 rounded-2xl p-2 justify-between">
            <button
              onClick={() => handleAddWater(250)}
              className="flex-1 py-2 px-1 text-center rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 text-xs font-semibold active:scale-95 transition-all"
            >
              +250ml
            </button>
            <button
              onClick={() => handleAddWater(500)}
              className="flex-1 py-2 px-1 text-center rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 text-xs font-semibold active:scale-95 transition-all"
            >
              +500ml
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Workout of the Day */}
      <div className="bg-gradient-to-br from-[#1c222b] to-[#161a20] border border-cyan-500/20 rounded-3xl p-4 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Suggested For Today
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {recommendedRoutine.estimatedMinutes} mins
          </span>
        </div>

        <h3 className="text-lg font-bold font-heading text-white">
          {recommendedRoutine.name}
        </h3>
        <p className="text-xs text-slate-300 mt-1 line-clamp-2">
          {recommendedRoutine.description}
        </p>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {recommendedRoutine.targetMuscles.map((m) => (
            <span
              key={m}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium uppercase bg-white/5 text-slate-300 border border-white/10"
            >
              {m}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
            {recommendedRoutine.exercises.length} Exercises
          </span>
        </div>

        <button
          onClick={() => onStartWorkout(recommendedRoutine)}
          className="w-full mt-4 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/25 active:scale-[0.99] transition-all"
        >
          <Play className="w-4 h-4 fill-black text-black" />
          Launch Routine Now
        </button>
      </div>

      {/* Recent Session History Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Recent Workouts
          </span>
          <button
            onClick={() => onNavigateToTab('analytics')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
          >
            Full History <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentWorkouts.slice(0, 2).map((w) => (
            <div
              key={w.id}
              className="p-3.5 rounded-2xl bg-[#1b1e24] border border-white/8 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{w.routineName}</h4>
                  <p className="text-[11px] text-slate-400">
                    {w.durationMinutes} min • {w.caloriesBurned} kcal • {w.exercises.length} exercises
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-emerald-400 font-semibold block">
                  Completed
                </span>
                <span className="text-[10px] text-slate-500">{w.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

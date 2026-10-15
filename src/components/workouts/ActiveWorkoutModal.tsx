import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Check, 
  RotateCcw, 
  Plus, 
  Minus, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Activity, 
  Flame, 
  Trophy, 
  Smartphone,
  Sparkles,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Exercise, WorkoutRoutine, WorkoutSessionRecord, WorkoutSet } from '../../types/fitness';
import { db } from '../../services/db';
import { voiceCoach } from '../../services/voiceCoach';
import { vibrator } from '../../services/vibrator';
import { sensorManager, MotionDataPoint } from '../../services/sensorManager';

interface ActiveWorkoutModalProps {
  routine?: WorkoutRoutine | null;
  singleExercise?: Exercise | null;
  onClose: () => void;
  onFinishWorkout: () => void;
}

interface WorkingExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  routine,
  singleExercise,
  onClose,
  onFinishWorkout,
}) => {
  const profile = db.getUserProfile();
  const allExercises = db.getExercises();

  // Initialize exercises for this session
  const [workingExercises, setWorkingExercises] = useState<WorkingExercise[]>(() => {
    if (singleExercise) {
      return [
        {
          exercise: singleExercise,
          sets: Array.from({ length: singleExercise.defaultSets }).map((_, i) => ({
            setNumber: i + 1,
            targetReps: singleExercise.defaultReps,
            actualReps: singleExercise.defaultReps,
            weightKg: singleExercise.defaultWeight,
            isCompleted: false,
          })),
        },
      ];
    } else if (routine) {
      return routine.exercises.map((item) => {
        const found = allExercises.find((e) => e.id === item.exerciseId) || {
          id: item.exerciseId,
          name: 'Exercise',
          category: routine.category === 'gym' ? 'gym' : 'calisthenics',
          muscleGroup: 'chest',
          defaultSets: item.sets,
          defaultReps: item.targetReps,
          defaultWeight: item.weightKg,
          equipment: 'Standard',
          instructions: [],
          difficulty: 'intermediate',
          isBodyweight: item.weightKg === 0,
        };

        return {
          exercise: found as Exercise,
          sets: Array.from({ length: item.sets }).map((_, i) => ({
            setNumber: i + 1,
            targetReps: item.targetReps,
            actualReps: item.targetReps,
            weightKg: item.weightKg,
            isCompleted: false,
          })),
        };
      });
    } else {
      // Default fallback
      const defaultEx = allExercises[0];
      return [
        {
          exercise: defaultEx,
          sets: [
            { setNumber: 1, targetReps: 15, actualReps: 15, weightKg: 0, isCompleted: false },
            { setNumber: 2, targetReps: 15, actualReps: 15, weightKg: 0, isCompleted: false },
            { setNumber: 3, targetReps: 15, actualReps: 12, weightKg: 0, isCompleted: false },
          ],
        },
      ];
    }
  });

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Automated Rest Timer state
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(profile.restTimerSeconds || 60);
  const [restTimeRemaining, setRestTimeRemaining] = useState(profile.restTimerSeconds || 60);

  // Sensor Rep Counter & Motion State
  const [detectedReps, setDetectedReps] = useState(0);
  const [sensorWaveform, setSensorWaveform] = useState<number[]>([]);
  const [isPhoneResting, setIsPhoneResting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [motionFeedbackPulse, setMotionFeedbackPulse] = useState(false);

  // Canvas ref for live sensor oscilloscope
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Workout Session start time
  const [startTime] = useState(Date.now());

  const currentWorkingEx = workingExercises[currentExIndex];

  // 1. Session Timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isTimerPaused) {
        setSessionDuration((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerPaused]);

  // 2. Hardware Sensor Listener & Rep detection
  useEffect(() => {
    sensorManager.startListening();
    sensorManager.resetRepCount();

    // Voice announcement for first exercise
    if (currentWorkingEx) {
      voiceCoach.announceExerciseStart(
        currentWorkingEx.exercise.name,
        1,
        currentWorkingEx.sets[0]?.targetReps || 10,
        currentWorkingEx.sets[0]?.weightKg || 0
      );
    }

    const unsubMotion = sensorManager.onMotion((point: MotionDataPoint) => {
      setSensorWaveform((prev) => [...prev.slice(-30), point.accel]);
    });

    const unsubRep = sensorManager.onRep((count: number) => {
      setDetectedReps(count);
      setMotionFeedbackPulse(true);
      setTimeout(() => setMotionFeedbackPulse(false), 300);

      // Auto update current pending set actual reps
      setWorkingExercises((prev) => {
        const next = [...prev];
        const currentSets = [...next[currentExIndex].sets];
        const pendingSetIdx = currentSets.findIndex((s) => !s.isCompleted);
        if (pendingSetIdx !== -1) {
          currentSets[pendingSetIdx] = {
            ...currentSets[pendingSetIdx],
            actualReps: count,
          };
          next[currentExIndex] = { ...next[currentExIndex], sets: currentSets };
        }
        return next;
      });
    });

    const unsubPhoneState = sensorManager.onPhoneState((resting: boolean) => {
      setIsPhoneResting(resting);
      if (resting && profile.autoRestPhoneDown && !isResting) {
        // Automatically start rest timer if phone is placed flat!
        startRestTimer(profile.restTimerSeconds || 60);
      }
    });

    return () => {
      unsubMotion();
      unsubRep();
      unsubPhoneState();
      sensorManager.stopListening();
    };
  }, [currentExIndex]);

  // 3. Draw live accelerometer wave on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw baseline at 9.8 m/s²
    const baseRatio = (9.8 / 20) * canvas.height;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - baseRatio);
    ctx.lineTo(canvas.width, canvas.height - baseRatio);
    ctx.stroke();
    ctx.setLineDash([]);

    if (sensorWaveform.length < 2) return;

    // Draw acceleration line
    ctx.strokeStyle = isPhoneResting ? '#38BDF8' : '#00E5FF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    sensorWaveform.forEach((val, i) => {
      const x = (i / (sensorWaveform.length - 1)) * canvas.width;
      // map val 0 to 22 m/s²
      const y = canvas.height - (Math.min(22, Math.max(0, val)) / 22) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [sensorWaveform, isPhoneResting]);

  // 4. Automated Rest Timer Countdown
  useEffect(() => {
    let restInterval: number | null = null;
    if (isResting) {
      restInterval = window.setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            // Rest finished!
            setIsResting(false);
            vibrator.restFinished();
            voiceCoach.announceCountdown(0);
            return 0;
          }

          // Audio voice cues
          if (prev === 30) voiceCoach.announceRestCheckpoint(30);
          if (prev === 10) voiceCoach.announceRestCheckpoint(10);
          if (prev <= 3 && prev > 0) {
            voiceCoach.announceCountdown(prev);
            vibrator.countdownTick();
          }

          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (restInterval) clearInterval(restInterval);
    };
  }, [isResting]);

  const startRestTimer = (seconds: number = 60) => {
    setRestDuration(seconds);
    setRestTimeRemaining(seconds);
    setIsResting(true);
    vibrator.setFinished();
  };

  const handleToggleSetComplete = (setIdx: number) => {
    vibrator.repBuzz();
    const updated = [...workingExercises];
    const currentSets = [...updated[currentExIndex].sets];
    const targetSet = currentSets[setIdx];

    const nextState = !targetSet.isCompleted;
    currentSets[setIdx] = { ...targetSet, isCompleted: nextState };
    updated[currentExIndex] = { ...updated[currentExIndex], sets: currentSets };
    setWorkingExercises(updated);

    if (nextState) {
      // Completed set! Launch rest timer
      voiceCoach.announceSetComplete(targetSet.setNumber, profile.restTimerSeconds || 60);
      startRestTimer(profile.restTimerSeconds || 60);
      sensorManager.resetRepCount();
      setDetectedReps(0);
    }
  };

  const updateSetReps = (setIdx: number, delta: number) => {
    vibrator.repBuzz();
    const updated = [...workingExercises];
    const currentSets = [...updated[currentExIndex].sets];
    const currentReps = currentSets[setIdx].actualReps;
    currentSets[setIdx] = {
      ...currentSets[setIdx],
      actualReps: Math.max(1, currentReps + delta),
    };
    updated[currentExIndex] = { ...updated[currentExIndex], sets: currentSets };
    setWorkingExercises(updated);
  };

  const updateSetWeight = (setIdx: number, delta: number) => {
    vibrator.repBuzz();
    const updated = [...workingExercises];
    const currentSets = [...updated[currentExIndex].sets];
    const currentWeight = currentSets[setIdx].weightKg;
    currentSets[setIdx] = {
      ...currentSets[setIdx],
      weightKg: Math.max(0, currentWeight + delta),
    };
    updated[currentExIndex] = { ...updated[currentExIndex], sets: currentSets };
    setWorkingExercises(updated);
  };

  const handleFinishWorkout = () => {
    vibrator.victoryFanfare();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00E5FF', '#10B981', '#F59E0B', '#8B5CF6'],
    });

    // Calculate totals
    let totalVolume = 0;
    let totalReps = 0;
    let totalSetsCompleted = 0;

    workingExercises.forEach((item) => {
      item.sets.forEach((s) => {
        if (s.isCompleted) {
          totalSetsCompleted++;
          totalReps += s.actualReps;
          totalVolume += s.weightKg * s.actualReps;
        }
      });
    });

    const durationMin = Math.max(1, Math.round(sessionDuration / 60));
    const estimatedCalories = Math.round(durationMin * 8.5 + totalReps * 0.4);

    const record: WorkoutSessionRecord = {
      id: 'session-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      startTime,
      endTime: Date.now(),
      durationMinutes: durationMin,
      routineName: routine ? routine.name : singleExercise ? singleExercise.name : 'Custom Workout',
      category: (routine?.category === 'gym' ? 'gym' : 'calisthenics') as 'gym' | 'calisthenics',
      exercises: workingExercises.map((w) => ({
        exerciseId: w.exercise.id,
        exerciseName: w.exercise.name,
        category: w.exercise.category,
        muscleGroup: w.exercise.muscleGroup,
        sets: w.sets,
      })),
      caloriesBurned: estimatedCalories,
      totalVolumeKg: totalVolume,
      totalReps,
    };

    db.saveWorkoutSession(record);
    voiceCoach.announceWorkoutComplete(workingExercises.length, durationMin);

    setTimeout(() => {
      onFinishWorkout();
    }, 1200);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle Motion Simulator for desktop preview testing
  const toggleSimulator = (type: 'pushup' | 'squat') => {
    if (isSimulating) {
      sensorManager.stopSimulation();
      setIsSimulating(false);
    } else {
      sensorManager.startSimulation(type);
      setIsSimulating(true);
    }
  };

  // Rest timer circle calculations
  const restProgress = restDuration > 0 ? (restDuration - restTimeRemaining) / restDuration : 0;
  const restCircumference = 2 * Math.PI * 52;
  const restOffset = restCircumference - restProgress * restCircumference;

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0f12] text-white flex flex-col select-none overflow-y-auto">
      {/* Top Bar with Live Timer & Routine Info */}
      <div className="bg-[#16181d] border-b border-white/8 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 font-mono text-base font-bold text-cyan-400">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>{formatTimer(sessionDuration)}</span>
          </div>
          <span className="text-[11px] text-slate-400 block line-clamp-1 max-w-[200px]">
            {routine ? routine.name : singleExercise ? singleExercise.name : 'Active Session'}
          </span>
        </div>

        <button
          onClick={handleFinishWorkout}
          className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Check className="w-3.5 h-3.5" />
          Finish
        </button>
      </div>

      <div className="p-4 max-w-lg mx-auto w-full space-y-4 pb-12">
        {/* Exercise Switcher Header */}
        <div className="bg-[#1b1e24] border border-white/8 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Exercise {currentExIndex + 1} of {workingExercises.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentExIndex === 0}
                onClick={() => {
                  vibrator.repBuzz();
                  setCurrentExIndex((prev) => Math.max(0, prev - 1));
                }}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4 text-slate-300" />
              </button>
              <button
                disabled={currentExIndex === workingExercises.length - 1}
                onClick={() => {
                  vibrator.repBuzz();
                  setCurrentExIndex((prev) => Math.min(workingExercises.length - 1, prev + 1));
                }}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </div>

          <h3 className="text-xl font-bold font-heading text-white mt-1">
            {currentWorkingEx?.exercise.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Target: {currentWorkingEx?.exercise.muscleGroup} • {currentWorkingEx?.exercise.equipment}
          </p>

          {/* Interactive Set Table */}
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-mono text-slate-400 px-2">
              <span className="col-span-2">Set</span>
              <span className="col-span-4 text-center">Weight (kg)</span>
              <span className="col-span-4 text-center">Reps</span>
              <span className="col-span-2 text-right">Done</span>
            </div>

            {currentWorkingEx?.sets.map((set, setIdx) => (
              <div
                key={setIdx}
                className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl transition-all ${
                  set.isCompleted
                    ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-200'
                    : 'bg-black/30 border border-white/5 text-slate-200'
                }`}
              >
                {/* Set number */}
                <div className="col-span-2 font-mono font-bold text-xs pl-1">
                  #{set.setNumber}
                </div>

                {/* Weight Controls */}
                <div className="col-span-4 flex items-center justify-center gap-1">
                  <button
                    disabled={set.weightKg === 0}
                    onClick={() => updateSetWeight(setIdx, -2.5)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-20"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="font-mono text-xs font-semibold w-9 text-center">
                    {set.weightKg}
                  </span>
                  <button
                    onClick={() => updateSetWeight(setIdx, 2.5)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Reps Controls */}
                <div className="col-span-4 flex items-center justify-center gap-1">
                  <button
                    disabled={set.actualReps <= 1}
                    onClick={() => updateSetReps(setIdx, -1)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="font-mono text-xs font-semibold w-7 text-center">
                    {set.actualReps}
                  </span>
                  <button
                    onClick={() => updateSetReps(setIdx, 1)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Completion Checkbox */}
                <div className="col-span-2 flex justify-end pr-1">
                  <button
                    onClick={() => handleToggleSetComplete(setIdx)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      set.isCompleted
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                        : 'bg-white/10 hover:bg-white/20 text-transparent border border-white/20'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sensor-Assisted Motion Rep Logger & Accelerometer Graph */}
        <div className="bg-[#1b1e24] border border-white/8 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Hardware Motion Sensor
              </h4>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono ${
                isPhoneResting
                  ? 'bg-sky-950 text-sky-400 border border-sky-500/30'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isPhoneResting ? 'Phone Resting' : 'Tracking Motion'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mb-2">
            Accelerometer peak detector auto-counts reps when placed in pocket or under chest. Placing phone flat triggers rest timer.
          </p>

          {/* Oscilloscope Canvas */}
          <div className="w-full h-20 bg-black/50 rounded-2xl relative overflow-hidden border border-white/5 flex items-center justify-center">
            <canvas ref={canvasRef} width={360} height={80} className="w-full h-full" />
            <div className="absolute right-3 top-2 flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 bg-black/60 px-2 py-0.5 rounded-md border border-cyan-500/20">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Auto Reps: <strong className="text-white text-xs">{detectedReps}</strong>
            </div>
          </div>

          {/* Rep Highlight Box & Simulator buttons */}
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div
                className={`w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col items-center justify-center transition-all ${
                  motionFeedbackPulse ? 'scale-110 bg-cyan-500/30' : ''
                }`}
              >
                <span className="text-lg font-black font-heading text-cyan-300 leading-none">
                  {detectedReps}
                </span>
                <span className="text-[9px] uppercase font-mono text-cyan-400">Reps</span>
              </div>
              <div className="text-[11px] text-slate-400 leading-tight">
                Hands-free rep logger <br />
                <span className="text-emerald-400 font-semibold">TTS & Haptics active</span>
              </div>
            </div>

            {/* Simulation controls for desktop review */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleSimulator('pushup')}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-semibold border transition-all ${
                  isSimulating
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
                }`}
              >
                {isSimulating ? 'Stop Sim' : 'Simulate Reps'}
              </button>
            </div>
          </div>
        </div>

        {/* Automated Rest Timer (Floating / Card Mode) */}
        {isResting && (
          <div className="bg-gradient-to-b from-[#18202b] to-[#12161c] border-2 border-cyan-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                Automated Rest Countdown
              </span>
              <button
                onClick={() => {
                  vibrator.repBuzz();
                  setIsResting(false);
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Skip
              </button>
            </div>

            {/* Circular Countdown Ring */}
            <div className="flex flex-col items-center justify-center my-4">
              <div className="w-36 h-36 relative flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    className="stroke-white/10"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="#00E5FF"
                    strokeWidth="8"
                    strokeDasharray={restCircumference}
                    strokeDashoffset={restOffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-black font-heading text-white tracking-tight">
                    {restTimeRemaining}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono block uppercase">
                    Seconds
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Rest Adjustments */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  vibrator.repBuzz();
                  setRestTimeRemaining((prev) => prev + 30);
                  setRestDuration((prev) => prev + 30);
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 active:scale-95 transition-all"
              >
                +30s Rest
              </button>
              <button
                onClick={() => {
                  vibrator.repBuzz();
                  setIsResting(false);
                }}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
              >
                Start Next Set
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

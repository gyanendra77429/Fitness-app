import React, { useState, useEffect, useRef } from 'react';
import { 
  Footprints, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Navigation, 
  MapPin, 
  Clock, 
  Check, 
  Zap, 
  Compass,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CardioActivityType, CardioSessionRecord } from '../../types/fitness';
import { db } from '../../services/db';
import { sensorManager } from '../../services/sensorManager';
import { voiceCoach } from '../../services/voiceCoach';
import { vibrator } from '../../services/vibrator';

export const CardioTrackerScreen: React.FC = () => {
  const profile = db.getUserProfile();
  const [activityType, setActivityType] = useState<CardioActivityType>('running');
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live Metrics
  const [liveSteps, setLiveSteps] = useState(0);
  const [cadence, setCadence] = useState(0); // steps per minute
  const [isSimulating, setIsSimulating] = useState(false);

  // Historical sessions
  const [cardioHistory, setCardioHistory] = useState<CardioSessionRecord[]>(db.getCardioSessions());

  // GPS Simulation Route canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const routePointsRef = useRef<{ x: number; y: number }[]>([]);

  // Stride length calculation: height (cm) * 0.415 for walking / 0.45 for running
  const strideMeters = (profile.heightCm * (activityType === 'running' ? 0.45 : 0.415)) / 100;
  const distanceKm = Number(((liveSteps * strideMeters) / 1000).toFixed(2));

  // Pace: minutes per km
  const paceMinKm = distanceKm > 0 ? Number(((elapsedSeconds / 60) / distanceKm).toFixed(2)) : 0;

  // Calorie burn: MET calculation (~9.8 for running, ~3.8 for walking, ~8.0 for cycling)
  const met = activityType === 'running' ? 9.8 : activityType === 'walking' ? 3.8 : 8.0;
  const caloriesBurned = Math.round((met * profile.weightKg * (elapsedSeconds / 3600)) + liveSteps * 0.04);

  // Milestone tracking for voice announcements
  const lastAnnouncedKmRef = useRef<number>(0);

  // 1. Timer effect
  useEffect(() => {
    let interval: number | null = null;
    if (isActive && !isPaused) {
      interval = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        // Add GPS simulated path point
        const canvas = canvasRef.current;
        if (canvas) {
          const lastPoint = routePointsRef.current[routePointsRef.current.length - 1] || {
            x: canvas.width / 2,
            y: canvas.height / 2,
          };
          const angle = (Date.now() / 1500) % (2 * Math.PI);
          const nextPoint = {
            x: Math.max(20, Math.min(canvas.width - 20, lastPoint.x + Math.cos(angle) * 2.5 + (Math.random() - 0.5) * 3)),
            y: Math.max(20, Math.min(canvas.height - 20, lastPoint.y + Math.sin(angle) * 2.5 + (Math.random() - 0.5) * 3)),
          };
          routePointsRef.current.push(nextPoint);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);

  // 2. Sensor step listener
  useEffect(() => {
    if (isActive && !isPaused) {
      sensorManager.startListening();

      const unsubStep = sensorManager.onStep((steps: number, spm: number) => {
        setLiveSteps(steps);
        setCadence(spm);
        vibrator.repBuzz();

        // Milestone announcement at every 1.0 km
        const curKm = Math.floor((steps * strideMeters) / 1000);
        if (curKm > lastAnnouncedKmRef.current && curKm > 0) {
          lastAnnouncedKmRef.current = curKm;
          voiceCoach.announceCardioMilestone(curKm, paceMinKm);
        }
      });

      return () => {
        unsubStep();
      };
    }
  }, [isActive, isPaused, strideMeters, paceMinKm]);

  // 3. Render Simulated GPS Route Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dark map grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const points = routePointsRef.current;
    if (points.length < 2) {
      // Draw idle center pulse
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 6, 0, 2 * Math.PI);
      ctx.fill();
      return;
    }

    // Draw trail
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 10;
    ctx.beginPath();

    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw current location marker
    const current = points[points.length - 1];
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(current.x, current.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [elapsedSeconds]);

  const handleStart = () => {
    vibrator.victoryFanfare();
    sensorManager.resetStepCount();
    setLiveSteps(0);
    setElapsedSeconds(0);
    lastAnnouncedKmRef.current = 0;
    routePointsRef.current = [];
    setIsActive(true);
    setIsPaused(false);
    voiceCoach.speak(`Starting cardio ${activityType}. Sensors active. Track your pace!`);
  };

  const handleTogglePause = () => {
    vibrator.repBuzz();
    setIsPaused((prev) => !prev);
    voiceCoach.speak(isPaused ? 'Resuming session' : 'Session paused');
  };

  const handleFinish = () => {
    vibrator.victoryFanfare();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    const record: CardioSessionRecord = {
      id: 'cardio-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      activityType,
      durationSeconds: elapsedSeconds,
      steps: liveSteps,
      distanceKm,
      avgPaceMinKm: paceMinKm,
      caloriesBurned,
      avgCadence: cadence,
      timestamp: Date.now(),
    };

    db.saveCardioSession(record);
    setCardioHistory(db.getCardioSessions());
    setIsActive(false);
    setIsPaused(false);
    sensorManager.stopSimulation();
    setIsSimulating(false);
    voiceCoach.speak(`Cardio completed! ${distanceKm} kilometers, ${caloriesBurned} calories. Excellent pacing!`);
  };

  const toggleCadenceSimulator = () => {
    if (isSimulating) {
      sensorManager.stopSimulation();
      setIsSimulating(false);
    } else {
      sensorManager.startSimulation('run');
      setIsSimulating(true);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pb-28 px-4 pt-4 max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
          Hardware Motion HUD
        </span>
        <h2 className="text-2xl font-bold font-heading text-white">
          Cardio & Step Tracker
        </h2>
        <p className="text-xs text-slate-400">
          Real-time phone accelerometer & step sensor tracking
        </p>
      </div>

      {/* Activity Mode Selector Pills */}
      {!isActive && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(['running', 'walking', 'treadmill', 'cycling', 'jumprope'] as CardioActivityType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                vibrator.repBuzz();
                setActivityType(type);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold capitalize transition-all ${
                activityType === type
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-black shadow-md shadow-cyan-500/25'
                  : 'bg-[#1b1e24] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Main Metric Cockpit Display */}
      <div className="bg-[#1b1e24] border border-white/8 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        {/* Top bar with GPS & Sensor status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">
              {isActive ? (isPaused ? 'Paused' : 'Recording Pace') : 'Sensors Ready'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleCadenceSimulator}
              className={`text-[10px] px-2 py-1 rounded-lg border font-mono font-medium transition-all ${
                isSimulating
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
              }`}
            >
              {isSimulating ? 'Stop Running Sim' : 'Simulate 165 SPM'}
            </button>
          </div>
        </div>

        {/* Big Step Counter */}
        <div className="text-center my-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Steps Logged
          </span>
          <div className="text-6xl font-black font-heading text-white tracking-tight">
            {liveSteps.toLocaleString()}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-400 mt-1 font-mono">
            <Footprints className="w-4 h-4" />
            <span>Cadence: <strong>{cadence}</strong> SPM</span>
          </div>
        </div>

        {/* 3 Metric Grid: Distance, Pace, Calories */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/8 text-center">
          <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Distance</span>
            <span className="text-xl font-bold font-heading text-white mt-0.5 block">
              {distanceKm}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">km</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Avg Pace</span>
            <span className="text-xl font-bold font-heading text-white mt-0.5 block">
              {paceMinKm > 0 ? `${paceMinKm}'` : '--'}
            </span>
            <span className="text-[10px] text-purple-400 font-mono">min/km</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Burned</span>
            <span className="text-xl font-bold font-heading text-white mt-0.5 block">
              {caloriesBurned}
            </span>
            <span className="text-[10px] text-orange-400 font-mono">kcal</span>
          </div>
        </div>

        {/* Session Timer */}
        <div className="mt-4 flex items-center justify-center gap-2 font-mono text-slate-300 text-sm">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Active Duration: <strong className="text-white text-base">{formatTimer(elapsedSeconds)}</strong></span>
        </div>

        {/* Control Buttons */}
        <div className="mt-5 flex items-center justify-center gap-3">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all"
            >
              <Play className="w-4 h-4 fill-black text-black" />
              Start Cardio Session
            </button>
          ) : (
            <>
              <button
                onClick={handleTogglePause}
                className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 transition-all"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                Finish & Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Simulated Live Route Canvas */}
      <div className="bg-[#1b1e24] border border-white/8 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-semibold uppercase text-slate-300 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            Live Route Tracking
          </span>
          <span className="text-[10px] text-slate-500 font-mono">GPS Mesh</span>
        </div>
        <div className="w-full h-36 bg-black/60 rounded-2xl overflow-hidden relative border border-white/5">
          <canvas ref={canvasRef} width={380} height={144} className="w-full h-full" />
          <div className="absolute left-3 bottom-2 flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-black/70 px-2 py-0.5 rounded-md border border-white/10">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>Path Distance: {distanceKm} km</span>
          </div>
        </div>
      </div>

      {/* Previous Cardio Logs */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">
          Cardio History
        </div>
        <div className="space-y-2">
          {cardioHistory.map((s) => (
            <div
              key={s.id}
              className="p-3 rounded-2xl bg-[#1b1e24] border border-white/8 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-xs capitalize">
                  {s.activityType[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white capitalize">{s.activityType}</h4>
                  <p className="text-[11px] text-slate-400">
                    {s.distanceKm} km • {Math.round(s.durationSeconds / 60)} min • {s.steps.toLocaleString()} steps
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-orange-400 block">
                  {s.caloriesBurned} kcal
                </span>
                <span className="text-[10px] text-slate-500">{s.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

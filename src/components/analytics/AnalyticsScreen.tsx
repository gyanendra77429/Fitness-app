import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Trophy, 
  Flame, 
  Footprints, 
  Scale, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Sparkles,
  Zap,
  Clock,
  Dumbbell,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { db } from '../../services/db';
import { DailyMetrics, PersonalRecord, WeightRecord, WorkoutSessionRecord } from '../../types/fitness';
import { vibrator } from '../../services/vibrator';

export const AnalyticsScreen: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  // Data from Room DB
  const workouts = db.getWorkoutSessions();
  const prs = db.getPersonalRecords();
  const weightLogs = db.getWeightLogs();
  const dailyMetricsMap = db.getDailyMetricsMap();
  const profile = db.getUserProfile();

  // New weight logging modal state
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [newWeightInput, setNewWeightInput] = useState(profile.weightKg.toString());
  const [weightNotes, setWeightNotes] = useState('');

  // Generate 7-day or 14-day array for chart
  const days = timeRange === '7d' ? 7 : 14;
  const chartDays: { dateStr: string; label: string; metrics: DailyMetrics }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const existing = dailyMetricsMap[dateStr] || {
      date: dateStr,
      steps: 0,
      activeMinutes: 0,
      caloriesBurned: 0,
      waterIntakeMl: 0,
      targetSteps: 10000,
      targetWaterMl: 3000,
      targetCalories: 2400,
      targetProteinG: 155,
      targetCarbsG: 260,
      targetFatsG: 65,
      streakDays: 7,
    };
    chartDays.push({ dateStr, label, metrics: existing });
  }

  // Aggregate weekly calorie burn & workout frequency data for Recharts
  const weeklyProgressData = chartDays.map((d) => {
    const dayWorkouts = workouts.filter((w) => w.date === d.dateStr);
    const workoutCount = dayWorkouts.length;
    // Calorie burn on that day (daily metrics tracks active + basal burn, or sum of workout calories)
    const calories = d.metrics.caloriesBurned > 0 
      ? d.metrics.caloriesBurned 
      : dayWorkouts.reduce((acc, w) => acc + w.caloriesBurned, 0);

    return {
      day: d.label,
      date: d.dateStr,
      calories: calories || 0,
      workouts: workoutCount,
      activeMinutes: d.metrics.activeMinutes || dayWorkouts.reduce((acc, w) => acc + w.durationMinutes, 0),
    };
  });

  const totalWeeklyCalories = weeklyProgressData.reduce((acc, item) => acc + item.calories, 0);
  const totalWeeklyWorkouts = weeklyProgressData.reduce((acc, item) => acc + item.workouts, 0);
  const avgDailyCalories = Math.round(totalWeeklyCalories / weeklyProgressData.length);

  const maxSteps = Math.max(12000, ...chartDays.map((d) => d.metrics.steps));

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeightInput);
    if (!isNaN(val) && val > 30 && val < 300) {
      vibrator.repBuzz();
      db.logWeight(val, weightNotes);
      setIsWeightModalOpen(false);
    }
  };

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-[#12141a]/95 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-2xl text-xs space-y-1.5 font-sans min-w-[150px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-1 text-[11px] font-mono text-slate-400">
            <span>{label}</span>
            <span>{data?.date}</span>
          </div>
          <div className="flex items-center justify-between text-orange-400 font-semibold">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              Calories:
            </span>
            <span className="font-mono font-bold">{data?.calories?.toLocaleString()} kcal</span>
          </div>
          <div className="flex items-center justify-between text-cyan-400 font-semibold">
            <span className="flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5" />
              Workouts:
            </span>
            <span className="font-mono font-bold">
              {data?.workouts} {data?.workouts === 1 ? 'session' : 'sessions'}
            </span>
          </div>
          {data?.activeMinutes > 0 && (
            <div className="flex items-center justify-between text-purple-300 text-[10px] pt-0.5 border-t border-white/5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Active:
              </span>
              <span className="font-mono font-medium">{data?.activeMinutes} min</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pb-28 px-4 pt-4 max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            Performance & Insights
          </span>
          <h2 className="text-2xl font-bold font-heading text-white">
            Analytics & History
          </h2>
          <p className="text-xs text-slate-400">
            Room DB query trends, volume, and personal records
          </p>
        </div>

        {/* Time range toggle */}
        <div className="bg-[#181b21] p-1 rounded-xl border border-white/8 flex items-center">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              timeRange === '7d'
                ? 'bg-cyan-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              timeRange === '30d'
                ? 'bg-cyan-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            14 Days
          </button>
        </div>
      </div>

      {/* Visual Weekly Progress Chart (Recharts) */}
      <div className="bg-[#1b1e24] border border-white/8 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500/20 to-cyan-500/20 text-white flex items-center justify-center border border-white/10">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Weekly Progress</h3>
              <p className="text-[11px] text-slate-400">Calorie Burn vs Workout Frequency</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">
            {timeRange === '7d' ? '7-Day View' : '14-Day View'}
          </span>
        </div>

        {/* 3 Summary Badges */}
        <div className="grid grid-cols-3 gap-2 my-3 pt-1">
          <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              Total Burn
            </span>
            <span className="text-base font-bold font-heading text-orange-400 mt-0.5 block">
              {totalWeeklyCalories.toLocaleString()}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">kcal</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-center gap-1">
              <Dumbbell className="w-3 h-3 text-cyan-400" />
              Workouts
            </span>
            <span className="text-base font-bold font-heading text-cyan-300 mt-0.5 block">
              {totalWeeklyWorkouts}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">sessions</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5 text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              Daily Avg
            </span>
            <span className="text-base font-bold font-heading text-emerald-400 mt-0.5 block">
              {avgDailyCalories}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">kcal/day</span>
          </div>
        </div>

        {/* Recharts Composed Chart Canvas */}
        <div className="w-full h-64 mt-2 -ml-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={weeklyProgressData}
              margin={{ top: 14, right: 10, left: -14, bottom: 0 }}
            >
              <defs>
                <linearGradient id="calorieBurnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="workoutBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.4} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.06)"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                stroke="#64748b"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
              />

              {/* Left Y-Axis: Calorie Burn */}
              <YAxis
                yAxisId="calories"
                orientation="left"
                stroke="#f97316"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#f97316' }}
                domain={[0, 'dataMax + 150']}
                unit=""
              />

              {/* Right Y-Axis: Workout Sessions */}
              <YAxis
                yAxisId="workouts"
                orientation="right"
                stroke="#00E5FF"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fontSize: 10, fill: '#00E5FF' }}
                domain={[0, (dataMax: number) => Math.max(3, dataMax + 1)]}
                unit=""
              />

              <Tooltip content={<CustomChartTooltip />} />

              <Legend
                wrapperStyle={{ paddingTop: 10, fontSize: '11px', fontFamily: 'monospace' }}
                formatter={(value) => <span className="text-slate-300">{value}</span>}
              />

              {/* Area for Calorie Burn */}
              <Area
                yAxisId="calories"
                type="monotone"
                dataKey="calories"
                name="Calorie Burn (kcal)"
                stroke="#f97316"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#calorieBurnGrad)"
                activeDot={{ r: 5, fill: '#f97316', stroke: '#ffffff', strokeWidth: 2 }}
              />

              {/* Bar for Workout Frequency */}
              <Bar
                yAxisId="workouts"
                dataKey="workouts"
                name="Workouts Completed"
                fill="url(#workoutBarGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={22}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1 text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-400" /> Left Axis: Calorie Burn (kcal)
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Right Axis: Sessions Count
          </span>
        </div>
      </div>

      {/* Step Volume Trends Bar Chart */}
      <div className="bg-[#1b1e24] border border-white/8 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Footprints className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Daily Steps Overview</h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 font-semibold">
            Target: 10,000 steps
          </span>
        </div>

        {/* Bar chart canvas */}
        <div className="h-40 flex items-end justify-between gap-1.5 pt-4 px-1 border-b border-white/5 relative">
          {/* 10,000 Step Goal reference line */}
          <div
            className="absolute left-0 right-0 border-b border-cyan-500/30 border-dashed pointer-events-none flex justify-end"
            style={{ bottom: `${(10000 / maxSteps) * 100}%` }}
          >
            <span className="text-[9px] font-mono text-cyan-400 pr-1 -translate-y-3">
              10k Goal
            </span>
          </div>

          {chartDays.map((d, i) => {
            const heightPercent = Math.min(100, Math.round((d.metrics.steps / maxSteps) * 100));
            const isMet = d.metrics.steps >= 10000;

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-7 hidden group-hover:flex bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-cyan-300 font-mono whitespace-nowrap z-10 border border-white/10">
                  {d.metrics.steps.toLocaleString()}
                </div>

                <div className="w-full bg-white/5 rounded-t-lg h-32 flex items-end justify-center overflow-hidden">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isMet
                        ? 'bg-gradient-to-t from-emerald-500 to-cyan-400 shadow-sm shadow-cyan-500/20'
                        : 'bg-cyan-500/40 group-hover:bg-cyan-500/60'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{d.label[0]}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-1">
          <span>Weekly Avg: <strong>8,450 steps/day</strong></span>
          <span className="text-emerald-400 font-semibold">Goal met 5/7 days</span>
        </div>
      </div>

      {/* Body Weight Progression & Quick Log */}
      <div className="bg-[#1b1e24] border border-white/8 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Body Weight Tracking</h3>
          </div>
          <button
            onClick={() => {
              vibrator.repBuzz();
              setIsWeightModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Plus className="w-3 h-3" />
            Log Weight
          </button>
        </div>

        <div className="flex items-baseline justify-between p-3 rounded-2xl bg-black/30 border border-white/5 my-2">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Current Weight
            </span>
            <div className="text-2xl font-black font-heading text-white">
              {profile.weightKg} <span className="text-xs text-slate-400 font-normal">kg</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-emerald-400 font-mono font-semibold block">
              -1.9 kg (Past 30d)
            </span>
            <span className="text-[10px] text-slate-400">Lean Mass Trend</span>
          </div>
        </div>

        {/* Weight timeline pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-3 no-scrollbar">
          {weightLogs.slice(-5).map((w) => (
            <div
              key={w.id}
              className="p-2 rounded-xl bg-white/5 border border-white/5 text-center min-w-[70px]"
            >
              <span className="text-xs font-mono font-bold text-white block">{w.weightKg}kg</span>
              <span className="text-[9px] text-slate-500 font-mono">{w.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Records (PR) Wall of Fame */}
      <div className="bg-[#1b1e24] border border-white/8 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Personal Records (PRs)</h3>
          </div>
          <span className="text-[11px] font-mono text-amber-400 font-semibold">
            {prs.length} Records
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {prs.map((pr) => (
            <div
              key={pr.id}
              className="p-3 rounded-2xl bg-black/30 border border-amber-500/20 hover:border-amber-500/40 transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
                  {pr.metricType.replace('_', ' ')}
                </span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{pr.exerciseName}</h4>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-black font-heading text-white">{pr.value}</span>
                <span className="text-xs text-slate-400 font-mono">{pr.unit}</span>
              </div>
              {pr.previousValue && (
                <span className="text-[9px] text-emerald-400 font-mono block mt-0.5">
                  Prev: {pr.previousValue}{pr.unit}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full Workout Log History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 font-mono uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Workout Log History ({workouts.length})
          </h3>
        </div>

        <div className="space-y-2.5">
          {workouts.map((w) => {
            const isExpanded = expandedWorkoutId === w.id;

            return (
              <div
                key={w.id}
                className="bg-[#1b1e24] border border-white/8 rounded-2xl overflow-hidden transition-all shadow-md"
              >
                <div
                  onClick={() => setExpandedWorkoutId(isExpanded ? null : w.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{w.routineName}</h4>
                      <p className="text-[11px] text-slate-400">
                        {w.durationMinutes} min • {w.caloriesBurned} kcal
                        {w.totalVolumeKg > 0 ? ` • ${w.totalVolumeKg.toLocaleString()}kg volume` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">{w.date}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Set Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-white/5 bg-black/20 text-xs space-y-2">
                    <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold block">
                      Exercise Breakdown:
                    </span>
                    {w.exercises.map((ex, exIdx) => (
                      <div key={exIdx} className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="flex justify-between font-semibold text-slate-200">
                          <span>{ex.exerciseName}</span>
                          <span className="text-cyan-400 font-mono">
                            {ex.sets.filter((s) => s.isCompleted).length} sets completed
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {ex.sets.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-slate-300"
                            >
                              Set {s.setNumber}: {s.actualReps}r {s.weightKg > 0 ? `@ ${s.weightKg}kg` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Weight Modal */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1e24] border border-white/10 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              Log Current Weight
            </h3>
            <form onSubmit={handleSaveWeight} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeightInput}
                  onChange={(e) => setNewWeightInput(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={weightNotes}
                  onChange={(e) => setWeightNotes(e.target.value)}
                  placeholder="Morning weigh-in, post-workout, etc."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWeightModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold"
                >
                  Save Weight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

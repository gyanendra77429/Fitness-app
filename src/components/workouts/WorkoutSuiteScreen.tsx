import React, { useState } from 'react';
import { 
  Dumbbell, 
  Flame, 
  Search, 
  Play, 
  Plus, 
  Filter, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Layers,
  Sparkles,
  Check
} from 'lucide-react';
import { db } from '../../services/db';
import { Exercise, ExerciseCategory, MuscleGroup, WorkoutRoutine } from '../../types/fitness';
import { vibrator } from '../../services/vibrator';

interface WorkoutSuiteScreenProps {
  onStartRoutine: (routine: WorkoutRoutine) => void;
  onStartCustomExerciseWorkout: (exercise: Exercise) => void;
}

export const WorkoutSuiteScreen: React.FC<WorkoutSuiteScreenProps> = ({
  onStartRoutine,
  onStartCustomExerciseWorkout,
}) => {
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory>('calisthenics');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const allExercises = db.getExercises();
  const allRoutines = db.getRoutines();

  // Filter routines by mode
  const filteredRoutines = allRoutines.filter(
    (r) => r.category === activeCategory || r.category === 'hybrid'
  );

  // Filter exercises
  const filteredExercises = allExercises.filter((ex) => {
    const matchesCategory = ex.category === activeCategory;
    const matchesMuscle = selectedMuscle === 'all' || ex.muscleGroup === selectedMuscle;
    const matchesSearch =
      searchQuery.trim() === '' ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesMuscle && matchesSearch;
  });

  const muscleFilters: { id: MuscleGroup | 'all'; label: string }[] = [
    { id: 'all', label: 'All Muscles' },
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'legs', label: 'Legs' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'arms', label: 'Arms' },
    { id: 'core', label: 'Core' },
  ];

  const handleModeToggle = (mode: ExerciseCategory) => {
    vibrator.repBuzz();
    setActiveCategory(mode);
  };

  return (
    <div className="pb-28 px-4 pt-4 max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
          Training Hub
        </span>
        <h2 className="text-2xl font-bold font-heading text-white">
          Workout Suite
        </h2>
        <p className="text-xs text-slate-400">
          Sensor-assisted rep tracking & automated rest periods
        </p>
      </div>

      {/* Dual Modes Segmented Switch (Material 3 SegmentedButton) */}
      <div className="bg-[#181b21] p-1 rounded-2xl border border-white/8 flex items-center">
        <button
          onClick={() => handleModeToggle('calisthenics')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeCategory === 'calisthenics'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-black shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Home Calisthenics
        </button>
        <button
          onClick={() => handleModeToggle('gym')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeCategory === 'gym'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          Gym (Weights)
        </button>
      </div>

      {/* Routine Presets Carousel */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            {activeCategory === 'calisthenics' ? 'Calisthenics Routines' : 'Gym Routines'}
          </h3>
          <span className="text-xs text-slate-500">
            {filteredRoutines.length} presets
          </span>
        </div>

        <div className="space-y-3">
          {filteredRoutines.map((routine) => (
            <div
              key={routine.id}
              className="bg-[#1b1e24] border border-white/8 rounded-2xl p-4 hover:border-cyan-500/30 transition-all shadow-md group relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                      {routine.tag}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {routine.intensity} Intensity
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                    {routine.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {routine.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {routine.estimatedMinutes}m
                  </span>
                  <span>•</span>
                  <span>{routine.exercises.length} Exercises</span>
                </div>

                <button
                  onClick={() => {
                    vibrator.repBuzz();
                    onStartRoutine(routine);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  <Play className="w-3 h-3 fill-black text-black" />
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Library Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            Exercise Library ({filteredExercises.length})
          </h3>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeCategory === 'calisthenics' ? 'bodyweight' : 'gym'} exercises...`}
            className="w-full bg-[#181b21] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Muscle Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {muscleFilters.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                vibrator.repBuzz();
                setSelectedMuscle(m.id);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedMuscle === m.id
                  ? 'bg-cyan-500 text-black font-semibold shadow-sm shadow-cyan-500/25'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Exercise List */}
        <div className="space-y-2">
          {filteredExercises.map((exercise) => {
            const isExpanded = expandedExerciseId === exercise.id;

            return (
              <div
                key={exercise.id}
                className="bg-[#1b1e24] border border-white/8 rounded-2xl overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedExerciseId(isExpanded ? null : exercise.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 text-xs font-bold uppercase font-mono">
                      {exercise.muscleGroup.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{exercise.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {exercise.equipment} • {exercise.defaultSets} sets × {exercise.defaultReps} reps
                        {exercise.defaultWeight > 0 ? ` @ ${exercise.defaultWeight}kg` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        vibrator.repBuzz();
                        onStartCustomExerciseWorkout(exercise);
                      }}
                      title="Quick Start this exercise"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition-all"
                    >
                      <Play className="w-2.5 h-2.5 fill-emerald-300 text-emerald-300" />
                      Train
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-white/5 text-xs space-y-2 bg-black/20">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold block">
                        Technique & Execution:
                      </span>
                      <ul className="list-disc list-inside text-slate-300 space-y-1 mt-1 text-[11px]">
                        {exercise.instructions.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    {exercise.tips && (
                      <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-200 text-[11px]">
                        💡 <strong>Form Tip:</strong> {exercise.tips}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

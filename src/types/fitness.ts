export type ExerciseCategory = 'calisthenics' | 'gym';
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'core' | 'arms' | 'shoulders';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroup: MuscleGroup;
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number; // 0 for bodyweight
  equipment: string;
  instructions: string[];
  tips?: string;
  difficulty: DifficultyLevel;
  isBodyweight: boolean;
  caloriesPerRep?: number;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  description: string;
  category: ExerciseCategory | 'hybrid';
  targetMuscles: MuscleGroup[];
  exercises: {
    exerciseId: string;
    sets: number;
    targetReps: number;
    weightKg: number;
  }[];
  estimatedMinutes: number;
  tag: string;
  intensity: 'Low' | 'Moderate' | 'High' | 'Extreme';
}

export interface WorkoutSet {
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weightKg: number;
  isCompleted: boolean;
  rpe?: number; // 1 - 10
}

export interface WorkoutExerciseState {
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSessionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: number;
  endTime: number;
  durationMinutes: number;
  routineName: string;
  category: ExerciseCategory;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    category: ExerciseCategory;
    muscleGroup: MuscleGroup;
    sets: WorkoutSet[];
  }[];
  caloriesBurned: number;
  totalVolumeKg: number;
  totalReps: number;
  notes?: string;
}

export type CardioActivityType = 'running' | 'walking' | 'cycling' | 'jumprope' | 'treadmill';

export interface CardioSessionRecord {
  id: string;
  date: string;
  activityType: CardioActivityType;
  durationSeconds: number;
  steps: number;
  distanceKm: number;
  avgPaceMinKm: number;
  caloriesBurned: number;
  avgCadence: number; // steps per minute
  routePoints?: { lat: number; lng: number }[];
  timestamp: number;
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealItem {
  id: string;
  date: string;
  mealType: MealCategory;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  timeStr: string;
  portionSize?: string;
}

export interface WaterLog {
  id: string;
  date: string;
  amountMl: number;
  timeStr: string;
  timestamp: number;
}

export interface DailyMetrics {
  date: string; // YYYY-MM-DD
  steps: number;
  activeMinutes: number;
  caloriesBurned: number;
  waterIntakeMl: number;
  targetSteps: number;
  targetWaterMl: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatsG: number;
  streakDays: number;
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  metricType: 'max_weight' | 'max_reps' | 'max_time_seconds' | 'fastest_cardio';
  value: number;
  unit: string;
  date: string;
  previousValue?: number;
}

export interface WeightRecord {
  id: string;
  date: string;
  weightKg: number;
  notes?: string;
}

export interface UserProfile {
  name: string;
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  fitnessGoal: 'muscle' | 'fat_loss' | 'calisthenics' | 'endurance';
  ttsEnabled: boolean;
  ttsPitch: number;
  ttsRate: number;
  ttsVoiceURI: string;
  hapticEnabled: boolean;
  sensorSensitivity: 'low' | 'medium' | 'high';
  restTimerSeconds: number;
  autoRestPhoneDown: boolean;
  targetSteps: number;
  targetWaterMl: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatsG: number;
}

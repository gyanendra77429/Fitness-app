import {
  DailyMetrics,
  Exercise,
  MealItem,
  PersonalRecord,
  UserProfile,
  WaterLog,
  WorkoutRoutine,
  WorkoutSessionRecord,
  CardioSessionRecord,
  WeightRecord
} from '../types/fitness';
import { DEFAULT_EXERCISES, DEFAULT_ROUTINES } from '../data/defaultExercises';

const STORAGE_KEYS = {
  EXERCISES: 'fitpulse_room_exercises',
  ROUTINES: 'fitpulse_room_routines',
  WORKOUT_SESSIONS: 'fitpulse_room_workout_sessions',
  CARDIO_SESSIONS: 'fitpulse_room_cardio_sessions',
  DAILY_METRICS: 'fitpulse_room_daily_metrics',
  WATER_LOGS: 'fitpulse_room_water_logs',
  MEAL_LOGS: 'fitpulse_room_meal_logs',
  PERSONAL_RECORDS: 'fitpulse_room_prs',
  WEIGHT_LOGS: 'fitpulse_room_weight_logs',
  USER_PROFILE: 'fitpulse_room_user_profile',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Rivera',
  weightKg: 76.5,
  heightCm: 178,
  age: 26,
  gender: 'male',
  fitnessGoal: 'muscle',
  ttsEnabled: true,
  ttsPitch: 1.0,
  ttsRate: 1.05,
  ttsVoiceURI: '',
  hapticEnabled: true,
  sensorSensitivity: 'medium',
  restTimerSeconds: 60,
  autoRestPhoneDown: true,
  targetSteps: 10000,
  targetWaterMl: 3000,
  targetCalories: 2400,
  targetProteinG: 155,
  targetCarbsG: 260,
  targetFatsG: 65,
};

function getTodayDateStr(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getDateOffsetStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

class FitPulseRoomDatabase {
  private initialized: boolean = false;

  public async initialize() {
    if (this.initialized) return;

    // Check if seeded
    const existing = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    if (!existing) {
      this.seedInitialData();
    }
    this.initialized = true;
  }

  private seedInitialData() {
    // 1. Seed exercises & routines
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(DEFAULT_EXERCISES));
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(DEFAULT_ROUTINES));

    // 2. Seed profile
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_PROFILE));

    // 3. Seed historical workouts (past 10 days)
    const seedWorkouts: WorkoutSessionRecord[] = [
      {
        id: 'sess-seed-1',
        date: getDateOffsetStr(6),
        startTime: Date.now() - 6 * 86400000,
        endTime: Date.now() - 6 * 86400000 + 45 * 60000,
        durationMinutes: 45,
        routineName: 'Calisthenics Full Body Foundation',
        category: 'calisthenics',
        caloriesBurned: 380,
        totalVolumeKg: 0,
        totalReps: 168,
        exercises: [
          {
            exerciseId: 'cal-pushup',
            exerciseName: 'Standard Push-Up',
            category: 'calisthenics',
            muscleGroup: 'chest',
            sets: [
              { setNumber: 1, targetReps: 15, actualReps: 15, weightKg: 0, isCompleted: true },
              { setNumber: 2, targetReps: 15, actualReps: 15, weightKg: 0, isCompleted: true },
              { setNumber: 3, targetReps: 15, actualReps: 14, weightKg: 0, isCompleted: true },
              { setNumber: 4, targetReps: 15, actualReps: 12, weightKg: 0, isCompleted: true },
            ]
          },
          {
            exerciseId: 'cal-pullup',
            exerciseName: 'Standard Pull-Up',
            category: 'calisthenics',
            muscleGroup: 'back',
            sets: [
              { setNumber: 1, targetReps: 8, actualReps: 8, weightKg: 0, isCompleted: true },
              { setNumber: 2, targetReps: 8, actualReps: 8, weightKg: 0, isCompleted: true },
              { setNumber: 3, targetReps: 8, actualReps: 7, weightKg: 0, isCompleted: true },
              { setNumber: 4, targetReps: 8, actualReps: 6, weightKg: 0, isCompleted: true },
            ]
          }
        ]
      },
      {
        id: 'sess-seed-2',
        date: getDateOffsetStr(4),
        startTime: Date.now() - 4 * 86400000,
        endTime: Date.now() - 4 * 86400000 + 52 * 60000,
        durationMinutes: 52,
        routineName: 'Gym Push Day (Chest / Delts / Triceps)',
        category: 'gym',
        caloriesBurned: 460,
        totalVolumeKg: 3850,
        totalReps: 144,
        exercises: [
          {
            exerciseId: 'gym-bench-press',
            exerciseName: 'Barbell Flat Bench Press',
            category: 'gym',
            muscleGroup: 'chest',
            sets: [
              { setNumber: 1, targetReps: 8, actualReps: 8, weightKg: 70, isCompleted: true },
              { setNumber: 2, targetReps: 8, actualReps: 8, weightKg: 75, isCompleted: true },
              { setNumber: 3, targetReps: 8, actualReps: 8, weightKg: 75, isCompleted: true },
              { setNumber: 4, targetReps: 8, actualReps: 7, weightKg: 77.5, isCompleted: true },
            ]
          }
        ]
      },
      {
        id: 'sess-seed-3',
        date: getDateOffsetStr(2),
        startTime: Date.now() - 2 * 86400000,
        endTime: Date.now() - 2 * 86400000 + 48 * 60000,
        durationMinutes: 48,
        routineName: 'Gym Pull Day (Lats / Upper Back / Biceps)',
        category: 'gym',
        caloriesBurned: 490,
        totalVolumeKg: 4200,
        totalReps: 130,
        exercises: [
          {
            exerciseId: 'gym-deadlift',
            exerciseName: 'Barbell Conventional Deadlift',
            category: 'gym',
            muscleGroup: 'back',
            sets: [
              { setNumber: 1, targetReps: 5, actualReps: 5, weightKg: 100, isCompleted: true },
              { setNumber: 2, targetReps: 5, actualReps: 5, weightKg: 115, isCompleted: true },
              { setNumber: 3, targetReps: 5, actualReps: 5, weightKg: 125, isCompleted: true },
              { setNumber: 4, targetReps: 5, actualReps: 4, weightKg: 130, isCompleted: true },
            ]
          }
        ]
      },
      {
        id: 'sess-seed-4',
        date: getDateOffsetStr(1),
        startTime: Date.now() - 1 * 86400000,
        endTime: Date.now() - 1 * 86400000 + 38 * 60000,
        durationMinutes: 38,
        routineName: 'Upper Body Calisthenics & Core',
        category: 'calisthenics',
        caloriesBurned: 340,
        totalVolumeKg: 0,
        totalReps: 140,
        exercises: [
          {
            exerciseId: 'cal-dips',
            exerciseName: 'Parallel Bar Dips',
            category: 'calisthenics',
            muscleGroup: 'chest',
            sets: [
              { setNumber: 1, targetReps: 12, actualReps: 12, weightKg: 0, isCompleted: true },
              { setNumber: 2, targetReps: 12, actualReps: 12, weightKg: 0, isCompleted: true },
              { setNumber: 3, targetReps: 12, actualReps: 10, weightKg: 0, isCompleted: true },
            ]
          }
        ]
      }
    ];
    localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(seedWorkouts));

    // 4. Seed Cardio Sessions
    const seedCardio: CardioSessionRecord[] = [
      {
        id: 'cardio-seed-1',
        date: getDateOffsetStr(5),
        activityType: 'running',
        durationSeconds: 1520,
        steps: 4200,
        distanceKm: 4.3,
        avgPaceMinKm: 5.9,
        caloriesBurned: 360,
        avgCadence: 165,
        timestamp: Date.now() - 5 * 86400000,
      },
      {
        id: 'cardio-seed-2',
        date: getDateOffsetStr(3),
        activityType: 'running',
        durationSeconds: 1850,
        steps: 5100,
        distanceKm: 5.2,
        avgPaceMinKm: 5.8,
        caloriesBurned: 440,
        avgCadence: 168,
        timestamp: Date.now() - 3 * 86400000,
      }
    ];
    localStorage.setItem(STORAGE_KEYS.CARDIO_SESSIONS, JSON.stringify(seedCardio));

    // 5. Seed Daily Metrics for past 7 days
    const seedDaily: Record<string, DailyMetrics> = {};
    for (let i = 7; i >= 0; i--) {
      const date = getDateOffsetStr(i);
      const isToday = i === 0;
      seedDaily[date] = {
        date,
        steps: isToday ? 6840 : Math.floor(7500 + Math.random() * 4500),
        activeMinutes: isToday ? 42 : Math.floor(35 + Math.random() * 30),
        caloriesBurned: isToday ? 540 : Math.floor(480 + Math.random() * 350),
        waterIntakeMl: isToday ? 2250 : Math.floor(2500 + Math.random() * 1000),
        targetSteps: 10000,
        targetWaterMl: 3000,
        targetCalories: 2400,
        targetProteinG: 155,
        targetCarbsG: 260,
        targetFatsG: 65,
        streakDays: 7,
      };
    }
    localStorage.setItem(STORAGE_KEYS.DAILY_METRICS, JSON.stringify(seedDaily));

    // 6. Seed today's Water Logs
    const today = getTodayDateStr();
    const seedWaterLogs: WaterLog[] = [
      { id: 'w-1', date: today, amountMl: 500, timeStr: '08:15 AM', timestamp: Date.now() - 14400000 },
      { id: 'w-2', date: today, amountMl: 500, timeStr: '10:30 AM', timestamp: Date.now() - 10800000 },
      { id: 'w-3', date: today, amountMl: 750, timeStr: '01:15 PM', timestamp: Date.now() - 7200000 },
      { id: 'w-4', date: today, amountMl: 500, timeStr: '03:45 PM', timestamp: Date.now() - 3600000 },
    ];
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(seedWaterLogs));

    // 7. Seed today's Meals
    const seedMeals: MealItem[] = [
      {
        id: 'meal-1',
        date: today,
        mealType: 'breakfast',
        name: 'Oatmeal with Whey & Blueberries',
        calories: 480,
        proteinG: 38,
        carbsG: 62,
        fatsG: 9,
        timeStr: '08:30 AM',
        portionSize: '1 bowl + 1 scoop'
      },
      {
        id: 'meal-2',
        date: today,
        mealType: 'lunch',
        name: 'Grilled Chicken Breast, Brown Rice & Broccoli',
        calories: 680,
        proteinG: 52,
        carbsG: 75,
        fatsG: 14,
        timeStr: '01:00 PM',
        portionSize: '200g chicken + 1.5 cups rice'
      },
      {
        id: 'meal-3',
        date: today,
        mealType: 'snack',
        name: 'Greek Yogurt with Almonds & Honey',
        calories: 280,
        proteinG: 22,
        carbsG: 24,
        fatsG: 11,
        timeStr: '04:15 PM',
        portionSize: '200g yogurt'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(seedMeals));

    // 8. Seed Personal Records (PRs)
    const seedPRs: PersonalRecord[] = [
      {
        id: 'pr-1',
        exerciseId: 'gym-bench-press',
        exerciseName: 'Barbell Flat Bench Press',
        metricType: 'max_weight',
        value: 90,
        unit: 'kg',
        date: getDateOffsetStr(12),
        previousValue: 85
      },
      {
        id: 'pr-2',
        exerciseId: 'gym-deadlift',
        exerciseName: 'Conventional Deadlift',
        metricType: 'max_weight',
        value: 140,
        unit: 'kg',
        date: getDateOffsetStr(16),
        previousValue: 130
      },
      {
        id: 'pr-3',
        exerciseId: 'cal-pullup',
        exerciseName: 'Standard Pull-Up',
        metricType: 'max_reps',
        value: 18,
        unit: 'reps',
        date: getDateOffsetStr(8),
        previousValue: 15
      },
      {
        id: 'pr-4',
        exerciseId: 'cal-pushup',
        exerciseName: 'Standard Push-Up',
        metricType: 'max_reps',
        value: 45,
        unit: 'reps',
        date: getDateOffsetStr(20),
        previousValue: 38
      },
      {
        id: 'pr-5',
        exerciseId: 'cardio-5k',
        exerciseName: '5K Outdoor Run',
        metricType: 'fastest_cardio',
        value: 23.4,
        unit: 'min',
        date: getDateOffsetStr(3),
        previousValue: 24.8
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PERSONAL_RECORDS, JSON.stringify(seedPRs));

    // 9. Seed Weight History
    const seedWeights: WeightRecord[] = [
      { id: 'w-hist-1', date: getDateOffsetStr(30), weightKg: 78.4, notes: 'Starting month' },
      { id: 'w-hist-2', date: getDateOffsetStr(20), weightKg: 77.8 },
      { id: 'w-hist-3', date: getDateOffsetStr(14), weightKg: 77.2 },
      { id: 'w-hist-4', date: getDateOffsetStr(7), weightKg: 76.9 },
      { id: 'w-hist-5', date: today, weightKg: 76.5, notes: 'Morning weighed fast' },
    ];
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(seedWeights));
  }

  // --- EXERCISE DAO ---
  public getExercises(): Exercise[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    return raw ? JSON.parse(raw) : DEFAULT_EXERCISES;
  }

  public saveCustomExercise(exercise: Exercise) {
    const all = this.getExercises();
    const updated = [exercise, ...all.filter(e => e.id !== exercise.id)];
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(updated));
  }

  // --- ROUTINES DAO ---
  public getRoutines(): WorkoutRoutine[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    return raw ? JSON.parse(raw) : DEFAULT_ROUTINES;
  }

  public saveRoutine(routine: WorkoutRoutine) {
    const all = this.getRoutines();
    const updated = [routine, ...all.filter(r => r.id !== routine.id)];
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(updated));
  }

  // --- WORKOUT SESSIONS DAO ---
  public getWorkoutSessions(): WorkoutSessionRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT_SESSIONS);
    return raw ? JSON.parse(raw) : [];
  }

  public saveWorkoutSession(session: WorkoutSessionRecord) {
    const all = this.getWorkoutSessions();
    const updated = [session, ...all];
    localStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(updated));

    // Update daily metrics with active minutes & calories
    this.incrementDailyWorkoutStats(session.durationMinutes, session.caloriesBurned);
    // Check personal records
    this.checkAndUpdatePRs(session);
  }

  private checkAndUpdatePRs(session: WorkoutSessionRecord) {
    const currentPRs = this.getPersonalRecords();
    let updated = false;

    session.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (!s.isCompleted) return;
        // Check max weight
        if (s.weightKg > 0) {
          const existingPR = currentPRs.find(p => p.exerciseId === ex.exerciseId && p.metricType === 'max_weight');
          if (!existingPR || s.weightKg > existingPR.value) {
            if (existingPR) {
              existingPR.previousValue = existingPR.value;
              existingPR.value = s.weightKg;
              existingPR.date = session.date;
            } else {
              currentPRs.push({
                id: 'pr-' + Date.now() + '-' + Math.random(),
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                metricType: 'max_weight',
                value: s.weightKg,
                unit: 'kg',
                date: session.date
              });
            }
            updated = true;
          }
        }
        // Check max reps
        const existingRepPR = currentPRs.find(p => p.exerciseId === ex.exerciseId && p.metricType === 'max_reps');
        if (!existingRepPR || s.actualReps > existingRepPR.value) {
          if (existingRepPR) {
            existingRepPR.previousValue = existingRepPR.value;
            existingRepPR.value = s.actualReps;
            existingRepPR.date = session.date;
          } else {
            currentPRs.push({
              id: 'pr-rep-' + Date.now() + '-' + Math.random(),
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              metricType: 'max_reps',
              value: s.actualReps,
              unit: 'reps',
              date: session.date
            });
          }
          updated = true;
        }
      });
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEYS.PERSONAL_RECORDS, JSON.stringify(currentPRs));
    }
  }

  // --- CARDIO DAO ---
  public getCardioSessions(): CardioSessionRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CARDIO_SESSIONS);
    return raw ? JSON.parse(raw) : [];
  }

  public saveCardioSession(session: CardioSessionRecord) {
    const all = this.getCardioSessions();
    const updated = [session, ...all];
    localStorage.setItem(STORAGE_KEYS.CARDIO_SESSIONS, JSON.stringify(updated));

    // Update today's steps and calories
    this.incrementDailyStepsAndCalories(session.steps, session.caloriesBurned, Math.round(session.durationSeconds / 60));
  }

  // --- DAILY METRICS DAO ---
  public getDailyMetricsMap(): Record<string, DailyMetrics> {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_METRICS);
    return raw ? JSON.parse(raw) : {};
  }

  public getTodayMetrics(): DailyMetrics {
    const today = getTodayDateStr();
    const map = this.getDailyMetricsMap();
    if (map[today]) {
      return map[today];
    }
    const profile = this.getUserProfile();
    const created: DailyMetrics = {
      date: today,
      steps: 0,
      activeMinutes: 0,
      caloriesBurned: 0,
      waterIntakeMl: 0,
      targetSteps: profile.targetSteps,
      targetWaterMl: profile.targetWaterMl,
      targetCalories: profile.targetCalories,
      targetProteinG: profile.targetProteinG,
      targetCarbsG: profile.targetCarbsG,
      targetFatsG: profile.targetFatsG,
      streakDays: 7,
    };
    map[today] = created;
    localStorage.setItem(STORAGE_KEYS.DAILY_METRICS, JSON.stringify(map));
    return created;
  }

  public updateTodayMetrics(updates: Partial<DailyMetrics>) {
    const today = getTodayDateStr();
    const map = this.getDailyMetricsMap();
    const current = this.getTodayMetrics();
    const updated = { ...current, ...updates };
    map[today] = updated;
    localStorage.setItem(STORAGE_KEYS.DAILY_METRICS, JSON.stringify(map));
    return updated;
  }

  public incrementDailyWorkoutStats(minutes: number, calories: number) {
    const cur = this.getTodayMetrics();
    this.updateTodayMetrics({
      activeMinutes: cur.activeMinutes + minutes,
      caloriesBurned: cur.caloriesBurned + calories
    });
  }

  public incrementDailyStepsAndCalories(steps: number, calories: number, minutes: number) {
    const cur = this.getTodayMetrics();
    this.updateTodayMetrics({
      steps: cur.steps + steps,
      caloriesBurned: cur.caloriesBurned + calories,
      activeMinutes: cur.activeMinutes + minutes
    });
  }

  // --- WATER DAO ---
  public getWaterLogs(): WaterLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WATER_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  public getTodayWaterLogs(): WaterLog[] {
    const today = getTodayDateStr();
    return this.getWaterLogs().filter(w => w.date === today);
  }

  public logWater(amountMl: number): WaterLog {
    const today = getTodayDateStr();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newLog: WaterLog = {
      id: 'water-' + Date.now(),
      date: today,
      amountMl,
      timeStr,
      timestamp: Date.now()
    };

    const all = [newLog, ...this.getWaterLogs()];
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(all));

    // Update today's total
    const cur = this.getTodayMetrics();
    this.updateTodayMetrics({
      waterIntakeMl: cur.waterIntakeMl + amountMl
    });

    return newLog;
  }

  public deleteWaterLog(id: string) {
    const all = this.getWaterLogs();
    const target = all.find(w => w.id === id);
    if (!target) return;

    const remaining = all.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(remaining));

    if (target.date === getTodayDateStr()) {
      const cur = this.getTodayMetrics();
      this.updateTodayMetrics({
        waterIntakeMl: Math.max(0, cur.waterIntakeMl - target.amountMl)
      });
    }
  }

  // --- MEALS DAO ---
  public getMeals(): MealItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MEAL_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  public getTodayMeals(): MealItem[] {
    const today = getTodayDateStr();
    return this.getMeals().filter(m => m.date === today);
  }

  public logMeal(meal: Omit<MealItem, 'id' | 'date' | 'timeStr'>): MealItem {
    const today = getTodayDateStr();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMeal: MealItem = {
      ...meal,
      id: 'meal-' + Date.now(),
      date: today,
      timeStr,
    };

    const all = [newMeal, ...this.getMeals()];
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(all));
    return newMeal;
  }

  public deleteMeal(id: string) {
    const remaining = this.getMeals().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(remaining));
  }

  // --- PERSONAL RECORDS DAO ---
  public getPersonalRecords(): PersonalRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PERSONAL_RECORDS);
    return raw ? JSON.parse(raw) : [];
  }

  // --- WEIGHT LOGS DAO ---
  public getWeightLogs(): WeightRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  public logWeight(weightKg: number, notes?: string): WeightRecord {
    const today = getTodayDateStr();
    const newRecord: WeightRecord = {
      id: 'weight-' + Date.now(),
      date: today,
      weightKg,
      notes
    };
    const all = [...this.getWeightLogs(), newRecord];
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(all));

    // Update user profile current weight
    this.updateUserProfile({ weightKg });
    return newRecord;
  }

  // --- USER PROFILE DAO ---
  public getUserProfile(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  }

  public updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    return updated;
  }

  // --- DATABASE RESET & BACKUP ---
  public exportDataJson(): string {
    const dump = {
      profile: this.getUserProfile(),
      exercises: this.getExercises(),
      routines: this.getRoutines(),
      workouts: this.getWorkoutSessions(),
      cardio: this.getCardioSessions(),
      daily: this.getDailyMetricsMap(),
      water: this.getWaterLogs(),
      meals: this.getMeals(),
      prs: this.getPersonalRecords(),
      weights: this.getWeightLogs(),
    };
    return JSON.stringify(dump, null, 2);
  }

  public resetToSample() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    this.seedInitialData();
  }
}

export const db = new FitPulseRoomDatabase();
// Auto-initialize
db.initialize();

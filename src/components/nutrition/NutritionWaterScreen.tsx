import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Utensils, 
  Plus, 
  Trash2, 
  Flame, 
  Sparkles, 
  Coffee, 
  Apple, 
  Moon, 
  Sun,
  X,
  Check
} from 'lucide-react';
import { db } from '../../services/db';
import { MealCategory, MealItem, WaterLog } from '../../types/fitness';
import { vibrator } from '../../services/vibrator';
import { voiceCoach } from '../../services/voiceCoach';

const PRELOADED_FOODS: {
  name: string;
  category: MealCategory;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  portion: string;
}[] = [
  { name: 'Oatmeal with Whey & Berries', category: 'breakfast', calories: 450, proteinG: 36, carbsG: 58, fatsG: 8, portion: '1 large bowl' },
  { name: 'Scrambled Eggs & Whole Wheat Toast', category: 'breakfast', calories: 380, proteinG: 24, carbsG: 30, fatsG: 18, portion: '3 eggs + 2 slices' },
  { name: 'Grilled Chicken Breast & Jasmine Rice', category: 'lunch', calories: 580, proteinG: 54, carbsG: 65, fatsG: 9, portion: '220g chicken + 1.5 cups rice' },
  { name: 'Tuna Salad with Olive Oil & Avocado', category: 'lunch', calories: 490, proteinG: 42, carbsG: 12, fatsG: 28, portion: '1 can tuna + greens' },
  { name: 'Baked Atlantic Salmon & Sweet Potato', category: 'dinner', calories: 620, proteinG: 46, carbsG: 48, fatsG: 24, portion: '200g salmon + 1 large potato' },
  { name: 'Lean Sirloin Steak & Steamed Broccoli', category: 'dinner', calories: 540, proteinG: 50, carbsG: 10, fatsG: 32, portion: '200g steak' },
  { name: 'Greek Yogurt with Almonds & Honey', category: 'snack', calories: 260, proteinG: 20, carbsG: 22, fatsG: 10, portion: '180g yogurt' },
  { name: 'Whey Protein Shake with Almond Milk', category: 'snack', calories: 160, proteinG: 27, carbsG: 4, fatsG: 3, portion: '1 scoop (35g)' },
  { name: 'Banana & Peanut Butter', category: 'snack', calories: 230, proteinG: 7, carbsG: 32, fatsG: 11, portion: '1 banana + 1 tbsp PB' },
];

export const NutritionWaterScreen: React.FC = () => {
  const profile = db.getUserProfile();
  const [todayMeals, setTodayMeals] = useState<MealItem[]>(db.getTodayMeals());
  const [todayWater, setTodayWater] = useState<WaterLog[]>(db.getTodayWaterLogs());
  const [dailyMetrics, setDailyMetrics] = useState(db.getTodayMetrics());

  // Meal modal state
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealCategory>('lunch');
  const [customFoodName, setCustomFoodName] = useState('');
  const [customCalories, setCustomCalories] = useState<number>(300);
  const [customProtein, setCustomProtein] = useState<number>(25);
  const [customCarbs, setCustomCarbs] = useState<number>(30);
  const [customFats, setCustomFats] = useState<number>(8);

  // Custom water input
  const [customWaterInput, setCustomWaterInput] = useState('');

  const refreshData = () => {
    setTodayMeals(db.getTodayMeals());
    setTodayWater(db.getTodayWaterLogs());
    setDailyMetrics(db.getTodayMetrics());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Compute consumed totals
  const totalCaloriesConsumed = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProteinConsumed = todayMeals.reduce((acc, m) => acc + m.proteinG, 0);
  const totalCarbsConsumed = todayMeals.reduce((acc, m) => acc + m.carbsG, 0);
  const totalFatsConsumed = todayMeals.reduce((acc, m) => acc + m.fatsG, 0);

  // Remaining calories calculation
  const remainingCalories = profile.targetCalories - totalCaloriesConsumed + dailyMetrics.caloriesBurned;

  // Water calculations
  const totalWaterMl = todayWater.reduce((acc, w) => acc + w.amountMl, 0);
  const waterProgress = Math.min(1, totalWaterMl / (profile.targetWaterMl || 3000));

  const handleAddWater = (ml: number) => {
    vibrator.repBuzz();
    db.logWater(ml);
    refreshData();
    voiceCoach.speak(`Logged ${ml} milliliters of water.`);
  };

  const handleCustomWaterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ml = parseInt(customWaterInput, 10);
    if (!isNaN(ml) && ml > 0) {
      handleAddWater(ml);
      setCustomWaterInput('');
    }
  };

  const handleDeleteWater = (id: string) => {
    vibrator.repBuzz();
    db.deleteWaterLog(id);
    refreshData();
  };

  const handleLogPreloadedFood = (food: typeof PRELOADED_FOODS[0]) => {
    vibrator.repBuzz();
    db.logMeal({
      mealType: selectedMealType,
      name: food.name,
      calories: food.calories,
      proteinG: food.proteinG,
      carbsG: food.carbsG,
      fatsG: food.fatsG,
      portionSize: food.portion,
    });
    refreshData();
    setIsMealModalOpen(false);
    voiceCoach.speak(`Logged ${food.name}. ${food.proteinG} grams of protein.`);
  };

  const handleLogCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFoodName.trim()) return;
    vibrator.repBuzz();

    db.logMeal({
      mealType: selectedMealType,
      name: customFoodName.trim(),
      calories: Number(customCalories) || 0,
      proteinG: Number(customProtein) || 0,
      carbsG: Number(customCarbs) || 0,
      fatsG: Number(customFats) || 0,
    });

    setCustomFoodName('');
    refreshData();
    setIsMealModalOpen(false);
  };

  const handleDeleteMeal = (id: string) => {
    vibrator.repBuzz();
    db.deleteMeal(id);
    refreshData();
  };

  const mealSections: { type: MealCategory; label: string; icon: React.ElementType; color: string }[] = [
    { type: 'breakfast', label: 'Breakfast', icon: Sun, color: 'text-amber-400' },
    { type: 'lunch', label: 'Lunch', icon: Utensils, color: 'text-emerald-400' },
    { type: 'dinner', label: 'Dinner', icon: Moon, color: 'text-indigo-400' },
    { type: 'snack', label: 'Snacks & Supplements', icon: Coffee, color: 'text-purple-400' },
  ];

  return (
    <div className="pb-28 px-4 pt-4 max-w-lg mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
          Fuel & Hydration
        </span>
        <h2 className="text-2xl font-bold font-heading text-white">
          Nutrition & Water Suite
        </h2>
        <p className="text-xs text-slate-400">
          Track macros, calories balance, and daily hydration
        </p>
      </div>

      {/* Water Tracker Card */}
      <div className="bg-[#1b1e24] border border-white/8 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Droplet className="w-4 h-4 fill-sky-400 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Water Intake</h3>
              <span className="text-[11px] text-slate-400">Target: {profile.targetWaterMl}ml</span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-sky-400">
            {Math.round(waterProgress * 100)}%
          </span>
        </div>

        {/* Visual Water Fill Bar & Level */}
        <div className="flex items-center gap-4 my-2">
          {/* Animated Water Flask / Glass graphic */}
          <div className="w-14 h-24 rounded-2xl bg-black/40 border-2 border-sky-500/30 relative overflow-hidden flex flex-col justify-end p-1 shadow-inner">
            <div
              className="w-full bg-gradient-to-t from-sky-500 to-cyan-400 rounded-xl transition-all duration-700 ease-out flex items-center justify-center"
              style={{ height: `${Math.max(12, Math.min(100, waterProgress * 100))}%` }}
            >
              <Droplet className="w-3.5 h-3.5 text-black opacity-60" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-heading text-white">
                {totalWaterMl.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-slate-400">/ {profile.targetWaterMl} ml</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {totalWaterMl >= profile.targetWaterMl
                ? '🎉 Daily hydration goal achieved!'
                : `${profile.targetWaterMl - totalWaterMl} ml remaining to optimal hydration.`}
            </p>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-4 gap-1.5 mt-3">
              {[150, 250, 500, 750].map((ml) => (
                <button
                  key={ml}
                  onClick={() => handleAddWater(ml)}
                  className="py-1.5 px-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-mono text-xs font-bold active:scale-95 transition-all text-center"
                >
                  +{ml}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Water Input Form */}
        <form onSubmit={handleCustomWaterSubmit} className="mt-3 pt-3 border-t border-white/5 flex gap-2">
          <input
            type="number"
            value={customWaterInput}
            onChange={(e) => setCustomWaterInput(e.target.value)}
            placeholder="Custom ml (e.g. 330)"
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold transition-all"
          >
            Log Water
          </button>
        </form>

        {/* Recent Water Entries */}
        {todayWater.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {todayWater.slice(0, 5).map((w) => (
              <div
                key={w.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] text-slate-300 whitespace-nowrap"
              >
                <span>+{w.amountMl}ml</span>
                <span className="text-[9px] text-slate-500">{w.timeStr}</span>
                <button
                  onClick={() => handleDeleteWater(w.id)}
                  className="hover:text-rose-400 text-slate-500 ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calorie & Macro Target Cockpit */}
      <div className="bg-[#1b1e24] border border-white/8 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Daily Calorie Target</h3>
              <span className="text-[11px] text-slate-400">Budget & Macronutrients</span>
            </div>
          </div>

          <button
            onClick={() => {
              vibrator.repBuzz();
              setIsMealModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Food
          </button>
        </div>

        {/* Big Remaining Calories Counter */}
        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 my-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Remaining Budget
            </span>
            <div className="text-3xl font-black font-heading text-white tracking-tight">
              {remainingCalories} <span className="text-xs font-normal text-slate-400">kcal</span>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 font-mono space-y-0.5">
            <div>Goal: <strong className="text-white">{profile.targetCalories}</strong></div>
            <div>Eaten: <strong className="text-orange-400">-{totalCaloriesConsumed}</strong></div>
            <div>Burned: <strong className="text-emerald-400">+{dailyMetrics.caloriesBurned}</strong></div>
          </div>
        </div>

        {/* 3 Macro Progress Bars */}
        <div className="space-y-2.5 mt-4">
          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300 font-semibold">Protein</span>
              <span className="text-emerald-400">
                {totalProteinConsumed}g / {profile.targetProteinG}g
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalProteinConsumed / profile.targetProteinG) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300 font-semibold">Carbohydrates</span>
              <span className="text-cyan-400">
                {totalCarbsConsumed}g / {profile.targetCarbsG}g
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalCarbsConsumed / profile.targetCarbsG) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fats */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300 font-semibold">Healthy Fats</span>
              <span className="text-amber-400">
                {totalFatsConsumed}g / {profile.targetFatsG}g
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalFatsConsumed / profile.targetFatsG) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categorized Meal Sections (Breakfast, Lunch, Dinner, Snacks) */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Today's Meals
        </div>

        {mealSections.map((sec) => {
          const mealsInType = todayMeals.filter((m) => m.mealType === sec.type);
          const caloriesInType = mealsInType.reduce((acc, m) => acc + m.calories, 0);
          const Icon = sec.icon;

          return (
            <div
              key={sec.type}
              className="bg-[#1b1e24] border border-white/8 rounded-2xl p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${sec.color}`} />
                  <h4 className="text-xs font-bold text-white">{sec.label}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-300">
                    {caloriesInType} kcal
                  </span>
                  <button
                    onClick={() => {
                      vibrator.repBuzz();
                      setSelectedMealType(sec.type);
                      setIsMealModalOpen(true);
                    }}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {mealsInType.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic pl-6">No items logged yet</p>
              ) : (
                <div className="space-y-1.5 pt-1 border-t border-white/5">
                  {mealsInType.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-black/20"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.proteinG}g P • {item.carbsG}g C • {item.fatsG}g F
                          {item.portionSize ? ` • ${item.portionSize}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white">
                          {item.calories} kcal
                        </span>
                        <button
                          onClick={() => handleDeleteMeal(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Log Food Modal */}
      {isMealModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b1e24] border border-white/10 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-400" />
                Log Meal Item
              </h3>
              <button
                onClick={() => setIsMealModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Meal Category Picker */}
            <div className="grid grid-cols-4 gap-1.5">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedMealType(type)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                    selectedMealType === type
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Quick Preloaded Foods */}
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                Popular Fitness Foods
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {PRELOADED_FOODS.map((food, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleLogPreloadedFood(food)}
                    className="p-2 rounded-xl bg-black/30 hover:bg-emerald-950/30 border border-white/5 hover:border-emerald-500/30 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{food.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {food.proteinG}g P • {food.carbsG}g C • {food.fatsG}g F
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +{food.calories} kcal
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Item Form */}
            <form onSubmit={handleLogCustomFood} className="pt-3 border-t border-white/8 space-y-3">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Or Add Custom Food
              </span>
              <input
                type="text"
                value={customFoodName}
                onChange={(e) => setCustomFoodName(e.target.value)}
                placeholder="Food item name..."
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[9px] font-mono text-slate-400 block">Calories</label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-slate-400 block">Protein (g)</label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-slate-400 block">Carbs (g)</label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-slate-400 block">Fats (g)</label>
                  <input
                    type="number"
                    value={customFats}
                    onChange={(e) => setCustomFats(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all"
              >
                Log Custom Meal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

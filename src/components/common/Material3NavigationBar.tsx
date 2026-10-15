import React from 'react';
import { LayoutDashboard, Dumbbell, Activity, UtensilsCrossed, BarChart3 } from 'lucide-react';
import { vibrator } from '../../services/vibrator';

export type NavTab = 'dashboard' | 'workouts' | 'cardio' | 'nutrition' | 'analytics';

interface Material3NavigationBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Material3NavigationBar: React.FC<Material3NavigationBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workouts' as NavTab, label: 'Workouts', icon: Dumbbell },
    { id: 'cardio' as NavTab, label: 'Cardio', icon: Activity },
    { id: 'nutrition' as NavTab, label: 'Nutrition', icon: UtensilsCrossed },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
  ];

  const handleSelect = (tab: NavTab) => {
    vibrator.repBuzz();
    onSelectTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#16181d]/95 backdrop-blur-md border-t border-white/8 px-2 py-1 select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className="group flex flex-col items-center justify-center flex-1 py-1 focus:outline-none"
            >
              {/* Material 3 active indicator pill */}
              <div
                className={`relative flex items-center justify-center w-14 h-8 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 group-hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-cyan-400' : 'scale-100'
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-0.5 tracking-tight transition-colors duration-150 ${
                  isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 font-normal'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Android Home Gesture Indicator Bar */}
      <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-1 mb-0.5" />
    </nav>
  );
};

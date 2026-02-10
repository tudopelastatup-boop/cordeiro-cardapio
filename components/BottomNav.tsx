import React from 'react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { id: Tab; icon: string }[] = [
    { id: 'list', icon: 'grid_view' }, // 4 squares icon
    { id: 'feed', icon: 'play_circle' },
    { id: 'info', icon: 'storefront' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-2 py-2 flex items-center gap-2 shadow-2xl">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center justify-center w-16 h-12 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <span
                className={`material-icons-round text-2xl transition-colors duration-300 ${
                  isActive ? 'text-brand-red' : 'text-white/40'
                }`}
              >
                {item.icon}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
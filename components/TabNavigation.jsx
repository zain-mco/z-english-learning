'use client';

import { useState, useEffect } from 'react';

/**
 * Tab Navigation Component
 */
export default function TabNavigation({ activeTab, onTabChange }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const tabs = [
    { id: 'words', label: 'Words', icon: '📚' },
    { id: 'verbs', label: 'Verbs', icon: '⚡' },
    { id: 'names', label: 'Names', icon: '🏷️' },
  ];

  return (
    <div className="flex gap-1 sm:gap-2 p-1 sm:p-2 bg-gradient-to-r from-gray-50 to-emerald-50/50 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 min-h-[44px] ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-primary/30 scale-105'
              : 'text-gray-600 hover:bg-white/80 hover:text-primary hover:shadow-md active:scale-95'
          }`}
        >
          <span className="text-lg sm:text-xl">{tab.icon}</span>
          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

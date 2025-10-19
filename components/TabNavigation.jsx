'use client';

/**
 * Tab Navigation Component
 */
export default function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'words', label: 'Words', icon: '📚' },
    { id: 'verbs', label: 'Verbs', icon: '⚡' },
    { id: 'names', label: 'Names', icon: '🏷️' },
  ];

  return (
    <div className="flex gap-2 p-2 bg-gradient-to-r from-gray-50 to-emerald-50/50 rounded-2xl shadow-sm border border-gray-200/50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-primary/30 scale-105'
              : 'text-gray-600 hover:bg-white/80 hover:text-primary hover:shadow-md'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

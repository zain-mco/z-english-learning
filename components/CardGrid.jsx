'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * Card Grid Component for displaying items
 */
export default function CardGrid({ items, type }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No {type} found. Add some from the admin panel!</p>
      </div>
    );
  }

  const getDisplayText = (item) => {
    switch (type) {
      case 'words':
        return { title: item.word, subtitle: item.explanation };
      case 'verbs':
        return { title: `${item.v1} / ${item.v2} / ${item.v3}`, subtitle: item.v1_example };
      case 'names':
        return { title: item.name, subtitle: item.example };
      default:
        return { title: 'Unknown', subtitle: '' };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => {
        const { title, subtitle } = getDisplayText(item);
        return (
          <Link
            key={item.id}
            href={`/${type === 'words' ? 'word' : type === 'verbs' ? 'verb' : 'name'}/${item.id}`}
            className="group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="h-full p-6 bg-white rounded-2xl border border-gray-200/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-800 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:bg-clip-text group-hover:text-transparent transition-all line-clamp-1">
                  {title}
                </h3>
                <ChevronRight 
                  className="text-gray-400 group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" 
                  size={24} 
                />
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">
                {subtitle || 'Click to view details'}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

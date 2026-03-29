'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import TTSButton from '@/components/TTSButton';
import { stopSpeaking } from '@/lib/tts';

/**
 * Card Grid Component for displaying verbs and names
 * Clicking a card opens inline detail with prev/next navigation
 */
export default function CardGrid({ items, type }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  // Reset selection when items or type changes
  useEffect(() => {
    setSelectedIndex(null);
  }, [type]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') navigateTo('prev');
      else if (e.key === 'ArrowRight') navigateTo('next');
      else if (e.key === 'Escape') closeDetail();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, items.length]);

  const openDetail = (index) => {
    setSelectedIndex(index);
    stopSpeaking();
  };

  const closeDetail = () => {
    setSelectedIndex(null);
    stopSpeaking();
  };

  const navigateTo = (direction) => {
    if (selectedIndex === null) return;
    const newIndex = direction === 'next' ? selectedIndex + 1 : selectedIndex - 1;
    if (newIndex >= 0 && newIndex < items.length) {
      setSelectedIndex(newIndex);
      stopSpeaking();
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No {type} found. Add some from the admin panel!</p>
      </div>
    );
  }

  const getDisplayText = (item) => {
    switch (type) {
      case 'names':
        return { title: item.name || 'Unknown', subtitle: item.example || '' };
      case 'verbs':
        return {
          title: `${item.v1 || '...'} / ${item.v2 || '...'} / ${item.v3 || '...'}`,
          subtitle: item.v1_example || 'Click to view details',
        };
      default:
        return { title: 'Unknown', subtitle: '' };
    }
  };

  // ─── Verb Detail View ───
  const renderVerbDetail = (verb) => {
    const conjugations = [
      { label: 'V1 (Base Form)', verb: verb.v1, example: verb.v1_example },
      { label: 'V2 (Past Simple)', verb: verb.v2, example: verb.v2_example },
      { label: 'V3 (Past Participle)', verb: verb.v3, example: verb.v3_example },
    ];

    return (
      <>
        {/* Title */}
        <div className="border-b-2 border-gray-100 pb-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {verb.v1} / {verb.v2} / {verb.v3}
          </h1>
          <p className="text-gray-600 mt-2 font-medium">Verb Conjugation</p>
        </div>

        {/* Conjugations */}
        <div className="space-y-6 mb-8">
          {conjugations.map((conj, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-emerald-50 via-blue-50/30 to-primary-light/20 rounded-2xl p-6 border-l-4 border-primary shadow-sm"
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">{conj.label}</h2>
                <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                    {conj.verb}
                  </span>
                  <TTSButton text={conj.verb} label={`Play ${conj.label.split(' ')[0]}`} />
                </div>
              </div>

              {conj.example && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Example:</h3>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-700 italic mb-3 leading-relaxed">
                      &quot;{conj.example}&quot;
                    </p>
                    <TTSButton text={conj.example} label="Play Example" className="text-xs" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );
  };

  // ─── Name Detail View ───
  const renderNameDetail = (name) => {
    return (
      <>
        {/* Name Header */}
        <div className="border-b-2 border-gray-100 pb-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {name.name}
            </h1>
            <TTSButton text={name.name} label="Play Name" />
          </div>
          <p className="text-gray-600 mt-2 font-medium">Noun / Name</p>
        </div>

        {/* Synonyms */}
        {name.synonym && name.synonym.length > 0 && (
          <div className="bg-gradient-to-br from-emerald-50 via-blue-50/30 to-primary-light/20 rounded-2xl p-6 border-l-4 border-primary shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Synonyms</h2>
            <div className="flex flex-wrap gap-2">
              {name.synonym.map((syn, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-gray-100 shadow-sm"
                >
                  <span className="text-base font-medium bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                    {syn}
                  </span>
                  <TTSButton text={syn} label="Play synonym" className="text-xs" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Example */}
        {name.example && (
          <div className="bg-gradient-to-br from-emerald-50 via-blue-50/30 to-primary-light/20 rounded-2xl p-6 border-l-4 border-accent shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Example</h2>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-gray-700 italic mb-3 leading-relaxed">
                &quot;{name.example}&quot;
              </p>
              <TTSButton text={name.example} label="Play Example" className="text-xs" />
            </div>
          </div>
        )}

        {/* Source Verb */}
        {name.source_verb && (
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 rounded-2xl p-6 border-l-4 border-blue-500 shadow-sm mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Source Verb</h2>
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {name.source_verb}
              </span>
              <TTSButton text={name.source_verb} label="Play Source Verb" className="text-xs" />
            </div>
          </div>
        )}
      </>
    );
  };

  // ─── Detail View (inline) ───
  if (selectedItem) {
    return (
      <div className="animate-fade-in">
        {/* Back button */}
        <button
          onClick={closeDetail}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-all hover:gap-3 mb-6 font-medium group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to {type === 'verbs' ? 'Verbs' : 'Names'}</span>
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl shadow-primary/5 p-8 md:p-12 border border-gray-100 animate-scale-in">
            {type === 'verbs' ? renderVerbDetail(selectedItem) : renderNameDetail(selectedItem)}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
              <button
                onClick={() => navigateTo('prev')}
                disabled={selectedIndex <= 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  selectedIndex <= 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-emerald-600 text-white hover:from-primary-dark hover:to-emerald-700 hover:scale-105 shadow-md hover:shadow-lg'
                }`}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <span className="text-gray-500 text-sm font-medium">
                {selectedIndex + 1} of {items.length}
              </span>

              <button
                onClick={() => navigateTo('next')}
                disabled={selectedIndex >= items.length - 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  selectedIndex >= items.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-emerald-600 text-white hover:from-primary-dark hover:to-emerald-700 hover:scale-105 shadow-md hover:shadow-lg'
                }`}
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Grid View ───
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => {
        const { title, subtitle } = getDisplayText(item);
        return (
          <div
            key={item.id}
            onClick={() => openDetail(index)}
            className="group cursor-pointer"
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
          </div>
        );
      })}
    </div>
  );
}

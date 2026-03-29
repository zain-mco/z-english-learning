'use client';

import { useState, useEffect, useCallback } from 'react';
import { Volume2, ChevronLeft, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { speak, stopSpeaking } from '@/lib/tts';

/**
 * Notes Panel Component
 * Displays notes in grid; clicking opens inline detail with prev/next navigation
 */
export default function NotesPanel({ notes }) {
  const [speakingId, setSpeakingId] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const selectedNote = selectedIndex !== null ? notes[selectedIndex] : null;

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
  }, [selectedIndex, notes.length]);

  const handleSpeak = (note, e) => {
    if (e) e.stopPropagation();
    if (speakingId === note.id) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      const fullText = `${note.title}. ${note.content}`;
      speak(fullText);
      setSpeakingId(note.id);
      setTimeout(() => setSpeakingId(null), fullText.length * 80);
    }
  };

  const openDetail = (index) => {
    setSelectedIndex(index);
    stopSpeaking();
    setSpeakingId(null);
  };

  const closeDetail = () => {
    setSelectedIndex(null);
    stopSpeaking();
    setSpeakingId(null);
  };

  const navigateTo = (direction) => {
    if (selectedIndex === null) return;
    const newIndex = direction === 'next' ? selectedIndex + 1 : selectedIndex - 1;
    if (newIndex >= 0 && newIndex < notes.length) {
      setSelectedIndex(newIndex);
      stopSpeaking();
      setSpeakingId(null);
    }
  };

  // ─── Detail View ───
  if (selectedNote) {
    return (
      <div className="animate-fade-in">
        {/* Back button */}
        <button
          onClick={closeDetail}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-all hover:gap-3 mb-6 font-medium group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Notes</span>
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl shadow-primary/5 p-8 md:p-12 border border-gray-100 animate-scale-in">
            {/* Title */}
            <div className="border-b-2 border-gray-100 pb-6 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-relaxed">
                {selectedNote.title}
              </h1>
            </div>

            {/* Content */}
            <div className="bg-gradient-to-br from-emerald-50 via-blue-50/30 to-primary-light/20 rounded-2xl p-6 md:p-8 border-l-4 border-primary shadow-sm mb-8">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {selectedNote.content}
              </p>
            </div>

            {/* Play Button */}
            <div className="mb-8">
              <button
                onClick={(e) => handleSpeak(selectedNote, e)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-md ${
                  speakingId === selectedNote.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200'
                    : 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-primary/20 hover:shadow-lg'
                }`}
              >
                <Volume2 size={18} />
                {speakingId === selectedNote.id ? 'Stop Playing' : 'Play Note'}
              </button>
            </div>

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
                {selectedIndex + 1} of {notes.length}
              </span>

              <button
                onClick={() => navigateTo('next')}
                disabled={selectedIndex >= notes.length - 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  selectedIndex >= notes.length - 1
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
    <div>
      {notes.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500 text-lg">No notes yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note, index) => (
            <div
              key={note.id}
              onClick={() => openDetail(index)}
              className="group bg-white rounded-2xl border border-gray-200/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 animate-fade-in overflow-hidden cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Card Header */}
              <div className="p-6 pb-3">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:bg-clip-text group-hover:text-transparent transition-all line-clamp-1">
                    {note.title}
                  </h3>
                  <ChevronRight
                    className="text-gray-400 group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0"
                    size={24}
                  />
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                  {note.content}
                </p>
              </div>

              {/* Card Actions */}
              <div className="px-6 pb-5 pt-3 flex items-center border-t border-gray-100/80 mt-auto">
                <button
                  onClick={(e) => handleSpeak(note, e)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm ${
                    speakingId === note.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200'
                      : 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-primary/20 hover:shadow-md'
                  }`}
                  title={speakingId === note.id ? 'Stop' : 'Play note aloud'}
                >
                  <Volume2 size={16} />
                  {speakingId === note.id ? 'Stop' : 'Play'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

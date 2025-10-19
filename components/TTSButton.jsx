'use client';

import { Volume2 } from 'lucide-react';
import { speak } from '@/lib/tts';

/**
 * TTS Button Component
 * Plays text using American English TTS
 */
export default function TTSButton({ text, label, className = '' }) {
  const handleSpeak = () => {
    if (text) {
      speak(text);
    }
  };

  return (
    <button
      onClick={handleSpeak}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg hover:shadow-primary/30 ${className}`}
      aria-label={`Play ${label || 'text'}`}
    >
      <Volume2 size={18} />
      <span className="text-sm font-medium">{label || 'Play'}</span>
    </button>
  );
}

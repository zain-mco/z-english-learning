'use client';

import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speak, stopSpeaking } from '@/lib/tts';

/**
 * Notes Panel Component
 * Displays notes with TTS playback (CRUD managed via admin panel)
 */
export default function NotesPanel({ notes }) {
  const [speakingId, setSpeakingId] = useState(null);

  const handleSpeak = (note) => {
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

  return (
    <div>
      {/* Notes Grid */}
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
              className="group bg-white rounded-2xl border border-gray-200/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Card Header */}
              <div className="p-6 pb-3">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-accent group-hover:bg-clip-text group-hover:text-transparent transition-all line-clamp-1">
                    {note.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                  {note.content}
                </p>
              </div>

              {/* Card Actions */}
              <div className="px-6 pb-5 pt-3 flex items-center border-t border-gray-100/80 mt-auto">
                <button
                  onClick={() => handleSpeak(note)}
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

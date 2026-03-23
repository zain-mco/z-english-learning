'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Volume2, X, Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { speak, stopSpeaking } from '@/lib/tts';

/**
 * Notes Panel Component
 * Displays notes with add/edit/delete and TTS playback
 */
export default function NotesPanel({ notes, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [speakingId, setSpeakingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingNote(null);
    setShowForm(false);
  };

  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update({ title: title.trim(), content: content.trim() })
          .eq('id', editingNote.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([{ title: title.trim(), content: content.trim() }]);
        if (error) throw error;
      }
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;

    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note: ' + error.message);
    }
  };

  const handleSpeak = (note) => {
    if (speakingId === note.id) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      const fullText = `${note.title}. ${note.content}`;
      speak(fullText);
      setSpeakingId(note.id);
      // Reset speaking state after estimated duration
      setTimeout(() => setSpeakingId(null), fullText.length * 80);
    }
  };

  return (
    <div>
      {/* Add Note Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-primary/30 active:scale-95"
        >
          <Plus size={24} />
          Add New Note
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingNote ? '✏️ Edit Note' : '📝 New Note'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-lg font-medium mb-4 transition-colors"
              autoFocus
            />

            <textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-base min-h-[180px] resize-none mb-6 transition-colors"
            />

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!title.trim() || !content.trim() || saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-md"
              >
                <Save size={20} />
                {saving ? 'Saving...' : (editingNote ? 'Update' : 'Save')}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500 text-lg">No notes yet. Add your first note!</p>
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
              <div className="px-6 pb-5 pt-3 flex items-center gap-2 border-t border-gray-100/80 mt-auto">
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

                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Edit note"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

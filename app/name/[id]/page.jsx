'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import TTSButton from '@/components/TTSButton';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

/**
 * Individual Name Detail Page
 */
export default function NamePage() {
  const params = useParams();
  const router = useRouter();
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allIds, setAllIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const fetchName = useCallback(async () => {
    if (!params.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('names')
        .select('*')
        .eq('id', parseInt(params.id))
        .single();

      if (error) {
        // If name not found, redirect to first available name
        if (allIds.length > 0) {
          router.replace(`/name/${allIds[0]}`);
          return;
        }
        throw error;
      }

      setName(data);
      localStorage.setItem('lastName', params.id);
    } catch (error) {
      console.error('Error fetching name:', error);
      // If we have allIds, redirect to first name
      if (allIds.length > 0) {
        router.replace(`/name/${allIds[0]}`);
      }
    } finally {
      setLoading(false);
    }
  }, [params.id, allIds, router]);

  const fetchAllIds = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('names')
        .select('id')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const ids = data.map(item => item.id);
      setAllIds(ids);

      // If current params.id doesn't exist in the list, redirect to first name
      if (params.id && !ids.includes(parseInt(params.id))) {
        if (ids.length > 0) {
          router.replace(`/name/${ids[0]}`);
          return;
        }
      }

      setCurrentIndex(ids.indexOf(parseInt(params.id)));
    } catch (error) {
      console.error('Error fetching IDs:', error);
    }
  }, [params.id, router]);

  useEffect(() => {
    // Initial check - if no valid ID, redirect to first name
    if (!params.id || isNaN(parseInt(params.id))) {
      fetchAllIds();
      return;
    }

    fetchName();
    fetchAllIds();
  }, [params.id]);

  // Separate effect to handle redirect after allIds is loaded
  useEffect(() => {
    if (allIds.length > 0 && params.id && (isNaN(parseInt(params.id)) || !allIds.includes(parseInt(params.id)))) {
      router.replace(`/name/${allIds[0]}`);
    }
  }, [allIds, params.id, router]);

  const navigateTo = (direction) => {
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < allIds.length) {
      router.push(`/name/${allIds[newIndex]}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!name) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 text-lg">Name not found</p>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-all hover:gap-3 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl shadow-primary/5 p-8 md:p-12 animate-scale-in border border-gray-100">
          <div className="border-b-2 border-gradient-to-r from-primary/20 to-accent/20 pb-6 mb-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {name.name}
              </h1>
              <TTSButton text={name.name} label="Play Name" />
            </div>
          </div>

          {/* Synonyms */}
          {name.synonym && name.synonym.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Synonyms</h2>
              <div className="space-y-3">
                {name.synonym.map((syn, index) => (
                  <div key={index} className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-100/50">
                    <span className="text-lg text-gray-800 font-medium">{syn}</span>
                    <TTSButton text={syn} label={`Play ${index + 1}`} className="text-xs" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Example */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Example</h2>
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6 border-l-4 border-primary">
              <p className="text-gray-700 text-lg italic mb-4 leading-relaxed">&quot;{name.example}&quot;</p>
              <TTSButton text={name.example} label="Play Example" />
            </div>
          </div>

          {/* Source Verb */}
          {name.source_verb && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Source Verb</h2>
              <div className="bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center justify-between">
                  <span className="text-lg text-gray-800 font-medium">{name.source_verb}</span>
                  <TTSButton text={name.source_verb} label="Play Verb" />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
            <button
              onClick={() => navigateTo('prev')}
              disabled={currentIndex <= 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentIndex <= 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-emerald-600 text-white hover:from-primary-dark hover:to-emerald-700 hover:scale-105 shadow-md hover:shadow-lg'
              }`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <span className="text-gray-500 text-sm">
              {currentIndex + 1} of {allIds.length}
            </span>

            <button
              onClick={() => navigateTo('next')}
              disabled={currentIndex >= allIds.length - 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentIndex >= allIds.length - 1
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import TTSButton from '@/components/TTSButton';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

/**
 * Individual Verb Detail Page
 */
export default function VerbPage() {
  const params = useParams();
  const router = useRouter();
  const [verb, setVerb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allIds, setAllIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const fetchVerb = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('verbs')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setVerb(data);
      
      localStorage.setItem('lastVerb', params.id);
    } catch (error) {
      console.error('Error fetching verb:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const fetchAllIds = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('verbs')
        .select('id')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const ids = data.map(item => item.id);
      setAllIds(ids);
      setCurrentIndex(ids.indexOf(parseInt(params.id)));
    } catch (error) {
      console.error('Error fetching IDs:', error);
    }
  }, [params.id]);

  useEffect(() => {
    fetchVerb();
    fetchAllIds();
  }, [fetchVerb, fetchAllIds]);

  const navigateTo = (direction) => {
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < allIds.length) {
      router.push(`/verb/${allIds[newIndex]}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!verb) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 text-lg">Verb not found</p>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">
          Go back home
        </Link>
      </div>
    );
  }

  const conjugations = [
    { label: 'V1 (Base Form)', verb: verb.v1, example: verb.v1_example },
    { label: 'V2 (Past Simple)', verb: verb.v2, example: verb.v2_example },
    { label: 'V3 (Past Participle)', verb: verb.v3, example: verb.v3_example },
  ];

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
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {verb.v1} / {verb.v2} / {verb.v3}
            </h1>
            <p className="text-gray-600 mt-2 font-medium">Verb Conjugation</p>
          </div>

          {/* Conjugations */}
          <div className="space-y-6 mb-8">
            {conjugations.map((conj, index) => (
              <div key={index} className="bg-gradient-to-br from-emerald-50 via-blue-50/30 to-primary-light/20 rounded-2xl p-6 border-l-4 border-primary shadow-sm">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">{conj.label}</h2>
                  <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">{conj.verb}</span>
                    <TTSButton text={conj.verb} label={`Play ${conj.label.split(' ')[0]}`} />
                  </div>
                </div>
                
                {conj.example && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Example:</h3>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <p className="text-gray-700 italic mb-3 leading-relaxed">&quot;{conj.example}&quot;</p>
                      <TTSButton text={conj.example} label="Play Example" className="text-xs" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

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

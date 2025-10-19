'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import TabNavigation from '@/components/TabNavigation';
import CardGrid from '@/components/CardGrid';
import { Loader2, Search } from 'lucide-react';

/**
 * Main Home Page with Tab Navigation
 */
export default function HomePage() {
  const [activeTab, setActiveTab] = useState('words');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(activeTab)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    // Load last visited tab from localStorage
    const lastTab = localStorage.getItem('lastTab');
    if (lastTab) {
      setActiveTab(lastTab);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    setSearchQuery('');
    // Save current tab to localStorage
    localStorage.setItem('lastTab', activeTab);
  }, [activeTab, fetchItems]);

  // Filter items based on search query
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    switch (activeTab) {
      case 'words':
        return (
          item.word?.toLowerCase().includes(query) ||
          item.synonyms?.some(syn => syn.toLowerCase().includes(query)) ||
          item.explanation?.toLowerCase().includes(query) ||
          item.example?.toLowerCase().includes(query)
        );
      case 'verbs':
        return (
          item.v1?.toLowerCase().includes(query) ||
          item.v2?.toLowerCase().includes(query) ||
          item.v3?.toLowerCase().includes(query) ||
          item.v1_example?.toLowerCase().includes(query) ||
          item.v2_example?.toLowerCase().includes(query) ||
          item.v3_example?.toLowerCase().includes(query)
        );
      case 'names':
        return (
          item.name?.toLowerCase().includes(query) ||
          item.synonym?.some(syn => syn.toLowerCase().includes(query)) ||
          item.example?.toLowerCase().includes(query) ||
          item.source_verb?.toLowerCase().includes(query)
        );
      default:
        return true;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Welcome to <span className="bg-gradient-to-r from-primary via-emerald-600 to-accent bg-clip-text text-transparent">Z English Learning</span>
          </h2>
          <p className="text-lg text-gray-600 font-medium">
            Master vocabulary with interactive text-to-speech support
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 animate-slide-up">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="animate-fade-in">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : filteredItems.length === 0 && searchQuery ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No {activeTab} found matching &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <CardGrid items={filteredItems} type={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}

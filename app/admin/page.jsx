'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Edit2, Trash2, Upload, Loader2, Lock, LogOut, Search, CheckSquare, Square, XCircle } from 'lucide-react';
import Papa from 'papaparse';

/**
 * Admin Dashboard Page
 */
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('words');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  // Simple password (in production, use proper authentication)
  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
      setSearchQuery('');
      setSelectedItems([]);
    }
  }, [activeTab, isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      alert('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
  };

  const fetchItems = async () => {
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
      alert('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData(getEmptyForm());
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase.from(activeTab).delete().eq('id', id);
      if (error) throw error;
      setSelectedItems([]);
      fetchItems();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting item: ' + error.message);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)?`)) return;

    try {
      const { error } = await supabase.from(activeTab).delete().in('id', selectedItems);
      if (error) throw error;
      setSelectedItems([]);
      fetchItems();
    } catch (error) {
      console.error('Error deleting selected items:', error);
      alert('Error deleting selected items: ' + error.message);
    }
  };

  const handleDeleteAll = async () => {
    if (items.length === 0) {
      alert('No items to delete');
      return;
    }

    const confirmMsg = `⚠️ WARNING: You are about to delete ALL ${items.length} ${activeTab}. This action cannot be undone!\n\nType "DELETE ALL" to confirm:`;
    const userInput = prompt(confirmMsg);

    if (userInput !== 'DELETE ALL') {
      alert('Deletion cancelled');
      return;
    }

    try {
      const itemIds = items.map(item => item.id);
      const { error } = await supabase.from(activeTab).delete().in('id', itemIds);
      if (error) throw error;
      setSelectedItems([]);
      fetchItems();
      alert('All items deleted successfully');
    } catch (error) {
      console.error('Error deleting all items:', error);
      alert('Error deleting all items: ' + error.message);
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingItem) {
        const { error } = await supabase
          .from(activeTab)
          .update(formData)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(activeTab).insert([formData]);
        if (error) throw error;
      }

      setShowModal(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving item: ' + error.message);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'json') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          let jsonData = JSON.parse(event.target.result);

          // Process and validate data based on table type
          if (activeTab === 'verbs') {
            jsonData = jsonData.map(item => {
              const processed = {};
              // Only keep valid columns
              const validColumns = ['v1', 'v1_example', 'v2', 'v2_example', 'v3', 'v3_example'];
              validColumns.forEach(col => {
                if (item[col] !== undefined) {
                  processed[col] = item[col];
                }
              });
              // Validate required fields
              if (!processed.v1 || !processed.v2 || !processed.v3) {
                throw new Error('JSON must contain v1, v2, and v3 fields for each verb');
              }
              return processed;
            });
          }

          const { error } = await supabase.from(activeTab).insert(jsonData);
          if (error) throw error;
          fetchItems();
          alert('Bulk upload successful!');
        } catch (error) {
          console.error('Error uploading JSON:', error);
          alert('Error uploading JSON: ' + error.message);
        }
      };
      reader.readAsText(file);
    } else if (fileType === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const processedData = results.data
              .filter(row => Object.values(row).some(val => val))
              .map(row => {
                const processed = { ...row };
                // Convert comma-separated strings to arrays for synonyms
                if (activeTab === 'words' && row.synonyms) {
                  processed.synonyms = row.synonyms.split(',').map(s => s.trim());
                }
                if (activeTab === 'names' && row.synonym) {
                  processed.synonym = row.synonym.split(',').map(s => s.trim());
                }
                // Remove any invalid columns for verbs table
                if (activeTab === 'verbs') {
                  // Only keep valid columns
                  const validColumns = ['v1', 'v1_example', 'v2', 'v2_example', 'v3', 'v3_example'];
                  Object.keys(processed).forEach(key => {
                    if (!validColumns.includes(key)) {
                      delete processed[key];
                    }
                  });
                  // Validate required fields
                  if (!processed.v1 || !processed.v2 || !processed.v3) {
                    throw new Error('CSV must contain v1, v2, and v3 columns for verbs');
                  }
                }
                return processed;
              });

            const { error } = await supabase.from(activeTab).insert(processedData);
            if (error) throw error;
            fetchItems();
            alert('CSV upload successful!');
          } catch (error) {
            console.error('Error uploading CSV:', error);
            alert('Error uploading CSV: ' + error.message);
          }
        },
        error: (error) => {
          alert('Error parsing CSV: ' + error.message);
        }
      });
    }

    e.target.value = '';
  };

  const getEmptyForm = () => {
    switch (activeTab) {
      case 'words':
        return { word: '', synonyms: [], explanation: '', example: '' };
      case 'verbs':
        return { v1: '', v1_example: '', v2: '', v2_example: '', v3: '', v3_example: '' };
      case 'names':
        return { name: '', synonym: [], example: '', source_verb: '' };
      default:
        return {};
    }
  };

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-primary-light/30">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary rounded-full">
              <Lock className="text-white" size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-all hover:scale-105"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-gradient-to-r from-gray-50 to-emerald-50/50 p-2 rounded-2xl shadow-sm border border-gray-200/50">
          {['words', 'verbs', 'names'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === tab
                  ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-primary/30'
                  : 'text-gray-600 hover:bg-white/80 hover:shadow-md'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white rounded-lg font-medium transition-all hover:scale-105 shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Add New
          </button>

          <label className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-blue-600 hover:from-accent-dark hover:to-blue-700 text-white rounded-lg font-medium cursor-pointer transition-all hover:scale-105 shadow-md hover:shadow-lg">
            <Upload size={20} />
            Upload CSV/JSON
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleBulkUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleDeleteSelected}
            disabled={selectedItems.length === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-md ${selectedItems.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 hover:shadow-lg'
              }`}
          >
            <Trash2 size={20} />
            Remove Selected ({selectedItems.length})
          </button>

          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all hover:scale-105 shadow-md hover:shadow-lg"
          >
            <XCircle size={20} />
            Remove All
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-left">
                      <button
                        onClick={toggleSelectAll}
                        className="text-primary hover:text-primary-dark transition-colors"
                      >
                        {selectedItems.length === filteredItems.length && filteredItems.length > 0 ? (
                          <CheckSquare size={20} />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>
                    </th>
                    {getTableHeaders().map((header, i) => (
                      <th key={i} className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        {header}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleSelectItem(item.id)}
                          className="text-primary hover:text-primary-dark transition-colors"
                        >
                          {selectedItems.includes(item.id) ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </td>
                      {renderTableRow(item)}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {searchQuery ? `No ${activeTab} found matching "${searchQuery}"` : `No ${activeTab} available`}
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
              </h2>
              <form onSubmit={handleSubmit}>
                {renderForm()}
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function getTableHeaders() {
    switch (activeTab) {
      case 'words':
        return ['Word', 'Synonyms', 'Explanation', 'Example'];
      case 'verbs':
        return ['V1', 'V1 Example', 'V2', 'V2 Example', 'V3', 'V3 Example'];
      case 'names':
        return ['Name', 'Synonyms', 'Example', 'Source Verb'];
      default:
        return [];
    }
  }

  function renderTableRow(item) {
    switch (activeTab) {
      case 'words':
        return (
          <>
            <td className="px-6 py-4 font-medium text-gray-900">{item.word}</td>
            <td className="px-6 py-4 text-gray-600 text-sm">{item.synonyms?.join(', ') || '-'}</td>
            <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{item.explanation}</td>
            <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{item.example}</td>
          </>
        );
      case 'verbs':
        return (
          <>
            <td className="px-6 py-4 font-medium text-gray-900">{item.v1}</td>
            <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{item.v1_example}</td>
            <td className="px-6 py-4 font-medium text-gray-900">{item.v2}</td>
            <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{item.v2_example}</td>
            <td className="px-6 py-4 font-medium text-gray-900">{item.v3}</td>
            <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{item.v3_example}</td>
          </>
        );
      case 'names':
        return (
          <>
            <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
            <td className="px-6 py-4 text-gray-600 text-sm">{item.synonym?.join(', ') || '-'}</td>
            <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{item.example}</td>
            <td className="px-6 py-4 text-gray-600 text-sm">{item.source_verb || '-'}</td>
          </>
        );
      default:
        return null;
    }
  }

  function renderForm() {
    const inputClass = "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none";

    switch (activeTab) {
      case 'words':
        return (
          <>
            <input
              type="text"
              placeholder="Word"
              value={formData.word || ''}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              className={inputClass + " mb-4"}
              required
            />
            <input
              type="text"
              placeholder="Synonyms (comma-separated)"
              value={formData.synonyms?.join(', ') || ''}
              onChange={(e) => setFormData({ ...formData, synonyms: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
              className={inputClass + " mb-4"}
            />
            <textarea
              placeholder="Explanation"
              value={formData.explanation || ''}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className={inputClass + " mb-4 min-h-24"}
              required
            />
            <textarea
              placeholder="Example"
              value={formData.example || ''}
              onChange={(e) => setFormData({ ...formData, example: e.target.value })}
              className={inputClass + " min-h-24"}
              required
            />
          </>
        );
      case 'verbs':
        return (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="V1 (Base Form)"
                value={formData.v1 || ''}
                onChange={(e) => setFormData({ ...formData, v1: e.target.value })}
                className={inputClass}
                required
              />
              <textarea
                placeholder="V1 Example"
                value={formData.v1_example || ''}
                onChange={(e) => setFormData({ ...formData, v1_example: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="V2 (Past Simple)"
                value={formData.v2 || ''}
                onChange={(e) => setFormData({ ...formData, v2: e.target.value })}
                className={inputClass}
                required
              />
              <textarea
                placeholder="V2 Example"
                value={formData.v2_example || ''}
                onChange={(e) => setFormData({ ...formData, v2_example: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="V3 (Past Participle)"
                value={formData.v3 || ''}
                onChange={(e) => setFormData({ ...formData, v3: e.target.value })}
                className={inputClass}
                required
              />
              <textarea
                placeholder="V3 Example"
                value={formData.v3_example || ''}
                onChange={(e) => setFormData({ ...formData, v3_example: e.target.value })}
                className={inputClass}
                required
              />
            </div>
          </>
        );
      case 'names':
        return (
          <>
            <input
              type="text"
              placeholder="Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass + " mb-4"}
              required
            />
            <input
              type="text"
              placeholder="Synonyms (comma-separated)"
              value={formData.synonym?.join(', ') || ''}
              onChange={(e) => setFormData({ ...formData, synonym: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
              className={inputClass + " mb-4"}
            />
            <textarea
              placeholder="Example"
              value={formData.example || ''}
              onChange={(e) => setFormData({ ...formData, example: e.target.value })}
              className={inputClass + " mb-4 min-h-24"}
              required
            />
            <input
              type="text"
              placeholder="Source Verb (optional)"
              value={formData.source_verb || ''}
              onChange={(e) => setFormData({ ...formData, source_verb: e.target.value })}
              className={inputClass}
            />
          </>
        );
      default:
        return null;
    }
  }
}

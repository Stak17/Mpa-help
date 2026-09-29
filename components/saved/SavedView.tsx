'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bookmark,
  Search,
  Copy,
  Share2,
  Trash2,
  Edit3,
  ExternalLink,
  Check,
  Filter,
  FileText,
  Briefcase,
  Store,
  Languages,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/services/authContext';
import { DocumentItem } from '@/types';
import { DatabaseService } from '@/services/databaseService';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/components/common/ToastProvider';

export const SavedView: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'category'>('newest');

  // Preview & edit modal state
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const items = await DatabaseService.getDocuments(user?.uid);
      setDocuments(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    DatabaseService.getDocuments(user?.uid)
      .then((items) => {
        if (isMounted) {
          setDocuments(items);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error(e);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);


  const handleDelete = async (id: string) => {
    await DatabaseService.deleteDocument(id, user?.uid);
    setDocuments((prev) => prev.filter((d) => d.documentId !== id));
    if (activeDoc?.documentId === id) setActiveDoc(null);
    toast.info('Document removed from saved items.');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (doc: DocumentItem) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: doc.title,
          text: doc.content,
        });
      } catch {
        handleCopy(doc.documentId, doc.content);
      }
    } else {
      handleCopy(doc.documentId, doc.content);
    }
  };

  const handleSaveEdit = async () => {
    if (!activeDoc) return;
    const updated: DocumentItem = {
      ...activeDoc,
      content: editContent,
      updatedAt: new Date().toISOString(),
    };
    await DatabaseService.saveDocument(updated);
    setDocuments((prev) => prev.map((d) => (d.documentId === updated.documentId ? updated : d)));
    setActiveDoc(updated);
    setIsEditing(false);
    toast.success('Document changes saved!');
  };

  // Filter & sort
  const filteredDocs = useMemo(() => {
    return documents
      .filter((doc) => {
        // Category filter
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'documents' && !['job_application', 'school_letter', 'landlord_message', 'complaint'].includes(doc.type)) {
            return false;
          }
          if (selectedCategory === 'cv' && doc.type !== 'cv') return false;
          if (selectedCategory === 'business' && doc.type !== 'business_advert') return false;
          if (selectedCategory === 'translations' && doc.type !== 'translation') return false;
          if (selectedCategory === 'chats' && doc.type !== 'general_message') return false;
        }

        // Search query
        if (debouncedQuery.trim()) {
          const q = debouncedQuery.toLowerCase();
          const matchesTitle = doc.title.toLowerCase().includes(q);
          const matchesContent = doc.content.toLowerCase().includes(q);
          const matchesType = doc.type.toLowerCase().includes(q);
          return matchesTitle || matchesContent || matchesType;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'category') {
          return a.type.localeCompare(b.type);
        }
        return 0;
      });
  }, [documents, selectedCategory, debouncedQuery, sortBy]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'documents', label: 'Documents' },
    { id: 'cv', label: 'CVs' },
    { id: 'business', label: 'Business' },
    { id: 'translations', label: 'Translations' },
    { id: 'chats', label: 'Chats' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
              Saved Content & Library
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Access your letters, CVs, business advertisements, and translations anytime
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved title or content..."
            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium hidden sm:inline">
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto pb-1 gap-1.5 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === c.id
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Content List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-stone-400">Loading your saved items...</div>
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="You haven't saved anything yet"
          description="Generate letters, CVs, budgets or translations and tap 'Save' to find them here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.documentId}
              className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-500/50 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                    {doc.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-stone-900 dark:text-white line-clamp-1">
                  {doc.title}
                </h3>
                <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400 line-clamp-3 leading-relaxed">
                  {doc.content}
                </p>
              </div>

              {/* Action Bar */}
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setActiveDoc(doc);
                    setEditContent(doc.content);
                    setIsEditing(false);
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full</span>
                </button>

                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                  <button
                    onClick={() => handleCopy(doc.documentId, doc.content)}
                    className="p-1 hover:text-stone-800 dark:hover:text-stone-200"
                    title="Copy"
                  >
                    {copiedId === doc.documentId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleShare(doc)}
                    className="p-1 hover:text-stone-800 dark:hover:text-stone-200"
                    title="Share"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.documentId)}
                    className="p-1 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail / Edit View Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 p-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white line-clamp-1">
                {activeDoc.title}
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Text'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full min-h-[300px] p-3 text-xs sm:text-sm font-mono bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 leading-relaxed"
                />
              ) : (
                <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-stone-800 dark:text-stone-200 font-mono">
                  {activeDoc.content}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeDoc.documentId, activeDoc.content)}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-medium text-stone-800 dark:text-stone-200 transition flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => handleShare(activeDoc)}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-xs font-medium text-stone-800 dark:text-stone-200 transition flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isEditing && (
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
                  >
                    Save Changes
                  </button>
                )}
                <button
                  onClick={() => setActiveDoc(null)}
                  className="px-4 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

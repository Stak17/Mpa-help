'use client';

import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Share2,
  Bookmark,
  Printer,
  RotateCcw,
  Check,
  Edit3,
} from 'lucide-react';
import { useAuth } from '@/services/authContext';
import { DatabaseService } from '@/services/databaseService';
import { HelpfulFeedback } from '@/components/common/HelpfulFeedback';
import { useToast } from '@/components/common/ToastProvider';

export const WriteView: React.FC = () => {
  const { user, userProfile, recordUsage } = useAuth();
  const toast = useToast();

  const categories = [
    { id: 'job_application', label: 'Job Application Letter' },
    { id: 'cover_letter', label: 'Cover Letter' },
    { id: 'landlord_message', label: 'Landlord / Tenant Message' },
    { id: 'school_letter', label: 'School Letter (Fees/Absence)' },
    { id: 'complaint', label: 'Formal Complaint / Inquiry' },
    { id: 'business_advert', label: 'Business Advertisement' },
    { id: 'invitation', label: 'Formal / Wedding / Event Invitation' },
    { id: 'recommendation_letter', label: 'Recommendation / Request Letter' },
    { id: 'general_message', label: 'General Respectful Message' },
  ];

  const tones = ['Professional', 'Respectful', 'Friendly', 'Short'];

  const [selectedCategory, setSelectedCategory] = useState('job_application');
  const [selectedTone, setSelectedTone] = useState('Professional');

  // Dynamic form state
  const [formData, setFormData] = useState<Record<string, string>>({
    fullName: '',
    targetNameOrCompany: '',
    positionOrPurpose: '',
    experienceOrContext: '',
    educationOrBackground: '',
    skillsOrHighlights: '',
    extraDetails: '',
  });

  const [generatedDoc, setGeneratedDoc] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleGenerate = async () => {
    setErrorMsg(null);
    const allowed = await recordUsage('Write Something');
    if (!allowed) return;

    setLoading(true);
    try {
      const res = await fetch('/api/gemini/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: categories.find((c) => c.id === selectedCategory)?.label || selectedCategory,
          fields: formData,
          tone: selectedTone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate document.');
      }

      setGeneratedDoc(data.document);
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDoc);
    setCopied(true);
    toast.success('Document copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Document from Mpa Help',
          text: generatedDoc,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleSave = async () => {
    try {
      const docItem = {
        documentId: 'doc_' + Date.now(),
        userId: user?.uid || userProfile?.userId || 'guest',
        type: selectedCategory,
        title: `${categories.find((c) => c.id === selectedCategory)?.label} - ${formData.targetNameOrCompany || 'Untitled'}`,
        content: generatedDoc,
        metadata: { ...formData, tone: selectedTone },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await DatabaseService.saveDocument(docItem);
      setSaved(true);
      toast.success('Document saved to your library!');
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
      toast.error('Failed to save document.');
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
              Write Something
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Draft professional job applications, school letters, landlord notices, and complaints
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Document Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Tone:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {tones.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTone(t)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition ${
                      selectedTone === t
                        ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Fields */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Your Full Name:
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="e.g. Kato Brian"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Recipient Name, School or Company:
                </label>
                <input
                  type="text"
                  value={formData.targetNameOrCompany}
                  onChange={(e) => handleInputChange('targetNameOrCompany', e.target.value)}
                  placeholder="e.g. Standard Supermarket Kampala / Headteacher St. Jude"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Position or Main Purpose:
                </label>
                <input
                  type="text"
                  value={formData.positionOrPurpose}
                  onChange={(e) => handleInputChange('positionOrPurpose', e.target.value)}
                  placeholder="e.g. Shop Attendant / School Fees Payment Plan / Rent Repair Request"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Key Experience or Context:
                </label>
                <textarea
                  value={formData.experienceOrContext}
                  onChange={(e) => handleInputChange('experienceOrContext', e.target.value)}
                  rows={2}
                  placeholder="e.g. 2 years working at wholesale shop in Kikuubo, honest cash handling, punctual..."
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Additional Details to Include:
                </label>
                <textarea
                  value={formData.extraDetails}
                  onChange={(e) => handleInputChange('extraDetails', e.target.value)}
                  rows={2}
                  placeholder="e.g. Available immediately, contact number 077..., attached references..."
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Drafting Document...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Document</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-6">
          <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col h-full min-h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <span className="font-bold text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Generated Document
              </span>
              {generatedDoc && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Done Editing' : 'Edit Text'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 py-4">
              {generatedDoc ? (
                isEditing ? (
                  <textarea
                    value={generatedDoc}
                    onChange={(e) => setGeneratedDoc(e.target.value)}
                    className="w-full h-full min-h-[320px] p-3 text-xs sm:text-sm font-mono bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 leading-relaxed"
                  />
                ) : (
                  <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-stone-800 dark:text-stone-200 max-h-[440px] overflow-y-auto">
                    {generatedDoc}
                  </div>
                )
              ) : (
                <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 text-stone-400 dark:text-stone-500">
                  <FileText className="w-10 h-10 mb-2 stroke-1 text-stone-300 dark:text-stone-600" />
                  <p className="text-xs sm:text-sm font-medium">Your generated letter will appear here.</p>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs">
                    Fill in your details on the left and tap &quot;Generate Document&quot;.
                  </p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            {generatedDoc && (
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-medium transition"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-medium transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>

                    <button
                      onClick={handleSave}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition"
                    >
                      {saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span>{saved ? 'Saved!' : 'Save'}</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-medium transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </div>

                  <button
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>

                <HelpfulFeedback featureName="Write Something" contextTitle={selectedCategory} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

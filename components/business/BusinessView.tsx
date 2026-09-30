'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  Sparkles,
  Copy,
  Share2,
  Bookmark,
  Check,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  MessageSquare,
  Wand2,
} from 'lucide-react';
import { useAuth } from '@/services/authContext';
import { BusinessProfileItem } from '@/types';
import { DatabaseService } from '@/services/databaseService';
import { HelpfulFeedback } from '@/components/common/HelpfulFeedback';
import { useToast } from '@/components/common/ToastProvider';
import { useTranslation } from '@/services/i18nContext';

export const BusinessView: React.FC = () => {
  const { user, userProfile, effectiveUserId, recordUsage } = useAuth();
  const { t, language } = useTranslation();
  const toast = useToast();

  const businessCategories = [
    'Retail & Duka',
    'Boutique, Shoes & Fashion',
    'Hardware & Construction Materials',
    'Restaurant, Takeaway & Catering',
    'Salon, Barber & Cosmetics',
    'Phone & Electronics Accessories',
    'Agribusiness, Produce & Poultry',
    'Motorcycle / Boda Spare Parts',
    'Pharmacy / Drug Shop',
    'Professional & Artisan Services',
  ];

  const contentTypes = [
    { id: 'whatsapp_ad', label: 'WhatsApp Status / Broadcast' },
    { id: 'facebook_post', label: 'Facebook Post' },
    { id: 'tiktok_script', label: 'TikTok Video Script' },
    { id: 'instagram_caption', label: 'Instagram Caption' },
    { id: 'promo_offer', label: 'Special Discount / Promo Offer' },
    { id: 'customer_reply', label: 'Polite Customer Reply / Negotiation' },
    { id: '7day_plan', label: '7-Day Marketing Calendar' },
    { id: '30day_plan', label: '30-Day Content Plan' },
    { id: 'improve_ad', label: 'Improve Existing Advert' },
  ];

  const [profiles, setProfiles] = useState<BusinessProfileItem[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [selectedContentType, setSelectedContentType] = useState<string>('whatsapp_ad');
  const [customDetails, setCustomDetails] = useState<string>('');
  const [existingAdToImprove, setExistingAdToImprove] = useState<string>('');

  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [showAddProfileModal, setShowAddProfileModal] = useState<boolean>(false);

  // New profile modal form state
  const [newBizName, setNewBizName] = useState('');
  const [newBizCategory, setNewBizCategory] = useState(businessCategories[0]);
  const [newBizLocation, setNewBizLocation] = useState('');
  const [newBizDesc, setNewBizDesc] = useState('');
  const [newBizPhone, setNewBizPhone] = useState('');

  // Load saved profiles from Firestore/Local
  useEffect(() => {
    (async () => {
      const remote = await DatabaseService.getBusinessProfiles(effectiveUserId);
      if (remote && remote.length > 0) {
        setProfiles(remote);
        setSelectedProfileId(remote[0].businessId);
      } else {
        setProfiles([]);
        setSelectedProfileId('');
      }
    })();
  }, [effectiveUserId]);

  const currentProfile = profiles.find((p) => p.businessId === selectedProfileId) || profiles[0] || {
    businessId: 'new',
    userId: effectiveUserId,
    businessName: newBizName || '',
    category: newBizCategory || businessCategories[0],
    location: newBizLocation || '',
    description: newBizDesc || '',
    phone: newBizPhone || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleGenerate = async () => {
    const allowed = await recordUsage('Grow My Business');
    if (!allowed) return;

    setLoading(true);
    try {
      const res = await fetch('/api/gemini/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: currentProfile,
          requestType: contentTypes.find((c) => c.id === selectedContentType)?.label || selectedContentType,
          customDetails,
          existingAd: selectedContentType === 'improve_ad' ? existingAdToImprove : undefined,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGeneratedResult(data.content);
      setIsEditing(false);
      toast.success(t('bizGenerating', 'Marketing content generated!'));
    } catch (e: any) {
      console.error(e);
      toast.error('Could not generate marketing content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async () => {
    try {
      const docItem = {
        documentId: 'doc_bz_' + Date.now(),
        userId: effectiveUserId,
        type: 'business_advert',
        title: `${currentProfile?.businessName || 'Business'} - ${contentTypes.find((c) => c.id === selectedContentType)?.label}`,
        content: generatedResult,
        metadata: { businessId: currentProfile?.businessId, contentType: selectedContentType },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await DatabaseService.saveDocument(docItem);
      setSaved(true);
      toast.success('Saved to your library!');
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
      toast.error('Failed to save to library.');
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;

    const newProfile: BusinessProfileItem = {
      businessId: 'bz_' + Date.now(),
      userId: effectiveUserId,
      businessName: newBizName.trim(),
      category: newBizCategory,
      location: newBizLocation.trim(),
      description: newBizDesc.trim(),
      phone: newBizPhone.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newProfile, ...profiles];
    setProfiles(updated);
    setSelectedProfileId(newProfile.businessId);
    await DatabaseService.saveBusinessProfile(newProfile);
    toast.success('New business profile added!');

    // Reset
    setNewBizName('');
    setNewBizDesc('');
    setNewBizPhone('');
    setShowAddProfileModal(false);
  };

  const handleDeleteProfile = async (id: string) => {
    if (profiles.length <= 1) {
      toast.warning('You must keep at least one business profile.');
      return;
    }
    const updated = profiles.filter((p) => p.businessId !== id);
    setProfiles(updated);
    setSelectedProfileId(updated[0].businessId);
    await DatabaseService.deleteBusinessProfile(id, effectiveUserId);
    toast.info('Business profile removed.');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    toast.success('Advert copied to clipboard! Ready to paste into WhatsApp.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Advert for ${currentProfile.businessName}`,
          text: generatedResult,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
              {t('bizTitle', 'Grow My Business')}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {t('bizSubtitle', 'Create high-converting WhatsApp ads, Facebook posts, TikTok scripts, and customer replies')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddProfileModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('bizNewProfileBtn', 'New Business Profile')}</span>
        </button>
      </div>

      {/* Profile Selector Banner */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500 dark:text-stone-400">{t('bizActive', 'Active Business:')}</span>
          {profiles.length > 0 ? (
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="text-xs sm:text-sm font-bold bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 py-1.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none cursor-pointer"
            >
              {profiles.map((p) => (
                <option key={p.businessId} value={p.businessId}>
                  {p.businessName} ({p.location})
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-stone-500 dark:text-stone-400 italic">
              {t('bizNoProfiles', 'None saved yet. Tap "+ New Business Profile" to add yours!')}
            </span>
          )}
        </div>

        {profiles.length > 1 && (
          <button
            onClick={() => handleDeleteProfile(selectedProfileId)}
            className="text-xs text-stone-400 hover:text-red-500 transition flex items-center gap-1 self-end sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('delete', 'Delete profile')}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Form + Generated Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generator Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                {t('bizContentType', 'Content Type to Generate:')}
              </label>
              <select
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                {contentTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedContentType === 'improve_ad' ? (
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  {t('bizExistingAdLabel', 'Paste Your Existing Advert to Critique & Improve:')}
                </label>
                <textarea
                  value={existingAdToImprove}
                  onChange={(e) => setExistingAdToImprove(e.target.value)}
                  rows={4}
                  placeholder={t('bizExistingAdPlaceholder', 'Paste your current WhatsApp message or Facebook text here...')}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  {t('bizDetailsLabel', 'Special Offer, Focus Product or Instructions:')}
                </label>
                <textarea
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  rows={4}
                  placeholder="e.g. 15% discount this Saturday, free delivery to Kalerwe & Wandegeya, WhatsApp number 077..."
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('bizGenerating', 'Writing Marketing Post...')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('bizGenerateBtn', 'Generate Marketing Content')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col h-full min-h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <span className="font-bold text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {t('bizOutput', 'Marketing Output')}
              </span>
              {generatedResult && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? t('save', 'Done Editing') : t('edit', 'Edit Text')}</span>
                </button>
              )}
            </div>

            <div className="flex-1 py-4">
              {generatedResult ? (
                isEditing ? (
                  <textarea
                    value={generatedResult}
                    onChange={(e) => setGeneratedResult(e.target.value)}
                    className="w-full h-full min-h-[280px] p-3 text-xs sm:text-sm font-mono bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-stone-900 dark:text-stone-100 leading-relaxed"
                  />
                ) : (
                  <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-stone-800 dark:text-stone-200 max-h-[400px] overflow-y-auto">
                    {generatedResult}
                  </div>
                )
              ) : (
                <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 text-stone-400 dark:text-stone-500">
                  <Store className="w-10 h-10 mb-2 stroke-1 text-stone-300 dark:text-stone-600" />
                  <p className="text-xs sm:text-sm font-medium">{t('bizOutput', 'Your marketing content will appear here.')}</p>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs">
                    {t('bizSubtitle', 'Ready to copy directly into WhatsApp statuses, broadcasts, Facebook, or TikTok.')}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {generatedResult && (
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-medium transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? t('transCopied', 'Copied') : t('transCopy', 'Copy')}</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-medium transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{t('transShare', 'Share')}</span>
                    </button>
                    <button
                      onClick={handleSaveContent}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-semibold transition cursor-pointer"
                    >
                      {saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span>{saved ? t('transSaved', 'Saved!') : t('transSave', 'Save')}</span>
                    </button>
                  </div>
                </div>
                <HelpfulFeedback featureName="Grow My Business" contextTitle={currentProfile.businessName} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Profile Modal */}
      {showAddProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 p-5 shadow-2xl border border-stone-200 dark:border-stone-800">
            <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-3">
              Add New Business Profile
            </h3>
            <form onSubmit={handleCreateProfile} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 block mb-1">
                  Business Name: *
                </label>
                <input
                  type="text"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  placeholder="e.g. Mugisha Smart Hardware"
                  className="w-full text-xs p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 block mb-1">
                  Category:
                </label>
                <select
                  value={newBizCategory}
                  onChange={(e) => setNewBizCategory(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                >
                  {businessCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 block mb-1">
                  Location (Town / District / Market):
                </label>
                <input
                  type="text"
                  value={newBizLocation}
                  onChange={(e) => setNewBizLocation(e.target.value)}
                  placeholder="e.g. Jinja Main Street"
                  className="w-full text-xs p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 block mb-1">
                  Products or Services:
                </label>
                <textarea
                  value={newBizDesc}
                  onChange={(e) => setNewBizDesc(e.target.value)}
                  rows={2}
                  placeholder="e.g. Cement, iron sheets, paint, pipes, plumbing tools..."
                  className="w-full text-xs p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 block mb-1">
                  Phone / WhatsApp Number:
                </label>
                <input
                  type="text"
                  value={newBizPhone}
                  onChange={(e) => setNewBizPhone(e.target.value)}
                  placeholder="e.g. +256 700 000 000"
                  className="w-full text-xs p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                >
                  Save Business
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProfileModal(false)}
                  className="flex-1 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

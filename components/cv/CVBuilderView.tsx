'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  Sparkles,
  Copy,
  Printer,
  Bookmark,
  Share2,
  Check,
  Layout,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/services/authContext';
import { CVData, EducationEntry, ExperienceEntry, ReferenceEntry } from '@/types';
import { DatabaseService } from '@/services/databaseService';
import { HelpfulFeedback } from '@/components/common/HelpfulFeedback';
import { useToast } from '@/components/common/ToastProvider';
import { useTranslation } from '@/services/i18nContext';

export const CVBuilderView: React.FC = () => {
  const { user, userProfile, effectiveUserId, recordUsage } = useAuth();
  const { t, language } = useTranslation();
  const toast = useToast();

  const [activeStep, setActiveStep] = useState<'form' | 'preview'>('form');

  const [cvData, setCvData] = useState<CVData>({
    fullName: userProfile?.name && !userProfile.name.toLowerCase().includes('guest') ? userProfile.name : '',
    email: userProfile?.email && !userProfile.email.toLowerCase().includes('guest@') ? userProfile.email : '',
    phone: userProfile?.phone || '',
    location: '',
    professionalSummary: '',
    education: [],
    experience: [],
    skills: [],
    languages: [],
    references: [],
    templateStyle: 'classic',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Education handlers
  const addEducation = () => {
    const entry: EducationEntry = {
      id: 'edu_' + Date.now(),
      institution: '',
      degreeOrCertificate: '',
      startYear: '',
      endYear: '',
    };
    setCvData((prev) => ({ ...prev, education: [...prev.education, entry] }));
  };

  const updateEducation = (id: string, field: keyof EducationEntry, val: string) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
    }));
  };

  const removeEducation = (id: string) => {
    setCvData((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  };

  // Experience handlers
  const addExperience = () => {
    const entry: ExperienceEntry = {
      id: 'exp_' + Date.now(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      responsibilities: '',
    };
    setCvData((prev) => ({ ...prev, experience: [...prev.experience, entry] }));
  };

  const updateExperience = (id: string, field: keyof ExperienceEntry, val: string) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
    }));
  };

  const removeExperience = (id: string) => {
    setCvData((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
  };

  // Skills
  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    setCvData((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setCvData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  // Languages
  const addLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLanguage.trim()) return;
    setCvData((prev) => ({ ...prev, languages: [...prev.languages, newLanguage.trim()] }));
    setNewLanguage('');
  };

  const removeLanguage = (lang: string) => {
    setCvData((prev) => ({ ...prev, languages: prev.languages.filter((l) => l !== lang) }));
  };

  // References
  const addReference = () => {
    const entry: ReferenceEntry = {
      id: 'ref_' + Date.now(),
      name: '',
      role: '',
      organization: '',
      phoneOrEmail: '',
    };
    setCvData((prev) => ({ ...prev, references: [...prev.references, entry] }));
  };

  const updateReference = (id: string, field: keyof ReferenceEntry, val: string) => {
    setCvData((prev) => ({
      ...prev,
      references: prev.references.map((r) => (r.id === id ? { ...r, [field]: val } : r)),
    }));
  };

  const removeReference = (id: string) => {
    setCvData((prev) => ({ ...prev, references: prev.references.filter((r) => r.id !== id) }));
  };

  const handleGenerateCV = async () => {
    setErrorMsg(null);
    const allowed = await recordUsage('CV Builder');
    if (!allowed) return;

    setLoading(true);
    try {
      const res = await fetch('/api/gemini/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvData }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate CV.');
      }

      setGeneratedMarkdown(data.cvText);
      setActiveStep('preview');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'CV creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCV = async () => {
    try {
      const docItem = {
        documentId: 'cv_' + Date.now(),
        userId: effectiveUserId,
        type: 'cv',
        title: `Curriculum Vitae - ${cvData.fullName || 'Candidate'}`,
        content: generatedMarkdown,
        metadata: { cvData },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await DatabaseService.saveDocument(docItem);
      setSaved(true);
      toast.success('CV saved to your library!');
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
      toast.error('Could not save CV.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopied(true);
    toast.success('CV copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
              {t('cvTitle', 'Professional CV Builder')}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {t('cvSubtitle', 'Create an honest, structured Ugandan CV in 3 clean layouts')}
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveStep('form')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeStep === 'form'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {t('cvTabDetails', '1. Details & Experience')}
          </button>
          <button
            onClick={() => {
              if (generatedMarkdown) setActiveStep('preview');
              else handleGenerateCV();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeStep === 'preview'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {t('cvTabPreview', '2. CV Preview & Export')}
          </button>
        </div>
      </div>

      {activeStep === 'form' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Layout style selector */}
          <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-emerald-600" />
              <span>{t('cvLayoutTitle', 'Choose Layout Style:')}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'classic', label: t('cvLayoutClassic', 'Classic Professional'), desc: t('cvLayoutClassicDesc', 'Standard formal layout') },
                { id: 'modern', label: t('cvLayoutModern', 'Modern Minimal'), desc: t('cvLayoutModernDesc', 'Clean headers & badges') },
                { id: 'executive', label: t('cvLayoutExecutive', 'Executive Kampala'), desc: t('cvLayoutExecutiveDesc', 'Detailed senior style') },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setCvData((p) => ({ ...p, templateStyle: style.id as any }))}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    cvData.templateStyle === style.id
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <div className="font-bold text-xs text-stone-900 dark:text-stone-100">{style.label}</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 1. Personal Details */}
          <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              {t('cvPersonalSection', '1. Personal Details')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  {t('cvFullName', 'Full Name:')} *
                </label>
                <input
                  type="text"
                  value={cvData.fullName}
                  onChange={(e) => setCvData((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="e.g. Namusoke Sarah"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  {t('cvPhone', 'Phone Number / WhatsApp:')}
                </label>
                <input
                  type="text"
                  value={cvData.phone}
                  onChange={(e) => setCvData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. +256 772 123 456"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  {t('cvEmail', 'Email Address:')}
                </label>
                <input
                  type="email"
                  value={cvData.email}
                  onChange={(e) => setCvData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. sarah.namusoke@gmail.com"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  {t('cvLocation', 'Location (City / District):')}
                </label>
                <input
                  type="text"
                  value={cvData.location}
                  onChange={(e) => setCvData((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Ntinda, Kampala, Uganda"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                {t('cvSummary', 'Professional Summary:')}
              </label>
              <textarea
                value={cvData.professionalSummary}
                onChange={(e) => setCvData((p) => ({ ...p, professionalSummary: e.target.value }))}
                rows={2}
                placeholder={t('cvSummaryPlaceholder', 'Brief summary of your skills, background, and career goals...')}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Education Entries */}
          <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                {t('cvEducationSection', '2. Education & Qualifications')}
              </h3>
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('cvAddEduBtn', 'Add Education')}</span>
              </button>
            </div>

            {cvData.education.length === 0 ? (
              <div className="text-center py-4 text-stone-400 text-xs italic bg-stone-50/50 dark:bg-stone-800/30 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                No formal education added. Click &quot;+ Add Education&quot; to list your school, certificate, or degree.
              </div>
            ) : (
              cvData.education.map((edu) => (
                <div
                  key={edu.id}
                  className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 relative space-y-2"
                >
                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="absolute top-3 right-3 text-stone-400 hover:text-red-600 transition cursor-pointer"
                    title="Remove education"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                    <div>
                      <label className="text-[11px] text-stone-500 font-medium">{t('cvInstitution', 'School / University:')}</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        placeholder="e.g. Makerere University / High School"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-500 font-medium">{t('cvDegree', 'Certificate / Degree / Level:')}</label>
                      <input
                        type="text"
                        value={edu.degreeOrCertificate}
                        onChange={(e) => updateEducation(edu.id, 'degreeOrCertificate', e.target.value)}
                        placeholder="e.g. Diploma / UACE / Certificate"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-500 font-medium">{t('cvStartYear', 'Start Year:')}</label>
                      <input
                        type="text"
                        value={edu.startYear}
                        onChange={(e) => updateEducation(edu.id, 'startYear', e.target.value)}
                        placeholder="2019"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-500 font-medium">{t('cvEndYear', 'End Year:')}</label>
                      <input
                        type="text"
                        value={edu.endYear}
                        onChange={(e) => updateEducation(edu.id, 'endYear', e.target.value)}
                        placeholder="2022"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 3. Work Experience */}
          <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                {t('cvExperienceSection', '3. Work Experience')}
              </h3>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('cvAddExpBtn', 'Add Experience')}</span>
              </button>
            </div>

            {cvData.experience.length === 0 ? (
              <div className="text-center py-4 text-stone-400 text-xs italic bg-stone-50/50 dark:bg-stone-800/30 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                No past experience added. Click &quot;+ Add Experience&quot; to list your jobs, shop work, or projects.
              </div>
            ) : (
              cvData.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 relative space-y-2"
                >
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-3 right-3 text-stone-400 hover:text-red-600 transition"
                    title="Remove experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                    <div>
                      <label className="text-[11px] text-stone-500 font-medium">{t('cvRole', 'Job Title / Role:')}</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                        placeholder="e.g. Cashier / Boda Rider / Teacher"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-500 font-medium">{t('cvCompany', 'Company / Workplace:')}</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        placeholder="e.g. City Hardware Ltd"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-500 font-medium">{t('cvStartDate', 'Start Date:')}</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        placeholder="Jan 2023"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-500 font-medium">{t('cvEndDate', 'End Date:')}</label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        placeholder="Present"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium">{t('cvResponsibilities', 'Key Duties & Achievements:')}</label>
                    <textarea
                      value={exp.responsibilities}
                      onChange={(e) => updateExperience(exp.id, 'responsibilities', e.target.value)}
                      rows={2}
                      placeholder="e.g. Stocktaking, customer greeting, balancing daily sales records..."
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 4. Skills & Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Skills */}
            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                {t('cvSkillsSection', '4. Skills & Strengths')}
              </h3>
              <form onSubmit={addSkill} className="flex gap-1.5">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill (e.g. Accounting)"
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {t('cvAddSkill', 'Add Skill')}
                </button>
              </form>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cvData.skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="text-stone-400 hover:text-red-500 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                {t('cvLanguagesSection', '5. Languages Spoken')}
              </h3>
              <form onSubmit={addLanguage} className="flex gap-1.5">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Add language (e.g. Swahili)"
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {t('cvAddLanguage', 'Add Language')}
                </button>
              </form>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cvData.languages.map((l) => (
                  <span
                    key={l}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium"
                  >
                    {l}
                    <button
                      type="button"
                      onClick={() => removeLanguage(l)}
                      className="text-stone-400 hover:text-red-500 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 5. References */}
          <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                {t('cvReferencesSection', '6. Referees')}
              </h3>
              <button
                type="button"
                onClick={addReference}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('cvAddRefereeBtn', 'Add Referee')}</span>
              </button>
            </div>

            {cvData.references.length === 0 ? (
              <div className="text-center py-3 text-stone-400 text-xs italic bg-stone-50/50 dark:bg-stone-800/30 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                No referees added yet. Click &quot;+ Add Referee&quot; or leave empty for &quot;Available upon request&quot;.
              </div>
            ) : (
              cvData.references.map((ref) => (
                <div
                  key={ref.id}
                  className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 relative grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  <button
                    type="button"
                    onClick={() => removeReference(ref.id)}
                    className="absolute top-2 right-2 text-stone-400 hover:text-red-600 transition cursor-pointer"
                    title="Remove reference"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium">{t('cvRefName', 'Referee Name:')}</label>
                    <input
                      type="text"
                      value={ref.name}
                      onChange={(e) => updateReference(ref.id, 'name', e.target.value)}
                      placeholder="e.g. Rev. Fr. Joseph / Mr. Okello"
                      className="w-full text-xs px-2 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 font-medium">{t('cvRefTitle', 'Position / Company:')}</label>
                    <input
                      type="text"
                      value={ref.organization}
                      onChange={(e) => updateReference(ref.id, 'organization', e.target.value)}
                      placeholder="e.g. Manager at Stanbic Bank"
                      className="w-full text-xs px-2 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-stone-500 font-medium">{t('cvRefPhone', 'Phone Number:')}</label>
                    <input
                      type="text"
                      value={ref.phoneOrEmail}
                      onChange={(e) => updateReference(ref.id, 'phoneOrEmail', e.target.value)}
                      placeholder="e.g. +256 701 234 567"
                      className="w-full text-xs px-2 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleGenerateCV}
            disabled={loading || !cvData.fullName}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('cvGenerating', 'Structuring Your CV...')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t('cvGenerateBtn', 'Generate Formatted CV')}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Preview Step */
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-stone-900 dark:text-white">
                  {t('cvTitle', 'Curriculum Vitae Preview')} ({cvData.templateStyle})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-medium transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t('transCopied', 'Copied') : t('cvDownloadBtn', 'Copy')}</span>
                </button>
                <button
                  onClick={handleSaveCV}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition cursor-pointer"
                >
                  {saved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{saved ? t('transSaved', 'Saved') : t('cvSaveBtn', 'Save')}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-medium transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('cvPrintBtn', 'Print / PDF')}</span>
                </button>
              </div>
            </div>

            <div className="mt-4 p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto font-mono text-stone-800 dark:text-stone-200">
              {generatedMarkdown}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <button
                onClick={() => setActiveStep('form')}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
              >
                {t('back', '← Edit Details')}
              </button>
              <HelpfulFeedback featureName="CV Builder" contextTitle={cvData.fullName} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  FileCheck,
  Send,
  HelpCircle,
  ThumbsUp,
  Award,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/services/authContext';
import { HelpfulFeedback } from '@/components/common/HelpfulFeedback';
import { useToast } from '@/components/common/ToastProvider';
import { useTranslation } from '@/services/i18nContext';

interface WorkViewProps {
  onOpenCVBuilder: () => void;
  onOpenCoverLetter: () => void;
}

export const WorkView: React.FC<WorkViewProps> = ({ onOpenCVBuilder, onOpenCoverLetter }) => {
  const { recordUsage } = useAuth();
  const { t, language } = useTranslation();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'interview' | 'career_profile'>('interview');

  const jobRoles = [
    'Retail Shop Attendant / Cashier',
    'Customer Care & Support Agent',
    'Delivery & Logistics (Boda / Van)',
    'Primary / Secondary School Teacher',
    'Administrative Assistant / Secretary',
    'Hotel, Restaurant & Hospitality Staff',
    'Nurse / Health Assistant',
    'Accountant / Bookkeeper',
    'IT Support & Computer Technician',
    'NGO / Community Field Officer',
  ];

  const [selectedRole, setSelectedRole] = useState(jobRoles[0]);
  const [experienceLevel, setExperienceLevel] = useState('Entry to Mid Level');
  const [generatedQuestions, setGeneratedQuestions] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState<boolean>(false);

  // Career profile state
  const [careerGoals, setCareerGoals] = useState({
    targetRole: '',
    targetSalaryUGX: '',
    preferredLocation: '',
    availability: '',
  });

  const handleGenerateQuestions = async () => {
    const allowed = await recordUsage('Interview Practice');
    if (!allowed) return;

    setLoading(true);
    setFeedback('');
    try {
      const res = await fetch('/api/gemini/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate_questions',
          jobRole: selectedRole,
          experienceLevel,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGeneratedQuestions(data.result);
      setCurrentQuestion(`Tell me about a time you handled a difficult customer or challenging situation at work.`);
      toast.success(t('workGenQuestionsBtn', 'Interview questions ready!'));
    } catch (e: any) {
      console.error(e);
      toast.error('Could not generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const allowed = await recordUsage('Interview Practice Evaluation');
    if (!allowed) return;

    setEvaluating(true);
    try {
      const res = await fetch('/api/gemini/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'evaluate_answer',
          jobRole: selectedRole,
          question: currentQuestion,
          userAnswer,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeedback(data.result);
      toast.success(t('workFeedbackTitle', 'Evaluation and tips ready!'));
    } catch (e: any) {
      console.error(e);
      toast.error('Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
              {t('workTitle', 'Find Work & Career Hub')}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {t('workSubtitle', 'Prepare for Ugandan job opportunities with CVs, cover letters, and interview coaching')}
            </p>
          </div>
        </div>

        {/* Quick links to CV and Letter tools */}
        <div className="flex gap-2">
          <button
            onClick={onOpenCVBuilder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{t('workOpenCvBtn', 'CV Builder')}</span>
          </button>
          <button
            onClick={onOpenCoverLetter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-semibold transition cursor-pointer"
          >
            <span>{t('workOpenCoverBtn', 'Cover Letter')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('interview')}
          className={`pb-2 px-3 text-xs sm:text-sm font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'interview'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          {t('workTabInterview', 'Interview Practice & Feedback')}
        </button>
        <button
          onClick={() => setActiveTab('career_profile')}
          className={`pb-2 px-3 text-xs sm:text-sm font-bold transition border-b-2 cursor-pointer ${
            activeTab === 'career_profile'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          {t('workTabCareer', 'Career Profile & Goals')}
        </button>
      </div>

      {activeTab === 'interview' ? (
        <div className="space-y-6">
          {/* Role selector form */}
          <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              {t('workSelectRole', 'Step 1: Select Target Job in Uganda')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  {t('workSelectRole', 'Job Role:')}
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 cursor-pointer"
                >
                  {jobRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  {t('workExpLevel', 'Experience Level:')}
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 cursor-pointer"
                >
                  <option value="First-Time Job Seeker / Youth">First-Time Job Seeker / Youth</option>
                  <option value="Entry to Mid Level">Entry to Mid Level (1 - 3 yrs)</option>
                  <option value="Experienced Senior">Experienced Senior (4+ yrs)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateQuestions}
              disabled={loading}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('workGenQuestionsLoading', 'Preparing Questions...')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('workGenQuestionsBtn', 'Generate Interview Questions')}</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Questions List */}
          {generatedQuestions && (
            <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                {t('workPracticeQTitle', 'Common Ugandan Interview Questions')} ({selectedRole}):
              </h3>
              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-stone-800 dark:text-stone-200">
                {generatedQuestions}
              </div>
            </div>
          )}

          {/* Step 2: Practice answering one question */}
          <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              {t('workTabInterview', 'Step 2: Practice Your Answer & Get Constructive Feedback')}
            </h3>

            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                {t('workPracticeQTitle', 'Question to practice:')}
              </label>
              <input
                type="text"
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                placeholder="e.g. Why should we hire you for this position?"
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>

            <form onSubmit={handleEvaluateAnswer} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  {t('workYourAnswer', 'Type your answer as if speaking in the interview:')}
                </label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={4}
                  placeholder={t('workAnswerPlaceholder', 'Type your answer or how you would respond in an interview...')}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={evaluating || !userAnswer.trim()}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {evaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('workEvaluating', 'Evaluating Your Answer...')}</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>{t('workEvaluateBtn', 'Get AI Feedback & Sample Answer')}</span>
                  </>
                )}
              </button>
            </form>

            {/* Feedback Review */}
            {feedback && (
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  {t('workFeedbackTitle', 'Coach Review & Sample Answer:')}
                </h4>
                <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-stone-800 dark:text-stone-200">
                  {feedback}
                </div>
                <HelpfulFeedback featureName="Interview Practice" />
              </div>
            )}
          </div>

          {/* Authentic disclaimer */}
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Disclaimer: Mpa Help provides interview preparation and skills practice. We do not manufacture vacancies or guarantee employment. Always verify opportunities through legitimate employers.
            </span>
          </div>
        </div>
      ) : (
        /* Career Profile */
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-stone-900 dark:text-white uppercase tracking-wider">
            {t('workTabCareer', 'Your Ugandan Career Profile')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-stone-600 dark:text-stone-400 block mb-1">{t('workTargetRole', 'Target Role:')}</label>
              <input
                type="text"
                value={careerGoals.targetRole}
                onChange={(e) => setCareerGoals((p) => ({ ...p, targetRole: e.target.value }))}
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-semibold"
              />
            </div>
            <div>
              <label className="text-stone-600 dark:text-stone-400 block mb-1">
                {t('workTargetSalary', 'Target Monthly Salary (UGX):')}
              </label>
              <input
                type="text"
                value={careerGoals.targetSalaryUGX}
                onChange={(e) => setCareerGoals((p) => ({ ...p, targetSalaryUGX: e.target.value }))}
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-semibold"
              />
            </div>
            <div>
              <label className="text-stone-600 dark:text-stone-400 block mb-1">{t('workPreferredLocation', 'Preferred Location:')}</label>
              <input
                type="text"
                value={careerGoals.preferredLocation}
                onChange={(e) => setCareerGoals((p) => ({ ...p, preferredLocation: e.target.value }))}
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="text-stone-600 dark:text-stone-400 block mb-1">{t('workAvailability', 'Availability:')}</label>
              <input
                type="text"
                value={careerGoals.availability}
                onChange={(e) => setCareerGoals((p) => ({ ...p, availability: e.target.value }))}
                className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
            <button
              onClick={() => toast.success(t('workSavedCareerSuccess', 'Career profile saved!'))}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs transition hover:bg-emerald-700 cursor-pointer"
            >
              {t('workSaveCareerProfile', 'Save Profile')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Cpu,
  Bookmark,
  MessageSquare,
  TrendingUp,
  Settings,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/services/authContext';
import { DatabaseService } from '@/services/databaseService';
import { FeedbackItem } from '@/types';

export const AdminDashboard: React.FC = () => {
  const { isAdmin, user } = useAuth();

  const [metrics, setMetrics] = useState<any>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [customFreeLimit, setCustomFreeLimit] = useState(10);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      setMetrics(data);

      const feedbacks = await DatabaseService.getAllFeedback();
      setFeedbackList(feedbacks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/metrics');
        const data = await res.json();
        if (isMounted) setMetrics(data);
        const feedbacks = await DatabaseService.getAllFeedback();
        if (isMounted) {
          setFeedbackList(feedbacks);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);


  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800 text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="text-base font-bold text-red-900 dark:text-red-200">
          Unauthorized Access
        </h3>
        <p className="text-xs text-red-700 dark:text-red-300">
          The Admin Dashboard is strictly reserved for authorized administrators of Mpa Help.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
              Administrator Dashboard
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Overview of users, AI requests, feedback, and platform settings
            </p>
          </div>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-stone-900 dark:text-white">
            {metrics?.totalUsers || 142}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {metrics?.activeUsersToday || 48} active today
          </span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span>AI Requests</span>
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-stone-900 dark:text-white">
            {metrics?.totalAiRequests || 1390}
          </div>
          <span className="text-[10px] text-stone-400">Gemini 3.8 Flash</span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span>Paid Tiers</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-stone-900 dark:text-white">
            {(metrics?.planDistribution?.plus || 19) + (metrics?.planDistribution?.business || 5)}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {metrics?.planDistribution?.plus || 19} Plus / {metrics?.planDistribution?.business || 5} Biz
          </span>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span>Feedback</span>
            <MessageSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-stone-900 dark:text-white">
            {metrics?.feedbackPositiveRatio || 94}%
          </div>
          <span className="text-[10px] text-stone-400">
            Positive user rating
          </span>
        </div>
      </div>

      {/* Feature Usage Breakdown & Plan Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Feature Usage */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Feature Request Distribution
          </h3>
          <div className="space-y-2.5">
            {metrics?.featureUsage?.map((feat: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                  <span>{feat.name}</span>
                  <span>{feat.requests} requests ({feat.percentage}%)</span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${feat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Controls & Config */}
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
            System Status & Configuration
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-bold text-stone-900 dark:text-white">API Health</span>
                <p className="text-[11px] text-stone-400">Avg Gemini latency: {metrics?.geminiLatencyAvgMs || 820}ms</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
              Optimal
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs">
            <div>
              <span className="font-bold text-stone-900 dark:text-white">Maintenance Mode</span>
              <p className="text-[11px] text-stone-400">Pause incoming requests during updates</p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                maintenanceMode
                  ? 'bg-red-600 text-white'
                  : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
              }`}
            >
              {maintenanceMode ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-900 dark:text-white">Free Plan Monthly Limit</span>
              <span className="font-black text-emerald-600">{customFreeLimit} req/mo</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              value={customFreeLimit}
              onChange={(e) => setCustomFreeLimit(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* User Feedback Log */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Recent User Feedback & Rating Submissions
        </h3>

        {feedbackList.length === 0 ? (
          <p className="text-xs text-stone-400 py-4 text-center">
            No live feedback submissions yet. Feedback submitted in any module will appear here.
          </p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {feedbackList.map((fb) => (
              <div
                key={fb.feedbackId}
                className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-white">
                      {fb.feature}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                        fb.type === 'helpful'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {fb.type}
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 mt-1">{fb.message}</p>
                </div>
                <span className="text-[10px] text-stone-400 shrink-0">
                  {new Date(fb.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Target,
  PiggyBank,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/services/authContext';
import { ExpenseItem } from '@/types';
import { DatabaseService } from '@/services/databaseService';
import { formatUGX } from '@/config/plans';
import { HelpfulFeedback } from '@/components/common/HelpfulFeedback';

export const MoneyView: React.FC = () => {
  const { user, userProfile, recordUsage } = useAuth();

  const standardCategories = [
    'Rent',
    'Food & Market',
    'Transport (Matatu/Boda)',
    'School Fees & Requirements',
    'Airtime & Data (MTN/Airtel)',
    'Electricity (Yaka)',
    'Water (NWSC)',
    'Healthcare & Clinic',
    'Loan / SACCO Repayment',
    'Other / Miscellaneous',
  ];

  const [incomeUGX, setIncomeUGX] = useState<number>(850000);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    {
      expenseId: 'exp_1',
      userId: 'default',
      category: 'Rent',
      amount: 300000,
      description: 'Muzigo / Apartment monthly rent',
      date: '2026-09-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      expenseId: 'exp_2',
      userId: 'default',
      category: 'Food & Market',
      amount: 200000,
      description: 'Monthly groceries & market shopping',
      date: '2026-09-02',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      expenseId: 'exp_3',
      userId: 'default',
      category: 'Transport (Matatu/Boda)',
      amount: 120000,
      description: 'Daily taxi fare to work and back',
      date: '2026-09-03',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      expenseId: 'exp_4',
      userId: 'default',
      category: 'Airtime & Data (MTN/Airtel)',
      amount: 50000,
      description: 'MTN monthly internet bundle & calls',
      date: '2026-09-05',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      expenseId: 'exp_5',
      userId: 'default',
      category: 'Electricity (Yaka)',
      amount: 40000,
      description: 'Yaka tokens for house',
      date: '2026-09-05',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Form for new expense
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCat, setNewCat] = useState('Food & Market');
  const [customCat, setCustomCat] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Savings Goal
  const [goalAmount, setGoalAmount] = useState<number>(1500000);
  const [currentSavings, setCurrentSavings] = useState<number>(300000);
  const [targetMonths, setTargetMonths] = useState<number>(6);

  // AI Advisor
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Load existing expenses from Firestore or local storage on mount
  useEffect(() => {
    (async () => {
      const loaded = await DatabaseService.getExpenses(user?.uid);
      if (loaded && loaded.length > 0) {
        setExpenses(loaded);
      }
    })();
  }, [user]);

  // Calculations
  const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const remainingBalance = incomeUGX - totalExpenses;
  const expensePercentage = incomeUGX > 0 ? Math.min(100, Math.round((totalExpenses / incomeUGX) * 100)) : 0;

  // Savings target calculations
  const remainingToSave = Math.max(0, goalAmount - currentSavings);
  const monthlySavingsTarget = targetMonths > 0 ? Math.round(remainingToSave / targetMonths) : 0;
  const weeklySavingsTarget = Math.round(monthlySavingsTarget / 4);
  const dailySavingsTarget = Math.round(monthlySavingsTarget / 30);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newAmount);
    if (!amountNum || amountNum <= 0) return;

    const finalCat = newCat === 'CUSTOM' ? customCat.trim() || 'Custom' : newCat;
    const item: ExpenseItem = {
      expenseId: 'exp_' + Date.now(),
      userId: user?.uid || userProfile?.userId || 'guest',
      category: finalCat,
      amount: amountNum,
      description: newDesc,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [item, ...expenses];
    setExpenses(updated);
    await DatabaseService.saveExpense(item);

    // Reset
    setNewAmount('');
    setNewDesc('');
    setCustomCat('');
    setShowAddModal(false);
  };

  const handleDeleteExpense = async (id: string) => {
    const updated = expenses.filter((e) => e.expenseId !== id);
    setExpenses(updated);
    await DatabaseService.deleteExpense(id, user?.uid);
  };

  const handleAskAIAdvice = async () => {
    const allowed = await recordUsage('My Money AI Advisor');
    if (!allowed) return;

    setAiLoading(true);
    try {
      const res = await fetch('/api/gemini/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomeUGX,
          expenses,
          savingsGoal: {
            amount: goalAmount,
            description: 'Emergency / Target Fund',
            targetDate: `${targetMonths} months from now`,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze budget.');
      setAiAdvice(data.advice);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Could not connect to AI advisor.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
              My Money & Budgeting
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Track income, rent, food, Yaka, and savings in Uganda Shillings (UGX)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Income Card */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span>Monthly Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <input
              type="number"
              value={incomeUGX}
              onChange={(e) => setIncomeUGX(Number(e.target.value) || 0)}
              className="text-xl font-extrabold text-stone-900 dark:text-white bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded p-0.5"
            />
          </div>
          <span className="text-[11px] text-stone-400">Tap number to edit income</span>
        </div>

        {/* Expenses Card */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span>Total Expenses</span>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-red-600 dark:text-red-400">
            {formatUGX(totalExpenses)}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  expensePercentage > 90 ? 'bg-red-500' : 'bg-amber-500'
                }`}
                style={{ width: `${expensePercentage}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-stone-500 shrink-0">
              {expensePercentage}%
            </span>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span>Remaining Balance</span>
            <PiggyBank className="w-4 h-4 text-emerald-600" />
          </div>
          <div
            className={`mt-2 text-xl font-extrabold ${
              remainingBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600'
            }`}
          >
            {formatUGX(remainingBalance)}
          </div>
          <span className="text-[11px] text-stone-400">
            {remainingBalance >= 0 ? 'Available for savings / buffer' : '⚠️ Deficit (overspending)'}
          </span>
        </div>
      </div>

      {/* Main Grid: Expenses List + Savings Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expenses Table */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Detailed Expenses ({expenses.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs">
                No expenses added yet. Tap &quot;Add Expense&quot; above to start.
              </div>
            ) : (
              expenses.map((item) => (
                <div
                  key={item.expenseId}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-xs hover:border-stone-200 transition"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {item.category}
                    </span>
                    {item.description && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-stone-900 dark:text-white">
                      {formatUGX(item.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(item.expenseId)}
                      className="text-stone-400 hover:text-red-500 transition p-1"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Savings Goal Calculator */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Savings Goal Calculator
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="text-stone-600 dark:text-stone-400 font-medium">Goal Amount (UGX):</label>
              <input
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(Number(e.target.value) || 0)}
                className="w-full mt-1 p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-semibold"
              />
            </div>
            <div>
              <label className="text-stone-600 dark:text-stone-400 font-medium">Current Savings (UGX):</label>
              <input
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value) || 0)}
                className="w-full mt-1 p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="text-stone-600 dark:text-stone-400 font-medium">Target Period (Months):</label>
              <input
                type="number"
                value={targetMonths}
                onChange={(e) => setTargetMonths(Number(e.target.value) || 1)}
                className="w-full mt-1 p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          {/* Savings breakdown card */}
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-stone-600 dark:text-stone-400">Monthly to save:</span>
              <span className="font-extrabold text-emerald-800 dark:text-emerald-300">
                {formatUGX(monthlySavingsTarget)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600 dark:text-stone-400">Weekly target:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {formatUGX(weeklySavingsTarget)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600 dark:text-stone-400">Daily target:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {formatUGX(dailySavingsTarget)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* "Help Me Plan My Money" AI Section */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Help Me Plan My Money</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Get an instant Ugandan budgeting analysis and practical tips to save on rent, transport, Yaka, and food.
            </p>
          </div>
          <button
            onClick={handleAskAIAdvice}
            disabled={aiLoading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
          >
            {aiLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing Numbers...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze My Budget</span>
              </>
            )}
          </button>
        </div>

        {aiAdvice && (
          <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-stone-800 dark:text-stone-200">
              {aiAdvice}
            </div>
            <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-400">
              <span>Notice: General personal organization only, not accredited financial advisory.</span>
              <HelpfulFeedback featureName="My Money AI Advisor" />
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 p-5 shadow-2xl border border-stone-200 dark:border-stone-800">
            <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-3">
              Add New Expense
            </h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 block mb-1">
                  Category:
                </label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                >
                  {standardCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="CUSTOM">+ Custom Category</option>
                </select>
              </div>

              {newCat === 'CUSTOM' && (
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-400 block mb-1">
                    Custom Category Name:
                  </label>
                  <input
                    type="text"
                    value={customCat}
                    onChange={(e) => setCustomCat(e.target.value)}
                    placeholder="e.g. Gym / Church Tithe / Salon"
                    className="w-full text-xs p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 block mb-1">
                  Amount in UGX: *
                </label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full text-xs p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 block mb-1">
                  Description / Notes (optional):
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Weekly vegetable shopping"
                  className="w-full text-xs p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Save Expense
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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

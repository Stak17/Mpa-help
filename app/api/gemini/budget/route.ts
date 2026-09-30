import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiContent } from '@/lib/geminiServer';
import { BUDGET_ASSISTANT_SYSTEM_PROMPT } from '@/config/prompts';
import { ExpenseItem } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incomeUGX, expenses, savingsGoal } = body;

    const income = Number(incomeUGX) || 0;
    const expenseList: ExpenseItem[] = expenses || [];
    const totalExpenses = expenseList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const balance = income - totalExpenses;

    const expenseBreakdown = expenseList
      .map((e) => `- ${e.category}: UGX ${Number(e.amount).toLocaleString()} (${e.description || 'no notes'})`)
      .join('\n');

    const promptText = `Please review my personal/household monthly budget in Uganda:

- Monthly Income: UGX ${income.toLocaleString()}
- Total Expenses: UGX ${totalExpenses.toLocaleString()}
- Net Balance remaining: UGX ${balance.toLocaleString()}
${savingsGoal ? `- Savings Goal: UGX ${Number(savingsGoal.amount).toLocaleString()} for "${savingsGoal.description}" by ${savingsGoal.targetDate}` : ''}

Detailed Expenses:
${expenseBreakdown || '- No detailed expenses provided yet.'}

Provide:
1. Quick financial summary (Income vs Expenses ratio and health check).
2. Identified major spending leaks or high proportion items (e.g. Yaka, transport/boda, rent, food).
3. 3 to 4 practical, actionable money-saving tips suited for life in Uganda (e.g. bulk buying, matatu vs boda, Yaka usage, mobile money withdrawal charge minimization, emergency buffer).
4. Concrete advice on reaching the savings goal if provided.
5. Gentle reminder that this is personal budgeting guidance, not accredited financial advisory.`;

    const result = await generateGeminiContent({
      contents: promptText,
      config: {
        systemInstruction: BUDGET_ASSISTANT_SYSTEM_PROMPT,
        temperature: 0.6,
      },
    });

    return NextResponse.json({
      advice: result.text || '',
      summary: {
        income,
        totalExpenses,
        balance,
        expenseRatio: income > 0 ? Math.round((totalExpenses / income) * 100) : 0,
      },
      model: result.model,
    });
  } catch (error: any) {
    console.error('API Gemini Budget error:', error);
    return NextResponse.json(
      { error: 'Could not generate budget advice right now. Please try again.' },
      { status: 500 }
    );
  }
}

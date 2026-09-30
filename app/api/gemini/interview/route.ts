import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiContent } from '@/lib/geminiServer';
import { INTERVIEW_COACH_SYSTEM_PROMPT } from '@/config/prompts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, jobRole, experienceLevel, question, userAnswer } = body;

    let userPrompt = '';

    if (mode === 'generate_questions') {
      userPrompt = `Please generate 4 realistic, high-impact interview questions for a candidate applying for the position of "${jobRole || 'Shop Attendant'}" in Uganda (Level: ${experienceLevel || 'Entry to Mid Level'}).

For each question:
- Write the question clearly.
- Add a 1-sentence tip on what the Ugandan employer or interviewer looks for (e.g. honesty, punctuality, cash handling accuracy, customer patience).`;
    } else if (mode === 'evaluate_answer') {
      userPrompt = `The candidate is interviewing for "${jobRole || 'Customer Service'}".
Question asked: "${question}"
Candidate's answer:
"""
${userAnswer}
"""

Please provide a constructive review:
1. 🌟 Strengths: What was positive, honest, or effective.
2. 💡 Growth Points: What could be improved or added to sound more confident and prepared.
3. 🏆 Exemplary Answer: A polished, natural sample answer that sounds authentic in Uganda.`;
    } else {
      return NextResponse.json({ error: 'Invalid mode provided.' }, { status: 400 });
    }

    const result = await generateGeminiContent({
      contents: userPrompt,
      config: {
        systemInstruction: INTERVIEW_COACH_SYSTEM_PROMPT,
        temperature: 0.6,
      },
    });

    return NextResponse.json({
      result: result.text || '',
      model: result.model,
    });
  } catch (error: any) {
    console.error('API Gemini Interview error:', error);
    return NextResponse.json(
      { error: 'Failed to process interview practice. Please try again.' },
      { status: 500 }
    );
  }
}

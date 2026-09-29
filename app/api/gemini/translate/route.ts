import { NextRequest, NextResponse } from 'next/server';
import { gemini, DEFAULT_GEMINI_MODEL } from '@/lib/geminiServer';
import { TRANSLATOR_SYSTEM_PROMPT } from '@/config/prompts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, from = 'en', to = 'lg' } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text to translate is required.' }, { status: 400 });
    }

    const fromLang = from === 'lg' ? 'Luganda' : 'English';
    const toLang = to === 'lg' ? 'Luganda' : 'English';

    const promptText = `Translate the following text from ${fromLang} to ${toLang}.

Original Text:
"""
${text.trim()}
"""

Provide:
1. The most natural, culturally fluent translation.
2. If there are alternative formal vs. casual ways to say it, provide both.
3. A short helpful note on cultural context, polite nuance, or pronunciation if relevant.
Keep formatting clean and easy to copy.`;

    const response = await gemini.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: promptText,
      config: {
        systemInstruction: TRANSLATOR_SYSTEM_PROMPT,
        temperature: 0.3, // Lower temperature for more faithful translations
      },
    });

    return NextResponse.json({
      translation: response.text || '',
      model: DEFAULT_GEMINI_MODEL,
    });
  } catch (error: any) {
    console.error('API Gemini Translate error:', error);
    return NextResponse.json(
      { error: 'Translation could not be completed. Please try again.' },
      { status: 500 }
    );
  }
}

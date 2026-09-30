import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiContent } from '@/lib/geminiServer';
import { GENERAL_ASSISTANT_SYSTEM_PROMPT } from '@/config/prompts';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  lg: 'Luganda (Oluganda)',
  xog: 'Lusoga (Olusoga)',
  nyn: 'Runyankole-Rukiga',
  ach: 'Acholi / Luo (Leb Lwo)',
  teo: 'Ateso',
  lgg: 'Lugbara (Lugbara ti)',
  sw: 'Swahili (Kiswahili)',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, conversationHistory = [], language = 'en' } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'A question or message is required.' }, { status: 400 });
    }

    if (prompt.length > 4000) {
      return NextResponse.json({ error: 'Message exceeds maximum length of 4,000 characters.' }, { status: 400 });
    }

    const languageName = LANGUAGE_NAMES[language] || 'English';

    const systemInstruction = `${GENERAL_ASSISTANT_SYSTEM_PROMPT}

LANGUAGE INSTRUCTION:
The user has selected their preferred interface language as: ${languageName}.
- When greeting, replying, or offering suggestions, communicate naturally in ${languageName} (or clear bilingual English-${languageName} if helpful for legal/technical clarity).
- Honor authentic Ugandan etiquette, respectful greetings, and economic terms (UGX, MoMo, boda, Yaka, NWSC).`;

    // Format chat history
    const contents: any[] = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const recent = conversationHistory.slice(-10);
      for (const msg of recent) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }
    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt.trim() }],
    });

    const result = await generateGeminiContent({
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = result.text || 'I apologize, but I could not formulate a reply. Please try asking again.';

    return NextResponse.json({
      reply,
      model: result.model,
    });
  } catch (error: any) {
    console.error('API Gemini Assistant error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while contacting Mpa Help AI. Please try again in a moment.' },
      { status: 500 }
    );
  }
}

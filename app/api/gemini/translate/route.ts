import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiContent } from '@/lib/geminiServer';

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
    const { text, from = 'en', to = 'lg' } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text to translate is required.' }, { status: 400 });
    }

    const fromLangName = LANGUAGE_NAMES[from] || from;
    const toLangName = LANGUAGE_NAMES[to] || to;

    const systemPrompt = `You are an expert native linguist and translator specializing in Ugandan languages and East African Swahili.
You have fluent, natural mastery of:
- English
- Luganda (Oluganda - Central Uganda)
- Lusoga (Olusoga - Busoga / Eastern Uganda)
- Runyankole-Rukiga (Western Uganda)
- Acholi / Luo (Leb Lwo - Northern Uganda)
- Ateso (Teso / Eastern Uganda)
- Lugbara (Lugbara ti - West Nile)
- Swahili (Kiswahili - East Africa)

Your translations are:
1. Highly natural, culturally fluent, and contextually accurate.
2. Respectful, preserving authentic greetings, honorifics, and polite manners.
3. Clean and directly usable by everyday people, job seekers, and business owners.`;

    const promptText = `Please translate the following text from ${fromLangName} to ${toLangName}.

Original Text:
"""
${text.trim()}
"""

Provide:
1. **Primary Translation**: The most natural, culturally authentic translation.
2. **Alternative phrasing** (if applicable, e.g. formal vs. casual / respectful greeting).
3. **Short pronunciation or cultural context note** (1-2 brief sentences if helpful).

Keep the formatting clean, clear, and easy to copy.`;

    const result = await generateGeminiContent({
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });

    return NextResponse.json({
      translation: result.text || '',
      model: result.model,
    });
  } catch (error: any) {
    console.error('API Gemini Translate error:', error);
    return NextResponse.json(
      { error: 'Translation could not be completed. Please try again.' },
      { status: 500 }
    );
  }
}

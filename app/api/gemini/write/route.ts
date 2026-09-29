import { NextRequest, NextResponse } from 'next/server';
import { gemini, DEFAULT_GEMINI_MODEL } from '@/lib/geminiServer';
import { DOCUMENT_GENERATOR_SYSTEM_PROMPT } from '@/config/prompts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, fields, tone = 'Professional' } = body;

    if (!category || !fields) {
      return NextResponse.json({ error: 'Category and details are required.' }, { status: 400 });
    }

    const fieldDescriptions = Object.entries(fields)
      .filter(([_, val]) => Boolean(val))
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n');

    const promptText = `Please write a formal/official ${category} document in Uganda.
Tone requested: ${tone}

Information provided:
${fieldDescriptions}

Instructions:
1. Provide a clear, complete, ready-to-use document.
2. Include appropriate formal Ugandan/Commonwealth structure (Date, Sender/Recipient headers, Subject line in bold, respectful salutation, well-structured paragraphs, polite sign-off).
3. Do not invent qualifications or falsehoods. If vital information was omitted, insert clear bracketed placeholders like [Insert Date] or [Insert Company Name].
4. Output only the document text without unnecessary preamble.`;

    const response = await gemini.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: promptText,
      config: {
        systemInstruction: DOCUMENT_GENERATOR_SYSTEM_PROMPT,
        temperature: 0.6,
      },
    });

    const documentText = response.text || '';

    return NextResponse.json({
      document: documentText,
      model: DEFAULT_GEMINI_MODEL,
    });
  } catch (error: any) {
    console.error('API Gemini Write error:', error);
    return NextResponse.json(
      { error: 'Failed to generate document. Please check your connection and try again.' },
      { status: 500 }
    );
  }
}

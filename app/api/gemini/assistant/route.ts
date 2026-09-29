import { NextRequest, NextResponse } from 'next/server';
import { gemini, DEFAULT_GEMINI_MODEL } from '@/lib/geminiServer';
import { GENERAL_ASSISTANT_SYSTEM_PROMPT } from '@/config/prompts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, conversationHistory = [] } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'A question or message is required.' }, { status: 400 });
    }

    if (prompt.length > 4000) {
      return NextResponse.json({ error: 'Message exceeds maximum length of 4,000 characters.' }, { status: 400 });
    }

    // Format chat history
    const contents: any[] = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      // Keep up to last 10 messages for context
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

    const response = await gemini.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: GENERAL_ASSISTANT_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I apologize, but I could not formulate a reply. Please try asking again.';

    return NextResponse.json({
      reply,
      model: DEFAULT_GEMINI_MODEL,
    });
  } catch (error: any) {
    console.error('API Gemini Assistant error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while contacting Mpa Help AI. Please try again in a moment.' },
      { status: 500 }
    );
  }
}

import { GoogleGenAI } from '@google/genai';

// Initialize Gemini on the server side with required telemetry header
export const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite';
export const FALLBACK_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];

export async function generateGeminiContent(params: {
  contents: any;
  config?: any;
  model?: string;
}): Promise<{ text: string; model: string }> {
  const primaryModel = params.model || DEFAULT_GEMINI_MODEL;
  const models = [primaryModel, ...FALLBACK_MODELS.filter((m) => m !== primaryModel)];

  let lastError: any = null;
  for (const m of models) {
    try {
      const response = await gemini.models.generateContent({
        model: m,
        contents: params.contents,
        config: params.config,
      });
      return { text: response.text || '', model: m };
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || String(err);
      if (
        msg.includes('resource_exhausted') ||
        msg.includes('429') ||
        msg.includes('Quota exceeded') ||
        msg.includes('limit:')
      ) {
        console.warn(`Model ${m} reached quota or rate limit, switching to fallback model...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

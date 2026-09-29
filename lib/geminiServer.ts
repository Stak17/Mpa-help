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

export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

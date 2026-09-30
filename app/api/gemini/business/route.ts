import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiContent } from '@/lib/geminiServer';
import { BUSINESS_MARKETING_SYSTEM_PROMPT } from '@/config/prompts';
import { BusinessProfileItem } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, requestType, customDetails, existingAd } = body;

    const bz: BusinessProfileItem = profile || {};

    let userPrompt = '';

    if (requestType === 'improve_ad') {
      userPrompt = `Please critique and improve the following advertisement for a Ugandan business:
Business Name: ${bz.businessName || 'Ugandan Business'}
Location: ${bz.location || 'Kampala, Uganda'}
Current Ad Text:
"""
${existingAd || customDetails}
"""

Please provide:
1. Short critique: What works well and what hurts sales.
2. Improved Version A (Catchy WhatsApp status / broadcast with emojis, prices, and clear call-to-action).
3. Improved Version B (Short punchy Facebook / Instagram caption).`;
    } else {
      userPrompt = `Please generate high-converting marketing content for the following business in Uganda:

Business Information:
- Business Name: ${bz.businessName}
- Category: ${bz.category}
- Location: ${bz.location}
- Products / Services: ${bz.description}
- Contact / WhatsApp: ${bz.phone || 'Available via WhatsApp / Direct Call'}
- Specific Focus / Offer: ${customDetails || 'General promotion of top products and reliable customer service'}

Task Requested: ${requestType} (e.g. WhatsApp advert, Facebook post, TikTok video script, Instagram caption, Customer reply template, or 7-day marketing plan).

Instructions:
- Tailor the tone to appeal to everyday customers in Uganda.
- Make it ready to copy and post directly.
- Include appropriate emojis, catchy hooks, and phone/location placeholders.`;
    }

    const result = await generateGeminiContent({
      contents: userPrompt,
      config: {
        systemInstruction: BUSINESS_MARKETING_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return NextResponse.json({
      content: result.text || '',
      model: result.model,
    });
  } catch (error: any) {
    console.error('API Gemini Business error:', error);
    return NextResponse.json(
      { error: 'Failed to generate business content. Please try again.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { gemini, DEFAULT_GEMINI_MODEL } from '@/lib/geminiServer';
import { CV_GENERATOR_SYSTEM_PROMPT } from '@/config/prompts';
import { CVData } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cvData: CVData = body.cvData;

    if (!cvData || !cvData.fullName) {
      return NextResponse.json({ error: 'Personal details are required.' }, { status: 400 });
    }

    const educationFormatted = cvData.education
      .map((e) => `- ${e.degreeOrCertificate} at ${e.institution} (${e.startYear} - ${e.endYear})`)
      .join('\n');

    const experienceFormatted = cvData.experience
      .map(
        (exp) =>
          `- ${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate}):\n  Responsibilities: ${exp.responsibilities}`
      )
      .join('\n');

    const referencesFormatted = cvData.references
      .map((r) => `- ${r.name}, ${r.role} at ${r.organization} (${r.phoneOrEmail})`)
      .join('\n');

    const promptText = `Please generate an organized, polished Curriculum Vitae (CV) for the following candidate in Uganda:

Candidate Details:
- Full Name: ${cvData.fullName}
- Contact Phone: ${cvData.phone || '[Insert Phone]'}
- Contact Email: ${cvData.email || '[Insert Email]'}
- Location: ${cvData.location || 'Kampala, Uganda'}
- Professional Summary: ${cvData.professionalSummary || '[Insert brief career objective]'}

Education:
${educationFormatted || '[No formal education listed]'}

Work Experience:
${experienceFormatted || '[No prior work experience listed - highlight skills & readiness]'}

Key Skills:
${cvData.skills.length > 0 ? cvData.skills.join(', ') : '[Insert key transferable skills]'}

Languages:
${cvData.languages.length > 0 ? cvData.languages.join(', ') : 'English, Luganda'}

Referees / References:
${referencesFormatted || 'Available upon request.'}

Selected Template Style: ${cvData.templateStyle}

Format instructions:
- Output clean, professional markdown with headings, bold labels, and bullet points.
- Do not make up qualifications or past employers.
- Ensure contact details and sections are laid out with dignity and clarity.`;

    const response = await gemini.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: promptText,
      config: {
        systemInstruction: CV_GENERATOR_SYSTEM_PROMPT,
        temperature: 0.5,
      },
    });

    return NextResponse.json({
      cvText: response.text || '',
      model: DEFAULT_GEMINI_MODEL,
    });
  } catch (error: any) {
    console.error('API Gemini CV error:', error);
    return NextResponse.json(
      { error: 'Failed to create CV. Please try again.' },
      { status: 500 }
    );
  }
}

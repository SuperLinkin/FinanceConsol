import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import OpenAI from 'openai';

/**
 * POST /api/ai-assist
 * AI-powered text generation for note descriptions
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { prompt, context, mode } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build system message based on mode
    let systemMessage = '';
    if (mode === 'generate') {
      systemMessage = `You are a professional financial reporting assistant. Generate clear, concise, and professional note descriptions for financial statements.

Focus on:
- Clear explanation of the note's purpose
- Accounting policies applied
- Material disclosures
- Professional financial reporting language
- Compliance with IFRS/GAAP standards where applicable

Keep the response factual and professional.`;
    } else if (mode === 'enhance') {
      systemMessage = `You are a professional financial reporting assistant. Enhance the provided text to make it more professional, clear, and compliant with financial reporting standards.

Focus on:
- Improving clarity and readability
- Using appropriate financial terminology
- Ensuring professional tone
- Maintaining accuracy of the original content
- Compliance with IFRS/GAAP standards

Keep the enhanced version concise and professional.`;
    } else if (mode === 'summarize') {
      systemMessage = `You are a professional financial reporting assistant. Summarize the provided text into a concise, clear summary suitable for financial statement notes.

Focus on:
- Key points and material information
- Professional financial language
- Brevity while maintaining accuracy
- Compliance with disclosure requirements`;
    }

    // Add context if provided
    let userMessage = prompt;
    if (context) {
      userMessage = `Context:\n${JSON.stringify(context, null, 2)}\n\nRequest: ${prompt}`;
    }

    console.log('🤖 Calling OpenAI for AI assist...');
    console.log('Mode:', mode);
    console.log('Prompt:', prompt);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const generatedText = completion.choices[0]?.message?.content || '';

    console.log('✅ AI assist response generated');

    return NextResponse.json({
      success: true,
      text: generatedText,
      mode: mode,
    });

  } catch (error) {
    console.error('Error in /api/ai-assist:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

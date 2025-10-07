import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { messages, systemPrompt } = await request.json();

    // Build the final system message
    const finalSystemPrompt = systemPrompt || `You are a helpful assistant for ConsolidatePro, an IFRS financial consolidation platform.

Answer questions about:
- How to set up entities and organizational structures
- Uploading trial balances and chart of accounts
- Creating eliminations and manual entries
- Generating consolidation workings
- Building financial reports
- Using the IFRS 4-level COA hierarchy
- Bulk upload features
- Validation checks
- Export capabilities

Be concise, friendly, and practical. Focus on step-by-step guidance.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: finalSystemPrompt },
        ...messages
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const assistantMessage = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      response: assistantMessage,
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get AI response',
    }, { status: 500 });
  }
}

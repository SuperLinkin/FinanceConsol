import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { requireAuth } from '@/lib/apiAuth';
import { withRateLimit } from '@/lib/rateLimit';
import { errorResponse, validationError, successResponse } from '@/lib/errorHandler';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validation schema
const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(2000),
  })).min(1).max(20),
  systemPrompt: z.string().max(1000).optional(),
});

export async function POST(request) {
  return requireAuth(request, async (req, user) => {
    return withRateLimit(req, user.userId, 'ai', async () => {
      try {
        // Parse and validate input
        const body = await req.json();
        const validation = requestSchema.safeParse(body);

        if (!validation.success) {
          return validationError(validation.error.errors);
        }

        const { messages, systemPrompt } = validation.data;

        // Sanitize messages to prevent prompt injection
        const sanitizedMessages = messages.map(msg => ({
          ...msg,
          content: msg.content.replace(/[<>]/g, ''), // Basic sanitization
        }));

        // Build the final system message
        const finalSystemPrompt = systemPrompt || `You are a helpful assistant for CLOE (Close Optimization Engine), an IFRS financial consolidation platform.

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
            ...sanitizedMessages
          ],
          temperature: 0.3,
          max_tokens: 800,
        });

        const assistantMessage = completion.choices[0].message.content;

        return successResponse({
          success: true,
          response: assistantMessage,
        });

      } catch (error) {
        return errorResponse(error);
      }
    });
  });
}

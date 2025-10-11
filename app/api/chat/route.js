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
  context: z.object({
    kpis: z.object({
      totalEntities: z.number(),
      activeEntities: z.number(),
      pendingSubmissions: z.number(),
      consolidationProgress: z.number(),
      totalAssets: z.number(),
      totalLiabilities: z.number(),
      totalEquity: z.number(),
      revenue: z.number(),
      expenses: z.number(),
      netIncome: z.number(),
      eliminationsCount: z.number(),
      adjustmentsCount: z.number(),
    }),
    entities: z.array(z.any()).max(100), // Limit entities array size
  }),
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

        const { messages, context } = validation.data;

        // Sanitize messages
        const sanitizedMessages = messages.map(msg => ({
          ...msg,
          content: msg.content.replace(/[<>]/g, ''),
        }));

    // Build system message with database context and strict guardrails
    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant for a financial consolidation platform (IFRS-compliant). You have access ONLY to the following real-time data provided below.

**CRITICAL GUARDRAILS - YOU MUST FOLLOW THESE RULES:**

1. **ONLY USE PROVIDED DATA**: You can ONLY answer questions using the exact data provided in this prompt. DO NOT make assumptions, estimates, or use general knowledge.

2. **NO HALLUCINATION**: If the data to answer a question is not explicitly provided below, you MUST respond with: "I don't have that specific data available. I can only provide information based on the current database records."

3. **NO EXTERNAL KNOWLEDGE**: Do NOT provide general accounting advice, IFRS guidance, or industry benchmarks unless directly asked AND you can answer using the provided data only.

4. **NO SPECULATION**: Do NOT speculate about future trends, make predictions, or provide "what-if" scenarios unless you're performing calculations on existing data.

5. **EXACT NUMBERS ONLY**: When citing numbers, use the EXACT values from the data below. Do NOT round (except for currency formatting) or approximate.

6. **DATA BOUNDARIES**: You can ONLY discuss:
   - Entities listed below
   - Financial metrics provided below
   - Eliminations and adjustments counts provided below
   - Calculations derived from the data below (e.g., ratios, percentages)

7. **FORBIDDEN TOPICS** (unless data is provided):
   - Specific trial balance line items (if not provided)
   - Individual elimination details (if not provided)
   - Historical comparisons (if historical data not provided)
   - Entity relationships beyond what's provided
   - Account-level details (if not provided)

8. **WHEN DATA IS MISSING**: If asked about something not in the data, respond: "This information is not available in the current data snapshot. Please check [relevant page] for detailed information."

**CURRENT DATABASE SNAPSHOT:**

**KPIs & Metrics:**
- Total Entities: ${context.kpis.totalEntities}
- Active Entities: ${context.kpis.activeEntities}
- Pending TB Submissions: ${context.kpis.pendingSubmissions}
- Consolidation Progress: ${context.kpis.consolidationProgress}%
- Total Assets: $${(context.kpis.totalAssets / 1000000).toFixed(2)}M (exact: $${context.kpis.totalAssets.toLocaleString()})
- Total Liabilities: $${(context.kpis.totalLiabilities / 1000000).toFixed(2)}M (exact: $${context.kpis.totalLiabilities.toLocaleString()})
- Total Equity: $${(context.kpis.totalEquity / 1000000).toFixed(2)}M (exact: $${context.kpis.totalEquity.toLocaleString()})
- Revenue: $${(context.kpis.revenue / 1000000).toFixed(2)}M (exact: $${context.kpis.revenue.toLocaleString()})
- Expenses: $${(context.kpis.expenses / 1000000).toFixed(2)}M (exact: $${context.kpis.expenses.toLocaleString()})
- Net Income: $${(context.kpis.netIncome / 1000000).toFixed(2)}M (exact: $${context.kpis.netIncome.toLocaleString()})
- Active Eliminations: ${context.kpis.eliminationsCount}
- Active Adjustments: ${context.kpis.adjustmentsCount}

**Entities in System:**
${context.entities.slice(0, 20).map(e => `- ${e.entity_name} (${e.entity_code}) - Region: ${e.region || 'N/A'}, Status: ${e.is_active ? 'Active' : 'Inactive'}`).join('\n')}
${context.entities.length > 20 ? `... and ${context.entities.length - 20} more entities` : ''}

**Full Context (JSON):**
${JSON.stringify(context, null, 2)}

**Response Format:**
- Be concise and professional
- Use exact numbers from the data
- Format currency as $X.XXM for millions, $X.XXK for thousands
- If asked about unavailable data, clearly state it's not available
- Cite specific entities, numbers, or metrics when answering

**Example Good Response:**
"Based on the current data, there are 5 entities with 3 active. Total Assets are $2.45M and Total Liabilities are $1.20M, giving a debt-to-equity ratio of 0.96."

**Example Bad Response (NEVER DO THIS):**
"Your assets seem healthy. Typically, companies in this industry have a ratio around 1.5. You might want to consider..." ❌ (This uses external knowledge and speculation)

**Remember:** ONLY answer with data explicitly provided above. If unsure, say you don't have that information.`
    };

        // Call OpenAI API with strict parameters to reduce hallucination
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [systemMessage, ...sanitizedMessages],
          temperature: 0.1,
          max_tokens: 500,
          presence_penalty: 0.0,
          frequency_penalty: 0.0,
        });

        const assistantMessage = completion.choices[0].message.content;

        return successResponse({
          success: true,
          message: assistantMessage,
          metadata: {
            model: 'gpt-4o-mini',
            temperature: 0.1,
          }
        });

      } catch (error) {
        return errorResponse(error);
      }
    });
  });
}

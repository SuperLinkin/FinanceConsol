import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/apiAuth';
import { errorResponse, validationError, successResponse } from '@/lib/errorHandler';

// Validation schema
const postSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/),
  statement_type: z.enum(['balance_sheet', 'income_statement', 'cash_flow']).optional(),
  created_by: z.string().optional(),
});

/**
 * POST /api/consolidation/generate
 * Auto-generates consolidation workings based on COA master hierarchy
 */
export async function POST(request) {
  return requireAuth(request, async (req, user) => {
    try {
      const body = await req.json();
      const validation = postSchema.safeParse(body);

      if (!validation.success) {
        return validationError(validation.error.errors);
      }

      const { period, statement_type } = validation.data;
      const created_by = user.email || 'System';

    // If statement_type provided, create single working
    if (statement_type) {
      const { data, error } = await supabase.rpc('create_consolidation_working', {
        p_period: period,
        p_statement_type: statement_type,
        p_created_by: created_by || 'System'
      });

        if (error) {
          return errorResponse(error);
        }

        return successResponse({
          success: true,
          working_id: data,
          statement_type,
          message: `Consolidation working created for ${statement_type}`
        });
      }

      // Otherwise, initialize all workings for the period
      const { data, error } = await supabase.rpc('initialize_period_workings', {
        p_period: period,
        p_created_by: created_by
      });

      if (error) {
        return errorResponse(error);
      }

      return successResponse({
        success: true,
        workings: data,
        message: `Initialized ${data?.length || 0} workings for period ${period}`
      });
    } catch (error) {
      return errorResponse(error);
    }
  });
}

/**
 * GET /api/consolidation/generate?period=2024-01&statement_type=balance_sheet
 * Generates line items structure preview (doesn't save)
 */
export async function GET(request) {
  return requireAuth(request, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const statement_type = searchParams.get('statement_type') || 'balance_sheet';

      // Call function to generate line items structure
      const { data, error } = await supabase.rpc('generate_consolidation_line_items', {
        p_statement_type: statement_type
      });

      if (error) {
        return errorResponse(error);
      }

      return successResponse({
        success: true,
        statement_type,
        line_items: data
      });
    } catch (error) {
      return errorResponse(error);
    }
  });
}

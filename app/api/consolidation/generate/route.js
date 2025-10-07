import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * POST /api/consolidation/generate
 * Auto-generates consolidation workings based on COA master hierarchy
 */
export async function POST(request) {
  try {
    const { period, statement_type, created_by } = await request.json();

    if (!period) {
      return NextResponse.json(
        { success: false, error: 'Period is required' },
        { status: 400 }
      );
    }

    // If statement_type provided, create single working
    if (statement_type) {
      const { data, error } = await supabase.rpc('create_consolidation_working', {
        p_period: period,
        p_statement_type: statement_type,
        p_created_by: created_by || 'System'
      });

      if (error) {
        console.error('Error creating consolidation working:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        working_id: data,
        statement_type,
        message: `Consolidation working created for ${statement_type}`
      });
    }

    // Otherwise, initialize all workings for the period
    const { data, error } = await supabase.rpc('initialize_period_workings', {
      p_period: period,
      p_created_by: created_by || 'System'
    });

    if (error) {
      console.error('Error initializing period workings:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      workings: data,
      message: `Initialized ${data?.length || 0} workings for period ${period}`
    });
  } catch (error) {
    console.error('Error in generate API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/consolidation/generate?period=2024-01&statement_type=balance_sheet
 * Generates line items structure preview (doesn't save)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const statement_type = searchParams.get('statement_type') || 'balance_sheet';

    // Call function to generate line items structure
    const { data, error } = await supabase.rpc('generate_consolidation_line_items', {
      p_statement_type: statement_type
    });

    if (error) {
      console.error('Error generating line items:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      statement_type,
      line_items: data
    });
  } catch (error) {
    console.error('Error in generate preview API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

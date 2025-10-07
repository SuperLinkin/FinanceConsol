import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * GET /api/consolidation/test
 * Diagnostic endpoint to test consolidation generator
 */
export async function GET(request) {
  const tests = [];

  try {
    // Test 1: Check COA Master Hierarchy
    const { count: coaCount, error: coaError } = await supabase
      .from('coa_master_hierarchy')
      .select('*', { count: 'exact', head: true });

    tests.push({
      name: 'COA Master Hierarchy',
      passed: !coaError,
      count: coaCount || 0,
      error: coaError?.message
    });

    // Test 2: Check if functions exist
    const { data: functionsData, error: functionsError } = await supabase.rpc(
      'generate_consolidation_line_items',
      { p_statement_type: 'balance_sheet' }
    );

    tests.push({
      name: 'Generate Line Items Function',
      passed: !functionsError,
      hasData: functionsData ? functionsData.length > 0 : false,
      error: functionsError?.message
    });

    // Test 3: Check chart_of_accounts
    const { count: coaDataCount, error: coaErr } = await supabase
      .from('chart_of_accounts')
      .select('*', { count: 'exact', head: true });

    tests.push({
      name: 'Chart of Accounts',
      passed: !coaErr,
      count: coaDataCount || 0,
      error: coaErr?.message
    });

    // Test 4: Check consolidation_workings table
    const { count: workingsCount, error: workingsErr } = await supabase
      .from('consolidation_workings')
      .select('*', { count: 'exact', head: true });

    tests.push({
      name: 'Consolidation Workings',
      passed: !workingsErr,
      count: workingsCount || 0,
      error: workingsErr?.message
    });

    // Test 5: Try to create a test working
    const { data: createData, error: createError } = await supabase.rpc(
      'create_consolidation_working',
      {
        p_period: 'DIAGNOSTIC-TEST',
        p_statement_type: 'balance_sheet',
        p_created_by: 'System Test'
      }
    );

    tests.push({
      name: 'Create Test Working',
      passed: !createError,
      workingId: createData,
      error: createError?.message
    });

    // Cleanup test working
    if (createData) {
      await supabase
        .from('consolidation_workings')
        .delete()
        .eq('id', createData);
    }

    return NextResponse.json({
      success: true,
      tests,
      summary: {
        total: tests.length,
        passed: tests.filter(t => t.passed).length,
        failed: tests.filter(t => !t.passed).length
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      tests
    }, { status: 500 });
  }
}

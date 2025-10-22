import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

/**
 * GET /api/consolidation/logs?period=2024-12-31&statement_type=balance_sheet
 * Gets consolidation save logs
 */
export async function GET(request) {
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

    console.log('🔐 Session payload:', {
      userId: payload.userId,
      companyId: payload.companyId,
      email: payload.email
    });

    if (!payload.companyId) {
      return NextResponse.json({ error: 'Company ID missing from session' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const statement_type = searchParams.get('statement_type');

    // CRITICAL: Filter by company_id for multi-tenancy security
    let query = supabaseAdmin
      .from('consolidation_logs')
      .select('*')
      .eq('company_id', payload.companyId)
      .order('saved_at', { ascending: false });

    if (period) {
      query = query.eq('period', period);
    }

    if (statement_type) {
      query = query.eq('statement_type', statement_type);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error('Error fetching consolidation logs:', error);
      throw error;
    }

    return NextResponse.json(data || []);

  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

// GET - Fetch all chart of accounts records for the user's company
export async function GET() {
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

    console.log('[API /chart-of-accounts GET] Fetching COA for company', payload.companyId);

    // Fetch entities for this company first
    const { data: entities, error: entitiesError } = await supabaseAdmin
      .from('entities')
      .select('id')
      .eq('company_id', payload.companyId);

    if (entitiesError) {
      console.error('[API /chart-of-accounts GET] Error fetching entities:', entitiesError);
      return NextResponse.json({ error: entitiesError.message }, { status: 500 });
    }

    const entityIds = entities?.map(e => e.id) || [];

    if (entityIds.length === 0) {
      console.log('[API /chart-of-accounts GET] No entities found for company');
      return NextResponse.json([]);
    }

    // Fetch chart of accounts for these entities OR with NULL entity_id (company-wide)
    const { data, error } = await supabaseAdmin
      .from('chart_of_accounts')
      .select('*')
      .or(`entity_id.in.(${entityIds.join(',')}),entity_id.is.null`)
      .eq('is_active', true)
      .order('account_code');

    if (error) {
      console.error('[API /chart-of-accounts GET] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API /chart-of-accounts GET] Found', data?.length || 0, 'COA records');
    return NextResponse.json(data || []);

  } catch (error) {
    console.error('Error in GET /api/chart-of-accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

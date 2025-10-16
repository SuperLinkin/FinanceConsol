import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch all active world currencies (no auth required for this reference data)
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    console.log('[API /api/world-currencies GET] Fetching world currencies');

    // Fetch world currencies using admin client
    const { data, error } = await supabaseAdmin
      .from('world_currencies')
      .select('*')
      .eq('is_active', true)
      .order('currency_name');

    if (error) {
      console.error('[API /api/world-currencies GET] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[API /api/world-currencies GET] Found ${data?.length || 0} currencies`);

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('[API /api/world-currencies GET] Exception:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

// POST - Set a currency as the base currency for the user's company
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

    const { currencyCode } = await request.json();

    if (!currencyCode) {
      return NextResponse.json({ error: 'Currency code required' }, { status: 400 });
    }

    console.log(`[API /api/company-currencies/set-base] Setting ${currencyCode} as base currency for company ${payload.companyId}...`);

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // First, unset any existing base currency for this company
    const { error: unsetError } = await supabaseAdmin
      .from('company_currencies')
      .update({ is_base_currency: false })
      .eq('company_id', payload.companyId)
      .eq('is_base_currency', true);

    if (unsetError) {
      console.error('[API /api/company-currencies/set-base] Error unsetting previous base:', unsetError);
      return NextResponse.json({ error: unsetError.message }, { status: 500 });
    }

    // Set the new base currency
    const { data, error: setError } = await supabaseAdmin
      .from('company_currencies')
      .update({ is_base_currency: true })
      .eq('company_id', payload.companyId)
      .eq('currency_code', currencyCode)
      .select();

    if (setError) {
      console.error('[API /api/company-currencies/set-base] Error setting new base:', setError);
      return NextResponse.json({ error: setError.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Currency not found in company currencies' }, { status: 404 });
    }

    // Also update the companies table base_currency for backward compatibility
    const { error: companyUpdateError } = await supabaseAdmin
      .from('companies')
      .update({ base_currency: currencyCode })
      .eq('id', payload.companyId);

    if (companyUpdateError) {
      console.error('[API /api/company-currencies/set-base] Warning: Could not update companies table:', companyUpdateError);
      // Don't fail the request, this is just for backward compatibility
    }

    console.log(`[API /api/company-currencies/set-base] Successfully set ${currencyCode} as base currency for company ${payload.companyId}`);

    return NextResponse.json({ success: true, baseCurrency: currencyCode });
  } catch (error) {
    console.error('[API /api/company-currencies/set-base] Exception:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}

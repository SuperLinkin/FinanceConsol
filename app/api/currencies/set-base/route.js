import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

// POST - Set a currency as the group reporting currency (base) for the user's company
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

    console.log(`[API /api/currencies/set-base] Setting ${currencyCode} as base currency for company ${payload.companyId}...`);

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Verify the currency exists
    const { data: currency, error: currencyError } = await supabaseAdmin
      .from('currencies')
      .select('currency_code')
      .eq('currency_code', currencyCode)
      .single();

    if (currencyError || !currency) {
      console.error('[API /api/currencies/set-base] Currency not found:', currencyError);
      return NextResponse.json({ error: 'Currency not found' }, { status: 404 });
    }

    // Update the company's base_currency
    const { error: updateError } = await supabaseAdmin
      .from('companies')
      .update({ base_currency: currencyCode })
      .eq('id', payload.companyId);

    if (updateError) {
      console.error('[API /api/currencies/set-base] Error updating company:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log(`[API /api/currencies/set-base] Successfully set ${currencyCode} as base currency for company ${payload.companyId}`);

    return NextResponse.json({ success: true, baseCurrency: currencyCode });
  } catch (error) {
    console.error('[API /api/currencies/set-base] Exception:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}

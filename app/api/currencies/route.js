import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

// POST - Add a new currency (currencies table is global, no company_id)
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

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const currencyData = await request.json();

    // Validate required fields
    if (!currencyData.currency_code || !currencyData.currency_name) {
      return NextResponse.json({ error: 'Currency code and name are required' }, { status: 400 });
    }

    console.log('[API /api/currencies POST] Adding currency:', currencyData.currency_code);

    // Insert currency using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('currencies')
      .insert([{
        currency_code: currencyData.currency_code,
        currency_name: currencyData.currency_name,
        symbol: currencyData.symbol,
        is_presentation_currency: currencyData.is_presentation_currency || false,
        is_functional_currency: currencyData.is_functional_currency || false,
        is_group_reporting_currency: false, // No longer used, keeping for backward compatibility
        exchange_rate: currencyData.exchange_rate || 1.0,
        rate_date: new Date().toISOString(),
        is_active: true
      }])
      .select();

    if (error) {
      console.error('[API /api/currencies POST] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API /api/currencies POST] Currency added successfully');

    return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
  } catch (error) {
    console.error('[API /api/currencies POST] Exception:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}

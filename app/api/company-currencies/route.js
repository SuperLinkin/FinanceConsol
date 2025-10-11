import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

// GET - Fetch all currencies for the user's company
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

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    console.log(`[API /api/company-currencies GET] Fetching currencies for company ${payload.companyId}`);

    // Fetch company-specific currencies
    const { data, error } = await supabaseAdmin
      .from('company_currencies')
      .select('*')
      .eq('company_id', payload.companyId)
      .order('currency_code');

    if (error) {
      console.error('[API /api/company-currencies GET] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[API /api/company-currencies GET] Found ${data?.length || 0} currencies`);

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('[API /api/company-currencies GET] Exception:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}

// POST - Add a new currency to the user's company
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

    console.log(`[API /api/company-currencies POST] Adding currency ${currencyData.currency_code} for company ${payload.companyId}`);

    // Insert currency for the company
    const { data, error } = await supabaseAdmin
      .from('company_currencies')
      .insert([{
        company_id: payload.companyId,
        currency_code: currencyData.currency_code,
        currency_name: currencyData.currency_name,
        symbol: currencyData.symbol,
        is_base_currency: currencyData.is_base_currency || false,
        is_presentation_currency: currencyData.is_presentation_currency || false,
        is_functional_currency: currencyData.is_functional_currency || false,
        exchange_rate: currencyData.exchange_rate || 1.0,
        rate_date: new Date().toISOString(),
        is_active: true
      }])
      .select();

    if (error) {
      console.error('[API /api/company-currencies POST] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API /api/company-currencies POST] Currency added successfully');

    return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
  } catch (error) {
    console.error('[API /api/company-currencies POST] Exception:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}

// PUT - Update an existing currency for the user's company
export async function PUT(request) {
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

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Currency ID required' }, { status: 400 });
    }

    console.log(`[API /api/company-currencies PUT] Updating currency ${id} for company ${payload.companyId}`);

    // Update currency for the company
    const { data, error } = await supabaseAdmin
      .from('company_currencies')
      .update(updateData)
      .eq('id', id)
      .eq('company_id', payload.companyId)
      .select();

    if (error) {
      console.error('[API /api/company-currencies PUT] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Currency not found or unauthorized' }, { status: 404 });
    }

    console.log('[API /api/company-currencies PUT] Currency updated successfully');

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('[API /api/company-currencies PUT] Exception:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}

// DELETE - Remove a currency from the user's company
export async function DELETE(request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Currency ID required' }, { status: 400 });
    }

    console.log(`[API /api/company-currencies DELETE] Deleting currency ${id} for company ${payload.companyId}`);

    // Check if this is the base currency
    const { data: currency } = await supabaseAdmin
      .from('company_currencies')
      .select('is_base_currency')
      .eq('id', id)
      .eq('company_id', payload.companyId)
      .single();

    if (currency?.is_base_currency) {
      return NextResponse.json({
        error: 'Cannot delete base currency. Please set another currency as base first.'
      }, { status: 400 });
    }

    // Delete currency
    const { error } = await supabaseAdmin
      .from('company_currencies')
      .delete()
      .eq('id', id)
      .eq('company_id', payload.companyId);

    if (error) {
      console.error('[API /api/company-currencies DELETE] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API /api/company-currencies DELETE] Currency deleted successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /api/company-currencies DELETE] Exception:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}

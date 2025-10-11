import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

// GET - Fetch all trial balance records for the user's company
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

    // Fetch entities for this company to filter trial balances
    const { data: entities } = await supabaseAdmin
      .from('entities')
      .select('id')
      .eq('company_id', payload.companyId);

    const entityIds = entities?.map(e => e.id) || [];

    if (entityIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch trial balances for these entities
    const { data, error } = await supabaseAdmin
      .from('trial_balance')
      .select('*')
      .in('entity_id', entityIds)
      .order('period', { ascending: false })
      .order('account_code');

    if (error) {
      console.error('Error fetching trial balances:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);

  } catch (error) {
    console.error('Error in GET /api/trial-balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Bulk insert trial balance records
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

    const { records, entity_id, period } = await request.json();

    if (!records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Invalid records data' }, { status: 400 });
    }

    // Verify all entity_ids belong to user's company
    const entityIds = [...new Set(records.map(r => r.entity_id))];

    const { data: entities } = await supabaseAdmin
      .from('entities')
      .select('id, company_id')
      .in('id', entityIds);

    // Check all entities belong to user's company
    const unauthorized = entities?.some(e => e.company_id !== payload.companyId);
    if (unauthorized || !entities || entities.length !== entityIds.length) {
      return NextResponse.json({ error: 'Unauthorized: One or more entities do not belong to your company' }, { status: 403 });
    }

    // If entity_id and period provided, delete existing records first (for upsert behavior)
    if (entity_id && period) {
      const { error: deleteError } = await supabaseAdmin
        .from('trial_balance')
        .delete()
        .eq('entity_id', entity_id)
        .eq('period', period);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return NextResponse.json({ error: `Failed to clear existing records: ${deleteError.message}` }, { status: 500 });
      }
    }

    // Insert new records
    const { data, error } = await supabaseAdmin
      .from('trial_balance')
      .insert(records)
      .select();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      data
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/trial-balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a single trial balance record
export async function PATCH(request) {
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

    const { id, debit, credit } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // First, get the trial balance record to verify ownership
    const { data: tbRecord, error: fetchError } = await supabaseAdmin
      .from('trial_balance')
      .select('entity_id')
      .eq('id', id)
      .single();

    if (fetchError || !tbRecord) {
      return NextResponse.json({ error: 'Trial balance record not found' }, { status: 404 });
    }

    // Verify the entity belongs to user's company
    const { data: entity } = await supabaseAdmin
      .from('entities')
      .select('company_id')
      .eq('id', tbRecord.entity_id)
      .single();

    if (!entity || entity.company_id !== payload.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the record
    const { data, error } = await supabaseAdmin
      .from('trial_balance')
      .update({
        debit: parseFloat(debit) || 0,
        credit: parseFloat(credit) || 0
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error in PATCH /api/trial-balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete trial balance records by entity and period
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

    const { searchParams } = new URL(request.url);
    const entityIds = searchParams.get('entity_ids')?.split(',');
    const period = searchParams.get('period');

    if (!entityIds || !period) {
      return NextResponse.json({ error: 'entity_ids and period required' }, { status: 400 });
    }

    // Verify all entity_ids belong to user's company
    const { data: entities } = await supabaseAdmin
      .from('entities')
      .select('id, company_id')
      .in('id', entityIds);

    const unauthorized = entities?.some(e => e.company_id !== payload.companyId);
    if (unauthorized || !entities || entities.length !== entityIds.length) {
      return NextResponse.json({ error: 'Unauthorized: One or more entities do not belong to your company' }, { status: 403 });
    }

    // Delete records
    const { error } = await supabaseAdmin
      .from('trial_balance')
      .delete()
      .in('entity_id', entityIds)
      .eq('period', period);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/trial-balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

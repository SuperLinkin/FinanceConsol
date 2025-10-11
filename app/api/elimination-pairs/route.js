import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

// GET - Fetch all GL pairs for the user's company
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

    console.log('[API /elimination-pairs GET] Fetching pairs for company', payload.companyId);

    const { data, error } = await supabaseAdmin
      .from('elimination_gl_pairs')
      .select('*')
      .eq('company_id', payload.companyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API /elimination-pairs GET] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API /elimination-pairs GET] Found', data?.length || 0, 'pairs');
    return NextResponse.json(data || []);

  } catch (error) {
    console.error('Error in GET /api/elimination-pairs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new GL pair
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

    const body = await request.json();
    const { pair_name, description, gl1_entity, gl1_code, gl2_entity, gl2_code, difference_gl_code } = body;

    if (!pair_name || !gl1_entity || !gl1_code || !gl2_entity || !gl2_code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify both entities belong to user's company
    const { data: entities } = await supabaseAdmin
      .from('entities')
      .select('id, company_id')
      .in('id', [gl1_entity, gl2_entity]);

    const unauthorized = entities?.some(e => e.company_id !== payload.companyId);
    if (unauthorized || !entities || entities.length !== 2) {
      return NextResponse.json({ error: 'Unauthorized: Entities do not belong to your company' }, { status: 403 });
    }

    console.log('[API /elimination-pairs POST] Creating pair:', pair_name);

    const { data, error } = await supabaseAdmin
      .from('elimination_gl_pairs')
      .insert([{
        company_id: payload.companyId,
        pair_name,
        description,
        gl1_entity,
        gl1_code,
        gl2_entity,
        gl2_code,
        difference_gl_code,
        is_active: true,
        created_by: payload.userId
      }])
      .select()
      .single();

    if (error) {
      console.error('[API /elimination-pairs POST] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API /elimination-pairs POST] Created pair:', data.id);
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/elimination-pairs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a GL pair
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

    const body = await request.json();
    const { id, pair_name, description, gl1_entity, gl1_code, gl2_entity, gl2_code, difference_gl_code } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify the pair belongs to user's company
    const { data: existingPair } = await supabaseAdmin
      .from('elimination_gl_pairs')
      .select('company_id')
      .eq('id', id)
      .single();

    if (!existingPair || existingPair.company_id !== payload.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If entities are being updated, verify they belong to user's company
    if (gl1_entity && gl2_entity) {
      const { data: entities } = await supabaseAdmin
        .from('entities')
        .select('id, company_id')
        .in('id', [gl1_entity, gl2_entity]);

      const unauthorized = entities?.some(e => e.company_id !== payload.companyId);
      if (unauthorized || !entities || entities.length !== 2) {
        return NextResponse.json({ error: 'Unauthorized: Entities do not belong to your company' }, { status: 403 });
      }
    }

    console.log('[API /elimination-pairs PATCH] Updating pair:', id);

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (pair_name !== undefined) updateData.pair_name = pair_name;
    if (description !== undefined) updateData.description = description;
    if (gl1_entity !== undefined) updateData.gl1_entity = gl1_entity;
    if (gl1_code !== undefined) updateData.gl1_code = gl1_code;
    if (gl2_entity !== undefined) updateData.gl2_entity = gl2_entity;
    if (gl2_code !== undefined) updateData.gl2_code = gl2_code;
    if (difference_gl_code !== undefined) updateData.difference_gl_code = difference_gl_code;

    const { data, error } = await supabaseAdmin
      .from('elimination_gl_pairs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[API /elimination-pairs PATCH] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API /elimination-pairs PATCH] Updated pair:', data.id);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in PATCH /api/elimination-pairs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete (soft delete) a GL pair
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify the pair belongs to user's company
    const { data: existingPair } = await supabaseAdmin
      .from('elimination_gl_pairs')
      .select('company_id')
      .eq('id', id)
      .single();

    if (!existingPair || existingPair.company_id !== payload.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('[API /elimination-pairs DELETE] Soft deleting pair:', id);

    // Soft delete by setting is_active to false
    const { error } = await supabaseAdmin
      .from('elimination_gl_pairs')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[API /elimination-pairs DELETE] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API /elimination-pairs DELETE] Deleted pair:', id);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/elimination-pairs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

// GET - Fetch all entities for the user's company
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

    // Use admin client to fetch entities for this company
    const { data, error } = await supabaseAdmin
      .from('entities')
      .select('*')
      .eq('company_id', payload.companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching entities:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/entities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new entity
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    console.log('[API /entities POST] Token exists:', !!token);

    if (!token) {
      console.log('[API /entities POST] No token found');
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    console.log('[API /entities POST] Payload:', payload);

    if (!payload) {
      console.log('[API /entities POST] Invalid session');
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    console.log('[API /entities POST] Company ID:', payload.companyId);
    console.log('[API /entities POST] supabaseAdmin exists:', !!supabaseAdmin);

    const body = await request.json();

    // Add company_id from JWT token
    const entityData = {
      ...body,
      company_id: payload.companyId
    };

    console.log('[API /entities POST] Entity data to insert:', entityData);

    // Check if supabaseAdmin is available
    if (!supabaseAdmin) {
      console.error('[API /entities POST] supabaseAdmin is null - SUPABASE_SERVICE_ROLE_KEY not set!');
      return NextResponse.json({ error: 'Server configuration error - admin client not available' }, { status: 500 });
    }

    // Use admin client to insert entity
    const { data, error } = await supabaseAdmin
      .from('entities')
      .insert([entityData])
      .select();

    if (error) {
      console.error('[API /entities POST] Error creating entity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API /entities POST] Success! Entity created:', data[0]);
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('[API /entities POST] Exception:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}

// PUT - Update an entity
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

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Entity ID required' }, { status: 400 });
    }

    // Verify entity belongs to user's company before updating
    const { data: existingEntity } = await supabaseAdmin
      .from('entities')
      .select('company_id')
      .eq('id', id)
      .single();

    if (!existingEntity || existingEntity.company_id !== payload.companyId) {
      return NextResponse.json({ error: 'Entity not found or unauthorized' }, { status: 404 });
    }

    // Update entity
    const { data, error } = await supabaseAdmin
      .from('entities')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating entity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error in PUT /api/entities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete an entity
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
      return NextResponse.json({ error: 'Entity ID required' }, { status: 400 });
    }

    // Verify entity belongs to user's company before deleting
    const { data: existingEntity } = await supabaseAdmin
      .from('entities')
      .select('company_id')
      .eq('id', id)
      .single();

    if (!existingEntity || existingEntity.company_id !== payload.companyId) {
      return NextResponse.json({ error: 'Entity not found or unauthorized' }, { status: 404 });
    }

    // Check if entity has children
    const { data: childEntities } = await supabaseAdmin
      .from('entities')
      .select('id, entity_name')
      .eq('parent_entity_id', id);

    if (childEntities && childEntities.length > 0) {
      const childNames = childEntities.map(c => c.entity_name).join(', ');
      return NextResponse.json({
        error: `Cannot delete entity because it has ${childEntities.length} child entities: ${childNames}. Delete the child entities first.`
      }, { status: 400 });
    }

    // Delete entity
    const { error } = await supabaseAdmin
      .from('entities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting entity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/entities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

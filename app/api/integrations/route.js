import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

// GET - Fetch all integrations for the company
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data: integrations, error } = await supabase
      .from('erp_integrations')
      .select(`
        *,
        sync_history:integration_sync_history(
          id,
          sync_type,
          sync_status,
          triggered_at,
          duration_seconds,
          records_imported
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get sync statistics for each integration
    const integrationsWithStats = await Promise.all(
      integrations.map(async (integration) => {
        const { data: stats } = await supabase.rpc(
          'get_integration_status_summary',
          { p_integration_id: integration.id }
        );

        return {
          ...integration,
          statistics: stats && stats.length > 0 ? stats[0] : null,
          recent_syncs: integration.sync_history?.slice(0, 5) || []
        };
      })
    );

    return NextResponse.json(integrationsWithStats);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new integration
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const body = await request.json();

    const { data, error } = await supabase
      .from('erp_integrations')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update integration
export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const body = await request.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
      .from('erp_integrations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete integration
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const { error } = await supabase
      .from('erp_integrations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting integration:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

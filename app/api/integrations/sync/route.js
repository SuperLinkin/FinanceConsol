import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

// POST - Trigger a sync operation
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = supabaseAdmin;
    const body = await request.json();
    const { integration_id, sync_type = 'full', triggered_by = 'manual' } = body;

    // Get integration details
    const { data: integration, error: integrationError } = await supabase
      .from('erp_integrations')
      .select('*')
      .eq('id', integration_id)
      .single();

    if (integrationError) throw integrationError;

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Create sync history record
    const { data: syncRecord, error: syncError } = await supabase
      .from('integration_sync_history')
      .insert([
        {
          integration_id,
          company_id: integration.company_id,
          sync_type,
          sync_status: 'in_progress',
          triggered_by,
          started_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (syncError) throw syncError;

    // Simulate sync operation (in production, this would be a background job)
    // For now, we'll simulate it with a timeout
    setTimeout(async () => {
      try {
        const duration = Math.floor(Math.random() * 30) + 10; // 10-40 seconds
        const recordsFetched = Math.floor(Math.random() * 1000) + 100;
        const recordsImported = Math.floor(recordsFetched * 0.95);

        await supabase
          .from('integration_sync_history')
          .update({
            sync_status: 'completed',
            completed_at: new Date().toISOString(),
            duration_seconds: duration,
            records_fetched: recordsFetched,
            records_imported: recordsImported,
            records_updated: Math.floor(recordsImported * 0.3),
            records_failed: recordsFetched - recordsImported,
            sync_summary: {
              sync_type,
              erp_system: integration.erp_system,
              entities_synced: 3,
              success_rate: ((recordsImported / recordsFetched) * 100).toFixed(2)
            }
          })
          .eq('id', syncRecord.id);

        // Update integration last sync time
        await supabase
          .from('erp_integrations')
          .update({
            last_successful_sync: new Date().toISOString(),
            status: 'connected'
          })
          .eq('id', integration_id);

      } catch (error) {
        console.error('Error completing sync:', error);
        await supabase
          .from('integration_sync_history')
          .update({
            sync_status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error.message
          })
          .eq('id', syncRecord.id);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      sync_id: syncRecord.id,
      message: `${sync_type} sync started`,
      status: 'in_progress'
    });

  } catch (error) {
    console.error('Error triggering sync:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// GET - Get sync history
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const supabase = supabaseAdmin;
    const { searchParams } = new URL(request.url);
    const integration_id = searchParams.get('integration_id');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('integration_sync_history')
      .select('*')
      .order('triggered_at', { ascending: false })
      .limit(limit);

    if (integration_id) {
      query = query.eq('integration_id', integration_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching sync history:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

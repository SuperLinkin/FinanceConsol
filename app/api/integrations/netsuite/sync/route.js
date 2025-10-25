import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NetSuiteSyncService } from '@/lib/integrations/netsuite/sync-service';

// POST - Execute NetSuite sync
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = supabaseAdmin;
    const body = await request.json();

    const {
      integration_id,
      sync_type = 'full', // 'full', 'trial_balance', 'chart_of_accounts', 'subsidiaries', 'exchange_rates'
      subsidiary_id,
      period_id,
      start_date,
      end_date,
      period_name
    } = body;

    // Get integration details
    const { data: integration, error: integrationError } = await supabase
      .from('erp_integrations')
      .select('*')
      .eq('id', integration_id)
      .eq('erp_system', 'netsuite')
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'NetSuite integration not found' },
        { status: 404 }
      );
    }

    // Validate credentials
    if (!integration.credentials?.consumer_key || !integration.credentials?.token_id) {
      return NextResponse.json(
        { error: 'NetSuite credentials not configured. Please update integration settings.' },
        { status: 400 }
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
          triggered_by: 'manual',
          started_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (syncError) {
      return NextResponse.json(
        { error: 'Failed to create sync record' },
        { status: 500 }
      );
    }

    // Execute sync in background
    // In production, this should be a background job/queue
    executeSyncInBackground(integration, syncRecord, supabase, {
      sync_type,
      subsidiary_id,
      period_id,
      start_date,
      end_date,
      period_name
    });

    return NextResponse.json({
      success: true,
      sync_id: syncRecord.id,
      message: `NetSuite ${sync_type} sync started`,
      status: 'in_progress'
    });

  } catch (error) {
    console.error('Error triggering NetSuite sync:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Background sync execution
async function executeSyncInBackground(integration, syncRecord, supabase, options) {
  const syncService = new NetSuiteSyncService(integration, supabase);

  try {
    let results;

    // Execute based on sync type
    switch (options.sync_type) {
      case 'subsidiaries':
        results = {
          subsidiaries: await syncService.syncSubsidiaries(integration.entity_mapping || {})
        };
        break;

      case 'chart_of_accounts':
        results = {
          chart_of_accounts: await syncService.syncChartOfAccounts(options.subsidiary_id)
        };
        break;

      case 'trial_balance':
        if (!options.subsidiary_id || !options.period_id) {
          throw new Error('subsidiary_id and period_id are required for trial balance sync');
        }
        results = {
          trial_balance: await syncService.syncTrialBalance(
            options.subsidiary_id,
            options.period_id,
            {
              startDate: options.start_date,
              endDate: options.end_date,
              periodName: options.period_name
            }
          )
        };
        break;

      case 'exchange_rates':
        if (!options.start_date || !options.end_date) {
          throw new Error('start_date and end_date are required for exchange rates sync');
        }
        results = {
          exchange_rates: await syncService.syncExchangeRates(
            options.start_date,
            options.end_date
          )
        };
        break;

      case 'full':
      default:
        results = await syncService.executeFullSync({
          subsidiaryId: options.subsidiary_id,
          periodId: options.period_id,
          startDate: options.start_date,
          endDate: options.end_date,
          periodName: options.period_name
        });
        break;
    }

    // Calculate totals
    const totalRecords = syncService.getTotalRecords(results);
    const importedRecords = syncService.getImportedRecords(results);

    // Update sync record with success
    await supabase
      .from('integration_sync_history')
      .update({
        sync_status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: results.duration_seconds || 0,
        records_fetched: totalRecords,
        records_imported: importedRecords,
        records_updated: 0,
        records_failed: totalRecords - importedRecords,
        sync_summary: results
      })
      .eq('id', syncRecord.id);

    // Save logs
    await syncService.saveLogs(syncRecord.id);

    // Update integration last sync time
    await supabase
      .from('erp_integrations')
      .update({
        last_successful_sync: new Date().toISOString(),
        status: 'connected'
      })
      .eq('id', integration.id);

    console.log('NetSuite sync completed successfully:', results);

  } catch (error) {
    console.error('NetSuite sync failed:', error);

    // Update sync record with failure
    await supabase
      .from('integration_sync_history')
      .update({
        sync_status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message,
        error_details: {
          stack: error.stack,
          message: error.message
        }
      })
      .eq('id', syncRecord.id);

    // Save logs even on failure
    await syncService.saveLogs(syncRecord.id);

    // Update integration status
    await supabase
      .from('erp_integrations')
      .update({
        status: 'error'
      })
      .eq('id', integration.id);
  }
}

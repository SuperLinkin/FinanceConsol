import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { NetSuiteConnector } from '@/lib/integrations/netsuite/connector';

// GET - Fetch accounting periods from NetSuite
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { searchParams } = new URL(request.url);
    const integration_id = searchParams.get('integration_id');

    if (!integration_id) {
      return NextResponse.json(
        { error: 'integration_id is required' },
        { status: 400 }
      );
    }

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

    // Initialize connector
    const config = {
      account_id: integration.connection_config.account_id,
      consumer_key: integration.credentials.consumer_key,
      consumer_secret: integration.credentials.consumer_secret,
      token_id: integration.credentials.token_id,
      token_secret: integration.credentials.token_secret,
      realm: integration.connection_config.realm || 'production'
    };

    const connector = new NetSuiteConnector(config);

    // Fetch accounting periods
    const periods = await connector.fetchAccountingPeriods();

    return NextResponse.json(periods);

  } catch (error) {
    console.error('Error fetching NetSuite periods:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

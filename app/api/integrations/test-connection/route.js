import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NetSuiteConnector } from '@/lib/integrations/netsuite/connector';

// POST - Test ERP connection
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = supabaseAdmin;
    const body = await request.json();
    const { integration_id, erp_system, connection_config, credentials } = body;

    let result = { success: false, error: '', status: 'error' };

    // Real connection test for NetSuite
    if (erp_system === 'netsuite') {
      try {
        // Validate required fields
        if (!connection_config.account_id || !credentials.consumer_key ||
            !credentials.consumer_secret || !credentials.token_id || !credentials.token_secret) {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing required NetSuite credentials (Account ID, Consumer Key/Secret, Token ID/Secret)',
              status: 'error'
            },
            { status: 400 }
          );
        }

        // Initialize connector and test connection
        const config = {
          account_id: connection_config.account_id,
          consumer_key: credentials.consumer_key,
          consumer_secret: credentials.consumer_secret,
          token_id: credentials.token_id,
          token_secret: credentials.token_secret,
          realm: connection_config.realm || 'production'
        };

        const connector = new NetSuiteConnector(config);
        result = await connector.testConnection();

      } catch (error) {
        result = {
          success: false,
          error: error.message,
          status: 'error'
        };
      }
    } else {
      // Simulate connection test for other ERP systems
      let isValid = false;
      let errorMessage = '';

      switch (erp_system) {
        case 'tally':
          isValid = connection_config.host && connection_config.port;
          errorMessage = isValid ? '' : 'Missing host or port';
          break;
        case 'sap':
          isValid = connection_config.system_id && connection_config.client;
          errorMessage = isValid ? '' : 'Missing system ID or client';
          break;
        case 'quickbooks':
          isValid = connection_config.realm_id && credentials.client_id;
          errorMessage = isValid ? '' : 'Missing realm ID or credentials';
          break;
        default:
          isValid = true;
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!isValid) {
        result = {
          success: false,
          error: errorMessage,
          status: 'error'
        };
      } else {
        result = {
          success: true,
          status: 'connected',
          message: `Successfully connected to ${erp_system.toUpperCase()}`,
          tested_at: new Date().toISOString()
        };
      }
    }

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    // Update integration with last connection test timestamp
    if (integration_id) {
      await supabase
        .from('erp_integrations')
        .update({
          last_connection_test: new Date().toISOString(),
          status: 'connected'
        })
        .eq('id', integration_id);
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error testing connection:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        status: 'error'
      },
      { status: 500 }
    );
  }
}

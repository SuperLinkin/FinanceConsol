import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

/**
 * POST /api/consolidation/save
 * Saves consolidation workings data to database with upsert logic
 * Overwrites existing data for the same period
 */
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

    console.log('🔐 Session payload:', {
      userId: payload.userId,
      companyId: payload.companyId,
      email: payload.email
    });

    if (!payload.companyId) {
      return NextResponse.json({ error: 'Company ID missing from session' }, { status: 400 });
    }

    if (!payload.userId) {
      return NextResponse.json({ error: 'User ID missing from session' }, { status: 400 });
    }

    const { period, statement_type, data } = await request.json();

    if (!period || !statement_type || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'period, statement_type, and data array are required' },
        { status: 400 }
      );
    }

    console.log(`💾 Saving consolidation workings for period ${period}, statement ${statement_type}`);
    console.log(`📊 Total records to save: ${data.length}`);

    // Step 1: Delete existing records for this period and statement type
    const { error: deleteError } = await supabaseAdmin
      .from('consolidation_workings')
      .delete()
      .eq('period', period)
      .eq('statement_type', statement_type);

    if (deleteError) {
      console.error('Error deleting existing records:', deleteError);
      throw deleteError;
    }

    console.log(`🗑️ Deleted existing records for ${period} - ${statement_type}`);

    // Step 2: Insert new records
    if (data.length > 0) {
      // Prepare records for insertion
      const records = data.map(item => ({
        period,
        statement_type,
        account_code: item.account_code,
        account_name: item.account_name,
        class_name: item.class_name,
        subclass_name: item.subclass_name,
        note_name: item.note_name,
        subnote_name: item.subnote_name,
        entity_amounts: item.entity_amounts || {},
        elimination_amount: item.elimination_amount || 0,
        adjustment_amount: item.adjustment_amount || 0,
        translation_amount: item.translation_amount || 0,
        consolidated_amount: item.consolidated_amount || 0,
        created_by: payload.userId, // UUID foreign key to users table
        calculated_at: new Date().toISOString()
      }));

      // Insert in batches of 500 to avoid payload size limits
      const batchSize = 500;
      let totalInserted = 0;

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        const { error: insertError, count } = await supabaseAdmin
          .from('consolidation_workings')
          .insert(batch);

        if (insertError) {
          console.error('Error inserting batch:', insertError);
          throw insertError;
        }

        totalInserted += batch.length;
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records (Total: ${totalInserted})`);
      }

      console.log(`💾 Successfully saved ${totalInserted} consolidation working records`);
    }

    // Step 3: Log the save event
    const { error: logError } = await supabaseAdmin
      .from('consolidation_logs')
      .insert({
        company_id: payload.companyId,
        period,
        statement_type,
        action: 'save',
        records_count: data.length,
        saved_by: payload.email || 'Unknown',
        saved_at: new Date().toISOString()
      });

    if (logError) {
      console.warn('Failed to log save event:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      period,
      statement_type,
      records_saved: data.length,
      message: `Successfully saved ${data.length} consolidation working records`
    });

  } catch (error) {
    console.error('Error saving consolidation workings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save consolidation workings' },
      { status: 500 }
    );
  }
}

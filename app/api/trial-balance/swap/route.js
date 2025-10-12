import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { entityId, period } = await request.json();

    if (!entityId || !period) {
      return Response.json(
        { error: 'Entity ID and period are required' },
        { status: 400 }
      );
    }

    // Fetch all records for this entity and period
    const { data: records, error: fetchError } = await supabase
      .from('trial_balance')
      .select('*')
      .eq('entity_id', entityId)
      .eq('period', period);

    if (fetchError) throw fetchError;

    if (!records || records.length === 0) {
      return Response.json(
        { error: 'No records found for this entity and period' },
        { status: 404 }
      );
    }

    // Swap debits and credits for each record
    const updates = records.map(record => ({
      id: record.id,
      debit: record.credit,  // Swap: old credit becomes new debit
      credit: record.debit   // Swap: old debit becomes new credit
    }));

    // Update all records
    let successCount = 0;
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('trial_balance')
        .update({
          debit: update.debit,
          credit: update.credit
        })
        .eq('id', update.id);

      if (!updateError) {
        successCount++;
      }
    }

    return Response.json({
      success: true,
      message: `Successfully swapped debits and credits for ${successCount} records`,
      updatedCount: successCount
    });

  } catch (error) {
    console.error('Error swapping debits/credits:', error);
    return Response.json(
      { error: error.message || 'Failed to swap debits and credits' },
      { status: 500 }
    );
  }
}

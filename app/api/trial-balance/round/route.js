import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

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

    const {
      roundingMethod,
      roundingPrecision,
      differenceAccountCode,
      differenceAccountName,
      entityId,
      period,
      createNewGL,
      newGLDetails
    } = await request.json();

    console.log('[API /trial-balance/round] Starting rounding operation');

    // Verify entity belongs to user's company
    const { data: entity } = await supabaseAdmin
      .from('entities')
      .select('company_id')
      .eq('id', entityId)
      .single();

    if (!entity || entity.company_id !== payload.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create new GL account if needed
    let targetAccountCode = differenceAccountCode;
    if (createNewGL && newGLDetails) {
      const { data: newGL, error: glError } = await supabaseAdmin
        .from('chart_of_accounts')
        .insert([{
          ...newGLDetails,
          is_active: true
        }])
        .select()
        .single();

      if (glError) {
        console.error('[API /trial-balance/round] Error creating GL:', glError);
        throw glError;
      }
      targetAccountCode = newGLDetails.account_code;
      console.log('[API /trial-balance/round] Created new GL:', targetAccountCode);
    }

    // Fetch all trial balance records for this entity and period
    const { data: tbData, error: fetchError } = await supabaseAdmin
      .from('trial_balance')
      .select('*')
      .eq('entity_id', entityId)
      .eq('period', period);

    if (fetchError) {
      console.error('[API /trial-balance/round] Error fetching TB:', fetchError);
      throw fetchError;
    }

    console.log('[API /trial-balance/round] Fetched', tbData?.length, 'records');

    // Apply rounding
    const precision = parseInt(roundingPrecision);
    const roundFunc = roundingMethod === 'up' ? Math.ceil :
                     roundingMethod === 'down' ? Math.floor :
                     Math.round;

    let totalDifference = 0;
    const updates = [];

    (tbData || []).forEach(tb => {
      const originalDebit = parseFloat(tb.debit || 0);
      const originalCredit = parseFloat(tb.credit || 0);

      let roundedDebit, roundedCredit;
      if (precision === 0) {
        roundedDebit = roundFunc(originalDebit);
        roundedCredit = roundFunc(originalCredit);
      } else {
        const factor = Math.pow(10, precision);
        roundedDebit = roundFunc(originalDebit * factor) / factor;
        roundedCredit = roundFunc(originalCredit * factor) / factor;
      }

      const debitDiff = originalDebit - roundedDebit;
      const creditDiff = originalCredit - roundedCredit;
      totalDifference += (debitDiff - creditDiff);

      if (roundedDebit !== originalDebit || roundedCredit !== originalCredit) {
        updates.push({
          id: tb.id,
          debit: roundedDebit,
          credit: roundedCredit
        });
      }
    });

    console.log('[API /trial-balance/round] Updating', updates.length, 'records');
    console.log('[API /trial-balance/round] Total difference:', totalDifference);

    // Update all records
    for (const update of updates) {
      const { error: updateError } = await supabaseAdmin
        .from('trial_balance')
        .update({ debit: update.debit, credit: update.credit })
        .eq('id', update.id);

      if (updateError) {
        console.error('[API /trial-balance/round] Error updating record:', updateError);
        throw updateError;
      }
    }

    // Post rounding difference if significant
    let differencePosted = false;
    if (Math.abs(totalDifference) > 0.01) {
      // Round the difference amount itself using the same precision
      let roundedDifference;
      if (precision === 0) {
        roundedDifference = roundFunc(totalDifference);
      } else {
        const factor = Math.pow(10, precision);
        roundedDifference = roundFunc(totalDifference * factor) / factor;
      }

      const { data: existingDiff } = await supabaseAdmin
        .from('trial_balance')
        .select('*')
        .eq('account_code', targetAccountCode)
        .eq('entity_id', entityId)
        .eq('period', period)
        .maybeSingle();

      if (existingDiff) {
        // Update existing - add rounded difference
        const newDebit = parseFloat(existingDiff.debit || 0) + (roundedDifference > 0 ? roundedDifference : 0);
        const newCredit = parseFloat(existingDiff.credit || 0) + (roundedDifference < 0 ? Math.abs(roundedDifference) : 0);

        const { error: updateDiffError } = await supabaseAdmin
          .from('trial_balance')
          .update({ debit: newDebit, credit: newCredit })
          .eq('id', existingDiff.id);

        if (updateDiffError) {
          console.error('[API /trial-balance/round] Error updating difference:', updateDiffError);
          throw updateDiffError;
        }
        differencePosted = true;
        console.log('[API /trial-balance/round] Updated existing difference account with rounded amount:', roundedDifference);
      } else {
        // Create new entry with rounded difference
        const { error: insertDiffError } = await supabaseAdmin
          .from('trial_balance')
          .insert([{
            account_code: targetAccountCode,
            account_name: differenceAccountName || 'Rounding Difference',
            debit: roundedDifference > 0 ? roundedDifference : 0,
            credit: roundedDifference < 0 ? Math.abs(roundedDifference) : 0,
            period: period,
            entity_id: entityId,
            uploaded_by: 'System - Rounding'
          }]);

        if (insertDiffError) {
          console.error('[API /trial-balance/round] Error inserting difference:', insertDiffError);
          throw insertDiffError;
        }
        differencePosted = true;
        console.log('[API /trial-balance/round] Created new difference account with rounded amount:', roundedDifference);
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: updates.length,
      totalDifference: totalDifference,
      differencePosted: differencePosted,
      targetAccount: targetAccountCode
    });

  } catch (error) {
    console.error('[API /trial-balance/round] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

/**
 * POST /api/translations/apply
 * Applies translation rules to trial balance and saves translated amounts + FCTR
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

    const { entity_id, period } = await request.json();

    if (!entity_id || !period) {
      return NextResponse.json(
        { error: 'entity_id and period are required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Applying translations for entity ${entity_id}, period ${period}`);

    // Step 1: Fetch translation rules for this entity
    const { data: rules, error: rulesError } = await supabaseAdmin
      .from('translation_rules')
      .select('*')
      .eq('entity_id', entity_id)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (rulesError) throw rulesError;

    if (!rules || rules.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No active translation rules found for this entity'
      });
    }

    console.log(`📋 Found ${rules.length} translation rules`);

    // Step 2: Fetch trial balance records for this entity + period
    const { data: tbRecords, error: tbError } = await supabaseAdmin
      .from('trial_balance')
      .select(`
        *,
        entities!inner(entity_name, functional_currency)
      `)
      .eq('entity_id', entity_id)
      .eq('period', period);

    if (tbError) throw tbError;

    if (!tbRecords || tbRecords.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No trial balance records found for this entity and period'
      });
    }

    console.log(`📊 Found ${tbRecords.length} trial balance records`);

    // Step 3: Fetch chart of accounts for class information
    const { data: coa, error: coaError } = await supabaseAdmin
      .from('chart_of_accounts')
      .select('account_code, class_name')
      .eq('entity_id', entity_id);

    if (coaError) throw coaError;

    const coaMap = {};
    (coa || []).forEach(acc => {
      coaMap[acc.account_code] = acc.class_name;
    });

    // Step 4: Apply translation rules and calculate FCTR
    const updates = [];
    let totalFctrDebit = 0;
    let totalFctrCredit = 0;
    let translatedCount = 0;

    tbRecords.forEach(tb => {
      const accountClass = coaMap[tb.account_code];

      // Find applicable rule (priority order)
      const applicableRule = rules.find(rule => {
        if (rule.applies_to === 'Specific GL' && rule.gl_account_code === tb.account_code) {
          return true;
        }
        if (rule.applies_to === 'Class' && rule.class_name === accountClass) {
          return true;
        }
        if (rule.applies_to === 'All') {
          return true;
        }
        return false;
      });

      if (applicableRule && applicableRule.rate_value) {
        const rate = parseFloat(applicableRule.rate_value);
        const debit = parseFloat(tb.debit || 0);
        const credit = parseFloat(tb.credit || 0);

        const translatedDebit = debit * rate;
        const translatedCredit = credit * rate;

        // Calculate FCTR (difference between original and translated)
        const fctrDebit = translatedDebit - debit;
        const fctrCredit = translatedCredit - credit;
        const fctrAmount = fctrDebit - fctrCredit;

        totalFctrDebit += fctrDebit;
        totalFctrCredit += fctrCredit;

        updates.push({
          id: tb.id,
          translated_debit: translatedDebit,
          translated_credit: translatedCredit,
          target_currency: applicableRule.to_currency,
          exchange_rate: rate,
          translation_method: applicableRule.rate_type,
          fctr_amount: fctrAmount,
          translation_date: new Date().toISOString()
        });

        translatedCount++;
      }
    });

    console.log(`💱 Calculated ${translatedCount} translations`);
    console.log(`💰 Total FCTR: Debit ${totalFctrDebit.toFixed(2)}, Credit ${totalFctrCredit.toFixed(2)}`);

    // Step 5: Update trial_balance records with translated amounts
    if (updates.length > 0) {
      // Update in batches of 100
      const batchSize = 100;
      let updatedCount = 0;

      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);

        for (const update of batch) {
          const { error: updateError } = await supabaseAdmin
            .from('trial_balance')
            .update({
              translated_debit: update.translated_debit,
              translated_credit: update.translated_credit,
              target_currency: update.target_currency,
              exchange_rate: update.exchange_rate,
              translation_method: update.translation_method,
              fctr_amount: update.fctr_amount,
              translation_date: update.translation_date
            })
            .eq('id', update.id);

          if (updateError) {
            console.error('Error updating TB record:', updateError);
          } else {
            updatedCount++;
          }
        }

        console.log(`✅ Updated batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records (Total: ${updatedCount})`);
      }

      // Step 6: Save translation adjustments for audit trail
      const adjustments = updates.map(u => ({
        entity_id: entity_id,
        account_code: tbRecords.find(tb => tb.id === u.id)?.account_code,
        period: period,
        functional_amount: parseFloat(tbRecords.find(tb => tb.id === u.id)?.debit || 0) -
                          parseFloat(tbRecords.find(tb => tb.id === u.id)?.credit || 0),
        functional_currency: tbRecords[0].entities.functional_currency,
        translated_amount: u.translated_debit - u.translated_credit,
        translated_currency: u.target_currency,
        exchange_rate: u.exchange_rate,
        translation_method: u.translation_method,
        adjustment_amount: u.fctr_amount,
        cumulative_adjustment: u.fctr_amount // Can be enhanced to track cumulative
      }));

      const { error: adjError } = await supabaseAdmin
        .from('translation_adjustments')
        .upsert(adjustments, {
          onConflict: 'entity_id,account_code,period',
          ignoreDuplicates: false
        });

      if (adjError) {
        console.warn('Failed to save translation adjustments:', adjError);
      }

      return NextResponse.json({
        success: true,
        message: `Successfully applied translations to ${updatedCount} trial balance records`,
        stats: {
          total_records: tbRecords.length,
          translated_count: translatedCount,
          fctr_debit: totalFctrDebit.toFixed(2),
          fctr_credit: totalFctrCredit.toFixed(2),
          fctr_net: (totalFctrDebit - totalFctrCredit).toFixed(2)
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No records matched translation rules'
      });
    }

  } catch (error) {
    console.error('Error applying translations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to apply translations' },
      { status: 500 }
    );
  }
}

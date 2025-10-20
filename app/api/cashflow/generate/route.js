import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

/**
 * POST /api/cashflow/generate
 * Generates cash flow statement using indirect method from consolidation workings
 *
 * Based on: cashflow_indirect_method.md
 * Uses: Movement between current and previous period balances
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

    const { current_period, previous_period } = await request.json();

    if (!current_period || !previous_period) {
      return NextResponse.json(
        { error: 'Both current_period and previous_period are required' },
        { status: 400 }
      );
    }

    // Get company's entities
    const { data: entities } = await supabaseAdmin
      .from('entities')
      .select('id')
      .eq('company_id', payload.companyId);

    const entityIds = entities?.map(e => e.id) || [];

    if (entityIds.length === 0) {
      return NextResponse.json({ error: 'No entities found for company' }, { status: 404 });
    }

    // Load trial balances for both periods
    const [currentTB, previousTB] = await Promise.all([
      loadConsolidatedTB(entityIds, current_period),
      loadConsolidatedTB(entityIds, previous_period)
    ]);

    // Load Chart of Accounts for mapping
    const { data: coa } = await supabaseAdmin
      .from('chart_of_accounts')
      .select('account_code, account_name, class_name, sub_class_name, note_name, sub_note_name')
      .in('entity_id', entityIds)
      .eq('is_active', true);

    // Create account mapping
    const accountMap = {};
    (coa || []).forEach(acc => {
      if (!accountMap[acc.account_code]) {
        accountMap[acc.account_code] = acc;
      }
    });

    // Calculate cash flow statement
    const cashFlow = calculateCashFlow(currentTB, previousTB, accountMap);

    return NextResponse.json(cashFlow);

  } catch (error) {
    console.error('Error generating cash flow:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate cash flow' },
      { status: 500 }
    );
  }
}

/**
 * Load consolidated trial balance for a period
 */
async function loadConsolidatedTB(entityIds, period) {
  const { data, error } = await supabaseAdmin
    .from('trial_balance')
    .select('account_code, account_name, debit, credit')
    .in('entity_id', entityIds)
    .eq('period', period);

  if (error) throw error;

  // Consolidate by account_code
  const consolidated = {};

  (data || []).forEach(tb => {
    const code = tb.account_code;
    if (!consolidated[code]) {
      consolidated[code] = {
        account_code: code,
        account_name: tb.account_name,
        debit: 0,
        credit: 0,
        net_amount: 0
      };
    }

    const debit = parseFloat(tb.debit || 0);
    const credit = parseFloat(tb.credit || 0);

    consolidated[code].debit += debit;
    consolidated[code].credit += credit;
    consolidated[code].net_amount += (debit - credit);
  });

  return consolidated;
}

/**
 * Calculate Cash Flow Statement using Indirect Method
 * Following the structure in cashflow_indirect_method.md
 */
function calculateCashFlow(currentTB, previousTB, accountMap) {
  // Helper: Get movement for an account
  const getMovement = (accountCode) => {
    const current = currentTB[accountCode]?.net_amount || 0;
    const previous = previousTB[accountCode]?.net_amount || 0;
    return current - previous;
  };

  // Helper: Get account info
  const getAccountInfo = (accountCode) => {
    return accountMap[accountCode] || { class_name: '', note_name: '' };
  };

  // Helper: Find accounts by keyword in name or note
  const findAccounts = (keywords, exactClass = null) => {
    const results = [];
    Object.keys(currentTB).forEach(code => {
      const info = getAccountInfo(code);
      const accountName = (currentTB[code]?.account_name || '').toLowerCase();
      const noteName = (info.note_name || '').toLowerCase();
      const className = (info.class_name || '').toLowerCase();

      // Check class match if specified
      if (exactClass && !className.includes(exactClass.toLowerCase())) {
        return;
      }

      // Check keyword match
      const matchesKeyword = keywords.some(keyword =>
        accountName.includes(keyword.toLowerCase()) ||
        noteName.includes(keyword.toLowerCase())
      );

      if (matchesKeyword) {
        results.push(code);
      }
    });
    return results;
  };

  // Helper: Sum movements for account codes
  const sumMovements = (accountCodes) => {
    return accountCodes.reduce((sum, code) => sum + getMovement(code), 0);
  };

  // ===========================================================================
  // OPERATING ACTIVITIES (CFO)
  // ===========================================================================

  const operating = {};

  // Step 1: Net Profit (from Income/Expenses)
  const revenueAccounts = findAccounts(['revenue', 'income', 'sales'], 'income');
  const expenseAccounts = findAccounts(['expense', 'cost'], 'expenses');

  const totalRevenue = sumMovements(revenueAccounts);
  const totalExpenses = sumMovements(expenseAccounts);
  operating.net_profit = totalRevenue - totalExpenses;

  // Step 2: Non-cash adjustments
  const depreciationAccounts = findAccounts(['depreciation', 'amortization', 'impairment']);
  operating.depreciation_amortization = Math.abs(sumMovements(depreciationAccounts));

  const provisionAccounts = findAccounts(['provision', 'allowance']);
  const provisionMovement = sumMovements(provisionAccounts);
  if (provisionMovement !== 0) {
    operating.provisions_movement = provisionMovement;
  }

  // Step 3: Working Capital Changes
  // Note: Increase in current assets = cash outflow (negative)
  //       Increase in current liabilities = cash inflow (positive)

  const receivablesAccounts = findAccounts(['receivable', 'debtor', 'accounts receivable'], 'assets');
  const receivablesMovement = sumMovements(receivablesAccounts);
  if (receivablesMovement !== 0) {
    operating.change_in_receivables = -receivablesMovement;  // Reverse sign
  }

  const inventoryAccounts = findAccounts(['inventory', 'stock'], 'assets');
  const inventoryMovement = sumMovements(inventoryAccounts);
  if (inventoryMovement !== 0) {
    operating.change_in_inventory = -inventoryMovement;  // Reverse sign
  }

  const payablesAccounts = findAccounts(['payable', 'creditor', 'accounts payable'], 'liabilities');
  const payablesMovement = sumMovements(payablesAccounts);
  if (payablesMovement !== 0) {
    operating.change_in_payables = payablesMovement;  // Keep sign (increase = inflow)
  }

  const accrualAccounts = findAccounts(['accrual', 'accrued'], 'liabilities');
  const accrualMovement = sumMovements(accrualAccounts);
  if (accrualMovement !== 0) {
    operating.change_in_accruals = accrualMovement;
  }

  const prepaidAccounts = findAccounts(['prepaid', 'prepayment'], 'assets');
  const prepaidMovement = sumMovements(prepaidAccounts);
  if (prepaidMovement !== 0) {
    operating.change_in_prepaids = -prepaidMovement;  // Reverse sign
  }

  // Calculate CFO Total
  const cfo_total = Object.values(operating).reduce((sum, val) => sum + val, 0);

  // ===========================================================================
  // INVESTING ACTIVITIES (CFI)
  // ===========================================================================

  const investing = {};

  // PPE Additions/Disposals
  const ppeAccounts = findAccounts(['property', 'plant', 'equipment', 'ppe', 'fixed asset'], 'assets');
  const ppeMovement = sumMovements(ppeAccounts);
  if (ppeMovement !== 0) {
    investing.ppe_additions = -ppeMovement;  // Increase in PPE = cash outflow
  }

  // Intangible Assets
  const intangibleAccounts = findAccounts(['intangible', 'goodwill', 'software', 'patent'], 'assets');
  const intangibleMovement = sumMovements(intangibleAccounts);
  if (intangibleMovement !== 0) {
    investing.intangible_additions = -intangibleMovement;
  }

  // Investments
  const investmentAccounts = findAccounts(['investment', 'subsidiary', 'associate'], 'assets');
  const investmentMovement = sumMovements(investmentAccounts);
  if (investmentMovement !== 0) {
    investing.investments_movement = -investmentMovement;
  }

  // Calculate CFI Total
  const cfi_total = Object.values(investing).reduce((sum, val) => sum + val, 0);

  // ===========================================================================
  // FINANCING ACTIVITIES (CFF)
  // ===========================================================================

  const financing = {};

  // Borrowings
  const borrowingAccounts = findAccounts(['loan', 'borrowing', 'debt', 'bond'], 'liabilities');
  const borrowingMovement = sumMovements(borrowingAccounts);
  if (borrowingMovement !== 0) {
    financing.borrowings_movement = borrowingMovement;  // Increase = cash inflow
  }

  // Share Capital
  const equityAccounts = findAccounts(['share capital', 'equity', 'common stock'], 'equity');
  const equityMovement = sumMovements(equityAccounts);
  if (equityMovement !== 0) {
    financing.share_capital_movement = equityMovement;
  }

  // Dividends
  const dividendAccounts = findAccounts(['dividend']);
  const dividendMovement = sumMovements(dividendAccounts);
  if (dividendMovement !== 0) {
    financing.dividends_paid = -Math.abs(dividendMovement);  // Always outflow
  }

  // Lease Liabilities (IFRS 16)
  const leaseAccounts = findAccounts(['lease liability'], 'liabilities');
  const leaseMovement = sumMovements(leaseAccounts);
  if (leaseMovement !== 0) {
    financing.lease_payments = -leaseMovement;  // Repayment = outflow
  }

  // Calculate CFF Total
  const cff_total = Object.values(financing).reduce((sum, val) => sum + val, 0);

  // ===========================================================================
  // CASH RECONCILIATION
  // ===========================================================================

  const cashAccounts = findAccounts(['cash', 'bank', 'cash equivalent']);
  const opening_cash = cashAccounts.reduce((sum, code) =>
    sum + (previousTB[code]?.net_amount || 0), 0
  );
  const closing_cash = cashAccounts.reduce((sum, code) =>
    sum + (currentTB[code]?.net_amount || 0), 0
  );

  // ===========================================================================
  // RETURN RESULT
  // ===========================================================================

  return {
    operating,
    investing,
    financing,
    cfo_total,
    cfi_total,
    cff_total,
    opening_cash,
    closing_cash,
    net_cash_change: cfo_total + cfi_total + cff_total,
    reconciliation_diff: Math.abs((cfo_total + cfi_total + cff_total) - (closing_cash - opening_cash))
  };
}

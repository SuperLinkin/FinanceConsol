import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';
import { verifySessionToken } from '@/lib/auth';

/**
 * POST /api/cashflow/generate
 * Generates cash flow statement using indirect method from consolidation_workings
 *
 * Uses consolidated_amount field directly (already calculated)
 * Movement = Current Period consolidated_amount - Previous Period consolidated_amount
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

    // Load consolidation workings for both periods
    const [currentWorkings, previousWorkings] = await Promise.all([
      loadConsolidationWorkings(current_period),
      loadConsolidationWorkings(previous_period)
    ]);

    if (Object.keys(currentWorkings).length === 0) {
      return NextResponse.json(
        { error: 'No consolidation workings found for current period. Please run consolidation first.' },
        { status: 404 }
      );
    }

    if (Object.keys(previousWorkings).length === 0) {
      return NextResponse.json(
        { error: 'No consolidation workings found for previous period. Please run consolidation first.' },
        { status: 404 }
      );
    }

    // Calculate cash flow statement
    const cashFlow = calculateCashFlow(currentWorkings, previousWorkings);

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
 * Load consolidation workings for a period
 * Returns object keyed by account_code with all metadata
 */
async function loadConsolidationWorkings(period) {
  const { data, error } = await supabaseAdmin
    .from('consolidation_workings')
    .select('*')
    .eq('period', period);

  if (error) {
    console.error('Error loading consolidation workings:', error);
    throw error;
  }

  // Create lookup by account_code
  const workings = {};

  (data || []).forEach(item => {
    workings[item.account_code] = {
      account_code: item.account_code,
      account_name: item.account_name,
      class_name: item.class_name,
      subclass_name: item.subclass_name,
      note_name: item.note_name,
      subnote_name: item.subnote_name,
      statement_type: item.statement_type,
      consolidated_amount: parseFloat(item.consolidated_amount || 0),
      elimination_amount: parseFloat(item.elimination_amount || 0),
      adjustment_amount: parseFloat(item.adjustment_amount || 0),
      translation_amount: parseFloat(item.translation_amount || 0)
    };
  });

  return workings;
}

/**
 * Calculate Cash Flow Statement using Indirect Method
 * Using consolidated_amount from consolidation_workings
 */
function calculateCashFlow(currentWorkings, previousWorkings) {

  // Helper: Get movement for an account
  const getMovement = (accountCode) => {
    const current = currentWorkings[accountCode]?.consolidated_amount || 0;
    const previous = previousWorkings[accountCode]?.consolidated_amount || 0;
    return current - previous;
  };

  // Helper: Get current amount
  const getCurrentAmount = (accountCode) => {
    return currentWorkings[accountCode]?.consolidated_amount || 0;
  };

  // Helper: Get account metadata
  const getAccount = (accountCode) => {
    return currentWorkings[accountCode] || previousWorkings[accountCode] || {};
  };

  // Helper: Find accounts by criteria
  const findAccounts = (keywords = [], className = null, statementType = null) => {
    const allCodes = new Set([
      ...Object.keys(currentWorkings),
      ...Object.keys(previousWorkings)
    ]);

    return Array.from(allCodes).filter(code => {
      const account = getAccount(code);

      // Check statement type
      if (statementType && account.statement_type !== statementType) {
        return false;
      }

      // Check class name
      if (className) {
        const accountClass = (account.class_name || '').toLowerCase();
        if (!accountClass.includes(className.toLowerCase())) {
          return false;
        }
      }

      // Check keywords
      if (keywords.length > 0) {
        const accountName = (account.account_name || '').toLowerCase();
        const noteName = (account.note_name || '').toLowerCase();
        const subnoteName = (account.subnote_name || '').toLowerCase();
        const subclassName = (account.subclass_name || '').toLowerCase();

        const text = `${accountName} ${noteName} ${subnoteName} ${subclassName}`;

        return keywords.some(keyword => text.includes(keyword.toLowerCase()));
      }

      return true;
    });
  };

  // Helper: Sum movements
  const sumMovements = (accountCodes) => {
    return accountCodes.reduce((sum, code) => sum + getMovement(code), 0);
  };

  // Helper: Sum current amounts
  const sumCurrentAmounts = (accountCodes) => {
    return accountCodes.reduce((sum, code) => sum + getCurrentAmount(code), 0);
  };

  console.log('🔍 Available account codes:', Object.keys(currentWorkings).slice(0, 10));

  // ===========================================================================
  // OPERATING ACTIVITIES (CFO)
  // ===========================================================================

  const operating = {};

  // Step 1: Net Profit from Income Statement
  // Get all income statement accounts
  const incomeAccounts = findAccounts([], null, 'income_statement');

  console.log('📊 Income statement accounts found:', incomeAccounts.length);

  // Separate revenue and expenses by class
  const revenueAccounts = incomeAccounts.filter(code => {
    const account = getAccount(code);
    const className = (account.class_name || '').toLowerCase();
    return className.includes('income') || className.includes('revenue');
  });

  const expenseAccounts = incomeAccounts.filter(code => {
    const account = getAccount(code);
    const className = (account.class_name || '').toLowerCase();
    return className.includes('expense') || className.includes('cost');
  });

  console.log('💰 Revenue accounts:', revenueAccounts.length);
  console.log('💸 Expense accounts:', expenseAccounts.length);

  // Calculate net profit (current year amounts, not movements)
  const totalRevenue = sumCurrentAmounts(revenueAccounts);
  const totalExpenses = sumCurrentAmounts(expenseAccounts);

  operating.net_profit = totalRevenue - Math.abs(totalExpenses);

  console.log(`Net Profit: ${totalRevenue} - ${Math.abs(totalExpenses)} = ${operating.net_profit}`);

  // Step 2: Non-cash adjustments (Add back)

  // Depreciation & Amortization (from expenses)
  const depreciationAccounts = findAccounts(
    ['depreciation', 'amortization', 'impairment'],
    'expense',
    'income_statement'
  );

  if (depreciationAccounts.length > 0) {
    operating.depreciation_amortization = Math.abs(sumCurrentAmounts(depreciationAccounts));
    console.log('📉 Depreciation/Amortization:', operating.depreciation_amortization);
  }

  // Provision movements (from balance sheet)
  const provisionAccounts = findAccounts(['provision', 'allowance'], null, 'balance_sheet');
  const provisionMovement = sumMovements(provisionAccounts);
  if (Math.abs(provisionMovement) > 100) {
    operating.provisions_movement = provisionMovement;
  }

  // Step 3: Working Capital Changes (Balance Sheet movements)
  // Note: We use MOVEMENTS here, not current amounts

  // Trade Receivables (Current Assets)
  const receivablesAccounts = findAccounts(
    ['receivable', 'debtor', 'trade receivable'],
    'asset',
    'balance_sheet'
  );
  const receivablesMovement = sumMovements(receivablesAccounts);
  if (Math.abs(receivablesMovement) > 100) {
    operating.change_in_receivables = -receivablesMovement;  // Increase = cash outflow
    console.log('📥 Receivables movement:', -receivablesMovement);
  }

  // Inventory
  const inventoryAccounts = findAccounts(
    ['inventory', 'stock', 'raw material', 'finished goods'],
    'asset',
    'balance_sheet'
  );
  const inventoryMovement = sumMovements(inventoryAccounts);
  if (Math.abs(inventoryMovement) > 100) {
    operating.change_in_inventory = -inventoryMovement;  // Increase = cash outflow
    console.log('📦 Inventory movement:', -inventoryMovement);
  }

  // Trade Payables (Current Liabilities)
  const payablesAccounts = findAccounts(
    ['payable', 'creditor', 'trade payable'],
    'liabilit',
    'balance_sheet'
  );
  const payablesMovement = sumMovements(payablesAccounts);
  if (Math.abs(payablesMovement) > 100) {
    operating.change_in_payables = payablesMovement;  // Increase = cash inflow
    console.log('📤 Payables movement:', payablesMovement);
  }

  // Accruals
  const accrualAccounts = findAccounts(
    ['accrual', 'accrued expense', 'accrued liabilit'],
    'liabilit',
    'balance_sheet'
  );
  const accrualMovement = sumMovements(accrualAccounts);
  if (Math.abs(accrualMovement) > 100) {
    operating.change_in_accruals = accrualMovement;  // Increase = cash inflow
  }

  // Prepayments
  const prepaidAccounts = findAccounts(
    ['prepaid', 'prepayment', 'deferred'],
    'asset',
    'balance_sheet'
  );
  const prepaidMovement = sumMovements(prepaidAccounts);
  if (Math.abs(prepaidMovement) > 100) {
    operating.change_in_prepaids = -prepaidMovement;  // Increase = cash outflow
  }

  // Calculate CFO Total
  const cfo_total = Object.values(operating).reduce((sum, val) => sum + val, 0);

  // ===========================================================================
  // INVESTING ACTIVITIES (CFI)
  // ===========================================================================

  const investing = {};

  // Property, Plant & Equipment
  const ppeAccounts = findAccounts(
    ['property', 'plant', 'equipment', 'ppe', 'fixed asset', 'building', 'machinery', 'land'],
    'asset',
    'balance_sheet'
  );
  const ppeMovement = sumMovements(ppeAccounts);
  if (Math.abs(ppeMovement) > 100) {
    investing.ppe_additions = -ppeMovement;  // Increase in PPE = cash outflow
    console.log('🏭 PPE movement:', -ppeMovement);
  }

  // Intangible Assets
  const intangibleAccounts = findAccounts(
    ['intangible', 'goodwill', 'software', 'patent', 'license', 'trademark'],
    'asset',
    'balance_sheet'
  );
  const intangibleMovement = sumMovements(intangibleAccounts);
  if (Math.abs(intangibleMovement) > 100) {
    investing.intangible_additions = -intangibleMovement;
    console.log('💡 Intangibles movement:', -intangibleMovement);
  }

  // Investments (excluding depreciation/accumulated depreciation)
  const investmentAccounts = findAccounts(
    ['investment', 'subsidiary', 'associate', 'joint venture'],
    'asset',
    'balance_sheet'
  ).filter(code => {
    const account = getAccount(code);
    const name = (account.account_name || '').toLowerCase();
    return !name.includes('depreciation') && !name.includes('accumulated');
  });

  const investmentMovement = sumMovements(investmentAccounts);
  if (Math.abs(investmentMovement) > 100) {
    investing.investments_movement = -investmentMovement;
  }

  // Calculate CFI Total
  const cfi_total = Object.values(investing).reduce((sum, val) => sum + val, 0);

  // ===========================================================================
  // FINANCING ACTIVITIES (CFF)
  // ===========================================================================

  const financing = {};

  // Borrowings / Loans
  const borrowingAccounts = findAccounts(
    ['loan', 'borrowing', 'debt', 'bond', 'note payable'],
    'liabilit',
    'balance_sheet'
  );
  const borrowingMovement = sumMovements(borrowingAccounts);
  if (Math.abs(borrowingMovement) > 100) {
    financing.borrowings_movement = borrowingMovement;  // Increase = cash inflow
    console.log('💳 Borrowings movement:', borrowingMovement);
  }

  // Share Capital / Equity
  const equityAccounts = findAccounts(
    ['share capital', 'common stock', 'preferred stock', 'equity', 'share premium'],
    'equity',
    'balance_sheet'
  );
  const equityMovement = sumMovements(equityAccounts);
  if (Math.abs(equityMovement) > 100) {
    financing.share_capital_movement = equityMovement;
  }

  // Retained Earnings -> Extract dividends if decreased
  const retainedEarningsAccounts = findAccounts(
    ['retained earning'],
    'equity',
    'balance_sheet'
  );
  const retainedMovement = sumMovements(retainedEarningsAccounts);

  // If retained earnings decreased more than net profit, it means dividends were paid
  if (retainedMovement < 0 && Math.abs(retainedMovement) > operating.net_profit) {
    const dividendsPaid = -(Math.abs(retainedMovement) - operating.net_profit);
    if (Math.abs(dividendsPaid) > 100) {
      financing.dividends_paid = dividendsPaid;
      console.log('💰 Dividends paid:', dividendsPaid);
    }
  }

  // Lease Liabilities (IFRS 16)
  const leaseAccounts = findAccounts(
    ['lease liability', 'lease obligation'],
    'liabilit',
    'balance_sheet'
  );
  const leaseMovement = sumMovements(leaseAccounts);
  if (Math.abs(leaseMovement) > 100) {
    financing.lease_payments = -leaseMovement;  // Decrease = payment (outflow)
  }

  // Calculate CFF Total
  const cff_total = Object.values(financing).reduce((sum, val) => sum + val, 0);

  // ===========================================================================
  // CASH RECONCILIATION
  // ===========================================================================

  const cashAccounts = findAccounts(
    ['cash', 'bank', 'cash equivalent', 'cash on hand', 'cash at bank'],
    'asset',
    'balance_sheet'
  );

  console.log('💵 Cash accounts found:', cashAccounts.length);

  const opening_cash = cashAccounts.reduce((sum, code) => {
    const amount = previousWorkings[code]?.consolidated_amount || 0;
    return sum + amount;
  }, 0);

  const closing_cash = cashAccounts.reduce((sum, code) => {
    const amount = currentWorkings[code]?.consolidated_amount || 0;
    return sum + amount;
  }, 0);

  console.log(`💰 Opening cash: ${opening_cash}, Closing cash: ${closing_cash}`);

  // ===========================================================================
  // RETURN RESULT
  // ===========================================================================

  const result = {
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

  console.log('✅ Cash Flow Statement Generated:', result);

  return result;
}

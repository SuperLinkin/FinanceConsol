'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Droplets,
  FileBarChart,
  Download,
  Save,
  Loader,
  X,
  Layers,
  Building2,
  Calculator,
  Edit3,
  Lock,
  Plus,
  History,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Info,
  Wand2
} from 'lucide-react';

export default function ConsolidationWorkings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statements, setStatements] = useState(null);
  const [originalStatements, setOriginalStatements] = useState(null);
  const [drillDownData, setDrillDownData] = useState(null);
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState('balanceSheet');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [availablePeriods] = useState(['2024', '2023', '2022', '2021', '2020']);
  const [expandedNotes, setExpandedNotes] = useState({});
  const [changes, setChanges] = useState([]);
  const [recentChanges, setRecentChanges] = useState([]);
  const [showChanges, setShowChanges] = useState(false);
  const [currentUser] = useState('John Doe'); // In real app, get from auth
  const [validationChecks, setValidationChecks] = useState([]);
  const [checkResults, setCheckResults] = useState([]);
  const [showValidation, setShowValidation] = useState(true);
  const [showAddCheckModal, setShowAddCheckModal] = useState(false);
  const [newCheck, setNewCheck] = useState({
    check_name: '',
    category: 'custom',
    description: '',
    formula: '',
    severity: 'error'
  });
  const [rawData, setRawData] = useState({
    entities: [],
    trialBalances: [],
    eliminations: [],
    logics: [],
    builds: [],
    coa: []
  });

  useEffect(() => {
    loadConsolidationData();
    loadValidationChecks();
  }, [selectedPeriod]);

  useEffect(() => {
    if (statements) {
      runValidationChecks();
    }
  }, [statements, validationChecks]);

  const loadConsolidationData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [
        entitiesRes,
        trialBalanceRes,
        eliminationsRes,
        logicsRes,
        buildsRes,
        coaRes,
        savedWorkingsRes,
        changesRes
      ] = await Promise.all([
        supabase.from('entities').select('*').eq('is_active', true),
        supabase.from('trial_balance').select('*'),
        supabase.from('eliminations').select('*').eq('is_active', true),
        supabase.from('entity_logic').select('*').eq('is_active', true),
        supabase.from('builder_entries').select('*').eq('is_active', true),
        supabase.from('chart_of_accounts').select('*'),
        supabase.from('consolidation_workings').select('*').eq('period', selectedPeriod).order('updated_at', { ascending: false }),
        supabase.from('consolidation_changes').select('*').eq('period', selectedPeriod).order('changed_at', { ascending: false }).limit(20)
      ]);

      const entities = entitiesRes.data || [];
      const trialBalances = trialBalanceRes.data || [];
      const eliminations = eliminationsRes.data || [];
      const logics = logicsRes.data || [];
      const builds = buildsRes.data || [];
      const coa = coaRes.data || [];

      setRawData({ entities, trialBalances, eliminations, logics, builds, coa });

      // Check if there are saved workings
      console.log('Saved workings response:', savedWorkingsRes);

      if (savedWorkingsRes.data && savedWorkingsRes.data.length > 0) {
        // Load saved workings - there may be multiple records (one per statement type)
        const savedWorkings = savedWorkingsRes.data;
        console.log('Loading saved workings:', savedWorkings.length, 'records');

        // Find each statement type
        const balanceSheetWorking = savedWorkings.find(w => w.statement_type === 'balance_sheet');
        const incomeStatementWorking = savedWorkings.find(w => w.statement_type === 'income_statement');
        const cashFlowWorking = savedWorkings.find(w => w.statement_type === 'cash_flow');
        const equityWorking = savedWorkings.find(w => w.statement_type === 'equity');

        console.log('Found workings:', {
          balanceSheet: !!balanceSheetWorking,
          incomeStatement: !!incomeStatementWorking,
          cashFlow: !!cashFlowWorking,
          equity: !!equityWorking
        });

        // Helper function to process a working into statement format
        const processWorking = (working, trialBalances) => {
          if (!working) return { lineItems: [], totals: {} };

          let lineItems;
          try {
            lineItems = typeof working.line_items === 'string'
              ? JSON.parse(working.line_items)
              : working.line_items;
          } catch (e) {
            console.error('Error parsing line_items:', e);
            lineItems = [];
          }

          // Build trial balance lookup by account code
          const tbByAccount = {};
          trialBalances.forEach(tb => {
            if (!tbByAccount[tb.account_code]) {
              tbByAccount[tb.account_code] = { debit: 0, credit: 0 };
            }
            tbByAccount[tb.account_code].debit += parseFloat(tb.debit || 0);
            tbByAccount[tb.account_code].credit += parseFloat(tb.credit || 0);
          });

          // If lineItems is an array (new format), flatten it
          if (Array.isArray(lineItems)) {
            const flattenLineItems = (items, parentClass = '') => {
              const flattened = [];
              items.forEach(item => {
                let accountClass = parentClass;
                if (item.level === 'class') {
                  accountClass = item.name;
                }

                if (item.level !== 'class') {
                  // Calculate value from trial balance for this line item
                  let calculatedValue = 0;
                  const accounts = item.accounts || [];

                  accounts.forEach(account => {
                    const tbData = tbByAccount[account.account_code];
                    if (tbData) {
                      // Calculate balance based on account class
                      // Assets & Expenses: Debit - Credit (normal debit balance)
                      // Liabilities, Equity, Income: Credit - Debit (normal credit balance)
                      if (['Assets', 'Expenses'].includes(accountClass)) {
                        calculatedValue += (tbData.debit - tbData.credit);
                      } else {
                        calculatedValue += (tbData.credit - tbData.debit);
                      }
                    }
                  });

                  flattened.push({
                    id: item.id || Math.random().toString(),
                    accountCode: item.code || '',
                    label: item.name,
                    accountClass: accountClass,
                    noteRef: item.note_ref || '-',
                    value: calculatedValue,
                    level: item.level,
                    indent: item.indent || 0,
                    isSubtotal: item.is_subtotal || false,
                    isTotal: item.is_total || false,
                    accounts: accounts
                  });
                }

                if (item.children && item.children.length > 0) {
                  flattened.push(...flattenLineItems(item.children, accountClass));
                }
              });
              return flattened;
            };

            const flatItems = flattenLineItems(lineItems);

            // Calculate totals
            const totals = {};
            if (working.statement_type === 'balance_sheet') {
              totals.assets = flatItems
                .filter(item => item.accountClass === 'Assets')
                .reduce((sum, item) => sum + item.value, 0);
              totals.liabilities = flatItems
                .filter(item => item.accountClass === 'Liabilities')
                .reduce((sum, item) => sum + item.value, 0);
              totals.equity = flatItems
                .filter(item => item.accountClass === 'Equity')
                .reduce((sum, item) => sum + item.value, 0);
              totals.netAssets = totals.assets - totals.liabilities - totals.equity;
            } else if (working.statement_type === 'income_statement') {
              totals.revenue = flatItems
                .filter(item => item.accountClass === 'Income')
                .reduce((sum, item) => sum + item.value, 0);
              totals.expenses = flatItems
                .filter(item => item.accountClass === 'Expenses')
                .reduce((sum, item) => sum + item.value, 0);
              totals.netIncome = totals.revenue - totals.expenses;
            } else if (working.statement_type === 'equity') {
              totals.openingBalance = 0; // Will need opening balance logic
              totals.closingBalance = flatItems.reduce((sum, item) => sum + item.value, 0);
            } else if (working.statement_type === 'cash_flow') {
              totals.operating = 0; // Will need cash flow classification
              totals.investing = 0;
              totals.financing = 0;
              totals.netCashFlow = flatItems.reduce((sum, item) => sum + item.value, 0);
            }

            return {
              lineItems: flatItems,
              totals: totals
            };
          } else {
            // Old format
            return lineItems;
          }
        };

        // Process each statement type with trial balances
        const balanceSheet = processWorking(balanceSheetWorking, trialBalances);
        const incomeStatement = processWorking(incomeStatementWorking, trialBalances);
        const cashFlow = processWorking(cashFlowWorking, trialBalances);
        const equity = processWorking(equityWorking, trialBalances);

        console.log('Processed statements:', {
          balanceSheetItems: balanceSheet.lineItems?.length || 0,
          incomeStatementItems: incomeStatement.lineItems?.length || 0,
          cashFlowItems: cashFlow.lineItems?.length || 0,
          equityItems: equity.lineItems?.length || 0
        });

        let notes = [];
        try {
          const firstWorking = savedWorkings[0];
          notes = typeof firstWorking.notes === 'string'
            ? JSON.parse(firstWorking.notes)
            : (firstWorking.notes || []);
        } catch (e) {
          console.error('Error parsing notes:', e);
          notes = [];
        }

        const reconstructedStatements = {
          period: balanceSheetWorking?.period || incomeStatementWorking?.period || selectedPeriod,
          previousPeriod: getPreviousPeriod(balanceSheetWorking?.period || incomeStatementWorking?.period || selectedPeriod),
          balanceSheet,
          incomeStatement,
          equity,
          cashFlow,
          notes,
          tbByEntity: {},
          tbByAccount: {},
          metadata: {
            consolidatedEntities: entities.length,
            eliminationsApplied: eliminations.length,
            adjustmentsApplied: builds.length,
            period: balanceSheetWorking?.period || incomeStatementWorking?.period || selectedPeriod,
            generatedAt: balanceSheetWorking?.updated_at || incomeStatementWorking?.updated_at,
            lastUpdatedBy: balanceSheetWorking?.updated_by || incomeStatementWorking?.updated_by || 'System'
          }
        };

        console.log('🎯 Final reconstructedStatements:', {
          period: reconstructedStatements.period,
          balanceSheetItems: reconstructedStatements.balanceSheet.lineItems.length,
          incomeStatementItems: reconstructedStatements.incomeStatement.lineItems.length,
          hasMetadata: !!reconstructedStatements.metadata
        });

        setStatements(reconstructedStatements);
        setOriginalStatements(JSON.parse(JSON.stringify(reconstructedStatements)));
        console.log('✅ State updated with reconstructed statements');
      } else {
        // Auto-generate from Master COA
        const generatedStatements = generateStatementsFromCOA({
          coa,
          trialBalances,
          eliminations,
          builds,
          entities,
          period: selectedPeriod
        });
        setStatements(generatedStatements);
        setOriginalStatements(JSON.parse(JSON.stringify(generatedStatements)));
      }

      // Load recent changes
      setRecentChanges(changesRes.data || []);

    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading consolidation data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviousPeriod = (period) => {
    const year = parseInt(period);
    return (year - 1).toString();
  };

  const loadValidationChecks = async () => {
    try {
      const { data, error } = await supabase
        .from('validation_checks')
        .select('*')
        .eq('is_active', true)
        .order('check_type', { ascending: true });

      if (!error) {
        setValidationChecks(data || []);
      }
    } catch (error) {
      console.error('Error loading validation checks:', error);
    }
  };

  const autoGenerateWorkings = async () => {
    if (!confirm(`Auto-generate consolidation workings for ${selectedPeriod}? This will create workings based on your Chart of Accounts master hierarchy.`)) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Calling API to generate workings for period:', selectedPeriod);

      const response = await fetch('/api/consolidation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: selectedPeriod,
          created_by: currentUser
        })
      });

      console.log('API response status:', response.status);
      const result = await response.json();
      console.log('API response data:', result);

      if (result.success) {
        alert(`Success! Generated ${result.workings?.length || 0} workings for ${selectedPeriod}`);
        console.log('Workings created:', result.workings);
        // Reload data
        await loadConsolidationData();
      } else {
        console.error('API error:', result.error);
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error auto-generating workings:', error);
      alert('Failed to auto-generate workings: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const runValidationChecks = () => {
    if (!statements) return;

    const results = [];

    // System Check 1: Balance Sheet Balance (Assets = Liabilities + Equity)
    const bsCheck = {
      check_name: 'Balance Sheet Balance',
      category: 'balance',
      severity: 'error',
      status: 'pass',
      expected_value: statements.balanceSheet.totals.assets,
      actual_value: statements.balanceSheet.totals.liabilities + statements.balanceSheet.totals.equity,
      variance: 0,
      message: ''
    };

    const bsVariance = Math.abs(bsCheck.expected_value - bsCheck.actual_value);
    if (bsVariance > 0.01) { // Allow for rounding
      bsCheck.status = 'fail';
      bsCheck.variance = bsVariance;
      bsCheck.message = `Balance Sheet does not balance. Difference: ${formatCurrency(bsVariance)}`;
    } else {
      bsCheck.message = 'Balance Sheet is balanced';
    }
    results.push(bsCheck);

    // System Check 2: Net Income Flow (Income Statement → Equity)
    const niCheck = {
      check_name: 'Net Income Flow to Equity',
      category: 'flow',
      severity: 'warning',
      status: 'pass',
      expected_value: statements.incomeStatement.totals.netIncome,
      actual_value: statements.equity.totals.closingBalance - (statements.equity.totals.closingBalance * 0.9),
      variance: 0,
      message: ''
    };

    const niVariance = Math.abs(niCheck.expected_value - niCheck.actual_value);
    if (niVariance > 0.01) {
      niCheck.status = 'warning';
      niCheck.variance = niVariance;
      niCheck.message = `Net income may not be flowing correctly to equity. Variance: ${formatCurrency(niVariance)}`;
    } else {
      niCheck.message = 'Net income flows correctly to equity';
    }
    results.push(niCheck);

    // System Check 3: Zero Total Check (Assets - Liabilities - Equity = 0)
    const zeroCheck = {
      check_name: 'Zero Total Verification',
      category: 'balance',
      severity: 'error',
      status: 'pass',
      expected_value: 0,
      actual_value: statements.balanceSheet.totals.assets - statements.balanceSheet.totals.liabilities - statements.balanceSheet.totals.equity,
      variance: 0,
      message: ''
    };

    if (Math.abs(zeroCheck.actual_value) > 0.01) {
      zeroCheck.status = 'fail';
      zeroCheck.variance = Math.abs(zeroCheck.actual_value);
      zeroCheck.message = `Balancing error detected: ${formatCurrency(zeroCheck.actual_value)}`;
    } else {
      zeroCheck.message = 'Zero balance verification passed';
    }
    results.push(zeroCheck);

    // System Check 4: Negative Equity Check
    const negEquityCheck = {
      check_name: 'Negative Equity Check',
      category: 'balance',
      severity: 'warning',
      status: 'pass',
      expected_value: 'Positive',
      actual_value: statements.balanceSheet.totals.equity,
      variance: 0,
      message: ''
    };

    if (statements.balanceSheet.totals.equity < 0) {
      negEquityCheck.status = 'warning';
      negEquityCheck.message = `Company has negative equity: ${formatCurrency(statements.balanceSheet.totals.equity)}`;
    } else {
      negEquityCheck.message = 'Equity is positive';
    }
    results.push(negEquityCheck);

    // System Check 5: Revenue Reasonableness
    const revenueCheck = {
      check_name: 'Revenue Reasonableness',
      category: 'balance',
      severity: 'info',
      status: 'pass',
      expected_value: '> 0',
      actual_value: statements.incomeStatement.totals.revenue,
      variance: 0,
      message: ''
    };

    if (statements.incomeStatement.totals.revenue === 0) {
      revenueCheck.status = 'warning';
      revenueCheck.message = 'No revenue recorded for the period';
    } else if (statements.incomeStatement.totals.revenue < 0) {
      revenueCheck.status = 'fail';
      revenueCheck.message = 'Revenue is negative - please review';
    } else {
      revenueCheck.message = `Revenue: ${formatCurrency(statements.incomeStatement.totals.revenue)}`;
    }
    results.push(revenueCheck);

    // Run custom checks
    validationChecks.forEach(check => {
      if (check.check_type === 'custom') {
        // Custom check logic would go here
        // For now, just add as info
        results.push({
          check_name: check.check_name,
          category: check.category,
          severity: check.severity,
          status: 'info',
          expected_value: '',
          actual_value: '',
          variance: 0,
          message: check.description || 'Custom check - manual review required'
        });
      }
    });

    setCheckResults(results);
  };

  const handleAddCustomCheck = async () => {
    if (!newCheck.check_name || !newCheck.description) {
      alert('Please provide check name and description');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('validation_checks')
        .insert([{
          check_name: newCheck.check_name,
          check_type: 'custom',
          category: newCheck.category,
          description: newCheck.description,
          formula: newCheck.formula,
          severity: newCheck.severity,
          is_active: true,
          applies_to: 'all',
          created_by: currentUser
        }])
        .select();

      if (error) throw error;

      setValidationChecks(prev => [...prev, data[0]]);
      setShowAddCheckModal(false);
      setNewCheck({
        check_name: '',
        category: 'custom',
        description: '',
        formula: '',
        severity: 'error'
      });

      alert('Custom check added successfully!');
    } catch (error) {
      console.error('Error adding check:', error);
      alert('Error adding check: ' + error.message);
    }
  };

  const generateStatementsFromCOA = (params) => {
    const { coa, trialBalances, eliminations, builds, entities, period } = params;

    const coaByStatement = {
      'Balance Sheet': [],
      'Income Statement': [],
      'Changes in Equity': [],
      'Cash Flow': [],
      'Notes': []
    };

    coa.forEach(account => {
      const statement = account.financial_statement || 'Balance Sheet';
      if (coaByStatement[statement]) {
        coaByStatement[statement].push(account);
      }
    });

    const tbByAccount = {};
    const tbByEntity = {};

    trialBalances.forEach(tb => {
      const accountCode = tb.account_code;
      const entityId = tb.entity_id;

      if (!tbByAccount[accountCode]) {
        tbByAccount[accountCode] = { debit: 0, credit: 0, balance: 0, items: [] };
      }
      tbByAccount[accountCode].debit += parseFloat(tb.debit_balance || 0);
      tbByAccount[accountCode].credit += parseFloat(tb.credit_balance || 0);
      tbByAccount[accountCode].items.push(tb);

      if (!tbByEntity[entityId]) {
        tbByEntity[entityId] = {};
      }
      if (!tbByEntity[entityId][accountCode]) {
        tbByEntity[entityId][accountCode] = { debit: 0, credit: 0, balance: 0, items: [] };
      }
      tbByEntity[entityId][accountCode].debit += parseFloat(tb.debit_balance || 0);
      tbByEntity[entityId][accountCode].credit += parseFloat(tb.credit_balance || 0);
      tbByEntity[entityId][accountCode].items.push(tb);
    });

    Object.keys(tbByAccount).forEach(accountCode => {
      const account = coa.find(a => a.account_code === accountCode);
      const data = tbByAccount[accountCode];
      const accountClass = account?.account_class || 'Assets';

      if (['Assets', 'Expenses'].includes(accountClass)) {
        data.balance = data.debit - data.credit;
      } else {
        data.balance = data.credit - data.debit;
      }
    });

    const buildLineItems = (statementType) => {
      return coaByStatement[statementType]
        .sort((a, b) => (a.account_code || '').localeCompare(b.account_code || ''))
        .map((account, index) => {
          const tbData = tbByAccount[account.account_code] || { balance: 0, items: [] };
          return {
            id: `${statementType.replace(/\s/g, '-').toLowerCase()}-${account.id}`,
            accountCode: account.account_code,
            label: account.account_name,
            value: tbData.balance,
            noteRef: account.note_ref || (index + 1),
            accountClass: account.account_class,
            level: account.level_1 || 1,
            breakdown: tbData.items,
            isEditable: true
          };
        });
    };

    const balanceSheetItems = buildLineItems('Balance Sheet');
    const incomeStatementItems = buildLineItems('Income Statement');
    const equityItems = buildLineItems('Changes in Equity');
    const cashFlowItems = buildLineItems('Cash Flow');

    const totalAssets = balanceSheetItems
      .filter(item => item.accountClass === 'Assets')
      .reduce((sum, item) => sum + item.value, 0);

    const totalLiabilities = balanceSheetItems
      .filter(item => item.accountClass === 'Liabilities')
      .reduce((sum, item) => sum + item.value, 0);

    const totalEquity = balanceSheetItems
      .filter(item => item.accountClass === 'Equity')
      .reduce((sum, item) => sum + item.value, 0);

    const totalRevenue = incomeStatementItems
      .filter(item => item.accountClass === 'Income')
      .reduce((sum, item) => sum + item.value, 0);

    const totalExpenses = incomeStatementItems
      .filter(item => item.accountClass === 'Expenses')
      .reduce((sum, item) => sum + item.value, 0);

    const netIncome = totalRevenue - totalExpenses;

    // Generate notes with sub-breakdowns
    const notesData = {};
    [...balanceSheetItems, ...incomeStatementItems, ...equityItems, ...cashFlowItems].forEach(item => {
      if (!notesData[item.noteRef]) {
        notesData[item.noteRef] = {
          id: `note-${item.noteRef}`,
          number: item.noteRef,
          title: `Note ${item.noteRef}`,
          lineItems: []
        };
      }
      notesData[item.noteRef].lineItems.push({
        accountCode: item.accountCode,
        accountName: item.label,
        value: item.value,
        breakdown: item.breakdown
      });
    });

    return {
      period,
      previousPeriod: getPreviousPeriod(period),
      balanceSheet: {
        lineItems: balanceSheetItems,
        totals: { assets: totalAssets, liabilities: totalLiabilities, equity: totalEquity }
      },
      incomeStatement: {
        lineItems: incomeStatementItems,
        totals: { revenue: totalRevenue, expenses: totalExpenses, netIncome }
      },
      equity: {
        lineItems: equityItems,
        totals: { closingBalance: totalEquity }
      },
      cashFlow: {
        lineItems: cashFlowItems,
        totals: { netCashFlow: netIncome }
      },
      notes: Object.values(notesData),
      tbByEntity,
      tbByAccount,
      metadata: {
        consolidatedEntities: entities.length,
        eliminationsApplied: eliminations.length,
        adjustmentsApplied: builds.length,
        period,
        generatedAt: new Date().toISOString()
      }
    };
  };

  const handleDrillDown = (lineItem) => {
    if (!lineItem) return;

    const { entities } = rawData;
    const { tbByEntity } = statements;

    const entityBreakdown = [];

    entities.forEach(entity => {
      const entityTB = tbByEntity?.[entity.id];
      if (!entityTB || !entityTB[lineItem.accountCode]) return;

      const entityData = entityTB[lineItem.accountCode];
      entityBreakdown.push({
        type: 'entity',
        entityId: entity.id,
        entityName: entity.entity_name,
        entityCode: entity.entity_code,
        amount: entityData.balance,
        debit: entityData.debit,
        credit: entityData.credit,
        items: entityData.items
      });
    });

    setDrillDownData({
      lineItem,
      entityBreakdown,
      totalAmount: lineItem.value
    });
    setShowDrillDown(true);
  };

  const handleLineItemEdit = (statementType, lineItemId, newValue) => {
    setStatements(prev => {
      const updated = { ...prev };
      const statement = updated[statementType];

      if (!statement) return prev;

      const itemIndex = statement.lineItems.findIndex(item => item.id === lineItemId);
      if (itemIndex === -1) return prev;

      const oldValue = statement.lineItems[itemIndex].value;
      statement.lineItems[itemIndex].value = parseFloat(newValue) || 0;

      // Track the change
      const change = {
        id: Date.now(),
        statementType,
        lineItemId,
        accountCode: statement.lineItems[itemIndex].accountCode,
        accountName: statement.lineItems[itemIndex].label,
        field: 'value',
        oldValue,
        newValue: parseFloat(newValue) || 0,
        changedBy: currentUser,
        changedAt: new Date().toISOString()
      };
      setChanges(prev => [...prev, change]);

      // Recalculate totals
      if (statementType === 'balanceSheet') {
        updated.balanceSheet.totals = {
          assets: statement.lineItems.filter(i => i.accountClass === 'Assets').reduce((sum, i) => sum + i.value, 0),
          liabilities: statement.lineItems.filter(i => i.accountClass === 'Liabilities').reduce((sum, i) => sum + i.value, 0),
          equity: statement.lineItems.filter(i => i.accountClass === 'Equity').reduce((sum, i) => sum + i.value, 0)
        };
      } else if (statementType === 'incomeStatement') {
        const revenue = statement.lineItems.filter(i => i.accountClass === 'Income').reduce((sum, i) => sum + i.value, 0);
        const expenses = statement.lineItems.filter(i => i.accountClass === 'Expenses').reduce((sum, i) => sum + i.value, 0);
        updated.incomeStatement.totals = { revenue, expenses, netIncome: revenue - expenses };
      }

      return updated;
    });
  };

  const handleSave = async () => {
    if (changes.length === 0) {
      alert('No changes to save');
      return;
    }

    setIsSaving(true);
    try {
      // Save the workings
      const workingData = {
        period: selectedPeriod,
        statement_type: 'all',
        line_items: JSON.stringify({
          balanceSheet: statements.balanceSheet,
          incomeStatement: statements.incomeStatement,
          equity: statements.equity,
          cashFlow: statements.cashFlow
        }),
        totals: JSON.stringify({
          balanceSheet: statements.balanceSheet.totals,
          incomeStatement: statements.incomeStatement.totals,
          equity: statements.equity.totals,
          cashFlow: statements.cashFlow.totals
        }),
        notes: JSON.stringify(statements.notes),
        status: 'draft',
        created_by: currentUser,
        updated_by: currentUser,
        updated_at: new Date().toISOString()
      };

      const { data: savedWorking, error: saveError } = await supabase
        .from('consolidation_workings')
        .upsert(workingData, { onConflict: 'period' })
        .select();

      if (saveError) throw saveError;

      // Save all changes to audit trail
      const changeRecords = changes.map(change => ({
        working_id: savedWorking[0].id,
        period: selectedPeriod,
        statement_type: change.statementType,
        line_item_id: change.lineItemId,
        account_code: change.accountCode,
        account_name: change.accountName,
        field_changed: change.field,
        old_value: change.oldValue.toString(),
        new_value: change.newValue.toString(),
        change_type: 'edit',
        changed_by: currentUser,
        changed_at: change.changedAt
      }));

      const { error: changesError } = await supabase
        .from('consolidation_changes')
        .insert(changeRecords);

      if (changesError) throw changesError;

      // Clear changes and update original
      setChanges([]);
      setOriginalStatements(JSON.parse(JSON.stringify(statements)));

      // Reload recent changes
      const { data: recentChangesData } = await supabase
        .from('consolidation_changes')
        .select('*')
        .eq('period', selectedPeriod)
        .order('changed_at', { ascending: false })
        .limit(20);

      setRecentChanges(recentChangesData || []);

      alert('Consolidation workings saved successfully!');

    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderDrillDownModal = () => {
    if (!showDrillDown || !drillDownData) return null;

    const { lineItem, entityBreakdown, totalAmount } = drillDownData;

    return (
      <>
        <div className="fixed inset-0 bg-slate-900/60 z-50" onClick={() => setShowDrillDown(false)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-[#101828] text-white px-8 py-5 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{lineItem.label}</h3>
                  <p className="text-sm text-slate-400">Account Code: {lineItem.accountCode}</p>
                </div>
              </div>
              <button onClick={() => setShowDrillDown(false)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)] bg-slate-50">
              <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Consolidated Amount</p>
                    <p className="text-3xl font-bold text-[#101828]">{formatCurrency(totalAmount)}</p>
                  </div>
                  <div className="w-14 h-14 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Calculator size={28} className="text-indigo-600" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-semibold text-[#101828] mb-4">Entity Breakdown</h4>
                <div className="space-y-3">
                  {entityBreakdown.map((item, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-indigo-200 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#101828] rounded-md flex items-center justify-center">
                            <Building2 size={16} className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#101828]">{item.entityName}</p>
                            <p className="text-xs text-slate-500">{item.entityCode}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-[#101828]">{formatCurrency(item.amount)}</p>
                          <p className="text-xs text-slate-500">Dr: {formatCurrency(item.debit)} | Cr: {formatCurrency(item.credit)}</p>
                        </div>
                      </div>

                      {item.items && item.items.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <p className="text-xs font-semibold text-slate-600 mb-2">Trial Balance Items</p>
                          <div className="space-y-1.5">
                            {item.items.slice(0, 5).map((tbItem, tbIndex) => (
                              <div key={tbIndex} className="flex justify-between text-sm">
                                <span className="text-slate-600">{tbItem.account_code} - {tbItem.account_name || 'Account'}</span>
                                <span className="font-medium text-[#101828]">
                                  {formatCurrency((parseFloat(tbItem.debit_balance || 0) - parseFloat(tbItem.credit_balance || 0)))}
                                </span>
                              </div>
                            ))}
                            {item.items.length > 5 && (
                              <p className="text-xs text-slate-500">+ {item.items.length - 5} more items</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderStatementTable = (statementData, statementType) => {
    if (!statementData) return null;

    const { lineItems, totals } = statementData;

    // Group by account class for proper hierarchy
    const groupedItems = {};
    lineItems.forEach(item => {
      const group = item.accountClass || 'Other';
      if (!groupedItems[group]) {
        groupedItems[group] = [];
      }
      groupedItems[group].push(item);
    });

    // Define order for Balance Sheet
    const bsOrder = ['Assets', 'Liabilities', 'Equity'];
    const isOrder = ['Income', 'Expenses'];

    const orderedGroups = statementType === 'balanceSheet'
      ? bsOrder.filter(key => groupedItems[key])
      : statementType === 'incomeStatement'
      ? isOrder.filter(key => groupedItems[key])
      : Object.keys(groupedItems);

    return (
      <div className="bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-50">
                <th className="text-left py-3 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">Account</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-20">Note</th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider w-40">
                  {statements.period}
                </th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider w-40">
                  {statements.previousPeriod}
                </th>
              </tr>
            </thead>
            <tbody>
              {orderedGroups.map((group, groupIndex) => (
                <React.Fragment key={group}>
                  {/* Group Header */}
                  <tr className="bg-slate-100 border-t-2 border-slate-300">
                    <td colSpan={4} className="py-2.5 px-6">
                      <div className="text-sm font-bold text-[#101828] uppercase">{group}</div>
                    </td>
                  </tr>

                  {/* Line Items */}
                  {groupedItems[group].map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      <td className="py-3 px-6 pl-10">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-sm font-medium text-[#101828]">{item.label}</div>
                            <div className="text-xs text-slate-500">{item.accountCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
                          {item.noteRef}
                        </button>
                      </td>
                      <td className="text-right py-3 px-6">
                        {isEditMode ? (
                          <input
                            type="number"
                            value={item.value}
                            onChange={(e) => handleLineItemEdit(statementType, item.id, e.target.value)}
                            className="w-full text-right text-sm font-semibold text-[#101828] px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        ) : (
                          <button
                            onClick={() => handleDrillDown(item)}
                            className="text-sm font-semibold text-[#101828] hover:text-indigo-600 transition-colors"
                          >
                            {formatCurrency(item.value)}
                          </button>
                        )}
                      </td>
                      <td className="text-right py-3 px-6">
                        <span className="text-sm text-slate-400">-</span>
                      </td>
                    </tr>
                  ))}

                  {/* Subtotal for group */}
                  {statementType === 'balanceSheet' && (
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                      <td className="py-2.5 px-6 pl-10">
                        <div className="text-sm font-bold text-[#101828]">Total {group}</div>
                      </td>
                      <td></td>
                      <td className="text-right py-2.5 px-6">
                        <div className="text-sm font-bold text-[#101828]">
                          {formatCurrency(groupedItems[group].reduce((sum, item) => sum + item.value, 0))}
                        </div>
                      </td>
                      <td className="text-right py-2.5 px-6">
                        <span className="text-sm font-bold text-slate-400">-</span>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {/* Grand Total */}
              <tr className="bg-[#101828] text-white border-t-4 border-slate-900">
                <td className="py-4 px-6">
                  <div className="text-sm font-bold">
                    {statementType === 'balanceSheet' ? 'Total Assets' :
                     statementType === 'incomeStatement' ? 'Net Income' :
                     statementType === 'equity' ? 'Closing Balance' :
                     'Net Cash Flow'}
                  </div>
                </td>
                <td></td>
                <td className="text-right py-4 px-6">
                  <div className="text-sm font-bold">
                    {formatCurrency(
                      statementType === 'balanceSheet' ? totals.assets :
                      statementType === 'incomeStatement' ? totals.netIncome :
                      statementType === 'equity' ? totals.closingBalance :
                      totals.netCashFlow
                    )}
                  </div>
                </td>
                <td className="text-right py-4 px-6">
                  <span className="text-sm font-bold text-slate-300">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderNotes = () => {
    if (!statements || !statements.notes) return null;

    return (
      <div className="bg-white">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-[#101828]">Notes to Financial Statements</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {statements.notes.map((note) => (
            <div key={note.id} className="p-6">
              <button
                onClick={() => setExpandedNotes(prev => ({ ...prev, [note.id]: !prev[note.id] }))}
                className="w-full flex items-center justify-between text-left mb-4"
              >
                <h4 className="text-base font-semibold text-[#101828]">
                  Note {note.number}: {note.title}
                </h4>
                <Plus size={18} className={`text-slate-400 transition-transform ${expandedNotes[note.id] ? 'rotate-45' : ''}`} />
              </button>

              {expandedNotes[note.id] && (
                <div className="space-y-3">
                  {note.lineItems.map((item, idx) => (
                    <div key={idx} className="pl-4 border-l-2 border-indigo-200 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-[#101828]">{item.accountName}</p>
                          <p className="text-xs text-slate-500">{item.accountCode}</p>
                        </div>
                        <p className="text-sm font-semibold text-[#101828]">{formatCurrency(item.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderValidationPanel = () => {
    const failCount = checkResults.filter(r => r.status === 'fail').length;
    const warningCount = checkResults.filter(r => r.status === 'warning').length;
    const passCount = checkResults.filter(r => r.status === 'pass').length;

    return (
      <div className="bg-white rounded-lg border border-slate-200 mb-6">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-indigo-600" />
              <h3 className="text-lg font-semibold text-[#101828]">Validation Checks</h3>
            </div>
            <button
              onClick={() => setShowAddCheckModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus size={16} />
              Add Check
            </button>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-600">{passCount} Passed</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-slate-600">{warningCount} Warnings</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-600">{failCount} Failed</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200 max-h-[500px] overflow-y-auto">
          {checkResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Shield size={48} className="mx-auto mb-3 text-slate-300" />
              <p>No validation checks run yet</p>
            </div>
          ) : (
            checkResults.map((result, index) => {
              const StatusIcon = result.status === 'pass' ? CheckCircle2 : result.status === 'fail' ? XCircle : AlertTriangle;
              const statusColor = result.status === 'pass' ? 'text-green-600' : result.status === 'fail' ? 'text-red-600' : 'text-amber-600';
              const bgColor = result.status === 'pass' ? 'bg-green-50' : result.status === 'fail' ? 'bg-red-50' : 'bg-amber-50';

              return (
                <div key={index} className={`p-4 hover:bg-slate-50 transition-colors ${bgColor}`}>
                  <div className="flex items-start gap-3">
                    <StatusIcon size={20} className={`${statusColor} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-[#101828]">{result.check_name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          result.severity === 'error' ? 'bg-red-100 text-red-700' :
                          result.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {result.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{result.message}</p>
                      {result.variance > 0 && (
                        <div className="text-xs text-slate-500">
                          <span>Expected: {typeof result.expected_value === 'number' ? formatCurrency(result.expected_value) : result.expected_value}</span>
                          <span className="mx-2">|</span>
                          <span>Actual: {typeof result.actual_value === 'number' ? formatCurrency(result.actual_value) : result.actual_value}</span>
                          <span className="mx-2">|</span>
                          <span className="text-red-600 font-medium">Variance: {formatCurrency(result.variance)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderAddCheckModal = () => {
    if (!showAddCheckModal) return null;

    return (
      <>
        <div className="fixed inset-0 bg-slate-900/60 z-50" onClick={() => setShowAddCheckModal(false)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
            <div className="bg-[#101828] text-white px-8 py-5 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center gap-3">
                <Shield size={24} className="text-indigo-400" />
                <h3 className="text-xl font-semibold">Add Custom Validation Check</h3>
              </div>
              <button onClick={() => setShowAddCheckModal(false)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Check Name*</label>
                  <input
                    type="text"
                    value={newCheck.check_name}
                    onChange={(e) => setNewCheck({ ...newCheck, check_name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Intercompany Reconciliation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={newCheck.category}
                    onChange={(e) => setNewCheck({ ...newCheck, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="custom">Custom</option>
                    <option value="balance">Balance</option>
                    <option value="flow">Flow</option>
                    <option value="ratio">Ratio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
                  <select
                    value={newCheck.severity}
                    onChange={(e) => setNewCheck({ ...newCheck, severity: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description*</label>
                  <textarea
                    value={newCheck.description}
                    onChange={(e) => setNewCheck({ ...newCheck, description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Describe what this check validates..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Formula / Logic <span className="text-slate-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={newCheck.formula}
                    onChange={(e) => setNewCheck({ ...newCheck, formula: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., SUM(Intercompany_AR) + SUM(Intercompany_AP) = 0"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowAddCheckModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomCheck}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Add Check
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderChangesPanel = () => {
    return (
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History size={20} className="text-slate-600" />
            <h3 className="text-lg font-semibold text-[#101828]">Recent Changes</h3>
          </div>
          <button
            onClick={() => setShowChanges(!showChanges)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {showChanges ? 'Hide' : 'Show'}
          </button>
        </div>

        {showChanges && (
          <div className="divide-y divide-slate-200 max-h-[400px] overflow-y-auto">
            {changes.length === 0 && recentChanges.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p>No changes recorded</p>
              </div>
            ) : (
              <>
                {/* Unsaved changes */}
                {changes.length > 0 && (
                  <div className="bg-amber-50 border-b-2 border-amber-200">
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-amber-800 mb-3">
                        <AlertCircle size={16} />
                        <span className="text-sm font-semibold">Unsaved Changes ({changes.length})</span>
                      </div>
                      <div className="space-y-2">
                        {changes.map(change => (
                          <div key={change.id} className="text-sm bg-white rounded p-3 border border-amber-200">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-[#101828]">{change.accountName}</span>
                              <span className="text-xs text-slate-500">{change.accountCode}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <span className="line-through">{formatCurrency(change.oldValue)}</span>
                              <span>→</span>
                              <span className="font-semibold text-amber-700">{formatCurrency(change.newValue)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Saved changes */}
                {recentChanges.map(change => (
                  <div key={change.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-[#101828]">{change.account_name}</p>
                        <p className="text-xs text-slate-500">{change.account_code}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                          <span className="line-through">{change.old_value}</span>
                          <span>→</span>
                          <span className="font-semibold">{change.new_value}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>{change.changed_by}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{formatDateTime(change.changed_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading consolidation workings...</p>
        </div>
      </div>
    );
  }

  const statementTabs = [
    { id: 'balanceSheet', label: 'Balance Sheet', icon: FileText },
    { id: 'incomeStatement', label: 'Income Statement', icon: DollarSign },
    { id: 'equity', label: 'Changes in Equity', icon: TrendingUp },
    { id: 'cashFlow', label: 'Cash Flow Statement', icon: Droplets },
    { id: 'notes', label: 'Notes', icon: FileBarChart }
  ];

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader title="Consolidation Workings" subtitle="Review and edit consolidated financial statements" />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="col-span-2 space-y-6">
            {/* Control Bar */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {availablePeriods.map(period => (
                      <option key={period} value={period}>FY {period}</option>
                    ))}
                  </select>

                  <button
                    onClick={autoGenerateWorkings}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wand2 size={16} />
                    Auto-Generate
                  </button>

                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isEditMode
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isEditMode ? <><Lock size={16} /> Editing</> : <><Edit3 size={16} /> Edit Mode</>}
                  </button>

                  {changes.length > 0 && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                      {changes.length} unsaved change{changes.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || changes.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save
                      </>
                    )}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#101828] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] transition-colors">
                    <Download size={16} />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Statement Tabs */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="border-b border-slate-200">
                <div className="flex overflow-x-auto">
                  {statementTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedStatement(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          selectedStatement === tab.id
                            ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Statement Content */}
              <div>
                {selectedStatement === 'balanceSheet' && renderStatementTable(statements.balanceSheet, 'balanceSheet')}
                {selectedStatement === 'incomeStatement' && renderStatementTable(statements.incomeStatement, 'incomeStatement')}
                {selectedStatement === 'equity' && renderStatementTable(statements.equity, 'equity')}
                {selectedStatement === 'cashFlow' && renderStatementTable(statements.cashFlow, 'cashFlow')}
                {selectedStatement === 'notes' && renderNotes()}
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="col-span-1">
            {renderValidationPanel()}
            {renderChangesPanel()}
          </div>
        </div>

        </div>
      </div>

      {/* Modals */}
      {renderDrillDownModal()}
      {renderAddCheckModal()}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  Download,
  Save,
  Loader,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  RefreshCw,
  Calculator,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  X,
  Check
} from 'lucide-react';

export default function CashFlowStatement() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [comparePeriod, setComparePeriod] = useState('');
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [entities, setEntities] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [trialBalances, setTrialBalances] = useState([]);
  const [compareTrialBalances, setCompareTrialBalances] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    operating: true,
    investing: true,
    financing: true,
    forex: true
  });

  // Formula builder states
  const [showFormulaPanel, setShowFormulaPanel] = useState(false);
  const [currentLineItem, setCurrentLineItem] = useState(null);
  const [customFormulas, setCustomFormulas] = useState({});
  const [formulaBuilder, setFormulaBuilder] = useState({
    name: '',
    formula: [],
    type: 'note' // note, subnote, subclass, class
  });

  // Cash flow data structure
  const [cashFlowData, setCashFlowData] = useState({
    operating: {
      profitLoss: 0,
      adjustments: {},
      workingCapitalChanges: {},
      total: 0
    },
    investing: {
      items: {},
      total: 0
    },
    financing: {
      items: {},
      total: 0
    },
    forex: 0,
    openingCash: 0,
    closingCash: 0,
    movementInCash: 0,
    calculatedClosingCash: 0
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, comparePeriod]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading cash flow statement data...');

      // Load trial balance data
      const tbResponse = await fetch('/api/trial-balance');
      if (!tbResponse.ok) {
        throw new Error('Failed to fetch trial balance data');
      }
      const allTBData = await tbResponse.json();

      // Get unique periods
      const uniquePeriods = [...new Set((allTBData || []).map(tb => tb.period))].sort().reverse();
      const periodOptions = uniquePeriods.map(period => ({
        period_code: period,
        period_name: period
      }));

      setAvailablePeriods(periodOptions);

      // Set initial periods if not set
      if (!selectedPeriod && periodOptions.length > 0) {
        setSelectedPeriod(periodOptions[0].period_code);
        if (periodOptions.length > 1) {
          setComparePeriod(periodOptions[1].period_code);
        }
        return;
      }

      if (!selectedPeriod) {
        setIsLoading(false);
        return;
      }

      // Load entities and COA
      const [entitiesResponse, coaRes] = await Promise.all([
        fetch('/api/entities'),
        supabase.from('chart_of_accounts').select('*').eq('is_active', true)
      ]);

      const entitiesData = await entitiesResponse.json();

      // Filter trial balances for both periods
      const tbDataForPeriod = allTBData.filter(tb => tb.period === selectedPeriod);
      const tbDataForComparePeriod = comparePeriod ? allTBData.filter(tb => tb.period === comparePeriod) : [];

      setEntities(entitiesData || []);
      setGlAccounts(coaRes.data || []);
      setTrialBalances(tbDataForPeriod || []);
      setCompareTrialBalances(tbDataForComparePeriod || []);

      // Calculate cash flow
      calculateCashFlow(coaRes.data, entitiesData, tbDataForPeriod, tbDataForComparePeriod);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCashFlow = (coa, entitiesData, currentTB, previousTB) => {
    // 1. Calculate Operating Profit/Loss
    const revenueAccounts = coa.filter(acc => ['Revenue', 'Income'].includes(acc.class_name));
    const expenseAccounts = coa.filter(acc => acc.class_name === 'Expenses');

    let totalRevenue = 0;
    let totalExpenses = 0;

    currentTB.forEach(tb => {
      const account = coa.find(acc => acc.account_code === tb.account_code);
      if (account) {
        const debit = parseFloat(tb.debit || 0);
        const credit = parseFloat(tb.credit || 0);

        if (['Revenue', 'Income'].includes(account.class_name)) {
          totalRevenue += (credit - debit);
        } else if (account.class_name === 'Expenses') {
          totalExpenses += (debit - credit);
        }
      }
    });

    const profitLoss = totalRevenue - totalExpenses;

    // 2. Calculate Adjustments (Non-cash items)
    const adjustments = calculateAdjustments(coa, currentTB);

    // 3. Calculate Changes in Working Capital
    const workingCapitalChanges = calculateWorkingCapitalChanges(coa, currentTB, previousTB);

    // 4. Calculate Investing Activities
    const investingActivities = calculateInvestingActivities(coa, currentTB, previousTB);

    // 5. Calculate Financing Activities
    const financingActivities = calculateFinancingActivities(coa, currentTB, previousTB);

    // 6. Forex adjustment (placeholder - would need forex data)
    const forexAdjustment = 0;

    // 7. Calculate cash balances
    const openingCash = calculateOpeningCash(coa, previousTB);
    const closingCash = calculateClosingCash(coa, currentTB);

    // Operating cash flow
    const operatingCashFlow = profitLoss +
      Object.values(adjustments).reduce((sum, val) => sum + val, 0) +
      Object.values(workingCapitalChanges).reduce((sum, val) => sum + val, 0);

    const investingCashFlow = Object.values(investingActivities).reduce((sum, val) => sum + val, 0);
    const financingCashFlow = Object.values(financingActivities).reduce((sum, val) => sum + val, 0);

    const movementInCash = operatingCashFlow + investingCashFlow + financingCashFlow + forexAdjustment;

    setCashFlowData({
      operating: {
        profitLoss,
        adjustments,
        workingCapitalChanges,
        total: operatingCashFlow
      },
      investing: {
        items: investingActivities,
        total: investingCashFlow
      },
      financing: {
        items: financingActivities,
        total: financingCashFlow
      },
      forex: forexAdjustment,
      openingCash,
      closingCash,
      movementInCash,
      calculatedClosingCash: openingCash + movementInCash
    });
  };

  const calculateAdjustments = (coa, currentTB) => {
    const adjustments = {};

    // Depreciation and Amortization
    const depreciationAccounts = coa.filter(acc =>
      acc.account_name && (
        acc.account_name.toLowerCase().includes('depreciation') ||
        acc.account_name.toLowerCase().includes('amortization')
      )
    );

    let totalDepreciation = 0;
    depreciationAccounts.forEach(acc => {
      const tbEntries = currentTB.filter(tb => tb.account_code === acc.account_code);
      tbEntries.forEach(tb => {
        const debit = parseFloat(tb.debit || 0);
        const credit = parseFloat(tb.credit || 0);
        totalDepreciation += (debit - credit);
      });
    });

    if (totalDepreciation !== 0) {
      adjustments['Depreciation and Amortization'] = totalDepreciation;
    }

    // Provisions
    const provisionAccounts = coa.filter(acc =>
      acc.account_name && acc.account_name.toLowerCase().includes('provision')
    );

    let totalProvisions = 0;
    provisionAccounts.forEach(acc => {
      const tbEntries = currentTB.filter(tb => tb.account_code === acc.account_code);
      tbEntries.forEach(tb => {
        const debit = parseFloat(tb.debit || 0);
        const credit = parseFloat(tb.credit || 0);
        totalProvisions += (credit - debit);
      });
    });

    if (totalProvisions !== 0) {
      adjustments['Provisions'] = totalProvisions;
    }

    return adjustments;
  };

  const calculateWorkingCapitalChanges = (coa, currentTB, previousTB) => {
    const changes = {};

    // Working capital categories
    const workingCapitalCategories = [
      { name: 'Trade Receivables', keywords: ['receivable', 'debtors', 'accounts receivable'] },
      { name: 'Inventory', keywords: ['inventory', 'stock'] },
      { name: 'Trade Payables', keywords: ['payable', 'creditors', 'accounts payable'] },
      { name: 'Prepayments', keywords: ['prepayment', 'prepaid'] },
      { name: 'Accruals', keywords: ['accrual', 'accrued'] }
    ];

    workingCapitalCategories.forEach(category => {
      const accounts = coa.filter(acc => {
        const name = (acc.account_name || '').toLowerCase();
        return category.keywords.some(keyword => name.includes(keyword));
      });

      if (accounts.length > 0) {
        let currentBalance = 0;
        let previousBalance = 0;

        accounts.forEach(acc => {
          // Current period
          const currentEntries = currentTB.filter(tb => tb.account_code === acc.account_code);
          currentEntries.forEach(tb => {
            const debit = parseFloat(tb.debit || 0);
            const credit = parseFloat(tb.credit || 0);
            currentBalance += (debit - credit);
          });

          // Previous period
          if (previousTB.length > 0) {
            const previousEntries = previousTB.filter(tb => tb.account_code === acc.account_code);
            previousEntries.forEach(tb => {
              const debit = parseFloat(tb.debit || 0);
              const credit = parseFloat(tb.credit || 0);
              previousBalance += (debit - credit);
            });
          }
        });

        const change = currentBalance - previousBalance;
        if (change !== 0) {
          // For assets (receivables, inventory): increase = negative cash flow, decrease = positive
          // For liabilities (payables, accruals): increase = positive cash flow, decrease = negative
          const isLiability = category.name.includes('Payable') || category.name.includes('Accrual');
          changes[category.name] = isLiability ? change : -change;
        }
      }
    });

    return changes;
  };

  const calculateInvestingActivities = (coa, currentTB, previousTB) => {
    const activities = {};

    // Fixed Assets categories
    const fixedAssetCategories = [
      { name: 'Property, Plant & Equipment', keywords: ['property', 'plant', 'equipment', 'ppe', 'fixed asset'] },
      { name: 'Intangible Assets', keywords: ['intangible', 'goodwill', 'patent', 'trademark'] },
      { name: 'Investments', keywords: ['investment', 'subsidiary', 'associate'] }
    ];

    fixedAssetCategories.forEach(category => {
      const accounts = coa.filter(acc => {
        const name = (acc.account_name || '').toLowerCase();
        const note = (acc.note_name || '').toLowerCase();
        return category.keywords.some(keyword => name.includes(keyword) || note.includes(keyword));
      });

      if (accounts.length > 0) {
        let currentBalance = 0;
        let previousBalance = 0;

        accounts.forEach(acc => {
          // Current period
          const currentEntries = currentTB.filter(tb => tb.account_code === acc.account_code);
          currentEntries.forEach(tb => {
            const debit = parseFloat(tb.debit || 0);
            const credit = parseFloat(tb.credit || 0);
            currentBalance += (debit - credit);
          });

          // Previous period
          if (previousTB.length > 0) {
            const previousEntries = previousTB.filter(tb => tb.account_code === acc.account_code);
            previousEntries.forEach(tb => {
              const debit = parseFloat(tb.debit || 0);
              const credit = parseFloat(tb.credit || 0);
              previousBalance += (debit - credit);
            });
          }
        });

        const change = currentBalance - previousBalance;
        if (change !== 0) {
          // Increase in assets = cash outflow (negative), decrease = cash inflow (positive)
          activities[`Purchase/Sale of ${category.name}`] = -change;
        }
      }
    });

    return activities;
  };

  const calculateFinancingActivities = (coa, currentTB, previousTB) => {
    const activities = {};

    // Financing categories
    const financingCategories = [
      { name: 'Borrowings', keywords: ['loan', 'borrowing', 'debt', 'bond'] },
      { name: 'Share Capital', keywords: ['share capital', 'equity', 'common stock'] },
      { name: 'Dividends', keywords: ['dividend'] }
    ];

    financingCategories.forEach(category => {
      const accounts = coa.filter(acc => {
        const name = (acc.account_name || '').toLowerCase();
        const note = (acc.note_name || '').toLowerCase();
        return category.keywords.some(keyword => name.includes(keyword) || note.includes(keyword));
      });

      if (accounts.length > 0) {
        let currentBalance = 0;
        let previousBalance = 0;

        accounts.forEach(acc => {
          // Current period
          const currentEntries = currentTB.filter(tb => tb.account_code === acc.account_code);
          currentEntries.forEach(tb => {
            const debit = parseFloat(tb.debit || 0);
            const credit = parseFloat(tb.credit || 0);
            // Liabilities and equity have natural credit balance
            currentBalance += (credit - debit);
          });

          // Previous period
          if (previousTB.length > 0) {
            const previousEntries = previousTB.filter(tb => tb.account_code === acc.account_code);
            previousEntries.forEach(tb => {
              const debit = parseFloat(tb.debit || 0);
              const credit = parseFloat(tb.credit || 0);
              previousBalance += (credit - debit);
            });
          }
        });

        const change = currentBalance - previousBalance;
        if (change !== 0) {
          // For borrowings/equity: increase = cash inflow (positive), decrease = cash outflow (negative)
          // For dividends: payment = cash outflow (negative)
          const isDividend = category.name === 'Dividends';
          activities[category.name] = isDividend ? -Math.abs(change) : change;
        }
      }
    });

    return activities;
  };

  const calculateOpeningCash = (coa, previousTB) => {
    if (!previousTB || previousTB.length === 0) return 0;

    const cashAccounts = coa.filter(acc => {
      const name = (acc.account_name || '').toLowerCase();
      return name.includes('cash') || name.includes('bank');
    });

    let total = 0;
    cashAccounts.forEach(acc => {
      const entries = previousTB.filter(tb => tb.account_code === acc.account_code);
      entries.forEach(tb => {
        const debit = parseFloat(tb.debit || 0);
        const credit = parseFloat(tb.credit || 0);
        total += (debit - credit);
      });
    });

    return total;
  };

  const calculateClosingCash = (coa, currentTB) => {
    const cashAccounts = coa.filter(acc => {
      const name = (acc.account_name || '').toLowerCase();
      return name.includes('cash') || name.includes('bank');
    });

    let total = 0;
    cashAccounts.forEach(acc => {
      const entries = currentTB.filter(tb => tb.account_code === acc.account_code);
      entries.forEach(tb => {
        const debit = parseFloat(tb.debit || 0);
        const credit = parseFloat(tb.credit || 0);
        total += (debit - credit);
      });
    });

    return total;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const openFormulaBuilder = (lineItemName, section) => {
    setCurrentLineItem({ name: lineItemName, section });
    setShowFormulaPanel(true);

    // Load existing formula if any
    if (customFormulas[lineItemName]) {
      setFormulaBuilder(customFormulas[lineItemName]);
    } else {
      setFormulaBuilder({
        name: lineItemName,
        formula: [],
        type: 'note'
      });
    }
  };

  const addFormulaComponent = (component) => {
    setFormulaBuilder(prev => ({
      ...prev,
      formula: [...prev.formula, component]
    }));
  };

  const removeFormulaComponent = (index) => {
    setFormulaBuilder(prev => ({
      ...prev,
      formula: prev.formula.filter((_, i) => i !== index)
    }));
  };

  const saveFormula = () => {
    setCustomFormulas(prev => ({
      ...prev,
      [currentLineItem.name]: formulaBuilder
    }));
    setShowFormulaPanel(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f7f5f2]">
        <Loader className="animate-spin text-[#101828]" size={32} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        title="Cash Flow Statement"
        subtitle="Indirect Method - Operating, Investing, and Financing Activities"
      />

      <div className="flex-1 overflow-hidden flex">
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Controls */}
          <div className="px-6 py-4 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Period Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-[#101828]">Current Period:</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-[#101828] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availablePeriods.length === 0 ? (
                      <option value="">No periods available</option>
                    ) : (
                      availablePeriods.map(period => (
                        <option key={period.period_code} value={period.period_code}>
                          {period.period_name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Compare Period */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-[#101828]">Previous Period:</label>
                  <select
                    value={comparePeriod}
                    onChange={(e) => setComparePeriod(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-[#101828] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select previous period</option>
                    {availablePeriods.map(period => (
                      <option key={period.period_code} value={period.period_code}>
                        {period.period_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadData}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Save size={16} />
                  Save
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#101828] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] transition-colors">
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Cash Flow Statement */}
          <div className="flex-1 overflow-auto px-6 py-6">
            <div className="max-w-6xl mx-auto space-y-4">
              {/* Operating Activities */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div
                  className="bg-[#101828] text-white px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-[#1e293b] transition-colors"
                  onClick={() => toggleSection('operating')}
                >
                  <div className="flex items-center gap-3">
                    <Calculator size={18} />
                    <h3 className="text-base font-bold">Cash Flow from Operating Activities</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold">{formatCurrency(Math.abs(cashFlowData.operating.total))}</span>
                    {expandedSections.operating ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>

                {expandedSections.operating && (
                  <div className="p-6 space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-slate-200 group">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#101828]">Operating Profit / (Loss)</span>
                        <button
                          onClick={() => openFormulaBuilder('Operating Profit / (Loss)', 'operating')}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                          title="Edit formula"
                        >
                          <Edit2 size={14} className="text-blue-600" />
                        </button>
                      </div>
                      <span className="font-mono text-[#101828]">{formatCurrency(Math.abs(cashFlowData.operating.profitLoss))}</span>
                    </div>

                    {Object.keys(cashFlowData.operating.adjustments).length > 0 && (
                      <>
                        <div className="mt-3 mb-2">
                          <h4 className="font-semibold text-[#101828] text-sm">Adjustments for:</h4>
                        </div>
                        {Object.entries(cashFlowData.operating.adjustments).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center py-2 pl-6 group hover:bg-slate-50 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-[#101828]">{key}</span>
                              <button
                                onClick={() => openFormulaBuilder(key, 'operating')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded"
                                title="Edit formula"
                              >
                                <Edit2 size={12} className="text-blue-600" />
                              </button>
                            </div>
                            <span className="font-mono text-[#101828]">{formatCurrency(Math.abs(value))}</span>
                          </div>
                        ))}
                      </>
                    )}

                    {Object.keys(cashFlowData.operating.workingCapitalChanges).length > 0 && (
                      <>
                        <div className="mt-3 mb-2">
                          <h4 className="font-semibold text-[#101828] text-sm">Changes in Working Capital:</h4>
                        </div>
                        {Object.entries(cashFlowData.operating.workingCapitalChanges).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center py-2 pl-6 group hover:bg-slate-50 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-[#101828]">{key}</span>
                              <button
                                onClick={() => openFormulaBuilder(key, 'operating')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded"
                                title="Edit formula"
                              >
                                <Edit2 size={12} className="text-blue-600" />
                              </button>
                            </div>
                            <span className={`font-mono ${value < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {value < 0 ? '(' : ''}{formatCurrency(Math.abs(value))}{value < 0 ? ')' : ''}
                            </span>
                          </div>
                        ))}
                      </>
                    )}

                    <div className="flex justify-between items-center py-3 mt-4 border-t-2 border-[#101828] bg-green-50 rounded px-3">
                      <span className="font-bold text-[#101828]">Net Cash from Operating Activities</span>
                      <span className="font-mono text-lg font-bold text-green-700">
                        {formatCurrency(Math.abs(cashFlowData.operating.total))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Investing Activities */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div
                  className="bg-[#101828] text-white px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-[#1e293b] transition-colors"
                  onClick={() => toggleSection('investing')}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp size={18} />
                    <h3 className="text-base font-bold">Cash Flow from Investing Activities</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold">{formatCurrency(Math.abs(cashFlowData.investing.total))}</span>
                    {expandedSections.investing ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>

                {expandedSections.investing && (
                  <div className="p-6 space-y-2">
                    {Object.keys(cashFlowData.investing.items).length > 0 ? (
                      <>
                        {Object.entries(cashFlowData.investing.items).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center py-2 group hover:bg-slate-50 rounded px-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[#101828]">{key}</span>
                              <button
                                onClick={() => openFormulaBuilder(key, 'investing')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded"
                                title="Edit formula"
                              >
                                <Edit2 size={12} className="text-blue-600" />
                              </button>
                            </div>
                            <span className={`font-mono ${value < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {value < 0 ? '(' : ''}{formatCurrency(Math.abs(value))}{value < 0 ? ')' : ''}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center py-3 mt-4 border-t-2 border-[#101828] bg-blue-50 rounded px-3">
                          <span className="font-bold text-[#101828]">Net Cash from Investing Activities</span>
                          <span className={`font-mono text-lg font-bold ${cashFlowData.investing.total < 0 ? 'text-red-700' : 'text-blue-700'}`}>
                            {cashFlowData.investing.total < 0 ? '(' : ''}{formatCurrency(Math.abs(cashFlowData.investing.total))}{cashFlowData.investing.total < 0 ? ')' : ''}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-slate-500 py-4">No investing activities detected</div>
                    )}
                  </div>
                )}
              </div>

              {/* Financing Activities */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div
                  className="bg-[#101828] text-white px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-[#1e293b] transition-colors"
                  onClick={() => toggleSection('financing')}
                >
                  <div className="flex items-center gap-3">
                    <Building2 size={18} />
                    <h3 className="text-base font-bold">Cash Flow from Financing Activities</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold">{formatCurrency(Math.abs(cashFlowData.financing.total))}</span>
                    {expandedSections.financing ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>

                {expandedSections.financing && (
                  <div className="p-6 space-y-2">
                    {Object.keys(cashFlowData.financing.items).length > 0 ? (
                      <>
                        {Object.entries(cashFlowData.financing.items).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center py-2 group hover:bg-slate-50 rounded px-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[#101828]">{key}</span>
                              <button
                                onClick={() => openFormulaBuilder(key, 'financing')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded"
                                title="Edit formula"
                              >
                                <Edit2 size={12} className="text-blue-600" />
                              </button>
                            </div>
                            <span className={`font-mono ${value < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {value < 0 ? '(' : ''}{formatCurrency(Math.abs(value))}{value < 0 ? ')' : ''}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center py-3 mt-4 border-t-2 border-[#101828] bg-purple-50 rounded px-3">
                          <span className="font-bold text-[#101828]">Net Cash from Financing Activities</span>
                          <span className={`font-mono text-lg font-bold ${cashFlowData.financing.total < 0 ? 'text-red-700' : 'text-purple-700'}`}>
                            {cashFlowData.financing.total < 0 ? '(' : ''}{formatCurrency(Math.abs(cashFlowData.financing.total))}{cashFlowData.financing.total < 0 ? ')' : ''}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-slate-500 py-4">No financing activities detected</div>
                    )}
                  </div>
                )}
              </div>

              {/* Forex Adjustment */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="px-6 py-3 flex justify-between items-center group hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#101828]">Effect of Foreign Exchange Rate Changes</span>
                    <button
                      onClick={() => openFormulaBuilder('Forex Adjustment', 'forex')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded"
                      title="Edit formula"
                    >
                      <Edit2 size={12} className="text-blue-600" />
                    </button>
                  </div>
                  <span className="font-mono text-[#101828]">{formatCurrency(Math.abs(cashFlowData.forex))}</span>
                </div>
              </div>

              {/* Movement in Cash */}
              <div className="bg-[#101828] text-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">Net Increase / (Decrease) in Cash</span>
                  <span className="text-2xl font-bold">{formatCurrency(Math.abs(cashFlowData.movementInCash))}</span>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/30">
                  <div className="flex justify-between items-center">
                    <span className="text-white/90">Cash and Cash Equivalents at Beginning</span>
                    <span className="font-mono">{formatCurrency(Math.abs(cashFlowData.openingCash))}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/90">Movement in Cash</span>
                    <span className={`font-mono ${cashFlowData.movementInCash < 0 ? 'text-red-300' : 'text-green-300'}`}>
                      {cashFlowData.movementInCash < 0 ? '(' : ''}{formatCurrency(Math.abs(cashFlowData.movementInCash))}{cashFlowData.movementInCash < 0 ? ')' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t-2 border-white/50">
                    <span className="text-lg font-bold">Cash and Cash Equivalents at End</span>
                    <span className="font-mono text-xl font-bold">{formatCurrency(Math.abs(cashFlowData.calculatedClosingCash))}</span>
                  </div>

                  {Math.abs(cashFlowData.closingCash - cashFlowData.calculatedClosingCash) > 0.01 && (
                    <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Actual Closing Cash (from TB):</span>
                        <span className="font-mono">{formatCurrency(Math.abs(cashFlowData.closingCash))}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm">Difference:</span>
                        <span className="font-mono text-yellow-300">
                          {formatCurrency(Math.abs(cashFlowData.closingCash - cashFlowData.calculatedClosingCash))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Formula Builder Side Panel */}
          {showFormulaPanel && (
            <div className="w-96 bg-white border-l border-slate-200 shadow-xl flex flex-col">
              <div className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Formula Builder</h3>
                <button
                  onClick={() => setShowFormulaPanel(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#101828] mb-2">Line Item</label>
                    <input
                      type="text"
                      value={currentLineItem?.name || ''}
                      disabled
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-[#101828] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#101828] mb-2">Calculation Type</label>
                    <select
                      value={formulaBuilder.type}
                      onChange={(e) => setFormulaBuilder(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-[#101828] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="note">Note Balance</option>
                      <option value="subnote">Sub-Note Balance</option>
                      <option value="subclass">Sub-Class Balance</option>
                      <option value="class">Class Balance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#101828] mb-2">Formula Components</label>
                    <div className="space-y-2 mb-3">
                      {formulaBuilder.formula.length === 0 ? (
                        <div className="text-sm text-slate-500 text-center py-4 border border-dashed border-slate-300 rounded-lg">
                          No components added yet
                        </div>
                      ) : (
                        formulaBuilder.formula.map((component, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-[#101828]">{component.operator} {component.name}</div>
                              <div className="text-xs text-slate-600 mt-1">Type: {component.type}</div>
                            </div>
                            <button
                              onClick={() => removeFormulaComponent(index)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() => addFormulaComponent({ operator: '+', name: 'New Item', type: formulaBuilder.type })}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                      <button
                        onClick={() => addFormulaComponent({ operator: '-', name: 'New Item', type: formulaBuilder.type })}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        <X size={14} />
                        Subtract
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">Available Accounts</h4>
                      <div className="text-xs text-blue-700 space-y-1">
                        <p>• Select calculation type above</p>
                        <p>• Add components with + or - operators</p>
                        <p>• Formula will sum/subtract balances automatically</p>
                      </div>
                    </div>

                    {glAccounts.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-[#101828] mb-2">
                          {formulaBuilder.type === 'note' && 'Notes'}
                          {formulaBuilder.type === 'subnote' && 'Sub-Notes'}
                          {formulaBuilder.type === 'subclass' && 'Sub-Classes'}
                          {formulaBuilder.type === 'class' && 'Classes'}
                        </label>
                        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                          {[...new Set(glAccounts.map(acc => {
                            if (formulaBuilder.type === 'note') return acc.note_name;
                            if (formulaBuilder.type === 'subnote') return acc.sub_note_name;
                            if (formulaBuilder.type === 'subclass') return acc.sub_class_name;
                            if (formulaBuilder.type === 'class') return acc.class_name;
                            return null;
                          }).filter(Boolean))].map((name, idx) => (
                            <button
                              key={idx}
                              onClick={() => addFormulaComponent({ operator: '+', name, type: formulaBuilder.type })}
                              className="w-full text-left px-3 py-2 text-sm text-[#101828] hover:bg-blue-50 border-b border-slate-100 last:border-b-0"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 flex gap-3">
                <button
                  onClick={() => setShowFormulaPanel(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-[#101828] rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveFormula}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#101828] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] transition-colors"
                >
                  <Check size={16} />
                  Save Formula
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

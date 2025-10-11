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
  ChevronDown
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

  // Cash flow data structure
  const [cashFlowData, setCashFlowData] = useState({
    operating: {
      profitLoss: 0,
      adjustments: {},
      workingCapitalChanges: {}
    },
    investing: {},
    financing: {},
    forex: 0,
    openingCash: 0,
    closingCash: 0,
    movementInCash: 0
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f7f5f2]">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        title="Cash Flow Statement"
        subtitle="Indirect Method - Operating, Investing, and Financing Activities"
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Controls */}
        <div className="px-8 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Period Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Current Period:</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label className="text-sm font-medium text-slate-700">Previous Period:</label>
                <select
                  value={comparePeriod}
                  onChange={(e) => setComparePeriod(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                <Save size={16} />
                Save
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#101828] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b]">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Cash Flow Statement */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Operating Activities */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div
                className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('operating')}
              >
                <div className="flex items-center gap-3">
                  <Calculator size={20} />
                  <h3 className="text-lg font-bold">Cash Flow from Operating Activities</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold">{formatCurrency(Math.abs(cashFlowData.operating.total))}</span>
                  {expandedSections.operating ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </div>

              {expandedSections.operating && (
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-semibold text-[#101828]">Operating Profit / (Loss)</span>
                    <span className="font-mono text-lg">{formatCurrency(Math.abs(cashFlowData.operating.profitLoss))}</span>
                  </div>

                  {Object.keys(cashFlowData.operating.adjustments).length > 0 && (
                    <>
                      <div className="mt-4 mb-2">
                        <h4 className="font-semibold text-slate-700">Adjustments for:</h4>
                      </div>
                      {Object.entries(cashFlowData.operating.adjustments).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 pl-6">
                          <span className="text-slate-700">{key}</span>
                          <span className="font-mono">{formatCurrency(Math.abs(value))}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {Object.keys(cashFlowData.operating.workingCapitalChanges).length > 0 && (
                    <>
                      <div className="mt-4 mb-2">
                        <h4 className="font-semibold text-slate-700">Changes in Working Capital:</h4>
                      </div>
                      {Object.entries(cashFlowData.operating.workingCapitalChanges).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 pl-6">
                          <span className="text-slate-700">{key}</span>
                          <span className={`font-mono ${value < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {value < 0 ? '(' : ''}{formatCurrency(Math.abs(value))}{value < 0 ? ')' : ''}
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  <div className="flex justify-between items-center py-3 mt-4 border-t-2 border-slate-300 bg-green-50">
                    <span className="font-bold text-[#101828]">Net Cash from Operating Activities</span>
                    <span className="font-mono text-xl font-bold text-green-700">
                      {formatCurrency(Math.abs(cashFlowData.operating.total))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Investing Activities */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div
                className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('investing')}
              >
                <div className="flex items-center gap-3">
                  <TrendingUp size={20} />
                  <h3 className="text-lg font-bold">Cash Flow from Investing Activities</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold">{formatCurrency(Math.abs(cashFlowData.investing.total))}</span>
                  {expandedSections.investing ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </div>

              {expandedSections.investing && (
                <div className="p-6 space-y-3">
                  {Object.keys(cashFlowData.investing.items).length > 0 ? (
                    <>
                      {Object.entries(cashFlowData.investing.items).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2">
                          <span className="text-slate-700">{key}</span>
                          <span className={`font-mono ${value < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {value < 0 ? '(' : ''}{formatCurrency(Math.abs(value))}{value < 0 ? ')' : ''}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-3 mt-4 border-t-2 border-slate-300 bg-blue-50">
                        <span className="font-bold text-[#101828]">Net Cash from Investing Activities</span>
                        <span className={`font-mono text-xl font-bold ${cashFlowData.investing.total < 0 ? 'text-red-700' : 'text-blue-700'}`}>
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
                className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('financing')}
              >
                <div className="flex items-center gap-3">
                  <Building2 size={20} />
                  <h3 className="text-lg font-bold">Cash Flow from Financing Activities</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold">{formatCurrency(Math.abs(cashFlowData.financing.total))}</span>
                  {expandedSections.financing ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </div>

              {expandedSections.financing && (
                <div className="p-6 space-y-3">
                  {Object.keys(cashFlowData.financing.items).length > 0 ? (
                    <>
                      {Object.entries(cashFlowData.financing.items).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2">
                          <span className="text-slate-700">{key}</span>
                          <span className={`font-mono ${value < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {value < 0 ? '(' : ''}{formatCurrency(Math.abs(value))}{value < 0 ? ')' : ''}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-3 mt-4 border-t-2 border-slate-300 bg-purple-50">
                        <span className="font-bold text-[#101828]">Net Cash from Financing Activities</span>
                        <span className={`font-mono text-xl font-bold ${cashFlowData.financing.total < 0 ? 'text-red-700' : 'text-purple-700'}`}>
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
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="font-semibold text-slate-700">Effect of Foreign Exchange Rate Changes</span>
                <span className="font-mono text-lg">{formatCurrency(Math.abs(cashFlowData.forex))}</span>
              </div>
            </div>

            {/* Movement in Cash */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Net Increase / (Decrease) in Cash</span>
                <span className="text-3xl font-bold">{formatCurrency(Math.abs(cashFlowData.movementInCash))}</span>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/30">
                <div className="flex justify-between items-center">
                  <span className="text-white/90">Cash and Cash Equivalents at Beginning</span>
                  <span className="font-mono text-lg">{formatCurrency(Math.abs(cashFlowData.openingCash))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/90">Movement in Cash</span>
                  <span className={`font-mono text-lg ${cashFlowData.movementInCash < 0 ? 'text-red-300' : 'text-green-300'}`}>
                    {cashFlowData.movementInCash < 0 ? '(' : ''}{formatCurrency(Math.abs(cashFlowData.movementInCash))}{cashFlowData.movementInCash < 0 ? ')' : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-white/50">
                  <span className="text-xl font-bold">Cash and Cash Equivalents at End</span>
                  <span className="font-mono text-2xl font-bold">{formatCurrency(Math.abs(cashFlowData.calculatedClosingCash))}</span>
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
      </div>
    </div>
  );
}

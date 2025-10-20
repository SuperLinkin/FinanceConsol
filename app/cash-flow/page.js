'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  Play,
  X,
  Save,
  Eye,
  TrendingUp,
  Loader,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function CashFlowStatement() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [comparePeriod, setComparePeriod] = useState('');
  const [availablePeriods, setAvailablePeriods] = useState([]);

  // Cash flow data
  const [cashFlowData, setCashFlowData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Sidepanel
  const [showCashflowPanel, setShowCashflowPanel] = useState(false);

  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    setIsLoading(true);
    try {
      // Load available periods from trial balance
      const tbResponse = await fetch('/api/trial-balance');
      if (!tbResponse.ok) throw new Error('Failed to fetch periods');

      const allTBData = await tbResponse.json();
      const uniquePeriods = [...new Set((allTBData || []).map(tb => tb.period))].sort().reverse();

      const periodOptions = uniquePeriods.map(period => ({
        period_code: period,
        period_name: period
      }));

      setAvailablePeriods(periodOptions);

      if (periodOptions.length > 0) {
        setSelectedPeriod(periodOptions[0].period_code);
        if (periodOptions.length > 1) {
          setComparePeriod(periodOptions[1].period_code);
        }
      }
    } catch (error) {
      console.error('Error loading periods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPeriodDate = (period) => {
    if (!period) return '';
    if (period.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(period);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return period;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const handleGenerate = async () => {
    if (!selectedPeriod || !comparePeriod) {
      alert('Please select both current and previous periods');
      return;
    }

    setIsGenerating(true);
    setValidationErrors([]);

    try {
      const response = await fetch('/api/cashflow/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_period: selectedPeriod,
          previous_period: comparePeriod
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate cash flow');
      }

      const data = await response.json();
      setCashFlowData(data);

      // Run validations
      const errors = validateCashFlow(data);
      setValidationErrors(errors);

      if (errors.length === 0) {
        setShowCashflowPanel(true);
      }

    } catch (error) {
      console.error('Generation error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const validateCashFlow = (data) => {
    const errors = [];

    // Validation 1: Cash reconciliation
    const netChange = data.cfo_total + data.cfi_total + data.cff_total;
    const expectedChange = data.closing_cash - data.opening_cash;
    const diff = Math.abs(netChange - expectedChange);

    if (diff > 1) {  // Allow 1 unit rounding tolerance
      errors.push({
        type: 'error',
        message: `Cash reconciliation failed: Net change (${formatCurrency(netChange)}) doesn't match cash movement (${formatCurrency(expectedChange)})`
      });
    }

    // Validation 2: Check if operating cash flow is reasonable
    if (data.operating && data.operating.net_profit) {
      const cfoDiff = Math.abs(data.cfo_total - data.operating.net_profit);
      if (cfoDiff < 100) {
        errors.push({
          type: 'warning',
          message: 'Operating cash flow is very close to net profit. Check if non-cash adjustments are included.'
        });
      }
    }

    // Validation 3: Check for missing data
    if (!data.opening_cash || !data.closing_cash) {
      errors.push({
        type: 'error',
        message: 'Missing opening or closing cash balances'
      });
    }

    return errors;
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
        subtitle="Indirect Method - Auto-generated from consolidation workings"
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Controls */}
        <div className="px-8 py-6 bg-white border-b border-slate-200">
          <div className="max-w-4xl">
            {/* Period Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Period <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-[#101828] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availablePeriods.length === 0 ? (
                    <option value="">No periods available</option>
                  ) : (
                    availablePeriods.map(period => (
                      <option key={period.period_code} value={period.period_code}>
                        {formatPeriodDate(period.period_name)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Previous Period <span className="text-red-500">*</span>
                </label>
                <select
                  value={comparePeriod}
                  onChange={(e) => setComparePeriod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-[#101828] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select previous period</option>
                  {availablePeriods.map(period => (
                    <option key={period.period_code} value={period.period_code}>
                      {formatPeriodDate(period.period_name)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleGenerate}
                disabled={!selectedPeriod || !comparePeriod || isGenerating}
                className="flex items-center gap-2 px-8 py-3 bg-[#101828] text-white rounded-lg text-sm font-semibold hover:bg-[#1e293b] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Generating Cash Flow...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Generate Cash Flow
                  </>
                )}
              </button>

              {cashFlowData && (
                <button
                  onClick={() => setShowCashflowPanel(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Eye size={20} />
                  View Statement
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-8 py-6">
          {!cashFlowData ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText size={64} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Cash Flow Generated Yet</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                Select current and previous periods above, then click "Generate Cash Flow" to automatically create the statement using the indirect method.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl text-left">
                <h4 className="font-semibold text-blue-900 mb-3">How it works:</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                    <span><strong>Step 1:</strong> Starts with Net Profit from Income Statement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                    <span><strong>Step 2:</strong> Adds back non-cash items (Depreciation, Amortization)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                    <span><strong>Step 3:</strong> Adjusts for working capital changes (AR, AP, Inventory)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                    <span><strong>Step 4:</strong> Calculates investing activities (PPE, Intangibles)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                    <span><strong>Step 5:</strong> Calculates financing activities (Loans, Equity, Dividends)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                    <span><strong>Validation:</strong> Reconciles with actual cash movement</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Validation Messages */}
              {validationErrors.length > 0 && (
                <div className="space-y-3">
                  {validationErrors.map((error, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        error.type === 'error'
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                      }`}
                    >
                      <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">
                          {error.type === 'error' ? 'Validation Error' : 'Warning'}
                        </p>
                        <p className="text-sm">{error.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="text-sm text-gray-600 mb-1">Operating Activities</div>
                  <div className={`text-2xl font-bold ${cashFlowData.cfo_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(cashFlowData.cfo_total)}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="text-sm text-gray-600 mb-1">Investing Activities</div>
                  <div className={`text-2xl font-bold ${cashFlowData.cfi_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(cashFlowData.cfi_total)}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="text-sm text-gray-600 mb-1">Financing Activities</div>
                  <div className={`text-2xl font-bold ${cashFlowData.cff_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(cashFlowData.cff_total)}
                  </div>
                </div>

                <div className="bg-[#101828] rounded-lg border border-gray-200 p-6">
                  <div className="text-sm text-gray-300 mb-1">Net Cash Change</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(cashFlowData.cfo_total + cashFlowData.cfi_total + cashFlowData.cff_total)}
                  </div>
                </div>
              </div>

              {/* Cash Reconciliation */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Cash Reconciliation</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Opening Cash</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {formatCurrency(cashFlowData.opening_cash)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Net Movement</div>
                    <div className={`text-xl font-semibold ${
                      (cashFlowData.cfo_total + cashFlowData.cfi_total + cashFlowData.cff_total) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {formatCurrency(cashFlowData.cfo_total + cashFlowData.cfi_total + cashFlowData.cff_total)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Closing Cash</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {formatCurrency(cashFlowData.closing_cash)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cash Flow Statement Sidepanel */}
      {showCashflowPanel && cashFlowData && (
        <div className="fixed right-0 top-0 h-full w-[1000px] bg-white shadow-2xl z-50 animate-slideLeft flex flex-col">
          <div className="bg-[#101828] text-white px-8 py-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Statement of Cash Flows</h3>
              <p className="text-sm text-slate-300 mt-1">Indirect Method</p>
            </div>
            <button
              onClick={() => setShowCashflowPanel(false)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#101828]">Particulars</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-[#101828]">
                      {formatPeriodDate(selectedPeriod)}
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-[#101828]">
                      {formatPeriodDate(comparePeriod)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Operating Activities */}
                  <tr className="bg-blue-50">
                    <td colSpan="3" className="px-6 py-3 text-sm font-bold text-blue-900">
                      CASH FLOWS FROM OPERATING ACTIVITIES
                    </td>
                  </tr>

                  {cashFlowData.operating && Object.entries(cashFlowData.operating).map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-200">
                      <td className="px-6 py-3 text-sm text-[#101828] pl-12">
                        {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </td>
                      <td className={`px-6 py-3 text-sm font-mono text-right ${value >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {value >= 0 ? '' : '('}{formatCurrency(Math.abs(value))}{value >= 0 ? '' : ')'}
                      </td>
                      <td className="px-6 py-3 text-sm font-mono text-right text-gray-600">-</td>
                    </tr>
                  ))}

                  <tr className="bg-blue-100 font-semibold">
                    <td className="px-6 py-3 text-sm text-blue-900">Net Cash from Operating Activities</td>
                    <td className={`px-6 py-3 text-sm font-mono text-right ${cashFlowData.cfo_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(cashFlowData.cfo_total)}
                    </td>
                    <td className="px-6 py-3 text-sm font-mono text-right text-gray-600">-</td>
                  </tr>

                  {/* Investing Activities */}
                  <tr className="bg-green-50">
                    <td colSpan="3" className="px-6 py-3 text-sm font-bold text-green-900">
                      CASH FLOWS FROM INVESTING ACTIVITIES
                    </td>
                  </tr>

                  {cashFlowData.investing && Object.entries(cashFlowData.investing).map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-200">
                      <td className="px-6 py-3 text-sm text-[#101828] pl-12">
                        {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </td>
                      <td className={`px-6 py-3 text-sm font-mono text-right ${value >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {value >= 0 ? '' : '('}{formatCurrency(Math.abs(value))}{value >= 0 ? '' : ')'}
                      </td>
                      <td className="px-6 py-3 text-sm font-mono text-right text-gray-600">-</td>
                    </tr>
                  ))}

                  <tr className="bg-green-100 font-semibold">
                    <td className="px-6 py-3 text-sm text-green-900">Net Cash from Investing Activities</td>
                    <td className={`px-6 py-3 text-sm font-mono text-right ${cashFlowData.cfi_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(cashFlowData.cfi_total)}
                    </td>
                    <td className="px-6 py-3 text-sm font-mono text-right text-gray-600">-</td>
                  </tr>

                  {/* Financing Activities */}
                  <tr className="bg-purple-50">
                    <td colSpan="3" className="px-6 py-3 text-sm font-bold text-purple-900">
                      CASH FLOWS FROM FINANCING ACTIVITIES
                    </td>
                  </tr>

                  {cashFlowData.financing && Object.entries(cashFlowData.financing).map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-200">
                      <td className="px-6 py-3 text-sm text-[#101828] pl-12">
                        {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </td>
                      <td className={`px-6 py-3 text-sm font-mono text-right ${value >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {value >= 0 ? '' : '('}{formatCurrency(Math.abs(value))}{value >= 0 ? '' : ')'}
                      </td>
                      <td className="px-6 py-3 text-sm font-mono text-right text-gray-600">-</td>
                    </tr>
                  ))}

                  <tr className="bg-purple-100 font-semibold">
                    <td className="px-6 py-3 text-sm text-purple-900">Net Cash from Financing Activities</td>
                    <td className={`px-6 py-3 text-sm font-mono text-right ${cashFlowData.cff_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(cashFlowData.cff_total)}
                    </td>
                    <td className="px-6 py-3 text-sm font-mono text-right text-gray-600">-</td>
                  </tr>

                  {/* Net Change */}
                  <tr className="bg-gray-100 font-bold">
                    <td className="px-6 py-4 text-base text-gray-900">NET INCREASE/(DECREASE) IN CASH</td>
                    <td className="px-6 py-4 text-base font-mono text-right text-gray-900">
                      {formatCurrency(cashFlowData.cfo_total + cashFlowData.cfi_total + cashFlowData.cff_total)}
                    </td>
                    <td className="px-6 py-4 text-base font-mono text-right text-gray-600">-</td>
                  </tr>

                  {/* Reconciliation */}
                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-3 text-sm text-gray-700">Cash & Cash Equivalents - Opening</td>
                    <td className="px-6 py-3 text-sm font-mono text-right text-gray-900">
                      {formatCurrency(cashFlowData.opening_cash)}
                    </td>
                    <td className="px-6 py-3 text-sm font-mono text-right text-gray-600">-</td>
                  </tr>

                  <tr className="bg-[#101828] text-white font-bold">
                    <td className="px-6 py-4 text-base">Cash & Cash Equivalents - Closing</td>
                    <td className="px-6 py-4 text-base font-mono text-right">
                      {formatCurrency(cashFlowData.closing_cash)}
                    </td>
                    <td className="px-6 py-4 text-base font-mono text-right text-gray-300">
                      {formatCurrency(cashFlowData.opening_cash)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

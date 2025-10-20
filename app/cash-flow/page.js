'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  Plus,
  X,
  Save,
  Eye,
  TrendingUp,
  Loader,
  Edit2,
  FileSpreadsheet
} from 'lucide-react';

export default function CashFlowStatement() {
  const [isLoading, setIsLoading] = useState(true);
  const [components, setComponents] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [comparePeriod, setComparePeriod] = useState('');
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [trialBalances, setTrialBalances] = useState([]);
  const [compareTrialBalances, setCompareTrialBalances] = useState([]);
  const [consolidatedCurrent, setConsolidatedCurrent] = useState({});
  const [consolidatedCompare, setConsolidatedCompare] = useState({});

  // Sidepanel states
  const [showWorkingsPanel, setShowWorkingsPanel] = useState(false);
  const [showAddComponentPanel, setShowAddComponentPanel] = useState(false);
  const [showViewCashflowPanel, setShowViewCashflowPanel] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [workingsContent, setWorkingsContent] = useState('');

  // Add component form
  const [newComponent, setNewComponent] = useState({
    name: '',
    category: 'Operating', // Operating, Investing, Financing
    formula: [],
    type: 'note', // note, subnote, subclass, class
    sign: 1 // 1 or -1 for cash flow impact
  });

  useEffect(() => {
    loadData();
  }, [selectedPeriod, comparePeriod]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading cash flow data...');

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

      // Load COA
      const coaRes = await supabase.from('chart_of_accounts').select('*').eq('is_active', true);

      // Filter trial balances for both periods
      const tbDataForPeriod = allTBData.filter(tb => tb.period === selectedPeriod);
      const tbDataForComparePeriod = comparePeriod ? allTBData.filter(tb => tb.period === comparePeriod) : [];

      setGlAccounts(coaRes.data || []);
      setTrialBalances(tbDataForPeriod || []);
      setCompareTrialBalances(tbDataForComparePeriod || []);

      // Calculate consolidated balances by account
      const consolidatedCurrentMap = calculateConsolidatedBalances(tbDataForPeriod);
      const consolidatedCompareMap = calculateConsolidatedBalances(tbDataForComparePeriod);

      setConsolidatedCurrent(consolidatedCurrentMap);
      setConsolidatedCompare(consolidatedCompareMap);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateConsolidatedBalances = (tbData) => {
    const balances = {};

    tbData.forEach(tb => {
      const accountCode = tb.account_code;
      const debit = parseFloat(tb.debit || 0);
      const credit = parseFloat(tb.credit || 0);
      const netAmount = debit - credit;

      if (!balances[accountCode]) {
        balances[accountCode] = {
          account_code: accountCode,
          account_name: tb.account_name,
          total_debit: 0,
          total_credit: 0,
          net_amount: 0
        };
      }

      balances[accountCode].total_debit += debit;
      balances[accountCode].total_credit += credit;
      balances[accountCode].net_amount += netAmount;
    });

    return balances;
  };

  const formatPeriodDate = (period) => {
    if (!period) return '';
    // Try to parse as date (YYYY-MM-DD) and format nicely
    if (period.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(period);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    // If it's like "FY 2024" or already formatted, return as is
    return period;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const handleViewComponent = (component) => {
    setSelectedComponent(component);
    setShowWorkingsPanel(true);

    // Generate detailed workings
    const workings = generateWorkings(component);
    setWorkingsContent(workings);
  };

  const generateWorkings = (component) => {
    let workings = `# ${component.name}\n\n`;
    workings += `**Category:** ${component.category}\n`;
    workings += `**Cash Flow Impact Sign:** ${component.sign > 0 ? 'Positive (Inflow)' : 'Negative (Outflow)'}\n\n`;

    workings += `## Formula\n\n`;
    if (component.formula && component.formula.length > 0) {
      component.formula.forEach((item, index) => {
        workings += `${index + 1}. ${item.operator} ${item.name} (${item.type})\n`;
      });
    } else {
      workings += `No formula defined.\n`;
    }

    workings += `\n## Consolidated Balances\n\n`;
    workings += `### ${formatPeriodDate(selectedPeriod)} (Current)\n`;
    workings += `**Total Balance:** ${formatCurrency(component.currentYearValue || 0)}\n\n`;

    workings += `### ${formatPeriodDate(comparePeriod)} (Previous)\n`;
    workings += `**Total Balance:** ${formatCurrency(component.previousYearValue || 0)}\n\n`;

    workings += `## Movement Calculation\n\n`;
    const movement = (component.currentYearValue || 0) - (component.previousYearValue || 0);
    workings += `\`\`\`\n`;
    workings += `Movement = ${formatCurrency(component.currentYearValue || 0)} - ${formatCurrency(component.previousYearValue || 0)}\n`;
    workings += `Movement = ${formatCurrency(movement)}\n`;
    workings += `\`\`\`\n\n`;

    workings += `## Cash Flow Impact\n\n`;
    const cashImpact = movement * component.sign;
    workings += `Applying sign multiplier (${component.sign}):\n`;
    workings += `**Cash Impact = ${formatCurrency(cashImpact)}**\n\n`;

    if (component.category === 'Operating') {
      workings += `### Working Capital Logic:\n`;
      workings += `- **Assets (AR, Inventory):** Increase = Cash Outflow (negative), Decrease = Cash Inflow (positive)\n`;
      workings += `- **Liabilities (AP, Accruals):** Increase = Cash Inflow (positive), Decrease = Cash Outflow (negative)\n`;
      workings += `- **Non-cash Expenses (Depreciation):** Added back to cash flow (positive)\n`;
    }

    return workings;
  };

  const handleAddComponent = () => {
    setNewComponent({
      name: '',
      category: 'Operating',
      formula: [],
      type: 'note',
      sign: 1
    });
    setIsEditing(false);
    setShowAddComponentPanel(true);
  };

  const handleEditComponent = (component) => {
    setSelectedComponent(component);
    setNewComponent({
      name: component.name,
      category: component.category,
      formula: component.formula || [],
      type: component.type || 'note',
      sign: component.sign || 1
    });
    setIsEditing(true);
    setShowAddComponentPanel(true);
  };

  const handleSaveComponent = () => {
    if (!newComponent.name.trim()) {
      alert('Please enter a component name');
      return;
    }

    if (newComponent.formula.length === 0) {
      alert('Please add at least one formula component');
      return;
    }

    // Calculate values based on formula
    const currentYearValue = calculateFormulaValue(newComponent.formula, consolidatedCurrent);
    const previousYearValue = calculateFormulaValue(newComponent.formula, consolidatedCompare);
    const movement = currentYearValue - previousYearValue;
    const cashImpact = movement * newComponent.sign;

    const component = {
      id: isEditing ? selectedComponent.id : Date.now(),
      name: newComponent.name,
      category: newComponent.category,
      formula: newComponent.formula,
      type: newComponent.type,
      sign: newComponent.sign,
      currentYearValue,
      previousYearValue,
      movement,
      cashImpact
    };

    if (isEditing) {
      setComponents(prev => prev.map(c => c.id === selectedComponent.id ? component : c));
    } else {
      setComponents(prev => [...prev, component]);
    }

    setShowAddComponentPanel(false);
    setIsEditing(false);
  };

  const calculateFormulaValue = (formula, consolidatedData) => {
    let total = 0;

    formula.forEach(item => {
      // Get accounts matching the formula item
      const matchingAccounts = glAccounts.filter(acc => {
        if (item.type === 'note') return acc.note_name === item.name;
        if (item.type === 'subnote') return acc.sub_note_name === item.name;
        if (item.type === 'subclass') return acc.sub_class_name === item.name;
        if (item.type === 'class') return acc.class_name === item.name;
        return false;
      });

      // Sum up the consolidated balances for these accounts
      let accountTotal = 0;
      matchingAccounts.forEach(acc => {
        const consolidatedBalance = consolidatedData[acc.account_code];
        if (consolidatedBalance) {
          accountTotal += consolidatedBalance.net_amount;
        }
      });

      // Apply operator
      if (item.operator === '+') {
        total += accountTotal;
      } else if (item.operator === '-') {
        total -= accountTotal;
      }
    });

    return total;
  };

  const addFormulaItem = (operator) => {
    setNewComponent(prev => ({
      ...prev,
      formula: [...prev.formula, { operator, name: '', type: prev.type }]
    }));
  };

  const updateFormulaItem = (index, field, value) => {
    setNewComponent(prev => ({
      ...prev,
      formula: prev.formula.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  const removeFormulaItem = (index) => {
    setNewComponent(prev => ({
      ...prev,
      formula: prev.formula.filter((_, i) => i !== index)
    }));
  };

  const handleTypeChange = (newType) => {
    setNewComponent(prev => ({
      ...prev,
      type: newType,
      formula: prev.formula.map(item => ({ ...item, type: newType, name: '' }))
    }));
  };

  const handleViewCashflow = () => {
    setShowViewCashflowPanel(true);
  };

  const handleDeleteComponent = (id) => {
    if (confirm('Are you sure you want to delete this component?')) {
      setComponents(prev => prev.filter(c => c.id !== id));
    }
  };

  const getComponentsByCategory = () => {
    const operating = components.filter(c => c.category === 'Operating');
    const investing = components.filter(c => c.category === 'Investing');
    const financing = components.filter(c => c.category === 'Financing');
    return { operating, investing, financing };
  };

  const calculateCategoryTotal = (category) => {
    return components
      .filter(c => c.category === category)
      .reduce((sum, c) => sum + (c.cashImpact || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f7f5f2]">
        <Loader className="animate-spin text-[#101828]" size={32} />
      </div>
    );
  }

  const { operating, investing, financing } = getComponentsByCategory();

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        title="Cash Flow Statement"
        subtitle="Build cashflow using indirect method with consolidated numbers"
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Controls */}
        <div className="px-8 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Period Selectors */}
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
                        {formatPeriodDate(period.period_name)}
                      </option>
                    ))
                  )}
                </select>
              </div>

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
                      {formatPeriodDate(period.period_name)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddComponent}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Add Component
              </button>
              <button
                onClick={handleViewCashflow}
                disabled={components.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg text-sm font-semibold hover:bg-[#1e293b] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Eye size={20} />
                View Cashflow
              </button>
            </div>
          </div>
        </div>

        {/* Components Table */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#101828] text-white">
                    <th className="px-6 py-4 text-left text-sm font-bold">Component</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Category</th>
                    <th className="px-6 py-4 text-right text-sm font-bold">{formatPeriodDate(selectedPeriod)}</th>
                    <th className="px-6 py-4 text-right text-sm font-bold">{formatPeriodDate(comparePeriod) || 'Previous Period'}</th>
                    <th className="px-6 py-4 text-right text-sm font-bold">Movement</th>
                    <th className="px-6 py-4 text-right text-sm font-bold">Cash Impact</th>
                    <th className="px-6 py-4 text-center text-sm font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {components.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                          <TrendingUp size={48} className="text-gray-300" />
                          <p className="text-lg font-medium">No components added yet</p>
                          <p className="text-sm">Click "Add Component" to create cashflow line items</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    components.map((component) => (
                      <tr
                        key={component.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td
                          className="px-6 py-4 text-sm font-semibold text-[#101828] cursor-pointer"
                          onClick={() => handleViewComponent(component)}
                        >
                          {component.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            component.category === 'Operating' ? 'bg-blue-100 text-blue-700' :
                            component.category === 'Investing' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {component.category}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 text-sm font-mono text-right text-[#101828] cursor-pointer"
                          onClick={() => handleViewComponent(component)}
                        >
                          {formatCurrency(component.currentYearValue)}
                        </td>
                        <td
                          className="px-6 py-4 text-sm font-mono text-right text-gray-600 cursor-pointer"
                          onClick={() => handleViewComponent(component)}
                        >
                          {formatCurrency(component.previousYearValue)}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm font-mono text-right cursor-pointer ${component.movement >= 0 ? 'text-blue-600' : 'text-orange-600'}`}
                          onClick={() => handleViewComponent(component)}
                        >
                          {component.movement >= 0 ? '+' : ''}{formatCurrency(component.movement)}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm font-mono text-right font-semibold cursor-pointer ${component.cashImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          onClick={() => handleViewComponent(component)}
                        >
                          {component.cashImpact >= 0 ? '+' : ''}{formatCurrency(component.cashImpact)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditComponent(component);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit component"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteComponent(component.id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete component"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Component Workings Sidepanel */}
      {showWorkingsPanel && (
        <div className="fixed right-0 top-0 h-full w-[800px] bg-white shadow-2xl z-50 animate-slideLeft flex flex-col">
          <div className="bg-[#101828] text-white px-8 py-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{selectedComponent?.name}</h3>
              <p className="text-sm text-slate-300 mt-1">Component Workings & Calculations</p>
            </div>
            <button
              onClick={() => setShowWorkingsPanel(false)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-gray-50 p-6 rounded-lg">
                {workingsContent}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Component Sidepanel */}
      {showAddComponentPanel && (
        <div className="fixed right-0 top-0 h-full w-[700px] bg-white shadow-2xl z-50 animate-slideLeft flex flex-col">
          <div className="bg-[#101828] text-white px-8 py-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{isEditing ? 'Edit Component' : 'Add Component'}</h3>
              <p className="text-sm text-slate-300 mt-1">{isEditing ? 'Update' : 'Create a new'} cashflow component</p>
            </div>
            <button
              onClick={() => {
                setShowAddComponentPanel(false);
                setIsEditing(false);
              }}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Component Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newComponent.name}
                  onChange={(e) => setNewComponent(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                  placeholder="e.g., Change in Trade Receivables"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cash Flow Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={newComponent.category}
                  onChange={(e) => setNewComponent(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                >
                  <option value="Operating">Operating Activities</option>
                  <option value="Investing">Investing Activities</option>
                  <option value="Financing">Financing Activities</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cash Impact Sign
                </label>
                <select
                  value={newComponent.sign}
                  onChange={(e) => setNewComponent(prev => ({ ...prev, sign: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                >
                  <option value="1">Positive (increase = inflow, decrease = outflow)</option>
                  <option value="-1">Negative (increase = outflow, decrease = inflow)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Use Negative for current assets (AR, Inventory). Use Positive for liabilities (AP) and non-cash expenses.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Calculation Level
                </label>
                <select
                  value={newComponent.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                >
                  <option value="note">Note Level</option>
                  <option value="subnote">Sub-Note Level</option>
                  <option value="subclass">Sub-Class Level</option>
                  <option value="class">Class Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Formula <span className="text-red-500">*</span>
                </label>

                <div className="space-y-3">
                  {newComponent.formula.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      No formula items added yet
                    </div>
                  ) : (
                    newComponent.formula.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg font-bold text-lg text-gray-700">
                          {item.operator}
                        </div>
                        <select
                          value={item.name}
                          onChange={(e) => updateFormulaItem(index, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select {newComponent.type}...</option>
                          {(() => {
                            const items = [...new Set(glAccounts.map(acc => {
                              if (newComponent.type === 'note') return acc.note_name;
                              if (newComponent.type === 'subnote') return acc.sub_note_name;
                              if (newComponent.type === 'subclass') return acc.sub_class_name;
                              if (newComponent.type === 'class') return acc.class_name;
                              return null;
                            }).filter(item => item && item.trim() !== ''))].sort();

                            return items.map((name, idx) => (
                              <option key={idx} value={name}>{name}</option>
                            ));
                          })()}
                        </select>
                        <button
                          onClick={() => removeFormulaItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => addFormulaItem('+')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                  <button
                    onClick={() => addFormulaItem('-')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <X size={16} />
                    Subtract
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">Indirect Method - Cash Flow Logic:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• <strong>Operating:</strong> Start with profit, adjust for non-cash items & working capital</li>
                  <li>• <strong>Current Assets (AR, Inventory):</strong> Increase = Cash Out (use negative sign)</li>
                  <li>• <strong>Current Liabilities (AP, Accruals):</strong> Increase = Cash In (use positive sign)</li>
                  <li>• <strong>Non-cash Expenses (Depreciation):</strong> Add back (use positive sign)</li>
                  <li>• <strong>Investing:</strong> PPE purchases are negative, disposals are positive</li>
                  <li>• <strong>Financing:</strong> New borrowings/equity are positive, repayments/dividends are negative</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={() => {
                setShowAddComponentPanel(false);
                setIsEditing(false);
              }}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveComponent}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1e293b] transition-colors"
            >
              <Save size={20} />
              {isEditing ? 'Update Component' : 'Save Component'}
            </button>
          </div>
        </div>
      )}

      {/* View Cashflow Sidepanel */}
      {showViewCashflowPanel && (
        <div className="fixed right-0 top-0 h-full w-[1000px] bg-white shadow-2xl z-50 animate-slideLeft flex flex-col">
          <div className="bg-[#101828] text-white px-8 py-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Consolidated Cash Flow Statement</h3>
              <p className="text-sm text-slate-300 mt-1">Indirect Method</p>
            </div>
            <button
              onClick={() => setShowViewCashflowPanel(false)}
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
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#101828]">Line Item</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-[#101828]">
                      {formatPeriodDate(selectedPeriod)}
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-[#101828]">
                      {formatPeriodDate(comparePeriod) || 'Previous Period'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Operating Activities */}
                  {operating.length > 0 && (
                    <>
                      <tr className="bg-blue-50">
                        <td colSpan="3" className="px-6 py-3 text-sm font-bold text-blue-900">
                          CASH FLOWS FROM OPERATING ACTIVITIES
                        </td>
                      </tr>
                      {operating.map((component) => (
                        <tr key={component.id} className="border-b border-gray-200">
                          <td className="px-6 py-3 text-sm text-[#101828] pl-12">
                            {component.name}
                          </td>
                          <td className={`px-6 py-3 text-sm font-mono text-right ${component.cashImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(component.cashImpact)}
                          </td>
                          <td className="px-6 py-3 text-sm font-mono text-right text-gray-600">
                            {formatCurrency((component.previousYearValue - 0) * component.sign)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-blue-100 font-semibold">
                        <td className="px-6 py-3 text-sm text-blue-900">Net Cash from Operating Activities</td>
                        <td className={`px-6 py-3 text-sm font-mono text-right ${calculateCategoryTotal('Operating') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(calculateCategoryTotal('Operating'))}
                        </td>
                        <td className="px-6 py-3 text-sm font-mono text-right text-gray-600">-</td>
                      </tr>
                    </>
                  )}

                  {/* Investing Activities */}
                  {investing.length > 0 && (
                    <>
                      <tr className="bg-green-50">
                        <td colSpan="3" className="px-6 py-3 text-sm font-bold text-green-900">
                          CASH FLOWS FROM INVESTING ACTIVITIES
                        </td>
                      </tr>
                      {investing.map((component) => (
                        <tr key={component.id} className="border-b border-gray-200">
                          <td className="px-6 py-3 text-sm text-[#101828] pl-12">
                            {component.name}
                          </td>
                          <td className={`px-6 py-3 text-sm font-mono text-right ${component.cashImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(component.cashImpact)}
                          </td>
                          <td className="px-6 py-3 text-sm font-mono text-right text-gray-600">
                            {formatCurrency((component.previousYearValue - 0) * component.sign)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-green-100 font-semibold">
                        <td className="px-6 py-3 text-sm text-green-900">Net Cash from Investing Activities</td>
                        <td className={`px-6 py-3 text-sm font-mono text-right ${calculateCategoryTotal('Investing') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(calculateCategoryTotal('Investing'))}
                        </td>
                        <td className="px-6 py-3 text-sm font-mono text-right text-gray-600">-</td>
                      </tr>
                    </>
                  )}

                  {/* Financing Activities */}
                  {financing.length > 0 && (
                    <>
                      <tr className="bg-purple-50">
                        <td colSpan="3" className="px-6 py-3 text-sm font-bold text-purple-900">
                          CASH FLOWS FROM FINANCING ACTIVITIES
                        </td>
                      </tr>
                      {financing.map((component) => (
                        <tr key={component.id} className="border-b border-gray-200">
                          <td className="px-6 py-3 text-sm text-[#101828] pl-12">
                            {component.name}
                          </td>
                          <td className={`px-6 py-3 text-sm font-mono text-right ${component.cashImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(component.cashImpact)}
                          </td>
                          <td className="px-6 py-3 text-sm font-mono text-right text-gray-600">
                            {formatCurrency((component.previousYearValue - 0) * component.sign)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-purple-100 font-semibold">
                        <td className="px-6 py-3 text-sm text-purple-900">Net Cash from Financing Activities</td>
                        <td className={`px-6 py-3 text-sm font-mono text-right ${calculateCategoryTotal('Financing') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(calculateCategoryTotal('Financing'))}
                        </td>
                        <td className="px-6 py-3 text-sm font-mono text-right text-gray-600">-</td>
                      </tr>
                    </>
                  )}

                  {/* Grand Total */}
                  <tr className="bg-[#101828] text-white font-bold">
                    <td className="px-6 py-4 text-base">NET INCREASE/(DECREASE) IN CASH</td>
                    <td className="px-6 py-4 text-base font-mono text-right">
                      {formatCurrency(
                        calculateCategoryTotal('Operating') +
                        calculateCategoryTotal('Investing') +
                        calculateCategoryTotal('Financing')
                      )}
                    </td>
                    <td className="px-6 py-4 text-base font-mono text-right">-</td>
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

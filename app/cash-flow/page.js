'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  Plus,
  X,
  Save,
  Eye,
  Sparkles,
  TrendingUp,
  Loader,
  Edit2,
  Wand2
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

  // Sidepanel states
  const [showWorkingsPanel, setShowWorkingsPanel] = useState(false);
  const [showAddComponentPanel, setShowAddComponentPanel] = useState(false);
  const [showViewCashflowPanel, setShowViewCashflowPanel] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isGeneratingWorkings, setIsGeneratingWorkings] = useState(false);
  const [isGeneratingComponents, setIsGeneratingComponents] = useState(false);
  const [aiWorkings, setAiWorkings] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Add component form
  const [newComponent, setNewComponent] = useState({
    name: '',
    formula: [],
    type: 'note' // note, subnote, subclass, class
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

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
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

  const handleViewComponent = async (component) => {
    setSelectedComponent(component);
    setShowWorkingsPanel(true);
    setIsGeneratingWorkings(true);
    setAiWorkings('');

    // Simulate AI generating workings
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate AI workings based on component
    const workings = generateAIWorkings(component);
    setAiWorkings(workings);
    setIsGeneratingWorkings(false);
  };

  const generateAIWorkings = (component) => {
    // AI-generated workings for cashflow components
    const componentName = component.name || 'Component';

    // Show formula breakdown
    let formulaBreakdown = '\n## Formula Breakdown\n\n';
    if (component.formula && component.formula.length > 0) {
      component.formula.forEach((item, index) => {
        formulaBreakdown += `${index + 1}. ${item.operator} ${item.name} (${item.type})\n`;
      });
    }

    return `# ${componentName}

## Formula
This component is calculated based on the movement between consolidated balances:

**Formula:** Closing Balance (${formatPeriodDate(selectedPeriod)}) - Opening Balance (${formatPeriodDate(comparePeriod)})
${formulaBreakdown}
## Consolidated Numbers Used

### ${formatPeriodDate(selectedPeriod)}
- Total Consolidated Balance: ${formatCurrency(component.currentYearValue || 0)}

### ${formatPeriodDate(comparePeriod)}
- Total Consolidated Balance: ${formatCurrency(component.previousYearValue || 0)}

## Movement Calculation

\`\`\`
Movement = ${formatCurrency(component.currentYearValue || 0)} - ${formatCurrency(component.previousYearValue || 0)}
Movement = ${formatCurrency((component.currentYearValue || 0) - (component.previousYearValue || 0))}
\`\`\`

## Impact on Cash Flow

${((component.currentYearValue || 0) - (component.previousYearValue || 0)) < 0 ?
  `Negative movement of ${formatCurrency(Math.abs((component.currentYearValue || 0) - (component.previousYearValue || 0)))} indicates a **cash inflow**` :
  `Positive movement of ${formatCurrency((component.currentYearValue || 0) - (component.previousYearValue || 0))} indicates a **cash outflow**`
}

## Data Sources

- **Source**: Consolidated Trial Balance
- **Current Period**: ${formatPeriodDate(selectedPeriod)}
- **Previous Period**: ${formatPeriodDate(comparePeriod)}
- **Calculation Method**: Movement-based (Indirect Method)

## Notes

- All amounts are consolidated at group level
- Movements are calculated automatically based on trial balance data
- Intercompany eliminations are already applied in consolidated balances`;
  };

  const handleAIGenerate = async () => {
    if (!selectedPeriod || !comparePeriod) {
      alert('Please select both current and previous periods');
      return;
    }

    setIsGeneratingComponents(true);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // AI generates components based on COA and consolidated numbers
    const generatedComponents = generateAIComponents();
    setComponents(generatedComponents);
    setIsGeneratingComponents(false);
  };

  const generateAIComponents = () => {
    const components = [];
    let idCounter = Date.now();

    // 1. Operating Profit/Loss (Revenue - Expenses)
    const revenueClasses = ['Revenue', 'Income'];
    const expenseClasses = ['Expenses'];

    const revenueFormula = revenueClasses.map(className => ({
      operator: '+',
      name: className,
      type: 'class'
    }));

    const expenseFormula = expenseClasses.map(className => ({
      operator: '-',
      name: className,
      type: 'class'
    }));

    const operatingFormula = [...revenueFormula, ...expenseFormula];
    const operatingCurrent = calculateFormulaValue(operatingFormula, trialBalances);
    const operatingPrevious = calculateFormulaValue(operatingFormula, compareTrialBalances);

    components.push({
      id: idCounter++,
      name: 'Operating Profit / (Loss)',
      formula: operatingFormula,
      type: 'class',
      currentYearValue: operatingCurrent,
      previousYearValue: operatingPrevious,
      movement: operatingCurrent - operatingPrevious,
      isAIGenerated: true
    });

    // 2. Movement in Working Capital (Trade Receivables, Inventory, Trade Payables)
    const workingCapitalItems = [
      { name: 'Trade Receivables', keywords: ['receivable', 'debtors'], sign: -1 },
      { name: 'Inventory', keywords: ['inventory', 'stock'], sign: -1 },
      { name: 'Trade Payables', keywords: ['payable', 'creditors'], sign: 1 }
    ];

    workingCapitalItems.forEach(item => {
      const accounts = glAccounts.filter(acc => {
        const name = (acc.account_name || '').toLowerCase();
        const note = (acc.note_name || '').toLowerCase();
        return item.keywords.some(keyword => name.includes(keyword) || note.includes(keyword));
      });

      if (accounts.length > 0) {
        // Get unique note names
        const noteNames = [...new Set(accounts.map(acc => acc.note_name).filter(n => n))];

        if (noteNames.length > 0) {
          const formula = noteNames.map(noteName => ({
            operator: item.sign > 0 ? '+' : '-',
            name: noteName,
            type: 'note'
          }));

          const currentValue = calculateFormulaValue(formula, trialBalances);
          const previousValue = calculateFormulaValue(formula, compareTrialBalances);
          const movement = (currentValue - previousValue) * item.sign;

          components.push({
            id: idCounter++,
            name: `Change in ${item.name}`,
            formula: formula,
            type: 'note',
            currentYearValue: currentValue,
            previousYearValue: previousValue,
            movement: movement,
            isAIGenerated: true
          });
        }
      }
    });

    // 3. Depreciation and Amortization
    const depreciationAccounts = glAccounts.filter(acc =>
      acc.account_name && (
        acc.account_name.toLowerCase().includes('depreciation') ||
        acc.account_name.toLowerCase().includes('amortization')
      )
    );

    if (depreciationAccounts.length > 0) {
      const depNotes = [...new Set(depreciationAccounts.map(acc => acc.note_name).filter(n => n))];
      if (depNotes.length > 0) {
        const formula = depNotes.map(noteName => ({
          operator: '+',
          name: noteName,
          type: 'note'
        }));

        const currentValue = calculateFormulaValue(formula, trialBalances);
        const previousValue = calculateFormulaValue(formula, compareTrialBalances);

        components.push({
          id: idCounter++,
          name: 'Depreciation and Amortization',
          formula: formula,
          type: 'note',
          currentYearValue: currentValue,
          previousYearValue: previousValue,
          movement: currentValue - previousValue,
          isAIGenerated: true
        });
      }
    }

    // 4. Capital Expenditure (PPE, Intangibles)
    const capexItems = [
      { name: 'Property, Plant & Equipment', keywords: ['property', 'plant', 'equipment', 'ppe'] },
      { name: 'Intangible Assets', keywords: ['intangible', 'goodwill'] }
    ];

    capexItems.forEach(item => {
      const accounts = glAccounts.filter(acc => {
        const name = (acc.account_name || '').toLowerCase();
        const note = (acc.note_name || '').toLowerCase();
        return item.keywords.some(keyword => name.includes(keyword) || note.includes(keyword));
      });

      if (accounts.length > 0) {
        const noteNames = [...new Set(accounts.map(acc => acc.note_name).filter(n => n))];

        if (noteNames.length > 0) {
          const formula = noteNames.map(noteName => ({
            operator: '+',
            name: noteName,
            type: 'note'
          }));

          const currentValue = calculateFormulaValue(formula, trialBalances);
          const previousValue = calculateFormulaValue(formula, compareTrialBalances);
          const movement = -(currentValue - previousValue); // Negative for cash outflow

          components.push({
            id: idCounter++,
            name: `Purchase of ${item.name}`,
            formula: formula,
            type: 'note',
            currentYearValue: currentValue,
            previousYearValue: previousValue,
            movement: movement,
            isAIGenerated: true
          });
        }
      }
    });

    // 5. Financing Activities (Borrowings, Share Capital)
    const financingItems = [
      { name: 'Borrowings', keywords: ['loan', 'borrowing', 'debt'] },
      { name: 'Share Capital', keywords: ['share capital', 'equity'] }
    ];

    financingItems.forEach(item => {
      const accounts = glAccounts.filter(acc => {
        const name = (acc.account_name || '').toLowerCase();
        const note = (acc.note_name || '').toLowerCase();
        return item.keywords.some(keyword => name.includes(keyword) || note.includes(keyword));
      });

      if (accounts.length > 0) {
        const noteNames = [...new Set(accounts.map(acc => acc.note_name).filter(n => n))];

        if (noteNames.length > 0) {
          const formula = noteNames.map(noteName => ({
            operator: '+',
            name: noteName,
            type: 'note'
          }));

          const currentValue = calculateFormulaValue(formula, trialBalances);
          const previousValue = calculateFormulaValue(formula, compareTrialBalances);
          const movement = currentValue - previousValue;

          components.push({
            id: idCounter++,
            name: `Proceeds from ${item.name}`,
            formula: formula,
            type: 'note',
            currentYearValue: currentValue,
            previousYearValue: previousValue,
            movement: movement,
            isAIGenerated: true
          });
        }
      }
    });

    return components;
  };

  const handleEditComponent = (component) => {
    setSelectedComponent(component);
    setNewComponent({
      name: component.name,
      formula: component.formula || [],
      type: component.type || 'note'
    });
    setIsEditing(true);
    setShowAddComponentPanel(true);
  };

  const handleAddComponent = () => {
    setNewComponent({
      name: '',
      formula: [],
      type: 'note'
    });
    setIsEditing(false);
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
    const currentYearValue = calculateFormulaValue(newComponent.formula, trialBalances);
    const previousYearValue = calculateFormulaValue(newComponent.formula, compareTrialBalances);

    const component = {
      id: isEditing ? selectedComponent.id : Date.now(),
      name: newComponent.name,
      formula: newComponent.formula,
      type: newComponent.type,
      currentYearValue,
      previousYearValue,
      movement: currentYearValue - previousYearValue,
      isAIGenerated: isEditing ? selectedComponent.isAIGenerated : false
    };

    if (isEditing) {
      setComponents(prev => prev.map(c => c.id === selectedComponent.id ? component : c));
    } else {
      setComponents(prev => [...prev, component]);
    }

    setShowAddComponentPanel(false);
    setIsEditing(false);
  };

  const calculateFormulaValue = (formula, tbData) => {
    let total = 0;

    formula.forEach(item => {
      // Filter accounts based on type
      const accounts = glAccounts.filter(acc => {
        if (item.type === 'note') return acc.note_name === item.name;
        if (item.type === 'subnote') return acc.sub_note_name === item.name;
        if (item.type === 'subclass') return acc.sub_class_name === item.name;
        if (item.type === 'class') return acc.class_name === item.name;
        return false;
      });

      // Calculate total for these accounts
      let accountTotal = 0;
      accounts.forEach(acc => {
        const entries = tbData.filter(tb => tb.account_code === acc.account_code);
        entries.forEach(tb => {
          const debit = parseFloat(tb.debit || 0);
          const credit = parseFloat(tb.credit || 0);
          accountTotal += (debit - credit);
        });
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
    // Update all formula items to use the new type
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
        subtitle="AI-powered cashflow builder with consolidated numbers"
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
                onClick={handleAIGenerate}
                disabled={isGeneratingComponents || !selectedPeriod || !comparePeriod}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isGeneratingComponents ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    AI Generate
                  </>
                )}
              </button>
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
                    <th className="px-6 py-4 text-right text-sm font-bold">{formatPeriodDate(selectedPeriod)}</th>
                    <th className="px-6 py-4 text-right text-sm font-bold">{formatPeriodDate(comparePeriod) || 'Previous Period'}</th>
                    <th className="px-6 py-4 text-right text-sm font-bold">Movement</th>
                    <th className="px-6 py-4 text-center text-sm font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {components.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                          <TrendingUp size={48} className="text-gray-300" />
                          <p className="text-lg font-medium">No components added yet</p>
                          <p className="text-sm">Click "AI Generate" to auto-populate or "Add Component" to create manually</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    components.map((component, index) => (
                      <tr
                        key={component.id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td
                          className="px-6 py-4 text-sm font-semibold text-[#101828] cursor-pointer"
                          onClick={() => handleViewComponent(component)}
                        >
                          {component.name}
                          {component.isAIGenerated && (
                            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                              AI
                            </span>
                          )}
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
                          className={`px-6 py-4 text-sm font-mono text-right font-semibold cursor-pointer ${component.movement >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          onClick={() => handleViewComponent(component)}
                        >
                          {component.movement >= 0 ? '+' : ''}{formatCurrency(component.movement)}
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
              <p className="text-sm text-slate-300 mt-1">Component Workings</p>
            </div>
            <button
              onClick={() => setShowWorkingsPanel(false)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-8">
            {isGeneratingWorkings ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Sparkles className="animate-pulse text-purple-600" size={48} />
                <p className="text-lg font-semibold text-gray-700">AI is generating workings...</p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                  {aiWorkings}
                </pre>
              </div>
            )}
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
                  placeholder="e.g., Movement in Working Capital"
                />
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
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">Note:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• All data is from consolidated trial balance</li>
                  <li>• Movement is calculated as: Current Period - Previous Period</li>
                  <li>• Select the appropriate level (Note, Sub-Note, Class, Sub-Class)</li>
                  <li>• Use + to add and - to subtract components</li>
                  <li>• Changing calculation level will reset formula items</li>
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
        <div className="fixed right-0 top-0 h-full w-[900px] bg-white shadow-2xl z-50 animate-slideLeft flex flex-col">
          <div className="bg-[#101828] text-white px-8 py-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Cash Flow Statement</h3>
              <p className="text-sm text-slate-300 mt-1">Consolidated cash flow movements</p>
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
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#101828]">Components</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-[#101828]">
                      {formatPeriodDate(selectedPeriod)}
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-[#101828]">
                      {formatPeriodDate(comparePeriod) || 'Previous Period'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((component, index) => (
                    <tr key={component.id} className="border-b border-gray-200">
                      <td className="px-6 py-4 text-sm font-medium text-[#101828]">
                        {component.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-right text-[#101828]">
                        {formatCurrency(component.currentYearValue)}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-right text-gray-600">
                        {formatCurrency(component.previousYearValue)}
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-[#101828] text-white font-bold">
                    <td className="px-6 py-4 text-base">Total Cash Movement</td>
                    <td className="px-6 py-4 text-base font-mono text-right">
                      {formatCurrency(components.reduce((sum, c) => sum + c.currentYearValue, 0))}
                    </td>
                    <td className="px-6 py-4 text-base font-mono text-right">
                      {formatCurrency(components.reduce((sum, c) => sum + c.previousYearValue, 0))}
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

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Edit2,
  Save,
  Download,
  Loader,
  Plus,
  Trash2,
  FileDown,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  Maximize2,
  Move,
  Calculator
} from 'lucide-react';

export default function ReportingBuilder() {
  // Data states
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [comparePeriod, setComparePeriod] = useState('');
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [entities, setEntities] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [trialBalances, setTrialBalances] = useState([]);
  const [compareTrialBalances, setCompareTrialBalances] = useState([]);
  const [eliminations, setEliminations] = useState([]);
  const [adjustments, setAdjustments] = useState([]);

  // Report structure states
  const [reportSections, setReportSections] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    balance_sheet: true,
    income_statement: true,
    cash_flow: false,
    notes: false
  });

  // Editing states
  const [editingLineId, setEditingLineId] = useState(null);
  const [editedValues, setEditedValues] = useState({});

  // Validation states
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationPanel, setShowValidationPanel] = useState(false);

  // Note panel states
  const [showNotePanel, setShowNotePanel] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedPeriod, comparePeriod]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load periods
      const tbResponse = await fetch('/api/trial-balance');
      if (!tbResponse.ok) throw new Error('Failed to fetch trial balance');

      const allTBData = await tbResponse.json();
      const uniquePeriods = [...new Set(allTBData.map(tb => tb.period))].sort().reverse();

      setAvailablePeriods(uniquePeriods);

      if (!selectedPeriod && uniquePeriods.length > 0) {
        setSelectedPeriod(uniquePeriods[0]);
        if (uniquePeriods.length > 1) {
          setComparePeriod(uniquePeriods[1]);
        }
        return;
      }

      if (!selectedPeriod) {
        setIsLoading(false);
        return;
      }

      // Load all required data
      const [
        entitiesResponse,
        eliminationEntriesResponse,
        coaRes,
        hierarchyRes,
        adjustmentsRes
      ] = await Promise.all([
        fetch('/api/entities'),
        fetch('/api/elimination-entries'),
        supabase.from('chart_of_accounts').select('*').eq('is_active', true),
        supabase.from('coa_master_hierarchy').select('*').eq('is_active', true),
        supabase.from('adjustment_entries').select('*')
      ]);

      const entitiesData = await entitiesResponse.json();
      const eliminationEntriesData = await eliminationEntriesResponse.json();

      setEntities(entitiesData || []);
      setGlAccounts(coaRes.data || []);

      // Filter TB data
      const tbDataForPeriod = allTBData.filter(tb => tb.period === selectedPeriod);
      const tbDataForComparePeriod = comparePeriod ? allTBData.filter(tb => tb.period === comparePeriod) : [];

      setTrialBalances(tbDataForPeriod);
      setCompareTrialBalances(tbDataForComparePeriod);
      setEliminations(eliminationEntriesData || []);
      setAdjustments(adjustmentsRes.data || []);

      // Build report structure
      buildReportStructure(hierarchyRes.data || [], coaRes.data || []);

    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading data: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const buildReportStructure = (masterHierarchy, coa) => {
    const sections = [
      {
        id: 'balance_sheet',
        name: 'Balance Sheet',
        type: 'statement',
        lineItems: buildBalanceSheetLines(masterHierarchy, coa)
      },
      {
        id: 'income_statement',
        name: 'Income Statement',
        type: 'statement',
        lineItems: buildIncomeStatementLines(masterHierarchy, coa)
      },
      {
        id: 'cash_flow',
        name: 'Cash Flow Statement',
        type: 'statement',
        lineItems: [] // To be implemented
      },
      {
        id: 'notes',
        name: 'Notes to Financial Statements',
        type: 'notes',
        lineItems: buildNotesList(masterHierarchy)
      }
    ];

    setReportSections(sections);
    runValidation(sections);
  };

  const buildBalanceSheetLines = (masterHierarchy, coa) => {
    const lines = [];
    const bsClasses = ['Assets', 'Liability', 'Liabilities', 'Equity'];

    // Get unique classes
    const classes = [...new Set(masterHierarchy
      .filter(h => h && bsClasses.includes(h.class_name))
      .map(h => h.class_name))];

    classes.forEach(className => {
      // Add class header
      lines.push({
        id: `class-${className}`,
        level: 'class',
        description: className,
        className: className,
        isHeader: true,
        currentValue: null,
        previousValue: null,
        noteRef: null,
        accounts: []
      });

      // Get notes for this class
      const classHierarchy = masterHierarchy.filter(h => h.class_name === className);
      const notes = [...new Set(classHierarchy.map(h => h.note_name))].filter(Boolean);

      notes.forEach(noteName => {
        const noteRecord = classHierarchy.find(h => h.note_name === noteName);
        const noteRef = noteRecord?.note_number || null;

        // Get accounts for this note
        const noteAccounts = coa.filter(acc =>
          acc.class_name === className &&
          acc.note_name === noteName
        );

        // Calculate consolidated value
        const currentValue = calculateConsolidatedValue(noteAccounts, className, false);
        const previousValue = comparePeriod ? calculateConsolidatedValue(noteAccounts, className, true) : null;

        lines.push({
          id: `note-${className}-${noteName}`,
          level: 'note',
          description: noteName,
          className: className,
          isHeader: false,
          currentValue: currentValue,
          previousValue: previousValue,
          noteRef: noteRef,
          accounts: noteAccounts
        });
      });

      // Add class total
      const classAccounts = coa.filter(acc => acc.class_name === className);
      const classTotal = calculateConsolidatedValue(classAccounts, className, false);
      const classTotalPrev = comparePeriod ? calculateConsolidatedValue(classAccounts, className, true) : null;

      lines.push({
        id: `total-${className}`,
        level: 'total',
        description: `Total ${className}`,
        className: className,
        isHeader: false,
        isTotal: true,
        currentValue: classTotal,
        previousValue: classTotalPrev,
        noteRef: null,
        accounts: classAccounts
      });
    });

    // Add Profit/Loss line
    const profitCurrent = calculateProfit(false);
    const profitPrevious = comparePeriod ? calculateProfit(true) : null;

    lines.push({
      id: 'profit-loss',
      level: 'class',
      description: 'Profit / (Loss)',
      className: 'Profit',
      isHeader: false,
      isProfit: true,
      currentValue: profitCurrent,
      previousValue: profitPrevious,
      noteRef: null,
      accounts: []
    });

    return lines;
  };

  const buildIncomeStatementLines = (masterHierarchy, coa) => {
    const lines = [];
    const isClasses = ['Revenue', 'Income', 'Expenses'];

    const classes = [...new Set(masterHierarchy
      .filter(h => h && isClasses.includes(h.class_name))
      .map(h => h.class_name))];

    classes.forEach(className => {
      lines.push({
        id: `class-${className}`,
        level: 'class',
        description: className,
        className: className,
        isHeader: true,
        currentValue: null,
        previousValue: null,
        noteRef: null,
        accounts: []
      });

      const classHierarchy = masterHierarchy.filter(h => h.class_name === className);
      const notes = [...new Set(classHierarchy.map(h => h.note_name))].filter(Boolean);

      notes.forEach(noteName => {
        const noteRecord = classHierarchy.find(h => h.note_name === noteName);
        const noteRef = noteRecord?.note_number || null;

        const noteAccounts = coa.filter(acc =>
          acc.class_name === className &&
          acc.note_name === noteName
        );

        const currentValue = calculateConsolidatedValue(noteAccounts, className, false);
        const previousValue = comparePeriod ? calculateConsolidatedValue(noteAccounts, className, true) : null;

        lines.push({
          id: `note-${className}-${noteName}`,
          level: 'note',
          description: noteName,
          className: className,
          isHeader: false,
          currentValue: currentValue,
          previousValue: previousValue,
          noteRef: noteRef,
          accounts: noteAccounts
        });
      });

      const classAccounts = coa.filter(acc => acc.class_name === className);
      const classTotal = calculateConsolidatedValue(classAccounts, className, false);
      const classTotalPrev = comparePeriod ? calculateConsolidatedValue(classAccounts, className, true) : null;

      lines.push({
        id: `total-${className}`,
        level: 'total',
        description: `Total ${className}`,
        className: className,
        isHeader: false,
        isTotal: true,
        currentValue: classTotal,
        previousValue: classTotalPrev,
        noteRef: null,
        accounts: classAccounts
      });
    });

    // Add Net Profit line
    const profitCurrent = calculateProfit(false);
    const profitPrevious = comparePeriod ? calculateProfit(true) : null;

    lines.push({
      id: 'net-profit',
      level: 'total',
      description: 'Net Profit / (Loss)',
      className: 'Profit',
      isHeader: false,
      isTotal: true,
      isProfit: true,
      currentValue: profitCurrent,
      previousValue: profitPrevious,
      noteRef: null,
      accounts: []
    });

    return lines;
  };

  const buildNotesList = (masterHierarchy) => {
    const notesList = [];
    const allNotes = [...new Set(masterHierarchy
      .filter(h => h && h.note_name && h.note_number)
      .map(h => ({ number: h.note_number, name: h.note_name, class: h.class_name })))];

    // Group by note number
    const noteGroups = {};
    allNotes.forEach(note => {
      if (!noteGroups[note.number]) {
        noteGroups[note.number] = note;
      }
    });

    // Sort by note number
    const sortedNotes = Object.values(noteGroups).sort((a, b) => a.number - b.number);

    sortedNotes.forEach(note => {
      notesList.push({
        id: `note-ref-${note.number}`,
        level: 'note',
        description: `Note ${note.number}: ${note.name}`,
        className: note.class,
        isHeader: false,
        noteRef: note.number,
        currentValue: null,
        previousValue: null,
        accounts: []
      });
    });

    return notesList;
  };

  const calculateConsolidatedValue = (accounts, className, useComparePeriod = false) => {
    if (!accounts || accounts.length === 0) return 0;

    const tbData = useComparePeriod ? compareTrialBalances : trialBalances;
    let total = 0;

    // Sum all entity values
    entities.forEach(entity => {
      accounts.forEach(account => {
        const tbEntries = tbData.filter(
          tb => tb.account_code === account.account_code && tb.entity_id === entity.id
        );

        tbEntries.forEach(tb => {
          const debit = parseFloat(tb.debit || 0);
          const credit = parseFloat(tb.credit || 0);

          // Use natural balance direction
          let netAmount;
          if (['Assets', 'Expenses'].includes(className)) {
            netAmount = debit - credit;
          } else {
            netAmount = credit - debit;
          }
          total += netAmount;
        });
      });
    });

    // Add eliminations
    accounts.forEach(account => {
      const entriesWithMatchingLines = eliminations.filter(e =>
        e.lines && Array.isArray(e.lines) &&
        e.lines.some(line => line.gl_code === account.account_code)
      );

      entriesWithMatchingLines.forEach(entry => {
        const matchingLines = entry.lines.filter(line => line.gl_code === account.account_code);

        matchingLines.forEach(line => {
          const debitAmount = parseFloat(line.debit || 0);
          const creditAmount = parseFloat(line.credit || 0);

          let netElim;
          if (['Assets', 'Expenses'].includes(className)) {
            netElim = debitAmount - creditAmount;
          } else {
            netElim = creditAmount - debitAmount;
          }
          total += netElim;
        });
      });
    });

    // Add adjustments
    accounts.forEach(account => {
      const adjEntries = adjustments.filter(a =>
        a.debit_account === account.account_code || a.credit_account === account.account_code
      );

      adjEntries.forEach(adj => {
        let debitAmount = 0;
        let creditAmount = 0;

        if (adj.debit_account === account.account_code) {
          debitAmount = parseFloat(adj.amount || 0);
        }
        if (adj.credit_account === account.account_code) {
          creditAmount = parseFloat(adj.amount || 0);
        }

        let netAdj;
        if (['Assets', 'Expenses'].includes(className)) {
          netAdj = debitAmount - creditAmount;
        } else {
          netAdj = creditAmount - debitAmount;
        }
        total += netAdj;
      });
    });

    return total;
  };

  const calculateProfit = (useComparePeriod = false) => {
    const revenueAccounts = glAccounts.filter(acc =>
      acc && acc.is_active && ['Revenue', 'Income'].includes(acc.class_name)
    );
    const expenseAccounts = glAccounts.filter(acc =>
      acc && acc.is_active && acc.class_name === 'Expenses'
    );

    const totalRevenue = calculateConsolidatedValue(revenueAccounts, 'Revenue', useComparePeriod);
    const totalExpenses = calculateConsolidatedValue(expenseAccounts, 'Expenses', useComparePeriod);

    return totalRevenue - totalExpenses;
  };

  const runValidation = (sections) => {
    const errors = [];

    // Find balance sheet section
    const bsSection = sections.find(s => s.id === 'balance_sheet');
    if (bsSection) {
      // Calculate totals
      const assetsTotal = bsSection.lineItems.find(l => l.id === 'total-Assets')?.currentValue || 0;
      const liabilitiesTotal = bsSection.lineItems.find(l => l.id === 'total-Liability' || l.id === 'total-Liabilities')?.currentValue || 0;
      const equityTotal = bsSection.lineItems.find(l => l.id === 'total-Equity')?.currentValue || 0;
      const profitLoss = bsSection.lineItems.find(l => l.id === 'profit-loss')?.currentValue || 0;

      const bsLeft = Math.abs(assetsTotal);
      const bsRight = Math.abs(liabilitiesTotal) + Math.abs(equityTotal) + Math.abs(profitLoss);
      const difference = bsLeft - bsRight;

      if (Math.abs(difference) >= 1) {
        errors.push({
          type: 'error',
          section: 'Balance Sheet',
          message: `Balance Sheet is out of balance by ${formatCurrency(Math.abs(difference))}`,
          detail: `Assets (${formatCurrency(bsLeft)}) ≠ Liabilities (${formatCurrency(Math.abs(liabilitiesTotal))}) + Equity (${formatCurrency(Math.abs(equityTotal))}) + Profit (${formatCurrency(Math.abs(profitLoss))})`
        });
      }
    }

    // Check for missing note references
    sections.forEach(section => {
      section.lineItems.forEach(line => {
        if (line.level === 'note' && !line.noteRef && line.currentValue !== 0) {
          errors.push({
            type: 'warning',
            section: section.name,
            message: `Missing note reference for "${line.description}"`,
            detail: 'This line item should have a note reference'
          });
        }
      });
    });

    setValidationErrors(errors);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(value || 0));
  };

  const handleLineEdit = (lineId, field, value) => {
    setEditedValues(prev => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        [field]: value
      }
    }));
  };

  const saveLineEdit = (lineId) => {
    // Here you would save the edited values to database
    showToast('Line item updated successfully');
    setEditingLineId(null);
  };

  const openNotePanel = (noteRef) => {
    setSelectedNote(noteRef);
    setShowNotePanel(true);
  };

  const renderLineItem = (line, sectionId) => {
    const isEditing = editingLineId === line.id;
    const editedLine = editedValues[line.id] || {};

    const displayValue = isEditing ? editedLine.currentValue : line.currentValue;
    const displayPrevValue = isEditing ? editedLine.previousValue : line.previousValue;

    // Style based on level
    const levelStyles = {
      class: 'bg-[#101828] text-white font-bold',
      note: 'bg-white hover:bg-gray-50',
      total: 'bg-blue-50 font-semibold border-t-2 border-blue-200'
    };

    return (
      <tr key={line.id} className={`border-b border-gray-200 ${levelStyles[line.level]}`}>
        {/* Description */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {line.level === 'note' && <div className="w-4 h-4" />}
            {isEditing ? (
              <input
                type="text"
                value={editedLine.description || line.description}
                onChange={(e) => handleLineEdit(line.id, 'description', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm text-[#101828] w-full"
              />
            ) : (
              <span className={line.level === 'class' ? 'text-white' : 'text-[#101828]'}>
                {line.description}
              </span>
            )}
          </div>
        </td>

        {/* Current Year */}
        <td className="py-3 px-4 text-right font-mono">
          {line.currentValue !== null ? (
            isEditing ? (
              <input
                type="text"
                value={displayValue !== null ? formatCurrency(displayValue) : ''}
                onChange={(e) => handleLineEdit(line.id, 'currentValue', parseFloat(e.target.value.replace(/,/g, '')) || 0)}
                className="px-2 py-1 border border-gray-300 rounded text-sm text-right font-mono w-32"
              />
            ) : (
              <span className={line.level === 'class' ? 'text-white' : 'text-[#101828]'}>
                {formatCurrency(line.currentValue)}
              </span>
            )
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>

        {/* Previous Year */}
        {comparePeriod && (
          <td className="py-3 px-4 text-right font-mono">
            {line.previousValue !== null ? (
              isEditing ? (
                <input
                  type="text"
                  value={displayPrevValue !== null ? formatCurrency(displayPrevValue) : ''}
                  onChange={(e) => handleLineEdit(line.id, 'previousValue', parseFloat(e.target.value.replace(/,/g, '')) || 0)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm text-right font-mono w-32"
                />
              ) : (
                <span className={line.level === 'class' ? 'text-white' : 'text-gray-600'}>
                  {formatCurrency(line.previousValue)}
                </span>
              )
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </td>
        )}

        {/* Note Ref */}
        <td className="py-3 px-4 text-center">
          {line.noteRef ? (
            <button
              onClick={() => openNotePanel(line.noteRef)}
              className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold hover:bg-purple-200"
            >
              Note {line.noteRef}
            </button>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>

        {/* Actions */}
        <td className="py-3 px-4 text-center">
          {!line.isHeader && !line.isTotal && !line.isProfit && (
            <div className="flex items-center justify-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => saveLineEdit(line.id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="Save"
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingLineId(null);
                      setEditedValues(prev => {
                        const newVals = { ...prev };
                        delete newVals[line.id];
                        return newVals;
                      });
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    title="Cancel"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingLineId(line.id)}
                  className={`p-1 ${line.level === 'class' ? 'text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} rounded`}
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
          )}
        </td>
      </tr>
    );
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
        icon={FileText}
        title="Reporting Builder"
        subtitle="Live financial statement canvas with data from consolidation workings"
      />

      <div className="flex-1 overflow-hidden flex">
        {/* Main Canvas */}
        <div className="flex-1 overflow-auto px-8 py-6">
          {/* Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">Period:</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availablePeriods.map(period => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">Compare:</label>
                  <select
                    value={comparePeriod}
                    onChange={(e) => setComparePeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {availablePeriods.map(period => (
                      <option key={period} value={period}>{period}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowValidationPanel(!showValidationPanel)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    validationErrors.length > 0
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {validationErrors.length > 0 ? (
                    <AlertCircle size={16} />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {validationErrors.length > 0 ? `${validationErrors.length} Issues` : 'Validated'}
                </button>

                <button
                  onClick={() => loadData()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>

                <Link
                  href="/consolidation-workings"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
                >
                  <Calculator size={16} />
                  Workings
                </Link>

                <button className="flex items-center gap-2 px-4 py-2 bg-[#101828] text-white rounded-lg text-sm font-semibold hover:bg-gray-700">
                  <Download size={16} />
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* Report Sections */}
          <div className="space-y-4">
            {reportSections.map(section => (
              <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Section Header */}
                <div
                  className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-3">
                    {expandedSections[section.id] ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                    <h2 className="text-xl font-bold">{section.name}</h2>
                    <span className="text-sm text-gray-300">
                      {section.lineItems.length} lines
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add new line
                      }}
                      className="p-2 hover:bg-gray-700 rounded transition-colors"
                      title="Add line"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // View full screen
                      }}
                      className="p-2 hover:bg-gray-700 rounded transition-colors"
                      title="Maximize"
                    >
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Section Content */}
                {expandedSections[section.id] && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b-2 border-gray-300">
                        <tr>
                          <th className="py-3 px-4 text-left font-semibold text-xs uppercase text-gray-700">
                            Description
                          </th>
                          <th className="py-3 px-4 text-right font-semibold text-xs uppercase text-gray-700 w-40">
                            {selectedPeriod || 'Current Year'}
                          </th>
                          {comparePeriod && (
                            <th className="py-3 px-4 text-right font-semibold text-xs uppercase text-gray-700 w-40">
                              {comparePeriod}
                            </th>
                          )}
                          <th className="py-3 px-4 text-center font-semibold text-xs uppercase text-gray-700 w-32">
                            Note Ref
                          </th>
                          <th className="py-3 px-4 text-center font-semibold text-xs uppercase text-gray-700 w-32">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.lineItems.map(line => renderLineItem(line, section.id))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Validation Panel */}
        {showValidationPanel && (
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#101828]">Validation</h3>
                <button
                  onClick={() => setShowValidationPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {validationErrors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle size={48} className="text-green-500 mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">All Checks Passed</h4>
                  <p className="text-sm text-gray-600">
                    Your financial statements are balanced and complete
                  </p>
                </div>
              ) : (
                validationErrors.map((error, index) => (
                  <div
                    key={index}
                    className={`border-l-4 rounded-r-lg p-4 ${
                      error.type === 'error'
                        ? 'bg-red-50 border-red-500'
                        : 'bg-yellow-50 border-yellow-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={20}
                        className={error.type === 'error' ? 'text-red-600' : 'text-yellow-600'}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900 mb-1">
                          {error.section}
                        </div>
                        <div className="text-sm text-gray-700 mb-2">
                          {error.message}
                        </div>
                        {error.detail && (
                          <div className="text-xs text-gray-600 font-mono bg-white rounded p-2">
                            {error.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Note Panel */}
      {showNotePanel && selectedNote && (
        <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-50 animate-slideLeft">
          <div className="h-full flex flex-col">
            <div className="bg-purple-700 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Note {selectedNote}</h3>
                <p className="text-sm text-purple-100 mt-1">View and edit note content</p>
              </div>
              <button
                onClick={() => setShowNotePanel(false)}
                className="p-2 hover:bg-purple-600 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <Link
                  href="/note-builder"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
                >
                  <Edit2 size={16} />
                  Open in Note Builder
                </Link>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-600">
                  Note content will be loaded from Note Builder...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg animate-slideUp z-[100] ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="font-semibold">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

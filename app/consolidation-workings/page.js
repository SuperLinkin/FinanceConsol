'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  Download,
  Save,
  Loader,
  ChevronRight,
  ChevronDown,
  Building2,
  Minus,
  Plus,
  Calculator,
  Eye,
  X
} from 'lucide-react';

export default function ConsolidationWorkings() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [selectedStatement, setSelectedStatement] = useState('balance_sheet');
  const [availablePeriods, setAvailablePeriods] = useState([]);

  // Data states
  const [coaHierarchy, setCoaHierarchy] = useState([]);
  const [entities, setEntities] = useState([]);
  const [trialBalances, setTrialBalances] = useState([]);
  const [eliminations, setEliminations] = useState([]);
  const [adjustments, setAdjustments] = useState([]);

  // UI states
  const [expandedRows, setExpandedRows] = useState({});
  const [showEliminationDetail, setShowEliminationDetail] = useState(null);
  const [showAdjustmentDetail, setShowAdjustmentDetail] = useState(null);

  // Statement tabs
  const statementTabs = [
    { id: 'balance_sheet', label: 'Balance Sheet', classes: ['Assets', 'Liabilities', 'Equity'] },
    { id: 'income_statement', label: 'Income Statement', classes: ['Income', 'Expenses'] },
    { id: 'equity', label: 'Statement of Equity', classes: ['Equity'] },
    { id: 'cash_flow', label: 'Cash Flow', classes: ['Assets'] }
  ];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedStatement]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load all required data
      const [
        periodsRes,
        entitiesRes,
        coaRes,
        hierarchyRes,
        tbRes,
        eliminationsRes,
        adjustmentsRes
      ] = await Promise.all([
        supabase.from('reporting_periods').select('*').order('period_code'),
        supabase.from('entities').select('*').eq('is_active', true).order('entity_name'),
        supabase.from('chart_of_accounts').select('*').eq('is_active', true),
        supabase.from('coa_master_hierarchy').select('*').eq('is_active', true),
        supabase.from('trial_balance').select('*').eq('period', selectedPeriod + '-12-31'),
        supabase.from('eliminations').select('*').eq('period', selectedPeriod).eq('is_active', true),
        supabase.from('builder_entries').select('*').eq('period', selectedPeriod).eq('is_active', true)
      ]);

      setAvailablePeriods(periodsRes.data || []);
      setEntities(entitiesRes.data || []);
      setTrialBalances(tbRes.data || []);
      setEliminations(eliminationsRes.data || []);
      setAdjustments(adjustmentsRes.data || []);

      // Build COA hierarchy for selected statement
      const hierarchy = buildCOAHierarchy(
        hierarchyRes.data || [],
        coaRes.data || [],
        selectedStatement
      );
      setCoaHierarchy(hierarchy);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const buildCOAHierarchy = (masterHierarchy, coa, statementType) => {
    // Filter classes based on statement type
    const currentTab = statementTabs.find(t => t.id === statementType);
    const allowedClasses = currentTab ? currentTab.classes : [];

    console.log('🏗️ Building COA hierarchy for:', statementType);
    console.log('Master hierarchy records:', masterHierarchy.length);
    console.log('COA records:', coa.length);
    console.log('Allowed classes:', allowedClasses);

    // Build hierarchical structure
    const hierarchy = [];

    // Group by class - with deduplication
    const classes = [...new Set(masterHierarchy
      .filter(h => h && allowedClasses.includes(h.class_name))
      .map(h => h.class_name))].filter(Boolean);

    console.log('Unique classes found:', classes);

    classes.forEach(className => {
      const classNode = {
        id: `class-${className}`,
        level: 'class',
        name: className,
        isExpanded: true,
        children: []
      };

      // Get subclasses for this class - with deduplication
      const subclasses = [...new Set(masterHierarchy
        .filter(h => h && h.class_name === className && h.subclass_name)
        .map(h => h.subclass_name))].filter(Boolean);

      subclasses.forEach(subclassName => {
        const subclassNode = {
          id: `subclass-${className}-${subclassName}`,
          level: 'subclass',
          name: subclassName,
          className: className,
          isExpanded: true,
          children: []
        };

        // Get notes for this subclass - with deduplication
        const notes = [...new Set(masterHierarchy
          .filter(h =>
            h &&
            h.class_name === className &&
            h.subclass_name === subclassName &&
            h.note_name
          )
          .map(h => h.note_name))].filter(Boolean);

        notes.forEach(noteName => {
          const noteNode = {
            id: `note-${className}-${subclassName}-${noteName}`,
            level: 'note',
            name: noteName,
            className: className,
            subclassName: subclassName,
            isExpanded: true,
            children: []
          };

          // Get unique subnotes
          const subnotesData = masterHierarchy.filter(
            h => h &&
                 h.class_name === className &&
                 h.subclass_name === subclassName &&
                 h.note_name === noteName &&
                 h.subnote_name
          );

          // Deduplicate subnotes by name
          const uniqueSubnoteNames = [...new Set(subnotesData.map(h => h.subnote_name))].filter(Boolean);

          uniqueSubnoteNames.forEach(subnoteName => {
            const subnoteNode = {
              id: `subnote-${className}-${subclassName}-${noteName}-${subnoteName}`,
              level: 'subnote',
              name: subnoteName,
              className: className,
              subclassName: subclassName,
              noteName: noteName,
              accounts: coa.filter(
                account =>
                  account &&
                  account.class_level === className &&
                  account.subclass_level === subclassName &&
                  account.note_level === noteName &&
                  account.subnote_level === subnoteName
              )
            };
            noteNode.children.push(subnoteNode);
          });

          if (noteNode.children.length > 0) {
            subclassNode.children.push(noteNode);
          }
        });

        if (subclassNode.children.length > 0) {
          classNode.children.push(subclassNode);
        }
      });

      if (classNode.children.length > 0) {
        hierarchy.push(classNode);
      }
    });

    console.log('✅ Hierarchy built with', hierarchy.length, 'top-level classes');
    return hierarchy;
  };

  const getEntityValue = (accounts, entityId, className) => {
    if (!accounts || accounts.length === 0) return 0;

    let total = 0;
    accounts.forEach(account => {
      const tbEntries = trialBalances.filter(
        tb => tb.account_code === account.account_code && tb.entity_id === entityId
      );

      tbEntries.forEach(tb => {
        const debit = parseFloat(tb.debit || 0);
        const credit = parseFloat(tb.credit || 0);

        // Calculate based on account class
        if (['Assets', 'Expenses'].includes(className)) {
          total += (debit - credit);
        } else {
          total += (credit - debit);
        }
      });
    });

    return total;
  };

  const getEliminationValue = (accounts, className) => {
    if (!accounts || accounts.length === 0) return 0;

    let total = 0;
    accounts.forEach(account => {
      const elimEntries = eliminations.filter(e =>
        e.account_code === account.account_code
      );

      elimEntries.forEach(elim => {
        const debit = parseFloat(elim.debit_amount || 0);
        const credit = parseFloat(elim.credit_amount || 0);

        if (['Assets', 'Expenses'].includes(className)) {
          total += (debit - credit);
        } else {
          total += (credit - debit);
        }
      });
    });

    return total;
  };

  const getAdjustmentValue = (accounts, className) => {
    if (!accounts || accounts.length === 0) return 0;

    let total = 0;
    accounts.forEach(account => {
      const adjEntries = adjustments.filter(a =>
        a.account_code === account.account_code
      );

      adjEntries.forEach(adj => {
        const debit = parseFloat(adj.debit_amount || 0);
        const credit = parseFloat(adj.credit_amount || 0);

        if (['Assets', 'Expenses'].includes(className)) {
          total += (debit - credit);
        } else {
          total += (credit - debit);
        }
      });
    });

    return total;
  };

  const getConsolidatedValue = (node) => {
    const className = node.className || node.name;
    let total = 0;

    // Get accounts for this node
    const accounts = node.accounts || [];

    // Sum all entity values
    entities.forEach(entity => {
      total += getEntityValue(accounts, entity.id, className);
    });

    // Add eliminations and adjustments
    total += getEliminationValue(accounts, className);
    total += getAdjustmentValue(accounts, className);

    return total;
  };

  const toggleRow = (nodeId) => {
    setExpandedRows(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const isRowExpanded = (nodeId) => {
    return expandedRows[nodeId] !== false; // Default to expanded
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const renderRow = (node, depth = 0) => {
    const isExpanded = isRowExpanded(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const paddingLeft = depth * 20;

    // Get className for value calculations
    const className = node.className || node.name;

    // Styles based on level with proper text colors
    const rowStyles = {
      class: 'bg-[#101828] text-white font-bold text-sm',
      subclass: 'bg-slate-100 font-semibold text-sm text-[#101828]',
      note: 'bg-white text-sm text-[#101828]',
      subnote: 'bg-slate-50 text-xs text-[#101828]'
    };

    // Get specific background color for sticky cell
    const stickyBgColors = {
      class: 'bg-[#101828]',
      subclass: 'bg-slate-100',
      note: 'bg-white',
      subnote: 'bg-slate-50'
    };

    return (
      <React.Fragment key={node.id}>
        <tr className={`border-b border-slate-200 ${rowStyles[node.level]}`}>
          {/* COA Name */}
          <td className={`py-2 px-4 sticky left-0 ${stickyBgColors[node.level]} z-10`} style={{ paddingLeft: `${paddingLeft + 16}px` }}>
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  onClick={() => toggleRow(node.id)}
                  className={`rounded p-1 ${
                    node.level === 'class'
                      ? 'hover:bg-slate-600 text-white'
                      : 'hover:bg-slate-300 text-[#101828]'
                  }`}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              )}
              {!hasChildren && <div className="w-6"></div>}
              <span className="font-medium">{node.name}</span>
              {node.accounts && node.accounts.length > 0 && (
                <span className={`text-xs ${node.level === 'class' ? 'opacity-75' : 'opacity-60'}`}>
                  ({node.accounts.length})
                </span>
              )}
            </div>
          </td>

          {/* Entity Columns */}
          {entities.map(entity => (
            <td key={entity.id} className={`py-2 px-4 text-right font-mono text-sm ${node.level === 'class' ? 'text-white' : 'text-[#101828]'}`}>
              {node.accounts && node.accounts.length > 0 ? (
                formatCurrency(getEntityValue(node.accounts, entity.id, className))
              ) : (
                <span className={node.level === 'class' ? 'text-slate-300' : 'text-slate-400'}>-</span>
              )}
            </td>
          ))}

          {/* Eliminations Column */}
          <td className={`py-2 px-4 text-right font-mono text-sm ${node.level === 'class' ? '' : 'bg-red-50'}`}>
            {node.accounts && node.accounts.length > 0 ? (
              <button
                onClick={() => setShowEliminationDetail(node)}
                className={`hover:underline font-semibold ${node.level === 'class' ? 'text-white' : 'text-red-800'}`}
              >
                {formatCurrency(getEliminationValue(node.accounts, className))}
              </button>
            ) : (
              <span className={node.level === 'class' ? 'text-slate-300' : 'text-slate-400'}>-</span>
            )}
          </td>

          {/* Adjustments Column */}
          <td className={`py-2 px-4 text-right font-mono text-sm ${node.level === 'class' ? '' : 'bg-blue-50'}`}>
            {node.accounts && node.accounts.length > 0 ? (
              <button
                onClick={() => setShowAdjustmentDetail(node)}
                className={`hover:underline font-semibold ${node.level === 'class' ? 'text-white' : 'text-blue-800'}`}
              >
                {formatCurrency(getAdjustmentValue(node.accounts, className))}
              </button>
            ) : (
              <span className={node.level === 'class' ? 'text-slate-300' : 'text-slate-400'}>-</span>
            )}
          </td>

          {/* Consolidated Column */}
          <td className={`py-2 px-4 text-right font-mono text-sm font-bold sticky right-0 ${node.level === 'class' ? 'bg-[#101828] text-white' : 'bg-indigo-50 text-indigo-900'}`}>
            {node.accounts && node.accounts.length > 0 ? (
              formatCurrency(getConsolidatedValue(node))
            ) : (
              <span className={node.level === 'class' ? 'text-slate-300' : 'text-slate-400'}>-</span>
            )}
          </td>
        </tr>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && node.children.map((child, index) => renderRow(child, depth + 1))}
      </React.Fragment>
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
        title="Consolidation Workings"
        subtitle="Multi-entity financial consolidation"
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-8 py-4 bg-white border-b border-slate-200">
          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Period Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Period:</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availablePeriods.map(period => (
                    <option key={period.period_code} value={period.period_code}>
                      {period.period_name || `FY ${period.period_code}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statement Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Statement:</label>
                <select
                  value={selectedStatement}
                  onChange={(e) => setSelectedStatement(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {statementTabs.map(tab => (
                    <option key={tab.id} value={tab.id}>{tab.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
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

        {/* Main Table */}
        <div className="flex-1 overflow-auto px-8 py-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-[#101828] text-white">
                    <th className="py-3 px-4 text-left font-semibold text-xs uppercase sticky left-0 bg-[#101828] z-30">
                      Chart of Accounts
                    </th>
                    {entities.map(entity => (
                      <th key={entity.id} className="py-3 px-4 text-right font-semibold text-xs uppercase min-w-[140px]">
                        <div>{entity.entity_name}</div>
                        <div className="text-xs opacity-75 font-normal">{entity.entity_type}</div>
                      </th>
                    ))}
                    <th className="py-3 px-4 text-right font-semibold text-xs uppercase min-w-[140px] bg-red-900">
                      <div className="flex items-center justify-end gap-1">
                        <Minus size={14} />
                        Eliminations
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right font-semibold text-xs uppercase min-w-[140px] bg-blue-900">
                      <div className="flex items-center justify-end gap-1">
                        <Plus size={14} />
                        Adjustments
                      </div>
                    </th>
                    <th className="py-3 px-4 text-right font-semibold text-xs uppercase min-w-[160px] bg-indigo-900 sticky right-0 z-30">
                      <div className="flex items-center justify-end gap-1">
                        <Calculator size={14} />
                        Consolidated
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coaHierarchy.length > 0 ? (
                    coaHierarchy.map(node => renderRow(node, 0))
                  ) : (
                    <tr>
                      <td colSpan={entities.length + 4} className="py-8 text-center text-slate-500">
                        No data available for this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Elimination Detail Modal */}
      {showEliminationDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#101828]">
                Elimination Entries - {showEliminationDetail.name}
              </h3>
              <button
                onClick={() => setShowEliminationDetail(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            {/* Add elimination details table here */}
            <p className="text-sm text-slate-600">Elimination entries will be displayed here</p>
          </div>
        </div>
      )}

      {/* Adjustment Detail Modal */}
      {showAdjustmentDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#101828]">
                Adjustment Entries - {showAdjustmentDetail.name}
              </h3>
              <button
                onClick={() => setShowAdjustmentDetail(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            {/* Add adjustment details table here */}
            <p className="text-sm text-slate-600">Adjustment entries will be displayed here</p>
          </div>
        </div>
      )}
    </div>
  );
}

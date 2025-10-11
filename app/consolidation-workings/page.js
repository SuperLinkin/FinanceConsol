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
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function ConsolidationWorkings() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedStatement, setSelectedStatement] = useState('balance_sheet');
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [isPopulating, setIsPopulating] = useState(false);

  // Data states
  const [coaHierarchy, setCoaHierarchy] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [entities, setEntities] = useState([]);
  const [trialBalances, setTrialBalances] = useState([]);
  const [eliminations, setEliminations] = useState([]);
  const [adjustments, setAdjustments] = useState([]);

  // UI states
  const [expandedRows, setExpandedRows] = useState({});
  const [showEliminationDetail, setShowEliminationDetail] = useState(null);
  const [showAdjustmentDetail, setShowAdjustmentDetail] = useState(null);
  const [showGLDetail, setShowGLDetail] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Statement tabs
  const statementTabs = [
    { id: 'balance_sheet', label: 'Balance Sheet', classes: ['Assets', 'Liability', 'Liabilities', 'Equity'] },
    { id: 'income_statement', label: 'Income Statement', classes: ['Revenue', 'Income', 'Expenses'] },
    { id: 'equity', label: 'Statement of Equity', classes: ['Equity'] },
    { id: 'cash_flow', label: 'Cash Flow', classes: ['Assets'] },
    { id: 'intercompany', label: 'Intercompany Balances', classes: ['Intercompany'] }
  ];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedStatement]);

  const displayToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading consolidation workings data...');

      // First load periods from API (with proper company filtering)
      const tbResponse = await fetch('/api/trial-balance');
      if (!tbResponse.ok) {
        throw new Error('Failed to fetch trial balance data');
      }
      const allTBData = await tbResponse.json();

      console.log('📅 Trial balance data loaded:', allTBData.length, 'records');

      // Get unique periods from trial_balance
      const uniquePeriods = [...new Set((allTBData || []).map(tb => tb.period))].sort().reverse();
      console.log('📅 Unique periods found:', uniquePeriods);

      const periodOptions = uniquePeriods.map(period => ({
        period_code: period,
        period_name: period
      }));

      console.log('📅 Period options:', periodOptions);
      setAvailablePeriods(periodOptions);

      // Set initial period if not set
      if (!selectedPeriod && periodOptions.length > 0) {
        console.log('✅ Setting initial period to:', periodOptions[0].period_code);
        setSelectedPeriod(periodOptions[0].period_code);
        return; // Will trigger useEffect to reload with period
      }

      if (!selectedPeriod) {
        console.log('⚠️ No period selected and no periods available');
        setIsLoading(false);
        return;
      }

      console.log('📊 Loading data for period:', selectedPeriod);

      // Load all required data using API endpoints
      const [
        entitiesResponse,
        coaRes,
        hierarchyRes,
        eliminationEntriesRes,
        intercompanyRes,
        adjustmentsRes
      ] = await Promise.all([
        fetch('/api/entities'),
        supabase.from('chart_of_accounts').select('*').eq('is_active', true),
        supabase.from('coa_master_hierarchy').select('*').eq('is_active', true),
        supabase.from('elimination_entries').select('*'),
        supabase.from('intercompany_transactions').select('*').eq('is_eliminated', false),
        supabase.from('adjustment_entries').select('*')
      ]);

      // Parse API responses
      const entitiesData = await entitiesResponse.json();

      // Filter elimination entries to only include those for our company's entities
      const entityIds = entitiesData.map(e => e.id);
      const filteredEliminations = (eliminationEntriesRes.data || []).filter(elim =>
        (elim.entity_from && entityIds.includes(elim.entity_from)) ||
        (elim.entity_to && entityIds.includes(elim.entity_to))
      );

      console.log('📝 Elimination entries:', eliminationEntriesRes.data?.length || 0, 'total,', filteredEliminations.length, 'filtered for this company');
      if (filteredEliminations.length > 0) {
        console.log('Sample elimination entry:', filteredEliminations[0]);
      }

      // Filter trial balances for selected period
      const tbDataForPeriod = allTBData.filter(tb => tb.period === selectedPeriod);

      console.log('📊 Data loaded:');
      console.log('Entities:', entitiesData?.length);
      console.log('COA:', coaRes.data?.length);
      console.log('Hierarchy:', hierarchyRes.data?.length);
      console.log('Trial Balance for period', selectedPeriod, ':', tbDataForPeriod?.length);

      setEntities(entitiesData || []);
      setGlAccounts(coaRes.data || []);
      setTrialBalances(tbDataForPeriod || []);

      // Combine elimination entries and intercompany transactions
      const allEliminations = [
        ...filteredEliminations,
        ...(intercompanyRes.data || [])
      ];
      setEliminations(allEliminations);
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
      const errorMsg = error?.message || error?.toString() || 'Unknown error occurred';
      displayToast('Error loading data: ' + errorMsg, 'error');
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
        isExpanded: false, // Default collapsed for summary view
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
                  account.class_name === className &&
                  account.subclass_name === subclassName &&
                  account.note_name === noteName &&
                  account.subnote_name === subnoteName
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

    // Add Profit/Loss row after Equity for Balance Sheet
    if (statementType === 'balance_sheet') {
      const equityIndex = hierarchy.findIndex(h => h.name === 'Equity');
      if (equityIndex !== -1) {
        const profitNode = {
          id: 'profit-loss',
          level: 'class',
          name: 'Profit / (Loss)',
          isProfitRow: true,
          isExpanded: false,
          children: []
        };
        hierarchy.splice(equityIndex + 1, 0, profitNode);
      }
    }

    console.log('✅ Hierarchy built with', hierarchy.length, 'top-level classes');
    return hierarchy;
  };

  const getEntityValue = (accounts, entityId, className) => {
    if (!accounts || accounts.length === 0) return 0;

    let total = 0;
    let foundEntries = 0;

    accounts.forEach(account => {
      const tbEntries = trialBalances.filter(
        tb => tb.account_code === account.account_code && tb.entity_id === entityId
      );

      if (tbEntries.length > 0) {
        foundEntries += tbEntries.length;
      }

      tbEntries.forEach(tb => {
        const debit = parseFloat(tb.debit || 0);
        const credit = parseFloat(tb.credit || 0);

        // Calculate net amount (debit - credit) for all classes
        // Use Math.abs() for display purposes
        const netAmount = debit - credit;
        total += netAmount;
      });
    });

    // Debug first call
    if (foundEntries > 0 && typeof window !== 'undefined') {
      console.log(`Found ${foundEntries} TB entries for ${accounts.length} accounts in class ${className}, entityId: ${entityId}, total: ${total}`);
    }

    return total;
  };

  const getEliminationValue = (accounts, className) => {
    if (!accounts || accounts.length === 0) return 0;

    let total = 0;
    let foundElims = 0;

    accounts.forEach(account => {
      // Check elimination_entries (custom eliminations)
      const customElimEntries = eliminations.filter(e =>
        e.debit_account === account.account_code || e.credit_account === account.account_code
      );

      if (customElimEntries.length > 0) {
        foundElims += customElimEntries.length;
        if (typeof window !== 'undefined' && foundElims <= 3) {
          console.log(`Found ${customElimEntries.length} elimination entries for account ${account.account_code}:`, customElimEntries);
        }
      }

      customElimEntries.forEach(elim => {
        let debitAmount = 0;
        let creditAmount = 0;

        if (elim.debit_account === account.account_code) {
          debitAmount = parseFloat(elim.amount || 0);
        }
        if (elim.credit_account === account.account_code) {
          creditAmount = parseFloat(elim.amount || 0);
        }

        // Use same logic as getEntityValue: debit - credit for all classes
        const netElim = debitAmount - creditAmount;
        total += netElim;
      });

      // Check intercompany_transactions (GL-to-GL mappings)
      const icEntries = eliminations.filter(e =>
        (e.from_account === account.account_code || e.to_account === account.account_code) &&
        e.transaction_type === 'Elimination Mapping'
      );

      icEntries.forEach(ic => {
        const amount = parseFloat(ic.amount || 0);
        // For elimination mappings, we subtract the amount (it's being eliminated)
        if (['Assets', 'Expenses'].includes(className)) {
          total -= amount;
        } else {
          total -= amount;
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

        // Use same logic as getEntityValue: debit - credit for all classes
        const netAdj = debitAmount - creditAmount;
        total += netAdj;
      });
    });

    return total;
  };

  const handlePopulate = async () => {
    if (!selectedPeriod) {
      displayToast('Please select a period first', 'error');
      return;
    }

    setIsPopulating(true);
    try {
      console.log('🔄 Starting populate for period:', selectedPeriod);

      // Fetch trial balance data from API
      const tbResponse = await fetch('/api/trial-balance');
      if (!tbResponse.ok) {
        throw new Error('Failed to fetch trial balance data');
      }
      const allTBRecords = await tbResponse.json();

      const [elimEntriesRes, icTransRes, adjRes] = await Promise.all([
        supabase.from('elimination_entries').select('*'),
        supabase.from('intercompany_transactions').select('*').eq('is_eliminated', false),
        supabase.from('adjustment_entries').select('*')
      ]);

      if (elimEntriesRes.error) throw elimEntriesRes.error;
      if (icTransRes.error) throw icTransRes.error;
      if (adjRes.error) throw adjRes.error;

      // Filter TB data for selected period
      const tbDataForPeriod = allTBRecords.filter(tb => tb.period === selectedPeriod);

      // Filter elimination entries for current company's entities
      const entityIds = entities.map(e => e.id);
      const filteredElims = (elimEntriesRes.data || []).filter(elim =>
        (elim.entity_from && entityIds.includes(elim.entity_from)) ||
        (elim.entity_to && entityIds.includes(elim.entity_to))
      );

      console.log('✅ Populated data:');
      console.log('Trial Balance entries:', tbDataForPeriod?.length || 0);
      console.log('Elimination entries (filtered):', filteredElims?.length || 0);
      console.log('IC transactions:', icTransRes.data?.length || 0);
      console.log('Adjustment entries:', adjRes.data?.length || 0);

      // Sample some TB data to check structure
      if (tbDataForPeriod && tbDataForPeriod.length > 0) {
        console.log('Sample TB entry:', tbDataForPeriod[0]);
      }

      setTrialBalances(tbDataForPeriod || []);

      // Combine both elimination sources
      const allElims = [
        ...filteredElims,
        ...(icTransRes.data || [])
      ];
      setEliminations(allElims);
      setAdjustments(adjRes.data || []);

      displayToast(
        `Populated ${tbDataForPeriod?.length || 0} TB entries, ${allElims.length} eliminations, ${adjRes.data?.length || 0} adjustments`,
        'success'
      );
    } catch (error) {
      console.error('Error populating data:', error);
      displayToast('Error populating data: ' + error.message, 'error');
    } finally {
      setIsPopulating(false);
    }
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
    return expandedRows[nodeId] === true; // Default to collapsed
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  // Get all accounts recursively from a node and its children
  const getAllAccounts = (node) => {
    let accounts = [...(node.accounts || [])];
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        accounts = [...accounts, ...getAllAccounts(child)];
      });
    }
    return accounts;
  };

  // Get GL details for a specific entity/accounts combination
  const getGLDetails = (accounts, entityId, className) => {
    const details = [];
    accounts.forEach(account => {
      const tbEntries = trialBalances.filter(
        tb => tb.account_code === account.account_code && tb.entity_id === entityId
      );

      tbEntries.forEach(tb => {
        const debit = parseFloat(tb.debit || 0);
        const credit = parseFloat(tb.credit || 0);

        // Use same logic as getEntityValue: debit - credit for all classes
        const amount = debit - credit;

        if (amount !== 0) {
          details.push({
            code: account.account_code,
            name: account.account_name,
            debit: debit,
            credit: credit,
            amount: amount
          });
        }
      });
    });
    return details;
  };

  // Calculate class totals
  const calculateClassTotals = () => {
    const totals = {
      assets: 0,
      liabilities: 0,
      equity: 0,
      revenue: 0,
      expenses: 0
    };

    coaHierarchy.forEach(classNode => {
      const className = classNode.name;
      const allAccounts = getAllAccounts(classNode);

      entities.forEach(entity => {
        const value = getEntityValue(allAccounts, entity.id, className);

        if (className === 'Assets') totals.assets += value;
        else if (['Liability', 'Liabilities'].includes(className)) totals.liabilities += value;
        else if (className === 'Equity') totals.equity += value;
        else if (['Revenue', 'Income'].includes(className)) totals.revenue += value;
        else if (className === 'Expenses') totals.expenses += value;
      });

      // Add eliminations and adjustments
      const elimValue = getEliminationValue(allAccounts, className);
      const adjValue = getAdjustmentValue(allAccounts, className);

      if (className === 'Assets') {
        totals.assets += elimValue + adjValue;
      } else if (['Liability', 'Liabilities'].includes(className)) {
        totals.liabilities += elimValue + adjValue;
      } else if (className === 'Equity') {
        totals.equity += elimValue + adjValue;
      } else if (['Revenue', 'Income'].includes(className)) {
        totals.revenue += elimValue + adjValue;
      } else if (className === 'Expenses') {
        totals.expenses += elimValue + adjValue;
      }
    });

    totals.profit = totals.revenue - totals.expenses;
    return totals;
  };

  // Calculate BS Check: Assets = Liabilities + Equity + Profit
  // In a trial balance before closing: Assets + Expenses = Liabilities + Equity + Revenue
  // Therefore: Assets = Liabilities + Equity + (Revenue - Expenses) = Liabilities + Equity + Profit
  const calculateBSCheck = () => {
    const totals = calculateClassTotals();

    const bsLeft = totals.assets;
    const bsRight = totals.liabilities + totals.equity + totals.profit;
    const difference = bsLeft - bsRight;

    // Don't force balance - show actual difference
    const isBalanced = Math.abs(difference) < 1; // Allow for small rounding errors

    return {
      assets: totals.assets,
      liabilities: totals.liabilities,
      equity: totals.equity,
      profit: totals.profit,
      bsLeft,
      bsRight,
      difference,
      isBalanced
    };
  };

  const renderRow = (node, depth = 0) => {
    const isExpanded = isRowExpanded(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const paddingLeft = depth * 20;

    // Get className for value calculations
    const className = node.className || node.name;

    // Special handling for Profit/Loss row
    if (node.isProfitRow) {
      // Calculate profit from ALL Revenue/Income and Expenses accounts in COA
      const revenueAccounts = glAccounts.filter(acc =>
        acc && acc.is_active && ['Revenue', 'Income'].includes(acc.class_name)
      );
      const expenseAccounts = glAccounts.filter(acc =>
        acc && acc.is_active && acc.class_name === 'Expenses'
      );

      console.log('💰 Profit Row Calculation:');
      console.log('Revenue accounts:', revenueAccounts.length);
      console.log('Expense accounts:', expenseAccounts.length);

      return (
        <React.Fragment key={node.id}>
          <tr className={`border-b border-slate-200 bg-[#101828] text-white font-bold text-sm cursor-pointer hover:bg-slate-800`}
              onClick={() => setSelectedStatement('income_statement')}>
            <td className="py-2 px-4 sticky left-0 bg-[#101828] z-10" style={{ paddingLeft: `${paddingLeft + 16}px` }}>
              <div className="flex items-center gap-2">
                <div className="w-6"></div>
                <span className="font-medium">{node.name}</span>
                <span className="text-xs opacity-75 ml-2">(Click to view Income Statement)</span>
              </div>
            </td>
            {entities.map(entity => {
              // Calculate revenue for this entity - use consistent debit - credit logic
              let revenue = 0;
              revenueAccounts.forEach(acc => {
                const tbEntries = trialBalances.filter(tb =>
                  tb.account_code === acc.account_code && tb.entity_id === entity.id
                );
                tbEntries.forEach(tb => {
                  const debit = parseFloat(tb.debit || 0);
                  const credit = parseFloat(tb.credit || 0);
                  // Use consistent logic: debit - credit (will be negative for credit balances)
                  const value = debit - credit;
                  revenue += value;
                  if (typeof window !== 'undefined' && value !== 0) {
                    console.log(`  Rev Account ${acc.account_code}: Dr=${debit}, Cr=${credit}, Value=${value}`);
                  }
                });
              });

              // Calculate expenses for this entity - use consistent debit - credit logic
              let expenses = 0;
              expenseAccounts.forEach(acc => {
                const tbEntries = trialBalances.filter(tb =>
                  tb.account_code === acc.account_code && tb.entity_id === entity.id
                );
                tbEntries.forEach(tb => {
                  const debit = parseFloat(tb.debit || 0);
                  const credit = parseFloat(tb.credit || 0);
                  // Use consistent logic: debit - credit (will be positive for debit balances)
                  const value = debit - credit;
                  expenses += value;
                  if (typeof window !== 'undefined' && value !== 0) {
                    console.log(`  Exp Account ${acc.account_code}: Dr=${debit}, Cr=${credit}, Value=${value}`);
                  }
                });
              });

              // Profit = Revenue - Expenses
              // Revenue is negative (credit balance), Expenses is positive (debit balance)
              // So: (-100) - (50) = -150 means Loss of 150
              // Or: (-100) - (-20) = -80 means Loss of 80
              // Display profit/loss correctly
              const entityProfit = revenue - expenses;

              if (typeof window !== 'undefined') {
                console.log(`Entity ${entity.entity_name}: Revenue=${revenue}, Expenses=${expenses}, Profit=${entityProfit}`);
              }

              return (
                <td key={entity.id} className={`py-2 px-4 text-right font-mono text-sm ${entityProfit <= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {formatCurrency(Math.abs(entityProfit))}
                </td>
              );
            })}

            {/* Eliminations column */}
            <td className="py-2 px-4 text-right font-mono text-sm text-white">
              {(() => {
                const revElim = getEliminationValue(revenueAccounts, 'Revenue');
                const expElim = getEliminationValue(expenseAccounts, 'Expenses');
                return formatCurrency(revElim - expElim);
              })()}
            </td>

            {/* Adjustments column */}
            <td className="py-2 px-4 text-right font-mono text-sm text-white">
              {(() => {
                const revAdj = getAdjustmentValue(revenueAccounts, 'Revenue');
                const expAdj = getAdjustmentValue(expenseAccounts, 'Expenses');
                return formatCurrency(revAdj - expAdj);
              })()}
            </td>

            {/* Consolidated column */}
            <td className={`py-2 px-4 text-right font-mono text-sm font-bold sticky right-0 bg-[#101828]`}>
              {(() => {
                const totals = calculateClassTotals();
                const profit = totals.profit;
                return (
                  <span className={profit <= 0 ? 'text-green-300' : 'text-red-300'}>
                    {formatCurrency(Math.abs(profit))}
                  </span>
                );
              })()}
            </td>
          </tr>
        </React.Fragment>
      );
    }

    // Get all accounts including children if collapsed
    const accountsToUse = (!isExpanded && hasChildren) ? getAllAccounts(node) : (node.accounts || []);

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
              {node.accounts && node.accounts.length > 0 && node.level !== 'class' && (
                <span className={`text-xs ${node.level === 'class' ? 'opacity-75' : 'opacity-60'}`}>
                  ({node.accounts.length})
                </span>
              )}
            </div>
          </td>

          {/* Entity Columns */}
          {entities.map(entity => {
            // For class level, always show total of all children
            const allClassAccounts = node.level === 'class' ? getAllAccounts(node) : accountsToUse;
            const value = allClassAccounts.length > 0 ? getEntityValue(allClassAccounts, entity.id, className) : 0;
            return (
              <td key={entity.id} className={`py-2 px-4 text-right font-mono text-sm ${node.level === 'class' ? 'text-white' : 'text-[#101828]'}`}>
                {allClassAccounts.length > 0 ? (
                  <button
                    onClick={() => setShowGLDetail({ node, entityId: entity.id, entityName: entity.entity_name, className, accounts: allClassAccounts })}
                    className="hover:underline hover:font-semibold cursor-pointer"
                  >
                    {formatCurrency(Math.abs(value))}
                  </button>
                ) : (
                  <span className={node.level === 'class' ? 'text-slate-300' : 'text-slate-400'}>-</span>
                )}
              </td>
            );
          })}

          {/* Eliminations Column */}
          <td className={`py-2 px-4 text-right font-mono text-sm ${node.level === 'class' ? '' : 'bg-red-50'}`}>
            {(() => {
              const allClassAccounts = node.level === 'class' ? getAllAccounts(node) : accountsToUse;
              const elimValue = getEliminationValue(allClassAccounts, className);
              return allClassAccounts.length > 0 ? (
                <button
                  onClick={() => setShowEliminationDetail(node)}
                  className={`hover:underline font-semibold ${node.level === 'class' ? 'text-white' : 'text-red-800'}`}
                >
                  {formatCurrency(Math.abs(elimValue))}
                </button>
              ) : (
                <span className={node.level === 'class' ? 'text-slate-300' : 'text-slate-400'}>-</span>
              );
            })()}
          </td>

          {/* Adjustments Column */}
          <td className={`py-2 px-4 text-right font-mono text-sm ${node.level === 'class' ? '' : 'bg-blue-50'}`}>
            {(() => {
              const allClassAccounts = node.level === 'class' ? getAllAccounts(node) : accountsToUse;
              const adjValue = getAdjustmentValue(allClassAccounts, className);
              return allClassAccounts.length > 0 ? (
                <button
                  onClick={() => setShowAdjustmentDetail(node)}
                  className={`hover:underline font-semibold ${node.level === 'class' ? 'text-white' : 'text-blue-800'}`}
                >
                  {formatCurrency(Math.abs(adjValue))}
                </button>
              ) : (
                <span className={node.level === 'class' ? 'text-slate-300' : 'text-slate-400'}>-</span>
              );
            })()}
          </td>

          {/* Consolidated Column */}
          <td className={`py-2 px-4 text-right font-mono text-sm font-bold sticky right-0 ${node.level === 'class' ? 'bg-[#101828] text-white' : 'bg-indigo-50 text-indigo-900'}`}>
            {(() => {
              const allClassAccounts = node.level === 'class' ? getAllAccounts(node) : accountsToUse;
              const consolidatedValue = getConsolidatedValue({ ...node, accounts: allClassAccounts });
              return allClassAccounts.length > 0 ? (
                formatCurrency(Math.abs(consolidatedValue))
              ) : (
                <span className={node.level === 'class' ? 'text-slate-300' : 'text-slate-400'}>-</span>
              );
            })()}
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
                  {availablePeriods.length === 0 ? (
                    <option value="">No periods available - Upload TB first</option>
                  ) : (
                    availablePeriods.map(period => (
                      <option key={period.period_code} value={period.period_code}>
                        {period.period_name || period.period_code}
                      </option>
                    ))
                  )}
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
              <button
                onClick={handlePopulate}
                disabled={isPopulating}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPopulating ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Populating...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Populate
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  displayToast('Data ready to sync with Reporting Builder!', 'success');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
              >
                <RefreshCw size={16} />
                Sync to Reports
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

          {/* BS Check Indicator */}
          {coaHierarchy.length > 0 && (
            <div className="mt-4">
              {(() => {
                const bsCheck = calculateBSCheck();
                return (
                  <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    bsCheck.isBalanced
                      ? 'bg-green-50 border-green-400'
                      : 'bg-red-50 border-red-400'
                  }`}>
                    <div className="flex items-center gap-3">
                      {bsCheck.isBalanced ? (
                        <>
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-green-900">Balance Sheet is Balanced</div>
                            <div className="text-sm text-green-700">Assets = Liabilities + Equity + Profit</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <AlertCircle size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-red-900">Balance Sheet is Out of Balance</div>
                            <div className="text-sm text-red-700">
                              Difference: {formatCurrency(Math.abs(bsCheck.difference))}
                              {bsCheck.difference > 0 ? ' (Assets excess)' : ' (Liabilities + Equity + Profit excess)'}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Assets</div>
                        <div className="font-mono font-bold text-gray-900">{formatCurrency(Math.abs(bsCheck.assets))}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Liabilities</div>
                        <div className="font-mono font-bold text-gray-900">{formatCurrency(Math.abs(bsCheck.liabilities))}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Equity</div>
                        <div className="font-mono font-bold text-gray-900">{formatCurrency(Math.abs(bsCheck.equity))}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Profit</div>
                        <div className={`font-mono font-bold ${bsCheck.profit <= 0 ? 'text-green-900' : 'text-red-900'}`}>
                          {formatCurrency(Math.abs(bsCheck.profit))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
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

      {/* Toast Notification */}
      {/* GL Detail Popup */}
      {showGLDetail && (
        <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-50 overflow-y-auto animate-slideLeft">
          <div className="h-full flex flex-col">
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">GL Account Details</h3>
                <p className="text-sm text-gray-300 mt-1">{showGLDetail.node.name} - {showGLDetail.entityName}</p>
              </div>
              <button
                onClick={() => setShowGLDetail(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {getGLDetails(showGLDetail.accounts, showGLDetail.entityId, showGLDetail.className).map((detail, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">{detail.code}</div>
                        <div className="text-sm text-gray-600">{detail.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-lg text-indigo-900">
                          {formatCurrency(Math.abs(detail.amount))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                      <div>
                        <div className="text-xs text-gray-500">Debit</div>
                        <div className="font-mono text-sm text-gray-900">{formatCurrency(Math.abs(detail.debit))}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Credit</div>
                        <div className="font-mono text-sm text-gray-900">{formatCurrency(Math.abs(detail.credit))}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {getGLDetails(showGLDetail.accounts, showGLDetail.entityId, showGLDetail.className).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No GL details found for this selection
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-slideUp">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
            toastType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            <div className="text-sm font-medium">{toastMessage}</div>
          </div>
        </div>
      )}
    </div>
  );
}

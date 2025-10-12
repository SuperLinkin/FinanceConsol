'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';
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
  CheckCircle,
  Edit2,
  FileText,
  BookOpen
} from 'lucide-react';

export default function ConsolidationWorkings() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [comparePeriod, setComparePeriod] = useState(''); // For FY comparison
  const [selectedStatement, setSelectedStatement] = useState('balance_sheet');
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [isPopulating, setIsPopulating] = useState(false);
  const [selectedParentEntity, setSelectedParentEntity] = useState(null); // For chain holding
  const [parentEntities, setParentEntities] = useState([]); // List of parent entities

  // Data states
  const [coaHierarchy, setCoaHierarchy] = useState([]);
  const [masterHierarchy, setMasterHierarchy] = useState([]); // Store master hierarchy with note_number
  const [glAccounts, setGlAccounts] = useState([]);
  const [entities, setEntities] = useState([]);
  const [trialBalances, setTrialBalances] = useState([]);
  const [compareTrialBalances, setCompareTrialBalances] = useState([]); // For comparison period
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
  const [editingNoteNumber, setEditingNoteNumber] = useState(null); // { noteId, currentNumber }
  const [fy2024Expanded, setFy2024Expanded] = useState(false); // Expand/collapse FY2024 details
  const [fy2023Expanded, setFy2023Expanded] = useState(false); // Expand/collapse FY2023 details

  // Statement tabs
  const statementTabs = [
    { id: 'balance_sheet', label: 'Balance Sheet', classes: ['Assets', 'Liability', 'Liabilities', 'Equity'] },
    { id: 'income_statement', label: 'Income Statement', classes: ['Revenue', 'Income', 'Expenses'] }
  ];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedStatement, comparePeriod]);

  const displayToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Load note descriptions from database
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
        // Auto-set compare period to previous year
        if (periodOptions.length > 1) {
          setComparePeriod(periodOptions[1].period_code);
        }
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
        eliminationEntriesResponse,
        coaRes,
        hierarchyRes,
        intercompanyRes,
        adjustmentsRes
      ] = await Promise.all([
        fetch('/api/entities'),
        fetch('/api/elimination-entries'),
        supabase.from('chart_of_accounts').select('*').eq('is_active', true),
        supabase.from('coa_master_hierarchy').select('*').eq('is_active', true),
        supabase.from('intercompany_transactions').select('*').eq('is_eliminated', false),
        supabase.from('adjustment_entries').select('*')
      ]);

      // Parse API responses
      const entitiesData = await entitiesResponse.json();
      const eliminationEntriesData = await eliminationEntriesResponse.json();

      console.log('📝 Elimination entries:', eliminationEntriesData?.length || 0, 'entries loaded from API');
      if (eliminationEntriesData && eliminationEntriesData.length > 0) {
        console.log('Sample elimination entry:', eliminationEntriesData[0]);
        console.log('Sample elimination entry has lines:', eliminationEntriesData[0].lines?.length || 0);
      }

      // Filter trial balances for selected period
      const tbDataForPeriod = allTBData.filter(tb => tb.period === selectedPeriod);

      // Filter trial balances for comparison period if selected
      const tbDataForComparePeriod = comparePeriod ? allTBData.filter(tb => tb.period === comparePeriod) : [];

      console.log('📊 Data loaded:');
      console.log('Entities:', entitiesData?.length);
      console.log('COA:', coaRes.data?.length);
      console.log('Hierarchy:', hierarchyRes.data?.length);
      console.log('Trial Balance for period', selectedPeriod, ':', tbDataForPeriod?.length);
      console.log('Trial Balance for compare period', comparePeriod, ':', tbDataForComparePeriod?.length);

      setEntities(entitiesData || []);
      setGlAccounts(coaRes.data || []);
      setTrialBalances(tbDataForPeriod || []);
      setCompareTrialBalances(tbDataForComparePeriod || []);
      setMasterHierarchy(hierarchyRes.data || []); // Store master hierarchy with note_number

      // Identify parent entities (entities that are parents of other entities)
      const parents = (entitiesData || []).filter(entity =>
        (entitiesData || []).some(e => e.parent_entity_id === entity.id)
      );
      setParentEntities(parents);

      // Auto-select first parent if not already selected
      if (!selectedParentEntity && parents.length > 0) {
        setSelectedParentEntity(parents[0].id);
      }

      // Combine elimination entries and intercompany transactions
      const allEliminations = [
        ...(eliminationEntriesData || []),
        ...(intercompanyRes.data || [])
      ];
      setEliminations(allEliminations);
      setAdjustments(adjustmentsRes.data || []);

      // Assign sequential note numbers across BS and IS
      // Build both hierarchies to get complete note list
      const bsHierarchy = buildCOAHierarchy(hierarchyRes.data || [], coaRes.data || [], 'balance_sheet');
      const isHierarchy = buildCOAHierarchy(hierarchyRes.data || [], coaRes.data || [], 'income_statement');

      console.log('📊 Built BS hierarchy with', bsHierarchy.length, 'top-level nodes');
      console.log('📊 Built IS hierarchy with', isHierarchy.length, 'top-level nodes');

      // Combine and assign sequential numbers (BS first, then IS)
      const combinedForNumbering = [...bsHierarchy, ...isHierarchy];
      assignSequentialNoteNumbers(combinedForNumbering);

      // Now get the hierarchy for the selected statement (which will have the assigned numbers)
      const hierarchy = selectedStatement === 'balance_sheet' ? bsHierarchy : isHierarchy;
      console.log('📊 Setting hierarchy for statement:', selectedStatement);
      console.log('📊 Hierarchy has', hierarchy.length, 'top-level nodes');

      setCoaHierarchy(hierarchy);

    } catch (error) {
      console.error('Error loading data:', error);
      const errorMsg = error?.message || error?.toString() || 'Unknown error occurred';
      displayToast('Error loading data: ' + errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to assign sequential note numbers across Balance Sheet and Income Statement
  const assignSequentialNoteNumbers = (hierarchy) => {
    let noteCounter = 1;
    const noteMapping = new Map(); // Map note IDs to sequential numbers

    console.log('🔢 Starting to assign sequential note numbers...');

    // Helper function to traverse and assign numbers
    const traverseAndAssign = (nodes) => {
      nodes.forEach(node => {
        if (node.level === 'note' && !node.isProfitRow) {
          // Assign sequential number if not already assigned
          if (!noteMapping.has(node.id)) {
            noteMapping.set(node.id, noteCounter);
            node.sequentialNoteRef = noteCounter;
            console.log(`✅ Assigned note number ${noteCounter} to: ${node.name} (ID: ${node.id})`);
            noteCounter++;
          } else {
            node.sequentialNoteRef = noteMapping.get(node.id);
          }
        }

        // Recursively process children
        if (node.children && node.children.length > 0) {
          traverseAndAssign(node.children);
        }
      });
    };

    traverseAndAssign(hierarchy);
    console.log(`🔢 Finished assigning note numbers. Total notes: ${noteCounter - 1}`);
    return hierarchy;
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
          // Get note number from master hierarchy
          const noteHierarchyRecord = masterHierarchy.find(h =>
            h.class_name === className &&
            h.subclass_name === subclassName &&
            h.note_name === noteName
          );
          const noteNumber = noteHierarchyRecord?.note_number || null;

          const noteNode = {
            id: `note-${className}-${subclassName}-${noteName}`,
            level: 'note',
            name: noteName,
            className: className,
            subclassName: subclassName,
            noteNumber: noteNumber,
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

  // Build note-based hierarchy grouped by note numbers
  const buildNoteHierarchy = (masterHierarchyData, coa) => {
    console.log('📓 Building note-based hierarchy...');

    const noteGroups = {};

    // Group notes by note_number
    masterHierarchyData.forEach(h => {
      if (!h || !h.note_name) return;

      const noteNumber = h.note_number || 'Unnumbered';
      const noteName = h.note_name;
      const className = h.class_name;
      const subclassName = h.subclass_name;

      if (!noteGroups[noteNumber]) {
        noteGroups[noteNumber] = {
          noteNumber: noteNumber,
          notes: []
        };
      }

      // Check if this specific note already exists in the group
      let existingNote = noteGroups[noteNumber].notes.find(n =>
        n.name === noteName && n.className === className && n.subclassName === subclassName
      );

      if (!existingNote) {
        existingNote = {
          id: `note-${noteNumber}-${className}-${subclassName}-${noteName}`,
          level: 'note',
          name: noteName,
          className: className,
          subclassName: subclassName,
          noteNumber: noteNumber,
          masterHierarchyIds: [], // Store all master hierarchy IDs for this note
          children: []
        };
        noteGroups[noteNumber].notes.push(existingNote);
      }

      // Store the master hierarchy ID
      existingNote.masterHierarchyIds.push(h.id);

      // Get subnotes for this note
      if (h.subnote_name) {
        let existingSubnote = existingNote.children.find(sn => sn.name === h.subnote_name);

        if (!existingSubnote) {
          existingSubnote = {
            id: `subnote-${noteNumber}-${className}-${subclassName}-${noteName}-${h.subnote_name}`,
            level: 'subnote',
            name: h.subnote_name,
            className: className,
            subclassName: subclassName,
            noteName: noteName,
            noteNumber: noteNumber,
            accounts: coa.filter(
              account =>
                account &&
                account.class_name === className &&
                account.subclass_name === subclassName &&
                account.note_name === noteName &&
                account.subnote_name === h.subnote_name
            )
          };
          existingNote.children.push(existingSubnote);
        }
      } else {
        // If no subnote, attach accounts directly to note
        if (!existingNote.accounts) {
          existingNote.accounts = [];
        }
        const noteAccounts = coa.filter(
          account =>
            account &&
            account.class_name === className &&
            account.subclass_name === subclassName &&
            account.note_name === noteName &&
            !account.subnote_name // Only accounts without subnote
        );
        existingNote.accounts = [...existingNote.accounts, ...noteAccounts];
      }
    });

    // Convert to array and sort by note number
    const hierarchy = Object.keys(noteGroups).sort((a, b) => {
      if (a === 'Unnumbered') return 1;
      if (b === 'Unnumbered') return -1;
      return parseInt(a) - parseInt(b);
    }).map(noteNumber => ({
      id: `note-group-${noteNumber}`,
      level: 'note_group',
      name: noteNumber === 'Unnumbered' ? 'Unnumbered Notes' : `Note ${noteNumber}`,
      noteNumber: noteNumber,
      isExpanded: true,
      children: noteGroups[noteNumber].notes
    }));

    console.log('✅ Note hierarchy built with', hierarchy.length, 'note groups');
    return hierarchy;
  };

  const getEntityValue = (accounts, entityId, className, useComparePeriod = false) => {
    if (!accounts || accounts.length === 0) return 0;

    const tbData = useComparePeriod ? compareTrialBalances : trialBalances;
    let total = 0;
    let foundEntries = 0;

    accounts.forEach(account => {
      const tbEntries = tbData.filter(
        tb => tb.account_code === account.account_code && tb.entity_id === entityId
      );

      if (tbEntries.length > 0) {
        foundEntries += tbEntries.length;
      }

      tbEntries.forEach(tb => {
        const debit = parseFloat(tb.debit || 0);
        const credit = parseFloat(tb.credit || 0);

        // For Assets and Expenses: debit - credit (natural debit balance)
        // For Liabilities, Equity, Revenue, Income, Intercompany: credit - debit (natural credit balance)
        // This ensures all values are naturally positive for their balance type
        let netAmount;
        if (['Assets', 'Expenses'].includes(className)) {
          netAmount = debit - credit;
        } else {
          netAmount = credit - debit;
        }
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
      // Check elimination journal entries - these have 'lines' array with gl_code, debit, credit
      const entriesWithMatchingLines = eliminations.filter(e =>
        e.lines && Array.isArray(e.lines) &&
        e.lines.some(line => line.gl_code === account.account_code)
      );

      if (entriesWithMatchingLines.length > 0) {
        foundElims += entriesWithMatchingLines.length;
        if (typeof window !== 'undefined' && foundElims <= 3) {
          console.log(`Found ${entriesWithMatchingLines.length} elimination entries for account ${account.account_code}:`, entriesWithMatchingLines);
        }
      }

      entriesWithMatchingLines.forEach(entry => {
        // Process all lines in this entry that match the account
        const matchingLines = entry.lines.filter(line => line.gl_code === account.account_code);

        matchingLines.forEach(line => {
          const debitAmount = parseFloat(line.debit || 0);
          const creditAmount = parseFloat(line.credit || 0);

          // Elimination entries follow same debit/credit logic as TB
          // - Crediting an asset (debit balance) reduces it: Dr - Cr = negative
          // - Debiting a liability (credit balance) reduces it: Cr - Dr = negative
          // We ADD the elimination value (which will be negative for reductions)
          let netElim;
          if (['Assets', 'Expenses'].includes(className)) {
            netElim = debitAmount - creditAmount; // Same as entity value
          } else {
            netElim = creditAmount - debitAmount; // Same as entity value
          }
          total += netElim; // Add the elimination (negative values reduce totals)
        });
      });

      // Check intercompany_transactions (GL-to-GL mappings) - old format
      const icEntries = eliminations.filter(e =>
        (e.from_account === account.account_code || e.to_account === account.account_code) &&
        e.transaction_type === 'Elimination Mapping'
      );

      icEntries.forEach(ic => {
        const amount = parseFloat(ic.amount || 0);
        // For elimination mappings, we subtract the amount (it's being eliminated)
        total -= amount;
      });
    });

    if (foundElims > 0 && typeof window !== 'undefined') {
      console.log(`Total elimination value for class ${className}:`, total);
    }

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

        // Use same logic as getEntityValue: use natural balance direction
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

  const getConsolidatedValue = (node, useComparePeriod = false) => {
    const className = node.className || node.name;
    let total = 0;

    // Get accounts for this node
    const accounts = node.accounts || [];

    // Sum all entity values
    entities.forEach(entity => {
      total += getEntityValue(accounts, entity.id, className, useComparePeriod);
    });

    // Add eliminations and adjustments (note: these don't change by period for now)
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
  const getGLDetails = (accounts, entityId, className, useComparePeriod = false) => {
    const details = [];
    const tbData = useComparePeriod ? compareTrialBalances : trialBalances;

    accounts.forEach(account => {
      const tbEntries = tbData.filter(
        tb => tb.account_code === account.account_code && tb.entity_id === entityId
      );

      tbEntries.forEach(tb => {
        const debit = parseFloat(tb.debit || 0);
        const credit = parseFloat(tb.credit || 0);

        // Use same logic as getEntityValue: use natural balance direction
        let amount;
        if (['Assets', 'Expenses'].includes(className)) {
          amount = debit - credit;
        } else {
          amount = credit - debit;
        }

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

      // Skip profit row
      if (classNode.isProfitRow) return;

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

    // ALWAYS calculate profit from ALL Revenue/Expenses accounts, regardless of current tab
    // This ensures profit is correct even when viewing Balance Sheet tab
    const revenueAccounts = glAccounts.filter(acc =>
      acc && acc.is_active && ['Revenue', 'Income'].includes(acc.class_name)
    );
    const expenseAccounts = glAccounts.filter(acc =>
      acc && acc.is_active && acc.class_name === 'Expenses'
    );

    // Calculate revenue from all entities
    let totalRevenue = 0;
    entities.forEach(entity => {
      totalRevenue += getEntityValue(revenueAccounts, entity.id, 'Revenue');
    });
    totalRevenue += getEliminationValue(revenueAccounts, 'Revenue');
    totalRevenue += getAdjustmentValue(revenueAccounts, 'Revenue');

    // Calculate expenses from all entities
    let totalExpenses = 0;
    entities.forEach(entity => {
      totalExpenses += getEntityValue(expenseAccounts, entity.id, 'Expenses');
    });
    totalExpenses += getEliminationValue(expenseAccounts, 'Expenses');
    totalExpenses += getAdjustmentValue(expenseAccounts, 'Expenses');

    // Profit = Revenue - Expenses (all values are now naturally positive)
    totals.profit = totalRevenue - totalExpenses;

    return totals;
  };

  // Calculate BS Check: Assets = Liabilities + Equity + Profit
  // All values are naturally positive due to using correct debit/credit logic
  const calculateBSCheck = () => {
    const totals = calculateClassTotals();

    // BS Check formula: Assets - Liabilities - Equity - Profit = 0
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

    // Special handling for Note Group (Notes to Accounts tab)
    if (node.level === 'note_group') {
      return (
        <React.Fragment key={node.id}>
          <tr className="border-b border-slate-200 bg-slate-100 text-[#101828] font-bold text-sm">
            <td className="py-3 px-4 sticky left-0 bg-slate-100 z-10" style={{ paddingLeft: `${paddingLeft + 16}px` }}>
              <div className="flex items-center gap-2">
                {hasChildren && (
                  <button
                    onClick={() => toggleRow(node.id)}
                    className="rounded p-1 hover:bg-slate-200 text-[#101828]"
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                )}
                {!hasChildren && <div className="w-6"></div>}
                <span className="font-semibold text-base">{node.name}</span>
              </div>
            </td>

            {/* Note Ref column */}
            <td className="py-3 px-4 text-center text-gray-400 bg-slate-100">-</td>

            {/* FY 2024 columns */}
            {!fy2024Expanded ? (
              <td className="py-3 px-4 text-right text-gray-400">-</td>
            ) : (
              <>
                {entities.map(entity => (
                  <td key={`fy24-${entity.id}`} className="py-3 px-4 text-right text-gray-400">-</td>
                ))}
                <td className="py-3 px-4 text-right text-gray-400">-</td>
                <td className="py-3 px-4 text-right text-gray-400">-</td>
                <td className="py-3 px-4 text-right text-gray-400">-</td>
              </>
            )}

            {/* FY 2023 columns if comparePeriod exists */}
            {comparePeriod && (
              !fy2023Expanded ? (
                <td className="py-3 px-4 text-right text-gray-400 sticky right-0 bg-slate-100">-</td>
              ) : (
                <>
                  {entities.map(entity => (
                    <td key={`fy23-${entity.id}`} className="py-3 px-4 text-right text-gray-400 bg-gray-50">-</td>
                  ))}
                  <td className="py-3 px-4 text-right text-gray-400 bg-gray-50">-</td>
                  <td className="py-3 px-4 text-right text-gray-400 bg-gray-50">-</td>
                  <td className="py-3 px-4 text-right text-gray-400 sticky right-0 bg-slate-100">-</td>
                </>
              )
            )}
          </tr>
          {/* Render children (notes) if expanded */}
          {isExpanded && hasChildren && node.children.map((child, index) => renderRow(child, depth + 1))}
        </React.Fragment>
      );
    }

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

            {/* Note Ref column */}
            <td className="py-2 px-4 text-center text-gray-400 bg-[#101828]">-</td>

            {/* FY 2024 Profit/Loss */}
            {!fy2024Expanded ? (
              <td className="py-2 px-4 text-right font-mono text-sm font-bold">
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
            ) : (
              <>
                {/* Entity columns for FY 2024 */}
                {entities.map(entity => {
                  // Calculate revenue for this entity
                  let revenue = 0;
                  revenueAccounts.forEach(acc => {
                    const tbEntries = trialBalances.filter(tb =>
                      tb.account_code === acc.account_code && tb.entity_id === entity.id
                    );
                    tbEntries.forEach(tb => {
                      const debit = parseFloat(tb.debit || 0);
                      const credit = parseFloat(tb.credit || 0);
                      const value = debit - credit;
                      revenue += value;
                    });
                  });

                  // Calculate expenses for this entity
                  let expenses = 0;
                  expenseAccounts.forEach(acc => {
                    const tbEntries = trialBalances.filter(tb =>
                      tb.account_code === acc.account_code && tb.entity_id === entity.id
                    );
                    tbEntries.forEach(tb => {
                      const debit = parseFloat(tb.debit || 0);
                      const credit = parseFloat(tb.credit || 0);
                      const value = debit - credit;
                      expenses += value;
                    });
                  });

                  const entityProfit = revenue - expenses;

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
                    const netElim = revElim - expElim;
                    return formatCurrency(Math.abs(netElim));
                  })()}
                </td>

                {/* Adjustments column */}
                <td className="py-2 px-4 text-right font-mono text-sm text-white">
                  {(() => {
                    const revAdj = getAdjustmentValue(revenueAccounts, 'Revenue');
                    const expAdj = getAdjustmentValue(expenseAccounts, 'Expenses');
                    const netAdj = revAdj - expAdj;
                    return formatCurrency(Math.abs(netAdj));
                  })()}
                </td>

                {/* Consolidated column for FY 2024 */}
                <td className="py-2 px-4 text-right font-mono text-sm font-bold">
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
              </>
            )}

            {/* FY 2023 Profit/Loss if comparePeriod exists */}
            {comparePeriod && (
              !fy2023Expanded ? (
                <td className="py-2 px-4 text-right font-mono text-sm font-bold sticky right-0 bg-[#101828]">
                  {(() => {
                    // Calculate FY2023 profit from compare trial balances
                    let totalRev = 0;
                    let totalExp = 0;

                    entities.forEach(entity => {
                      revenueAccounts.forEach(acc => {
                        const tbEntries = compareTrialBalances.filter(tb =>
                          tb.account_code === acc.account_code && tb.entity_id === entity.id
                        );
                        tbEntries.forEach(tb => {
                          // Revenue has natural credit balance: credit - debit
                          totalRev += parseFloat(tb.credit || 0) - parseFloat(tb.debit || 0);
                        });
                      });

                      expenseAccounts.forEach(acc => {
                        const tbEntries = compareTrialBalances.filter(tb =>
                          tb.account_code === acc.account_code && tb.entity_id === entity.id
                        );
                        tbEntries.forEach(tb => {
                          // Expenses have natural debit balance: debit - credit
                          totalExp += parseFloat(tb.debit || 0) - parseFloat(tb.credit || 0);
                        });
                      });
                    });

                    const profit = totalRev - totalExp;
                    return (
                      <span className={profit <= 0 ? 'text-green-300' : 'text-red-300'}>
                        {formatCurrency(Math.abs(profit))}
                      </span>
                    );
                  })()}
                </td>
              ) : (
                <>
                  {/* Entity columns for FY 2023 */}
                  {entities.map(entity => {
                    let revenue = 0;
                    revenueAccounts.forEach(acc => {
                      const tbEntries = compareTrialBalances.filter(tb =>
                        tb.account_code === acc.account_code && tb.entity_id === entity.id
                      );
                      tbEntries.forEach(tb => {
                        // Revenue has natural credit balance: credit - debit
                        revenue += parseFloat(tb.credit || 0) - parseFloat(tb.debit || 0);
                      });
                    });

                    let expenses = 0;
                    expenseAccounts.forEach(acc => {
                      const tbEntries = compareTrialBalances.filter(tb =>
                        tb.account_code === acc.account_code && tb.entity_id === entity.id
                      );
                      tbEntries.forEach(tb => {
                        // Expenses have natural debit balance: debit - credit
                        expenses += parseFloat(tb.debit || 0) - parseFloat(tb.credit || 0);
                      });
                    });

                    const entityProfit = revenue - expenses;

                    return (
                      <td key={`fy23-${entity.id}`} className={`py-2 px-4 text-right font-mono text-sm bg-slate-800 ${entityProfit <= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {formatCurrency(Math.abs(entityProfit))}
                      </td>
                    );
                  })}

                  {/* Eliminations column for FY 2023 */}
                  <td className="py-2 px-4 text-right font-mono text-sm text-white bg-slate-800">
                    {(() => {
                      const revElim = getEliminationValue(revenueAccounts, 'Revenue');
                      const expElim = getEliminationValue(expenseAccounts, 'Expenses');
                      const netElim = revElim - expElim;
                      return formatCurrency(Math.abs(netElim));
                    })()}
                  </td>

                  {/* Adjustments column for FY 2023 */}
                  <td className="py-2 px-4 text-right font-mono text-sm text-white bg-slate-800">
                    {(() => {
                      const revAdj = getAdjustmentValue(revenueAccounts, 'Revenue');
                      const expAdj = getAdjustmentValue(expenseAccounts, 'Expenses');
                      const netAdj = revAdj - expAdj;
                      return formatCurrency(Math.abs(netAdj));
                    })()}
                  </td>

                  {/* Consolidated column for FY 2023 */}
                  <td className="py-2 px-4 text-right font-mono text-sm font-bold sticky right-0 bg-[#101828]">
                    {(() => {
                      let totalRev = 0;
                      let totalExp = 0;

                      entities.forEach(entity => {
                        revenueAccounts.forEach(acc => {
                          const tbEntries = compareTrialBalances.filter(tb =>
                            tb.account_code === acc.account_code && tb.entity_id === entity.id
                          );
                          tbEntries.forEach(tb => {
                            // Revenue has natural credit balance: credit - debit
                            totalRev += parseFloat(tb.credit || 0) - parseFloat(tb.debit || 0);
                          });
                        });

                        expenseAccounts.forEach(acc => {
                          const tbEntries = compareTrialBalances.filter(tb =>
                            tb.account_code === acc.account_code && tb.entity_id === entity.id
                          );
                          tbEntries.forEach(tb => {
                            // Expenses have natural debit balance: debit - credit
                            totalExp += parseFloat(tb.debit || 0) - parseFloat(tb.credit || 0);
                          });
                        });
                      });

                      const profit = totalRev - totalExp;
                      return (
                        <span className={profit <= 0 ? 'text-green-300' : 'text-red-300'}>
                          {formatCurrency(Math.abs(profit))}
                        </span>
                      );
                    })()}
                  </td>
                </>
              )
            )}
          </tr>
        </React.Fragment>
      );
    }

    // Get all accounts including children if collapsed
    const accountsToUse = (!isExpanded && hasChildren) ? getAllAccounts(node) : (node.accounts || []);

    // Simplified styles with clear text visibility
    const rowStyles = {
      class: 'bg-[#101828] text-white font-bold text-sm',
      subclass: 'bg-slate-50 font-semibold text-sm text-[#101828]',
      note: 'bg-white text-sm text-[#101828]',
      subnote: 'bg-gray-50 text-xs text-[#101828]',
      note_group: 'bg-slate-100 font-bold text-sm text-[#101828]'
    };

    // Get specific background color for sticky cell
    const stickyBgColors = {
      class: 'bg-[#101828]',
      subclass: 'bg-slate-50',
      note: 'bg-white',
      subnote: 'bg-gray-50',
      note_group: 'bg-slate-100'
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

              {/* Show note number badge if available (all tabs) */}
              {node.level === 'note' && node.noteNumber && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                  {node.noteNumber}
                </span>
              )}

              <span className="font-medium">{node.name}</span>

              {node.accounts && node.accounts.length > 0 && node.level !== 'class' && (
                <span className={`text-xs ${node.level === 'class' ? 'opacity-75' : 'opacity-60'}`}>
                  ({node.accounts.length})
                </span>
              )}

              {/* Edit button for note numbers (Notes to Accounts tab only) */}
              {node.level === 'note' && selectedStatement === 'notes_to_accounts' && (
                <button
                  onClick={() => setEditingNoteNumber({ noteNode: node, currentNumber: node.noteNumber })}
                  className="ml-auto p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                  title="Edit note number"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>
          </td>

          {/* Note Ref Column */}
          <td className={`py-2 px-4 text-center ${stickyBgColors[node.level]}`}>
            {node.level === 'note' && node.sequentialNoteRef ? (
              <span className="inline-flex items-center justify-center px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                {node.sequentialNoteRef}
              </span>
            ) : (
              <span className={node.level === 'class' ? 'text-gray-400' : 'text-gray-400'}>-</span>
            )}
          </td>

          {/* FY 2024 Columns */}
          {!fy2024Expanded ? (
            // Collapsed FY 2024 - Show only consolidated value
            <td className={`py-2 px-4 text-right font-mono text-sm font-bold ${node.level === 'class' ? 'text-white' : 'bg-blue-50 text-[#101828]'}`}>
              {(() => {
                const allClassAccounts = node.level === 'class' ? getAllAccounts(node) : accountsToUse;
                const consolidatedValue = getConsolidatedValue({ ...node, accounts: allClassAccounts }, false);
                return allClassAccounts.length > 0 ? (
                  formatCurrency(Math.abs(consolidatedValue))
                ) : (
                  <span className={node.level === 'class' ? 'text-gray-400' : 'text-gray-400'}>-</span>
                );
              })()}
            </td>
          ) : (
            // Expanded FY 2024 - Show entity, elim, adj, and consolidated columns
            <>
              {/* Entity columns for FY 2024 */}
              {entities.map(entity => {
                const allClassAccounts = node.level === 'class' ? getAllAccounts(node) : accountsToUse;
                const value = allClassAccounts.length > 0 ? getEntityValue(allClassAccounts, entity.id, className, false) : 0;

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
                      <span className={node.level === 'class' ? 'text-gray-400' : 'text-gray-400'}>-</span>
                    )}
                  </td>
                );
              })}

              {/* Eliminations column for FY 2024 */}
              <td className={`py-2 px-4 text-right font-mono text-sm ${node.level === 'class' ? '' : 'bg-orange-50'}`}>
                {(() => {
                  const allClassAccounts = node.level === 'class' ? getAllAccounts(node) : accountsToUse;
                  const elimValue = getEliminationValue(allClassAccounts, className);
                  return allClassAccounts.length > 0 ? (
                    <button
                      onClick={() => setShowEliminationDetail(node)}
                      className={`hover:underline font-semibold ${node.level === 'class' ? 'text-white' : 'text-[#101828]'}`}
                    >
                      {formatCurrency(Math.abs(elimValue))}
                    </button>
                  ) : (
                    <span className={node.level === 'class' ? 'text-gray-400' : 'text-gray-400'}>-</span>
                  );
                })()}
              </td>

              {/* Adjustments column for FY 2024 */}
              <td className={`py-2 px-4 text-right font-mono text-sm ${node.level === 'class' ? '' : 'bg-green-50'}`}>
                {(() => {
                  const allClassAccounts = node.level === 'class' ? getAllAccounts(node) : accountsToUse;
                  const adjValue = getAdjustmentValue(allClassAccounts, className);
                  return allClassAccounts.length > 0 ? (
                    <button
                      onClick={() => setShowAdjustmentDetail(node)}
                      className={`hover:underline font-semibold ${node.level === 'class' ? 'text-white' : 'text-[#101828]'}`}
                    >
                      {formatCurrency(Math.abs(adjValue))}
                    </button>
                  ) : (
                    <span className={node.level === 'class' ? 'text-gray-400' : 'text-gray-400'}>-</span>
                  );
                })()}
              </td>

              {/* Consolidated column for FY 2024 */}
              <td className={`py-2 px-4 text-right font-mono text-sm font-bold ${node.level === 'class' ? 'text-white' : 'bg-blue-50 text-[#101828]'}`}>
                {(() => {
                  const allClassAccounts = node.level === 'class' ? getAllAccounts(node) : accountsToUse;
                  const consolidatedValue = getConsolidatedValue({ ...node, accounts: allClassAccounts }, false);
                  return allClassAccounts.length > 0 ? (
                    formatCurrency(Math.abs(consolidatedValue))
                  ) : (
                    <span className={node.level === 'class' ? 'text-gray-400' : 'text-gray-400'}>-</span>
                  );
                })()}
              </td>
            </>
          )}

          {/* FY 2023 Columns if comparePeriod exists */}
          {comparePeriod && (
            !fy2023Expanded ? (
              // Collapsed FY 2023 - Show only consolidated value
              <td className={`py-2 px-4 text-right font-mono text-sm font-bold sticky right-0 ${node.level === 'class' ? 'bg-[#101828] text-white' : 'bg-gray-50 text-[#101828]'}`}>
                {(() => {
                  const allClassAccounts = node.level === 'class' ? getAllAccounts(node) : accountsToUse;
                  const consolidatedValue = getConsolidatedValue({ ...node, accounts: allClassAccounts }, true);
                  return allClassAccounts.length > 0 ? formatCurrency(Math.abs(consolidatedValue)) : '-';
                })()}
              </td>
            ) : (
              // Expanded FY 2023 - Show entity, elim, adj, and consolidated columns
              <>
                {/* Entity columns for FY 2023 */}
                {entities.map(entity => {
                  const allClassAccounts = node.level === 'class' ? getAllAccounts(node) : accountsToUse;
                  const compareValue = allClassAccounts.length > 0 ? getEntityValue(allClassAccounts, entity.id, className, true) : 0;

                  return (
                    <td key={`fy23-${entity.id}`} className={`py-2 px-4 text-right font-mono text-sm ${node.level === 'class' ? 'text-gray-300 bg-slate-800' : 'text-[#101828] bg-gray-50'}`}>
                      {allClassAccounts.length > 0 ? (
                        <button
                          onClick={() => setShowGLDetail({ node, entityId: entity.id, entityName: entity.entity_name, className, accounts: allClassAccounts, useComparePeriod: true })}
                          className="hover:underline hover:font-semibold cursor-pointer"
                        >
                          {formatCurrency(Math.abs(compareValue))}
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                  );
                })}

                {/* Eliminations column for FY 2023 */}
                <td className={`py-2 px-4 text-right font-mono text-sm ${node.level === 'class' ? 'text-gray-300 bg-slate-800' : 'text-[#101828] bg-gray-50'}`}>
                  {(() => {
                    const allClassAccounts = node.level === 'class' ? getAllAccounts(node) : accountsToUse;
                    const elimValue = getEliminationValue(allClassAccounts, className);
                    return allClassAccounts.length > 0 ? formatCurrency(Math.abs(elimValue)) : '-';
                  })()}
                </td>

                {/* Adjustments column for FY 2023 */}
                <td className={`py-2 px-4 text-right font-mono text-sm ${node.level === 'class' ? 'text-gray-300 bg-slate-800' : 'text-[#101828] bg-gray-50'}`}>
                  {(() => {
                    const allClassAccounts = node.level === 'class' ? getAllAccounts(node) : accountsToUse;
                    const adjValue = getAdjustmentValue(allClassAccounts, className);
                    return allClassAccounts.length > 0 ? formatCurrency(Math.abs(adjValue)) : '-';
                  })()}
                </td>

                {/* Consolidated column for FY 2023 */}
                <td className={`py-2 px-4 text-right font-mono text-sm font-bold sticky right-0 ${node.level === 'class' ? 'bg-[#101828] text-white' : 'bg-gray-50 text-[#101828]'}`}>
                  {(() => {
                    const allClassAccounts = node.level === 'class' ? getAllAccounts(node) : accountsToUse;
                    const consolidatedValue = getConsolidatedValue({ ...node, accounts: allClassAccounts }, true);
                    return allClassAccounts.length > 0 ? formatCurrency(Math.abs(consolidatedValue)) : '-';
                  })()}
                </td>
              </>
            )
          )}
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
                  onChange={(e) => {
                    setSelectedPeriod(e.target.value);
                    // Auto-set comparison period
                    const currentIndex = availablePeriods.findIndex(p => p.period_code === e.target.value);
                    if (currentIndex !== -1 && availablePeriods.length > currentIndex + 1) {
                      setComparePeriod(availablePeriods[currentIndex + 1].period_code);
                    }
                  }}
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

              {/* Compare Period Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Compare with:</label>
                <select
                  value={comparePeriod}
                  onChange={(e) => setComparePeriod(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No comparison</option>
                  {availablePeriods.map(period => (
                    <option key={period.period_code} value={period.period_code}>
                      {period.period_name || period.period_code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Parent Entity Selector (Chain Holding) */}
              {parentEntities.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Parent Entity:</label>
                  <select
                    value={selectedParentEntity || ''}
                    onChange={(e) => setSelectedParentEntity(e.target.value || null)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Entities</option>
                    {parentEntities.map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.entity_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <RefreshCw size={16} />
                Sync to Reports
              </button>
              <Link
                href="/note-builder"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
              >
                <BookOpen size={16} />
                Note Builder
              </Link>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700">
                <Save size={16} />
                Save
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#101828] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b]">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Statement Tabs */}
          <div className="flex items-center gap-2 mb-4">
            {statementTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatement(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedStatement === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* BS Check Indicator */}
          {coaHierarchy.length > 0 && selectedStatement === 'balance_sheet' && (
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
                    {/* COA Column - Always visible, sticky left */}
                    <th className="py-3 px-4 text-left font-semibold text-xs uppercase sticky left-0 bg-[#101828] z-30 min-w-[300px]">
                      Chart of Accounts
                    </th>

                    {/* Note Ref Column */}
                    <th className="py-3 px-4 text-center font-semibold text-xs uppercase bg-[#101828] min-w-[80px]">
                      Note Ref
                    </th>

                    {/* FY 2024 Column(s) - Collapsed or Expanded */}
                    {!fy2024Expanded ? (
                      <th className="py-3 px-4 text-right font-semibold text-xs uppercase min-w-[160px] bg-blue-700">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setFy2024Expanded(true)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Expand FY 2024 details"
                          >
                            <ChevronRight size={16} />
                          </button>
                          <span>{selectedPeriod || 'FY 2024'}</span>
                        </div>
                      </th>
                    ) : (
                      <>
                        {/* Expanded FY 2024 - Show all entity columns */}
                        {entities.map(entity => (
                          <th key={`fy24-${entity.id}`} className="py-3 px-4 text-right font-semibold text-xs uppercase min-w-[140px]">
                            <div className="text-xs opacity-75 font-normal">{entity.entity_name}</div>
                          </th>
                        ))}
                        <th className="py-3 px-4 text-right font-semibold text-xs uppercase min-w-[140px] bg-orange-700">
                          <div className="flex items-center justify-end gap-1">
                            <Minus size={14} />
                            Elim.
                          </div>
                        </th>
                        <th className="py-3 px-4 text-right font-semibold text-xs uppercase min-w-[140px] bg-green-700">
                          <div className="flex items-center justify-end gap-1">
                            <Plus size={14} />
                            Adj.
                          </div>
                        </th>
                        <th className="py-3 px-4 text-right font-semibold text-xs uppercase min-w-[160px] bg-blue-700">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setFy2024Expanded(false)}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                              title="Collapse FY 2024 details"
                            >
                              <ChevronDown size={16} />
                            </button>
                            <Calculator size={14} />
                            <span>{selectedPeriod || 'FY 2024'}</span>
                          </div>
                        </th>
                      </>
                    )}

                    {/* FY 2023 Column(s) - Collapsed or Expanded - Only show if compare period selected */}
                    {comparePeriod && (
                      !fy2023Expanded ? (
                        <th className="py-3 px-4 text-right font-semibold text-xs uppercase min-w-[160px] bg-blue-600 sticky right-0 z-30">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setFy2023Expanded(true)}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                              title="Expand FY 2023 details"
                            >
                              <ChevronRight size={16} />
                            </button>
                            <span>{comparePeriod || 'FY 2023'}</span>
                          </div>
                        </th>
                      ) : (
                        <>
                          {/* Expanded FY 2023 - Show all entity columns */}
                          {entities.map(entity => (
                            <th key={`fy23-${entity.id}`} className="py-3 px-4 text-right font-semibold text-xs uppercase min-w-[140px] bg-slate-700">
                              <div className="text-xs opacity-75 font-normal">{entity.entity_name}</div>
                            </th>
                          ))}
                          <th className="py-3 px-4 text-right font-semibold text-xs uppercase min-w-[140px] bg-orange-600">
                            <div className="flex items-center justify-end gap-1">
                              <Minus size={14} />
                              Elim.
                            </div>
                          </th>
                          <th className="py-3 px-4 text-right font-semibold text-xs uppercase min-w-[140px] bg-green-600">
                            <div className="flex items-center justify-end gap-1">
                              <Plus size={14} />
                              Adj.
                            </div>
                          </th>
                          <th className="py-3 px-4 text-right font-semibold text-xs uppercase min-w-[160px] bg-blue-600 sticky right-0 z-30">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setFy2023Expanded(false)}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                title="Collapse FY 2023 details"
                              >
                                <ChevronDown size={16} />
                              </button>
                              <Calculator size={14} />
                              <span>{comparePeriod || 'FY 2023'}</span>
                            </div>
                          </th>
                        </>
                      )
                    )}
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

      {/* Elimination Detail Sidepanel */}
      {showEliminationDetail && (
        <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-50 overflow-y-auto animate-slideLeft">
          <div className="h-full flex flex-col">
            <div className="bg-orange-700 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Elimination Entries</h3>
                <p className="text-sm text-orange-100 mt-1">{showEliminationDetail.name}</p>
              </div>
              <button
                onClick={() => setShowEliminationDetail(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {(() => {
                  const allAccounts = showEliminationDetail.level === 'class' ? getAllAccounts(showEliminationDetail) : (showEliminationDetail.accounts || []);
                  const className = showEliminationDetail.className || showEliminationDetail.name;
                  const elimDetails = [];

                  allAccounts.forEach(account => {
                    // Get elimination journal entries for this account
                    const entriesWithMatchingLines = eliminations.filter(e =>
                      e.lines && Array.isArray(e.lines) &&
                      e.lines.some(line => line.gl_code === account.account_code)
                    );

                    entriesWithMatchingLines.forEach(entry => {
                      const matchingLines = entry.lines.filter(line => line.gl_code === account.account_code);

                      matchingLines.forEach(line => {
                        const debitAmount = parseFloat(line.debit || 0);
                        const creditAmount = parseFloat(line.credit || 0);

                        // Calculate net elimination effect (same as entity value logic)
                        let netElim;
                        if (['Assets', 'Expenses'].includes(className)) {
                          netElim = debitAmount - creditAmount;
                        } else {
                          netElim = creditAmount - debitAmount;
                        }

                        if (netElim !== 0) {
                          elimDetails.push({
                            entryName: entry.entry_name || 'Elimination Entry',
                            code: account.account_code,
                            name: account.account_name,
                            debit: debitAmount,
                            credit: creditAmount,
                            amount: netElim,
                            entryDate: entry.entry_date,
                            description: entry.description
                          });
                        }
                      });
                    });
                  });

                  return elimDetails.length > 0 ? (
                    elimDetails.map((detail, index) => (
                      <div key={index} className="border border-orange-200 rounded-lg p-4 hover:bg-orange-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">{detail.code}</div>
                            <div className="text-sm text-gray-600">{detail.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{detail.entryName}</div>
                            {detail.description && (
                              <div className="text-xs text-gray-500 mt-1">{detail.description}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-lg text-[#101828]">
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
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No elimination entries found for this selection
                    </div>
                  );
                })()}
              </div>
            </div>
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
            <div className="bg-[#101828] text-white px-8 py-6 flex items-center justify-between">
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
                {getGLDetails(showGLDetail.accounts, showGLDetail.entityId, showGLDetail.className, showGLDetail.useComparePeriod || false).map((detail, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">{detail.code}</div>
                        <div className="text-sm text-gray-600">{detail.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-lg text-[#101828]">
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
                {getGLDetails(showGLDetail.accounts, showGLDetail.entityId, showGLDetail.className, showGLDetail.useComparePeriod || false).length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No GL details found for this selection
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Number Modal */}
      {editingNoteNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#101828]">Edit Note Number</h3>
              <button
                onClick={() => setEditingNoteNumber(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Note: {editingNoteNumber.noteNode.name}
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Class: {editingNoteNumber.noteNode.className} | Subclass: {editingNoteNumber.noteNode.subclassName}
              </p>
              <input
                type="number"
                min="1"
                max="999"
                defaultValue={editingNoteNumber.currentNumber === 'Unnumbered' ? '' : editingNoteNumber.currentNumber}
                placeholder="Enter note number (e.g., 1, 2, 3...)"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                id="note-number-input"
              />
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setEditingNoteNumber(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const input = document.getElementById('note-number-input');
                  const newNoteNumber = input.value ? parseInt(input.value) : null;

                  if (!newNoteNumber || newNoteNumber < 1 || newNoteNumber > 999) {
                    displayToast('Please enter a valid note number between 1 and 999', 'error');
                    return;
                  }

                  try {
                    // Update all master hierarchy IDs for this note
                    const { noteNode } = editingNoteNumber;
                    console.log('Updating note number for:', noteNode.name, 'IDs:', noteNode.masterHierarchyIds);

                    // Update each master hierarchy record
                    for (const hierarchyId of noteNode.masterHierarchyIds) {
                      const { error } = await supabase
                        .from('coa_master_hierarchy')
                        .update({ note_number: newNoteNumber })
                        .eq('id', hierarchyId);

                      if (error) {
                        console.error('Error updating note number:', error);
                        throw error;
                      }
                    }

                    displayToast(`Note number updated to ${newNoteNumber}`, 'success');
                    setEditingNoteNumber(null);

                    // Reload data to reflect changes
                    loadData();
                  } catch (error) {
                    console.error('Error updating note number:', error);
                    displayToast('Error updating note number: ' + error.message, 'error');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Builder Modal */}
      {showNoteBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="bg-purple-600 text-white px-8 py-6 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <BookOpen size={32} />
                <div>
                  <h2 className="text-3xl font-bold">Note Builder</h2>
                  <p className="text-sm text-purple-100 mt-1">Edit note descriptions and content for financial statements</p>
                </div>
              </div>
              <button
                onClick={() => setShowNoteBuilder(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-6">
                {(() => {
                  // Collect all notes from both BS and IS with sequential numbers
                  const allNotes = [];

                  const collectNotes = (nodes) => {
                    nodes.forEach(node => {
                      if (node.level === 'note' && node.sequentialNoteRef) {
                        allNotes.push({
                          noteRef: node.sequentialNoteRef,
                          noteName: node.name,
                          className: node.className,
                          subclassName: node.subclassName,
                          statementType: ['Assets', 'Liability', 'Liabilities', 'Equity'].includes(node.className) ? 'balance_sheet' : 'income_statement'
                        });
                      }

                      if (node.children && node.children.length > 0) {
                        collectNotes(node.children);
                      }
                    });
                  };

                  // Build both hierarchies to collect all notes
                  const bsHierarchy = buildCOAHierarchy(masterHierarchy, glAccounts, 'balance_sheet');
                  const isHierarchy = buildCOAHierarchy(masterHierarchy, glAccounts, 'income_statement');
                  const combined = [...bsHierarchy, ...isHierarchy];
                  assignSequentialNoteNumbers(combined);
                  collectNotes(combined);

                  // Sort by note ref
                  allNotes.sort((a, b) => a.noteRef - b.noteRef);

                  return allNotes.length > 0 ? (
                    <div className="grid gap-6">
                      {allNotes.map((note, index) => (
                        <div key={index} className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all">
                          {/* Note Header */}
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0">
                              <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded font-bold text-sm">
                                {note.noteRef}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-[#101828] mb-1">{note.noteName}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <span className="font-semibold">Class:</span> {note.className}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="font-semibold">Subclass:</span> {note.subclassName}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  note.statementType === 'balance_sheet' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {note.statementType === 'balance_sheet' ? 'Balance Sheet' : 'Income Statement'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Note Content Editor */}
                          <div className="ml-16">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Note Description
                            </label>
                            <textarea
                              rows={4}
                              placeholder="Enter note description, accounting policies, or additional details here..."
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                              value={noteContents[note.noteRef] || ''}
                              onChange={(e) => {
                                setNoteContents(prev => ({
                                  ...prev,
                                  [note.noteRef]: e.target.value
                                }));
                              }}
                            />
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                This will appear in the financial statement notes
                              </span>
                              <button
                                onClick={() => {
                                  saveNoteDescription(
                                    note.noteRef,
                                    note.noteName,
                                    noteContents[note.noteRef] || '',
                                    note.statementType,
                                    note.className,
                                    note.subclassName,
                                    note.noteName
                                  );
                                }}
                                disabled={savingNotes[note.noteRef]}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {savingNotes[note.noteRef] ? (
                                  <>
                                    <Loader size={14} className="animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save size={14} />
                                    Save Note
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No notes found</p>
                      <p className="text-sm">Notes will appear here once you have data in your chart of accounts</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-8 py-4 flex items-center justify-between rounded-b-2xl bg-gray-50">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Tip:</span> Note descriptions will be included in your financial statement exports
              </div>
              <button
                onClick={() => setShowNoteBuilder(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
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

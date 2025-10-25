'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  BookOpen,
  Save,
  Loader,
  FileText,
  Edit2,
  X,
  Table as TableIcon,
  Hash,
  Calculator,
  Type,
  Plus,
  Eye,
  Trash2,
  Sparkles,
  AlignLeft
} from 'lucide-react';

export default function NoteBuilderPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteContents, setNoteContents] = useState({});
  const [savingNotes, setSavingNotes] = useState({});
  const [toast, setToast] = useState(null);
  const [entities, setEntities] = useState([]);
  const [masterHierarchy, setMasterHierarchy] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [previousPeriod, setPreviousPeriod] = useState('');
  const [trialBalances, setTrialBalances] = useState([]);
  const [eliminations, setEliminations] = useState([]);
  const [adjustments, setAdjustments] = useState([]);

  // Side panel states
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);

  // Toolbar states
  const [showTableBuilder, setShowTableBuilder] = useState(false);
  const [showGLBuilder, setShowGLBuilder] = useState(false);
  const [showFormulaBuilder, setShowFormulaBuilder] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);

  // Table builder states
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableData, setTableData] = useState([]);

  // GL Tag builder states
  const [selectedGL, setSelectedGL] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedPeriodForGL, setSelectedPeriodForGL] = useState('');

  // Formula builder states
  const [formulaText, setFormulaText] = useState('');

  // Grid editor states
  const [noteGridData, setNoteGridData] = useState({});
  const [showGridEditor, setShowGridEditor] = useState(true);

  // Text editor states
  const [additionalText, setAdditionalText] = useState({});
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMode, setAiMode] = useState('generate'); // generate, enhance, summarize
  const [aiLoading, setAiLoading] = useState(false);

  const statementTabs = [
    { id: 'balance_sheet', label: 'Balance Sheet', classes: ['Assets', 'Liability', 'Liabilities', 'Equity'] },
    { id: 'income_statement', label: 'Income Statement', classes: ['Revenue', 'Income', 'Expenses'] }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentPeriod) {
      loadTrialBalances();
    }
  }, [currentPeriod, previousPeriod]);

  const showToast = (message, success) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3000);
  };

  const loadTrialBalances = async () => {
    try {
      const [tbResponse, elimResponse, adjResponse] = await Promise.all([
        fetch('/api/trial-balance'),
        fetch('/api/elimination-entries'),
        supabase.from('adjustment_entries').select('*')
      ]);

      if (!tbResponse.ok) throw new Error('Failed to fetch trial balance');
      const allTB = await tbResponse.json();
      setTrialBalances(allTB || []);

      if (elimResponse.ok) {
        const elimData = await elimResponse.json();
        setEliminations(elimData || []);
      }

      if (adjResponse.data) {
        setAdjustments(adjResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading trial balances:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const entitiesResponse = await fetch('/api/entities');
      const entitiesData = await entitiesResponse.json();
      setEntities(entitiesData || []);

      const tbResponse = await fetch('/api/trial-balance');
      const allTBData = await tbResponse.json();
      const uniquePeriods = [...new Set((allTBData || []).map(tb => tb.period))].sort().reverse();
      setPeriods(uniquePeriods);

      if (uniquePeriods.length > 0) {
        setCurrentPeriod(uniquePeriods[0]);
        setSelectedPeriodForGL(uniquePeriods[0]);
        if (uniquePeriods.length > 1) {
          setPreviousPeriod(uniquePeriods[1]);
        }
      }

      const [coaRes, hierarchyRes] = await Promise.all([
        supabase.from('chart_of_accounts').select('*').eq('is_active', true),
        supabase.from('coa_master_hierarchy').select('*').eq('is_active', true)
      ]);

      setGlAccounts(coaRes.data || []);
      setMasterHierarchy(hierarchyRes.data || []);

      const bsHierarchy = buildCOAHierarchy(hierarchyRes.data || [], coaRes.data || [], 'balance_sheet');
      const isHierarchy = buildCOAHierarchy(hierarchyRes.data || [], coaRes.data || [], 'income_statement');
      const combinedForNumbering = [...bsHierarchy, ...isHierarchy];
      assignSequentialNoteNumbers(combinedForNumbering);

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
      collectNotes(combinedForNumbering);
      allNotes.sort((a, b) => a.noteRef - b.noteRef);
      setNotes(allNotes);

      if (entitiesData && entitiesData.length > 0) {
        await loadNoteDescriptions(entitiesData[0].company_id);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading notes', false);
    } finally {
      setLoading(false);
    }
  };

  const assignSequentialNoteNumbers = (hierarchy) => {
    let noteCounter = 1;
    const noteMapping = new Map();

    const traverseAndAssign = (nodes) => {
      nodes.forEach(node => {
        if (node.level === 'note' && !node.isProfitRow) {
          if (!noteMapping.has(node.id)) {
            noteMapping.set(node.id, noteCounter);
            node.sequentialNoteRef = noteCounter;
            noteCounter++;
          } else {
            node.sequentialNoteRef = noteMapping.get(node.id);
          }
        }
        if (node.children && node.children.length > 0) {
          traverseAndAssign(node.children);
        }
      });
    };

    traverseAndAssign(hierarchy);
    return hierarchy;
  };

  const buildCOAHierarchy = (masterHierarchy, coa, statementType) => {
    const currentTab = statementTabs.find(t => t.id === statementType);
    const allowedClasses = currentTab ? currentTab.classes : [];
    const hierarchy = [];

    const classes = [...new Set(masterHierarchy
      .filter(h => h && allowedClasses.includes(h.class_name))
      .map(h => h.class_name))].filter(Boolean);

    classes.forEach(className => {
      const classNode = {
        id: `class-${className}`,
        level: 'class',
        name: className,
        children: []
      };

      const subclasses = [...new Set(masterHierarchy
        .filter(h => h && h.class_name === className && h.subclass_name)
        .map(h => h.subclass_name))].filter(Boolean);

      subclasses.forEach(subclassName => {
        const subclassNode = {
          id: `subclass-${className}-${subclassName}`,
          level: 'subclass',
          name: subclassName,
          className: className,
          children: []
        };

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
            children: []
          };
          subclassNode.children.push(noteNode);
        });

        classNode.children.push(subclassNode);
      });

      hierarchy.push(classNode);
    });

    return hierarchy;
  };

  const loadNoteDescriptions = async (companyId) => {
    try {
      const response = await fetch(`/api/note-descriptions?company_id=${companyId}`);
      if (!response.ok) {
        throw new Error('Failed to load note descriptions');
      }

      const { data } = await response.json();
      const contentsMap = {};
      (data || []).forEach(desc => {
        contentsMap[desc.note_ref] = desc.note_content || '';
      });
      setNoteContents(contentsMap);
    } catch (error) {
      console.error('Error loading note descriptions:', error);
      showToast('Error loading note descriptions', false);
    }
  };

  const saveNoteDescription = async () => {
    if (!editingNote) return;

    try {
      if (!entities || entities.length === 0) {
        showToast('Cannot save: No company context available', false);
        return;
      }

      const companyId = entities[0].company_id;
      setSavingNotes(prev => ({ ...prev, [editingNote.noteRef]: true }));

      // Convert grid data to text content before saving
      const gridData = noteGridData[editingNote.noteRef];
      let contentToSave = noteContents[editingNote.noteRef] || '';
      if (gridData) {
        contentToSave = convertGridToText(editingNote, gridData);
        // Update noteContents state as well
        setNoteContents(prev => ({
          ...prev,
          [editingNote.noteRef]: contentToSave
        }));
      }

      // Append additional text if present
      const additionalTextContent = additionalText[editingNote.noteRef] || '';
      if (additionalTextContent.trim()) {
        contentToSave += '\n\n' + additionalTextContent;
      }

      const response = await fetch('/api/note-descriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyId,
          note_ref: editingNote.noteRef,
          note_title: editingNote.noteName,
          note_content: contentToSave,
          statement_type: editingNote.statementType,
          class_name: editingNote.className,
          subclass_name: editingNote.subclassName,
          note_name: editingNote.noteName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save note description');
      }

      showToast(`Note ${editingNote.noteRef} saved successfully!`, true);
      setShowEditPanel(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note description:', error);
      showToast(`Error saving note: ${error.message}`, false);
    } finally {
      setSavingNotes(prev => ({ ...prev, [editingNote?.noteRef]: false }));
    }
  };

  const openEditPanel = (note) => {
    setEditingNote(note);

    // Always regenerate content based on current TB/COA/Master data
    const markdownTable = generateNoteMarkdown(note);
    setNoteContents(prev => ({
      ...prev,
      [note.noteRef]: markdownTable
    }));

    // Parse content to grid data
    const gridData = parseContentToGrid(markdownTable);
    setNoteGridData(prev => ({
      ...prev,
      [note.noteRef]: gridData
    }));

    setShowEditPanel(true);
  };

  const openViewModal = (note) => {
    // Generate or get existing content for preview
    let content = noteContents[note.noteRef];
    if (!content || content.trim() === '') {
      content = generateNoteMarkdown(note);
    }

    // Append additional text if present
    const additionalTextContent = additionalText[note.noteRef] || '';
    if (additionalTextContent.trim()) {
      content += '\n\n' + additionalTextContent;
    }

    setViewingNote({ ...note, content });
    setShowViewModal(true);
  };

  const generateNoteMarkdown = (note) => {
    // Get all GL accounts for this note
    const noteGLs = glAccounts.filter(gl =>
      gl.class_name === note.className &&
      gl.subclass_name === note.subclassName &&
      gl.note_name === note.noteName
    );

    const className = note.className;

    // Group GL accounts by sub-note name
    const subNoteGroups = {};
    noteGLs.forEach(gl => {
      const subNoteName = gl.subnote_name || gl.account_name;
      if (!subNoteGroups[subNoteName]) {
        subNoteGroups[subNoteName] = [];
      }
      subNoteGroups[subNoteName].push(gl);
    });

    // Calculate totals
    let totalCurrent = 0;
    let totalPrevious = 0;

    // Build sub-note data (one entry per unique sub-note name)
    const subNoteData = Object.keys(subNoteGroups).map(subNoteName => {
      const glGroup = subNoteGroups[subNoteName];

      // Calculate consolidated current year value for this sub-note
      let currentValue = 0;
      entities.forEach(entity => {
        currentValue += getEntityValue(glGroup, entity.id, className, currentPeriod);
      });
      currentValue += getEliminationValue(glGroup, className);
      currentValue += getAdjustmentValue(glGroup, className);
      totalCurrent += currentValue;

      // Calculate consolidated previous year value
      let previousValue = 0;
      if (previousPeriod) {
        entities.forEach(entity => {
          previousValue += getEntityValue(glGroup, entity.id, className, previousPeriod);
        });
        previousValue += getEliminationValue(glGroup, className);
        previousValue += getAdjustmentValue(glGroup, className);
        totalPrevious += previousValue;
      }

      return {
        name: subNoteName,
        current: formatCurrency(currentValue),
        previous: previousValue !== 0 ? formatCurrency(previousValue) : ''
      };
    });

    // If only one unique sub-note, show just one line - no total needed
    if (subNoteData.length === 1) {
      let content = `Note ${note.noteRef} — ${note.noteName}\n\n`;
      content += `${subNoteData[0].name}\n`;
      content += `Current Year (${currentPeriod}): ${subNoteData[0].current}`;
      if (previousPeriod && subNoteData[0].previous) {
        content += `\nPrevious Year (${previousPeriod}): ${subNoteData[0].previous}`;
      }
      return content;
    }

    // Multiple sub-notes - show table format with total
    let content = `Note ${note.noteRef} — ${note.noteName}\n\n`;

    // Header
    content += `Description`.padEnd(40);
    content += `Current Year (${currentPeriod})`.padEnd(25);
    if (previousPeriod) {
      content += `Previous Year (${previousPeriod})`;
    }
    content += `\n`;
    content += `${'='.repeat(40)}`;
    content += `${'='.repeat(25)}`;
    if (previousPeriod) {
      content += `${'='.repeat(30)}`;
    }
    content += `\n`;

    // Sub-note rows
    subNoteData.forEach(sub => {
      content += `${sub.name.padEnd(40)}`;
      content += `${sub.current.padEnd(25)}`;
      if (previousPeriod) {
        content += `${sub.previous.padEnd(30)}`;
      }
      content += `\n`;
    });

    // Total row - only for multiple sub-notes
    content += `${'='.repeat(40)}`;
    content += `${'='.repeat(25)}`;
    if (previousPeriod) {
      content += `${'='.repeat(30)}`;
    }
    content += `\n`;
    content += `${'Total'.padEnd(40)}`;
    content += `${formatCurrency(totalCurrent).padEnd(25)}`;
    if (previousPeriod) {
      content += `${formatCurrency(totalPrevious).padEnd(30)}`;
    }
    content += `\n`;

    return content;
  };

  // Parse text content to grid data
  const parseContentToGrid = (content) => {
    const lines = content.split('\n');
    const hasTableFormat = content.includes('===');

    if (!hasTableFormat) {
      // Simple format with one sub-note
      const headerLine = lines.find(line => line.startsWith('Note '));
      const descriptionLine = lines[2]?.trim() || '';
      const currentLine = lines.find(line => line.includes('Current Year'));
      const previousLine = lines.find(line => line.includes('Previous Year'));

      const currentMatch = currentLine?.match(/Current Year \(([^)]+)\): ([\d,.-]+)/);
      const previousMatch = previousLine?.match(/Previous Year \(([^)]+)\): ([\d,.-]+)/);

      return {
        hasMultipleSubNotes: false,
        singleSubNote: {
          description: descriptionLine,
          currentValue: currentMatch ? currentMatch[2] : '',
          previousValue: previousMatch ? previousMatch[2] : ''
        }
      };
    } else {
      // Table format with multiple sub-notes
      const rows = [];
      let inTable = false;

      lines.forEach(line => {
        if (line.includes('===')) {
          inTable = !inTable;
        } else if (inTable && line.trim() && !line.includes('Total')) {
          // Parse table row - split by multiple spaces
          const cells = line.split(/\s{2,}/).filter(c => c.trim());
          if (cells.length >= 2) {
            rows.push({
              description: cells[0]?.trim() || '',
              currentValue: cells[1]?.trim() || '',
              previousValue: cells[2]?.trim() || ''
            });
          }
        }
      });

      return {
        hasMultipleSubNotes: true,
        rows: rows
      };
    }
  };

  // Convert grid data back to text content
  const convertGridToText = (note, gridData) => {
    if (!gridData.hasMultipleSubNotes) {
      // Single sub-note format
      const sub = gridData.singleSubNote;
      let content = `Note ${note.noteRef} — ${note.noteName}\n\n`;
      content += `${sub.description}\n`;
      content += `Current Year (${currentPeriod}): ${sub.currentValue}`;
      if (previousPeriod && sub.previousValue) {
        content += `\nPrevious Year (${previousPeriod}): ${sub.previousValue}`;
      }
      return content;
    } else {
      // Multiple sub-notes table format
      let content = `Note ${note.noteRef} — ${note.noteName}\n\n`;

      // Header
      content += `Description`.padEnd(40);
      content += `Current Year (${currentPeriod})`.padEnd(25);
      if (previousPeriod) {
        content += `Previous Year (${previousPeriod})`;
      }
      content += `\n`;
      content += `${'='.repeat(40)}`;
      content += `${'='.repeat(25)}`;
      if (previousPeriod) {
        content += `${'='.repeat(30)}`;
      }
      content += `\n`;

      // Data rows
      let totalCurrent = 0;
      let totalPrevious = 0;
      gridData.rows.forEach(row => {
        content += `${row.description.padEnd(40)}`;
        content += `${row.currentValue.padEnd(25)}`;
        if (previousPeriod) {
          content += `${row.previousValue.padEnd(30)}`;
        }
        content += `\n`;

        // Sum totals (parse numbers)
        const currentNum = parseFloat(row.currentValue.replace(/,/g, '')) || 0;
        const previousNum = parseFloat(row.previousValue.replace(/,/g, '')) || 0;
        totalCurrent += currentNum;
        totalPrevious += previousNum;
      });

      // Total row
      content += `${'='.repeat(40)}`;
      content += `${'='.repeat(25)}`;
      if (previousPeriod) {
        content += `${'='.repeat(30)}`;
      }
      content += `\n`;
      content += `${'Total'.padEnd(40)}`;
      content += `${formatCurrency(totalCurrent).padEnd(25)}`;
      if (previousPeriod) {
        content += `${formatCurrency(totalPrevious).padEnd(30)}`;
      }
      content += `\n`;

      return content;
    }
  };

  // Add a new row to grid
  const addGridRow = (noteRef) => {
    setNoteGridData(prev => {
      const current = prev[noteRef] || { hasMultipleSubNotes: true, rows: [] };
      return {
        ...prev,
        [noteRef]: {
          ...current,
          hasMultipleSubNotes: true,
          rows: [...(current.rows || []), { description: '', currentValue: '', previousValue: '' }]
        }
      };
    });
  };

  // Remove a row from grid
  const removeGridRow = (noteRef, rowIndex) => {
    setNoteGridData(prev => {
      const current = prev[noteRef];
      if (!current || !current.rows) return prev;

      const newRows = current.rows.filter((_, idx) => idx !== rowIndex);
      return {
        ...prev,
        [noteRef]: {
          ...current,
          rows: newRows
        }
      };
    });
  };

  // Update a grid cell
  const updateGridCell = (noteRef, rowIndex, field, value) => {
    setNoteGridData(prev => {
      const current = prev[noteRef];
      if (!current) return prev;

      if (!current.hasMultipleSubNotes) {
        // Single sub-note
        return {
          ...prev,
          [noteRef]: {
            ...current,
            singleSubNote: {
              ...current.singleSubNote,
              [field]: value
            }
          }
        };
      } else {
        // Multiple sub-notes
        const newRows = [...current.rows];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          [field]: value
        };
        return {
          ...prev,
          [noteRef]: {
            ...current,
            rows: newRows
          }
        };
      }
    });
  };

  // Helper function: Get entity value (same logic as Consolidation Workings)
  const getEntityValue = (accounts, entityId, className, period) => {
    if (!accounts || accounts.length === 0 || !period) return 0;

    const tbData = trialBalances.filter(tb => tb.period === period);
    let total = 0;

    accounts.forEach(account => {
      const tbEntries = tbData.filter(
        tb => tb.account_code === account.account_code && tb.entity_id === entityId
      );

      tbEntries.forEach(tb => {
        const debit = parseFloat(tb.debit || 0);
        const credit = parseFloat(tb.credit || 0);

        // Use natural balance direction (same as Consolidation Workings)
        let netAmount;
        if (['Assets', 'Expenses'].includes(className)) {
          netAmount = debit - credit;
        } else {
          netAmount = credit - debit;
        }
        total += netAmount;
      });
    });

    return total;
  };

  // Helper function: Get elimination value (same logic as Consolidation Workings)
  const getEliminationValue = (accounts, className) => {
    if (!accounts || accounts.length === 0) return 0;

    let total = 0;
    accounts.forEach(account => {
      // Check elimination journal entries
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

    return total;
  };

  // Helper function: Get adjustment value (same logic as Consolidation Workings)
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

  // Get consolidated note value (replaces old getNoteValue)
  const getNoteValue = (note, period) => {
    if (!period || !trialBalances.length) return 0;

    const noteGLs = glAccounts.filter(gl =>
      gl.class_name === note.className &&
      gl.subclass_name === note.subclassName &&
      gl.note_name === note.noteName
    );

    const className = note.className;
    let total = 0;

    // Sum all entity values
    entities.forEach(entity => {
      total += getEntityValue(noteGLs, entity.id, className, period);
    });

    // Add eliminations and adjustments
    total += getEliminationValue(noteGLs, className);
    total += getAdjustmentValue(noteGLs, className);

    return total;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(value));
  };

  // Table Builder Functions
  const initializeTable = () => {
    const newTableData = Array(tableRows).fill(null).map(() =>
      Array(tableCols).fill('')
    );
    setTableData(newTableData);
  };

  const updateTableCell = (rowIndex, colIndex, value) => {
    const newTableData = [...tableData];
    newTableData[rowIndex][colIndex] = value;
    setTableData(newTableData);
  };

  const insertTable = () => {
    let tableHTML = `<table border="1" style="border-collapse: collapse; width: 100%;">\n`;
    tableData.forEach((row) => {
      tableHTML += '  <tr>\n';
      row.forEach((cell) => {
        tableHTML += `    <td style="padding: 8px;">${cell || '&nbsp;'}</td>\n`;
      });
      tableHTML += '  </tr>\n';
    });
    tableHTML += '</table>\n\n';

    setNoteContents(prev => ({
      ...prev,
      [editingNote.noteRef]: (prev[editingNote.noteRef] || '') + tableHTML
    }));
    showToast('Table inserted into note', true);
    setEditMode('text');
  };

  // GL Tag Functions
  const insertGLTag = () => {
    if (!selectedGL) {
      showToast('Please select a GL account', false);
      return;
    }

    const glTag = `{{GL:${selectedGL}${selectedEntity ? ':' + selectedEntity : ''}${selectedPeriodForGL ? ':' + selectedPeriodForGL : ''}}}`;
    setNoteContents(prev => ({
      ...prev,
      [editingNote.noteRef]: (prev[editingNote.noteRef] || '') + glTag
    }));
    showToast('GL tag inserted', true);
    setSelectedGL('');
    setSelectedEntity('');
  };

  // Formula Functions
  const insertFormula = () => {
    if (!formulaText) {
      showToast('Please enter a formula', false);
      return;
    }

    const formulaTag = `{{FORMULA:${formulaText}}}`;
    setNoteContents(prev => ({
      ...prev,
      [editingNote.noteRef]: (prev[editingNote.noteRef] || '') + formulaTag
    }));
    showToast('Formula inserted', true);
    setFormulaText('');
  };

  const addGLToFormula = (glCode) => {
    setFormulaText(prev => prev + `GL(${glCode})`);
  };

  // AI Assist Functions
  const callAIAssist = async () => {
    if (!aiPrompt.trim() && aiMode !== 'enhance') {
      showToast('Please enter a prompt', false);
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          mode: aiMode,
          context: {
            noteName: editingNote.noteName,
            className: editingNote.className,
            subclassName: editingNote.subclassName,
            currentText: additionalText[editingNote.noteRef] || ''
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate text');
      }

      const data = await response.json();

      // Update additional text with AI-generated content
      setAdditionalText(prev => ({
        ...prev,
        [editingNote.noteRef]: data.text
      }));

      showToast('AI text generated successfully!', true);
      setAiPrompt('');
    } catch (error) {
      console.error('Error calling AI assist:', error);
      showToast(`AI Error: ${error.message}`, false);
    } finally {
      setAiLoading(false);
    }
  };

  const enhanceWithAI = async () => {
    const currentText = additionalText[editingNote.noteRef] || '';
    if (!currentText.trim()) {
      showToast('No text to enhance', false);
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentText,
          mode: 'enhance',
          context: {
            noteName: editingNote.noteName,
            className: editingNote.className,
            subclassName: editingNote.subclassName
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance text');
      }

      const data = await response.json();

      setAdditionalText(prev => ({
        ...prev,
        [editingNote.noteRef]: data.text
      }));

      showToast('Text enhanced successfully!', true);
    } catch (error) {
      console.error('Error enhancing text:', error);
      showToast(`AI Error: ${error.message}`, false);
    } finally {
      setAiLoading(false);
    }
  };

  const renderNoteContent = (note) => {
    const content = note.content;

    // Split content into lines
    const lines = content.split('\n');

    // Check if it's a table format (has === separators)
    const hasTableFormat = content.includes('===');

    if (hasTableFormat) {
      // Parse table format
      const tableLines = [];
      let inTable = false;
      let headerRow = null;
      let dataRows = [];
      let totalRow = null;

      lines.forEach(line => {
        if (line.includes('===')) {
          inTable = !inTable;
        } else if (inTable && line.trim()) {
          if (!headerRow) {
            headerRow = line;
          } else if (line.includes('Total')) {
            totalRow = line;
          } else {
            dataRows.push(line);
          }
        }
      });

      // Render as HTML table
      return (
        <div className="mt-6">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">Current Year ({currentPeriod})</th>
                {previousPeriod && (
                  <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">Previous Year ({previousPeriod})</th>
                )}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, idx) => {
                const cells = row.split(/\s{2,}/).filter(c => c.trim());
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-gray-900">{cells[0]?.trim()}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-mono text-gray-900">{cells[1]?.trim()}</td>
                    {previousPeriod && cells[2] && (
                      <td className="border border-gray-300 px-4 py-2 text-right font-mono text-gray-900">{cells[2]?.trim()}</td>
                    )}
                  </tr>
                );
              })}
              {totalRow && (
                <tr className="bg-gray-100 font-bold">
                  {totalRow.split(/\s{2,}/).filter(c => c.trim()).map((cell, idx) => (
                    <td key={idx} className="border border-gray-300 px-4 py-2 text-right font-mono text-gray-900">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    } else {
      // Simple format - just render as paragraphs
      return (
        <div className="mt-6 space-y-4">
          {lines.map((line, idx) => {
            if (line.trim() === '') return <div key={idx} className="h-2" />;
            if (line.startsWith('Note ')) {
              return null; // Skip note header as it's already shown
            }
            return (
              <p key={idx} className="text-gray-900 leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f7f5f2]">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        icon={BookOpen}
        title="Note Builder"
        subtitle="Edit note descriptions and content for financial statements"
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Period Selectors */}
        <div className="px-8 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">Current Period:</label>
              <select
                value={currentPeriod}
                onChange={(e) => setCurrentPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {periods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">Previous Period:</label>
              <select
                value={previousPeriod}
                onChange={(e) => setPreviousPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">None</option>
                {periods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notes Table */}
        <div className="flex-1 overflow-auto px-8 py-6">
          {notes.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#101828] text-white">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-xs uppercase w-24">Note No</th>
                    <th className="py-3 px-4 text-left font-semibold text-xs uppercase">Note Name</th>
                    <th className="py-3 px-4 text-right font-semibold text-xs uppercase w-48">
                      {currentPeriod || 'Current Year'}
                    </th>
                    {previousPeriod && (
                      <th className="py-3 px-4 text-right font-semibold text-xs uppercase w-48">
                        {previousPeriod}
                      </th>
                    )}
                    <th className="py-3 px-4 text-center font-semibold text-xs uppercase w-56">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-purple-100 text-purple-800 rounded font-bold text-sm">
                          {note.noteRef}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-[#101828]">{note.noteName}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {note.className} → {note.subclassName}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm text-[#101828]">
                        {formatCurrency(getNoteValue(note, currentPeriod))}
                      </td>
                      {previousPeriod && (
                        <td className="py-3 px-4 text-right font-mono text-sm text-gray-600">
                          {formatCurrency(getNoteValue(note, previousPeriod))}
                        </td>
                      )}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openViewModal(note)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                          >
                            <Eye size={14} />
                            View
                          </button>
                          <button
                            onClick={() => openEditPanel(note)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No notes found</p>
              <p className="text-sm">Notes will appear here once you have data in your chart of accounts</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Side Panel */}
      {showEditPanel && editingNote && (
        <div className="fixed right-0 top-0 h-full w-[700px] bg-white shadow-2xl z-50 flex flex-col animate-slideLeft">
          {/* Header */}
          <div className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Edit Note {editingNote.noteRef}</h3>
              <p className="text-sm text-gray-300 mt-1">{editingNote.noteName}</p>
            </div>
            <button
              onClick={() => {
                setShowEditPanel(false);
                setShowTableBuilder(false);
                setShowGLBuilder(false);
                setShowFormulaBuilder(false);
                setShowTextEditor(false);
                setShowAIAssist(false);
              }}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Toolbar */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setShowTextEditor(!showTextEditor);
                  setShowTableBuilder(false);
                  setShowGLBuilder(false);
                  setShowFormulaBuilder(false);
                  setShowAIAssist(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  showTextEditor ? 'bg-[#101828] text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                <AlignLeft size={16} />
                Add Text
              </button>
              <button
                onClick={() => {
                  setShowAIAssist(!showAIAssist);
                  setShowTextEditor(false);
                  setShowTableBuilder(false);
                  setShowGLBuilder(false);
                  setShowFormulaBuilder(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  showAIAssist ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-50'
                }`}
              >
                <Sparkles size={16} />
                AI Assist
              </button>
              <button
                onClick={() => {
                  setShowTableBuilder(!showTableBuilder);
                  setShowGLBuilder(false);
                  setShowFormulaBuilder(false);
                  setShowTextEditor(false);
                  setShowAIAssist(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  showTableBuilder ? 'bg-[#101828] text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                <TableIcon size={16} />
                Insert Table
              </button>
              <button
                onClick={() => {
                  setShowGLBuilder(!showGLBuilder);
                  setShowTableBuilder(false);
                  setShowFormulaBuilder(false);
                  setShowTextEditor(false);
                  setShowAIAssist(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  showGLBuilder ? 'bg-[#101828] text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Hash size={16} />
                Insert GL Tag
              </button>
              <button
                onClick={() => {
                  setShowFormulaBuilder(!showFormulaBuilder);
                  setShowTableBuilder(false);
                  setShowGLBuilder(false);
                  setShowTextEditor(false);
                  setShowAIAssist(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  showFormulaBuilder ? 'bg-[#101828] text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Calculator size={16} />
                Insert Formula
              </button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Editable Grid - Always Visible */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Note Financial Data
                </label>
                <button
                  onClick={() => addGridRow(editingNote.noteRef)}
                  className="flex items-center gap-1 px-3 py-1 bg-[#101828] text-white rounded-lg text-xs font-semibold hover:bg-gray-700 transition-colors"
                >
                  <Plus size={14} />
                  Add Row
                </button>
              </div>

              {noteGridData[editingNote.noteRef] && (
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                  {!noteGridData[editingNote.noteRef].hasMultipleSubNotes ? (
                    /* Single Sub-note Format */
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                        <input
                          type="text"
                          value={noteGridData[editingNote.noteRef].singleSubNote.description}
                          onChange={(e) => updateGridCell(editingNote.noteRef, 0, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#101828]"
                          placeholder="Sub-note description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Current Year ({currentPeriod})
                          </label>
                          <input
                            type="text"
                            value={noteGridData[editingNote.noteRef].singleSubNote.currentValue}
                            onChange={(e) => updateGridCell(editingNote.noteRef, 0, 'currentValue', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] font-mono focus:outline-none focus:ring-2 focus:ring-[#101828]"
                            placeholder="0.00"
                          />
                        </div>
                        {previousPeriod && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Previous Year ({previousPeriod})
                            </label>
                            <input
                              type="text"
                              value={noteGridData[editingNote.noteRef].singleSubNote.previousValue}
                              onChange={(e) => updateGridCell(editingNote.noteRef, 0, 'previousValue', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] font-mono focus:outline-none focus:ring-2 focus:ring-[#101828]"
                              placeholder="0.00"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Multiple Sub-notes Table Format */
                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">
                            Description
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold text-gray-700 w-32">
                            Current ({currentPeriod})
                          </th>
                          {previousPeriod && (
                            <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold text-gray-700 w-32">
                              Previous ({previousPeriod})
                            </th>
                          )}
                          <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 w-16">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {noteGridData[editingNote.noteRef].rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-0">
                              <input
                                type="text"
                                value={row.description}
                                onChange={(e) => updateGridCell(editingNote.noteRef, rowIndex, 'description', e.target.value)}
                                className="w-full px-3 py-2 text-sm text-[#101828] border-0 focus:outline-none focus:ring-2 focus:ring-[#101828] focus:ring-inset"
                                placeholder="Sub-note description"
                              />
                            </td>
                            <td className="border border-gray-300 p-0">
                              <input
                                type="text"
                                value={row.currentValue}
                                onChange={(e) => updateGridCell(editingNote.noteRef, rowIndex, 'currentValue', e.target.value)}
                                className="w-full px-3 py-2 text-sm text-[#101828] font-mono text-right border-0 focus:outline-none focus:ring-2 focus:ring-[#101828] focus:ring-inset"
                                placeholder="0.00"
                              />
                            </td>
                            {previousPeriod && (
                              <td className="border border-gray-300 p-0">
                                <input
                                  type="text"
                                  value={row.previousValue}
                                  onChange={(e) => updateGridCell(editingNote.noteRef, rowIndex, 'previousValue', e.target.value)}
                                  className="w-full px-3 py-2 text-sm text-[#101828] font-mono text-right border-0 focus:outline-none focus:ring-2 focus:ring-[#101828] focus:ring-inset"
                                  placeholder="0.00"
                                />
                              </td>
                            )}
                            <td className="border border-gray-300 px-2 py-1 text-center">
                              <button
                                onClick={() => removeGridRow(editingNote.noteRef, rowIndex)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Remove row"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Edit the financial data above. Click "Add Row" to add more line items. Use the toolbar below to add additional content.
              </p>
            </div>

            {/* TABLE BUILDER */}
            {showTableBuilder && (
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">Table Builder</h4>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Table Dimensions
                  </label>
                  <div className="flex gap-4">
                    <div>
                      <label className="text-xs text-gray-600">Rows</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={tableRows}
                        onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Columns</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={tableCols}
                        onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <button
                      onClick={initializeTable}
                      className="px-4 py-2 bg-[#101828] text-white rounded-lg text-sm font-semibold hover:bg-gray-700"
                    >
                      Create Table
                    </button>
                  </div>
                </div>

                {tableData.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Table Content
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-auto">
                      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                        <tbody>
                          {tableData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, colIndex) => (
                                <td key={colIndex} style={{ border: '1px solid #ddd', padding: '4px' }}>
                                  <input
                                    type="text"
                                    value={cell}
                                    onChange={(e) => updateTableCell(rowIndex, colIndex, e.target.value)}
                                    className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder={`R${rowIndex + 1}C${colIndex + 1}`}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      onClick={() => {
                        insertTable();
                        setShowTableBuilder(false);
                      }}
                      className="mt-4 px-6 py-2 bg-[#101828] text-white rounded-lg font-semibold hover:bg-gray-700"
                    >
                      <Plus size={16} className="inline mr-2" />
                      Insert Table into Note
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* GL TAG BUILDER */}
            {showGLBuilder && (
              <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-bold text-green-900 mb-2">GL Tag Builder</h4>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select GL Account
                  </label>
                  <select
                    value={selectedGL}
                    onChange={(e) => setSelectedGL(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#101828]"
                  >
                    <option value="">Choose GL Account</option>
                    {glAccounts.map(gl => (
                      <option key={gl.account_code} value={gl.account_code}>
                        {gl.account_code} - {gl.account_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Entity (Optional)
                  </label>
                  <select
                    value={selectedEntity}
                    onChange={(e) => setSelectedEntity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#101828]"
                  >
                    <option value="">All Entities</option>
                    {entities.map(entity => (
                      <option key={entity.id} value={entity.id}>
                        {entity.entity_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Period (Optional)
                  </label>
                  <select
                    value={selectedPeriodForGL}
                    onChange={(e) => setSelectedPeriodForGL(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#101828]"
                  >
                    <option value="">Current Period</option>
                    {periods.map(period => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white border border-green-300 rounded-lg p-4">
                  <h4 className="font-bold text-green-900 mb-2">Preview:</h4>
                  <p className="text-sm text-green-800 font-mono break-all">
                    {selectedGL ? `{{GL:${selectedGL}${selectedEntity ? ':' + selectedEntity : ''}${selectedPeriodForGL ? ':' + selectedPeriodForGL : ''}}}` : 'Select a GL account to see preview'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    insertGLTag();
                    setShowGLBuilder(false);
                  }}
                  disabled={!selectedGL}
                  className="w-full px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} className="inline mr-2" />
                  Insert GL Tag
                </button>
              </div>
            )}

            {/* FORMULA BUILDER */}
            {showFormulaBuilder && (
              <div className="space-y-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-2">Formula Builder</h4>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Formula Expression
                  </label>
                  <textarea
                    rows={6}
                    placeholder="e.g., GL(1000) + GL(2000) or (GL(5000) / GL(4000)) * 100"
                    value={formulaText}
                    onChange={(e) => setFormulaText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#101828]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quick Add GL to Formula
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addGLToFormula(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#101828]"
                  >
                    <option value="">Click to add GL code</option>
                    {glAccounts.map(gl => (
                      <option key={gl.account_code} value={gl.account_code}>
                        {gl.account_code} - {gl.account_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white border border-purple-300 rounded-lg p-4">
                  <h4 className="font-bold text-purple-900 mb-2">Formula Examples:</h4>
                  <ul className="text-sm text-purple-800 space-y-1 font-mono">
                    <li>• GL(1000) + GL(2000)</li>
                    <li>• (GL(5000) - GL(5100)) / GL(4000) * 100</li>
                    <li>• (GL(1000) - GL(1100)) / GL(1000) * 100</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    insertFormula();
                    setShowFormulaBuilder(false);
                  }}
                  disabled={!formulaText}
                  className="w-full px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} className="inline mr-2" />
                  Insert Formula
                </button>
              </div>
            )}

            {/* TEXT EDITOR */}
            {showTextEditor && (
              <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-bold text-green-900 mb-2">Add Additional Text</h4>
                <p className="text-sm text-green-800 mb-3">
                  Add explanatory text, accounting policies, or additional disclosures to this note.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Note Description / Additional Content
                  </label>
                  <textarea
                    rows={10}
                    placeholder="Enter additional text for this note. You can describe accounting policies, significant judgments, or provide explanatory information..."
                    value={additionalText[editingNote.noteRef] || ''}
                    onChange={(e) => setAdditionalText(prev => ({
                      ...prev,
                      [editingNote.noteRef]: e.target.value
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#101828] focus:ring-2 focus:ring-green-500 font-sans leading-relaxed"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={enhanceWithAI}
                    disabled={aiLoading || !additionalText[editingNote.noteRef]?.trim()}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {aiLoading ? (
                      <>
                        <Loader size={14} className="inline animate-spin mr-2" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="inline mr-2" />
                        Enhance with AI
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-600 italic">
                  Tip: Write your text manually, then click "Enhance with AI" to improve clarity and professionalism. Or use the AI Assist tool to generate text from scratch.
                </p>
              </div>
            )}

            {/* AI ASSIST */}
            {showAIAssist && (
              <div className="space-y-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-purple-600" size={20} />
                  <h4 className="font-bold text-purple-900">AI Assist</h4>
                </div>
                <p className="text-sm text-purple-800 mb-3">
                  Let AI help you generate professional note descriptions and disclosures.
                </p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    AI Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button
                      onClick={() => setAiMode('generate')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        aiMode === 'generate'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-50'
                      }`}
                    >
                      Generate
                    </button>
                    <button
                      onClick={() => setAiMode('enhance')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        aiMode === 'enhance'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-50'
                      }`}
                    >
                      Enhance
                    </button>
                    <button
                      onClick={() => setAiMode('summarize')}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        aiMode === 'summarize'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-50'
                      }`}
                    >
                      Summarize
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Prompt
                  </label>
                  <textarea
                    rows={6}
                    placeholder={
                      aiMode === 'generate'
                        ? 'E.g., "Write a professional note description explaining our revenue recognition policy for software licenses"'
                        : aiMode === 'enhance'
                        ? 'Paste the text you want to enhance here...'
                        : 'Paste the text you want to summarize here...'
                    }
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-[#101828] focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="bg-white border border-purple-300 rounded-lg p-4">
                  <h4 className="font-bold text-purple-900 mb-2">Context:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• <strong>Note:</strong> {editingNote.noteName}</li>
                    <li>• <strong>Class:</strong> {editingNote.className}</li>
                    <li>• <strong>Sub-class:</strong> {editingNote.subclassName}</li>
                  </ul>
                  <p className="text-xs text-purple-600 mt-2 italic">
                    AI will use this context to generate relevant content
                  </p>
                </div>

                <button
                  onClick={callAIAssist}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {aiLoading ? (
                    <>
                      <Loader size={16} className="inline animate-spin mr-2" />
                      AI is thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="inline mr-2" />
                      Generate with AI
                    </>
                  )}
                </button>

                {additionalText[editingNote.noteRef] && (
                  <div className="mt-4 p-4 bg-white border border-green-300 rounded-lg">
                    <h4 className="font-bold text-green-900 mb-2">Generated Text Preview:</h4>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {additionalText[editingNote.noteRef]}
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      This text will be saved with your note. You can edit it in the "Add Text" section.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
            <button
              onClick={saveNoteDescription}
              disabled={savingNotes[editingNote.noteRef]}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingNotes[editingNote.noteRef] ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Note
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowEditPanel(false);
                setShowTableBuilder(false);
                setShowGLBuilder(false);
                setShowFormulaBuilder(false);
                setShowTextEditor(false);
                setShowAIAssist(false);
              }}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* View Modal - PDF Preview */}
      {showViewModal && viewingNote && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-70 z-50 flex items-center justify-center p-8">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
              <div>
                <h3 className="text-xl font-bold text-white">Note Preview</h3>
                <p className="text-sm text-blue-100 mt-1">PDF Print Preview</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* PDF-like Content Area */}
            <div className="flex-1 overflow-auto p-8 bg-gray-100">
              <div className="bg-white shadow-lg rounded-lg p-12 max-w-3xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
                <div className="border-b-2 border-gray-800 pb-4 mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Note {viewingNote.noteRef} — {viewingNote.noteName}
                  </h1>
                  <p className="text-sm text-gray-600 mt-2">
                    {viewingNote.className} / {viewingNote.subclassName}
                  </p>
                </div>

                <div className="prose max-w-none text-gray-900">
                  {renderNoteContent({ ...viewingNote, content: noteContents[viewingNote.noteRef] || viewingNote.content })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 rounded-b-xl">
              <button
                onClick={() => window.print()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Print to PDF
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg animate-slideUp z-[100] ${
          toast.success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="font-semibold">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

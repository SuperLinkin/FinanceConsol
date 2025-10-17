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
  Eye
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

  // Side panel states
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editMode, setEditMode] = useState('text');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);

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
      const response = await fetch('/api/trial-balance');
      if (!response.ok) throw new Error('Failed to fetch trial balance');
      const allTB = await response.json();
      setTrialBalances(allTB || []);
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

      const response = await fetch('/api/note-descriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyId,
          note_ref: editingNote.noteRef,
          note_title: editingNote.noteName,
          note_content: noteContents[editingNote.noteRef] || '',
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
    setEditMode('text');

    // If note content is empty or doesn't exist, populate with default markdown table
    if (!noteContents[note.noteRef] || noteContents[note.noteRef].trim() === '') {
      const markdownTable = generateNoteMarkdown(note);
      setNoteContents(prev => ({
        ...prev,
        [note.noteRef]: markdownTable
      }));
    }

    setShowEditPanel(true);
  };

  const openViewModal = (note) => {
    // Generate or get existing content for preview
    let content = noteContents[note.noteRef];
    if (!content || content.trim() === '') {
      content = generateNoteMarkdown(note);
    }
    setViewingNote({ ...note, content });
    setShowViewModal(true);
  };

  const generateNoteMarkdown = (note) => {
    // Get all GL accounts (sub-notes) for this note
    const noteGLs = glAccounts.filter(gl =>
      gl.class_name === note.className &&
      gl.subclass_name === note.subclassName &&
      gl.note_name === note.noteName
    );

    // Calculate totals
    let totalCurrent = 0;
    let totalPrevious = 0;

    // Build sub-note data
    const subNoteData = noteGLs.map(gl => {
      const currentTB = trialBalances.find(tb =>
        tb.account_code === gl.account_code &&
        tb.period === currentPeriod
      );
      const currentValue = currentTB ? (currentTB.debit || 0) - (currentTB.credit || 0) : 0;
      totalCurrent += currentValue;

      let previousValue = 0;
      if (previousPeriod) {
        const previousTB = trialBalances.find(tb =>
          tb.account_code === gl.account_code &&
          tb.period === previousPeriod
        );
        previousValue = previousTB ? (previousTB.debit || 0) - (previousTB.credit || 0) : 0;
        totalPrevious += previousValue;
      }

      return {
        name: gl.subnote_name || gl.account_name,
        current: formatCurrency(currentValue),
        previous: previousValue !== 0 ? formatCurrency(previousValue) : ''
      };
    });

    // If only one sub-note, show simple format
    if (noteGLs.length === 1) {
      let content = `Note ${note.noteRef} — ${note.noteName}\n\n`;
      content += `${subNoteData[0].name}\n`;
      content += `Current Year (${currentPeriod}): ${subNoteData[0].current}`;
      if (previousPeriod && subNoteData[0].previous) {
        content += `\nPrevious Year (${previousPeriod}): ${subNoteData[0].previous}`;
      }
      return content;
    }

    // Multiple sub-notes - show table format
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
  };

  const getNoteValue = (note, period) => {
    if (!period || !trialBalances.length) return 0;

    const noteGLs = glAccounts.filter(gl =>
      gl.class_name === note.className &&
      gl.subclass_name === note.subclassName &&
      gl.note_name === note.noteName
    );

    let total = 0;
    noteGLs.forEach(gl => {
      const tbEntry = trialBalances.find(tb =>
        tb.account_code === gl.account_code &&
        tb.period === period
      );
      if (tbEntry) {
        total += (tbEntry.debit || 0) - (tbEntry.credit || 0);
      }
    });

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
            if (line.trim() === '') return null;
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
          <div className="bg-purple-600 text-white px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Edit Note {editingNote.noteRef}</h3>
              <p className="text-sm text-purple-100 mt-1">{editingNote.noteName}</p>
            </div>
            <button
              onClick={() => setShowEditPanel(false)}
              className="p-2 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => setEditMode('text')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  editMode === 'text' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Type size={16} />
                Text
              </button>
              <button
                onClick={() => setEditMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  editMode === 'table' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                <TableIcon size={16} />
                Table
              </button>
              <button
                onClick={() => setEditMode('gl')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  editMode === 'gl' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Hash size={16} />
                GL Tag
              </button>
              <button
                onClick={() => setEditMode('formula')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  editMode === 'formula' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Calculator size={16} />
                Formula
              </button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* TEXT MODE */}
            {editMode === 'text' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Note Content
                </label>
                <textarea
                  rows={20}
                  placeholder="Enter note description, accounting policies, or additional details here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                  value={noteContents[editingNote.noteRef] || ''}
                  onChange={(e) => {
                    setNoteContents(prev => ({
                      ...prev,
                      [editingNote.noteRef]: e.target.value
                    }));
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use {"{{GL:code}}"} for GL tags and {"{{FORMULA:expression}}"} for formulas
                </p>
              </div>
            )}

            {/* TABLE MODE */}
            {editMode === 'table' && (
              <div className="space-y-4">
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
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
                      onClick={insertTable}
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                    >
                      <Plus size={16} className="inline mr-2" />
                      Insert Table into Note
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* GL TAG MODE */}
            {editMode === 'gl' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select GL Account
                  </label>
                  <select
                    value={selectedGL}
                    onChange={(e) => setSelectedGL(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Current Period</option>
                    {periods.map(period => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-900 mb-2">Preview:</h4>
                  <p className="text-sm text-green-800 font-mono break-all">
                    {selectedGL ? `{{GL:${selectedGL}${selectedEntity ? ':' + selectedEntity : ''}${selectedPeriodForGL ? ':' + selectedPeriodForGL : ''}}}` : 'Select a GL account to see preview'}
                  </p>
                </div>

                <button
                  onClick={insertGLTag}
                  disabled={!selectedGL}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} className="inline mr-2" />
                  Insert GL Tag
                </button>
              </div>
            )}

            {/* FORMULA MODE */}
            {editMode === 'formula' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Formula Expression
                  </label>
                  <textarea
                    rows={6}
                    placeholder="e.g., GL(1000) + GL(2000) or (GL(5000) / GL(4000)) * 100"
                    value={formulaText}
                    onChange={(e) => setFormulaText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Click to add GL code</option>
                    {glAccounts.map(gl => (
                      <option key={gl.account_code} value={gl.account_code}>
                        {gl.account_code} - {gl.account_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-bold text-purple-900 mb-2">Formula Examples:</h4>
                  <ul className="text-sm text-purple-800 space-y-1 font-mono">
                    <li>• GL(1000) + GL(2000)</li>
                    <li>• (GL(5000) - GL(5100)) / GL(4000) * 100</li>
                    <li>• (GL(1000) - GL(1100)) / GL(1000) * 100</li>
                  </ul>
                </div>

                <button
                  onClick={insertFormula}
                  disabled={!formulaText}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} className="inline mr-2" />
                  Insert Formula
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
            <button
              onClick={saveNoteDescription}
              disabled={savingNotes[editingNote.noteRef]}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={() => setShowEditPanel(false)}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* View Modal - PDF Preview */}
      {showViewModal && viewingNote && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 z-50 flex items-center justify-center p-8">
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

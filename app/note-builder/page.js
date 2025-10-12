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
  Type
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
  const [editMode, setEditMode] = useState('text'); // 'text', 'table', 'gl', 'formula'

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
      // Load entities first to get company_id
      const entitiesResponse = await fetch('/api/entities');
      const entitiesData = await entitiesResponse.json();
      setEntities(entitiesData || []);

      // Load periods
      const tbResponse = await fetch('/api/trial-balance');
      const allTBData = await tbResponse.json();
      const uniquePeriods = [...new Set((allTBData || []).map(tb => tb.period))].sort().reverse();
      setPeriods(uniquePeriods);

      if (uniquePeriods.length > 0) {
        setCurrentPeriod(uniquePeriods[0]);
        if (uniquePeriods.length > 1) {
          setPreviousPeriod(uniquePeriods[1]);
        }
      }

      // Load COA hierarchy and GL accounts
      const [coaRes, hierarchyRes] = await Promise.all([
        supabase.from('chart_of_accounts').select('*').eq('is_active', true),
        supabase.from('coa_master_hierarchy').select('*').eq('is_active', true)
      ]);

      setGlAccounts(coaRes.data || []);
      setMasterHierarchy(hierarchyRes.data || []);

      // Build hierarchies and assign sequential numbers
      const bsHierarchy = buildCOAHierarchy(hierarchyRes.data || [], coaRes.data || [], 'balance_sheet');
      const isHierarchy = buildCOAHierarchy(hierarchyRes.data || [], coaRes.data || [], 'income_statement');
      const combinedForNumbering = [...bsHierarchy, ...isHierarchy];
      assignSequentialNoteNumbers(combinedForNumbering);

      // Collect all notes
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

      // Load existing note descriptions if we have entities
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
    setShowEditPanel(true);
  };

  const getNoteValue = (note, period) => {
    if (!period || !trialBalances.length) return 0;

    // Get all GL accounts for this note
    const noteGLs = glAccounts.filter(gl =>
      gl.class_name === note.className &&
      gl.subclass_name === note.subclassName &&
      gl.note_name === note.noteName
    );

    // Sum up trial balance values for this period
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
                    <th className="py-3 px-4 text-center font-semibold text-xs uppercase w-32">Actions</th>
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
                        <button
                          onClick={() => openEditPanel(note)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
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
        <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-50 flex flex-col animate-slideLeft">
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
            {editMode === 'text' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Note Content
                </label>
                <textarea
                  rows={20}
                  placeholder="Enter note description, accounting policies, or additional details here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  value={noteContents[editingNote.noteRef] || ''}
                  onChange={(e) => {
                    setNoteContents(prev => ({
                      ...prev,
                      [editingNote.noteRef]: e.target.value
                    }));
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will appear in the financial statement notes
                </p>
              </div>
            )}

            {editMode === 'table' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <TableIcon size={48} className="mx-auto text-blue-400 mb-4" />
                <p className="text-blue-900 font-semibold">Table Builder</p>
                <p className="text-sm text-blue-700 mt-2">Coming soon - Insert tables into notes</p>
              </div>
            )}

            {editMode === 'gl' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <Hash size={48} className="mx-auto text-green-400 mb-4" />
                <p className="text-green-900 font-semibold">GL Tag Builder</p>
                <p className="text-sm text-green-700 mt-2">Coming soon - Insert GL account values</p>
              </div>
            )}

            {editMode === 'formula' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                <Calculator size={48} className="mx-auto text-purple-400 mb-4" />
                <p className="text-purple-900 font-semibold">Formula Builder</p>
                <p className="text-sm text-purple-700 mt-2">Coming soon - Insert calculated values</p>
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

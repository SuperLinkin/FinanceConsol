'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  BookOpen,
  Save,
  Loader,
  FileText
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

  const statementTabs = [
    { id: 'balance_sheet', label: 'Balance Sheet', classes: ['Assets', 'Liability', 'Liabilities', 'Equity'] },
    { id: 'income_statement', label: 'Income Statement', classes: ['Revenue', 'Income', 'Expenses'] }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message, success) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load entities first to get company_id
      const entitiesResponse = await fetch('/api/entities');
      const entitiesData = await entitiesResponse.json();
      setEntities(entitiesData || []);

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

  const saveNoteDescription = async (note) => {
    try {
      if (!entities || entities.length === 0) {
        showToast('Cannot save: No company context available', false);
        return;
      }

      const companyId = entities[0].company_id;
      setSavingNotes(prev => ({ ...prev, [note.noteRef]: true }));

      const response = await fetch('/api/note-descriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyId,
          note_ref: note.noteRef,
          note_title: note.noteName,
          note_content: noteContents[note.noteRef] || '',
          statement_type: note.statementType,
          class_name: note.className,
          subclass_name: note.subclassName,
          note_name: note.noteName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save note description');
      }

      showToast(`Note ${note.noteRef} saved successfully!`, true);
    } catch (error) {
      console.error('Error saving note description:', error);
      showToast(`Error saving note: ${error.message}`, false);
    } finally {
      setSavingNotes(prev => ({ ...prev, [note.noteRef]: false }));
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

      <div className="flex-1 overflow-y-auto p-8">
        <div className="space-y-6 max-w-6xl mx-auto">
          {notes.length > 0 ? (
            notes.map((note, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all bg-white">
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
                      onClick={() => saveNoteDescription(note)}
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
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No notes found</p>
              <p className="text-sm">Notes will appear here once you have data in your chart of accounts</p>
            </div>
          )}
        </div>
      </div>

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

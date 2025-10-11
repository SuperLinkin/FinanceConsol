'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  FileText,
  Table,
  BarChart3,
  Calculator,
  Hash,
  Eye,
  RefreshCw
} from 'lucide-react';

export default function NoteBuilderPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isNoteModalClosing, setIsNoteModalClosing] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);

  // GL Codes and Entities
  const [glCodes, setGlCodes] = useState([]);
  const [entities, setEntities] = useState([]);
  const [periods, setPeriods] = useState([]);

  const [noteForm, setNoteForm] = useState({
    note_number: '',
    note_title: '',
    note_type: 'Text',
    note_content: '',
    note_order: 1,
    is_active: true
  });

  const [showTableBuilder, setShowTableBuilder] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableBorderStyle, setTableBorderStyle] = useState('all');
  const [tableData, setTableData] = useState([]);
  const [tableCellTypes, setTableCellTypes] = useState([]); // Track if cell is GL tag or formula

  // GL Tag Builder
  const [showGLTagBuilder, setShowGLTagBuilder] = useState(false);
  const [glTagForm, setGlTagForm] = useState({
    gl_code: '',
    entity: '',
    period: '',
    display_format: 'value' // 'value', 'formatted', 'thousands', 'millions'
  });
  const [currentCellPosition, setCurrentCellPosition] = useState(null);

  // Formula Builder
  const [showFormulaBuilder, setShowFormulaBuilder] = useState(false);
  const [formulaText, setFormulaText] = useState('');
  const [formulaGLs, setFormulaGLs] = useState([]); // Array of GL tags used in formula

  // Preview Mode
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const NOTE_TYPES = ['Text', 'Table', 'Chart', 'Mixed'];

  useEffect(() => {
    setMounted(true);
    fetchNotes();
    fetchGLCodes();
    fetchEntities();
    fetchPeriods();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financial_notes')
        .select('*')
        .order('note_order', { ascending: true });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      showToast('Error loading notes', false);
    } finally {
      setLoading(false);
    }
  };

  const fetchGLCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('account_code, account_name, class_name, subclass_name')
        .order('account_code');

      if (error) throw error;
      setGlCodes(data || []);
    } catch (error) {
      console.error('Error fetching GL codes:', error);
    }
  };

  const fetchEntities = async () => {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('id, entity_name')
        .eq('is_active', true)
        .order('entity_name');

      if (error) throw error;
      setEntities(data || []);
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  const fetchPeriods = async () => {
    try {
      const { data, error } = await supabase
        .from('trial_balance')
        .select('period')
        .order('period', { ascending: false });

      if (error) throw error;
      const uniquePeriods = [...new Set(data.map(d => d.period))];
      setPeriods(uniquePeriods);
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const closeNoteModal = () => {
    if (isNoteModalClosing) return;
    setIsNoteModalClosing(true);
    setTimeout(() => {
      setShowNoteModal(false);
      setIsNoteModalClosing(false);
      setEditingNote(null);
      resetNoteForm();
    }, 300);
  };

  const initializeTable = (rows, cols) => {
    const newTableData = Array(rows).fill(null).map(() =>
      Array(cols).fill('')
    );
    const newTableCellTypes = Array(rows).fill(null).map(() =>
      Array(cols).fill('text') // 'text', 'gl_tag', 'formula'
    );
    setTableData(newTableData);
    setTableCellTypes(newTableCellTypes);
  };

  const updateTableCell = (rowIndex, colIndex, value) => {
    const newTableData = [...tableData];
    newTableData[rowIndex][colIndex] = value;
    setTableData(newTableData);
  };

  const setCellAsGLTag = (rowIndex, colIndex) => {
    setCurrentCellPosition({ row: rowIndex, col: colIndex });
    setShowGLTagBuilder(true);
  };

  const setCellAsFormula = (rowIndex, colIndex) => {
    setCurrentCellPosition({ row: rowIndex, col: colIndex });
    setFormulaText(tableData[rowIndex][colIndex] || '');
    setShowFormulaBuilder(true);
  };

  const insertGLTagIntoCell = () => {
    if (!currentCellPosition || !glTagForm.gl_code) {
      showToast('Please select a GL code', false);
      return;
    }

    const glTag = `{{GL:${glTagForm.gl_code}${glTagForm.entity ? ':' + glTagForm.entity : ''}${glTagForm.period ? ':' + glTagForm.period : ''}:${glTagForm.display_format}}}`;

    const newTableData = [...tableData];
    const newTableCellTypes = [...tableCellTypes];
    newTableData[currentCellPosition.row][currentCellPosition.col] = glTag;
    newTableCellTypes[currentCellPosition.row][currentCellPosition.col] = 'gl_tag';

    setTableData(newTableData);
    setTableCellTypes(newTableCellTypes);
    setShowGLTagBuilder(false);
    setGlTagForm({ gl_code: '', entity: '', period: '', display_format: 'value' });
    showToast('GL tag inserted', true);
  };

  const insertFormulaIntoCell = () => {
    if (!currentCellPosition || !formulaText) {
      showToast('Please enter a formula', false);
      return;
    }

    const formulaTag = `{{FORMULA:${formulaText}}}`;

    const newTableData = [...tableData];
    const newTableCellTypes = [...tableCellTypes];
    newTableData[currentCellPosition.row][currentCellPosition.col] = formulaTag;
    newTableCellTypes[currentCellPosition.row][currentCellPosition.col] = 'formula';

    setTableData(newTableData);
    setTableCellTypes(newTableCellTypes);
    setShowFormulaBuilder(false);
    setFormulaText('');
    setFormulaGLs([]);
    showToast('Formula inserted', true);
  };

  const addGLToFormula = (glCode) => {
    const glTag = `GL(${glCode})`;
    setFormulaText(formulaText + glTag);
    setFormulaGLs([...formulaGLs, glCode]);
  };

  const insertGLTagIntoText = () => {
    if (!glTagForm.gl_code) {
      showToast('Please select a GL code', false);
      return;
    }

    const glTag = `{{GL:${glTagForm.gl_code}${glTagForm.entity ? ':' + glTagForm.entity : ''}${glTagForm.period ? ':' + glTagForm.period : ''}:${glTagForm.display_format}}}`;

    setNoteForm({
      ...noteForm,
      note_content: noteForm.note_content + glTag
    });

    setShowGLTagBuilder(false);
    setGlTagForm({ gl_code: '', entity: '', period: '', display_format: 'value' });
    showToast('GL tag inserted into text', true);
  };

  const insertFormulaIntoText = () => {
    if (!formulaText) {
      showToast('Please enter a formula', false);
      return;
    }

    const formulaTag = `{{FORMULA:${formulaText}}}`;

    setNoteForm({
      ...noteForm,
      note_content: noteForm.note_content + formulaTag
    });

    setShowFormulaBuilder(false);
    setFormulaText('');
    setFormulaGLs([]);
    showToast('Formula inserted into text', true);
  };

  const insertTableIntoContent = () => {
    const borderStyles = {
      'all': 'border-collapse: collapse; border: 1px solid #000;',
      'horizontal': 'border-collapse: collapse; border-top: 1px solid #000; border-bottom: 1px solid #000;',
      'vertical': 'border-collapse: collapse; border-left: 1px solid #000; border-right: 1px solid #000;',
      'outer': 'border-collapse: collapse; border: 1px solid #000;',
      'none': 'border-collapse: collapse;'
    };

    const cellBorderStyles = {
      'all': 'border: 1px solid #000; padding: 8px;',
      'horizontal': 'border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 8px;',
      'vertical': 'border-left: 1px solid #000; border-right: 1px solid #000; padding: 8px;',
      'outer': 'padding: 8px;',
      'none': 'padding: 8px;'
    };

    let tableHTML = `<table style="${borderStyles[tableBorderStyle]} width: 100%;">\n`;

    tableData.forEach((row, rowIndex) => {
      tableHTML += '  <tr>\n';
      row.forEach((cell, colIndex) => {
        tableHTML += `    <td style="${cellBorderStyles[tableBorderStyle]}">${cell || '&nbsp;'}</td>\n`;
      });
      tableHTML += '  </tr>\n';
    });

    tableHTML += '</table>\n\n';

    setNoteForm({
      ...noteForm,
      note_content: noteForm.note_content + tableHTML
    });

    setShowTableBuilder(false);
    showToast('Table inserted', true);
  };

  const generatePreview = async () => {
    let content = noteForm.note_content;

    // Replace all GL tags with values from TB
    const glTagRegex = /\{\{GL:([^:}]+)(?::([^:}]+))?(?::([^:}]+))?:([^}]+)\}\}/g;
    const glMatches = [...content.matchAll(glTagRegex)];

    for (const match of glMatches) {
      const [fullMatch, glCode, entity, period, format] = match;

      try {
        let query = supabase
          .from('trial_balance')
          .select('debit, credit')
          .eq('account_code', glCode);

        if (entity) query = query.eq('entity_id', entity);
        if (period) query = query.eq('period', period);

        const { data, error } = await query.single();

        if (!error && data) {
          const netAmount = (data.debit || 0) - (data.credit || 0);
          let formattedValue = netAmount;

          if (format === 'thousands') formattedValue = (netAmount / 1000).toFixed(2) + 'K';
          else if (format === 'millions') formattedValue = (netAmount / 1000000).toFixed(2) + 'M';
          else if (format === 'formatted') formattedValue = netAmount.toLocaleString();

          content = content.replace(fullMatch, String(formattedValue));
        } else {
          content = content.replace(fullMatch, '[GL Not Found]');
        }
      } catch (err) {
        content = content.replace(fullMatch, '[Error]');
      }
    }

    // Replace all formulas
    const formulaRegex = /\{\{FORMULA:([^}]+)\}\}/g;
    const formulaMatches = [...content.matchAll(formulaRegex)];

    for (const match of formulaMatches) {
      const [fullMatch, formula] = match;

      try {
        // Extract GL codes from formula like GL(1000) + GL(2000)
        const glInFormulaRegex = /GL\(([^)]+)\)/g;
        let evaluatedFormula = formula;
        const glInFormulaMatches = [...formula.matchAll(glInFormulaRegex)];

        for (const glMatch of glInFormulaMatches) {
          const [glFullMatch, glCode] = glMatch;

          const { data, error } = await supabase
            .from('trial_balance')
            .select('debit, credit')
            .eq('account_code', glCode)
            .single();

          if (!error && data) {
            const netAmount = (data.debit || 0) - (data.credit || 0);
            evaluatedFormula = evaluatedFormula.replace(glFullMatch, String(netAmount));
          } else {
            evaluatedFormula = evaluatedFormula.replace(glFullMatch, '0');
          }
        }

        // Evaluate the formula
        const result = eval(evaluatedFormula);
        content = content.replace(fullMatch, String(result));
      } catch (err) {
        content = content.replace(fullMatch, '[Formula Error]');
      }
    }

    setPreviewContent(content);
    setShowPreview(true);
  };

  const resetNoteForm = () => {
    setNoteForm({
      note_number: '',
      note_title: '',
      note_type: 'Text',
      note_content: '',
      note_order: notes.length + 1,
      is_active: true
    });
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteForm({
      note_number: note.note_number,
      note_title: note.note_title,
      note_type: note.note_type,
      note_content: note.note_content,
      note_order: note.note_order,
      is_active: note.is_active
    });
    setShowNoteModal(true);
  };

  const handleSaveNote = async () => {
    if (!noteForm.note_number || !noteForm.note_title || !noteForm.note_content) {
      showToast('Please fill all required fields', false);
      return;
    }

    try {
      if (editingNote) {
        const { error } = await supabase
          .from('financial_notes')
          .update(noteForm)
          .eq('id', editingNote.id);

        if (error) throw error;
        showToast('Note updated successfully', true);
      } else {
        const { error } = await supabase
          .from('financial_notes')
          .insert([noteForm]);

        if (error) throw error;
        showToast('Note created successfully', true);
      }

      closeNoteModal();
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      showToast('Error saving note', false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase
        .from('financial_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      showToast('Note deleted', true);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      showToast('Error deleting note', false);
    }
  };

  const handleReorder = async (noteId, direction) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const currentOrder = note.note_order;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

    if (newOrder < 1 || newOrder > notes.length) return;

    try {
      const otherNote = notes.find(n => n.note_order === newOrder);
      if (otherNote) {
        await supabase
          .from('financial_notes')
          .update({ note_order: currentOrder })
          .eq('id', otherNote.id);
      }

      await supabase
        .from('financial_notes')
        .update({ note_order: newOrder })
        .eq('id', noteId);

      fetchNotes();
    } catch (error) {
      console.error('Error reordering:', error);
      showToast('Error reordering notes', false);
    }
  };

  const showToast = (message, success) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-xl text-gray-600">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        icon={BookOpen}
        title="Note Builder"
        subtitle="Create custom financial notes with GL tagging and formulas"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          {/* Header Actions */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Financial Notes</h2>
              <p className="text-sm text-gray-600 mt-1">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  showToast('Financial notes ready to sync with Reporting Builder!', true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <RefreshCw size={16} />
                Sync to Reports
              </button>
              <button
                onClick={() => {
                  resetNoteForm();
                  setShowNoteModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
              >
                <Plus size={20} />
                New Note
              </button>
            </div>
          </div>

          {/* Notes Grid */}
          {notes.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Notes Yet</h3>
              <p className="text-gray-500 mb-6">Create your first financial note for reporting</p>
              <button
                onClick={() => {
                  resetNoteForm();
                  setShowNoteModal(true);
                }}
                className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
              >
                Create Note
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {notes.map((note, index) => (
                <div key={note.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-slate-900 text-white text-sm font-bold rounded">
                          Note {note.note_number}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">{note.note_title}</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded flex items-center gap-1">
                          {note.note_type === 'Table' && <Table size={12} />}
                          {note.note_type === 'Chart' && <BarChart3 size={12} />}
                          {note.note_type === 'Text' && <FileText size={12} />}
                          {note.note_type}
                        </span>
                        {note.is_active && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="mt-4 text-sm text-gray-700 line-clamp-3">
                        {note.note_content}
                      </div>

                      {mounted && (
                        <div className="mt-4 text-xs text-gray-500">
                          Created: {new Date(note.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleReorder(note.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleReorder(note.id, 'down')}
                          disabled={index === notes.length - 1}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Modal */}
      {(showNoteModal || isNoteModalClosing) && (
        <div className={`fixed right-0 top-0 h-full w-[800px] bg-white shadow-2xl z-50 overflow-y-auto ${isNoteModalClosing ? 'animate-slideOutRight' : 'animate-slideLeft'}`}>
          <div className="h-full flex flex-col">
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{editingNote ? 'Edit Note' : 'New Note'}</h3>
                <p className="text-sm text-slate-300 mt-1">Create or update financial note with GL tagging</p>
              </div>
              <button
                onClick={closeNoteModal}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Note Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={noteForm.note_number}
                      onChange={(e) => setNoteForm({...noteForm, note_number: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                      placeholder="e.g., 1, 2.1, 3a"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Note Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={noteForm.note_type}
                      onChange={(e) => setNoteForm({...noteForm, note_type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    >
                      {NOTE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Note Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={noteForm.note_title}
                    onChange={(e) => setNoteForm({...noteForm, note_title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    placeholder="e.g., Significant Accounting Estimates"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Note Content <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentCellPosition(null);
                          setShowGLTagBuilder(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        <Hash size={14} />
                        Insert GL
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentCellPosition(null);
                          setShowFormulaBuilder(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                      >
                        <Calculator size={14} />
                        Formula
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          initializeTable(tableRows, tableCols);
                          setShowTableBuilder(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        <Table size={14} />
                        Table
                      </button>
                      <button
                        type="button"
                        onClick={generatePreview}
                        className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                      >
                        <Eye size={14} />
                        Preview
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={noteForm.note_content}
                    onChange={(e) => setNoteForm({...noteForm, note_content: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 text-sm font-mono"
                    rows="18"
                    placeholder="Type your note content. Use {{GL:code}} for GL tags and {{FORMULA:expression}} for calculations..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={noteForm.note_order}
                    onChange={(e) => setNoteForm({...noteForm, note_order: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    min="1"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noteForm.is_active}
                      onChange={(e) => setNoteForm({...noteForm, is_active: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="font-medium text-gray-700">Active Note</span>
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-2">GL Tags & Formulas:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• GL Tag: {`{{GL:1000::2024:value}}`} - Auto-populates GL value</li>
                    <li>• Formula: {`{{FORMULA:GL(1000) + GL(2000)}}`} - Calculate from GLs</li>
                    <li>• Formula: {`{{FORMULA:(GL(5000)/GL(4000))*100}}`} - Percentage calc</li>
                    <li>• Use Preview button to see values populated</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={handleSaveNote}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Save size={20} />
                  {editingNote ? 'Update Note' : 'Save Note'}
                </button>
                <button
                  onClick={closeNoteModal}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Builder Modal */}
      {showTableBuilder && (
        <div className="fixed inset-0 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl w-[900px] max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between rounded-t-xl">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Table size={28} />
                  Table Builder with GL Tags
                </h3>
                <p className="text-sm text-slate-300 mt-1">Design table, add GL tags and formulas in cells</p>
              </div>
              <button
                onClick={() => setShowTableBuilder(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Table Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rows
                  </label>
                  <input
                    type="number"
                    value={tableRows}
                    onChange={(e) => {
                      const rows = parseInt(e.target.value) || 1;
                      setTableRows(rows);
                      initializeTable(rows, tableCols);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Columns
                  </label>
                  <input
                    type="number"
                    value={tableCols}
                    onChange={(e) => {
                      const cols = parseInt(e.target.value) || 1;
                      setTableCols(cols);
                      initializeTable(tableRows, cols);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              {/* Border Style */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Border Style
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 'all', label: 'All Borders' },
                    { value: 'horizontal', label: 'Horizontal' },
                    { value: 'vertical', label: 'Vertical' },
                    { value: 'outer', label: 'Outer Only' },
                    { value: 'none', label: 'No Borders' }
                  ].map(style => (
                    <button
                      key={style.value}
                      onClick={() => setTableBorderStyle(style.value)}
                      className={`px-3 py-2 text-xs rounded-lg font-semibold transition-colors ${
                        tableBorderStyle === style.value
                          ? 'bg-slate-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Editor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Table Content (Right-click cell for GL/Formula options)
                </label>
                <div className="overflow-x-auto border border-gray-300 rounded-lg">
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <tbody>
                      {tableData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, colIndex) => {
                            let cellStyle = { padding: '8px', position: 'relative' };

                            if (tableBorderStyle === 'all') {
                              cellStyle.borderTop = '1px solid #ccc';
                              cellStyle.borderBottom = '1px solid #ccc';
                              cellStyle.borderLeft = '1px solid #ccc';
                              cellStyle.borderRight = '1px solid #ccc';
                            } else if (tableBorderStyle === 'horizontal') {
                              cellStyle.borderTop = '1px solid #ccc';
                              cellStyle.borderBottom = '1px solid #ccc';
                            } else if (tableBorderStyle === 'vertical') {
                              cellStyle.borderLeft = '1px solid #ccc';
                              cellStyle.borderRight = '1px solid #ccc';
                            } else if (tableBorderStyle === 'outer') {
                              if (rowIndex === 0) cellStyle.borderTop = '1px solid #ccc';
                              if (rowIndex === tableData.length - 1) cellStyle.borderBottom = '1px solid #ccc';
                              if (colIndex === 0) cellStyle.borderLeft = '1px solid #ccc';
                              if (colIndex === row.length - 1) cellStyle.borderRight = '1px solid #ccc';
                            }

                            const cellType = tableCellTypes[rowIndex]?.[colIndex] || 'text';

                            return (
                            <td
                              key={colIndex}
                              style={cellStyle}
                            >
                              <div className="flex flex-col gap-1">
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => updateTableCell(rowIndex, colIndex, e.target.value)}
                                  className={`w-full px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 rounded text-sm text-slate-900 bg-white ${
                                    cellType === 'gl_tag' ? 'bg-green-50' : cellType === 'formula' ? 'bg-purple-50' : ''
                                  }`}
                                  placeholder={`R${rowIndex + 1}C${colIndex + 1}`}
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setCellAsGLTag(rowIndex, colIndex)}
                                    className="flex-1 px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded hover:bg-green-200 font-semibold"
                                    title="Insert GL Tag"
                                  >
                                    GL
                                  </button>
                                  <button
                                    onClick={() => setCellAsFormula(rowIndex, colIndex)}
                                    className="flex-1 px-2 py-1 bg-purple-100 text-purple-700 text-[10px] rounded hover:bg-purple-200 font-semibold"
                                    title="Insert Formula"
                                  >
                                    FX
                                  </button>
                                </div>
                              </div>
                            </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={insertTableIntoContent}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Save size={20} />
                  Insert Table
                </button>
                <button
                  onClick={() => setShowTableBuilder(false)}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GL Tag Builder Modal */}
      {showGLTagBuilder && (
        <div className="fixed inset-0 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="bg-green-600 text-white px-8 py-6 flex items-center justify-between rounded-t-xl">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Hash size={28} />
                  GL Tag Builder
                </h3>
                <p className="text-sm text-green-100 mt-1">Select GL code to insert into note</p>
              </div>
              <button
                onClick={() => setShowGLTagBuilder(false)}
                className="p-2 hover:bg-green-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GL Code <span className="text-red-500">*</span>
                </label>
                <select
                  value={glTagForm.gl_code}
                  onChange={(e) => setGlTagForm({...glTagForm, gl_code: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-slate-900"
                >
                  <option value="">Select GL Code</option>
                  {glCodes.map(gl => (
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
                  value={glTagForm.entity}
                  onChange={(e) => setGlTagForm({...glTagForm, entity: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-slate-900"
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
                  value={glTagForm.period}
                  onChange={(e) => setGlTagForm({...glTagForm, period: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-slate-900"
                >
                  <option value="">All Periods</option>
                  {periods.map(period => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Display Format
                </label>
                <select
                  value={glTagForm.display_format}
                  onChange={(e) => setGlTagForm({...glTagForm, display_format: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-slate-900"
                >
                  <option value="value">Raw Value (12345.67)</option>
                  <option value="formatted">Formatted (12,345.67)</option>
                  <option value="thousands">Thousands (12.35K)</option>
                  <option value="millions">Millions (0.01M)</option>
                </select>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-bold text-green-900 mb-2">Preview:</h4>
                <p className="text-sm text-green-800 font-mono break-all">
                  {glTagForm.gl_code ? `{{GL:${glTagForm.gl_code}${glTagForm.entity ? ':' + glTagForm.entity : ''}${glTagForm.period ? ':' + glTagForm.period : ''}:${glTagForm.display_format}}}` : 'Select a GL code to see preview'}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={currentCellPosition ? insertGLTagIntoCell : insertGLTagIntoText}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  <Save size={20} />
                  Insert GL Tag
                </button>
                <button
                  onClick={() => setShowGLTagBuilder(false)}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formula Builder Modal */}
      {showFormulaBuilder && (
        <div className="fixed inset-0 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-xl shadow-2xl w-[700px] max-h-[90vh] overflow-y-auto">
            <div className="bg-purple-600 text-white px-8 py-6 flex items-center justify-between rounded-t-xl">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Calculator size={28} />
                  Formula Builder
                </h3>
                <p className="text-sm text-purple-100 mt-1">Create calculations using GL codes</p>
              </div>
              <button
                onClick={() => setShowFormulaBuilder(false)}
                className="p-2 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Formula Expression <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formulaText}
                  onChange={(e) => setFormulaText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-slate-900 font-mono text-sm"
                  rows="4"
                  placeholder="e.g., (GL(5000) - GL(5100)) / GL(4000) * 100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Insert GL Code into Formula
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addGLToFormula(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-slate-900"
                >
                  <option value="">Click to add GL code</option>
                  {glCodes.map(gl => (
                    <option key={gl.account_code} value={gl.account_code}>
                      {gl.account_code} - {gl.account_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-bold text-purple-900 mb-2">Formula Examples:</h4>
                <ul className="text-sm text-purple-800 space-y-1 font-mono">
                  <li>• GL(1000) + GL(2000) - Addition</li>
                  <li>• GL(5000) - GL(5100) - Subtraction</li>
                  <li>• (GL(5000)/GL(4000))*100 - Percentage</li>
                  <li>• (GL(1000)-GL(1100))/GL(1000)*100 - Growth%</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={currentCellPosition ? insertFormulaIntoCell : insertFormulaIntoText}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  <Save size={20} />
                  Insert Formula
                </button>
                <button
                  onClick={() => setShowFormulaBuilder(false)}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-xl shadow-2xl w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="bg-orange-600 text-white px-8 py-6 flex items-center justify-between rounded-t-xl">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Eye size={28} />
                  Note Preview
                </h3>
                <p className="text-sm text-orange-100 mt-1">See your note with populated values</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-orange-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                {mounted && (
                  <div
                    className="prose prose-sm max-w-none text-slate-900"
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                  />
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close Preview
                </button>
              </div>
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

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  Scissors,
  Plus,
  Trash2,
  Save,
  X,
  FileText,
  Link2,
  Edit3
} from 'lucide-react';

export default function EliminationsPage() {
  const [entities, setEntities] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [trialBalances, setTrialBalances] = useState([]);
  const [eliminationEntries, setEliminationEntries] = useState([]);
  const [glPairs, setGlPairs] = useState([]);
  const [activeTab, setActiveTab] = useState('entries'); // 'entries' or 'pairs'
  const [showJEModal, setShowJEModal] = useState(false);
  const [showPairModal, setShowPairModal] = useState(false);
  const [isJEModalClosing, setIsJEModalClosing] = useState(false);
  const [isPairModalClosing, setIsPairModalClosing] = useState(false);
  const [editingPair, setEditingPair] = useState(null);
  const [toast, setToast] = useState(null);

  const [jeForm, setJEForm] = useState({
    entry_name: '',
    entry_date: new Date().toISOString().split('T')[0],
    description: '',
    lines: [
      { entity_id: '', gl_code: '', debit: 0, credit: 0 },
      { entity_id: '', gl_code: '', debit: 0, credit: 0 }
    ]
  });

  const [pairForm, setPairForm] = useState({
    pair_name: '',
    description: '',
    gl1_entity: '',
    gl1_code: '',
    gl2_entity: '',
    gl2_code: '',
    difference_gl_code: ''
  });

  const closeJEModal = () => {
    setIsJEModalClosing(true);
    setTimeout(() => {
      setShowJEModal(false);
      setIsJEModalClosing(false);
    }, 300);
  };

  const closePairModal = () => {
    setIsPairModalClosing(true);
    setTimeout(() => {
      setShowPairModal(false);
      setIsPairModalClosing(false);
      setEditingPair(null);
    }, 300);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch entities via API
      const entitiesResponse = await fetch('/api/entities');
      const entitiesData = await entitiesResponse.json();
      const entities = Array.isArray(entitiesData) ? entitiesData : (entitiesData.data || []);
      setEntities(entities);

      // Fetch all GL accounts via API
      const glResponse = await fetch('/api/chart-of-accounts');
      const glData = await glResponse.json();
      setGlAccounts(glData || []);

      // Fetch trial balances via API
      const tbResponse = await fetch('/api/trial-balance');
      const tbData = await tbResponse.json();
      setTrialBalances(tbData || []);

      // Fetch elimination entries via API
      const entriesResponse = await fetch('/api/elimination-entries');
      const entriesData = await entriesResponse.json();
      setEliminationEntries(entriesData || []);

      // Fetch GL pairs via API
      const pairsResponse = await fetch('/api/elimination-pairs');
      const pairsData = await pairsResponse.json();
      setGlPairs(pairsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getEntityName = (entityId) => {
    const entity = entities.find(e => e.id === entityId);
    return entity ? entity.entity_name : 'Unknown';
  };

  const getGLName = (glCode) => {
    const gl = glAccounts.find(g => g.account_code === glCode);
    return gl ? gl.account_name : glCode;
  };

  const getAvailableGLsForEntity = (entityId) => {
    if (!entityId) return [];
    const uniqueGLCodes = [...new Set(
      trialBalances
        .filter(tb => tb.entity_id === entityId)
        .map(tb => tb.account_code)
    )];
    return glAccounts.filter(gl => uniqueGLCodes.includes(gl.account_code));
  };

  const getGLBalance = (glCode, entityId) => {
    if (!glCode || !entityId) return { net: 0, type: 'Dr', debit: 0, credit: 0 };

    const tbEntries = trialBalances.filter(
      tb => tb.account_code === glCode && tb.entity_id === entityId
    );

    if (tbEntries.length === 0) return { net: 0, type: 'Dr', debit: 0, credit: 0 };

    let totalDebit = 0;
    let totalCredit = 0;

    tbEntries.forEach(tb => {
      totalDebit += parseFloat(tb.debit || 0);
      totalCredit += parseFloat(tb.credit || 0);
    });

    const netBalance = totalDebit - totalCredit;
    const balanceType = netBalance >= 0 ? 'Dr' : 'Cr';
    const absBalance = Math.abs(netBalance);

    return { net: absBalance, type: balanceType, debit: totalDebit, credit: totalCredit };
  };

  const openJEModal = () => {
    setJEForm({
      entry_name: '',
      entry_date: new Date().toISOString().split('T')[0],
      description: '',
      lines: [
        { entity_id: '', gl_code: '', debit: 0, credit: 0 },
        { entity_id: '', gl_code: '', debit: 0, credit: 0 }
      ]
    });
    setShowJEModal(true);
  };

  const openPairModal = () => {
    setPairForm({
      pair_name: '',
      description: '',
      gl1_entity: '',
      gl1_code: '',
      gl2_entity: '',
      gl2_code: '',
      difference_gl_code: ''
    });
    setShowPairModal(true);
  };

  const openJEFromPair = (pair) => {
    const gl1Balance = getGLBalance(pair.gl1_code, pair.gl1_entity);
    const gl2Balance = getGLBalance(pair.gl2_code, pair.gl2_entity);

    // Calculate elimination amount (minimum of the two balances)
    const eliminationAmount = Math.min(gl1Balance.net, gl2Balance.net);
    const difference = Math.abs(gl1Balance.net - gl2Balance.net);

    // Create JE lines
    const lines = [];

    // Line 1: Credit GL1 (the one with balance)
    if (gl1Balance.net > 0) {
      lines.push({
        entity_id: pair.gl1_entity,
        gl_code: pair.gl1_code,
        debit: gl1Balance.type === 'Cr' ? eliminationAmount : 0,
        credit: gl1Balance.type === 'Dr' ? eliminationAmount : 0
      });
    }

    // Line 2: Debit GL2 (the offsetting one)
    if (gl2Balance.net > 0) {
      lines.push({
        entity_id: pair.gl2_entity,
        gl_code: pair.gl2_code,
        debit: gl2Balance.type === 'Dr' ? eliminationAmount : 0,
        credit: gl2Balance.type === 'Cr' ? eliminationAmount : 0
      });
    }

    // Line 3: Difference line if needed
    if (difference > 0.01 && pair.difference_gl_code) {
      const largerBalance = gl1Balance.net > gl2Balance.net ? gl1Balance : gl2Balance;
      const largerEntity = gl1Balance.net > gl2Balance.net ? pair.gl1_entity : pair.gl2_entity;

      lines.push({
        entity_id: largerEntity,
        gl_code: pair.difference_gl_code,
        debit: largerBalance.type === 'Cr' ? difference : 0,
        credit: largerBalance.type === 'Dr' ? difference : 0
      });
    }

    setJEForm({
      entry_name: pair.pair_name,
      entry_date: new Date().toISOString().split('T')[0],
      description: pair.description || `Elimination for ${pair.pair_name}`,
      lines: lines.length >= 2 ? lines : [
        { entity_id: '', gl_code: '', debit: 0, credit: 0 },
        { entity_id: '', gl_code: '', debit: 0, credit: 0 }
      ]
    });
    setShowJEModal(true);
  };

  const addJELine = () => {
    setJEForm({
      ...jeForm,
      lines: [...jeForm.lines, { entity_id: '', gl_code: '', debit: 0, credit: 0 }]
    });
  };

  const removeJELine = (index) => {
    if (jeForm.lines.length <= 2) {
      showToast('A journal entry must have at least 2 lines', false);
      return;
    }
    const newLines = jeForm.lines.filter((_, i) => i !== index);
    setJEForm({ ...jeForm, lines: newLines });
  };

  const updateJELine = (index, field, value) => {
    const newLines = [...jeForm.lines];
    newLines[index][field] = value;

    if (field === 'entity_id') {
      newLines[index].gl_code = '';
    }

    if (field === 'debit' && value > 0) {
      newLines[index].credit = 0;
    }

    if (field === 'credit' && value > 0) {
      newLines[index].debit = 0;
    }

    setJEForm({ ...jeForm, lines: newLines });
  };

  const calculateJETotals = () => {
    let totalDebit = 0;
    let totalCredit = 0;

    jeForm.lines.forEach(line => {
      totalDebit += parseFloat(line.debit || 0);
      totalCredit += parseFloat(line.credit || 0);
    });

    const difference = totalDebit - totalCredit;
    const isBalanced = Math.abs(difference) < 0.01;

    return { totalDebit, totalCredit, difference, isBalanced };
  };

  const handleSaveJE = async () => {
    if (!jeForm.entry_name.trim()) {
      showToast('Please enter an entry name', false);
      return;
    }

    const invalidLines = jeForm.lines.filter(line => !line.entity_id || !line.gl_code);
    if (invalidLines.length > 0) {
      showToast('All lines must have an entity and GL account selected', false);
      return;
    }

    const emptyLines = jeForm.lines.filter(line =>
      parseFloat(line.debit || 0) === 0 && parseFloat(line.credit || 0) === 0
    );
    if (emptyLines.length > 0) {
      showToast('All lines must have either a debit or credit amount', false);
      return;
    }

    const totals = calculateJETotals();
    if (!totals.isBalanced) {
      showToast(`Journal entry is not balanced. Difference: ${Math.abs(totals.difference).toFixed(2)}`, false);
      return;
    }

    try {
      // Prepare lines with GL names
      const linesWithNames = jeForm.lines.map(line => ({
        entity_id: line.entity_id,
        gl_code: line.gl_code,
        gl_name: getGLName(line.gl_code),
        debit: parseFloat(line.debit || 0),
        credit: parseFloat(line.credit || 0)
      }));

      const response = await fetch('/api/elimination-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry_name: jeForm.entry_name,
          entry_date: jeForm.entry_date,
          description: jeForm.description,
          lines: linesWithNames
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create elimination entry');
      }

      showToast('Elimination journal entry posted successfully', true);
      closeJEModal();
      fetchData();
    } catch (error) {
      console.error('Error saving JE:', error);
      showToast('Error posting journal entry: ' + error.message, false);
    }
  };

  const handleSavePair = async () => {
    if (!pairForm.pair_name.trim()) {
      showToast('Please enter a pair name', false);
      return;
    }

    if (!pairForm.gl1_entity || !pairForm.gl1_code || !pairForm.gl2_entity || !pairForm.gl2_code) {
      showToast('Please select both GL pairs', false);
      return;
    }

    try {
      const pairData = {
        pair_name: pairForm.pair_name,
        description: pairForm.description,
        gl1_entity: pairForm.gl1_entity,
        gl1_code: pairForm.gl1_code,
        gl2_entity: pairForm.gl2_entity,
        gl2_code: pairForm.gl2_code,
        difference_gl_code: pairForm.difference_gl_code || null
      };

      const url = editingPair
        ? '/api/elimination-pairs'
        : '/api/elimination-pairs';

      const method = editingPair ? 'PATCH' : 'POST';

      if (editingPair) {
        pairData.id = editingPair.id;
      }

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pairData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save GL pair');
      }

      showToast(editingPair ? 'GL pair updated successfully' : 'GL pair created successfully', true);
      closePairModal();
      fetchData();
    } catch (error) {
      console.error('Error saving pair:', error);
      showToast('Error saving pair: ' + error.message, false);
    }
  };

  const handleEditPair = (pair) => {
    setEditingPair(pair);
    setPairForm({
      pair_name: pair.pair_name,
      description: pair.description || '',
      gl1_entity: pair.gl1_entity,
      gl1_code: pair.gl1_code,
      gl2_entity: pair.gl2_entity,
      gl2_code: pair.gl2_code,
      difference_gl_code: pair.difference_gl_code || ''
    });
    setShowPairModal(true);
  };

  const handleDeletePair = async (id) => {
    if (!confirm('Are you sure you want to delete this GL pair?')) return;

    try {
      const response = await fetch(`/api/elimination-pairs?id=${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete GL pair');
      }

      showToast('GL pair deleted successfully', true);
      fetchData();
    } catch (error) {
      console.error('Error deleting pair:', error);
      showToast('Error deleting pair: ' + error.message, false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!confirm('Are you sure you want to delete this elimination entry?')) return;

    try {
      const response = await fetch(`/api/elimination-entries?id=${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete elimination entry');
      }

      showToast('Elimination entry deleted successfully', true);
      fetchData();
    } catch (error) {
      console.error('Error deleting entry:', error);
      showToast('Error deleting entry: ' + error.message, false);
    }
  };

  const showToast = (message, success = true) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3000);
  };

  const totals = calculateJETotals();

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader title="Eliminations" subtitle="Manage intercompany eliminations and consolidation adjustments" />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('entries')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'entries'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Elimination Entries
            </button>
            <button
              onClick={() => setActiveTab('pairs')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'pairs'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              GL Pairs
            </button>
          </div>

          {/* Elimination Entries Tab */}
          {activeTab === 'entries' && (
            <div>
              <div className="flex justify-end mb-6">
                <button
                  onClick={openJEModal}
                  className="flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1e293b] transition-colors"
                >
                  <Plus size={20} />
                  Create Manual JE
                </button>
              </div>

              <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#101828] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold">Entry Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                      <th className="px-6 py-4 text-right text-sm font-bold">Debit</th>
                      <th className="px-6 py-4 text-right text-sm font-bold">Credit</th>
                      <th className="px-6 py-4 text-center text-sm font-bold">Lines</th>
                      <th className="px-6 py-4 text-center text-sm font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {eliminationEntries.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-16 text-center">
                          <Scissors size={64} className="mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-500 font-semibold text-lg mb-2">No elimination entries</p>
                          <p className="text-gray-400">Create a GL pair or manual JE to get started</p>
                        </td>
                      </tr>
                    ) : (
                      eliminationEntries.map((entry, index) => (
                        <tr key={entry.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{entry.entry_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">{entry.description || '—'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              {new Date(entry.entry_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-mono font-bold text-gray-900">
                              {parseFloat(entry.total_debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-mono font-bold text-gray-900">
                              {parseFloat(entry.total_credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              {entry.lines?.length || 0} lines
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete entry"
                              >
                                <Trash2 size={18} />
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
          )}

          {/* GL Pairs Tab */}
          {activeTab === 'pairs' && (
            <div>
              <div className="flex justify-end mb-6">
                <button
                  onClick={openPairModal}
                  className="flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1e293b] transition-colors"
                >
                  <Plus size={20} />
                  Create GL Pair
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {glPairs.length === 0 ? (
                  <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 p-16 text-center">
                    <Link2 size={64} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-semibold text-lg mb-2">No GL pairs configured</p>
                    <p className="text-gray-400">Create GL pairs to automate elimination entries</p>
                  </div>
                ) : (
                  glPairs.map((pair) => {
                    const gl1Balance = getGLBalance(pair.gl1_code, pair.gl1_entity);
                    const gl2Balance = getGLBalance(pair.gl2_code, pair.gl2_entity);
                    const difference = Math.abs(gl1Balance.net - gl2Balance.net);

                    return (
                      <div key={pair.id} className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{pair.pair_name}</h3>
                              {pair.description && (
                                <p className="text-sm text-gray-600 mt-1">{pair.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditPair(pair)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit pair"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeletePair(pair.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete pair"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6 mb-4">
                            {/* GL 1 */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <div className="text-xs text-blue-700 font-semibold mb-2">GL 1</div>
                              <div className="text-sm font-semibold text-gray-900">{getEntityName(pair.gl1_entity)}</div>
                              <div className="text-sm text-gray-700 mt-1">
                                {pair.gl1_code} - {getGLName(pair.gl1_code)}
                              </div>
                              <div className="mt-3 pt-3 border-t border-blue-200">
                                <div className="text-xs text-gray-600">Current Balance:</div>
                                <div className="text-lg font-bold font-mono text-blue-600">
                                  {gl1Balance.net.toLocaleString('en-US', { minimumFractionDigits: 2 })} {gl1Balance.type}
                                </div>
                              </div>
                            </div>

                            {/* GL 2 */}
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <div className="text-xs text-green-700 font-semibold mb-2">GL 2</div>
                              <div className="text-sm font-semibold text-gray-900">{getEntityName(pair.gl2_entity)}</div>
                              <div className="text-sm text-gray-700 mt-1">
                                {pair.gl2_code} - {getGLName(pair.gl2_code)}
                              </div>
                              <div className="mt-3 pt-3 border-t border-green-200">
                                <div className="text-xs text-gray-600">Current Balance:</div>
                                <div className="text-lg font-bold font-mono text-green-600">
                                  {gl2Balance.net.toLocaleString('en-US', { minimumFractionDigits: 2 })} {gl2Balance.type}
                                </div>
                              </div>
                            </div>
                          </div>

                          {difference > 0.01 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                              <div className="flex justify-between items-center">
                                <div className="text-sm text-amber-900">
                                  <span className="font-semibold">Difference:</span> {difference.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                                {pair.difference_gl_code && (
                                  <div className="text-xs text-amber-700">
                                    Will post to: {pair.difference_gl_code}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => openJEFromPair(pair)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                          >
                            <FileText size={18} />
                            Create Elimination Entry
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Journal Entry Modal */}
      {(showJEModal || isJEModalClosing) && (
        <div className={`fixed right-0 top-0 h-full w-[900px] bg-white shadow-2xl z-50 overflow-y-auto ${isJEModalClosing ? 'animate-slideOutRight' : 'animate-slideLeft'}`}>
          <div className="h-full flex flex-col">
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Create Elimination Journal Entry</h3>
                <p className="text-sm text-gray-300 mt-1">Enter elimination entries in journal entry format</p>
              </div>
              <button onClick={closeJEModal} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Entry Name *</label>
                  <input
                    type="text"
                    value={jeForm.entry_name}
                    onChange={(e) => setJEForm({ ...jeForm, entry_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[#101828]"
                    placeholder="e.g., Intercompany Loan Elimination"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={jeForm.entry_date}
                    onChange={(e) => setJEForm({ ...jeForm, entry_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[#101828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={jeForm.description}
                  onChange={(e) => setJEForm({ ...jeForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[#101828]"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">Journal Entry Lines *</label>
                  <button
                    onClick={addJELine}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    Add Line
                  </button>
                </div>

                <div className="bg-gray-100 border border-gray-300 rounded-t-lg p-3">
                  <div className="grid grid-cols-12 gap-3 text-xs font-bold text-gray-700">
                    <div className="col-span-3">Entity</div>
                    <div className="col-span-3">GL Account</div>
                    <div className="col-span-1 text-center">Balance</div>
                    <div className="col-span-2 text-right">Debit</div>
                    <div className="col-span-2 text-right">Credit</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>
                </div>

                <div className="border border-t-0 border-gray-300 rounded-b-lg">
                  {jeForm.lines.map((line, index) => {
                    const availableGLs = getAvailableGLsForEntity(line.entity_id);
                    const balance = getGLBalance(line.gl_code, line.entity_id);

                    return (
                      <div key={index} className={`p-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 last:border-b-0`}>
                        <div className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-3">
                            <select
                              value={line.entity_id}
                              onChange={(e) => updateJELine(index, 'entity_id', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-600 text-[#101828]"
                            >
                              <option value="">Select...</option>
                              {entities.map(entity => (
                                <option key={entity.id} value={entity.id}>{entity.entity_name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-3">
                            <select
                              value={line.gl_code}
                              onChange={(e) => updateJELine(index, 'gl_code', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-600 text-[#101828]"
                              disabled={!line.entity_id}
                            >
                              <option value="">Select...</option>
                              {availableGLs.map(gl => (
                                <option key={gl.id} value={gl.account_code}>
                                  {gl.account_code} - {gl.account_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-1 text-center">
                            {line.gl_code && line.entity_id ? (
                              <div className="text-xs">
                                <div className="font-mono font-bold text-blue-600">
                                  {balance.net.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </div>
                                <div className="text-gray-500">{balance.type}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              value={line.debit || ''}
                              onChange={(e) => updateJELine(index, 'debit', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-right font-mono focus:ring-2 focus:ring-blue-600 text-[#101828]"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              value={line.credit || ''}
                              onChange={(e) => updateJELine(index, 'credit', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-right font-mono focus:ring-2 focus:ring-blue-600 text-[#101828]"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>

                          <div className="col-span-1 text-center">
                            <button
                              onClick={() => removeJELine(index)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Remove line"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 bg-slate-900 text-white rounded-lg p-4">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-7 text-right font-bold">Totals:</div>
                    <div className="col-span-2 text-right font-mono font-bold text-lg">
                      {totals.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="col-span-2 text-right font-mono font-bold text-lg">
                      {totals.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="col-span-1"></div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between items-center">
                    <div className="text-sm">
                      {totals.isBalanced ? (
                        <span className="flex items-center gap-2 text-green-400">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          Balanced
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-red-400">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          Out of Balance
                        </span>
                      )}
                    </div>
                    <div className="text-sm">
                      Difference: <span className={`font-mono font-bold ${totals.isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.abs(totals.difference).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={closeJEModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveJE}
                  disabled={!totals.isBalanced}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  Post Journal Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GL Pair Modal */}
      {(showPairModal || isPairModalClosing) && (
        <div className={`fixed right-0 top-0 h-full w-[700px] bg-white shadow-2xl z-50 overflow-y-auto ${isPairModalClosing ? 'animate-slideOutRight' : 'animate-slideLeft'}`}>
          <div className="h-full flex flex-col">
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{editingPair ? 'Edit' : 'Create'} GL Pair</h3>
                <p className="text-sm text-gray-300 mt-1">Configure GLs that should be eliminated together</p>
              </div>
              <button onClick={closePairModal} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-8 space-y-6 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pair Name *</label>
                <input
                  type="text"
                  value={pairForm.pair_name}
                  onChange={(e) => setPairForm({ ...pairForm, pair_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[#101828]"
                  placeholder="e.g., Share Capital vs Investment"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={pairForm.description}
                  onChange={(e) => setPairForm({ ...pairForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[#101828]"
                  rows={2}
                  placeholder="Description of this pair..."
                />
              </div>

              {/* GL 1 */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="text-sm font-bold text-blue-900 mb-4">GL 1</div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Entity *</label>
                    <select
                      value={pairForm.gl1_entity}
                      onChange={(e) => setPairForm({ ...pairForm, gl1_entity: e.target.value, gl1_code: '' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 text-[#101828]"
                    >
                      <option value="">Select Entity...</option>
                      {entities.map(entity => (
                        <option key={entity.id} value={entity.id}>{entity.entity_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">GL Account *</label>
                    <select
                      value={pairForm.gl1_code}
                      onChange={(e) => setPairForm({ ...pairForm, gl1_code: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 text-[#101828]"
                      disabled={!pairForm.gl1_entity}
                    >
                      <option value="">Select GL...</option>
                      {getAvailableGLsForEntity(pairForm.gl1_entity).map(gl => (
                        <option key={gl.id} value={gl.account_code}>
                          {gl.account_code} - {gl.account_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* GL 2 */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="text-sm font-bold text-green-900 mb-4">GL 2</div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Entity *</label>
                    <select
                      value={pairForm.gl2_entity}
                      onChange={(e) => setPairForm({ ...pairForm, gl2_entity: e.target.value, gl2_code: '' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 text-[#101828]"
                    >
                      <option value="">Select Entity...</option>
                      {entities.map(entity => (
                        <option key={entity.id} value={entity.id}>{entity.entity_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">GL Account *</label>
                    <select
                      value={pairForm.gl2_code}
                      onChange={(e) => setPairForm({ ...pairForm, gl2_code: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 text-[#101828]"
                      disabled={!pairForm.gl2_entity}
                    >
                      <option value="">Select GL...</option>
                      {getAvailableGLsForEntity(pairForm.gl2_entity).map(gl => (
                        <option key={gl.id} value={gl.account_code}>
                          {gl.account_code} - {gl.account_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Difference GL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difference GL (Optional)</label>
                <select
                  value={pairForm.difference_gl_code}
                  onChange={(e) => setPairForm({ ...pairForm, difference_gl_code: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 text-[#101828]"
                >
                  <option value="">None</option>
                  {glAccounts.map(gl => (
                    <option key={gl.id} value={gl.account_code}>
                      {gl.account_code} - {gl.account_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">GL where the difference will be posted if balances don't match</p>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={closePairModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePair}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Save size={18} />
                  {editingPair ? 'Update' : 'Create'} Pair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg animate-slideUp ${
          toast.success ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="font-semibold">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

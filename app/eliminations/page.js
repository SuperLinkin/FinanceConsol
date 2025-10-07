'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  Scissors,
  Plus,
  Trash2,
  Edit3,
  Save,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
  ChevronRight,
  AlertTriangle,
  Info
} from 'lucide-react';

const ELIMINATION_TEMPLATES = [
  {
    id: 'revenue-cogs',
    name: 'Revenue – Cost of Goods Sold',
    description: 'Eliminate intercompany sales and purchases',
    debit_label: 'Intercompany Revenue',
    credit_label: 'Intercompany COGS',
    account_class_debit: 'Income',
    account_class_credit: 'Expenses'
  },
  {
    id: 'receivable-payable',
    name: 'Payables – Receivables',
    description: 'Eliminate intercompany balances',
    debit_label: 'Accounts Payable',
    credit_label: 'Accounts Receivable',
    account_class_debit: 'Liabilities',
    account_class_credit: 'Assets'
  },
  {
    id: 'investment-equity',
    name: 'Investment – Equity',
    description: 'Eliminate investment in subsidiary against equity',
    debit_label: 'Share Capital',
    credit_label: 'Investment in Subsidiary',
    account_class_debit: 'Equity',
    account_class_credit: 'Assets'
  },
  {
    id: 'interest',
    name: 'Interest Income – Interest Expense',
    description: 'Eliminate intercompany interest',
    debit_label: 'Interest Income',
    credit_label: 'Interest Expense',
    account_class_debit: 'Income',
    account_class_credit: 'Expenses'
  },
  {
    id: 'custom',
    name: 'Start from Scratch',
    description: 'Create custom elimination entry',
    debit_label: '',
    credit_label: '',
    account_class_debit: '',
    account_class_credit: ''
  }
];

export default function EliminationsPage() {
  const [showPanel, setShowPanel] = useState(false);
  const [showJEPreview, setShowJEPreview] = useState(null);
  const [entities, setEntities] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [eliminations, setEliminations] = useState([]);
  const [trialBalances, setTrialBalances] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [validationWarnings, setValidationWarnings] = useState([]);

  const [eliminationForm, setEliminationForm] = useState({
    name: '',
    period: '',
    template: '',
    entity_1: '',
    entity_2: '',
    entries: [
      { type: 'Debit', account: '', amount: 0, description: '' }
    ],
    description: ''
  });

  useEffect(() => {
    fetchEntities();
    fetchGLAccounts();
    fetchEliminations();
    fetchTrialBalances();
    generatePeriods();
  }, []);

  useEffect(() => {
    validateElimination();
  }, [eliminationForm.entries, eliminationForm.entity_1, eliminationForm.entity_2]);

  const fetchEntities = async () => {
    try {
      const { data } = await supabase
        .from('entities')
        .select('*')
        .eq('is_active', true)
        .order('entity_name');
      setEntities(data || []);
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  const fetchGLAccounts = async () => {
    try {
      const { data } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('is_active', true)
        .order('account_code');
      setGlAccounts(data || []);
    } catch (error) {
      console.error('Error fetching GL accounts:', error);
    }
  };

  const fetchEliminations = async () => {
    try {
      const { data, error } = await supabase
        .from('eliminations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist yet, just set empty array silently
        setEliminations([]);
        return;
      }
      setEliminations(data || []);
    } catch (error) {
      // Silently handle errors - table might not exist yet
      setEliminations([]);
    }
  };

  const fetchTrialBalances = async () => {
    try {
      const { data } = await supabase
        .from('trial_balance')
        .select('*');
      setTrialBalances(data || []);
    } catch (error) {
      console.error('Error fetching trial balances:', error);
    }
  };

  const generatePeriods = () => {
    const currentYear = new Date().getFullYear();
    const quarters = [];
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let q = 1; q <= 4; q++) {
        quarters.push(`Q${q} ${year}`);
      }
    }
    setPeriods(quarters);
  };

  const validateElimination = () => {
    const warnings = [];

    eliminationForm.entries.forEach((entry, index) => {
      if (!entry.account || !entry.amount) return;

      const account = glAccounts.find(a => a.account_code === entry.account);
      if (!account) return;

      // Check if trying to eliminate accounts from same class (warning)
      const otherEntries = eliminationForm.entries.filter((_, i) => i !== index);
      otherEntries.forEach(otherEntry => {
        if (!otherEntry.account) return;
        const otherAccount = glAccounts.find(a => a.account_code === otherEntry.account);
        if (otherAccount && otherAccount.class_level === account.class_level) {
          if (!warnings.some(w => w.includes('same account class'))) {
            warnings.push(`⚠️ Warning: Eliminating accounts from the same class (${account.class_level}). Ensure this is intentional.`);
          }
        }
      });

      // Check if there's sufficient balance in TB
      if (eliminationForm.entity_1 || eliminationForm.entity_2) {
        const entityId = eliminationForm.entity_1 || eliminationForm.entity_2;
        const tbEntry = trialBalances.find(
          tb => tb.entity_id === entityId && tb.account_code === entry.account
        );

        if (tbEntry) {
          const tbBalance = entry.type === 'Debit'
            ? (tbEntry.debit || 0) - (tbEntry.credit || 0)
            : (tbEntry.credit || 0) - (tbEntry.debit || 0);

          if (Math.abs(tbBalance) < entry.amount) {
            warnings.push(`⚠️ Insufficient balance: ${account.account_name} has balance of ${tbBalance.toFixed(2)}, but elimination amount is ${entry.amount.toFixed(2)}`);
          }
        } else {
          warnings.push(`ℹ️ No trial balance found for ${account.account_name} in selected entity`);
        }
      }
    });

    setValidationWarnings(warnings);
  };

  const handleTemplateSelect = (templateId) => {
    const template = ELIMINATION_TEMPLATES.find(t => t.id === templateId);

    if (template.id === 'custom') {
      setEliminationForm(prev => ({
        ...prev,
        template: templateId,
        entries: [
          { type: 'Debit', account: '', amount: 0, description: '' },
          { type: 'Credit', account: '', amount: 0, description: '' }
        ]
      }));
    } else {
      setEliminationForm(prev => ({
        ...prev,
        template: templateId,
        entries: [
          {
            type: 'Debit',
            account: '',
            amount: 0,
            description: template.debit_label,
            account_class: template.account_class_debit
          },
          {
            type: 'Credit',
            account: '',
            amount: 0,
            description: template.credit_label,
            account_class: template.account_class_credit
          }
        ]
      }));
    }
  };

  const addEntryLine = () => {
    setEliminationForm(prev => ({
      ...prev,
      entries: [
        ...prev.entries,
        { type: 'Debit', account: '', amount: 0, description: '' }
      ]
    }));
  };

  const removeEntryLine = (index) => {
    setEliminationForm(prev => ({
      ...prev,
      entries: prev.entries.filter((_, i) => i !== index)
    }));
  };

  const updateEntry = (index, field, value) => {
    setEliminationForm(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const calculateTotals = () => {
    let totalDebit = 0;
    let totalCredit = 0;

    eliminationForm.entries.forEach(entry => {
      const amount = parseFloat(entry.amount) || 0;
      if (entry.type === 'Debit') {
        totalDebit += amount;
      } else {
        totalCredit += amount;
      }
    });

    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
    const difference = Math.abs(totalDebit - totalCredit);

    return { totalDebit, totalCredit, isBalanced, difference };
  };

  const handleSaveElimination = async () => {
    const totals = calculateTotals();

    if (!totals.isBalanced) {
      alert('Journal entry is not balanced. Total Debit must equal Total Credit.');
      return;
    }

    if (!eliminationForm.name || !eliminationForm.period) {
      alert('Please enter elimination name and period.');
      return;
    }

    if (!eliminationForm.entity_1 || !eliminationForm.entity_2) {
      alert('Please select both Entity 1 and Entity 2. Eliminations must be between two entities.');
      return;
    }

    if (eliminationForm.entity_1 === eliminationForm.entity_2) {
      alert('Entity 1 and Entity 2 must be different entities.');
      return;
    }

    if (eliminationForm.entries.some(e => !e.account || !e.amount)) {
      alert('Please fill in all entry fields.');
      return;
    }

    // Check for critical warnings
    const criticalWarnings = validationWarnings.filter(w => w.includes('Insufficient balance'));
    if (criticalWarnings.length > 0) {
      if (!confirm('There are balance warnings. Do you want to proceed anyway?\n\n' + criticalWarnings.join('\n'))) {
        return;
      }
    }

    try {
      const eliminationData = {
        elimination_name: eliminationForm.name,
        period: eliminationForm.period,
        template_id: eliminationForm.template,
        entity_1_id: eliminationForm.entity_1 || null,
        entity_2_id: eliminationForm.entity_2 || null,
        entries: eliminationForm.entries,
        description: eliminationForm.description,
        total_amount: totals.totalDebit,
        status: 'active',
        is_active: true
      };

      if (editingId) {
        const { error } = await supabase
          .from('eliminations')
          .update(eliminationData)
          .eq('id', editingId);

        if (error) throw error;
        alert('Elimination updated successfully!');
      } else {
        const { error } = await supabase
          .from('eliminations')
          .insert(eliminationData);

        if (error) throw error;
        alert('Elimination saved successfully!');
      }

      resetForm();
      fetchEliminations();
      setShowPanel(false);
    } catch (error) {
      console.error('Error saving elimination:', error);
      alert('Failed to save elimination: ' + error.message);
    }
  };

  const resetForm = () => {
    setEliminationForm({
      name: '',
      period: '',
      template: '',
      entity_1: '',
      entity_2: '',
      entries: [
        { type: 'Debit', account: '', amount: 0, description: '' }
      ],
      description: ''
    });
    setEditingId(null);
    setValidationWarnings([]);
  };

  const handleEdit = (elim) => {
    setEliminationForm({
      name: elim.elimination_name,
      period: elim.period,
      template: elim.template_id || '',
      entity_1: elim.entity_1_id || '',
      entity_2: elim.entity_2_id || '',
      entries: elim.entries || [],
      description: elim.description || ''
    });
    setEditingId(elim.id);
    setShowPanel(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this elimination entry?')) return;

    try {
      const { error } = await supabase
        .from('eliminations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Elimination deleted successfully!');
      fetchEliminations();
    } catch (error) {
      console.error('Error deleting elimination:', error);
      alert('Failed to delete elimination: ' + error.message);
    }
  };

  const handleAddNew = () => {
    resetForm();
    setShowPanel(true);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
    resetForm();
  };

  const getAccountDisplay = (accountCode) => {
    const account = glAccounts.find(a => a.account_code === accountCode);
    return account ? `${account.account_code} - ${account.account_name}` : accountCode;
  };

  const getEntityName = (entityId) => {
    const entity = entities.find(e => e.id === entityId);
    return entity ? entity.entity_name : 'N/A';
  };

  const getTemplateName = (templateId) => {
    const template = ELIMINATION_TEMPLATES.find(t => t.id === templateId);
    return template ? template.name : 'Custom';
  };

  const getFilteredAccounts = (accountClass) => {
    if (!accountClass) return glAccounts;
    return glAccounts.filter(acc => acc.class_level === accountClass);
  };

  const totals = calculateTotals();

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader title="Eliminations" subtitle="Manage intercompany eliminations and adjustments" />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div />
            <button
              onClick={handleAddNew}
              className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus size={20} />
              Add Elimination
            </button>
          </div>

          {/* Active Eliminations List */}
          <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Elimination Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Template</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Period</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Amount</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {eliminations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-20 text-center">
                        <Scissors size={64} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 font-semibold text-lg mb-2">No elimination entries yet</p>
                        <p className="text-gray-400">Click &quot;Add Elimination&quot; to create your first entry</p>
                      </td>
                    </tr>
                  ) : (
                    eliminations.map((elim) => {
                      const elimTotals = {
                        totalDebit: 0,
                        totalCredit: 0
                      };

                      (elim.entries || []).forEach(entry => {
                        const amount = parseFloat(entry.amount) || 0;
                        if (entry.type === 'Debit') {
                          elimTotals.totalDebit += amount;
                        } else {
                          elimTotals.totalCredit += amount;
                        }
                      });

                      const isBalanced = Math.abs(elimTotals.totalDebit - elimTotals.totalCredit) < 0.01;

                      return (
                        <tr key={elim.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{elim.elimination_name}</div>
                            {elim.description && (
                              <div className="text-xs text-gray-500 mt-1">{elim.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {getTemplateName(elim.template_id)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {elim.period || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-mono text-gray-900 font-semibold">
                            {(elim.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isBalanced ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                                <CheckCircle size={14} />
                                Balanced
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                                <AlertCircle size={14} />
                                Out of Balance
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setShowJEPreview(elim)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Journal Entry"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleEdit(elim)}
                                className="p-2 text-[#101828] hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(elim.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Panel for Add/Edit */}
      {showPanel && (
        <>
          {/* Side Panel */}
          <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-50 overflow-y-auto animate-slideLeft">
            <div className="sticky top-0 bg-slate-900 text-white px-8 py-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold">
                  {editingId ? 'Edit Elimination' : 'New Elimination'}
                </h2>
                <p className="text-sm text-gray-300 mt-1">Configure elimination entry details</p>
              </div>
              <button
                onClick={handleClosePanel}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose Template
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {ELIMINATION_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        eliminationForm.template === template.id
                          ? 'border-[#101828] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{template.name}</div>
                          <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                        </div>
                        {eliminationForm.template === template.id && (
                          <CheckCircle size={20} className="text-[#101828]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {eliminationForm.template && (
                <>
                  {/* Elimination Details */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Elimination Name *
                      </label>
                      <input
                        type="text"
                        value={eliminationForm.name}
                        onChange={(e) => setEliminationForm({ ...eliminationForm, name: e.target.value })}
                        placeholder="e.g., Q1 2025 Revenue Elimination"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Period *
                      </label>
                      <select
                        value={eliminationForm.period}
                        onChange={(e) => setEliminationForm({ ...eliminationForm, period: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                      >
                        <option value="">Select period...</option>
                        {periods.map(period => (
                          <option key={period} value={period}>{period}</option>
                        ))}
                      </select>
                    </div>

                    {/* Entity Selection - Always shown for ALL templates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Entity 1 <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={eliminationForm.entity_1}
                            onChange={(e) => setEliminationForm({ ...eliminationForm, entity_1: e.target.value })}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                          >
                            <option value="">Select entity 1...</option>
                            {entities.map(entity => (
                              <option key={entity.id} value={entity.id}>{entity.entity_name}</option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Sender entity (e.g., selling entity)</p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Entity 2 <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={eliminationForm.entity_2}
                            onChange={(e) => setEliminationForm({ ...eliminationForm, entity_2: e.target.value })}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                          >
                            <option value="">Select entity 2...</option>
                            {entities.filter(e => e.id !== eliminationForm.entity_1).map(entity => (
                              <option key={entity.id} value={entity.id}>{entity.entity_name}</option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Receiver entity (e.g., buying entity)</p>
                        </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        value={eliminationForm.description}
                        onChange={(e) => setEliminationForm({ ...eliminationForm, description: e.target.value })}
                        placeholder="Add notes..."
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Journal Entry Lines */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-semibold text-gray-700">
                        Journal Entry Lines *
                      </label>
                      {eliminationForm.template === 'custom' && (
                        <button
                          onClick={addEntryLine}
                          className="text-sm text-[#101828] hover:underline font-semibold flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add Line
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {eliminationForm.entries.map((entry, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                  Type
                                </label>
                                <select
                                  value={entry.type}
                                  onChange={(e) => updateEntry(index, 'type', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                                >
                                  <option value="Debit">Debit</option>
                                  <option value="Credit">Credit</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                  Amount *
                                </label>
                                <input
                                  type="number"
                                  value={entry.amount}
                                  onChange={(e) => updateEntry(index, 'amount', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 font-mono"
                                  step="0.01"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                {entry.description || 'GL Account'} *
                              </label>
                              <select
                                value={entry.account}
                                onChange={(e) => updateEntry(index, 'account', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                              >
                                <option value="">Select account...</option>
                                {getFilteredAccounts(entry.account_class).map(account => (
                                  <option key={account.account_code} value={account.account_code}>
                                    {account.account_code} - {account.account_name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {eliminationForm.template === 'custom' && (
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                  Description
                                </label>
                                <input
                                  type="text"
                                  value={entry.description}
                                  onChange={(e) => updateEntry(index, 'description', e.target.value)}
                                  placeholder="e.g., Eliminate intercompany sales"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                                />
                              </div>
                            )}

                            {eliminationForm.template === 'custom' && eliminationForm.entries.length > 2 && (
                              <button
                                onClick={() => removeEntryLine(index)}
                                className="text-xs text-red-600 hover:underline font-semibold flex items-center gap-1"
                              >
                                <Trash2 size={14} />
                                Remove Line
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Validation Warnings */}
                  {validationWarnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-yellow-900 mb-2">Validation Warnings</h4>
                          <ul className="space-y-1 text-xs text-yellow-800">
                            {validationWarnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Journal Entry Preview */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-blue-900">Journal Entry Impact</h3>
                      {totals.isBalanced ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                          <CheckCircle size={12} />
                          Balanced
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          <AlertCircle size={12} />
                          Out of Balance
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      {eliminationForm.entries.map((entry, index) => (
                        entry.account && entry.amount > 0 && (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-blue-100 last:border-0">
                            <div className="flex-1">
                              <div className="font-semibold text-blue-900">
                                {entry.type}: {getAccountDisplay(entry.account)}
                              </div>
                              {entry.description && (
                                <div className="text-blue-700 mt-0.5">{entry.description}</div>
                              )}
                            </div>
                            <div className="font-mono font-semibold text-blue-900">
                              {entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        )
                      ))}

                      <div className="flex items-center justify-between pt-3 border-t-2 border-blue-300">
                        <div className="font-bold text-blue-900">Totals</div>
                        <div className="text-right">
                          <div className="font-mono text-xs text-blue-800">
                            Dr: {totals.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="font-mono text-xs text-blue-800">
                            Cr: {totals.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      {!totals.isBalanced && totals.difference > 0 && (
                        <div className="flex items-center justify-between pt-2 text-red-700">
                          <div className="font-semibold">Difference</div>
                          <div className="font-mono font-semibold">
                            {totals.difference.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleClosePanel}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveElimination}
                      disabled={!totals.isBalanced || !eliminationForm.name || !eliminationForm.period}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                    >
                      <Save size={18} />
                      {editingId ? 'Update' : 'Save'} Elimination
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* JE Preview Modal */}
      {showJEPreview && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowJEPreview(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
              <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{showJEPreview.elimination_name}</h3>
                  <p className="text-sm text-gray-300 mt-1">Journal Entry Preview</p>
                </div>
                <button
                  onClick={() => setShowJEPreview(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(80vh-100px)]">
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Account</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Debit</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(showJEPreview.entries || []).map((entry, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {getAccountDisplay(entry.account)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {entry.description || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono text-gray-900">
                            {entry.type === 'Debit' && entry.amount ?
                              entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
                              '-'
                            }
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono text-gray-900">
                            {entry.type === 'Credit' && entry.amount ?
                              entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
                              '-'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan="2" className="px-4 py-3 text-sm font-bold text-gray-900">
                          Totals
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold font-mono text-gray-900">
                          {(showJEPreview.entries || []).reduce((sum, e) =>
                            e.type === 'Debit' ? sum + (parseFloat(e.amount) || 0) : sum, 0
                          ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold font-mono text-gray-900">
                          {(showJEPreview.entries || []).reduce((sum, e) =>
                            e.type === 'Credit' ? sum + (parseFloat(e.amount) || 0) : sum, 0
                          ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {showJEPreview.description && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Description</h4>
                    <p className="text-sm text-blue-800">{showJEPreview.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

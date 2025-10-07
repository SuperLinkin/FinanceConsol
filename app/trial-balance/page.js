'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Download, Trash2, FileText, Edit2, Check, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function TrialBalancePage() {
  const [trialBalances, setTrialBalances] = useState([]);
  const [filteredTBs, setFilteredTBs] = useState([]);
  const [entities, setEntities] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEntity, setFilterEntity] = useState('All Entities');
  const [filterPeriod, setFilterPeriod] = useState('All Periods');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ debit: '', credit: '' });
  const [editingClassId, setEditingClassId] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');

  // Available class names
  const availableClasses = ['Assets', 'Liability', 'Equity', 'Intercompany', 'Revenue', 'Income', 'Expenses'];

  const fetchAllData = async () => {
    try {
      setLoading(true);

      console.log('=== FETCHING DATA ===', new Date().toLocaleTimeString());

      // Fetch trial balances with chart of accounts
      const { data: tbData, error: tbError } = await supabase
        .from('trial_balance')
        .select('*')
        .order('period', { ascending: false })
        .order('account_code');

      if (tbError) throw tbError;

      console.log('Fetched', tbData?.length, 'trial balance records');

      // Fetch chart of accounts to get class information
      const { data: coaData } = await supabase
        .from('chart_of_accounts')
        .select('account_code, class_name, subclass_name, note_name, subnote_name');

      // Fetch COA master hierarchy
      const { data: masterData } = await supabase
        .from('coa_master_hierarchy')
        .select('class_name, subclass_name, note_name, subnote_name');

      // Create lookup maps
      const coaMap = {};
      (coaData || []).forEach(coa => {
        coaMap[coa.account_code] = coa;
      });

      // Enrich trial balance data with COA class info
      const enrichedTBs = (tbData || []).map(tb => ({
        ...tb,
        class_name: coaMap[tb.account_code]?.class_name || null,
        subclass_name: coaMap[tb.account_code]?.subclass_name || null,
        note_name: coaMap[tb.account_code]?.note_name || null,
        subnote_name: coaMap[tb.account_code]?.subnote_name || null
      }));

      console.log('Setting trialBalances with', enrichedTBs?.length, 'enriched records');
      setTrialBalances(enrichedTBs);

      // Fetch entities for filter
      const { data: entitiesData } = await supabase
        .from('entities')
        .select('id, entity_code, entity_name')
        .order('entity_name');

      setEntities(entitiesData || []);
      console.log('=== DATA FETCH COMPLETE ===');

      // Extract unique periods
      const uniquePeriods = [...new Set(enrichedTBs.map(tb => tb.period))].filter(p => p).sort().reverse();
      setPeriods(uniquePeriods);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    console.log('=== APPLYING FILTERS ===', new Date().toLocaleTimeString());
    console.log('Trial balances count:', trialBalances.length);

    let filtered = [...trialBalances];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tb =>
        tb.account_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tb.account_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Entity filter
    if (filterEntity !== 'All Entities') {
      const selectedEntity = entities.find(e => e.entity_name === filterEntity);
      if (selectedEntity) {
        filtered = filtered.filter(tb => tb.entity_id === selectedEntity.id);
      }
    }

    // Period filter
    if (filterPeriod !== 'All Periods') {
      filtered = filtered.filter(tb => tb.period === filterPeriod);
    }

    console.log('After filters, count:', filtered.length);
    setFilteredTBs(filtered);
  }, [trialBalances, searchQuery, filterEntity, filterPeriod, entities]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this trial balance entry?')) return;

    try {
      const { error } = await supabase
        .from('trial_balance')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Trial balance entry deleted successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting trial balance:', error);
      alert('Error deleting trial balance entry: ' + error.message);
    }
  };

  const handleEdit = (tb) => {
    setEditingId(tb.id);
    setEditValues({
      debit: tb.debit || 0,
      credit: tb.credit || 0
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({ debit: '', credit: '' });
  };

  const handleSaveEdit = async (id) => {
    try {
      const debit = parseFloat(editValues.debit) || 0;
      const credit = parseFloat(editValues.credit) || 0;

      console.log('Saving edit - ID:', id, 'Debit:', debit, 'Credit:', credit);

      const { error } = await supabase
        .from('trial_balance')
        .update({
          debit: debit,
          credit: credit
        })
        .eq('id', id);

      if (error) throw error;

      console.log('Update successful, fetching fresh data...');

      // Reset edit state first
      setEditingId(null);
      setEditValues({ debit: '', credit: '' });

      // Fetch updated data
      await fetchAllData();

      console.log('Data refreshed, trialBalances length:', trialBalances.length);
      console.log('Filtered TBs length:', filteredTBs.length);

      // Show success message after data is refreshed
      alert('Trial balance entry updated successfully! Metrics have been recalculated.');
    } catch (error) {
      console.error('Error updating trial balance:', error);
      alert('Error updating trial balance entry: ' + error.message);
    }
  };

  const handleAssignClass = (tb) => {
    setEditingClassId(tb.id);
    setSelectedClass(tb.class_name || '');
  };

  const handleSaveClass = async (tb) => {
    try {
      if (!selectedClass) {
        alert('Please select a class');
        return;
      }

      // Check if this account code exists in COA
      const { data: existingCOA, error: checkError } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('account_code', tb.account_code)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw checkError;
      }

      if (existingCOA) {
        // Update existing COA entry
        const { error: updateError } = await supabase
          .from('chart_of_accounts')
          .update({ class_name: selectedClass })
          .eq('account_code', tb.account_code);

        if (updateError) throw updateError;
      } else {
        // Insert new COA entry
        const { error: insertError } = await supabase
          .from('chart_of_accounts')
          .insert({
            account_code: tb.account_code,
            account_name: tb.account_name,
            class_name: selectedClass
          });

        if (insertError) throw insertError;
      }

      // Reset state and refresh data
      setEditingClassId(null);
      setSelectedClass('');
      await fetchAllData();

      alert(`Class "${selectedClass}" assigned to GL ${tb.account_code} successfully!`);
    } catch (error) {
      console.error('Error assigning class:', error);
      alert('Error assigning class: ' + error.message);
    }
  };

  const handleCancelClass = () => {
    setEditingClassId(null);
    setSelectedClass('');
  };

  const handleExport = () => {
    // Create CSV content with class hierarchy
    const headers = ['Entity', 'Period', 'GL Code', 'GL Name', 'Class', 'Sub-Class', 'Note', 'Sub-Note', 'Debit', 'Credit', 'Net (Dr-Cr)'];
    const rows = filteredTBs.map(tb => {
      const debit = parseFloat(tb.debit || 0);
      const credit = parseFloat(tb.credit || 0);
      const net = debit - credit;

      return [
        getEntityName(tb),
        tb.period || '',
        tb.account_code || '',
        tb.account_name || '',
        tb.class_name || '',
        tb.subclass_name || '',
        tb.note_name || '',
        tb.subnote_name || '',
        debit,
        credit,
        net
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial_balance_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    alert(`Exported ${filteredTBs.length} records. Compare this with your original Excel file.`);
  };

  const formatNumber = (num) => {
    if (!num) return '0.00';
    return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getEntityName = (tb) => {
    if (tb.entities?.entity_name) return tb.entities.entity_name;
    const entity = entities.find(e => e.id === tb.entity_id);
    return entity?.entity_name || tb.entity_id || '—';
  };

  // Calculate financial metrics - Using actual class names from COA
  const calculateMetrics = () => {
    // Use dynamic object to store balances by class name
    const balancesByClass = {};

    const totalDebit = filteredTBs.reduce((sum, tb) => sum + parseFloat(tb.debit || 0), 0);
    const totalCredit = filteredTBs.reduce((sum, tb) => sum + parseFloat(tb.credit || 0), 0);

    if (typeof window !== 'undefined') {
      console.log('=== CALCULATING METRICS ===', new Date().toLocaleTimeString());
      console.log('Filtered TBs count:', filteredTBs.length);
      console.log('Total Debit:', totalDebit);
      console.log('Total Credit:', totalCredit);
      console.log('=== RAW DATA SAMPLE (First 10 records) ===');
      filteredTBs.slice(0, 10).forEach((tb, i) => {
        console.log(`Record ${i + 1}:`, {
          code: tb.account_code,
          name: tb.account_name,
          class: tb.class_name,
          debit: tb.debit,
          credit: tb.credit,
          debitType: typeof tb.debit,
          creditType: typeof tb.credit
        });
      });
    }

    filteredTBs.forEach(tb => {
      const className = tb.class_name || 'Unknown';
      const debit = parseFloat(tb.debit || 0);
      const credit = parseFloat(tb.credit || 0);
      const netAmount = debit - credit;

      if (!balancesByClass[className]) {
        balancesByClass[className] = 0;
      }
      balancesByClass[className] += netAmount;
    });

    // Extract values using exact class names from your data
    const assets = balancesByClass['Assets'] || 0;
    const liability = balancesByClass['Liability'] || 0;
    const equity = balancesByClass['Equity'] || 0;
    const intercompany = balancesByClass['Intercompany'] || 0;
    const revenue = (balancesByClass['Revenue'] || 0) + (balancesByClass['Income'] || 0);
    const expenses = balancesByClass['Expenses'] || 0;
    const unknown = balancesByClass['Unknown'] || 0;

    // P&L: Revenue + Expenses = Profit/Loss
    // (Expenses are already stored as negative numbers)
    const profitLoss = revenue + expenses;

    // BS Check: Assets + Intercompany + Liability + Equity - P&L = 0
    // (Liability and Equity are already stored as negative numbers)
    // P&L is subtracted because retained earnings (P&L) is a credit balance like Equity
    const bsCheck = assets + intercompany + liability + equity - profitLoss;

    if (typeof window !== 'undefined') {
      console.log('=== CALCULATION RESULTS ===');
      console.log('Balances by Class:', balancesByClass);
      console.log('BS Check Calculation: Assets + Intercompany + Liability + Equity - P&L');
      console.log(`  ${assets} + ${intercompany} + ${liability} + ${equity} - ${profitLoss} = ${bsCheck}`);
      console.log('P&L Calculation: Revenue + Expenses');
      console.log(`  ${revenue} + ${expenses} = ${profitLoss}`);
      console.log('Financial Breakdown:', {
        assets,
        liability,
        equity,
        intercompany,
        revenue,
        expenses,
        unknown,
        bsCheck,
        profitLoss,
        totalDebit,
        totalCredit
      });
    }

    return {
      assets,
      expenses,
      intercompany,
      equity,
      liabilities: liability,
      revenue,
      unknown,
      bsCheck,
      profitLoss,
      totalDebit,
      totalCredit
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="text-[#101828] text-lg">Loading trial balances...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <PageHeader
        title="Trial Balance Viewer"
        subtitle="View and manage uploaded trial balances"
      />

      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Filters & Search */}
        <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-4 gap-4">
            {/* Search */}
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Account
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Code or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                />
              </div>
            </div>

            {/* Entity Filter */}
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Entity
              </label>
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
              >
                <option>All Entities</option>
                {entities.map(entity => (
                  <option key={entity.id} value={entity.entity_name}>
                    {entity.entity_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Filter */}
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Period
              </label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
              >
                <option>All Periods</option>
                {periods.map(period => (
                  <option key={period} value={period}>
                    {formatDate(period)}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <div className="col-span-1 flex items-end">
              <button
                onClick={handleExport}
                disabled={filteredTBs.length === 0}
                className="w-full px-6 py-3 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700 font-semibold">Total Records</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {filteredTBs.length.toLocaleString()}
              </div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="text-sm text-emerald-700 font-semibold">Total Debit</div>
              <div className="text-2xl font-bold text-emerald-900 mt-1">
                {formatNumber(metrics.totalDebit)}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-700 font-semibold">Total Credit</div>
              <div className="text-2xl font-bold text-purple-900 mt-1">
                {formatNumber(metrics.totalCredit)}
              </div>
            </div>
            <div className={`rounded-lg p-4 ${Math.abs(metrics.totalDebit - metrics.totalCredit) < 0.01 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`text-sm font-semibold ${Math.abs(metrics.totalDebit - metrics.totalCredit) < 0.01 ? 'text-green-700' : 'text-red-700'}`}>
                TB Balance
              </div>
              <div className={`text-2xl font-bold mt-1 ${Math.abs(metrics.totalDebit - metrics.totalCredit) < 0.01 ? 'text-green-900' : 'text-red-900'}`}>
                {formatNumber(Math.abs(metrics.totalDebit - metrics.totalCredit))}
                {Math.abs(metrics.totalDebit - metrics.totalCredit) >= 0.01 && (
                  <span className="text-xs ml-2">⚠️ Out of Balance</span>
                )}
              </div>
            </div>
          </div>

          {/* Financial Checks */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className={`rounded-lg p-4 ${Math.abs(metrics.bsCheck) < 0.01 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm font-semibold ${Math.abs(metrics.bsCheck) < 0.01 ? 'text-green-700' : 'text-red-700'}`}>
                    Balance Sheet Check
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Assets + Intercompany + Liability + Equity - P&L = 0
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${Math.abs(metrics.bsCheck) < 0.01 ? 'text-green-900' : 'text-red-900'}`}>
                    {formatNumber(Math.abs(metrics.bsCheck))}
                  </div>
                  {Math.abs(metrics.bsCheck) < 0.01 ? (
                    <span className="text-xs text-green-700">✓ Balanced</span>
                  ) : (
                    <span className="text-xs text-red-700">⚠️ Not Balanced</span>
                  )}
                </div>
              </div>
            </div>

            <div className={`rounded-lg p-4 ${metrics.profitLoss >= 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-amber-50 border-2 border-amber-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm font-semibold ${metrics.profitLoss >= 0 ? 'text-green-700' : 'text-amber-700'}`}>
                    Profit & Loss
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Revenue + Expenses
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${metrics.profitLoss >= 0 ? 'text-green-900' : 'text-amber-900'}`}>
                    {formatNumber(Math.abs(metrics.profitLoss))}
                  </div>
                  <span className={`text-xs ${metrics.profitLoss >= 0 ? 'text-green-700' : 'text-amber-700'}`}>
                    {metrics.profitLoss >= 0 ? '✓ Profit' : '⚠️ Loss'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trial Balance Table */}
        <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#101828] text-white">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-bold">GL Code</th>
                  <th className="px-4 py-4 text-left text-sm font-bold">GL Name</th>
                  <th className="px-4 py-4 text-left text-sm font-bold">Class</th>
                  <th className="px-4 py-4 text-left text-sm font-bold">Sub-Class</th>
                  <th className="px-4 py-4 text-left text-sm font-bold">Note</th>
                  <th className="px-4 py-4 text-left text-sm font-bold">Sub-Note</th>
                  <th className="px-4 py-4 text-right text-sm font-bold">Debit</th>
                  <th className="px-4 py-4 text-right text-sm font-bold">Credit</th>
                  <th className="px-4 py-4 text-center text-sm font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTBs.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-16 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <div className="text-lg font-semibold">No trial balance records found</div>
                      <div className="text-sm mt-2">Upload trial balances in the Upload page</div>
                    </td>
                  </tr>
                ) : (
                  filteredTBs.map((tb, index) => (
                    <tr
                      key={tb.id}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                    >
                      <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-900">
                        {tb.account_code}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {tb.account_name}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {editingClassId === tb.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedClass}
                              onChange={(e) => setSelectedClass(e.target.value)}
                              className="px-2 py-1 border border-orange-300 rounded text-xs focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="">Select Class...</option>
                              {availableClasses.map(cls => (
                                <option key={cls} value={cls}>{cls}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleSaveClass(tb)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Save Class"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={handleCancelClass}
                              className="text-gray-600 hover:text-gray-800 p-1"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : tb.class_name ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                            {tb.class_name}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAssignClass(tb)}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded font-semibold hover:bg-red-200 transition-colors"
                            title="Click to assign class"
                          >
                            Assign Class
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {tb.subclass_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {tb.note_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {tb.subnote_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-gray-900">
                        {editingId === tb.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editValues.debit}
                            onChange={(e) => setEditValues({ ...editValues, debit: e.target.value })}
                            className="w-full px-2 py-1 border border-blue-300 rounded text-right focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          formatNumber(tb.debit)
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-gray-900">
                        {editingId === tb.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editValues.credit}
                            onChange={(e) => setEditValues({ ...editValues, credit: e.target.value })}
                            className="w-full px-2 py-1 border border-blue-300 rounded text-right focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          formatNumber(tb.credit)
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {editingId === tb.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(tb.id)}
                                className="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded-lg transition-colors"
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(tb)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(tb.id)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

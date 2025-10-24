'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Download, Trash2, FileText, Edit2, Check, X, Calculator, RefreshCw } from 'lucide-react';
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

  // Rounding states
  const [showRoundingPanel, setShowRoundingPanel] = useState(false);
  const [isRoundingPanelClosing, setIsRoundingPanelClosing] = useState(false);
  const [roundingMethod, setRoundingMethod] = useState('nearest'); // 'nearest', 'up', 'down'
  const [roundingPrecision, setRoundingPrecision] = useState('0'); // 0, 1, 2 decimals
  const [differenceAccount, setDifferenceAccount] = useState(''); // GL account code
  const [createNewGL, setCreateNewGL] = useState(false);
  const [newGLDetails, setNewGLDetails] = useState({
    account_code: '',
    account_name: 'Rounding Difference',
    class_name: 'Expenses',
    subclass_name: '',
    note_name: '',
    subnote_name: ''
  });
  const [glAccounts, setGlAccounts] = useState([]);

  // Available class names
  const availableClasses = ['Assets', 'Liability', 'Equity', 'Intercompany', 'Revenue', 'Income', 'Expenses'];

  // Helper functions for panel animations
  const closeRoundingPanel = () => {
    setIsRoundingPanelClosing(true);
    setTimeout(() => {
      setShowRoundingPanel(false);
      setIsRoundingPanelClosing(false);
    }, 300); // Match animation duration
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);

      console.log('=== FETCHING DATA ===', new Date().toLocaleTimeString());

      // Fetch trial balances via API to bypass RLS
      const tbResponse = await fetch('/api/trial-balance');
      const tbData = await tbResponse.json();

      console.log('Fetched', tbData?.length, 'trial balance records');

      // Fetch chart of accounts to get class information
      const { data: coaData } = await supabase
        .from('chart_of_accounts')
        .select('account_code, account_name, class_name, subclass_name, note_name, subnote_name');

      // Store GL accounts for rounding feature
      setGlAccounts(coaData || []);

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

      // Fetch entities via API
      const entitiesResponse = await fetch('/api/entities');
      const entitiesData = await entitiesResponse.json();
      const entities = Array.isArray(entitiesData) ? entitiesData : (entitiesData.data || []);

      setEntities(entities);
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

      // Use API endpoint instead of direct Supabase call
      const response = await fetch('/api/trial-balance', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, debit, credit }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update trial balance');
      }

      console.log('Update successful, fetching fresh data...');

      // Fetch updated data first
      await fetchAllData();

      // Then reset edit state - this ensures the UI shows the new values
      setEditingId(null);
      setEditValues({ debit: '', credit: '' });

      // Small delay to ensure state updates are complete before showing alert
      setTimeout(() => {
        alert('Trial balance entry updated successfully! Metrics have been recalculated.');
      }, 100);
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

  // Calculate class-based totals using proper accounting sign conventions
  const calculateMetrics = () => {
    let totalAssetsDebits = 0;
    let totalAssetsCredits = 0;
    let totalLiabilityDebits = 0;
    let totalLiabilityCredits = 0;
    let totalEquityDebits = 0;
    let totalEquityCredits = 0;
    let totalRevenueDebits = 0;
    let totalRevenueCredits = 0;
    let totalExpensesDebits = 0;
    let totalExpensesCredits = 0;

    filteredTBs.forEach(tb => {
      const className = tb.class_name || '';
      // Use absolute values since debits are positive and credits are negative in DB
      const debit = Math.abs(parseFloat(tb.debit || 0));
      const credit = Math.abs(parseFloat(tb.credit || 0));

      // Sum up debits and credits separately by class
      if (className === 'Assets') {
        totalAssetsDebits += debit;
        totalAssetsCredits += credit;
      } else if (className === 'Liability') {
        totalLiabilityDebits += debit;
        totalLiabilityCredits += credit;
      } else if (className === 'Equity') {
        totalEquityDebits += debit;
        totalEquityCredits += credit;
      } else if (className === 'Revenue' || className === 'Income') {
        totalRevenueDebits += debit;
        totalRevenueCredits += credit;
      } else if (className === 'Expenses') {
        totalExpensesDebits += debit;
        totalExpensesCredits += credit;
      }
    });

    // Assets = (Total Debits) - (Total Credits)
    // Assets carry a debit balance, so Debits > Credits means positive asset
    const totalAssets = totalAssetsDebits - totalAssetsCredits;

    // Equity = (Total Credits) - (Total Debits)
    // Equity carries a credit balance, so Credits > Debits means positive equity
    const totalEquity = totalEquityCredits - totalEquityDebits;

    // Liabilities = (Total Credits) - (Total Debits)
    // Liabilities carry a credit balance, so Credits > Debits means positive liability
    const totalLiability = totalLiabilityCredits - totalLiabilityDebits;

    // Revenue = (Total Credits) - (Total Debits)
    // If Credits > Debits → Revenue is positive (credit balance)
    const totalRevenue = totalRevenueCredits - totalRevenueDebits;

    // Expenses = (Total Debits) - (Total Credits)
    // If Debits > Credits → Expense is positive (debit balance)
    const totalExpenses = totalExpensesDebits - totalExpensesCredits;

    // Profit or Loss = Revenue - Expenses
    // If positive → profit (credit balance, added to Equity as Retained Earnings)
    // If negative → loss (debit balance, reduces Equity)
    const profitLoss = totalRevenue - totalExpenses;

    // Balance Sheet Check: Assets - Equity - Liabilities - P&L = 0
    // This automatically adjusts for sign conventions
    // If Equity is negative (losses), the rule still holds: Assets - (-Equity) - Liabilities - P&L = 0
    const bsCheck = totalAssets - totalEquity - totalLiability - profitLoss;

    return {
      totalAssets,
      totalLiability,
      totalEquity,
      totalRevenue,
      totalExpenses,
      profitLoss,
      bsCheck
    };
  };

  const metrics = calculateMetrics();


  const handleSwapDebitCredit = async () => {
    if (filterEntity === 'All Entities') {
      alert('Please select a specific entity');
      return;
    }

    if (filterPeriod === 'All Periods') {
      alert('Please select a specific period');
      return;
    }

    const confirmSwap = confirm(
      `Are you sure you want to swap Debits and Credits for all entries in ${filterPeriod}?\n\nThis will:\n- Convert all Debits to Credits\n- Convert all Credits to Debits\n\nThis action is for fixing data that was uploaded with columns flipped.`
    );

    if (!confirmSwap) return;

    try {
      setLoading(true);

      const selectedEntity = entities.find(e => e.entity_name === filterEntity);

      const response = await fetch('/api/trial-balance/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityId: selectedEntity.id,
          period: filterPeriod
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to swap debits and credits');
      }

      alert(`Success! Swapped debits and credits for ${result.updatedCount} entries.\n\nThe page will now refresh with corrected data.`);
      await fetchAllData();

    } catch (error) {
      console.error('Error swapping debits/credits:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoundBalances = async () => {
    if (!differenceAccount && !createNewGL) {
      alert('Please select or create a GL account for rounding differences');
      return;
    }

    if (createNewGL && (!newGLDetails.account_code || !newGLDetails.account_name)) {
      alert('Please enter account code and name for the new GL');
      return;
    }

    // Check that entity and period are selected
    if (filterEntity === 'All Entities') {
      alert('Please select a specific entity for rounding');
      return;
    }

    if (filterPeriod === 'All Periods') {
      alert('Please select a specific period for rounding');
      return;
    }

    try {
      setLoading(true);

      const selectedEntity = entities.find(e => e.entity_name === filterEntity);
      const differenceAccountName = createNewGL
        ? newGLDetails.account_name
        : glAccounts.find(gl => gl.account_code === differenceAccount)?.account_name;

      // Call API endpoint for rounding
      const response = await fetch('/api/trial-balance/round', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roundingMethod,
          roundingPrecision,
          differenceAccountCode: createNewGL ? newGLDetails.account_code : differenceAccount,
          differenceAccountName,
          entityId: selectedEntity.id,
          period: filterPeriod,
          createNewGL,
          newGLDetails: createNewGL ? newGLDetails : null
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to round balances');
      }

      const precision = parseInt(roundingPrecision);
      alert(`Rounded ${result.updatedCount} entries. Total difference: ${result.totalDifference.toFixed(precision + 2)} posted to ${result.targetAccount}`);

      setShowRoundingPanel(false);
      await fetchAllData();
    } catch (error) {
      console.error('Error rounding balances:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="grid grid-cols-7 gap-4">
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

            {/* Swap Dr/Cr Button */}
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fix Data
              </label>
              <button
                onClick={handleSwapDebitCredit}
                disabled={filterEntity === 'All Entities' || filterPeriod === 'All Periods'}
                className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                title="Swap Debits and Credits for selected period (use if data was uploaded with columns flipped)"
              >
                <RefreshCw className="w-5 h-5" />
                Swap Dr/Cr
              </button>
            </div>

            {/* Round Balances Button */}
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Actions
              </label>
              <button
                onClick={() => setShowRoundingPanel(true)}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                title="Round off balances and post difference to a GL account"
              >
                <Calculator className="w-5 h-5" />
                Round Off
              </button>
            </div>

            {/* Export Button */}
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                &nbsp;
              </label>
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

          {/* Summary Stats - Class Totals */}
          <div className="mt-6 space-y-4">
            {/* Balance Sheet Items */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Balance Sheet</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="text-sm text-blue-700 font-semibold">Assets</div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">
                    {formatNumber(Math.abs(metrics.totalAssets))}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <div className="text-sm text-red-700 font-semibold">Liabilities</div>
                  <div className="text-2xl font-bold text-red-900 mt-1">
                    {formatNumber(Math.abs(metrics.totalLiability))}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <div className="text-sm text-purple-700 font-semibold">Equity</div>
                  <div className="text-2xl font-bold text-purple-900 mt-1">
                    {formatNumber(Math.abs(metrics.totalEquity))}
                  </div>
                </div>
              </div>
            </div>

            {/* Income Statement Items */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Income Statement</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="text-sm text-green-700 font-semibold">Revenue</div>
                  <div className="text-2xl font-bold text-green-900 mt-1">
                    {formatNumber(Math.abs(metrics.totalRevenue))}
                  </div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <div className="text-sm text-amber-700 font-semibold">Expenses</div>
                  <div className="text-2xl font-bold text-amber-900 mt-1">
                    {formatNumber(Math.abs(metrics.totalExpenses))}
                  </div>
                </div>
                <div className={`rounded-lg p-4 border-2 ${metrics.profitLoss >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <div className={`text-sm font-semibold ${metrics.profitLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    P&L (Revenue - Expenses)
                  </div>
                  <div className={`text-2xl font-bold mt-1 ${metrics.profitLoss >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {formatNumber(Math.abs(metrics.profitLoss))}
                    {metrics.profitLoss >= 0 ? (
                      <span className="text-xs ml-2">✓ Profit</span>
                    ) : (
                      <span className="text-xs ml-2">⚠️ Loss</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Sheet Check */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Financial Checks</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className={`rounded-lg p-4 border-2 ${Math.abs(metrics.bsCheck) < 0.01 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-sm font-semibold ${Math.abs(metrics.bsCheck) < 0.01 ? 'text-green-700' : 'text-red-700'}`}>
                        Balance Sheet Check
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Assets - Equity - Liabilities - P&L = 0
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${Math.abs(metrics.bsCheck) < 0.01 ? 'text-green-900' : 'text-red-900'}`}>
                        {formatNumber(Math.abs(metrics.bsCheck))}
                      </div>
                      {Math.abs(metrics.bsCheck) < 0.01 ? (
                        <span className="text-sm text-green-700 font-semibold">✓ Balanced</span>
                      ) : (
                        <span className="text-sm text-red-700 font-semibold">⚠️ Not Balanced</span>
                      )}
                    </div>
                  </div>
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
                  <th className="px-4 py-4 text-right text-sm font-bold bg-blue-700">Trans. Debit</th>
                  <th className="px-4 py-4 text-right text-sm font-bold bg-blue-700">Trans. Credit</th>
                  <th className="px-4 py-4 text-right text-sm font-bold bg-green-700">FCTR</th>
                  <th className="px-4 py-4 text-center text-sm font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTBs.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="px-6 py-16 text-center text-gray-500">
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
                      <td className="px-4 py-3 text-sm text-right font-mono bg-blue-50">
                        {tb.translated_debit ? (
                          <span className="text-blue-900 font-semibold">
                            {formatNumber(tb.translated_debit)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono bg-blue-50">
                        {tb.translated_credit ? (
                          <span className="text-blue-900 font-semibold">
                            {formatNumber(tb.translated_credit)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono bg-green-50">
                        {tb.fctr_amount ? (
                          <span className={`font-semibold ${
                            parseFloat(tb.fctr_amount) >= 0 ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {formatNumber(tb.fctr_amount)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
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

      {/* Rounding Side Panel */}
      {(showRoundingPanel || isRoundingPanelClosing) && (
        <div className={`fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 overflow-y-auto ${isRoundingPanelClosing ? 'animate-slideOutRight' : 'animate-slideLeft'}`}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Round Off Balances</h3>
                <p className="text-sm text-slate-300 mt-1">Round trial balance amounts and post difference</p>
              </div>
              <button
                onClick={closeRoundingPanel}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 space-y-6 overflow-y-auto">
              {/* Rounding Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Rounding Method</label>
                <select
                  value={roundingMethod}
                  onChange={(e) => setRoundingMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[#101828]"
                >
                  <option value="nearest">Round to Nearest</option>
                  <option value="up">Round Up (Ceiling)</option>
                  <option value="down">Round Down (Floor)</option>
                </select>
              </div>

              {/* Precision */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Decimal Places</label>
                <select
                  value={roundingPrecision}
                  onChange={(e) => setRoundingPrecision(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[#101828]"
                >
                  <option value="0">0 (Whole numbers)</option>
                  <option value="1">1 decimal place</option>
                  <option value="2">2 decimal places</option>
                </select>
              </div>

              {/* Difference Account Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Post Difference To</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="existing-gl"
                      checked={!createNewGL}
                      onChange={() => setCreateNewGL(false)}
                      className="w-4 h-4 text-slate-900"
                    />
                    <label htmlFor="existing-gl" className="text-sm font-medium text-gray-700">Select Existing GL Account</label>
                  </div>

                  {!createNewGL && (
                    <select
                      value={differenceAccount}
                      onChange={(e) => setDifferenceAccount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[#101828]"
                    >
                      <option value="">Select GL Account...</option>
                      {glAccounts.map(gl => (
                        <option key={gl.account_code} value={gl.account_code}>
                          {gl.account_code} - {gl.account_name}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="new-gl"
                      checked={createNewGL}
                      onChange={() => setCreateNewGL(true)}
                      className="w-4 h-4 text-slate-900"
                    />
                    <label htmlFor="new-gl" className="text-sm font-medium text-gray-700">Create New GL Account</label>
                  </div>

                  {createNewGL && (
                    <div className="space-y-4 pl-6 pt-2 bg-slate-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Account Code *</label>
                        <input
                          type="text"
                          value={newGLDetails.account_code}
                          onChange={(e) => setNewGLDetails({ ...newGLDetails, account_code: e.target.value })}
                          placeholder="e.g., 8999"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[#101828]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Account Name *</label>
                        <input
                          type="text"
                          value={newGLDetails.account_name}
                          onChange={(e) => setNewGLDetails({ ...newGLDetails, account_name: e.target.value })}
                          placeholder="e.g., Rounding Difference"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[#101828]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Class *</label>
                        <select
                          value={newGLDetails.class_name}
                          onChange={(e) => setNewGLDetails({ ...newGLDetails, class_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[#101828]"
                        >
                          {availableClasses.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Sub Class</label>
                        <input
                          type="text"
                          value={newGLDetails.subclass_name}
                          onChange={(e) => setNewGLDetails({ ...newGLDetails, subclass_name: e.target.value })}
                          placeholder="Optional"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[#101828]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Note</label>
                        <input
                          type="text"
                          value={newGLDetails.note_name}
                          onChange={(e) => setNewGLDetails({ ...newGLDetails, note_name: e.target.value })}
                          placeholder="Optional"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[#101828]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Sub Note</label>
                        <input
                          type="text"
                          value={newGLDetails.subnote_name}
                          onChange={(e) => setNewGLDetails({ ...newGLDetails, subnote_name: e.target.value })}
                          placeholder="Optional"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-[#101828]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <button
                onClick={handleRoundBalances}
                className="w-full px-6 py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-semibold text-lg"
              >
                <Calculator size={20} />
                Apply Rounding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

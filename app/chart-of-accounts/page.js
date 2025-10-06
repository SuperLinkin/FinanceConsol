'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, ChevronDown, ChevronRight, Plus, Edit2, Trash2, X, Save } from 'lucide-react';

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All Classes');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [accountForm, setAccountForm] = useState({
    account_code: '',
    account_name: '',
    level: 'Class',
    parent_id: null,
    ifrs_category: '',
    ifrs_reference: '',
    description: '',
    is_active: true
  });

  const IFRS_CATEGORIES = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];
  const ACCOUNT_LEVELS = ['Class', 'Sub-Class', 'Note', 'Sub-Note'];
  const CLASSES = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'];

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [accounts, searchQuery, filterClass, filterStatus]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .order('account_code');

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      showToast('Error loading accounts', false);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...accounts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(acc =>
        acc.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.account_code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Class filter
    if (filterClass !== 'All Classes') {
      filtered = filtered.filter(acc =>
        acc.ifrs_category === filterClass || getParentCategory(acc.parent_id) === filterClass
      );
    }

    // Status filter
    if (filterStatus === 'Active') {
      filtered = filtered.filter(acc => acc.is_active);
    } else if (filterStatus === 'Inactive') {
      filtered = filtered.filter(acc => !acc.is_active);
    }

    setFilteredAccounts(filtered);
  };

  const getParentCategory = (parentId) => {
    if (!parentId) return null;
    const parent = accounts.find(acc => acc.id === parentId);
    return parent ? (parent.ifrs_category || getParentCategory(parent.parent_id)) : null;
  };

  const buildHierarchy = (parentId = null, level = 0) => {
    return filteredAccounts
      .filter(acc => acc.parent_id === parentId)
      .map(account => ({
        ...account,
        level,
        children: buildHierarchy(account.id, level + 1)
      }));
  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const openAddModal = (parentAccount = null) => {
    setEditingAccount(null);
    setAccountForm({
      account_code: '',
      account_name: '',
      level: parentAccount ? getNextLevel(parentAccount.account_type) : 'Class',
      parent_id: parentAccount?.id || null,
      ifrs_category: parentAccount?.ifrs_category || '',
      ifrs_reference: '',
      description: '',
      is_active: true
    });
    setShowModal(true);
  };

  const openEditModal = (account) => {
    setEditingAccount(account);
    setAccountForm({
      account_code: account.account_code,
      account_name: account.account_name,
      level: account.account_type || 'Class',
      parent_id: account.parent_id,
      ifrs_category: account.ifrs_category || '',
      ifrs_reference: account.ifrs_reference || '',
      description: account.description || '',
      is_active: account.is_active
    });
    setShowModal(true);
  };

  const getNextLevel = (currentLevel) => {
    const levels = ['Class', 'Sub-Class', 'Note', 'Sub-Note'];
    const currentIndex = levels.indexOf(currentLevel);
    return levels[currentIndex + 1] || 'Sub-Note';
  };

  const handleSaveAccount = async () => {
    try {
      // Validation
      if (!accountForm.account_code || !accountForm.account_name) {
        showToast('Account code and name are required', false);
        return;
      }

      if (accountForm.level === 'Class' && !accountForm.ifrs_category) {
        showToast('IFRS category is required for Class level', false);
        return;
      }

      const accountData = {
        account_code: accountForm.account_code,
        account_name: accountForm.account_name,
        account_type: accountForm.level,
        parent_account: accountForm.parent_id ?
          accounts.find(a => a.id === accountForm.parent_id)?.account_code : null,
        ifrs_category: accountForm.ifrs_category || null,
        ifrs_reference: accountForm.ifrs_reference || null,
        description: accountForm.description || null,
        is_active: accountForm.is_active,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingAccount) {
        // Update existing
        ({ error } = await supabase
          .from('chart_of_accounts')
          .update(accountData)
          .eq('id', editingAccount.id));
      } else {
        // Insert new
        ({ error } = await supabase
          .from('chart_of_accounts')
          .insert([accountData]));
      }

      if (error) throw error;

      showToast(
        `Account '${accountForm.account_name}' ${editingAccount ? 'updated' : 'added'} successfully`,
        true
      );
      setShowModal(false);
      fetchAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
      showToast('Error saving account: ' + error.message, false);
    }
  };

  const handleDeleteAccount = async (account) => {
    if (!confirm(`Delete account '${account.account_name}'? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('chart_of_accounts')
        .delete()
        .eq('id', account.id);

      if (error) throw error;

      showToast(`Account '${account.account_name}' deleted`, true);
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast('Error deleting account: ' + error.message, false);
    }
  };

  const showToast = (message, success = true) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3000);
  };

  const renderAccountRow = (account, depth = 0) => {
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedNodes.has(account.id);
    const indentClass = `pl-${Math.min(depth * 8, 32)}`;
    const bgShade = depth === 0 ? 'bg-white' : depth === 1 ? 'bg-[#faf9f7]' : depth === 2 ? 'bg-[#f7f5f2]' : 'bg-[#f0ede8]';

    return (
      <div key={account.id}>
        <div
          className={`${bgShade} border-b border-gray-200 hover:bg-[#faf8f4] transition-all duration-250 group`}
        >
          <div className="flex items-center py-4 px-6">
            {/* Expand/Collapse */}
            <div className="w-8">
              {hasChildren && (
                <button
                  onClick={() => toggleNode(account.id)}
                  className="text-gray-500 hover:text-[#101828] transition-colors"
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              )}
            </div>

            {/* Account Code */}
            <div className={`w-40 font-semibold text-[#101828] ${indentClass}`}>
              {account.account_code}
            </div>

            {/* Account Name */}
            <div className="flex-1 font-medium text-gray-900">
              {account.account_name}
            </div>

            {/* Type */}
            <div className="w-32">
              <span className="px-3 py-1 bg-[#f4d06f] text-[#101828] text-xs font-semibold rounded-full">
                {account.account_type || 'Class'}
              </span>
            </div>

            {/* Parent */}
            <div className="w-32 text-sm text-gray-600">
              {account.parent_account || '—'}
            </div>

            {/* IFRS Ref */}
            <div className="w-32 text-xs text-gray-500">
              {account.ifrs_reference || '—'}
            </div>

            {/* Active Status */}
            <div className="w-24 text-center">
              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {account.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Actions */}
            <div className="w-32 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {(account.account_type === 'Note' || !account.account_type) && (
                <button
                  onClick={() => openAddModal(account)}
                  className="p-2 text-[#101828] hover:bg-[#e8e4dd] rounded-lg transition-colors"
                  title="Add Sub-Note"
                >
                  <Plus size={16} />
                </button>
              )}
              <button
                onClick={() => openEditModal(account)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDeleteAccount(account)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>
            {account.children.map(child => renderAccountRow(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="text-[#101828] text-lg">Loading Chart of Accounts...</div>
      </div>
    );
  }

  const hierarchy = buildHierarchy();

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <div className="max-w-[1600px] mx-auto px-12 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-[#101828] mb-2">Chart of Accounts</h1>
          <p className="text-lg text-gray-600">IFRS-Aligned Account Hierarchy</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search account name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
              />
            </div>

            {/* Filter: Class */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
            >
              <option>All Classes</option>
              {IFRS_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
            </select>

            {/* Filter: Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>

            {/* Add Button */}
            <button
              onClick={() => openAddModal()}
              className="flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1a2233] transition-colors"
            >
              <Plus size={20} />
              Add Account
            </button>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-[#101828] text-white py-4 px-6">
            <div className="flex items-center">
              <div className="w-8"></div>
              <div className="w-40 font-bold text-sm">Account Code</div>
              <div className="flex-1 font-bold text-sm">Account Name</div>
              <div className="w-32 font-bold text-sm">Type</div>
              <div className="w-32 font-bold text-sm">Parent</div>
              <div className="w-32 font-bold text-sm">IFRS Ref</div>
              <div className="w-24 font-bold text-sm text-center">Status</div>
              <div className="w-32 font-bold text-sm">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div>
            {hierarchy.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                No accounts found. Click "Add Account" to create your first account.
              </div>
            ) : (
              hierarchy.map(account => renderAccountRow(account, 0))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-end">
          <div className="bg-white h-full w-[600px] shadow-2xl animate-slideRight overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-[#101828]">
                  {editingAccount ? 'Edit Account' : 'Add New Account'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Account Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Code *
                  </label>
                  <input
                    type="text"
                    value={accountForm.account_code}
                    onChange={(e) => setAccountForm({...accountForm, account_code: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    placeholder="e.g., 1000"
                  />
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={accountForm.account_name}
                    onChange={(e) => setAccountForm({...accountForm, account_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    placeholder="e.g., Cash & Cash Equivalents"
                  />
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Level *
                  </label>
                  <select
                    value={accountForm.level}
                    onChange={(e) => setAccountForm({...accountForm, level: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                  >
                    {ACCOUNT_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {/* Parent Account */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Parent Account
                  </label>
                  <select
                    value={accountForm.parent_id || ''}
                    onChange={(e) => setAccountForm({...accountForm, parent_id: e.target.value || null})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                  >
                    <option value="">None (Top Level)</option>
                    {accounts
                      .filter(acc => acc.id !== editingAccount?.id)
                      .map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.account_code} - {acc.account_name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* IFRS Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    IFRS Category {accountForm.level === 'Class' && '*'}
                  </label>
                  <select
                    value={accountForm.ifrs_category}
                    onChange={(e) => setAccountForm({...accountForm, ifrs_category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                  >
                    <option value="">Select category...</option>
                    {IFRS_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* IFRS Reference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    IFRS Reference
                  </label>
                  <input
                    type="text"
                    value={accountForm.ifrs_reference}
                    onChange={(e) => setAccountForm({...accountForm, ifrs_reference: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    placeholder="e.g., IAS 7.45, IAS 16, IFRS 10"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description / Disclosure Note Purpose
                  </label>
                  <textarea
                    value={accountForm.description}
                    onChange={(e) => setAccountForm({...accountForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    placeholder="Enter description..."
                  />
                </div>

                {/* Active Toggle */}
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={accountForm.is_active}
                      onChange={(e) => setAccountForm({...accountForm, is_active: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-[#101828] focus:ring-[#101828]"
                    />
                    <span className="font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 sticky bottom-0 bg-white pt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveAccount}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#101828] text-white rounded-full font-semibold hover:bg-[#1a2233] transition-colors shadow-lg"
                >
                  <Save size={20} />
                  Save Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg animate-slideUp ${
          toast.success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="font-semibold">{toast.message}</p>
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes slideRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideRight { animation: slideRight 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Edit2, Trash2, X, Save, Upload, Download } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function ChartOfAccounts() {
  const [activeTab, setActiveTab] = useState('gl-codes'); // 'gl-codes', 'masters'
  const [accounts, setAccounts] = useState([]);
  const [masters, setMasters] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All Classes');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [showModal, setShowModal] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingMaster, setEditingMaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [accountForm, setAccountForm] = useState({
    account_code: '',
    account_name: '',
    class_name: '',
    subclass_name: '',
    note_name: '',
    subnote_name: '',
    is_active: true
  });

  const [masterForm, setMasterForm] = useState({
    class_name: '',
    subclass_name: '',
    note_name: '',
    subnote_name: '',
    is_active: true
  });

  const CLASSES = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'];

  useEffect(() => {
    fetchAccounts();
    fetchMasters();
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

  const fetchMasters = async () => {
    try {
      const { data, error } = await supabase
        .from('coa_master_hierarchy')
        .select('*')
        .order('class_name, subclass_name, note_name, subnote_name');

      if (error) throw error;
      setMasters(data || []);
    } catch (error) {
      console.error('Error fetching masters:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...accounts];

    if (searchQuery) {
      filtered = filtered.filter(acc =>
        acc.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.account_code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterClass !== 'All Classes') {
      filtered = filtered.filter(acc => acc.class_name === filterClass);
    }

    if (filterStatus === 'Active') {
      filtered = filtered.filter(acc => acc.is_active);
    } else if (filterStatus === 'Inactive') {
      filtered = filtered.filter(acc => !acc.is_active);
    }

    setFilteredAccounts(filtered);
  };

  const openAddModal = () => {
    setEditingAccount(null);
    setAccountForm({
      account_code: '',
      account_name: '',
      class_name: '',
      subclass_name: '',
      note_name: '',
      subnote_name: '',
      is_active: true
    });
    setShowModal(true);
  };

  const openEditModal = (account) => {
    setEditingAccount(account);
    setAccountForm({
      account_code: account.account_code,
      account_name: account.account_name,
      class_name: account.class_name || '',
      subclass_name: account.subclass_name || '',
      note_name: account.note_name || '',
      subnote_name: account.subnote_name || '',
      is_active: account.is_active
    });
    setShowModal(true);
  };

  const openAddMasterModal = () => {
    setEditingMaster(null);
    setMasterForm({
      class_name: '',
      subclass_name: '',
      note_name: '',
      subnote_name: '',
      is_active: true
    });
    setShowMasterModal(true);
  };

  const openEditMasterModal = (master) => {
    setEditingMaster(master);
    setMasterForm({
      class_name: master.class_name || '',
      subclass_name: master.subclass_name || '',
      note_name: master.note_name || '',
      subnote_name: master.subnote_name || '',
      is_active: master.is_active
    });
    setShowMasterModal(true);
  };

  const handleSaveAccount = async () => {
    try {
      if (!accountForm.account_code || !accountForm.account_name) {
        showToast('Account code and name are required', false);
        return;
      }

      if (!accountForm.class_name || !accountForm.subclass_name ||
          !accountForm.note_name || !accountForm.subnote_name) {
        showToast('All 4 levels (Class, Sub-Class, Note, Sub-Note) are mandatory', false);
        return;
      }

      const accountData = {
        account_code: accountForm.account_code,
        account_name: accountForm.account_name,
        class_name: accountForm.class_name,
        subclass_name: accountForm.subclass_name,
        note_name: accountForm.note_name,
        subnote_name: accountForm.subnote_name,
        is_active: accountForm.is_active,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingAccount) {
        ({ error } = await supabase
          .from('chart_of_accounts')
          .update(accountData)
          .eq('id', editingAccount.id));
      } else {
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

  const handleSaveMaster = async () => {
    try {
      if (!masterForm.class_name || !masterForm.subclass_name ||
          !masterForm.note_name || !masterForm.subnote_name) {
        showToast('All 4 levels are mandatory', false);
        return;
      }

      const masterData = {
        class_name: masterForm.class_name,
        subclass_name: masterForm.subclass_name,
        note_name: masterForm.note_name,
        subnote_name: masterForm.subnote_name,
        is_active: masterForm.is_active,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingMaster) {
        ({ error } = await supabase
          .from('coa_master_hierarchy')
          .update(masterData)
          .eq('id', editingMaster.id));
      } else {
        ({ error } = await supabase
          .from('coa_master_hierarchy')
          .insert([masterData]));
      }

      if (error) throw error;

      showToast(
        `Master hierarchy ${editingMaster ? 'updated' : 'added'} successfully`,
        true
      );
      setShowMasterModal(false);
      fetchMasters();
    } catch (error) {
      console.error('Error saving master:', error);
      showToast('Error saving master: ' + error.message, false);
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

  const handleDeleteMaster = async (master) => {
    if (!confirm('Delete this master hierarchy? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('coa_master_hierarchy')
        .delete()
        .eq('id', master.id);

      if (error) throw error;

      showToast('Master deleted', true);
      fetchMasters();
    } catch (error) {
      console.error('Error deleting master:', error);
      showToast('Error deleting master: ' + error.message, false);
    }
  };

  const downloadGLTemplate = () => {
    const template = [
      { 'GL Code': '1000', 'GL Name': 'Cash & Cash Equivalents', 'Class': 'Assets', 'Sub-Class': 'Current Assets', 'Note': 'Cash & Cash Equivalents', 'Sub-Note': 'Petty Cash', 'Active': 'Yes' },
      { 'GL Code': '1010', 'GL Name': 'Bank Balance', 'Class': 'Assets', 'Sub-Class': 'Current Assets', 'Note': 'Cash & Cash Equivalents', 'Sub-Note': 'Bank Balance', 'Active': 'Yes' },
      { 'GL Code': '1100', 'GL Name': 'Trade Receivables', 'Class': 'Assets', 'Sub-Class': 'Current Assets', 'Note': 'Trade & Other Receivables', 'Sub-Note': 'Trade Receivables', 'Active': 'Yes' }
    ];

    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'GL Codes');
      XLSX.writeFile(wb, 'GL_Codes_Template.xlsx');
    });
  };

  const downloadMasterTemplate = () => {
    const template = [
      { 'Class': 'Assets', 'Sub-Class': 'Current Assets', 'Note': 'Cash & Cash Equivalents', 'Sub-Note': 'Petty Cash', 'Active': 'Yes' },
      { 'Class': 'Assets', 'Sub-Class': 'Current Assets', 'Note': 'Cash & Cash Equivalents', 'Sub-Note': 'Bank Balance', 'Active': 'Yes' },
      { 'Class': 'Liabilities', 'Sub-Class': 'Current Liabilities', 'Note': 'Trade & Other Payables', 'Sub-Note': 'Trade Payables', 'Active': 'Yes' }
    ];

    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Master Hierarchy');
      XLSX.writeFile(wb, 'Master_Hierarchy_Template.xlsx');
    });
  };

  const handleGLUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          if (!jsonData || jsonData.length === 0) {
            throw new Error('No data found in the uploaded file. Please check the file format.');
          }

          const missingLevels = [];
          jsonData.forEach((row, index) => {
            if (!row.Class || !row['Sub-Class'] || !row.Note || !row['Sub-Note']) {
              missingLevels.push(index + 2);
            }
          });

          if (missingLevels.length > 0) {
            throw new Error(`Missing mandatory hierarchy levels in rows: ${missingLevels.join(', ')}`);
          }

          const glRecords = jsonData.map(row => ({
            account_code: row['GL Code'] || '',
            account_name: row['GL Name'] || '',
            class_name: row.Class || '',
            subclass_name: row['Sub-Class'] || '',
            note_name: row.Note || '',
            subnote_name: row['Sub-Note'] || '',
            is_active: (row.Active || 'Yes').toLowerCase() === 'yes',
          }));

          // Remove duplicates based on account_code
          const uniqueRecords = [];
          const seen = new Set();
          let duplicateCount = 0;

          glRecords.forEach(record => {
            if (!seen.has(record.account_code)) {
              seen.add(record.account_code);
              uniqueRecords.push(record);
            } else {
              duplicateCount++;
            }
          });

          if (duplicateCount > 0) {
            console.log(`Removed ${duplicateCount} duplicate GL codes from upload`);
          }

          const { error } = await supabase
            .from('chart_of_accounts')
            .insert(uniqueRecords);

          if (error) {
            console.error('Database error:', error);
            const errorMsg = error.message || error.hint || 'Database error occurred';
            alert('Upload failed: ' + errorMsg);
            throw new Error(errorMsg);
          }

          let successMsg = `GL codes uploaded successfully! ${uniqueRecords.length} codes processed.`;
          if (duplicateCount > 0) {
            successMsg += ` (${duplicateCount} duplicates removed from file)`;
          }
          alert(successMsg);
          showToast(successMsg, true);
          fetchAccounts();
          e.target.value = '';
        } catch (error) {
          console.error('Upload error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
          showToast('Upload failed: ' + (error.message || 'Unknown error'), false);
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        showToast('Error reading file. Please try again.', false);
        setUploading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      showToast('Upload failed: ' + error.message, false);
      setUploading(false);
    }
  };

  const handleMasterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          if (!jsonData || jsonData.length === 0) {
            throw new Error('No data found in the uploaded file. Please check the file format.');
          }

          console.log('First row columns:', Object.keys(jsonData[0]));

          const missingLevels = [];
          jsonData.forEach((row, index) => {
            if (!row.Class || !row['Sub-Class'] || !row.Note || !row['Sub-Note']) {
              missingLevels.push(index + 2);
            }
          });

          if (missingLevels.length > 0) {
            throw new Error(`Missing mandatory hierarchy levels (Class, Sub-Class, Note, Sub-Note) in rows: ${missingLevels.join(', ')}`);
          }

          const masterRecords = jsonData.map(row => {
            // Determine statement type based on class name if not provided
            let statementType = 'balance_sheet'; // default
            const className = (row.Class || '').toLowerCase();

            if (className.includes('asset') || className.includes('liabilit') || className.includes('equity')) {
              statementType = 'balance_sheet';
            } else if (className.includes('income') || className.includes('revenue') || className.includes('expense') || className.includes('cost')) {
              statementType = 'income_statement';
            }

            // Override if Statement Type column exists
            if (row['Statement Type']) {
              const type = row['Statement Type'].toLowerCase().replace(/\s+/g, '_');
              if (['balance_sheet', 'income_statement', 'cash_flow', 'equity'].includes(type)) {
                statementType = type;
              }
            }

            // Determine normal balance based on class name
            let normalBalance = 'Debit'; // default
            if (className.includes('liabilit') || className.includes('equity') || className.includes('income') || className.includes('revenue')) {
              normalBalance = 'Credit';
            }

            // Override if Normal Balance column exists
            if (row['Normal Balance']) {
              normalBalance = row['Normal Balance'];
            }

            return {
              class_name: row.Class || '',
              subclass_name: row['Sub-Class'] || '',
              note_name: row.Note || '',
              subnote_name: row['Sub-Note'] || '',
              statement_type: statementType,
              normal_balance: normalBalance,
              is_active: (row.Active || 'Yes').toLowerCase() === 'yes',
            };
          });

          // Remove duplicates based on unique key (class_name + subclass_name + note_name + subnote_name)
          const uniqueRecords = [];
          const seen = new Set();
          let duplicateCount = 0;

          masterRecords.forEach(record => {
            const key = `${record.class_name}|${record.subclass_name}|${record.note_name}|${record.subnote_name}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueRecords.push(record);
            } else {
              duplicateCount++;
            }
          });

          if (duplicateCount > 0) {
            console.log(`Removed ${duplicateCount} duplicate rows from upload`);
          }

          console.log('Sample master record:', uniqueRecords[0]);
          console.log(`Total unique records: ${uniqueRecords.length}`);

          // Use upsert to insert or update existing records
          const { error, data: insertedData } = await supabase
            .from('coa_master_hierarchy')
            .upsert(uniqueRecords, {
              onConflict: 'class_name,subclass_name,note_name,subnote_name',
              ignoreDuplicates: false
            })
            .select();

          if (error) {
            console.error('Database error:', error);
            const errorMsg = error.message || error.hint || 'Database error occurred';
            alert('Upload failed: ' + errorMsg);
            throw new Error(errorMsg);
          }

          let successMsg = `Master hierarchy uploaded successfully! ${insertedData?.length || uniqueRecords.length} records processed.`;
          if (duplicateCount > 0) {
            successMsg += ` (${duplicateCount} duplicates removed from file)`;
          }
          alert(successMsg);
          showToast(successMsg, true);
          fetchMasters();
          e.target.value = '';
        } catch (error) {
          console.error('Upload error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
          const errorMsg = 'Upload failed: ' + (error.message || 'Unknown error');
          alert(errorMsg);
          showToast(errorMsg, false);
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        alert('Error reading file. Please try again.');
        showToast('Error reading file. Please try again.', false);
        setUploading(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      const errorMsg = 'Upload failed: ' + (error.message || 'Unknown error');
      alert(errorMsg);
      showToast(errorMsg, false);
      setUploading(false);
    }
  };

  const showToast = (message, success = true) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3000);
  };

  // Get unique values from masters
  const getUniqueClasses = () => [...new Set(masters.map(m => m.class_name).filter(Boolean))];
  const getUniqueSubClasses = (className) => [...new Set(masters.filter(m => m.class_name === className).map(m => m.subclass_name).filter(Boolean))];
  const getUniqueNotes = (className, subClassName) => [...new Set(masters.filter(m => m.class_name === className && m.subclass_name === subClassName).map(m => m.note_name).filter(Boolean))];
  const getUniqueSubNotes = (className, subClassName, noteName) => [...new Set(masters.filter(m => m.class_name === className && m.subclass_name === subClassName && m.note_name === noteName).map(m => m.subnote_name).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="text-[#101828] text-lg">Loading Chart of Accounts...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader title="Chart of Accounts" subtitle="IFRS-compliant 4-level account hierarchy" />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('gl-codes')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'gl-codes'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            GL Codes
          </button>
          <button
            onClick={() => setActiveTab('masters')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'masters'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Master Management
          </button>
        </div>

        {/* GL Codes Tab */}
        {activeTab === 'gl-codes' && (
          <>
            {/* Toolbar */}
            <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center gap-4 mb-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search account name or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                  />
                </div>

                {/* Filter: Class */}
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                >
                  <option>All Classes</option>
                  {CLASSES.map(cat => <option key={cat}>{cat}</option>)}
                </select>

                {/* Filter: Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>

                {/* Add Button */}
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Plus size={20} />
                  Add GL Code
                </button>
              </div>

              {/* Upload/Download Row */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={downloadGLTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <Download size={18} />
                  Download Template
                </button>

                <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors cursor-pointer">
                  <Upload size={18} />
                  {uploading ? 'Uploading...' : 'Upload GL Codes'}
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleGLUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-slate-900 text-white py-4 px-6">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2 font-bold text-sm">GL Code</div>
                  <div className="col-span-2 font-bold text-sm">GL Name</div>
                  <div className="col-span-2 font-bold text-sm">Class</div>
                  <div className="col-span-2 font-bold text-sm">Sub-Class</div>
                  <div className="col-span-1 font-bold text-sm">Note</div>
                  <div className="col-span-1 font-bold text-sm">Sub-Note</div>
                  <div className="col-span-1 font-bold text-sm text-center">Status</div>
                  <div className="col-span-1 font-bold text-sm">Actions</div>
                </div>
              </div>

              <div>
                {filteredAccounts.length === 0 ? (
                  <div className="py-16 text-center text-gray-500">
                    No accounts found. Click &quot;Add GL Code&quot; to create your first account.
                  </div>
                ) : (
                  filteredAccounts.map((account, index) => {
                    const bgShade = index % 2 === 0 ? 'bg-white' : 'bg-[#faf9f7]';
                    return (
                      <div
                        key={account.id}
                        className={`${bgShade} border-b border-gray-200 hover:bg-[#faf8f4] transition-all duration-250 group`}
                      >
                        <div className="grid grid-cols-12 gap-4 py-4 px-6 items-center">
                          <div className="col-span-2 font-semibold text-slate-900">
                            {account.account_code}
                          </div>
                          <div className="col-span-2 font-medium text-gray-900">
                            {account.account_name}
                          </div>
                          <div className="col-span-2 text-sm text-gray-700">
                            {account.class_name || '—'}
                          </div>
                          <div className="col-span-2 text-sm text-gray-700">
                            {account.subclass_name || '—'}
                          </div>
                          <div className="col-span-1 text-sm text-gray-700">
                            {account.note_name || '—'}
                          </div>
                          <div className="col-span-1 text-sm text-gray-700">
                            {account.subnote_name || '—'}
                          </div>
                          <div className="col-span-1 text-center">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              account.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {account.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="col-span-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}

        {/* Master Management Tab */}
        {activeTab === 'masters' && (
          <>
            {/* Toolbar */}
            <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={openAddMasterModal}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Plus size={20} />
                  Add Master Hierarchy
                </button>
              </div>

              {/* Upload/Download Row */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={downloadMasterTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <Download size={18} />
                  Download Template
                </button>

                <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors cursor-pointer">
                  <Upload size={18} />
                  {uploading ? 'Uploading...' : 'Upload Master Hierarchy'}
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleMasterUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Master Table */}
            <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-slate-900 text-white py-4 px-6">
                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-1 font-bold text-sm">Class</div>
                  <div className="col-span-1 font-bold text-sm">Sub-Class</div>
                  <div className="col-span-2 font-bold text-sm">Note</div>
                  <div className="col-span-1 font-bold text-sm">Sub-Note</div>
                  <div className="col-span-1 font-bold text-sm">Actions</div>
                </div>
              </div>

              <div>
                {masters.length === 0 ? (
                  <div className="py-16 text-center text-gray-500">
                    No master hierarchy found. Click &quot;Add Master Hierarchy&quot; to create one.
                  </div>
                ) : (
                  masters.map((master, index) => {
                    const bgShade = index % 2 === 0 ? 'bg-white' : 'bg-[#faf9f7]';
                    return (
                      <div
                        key={master.id}
                        className={`${bgShade} border-b border-gray-200 hover:bg-[#faf8f4] transition-all duration-250 group`}
                      >
                        <div className="grid grid-cols-6 gap-4 py-4 px-6 items-center">
                          <div className="col-span-1 text-sm font-semibold text-slate-900">
                            {master.class_name}
                          </div>
                          <div className="col-span-1 text-sm text-gray-700">
                            {master.subclass_name}
                          </div>
                          <div className="col-span-2 text-sm text-gray-700">
                            {master.note_name}
                          </div>
                          <div className="col-span-1 text-sm text-gray-700">
                            {master.subnote_name}
                          </div>
                          <div className="col-span-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditMasterModal(master)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteMaster(master)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
        </div>
      </div>

      {/* GL Code Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none">
          <div className="bg-white h-full w-[600px] shadow-2xl animate-slideRight overflow-y-auto pointer-events-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-slate-900">
                  {editingAccount ? 'Edit GL Code' : 'Add New GL Code'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">GL Code *</label>
                  <input
                    type="text"
                    value={accountForm.account_code}
                    onChange={(e) => setAccountForm({...accountForm, account_code: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    placeholder="e.g., 1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">GL Name *</label>
                  <input
                    type="text"
                    value={accountForm.account_name}
                    onChange={(e) => setAccountForm({...accountForm, account_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    placeholder="e.g., Cash & Cash Equivalents"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class *</label>
                  <select
                    value={accountForm.class_name}
                    onChange={(e) => setAccountForm({...accountForm, class_name: e.target.value, subclass_name: '', note_name: '', subnote_name: ''})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                  >
                    <option value="">Select Class...</option>
                    {getUniqueClasses().map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-Class *</label>
                  <select
                    value={accountForm.subclass_name}
                    onChange={(e) => setAccountForm({...accountForm, subclass_name: e.target.value, note_name: '', subnote_name: ''})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    disabled={!accountForm.class_name}
                  >
                    <option value="">Select Sub-Class...</option>
                    {getUniqueSubClasses(accountForm.class_name).map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Note *</label>
                  <select
                    value={accountForm.note_name}
                    onChange={(e) => setAccountForm({...accountForm, note_name: e.target.value, subnote_name: ''})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    disabled={!accountForm.subclass_name}
                  >
                    <option value="">Select Note...</option>
                    {getUniqueNotes(accountForm.class_name, accountForm.subclass_name).map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-Note *</label>
                  <select
                    value={accountForm.subnote_name}
                    onChange={(e) => setAccountForm({...accountForm, subnote_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    disabled={!accountForm.note_name}
                  >
                    <option value="">Select Sub-Note...</option>
                    {getUniqueSubNotes(accountForm.class_name, accountForm.subclass_name, accountForm.note_name).map(sn => <option key={sn} value={sn}>{sn}</option>)}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={accountForm.is_active}
                      onChange={(e) => setAccountForm({...accountForm, is_active: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 sticky bottom-0 bg-white pt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveAccount}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg"
                >
                  <Save size={20} />
                  Save GL Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Master Add/Edit Modal */}
      {showMasterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none">
          <div className="bg-white h-full w-[600px] shadow-2xl animate-slideRight overflow-y-auto pointer-events-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-slate-900">
                  {editingMaster ? 'Edit Master Hierarchy' : 'Add Master Hierarchy'}
                </h2>
                <button
                  onClick={() => setShowMasterModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class *</label>
                  <input
                    type="text"
                    value={masterForm.class_name}
                    onChange={(e) => setMasterForm({...masterForm, class_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    placeholder="e.g., Assets"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-Class *</label>
                  <input
                    type="text"
                    value={masterForm.subclass_name}
                    onChange={(e) => setMasterForm({...masterForm, subclass_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    placeholder="e.g., Current Assets"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Note *</label>
                  <input
                    type="text"
                    value={masterForm.note_name}
                    onChange={(e) => setMasterForm({...masterForm, note_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    placeholder="e.g., Cash & Cash Equivalents"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-Note *</label>
                  <input
                    type="text"
                    value={masterForm.subnote_name}
                    onChange={(e) => setMasterForm({...masterForm, subnote_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    placeholder="e.g., Petty Cash"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={masterForm.is_active}
                      onChange={(e) => setMasterForm({...masterForm, is_active: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 sticky bottom-0 bg-white pt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveMaster}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg"
                >
                  <Save size={20} />
                  Save Master Hierarchy
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

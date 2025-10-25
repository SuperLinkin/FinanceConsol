'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Edit2, Trash2, X, Save, Upload, Download, Database } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ERPSyncPanel from '@/components/ERPSyncPanel';

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
  const [uploadResults, setUploadResults] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showERPSyncPanel, setShowERPSyncPanel] = useState(false);

  const [accountForm, setAccountForm] = useState({
    account_code: '',
    account_name: '',
    class_name: '',
    subclass_name: '',
    note_name: '',
    subnote_name: '',
    is_active: true,
    to_be_eliminated: false
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
      is_active: true,
      to_be_eliminated: false
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
      is_active: account.is_active,
      to_be_eliminated: account.to_be_eliminated || false
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
        to_be_eliminated: accountForm.to_be_eliminated,
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
      { 'GL Code': '1000', 'GL Name': 'Cash & Cash Equivalents', 'Class': 'Assets', 'Sub-Class': 'Current Assets', 'Note': 'Cash & Cash Equivalents', 'Sub-Note': 'Petty Cash', 'To Be Eliminated': 'N', 'Active': 'Yes' },
      { 'GL Code': '1010', 'GL Name': 'Bank Balance', 'Class': 'Assets', 'Sub-Class': 'Current Assets', 'Note': 'Cash & Cash Equivalents', 'Sub-Note': 'Bank Balance', 'To Be Eliminated': 'N', 'Active': 'Yes' },
      { 'GL Code': '1100', 'GL Name': 'Trade Receivables', 'Class': 'Assets', 'Sub-Class': 'Current Assets', 'Note': 'Trade & Other Receivables', 'Sub-Note': 'Trade Receivables', 'To Be Eliminated': 'Y', 'Active': 'Yes' }
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

          const glRecords = jsonData.map(row => {
            // Parse to_be_eliminated field (accepts Y/N, TRUE/FALSE, 1/0, Yes/No)
            let toBeEliminated = false;
            const elimValue = (row['To Be Eliminated'] || '').toString().toLowerCase();
            if (elimValue === 'y' || elimValue === 'yes' || elimValue === 'true' || elimValue === '1') {
              toBeEliminated = true;
            }

            return {
              account_code: row['GL Code'] || '',
              account_name: row['GL Name'] || '',
              class_name: row.Class || '',
              subclass_name: row['Sub-Class'] || '',
              note_name: row.Note || '',
              subnote_name: row['Sub-Note'] || '',
              to_be_eliminated: toBeEliminated,
              is_active: (row.Active || 'Yes').toLowerCase() === 'yes',
            };
          });

          // Remove duplicates within upload file
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

          console.log(`📁 File contains ${glRecords.length} records, ${uniqueRecords.length} unique, ${duplicateCount} duplicates`);

          // Fetch existing records from database
          const { data: existingRecords, error: fetchError } = await supabase
            .from('chart_of_accounts')
            .select('*');

          if (fetchError) throw fetchError;

          const existingCodes = new Set(existingRecords.map(r => r.account_code));
          const uploadCodes = new Set(uniqueRecords.map(r => r.account_code));

          // Categorize records
          const toAdd = [];
          const toUpdate = [];
          const toDelete = [];
          const unchanged = [];

          // Check what to add or update
          uniqueRecords.forEach(record => {
            const existing = existingRecords.find(e => e.account_code === record.account_code);

            if (!existing) {
              // New record
              toAdd.push(record);
            } else {
              // Check if anything changed
              const hasChanges =
                existing.account_name !== record.account_name ||
                existing.class_name !== record.class_name ||
                existing.subclass_name !== record.subclass_name ||
                existing.note_name !== record.note_name ||
                existing.subnote_name !== record.subnote_name ||
                existing.to_be_eliminated !== record.to_be_eliminated ||
                existing.is_active !== record.is_active;

              if (hasChanges) {
                toUpdate.push({ ...record, id: existing.id });
              } else {
                unchanged.push(record);
              }
            }
          });

          // Check what to delete (exists in DB but not in upload)
          existingRecords.forEach(existing => {
            if (!uploadCodes.has(existing.account_code)) {
              toDelete.push(existing);
            }
          });

          console.log('📊 Sync Analysis:');
          console.log(`  ✅ To Add: ${toAdd.length}`);
          console.log(`  🔄 To Update: ${toUpdate.length}`);
          console.log(`  ❌ To Delete: ${toDelete.length}`);
          console.log(`  ⏸️  Unchanged: ${unchanged.length}`);

          // Perform database operations
          let addedCount = 0;
          let updatedCount = 0;
          let deletedCount = 0;

          // Add new records
          if (toAdd.length > 0) {
            const { error: addError } = await supabase
              .from('chart_of_accounts')
              .insert(toAdd);
            if (addError) throw addError;
            addedCount = toAdd.length;
          }

          // Update existing records
          if (toUpdate.length > 0) {
            for (const record of toUpdate) {
              const { error: updateError } = await supabase
                .from('chart_of_accounts')
                .update({
                  account_name: record.account_name,
                  class_name: record.class_name,
                  subclass_name: record.subclass_name,
                  note_name: record.note_name,
                  subnote_name: record.subnote_name,
                  to_be_eliminated: record.to_be_eliminated,
                  is_active: record.is_active
                })
                .eq('id', record.id);

              if (updateError) throw updateError;
            }
            updatedCount = toUpdate.length;
          }

          // Delete records not in upload
          if (toDelete.length > 0) {
            const deleteIds = toDelete.map(r => r.id);
            const { error: deleteError } = await supabase
              .from('chart_of_accounts')
              .delete()
              .in('id', deleteIds);

            if (deleteError) throw deleteError;
            deletedCount = toDelete.length;
          }

          // Store results for modal
          const results = {
            type: 'GL Codes',
            added: toAdd.map(r => ({ code: r.account_code, name: r.account_name })),
            updated: toUpdate.map(r => ({ code: r.account_code, name: r.account_name })),
            deleted: toDelete.map(r => ({ code: r.account_code, name: r.account_name })),
            unchanged: unchanged.length,
            duplicatesInFile: duplicateCount
          };

          setUploadResults(results);
          setShowResultsModal(true);

          showToast(`Sync complete! Added: ${addedCount}, Updated: ${updatedCount}, Deleted: ${deletedCount}`, true);
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
            let statementType = 'Balance Sheet'; // default
            const className = (row.Class || '').toLowerCase();

            if (className.includes('asset') || className.includes('liabilit') || className.includes('equity')) {
              statementType = 'Balance Sheet';
            } else if (className.includes('income') || className.includes('revenue') || className.includes('expense') || className.includes('cost')) {
              statementType = 'Income Statement';
            }

            // Override if Statement Type column exists
            if (row['Statement Type']) {
              // Map common formats to database enum values
              const typeMap = {
                'balance_sheet': 'Balance Sheet',
                'balance sheet': 'Balance Sheet',
                'income_statement': 'Income Statement',
                'income statement': 'Income Statement',
                'cash_flow': 'Cash Flow',
                'cash flow': 'Cash Flow'
              };
              const type = row['Statement Type'].toLowerCase();
              if (typeMap[type]) {
                statementType = typeMap[type];
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

          // Remove duplicates within upload file
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

          console.log(`📁 File contains ${masterRecords.length} records, ${uniqueRecords.length} unique, ${duplicateCount} duplicates`);

          // Fetch existing records from database
          const { data: existingRecords, error: fetchError } = await supabase
            .from('coa_master_hierarchy')
            .select('*');

          if (fetchError) throw fetchError;

          const makeKey = (r) => `${r.class_name}|${r.subclass_name}|${r.note_name}|${r.subnote_name}`;
          const existingKeys = new Set(existingRecords.map(makeKey));
          const uploadKeys = new Set(uniqueRecords.map(makeKey));

          // Categorize records
          const toAdd = [];
          const toUpdate = [];
          const toDelete = [];
          const unchanged = [];

          // Check what to add or update
          uniqueRecords.forEach(record => {
            const key = makeKey(record);
            const existing = existingRecords.find(e => makeKey(e) === key);

            if (!existing) {
              // New record
              toAdd.push(record);
            } else {
              // Check if anything changed
              const hasChanges =
                existing.statement_type !== record.statement_type ||
                existing.normal_balance !== record.normal_balance ||
                existing.is_active !== record.is_active;

              if (hasChanges) {
                toUpdate.push({ ...record, id: existing.id });
              } else {
                unchanged.push(record);
              }
            }
          });

          // Check what to delete (exists in DB but not in upload)
          existingRecords.forEach(existing => {
            const key = makeKey(existing);
            if (!uploadKeys.has(key)) {
              toDelete.push(existing);
            }
          });

          console.log('📊 Sync Analysis:');
          console.log(`  ✅ To Add: ${toAdd.length}`);
          console.log(`  🔄 To Update: ${toUpdate.length}`);
          console.log(`  ❌ To Delete: ${toDelete.length}`);
          console.log(`  ⏸️  Unchanged: ${unchanged.length}`);

          // Perform database operations
          let addedCount = 0;
          let updatedCount = 0;
          let deletedCount = 0;

          // Add new records
          if (toAdd.length > 0) {
            const { error: addError } = await supabase
              .from('coa_master_hierarchy')
              .insert(toAdd);
            if (addError) throw addError;
            addedCount = toAdd.length;
          }

          // Update existing records
          if (toUpdate.length > 0) {
            for (const record of toUpdate) {
              const { error: updateError } = await supabase
                .from('coa_master_hierarchy')
                .update({
                  statement_type: record.statement_type,
                  normal_balance: record.normal_balance,
                  is_active: record.is_active
                })
                .eq('id', record.id);

              if (updateError) throw updateError;
            }
            updatedCount = toUpdate.length;
          }

          // Delete records not in upload
          if (toDelete.length > 0) {
            const deleteIds = toDelete.map(r => r.id);
            const { error: deleteError } = await supabase
              .from('coa_master_hierarchy')
              .delete()
              .in('id', deleteIds);

            if (deleteError) throw deleteError;
            deletedCount = toDelete.length;
          }

          // Store results for modal
          const results = {
            type: 'Master Hierarchy',
            added: toAdd.map(r => ({
              code: `${r.class_name} > ${r.subclass_name} > ${r.note_name} > ${r.subnote_name}`,
              name: ''
            })),
            updated: toUpdate.map(r => ({
              code: `${r.class_name} > ${r.subclass_name} > ${r.note_name} > ${r.subnote_name}`,
              name: ''
            })),
            deleted: toDelete.map(r => ({
              code: `${r.class_name} > ${r.subclass_name} > ${r.note_name} > ${r.subnote_name}`,
              name: ''
            })),
            unchanged: unchanged.length,
            duplicatesInFile: duplicateCount
          };

          setUploadResults(results);
          setShowResultsModal(true);

          showToast(`Sync complete! Added: ${addedCount}, Updated: ${updatedCount}, Deleted: ${deletedCount}`, true);
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

  // Get accounts with missing taggings
  const getMissingTaggings = () => {
    return accounts.filter(acc =>
      !acc.class_name || !acc.subclass_name || !acc.note_name || !acc.subnote_name
    );
  };

  const missingTaggings = getMissingTaggings();

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
              <div className="pt-4 border-t border-gray-200">
                {/* Sync Warning */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-800">SYNC Operation</p>
                      <p className="text-xs text-yellow-700 mt-0.5">
                        Upload syncs database with your file. Records NOT in upload will be <strong>deleted</strong>. Always upload complete master file.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowERPSyncPanel(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Database size={18} />
                    Sync from ERP
                  </button>

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
            </div>

            {/* Missing Taggings Section */}
            {missingTaggings.length > 0 && (
              <div className="bg-red-50 border-2 border-red-300 rounded-[14px] p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-red-900">Incomplete Account Taggings</h3>
                    <p className="text-sm text-red-700 mt-1">
                      {missingTaggings.length} account{missingTaggings.length !== 1 ? 's' : ''} {missingTaggings.length !== 1 ? 'are' : 'is'} missing one or more hierarchy levels (Class, Sub-Class, Note, Sub-Note)
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-lg">
                    {missingTaggings.length}
                  </span>
                </div>

                <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-red-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">GL Code</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">GL Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Class</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Sub-Class</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Note</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-red-900">Sub-Note</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-red-900">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100">
                      {missingTaggings.map((account) => (
                        <tr key={account.id} className="hover:bg-red-50">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{account.account_code}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{account.account_name}</td>
                          <td className="px-4 py-3 text-sm">
                            {account.class_name ? (
                              <span className="text-gray-700">{account.class_name}</span>
                            ) : (
                              <span className="text-red-600 font-semibold">Missing</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {account.subclass_name ? (
                              <span className="text-gray-700">{account.subclass_name}</span>
                            ) : (
                              <span className="text-red-600 font-semibold">Missing</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {account.note_name ? (
                              <span className="text-gray-700">{account.note_name}</span>
                            ) : (
                              <span className="text-red-600 font-semibold">Missing</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {account.subnote_name ? (
                              <span className="text-gray-700">{account.subnote_name}</span>
                            ) : (
                              <span className="text-red-600 font-semibold">Missing</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => openEditModal(account)}
                              className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Complete Tagging
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Main Table */}
            <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-slate-900 text-white py-4 px-6">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-1 font-bold text-sm">GL Code</div>
                  <div className="col-span-2 font-bold text-sm">GL Name</div>
                  <div className="col-span-1 font-bold text-sm">Class</div>
                  <div className="col-span-2 font-bold text-sm">Sub-Class</div>
                  <div className="col-span-1 font-bold text-sm">Note</div>
                  <div className="col-span-1 font-bold text-sm">Sub-Note</div>
                  <div className="col-span-1 font-bold text-sm text-center">To Eliminate</div>
                  <div className="col-span-1 font-bold text-sm text-center">Status</div>
                  <div className="col-span-2 font-bold text-sm">Actions</div>
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
                          <div className="col-span-1 font-semibold text-slate-900">
                            {account.account_code}
                          </div>
                          <div className="col-span-2 font-medium text-gray-900">
                            {account.account_name}
                          </div>
                          <div className="col-span-1 text-sm text-gray-700">
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
                            <input
                              type="checkbox"
                              checked={account.to_be_eliminated || false}
                              onChange={async (e) => {
                                const newValue = e.target.checked;
                                try {
                                  const { error } = await supabase
                                    .from('chart_of_accounts')
                                    .update({ to_be_eliminated: newValue })
                                    .eq('id', account.id);

                                  if (error) throw error;

                                  fetchAccounts();
                                  showToast(`GL ${account.account_code} ${newValue ? 'marked' : 'unmarked'} for elimination`, true);
                                } catch (error) {
                                  console.error('Error updating to_be_eliminated:', error);
                                  showToast('Error updating elimination status', false);
                                }
                              }}
                              className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                              title="Mark for elimination"
                            />
                          </div>
                          <div className="col-span-1 text-center">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              account.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {account.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="col-span-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <div className="pt-4 border-t border-gray-200">
                {/* Sync Warning */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-800">SYNC Operation</p>
                      <p className="text-xs text-yellow-700 mt-0.5">
                        Upload syncs database with your file. Hierarchy levels NOT in upload will be <strong>deleted</strong>. Always upload complete master hierarchy.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
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
        <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-50 overflow-y-auto animate-slideLeft">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{editingAccount ? 'Edit GL Code' : 'Add New GL Code'}</h3>
                <p className="text-sm text-slate-300 mt-1">Define account code and IFRS hierarchy</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">

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

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={accountForm.is_active}
                      onChange={(e) => setAccountForm({...accountForm, is_active: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="font-medium text-gray-700">Active</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={accountForm.to_be_eliminated}
                      onChange={(e) => setAccountForm({...accountForm, to_be_eliminated: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="font-medium text-gray-700">Mark for Elimination</span>
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
        <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-50 overflow-y-auto animate-slideLeft">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{editingMaster ? 'Edit Master Hierarchy' : 'Add Master Hierarchy'}</h3>
                <p className="text-sm text-slate-300 mt-1">Define IFRS 4-level hierarchy structure</p>
              </div>
              <button
                onClick={() => setShowMasterModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">

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

      {/* Upload Results Modal */}
      {showResultsModal && uploadResults && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[14px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="bg-[#101828] text-white px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Upload Results - {uploadResults.type}</h2>
                  <p className="text-sm text-gray-300 mt-1">Summary of changes applied to database</p>
                </div>
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 p-6 bg-[#f7f5f2]">
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-green-700">{uploadResults.added.length}</div>
                <div className="text-sm text-green-600 font-semibold mt-1">Added</div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-blue-700">{uploadResults.updated.length}</div>
                <div className="text-sm text-blue-600 font-semibold mt-1">Updated</div>
              </div>
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-red-700">{uploadResults.deleted.length}</div>
                <div className="text-sm text-red-600 font-semibold mt-1">Deleted</div>
              </div>
              <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-gray-700">{uploadResults.unchanged}</div>
                <div className="text-sm text-gray-600 font-semibold mt-1">Unchanged</div>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {/* Added Items */}
              {uploadResults.added.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                    <Plus className="text-green-600" size={20} />
                    Added Items ({uploadResults.added.length})
                  </h3>
                  <div className="bg-green-50 rounded-lg border border-green-200 overflow-hidden">
                    <div className="max-h-40 overflow-y-auto">
                      {uploadResults.added.map((item, idx) => (
                        <div key={idx} className="px-4 py-2 border-b border-green-100 last:border-b-0 text-sm">
                          <span className="font-mono font-semibold text-green-800">{item.code}</span>
                          {item.name && <span className="ml-2 text-green-700">{item.name}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Updated Items */}
              {uploadResults.updated.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                    <Edit2 className="text-blue-600" size={20} />
                    Updated Items ({uploadResults.updated.length})
                  </h3>
                  <div className="bg-blue-50 rounded-lg border border-blue-200 overflow-hidden">
                    <div className="max-h-40 overflow-y-auto">
                      {uploadResults.updated.map((item, idx) => (
                        <div key={idx} className="px-4 py-2 border-b border-blue-100 last:border-b-0 text-sm">
                          <span className="font-mono font-semibold text-blue-800">{item.code}</span>
                          {item.name && <span className="ml-2 text-blue-700">{item.name}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Deleted Items */}
              {uploadResults.deleted.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                    <Trash2 className="text-red-600" size={20} />
                    Deleted Items ({uploadResults.deleted.length})
                  </h3>
                  <div className="bg-red-50 rounded-lg border border-red-200 overflow-hidden">
                    <div className="max-h-40 overflow-y-auto">
                      {uploadResults.deleted.map((item, idx) => (
                        <div key={idx} className="px-4 py-2 border-b border-red-100 last:border-b-0 text-sm">
                          <span className="font-mono font-semibold text-red-800">{item.code}</span>
                          {item.name && <span className="ml-2 text-red-700">{item.name}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Info */}
              {uploadResults.duplicatesInFile > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                  <strong>Note:</strong> {uploadResults.duplicatesInFile} duplicate{uploadResults.duplicatesInFile !== 1 ? 's' : ''} found in upload file (removed automatically)
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#f7f5f2] px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowResultsModal(false)}
                className="px-8 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-md"
              >
                Close
              </button>
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

      {/* ERP Sync Panel */}
      <ERPSyncPanel
        isOpen={showERPSyncPanel}
        onClose={() => setShowERPSyncPanel(false)}
        syncType="chart_of_accounts"
        onSyncComplete={() => {
          fetchAccounts();
          showToast('Chart of Accounts synced from ERP successfully', true);
        }}
      />
    </div>
  );
}

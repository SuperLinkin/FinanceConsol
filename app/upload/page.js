'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, Download, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function UploadPage() {
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [currencyMismatch, setCurrencyMismatch] = useState(null);
  const [tbFile, setTbFile] = useState(null);
  const [tbValidation, setTbValidation] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Bulk upload states
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'bulk'
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkValidation, setBulkValidation] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().split('T')[0]);
  const [groupReportingCurrency, setGroupReportingCurrency] = useState(null);

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const [entitiesData, currenciesData] = await Promise.all([
        supabase.from('entities').select('*').order('entity_name'),
        supabase.from('currencies').select('*').eq('is_group_reporting_currency', true).single()
      ]);

      setEntities(entitiesData.data || []);

      // Handle case where column doesn't exist yet
      if (currenciesData.error && (currenciesData.error.code === '42703' || currenciesData.error.message?.includes('column'))) {
        console.warn('Group reporting currency column not found in database. Please run SQL migration.');
        setGroupReportingCurrency(null);
      } else {
        setGroupReportingCurrency(currenciesData.data || null);
      }
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  const handleEntityChange = (entityId) => {
    setSelectedEntity(entityId);
    const entity = entities.find(e => e.id === entityId);

    // Check if currency matches entity's functional currency
    if (entity && selectedCurrency && selectedCurrency !== entity.functional_currency) {
      setCurrencyMismatch({
        entityCurrency: entity.functional_currency,
        selectedCurrency: selectedCurrency,
        entityName: entity.entity_name
      });
    } else {
      setCurrencyMismatch(null);
    }
  };

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
    const entity = entities.find(e => e.id === selectedEntity);

    // Check if currency matches entity's functional currency
    if (entity && currency && currency !== entity.functional_currency) {
      setCurrencyMismatch({
        entityCurrency: entity.functional_currency,
        selectedCurrency: currency,
        entityName: entity.entity_name
      });
    } else {
      setCurrencyMismatch(null);
    }
  };

  const handleTBFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setTbFile(file);
    setTbValidation(null);

    // Validate TB file
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = await import('xlsx').then(XLSX => XLSX.read(data, { type: 'array' }));
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = await import('xlsx').then(XLSX => XLSX.utils.sheet_to_json(firstSheet));

        // Calculate totals
        let totalDebit = 0;
        let totalCredit = 0;

        jsonData.forEach(row => {
          totalDebit += parseFloat(row.Debit || row.debit || 0);
          totalCredit += parseFloat(row.Credit || row.credit || 0);
        });

        const difference = Math.abs(totalDebit - totalCredit);
        const isBalanced = difference < 0.01; // Allow small rounding differences

        setTbValidation({
          isBalanced,
          totalDebit,
          totalCredit,
          difference,
          rowCount: jsonData.length
        });
      } catch (error) {
        console.error('Error validating file:', error);
        setTbValidation({ error: 'Invalid file format' });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTBUpload = async () => {
    if (!tbFile || !selectedEntity || !selectedCurrency || !tbValidation?.isBalanced) {
      alert('Please select an entity, currency, and ensure TB is balanced');
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      // Read and parse the Excel file
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          // Prepare data for Supabase
          const tbRecords = jsonData.map(row => ({
            entity_id: selectedEntity,
            account_code: row['Account Code'] || row['account_code'] || '',
            account_name: row['Account Name'] || row['account_name'] || '',
            debit: parseFloat(row.Debit || row.debit || 0),
            credit: parseFloat(row.Credit || row.credit || 0),
            currency: selectedCurrency,
            period: new Date().toISOString().split('T')[0], // Default to today, can be customized
            uploaded_by: 'System', // Replace with actual user
          }));

          // Insert into Supabase
          const { data: insertedData, error } = await supabase
            .from('trial_balance')
            .insert(tbRecords);

          if (error) throw error;

          setUploadStatus({
            success: true,
            message: `Trial Balance uploaded successfully! ${tbRecords.length} records inserted in ${selectedCurrency}.`
          });
          setTbFile(null);
          setTbValidation(null);
          setSelectedEntity('');
          setSelectedCurrency('');
          setCurrencyMismatch(null);

          // Reset file input
          document.getElementById('tb-upload').value = '';
        } catch (error) {
          console.error('Error:', error);
          setUploadStatus({ success: false, message: 'Upload failed: ' + error.message });
        } finally {
          setUploading(false);
        }
      };
      reader.readAsArrayBuffer(tbFile);
    } catch (error) {
      setUploadStatus({ success: false, message: 'Upload failed: ' + error.message });
      setUploading(false);
    }
  };

  const downloadTBTemplate = () => {
    // Create sample TB template
    const template = [
      { 'Account Code': '1000', 'Account Name': 'Cash', 'Debit': 50000, 'Credit': 0 },
      { 'Account Code': '2000', 'Account Name': 'Accounts Payable', 'Debit': 0, 'Credit': 30000 },
      { 'Account Code': '3000', 'Account Name': 'Equity', 'Debit': 0, 'Credit': 20000 }
    ];

    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Trial Balance');
      XLSX.writeFile(wb, 'TB_Template.xlsx');
    });
  };

  // Bulk upload functions
  const handleBulkFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBulkFile(file);
    setBulkValidation(null);

    // Validate bulk file
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        // Get entity columns (all columns except Account Code and Account Name)
        const headers = Object.keys(jsonData[0] || {});
        const entityColumns = headers.filter(h => h !== 'Account Code' && h !== 'Account Name');

        // Validate that entity columns match existing entities
        const validEntities = entityColumns.filter(col =>
          entities.some(e => e.entity_code === col || e.entity_name === col)
        );

        // Calculate totals per entity
        const entityTotals = {};
        entityColumns.forEach(entityCol => {
          let total = 0;
          jsonData.forEach(row => {
            total += parseFloat(row[entityCol] || 0);
          });
          entityTotals[entityCol] = total;
        });

        setBulkValidation({
          rowCount: jsonData.length,
          entityColumns: entityColumns,
          validEntities: validEntities,
          invalidEntities: entityColumns.filter(c => !validEntities.includes(c)),
          entityTotals: entityTotals,
          isValid: validEntities.length === entityColumns.length
        });
      } catch (error) {
        console.error('Error validating bulk file:', error);
        setBulkValidation({ error: 'Invalid file format' });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile || !bulkValidation?.isValid) {
      alert('Please upload a valid file with correct entity columns');
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          const tbRecords = [];

          // Process each row
          jsonData.forEach(row => {
            const accountCode = row['Account Code'] || row['account_code'] || '';
            const accountName = row['Account Name'] || row['account_name'] || '';

            // For each entity column, create a trial balance record
            bulkValidation.validEntities.forEach(entityCol => {
              const entity = entities.find(e =>
                e.entity_code === entityCol || e.entity_name === entityCol
              );

              if (entity) {
                const amount = parseFloat(row[entityCol] || 0);
                if (amount !== 0) { // Only insert non-zero amounts
                  tbRecords.push({
                    entity_id: entity.id,
                    account_code: accountCode,
                    account_name: accountName,
                    debit: amount > 0 ? amount : 0,
                    credit: amount < 0 ? Math.abs(amount) : 0,
                    period: selectedPeriod,
                    uploaded_by: 'System'
                  });
                }
              }
            });
          });

          // Fetch existing records for comparison
          const entityIds = bulkValidation.validEntities.map(entityCol =>
            entities.find(e => e.entity_code === entityCol || e.entity_name === entityCol)?.id
          ).filter(Boolean);

          const { data: existingRecords } = await supabase
            .from('trial_balance')
            .select('*')
            .in('entity_id', entityIds)
            .eq('period', selectedPeriod);

          // Create map of existing records
          const existingMap = {};
          (existingRecords || []).forEach(record => {
            const key = `${record.entity_id}_${record.account_code}_${record.period}`;
            existingMap[key] = record;
          });

          // Categorize changes
          const changes = {
            added: [],
            updated: [],
            unchanged: [],
            removed: []
          };

          // Check new/updated records
          tbRecords.forEach(newRecord => {
            const key = `${newRecord.entity_id}_${newRecord.account_code}_${newRecord.period}`;
            const existing = existingMap[key];

            if (!existing) {
              changes.added.push(newRecord);
            } else {
              const debitChanged = Math.abs(parseFloat(existing.debit || 0) - parseFloat(newRecord.debit || 0)) > 0.01;
              const creditChanged = Math.abs(parseFloat(existing.credit || 0) - parseFloat(newRecord.credit || 0)) > 0.01;

              if (debitChanged || creditChanged) {
                changes.updated.push({
                  ...newRecord,
                  old_debit: existing.debit,
                  old_credit: existing.credit
                });
              } else {
                changes.unchanged.push(newRecord);
              }

              // Mark as processed
              delete existingMap[key];
            }
          });

          // Remaining records in existingMap are removed
          changes.removed = Object.values(existingMap);

          // Step 1: Delete existing records for this entity/period combination
          console.log('Deleting existing records for entities:', entityIds, 'period:', selectedPeriod);

          // Delete records one entity at a time to avoid issues
          for (const entityId of entityIds) {
            const { error: deleteError } = await supabase
              .from('trial_balance')
              .delete()
              .eq('entity_id', entityId)
              .eq('period', selectedPeriod);

            if (deleteError) {
              console.error('Delete error for entity:', entityId, deleteError);
              throw new Error(`Failed to clear existing records for entity: ${deleteError.message}`);
            }
          }

          // Step 2: Insert all new records
          console.log('Inserting', tbRecords.length, 'new records');
          const { error: insertError } = await supabase
            .from('trial_balance')
            .insert(tbRecords);

          if (insertError) {
            console.error('Insert error:', insertError);
            throw new Error(`Failed to insert records: ${insertError.message}`);
          }

          setUploadStatus({
            success: true,
            message: `Bulk upload successful!`,
            changes: changes,
            summary: {
              added: changes.added.length,
              updated: changes.updated.length,
              unchanged: changes.unchanged.length,
              removed: changes.removed.length,
              total: tbRecords.length
            }
          });
          setBulkFile(null);
          setBulkValidation(null);

          // Reset file input
          document.getElementById('bulk-upload').value = '';
        } catch (error) {
          console.error('Error:', error);
          setUploadStatus({ success: false, message: 'Bulk upload failed: ' + error.message });
        } finally {
          setUploading(false);
        }
      };
      reader.readAsArrayBuffer(bulkFile);
    } catch (error) {
      setUploadStatus({ success: false, message: 'Bulk upload failed: ' + error.message });
      setUploading(false);
    }
  };

  const downloadBulkTemplate = () => {
    // Get entity codes for template
    const entityCols = entities.slice(0, 3).map(e => e.entity_code || e.entity_name);

    // Create template with multiple entity columns
    const template = [
      {
        'Account Code': '1000',
        'Account Name': 'Cash',
        [entityCols[0] || 'Entity1']: 50000,
        [entityCols[1] || 'Entity2']: 30000,
        [entityCols[2] || 'Entity3']: 20000
      },
      {
        'Account Code': '2000',
        'Account Name': 'Accounts Payable',
        [entityCols[0] || 'Entity1']: -30000,
        [entityCols[1] || 'Entity2']: -20000,
        [entityCols[2] || 'Entity3']: -15000
      },
      {
        'Account Code': '3000',
        'Account Name': 'Share Capital',
        [entityCols[0] || 'Entity1']: -20000,
        [entityCols[1] || 'Entity2']: -10000,
        [entityCols[2] || 'Entity3']: -5000
      }
    ];

    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bulk Trial Balance');
      XLSX.writeFile(wb, 'Bulk_TB_Template.xlsx');
    });
  };

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader title="Upload Data" subtitle="Upload Trial Balance and Chart of Accounts" />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">

          {/* Upload Mode Toggle */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => setUploadMode('single')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                uploadMode === 'single'
                  ? 'bg-[#101828] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Single Entity Upload
            </button>
            <button
              onClick={() => setUploadMode('bulk')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                uploadMode === 'bulk'
                  ? 'bg-[#101828] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Bulk Upload (All Entities)
            </button>
          </div>

          {/* Bulk Upload Section */}
          {uploadMode === 'bulk' && (
            <div className="bg-white rounded-[14px] p-8 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Bulk Upload - All Entities</h2>
                  <p className="text-sm text-gray-600 mt-1">Upload trial balance data for multiple entities in one file</p>
                </div>
                <button
                  onClick={downloadBulkTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <Download size={18} />
                  Download Template
                </button>
              </div>

              {/* Currency Warning */}
              <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-bold text-amber-900 mb-1">Important: Currency Consistency</h4>
                    <p className="text-sm text-amber-800">All amounts in the bulk upload file must be in the group reporting currency (base currency).</p>
                    <div className="mt-3 flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-amber-300">
                      <label className="text-sm font-semibold text-amber-900">Group Reporting Currency (Base):</label>
                      <div className="flex items-center gap-2">
                        <span className="px-4 py-2 bg-amber-500 text-white text-base font-bold rounded-lg">
                          {groupReportingCurrency ? `${groupReportingCurrency.currency_code} ${groupReportingCurrency.symbol}` : 'Not Set'}
                        </span>
                        {!groupReportingCurrency && (
                          <span className="text-xs text-red-700 font-semibold">
                            Please set group reporting currency in Consolidation Config &gt; Currencies
                          </span>
                        )}
                      </div>
                    </div>
                    {groupReportingCurrency && (
                      <p className="text-xs text-amber-700 mt-2 font-medium">
                        ⓘ All amounts must be in {groupReportingCurrency.currency_code}. This is configured in Consolidation Config.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Period Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Period *</label>
                <input
                  type="date"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                />
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Excel File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#101828] transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleBulkFileChange}
                    className="hidden"
                    id="bulk-upload"
                  />
                  <label htmlFor="bulk-upload" className="cursor-pointer">
                    <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      {bulkFile ? bulkFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-gray-500">Format: Account Code | Account Name | Entity1 | Entity2 | Entity3...</p>
                  </label>
                </div>
              </div>

              {/* Bulk Validation Results */}
              {bulkValidation && !bulkValidation.error && (
                <div className={`p-4 rounded-lg border-2 mb-6 ${
                  bulkValidation.isValid
                    ? 'bg-green-50 border-green-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {bulkValidation.isValid ? (
                      <CheckCircle className="text-green-600 mt-0.5" size={24} />
                    ) : (
                      <XCircle className="text-amber-600 mt-0.5" size={24} />
                    )}
                    <div className="flex-1">
                      <h3 className={`font-bold mb-2 ${
                        bulkValidation.isValid ? 'text-green-800' : 'text-amber-800'
                      }`}>
                        {bulkValidation.isValid ? 'File Validated Successfully ✓' : 'Validation Warnings'}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700">Total Rows: <span className="font-semibold">{bulkValidation.rowCount}</span></p>
                        <p className="text-gray-700">Entity Columns Found: <span className="font-semibold">{bulkValidation.entityColumns.length}</span></p>
                        <p className="text-green-700">Valid Entities: <span className="font-semibold">{bulkValidation.validEntities.join(', ')}</span></p>
                        {bulkValidation.invalidEntities.length > 0 && (
                          <p className="text-red-700">Invalid Entities (will be skipped): <span className="font-semibold">{bulkValidation.invalidEntities.join(', ')}</span></p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {bulkValidation?.error && (
                <div className="p-4 rounded-lg border-2 bg-red-50 border-red-200 mb-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="text-red-600 mt-0.5" size={24} />
                    <div className="flex-1">
                      <h3 className="font-bold text-red-800 mb-1">Validation Error</h3>
                      <p className="text-sm text-red-700">{bulkValidation.error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleBulkUpload}
                  disabled={uploading || !bulkFile || !bulkValidation?.isValid}
                  className="px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload Bulk Data
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Single Entity TB Upload Section */}
          {uploadMode === 'single' && (
          <div className="bg-white rounded-[14px] p-8 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Upload Trial Balance</h2>
            <button
              onClick={downloadTBTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              Download Template
            </button>
          </div>

          <div className="space-y-6">
            {/* Entity Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Entity *</label>
              <select
                value={selectedEntity}
                onChange={(e) => handleEntityChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
              >
                <option value="">Select an entity...</option>
                {entities.map(entity => (
                  <option key={entity.id} value={entity.id}>
                    {entity.entity_name} ({entity.functional_currency || 'No currency set'})
                  </option>
                ))}
              </select>
              {selectedEntity && entities.find(e => e.id === selectedEntity) && (
                <p className="text-xs text-gray-600 mt-1">
                  Entity currency: <span className="font-semibold text-blue-700">
                    {entities.find(e => e.id === selectedEntity).functional_currency || 'Not set'}
                  </span>
                </p>
              )}
            </div>

            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Currency *</label>
              <select
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
              >
                <option value="">Select currency of trial balance...</option>
                {groupReportingCurrency && (
                  <option value={groupReportingCurrency.currency_code}>
                    {groupReportingCurrency.currency_code} - {groupReportingCurrency.currency_name} (Group Reporting)
                  </option>
                )}
                {entities.map(entity => entity.functional_currency).filter((v, i, a) => v && a.indexOf(v) === i).map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select the currency in which the trial balance amounts are denominated
              </p>
            </div>

            {/* Currency Mismatch Warning */}
            {currencyMismatch && (
              <div className="p-4 rounded-lg border-2 bg-amber-50 border-amber-300">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 mb-1">⚠️ Currency Mismatch Warning</h3>
                    <p className="text-sm text-amber-800 mb-2">
                      You are uploading a trial balance in <strong className="text-red-700">{currencyMismatch.selectedCurrency}</strong> but
                      the entity <strong>{currencyMismatch.entityName}</strong> is configured with functional currency <strong className="text-blue-700">{currencyMismatch.entityCurrency}</strong>.
                    </p>
                    <p className="text-xs text-amber-700 font-medium">
                      ⓘ This may cause consolidation issues. Ensure currency translation is configured properly or upload in the entity's functional currency.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Excel File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#101828] transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleTBFileChange}
                  className="hidden"
                  id="tb-upload"
                />
                <label htmlFor="tb-upload" className="cursor-pointer">
                  <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    {tbFile ? tbFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">Excel files only (.xlsx, .xls)</p>
                </label>
              </div>
            </div>

            {/* Validation Results */}
            {tbValidation && !tbValidation.error && (
              <div className={`p-4 rounded-lg border-2 ${
                tbValidation.isBalanced
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {tbValidation.isBalanced ? (
                    <CheckCircle className="text-green-600 mt-0.5" size={24} />
                  ) : (
                    <XCircle className="text-red-600 mt-0.5" size={24} />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-bold mb-2 ${
                      tbValidation.isBalanced ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {tbValidation.isBalanced ? 'Trial Balance is Balanced ✓' : 'Trial Balance is NOT Balanced'}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700">Total Rows: <span className="font-semibold">{tbValidation.rowCount}</span></p>
                      <p className="text-gray-700">Total Debit: <span className="font-semibold">{tbValidation.totalDebit.toFixed(2)}</span></p>
                      <p className="text-gray-700">Total Credit: <span className="font-semibold">{tbValidation.totalCredit.toFixed(2)}</span></p>
                      {!tbValidation.isBalanced && (
                        <p className="text-red-700 font-semibold">Difference: {tbValidation.difference.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tbValidation?.error && (
              <div className="p-4 rounded-lg border-2 bg-red-50 border-red-200">
                <div className="flex items-start gap-3">
                  <XCircle className="text-red-600 mt-0.5" size={24} />
                  <div className="flex-1">
                    <h3 className="font-bold text-red-800 mb-1">Validation Error</h3>
                    <p className="text-sm text-red-700">{tbValidation.error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Status */}
            {uploadStatus && (
              <div className={`p-4 rounded-lg border-2 ${
                uploadStatus.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {uploadStatus.success ? (
                    <CheckCircle className="text-green-600 mt-0.5" size={24} />
                  ) : (
                    <XCircle className="text-red-600 mt-0.5" size={24} />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold ${
                      uploadStatus.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {uploadStatus.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleTBUpload}
              disabled={!tbFile || !selectedEntity || !selectedCurrency || !tbValidation?.isBalanced || uploading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
            >
              <Upload size={20} />
              {uploading ? 'Uploading...' : 'Upload Trial Balance'}
            </button>
            {(!selectedEntity || !selectedCurrency) && (
              <p className="text-xs text-red-600 text-center -mt-4">
                Please select both entity and currency to enable upload
              </p>
            )}
          </div>
          </div>
          )}

          {/* Upload Status - shown for both modes */}
          {uploadStatus && (
            <div className={`mt-6 p-4 rounded-lg border-2 ${
              uploadStatus.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {uploadStatus.success ? (
                  <CheckCircle className="text-green-600 mt-0.5" size={24} />
                ) : (
                  <XCircle className="text-red-600 mt-0.5" size={24} />
                )}
                <div className="flex-1">
                  <h3 className={`font-bold mb-2 ${
                    uploadStatus.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {uploadStatus.success ? 'Upload Successful!' : 'Upload Failed'}
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    {uploadStatus.message}
                  </p>

                  {/* Detailed Change Summary */}
                  {uploadStatus.summary && (
                    <div className="mt-4 space-y-3">
                      <h4 className="font-bold text-gray-900">Change Summary:</h4>
                      <div className="grid grid-cols-5 gap-3">
                        <div className="bg-blue-100 rounded-lg p-3 border border-blue-300">
                          <div className="text-xs text-blue-700 font-semibold">New GLs Added</div>
                          <div className="text-2xl font-bold text-blue-900">{uploadStatus.summary.added}</div>
                        </div>
                        <div className="bg-amber-100 rounded-lg p-3 border border-amber-300">
                          <div className="text-xs text-amber-700 font-semibold">GLs Updated</div>
                          <div className="text-2xl font-bold text-amber-900">{uploadStatus.summary.updated}</div>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                          <div className="text-xs text-gray-700 font-semibold">Unchanged</div>
                          <div className="text-2xl font-bold text-gray-900">{uploadStatus.summary.unchanged}</div>
                        </div>
                        <div className="bg-red-100 rounded-lg p-3 border border-red-300">
                          <div className="text-xs text-red-700 font-semibold">GLs Removed</div>
                          <div className="text-2xl font-bold text-red-900">{uploadStatus.summary.removed}</div>
                        </div>
                        <div className="bg-green-100 rounded-lg p-3 border border-green-300">
                          <div className="text-xs text-green-700 font-semibold">Total Records</div>
                          <div className="text-2xl font-bold text-green-900">{uploadStatus.summary.total}</div>
                        </div>
                      </div>

                      {/* Detailed Changes */}
                      {uploadStatus.changes && (
                        <div className="mt-4 space-y-3">
                          {/* Added GLs */}
                          {uploadStatus.changes.added.length > 0 && (
                            <details className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                              <summary className="cursor-pointer font-semibold text-blue-900">
                                New GLs Added ({uploadStatus.changes.added.length})
                              </summary>
                              <div className="mt-2 max-h-48 overflow-y-auto">
                                <table className="w-full text-xs">
                                  <thead className="bg-blue-100">
                                    <tr>
                                      <th className="px-2 py-1 text-left">GL Code</th>
                                      <th className="px-2 py-1 text-left">GL Name</th>
                                      <th className="px-2 py-1 text-right">Debit</th>
                                      <th className="px-2 py-1 text-right">Credit</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {uploadStatus.changes.added.map((gl, i) => (
                                      <tr key={i} className="border-t border-blue-200">
                                        <td className="px-2 py-1 font-mono">{gl.account_code}</td>
                                        <td className="px-2 py-1">{gl.account_name}</td>
                                        <td className="px-2 py-1 text-right">{gl.debit.toLocaleString()}</td>
                                        <td className="px-2 py-1 text-right">{gl.credit.toLocaleString()}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </details>
                          )}

                          {/* Updated GLs */}
                          {uploadStatus.changes.updated.length > 0 && (
                            <details className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                              <summary className="cursor-pointer font-semibold text-amber-900">
                                GLs with Changed Values ({uploadStatus.changes.updated.length})
                              </summary>
                              <div className="mt-2 max-h-48 overflow-y-auto">
                                <table className="w-full text-xs">
                                  <thead className="bg-amber-100">
                                    <tr>
                                      <th className="px-2 py-1 text-left">GL Code</th>
                                      <th className="px-2 py-1 text-left">GL Name</th>
                                      <th className="px-2 py-1 text-right">Old Debit</th>
                                      <th className="px-2 py-1 text-right">New Debit</th>
                                      <th className="px-2 py-1 text-right">Old Credit</th>
                                      <th className="px-2 py-1 text-right">New Credit</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {uploadStatus.changes.updated.map((gl, i) => (
                                      <tr key={i} className="border-t border-amber-200">
                                        <td className="px-2 py-1 font-mono">{gl.account_code}</td>
                                        <td className="px-2 py-1">{gl.account_name}</td>
                                        <td className="px-2 py-1 text-right text-gray-500">{parseFloat(gl.old_debit || 0).toLocaleString()}</td>
                                        <td className="px-2 py-1 text-right font-bold">{gl.debit.toLocaleString()}</td>
                                        <td className="px-2 py-1 text-right text-gray-500">{parseFloat(gl.old_credit || 0).toLocaleString()}</td>
                                        <td className="px-2 py-1 text-right font-bold">{gl.credit.toLocaleString()}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </details>
                          )}

                          {/* Removed GLs */}
                          {uploadStatus.changes.removed.length > 0 && (
                            <details className="bg-red-50 rounded-lg p-3 border border-red-200">
                              <summary className="cursor-pointer font-semibold text-red-900">
                                GLs Removed from Previous Upload ({uploadStatus.changes.removed.length})
                              </summary>
                              <div className="mt-2 max-h-48 overflow-y-auto">
                                <table className="w-full text-xs">
                                  <thead className="bg-red-100">
                                    <tr>
                                      <th className="px-2 py-1 text-left">GL Code</th>
                                      <th className="px-2 py-1 text-left">GL Name</th>
                                      <th className="px-2 py-1 text-right">Was Debit</th>
                                      <th className="px-2 py-1 text-right">Was Credit</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {uploadStatus.changes.removed.map((gl, i) => (
                                      <tr key={i} className="border-t border-red-200">
                                        <td className="px-2 py-1 font-mono">{gl.account_code}</td>
                                        <td className="px-2 py-1">{gl.account_name}</td>
                                        <td className="px-2 py-1 text-right">{parseFloat(gl.debit || 0).toLocaleString()}</td>
                                        <td className="px-2 py-1 text-right">{parseFloat(gl.credit || 0).toLocaleString()}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </details>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">Upload Instructions</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">•</span>
              <span>Download the template to see the required format (Account Code, Account Name, Debit, Credit)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">•</span>
              <span>Ensure your Trial Balance is balanced (Total Debit = Total Credit)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">•</span>
              <span>Select the entity before uploading the file</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">•</span>
              <span>For Chart of Accounts and Master Hierarchy uploads, go to the <strong>Chart of Accounts</strong> page</span>
            </li>
          </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

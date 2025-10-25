'use client';

import { useState, useEffect } from 'react';
import { Upload, Download, CheckCircle, XCircle, Database, RefreshCw, Zap } from 'lucide-react';
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
  const [columnFormat, setColumnFormat] = useState('standard'); // 'standard' (Debit/Credit) or 'signed' (single Amount column with +/-)

  // Bulk upload states
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'bulk'
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkValidation, setBulkValidation] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().split('T')[0]);
  const [periodMonths, setPeriodMonths] = useState('12'); // Number of months (1, 3, 6, 12)
  const [groupReportingCurrency, setGroupReportingCurrency] = useState(null);

  // ERP Sync states
  const [integrations, setIntegrations] = useState([]);
  const [showERPSyncModal, setShowERPSyncModal] = useState(false);
  const [syncType, setSyncType] = useState('trial_balance'); // 'trial_balance' or 'chart_of_accounts'
  const [selectedIntegration, setSelectedIntegration] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    fetchEntities();
    fetchIntegrations();
  }, []);

  const fetchEntities = async () => {
    try {
      // Fetch entities via API to bypass RLS
      const entitiesResponse = await fetch('/api/entities');
      const entitiesData = await entitiesResponse.json();

      // The API returns data directly, not wrapped in { data: [...] }
      const entities = Array.isArray(entitiesData) ? entitiesData : (entitiesData.data || []);
      setEntities(entities);
      console.log('[Upload Page] Loaded entities:', entities.length);

      // Fetch base currency from company settings
      const companySettingsResponse = await fetch('/api/company/settings');
      const companySettings = await companySettingsResponse.json();

      if (companySettings.baseCurrency) {
        // Fetch company currencies to get the base currency details
        const currenciesResponse = await fetch('/api/company-currencies');
        const currenciesData = await currenciesResponse.json();

        const currenciesList = Array.isArray(currenciesData) ? currenciesData : (currenciesData.data || []);
        const baseCurr = currenciesList.find(c => c.is_base_currency);
        setGroupReportingCurrency(baseCurr || null);
      } else {
        setGroupReportingCurrency(null);
      }
    } catch (error) {
      console.error('Error fetching entities:', error);
      setGroupReportingCurrency(null);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      const data = await response.json();
      const activeIntegrations = (data || []).filter(i => i.status === 'connected' || i.status === 'configured');
      setIntegrations(activeIntegrations);
      console.log('[Upload Page] Loaded integrations:', activeIntegrations.length);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setIntegrations([]);
    }
  };

  const handleOpenERPSync = (type) => {
    setSyncType(type);
    setSelectedIntegration('');
    setSyncResult(null);
    setShowERPSyncModal(true);
  };

  const handleERPSync = async () => {
    if (!selectedIntegration || !selectedEntity || !selectedPeriod) {
      alert('Please select integration, entity, and period');
      return;
    }

    setSyncing(true);
    setSyncResult(null);

    try {
      const integration = integrations.find(i => i.id === selectedIntegration);

      // Call the appropriate sync endpoint based on ERP system
      let endpoint = '/api/integrations/sync';
      let body = {
        integration_id: selectedIntegration,
        sync_type: syncType,
        triggered_by: 'manual'
      };

      // For NetSuite, use the specific endpoint
      if (integration.erp_system === 'netsuite') {
        endpoint = '/api/integrations/netsuite/sync';

        // Find entity mapping (NetSuite subsidiary ID)
        const entityMapping = integration.entity_mapping || {};
        const entity = entities.find(e => e.id === selectedEntity);
        const subsidiaryId = Object.keys(entityMapping).find(
          key => entityMapping[key] === selectedEntity
        );

        body = {
          integration_id: selectedIntegration,
          sync_type: syncType,
          subsidiary_id: subsidiaryId,
          period_id: null, // NetSuite will use start_date/end_date
          start_date: new Date(new Date(selectedPeriod).getFullYear(), 0, 1).toISOString().split('T')[0],
          end_date: selectedPeriod,
          period_name: `Period ending ${selectedPeriod}`
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }

      const result = await response.json();

      setSyncResult({
        success: true,
        message: result.message || 'Sync started successfully',
        sync_id: result.sync_id
      });

      // Refresh page data after a delay
      setTimeout(() => {
        setShowERPSyncModal(false);
        window.location.reload(); // Reload to show new data
      }, 3000);

    } catch (error) {
      console.error('Error syncing from ERP:', error);
      setSyncResult({
        success: false,
        message: `Sync failed: ${error.message}`
      });
    } finally {
      setSyncing(false);
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
        let hasAmountColumn = false;

        // Check if file uses Amount column format
        if (jsonData.length > 0) {
          hasAmountColumn = jsonData[0].Amount !== undefined || jsonData[0].amount !== undefined;
        }

        if (hasAmountColumn && columnFormat === 'signed') {
          // For signed Amount column format: Skip balance validation
          // Cannot determine proper debit/credit without COA class mappings
          // Validation will happen during upload after COA is fetched
          setTbValidation({
            isBalanced: true, // Skip validation for signed format
            totalDebit: 0,
            totalCredit: 0,
            difference: 0,
            rowCount: jsonData.length,
            hasAmountColumn: true,
            skipValidation: true // Flag to show different message
          });
        } else {
          // For standard Debit/Credit columns - validate normally
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
            rowCount: jsonData.length,
            hasAmountColumn: false
          });
        }
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

          // Fetch COA to determine account classes via API to bypass RLS
          console.log('[Upload] Fetching COA via API...');
          const coaResponse = await fetch('/api/chart-of-accounts');
          console.log('[Upload] COA API response status:', coaResponse.status);
          if (!coaResponse.ok) {
            throw new Error(`Failed to fetch Chart of Accounts: ${coaResponse.statusText}`);
          }

          const coaData = await coaResponse.json();
          console.log('[Upload] COA data received:', coaData?.length || 0, 'records');

          if (!coaData || coaData.length === 0) {
            console.error('[Upload] COA is empty - blocking upload');
            setUploadStatus({
              success: false,
              message: '⚠️ Chart of Accounts is empty! You must upload your Chart of Accounts before uploading trial balance data. Please go to the Chart of Accounts page and upload your COA first.'
            });
            setUploading(false);
            return;
          }

          const coaMap = {};
          (coaData || []).forEach(acc => {
            coaMap[acc.account_code] = acc.class_name;
          });

          // Log sample COA mappings for debugging
          console.log('[Upload] Sample COA mappings (first 10):', Object.entries(coaMap).slice(0, 10));
          console.log('[Upload] Unique class names in COA:', [...new Set(Object.values(coaMap))]);

          // VALIDATION: Check if ALL account codes in TB file exist in COA
          const accountCodesInTB = [...new Set(jsonData.map(row => row['Account Code'] || row['account_code'] || '').filter(code => code))];
          const missingAccounts = accountCodesInTB.filter(code => !coaMap[code]);

          if (missingAccounts.length > 0) {
            setUploadStatus({
              success: false,
              message: `❌ Upload Blocked: ${missingAccounts.length} account code(s) in your trial balance are not found in the Chart of Accounts. Without COA mapping, the system cannot determine correct debit/credit classification. Missing accounts: ${missingAccounts.slice(0, 10).join(', ')}${missingAccounts.length > 10 ? ` and ${missingAccounts.length - 10} more...` : ''}. Please add these accounts to your Chart of Accounts first.`
            });
            setUploading(false);
            return;
          }

          // Prepare data for Supabase
          const tbRecords = jsonData.map(row => {
            let debit = 0;
            let credit = 0;
            const accountCode = row['Account Code'] || row['account_code'] || '';
            const accountClass = coaMap[accountCode];

            if (columnFormat === 'signed') {
              // User selected "Signed Amount" format - single column with +/- values
              const amount = parseFloat(row.Amount || row.amount || 0);

              // Map based on account class and sign
              // Note: At this point, all accounts are guaranteed to have COA mappings due to validation above
              if (['Assets', 'Expenses'].includes(accountClass)) {
                // Assets/Expenses: positive = debit, negative = credit
                if (amount >= 0) {
                  debit = amount;
                  credit = 0;
                } else {
                  debit = 0;
                  credit = Math.abs(amount);
                }
              } else if (['Liability', 'Liabilities', 'Equity', 'Revenue', 'Income', 'Intercompany'].includes(accountClass)) {
                // Revenue/Liability/Equity: positive = credit, negative = debit
                if (amount >= 0) {
                  debit = 0;
                  credit = amount;
                } else {
                  debit = Math.abs(amount);
                  credit = 0;
                }
              } else {
                // Unknown class: default to debit for positive (treating as Assets)
                console.warn(`Unknown class "${accountClass}" for account ${accountCode}, treating as Assets (debit for positive)`);
                if (amount >= 0) {
                  debit = amount;
                  credit = 0;
                } else {
                  debit = 0;
                  credit = Math.abs(amount);
                }
              }
            } else {
              // Standard Debit/Credit column format
              debit = parseFloat(row.Debit || row.debit || 0);
              credit = parseFloat(row.Credit || row.credit || 0);
            }

            return {
              entity_id: selectedEntity,
              account_code: accountCode,
              account_name: row['Account Name'] || row['account_name'] || '',
              debit: debit,
              credit: credit,
              currency: selectedCurrency,
              period: selectedPeriod,
              uploaded_by: 'System', // Replace with actual user
            };
          });

          // Insert via API
          const response = await fetch('/api/trial-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              records: tbRecords,
              entity_id: selectedEntity,
              period: selectedPeriod
            })
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
          }

          const result = await response.json();

          setUploadStatus({
            success: true,
            message: `Trial Balance uploaded successfully! ${result.count} records inserted in ${selectedCurrency}.`
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
    // Create sample TB template based on selected column format
    let template;

    if (columnFormat === 'signed') {
      // Single Amount column with +/- values
      template = [
        { 'Account Code': '1000', 'Account Name': 'Cash (Asset)', 'Amount': 50000 },
        { 'Account Code': '1100', 'Account Name': 'Accounts Receivable (Asset)', 'Amount': 80000 },
        { 'Account Code': '2000', 'Account Name': 'Accounts Payable (Liability)', 'Amount': 30000 },
        { 'Account Code': '3000', 'Account Name': 'Share Capital (Equity)', 'Amount': 50000 },
        { 'Account Code': '4000', 'Account Name': 'Revenue', 'Amount': 200000 },
        { 'Account Code': '5000', 'Account Name': 'Operating Expenses', 'Amount': 120000 },
        { 'Account Code': '3100', 'Account Name': 'Retained Earnings (Equity)', 'Amount': -50000 }
      ];
    } else {
      // Standard Debit/Credit columns
      template = [
        { 'Account Code': '1000', 'Account Name': 'Cash (Asset)', 'Debit': 50000, 'Credit': 0 },
        { 'Account Code': '1100', 'Account Name': 'Accounts Receivable (Asset)', 'Debit': 80000, 'Credit': 0 },
        { 'Account Code': '2000', 'Account Name': 'Accounts Payable (Liability)', 'Debit': 0, 'Credit': 30000 },
        { 'Account Code': '3000', 'Account Name': 'Share Capital (Equity)', 'Debit': 0, 'Credit': 50000 },
        { 'Account Code': '4000', 'Account Name': 'Revenue', 'Debit': 0, 'Credit': 200000 },
        { 'Account Code': '5000', 'Account Name': 'Operating Expenses', 'Debit': 120000, 'Credit': 0 },
        { 'Account Code': '3100', 'Account Name': 'Retained Earnings (Equity)', 'Debit': 50000, 'Credit': 0 }
      ];
    }

    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Trial Balance');

      // Add filename suffix based on format
      const formatSuffix = columnFormat === 'signed' ? '_SignedAmount' : '_DebitCredit';
      XLSX.writeFile(wb, `TB_Template${formatSuffix}.xlsx`);
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

        // Validate that entity columns match existing entities (case-insensitive)
        const validEntities = entityColumns.filter(col =>
          entities.some(e =>
            e.entity_code?.toLowerCase() === col.toLowerCase() ||
            e.entity_name?.toLowerCase() === col.toLowerCase()
          )
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

          // Fetch COA to determine account classes via API to bypass RLS
          console.log('[Upload] Fetching COA via API...');
          const coaResponse = await fetch('/api/chart-of-accounts');
          console.log('[Upload] COA API response status:', coaResponse.status);
          if (!coaResponse.ok) {
            throw new Error(`Failed to fetch Chart of Accounts: ${coaResponse.statusText}`);
          }

          const coaData = await coaResponse.json();
          console.log('[Upload] COA data received:', coaData?.length || 0, 'records');

          if (!coaData || coaData.length === 0) {
            console.error('[Upload] COA is empty - blocking upload');
            setUploadStatus({
              success: false,
              message: '⚠️ Chart of Accounts is empty! You must upload your Chart of Accounts before uploading trial balance data. Please go to the Chart of Accounts page and upload your COA first.'
            });
            setUploading(false);
            return;
          }

          const coaMap = {};
          (coaData || []).forEach(acc => {
            coaMap[acc.account_code] = acc.class_name;
          });

          // Log sample COA mappings for debugging
          console.log('[Upload] Sample COA mappings (first 10):', Object.entries(coaMap).slice(0, 10));
          console.log('[Upload] Unique class names in COA:', [...new Set(Object.values(coaMap))]);

          // VALIDATION: Check if ALL account codes in TB file exist in COA
          const accountCodesInTB = [...new Set(jsonData.map(row => row['Account Code'] || row['account_code'] || '').filter(code => code))];
          const missingAccounts = accountCodesInTB.filter(code => !coaMap[code]);

          if (missingAccounts.length > 0) {
            setUploadStatus({
              success: false,
              message: `❌ Upload Blocked: ${missingAccounts.length} account code(s) in your trial balance are not found in the Chart of Accounts. Without COA mapping, the system cannot determine correct debit/credit classification. Missing accounts: ${missingAccounts.slice(0, 10).join(', ')}${missingAccounts.length > 10 ? ` and ${missingAccounts.length - 10} more...` : ''}. Please add these accounts to your Chart of Accounts first.`
            });
            setUploading(false);
            return;
          }

          const tbRecords = [];

          // Process each row
          jsonData.forEach(row => {
            const accountCode = row['Account Code'] || row['account_code'] || '';
            const accountName = row['Account Name'] || row['account_name'] || '';
            const accountClass = coaMap[accountCode];

            // For each entity column, create a trial balance record
            bulkValidation.validEntities.forEach(entityCol => {
              const entity = entities.find(e =>
                e.entity_code?.toLowerCase() === entityCol.toLowerCase() ||
                e.entity_name?.toLowerCase() === entityCol.toLowerCase()
              );

              if (entity) {
                const amount = parseFloat(row[entityCol] || 0);
                if (amount !== 0) { // Only insert non-zero amounts
                  let debit = 0;
                  let credit = 0;

                  // Map based on account class and amount sign
                  // Note: At this point, all accounts are guaranteed to have COA mappings due to validation above
                  if (['Assets', 'Expenses'].includes(accountClass)) {
                    // Assets/Expenses: positive = debit, negative = credit
                    if (amount > 0) {
                      debit = amount;
                    } else {
                      credit = Math.abs(amount);
                    }
                  } else if (['Liability', 'Liabilities', 'Equity', 'Revenue', 'Income', 'Intercompany'].includes(accountClass)) {
                    // Revenue/Liability/Equity: positive = credit, negative = debit
                    if (amount > 0) {
                      credit = amount;
                    } else {
                      debit = Math.abs(amount);
                    }
                    // Log Equity accounts specifically for debugging
                    if (accountClass === 'Equity') {
                      console.log(`[Equity Mapping] Account: ${accountCode} (${accountName}), Amount: ${amount}, Mapped to -> Debit: ${debit}, Credit: ${credit}`);
                    }
                  } else {
                    // Unknown class: Treat as Assets (debit for positive)
                    console.warn(`Unknown class "${accountClass}" for account ${accountCode}, treating as Assets (debit for positive)`);
                    if (amount > 0) {
                      debit = amount;
                    } else {
                      credit = Math.abs(amount);
                    }
                  }

                  tbRecords.push({
                    entity_id: entity.id,
                    account_code: accountCode,
                    account_name: accountName,
                    debit: debit,
                    credit: credit,
                    period: selectedPeriod,
                    uploaded_by: 'System'
                  });
                }
              }
            });
          });

          // Get entity IDs for deletion
          const entityIds = bulkValidation.validEntities.map(entityCol =>
            entities.find(e =>
              e.entity_code?.toLowerCase() === entityCol.toLowerCase() ||
              e.entity_name?.toLowerCase() === entityCol.toLowerCase()
            )?.id
          ).filter(Boolean);

          // Fetch existing records for comparison via API
          console.log('Fetching existing records for change tracking...');
          const existingResponse = await fetch('/api/trial-balance');
          const existingData = await existingResponse.json();

          // Filter existing records for this period and these entities
          const existingRecords = existingData.filter(record =>
            entityIds.includes(record.entity_id) && record.period === selectedPeriod
          );

          // Create map of existing records
          const existingMap = {};
          existingRecords.forEach(record => {
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

          const deleteResponse = await fetch(`/api/trial-balance?entity_ids=${entityIds.join(',')}&period=${selectedPeriod}`, {
            method: 'DELETE'
          });

          if (!deleteResponse.ok) {
            const error = await deleteResponse.json();
            throw new Error(`Failed to clear existing records: ${error.error}`);
          }

          // Step 2: Insert all new records via API
          console.log('Inserting', tbRecords.length, 'new records');
          const insertResponse = await fetch('/api/trial-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              records: tbRecords
            })
          });

          if (!insertResponse.ok) {
            const error = await insertResponse.json();
            throw new Error(`Failed to insert records: ${error.error}`);
          }

          const insertResult = await insertResponse.json();
          console.log(`Successfully inserted ${insertResult.count} records`);

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
    if (entities.length === 0) {
      alert('No entities found. Please add entities in Settings > Group Structure first.');
      return;
    }

    // Create template rows with sample data
    const template = [];

    // Sample GL codes with example amounts
    const sampleGLs = [
      { code: '1000', name: 'Cash', amounts: [50000, 75000, 30000, 45000, 60000] },
      { code: '1100', name: 'Accounts Receivable', amounts: [80000, 120000, 60000, 90000, 100000] },
      { code: '2000', name: 'Accounts Payable', amounts: [-30000, -45000, -20000, -35000, -40000] },
      { code: '2100', name: 'Accrued Expenses', amounts: [-15000, -22000, -10000, -18000, -20000] },
      { code: '3000', name: 'Share Capital', amounts: [-50000, -75000, -35000, -60000, -70000] },
      { code: '4000', name: 'Revenue', amounts: [200000, 300000, 150000, 250000, 280000] },
      { code: '5000', name: 'Operating Expenses', amounts: [120000, 180000, 90000, 150000, 170000] }
    ];

    // Create rows with all entities as columns
    sampleGLs.forEach((gl, index) => {
      const row = {
        'Account Code': gl.code,
        'Account Name': gl.name
      };

      // Add a column for each entity with sample amounts
      entities.forEach((entity, entityIndex) => {
        const entityColName = entity.entity_name; // Use entity name as column header
        row[entityColName] = gl.amounts[entityIndex % gl.amounts.length];
      });

      template.push(row);
    });

    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bulk Trial Balance');

      // Generate filename with date
      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Bulk_TB_Template_${today}.xlsx`);
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

              {/* How Bulk Upload Works */}
              <div className="mb-6 p-5 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-900 mb-2">📋 How Bulk Upload Works</h4>
                    <div className="space-y-3 text-sm text-blue-800">
                      <p><strong>File Format:</strong> Excel with columns: Account Code | Account Name | Entity1 | Entity2 | Entity3...</p>

                      <div>
                        <p className="font-bold mb-2">⚠️ IMPORTANT: Sign Convention for Bulk Upload</p>
                        <p className="mb-2">Use <strong>signed amounts</strong> (positive/negative) in your Excel file. The system will automatically map them to Debit/Credit based on account class:</p>
                        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden text-xs">
                          <thead>
                            <tr className="bg-blue-700 text-white">
                              <th className="border border-blue-600 px-3 py-2 text-left">Account Class</th>
                              <th className="border border-blue-600 px-3 py-2 text-center">Positive Amount (+)</th>
                              <th className="border border-blue-600 px-3 py-2 text-center">Negative Amount (-)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-blue-200 px-3 py-2 font-semibold">Assets</td>
                              <td className="border border-blue-200 px-3 py-2 text-center bg-green-50">→ Debit</td>
                              <td className="border border-blue-200 px-3 py-2 text-center bg-amber-50">→ Credit</td>
                            </tr>
                            <tr>
                              <td className="border border-blue-200 px-3 py-2 font-semibold">Liabilities</td>
                              <td className="border border-blue-200 px-3 py-2 text-center bg-green-50">→ Credit</td>
                              <td className="border border-blue-200 px-3 py-2 text-center bg-amber-50">→ Debit</td>
                            </tr>
                            <tr>
                              <td className="border border-blue-200 px-3 py-2 font-semibold">Equity</td>
                              <td className="border border-blue-200 px-3 py-2 text-center bg-green-50">→ Credit</td>
                              <td className="border border-blue-200 px-3 py-2 text-center bg-amber-50">→ Debit</td>
                            </tr>
                            <tr>
                              <td className="border border-blue-200 px-3 py-2 font-semibold">Expenses</td>
                              <td className="border border-blue-200 px-3 py-2 text-center bg-green-50">→ Debit</td>
                              <td className="border border-blue-200 px-3 py-2 text-center bg-amber-50">→ Credit</td>
                            </tr>
                            <tr>
                              <td className="border border-blue-200 px-3 py-2 font-semibold">Revenue</td>
                              <td className="border border-blue-200 px-3 py-2 text-center bg-green-50">→ Credit</td>
                              <td className="border border-blue-200 px-3 py-2 text-center bg-amber-50">→ Debit</td>
                            </tr>
                          </tbody>
                        </table>
                        <p className="mt-2 text-xs text-blue-700">
                          <strong>Example:</strong> Share Capital (Equity) with balance 50,000 → Enter as <strong>+50000</strong> (will map to Credit).
                          Net Loss (Equity) of 10,000 → Enter as <strong>-10000</strong> (will map to Debit).
                        </p>
                      </div>

                      <p className="pt-2"><strong>Currency:</strong> All amounts MUST be in Group Reporting Currency (see below)</p>
                      <p><strong>Period:</strong> Select the ending date and range (e.g., Dec 31, 2024 + 12 months = Full year 2024)</p>
                    </div>
                  </div>
                </div>
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
                <label className="block text-sm font-semibold text-gray-700 mb-3">Period *</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Period End Date</label>
                    <input
                      type="date"
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Period Range</label>
                    <select
                      value={periodMonths}
                      onChange={(e) => setPeriodMonths(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    >
                      <option value="1">1 Month</option>
                      <option value="3">3 Months (Quarter)</option>
                      <option value="6">6 Months (Half Year)</option>
                      <option value="12">12 Months (Full Year)</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Example: Dec 31, 2024 + 12 months = Full year ending Dec 31, 2024
                </p>
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
            <div className="flex items-center gap-3">
              {integrations.length > 0 && (
                <button
                  onClick={() => handleOpenERPSync('trial_balance')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Database size={18} />
                  Sync from ERP
                </button>
              )}
              <button
                onClick={downloadTBTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <Download size={18} />
                Download Template
              </button>
            </div>
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

            {/* Period Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Period *</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Period End Date</label>
                  <input
                    type="date"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Period Range</label>
                  <select
                    value={periodMonths}
                    onChange={(e) => setPeriodMonths(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                  >
                    <option value="1">1 Month</option>
                    <option value="3">3 Months (Quarter)</option>
                    <option value="6">6 Months (Half Year)</option>
                    <option value="12">12 Months (Full Year)</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Example: Dec 31, 2024 + 12 months = Full year ending Dec 31, 2024
              </p>
            </div>

            {/* Column Format Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Excel Column Format *</label>
              <select
                value={columnFormat}
                onChange={(e) => setColumnFormat(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
              >
                <option value="standard">Standard (Separate Debit & Credit columns)</option>
                <option value="signed">Signed Amount (Single Amount column with +/- values)</option>
              </select>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900 font-semibold mb-1">
                  {columnFormat === 'standard' ? '📊 Standard Format' : '📊 Signed Amount Format'}
                </p>
                {columnFormat === 'standard' ? (
                  <p className="text-xs text-blue-800">
                    Excel has <strong>Debit</strong> and <strong>Credit</strong> columns with <strong>positive values only</strong> in each.
                    <br />Example: Revenue with 10,000 credit balance → Debit: 0, Credit: 10,000
                    <br />Example: Cash (Asset) with 5,000 debit balance → Debit: 5,000, Credit: 0
                    <br /><strong>Note:</strong> All amounts should be positive - the Debit/Credit column determines the side.
                  </p>
                ) : (
                  <div className="text-xs text-blue-800">
                    <p className="mb-2">Excel has single <strong>Amount</strong> column with +/- values. System maps based on account class:</p>
                    <table className="w-full border-collapse bg-white rounded text-xs mb-2">
                      <thead>
                        <tr className="bg-blue-600 text-white">
                          <th className="border border-blue-500 px-2 py-1 text-left">Class</th>
                          <th className="border border-blue-500 px-2 py-1 text-center">Positive (+)</th>
                          <th className="border border-blue-500 px-2 py-1 text-center">Negative (-)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-blue-200 px-2 py-1 font-semibold">Assets</td>
                          <td className="border border-blue-200 px-2 py-1 text-center">Debit</td>
                          <td className="border border-blue-200 px-2 py-1 text-center">Credit</td>
                        </tr>
                        <tr>
                          <td className="border border-blue-200 px-2 py-1 font-semibold">Liability</td>
                          <td className="border border-blue-200 px-2 py-1 text-center">Credit</td>
                          <td className="border border-blue-200 px-2 py-1 text-center">Debit</td>
                        </tr>
                        <tr>
                          <td className="border border-blue-200 px-2 py-1 font-semibold">Equity</td>
                          <td className="border border-blue-200 px-2 py-1 text-center">Credit</td>
                          <td className="border border-blue-200 px-2 py-1 text-center">Debit</td>
                        </tr>
                        <tr>
                          <td className="border border-blue-200 px-2 py-1 font-semibold">Expenses</td>
                          <td className="border border-blue-200 px-2 py-1 text-center">Debit</td>
                          <td className="border border-blue-200 px-2 py-1 text-center">Credit</td>
                        </tr>
                        <tr>
                          <td className="border border-blue-200 px-2 py-1 font-semibold">Revenue</td>
                          <td className="border border-blue-200 px-2 py-1 text-center">Credit</td>
                          <td className="border border-blue-200 px-2 py-1 text-center">Debit</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
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
                      {tbValidation.skipValidation ? 'File Validated - Ready for Upload ✓' : (tbValidation.isBalanced ? 'Trial Balance is Balanced ✓' : 'Trial Balance is NOT Balanced')}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700">Total Rows: <span className="font-semibold">{tbValidation.rowCount}</span></p>
                      {tbValidation.skipValidation ? (
                        <p className="text-blue-700 font-semibold">📊 Signed Amount format detected - amounts will be mapped to Debit/Credit based on Chart of Accounts class during upload</p>
                      ) : (
                        <>
                          {tbValidation.hasAmountColumn && (
                            <p className="text-blue-700 font-semibold">📊 Amount column format detected - will map to Debit/Credit based on Chart of Accounts</p>
                          )}
                          <p className="text-gray-700">Total Debit: <span className="font-semibold">{tbValidation.totalDebit.toFixed(2)}</span></p>
                          <p className="text-gray-700">Total Credit: <span className="font-semibold">{tbValidation.totalCredit.toFixed(2)}</span></p>
                          {!tbValidation.isBalanced && (
                            <p className="text-red-700 font-semibold">Difference: {tbValidation.difference.toFixed(2)}</p>
                          )}
                        </>
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
            {integrations.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">•</span>
                <span>Use <strong className="text-blue-700">"Sync from ERP"</strong> button to automatically pull data from your connected ERP system ({integrations[0].integration_name})</span>
              </li>
            )}
          </ul>
          </div>
        </div>
      </div>

      {/* ERP Sync Modal */}
      {showERPSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Database size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Sync from ERP</h3>
                    <p className="text-blue-100 text-sm">
                      {syncType === 'trial_balance' ? 'Sync Trial Balance Data' : 'Sync Chart of Accounts'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowERPSyncModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Integration Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select ERP Integration *
                </label>
                <select
                  value={selectedIntegration}
                  onChange={(e) => setSelectedIntegration(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                  disabled={syncing}
                >
                  <option value="">Choose integration...</option>
                  {integrations.map(integration => (
                    <option key={integration.id} value={integration.id}>
                      {integration.integration_name} ({integration.erp_system.toUpperCase()})
                    </option>
                  ))}
                </select>
                {integrations.length === 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    No integrations configured. Go to <strong>Platform → Integrations Hub</strong> to set up an ERP connection.
                  </p>
                )}
              </div>

              {/* Entity Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Entity *
                </label>
                <select
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                  disabled={syncing}
                >
                  <option value="">Choose entity...</option>
                  {entities.map(entity => (
                    <option key={entity.id} value={entity.id}>
                      {entity.entity_name} ({entity.entity_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Period End Date *
                </label>
                <input
                  type="date"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                  disabled={syncing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Data will be synced for the full year ending on this date
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Zap className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">How ERP Sync Works</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Connects to your ERP system securely via API</li>
                      <li>• Fetches {syncType === 'trial_balance' ? 'trial balance data' : 'chart of accounts'} for the selected entity and period</li>
                      <li>• Automatically maps accounts using your Chart of Accounts</li>
                      <li>• Imports data directly into CLOE database</li>
                      <li>• Process typically takes 30-60 seconds depending on data volume</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sync Result */}
              {syncResult && (
                <div className={`p-4 rounded-lg border-2 ${
                  syncResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {syncResult.success ? (
                      <CheckCircle className="text-green-600 mt-0.5" size={24} />
                    ) : (
                      <XCircle className="text-red-600 mt-0.5" size={24} />
                    )}
                    <div className="flex-1">
                      <h3 className={`font-bold mb-1 ${
                        syncResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {syncResult.success ? 'Sync Started Successfully!' : 'Sync Failed'}
                      </h3>
                      <p className="text-sm text-gray-700">{syncResult.message}</p>
                      {syncResult.sync_id && (
                        <p className="text-xs text-gray-600 mt-2">
                          Sync ID: {syncResult.sync_id}
                        </p>
                      )}
                      {syncResult.success && (
                        <p className="text-xs text-green-700 mt-2 font-medium">
                          Page will reload automatically to show synced data...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowERPSyncModal(false)}
                  disabled={syncing}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleERPSync}
                  disabled={!selectedIntegration || !selectedEntity || !selectedPeriod || syncing}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {syncing ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Database size={20} />
                      Start Sync
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

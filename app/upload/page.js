'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  const [activeSection, setActiveSection] = useState('tb');
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [tbFile, setTbFile] = useState(null);
  const [coaFile, setCoaFile] = useState(null);
  const [tbValidation, setTbValidation] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const { data } = await supabase.from('entities').select('*').order('entity_name');
      setEntities(data || []);
    } catch (error) {
      console.error('Error fetching entities:', error);
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

  const handleCOAFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoaFile(file);
  };

  const handleTBUpload = async () => {
    if (!tbFile || !selectedEntity || !tbValidation?.isBalanced) {
      alert('Please select an entity and ensure TB is balanced');
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
            period: new Date().toISOString().split('T')[0], // Current date as period
            uploaded_by: 'System', // Replace with actual user when auth is implemented
          }));

          // Insert into Supabase
          const { data: insertedData, error } = await supabase
            .from('trial_balance')
            .insert(tbRecords);

          if (error) throw error;

          setUploadStatus({
            success: true,
            message: `Trial Balance uploaded successfully! ${tbRecords.length} records inserted.`
          });
          setTbFile(null);
          setSelectedEntity('');
          setTbValidation(null);

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

  const handleCOAUpload = async () => {
    if (!coaFile) {
      alert('Please select a file');
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
          const coaRecords = jsonData.map(row => ({
            account_code: row['Account Code'] || row['account_code'] || '',
            account_name: row['Account Name'] || row['account_name'] || '',
            account_type: row['Account Type'] || row['account_type'] || '',
            parent_account: row['Parent Account'] || row['parent_account'] || null,
            is_active: (row.Active || row.active || 'Yes').toLowerCase() === 'yes',
          }));

          // Insert into Supabase with upsert to handle duplicates
          const { data: insertedData, error } = await supabase
            .from('chart_of_accounts')
            .upsert(coaRecords, { onConflict: 'account_code' });

          if (error) throw error;

          setUploadStatus({
            success: true,
            message: `Chart of Accounts uploaded successfully! ${coaRecords.length} records processed.`
          });
          setCoaFile(null);

          // Reset file input
          document.getElementById('coa-upload').value = '';
        } catch (error) {
          console.error('Error:', error);
          setUploadStatus({ success: false, message: 'Upload failed: ' + error.message });
        } finally {
          setUploading(false);
        }
      };
      reader.readAsArrayBuffer(coaFile);
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

  const downloadCOATemplate = () => {
    // Create sample COA template
    const template = [
      { 'Account Code': '1000', 'Account Name': 'Cash', 'Account Type': 'Asset', 'Parent Account': '', 'Active': 'Yes' },
      { 'Account Code': '2000', 'Account Name': 'Accounts Payable', 'Account Type': 'Liability', 'Parent Account': '', 'Active': 'Yes' },
      { 'Account Code': '3000', 'Account Name': 'Equity', 'Account Type': 'Equity', 'Parent Account': '', 'Active': 'Yes' }
    ];

    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Chart of Accounts');
      XLSX.writeFile(wb, 'COA_Template.xlsx');
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <div className="max-w-[1400px] mx-auto px-12 py-10">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-[#101828] mb-2">Data Upload</h1>
          <p className="text-lg text-gray-600">Upload Trial Balance and Chart of Accounts</p>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-8 border-b-2 border-gray-300 mb-10">
          {[
            { id: 'tb', label: 'TB Upload' },
            { id: 'coa', label: 'COA Upload' },
            { id: 'templates', label: 'Templates' }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`pb-4 px-2 text-base font-semibold transition-all duration-300 ${
                activeSection === section.id
                  ? 'text-[#101828] border-b-4 border-[#101828] -mb-0.5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* TB Upload Section */}
        {activeSection === 'tb' && (
          <div className="bg-white rounded-[14px] p-8 shadow-sm border border-gray-200 max-w-4xl">
            <h2 className="text-2xl font-bold text-[#101828] mb-6">Upload Trial Balance</h2>

            <div className="space-y-6">
              {/* Entity Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Entity</label>
                <select
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                >
                  <option value="">Select an entity...</option>
                  {entities.map(entity => (
                    <option key={entity.id} value={entity.id}>{entity.entity_name}</option>
                  ))}
                </select>
              </div>

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
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-red-600" size={24} />
                    <p className="text-red-800 font-semibold">{tbValidation.error}</p>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleTBUpload}
                disabled={!tbFile || !selectedEntity || !tbValidation?.isBalanced || uploading}
                className="w-full px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1a2233] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Trial Balance'}
              </button>

              {/* Upload Status */}
              {uploadStatus && (
                <div className={`p-4 rounded-lg ${
                  uploadStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <p className="font-semibold">{uploadStatus.message}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* COA Upload Section */}
        {activeSection === 'coa' && (
          <div className="bg-white rounded-[14px] p-8 shadow-sm border border-gray-200 max-w-4xl">
            <h2 className="text-2xl font-bold text-[#101828] mb-6">Upload Chart of Accounts</h2>

            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Excel File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#101828] transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleCOAFileChange}
                    className="hidden"
                    id="coa-upload"
                  />
                  <label htmlFor="coa-upload" className="cursor-pointer">
                    <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      {coaFile ? coaFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-gray-500">Excel files only (.xlsx, .xls)</p>
                  </label>
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleCOAUpload}
                disabled={!coaFile || uploading}
                className="w-full px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1a2233] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Chart of Accounts'}
              </button>

              {/* Upload Status */}
              {uploadStatus && (
                <div className={`p-4 rounded-lg ${
                  uploadStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <p className="font-semibold">{uploadStatus.message}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Section */}
        {activeSection === 'templates' && (
          <div className="bg-white rounded-[14px] p-8 shadow-sm border border-gray-200 max-w-4xl">
            <h2 className="text-2xl font-bold text-[#101828] mb-6">Download Templates</h2>

            <div className="space-y-4">
              {/* TB Template */}
              <div className="flex items-center justify-between p-6 bg-[#faf9f7] rounded-lg border border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-[#101828] mb-1">Trial Balance Template</h3>
                  <p className="text-sm text-gray-600">Excel template with required columns for TB upload</p>
                </div>
                <button
                  onClick={downloadTBTemplate}
                  className="flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1a2233] transition-colors"
                >
                  <Download size={20} />
                  Download
                </button>
              </div>

              {/* COA Template */}
              <div className="flex items-center justify-between p-6 bg-[#faf9f7] rounded-lg border border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-[#101828] mb-1">Chart of Accounts Template</h3>
                  <p className="text-sm text-gray-600">Excel template with required columns for COA upload</p>
                </div>
                <button
                  onClick={downloadCOATemplate}
                  className="flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1a2233] transition-colors"
                >
                  <Download size={20} />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

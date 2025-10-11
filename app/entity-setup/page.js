'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, X, Download, Upload } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import * as XLSX from 'xlsx';

export default function EntitySetup() {
  const [entities, setEntities] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('All Regions');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    entity_code: '',
    entity_name: '',
    parent_entity_id: null,
    ownership_percentage: 0,
    entity_type: '',
    functional_currency: '',
    presentation_currency: 'Same as functional',
    region_id: null,
    tax_jurisdiction: '',
    financial_year_end: '',
    status: 'Active',
    notes: '',
    include_in_consolidation: true,
    is_active: true
  });

  // Helper function for modal animation
  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsModalClosing(false);
    }, 300);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch entities from API (uses admin client with company_id from JWT)
      const entitiesResponse = await fetch('/api/entities');
      const entitiesData = await entitiesResponse.json();

      // Fetch currencies and regions directly (these are global data)
      const [currenciesData, regionsData] = await Promise.all([
        supabase.from('currencies').select('*').eq('is_active', true).order('currency_code'),
        supabase.from('regions').select('*').eq('is_active', true).order('region_name')
      ]);

      setEntities(entitiesData || []);
      setCurrencies(currenciesData.data || []);
      setRegions(regionsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSave = {
        ...formData,
        presentation_currency: formData.presentation_currency === 'Same as functional'
          ? formData.functional_currency
          : formData.presentation_currency,
        parent_entity_id: formData.parent_entity_id === 'none' ? null : formData.parent_entity_id,
        region_id: formData.region_id === 'none' ? null : formData.region_id
      };

      if (editingEntity) {
        // Update via API
        const response = await fetch('/api/entities', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingEntity.id, ...dataToSave })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update entity');
        }

        const data = await response.json();
        console.log('Updated entity:', data);
      } else {
        // Create via API
        const response = await fetch('/api/entities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create entity');
        }

        const data = await response.json();
        console.log('Inserted entity:', data);
      }

      resetForm();
      fetchAllData();
      setShowModal(false);
      alert('Entity saved successfully!');
    } catch (error) {
      console.error('Error saving entity:', error);
      alert('Error saving entity: ' + error.message);
    }
  };

  const handleEdit = (entity) => {
    setEditingEntity(entity);
    setFormData({
      ...entity,
      parent_entity_id: entity.parent_entity_id || 'none',
      split_ownership: entity.split_ownership || false,
      parent_entity_id_2: entity.parent_entity_id_2 || null,
      ownership_percentage_2: entity.ownership_percentage_2 || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entity?')) return;

    try {
      const response = await fetch(`/api/entities?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete entity');
      }

      fetchAllData();
      alert('Entity deleted successfully!');
    } catch (error) {
      console.error('Error deleting entity:', error);
      alert('Error deleting entity: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      entity_code: '',
      entity_name: '',
      parent_entity_id: null,
      ownership_percentage: 0,
      entity_type: '',
      functional_currency: '',
      presentation_currency: 'Same as functional',
      region_id: null,
      tax_jurisdiction: '',
      financial_year_end: '',
      status: 'Active',
      notes: '',
      include_in_consolidation: true,
      is_active: true
    });
    setEditingEntity(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.entity_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = filterRegion === 'All Regions' || entity.region === filterRegion;
    const matchesStatus = filterStatus === 'All Status' || entity.status === filterStatus;
    return matchesSearch && matchesRegion && matchesStatus;
  });

  const availableRegions = ['All Regions', ...regions.map(r => r.region_name)];
  const statuses = ['All Status', 'Active', 'Inactive'];

  // Download Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Entity Code': 'PARENT01',
        'Entity Name': 'Parent Company Ltd.',
        'Parent Entity Code': '',
        'Ownership %': 0,
        'Entity Type': 'Ultimate Parent',
        'Functional Currency': 'USD',
        'Presentation Currency': 'USD',
        'Region': 'North America',
        'Tax Jurisdiction': 'Delaware',
        'Status': 'Active',
        'Include in Consolidation': 'Yes',
        'Notes': 'Ultimate parent entity - top of the group'
      },
      {
        'Entity Code': 'MID001',
        'Entity Name': 'Mid-Tier Holding Company',
        'Parent Entity Code': 'PARENT01',
        'Ownership %': 100,
        'Entity Type': 'Parent',
        'Functional Currency': 'EUR',
        'Presentation Currency': 'USD',
        'Region': 'Europe',
        'Tax Jurisdiction': 'UK',
        'Status': 'Active',
        'Include in Consolidation': 'Yes',
        'Notes': 'Mid-tier parent - has parent above and subsidiaries below'
      },
      {
        'Entity Code': 'SUB001',
        'Entity Name': 'Subsidiary Inc.',
        'Parent Entity Code': 'MID001',
        'Ownership %': 100,
        'Entity Type': 'Subsidiary',
        'Functional Currency': 'USD',
        'Presentation Currency': 'USD',
        'Region': 'North America',
        'Tax Jurisdiction': 'Delaware',
        'Status': 'Active',
        'Include in Consolidation': 'Yes',
        'Notes': 'Wholly owned subsidiary'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    const wscols = [
      { wch: 15 }, // Entity Code
      { wch: 30 }, // Entity Name
      { wch: 20 }, // Parent Entity Code
      { wch: 12 }, // Ownership %
      { wch: 15 }, // Entity Type
      { wch: 18 }, // Functional Currency
      { wch: 20 }, // Presentation Currency
      { wch: 18 }, // Region
      { wch: 18 }, // Tax Jurisdiction
      { wch: 10 }, // Status
      { wch: 22 }, // Include in Consolidation
      { wch: 40 }  // Notes
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Entity Template');

    XLSX.writeFile(workbook, 'Entity_Upload_Template.xlsx');
  };

  // Handle Bulk Upload
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert('No data found in the uploaded file');
        setIsUploading(false);
        return;
      }

      // Validate and transform data
      const entitiesToInsert = [];
      const errors = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowNum = i + 2; // Excel row number (accounting for header)

        // Validate required fields
        if (!row['Entity Code'] || !row['Entity Name']) {
          errors.push(`Row ${rowNum}: Missing Entity Code or Entity Name`);
          continue;
        }

        // Find parent entity ID if parent code is provided
        let parentEntityId = null;
        if (row['Parent Entity Code']) {
          const parentEntity = entities.find(e => e.entity_code === row['Parent Entity Code']);
          if (!parentEntity) {
            errors.push(`Row ${rowNum}: Parent entity '${row['Parent Entity Code']}' not found`);
            continue;
          }
          parentEntityId = parentEntity.id;
        }

        // Find region ID if region is provided
        let regionId = null;
        if (row['Region']) {
          const region = regions.find(r => r.region_name === row['Region'] || r.region_code === row['Region']);
          regionId = region?.id || null;
        }

        // Transform row to entity object
        const entity = {
          entity_code: row['Entity Code'],
          entity_name: row['Entity Name'],
          parent_entity_id: parentEntityId,
          ownership_percentage: parseFloat(row['Ownership %']) || 0,
          entity_type: row['Entity Type'] || '',
          functional_currency: row['Functional Currency'] || '',
          presentation_currency: row['Presentation Currency'] || row['Functional Currency'] || '',
          region_id: regionId,
          tax_jurisdiction: row['Tax Jurisdiction'] || '',
          financial_year_end: row['Financial Year End'] || '',
          status: row['Status'] || 'Active',
          notes: row['Notes'] || '',
          include_in_consolidation: row['Include in Consolidation']?.toLowerCase() === 'yes' || true,
          is_active: row['Status']?.toLowerCase() === 'active' || true
        };

        entitiesToInsert.push(entity);
      }

      if (errors.length > 0) {
        alert(`Upload errors:\n${errors.join('\n')}`);
        setIsUploading(false);
        return;
      }

      // Insert entities via API (one at a time to handle validation)
      let successCount = 0;
      const errors = [];

      for (const entity of entitiesToInsert) {
        try {
          const response = await fetch('/api/entities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entity)
          });

          if (!response.ok) {
            const error = await response.json();
            errors.push(`${entity.entity_code}: ${error.error}`);
          } else {
            successCount++;
          }
        } catch (error) {
          errors.push(`${entity.entity_code}: ${error.message}`);
        }
      }

      if (errors.length > 0) {
        alert(`Upload completed with ${successCount} success and ${errors.length} errors:\n${errors.join('\n')}`);
      } else {
        alert(`Successfully uploaded ${successCount} entities!`);
      }
      fetchAllData();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error processing file: ' + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-[#101828] text-lg">Loading entities...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader title="Entity Setup" subtitle="Manage and configure your consolidation entities">
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          <Download size={16} />
          Download Template
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Upload size={16} />
          {isUploading ? 'Uploading...' : 'Upload Template'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleBulkUpload}
          className="hidden"
        />

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-[#101828] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] transition-colors"
        >
          Add Entity
        </button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          {/* Filters */}
          <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search entities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828] placeholder-gray-400"
                />
              </div>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828] bg-white min-w-[160px]"
              >
                {availableRegions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828] bg-white min-w-[150px]"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-gray-200 rounded-[14px] shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Entity Code</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Entity Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Parent Entity</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Functional Currency</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Presentation Currency</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Ownership %</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntities.map((entity, index) => {
                  // Find parent entity name
                  const parentEntity = entities.find(e => e.id === entity.parent_entity_id);
                  const parentName = parentEntity ? parentEntity.entity_name : '-';

                  return (
                    <tr key={entity.id} className={`border-b border-gray-200 hover:bg-[#faf8f4] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#faf9f7]'}`}>
                      <td className="px-6 py-4 text-sm font-semibold text-[#101828]">{entity.entity_code}</td>
                      <td className="px-6 py-4 text-base font-medium text-[#101828]">{entity.entity_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{parentName}</td>
                      <td className="px-6 py-4 text-sm text-[#101828]">{entity.functional_currency}</td>
                      <td className="px-6 py-4 text-sm text-[#101828]">{entity.presentation_currency || entity.functional_currency}</td>
                      <td className="px-6 py-4 text-sm text-[#101828]">{entity.ownership_percentage ? entity.ownership_percentage.toFixed(2) : '0.00'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded ${
                          entity.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {entity.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(entity)}
                          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entity.id)}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredEntities.length === 0 && (
              <div className="text-center py-16 text-gray-500 bg-white">
                <p className="text-base">No entities found. Click &quot;Add Entity&quot; to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {(showModal || isModalClosing) && (
        <div className={`fixed right-0 top-0 h-full w-[800px] bg-white shadow-2xl z-50 overflow-y-auto ${isModalClosing ? 'animate-slideOutRight' : 'animate-slideLeft'}`}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{editingEntity ? 'Edit Entity' : 'Add New Entity'}</h3>
                <p className="text-sm text-slate-300 mt-1">Configure entity details and relationships</p>
              </div>
              <button
                onClick={() => { closeModal(); resetForm(); }}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Entity Code *
                    </label>
                    <input
                      type="text"
                      name="entity_code"
                      value={formData.entity_code}
                      onChange={handleChange}
                      placeholder="e.g., US-001"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Entity Type *
                    </label>
                    <select
                      name="entity_type"
                      value={formData.entity_type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    >
                      <option value="">Select type...</option>
                      <option value="Ultimate Parent">Ultimate Parent</option>
                      <option value="Parent">Parent</option>
                      <option value="Subsidiary">Subsidiary</option>
                      <option value="Joint Venture">Joint Venture</option>
                      <option value="Associate">Associate</option>
                      <option value="Branch">Branch</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Entity Name *
                    </label>
                    <input
                      type="text"
                      name="entity_name"
                      value={formData.entity_name}
                      onChange={handleChange}
                      placeholder="Full legal entity name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Entity</label>
                    <select
                      name="parent_entity_id"
                      value={formData.parent_entity_id || 'none'}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    >
                      <option value="none">None (Ultimate Parent)</option>
                      {entities.filter(e => e.id !== editingEntity?.id).map(entity => (
                        <option key={entity.id} value={entity.id}>{entity.entity_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ownership % (by Parent 1) *
                    </label>
                    <input
                      type="number"
                      name="ownership_percentage"
                      value={formData.ownership_percentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    />
                  </div>

                  {/* Split Ownership Checkbox */}
                  <div className="col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                      <input
                        type="checkbox"
                        name="split_ownership"
                        checked={formData.split_ownership}
                        onChange={handleChange}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="text-sm font-semibold text-[#101828]">Split Ownership</span>
                        <p className="text-xs text-gray-600 mt-0.5">Enable if this entity has multiple parent entities (e.g., Joint Venture with 2 partners)</p>
                      </div>
                    </label>
                  </div>

                  {/* Second Parent Fields (only shown if split ownership is checked) */}
                  {formData.split_ownership && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Entity 2 *</label>
                        <select
                          name="parent_entity_id_2"
                          value={formData.parent_entity_id_2 || 'none'}
                          onChange={handleChange}
                          required={formData.split_ownership}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                        >
                          <option value="none">Select second parent...</option>
                          {entities.filter(e => e.id !== editingEntity?.id && e.id !== formData.parent_entity_id).map(entity => (
                            <option key={entity.id} value={entity.id}>{entity.entity_name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ownership % (by Parent 2) *
                        </label>
                        <input
                          type="number"
                          name="ownership_percentage_2"
                          value={formData.ownership_percentage_2}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="0.01"
                          required={formData.split_ownership}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Functional Currency *
                    </label>
                    <select
                      name="functional_currency"
                      value={formData.functional_currency}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    >
                      <option value="">Select currency...</option>
                      {currencies.map(curr => (
                        <option key={curr.id} value={curr.currency_code}>{curr.currency_code} - {curr.currency_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Presentation Currency</label>
                    <select
                      name="presentation_currency"
                      value={formData.presentation_currency}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    >
                      <option value="Same as functional">Same as functional</option>
                      {currencies.map(curr => (
                        <option key={curr.id} value={curr.currency_code}>{curr.currency_code}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Region
                    </label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    >
                      <option value="">Select region...</option>
                      {regions.map(reg => (
                        <option key={reg.id} value={reg.region_name}>{reg.region_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Jurisdiction</label>
                    <input
                      type="text"
                      name="tax_jurisdiction"
                      value={formData.tax_jurisdiction}
                      onChange={handleChange}
                      placeholder="e.g., Delaware"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes / Additional Information</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Optional notes about this entity..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828] resize-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="include_in_consolidation"
                        checked={formData.include_in_consolidation}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-gray-300 text-[#101828] focus:ring-[#101828]"
                      />
                      <span className="font-medium text-gray-700">Include in consolidation scope</span>
                    </label>
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 sticky bottom-0 bg-white pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 hover:shadow-lg transition-all duration-200 shadow-md"
                  >
                    Save Entity
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
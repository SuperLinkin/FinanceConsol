'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, X } from 'lucide-react';

export default function EntitySetup() {
  const [entities, setEntities] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('All Regions');
  const [filterStatus, setFilterStatus] = useState('All Status');
  
  const [formData, setFormData] = useState({
    entity_code: '',
    entity_name: '',
    parent_entity_id: null,
    ownership_percentage: 0,
    entity_type: '',
    functional_currency: '',
    presentation_currency: 'Same as functional',
    region: '',
    country_of_incorporation: '',
    tax_jurisdiction: '',
    financial_year_end: '',
    status: 'Active',
    notes: '',
    include_in_consolidation: true,
    is_active: true
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [entitiesData, currenciesData, regionsData] = await Promise.all([
        supabase.from('entities').select('*').order('created_at', { ascending: false }),
        supabase.from('currencies').select('*').eq('is_active', true).order('currency_code'),
        supabase.from('regions').select('*').eq('is_active', true).order('region_name')
      ]);
      
      setEntities(entitiesData.data || []);
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
        parent_entity_id: formData.parent_entity_id === 'none' ? null : formData.parent_entity_id
      };

      if (editingEntity) {
        const { error } = await supabase
          .from('entities')
          .update({ ...dataToSave, updated_at: new Date().toISOString() })
          .eq('id', editingEntity.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('entities')
          .insert([dataToSave]);
        
        if (error) throw error;
      }
      
      resetForm();
      fetchAllData();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving entity:', error);
      alert('Error saving entity: ' + error.message);
    }
  };

  const handleEdit = (entity) => {
    setEditingEntity(entity);
    setFormData({
      ...entity,
      parent_entity_id: entity.parent_entity_id || 'none'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entity?')) return;
    
    try {
      const { error } = await supabase
        .from('entities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchAllData();
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
      region: '',
      country_of_incorporation: '',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="text-[#101828] text-lg">Loading entities...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <div className="max-w-[1600px] mx-auto px-12 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold text-[#101828] mb-2">Entity Setup</h1>
            <p className="text-lg text-gray-600">Manage organizational entities and hierarchy</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1a2233] transition-colors"
          >
            Add Entity
          </button>
        </div>

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
          <thead className="bg-[#101828]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Entity Code</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Entity Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Region</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Currency</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Ownership %</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntities.map((entity, index) => (
              <tr key={entity.id} className={`border-b border-gray-200 hover:bg-[#faf8f4] transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#faf9f7]'}`}>
                <td className="px-6 py-4 text-sm font-semibold text-[#101828]">{entity.entity_code}</td>
                <td className="px-6 py-4 text-base font-medium text-[#101828]">{entity.entity_name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{entity.region || '-'}</td>
                <td className="px-6 py-4 text-sm text-[#101828]">{entity.functional_currency}</td>
                <td className="px-6 py-4 text-sm text-[#101828]">{entity.ownership_percentage.toFixed(2)}</td>
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
                      className="px-4 py-2 bg-[#101828] text-white text-sm font-medium rounded-lg hover:bg-[#1a2233] transition-colors"
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
            ))}
          </tbody>
        </table>
        
        {filteredEntities.length === 0 && (
          <div className="text-center py-16 text-gray-500 bg-white">
            <p className="text-base">No entities found. Click "Add Entity" to get started.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-end">
          <div className="bg-white h-full w-[800px] shadow-2xl animate-slideRight overflow-y-auto">
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-[#101828]">
                  {editingEntity ? 'Edit Entity' : 'Add New Entity'}
                </h2>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

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
                      Ownership % *
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
                      Region *
                    </label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    >
                      <option value="">Select region...</option>
                      {regions.map(reg => (
                        <option key={reg.id} value={reg.region_name}>{reg.region_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Country of Incorporation *
                    </label>
                    <input
                      type="text"
                      name="country_of_incorporation"
                      value={formData.country_of_incorporation}
                      onChange={handleChange}
                      placeholder="e.g., United States"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                    />
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
                      Financial Year End *
                    </label>
                    <input
                      type="date"
                      name="financial_year_end"
                      value={formData.financial_year_end}
                      onChange={handleChange}
                      required
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
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#101828] text-white rounded-full font-semibold hover:bg-[#1a2233] transition-colors shadow-lg"
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
    </div>
  );
}
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
      <div className="p-8 bg-white min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading entities...</div>
      </div>
    );
  }

  return (
    <div className="p-12 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-black">Entity Setup</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-6 py-2.5 bg-[#2d2d2d] text-white rounded font-medium hover:bg-black transition-colors"
        >
          Add Entity
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-600 placeholder-gray-400"
          />
        </div>
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 bg-white min-w-[140px]"
        >
          {availableRegions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 bg-white min-w-[130px]"
        >
          {statuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="border border-gray-300 rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f0ede5]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase">Entity Code</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase">Entity Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase">Region</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase">Currency</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase">Ownership %</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntities.map((entity, index) => (
              <tr key={entity.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 text-sm font-semibold text-black">{entity.entity_code}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{entity.entity_name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{entity.region || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{entity.functional_currency}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{entity.ownership_percentage.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-[#7fa989] text-white text-xs font-medium rounded">
                    {entity.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleEdit(entity)} 
                    className="text-sm text-black font-medium hover:underline"
                  >
                    Edit
                  </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#3a3b3e] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-700 px-8 py-5 flex justify-between items-center sticky top-0 bg-[#3a3b3e] z-10">
              <h2 className="text-xl font-bold text-white">Entity Setup - Enhanced Configuration</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="mx-8 mt-6 px-4 py-3 bg-blue-900 bg-opacity-30 border border-blue-600 rounded flex items-start gap-3">
              <div className="text-blue-400 mt-0.5">ℹ</div>
              <p className="text-sm text-blue-200">Complete entity configuration for consolidation purposes</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Entity Code <span className="text-red-400">*</span>
                  </label>
                  <input type="text" name="entity_code" value={formData.entity_code} onChange={handleChange}
                    placeholder="e.g., US-001" required
                    className="w-full px-3 py-2.5 bg-[#2b2d31] border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Entity Type <span className="text-red-400">*</span>
                  </label>
                  <select name="entity_type" value={formData.entity_type} onChange={handleChange} required
                    className="w-full px-3 py-2.5 bg-[#2b2d31] border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select type...</option>
                    <option value="Subsidiary">Subsidiary</option>
                    <option value="Joint Venture">Joint Venture</option>
                    <option value="Associate">Associate</option>
                    <option value="Branch">Branch</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Entity Name <span className="text-red-400">*</span>
                  </label>
                  <input type="text" name="entity_name" value={formData.entity_name} onChange={handleChange}
                    placeholder="Full legal entity name" required
                    className="w-full px-3 py-2.5 bg-[#2b2d31] border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Parent Entity</label>
                  <select name="parent_entity_id" value={formData.parent_entity_id || 'none'} onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-[#2b2d31] border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="none">None (Ultimate Parent)</option>
                    {entities.filter(e => e.id !== editingEntity?.id).map(entity => (
                      <option key={entity.id} value={entity.id}>{entity.entity_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ownership % <span className="text-red-400">*</span>
                  </label>
                  <input type="number" name="ownership_percentage" value={formData.ownership_percentage} onChange={handleChange}
                    min="0" max="100" step="0.01" required
                    className="w-full px-3 py-2.5 bg-[#2b2d31] border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Functional Currency <span className="text-red-400">*</span>
                  </label>
                  <select name="functional_currency" value={formData.functional_currency} onChange={handleChange} required
                    className="w-full px-3 py-2.5 bg-[#2b2d31] border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select currency...</option>
                    {currencies.map(curr => (
                      <option key={curr.id} value={curr.currency_code}>{curr.currency_code} - {curr.currency_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Presentation Currency</label>
                  <select name="presentation_currency" value={formData.presentation_currency} onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-[#2b2d31] border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="Same as functional">Same as functional</option>
                    {currencies.map(curr => (
                      <option key={curr.id} value={curr.currency_code}>{curr.currency_code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Region <span className="text-red-400">*</span>
                  </label>
                  <select name="region" value={formData.region} onChange={handleChange} required
                    className="w-full px-3 py-2.5 bg-[#2b2d31] border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select region...</option>
                    {regions.map(reg => (
                      <option key={reg.id} value={reg.region_name}>{reg.region_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country of Incorporation <span className="text-red-400">*</span>
                  </label>
                  <input type="text" name="country_of_incorporation" value={formData.country_of_incorporation} onChange={handleChange}
                    placeholder="e.g., United States" required
                    className="w-full px-3 py-2.5 bg-[#2b2d31] border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tax Jurisdiction</label>
                  <input type="text" name="tax_jurisdiction" value={formData.tax_jurisdiction} onChange={handleChange}
                    placeholder="e.g., Delaware"
                    className="w-full px-3 py-2.5 bg-[#2b2d31] border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Financial Year End <span className="text-red-400">*</span>
                  </label>
                  <input type="date" name="financial_year_end" value={formData.financial_year_end} onChange={handleChange} required
                    className="w-full px-3 py-2.5 bg-[#2b2d31] border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status <span className="text-red-400">*</span>
                  </label>
                  <select name="status" value={formData.status} onChange={handleChange} required
                    className="w-full px-3 py-2.5 bg-[#2b2d31] border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes / Additional Information</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"
                    placeholder="Optional notes about this entity..."
                    className="w-full px-3 py-2.5 bg-[#2b2d31] border border-gray-600 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="include_in_consolidation" checked={formData.include_in_consolidation} onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-300">Include in consolidation scope</span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-700">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-2.5 border border-gray-500 rounded text-gray-300 font-medium hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-6 py-2.5 bg-white text-black rounded font-medium hover:bg-gray-100 transition-colors">
                  Save Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
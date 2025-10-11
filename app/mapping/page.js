'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Link2, CheckCircle, AlertCircle, X, Save } from 'lucide-react';

export default function MappingPage() {
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [entityGLCodes, setEntityGLCodes] = useState([]);
  const [masterCOA, setMasterCOA] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [selectedGL, setSelectedGL] = useState(null);
  const [selectedMasterGL, setSelectedMasterGL] = useState('');
  const [toast, setToast] = useState(null);

  // Helper function for panel animation
  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsModalClosing(false);
    }, 300);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedEntity) {
      fetchEntityGLCodes();
      fetchMappings();
    }
  }, [selectedEntity]);

  const fetchInitialData = async () => {
    try {
      const [entitiesData, coaData] = await Promise.all([
        supabase.from('entities').select('*').order('entity_name'),
        supabase.from('chart_of_accounts').select('*').order('account_code')
      ]);

      setEntities(entitiesData.data || []);
      setMasterCOA(coaData.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntityGLCodes = async () => {
    try {
      // Get unique GL codes from trial balance for selected entity
      const { data, error } = await supabase
        .from('trial_balance')
        .select('account_code, account_name')
        .eq('entity_id', selectedEntity)
        .order('account_code');

      if (error) throw error;

      // Get unique GL codes
      const uniqueGLs = [];
      const seen = new Set();

      (data || []).forEach(item => {
        if (!seen.has(item.account_code)) {
          seen.add(item.account_code);
          uniqueGLs.push({
            entity_gl_code: item.account_code,
            entity_gl_name: item.account_name
          });
        }
      });

      setEntityGLCodes(uniqueGLs);
    } catch (error) {
      console.error('Error fetching entity GL codes:', error);
    }
  };

  const fetchMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('entity_gl_mapping')
        .select('*')
        .eq('entity_id', selectedEntity);

      if (error) throw error;
      setMappings(data || []);
    } catch (error) {
      console.error('Error fetching mappings:', error);
    }
  };

  const getMappingForGL = (entityGLCode) => {
    return mappings.find(m => m.entity_gl_code === entityGLCode);
  };

  const getMasterGLDetails = (masterGLCode) => {
    return masterCOA.find(gl => gl.account_code === masterGLCode);
  };

  const openMappingModal = (entityGL) => {
    setSelectedGL(entityGL);
    const existingMapping = getMappingForGL(entityGL.entity_gl_code);
    setSelectedMasterGL(existingMapping?.master_gl_code || '');
    setShowModal(true);
  };

  const handleSaveMapping = async () => {
    if (!selectedMasterGL) {
      showToast('Please select a Master GL code', false);
      return;
    }

    try {
      const mappingData = {
        entity_id: selectedEntity,
        entity_gl_code: selectedGL.entity_gl_code,
        entity_gl_name: selectedGL.entity_gl_name,
        master_gl_code: selectedMasterGL,
        mapped_by: 'System', // Replace with actual user
        is_active: true
      };

      const { error } = await supabase
        .from('entity_gl_mapping')
        .upsert(mappingData, { onConflict: 'entity_id,entity_gl_code' });

      if (error) throw error;

      showToast('Mapping saved successfully', true);
      setShowModal(false);
      fetchMappings();
    } catch (error) {
      console.error('Error saving mapping:', error);
      showToast('Error saving mapping: ' + error.message, false);
    }
  };

  const handleDeleteMapping = async (mappingId) => {
    if (!confirm('Remove this mapping?')) return;

    try {
      const { error } = await supabase
        .from('entity_gl_mapping')
        .delete()
        .eq('id', mappingId);

      if (error) throw error;

      showToast('Mapping removed', true);
      fetchMappings();
    } catch (error) {
      console.error('Error deleting mapping:', error);
      showToast('Error removing mapping', false);
    }
  };

  const showToast = (message, success = true) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredGLCodes = entityGLCodes.filter(gl =>
    gl.entity_gl_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gl.entity_gl_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mappedCount = entityGLCodes.filter(gl => getMappingForGL(gl.entity_gl_code)).length;
  const unmappedCount = entityGLCodes.length - mappedCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="text-[#101828] text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <div className="max-w-[1600px] mx-auto px-12 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-[#101828] mb-2">GL Mapping</h1>
          <p className="text-lg text-gray-600">Map entity GL codes to Master Chart of Accounts</p>
        </div>

        {/* Entity Selection & Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="col-span-2 bg-white rounded-[14px] p-6 shadow-sm border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Entity</label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
            >
              <option value="">Choose an entity...</option>
              {entities.map(entity => (
                <option key={entity.id} value={entity.id}>{entity.entity_name}</option>
              ))}
            </select>
          </div>

          {selectedEntity && (
            <>
              <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200">
                <div className="text-sm font-semibold text-gray-600 mb-1">Mapped GL Codes</div>
                <div className="text-3xl font-bold text-green-600">{mappedCount}</div>
                <div className="text-sm text-gray-500 mt-1">of {entityGLCodes.length} total</div>
              </div>

              <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200">
                <div className="text-sm font-semibold text-gray-600 mb-1">Unmapped GL Codes</div>
                <div className="text-3xl font-bold text-orange-600">{unmappedCount}</div>
                <div className="text-sm text-gray-500 mt-1">require mapping</div>
              </div>
            </>
          )}
        </div>

        {selectedEntity && (
          <>
            {/* Search Bar */}
            <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search entity GL codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                />
              </div>
            </div>

            {/* Mapping Table */}
            <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-[#101828] text-white py-4 px-6">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2 font-bold text-sm">Entity GL Code</div>
                  <div className="col-span-3 font-bold text-sm">Entity GL Name</div>
                  <div className="col-span-2 font-bold text-sm">Master GL Code</div>
                  <div className="col-span-3 font-bold text-sm">Master COA Hierarchy</div>
                  <div className="col-span-1 font-bold text-sm">Status</div>
                  <div className="col-span-1 font-bold text-sm text-right">Action</div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredGLCodes.length === 0 ? (
                  <div className="py-16 text-center text-gray-500">
                    {entityGLCodes.length === 0
                      ? 'No GL codes found for this entity. Upload a Trial Balance first.'
                      : 'No GL codes match your search.'}
                  </div>
                ) : (
                  filteredGLCodes.map((gl, index) => {
                    const mapping = getMappingForGL(gl.entity_gl_code);
                    const masterGL = mapping ? getMasterGLDetails(mapping.master_gl_code) : null;
                    const isMapped = !!mapping;

                    return (
                      <div
                        key={gl.entity_gl_code}
                        className={`grid grid-cols-12 gap-4 py-4 px-6 hover:bg-[#faf8f4] transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-[#faf9f7]'
                        }`}
                      >
                        <div className="col-span-2 font-semibold text-[#101828]">
                          {gl.entity_gl_code}
                        </div>
                        <div className="col-span-3 text-gray-700">
                          {gl.entity_gl_name}
                        </div>
                        <div className="col-span-2 font-semibold text-[#101828]">
                          {masterGL?.account_code || '—'}
                        </div>
                        <div className="col-span-3">
                          {masterGL ? (
                            <div className="text-sm text-gray-600">
                              <div><strong>Class:</strong> {masterGL.class_level}</div>
                              <div><strong>Note:</strong> {masterGL.note_level}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not mapped</span>
                          )}
                        </div>
                        <div className="col-span-1">
                          {isMapped ? (
                            <CheckCircle size={20} className="text-green-600" />
                          ) : (
                            <AlertCircle size={20} className="text-orange-500" />
                          )}
                        </div>
                        <div className="col-span-1 text-right">
                          <button
                            onClick={() => openMappingModal(gl)}
                            className="px-4 py-2 bg-[#101828] text-white text-sm font-medium rounded-lg hover:bg-[#1a2233] transition-colors"
                          >
                            {isMapped ? 'Edit' : 'Map'}
                          </button>
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

      {/* Mapping Modal */}
      {(showModal || isModalClosing) && (
        <div className={`fixed right-0 top-0 h-full w-[700px] bg-white shadow-2xl z-50 overflow-y-auto ${isModalClosing ? 'animate-slideOutRight' : 'animate-slideLeft'}`}>
          <div className="h-full flex flex-col">
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Map GL Code</h3>
                <p className="text-sm text-slate-300 mt-1">Map entity GL to master chart of accounts</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">

              <div className="space-y-6">
                {/* Entity GL Info */}
                <div className="bg-[#faf9f7] rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Entity GL Code</h3>
                  <div className="text-2xl font-bold text-[#101828] mb-2">{selectedGL?.entity_gl_code}</div>
                  <div className="text-base text-gray-700">{selectedGL?.entity_gl_name}</div>
                </div>

                {/* Master GL Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Master GL Code *
                  </label>
                  <select
                    value={selectedMasterGL}
                    onChange={(e) => setSelectedMasterGL(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                  >
                    <option value="">Select Master GL...</option>
                    {masterCOA.map(gl => (
                      <option key={gl.account_code} value={gl.account_code}>
                        {gl.account_code} - {gl.account_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preview of selected Master GL */}
                {selectedMasterGL && (
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-900 mb-3">Master COA Hierarchy</h3>
                    {(() => {
                      const details = getMasterGLDetails(selectedMasterGL);
                      return details ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Class:</span>
                            <span className="text-[#101828] font-semibold">{details.class_level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Sub-Class:</span>
                            <span className="text-[#101828] font-semibold">{details.subclass_level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Note:</span>
                            <span className="text-[#101828] font-semibold">{details.note_level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 font-medium">Sub-Note:</span>
                            <span className="text-[#101828] font-semibold">{details.subnote_level}</span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="mt-8 sticky bottom-0 bg-white pt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveMapping}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#101828] text-white rounded-full font-semibold hover:bg-[#1a2233] transition-colors shadow-lg"
                >
                  <Save size={20} />
                  Save Mapping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg animate-slideUp ${
          toast.success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="font-semibold">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

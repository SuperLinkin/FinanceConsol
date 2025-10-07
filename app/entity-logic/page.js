'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Edit2, Trash2, X, Save, Key, GitMerge, Calculator } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function EntityLogicPage() {
  const [activeTab, setActiveTab] = useState('entities');
  const [entities, setEntities] = useState([]);
  const [logics, setLogics] = useState([]);
  const [filteredLogics, setFilteredLogics] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [showModal, setShowModal] = useState(false);
  const [editingLogic, setEditingLogic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [logicForm, setLogicForm] = useState({
    logic_key: '',
    logic_name: '',
    logic_type: '',
    description: '',
    configuration: {
      // Translation configs
      applies_to_class: '',
      rate_type: '',
      fctr_account: '',
      // Consolidation configs
      ownership_percentage: 100,
      elimination_accounts: [],
      // Custom formula
      formula: '',
      conditions: []
    },
    is_active: true
  });

  const LOGIC_TYPES = [
    'Currency Translation',
    'Full Consolidation',
    'Equity Method',
    'Proportionate Consolidation',
    'Custom Calculation'
  ];

  const RATE_TYPES = ['Closing Rate', 'Average Rate', 'Historical Rate'];
  const ACCOUNT_CLASSES = ['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'];

  useEffect(() => {
    fetchEntities();
    fetchLogics();
    fetchGLAccounts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logics, searchQuery, filterType]);

  const fetchEntities = async () => {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .order('entity_name');

      if (error) {
        console.error('Error fetching entities:', error);
        throw error;
      }

      console.log('Fetched entities:', data);
      setEntities(data || []);
    } catch (error) {
      console.error('Error fetching entities:', error);
      setEntities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogics = async () => {
    try {
      const { data, error } = await supabase
        .from('entity_logic')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist yet, just set empty array silently
        setLogics([]);
        return;
      }
      setLogics(data || []);
    } catch (error) {
      // Silently handle errors - table might not exist yet
      setLogics([]);
    }
  };

  const fetchGLAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('account_code, account_name, class_level')
        .order('account_code');

      if (error) throw error;
      setGlAccounts(data || []);
    } catch (error) {
      console.error('Error fetching GL accounts:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...logics];

    if (searchQuery) {
      filtered = filtered.filter(logic =>
        logic.logic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        logic.logic_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        logic.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'All Types') {
      filtered = filtered.filter(logic => logic.logic_type === filterType);
    }

    setFilteredLogics(filtered);
  };

  const generateLogicKey = (logicName, logicType) => {
    const typePrefix = logicType.split(' ').map(w => w[0]).join('').toUpperCase();
    const nameSlug = logicName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${typePrefix}_${nameSlug}_${timestamp}`;
  };

  const openAddModal = () => {
    setEditingLogic(null);
    setLogicForm({
      logic_key: '',
      logic_name: '',
      logic_type: '',
      description: '',
      configuration: {
        applies_to_class: '',
        rate_type: '',
        fctr_account: '',
        ownership_percentage: 100,
        elimination_accounts: [],
        formula: '',
        conditions: []
      },
      is_active: true
    });
    setShowModal(true);
  };

  const openEditModal = (logic) => {
    setEditingLogic(logic);
    setLogicForm({
      logic_key: logic.logic_key,
      logic_name: logic.logic_name,
      logic_type: logic.logic_type,
      description: logic.description || '',
      configuration: logic.configuration || {
        applies_to_class: '',
        rate_type: '',
        fctr_account: '',
        ownership_percentage: 100,
        elimination_accounts: [],
        formula: '',
        conditions: []
      },
      is_active: logic.is_active
    });
    setShowModal(true);
  };

  const handleSaveLogic = async () => {
    try {
      if (!logicForm.logic_name || !logicForm.logic_type) {
        showToast('Logic name and type are required', false);
        return;
      }

      // Validate based on logic type
      if (logicForm.logic_type === 'Currency Translation') {
        if (!logicForm.configuration.applies_to_class || !logicForm.configuration.rate_type) {
          showToast('Account class and rate type are required for translation logic', false);
          return;
        }
      }

      const logicKey = editingLogic
        ? logicForm.logic_key
        : generateLogicKey(logicForm.logic_name, logicForm.logic_type);

      const logicData = {
        logic_key: logicKey,
        logic_name: logicForm.logic_name,
        logic_type: logicForm.logic_type,
        description: logicForm.description,
        configuration: logicForm.configuration,
        is_active: logicForm.is_active,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingLogic) {
        ({ error } = await supabase
          .from('entity_logic')
          .update(logicData)
          .eq('id', editingLogic.id));
      } else {
        ({ error } = await supabase
          .from('entity_logic')
          .insert([logicData]));
      }

      if (error) throw error;

      showToast(
        `Logic '${logicForm.logic_name}' ${editingLogic ? 'updated' : 'created'} successfully`,
        true
      );
      setShowModal(false);
      fetchLogics();
    } catch (error) {
      console.error('Error saving logic:', error);
      showToast('Error saving logic: ' + error.message, false);
    }
  };

  const handleDeleteLogic = async (logic) => {
    if (!confirm(`Delete logic '${logic.logic_name}'? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('entity_logic')
        .delete()
        .eq('id', logic.id);

      if (error) throw error;

      showToast(`Logic '${logic.logic_name}' deleted`, true);
      fetchLogics();
    } catch (error) {
      console.error('Error deleting logic:', error);
      showToast('Error deleting logic: ' + error.message, false);
    }
  };

  const showToast = (message, success = true) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3000);
  };

  const updateConfiguration = (field, value) => {
    setLogicForm({
      ...logicForm,
      configuration: {
        ...logicForm.configuration,
        [field]: value
      }
    });
  };

  const renderConfigurationForm = () => {
    const { logic_type } = logicForm;

    if (logic_type === 'Currency Translation') {
      return (
        <div className="space-y-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Calculator size={18} />
            Translation Configuration
          </h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Applies to Account Class *</label>
            <select
              value={logicForm.configuration.applies_to_class}
              onChange={(e) => updateConfiguration('applies_to_class', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
            >
              <option value="">Select class...</option>
              {ACCOUNT_CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Exchange Rate Type *</label>
            <select
              value={logicForm.configuration.rate_type}
              onChange={(e) => updateConfiguration('rate_type', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
            >
              <option value="">Select rate type...</option>
              {RATE_TYPES.map(rate => (
                <option key={rate} value={rate}>{rate}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Foreign Currency Translation Reserve (FCTR) Account</label>
            <select
              value={logicForm.configuration.fctr_account}
              onChange={(e) => updateConfiguration('fctr_account', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
            >
              <option value="">Select FCTR account...</option>
              {glAccounts.filter(acc => acc.class_level === 'Equity').map(acc => (
                <option key={acc.account_code} value={acc.account_code}>
                  {acc.account_code} - {acc.account_name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1">Translation differences will be posted to this account</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-300">
            <div className="text-sm font-semibold text-gray-700 mb-2">Calculation Logic:</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Translate <strong>{logicForm.configuration.applies_to_class || '[Class]'}</strong> accounts using <strong>{logicForm.configuration.rate_type || '[Rate]'}</strong></div>
              <div>• Post translation differences to <strong>{logicForm.configuration.fctr_account ? `${logicForm.configuration.fctr_account}` : '[FCTR Account]'}</strong></div>
              <div>• Formula: Translated Amount = Functional Currency Amount × Exchange Rate ({logicForm.configuration.rate_type})</div>
            </div>
          </div>
        </div>
      );
    }

    if (logic_type === 'Full Consolidation') {
      return (
        <div className="space-y-6 bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
            <Calculator size={18} />
            Consolidation Configuration
          </h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ownership Percentage</label>
            <input
              type="number"
              min="0"
              max="100"
              value={logicForm.configuration.ownership_percentage}
              onChange={(e) => updateConfiguration('ownership_percentage', parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
            />
          </div>

          <div className="bg-white rounded-lg p-4 border border-green-300">
            <div className="text-sm font-semibold text-gray-700 mb-2">Consolidation Logic:</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Include 100% of subsidiary&apos;s assets, liabilities, income, and expenses</div>
              <div>• Eliminate parent&apos;s investment in subsidiary</div>
              <div>• Recognize non-controlling interest (NCI) at {100 - logicForm.configuration.ownership_percentage}%</div>
              <div>• Eliminate intercompany transactions and balances</div>
            </div>
          </div>
        </div>
      );
    }

    if (logic_type === 'Equity Method') {
      return (
        <div className="space-y-6 bg-purple-50 rounded-lg p-6 border border-purple-200">
          <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Calculator size={18} />
            Equity Method Configuration
          </h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ownership Percentage</label>
            <input
              type="number"
              min="0"
              max="100"
              value={logicForm.configuration.ownership_percentage}
              onChange={(e) => updateConfiguration('ownership_percentage', parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
            />
          </div>

          <div className="bg-white rounded-lg p-4 border border-purple-300">
            <div className="text-sm font-semibold text-gray-700 mb-2">Equity Method Logic:</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Recognize investment at cost initially</div>
              <div>• Adjust for share of profit/loss: Investment += (Net Income × {logicForm.configuration.ownership_percentage}%)</div>
              <div>• Reduce for dividends received: Investment -= (Dividends × {logicForm.configuration.ownership_percentage}%)</div>
              <div>• Do not consolidate line-by-line</div>
            </div>
          </div>
        </div>
      );
    }

    if (logic_type === 'Proportionate Consolidation') {
      return (
        <div className="space-y-6 bg-orange-50 rounded-lg p-6 border border-orange-200">
          <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
            <Calculator size={18} />
            Proportionate Consolidation Configuration
          </h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ownership Percentage</label>
            <input
              type="number"
              min="0"
              max="100"
              value={logicForm.configuration.ownership_percentage}
              onChange={(e) => updateConfiguration('ownership_percentage', parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
            />
          </div>

          <div className="bg-white rounded-lg p-4 border border-orange-300">
            <div className="text-sm font-semibold text-gray-700 mb-2">Proportionate Consolidation Logic:</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Include {logicForm.configuration.ownership_percentage}% of subsidiary&apos;s assets and liabilities</div>
              <div>• Include {logicForm.configuration.ownership_percentage}% of subsidiary&apos;s income and expenses</div>
              <div>• Eliminate parent&apos;s investment in joint venture</div>
              <div>• No non-controlling interest recognized</div>
            </div>
          </div>
        </div>
      );
    }

    if (logic_type === 'Custom Calculation') {
      return (
        <div className="space-y-6 bg-gray-50 rounded-lg p-6 border border-gray-300">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calculator size={18} />
            Custom Calculation Formula
          </h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Formula</label>
            <textarea
              value={logicForm.configuration.formula}
              onChange={(e) => updateConfiguration('formula', e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828] font-mono text-sm"
              placeholder="Example:&#10;IF {ACCOUNT_CLASS} = 'Assets' THEN&#10;  {AMOUNT} * {CLOSING_RATE}&#10;ELSE&#10;  {AMOUNT} * {AVERAGE_RATE}&#10;END"
            />
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-400">
            <div className="text-sm font-semibold text-gray-700 mb-2">Available Variables:</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>• {'{AMOUNT}'} - Account balance</div>
              <div>• {'{CLOSING_RATE}'} - Period-end rate</div>
              <div>• {'{AVERAGE_RATE}'} - Period average rate</div>
              <div>• {'{HISTORICAL_RATE}'} - Historical rate</div>
              <div>• {'{ACCOUNT_CLASS}'} - Account class</div>
              <div>• {'{OWNERSHIP_%}'} - Ownership percentage</div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-slate-900 text-lg">Loading Entity Logic...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader title="Entity Logic" subtitle="Configure entity relationships and ownership structure" />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('entities')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'entities'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Entity Overview
          </button>
          <button
            onClick={() => setActiveTab('logics')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'logics'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Logic Rules
          </button>
        </div>

        {activeTab === 'entities' && (
          <>
            <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-slate-900 text-white py-4 px-6">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2 font-bold text-sm">Entity Code</div>
                  <div className="col-span-3 font-bold text-sm">Entity Name</div>
                  <div className="col-span-2 font-bold text-sm">Region</div>
                  <div className="col-span-2 font-bold text-sm">Functional Currency</div>
                  <div className="col-span-2 font-bold text-sm">Reporting Currency</div>
                  <div className="col-span-1 font-bold text-sm">Method</div>
                </div>
              </div>

              <div>
                {entities.length === 0 ? (
                  <div className="py-16 text-center text-gray-500">
                    No entities found. Add entities in Entity Setup.
                  </div>
                ) : (
                  entities.map((entity, index) => {
                    const bgShade = index % 2 === 0 ? 'bg-white' : 'bg-[#faf9f7]';
                    const needsTranslation = entity.functional_currency !== entity.presentation_currency;

                    return (
                      <div
                        key={entity.id}
                        className={`${bgShade} border-b border-gray-200 hover:bg-[#faf8f4] transition-all duration-250`}
                      >
                        <div className="grid grid-cols-12 gap-4 py-4 px-6 items-center">
                          <div className="col-span-2 font-semibold text-slate-900">
                            {entity.entity_code}
                          </div>
                          <div className="col-span-3 font-medium text-gray-900">
                            {entity.entity_name}
                          </div>
                          <div className="col-span-2 text-sm text-gray-700">
                            {entity.region_id || '—'}
                          </div>
                          <div className="col-span-2 text-sm text-gray-700">
                            {entity.functional_currency || '—'}
                          </div>
                          <div className="col-span-2 text-sm text-gray-700">
                            {entity.presentation_currency || '—'}
                            {needsTranslation && (
                              <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
                                Needs Translation
                              </span>
                            )}
                          </div>
                          <div className="col-span-1 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                              {entity.consolidation_method || 'Full'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <GitMerge size={20} />
                Consolidation & Translation Workflow
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">1.</span>
                  <span>Create <strong>actionable logic rules</strong> with specific calculations and GL account mappings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">2.</span>
                  <span>Each logic generates a unique <strong>Logic Key</strong> that executes the defined calculation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">3.</span>
                  <span>Translation differences are automatically posted to the specified FCTR account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">4.</span>
                  <span>Consolidation logic defines ownership %, elimination accounts, and calculation methods</span>
                </li>
              </ul>
            </div>
          </>
        )}

        {activeTab === 'logics' && (
          <>
            <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search logic name, key, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                >
                  <option>All Types</option>
                  {LOGIC_TYPES.map(type => <option key={type}>{type}</option>)}
                </select>

                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Plus size={20} />
                  Create Logic
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-slate-900 text-white py-4 px-6">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2 font-bold text-sm">Logic Key</div>
                  <div className="col-span-2 font-bold text-sm">Logic Name</div>
                  <div className="col-span-2 font-bold text-sm">Type</div>
                  <div className="col-span-4 font-bold text-sm">Configuration</div>
                  <div className="col-span-1 font-bold text-sm text-center">Status</div>
                  <div className="col-span-1 font-bold text-sm">Actions</div>
                </div>
              </div>

              <div>
                {filteredLogics.length === 0 ? (
                  <div className="py-16 text-center text-gray-500">
                    No logic rules found. Click &quot;Create Logic&quot; to add one.
                  </div>
                ) : (
                  filteredLogics.map((logic, index) => {
                    const bgShade = index % 2 === 0 ? 'bg-white' : 'bg-[#faf9f7]';
                    const config = logic.configuration || {};

                    let configSummary = '';
                    if (logic.logic_type === 'Currency Translation') {
                      configSummary = `${config.applies_to_class} @ ${config.rate_type} → ${config.fctr_account || 'N/A'}`;
                    } else if (logic.logic_type === 'Full Consolidation') {
                      configSummary = `${config.ownership_percentage}% ownership`;
                    } else if (logic.logic_type === 'Equity Method') {
                      configSummary = `${config.ownership_percentage}% equity method`;
                    } else if (logic.logic_type === 'Intercompany Elimination') {
                      configSummary = `${config.elimination_accounts?.length || 0} accounts`;
                    }

                    return (
                      <div
                        key={logic.id}
                        className={`${bgShade} border-b border-gray-200 hover:bg-[#faf8f4] transition-all duration-250 group`}
                      >
                        <div className="grid grid-cols-12 gap-4 py-4 px-6 items-center">
                          <div className="col-span-2 font-mono text-xs font-semibold text-slate-900 bg-gray-100 px-2 py-1 rounded">
                            {logic.logic_key}
                          </div>
                          <div className="col-span-2 font-medium text-gray-900">
                            {logic.logic_name}
                          </div>
                          <div className="col-span-2">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                              {logic.logic_type}
                            </span>
                          </div>
                          <div className="col-span-4 text-xs text-gray-600 font-mono">
                            {configSummary}
                          </div>
                          <div className="col-span-1 text-center">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              logic.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {logic.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="col-span-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(logic)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteLogic(logic)}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none">
          <div className="bg-white h-full w-[800px] shadow-2xl animate-slideRight overflow-y-auto pointer-events-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-slate-900">
                  {editingLogic ? 'Edit Logic Rule' : 'Create Logic Rule'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {editingLogic && (
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                      <Key size={16} />
                      <span className="font-semibold">Logic Key</span>
                    </div>
                    <div className="font-mono text-lg font-bold text-slate-900">
                      {logicForm.logic_key}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Logic Name *</label>
                  <input
                    type="text"
                    value={logicForm.logic_name}
                    onChange={(e) => setLogicForm({...logicForm, logic_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    placeholder="e.g., Assets Closing Rate Translation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Logic Type *</label>
                  <select
                    value={logicForm.logic_type}
                    onChange={(e) => setLogicForm({...logicForm, logic_type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                  >
                    <option value="">Select type...</option>
                    {LOGIC_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={logicForm.description}
                    onChange={(e) => setLogicForm({...logicForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    placeholder="Brief description of this logic rule..."
                  />
                </div>

                {renderConfigurationForm()}

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={logicForm.is_active}
                      onChange={(e) => setLogicForm({...logicForm, is_active: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="font-medium text-gray-700">Active</span>
                  </label>
                </div>

                {!editingLogic && logicForm.logic_name && logicForm.logic_type && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-sm font-semibold text-blue-900 mb-2">Generated Logic Key Preview:</div>
                    <div className="font-mono text-sm font-bold text-blue-800">
                      {generateLogicKey(logicForm.logic_name, logicForm.logic_type)}
                    </div>
                    <div className="text-xs text-blue-700 mt-2">
                      This key will be used to execute this logic in calculations
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 sticky bottom-0 bg-white pt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveLogic}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg"
                >
                  <Save size={20} />
                  {editingLogic ? 'Update Logic' : 'Create Logic'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

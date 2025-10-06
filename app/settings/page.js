'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronDown, ChevronUp, Lock, Unlock, Check, X, Save } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('currencies');
  const [currencies, setCurrencies] = useState([]);
  const [regions, setRegions] = useState([]);
  const [controllers, setControllers] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [systemParams, setSystemParams] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedRegion, setExpandedRegion] = useState(null);
  const [selectedController, setSelectedController] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [currencyForm, setCurrencyForm] = useState({
    currency_code: '', currency_name: '', symbol: '', decimal_precision: 2,
    is_group_currency: false, is_functional_currency: false, rate_source: 'Manual',
    exchange_rate: 1, approved_by: '', is_locked: false
  });

  const [regionForm, setRegionForm] = useState({
    region_code: '', region_name: '', description: '', associated_currency: '',
    reporting_calendar: 'Jan-Dec', regulatory_framework: 'IFRS', parent_region_id: null,
    controller_id: null, intra_region_netting: false
  });

  const [controllerForm, setControllerForm] = useState({
    name: '', role: 'Entity Controller', email: '', reporting_to: null, is_active: true
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [curr, reg, ctrl, per, params] = await Promise.all([
        supabase.from('currencies').select('*').order('currency_code'),
        supabase.from('regions').select('*').order('region_name'),
        supabase.from('entity_controllers').select('*').order('name'),
        supabase.from('reporting_periods').select('*').order('period_start'),
        supabase.from('system_parameters').select('*')
      ]);

      setCurrencies(curr.data || []);
      setRegions(reg.data || []);
      setControllers(ctrl.data || []);
      setPeriods(per.data || []);
      
      const paramsObj = {};
      (params.data || []).forEach(p => {
        if (!paramsObj[p.parameter_category]) paramsObj[p.parameter_category] = {};
        paramsObj[p.parameter_category][p.parameter_key] = p.parameter_value;
      });
      setSystemParams(paramsObj);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrency = async () => {
    if (!currencyForm.currency_code || !currencyForm.currency_name) return;
    try {
      const { error } = await supabase.from('currencies').insert([currencyForm]);
      if (error) throw error;
      setCurrencyForm({
        currency_code: '', currency_name: '', symbol: '', decimal_precision: 2,
        is_group_currency: false, is_functional_currency: false, rate_source: 'Manual',
        exchange_rate: 1, approved_by: '', is_locked: false
      });
      setHasChanges(false);
      fetchAllData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const saveRegion = async () => {
    if (!regionForm.region_code || !regionForm.region_name) return;
    try {
      const { error } = await supabase.from('regions').insert([regionForm]);
      if (error) throw error;
      setRegionForm({
        region_code: '', region_name: '', description: '', associated_currency: '',
        reporting_calendar: 'Jan-Dec', regulatory_framework: 'IFRS', parent_region_id: null,
        controller_id: null, intra_region_netting: false
      });
      fetchAllData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const saveController = async () => {
    if (!controllerForm.name || !controllerForm.email) return;
    try {
      const { error } = await supabase.from('entity_controllers').insert([controllerForm]);
      if (error) throw error;
      setControllerForm({
        name: '', role: 'Entity Controller', email: '', reporting_to: null, is_active: true
      });
      fetchAllData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const updateSystemParam = async (category, key, value) => {
    try {
      const { error } = await supabase.from('system_parameters')
        .update({ parameter_value: value, updated_at: new Date() })
        .match({ parameter_category: category, parameter_key: key });
      if (error) throw error;
      fetchAllData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center"><div className="text-[#101828]">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <div className="max-w-[1400px] mx-auto px-12 py-10">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-[#101828] mb-2">Configuration</h1>
          <p className="text-lg text-gray-600">IFRS Consolidation Hub</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b-2 border-gray-300 mb-10">
          {['Currencies', 'Regions', 'Controllers', 'Reporting Periods', 'System Parameters'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '_'))}
              className={`pb-4 px-2 text-base font-semibold transition-all duration-300 ${
                activeTab === tab.toLowerCase().replace(' ', '_')
                  ? 'text-[#101828] border-b-4 border-[#101828] -mb-0.5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* CURRENCIES TAB */}
        {activeTab === 'currencies' && (
          <div className="grid grid-cols-3 gap-8">
            {/* Left: Form */}
            <div className="col-span-2 bg-white rounded-[14px] p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#101828] mb-6">Currency Configuration</h2>
              
              {/* Currency Basics */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#101828] mb-4">Currency Basics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Currency Code</label>
                    <input
                      type="text"
                      maxLength={3}
                      value={currencyForm.currency_code}
                      onChange={(e) => {
                        setCurrencyForm({...currencyForm, currency_code: e.target.value.toUpperCase()});
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                      placeholder="USD"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Currency Name</label>
                    <input
                      type="text"
                      value={currencyForm.currency_name}
                      onChange={(e) => {
                        setCurrencyForm({...currencyForm, currency_name: e.target.value});
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                      placeholder="US Dollar"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Symbol</label>
                    <input
                      type="text"
                      value={currencyForm.symbol}
                      onChange={(e) => {
                        setCurrencyForm({...currencyForm, symbol: e.target.value});
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                      placeholder="$"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Decimal Precision</label>
                    <select
                      value={currencyForm.decimal_precision}
                      onChange={(e) => {
                        setCurrencyForm({...currencyForm, decimal_precision: parseInt(e.target.value)});
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                    >
                      {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Usage Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#101828] mb-4">Usage</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={currencyForm.is_group_currency}
                      onChange={(e) => {
                        setCurrencyForm({...currencyForm, is_group_currency: e.target.checked});
                        setHasChanges(true);
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-[#101828] focus:ring-[#101828]"
                    />
                    <span className="font-medium text-gray-700">Is Group Presentation Currency</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={currencyForm.is_functional_currency}
                      onChange={(e) => {
                        setCurrencyForm({...currencyForm, is_functional_currency: e.target.checked});
                        setHasChanges(true);
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-[#101828] focus:ring-[#101828]"
                    />
                    <span className="font-medium text-gray-700">Is Functional Currency</span>
                  </label>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Default Exchange Rate Source</label>
                  <select
                    value={currencyForm.rate_source}
                    onChange={(e) => {
                      setCurrencyForm({...currencyForm, rate_source: e.target.value});
                      setHasChanges(true);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                  >
                    <option>ECB</option>
                    <option>Manual</option>
                    <option>Treasury Feed</option>
                  </select>
                </div>
              </div>

              {/* Governance */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#101828] mb-4">Governance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Approved By</label>
                    <input
                      type="text"
                      value={currencyForm.approved_by}
                      onChange={(e) => {
                        setCurrencyForm({...currencyForm, approved_by: e.target.value});
                        setHasChanges(true);
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                      placeholder="Controller name"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={currencyForm.is_locked}
                        onChange={(e) => {
                          setCurrencyForm({...currencyForm, is_locked: e.target.checked});
                          setHasChanges(true);
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-[#101828] focus:ring-[#101828]"
                      />
                      <span className="font-medium text-gray-700">Lock Status (disable edit after approval)</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={saveCurrency}
                className="px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1a2233] transition-colors"
              >
                Add Currency
              </button>
            </div>

            {/* Right: Active Rates Summary */}
            <div className="bg-[#faf9f7] rounded-[14px] p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-[#101828] mb-4">Active Currencies</h3>
              <div className="space-y-3">
                {currencies.map(curr => (
                  <div key={curr.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-[#101828]">{curr.currency_code}</div>
                        <div className="text-sm text-gray-600">{curr.currency_name}</div>
                      </div>
                      {curr.is_locked && <Lock size={16} className="text-gray-500" />}
                    </div>
                    <div className="text-sm text-gray-600">
                      Rate: {(curr.exchange_rate || 1).toFixed(6)}
                    </div>
                    {curr.is_group_currency && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">Group Currency</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REGIONS TAB */}
        {activeTab === 'regions' && (
          <div className="grid grid-cols-3 gap-8">
            {/* Left: Add Region Form */}
            <div className="col-span-2 bg-white rounded-[14px] p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#101828] mb-6">Add New Region</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Region Code</label>
                    <input
                      type="text"
                      value={regionForm.region_code}
                      onChange={(e) => setRegionForm({...regionForm, region_code: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                      placeholder="EU"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Region Name</label>
                    <input
                      type="text"
                      value={regionForm.region_name}
                      onChange={(e) => setRegionForm({...regionForm, region_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                      placeholder="Europe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={regionForm.description}
                    onChange={(e) => setRegionForm({...regionForm, description: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                    rows="2"
                    placeholder="Regional description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Associated Currency</label>
                    <select
                      value={regionForm.associated_currency}
                      onChange={(e) => setRegionForm({...regionForm, associated_currency: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      {currencies.map(c => <option key={c.id} value={c.currency_code}>{c.currency_code}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reporting Calendar</label>
                    <select
                      value={regionForm.reporting_calendar}
                      onChange={(e) => setRegionForm({...regionForm, reporting_calendar: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                    >
                      <option>Jan-Dec</option>
                      <option>Apr-Mar</option>
                      <option>Jul-Jun</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Regulatory Framework</label>
                    <select
                      value={regionForm.regulatory_framework}
                      onChange={(e) => setRegionForm({...regionForm, regulatory_framework: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                    >
                      <option>IFRS</option>
                      <option>Dutch GAAP</option>
                      <option>Local GAAP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Region</label>
                    <select
                      value={regionForm.parent_region_id || ''}
                      onChange={(e) => setRegionForm({...regionForm, parent_region_id: e.target.value || null})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                    >
                      <option value="">None</option>
                      {regions.map(r => (
                        <option key={r.id} value={r.id}>{r.region_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Controller Responsible</label>
                    <select
                      value={regionForm.controller_id || ''}
                      onChange={(e) => setRegionForm({...regionForm, controller_id: e.target.value || null})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      {controllers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={regionForm.intra_region_netting}
                      onChange={(e) => setRegionForm({...regionForm, intra_region_netting: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-[#101828] focus:ring-[#101828]"
                    />
                    <span className="font-medium text-gray-700">Intra-region netting enabled</span>
                  </label>
                </div>

                <button
                  onClick={saveRegion}
                  className="px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1a2233] transition-colors"
                >
                  Add Region
                </button>
              </div>
            </div>

            {/* Right: Active Regions List */}
            <div className="bg-[#faf9f7] rounded-[14px] p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-[#101828] mb-4">Active Regions</h3>
              <div className="space-y-3">
                {regions.map(region => (
                  <div key={region.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="font-bold text-[#101828]">{region.region_name}</div>
                    <div className="text-sm text-gray-600">{region.region_code}</div>
                    <div className="text-xs text-gray-500 mt-2">{region.regulatory_framework}</div>
                    {region.associated_currency && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                          {region.associated_currency}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTROLLERS TAB */}
        {activeTab === 'controllers' && (
          <div className="grid grid-cols-3 gap-8">
            {/* Left: Add Controller Form */}
            <div className="col-span-2 bg-white rounded-[14px] p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#101828] mb-6">Add New Controller</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={controllerForm.name}
                    onChange={(e) => setControllerForm({...controllerForm, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={controllerForm.email}
                      onChange={(e) => setControllerForm({...controllerForm, email: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <select
                      value={controllerForm.role}
                      onChange={(e) => setControllerForm({...controllerForm, role: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                    >
                      <option>Group Controller</option>
                      <option>Entity Controller</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reporting To</label>
                  <select
                    value={controllerForm.reporting_to || ''}
                    onChange={(e) => setControllerForm({...controllerForm, reporting_to: e.target.value || null})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {controllers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={controllerForm.is_active}
                      onChange={(e) => setControllerForm({...controllerForm, is_active: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-[#101828] focus:ring-[#101828]"
                    />
                    <span className="font-medium text-gray-700">Active Status</span>
                  </label>
                </div>

                <button
                  onClick={saveController}
                  className="px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1a2233] transition-colors"
                >
                  Add Controller
                </button>
              </div>
            </div>

            {/* Right: Active Controllers List */}
            <div className="bg-[#faf9f7] rounded-[14px] p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-[#101828] mb-4">Active Controllers</h3>
              <div className="space-y-3">
                {controllers.map(ctrl => (
                  <div key={ctrl.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="font-bold text-[#101828]">{ctrl.name}</div>
                    <div className="text-sm text-gray-600">{ctrl.email}</div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        ctrl.role === 'Group Controller'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ctrl.role || 'Entity Controller'}
                      </span>
                    </div>
                    {ctrl.is_active !== undefined && !ctrl.is_active && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                          Inactive
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REPORTING PERIODS TAB */}
        {activeTab === 'reporting_periods' && (
          <div>
            <div className="mb-6 overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
                  <div key={month} className="w-48 bg-[#faf9f7] rounded-[14px] p-6 border-2 border-gray-200 hover:border-[#101828] transition-all cursor-pointer">
                    <div className="text-sm font-semibold text-gray-600 mb-2">{month} 2025</div>
                    <div className="mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        idx < 3 ? 'bg-red-100 text-red-800' : idx < 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {idx < 3 ? 'Locked' : idx < 6 ? 'Pre-Close' : 'Open'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Start: {month} 1</div>
                      <div>End: {month} {[1,3,5,7,8,10,12].includes(idx+1) ? '31' : idx === 1 ? '28' : '30'}</div>
                    </div>
                    {idx < 3 && (
                      <div className="mt-3 flex items-center gap-1 text-gray-600">
                        <Lock size={14} />
                        <span className="text-xs">Locked</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM PARAMETERS TAB */}
        {activeTab === 'system_parameters' && (
          <div className="space-y-6">
            {/* Currency Rules */}
            <div className="bg-white rounded-[14px] p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#101828] mb-6">Currency Rules</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Group Presentation Currency</label>
                  <select
                    value={systemParams.currency_rules?.group_presentation_currency || 'USD'}
                    onChange={(e) => updateSystemParam('currency_rules', 'group_presentation_currency', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    {currencies.map(c => <option key={c.id} value={c.currency_code}>{c.currency_code} - {c.currency_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rate Variance Tolerance (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={systemParams.currency_rules?.rate_variance_tolerance || '2.0'}
                    onChange={(e) => updateSystemParam('currency_rules', 'rate_variance_tolerance', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rounding Precision Policy</label>
                  <select
                    value={systemParams.currency_rules?.rounding_precision || 'group'}
                    onChange={(e) => updateSystemParam('currency_rules', 'rounding_precision', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option value="entity">Entity Level</option>
                    <option value="group">Group Level</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Translation Rules */}
            <div className="bg-white rounded-[14px] p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#101828] mb-6">Translation Rules</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assets/Liabilities Translation Method</label>
                  <select
                    value={systemParams.translation_rules?.assets_liabilities_method || 'Closing Rate'}
                    onChange={(e) => updateSystemParam('translation_rules', 'assets_liabilities_method', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option>Closing Rate</option>
                    <option>Average Rate</option>
                    <option>Historical Rate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Revenue/Expenses Translation Method</label>
                  <select
                    value={systemParams.translation_rules?.revenue_expenses_method || 'Average Rate'}
                    onChange={(e) => updateSystemParam('translation_rules', 'revenue_expenses_method', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option>Average Rate</option>
                    <option>Closing Rate</option>
                    <option>Historical Rate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Equity Translation Method</label>
                  <select
                    value={systemParams.translation_rules?.equity_method || 'Historical'}
                    onChange={(e) => updateSystemParam('translation_rules', 'equity_method', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option>Historical</option>
                    <option>Closing Rate</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Consolidation Settings */}
            <div className="bg-white rounded-[14px] p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-[#101828] mb-6">Consolidation Settings</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Default Consolidation Method</label>
                  <select
                    value={systemParams.consolidation_settings?.default_method || 'Full'}
                    onChange={(e) => updateSystemParam('consolidation_settings', 'default_method', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option>Full</option>
                    <option>Proportionate</option>
                    <option>Equity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">IC Elimination Logic</label>
                  <select
                    value={systemParams.consolidation_settings?.ic_elimination_logic || 'Automatic'}
                    onChange={(e) => updateSystemParam('consolidation_settings', 'ic_elimination_logic', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  >
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Save Bar */}
        {hasChanges && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#101828] text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-slideUp z-50">
            <Save size={20} />
            <span className="font-semibold">Unsaved changes</span>
            <button
              onClick={saveCurrency}
              className="px-6 py-2 bg-white text-[#101828] rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Save Configuration
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease; }
        .animate-slideRight { animation: slideRight 0.3s ease; }
        .animate-slideUp { animation: slideUp 0.3s ease; }
      `}</style>
    </div>
  );
}
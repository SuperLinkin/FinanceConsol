'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronDown, ChevronUp, Lock, Unlock, Check, X, Save, Shield, Plus, Edit, Trash2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import GroupStructureTab from '@/components/GroupStructureTab';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('group_structure');
  const [currencies, setCurrencies] = useState([]);
  const [regions, setRegions] = useState([]);
  const [controllers, setControllers] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [systemParams, setSystemParams] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedRegion, setExpandedRegion] = useState(null);
  const [selectedController, setSelectedController] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [periodForm, setPeriodForm] = useState({
    period_name: '', period_type: 'Month-End', period_date: '', fiscal_year: new Date().getFullYear(), is_locked: false
  });

  const [currencyForm, setCurrencyForm] = useState({
    currency_code: '', currency_name: '', symbol: '',
    is_presentation_currency: false, is_functional_currency: false,
    is_group_reporting_currency: false,
    exchange_rate: 1.0, is_active: true
  });
  const [worldCurrencies, setWorldCurrencies] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState('USD');

  const [regionForm, setRegionForm] = useState({
    region_code: '', region_name: '', description: '', associated_currency: '',
    reporting_calendar: 'Jan-Dec', regulatory_framework: 'IFRS', parent_region_id: null,
    controller_id: null, intra_region_netting: false
  });

  const [controllerForm, setControllerForm] = useState({
    name: '', role: 'Entity Controller', email: '', reporting_to: null, is_ultimate_owner: false, is_active: true
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [curr, worldCurr, reg, ctrl, per, params] = await Promise.all([
        fetch('/api/company-currencies').then(res => res.json()),
        supabase.from('world_currencies').select('*').eq('is_active', true).order('currency_name'),
        supabase.from('regions').select('*').order('region_name'),
        supabase.from('entity_controllers').select('*').order('name'),
        supabase.from('reporting_periods').select('*').order('period_start'),
        supabase.from('system_parameters').select('*')
      ]);

      console.log('[fetchAllData] Company currencies:', curr.data);

      setCurrencies(curr.data || []);
      setWorldCurrencies(worldCurr.data || []);
      setRegions(reg.data || []);
      setControllers(ctrl.data || []);
      setPeriods(per.data || []);

      // Find base currency from company_currencies
      const baseCurr = (curr.data || []).find(c => c.is_base_currency);
      setBaseCurrency(baseCurr?.currency_code || 'USD');

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

  const fetchLiveRates = async () => {
    if (!currencyForm.currency_code) return;
    setLoadingRates(true);
    try {
      const response = await fetch(`/api/exchange-rates?base=${baseCurrency}`);
      const data = await response.json();
      if (data.success && data.data.rates[currencyForm.currency_code]) {
        setCurrencyForm({
          ...currencyForm,
          exchange_rate: data.data.rates[currencyForm.currency_code]
        });
        alert(`Live rate fetched: 1 ${baseCurrency} = ${data.data.rates[currencyForm.currency_code]} ${currencyForm.currency_code}`);
      } else {
        alert('Rate not available for this currency. Using default rate of 1.0');
      }
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      alert('Failed to fetch live rates. Using default rate of 1.0');
    } finally {
      setLoadingRates(false);
    }
  };

  const saveCurrency = async () => {
    if (!currencyForm.currency_code || !currencyForm.currency_name) {
      alert('Please select a currency');
      return;
    }
    try {
      const currencyData = {
        currency_code: currencyForm.currency_code,
        currency_name: currencyForm.currency_name,
        symbol: currencyForm.symbol,
        is_base_currency: currencyForm.is_group_reporting_currency,
        is_presentation_currency: currencyForm.is_presentation_currency,
        is_functional_currency: currencyForm.is_functional_currency,
        exchange_rate: currencyForm.exchange_rate || 1.0
      };

      const response = await fetch('/api/company-currencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currencyData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add currency');
      }

      setCurrencyForm({
        currency_code: '', currency_name: '', symbol: '',
        is_presentation_currency: false, is_functional_currency: false,
        is_group_reporting_currency: false,
        exchange_rate: 1.0, is_active: true
      });
      setHasChanges(false);
      await fetchAllData();
      alert('Currency added successfully!');
    } catch (error) {
      console.error('Error saving currency:', error);
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
        name: '', role: 'Entity Controller', email: '', reporting_to: null, is_ultimate_owner: false, is_active: true
      });
      fetchAllData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const savePeriod = async () => {
    if (!periodForm.period_name || !periodForm.period_date) {
      alert('Please provide period name and date');
      return;
    }
    try {
      const { error } = await supabase.from('reporting_periods').insert([periodForm]);
      if (error) throw error;
      setPeriodForm({
        period_name: '', period_type: 'Month-End', period_date: '', fiscal_year: new Date().getFullYear(), is_locked: false
      });
      fetchAllData();
      alert('Period added successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const togglePeriodLock = async (periodId, currentLockStatus) => {
    try {
      const { error } = await supabase.from('reporting_periods')
        .update({ is_locked: !currentLockStatus })
        .eq('id', periodId);
      if (error) throw error;
      fetchAllData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const deletePeriod = async (periodId) => {
    if (!confirm('Are you sure you want to delete this period?')) return;
    try {
      const { error } = await supabase.from('reporting_periods').delete().eq('id', periodId);
      if (error) throw error;
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

  const setGroupReportingCurrency = async (currencyCode) => {
    try {
      console.log(`[setGroupReportingCurrency] Setting ${currencyCode} as base...`);

      // Call API endpoint to update company_currencies
      const response = await fetch('/api/company-currencies/set-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currencyCode })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set base currency');
      }

      console.log(`[setGroupReportingCurrency] Database updated via API, fetching data...`);

      // Force refresh by clearing state first
      setCurrencies([]);
      await fetchAllData();

      console.log(`[setGroupReportingCurrency] Data fetched, checking state...`);

      alert(`${currencyCode} is now the base currency for your company`);
    } catch (error) {
      console.error('Error setting base currency:', error);
      alert(`Failed to set base currency: ${error.message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center"><div className="text-slate-900">Loading...</div></div>;
  }

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader title="Consolidation Configuration" subtitle="Configure your consolidation settings and preferences" />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          {/* Tabs */}
          <div className="flex gap-8 border-b-2 border-gray-300 mb-10">
          {['Group Structure', 'Currencies', 'Regions', 'Controllers'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '_'))}
              className={`pb-4 px-2 text-base font-semibold transition-all duration-300 ${
                activeTab === tab.toLowerCase().replace(' ', '_')
                  ? 'text-slate-900 border-b-4 border-slate-900 -mb-0.5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* GROUP STRUCTURE TAB */}
        {activeTab === 'group_structure' && (
          <GroupStructureTab />
        )}

        {/* CURRENCIES TAB */}
        {activeTab === 'currencies' && (
          <div className="space-y-6">
            {/* Add Currency Form */}
            <div className="bg-white rounded-[14px] p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Currency</h2>

              <div className="grid grid-cols-3 gap-6">
                {/* Column 1 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Currency <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currencyForm.currency_code}
                    onChange={(e) => {
                      const selected = worldCurrencies.find(c => c.currency_code === e.target.value);
                      if (selected) {
                        setCurrencyForm({
                          ...currencyForm,
                          currency_code: selected.currency_code,
                          currency_name: selected.currency_name,
                          symbol: selected.symbol
                        });
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                  >
                    <option value="">Select currency...</option>
                    {worldCurrencies.map(curr => (
                      <option key={curr.currency_code} value={curr.currency_code}>
                        {curr.currency_code} - {curr.symbol}
                      </option>
                    ))}
                  </select>
                  {currencyForm.currency_code && (
                    <p className="text-xs text-gray-600 mt-1">{currencyForm.currency_name}</p>
                  )}
                </div>

                {/* Column 2 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Usage
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currencyForm.is_group_reporting_currency}
                        onChange={(e) => setCurrencyForm({...currencyForm, is_group_reporting_currency: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-sm font-semibold text-slate-900">★ Group Reporting</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currencyForm.is_presentation_currency}
                        onChange={(e) => setCurrencyForm({...currencyForm, is_presentation_currency: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-sm text-gray-700">Presentation</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currencyForm.is_functional_currency}
                        onChange={(e) => setCurrencyForm({...currencyForm, is_functional_currency: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-sm text-gray-700">Functional</span>
                    </label>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="flex items-end">
                  <button
                    onClick={saveCurrency}
                    disabled={!currencyForm.currency_code}
                    className="w-full px-6 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Add Currency
                  </button>
                </div>
              </div>
            </div>

            {/* Active Currencies Table */}
            <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-slate-900">Active Currencies ({currencies.length})</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#101828] text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Symbol</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Usage</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currencies.map((curr, index) => {
                      const isBaseCurrency = curr.currency_code === baseCurrency;
                      return (
                        <tr key={curr.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{curr.currency_code}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">{curr.currency_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-lg font-bold text-gray-700">{curr.symbol}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1 flex-wrap">
                              {isBaseCurrency && (
                                <span className="px-2 py-1 bg-slate-900 text-white text-xs font-bold rounded">
                                  ★ BASE
                                </span>
                              )}
                              {curr.is_presentation_currency && (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded">
                                  Pres
                                </span>
                              )}
                              {curr.is_functional_currency && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                  Func
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {!isBaseCurrency && (
                              <button
                                onClick={() => setGroupReportingCurrency(curr.currency_code)}
                                className="px-3 py-1.5 bg-slate-100 text-slate-900 text-xs font-semibold rounded hover:bg-slate-200 transition-colors"
                              >
                                Set as Base
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {currencies.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No currencies added yet. Add your first currency above.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* REGIONS TAB */}
        {activeTab === 'regions' && (
          <div className="grid grid-cols-3 gap-8">
            {/* Left: Add Region Form */}
            <div className="col-span-2 bg-white rounded-[14px] p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Region</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Region Code</label>
                    <input
                      type="text"
                      value={regionForm.region_code}
                      onChange={(e) => setRegionForm({...regionForm, region_code: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                      placeholder="EU"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Region Name</label>
                    <input
                      type="text"
                      value={regionForm.region_name}
                      onChange={(e) => setRegionForm({...regionForm, region_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                      placeholder="Europe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={regionForm.description}
                    onChange={(e) => setRegionForm({...regionForm, description: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
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
                      className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="font-medium text-gray-700">Intra-region netting enabled</span>
                  </label>
                </div>

                <button
                  onClick={saveRegion}
                  className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  Add Region
                </button>
              </div>
            </div>

            {/* Right: Active Regions List */}
            <div className="bg-[#faf9f7] rounded-[14px] p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Active Regions</h3>
              <div className="space-y-3">
                {regions.map(region => (
                  <div key={region.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="font-bold text-slate-900">{region.region_name}</div>
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
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Controller</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={controllerForm.name}
                    onChange={(e) => setControllerForm({...controllerForm, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <select
                      value={controllerForm.role}
                      onChange={(e) => setControllerForm({...controllerForm, role: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    >
                      <option value="Owner">Owner</option>
                      <option value="Manager">Manager</option>
                      <option value="Group Controller">Group Controller</option>
                      <option value="Entity Controller">Entity Controller</option>
                    </select>
                  </div>
                </div>

                {/* Ultimate Owner Checkbox */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={controllerForm.is_ultimate_owner}
                      onChange={(e) => setControllerForm({...controllerForm, is_ultimate_owner: e.target.checked, reporting_to: e.target.checked ? null : controllerForm.reporting_to})}
                      className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-semibold text-slate-900">Ultimate Owner / Boss</span>
                      <p className="text-xs text-gray-600 mt-1">Check this if this person is the ultimate owner/boss of the organization (reports to no one)</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reporting To {!controllerForm.is_ultimate_owner && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={controllerForm.reporting_to || ''}
                    onChange={(e) => setControllerForm({...controllerForm, reporting_to: e.target.value || null})}
                    disabled={controllerForm.is_ultimate_owner}
                    required={!controllerForm.is_ultimate_owner}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select reporting manager...</option>
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
                      className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="font-medium text-gray-700">Active Status</span>
                  </label>
                </div>

                <button
                  onClick={saveController}
                  className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  Add Controller
                </button>
              </div>
            </div>

            {/* Right: Active Controllers List */}
            <div className="bg-[#faf9f7] rounded-[14px] p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Active Controllers</h3>
              <div className="space-y-3">
                {controllers.map(ctrl => {
                  const reportsTo = controllers.find(c => c.id === ctrl.reporting_to);
                  return (
                    <div
                      key={ctrl.id}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow relative group cursor-pointer"
                      title={`${ctrl.name} - ${ctrl.role}`}
                    >
                      <div className="font-bold text-slate-900">{ctrl.name}</div>
                      <div className="text-sm text-gray-600">{ctrl.email}</div>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          ctrl.role === 'Owner' ? 'bg-purple-100 text-purple-800' :
                          ctrl.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                          ctrl.role === 'Group Controller' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ctrl.role || 'Entity Controller'}
                        </span>
                        {ctrl.is_ultimate_owner && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                            ★ Ultimate Owner
                          </span>
                        )}
                        {ctrl.is_active !== undefined && !ctrl.is_active && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Hover Tooltip */}
                      <div className="hidden group-hover:block absolute z-50 left-0 top-full mt-2 w-80 bg-slate-900 text-white p-4 rounded-lg shadow-xl">
                        <div className="text-sm space-y-2">
                          <div className="font-bold text-white border-b border-gray-600 pb-2">{ctrl.name}</div>
                          <div><span className="text-gray-400">Email:</span> {ctrl.email}</div>
                          <div><span className="text-gray-400">Role:</span> {ctrl.role}</div>
                          <div>
                            <span className="text-gray-400">Reports To:</span> {
                              ctrl.is_ultimate_owner
                                ? <span className="text-amber-400 font-semibold">No one (Ultimate Owner)</span>
                                : reportsTo
                                  ? <span className="text-blue-300">{reportsTo.name} ({reportsTo.role})</span>
                                  : <span className="text-gray-500">Not assigned</span>
                            }
                          </div>
                          <div>
                            <span className="text-gray-400">Status:</span> {
                              ctrl.is_active !== false
                                ? <span className="text-green-400">Active</span>
                                : <span className="text-red-400">Inactive</span>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}


          {/* Sticky Save Bar */}
          {hasChanges && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-slideUp z-50">
              <Save size={20} />
              <span className="font-semibold">Unsaved changes</span>
              <button
                onClick={saveCurrency}
                className="px-6 py-2 bg-white text-slate-900 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Save Configuration
              </button>
            </div>
          )}
        </div>
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
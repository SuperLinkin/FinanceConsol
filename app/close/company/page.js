'use client';

import { useState, useEffect } from 'react';
import CloseSidebar from '@/components/close/CloseSidebar';
import ClosePageHeader from '@/components/close/ClosePageHeader';
import GroupStructureTab from '@/components/GroupStructureTab';
import { ChevronDown, ChevronUp, Save, Plus } from 'lucide-react';

export default function CompanyConfig() {
  const [activeTab, setActiveTab] = useState('group_structure');
  const [currencies, setCurrencies] = useState([]);
  const [worldCurrencies, setWorldCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [hasChanges, setHasChanges] = useState(false);

  const [currencyForm, setCurrencyForm] = useState({
    currency_code: '',
    currency_name: '',
    symbol: '',
    is_presentation_currency: false,
    is_functional_currency: false,
    is_group_reporting_currency: false,
    exchange_rate: 1.0,
    is_active: true
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [curr, worldCurr] = await Promise.all([
        fetch('/api/company-currencies').then(res => res.json()),
        fetch('/api/world-currencies').then(res => res.json())
      ]);

      console.log('[fetchAllData] Company currencies:', curr.data);

      setCurrencies(curr.data || []);
      setWorldCurrencies(worldCurr.data || []);

      // Find base currency from company_currencies
      const baseCurr = (curr.data || []).find(c => c.is_base_currency);
      setBaseCurrency(baseCurr?.currency_code || 'USD');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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
        currency_code: '',
        currency_name: '',
        symbol: '',
        is_presentation_currency: false,
        is_functional_currency: false,
        is_group_reporting_currency: false,
        exchange_rate: 1.0,
        is_active: true
      });
      setHasChanges(false);
      await fetchAllData();
      alert('Currency added successfully!');
    } catch (error) {
      console.error('Error saving currency:', error);
      alert('Error: ' + error.message);
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
    return (
      <div className="flex h-screen bg-[#f7f5f2]">
        <CloseSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-900">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f7f5f2]">
      <CloseSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <ClosePageHeader
          title="Company Configuration"
          subtitle="Define your company group structure and currencies"
        />

        <div className="px-8 py-6">
          {/* Tabs */}
          <div className="flex gap-8 border-b-2 border-gray-300 mb-10">
            {['Group Structure', 'Currencies'].map(tab => (
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
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Code</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Symbol</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Usage</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Actions</th>
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

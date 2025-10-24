'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Calculator,
  FileText
} from 'lucide-react';

export default function TranslationsPage() {
  const [activeTab, setActiveTab] = useState('translations'); // 'translations', 'exrates'
  const [entities, setEntities] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [translationRules, setTranslationRules] = useState([]);
  const [exchangeRates, setExchangeRates] = useState([]);
  const [entityPeriods, setEntityPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [isRuleModalClosing, setIsRuleModalClosing] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [isRateModalClosing, setIsRateModalClosing] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [toast, setToast] = useState(null);

  // Translations state
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [periods, setPeriods] = useState([]);
  const [trialBalances, setTrialBalances] = useState([]);
  const [translatedBalances, setTranslatedBalances] = useState([]);
  const [entityCurrency, setEntityCurrency] = useState('');
  const [groupCurrency, setGroupCurrency] = useState('');
  const [needsTranslation, setNeedsTranslation] = useState(false);
  const [hasBulkUpload, setHasBulkUpload] = useState(false);

  // FCTR state
  const [fctrBalances, setFctrBalances] = useState([]);
  const [showFctrModal, setShowFctrModal] = useState(false);
  const [isFctrModalClosing, setIsFctrModalClosing] = useState(false);

  const [ruleForm, setRuleForm] = useState({
    rule_name: '',
    entity_id: '',
    from_currency: '',
    to_currency: '',
    applies_to: 'All', // 'All', 'Class', 'Specific GL'
    class_name: '',
    gl_account_code: '',
    rate_type: 'Closing Rate', // 'Closing Rate', 'Average Rate', 'Historical Rate'
    rate_value: null,
    fctr_account: '',
    is_active: true
  });

  const [rateForm, setRateForm] = useState({
    entity_id: '',
    period: '',
    from_currency: '',
    closing_rate: null,
    average_rate: null,
    historical_rates: [], // Array of { rate_name, rate_value, applies_to_class }
    is_active: true
  });

  const RATE_TYPES = ['Closing Rate', 'Average Rate', 'Historical Rate'];
  const APPLIES_TO_OPTIONS = ['All', 'Class', 'Specific GL'];
  const ACCOUNT_CLASSES = ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Income', 'Expenses'];

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedEntity) {
      fetchAvailablePeriods();
    }
  }, [selectedEntity]);

  useEffect(() => {
    if (activeTab === 'exrates') {
      fetchEntityPeriods();
    }
  }, [activeTab]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [entitiesData, currenciesData, glData, rulesData, ratesData] = await Promise.all([
        supabase.from('entities').select('*').eq('is_active', true).order('entity_name'),
        supabase.from('currencies').select('*').eq('is_active', true).order('currency_code'),
        supabase.from('chart_of_accounts').select('*').eq('is_active', true).order('account_code'),
        supabase.from('translation_rules').select('*, entities(entity_name), currencies!translation_rules_from_currency_fkey(currency_code)').order('created_at', { ascending: false }),
        supabase.from('exchange_rates').select('*').eq('is_active', true)
      ]);

      setEntities(entitiesData.data || []);
      setCurrencies(currenciesData.data || []);
      setGlAccounts(glData.data || []);
      setTranslationRules(rulesData.data || []);
      setExchangeRates(ratesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error loading data', false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePeriods = async () => {
    if (!selectedEntity) return;

    try {
      // Fetch distinct periods for the selected entity
      const { data, error } = await supabase
        .from('trial_balance')
        .select('period')
        .eq('entity_id', selectedEntity)
        .order('period', { ascending: false });

      if (error) throw error;

      // Get unique periods
      const uniquePeriods = [...new Set((data || []).map(item => item.period))];
      setPeriods(uniquePeriods);
    } catch (error) {
      console.error('Error fetching periods:', error);
      setPeriods([]);
    }
  };

  const fetchEntityPeriods = async () => {
    try {
      // Fetch all entity-period combinations from trial_balance
      const { data, error} = await supabase
        .from('trial_balance')
        .select('entity_id, period')
        .order('period', { ascending: false });

      if (error) throw error;

      // Get unique entity-period combinations
      const seen = new Set();
      const unique = [];
      (data || []).forEach(item => {
        const key = `${item.entity_id}-${item.period}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      });

      setEntityPeriods(unique);
    } catch (error) {
      console.error('Error fetching entity periods:', error);
    }
  };

  const closeRuleModal = () => {
    setIsRuleModalClosing(true);
    setTimeout(() => {
      setShowRuleModal(false);
      setIsRuleModalClosing(false);
      setEditingRule(null);
      resetRuleForm();
    }, 300);
  };

  const closeFctrModal = () => {
    setIsFctrModalClosing(true);
    setTimeout(() => {
      setShowFctrModal(false);
      setIsFctrModalClosing(false);
    }, 300);
  };

  const resetRuleForm = () => {
    setRuleForm({
      rule_name: '',
      entity_id: '',
      from_currency: '',
      to_currency: '',
      applies_to: 'All',
      class_name: '',
      gl_account_code: '',
      rate_type: 'Closing Rate',
      rate_value: null,
      fctr_account: '',
      is_active: true
    });
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setRuleForm({
      rule_name: rule.rule_name,
      entity_id: rule.entity_id,
      from_currency: rule.from_currency,
      to_currency: rule.to_currency,
      applies_to: rule.applies_to || 'All',
      class_name: rule.class_name || '',
      gl_account_code: rule.gl_account_code || '',
      rate_type: rule.rate_type,
      rate_value: rule.rate_value,
      fctr_account: rule.fctr_account || '',
      is_active: rule.is_active
    });
    setShowRuleModal(true);
  };

  const handleSaveRule = async () => {
    try {
      if (!ruleForm.rule_name || !ruleForm.entity_id || !ruleForm.from_currency || !ruleForm.to_currency) {
        showToast('Please fill all required fields', false);
        return;
      }

      const ruleData = {
        ...ruleForm,
        class_name: ruleForm.applies_to === 'Class' ? ruleForm.class_name : null,
        gl_account_code: ruleForm.applies_to === 'Specific GL' ? ruleForm.gl_account_code : null
      };

      if (editingRule) {
        const { error } = await supabase
          .from('translation_rules')
          .update(ruleData)
          .eq('id', editingRule.id);

        if (error) throw error;
        showToast('Translation rule updated successfully', true);
      } else {
        const { error } = await supabase
          .from('translation_rules')
          .insert([ruleData]);

        if (error) throw error;
        showToast('Translation rule created successfully', true);
      }

      closeRuleModal();
      fetchAllData();
    } catch (error) {
      console.error('Error saving rule:', error);
      showToast('Error saving translation rule', false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this translation rule?')) return;

    try {
      const { error } = await supabase
        .from('translation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      showToast('Translation rule deleted', true);
      fetchAllData();
    } catch (error) {
      console.error('Error deleting rule:', error);
      showToast('Error deleting translation rule', false);
    }
  };

  const fetchLiveTranslations = async () => {
    if (!selectedEntity || !selectedPeriod) {
      showToast('Please select entity and period', false);
      return;
    }

    try {
      // Fetch entity details to check currency
      const { data: entityData, error: entityError } = await supabase
        .from('entities')
        .select('functional_currency')
        .eq('id', selectedEntity)
        .single();

      if (entityError) throw entityError;

      // Fetch group reporting currency
      const { data: groupCurrData, error: groupCurrError } = await supabase
        .from('currencies')
        .select('currency_code')
        .eq('is_group_reporting_currency', true)
        .single();

      if (groupCurrError) throw groupCurrError;

      const entCurrency = entityData?.functional_currency || '';
      const grpCurrency = groupCurrData?.currency_code || '';

      console.log('💱 Currency Check:');
      console.log('  Entity Currency:', entCurrency);
      console.log('  Group Currency:', grpCurrency);
      console.log('  Needs Translation:', entCurrency !== grpCurrency);

      setEntityCurrency(entCurrency);
      setGroupCurrency(grpCurrency);
      setNeedsTranslation(entCurrency !== grpCurrency);

      // Fetch trial balances for the selected entity and period
      const { data: tbData, error: tbError } = await supabase
        .from('trial_balance')
        .select('*')
        .eq('entity_id', selectedEntity)
        .eq('period', selectedPeriod);

      if (tbError) throw tbError;

      // Check if trial balance was uploaded in group currency (bulk upload scenario)
      // If TB currency matches group currency AND entity's functional currency is different,
      // then it's a bulk upload that doesn't need translation
      const tbCurrency = tbData && tbData.length > 0 ? tbData[0].currency : null;

      // Fetch chart of accounts to get class information
      const { data: coaData, error: coaError } = await supabase
        .from('chart_of_accounts')
        .select('account_code, account_name, class_name');

      if (coaError) throw coaError;

      // Create a map for quick COA lookup
      const coaMap = {};
      (coaData || []).forEach(coa => {
        coaMap[coa.account_code] = coa;
      });

      // Enrich TB data with COA info
      const enrichedTBs = (tbData || []).map(tb => ({
        ...tb,
        coa_class: coaMap[tb.account_code]?.class_name,
        coa_name: coaMap[tb.account_code]?.account_name
      }));

      setTrialBalances(enrichedTBs);

      // Fetch exchange rates for this entity and period
      const { data: exRatesData, error: exRatesError } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('entity_id', selectedEntity)
        .eq('period', selectedPeriod)
        .single();

      // Use local variables instead of state for immediate comparison
      const requiresTranslation = entCurrency !== grpCurrency;
      const isBulkUpload = tbCurrency === grpCurrency && entCurrency !== grpCurrency;

      console.log('🔍 Exchange Rates Query:');
      console.log('  Entity ID:', selectedEntity);
      console.log('  Period:', selectedPeriod);
      console.log('  Exchange rates found:', !!exRatesData);
      if (exRatesData) {
        console.log('  Closing Rate:', exRatesData.closing_rate);
        console.log('  Average Rate:', exRatesData.average_rate);
      } else {
        console.log('  Error:', exRatesError);
      }
      console.log('  Requires Translation (local):', requiresTranslation);
      console.log('  Is Bulk Upload (local):', isBulkUpload);

      // Apply translations based on account class and exchange rates
      const translated = enrichedTBs.map(tb => {
        // If no translation needed (same currency), return as-is
        if (!requiresTranslation || isBulkUpload) {
          return {
            ...tb,
            translated_debit: tb.debit,
            translated_credit: tb.credit,
            rate_used: 1,
            rate_type: 'No Translation',
            target_currency: grpCurrency
          };
        }

        // Determine which rate to use based on account class
        let rate = 1;
        let rateType = 'No Rate Set';

        if (exRatesData) {
          const accountClass = tb.coa_class;

          // Normalize class name: trim, lowercase, and remove trailing 's' for comparison
          const normalizedClass = accountClass ? accountClass.trim().toLowerCase().replace(/ies$/, 'y').replace(/s$/, '') : '';

          // Debug: Log account class for every record
          console.log(`Account ${tb.account_code}: class="${accountClass}" (normalized: "${normalizedClass}")`);

          // Balance Sheet items (Assets/Asset, Liabilities/Liability, Equity) use Closing Rate
          if (['asset', 'liability', 'equity'].includes(normalizedClass)) {
            rate = parseFloat(exRatesData.closing_rate || 1);
            rateType = 'Closing Rate';
            console.log(`  → Using Closing Rate: ${rate}`);
          }
          // P&L items (Revenue, Expenses/Expense, Income) use Average Rate
          else if (['revenue', 'expense', 'income'].includes(normalizedClass)) {
            rate = parseFloat(exRatesData.average_rate || 1);
            rateType = 'Average Rate';
            console.log(`  → Using Average Rate: ${rate}`);
          }
          // Check for historical rates for specific classes
          else if (exRatesData.historical_rates && Array.isArray(exRatesData.historical_rates)) {
            const historicalRate = exRatesData.historical_rates.find(hr => hr.applies_to_class === accountClass);
            if (historicalRate && historicalRate.rate_value) {
              rate = parseFloat(historicalRate.rate_value);
              rateType = `Historical: ${historicalRate.rate_name || 'Custom'}`;
              console.log(`  → Using Historical Rate: ${rate}`);
            }
          } else {
            console.log(`  → No rate applied (class not matched or no exchange rates)`);
          }
        }

        return {
          ...tb,
          translated_debit: (parseFloat(tb.debit || 0) * rate).toFixed(2),
          translated_credit: (parseFloat(tb.credit || 0) * rate).toFixed(2),
          rate_used: rate,
          rate_type: rateType,
          target_currency: grpCurrency
        };
      });

      setTranslatedBalances(translated);
    } catch (error) {
      console.error('Error fetching live translations:', error);
      showToast('Error loading translations', false);
    }
  };

  const applyTranslationsToTrialBalance = async () => {
    if (!selectedEntity || !selectedPeriod) {
      showToast('Please select entity and period', false);
      return;
    }

    if (translatedBalances.length === 0) {
      showToast('Please load translations first', false);
      return;
    }

    try {
      const response = await fetch('/api/translations/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          entity_id: selectedEntity,
          period: selectedPeriod
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to apply translations');
      }

      if (result.success) {
        showToast(
          `✓ Applied translations to ${result.stats?.translated_count || 0} records. FCTR Net: ${result.stats?.fctr_net || '0.00'}`,
          true
        );

        // Reload translations to show updated data
        fetchLiveTranslations();
      } else {
        showToast(result.message || 'No records were translated', false);
      }
    } catch (error) {
      console.error('Error applying translations:', error);
      showToast(`Error: ${error.message}`, false);
    }
  };

  const calculateFctrBalances = async () => {
    try {
      // Get all FCTR accounts from translation rules
      const fctrAccounts = [...new Set(translationRules
        .filter(rule => rule.fctr_account)
        .map(rule => rule.fctr_account))];

      if (fctrAccounts.length === 0) {
        setFctrBalances([]);
        return;
      }

      // Fetch trial balances for FCTR accounts
      const { data, error } = await supabase
        .from('trial_balance')
        .select('*, entities(entity_name)')
        .in('account_code', fctrAccounts);

      if (error) throw error;

      // Group by entity and account
      const grouped = {};
      (data || []).forEach(tb => {
        const key = `${tb.entity_id}-${tb.account_code}`;
        if (!grouped[key]) {
          grouped[key] = {
            entity_id: tb.entity_id,
            entity_name: tb.entities?.entity_name,
            account_code: tb.account_code,
            balance: 0
          };
        }
        const debit = parseFloat(tb.debit || 0);
        const credit = parseFloat(tb.credit || 0);
        grouped[key].balance += (debit - credit);
      });

      setFctrBalances(Object.values(grouped));
    } catch (error) {
      console.error('Error calculating FCTR:', error);
      showToast('Error calculating FCTR balances', false);
    }
  };

  const createFctrAccount = async () => {
    try {
      const fctrCode = 'FCTR-001';
      const fctrName = 'Foreign Currency Translation Reserve';

      // Check if FCTR account already exists
      const { data: existing } = await supabase
        .from('chart_of_accounts')
        .select('account_code')
        .eq('account_code', fctrCode)
        .single();

      if (existing) {
        showToast('FCTR account already exists', false);
        return;
      }

      // Create FCTR account in COA
      const { error } = await supabase
        .from('chart_of_accounts')
        .insert([{
          account_code: fctrCode,
          account_name: fctrName,
          class_name: 'Equity',
          subclass_name: 'Reserves',
          note_name: 'Translation Reserve',
          subnote_name: 'FCTR',
          is_active: true
        }]);

      if (error) throw error;

      showToast('FCTR account created successfully', true);
      fetchAllData();
      closeFctrModal();
    } catch (error) {
      console.error('Error creating FCTR account:', error);
      showToast('Error creating FCTR account', false);
    }
  };

  const showToast = (message, success) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (activeTab === 'translations' && selectedEntity && selectedPeriod) {
      fetchLiveTranslations();
    }
  }, [selectedEntity, selectedPeriod]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-xl text-gray-600">Loading translations...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        icon={Globe}
        title="Currency Translations"
        subtitle="Manage translation rules and view translated trial balances"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('translations')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'translations'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Translations
        </button>
        <button
          onClick={() => setActiveTab('exrates')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'exrates'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Ex Rates
        </button>
      </div>

      {/* Ex Rates Tab */}
      {activeTab === 'exrates' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Exchange Rates</h2>
              <p className="text-sm text-gray-600 mt-1">Manage closing, average, and historical rates for uploaded periods</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Entity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Period</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">From Currency</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Closing Rate</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Average Rate</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Historical</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entityPeriods.map((ep) => {
                    const entity = entities.find(e => e.id === ep.entity_id);
                    if (!entity) return null;

                    const rateData = exchangeRates.find(r => r.entity_id === ep.entity_id && r.period === ep.period);

                    return (
                      <tr key={`${ep.entity_id}-${ep.period}`} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-sm text-slate-900">{entity.entity_name}</td>
                        <td className="px-6 py-4 text-sm font-mono text-slate-900">{ep.period}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                            {entity.functional_currency || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {rateData?.closing_rate ? (
                            <span className="font-mono text-sm font-semibold text-slate-900">{parseFloat(rateData.closing_rate).toFixed(4)}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">Not set</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {rateData?.average_rate ? (
                            <span className="font-mono text-sm font-semibold text-slate-900">{parseFloat(rateData.average_rate).toFixed(4)}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">Not set</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {rateData?.historical_rates?.length > 0 ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                              {rateData.historical_rates.length} rate(s)
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={async () => {
                              // Fetch group currency for "to_currency"
                              const { data: groupCurrData } = await supabase
                                .from('currencies')
                                .select('currency_code')
                                .eq('is_group_reporting_currency', true)
                                .single();

                              const toCurrency = groupCurrData?.currency_code || 'EUR';

                              // If rates don't exist, auto-fetch them
                              if (!rateData && entity.functional_currency !== toCurrency) {
                                try {
                                  showToast('Fetching exchange rates...', true);

                                  const response = await fetch('/api/exchange-rates/calculate', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      from_currency: entity.functional_currency,
                                      to_currency: toCurrency,
                                      period: ep.period
                                    })
                                  });

                                  const result = await response.json();

                                  if (result.success && result.data) {
                                    setEditingRate({
                                      entity_id: ep.entity_id,
                                      period: ep.period,
                                      from_currency: entity.functional_currency,
                                      closing_rate: result.data.closing_rate,
                                      average_rate: result.data.average_rate,
                                      historical_rates: []
                                    });
                                    showToast(`Rates fetched: Closing ${result.data.closing_rate?.toFixed(4)}, Average ${result.data.average_rate?.toFixed(4)}`, true);
                                  } else {
                                    throw new Error('Failed to fetch rates');
                                  }
                                } catch (error) {
                                  console.error('Error fetching rates:', error);
                                  showToast('Could not fetch live rates, please enter manually', false);
                                  setEditingRate({
                                    entity_id: ep.entity_id,
                                    period: ep.period,
                                    from_currency: entity.functional_currency,
                                    closing_rate: null,
                                    average_rate: null,
                                    historical_rates: []
                                  });
                                }
                              } else {
                                // Rates exist, just open modal with existing data
                                setEditingRate(rateData || {
                                  entity_id: ep.entity_id,
                                  period: ep.period,
                                  from_currency: entity.functional_currency,
                                  closing_rate: null,
                                  average_rate: null,
                                  historical_rates: []
                                });
                              }

                              setShowRateModal(true);
                            }}
                            className="px-4 py-2 bg-slate-900 text-white text-xs rounded-lg hover:bg-slate-800 transition-colors font-semibold"
                          >
                            {rateData ? 'View Rates' : 'Fetch Rates'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {entityPeriods.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                        No trial balances uploaded yet. Upload TBs to manage exchange rates.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {entities.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center">
              <Globe size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Entities Found</h3>
              <p className="text-gray-500">Set up entities and upload trial balances to manage exchange rates</p>
            </div>
          )}
        </div>
      )}

      {/* Translations Tab */}
      {activeTab === 'translations' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Trial Balance Translations</h2>
            <button
              onClick={() => {
                calculateFctrBalances();
                setShowFctrModal(true);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            >
              <Calculator size={18} />
              FCTR Balance
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Entity *</label>
                <select
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                >
                  <option value="">Choose entity...</option>
                  {entities.map(entity => (
                    <option key={entity.id} value={entity.id}>{entity.entity_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Period *</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                >
                  <option value="">Choose period...</option>
                  {periods.map(period => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={fetchLiveTranslations}
                className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
              >
                Load Translations
              </button>

              <button
                onClick={applyTranslationsToTrialBalance}
                disabled={translatedBalances.length === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  translatedBalances.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title={translatedBalances.length === 0 ? 'Load translations first' : 'Apply translations to trial balance and calculate FCTR'}
              >
                Apply Translations to Trial Balance
              </button>
            </div>
          </div>

          {/* Currency Check Alert */}
          {selectedEntity && selectedPeriod && entityCurrency && groupCurrency && (
            <div className={`rounded-xl p-6 mb-6 ${
              needsTranslation
                ? hasBulkUpload
                  ? 'bg-green-50 border-2 border-green-300'
                  : 'bg-amber-50 border-2 border-amber-300'
                : 'bg-green-50 border-2 border-green-300'
            }`}>
              <div className="flex items-start gap-3">
                {needsTranslation && !hasBulkUpload ? (
                  <AlertCircle size={24} className="text-amber-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-bold text-lg mb-2 ${
                    needsTranslation && !hasBulkUpload ? 'text-amber-900' : 'text-green-900'
                  }`}>
                    {needsTranslation && !hasBulkUpload ? 'Translation Required' : hasBulkUpload ? 'Bulk Upload Detected' : 'No Translation Required'}
                  </h3>
                  <p className={`text-sm ${needsTranslation && !hasBulkUpload ? 'text-amber-800' : 'text-green-800'}`}>
                    Entity Currency: <span className="font-bold">{entityCurrency}</span> |
                    Group Reporting Currency: <span className="font-bold">{groupCurrency}</span>
                  </p>
                  {needsTranslation && hasBulkUpload && (
                    <>
                      <p className="text-sm text-green-700 mt-3 font-semibold">
                        ✓ You performed a bulk upload for this entity and period.
                      </p>
                      <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 mt-3">
                        <p className="text-xs text-blue-800">
                          <strong>Note:</strong> Your trial balance was already uploaded in {groupCurrency}.
                          No further translation is required. Use this page only if you need to apply additional translation rules.
                        </p>
                      </div>
                    </>
                  )}
                  {needsTranslation && !hasBulkUpload && (
                    <>
                      <p className="text-sm text-amber-700 mt-3">
                        Translation rules will be applied to convert {entityCurrency} to {groupCurrency}
                      </p>
                      <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 mt-3">
                        <p className="text-xs text-blue-800">
                          <strong>Note:</strong> If you performed a bulk upload and the TB was already translated to {groupCurrency},
                          no further translation is required. This page should only be used for TBs that need currency conversion.
                        </p>
                      </div>
                    </>
                  )}
                  {!needsTranslation && (
                    <p className="text-sm text-green-700 mt-2">
                      Entity is already in group reporting currency. No translation needed.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {translatedBalances.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Account Code</th>
                      <th className="px-6 py-4 text-left font-semibold">Account Name</th>
                      <th className="px-6 py-4 text-right font-semibold">Original Debit</th>
                      <th className="px-6 py-4 text-right font-semibold">Original Credit</th>
                      <th className="px-6 py-4 text-center font-semibold">Rate</th>
                      <th className="px-6 py-4 text-right font-semibold">Translated Debit</th>
                      <th className="px-6 py-4 text-right font-semibold">Translated Credit</th>
                      <th className="px-6 py-4 text-center font-semibold">Currency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {translatedBalances.map((tb, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm text-slate-900">{tb.account_code}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{tb.coa_name || tb.account_name || '-'}</td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-slate-900">
                          {parseFloat(tb.debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm text-slate-900">
                          {parseFloat(tb.credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            tb.rate_used === 1 ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {tb.rate_used.toFixed(4)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-blue-600">
                          {parseFloat(tb.translated_debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-blue-600">
                          {parseFloat(tb.translated_credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-slate-900">{tb.target_currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Translation Rule Modal */}
      {(showRuleModal || isRuleModalClosing) && (
        <div className={`fixed right-0 top-0 h-full w-[700px] bg-white shadow-2xl z-50 overflow-y-auto ${isRuleModalClosing ? 'animate-slideOutRight' : 'animate-slideLeft'}`}>
          <div className="h-full flex flex-col">
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{editingRule ? 'Edit Translation Rule' : 'Create Translation Rule'}</h3>
                <p className="text-sm text-slate-300 mt-1">Configure currency translation settings</p>
              </div>
              <button
                onClick={closeRuleModal}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rule Name *</label>
                  <input
                    type="text"
                    value={ruleForm.rule_name}
                    onChange={(e) => setRuleForm({ ...ruleForm, rule_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    placeholder="e.g., USD to EUR Translation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Entity *</label>
                  <select
                    value={ruleForm.entity_id}
                    onChange={(e) => setRuleForm({ ...ruleForm, entity_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                  >
                    <option value="">Select entity...</option>
                    {entities.map(entity => (
                      <option key={entity.id} value={entity.id}>{entity.entity_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">From Currency *</label>
                    <select
                      value={ruleForm.from_currency}
                      onChange={(e) => setRuleForm({ ...ruleForm, from_currency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    >
                      <option value="">Select...</option>
                      {currencies.map(curr => (
                        <option key={curr.currency_code} value={curr.currency_code}>
                          {curr.currency_code} - {curr.currency_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">To Currency *</label>
                    <select
                      value={ruleForm.to_currency}
                      onChange={(e) => setRuleForm({ ...ruleForm, to_currency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    >
                      <option value="">Select...</option>
                      {currencies.map(curr => (
                        <option key={curr.currency_code} value={curr.currency_code}>
                          {curr.currency_code} - {curr.currency_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Applies To *</label>
                  <select
                    value={ruleForm.applies_to}
                    onChange={(e) => setRuleForm({ ...ruleForm, applies_to: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                  >
                    {APPLIES_TO_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {ruleForm.applies_to === 'Class' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Class Name *</label>
                    <select
                      value={ruleForm.class_name}
                      onChange={(e) => setRuleForm({ ...ruleForm, class_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    >
                      <option value="">Select class...</option>
                      {ACCOUNT_CLASSES.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                )}

                {ruleForm.applies_to === 'Specific GL' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">GL Account *</label>
                    <select
                      value={ruleForm.gl_account_code}
                      onChange={(e) => setRuleForm({ ...ruleForm, gl_account_code: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    >
                      <option value="">Select GL account...</option>
                      {glAccounts.map(gl => (
                        <option key={gl.account_code} value={gl.account_code}>
                          {gl.account_code} - {gl.account_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rate Type *</label>
                  <select
                    value={ruleForm.rate_type}
                    onChange={(e) => setRuleForm({ ...ruleForm, rate_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                  >
                    {RATE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Exchange Rate</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={ruleForm.rate_value || ''}
                    onChange={(e) => setRuleForm({ ...ruleForm, rate_value: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    placeholder="e.g., 1.2500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">FCTR Account</label>
                  <select
                    value={ruleForm.fctr_account}
                    onChange={(e) => setRuleForm({ ...ruleForm, fctr_account: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                  >
                    <option value="">Select FCTR account...</option>
                    {glAccounts.filter(gl => gl.class_name === 'Equity').map(gl => (
                      <option key={gl.account_code} value={gl.account_code}>
                        {gl.account_code} - {gl.account_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={ruleForm.is_active}
                    onChange={(e) => setRuleForm({ ...ruleForm, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                  />
                  <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                    Active Rule
                  </label>
                </div>
              </div>

              <div className="mt-8 sticky bottom-0 bg-white pt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveRule}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Save size={20} />
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FCTR Balance Panel */}
      {(showFctrModal || isFctrModalClosing) && (
        <div className={`fixed right-0 top-0 h-full w-[700px] bg-white shadow-2xl z-50 overflow-y-auto ${isFctrModalClosing ? 'animate-slideOutRight' : 'animate-slideLeft'}`}>
          <div className="h-full flex flex-col">
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">FCTR Balance</h3>
                <p className="text-sm text-slate-300 mt-1">Foreign Currency Translation Reserve</p>
              </div>
              <button
                onClick={closeFctrModal}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-bold text-blue-900 mb-2">About FCTR</h4>
                  <p className="text-sm text-blue-800">
                    Foreign Currency Translation Reserve (FCTR) is an equity account used to record gains and losses
                    from translating foreign currency financial statements into the group reporting currency.
                  </p>
                </div>

                {fctrBalances.length === 0 ? (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
                    <DollarSign size={64} className="mx-auto text-gray-300 mb-4" />
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">No FCTR Balances</h4>
                    <p className="text-gray-500 mb-6">
                      No FCTR accounts found. Create an FCTR account and assign it to translation rules.
                    </p>
                    <button
                      onClick={createFctrAccount}
                      className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold flex items-center gap-2 mx-auto"
                    >
                      <Plus size={18} />
                      Create FCTR Account
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-900 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Entity</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Account</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Balance</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fctrBalances.map((fctr, idx) => (
                          <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 font-semibold text-sm">{fctr.entity_name}</td>
                            <td className="px-4 py-3 font-mono text-xs">{fctr.account_code}</td>
                            <td className="px-4 py-3 text-right font-mono text-sm font-bold">
                              {fctr.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {fctr.balance === 0 ? (
                                <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                                  <CheckCircle size={14} />
                                  Balanced
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-600 text-xs">
                                  <AlertCircle size={14} />
                                  Unbalanced
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800">
                        FCTR balances represent accumulated translation adjustments. These are calculated automatically
                        when translation rules are applied to trial balances.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exchange Rate Modal */}
      {(showRateModal || isRateModalClosing) && editingRate && (
        <div className={`fixed right-0 top-0 h-full w-[700px] bg-white shadow-2xl z-50 overflow-y-auto ${isRateModalClosing ? 'animate-slideOutRight' : 'animate-slideLeft'}`}>
          <div className="h-full flex flex-col">
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Set Exchange Rates</h3>
                <p className="text-sm text-slate-300 mt-1">Configure closing, average, and historical rates</p>
              </div>
              <button
                onClick={() => {
                  setIsRateModalClosing(true);
                  setTimeout(() => {
                    setShowRateModal(false);
                    setIsRateModalClosing(false);
                    setEditingRate(null);
                  }, 300);
                }}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              <div className="space-y-6">
                {/* Entity and Period Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-blue-700">Entity</span>
                      <p className="text-sm font-bold text-blue-900">
                        {entities.find(e => e.id === editingRate.entity_id)?.entity_name || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-700">Period</span>
                      <p className="text-sm font-bold text-blue-900">{editingRate.period || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-700">From Currency</span>
                      <p className="text-sm font-bold text-blue-900">{editingRate.from_currency || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-700">To Currency</span>
                      <p className="text-sm font-bold text-blue-900">{groupCurrency || 'Group Currency'}</p>
                    </div>
                  </div>
                </div>

                {/* Closing Rate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Closing Rate <span className="text-gray-500 text-xs">(for Balance Sheet items)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={editingRate.closing_rate ? parseFloat(editingRate.closing_rate).toFixed(4) : 'Not available'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-slate-900 font-mono font-semibold text-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Exchange rate at period end (auto-fetched from Frankfurter API)</p>
                </div>

                {/* Average Rate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Average Rate <span className="text-gray-500 text-xs">(for P&L items)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={editingRate.average_rate ? parseFloat(editingRate.average_rate).toFixed(4) : 'Not available'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-slate-900 font-mono font-semibold text-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Average exchange rate for the period (auto-calculated from daily rates)</p>
                </div>

                {/* Info Box */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <AlertCircle size={18} />
                      About Exchange Rates
                    </h4>
                    <p className="text-sm text-blue-800 mb-2">
                      Exchange rates are automatically fetched from the Frankfurter API (European Central Bank data).
                    </p>
                    <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                      <li><strong>Closing Rate:</strong> Used for Balance Sheet items (Assets, Liabilities, Equity)</li>
                      <li><strong>Average Rate:</strong> Used for P&L items (Revenue, Expenses, Income)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 sticky bottom-0 bg-white pt-6 border-t border-gray-200">
                <button
                  onClick={async () => {
                    try {
                      // Prepare exchange rate data for upsert
                      const rateData = {
                        entity_id: editingRate.entity_id,
                        period: editingRate.period,
                        from_currency: editingRate.from_currency,
                        to_currency: groupCurrency,
                        closing_rate: editingRate.closing_rate ? parseFloat(editingRate.closing_rate) : null,
                        average_rate: editingRate.average_rate ? parseFloat(editingRate.average_rate) : null,
                        historical_rates: (editingRate.historical_rates || []).filter(r => r.rate_name && r.rate_value),
                        is_active: true
                      };

                      // Upsert to exchange_rates table
                      const { error } = await supabase
                        .from('exchange_rates')
                        .upsert(rateData, {
                          onConflict: 'entity_id,period',
                          ignoreDuplicates: false
                        });

                      if (error) throw error;

                      showToast('Exchange rates saved successfully', true);

                      // Reload exchange rates data
                      const { data: updatedRates } = await supabase
                        .from('exchange_rates')
                        .select('*')
                        .eq('is_active', true);

                      setExchangeRates(updatedRates || []);

                      // If we're currently viewing translations for this entity/period, reload them
                      if (selectedEntity === editingRate.entity_id && selectedPeriod === editingRate.period) {
                        await fetchLiveTranslations();
                      }

                      setIsRateModalClosing(true);
                      setTimeout(() => {
                        setShowRateModal(false);
                        setIsRateModalClosing(false);
                        setEditingRate(null);
                      }, 300);
                    } catch (error) {
                      console.error('Error saving rates:', error);
                      showToast('Error saving exchange rates', false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Save size={20} />
                  Save Exchange Rates
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
      </div>
    </div>
  );
}

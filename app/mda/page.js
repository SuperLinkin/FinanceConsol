'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  PieChart,
  BarChart3,
  FileText,
  Download,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Activity,
  Sparkles,
  Upload,
  Table,
  Type,
  Image,
  List,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RefreshCw
} from 'lucide-react';

export default function MDAPage() {
  const [activeTab, setActiveTab] = useState('key_metrics');
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [comparativePeriod, setComparativePeriod] = useState('');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Key Metrics State
  const [metrics, setMetrics] = useState({
    current: {
      revenue: 0,
      grossProfit: 0,
      operatingIncome: 0,
      netIncome: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      cashFlow: 0
    },
    comparative: {
      revenue: 0,
      grossProfit: 0,
      operatingIncome: 0,
      netIncome: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      cashFlow: 0
    }
  });

  // Additional Data State
  const [additionalData, setAdditionalData] = useState([]);
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [dataForm, setDataForm] = useState({
    category: 'revenue',
    subcategory: '',
    amount: 0,
    description: '',
    isCustomUpload: false,
    uploadFile: null
  });

  // Executive Summary State
  const [executiveSummary, setExecutiveSummary] = useState({
    overview: '',
    keyHighlights: [],
    challenges: [],
    outlook: ''
  });

  // AI Assist State
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Rich Text Editor State
  const [reportContent, setReportContent] = useState('');
  const [showRichEditor, setShowRichEditor] = useState(false);
  const editorRef = useRef(null);

  // MD&A Report State
  const [mdaReport, setMdaReport] = useState({
    title: '',
    reportingPeriod: '',
    sections: []
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      calculateMetrics();
    }
  }, [selectedPeriod, comparativePeriod]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Get unique periods from trial_balance instead of reporting_periods table
      const { data: tbData, error } = await supabase
        .from('trial_balance')
        .select('period')
        .order('period', { ascending: false });

      if (error) throw error;

      // Extract unique periods
      const uniquePeriods = [...new Set((tbData || []).map(item => item.period))];
      const periodsData = uniquePeriods.map(period => ({
        id: period,
        period_name: period
      }));

      setPeriods(periodsData || []);

      if (periodsData && periodsData.length > 0) {
        setSelectedPeriod(periodsData[0].id);
        if (periodsData.length > 1) {
          setComparativePeriod(periodsData[1].id);
        }
      }

      // Try to load saved MD&A data
      await loadSavedMDAData();
    } catch (error) {
      console.error('Error fetching data:', error?.message || error?.toString() || error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedMDAData = async () => {
    try {
      // Load from localStorage or database
      const savedData = localStorage.getItem('mda_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setExecutiveSummary(parsed.executiveSummary || executiveSummary);
        setAdditionalData(parsed.additionalData || []);
        setMetrics(parsed.metrics || metrics);
      }
    } catch (error) {
      console.error('Error loading saved MD&A data:', error);
    }
  };

  const calculateMetrics = async () => {
    try {
      // Fetch consolidated trial balance data for current period (all entities aggregated)
      const { data: currentTbData, error: currentError } = await supabase
        .from('trial_balance')
        .select('*')
        .eq('period', selectedPeriod);

      if (currentError) {
        console.error('Error fetching current trial balance:', currentError);
      }

      // Fetch comparative period data (all entities aggregated)
      let comparativeTbData = [];
      if (comparativePeriod) {
        const { data: compData, error: compError } = await supabase
          .from('trial_balance')
          .select('*')
          .eq('period', comparativePeriod);

        if (!compError) {
          comparativeTbData = compData || [];
        }
      }

      // Calculate consolidated metrics by aggregating all entities
      const currentMetrics = calculatePeriodMetrics(currentTbData || []);
      const compareMetrics = calculatePeriodMetrics(comparativeTbData);

      setMetrics({
        current: currentMetrics,
        comparative: compareMetrics
      });
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }
  };

  const calculatePeriodMetrics = (tbData) => {
    let revenue = 0;
    let expenses = 0;
    let assets = 0;
    let liabilities = 0;
    let equity = 0;

    tbData.forEach(item => {
      const className = item.class_name || item.class;
      const debit = parseFloat(item.debit_amount || 0);
      const credit = parseFloat(item.credit_amount || 0);

      if (className === 'Revenue' || className === 'Income') {
        revenue += credit - debit;
      } else if (className === 'Expenses') {
        expenses += debit - credit;
      } else if (className === 'Assets') {
        assets += debit - credit;
      } else if (className === 'Liability') {
        liabilities += credit - debit;
      } else if (className === 'Equity') {
        equity += credit - debit;
      }
    });

    return {
      revenue,
      grossProfit: revenue * 0.4, // Can be calculated from COGS if available
      operatingIncome: revenue - expenses,
      netIncome: revenue - expenses,
      totalAssets: assets,
      totalLiabilities: liabilities,
      totalEquity: equity,
      cashFlow: revenue * 0.2 // Placeholder, would need cash flow statement
    };
  };

  const handleAIGenerateSummary = async () => {
    setGeneratingAI(true);
    try {
      // Simulate AI generation - in production, this would call OpenAI API
      const currentPeriodName = periods.find(p => p.id === selectedPeriod)?.period_name || 'Current Period';
      const comparativePeriodName = periods.find(p => p.id === comparativePeriod)?.period_name || 'Prior Period';

      const revenueGrowth = metrics.comparative.revenue > 0
        ? ((metrics.current.revenue - metrics.comparative.revenue) / metrics.comparative.revenue * 100).toFixed(1)
        : 0;

      const netIncomeGrowth = metrics.comparative.netIncome > 0
        ? ((metrics.current.netIncome - metrics.comparative.netIncome) / metrics.comparative.netIncome * 100).toFixed(1)
        : 0;

      const generatedSummary = `For the period ended ${currentPeriodName}, the Company achieved consolidated revenue of ${formatCurrency(metrics.current.revenue)}, representing ${revenueGrowth > 0 ? 'an increase' : 'a decrease'} of ${Math.abs(revenueGrowth)}% compared to ${formatCurrency(metrics.comparative.revenue)} in ${comparativePeriodName}.

Net income for the period was ${formatCurrency(metrics.current.netIncome)}, ${netIncomeGrowth > 0 ? 'up' : 'down'} ${Math.abs(netIncomeGrowth)}% from ${formatCurrency(metrics.comparative.netIncome)} in the comparative period. This ${netIncomeGrowth > 0 ? 'improvement' : 'decline'} was primarily driven by ${netIncomeGrowth > 0 ? 'strong operational performance and improved margins' : 'increased operating expenses and market headwinds'}.

The Company's financial position remains ${metrics.current.totalEquity > metrics.comparative.totalEquity ? 'strong' : 'stable'}, with total assets of ${formatCurrency(metrics.current.totalAssets)} and total equity of ${formatCurrency(metrics.current.totalEquity)}. The debt-to-equity ratio of ${(metrics.current.totalLiabilities / metrics.current.totalEquity).toFixed(2)}x reflects a ${metrics.current.totalLiabilities / metrics.current.totalEquity < 1 ? 'conservative' : 'balanced'} capital structure.`;

      const generatedOutlook = `Looking ahead, management expects continued ${revenueGrowth > 0 ? 'growth momentum' : 'focus on operational efficiency'} driven by strategic initiatives and market opportunities. The Company remains committed to delivering sustainable value to shareholders while maintaining financial flexibility to pursue growth opportunities.

Key priorities for the upcoming period include optimizing operational efficiency, investing in strategic growth initiatives, and maintaining a strong balance sheet to support long-term value creation.`;

      setAiSuggestion({
        overview: generatedSummary,
        outlook: generatedOutlook
      });
    } catch (error) {
      console.error('Error generating AI summary:', error);
      alert('Error generating AI summary');
    } finally {
      setGeneratingAI(false);
    }
  };

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      setExecutiveSummary({
        ...executiveSummary,
        overview: aiSuggestion.overview,
        outlook: aiSuggestion.outlook
      });
      setShowAIAssist(false);
      setAiSuggestion(null);
    }
  };

  const handleAddData = async () => {
    try {
      const newData = {
        ...dataForm,
        created_at: new Date().toISOString(),
        id: Date.now()
      };

      setAdditionalData([...additionalData, newData]);
      setShowAddDataModal(false);
      setDataForm({
        category: 'revenue',
        subcategory: '',
        amount: 0,
        description: '',
        isCustomUpload: false,
        uploadFile: null
      });
      alert('Data added successfully!');
    } catch (error) {
      console.error('Error adding data:', error);
      alert('Error adding data');
    }
  };

  const handleDeleteData = (id) => {
    if (confirm('Are you sure you want to delete this data?')) {
      const newData = additionalData.filter(item => item.id !== id);
      setAdditionalData(newData);
    }
  };

  const handleSaveAll = async () => {
    try {
      const dataToSave = {
        executiveSummary,
        additionalData,
        metrics,
        selectedPeriod,
        comparativePeriod,
        savedAt: new Date().toISOString()
      };

      // Save to localStorage (in production, save to database)
      localStorage.setItem('mda_data', JSON.stringify(dataToSave));

      setSaved(true);
      alert('MD&A data saved successfully!');

      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving MD&A data:', error);
      alert('Error saving MD&A data');
    }
  };

  const generateMDAReport = () => {
    const currentPeriodName = periods.find(p => p.id === selectedPeriod)?.period_name || 'Current Period';
    const comparativePeriodName = periods.find(p => p.id === comparativePeriod)?.period_name || 'Prior Period';

    const report = {
      title: `Management Discussion & Analysis - ${currentPeriodName}`,
      reportingPeriod: currentPeriodName,
      comparativePeriod: comparativePeriodName,
      generatedDate: new Date().toISOString(),
      sections: [
        {
          title: 'Executive Summary',
          content: executiveSummary.overview || 'No overview provided.'
        },
        {
          title: 'Financial Highlights',
          content: generateFinancialHighlights()
        },
        {
          title: 'Key Performance Indicators',
          content: generateKPISection()
        },
        {
          title: 'Additional Analysis',
          content: generateAdditionalDataSection()
        },
        {
          title: 'Business Outlook',
          content: executiveSummary.outlook || 'No outlook provided.'
        }
      ]
    };

    setMdaReport(report);
    setReportContent(generateRichTextContent(report));
    setShowRichEditor(true);
    setActiveTab('report');
  };

  const generateFinancialHighlights = () => {
    const revenueChange = metrics.comparative.revenue > 0
      ? ((metrics.current.revenue - metrics.comparative.revenue) / metrics.comparative.revenue * 100).toFixed(1)
      : 0;
    const netIncomeChange = metrics.comparative.netIncome > 0
      ? ((metrics.current.netIncome - metrics.comparative.netIncome) / metrics.comparative.netIncome * 100).toFixed(1)
      : 0;

    return `
Current Period (${periods.find(p => p.id === selectedPeriod)?.period_name}):
• Revenue: ${formatCurrency(metrics.current.revenue)} (${revenueChange > 0 ? '+' : ''}${revenueChange}% vs prior period)
• Net Income: ${formatCurrency(metrics.current.netIncome)} (${netIncomeChange > 0 ? '+' : ''}${netIncomeChange}% vs prior period)
• Total Assets: ${formatCurrency(metrics.current.totalAssets)}
• Total Equity: ${formatCurrency(metrics.current.totalEquity)}

Comparative Period (${periods.find(p => p.id === comparativePeriod)?.period_name}):
• Revenue: ${formatCurrency(metrics.comparative.revenue)}
• Net Income: ${formatCurrency(metrics.comparative.netIncome)}
• Total Assets: ${formatCurrency(metrics.comparative.totalAssets)}
• Total Equity: ${formatCurrency(metrics.comparative.totalEquity)}
    `.trim();
  };

  const generateKPISection = () => {
    const currentGPM = metrics.current.revenue > 0 ? ((metrics.current.grossProfit / metrics.current.revenue) * 100).toFixed(2) : 0;
    const currentOPM = metrics.current.revenue > 0 ? ((metrics.current.operatingIncome / metrics.current.revenue) * 100).toFixed(2) : 0;
    const currentROA = metrics.current.totalAssets > 0 ? ((metrics.current.netIncome / metrics.current.totalAssets) * 100).toFixed(2) : 0;
    const currentROE = metrics.current.totalEquity > 0 ? ((metrics.current.netIncome / metrics.current.totalEquity) * 100).toFixed(2) : 0;

    return `
Profitability Ratios:
• Gross Profit Margin: ${currentGPM}%
• Operating Margin: ${currentOPM}%
• Net Profit Margin: ${((metrics.current.netIncome / metrics.current.revenue) * 100).toFixed(2)}%

Efficiency Ratios:
• Return on Assets (ROA): ${currentROA}%
• Return on Equity (ROE): ${currentROE}%
• Asset Turnover: ${(metrics.current.revenue / metrics.current.totalAssets).toFixed(2)}x

Leverage Ratios:
• Debt to Equity: ${(metrics.current.totalLiabilities / metrics.current.totalEquity).toFixed(2)}x
• Debt to Assets: ${((metrics.current.totalLiabilities / metrics.current.totalAssets) * 100).toFixed(2)}%
• Equity Ratio: ${((metrics.current.totalEquity / metrics.current.totalAssets) * 100).toFixed(2)}%
    `.trim();
  };

  const generateAdditionalDataSection = () => {
    if (additionalData.length === 0) {
      return 'No additional data provided.';
    }

    let section = 'Additional Financial Data:\n\n';
    additionalData.forEach(item => {
      section += `${item.subcategory} (${item.category}): ${formatCurrency(item.amount)}\n`;
      if (item.description) {
        section += `  ${item.description}\n`;
      }
      section += '\n';
    });

    return section.trim();
  };

  const generateRichTextContent = (report) => {
    let html = `<h1>${report.title}</h1>`;
    html += `<p><strong>Reporting Period:</strong> ${report.reportingPeriod}</p>`;
    html += `<p><strong>Comparative Period:</strong> ${report.comparativePeriod}</p>`;
    html += `<hr/>`;

    report.sections.forEach(section => {
      html += `<h2>${section.title}</h2>`;
      html += `<p>${section.content.replace(/\n/g, '<br/>')}</p>`;
    });

    return html;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculateVariance = (current, comparative) => {
    if (comparative === 0) return 0;
    return ((current - comparative) / comparative * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="text-slate-900 text-lg">Loading MD&A...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        title="MD&A - Management Discussion & Analysis"
        subtitle="Analyze consolidated financial performance and generate comprehensive MD&A reports"
      >
        <button
          onClick={() => {
            alert('MD&A data ready to sync with Reporting Builder!');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
        >
          <RefreshCw size={16} />
          Sync to Reports
        </button>
        <button
          onClick={handleSaveAll}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save All'}
        </button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          {/* Filters */}
          <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Consolidated Financial Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Period *</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828] bg-white"
                >
                  {periods.map(period => (
                    <option key={period.id} value={period.id}>{period.period_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Comparative Period *</label>
                <select
                  value={comparativePeriod}
                  onChange={(e) => setComparativePeriod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828] bg-white"
                >
                  <option value="">Select comparative period...</option>
                  {periods.filter(p => p.id !== selectedPeriod).map(period => (
                    <option key={period.id} value={period.id}>{period.period_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b-2 border-gray-300 mb-10">
            {['Key Metrics', 'Executive Summary', 'Additional Data', 'Generate Report'].map(tab => {
              const tabKey = tab.toLowerCase().replace(/ /g, '_');
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tabKey)}
                  className={`pb-4 px-4 text-base font-semibold transition-all duration-300 ${
                    activeTab === tabKey
                      ? 'text-slate-900 border-b-4 border-slate-900 -mb-0.5'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* KEY METRICS TAB */}
          {activeTab === 'key_metrics' && (
            <div className="space-y-6">
              {/* Period Comparison Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-[14px] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">
                      {periods.find(p => p.id === selectedPeriod)?.period_name || 'Current Period'}
                    </h3>
                    <p className="text-slate-300 text-sm mt-1">Consolidated Financial Metrics</p>
                  </div>
                  {comparativePeriod && (
                    <div className="text-right">
                      <p className="text-sm text-slate-300">Compared to</p>
                      <p className="text-lg font-semibold">
                        {periods.find(p => p.id === comparativePeriod)?.period_name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Metrics Cards with Comparison */}
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-600">Revenue</span>
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.current.revenue)}</div>
                  {comparativePeriod && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">Previous: {formatCurrency(metrics.comparative.revenue)}</div>
                      <div className={`flex items-center gap-1 mt-1 ${
                        parseFloat(calculateVariance(metrics.current.revenue, metrics.comparative.revenue)) > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {parseFloat(calculateVariance(metrics.current.revenue, metrics.comparative.revenue)) > 0
                          ? <TrendingUp size={14} />
                          : <TrendingDown size={14} />
                        }
                        <span className="text-sm font-semibold">
                          {calculateVariance(metrics.current.revenue, metrics.comparative.revenue)}% YoY
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-600">Net Income</span>
                    <Activity size={20} className="text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.current.netIncome)}</div>
                  {comparativePeriod && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">Previous: {formatCurrency(metrics.comparative.netIncome)}</div>
                      <div className={`flex items-center gap-1 mt-1 ${
                        parseFloat(calculateVariance(metrics.current.netIncome, metrics.comparative.netIncome)) > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {parseFloat(calculateVariance(metrics.current.netIncome, metrics.comparative.netIncome)) > 0
                          ? <TrendingUp size={14} />
                          : <TrendingDown size={14} />
                        }
                        <span className="text-sm font-semibold">
                          {calculateVariance(metrics.current.netIncome, metrics.comparative.netIncome)}% YoY
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-600">Total Assets</span>
                    <PieChart size={20} className="text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.current.totalAssets)}</div>
                  {comparativePeriod && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">Previous: {formatCurrency(metrics.comparative.totalAssets)}</div>
                      <div className={`flex items-center gap-1 mt-1 ${
                        parseFloat(calculateVariance(metrics.current.totalAssets, metrics.comparative.totalAssets)) > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {parseFloat(calculateVariance(metrics.current.totalAssets, metrics.comparative.totalAssets)) > 0
                          ? <TrendingUp size={14} />
                          : <TrendingDown size={14} />
                        }
                        <span className="text-sm font-semibold">
                          {calculateVariance(metrics.current.totalAssets, metrics.comparative.totalAssets)}% YoY
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-600">Total Equity</span>
                    <BarChart3 size={20} className="text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{formatCurrency(metrics.current.totalEquity)}</div>
                  {comparativePeriod && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">Previous: {formatCurrency(metrics.comparative.totalEquity)}</div>
                      <div className={`flex items-center gap-1 mt-1 ${
                        parseFloat(calculateVariance(metrics.current.totalEquity, metrics.comparative.totalEquity)) > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {parseFloat(calculateVariance(metrics.current.totalEquity, metrics.comparative.totalEquity)) > 0
                          ? <TrendingUp size={14} />
                          : <TrendingDown size={14} />
                        }
                        <span className="text-sm font-semibold">
                          {calculateVariance(metrics.current.totalEquity, metrics.comparative.totalEquity)}% YoY
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Ratios */}
              <div className="bg-white rounded-[14px] p-8 shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Financial Ratios & KPIs</h3>

                <div className="grid grid-cols-3 gap-6">
                  {/* Profitability Ratios */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Profitability</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Gross Profit Margin</span>
                        <span className="text-sm font-bold text-slate-900">
                          {metrics.current.revenue > 0 ? ((metrics.current.grossProfit / metrics.current.revenue) * 100).toFixed(2) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Operating Margin</span>
                        <span className="text-sm font-bold text-slate-900">
                          {metrics.current.revenue > 0 ? ((metrics.current.operatingIncome / metrics.current.revenue) * 100).toFixed(2) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Net Profit Margin</span>
                        <span className="text-sm font-bold text-slate-900">
                          {metrics.current.revenue > 0 ? ((metrics.current.netIncome / metrics.current.revenue) * 100).toFixed(2) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Efficiency Ratios */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Efficiency</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Return on Assets</span>
                        <span className="text-sm font-bold text-slate-900">
                          {metrics.current.totalAssets > 0 ? ((metrics.current.netIncome / metrics.current.totalAssets) * 100).toFixed(2) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Return on Equity</span>
                        <span className="text-sm font-bold text-slate-900">
                          {metrics.current.totalEquity > 0 ? ((metrics.current.netIncome / metrics.current.totalEquity) * 100).toFixed(2) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Asset Turnover</span>
                        <span className="text-sm font-bold text-slate-900">
                          {metrics.current.totalAssets > 0 ? (metrics.current.revenue / metrics.current.totalAssets).toFixed(2) : 0}x
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Leverage Ratios */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Leverage</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Debt to Equity</span>
                        <span className="text-sm font-bold text-slate-900">
                          {metrics.current.totalEquity > 0 ? (metrics.current.totalLiabilities / metrics.current.totalEquity).toFixed(2) : 0}x
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Debt to Assets</span>
                        <span className="text-sm font-bold text-slate-900">
                          {metrics.current.totalAssets > 0 ? ((metrics.current.totalLiabilities / metrics.current.totalAssets) * 100).toFixed(2) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Equity Ratio</span>
                        <span className="text-sm font-bold text-slate-900">
                          {metrics.current.totalAssets > 0 ? ((metrics.current.totalEquity / metrics.current.totalAssets) * 100).toFixed(2) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EXECUTIVE SUMMARY TAB */}
          {activeTab === 'executive_summary' && (
            <div className="space-y-6">
              <div className="bg-white rounded-[14px] p-8 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Executive Summary</h3>
                  <button
                    onClick={() => setShowAIAssist(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    <Sparkles size={18} />
                    AI Assist
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Overview</label>
                    <textarea
                      value={executiveSummary.overview}
                      onChange={(e) => setExecutiveSummary({...executiveSummary, overview: e.target.value})}
                      rows={8}
                      placeholder="Provide a high-level overview of the company's performance during the period..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Business Outlook</label>
                    <textarea
                      value={executiveSummary.outlook}
                      onChange={(e) => setExecutiveSummary({...executiveSummary, outlook: e.target.value})}
                      rows={8}
                      placeholder="Describe the company's outlook, future plans, and expected market conditions..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828] resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADDITIONAL DATA TAB */}
          {activeTab === 'additional_data' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddDataModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#101828] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] transition-colors"
                >
                  <Plus size={16} />
                  Add Data
                </button>
              </div>

              <div className="bg-white rounded-[14px] shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">Subcategory</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {additionalData.map((item, index) => (
                      <tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-[#faf9f7]'}`}>
                        <td className="px-6 py-4 text-sm font-semibold text-[#101828] capitalize">{item.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{item.subcategory}</td>
                        <td className="px-6 py-4 text-sm text-[#101828]">{formatCurrency(item.amount)}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{item.description}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            item.isCustomUpload ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.isCustomUpload ? 'Custom Upload' : 'Manual Entry'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteData(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {additionalData.length === 0 && (
                  <div className="text-center py-16 text-gray-500 bg-white">
                    <p className="text-base">No additional data added. Click "Add Data" to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GENERATE REPORT TAB */}
          {activeTab === 'generate_report' && (
            <div className="space-y-6">
              {!showRichEditor ? (
                <div className="bg-white rounded-[14px] p-8 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Generate MD&A Report</h3>
                    <button
                      onClick={generateMDAReport}
                      className="flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1e293b] transition-colors"
                    >
                      <FileText size={20} />
                      Generate Report
                    </button>
                  </div>

                  <div className="text-center py-16 text-gray-500">
                    <FileText size={64} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-semibold mb-2">No Report Generated</p>
                    <p className="text-gray-400">Click "Generate Report" to create your MD&A report with rich text editing</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[14px] p-8 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">MD&A Report - Rich Text Editor</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const printWindow = window.open('', '', 'height=600,width=800');
                          printWindow.document.write('<html><head><title>MD&A Report</title>');
                          printWindow.document.write('<style>body{font-family:Arial,sans-serif;padding:40px;}</style>');
                          printWindow.document.write('</head><body>');
                          printWindow.document.write(reportContent);
                          printWindow.document.write('</body></html>');
                          printWindow.document.close();
                          printWindow.print();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        <Download size={16} />
                        Export PDF
                      </button>
                    </div>
                  </div>

                  {/* Rich Text Editor Toolbar */}
                  <div className="border border-gray-300 rounded-t-lg p-3 bg-gray-50 flex flex-wrap gap-2 items-center">
                    <button className="p-2 hover:bg-gray-200 rounded" title="Bold"><Bold size={18} /></button>
                    <button className="p-2 hover:bg-gray-200 rounded" title="Italic"><Italic size={18} /></button>
                    <button className="p-2 hover:bg-gray-200 rounded" title="Underline"><Underline size={18} /></button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button className="p-2 hover:bg-gray-200 rounded" title="Align Left"><AlignLeft size={18} /></button>
                    <button className="p-2 hover:bg-gray-200 rounded" title="Align Center"><AlignCenter size={18} /></button>
                    <button className="p-2 hover:bg-gray-200 rounded" title="Align Right"><AlignRight size={18} /></button>
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button className="p-2 hover:bg-gray-200 rounded" title="Insert Table"><Table size={18} /></button>
                    <button className="p-2 hover:bg-gray-200 rounded" title="Insert List"><List size={18} /></button>
                    <button className="p-2 hover:bg-gray-200 rounded" title="Add Text"><Type size={18} /></button>
                  </div>

                  {/* Editable Content Area */}
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="border border-t-0 border-gray-300 rounded-b-lg p-8 min-h-[600px] focus:outline-none focus:ring-2 focus:ring-[#101828] bg-white"
                    dangerouslySetInnerHTML={{ __html: reportContent }}
                    onBlur={(e) => setReportContent(e.currentTarget.innerHTML)}
                  />

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        const blob = new Blob([reportContent], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `MD&A_Report_${new Date().toISOString().split('T')[0]}.html`;
                        a.click();
                      }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Save HTML
                    </button>
                    <button
                      onClick={() => setShowRichEditor(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Close Editor
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Data Modal */}
      {showAddDataModal && (
        <div className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-50 overflow-y-auto animate-slideLeft">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Add Additional Data</h3>
                <p className="text-sm text-slate-300 mt-1">Add supplementary revenue or expense data</p>
              </div>
              <button
                onClick={() => setShowAddDataModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data Entry Method</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!dataForm.isCustomUpload}
                        onChange={() => setDataForm({...dataForm, isCustomUpload: false})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">Manual Entry</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={dataForm.isCustomUpload}
                        onChange={() => setDataForm({...dataForm, isCustomUpload: true})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">Custom Upload</span>
                    </label>
                  </div>
                </div>

                {dataForm.isCustomUpload && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Upload size={16} className="inline mr-2" />
                      Upload Excel/CSV File
                    </label>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setDataForm({...dataForm, uploadFile: e.target.files[0]})}
                      className="w-full text-sm"
                    />
                    <p className="text-xs text-gray-600 mt-2">Upload revenue or expense breakdown data</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={dataForm.category}
                    onChange={(e) => setDataForm({...dataForm, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                  >
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory *</label>
                  <input
                    type="text"
                    value={dataForm.subcategory}
                    onChange={(e) => setDataForm({...dataForm, subcategory: e.target.value})}
                    placeholder="e.g., Product Sales, Marketing Expenses"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount *</label>
                  <input
                    type="number"
                    value={dataForm.amount}
                    onChange={(e) => setDataForm({...dataForm, amount: parseFloat(e.target.value)})}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={dataForm.description}
                    onChange={(e) => setDataForm({...dataForm, description: e.target.value})}
                    rows={4}
                    placeholder="Optional description..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#101828] focus:border-transparent text-[#101828] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gray-200">
              <button
                onClick={handleAddData}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 hover:shadow-lg transition-all duration-200 shadow-md"
              >
                <Save size={20} />
                Save Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assist Modal */}
      {showAIAssist && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={() => setShowAIAssist(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
              <div className="bg-indigo-600 text-white px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">AI Executive Summary Generator</h3>
                    <p className="text-sm text-indigo-100">Generate summary based on financial metrics</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIAssist(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(80vh-100px)]">
                {/* Generate Button */}
                <button
                  onClick={handleAIGenerateSummary}
                  disabled={generatingAI}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 hover:shadow-lg transition-all duration-200 mb-6 disabled:opacity-50"
                >
                  <Sparkles size={20} />
                  {generatingAI ? 'Generating...' : 'Generate Executive Summary'}
                </button>

                {/* AI Suggestion */}
                {aiSuggestion && (
                  <div className="space-y-4 animate-slideUp">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                        <CheckCircle size={20} />
                        AI Generated Summary
                      </div>
                      <p className="text-sm text-green-700">Based on your financial metrics and comparative analysis</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Overview:</label>
                      <div className="bg-slate-50 border border-slate-300 p-4 rounded-xl text-sm text-slate-900 whitespace-pre-line">
                        {aiSuggestion.overview}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Business Outlook:</label>
                      <div className="bg-slate-50 border border-slate-300 p-4 rounded-xl text-sm text-slate-900 whitespace-pre-line">
                        {aiSuggestion.outlook}
                      </div>
                    </div>

                    <button
                      onClick={applyAISuggestion}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={20} />
                      Apply This Summary
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  CheckCircle2,
  Building2,
  FileText,
  AlertCircle,
  DollarSign,
  Users,
  BarChart3,
  Activity,
  Send,
  Sparkles,
  Minimize2,
  Maximize2,
  X,
  Bot
} from 'lucide-react';

export default function Home() {
  const [entities, setEntities] = useState([]);
  const [trialBalances, setTrialBalances] = useState([]);
  const [eliminations, setEliminations] = useState([]);
  const [builds, setBuilds] = useState([]);
  const [logics, setLogics] = useState([]);
  const [kpis, setKpis] = useState({
    totalEntities: 0,
    activeEntities: 0,
    pendingSubmissions: 0,
    consolidationProgress: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    revenue: 0,
    expenses: 0,
    netIncome: 0,
    eliminationsCount: 0,
    adjustmentsCount: 0
  });

  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI assistant. I can analyze your consolidation data and answer questions based ONLY on your actual database records. I will not speculate or provide general advice - only data-driven insights from your entities, trial balances, eliminations, and adjustments. What would you like to know?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchAllData = async () => {
    try {
      const [entitiesRes, tbRes, elimRes, buildsRes, logicsRes] = await Promise.all([
        supabase.from('entities').select('*'),
        supabase.from('trial_balance').select('*'),
        supabase.from('eliminations').select('*'),
        supabase.from('builder_entries').select('*'),
        supabase.from('entity_logic').select('*')
      ]);

      const entitiesData = entitiesRes.data || [];
      const tbData = tbRes.data || [];
      const elimData = elimRes.data || [];
      const buildsData = buildsRes.data || [];
      const logicsData = logicsRes.data || [];

      setEntities(entitiesData);
      setTrialBalances(tbData);
      setEliminations(elimData);
      setBuilds(buildsData);
      setLogics(logicsData);

      // Calculate KPIs
      const activeEntities = entitiesData.filter(e => e.is_active).length;
      const totalEntities = entitiesData.length;

      // Calculate financial metrics from trial balance
      const totalAssets = tbData
        .filter(tb => tb.account_class === 'Assets')
        .reduce((sum, tb) => sum + (parseFloat(tb.debit_balance || 0) - parseFloat(tb.credit_balance || 0)), 0);

      const totalLiabilities = tbData
        .filter(tb => tb.account_class === 'Liabilities')
        .reduce((sum, tb) => sum + (parseFloat(tb.credit_balance || 0) - parseFloat(tb.debit_balance || 0)), 0);

      const totalEquity = tbData
        .filter(tb => tb.account_class === 'Equity')
        .reduce((sum, tb) => sum + (parseFloat(tb.credit_balance || 0) - parseFloat(tb.debit_balance || 0)), 0);

      const revenue = tbData
        .filter(tb => tb.account_class === 'Income')
        .reduce((sum, tb) => sum + (parseFloat(tb.credit_balance || 0) - parseFloat(tb.debit_balance || 0)), 0);

      const expenses = tbData
        .filter(tb => tb.account_class === 'Expenses')
        .reduce((sum, tb) => sum + (parseFloat(tb.debit_balance || 0) - parseFloat(tb.credit_balance || 0)), 0);

      const netIncome = revenue - expenses;

      // Get unique entities that have submitted TB
      const entitiesWithTB = new Set(tbData.map(tb => tb.entity_id)).size;
      const consolidationProgress = totalEntities > 0 ? Math.round((entitiesWithTB / totalEntities) * 100) : 0;

      const pendingSubmissions = totalEntities - entitiesWithTB;

      setKpis({
        totalEntities,
        activeEntities,
        pendingSubmissions,
        consolidationProgress,
        totalAssets,
        totalLiabilities,
        totalEquity,
        revenue,
        expenses,
        netIncome,
        eliminationsCount: elimData.filter(e => e.is_active).length,
        adjustmentsCount: buildsData.filter(b => b.is_active).length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoadingChat) return;

    const userMessage = chatInput.trim();
    setChatInput('');

    // Add user message
    const newMessages = [...chatMessages, { role: 'user', content: userMessage }];
    setChatMessages(newMessages);
    setIsLoadingChat(true);

    try {
      // Call OpenAI API with context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          context: {
            kpis,
            entities: entities.map(e => ({
              entity_name: e.entity_name,
              entity_code: e.entity_code,
              region: e.region,
              is_active: e.is_active
            })),
            eliminationsCount: eliminations.length,
            buildsCount: builds.length,
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      }]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const formatCurrency = (value) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        title="Dashboard"
        subtitle="IFRS Consolidation Hub - Real-time Insights"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - KPIs (2/3 width) */}
          <div className="xl:col-span-2 space-y-8">
            {/* Entity & Progress KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Entities</div>
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 size={20} className="text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900">{kpis.totalEntities}</div>
                <div className="flex items-center gap-1 text-sm text-emerald-600 mt-3 font-medium">
                  <CheckCircle2 size={14} />
                  <span>{kpis.activeEntities} active</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Pending TBs</div>
                  <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock size={20} className="text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900">{kpis.pendingSubmissions}</div>
                <div className="flex items-center gap-1 text-sm text-amber-600 mt-3 font-medium">
                  <AlertCircle size={14} />
                  <span>Awaiting submission</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Current Period</div>
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar size={20} className="text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900">Q4 2024</div>
                <div className="text-sm text-slate-600 mt-3 font-medium">Oct - Dec 2024</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Progress</div>
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900">{kpis.consolidationProgress}%</div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${kpis.consolidationProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Financial Position KPIs */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Financial Position</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="text-sm font-semibold text-slate-600 mb-2">Total Assets</div>
                  <div className="text-3xl font-bold text-slate-900">{formatCurrency(kpis.totalAssets)}</div>
                  <div className="flex items-center gap-1 text-sm text-blue-600 mt-2">
                    <TrendingUp size={14} />
                    <span>Consolidated</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl border border-rose-100">
                  <div className="text-sm font-semibold text-slate-600 mb-2">Total Liabilities</div>
                  <div className="text-3xl font-bold text-slate-900">{formatCurrency(kpis.totalLiabilities)}</div>
                  <div className="text-sm text-slate-600 mt-2">
                    D/E: {((kpis.totalLiabilities / kpis.totalEquity) || 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                  <div className="text-sm font-semibold text-slate-600 mb-2">Total Equity</div>
                  <div className="text-3xl font-bold text-slate-900">{formatCurrency(kpis.totalEquity)}</div>
                  <div className="flex items-center gap-1 text-sm text-emerald-600 mt-2">
                    <CheckCircle2 size={14} />
                    <span>Healthy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Income Statement KPIs */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Income Statement</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <div className="text-sm font-semibold text-slate-600 mb-2">Revenue</div>
                  <div className="text-3xl font-bold text-slate-900">{formatCurrency(kpis.revenue)}</div>
                  <div className="flex items-center gap-1 text-sm text-purple-600 mt-2">
                    <Activity size={14} />
                    <span>YTD Total</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                  <div className="text-sm font-semibold text-slate-600 mb-2">Expenses</div>
                  <div className="text-3xl font-bold text-slate-900">{formatCurrency(kpis.expenses)}</div>
                  <div className="text-sm text-slate-600 mt-2">
                    Operating costs
                  </div>
                </div>
                <div className={`p-4 rounded-xl border ${kpis.netIncome >= 0 ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100'}`}>
                  <div className="text-sm font-semibold text-slate-600 mb-2">Net Income</div>
                  <div className={`text-3xl font-bold ${kpis.netIncome >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formatCurrency(kpis.netIncome)}
                  </div>
                  <div className="flex items-center gap-1 text-sm mt-2">
                    {kpis.netIncome >= 0 ? (
                      <><TrendingUp size={14} className="text-emerald-600" /><span className="text-emerald-600">Profitable</span></>
                    ) : (
                      <><TrendingDown size={14} className="text-red-600" /><span className="text-red-600">Loss</span></>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Adjustments & Eliminations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Activity size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Active Eliminations</h3>
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">{kpis.eliminationsCount}</div>
                <p className="text-sm text-slate-600">Intercompany eliminations configured</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Active Adjustments</h3>
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">{kpis.adjustmentsCount}</div>
                <p className="text-sm text-slate-600">Custom builds and adjustments</p>
              </div>
            </div>
          </div>

          {/* Right Column - AI Chatbot (1/3 width) */}
          <div className="xl:col-span-1">
            <div
              className={`bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                isChatExpanded ? 'fixed inset-4 z-50' : isChatMinimized ? 'h-20' : 'sticky top-4'
              }`}
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">AI Assistant</h3>
                    <p className="text-xs text-indigo-100">Ask me anything about your data</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isChatMinimized && (
                    <button
                      onClick={() => setIsChatExpanded(!isChatExpanded)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title={isChatExpanded ? "Restore" : "Expand"}
                    >
                      {isChatExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                  )}
                  <button
                    onClick={() => setIsChatMinimized(!isChatMinimized)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title={isChatMinimized ? "Show" : "Minimize"}
                  >
                    {isChatMinimized ? <Bot size={18} /> : <X size={18} />}
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              {!isChatMinimized && (
                <>
                  <div className={`overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white ${
                    isChatExpanded ? 'h-[calc(100vh-200px)]' : 'h-[500px]'
                  }`}>
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-slate-900 text-white'
                              : 'bg-white border border-slate-200 text-slate-900'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles size={14} className="text-indigo-600" />
                              <span className="text-xs font-semibold text-indigo-600">AI Assistant</span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoadingChat && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-200 bg-white">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about entities, financials, eliminations..."
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 text-sm"
                        disabled={isLoadingChat}
                      />
                      <button
                        type="submit"
                        disabled={isLoadingChat || !chatInput.trim()}
                        className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

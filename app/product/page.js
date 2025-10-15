'use client';

import { useEffect, useState } from 'react';
import PreAuthNav from '@/components/PreAuthNav';
import Link from 'next/link';
import {
  Calendar,
  CheckSquare,
  Layers,
  Clock,
  Search,
  TrendingUp,
  FileText,
  BarChart3,
  Shield,
  Globe,
  FileCheck,
  Zap,
  ArrowRight,
  Play,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  MessageSquare,
  LineChart,
  HeadphonesIcon,
  Briefcase,
  Target
} from 'lucide-react';

export default function ProductPage() {
  const [activeDemo, setActiveDemo] = useState('close');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeIn');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in-section').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50/50">
      <PreAuthNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        <div className="relative max-w-[1200px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 mb-8 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#7B61FF] animate-pulse"></div>
            <span className="text-sm font-medium text-[#475569] tracking-wide">One Unified Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-[#101828] mb-6 tracking-tight leading-tight">
            Two Solutions,
            <br />
            <span className="bg-gradient-to-r from-[#7B61FF] to-[#6366f1] bg-clip-text text-transparent">
              Endless Possibilities
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-4">
            Close and Consolidation at your fingertips. Add powerful AI modules to solve every finance challenge.
          </p>
          <p className="text-lg text-slate-500 max-w-3xl mx-auto">
            From month-end close automation to enterprise consolidation, CLOE adapts to your needs with modular add-ons for revenue analysis, accounting support, forecasting, and more.
          </p>
        </div>
      </section>

      {/* Close & Consolidation Side by Side */}
      <section className="relative py-32 px-6 lg:px-8 bg-gradient-to-b from-slate-50/50 via-white to-slate-50 overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          {/* Toggle Selector */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <button
              onClick={() => setActiveDemo('close')}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                activeDemo === 'close'
                  ? 'bg-gradient-to-r from-[#7B61FF] to-[#6366f1] text-white shadow-lg shadow-[#7B61FF]/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-[#7B61FF]/30'
              }`}
            >
              <Calendar className="inline mr-2" size={20} />
              Close
            </button>
            <button
              onClick={() => setActiveDemo('consolidation')}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                activeDemo === 'consolidation'
                  ? 'bg-gradient-to-r from-[#7B61FF] to-[#6366f1] text-white shadow-lg shadow-[#7B61FF]/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-[#7B61FF]/30'
              }`}
            >
              <BarChart3 className="inline mr-2" size={20} />
              Consolidation
            </button>
          </div>

          {/* Close Solution */}
          {activeDemo === 'close' && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-4">
                  Financial Close Automation
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Streamline your month-end and year-end close with intelligent automation
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
                {/* Left: Demo Windows */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                    <div className="px-4 py-3 bg-[#101828] flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-xs text-slate-300 ml-2 font-semibold">Close Dashboard - January 2025</span>
                    </div>
                    <div className="p-6 min-h-[400px]">
                      {/* Progress Overview */}
                      <div className="text-center mb-6">
                        <div className="text-5xl font-bold text-[#101828] mb-2">68%</div>
                        <div className="text-sm text-slate-600 mb-3">Complete • On Track for Day 5 Close</div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div className="bg-gradient-to-r from-[#7B61FF] to-[#6366f1] h-3 rounded-full w-[68%] transition-all duration-500"></div>
                        </div>
                      </div>

                      {/* Entity Status */}
                      <div className="space-y-3 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold text-slate-900">US Entity</div>
                            <CheckCircle2 className="text-green-600" size={18} />
                          </div>
                          <div className="text-xs text-green-700">All reconciliations approved • Ready for consolidation</div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold text-slate-900">UK Entity</div>
                            <Clock className="text-blue-600 animate-pulse" size={18} />
                          </div>
                          <div className="text-xs text-blue-700">Bank rec in progress • Assigned to Sarah Chen</div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold text-slate-900">Singapore Entity</div>
                            <AlertCircle className="text-amber-600" size={18} />
                          </div>
                          <div className="text-xs text-amber-700">Pending intercompany reconciliation</div>
                        </div>
                      </div>

                      {/* AI Insight */}
                      <div className="p-3 bg-[#7B61FF]/10 rounded-lg border border-[#7B61FF]/20">
                        <div className="text-xs font-semibold text-[#7B61FF] mb-1 flex items-center gap-1">
                          <Sparkles size={12} />
                          AI Insight
                        </div>
                        <div className="text-xs text-slate-600">
                          You're 2 days ahead of last month's close. UK entity will complete on schedule.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Key Features */}
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-[#101828] mb-6">Key Features</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <div>
                        <span className="font-semibold text-slate-900">Dynamic Close Calendar</span>
                        <span className="text-slate-600"> – Manage multi-entity, multi-period close with automated task dependencies</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <div>
                        <span className="font-semibold text-slate-900">AI-Powered Reconciliations</span>
                        <span className="text-slate-600"> – Automated matching engine for bank recs, intercompany balances, and variance analysis</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <div>
                        <span className="font-semibold text-slate-900">Approval Workflows</span>
                        <span className="text-slate-600"> – Multi-level approval chains with role-based permissions and complete audit trail</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <div>
                        <span className="font-semibold text-slate-900">Real-Time Dashboards</span>
                        <span className="text-slate-600"> – Track progress across all entities, monitor bottlenecks, and see completion status live</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <div>
                        <span className="font-semibold text-slate-900">Complete Audit Trail</span>
                        <span className="text-slate-600"> – Every action tracked and logged for SOX compliance and audit readiness</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* How Close Helps - App Demo */}
              <div className="mt-20">
                <h3 className="text-3xl font-bold text-[#101828] mb-4 text-center">How Close Helps Your Team</h3>
                <p className="text-lg text-slate-600 mb-12 text-center max-w-2xl mx-auto">
                  See the app in action
                </p>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {/* Window 1: Task Automation */}
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                    <div className="px-3 py-2 bg-[#101828] flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-[10px] text-slate-300 ml-1 font-semibold">Task Automation</span>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-white min-h-[280px]">
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="text-green-600" size={14} />
                            <span className="text-xs font-semibold text-slate-900">Trial Balance Upload</span>
                          </div>
                          <div className="text-[10px] text-green-700">Completed • 12/12 entities</div>
                        </div>

                        <div className="flex justify-center">
                          <ArrowRight className="text-slate-300 rotate-90" size={16} />
                        </div>

                        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="text-blue-600 animate-pulse" size={14} />
                            <span className="text-xs font-semibold text-slate-900">Bank Reconciliations</span>
                          </div>
                          <div className="text-[10px] text-blue-700 mb-2">Auto-started • 8/12 done</div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full w-[67%]"></div>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <ArrowRight className="text-slate-300 rotate-90" size={16} />
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 opacity-60">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="text-slate-400" size={14} />
                            <span className="text-xs font-semibold text-slate-700">Journal Entries</span>
                          </div>
                          <div className="text-[10px] text-slate-600">Queued • Waiting for Bank Recs</div>
                        </div>
                      </div>

                      <div className="mt-4 p-2 bg-[#7B61FF]/10 border border-[#7B61FF]/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Sparkles className="text-[#7B61FF] flex-shrink-0" size={12} />
                          <div className="text-[10px] text-slate-700">Tasks auto-unlock when dependencies complete</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Window 2: Exception Detection */}
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                    <div className="px-3 py-2 bg-[#101828] flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-[10px] text-slate-300 ml-1 font-semibold">AI Exception Detection</span>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-white min-h-[280px]">
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-slate-800 mb-2">Bank Reconciliation - Chase Checking</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-600">Book Balance</span>
                            <span className="font-mono font-semibold">$2,450,327.58</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-600">Bank Balance</span>
                            <span className="font-mono font-semibold">$2,462,777.58</span>
                          </div>
                          <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[10px]">
                            <span className="text-amber-700 font-semibold">Difference</span>
                            <span className="font-mono font-semibold text-amber-700">$12,450.00</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={14} />
                          <div className="text-xs font-semibold text-amber-900">AI Detected Variance</div>
                        </div>
                        <div className="text-[10px] text-amber-800 leading-relaxed">
                          Outstanding check #4582 for $12,450 dated Dec 28. Vendor: Acme Corp. Expected to clear in 1-2 days.
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={14} />
                          <div>
                            <div className="text-xs font-semibold text-green-900 mb-1">Suggested Action</div>
                            <div className="text-[10px] text-green-800">Add outstanding check to reconciliation. One-click to apply.</div>
                          </div>
                        </div>
                      </div>

                      <button className="w-full mt-3 bg-gradient-to-r from-[#7B61FF] to-[#6366f1] text-white text-[10px] py-2 rounded-lg font-semibold">
                        Apply Suggestion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Consolidation Solution */}
          {activeDemo === 'consolidation' && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-4">
                  Enterprise Consolidation
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Multi-entity, multi-currency, multi-GAAP consolidation in real-time
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
                {/* Left: Demo Window */}
                <div className="space-y-6">
                  <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                    <div className="px-4 py-3 bg-[#101828] flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-xs text-slate-300 ml-2 font-semibold">Consolidation Engine - Q4 2024</span>
                    </div>
                    <div className="p-6 min-h-[400px]">
                      {/* Entity Selector */}
                      <div className="flex items-center gap-2 mb-6">
                        <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                          <div className="text-[10px] text-slate-500 mb-0.5">Consolidation</div>
                          <div className="text-xs font-semibold text-slate-900">Group - All Entities</div>
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                          <div className="text-[10px] text-slate-500 mb-0.5">Period</div>
                          <div className="text-xs font-semibold text-slate-900">Q4 2024</div>
                        </div>
                      </div>

                      {/* Consolidation Steps */}
                      <div className="space-y-3 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold text-slate-900">Currency Translation</div>
                            <CheckCircle2 className="text-green-600" size={18} />
                          </div>
                          <div className="text-xs text-green-700">3 entities • EUR, GBP, SGD → USD</div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold text-slate-900">Intercompany Eliminations</div>
                            <CheckCircle2 className="text-green-600" size={18} />
                          </div>
                          <div className="text-xs text-green-700">42 transactions • $1.8M eliminated</div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold text-slate-900">GAAP Adjustments</div>
                            <CheckCircle2 className="text-green-600" size={18} />
                          </div>
                          <div className="text-xs text-green-700">US GAAP applied • IFRS notes ready</div>
                        </div>
                      </div>

                      {/* Consolidated Results */}
                      <div className="bg-gradient-to-br from-[#7B61FF]/10 to-[#6366f1]/10 rounded-xl p-4 border border-[#7B61FF]/20 mb-4">
                        <div className="text-sm font-bold text-[#101828] mb-3">Consolidated Financials (USD)</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-700">Total Revenue</span>
                            <span className="font-mono font-semibold">$12.4M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-700">Total Assets</span>
                            <span className="font-mono font-semibold">$45.2M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-700">Net Income</span>
                            <span className="font-mono font-semibold text-green-700">$3.1M</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Insight */}
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                          <Sparkles size={12} />
                          Consolidation Complete
                        </div>
                        <div className="text-xs text-blue-700">
                          All entities consolidated • Ready to generate statements
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Key Features */}
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-[#101828] mb-6">Key Features</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <div>
                        <span className="font-semibold text-slate-900">Multi-Currency Consolidation</span>
                        <span className="text-slate-600"> – Automatic currency translation with real-time exchange rates for 150+ currencies</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <div>
                        <span className="font-semibold text-slate-900">Intercompany Eliminations</span>
                        <span className="text-slate-600"> – Automated matching and elimination of intercompany transactions and balances</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <div>
                        <span className="font-semibold text-slate-900">Multi-GAAP Support</span>
                        <span className="text-slate-600"> – Apply IFRS, US GAAP, or local GAAP with automated adjustment journals</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <div>
                        <span className="font-semibold text-slate-900">Financial Statements</span>
                        <span className="text-slate-600"> – Generate complete statement packages with drill-down capability to source transactions</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <div>
                        <span className="font-semibold text-slate-900">Real-Time Consolidation</span>
                        <span className="text-slate-600"> – Instant consolidation as entities complete their close - no waiting for batch processes</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* How Consolidation Helps - App Demo */}
              <div className="mt-20">
                <h3 className="text-3xl font-bold text-[#101828] mb-4 text-center">How Consolidation Helps Your Team</h3>
                <p className="text-lg text-slate-600 mb-12 text-center max-w-2xl mx-auto">
                  See the app in action
                </p>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {/* Window 1: Currency Translation */}
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                    <div className="px-3 py-2 bg-[#101828] flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-[10px] text-slate-300 ml-1 font-semibold">Currency Translation</span>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-white min-h-[280px]">
                      <div className="text-xs font-semibold text-slate-800 mb-3">Multi-Currency to USD Consolidation</div>

                      <div className="space-y-2 mb-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-blue-900">UK Entity (GBP)</span>
                            <CheckCircle2 className="text-green-600" size={12} />
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-600">Revenue: £2.5M</span>
                            <ArrowRight className="text-slate-400" size={12} />
                            <span className="font-mono font-semibold">$3.2M</span>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-1">Rate: 1.2850 • Updated 2 min ago</div>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-purple-900">EU Entity (EUR)</span>
                            <CheckCircle2 className="text-green-600" size={12} />
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-600">Revenue: €1.8M</span>
                            <ArrowRight className="text-slate-400" size={12} />
                            <span className="font-mono font-semibold">$2.0M</span>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-1">Rate: 1.0950 • Updated 2 min ago</div>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-emerald-900">APAC Entity (SGD)</span>
                            <CheckCircle2 className="text-green-600" size={12} />
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-600">Revenue: S$900K</span>
                            <ArrowRight className="text-slate-400" size={12} />
                            <span className="font-mono font-semibold">$680K</span>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-1">Rate: 0.7556 • Updated 2 min ago</div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-[#7B61FF]/10 to-[#6366f1]/10 border border-[#7B61FF]/20 rounded-lg p-3">
                        <div className="text-xs font-semibold text-[#101828] mb-2">Consolidated Revenue (USD)</div>
                        <div className="text-2xl font-bold text-[#101828]">$5.88M</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Sparkles className="text-[#7B61FF]" size={10} />
                          <span className="text-[9px] text-slate-600">Auto-translated • Real-time rates</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Window 2: Intercompany Elimination */}
                  <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                    <div className="px-3 py-2 bg-[#101828] flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-[10px] text-slate-300 ml-1 font-semibold">Intercompany Matching</span>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-white min-h-[280px]">
                      <div className="text-xs font-semibold text-slate-800 mb-3">AI-Powered Transaction Matching</div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <div className="text-[9px] text-blue-900 font-semibold mb-1">US Entity</div>
                          <div className="text-[10px] text-slate-700 mb-1">Loan Receivable</div>
                          <div className="font-mono text-xs font-semibold">$450K</div>
                          <div className="text-[9px] text-slate-500">To: UK</div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                          <div className="text-[9px] text-purple-900 font-semibold mb-1">UK Entity</div>
                          <div className="text-[10px] text-slate-700 mb-1">Loan Payable</div>
                          <div className="font-mono text-xs font-semibold">$450K</div>
                          <div className="text-[9px] text-slate-500">From: US</div>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="text-green-600" size={14} />
                            <div>
                              <div className="text-xs font-semibold text-green-900">Auto-Matched</div>
                              <div className="text-[9px] text-green-700">100% match • Ready to eliminate</div>
                            </div>
                          </div>
                          <div className="font-mono text-sm font-bold text-green-700">$450K</div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-[10px] py-1">
                          <span className="text-slate-600">Total Intercompany</span>
                          <span className="font-mono font-semibold">$1.8M</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] py-1">
                          <span className="text-slate-600">Auto-Matched</span>
                          <span className="font-mono font-semibold text-green-700">$1.7M</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] py-1 pb-2 border-b border-slate-200">
                          <span className="text-slate-600">Needs Review</span>
                          <span className="font-mono font-semibold text-amber-700">$100K</span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-1">
                          <span className="text-slate-800 font-semibold">Match Rate</span>
                          <span className="font-bold text-[#7B61FF]">94%</span>
                        </div>
                      </div>

                      <div className="p-2 bg-[#7B61FF]/10 border border-[#7B61FF]/20 rounded-lg">
                        <div className="flex items-start gap-1">
                          <Sparkles className="text-[#7B61FF] flex-shrink-0 mt-0.5" size={10} />
                          <div className="text-[9px] text-slate-700">AI matched 42 of 45 transactions automatically</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Add-Ons Section */}
      <section className="relative py-32 px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 mb-6 shadow-sm">
              <Sparkles size={16} className="text-[#7B61FF]" />
              <span className="text-sm font-medium text-slate-700">Powerful Add-Ons</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-6">
              Extend Your Platform
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Add AI-powered modules to solve every finance challenge - from revenue analysis to CFO dashboards
            </p>
          </div>

          {/* Revenue Add-On with Demo Window */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-[#101828] mb-8 text-center">Revenue Analysis Add-On</h3>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Demo Window */}
              <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                <div className="px-4 py-3 bg-[#101828] flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-slate-300 ml-2 font-semibold">Revenue Analysis - Contract Review</span>
                </div>
                <div className="p-6 min-h-[400px]">
                  {/* Contract Upload */}
                  <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 mb-4 text-center">
                    <FileText className="text-slate-400 mx-auto mb-2" size={32} />
                    <div className="text-sm font-semibold text-slate-700 mb-1">SaaS_Contract_2025.pdf</div>
                    <div className="text-xs text-slate-500">Uploaded • Analyzing...</div>
                  </div>

                  {/* AI Analysis Results */}
                  <div className="space-y-3 mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Sparkles className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-blue-900 mb-2">AI Analysis Complete</div>
                          <div className="text-xs text-blue-700 space-y-2">
                            <p><strong>Contract Type:</strong> Multi-year SaaS subscription with usage-based pricing</p>
                            <p><strong>Total Contract Value:</strong> $480,000 over 3 years</p>
                            <p><strong>Recognition Pattern:</strong> Ratable (monthly) + Usage (monthly in arrears)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        Revenue Recognition Advice
                      </div>
                      <div className="text-xs text-green-700 space-y-1">
                        <p>✓ Recognize $13,333/month for base subscription (IFRS 15 compliant)</p>
                        <p>✓ Recognize usage fees monthly as incurred</p>
                        <p>✓ Defer setup fee ($25,000) over contract term</p>
                        <p>✓ Create contract asset for performance obligations</p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Key Considerations
                      </div>
                      <div className="text-xs text-amber-700">
                        Contract includes a renewal option at Year 3. Monitor for variable consideration adjustments per ASC 606.
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-[#7B61FF] to-[#6366f1] text-white text-sm py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                    Create Revenue Schedule
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <DollarSign className="text-white" size={28} />
                </div>
                <h4 className="text-2xl font-bold text-[#101828] mb-4">AI Contract Analysis</h4>
                <p className="text-lg text-slate-600 mb-6">
                  Upload any revenue contract and get instant analysis with IFRS 15 / ASC 606 compliant recognition advice. Our AI reads contracts, identifies performance obligations, and creates recognition schedules automatically.
                </p>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <span>Analyzes contract terms and pricing structures</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <span>Provides revenue recognition recommendations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <span>Identifies key risks and considerations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <span>Generates automated revenue schedules</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Accounting Bot Add-On with Demo Window */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-[#101828] mb-8 text-center">Accounting Bot Add-On</h3>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Description */}
              <div className="order-2 lg:order-1">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare className="text-white" size={28} />
                </div>
                <h4 className="text-2xl font-bold text-[#101828] mb-4">Your AI Accounting Assistant</h4>
                <p className="text-lg text-slate-600 mb-6">
                  Ask any accounting question and get precise answers with exact IFRS/GAAP references in professional memo format. It's like having a senior accountant available 24/7.
                </p>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <span>Answers complex accounting questions instantly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <span>Provides IFRS and US GAAP references</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <span>Formats responses as professional memos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <span>Available 24/7 for your entire team</span>
                  </li>
                </ul>
              </div>

              {/* Demo Window */}
              <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 order-1 lg:order-2">
                <div className="px-4 py-3 bg-[#101828] flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-slate-300 ml-2 font-semibold">Accounting Bot - Q&A</span>
                </div>
                <div className="p-6 min-h-[400px] flex flex-col">
                  {/* User Question */}
                  <div className="flex justify-end mb-4">
                    <div className="bg-[#7B61FF]/10 border border-[#7B61FF]/20 rounded-lg px-4 py-3 max-w-[80%]">
                      <div className="text-xs font-semibold text-[#7B61FF] mb-1">You</div>
                      <div className="text-sm text-slate-700">
                        How should we account for a customer prepayment on a multi-year software license under IFRS 15?
                      </div>
                    </div>
                  </div>

                  {/* Bot Response in Memo Format */}
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 max-w-[90%]">
                      <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-2">
                        <Sparkles size={14} className="text-purple-600" />
                        Accounting Bot
                      </div>
                      <div className="text-xs text-slate-700 space-y-3">
                        <div>
                          <div className="font-bold mb-1">ACCOUNTING MEMO</div>
                          <div className="text-[10px] text-slate-500 mb-2">Re: Customer Prepayment - Software License</div>
                        </div>

                        <div>
                          <div className="font-semibold mb-1">Issue:</div>
                          <p>How to account for customer prepayments on multi-year software licenses under IFRS 15.</p>
                        </div>

                        <div>
                          <div className="font-semibold mb-1">Analysis:</div>
                          <p className="mb-2">Under IFRS 15, customer prepayments should be recognized as a contract liability (deferred revenue) until the performance obligation is satisfied.</p>
                          <p className="mb-2">For software licenses, recognize revenue:</p>
                          <ul className="list-disc ml-4 space-y-1">
                            <li>At a point in time if it's a functional license</li>
                            <li>Over time if it's a subscription/SaaS model</li>
                          </ul>
                        </div>

                        <div>
                          <div className="font-semibold mb-1">Accounting Treatment:</div>
                          <p className="mb-1"><strong>On receipt:</strong></p>
                          <p className="font-mono text-[10px] mb-2">Dr. Cash / Cr. Contract Liability (Deferred Revenue)</p>
                          <p className="mb-1"><strong>On satisfaction of performance obligation:</strong></p>
                          <p className="font-mono text-[10px]">Dr. Contract Liability / Cr. Revenue</p>
                        </div>

                        <div>
                          <div className="font-semibold mb-1">Reference:</div>
                          <p>IFRS 15.106-109 - Contract Liabilities</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="mt-auto pt-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask another question..."
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#7B61FF] bg-white"
                        disabled
                      />
                      <button className="px-4 py-2 bg-gradient-to-r from-[#7B61FF] to-[#6366f1] text-white rounded-lg text-sm font-semibold">
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional 5 Add-Ons */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-[#101828] mb-4 text-center">5 More Powerful Add-Ons</h3>
            <p className="text-lg text-slate-600 mb-12 text-center max-w-2xl mx-auto">
              Choose the modules that fit your needs and scale as you grow
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Forecasting */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[#7B61FF]/30 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <LineChart className="text-white" size={24} />
                </div>
                <h4 className="text-xl font-bold text-[#101828] mb-3">Forecasting</h4>
                <p className="text-sm text-slate-600">
                  AI-powered financial forecasting with scenario modeling and predictive analytics for cash flow, revenue, and expenses.
                </p>
              </div>

              {/* Audit Support */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[#7B61FF]/30 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <FileCheck className="text-white" size={24} />
                </div>
                <h4 className="text-xl font-bold text-[#101828] mb-3">Audit Support</h4>
                <p className="text-sm text-slate-600">
                  Automated audit file preparation with complete documentation, tie-outs, and support schedules ready for external auditors.
                </p>
              </div>

              {/* On-Call Advisory */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[#7B61FF]/30 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <HeadphonesIcon className="text-white" size={24} />
                </div>
                <h4 className="text-xl font-bold text-[#101828] mb-3">On-Call Advisory</h4>
                <p className="text-sm text-slate-600">
                  Connect with experienced CPAs and CFOs for complex accounting questions, technical guidance, and strategic advice.
                </p>
              </div>

              {/* CFO Dashboards */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[#7B61FF]/30 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                  <Target className="text-white" size={24} />
                </div>
                <h4 className="text-xl font-bold text-[#101828] mb-3">CFO Dashboards</h4>
                <p className="text-sm text-slate-600">
                  Executive dashboards with real-time KPIs, financial metrics, and board-ready visualizations for strategic decision-making.
                </p>
              </div>

              {/* Treasury Management */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[#7B61FF]/30 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="text-white" size={24} />
                </div>
                <h4 className="text-xl font-bold text-[#101828] mb-3">Treasury Management</h4>
                <p className="text-sm text-slate-600">
                  Cash position monitoring, liquidity forecasting, and automated bank reconciliations for comprehensive treasury operations.
                </p>
              </div>

              {/* Coming Soon Placeholder */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-dashed border-slate-300">
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="text-slate-400" size={24} />
                </div>
                <h4 className="text-xl font-bold text-slate-600 mb-3">More Coming Soon</h4>
                <p className="text-sm text-slate-500">
                  We're constantly building new modules based on customer feedback. Have a feature request? Let us know!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="relative bg-gradient-to-br from-[#101828] via-[#1e293b] to-[#101828] rounded-3xl p-16 shadow-2xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#7B61FF]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6366f1]/20 rounded-full blur-3xl"></div>

            <div className="relative text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Ready to transform your
                <br />
                <span className="bg-gradient-to-r from-[#7B61FF] to-[#6366f1] bg-clip-text text-transparent">
                  finance operations?
                </span>
              </h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                See how CLOE can streamline your close, consolidation, and every finance challenge in between
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    const modal = document.getElementById('contact-modal');
                    if (modal) modal.classList.remove('hidden');
                  }}
                  className="group px-8 py-4 bg-gradient-to-r from-[#7B61FF] to-[#6366f1] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#7B61FF]/50 transition-all flex items-center gap-2"
                >
                  Request Demo
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  href="/about"
                  className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  Learn About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-12 px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7B61FF] to-[#6366f1] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold">CLOE</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-slate-400">
              <Link href="/product" className="hover:text-white transition-colors">
                Product
              </Link>
              <Link href="/about" className="hover:text-white transition-colors">
                About
              </Link>
              <button
                onClick={() => {
                  const modal = document.getElementById('contact-modal');
                  if (modal) modal.classList.remove('hidden');
                }}
                className="hover:text-white transition-colors"
              >
                Contact
              </button>
              <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
            </div>
          </div>
          <div className="text-center text-slate-500 text-sm border-t border-slate-800 pt-8">
            © 2025 CLOE — Close. Consolidate. Conquer.
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #f7f5f2;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #101828, #475569);
          border-radius: 6px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #1e293b, #64748b);
        }
      `}</style>
    </div>
  );
}

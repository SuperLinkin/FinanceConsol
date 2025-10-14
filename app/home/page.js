'use client';

import { useEffect } from 'react';
import PreAuthNav from '@/components/PreAuthNav';
import Link from 'next/link';
import {
  Calendar,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Shield,
  Zap,
  Clock,
  Globe,
  AlertCircle,
  XCircle,
  Target,
  Users,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

export default function HomePage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    document.querySelectorAll('.fade-in-section').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const problems = [
    {
      icon: AlertCircle,
      title: 'Bloated Software',
      description: 'Enterprise tools with hundreds of features you will never use. Too complex, too expensive, too slow.'
    },
    {
      icon: XCircle,
      title: 'AI That Does Not Help',
      description: 'Buzzword-driven AI that generates more work than it saves. Black boxes that finance teams cannot trust.'
    },
    {
      icon: Target,
      title: 'Back to Excel',
      description: 'After spending millions on software, teams still export everything to Excel to actually get work done.'
    }
  ];

  const solutions = [
    {
      icon: Users,
      title: 'Built by Finance Teams',
      description: 'We have closed the books. We have built the consolidation models. We have felt the pain of month-end.'
    },
    {
      icon: Lightbulb,
      title: 'For Finance Teams',
      description: 'Every feature solves a real problem. No bloat. No complexity. Just tools that work the way you think.'
    },
    {
      icon: TrendingUp,
      title: 'Actually Useful AI',
      description: 'AI that learns your patterns, flags real exceptions, and speeds up work without the black box.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Dynamic Tech Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-purple-200 via-indigo-200 to-blue-200 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-gradient-to-br from-cyan-200 via-blue-200 to-indigo-200 rounded-full blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-br from-violet-200 via-purple-200 to-fuchsia-200 rounded-full blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDgsIDExNiwgMjU1LCAwLjA4KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

        {/* Floating data points - AI/Tech theme */}
        <div className="absolute top-20 left-[10%] w-2 h-2 bg-purple-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-[15%] w-3 h-3 bg-blue-400 rounded-full animate-float animation-delay-1000 opacity-50"></div>
        <div className="absolute top-[60%] left-[20%] w-2 h-2 bg-indigo-400 rounded-full animate-float animation-delay-2000 opacity-60"></div>
        <div className="absolute bottom-40 right-[25%] w-3 h-3 bg-cyan-400 rounded-full animate-float animation-delay-3000 opacity-50"></div>
        <div className="absolute top-[30%] right-[30%] w-2 h-2 bg-violet-400 rounded-full animate-float animation-delay-1500 opacity-60"></div>
        <div className="absolute bottom-[30%] left-[15%] w-3 h-3 bg-fuchsia-400 rounded-full animate-float animation-delay-2500 opacity-50"></div>

        {/* Connecting lines - Network effect */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7B61FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <line x1="10%" y1="10%" x2="90%" y2="30%" stroke="url(#line-gradient)" strokeWidth="1" className="animate-dash" />
          <line x1="20%" y1="60%" x2="80%" y2="80%" stroke="url(#line-gradient)" strokeWidth="1" className="animate-dash animation-delay-1000" />
          <line x1="30%" y1="20%" x2="70%" y2="70%" stroke="url(#line-gradient)" strokeWidth="1" className="animate-dash animation-delay-2000" />
        </svg>

        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}></div>
      </div>

      <PreAuthNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex justify-center mb-8 fade-in-section">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-[#7B61FF] animate-pulse"></div>
              <span className="text-sm font-semibold text-slate-900">AI-Native Finance Platform</span>
            </div>
          </div>

          <div className="text-center fade-in-section">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-[#0F172A] mb-6 tracking-tight leading-[0.95]">
              Finance automation
              <br />
              <span className="text-[#7B61FF]">built for scale</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-normal">
              CLOE is the AI-native platform for financial close and reporting —
              multi-entity, multi-GAAP, fully automated.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 fade-in-section">
              <button
                onClick={() => {
                  const modal = document.getElementById('contact-modal');
                  if (modal) modal.classList.remove('hidden');
                }}
                className="px-8 py-4 bg-[#0F172A] text-white rounded-xl font-semibold hover:bg-[#1e293b] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Request demo
              </button>

              <Link
                href="/product"
                className="px-8 py-4 bg-white text-[#0F172A] rounded-xl font-semibold border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                Explore product
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - The Story Begins */}
      <section className="py-32 px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50 fade-in-section">
        <div className="max-w-[1100px] mx-auto">
          {/* Problem Statement */}
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-red-50 border border-red-100 rounded-full mb-6">
              <span className="text-sm font-semibold text-red-900">The Problem</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6 tracking-tight leading-tight">
              Finance teams are drowning
              <br />
              <span className="text-gray-500">in software that doesn't work</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Billion-dollar enterprises. Millions spent on "modern" finance software.
              And at 2 AM on close night, everyone's still in Excel.
            </p>
          </div>

          {/* Problem Cards - Visual storytelling */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <div
                  key={index}
                  className="relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-red-200 transition-all duration-300 group"
                >
                  {/* Connection line to next card */}
                  {index < problems.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent z-10"></div>
                  )}

                  <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-100 transition-colors">
                    <Icon className="text-red-600" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{problem.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{problem.description}</p>
                </div>
              );
            })}
          </div>

          {/* Visual representation - The broken workflow */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-white text-center">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="px-6 py-3 bg-white/10 rounded-xl border border-white/20">
                <span className="font-semibold">ERP System</span>
              </div>
              <ArrowRight className="text-white/50" size={24} />
              <div className="px-6 py-3 bg-white/10 rounded-xl border border-white/20">
                <span className="font-semibold">Consolidation Tool</span>
              </div>
              <ArrowRight className="text-white/50" size={24} />
              <div className="px-6 py-3 bg-white/10 rounded-xl border border-white/20">
                <span className="font-semibold">Reporting Platform</span>
              </div>
              <ArrowRight className="text-white/50" size={24} />
              <div className="px-6 py-3 bg-red-500 rounded-xl border-2 border-red-400 shadow-lg">
                <span className="font-bold">Excel Spreadsheet</span>
              </div>
            </div>
            <p className="text-gray-300 mt-8 text-lg max-w-2xl mx-auto">
              The reality: After all the enterprise software, teams export to Excel because that's the only tool they trust.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section - Our Approach */}
      <section className="py-32 px-6 lg:px-8 bg-slate-50 fade-in-section">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
              <span className="text-sm font-semibold text-green-900">Our Solution</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6 tracking-tight leading-tight">
              Built by finance teams,
              <br />
              <span className="text-[#7B61FF]">for finance teams</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We have lived through the month-end chaos. Built the consolidation models at 3 AM.
              Fought with software that promised everything and delivered nothing.
            </p>
          </div>

          {/* Solution Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <div
                  key={index}
                  className="relative bg-white rounded-2xl p-8 border-2 border-green-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors">
                    <Icon className="text-green-600" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{solution.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{solution.description}</p>
                </div>
              );
            })}
          </div>

          {/* Visual - Our Approach */}
          <div className="bg-gradient-to-br from-[#7B61FF] to-[#6366f1] rounded-3xl p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-8">The CLOE Way</h3>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="px-6 py-4 bg-white rounded-xl text-[#0F172A] font-semibold shadow-lg">
                Real Problems
              </div>
              <ArrowRight className="text-white" size={28} />
              <div className="px-6 py-4 bg-white rounded-xl text-[#0F172A] font-semibold shadow-lg">
                Simple Solutions
              </div>
              <ArrowRight className="text-white" size={28} />
              <div className="px-6 py-4 bg-white rounded-xl text-[#0F172A] font-semibold shadow-lg">
                Actual Results
              </div>
            </div>
            <p className="text-purple-100 mt-8 text-lg max-w-2xl mx-auto">
              No enterprise bloat. No AI buzzwords. Just software that solves the problems you actually have.
            </p>
          </div>
        </div>
      </section>

      {/* What We're Building - The Vision */}
      <section className="py-32 px-6 lg:px-8 bg-white fade-in-section">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-purple-50 border border-purple-200 rounded-full mb-6">
              <span className="text-sm font-semibold text-purple-900">What We're Building</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6 tracking-tight leading-tight">
              Two solutions. One platform.
              <br />
              <span className="text-[#7B61FF]">All your finance needs.</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From close to consolidation to reporting - everything in one place,
              working the way you would build it yourself.
            </p>
          </div>

          {/* Solution Flow - Visual Journey */}
          <div className="relative">
            {/* Connecting Flow Line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7B61FF] via-purple-400 to-[#7B61FF] -ml-0.5"></div>

            {/* Solution 1: Financial Close */}
            <div className="relative mb-24">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Visual Side */}
                <div className="order-2 lg:order-1">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 border-2 border-blue-200 relative">
                    {/* Connection point */}
                    <div className="hidden lg:block absolute -right-6 top-1/2 w-12 h-12 bg-[#7B61FF] rounded-full border-4 border-white shadow-lg -mt-6 z-10 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="text-blue-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-[#0F172A]">Task Management</div>
                          <div className="text-sm text-gray-600">Smart calendar, automated tracking</div>
                        </div>
                        <CheckCircle2 className="text-green-500" size={20} />
                      </div>

                      <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Sparkles className="text-indigo-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-[#0F172A]">AI Variance Analysis</div>
                          <div className="text-sm text-gray-600">Detect exceptions automatically</div>
                        </div>
                        <CheckCircle2 className="text-green-500" size={20} />
                      </div>

                      <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="text-purple-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-[#0F172A]">Collaboration</div>
                          <div className="text-sm text-gray-600">Real-time approvals & comments</div>
                        </div>
                        <CheckCircle2 className="text-green-500" size={20} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full mb-4">
                    <span className="text-xs font-bold text-blue-900">SOLUTION 1</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 tracking-tight">
                    Financial Close
                  </h3>
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                    Automate your entire close cycle - from task assignment to variance analysis.
                    Cut your close time in half without hiring more people.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <ArrowRight className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">Smart close calendar with dependencies</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">AI-powered exception detection</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">Multi-entity reconciliation workflows</span>
                    </li>
                  </ul>
                  <Link
                    href="/product"
                    className="inline-flex items-center gap-2 text-[#7B61FF] font-semibold hover:gap-3 transition-all"
                  >
                    Learn more about Financial Close
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Solution 2: Financial Reporting */}
            <div className="relative">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Content Side */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full mb-4">
                    <span className="text-xs font-bold text-emerald-900">SOLUTION 2</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 tracking-tight">
                    Financial Reporting
                  </h3>
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                    Multi-entity, multi-GAAP consolidation that actually works.
                    From trial balance to board-ready financials in minutes.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <ArrowRight className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">Multi-currency consolidation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">Automated elimination entries</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="text-[#7B61FF] flex-shrink-0 mt-1" size={20} />
                      <span className="text-gray-700">Dynamic notes & disclosures</span>
                    </li>
                  </ul>
                  <Link
                    href="/product"
                    className="inline-flex items-center gap-2 text-[#7B61FF] font-semibold hover:gap-3 transition-all"
                  >
                    Learn more about Financial Reporting
                    <ArrowRight size={18} />
                  </Link>
                </div>

                {/* Visual Side */}
                <div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-12 border-2 border-emerald-200 relative">
                    {/* Connection point */}
                    <div className="hidden lg:block absolute -left-6 top-1/2 w-12 h-12 bg-[#7B61FF] rounded-full border-4 border-white shadow-lg -mt-6 z-10 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="text-emerald-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-[#0F172A]">Consolidation</div>
                          <div className="text-sm text-gray-600">Multi-GAAP, multi-currency</div>
                        </div>
                        <CheckCircle2 className="text-green-500" size={20} />
                      </div>

                      <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Target className="text-teal-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-[#0F172A]">Eliminations</div>
                          <div className="text-sm text-gray-600">Automated intercompany entries</div>
                        </div>
                        <CheckCircle2 className="text-green-500" size={20} />
                      </div>

                      <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                        <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="text-cyan-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-[#0F172A]">Export Reports</div>
                          <div className="text-sm text-gray-600">PDF & Excel ready</div>
                        </div>
                        <CheckCircle2 className="text-green-500" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Unity */}
          <div className="mt-24 text-center">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-16">
              <h3 className="text-4xl font-bold text-white mb-4">One Unified Platform</h3>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                No more juggling between tools. No more exports and imports.
                Everything flows seamlessly from close to reporting.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="px-6 py-3 bg-blue-500 rounded-xl text-white font-semibold">
                  Close
                </div>
                <div className="text-white text-2xl">+</div>
                <div className="px-6 py-3 bg-emerald-500 rounded-xl text-white font-semibold">
                  Consolidate
                </div>
                <div className="text-white text-2xl">+</div>
                <div className="px-6 py-3 bg-purple-500 rounded-xl text-white font-semibold">
                  Report
                </div>
                <div className="text-white text-2xl">=</div>
                <div className="px-8 py-4 bg-white rounded-xl text-[#0F172A] font-bold shadow-xl">
                  CLOE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 lg:px-8 bg-slate-50 fade-in-section">
        <div className="max-w-[1100px] mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6 tracking-tight">
            Ready to automate your close?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Join forward-thinking finance teams using CLOE to close faster and report with confidence
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                const modal = document.getElementById('contact-modal');
                if (modal) modal.classList.remove('hidden');
              }}
              className="px-10 py-5 bg-[#0F172A] text-white rounded-xl font-semibold text-lg hover:bg-[#1e293b] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Request demo
            </button>
            <Link
              href="/product"
              className="px-10 py-5 bg-white text-[#0F172A] rounded-xl font-semibold text-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              View product
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 lg:px-8 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#7B61FF] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold text-[#0F172A]">CLOE</span>
            </div>
            <div className="flex items-center gap-8 text-sm font-medium text-gray-600">
              <Link href="/product" className="hover:text-[#0F172A] transition-colors">
                Product
              </Link>
              <Link href="/about" className="hover:text-[#0F172A] transition-colors">
                About
              </Link>
              <button
                onClick={() => {
                  const modal = document.getElementById('contact-modal');
                  if (modal) modal.classList.remove('hidden');
                }}
                className="hover:text-[#0F172A] transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-100">
            © 2025 CLOE. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx>{`
        .fade-in-section {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .fade-in-section.fade-in {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.6;
          }
          33% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
          }
          66% {
            transform: translateY(-10px) translateX(-10px);
            opacity: 0.4;
          }
          100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.6;
          }
        }

        @keyframes dash {
          0% {
            stroke-dashoffset: 1000;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-dash {
          stroke-dasharray: 1000;
          animation: dash 20s linear infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-1500 {
          animation-delay: 1.5s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-2500 {
          animation-delay: 2.5s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

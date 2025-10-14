'use client';

import { useEffect, useState } from 'react';
import PreAuthNav from '@/components/PreAuthNav';
import Link from 'next/link';
import {
  Target,
  Eye,
  Users,
  Lightbulb,
  Rocket,
  Heart,
  Globe,
  ArrowRight,
  Award,
  TrendingUp,
  Shield,
  Zap,
  Brain,
  Code,
  TestTube,
  Handshake,
  Sparkles,
  BarChart3,
  FileCheck,
  Clock
} from 'lucide-react';

export default function AboutPage() {
  const [activePhase, setActivePhase] = useState(0);

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

  const roadmapPhases = [
    {
      icon: Brain,
      emoji: '💡',
      phase: 'Ideation & Research',
      timeline: 'Mar–Aug 2025',
      milestone: 'Concept & Validation',
      description: '6 months of experiments with AI finance agents (Revenue, Bad Debt, Close).',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Code,
      emoji: '💻',
      phase: 'Development Kick-off',
      timeline: 'Sep 2025',
      milestone: 'Core Platform Build',
      description: 'CLOE core architecture built using Supabase + Node.js + Vercel.',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: TestTube,
      emoji: '🧪',
      phase: 'Testing & Refinement',
      timeline: 'Oct 2025',
      milestone: 'Internal Alpha',
      description: 'Finance close and consolidation engine tested with real-world data.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Globe,
      emoji: '🌍',
      phase: 'Go-Live & Customer Rollout',
      timeline: 'Dec 2025',
      milestone: 'Global Launch',
      description: 'First customers in the US, Europe, and India onboarded.',
      color: 'from-cyan-500 to-teal-500'
    },
    {
      icon: Handshake,
      emoji: '🤝',
      phase: 'Partner Network Expansion',
      timeline: 'Q1 2026',
      milestone: 'Integration & Advisory Program',
      description: 'Integration with ERP systems (SAP, NetSuite, Tally) and CA/CPA partner ecosystem.',
      color: 'from-teal-500 to-green-500'
    },
    {
      icon: Sparkles,
      emoji: '🧩',
      phase: 'AI-Native Modules',
      timeline: 'Q2 2026',
      milestone: 'Agentic Finance Close',
      description: 'AI-driven reconciliation, journal suggestion, and policy reasoning engine.',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const advisoryTeam = [
    {
      title: 'Chartered Accountants (CAs)',
      icon: FileCheck,
      description: 'Deep expertise in Indian accounting standards and global practices'
    },
    {
      title: 'Certified Public Accountants (CPAs)',
      icon: Shield,
      description: 'US GAAP compliance and international reporting standards'
    },
    {
      title: 'ACCA Professionals',
      icon: Globe,
      description: 'Global perspective on financial reporting and governance'
    },
    {
      title: 'MBA Graduates',
      icon: BarChart3,
      description: 'Strategic business insights from leading institutions'
    },
    {
      title: 'Database Engineers',
      icon: Code,
      description: 'Technical architecture and performance optimization'
    },
    {
      title: 'AI Experts',
      icon: Brain,
      description: 'Machine learning and intelligent automation'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <PreAuthNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-purple-300 via-blue-300 to-indigo-300 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-violet-300 via-purple-300 to-pink-300 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-300 via-cyan-300 to-teal-300 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-[1280px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-purple-200 mb-8 shadow-lg">
            <Rocket size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-[#101828] tracking-wide">Our Story</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-[#101828] mb-6 tracking-tight">
            The AI-Native
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
              Operating System for Finance
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#475569] max-w-4xl mx-auto font-medium leading-relaxed">
            Transforming financial consolidation and close from a <span className="text-[#101828] font-semibold">manual, spreadsheet-driven process</span> into an{' '}
            <span className="text-[#101828] font-semibold">intelligent, automated, and audit-ready workflow</span> powered by AI.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 lg:px-8 fade-in-section bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-10 shadow-2xl shadow-purple-500/30 transform hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-3xl"></div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-xl">
                    <Target className="text-white" size={40} />
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-6">🧭 Mission</h3>
                  <p className="text-xl text-white/90 leading-relaxed font-medium">
                    To <span className="font-bold">simplify and accelerate financial close and consolidation</span> for global finance teams — turning manual, spreadsheet-driven processes into intelligent, automated, and audit-ready workflows powered by AI.
                  </p>
                  <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <p className="text-lg text-white/80 italic">
                      "CLOE exists to let finance professionals focus on <span className="font-bold text-white">analysis and decision-making</span>, not reconciliations and roll-forwards."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-200 mb-6">
                <Sparkles size={16} className="text-purple-600" />
                <span className="text-sm font-semibold text-purple-900 tracking-wide">Why We Exist</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-6 tracking-tight">
                Empowering Finance Teams to Work Smarter
              </h2>
              <p className="text-lg text-[#475569] mb-6 leading-relaxed">
                Finance teams are drowning in manual work — endless spreadsheets, fragmented data, and time-consuming reconciliations. CLOE was built to change that.
              </p>
              <p className="text-lg text-[#475569] mb-8 leading-relaxed">
                We enable teams to <span className="font-semibold text-[#101828]">close books faster</span>, <span className="font-semibold text-[#101828]">stay compliant across GAAPs</span>, and <span className="font-semibold text-[#101828]">generate audit-ready reports in minutes</span> — not days.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/20 transition-all transform hover:-translate-y-1">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">10x</div>
                  <div className="text-sm text-[#475569] font-semibold">Faster Close Cycles</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/20 transition-all transform hover:-translate-y-1">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Real-Time</div>
                  <div className="text-sm text-[#475569] font-semibold">Financial Visibility</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 fade-in-section relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="text-white">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-xl">
                <Eye className="text-white" size={36} />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">🌍 Vision</h2>
              <blockquote className="text-2xl md:text-3xl font-bold leading-relaxed text-white mb-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border-l-4 border-white">
                "To become the <span className="text-yellow-300">AI-native operating system for Finance</span> — empowering every organization to close faster, stay compliant, and generate audit-ready reports in minutes."
              </blockquote>
              <p className="text-xl text-white/90 font-medium leading-relaxed mb-6">
                CLOE envisions a world where <span className="font-bold text-white">financial data flows seamlessly</span> across entities, currencies, and tools — enabling <span className="font-bold text-white">real-time visibility, smarter forecasting, and truly autonomous finance</span>.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  ⚡ Real-Time Visibility
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  🤖 Autonomous Finance
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  🌐 Seamless Data Flow
                </div>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">Future of Finance</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="text-yellow-300" size={24} />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg mb-1">
                        Instant Consolidation
                      </div>
                      <div className="text-white/70 text-sm">Multi-entity reporting across currencies and GAAPs in real-time</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="text-green-300" size={24} />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg mb-1">
                        Compliance Automation
                      </div>
                      <div className="text-white/70 text-sm">IFRS, US GAAP, and SOX-compliant workflows out of the box</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Brain className="text-pink-300" size={24} />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg mb-1">AI-Powered Insights</div>
                      <div className="text-white/70 text-sm">Predictive forecasting and intelligent anomaly detection</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Started Section */}
      <section className="py-20 px-6 lg:px-8 fade-in-section bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 mb-6">
              <Lightbulb size={18} className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-900 tracking-wide">Origin Story</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-6 tracking-tight">🚀 How & Why We Started</h2>
            <p className="text-xl text-[#475569] max-w-3xl mx-auto leading-relaxed">
              CLOE was born out of real-world finance challenges
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-3xl p-10 border-2 border-purple-100 shadow-xl">
              <div className="space-y-6 text-lg text-[#475569] leading-relaxed">
                <p className="text-xl font-medium text-[#101828]">
                  In early <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">2025</span>, after building domain-specific agents for <span className="font-semibold text-purple-600">revenue recognition</span> and <span className="font-semibold text-blue-600">bad debt automation</span>, we realized something critical:
                </p>
                <p className="text-lg pl-6 border-l-4 border-purple-400 italic">
                  The <span className="font-bold text-[#101828]">finance close and consolidation</span> process — arguably the most critical month-end ritual — remained <span className="font-bold text-red-600">painfully manual, fragmented, and error-prone</span>.
                </p>
                <p>
                  What started as experiments with AI-driven agents to automate close checklists, reconciliations, and intercompany eliminations soon evolved into a <span className="font-bold text-[#101828]">full-fledged consolidation engine</span>.
                </p>
                <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
                  <p className="font-medium text-[#101828] mb-2">🎯 The Turning Point</p>
                  <p>
                    After <span className="font-bold text-purple-600">six months of intensive brainstorming, prototyping, and finance workflow experiments</span> (March–August 2025), the vision was clear:
                  </p>
                </div>
                <blockquote className="text-2xl font-bold text-center py-6 px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-xl">
                  "Build an AI-driven platform that blends the rigor of accounting with the speed and intelligence of modern automation."
                </blockquote>
                <p>
                  Development officially began in <span className="font-bold text-[#101828]">September 2025</span>, leveraging <span className="font-semibold text-purple-600">Vercel</span>, <span className="font-semibold text-blue-600">Supabase</span>, and <span className="font-semibold text-indigo-600">Claude Code</span> — combining scalable cloud architecture with intelligent accounting logic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section - Horizontal Timeline */}
      <section className="py-20 px-6 lg:px-8 fade-in-section bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-300 to-cyan-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-6 tracking-tight">🛣️ Roadmap</h2>
            <p className="text-xl text-[#475569] max-w-2xl mx-auto font-medium">
              From concept to AI-native finance automation
            </p>
          </div>

          {/* Horizontal Scrollable Timeline */}
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 via-cyan-500 via-teal-500 via-green-500 to-emerald-500 hidden lg:block"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {roadmapPhases.map((phase, index) => (
                <div
                  key={index}
                  className="relative group"
                  onMouseEnter={() => setActivePhase(index)}
                >
                  {/* Connector Dot */}
                  <div className={`hidden lg:block absolute top-[76px] left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-4 border-white shadow-xl bg-gradient-to-br ${phase.color} z-10 group-hover:scale-150 transition-transform duration-300`}></div>

                  {/* Card */}
                  <div className={`relative bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                    activePhase === index ? 'ring-4 ring-purple-300 shadow-2xl' : ''
                  }`}>
                    {/* Emoji Icon */}
                    <div className="text-6xl mb-4 text-center">{phase.emoji}</div>

                    {/* Timeline Badge */}
                    <div className={`inline-block px-4 py-2 bg-gradient-to-r ${phase.color} text-white rounded-full text-sm font-bold mb-4`}>
                      {phase.timeline}
                    </div>

                    {/* Phase Title */}
                    <h3 className="text-2xl font-bold text-[#101828] mb-2">{phase.phase}</h3>

                    {/* Milestone */}
                    <div className="text-sm font-semibold text-purple-600 mb-3 uppercase tracking-wide">
                      {phase.milestone}
                    </div>

                    {/* Description */}
                    <p className="text-[#475569] leading-relaxed">{phase.description}</p>

                    {/* Hover Effect Border */}
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${phase.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 lg:px-8 fade-in-section bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-6 tracking-tight">👥 About the Team</h2>
            <p className="text-xl text-[#475569] max-w-3xl mx-auto font-medium">
              A unique blend of finance depth, technical expertise, and AI innovation
            </p>
          </div>

          {/* Founder Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-10 text-white shadow-2xl shadow-purple-500/30 transform hover:scale-105 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/30">
                  PM
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-1">Pranav MV</h3>
                  <p className="text-lg text-white/90 font-medium">Founder & Architect</p>
                </div>
              </div>
              <div className="space-y-4 text-lg text-white/90 leading-relaxed">
                <p>
                  <span className="font-bold text-white">Chartered Accountant</span> and Finance Professional with <span className="font-bold text-yellow-300">6+ years of post-qualification experience</span> across:
                </p>
                <div className="flex flex-wrap gap-3 my-4">
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">Deloitte</div>
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">EY</div>
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">Udaan</div>
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">Backbase (Global Head of Revenue & Reporting)</div>
                </div>
                <p className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  Having worked on <span className="font-bold text-white">global consolidation, IFRS reporting, and automation initiatives</span>, Pranav brings a unique blend of finance depth and tech curiosity that forms CLOE's DNA.
                </p>
              </div>
            </div>
          </div>

          {/* Development & Advisory */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Development */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 border-2 border-blue-100 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <Code className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[#101828]">Development</h3>
              </div>
              <p className="text-lg text-[#475569] leading-relaxed">
                All core development is <span className="font-bold text-[#101828]">built in-house using AI tools</span> — from backend architecture to frontend deployment — enabling rapid iteration and experimentation.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Vercel</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Supabase</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Claude Code</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">Next.js</span>
              </div>
            </div>

            {/* Advisory */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 border-2 border-purple-100 hover:shadow-xl hover:shadow-purple-500/10 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <Users className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[#101828]">Advisory Team</h3>
              </div>
              <p className="text-lg text-[#475569] leading-relaxed mb-4">
                CLOE is guided by an experienced advisory panel ensuring we remain <span className="font-bold text-[#101828]">technically robust, financially accurate, and globally compliant</span>.
              </p>
            </div>
          </div>

          {/* Advisory Team Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advisoryTeam.map((member, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <member.icon className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#101828] mb-2">{member.title}</h4>
                    <p className="text-sm text-[#475569] leading-relaxed">{member.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 lg:px-8 fade-in-section">
        <div className="max-w-[1280px] mx-auto">
          <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-16 overflow-hidden shadow-2xl shadow-purple-500/30">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
            </div>

            <div className="relative text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Join Us in Building the<br />Future of Finance
              </h2>
              <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
                Experience the power of AI-native finance automation. Let's transform your financial
                operations together.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    const modal = document.getElementById('contact-modal');
                    if (modal) modal.classList.remove('hidden');
                  }}
                  className="px-10 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  Get Demo
                  <ArrowRight size={20} />
                </button>
                <Link
                  href="/product"
                  className="px-10 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-lg border-2 border-white hover:bg-white hover:text-purple-600 transition-all duration-300 hover:scale-105"
                >
                  Explore Features
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-12 px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold">CLOE</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-gray-400">
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
          <div className="text-center text-gray-500 text-sm border-t border-gray-800 pt-8">
            © 2025 CLOE — Automating the Close.
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

        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -30px) scale(1.15);
          }
          50% {
            transform: translate(-30px, 30px) scale(0.85);
          }
          75% {
            transform: translate(30px, 30px) scale(1.1);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-blob {
          animation: blob 10s infinite ease-in-out;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
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
          background: linear-gradient(to bottom, #7c3aed, #3b82f6);
          border-radius: 6px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #6d28d9, #2563eb);
        }
      `}</style>
    </div>
  );
}

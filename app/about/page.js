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
        {/* Subtle Animated Background */}
        <div className="absolute inset-0 opacity-[0.15]">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-slate-300 via-gray-200 to-slate-300 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-gray-200 via-slate-300 to-gray-300 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-[1280px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-8 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#101828]"></div>
            <span className="text-sm font-medium text-[#475569] tracking-wide">Our Story</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-[#101828] mb-6 tracking-tight leading-tight">
            The AI-Native
            <br />
            <span className="text-[#101828]">
              Operating System for Finance
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#475569] max-w-4xl mx-auto leading-relaxed">
            Transforming financial consolidation and close from a manual, spreadsheet-driven process into an intelligent, automated, and audit-ready workflow powered by AI.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 lg:px-8 fade-in-section bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Visual */}
            <div className="relative">
              <div className="relative bg-[#101828] rounded-2xl p-12 shadow-lg">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg mb-6">
                    <Target className="text-white" size={24} />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Mission</h3>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    To simplify and accelerate financial close and consolidation for global finance teams — turning manual, spreadsheet-driven processes into intelligent, automated, and audit-ready workflows powered by AI.
                  </p>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <p className="text-base text-gray-400 italic">
                    "CLOE exists to let finance professionals focus on analysis and decision-making, not reconciliations and roll-forwards."
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 mb-6">
                <span className="text-xs font-medium text-[#475569] tracking-wide uppercase">Why We Exist</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-6 tracking-tight">
                Empowering Finance Teams to Work Smarter
              </h2>
              <p className="text-lg text-[#475569] mb-6 leading-relaxed">
                Finance teams are drowning in manual work — endless spreadsheets, fragmented data, and time-consuming reconciliations. CLOE was built to change that.
              </p>
              <p className="text-lg text-[#475569] mb-8 leading-relaxed">
                We enable teams to close books faster, stay compliant across GAAPs, and generate audit-ready reports in minutes — not days.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
                  <div className="text-4xl font-bold text-[#101828] mb-2">10x</div>
                  <div className="text-sm text-[#475569] font-medium">Faster Close Cycles</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
                  <div className="text-4xl font-bold text-[#101828] mb-2">Real-Time</div>
                  <div className="text-sm text-[#475569] font-medium">Financial Visibility</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-6 lg:px-8 bg-gray-50 fade-in-section">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#101828] rounded-lg mb-6">
                <Eye className="text-white" size={24} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-6 tracking-tight">Vision</h2>
              <blockquote className="text-2xl font-bold leading-relaxed text-[#101828] mb-6 pl-6 border-l-4 border-[#101828]">
                "To become the AI-native operating system for Finance — empowering every organization to close faster, stay compliant, and generate audit-ready reports in minutes."
              </blockquote>
              <p className="text-lg text-[#475569] leading-relaxed mb-6">
                CLOE envisions a world where financial data flows seamlessly across entities, currencies, and tools — enabling real-time visibility, smarter forecasting, and truly autonomous finance.
              </p>
            </div>

            {/* Right: Visual */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="text-[#101828]" size={20} />
                </div>
                <div>
                  <div className="text-[#101828] font-semibold text-lg mb-1">
                    Instant Consolidation
                  </div>
                  <div className="text-[#475569] text-sm">Multi-entity reporting across currencies and GAAPs in real-time</div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="text-[#101828]" size={20} />
                </div>
                <div>
                  <div className="text-[#101828] font-semibold text-lg mb-1">
                    Compliance Automation
                  </div>
                  <div className="text-[#475569] text-sm">IFRS, US GAAP, and SOX-compliant workflows out of the box</div>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="text-[#101828]" size={20} />
                </div>
                <div>
                  <div className="text-[#101828] font-semibold text-lg mb-1">AI-Powered Insights</div>
                  <div className="text-[#475569] text-sm">Predictive forecasting and intelligent anomaly detection</div>
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 mb-6">
              <span className="text-xs font-medium text-[#475569] tracking-wide uppercase">Origin Story</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-6 tracking-tight">How & Why We Started</h2>
            <p className="text-xl text-[#475569] max-w-3xl mx-auto leading-relaxed">
              CLOE was born out of real-world finance challenges
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-10 border border-gray-200">
              <div className="space-y-6 text-lg text-[#475569] leading-relaxed">
                <p className="text-xl font-medium text-[#101828]">
                  In early 2025, after building domain-specific agents for revenue recognition and bad debt automation, we realized something critical:
                </p>
                <p className="text-lg pl-6 border-l-4 border-[#101828] italic">
                  The finance close and consolidation process — arguably the most critical month-end ritual — remained painfully manual, fragmented, and error-prone.
                </p>
                <p>
                  What started as experiments with AI-driven agents to automate close checklists, reconciliations, and intercompany eliminations soon evolved into a full-fledged consolidation engine.
                </p>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <p className="font-semibold text-[#101828] mb-2">The Turning Point</p>
                  <p>
                    After six months of intensive brainstorming, prototyping, and finance workflow experiments (March–August 2025), the vision was clear:
                  </p>
                </div>
                <blockquote className="text-xl font-semibold text-center py-6 px-8 bg-[#101828] text-white rounded-xl">
                  "Build an AI-driven platform that blends the rigor of accounting with the speed and intelligence of modern automation."
                </blockquote>
                <p>
                  Development officially began in September 2025, leveraging Vercel, Supabase, and Claude Code — combining scalable cloud architecture with intelligent accounting logic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section - Flow Chain */}
      <section className="py-20 px-6 lg:px-8 fade-in-section bg-gray-50">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-6 tracking-tight">Roadmap</h2>
            <p className="text-xl text-[#475569] max-w-2xl mx-auto">
              From concept to AI-native finance automation
            </p>
          </div>

          {/* Flow Chain */}
          <div className="relative max-w-6xl mx-auto">
            <div className="space-y-0">
              {roadmapPhases.map((phase, index) => (
                <div key={index} className="relative">
                  {/* Connecting Line */}
                  {index < roadmapPhases.length - 1 && (
                    <div className="hidden lg:block absolute left-8 top-20 bottom-0 w-0.5 bg-gray-300 z-0"></div>
                  )}

                  {/* Phase Card */}
                  <div className="relative flex items-start gap-6 group">
                    {/* Circle Indicator */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-[#101828] border-4 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <phase.icon className="text-white" size={24} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-12">
                      <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all">
                        {/* Timeline Badge */}
                        <div className="inline-block px-3 py-1 bg-gray-100 text-[#101828] rounded-full text-xs font-semibold mb-4 uppercase tracking-wide">
                          {phase.timeline}
                        </div>

                        {/* Phase Title & Milestone */}
                        <h3 className="text-2xl font-bold text-[#101828] mb-2">{phase.phase}</h3>
                        <div className="text-sm font-medium text-[#475569] mb-4">
                          {phase.milestone}
                        </div>

                        {/* Description */}
                        <p className="text-[#475569] leading-relaxed">{phase.description}</p>
                      </div>
                    </div>
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
            <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-6 tracking-tight">About the Team</h2>
            <p className="text-xl text-[#475569] max-w-3xl mx-auto">
              A unique blend of finance depth, technical expertise, and AI innovation
            </p>
          </div>

          {/* Founder Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-[#101828] rounded-2xl p-10 text-white shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center text-2xl font-bold">
                  PM
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-1">Pranav MV</h3>
                  <p className="text-lg text-gray-300">Founder & Architect</p>
                </div>
              </div>
              <div className="space-y-4 text-base text-gray-300 leading-relaxed">
                <p>
                  <span className="font-semibold text-white">Chartered Accountant</span> and Finance Professional with <span className="font-semibold text-white">6+ years of post-qualification experience</span> across:
                </p>
                <div className="flex flex-wrap gap-2 my-4">
                  <div className="px-3 py-1.5 bg-white/10 rounded-full text-sm">Deloitte</div>
                  <div className="px-3 py-1.5 bg-white/10 rounded-full text-sm">EY</div>
                  <div className="px-3 py-1.5 bg-white/10 rounded-full text-sm">Udaan</div>
                  <div className="px-3 py-1.5 bg-white/10 rounded-full text-sm">Backbase (Global Head of Revenue & Reporting)</div>
                </div>
                <p className="pt-4 border-t border-white/10">
                  Having worked on global consolidation, IFRS reporting, and automation initiatives, Pranav brings a unique blend of finance depth and tech curiosity that forms CLOE's DNA.
                </p>
              </div>
            </div>
          </div>

          {/* Development & Advisory */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Development */}
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#101828] rounded-lg flex items-center justify-center">
                  <Code className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-[#101828]">Development</h3>
              </div>
              <p className="text-base text-[#475569] leading-relaxed mb-4">
                All core development is built in-house using AI tools — from backend architecture to frontend deployment — enabling rapid iteration and experimentation.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-[#475569]">Vercel</span>
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-[#475569]">Supabase</span>
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-[#475569]">Claude Code</span>
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-[#475569]">Next.js</span>
              </div>
            </div>

            {/* Advisory */}
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#101828] rounded-lg flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-[#101828]">Advisory Team</h3>
              </div>
              <p className="text-base text-[#475569] leading-relaxed">
                CLOE is guided by an experienced advisory panel ensuring we remain technically robust, financially accurate, and globally compliant.
              </p>
            </div>
          </div>

          {/* Advisory Team Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advisoryTeam.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <member.icon className="text-[#101828]" size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#101828] mb-1 text-sm">{member.title}</h4>
                    <p className="text-xs text-[#475569] leading-relaxed">{member.description}</p>
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
          <div className="bg-[#101828] rounded-2xl p-16 shadow-lg">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Join Us in Building the Future of Finance
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Experience the power of AI-native finance automation. Let's transform your financial operations together.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    const modal = document.getElementById('contact-modal');
                    if (modal) modal.classList.remove('hidden');
                  }}
                  className="px-8 py-3 bg-white text-[#101828] rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
                >
                  Get Demo
                  <ArrowRight size={18} />
                </button>
                <Link
                  href="/product"
                  className="px-8 py-3 bg-transparent text-white rounded-lg font-semibold border border-white/20 hover:bg-white/10 transition-all"
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

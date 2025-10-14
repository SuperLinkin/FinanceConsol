'use client';

import { useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';

export default function ProductPage() {
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

  const closeFeatures = [
    {
      icon: CheckSquare,
      title: 'Smart Close with Automated Task Tracking',
      description: 'AI-driven task assignments and progress monitoring'
    },
    {
      icon: Calendar,
      title: 'Dynamic Close Calendar & Approvals',
      description: 'Customizable workflows with multi-level approvals'
    },
    {
      icon: Layers,
      title: 'Multi-Entity & Multi-Period Support',
      description: 'Handle complex organizational structures seamlessly'
    },
    {
      icon: Search,
      title: 'AI-driven Reconciliations',
      description: 'Intelligent matching and variance detection'
    },
    {
      icon: TrendingUp,
      title: 'Variance & Exception Analysis',
      description: 'Automated anomaly detection with drill-down capabilities'
    },
    {
      icon: Zap,
      title: 'Workflow Automation & Alerts',
      description: 'Real-time notifications and smart escalations'
    }
  ];

  const reportingFeatures = [
    {
      icon: Globe,
      title: 'Multi-Entity, Multi-GAAP, Multi-Currency',
      description: 'Global consolidation with automatic currency conversion'
    },
    {
      icon: Layers,
      title: 'Automated Consolidation Engine',
      description: 'Real-time inter-company eliminations and adjustments'
    },
    {
      icon: FileText,
      title: 'Dynamic Note & Disclosure Builder',
      description: 'AI-assisted financial statement notes generation'
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Financial Reports',
      description: 'Balance Sheet, P&L, Cash Flow, and custom reports'
    },
    {
      icon: Shield,
      title: 'Audit & Compliance Ready',
      description: 'SOX, IFRS, US GAAP compliant with full audit trail'
    },
    {
      icon: FileCheck,
      title: 'Interactive Report Builder',
      description: 'Drag-and-drop report designer with real-time preview'
    }
  ];

  const addOns = [
    {
      name: 'Revenue Analysis',
      icon: BarChart3,
      description: 'Deep dive into revenue streams with AI-powered insights'
    },
    {
      name: 'Accounting Bot',
      icon: Sparkles,
      description: 'AI assistant for accounting queries and automation'
    },
    {
      name: 'Cash Flow Intelligence',
      icon: TrendingUp,
      description: 'Predictive cash flow forecasting and optimization'
    },
    {
      name: 'Expense Analytics',
      icon: FileCheck,
      description: 'Smart expense categorization and anomaly detection'
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
            <span className="text-sm font-medium text-[#475569] tracking-wide">Product Overview</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-[#101828] mb-6 tracking-tight leading-tight">
            Two Core Solutions.
            <br />
            <span className="text-[#101828]">
              One Unified Platform.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#475569] max-w-4xl mx-auto leading-relaxed">
            CLOE simplifies finance operations by combining automation, intelligence, and compliance — built for enterprises of any size.
          </p>
        </div>
      </section>

      {/* Solution 1: Financial Close */}
      <section className="py-20 px-6 lg:px-8 fade-in-section bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 mb-6">
                <span className="text-xs font-medium text-[#475569] tracking-wide uppercase">Solution 1</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-6 tracking-tight">
                Financial Close
              </h2>
              <p className="text-xl text-[#475569] mb-8 leading-relaxed">
                Transform your month-end and year-end close with intelligent automation, real-time collaboration, and comprehensive audit trails.
              </p>

              <div className="space-y-3">
                {closeFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 bg-[#101828] rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#101828] mb-1">{feature.title}</h3>
                      <p className="text-sm text-[#475569]">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="bg-[#101828] rounded-2xl p-8 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-white mb-6">
                    <span className="text-lg font-semibold">Close Calendar</span>
                    <Calendar size={24} />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">Trial Balance Review</span>
                        <span className="text-green-400 text-xs font-medium">Complete</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full w-full"></div>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">Reconciliations</span>
                        <span className="text-yellow-400 text-xs font-medium">In Progress</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">Journal Entries</span>
                        <span className="text-blue-400 text-xs font-medium">Pending</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-blue-400 h-2 rounded-full w-1/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution 2: Financial Reporting */}
      <section className="py-20 px-6 lg:px-8 fade-in-section bg-gray-50">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Visual */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-[#101828] rounded-2xl p-8 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-white mb-6">
                    <span className="text-lg font-semibold">Consolidated Reports</span>
                    <BarChart3 size={24} />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-white font-medium text-sm">Balance Sheet</span>
                      <FileText className="text-white" size={18} />
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-white font-medium text-sm">Income Statement</span>
                      <FileText className="text-white" size={18} />
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-white font-medium text-sm">Cash Flow Statement</span>
                      <FileText className="text-white" size={18} />
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-white font-medium text-sm">Notes & Disclosures</span>
                      <FileCheck className="text-white" size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 mb-6">
                <span className="text-xs font-medium text-[#475569] tracking-wide uppercase">Solution 2</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-6 tracking-tight">
                Financial Reporting
              </h2>
              <p className="text-xl text-[#475569] mb-8 leading-relaxed">
                Generate comprehensive, audit-ready financial statements with real-time consolidation and multi-dimensional reporting capabilities.
              </p>

              <div className="space-y-3">
                {reportingFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 bg-[#101828] rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#101828] mb-1">{feature.title}</h3>
                      <p className="text-sm text-[#475569]">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tailored Add-Ons Section */}
      <section className="py-20 px-6 lg:px-8 bg-white fade-in-section">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#101828] mb-6 tracking-tight">
            Tailored Add-Ons
          </h2>
          <p className="text-xl text-[#475569] mb-12 max-w-2xl mx-auto leading-relaxed">
            Extend CLOE with powerful AI-driven solutions designed to solve every accounting and finance team need.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {addOns.map((addon, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 mx-auto bg-[#101828] rounded-lg flex items-center justify-center mb-4">
                  <addon.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#101828] mb-2">{addon.name}</h3>
                <p className="text-sm text-[#475569]">{addon.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#101828] text-white rounded-lg font-semibold hover:bg-[#1e293b] transition-all"
            >
              <Play size={18} />
              Explore All Add-Ons
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 fade-in-section">
        <div className="max-w-[1280px] mx-auto">
          <div className="bg-[#101828] rounded-2xl p-16 shadow-lg">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Experience the Future of Finance Automation
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                See how CLOE can transform your financial close and reporting processes with intelligent automation and real-time insights.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    const modal = document.getElementById('contact-modal');
                    if (modal) modal.classList.remove('hidden');
                  }}
                  className="px-8 py-3 bg-white text-[#101828] rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
                >
                  Request Demo
                  <ArrowRight size={18} />
                </button>
                <Link
                  href="/about"
                  className="px-8 py-3 bg-transparent text-white rounded-lg font-semibold border border-white/20 hover:bg-white/10 transition-all"
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
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#101828] rounded-xl flex items-center justify-center shadow-lg">
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

        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-blob {
          animation: blob 10s infinite ease-in-out;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
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

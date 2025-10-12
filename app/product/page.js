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
  Play
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
      color: 'from-blue-500 to-cyan-500',
      icon: '📊',
      description: 'Deep dive into revenue streams with AI-powered insights'
    },
    {
      name: 'Accounting Bot',
      color: 'from-purple-500 to-pink-500',
      icon: '🤖',
      description: 'AI assistant for accounting queries and automation'
    },
    {
      name: 'Cash Flow Intelligence',
      color: 'from-green-500 to-emerald-500',
      icon: '💰',
      description: 'Predictive cash flow forecasting and optimization'
    },
    {
      name: 'Expense Analytics',
      color: 'from-orange-500 to-red-500',
      icon: '📈',
      description: 'Smart expense categorization and anomaly detection'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      <PreAuthNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-100 to-blue-100 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-violet-100 to-purple-100 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="relative max-w-[1280px] mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6 tracking-tight">
            Two Core Modules.
            <br />
            <span className="bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] bg-clip-text text-transparent">
              One Unified Platform.
            </span>
          </h1>
          <p className="text-xl text-[#475569] max-w-3xl mx-auto font-medium">
            CLOE simplifies finance operations by combining automation, intelligence, and compliance
            — built for enterprises of any size.
          </p>
        </div>
      </section>

      {/* Module 1: Financial Close */}
      <section className="py-20 px-6 lg:px-8 fade-in-section bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-[#7B61FF] rounded-full animate-pulse"></span>
                <span className="text-purple-900">Module 1</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6 tracking-tight">
                Financial Close
              </h2>
              <p className="text-xl text-[#475569] mb-8 font-medium">
                Transform your month-end and year-end close with intelligent automation, real-time
                collaboration, and comprehensive audit trails.
              </p>

              <div className="space-y-4">
                {closeFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-purple-50/50 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                      <feature.icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0F172A] mb-1">{feature.title}</h3>
                      <p className="text-[#475569]">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-3xl p-8 shadow-2xl shadow-purple-500/20">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-lg font-semibold">Close Calendar</span>
                      <Calendar size={24} />
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Trial Balance Review</span>
                          <span className="text-green-300 text-sm">✓ Complete</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div className="bg-green-400 h-2 rounded-full w-full"></div>
                        </div>
                      </div>
                      <div className="bg-white/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Reconciliations</span>
                          <span className="text-yellow-300 text-sm">In Progress</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div className="bg-yellow-400 h-2 rounded-full w-3/4"></div>
                        </div>
                      </div>
                      <div className="bg-white/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Journal Entries</span>
                          <span className="text-blue-300 text-sm">Pending</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div className="bg-blue-400 h-2 rounded-full w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-pink-400 rounded-full blur-3xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 2: Financial Reporting */}
      <section className="py-20 px-6 lg:px-8 fade-in-section bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Visual */}
            <div className="relative order-2 lg:order-1">
              <div className="relative bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-3xl p-8 shadow-2xl shadow-purple-500/20">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-lg font-semibold">Consolidated Reports</span>
                      <BarChart3 size={24} />
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white/20 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-white font-medium">Balance Sheet</span>
                        <FileText className="text-white" size={20} />
                      </div>
                      <div className="bg-white/20 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-white font-medium">Income Statement</span>
                        <FileText className="text-white" size={20} />
                      </div>
                      <div className="bg-white/20 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-white font-medium">Cash Flow Statement</span>
                        <FileText className="text-white" size={20} />
                      </div>
                      <div className="bg-white/20 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-white font-medium">Notes & Disclosures</span>
                        <FileCheck className="text-white" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-cyan-400 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-400 rounded-full blur-3xl opacity-50"></div>
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-[#7B61FF] rounded-full animate-pulse"></span>
                <span className="text-purple-900">Module 2</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6 tracking-tight">
                Financial Reporting
              </h2>
              <p className="text-xl text-[#475569] mb-8 font-medium">
                Generate comprehensive, audit-ready financial statements with real-time consolidation
                and multi-dimensional reporting capabilities.
              </p>

              <div className="space-y-4">
                {reportingFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/70 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                      <feature.icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0F172A] mb-1">{feature.title}</h3>
                      <p className="text-[#475569]">{feature.description}</p>
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
          <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 tracking-tight">
            Tailored Add-Ons
          </h2>
          <p className="text-xl text-[#475569] mb-12 max-w-2xl mx-auto font-medium">
            Extend CLOE with powerful AI-driven modules designed to solve every accounting and finance team need.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {addOns.map((addon, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border-2 border-gray-100 hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group-hover:-translate-y-2">
                  <div
                    className={`w-20 h-20 mx-auto bg-gradient-to-br ${addon.color} rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className="text-4xl">{addon.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{addon.name}</h3>
                  <p className="text-[#475569] font-medium">{addon.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300"
            >
              <Play size={20} />
              Explore All Add-Ons
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 fade-in-section">
        <div className="max-w-[1280px] mx-auto">
          <div className="relative bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] rounded-3xl p-16 overflow-hidden shadow-2xl shadow-purple-500/20">
            {/* Subtle Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Experience the Future of Finance Automation
              </h2>
              <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto font-medium">
                See how CLOE can transform your financial close and reporting processes with
                intelligent automation and real-time insights.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    const modal = document.getElementById('contact-modal');
                    if (modal) modal.classList.remove('hidden');
                  }}
                  className="px-10 py-4 bg-white text-[#7B61FF] rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Request Demo
                </button>
                <Link
                  href="/about"
                  className="px-10 py-4 bg-transparent text-white rounded-xl font-semibold border-2 border-white hover:bg-white hover:text-[#7B61FF] transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  Learn About Us
                  <ArrowRight size={20} />
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
            transform: translateY(20px);
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
            transform: translate(20px, -20px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 20px) scale(1.05);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

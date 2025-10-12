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

  const erpLogos = [
    { name: 'Tally', color: 'from-red-500 to-orange-500' },
    { name: 'SAP', color: 'from-blue-500 to-cyan-500' },
    { name: 'NetSuite', color: 'from-green-500 to-emerald-500' },
    { name: 'QuickBooks', color: 'from-yellow-500 to-amber-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <PreAuthNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Two Core Modules.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              One Unified Platform.
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            CLOE simplifies finance operations by combining automation, intelligence, and compliance
            — built for enterprises of any size.
          </p>
        </div>
      </section>

      {/* Module 1: Financial Close */}
      <section className="py-20 px-6 lg:px-8 fade-in-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                Module 1
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Financial Close
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Transform your month-end and year-end close with intelligent automation, real-time
                collaboration, and comprehensive audit trails.
              </p>

              <div className="space-y-4">
                {closeFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/70 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <feature.icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{feature.title}</h3>
                      <p className="text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
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
      <section className="py-20 px-6 lg:px-8 fade-in-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Visual */}
            <div className="relative order-2 lg:order-1">
              <div className="relative bg-gradient-to-br from-emerald-600 via-cyan-600 to-blue-600 rounded-3xl p-8 shadow-2xl">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse"></span>
                Module 2
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Financial Reporting
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Generate comprehensive, audit-ready financial statements with real-time consolidation
                and multi-dimensional reporting capabilities.
              </p>

              <div className="space-y-4">
                {reportingFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/70 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <feature.icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{feature.title}</h3>
                      <p className="text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 px-6 lg:px-8 bg-white fade-in-section">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Seamless ERP Integration
          </h2>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Connect with your existing systems in minutes. Plug. Sync. Automate.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {erpLogos.map((erp, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 border border-slate-200">
                  <div
                    className={`w-16 h-16 mx-auto bg-gradient-to-br ${erp.color} rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span className="text-white font-bold text-2xl">{erp.name[0]}</span>
                  </div>
                  <p className="font-semibold text-slate-900">{erp.name}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <Play size={20} />
              View Integration Hub
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 fade-in-section">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-12 shadow-2xl overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full blur-3xl"></div>
            </div>

            <div className="relative text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Experience the Future of Finance Automation
              </h2>
              <p className="text-xl text-indigo-200 mb-8 max-w-2xl mx-auto">
                See how CLOE can transform your financial close and reporting processes with
                intelligent automation and real-time insights.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    const modal = document.getElementById('contact-modal');
                    if (modal) modal.classList.remove('hidden');
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Request Demo
                </button>
                <Link
                  href="/about"
                  className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
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
      <footer className="bg-slate-900 text-white py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold">CLOE</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <Link href="/product" className="hover:text-white transition-colors">
                Product
              </Link>
              <Link href="/about" className="hover:text-white transition-colors">
                About Us
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
              <span>Terms</span>
              <span>Privacy</span>
            </div>
          </div>
          <div className="text-center text-slate-500 text-sm mt-8">
            © 2025 CLOE. All rights reserved.
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

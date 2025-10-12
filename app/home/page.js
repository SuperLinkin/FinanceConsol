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
  Lock
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

  const modules = [
    {
      title: 'Financial Close',
      subtitle: 'Automate your close cycle',
      icon: Calendar,
      features: [
        'Smart close calendar with automated task tracking',
        'AI-driven variance analysis and exception detection',
        'Multi-entity reconciliation workflows',
        'Real-time collaboration and approvals'
      ]
    },
    {
      title: 'Financial Reporting',
      subtitle: 'Consolidate and report with confidence',
      icon: BarChart3,
      features: [
        'Multi-GAAP, multi-currency consolidation',
        'Dynamic notes and disclosure builder',
        'Automated intercompany eliminations',
        'Export-ready financial statements'
      ]
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Faster Close',
      description: 'Accelerate your financial close with AI-driven workflows that eliminate manual tasks, streamline approvals, and keep every stakeholder in sync — reducing close time from weeks to days.'
    },
    {
      icon: Shield,
      title: 'Always Compliant',
      description: 'Stay effortlessly compliant with built-in SOX, IFRS, and US GAAP controls. CLOE maintains a full audit trail, exception monitoring, and real-time validation to ensure every number stands scrutiny.'
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Power your consolidation across multiple entities, currencies, and accounting frameworks with ease. CLOE adapts to complex ownership structures and evolving reporting standards — no manual rework required.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden">
      {/* Fluid Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-2xl opacity-10"></div>
      </div>
      <PreAuthNav />

      {/* Hero Section - Clean and Minimal */}
      <section className="relative pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-[1100px] mx-auto">
          {/* Subtle badge */}
          <div className="flex justify-center mb-8 fade-in-section">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-purple-900">AI-Native Finance Platform</span>
            </div>
          </div>

          {/* Hero Headline - Mercury style */}
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

            {/* CTA Buttons - Clean style */}
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

            {/* Trust indicators - Minimal */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-gray-500 fade-in-section">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>SOX compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>IFRS & US GAAP</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>Enterprise-grade security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section - Mercury-inspired cards */}
      <section className="py-32 px-6 lg:px-8 fade-in-section">
        <div className="max-w-[1100px] mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 tracking-tight">
              Two core modules
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              End-to-end automation for your entire financial workflow
            </p>
          </div>

          {/* Module cards */}
          <div className="space-y-8">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-12">
                    <div className="flex flex-col lg:flex-row gap-12">
                      {/* Left: Icon and title */}
                      <div className="lg:w-2/5">
                        <div className="inline-flex p-4 bg-purple-50 rounded-xl mb-6">
                          <Icon className="text-[#7B61FF]" size={32} />
                        </div>
                        <h3 className="text-3xl font-bold text-[#0F172A] mb-2 tracking-tight">
                          {module.title}
                        </h3>
                        <p className="text-lg text-gray-600 mb-6">{module.subtitle}</p>
                        <Link
                          href="/product"
                          className="inline-flex items-center gap-2 text-[#7B61FF] font-semibold hover:gap-3 transition-all duration-200"
                        >
                          <span>Learn more</span>
                          <ArrowRight size={18} />
                        </Link>
                      </div>

                      {/* Right: Features */}
                      <div className="lg:w-3/5">
                        <div className="space-y-4">
                          {module.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <CheckCircle2 className="text-[#7B61FF] flex-shrink-0 mt-0.5" size={20} />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section - Clean grid */}
      <section className="py-32 px-6 lg:px-8 bg-gray-50 fade-in-section">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 tracking-tight">
              Why should finance teams choose CLOE
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100">
                  <div className="inline-flex p-3 bg-purple-50 rounded-xl mb-4">
                    <Icon className="text-[#7B61FF]" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-32 px-6 lg:px-8 fade-in-section">
        <div className="max-w-[1100px] mx-auto">
          <div className="bg-[#0F172A] rounded-3xl p-16 text-center text-white">
            <div className="inline-flex p-4 bg-white/10 rounded-xl mb-6">
              <Lock className="text-white" size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Enterprise-grade security
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              SOC 2 Type II certified with bank-level encryption, role-based access control, and complete audit trails
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 lg:px-8 fade-in-section">
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

      {/* Footer - Minimal */}
      <footer className="border-t border-gray-200 py-12 px-6 lg:px-8">
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

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

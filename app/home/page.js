'use client';

import { useEffect, useRef } from 'react';
import PreAuthNav from '@/components/PreAuthNav';
import Link from 'next/link';
import {
  Zap,
  Calendar,
  Layers,
  DollarSign,
  Search,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';

export default function HomePage() {
  const heroRef = useRef(null);

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

  const features = [
    {
      icon: Zap,
      title: 'Smart Close Automation',
      description: 'AI-powered automation for faster, error-free financial close processes'
    },
    {
      icon: Calendar,
      title: 'Close Calendar & Workflows',
      description: 'Dynamic scheduling with real-time collaboration and approval workflows'
    },
    {
      icon: Layers,
      title: 'Multi-Entity Consolidation',
      description: 'Seamlessly consolidate complex multi-entity financial structures'
    },
    {
      icon: DollarSign,
      title: 'Multi-Currency & Multi-GAAP',
      description: 'Support for global operations with multiple accounting standards'
    },
    {
      icon: Search,
      title: 'AI Variance & Reconciliation',
      description: 'Intelligent variance analysis and automated reconciliation'
    },
    {
      icon: BarChart3,
      title: 'End-to-End Financial Reporting',
      description: 'Comprehensive reporting suite from trial balance to final statements'
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Accelerate Close Cycles',
      description: 'Reduce close time by 50% with intelligent automation and real-time visibility'
    },
    {
      icon: Shield,
      title: 'Ensure Compliance',
      description: 'Built-in controls and audit trails for SOX, IFRS, and US GAAP compliance'
    },
    {
      icon: Clock,
      title: 'Real-Time Insights',
      description: 'Live dashboards and analytics for proactive decision-making'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <PreAuthNav />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-0 animate-fadeIn">
            <Sparkles className="text-indigo-600" size={20} />
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
              AI-Native Finance Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 opacity-0 animate-fadeIn animation-delay-200">
            Automating the Future
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              of Finance
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto opacity-0 animate-fadeIn animation-delay-400">
            CLOE (Close Optimization Engine) is an AI-native platform for end-to-end{' '}
            <span className="font-semibold text-slate-900">Financial Close and Reporting</span> —
            multi-entity, multi-GAAP, and fully automated.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 opacity-0 animate-fadeIn animation-delay-600">
            <button
              onClick={() => {
                document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              Explore Product
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => {
                const modal = document.getElementById('contact-modal');
                if (modal) modal.classList.remove('hidden');
              }}
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-semibold border-2 border-slate-200 hover:border-indigo-600 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Get Demo
            </button>
          </div>

          {/* Animated Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto opacity-0 animate-fadeIn animation-delay-800">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white/50 backdrop-blur-sm">
              <div className="bg-gradient-to-br from-slate-900 to-indigo-900 p-8 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="mx-auto text-indigo-400 mb-4" size={64} />
                  <p className="text-white text-xl font-semibold">Interactive Dashboard Preview</p>
                  <p className="text-indigo-300 mt-2">Real-time consolidation and reporting</p>
                </div>
              </div>
            </div>
            {/* Floating Icons */}
            <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center animate-float">
              <Calendar className="text-white" size={32} />
            </div>
            <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg flex items-center justify-center animate-float animation-delay-1000">
              <Layers className="text-white" size={32} />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-pink-500 to-indigo-500 rounded-2xl shadow-lg flex items-center justify-center animate-float animation-delay-2000">
              <Sparkles className="text-white" size={32} />
            </div>
          </div>
        </div>
      </section>

      {/* Key Highlights Section */}
      <section id="features-section" className="py-24 px-6 lg:px-8 fade-in-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Why Finance Teams Love CLOE
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Intelligent automation meets enterprise-grade security and compliance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 hover:border-indigo-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why CLOE Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 fade-in-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Visual */}
            <div className="relative">
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="text-green-300" size={24} />
                    <span className="text-lg font-semibold">Automated Journal Entries</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="text-green-300" size={24} />
                    <span className="text-lg font-semibold">Real-time Consolidations</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="text-green-300" size={24} />
                    <span className="text-lg font-semibold">AI Variance Detection</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="text-green-300" size={24} />
                    <span className="text-lg font-semibold">Audit-Ready Reports</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-pink-400 rounded-full blur-3xl opacity-50"></div>
            </div>

            {/* Right: Content */}
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Unify Finance Operations with AI
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                CLOE eliminates spreadsheet dependency and manual processes, enabling faster,
                compliant reporting designed for CFOs, auditors, and enterprise teams.
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                      <p className="text-indigo-100">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/product"
                className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Learn More
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 lg:px-8 fade-in-section">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Finance Operations?
            </h2>
            <p className="text-xl text-indigo-200 mb-8">
              Join forward-thinking finance teams who are automating their close and reporting with CLOE.
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
                href="/product"
                className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Explore CLOE
              </Link>
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

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
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

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
  Clock,
  Brain,
  Activity,
  Globe2
} from 'lucide-react';

export default function HomePage() {
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
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

  const modules = [
    {
      title: 'Financial Close Module',
      icon: Calendar,
      gradient: 'from-violet-600 via-purple-600 to-blue-600',
      features: [
        'Smart Close Calendar',
        'Workflow Automation',
        'Multi-Entity Reconciliation',
        'AI Variance Analysis',
        'Audit Trail Visibility',
        'Real-time Collaboration'
      ]
    },
    {
      title: 'Financial Reporting Module',
      icon: BarChart3,
      gradient: 'from-blue-600 via-cyan-600 to-teal-600',
      features: [
        'Multi-GAAP & Multi-Currency',
        'Consolidation Engine',
        'Dynamic Notes & Disclosures',
        'Real-time Dashboards',
        'Industry-Agnostic',
        'Export to PDF/Excel'
      ]
    }
  ];

  const integrations = ['SAP', 'NetSuite', 'Tally', 'QuickBooks'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <PreAuthNav />

      {/* Hero Section with Animated Background */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(127,86,217,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#7F56D9_0%,#6A5AE0_40%,#3B82F6_100%)] opacity-5"></div>

          {/* Animated Mesh Grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

          {/* Floating Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-float-slow animation-delay-2000"></div>
          <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl animate-float-slow animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center z-10">
          {/* Badge */}
          <div className="flex items-center justify-center gap-2 mb-8 opacity-0 animate-fadeInUp">
            <div className="relative px-6 py-2 rounded-full bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-violet-500/30">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-blue-600/10 rounded-full animate-pulse"></div>
              <div className="relative flex items-center gap-2">
                <Sparkles className="text-violet-400" size={18} />
                <span className="text-sm font-bold bg-gradient-to-r from-violet-300 via-purple-300 to-blue-300 bg-clip-text text-transparent tracking-wider uppercase">
                  AI-Native Finance Platform
                </span>
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 opacity-0 animate-fadeInUp animation-delay-200 tracking-tight">
            <span className="block text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
              Automating the Future
            </span>
            <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              of Finance
            </span>
          </h1>

          {/* Glass Card with Subtext */}
          <div className="relative max-w-4xl mx-auto mb-12 opacity-0 animate-fadeInUp animation-delay-400">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-blue-600/20 blur-2xl rounded-3xl"></div>
            <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-medium">
                CLOE (Close Optimization Engine) is an AI-native platform for end-to-end{' '}
                <span className="font-bold bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent">
                  Financial Close & Reporting
                </span>{' '}
                — multi-entity, multi-GAAP, and fully automated.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 opacity-0 animate-fadeInUp animation-delay-600">
            <button
              onClick={() => {
                document.getElementById('modules-section').scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative px-10 py-5 rounded-2xl overflow-hidden font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent_50%)]"></div>
              </div>
              <span className="relative flex items-center gap-2 text-white">
                Explore Product
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </span>
            </button>

            <button
              onClick={() => {
                const modal = document.getElementById('contact-modal');
                if (modal) modal.classList.remove('hidden');
              }}
              className="group relative px-10 py-5 rounded-2xl font-bold text-lg bg-white/5 backdrop-blur-xl border-2 border-white/20 text-white transition-all duration-300 hover:bg-white/10 hover:border-violet-400/50 hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
            >
              <span className="relative">Get Demo</span>
            </button>
          </div>

          {/* Floating Icons */}
          <div className="relative opacity-0 animate-fadeInUp animation-delay-800">
            <div className="flex items-center justify-center gap-12 mb-4">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity rounded-2xl"></div>
                <div className="relative bg-gradient-to-br from-violet-600 to-purple-600 p-6 rounded-2xl animate-float shadow-2xl">
                  <BarChart3 className="text-white" size={40} />
                </div>
              </div>
              <div className="group relative animation-delay-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity rounded-2xl"></div>
                <div className="relative bg-gradient-to-br from-purple-600 to-fuchsia-600 p-6 rounded-2xl animate-float shadow-2xl">
                  <Brain className="text-white" size={40} />
                </div>
              </div>
              <div className="group relative animation-delay-2000">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity rounded-2xl"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 p-6 rounded-2xl animate-float shadow-2xl">
                  <Globe2 className="text-white" size={40} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
            <div className="w-1.5 h-3 bg-white/50 rounded-full mx-auto animate-scroll-indicator"></div>
          </div>
        </div>
      </section>

      {/* Modules Section - 3D Flip Cards */}
      <section id="modules-section" className="py-32 px-6 lg:px-8 fade-in-section relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-950/50 to-slate-900"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Two Core Modules.
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Infinite Automation.
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto font-medium">
              Comprehensive automation across your entire financial workflow
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <div
                  key={index}
                  className="group relative perspective-1000"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {/* Glow Effect */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${module.gradient} opacity-20 group-hover:opacity-40 blur-2xl rounded-3xl transition-all duration-500`}></div>

                  {/* Card */}
                  <div className="relative bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 transform-gpu transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-2xl">
                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    </div>

                    {/* Icon */}
                    <div className="relative mb-8">
                      <div className={`absolute inset-0 bg-gradient-to-r ${module.gradient} blur-xl opacity-50 rounded-2xl`}></div>
                      <div className={`relative inline-flex p-6 bg-gradient-to-br ${module.gradient} rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="text-white animate-pulse-slow" size={48} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl font-bold text-white mb-6 tracking-tight">
                      {module.title}
                    </h3>

                    {/* Features List */}
                    <div className="space-y-4">
                      {module.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group/item"
                        >
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${module.gradient} group-hover/item:scale-150 transition-transform`}></div>
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Learn More */}
                    <Link
                      href="/product"
                      className="inline-flex items-center gap-2 mt-8 text-violet-400 hover:text-violet-300 font-bold group/link transition-colors"
                    >
                      Learn More
                      <ArrowRight className="group-hover/link:translate-x-1 transition-transform" size={18} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-32 px-6 lg:px-8 fade-in-section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-violet-950/30 to-slate-900"></div>

        <div className="relative max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Seamless Integration
          </h2>
          <p className="text-xl text-gray-400 mb-12 font-medium">
            Works with your existing systems
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8">
            {integrations.map((name, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 opacity-0 group-hover:opacity-20 blur-xl rounded-2xl transition-all duration-300"></div>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-12 py-8 hover:bg-white/10 hover:border-violet-400/50 transition-all duration-300 hover:scale-110">
                  <span className="text-2xl font-bold text-white">{name}</span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/platform"
            className="inline-flex items-center gap-2 mt-16 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 hover:border-violet-400/50 transition-all duration-300 hover:scale-105"
          >
            View All Integrations
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 lg:px-8 fade-in-section relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>

        <div className="relative max-w-5xl mx-auto">
          <div className="relative group">
            {/* Animated Border */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 rounded-3xl opacity-75 group-hover:opacity-100 blur-xl animate-gradient-xy"></div>

            {/* Card */}
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-16 border border-white/10">
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                  Ready to Transform Your
                  <br />
                  <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                    Finance Operations?
                  </span>
                </h2>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-medium">
                  Join forward-thinking finance teams automating their close and reporting with CLOE
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <button
                    onClick={() => {
                      const modal = document.getElementById('contact-modal');
                      if (modal) modal.classList.remove('hidden');
                    }}
                    className="group relative px-10 py-5 rounded-2xl overflow-hidden font-bold text-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600"></div>
                    <span className="relative text-white">Request Demo</span>
                  </button>
                  <Link
                    href="/product"
                    className="px-10 py-5 rounded-2xl font-bold text-lg bg-white/5 backdrop-blur-xl border-2 border-white/20 text-white hover:bg-white/10 hover:border-violet-400/50 transition-all duration-300 hover:scale-105"
                  >
                    Explore CLOE
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-slate-950/50 backdrop-blur-xl py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                CLOE
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 font-medium">
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
              <span>Privacy</span>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm mt-8">
            © 2025 CLOE — Automating the Close.
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(20px) translateX(10px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes scroll-indicator {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(8px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-scroll-indicator {
          animation: scroll-indicator 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-gradient-xy {
          animation: gradient-xy 3s ease infinite;
          background-size: 200% 200%;
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

        .perspective-1000 {
          perspective: 1000px;
        }

        .bg-grid-pattern {
          background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}

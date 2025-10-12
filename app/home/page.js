'use client';

import { useEffect, useRef } from 'react';
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
  Clock
} from 'lucide-react';

export default function HomePage() {
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

  const benefits = [
    {
      icon: Zap,
      title: 'Accelerate Close Cycles',
      description: 'Reduce close time by 50% with intelligent automation'
    },
    {
      icon: Shield,
      title: 'Ensure Compliance',
      description: 'Built-in controls for SOX, IFRS, and US GAAP'
    },
    {
      icon: Clock,
      title: 'Real-Time Insights',
      description: 'Live dashboards for proactive decision-making'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      <PreAuthNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-6 lg:px-8 overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating Gradient Orbs */}
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-gradient-to-br from-purple-200 to-blue-200 rounded-full blur-3xl opacity-40 animate-float"></div>
          <div className="absolute bottom-32 left-20 w-[600px] h-[600px] bg-gradient-to-tr from-violet-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-float animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-20 animate-float animation-delay-4000"></div>

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(123,97,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(123,97,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="relative max-w-[1280px] mx-auto w-full">
          <div className="text-center max-w-5xl mx-auto">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/60 mb-10 opacity-0 animate-fadeInUp backdrop-blur-sm shadow-lg shadow-purple-500/10">
              <Sparkles className="text-purple-600 animate-pulse" size={18} />
              <span className="text-sm font-bold text-purple-900 tracking-wide">
                AI-Native Finance Platform
              </span>
            </div>

            {/* Dynamic Heading with Gradient */}
            <h1 className="text-6xl md:text-8xl font-extrabold text-[#101828] mb-8 tracking-tight leading-[1.1] opacity-0 animate-fadeInUp animation-delay-100">
              Automating the Future
              <br />
              <span className="relative inline-block mt-2">
                <span className="bg-gradient-to-r from-[#7B61FF] via-[#A78BFA] to-[#7B61FF] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  of Finance
                </span>
                {/* Underline Animation */}
                <span className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-[#7B61FF]/20 to-[#A78BFA]/20 blur-sm"></span>
              </span>
            </h1>

            {/* Enhanced Subheading */}
            <p className="text-xl md:text-2xl text-[#475569] mb-14 leading-relaxed font-medium opacity-0 animate-fadeInUp animation-delay-200 max-w-4xl mx-auto">
              CLOE (Close Optimization Engine) is an AI-native platform for end-to-end{' '}
              <span className="text-[#101828] font-bold bg-gradient-to-r from-purple-100 to-blue-100 px-2 py-1 rounded">Financial Close & Reporting</span>{' '}
              — multi-entity, multi-GAAP, and fully automated.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 opacity-0 animate-fadeInUp animation-delay-300">
              <button
                onClick={() => {
                  document.getElementById('modules-section').scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative px-12 py-5 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white rounded-2xl font-bold text-lg shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-3 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <span className="relative">Explore Product</span>
                <ArrowRight className="relative group-hover:translate-x-2 transition-transform duration-300" size={22} />
              </button>

              <button
                onClick={() => {
                  const modal = document.getElementById('contact-modal');
                  if (modal) modal.classList.remove('hidden');
                }}
                className="px-12 py-5 bg-white text-[#101828] rounded-2xl font-bold text-lg border-2 border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
              >
                Get Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-0 animate-fadeInUp animation-delay-400">
              <div className="flex items-center gap-2 text-[#475569] text-sm font-medium">
                <CheckCircle2 className="text-green-500" size={18} />
                <span>SOX Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-[#475569] text-sm font-medium">
                <CheckCircle2 className="text-green-500" size={18} />
                <span>IFRS & US GAAP</span>
              </div>
              <div className="flex items-center gap-2 text-[#475569] text-sm font-medium">
                <CheckCircle2 className="text-green-500" size={18} />
                <span>Enterprise-Grade Security</span>
              </div>
              <div className="flex items-center gap-2 text-[#475569] text-sm font-medium">
                <CheckCircle2 className="text-green-500" size={18} />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 animate-fadeInUp animation-delay-500">
          <div className="flex flex-col items-center gap-2 text-[#475569] animate-bounce-slow">
            <span className="text-xs font-semibold uppercase tracking-wider">Scroll to explore</span>
            <ArrowRight className="rotate-90" size={16} />
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules-section" className="relative py-32 px-6 lg:px-8 fade-in-section bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-purple-100/40 to-blue-100/40 rounded-full blur-3xl opacity-50"></div>

        <div className="relative max-w-[1280px] mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-[#101828] text-sm font-bold rounded-full border border-purple-200">
                Platform Capabilities
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-[#101828] mb-6 tracking-tight leading-tight">
              Two Core Modules.
              <br />
              <span className="bg-gradient-to-r from-[#7B61FF] via-[#A78BFA] to-[#7B61FF] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Infinite Automation.
              </span>
            </h2>
            <p className="text-xl text-[#475569] max-w-2xl mx-auto font-medium leading-relaxed">
              Comprehensive automation across your entire financial workflow
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-3xl p-10 border-2 border-gray-100 hover:border-purple-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-3 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Hover Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-blue-50/0 group-hover:from-purple-50/50 group-hover:to-blue-50/50 transition-all duration-500"></div>

                  {/* Content */}
                  <div className="relative">
                    {/* Icon with animated ring */}
                    <div className="relative inline-flex mb-8">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative inline-flex p-6 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-2xl shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="text-white" size={44} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl font-bold text-[#101828] mb-6 tracking-tight group-hover:text-[#7B61FF] transition-colors duration-300">
                      {module.title}
                    </h3>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {module.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 group/item">
                          <div className="flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="text-[#7B61FF] group-hover/item:scale-110 transition-transform" size={20} />
                          </div>
                          <span className="text-[#475569] font-medium group-hover/item:text-[#101828] transition-colors">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Learn More Link */}
                    <Link
                      href="/product"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 group/link"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="group-hover/link:translate-x-1 transition-transform" size={18} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 lg:px-8 fade-in-section bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6 tracking-tight">
              Why Finance Teams Choose CLOE
            </h2>
            <p className="text-xl text-[#475569] max-w-2xl mx-auto font-medium">
              Intelligent automation meets enterprise-grade security
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl mb-6">
                    <Icon className="text-[#7B61FF]" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-3">{benefit.title}</h3>
                  <p className="text-[#475569] leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 lg:px-8 fade-in-section bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div className="relative bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] rounded-3xl p-16 overflow-hidden shadow-2xl shadow-purple-500/20">
            {/* Subtle Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Ready to Transform Your
                <br />
                Finance Operations?
              </h2>
              <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto font-medium">
                Join forward-thinking finance teams automating their close and reporting with CLOE
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
                  href="/product"
                  className="px-10 py-4 bg-transparent text-white rounded-xl font-semibold border-2 border-white hover:bg-white hover:text-[#7B61FF] transition-all duration-300 hover:scale-105"
                >
                  Explore CLOE
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

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
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

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-gradient {
          animation: gradient 8s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
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

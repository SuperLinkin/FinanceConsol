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
      <section className="relative pt-32 pb-24 px-6 lg:px-8 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-100 to-blue-100 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-violet-100 to-purple-100 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="relative max-w-[1280px] mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 mb-8 opacity-0 animate-fadeInUp">
              <Sparkles className="text-purple-600" size={16} />
              <span className="text-sm font-semibold text-purple-900 tracking-wide">
                AI-Native Finance Platform
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-6xl md:text-7xl font-bold text-[#0F172A] mb-6 tracking-tight leading-tight opacity-0 animate-fadeInUp animation-delay-100">
              Automating the Future
              <br />
              <span className="bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] bg-clip-text text-transparent">
                of Finance
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-[#475569] mb-12 leading-relaxed font-medium opacity-0 animate-fadeInUp animation-delay-200">
              CLOE (Close Optimization Engine) is an AI-native platform for end-to-end{' '}
              <span className="text-[#0F172A] font-semibold">Financial Close & Reporting</span>{' '}
              — multi-entity, multi-GAAP, and fully automated.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fadeInUp animation-delay-300">
              <button
                onClick={() => {
                  document.getElementById('modules-section').scrollIntoView({ behavior: 'smooth' });
                }}
                className="group px-10 py-4 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                Explore Product
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>

              <button
                onClick={() => {
                  const modal = document.getElementById('contact-modal');
                  if (modal) modal.classList.remove('hidden');
                }}
                className="px-10 py-4 bg-white text-[#0F172A] rounded-xl font-semibold border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Get Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules-section" className="py-24 px-6 lg:px-8 fade-in-section bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6 tracking-tight">
              Two Core Modules.
              <br />
              <span className="bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] bg-clip-text text-transparent">
                Infinite Automation.
              </span>
            </h2>
            <p className="text-xl text-[#475569] max-w-2xl mx-auto font-medium">
              Comprehensive automation across your entire financial workflow
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-10 border-2 border-gray-100 hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Icon */}
                  <div className="inline-flex p-5 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-2xl shadow-lg shadow-purple-500/25 mb-8 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="text-white" size={40} />
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl font-bold text-[#0F172A] mb-6 tracking-tight">
                    {module.title}
                  </h3>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {module.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="text-[#7B61FF] flex-shrink-0 mt-0.5" size={20} />
                        <span className="text-[#475569] font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Learn More */}
                  <Link
                    href="/product"
                    className="inline-flex items-center gap-2 text-[#7B61FF] hover:text-[#A78BFA] font-bold group/link transition-colors"
                  >
                    Learn More
                    <ArrowRight className="group-hover/link:translate-x-1 transition-transform" size={18} />
                  </Link>
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
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
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
      `}</style>
    </div>
  );
}

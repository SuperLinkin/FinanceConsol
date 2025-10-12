'use client';

import { useEffect } from 'react';
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
  Zap
} from 'lucide-react';

export default function AboutPage() {
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

  const values = [
    {
      icon: Lightbulb,
      title: 'Innovation First',
      description: 'We leverage cutting-edge AI and automation to solve complex finance challenges'
    },
    {
      icon: Heart,
      title: 'Customer Obsessed',
      description: 'Every feature we build is designed with our users\' needs at the forefront'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Enterprise-grade security and compliance are built into our DNA'
    },
    {
      icon: Zap,
      title: 'Speed & Agility',
      description: 'We move fast to deliver value and adapt to changing market needs'
    }
  ];

  const milestones = [
    {
      year: '2024',
      title: 'Foundation',
      description: 'CLOE was founded with a vision to transform financial operations'
    },
    {
      year: '2024 Q4',
      title: 'Product Launch',
      description: 'Released Financial Close module with AI-powered automation'
    },
    {
      year: '2025 Q1',
      title: 'Expansion',
      description: 'Launched Financial Reporting module and multi-entity consolidation'
    },
    {
      year: '2025',
      title: 'Global Growth',
      description: 'Expanding to serve enterprise customers worldwide'
    }
  ];

  const achievements = [
    {
      icon: Award,
      value: '50%',
      label: 'Faster Close Cycles'
    },
    {
      icon: TrendingUp,
      value: '99.9%',
      label: 'Platform Uptime'
    },
    {
      icon: Users,
      value: '1000+',
      label: 'Finance Professionals'
    },
    {
      icon: Globe,
      value: '15+',
      label: 'Countries Served'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <PreAuthNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
            <Rocket size={16} />
            Our Story
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Redefining How
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Finance Teams Work
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            CLOE is built by a team of accountants, engineers, and AI experts with one goal — to
            create a unified{' '}
            <span className="font-semibold text-slate-900">Finance & Accounting Hub</span> that
            automates the entire journey from{' '}
            <span className="font-semibold text-slate-900">Revenue → Close → Report</span>.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 lg:px-8 fade-in-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <Target className="text-white mb-6" size={48} />
                  <h3 className="text-3xl font-bold text-white mb-4">Our Mission</h3>
                  <p className="text-xl text-indigo-100 leading-relaxed">
                    To simplify complex finance operations through intelligent automation — giving
                    teams real-time control, visibility, and accuracy.
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-pink-400 rounded-full blur-3xl opacity-50"></div>
            </div>

            {/* Right: Content */}
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Empowering Finance Teams Globally
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Traditional finance systems are fragmented, manual, and time-consuming. We built CLOE
                to change that — creating a single, intelligent platform that handles everything from
                close automation to consolidated reporting.
              </p>
              <p className="text-lg text-slate-600 mb-8">
                By leveraging AI and modern cloud architecture, we enable finance teams to work
                smarter, close faster, and report with confidence.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">10x</div>
                  <div className="text-sm text-slate-600">Productivity Boost</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                  <div className="text-sm text-slate-600">Automated Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 fade-in-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="text-white" size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Vision</h2>
              <blockquote className="text-2xl md:text-3xl font-semibold leading-relaxed text-indigo-100 mb-6">
                "An AI-native Finance Stack — where every close, reconciliation, and report happens
                seamlessly."
              </blockquote>
              <p className="text-xl text-indigo-100">
                We envision a future where finance teams spend zero time on manual data entry and
                100% of their time on strategic analysis and decision-making.
              </p>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">
                        Instant Consolidation
                      </div>
                      <div className="text-indigo-200 text-sm">Real-time multi-entity reporting</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">
                        Compliance Automation
                      </div>
                      <div className="text-indigo-200 text-sm">IFRS, US GAAP, SOX ready</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">Predictive Analytics</div>
                      <div className="text-indigo-200 text-sm">AI-powered forecasting</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-6 lg:px-8 fade-in-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 hover:border-indigo-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <value.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 px-6 lg:px-8 bg-white fade-in-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Impact By Numbers
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Measurable results that matter to our customers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="text-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                  <achievement.icon className="text-white" size={32} />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                  {achievement.value}
                </div>
                <div className="text-slate-600 font-medium">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey/Timeline */}
      <section className="py-20 px-6 lg:px-8 fade-in-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Our Journey</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Building the future of finance, one milestone at a time
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 hidden lg:block"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-center gap-8 ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Content Card */}
                  <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200">
                    <div className="inline-block px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-bold mb-4">
                      {milestone.year}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{milestone.title}</h3>
                    <p className="text-slate-600">{milestone.description}</p>
                  </div>

                  {/* Center Dot */}
                  <div className="hidden lg:block w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-4 border-white shadow-lg flex-shrink-0"></div>

                  {/* Spacer */}
                  <div className="flex-1 hidden lg:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
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
                Join Us in Building the Future of Finance
              </h2>
              <p className="text-xl text-indigo-200 mb-8 max-w-2xl mx-auto">
                Experience the power of AI-native finance automation. Let's transform your financial
                operations together.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    const modal = document.getElementById('contact-modal');
                    if (modal) modal.classList.remove('hidden');
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Get Demo
                </button>
                <Link
                  href="/product"
                  className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  Learn More
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

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

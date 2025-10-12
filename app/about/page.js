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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 mb-8">
            <Rocket size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-purple-900 tracking-wide">Our Story</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6 tracking-tight">
            Redefining How
            <br />
            <span className="bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] bg-clip-text text-transparent">
              Finance Teams Work
            </span>
          </h1>
          <p className="text-xl text-[#475569] max-w-3xl mx-auto font-medium">
            CLOE is built by a team of accountants, engineers, and AI experts with one goal — to
            create a unified{' '}
            <span className="font-semibold text-[#0F172A]">Finance & Accounting Hub</span> that
            automates the entire journey from{' '}
            <span className="font-semibold text-[#0F172A]">Revenue → Close → Report</span>.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 lg:px-8 fade-in-section bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-3xl p-8 shadow-2xl shadow-purple-500/20">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <Target className="text-white mb-6" size={48} />
                  <h3 className="text-3xl font-bold text-white mb-4">Our Mission</h3>
                  <p className="text-xl text-purple-100 leading-relaxed font-medium">
                    To simplify complex finance operations through intelligent automation — giving
                    teams real-time control, visibility, and accuracy.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <h2 className="text-4xl font-bold text-[#0F172A] mb-6 tracking-tight">
                Empowering Finance Teams Globally
              </h2>
              <p className="text-lg text-[#475569] mb-6 leading-relaxed">
                Traditional finance systems are fragmented, manual, and time-consuming. We built CLOE
                to change that — creating a single, intelligent platform that handles everything from
                close automation to consolidated reporting.
              </p>
              <p className="text-lg text-[#475569] mb-8 leading-relaxed">
                By leveraging AI and modern cloud architecture, we enable finance teams to work
                smarter, close faster, and report with confidence.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] bg-clip-text text-transparent mb-2">10x</div>
                  <div className="text-sm text-[#475569] font-medium">Productivity Boost</div>
                </div>
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] bg-clip-text text-transparent mb-2">24/7</div>
                  <div className="text-sm text-[#475569] font-medium">Automated Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] fade-in-section">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="text-white" size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Our Vision</h2>
              <blockquote className="text-2xl md:text-3xl font-semibold leading-relaxed text-purple-100 mb-6">
                "An AI-native Finance Stack — where every close, reconciliation, and report happens
                seamlessly."
              </blockquote>
              <p className="text-xl text-purple-100 font-medium leading-relaxed">
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
                      <div className="text-purple-100 text-sm">Real-time multi-entity reporting</div>
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
                      <div className="text-purple-100 text-sm">IFRS, US GAAP, SOX ready</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">Predictive Analytics</div>
                      <div className="text-purple-100 text-sm">AI-powered forecasting</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-6 lg:px-8 fade-in-section bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 tracking-tight">
              Our Core Values
            </h2>
            <p className="text-xl text-[#475569] max-w-2xl mx-auto font-medium">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                  <value.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-3">{value.title}</h3>
                <p className="text-[#475569]">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 px-6 lg:px-8 bg-white fade-in-section">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 tracking-tight">
              Impact By Numbers
            </h2>
            <p className="text-xl text-[#475569] max-w-2xl mx-auto font-medium">
              Measurable results that matter to our customers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="text-center p-8 bg-white rounded-3xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-2xl mb-6 shadow-lg shadow-purple-500/25">
                  <achievement.icon className="text-white" size={32} />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-2">
                  {achievement.value}
                </div>
                <div className="text-[#475569] font-medium">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey/Timeline */}
      <section className="py-20 px-6 lg:px-8 fade-in-section bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 tracking-tight">Our Journey</h2>
            <p className="text-xl text-[#475569] max-w-2xl mx-auto font-medium">
              Building the future of finance, one milestone at a time
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#7B61FF] to-[#A78BFA] hidden lg:block"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-center gap-8 ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Content Card */}
                  <div className="flex-1 bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                    <div className="inline-block px-4 py-1 bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white rounded-full text-sm font-bold mb-4">
                      {milestone.year}
                    </div>
                    <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{milestone.title}</h3>
                    <p className="text-[#475569]">{milestone.description}</p>
                  </div>

                  {/* Center Dot */}
                  <div className="hidden lg:block w-8 h-8 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-full border-4 border-white shadow-lg flex-shrink-0"></div>

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
        <div className="max-w-[1280px] mx-auto">
          <div className="relative bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] rounded-3xl p-16 overflow-hidden shadow-2xl shadow-purple-500/20">
            {/* Subtle Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Join Us in Building the Future of Finance
              </h2>
              <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto font-medium">
                Experience the power of AI-native finance automation. Let's transform your financial
                operations together.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    const modal = document.getElementById('contact-modal');
                    if (modal) modal.classList.remove('hidden');
                  }}
                  className="px-10 py-4 bg-white text-[#7B61FF] rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Get Demo
                </button>
                <Link
                  href="/product"
                  className="px-10 py-4 bg-transparent text-white rounded-xl font-semibold border-2 border-white hover:bg-white hover:text-[#7B61FF] transition-all duration-300 hover:scale-105 flex items-center gap-2"
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

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

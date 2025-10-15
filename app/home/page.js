'use client';

import { useEffect, useState } from 'react';
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
  AlertCircle,
  XCircle,
  Target,
  Users,
  Lightbulb,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSolutionSlide, setCurrentSolutionSlide] = useState(0);
  const [mockStep, setMockStep] = useState(0);

  // Projector story scenes
  const projectorScenes = [
    {
      scene: 'opening',
      time: '2:47 AM',
      location: 'Finance Department',
      mainText: 'Another close night.',
      subText: 'Sarah stares at her screen. The enterprise software crashed again. Month-end is in 6 hours.',
      visual: 'clock'
    },
    {
      scene: 'problem',
      time: '3:15 AM',
      location: 'Emergency Call',
      mainText: 'The CFO is asking for updates.',
      subText: 'Three systems. Twelve spreadsheets. Hundreds of reconciliations. Nothing matches.',
      visual: 'chaos'
    },
    {
      scene: 'frustration',
      time: '4:30 AM',
      location: 'Excel Workbook',
      mainText: 'Back to Excel. Again.',
      subText: 'After spending millions on "AI-powered" software, the team exports everything to Excel just to get work done.',
      visual: 'excel'
    },
    {
      scene: 'realization',
      time: '5:00 AM',
      location: 'Coffee Break',
      mainText: 'There has to be a better way.',
      subText: 'Software built by people who have never closed a book. Features no one asked for. Complexity no one needs.',
      visual: 'thinking'
    },
    {
      scene: 'solution',
      time: '9:00 AM',
      location: 'New Beginning',
      mainText: 'What if software actually understood your job?',
      subText: 'Built by finance teams who lived through these nights. Designed for the work you actually do. No bloat. No complexity.',
      visual: 'light'
    },
    {
      scene: 'cloe',
      time: 'Today',
      location: 'Your Future',
      mainText: 'Meet CLOE',
      subText: 'Close and consolidation software that works the way you think. Built by people who have done your job.',
      visual: 'cloe',
      showAvatar: true
    }
  ];

  // Solution slides data
  const solutionSlides = [
    {
      title: 'Financial Close',
      tagline: 'Close faster. Close smarter.',
      description: 'Automate your entire close cycle—from task assignment to variance analysis. Cut your close time in half without hiring more people.',
      features: [
        'Smart close calendar with dependencies',
        'AI-powered exception detection',
        'Multi-entity reconciliation workflows',
        'Real-time approvals and comments',
        'Automated variance analysis'
      ],
      color: 'blue'
    },
    {
      title: 'Financial Reporting',
      tagline: 'Consolidate with confidence.',
      description: 'Multi-entity, multi-GAAP consolidation that actually works. From trial balance to board-ready financials in minutes.',
      features: [
        'Multi-currency consolidation',
        'Automated elimination entries',
        'Dynamic notes and disclosures',
        'Multi-GAAP reporting (IFRS, US GAAP)',
        'Board-ready export (PDF, Excel, Word)'
      ],
      color: 'emerald'
    }
  ];

  // Auto-advance projector scenes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % projectorScenes.length);
    }, 8000); // 8 seconds per scene

    return () => clearInterval(timer);
  }, [projectorScenes.length]);

  // Auto-advance solution carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSolutionSlide((prev) => (prev + 1) % solutionSlides.length);
    }, 8000); // 8 seconds per slide

    return () => clearInterval(timer);
  }, [solutionSlides.length]);

  // Auto-advance mock window steps
  useEffect(() => {
    const timer = setInterval(() => {
      setMockStep((prev) => (prev + 1) % 3);
    }, 2000); // Change step every 2 seconds

    return () => clearInterval(timer);
  }, []);

  // Dynamic animated background with tech/AI visual elements
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % projectorScenes.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + projectorScenes.length) % projectorScenes.length);
  };

  // Light grayish-silver theme across all slides
  const getThemeClasses = () => {
    return {
      bg: 'bg-gradient-to-b from-slate-100 via-slate-50 to-white',
      badge: 'bg-slate-200 border-slate-300 text-slate-700',
      heading: 'text-[#0F172A]',
      subheading: 'text-slate-600'
    };
  };

  const problems = [
    {
      icon: AlertCircle,
      title: 'Bloated Software',
      description: 'Enterprise tools with hundreds of features you will never use. Too complex, too expensive, too slow.'
    },
    {
      icon: XCircle,
      title: 'AI That Does Not Help',
      description: 'Buzzword-driven AI that generates more work than it saves. Black boxes that finance teams cannot trust.'
    },
    {
      icon: Target,
      title: 'Back to Excel',
      description: 'After spending millions on software, teams still export everything to Excel to actually get work done.'
    }
  ];

  const solutions = [
    {
      icon: Users,
      title: 'Built by Finance Teams',
      description: 'We have closed the books. We have built the consolidation models. We have felt the pain of month-end.'
    },
    {
      icon: Lightbulb,
      title: 'For Finance Teams',
      description: 'Every feature solves a real problem. No bloat. No complexity. Just tools that work the way you think.'
    },
    {
      icon: TrendingUp,
      title: 'Actually Useful AI',
      description: 'AI that learns your patterns, flags real exceptions, and speeds up work without the black box.'
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      <PreAuthNav />

      {/* Hero Section - Story Narrative */}
      <section className="relative pt-24 pb-32 px-6 lg:px-8 bg-gradient-to-b from-white via-white to-slate-50/50 overflow-hidden">
        <div className="max-w-[1200px] mx-auto relative z-10">
          {/* Story Navigation - Top */}
          <div className="flex items-center justify-center gap-2 mb-16">
            {projectorScenes.map((scene, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="group relative"
              >
                <div className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'w-12 h-3 bg-[#7B61FF]'
                    : 'w-3 h-3 bg-slate-300 hover:bg-slate-400'
                }`}></div>
              </button>
            ))}
          </div>

          {/* Story Content - Split Layout */}
          <div className="relative min-h-[550px] flex items-center">
            {projectorScenes.map((scene, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === currentSlide
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
                  {/* Left: Text Content */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-[#7B61FF] font-semibold">{scene.time}</span>
                      <span className="text-sm text-slate-500">•</span>
                      <span className="text-sm text-slate-600">{scene.location}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#101828] leading-tight">
                      {scene.mainText}
                    </h1>

                    <p className="text-xl text-slate-600 leading-relaxed">
                      {scene.subText}
                    </p>

                    {scene.scene === 'cloe' && (
                      <div className="pt-4">
                        <Link
                          href="/product"
                          className="inline-flex items-center gap-2 px-8 py-4 bg-[#7B61FF] text-white rounded-xl font-semibold hover:bg-[#6951e0] transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          Explore CLOE
                          <ArrowRight size={18} />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Right: Mock Window */}
                  <div className="flex items-center justify-center">
                    {/* Scene 1: Late Night Clock */}
                    {scene.visual === 'clock' && (
                      <div className="w-full max-w-md bg-[#101828] rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-4 py-3 bg-[#1a1f35] flex items-center gap-2 border-b border-slate-700">
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                        <div className="p-8 flex flex-col items-center justify-center min-h-[300px] bg-gradient-to-br from-slate-800 to-slate-900">
                          <div className="text-8xl font-mono text-red-400 mb-4">2:47</div>
                          <div className="text-slate-400 text-lg">AM</div>
                          <div className="mt-8 text-red-300 text-sm animate-pulse">⚠ Month-end in 6 hours</div>
                        </div>
                      </div>
                    )}

                    {/* Scene 2: Chaos - Multiple System Errors */}
                    {scene.visual === 'chaos' && (
                      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                        <div className="px-4 py-3 bg-[#101828] flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-xs text-slate-400 ml-2">enterprise-software.app</span>
                        </div>
                        <div className="p-6 space-y-3 min-h-[300px] bg-gradient-to-br from-slate-50 to-white">
                          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                            <div className="text-sm font-semibold text-red-800">System A: Connection timeout</div>
                            <div className="text-xs text-red-600 mt-1">Error code: ERR_503</div>
                          </div>
                          <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
                            <div className="text-sm font-semibold text-amber-800">System B: Data mismatch</div>
                            <div className="text-xs text-amber-600 mt-1">12 reconciliation errors</div>
                          </div>
                          <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                            <div className="text-sm font-semibold text-orange-800">System C: Not responding</div>
                            <div className="text-xs text-orange-600 mt-1">Retry failed (3/3)</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scene 3: Excel Hell */}
                    {scene.visual === 'excel' && (
                      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                        <div className="px-4 py-3 bg-emerald-700 flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold">X</span>
                            <span className="text-sm font-semibold">Microsoft Excel</span>
                          </div>
                          <span className="text-xs opacity-90">consolidation_final_v3_FINAL.xlsx</span>
                        </div>
                        <div className="min-h-[300px] bg-white">
                          {/* Excel toolbar */}
                          <div className="px-3 py-2 bg-gradient-to-b from-slate-100 to-slate-50 border-b border-slate-300 flex items-center gap-4">
                            <div className="text-xs text-slate-700 font-semibold">fx</div>
                            <div className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-slate-600">=VLOOKUP(A2,'Sheet2'!$A$1:$D$100,3,FALSE)</div>
                          </div>

                          {/* Column headers */}
                          <div className="grid grid-cols-5 border-b-2 border-emerald-600">
                            <div className="px-3 py-2 text-xs font-bold bg-gradient-to-b from-slate-200 to-slate-100 border-r border-slate-300"></div>
                            <div className="px-3 py-2 text-xs font-bold bg-gradient-to-b from-slate-200 to-slate-100 border-r border-slate-300 text-center text-slate-700">A</div>
                            <div className="px-3 py-2 text-xs font-bold bg-gradient-to-b from-slate-200 to-slate-100 border-r border-slate-300 text-center text-slate-700">B</div>
                            <div className="px-3 py-2 text-xs font-bold bg-gradient-to-b from-slate-200 to-slate-100 border-r border-slate-300 text-center text-slate-700">C</div>
                            <div className="px-3 py-2 text-xs font-bold bg-gradient-to-b from-slate-200 to-slate-100 text-center text-slate-700">D</div>
                          </div>

                          {/* Data rows */}
                          <div className="grid grid-cols-5 border-b border-slate-200 hover:bg-blue-50">
                            <div className="px-2 py-2 text-xs font-semibold bg-gradient-to-r from-slate-200 to-slate-100 border-r border-slate-300 text-center text-slate-700">1</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 font-mono text-slate-700">Entity</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 font-mono text-slate-700">Amount</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 font-mono text-slate-700">FX Rate</div>
                            <div className="px-2 py-2 text-xs font-mono text-slate-700">Total USD</div>
                          </div>

                          <div className="grid grid-cols-5 border-b border-slate-200 hover:bg-blue-50">
                            <div className="px-2 py-2 text-xs font-semibold bg-gradient-to-r from-slate-200 to-slate-100 border-r border-slate-300 text-center text-slate-700">2</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 bg-yellow-50 font-mono text-emerald-700">=VLOOKUP(A2...</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 font-mono text-slate-800">$450,000</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 bg-yellow-50 font-mono text-emerald-700">=INDEX...</div>
                            <div className="px-2 py-2 text-xs bg-red-100 font-mono font-bold text-red-700">#REF!</div>
                          </div>

                          <div className="grid grid-cols-5 border-b border-slate-200 hover:bg-blue-50">
                            <div className="px-2 py-2 text-xs font-semibold bg-gradient-to-r from-slate-200 to-slate-100 border-r border-slate-300 text-center text-slate-700">3</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 bg-yellow-50 font-mono text-emerald-700">=VLOOKUP(A3...</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 font-mono text-slate-800">$230,500</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 bg-yellow-50 font-mono text-emerald-700">=XLOOKUP...</div>
                            <div className="px-2 py-2 text-xs bg-red-100 font-mono font-bold text-red-700">#N/A</div>
                          </div>

                          <div className="grid grid-cols-5 border-b border-slate-200 hover:bg-blue-50">
                            <div className="px-2 py-2 text-xs font-semibold bg-gradient-to-r from-slate-200 to-slate-100 border-r border-slate-300 text-center text-slate-700">4</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 bg-yellow-50 font-mono text-emerald-700">=SUMIF...</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 font-mono text-slate-800">$890,250</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 font-mono text-slate-800">1.0850</div>
                            <div className="px-2 py-2 text-xs bg-red-100 font-mono font-bold text-red-700">#VALUE!</div>
                          </div>

                          <div className="grid grid-cols-5 border-b border-slate-200 hover:bg-blue-50">
                            <div className="px-2 py-2 text-xs font-semibold bg-gradient-to-r from-slate-200 to-slate-100 border-r border-slate-300 text-center text-slate-700">5</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 bg-yellow-50 font-mono text-emerald-700">=IF(ISNA...</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 bg-red-100 font-mono font-bold text-red-700">#DIV/0!</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 bg-yellow-50 font-mono text-emerald-700">=MATCH...</div>
                            <div className="px-2 py-2 text-xs bg-green-100 font-mono text-green-800">$965,567</div>
                          </div>

                          <div className="grid grid-cols-5 border-b border-slate-200 hover:bg-blue-50">
                            <div className="px-2 py-2 text-xs font-semibold bg-gradient-to-r from-slate-200 to-slate-100 border-r border-slate-300 text-center text-slate-700">6</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 bg-blue-50 font-mono font-bold text-blue-800">=SUM(D2:D5)</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200 font-mono text-slate-800">$1,570,750</div>
                            <div className="px-2 py-2 text-xs border-r border-slate-200"></div>
                            <div className="px-2 py-2 text-xs bg-red-100 font-mono font-bold text-red-700">#REF!</div>
                          </div>

                          {/* Warning banner */}
                          <div className="mt-3 mx-3 p-3 bg-amber-100 border-l-4 border-amber-600 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-amber-700 text-lg">⚠</span>
                              <div className="text-xs text-amber-900">
                                <div className="font-bold">Circular Reference Detected</div>
                                <div className="mt-1">12 formula errors found in this workbook</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scene 4: Thinking - Bloated Software Dashboard */}
                    {scene.visual === 'thinking' && (
                      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                        <div className="px-4 py-3 bg-[#101828] flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-xs text-slate-400 ml-2">enterprise-erp-cloud-ai.com</span>
                        </div>
                        <div className="p-6 space-y-3 min-h-[300px] bg-gradient-to-br from-slate-50 to-white">
                          {/* Overwhelming feature menu */}
                          <div className="text-xs font-semibold text-slate-700 mb-2">Finance Module</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-slate-100 rounded border border-slate-300 text-slate-500">AI Forecasting ⭐</div>
                            <div className="p-2 bg-slate-100 rounded border border-slate-300 text-slate-500">Blockchain Ledger 🔥</div>
                            <div className="p-2 bg-slate-100 rounded border border-slate-300 text-slate-500">ML Anomalies 🤖</div>
                            <div className="p-2 bg-slate-100 rounded border border-slate-300 text-slate-500">Quantum Reconcile ✨</div>
                            <div className="p-2 bg-slate-100 rounded border border-slate-300 text-slate-500">Web3 Integration 🚀</div>
                            <div className="p-2 bg-slate-100 rounded border border-slate-300 text-slate-500">Metaverse Reports 🌐</div>
                          </div>
                          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                            <div className="text-xs text-amber-800">
                              <div className="font-semibold mb-1">💰 Upgrade to Enterprise Plus Ultra</div>
                              <div>Unlock 847 more features you'll never use</div>
                              <div className="mt-2 text-lg font-bold">$49,999/month</div>
                            </div>
                          </div>
                          <div className="text-center text-xs text-slate-500 mt-4">
                            "Features no one asked for. Complexity no one needs."
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scene 5: New Way - Finance Team Building Software */}
                    {scene.visual === 'light' && (
                      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                        <div className="px-4 py-3 bg-[#101828] flex items-center gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-xs text-slate-400 ml-2">team-meeting.cloe</span>
                        </div>
                        <div className="p-6 space-y-4 min-h-[300px] bg-gradient-to-br from-slate-50 to-white">
                          {/* Meeting header */}
                          <div className="text-center pb-4 border-b border-slate-200">
                            <div className="text-sm font-bold text-slate-800">Product Design Session</div>
                            <div className="text-xs text-slate-500 mt-1">Finance Team • Building CLOE</div>
                          </div>

                          {/* Team members - Finance backgrounds */}
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                SC
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-slate-800">Sarah (Controller)</div>
                                <div className="text-xs text-slate-600 mt-1">"The close calendar needs task dependencies. I had to manually track this at my last job."</div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                MK
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-slate-800">Mike (Ex-Big 4)</div>
                                <div className="text-xs text-slate-600 mt-1">"AI should explain WHY it flagged something. Finance teams need to trust the numbers."</div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                JL
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-slate-800">Jessica (CFO)</div>
                                <div className="text-xs text-slate-600 mt-1">"Skip the fancy features. Let's build what actually saves time during month-end."</div>
                              </div>
                            </div>
                          </div>

                          {/* Footer tagline */}
                          <div className="text-center pt-4 border-t border-slate-200">
                            <div className="text-xs text-slate-500 italic">
                              Every feature designed by people who've done your job
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scene 6: CLOE App */}
                    {scene.visual === 'cloe' && scene.showAvatar && (
                      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                        <div className="px-4 py-3 bg-[#101828] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-[#7B61FF] to-[#6366f1] rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">C</span>
                            </div>
                            <span className="text-sm text-white font-semibold">CLOE</span>
                          </div>
                          <div className="flex gap-1.5">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                        <div className="p-6 space-y-4 min-h-[300px] bg-gradient-to-br from-slate-50 to-white">
                          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="text-green-600" size={20} />
                              <span className="text-sm font-medium text-green-900">All entities reconciled</span>
                            </div>
                            <span className="text-xs text-green-600">100%</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="text-blue-600" size={20} />
                              <span className="text-sm font-medium text-blue-900">Consolidation complete</span>
                            </div>
                            <span className="text-xs text-blue-600">2 min</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Sparkles className="text-purple-600" size={20} />
                              <span className="text-sm font-medium text-purple-900">AI review passed</span>
                            </div>
                            <span className="text-xs text-purple-600">0 issues</span>
                          </div>
                          <div className="text-center pt-4">
                            <div className="text-2xl font-bold text-[#101828]">Close time: 3 hours</div>
                            <div className="text-sm text-green-600 mt-1">↓ 50% faster than last month</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Solutions Carousel - Light Silver Theme with Enriched Content */}
      <section className="relative py-32 px-6 lg:px-8 bg-gradient-to-b from-slate-50/50 via-slate-100 to-slate-50 overflow-hidden">
        {/* Decorative Background - Softer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-40 right-20 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-20 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-white/80 backdrop-blur-xl border border-purple-200 rounded-full mb-6 shadow-sm">
              <span className="text-xs font-bold tracking-wide uppercase text-purple-900">Our Solutions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 tracking-tight">
              Two products. One seamless workflow.
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From close to consolidation—everything you need in one platform.
            </p>
          </div>

          <div className="relative min-h-[700px] flex items-center">
            {/* Solution Carousel Content */}
            {solutionSlides.map((solution, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === currentSolutionSlide
                    ? 'opacity-100 translate-x-0'
                    : index < currentSolutionSlide
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
                }`}
              >
                <div className="grid lg:grid-cols-5 gap-8 items-start h-full">
                  {/* Left: Content (3 columns) */}
                  <div className="lg:col-span-3 bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/60">
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full mb-6">
                      <span className="text-xs font-bold tracking-wide uppercase text-blue-900">
                        Solution {index + 1}
                      </span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4 tracking-tight leading-[1.15]">
                      {solution.title}
                    </h3>
                    <p className="text-2xl text-[#7B61FF] mb-6 font-semibold">
                      {solution.tagline}
                    </p>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                      {solution.description}
                    </p>

                    {/* Key Benefits */}
                    <div className="space-y-4 mb-8">
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Why This Matters</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {index === 0 ? (
                          <>
                            <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl">
                              <Clock className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                              <div>
                                <p className="font-semibold text-[#0F172A] text-sm">50% Faster Close</p>
                                <p className="text-xs text-slate-600">Cut your close cycle in half</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 bg-emerald-50 p-4 rounded-xl">
                              <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
                              <div>
                                <p className="font-semibold text-[#0F172A] text-sm">100% Accuracy</p>
                                <p className="text-xs text-slate-600">AI-powered error detection</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start gap-3 bg-purple-50 p-4 rounded-xl">
                              <Globe className="text-purple-600 flex-shrink-0 mt-0.5" size={20} />
                              <div>
                                <p className="font-semibold text-[#0F172A] text-sm">Multi-Entity Ready</p>
                                <p className="text-xs text-slate-600">Handle unlimited entities</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 bg-indigo-50 p-4 rounded-xl">
                              <Shield className="text-indigo-600 flex-shrink-0 mt-0.5" size={20} />
                              <div>
                                <p className="font-semibold text-[#0F172A] text-sm">Audit-Ready</p>
                                <p className="text-xs text-slate-600">Complete audit trail</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <Link
                      href="/product"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#7B61FF] text-white rounded-xl font-semibold hover:bg-[#6951e0] transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Explore {solution.title}
                      <ArrowRight size={18} />
                    </Link>
                  </div>

                  {/* Right: Mock Window (2 columns) */}
                  <div className="lg:col-span-2">
                    {/* Browser Window Frame */}
                    <div className="bg-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                      {/* Window Header */}
                      <div className="bg-[#101828] px-4 py-3 flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="inline-flex items-center gap-2 bg-slate-700/50 px-4 py-1 rounded-lg">
                            <div className="w-3 h-3 text-slate-400">🔒</div>
                            <span className="text-xs text-slate-300">app.cloe.finance</span>
                          </div>
                        </div>
                      </div>

                      {/* Window Content - Financial Close */}
                      {index === 0 && (
                        <div className="bg-gradient-to-br from-slate-50 to-white p-6 min-h-[500px]">
                          {/* Step 1: Close Calendar */}
                          {mockStep === 0 && (
                            <div className="space-y-4 animate-fadeIn">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-800">Close Calendar - December 2024</h3>
                                <div className="text-xs text-slate-500">Step 1 of 3</div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs font-semibold text-slate-700">Day 1-5: Data Collection</span>
                                  </div>
                                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-green-500"></div>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-2">Completed</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-semibold text-slate-700">Day 6-8: Reconciliation</span>
                                  </div>
                                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full w-3/4 bg-blue-500"></div>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-2">In Progress - 75%</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm opacity-60">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                    <span className="text-xs font-semibold text-slate-700">Day 9-10: Review</span>
                                  </div>
                                  <div className="h-1 bg-slate-100 rounded-full"></div>
                                  <p className="text-xs text-slate-500 mt-2">Pending</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm opacity-60">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                    <span className="text-xs font-semibold text-slate-700">Day 11-12: Finalize</span>
                                  </div>
                                  <div className="h-1 bg-slate-100 rounded-full"></div>
                                  <p className="text-xs text-slate-500 mt-2">Pending</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 2: Reconciliation */}
                          {mockStep === 1 && (
                            <div className="space-y-4 animate-fadeIn">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-800">Reconciliation Workspace</h3>
                                <div className="text-xs text-slate-500">Step 2 of 3</div>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs font-semibold text-slate-700">Entity: North America Operations</span>
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Active</span>
                                </div>
                                <div className="space-y-2 text-xs">
                                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-600">Cash & Equivalents</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-500">$2,450,000</span>
                                      <CheckCircle2 className="text-green-600" size={14} />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-600">Accounts Receivable</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-500">$1,230,500</span>
                                      <CheckCircle2 className="text-green-600" size={14} />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between py-2 border-b border-slate-100 bg-amber-50">
                                    <span className="text-slate-700 font-medium">Inventory</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-amber-700">$890,250</span>
                                      <AlertCircle className="text-amber-600" size={14} />
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-200">
                                  <p className="text-xs text-amber-800 flex items-center gap-2">
                                    <Sparkles size={12} />
                                    AI detected variance: $12,450 difference from last month
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 3: Approval */}
                          {mockStep === 2 && (
                            <div className="space-y-4 animate-fadeIn">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-800">Approval Dashboard</h3>
                                <div className="text-xs text-slate-500">Step 3 of 3</div>
                              </div>
                              <div className="space-y-3">
                                <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="text-green-600" size={16} />
                                      <span className="text-xs font-semibold text-slate-700">North America - Approved</span>
                                    </div>
                                    <span className="text-xs text-slate-500">2h ago</span>
                                  </div>
                                  <p className="text-xs text-slate-600">Approved by: John Smith (CFO)</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="text-green-600" size={16} />
                                      <span className="text-xs font-semibold text-slate-700">Europe - Approved</span>
                                    </div>
                                    <span className="text-xs text-slate-500">4h ago</span>
                                  </div>
                                  <p className="text-xs text-slate-600">Approved by: Sarah Johnson (Controller)</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Clock className="text-blue-600" size={16} />
                                      <span className="text-xs font-semibold text-slate-700">APAC - Pending Review</span>
                                    </div>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Active</span>
                                  </div>
                                  <p className="text-xs text-slate-600">Assigned to: Mike Chen (Regional CFO)</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Window Content - Financial Reporting */}
                      {index === 1 && (
                        <div className="bg-gradient-to-br from-slate-50 to-white p-6 min-h-[500px]">
                          {/* Step 1: Consolidation Setup */}
                          {mockStep === 0 && (
                            <div className="space-y-4 animate-fadeIn">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-800">Consolidation Setup</h3>
                                <div className="text-xs text-slate-500">Step 1 of 3</div>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">Period:</span>
                                    <span className="font-semibold text-slate-800">Dec 2024</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">Entities:</span>
                                    <span className="font-semibold text-slate-800">12 Selected</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">Reporting Currency:</span>
                                    <span className="font-semibold text-slate-800">USD</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600">GAAP Standard:</span>
                                    <span className="font-semibold text-slate-800">US GAAP</span>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                  <p className="text-xs font-semibold text-purple-800 mb-1">Entities</p>
                                  <p className="text-lg font-bold text-purple-900">12</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                  <p className="text-xs font-semibold text-blue-800 mb-1">Currencies</p>
                                  <p className="text-lg font-bold text-blue-900">5</p>
                                </div>
                                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                                  <p className="text-xs font-semibold text-emerald-800 mb-1">Eliminations</p>
                                  <p className="text-lg font-bold text-emerald-900">48</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 2: Elimination Entries */}
                          {mockStep === 1 && (
                            <div className="space-y-4 animate-fadeIn">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-800">Elimination Entries</h3>
                                <div className="text-xs text-slate-500">Step 2 of 3</div>
                              </div>
                              <div className="space-y-2">
                                <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-700">Intercompany Revenue</span>
                                    <CheckCircle2 className="text-green-600" size={14} />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <p className="text-slate-500">From: Entity A</p>
                                      <p className="text-slate-800 font-medium">$450,000</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-500">To: Entity B</p>
                                      <p className="text-slate-800 font-medium">$450,000</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-green-200 shadow-sm bg-green-50">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="text-green-600" size={14} />
                                    <span className="text-xs font-semibold text-green-800">Auto-matched elimination</span>
                                  </div>
                                  <p className="text-xs text-green-700">AI found matching intercompany loan entry</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-700">Currency Translation</span>
                                    <CheckCircle2 className="text-green-600" size={14} />
                                  </div>
                                  <div className="text-xs">
                                    <p className="text-slate-500 mb-1">EUR → USD @ 1.0850</p>
                                    <p className="text-slate-800 font-medium">Translation adj: $12,340</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 3: Final Report */}
                          {mockStep === 2 && (
                            <div className="space-y-4 animate-fadeIn">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-800">Consolidated Financials</h3>
                                <div className="text-xs text-slate-500">Step 3 of 3</div>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-800 mb-3">Income Statement (USD '000)</h4>
                                <div className="space-y-2 text-xs">
                                  <div className="flex items-center justify-between py-1">
                                    <span className="text-slate-600">Revenue</span>
                                    <span className="font-semibold text-slate-800">$24,560</span>
                                  </div>
                                  <div className="flex items-center justify-between py-1">
                                    <span className="text-slate-600">Cost of Sales</span>
                                    <span className="font-semibold text-slate-800">($14,230)</span>
                                  </div>
                                  <div className="flex items-center justify-between py-1 border-t border-slate-200 pt-2">
                                    <span className="text-slate-700 font-semibold">Gross Profit</span>
                                    <span className="font-bold text-slate-900">$10,330</span>
                                  </div>
                                  <div className="flex items-center justify-between py-1">
                                    <span className="text-slate-600">Operating Expenses</span>
                                    <span className="font-semibold text-slate-800">($6,450)</span>
                                  </div>
                                  <div className="flex items-center justify-between py-1 border-t border-slate-200 pt-2">
                                    <span className="text-slate-700 font-bold">Net Income</span>
                                    <span className="font-bold text-emerald-700">$3,880</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button className="flex-1 text-xs bg-[#7B61FF] text-white py-2 rounded-lg font-semibold">
                                  Export to Excel
                                </button>
                                <button className="flex-1 text-xs bg-slate-200 text-slate-700 py-2 rounded-lg font-semibold">
                                  Generate PDF
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Progress Dots */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-3">
              {solutionSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSolutionSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSolutionSlide
                      ? 'w-12 h-3 bg-[#7B61FF]'
                      : 'w-3 h-3 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to solution ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Why Choose Us - Enhanced Visual Section */}
      <section className="relative py-32 px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-white to-white overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-[1200px] mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-block px-5 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-full mb-6 shadow-sm">
              <span className="text-sm font-bold tracking-wide uppercase text-purple-900">Why CLOE</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-[#101828] mb-6 tracking-tight leading-tight">
              Built by finance teams,<br/>for finance teams
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We've lived through the 2AM close nights. We know what actually works.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Card 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-20 h-20 bg-gradient-to-br from-[#7B61FF] to-[#6366f1] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Users className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-bold text-[#101828] mb-4">We've done your job</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Our team has closed books at Fortune 500 companies. Built consolidation models. Survived month-end chaos.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="text-green-600 flex-shrink-0" size={16} />
                    <span>Former Big 4 accountants</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="text-green-600 flex-shrink-0" size={16} />
                    <span>15+ years combined experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="text-green-600 flex-shrink-0" size={16} />
                    <span>Lived through real close cycles</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-20 h-20 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Zap className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-bold text-[#101828] mb-4">Zero bloat promise</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Every single feature solves a real problem. No AI buzzwords. No blockchain nonsense. Just tools that work.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="text-green-600 flex-shrink-0" size={16} />
                    <span>Only features you'll actually use</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="text-green-600 flex-shrink-0" size={16} />
                    <span>Intuitive, not overwhelming</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="text-green-600 flex-shrink-0" size={16} />
                    <span>Learn in minutes, not months</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-20 h-20 bg-gradient-to-br from-[#7B61FF] to-[#8B5CF6] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Sparkles className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-bold text-[#101828] mb-4">AI that actually helps</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Our AI learns your patterns, flags real exceptions, and speeds up work—without the black box mystery.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="text-green-600 flex-shrink-0" size={16} />
                    <span>Explainable recommendations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="text-green-600 flex-shrink-0" size={16} />
                    <span>Pattern recognition you can trust</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="text-green-600 flex-shrink-0" size={16} />
                    <span>Reduces workload, not accuracy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl border border-purple-200 shadow-xl">
              <div className="flex-1 text-left">
                <h3 className="text-2xl font-bold text-[#101828] mb-2">Ready to transform your close process?</h3>
                <p className="text-slate-600">See CLOE in action with a personalized demo</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const modal = document.getElementById('contact-modal');
                    if (modal) modal.classList.remove('hidden');
                  }}
                  className="px-8 py-4 bg-[#7B61FF] text-white rounded-xl font-semibold hover:bg-[#6951e0] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap"
                >
                  Request demo
                </button>
                <Link
                  href="/product"
                  className="px-8 py-4 bg-white text-[#101828] rounded-xl font-semibold border-2 border-slate-300 hover:border-slate-400 hover:shadow-lg transition-all duration-200 whitespace-nowrap"
                >
                  Explore product
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 lg:px-8 bg-white">
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

      <style dangerouslySetInnerHTML={{__html: `
        .fade-in-section {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .fade-in-section.fade-in {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}} />
    </div>
  );
}

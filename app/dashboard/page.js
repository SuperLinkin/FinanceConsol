'use client';

import { Sparkles, CheckCircle, Clock, TrendingUp, Users, FileText, Zap, Bell } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function Dashboard() {
  const recentUpdates = [
    {
      id: 1,
      title: 'Enhanced Group Structure Management',
      description: 'Improved visualization of entity hierarchies with drag-and-drop support for restructuring',
      date: '2025-01-15',
      category: 'Feature',
      icon: Users,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Multi-Currency Support Enhanced',
      description: 'Added support for 20+ additional currencies with automatic exchange rate fetching',
      date: '2025-01-10',
      category: 'Feature',
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 3,
      title: 'Trial Balance Viewer Improvements',
      description: 'Inline editing of GL amounts and class assignment directly from TB viewer',
      date: '2025-01-08',
      category: 'Enhancement',
      icon: FileText,
      color: 'purple'
    },
    {
      id: 4,
      title: 'Security Updates',
      description: 'Enhanced authentication system with improved session management and security headers',
      date: '2025-01-05',
      category: 'Security',
      icon: Zap,
      color: 'red'
    }
  ];

  const upcomingFeatures = [
    {
      id: 1,
      title: 'AI-Powered Consolidation Assistant',
      description: 'Intelligent suggestions for elimination entries and consolidation adjustments',
      status: 'In Development',
      eta: 'Q1 2025'
    },
    {
      id: 2,
      title: 'Advanced Reporting Templates',
      description: 'Pre-built templates for IFRS and GAAP reporting with customization options',
      status: 'Planning',
      eta: 'Q2 2025'
    },
    {
      id: 3,
      title: 'Real-time Collaboration',
      description: 'Multiple users working on the same consolidation with live updates',
      status: 'Planning',
      eta: 'Q2 2025'
    },
    {
      id: 4,
      title: 'Mobile App',
      description: 'Access your consolidation data on-the-go with our native mobile app',
      status: 'Research',
      eta: 'Q3 2025'
    }
  ];

  const stats = [
    { label: 'Total Entities', value: '12', change: '+2 this month', icon: Users, color: 'blue' },
    { label: 'Active Currencies', value: '5', change: 'No change', icon: TrendingUp, color: 'green' },
    { label: 'TB Records', value: '1,247', change: '+328 this week', icon: FileText, color: 'purple' },
    { label: 'System Uptime', value: '99.9%', change: 'Last 30 days', icon: Zap, color: 'orange' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's new in CLOE"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 space-y-8">

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                      <Icon size={24} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.change}</div>
                </div>
              );
            })}
          </div>

          {/* Recent Updates Section */}
          <div className="bg-white rounded-[14px] shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Bell className="text-slate-900" size={24} />
                <h2 className="text-2xl font-bold text-slate-900">Recent Updates</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Latest features and improvements to CLOE</p>
            </div>

            <div className="p-6 space-y-4">
              {recentUpdates.map((update) => {
                const Icon = update.icon;
                return (
                  <div
                    key={update.id}
                    className="flex gap-4 p-5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`p-3 rounded-lg ${getColorClasses(update.color)} flex-shrink-0`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{update.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getColorClasses(update.color)}`}>
                          {update.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{update.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={14} />
                        <span>{new Date(update.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Features Section */}
          <div className="bg-white rounded-[14px] shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Sparkles className="text-slate-900" size={24} />
                <h2 className="text-2xl font-bold text-slate-900">Upcoming Features</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">What's coming next to CLOE</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {upcomingFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border-2 border-gray-200 hover:border-slate-900 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                      <span className="px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-full">
                        {feature.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">{feature.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={14} />
                      <span className="font-semibold">Expected: {feature.eta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[14px] p-8 shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-2">Need Help Getting Started?</h2>
            <p className="text-gray-300 mb-6">Explore our guides and documentation to make the most of CLOE</p>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                View Documentation
              </button>
              <button className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors">
                Watch Tutorial
              </button>
              <button className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors">
                Contact Support
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

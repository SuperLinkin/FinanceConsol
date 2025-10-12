'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import {
  Building2,
  FileText,
  Upload,
  Scissors,
  Activity,
  TrendingUp
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    // Check both session token cookie AND localStorage for currentUser
    const hasSessionToken = document.cookie.includes('session_token');
    const hasLocalStorageUser = localStorage.getItem('currentUser');

    // If no session token AND no localStorage user data, redirect to landing page
    if (!hasSessionToken && !hasLocalStorageUser) {
      router.push('/home');
      return;
    }
  }, [router]);
  const quickLinks = [
    {
      icon: Building2,
      title: 'Entity Setup',
      description: 'Manage entities and organizational structure',
      href: '/entity-setup',
      color: 'blue'
    },
    {
      icon: Upload,
      title: 'Upload Data',
      description: 'Upload trial balances and chart of accounts',
      href: '/upload',
      color: 'indigo'
    },
    {
      icon: FileText,
      title: 'Trial Balance',
      description: 'View and manage trial balance data',
      href: '/trial-balance',
      color: 'purple'
    },
    {
      icon: Scissors,
      title: 'Eliminations',
      description: 'Create intercompany eliminations',
      href: '/eliminations',
      color: 'amber'
    },
    {
      icon: Activity,
      title: 'Consolidation',
      description: 'Generate consolidated financials',
      href: '/consolidation-workings',
      color: 'green'
    },
    {
      icon: TrendingUp,
      title: 'Reporting',
      description: 'View and export financial reports',
      href: '/reporting',
      color: 'emerald'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700',
      indigo: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-700',
      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700',
      amber: 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-700',
      green: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700',
      emerald: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        title="Dashboard"
        subtitle="IFRS Financial Consolidation Platform"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-[14px] p-8 mb-8 text-white">
            <h2 className="text-3xl font-bold mb-3">Welcome to Financial Consolidation</h2>
            <p className="text-gray-300 text-lg">
              Complete IFRS-compliant consolidation platform for managing entities, eliminations, and financial reporting.
            </p>
          </div>

          {/* Quick Links Grid */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`block p-6 rounded-[14px] border-2 transition-all ${getColorClasses(link.color)}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center">
                          <Icon size={24} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold mb-1">{link.title}</h4>
                        <p className="text-sm opacity-80">{link.description}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-8 bg-white rounded-[14px] shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-semibold text-gray-900">Multi-Entity Management</div>
                  <div className="text-sm text-gray-600">Manage complex organizational hierarchies</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-semibold text-gray-900">IFRS Compliant</div>
                  <div className="text-sm text-gray-600">4-level chart of accounts structure</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-semibold text-gray-900">Automated Eliminations</div>
                  <div className="text-sm text-gray-600">GL pairs and journal entry automation</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-semibold text-gray-900">Real-time Consolidation</div>
                  <div className="text-sm text-gray-600">Generate consolidated financials instantly</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-semibold text-gray-900">Multi-Currency Support</div>
                  <div className="text-sm text-gray-600">Translation and exchange rate management</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-semibold text-gray-900">Advanced Reporting</div>
                  <div className="text-sm text-gray-600">Export to PDF and Excel</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

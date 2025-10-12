'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import {
  Database,
  Download,
  RefreshCw,
  MousePointer,
  Check,
  Settings,
  ArrowRight,
  Link2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function IntegrationsHub() {
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  // ERP Integration Options
  const erpIntegrations = [
    {
      id: 'tally',
      name: 'Tally ERP',
      logo: '/integrations/tally-logo.png',
      status: 'available',
      description: 'Connect with Tally ERP 9 and Tally Prime for seamless financial data sync',
      features: [
        'Direct trial balance import',
        'Chart of accounts sync',
        'Multi-company support',
        'Real-time data updates'
      ]
    },
    {
      id: 'sap',
      name: 'SAP',
      logo: '/integrations/sap-logo.png',
      status: 'available',
      description: 'Integrate with SAP S/4HANA and SAP ECC for enterprise financial consolidation',
      features: [
        'GL account extraction',
        'Multi-entity support',
        'Automated data mapping',
        'Currency translation'
      ]
    },
    {
      id: 'netsuite',
      name: 'Oracle NetSuite',
      logo: '/integrations/netsuite-logo.png',
      status: 'available',
      description: 'Connect NetSuite cloud ERP for comprehensive financial data integration',
      features: [
        'Subsidiary consolidation',
        'Automated journal entries',
        'Custom segment mapping',
        'Scheduled sync'
      ]
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      logo: '/integrations/quickbooks-logo.png',
      status: 'available',
      description: 'Integrate QuickBooks Online and Desktop for small to mid-size businesses',
      features: [
        'Trial balance export',
        'Account classification',
        'Multi-currency support',
        'Incremental updates'
      ]
    }
  ];

  // Data Upload Methods
  const uploadMethods = [
    {
      id: 'template',
      name: 'Template Upload',
      icon: Download,
      description: 'Download Excel templates, fill in your data, and upload',
      color: 'blue',
      steps: [
        'Download the Excel template',
        'Fill in your financial data',
        'Upload the completed file',
        'System validates and imports'
      ]
    },
    {
      id: 'sync',
      name: 'Direct Sync',
      icon: RefreshCw,
      description: 'Automatically sync data from your connected ERP system',
      color: 'green',
      steps: [
        'Configure ERP connection',
        'Set sync schedule (daily/weekly/monthly)',
        'Map data fields',
        'Automatic background sync'
      ]
    },
    {
      id: 'manual',
      name: 'Manual Entry',
      icon: MousePointer,
      description: 'Use app buttons to manually enter or adjust data',
      color: 'purple',
      steps: [
        'Navigate to relevant page (TB, COA, etc.)',
        'Click "Add" or "Edit" buttons',
        'Enter data directly in forms',
        'Save and validate'
      ]
    }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      available: { label: 'Available', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
      coming_soon: { label: 'Coming Soon', color: 'bg-amber-100 text-amber-700', icon: Clock },
      beta: { label: 'Beta', color: 'bg-blue-100 text-blue-700', icon: AlertCircle }
    };
    const badge = badges[status] || badges.available;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-50',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        hover: 'hover:bg-green-50',
        border: 'border-green-200'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        hover: 'hover:bg-purple-50',
        border: 'border-purple-200'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        title="Integrations Hub"
        subtitle="Connect your ERP systems and manage data flow into CLOE"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 space-y-8">

          {/* Hero Section */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-3">Seamless ERP Integration</h2>
            <p className="text-indigo-100 text-lg mb-6">
              Connect your existing ERP systems and automate your financial consolidation workflow
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">4</div>
                <div className="text-sm text-indigo-100">ERP Integrations</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">3</div>
                <div className="text-sm text-indigo-100">Upload Methods</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">Real-time</div>
                <div className="text-sm text-indigo-100">Data Sync</div>
              </div>
            </div>
          </div>

          {/* ERP Integrations Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Database className="text-[#101828]" size={24} />
              <h3 className="text-2xl font-bold text-[#101828]">ERP Systems</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {erpIntegrations.map((erp) => (
                <div
                  key={erp.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedIntegration(erp)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Database className="text-slate-600" size={32} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-[#101828] mb-1">{erp.name}</h4>
                        {getStatusBadge(erp.status)}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-4">{erp.description}</p>

                  <div className="space-y-2 mb-4">
                    {erp.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <Check size={16} className="text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-medium">
                    <Link2 size={16} />
                    Configure Integration
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Methods Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Settings className="text-[#101828]" size={24} />
              <h3 className="text-2xl font-bold text-[#101828]">Data Upload Methods</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Choose how you want to bring your financial data into CLOE. You can use one or combine multiple methods based on your needs.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {uploadMethods.map((method) => {
                const Icon = method.icon;
                const colors = getColorClasses(method.color);
                return (
                  <div
                    key={method.id}
                    className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all"
                  >
                    <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={colors.text} size={24} />
                    </div>

                    <h4 className="text-lg font-bold text-[#101828] mb-2">{method.name}</h4>
                    <p className="text-sm text-slate-600 mb-4">{method.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        How it works:
                      </div>
                      {method.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className={`flex-shrink-0 w-5 h-5 ${colors.bg} ${colors.text} rounded-full flex items-center justify-center text-xs font-bold`}>
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>

                    <button className={`w-full px-4 py-2 border-2 ${colors.border} ${colors.text} rounded-lg ${colors.hover} transition-colors font-medium text-sm`}>
                      Learn More
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Getting Started</h4>
                <p className="text-sm text-blue-800 mb-3">
                  To set up an ERP integration, click "Configure Integration" on any ERP card above.
                  You'll need your ERP credentials and API access to complete the connection.
                </p>
                <p className="text-sm text-blue-800">
                  If you prefer manual control, you can always use template uploads or direct entry
                  through the app's various data entry pages (Entity Setup, Upload, Chart of Accounts, etc.).
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

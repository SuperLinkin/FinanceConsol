'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import {
  Database,
  Check,
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

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        title="Integrations Hub"
        subtitle="Connect your ERP systems and manage data flow into CLOE"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 space-y-8">

          {/* ERP Integrations Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Database className="text-[#101828]" size={24} />
              <h3 className="text-2xl font-bold text-[#101828]">ERP Integrations</h3>
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

          {/* Other Integrations Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Link2 className="text-[#101828]" size={24} />
              <h3 className="text-2xl font-bold text-[#101828]">Other Integrations</h3>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <Clock className="mx-auto text-slate-400 mb-4" size={48} />
              <h4 className="text-xl font-bold text-slate-700 mb-2">Coming Soon</h4>
              <p className="text-slate-600">
                Additional integrations are currently in development and will be available soon.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

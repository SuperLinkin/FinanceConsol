'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import {
  Database,
  Check,
  ArrowRight,
  Link2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Settings,
  PlayCircle,
  RefreshCw,
  Trash2,
  Activity,
  TrendingUp,
  XCircle,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Calendar,
  Plus,
  Zap,
  Shield,
  BarChart3,
  FileText
} from 'lucide-react';

export default function IntegrationsHub() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('marketplace'); // 'marketplace' or 'my-integrations'
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSyncHistoryModal, setShowSyncHistoryModal] = useState(false);
  const [selectedErp, setSelectedErp] = useState(null);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [configStep, setConfigStep] = useState(1); // 1=connection, 2=mapping, 3=sync
  const [syncHistory, setSyncHistory] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingNow, setSyncingNow] = useState({});

  // ERP system templates with enhanced metadata
  const erpTemplates = {
    netsuite: {
      id: 'netsuite',
      name: 'Oracle NetSuite',
      description: 'Cloud ERP for comprehensive financial management',
      shortDesc: 'Enterprise cloud ERP solution',
      logo: '☁️',
      color: 'from-blue-500 to-blue-600',
      category: 'Enterprise ERP',
      popularity: 'Most Popular',
      features: [
        'Multi-subsidiary consolidation',
        'Real-time GL sync',
        'Automated journal entries',
        'Custom segment mapping'
      ],
      benefits: [
        'Eliminates manual data entry',
        'Real-time financial visibility',
        'Reduces consolidation time by 80%',
        'IFRS compliant mapping'
      ],
      connectionFields: [
        { name: 'account_id', label: 'Account ID', type: 'text', placeholder: '1234567', helpText: 'Found in your NetSuite URL' },
        { name: 'realm', label: 'Environment', type: 'select', options: ['production', 'sandbox'], helpText: 'Select your NetSuite environment' }
      ],
      authType: 'token_based',
      credentialFields: [
        { name: 'consumer_key', label: 'Consumer Key', type: 'text', placeholder: 'From Integration Record', helpText: 'From NetSuite Integration Record' },
        { name: 'consumer_secret', label: 'Consumer Secret', type: 'password', placeholder: '••••••••', helpText: 'Keep this secure' },
        { name: 'token_id', label: 'Token ID', type: 'text', placeholder: 'From Access Token', helpText: 'Generated in NetSuite' },
        { name: 'token_secret', label: 'Token Secret', type: 'password', placeholder: '••••••••', helpText: 'Keep this secure' }
      ],
      setupGuide: [
        'Enable SuiteTalk Web Services in NetSuite',
        'Create Integration Record and get Consumer Key/Secret',
        'Generate Access Token and get Token ID/Secret',
        'Assign required permissions to user role'
      ]
    },
    sap: {
      id: 'sap',
      name: 'SAP ERP',
      description: 'Enterprise resource planning for large organizations',
      shortDesc: 'Industry-leading ERP platform',
      logo: '🏢',
      color: 'from-indigo-500 to-indigo-600',
      category: 'Enterprise ERP',
      popularity: 'Enterprise',
      features: [
        'S/4HANA & ECC support',
        'Multi-entity GL extraction',
        'Automated data mapping',
        'Real-time currency translation'
      ],
      benefits: [
        'Seamless SAP integration',
        'Handles complex org structures',
        'Multi-currency support',
        'Scalable for large enterprises'
      ],
      connectionFields: [
        { name: 'system_id', label: 'System ID', type: 'text', placeholder: 'PRD', helpText: 'SAP system identifier' },
        { name: 'client', label: 'Client', type: 'text', placeholder: '100', helpText: 'SAP client number' },
        { name: 'host', label: 'Host', type: 'text', placeholder: 'sap.company.com', helpText: 'SAP server hostname' },
        { name: 'language', label: 'Language', type: 'text', placeholder: 'EN', helpText: 'System language code' }
      ],
      authType: 'basic',
      setupGuide: [
        'Obtain SAP system credentials from IT',
        'Verify RFC/API access permissions',
        'Configure firewall for API access',
        'Test connection with read-only user'
      ]
    },
    tally: {
      id: 'tally',
      name: 'Tally ERP',
      description: 'Popular accounting software for SMEs in India',
      shortDesc: 'Leading SME accounting solution',
      logo: '📊',
      color: 'from-green-500 to-green-600',
      category: 'SME Accounting',
      popularity: 'Popular in India',
      features: [
        'Direct trial balance import',
        'Chart of accounts sync',
        'Multi-company support',
        'GST compliance'
      ],
      benefits: [
        'Quick setup (5 minutes)',
        'Works with Tally 9 & Prime',
        'Local network connectivity',
        'No cloud dependency'
      ],
      connectionFields: [
        { name: 'host', label: 'Host/IP Address', type: 'text', placeholder: 'localhost or 192.168.1.100', helpText: 'Where Tally is running' },
        { name: 'port', label: 'Port', type: 'number', placeholder: '9000', helpText: 'Tally ODBC server port' },
        { name: 'company_name', label: 'Company Name', type: 'text', placeholder: 'ABC Pvt Ltd', helpText: 'Exact name in Tally' }
      ],
      authType: 'none',
      setupGuide: [
        'Enable ODBC Server in Tally (F12 > Advanced)',
        'Note the IP address and port number',
        'Ensure company is loaded in Tally',
        'Allow network access through firewall'
      ]
    },
    quickbooks: {
      id: 'quickbooks',
      name: 'QuickBooks Online',
      description: 'Cloud accounting for small to mid-size businesses',
      shortDesc: 'Popular SMB cloud accounting',
      logo: '💼',
      color: 'from-emerald-500 to-emerald-600',
      category: 'SMB Accounting',
      popularity: 'Popular Worldwide',
      features: [
        'Trial balance export',
        'Account classification',
        'Multi-currency support',
        'Incremental updates'
      ],
      benefits: [
        'OAuth 2.0 secure connection',
        'Works with QBO and Desktop',
        'Automatic sync scheduling',
        'Multi-entity support'
      ],
      connectionFields: [
        { name: 'realm_id', label: 'Company ID', type: 'text', placeholder: 'Realm ID from QuickBooks', helpText: 'Found in company settings' },
        { name: 'environment', label: 'Environment', type: 'select', options: ['production', 'sandbox'], helpText: 'Select environment' }
      ],
      authType: 'oauth2',
      credentialFields: [
        { name: 'client_id', label: 'Client ID', type: 'text', placeholder: 'From QuickBooks Developer', helpText: 'OAuth Client ID' },
        { name: 'client_secret', label: 'Client Secret', type: 'password', placeholder: '••••••••', helpText: 'OAuth Client Secret' }
      ],
      setupGuide: [
        'Create app in QuickBooks Developer Portal',
        'Get OAuth 2.0 credentials (Client ID/Secret)',
        'Authorize CLOE to access your QuickBooks',
        'Select company to sync'
      ]
    }
  };

  const [formData, setFormData] = useState({
    erp_system: '',
    integration_name: '',
    description: '',
    connection_config: {},
    credentials: {},
    auth_type: '',
    auto_sync_enabled: false,
    sync_frequency: 'manual',
    sync_trial_balance: true,
    sync_chart_of_accounts: true,
    sync_exchange_rates: false
  });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      const data = await response.json();
      setIntegrations(data || []);

      // Auto-switch to my integrations if user has any
      if (data && data.length > 0) {
        setView('my-integrations');
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncHistory = async (integrationId) => {
    try {
      const response = await fetch(`/api/integrations/sync?integration_id=${integrationId}&limit=10`);
      const data = await response.json();
      setSyncHistory(data || []);
    } catch (error) {
      console.error('Error fetching sync history:', error);
      setSyncHistory([]);
    }
  };

  const handleStartIntegration = (erpId) => {
    const template = erpTemplates[erpId];
    setSelectedErp(template);
    setFormData({
      erp_system: erpId,
      integration_name: template.name,
      description: template.description,
      connection_config: {},
      credentials: {},
      auth_type: template.authType,
      auto_sync_enabled: false,
      sync_frequency: 'manual',
      sync_trial_balance: true,
      sync_chart_of_accounts: true,
      sync_exchange_rates: false
    });
    setConfigStep(1);
    setShowConfigModal(true);
  };

  const handleEditIntegration = (integration) => {
    const template = erpTemplates[integration.erp_system];
    setSelectedErp(template);
    setFormData({
      ...integration,
      connection_config: integration.connection_config || {},
      credentials: integration.credentials || {}
    });
    setSelectedIntegration(integration);
    setConfigStep(1);
    setShowConfigModal(true);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await fetch('/api/integrations/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_id: selectedIntegration?.id,
          erp_system: formData.erp_system,
          connection_config: formData.connection_config,
          credentials: formData.credentials
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✓ Connection successful!\n\n${result.message}\n\nYou can now proceed to configure sync settings.`);
        setConfigStep(2);
      } else {
        alert(`✗ Connection failed\n\n${result.error}\n\nPlease check your credentials and try again.`);
      }
    } catch (error) {
      alert(`✗ Connection test failed\n\n${error.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveIntegration = async () => {
    try {
      const method = selectedIntegration ? 'PUT' : 'POST';
      const body = selectedIntegration
        ? { id: selectedIntegration.id, ...formData }
        : formData;

      const response = await fetch('/api/integrations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Failed to save integration');

      await fetchIntegrations();
      setShowConfigModal(false);
      setView('my-integrations');
      alert('✓ Integration configured successfully!\n\nYou can now sync your financial data.');
    } catch (error) {
      alert(`✗ Error saving integration: ${error.message}`);
    }
  };

  const handleTriggerSync = async (integrationId, syncType = 'full') => {
    setSyncingNow({ ...syncingNow, [integrationId]: true });
    try {
      const response = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_id: integrationId,
          sync_type: syncType,
          triggered_by: 'manual'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✓ Sync started!\n\nSync ID: ${result.sync_id}\n\nCheck sync history for progress.`);
        setTimeout(() => {
          fetchIntegrations();
          setSyncingNow({ ...syncingNow, [integrationId]: false });
        }, 3000);
      }
    } catch (error) {
      alert(`✗ Sync failed: ${error.message}`);
      setSyncingNow({ ...syncingNow, [integrationId]: false });
    }
  };

  const handleDeleteIntegration = async (integrationId) => {
    if (!confirm('Are you sure you want to delete this integration?\n\nThis will remove the connection but not delete any synced data.\n\nThis action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/integrations?id=${integrationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete integration');

      await fetchIntegrations();

      // Switch to marketplace if no integrations left
      const updatedIntegrations = integrations.filter(i => i.id !== integrationId);
      if (updatedIntegrations.length === 0) {
        setView('marketplace');
      }

      alert('✓ Integration deleted successfully');
    } catch (error) {
      alert(`✗ Error deleting integration: ${error.message}`);
    }
  };

  const handleViewSyncHistory = async (integration) => {
    setSelectedIntegration(integration);
    await fetchSyncHistory(integration.id);
    setShowSyncHistoryModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      connected: { label: 'Connected', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
      configured: { label: 'Configured', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Wifi },
      not_configured: { label: 'Setup Required', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle },
      disconnected: { label: 'Disconnected', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: WifiOff },
      error: { label: 'Error', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
    };
    const badge = badges[status] || badges.not_configured;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  const getSyncStatusBadge = (status) => {
    const badges = {
      completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
      in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
      failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
      pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: Clock },
      partial: { label: 'Partial', color: 'bg-amber-100 text-amber-700', icon: AlertCircle }
    };
    const badge = badges[status] || badges.pending;
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
        title="ERP Integrations"
        subtitle="Connect your ERP systems to automate financial data consolidation"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">

          {/* View Tabs */}
          <div className="mb-8 flex items-center gap-4 border-b border-slate-200">
            <button
              onClick={() => setView('marketplace')}
              className={`px-6 py-3 font-medium transition-all ${
                view === 'marketplace'
                  ? 'text-[#101828] border-b-2 border-[#101828]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database size={18} />
                Available Integrations
              </div>
            </button>

            <button
              onClick={() => setView('my-integrations')}
              className={`px-6 py-3 font-medium transition-all ${
                view === 'my-integrations'
                  ? 'text-[#101828] border-b-2 border-[#101828]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap size={18} />
                My Integrations
                {integrations.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {integrations.length}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Marketplace View */}
          {view === 'marketplace' && (
            <div className="space-y-8">

              {/* Hero Section */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold mb-3">Automate Your Financial Consolidation</h2>
                  <p className="text-blue-100 text-lg mb-6">
                    Connect your ERP systems to CLOE and eliminate manual data entry. Sync trial balances,
                    chart of accounts, and exchange rates automatically.
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="text-blue-200" size={20} />
                      <span>Bank-grade security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="text-blue-200" size={20} />
                      <span>Real-time sync</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-blue-200" size={20} />
                      <span>IFRS compliant</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ERP Cards */}
              <div>
                <h3 className="text-2xl font-bold text-[#101828] mb-6">Choose Your ERP System</h3>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(erpTemplates).map(([erpId, erp]) => {
                    const isConfigured = integrations.some(i => i.erp_system === erpId);

                    return (
                      <div
                        key={erpId}
                        className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-lg ${
                          isConfigured
                            ? 'border-green-200 bg-green-50/30'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className={`text-4xl w-16 h-16 rounded-xl bg-gradient-to-br ${erp.color} flex items-center justify-center shadow-lg`}>
                                <span className="text-3xl">{erp.logo}</span>
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-[#101828]">{erp.name}</h4>
                                <p className="text-sm text-slate-600">{erp.shortDesc}</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                              {erp.popularity}
                            </span>
                          </div>

                          <p className="text-sm text-slate-600 mb-4">{erp.description}</p>

                          {/* Features */}
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-slate-700 mb-2">KEY FEATURES:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {erp.features.slice(0, 4).map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                                  <Check size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Benefits */}
                          <div className="mb-6 p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs font-semibold text-slate-700 mb-2">WHY INTEGRATE?</p>
                            <ul className="space-y-1">
                              {erp.benefits.slice(0, 2).map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                                  <BarChart3 size={12} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* CTA Button */}
                          {isConfigured ? (
                            <button
                              onClick={() => {
                                setView('my-integrations');
                              }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              <CheckCircle2 size={18} />
                              View Integration
                              <ArrowRight size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartIntegration(erpId)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-medium"
                            >
                              <Plus size={18} />
                              Connect {erp.name}
                              <ArrowRight size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* My Integrations View */}
          {view === 'my-integrations' && (
            <div className="space-y-6">

              {integrations.length === 0 ? (
                // Empty State
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                    <Database className="text-slate-400" size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#101828] mb-2">No Integrations Yet</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Connect your first ERP system to start automating your financial consolidation workflow.
                  </p>
                  <button
                    onClick={() => setView('marketplace')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-medium"
                  >
                    <Plus size={20} />
                    Browse Available Integrations
                  </button>
                </div>
              ) : (
                <>
                  {/* Statistics */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Database className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Active Integrations</p>
                          <p className="text-2xl font-bold text-[#101828]">{integrations.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Wifi className="text-green-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Connected</p>
                          <p className="text-2xl font-bold text-[#101828]">
                            {integrations.filter(i => i.status === 'connected').length}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Activity className="text-purple-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Auto-Sync</p>
                          <p className="text-2xl font-bold text-[#101828]">
                            {integrations.filter(i => i.auto_sync_enabled).length}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <TrendingUp className="text-amber-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Total Syncs</p>
                          <p className="text-2xl font-bold text-[#101828]">
                            {integrations.reduce((acc, i) => acc + (i.statistics?.total_syncs || 0), 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Integration Cards */}
                  <div className="space-y-4">
                    {integrations.map((integration) => {
                      const template = erpTemplates[integration.erp_system];
                      const isExpanded = expandedCard === integration.id;

                      return (
                        <div
                          key={integration.id}
                          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all"
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <div className={`text-3xl w-14 h-14 rounded-lg bg-gradient-to-br ${template?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center shadow`}>
                                  <span className="text-2xl">{template?.logo || '📊'}</span>
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-[#101828] mb-1">
                                    {integration.integration_name}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    {getStatusBadge(integration.status)}
                                    {integration.auto_sync_enabled && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                        <RefreshCw size={12} />
                                        Auto-sync: {integration.sync_frequency}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => setExpandedCard(isExpanded ? null : integration.id)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </button>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-4 gap-3 mb-4">
                              <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-600 mb-1">Total</p>
                                <p className="text-lg font-bold text-[#101828]">
                                  {integration.statistics?.total_syncs || 0}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                                <p className="text-xs text-slate-600 mb-1">Success</p>
                                <p className="text-lg font-bold text-green-700">
                                  {integration.statistics?.successful_syncs || 0}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                                <p className="text-xs text-slate-600 mb-1">Failed</p>
                                <p className="text-lg font-bold text-red-700">
                                  {integration.statistics?.failed_syncs || 0}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-xs text-slate-600 mb-1">Avg Time</p>
                                <p className="text-lg font-bold text-blue-700">
                                  {integration.statistics?.avg_duration_seconds
                                    ? `${Math.round(integration.statistics.avg_duration_seconds)}s`
                                    : '-'}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleTriggerSync(integration.id, 'full')}
                                disabled={syncingNow[integration.id]}
                                className="flex items-center gap-2 px-4 py-2 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-medium disabled:opacity-50"
                              >
                                {syncingNow[integration.id] ? (
                                  <>
                                    <RefreshCw size={16} className="animate-spin" />
                                    Syncing...
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle size={16} />
                                    Sync Now
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleEditIntegration(integration)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                              >
                                <Settings size={16} />
                                Settings
                              </button>

                              <button
                                onClick={() => handleViewSyncHistory(integration)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                              >
                                <Calendar size={16} />
                                History
                              </button>

                              <button
                                onClick={() => handleDeleteIntegration(integration.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium ml-auto"
                              >
                                <Trash2 size={16} />
                                Remove
                              </button>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="border-t border-slate-200 bg-slate-50 p-6">
                              <h5 className="font-bold text-[#101828] mb-4 flex items-center gap-2">
                                <FileText size={18} />
                                Recent Sync Activity
                              </h5>
                              {integration.recent_syncs && integration.recent_syncs.length > 0 ? (
                                <div className="space-y-2">
                                  {integration.recent_syncs.map((sync) => (
                                    <div
                                      key={sync.id}
                                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200"
                                    >
                                      <div className="flex items-center gap-3">
                                        {getSyncStatusBadge(sync.sync_status)}
                                        <span className="text-sm font-medium text-slate-700">
                                          {sync.sync_type.replace('_', ' ').toUpperCase()}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-4 text-sm text-slate-600">
                                        <span className="font-medium">{sync.records_imported || 0} records</span>
                                        <span>{sync.duration_seconds || 0}s</span>
                                        <span className="text-xs">
                                          {new Date(sync.triggered_at).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-slate-500">
                                  <Clock className="mx-auto mb-2" size={32} />
                                  <p className="text-sm">No sync history available yet</p>
                                  <p className="text-xs mt-1">Click "Sync Now" to start your first sync</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Another Integration */}
                  <button
                    onClick={() => setView('marketplace')}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-dashed border-slate-300 text-slate-600 rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium"
                  >
                    <Plus size={20} />
                    Add Another Integration
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedErp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className={`sticky top-0 bg-gradient-to-r ${selectedErp.color} text-white p-6 z-10`}>
              <div className="flex items-center gap-4 mb-3">
                <div className="text-4xl w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <span className="text-3xl">{selectedErp.logo}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedIntegration ? 'Edit' : 'Connect'} {selectedErp.name}
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    {selectedErp.shortDesc}
                  </p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-4">
                {[
                  { num: 1, label: 'Connection' },
                  { num: 2, label: 'Sync Settings' },
                  { num: 3, label: 'Review' }
                ].map((step) => (
                  <div key={step.num} className="flex items-center flex-1">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                          configStep >= step.num
                            ? 'bg-white text-blue-600'
                            : 'bg-white/20 text-white/60'
                        }`}
                      >
                        {configStep > step.num ? <Check size={16} /> : step.num}
                      </div>
                      <span className={`text-sm font-medium ${
                        configStep >= step.num ? 'text-white' : 'text-white/60'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {step.num < 3 && (
                      <div className={`h-0.5 flex-1 mx-2 ${
                        configStep > step.num ? 'bg-white' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* Step 1: Connection */}
              {configStep === 1 && (
                <>
                  {/* Setup Guide */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <FileText size={16} />
                      Setup Checklist
                    </h4>
                    <ol className="space-y-1 text-sm text-blue-800 list-decimal list-inside">
                      {selectedErp.setupGuide.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Basic Info */}
                  <div>
                    <h3 className="font-bold text-[#101828] mb-3">Integration Name</h3>
                    <input
                      type="text"
                      value={formData.integration_name}
                      onChange={(e) => setFormData({ ...formData, integration_name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828] font-medium"
                      placeholder={`My ${selectedErp.name} Integration`}
                    />
                  </div>

                  {/* Connection Settings */}
                  <div>
                    <h3 className="font-bold text-[#101828] mb-3">Connection Details</h3>
                    <div className="space-y-4">
                      {selectedErp.connectionFields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            {field.label}
                          </label>
                          {field.type === 'select' ? (
                            <select
                              value={formData.connection_config[field.name] || ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  connection_config: {
                                    ...formData.connection_config,
                                    [field.name]: e.target.value
                                  }
                                })
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828]"
                            >
                              <option value="">Select {field.label}</option>
                              {field.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              placeholder={field.placeholder}
                              value={formData.connection_config[field.name] || ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  connection_config: {
                                    ...formData.connection_config,
                                    [field.name]: e.target.value
                                  }
                                })
                              }
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828]"
                            />
                          )}
                          {field.helpText && (
                            <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Authentication */}
                  {selectedErp.authType !== 'none' && (
                    <div>
                      <h3 className="font-bold text-[#101828] mb-3">Authentication</h3>
                      <div className="space-y-4">
                        {selectedErp.authType === 'basic' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Username
                              </label>
                              <input
                                type="text"
                                value={formData.credentials.username || ''}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    credentials: { ...formData.credentials, username: e.target.value }
                                  })
                                }
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828]"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                              </label>
                              <input
                                type="password"
                                value={formData.credentials.password || ''}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    credentials: { ...formData.credentials, password: e.target.value }
                                  })
                                }
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828]"
                              />
                            </div>
                          </>
                        )}
                        {selectedErp.authType === 'token_based' && selectedErp.credentialFields && (
                          <>
                            {selectedErp.credentialFields.map((field) => (
                              <div key={field.name}>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  {field.label}
                                </label>
                                <input
                                  type={field.type}
                                  placeholder={field.placeholder}
                                  value={formData.credentials[field.name] || ''}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      credentials: { ...formData.credentials, [field.name]: e.target.value }
                                    })
                                  }
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828]"
                                />
                                {field.helpText && (
                                  <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
                                )}
                              </div>
                            ))}
                          </>
                        )}
                        {selectedErp.authType === 'oauth2' && selectedErp.credentialFields && (
                          <>
                            {selectedErp.credentialFields.map((field) => (
                              <div key={field.name}>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  {field.label}
                                </label>
                                <input
                                  type={field.type}
                                  placeholder={field.placeholder}
                                  value={formData.credentials[field.name] || ''}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      credentials: { ...formData.credentials, [field.name]: e.target.value }
                                    })
                                  }
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828]"
                                />
                                {field.helpText && (
                                  <p className="text-xs text-slate-500 mt-1">{field.helpText}</p>
                                )}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Step 2: Sync Settings */}
              {configStep === 2 && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 size={20} />
                      <span className="font-medium">Connection Successful!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Configure what data to sync and how often.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#101828] mb-3">What to Sync</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.sync_trial_balance}
                          onChange={(e) =>
                            setFormData({ ...formData, sync_trial_balance: e.target.checked })
                          }
                          className="w-5 h-5"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">Trial Balance</p>
                          <p className="text-xs text-slate-600">Sync account balances by period</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.sync_chart_of_accounts}
                          onChange={(e) =>
                            setFormData({ ...formData, sync_chart_of_accounts: e.target.checked })
                          }
                          className="w-5 h-5"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">Chart of Accounts</p>
                          <p className="text-xs text-slate-600">Sync GL account master data</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.sync_exchange_rates}
                          onChange={(e) =>
                            setFormData({ ...formData, sync_exchange_rates: e.target.checked })
                          }
                          className="w-5 h-5"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">Exchange Rates</p>
                          <p className="text-xs text-slate-600">Sync currency exchange rates</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#101828] mb-3">Sync Frequency</h3>
                    <label className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={formData.auto_sync_enabled}
                        onChange={(e) =>
                          setFormData({ ...formData, auto_sync_enabled: e.target.checked })
                        }
                        className="w-5 h-5"
                      />
                      <span className="font-medium text-slate-900">Enable automatic sync</span>
                    </label>

                    {formData.auto_sync_enabled && (
                      <select
                        value={formData.sync_frequency}
                        onChange={(e) => setFormData({ ...formData, sync_frequency: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828]"
                      >
                        <option value="hourly">Every Hour</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    )}
                  </div>
                </>
              )}

              {/* Step 3: Review */}
              {configStep === 3 && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2">Review Your Configuration</h4>
                    <p className="text-sm text-blue-800">
                      Please review your settings before saving.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-600 mb-1">Integration Name</p>
                      <p className="text-lg font-bold text-[#101828]">{formData.integration_name}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-600 mb-2">Data to Sync</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.sync_trial_balance && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            ✓ Trial Balance
                          </span>
                        )}
                        {formData.sync_chart_of_accounts && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            ✓ Chart of Accounts
                          </span>
                        )}
                        {formData.sync_exchange_rates && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            ✓ Exchange Rates
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-600 mb-1">Sync Schedule</p>
                      <p className="text-lg font-bold text-[#101828]">
                        {formData.auto_sync_enabled
                          ? `Automatic (${formData.sync_frequency})`
                          : 'Manual only'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-slate-100 p-6 flex gap-3 border-t border-slate-200">
              {configStep === 1 && (
                <>
                  <button
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingConnection ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <Activity size={16} />
                        Test & Continue
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </>
              )}

              {configStep === 2 && (
                <>
                  <button
                    onClick={() => setConfigStep(3)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-medium"
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => setConfigStep(1)}
                    className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                </>
              )}

              {configStep === 3 && (
                <>
                  <button
                    onClick={handleSaveIntegration}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <CheckCircle2 size={16} />
                    Save Integration
                  </button>
                  <button
                    onClick={() => setConfigStep(2)}
                    className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="ml-auto px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sync History Modal */}
      {showSyncHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-[#101828] text-white p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText size={24} />
                Sync History
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                {selectedIntegration?.integration_name}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {syncHistory.length > 0 ? (
                <div className="space-y-4">
                  {syncHistory.map((sync) => (
                    <div
                      key={sync.id}
                      className="bg-slate-50 rounded-lg p-5 border border-slate-200 hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            {getSyncStatusBadge(sync.sync_status)}
                            <span className="font-bold text-[#101828] text-lg">
                              {sync.sync_type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            Triggered by: {sync.triggered_by} • {new Date(sync.triggered_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-700">
                            Duration: {sync.duration_seconds || 0}s
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">Fetched</p>
                          <p className="text-xl font-bold text-[#101828]">{sync.records_fetched || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-green-200">
                          <p className="text-xs text-slate-600 mb-1">Imported</p>
                          <p className="text-xl font-bold text-green-700">{sync.records_imported || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-200">
                          <p className="text-xs text-slate-600 mb-1">Updated</p>
                          <p className="text-xl font-bold text-blue-700">{sync.records_updated || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-red-200">
                          <p className="text-xs text-slate-600 mb-1">Failed</p>
                          <p className="text-xl font-bold text-red-700">{sync.records_failed || 0}</p>
                        </div>
                      </div>

                      {sync.error_message && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs font-medium text-red-700 mb-1">Error:</p>
                          <p className="text-sm text-red-600">{sync.error_message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Calendar className="mx-auto text-slate-300 mb-3" size={64} />
                  <p className="text-lg font-medium text-slate-600">No sync history available</p>
                  <p className="text-sm text-slate-500 mt-1">Sync operations will appear here</p>
                </div>
              )}
            </div>

            <div className="bg-slate-100 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowSyncHistoryModal(false)}
                className="px-6 py-3 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

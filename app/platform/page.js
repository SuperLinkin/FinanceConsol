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
  Edit2,
  Activity,
  TrendingUp,
  XCircle,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Calendar,
  Download
} from 'lucide-react';

export default function IntegrationsHub() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSyncHistoryModal, setShowSyncHistoryModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [syncHistory, setSyncHistory] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingNow, setSyncingNow] = useState({});

  // ERP system templates
  const erpTemplates = {
    tally: {
      name: 'Tally ERP',
      description: 'Connect with Tally ERP 9 and Tally Prime for seamless financial data sync',
      features: [
        'Direct trial balance import',
        'Chart of accounts sync',
        'Multi-company support',
        'Real-time data updates'
      ],
      connectionFields: [
        { name: 'host', label: 'Host/IP Address', type: 'text', placeholder: 'localhost or 192.168.1.100' },
        { name: 'port', label: 'Port', type: 'number', placeholder: '9000' },
        { name: 'company_name', label: 'Company Name in Tally', type: 'text', placeholder: 'ABC Pvt Ltd' }
      ],
      authType: 'none'
    },
    sap: {
      name: 'SAP',
      description: 'Integrate with SAP S/4HANA and SAP ECC for enterprise financial consolidation',
      features: [
        'GL account extraction',
        'Multi-entity support',
        'Automated data mapping',
        'Currency translation'
      ],
      connectionFields: [
        { name: 'system_id', label: 'System ID', type: 'text', placeholder: 'PRD' },
        { name: 'client', label: 'Client', type: 'text', placeholder: '100' },
        { name: 'host', label: 'Host', type: 'text', placeholder: 'sap.company.com' },
        { name: 'language', label: 'Language', type: 'text', placeholder: 'EN' }
      ],
      authType: 'basic'
    },
    netsuite: {
      name: 'Oracle NetSuite',
      description: 'Connect NetSuite cloud ERP for comprehensive financial data integration',
      features: [
        'Subsidiary consolidation',
        'Automated journal entries',
        'Custom segment mapping',
        'Scheduled sync'
      ],
      connectionFields: [
        { name: 'account_id', label: 'Account ID', type: 'text', placeholder: '1234567' },
        { name: 'realm', label: 'Realm', type: 'select', options: ['production', 'sandbox'] }
      ],
      authType: 'token_based',
      credentialFields: [
        { name: 'consumer_key', label: 'Consumer Key', type: 'text', placeholder: 'Your Consumer Key from Integration Record' },
        { name: 'consumer_secret', label: 'Consumer Secret', type: 'password', placeholder: 'Your Consumer Secret' },
        { name: 'token_id', label: 'Token ID', type: 'text', placeholder: 'Your Token ID' },
        { name: 'token_secret', label: 'Token Secret', type: 'password', placeholder: 'Your Token Secret' }
      ]
    },
    quickbooks: {
      name: 'QuickBooks',
      description: 'Integrate QuickBooks Online and Desktop for small to mid-size businesses',
      features: [
        'Trial balance export',
        'Account classification',
        'Multi-currency support',
        'Incremental updates'
      ],
      connectionFields: [
        { name: 'realm_id', label: 'Realm ID', type: 'text', placeholder: 'Company ID' },
        { name: 'environment', label: 'Environment', type: 'select', options: ['production', 'sandbox'] }
      ],
      authType: 'oauth2'
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

  const handleConfigureIntegration = (erpSystem, existingIntegration = null) => {
    if (existingIntegration) {
      setFormData({
        ...existingIntegration,
        connection_config: existingIntegration.connection_config || {},
        credentials: existingIntegration.credentials || {}
      });
      setSelectedIntegration(existingIntegration);
    } else {
      const template = erpTemplates[erpSystem];
      setFormData({
        erp_system: erpSystem,
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
      setSelectedIntegration(null);
    }
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
        alert(`✓ Connection successful!\n\n${result.message}`);
      } else {
        alert(`✗ Connection failed\n\n${result.error}`);
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
      alert('✓ Integration saved successfully!');
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
        alert(`✓ Sync started!\n\nSync ID: ${result.sync_id}`);
        // Refresh integrations after a short delay
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
    if (!confirm('Are you sure you want to delete this integration? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/integrations?id=${integrationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete integration');

      await fetchIntegrations();
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
      connected: { label: 'Connected', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
      configured: { label: 'Configured', color: 'bg-blue-100 text-blue-700', icon: Wifi },
      not_configured: { label: 'Not Configured', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
      disconnected: { label: 'Disconnected', color: 'bg-amber-100 text-amber-700', icon: WifiOff },
      error: { label: 'Error', color: 'bg-red-100 text-red-700', icon: XCircle }
    };
    const badge = badges[status] || badges.not_configured;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon size={12} />
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

  // Get existing integrations by ERP system
  const existingIntegrationsByErp = integrations.reduce((acc, integration) => {
    acc[integration.erp_system] = integration;
    return acc;
  }, {});

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        title="Integrations Hub"
        subtitle="Connect your ERP systems and manage data flow into CLOE"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 space-y-8">

          {/* Statistics Cards */}
          {integrations.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Database className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Integrations</p>
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
                    <p className="text-sm text-slate-600">Auto-Sync Enabled</p>
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
                    <p className="text-sm text-slate-600">Last 24h Syncs</p>
                    <p className="text-2xl font-bold text-[#101828]">
                      {integrations.reduce((acc, i) => acc + (i.statistics?.total_syncs || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Integrations */}
          {integrations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Activity className="text-[#101828]" size={24} />
                  <h3 className="text-2xl font-bold text-[#101828]">Active Integrations</h3>
                </div>
              </div>

              <div className="space-y-4">
                {integrations.map((integration) => {
                  const template = erpTemplates[integration.erp_system];
                  const isExpanded = expandedCard === integration.id;

                  return (
                    <div
                      key={integration.id}
                      className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
                    >
                      {/* Main Card */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Database className="text-slate-600" size={32} />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-[#101828] mb-1">
                                {integration.integration_name}
                              </h4>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(integration.status)}
                                {integration.auto_sync_enabled && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                    <RefreshCw size={12} />
                                    Auto-sync
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

                        <p className="text-sm text-slate-600 mb-4">{integration.description}</p>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-600 mb-1">Total Syncs</p>
                            <p className="text-lg font-bold text-[#101828]">
                              {integration.statistics?.total_syncs || 0}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-slate-600 mb-1">Successful</p>
                            <p className="text-lg font-bold text-green-700">
                              {integration.statistics?.successful_syncs || 0}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <p className="text-xs text-slate-600 mb-1">Failed</p>
                            <p className="text-lg font-bold text-red-700">
                              {integration.statistics?.failed_syncs || 0}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-slate-600 mb-1">Avg Duration</p>
                            <p className="text-lg font-bold text-blue-700">
                              {integration.statistics?.avg_duration_seconds
                                ? `${Math.round(integration.statistics.avg_duration_seconds)}s`
                                : '-'}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
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
                            onClick={() => handleConfigureIntegration(integration.erp_system, integration)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                          >
                            <Settings size={16} />
                            Configure
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
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-slate-50 p-6">
                          <h5 className="font-bold text-[#101828] mb-4">Recent Sync Activity</h5>
                          {integration.recent_syncs && integration.recent_syncs.length > 0 ? (
                            <div className="space-y-2">
                              {integration.recent_syncs.map((sync) => (
                                <div
                                  key={sync.id}
                                  className="flex items-center justify-between bg-white p-3 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    {getSyncStatusBadge(sync.sync_status)}
                                    <span className="text-sm text-slate-600">
                                      {sync.sync_type.replace('_', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <span>{sync.records_imported || 0} records</span>
                                    <span>{sync.duration_seconds || 0}s</span>
                                    <span>
                                      {new Date(sync.triggered_at).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">No sync history available</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available ERP Integrations */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Database className="text-[#101828]" size={24} />
              <h3 className="text-2xl font-bold text-[#101828]">
                {integrations.length > 0 ? 'Add More Integrations' : 'Available ERP Integrations'}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(erpTemplates).map(([erpId, erp]) => {
                const existing = existingIntegrationsByErp[erpId];

                return (
                  <div
                    key={erpId}
                    className={`bg-white rounded-lg shadow-sm border p-6 transition-all ${
                      existing
                        ? 'border-green-300 bg-green-50/30'
                        : 'border-slate-200 hover:shadow-md cursor-pointer'
                    }`}
                    onClick={() => !existing && handleConfigureIntegration(erpId)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Database className="text-slate-600" size={32} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-[#101828] mb-1">{erp.name}</h4>
                          {existing ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle2 size={12} />
                              Configured
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              Available
                            </span>
                          )}
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

                    {!existing && (
                      <button
                        onClick={() => handleConfigureIntegration(erpId)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-medium"
                      >
                        <Link2 size={16} />
                        Configure Integration
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#101828] text-white p-6">
              <h2 className="text-2xl font-bold">
                {selectedIntegration ? 'Edit' : 'Configure'} {erpTemplates[formData.erp_system]?.name} Integration
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Set up connection details and sync preferences
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-bold text-[#101828] mb-3">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Integration Name
                    </label>
                    <input
                      type="text"
                      value={formData.integration_name}
                      onChange={(e) => setFormData({ ...formData, integration_name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828]"
                    />
                  </div>
                </div>
              </div>

              {/* Connection Settings */}
              <div>
                <h3 className="font-bold text-[#101828] mb-3">Connection Settings</h3>
                <div className="space-y-4">
                  {erpTemplates[formData.erp_system]?.connectionFields.map((field) => (
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Authentication */}
              {formData.auth_type !== 'none' && (
                <div>
                  <h3 className="font-bold text-[#101828] mb-3">Authentication</h3>
                  <div className="space-y-4">
                    {formData.auth_type === 'basic' && (
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
                    {formData.auth_type === 'token_based' && erpTemplates[formData.erp_system]?.credentialFields && (
                      <>
                        {erpTemplates[formData.erp_system].credentialFields.map((field) => (
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
                          </div>
                        ))}
                      </>
                    )}
                    {formData.auth_type === 'oauth2' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Client ID
                          </label>
                          <input
                            type="text"
                            value={formData.credentials.client_id || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                credentials: { ...formData.credentials, client_id: e.target.value }
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Client Secret
                          </label>
                          <input
                            type="password"
                            value={formData.credentials.client_secret || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                credentials: { ...formData.credentials, client_secret: e.target.value }
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828]"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Sync Settings */}
              <div>
                <h3 className="font-bold text-[#101828] mb-3">Sync Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="auto_sync"
                      checked={formData.auto_sync_enabled}
                      onChange={(e) =>
                        setFormData({ ...formData, auto_sync_enabled: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <label htmlFor="auto_sync" className="text-sm font-medium text-slate-700">
                      Enable automatic sync
                    </label>
                  </div>

                  {formData.auto_sync_enabled && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Sync Frequency
                      </label>
                      <select
                        value={formData.sync_frequency}
                        onChange={(e) => setFormData({ ...formData, sync_frequency: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828]"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Sync Options:</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="sync_tb"
                        checked={formData.sync_trial_balance}
                        onChange={(e) =>
                          setFormData({ ...formData, sync_trial_balance: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <label htmlFor="sync_tb" className="text-sm text-slate-700">
                        Trial Balance
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="sync_coa"
                        checked={formData.sync_chart_of_accounts}
                        onChange={(e) =>
                          setFormData({ ...formData, sync_chart_of_accounts: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <label htmlFor="sync_coa" className="text-sm text-slate-700">
                        Chart of Accounts
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="sync_rates"
                        checked={formData.sync_exchange_rates}
                        onChange={(e) =>
                          setFormData({ ...formData, sync_exchange_rates: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <label htmlFor="sync_rates" className="text-sm text-slate-700">
                        Exchange Rates
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-100 p-6 flex gap-3">
              <button
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
              >
                {testingConnection ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Activity size={16} />
                    Test Connection
                  </>
                )}
              </button>

              <button
                onClick={handleSaveIntegration}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-medium"
              >
                <CheckCircle2 size={16} />
                Save Integration
              </button>

              <button
                onClick={() => setShowConfigModal(false)}
                className="ml-auto px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync History Modal */}
      {showSyncHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-[#101828] text-white p-6">
              <h2 className="text-2xl font-bold">Sync History</h2>
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
                      className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            {getSyncStatusBadge(sync.sync_status)}
                            <span className="font-medium text-[#101828]">
                              {sync.sync_type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
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
                        <div className="bg-white p-3 rounded border border-slate-200">
                          <p className="text-xs text-slate-600">Fetched</p>
                          <p className="text-lg font-bold text-[#101828]">{sync.records_fetched || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-slate-200">
                          <p className="text-xs text-slate-600">Imported</p>
                          <p className="text-lg font-bold text-green-700">{sync.records_imported || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-slate-200">
                          <p className="text-xs text-slate-600">Updated</p>
                          <p className="text-lg font-bold text-blue-700">{sync.records_updated || 0}</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-slate-200">
                          <p className="text-xs text-slate-600">Failed</p>
                          <p className="text-lg font-bold text-red-700">{sync.records_failed || 0}</p>
                        </div>
                      </div>

                      {sync.error_message && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-xs font-medium text-red-700 mb-1">Error:</p>
                          <p className="text-sm text-red-600">{sync.error_message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
                  <p className="text-slate-500">No sync history available</p>
                </div>
              )}
            </div>

            <div className="bg-slate-100 p-6">
              <button
                onClick={() => setShowSyncHistoryModal(false)}
                className="px-6 py-2.5 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-medium"
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

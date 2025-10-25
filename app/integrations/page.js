'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Plus, Edit2, Trash2, Database, CheckCircle, XCircle, AlertCircle,
  Eye, EyeOff, RefreshCw, Settings, Link, Unlink, Save, X
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const ERP_SYSTEMS = [
  { value: 'netsuite', label: 'Oracle NetSuite', icon: '☁️' },
  { value: 'sap', label: 'SAP', icon: '🔷' },
  { value: 'tally', label: 'Tally ERP', icon: '📊' },
  { value: 'quickbooks', label: 'QuickBooks', icon: '💚' },
  { value: 'oracle', label: 'Oracle EBS', icon: '🔴' },
  { value: 'dynamics', label: 'Microsoft Dynamics 365', icon: '🔵' },
  { value: 'sage', label: 'Sage Intacct', icon: '🟢' }
];

const STATUS_COLORS = {
  'not_configured': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Not Configured' },
  'configured': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Configured' },
  'connected': { bg: 'bg-green-100', text: 'text-green-700', label: 'Connected' },
  'disconnected': { bg: 'bg-red-100', text: 'text-red-700', label: 'Disconnected' },
  'error': { bg: 'bg-red-100', text: 'text-red-700', label: 'Error' }
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState({});

  const [form, setForm] = useState({
    erp_system: 'netsuite',
    integration_name: '',
    description: '',
    auth_type: 'token_based',
    account_id: '',
    consumer_key: '',
    consumer_secret: '',
    token_id: '',
    token_secret: '',
    realm: 'production',
    auto_sync_enabled: false,
    sync_trial_balance: true,
    sync_chart_of_accounts: true,
    sync_entities: true
  });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('erp_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      showToast('Error loading integrations', false);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (integration = null) => {
    if (integration) {
      setEditingIntegration(integration);

      // Decrypt and populate form (credentials will be masked)
      const credentials = integration.credentials || {};
      setForm({
        erp_system: integration.erp_system,
        integration_name: integration.integration_name,
        description: integration.description || '',
        auth_type: integration.auth_type || 'token_based',
        account_id: integration.connection_config?.account_id || '',
        consumer_key: credentials.consumer_key ? '••••••••' : '',
        consumer_secret: credentials.consumer_secret ? '••••••••' : '',
        token_id: credentials.token_id ? '••••••••' : '',
        token_secret: credentials.token_secret ? '••••••••' : '',
        realm: integration.connection_config?.realm || 'production',
        auto_sync_enabled: integration.auto_sync_enabled || false,
        sync_trial_balance: integration.sync_trial_balance !== false,
        sync_chart_of_accounts: integration.sync_chart_of_accounts !== false,
        sync_entities: integration.sync_entities || false
      });
    } else {
      setEditingIntegration(null);
      setForm({
        erp_system: 'netsuite',
        integration_name: '',
        description: '',
        auth_type: 'token_based',
        account_id: '',
        consumer_key: '',
        consumer_secret: '',
        token_id: '',
        token_secret: '',
        realm: 'production',
        auto_sync_enabled: false,
        sync_trial_balance: true,
        sync_chart_of_accounts: true,
        sync_entities: true
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!form.integration_name) {
        showToast('Integration name is required', false);
        return;
      }

      if (!form.account_id) {
        showToast('Account ID is required', false);
        return;
      }

      // Build connection config
      const connection_config = {
        account_id: form.account_id,
        realm: form.realm
      };

      // Build credentials (only include if not masked)
      const credentials = {};
      if (form.consumer_key && !form.consumer_key.includes('•')) {
        credentials.consumer_key = form.consumer_key;
      } else if (editingIntegration && editingIntegration.credentials?.consumer_key) {
        credentials.consumer_key = editingIntegration.credentials.consumer_key;
      }

      if (form.consumer_secret && !form.consumer_secret.includes('•')) {
        credentials.consumer_secret = form.consumer_secret;
      } else if (editingIntegration && editingIntegration.credentials?.consumer_secret) {
        credentials.consumer_secret = editingIntegration.credentials.consumer_secret;
      }

      if (form.token_id && !form.token_id.includes('•')) {
        credentials.token_id = form.token_id;
      } else if (editingIntegration && editingIntegration.credentials?.token_id) {
        credentials.token_id = editingIntegration.credentials.token_id;
      }

      if (form.token_secret && !form.token_secret.includes('•')) {
        credentials.token_secret = form.token_secret;
      } else if (editingIntegration && editingIntegration.credentials?.token_secret) {
        credentials.token_secret = editingIntegration.credentials.token_secret;
      }

      const integrationData = {
        erp_system: form.erp_system,
        integration_name: form.integration_name,
        description: form.description,
        auth_type: form.auth_type,
        connection_config,
        credentials,
        auto_sync_enabled: form.auto_sync_enabled,
        sync_trial_balance: form.sync_trial_balance,
        sync_chart_of_accounts: form.sync_chart_of_accounts,
        sync_entities: form.sync_entities,
        status: 'configured'
      };

      let error;
      if (editingIntegration) {
        ({ error } = await supabase
          .from('erp_integrations')
          .update(integrationData)
          .eq('id', editingIntegration.id));
      } else {
        ({ error } = await supabase
          .from('erp_integrations')
          .insert([integrationData]));
      }

      if (error) throw error;

      showToast(`Integration ${editingIntegration ? 'updated' : 'created'} successfully`, true);
      setShowModal(false);
      fetchIntegrations();
    } catch (error) {
      console.error('Error saving integration:', error);
      showToast('Error saving integration: ' + error.message, false);
    }
  };

  const handleTestConnection = async (integration) => {
    setTesting(true);
    try {
      const response = await fetch('/api/integrations/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integration_id: integration.id })
      });

      const result = await response.json();

      if (result.success) {
        // Update status
        await supabase
          .from('erp_integrations')
          .update({
            status: 'connected',
            last_connection_test: new Date().toISOString()
          })
          .eq('id', integration.id);

        showToast('Connection test successful!', true);
        fetchIntegrations();
      } else {
        await supabase
          .from('erp_integrations')
          .update({ status: 'error' })
          .eq('id', integration.id);

        showToast('Connection test failed: ' + result.error, false);
        fetchIntegrations();
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      showToast('Error testing connection: ' + error.message, false);
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async (integration) => {
    if (!confirm(`Delete integration "${integration.integration_name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('erp_integrations')
        .delete()
        .eq('id', integration.id);

      if (error) throw error;

      showToast('Integration deleted', true);
      fetchIntegrations();
    } catch (error) {
      console.error('Error deleting integration:', error);
      showToast('Error deleting integration: ' + error.message, false);
    }
  };

  const showToast = (message, success = true) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3000);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="text-[#101828] text-lg">Loading integrations...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        title="ERP Integrations"
        subtitle="Configure and manage your ERP system connections"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#101828]">Integration Configurations</h2>
              <p className="text-sm text-gray-600 mt-1">
                Connect your ERP system to sync trial balance, chart of accounts, and entities
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              <Plus size={20} />
              Add Integration
            </button>
          </div>

          {/* Integrations List */}
          {integrations.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <Database size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Integrations Yet</h3>
              <p className="text-gray-600 mb-6">
                Connect your first ERP system to start syncing data automatically
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                Add Your First Integration
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {integrations.map((integration) => {
                const erpSystem = ERP_SYSTEMS.find(s => s.value === integration.erp_system);
                const statusInfo = STATUS_COLORS[integration.status] || STATUS_COLORS['not_configured'];

                return (
                  <div
                    key={integration.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl">
                            {erpSystem?.icon || '🔌'}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {integration.integration_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {erpSystem?.label || integration.erp_system}
                              {integration.connection_config?.account_id && (
                                <> • Account: {integration.connection_config.account_id}</>
                              )}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {integration.description && (
                        <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                      )}

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {integration.sync_trial_balance && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                            Trial Balance
                          </span>
                        )}
                        {integration.sync_chart_of_accounts && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">
                            Chart of Accounts
                          </span>
                        )}
                        {integration.sync_entities && (
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">
                            Entities
                          </span>
                        )}
                        {integration.auto_sync_enabled && (
                          <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded">
                            Auto Sync
                          </span>
                        )}
                      </div>

                      {/* Last Connection Test */}
                      {integration.last_connection_test && (
                        <p className="text-xs text-gray-500 mb-4">
                          Last tested: {new Date(integration.last_connection_test).toLocaleString()}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleTestConnection(integration)}
                          disabled={testing}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        >
                          {testing ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <Link size={16} />
                          )}
                          Test Connection
                        </button>
                        <button
                          onClick={() => handleOpenModal(integration)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(integration)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editingIntegration ? 'Edit Integration' : 'Add New Integration'}
                </h2>
                <p className="text-slate-300 text-sm mt-1">
                  Configure your ERP system connection
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* ERP System */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ERP System *
                  </label>
                  <select
                    value={form.erp_system}
                    onChange={(e) => setForm({ ...form, erp_system: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    disabled={editingIntegration}
                  >
                    {ERP_SYSTEMS.map(system => (
                      <option key={system.value} value={system.value}>
                        {system.icon} {system.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Integration Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Integration Name *
                  </label>
                  <input
                    type="text"
                    value={form.integration_name}
                    onChange={(e) => setForm({ ...form, integration_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    placeholder="e.g., NetSuite Production"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    rows={2}
                    placeholder="Optional description"
                  />
                </div>

                {/* NetSuite Configuration */}
                {form.erp_system === 'netsuite' && (
                  <>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                      <h4 className="font-semibold text-blue-900 mb-2">NetSuite Token-Based Authentication</h4>
                      <p className="text-sm text-blue-800">
                        Get these credentials from NetSuite → Setup → Integration → Manage Integrations
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Account ID *
                        </label>
                        <input
                          type="text"
                          value={form.account_id}
                          onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                          placeholder="123456"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Realm
                        </label>
                        <select
                          value={form.realm}
                          onChange={(e) => setForm({ ...form, realm: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                        >
                          <option value="production">Production</option>
                          <option value="sandbox">Sandbox</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Consumer Key *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.consumer_key ? 'text' : 'password'}
                          value={form.consumer_key}
                          onChange={(e) => setForm({ ...form, consumer_key: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 font-mono"
                          placeholder="Enter consumer key"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('consumer_key')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword.consumer_key ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Consumer Secret *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.consumer_secret ? 'text' : 'password'}
                          value={form.consumer_secret}
                          onChange={(e) => setForm({ ...form, consumer_secret: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 font-mono"
                          placeholder="Enter consumer secret"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('consumer_secret')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword.consumer_secret ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Token ID *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.token_id ? 'text' : 'password'}
                          value={form.token_id}
                          onChange={(e) => setForm({ ...form, token_id: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 font-mono"
                          placeholder="Enter token ID"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('token_id')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword.token_id ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Token Secret *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword.token_secret ? 'text' : 'password'}
                          value={form.token_secret}
                          onChange={(e) => setForm({ ...form, token_secret: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 font-mono"
                          placeholder="Enter token secret"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('token_secret')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword.token_secret ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Sync Options */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-slate-900 mb-4">Sync Options</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.sync_trial_balance}
                        onChange={(e) => setForm({ ...form, sync_trial_balance: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="font-medium text-gray-700">Sync Trial Balance</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.sync_chart_of_accounts}
                        onChange={(e) => setForm({ ...form, sync_chart_of_accounts: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="font-medium text-gray-700">Sync Chart of Accounts</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.sync_entities}
                        onChange={(e) => setForm({ ...form, sync_entities: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="font-medium text-gray-700">Sync Entities/Subsidiaries</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={form.auto_sync_enabled}
                        onChange={(e) => setForm({ ...form, auto_sync_enabled: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="font-medium text-gray-700">Enable Auto Sync (Future Feature)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                <Save size={20} />
                Save Integration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg animate-slideUp ${
          toast.success ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="font-semibold">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

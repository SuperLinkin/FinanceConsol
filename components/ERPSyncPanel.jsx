'use client';

import { useState, useEffect } from 'react';
import { X, Database, RefreshCw, CheckCircle, XCircle, Clock, Zap, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

export default function ERPSyncPanel({
  isOpen,
  onClose,
  syncType = 'trial_balance', // 'trial_balance', 'chart_of_accounts', 'entities'
  onSyncComplete
}) {
  const [integrations, setIntegrations] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().split('T')[0]);
  const [entities, setEntities] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [syncHistory, setSyncHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchIntegrations();
      fetchEntities();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedIntegration) {
      fetchLastSync();
      fetchSyncHistory();
    }
  }, [selectedIntegration, syncType]);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      const data = await response.json();
      const activeIntegrations = (data || []).filter(i => i.status === 'connected' || i.status === 'configured');
      setIntegrations(activeIntegrations);
      if (activeIntegrations.length > 0) {
        setSelectedIntegration(activeIntegrations[0].id);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

  const fetchEntities = async () => {
    try {
      const response = await fetch('/api/entities');
      const data = await response.json();
      const entitiesList = Array.isArray(data) ? data : (data.data || []);
      setEntities(entitiesList);
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  const fetchLastSync = async () => {
    try {
      const response = await fetch(`/api/integrations/sync?integration_id=${selectedIntegration}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const lastSyncRecord = data.find(s => s.sync_type === syncType) || data[0];
        setLastSync(lastSyncRecord);
      }
    } catch (error) {
      console.error('Error fetching last sync:', error);
    }
  };

  const fetchSyncHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/integrations/sync?integration_id=${selectedIntegration}&limit=10`);
      const data = await response.json();
      const filteredHistory = (data || []).filter(s => s.sync_type === syncType);
      setSyncHistory(filteredHistory);
    } catch (error) {
      console.error('Error fetching sync history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSync = async () => {
    if (!selectedIntegration) {
      alert('Please select an integration');
      return;
    }

    if (syncType === 'trial_balance' && (!selectedEntity || !selectedPeriod)) {
      alert('Please select entity and period for trial balance sync');
      return;
    }

    setSyncing(true);
    setSyncResult(null);

    try {
      const integration = integrations.find(i => i.id === selectedIntegration);
      let endpoint = '/api/integrations/sync';
      let body = {
        integration_id: selectedIntegration,
        sync_type: syncType,
        triggered_by: 'manual'
      };

      if (integration.erp_system === 'netsuite') {
        endpoint = '/api/integrations/netsuite/sync';

        if (syncType === 'trial_balance') {
          const entityMapping = integration.entity_mapping || {};
          const subsidiaryId = Object.keys(entityMapping).find(
            key => entityMapping[key] === selectedEntity
          );

          body = {
            integration_id: selectedIntegration,
            sync_type: syncType,
            subsidiary_id: subsidiaryId,
            period_id: null,
            start_date: new Date(new Date(selectedPeriod).getFullYear(), 0, 1).toISOString().split('T')[0],
            end_date: selectedPeriod,
            period_name: `Period ending ${selectedPeriod}`
          };
        } else if (syncType === 'chart_of_accounts') {
          body.sync_type = 'chart_of_accounts';
        } else if (syncType === 'subsidiaries') {
          body.sync_type = 'subsidiaries';
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }

      const result = await response.json();

      setSyncResult({
        success: true,
        message: result.message || 'Sync completed successfully',
        sync_id: result.sync_id
      });

      // Refresh sync history
      await fetchLastSync();
      await fetchSyncHistory();

      // Notify parent component
      if (onSyncComplete) {
        onSyncComplete(result);
      }

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error syncing from ERP:', error);
      setSyncResult({
        success: false,
        message: `Sync failed: ${error.message}`
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getSyncTypeLabel = () => {
    switch (syncType) {
      case 'trial_balance': return 'Trial Balance';
      case 'chart_of_accounts': return 'Chart of Accounts';
      case 'subsidiaries': return 'Entities/Subsidiaries';
      default: return 'Data';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="fixed right-0 top-0 h-screen w-[500px] bg-white shadow-2xl z-50 flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Sync from ERP</h2>
              <p className="text-blue-100 text-sm">{getSyncTypeLabel()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Last Sync Info */}
          {lastSync && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-600" />
                  <span className="font-semibold text-slate-900">Last Sync</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  lastSync.sync_status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : lastSync.sync_status === 'failed'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {lastSync.sync_status}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-2">{formatDate(lastSync.triggered_at)}</p>
              {lastSync.sync_status === 'completed' && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-white rounded p-2 border border-slate-200">
                    <div className="text-xs text-slate-600">Fetched</div>
                    <div className="text-lg font-bold text-slate-900">{lastSync.records_fetched || 0}</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-slate-200">
                    <div className="text-xs text-slate-600">Imported</div>
                    <div className="text-lg font-bold text-green-600">{lastSync.records_imported || 0}</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-slate-200">
                    <div className="text-xs text-slate-600">Failed</div>
                    <div className="text-lg font-bold text-red-600">{lastSync.records_failed || 0}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Integration Selection */}
          {integrations.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">No Integrations Configured</h3>
                  <p className="text-sm text-amber-800">
                    Please configure an ERP integration in <strong>Platform → Integrations Hub</strong> before syncing.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select ERP Integration
                </label>
                <select
                  value={selectedIntegration}
                  onChange={(e) => setSelectedIntegration(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                  disabled={syncing}
                >
                  {integrations.map(integration => (
                    <option key={integration.id} value={integration.id}>
                      {integration.integration_name} ({integration.erp_system.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Entity Selection (for Trial Balance only) */}
              {syncType === 'trial_balance' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Entity
                  </label>
                  <select
                    value={selectedEntity}
                    onChange={(e) => setSelectedEntity(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    disabled={syncing}
                  >
                    <option value="">Choose entity...</option>
                    {entities.map(entity => (
                      <option key={entity.id} value={entity.id}>
                        {entity.entity_name} ({entity.entity_code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Period Selection (for Trial Balance only) */}
              {syncType === 'trial_balance' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Period End Date
                  </label>
                  <input
                    type="date"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    disabled={syncing}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Data will be synced for the full year ending on this date
                  </p>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Zap className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">How Sync Works</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Connects to your ERP system securely via API</li>
                      <li>• Fetches {getSyncTypeLabel()} data</li>
                      <li>• Automatically maps and validates data</li>
                      <li>• Imports directly into CLOE database</li>
                      <li>• Process takes 30-60 seconds</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sync Result */}
              {syncResult && (
                <div className={`p-4 rounded-lg border-2 ${
                  syncResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {syncResult.success ? (
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
                    ) : (
                      <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
                    )}
                    <div className="flex-1">
                      <h3 className={`font-bold mb-1 ${
                        syncResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {syncResult.success ? 'Sync Completed!' : 'Sync Failed'}
                      </h3>
                      <p className="text-sm text-slate-700">{syncResult.message}</p>
                      {syncResult.sync_id && (
                        <p className="text-xs text-slate-600 mt-2">
                          Sync ID: {syncResult.sync_id}
                        </p>
                      )}
                      {syncResult.success && (
                        <p className="text-xs text-green-700 mt-2 font-medium">
                          Panel will close automatically...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sync History */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Recent Sync History</h3>
                {loadingHistory ? (
                  <div className="text-center py-8 text-slate-500">Loading history...</div>
                ) : syncHistory.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">No sync history available</div>
                ) : (
                  <div className="space-y-2">
                    {syncHistory.map((sync, index) => (
                      <div
                        key={sync.id || index}
                        className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900">
                            {formatDate(sync.triggered_at)}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            sync.sync_status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : sync.sync_status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {sync.sync_status}
                          </span>
                        </div>
                        {sync.sync_status === 'completed' && (
                          <div className="flex items-center gap-4 text-xs text-slate-600">
                            <div className="flex items-center gap-1">
                              <TrendingUp size={14} className="text-green-600" />
                              {sync.records_imported || 0} imported
                            </div>
                            {sync.records_failed > 0 && (
                              <div className="flex items-center gap-1">
                                <TrendingDown size={14} className="text-red-600" />
                                {sync.records_failed} failed
                              </div>
                            )}
                            {sync.duration_seconds && (
                              <span>{sync.duration_seconds}s</span>
                            )}
                          </div>
                        )}
                        {sync.error_message && (
                          <p className="text-xs text-red-600 mt-1">{sync.error_message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {integrations.length > 0 && (
          <div className="border-t border-slate-200 p-6 bg-slate-50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={syncing}
                className="flex-1 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSync}
                disabled={syncing || !selectedIntegration || (syncType === 'trial_balance' && (!selectedEntity || !selectedPeriod))}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {syncing ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Database size={20} />
                    Start Sync
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

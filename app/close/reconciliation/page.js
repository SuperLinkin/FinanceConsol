'use client';

import { useState } from 'react';
import CloseSidebar from '@/components/close/CloseSidebar';
import ClosePageHeader from '@/components/close/ClosePageHeader';
import { GitMerge, CheckCircle, AlertCircle, Clock, DollarSign, Calendar, User } from 'lucide-react';

export default function Reconciliation() {
  const [selectedRec, setSelectedRec] = useState(null);

  // Mock reconciliation data
  const reconciliations = [
    {
      id: 1,
      name: 'Bank Reconciliation - Main Operating Account',
      account: '1010-000',
      preparer: 'John Doe',
      reviewer: 'Sarah Williams',
      status: 'completed',
      dueDate: '2024-12-28',
      bookBalance: 1250000,
      bankBalance: 1250000,
      difference: 0,
      lastUpdated: '2024-12-27'
    },
    {
      id: 2,
      name: 'Bank Reconciliation - Payroll Account',
      account: '1010-001',
      preparer: 'Jane Smith',
      reviewer: 'Mike Johnson',
      status: 'in_review',
      dueDate: '2024-12-28',
      bookBalance: 450000,
      bankBalance: 452000,
      difference: -2000,
      lastUpdated: '2024-12-28'
    },
    {
      id: 3,
      name: 'Intercompany Reconciliation - Entity A vs Entity B',
      account: '2100-050',
      preparer: 'Mike Johnson',
      reviewer: 'John Doe',
      status: 'in_progress',
      dueDate: '2024-12-28',
      bookBalance: 75000,
      bankBalance: 75000,
      difference: 0,
      lastUpdated: '2024-12-28'
    },
    {
      id: 4,
      name: 'Credit Card Reconciliation',
      account: '2010-100',
      preparer: 'Emily Davis',
      reviewer: 'Sarah Williams',
      status: 'pending',
      dueDate: '2024-12-29',
      bookBalance: 35000,
      bankBalance: 35800,
      difference: -800,
      lastUpdated: '2024-12-26'
    },
    {
      id: 5,
      name: 'Accounts Receivable Reconciliation',
      account: '1200-000',
      preparer: 'John Doe',
      reviewer: 'Jane Smith',
      status: 'issues',
      dueDate: '2024-12-29',
      bookBalance: 2500000,
      bankBalance: 2450000,
      difference: 50000,
      lastUpdated: '2024-12-28'
    },
    {
      id: 6,
      name: 'Accounts Payable Reconciliation',
      account: '2000-000',
      preparer: 'Sarah Williams',
      reviewer: 'Mike Johnson',
      status: 'completed',
      dueDate: '2024-12-29',
      bookBalance: 850000,
      bankBalance: 850000,
      difference: 0,
      lastUpdated: '2024-12-27'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_review': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'issues': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const recStats = {
    total: reconciliations.length,
    completed: reconciliations.filter(r => r.status === 'completed').length,
    in_progress: reconciliations.filter(r => r.status === 'in_progress' || r.status === 'in_review').length,
    issues: reconciliations.filter(r => r.status === 'issues').length
  };

  return (
    <div className="flex h-screen bg-[#f7f5f2]">
      <CloseSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-[#101828] text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Reconciliation Management</h1>
            <p className="text-gray-300">Track and manage all account reconciliations</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reconciliations</p>
                  <p className="text-2xl font-bold text-[#101828]">{recStats.total}</p>
                </div>
                <GitMerge className="text-gray-400" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{recStats.completed}</p>
                </div>
                <CheckCircle className="text-green-400" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{recStats.in_progress}</p>
                </div>
                <Clock className="text-blue-400" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">With Issues</p>
                  <p className="text-2xl font-bold text-red-600">{recStats.issues}</p>
                </div>
                <AlertCircle className="text-red-400" size={32} />
              </div>
            </div>
          </div>

          {/* Reconciliation List */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-[#101828] mb-4">Reconciliations</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {reconciliations.map(rec => (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRec(rec)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedRec?.id === rec.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#101828] text-sm mb-1">{rec.name}</h3>
                        <p className="text-xs text-gray-600">Account: {rec.account}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rec.status)}`}>
                        {rec.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600">Book Balance</p>
                        <p className="text-sm font-semibold text-[#101828]">{formatCurrency(rec.bookBalance)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Difference</p>
                        <p className={`text-sm font-semibold ${rec.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(rec.difference)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar size={12} />
                        <span>Due: {rec.dueDate}</span>
                      </div>
                      {rec.difference === 0 ? (
                        <CheckCircle className="text-green-500" size={16} />
                      ) : (
                        <AlertCircle className="text-red-500" size={16} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reconciliation Details */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              {selectedRec ? (
                <>
                  <h2 className="text-lg font-bold text-[#101828] mb-4">Reconciliation Details</h2>

                  <div className="space-y-4">
                    {/* Header Info */}
                    <div>
                      <h3 className="font-semibold text-[#101828] mb-2">{selectedRec.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Account:</span>
                        <span className="text-sm font-medium text-[#101828]">{selectedRec.account}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRec.status)}`}>
                          {selectedRec.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Updated</span>
                        <span className="text-sm font-medium text-[#101828]">{selectedRec.lastUpdated}</span>
                      </div>
                    </div>

                    {/* Team */}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Team</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-semibold">
                              {selectedRec.preparer.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#101828]">{selectedRec.preparer}</p>
                            <p className="text-xs text-gray-600">Preparer</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 text-xs font-semibold">
                              {selectedRec.reviewer.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#101828]">{selectedRec.reviewer}</p>
                            <p className="text-xs text-gray-600">Reviewer</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Balance Details */}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Balance Comparison</p>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Book Balance</span>
                          <span className="text-lg font-bold text-[#101828]">{formatCurrency(selectedRec.bookBalance)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Bank/Statement Balance</span>
                          <span className="text-lg font-bold text-[#101828]">{formatCurrency(selectedRec.bankBalance)}</span>
                        </div>
                        <div className="pt-3 border-t-2 border-gray-300 flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">Difference</span>
                          <span className={`text-xl font-bold ${selectedRec.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(selectedRec.difference)}
                          </span>
                        </div>
                      </div>

                      {selectedRec.difference === 0 ? (
                        <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="text-green-600" size={20} />
                          <span className="text-sm text-green-700 font-medium">Reconciliation balanced</span>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="text-red-600" size={20} />
                          <span className="text-sm text-red-700 font-medium">Reconciliation has differences that need investigation</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-3">
                        <button className="px-4 py-2 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors text-sm">
                          View Details
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          Add Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <GitMerge size={64} className="mb-4" />
                  <p className="text-center">Select a reconciliation to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

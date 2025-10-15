'use client';

import { useState } from 'react';
import CloseSidebar from '@/components/close/CloseSidebar';
import { TrendingUp, TrendingDown, AlertCircle, FileText, Download } from 'lucide-react';

export default function VarianceAnalysis() {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [viewType, setViewType] = useState('material'); // material, all

  // Mock variance data
  const variances = [
    {
      id: 1,
      account: '5000-100',
      accountName: 'Salaries and Wages',
      category: 'Operating Expenses',
      currentMonth: 450000,
      priorMonth: 420000,
      budget: 430000,
      variance: 30000,
      variancePercent: 7.14,
      budgetVariance: 20000,
      budgetVariancePercent: 4.65,
      status: 'material',
      explanation: 'Additional headcount hired in December',
      trend: 'up'
    },
    {
      id: 2,
      account: '4000-000',
      accountName: 'Product Sales Revenue',
      category: 'Revenue',
      currentMonth: 2100000,
      priorMonth: 1950000,
      budget: 2000000,
      variance: 150000,
      variancePercent: 7.69,
      budgetVariance: 100000,
      budgetVariancePercent: 5.0,
      status: 'favorable',
      explanation: 'Strong Q4 sales performance',
      trend: 'up'
    },
    {
      id: 3,
      account: '5100-200',
      accountName: 'Marketing Expenses',
      category: 'Operating Expenses',
      currentMonth: 85000,
      priorMonth: 120000,
      budget: 100000,
      variance: -35000,
      variancePercent: -29.17,
      budgetVariance: -15000,
      budgetVariancePercent: -15.0,
      status: 'material',
      explanation: 'Delayed campaign launch to Q1',
      trend: 'down'
    },
    {
      id: 4,
      account: '6000-100',
      accountName: 'Cost of Goods Sold',
      category: 'Cost of Sales',
      currentMonth: 850000,
      priorMonth: 790000,
      budget: 810000,
      variance: 60000,
      variancePercent: 7.59,
      budgetVariance: 40000,
      budgetVariancePercent: 4.94,
      status: 'material',
      explanation: 'Supplier price increases',
      trend: 'up'
    },
    {
      id: 5,
      account: '5200-300',
      accountName: 'Office Rent',
      category: 'Operating Expenses',
      currentMonth: 35000,
      priorMonth: 35000,
      budget: 35000,
      variance: 0,
      variancePercent: 0,
      budgetVariance: 0,
      budgetVariancePercent: 0,
      status: 'immaterial',
      explanation: 'Fixed monthly rent',
      trend: 'flat'
    },
    {
      id: 6,
      account: '5300-400',
      accountName: 'IT Services',
      category: 'Operating Expenses',
      currentMonth: 28000,
      priorMonth: 25000,
      budget: 27000,
      variance: 3000,
      variancePercent: 12.0,
      budgetVariance: 1000,
      budgetVariancePercent: 3.7,
      status: 'review',
      explanation: 'Additional cloud infrastructure costs',
      trend: 'up'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'material': return 'bg-red-100 text-red-700';
      case 'favorable': return 'bg-green-100 text-green-700';
      case 'review': return 'bg-yellow-100 text-yellow-700';
      case 'immaterial': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredVariances = viewType === 'material'
    ? variances.filter(v => v.status === 'material' || v.status === 'review')
    : variances;

  const varianceStats = {
    material: variances.filter(v => v.status === 'material').length,
    review: variances.filter(v => v.status === 'review').length,
    totalVariance: variances.reduce((sum, v) => sum + Math.abs(v.variance), 0)
  };

  return (
    <div className="flex h-screen bg-[#f7f5f2]">
      <CloseSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-[#101828] text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Variance Analysis</h1>
            <p className="text-gray-300">Analyze month-over-month and budget variances</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Material Variances</p>
                  <p className="text-2xl font-bold text-red-600">{varianceStats.material}</p>
                </div>
                <AlertCircle className="text-red-400" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">For Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{varianceStats.review}</p>
                </div>
                <FileText className="text-yellow-400" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Variance</p>
                  <p className="text-2xl font-bold text-[#101828]">{formatCurrency(varianceStats.totalVariance)}</p>
                </div>
                <TrendingUp className="text-gray-400" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Accounts Analyzed</p>
                  <p className="text-2xl font-bold text-[#101828]">{variances.length}</p>
                </div>
                <FileText className="text-gray-400" size={32} />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">View:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewType('material')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewType === 'material'
                        ? 'bg-[#101828] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Material Variances Only
                  </button>
                  <button
                    onClick={() => setViewType('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewType === 'all'
                        ? 'bg-[#101828] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Accounts
                  </button>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors">
                <Download size={18} />
                Export Report
              </button>
            </div>
          </div>

          {/* Variance Table */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#101828] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Account</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Current Month</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Prior Month</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">MoM Variance</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Budget</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Budget Variance</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredVariances.map(variance => (
                    <tr
                      key={variance.id}
                      onClick={() => setSelectedAccount(variance)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-[#101828] text-sm">{variance.account}</p>
                          <p className="text-xs text-gray-600">{variance.accountName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{variance.category}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-[#101828]">
                        {formatCurrency(variance.currentMonth)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        {formatCurrency(variance.priorMonth)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1">
                            {variance.trend === 'up' && <TrendingUp size={14} className="text-red-600" />}
                            {variance.trend === 'down' && <TrendingDown size={14} className="text-green-600" />}
                            <span className={`text-sm font-semibold ${
                              variance.variance > 0 ? 'text-red-600' : variance.variance < 0 ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {formatCurrency(variance.variance)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">{variance.variancePercent.toFixed(2)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700">
                        {formatCurrency(variance.budget)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-semibold ${
                            variance.budgetVariance > 0 ? 'text-red-600' : variance.budgetVariance < 0 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {formatCurrency(variance.budgetVariance)}
                          </span>
                          <span className="text-xs text-gray-600">{variance.budgetVariancePercent.toFixed(2)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(variance.status)}`}>
                          {variance.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Variance Details */}
          {selectedAccount && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-[#101828] mb-4">Variance Explanation</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Account</p>
                  <p className="text-base font-semibold text-[#101828]">
                    {selectedAccount.account} - {selectedAccount.accountName}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Current Month</p>
                    <p className="text-xl font-bold text-[#101828]">{formatCurrency(selectedAccount.currentMonth)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prior Month</p>
                    <p className="text-xl font-bold text-gray-700">{formatCurrency(selectedAccount.priorMonth)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="text-xl font-bold text-gray-700">{formatCurrency(selectedAccount.budget)}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Explanation</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedAccount.explanation}</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAccount.status)}`}>
                    {selectedAccount.status}
                  </span>
                  {selectedAccount.trend === 'up' && (
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingUp size={16} />
                      <span className="text-sm font-medium">Increasing Trend</span>
                    </div>
                  )}
                  {selectedAccount.trend === 'down' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingDown size={16} />
                      <span className="text-sm font-medium">Decreasing Trend</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

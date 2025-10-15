'use client';

import { useState } from 'react';
import CloseSidebar from '@/components/close/CloseSidebar';
import { BarChart3, TrendingUp, DollarSign, PieChart, Download, Calendar } from 'lucide-react';

export default function ManagementAnalysis() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-12');

  // Mock financial data
  const financialSummary = {
    revenue: 2100000,
    expenses: 1598000,
    grossProfit: 1250000,
    netIncome: 502000,
    ebitda: 650000,
    cashFlow: 425000
  };

  const revenueByProduct = [
    { product: 'Product A', amount: 850000, percentage: 40.5 },
    { product: 'Product B', amount: 650000, percentage: 31.0 },
    { product: 'Product C', amount: 400000, percentage: 19.0 },
    { product: 'Services', amount: 200000, percentage: 9.5 }
  ];

  const expensesByCategory = [
    { category: 'Salaries & Wages', amount: 450000, percentage: 28.2 },
    { category: 'Cost of Goods Sold', amount: 850000, percentage: 53.2 },
    { category: 'Marketing', amount: 85000, percentage: 5.3 },
    { category: 'Office & Admin', amount: 63000, percentage: 3.9 },
    { category: 'IT Services', amount: 28000, percentage: 1.8 },
    { category: 'Other', amount: 122000, percentage: 7.6 }
  ];

  const keyMetrics = [
    { metric: 'Gross Margin', value: '59.5%', trend: 'up', change: '+2.3%' },
    { metric: 'Operating Margin', value: '23.9%', trend: 'up', change: '+1.8%' },
    { metric: 'Net Margin', value: '23.9%', trend: 'flat', change: '+0.2%' },
    { metric: 'EBITDA Margin', value: '31.0%', trend: 'up', change: '+3.1%' }
  ];

  const monthlyTrend = [
    { month: 'Jul', revenue: 1850000, expenses: 1450000 },
    { month: 'Aug', revenue: 1920000, expenses: 1480000 },
    { month: 'Sep', revenue: 1980000, expenses: 1520000 },
    { month: 'Oct', revenue: 2050000, expenses: 1560000 },
    { month: 'Nov', revenue: 2010000, expenses: 1540000 },
    { month: 'Dec', revenue: 2100000, expenses: 1598000 }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex h-screen bg-[#f7f5f2]">
      <CloseSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-[#101828] text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Management Analysis</h1>
                <p className="text-gray-300">Executive financial performance and KPIs</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                  <Calendar size={18} />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="bg-transparent border-none text-white focus:outline-none"
                  >
                    <option value="2024-12" className="text-gray-900">December 2024</option>
                    <option value="2024-11" className="text-gray-900">November 2024</option>
                    <option value="2024-10" className="text-gray-900">October 2024</option>
                  </select>
                </div>
                <button className="flex items-center gap-2 bg-white text-[#101828] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Download size={18} />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100">Total Revenue</p>
                <DollarSign size={24} className="text-blue-200" />
              </div>
              <p className="text-3xl font-bold mb-1">{formatCurrency(financialSummary.revenue)}</p>
              <div className="flex items-center gap-1 text-sm text-blue-100">
                <TrendingUp size={14} />
                <span>+7.7% vs prior month</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-red-100">Total Expenses</p>
                <BarChart3 size={24} className="text-red-200" />
              </div>
              <p className="text-3xl font-bold mb-1">{formatCurrency(financialSummary.expenses)}</p>
              <div className="flex items-center gap-1 text-sm text-red-100">
                <TrendingUp size={14} />
                <span>+3.8% vs prior month</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100">Net Income</p>
                <TrendingUp size={24} className="text-green-200" />
              </div>
              <p className="text-3xl font-bold mb-1">{formatCurrency(financialSummary.netIncome)}</p>
              <div className="flex items-center gap-1 text-sm text-green-100">
                <TrendingUp size={14} />
                <span>+18.3% vs prior month</span>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Gross Profit</p>
              <p className="text-2xl font-bold text-[#101828]">{formatCurrency(financialSummary.grossProfit)}</p>
              <p className="text-xs text-gray-500 mt-1">59.5% margin</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <p className="text-sm text-gray-600 mb-1">EBITDA</p>
              <p className="text-2xl font-bold text-[#101828]">{formatCurrency(financialSummary.ebitda)}</p>
              <p className="text-xs text-gray-500 mt-1">31.0% margin</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Operating Cash Flow</p>
              <p className="text-2xl font-bold text-[#101828]">{formatCurrency(financialSummary.cashFlow)}</p>
              <p className="text-xs text-gray-500 mt-1">84.7% of net income</p>
            </div>
          </div>

          {/* Key Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-[#101828] mb-4">Key Performance Metrics</h2>
            <div className="grid grid-cols-4 gap-4">
              {keyMetrics.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">{item.metric}</p>
                  <p className="text-2xl font-bold text-[#101828] mb-1">{item.value}</p>
                  <div className="flex items-center gap-1">
                    {item.trend === 'up' && <TrendingUp size={14} className="text-green-600" />}
                    <span className={`text-xs ${
                      item.trend === 'up' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {item.change} vs prior
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Revenue Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-[#101828] mb-4">Revenue by Product</h2>
              <div className="space-y-3">
                {revenueByProduct.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.product}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#101828]">{formatCurrency(item.amount)}</span>
                        <span className="text-xs text-gray-500 ml-2">{item.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-[#101828] mb-4">Expenses by Category</h2>
              <div className="space-y-3">
                {expensesByCategory.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#101828]">{formatCurrency(item.amount)}</span>
                        <span className="text-xs text-gray-500 ml-2">{item.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-[#101828] mb-4">6-Month Trend</h2>
            <div className="space-y-4">
              {monthlyTrend.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#101828]">{item.month} 2024</span>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Revenue</p>
                        <p className="text-sm font-semibold text-blue-600">{formatCurrency(item.revenue)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Expenses</p>
                        <p className="text-sm font-semibold text-red-600">{formatCurrency(item.expenses)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Net Income</p>
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(item.revenue - item.expenses)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div className="bg-blue-600 h-3" style={{ width: `${(item.revenue / 2200000) * 100}%` }}></div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div className="bg-red-600 h-3" style={{ width: `${(item.expenses / 2200000) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

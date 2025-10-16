'use client';

import { useState } from 'react';
import CloseSidebar from '@/components/close/CloseSidebar';
import ClosePageHeader from '@/components/close/ClosePageHeader';
import { FileText, Download, Calendar, Filter, Eye, TrendingUp } from 'lucide-react';

export default function Reports() {
  const [filterPeriod, setFilterPeriod] = useState('2024-12');
  const [filterType, setFilterType] = useState('all');

  // Mock reports data
  const reports = [
    {
      id: 1,
      name: 'Monthly Close Summary',
      type: 'summary',
      period: '2024-12',
      generatedDate: '2024-12-28',
      status: 'ready',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Reconciliation Status Report',
      type: 'reconciliation',
      period: '2024-12',
      generatedDate: '2024-12-28',
      status: 'ready',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Variance Analysis Report',
      type: 'analysis',
      period: '2024-12',
      generatedDate: '2024-12-28',
      status: 'ready',
      size: '3.1 MB'
    },
    {
      id: 4,
      name: 'Management Reporting Package',
      type: 'management',
      period: '2024-12',
      generatedDate: '2024-12-29',
      status: 'in_progress',
      size: '-'
    },
    {
      id: 5,
      name: 'Task Status Report',
      type: 'task',
      period: '2024-12',
      generatedDate: '2024-12-27',
      status: 'ready',
      size: '856 KB'
    },
    {
      id: 6,
      name: 'Audit Trail Report',
      type: 'audit',
      period: '2024-12',
      generatedDate: '2024-12-27',
      status: 'ready',
      size: '4.2 MB'
    },
    {
      id: 7,
      name: 'Monthly Close Summary',
      type: 'summary',
      period: '2024-11',
      generatedDate: '2024-11-30',
      status: 'ready',
      size: '2.3 MB'
    },
    {
      id: 8,
      name: 'Variance Analysis Report',
      type: 'analysis',
      period: '2024-11',
      generatedDate: '2024-11-30',
      status: 'ready',
      size: '2.9 MB'
    }
  ];

  const reportTemplates = [
    {
      id: 1,
      name: 'Monthly Close Summary',
      description: 'Comprehensive overview of the month-end close process',
      type: 'summary'
    },
    {
      id: 2,
      name: 'Reconciliation Status',
      description: 'Status of all account reconciliations',
      type: 'reconciliation'
    },
    {
      id: 3,
      name: 'Variance Analysis',
      description: 'Detailed analysis of budget and period-over-period variances',
      type: 'analysis'
    },
    {
      id: 4,
      name: 'Management Package',
      description: 'Executive summary with key financial metrics',
      type: 'management'
    },
    {
      id: 5,
      name: 'Task Status Report',
      description: 'Overview of all tasks and their completion status',
      type: 'task'
    },
    {
      id: 6,
      name: 'Audit Trail Report',
      description: 'Complete audit trail of all close activities',
      type: 'audit'
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'summary': return 'bg-blue-100 text-blue-700';
      case 'reconciliation': return 'bg-purple-100 text-purple-700';
      case 'analysis': return 'bg-orange-100 text-orange-700';
      case 'management': return 'bg-green-100 text-green-700';
      case 'task': return 'bg-yellow-100 text-yellow-700';
      case 'audit': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesPeriod = filterPeriod === 'all' || report.period === filterPeriod;
    const matchesType = filterType === 'all' || report.type === filterType;
    return matchesPeriod && matchesType;
  });

  return (
    <div className="flex h-screen bg-[#f7f5f2]">
      <CloseSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <ClosePageHeader
          title="Reports"
          subtitle="Generate and download close reports"
        />

        {/* Content */}
        <div className="px-8 py-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-[#101828]">{reports.length}</p>
                </div>
                <FileText className="text-gray-400" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ready to Download</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reports.filter(r => r.status === 'ready').length}
                  </p>
                </div>
                <Download className="text-green-400" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Generating</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reports.filter(r => r.status === 'in_progress').length}
                  </p>
                </div>
                <TrendingUp className="text-blue-400" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Report Templates</p>
                  <p className="text-2xl font-bold text-[#101828]">{reportTemplates.length}</p>
                </div>
                <FileText className="text-gray-400" size={32} />
              </div>
            </div>
          </div>

          {/* Generate New Report Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-[#101828] mb-4">Generate New Report</h2>
            <div className="grid grid-cols-3 gap-4">
              {reportTemplates.map(template => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <FileText className="text-gray-400" size={20} />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                      {template.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#101828] mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <button className="w-full px-3 py-2 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors text-sm">
                    Generate Report
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex items-center gap-4">
              <Filter size={20} className="text-gray-600" />

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Period:</label>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Periods</option>
                  <option value="2024-12">December 2024</option>
                  <option value="2024-11">November 2024</option>
                  <option value="2024-10">October 2024</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Type:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="summary">Summary</option>
                  <option value="reconciliation">Reconciliation</option>
                  <option value="analysis">Analysis</option>
                  <option value="management">Management</option>
                  <option value="task">Task</option>
                  <option value="audit">Audit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Report Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Period</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Generated Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Size</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <FileText className="mx-auto mb-2 text-gray-300" size={48} />
                        <p>No reports found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map(report => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#101828]">{report.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                            {report.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar size={14} />
                            {report.period}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{report.generatedDate}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{report.size}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {report.status === 'ready' && (
                              <>
                                <button
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Report"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Download Report"
                                >
                                  <Download size={16} />
                                </button>
                              </>
                            )}
                            {report.status === 'in_progress' && (
                              <span className="text-xs text-blue-600">Generating...</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

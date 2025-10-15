'use client';

import { useState, useEffect } from 'react';
import CloseSidebar from '@/components/close/CloseSidebar';
import ClosePageHeader from '@/components/close/ClosePageHeader';
import {
  Calendar,
  CheckSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  FileText
} from 'lucide-react';

export default function CloseDashboard() {
  const [closeStatus, setCloseStatus] = useState({
    currentPeriod: 'December 2024',
    status: 'In Progress',
    daysRemaining: 3,
    tasksCompleted: 45,
    tasksTotal: 68,
    recsCompleted: 23,
    recsTotal: 30
  });

  const [criticalTasks, setCriticalTasks] = useState([
    { id: 1, name: 'Bank Reconciliation - Main Account', assignee: 'John Doe', dueDate: '2024-12-28', status: 'In Progress' },
    { id: 2, name: 'Intercompany Reconciliation', assignee: 'Jane Smith', dueDate: '2024-12-28', status: 'Pending' },
    { id: 3, name: 'Revenue Recognition Review', assignee: 'Mike Johnson', dueDate: '2024-12-29', status: 'In Progress' },
    { id: 4, name: 'Fixed Assets Depreciation', assignee: 'Sarah Williams', dueDate: '2024-12-29', status: 'Completed' }
  ]);

  const [upcomingMilestones, setUpcomingMilestones] = useState([
    { id: 1, name: 'Complete All Reconciliations', date: '2024-12-28', status: 'At Risk' },
    { id: 2, name: 'Management Review', date: '2024-12-30', status: 'On Track' },
    { id: 3, name: 'Final Close', date: '2025-01-02', status: 'On Track' }
  ]);

  return (
    <div className="flex h-screen bg-[#f7f5f2]">
      <CloseSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <ClosePageHeader
          title="Finance Close Dashboard"
          subtitle="Monitor and manage your period-end close process"
        />

        {/* Dashboard Content */}
        <div className="px-8 py-6">
          {/* Status Overview Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Current Period */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Current Period</p>
                  <p className="text-xl font-bold text-[#101828]">{closeStatus.currentPeriod}</p>
                </div>
              </div>
            </div>

            {/* Days Remaining */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Days Remaining</p>
                  <p className="text-xl font-bold text-[#101828]">{closeStatus.daysRemaining}</p>
                </div>
              </div>
            </div>

            {/* Task Progress */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Tasks Completed</p>
                  <p className="text-xl font-bold text-[#101828]">
                    {closeStatus.tasksCompleted}/{closeStatus.tasksTotal}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${(closeStatus.tasksCompleted / closeStatus.tasksTotal) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Reconciliation Progress */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Reconciliations</p>
                  <p className="text-xl font-bold text-[#101828]">
                    {closeStatus.recsCompleted}/{closeStatus.recsTotal}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${(closeStatus.recsCompleted / closeStatus.recsTotal) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Critical Tasks */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#101828]">Critical Tasks</h2>
                <span className="text-sm text-gray-600">Requires Attention</span>
              </div>
              <div className="space-y-3">
                {criticalTasks.map(task => (
                  <div key={task.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-[#101828] text-sm">{task.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Milestones */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#101828]">Upcoming Milestones</h2>
                <span className="text-sm text-gray-600">Close Timeline</span>
              </div>
              <div className="space-y-4">
                {upcomingMilestones.map(milestone => (
                  <div key={milestone.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-[#101828] text-sm">{milestone.name}</h3>
                      {milestone.status === 'At Risk' ? (
                        <AlertCircle className="text-red-500" size={18} />
                      ) : (
                        <CheckCircle className="text-green-500" size={18} />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{milestone.date}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        milestone.status === 'At Risk' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {milestone.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Close Progress Timeline */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="font-semibold text-[#101828] text-sm mb-3">Close Progress</h3>
                <div className="relative">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-300"></div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full z-10 ring-4 ring-white"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#101828]">Data Collection</p>
                        <p className="text-xs text-slate-500">Completed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-indigo-500 rounded-full z-10 ring-4 ring-white"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#101828]">Reconciliation</p>
                        <p className="text-xs text-slate-500">In Progress</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-slate-300 rounded-full z-10 ring-4 ring-white"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-400">Management Review</p>
                        <p className="text-xs text-slate-400">Pending</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-slate-300 rounded-full z-10 ring-4 ring-white"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-400">Final Sign-off</p>
                        <p className="text-xs text-slate-400">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-[#101828] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                <CheckSquare className="text-indigo-600" size={24} />
                <span className="text-sm font-medium text-[#101828]">View All Tasks</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                <TrendingUp className="text-indigo-600" size={24} />
                <span className="text-sm font-medium text-[#101828]">Reconciliations</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                <FileText className="text-indigo-600" size={24} />
                <span className="text-sm font-medium text-[#101828]">Generate Report</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                <Calendar className="text-indigo-600" size={24} />
                <span className="text-sm font-medium text-[#101828]">Close Calendar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

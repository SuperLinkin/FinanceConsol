'use client';

import { useState } from 'react';
import CloseSidebar from '@/components/close/CloseSidebar';
import ClosePageHeader from '@/components/close/ClosePageHeader';
import { Users, UserPlus, Search, BarChart3 } from 'lucide-react';

export default function TaskAllocation() {
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock team members data
  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Senior Accountant',
      email: 'john.doe@company.com',
      tasksAssigned: 3,
      tasksCompleted: 1,
      workload: 'high'
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Financial Analyst',
      email: 'jane.smith@company.com',
      tasksAssigned: 2,
      tasksCompleted: 0,
      workload: 'medium'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Accountant',
      email: 'mike.johnson@company.com',
      tasksAssigned: 3,
      tasksCompleted: 1,
      workload: 'high'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      role: 'Senior Accountant',
      email: 'sarah.williams@company.com',
      tasksAssigned: 1,
      tasksCompleted: 1,
      workload: 'low'
    },
    {
      id: 5,
      name: 'Emily Davis',
      role: 'Staff Accountant',
      email: 'emily.davis@company.com',
      tasksAssigned: 1,
      tasksCompleted: 0,
      workload: 'low'
    }
  ];

  // Mock tasks by user
  const userTasks = {
    1: [
      { id: 1, name: 'Bank Reconciliation - Main Account', status: 'in_progress', dueDate: '2024-12-28' },
      { id: 5, name: 'Accruals Review', status: 'pending', dueDate: '2024-12-30' },
      { id: 9, name: 'General Ledger Review', status: 'completed', dueDate: '2024-12-27' }
    ],
    2: [
      { id: 2, name: 'Intercompany Reconciliation', status: 'pending', dueDate: '2024-12-28' },
      { id: 8, name: 'Management Reporting Package', status: 'pending', dueDate: '2025-01-02' }
    ],
    3: [
      { id: 3, name: 'Revenue Recognition Review', status: 'in_progress', dueDate: '2024-12-29' },
      { id: 7, name: 'Inventory Count Reconciliation', status: 'pending', dueDate: '2024-12-30' },
      { id: 10, name: 'Cost Center Analysis', status: 'completed', dueDate: '2024-12-26' }
    ],
    4: [
      { id: 4, name: 'Fixed Assets Depreciation', status: 'completed', dueDate: '2024-12-29' }
    ],
    5: [
      { id: 6, name: 'Expense Report Validation', status: 'overdue', dueDate: '2024-12-27' }
    ]
  };

  const getWorkloadColor = (workload) => {
    switch (workload) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex h-screen bg-[#f7f5f2]">
      <CloseSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <ClosePageHeader
          title="Task Allocation"
          subtitle="Manage workload and assign tasks to team members"
        />

        {/* Content */}
        <div className="px-8 py-6">
          {/* Team Workload Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#101828]">Team Workload Overview</h2>
              <button className="flex items-center gap-2 bg-[#101828] text-white px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors">
                <UserPlus size={20} />
                Assign Task
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Team Members</p>
                    <p className="text-2xl font-bold text-[#101828]">{teamMembers.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Tasks Assigned</p>
                    <p className="text-2xl font-bold text-[#101828]">
                      {teamMembers.reduce((sum, member) => sum + member.tasksAssigned, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-[#101828]">
                      {Math.round((teamMembers.reduce((sum, member) => sum + member.tasksCompleted, 0) /
                        teamMembers.reduce((sum, member) => sum + member.tasksAssigned, 0)) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-2 gap-4">
              {teamMembers.map(member => (
                <div
                  key={member.id}
                  onClick={() => setSelectedUser(member.id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedUser === member.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#101828]">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getWorkloadColor(member.workload)}`}>
                      {member.workload} workload
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600">Tasks Assigned</p>
                      <p className="text-xl font-bold text-[#101828]">{member.tasksAssigned}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Completed</p>
                      <p className="text-xl font-bold text-green-600">{member.tasksCompleted}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${(member.tasksCompleted / member.tasksAssigned) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected User Tasks */}
          {selectedUser && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-[#101828] mb-4">
                Tasks for {teamMembers.find(m => m.id === selectedUser)?.name}
              </h2>
              <div className="space-y-3">
                {userTasks[selectedUser]?.map(task => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#101828] mb-1">{task.name}</h3>
                        <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workload Distribution Chart */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-[#101828] mb-4">Workload Distribution</h2>
            <div className="space-y-4">
              {teamMembers.map(member => (
                <div key={member.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{member.name}</span>
                    <span className="text-sm text-gray-600">{member.tasksAssigned} tasks</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        member.workload === 'high' ? 'bg-red-500' :
                        member.workload === 'medium' ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(member.tasksAssigned / 5) * 100}%` }}
                    ></div>
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

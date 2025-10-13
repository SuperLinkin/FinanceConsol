'use client';

import { useState } from 'react';
import CloseSidebar from '@/components/close/CloseSidebar';
import ClosePageHeader from '@/components/close/ClosePageHeader';
import { Plus, Search, Filter, CheckSquare, Clock, AlertCircle, CheckCircle, Users, Calendar } from 'lucide-react';

export default function TaskManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddTask, setShowAddTask] = useState(false);

  // Mock tasks data
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Bank Reconciliation - Main Account',
      description: 'Reconcile main operating account for December 2024',
      assignee: 'John Doe',
      dueDate: '2024-12-28',
      status: 'in_progress',
      priority: 'high',
      category: 'Reconciliation'
    },
    {
      id: 2,
      name: 'Intercompany Reconciliation',
      description: 'Reconcile all intercompany transactions',
      assignee: 'Jane Smith',
      dueDate: '2024-12-28',
      status: 'pending',
      priority: 'high',
      category: 'Reconciliation'
    },
    {
      id: 3,
      name: 'Revenue Recognition Review',
      description: 'Review and validate revenue recognition for the period',
      assignee: 'Mike Johnson',
      dueDate: '2024-12-29',
      status: 'in_progress',
      priority: 'medium',
      category: 'Review'
    },
    {
      id: 4,
      name: 'Fixed Assets Depreciation',
      description: 'Calculate and record depreciation expense',
      assignee: 'Sarah Williams',
      dueDate: '2024-12-29',
      status: 'completed',
      priority: 'medium',
      category: 'Journal Entry'
    },
    {
      id: 5,
      name: 'Accruals Review',
      description: 'Review and book all necessary accruals',
      assignee: 'John Doe',
      dueDate: '2024-12-30',
      status: 'pending',
      priority: 'medium',
      category: 'Journal Entry'
    },
    {
      id: 6,
      name: 'Expense Report Validation',
      description: 'Validate and approve all pending expense reports',
      assignee: 'Emily Davis',
      dueDate: '2024-12-27',
      status: 'overdue',
      priority: 'high',
      category: 'Review'
    },
    {
      id: 7,
      name: 'Inventory Count Reconciliation',
      description: 'Reconcile physical inventory count with system',
      assignee: 'Mike Johnson',
      dueDate: '2024-12-30',
      status: 'pending',
      priority: 'low',
      category: 'Reconciliation'
    },
    {
      id: 8,
      name: 'Management Reporting Package',
      description: 'Prepare monthly management reporting package',
      assignee: 'Jane Smith',
      dueDate: '2025-01-02',
      status: 'pending',
      priority: 'high',
      category: 'Reporting'
    }
  ]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => t.status === 'overdue').length
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex h-screen bg-[#f7f5f2]">
      <CloseSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <ClosePageHeader
          title="Task Management"
          subtitle="Track and manage all close-related tasks"
        />

        {/* Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-[#101828]">{taskStats.total}</p>
                </div>
                <CheckSquare className="text-gray-400" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                </div>
                <CheckCircle className="text-green-400" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{taskStats.in_progress}</p>
                </div>
                <Clock className="text-blue-400" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
                </div>
                <AlertCircle className="text-red-400" size={32} />
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks or assignees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-600" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              {/* Add Task Button */}
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-2 bg-[#101828] text-white px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors"
              >
                <Plus size={20} />
                Add Task
              </button>
            </div>
          </div>

          {/* Task List */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#101828] text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Task Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Assignee</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Due Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Priority</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <CheckSquare className="mx-auto mb-2 text-gray-300" size={48} />
                        <p>No tasks found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map(task => (
                      <tr key={task.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-[#101828]">{task.name}</p>
                            <p className="text-sm text-gray-600">{task.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm font-semibold">
                                {task.assignee.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700">{task.assignee}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{task.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar size={14} />
                            {task.dueDate}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Task Categories Summary */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h3 className="font-semibold text-[#101828] mb-2">Reconciliation</h3>
              <p className="text-2xl font-bold text-blue-600">
                {tasks.filter(t => t.category === 'Reconciliation').length}
              </p>
              <p className="text-sm text-gray-600">tasks</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h3 className="font-semibold text-[#101828] mb-2">Journal Entry</h3>
              <p className="text-2xl font-bold text-purple-600">
                {tasks.filter(t => t.category === 'Journal Entry').length}
              </p>
              <p className="text-sm text-gray-600">tasks</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h3 className="font-semibold text-[#101828] mb-2">Review</h3>
              <p className="text-2xl font-bold text-orange-600">
                {tasks.filter(t => t.category === 'Review').length}
              </p>
              <p className="text-sm text-gray-600">tasks</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h3 className="font-semibold text-[#101828] mb-2">Reporting</h3>
              <p className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.category === 'Reporting').length}
              </p>
              <p className="text-sm text-gray-600">tasks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

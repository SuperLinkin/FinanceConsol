'use client';

import { useState } from 'react';
import CloseSidebar from '@/components/close/CloseSidebar';
import ClosePageHeader from '@/components/close/ClosePageHeader';
import {
  Plus,
  X,
  Search,
  Play,
  RotateCcw,
  Calendar,
  Users,
  Eye,
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function TaskManagement() {
  const [showAddTaskPanel, setShowAddTaskPanel] = useState(false);
  const [showTaskDetailsPanel, setShowTaskDetailsPanel] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('tasks'); // 'tasks' or 'workday'

  // New task form state
  const [newTask, setNewTask] = useState({
    taskName: '',
    owner: '',
    reviewer: '',
    chartOfAccount: '',
    workDayStart: '',
    workDayEnd: '',
    dependentTaskId: '',
    description: '',
  });

  // Mock tasks data with new structure
  const [tasks, setTasks] = useState([
    {
      taskId: 'T001',
      taskName: 'Bank Reconciliation - Main Account',
      owner: 'John Doe',
      reviewer: 'Sarah Williams',
      chartOfAccount: '1010 - Cash and Cash Equivalents',
      workDayStart: 'Day 1',
      workDayEnd: 'Day 2',
      dependentTaskId: null,
      dependentTaskName: null,
      description: 'Reconcile the main bank account by comparing the bank statement with the general ledger. Identify and resolve any discrepancies, outstanding checks, or deposits in transit.'
    },
    {
      taskId: 'T002',
      taskName: 'Revenue Recognition Review',
      owner: 'Jane Smith',
      reviewer: 'Mike Johnson',
      chartOfAccount: '4000 - Revenue',
      workDayStart: 'Day 2',
      workDayEnd: 'Day 3',
      dependentTaskId: 'T001',
      dependentTaskName: 'Bank Reconciliation - Main Account',
      description: 'Review all revenue transactions for the period to ensure proper recognition in accordance with ASC 606. Verify that revenue is recognized when performance obligations are satisfied.'
    },
    {
      taskId: 'T003',
      taskName: 'Intercompany Reconciliation',
      owner: 'Mike Johnson',
      reviewer: 'John Doe',
      chartOfAccount: '2100 - Intercompany Payables',
      workDayStart: 'Day 1',
      workDayEnd: 'Day 3',
      dependentTaskId: null,
      dependentTaskName: null,
      description: 'Reconcile all intercompany transactions between subsidiaries. Ensure that intercompany balances match and eliminate any discrepancies before consolidation.'
    },
    {
      taskId: 'T004',
      taskName: 'Fixed Assets Depreciation',
      owner: 'Sarah Williams',
      reviewer: 'Jane Smith',
      chartOfAccount: '1200 - Fixed Assets',
      workDayStart: 'Day 3',
      workDayEnd: 'Day 4',
      dependentTaskId: 'T002',
      dependentTaskName: 'Revenue Recognition Review',
      description: 'Calculate and record monthly depreciation for all fixed assets. Review asset additions and disposals during the period and update depreciation schedules accordingly.'
    },
    {
      taskId: 'T005',
      taskName: 'Final Journal Entry Review',
      owner: 'John Doe',
      reviewer: 'Sarah Williams',
      chartOfAccount: '9999 - Various',
      workDayStart: 'Day 4',
      workDayEnd: 'Day 5',
      dependentTaskId: 'T004',
      dependentTaskName: 'Fixed Assets Depreciation',
      description: 'Review and approve all journal entries posted during the close period. Ensure proper documentation, appropriate approvals, and compliance with accounting policies.'
    }
  ]);

  // Workday simulation parameters
  const [simulationParams, setSimulationParams] = useState({
    totalWorkDays: 5,
    startDate: '2025-01-01',
    workdayPattern: 'sequential', // sequential, parallel, mixed
    bufferDays: 0
  });

  const [simulationResults, setSimulationResults] = useState(null);

  const filteredTasks = tasks.filter(task =>
    task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.taskId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTask = () => {
    if (!newTask.taskName || !newTask.owner) {
      alert('Please fill in required fields: Task Name and Owner');
      return;
    }

    const newTaskId = `T${String(tasks.length + 1).padStart(3, '0')}`;
    const dependentTask = tasks.find(t => t.taskId === newTask.dependentTaskId);

    const task = {
      taskId: newTaskId,
      taskName: newTask.taskName,
      owner: newTask.owner,
      reviewer: newTask.reviewer,
      chartOfAccount: newTask.chartOfAccount,
      workDayStart: newTask.workDayStart,
      workDayEnd: newTask.workDayEnd,
      dependentTaskId: newTask.dependentTaskId || null,
      dependentTaskName: dependentTask ? dependentTask.taskName : null,
      description: newTask.description
    };

    setTasks([...tasks, task]);
    setNewTask({
      taskName: '',
      owner: '',
      reviewer: '',
      chartOfAccount: '',
      workDayStart: '',
      workDayEnd: '',
      dependentTaskId: '',
      description: '',
    });
    setShowAddTaskPanel(false);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetailsPanel(true);
  };

  const handleSimulate = () => {
    // Calculate simulation results
    const totalDays = parseInt(simulationParams.totalWorkDays) + parseInt(simulationParams.bufferDays);
    const startDate = new Date(simulationParams.startDate);

    // Build dependency tree
    const taskSchedule = tasks.map((task, index) => {
      let calculatedStart = 1;
      let calculatedEnd = parseInt(task.workDayEnd.replace('Day ', ''));

      if (task.dependentTaskId) {
        const dependentTask = tasks.find(t => t.taskId === task.dependentTaskId);
        if (dependentTask) {
          const dependentEnd = parseInt(dependentTask.workDayEnd.replace('Day ', ''));
          calculatedStart = dependentEnd + 1;
          const duration = parseInt(task.workDayEnd.replace('Day ', '')) - parseInt(task.workDayStart.replace('Day ', ''));
          calculatedEnd = calculatedStart + duration;
        }
      } else {
        calculatedStart = parseInt(task.workDayStart.replace('Day ', ''));
      }

      const taskStartDate = new Date(startDate);
      taskStartDate.setDate(taskStartDate.getDate() + calculatedStart - 1);

      const taskEndDate = new Date(startDate);
      taskEndDate.setDate(taskEndDate.getDate() + calculatedEnd - 1);

      return {
        ...task,
        calculatedStart,
        calculatedEnd,
        startDate: taskStartDate.toISOString().split('T')[0],
        endDate: taskEndDate.toISOString().split('T')[0],
        duration: calculatedEnd - calculatedStart + 1
      };
    });

    const criticalPath = Math.max(...taskSchedule.map(t => t.calculatedEnd));
    const utilizationRate = (criticalPath / totalDays * 100).toFixed(1);

    setSimulationResults({
      schedule: taskSchedule,
      totalDays,
      criticalPath,
      utilizationRate,
      bottlenecks: taskSchedule.filter(t => t.dependentTaskId && t.calculatedStart > parseInt(t.workDayStart.replace('Day ', ''))),
      onTime: criticalPath <= totalDays
    });
  };

  return (
    <div className="flex h-screen bg-[#f7f5f2]">
      <CloseSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <ClosePageHeader
          title="Task Management"
          subtitle="Create and manage close tasks with dependency management"
        />

        {/* Content */}
        <div className="px-8 py-6">
          {/* Section Tabs */}
          <div className="flex gap-4 mb-6 border-b border-slate-200">
            <button
              onClick={() => setSelectedSection('tasks')}
              className={`pb-3 px-4 font-semibold transition-colors relative ${
                selectedSection === 'tasks'
                  ? 'text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Task List
              {selectedSection === 'tasks' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
              )}
            </button>
            <button
              onClick={() => setSelectedSection('workday')}
              className={`pb-3 px-4 font-semibold transition-colors relative ${
                selectedSection === 'workday'
                  ? 'text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Workday Management
              {selectedSection === 'workday' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
              )}
            </button>
          </div>

          {/* SECTION 1: Task List */}
          {selectedSection === 'tasks' && (
            <div>
              {/* Search and Add Task */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search tasks by name, ID, or owner..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddTaskPanel(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={20} />
                    Add Task
                  </button>
                </div>
              </div>

              {/* Tasks Table */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Task ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Task Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Owner</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Reviewer</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Chart of Account</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Work Day Start</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Work Day End</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Dependent Task ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Dependent Task Name</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredTasks.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="px-6 py-12 text-center text-slate-500">
                            <AlertCircle className="mx-auto mb-2 text-slate-300" size={48} />
                            <p>No tasks found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredTasks.map(task => (
                          <tr
                            key={task.taskId}
                            onClick={() => handleTaskClick(task)}
                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-3">
                              <span className="text-sm font-semibold text-indigo-600">{task.taskId}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-[#101828]">{task.taskName}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <span className="text-indigo-600 text-xs font-semibold">
                                    {task.owner.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <span className="text-sm text-slate-700">{task.owner}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Eye size={14} className="text-slate-400" />
                                <span className="text-sm text-slate-700">{task.reviewer}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-600">{task.chartOfAccount}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-700">{task.workDayStart}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-700">{task.workDayEnd}</span>
                            </td>
                            <td className="px-4 py-3">
                              {task.dependentTaskId ? (
                                <span className="text-sm font-semibold text-indigo-600">{task.dependentTaskId}</span>
                              ) : (
                                <span className="text-sm text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {task.dependentTaskName ? (
                                <span className="text-sm text-slate-600">{task.dependentTaskName}</span>
                              ) : (
                                <span className="text-sm text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Task Summary */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <p className="text-sm text-slate-600 mb-1">Total Tasks</p>
                  <p className="text-3xl font-bold text-[#101828]">{tasks.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <p className="text-sm text-slate-600 mb-1">Tasks with Dependencies</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {tasks.filter(t => t.dependentTaskId).length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <p className="text-sm text-slate-600 mb-1">Independent Tasks</p>
                  <p className="text-3xl font-bold text-green-600">
                    {tasks.filter(t => !t.dependentTaskId).length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Workday Management */}
          {selectedSection === 'workday' && (
            <div className="grid grid-cols-3 gap-6">
              {/* Simulation Parameters */}
              <div className="col-span-1 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-[#101828] mb-4">Simulation Parameters</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Total Work Days
                      </label>
                      <input
                        type="number"
                        value={simulationParams.totalWorkDays}
                        onChange={(e) => setSimulationParams({...simulationParams, totalWorkDays: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                        min="1"
                        max="30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Close Start Date
                      </label>
                      <input
                        type="date"
                        value={simulationParams.startDate}
                        onChange={(e) => setSimulationParams({...simulationParams, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Buffer Days
                      </label>
                      <input
                        type="number"
                        value={simulationParams.bufferDays}
                        onChange={(e) => setSimulationParams({...simulationParams, bufferDays: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                        min="0"
                        max="10"
                      />
                      <p className="text-xs text-slate-500 mt-1">Additional days added as safety margin</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Workday Pattern
                      </label>
                      <select
                        value={simulationParams.workdayPattern}
                        onChange={(e) => setSimulationParams({...simulationParams, workdayPattern: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                      >
                        <option value="sequential">Sequential (One after another)</option>
                        <option value="parallel">Parallel (Simultaneous)</option>
                        <option value="mixed">Mixed (Smart allocation)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <button
                      onClick={handleSimulate}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      <Play size={18} />
                      Run Simulation
                    </button>
                    <button
                      onClick={() => setSimulationResults(null)}
                      className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                    >
                      <RotateCcw size={18} />
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulation Results */}
              <div className="col-span-2">
                {!simulationResults ? (
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                    <Calendar className="mx-auto mb-4 text-slate-300" size={64} />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Simulation Run Yet</h3>
                    <p className="text-slate-500">
                      Configure parameters and click "Run Simulation" to see the close timeline
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <p className="text-sm text-slate-600 mb-1">Critical Path</p>
                        <p className="text-3xl font-bold text-[#101828]">{simulationResults.criticalPath} days</p>
                      </div>
                      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <p className="text-sm text-slate-600 mb-1">Utilization Rate</p>
                        <p className="text-3xl font-bold text-indigo-600">{simulationResults.utilizationRate}%</p>
                      </div>
                      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <p className="text-sm text-slate-600 mb-1">Status</p>
                        <div className="flex items-center gap-2">
                          {simulationResults.onTime ? (
                            <>
                              <CheckCircle2 className="text-green-600" size={24} />
                              <span className="text-lg font-bold text-green-600">On Time</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="text-red-600" size={24} />
                              <span className="text-lg font-bold text-red-600">At Risk</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-[#101828] mb-4">Simulated Task Schedule</h3>
                      <div className="space-y-3">
                        {simulationResults.schedule.map((task, index) => (
                          <div key={task.taskId} className="relative">
                            <div className="flex items-center gap-3">
                              <div className="w-16 flex-shrink-0">
                                <span className="text-sm font-semibold text-indigo-600">{task.taskId}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-[#101828]">{task.taskName}</span>
                                  <span className="text-xs text-slate-500">
                                    {task.startDate} → {task.endDate} ({task.duration} days)
                                  </span>
                                </div>
                                <div className="relative h-8 bg-slate-100 rounded">
                                  <div
                                    className="absolute h-full bg-indigo-500 rounded flex items-center justify-center"
                                    style={{
                                      left: `${((task.calculatedStart - 1) / simulationResults.totalDays) * 100}%`,
                                      width: `${(task.duration / simulationResults.totalDays) * 100}%`
                                    }}
                                  >
                                    <span className="text-xs text-white font-medium">
                                      Day {task.calculatedStart}-{task.calculatedEnd}
                                    </span>
                                  </div>
                                </div>
                                {task.dependentTaskId && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <ChevronRight size={12} className="text-slate-400" />
                                    <span className="text-xs text-slate-500">
                                      Depends on: {task.dependentTaskId}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottlenecks */}
                    {simulationResults.bottlenecks.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                          <div>
                            <h4 className="font-semibold text-amber-900 mb-2">Potential Bottlenecks Detected</h4>
                            <p className="text-sm text-amber-800 mb-2">
                              {simulationResults.bottlenecks.length} task(s) are delayed due to dependencies:
                            </p>
                            <ul className="text-sm text-amber-800 space-y-1">
                              {simulationResults.bottlenecks.map(task => (
                                <li key={task.taskId}>• {task.taskName} (delayed to Day {task.calculatedStart})</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Side Panel */}
      {showAddTaskPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAddTaskPanel(false)}
          ></div>
          <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#101828]">Add New Task</h2>
              <button
                onClick={() => setShowAddTaskPanel(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Task Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTask.taskName}
                  onChange={(e) => setNewTask({...newTask, taskName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="Enter task name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Owner <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTask.owner}
                  onChange={(e) => setNewTask({...newTask, owner: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="Enter owner name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reviewer
                </label>
                <input
                  type="text"
                  value={newTask.reviewer}
                  onChange={(e) => setNewTask({...newTask, reviewer: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="Enter reviewer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Chart of Account
                </label>
                <input
                  type="text"
                  value={newTask.chartOfAccount}
                  onChange={(e) => setNewTask({...newTask, chartOfAccount: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="e.g., 1010 - Cash and Cash Equivalents"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Work Day Start
                  </label>
                  <input
                    type="text"
                    value={newTask.workDayStart}
                    onChange={(e) => setNewTask({...newTask, workDayStart: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                    placeholder="e.g., Day 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Work Day End
                  </label>
                  <input
                    type="text"
                    value={newTask.workDayEnd}
                    onChange={(e) => setNewTask({...newTask, workDayEnd: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                    placeholder="e.g., Day 3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dependent Task ID
                </label>
                <select
                  value={newTask.dependentTaskId}
                  onChange={(e) => setNewTask({...newTask, dependentTaskId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                >
                  <option value="">No dependency</option>
                  {tasks.map(task => (
                    <option key={task.taskId} value={task.taskId}>
                      {task.taskId} - {task.taskName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Select a task that must be completed before this task can start
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Task Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828] min-h-[100px]"
                  placeholder="Describe what this task involves, including specific steps and requirements..."
                  rows="4"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <button
                  onClick={handleAddTask}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowAddTaskPanel(false)}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Task Details Side Panel */}
      {showTaskDetailsPanel && selectedTask && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowTaskDetailsPanel(false)}
          ></div>
          <div className="fixed right-0 top-0 bottom-0 w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#101828]">Task Details</h2>
                <p className="text-sm text-slate-600 mt-1">{selectedTask.taskId}</p>
              </div>
              <button
                onClick={() => setShowTaskDetailsPanel(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Task Name */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Task Name</label>
                <p className="text-lg font-semibold text-[#101828]">{selectedTask.taskName}</p>
              </div>

              {/* Description */}
              <div className="bg-slate-50 rounded-lg p-4">
                <label className="block text-xs font-medium text-slate-500 mb-2">Task Description</label>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedTask.description}</p>
              </div>

              {/* Team Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Owner</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 text-sm font-semibold">
                        {selectedTask.owner.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#101828]">{selectedTask.owner}</p>
                      <p className="text-xs text-slate-500">Task Owner</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Reviewer</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <Eye size={18} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#101828]">{selectedTask.reviewer}</p>
                      <p className="text-xs text-slate-500">Reviewer</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Section */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-sm font-semibold text-[#101828] mb-4">Schedule Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                    <p className="text-base font-semibold text-[#101828]">{selectedTask.workDayStart}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                    <p className="text-base font-semibold text-[#101828]">{selectedTask.workDayEnd}</p>
                  </div>
                </div>
              </div>

              {/* Account Section */}
              <div className="border-t border-slate-200 pt-6">
                <label className="block text-xs font-medium text-slate-500 mb-2">Chart of Account</label>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-indigo-900">{selectedTask.chartOfAccount}</p>
                </div>
              </div>

              {/* Dependency Section */}
              {selectedTask.dependentTaskId && (
                <div className="border-t border-slate-200 pt-6">
                  <label className="block text-xs font-medium text-slate-500 mb-2">Task Dependency</label>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-sm font-medium text-amber-900 mb-1">
                          Depends on: {selectedTask.dependentTaskId}
                        </p>
                        <p className="text-xs text-amber-700">{selectedTask.dependentTaskName}</p>
                        <p className="text-xs text-amber-600 mt-2">
                          This task cannot start until the dependent task is completed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-slate-200 pt-6 flex gap-3">
                <button className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  Edit Task
                </button>
                <button className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium">
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

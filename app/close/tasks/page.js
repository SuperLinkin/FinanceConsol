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
  CheckCircle2,
  Save,
  FolderOpen,
  BarChart2,
  TrendingUp,
  Clock,
  Zap,
  Target,
  Download,
  Copy
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
    bufferDays: 0,
    teamSize: 3,
    avgTasksPerDay: 2,
    riskTolerance: 'medium' // low, medium, high
  });

  const [simulationResults, setSimulationResults] = useState(null);
  const [savedSimulations, setSavedSimulations] = useState([
    {
      id: 'sim1',
      name: 'Q4 2024 Standard Close',
      params: { totalWorkDays: 5, startDate: '2024-12-31', bufferDays: 1, teamSize: 3, avgTasksPerDay: 2, riskTolerance: 'medium', workdayPattern: 'sequential' },
      savedDate: '2024-12-15',
      criticalPath: 6,
      status: 'on-time'
    },
    {
      id: 'sim2',
      name: 'Accelerated Close - 3 Days',
      params: { totalWorkDays: 3, startDate: '2025-01-31', bufferDays: 0, teamSize: 5, avgTasksPerDay: 3, riskTolerance: 'high', workdayPattern: 'parallel' },
      savedDate: '2024-12-10',
      criticalPath: 3,
      status: 'at-risk'
    }
  ]);
  const [showSaveSimulation, setShowSaveSimulation] = useState(false);
  const [simulationName, setSimulationName] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedComparisons, setSelectedComparisons] = useState([]);

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

    // Calculate resource utilization
    const teamSize = parseInt(simulationParams.teamSize);
    const totalTaskDays = taskSchedule.reduce((sum, t) => sum + t.duration, 0);
    const resourceUtilization = ((totalTaskDays / (teamSize * criticalPath)) * 100).toFixed(1);

    // Identify parallel tasks
    const parallelTasks = taskSchedule.filter(t => !t.dependentTaskId);

    // Calculate efficiency score
    const efficiencyScore = ((criticalPath / totalDays) * (resourceUtilization / 100) * 100).toFixed(1);

    setSimulationResults({
      schedule: taskSchedule,
      totalDays,
      criticalPath,
      utilizationRate,
      resourceUtilization,
      efficiencyScore,
      parallelTasks: parallelTasks.length,
      totalTasks: tasks.length,
      bottlenecks: taskSchedule.filter(t => t.dependentTaskId && t.calculatedStart > parseInt(t.workDayStart.replace('Day ', ''))),
      onTime: criticalPath <= totalDays,
      params: {...simulationParams}
    });
  };

  const handleSaveSimulation = () => {
    if (!simulationName.trim()) {
      alert('Please enter a simulation name');
      return;
    }

    const newSimulation = {
      id: `sim${savedSimulations.length + 1}`,
      name: simulationName,
      params: {...simulationParams},
      savedDate: new Date().toISOString().split('T')[0],
      criticalPath: simulationResults.criticalPath,
      status: simulationResults.onTime ? 'on-time' : 'at-risk'
    };

    setSavedSimulations([...savedSimulations, newSimulation]);
    setSimulationName('');
    setShowSaveSimulation(false);
    alert('Simulation saved successfully!');
  };

  const handleLoadSimulation = (simulation) => {
    setSimulationParams(simulation.params);
    alert(`Loaded simulation: ${simulation.name}`);
  };

  const handleDeleteSimulation = (id) => {
    if (confirm('Are you sure you want to delete this simulation?')) {
      setSavedSimulations(savedSimulations.filter(s => s.id !== id));
    }
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
                        Team Size
                      </label>
                      <input
                        type="number"
                        value={simulationParams.teamSize}
                        onChange={(e) => setSimulationParams({...simulationParams, teamSize: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                        min="1"
                        max="20"
                      />
                      <p className="text-xs text-slate-500 mt-1">Number of team members available</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Risk Tolerance
                      </label>
                      <select
                        value={simulationParams.riskTolerance}
                        onChange={(e) => setSimulationParams({...simulationParams, riskTolerance: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                      >
                        <option value="low">Low (Conservative)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="high">High (Aggressive)</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-1">Affects buffer recommendations</p>
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
                    {simulationResults && (
                      <button
                        onClick={() => setShowSaveSimulation(true)}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <Save size={18} />
                        Save Simulation
                      </button>
                    )}
                  </div>
                </div>

                {/* Saved Simulations */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#101828]">Saved Simulations</h3>
                    <FolderOpen size={20} className="text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    {savedSimulations.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No saved simulations</p>
                    ) : (
                      savedSimulations.map(sim => (
                        <div key={sim.id} className="border border-slate-200 rounded-lg p-3 hover:border-indigo-300 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-[#101828]">{sim.name}</p>
                              <p className="text-xs text-slate-500">Saved: {sim.savedDate}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              sim.status === 'on-time' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {sim.status === 'on-time' ? 'On Time' : 'At Risk'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                            <Clock size={12} />
                            <span>{sim.criticalPath} days</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleLoadSimulation(sim)}
                              className="flex-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-1.5 rounded hover:bg-indigo-100 transition-colors"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => handleDeleteSimulation(sim.id)}
                              className="flex-1 text-xs bg-red-50 text-red-600 px-2 py-1.5 rounded hover:bg-red-100 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
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
                    {/* Action Bar */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BarChart2 className="text-indigo-600" size={24} />
                          <div>
                            <h3 className="font-semibold text-[#101828]">Simulation Results</h3>
                            <p className="text-xs text-slate-500">Based on {simulationResults.totalTasks} tasks</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm">
                            <Download size={16} />
                            Export
                          </button>
                          <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm">
                            <Copy size={16} />
                            Duplicate
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Summary Cards - 5 cards */}
                    <div className="grid grid-cols-5 gap-4">
                      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-slate-600">Critical Path</p>
                          <Clock className="text-slate-400" size={16} />
                        </div>
                        <p className="text-2xl font-bold text-[#101828]">{simulationResults.criticalPath}</p>
                        <p className="text-xs text-slate-500 mt-1">days</p>
                      </div>
                      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-slate-600">Utilization</p>
                          <TrendingUp className="text-indigo-400" size={16} />
                        </div>
                        <p className="text-2xl font-bold text-indigo-600">{simulationResults.utilizationRate}%</p>
                        <p className="text-xs text-slate-500 mt-1">timeline used</p>
                      </div>
                      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-slate-600">Resources</p>
                          <Users className="text-purple-400" size={16} />
                        </div>
                        <p className="text-2xl font-bold text-purple-600">{simulationResults.resourceUtilization}%</p>
                        <p className="text-xs text-slate-500 mt-1">team capacity</p>
                      </div>
                      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-slate-600">Efficiency</p>
                          <Zap className="text-amber-400" size={16} />
                        </div>
                        <p className="text-2xl font-bold text-amber-600">{simulationResults.efficiencyScore}%</p>
                        <p className="text-xs text-slate-500 mt-1">score</p>
                      </div>
                      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-slate-600">Status</p>
                          <Target className="text-slate-400" size={16} />
                        </div>
                        <div className="flex items-center gap-1">
                          {simulationResults.onTime ? (
                            <>
                              <CheckCircle2 className="text-green-600" size={20} />
                              <span className="text-sm font-bold text-green-600">On Time</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="text-red-600" size={20} />
                              <span className="text-sm font-bold text-red-600">At Risk</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Insights Panel */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
                      <h4 className="font-semibold text-indigo-900 mb-4">Key Insights</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/80 rounded-lg p-3">
                          <p className="text-xs text-indigo-600 font-medium mb-1">Parallel Tasks</p>
                          <p className="text-lg font-bold text-indigo-900">{simulationResults.parallelTasks} tasks</p>
                          <p className="text-xs text-slate-600 mt-1">Can run simultaneously</p>
                        </div>
                        <div className="bg-white/80 rounded-lg p-3">
                          <p className="text-xs text-purple-600 font-medium mb-1">Bottlenecks</p>
                          <p className="text-lg font-bold text-purple-900">{simulationResults.bottlenecks.length} found</p>
                          <p className="text-xs text-slate-600 mt-1">Tasks delayed by dependencies</p>
                        </div>
                        <div className="bg-white/80 rounded-lg p-3">
                          <p className="text-xs text-blue-600 font-medium mb-1">Team Load</p>
                          <p className="text-lg font-bold text-blue-900">{simulationParams.teamSize} members</p>
                          <p className="text-xs text-slate-600 mt-1">Working on {simulationResults.totalTasks} tasks</p>
                        </div>
                        <div className="bg-white/80 rounded-lg p-3">
                          <p className="text-xs text-green-600 font-medium mb-1">Timeline</p>
                          <p className="text-lg font-bold text-green-900">{simulationResults.totalDays} days</p>
                          <p className="text-xs text-slate-600 mt-1">Including {simulationParams.bufferDays} buffer days</p>
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
                <button
                  onClick={() => {
                    setShowTaskDetailsPanel(false);
                    // TODO: Implement edit task functionality
                    alert('Edit task functionality coming soon');
                  }}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Edit Task
                </button>
                <button
                  onClick={() => setShowTaskDetailsPanel(false)}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Save Simulation Modal */}
      {showSaveSimulation && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSaveSimulation(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-[500px] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#101828]">Save Simulation</h2>
                <button
                  onClick={() => setShowSaveSimulation(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-slate-600 mb-4">
                Save this simulation for future reference and what-if analysis.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Simulation Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={simulationName}
                    onChange={(e) => setSimulationName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                    placeholder="e.g., Q1 2025 Accelerated Close"
                  />
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-slate-700 mb-2">Simulation Summary</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Critical Path:</span>
                      <span className="font-semibold text-[#101828] ml-1">{simulationResults?.criticalPath} days</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Team Size:</span>
                      <span className="font-semibold text-[#101828] ml-1">{simulationParams.teamSize} members</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Status:</span>
                      <span className={`font-semibold ml-1 ${simulationResults?.onTime ? 'text-green-600' : 'text-red-600'}`}>
                        {simulationResults?.onTime ? 'On Time' : 'At Risk'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Efficiency:</span>
                      <span className="font-semibold text-[#101828] ml-1">{simulationResults?.efficiencyScore}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveSimulation}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Save Simulation
                </button>
                <button
                  onClick={() => {
                    setShowSaveSimulation(false);
                    setSimulationName('');
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

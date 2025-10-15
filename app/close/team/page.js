'use client';

import { useState } from 'react';
import CloseSidebar from '@/components/close/CloseSidebar';
import ClosePageHeader from '@/components/close/ClosePageHeader';
import { Users, Plus, Edit, Trash2, Target, Award, CheckCircle, X, Search, Eye, MessageSquare, Send } from 'lucide-react';

export default function TeamManagement() {
  const [selectedSection, setSelectedSection] = useState('listing'); // 'listing' or 'kpis'
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddKPI, setShowAddKPI] = useState(false);
  const [selectedKPIEmployee, setSelectedKPIEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showKPIDetails, setShowKPIDetails] = useState(false);
  const [selectedEmployeeForKPIs, setSelectedEmployeeForKPIs] = useState(null);
  const [newComment, setNewComment] = useState('');

  // Employee form state
  const [newEmployee, setNewEmployee] = useState({
    employeeId: '',
    employeeName: '',
    status: 'Owner',
    managerName: '',
    team: ''
  });

  // KPI form state
  const [newKPI, setNewKPI] = useState({
    kpiName: '',
    target: '',
    unit: 'tasks',
    period: 'monthly',
    linkedTasks: []
  });

  // Mock employee data
  const [employees, setEmployees] = useState([
    {
      id: 1,
      employeeId: 'EMP001',
      employeeName: 'Sarah Johnson',
      status: 'Both',
      managerName: 'Michael Chen',
      team: 'Financial Operations'
    },
    {
      id: 2,
      employeeId: 'EMP002',
      employeeName: 'David Martinez',
      status: 'Owner',
      managerName: 'Michael Chen',
      team: 'Financial Operations'
    },
    {
      id: 3,
      employeeId: 'EMP003',
      employeeName: 'Emily Brown',
      status: 'Reviewer',
      managerName: 'Sarah Johnson',
      team: 'Financial Operations'
    },
    {
      id: 4,
      employeeId: 'EMP004',
      employeeName: 'James Wilson',
      status: 'Both',
      managerName: 'Michael Chen',
      team: 'Accounting'
    },
    {
      id: 5,
      employeeId: 'EMP005',
      employeeName: 'Lisa Anderson',
      status: 'Owner',
      managerName: 'Sarah Johnson',
      team: 'Accounting'
    },
    {
      id: 6,
      employeeId: 'EMP006',
      employeeName: 'Robert Taylor',
      status: 'Reviewer',
      managerName: 'James Wilson',
      team: 'Treasury'
    }
  ]);

  // Mock KPI data with comments
  const [employeeKPIs, setEmployeeKPIs] = useState([
    {
      id: 1,
      employeeId: 'EMP001',
      employeeName: 'Sarah Johnson',
      managerName: 'Michael Chen',
      team: 'Financial Operations',
      kpis: [
        {
          id: 'kpi1',
          name: 'Tasks Completed',
          target: 25,
          current: 23,
          unit: 'tasks',
          period: 'monthly',
          linkedTasks: ['Account Reconciliation', 'Variance Analysis'],
          completion: 92,
          comments: [
            {
              id: 'c1',
              author: 'Michael Chen',
              role: 'Manager',
              date: '2025-01-10',
              text: 'Great progress this month! Keep up the good work on reconciliations.'
            },
            {
              id: 'c2',
              author: 'David Martinez',
              role: 'Peer',
              date: '2025-01-12',
              text: 'Thanks for helping me with the variance analysis last week.'
            }
          ]
        },
        {
          id: 'kpi2',
          name: 'On-Time Delivery',
          target: 95,
          current: 98,
          unit: '%',
          period: 'monthly',
          linkedTasks: [],
          completion: 103,
          comments: []
        }
      ]
    },
    {
      id: 2,
      employeeId: 'EMP002',
      employeeName: 'David Martinez',
      managerName: 'Michael Chen',
      team: 'Financial Operations',
      kpis: [
        {
          id: 'kpi3',
          name: 'Tasks Completed',
          target: 20,
          current: 18,
          unit: 'tasks',
          period: 'monthly',
          linkedTasks: ['Journal Entry Review'],
          completion: 90,
          comments: [
            {
              id: 'c3',
              author: 'Michael Chen',
              role: 'Manager',
              date: '2025-01-11',
              text: 'Good steady progress. Let me know if you need support on journal entries.'
            }
          ]
        }
      ]
    },
    {
      id: 3,
      employeeId: 'EMP004',
      employeeName: 'James Wilson',
      managerName: 'Michael Chen',
      team: 'Accounting',
      kpis: [
        {
          id: 'kpi4',
          name: 'Reviews Completed',
          target: 30,
          current: 35,
          unit: 'reviews',
          period: 'monthly',
          linkedTasks: ['Reconciliation Review', 'Report Review'],
          completion: 117,
          comments: []
        },
        {
          id: 'kpi5',
          name: 'Review Turnaround Time',
          target: 24,
          current: 18,
          unit: 'hours',
          period: 'monthly',
          linkedTasks: [],
          completion: 133,
          comments: [
            {
              id: 'c4',
              author: 'Sarah Johnson',
              role: 'Peer',
              date: '2025-01-13',
              text: 'Impressive turnaround time! Really helps the team stay on track.'
            }
          ]
        }
      ]
    }
  ]);

  // Mock tasks for KPI linking
  const availableTasks = [
    'Account Reconciliation',
    'Variance Analysis',
    'Journal Entry Review',
    'Financial Statement Preparation',
    'Reconciliation Review',
    'Report Review',
    'Intercompany Reconciliation',
    'Accruals Processing',
    'Close Checklist Review'
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Owner': return 'bg-blue-100 text-blue-700';
      case 'Reviewer': return 'bg-purple-100 text-purple-700';
      case 'Both': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getKPIStatusColor = (completion) => {
    if (completion >= 100) return 'text-green-600';
    if (completion >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAddEmployee = () => {
    if (!newEmployee.employeeId || !newEmployee.employeeName) {
      alert('Please fill in Employee ID and Name');
      return;
    }

    const employee = {
      id: employees.length + 1,
      ...newEmployee
    };

    setEmployees([...employees, employee]);
    setNewEmployee({
      employeeId: '',
      employeeName: '',
      status: 'Owner',
      managerName: '',
      team: ''
    });
    setShowAddEmployee(false);
    alert('Employee added successfully!');
  };

  const handleAddKPI = () => {
    if (!newKPI.kpiName || !newKPI.target || !selectedKPIEmployee) {
      alert('Please fill in all required fields and select an employee');
      return;
    }

    const kpi = {
      id: `kpi${Date.now()}`,
      name: newKPI.kpiName,
      target: parseFloat(newKPI.target),
      current: 0,
      unit: newKPI.unit,
      period: newKPI.period,
      linkedTasks: newKPI.linkedTasks,
      completion: 0
    };

    const existingEmployee = employeeKPIs.find(e => e.employeeId === selectedKPIEmployee.employeeId);

    if (existingEmployee) {
      const updatedKPIs = employeeKPIs.map(e =>
        e.employeeId === selectedKPIEmployee.employeeId
          ? { ...e, kpis: [...e.kpis, kpi] }
          : e
      );
      setEmployeeKPIs(updatedKPIs);
    } else {
      setEmployeeKPIs([
        ...employeeKPIs,
        {
          id: employeeKPIs.length + 1,
          employeeId: selectedKPIEmployee.employeeId,
          employeeName: selectedKPIEmployee.employeeName,
          kpis: [kpi]
        }
      ]);
    }

    setNewKPI({
      kpiName: '',
      target: '',
      unit: 'tasks',
      period: 'monthly',
      linkedTasks: []
    });
    setSelectedKPIEmployee(null);
    setShowAddKPI(false);
    alert('KPI added successfully!');
  };

  const handleDeleteEmployee = (id) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  const toggleTaskSelection = (task) => {
    if (newKPI.linkedTasks.includes(task)) {
      setNewKPI({
        ...newKPI,
        linkedTasks: newKPI.linkedTasks.filter(t => t !== task)
      });
    } else {
      setNewKPI({
        ...newKPI,
        linkedTasks: [...newKPI.linkedTasks, task]
      });
    }
  };

  const handleEmployeeKPIClick = (empKPI) => {
    setSelectedEmployeeForKPIs(empKPI);
    setShowKPIDetails(true);
  };

  const handleAddComment = (kpiId) => {
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    const comment = {
      id: `c${Date.now()}`,
      author: 'Current User', // In real app, this would be the logged-in user
      role: 'Manager', // This would be determined by user's role
      date: new Date().toISOString().split('T')[0],
      text: newComment
    };

    const updatedKPIs = employeeKPIs.map(emp => {
      if (emp.employeeId === selectedEmployeeForKPIs.employeeId) {
        return {
          ...emp,
          kpis: emp.kpis.map(kpi =>
            kpi.id === kpiId
              ? { ...kpi, comments: [...kpi.comments, comment] }
              : kpi
          )
        };
      }
      return emp;
    });

    setEmployeeKPIs(updatedKPIs);

    // Update selected employee to reflect new comments
    const updatedEmployee = updatedKPIs.find(e => e.employeeId === selectedEmployeeForKPIs.employeeId);
    setSelectedEmployeeForKPIs(updatedEmployee);
    setNewComment('');
  };

  const filteredEmployees = employees.filter(emp =>
    emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const teamStats = {
    totalEmployees: employees.length,
    owners: employees.filter(e => e.status === 'Owner' || e.status === 'Both').length,
    reviewers: employees.filter(e => e.status === 'Reviewer' || e.status === 'Both').length,
    teams: [...new Set(employees.map(e => e.team))].filter(t => t).length
  };

  return (
    <div className="flex h-screen bg-[#f7f5f2]">
      <CloseSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <ClosePageHeader
          title="Team Management"
          subtitle="Manage team members and track performance KPIs"
        />

        {/* Content */}
        <div className="px-8 py-6">
          {/* Section Tabs */}
          <div className="flex gap-4 mb-6 border-b border-slate-200">
            <button
              onClick={() => setSelectedSection('listing')}
              className={`pb-3 px-4 font-semibold transition-colors relative ${
                selectedSection === 'listing'
                  ? 'text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Team Listing
              {selectedSection === 'listing' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
              )}
            </button>
            <button
              onClick={() => setSelectedSection('kpis')}
              className={`pb-3 px-4 font-semibold transition-colors relative ${
                selectedSection === 'kpis'
                  ? 'text-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Team KPIs
              {selectedSection === 'kpis' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
              )}
            </button>
          </div>

          {/* SECTION 1: Team Listing */}
          {selectedSection === 'listing' && (
            <div>
              {/* Search and Add Employee */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search employees by name, ID, or team..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddEmployee(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={20} />
                    Add Employee
                  </button>
                </div>
              </div>

              {/* Employee Table */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Employee ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Employee Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Manager Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Team</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredEmployees.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                            <Users className="mx-auto mb-2 text-slate-300" size={48} />
                            <p>No employees found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredEmployees.map(employee => (
                          <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <span className="text-sm font-semibold text-indigo-600">{employee.employeeId}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <span className="text-indigo-600 text-xs font-semibold">
                                    {employee.employeeName.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-[#101828]">{employee.employeeName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                                {employee.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-700">{employee.managerName}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-slate-600">{employee.team}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Employee"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Employee"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Team Summary */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <p className="text-sm text-slate-600 mb-1">Total Employees</p>
                  <p className="text-3xl font-bold text-[#101828]">{teamStats.totalEmployees}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <p className="text-sm text-slate-600 mb-1">Task Owners</p>
                  <p className="text-3xl font-bold text-indigo-600">{teamStats.owners}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <p className="text-sm text-slate-600 mb-1">Reviewers</p>
                  <p className="text-3xl font-bold text-purple-600">{teamStats.reviewers}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                  <p className="text-sm text-slate-600 mb-1">Teams</p>
                  <p className="text-3xl font-bold text-green-600">{teamStats.teams}</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Team KPIs */}
          {selectedSection === 'kpis' && (
            <div>
              {/* Add KPI Button */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#101828]">Employee Performance KPIs</h3>
                    <p className="text-sm text-slate-600">Click on an employee to view their KPIs and add comments</p>
                  </div>
                  <button
                    onClick={() => setShowAddKPI(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={20} />
                    Add KPI
                  </button>
                </div>
              </div>

              {/* Employee List for KPIs */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                {employeeKPIs.length === 0 ? (
                  <div className="p-12 text-center">
                    <Target className="mx-auto mb-4 text-slate-300" size={64} />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No KPIs Defined Yet</h3>
                    <p className="text-slate-500">
                      Click "Add KPI" to create performance metrics for your team
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Employee ID</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Employee Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Manager</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Team</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Total KPIs</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Avg Completion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {employeeKPIs.map(empKPI => {
                          const avgCompletion = (empKPI.kpis.reduce((sum, kpi) => sum + kpi.completion, 0) / empKPI.kpis.length).toFixed(0);
                          return (
                            <tr
                              key={empKPI.id}
                              onClick={() => handleEmployeeKPIClick(empKPI)}
                              className="hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <td className="px-4 py-3">
                                <span className="text-sm font-semibold text-indigo-600">{empKPI.employeeId}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span className="text-indigo-600 text-xs font-semibold">
                                      {empKPI.employeeName.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <span className="text-sm font-medium text-[#101828]">{empKPI.employeeName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-slate-700">{empKPI.managerName}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-slate-600">{empKPI.team}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm font-semibold text-[#101828]">{empKPI.kpis.length}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-semibold ${getKPIStatusColor(avgCompletion)}`}>
                                    {avgCompletion}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Side Panel */}
      {showAddEmployee && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAddEmployee(false)}
          ></div>
          <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#101828]">Add Employee</h2>
              <button
                onClick={() => setShowAddEmployee(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEmployee.employeeId}
                  onChange={(e) => setNewEmployee({...newEmployee, employeeId: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="e.g., EMP007"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Employee Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEmployee.employeeName}
                  onChange={(e) => setNewEmployee({...newEmployee, employeeName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={newEmployee.status}
                  onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                >
                  <option value="Owner">Owner</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="Both">Both</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Role in task management</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Manager Name
                </label>
                <input
                  type="text"
                  value={newEmployee.managerName}
                  onChange={(e) => setNewEmployee({...newEmployee, managerName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="e.g., Michael Chen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Team
                </label>
                <input
                  type="text"
                  value={newEmployee.team}
                  onChange={(e) => setNewEmployee({...newEmployee, team: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="e.g., Financial Operations"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <button
                  onClick={handleAddEmployee}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Add Employee
                </button>
                <button
                  onClick={() => setShowAddEmployee(false)}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add KPI Side Panel */}
      {showAddKPI && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAddKPI(false)}
          ></div>
          <div className="fixed right-0 top-0 bottom-0 w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#101828]">Add KPI</h2>
              <button
                onClick={() => setShowAddKPI(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Employee <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedKPIEmployee?.employeeId || ''}
                  onChange={(e) => {
                    const emp = employees.find(employee => employee.employeeId === e.target.value);
                    setSelectedKPIEmployee(emp);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                >
                  <option value="">Select an employee...</option>
                  {employees.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.employeeName} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  KPI Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newKPI.kpiName}
                  onChange={(e) => setNewKPI({...newKPI, kpiName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  placeholder="e.g., Tasks Completed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Target <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newKPI.target}
                    onChange={(e) => setNewKPI({...newKPI, target: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                    placeholder="e.g., 25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unit
                  </label>
                  <select
                    value={newKPI.unit}
                    onChange={(e) => setNewKPI({...newKPI, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                  >
                    <option value="tasks">tasks</option>
                    <option value="reviews">reviews</option>
                    <option value="hours">hours</option>
                    <option value="%">%</option>
                    <option value="days">days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Period
                </label>
                <select
                  value={newKPI.period}
                  onChange={(e) => setNewKPI({...newKPI, period: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828]"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Link to Tasks (Optional)
                </label>
                <p className="text-xs text-slate-500 mb-2">Select tasks to associate with this KPI</p>
                <div className="border border-slate-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {availableTasks.map(task => (
                    <label key={task} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={newKPI.linkedTasks.includes(task)}
                        onChange={() => toggleTaskSelection(task)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-[#101828]">{task}</span>
                    </label>
                  ))}
                </div>
                {newKPI.linkedTasks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {newKPI.linkedTasks.map(task => (
                      <span key={task} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                        {task}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <button
                  onClick={handleAddKPI}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Add KPI
                </button>
                <button
                  onClick={() => setShowAddKPI(false)}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* KPI Details Side Panel */}
      {showKPIDetails && selectedEmployeeForKPIs && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowKPIDetails(false)}
          ></div>
          <div className="fixed right-0 top-0 bottom-0 w-[700px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#101828]">KPI Details</h2>
                <p className="text-sm text-slate-600 mt-1">{selectedEmployeeForKPIs.employeeName} ({selectedEmployeeForKPIs.employeeId})</p>
              </div>
              <button
                onClick={() => setShowKPIDetails(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Employee Info */}
              <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-base font-semibold">
                      {selectedEmployeeForKPIs.employeeName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-900">{selectedEmployeeForKPIs.employeeName}</h3>
                    <p className="text-sm text-indigo-700">{selectedEmployeeForKPIs.team}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-indigo-600 font-medium">Manager:</span>
                    <span className="text-indigo-900 ml-1">{selectedEmployeeForKPIs.managerName}</span>
                  </div>
                  <div>
                    <span className="text-indigo-600 font-medium">Total KPIs:</span>
                    <span className="text-indigo-900 ml-1">{selectedEmployeeForKPIs.kpis.length}</span>
                  </div>
                </div>
              </div>

              {/* KPIs List */}
              {selectedEmployeeForKPIs.kpis.map((kpi, index) => (
                <div key={kpi.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  {/* KPI Header */}
                  <div className="bg-slate-50 p-4 border-b border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Target size={18} className="text-indigo-600" />
                        <h4 className="font-semibold text-[#101828]">{kpi.name}</h4>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        kpi.completion >= 100 ? 'bg-green-100 text-green-700' :
                        kpi.completion >= 80 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {kpi.completion}% Complete
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                        <span>Progress</span>
                        <span className="font-semibold">{kpi.current} / {kpi.target} {kpi.unit}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            kpi.completion >= 100 ? 'bg-green-600' :
                            kpi.completion >= 80 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(kpi.completion, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* KPI Details */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500">Period:</span>
                        <span className="text-slate-700 font-medium ml-1 capitalize">{kpi.period}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Target:</span>
                        <span className="text-slate-700 font-medium ml-1">{kpi.target} {kpi.unit}</span>
                      </div>
                    </div>

                    {/* Linked Tasks */}
                    {kpi.linkedTasks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-300">
                        <p className="text-xs font-medium text-slate-600 mb-2">Linked Tasks:</p>
                        <div className="flex flex-wrap gap-1">
                          {kpi.linkedTasks.map((task, idx) => (
                            <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                              {task}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comments Section */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare size={16} className="text-slate-600" />
                      <h5 className="text-sm font-semibold text-[#101828]">
                        Comments ({kpi.comments.length})
                      </h5>
                    </div>

                    {/* Existing Comments */}
                    <div className="space-y-3 mb-4">
                      {kpi.comments.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">No comments yet. Be the first to add one!</p>
                      ) : (
                        kpi.comments.map(comment => (
                          <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <span className="text-indigo-600 text-xs font-semibold">
                                    {comment.author.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-[#101828]">{comment.author}</p>
                                  <p className="text-xs text-slate-500">
                                    {comment.role} • {comment.date}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-slate-700 ml-8">{comment.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment Form */}
                    <div className="border-t border-slate-200 pt-4">
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        Add Comment
                      </label>
                      <div className="flex gap-2">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#101828] text-sm min-h-[80px] resize-none"
                          placeholder="Add your feedback or comment..."
                        />
                        <button
                          onClick={() => handleAddComment(kpi.id)}
                          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors self-end"
                          title="Send Comment"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Your comment will be visible to the employee, their manager, and peers.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

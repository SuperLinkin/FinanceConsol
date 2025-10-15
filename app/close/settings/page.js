'use client';

import { useState } from 'react';
import CloseSidebar from '@/components/close/CloseSidebar';
import { Settings as SettingsIcon, Calendar, Users, Bell, Database, Shield } from 'lucide-react';

export default function CloseSettings() {
  const [activeTab, setActiveTab] = useState('general');

  // Mock settings data
  const [generalSettings, setGeneralSettings] = useState({
    fiscalYearEnd: '12',
    closeDay: '5',
    autoReminders: true,
    emailNotifications: true
  });

  const [closeSchedule, setCloseSchedule] = useState({
    monthEnd: 5,
    quarterEnd: 7,
    yearEnd: 15
  });

  const [approvalSettings, setApprovalSettings] = useState({
    requireReconciliationApproval: true,
    requireVarianceExplanation: true,
    varianceThreshold: 5000
  });

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'schedule', label: 'Close Schedule', icon: Calendar },
    { id: 'approvals', label: 'Approvals', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'Users & Teams', icon: Users }
  ];

  return (
    <div className="flex h-screen bg-[#f7f5f2]">
      <CloseSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-[#101828] text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Close Settings</h1>
            <p className="text-gray-300">Configure your close process settings and preferences</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <div className="flex gap-6">
            {/* Tabs Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <nav className="space-y-1">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'bg-[#101828] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={18} />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-[#101828] mb-6">General Settings</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fiscal Year End Month
                      </label>
                      <select
                        value={generalSettings.fiscalYearEnd}
                        onChange={(e) => setGeneralSettings({...generalSettings, fiscalYearEnd: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Close Day of Month
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={generalSettings.closeDay}
                        onChange={(e) => setGeneralSettings({...generalSettings, closeDay: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">The target day to complete monthly close</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Auto Reminders</p>
                          <p className="text-xs text-gray-500">Automatically send reminders for upcoming tasks</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={generalSettings.autoReminders}
                            onChange={(e) => setGeneralSettings({...generalSettings, autoReminders: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                          <p className="text-xs text-gray-500">Receive email updates about close activities</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={generalSettings.emailNotifications}
                            onChange={(e) => setGeneralSettings({...generalSettings, emailNotifications: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button className="px-6 py-2 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Close Schedule */}
              {activeTab === 'schedule' && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-[#101828] mb-6">Close Schedule</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Month-End Close (Business Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="15"
                        value={closeSchedule.monthEnd}
                        onChange={(e) => setCloseSchedule({...closeSchedule, monthEnd: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Number of business days to complete month-end close</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quarter-End Close (Business Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={closeSchedule.quarterEnd}
                        onChange={(e) => setCloseSchedule({...closeSchedule, quarterEnd: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Number of business days to complete quarter-end close</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year-End Close (Business Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={closeSchedule.yearEnd}
                        onChange={(e) => setCloseSchedule({...closeSchedule, yearEnd: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Number of business days to complete year-end close</p>
                    </div>

                    <div className="pt-6">
                      <button className="px-6 py-2 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Settings */}
              {activeTab === 'approvals' && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-[#101828] mb-6">Approval Settings</h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Require Reconciliation Approval</p>
                        <p className="text-xs text-gray-500">All reconciliations must be reviewed and approved</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={approvalSettings.requireReconciliationApproval}
                          onChange={(e) => setApprovalSettings({...approvalSettings, requireReconciliationApproval: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Require Variance Explanation</p>
                        <p className="text-xs text-gray-500">Material variances must have an explanation</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={approvalSettings.requireVarianceExplanation}
                          onChange={(e) => setApprovalSettings({...approvalSettings, requireVarianceExplanation: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variance Threshold ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={approvalSettings.varianceThreshold}
                        onChange={(e) => setApprovalSettings({...approvalSettings, varianceThreshold: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Variances above this amount are considered material</p>
                    </div>

                    <div className="pt-6">
                      <button className="px-6 py-2 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-[#101828] mb-6">Notification Preferences</h2>
                  <p className="text-gray-600 mb-6">Configure when and how you receive notifications</p>

                  <div className="space-y-4">
                    {[
                      { label: 'Task Assignments', desc: 'When a task is assigned to you' },
                      { label: 'Task Due Dates', desc: 'Reminders for upcoming task deadlines' },
                      { label: 'Reconciliation Updates', desc: 'When reconciliations are completed or need review' },
                      { label: 'Variance Alerts', desc: 'When material variances are detected' },
                      { label: 'Close Milestones', desc: 'Updates on close process milestones' },
                      { label: 'Team Activity', desc: 'When team members complete tasks' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6">
                    <button className="px-6 py-2 bg-[#101828] text-white rounded-lg hover:bg-[#1e293b] transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Users & Teams */}
              {activeTab === 'users' && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-[#101828] mb-6">Users & Teams</h2>
                  <p className="text-gray-600 mb-6">Manage users and their access to the close process</p>

                  <div className="text-center py-12">
                    <Users className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-600 mb-2">User management coming soon</p>
                    <p className="text-sm text-gray-500">Configure team members and their roles in the close process</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

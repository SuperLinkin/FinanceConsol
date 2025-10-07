'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Copy,
  Save,
  Sparkles,
  Code,
  Calculator,
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';

const FORMULA_VARIABLES = [
  { name: 'account_balance', description: 'GL Account Balance', example: 'account_balance("1000")' },
  { name: 'entity_balance', description: 'Entity Total Balance', example: 'entity_balance("US-001")' },
  { name: 'percentage', description: 'Percentage Calculation', example: 'percentage(value, 25)' },
  { name: 'sum', description: 'Sum Multiple Values', example: 'sum(value1, value2, value3)' },
  { name: 'multiply', description: 'Multiplication', example: 'multiply(value1, value2)' },
  { name: 'divide', description: 'Division', example: 'divide(value1, value2)' },
  { name: 'if_condition', description: 'Conditional Logic', example: 'if(condition, true_value, false_value)' },
];

const AI_PROMPTS = [
  "Calculate depreciation expense for fixed assets",
  "Adjust deferred tax based on temporary differences",
  "Calculate provision for doubtful debts",
  "Accrue interest expense on loans",
  "Record fair value adjustments",
  "Calculate equity method investment adjustment",
];

export default function BuilderPage() {
  const [activeSection, setActiveSection] = useState('all'); // 'all' or 'create'
  const [builds, setBuilds] = useState([]);
  const [filteredBuilds, setFilteredBuilds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [editingBuild, setEditingBuild] = useState(null);

  const [buildForm, setBuildForm] = useState({
    build_name: '',
    description: '',
    build_type: 'adjustment', // 'adjustment', 'accrual', 'provision', 'revaluation', 'custom'
    formula: '',
    debit_account: '',
    credit_account: '',
    is_template: false,
    is_active: true,
    execution_order: 1,
    conditions: []
  });

  useEffect(() => {
    fetchBuilds();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [builds, searchQuery, filterStatus]);

  const fetchBuilds = async () => {
    try {
      const { data, error } = await supabase
        .from('builder_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setBuilds([]);
        return;
      }
      setBuilds(data || []);
    } catch (error) {
      console.error('Error fetching builds:', error);
      setBuilds([]);
    }
  };

  const applyFilters = () => {
    let filtered = [...builds];

    if (searchQuery) {
      filtered = filtered.filter(build =>
        build.build_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        build.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(build =>
        filterStatus === 'active' ? build.is_active : !build.is_active
      );
    }

    setFilteredBuilds(filtered);
  };

  const handleAIAssist = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter what you want to build');
      return;
    }

    // Simulate AI response (in production, this would call an AI API)
    const mockAISuggestion = {
      formula: `// AI Generated Formula for: ${aiPrompt}\n` +
               `const depreciation = multiply(asset_value, depreciation_rate);\n` +
               `const adjustment = divide(depreciation, 12); // Monthly\n` +
               `return adjustment;`,
      debit_account: '6000', // Expense account
      credit_account: '1500', // Accumulated depreciation
      description: `Auto-generated: ${aiPrompt}`,
      explanation: "This formula calculates the monthly depreciation expense based on the asset value and depreciation rate. " +
                   "It debits the expense account and credits the accumulated depreciation account."
    };

    setAiSuggestion(mockAISuggestion);
  };

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      setBuildForm({
        ...buildForm,
        formula: aiSuggestion.formula,
        debit_account: aiSuggestion.debit_account,
        credit_account: aiSuggestion.credit_account,
        description: aiSuggestion.description
      });
      setShowAIAssist(false);
      setAiSuggestion(null);
    }
  };

  const handleSaveBuild = async () => {
    if (!buildForm.build_name || !buildForm.formula) {
      alert('Please provide build name and formula');
      return;
    }

    try {
      const buildData = {
        build_name: buildForm.build_name,
        description: buildForm.description,
        build_type: buildForm.build_type,
        formula: buildForm.formula,
        debit_account: buildForm.debit_account,
        credit_account: buildForm.credit_account,
        is_template: buildForm.is_template,
        is_active: buildForm.is_active,
        execution_order: buildForm.execution_order,
        conditions: buildForm.conditions
      };

      if (editingBuild) {
        const { error } = await supabase
          .from('builder_entries')
          .update(buildData)
          .eq('id', editingBuild.id);

        if (error) throw error;
        alert('Build updated successfully!');
      } else {
        const { error } = await supabase
          .from('builder_entries')
          .insert(buildData);

        if (error) throw error;
        alert('Build created successfully!');
      }

      resetForm();
      fetchBuilds();
      setActiveSection('all');
    } catch (error) {
      console.error('Error saving build:', error);
      alert('Failed to save build: ' + error.message);
    }
  };

  const handleEdit = (build) => {
    setBuildForm({
      build_name: build.build_name,
      description: build.description || '',
      build_type: build.build_type,
      formula: build.formula,
      debit_account: build.debit_account || '',
      credit_account: build.credit_account || '',
      is_template: build.is_template,
      is_active: build.is_active,
      execution_order: build.execution_order || 1,
      conditions: build.conditions || []
    });
    setEditingBuild(build);
    setActiveSection('create');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this build?')) return;

    try {
      const { error } = await supabase
        .from('builder_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Build deleted successfully!');
      fetchBuilds();
    } catch (error) {
      console.error('Error deleting build:', error);
      alert('Failed to delete build: ' + error.message);
    }
  };

  const handleDuplicate = (build) => {
    setBuildForm({
      build_name: `${build.build_name} (Copy)`,
      description: build.description || '',
      build_type: build.build_type,
      formula: build.formula,
      debit_account: build.debit_account || '',
      credit_account: build.credit_account || '',
      is_template: build.is_template,
      is_active: true,
      execution_order: build.execution_order || 1,
      conditions: build.conditions || []
    });
    setEditingBuild(null);
    setActiveSection('create');
  };

  const resetForm = () => {
    setBuildForm({
      build_name: '',
      description: '',
      build_type: 'adjustment',
      formula: '',
      debit_account: '',
      credit_account: '',
      is_template: false,
      is_active: true,
      execution_order: 1,
      conditions: []
    });
    setEditingBuild(null);
  };

  const insertVariable = (variable) => {
    setBuildForm({
      ...buildForm,
      formula: buildForm.formula + (buildForm.formula ? '\n' : '') + variable.example
    });
  };

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader title="Consolidation Builder" subtitle="Create and manage consolidation entries" />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">

        <div className="flex items-center justify-end mb-10">
          <button
            onClick={() => {
              resetForm();
              setActiveSection('create');
            }}
            className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 hover:shadow-lg transition-all duration-200 shadow-md"
          >
            <Plus size={20} />
            Create New Build
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
              activeSection === 'all'
                ? 'bg-white/80 backdrop-blur-sm text-slate-900 shadow-lg'
                : 'bg-white/40 text-slate-600 hover:bg-white/60'
            }`}
          >
            <Filter size={18} className="inline mr-2 mb-1" />
            All Builds ({filteredBuilds.length})
          </button>
          <button
            onClick={() => setActiveSection('create')}
            className={`px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
              activeSection === 'create'
                ? 'bg-white/80 backdrop-blur-sm text-slate-900 shadow-lg'
                : 'bg-white/40 text-slate-600 hover:bg-white/60'
            }`}
          >
            <Wrench size={18} className="inline mr-2 mb-1" />
            {editingBuild ? 'Edit Build' : 'Create Build'}
          </button>
        </div>

        {/* SECTION 1: ALL BUILDS */}
        {activeSection === 'all' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search builds..."
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                      filterStatus === 'all'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus('active')}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                      filterStatus === 'active'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilterStatus('inactive')}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                      filterStatus === 'inactive'
                        ? 'bg-slate-400 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>

            {/* Builds List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredBuilds.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-16 text-center shadow-lg border border-slate-200/60">
                  <Wrench size={64} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 font-semibold text-lg mb-2">No builds found</p>
                  <p className="text-slate-400">Create your first build to get started</p>
                </div>
              ) : (
                filteredBuilds.map((build) => (
                  <div
                    key={build.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60 hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">{build.build_name}</h3>
                          {build.is_template && (
                            <span className="px-3 py-1 bg-slate-700 text-white text-xs font-semibold rounded-full">
                              Template
                            </span>
                          )}
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            build.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {build.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full capitalize">
                            {build.build_type}
                          </span>
                        </div>
                        {build.description && (
                          <p className="text-slate-600 mb-3">{build.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Code size={14} />
                            Formula: {build.formula.split('\n')[0].substring(0, 50)}...
                          </span>
                          {build.debit_account && build.credit_account && (
                            <span className="flex items-center gap-1">
                              <ChevronRight size={14} />
                              Dr: {build.debit_account} / Cr: {build.credit_account}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDuplicate(build)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(build)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(build.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: CREATE/EDIT BUILD */}
        {activeSection === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/60">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editingBuild ? 'Edit Build' : 'Create New Build'}
                  </h2>
                  <button
                    onClick={() => setShowAIAssist(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 hover:shadow-lg transition-all duration-200"
                  >
                    <Sparkles size={18} />
                    AI Assist
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Build Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Build Name *
                    </label>
                    <input
                      type="text"
                      value={buildForm.build_name}
                      onChange={(e) => setBuildForm({ ...buildForm, build_name: e.target.value })}
                      placeholder="e.g., Monthly Depreciation Adjustment"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    />
                  </div>

                  {/* Build Type */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Build Type *
                    </label>
                    <select
                      value={buildForm.build_type}
                      onChange={(e) => setBuildForm({ ...buildForm, build_type: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    >
                      <option value="adjustment">Adjustment</option>
                      <option value="accrual">Accrual</option>
                      <option value="provision">Provision</option>
                      <option value="revaluation">Revaluation</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={buildForm.description}
                      onChange={(e) => setBuildForm({ ...buildForm, description: e.target.value })}
                      placeholder="Describe what this build does..."
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    />
                  </div>

                  {/* GL Accounts */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Debit Account
                      </label>
                      <input
                        type="text"
                        value={buildForm.debit_account}
                        onChange={(e) => setBuildForm({ ...buildForm, debit_account: e.target.value })}
                        placeholder="e.g., 6000"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Credit Account
                      </label>
                      <input
                        type="text"
                        value={buildForm.credit_account}
                        onChange={(e) => setBuildForm({ ...buildForm, credit_account: e.target.value })}
                        placeholder="e.g., 1500"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Formula Editor */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Formula Logic *
                    </label>
                    <textarea
                      value={buildForm.formula}
                      onChange={(e) => setBuildForm({ ...buildForm, formula: e.target.value })}
                      placeholder="Enter your formula logic here..."
                      rows={8}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 font-mono text-sm"
                    />
                  </div>

                  {/* Options */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={buildForm.is_template}
                        onChange={(e) => setBuildForm({ ...buildForm, is_template: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-slate-700">Save as Template</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={buildForm.is_active}
                        onChange={(e) => setBuildForm({ ...buildForm, is_active: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="font-medium text-slate-700">Active</span>
                    </label>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        resetForm();
                        setActiveSection('all');
                      }}
                      className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveBuild}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 hover:shadow-lg transition-all duration-200"
                    >
                      <Save size={20} />
                      {editingBuild ? 'Update Build' : 'Save Build'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Helper Panel */}
            <div className="space-y-6">
              {/* Formula Variables */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calculator size={20} />
                  Formula Variables
                </h3>
                <div className="space-y-3">
                  {FORMULA_VARIABLES.map((variable, index) => (
                    <div
                      key={index}
                      onClick={() => insertVariable(variable)}
                      className="p-3 bg-slate-50 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors border border-slate-200"
                    >
                      <div className="font-semibold text-sm text-slate-900">{variable.name}</div>
                      <div className="text-xs text-slate-600 mt-1">{variable.description}</div>
                      <code className="text-xs text-blue-600 mt-2 block">{variable.example}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-slate-900 rounded-2xl p-6 shadow-lg text-white">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Zap size={20} />
                  Quick Tips
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Use AI Assist if you&apos;re unsure about the formula</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Click on variables to insert them into your formula</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Templates can be reused across multiple periods</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>Test your formulas before activating them</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* AI Assist Modal */}
        {showAIAssist && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
              onClick={() => setShowAIAssist(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
                <div className="bg-indigo-600 text-white px-8 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">AI Formula Assistant</h3>
                      <p className="text-sm text-indigo-100">Describe what you want to build</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAIAssist(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-8 overflow-y-auto max-h-[calc(80vh-100px)]">
                  {/* AI Prompt Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      What do you want to build?
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., I need to calculate monthly depreciation for fixed assets using straight-line method..."
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
                    />
                  </div>

                  {/* Quick Prompts */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Or choose a common scenario:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {AI_PROMPTS.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => setAiPrompt(prompt)}
                          className="p-3 text-left text-sm bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleAIAssist}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 hover:shadow-lg transition-all duration-200 mb-6"
                  >
                    <Sparkles size={20} />
                    Generate Formula
                  </button>

                  {/* AI Suggestion */}
                  {aiSuggestion && (
                    <div className="space-y-4 animate-slideUp">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                          <CheckCircle size={20} />
                          AI Generated Formula
                        </div>
                        <p className="text-sm text-green-700">{aiSuggestion.explanation}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Formula:</label>
                        <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-sm overflow-x-auto">
                          {aiSuggestion.formula}
                        </pre>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Debit Account:</label>
                          <input
                            type="text"
                            value={aiSuggestion.debit_account}
                            readOnly
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Credit Account:</label>
                          <input
                            type="text"
                            value={aiSuggestion.credit_account}
                            readOnly
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                          />
                        </div>
                      </div>

                      <button
                        onClick={applyAISuggestion}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={20} />
                        Apply This Formula
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}

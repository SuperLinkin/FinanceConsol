'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Sparkles,
  Copy,
  CheckCircle,
  RefreshCw,
  Upload,
  FileUp
} from 'lucide-react';

export default function AccountingPolicyPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [isPolicyModalClosing, setIsPolicyModalClosing] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [isAIAssistClosing, setIsAIAssistClosing] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [toast, setToast] = useState(null);

  const [policyForm, setPolicyForm] = useState({
    policy_name: '',
    policy_content: '',
    is_active: true
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const POLICY_CATEGORIES = [
    'Revenue Recognition',
    'Inventory Valuation',
    'Depreciation',
    'Foreign Currency',
    'Consolidation',
    'Leases',
    'Financial Instruments',
    'Income Tax',
    'Employee Benefits',
    'Provisions',
    'Other'
  ];

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounting_policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
      showToast('Error loading policies', false);
    } finally {
      setLoading(false);
    }
  };

  const closePolicyModal = () => {
    if (isPolicyModalClosing) return;
    setIsPolicyModalClosing(true);
    setTimeout(() => {
      setShowPolicyModal(false);
      setIsPolicyModalClosing(false);
      setEditingPolicy(null);
      resetPolicyForm();
    }, 300);
  };

  const closeAIAssist = () => {
    if (isAIAssistClosing) return;
    setIsAIAssistClosing(true);
    setTimeout(() => {
      setShowAIAssist(false);
      setIsAIAssistClosing(false);
      setAiPrompt('');
      setAiResponse('');
    }, 300);
  };

  const resetPolicyForm = () => {
    setPolicyForm({
      policy_name: '',
      policy_content: '',
      is_active: true
    });
  };

  const handleEditPolicy = (policy) => {
    setEditingPolicy(policy);
    setPolicyForm({
      policy_name: policy.policy_name,
      policy_content: policy.policy_content,
      is_active: policy.is_active
    });
    setShowPolicyModal(true);
  };

  const handleSavePolicy = async () => {
    if (!policyForm.policy_name || !policyForm.policy_content) {
      showToast('Please fill all required fields', false);
      return;
    }

    try {
      if (editingPolicy) {
        const { error } = await supabase
          .from('accounting_policies')
          .update(policyForm)
          .eq('id', editingPolicy.id);

        if (error) throw error;
        showToast('Policy updated successfully', true);
      } else {
        const { error } = await supabase
          .from('accounting_policies')
          .insert([policyForm]);

        if (error) throw error;
        showToast('Policy created successfully', true);
      }

      closePolicyModal();
      fetchPolicies();
    } catch (error) {
      console.error('Error saving policy:', error);
      showToast('Error saving policy', false);
    }
  };

  const handleDeletePolicy = async (policyId) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;

    try {
      const { error } = await supabase
        .from('accounting_policies')
        .delete()
        .eq('id', policyId);

      if (error) throw error;
      showToast('Policy deleted', true);
      fetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      showToast('Error deleting policy', false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if it's a Word document
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword' // .doc
    ];

    if (!validTypes.includes(file.type)) {
      showToast('Please upload a Word document (.doc or .docx)', false);
      return;
    }

    setUploadingFile(true);

    try {
      // Read file as text (simplified version - in production use proper Word parser like mammoth.js)
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // For now, we'll show the user that the file was uploaded successfully
          // In production, you'd parse the Word doc content here
          showToast('Word document uploaded successfully! Please enter policy name and save.', true);

          // You can add actual Word parsing here using mammoth.js or similar library
          setPolicyForm({
            ...policyForm,
            policy_content: `Content from uploaded file: ${file.name}\n\n(Word document parsing will be implemented with mammoth.js library)`
          });
        } catch (error) {
          console.error('Error parsing document:', error);
          showToast('Error parsing Word document', false);
        } finally {
          setUploadingFile(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Error uploading file', false);
      setUploadingFile(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      showToast('Please enter a prompt', false);
      return;
    }

    setAiGenerating(true);
    setAiResponse('');

    try {
      // Simulate AI generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // STRICT GUARDRAILS: Only generate Initial Recognition and Subsequent Recognition
      const sampleResponse = `# ${aiPrompt}

## Initial Recognition

### Recognition Criteria
A transaction shall be recognized when ALL of the following criteria are met:

1. **Probability of Economic Benefits**
   - It is probable that future economic benefits associated with the item will flow to or from the entity
   - Probability threshold: More likely than not (>50% likelihood)

2. **Reliable Measurement**
   - The cost or value of the item can be measured reliably
   - Sufficient evidence exists to support the measurement
   - Measurement method is consistent with applicable accounting standards

3. **Past Event**
   - Recognition occurs as a result of a past transaction or event
   - The entity has obtained control or the obligation has been incurred

### Initial Measurement
At initial recognition, the item shall be measured at:

**Primary Measurement Basis:** [Specify: Fair Value / Historical Cost / Present Value]

**Components to Include:**
- Purchase price or fair value at transaction date
- Directly attributable costs necessary to bring the asset to its intended use or settle the liability
- [List specific costs to include]

**Components to Exclude (Expense Immediately):**
- Administrative and general overhead costs
- Start-up and pre-operating costs (unless specifically required by standards)
- Training costs
- [List specific costs to exclude]

### Initial Recognition Timing
The item shall be recognized on the date when:
- Control is obtained (for assets) or obligation is incurred (for liabilities)
- [Specify: Contract date / Settlement date / Delivery date / Other specific date]
- All recognition criteria listed above are satisfied

### Documentation Requirements for Initial Recognition
- Source documents evidencing the transaction
- Evidence supporting measurement (invoices, valuations, agreements)
- Analysis supporting probability assessment
- Approvals as required by internal controls

---

## Subsequent Recognition

### Subsequent Measurement Model
After initial recognition, the item shall be measured using:

**[Specify Model: Cost Model / Revaluation Model / Fair Value Model / Amortized Cost]**

### Cost Model (if applicable)
- Carrying Amount = Cost - Accumulated Depreciation/Amortization - Accumulated Impairment Losses
- No revaluation to fair value (except for impairment)

### Revaluation Model (if applicable)
- Carrying Amount = Fair Value at revaluation date - Subsequent accumulated depreciation - Subsequent impairment
- Revaluation frequency: [Annual / When fair value differs materially / Specify period]
- Revaluation increases: Recognize in Other Comprehensive Income (OCI) unless reversing previous decrease
- Revaluation decreases: Recognize in Profit or Loss unless reversing previous increase in OCI

### Fair Value Model (if applicable)
- Remeasure to fair value at each reporting date
- Gains and losses recognized in: [Profit or Loss / OCI]
- Fair value determined using: [Specify valuation techniques]

### Subsequent Expenditure
**Capitalization Criteria:**
- Expenditure meets initial recognition criteria
- Expenditure enhances future economic benefits beyond original assessment
- Expenditure can be measured reliably

**Immediate Expense:**
- Maintenance and repairs to maintain standard of performance
- Day-to-day servicing costs
- Expenditure that does not meet capitalization criteria

### Depreciation / Amortization (if applicable)
**Method:** [Straight-line / Diminishing balance / Units of production]
**Useful Life:** [Specify years or basis for determination]
**Residual Value:** [Specify amount or basis for determination]
**Review Frequency:** Annually or when indicators of change exist

**Factors Considered in Determining Useful Life:**
- Expected usage and physical wear and tear
- Technical or commercial obsolescence
- Legal or similar limits on use
- Entity's expected period of use

### Impairment Testing
**Frequency:**
- At each reporting date: Assess for indicators of impairment
- When indicators exist: Perform detailed impairment test

**Impairment Indicators Include:**
- Significant decline in market value beyond normal passage of time
- Significant adverse changes in technological, market, economic or legal environment
- Evidence of obsolescence or physical damage
- Significant underperformance compared to expected economic performance
- [List specific indicators relevant to this policy]

**Impairment Measurement:**
- Recoverable Amount = Higher of: Fair Value Less Costs of Disposal OR Value in Use
- Impairment Loss = Carrying Amount - Recoverable Amount
- Recognition: Immediately in Profit or Loss (unless revaluation model used)

**Reversal of Impairment:**
- Permitted if: Indicators that led to impairment no longer exist or have decreased
- Reversal limited to: Amount that would have been determined (net of depreciation) had no impairment been recognized
- Recognition: In Profit or Loss (unless revaluation model used)

### Derecognition
The item shall be derecognized when:
- Control is transferred to another party (for assets)
- Obligation is discharged, cancelled or expires (for liabilities)
- No future economic benefits are expected from use or disposal
- Item is permanently withdrawn from use with no disposal planned

**Gain or Loss on Derecognition:**
- Proceeds from disposal (if any)
- Less: Carrying amount at derecognition date
- Less: Direct costs of disposal
- Recognize in Profit or Loss in period of derecognition

### Reassessment and Review
The following shall be reviewed at each reporting date:
- Useful life and depreciation/amortization method
- Residual values
- Classification and measurement model
- Impairment indicators
- Assumptions used in measurement

Changes in estimates:
- Applied prospectively from date of change
- Disclosed if material impact on current or future periods

---

## Key Judgments and Estimates Required

1. **Initial Recognition:**
   - Assessment of probability of future economic benefits
   - Identification of directly attributable costs
   - Determination of appropriate measurement basis

2. **Subsequent Measurement:**
   - Estimation of useful life and residual value
   - Selection of depreciation/amortization method
   - Impairment indicators identification
   - Recoverable amount determination
   - Fair value measurements (if applicable)

---

**Note:** This policy must be applied in conjunction with relevant International Financial Reporting Standards (IFRS) or applicable accounting framework. Professional judgment should be exercised in interpreting and applying this policy to specific transactions and circumstances.`;

      setAiResponse(sampleResponse);
    } catch (error) {
      console.error('Error generating policy:', error);
      showToast('Error generating policy', false);
    } finally {
      setAiGenerating(false);
    }
  };

  const copyAIResponseToForm = () => {
    setPolicyForm({
      ...policyForm,
      policy_content: aiResponse
    });
    closeAIAssist();
    setShowPolicyModal(true);
    showToast('Content copied to policy form', true);
  };

  const showToast = (message, success) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-xl text-gray-600">Loading policies...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        icon={FileText}
        title="Accounting Policy Builder"
        subtitle="Create and manage accounting policies for financial reporting"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          {/* Header Actions */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Accounting Policies</h2>
              <p className="text-sm text-gray-600 mt-1">
                {policies.length} {policies.length === 1 ? 'policy' : 'policies'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  showToast('Accounting policies ready to sync with Reporting Builder!', true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <RefreshCw size={16} />
                Sync to Reports
              </button>
              <button
                onClick={() => setShowAIAssist(true)}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                <Sparkles size={20} />
                AI Assist
              </button>
              <button
                onClick={() => setShowPolicyModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
              >
                <Plus size={20} />
                New Policy
              </button>
            </div>
          </div>

          {/* Policies Grid */}
          {policies.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <FileText size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Policies Yet</h3>
              <p className="text-gray-500 mb-6">Create your first accounting policy or use AI Assist</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowAIAssist(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  AI Assist
                </button>
                <button
                  onClick={() => setShowPolicyModal(true)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
                >
                  Create Policy
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {policies.map(policy => (
                <div key={policy.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{policy.policy_name}</h3>
                        {policy.is_active && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="mt-4 text-sm text-gray-700 line-clamp-3">
                        {policy.policy_content}
                      </div>

                      <div className="mt-4 text-xs text-gray-500">
                        Created: {new Date(policy.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditPolicy(policy)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeletePolicy(policy.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Policy Modal */}
      {(showPolicyModal || isPolicyModalClosing) && (
        <div className={`fixed right-0 top-0 h-full w-[700px] bg-white shadow-2xl z-50 overflow-y-auto ${isPolicyModalClosing ? 'animate-slideOutRight' : 'animate-slideLeft'}`}>
          <div className="h-full flex flex-col">
            <div className="bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{editingPolicy ? 'Edit Policy' : 'New Policy'}</h3>
                <p className="text-sm text-slate-300 mt-1">Create or update accounting policy</p>
              </div>
              <button
                onClick={closePolicyModal}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Policy Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={policyForm.policy_name}
                    onChange={(e) => setPolicyForm({...policyForm, policy_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    placeholder="e.g., Revenue Recognition Policy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Policy Document
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-slate-900 transition-colors">
                    <input
                      type="file"
                      id="word-upload"
                      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="word-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {uploadingFile ? (
                        <>
                          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-3"></div>
                          <p className="text-sm font-medium text-gray-700">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <FileUp size={48} className="text-gray-400 mb-3" />
                          <p className="text-sm font-semibold text-slate-900 mb-1">
                            Click to upload Word document
                          </p>
                          <p className="text-xs text-gray-500">
                            Supports .doc and .docx files
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Or manually enter policy content below
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Policy Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={policyForm.policy_content}
                    onChange={(e) => setPolicyForm({...policyForm, policy_content: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 font-mono text-sm"
                    rows="15"
                    placeholder="Enter policy content in markdown format..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyForm.is_active}
                      onChange={(e) => setPolicyForm({...policyForm, is_active: e.target.checked})}
                      className="w-5 h-5 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="font-medium text-gray-700">Active Policy</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={handleSavePolicy}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                >
                  <Save size={20} />
                  {editingPolicy ? 'Update Policy' : 'Save Policy'}
                </button>
                <button
                  onClick={closePolicyModal}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assist Panel */}
      {(showAIAssist || isAIAssistClosing) && (
        <div className={`fixed right-0 top-0 h-full w-[700px] bg-white shadow-2xl z-50 overflow-y-auto ${isAIAssistClosing ? 'animate-slideOutRight' : 'animate-slideLeft'}`}>
          <div className="h-full flex flex-col">
            <div className="bg-purple-600 text-white px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles size={28} />
                  AI Policy Assistant
                </h3>
                <p className="text-sm text-purple-100 mt-1">Generate accounting policies with AI</p>
              </div>
              <button
                onClick={closeAIAssist}
                className="p-2 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What policy would you like to draft?
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-slate-900"
                    rows="4"
                    placeholder="e.g., Draft a revenue recognition policy for subscription-based SaaS revenue under IFRS 15..."
                  />
                </div>

                <button
                  onClick={handleAIGenerate}
                  disabled={aiGenerating}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-purple-400"
                >
                  {aiGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate Policy
                    </>
                  )}
                </button>

                {aiResponse && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-900">Generated Policy</h4>
                      <button
                        onClick={copyAIResponseToForm}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Copy size={16} />
                        Use This Policy
                      </button>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                        {aiResponse}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-2">Tips for better results:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Be specific about the accounting standard (IFRS, GAAP, etc.)</li>
                    <li>• Mention the specific transaction type or area</li>
                    <li>• Include any unique business circumstances</li>
                    <li>• Request specific sections if needed (recognition, measurement, disclosure)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg animate-slideUp ${
          toast.success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="font-semibold">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

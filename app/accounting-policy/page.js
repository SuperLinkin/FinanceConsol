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
  RefreshCw
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
    policy_category: '',
    policy_content: '',
    is_active: true
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

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
      policy_category: '',
      policy_content: '',
      is_active: true
    });
  };

  const handleEditPolicy = (policy) => {
    setEditingPolicy(policy);
    setPolicyForm({
      policy_name: policy.policy_name,
      policy_category: policy.policy_category,
      policy_content: policy.policy_content,
      is_active: policy.is_active
    });
    setShowPolicyModal(true);
  };

  const handleSavePolicy = async () => {
    if (!policyForm.policy_name || !policyForm.policy_category || !policyForm.policy_content) {
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

      // Enhanced policy templates based on common requests
      let sampleResponse = '';

      const promptLower = aiPrompt.toLowerCase();

      if (promptLower.includes('revenue') || promptLower.includes('ifrs 15')) {
        sampleResponse = `# Revenue Recognition Policy (IFRS 15)

## 1. Objective
This policy establishes principles for recognizing revenue from contracts with customers. It ensures that revenue is recognized to depict the transfer of promised goods or services to customers in amounts that reflect the consideration to which the entity expects to be entitled.

## 2. Scope
This policy applies to all contracts with customers across all entities in the Group, except for:
- Lease contracts (IFRS 16)
- Insurance contracts (IFRS 17)
- Financial instruments (IFRS 9)

## 3. Recognition Model - Five-Step Approach

### Step 1: Identify the Contract
A contract exists when:
- All parties have approved the contract and are committed to perform
- Rights and payment terms can be identified
- Contract has commercial substance
- Collection of consideration is probable

### Step 2: Identify Performance Obligations
Goods or services that are distinct, either:
- Capable of being distinct (customer can benefit on its own), AND
- Distinct within the context of the contract (separately identifiable from other promises)

### Step 3: Determine Transaction Price
The amount of consideration to which the entity expects to be entitled, considering:
- Variable consideration (estimated using expected value or most likely amount)
- Significant financing component (if payment timing differs from transfer of goods/services)
- Non-cash consideration (measured at fair value)
- Consideration payable to customer (reduces transaction price)

### Step 4: Allocate Transaction Price
Allocate to each performance obligation based on relative standalone selling prices. If not observable, estimate using:
- Adjusted market assessment approach
- Expected cost plus margin approach
- Residual approach (only in limited circumstances)

### Step 5: Recognize Revenue
Revenue is recognized when (or as) performance obligations are satisfied by transferring control of goods or services. Control transfers:
- Over time: Progress measured using output or input methods
- At a point in time: When customer obtains control (delivery, acceptance, title transfer)

## 4. Specific Application Guidelines

### Contract Modifications
- Account for as separate contract if new goods/services are distinct and price reflects standalone selling price
- Otherwise, account prospectively or adjust transaction price cumulatively

### Variable Consideration
- Estimate using expected value or most likely amount
- Include in transaction price only to extent highly probable that no significant reversal will occur
- Reassess each reporting period

### Principal vs Agent
Recognize revenue based on whether entity:
- Controls goods/services before transfer to customer (Principal - gross revenue)
- Arranges for another party to provide goods/services (Agent - net commission)

## 5. Contract Costs

### Costs to Obtain a Contract
- Incremental costs (e.g., sales commissions) - capitalize if expected to be recovered
- Other costs - expense as incurred unless explicitly chargeable to customer

### Costs to Fulfill a Contract
Capitalize if costs:
- Relate directly to a contract
- Generate or enhance resources for future performance
- Are expected to be recovered

Amortize systematically consistent with transfer of goods/services.

## 6. Disclosure Requirements

### Qualitative Disclosures
- Significant judgments in applying revenue recognition
- Contract balances (receivables, contract assets, contract liabilities)
- Performance obligations (timing, payment terms)
- Significant payment terms

### Quantitative Disclosures
- Revenue disaggregated by type of good/service, geography, market, timing
- Opening and closing balances of receivables, contract assets/liabilities
- Remaining performance obligations
- Assets recognized from costs to obtain or fulfill contracts

## 7. Key Judgments and Estimates
- Identification of distinct performance obligations
- Estimation of variable consideration and constraint
- Determination of standalone selling prices
- Assessment of principal vs agent relationship
- Estimation of contract costs to be capitalized

## 8. Effective Date
This policy is effective for annual periods beginning on or after 1 January 2024, with earlier application permitted.

## 9. Transition
Modified retrospective approach applied with cumulative effect recognized at date of initial application.`;
      } else if (promptLower.includes('lease') || promptLower.includes('ifrs 16')) {
        sampleResponse = `# Lease Accounting Policy (IFRS 16)

## 1. Objective
This policy establishes the principles for recognition, measurement, presentation and disclosure of leases to ensure relevant and faithful representation of lease transactions.

## 2. Scope
This policy applies to all leases except:
- Leases for exploration or use of minerals, oil, natural gas and similar non-regenerative resources
- Biological assets within scope of IAS 41
- Service concession arrangements within scope of IFRIC 12
- Licenses of intellectual property granted by a lessor within scope of IFRS 15
- Rights held by lessee under licensing agreements within scope of IAS 38

## 3. Lessee Accounting

### Initial Recognition
At commencement date, recognize:
- **Right-of-use Asset** = Lease liability + Initial direct costs + Prepaid lease payments + Restoration costs - Lease incentives received
- **Lease Liability** = Present value of future lease payments

### Lease Payments Include:
- Fixed payments (including in-substance fixed payments)
- Variable payments based on index or rate
- Exercise price of purchase options (if reasonably certain)
- Termination penalties (if lease term reflects exercise)
- Amounts expected under residual value guarantees

### Discount Rate
Use interest rate implicit in lease, if determinable. Otherwise, use lessee's incremental borrowing rate.

### Subsequent Measurement

**Right-of-use Asset:**
- Cost model: Carrying amount = Cost - Accumulated depreciation - Accumulated impairment + Remeasurement of lease liability
- Depreciate over shorter of useful life or lease term (unless title transfers, then useful life)
- Apply IAS 36 for impairment testing

**Lease Liability:**
- Increase for interest on liability
- Decrease for lease payments made
- Remeasure when changes in: lease term, purchase option assessment, amounts under residual value guarantee, future lease payments from index/rate change

### Lease Term
Non-cancellable period + periods covered by:
- Extension options (if reasonably certain to exercise)
- Termination options (if reasonably certain not to exercise)

### Short-term and Low-value Exemptions
May elect to expense lease payments on straight-line basis for:
- Short-term leases (≤12 months, no purchase option)
- Low-value assets (underlying asset value when new ≤ $5,000)

## 4. Lessor Accounting

### Classification
Classify as finance lease if substantially all risks and rewards of ownership transfer. Otherwise, operating lease.

**Finance Lease Indicators:**
- Transfer of ownership at end of lease term
- Lessee has purchase option at below fair value
- Lease term covers major part of economic life
- Present value of lease payments ≥ substantially all of fair value
- Asset is specialized for lessee's use

### Finance Lease
- Recognize lease receivable = Net investment in lease
- Derecognize underlying asset
- Recognize finance income over lease term (constant periodic rate of return)

### Operating Lease
- Continue to recognize underlying asset
- Recognize lease income on straight-line basis or another systematic basis
- Depreciate underlying asset per IAS 16/IAS 38

## 5. Sale and Leaseback Transactions

### Transfer is a Sale (per IFRS 15):
**Seller-lessee:**
- Recognize right-of-use asset as proportion of previous carrying amount retained
- Recognize gain/loss only for rights transferred to buyer-lessor

**Buyer-lessor:**
- Account for purchase per applicable standards
- Account for lease per lessor accounting requirements

### Transfer is Not a Sale:
**Seller-lessee:**
- Continue to recognize transferred asset
- Recognize financial liability per IFRS 9

**Buyer-lessor:**
- Do not recognize transferred asset
- Recognize financial asset per IFRS 9

## 6. Presentation

### Statement of Financial Position (Lessee)
- Right-of-use assets: Separate line item or disclose which line items include
- Lease liabilities: Separate from other liabilities

### Statement of Profit or Loss (Lessee)
- Depreciation of right-of-use assets: Separate from interest on lease liabilities
- Interest on lease liabilities: Present per IAS 1

### Statement of Cash Flows (Lessee)
- Principal portion: Financing activities
- Interest portion: Per entity's policy for interest paid
- Short-term/low-value exemption payments: Operating activities

## 7. Disclosure Requirements

### Lessee Disclosures:
- Carrying amount of right-of-use assets by class
- Additions to right-of-use assets
- Depreciation charge by class
- Interest expense on lease liabilities
- Expense for short-term and low-value leases
- Total cash outflow for leases
- Maturity analysis of lease liabilities
- Description of leasing activities and judgments

### Lessor Disclosures:
- Lease income (separate operating and finance)
- Maturity analysis of lease payments receivable
- Qualitative/quantitative information about residual value risk
- Description of risk management related to residual value

## 8. Key Judgments and Estimates
- Determining lease term (extension and termination options)
- Assessment of whether purchase option will be exercised
- Determining appropriate discount rate (incremental borrowing rate)
- Separating lease and non-lease components
- Assessing whether contract contains a lease

## 9. Effective Date
This policy is effective for annual periods beginning on or after 1 January 2024.`;
      } else if (promptLower.includes('inventory') || promptLower.includes('ias 2')) {
        sampleResponse = `# Inventory Valuation Policy (IAS 2)

## 1. Objective
This policy establishes the accounting treatment for inventories, including determining the cost and subsequent recognition as an expense, and any write-down to net realizable value.

## 2. Scope
This policy applies to all inventories except:
- Work in progress under construction contracts (IFRS 15)
- Financial instruments (IFRS 9)
- Biological assets related to agricultural activity (IAS 41)

Inventories include:
- Raw materials and supplies
- Work in progress
- Finished goods
- Goods purchased for resale
- Spare parts and servicing equipment

## 3. Measurement - Initial Recognition

### Cost of Inventories Includes:
**Purchase Costs:**
- Purchase price
- Import duties and non-recoverable taxes
- Transport, handling and other costs directly attributable to acquisition
- Less: Trade discounts, rebates and other similar items

**Conversion Costs:**
- Direct labor
- Direct expenses
- Systematic allocation of fixed and variable production overheads

**Other Costs:**
- Only included to extent incurred to bring inventories to present location and condition
- Examples: design costs for specific customers

### Costs Excluded (Expensed):
- Abnormal waste of materials, labor or other production costs
- Storage costs (unless necessary in production process)
- Administrative overheads not related to production
- Selling costs
- Foreign exchange differences
- Interest cost (generally, unless qualifying under IAS 23)

## 4. Cost Formulas

### First-In, First-Out (FIFO)
- Default method for the Group
- Assumes items purchased/produced first are sold first
- Ending inventory consists of most recently purchased/produced items
- Use for all inventory categories unless specific identification required

### Weighted Average Cost
- Alternative method where appropriate
- Cost determined on weighted average basis
- Average recalculated after each purchase
- May use periodic (monthly) average for practical purposes

### Specific Identification
- Required for goods not ordinarily interchangeable
- Required for goods segregated for specific projects
- Cost of individual items identified and tracked

**Consistency:** Same cost formula applied to all inventories with similar nature and use to the entity.

## 5. Net Realizable Value (NRV)

### Definition
Estimated selling price in ordinary course of business, less:
- Estimated costs of completion, and
- Estimated costs necessary to make the sale

### Assessment
- Performed at each reporting period
- Assessed on item-by-item basis (or grouped for similar items)
- Based on most reliable evidence at time estimate is made
- Considers fluctuations in price/cost directly relating to events after year-end

### Write-down to NRV Required When:
- Inventory damaged
- Inventory wholly or partially obsolete
- Selling prices declined
- Estimated costs to complete or make sale increased

### Reversal of Write-downs
- Required when circumstances that caused write-down no longer exist
- New carrying amount is lower of cost and revised NRV
- Reversal recognized in profit or loss in period it occurs
- Disclosed separately if material

## 6. Recognition as Expense

### Timing
- When inventory is sold: Recognize carrying amount as expense (cost of goods sold)
- When written down to NRV: Recognize write-down as expense
- When NRV write-down reverses: Recognize reversal as reduction in cost of goods sold

### Allocation Methods
For standard costs or retail method, regularly review:
- Standard costs: Approximate actual costs
- Retail method: Appropriate for items with similar margins, high turnover, and impractical to use other costing methods

## 7. Manufacturing Overhead Allocation

### Fixed Production Overheads
- Indirect costs of production that remain relatively constant regardless of production volume
- Examples: Depreciation, maintenance of factory buildings/equipment, factory management costs
- **Allocation basis:** Normal capacity of production facilities
- **Unallocated overhead:** Expense in period incurred when production below normal capacity

### Variable Production Overheads
- Indirect costs that vary directly with production volume
- Examples: Indirect materials, indirect labor
- **Allocation basis:** Actual use of production facilities

### Normal Capacity
- Average production expected over number of periods/seasons under normal circumstances
- Consider loss of capacity from planned maintenance
- May be used if approximates normal capacity: Actual production level (if similar to normal)

## 8. Consignment Inventory

### Goods Held on Consignment (as Consignee)
- Do NOT include in inventory
- Not owned until sold to third party or purchased from consignor
- Disclose nature and extent if material

### Goods Out on Consignment (as Consignor)
- Continue to recognize in inventory
- Carrying amount includes all costs incurred
- Not revenue recognized until sold by consignee

## 9. Goods in Transit

### Purchased Goods in Transit
- Include in inventory if risks and rewards transferred (per shipping terms)
- FOB Shipping Point: Include in buyer's inventory when shipped
- FOB Destination: Include in buyer's inventory when received

### Sold Goods in Transit
- Exclude from inventory if risks and rewards transferred
- FOB Shipping Point: Exclude from seller's inventory when shipped
- FOB Destination: Exclude from seller's inventory when received

## 10. Disclosure Requirements

### Financial Statements Disclosure:
- Accounting policies for measurement (including cost formula)
- Total carrying amount by classification appropriate to entity
- Carrying amount at fair value less costs to sell
- Amount recognized as expense during period (cost of goods sold)
- Write-downs recognized as expense
- Reversals of write-downs recognized as reduction in expense
- Carrying amount pledged as security for liabilities

### Additional Disclosures (if applicable):
- For inventory measured at fair value less costs to sell: fair value hierarchy level
- For biological produce harvested from biological assets: quantity and carrying amount

## 11. Key Judgments and Estimates
- Determination of net realizable value
- Assessment of inventory obsolescence
- Allocation of fixed production overheads based on normal capacity
- Classification of overheads as fixed vs variable
- Selection of appropriate cost formula

## 12. Internal Controls
- Physical inventory counts performed at least annually
- Perpetual inventory system reconciled to physical counts
- Cyclical counts for high-value or high-volume items
- Approval required for inventory write-downs
- Regular review of slow-moving and obsolete inventory

## 13. Effective Date
This policy is effective for annual periods beginning on or after 1 January 2024.`;
      } else {
        // Generic enhanced template
        sampleResponse = `# ${aiPrompt}

## 1. Objective and Purpose
This policy establishes the accounting principles and procedures for ${aiPrompt.toLowerCase()}. The objective is to ensure consistent, accurate and compliant financial reporting across all Group entities in accordance with International Financial Reporting Standards (IFRS).

## 2. Scope and Application
This policy applies to all entities within the Group and covers all transactions related to ${aiPrompt.toLowerCase()}.

**Included:** [Specify what is included in scope]
**Excluded:** [Specify any exclusions, such as specific transaction types or other applicable standards]

## 3. Key Definitions

**[Term 1]:** [Definition relevant to this policy]
**[Term 2]:** [Definition relevant to this policy]
**[Term 3]:** [Definition relevant to this policy]

## 4. Recognition Principles

### Initial Recognition Criteria
A transaction related to ${aiPrompt.toLowerCase()} shall be recognized when:
- Probability: It is probable that future economic benefits will flow to/from the entity
- Measurement: The cost or value can be measured reliably
- Substance: The transaction has economic substance beyond its legal form

### Timing of Recognition
[Specify when the transaction should be recognized - at contract date, delivery date, etc.]

### Derecognition Criteria
[Specify when the item should be removed from the books]

## 5. Measurement Methodology

### Initial Measurement
At initial recognition, measure at:
- [Primary measurement basis - e.g., fair value, historical cost, present value]
- Include: [Direct costs to include]
- Exclude: [Costs to expense immediately]

### Subsequent Measurement
After initial recognition, measure using:
- [Cost model, revaluation model, fair value model, etc.]
- [Frequency of remeasurement if applicable]
- [Treatment of subsequent expenditure]

### Impairment Testing
- Assess for indicators at each reporting date
- Perform impairment test when indicators exist
- Recognize impairment loss in profit or loss
- [Specific impairment indicators for this policy area]

## 6. Presentation in Financial Statements

### Statement of Financial Position
- Line item: [Where to present in balance sheet]
- Classification: [Current vs non-current classification criteria]
- Offsetting: [Conditions for offsetting, if any]

### Statement of Profit or Loss
- Revenue/Expense recognition: [Where to present in P&L]
- Classification: [Operating vs non-operating, by function or nature]

### Statement of Cash Flows
- Classification: [Operating, investing or financing activities]
- Presentation: [Gross or net presentation]

## 7. Disclosure Requirements

### Mandatory Disclosures
- Accounting policy applied
- Carrying amounts by category
- Reconciliation of opening to closing balances
- Key assumptions and estimates used
- Risk exposure and management strategies
- Future commitments

### Additional Disclosures (if material)
- Fair value measurements and hierarchy
- Sensitivity analysis for key estimates
- Related party transactions
- Contingent assets/liabilities
- Subsequent events

## 8. Key Judgments and Estimates
The following areas require significant judgment or estimation:
- [Judgment area 1]: [Description and approach]
- [Judgment area 2]: [Description and approach]
- [Estimate area 1]: [Description, method and key assumptions]
- [Estimate area 2]: [Description, method and key assumptions]

**Review Frequency:** Judgments and estimates reviewed [quarterly/annually/when circumstances change]

## 9. Internal Controls and Procedures

### Authorization
- Transactions require approval from [specify approval authority and limits]
- Segregation of duties maintained between authorization, recording and reconciliation

### Documentation
- Supporting documentation requirements: [Specify required documents]
- Retention period: [Specify document retention requirements]

### Reconciliation
- Monthly reconciliation to be performed
- Variance investigation threshold: [Specify threshold]
- Sign-off required by [specify role]

## 10. Compliance and Monitoring
- Policy compliance monitored by [Finance team/Internal Audit/specified department]
- Quarterly review of policy application and outcomes
- Annual policy review to ensure alignment with standards and business changes
- Non-compliance escalation process: [Specify escalation path]

## 11. Transition and Implementation
- Effective date: 1 January 2024
- Transition method: [Prospective/Retrospective/Modified retrospective]
- [Specific transition provisions if any]
- Comparative information: [Treatment of prior period comparatives]

## 12. Related Policies and Standards
This policy should be read in conjunction with:
- [Related internal policies]
- [Applicable IFRS/IAS standards]
- [Industry-specific guidance]
- [Regulatory requirements]

## 13. Responsibilities
**Finance Team:** Implementation and day-to-day application
**Controllers:** Oversight and compliance monitoring
**Management:** Judgment calls and policy interpretations
**Internal Audit:** Periodic review and testing

## 14. Policy Review and Updates
- Annual review scheduled for Q4 each year
- Ad-hoc updates when standards change
- Version control maintained with change log
- Distribution of updates to all relevant stakeholders

## 15. Contact and Queries
For questions regarding this policy, contact:
**Group Financial Controller**
Email: finance@group.com`;
      }

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
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                          {policy.policy_category}
                        </span>
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
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={policyForm.policy_category}
                    onChange={(e) => setPolicyForm({...policyForm, policy_category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                  >
                    <option value="">Select category...</option>
                    {POLICY_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
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

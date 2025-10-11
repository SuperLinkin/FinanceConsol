'use client';

import { useState, useRef, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Check,
  BookOpen,
  Video,
  MessageCircle,
  Send,
  Sparkles,
  Building2,
  Upload,
  FileText,
  GitMerge,
  Scissors,
  Wrench,
  FolderKanban,
  FileBarChart,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';

export default function ThePlatform() {
  const [activeSection, setActiveSection] = useState('overview');
  const [playingDemo, setPlayingDemo] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your Platform Assistant. Ask me anything about how to use CLOE - from setting up entities to generating reports. What would you like to know?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sections = [
    { id: 'overview', name: 'Platform Overview', icon: BookOpen },
    { id: 'entity-setup', name: 'Entity Management', icon: Building2 },
    { id: 'upload', name: 'Data Upload', icon: Upload },
    { id: 'coa', name: 'Chart of Accounts', icon: FileText },
    { id: 'logic', name: 'Entity Logic', icon: GitMerge },
    { id: 'eliminations', name: 'Eliminations', icon: Scissors },
    { id: 'builder', name: 'Manual Entries', icon: Wrench },
    { id: 'workings', name: 'Consolidation', icon: FolderKanban },
    { id: 'reporting', name: 'Reporting', icon: FileBarChart }
  ];

  const demos = {
    'entity-setup': {
      title: 'Entity Setup & Management',
      description: 'Learn how to create and manage your consolidation entities',
      steps: [
        {
          id: 1,
          title: 'Add Single Entity',
          description: 'Click "Add Entity" to create individual entities with full details',
          action: 'Click the Add Entity button to open the entity creation form'
        },
        {
          id: 2,
          title: 'Bulk Upload Entities',
          description: 'Download the Excel template, fill in multiple entities, and upload',
          action: 'Use Download Template → Fill Excel → Upload Template'
        },
        {
          id: 3,
          title: 'Set Ownership Structure',
          description: 'Define parent-child relationships and ownership percentages',
          action: 'Select parent entity and enter ownership % for subsidiaries'
        }
      ],
      keyFeatures: [
        'Parent-child entity hierarchies',
        'Ownership percentage tracking',
        'Multi-currency support',
        'Bulk upload with Excel templates',
        'Entity status management (Active/Inactive)'
      ]
    },
    'upload': {
      title: 'Data Upload & Validation',
      description: 'Upload trial balances and chart of accounts with built-in validation',
      steps: [
        {
          id: 1,
          title: 'Download Templates',
          description: 'Get standardized Excel templates for Trial Balance and COA',
          action: 'Click Download Template buttons for TB or COA'
        },
        {
          id: 2,
          title: 'Fill Templates',
          description: 'Add your financial data following the template structure',
          action: 'Enter entity codes, account codes, debit/credit amounts'
        },
        {
          id: 3,
          title: 'Upload & Validate',
          description: 'Upload files - the system validates data automatically',
          action: 'Select entity → Upload file → System validates & imports'
        }
      ],
      keyFeatures: [
        'Excel template downloads',
        'Automatic data validation',
        'Entity-specific trial balances',
        'IFRS-compliant COA structure',
        'Error detection and reporting'
      ]
    },
    'coa': {
      title: 'Chart of Accounts - IFRS Hierarchy',
      description: 'Manage your master chart of accounts with 4-level IFRS structure',
      steps: [
        {
          id: 1,
          title: 'Understand 4-Level Hierarchy',
          description: 'Class → Subclass → Note → Subnote structure',
          action: 'View the hierarchy tree: Assets > Current Assets > Cash > Bank Accounts'
        },
        {
          id: 2,
          title: 'Add GL Accounts',
          description: 'Create new GL codes with proper IFRS classification',
          action: 'Click Add GL Account → Select all 4 levels → Enter account details'
        },
        {
          id: 3,
          title: 'Bulk Upload COA',
          description: 'Upload complete chart of accounts via Excel',
          action: 'Download COA template → Fill hierarchy → Upload'
        }
      ],
      keyFeatures: [
        'IFRS-compliant 4-level hierarchy',
        'Pre-loaded master hierarchy',
        'Account code management',
        'Search and filter capabilities',
        'Expandable tree view'
      ]
    },
    'logic': {
      title: 'Entity Logic & Rules',
      description: 'Configure consolidation and translation logic for your entities',
      steps: [
        {
          id: 1,
          title: 'Create Logic Rules',
          description: 'Define how each entity should be consolidated',
          action: 'Add Logic → Select type (Consolidation/Translation) → Configure'
        },
        {
          id: 2,
          title: 'Set Translation Rates',
          description: 'Configure currency translation methods and rates',
          action: 'Choose rate type: Closing, Average, Historical'
        },
        {
          id: 3,
          title: 'Apply to Entities',
          description: 'Link logic rules to specific entities or groups',
          action: 'Select entities → Assign logic keys → Save'
        }
      ],
      keyFeatures: [
        'Consolidation method setup',
        'Currency translation logic',
        'Logic key system',
        'Reusable rule templates',
        'Entity-specific configurations'
      ]
    },
    'eliminations': {
      title: 'Intercompany Eliminations',
      description: 'Create and manage intercompany elimination entries',
      steps: [
        {
          id: 1,
          title: 'Select Entities',
          description: 'Choose the two entities for intercompany elimination',
          action: 'Select Entity 1 and Entity 2 from dropdown'
        },
        {
          id: 2,
          title: 'Add Elimination Entries',
          description: 'Create double-entry eliminations with debit/credit',
          action: 'Add rows → Select accounts → Enter amounts → Must balance'
        },
        {
          id: 3,
          title: 'Save Templates',
          description: 'Save recurring eliminations as reusable templates',
          action: 'Use template dropdown → Save current entries as template'
        }
      ],
      keyFeatures: [
        'Intercompany transaction elimination',
        'Balanced entry validation',
        'Reusable templates',
        'Period-based tracking',
        'Automatic total calculation'
      ]
    },
    'builder': {
      title: 'Consolidation Builder',
      description: 'Create manual consolidation adjustments and entries',
      steps: [
        {
          id: 1,
          title: 'Create New Entry',
          description: 'Add manual journal entries for adjustments',
          action: 'Create New Build → Enter description → Select period'
        },
        {
          id: 2,
          title: 'Add Journal Lines',
          description: 'Create debit and credit entries that balance',
          action: 'Add Entry → Select account → Enter debit or credit → Add more rows'
        },
        {
          id: 3,
          title: 'Validate & Save',
          description: 'System validates entries balance before saving',
          action: 'Check totals match → Save entry'
        }
      ],
      keyFeatures: [
        'Manual journal entries',
        'Balance validation',
        'Entry templates',
        'Multi-period support',
        'Audit trail tracking'
      ]
    },
    'workings': {
      title: 'Consolidation Workings',
      description: 'Auto-generate and edit consolidated financial statements',
      steps: [
        {
          id: 1,
          title: 'Auto-Generate Statements',
          description: 'System generates BS, IS, Equity, CF from uploaded data',
          action: 'Select period → System auto-loads all statements from COA'
        },
        {
          id: 2,
          title: 'Review & Edit',
          description: 'Click any number to drill down or edit values',
          action: 'Click amount → See entity breakdown → Edit if needed → Save'
        },
        {
          id: 3,
          title: 'Run Validations',
          description: 'System checks balance, flow, and custom validations',
          action: 'Validation Checks section → Review pass/fail → Add custom checks'
        }
      ],
      keyFeatures: [
        'Auto-generation from COA',
        'Live editing capabilities',
        'Entity-level drill-down',
        'Built-in validation checks',
        'Change tracking & audit trail',
        'Note linkages'
      ]
    },
    'reporting': {
      title: 'Financial Reporting Builder',
      description: 'Create publication-ready financial reports with full customization',
      steps: [
        {
          id: 1,
          title: 'Generate Report',
          description: 'Auto-creates report from saved consolidation workings',
          action: 'Select period → Report auto-generates with all statements'
        },
        {
          id: 2,
          title: 'Customize & Format',
          description: 'Use rich text editor to format like a Word document',
          action: 'Edit mode → Bold, italic, colors → Add headers/footers → Add notes'
        },
        {
          id: 3,
          title: 'Export',
          description: 'Download as professional PDF or Word document',
          action: 'Export dropdown → PDF or Word → Download formatted report'
        }
      ],
      keyFeatures: [
        'Auto-report generation',
        'Rich text editing',
        'Custom headers & footers',
        'Color customization',
        'Template system',
        'PDF & Word export',
        'Version control',
        'Change tracking'
      ]
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoadingChat(true);

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
          systemPrompt: `You are a helpful assistant for CLOE (Close Optimization Engine), an IFRS financial consolidation platform.

Answer questions about:
- How to set up entities and organizational structures
- Uploading trial balances and chart of accounts
- Creating eliminations and manual entries
- Generating consolidation workings
- Building financial reports
- Using the IFRS 4-level COA hierarchy (Class > Subclass > Note > Subnote)
- Bulk upload features
- Validation checks
- Export capabilities

Be concise, friendly, and practical. Focus on step-by-step guidance.`
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try asking your question again.'
      }]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const markStepComplete = (sectionId, stepId) => {
    const key = `${sectionId}-${stepId}`;
    setCompletedSteps(prev => new Set([...prev, key]));
  };

  const isStepComplete = (sectionId, stepId) => {
    return completedSteps.has(`${sectionId}-${stepId}`);
  };

  const currentDemo = demos[activeSection] || demos['entity-setup'];

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        title="The Platform"
        subtitle="Interactive guide to mastering your consolidation workflow"
      >
        <button
          onClick={() => setShowChat(!showChat)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <MessageCircle size={16} />
          AI Assistant
        </button>
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Navigation */}
            <div className="col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sticky top-6">
                <h3 className="text-sm font-semibold text-[#101828] mb-4 uppercase tracking-wide">
                  Learning Modules
                </h3>
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    const sectionSteps = demos[section.id]?.steps || [];
                    const completedCount = sectionSteps.filter(step =>
                      isStepComplete(section.id, step.id)
                    ).length;
                    const totalSteps = sectionSteps.length;

                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                        <span className="flex-1 text-left">{section.name}</span>
                        {totalSteps > 0 && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            completedCount === totalSteps
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {completedCount}/{totalSteps}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-xs text-slate-500 mb-2">Overall Progress</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(completedSteps.size / Object.values(demos).reduce((sum, d) => sum + d.steps.length, 0)) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700">
                      {Math.round((completedSteps.size / Object.values(demos).reduce((sum, d) => sum + d.steps.length, 0)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-span-9 space-y-6">
              {activeSection === 'overview' ? (
                // Overview Section
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
                    <h2 className="text-3xl font-bold mb-3">Welcome to CLOE</h2>
                    <p className="text-indigo-100 text-lg mb-6">
                      Your complete IFRS-compliant financial consolidation platform. Learn how to master every feature with interactive guides.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="text-3xl font-bold mb-1">9</div>
                        <div className="text-sm text-indigo-100">Core Modules</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="text-3xl font-bold mb-1">21</div>
                        <div className="text-sm text-indigo-100">Interactive Steps</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="text-3xl font-bold mb-1">IFRS</div>
                        <div className="text-sm text-indigo-100">Compliant</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h3 className="text-xl font-bold text-[#101828] mb-4">Platform Capabilities</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { title: 'Entity Management', desc: 'Manage organizational hierarchies with ownership structures', icon: Building2 },
                        { title: 'Data Upload', desc: 'Bulk upload trial balances and COA with validation', icon: Upload },
                        { title: 'IFRS COA', desc: '4-level hierarchy chart of accounts structure', icon: FileText },
                        { title: 'Consolidation Logic', desc: 'Configure translation and consolidation rules', icon: GitMerge },
                        { title: 'Eliminations', desc: 'Intercompany elimination with templates', icon: Scissors },
                        { title: 'Manual Entries', desc: 'Create adjustment journals and entries', icon: Wrench },
                        { title: 'Auto Consolidation', desc: 'Generate consolidated statements automatically', icon: FolderKanban },
                        { title: 'Report Builder', desc: 'Publication-ready reports with PDF/Word export', icon: FileBarChart }
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className="flex gap-3 p-4 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Icon size={20} className="text-indigo-600" />
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold text-[#101828] text-sm mb-1">{item.title}</div>
                              <div className="text-xs text-slate-600">{item.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <Sparkles className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <h4 className="font-semibold text-amber-900 mb-2">Getting Started Tip</h4>
                        <p className="text-sm text-amber-800">
                          Select any module from the left sidebar to see step-by-step interactive guides.
                          Use the AI Assistant (top right) to ask specific questions about any feature!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Module Detail Section
                <div className="space-y-6">
                  {/* Module Header */}
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
                          {(() => {
                            const section = sections.find(s => s.id === activeSection);
                            const Icon = section?.icon || BookOpen;
                            return <Icon size={32} className="text-indigo-600" />;
                          })()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-[#101828] mb-2">{currentDemo.title}</h2>
                        <p className="text-slate-600">{currentDemo.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Steps */}
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-[#101828] mb-4 flex items-center gap-2">
                      <Video size={20} className="text-indigo-600" />
                      Step-by-Step Walkthrough
                    </h3>
                    <div className="space-y-4">
                      {currentDemo.steps.map((step, index) => {
                        const isComplete = isStepComplete(activeSection, step.id);
                        return (
                          <div
                            key={step.id}
                            className={`border-2 rounded-lg p-5 transition-all ${
                              isComplete
                                ? 'border-green-200 bg-green-50/50'
                                : 'border-slate-200 hover:border-indigo-200'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                isComplete
                                  ? 'bg-green-600 text-white'
                                  : 'bg-indigo-100 text-indigo-600'
                              }`}>
                                {isComplete ? <Check size={16} /> : index + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-[#101828] mb-1">{step.title}</h4>
                                <p className="text-sm text-slate-600 mb-3">{step.description}</p>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                    Action
                                  </div>
                                  <div className="text-sm text-slate-700">{step.action}</div>
                                </div>
                                <button
                                  onClick={() => markStepComplete(activeSection, step.id)}
                                  disabled={isComplete}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isComplete
                                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                  }`}
                                >
                                  {isComplete ? (
                                    <>
                                      <Check size={16} />
                                      Completed
                                    </>
                                  ) : (
                                    <>
                                      Mark as Complete
                                      <ChevronRight size={16} />
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-[#101828] mb-4">Key Features</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {currentDemo.keyFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Check size={16} className="text-green-600 flex-shrink-0" />
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Assistant */}
      {showChat && (
        <div className={`fixed ${
          isChatExpanded
            ? 'inset-4'
            : 'bottom-4 right-4 w-96 h-[600px]'
        } bg-white rounded-xl shadow-2xl border border-slate-200 z-50 flex flex-col transition-all duration-300`}>
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Platform Assistant</h3>
                <p className="text-xs text-indigo-100">Ask me anything about the platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChatExpanded(!isChatExpanded)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isChatExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoadingChat && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-slate-200 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about any feature..."
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                disabled={isLoadingChat}
              />
              <button
                type="submit"
                disabled={isLoadingChat || !chatInput.trim()}
                className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import PageHeader from '@/components/PageHeader';
import {
  FileText,
  Edit3,
  RefreshCw,
  CheckSquare,
  Layers,
  Save,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Type,
  Palette,
  Table as TableIcon,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  AlertCircle,
  Clock,
  User,
  FileDown
} from 'lucide-react';

export default function ReportingPage() {
  // Document state
  const [pages, setPages] = useState([
    {
      id: 'page-1',
      content: '<h1 style="text-align: center; color: #101828; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Financial Statements</h1><p style="color: #101828;">Click Editor to start editing this document...</p>',
      pageNumber: 1
    }
  ]);
  const [selectedPageId, setSelectedPageId] = useState('page-1');
  const [documentMargins, setDocumentMargins] = useState({
    top: 96,    // 1 inch = 96px
    right: 96,
    bottom: 96,
    left: 96
  });

  // Sidepanel states
  const [activePanel, setActivePanel] = useState(null); // 'editor' | 'sync' | 'validation' | 'pages'

  // Editor states
  const [selectedText, setSelectedText] = useState(null);
  const [textColor, setTextColor] = useState('#101828');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState('16');

  // Sync states
  const [syncStatus, setSyncStatus] = useState({
    balanceSheet: { synced: false, lastSync: null, hasChanges: true },
    incomeStatement: { synced: false, lastSync: null, hasChanges: true },
    cashFlow: { synced: false, lastSync: null, hasChanges: true },
    notes: { synced: false, lastSync: null, hasChanges: true },
    accountingPolicy: { synced: false, lastSync: null, hasChanges: false }
  });

  // Validation states
  const [validationRules, setValidationRules] = useState([
    { id: 'v1', name: 'Balance Sheet Balance', type: 'formula', active: true, status: 'pass' },
    { id: 'v2', name: 'All Notes Referenced', type: 'reference', active: true, status: 'warning' }
  ]);

  // Version control states
  const [versions, setVersions] = useState([
    { id: 1, timestamp: new Date().toISOString(), user: 'Demo User', action: 'Document created' }
  ]);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const togglePanel = (panelName) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  const addNewPage = () => {
    const newPage = {
      id: `page-${Date.now()}`,
      content: '<p style="color: #101828;">New page...</p>',
      pageNumber: pages.length + 1
    };
    setPages([...pages, newPage]);
    showToast('Page added');
  };

  const deletePage = (pageId) => {
    if (pages.length === 1) {
      showToast('Cannot delete the last page', 'error');
      return;
    }
    const updatedPages = pages.filter(p => p.id !== pageId).map((p, idx) => ({
      ...p,
      pageNumber: idx + 1
    }));
    setPages(updatedPages);
    if (selectedPageId === pageId) {
      setSelectedPageId(updatedPages[0].id);
    }
    showToast('Page deleted');
  };

  const movePage = (pageId, direction) => {
    const pageIndex = pages.findIndex(p => p.id === pageId);
    if (direction === 'up' && pageIndex === 0) return;
    if (direction === 'down' && pageIndex === pages.length - 1) return;

    const newPages = [...pages];
    const targetIndex = direction === 'up' ? pageIndex - 1 : pageIndex + 1;
    [newPages[pageIndex], newPages[targetIndex]] = [newPages[targetIndex], newPages[pageIndex]];

    // Update page numbers
    const updatedPages = newPages.map((p, idx) => ({
      ...p,
      pageNumber: idx + 1
    }));
    setPages(updatedPages);
    showToast('Page moved');
  };

  const updatePageContent = (pageId, content) => {
    setPages(pages.map(p => p.id === pageId ? { ...p, content } : p));
  };

  const saveDocument = () => {
    const newVersion = {
      id: versions.length + 1,
      timestamp: new Date().toISOString(),
      user: 'Demo User',
      action: 'Document saved'
    };
    setVersions([newVersion, ...versions]);
    showToast('Document saved successfully');
  };

  const applyFormatting = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const insertTable = (rows, cols) => {
    let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 20px 0; color: #101828;">';
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHTML += '<td style="border: 1px solid #101828; padding: 8px; color: #101828;">Cell</td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table>';

    const selectedPage = pages.find(p => p.id === selectedPageId);
    if (selectedPage) {
      updatePageContent(selectedPageId, selectedPage.content + tableHTML);
      showToast('Table inserted');
    }
  };

  const syncSection = (sectionName) => {
    setSyncStatus({
      ...syncStatus,
      [sectionName]: {
        synced: true,
        lastSync: new Date().toISOString(),
        hasChanges: false
      }
    });
    showToast(`${sectionName} synced successfully`);
  };

  const insertIndex = () => {
    const indexHTML = `
      <div style="page-break-before: always;">
        <h1 style="text-align: center; color: #101828; font-size: 24px; font-weight: bold; margin-bottom: 40px;">Table of Contents</h1>
        <div style="color: #101828;">
          <p style="margin: 10px 0;"><span style="font-weight: bold;">1.</span> Balance Sheet ........................... Page X</p>
          <p style="margin: 10px 0;"><span style="font-weight: bold;">2.</span> Income Statement ........................... Page X</p>
          <p style="margin: 10px 0;"><span style="font-weight: bold;">3.</span> Cash Flow Statement ........................... Page X</p>
          <p style="margin: 10px 0;"><span style="font-weight: bold;">4.</span> Notes to Accounts ........................... Page X</p>
          <p style="margin: 10px 0;"><span style="font-weight: bold;">5.</span> Accounting Policy ........................... Page X</p>
        </div>
      </div>
    `;
    const newPage = {
      id: `page-${Date.now()}`,
      content: indexHTML,
      pageNumber: 1
    };
    setPages([newPage, ...pages.map((p, idx) => ({ ...p, pageNumber: idx + 2 }))]);
    showToast('Index page inserted at beginning');
  };

  const autoPopulateBalanceSheet = () => {
    const bsHTML = `
      <div style="page-break-before: always;">
        <h1 style="text-align: center; color: #101828; font-size: 20px; font-weight: bold; margin-bottom: 20px;">Balance Sheet</h1>
        <h3 style="color: #101828; font-size: 16px; font-weight: bold; margin-top: 20px;">ASSETS</h3>
        <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0; color: #101828;">
          <tr style="background-color: #f7f5f2;">
            <th style="border: 1px solid #101828; padding: 8px; text-align: left; color: #101828;">Description</th>
            <th style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">Note</th>
            <th style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">Current Year</th>
            <th style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">Previous Year</th>
          </tr>
          <tr>
            <td style="border: 1px solid #101828; padding: 8px; color: #101828;">Non-current Assets</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">1</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
          </tr>
          <tr>
            <td style="border: 1px solid #101828; padding: 8px; color: #101828;">Current Assets</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">2</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
          </tr>
        </table>
        <h3 style="color: #101828; font-size: 16px; font-weight: bold; margin-top: 20px;">EQUITY & LIABILITIES</h3>
        <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0; color: #101828;">
          <tr style="background-color: #f7f5f2;">
            <th style="border: 1px solid #101828; padding: 8px; text-align: left; color: #101828;">Description</th>
            <th style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">Note</th>
            <th style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">Current Year</th>
            <th style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">Previous Year</th>
          </tr>
          <tr>
            <td style="border: 1px solid #101828; padding: 8px; color: #101828;">Equity</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">3</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
          </tr>
          <tr>
            <td style="border: 1px solid #101828; padding: 8px; color: #101828;">Liabilities</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">4</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
          </tr>
        </table>
      </div>
    `;
    const newPage = {
      id: `page-${Date.now()}`,
      content: bsHTML,
      pageNumber: pages.length + 1
    };
    setPages([...pages, newPage]);
    showToast('Balance Sheet inserted');
  };

  const autoPopulateIncomeStatement = () => {
    const isHTML = `
      <div style="page-break-before: always;">
        <h1 style="text-align: center; color: #101828; font-size: 20px; font-weight: bold; margin-bottom: 20px;">Income Statement</h1>
        <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0; color: #101828;">
          <tr style="background-color: #f7f5f2;">
            <th style="border: 1px solid #101828; padding: 8px; text-align: left; color: #101828;">Description</th>
            <th style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">Note</th>
            <th style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">Current Year</th>
            <th style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">Previous Year</th>
          </tr>
          <tr>
            <td style="border: 1px solid #101828; padding: 8px; color: #101828;">Revenue</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">5</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
          </tr>
          <tr>
            <td style="border: 1px solid #101828; padding: 8px; color: #101828;">Expenses</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">6</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
          </tr>
          <tr style="font-weight: bold; background-color: #f7f5f2;">
            <td style="border: 1px solid #101828; padding: 8px; color: #101828;">Net Profit / (Loss)</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">-</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
          </tr>
        </table>
      </div>
    `;
    const newPage = {
      id: `page-${Date.now()}`,
      content: isHTML,
      pageNumber: pages.length + 1
    };
    setPages([...pages, newPage]);
    showToast('Income Statement inserted');
  };

  const autoPopulateCashFlow = () => {
    const cfHTML = `
      <div style="page-break-before: always;">
        <h1 style="text-align: center; color: #101828; font-size: 20px; font-weight: bold; margin-bottom: 20px;">Cash Flow Statement</h1>
        <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0; color: #101828;">
          <tr style="background-color: #f7f5f2;">
            <th style="border: 1px solid #101828; padding: 8px; text-align: left; color: #101828;">Description</th>
            <th style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">Current Year</th>
            <th style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">Previous Year</th>
          </tr>
          <tr>
            <td style="border: 1px solid #101828; padding: 8px; color: #101828;">Operating Activities</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
          </tr>
          <tr>
            <td style="border: 1px solid #101828; padding: 8px; color: #101828;">Investing Activities</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
          </tr>
          <tr>
            <td style="border: 1px solid #101828; padding: 8px; color: #101828;">Financing Activities</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
            <td style="border: 1px solid #101828; padding: 8px; text-align: right; color: #101828;">0.00</td>
          </tr>
        </table>
      </div>
    `;
    const newPage = {
      id: `page-${Date.now()}`,
      content: cfHTML,
      pageNumber: pages.length + 1
    };
    setPages([...pages, newPage]);
    showToast('Cash Flow Statement inserted');
  };

  const autoPopulateNotes = () => {
    const notesHTML = `
      <div style="page-break-before: always;">
        <h1 style="text-align: center; color: #101828; font-size: 20px; font-weight: bold; margin-bottom: 20px;">Notes to Financial Statements</h1>
        <h3 style="color: #101828; font-size: 16px; font-weight: bold; margin-top: 20px;">Note 1: Accounting Policies</h3>
        <p style="color: #101828; margin: 10px 0;">The financial statements have been prepared in accordance with applicable standards...</p>
        <h3 style="color: #101828; font-size: 16px; font-weight: bold; margin-top: 20px;">Note 2: Revenue Recognition</h3>
        <p style="color: #101828; margin: 10px 0;">Revenue is recognized when control of goods or services is transferred...</p>
      </div>
    `;
    const newPage = {
      id: `page-${Date.now()}`,
      content: notesHTML,
      pageNumber: pages.length + 1
    };
    setPages([...pages, newPage]);
    showToast('Notes to Accounts inserted');
  };

  const autoPopulateAccountingPolicy = () => {
    const policyHTML = `
      <div style="page-break-before: always;">
        <h1 style="text-align: center; color: #101828; font-size: 20px; font-weight: bold; margin-bottom: 20px;">Accounting Policies</h1>
        <h3 style="color: #101828; font-size: 16px; font-weight: bold; margin-top: 20px;">1. Basis of Preparation</h3>
        <p style="color: #101828; margin: 10px 0;">These financial statements have been prepared under the historical cost convention...</p>
        <h3 style="color: #101828; font-size: 16px; font-weight: bold; margin-top: 20px;">2. Revenue Recognition Policy</h3>
        <p style="color: #101828; margin: 10px 0;">Revenue is measured at the fair value of consideration received or receivable...</p>
      </div>
    `;
    const newPage = {
      id: `page-${Date.now()}`,
      content: policyHTML,
      pageNumber: pages.length + 1
    };
    setPages([...pages, newPage]);
    showToast('Accounting Policy inserted');
  };

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      <PageHeader
        icon={FileText}
        title="Financial Reporting"
        subtitle="Word-style document editor for financial statements"
      />

      <div className="flex-1 overflow-hidden flex">
        {/* Main Document Area */}
        <div className="flex-1 overflow-auto bg-gray-300 p-8">
          {/* Toolbar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 p-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => togglePanel('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activePanel === 'editor' ? 'bg-[#101828] text-white' : 'bg-gray-100 text-[#101828] hover:bg-gray-200'
              }`}
            >
              <Edit3 size={16} />
              Editor
            </button>
            <button
              onClick={() => togglePanel('sync')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activePanel === 'sync' ? 'bg-[#101828] text-white' : 'bg-gray-100 text-[#101828] hover:bg-gray-200'
              }`}
            >
              <RefreshCw size={16} />
              Sync
            </button>
            <button
              onClick={() => togglePanel('validation')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activePanel === 'validation' ? 'bg-[#101828] text-white' : 'bg-gray-100 text-[#101828] hover:bg-gray-200'
              }`}
            >
              <CheckSquare size={16} />
              Validation
            </button>
            <button
              onClick={() => togglePanel('pages')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activePanel === 'pages' ? 'bg-[#101828] text-white' : 'bg-gray-100 text-[#101828] hover:bg-gray-200'
              }`}
            >
              <Layers size={16} />
              Pages
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={saveDocument}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
              >
                <Save size={16} />
                Save
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                <FileDown size={16} />
                Export PDF
              </button>
            </div>
          </div>

          {/* Document Pages */}
          <div className="space-y-8">
            {pages.map((page) => (
              <div
                key={page.id}
                className={`bg-white shadow-lg mx-auto relative ${
                  selectedPageId === page.id ? 'ring-4 ring-blue-500' : ''
                }`}
                style={{
                  width: '794px',  // A4 width at 96 DPI
                  minHeight: '1123px',  // A4 height at 96 DPI
                  padding: `${documentMargins.top}px ${documentMargins.right}px ${documentMargins.bottom}px ${documentMargins.left}px`
                }}
                onClick={() => setSelectedPageId(page.id)}
              >
                {/* Page Number */}
                <div className="absolute top-2 right-2 text-xs text-gray-400 font-mono">
                  Page {page.pageNumber}
                </div>

                {/* Editable Content */}
                <div
                  contentEditable
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{ __html: page.content }}
                  onBlur={(e) => updatePageContent(page.id, e.target.innerHTML)}
                  className="outline-none"
                  style={{
                    minHeight: '800px',
                    color: '#101828',
                    lineHeight: '1.6'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Version Control Section */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
            <h3 className="text-lg font-bold text-[#101828]">Version History</h3>
          </div>
          <div className="p-4 space-y-3">
            {versions.map((version) => (
              <div key={version.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-gray-600" />
                  <span className="text-xs text-gray-600">
                    {new Date(version.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <User size={14} className="text-gray-600" />
                  <span className="text-sm font-medium text-[#101828]">{version.user}</span>
                </div>
                <p className="text-sm text-gray-700">{version.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Sidepanel */}
        {activePanel === 'editor' && (
          <div className="fixed right-80 top-0 h-full w-80 bg-white shadow-2xl z-50 border-l border-gray-200 animate-slideLeft">
            <div className="h-full flex flex-col">
              <div className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Editor</h3>
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Text Formatting */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Text Formatting</h4>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => applyFormatting('bold')}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                      title="Bold"
                    >
                      <Bold size={16} className="text-[#101828]" />
                    </button>
                    <button
                      onClick={() => applyFormatting('italic')}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                      title="Italic"
                    >
                      <Italic size={16} className="text-[#101828]" />
                    </button>
                    <button
                      onClick={() => applyFormatting('underline')}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                      title="Underline"
                    >
                      <Underline size={16} className="text-[#101828]" />
                    </button>
                  </div>
                </div>

                {/* Alignment */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Alignment</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => applyFormatting('justifyLeft')}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      <AlignLeft size={16} className="text-[#101828]" />
                    </button>
                    <button
                      onClick={() => applyFormatting('justifyCenter')}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      <AlignCenter size={16} className="text-[#101828]" />
                    </button>
                    <button
                      onClick={() => applyFormatting('justifyRight')}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      <AlignRight size={16} className="text-[#101828]" />
                    </button>
                  </div>
                </div>

                {/* Lists */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Lists</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => applyFormatting('insertUnorderedList')}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      <List size={16} className="text-[#101828]" />
                    </button>
                    <button
                      onClick={() => applyFormatting('insertOrderedList')}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      <ListOrdered size={16} className="text-[#101828]" />
                    </button>
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Font Size</h4>
                  <select
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(e.target.value);
                      applyFormatting('fontSize', e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">Small</option>
                    <option value="3">Normal</option>
                    <option value="5">Large</option>
                    <option value="7">Huge</option>
                  </select>
                </div>

                {/* Colors */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Text Color</h4>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      applyFormatting('foreColor', e.target.value);
                    }}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Background Color</h4>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value);
                      applyFormatting('backColor', e.target.value);
                    }}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>

                {/* Insert Table */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Insert Table</h4>
                  <button
                    onClick={() => insertTable(3, 3)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <TableIcon size={16} />
                    Insert 3x3 Table
                  </button>
                </div>

                {/* Margins */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Page Margins (px)</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 w-16">Top:</label>
                      <input
                        type="number"
                        value={documentMargins.top}
                        onChange={(e) => setDocumentMargins({ ...documentMargins, top: parseInt(e.target.value) || 0 })}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm text-[#101828]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 w-16">Right:</label>
                      <input
                        type="number"
                        value={documentMargins.right}
                        onChange={(e) => setDocumentMargins({ ...documentMargins, right: parseInt(e.target.value) || 0 })}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm text-[#101828]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 w-16">Bottom:</label>
                      <input
                        type="number"
                        value={documentMargins.bottom}
                        onChange={(e) => setDocumentMargins({ ...documentMargins, bottom: parseInt(e.target.value) || 0 })}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm text-[#101828]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 w-16">Left:</label>
                      <input
                        type="number"
                        value={documentMargins.left}
                        onChange={(e) => setDocumentMargins({ ...documentMargins, left: parseInt(e.target.value) || 0 })}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm text-[#101828]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sync Sidepanel */}
        {activePanel === 'sync' && (
          <div className="fixed right-80 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-gray-200 animate-slideLeft">
            <div className="h-full flex flex-col">
              <div className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Sync Data</h3>
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-sm text-gray-600 mb-4">Sync data from other pages to auto-populate document sections.</p>

                {Object.entries(syncStatus).map(([key, status]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-[#101828] capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      {status.synced ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">Synced</span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold">Not Synced</span>
                      )}
                    </div>

                    {status.lastSync && (
                      <p className="text-xs text-gray-500 mb-2">
                        Last synced: {new Date(status.lastSync).toLocaleString()}
                      </p>
                    )}

                    {status.hasChanges && (
                      <p className="text-xs text-orange-600 mb-3">Changes detected in source data</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => syncSection(key)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
                      >
                        Sync Now
                      </button>
                      <button
                        onClick={() => {
                          if (key === 'balanceSheet') autoPopulateBalanceSheet();
                          else if (key === 'incomeStatement') autoPopulateIncomeStatement();
                          else if (key === 'cashFlow') autoPopulateCashFlow();
                          else if (key === 'notes') autoPopulateNotes();
                          else if (key === 'accountingPolicy') autoPopulateAccountingPolicy();
                          syncSection(key);
                        }}
                        className="px-3 py-2 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700"
                      >
                        Insert
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Validation Sidepanel */}
        {activePanel === 'validation' && (
          <div className="fixed right-80 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-gray-200 animate-slideLeft">
            <div className="h-full flex flex-col">
              <div className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Validation</h3>
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                  <Plus size={16} />
                  Add Validation Rule
                </button>

                <div className="space-y-3">
                  {validationRules.map((rule) => (
                    <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#101828]">{rule.name}</h4>
                        <div className="flex items-center gap-2">
                          {rule.status === 'pass' && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">Pass</span>
                          )}
                          {rule.status === 'fail' && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-semibold">Fail</span>
                          )}
                          {rule.status === 'warning' && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold">Warning</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">Type: {rule.type}</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={rule.active}
                          onChange={() => {
                            setValidationRules(validationRules.map(r =>
                              r.id === rule.id ? { ...r, active: !r.active } : r
                            ));
                          }}
                          className="rounded"
                        />
                        <label className="text-sm text-gray-700">Active</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pages Sidepanel */}
        {activePanel === 'pages' && (
          <div className="fixed right-80 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-gray-200 animate-slideLeft">
            <div className="h-full flex flex-col">
              <div className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Pages</h3>
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={addNewPage}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Add Page
                  </button>
                  <button
                    onClick={insertIndex}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                  >
                    <FileText size={16} />
                    Insert Index
                  </button>
                </div>

                <div className="space-y-2">
                  {pages.map((page, index) => (
                    <div
                      key={page.id}
                      className={`border rounded-lg p-3 ${
                        selectedPageId === page.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-[#101828]">Page {page.pageNumber}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => movePage(page.id, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                          >
                            <ChevronUp size={16} className="text-[#101828]" />
                          </button>
                          <button
                            onClick={() => movePage(page.id, 'down')}
                            disabled={index === pages.length - 1}
                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                          >
                            <ChevronDown size={16} className="text-[#101828]" />
                          </button>
                          <button
                            onClick={() => deletePage(page.id)}
                            className="p-1 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {page.content.replace(/<[^>]*>/g, '').substring(0, 50)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg animate-slideUp z-[100] ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <p className="font-semibold">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

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
  FileDown,
  Undo,
  Redo,
  Hash,
  Sparkles,
  FileSearch,
  Heading,
  Droplet,
  Settings
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
  const [activePanel, setActivePanel] = useState(null); // 'editor' | 'sync' | 'validation' | 'pages' | 'version' | 'numbers' | 'ai' | 'templates' | 'pageSettings'
  const [versionTab, setVersionTab] = useState('history'); // 'history' | 'activity'

  // Page Settings states
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [pageNumberPosition, setPageNumberPosition] = useState('bottom-right'); // 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  const [documentTitle, setDocumentTitle] = useState('');
  const [pageOrientation, setPageOrientation] = useState('portrait'); // 'portrait' | 'landscape'

  // Draggable toolbar states
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 120 });
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Editor states
  const [selectedText, setSelectedText] = useState(null);
  const [textColor, setTextColor] = useState('#101828');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [lineSpacing, setLineSpacing] = useState('1.6');
  const [paragraphSpacing, setParagraphSpacing] = useState('10');
  const [documentHeader, setDocumentHeader] = useState('');
  const [documentFooter, setDocumentFooter] = useState('');
  const [watermark, setWatermark] = useState('');

  // Table states
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableBorderStyle, setTableBorderStyle] = useState('all');

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

  // Activity log states
  const [activityLog, setActivityLog] = useState([
    { id: 1, timestamp: new Date().toISOString(), user: 'Demo User', action: 'Document created', type: 'create' },
    { id: 2, timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'Demo User', action: 'Opened document', type: 'view' }
  ]);

  // Numbers/Formula states
  const [formulas, setFormulas] = useState([
    { id: 1, name: 'Total Assets', formula: 'SUM(GL:1000-1999)', scope: 'all_entities', noteLevel: false },
    { id: 2, name: 'Revenue Note 5', formula: 'SUM(GL:4000-4999)', scope: 'all_entities', noteLevel: true, note: 5 }
  ]);

  // AI Chat states
  const [aiMessages, setAiMessages] = useState([
    { id: 1, role: 'assistant', content: 'Hello! I can help you with financial statement design, note structuring, and reporting suggestions. What would you like assistance with?' }
  ]);
  const [aiInput, setAiInput] = useState('');

  // Templates states
  const [templateSearch, setTemplateSearch] = useState('');
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Standard Balance Sheet', category: 'Financial Statements', keywords: ['balance sheet', 'assets', 'liabilities', 'equity'], content: '<h2>Balance Sheet Template</h2>' },
    { id: 2, name: 'Income Statement - Detailed', category: 'Financial Statements', keywords: ['income statement', 'profit', 'revenue', 'expenses'], content: '<h2>Income Statement Template</h2>' },
    { id: 3, name: 'Note 1 - Accounting Policies', category: 'Notes', keywords: ['accounting policies', 'note 1', 'basis'], content: '<h3>Note 1: Accounting Policies</h3>' },
    { id: 4, name: 'Cash Flow - Direct Method', category: 'Financial Statements', keywords: ['cash flow', 'direct method', 'operating', 'investing', 'financing'], content: '<h2>Cash Flow Statement</h2>' }
  ]);

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Toast
  const [toast, setToast] = useState(null);

  // Refs for contentEditable
  const contentEditableRefs = useRef({});
  const savedSelection = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const togglePanel = (panelName) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };

  const handleToolbarMouseDown = (e) => {
    setIsDraggingToolbar(true);
    setDragOffset({
      x: e.clientX - toolbarPosition.x,
      y: e.clientY - toolbarPosition.y
    });
  };

  // Set initial toolbar position on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToolbarPosition({ x: window.innerWidth - 320, y: 120 });
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingToolbar) {
        setToolbarPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingToolbar(false);
    };

    if (isDraggingToolbar) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingToolbar, dragOffset]);

  const saveSelection = () => {
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        savedSelection.current = sel.getRangeAt(0);
      }
    }
  };

  const restoreSelection = () => {
    if (savedSelection.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection.current);
    } else {
      // If no saved selection, focus on the current page's contentEditable
      const currentPageElement = contentEditableRefs.current[selectedPageId];
      if (currentPageElement) {
        currentPageElement.focus();
        // Place cursor at the end
        const range = document.createRange();
        const sel = window.getSelection();
        if (currentPageElement.childNodes.length > 0) {
          range.selectNodeContents(currentPageElement);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
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
    const timestamp = new Date().toISOString();
    const newVersion = {
      id: versions.length + 1,
      timestamp: timestamp,
      user: 'Demo User',
      action: 'Document saved'
    };
    setVersions([newVersion, ...versions]);

    const newActivity = {
      id: activityLog.length + 1,
      timestamp: timestamp,
      user: 'Demo User',
      action: 'Saved document',
      type: 'edit'
    };
    setActivityLog([newActivity, ...activityLog]);

    showToast('Document saved successfully');
  };

  const applyFormatting = (command, value = null) => {
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
  };

  const handleUndo = () => {
    restoreSelection();
    document.execCommand('undo', false, null);
    showToast('Undo applied');
    saveSelection();
  };

  const handleRedo = () => {
    restoreSelection();
    document.execCommand('redo', false, null);
    showToast('Redo applied');
    saveSelection();
  };

  const applyFontFamily = (family) => {
    setFontFamily(family);
    restoreSelection();
    document.execCommand('fontName', false, family);
    saveSelection();
    showToast(`Font changed to ${family}`);
  };

  const insertHeaderFooter = () => {
    // Add header and footer to all pages
    const updatedPages = pages.map(page => {
      let content = page.content;
      if (documentHeader) {
        const headerHTML = `<div style="text-align: center; color: #101828; font-size: 12px; padding-bottom: 20px; border-bottom: 1px solid #ccc; margin-bottom: 20px;">${documentHeader}</div>`;
        if (!content.includes(headerHTML)) {
          content = headerHTML + content;
        }
      }
      if (documentFooter) {
        const footerHTML = `<div style="text-align: center; color: #101828; font-size: 12px; padding-top: 20px; border-top: 1px solid #ccc; margin-top: 20px;">${documentFooter}</div>`;
        if (!content.includes(footerHTML)) {
          content = content + footerHTML;
        }
      }
      return { ...page, content };
    });
    setPages(updatedPages);
    showToast('Header/Footer applied');
  };

  const applyWatermark = () => {
    // Apply watermark styling to document
    if (watermark) {
      showToast('Watermark applied to document');
    }
  };

  const insertTable = (rows, cols, borderStyle) => {
    let cellBorderStyle = '';

    switch (borderStyle) {
      case 'top':
        cellBorderStyle = 'border-top: 1px solid #101828;';
        break;
      case 'bottom':
        cellBorderStyle = 'border-bottom: 1px solid #101828;';
        break;
      case 'double-top':
        cellBorderStyle = 'border-top: 3px double #101828;';
        break;
      case 'double-bottom':
        cellBorderStyle = 'border-bottom: 3px double #101828;';
        break;
      case 'right':
        cellBorderStyle = 'border-right: 1px solid #101828;';
        break;
      case 'left':
        cellBorderStyle = 'border-left: 1px solid #101828;';
        break;
      case 'all':
        cellBorderStyle = 'border: 1px solid #101828;';
        break;
      case 'none':
        cellBorderStyle = 'border: none;';
        break;
      default:
        cellBorderStyle = 'border: 1px solid #101828;';
    }

    let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 20px 0; color: #101828;">';
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHTML += `<td style="${cellBorderStyle} padding: 8px; color: #101828;">Cell</td>`;
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table>';

    const selectedPage = pages.find(p => p.id === selectedPageId);
    if (selectedPage) {
      updatePageContent(selectedPageId, selectedPage.content + tableHTML);
      showToast(`Table inserted with ${borderStyle} border`);
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
          {/* Top Toolbar - Only Save and Export PDF */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 p-3 flex items-center justify-end gap-2">
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

          {/* Draggable Toolbar - Right Side */}
          <div
            className="fixed bg-white rounded-lg shadow-2xl border-2 border-gray-300 p-3 z-40"
            style={{
              left: `${toolbarPosition.x}px`,
              top: `${toolbarPosition.y}px`,
              cursor: isDraggingToolbar ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
          >
            {/* Drag Handle */}
            <div
              onMouseDown={handleToolbarMouseDown}
              className="bg-gray-200 rounded-t-lg p-2 mb-3 text-center text-xs font-bold text-gray-600 cursor-grab active:cursor-grabbing"
            >
              ⋮⋮ DRAG TO MOVE ⋮⋮
            </div>

            {/* Toolbar Buttons */}
            <div className="space-y-2">
              {/* Undo/Redo */}
              <div className="flex gap-2">
                <button
                  onClick={handleUndo}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-[#101828] hover:bg-gray-200 transition-colors"
                  title="Undo"
                >
                  <Undo size={16} />
                </button>
                <button
                  onClick={handleRedo}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-[#101828] hover:bg-gray-200 transition-colors"
                  title="Redo"
                >
                  <Redo size={16} />
                </button>
              </div>

              <div className="border-t border-gray-300 pt-2"></div>

              <button
                onClick={() => togglePanel('editor')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activePanel === 'editor' ? 'bg-[#101828] text-white' : 'bg-gray-100 text-[#101828] hover:bg-gray-200'
                }`}
              >
                <Edit3 size={16} />
                Editor
              </button>
              <button
                onClick={() => togglePanel('sync')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activePanel === 'sync' ? 'bg-[#101828] text-white' : 'bg-gray-100 text-[#101828] hover:bg-gray-200'
                }`}
              >
                <RefreshCw size={16} />
                Sync
              </button>
              <button
                onClick={() => togglePanel('validation')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activePanel === 'validation' ? 'bg-[#101828] text-white' : 'bg-gray-100 text-[#101828] hover:bg-gray-200'
                }`}
              >
                <CheckSquare size={16} />
                Validation
              </button>
              <button
                onClick={() => togglePanel('pages')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activePanel === 'pages' ? 'bg-[#101828] text-white' : 'bg-gray-100 text-[#101828] hover:bg-gray-200'
                }`}
              >
                <Layers size={16} />
                Pages
              </button>
              <button
                onClick={() => togglePanel('version')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activePanel === 'version' ? 'bg-[#101828] text-white' : 'bg-gray-100 text-[#101828] hover:bg-gray-200'
                }`}
              >
                <Clock size={16} />
                Version
              </button>
              <button
                onClick={() => togglePanel('pageSettings')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activePanel === 'pageSettings' ? 'bg-[#101828] text-white' : 'bg-gray-100 text-[#101828] hover:bg-gray-200'
                }`}
              >
                <Settings size={16} />
                Page Settings
              </button>

              <div className="border-t border-gray-300 pt-2"></div>

              <button
                onClick={() => togglePanel('numbers')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activePanel === 'numbers' ? 'bg-[#101828] text-white' : 'bg-gray-100 text-[#101828] hover:bg-gray-200'
                }`}
              >
                <Hash size={16} />
                Numbers
              </button>
              <button
                onClick={() => togglePanel('ai')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activePanel === 'ai' ? 'bg-[#101828] text-white' : 'bg-gray-100 text-[#101828] hover:bg-gray-200'
                }`}
              >
                <Sparkles size={16} />
                Ask AI
              </button>
              <button
                onClick={() => togglePanel('templates')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activePanel === 'templates' ? 'bg-[#101828] text-white' : 'bg-gray-100 text-[#101828] hover:bg-gray-200'
                }`}
              >
                <FileSearch size={16} />
                Templates
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
                  height: '1123px',  // A4 height at 96 DPI - fixed height
                  padding: `${documentMargins.top}px ${documentMargins.right}px ${documentMargins.bottom}px ${documentMargins.left}px`,
                  overflow: 'hidden' // Prevent content from exceeding page bounds
                }}
                onClick={() => setSelectedPageId(page.id)}
              >
                {/* Page Number */}
                {showPageNumbers && (
                  <div className="absolute top-2 right-2 text-xs text-gray-400 font-mono">
                    Page {page.pageNumber}
                  </div>
                )}

                {/* Editable Content */}
                <div
                  ref={(el) => { contentEditableRefs.current[page.id] = el; }}
                  contentEditable
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{ __html: page.content }}
                  onBlur={(e) => updatePageContent(page.id, e.target.innerHTML)}
                  onMouseUp={saveSelection}
                  onKeyUp={saveSelection}
                  onFocus={saveSelection}
                  className="outline-none h-full overflow-auto"
                  style={{
                    color: '#101828',
                    lineHeight: lineSpacing
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Editor Sidepanel */}
        {activePanel === 'editor' && (
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 border-l border-gray-200 animate-slideLeft">
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

                {/* Font Family */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Font Style</h4>
                  <select
                    value={fontFamily}
                    onChange={(e) => applyFontFamily(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Calibri">Calibri</option>
                    <option value="Cambria">Cambria</option>
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Font Size (px)</h4>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => {
                      const newSize = e.target.value;
                      setFontSize(newSize);
                      const size = parseInt(newSize);
                      if (size >= 8 && size <= 72) {
                        restoreSelection();
                        document.execCommand('fontSize', false, '7');
                        const fontElements = document.getElementsByTagName("font");
                        for (let i = 0; i < fontElements.length; i++) {
                          if (fontElements[i].size == "7") {
                            fontElements[i].removeAttribute("size");
                            fontElements[i].style.fontSize = size + "px";
                          }
                        }
                        saveSelection();
                        showToast(`Font size changed to ${size}px`);
                      }
                    }}
                    min="8"
                    max="72"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="16"
                  />
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

                {/* Line Spacing */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Line Spacing</h4>
                  <select
                    value={lineSpacing}
                    onChange={(e) => setLineSpacing(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1.0">Single (1.0)</option>
                    <option value="1.15">1.15</option>
                    <option value="1.5">1.5</option>
                    <option value="1.6">1.6</option>
                    <option value="2.0">Double (2.0)</option>
                  </select>
                </div>

                {/* Paragraph Spacing */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Paragraph Spacing (px)</h4>
                  <input
                    type="number"
                    value={paragraphSpacing}
                    onChange={(e) => setParagraphSpacing(e.target.value)}
                    min="0"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                  />
                </div>

                {/* Insert Table */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Insert Table</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-gray-600 mb-1 block">Rows</label>
                        <input
                          type="number"
                          value={tableRows}
                          onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                          min="1"
                          max="20"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-600 mb-1 block">Columns</label>
                        <input
                          type="number"
                          value={tableCols}
                          onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                          min="1"
                          max="10"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Border Style</label>
                      <select
                        value={tableBorderStyle}
                        onChange={(e) => setTableBorderStyle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Borders</option>
                        <option value="top">Top Border Only</option>
                        <option value="bottom">Bottom Border Only</option>
                        <option value="double-top">Double Top Border</option>
                        <option value="double-bottom">Double Bottom Border</option>
                        <option value="right">Right Border Only</option>
                        <option value="left">Left Border Only</option>
                        <option value="none">No Borders</option>
                      </select>
                    </div>

                    <button
                      onClick={() => insertTable(tableRows, tableCols, tableBorderStyle)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <TableIcon size={16} />
                      Insert Table ({tableRows}x{tableCols})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sync Sidepanel */}
        {activePanel === 'sync' && (
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-gray-200 animate-slideLeft">
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
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-gray-200 animate-slideLeft">
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
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-gray-200 animate-slideLeft">
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

        {/* Version Sidepanel */}
        {activePanel === 'version' && (
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-gray-200 animate-slideLeft">
            <div className="h-full flex flex-col">
              <div className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Version Control</h3>
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sub-tabs */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                  onClick={() => setVersionTab('history')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                    versionTab === 'history'
                      ? 'bg-white text-[#101828] border-b-2 border-[#101828]'
                      : 'text-gray-600 hover:text-[#101828]'
                  }`}
                >
                  Version History
                </button>
                <button
                  onClick={() => setVersionTab('activity')}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                    versionTab === 'activity'
                      ? 'bg-white text-[#101828] border-b-2 border-[#101828]'
                      : 'text-gray-600 hover:text-[#101828]'
                  }`}
                >
                  Activity Log
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {versionTab === 'history' && (
                  <div className="p-6 space-y-3">
                    <p className="text-sm text-gray-600 mb-4">Track all document saves and versions</p>
                    {versions.map((version) => (
                      <div key={version.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={14} className="text-gray-600" />
                          <span className="text-xs text-gray-600">
                            {new Date(version.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <User size={14} className="text-gray-600" />
                          <span className="text-sm font-medium text-[#101828]">{version.user}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{version.action}</p>
                        <div className="flex gap-2">
                          <button className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700">
                            Restore
                          </button>
                          <button className="flex-1 px-3 py-1 bg-gray-200 text-[#101828] rounded text-xs font-semibold hover:bg-gray-300">
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {versionTab === 'activity' && (
                  <div className="p-6 space-y-3">
                    <p className="text-sm text-gray-600 mb-4">All document activities and changes</p>
                    {activityLog.map((activity) => (
                      <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-600" />
                            <span className="text-xs text-gray-600">
                              {new Date(activity.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            activity.type === 'create' ? 'bg-green-100 text-green-800' :
                            activity.type === 'edit' ? 'bg-blue-100 text-blue-800' :
                            activity.type === 'delete' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {activity.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <User size={14} className="text-gray-600" />
                          <span className="text-sm font-medium text-[#101828]">{activity.user}</span>
                        </div>
                        <p className="text-sm text-gray-700">{activity.action}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Numbers Sidepanel */}
        {activePanel === 'numbers' && (
          <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 border-l border-gray-200 animate-slideLeft">
            <div className="h-full flex flex-col">
              <div className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Numbers & Formulas</h3>
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-sm text-gray-600 mb-4">Create dynamic formulas for GL accounts, entities, and note-level consolidation</p>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                  <Plus size={16} />
                  Create New Formula
                </button>

                <div className="space-y-3">
                  {formulas.map((formula) => (
                    <div key={formula.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#101828]">{formula.name}</h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                          {formula.noteLevel ? 'Note Level' : 'GL Level'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded mb-2">{formula.formula}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">Scope:</span>
                        <span className="text-xs font-semibold text-[#101828]">
                          {formula.scope === 'all_entities' ? 'All Entities (Combined)' : `Entity: ${formula.scope}`}
                        </span>
                      </div>
                      {formula.noteLevel && formula.note && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500">Note:</span>
                          <span className="text-xs font-semibold text-[#101828]">Note {formula.note}</span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700">
                          Insert to Document
                        </button>
                        <button className="px-3 py-1 bg-gray-200 text-[#101828] rounded text-xs font-semibold hover:bg-gray-300">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold hover:bg-red-200">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formula Builder Section */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Formula Builder</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Formula Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Total Revenue"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Formula Expression</label>
                      <input
                        type="text"
                        placeholder="e.g., SUM(GL:4000-4999)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Scope</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="all_entities">All Entities (Combined)</option>
                        <option value="entity_1">Entity 1</option>
                        <option value="entity_2">Entity 2</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" id="noteLevel" />
                      <label htmlFor="noteLevel" className="text-sm text-gray-700">Note Level Consolidation</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ask AI Sidepanel */}
        {activePanel === 'ai' && (
          <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 border-l border-gray-200 animate-slideLeft">
            <div className="h-full flex flex-col">
              <div className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} />
                  <h3 className="text-xl font-bold">Ask AI</h3>
                </div>
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {aiMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.role === 'assistant'
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.role === 'assistant' ? (
                        <Sparkles size={16} className="text-blue-600" />
                      ) : (
                        <User size={16} className="text-gray-600" />
                      )}
                      <span className="text-xs font-semibold text-[#101828]">
                        {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{message.content}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask for suggestions, design notes, or formatting help..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && aiInput.trim()) {
                        const newMessage = {
                          id: aiMessages.length + 1,
                          role: 'user',
                          content: aiInput
                        };
                        setAiMessages([...aiMessages, newMessage, {
                          id: aiMessages.length + 2,
                          role: 'assistant',
                          content: 'This is a placeholder response. In production, this would connect to an AI service to provide intelligent suggestions about financial statement design, note structuring, and reporting best practices.'
                        }]);
                        setAiInput('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (aiInput.trim()) {
                        const newMessage = {
                          id: aiMessages.length + 1,
                          role: 'user',
                          content: aiInput
                        };
                        setAiMessages([...aiMessages, newMessage, {
                          id: aiMessages.length + 2,
                          role: 'assistant',
                          content: 'This is a placeholder response. In production, this would connect to an AI service to provide intelligent suggestions.'
                        }]);
                        setAiInput('');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">AI can help with note structuring, formatting, and compliance suggestions</p>
              </div>
            </div>
          </div>
        )}

        {/* Templates Sidepanel */}
        {activePanel === 'templates' && (
          <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 border-l border-gray-200 animate-slideLeft">
            <div className="h-full flex flex-col">
              <div className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSearch size={20} />
                  <h3 className="text-xl font-bold">Template Library</h3>
                </div>
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 border-b border-gray-200">
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Search templates by keyword..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">Search by keywords: balance sheet, income statement, notes, cash flow, policies, etc.</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {templates
                  .filter(template =>
                    templateSearch === '' ||
                    template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
                    template.category.toLowerCase().includes(templateSearch.toLowerCase()) ||
                    template.keywords.some(kw => kw.toLowerCase().includes(templateSearch.toLowerCase()))
                  )
                  .map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#101828]">{template.name}</h4>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-semibold">
                          {template.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.keywords.map((keyword, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          const selectedPage = pages.find(p => p.id === selectedPageId);
                          if (selectedPage) {
                            updatePageContent(selectedPageId, selectedPage.content + template.content);
                            showToast(`${template.name} added to document`);
                          }
                        }}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Add to Document
                      </button>
                    </div>
                  ))}

                {templates.filter(template =>
                  templateSearch === '' ||
                  template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
                  template.category.toLowerCase().includes(templateSearch.toLowerCase()) ||
                  template.keywords.some(kw => kw.toLowerCase().includes(templateSearch.toLowerCase()))
                ).length === 0 && (
                  <div className="text-center py-12">
                    <FileSearch size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No templates found matching "{templateSearch}"</p>
                    <p className="text-xs text-gray-400 mt-2">Try different keywords like "balance sheet", "notes", or "cash flow"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Page Settings Sidepanel */}
        {activePanel === 'pageSettings' && (
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-gray-200 animate-slideLeft">
            <div className="h-full flex flex-col">
              <div className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings size={20} />
                  <h3 className="text-xl font-bold">Page Settings</h3>
                </div>
                <button
                  onClick={() => setActivePanel(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <p className="text-sm text-gray-600">Configure page format, headers, footers, and page numbers</p>

                {/* Document Title */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Document Title</h4>
                  <input
                    type="text"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Financial Statements 2024..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Page Orientation */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Page Orientation</h4>
                  <select
                    value={pageOrientation}
                    onChange={(e) => setPageOrientation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                {/* Page Numbers */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3">Page Numbers</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="showPageNumbers"
                        checked={showPageNumbers}
                        onChange={(e) => setShowPageNumbers(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="showPageNumbers" className="text-sm text-gray-700">Show page numbers</label>
                    </div>

                    {showPageNumbers && (
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Position</label>
                        <select
                          value={pageNumberPosition}
                          onChange={(e) => setPageNumberPosition(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="top-left">Top Left</option>
                          <option value="top-center">Top Center</option>
                          <option value="top-right">Top Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="bottom-center">Bottom Center</option>
                          <option value="bottom-right">Bottom Right</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Header & Footer */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3 flex items-center gap-2">
                    <Heading size={16} />
                    Header & Footer
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={documentHeader}
                      onChange={(e) => setDocumentHeader(e.target.value)}
                      placeholder="Header text..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={documentFooter}
                      onChange={(e) => setDocumentFooter(e.target.value)}
                      placeholder="Footer text..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={insertHeaderFooter}
                      className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
                    >
                      Apply Header/Footer
                    </button>
                  </div>
                </div>

                {/* Watermark */}
                <div>
                  <h4 className="text-sm font-bold text-[#101828] mb-3 flex items-center gap-2">
                    <Droplet size={16} />
                    Watermark
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={watermark}
                      onChange={(e) => setWatermark(e.target.value)}
                      placeholder="DRAFT, CONFIDENTIAL..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={applyWatermark}
                      className="w-full px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700"
                    >
                      Apply Watermark
                    </button>
                  </div>
                </div>

                {/* Page Margins */}
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

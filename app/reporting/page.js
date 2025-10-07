'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import {
  FileText,
  Download,
  Save,
  Loader,
  X,
  Plus,
  Edit3,
  Eye,
  History,
  User,
  Clock,
  Type,
  Palette,
  AlignLeft,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Settings,
  ChevronDown,
  FileDown,
  Printer,
  Undo,
  Redo
} from 'lucide-react';

export default function ReportingBuilder() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [reportContent, setReportContent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showChangesPanel, setShowChangesPanel] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    template_name: '',
    template_type: 'standard',
    description: '',
    structure: {},
    styles: {}
  });
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [availablePeriods] = useState(['2024', '2023', '2022', '2021', '2020']);
  const [currentUser] = useState('John Doe');
  const [changes, setChanges] = useState([]);
  const [recentChanges, setRecentChanges] = useState([]);
  const [workingData, setWorkingData] = useState(null);
  const editorRef = useRef(null);

  // Report settings
  const [reportSettings, setReportSettings] = useState({
    companyName: 'Consolidated Group Inc.',
    reportTitle: 'Consolidated Financial Statements',
    period: '2024',
    header: 'Confidential - Internal Use Only',
    footer: `Page {page} | © ${new Date().getFullYear()} Consolidated Group Inc.`,
    primaryColor: '#101828',
    secondaryColor: '#4f46e5',
    fontFamily: 'Inter, sans-serif'
  });

  // Note being edited
  const [currentNote, setCurrentNote] = useState({
    note_number: 1,
    note_title: '',
    note_content: '',
    linked_accounts: []
  });

  useEffect(() => {
    loadInitialData();
  }, [selectedPeriod]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load templates, reports, and consolidation workings
      const [templatesRes, reportsRes, workingsRes, changesRes] = await Promise.all([
        supabase.from('report_templates').select('*').order('template_name'),
        supabase.from('financial_reports').select('*').eq('period', selectedPeriod).order('updated_at', { ascending: false }),
        supabase.from('consolidation_workings').select('*').eq('period', selectedPeriod).order('updated_at', { ascending: false }).limit(1),
        supabase.from('report_changes').select('*').eq('report_id', 'current').order('changed_at', { ascending: false }).limit(20)
      ]);

      setTemplates(templatesRes.data || []);
      setReports(reportsRes.data || []);
      setRecentChanges(changesRes.data || []);

      // Load working data
      if (workingsRes.data && workingsRes.data.length > 0) {
        const working = workingsRes.data[0];
        setWorkingData({
          period: working.period,
          lineItems: JSON.parse(working.line_items),
          totals: JSON.parse(working.totals),
          notes: JSON.parse(working.notes || '[]')
        });
      }

      // If there's an existing report for this period, load it
      if (reportsRes.data && reportsRes.data.length > 0) {
        const report = reportsRes.data[0];
        setSelectedReport(report);
        setReportContent(JSON.parse(report.content));
      } else {
        // Generate default report from workings
        generateDefaultReport();
      }

    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDefaultReport = () => {
    if (!workingData) return;

    const defaultContent = {
      sections: [
        {
          id: 'cover',
          type: 'cover',
          title: reportSettings.reportTitle,
          subtitle: `For the Year Ended December 31, ${reportSettings.period}`,
          companyName: reportSettings.companyName,
          editable: true
        },
        {
          id: 'balance-sheet',
          type: 'statement',
          title: 'Consolidated Statement of Financial Position',
          subtitle: `As at December 31, ${reportSettings.period}`,
          data: workingData.lineItems.balanceSheet,
          totals: workingData.totals.balanceSheet,
          editable: true
        },
        {
          id: 'income-statement',
          type: 'statement',
          title: 'Consolidated Statement of Comprehensive Income',
          subtitle: `For the Year Ended December 31, ${reportSettings.period}`,
          data: workingData.lineItems.incomeStatement,
          totals: workingData.totals.incomeStatement,
          editable: true
        },
        {
          id: 'equity',
          type: 'statement',
          title: 'Consolidated Statement of Changes in Equity',
          subtitle: `For the Year Ended December 31, ${reportSettings.period}`,
          data: workingData.lineItems.equity,
          totals: workingData.totals.equity,
          editable: true
        },
        {
          id: 'cash-flow',
          type: 'statement',
          title: 'Consolidated Statement of Cash Flows',
          subtitle: `For the Year Ended December 31, ${reportSettings.period}`,
          data: workingData.lineItems.cashFlow,
          totals: workingData.totals.cashFlow,
          editable: true
        },
        {
          id: 'notes',
          type: 'notes',
          title: 'Notes to the Consolidated Financial Statements',
          subtitle: `For the Year Ended December 31, ${reportSettings.period}`,
          notes: workingData.notes || [],
          editable: true
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: currentUser,
        version: 1
      }
    };

    setReportContent(defaultContent);
  };

  const handleSaveReport = async () => {
    if (!reportContent) {
      alert('No report to save');
      return;
    }

    setIsSaving(true);
    try {
      const reportData = {
        report_name: `${reportSettings.reportTitle} - ${reportSettings.period}`,
        period: selectedPeriod,
        content: JSON.stringify(reportContent),
        status: 'draft',
        header: reportSettings.header,
        footer: reportSettings.footer,
        custom_styles: JSON.stringify({
          primaryColor: reportSettings.primaryColor,
          secondaryColor: reportSettings.secondaryColor,
          fontFamily: reportSettings.fontFamily
        }),
        created_by: currentUser,
        updated_by: currentUser,
        version: (selectedReport?.version || 0) + 1
      };

      let savedReport;
      if (selectedReport) {
        // Update existing
        const { data, error } = await supabase
          .from('financial_reports')
          .update(reportData)
          .eq('id', selectedReport.id)
          .select();

        if (error) throw error;
        savedReport = data[0];
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('financial_reports')
          .insert([reportData])
          .select();

        if (error) throw error;
        savedReport = data[0];
      }

      // Save changes to audit trail
      if (changes.length > 0) {
        const changeRecords = changes.map(change => ({
          report_id: savedReport.id,
          version: savedReport.version,
          section: change.section,
          change_type: change.type,
          field_changed: change.field,
          old_value: change.oldValue,
          new_value: change.newValue,
          description: change.description,
          changed_by: currentUser,
          changed_at: new Date().toISOString()
        }));

        await supabase.from('report_changes').insert(changeRecords);
      }

      setSelectedReport(savedReport);
      setChanges([]);
      alert('Report saved successfully!');

    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving report: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportContent) {
      alert('No report to export');
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Header
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(reportSettings.header, margin, 10);

      // Title Page
      pdf.setFontSize(24);
      pdf.setTextColor(0);
      pdf.text(reportSettings.companyName, pageWidth / 2, 60, { align: 'center' });
      pdf.setFontSize(18);
      pdf.text(reportSettings.reportTitle, pageWidth / 2, 75, { align: 'center' });
      pdf.setFontSize(14);
      pdf.text(`For the Year Ended December 31, ${reportSettings.period}`, pageWidth / 2, 90, { align: 'center' });

      // Process each section
      reportContent.sections.forEach((section, index) => {
        if (section.type === 'cover') return; // Skip cover as we already added it

        if (section.type === 'statement' && section.data) {
          pdf.addPage();
          yPos = margin;

          // Statement title
          pdf.setFontSize(14);
          pdf.setTextColor(16, 24, 40);
          pdf.text(section.title, margin, yPos);
          yPos += 10;

          // Statement subtitle
          pdf.setFontSize(10);
          pdf.setTextColor(100);
          pdf.text(section.subtitle, margin, yPos);
          yPos += 15;

          // Create table
          const tableData = [];
          const groupedItems = {};

          section.data.lineItems?.forEach(item => {
            const group = item.accountClass || 'Other';
            if (!groupedItems[group]) {
              groupedItems[group] = [];
            }
            groupedItems[group].push(item);
          });

          // Add rows for each group
          Object.entries(groupedItems).forEach(([group, items]) => {
            // Group header
            tableData.push([{ content: group, colSpan: 4, styles: { fontStyle: 'bold', fillColor: [240, 245, 250] } }]);

            // Items in group
            items.forEach(item => {
              tableData.push([
                item.accountName,
                item.noteReference || '',
                formatCurrency(item.currentPeriod),
                formatCurrency(item.previousPeriod)
              ]);
            });

            // Group total
            const groupTotal = items.reduce((sum, item) => sum + (item.currentPeriod || 0), 0);
            const groupTotalPrev = items.reduce((sum, item) => sum + (item.previousPeriod || 0), 0);
            tableData.push([
              { content: `Total ${group}`, styles: { fontStyle: 'bold' } },
              '',
              { content: formatCurrency(groupTotal), styles: { fontStyle: 'bold' } },
              { content: formatCurrency(groupTotalPrev), styles: { fontStyle: 'bold' } }
            ]);
          });

          pdf.autoTable({
            startY: yPos,
            head: [['Particulars', 'Note', reportSettings.period, (parseInt(reportSettings.period) - 1).toString()]],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [16, 24, 40], textColor: 255, fontStyle: 'bold' },
            margin: { left: margin, right: margin },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
              0: { cellWidth: 100 },
              1: { cellWidth: 20, halign: 'center' },
              2: { cellWidth: 30, halign: 'right' },
              3: { cellWidth: 30, halign: 'right' }
            }
          });
        }
      });

      // Footer on all pages
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        const footerText = reportSettings.footer.replace('{page}', i.toString());
        pdf.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Save
      pdf.save(`${reportSettings.reportTitle}-${reportSettings.period}.pdf`);
      alert('PDF exported successfully!');

    } catch (error) {
      console.error('PDF export error:', error);
      alert('Error exporting PDF: ' + error.message);
    }
  };

  const handleExportWord = async () => {
    if (!reportContent) {
      alert('No report to export');
      return;
    }

    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Title Page
              new Paragraph({
                text: reportSettings.companyName,
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { before: 4000, after: 400 }
              }),
              new Paragraph({
                text: reportSettings.reportTitle,
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
              }),
              new Paragraph({
                text: `For the Year Ended December 31, ${reportSettings.period}`,
                alignment: AlignmentType.CENTER,
                spacing: { after: 2000 }
              }),

              // Process each section
              ...reportContent.sections
                .filter(section => section.type === 'statement' && section.data)
                .flatMap(section => {
                  const elements = [
                    new Paragraph({
                      text: section.title,
                      heading: HeadingLevel.HEADING_2,
                      spacing: { before: 800, after: 200 },
                      pageBreakBefore: true
                    }),
                    new Paragraph({
                      text: section.subtitle,
                      spacing: { after: 400 }
                    })
                  ];

                  // Create table for statement
                  if (section.data.lineItems) {
                    const tableRows = [
                      // Header row
                      new TableRow({
                        tableHeader: true,
                        children: [
                          new TableCell({ children: [new Paragraph({ text: 'Particulars', bold: true })] }),
                          new TableCell({ children: [new Paragraph({ text: 'Note', bold: true })] }),
                          new TableCell({ children: [new Paragraph({ text: reportSettings.period, bold: true })] }),
                          new TableCell({ children: [new Paragraph({ text: (parseInt(reportSettings.period) - 1).toString(), bold: true })] })
                        ]
                      })
                    ];

                    // Add data rows (simplified - just first few items for demo)
                    section.data.lineItems.slice(0, 10).forEach(item => {
                      tableRows.push(
                        new TableRow({
                          children: [
                            new TableCell({ children: [new Paragraph(item.accountName || '')] }),
                            new TableCell({ children: [new Paragraph(item.noteReference || '')] }),
                            new TableCell({ children: [new Paragraph(formatCurrency(item.currentPeriod))] }),
                            new TableCell({ children: [new Paragraph(formatCurrency(item.previousPeriod))] })
                          ]
                        })
                      );
                    });

                    elements.push(
                      new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: tableRows
                      })
                    );
                  }

                  return elements;
                })
            ]
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${reportSettings.reportTitle}-${reportSettings.period}.docx`);
      alert('Word document exported successfully!');

    } catch (error) {
      console.error('Word export error:', error);
      alert('Error exporting Word document: ' + error.message);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.template_name) {
      alert('Please provide a template name');
      return;
    }

    try {
      const templateData = {
        ...newTemplate,
        structure: reportContent ? JSON.stringify(reportContent) : '{}',
        styles: JSON.stringify(reportSettings),
        created_by: currentUser
      };

      const { data, error } = await supabase
        .from('report_templates')
        .insert([templateData])
        .select();

      if (error) throw error;

      setTemplates([...templates, data[0]]);
      setNewTemplate({
        template_name: '',
        template_type: 'standard',
        description: '',
        structure: {},
        styles: {}
      });
      setShowTemplateModal(false);
      alert('Template created successfully!');

    } catch (error) {
      console.error('Error creating template:', error);
      alert('Error creating template: ' + error.message);
    }
  };

  const handleLoadTemplate = async (template) => {
    try {
      const structure = JSON.parse(template.structure);
      const styles = JSON.parse(template.styles);

      setReportContent(structure);
      setReportSettings(styles);

      // Track change
      setChanges([...changes, {
        section: 'template',
        type: 'apply',
        field: 'template',
        oldValue: selectedReport?.template_id || 'none',
        newValue: template.id,
        description: `Applied template: ${template.template_name}`,
        timestamp: new Date().toISOString()
      }]);

      alert(`Template "${template.template_name}" applied successfully!`);
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Error loading template: ' + error.message);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== templateId));
      alert('Template deleted successfully!');

    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template: ' + error.message);
    }
  };

  const handleAddNote = async () => {
    if (!currentNote.note_title || !currentNote.note_content) {
      alert('Please provide note title and content');
      return;
    }

    try {
      // Add note to report content
      const updatedContent = { ...reportContent };
      const notesSection = updatedContent.sections.find(s => s.type === 'notes');
      if (notesSection) {
        notesSection.notes.push(currentNote);
      }

      setReportContent(updatedContent);

      // Track change
      const change = {
        section: 'notes',
        type: 'add',
        field: 'note',
        oldValue: '',
        newValue: currentNote.note_title,
        description: `Added Note ${currentNote.note_number}: ${currentNote.note_title}`
      };
      setChanges(prev => [...prev, change]);

      setShowNoteModal(false);
      setCurrentNote({
        note_number: currentNote.note_number + 1,
        note_title: '',
        note_content: '',
        linked_accounts: []
      });

      alert('Note added successfully!');
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Error adding note: ' + error.message);
    }
  };

  const handleContentEdit = (sectionId, field, newValue) => {
    const updatedContent = { ...reportContent };
    const section = updatedContent.sections.find(s => s.id === sectionId);

    if (section) {
      const oldValue = section[field];
      section[field] = newValue;
      setReportContent(updatedContent);

      // Track change
      const change = {
        section: sectionId,
        type: 'edit',
        field,
        oldValue,
        newValue,
        description: `Edited ${field} in ${section.title}`
      };
      setChanges(prev => [...prev, change]);
    }
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Rich text formatting functions
  const applyFormatting = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleBold = () => applyFormatting('bold');
  const handleItalic = () => applyFormatting('italic');
  const handleUnderline = () => applyFormatting('underline');
  const handleBulletList = () => applyFormatting('insertUnorderedList');
  const handleNumberedList = () => applyFormatting('insertOrderedList');
  const handleAlignLeft = () => applyFormatting('justifyLeft');
  const handleAlignCenter = () => applyFormatting('justifyCenter');
  const handleAlignRight = () => applyFormatting('justifyRight');
  const handleTextColor = (color) => applyFormatting('foreColor', color);
  const handleBackgroundColor = (color) => applyFormatting('backColor', color);

  const renderToolbar = () => {
    return (
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Formatting tools */}
          <button onClick={handleBold} className="p-2 hover:bg-slate-100 rounded transition-colors" title="Bold (Ctrl+B)">
            <Bold size={18} className="text-slate-600" />
          </button>
          <button onClick={handleItalic} className="p-2 hover:bg-slate-100 rounded transition-colors" title="Italic (Ctrl+I)">
            <Italic size={18} className="text-slate-600" />
          </button>
          <button onClick={handleUnderline} className="p-2 hover:bg-slate-100 rounded transition-colors" title="Underline (Ctrl+U)">
            <Underline size={18} className="text-slate-600" />
          </button>

          <div className="w-px h-6 bg-slate-300 mx-2"></div>

          <button onClick={handleBulletList} className="p-2 hover:bg-slate-100 rounded transition-colors" title="Bullet List">
            <List size={18} className="text-slate-600" />
          </button>
          <button onClick={handleNumberedList} className="p-2 hover:bg-slate-100 rounded transition-colors" title="Numbered List">
            <ListOrdered size={18} className="text-slate-600" />
          </button>

          <div className="w-px h-6 bg-slate-300 mx-2"></div>

          <div className="relative group">
            <button className="p-2 hover:bg-slate-100 rounded transition-colors" title="Text Color">
              <Palette size={18} className="text-slate-600" />
            </button>
            <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 p-2 z-10">
              <div className="grid grid-cols-5 gap-1">
                {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleTextColor(color)}
                    className="w-6 h-6 rounded border border-slate-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="relative group">
            <button className="p-2 hover:bg-slate-100 rounded transition-colors" title="Align">
              <AlignLeft size={18} className="text-slate-600" />
            </button>
            <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10">
              <button onClick={handleAlignLeft} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">Left</button>
              <button onClick={handleAlignCenter} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">Center</button>
              <button onClick={handleAlignRight} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">Right</button>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-300 mx-2"></div>

          <button onClick={() => applyFormatting('undo')} className="p-2 hover:bg-slate-100 rounded transition-colors" title="Undo (Ctrl+Z)">
            <Undo size={18} className="text-slate-600" />
          </button>
          <button onClick={() => applyFormatting('redo')} className="p-2 hover:bg-slate-100 rounded transition-colors" title="Redo (Ctrl+Y)">
            <Redo size={18} className="text-slate-600" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNoteModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Note
          </button>

          <button
            onClick={() => setShowChangesPanel(!showChangesPanel)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <History size={16} />
            Changes ({changes.length})
          </button>
        </div>
      </div>
    );
  };

  const renderStatementSection = (section) => {
    if (!section.data) return null;

    // Group by account class
    const groupedItems = {};
    section.data.lineItems.forEach(item => {
      const group = item.accountClass || 'Other';
      if (!groupedItems[group]) {
        groupedItems[group] = [];
      }
      groupedItems[group].push(item);
    });

    const groups = Object.keys(groupedItems);

    return (
      <div className="mb-12">
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: reportSettings.primaryColor }}
          contentEditable={isEditMode}
          suppressContentEditableWarning
          onBlur={(e) => handleContentEdit(section.id, 'title', e.target.textContent)}
        >
          {section.title}
        </h2>
        <p className="text-sm text-slate-600 mb-6">{section.subtitle}</p>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2" style={{ borderColor: reportSettings.primaryColor }}>
              <th className="text-left py-2 px-4 text-sm font-semibold" style={{ color: reportSettings.primaryColor }}>
                Particulars
              </th>
              <th className="text-center py-2 px-4 text-sm font-semibold w-20" style={{ color: reportSettings.primaryColor }}>
                Note
              </th>
              <th className="text-right py-2 px-4 text-sm font-semibold w-40" style={{ color: reportSettings.primaryColor }}>
                {reportSettings.period}
              </th>
              <th className="text-right py-2 px-4 text-sm font-semibold w-40" style={{ color: reportSettings.primaryColor }}>
                {parseInt(reportSettings.period) - 1}
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, groupIndex) => (
              <>
                {/* Group Header */}
                <tr key={`group-${groupIndex}`} className="bg-slate-50">
                  <td colSpan={4} className="py-2 px-4 font-bold text-sm uppercase" style={{ color: reportSettings.primaryColor }}>
                    {group}
                  </td>
                </tr>

                {/* Line Items */}
                {groupedItems[group].map((item, itemIndex) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-4 pl-8">
                      <div className="text-sm text-slate-800">{item.label}</div>
                      <div className="text-xs text-slate-500">{item.accountCode}</div>
                    </td>
                    <td className="text-center py-2 px-4">
                      <span className="text-xs text-indigo-600">{item.noteRef}</span>
                    </td>
                    <td className="text-right py-2 px-4 text-sm font-medium">
                      {formatCurrency(item.value)}
                    </td>
                    <td className="text-right py-2 px-4 text-sm text-slate-400">
                      -
                    </td>
                  </tr>
                ))}

                {/* Subtotal */}
                {section.id === 'balance-sheet' && (
                  <tr className="bg-slate-50 font-semibold">
                    <td className="py-2 px-4 pl-8">Total {group}</td>
                    <td></td>
                    <td className="text-right py-2 px-4">
                      {formatCurrency(groupedItems[group].reduce((sum, item) => sum + item.value, 0))}
                    </td>
                    <td className="text-right py-2 px-4 text-slate-400">-</td>
                  </tr>
                )}
              </>
            ))}

            {/* Grand Total */}
            <tr className="font-bold border-t-2" style={{ borderColor: reportSettings.primaryColor, backgroundColor: `${reportSettings.primaryColor}10` }}>
              <td className="py-3 px-4" style={{ color: reportSettings.primaryColor }}>
                {section.id === 'balance-sheet' ? 'Total Assets' :
                 section.id === 'income-statement' ? 'Net Income' :
                 section.id === 'equity' ? 'Closing Balance' :
                 'Net Cash Flow'}
              </td>
              <td></td>
              <td className="text-right py-3 px-4" style={{ color: reportSettings.primaryColor }}>
                {formatCurrency(section.totals.assets || section.totals.netIncome || section.totals.closingBalance || section.totals.netCashFlow)}
              </td>
              <td className="text-right py-3 px-4 text-slate-400">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderNotesSection = (section) => {
    return (
      <div className="mb-12">
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: reportSettings.primaryColor }}
        >
          {section.title}
        </h2>
        <p className="text-sm text-slate-600 mb-6">{section.subtitle}</p>

        <div className="space-y-6">
          {section.notes.map((note, index) => (
            <div key={note.id || index} className="border-l-4 pl-6 py-2" style={{ borderColor: reportSettings.secondaryColor }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: reportSettings.primaryColor }}>
                Note {note.number || index + 1}: {note.title}
              </h3>
              <div
                className="text-sm text-slate-700 leading-relaxed"
                contentEditable={isEditMode}
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: note.content || note.note_content }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCoverPage = (section) => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center mb-12 border-b-2 pb-12" style={{ borderColor: reportSettings.primaryColor }}>
        <h1
          className="text-5xl font-bold mb-4"
          style={{ color: reportSettings.primaryColor }}
          contentEditable={isEditMode}
          suppressContentEditableWarning
          onBlur={(e) => handleContentEdit(section.id, 'companyName', e.target.textContent)}
        >
          {section.companyName}
        </h1>
        <h2 className="text-3xl font-semibold mb-2" style={{ color: reportSettings.secondaryColor }}>
          {section.title}
        </h2>
        <p className="text-xl text-slate-600 mb-8">{section.subtitle}</p>
        <div className="mt-8 text-sm text-slate-500">
          <p>Prepared by: {currentUser}</p>
          <p>Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    );
  };

  const renderAddNoteModal = () => {
    if (!showNoteModal) return null;

    return (
      <>
        <div className="fixed inset-0 bg-slate-900/60 z-50" onClick={() => setShowNoteModal(false)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#101828] text-white px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={24} />
                <h3 className="text-xl font-semibold">Add Note to Financial Statement</h3>
              </div>
              <button onClick={() => setShowNoteModal(false)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Note Number</label>
                    <input
                      type="number"
                      value={currentNote.note_number}
                      onChange={(e) => setCurrentNote({ ...currentNote, note_number: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Note Title*</label>
                    <input
                      type="text"
                      value={currentNote.note_title}
                      onChange={(e) => setCurrentNote({ ...currentNote, note_title: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Accounting Policies"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Note Content*</label>
                  <textarea
                    value={currentNote.note_content}
                    onChange={(e) => setCurrentNote({ ...currentNote, note_content: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={8}
                    placeholder="Enter the detailed content of this note..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Linked Accounts <span className="text-slate-500 text-xs">(Optional - comma separated account codes)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 1000, 1010, 1020"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderTemplateModal = () => {
    if (!showTemplateModal) return null;

    return (
      <>
        <div className="fixed inset-0 bg-slate-900/60 z-50" onClick={() => setShowTemplateModal(false)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#101828] text-white px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={24} />
                <h3 className="text-xl font-semibold">Report Templates</h3>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {/* Create New Template Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-semibold text-[#101828] mb-4">Create New Template</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Template Name*</label>
                    <input
                      type="text"
                      value={newTemplate.template_name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, template_name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., IFRS Annual Report 2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Template Type</label>
                    <select
                      value={newTemplate.template_type}
                      onChange={(e) => setNewTemplate({ ...newTemplate, template_type: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="standard">Standard</option>
                      <option value="ifrs">IFRS</option>
                      <option value="gaap">GAAP</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Describe this template..."
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleCreateTemplate}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Save as Template
                  </button>
                </div>
              </div>

              {/* Existing Templates */}
              <div>
                <h4 className="text-lg font-semibold text-[#101828] mb-4">Available Templates ({templates.length})</h4>
                {templates.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No templates available. Create one above.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {templates.map((template) => (
                      <div key={template.id} className="border border-slate-200 rounded-lg p-5 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="text-base font-semibold text-[#101828]">{template.template_name}</h5>
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                                {template.template_type}
                              </span>
                              {template.is_default && (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{template.description || 'No description'}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>Created by {template.created_by || 'Unknown'}</span>
                              <span>•</span>
                              <span>{new Date(template.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleLoadTemplate(template)}
                              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg font-medium hover:bg-red-100 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderSettingsModal = () => {
    if (!showSettingsModal) return null;

    return (
      <>
        <div className="fixed inset-0 bg-slate-900/60 z-50" onClick={() => setShowSettingsModal(false)} />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#101828] text-white px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings size={24} />
                <h3 className="text-xl font-semibold">Report Settings</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={reportSettings.companyName}
                    onChange={(e) => setReportSettings({ ...reportSettings, companyName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Report Title</label>
                  <input
                    type="text"
                    value={reportSettings.reportTitle}
                    onChange={(e) => setReportSettings({ ...reportSettings, reportTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Header</label>
                  <input
                    type="text"
                    value={reportSettings.header}
                    onChange={(e) => setReportSettings({ ...reportSettings, header: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Footer</label>
                  <input
                    type="text"
                    value={reportSettings.footer}
                    onChange={(e) => setReportSettings({ ...reportSettings, footer: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Use {page} for page number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={reportSettings.primaryColor}
                        onChange={(e) => setReportSettings({ ...reportSettings, primaryColor: e.target.value })}
                        className="w-12 h-10 rounded border border-slate-300"
                      />
                      <input
                        type="text"
                        value={reportSettings.primaryColor}
                        onChange={(e) => setReportSettings({ ...reportSettings, primaryColor: e.target.value })}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={reportSettings.secondaryColor}
                        onChange={(e) => setReportSettings({ ...reportSettings, secondaryColor: e.target.value })}
                        className="w-12 h-10 rounded border border-slate-300"
                      />
                      <input
                        type="text"
                        value={reportSettings.secondaryColor}
                        onChange={(e) => setReportSettings({ ...reportSettings, secondaryColor: e.target.value })}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Font Family</label>
                  <select
                    value={reportSettings.fontFamily}
                    onChange={(e) => setReportSettings({ ...reportSettings, fontFamily: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-[#101828] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Inter, sans-serif">Inter</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Times New Roman, serif">Times New Roman</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Courier New, monospace">Courier New</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-3 justify-end">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    alert('Settings applied successfully!');
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Apply Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderChangesPanel = () => {
    if (!showChangesPanel) return null;

    return (
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-slate-200 shadow-2xl z-40">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History size={20} className="text-slate-600" />
            <h3 className="text-lg font-semibold text-[#101828]">Change History</h3>
          </div>
          <button onClick={() => setShowChangesPanel(false)} className="p-2 hover:bg-slate-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-80px)] p-4">
          {changes.length === 0 && recentChanges.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <History size={48} className="mx-auto mb-3 text-slate-300" />
              <p>No changes recorded</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Unsaved changes */}
              {changes.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-amber-800 mb-3">Unsaved Changes ({changes.length})</p>
                  {changes.map((change, index) => (
                    <div key={index} className="text-sm bg-white rounded p-3 mb-2 border border-amber-100">
                      <p className="font-medium text-[#101828]">{change.description}</p>
                      <p className="text-xs text-slate-500 mt-1">Section: {change.section}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Saved changes */}
              {recentChanges.map((change) => (
                <div key={change.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-sm font-medium text-[#101828] mb-1">{change.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User size={12} />
                    <span>{change.changed_by}</span>
                    <span>•</span>
                    <Clock size={12} />
                    <span>{new Date(change.changed_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading reporting builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f7f5f2]">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#101828]">Reporting Builder</h1>
            <p className="text-sm text-slate-600">Create and customize financial statements for {reportSettings.period}</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availablePeriods.map(period => (
                <option key={period} value={period}>FY {period}</option>
              ))}
            </select>

            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              <FileText size={16} />
              Templates
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              <Settings size={16} />
              Settings
            </button>

            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isEditMode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isEditMode ? <><Eye size={16} /> Preview</> : <><Edit3 size={16} /> Edit</>}
            </button>

            <button
              onClick={handleSaveReport}
              disabled={isSaving || changes.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
              Save
            </button>

            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#101828] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] transition-colors">
                <FileDown size={16} />
                Export
                <ChevronDown size={16} />
              </button>
              <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-10">
                <button
                  onClick={handleExportPDF}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileText size={16} />
                  Export as PDF
                </button>
                <button
                  onClick={handleExportWord}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileText size={16} />
                  Export as Word
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        {isEditMode && renderToolbar()}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 max-w-[1200px] mx-auto">
        {/* Report Document */}
        <div className="bg-white rounded-lg shadow-lg p-12" style={{ fontFamily: reportSettings.fontFamily }}>
          {/* Header */}
          {reportSettings.header && (
            <div className="text-center text-xs text-slate-500 mb-8 pb-4 border-b border-slate-200">
              {reportSettings.header}
            </div>
          )}

          {/* Content Sections */}
          {reportContent?.sections.map((section, index) => (
            <div key={section.id}>
              {section.type === 'cover' && renderCoverPage(section)}
              {section.type === 'statement' && renderStatementSection(section)}
              {section.type === 'notes' && renderNotesSection(section)}
            </div>
          ))}

          {/* Footer */}
          {reportSettings.footer && (
            <div className="text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-200">
              {reportSettings.footer.replace('{page}', '1')}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Modals */}
      {renderAddNoteModal()}
      {renderTemplateModal()}
      {renderSettingsModal()}
      {renderChangesPanel()}
    </div>
  );
}

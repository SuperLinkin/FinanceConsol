'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import {
  BookOpen, Rocket, Database, FileText, Search,
  ChevronRight, X, Send, CheckCircle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DocsPage() {
  const [mounted, setMounted] = useState(false);
  const [documentation, setDocumentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('getting-started');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleContent, setArticleContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    description: '',
    email: ''
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadDocumentation();
  }, []);

  const loadDocumentation = async () => {
    try {
      const response = await fetch('/api/docs');
      const data = await response.json();
      setDocumentation(data);
    } catch (error) {
      console.error('Failed to load documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArticle = async (articleId) => {
    setSelectedArticle(articleId);
    setLoadingContent(true);
    try {
      const response = await fetch(`/api/docs?article=${articleId}`);
      const data = await response.json();
      setArticleContent(data.content || 'Content not available');
    } catch (error) {
      console.error('Failed to load article:', error);
      setArticleContent('Failed to load content');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleSubmitTicket = async () => {
    console.log('Submitting support ticket:', ticketForm);
    setTicketSubmitted(true);
    setTimeout(() => {
      setShowTicketModal(false);
      setTicketSubmitted(false);
      setTicketForm({
        subject: '',
        category: 'technical',
        priority: 'medium',
        description: '',
        email: ''
      });
    }, 2000);
  };

  const renderMarkdown = (content) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-3xl font-bold text-slate-900 mb-4">{line.slice(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-2xl font-bold text-slate-900 mt-6 mb-3">{line.slice(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-bold text-slate-900 mt-4 mb-2">{line.slice(4)}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={idx} className="text-slate-700 ml-4">{line.slice(2)}</li>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="font-bold text-slate-900 my-2">{line.slice(2, -2)}</p>;
      } else if (line.trim() === '') {
        return <br key={idx} />;
      } else {
        return <p key={idx} className="text-slate-700 my-2">{line}</p>;
      }
    });
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <PageHeader title="Documentation" subtitle="Help & Guides" icon={BookOpen} />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <p className="text-gray-600">Loading documentation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!documentation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <PageHeader title="Documentation" subtitle="Help & Guides" icon={BookOpen} />
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <p className="text-red-600">Failed to load documentation</p>
          </div>
        </div>
      </div>
    );
  }

  const currentSection = documentation.sections.find(s => s.id === selectedSection);
  const filteredSections = searchTerm
    ? documentation.sections.map(section => ({
        ...section,
        articles: section.articles.filter(article =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(section => section.articles.length > 0)
    : documentation.sections;

  const sectionIcons = {
    'getting-started': Rocket,
    'features': FileText,
    'erp-integration': Database,
    'advanced': BookOpen
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader title="Documentation" subtitle="Help & Guides" icon={BookOpen} />

      <div className="max-w-7xl mx-auto px-8 py-8">
        {!selectedArticle ? (
          <>
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
              {documentation.sections.map((section) => {
                const Icon = sectionIcons[section.id] || BookOpen;
                return (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                      selectedSection === section.id
                        ? 'bg-gradient-to-r ' + section.color + ' text-white shadow-lg'
                        : 'bg-white text-slate-700 hover:shadow-md'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-semibold">{section.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(searchTerm ? filteredSections : [currentSection]).map((section) =>
                section?.articles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => loadArticle(article.id)}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      <ChevronRight className="text-slate-400 group-hover:text-blue-600 transition-colors" size={20} />
                    </div>
                    <p className="text-slate-600 text-sm mb-4">{article.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{article.readTime}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Support Section */}
            <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Need More Help?</h2>
              <p className="mb-4 opacity-90">Can't find what you're looking for? Submit a support ticket and our team will help you.</p>
              <button
                onClick={() => setShowTicketModal(true)}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Submit Support Ticket
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Article View */}
            <button
              onClick={() => {
                setSelectedArticle(null);
                setArticleContent('');
              }}
              className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ChevronRight size={20} className="rotate-180" />
              Back to Documentation
            </button>

            <div className="bg-white rounded-xl shadow-lg p-8">
              {loadingContent ? (
                <p className="text-gray-600">Loading article...</p>
              ) : (
                <div className="prose max-w-none">
                  {renderMarkdown(articleContent)}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Support Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Submit Support Ticket</h2>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            {ticketSubmitted ? (
              <div className="p-8 text-center">
                <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Ticket Submitted!</h3>
                <p className="text-slate-600">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm({...ticketForm, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="your.email@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Detailed description of your issue or question"
                  />
                </div>

                <button
                  onClick={handleSubmitTicket}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Submit Ticket
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

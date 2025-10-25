'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  FileText,
  GitMerge,
  Scissors,
  Wrench,
  FileBarChart,
  Globe,
  Settings,
  Upload,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Sparkles,
  TableProperties,
  BookOpen,
  FileCode,
  UserCircle,
  LogOut,
  User,
  ChevronDown,
  ChevronUp,
  Building,
  Database,
  FlaskConical,
  TrendingUp,
  Package,
  Zap,
  ClipboardList,
  PieChart
} from 'lucide-react';

// Organized menu structure with collapsible groups
const menuStructure = [
  {
    type: 'single',
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/'
  },
  {
    type: 'single',
    icon: Sparkles,
    label: 'Integration Hub',
    href: '/platform'
  },
  {
    type: 'group',
    label: 'Setup & Upload',
    icon: Package,
    items: [
      { icon: Settings, label: 'Consol Config', href: '/settings' },
      { icon: FileText, label: 'Chart of Accounts', href: '/chart-of-accounts' },
      { icon: Upload, label: 'Upload TB', href: '/upload' }
    ]
  },
  {
    type: 'group',
    label: 'Data Preparation',
    icon: Zap,
    items: [
      { icon: Globe, label: 'Translations', href: '/translations' },
      { icon: Scissors, label: 'Eliminations', href: '/eliminations' },
      { icon: Wrench, label: 'Adjustment Entry', href: '/builder' },
      { icon: TableProperties, label: 'TB Viewer', href: '/trial-balance' }
    ]
  },
  {
    type: 'group',
    label: 'Workings',
    icon: ClipboardList,
    items: [
      { icon: FolderKanban, label: 'Consol Workings', href: '/consolidation-workings' },
      { icon: TrendingUp, label: 'Cash Flow', href: '/cash-flow' },
      { icon: FileCode, label: 'Accounting Policy', href: '/accounting-policy' },
      { icon: BookOpen, label: 'Note Builder', href: '/note-builder' }
    ]
  },
  {
    type: 'single',
    icon: FileBarChart,
    label: 'MD&A',
    href: '/mda'
  },
  {
    type: 'single',
    icon: PieChart,
    label: 'Reporting',
    href: '/reporting'
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: 'John Doe', email: 'john@example.com' });
  const [currentCompany, setCurrentCompany] = useState({ name: 'Acme Corporation', env: 'Production' });
  const [expandedGroups, setExpandedGroups] = useState({});

  const userMenuRef = useRef(null);
  const companyMenuRef = useRef(null);

  useEffect(() => {
    // Load user and company from localStorage or API
    const savedUser = localStorage.getItem('currentUser');
    const savedCompany = localStorage.getItem('currentCompany');

    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedCompany) setCurrentCompany(JSON.parse(savedCompany));

    // Auto-expand groups that contain the current page
    const autoExpandGroups = {};
    menuStructure.forEach((item, index) => {
      if (item.type === 'group') {
        const hasActivePage = item.items.some(subItem =>
          pathname === subItem.href || pathname.startsWith(subItem.href + '/')
        );
        if (hasActivePage) {
          autoExpandGroups[item.label] = true;
        }
      }
    });
    setExpandedGroups(autoExpandGroups);

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (companyMenuRef.current && !companyMenuRef.current.contains(event.target)) {
        setShowCompanyMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pathname]);

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logging out...');
    setShowUserMenu(false);
  };

  const handleProfileSettings = () => {
    // Navigate to profile settings
    window.location.href = '/profile';
    setShowUserMenu(false);
  };

  const switchEnvironment = (env) => {
    const updatedCompany = { ...currentCompany, env };
    setCurrentCompany(updatedCompany);
    localStorage.setItem('currentCompany', JSON.stringify(updatedCompany));
    setShowCompanyMenu(false);
  };

  const toggleGroup = (groupLabel) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupLabel]: !prev[groupLabel]
    }));
  };

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

    return (
      <Link
        href={item.href}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200
          ${isActive
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg shadow-blue-500/20'
            : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }
          ${isCollapsed ? 'justify-center' : ''}
        `}
        title={isCollapsed ? item.label : ''}
      >
        <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
        {!isCollapsed && <span>{item.label}</span>}
        {!isCollapsed && isActive && (
          <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
        )}
      </Link>
    );
  };

  const renderGroupHeader = (group) => {
    const Icon = group.icon;
    const isExpanded = expandedGroups[group.label];
    const hasActivePage = group.items.some(item =>
      pathname === item.href || pathname.startsWith(item.href + '/')
    );

    return (
      <button
        onClick={() => toggleGroup(group.label)}
        className={`
          w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200
          ${hasActivePage
            ? 'bg-slate-800/80 text-white'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
          }
          ${isCollapsed ? 'justify-center' : ''}
        `}
        title={isCollapsed ? group.label : ''}
      >
        <Icon size={16} className={`flex-shrink-0 ${hasActivePage ? 'text-blue-400' : 'text-slate-500'}`} />
        {!isCollapsed && (
          <>
            <span className="font-medium flex-1 text-left">{group.label}</span>
            {isExpanded ? (
              <ChevronUp size={14} className="text-slate-500" />
            ) : (
              <ChevronDown size={14} className="text-slate-500" />
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <div
      className={`bg-gradient-to-b from-[#0f172a] to-[#1e293b] h-screen flex flex-col transition-all duration-300 ease-in-out shadow-2xl ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo/Header with Company Info */}
      <div className="p-6 border-b border-slate-700/50">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3" style={{ lineHeight: '1.1' }}>
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-slate-800 font-bold text-base">C</span>
                </div>
                <div className="flex-1">
                  <h1
                    className="text-2xl tracking-tight"
                    style={{
                      fontFamily: 'var(--font-satoshi), Satoshi, sans-serif',
                      fontWeight: 500,
                      color: '#FFFFFF',
                      lineHeight: '1.1'
                    }}
                  >
                    CLOE
                  </h1>
                </div>
              </div>
              {/* Collapse Button - Top Right */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white transition-all duration-200 shadow-lg"
                title="Collapse Sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            {/* Company Switcher - Compact Design */}
            <div className="relative" ref={companyMenuRef}>
              <button
                onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-slate-400" />
                    <span className="text-xs font-medium text-white truncate">{currentCompany.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${currentCompany.env === 'Production' ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                    <span className={`text-[10px] font-medium ${currentCompany.env === 'Production' ? 'text-green-400' : 'text-orange-400'}`}>
                      {currentCompany.env === 'Production' ? 'PRD' : 'SBX'}
                    </span>
                  </div>
                </div>
              </button>

              {/* Company Environment Switcher Dropdown */}
              {showCompanyMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 py-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-700">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Environment</p>
                  </div>
                  <button
                    onClick={() => switchEnvironment('Production')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      currentCompany.env === 'Production'
                        ? 'bg-green-500/10 text-green-400'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Database size={14} />
                    <span className="text-xs font-medium">Production</span>
                    {currentCompany.env === 'Production' && (
                      <div className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    )}
                  </button>
                  <button
                    onClick={() => switchEnvironment('Sandbox')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      currentCompany.env === 'Sandbox'
                        ? 'bg-orange-500/10 text-orange-400'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <FlaskConical size={14} />
                    <span className="text-xs font-medium">Sandbox</span>
                    {currentCompany.env === 'Sandbox' && (
                      <div className="ml-auto w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-slate-800 font-bold text-base">C</span>
            </div>
            {/* Expand Button - Collapsed State */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 hover:text-white transition-all duration-200 shadow-lg"
              title="Expand Sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuStructure.map((item, index) => {
            if (item.type === 'single') {
              return (
                <li key={item.href || index}>
                  {renderMenuItem(item)}
                </li>
              );
            } else if (item.type === 'group') {
              const isExpanded = expandedGroups[item.label];

              return (
                <li key={item.label} className="mb-2">
                  {renderGroupHeader(item)}
                  {!isCollapsed && isExpanded && (
                    <ul className="mt-1 ml-3 space-y-1 border-l-2 border-slate-700/50 pl-3">
                      {item.items.map((subItem) => (
                        <li key={subItem.href}>
                          {renderMenuItem(subItem)}
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* Show tooltip on hover when collapsed */}
                  {isCollapsed && (
                    <div className="hidden group-hover:block absolute left-full ml-2 top-0 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </li>
              );
            }
            return null;
          })}
        </ul>
      </nav>
    </div>
  );
}

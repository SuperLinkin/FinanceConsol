'use client';

import { useState } from 'react';
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
  Search,
  Settings,
  Upload,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Sparkles,
  TableProperties
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Sparkles, label: 'The Platform', href: '/platform' },
  { icon: Building2, label: 'Entity Setup', href: '/entity-setup' },
  { icon: Upload, label: 'Upload', href: '/upload' },
  { icon: TableProperties, label: 'Trial Balance', href: '/trial-balance' },
  { icon: FileText, label: 'Chart of Accounts', href: '/chart-of-accounts' },
  { icon: GitMerge, label: 'Entity Logic', href: '/entity-logic' },
  { icon: Scissors, label: 'Eliminations', href: '/eliminations' },
  { icon: Wrench, label: 'Builder', href: '/builder' },
  { icon: FolderKanban, label: 'Consol Workings', href: '/consolidation-workings' },
  { icon: FileBarChart, label: 'Reporting', href: '/reporting' },
  { icon: Search, label: 'Audit Trail', href: '/audit' },
  { icon: Settings, label: 'Consol Config', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`bg-gradient-to-b from-[#0f172a] to-[#1e293b] h-screen flex flex-col transition-all duration-300 ease-in-out shadow-2xl ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo/Header */}
      <div className="p-6 border-b border-slate-700/50">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ConsolidatePro</h1>
            </div>
            <p className="text-xs text-slate-400 ml-10 tracking-wide">IFRS COMPLIANCE</p>
          </>
        ) : (
          <div className="text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg mx-auto">
              <span className="text-white font-bold">C</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg shadow-blue-500/20 scale-105'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white hover:scale-102'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                  {!isCollapsed && isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white font-medium text-sm transition-all duration-200 border border-white/10"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <>
              <ChevronLeft size={18} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

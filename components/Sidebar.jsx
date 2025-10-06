'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  FileText,
  GitMerge,
  Scissors,
  Settings as SettingsIcon,
  FileBarChart,
  Search,
  Settings,
  Upload
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Building2, label: 'Entity Setup', href: '/entity-setup' },
  { icon: Upload, label: 'Upload', href: '/upload' },
  { icon: FileText, label: 'Chart of Accounts', href: '/chart-of-accounts' },
  { icon: GitMerge, label: 'Mapping', href: '/mapping' },
  { icon: Scissors, label: 'Eliminations', href: '/eliminations' },
  { icon: SettingsIcon, label: 'Adjustments', href: '/adjustments' },
  { icon: FileBarChart, label: 'Reporting', href: '/reporting' },
  { icon: Search, label: 'Audit Trail', href: '/audit' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-[#f5f5f0] h-screen flex flex-col">
      {/* Logo/Header */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">ConsolidatePro</h1>
        <p className="text-xs text-gray-600 mt-1">IFRS COMPLIANCE</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors
                    ${isActive 
                      ? 'bg-[#e8e8e0] text-gray-900 font-medium' 
                      : 'text-gray-700 hover:bg-[#ebebde]'
                    }
                  `}
                >
                  <Icon size={18} className="text-gray-600" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

export default function UserProfileMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Load user from localStorage
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentCompany');

    // Redirect to home page
    router.push('/home');
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {/* User Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
          <span className="text-white font-semibold text-sm">
            {getUserInitials(currentUser.name)}
          </span>
        </div>

        {/* User Info */}
        <div className="text-left hidden md:block">
          <p className="text-sm font-semibold text-[#101828]">{currentUser.name}</p>
          <p className="text-xs text-gray-500">{currentUser.email}</p>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown
          size={16}
          className={`text-gray-600 transition-transform hidden md:block ${showMenu ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="font-semibold text-[#101828]">{currentUser.name}</p>
            <p className="text-xs text-gray-500">{currentUser.email}</p>
            {currentUser.username && (
              <p className="text-xs text-gray-400 mt-1">@{currentUser.username}</p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setShowMenu(false);
                // Navigate to profile settings (can implement later)
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User size={16} className="text-gray-600" />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={() => {
                setShowMenu(false);
                router.push('/close/settings');
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings size={16} className="text-gray-600" />
              <span>System Settings</span>
            </button>
          </div>

          {/* Logout */}
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

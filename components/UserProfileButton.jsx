'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, User, LogOut, Settings } from 'lucide-react';

export default function UserProfileButton() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: 'John Doe', email: 'john@example.com', role: 'user' });
  const userMenuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setCurrentUser(userData);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentCompany');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
    setShowUserMenu(false);
  };

  const handleProfileSettings = () => {
    router.push('/profile');
    setShowUserMenu(false);
  };

  const handleSystemSettings = () => {
    router.push('/system-settings');
    setShowUserMenu(false);
  };

  // Check if user has admin access
  const isAdmin = currentUser?.role === 'primary_admin' || currentUser?.role === 'admin';

  return (
    <div className="relative" ref={userMenuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        title={currentUser.name}
      >
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
          <UserCircle size={20} className="text-white" />
        </div>
        <div className="text-left hidden lg:block">
          <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
        </div>
      </button>

      {/* User Dropdown */}
      {showUserMenu && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
            <p className="text-xs text-gray-500">{currentUser.email}</p>
            {currentUser.role && (
              <p className="text-xs text-blue-600 font-medium mt-1 capitalize">
                {currentUser.role.replace('_', ' ')}
              </p>
            )}
          </div>
          <button
            onClick={handleProfileSettings}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <User size={16} />
            Profile Settings
          </button>
          {isAdmin && (
            <button
              onClick={handleSystemSettings}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings size={16} />
              System Settings
            </button>
          )}
          <div className="my-1 border-t border-gray-200"></div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

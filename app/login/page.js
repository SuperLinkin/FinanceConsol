'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '', module: 'reporting' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBackToHome = () => {
    console.log('Navigating to /home');
    router.push('/home');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if Finance Close module is selected
    if (formData.module === 'finance-close') {
      setError('CLOE - Finance Close module is coming soon!');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
          name: `${data.user.first_name} ${data.user.last_name}`,
          email: data.user.email,
          role: data.user.role,
          userId: data.user.id,
          isPrimary: data.user.is_primary
        }));

        localStorage.setItem('currentCompany', JSON.stringify({
          name: data.user.company.company_name,
          env: 'Production',
          companyId: data.user.company_id
        }));

        // Redirect to dashboard (Reporting module)
        // Use window.location.href for a full page reload to ensure authentication state is properly set
        window.location.href = '/';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] flex flex-col">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-xl">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              type="button"
              onClick={handleBackToHome}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold text-[#101828]">CLOE</span>
            </button>

            <button
              type="button"
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-[#475569] hover:text-[#101828] font-semibold transition-colors duration-200 cursor-pointer"
            >
              <ArrowLeft size={18} />
              Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Login Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#7B61FF] to-[#A78BFA] rounded-2xl shadow-xl mb-4">
              <span className="text-3xl font-bold text-white">C</span>
            </div>
            <h1 className="text-4xl font-bold text-[#101828] mb-2">
              CLOE
            </h1>
            <p className="text-[#475569] text-sm font-semibold tracking-wider">
              Close Optimization Engine
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#101828] mb-2">Welcome Back</h2>
              <p className="text-[#475569] text-sm">Sign in to access your account</p>
            </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
                  placeholder="Enter your username"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Module Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Module
              </label>
              <select
                value={formData.module}
                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 bg-white"
                disabled={loading}
              >
                <option value="reporting">CLOE - Reporting</option>
                <option value="finance-close">CLOE - Finance Close (Coming Soon)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7B61FF] to-[#A78BFA] text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

            {/* Demo Credentials - Only show in development */}
            {process.env.NEXT_PUBLIC_ENABLE_DEMO === 'true' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-2">Demo Credentials:</p>
                <div className="space-y-1">
                  <p className="text-xs text-blue-800">
                    <span className="font-medium">Username:</span> Admin
                  </p>
                  <p className="text-xs text-blue-800">
                    <span className="font-medium">Password:</span> Test
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#475569]">
              © 2025 CLOE. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

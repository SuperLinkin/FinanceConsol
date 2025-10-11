'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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

        // Redirect to dashboard
        router.push('/');
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl mb-4">
            <span className="text-3xl font-bold text-slate-800">C</span>
          </div>
          <h1
            className="text-4xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-satoshi), Satoshi, sans-serif' }}
          >
            CLOE
          </h1>
          <p className="text-slate-300 text-sm uppercase tracking-wider">
            Your Optimization Engine
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600 text-sm">Sign in to access your account</p>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <p className="text-sm text-slate-400">
            © 2024 CLOE. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

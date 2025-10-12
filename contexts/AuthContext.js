'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check for pre-authentication pages
    const preAuthPages = ['/login', '/home', '/product', '/about'];
    const isPreAuthPage = preAuthPages.includes(pathname);

    if (isPreAuthPage) {
      setLoading(false);
      return;
    }

    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify({
          name: `${data.user.first_name} ${data.user.last_name}`,
          email: data.user.email,
          role: data.user.role,
          userId: data.user.id,
          isPrimary: data.user.is_primary
        }));

        localStorage.setItem('currentCompany', JSON.stringify({
          name: data.user.companies.company_name,
          env: 'Production',
          companyId: data.user.company_id
        }));
      } else {
        // Not authenticated - redirect to home page (landing page)
        router.push('/home');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Redirect to home page on error
      router.push('/home');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentCompany');
      router.push('/home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasPermission = (permissionName) => {
    if (!user) return false;
    // TODO: Implement proper permission checking from database
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, hasPermission, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

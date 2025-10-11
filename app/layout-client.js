'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import Sidebar from "@/components/Sidebar";

export default function RootLayoutClient({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <AuthProvider>
      {isLoginPage ? (
        // Login page - no sidebar
        <div>{children}</div>
      ) : (
        // Main app - with sidebar
        <div className="flex h-screen overflow-hidden bg-[#f7f5f2]">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      )}
    </AuthProvider>
  );
}

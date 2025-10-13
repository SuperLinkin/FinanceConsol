'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import Sidebar from "@/components/Sidebar";

export default function RootLayoutClient({ children }) {
  const pathname = usePathname();

  // Pre-authentication pages (no sidebar needed)
  const preAuthPages = ['/login', '/home', '/product', '/about'];
  const isPreAuthPage = preAuthPages.includes(pathname);

  // Finance Close pages (have their own CloseSidebar)
  const isClosePage = pathname.startsWith('/close');

  return (
    <AuthProvider>
      {isPreAuthPage || isClosePage ? (
        // Pre-auth pages and Close pages - no Reporting sidebar
        <div>{children}</div>
      ) : (
        // Reporting module - with Reporting sidebar
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

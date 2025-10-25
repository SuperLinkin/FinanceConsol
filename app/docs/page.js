'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Documentation"
        subtitle="Help & Guides"
        icon={BookOpen}
      />

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to CLOE Documentation</h1>
          <p className="text-gray-600">Documentation is being updated. Please check back soon.</p>
        </div>
      </div>
    </div>
  );
}

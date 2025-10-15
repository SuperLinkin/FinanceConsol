'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Always redirect to homepage
    router.push('/home');
  }, [router]);

  // Show nothing while redirecting
  return null;
}

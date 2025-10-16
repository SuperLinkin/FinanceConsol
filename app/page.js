'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');

        if (response.ok) {
          // User is authenticated - redirect to dashboard
          router.push('/dashboard');
        } else {
          // Not authenticated - redirect to homepage
          router.push('/home');
        }
      } catch (error) {
        // Error checking auth - redirect to homepage
        router.push('/home');
      }
    };

    checkAuth();
  }, [router]);

  // Show nothing while checking/redirecting
  return null;
}

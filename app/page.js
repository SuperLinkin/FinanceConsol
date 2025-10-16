'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardPage from './dashboard/page';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');

        if (response.ok) {
          // User is authenticated - show dashboard
          setIsAuthenticated(true);
        } else {
          // Not authenticated - redirect to homepage
          router.push('/home');
        }
      } catch (error) {
        // Error checking auth - redirect to homepage
        router.push('/home');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading or nothing while checking auth
  if (isLoading) {
    return null;
  }

  // If authenticated, show the dashboard
  if (isAuthenticated) {
    return <DashboardPage />;
  }

  // Otherwise show nothing (redirecting)
  return null;
}

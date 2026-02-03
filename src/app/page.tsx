'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

// Redirect to appropriate page based on authentication and role
export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Not logged in -> redirect to login
      router.replace('/login');
      return;
    }

    // Redirect based on role
    const role = user.role.toUpperCase();
    switch (role) {
      case 'ADMIN':
        router.replace('/admin/dashboard');
        break;
      case 'MANAGER':
        router.replace('/management/dashboard');
        break;
      case 'COLLECTOR':
        router.replace('/mobile');
        break;
      default:
        router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Loading screen while checking auth
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">WATU KOBU</h1>
          <p className="text-blue-400 text-sm font-medium tracking-widest mt-1">COLLECTION MANAGEMENT SYSTEM</p>
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center gap-3">
          <Loader2 size={24} className="animate-spin text-blue-500" />
          <span className="text-slate-400 text-sm">Memuat...</span>
        </div>
      </div>
    </div>
  );
}

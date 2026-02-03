'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home,
    Search,
    Clock,
    User,
    Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
    href: string;
    icon: React.ElementType;
    label: string;
}

const navItems: NavItem[] = [
    { href: '/mobile', icon: Home, label: 'Home' },
    { href: '/mobile/search', icon: Search, label: 'Search' },
    { href: '/mobile/history', icon: Clock, label: 'History' },
    { href: '/mobile/profile', icon: User, label: 'Profile' },
];

// Helper function to get redirect path by role
function getRedirectByRole(role: string): string {
    const redirectMap: Record<string, string> = {
        admin: '/admin/dashboard',
        manager: '/management/dashboard',
        collector: '/mobile',
    };
    return redirectMap[role] || '/login';
}

// Loading Screen Component
function LoadingScreen() {
    return (
        <div className="min-h-screen bg-slate-200 flex items-center justify-center">
            <div className="max-w-md mx-auto bg-slate-50 min-h-screen w-full flex items-center justify-center shadow-2xl">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="animate-spin text-blue-600" />
                    <p className="text-slate-500 text-sm">Loading...</p>
                </div>
            </div>
        </div>
    );
}

export default function MobileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading } = useAuth();

    // Route protection
    useEffect(() => {
        if (isLoading) return; // Wait for auth check

        if (!user) {
            // Not logged in -> redirect to login
            router.replace('/login');
            return;
        }

        if (user.role !== 'collector') {
            // Wrong role -> redirect to correct dashboard
            router.replace(getRedirectByRole(user.role));
            return;
        }
    }, [user, isLoading, router]);

    // Show loading while checking auth or if user doesn't have correct role
    if (isLoading || !user || user.role !== 'collector') {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-slate-200">
            {/* Mobile Container - Max width to simulate phone on desktop */}
            <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative shadow-2xl">
                {/* Main Content Area */}
                <main className="pb-28">
                    {children}
                </main>

                {/* Bottom Navigation Bar */}
                <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] flex justify-between items-end px-8 pb-6 pt-3 z-50 rounded-t-3xl">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1.5 w-16 group transition-colors ${isActive
                                    ? 'text-[#0F172A]'
                                    : 'text-slate-400 hover:text-[#0F172A]'
                                    }`}
                            >
                                <div className="relative">
                                    <Icon
                                        size={28}
                                        className={`transition-transform group-hover:scale-110 ${isActive ? 'fill-current' : ''
                                            }`}
                                    />
                                    {/* Notification dot for Home */}
                                    {item.label === 'Home' && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                    )}
                                </div>
                                <span className={`text-[10px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}

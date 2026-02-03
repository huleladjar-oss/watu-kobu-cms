'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    Package,
    Settings,
    HelpCircle,
    Search,
    Bell,
    User,
    LogOut,
    Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Helper function to get initials from name
function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Helper function to capitalize role
function formatRole(role: string): string {
    const roleMap: Record<string, string> = {
        admin: 'Admin Staff',
        manager: 'Regional Director',
        collector: 'Field Collector',
    };
    return roleMap[role] || role;
}

// Helper function to get redirect path by role
function getRedirectByRole(role: string): string {
    const redirectMap: Record<string, string> = {
        admin: '/admin/dashboard',
        manager: '/management/dashboard',
        collector: '/mobile',
    };
    return redirectMap[role] || '/login';
}

// Sidebar Link Component
function SidebarLink({
    href,
    icon: Icon,
    label,
    isActive,
}: {
    href: string;
    icon: React.ElementType;
    label: string;
    isActive: boolean;
}) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                ? 'bg-white/15 text-white border-l-4 border-blue-500 -ml-[4px] pl-[calc(0.75rem+4px)]'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
        >
            <Icon size={20} />
            {label}
        </Link>
    );
}

// Loading Screen Component
function LoadingScreen() {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-100">
            <div className="flex flex-col items-center gap-4">
                <Loader2 size={40} className="animate-spin text-blue-600" />
                <p className="text-slate-500 text-sm">Loading...</p>
            </div>
        </div>
    );
}

export default function ManagementLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();

    const mainMenuItems = [
        { href: '/management/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/management/team', icon: Users, label: 'Team' },
        { href: '/management/reports', icon: FileText, label: 'Reports' },
        { href: '/management/assets', icon: Package, label: 'Assets' },
    ];

    const settingsMenuItems = [
        { href: '/management/configuration', icon: Settings, label: 'Configuration' },
        { href: '/management/support', icon: HelpCircle, label: 'Support' },
    ];

    // Route protection
    useEffect(() => {
        if (isLoading) return; // Wait for auth check

        if (!user) {
            // Not logged in -> redirect to login
            router.replace('/login');
            return;
        }

        if (user.role !== 'manager') {
            // Wrong role -> redirect to correct dashboard
            router.replace(getRedirectByRole(user.role));
            return;
        }
    }, [user, isLoading, router]);

    // Show loading while checking auth or if user doesn't have correct role
    if (isLoading || !user || user.role !== 'manager') {
        return <LoadingScreen />;
    }

    return (
        <div className="h-screen flex overflow-hidden bg-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0F172A] flex flex-col h-full flex-shrink-0 text-white">
                {/* Logo */}
                <div className="p-6 border-b border-slate-700/50">
                    <div className="flex flex-col">
                        <h1 className="text-white text-xl font-bold tracking-tight">WATU KOBU</h1>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mt-1">Management</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
                    {mainMenuItems.map((item) => (
                        <SidebarLink
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            isActive={pathname === item.href}
                        />
                    ))}

                    {/* Settings Section */}
                    <div className="pt-4 mt-4 border-t border-slate-700/50">
                        <p className="px-3 text-xs font-semibold text-slate-500 uppercase mb-2">Settings</p>
                        {settingsMenuItems.map((item) => (
                            <SidebarLink
                                key={item.href}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                isActive={pathname === item.href}
                            />
                        ))}
                    </div>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden text-white font-bold text-sm">
                            {getInitials(user.name)}
                        </div>
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">
                                {user.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                                {formatRole(user.role)}
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-10">
                    <div className="flex items-center gap-2">
                        <Link href="/management/dashboard" className="text-slate-500 text-sm font-medium hover:text-slate-800">
                            Home
                        </Link>
                        <span className="text-slate-400 text-sm">/</span>
                        <span className="text-[#0F172A] text-sm font-semibold">Executive Dashboard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative hidden md:flex items-center">
                            <Search size={18} className="absolute left-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search data..."
                                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#0F172A] w-64 text-slate-600"
                            />
                        </div>
                        {/* Notification */}
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 relative text-slate-600 cursor-pointer">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        {/* Profile */}
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer">
                            <User size={20} />
                        </button>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">
                    {children}
                </div>
            </main>
        </div>
    );
}

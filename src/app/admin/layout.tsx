'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Database, ClipboardList, CheckCircle, FileText, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useValidation } from '@/context/ValidationContext';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Asset Registry', href: '/admin/registry', icon: <Database size={20} /> },
    { label: 'Assignments', href: '/admin/assignments', icon: <ClipboardList size={20} /> },
    { label: 'Validation', href: '/admin/validation', icon: <CheckCircle size={20} /> },
    { label: 'Documents', href: '/admin/documents', icon: <FileText size={20} /> },
];

function getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatRole(role: string): string {
    const r = role.toUpperCase();
    const roleMap: Record<string, string> = { ADMIN: 'Admin Staff', MANAGER: 'Manager', COLLECTOR: 'Field Collector' };
    return roleMap[r] || role;
}

function getRedirectByRole(role: string): string {
    const r = role.toUpperCase();
    const redirectMap: Record<string, string> = { ADMIN: '/admin/dashboard', MANAGER: '/management/dashboard', COLLECTOR: '/mobile' };
    return redirectMap[r] || '/login';
}

function LoadingScreen() {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-[#F1F5F9]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 size={40} className="animate-spin text-blue-600" />
                <p className="text-slate-500 text-sm">Loading...</p>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();
    const { getFieldPendingCount, getPaymentPendingCount } = useValidation();

    const pendingCount = getFieldPendingCount() + getPaymentPendingCount();

    useEffect(() => {
        if (isLoading) return;
        if (!user) { router.replace('/login'); return; }
        // Compare role case-insensitively
        if (user.role.toUpperCase() !== 'ADMIN') { router.replace(getRedirectByRole(user.role)); return; }
    }, [user, isLoading, router]);

    // Compare role case-insensitively
    if (isLoading || !user || user.role.toUpperCase() !== 'ADMIN') {
        return <LoadingScreen />;
    }

    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0F172A] flex flex-col justify-between shrink-0">
                <div className="flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-slate-700/50">
                        <h1 className="text-white text-xl font-bold tracking-tight">WATU KOBU</h1>
                        <p className="text-slate-400 text-xs font-medium tracking-wider mt-1">ADMINISTRATION</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-1 p-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            const showBadge = item.href === '/admin/validation' && pendingCount > 0;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center justify-between gap-3 px-3 py-3 rounded-lg transition-colors ${isActive ? 'bg-[#137fec] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </div>
                                    {showBadge && (
                                        <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold px-1.5 rounded-full">
                                            {pendingCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Footer */}
                <div className="p-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border-2 border-slate-600">
                            {getInitials(user.name)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <p className="text-white text-sm font-medium truncate">{user.name}</p>
                            <p className="text-slate-400 text-xs truncate">{formatRole(user.role)}</p>
                        </div>
                        <button onClick={logout} className="ml-auto text-slate-400 hover:text-white cursor-pointer" title="Logout">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#F1F5F9] h-full">
                <div className="flex-1 overflow-y-auto p-8">{children}</div>
            </main>
        </div>
    );
}

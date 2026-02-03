'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle,
    User,
    Lock,
    Bell,
    Map,
    Headphones,
    FileText,
    LogOut,
    ChevronRight,
    Star,
    RefreshCw,
    Phone,
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

// Helper function to format role
function formatRole(role: string): string {
    const roleMap: Record<string, string> = {
        admin: 'Admin Staff',
        manager: 'Manager',
        collector: 'Senior Collector',
    };
    return roleMap[role] || role;
}

// Menu Item Component
function MenuItem({
    icon: Icon,
    label,
    iconBg,
    iconColor,
    onClick,
    hasToggle,
    toggleValue,
    onToggle,
    subtitle,
}: {
    icon: React.ElementType;
    label: string;
    iconBg: string;
    iconColor: string;
    onClick?: () => void;
    hasToggle?: boolean;
    toggleValue?: boolean;
    onToggle?: () => void;
    subtitle?: string;
}) {
    if (hasToggle) {
        return (
            <div className="w-full flex items-center justify-between p-4 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
                        <Icon size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700">{label}</span>
                        {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
                    </div>
                </div>
                <button
                    onClick={onToggle}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer shadow-inner ${toggleValue ? 'bg-[#2563EB]' : 'bg-slate-300'
                        }`}
                >
                    <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${toggleValue ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    ></span>
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-100 last:border-0 cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
                    <Icon size={20} />
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                    {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
                </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
        </button>
    );
}

export default function MobileProfilePage() {
    const router = useRouter();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState('5 menit lalu');
    const { user, logout } = useAuth();

    // Handle sync action
    const handleSync = async () => {
        if (isSyncing) return;

        setIsSyncing(true);
        // Simulate sync delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsSyncing(false);
        setLastSync('Baru saja');
    };

    // Handle phone call
    const handleCallAdmin = () => {
        window.location.href = 'tel:+6281234567890';
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
            {/* Header - Extended Navy Background */}
            <header className="bg-[#0F172A] pt-14 pb-24 px-5 relative overflow-hidden">
                <div className="flex justify-center items-center relative z-10">
                    <h2 className="text-white text-xl font-bold tracking-tight">Profil Saya</h2>
                </div>
                {/* Decorative Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 bottom-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-5 -mt-16 relative z-30 flex flex-col gap-5">
                {/* Profile Card - Hero Overlapping Header */}
                <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center border border-slate-100">
                    {/* Avatar with Badge */}
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-3xl">
                            {user ? getInitials(user.name) : 'U'}
                        </div>
                        {/* Status Ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-pulse opacity-50"></div>
                    </div>

                    {/* Top Performer Badge */}
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-full border-2 border-yellow-300 flex items-center gap-1.5 shadow-md mb-3">
                        <Star size={14} className="fill-yellow-900" />
                        Top Performer
                    </div>

                    {/* Name & Role */}
                    <h3 className="text-2xl font-bold text-[#0F172A] mt-1">
                        {user?.name || 'Budi Santoso'}
                    </h3>
                    <p className="text-[#2563EB] font-semibold text-sm mt-0.5">
                        {user ? formatRole(user.role) : 'Senior Collector'}
                    </p>

                    {/* ID & Area */}
                    <div className="flex items-center gap-3 mt-4 text-xs">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-medium">
                            ID: WK-{user?.id?.toString().padStart(3, '0') || '092'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-slate-500 font-medium">📍 Jakarta Selatan</span>
                    </div>
                </div>

                {/* Sync Status Card - Important for Field App */}
                <div className="bg-blue-50 rounded-2xl p-4 flex items-center justify-between border border-blue-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSyncing ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                            }`}>
                            {isSyncing ? (
                                <RefreshCw size={20} className="animate-spin" />
                            ) : (
                                <CheckCircle size={20} />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">
                                Status Sinkronisasi
                            </p>
                            <p className="text-sm font-semibold text-slate-700">
                                {isSyncing ? 'Menyinkronkan data...' : `Data Terakhir Sinkron: ${lastSync}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={`px-4 py-2 border text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer ${isSyncing
                            ? 'border-slate-300 text-slate-400 bg-slate-100'
                            : 'border-[#2563EB] text-[#2563EB] hover:bg-blue-600 hover:text-white active:scale-95'
                            }`}
                    >
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                </div>

                {/* Settings Menu - Akun */}
                <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                        👤 Akun
                    </h4>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <MenuItem
                            icon={User}
                            label="Edit Data Diri"
                            subtitle="Nama, foto, alamat"
                            iconBg="bg-blue-50"
                            iconColor="text-[#2563EB]"
                            onClick={() => router.push('/mobile/profile/edit')}
                        />
                        <MenuItem
                            icon={Lock}
                            label="Ganti Password"
                            subtitle="Perbarui kata sandi"
                            iconBg="bg-blue-50"
                            iconColor="text-[#2563EB]"
                            onClick={() => router.push('/mobile/profile/password')}
                        />
                    </div>
                </section>

                {/* Settings Menu - Aplikasi */}
                <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                        ⚙️ Aplikasi
                    </h4>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <MenuItem
                            icon={Bell}
                            label="Notifikasi"
                            subtitle={notificationsEnabled ? 'Aktif' : 'Nonaktif'}
                            iconBg="bg-indigo-50"
                            iconColor="text-indigo-600"
                            hasToggle
                            toggleValue={notificationsEnabled}
                            onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
                        />
                        <MenuItem
                            icon={Map}
                            label="Mode Peta"
                            subtitle={mapMode === 'street' ? 'Street View' : 'Satellite'}
                            iconBg="bg-indigo-50"
                            iconColor="text-indigo-600"
                            hasToggle
                            toggleValue={mapMode === 'satellite'}
                            onToggle={() => setMapMode(mapMode === 'street' ? 'satellite' : 'street')}
                        />
                    </div>
                </section>

                {/* Settings Menu - Bantuan */}
                <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                        🎧 Bantuan
                    </h4>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <MenuItem
                            icon={Phone}
                            label="Hubungi Admin Pusat"
                            subtitle="+62 812-3456-7890"
                            iconBg="bg-orange-50"
                            iconColor="text-orange-500"
                            onClick={handleCallAdmin}
                        />
                        <MenuItem
                            icon={FileText}
                            label="Panduan Aplikasi"
                            subtitle="Tutorial & FAQ"
                            iconBg="bg-orange-50"
                            iconColor="text-orange-500"
                        />
                    </div>
                </section>

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="w-full mt-4 border-2 border-red-400 text-red-600 hover:bg-red-50 active:bg-red-100 active:scale-[0.98] font-bold h-14 rounded-2xl transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-sm"
                >
                    <LogOut size={22} className="group-hover:scale-110 transition-transform" />
                    LOGOUT / KELUAR
                </button>

                {/* App Version Footer */}
                <div className="text-center py-4">
                    <p className="text-xs text-slate-400">WK Collection Management System</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">Versi 1.0.4 • Build 2024.02</p>
                </div>
            </main>
        </div>
    );
}

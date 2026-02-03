'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAssets } from '@/context/AssetContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronRight, MapPin, TrendingUp, Target, Handshake } from 'lucide-react';

// PKWT KPI Standards
const DAILY_VISIT_TARGET = 15;
const MONTHLY_TARGET_PERCENTAGE = 0.20; // 20% of portfolio
const HARDCODED_MONTHLY_TARGET = 500000000; // Rp 500 Juta (as per KPI doc)

// Format Rupiah
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// Format Rupiah Short
function formatRupiahShort(amount: number): string {
    if (amount >= 1000000000) {
        return `Rp ${(amount / 1000000000).toFixed(1)} M`;
    }
    if (amount >= 1000000) {
        return `Rp ${(amount / 1000000).toFixed(1)} Jt`;
    }
    return formatRupiah(amount);
}

// Get current date formatted
function getTodayFormatted(): string {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const today = new Date();
    const dayName = days[today.getDay()];
    const date = today.getDate();
    const monthName = months[today.getMonth()];
    const year = today.getFullYear();

    return `${dayName}, ${date} ${monthName} ${year}`;
}

export default function MobileHomePage() {
    const { user, logout } = useAuth();
    const { assets } = useAssets();
    const router = useRouter();

    // Filter tasks for current collector
    const myTasks = useMemo(() => {
        if (!user) return [];

        // Debug mode: if admin, show all tasks
        if (user.role === 'ADMIN') {
            return assets.filter((a) => a.collectorId !== null);
        }

        // Regular mode: show only assigned tasks
        return assets.filter((a) => a.collectorId === user.id);
    }, [assets, user]);

    // Calculate comprehensive KPI metrics
    const kpiMetrics = useMemo(() => {
        // 1. Total Portfolio (Sum of all arrears assigned to collector)
        const totalPortfolio = myTasks.reduce((sum, task) => sum + task.totalArrears, 0);

        // 2. Monthly Target (Use hardcoded or 20% of portfolio)
        const monthlyTarget = HARDCODED_MONTHLY_TARGET;
        // Alternative: const monthlyTarget = totalPortfolio * MONTHLY_TARGET_PERCENTAGE;

        // 3. Collected Amount (MOCK - Replace with real payment data)
        // In production: Sum payments received this month for this collector
        const collectedAmount = totalPortfolio * 0.15; // Mock: 15% collected

        // 4. Daily Visits (MOCK - Replace with validation report count)
        const dailyVisits = 12; // Mock: 12 visits today

        // 5. Promise to Pay Today (MOCK - First 3 tasks for demo)
        const promiseToPayCount = 3; // Mock count

        // Calculate progress percentage
        const collectionProgress = monthlyTarget > 0 ? Math.min((collectedAmount / monthlyTarget) * 100, 100) : 0;

        // Visit status
        const visitStatus = dailyVisits >= DAILY_VISIT_TARGET ? 'achieved' : dailyVisits >= DAILY_VISIT_TARGET * 0.7 ? 'ontrack' : 'behind';

        return {
            totalPortfolio,
            monthlyTarget,
            collectedAmount,
            collectionProgress,
            dailyVisits,
            visitStatus,
            promiseToPayCount,
        };
    }, [myTasks]);

    // Mock: Tasks with promise to pay today (first 3 for demo)
    const tasksWithPromiseToday = useMemo(() => {
        return myTasks.slice(0, 3).map(t => t.id);
    }, [myTasks]);

    // Mock: Tasks not yet visited (simulate - assume tasks without validation)
    const tasksNotVisited = useMemo(() => {
        // In production: filter tasks that don't have approved validation reports
        return myTasks.slice(3, 8).map(t => t.id);
    }, [myTasks]);

    // Smart sorting: Promise Today > Not Visited > Others
    const sortedTasks = useMemo(() => {
        return [...myTasks].sort((a, b) => {
            // Priority 1: Promise to pay today
            const aHasPromise = tasksWithPromiseToday.includes(a.id);
            const bHasPromise = tasksWithPromiseToday.includes(b.id);

            if (aHasPromise && !bHasPromise) return -1;
            if (!aHasPromise && bHasPromise) return 1;

            // Priority 2: Not yet visited
            const aNotVisited = tasksNotVisited.includes(a.id);
            const bNotVisited = tasksNotVisited.includes(b.id);

            if (aNotVisited && !bNotVisited) return -1;
            if (!aNotVisited && bNotVisited) return 1;

            // Priority 3: Sort by amount descending
            return b.totalArrears - a.totalArrears;
        });
    }, [myTasks, tasksWithPromiseToday, tasksNotVisited]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Container */}
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm">
                {/* Executive KPI Header (Dark Navy Corporate) */}
                <div className="bg-slate-900 text-white px-6 pt-8 pb-20">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <p className="text-xs text-slate-400 mb-1">{getTodayFormatted()}</p>
                            <h1 className="text-2xl font-bold">Halo, {user.name}</h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* KPI Scorecard Container (Overlapping Header) */}
                <div className="px-6 -mt-14 mb-6 relative z-10">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">

                        {/* ROW 1: The Money (Collection Progress) - Result 50% */}
                        <div className="mb-6">
                            <div className="flex items-end justify-between mb-2">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Collected</p>
                                    <p className="text-2xl font-bold text-green-600">{formatRupiahShort(kpiMetrics.collectedAmount)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Target Bulan Ini</p>
                                    <p className="text-2xl font-bold text-blue-900">{formatRupiahShort(kpiMetrics.monthlyTarget)}</p>
                                </div>
                            </div>

                            {/* Progress Bar (Thick, Visual Focus) */}
                            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-700"
                                    style={{ width: `${kpiMetrics.collectionProgress}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <p className="text-gray-500">
                                    Total Portfolio Pegangan: <span className="font-semibold text-gray-700">{formatRupiahShort(kpiMetrics.totalPortfolio)}</span>
                                </p>
                                <p className="font-semibold" style={{
                                    color: kpiMetrics.collectionProgress >= 100 ? '#16a34a' : kpiMetrics.collectionProgress >= 50 ? '#f59e0b' : '#dc2626'
                                }}>
                                    {Math.round(kpiMetrics.collectionProgress)}%
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-4" />

                        {/* ROW 2: The Activity (Visit & PTP) - Visit 20% + Incentive */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Column 1: Daily Visits */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Target size={16} className="text-blue-600" />
                                    </div>
                                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Kunjungan</p>
                                </div>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span
                                        className="text-3xl font-bold"
                                        style={{
                                            color: kpiMetrics.visitStatus === 'achieved' ? '#16a34a' : kpiMetrics.visitStatus === 'ontrack' ? '#f59e0b' : '#dc2626'
                                        }}
                                    >
                                        {kpiMetrics.dailyVisits}
                                    </span>
                                    <span className="text-lg text-gray-400">/ {DAILY_VISIT_TARGET}</span>
                                </div>
                                <p className="text-xs text-gray-500">Hari Ini</p>
                            </div>

                            {/* Column 2: Promise to Pay / Potential */}
                            <div className="border-l border-gray-200 pl-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-amber-50 rounded-lg">
                                        <Handshake size={16} className="text-amber-600" />
                                    </div>
                                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Potensi</p>
                                </div>
                                <div className="mb-1">
                                    <span className="text-3xl font-bold text-amber-600">{kpiMetrics.promiseToPayCount}</span>
                                </div>
                                <p className="text-xs text-gray-500">Janji Bayar</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Task List Header */}
                <div className="px-6 mb-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Daftar Tugas</h2>
                        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-semibold">
                            {sortedTasks.length} Debitur
                        </span>
                    </div>
                </div>

                {/* Task List (Professional Cards with Smart Sorting) */}
                <div className="px-6 pb-24">
                    {sortedTasks.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-400 text-sm">Tidak ada tugas saat ini</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedTasks.map((task) => {
                                const hasPromise = tasksWithPromiseToday.includes(task.id);
                                const notVisited = tasksNotVisited.includes(task.id);

                                return (
                                    <div
                                        key={task.id}
                                        className={`bg-white rounded-lg hover:shadow-md transition-shadow ${hasPromise
                                            ? 'border-2 border-l-4 border-amber-400 shadow-sm'
                                            : 'border border-gray-200'
                                            }`}
                                    >
                                        {/* Priority Badge (Promise to Pay) */}
                                        {hasPromise && (
                                            <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-2 border-b border-amber-200">
                                                <p className="text-xs font-bold text-amber-700 flex items-center gap-2">
                                                    <Handshake size={14} />
                                                    JANJI BAYAR HARI INI
                                                </p>
                                            </div>
                                        )}

                                        {/* Card Content */}
                                        <div className="p-4">
                                            {/* Row 1: Debtor Name + Status */}
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex-1">
                                                    <h3 className="text-base font-semibold text-gray-900 mb-0.5">
                                                        {task.debtorName}
                                                    </h3>
                                                    {notVisited && !hasPromise && (
                                                        <p className="text-xs text-blue-600 font-medium">⚡ Belum Dikunjungi</p>
                                                    )}
                                                </div>
                                                <span className={`px-2.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${task.spkStatus === 'AKTIF'
                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {task.spkStatus}
                                                </span>
                                            </div>

                                            {/* Row 2: Address */}
                                            <div className="flex items-start gap-1.5 text-sm text-gray-600 mb-3">
                                                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-gray-400" />
                                                <p className="line-clamp-1">
                                                    {task.collateralAddress && task.collateralAddress !== '-' && task.collateralAddress !== '0'
                                                        ? task.collateralAddress
                                                        : <span className="italic text-gray-400">Kredit Tanpa Agunan</span>}
                                                </p>
                                            </div>

                                            {/* Row 3: Amount + Action */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-0.5">Total Tagihan</p>
                                                    <p className="text-xl font-bold text-red-700">
                                                        {formatRupiahShort(task.totalArrears)}
                                                    </p>
                                                </div>

                                                <Link
                                                    href={hasPromise ? `/mobile/collect/${task.id}` : `/mobile/task/${task.id}`}
                                                    className={`px-4 py-2 font-semibold text-sm rounded-lg transition-colors flex items-center gap-1 ${hasPromise
                                                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                                                        : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                                                        }`}
                                                >
                                                    {hasPromise ? 'Collect' : 'Visit'}
                                                    <ChevronRight size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Debug Info (Admin Only) */}
                {user.role === 'admin' && (
                    <div className="px-6 pb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-700 font-semibold">🔧 DEBUG MODE</p>
                            <p className="text-xs text-blue-600 mt-1">
                                Portfolio: {formatRupiahShort(kpiMetrics.totalPortfolio)} |
                                Target: {formatRupiahShort(kpiMetrics.monthlyTarget)} |
                                Collected: {formatRupiahShort(kpiMetrics.collectedAmount)} ({Math.round(kpiMetrics.collectionProgress)}%)
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

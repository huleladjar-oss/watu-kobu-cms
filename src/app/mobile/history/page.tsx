'use client';

import { useState, useMemo } from 'react';
import {
    Calendar,
    Footprints,
    CheckCircle2,
    Clock,
    XCircle,
    ShieldCheck,
    Wallet,
    MapPin,
    FileText,
    Filter,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';
import { useValidation } from '@/context/ValidationContext';
import { useAssets } from '@/context/AssetContext';
import { useAuth } from '@/context/AuthContext';

// Unified Timeline Item type
type TimelineType = 'VISIT' | 'PAYMENT';
type ValidationStatus = 'Approved' | 'Pending' | 'Rejected';
type FilterType = 'all' | 'approved' | 'rejected' | 'visit' | 'payment';

interface TimelineItem {
    id: string;
    type: TimelineType;
    time: string;
    timestamp: number;
    debtorName: string;
    detail: string;
    amount?: number;
    method?: string;
    result?: string;
    status: ValidationStatus;
    rejectReason?: string;
    assetId?: string;
}

// Filter chip definitions
const filterChips: { id: FilterType; label: string; emoji?: string }[] = [
    { id: 'all', label: 'Semua' },
    { id: 'approved', label: 'Disetujui', emoji: '✅' },
    { id: 'rejected', label: 'Ditolak', emoji: '❌' },
    { id: 'visit', label: 'Kunjungan', emoji: '🏃' },
    { id: 'payment', label: 'Pembayaran', emoji: '💰' },
];

// Format Rupiah
const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

// Simple Calendar Modal Component
function CalendarModal({
    selectedDate,
    onSelectDate,
    onClose
}: {
    selectedDate: string;
    onSelectDate: (date: string) => void;
    onClose: () => void;
}) {
    const [viewDate, setViewDate] = useState(() => {
        const d = selectedDate ? new Date(selectedDate) : new Date();
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.year, viewDate.month, 1).getDay();

    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    const prevMonth = () => {
        setViewDate(prev => {
            if (prev.month === 0) return { year: prev.year - 1, month: 11 };
            return { ...prev, month: prev.month - 1 };
        });
    };

    const nextMonth = () => {
        setViewDate(prev => {
            if (prev.month === 11) return { year: prev.year + 1, month: 0 };
            return { ...prev, month: prev.month + 1 };
        });
    };

    const handleDayClick = (day: number) => {
        const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onSelectDate(dateStr);
        onClose();
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            {/* Click Outside to Close */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Calendar Card */}
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-4 w-full max-w-sm animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} className="text-slate-600" />
                    </button>
                    <h3 className="text-lg font-bold text-slate-900">
                        {monthNames[viewDate.month]} {viewDate.year}
                    </h3>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* Day Names Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before first of month */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isSelected = dateStr === selectedDate;
                        const isToday = dateStr === today;

                        return (
                            <button
                                key={day}
                                onClick={() => handleDayClick(day)}
                                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${isSelected
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : isToday
                                        ? 'bg-blue-100 text-blue-700 font-bold'
                                        : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button
                        onClick={() => { onSelectDate(today); onClose(); }}
                        className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Hari Ini
                    </button>
                    <button
                        onClick={onClose}
                        className="py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

// Type Badge Component
function TypeBadge({ type }: { type: TimelineType }) {
    const config = {
        VISIT: {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            label: 'VISIT',
            icon: MapPin,
        },
        PAYMENT: {
            bg: 'bg-amber-100',
            text: 'text-amber-700',
            label: 'PAYMENT',
            icon: Wallet,
        },
    };

    const { bg, text, label, icon: Icon } = config[type];

    return (
        <span className={`${bg} ${text} text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide inline-flex items-center gap-1`}>
            <Icon size={10} />
            {label}
        </span>
    );
}

// Status Component
function StatusIndicator({ status, reason }: { status: ValidationStatus; reason?: string }) {
    if (status === 'Approved') {
        return (
            <div className="flex items-center gap-1.5 text-emerald-600 border-t border-slate-50 pt-3 mt-1">
                <ShieldCheck size={18} className="fill-emerald-100" />
                <span className="text-xs font-bold">Verified by Admin</span>
            </div>
        );
    }

    if (status === 'Pending') {
        return (
            <div className="flex items-center gap-1.5 text-amber-600 border-t border-slate-50 pt-3 mt-1">
                <Clock size={18} />
                <span className="text-xs font-bold">Pending Review</span>
            </div>
        );
    }

    return (
        <div className="border-t border-slate-50 pt-3 mt-1">
            <div className="flex items-center gap-1.5 text-red-600 mb-1">
                <XCircle size={18} />
                <span className="text-xs font-bold">Rejected</span>
            </div>
            {reason && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-2.5 py-1.5 mt-1.5 font-medium">
                    ⚠️ Alasan: {reason}
                </p>
            )}
        </div>
    );
}

// Timeline Item Component
function TimelineItemCard({ item, isLast }: { item: TimelineItem; isLast: boolean }) {
    const dotColor = {
        Approved: 'bg-emerald-500',
        Pending: 'bg-amber-400',
        Rejected: 'bg-red-500',
    }[item.status];

    const borderColor = item.type === 'PAYMENT' ? 'border-l-amber-500' : 'border-l-blue-500';
    const isRejected = item.status === 'Rejected';

    return (
        <div className="flex gap-4 mb-2 relative group">
            {/* Time Column */}
            <div className="flex flex-col items-end w-14 shrink-0 pt-1">
                <span className="text-sm font-bold text-slate-800">{item.time}</span>
            </div>

            {/* Timeline Line & Dot */}
            <div className="relative flex flex-col items-center w-6 shrink-0">
                <div className={`w-3 h-3 rounded-full ${dotColor} border-2 border-white z-10 mt-1.5 shadow-sm`}></div>
                {!isLast && (
                    <div className="absolute top-6 bottom-0 left-1/2 w-0.5 bg-slate-200 -translate-x-1/2" style={{ borderStyle: 'dashed' }}></div>
                )}
            </div>

            {/* Content Card */}
            <div className="flex-1 pb-6">
                <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-4 relative overflow-hidden border-l-4 ${borderColor} ${isRejected ? 'bg-red-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-[#0F172A] text-base">{item.debtorName}</h3>
                        <TypeBadge type={item.type} />
                    </div>
                    <div className="text-slate-600 text-sm mb-3">
                        {item.type === 'PAYMENT' ? (
                            <div className="space-y-1">
                                <p className="font-bold text-lg text-emerald-700">{formatRupiah(item.amount || 0)}</p>
                                <p className="text-xs text-slate-500">Metode: {item.method || 'Cash'}</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p className="font-semibold text-slate-800">Hasil: {item.result || item.detail}</p>
                            </div>
                        )}
                    </div>
                    <StatusIndicator status={item.status} reason={item.rejectReason} />
                </div>
            </div>
        </div>
    );
}

export default function MobileHistoryPage() {
    const { fieldReports, paymentReports } = useValidation();
    const { assets } = useAssets();
    const { user } = useAuth();

    // Selected date state (default: today)
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);

    // Calendar modal state
    const [showCalendar, setShowCalendar] = useState(false);

    // Active filter state
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    // Helper: Get asset name by ID
    const getAssetName = (assetId: string): string => {
        const asset = assets.find(a => a.id === assetId);
        return asset?.debtorName || 'Unknown Debtor';
    };

    // Helper: Extract time from submission date
    const extractTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    // Level 1: Filter and combine reports from my activities by DATE
    const allTimelineItems = useMemo<TimelineItem[]>(() => {
        const myReports: TimelineItem[] = [];

        fieldReports.forEach(report => {
            if (report.collectorId !== user?.id) return;
            if (!report.submissionDate) return;
            const dateObj = new Date(report.submissionDate);
            if (isNaN(dateObj.getTime())) return;
            const reportDate = dateObj.toISOString().split('T')[0];
            if (reportDate !== selectedDate) return;

            myReports.push({
                id: report.id,
                type: 'VISIT',
                time: extractTime(report.submissionDate),
                timestamp: dateObj.getTime(),
                debtorName: report.debtorName || getAssetName(report.loanId),
                detail: report.problemDescription || 'Kunjungan Lapangan',
                result: report.collateralStatus,
                status: report.status,
                rejectReason: report.rejectionReason,
                assetId: report.loanId,
            });
        });

        paymentReports.forEach(report => {
            if (report.collectorId !== user?.id) return;
            if (!report.timestamp) return;
            const dateObj = new Date(report.timestamp);
            if (isNaN(dateObj.getTime())) return;
            const reportDate = dateObj.toISOString().split('T')[0];
            if (reportDate !== selectedDate) return;

            const statusMap: Record<string, ValidationStatus> = {
                'PENDING': 'Pending',
                'MATCHED': 'Approved',
                'REJECTED': 'Rejected',
            };

            myReports.push({
                id: report.id,
                type: 'PAYMENT',
                time: extractTime(report.timestamp),
                timestamp: dateObj.getTime(),
                debtorName: report.debtorName || getAssetName(report.loanId),
                detail: 'Pembayaran',
                amount: report.paidAmount,
                method: report.paymentMethod,
                status: statusMap[report.status] || 'Pending',
                rejectReason: report.rejectionReason,
                assetId: report.loanId,
            });
        });

        return myReports.sort((a, b) => b.timestamp - a.timestamp);
    }, [fieldReports, paymentReports, assets, user, selectedDate]);

    // Level 2: Apply activeFilter
    const filteredTimelineItems = useMemo(() => {
        if (activeFilter === 'all') return allTimelineItems;

        return allTimelineItems.filter(item => {
            switch (activeFilter) {
                case 'approved': return item.status === 'Approved';
                case 'rejected': return item.status === 'Rejected';
                case 'visit': return item.type === 'VISIT';
                case 'payment': return item.type === 'PAYMENT';
                default: return true;
            }
        });
    }, [allTimelineItems, activeFilter]);

    // Summary stats
    const summaryStats = useMemo(() => ({
        totalVisits: allTimelineItems.length,
        verified: allTimelineItems.filter(i => i.status === 'Approved').length,
        pending: allTimelineItems.filter(i => i.status === 'Pending').length,
    }), [allTimelineItems]);

    // Format selected date for display
    const formatDisplayDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const todayDate = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (dateStr === todayDate) return 'Hari Ini';
        if (dateStr === yesterdayDate) return 'Kemarin';
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getEmptyMessage = (): string => {
        if (activeFilter === 'all') return 'Belum ada kunjungan atau pembayaran pada tanggal ini';
        const filterLabel = filterChips.find(f => f.id === activeFilter)?.label || '';
        return `Tidak ada data "${filterLabel}" pada tanggal ini`;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-28">
            {/* Header */}
            <header className="bg-[#0F172A] pt-14 pb-12 px-5 sticky top-0 z-20 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex flex-col">
                        <p className="text-blue-200 text-xs font-medium tracking-wide mb-0.5 uppercase">Activity Log</p>
                        <h2 className="text-white text-2xl font-bold tracking-tight">Riwayat Aktivitas</h2>
                        <p className="text-blue-300 text-sm mt-1">{formatDisplayDate(selectedDate)}</p>
                    </div>
                    <button
                        onClick={() => setShowCalendar(true)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm transition-all border border-white/5 text-white cursor-pointer"
                    >
                        <Calendar size={20} />
                    </button>
                </div>
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 bottom-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl"></div>
                </div>
            </header>

            {/* Summary Stats Card */}
            <div className="px-5 -mt-8 mb-4 relative z-30">
                <div className="bg-white rounded-2xl shadow-lg p-5 flex justify-between items-center border border-slate-100">
                    <div className="flex flex-1 flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Footprints size={16} />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
                        </div>
                        <p className="text-[#0F172A] text-xl font-bold">{summaryStats.totalVisits}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-100"></div>
                    <div className="flex flex-1 flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-600">
                            <CheckCircle2 size={16} className="fill-emerald-100" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Verified</span>
                        </div>
                        <p className="text-[#0F172A] text-xl font-bold">{summaryStats.verified}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-100"></div>
                    <div className="flex flex-1 flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1.5 text-amber-500">
                            <Clock size={16} />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
                        </div>
                        <p className="text-[#0F172A] text-xl font-bold">{summaryStats.pending}</p>
                    </div>
                </div>
            </div>

            {/* Filter Chips */}
            <div className="px-5 mb-6 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex gap-2 items-center pb-1 whitespace-nowrap">
                    {filterChips.map((chip) => (
                        <button
                            key={chip.id}
                            onClick={() => setActiveFilter(chip.id)}
                            className={`flex shrink-0 items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${activeFilter === chip.id
                                ? 'bg-slate-800 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {chip.emoji && <span>{chip.emoji}</span>}
                            {chip.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline Content */}
            <main className="px-5 flex flex-col">
                {filteredTimelineItems.length > 0 ? (
                    filteredTimelineItems.map((item, index) => (
                        <TimelineItemCard
                            key={item.id}
                            item={item}
                            isLast={index === filteredTimelineItems.length - 1}
                        />
                    ))
                ) : (
                    <div className="text-center py-16">
                        <FileText size={64} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-semibold mb-1">Tidak Ada Aktivitas</p>
                        <p className="text-slate-400 text-sm mb-4">{getEmptyMessage()}</p>
                        <div className="flex gap-2 justify-center flex-wrap">
                            {activeFilter !== 'all' && (
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 inline-flex items-center gap-2"
                                >
                                    <Filter size={16} />
                                    Reset Filter
                                </button>
                            )}
                            <button
                                onClick={() => setShowCalendar(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 inline-flex items-center gap-2"
                            >
                                <Calendar size={16} />
                                Pilih Tanggal Lain
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Calendar Modal - Centered Overlay */}
            {showCalendar && (
                <CalendarModal
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    onClose={() => setShowCalendar(false)}
                />
            )}
        </div>
    );
}

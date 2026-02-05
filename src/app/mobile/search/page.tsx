'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Car, MapPin, Building, Bell, Home, History, User } from 'lucide-react';
import { useAssets, Asset } from '@/context/AssetContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Format Rupiah
const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

// Check if promise date is today
const isPromiseToday = (promiseDate?: string) => {
    if (!promiseDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return promiseDate === today;
};

// Status Badge Component
function StatusBadge({ spkStatus }: { spkStatus: 'AKTIF' | 'PASIF' }) {
    const config: Record<string, { bg: string; text: string; border: string; label: string }> = {
        'AKTIF': {
            bg: 'bg-red-50',
            text: 'text-red-600',
            border: 'border-red-100',
            label: 'MACET',
        },
        'PASIF': {
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            border: 'border-emerald-100',
            label: 'LANCAR',
        },
    };

    const { bg, text, border, label } = config[spkStatus];

    return (
        <span className={`px-2.5 py-1 rounded-md ${bg} ${text} text-[10px] font-bold uppercase tracking-wide border ${border}`}>
            {label}
        </span>
    );
}

// Result Card Component
function ResultCard({ asset, onClick }: { asset: Asset; onClick: () => void }) {

    return (
        <article
            onClick={onClick}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 active:scale-[0.99] transition-transform cursor-pointer hover:shadow-md"
        >
            {/* Top Row: Name & Status */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-[#0F172A]">{asset.debtorName}</h3>
                    <span className="text-xs text-slate-400 mt-0.5">{asset.loanId}</span>
                </div>
                <StatusBadge spkStatus={asset.spkStatus} />
            </div>

            {/* Middle Row: Credit Type */}
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-slate-100 rounded px-2 py-1 flex items-center gap-1.5">
                    <Building size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">
                        {asset.creditType || 'Asset'}
                    </span>
                </div>
            </div>

            {/* Arrears Info */}
            <div className="flex items-center justify-between mb-3 bg-red-50 rounded-lg px-3 py-2">
                <span className="text-xs text-red-600 font-medium">Total Tunggakan</span>
                <span className="text-sm font-bold text-red-700">{formatRupiah(asset.totalArrears)}</span>
            </div>

            {/* Bottom Row: Address */}
            <div className="flex items-start gap-2 pt-3 border-t border-slate-100">
                <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-slate-600 text-sm leading-snug line-clamp-2">
                    {asset.collateralAddress || asset.identityAddress || '-'}
                </p>
            </div>
        </article>
    );
}

export default function MobileSearchPage() {
    const router = useRouter();
    const { assets } = useAssets();
    const { user } = useAuth();
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Auto-focus search input on mount
    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    // Security: Filter assets by collector ID (only show MY assets)
    const myAssets = useMemo(() => {
        if (!user) return [];
        return assets.filter(asset => asset.collectorId === user.id);
    }, [assets, user]);

    // Real-time search filtering
    const searchedAssets = useMemo(() => {
        if (!searchQuery.trim()) return myAssets;

        const query = searchQuery.toLowerCase();
        return myAssets.filter(asset => {
            return (
                asset.debtorName.toLowerCase().includes(query) ||
                asset.loanId.toLowerCase().includes(query) ||
                asset.collateralAddress.toLowerCase().includes(query) ||
                asset.identityAddress.toLowerCase().includes(query) ||
                asset.creditType.toLowerCase().includes(query)
            );
        });
    }, [myAssets, searchQuery]);

    // Apply quick filter
    const filteredAssets = useMemo(() => {
        if (activeFilter === 'all') return searchedAssets;

        return searchedAssets.filter(asset => {
            switch (activeFilter) {
                case 'macet':
                    return asset.spkStatus === 'AKTIF' && asset.totalArrears > 5000000; // Heavy delinquent
                case 'janji_bayar':
                    return asset.spkStatus === 'AKTIF' && asset.totalArrears > 1000000; // Has arrears
                case 'lancar':
                    return asset.spkStatus === 'PASIF';
                default:
                    return true;
            }
        });
    }, [searchedAssets, activeFilter]);

    // Smart routing: high arrears -> collect, else -> task
    const handleCardClick = (asset: Asset) => {
        if (asset.totalArrears > 1000000) {
            router.push(`/mobile/collect/${asset.id}`);
        } else {
            router.push(`/mobile/task/${asset.id}`);
        }
    };

    // Filter chips
    const filterChips = [
        { id: 'all', label: 'Semua' },
        { id: 'macet', label: 'Macet Berat' },
        { id: 'janji_bayar', label: 'Janji Bayar' },
        { id: 'lancar', label: 'Lancar' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-28">
            {/* Header */}
            <header className="bg-[#0F172A] pt-14 pb-12 px-5 sticky top-0 z-20 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex flex-col">
                        <p className="text-blue-200 text-xs font-medium tracking-wide mb-0.5">FIELD COLLECTOR PRO</p>
                        <h2 className="text-white text-2xl font-bold tracking-tight">Pencarian Aset</h2>
                    </div>
                    <Link href="/mobile/notifications" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm transition-all border border-white/5 text-white relative">
                        <Bell size={20} />
                        {/* Notification badge - shows when there are unread notifications */}
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0F172A]"></span>
                    </Link>
                </div>
                {/* Decorative Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 bottom-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl"></div>
                </div>
            </header>

            {/* Floating Search Bar */}
            <div className="px-5 -mt-7 mb-4 relative z-10">
                <div className="flex gap-3 items-center">
                    {/* Search Input */}
                    <div className="flex-1 bg-white rounded-xl shadow-lg h-14 flex items-center px-4 border border-slate-100">
                        <Search size={20} className="text-slate-400 mr-3 shrink-0" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari Nama, No. Kontrak, atau Alamat..."
                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-slate-700 placeholder-slate-400 text-sm font-medium h-full"
                        />
                    </div>
                    {/* Filter Button */}
                    <button className="w-14 h-14 bg-[#2563EB] rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center text-white shrink-0 active:scale-95 transition-transform">
                        <SlidersHorizontal size={22} />
                    </button>
                </div>
            </div>

            {/* Quick Filter Chips */}
            <div
                className="px-5 mb-6 overflow-x-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <div className="flex gap-3 items-center pb-1">
                    {filterChips.map((chip) => (
                        <button
                            key={chip.id}
                            onClick={() => setActiveFilter(chip.id)}
                            className={`flex shrink-0 items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold active:scale-95 transition-transform ${activeFilter === chip.id
                                ? 'bg-[#2563EB] text-white border border-[#2563EB] shadow-md shadow-blue-500/20'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results List */}
            <main className="px-5 flex flex-col gap-4">
                {/* Empty State - No Search Query */}
                {!searchQuery.trim() && filteredAssets.length === 0 && activeFilter === 'all' && (
                    <div className="text-center py-16">
                        <Search size={64} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-semibold mb-1">Ketik kata kunci untuk mencari</p>
                        <p className="text-slate-400 text-sm">di portfolio Anda</p>
                        <div className="mt-6 text-xs text-slate-400">
                            <p>Total Aset Anda: <span className="font-bold text-slate-600">{myAssets.length}</span></p>
                        </div>
                    </div>
                )}

                {/* Empty State - No Results Found */}
                {(searchQuery.trim() || activeFilter !== 'all') && filteredAssets.length === 0 && (
                    <div className="text-center py-16">
                        <Search size={64} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-semibold mb-1">Data tidak ditemukan</p>
                        <p className="text-slate-400 text-sm">di daftar tugas Anda</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                        >
                            Reset Pencarian
                        </button>
                    </div>
                )}

                {/* Results */}
                {filteredAssets.length > 0 && (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-slate-500">
                                Ditemukan <span className="font-bold text-slate-700">{filteredAssets.length}</span> hasil
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="text-xs text-blue-600 font-semibold"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        {filteredAssets.map((asset) => (
                            <ResultCard key={asset.id} asset={asset} onClick={() => handleCardClick(asset)} />
                        ))}
                    </>
                )}
            </main>
        </div>
    );
}

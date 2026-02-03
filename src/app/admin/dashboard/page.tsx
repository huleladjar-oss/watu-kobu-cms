'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Users, Wallet, CheckCircle2, Landmark, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import { useAssets, Asset } from '@/context/AssetContext';

// Format Rupiah
function formatRupiah(amount: number, compact: boolean = false): string {
    if (compact) {
        if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)} M`;
        if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(0)} Jt`;
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// Summary Card Component
interface SummaryCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    borderColor: string;
    iconBgColor: string;
}

function SummaryCard({ title, value, subtitle, icon, borderColor, iconBgColor }: SummaryCardProps) {
    return (
        <div className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 ${borderColor}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 ${iconBgColor} rounded-xl`}>{icon}</div>
                <TrendingUp size={16} className="text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
    );
}

// SPK Status Badge
function SPKStatusBadge({ status }: { status: Asset['spkStatus'] }) {
    const styles = status === 'AKTIF'
        ? 'bg-green-100 text-green-700 border-green-200'
        : 'bg-slate-100 text-slate-600 border-slate-200';
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles}`}>{status}</span>
    );
}

// Top Arrears Table Row
function TopArrearsRow({ asset, rank }: { asset: Asset; rank: number }) {
    return (
        <tr className="hover:bg-slate-50 transition-colors">
            <td className="px-4 py-4 whitespace-nowrap">
                <span className={`w-7 h-7 inline-flex items-center justify-center rounded-full text-xs font-bold ${rank <= 3 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{rank}</span>
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-sm font-mono text-slate-600">{asset.loanId}</span>
            </td>
            <td className="px-4 py-4">
                <p className="text-sm font-semibold text-slate-900">{asset.debtorName}</p>
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
                <span className="text-sm text-slate-600">{asset.branch || '-'}</span>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-center">
                <SPKStatusBadge status={asset.spkStatus} />
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-right">
                <span className="text-sm font-bold text-red-600">{formatRupiah(asset.totalArrears)}</span>
            </td>
        </tr>
    );
}

export default function AdminDashboardPage() {
    const { assets, getUnassignedAssets } = useAssets();

    // Calculate KPIs from real data
    const kpis = useMemo(() => {
        const totalDebitur = assets.length;
        const totalTunggakan = assets.reduce((sum, a) => sum + a.totalArrears, 0);
        const totalPrincipal = assets.reduce((sum, a) => sum + a.principalBalance, 0);
        const spkAktif = assets.filter((a) => a.spkStatus === 'AKTIF').length;
        const spkPasif = assets.filter((a) => a.spkStatus === 'PASIF').length;
        const unassigned = getUnassignedAssets().length;

        return { totalDebitur, totalTunggakan, totalPrincipal, spkAktif, spkPasif, unassigned };
    }, [assets, getUnassignedAssets]);

    // Get Top 5 Highest Arrears (sorted descending)
    const topArrears = useMemo(() => {
        return [...assets].sort((a, b) => b.totalArrears - a.totalArrears).slice(0, 5);
    }, [assets]);

    // Calculate Portfolio Composition by Credit Type
    const portfolioComposition = useMemo(() => {
        // Group by credit type and calculate total exposure (total arrears)
        const typeMap = new Map<string, number>();
        assets.forEach((asset) => {
            const type = asset.creditType || 'Unknown';
            const current = typeMap.get(type) || 0;
            typeMap.set(type, current + asset.totalArrears);
        });

        // Convert to array and sort by exposure (descending)
        const sorted = Array.from(typeMap.entries())
            .map(([type, exposure]) => ({ type, exposure }))
            .sort((a, b) => b.exposure - a.exposure);

        // Get top 5, group rest as "Others"
        const top5 = sorted.slice(0, 5);
        const others = sorted.slice(5);
        const othersTotal = others.reduce((sum, item) => sum + item.exposure, 0);

        const items = [...top5];
        if (othersTotal > 0) {
            items.push({ type: 'Others', exposure: othersTotal });
        }

        // Calculate total and percentages
        const totalExposure = items.reduce((sum, item) => sum + item.exposure, 0);
        const itemsWithPercentage = items.map((item) => ({
            ...item,
            percentage: totalExposure > 0 ? (item.exposure / totalExposure) * 100 : 0,
        }));

        return itemsWithPercentage;
    }, [assets]);

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-8 text-slate-900">
            {/* Header & Breadcrumbs */}
            <div className="flex flex-col gap-2">
                <nav className="flex items-center text-sm font-medium text-slate-500">
                    <Link href="/admin" className="hover:text-slate-700">Home</Link>
                    <span className="mx-2 text-slate-400">/</span>
                    <span className="text-slate-900 font-semibold">Admin Dashboard</span>
                </nav>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Collection Overview</h2>
                    {kpis.unassigned > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                            <AlertCircle size={18} className="text-orange-600" />
                            <span className="text-sm font-medium text-orange-700">{kpis.unassigned} aset belum di-assign</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards - Real-time KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="Total Debitur"
                    value={kpis.totalDebitur}
                    subtitle="Jumlah kasus aktif"
                    icon={<Users size={24} className="text-blue-600" />}
                    borderColor="border-l-4 border-l-blue-500"
                    iconBgColor="bg-blue-50"
                />
                <SummaryCard
                    title="Potensi Tagihan (Tunggakan)"
                    value={formatRupiah(kpis.totalTunggakan, true)}
                    subtitle="Target collection utama"
                    icon={<Wallet size={24} className="text-red-600" />}
                    borderColor="border-l-4 border-l-red-500"
                    iconBgColor="bg-red-50"
                />
                <SummaryCard
                    title="SPK Aktif (Fokus Utama)"
                    value={kpis.spkAktif}
                    subtitle={`${kpis.spkPasif} SPK Pasif`}
                    icon={<CheckCircle2 size={24} className="text-green-600" />}
                    borderColor="border-l-4 border-l-green-500"
                    iconBgColor="bg-green-50"
                />
                <SummaryCard
                    title="Total Outstanding Principal"
                    value={formatRupiah(kpis.totalPrincipal, true)}
                    subtitle="Saldo pokok keseluruhan"
                    icon={<Landmark size={24} className="text-purple-600" />}
                    borderColor="border-l-4 border-l-purple-500"
                    iconBgColor="bg-purple-50"
                />
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <p className="text-blue-100 text-xs font-medium uppercase mb-1">Total Debitur</p>
                    <p className="text-3xl font-bold">{kpis.totalDebitur}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <p className="text-green-100 text-xs font-medium uppercase mb-1">SPK Aktif</p>
                    <p className="text-3xl font-bold">{kpis.spkAktif}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl p-4 text-white">
                    <p className="text-slate-200 text-xs font-medium uppercase mb-1">SPK Pasif</p>
                    <p className="text-3xl font-bold">{kpis.spkPasif}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                    <p className="text-orange-100 text-xs font-medium uppercase mb-1">Unassigned</p>
                    <p className="text-3xl font-bold">{kpis.unassigned}</p>
                </div>
            </div>

            {/* Two Column Layout: Top Priority Table + Portfolio Composition */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 Prioritas Penagihan Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Top 5 Prioritas Penagihan</h3>
                            <p className="text-sm text-slate-500">Tunggakan tertinggi — fokus collection</p>
                        </div>
                        <Link href="/admin/registry" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            Lihat Semua <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-14">#</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">No. Rekening</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nama Debitur</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Cabang</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Status SPK</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Total Tunggakan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {topArrears.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Tidak ada data</td></tr>
                                ) : (
                                    topArrears.map((asset, index) => <TopArrearsRow key={asset.id} asset={asset} rank={index + 1} />)
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Portfolio Composition by Credit Type */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900">Risk Distribution (Jenis Kredit)</h3>
                        <p className="text-sm text-slate-500">Komposisi portfolio berdasarkan exposure tunggakan</p>
                    </div>
                    <div className="p-6 space-y-5">
                        {portfolioComposition.length === 0 ? (
                            <p className="text-center text-slate-400 py-8">Belum ada data portfolio</p>
                        ) : (
                            portfolioComposition.map((item, index) => {
                                const colors = [
                                    'bg-gradient-to-r from-blue-500 to-blue-600',
                                    'bg-gradient-to-r from-purple-500 to-purple-600',
                                    'bg-gradient-to-r from-indigo-500 to-indigo-600',
                                    'bg-gradient-to-r from-cyan-500 to-cyan-600',
                                    'bg-gradient-to-r from-teal-500 to-teal-600',
                                    'bg-gradient-to-r from-slate-400 to-slate-500',
                                ];
                                const barColor = colors[index] || colors[colors.length - 1];

                                return (
                                    <div key={item.type} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-900">{item.type}</span>
                                            <span className="text-sm font-bold text-blue-600">{item.percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                            <div className={`${barColor} h-3 rounded-full transition-all duration-500`} style={{ width: `${item.percentage}%` }}></div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400">Exposure</span>
                                            <span className="text-xs font-semibold text-slate-600">{formatRupiah(item.exposure, true)}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Rincian Tunggakan</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm text-slate-600">Total Tunggakan</span>
                            <span className="text-lg font-bold text-red-600">{formatRupiah(kpis.totalTunggakan)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm text-slate-600">Saldo Pokok (Principal)</span>
                            <span className="text-lg font-bold text-slate-900">{formatRupiah(kpis.totalPrincipal)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-slate-600">Rata-rata per Debitur</span>
                            <span className="text-lg font-bold text-blue-600">
                                {kpis.totalDebitur > 0 ? formatRupiah(kpis.totalTunggakan / kpis.totalDebitur) : 'Rp 0'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Status Distribusi</h4>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600">SPK Aktif</span>
                                <span className="font-semibold text-green-600">{kpis.totalDebitur > 0 ? ((kpis.spkAktif / kpis.totalDebitur) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${kpis.totalDebitur > 0 ? (kpis.spkAktif / kpis.totalDebitur) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600">SPK Pasif</span>
                                <span className="font-semibold text-slate-600">{kpis.totalDebitur > 0 ? ((kpis.spkPasif / kpis.totalDebitur) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-slate-400 h-2.5 rounded-full" style={{ width: `${kpis.totalDebitur > 0 ? (kpis.spkPasif / kpis.totalDebitur) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600">Sudah Assigned</span>
                                <span className="font-semibold text-blue-600">{kpis.totalDebitur > 0 ? (((kpis.totalDebitur - kpis.unassigned) / kpis.totalDebitur) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${kpis.totalDebitur > 0 ? ((kpis.totalDebitur - kpis.unassigned) / kpis.totalDebitur) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssets } from '@/context/AssetContext';
import { ArrowLeft, FileText, Phone, MapPin, AlertCircle, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Format Rupiah
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// Format Date
function formatDate(dateString: string): string {
    if (!dateString || dateString === '-' || dateString === '0') return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export default function MobileTaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { assets } = useAssets();

    const taskId = params.id as string;

    // Find the task
    const task = useMemo(() => {
        return assets.find((a) => a.id === taskId);
    }, [assets, taskId]);

    // Calculate financials
    const financials = useMemo(() => {
        if (!task) return null;

        const totalArrears = task.totalArrears; // Sum of all arrears
        const estimatedSettlement = task.outstandingPrincipal + task.arrearsInterest + task.arrearsPenalty;

        return {
            totalArrears,
            estimatedSettlement,
        };
    }, [task]);

    const handlePrintPDF = () => {
        // Open print template in new window
        window.open(`/mobile/task/${taskId}/print`, '_blank');
    };

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Tugas tidak ditemukan</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    const hasCollateral = task.collateralAddress && task.collateralAddress !== '-' && task.collateralAddress !== '0';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Container */}
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm pb-24">
                {/* Header (Navy Corporate) */}
                <div className="bg-slate-900 text-white px-6 py-4 sticky top-0 z-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-lg font-semibold">Detail Debitur</h1>
                        </div>
                        <button
                            onClick={handlePrintPDF}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Cetak PDF"
                        >
                            <FileText size={20} />
                        </button>
                    </div>
                </div>

                {/* Content (Scrollable) */}
                <div className="px-6 py-6 pb-32 space-y-4">

                    {/* CARD A: Status & Identity */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                    {task.debtorName}
                                </h2>
                                <p className="text-sm font-mono text-gray-500 tracking-wide">
                                    {task.loanId}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${task.spkStatus === 'AKTIF'
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                {task.spkStatus}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Jenis Kredit</p>
                                <p className="font-semibold text-gray-900">{task.loanType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Cabang</p>
                                <p className="font-semibold text-gray-900">{task.branch}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Kantor Wilayah</p>
                                <p className="font-semibold text-gray-900">{task.region}</p>
                            </div>
                        </div>
                    </div>

                    {/* CARD B: Financials (Highlight Red) */}
                    <div className="bg-white border-2 border-red-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-red-600 rounded-full" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Kewajiban Pembayaran</h3>
                        </div>

                        {/* Loan Details */}
                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Plafond Awal</p>
                                <p className="font-semibold text-gray-900">{formatRupiah(task.initialPlafond)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Saldo Pokok</p>
                                <p className="font-semibold text-blue-700">{formatRupiah(task.outstandingPrincipal)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Tgl Realisasi</p>
                                <p className="font-medium text-gray-700">{formatDate(task.disbursementDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Tgl Jatuh Tempo</p>
                                <p className="font-medium text-gray-700">{formatDate(task.dueDate)}</p>
                            </div>
                        </div>

                        {/* Arrears Breakdown */}
                        <div className="bg-red-50 rounded-lg p-4 mb-3">
                            <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-3">Rincian Tunggakan</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tunggakan Pokok</span>
                                    <span className="font-semibold text-gray-900">{formatRupiah(task.arrearsPrincipal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tunggakan Bunga</span>
                                    <span className="font-semibold text-gray-900">{formatRupiah(task.arrearsInterest)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tunggakan Denda</span>
                                    <span className="font-semibold text-gray-900">{formatRupiah(task.arrearsPenalty)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Total Arrears */}
                        <div className="border-t-2 border-red-300 pt-3 mb-3">
                            <div className="flex justify-between items-end">
                                <p className="text-sm font-bold text-red-600 uppercase">Total Tunggakan</p>
                                <p className="text-3xl font-bold text-red-600">{formatRupiah(financials?.totalArrears || 0)}</p>
                            </div>
                        </div>

                        {/* Estimated Settlement */}
                        <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                                <p className="text-xs font-semibold text-blue-700 uppercase">Estimasi Pelunasan</p>
                                <p className="text-lg font-bold text-blue-700">{formatRupiah(financials?.estimatedSettlement || 0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* CARD C: Location & Contact */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin size={18} className="text-blue-600" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Lokasi & Kontak</h3>
                        </div>

                        {/* Collateral Address */}
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">Alamat Agunan</p>
                            {hasCollateral ? (
                                <p className="text-sm text-gray-700 leading-relaxed">{task.collateralAddress}</p>
                            ) : (
                                <p className="text-sm text-red-600 italic font-medium">⚠️ Kredit Tanpa Agunan</p>
                            )}
                        </div>

                        {/* KTP Address */}
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">Alamat KTP</p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {task.idCardAddress || '-'}
                            </p>
                        </div>

                        {/* Office Address */}
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">Alamat Kantor</p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {task.officeAddress || '-'}
                            </p>
                        </div>

                        {/* Phone Numbers */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-2 font-semibold">Telp Pribadi</p>
                                {task.personalPhone && task.personalPhone !== '-' ? (
                                    <a
                                        href={`tel:${task.personalPhone}`}
                                        className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline"
                                    >
                                        <Phone size={14} />
                                        {task.personalPhone}
                                    </a>
                                ) : (
                                    <p className="text-sm text-gray-400">-</p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-2 font-semibold">Telp Kantor</p>
                                {task.officePhone && task.officePhone !== '-' ? (
                                    <a
                                        href={`tel:${task.officePhone}`}
                                        className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline"
                                    >
                                        <Phone size={14} />
                                        {task.officePhone}
                                    </a>
                                ) : (
                                    <p className="text-sm text-gray-400">-</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CARD D: Emergency Contact */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle size={18} className="text-amber-600" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Kontak Darurat</h3>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Nama</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {task.emergencyContactName || '-'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Hubungan</p>
                                    <p className="text-sm text-gray-700">
                                        {task.emergencyContactRelation || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Telepon</p>
                                    {task.emergencyContactPhone && task.emergencyContactPhone !== '-' ? (
                                        <a
                                            href={`tel:${task.emergencyContactPhone}`}
                                            className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline"
                                        >
                                            <Phone size={14} />
                                            {task.emergencyContactPhone}
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-400">-</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 mb-1">Alamat</p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {task.emergencyContactAddress || '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FIXED BOTTOM ACTION BAR - Z-INDEX 999 TO OVERLAY BOTTOM NAV */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-[999]">
                    <div className="max-w-md mx-auto flex gap-3">
                        {/* Home Button (Secondary) */}
                        <Link href="/mobile" className="flex-none">
                            <button className="h-12 w-12 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                                <Home size={24} strokeWidth={2} />
                            </button>
                        </Link>

                        {/* Primary Button: ISI LAPORAN (Full Width) */}
                        <Link href={`/mobile/report/${taskId}`} className="flex-1">
                            <button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all active:scale-95">
                                <span>ISI LAPORAN KUNJUNGAN</span>
                                <ChevronRight size={20} strokeWidth={2.5} />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

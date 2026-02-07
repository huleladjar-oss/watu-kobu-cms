'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAssets } from '@/context/AssetContext';

// Format Rupiah
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// Format Date
function formatDate(dateString: string): string {
    if (!dateString || dateString === '-' || dateString === '0') return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

export default function MobileTaskPrintPage() {
    const params = useParams();
    const { assets } = useAssets();

    const taskId = params.id as string;

    // Find the task
    const task = useMemo(() => {
        return assets.find((a) => a.id === taskId);
    }, [assets, taskId]);

    // Calculate financials
    const financials = useMemo(() => {
        if (!task) return null;

        const totalArrears = task.totalArrears;
        const estimatedSettlement = task.principalBalance + task.interestArrears + task.penaltyArrears;

        return {
            totalArrears,
            estimatedSettlement,
        };
    }, [task]);

    // Auto-trigger print dialog
    useEffect(() => {
        if (task) {
            // Small delay to ensure content is rendered
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [task]);

    if (!task) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-600">Data tidak ditemukan</p>
            </div>
        );
    }

    const hasCollateral = task.collateralAddress && task.collateralAddress !== '-' && task.collateralAddress !== '0';
    const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <>
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="max-w-4xl mx-auto p-8 bg-white">
                {/* Header */}
                <div className="border-b-4 border-slate-900 pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">INFORMASI DEBITUR</h1>
                    <p className="text-sm text-gray-600">PT. WATU KOBU MULTINIAGA</p>
                    <p className="text-xs text-gray-500">Dicetak: {today}</p>
                </div>

                {/* Section 1: Identity & Status */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-blue-600 pl-3">
                        IDENTITAS & STATUS
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Nama Debitur</p>
                            <p className="font-bold text-gray-900">{task.debtorName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Nomor Pinjaman</p>
                            <p className="font-mono text-gray-900">{task.loanId}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status SPK</p>
                            <p className="font-semibold text-gray-900">{task.spkStatus}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Jenis Kredit</p>
                            <p className="text-gray-900">{task.creditType}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Cabang</p>
                            <p className="text-gray-900">{task.branch}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Kantor Wilayah</p>
                            <p className="text-gray-900">{task.region}</p>
                        </div>
                        {task.creditorName && (
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Nama Kreditur</p>
                                <p className="font-semibold text-gray-900">{task.creditorName}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 2: Financials */}
                <div className="mb-6 border-2 border-red-200 rounded-lg p-4 bg-red-50">
                    <h2 className="text-lg font-bold text-red-700 mb-3 border-l-4 border-red-600 pl-3">
                        KEWAJIBAN PEMBAYARAN
                    </h2>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Plafond Awal</p>
                            <p className="font-semibold text-gray-900">{formatRupiah(task.initialPlafond)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Saldo Pokok</p>
                            <p className="font-semibold text-blue-700">{formatRupiah(task.principalBalance)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Tanggal Realisasi</p>
                            <p className="text-gray-900">{formatDate(task.realizationDate)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Tanggal Jatuh Tempo</p>
                            <p className="text-gray-900">{formatDate(task.maturityDate)}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded p-3 mb-3">
                        <p className="text-xs font-bold text-red-600 uppercase mb-2">Rincian Tunggakan</p>
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-2 text-gray-700">Tunggakan Pokok</td>
                                    <td className="py-2 text-right font-semibold text-gray-900">{formatRupiah(task.principalArrears)}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-2 text-gray-700">Tunggakan Bunga</td>
                                    <td className="py-2 text-right font-semibold text-gray-900">{formatRupiah(task.interestArrears)}</td>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <td className="py-2 text-gray-700">Tunggakan Denda</td>
                                    <td className="py-2 text-right font-semibold text-gray-900">{formatRupiah(task.penaltyArrears)}</td>
                                </tr>
                                <tr className="border-t-2 border-red-300 font-bold">
                                    <td className="py-2 text-red-700 uppercase">Total Tunggakan</td>
                                    <td className="py-2 text-right text-red-700 text-lg">{formatRupiah(financials?.totalArrears || 0)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-blue-100 rounded p-3">
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-blue-700 uppercase">Estimasi Pelunasan</p>
                            <p className="text-lg font-bold text-blue-700">{formatRupiah(financials?.estimatedSettlement || 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Section 3: Location & Contact */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-green-600 pl-3">
                        LOKASI & KONTAK
                    </h2>

                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Alamat Agunan</p>
                            {hasCollateral ? (
                                <p className="text-gray-900 leading-relaxed">{task.collateralAddress}</p>
                            ) : (
                                <p className="text-red-600 font-semibold italic">⚠️ Kredit Tanpa Agunan</p>
                            )}
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Alamat KTP</p>
                            <p className="text-gray-900 leading-relaxed">{task.identityAddress || '-'}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Alamat Kantor</p>
                            <p className="text-gray-900 leading-relaxed">{task.officeAddress || '-'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Telepon Pribadi</p>
                                <p className="text-gray-900 font-mono">{task.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Telepon Kantor</p>
                                <p className="text-gray-900 font-mono">{task.officePhone || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Emergency Contact */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-3 border-l-4 border-amber-600 pl-3">
                        KONTAK DARURAT
                    </h2>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Nama</p>
                            <p className="text-gray-900 font-semibold">{task.emergencyName || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Hubungan</p>
                            <p className="text-gray-900">-</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Telepon</p>
                            <p className="text-gray-900 font-mono">{task.emergencyPhone || '-'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Alamat</p>
                            <p className="text-gray-900 leading-relaxed">{task.emergencyAddress || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-300 pt-4 mt-8 text-xs text-gray-500">
                    <p>Dokumen ini bersifat rahasia dan hanya untuk keperluan internal PT. Watu Kobu Multiniaga.</p>
                    <p className="mt-1">© 2026 PT. Watu Kobu Multiniaga - Collection Management System</p>
                </div>
            </div>
        </>
    );
}

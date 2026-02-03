'use client';

import Link from 'next/link';
import { CheckCircle2, Shield } from 'lucide-react';

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* Success Icon with Animation */}
                <div className="mb-6 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75" />
                        <div className="relative bg-green-100 rounded-full p-6">
                            <CheckCircle2 size={80} className="text-green-600" strokeWidth={2} />
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Data Pembayaran Terkirim!
                </h1>

                <p className="text-gray-600 leading-relaxed mb-8">
                    Laporan realisasi Anda sedang diverifikasi oleh <span className="font-semibold text-blue-600">Admin Finance</span>.
                </p>

                {/* Summary Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-5 mb-8 text-left shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                            <Shield size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900 mb-1">Verifikasi Bukti Transfer</p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Pastikan bukti transfer yang Anda upload valid agar proses verifikasi berjalan cepat.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
                    <p className="text-sm text-blue-800 font-semibold mb-2">📋 Status Validasi</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Data pembayaran masuk sistem ✓</li>
                        <li>• Menunggu verifikasi Admin Finance</li>
                        <li>• Estimasi proses: 1-2 jam kerja</li>
                    </ul>
                </div>

                {/* Action Button */}
                <Link href="/mobile" className="block mb-6">
                    <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all active:scale-95">
                        KEMBALI KE DASHBOARD
                    </button>
                </Link>

                {/* Footer Note */}
                <p className="text-xs text-gray-500">
                    Pantau status validasi melalui menu <span className="font-semibold text-gray-700">History</span>.
                </p>

                {/* Decorative Receipt Line */}
                <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
                    <p className="text-xs text-gray-400">
                        Terima kasih atas dedikasi Anda dalam penagihan 🎯
                    </p>
                </div>
            </div>
        </div>
    );
}

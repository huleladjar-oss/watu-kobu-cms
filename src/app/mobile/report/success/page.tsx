'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ReportSuccessPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
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
                    Laporan Terkirim!
                </h1>

                <p className="text-gray-600 leading-relaxed mb-8">
                    Data kunjungan Anda telah masuk ke antrian validasi Admin.
                    Status laporan dapat dipantau melalui menu <span className="font-semibold text-blue-600">Riwayat</span>.
                </p>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
                    <p className="text-sm text-blue-800 font-semibold mb-2">📋 Langkah Selanjutnya:</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Admin akan memvalidasi bukti kunjungan Anda</li>
                        <li>• Proses validasi memakan waktu 1-2 jam kerja</li>
                        <li>• Notifikasi akan dikirim setelah validasi selesai</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link href="/mobile" className="block">
                        <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all active:scale-95">
                            Kembali ke Beranda
                        </button>
                    </Link>

                    <Link href="/mobile/history" className="block">
                        <button className="w-full py-4 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-lg border-2 border-blue-600 transition-all active:scale-95">
                            Lihat Riwayat Laporan
                        </button>
                    </Link>
                </div>

                {/* Footer Note */}
                <p className="text-xs text-gray-500 mt-8">
                    Terima kasih atas dedikasi Anda dalam menjalankan tugas penagihan.
                </p>
            </div>
        </div>
    );
}

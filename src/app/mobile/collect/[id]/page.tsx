'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssets } from '@/context/AssetContext';
import { useValidation } from '@/context/ValidationContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Copy, Share2, Camera, CheckCircle, XCircle, Banknote, AlertCircle } from 'lucide-react';

// Format Rupiah
const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(num);
};

export default function PaymentRealizationPage() {
    const params = useParams();
    const router = useRouter();
    const { assets } = useAssets();
    const { submitPaymentReport } = useValidation();
    const { user } = useAuth();

    const taskId = params.id as string;

    // Find the asset/task
    const task = useMemo(() => {
        return assets.find((a) => a.id === taskId);
    }, [assets, taskId]);

    // Mock data
    const virtualAccount = '9881234567890';
    const promiseAmount = task?.totalArrears || 5000000;

    // Form state
    const [paymentStatus, setPaymentStatus] = useState<'full' | 'partial' | 'failed'>('full');
    const [partialAmount, setPartialAmount] = useState('');
    const [newPromiseDate, setNewPromiseDate] = useState('');
    const [failureReason, setFailureReason] = useState('');
    const [evidencePhoto, setEvidencePhoto] = useState<File | null>(null);

    // UI state
    const [errors, setErrors] = useState<string[]>([]);
    const [showCopyToast, setShowCopyToast] = useState(false);

    // Copy Virtual Account to clipboard
    const handleCopyVA = async () => {
        try {
            await navigator.clipboard.writeText(virtualAccount);
            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 2000);
        } catch (err) {
            setErrors(['Gagal menyalin nomor rekening']);
        }
    };

    // Share via WhatsApp
    const handleShareWhatsApp = () => {
        if (!task) return;

        const message = `Yth Bpk/Ibu ${task.debtorName}, ini nomor Virtual Account BTN untuk pembayaran hari ini sebesar ${formatRupiah(promiseAmount)}: ${virtualAccount}. Mohon kirim bukti transfer setelah berhasil. Tks - Watu Kobu.`;

        const phoneNumber = task.personalPhone?.replace(/^0/, '62').replace(/\D/g, '') || '';

        if (!phoneNumber) {
            setErrors(['Nomor telepon debitur tidak tersedia']);
            return;
        }

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setEvidencePhoto(file);
    };

    // Validate and submit
    const handleSubmit = () => {
        const newErrors: string[] = [];

        // Validation based on payment status
        if (paymentStatus === 'full' || paymentStatus === 'partial') {
            if (!evidencePhoto) {
                newErrors.push('Foto bukti transfer wajib diupload untuk pembayaran');
            }
        }

        if (paymentStatus === 'partial') {
            const amount = parseFloat(partialAmount.replace(/\D/g, ''));
            if (!partialAmount || isNaN(amount) || amount <= 0) {
                newErrors.push('Nominal pembayaran sebagian wajib diisi');
            } else if (amount >= promiseAmount) {
                newErrors.push('Nominal pembayaran sebagian harus lebih kecil dari komitmen');
            }
        }

        if (paymentStatus === 'failed') {
            if (!newPromiseDate) {
                newErrors.push('Tanggal janji baru wajib diisi');
            }
            if (!failureReason.trim()) {
                newErrors.push('Alasan gagal bayar wajib diisi');
            }
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Submit collection
        if (!user || !task) return;

        const collectionData = {
            loanId: task.loanId,
            collectorId: user.id,
            collectorName: user.name,
            debtorName: task.debtorName,
            branch: task.branch,
            promiseAmount,
            paymentStatus,
            paidAmount: paymentStatus === 'full' ? promiseAmount : (paymentStatus === 'partial' ? parseFloat(partialAmount.replace(/\D/g, '')) : 0),
            newPromiseDate: paymentStatus === 'failed' ? newPromiseDate : undefined,
            failureReason: paymentStatus === 'failed' ? failureReason : undefined,
            evidencePhoto: evidencePhoto?.name || '',
        };

        // Submit via ValidationContext
        submitPaymentReport(collectionData);

        // Redirect to success page
        router.push('/mobile/collect/success');
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Container */}
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm pb-32">
                {/* Header */}
                <div className="bg-slate-900 text-white px-6 py-4 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold">Realisasi Pembayaran</h1>
                            <p className="text-xs text-slate-300">{task.debtorName}</p>
                        </div>
                    </div>
                </div>

                {/* Copy Toast */}
                {showCopyToast && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
                        ✓ Nomor rekening disalin!
                    </div>
                )}

                {/* Error Display */}
                {errors.length > 0 && (
                    <div className="mx-6 mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-4">
                        <p className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                            <AlertCircle size={16} />
                            Periksa Form:
                        </p>
                        <ul className="text-sm text-red-600 space-y-1">
                            {errors.map((error, idx) => (
                                <li key={idx}>• {error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Content */}
                <div className="px-6 py-6 space-y-6">

                    {/* HERO CARD: Komitmen */}
                    <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-lg -mt-8 relative z-10">
                        <p className="text-sm text-gray-600 font-semibold mb-2">Komitmen Janji Bayar</p>
                        <p className="text-3xl font-bold text-blue-600 mb-3">
                            {formatRupiah(promiseAmount)}
                        </p>
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            Jatuh Tempo Hari Ini
                        </span>
                    </div>

                    {/* SECTION 1: Payment Channel (Anti-Fraud) */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <div className="w-1 h-5 bg-slate-700 rounded-full" />
                            Rekening Pembayaran Resmi (BTN)
                        </h3>
                        <p className="text-xs text-gray-600 mb-4">Hanya terima pembayaran ke rekening ini untuk menghindari penipuan</p>

                        <div className="bg-white border-2 border-slate-300 rounded-lg p-4 mb-4">
                            <p className="text-xs text-gray-500 mb-1">Virtual Account BTN</p>
                            <p className="text-2xl font-mono font-bold text-gray-900">
                                {virtualAccount}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleCopyVA}
                                className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <Copy size={18} />
                                <span className="text-sm">Copy No. Rek</span>
                            </button>
                            <button
                                onClick={handleShareWhatsApp}
                                disabled={!task.personalPhone}
                                className="py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <Share2 size={18} />
                                <span className="text-sm">Kirim WA</span>
                            </button>
                        </div>
                    </div>

                    {/* SECTION 2: Settlement Form */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-1 h-5 bg-blue-600 rounded-full" />
                            Status Pembayaran
                        </h3>

                        <div className="space-y-3">
                            {/* Option 1: Full Payment */}
                            <button
                                onClick={() => setPaymentStatus('full')}
                                className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${paymentStatus === 'full'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 bg-white hover:border-green-300'
                                    }`}
                            >
                                <CheckCircle
                                    size={24}
                                    className={paymentStatus === 'full' ? 'text-green-600' : 'text-gray-400'}
                                />
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-gray-900">Bayar Full</p>
                                    <p className="text-xs text-gray-600">Pembayaran sesuai komitmen</p>
                                </div>
                            </button>

                            {/* Option 2: Partial Payment */}
                            <button
                                onClick={() => setPaymentStatus('partial')}
                                className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${paymentStatus === 'partial'
                                    ? 'border-yellow-500 bg-yellow-50'
                                    : 'border-gray-300 bg-white hover:border-yellow-300'
                                    }`}
                            >
                                <Banknote
                                    size={24}
                                    className={paymentStatus === 'partial' ? 'text-yellow-600' : 'text-gray-400'}
                                />
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-gray-900">Bayar Sebagian</p>
                                    <p className="text-xs text-gray-600">Pembayaran parsial</p>
                                </div>
                            </button>

                            {paymentStatus === 'partial' && (
                                <div className="ml-9 mt-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nominal Pembayaran <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={partialAmount}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            setPartialAmount(value ? formatRupiah(parseInt(value)) : '');
                                        }}
                                        placeholder="Rp 0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm text-gray-900 bg-white outline-none"
                                    />
                                </div>
                            )}

                            {/* Option 3: Failed Payment */}
                            <button
                                onClick={() => setPaymentStatus('failed')}
                                className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${paymentStatus === 'failed'
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300 bg-white hover:border-red-300'
                                    }`}
                            >
                                <XCircle
                                    size={24}
                                    className={paymentStatus === 'failed' ? 'text-red-600' : 'text-gray-400'}
                                />
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-gray-900">Gagal Bayar</p>
                                    <p className="text-xs text-gray-600">Debitur tidak dapat bayar</p>
                                </div>
                            </button>

                            {paymentStatus === 'failed' && (
                                <div className="ml-9 mt-2 space-y-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Tanggal Janji Baru <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={newPromiseDate}
                                            onChange={(e) => setNewPromiseDate(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-gray-900 bg-white outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Alasan Gagal <span className="text-red-600">*</span>
                                        </label>
                                        <textarea
                                            value={failureReason}
                                            onChange={(e) => setFailureReason(e.target.value)}
                                            placeholder="Jelaskan alasan debitur tidak dapat membayar..."
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-gray-900 bg-white outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 3: Evidence */}
                    {(paymentStatus === 'full' || paymentStatus === 'partial') && (
                        <div className="bg-white border-2 border-amber-200 rounded-xl p-5 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 bg-amber-600 rounded-full" />
                                Bukti Pembayaran
                            </h3>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Foto Bukti Transfer / Struk ATM <span className="text-red-600">*</span>
                                </label>

                                <label className="flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-400 cursor-pointer transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Camera size={24} className="text-gray-500" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">Upload Bukti</p>
                                            {evidencePhoto && (
                                                <p className="text-xs text-green-600">✓ {evidencePhoto.name}</p>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <span className="text-xs text-blue-600 font-semibold">
                                        {evidencePhoto ? 'Ganti' : 'Pilih'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button (Fixed Footer) */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-[999]">
                    <div className="max-w-md mx-auto">
                        <button
                            onClick={handleSubmit}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <span>KONFIRMASI PEMBAYARAN 💸</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

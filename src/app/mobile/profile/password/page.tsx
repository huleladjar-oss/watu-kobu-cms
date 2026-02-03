'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Lock,
    KeyRound,
    ShieldCheck,
    AlertCircle,
} from 'lucide-react';

// Password Input Component with Toggle Visibility
function PasswordInput({
    label,
    value,
    onChange,
    placeholder,
    showPassword,
    onToggleVisibility,
    error,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    showPassword: boolean;
    onToggleVisibility: () => void;
    error?: string;
}) {
    return (
        <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-600 mb-2">
                {label}
            </label>
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3.5 pr-12 bg-white border rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${error
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-slate-200 focus:ring-blue-500'
                        }`}
                />
                <button
                    type="button"
                    onClick={onToggleVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            {error && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {error}
                </p>
            )}
        </div>
    );
}

export default function ChangePasswordPage() {
    const router = useRouter();

    // Password states
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    // Visibility states
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // UI states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Validation
    const passwordsMatch = newPass === confirmPass;
    const showMismatchError = newPass.length > 0 && confirmPass.length > 0 && !passwordsMatch;
    const isFormValid = currentPass.length > 0 && newPass.length >= 6 && passwordsMatch && confirmPass.length > 0;

    // Handle submit
    const handleSubmit = async () => {
        if (!isFormValid) return;

        setError('');
        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simple validation (in real app, this would be server-side)
        if (currentPass.length < 4) {
            setError('Password lama salah');
            setIsLoading(false);
            return;
        }

        // Success
        setIsLoading(false);
        setSuccess(true);

        // Redirect after success
        setTimeout(() => {
            router.push('/mobile/profile');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-28 relative">
            {/* 1. STICKY NAVBAR - Highest Z-Index */}
            <div className="sticky top-0 z-[100] bg-[#0F172A] px-5 py-4 shadow-lg">
                <div className="flex items-center gap-4 text-white">
                    <Link href="/mobile/profile">
                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm transition-all border border-white/5 cursor-pointer">
                            <ArrowLeft size={20} />
                        </button>
                    </Link>
                    <h1 className="font-bold text-xl tracking-tight">Ganti Password</h1>
                </div>
            </div>

            {/* 2. DECORATIVE BACKGROUND */}
            <div className="bg-[#0F172A] h-24 w-full absolute top-14 left-0 z-0 overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 bottom-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* 3. CONTENT CONTAINER */}
            <div className="relative z-10 px-5 pt-4">
                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
                    {/* Icon Header */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <KeyRound size={32} className="text-white" />
                        </div>
                    </div>

                    {/* Info Text */}
                    <p className="text-center text-sm text-slate-500 mb-6">
                        Pastikan password baru minimal 6 karakter dan mudah diingat
                    </p>

                    {/* Global Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                <AlertCircle size={20} />
                            </div>
                            <p className="text-red-600 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="text-green-700 text-sm font-bold">Password Berhasil Diubah!</p>
                                <p className="text-green-600 text-xs">Mengalihkan ke halaman profil...</p>
                            </div>
                        </div>
                    )}

                    {/* Password Fields */}
                    <PasswordInput
                        label="Password Saat Ini"
                        value={currentPass}
                        onChange={setCurrentPass}
                        placeholder="Masukkan password lama"
                        showPassword={showCurrent}
                        onToggleVisibility={() => setShowCurrent(!showCurrent)}
                    />

                    <PasswordInput
                        label="Password Baru"
                        value={newPass}
                        onChange={setNewPass}
                        placeholder="Minimal 6 karakter"
                        showPassword={showNew}
                        onToggleVisibility={() => setShowNew(!showNew)}
                        error={newPass.length > 0 && newPass.length < 6 ? 'Minimal 6 karakter' : undefined}
                    />

                    <PasswordInput
                        label="Ulangi Password Baru"
                        value={confirmPass}
                        onChange={setConfirmPass}
                        placeholder="Ketik ulang password baru"
                        showPassword={showConfirm}
                        onToggleVisibility={() => setShowConfirm(!showConfirm)}
                        error={showMismatchError ? 'Password tidak cocok!' : undefined}
                    />

                    {/* Password Strength Indicator (Optional Visual) */}
                    {newPass.length > 0 && (
                        <div className="mb-5">
                            <p className="text-xs text-slate-400 mb-2">Kekuatan Password:</p>
                            <div className="flex gap-1">
                                <div className={`h-1.5 flex-1 rounded-full ${newPass.length >= 6 ? 'bg-red-400' : 'bg-slate-200'}`}></div>
                                <div className={`h-1.5 flex-1 rounded-full ${newPass.length >= 8 ? 'bg-yellow-400' : 'bg-slate-200'}`}></div>
                                <div className={`h-1.5 flex-1 rounded-full ${newPass.length >= 10 ? 'bg-green-400' : 'bg-slate-200'}`}></div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                                {newPass.length < 6 ? 'Terlalu pendek' : newPass.length < 8 ? 'Lemah' : newPass.length < 10 ? 'Sedang' : 'Kuat'}
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid || isLoading || success}
                        className={`w-full font-bold h-14 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2 ${success
                                ? 'bg-green-500 text-white'
                                : isLoading
                                    ? 'bg-slate-300 text-slate-500'
                                    : isFormValid
                                        ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {success ? (
                            <>
                                <ShieldCheck size={20} />
                                Berhasil!
                            </>
                        ) : isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                Memproses...
                            </>
                        ) : (
                            <>
                                <Lock size={20} />
                                UPDATE PASSWORD
                            </>
                        )}
                    </button>
                </div>

                {/* Security Tips */}
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <h4 className="text-sm font-bold text-amber-800 mb-2">💡 Tips Keamanan:</h4>
                    <ul className="text-xs text-amber-700 space-y-1">
                        <li>• Gunakan kombinasi huruf, angka, dan simbol</li>
                        <li>• Jangan gunakan password yang sama dengan akun lain</li>
                        <li>• Hindari informasi pribadi (tanggal lahir, nama)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

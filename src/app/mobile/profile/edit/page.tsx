'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Camera,
    Lock,
    User,
    Briefcase,
    MapPin,
    Phone,
    Mail,
    Home,
    Save,
    AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Helper function to get initials from name
function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Locked Field Component
function LockedField({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3 p-4 border-b border-slate-100 last:border-0">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
                    <Lock size={12} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600">{value}</p>
            </div>
        </div>
    );
}

// Editable Field Component
function EditableField({
    icon: Icon,
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    required = false,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: 'text' | 'email' | 'tel';
    required?: boolean;
}) {
    return (
        <div className="flex items-start gap-3 p-4 border-b border-slate-100 last:border-0">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <label className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                    {required && <span className="text-red-500 text-xs">*</span>}
                </label>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            </div>
        </div>
    );
}

export default function EditProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();

    // Form state from user data
    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        whatsapp: user?.phone || '',
        email: user?.email || '',
        address: user?.address || '',
    });

    // Photo state
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Locked data (from company/admin)
    const lockedData = {
        nik: user?.employeeId || `WK-${user?.id?.toString().padStart(3, '0') || '003'}`,
        jabatan: 'Senior Collector',
        area: user?.area || 'Jakarta Selatan',
    };

    // Handle photo upload
    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Update form field
    const updateField = (field: keyof typeof formData) => (value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Handle save - calls real API
    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch(`/api/users/${user?.id}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.fullName,
                    phone: formData.whatsapp,
                    email: formData.email,
                    address: formData.address,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save profile');
            }

            setShowSuccess(true);

            // Auto redirect after success
            setTimeout(() => {
                router.push('/mobile/profile');
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan');
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-28 relative">
            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* 1. STICKY NAVBAR - Highest Z-Index */}
            <div className="sticky top-0 z-[100] bg-[#0F172A] px-5 py-4 shadow-lg">
                <div className="flex items-center gap-4 text-white">
                    <Link href="/mobile/profile">
                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm transition-all border border-white/5 cursor-pointer">
                            <ArrowLeft size={20} />
                        </button>
                    </Link>
                    <h1 className="font-bold text-xl tracking-tight">Edit Profil</h1>
                </div>
            </div>

            {/* 2. DECORATIVE BACKGROUND - Extends below navbar */}
            <div className="bg-[#0F172A] h-28 w-full absolute top-14 left-0 z-0 overflow-hidden">
                {/* Decorative Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 bottom-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* 3. CONTENT CONTAINER - Above decorative bg, below navbar */}
            <div className="relative z-10 px-5 pt-4 flex flex-col gap-5">
                {/* Photo Upload Section - Hero */}
                <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center border border-slate-100">
                    {/* Avatar with Camera Badge */}
                    <div className="relative mb-4">
                        <button
                            onClick={handlePhotoClick}
                            className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                        >
                            {photoPreview ? (
                                <img
                                    src={photoPreview}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white font-bold text-4xl">
                                    {getInitials(formData.fullName)}
                                </span>
                            )}
                        </button>
                        {/* Camera Badge */}
                        <button
                            onClick={handlePhotoClick}
                            className="absolute -bottom-1 -right-1 w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            <Camera size={18} />
                        </button>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Tap untuk ganti foto profil</p>
                </div>

                {/* Section 1: Company Data (Locked) */}
                <section>
                    <div className="flex items-center gap-2 mb-3 ml-1">
                        <Lock size={14} className="text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Data Perusahaan
                        </h4>
                    </div>
                    <div className="bg-slate-50 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <LockedField
                            icon={User}
                            label="ID Karyawan (NIK)"
                            value={lockedData.nik}
                        />
                        <LockedField
                            icon={Briefcase}
                            label="Jabatan"
                            value={lockedData.jabatan}
                        />
                        <LockedField
                            icon={MapPin}
                            label="Area Penugasan"
                            value={lockedData.area}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-2 ml-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Data ini dikelola oleh admin dan tidak dapat diubah
                    </p>
                </section>

                {/* Section 2: Personal Data (Editable) */}
                <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
                        ✏️ Data Pribadi
                    </h4>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <EditableField
                            icon={User}
                            label="Nama Lengkap"
                            value={formData.fullName}
                            onChange={updateField('fullName')}
                            placeholder="Masukkan nama lengkap"
                            required
                        />
                        <EditableField
                            icon={Phone}
                            label="Nomor WhatsApp"
                            value={formData.whatsapp}
                            onChange={updateField('whatsapp')}
                            placeholder="0812-xxxx-xxxx"
                            type="tel"
                            required
                        />
                        <EditableField
                            icon={Mail}
                            label="Email"
                            value={formData.email}
                            onChange={updateField('email')}
                            placeholder="email@example.com"
                            type="email"
                        />
                        <EditableField
                            icon={Home}
                            label="Alamat Domisili"
                            value={formData.address}
                            onChange={updateField('address')}
                            placeholder="Masukkan alamat lengkap"
                        />
                    </div>
                </section>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaving || showSuccess}
                    className={`w-full mt-4 font-bold h-14 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${showSuccess
                        ? 'bg-green-500 text-white'
                        : isSaving
                            ? 'bg-slate-300 text-slate-500'
                            : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white'
                        }`}
                >
                    {showSuccess ? (
                        <>
                            <span>✓</span>
                            Tersimpan!
                        </>
                    ) : isSaving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            SIMPAN PERUBAHAN
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

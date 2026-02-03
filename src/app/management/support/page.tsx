'use client';

import { useState } from 'react';
import {
    Search,
    BookOpen,
    MessageCircle,
    Server,
    ChevronDown,
    ChevronUp,
    Send,
    CheckCircle,
    ExternalLink,
} from 'lucide-react';

// FAQ Item Component
function FAQItem({
    question,
    answer,
    isOpen,
    onToggle,
}: {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
                <span className="text-sm font-medium text-slate-900">{question}</span>
                {isOpen ? (
                    <ChevronUp size={18} className="text-slate-400 shrink-0" />
                ) : (
                    <ChevronDown size={18} className="text-slate-400 shrink-0" />
                )}
            </button>
            {isOpen && (
                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed">{answer}</p>
                </div>
            )}
        </div>
    );
}

// Quick Access Card Component
function QuickAccessCard({
    icon: Icon,
    title,
    description,
    highlight,
    highlightColor = 'text-slate-600',
    href,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    highlight?: string;
    highlightColor?: string;
    href?: string;
}) {
    const CardContent = (
        <>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Icon size={24} className="text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
            {highlight && (
                <p className={`text-sm font-medium mt-2 ${highlightColor}`}>{highlight}</p>
            )}
        </>
    );

    if (href) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
            >
                {CardContent}
                <div className="mt-3 flex items-center gap-1 text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Buka <ExternalLink size={14} />
                </div>
            </a>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            {CardContent}
        </div>
    );
}

// Main Support Page Component
export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openFAQ, setOpenFAQ] = useState<number | null>(0);

    // FAQ Data
    const faqs = [
        {
            question: 'Bagaimana cara mereset password staf?',
            answer:
                'Untuk mereset password staf, buka menu Configuration > Role Permissions. Cari nama staf yang bersangkutan, lalu klik tombol "More Actions" (titik tiga). Pilih opsi "Reset Password". Password baru akan dikirimkan ke email staf yang terdaftar. Pastikan staf mengubah password setelah login pertama.',
        },
        {
            question: 'Kenapa data kunjungan kolektor belum muncul?',
            answer:
                'Data kunjungan dari aplikasi mobile memerlukan sinkronisasi ke server. Pastikan kolektor sudah: (1) Memiliki koneksi internet stabil, (2) Menekan tombol "Sync" di aplikasi mobile, (3) Tidak ada error saat sinkronisasi. Jika masalah berlanjut, cek di Audit Log apakah ada aktivitas "Sync Failed" dari kolektor tersebut.',
        },
        {
            question: 'Apakah saya bisa menghapus data aset?',
            answer:
                'Penghapusan permanen data aset hanya dapat dilakukan oleh user dengan role Manager (Superuser). Admin Staff tidak memiliki akses untuk menghapus aset demi keamanan data. Jika Anda perlu menghapus data aset, silakan hubungi Manager atau ajukan tiket melalui form di samping.',
        },
        {
            question: 'Bagaimana cara export laporan ke Excel?',
            answer:
                'Buka menu Reports > pilih jenis laporan yang diinginkan. Setelah data tampil, klik tombol "Export" di pojok kanan atas tabel. Pilih format "Excel (.xlsx)" atau "CSV". File akan diunduh otomatis ke folder Downloads Anda. Untuk laporan besar, proses export memerlukan waktu beberapa detik.',
        },
        {
            question: 'Mengapa sesi saya sering logout otomatis?',
            answer:
                'Sistem memiliki fitur keamanan timeout otomatis setelah 30 menit tidak ada aktivitas. Ini untuk melindungi data sensitif. Jika Anda membutuhkan waktu lebih lama, pastikan untuk melakukan aktivitas minimal (scroll/klik) secara berkala. Pengaturan timeout dapat diubah oleh Manager di Configuration.',
        },
    ];

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* Hero Section with Search */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Pusat Bantuan
                </h1>
                <p className="text-blue-100 text-sm md:text-base mb-6">
                    Temukan jawaban atau hubungi tim teknis
                </p>

                {/* Large Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                    <Search
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari kendala (contoh: lupa password, data error)..."
                        className="w-full pl-12 pr-4 py-4 rounded-xl border-0 text-slate-900 text-sm md:text-base shadow-lg focus:ring-4 focus:ring-blue-300 bg-white"
                    />
                </div>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickAccessCard
                    icon={BookOpen}
                    title="User Manual"
                    description="Dokumentasi lengkap penggunaan CMS."
                    href="#"
                />
                <QuickAccessCard
                    icon={MessageCircle}
                    title="Chat Support"
                    description="Hubungi tim IT via WhatsApp (09:00 - 17:00)."
                    href="https://wa.me/6281234567890"
                />
                <QuickAccessCard
                    icon={Server}
                    title="Status Server"
                    description="Pantau status operasional sistem."
                    highlight="✅ All Systems Operational"
                    highlightColor="text-green-600"
                />
            </div>

            {/* Main Content - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Column - FAQ Accordion (60%) */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-1">
                            Sering Ditanyakan (FAQ)
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Pertanyaan umum seputar penggunaan sistem
                        </p>

                        <div className="space-y-3">
                            {faqs.map((faq, index) => (
                                <FAQItem
                                    key={index}
                                    question={faq.question}
                                    answer={faq.answer}
                                    isOpen={openFAQ === index}
                                    onToggle={() => toggleFAQ(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Contact Form (40%) */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-1">
                            Kirim Tiket Kendala
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Tim IT akan merespons dalam 1x24 jam kerja
                        </p>

                        <form className="space-y-4">
                            {/* Subject Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Subjek Masalah
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Tidak bisa login ke sistem"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            {/* Category Select */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Kategori
                                </label>
                                <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:border-blue-500 focus:ring-blue-500 cursor-pointer">
                                    <option value="">Pilih kategori...</option>
                                    <option value="bug">🐛 Bug / Error Sistem</option>
                                    <option value="account">👤 Masalah Akun</option>
                                    <option value="data">📊 Data & Laporan</option>
                                    <option value="other">📝 Lainnya</option>
                                </select>
                            </div>

                            {/* Description Textarea */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Deskripsi Detail
                                </label>
                                <textarea
                                    rows={5}
                                    placeholder="Jelaskan masalah yang Anda hadapi secara detail. Sertakan langkah-langkah yang sudah dilakukan sebelum error terjadi..."
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:border-blue-500 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
                            >
                                <Send size={16} />
                                Kirim Tiket
                            </button>
                        </form>

                        {/* Contact Info */}
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <p className="text-xs text-slate-500 text-center">
                                Untuk kendala mendesak, hubungi langsung:
                            </p>
                            <p className="text-sm font-medium text-slate-900 text-center mt-1">
                                📞 +62 21 555-0199 (IT Helpdesk)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-6 text-center text-xs text-slate-400">
                <p>© 2026 PT. WATU KOBU MULTINIAGA. All rights reserved. Help & Support Center.</p>
            </footer>
        </div>
    );
}

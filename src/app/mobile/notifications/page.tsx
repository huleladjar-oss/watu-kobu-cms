'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, CheckCircle, Clock, AlertTriangle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// Notification types
type NotificationType = 'REJECT' | 'MONEY' | 'REMINDER' | 'SYSTEM';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    time: string;
    read: boolean;
    relatedId?: string; // For routing
}

// Dummy notification data
const initialNotifications: Notification[] = [
    {
        id: 'n1',
        type: 'REJECT',
        title: 'Laporan Visit Ditolak',
        body: 'Laporan Visit Arga Putra DITOLAK Admin. Alasan: Foto terlalu gelap, tidak dapat memverifikasi lokasi.',
        time: '15 menit lalu',
        read: false,
        relatedId: 'ASSET-001',
    },
    {
        id: 'n2',
        type: 'MONEY',
        title: 'Pembayaran Diterima',
        body: 'Pembayaran Rp 5.000.000 dari Ahmad Wijaya telah DITERIMA dan diverifikasi sistem.',
        time: '1 jam lalu',
        read: false,
        relatedId: 'ASSET-002',
    },
    {
        id: 'n3',
        type: 'REMINDER',
        title: 'Janji Bayar Hari Ini',
        body: 'Dewi Lestari berjanji bayar hari ini. Total tunggakan Rp 3.2 juta. Segera lakukan follow-up.',
        time: '2 jam lalu',
        read: false,
        relatedId: 'ASSET-003',
    },
    {
        id: 'n4',
        type: 'MONEY',
        title: 'Pembayaran Diproses',
        body: 'Pembayaran Rp 2.500.000 dari Budi Santoso sedang dalam proses verifikasi admin.',
        time: '4 jam lalu',
        read: true,
        relatedId: 'ASSET-004',
    },
    {
        id: 'n5',
        type: 'SYSTEM',
        title: 'Maintenance Server',
        body: 'Maintenance server dijadwalkan nanti malam jam 23.00 - 01.00 WIB. Aplikasi mungkin tidak dapat diakses.',
        time: '5 jam lalu',
        read: true,
    },
    {
        id: 'n6',
        type: 'REMINDER',
        title: 'Target Collection Bulan Ini',
        body: 'Target collection bulan ini: 85%. Saat ini Anda sudah mencapai 72%. Semangat!',
        time: 'Kemarin',
        read: true,
    },
];

// Notification Icon Component
function NotificationIcon({ type }: { type: NotificationType }) {
    switch (type) {
        case 'REJECT':
            return <XCircle size={24} className="text-red-500 shrink-0" />;
        case 'MONEY':
            return <CheckCircle size={24} className="text-green-500 shrink-0" />;
        case 'REMINDER':
            return <Clock size={24} className="text-amber-500 shrink-0" />;
        case 'SYSTEM':
            return <AlertTriangle size={24} className="text-slate-400 shrink-0" />;
        default:
            return <AlertTriangle size={24} className="text-slate-400 shrink-0" />;
    }
}

// Notification Badge Color
function getNotificationColor(type: NotificationType): string {
    switch (type) {
        case 'REJECT':
            return 'bg-red-50 border-red-100';
        case 'MONEY':
            return 'bg-green-50 border-green-100';
        case 'REMINDER':
            return 'bg-amber-50 border-amber-100';
        case 'SYSTEM':
            return 'bg-slate-50 border-slate-100';
        default:
            return 'bg-slate-50 border-slate-100';
    }
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(initialNotifications);

    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.read).length;

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // Handle notification click
    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        setNotifications(prev =>
            prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
        );

        // Smart routing based on type
        if (notification.relatedId) {
            switch (notification.type) {
                case 'REJECT':
                    // Go to report form to revise
                    router.push(`/mobile/report/${notification.relatedId}`);
                    break;
                case 'MONEY':
                    // Go to history
                    router.push('/mobile/history');
                    break;
                case 'REMINDER':
                    // Go to collect page
                    router.push(`/mobile/collect/${notification.relatedId}`);
                    break;
                default:
                    // Stay on notifications page
                    break;
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-[#0F172A] text-white px-5 pt-14 pb-6 sticky top-0 z-20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Link href="/mobile" className="p-2 hover:bg-white/10 rounded-lg transition-colors active:bg-white/20">
                            <ChevronLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Notifikasi</h1>
                            {unreadCount > 0 && (
                                <p className="text-blue-200 text-xs mt-0.5">
                                    {unreadCount} notifikasi belum dibaca
                                </p>
                            )}
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                            Tandai Semua
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="px-5 py-4 space-y-3">
                {notifications.length === 0 ? (
                    <div className="text-center py-16">
                        <AlertTriangle size={64} className="text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-semibold mb-1">Tidak ada notifikasi</p>
                        <p className="text-slate-400 text-sm">Semua notifikasi Anda akan muncul di sini</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`${getNotificationColor(notification.type)} border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md active:scale-[0.98] relative`}
                        >
                            {/* Unread indicator */}
                            {!notification.read && (
                                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                            )}

                            <div className="flex gap-3">
                                {/* Icon */}
                                <NotificationIcon type={notification.type} />

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                                        {notification.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 line-clamp-2 leading-snug mb-2">
                                        {notification.body}
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {notification.time}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Empty state suggestion */}
            {notifications.length > 0 && notifications.every(n => n.read) && (
                <div className="px-5 pb-8">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                        <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-emerald-900 mb-1">
                            Semua Sudah Dibaca! 🎉
                        </p>
                        <p className="text-xs text-emerald-700">
                            Anda sudah menyelesaikan semua notifikasi
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

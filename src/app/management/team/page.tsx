'use client';

import {
    Users,
    Wifi,
    BarChart3,
    Search,
    Filter,
    Download,
    Calendar,
    Star,
    Eye,
} from 'lucide-react';

// Types
interface Collector {
    id: string;
    name: string;
    avatar: string;
    region: string;
    status: 'online' | 'offline' | 'on_leave';
    monthlyTarget: number;
    monthlyAchieved: number;
    efficiencyScore: number;
    rating: number;
}

// Dummy Data
const collectors: Collector[] = [
    {
        id: 'WK-092',
        name: 'Budi Santoso',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        region: 'Jakarta Selatan',
        status: 'online',
        monthlyTarget: 100,
        monthlyAchieved: 85,
        efficiencyScore: 9.2,
        rating: 5,
    },
    {
        id: 'WK-115',
        name: 'Siti Aminah',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
        region: 'Bandung Kota',
        status: 'online',
        monthlyTarget: 100,
        monthlyAchieved: 78,
        efficiencyScore: 8.8,
        rating: 4,
    },
    {
        id: 'WK-088',
        name: 'Rizky Pratama',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        region: 'Surabaya Timur',
        status: 'on_leave',
        monthlyTarget: 100,
        monthlyAchieved: 62,
        efficiencyScore: 7.5,
        rating: 4,
    },
    {
        id: 'WK-102',
        name: 'Dewi Lestari',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        region: 'Medan Kota',
        status: 'offline',
        monthlyTarget: 100,
        monthlyAchieved: 45,
        efficiencyScore: 6.2,
        rating: 3,
    },
    {
        id: 'WK-078',
        name: 'Ahmad Hidayat',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        region: 'Semarang Barat',
        status: 'online',
        monthlyTarget: 100,
        monthlyAchieved: 92,
        efficiencyScore: 9.5,
        rating: 5,
    },
];

// Stats Card Component
function StatsCard({
    title,
    value,
    subtext,
    icon: Icon,
    iconBg,
    iconColor,
    hasLiveDot,
}: {
    title: string;
    value: string;
    subtext?: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    hasLiveDot?: boolean;
}) {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`p-3 ${iconBg} rounded-xl relative`}>
                <Icon size={24} className={iconColor} />
                {hasLiveDot && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                {subtext && <p className="text-slate-400 text-xs">{subtext}</p>}
            </div>
        </div>
    );
}

// Status Badge Component
function StatusBadge({ status }: { status: Collector['status'] }) {
    const config = {
        online: {
            bg: 'bg-green-100',
            text: 'text-green-700',
            dot: 'bg-green-500',
            label: 'Online',
        },
        offline: {
            bg: 'bg-slate-100',
            text: 'text-slate-600',
            dot: 'bg-slate-400',
            label: 'Offline',
        },
        on_leave: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            dot: 'bg-yellow-500',
            label: 'On Leave',
        },
    };

    const { bg, text, dot, label } = config[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${bg} ${text}`}>
            <span className={`w-2 h-2 rounded-full ${dot}`}></span>
            {label}
        </span>
    );
}

// Performance Bar Component
function PerformanceBar({ achieved, target }: { achieved: number; target: number }) {
    const percentage = Math.round((achieved / target) * 100);
    const barColor = percentage >= 80 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Rp {achieved}jt / {target}jt</span>
                <span className={`font-semibold ${percentage >= 80 ? 'text-emerald-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {percentage}%
                </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full transition-all ${barColor}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
        </div>
    );
}

export default function TeamPerformancePage() {
    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
            {/* Header & Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Team Performance</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Monitor collector efficiency and regional coverage.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search collector..."
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0F172A] w-48 text-slate-600"
                        />
                    </div>
                    {/* Filter Area */}
                    <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer focus:ring-0">
                        <option>All Areas</option>
                        <option>Jakarta</option>
                        <option>Bandung</option>
                        <option>Surabaya</option>
                    </select>
                    {/* Filter Status */}
                    <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer focus:ring-0">
                        <option>All Status</option>
                        <option>Online</option>
                        <option>Offline</option>
                        <option>On Leave</option>
                    </select>
                    {/* Export Button */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium shadow-md hover:bg-[#1e293b] cursor-pointer">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Collectors"
                    value="24"
                    subtext="Full Roster"
                    icon={Users}
                    iconBg="bg-slate-100"
                    iconColor="text-slate-600"
                />
                <StatsCard
                    title="Active Now"
                    value="18"
                    subtext="On Duty"
                    icon={Wifi}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                    hasLiveDot
                />
                <StatsCard
                    title="Avg. Recovery Rate"
                    value="76%"
                    subtext="+2.4% vs last month"
                    icon={BarChart3}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                />
            </div>

            {/* Team Leaderboard Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Table Header */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Team Leaderboard</h3>
                        <p className="text-slate-400 text-sm">Performance metrics for all collectors</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                            <Filter size={14} />
                            Filter
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                            <Calendar size={14} />
                            This Month
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Collector Profile</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Region</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 font-semibold tracking-wider min-w-[200px]">Monthly Target</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-center">Efficiency</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {collectors.map((collector) => (
                                <tr key={collector.id} className="hover:bg-slate-50 transition-colors">
                                    {/* Collector Profile */}
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={collector.avatar}
                                                    alt={collector.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-slate-900">{collector.name}</p>
                                                <p className="text-sm text-slate-500">ID: {collector.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Region */}
                                    <td className="px-6 py-5 text-sm text-slate-600">{collector.region}</td>
                                    {/* Status */}
                                    <td className="px-6 py-5 text-center">
                                        <StatusBadge status={collector.status} />
                                    </td>
                                    {/* Performance KPI */}
                                    <td className="px-6 py-5">
                                        <PerformanceBar achieved={collector.monthlyAchieved} target={collector.monthlyTarget} />
                                    </td>
                                    {/* Efficiency Score */}
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-2xl font-bold text-slate-900">{collector.efficiencyScore}</span>
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className={
                                                            i < collector.rating
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'fill-slate-200 text-slate-200'
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    {/* Action */}
                                    <td className="px-6 py-5 text-center">
                                        <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors cursor-pointer">
                                            <Eye size={16} />
                                            View Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer / Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
                    <span>Showing 5 of 24 collectors</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer">
                            Previous
                        </button>
                        <button className="px-3 py-1.5 bg-[#0F172A] text-white rounded cursor-pointer">1</button>
                        <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer">
                            2
                        </button>
                        <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer">
                            3
                        </button>
                        <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-6 py-6 text-center text-xs text-slate-400">
                <p>© 2024 PT. WATU KOBU MULTINIAGA. All rights reserved.</p>
            </footer>
        </div>
    );
}

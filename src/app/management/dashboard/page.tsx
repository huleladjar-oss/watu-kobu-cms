'use client';

import {
    TrendingUp,
    Briefcase,
    Activity,
    Calendar,
    Download,
    Filter,
    ArrowDownUp,
    Star,
} from 'lucide-react';

// Circular Gauge Component for Recovery Rate
function RecoveryRateGauge() {
    const percentage = 68;
    const target = 75;
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center h-48">
            <p className="text-slate-500 text-sm font-medium mb-3">Recovery Rate</p>

            {/* Circular Gauge */}
            <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
                </div>
            </div>

            {/* Target Label */}
            <p className="text-slate-400 text-xs mt-3">Target: {target}%</p>

            {/* Trend */}
            <div className="flex items-center gap-1 mt-2">
                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-semibold">
                    +5%
                </span>
                <span className="text-slate-400 text-xs">vs Last Month</span>
            </div>
        </div>
    );
}

// KPI Card Component
function KPICard({
    title,
    value,
    subtext,
    icon: Icon,
    iconBg,
    iconColor,
}: {
    title: string;
    value: string;
    subtext: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
}) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-48">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-sm font-medium mb-2">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
                </div>
                <div className={`p-3 ${iconBg} rounded-xl`}>
                    <Icon size={24} className={iconColor} />
                </div>
            </div>
            <p className="text-slate-400 text-sm">{subtext}</p>
        </div>
    );
}

// Area Chart Component (CSS-based smooth curve simulation)
function RevenueTrendChart() {
    const dataPoints = [
        { label: 'Jan', value: 30 },
        { label: 'Feb', value: 45 },
        { label: 'Mar', value: 35 },
        { label: 'Apr', value: 55 },
        { label: 'May', value: 48 },
        { label: 'Jun', value: 65 },
        { label: 'Jul', value: 58 },
        { label: 'Aug', value: 75 },
        { label: 'Sep', value: 68 },
        { label: 'Oct', value: 82 },
        { label: 'Nov', value: 78 },
        { label: 'Dec', value: 92 },
    ];

    // Create SVG path for smooth curve
    const height = 200;
    const width = 100;
    const maxValue = Math.max(...dataPoints.map(d => d.value));

    const points = dataPoints.map((d, i) => ({
        x: (i / (dataPoints.length - 1)) * width,
        y: height - (d.value / maxValue) * height * 0.85,
    }));

    // Create smooth curve path
    const linePath = points.reduce((path, point, i) => {
        if (i === 0) return `M ${point.x},${point.y}`;
        const prev = points[i - 1];
        const cpX = (prev.x + point.x) / 2;
        return `${path} C ${cpX},${prev.y} ${cpX},${point.y} ${point.x},${point.y}`;
    }, '');

    // Area path (extends line to bottom)
    const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Daily Collection Trend</h3>
                    <p className="text-slate-400 text-sm">Last 30 days revenue flow</p>
                </div>
                <select className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-600 cursor-pointer focus:ring-0">
                    <option>Last 12 Months</option>
                    <option>Last 6 Months</option>
                    <option>Last 30 Days</option>
                </select>
            </div>

            {/* Chart Area */}
            <div className="relative h-[280px] w-full">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-slate-400">
                    <span>Rp 500M</span>
                    <span>Rp 375M</span>
                    <span>Rp 250M</span>
                    <span>Rp 125M</span>
                    <span>Rp 0</span>
                </div>

                {/* Chart Container */}
                <div className="ml-14 h-[240px] relative">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-full h-px bg-slate-100"></div>
                        ))}
                    </div>

                    {/* SVG Area Chart */}
                    <svg
                        className="w-full h-full"
                        viewBox={`0 0 ${width} ${height}`}
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                            </linearGradient>
                        </defs>
                        {/* Area Fill */}
                        <path d={areaPath} fill="url(#areaGradient)" />
                        {/* Line */}
                        <path
                            d={linePath}
                            fill="none"
                            stroke="#2563EB"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        />
                        {/* Data Points */}
                        {points.map((point, i) => (
                            <circle
                                key={i}
                                cx={point.x}
                                cy={point.y}
                                r="3"
                                fill="#2563EB"
                                className="hover:r-5 transition-all"
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}
                    </svg>
                </div>

                {/* X-axis labels */}
                <div className="ml-14 flex justify-between text-xs text-slate-400 mt-2">
                    {dataPoints.map((d, i) => (
                        <span key={i} className={i >= 10 ? 'font-medium text-slate-600' : ''}>{d.label}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Portfolio Quality Donut Chart with semantic colors
function PortfolioQualityChart() {
    const segments = [
        { label: 'Lancar (Performing)', color: '#10B981', percentage: 40 },
        { label: 'Kurang Lancar (Doubtful)', color: '#F59E0B', percentage: 30 },
        { label: 'Macet (Loss)', color: '#EF4444', percentage: 30 },
    ];

    // Calculate conic gradient
    let cumulativePercentage = 0;
    const gradientStops = segments.map(segment => {
        const start = cumulativePercentage;
        cumulativePercentage += segment.percentage;
        return `${segment.color} ${start}% ${cumulativePercentage}%`;
    }).join(', ');

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Portfolio Quality</h3>
            <p className="text-slate-400 text-sm mb-6">Asset health distribution</p>

            {/* Donut Chart */}
            <div className="flex-1 flex items-center justify-center relative">
                <div
                    className="relative w-44 h-44 rounded-full"
                    style={{
                        background: `conic-gradient(${gradientStops})`,
                    }}
                >
                    <div className="absolute inset-0 m-auto w-28 h-28 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
                        <span className="text-2xl font-bold text-slate-800">1,240</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">Total Cases</span>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-3">
                {segments.map((segment) => (
                    <div key={segment.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: segment.color }}
                            ></span>
                            <span className="text-slate-600">{segment.label}</span>
                        </div>
                        <span className="font-semibold text-slate-900">{segment.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Leaderboard Component
function TopPerformersTable() {
    const collectors = [
        {
            rank: 1,
            name: 'Budi Santoso',
            id: 'WK-092',
            area: 'Jakarta Selatan',
            amount: 'Rp 150jt',
            barWidth: 90,
            rating: 5,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        },
        {
            rank: 2,
            name: 'Siti Aminah',
            id: 'WK-115',
            area: 'Bandung Kota',
            amount: 'Rp 120jt',
            barWidth: 75,
            rating: 4,
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
        },
        {
            rank: 3,
            name: 'Ahmad Rizky',
            id: 'WK-088',
            area: 'Surabaya Timur',
            amount: 'Rp 90jt',
            barWidth: 60,
            rating: 4,
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Top Performing Collectors</h3>
                    <p className="text-slate-400 text-sm">This month&apos;s collection leaders</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                        <Filter size={14} />
                        Filter
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                        <ArrowDownUp size={14} />
                        Sort
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider w-16 text-center">Rank</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Collector</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Area</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Amount Collected</th>
                            <th className="px-6 py-4 font-semibold tracking-wider min-w-[200px]">Performance</th>
                            <th className="px-6 py-4 font-semibold tracking-wider text-right">Rating</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {collectors.map((collector) => (
                            <tr key={collector.id} className="hover:bg-slate-50 transition-colors">
                                {/* Rank */}
                                <td className="px-6 py-5 text-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto text-sm font-bold ${collector.rank === 1
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : collector.rank === 2
                                                    ? 'bg-slate-200 text-slate-600'
                                                    : 'bg-amber-100 text-amber-700'
                                            }`}
                                    >
                                        {collector.rank}
                                    </div>
                                </td>
                                {/* Name */}
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={collector.avatar}
                                                alt={collector.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{collector.name}</p>
                                            <p className="text-xs text-slate-500">ID: {collector.id}</p>
                                        </div>
                                    </div>
                                </td>
                                {/* Area */}
                                <td className="px-6 py-5 text-sm text-slate-600">{collector.area}</td>
                                {/* Amount */}
                                <td className="px-6 py-5 text-sm font-bold text-slate-900">{collector.amount}</td>
                                {/* Performance Bar */}
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                                            <div
                                                className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                                                style={{ width: `${collector.barWidth}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-600 w-10">
                                            {collector.barWidth}%
                                        </span>
                                    </div>
                                </td>
                                {/* Rating */}
                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={
                                                    i < collector.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'fill-slate-200 text-slate-200'
                                                }
                                            />
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function ManagementDashboardPage() {
    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
            {/* Welcome/Context */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Executive Overview</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Strategic insights for PT. WATU KOBU MULTINIAGA portfolio.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer">
                        <Calendar size={16} />
                        This Month
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium shadow-md hover:bg-[#1e293b] cursor-pointer">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Recovery Rate Gauge */}
                <RecoveryRateGauge />

                {/* Cash Inflow */}
                <KPICard
                    title="Cash Inflow"
                    value="Rp 1.2 M"
                    subtext="Total collected this month"
                    icon={TrendingUp}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                />

                {/* Active Cases */}
                <KPICard
                    title="Active Cases"
                    value="1,240"
                    subtext="45 New cases this week"
                    icon={Briefcase}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                />

                {/* Team Efficiency */}
                <KPICard
                    title="Team Efficiency"
                    value="85%"
                    subtext="Task Completion Rate"
                    icon={Activity}
                    iconBg="bg-purple-50"
                    iconColor="text-purple-600"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueTrendChart />
                </div>
                <div className="lg:col-span-1">
                    <PortfolioQualityChart />
                </div>
            </div>

            {/* Leaderboard */}
            <TopPerformersTable />

            {/* Footer */}
            <footer className="mt-10 py-6 text-center text-xs text-slate-400">
                <p>© 2024 PT. WATU KOBU MULTINIAGA. All rights reserved. Confidential Executive Dashboard.</p>
            </footer>
        </div>
    );
}

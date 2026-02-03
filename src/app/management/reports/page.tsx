'use client';

import { useState } from 'react';
import {
    FileText,
    Download,
    Filter,
    Calendar,
    Search,
    FileSpreadsheet,
    Play,
    TrendingUp,
    RefreshCw,
    Library,
} from 'lucide-react';

// Types
interface Report {
    id: string;
    fileName: string;
    fileType: 'pdf' | 'excel';
    reportType: string;
    dateGenerated: string;
    requestedBy: {
        name: string;
        avatar: string;
    };
    status: 'ready' | 'processing' | 'archived';
}

// Dummy Data
const recentReports: Report[] = [
    {
        id: '1',
        fileName: 'Oct_2025_Collection_Summary.pdf',
        fileType: 'pdf',
        reportType: 'Financial',
        dateGenerated: 'Oct 31, 2025 • 10:00 AM',
        requestedBy: {
            name: 'Alex Morgan',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        },
        status: 'ready',
    },
    {
        id: '2',
        fileName: 'Collector_Performance_Q3.xlsx',
        fileType: 'excel',
        reportType: 'Performance',
        dateGenerated: 'Oct 30, 2025 • 04:15 PM',
        requestedBy: {
            name: 'Sarah Jenkins',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
        },
        status: 'ready',
    },
    {
        id: '3',
        fileName: 'Asset_Aging_Analysis_Oct.pdf',
        fileType: 'pdf',
        reportType: 'Operational',
        dateGenerated: 'Oct 29, 2025 • 11:30 AM',
        requestedBy: {
            name: 'David Chen',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        },
        status: 'ready',
    },
    {
        id: '4',
        fileName: 'NPL_Weekly_Report_W43.xlsx',
        fileType: 'excel',
        reportType: 'Financial',
        dateGenerated: 'Oct 28, 2025 • 09:00 AM',
        requestedBy: {
            name: 'Alex Morgan',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        },
        status: 'processing',
    },
    {
        id: '5',
        fileName: 'Audit_Log_September.pdf',
        fileType: 'pdf',
        reportType: 'Audit',
        dateGenerated: 'Oct 15, 2025 • 02:00 PM',
        requestedBy: {
            name: 'Sarah Jenkins',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
        },
        status: 'ready',
    },
    {
        id: '6',
        fileName: 'Recovery_Rate_Summary_Q3.xlsx',
        fileType: 'excel',
        reportType: 'Financial',
        dateGenerated: 'Oct 10, 2025 • 11:00 AM',
        requestedBy: {
            name: 'David Chen',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        },
        status: 'ready',
    },
];

// Status Badge Component
function StatusBadge({ status }: { status: Report['status'] }) {
    if (status === 'ready') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Ready
            </span>
        );
    }
    if (status === 'processing') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                Processing
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Archived
        </span>
    );
}

// File Icon Component
function FileIcon({ type }: { type: 'pdf' | 'excel' }) {
    if (type === 'pdf') {
        return (
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                <FileText size={20} className="text-red-600" />
            </div>
        );
    }
    return (
        <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
            <FileSpreadsheet size={20} className="text-green-600" />
        </div>
    );
}

export default function ReportsCenterPage() {
    const [reportType, setReportType] = useState('monthly_collection');
    const [dateRange, setDateRange] = useState('last_30_days');
    const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-[#0F172A]">Financial & Operational Reports</h2>
                <p className="text-slate-500 text-sm mt-1">
                    Generate detailed insights for stakeholders.
                </p>
            </div>

            {/* Report Generator Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Generate New Report</h3>
                        <p className="text-slate-500 text-xs">Customize and download data for specific operational needs.</p>
                    </div>
                </div>

                {/* Form Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                    {/* Report Type */}
                    <div className="lg:col-span-3">
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-[#0F172A] py-2.5 px-3 cursor-pointer"
                        >
                            <option value="monthly_collection">Monthly Collection</option>
                            <option value="asset_aging">Asset Aging Analysis</option>
                            <option value="collector_performance">Collector Performance</option>
                            <option value="audit_log">Audit Log</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="lg:col-span-3">
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">Date Range</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-[#0F172A] py-2.5 cursor-pointer"
                            >
                                <option value="last_30_days">Last 30 Days</option>
                                <option value="this_month">This Month</option>
                                <option value="last_quarter">Last Quarter</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                    </div>

                    {/* Area/Zone */}
                    <div className="lg:col-span-3">
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">Area / Zone</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-[#0F172A] py-2.5 px-3 cursor-pointer">
                            <option>All Regions</option>
                            <option>Jakarta Region</option>
                            <option>West Java</option>
                            <option>East Java</option>
                            <option>Sumatra</option>
                        </select>
                    </div>

                    {/* Format */}
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">Format</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFormat('pdf')}
                                className={`flex-1 flex items-center justify-center gap-1 py-2.5 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${format === 'pdf'
                                        ? 'bg-red-50 border-red-200 text-red-700'
                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                <FileText size={16} />
                                PDF
                            </button>
                            <button
                                onClick={() => setFormat('excel')}
                                className={`flex-1 flex items-center justify-center gap-1 py-2.5 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${format === 'excel'
                                        ? 'bg-green-50 border-green-200 text-green-700'
                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                <FileSpreadsheet size={16} />
                                Excel
                            </button>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="lg:col-span-1">
                        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0F172A] hover:bg-[#1e293b] text-white rounded-lg font-medium text-sm shadow-md transition-colors cursor-pointer h-[42px]">
                            <Play size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Generated */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1 bg-blue-500"></div>
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <Library size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Generated</p>
                        <h3 className="text-2xl font-bold text-slate-900">12</h3>
                        <p className="text-slate-400 text-xs">Reports this week</p>
                    </div>
                </div>

                {/* Most Downloaded */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1 bg-indigo-500"></div>
                    <div className="p-3 bg-indigo-50 rounded-xl">
                        <TrendingUp size={24} className="text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Most Downloaded</p>
                        <h3 className="text-base font-bold text-slate-900">Weekly NPL Update</h3>
                        <p className="text-slate-400 text-xs">45 downloads</p>
                    </div>
                </div>

                {/* Data Freshness */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1 bg-green-500"></div>
                    <div className="p-3 bg-green-50 rounded-xl">
                        <RefreshCw size={24} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Data Freshness</p>
                        <h3 className="text-lg font-bold text-green-600 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Real-time
                        </h3>
                        <p className="text-slate-400 text-xs">Last sync: 2 mins ago</p>
                    </div>
                </div>
            </div>

            {/* Recent Reports History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Table Header */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Recently Generated</h3>
                        <p className="text-slate-500 text-xs mt-1">History of all generated and archived reports.</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search file..."
                                className="pl-8 pr-3 py-1.5 bg-slate-50 border-none rounded-lg text-xs focus:ring-1 focus:ring-blue-500 w-40 text-slate-600"
                            />
                        </div>
                        <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                            <Filter size={14} />
                            Filter
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Report Name</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Date Generated</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Requested By</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentReports.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                                    {/* Report Name */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <FileIcon type={report.fileType} />
                                            <span className="text-sm font-medium text-slate-900">{report.fileName}</span>
                                        </div>
                                    </td>
                                    {/* Type */}
                                    <td className="px-6 py-4 text-sm text-slate-600">{report.reportType}</td>
                                    {/* Date */}
                                    <td className="px-6 py-4 text-sm text-slate-600">{report.dateGenerated}</td>
                                    {/* Requested By */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={report.requestedBy.avatar}
                                                    alt={report.requestedBy.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span className="text-sm text-slate-700">{report.requestedBy.name}</span>
                                        </div>
                                    </td>
                                    {/* Status */}
                                    <td className="px-6 py-4 text-center">
                                        <StatusBadge status={report.status} />
                                    </td>
                                    {/* Action */}
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            className={`inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer ${report.status === 'ready'
                                                    ? 'text-blue-600 hover:text-blue-800'
                                                    : 'text-slate-400 cursor-not-allowed'
                                                }`}
                                            disabled={report.status !== 'ready'}
                                        >
                                            Download
                                            <Download size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer / Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
                    <span>Showing 1 to 6 of 128 reports</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer text-xs">
                            Previous
                        </button>
                        <button className="px-3 py-1.5 bg-[#0F172A] text-white rounded cursor-pointer text-xs">1</button>
                        <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer text-xs">
                            2
                        </button>
                        <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer text-xs">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-6 py-6 text-center text-xs text-slate-400">
                <p>© 2024 PT. WATU KOBU MULTINIAGA. All rights reserved. Reports Center.</p>
            </footer>
        </div>
    );
}

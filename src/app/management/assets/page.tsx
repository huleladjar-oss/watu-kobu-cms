'use client';

import {
    Search,
    Filter,
    Eye,
    Wallet,
    AlertTriangle,
    Clock,
    RefreshCw,
    Printer,
} from 'lucide-react';

// Types
interface Asset {
    id: string;
    debtorName: string;
    collateral: string;
    outstandingBalance: number;
    dpd: number;
    riskGrade: 'A' | 'B' | 'C' | 'D';
    lastAction: string;
}

// Dummy Data
const assets: Asset[] = [
    {
        id: 'WK-AST-2024-001',
        debtorName: 'Bambang Widodo',
        collateral: 'Sertifikat Rumah',
        outstandingBalance: 85400000,
        dpd: 0,
        riskGrade: 'A',
        lastAction: 'Payment received 3 days ago',
    },
    {
        id: 'WK-AST-2024-002',
        debtorName: 'Linda Kusuma',
        collateral: 'BPKB Mobil',
        outstandingBalance: 32150000,
        dpd: 25,
        riskGrade: 'B',
        lastAction: 'Visited 2 days ago',
    },
    {
        id: 'WK-AST-2024-003',
        debtorName: 'Hendra Setiawan',
        collateral: 'BPKB Motor',
        outstandingBalance: 15800000,
        dpd: 45,
        riskGrade: 'B',
        lastAction: 'Called yesterday',
    },
    {
        id: 'WK-AST-2024-004',
        debtorName: 'Sarah Johnson',
        collateral: 'Sertifikat Tanah',
        outstandingBalance: 112000000,
        dpd: 90,
        riskGrade: 'C',
        lastAction: 'Promise to pay Oct 30',
    },
    {
        id: 'WK-AST-2024-005',
        debtorName: 'Ahmad Fauzi',
        collateral: 'Deposito',
        outstandingBalance: 250000000,
        dpd: 120,
        riskGrade: 'D',
        lastAction: 'Visited 1 week ago',
    },
    {
        id: 'WK-AST-2024-006',
        debtorName: 'Ratna Dewi',
        collateral: 'BPKB Mobil',
        outstandingBalance: 45600000,
        dpd: 150,
        riskGrade: 'D',
        lastAction: 'Legal process initiated',
    },
    {
        id: 'WK-AST-2024-007',
        debtorName: 'Budi Prakoso',
        collateral: 'Sertifikat Rumah',
        outstandingBalance: 78500000,
        dpd: 15,
        riskGrade: 'A',
        lastAction: 'On schedule payment',
    },
];

// Format currency
function formatCurrency(value: number): string {
    if (value >= 1000000000) {
        return `Rp ${(value / 1000000000).toFixed(1)} M`;
    }
    if (value >= 1000000) {
        return `Rp ${(value / 1000000).toFixed(0)} jt`;
    }
    return `Rp ${value.toLocaleString('id-ID')}`;
}

// DPD Badge Component
function DPDBadge({ dpd }: { dpd: number }) {
    if (dpd === 0) {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                Current
            </span>
        );
    }
    if (dpd <= 30) {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                DPD {dpd}
            </span>
        );
    }
    if (dpd <= 60) {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                DPD {dpd}
            </span>
        );
    }
    if (dpd <= 90) {
        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                DPD {dpd}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            DPD {dpd}
        </span>
    );
}

// Risk Grade Badge Component
function RiskGradeBadge({ grade }: { grade: Asset['riskGrade'] }) {
    const config = {
        A: { bg: 'bg-green-500', text: 'text-white', label: 'Grade A' },
        B: { bg: 'bg-blue-500', text: 'text-white', label: 'Grade B' },
        C: { bg: 'bg-yellow-500', text: 'text-white', label: 'Grade C' },
        D: { bg: 'bg-red-500', text: 'text-white', label: 'Grade D' },
    };

    const { bg, text, label } = config[grade];

    return (
        <span className={`inline-flex items-center justify-center w-20 py-1.5 rounded-full text-xs font-bold ${bg} ${text}`}>
            {label}
        </span>
    );
}

export default function AssetPortfolioPage() {
    // Calculate aggregate stats
    const totalExposure = assets.reduce((sum, a) => sum + a.outstandingBalance, 0);
    const atRiskAssets = assets.filter((a) => a.dpd > 60);
    const atRiskValue = atRiskAssets.reduce((sum, a) => sum + a.outstandingBalance, 0);
    const avgDPD = Math.round(assets.reduce((sum, a) => sum + a.dpd, 0) / assets.length);

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Portfolio Health Analysis</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        NPL management and real-time portfolio tracking.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer">
                        <RefreshCw size={16} />
                        Refresh Data
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium shadow-md hover:bg-[#1e293b] cursor-pointer">
                        <Printer size={16} />
                        Print Report
                    </button>
                </div>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Exposure */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <Wallet size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Exposure</p>
                        <h3 className="text-2xl font-bold text-slate-900">Rp 15.2 M</h3>
                        <p className="text-slate-400 text-xs">Gross value across all assets</p>
                    </div>
                </div>

                {/* At Risk (NPL) */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1 bg-red-500"></div>
                    <div className="p-3 bg-red-50 rounded-xl">
                        <AlertTriangle size={24} className="text-red-600" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">At Risk (NPL)</p>
                        <h3 className="text-2xl font-bold text-red-600">Rp 4.5 M</h3>
                        <p className="text-red-400 text-xs">{atRiskAssets.length} assets overdue &gt;60 days</p>
                    </div>
                </div>

                {/* Avg. DPD */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-xl">
                        <Clock size={24} className="text-amber-600" />
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Avg. DPD</p>
                        <h3 className="text-2xl font-bold text-slate-900">{avgDPD} Days</h3>
                        <p className="text-slate-400 text-xs">Average days past due</p>
                    </div>
                </div>
            </div>

            {/* Advanced Filter Toolbar */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col lg:flex-row gap-4 items-end">
                    {/* Filters */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Risk Grade */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Risk Grade</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 py-2.5 px-3 cursor-pointer focus:ring-2 focus:ring-[#0F172A]">
                                <option>All Grades</option>
                                <option>Grade A (Low Risk)</option>
                                <option>Grade B (Medium)</option>
                                <option>Grade C (High)</option>
                                <option>Grade D (Critical)</option>
                            </select>
                        </div>

                        {/* Aging */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Aging (DPD)</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 py-2.5 px-3 cursor-pointer focus:ring-2 focus:ring-[#0F172A]">
                                <option>All</option>
                                <option>Current (0 Days)</option>
                                <option>1-30 Days</option>
                                <option>31-60 Days</option>
                                <option>61-90 Days</option>
                                <option>&gt;90 Days</option>
                            </select>
                        </div>

                        {/* Region */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Region</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 py-2.5 px-3 cursor-pointer focus:ring-2 focus:ring-[#0F172A]">
                                <option>All Regions</option>
                                <option>Jakarta</option>
                                <option>Bandung</option>
                                <option>Surabaya</option>
                                <option>Medan</option>
                            </select>
                        </div>

                        {/* Search */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Search</label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="ID or Debtor name..."
                                    className="w-full pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 py-2.5 focus:ring-2 focus:ring-[#0F172A]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 shrink-0">
                        <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                            Reset
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] cursor-pointer">
                            <Filter size={16} />
                            Apply Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Risk Analysis Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Table Header */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Risk Analysis Table</h3>
                        <p className="text-slate-500 text-xs mt-1">Showing {assets.length} assets sorted by risk level</p>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="table-auto w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Asset ID / Debtor</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Collateral</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-right">Outstanding Balance</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-center">Aging (DPD)</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-center">Risk Grade</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Last Action</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {assets.map((asset, index) => (
                                <tr
                                    key={asset.id}
                                    className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                                        }`}
                                >
                                    {/* Asset ID / Debtor */}
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-bold text-[#0F172A]">{asset.id}</p>
                                            <p className="text-xs text-slate-500">{asset.debtorName}</p>
                                        </div>
                                    </td>
                                    {/* Collateral */}
                                    <td className="px-6 py-4 text-sm text-slate-600">{asset.collateral}</td>
                                    {/* Outstanding Balance */}
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-bold text-slate-900">
                                            {formatCurrency(asset.outstandingBalance)}
                                        </span>
                                    </td>
                                    {/* Aging (DPD) */}
                                    <td className="px-6 py-4 text-center">
                                        <DPDBadge dpd={asset.dpd} />
                                    </td>
                                    {/* Risk Grade */}
                                    <td className="px-6 py-4 text-center">
                                        <RiskGradeBadge grade={asset.riskGrade} />
                                    </td>
                                    {/* Last Action */}
                                    <td className="px-6 py-4 text-sm text-slate-500">{asset.lastAction}</td>
                                    {/* Action */}
                                    <td className="px-6 py-4 text-center">
                                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer">
                                            <Eye size={14} />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer / Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
                    <span>Showing 1 to {assets.length} of {assets.length} assets</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer text-xs">
                            Previous
                        </button>
                        <button className="px-3 py-1.5 bg-[#0F172A] text-white rounded cursor-pointer text-xs">1</button>
                        <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer text-xs">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-6 py-6 text-center text-xs text-slate-400">
                <p>© 2024 PT. WATU KOBU MULTINIAGA. All rights reserved. Asset Portfolio Analysis.</p>
            </footer>
        </div>
    );
}

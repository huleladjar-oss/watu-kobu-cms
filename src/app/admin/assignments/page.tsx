'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Users, Wallet, AlertTriangle, X, Check, Filter, ChevronDown, UserPlus } from 'lucide-react';
import { useAssets, collectors, Asset } from '@/context/AssetContext';

// Format Rupiah
function formatRupiah(amount: number, compact: boolean = false): string {
    if (compact) {
        if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}M`;
        if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(0)}Jt`;
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// SPK Status Badge
function SPKBadge({ status }: { status: Asset['spkStatus'] }) {
    const styles = status === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500';
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles}`}>{status}</span>;
}

// Collector Card with Workload
function CollectorWorkloadCard({ collector, assets, isSelected, onClick, maxCases = 50 }: {
    collector: typeof collectors[0]; assets: Asset[]; isSelected: boolean; onClick: () => void; maxCases?: number
}) {
    const assignedAssets = assets.filter((a) => a.collectorId === collector.id);
    const currentLoad = assignedAssets.length;
    const totalValue = assignedAssets.reduce((sum, a) => sum + a.totalArrears, 0);
    const loadPercent = Math.min((currentLoad / maxCases) * 100, 100);
    const loadColor = loadPercent < 50 ? 'bg-green-500' : loadPercent < 80 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <button onClick={onClick} className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {collector.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{collector.name}</h4>
                    <p className="text-xs text-slate-500">{collector.area}</p>
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Kasus</span>
                    <span className="font-bold text-slate-900">{currentLoad} <span className="text-slate-400 font-normal">/ {maxCases}</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${loadColor} h-2 rounded-full transition-all`} style={{ width: `${loadPercent}%` }}></div>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Tagihan</span>
                    <span className="font-semibold text-red-600">{formatRupiah(totalValue, true)}</span>
                </div>
            </div>
            {isSelected && <div className="mt-3 pt-3 border-t border-blue-200 text-center"><span className="text-xs font-semibold text-blue-600 uppercase">✓ Selected</span></div>}
        </button>
    );
}

// Assignment Modal
function AssignmentModal({ selectedAssets, onClose, onConfirm, assets }: { selectedAssets: Asset[]; onClose: () => void; onConfirm: (collectorId: string) => void; assets: Asset[] }) {
    const [selectedCollector, setSelectedCollector] = useState<string | null>(null);
    const totalValue = selectedAssets.reduce((sum, a) => sum + a.totalArrears, 0);

    // Sort collectors by workload (lowest first = recommended)
    const sortedCollectors = useMemo(() => {
        return [...collectors].sort((a, b) => {
            const aLoad = assets.filter((asset) => asset.collectorId === a.id).length;
            const bLoad = assets.filter((asset) => asset.collectorId === b.id).length;
            return aLoad - bLoad;
        });
    }, [assets]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                    <div><h3 className="text-lg font-bold text-white">Assign ke Kolektor</h3><p className="text-blue-200 text-sm">{selectedAssets.length} debitur terpilih</p></div>
                    <button onClick={onClose} className="p-1 hover:bg-blue-500 rounded-full cursor-pointer"><X size={20} className="text-white" /></button>
                </div>
                <div className="p-4 bg-blue-50 border-b border-blue-100">
                    <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Total Nilai Tagihan</span>
                        <span className="font-bold text-blue-900">{formatRupiah(totalValue)}</span>
                    </div>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Pilih Kolektor (Diurutkan: Beban Terendah)</p>
                    <div className="space-y-2">
                        {sortedCollectors.map((collector, idx) => {
                            const load = assets.filter((a) => a.collectorId === collector.id).length;
                            return (
                                <button key={collector.id} onClick={() => setSelectedCollector(collector.id)} className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between ${selectedCollector === collector.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${selectedCollector === collector.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                            {collector.name.split(' ').map((n) => n[0]).join('')}
                                        </div>
                                        <div><p className="font-semibold text-slate-900">{collector.name}</p><p className="text-xs text-slate-500">{collector.area} • {load} kasus</p></div>
                                    </div>
                                    {idx === 0 && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Recommended</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="px-4 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg cursor-pointer">Batal</button>
                    <button onClick={() => selectedCollector && onConfirm(selectedCollector)} disabled={!selectedCollector} className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2">
                        <Check size={18} />Assign {selectedAssets.length} Debitur
                    </button>
                </div>
            </div>
        </div>
    );
}

// Toast
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
    return (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50">
            <Check size={20} /><p className="font-medium">{message}</p>
            <button onClick={onClose} className="ml-2 hover:bg-green-700 rounded-full p-1 cursor-pointer"><X size={16} /></button>
        </div>
    );
}

export default function AssignmentsPage() {
    const { assets, getUnassignedAssets, assignAsset, assignBulkAssets } = useAssets();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    // Filters
    const [branchFilter, setBranchFilter] = useState<string>('all');
    const [spkFilter, setSpkFilter] = useState<string>('all');
    const [minArrears, setMinArrears] = useState<number>(0);

    const unassignedAssets = getUnassignedAssets();

    // Get unique branches from data
    const branches = useMemo(() => {
        const branchSet = new Set(assets.map((a) => a.branch).filter(Boolean));
        return Array.from(branchSet).sort();
    }, [assets]);

    // Filtered unassigned assets
    const filteredAssets = useMemo(() => {
        return unassignedAssets.filter((asset) => {
            const matchesBranch = branchFilter === 'all' || asset.branch === branchFilter;
            const matchesSpk = spkFilter === 'all' || asset.spkStatus === spkFilter;
            const matchesArrears = asset.totalArrears >= minArrears;
            return matchesBranch && matchesSpk && matchesArrears;
        }).sort((a, b) => b.totalArrears - a.totalArrears);
    }, [unassignedAssets, branchFilter, spkFilter, minArrears]);

    // Stats
    const stats = useMemo(() => {
        const unassignedCount = unassignedAssets.length;
        const unassignedValue = unassignedAssets.reduce((sum, a) => sum + a.totalArrears, 0);
        const priorityCount = unassignedAssets.filter((a) => a.totalArrears > 100000000).length;
        return { unassignedCount, unassignedValue, priorityCount };
    }, [unassignedAssets]);

    const selectedAssets = filteredAssets.filter((a) => selectedIds.includes(a.id));
    const selectedValue = selectedAssets.reduce((sum, a) => sum + a.totalArrears, 0);
    const allSelected = filteredAssets.length > 0 && filteredAssets.every((a) => selectedIds.includes(a.id));

    const toggleSelect = (id: string) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
    const toggleSelectAll = () => setSelectedIds(allSelected ? [] : filteredAssets.map((a) => a.id));

    const handleAssign = (collectorId: string) => {
        if (selectedIds.length > 0) {
            assignBulkAssets(selectedIds, collectorId);
            const collector = collectors.find((c) => c.id === collectorId);
            setToast(`${selectedIds.length} debitur di-assign ke ${collector?.name}`);
            setSelectedIds([]);
            setShowModal(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleSingleAssign = (assetId: string) => {
        setSelectedIds([assetId]);
        setShowModal(true);
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6 text-slate-900">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <nav className="flex items-center text-sm font-medium text-slate-500">
                    <Link href="/admin/dashboard" className="hover:text-slate-700">Dashboard</Link>
                    <span className="mx-2 text-slate-400">/</span>
                    <span className="text-slate-900 font-semibold">Smart Dispatch</span>
                </nav>
                <h2 className="text-2xl font-bold text-slate-900">Assignment Center</h2>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-xl"><Users size={24} className="text-orange-600" /></div>
                    <div><p className="text-sm text-slate-500">Unassigned Cases</p><p className="text-2xl font-bold text-slate-900">{stats.unassignedCount}</p></div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-xl"><Wallet size={24} className="text-red-600" /></div>
                    <div><p className="text-sm text-slate-500">Unassigned Value</p><p className="text-2xl font-bold text-red-600">{formatRupiah(stats.unassignedValue, true)}</p></div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-xl"><AlertTriangle size={24} className="text-yellow-600" /></div>
                    <div><p className="text-sm text-slate-500">Priority Cases (&gt;100Jt)</p><p className="text-2xl font-bold text-yellow-600">{stats.priorityCount}</p></div>
                </div>
            </div>

            {/* Main Layout: Queue (70%) + Collectors (30%) */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Left Panel: The Queue */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Filter Toolbar */}
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex flex-wrap items-center gap-3">
                            <Filter size={16} className="text-slate-400" />
                            <div className="relative">
                                <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg cursor-pointer appearance-none bg-white">
                                    <option value="all">Semua Cabang</option>
                                    {branches.map((b) => <option key={b} value={b}>{b}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select value={spkFilter} onChange={(e) => setSpkFilter(e.target.value)} className="pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg cursor-pointer appearance-none bg-white">
                                    <option value="all">Semua SPK</option>
                                    <option value="AKTIF">AKTIF</option>
                                    <option value="PASIF">PASIF</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Min. Tunggakan:</span>
                                <input type="number" value={minArrears} onChange={(e) => setMinArrears(Number(e.target.value) || 0)} placeholder="0" className="w-28 px-3 py-2 text-sm border border-slate-300 rounded-lg" />
                            </div>
                            <div className="ml-auto text-sm text-slate-500">{filteredAssets.length} hasil</div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr className="border-b border-slate-200">
                                    <th className="px-3 py-3 w-10"><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-blue-600 cursor-pointer" /></th>
                                    <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Account</th>
                                    <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Debitur</th>
                                    <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase text-center">SPK</th>
                                    <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Tagihan</th>
                                    <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase text-center w-20">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAssets.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Tidak ada data unassigned</td></tr>
                                ) : filteredAssets.map((asset) => (
                                    <tr key={asset.id} className={`hover:bg-slate-50 ${selectedIds.includes(asset.id) ? 'bg-blue-50' : ''}`}>
                                        <td className="px-3 py-2.5"><input type="checkbox" checked={selectedIds.includes(asset.id)} onChange={() => toggleSelect(asset.id)} className="w-4 h-4 accent-blue-600 cursor-pointer" /></td>
                                        <td className="px-3 py-2.5 font-mono text-slate-600">{asset.loanId}</td>
                                        <td className="px-3 py-2.5"><p className="font-medium text-slate-900">{asset.debtorName}</p><p className="text-xs text-slate-400">{asset.branch || '-'}</p></td>
                                        <td className="px-3 py-2.5 text-center"><SPKBadge status={asset.spkStatus} /></td>
                                        <td className="px-3 py-2.5 text-right font-bold text-red-600">{formatRupiah(asset.totalArrears, true)}</td>
                                        <td className="px-3 py-2.5 text-center">
                                            <button onClick={() => handleSingleAssign(asset.id)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer" title="Assign"><UserPlus size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Panel: Collector Workload */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 sticky top-4">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Collector Availability</h3>
                        <div className="space-y-3">
                            {collectors.map((collector) => (
                                <CollectorWorkloadCard
                                    key={collector.id}
                                    collector={collector}
                                    assets={assets}
                                    isSelected={false}
                                    onClick={() => { }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 z-40">
                    <span className="font-medium">{selectedIds.length} Debitur Terpilih</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-sm text-slate-300">Total: {formatRupiah(selectedValue, true)}</span>
                    <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-slate-300 hover:text-white cursor-pointer">Cancel</button>
                    <button onClick={() => setShowModal(true)} className="px-4 py-1.5 bg-blue-600 rounded-lg font-semibold cursor-pointer flex items-center gap-2 hover:bg-blue-500">
                        <UserPlus size={16} />Assign to Collector
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && selectedAssets.length > 0 && <AssignmentModal selectedAssets={selectedAssets} onClose={() => { setShowModal(false); setSelectedIds([]); }} onConfirm={handleAssign} assets={assets} />}

            {/* Toast */}
            {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        </div>
    );
}

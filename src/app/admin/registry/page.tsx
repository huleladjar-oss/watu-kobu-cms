'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2, X, Check, AlertTriangle, Filter, Upload, FileSpreadsheet, Loader2, Eye } from 'lucide-react';
import { useAssets, Asset } from '@/context/AssetContext';

// Format Rupiah
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// SPK Status options
const spkStatusOptions: Asset['spkStatus'][] = ['AKTIF', 'PASIF'];

// Branch options
const branchOptions = ['KCP JAKARTA SELATAN', 'KCP JAKARTA BARAT', 'KCP JAKARTA TIMUR', 'KCP JAKARTA UTARA', 'KCP JAKARTA PUSAT', 'KCP BOGOR', 'KCP DEPOK', 'KCP TANGERANG', 'KCP BEKASI'];

// Credit type options
const creditTypeOptions = ['KPR', 'KMK', 'KUR', 'KI', 'KUPEDES'];

// SPK Status badge styles
const spkStatusStyles: Record<Asset['spkStatus'], string> = {
    'AKTIF': 'bg-green-100 text-green-700 border-green-200',
    'PASIF': 'bg-slate-100 text-slate-600 border-slate-200',
};

// ============================================
// BANK CSV PARSER (24 Columns)
// ============================================

interface BankColumnMapping {
    loanId: string | null; debtorName: string | null; identityAddress: string | null; officeAddress: string | null;
    phone: string | null; phone2: string | null; officePhone: string | null; emergencyName: string | null; emergencyPhone: string | null;
    branch: string | null; region: string | null; spkStatus: string | null; creditType: string | null; collateralAddress: string | null;
    initialPlafond: string | null; realizationDate: string | null; maturityDate: string | null; principalBalance: string | null;
    interestArrears: string | null; penaltyArrears: string | null; totalArrears: string | null; totalPayoff: string | null;
}

const BANK_HEADER_MAPPINGS: Record<keyof BankColumnMapping, string[]> = {
    loanId: ['ACCTNO', 'ACC', 'NO REK', 'NOREK', 'ACCOUNT'],
    debtorName: ['NAMA DEBITUR', 'NAMA_DEBITUR', 'NAMA', 'DEBITUR'],
    identityAddress: ['ALAMAT_DEV', 'ALAMAT KTP', 'ALAMAT DEBITUR', 'ALAMAT'],
    officeAddress: ['ALAMAT_KANTOR', 'ALAMAT KANTOR'],
    phone: ['HP1', 'NO HP', 'TELEPON', 'HP'],
    phone2: ['HP2', 'HP 2'],
    officePhone: ['TELP_KANTOR', 'TELEPON KANTOR'],
    emergencyName: ['NAMA_DARURAT', 'NAMA DARURAT', 'EMERGENCY'],
    emergencyPhone: ['HP_DARURAT', 'DARURAT', 'TELEPON DARURAT'],
    branch: ['CABANG', 'BRANCH', 'KC'],
    region: ['ARCOLL', 'KANWIL', 'REGION'],
    spkStatus: ['KELOLAAN', 'STATUS', 'STATUS SPK'],
    creditType: ['JENIS_KREDIT01', 'JENIS KREDIT', 'KREDIT'],
    collateralAddress: ['ALAMAT_AGUNAN', 'ALAMAT AGUNAN'],
    initialPlafond: ['PLAFON', 'PLAFOND', 'PLAFOND AWAL'],
    realizationDate: ['TGL_REALISASI', 'TANGGAL REALISASI'],
    maturityDate: ['TGL_JT', 'JATUH TEMPO'],
    principalBalance: ['SALDO POKOK', 'CBAL', 'OS_POKOK'],
    interestArrears: ['TGK_BUNGA01', 'TUNGGAKAN BUNGA'],
    penaltyArrears: ['TGK_DENDA01', 'TUNGGAKAN DENDA'],
    totalArrears: ['TOTAL_TGK', 'TOTAL TUNGGAKAN'],
    totalPayoff: ['LUNAS_KREDIT', 'TOTAL LUNAS'],
};

function parseAmount(value: string): number {
    if (!value) return 0;
    const cleaned = value.replace(/[Rp\s.,]/gi, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

function generateAssetId(): string {
    return `WK-${Math.floor(1000 + Math.random() * 9000)}`;
}

function findColumn(headers: string[], possibleNames: string[]): string | null {
    const normalizedHeaders = headers.map((h) => h.toUpperCase().trim());
    for (const name of possibleNames) {
        const index = normalizedHeaders.findIndex((h) => h.includes(name.toUpperCase()));
        if (index !== -1) return headers[index];
    }
    return null;
}

function parseCSV(content: string): { headers: string[]; rows: Record<string, string>[] } {
    const lines = content.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };
    const delimiter = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(delimiter).map((h) => h.replace(/"/g, '').trim());
    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map((v) => v.replace(/"/g, '').trim());
        if (values.length >= headers.length / 2) {
            const row: Record<string, string> = {};
            headers.forEach((header, index) => { row[header] = values[index] || ''; });
            rows.push(row);
        }
    }
    return { headers, rows };
}

function convertBankRowsToAssets(rows: Record<string, string>[], mapping: BankColumnMapping): Asset[] {
    return rows.filter((row) => {
        const hasId = mapping.loanId && row[mapping.loanId]?.trim();
        const hasName = mapping.debtorName && row[mapping.debtorName]?.trim();
        return hasId || hasName;
    }).map((row) => {
        const phone1 = mapping.phone ? row[mapping.phone] || '' : '';
        const phone2 = mapping.phone2 ? row[mapping.phone2] || '' : '';
        const combinedPhone = [phone1, phone2].filter(Boolean).join(' / ');
        const spkRaw = mapping.spkStatus ? row[mapping.spkStatus]?.toUpperCase() || '' : '';
        const spkStatus: Asset['spkStatus'] = spkRaw.includes('AKTIF') ? 'AKTIF' : 'PASIF';

        return {
            id: generateAssetId(),
            loanId: mapping.loanId ? row[mapping.loanId] || '' : '',
            debtorName: mapping.debtorName ? row[mapping.debtorName] || '' : 'Unknown',
            identityAddress: mapping.identityAddress ? row[mapping.identityAddress] || '' : '',
            officeAddress: mapping.officeAddress ? row[mapping.officeAddress] || '' : '',
            phone: combinedPhone,
            officePhone: mapping.officePhone ? row[mapping.officePhone] || '' : '',
            emergencyName: mapping.emergencyName ? row[mapping.emergencyName] || '' : '',
            emergencyPhone: mapping.emergencyPhone ? row[mapping.emergencyPhone] || '' : '',
            emergencyAddress: '',
            branch: mapping.branch ? row[mapping.branch] || '' : '',
            region: mapping.region ? row[mapping.region] || '' : '',
            spkStatus,
            creditType: mapping.creditType ? row[mapping.creditType] || '' : '',
            collateralAddress: mapping.collateralAddress ? row[mapping.collateralAddress] || '' : '',
            initialPlafond: mapping.initialPlafond ? parseAmount(row[mapping.initialPlafond]) : 0,
            realizationDate: mapping.realizationDate ? row[mapping.realizationDate] || '' : '',
            maturityDate: mapping.maturityDate ? row[mapping.maturityDate] || '' : '',
            principalBalance: mapping.principalBalance ? parseAmount(row[mapping.principalBalance]) : 0,
            interestArrears: mapping.interestArrears ? parseAmount(row[mapping.interestArrears]) : 0,
            penaltyArrears: mapping.penaltyArrears ? parseAmount(row[mapping.penaltyArrears]) : 0,
            principalArrears: 0,
            totalArrears: mapping.totalArrears ? parseAmount(row[mapping.totalArrears]) : 0,
            totalPayoff: mapping.totalPayoff ? parseAmount(row[mapping.totalPayoff]) : 0,
            collectorId: null,
            lastUpdate: new Date().toISOString().split('T')[0],
        };
    });
}

// ============================================
// DETAIL MODAL COMPONENT
// ============================================

function AssetDetailModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-slate-800 px-6 py-4 flex items-center justify-between sticky top-0">
                    <div>
                        <h3 className="text-lg font-bold text-white">{asset.debtorName}</h3>
                        <p className="text-slate-300 text-sm">Account: {asset.loanId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors cursor-pointer">
                        <X size={20} className="text-white" />
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Debtor Info */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <h4 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wide">Identitas Debitur</h4>
                        <div className="space-y-2 text-sm">
                            <div><span className="text-slate-500">Nama:</span> <span className="font-medium text-slate-900">{asset.debtorName}</span></div>
                            <div><span className="text-slate-500">Alamat KTP:</span> <span className="text-slate-700">{asset.identityAddress || '-'}</span></div>
                            <div><span className="text-slate-500">Telepon:</span> <span className="text-slate-700">{asset.phone || '-'}</span></div>
                            <div><span className="text-slate-500">Alamat Kantor:</span> <span className="text-slate-700">{asset.officeAddress || '-'}</span></div>
                        </div>
                    </div>
                    {/* Credit Info */}
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <h4 className="text-sm font-bold text-green-800 mb-3 uppercase tracking-wide">Data Kredit</h4>
                        <div className="space-y-2 text-sm">
                            <div><span className="text-slate-500">Cabang:</span> <span className="font-medium text-slate-900">{asset.branch || '-'}</span></div>
                            <div><span className="text-slate-500">Kanwil:</span> <span className="text-slate-700">{asset.region || '-'}</span></div>
                            <div><span className="text-slate-500">Jenis Kredit:</span> <span className="text-slate-700">{asset.creditType || '-'}</span></div>
                            <div><span className="text-slate-500">Status SPK:</span> <span className={`px-2 py-0.5 rounded text-xs font-semibold ${spkStatusStyles[asset.spkStatus]}`}>{asset.spkStatus}</span></div>
                            <div><span className="text-slate-500">Tgl Realisasi:</span> <span className="text-slate-700">{asset.realizationDate || '-'}</span></div>
                            <div><span className="text-slate-500">Jatuh Tempo:</span> <span className="text-slate-700">{asset.maturityDate || '-'}</span></div>
                        </div>
                    </div>
                    {/* Financials */}
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <h4 className="text-sm font-bold text-amber-800 mb-3 uppercase tracking-wide">Data Finansial</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Plafond Awal:</span> <span className="font-bold text-slate-900">{formatRupiah(asset.initialPlafond)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Saldo Pokok:</span> <span className="font-medium text-slate-700">{formatRupiah(asset.principalBalance)}</span></div>
                            <hr className="border-amber-200" />
                            <div className="flex justify-between"><span className="text-slate-500">Tunggakan Bunga:</span> <span className="text-red-600">{formatRupiah(asset.interestArrears)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Tunggakan Denda:</span> <span className="text-red-600">{formatRupiah(asset.penaltyArrears)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Tunggakan Pokok:</span> <span className="text-red-600">{formatRupiah(asset.principalArrears)}</span></div>
                            <hr className="border-amber-200" />
                            <div className="flex justify-between"><span className="text-slate-600 font-semibold">TOTAL TUNGGAKAN:</span> <span className="font-bold text-red-700 text-lg">{formatRupiah(asset.totalArrears)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Lunas Kredit:</span> <span className="font-medium text-slate-700">{formatRupiah(asset.totalPayoff)}</span></div>
                        </div>
                    </div>
                    {/* Emergency Contact */}
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                        <h4 className="text-sm font-bold text-red-800 mb-3 uppercase tracking-wide">Kontak Darurat</h4>
                        <div className="space-y-2 text-sm">
                            <div><span className="text-slate-500">Nama:</span> <span className="font-medium text-slate-900">{asset.emergencyName || '-'}</span></div>
                            <div><span className="text-slate-500">Telepon:</span> <span className="text-slate-700">{asset.emergencyPhone || '-'}</span></div>
                            <div><span className="text-slate-500">Alamat:</span> <span className="text-slate-700">{asset.emergencyAddress || '-'}</span></div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-red-200">
                            <h5 className="text-xs font-semibold text-slate-500 mb-2">ALAMAT AGUNAN</h5>
                            <p className={`text-sm ${asset.collateralAddress === 'Kredit Tanpa Agunan' ? 'text-slate-500 italic' : 'text-slate-700'}`}>
                                {asset.collateralAddress || '-'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// CSV IMPORT MODAL
// ============================================

function CSVImportModal({ onClose, onImport }: { onClose: () => void; onImport: (assets: Asset[]) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [parsedData, setParsedData] = useState<{ assets: Asset[]; originalRowCount: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsProcessing(true); setError(null); setParsedData(null);
        try {
            const content = await file.text();
            const { headers, rows } = parseCSV(content);
            if (rows.length === 0) throw new Error('File tidak mengandung data.');
            const mapping: BankColumnMapping = {
                loanId: findColumn(headers, BANK_HEADER_MAPPINGS.loanId),
                debtorName: findColumn(headers, BANK_HEADER_MAPPINGS.debtorName),
                identityAddress: findColumn(headers, BANK_HEADER_MAPPINGS.identityAddress),
                officeAddress: findColumn(headers, BANK_HEADER_MAPPINGS.officeAddress),
                phone: findColumn(headers, BANK_HEADER_MAPPINGS.phone),
                phone2: findColumn(headers, BANK_HEADER_MAPPINGS.phone2),
                officePhone: findColumn(headers, BANK_HEADER_MAPPINGS.officePhone),
                emergencyName: findColumn(headers, BANK_HEADER_MAPPINGS.emergencyName),
                emergencyPhone: findColumn(headers, BANK_HEADER_MAPPINGS.emergencyPhone),
                branch: findColumn(headers, BANK_HEADER_MAPPINGS.branch),
                region: findColumn(headers, BANK_HEADER_MAPPINGS.region),
                spkStatus: findColumn(headers, BANK_HEADER_MAPPINGS.spkStatus),
                creditType: findColumn(headers, BANK_HEADER_MAPPINGS.creditType),
                collateralAddress: findColumn(headers, BANK_HEADER_MAPPINGS.collateralAddress),
                initialPlafond: findColumn(headers, BANK_HEADER_MAPPINGS.initialPlafond),
                realizationDate: findColumn(headers, BANK_HEADER_MAPPINGS.realizationDate),
                maturityDate: findColumn(headers, BANK_HEADER_MAPPINGS.maturityDate),
                principalBalance: findColumn(headers, BANK_HEADER_MAPPINGS.principalBalance),
                interestArrears: findColumn(headers, BANK_HEADER_MAPPINGS.interestArrears),
                penaltyArrears: findColumn(headers, BANK_HEADER_MAPPINGS.penaltyArrears),
                totalArrears: findColumn(headers, BANK_HEADER_MAPPINGS.totalArrears),
                totalPayoff: findColumn(headers, BANK_HEADER_MAPPINGS.totalPayoff),
            };
            if (!mapping.debtorName && !mapping.loanId) throw new Error('Tidak dapat menemukan kolom NAMA atau ACCTNO.');
            const assets = convertBankRowsToAssets(rows, mapping);
            if (assets.length === 0) throw new Error('Tidak ada data valid.');
            setParsedData({ assets, originalRowCount: rows.length });
        } catch (err) { setError(err instanceof Error ? err.message : 'Gagal memproses file'); }
        finally { setIsProcessing(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg"><FileSpreadsheet size={24} className="text-blue-600" /></div>
                        <div><h3 className="text-lg font-bold text-slate-900">Import CSV Bank</h3><p className="text-sm text-slate-500">Format: Lampiran SPK WATUKOBU</p></div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full cursor-pointer"><X size={20} className="text-slate-500" /></button>
                </div>
                <div className="p-6">
                    {!parsedData ? (
                        <>
                            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 cursor-pointer">
                                {isProcessing ? <Loader2 size={40} className="text-blue-600 animate-spin mx-auto" /> : <><Upload size={40} className="text-slate-400 mx-auto mb-3" /><p className="text-slate-700 font-medium">Klik untuk upload file CSV</p></>}
                            </div>
                            <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileSelect} className="hidden" />
                            {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"><AlertTriangle size={18} className="text-red-600" /><p className="text-red-700 text-sm">{error}</p></div>}
                        </>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-3"><Check size={24} className="text-green-600" /><div><p className="text-green-800 font-bold">Ditemukan {parsedData.assets.length} data aset</p><p className="text-green-700 text-sm">dari {parsedData.originalRowCount} baris</p></div></div>
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 cursor-pointer">Batal</button>
                    {parsedData && <button onClick={() => onImport(parsedData.assets)} className="flex-1 px-4 py-2.5 bg-[#137fec] text-white font-semibold rounded-lg hover:bg-blue-600 cursor-pointer flex items-center justify-center gap-2"><Upload size={18} />Import {parsedData.assets.length} Aset</button>}
                </div>
            </div>
        </div>
    );
}

// Toast Component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    return (
        <div className={`fixed bottom-6 right-6 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50`}>
            {type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
            <p className="font-medium">{message}</p>
            <button onClick={onClose} className="ml-2 hover:opacity-80 cursor-pointer"><X size={16} /></button>
        </div>
    );
}

// ============================================
// MAIN PAGE
// ============================================

export default function RegistryPage() {
    const { assets, addAsset, importAssets, updateAsset, deleteAsset, deleteBulkAssets } = useAssets();
    const [searchQuery, setSearchQuery] = useState('');
    const [spkFilter, setSpkFilter] = useState<Asset['spkStatus'] | 'all'>('all');
    const [showImportModal, setShowImportModal] = useState(false);
    const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
    const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const filteredAssets = useMemo(() => {
        return assets.filter((asset) => {
            const matchesSearch = searchQuery === '' || asset.debtorName.toLowerCase().includes(searchQuery.toLowerCase()) || asset.loanId.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = spkFilter === 'all' || asset.spkStatus === spkFilter;
            return matchesSearch && matchesStatus;
        });
    }, [assets, searchQuery, spkFilter]);

    const handleDeleteAsset = async () => { if (deletingAsset) { await deleteAsset(deletingAsset.id); showToast(`Asset ${deletingAsset.id} dihapus`, 'success'); setDeletingAsset(null); } };
    const handleImportAssets = async (newAssets: Asset[]) => { const count = await importAssets(newAssets); setShowImportModal(false); showToast(count > 0 ? `${count} aset diimport` : 'Semua data duplikat', count > 0 ? 'success' : 'error'); };
    const handleBulkDelete = async () => { if (selectedIds.length > 0 && window.confirm(`Hapus ${selectedIds.length} aset?`)) { await deleteBulkAssets(selectedIds); showToast(`${selectedIds.length} aset dihapus`, 'success'); setSelectedIds([]); } };
    const toggleSelectAsset = (id: string) => { setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]); };
    const toggleSelectAll = () => { const ids = filteredAssets.map((a) => a.id); setSelectedIds((prev) => ids.every((id) => prev.includes(id)) ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]); };
    const showToast = (message: string, type: 'success' | 'error') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };
    const allSelected = filteredAssets.length > 0 && filteredAssets.every((a) => selectedIds.includes(a.id));

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6 text-slate-900">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <nav className="flex items-center text-sm font-medium text-slate-500"><Link href="/admin/dashboard" className="hover:text-slate-700">Dashboard</Link><span className="mx-2 text-slate-400">/</span><span className="text-slate-900 font-semibold">Asset Registry</span></nav>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h2 className="text-2xl font-bold text-slate-900">Master Asset Database</h2>
                    <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#137fec] text-white font-semibold rounded-lg hover:bg-blue-600 cursor-pointer shadow-md"><Upload size={18} />Import CSV</button>
                </div>
            </div>
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Cari nama atau no rekening..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-slate-900" /></div>
                    <div className="flex items-center gap-2"><Filter size={18} className="text-slate-400" /><select value={spkFilter} onChange={(e) => setSpkFilter(e.target.value as Asset['spkStatus'] | 'all')} className="px-4 py-2.5 border border-slate-300 rounded-lg cursor-pointer"><option value="all">Semua Status</option>{spkStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                </div>
                <div className="mt-3 text-sm text-slate-500">Menampilkan <strong>{filteredAssets.length}</strong> dari <strong>{assets.length}</strong> aset</div>
            </div>
            {/* Compact Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead><tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-4 w-12"><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-blue-600 cursor-pointer" /></th>
                            <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Account No</th>
                            <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Nama Debitur</th>
                            <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Cabang</th>
                            <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Total Tunggakan</th>
                            <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Status SPK</th>
                            <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredAssets.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500"><Search size={40} className="text-slate-300 mx-auto mb-2" /><p>Tidak ada data</p></td></tr>
                            ) : filteredAssets.map((asset) => (
                                <tr key={asset.id} className={`hover:bg-slate-50 ${selectedIds.includes(asset.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(asset.id)} onChange={() => toggleSelectAsset(asset.id)} className="w-4 h-4 accent-blue-600 cursor-pointer" /></td>
                                    <td className="px-4 py-3 font-mono text-sm text-slate-600">{asset.loanId}</td>
                                    <td className="px-4 py-3"><p className="font-medium text-slate-900">{asset.debtorName}</p></td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{asset.branch || '-'}</td>
                                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatRupiah(asset.totalArrears)}</td>
                                    <td className="px-4 py-3 text-center"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${spkStatusStyles[asset.spkStatus]}`}>{asset.spkStatus}</span></td>
                                    <td className="px-4 py-3"><div className="flex items-center justify-center gap-1">
                                        <button onClick={() => setViewingAsset(asset)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer" title="View"><Eye size={18} /></button>
                                        <button onClick={() => setDeletingAsset(asset)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer" title="Delete"><Trash2 size={18} /></button>
                                    </div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modals */}
            {showImportModal && <CSVImportModal onClose={() => setShowImportModal(false)} onImport={handleImportAssets} />}
            {viewingAsset && <AssetDetailModal asset={viewingAsset} onClose={() => setViewingAsset(null)} />}
            {deletingAsset && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} className="text-red-600" /></div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Asset?</h3>
                        <p className="text-slate-600 mb-6">Asset <strong>{deletingAsset.id}</strong> - {deletingAsset.debtorName}</p>
                        <div className="flex gap-3"><button onClick={() => setDeletingAsset(null)} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg font-semibold cursor-pointer">Batal</button><button onClick={handleDeleteAsset} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold cursor-pointer">Hapus</button></div>
                    </div>
                </div>
            )}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 z-40">
                    <span className="font-medium">{selectedIds.length} Asset{selectedIds.length > 1 ? 's' : ''} Selected</span>
                    <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-slate-300 hover:text-white cursor-pointer">Cancel</button>
                    <button onClick={handleBulkDelete} className="px-4 py-1.5 bg-red-600 rounded-lg font-semibold cursor-pointer flex items-center gap-2"><Trash2 size={16} />Delete</button>
                </div>
            )}
        </div>
    );
}

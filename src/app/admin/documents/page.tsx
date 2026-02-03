'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FileText, Upload, FileSignature, Download, Trash2, X, CheckCircle, Filter, ChevronDown, FileImage, Search, ChevronRight } from 'lucide-react';
import { useDocuments, Document, DocumentType } from '@/context/DocumentContext';
import { useAssets, Asset } from '@/context/AssetContext';
import { useValidation } from '@/context/ValidationContext';

// Format Rupiah
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// Format date
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// File type badge
function TypeBadge({ type }: { type: DocumentType }) {
    const styles: Record<DocumentType, string> = {
        'SPK': 'bg-blue-100 text-blue-700 border-blue-200',
        'SOMASI': 'bg-red-100 text-red-700 border-red-200',
        'COLLATERAL': 'bg-green-100 text-green-700 border-green-200',
        'OTHERS': 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${styles[type]}`}>{type}</span>;
}

// File icon
function FileIcon({ filename }: { filename: string }) {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <FileImage size={20} className="text-blue-500" />;
    return <FileText size={20} className="text-red-500" />;
}

// Toast
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
    return (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50">
            <CheckCircle size={20} /><p className="font-medium">{message}</p>
            <button onClick={onClose} className="ml-2 hover:opacity-80 cursor-pointer"><X size={16} /></button>
        </div>
    );
}

// Upload Modal
function UploadModal({ onClose, onUpload }: { onClose: () => void; onUpload: (doc: Omit<Document, 'id'>) => void }) {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<DocumentType>('OTHERS');
    const [debtor, setDebtor] = useState('');

    const handleSubmit = () => {
        if (!title) return;
        onUpload({
            title: title.endsWith('.pdf') ? title : `${title}.pdf`,
            type,
            relatedDebtor: debtor || null,
            uploadDate: new Date().toISOString().split('T')[0],
            fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
            url: `/documents/${title.toLowerCase().replace(/\s/g, '-')}.pdf`,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Upload Document</h3>
                    <button onClick={onClose} className="p-1 hover:bg-blue-500 rounded-full cursor-pointer"><X size={20} className="text-white" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div><label className="block text-sm font-semibold text-slate-700 mb-1">File Name</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nama file..." className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" /></div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Document Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value as DocumentType)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg cursor-pointer">
                            <option value="SPK">SPK (Surat Perintah Kerja)</option>
                            <option value="SOMASI">SOMASI</option>
                            <option value="COLLATERAL">COLLATERAL (Agunan)</option>
                            <option value="OTHERS">OTHERS</option>
                        </select>
                    </div>
                    <div><label className="block text-sm font-semibold text-slate-700 mb-1">Related Debtor (Optional)</label><input type="text" value={debtor} onChange={(e) => setDebtor(e.target.value)} placeholder="Nama Debitur..." className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" /></div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg font-semibold cursor-pointer">Batal</button>
                    <button onClick={handleSubmit} disabled={!title} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer disabled:bg-slate-300">Upload</button>
                </div>
            </div>
        </div>
    );
}

// Letter Generator Component
function LetterGenerator({ onGenerate }: { onGenerate: (doc: Omit<Document, 'id'>) => void }) {
    const { assets } = useAssets();
    const [step, setStep] = useState(1);
    const [letterType, setLetterType] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAssets = useMemo(() => {
        if (!searchQuery) return assets.slice(0, 10);
        return assets.filter((a) => a.debtorName.toLowerCase().includes(searchQuery.toLowerCase()) || a.loanId.includes(searchQuery)).slice(0, 10);
    }, [assets, searchQuery]);

    const letterTypes = [
        { value: 'surat_tugas', label: 'Surat Tugas Penagihan' },
        { value: 'somasi_1', label: 'Somasi Ke-1 (Peringatan Pertama)' },
        { value: 'somasi_2', label: 'Somasi Ke-2 (Peringatan Kedua)' },
        { value: 'somasi_3', label: 'Somasi Ke-3 (Peringatan Terakhir)' },
    ];

    const handleGenerate = () => {
        if (!selectedAsset || !letterType) return;

        // Open print view in new tab
        const printUrl = `/admin/documents/print/letter?type=${letterType}&assetId=${selectedAsset.id}`;
        window.open(printUrl, '_blank');

        // Reset form
        setStep(1);
        setLetterType('');
        setSelectedAsset(null);
        setSearchQuery('');

        // Show feedback
        onGenerate({
            title: `Surat_${letterType}_${selectedAsset.debtorName.replace(/\s/g, '_')}.pdf`,
            type: 'SOMASI',
            relatedDebtor: `${selectedAsset.debtorName} (${selectedAsset.loanId})`,
            uploadDate: new Date().toISOString().split('T')[0],
            fileSize: 'Print Preview',
            url: printUrl,
        });
    };

    const canProceed = () => {
        if (step === 1) return !!letterType;
        if (step === 2) return !!selectedAsset;
        if (step === 3) return true;
        return false;
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Letter Generator Wizard</h3>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
                        {s < 4 && <ChevronRight size={16} className="text-slate-300" />}
                    </div>
                ))}
                <span className="text-sm text-slate-500 ml-2">
                    {step === 1 && 'Pilih Jenis Surat'}
                    {step === 2 && 'Pilih Debitur'}
                    {step === 3 && 'Preview Data'}
                    {step === 4 && 'Generate'}
                </span>
            </div>

            {/* Step 1: Select Letter Type */}
            {step === 1 && (
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Jenis Surat:</label>
                    {letterTypes.map((lt) => (
                        <button key={lt.value} onClick={() => setLetterType(lt.value)} className={`w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${letterType === lt.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                            <p className="font-semibold text-slate-900">{lt.label}</p>
                        </button>
                    ))}
                </div>
            )}

            {/* Step 2: Search Debtor */}
            {step === 2 && (
                <div className="space-y-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama debitur atau no rekening..." className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg" />
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredAssets.map((asset) => (
                            <button key={asset.id} onClick={() => setSelectedAsset(asset)} className={`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer ${selectedAsset?.id === asset.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                <p className="font-semibold text-slate-900">{asset.debtorName}</p>
                                <p className="text-xs text-slate-500 font-mono">{asset.loanId} • {asset.branch}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Preview Data */}
            {step === 3 && selectedAsset && (
                <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 uppercase">Preview Data Surat</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-slate-500">Jenis Surat</p><p className="font-semibold text-slate-900">{letterTypes.find((t) => t.value === letterType)?.label}</p></div>
                        <div><p className="text-slate-500">Nama Debitur</p><p className="font-semibold text-slate-900">{selectedAsset.debtorName}</p></div>
                        <div><p className="text-slate-500">No Rekening</p><p className="font-mono font-semibold text-slate-900">{selectedAsset.loanId}</p></div>
                        <div><p className="text-slate-500">Cabang</p><p className="font-semibold text-slate-900">{selectedAsset.branch}</p></div>
                        <div><p className="text-slate-500">Total Tunggakan</p><p className="font-bold text-red-600">{formatRupiah(selectedAsset.totalArrears)}</p></div>
                        <div><p className="text-slate-500">Alamat</p><p className="font-semibold text-slate-900 text-xs">{selectedAsset.identityAddress || '-'}</p></div>
                    </div>
                </div>
            )}

            {/* Step 4: Generate */}
            {step === 4 && (
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><FileSignature size={40} className="text-green-600" /></div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Siap Cetak!</h4>
                    <p className="text-slate-500 mb-6">Klik tombol di bawah untuk membuka tampilan cetak surat</p>
                    <button onClick={handleGenerate} className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 cursor-pointer">Print Preview / Save as PDF</button>
                </div>
            )}

            {/* Navigation */}
            {step < 4 && (
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                    <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="px-6 py-2.5 border border-slate-300 rounded-lg font-semibold cursor-pointer disabled:opacity-50">Back</button>
                    <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer disabled:bg-slate-300">Next</button>
                </div>
            )}
        </div>
    );
}

export default function DocumentsPage() {
    const { documents, addDocument, deleteDocument, getTotalCount, getTotalSize, generateCSV, generateWeeklyPDF, generateBankCSV, addToRepository } = useDocuments();
    const { fieldReports } = useValidation();
    const { assets } = useAssets();
    const [activeTab, setActiveTab] = useState<'repository' | 'generator' | 'reporting'>('repository');
    const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
    const [showUpload, setShowUpload] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredDocs = useMemo(() => {
        if (typeFilter === 'all') return documents;
        return documents.filter((d) => d.type === typeFilter);
    }, [documents, typeFilter]);

    const handleUpload = (doc: Omit<Document, 'id'>) => {
        addDocument(doc);
        setToast('Document uploaded successfully!');
        setTimeout(() => setToast(null), 3000);
    };

    const handleGenerate = (doc: Omit<Document, 'id'>) => {
        addDocument(doc);
        setToast('Membuka Print Preview... Silakan pilih "Save as PDF"');
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this document?')) {
            deleteDocument(id);
            setToast('Document deleted');
            setTimeout(() => setToast(null), 3000);
        }
    };

    // Filter approved field visit reports by date range
    const filteredReports = useMemo(() => {
        if (!startDate || !endDate) return [];
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime() + 86400000; // Add 1 day to include end date
        return fieldReports.filter((r) => {
            if (r.status !== 'Approved') return false;
            const submitTime = new Date(r.submissionDate).getTime();
            return submitTime >= start && submitTime < end;
        });
    }, [fieldReports, startDate, endDate]);

    // Download CSV
    const handleDownloadCSV = () => {
        if (filteredReports.length === 0) {
            setToast('No reports found in this period');
            setTimeout(() => setToast(null), 3000);
            return;
        }
        const filename = `Weekly_Report_${startDate}_to_${endDate}.csv`;
        generateCSV(filteredReports, filename);
        setToast(`CSV Downloaded: ${filteredReports.length} reports`);
        setTimeout(() => setToast(null), 3000);
    };

    // Download Bank CSV
    const handleDownloadBankCSV = () => {
        if (filteredReports.length === 0) {
            setToast('No approved reports found in this period');
            setTimeout(() => setToast(null), 3000);
            return;
        }
        generateBankCSV(filteredReports, assets);
        setToast(`✓ Laporan Mingguan Berhasil Diunduh! Total ${filteredReports.length} baris data.`);
        setTimeout(() => setToast(null), 4000);
    };

    // Generate and Download PDF
    const handleGeneratePDF = () => {
        if (filteredReports.length === 0) {
            setToast('No reports found in this period');
            setTimeout(() => setToast(null), 3000);
            return;
        }

        // Open print view in new tab
        const printUrl = `/admin/documents/print?start=${startDate}&end=${endDate}`;
        window.open(printUrl, '_blank');

        // Show feedback
        setToast('Opening Print Preview...');
        setTimeout(() => setToast(null), 2000);
    };


    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-6 text-slate-900">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <nav className="flex items-center text-sm font-medium text-slate-500">
                    <Link href="/admin/dashboard" className="hover:text-slate-700">Dashboard</Link>
                    <span className="mx-2 text-slate-400">/</span>
                    <span className="text-slate-900 font-semibold">Document Repository</span>
                </nav>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Document Management</h2>
                    <div className="flex gap-3">
                        <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"><Upload size={18} />Upload File</button>
                        <button onClick={() => setActiveTab('generator')} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer"><FileSignature size={18} />Generate Letter</button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"><p className="text-sm text-slate-500">Total Documents</p><p className="text-3xl font-bold text-slate-900">{getTotalCount()}</p></div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"><p className="text-sm text-slate-500">Storage Used</p><p className="text-3xl font-bold text-blue-600">{getTotalSize()}</p></div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"><p className="text-sm text-slate-500">SPK Files</p><p className="text-3xl font-bold text-blue-600">{documents.filter((d) => d.type === 'SPK').length}</p></div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"><p className="text-sm text-slate-500">Somasi Letters</p><p className="text-3xl font-bold text-red-600">{documents.filter((d) => d.type === 'SOMASI').length}</p></div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-200">
                <button onClick={() => setActiveTab('repository')} className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 -mb-px cursor-pointer ${activeTab === 'repository' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}><FileText size={18} />File Repository</button>
                <button onClick={() => setActiveTab('generator')} className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 -mb-px cursor-pointer ${activeTab === 'generator' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}><FileSignature size={18} />Letter Generator</button>
                <button onClick={() => setActiveTab('reporting')} className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 -mb-px cursor-pointer ${activeTab === 'reporting' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}><FileText size={18} />Bank Reporting</button>
            </div>

            {/* Content */}
            {activeTab === 'repository' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Filter */}
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                        <Filter size={16} className="text-slate-400" />
                        <div className="relative">
                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as DocumentType | 'all')} className="pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg cursor-pointer appearance-none bg-white">
                                <option value="all">All Types</option>
                                <option value="SPK">SPK</option>
                                <option value="SOMASI">SOMASI</option>
                                <option value="COLLATERAL">COLLATERAL</option>
                                <option value="OTHERS">OTHERS</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        <span className="text-sm text-slate-500 ml-auto">{filteredDocs.length} files</span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-slate-50">
                                <tr className="border-b border-slate-200">
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">File Name</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Related Debtor</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Size</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredDocs.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No documents found</td></tr>
                                ) : filteredDocs.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <FileIcon filename={doc.title} />
                                                <span className="font-mono text-xs text-slate-700 truncate max-w-xs">{doc.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3"><TypeBadge type={doc.type} /></td>
                                        <td className="px-4 py-3 text-slate-600 text-xs">{doc.relatedDebtor || '-'}</td>
                                        <td className="px-4 py-3 text-slate-600">{formatDate(doc.uploadDate)}</td>
                                        <td className="px-4 py-3 text-slate-600">{doc.fileSize}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 hover:bg-blue-100 rounded-lg cursor-pointer" title="Download"><Download size={16} className="text-blue-600" /></button>
                                                <button onClick={() => handleDelete(doc.id)} className="p-2 hover:bg-red-100 rounded-lg cursor-pointer" title="Delete"><Trash2 size={16} className="text-red-600" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'generator' && <LetterGenerator onGenerate={handleGenerate} />}

            {activeTab === 'reporting' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Bank Reporting - Weekly Export</h3>
                        <p className="text-sm text-slate-500">Generate bank-compliant CSV reports for approved field visits within a date range</p>
                    </div>

                    {/* Date Range Filter */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" />
                        </div>
                    </div>

                    {/* Summary Card */}
                    {startDate && endDate && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Found Approved Reports</p>
                                    <p className="text-3xl font-bold text-blue-900">{filteredReports.length}</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Period: {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                                <CheckCircle size={48} className="text-blue-600 opacity-20" />
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <div className="border-2 border-blue-300 bg-blue-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">BANK FORMAT</span>
                                <p className="text-sm font-semibold text-blue-900">Bank-Compliant CSV Export</p>
                            </div>
                            <p className="text-xs text-blue-700 mb-3">17 columns: Kantor Cabang, Kanwil, Nomor Account, Nama Debitur, Status Agunan, Koordinat, dll.</p>
                            <button
                                onClick={handleDownloadBankCSV}
                                disabled={!startDate || !endDate || filteredReports.length === 0}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <Download size={20} />
                                Download Bank CSV (Regulatory)
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={handleDownloadCSV} disabled={!startDate || !endDate || filteredReports.length === 0} className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer">
                                <Download size={20} />
                                Download Simple CSV
                            </button>
                            <button onClick={handleGeneratePDF} disabled={!startDate || !endDate || filteredReports.length === 0} className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer">
                                <FileText size={20} />
                                Save as PDF
                            </button>
                        </div>
                    </div>

                    {/* Preview Table */}
                    {filteredReports.length > 0 && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                                <h4 className="text-sm font-bold text-slate-700">Preview Data ({filteredReports.length} reports)</h4>
                            </div>
                            <div className="overflow-x-auto max-h-96">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr className="border-b border-slate-200">
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">No Rek</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Debitur</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tanggal Visit</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Hasil</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Collector</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredReports.map((r) => (
                                            <tr key={r.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-mono text-xs">{r.loanId}</td>
                                                <td className="px-4 py-3 font-medium">{r.debtorName}</td>
                                                <td className="px-4 py-3 text-slate-600">{new Date(r.submissionDate).toLocaleDateString('id-ID')}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                                        {r.commitmentDate ? `Janji Bayar (${r.commitmentDate})` : 'Macet/Alasan'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{r.collectorName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} />}
            {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        </div>
    );
}

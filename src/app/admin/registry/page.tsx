'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Search, Trash2, X, Check, AlertTriangle, Filter, Upload, FileSpreadsheet, Loader2, Eye } from 'lucide-react';
import { useAssets, Asset } from '@/context/AssetContext';

// Format Rupiah
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// SPK Status options
const spkStatusOptions: Asset['kelolaanTerbitSpk'][] = ['AKTIF', 'PASIF'];

// SPK Status badge styles
const spkStatusStyles: Record<Asset['kelolaanTerbitSpk'], string> = {
    'AKTIF': 'bg-green-100 text-green-700 border-green-200',
    'PASIF': 'bg-slate-100 text-slate-600 border-slate-200',
};

// ============================================
// BANK CSV PARSER (25 Columns - Indonesian)
// ============================================

interface BankColumnMapping {
    // Core
    nomorAccount: string | null;
    namaDebitur: string | null;
    namaKreditur: string | null;
    // Branch
    kantorCabang: string | null;
    kanwil: string | null;
    kelolaanTerbitSpk: string | null;
    jenisKredit: string | null;
    // Address
    alamatAgunan: string | null;
    alamatKtpDebitur: string | null;
    alamatKantorDebitur: string | null;
    // Contact
    nomorHp1Debitur: string | null;
    nomorHp2Debitur: string | null;
    nomorTeleponKantor: string | null;
    // Emergency
    namaEmergencyKontak: string | null;
    nomorTeleponEmergency: string | null;
    alamatEmergencyKontak: string | null;
    // Financial
    plafondAwal: string | null;
    tanggalRealisasi: string | null;
    tanggalJatuhTempo: string | null;
    saldoPokok: string | null;
    tunggakanBunga: string | null;
    tunggakanDenda: string | null;
    tunggakanAngsuran: string | null;
    totalTunggakan: string | null;
    lunasTunggakan: string | null;
    lunasKredit: string | null;
}

const BANK_HEADER_MAPPINGS: Record<keyof BankColumnMapping, string[]> = {
    nomorAccount: ['NOMOR ACCOUNT', 'ACCTNO', 'ACC', 'NO REK', 'NOREK', 'ACCOUNT'],
    namaDebitur: ['NAMA DEBITUR', 'NAMA_DEBITUR', 'NAMA', 'DEBITUR'],
    namaKreditur: ['NAMA KREDITUR', 'KREDITUR', 'NAMA_KREDITUR', 'BANK', 'NAMA BANK'],
    kantorCabang: ['KANTOR CABANG', 'CABANG', 'BRANCH', 'KC'],
    kanwil: ['KANWIL', 'ARCOLL', 'REGION'],
    kelolaanTerbitSpk: ['KELOLAAN TERBIT SPK', 'KELOLAAN', 'STATUS', 'STATUS SPK'],
    jenisKredit: ['JENIS KREDIT', 'JENIS_KREDIT01', 'KREDIT'],
    alamatAgunan: ['ALAMAT AGUNAN', 'ALAMAT_AGUNAN'],
    alamatKtpDebitur: ['ALAMAT KTP DEBITUR', 'ALAMAT_DEV', 'ALAMAT KTP', 'ALAMAT'],
    alamatKantorDebitur: ['ALAMAT KANTOR DEBITUR', 'ALAMAT_KANTOR', 'ALAMAT KANTOR'],
    nomorHp1Debitur: ['NOMOR HP 1 DEBITUR', 'HP1', 'NO HP', 'TELEPON', 'HP'],
    nomorHp2Debitur: ['NOMOR HP 2 DEBITUR', 'HP2', 'HP 2'],
    nomorTeleponKantor: ['NOMOR TELEPON KANTOR', 'TELP_KANTOR', 'TELEPON KANTOR'],
    namaEmergencyKontak: ['NAMA EMERGENCY KONTAK', 'NAMA_DARURAT', 'NAMA DARURAT', 'EMERGENCY'],
    nomorTeleponEmergency: ['NOMOR TELEPON EMERGENCY KONTAK', 'HP_DARURAT', 'DARURAT', 'TELEPON DARURAT'],
    alamatEmergencyKontak: ['ALAMAT EMERGENCY KONTAK', 'ALAMAT_DARURAT', 'ALAMAT DARURAT'],
    plafondAwal: ['PLAFOND AWAL', 'PLAFON', 'PLAFOND'],
    tanggalRealisasi: ['TANGGAL REALISASI', 'TGL_REALISASI'],
    tanggalJatuhTempo: ['TANGGAL JATUH TEMPO', 'TGL_JT', 'JATUH TEMPO'],
    saldoPokok: ['SALDO POKOK', 'CBAL', 'OS_POKOK'],
    tunggakanBunga: ['TUNGGAKAN BUNGA', 'TGK_BUNGA01'],
    tunggakanDenda: ['TUNGGAKAN DENDA', 'TGK_DENDA01'],
    tunggakanAngsuran: ['TUNGGAKAN ANGSURAN', 'TGK_ANGSURAN'],
    totalTunggakan: ['TOTAL TUNGGAKAN', 'TOTAL_TGK'],
    lunasTunggakan: ['LUNAS TUNGGAKAN', 'LUNAS_TGK'],
    lunasKredit: ['LUNAS KREDIT', 'LUNAS_KREDIT', 'TOTAL LUNAS'],
};

function parseAmount(value: string): number {
    if (!value) return 0;
    const cleaned = value.replace(/[Rp\s.]/gi, '').replace(',', '.').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
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

function convertBankRowsToAssets(rows: Record<string, string>[], mapping: BankColumnMapping): Omit<Asset, 'id' | 'lastUpdate'>[] {
    return rows.filter((row) => {
        const hasId = mapping.nomorAccount && row[mapping.nomorAccount]?.trim();
        const hasName = mapping.namaDebitur && row[mapping.namaDebitur]?.trim();
        return hasId || hasName;
    }).map((row) => {
        const spkRaw = mapping.kelolaanTerbitSpk ? row[mapping.kelolaanTerbitSpk]?.toUpperCase() || '' : '';
        const kelolaanTerbitSpk: Asset['kelolaanTerbitSpk'] = spkRaw.includes('AKTIF') ? 'AKTIF' : 'PASIF';

        // Indonesian Fields
        const nomorAccount = mapping.nomorAccount ? row[mapping.nomorAccount] || '' : '';
        const namaDebitur = mapping.namaDebitur ? row[mapping.namaDebitur] || 'Unknown' : 'Unknown';
        const namaKreditur = mapping.namaKreditur ? row[mapping.namaKreditur] || '' : '';
        const kantorCabang = mapping.kantorCabang ? row[mapping.kantorCabang] || '' : '';
        const kanwil = mapping.kanwil ? row[mapping.kanwil] || '' : '';
        const jenisKredit = mapping.jenisKredit ? row[mapping.jenisKredit] || '' : '';
        const alamatAgunan = mapping.alamatAgunan ? row[mapping.alamatAgunan] || '' : '';
        const alamatKtpDebitur = mapping.alamatKtpDebitur ? row[mapping.alamatKtpDebitur] || '' : '';
        const alamatKantorDebitur = mapping.alamatKantorDebitur ? row[mapping.alamatKantorDebitur] || '' : '';
        const nomorHp1Debitur = mapping.nomorHp1Debitur ? row[mapping.nomorHp1Debitur] || '' : '';
        const nomorHp2Debitur = mapping.nomorHp2Debitur ? row[mapping.nomorHp2Debitur] || '' : '';
        const nomorTeleponKantor = mapping.nomorTeleponKantor ? row[mapping.nomorTeleponKantor] || '' : '';
        const namaEmergencyKontak = mapping.namaEmergencyKontak ? row[mapping.namaEmergencyKontak] || '' : '';
        const nomorTeleponEmergency = mapping.nomorTeleponEmergency ? row[mapping.nomorTeleponEmergency] || '' : '';
        const alamatEmergencyKontak = mapping.alamatEmergencyKontak ? row[mapping.alamatEmergencyKontak] || '' : '';
        const plafondAwal = mapping.plafondAwal ? parseAmount(row[mapping.plafondAwal]) : 0;
        const tanggalRealisasi = mapping.tanggalRealisasi ? row[mapping.tanggalRealisasi] || '' : '';
        const tanggalJatuhTempo = mapping.tanggalJatuhTempo ? row[mapping.tanggalJatuhTempo] || '' : '';
        const saldoPokok = mapping.saldoPokok ? parseAmount(row[mapping.saldoPokok]) : 0;
        const tunggakanBunga = mapping.tunggakanBunga ? parseAmount(row[mapping.tunggakanBunga]) : 0;
        const tunggakanDenda = mapping.tunggakanDenda ? parseAmount(row[mapping.tunggakanDenda]) : 0;
        const tunggakanAngsuran = mapping.tunggakanAngsuran ? parseAmount(row[mapping.tunggakanAngsuran]) : 0;
        const totalTunggakan = mapping.totalTunggakan ? parseAmount(row[mapping.totalTunggakan]) : 0;
        const lunasTunggakan = mapping.lunasTunggakan ? parseAmount(row[mapping.lunasTunggakan]) : 0;
        const lunasKredit = mapping.lunasKredit ? parseAmount(row[mapping.lunasKredit]) : 0;

        return {
            // Indonesian Fields
            nomorAccount, namaDebitur, namaKreditur, kantorCabang, kanwil, kelolaanTerbitSpk, jenisKredit,
            alamatAgunan, alamatKtpDebitur, alamatKantorDebitur,
            nomorHp1Debitur, nomorHp2Debitur, nomorTeleponKantor,
            namaEmergencyKontak, nomorTeleponEmergency, alamatEmergencyKontak,
            plafondAwal, tanggalRealisasi, tanggalJatuhTempo,
            saldoPokok, tunggakanBunga, tunggakanDenda, tunggakanAngsuran, totalTunggakan, lunasTunggakan, lunasKredit,
            status: 'LANCAR' as const,
            collectorId: null,

            // Backward-compatible English Aliases
            loanId: nomorAccount,
            debtorName: namaDebitur,
            creditorName: namaKreditur,
            branch: kantorCabang,
            region: kanwil,
            spkStatus: kelolaanTerbitSpk,
            creditType: jenisKredit,
            collateralAddress: alamatAgunan,
            identityAddress: alamatKtpDebitur,
            officeAddress: alamatKantorDebitur,
            phone: nomorHp1Debitur,
            officePhone: nomorTeleponKantor,
            emergencyName: namaEmergencyKontak,
            emergencyPhone: nomorTeleponEmergency,
            emergencyAddress: alamatEmergencyKontak,
            initialPlafond: plafondAwal,
            realizationDate: tanggalRealisasi,
            maturityDate: tanggalJatuhTempo,
            principalBalance: saldoPokok,
            interestArrears: tunggakanBunga,
            penaltyArrears: tunggakanDenda,
            principalArrears: tunggakanAngsuran,
            totalArrears: totalTunggakan,
            totalPayoff: lunasKredit,
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
                        <h3 className="text-lg font-bold text-white">{asset.namaDebitur}</h3>
                        <p className="text-slate-300 text-sm">Account: {asset.nomorAccount}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors cursor-pointer">
                        <X size={20} className="text-white" />
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Branch Info */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <h4 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wide">Data Cabang</h4>
                        <div className="space-y-2 text-sm">
                            <div><span className="text-slate-500">Kantor Cabang:</span> <span className="font-medium text-slate-900">{asset.kantorCabang || '-'}</span></div>
                            <div><span className="text-slate-500">Kanwil:</span> <span className="text-slate-700">{asset.kanwil || '-'}</span></div>
                            <div><span className="text-slate-500">Jenis Kredit:</span> <span className="text-slate-700">{asset.jenisKredit || '-'}</span></div>
                            <div><span className="text-slate-500">Status SPK:</span> <span className={`px-2 py-0.5 rounded text-xs font-semibold ${spkStatusStyles[asset.kelolaanTerbitSpk]}`}>{asset.kelolaanTerbitSpk}</span></div>
                            {asset.namaKreditur && <div><span className="text-slate-500">Nama Kreditur:</span> <span className="font-medium text-slate-900">{asset.namaKreditur}</span></div>}
                        </div>
                    </div>
                    {/* Identitas Debitur */}
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <h4 className="text-sm font-bold text-green-800 mb-3 uppercase tracking-wide">Identitas Debitur</h4>
                        <div className="space-y-2 text-sm">
                            <div><span className="text-slate-500">Nama:</span> <span className="font-medium text-slate-900">{asset.namaDebitur}</span></div>
                            <div><span className="text-slate-500">Alamat KTP:</span> <span className="text-slate-700">{asset.alamatKtpDebitur || '-'}</span></div>
                            <div><span className="text-slate-500">HP 1:</span> <span className="text-slate-700">{asset.nomorHp1Debitur || '-'}</span></div>
                            <div><span className="text-slate-500">HP 2:</span> <span className="text-slate-700">{asset.nomorHp2Debitur || '-'}</span></div>
                        </div>
                    </div>
                    {/* Data Kantor */}
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <h4 className="text-sm font-bold text-purple-800 mb-3 uppercase tracking-wide">Data Kantor</h4>
                        <div className="space-y-2 text-sm">
                            <div><span className="text-slate-500">Alamat Kantor:</span> <span className="text-slate-700">{asset.alamatKantorDebitur || '-'}</span></div>
                            <div><span className="text-slate-500">Telepon Kantor:</span> <span className="text-slate-700">{asset.nomorTeleponKantor || '-'}</span></div>
                        </div>
                    </div>
                    {/* Kontak Darurat */}
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                        <h4 className="text-sm font-bold text-red-800 mb-3 uppercase tracking-wide">Kontak Darurat</h4>
                        <div className="space-y-2 text-sm">
                            <div><span className="text-slate-500">Nama:</span> <span className="font-medium text-slate-900">{asset.namaEmergencyKontak || '-'}</span></div>
                            <div><span className="text-slate-500">Telepon:</span> <span className="text-slate-700">{asset.nomorTeleponEmergency || '-'}</span></div>
                            <div><span className="text-slate-500">Alamat:</span> <span className="text-slate-700">{asset.alamatEmergencyKontak || '-'}</span></div>
                        </div>
                    </div>
                    {/* Data Agunan */}
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 md:col-span-2">
                        <h4 className="text-sm font-bold text-orange-800 mb-3 uppercase tracking-wide">Alamat Agunan</h4>
                        <p className="text-sm text-slate-700">{asset.alamatAgunan || '-'}</p>
                    </div>
                    {/* Financials */}
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 md:col-span-2">
                        <h4 className="text-sm font-bold text-amber-800 mb-3 uppercase tracking-wide">Data Finansial</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><span className="text-slate-500 block">Plafond Awal</span><span className="font-bold text-slate-900">{formatRupiah(asset.plafondAwal)}</span></div>
                            <div><span className="text-slate-500 block">Saldo Pokok</span><span className="font-medium text-slate-700">{formatRupiah(asset.saldoPokok)}</span></div>
                            <div><span className="text-slate-500 block">Tgl Realisasi</span><span className="text-slate-700">{asset.tanggalRealisasi || '-'}</span></div>
                            <div><span className="text-slate-500 block">Jatuh Tempo</span><span className="text-slate-700">{asset.tanggalJatuhTempo || '-'}</span></div>
                        </div>
                        <hr className="my-4 border-amber-200" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><span className="text-slate-500 block">Tunggakan Bunga</span><span className="text-red-600">{formatRupiah(asset.tunggakanBunga)}</span></div>
                            <div><span className="text-slate-500 block">Tunggakan Denda</span><span className="text-red-600">{formatRupiah(asset.tunggakanDenda)}</span></div>
                            <div><span className="text-slate-500 block">Tunggakan Angsuran</span><span className="text-red-600">{formatRupiah(asset.tunggakanAngsuran)}</span></div>
                            <div><span className="text-slate-500 block font-semibold">TOTAL TUNGGAKAN</span><span className="font-bold text-red-700 text-lg">{formatRupiah(asset.totalTunggakan)}</span></div>
                        </div>
                        <hr className="my-4 border-amber-200" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-slate-500 block">Lunas Tunggakan</span><span className="font-medium text-slate-700">{formatRupiah(asset.lunasTunggakan)}</span></div>
                            <div><span className="text-slate-500 block">Lunas Kredit</span><span className="font-medium text-slate-700">{formatRupiah(asset.lunasKredit)}</span></div>
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

function CSVImportModal({ onClose, onImport }: { onClose: () => void; onImport: (assets: Omit<Asset, 'id' | 'lastUpdate'>[]) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [parsedData, setParsedData] = useState<{ assets: Omit<Asset, 'id' | 'lastUpdate'>[]; originalRowCount: number } | null>(null);
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
                nomorAccount: findColumn(headers, BANK_HEADER_MAPPINGS.nomorAccount),
                namaDebitur: findColumn(headers, BANK_HEADER_MAPPINGS.namaDebitur),
                namaKreditur: findColumn(headers, BANK_HEADER_MAPPINGS.namaKreditur),
                kantorCabang: findColumn(headers, BANK_HEADER_MAPPINGS.kantorCabang),
                kanwil: findColumn(headers, BANK_HEADER_MAPPINGS.kanwil),
                kelolaanTerbitSpk: findColumn(headers, BANK_HEADER_MAPPINGS.kelolaanTerbitSpk),
                jenisKredit: findColumn(headers, BANK_HEADER_MAPPINGS.jenisKredit),
                alamatAgunan: findColumn(headers, BANK_HEADER_MAPPINGS.alamatAgunan),
                alamatKtpDebitur: findColumn(headers, BANK_HEADER_MAPPINGS.alamatKtpDebitur),
                alamatKantorDebitur: findColumn(headers, BANK_HEADER_MAPPINGS.alamatKantorDebitur),
                nomorHp1Debitur: findColumn(headers, BANK_HEADER_MAPPINGS.nomorHp1Debitur),
                nomorHp2Debitur: findColumn(headers, BANK_HEADER_MAPPINGS.nomorHp2Debitur),
                nomorTeleponKantor: findColumn(headers, BANK_HEADER_MAPPINGS.nomorTeleponKantor),
                namaEmergencyKontak: findColumn(headers, BANK_HEADER_MAPPINGS.namaEmergencyKontak),
                nomorTeleponEmergency: findColumn(headers, BANK_HEADER_MAPPINGS.nomorTeleponEmergency),
                alamatEmergencyKontak: findColumn(headers, BANK_HEADER_MAPPINGS.alamatEmergencyKontak),
                plafondAwal: findColumn(headers, BANK_HEADER_MAPPINGS.plafondAwal),
                tanggalRealisasi: findColumn(headers, BANK_HEADER_MAPPINGS.tanggalRealisasi),
                tanggalJatuhTempo: findColumn(headers, BANK_HEADER_MAPPINGS.tanggalJatuhTempo),
                saldoPokok: findColumn(headers, BANK_HEADER_MAPPINGS.saldoPokok),
                tunggakanBunga: findColumn(headers, BANK_HEADER_MAPPINGS.tunggakanBunga),
                tunggakanDenda: findColumn(headers, BANK_HEADER_MAPPINGS.tunggakanDenda),
                tunggakanAngsuran: findColumn(headers, BANK_HEADER_MAPPINGS.tunggakanAngsuran),
                totalTunggakan: findColumn(headers, BANK_HEADER_MAPPINGS.totalTunggakan),
                lunasTunggakan: findColumn(headers, BANK_HEADER_MAPPINGS.lunasTunggakan),
                lunasKredit: findColumn(headers, BANK_HEADER_MAPPINGS.lunasKredit),
            };

            if (!mapping.namaDebitur && !mapping.nomorAccount) throw new Error('Tidak dapat menemukan kolom NAMA DEBITUR atau NOMOR ACCOUNT.');
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
    const { assets, importAssets, deleteAsset, deleteBulkAssets } = useAssets();
    const [searchQuery, setSearchQuery] = useState('');
    const [spkFilter, setSpkFilter] = useState<Asset['kelolaanTerbitSpk'] | 'all'>('all');
    const [showImportModal, setShowImportModal] = useState(false);
    const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
    const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const filteredAssets = useMemo(() => {
        return assets.filter((asset) => {
            const matchesSearch = searchQuery === '' || asset.namaDebitur.toLowerCase().includes(searchQuery.toLowerCase()) || asset.nomorAccount.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = spkFilter === 'all' || asset.kelolaanTerbitSpk === spkFilter;
            return matchesSearch && matchesStatus;
        });
    }, [assets, searchQuery, spkFilter]);

    const handleDeleteAsset = async () => { if (deletingAsset) { await deleteAsset(deletingAsset.id); showToast(`Asset ${deletingAsset.nomorAccount} dihapus`, 'success'); setDeletingAsset(null); } };
    const handleImportAssets = async (newAssets: Omit<Asset, 'id' | 'lastUpdate'>[]) => { const count = await importAssets(newAssets); setShowImportModal(false); showToast(count > 0 ? `${count} aset diimport` : 'Semua data duplikat', count > 0 ? 'success' : 'error'); };
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
                    <div className="flex items-center gap-2"><Filter size={18} className="text-slate-400" /><select value={spkFilter} onChange={(e) => setSpkFilter(e.target.value as Asset['kelolaanTerbitSpk'] | 'all')} className="px-4 py-2.5 border border-slate-300 rounded-lg cursor-pointer"><option value="all">Semua Status</option>{spkStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                </div>
                <div className="mt-3 text-sm text-slate-500">Menampilkan <strong>{filteredAssets.length}</strong> dari <strong>{assets.length}</strong> aset</div>
            </div>
            {/* Table - 7 Core Columns */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead><tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-4 w-12"><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-blue-600 cursor-pointer" /></th>
                            <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Nomor Account</th>
                            <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Nama Debitur</th>
                            <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Kantor Cabang</th>
                            <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Total Tunggakan</th>
                            <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase">Jenis Kredit</th>
                            <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Status SPK</th>
                            <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredAssets.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-500"><Search size={40} className="text-slate-300 mx-auto mb-2" /><p>Tidak ada data</p></td></tr>
                            ) : filteredAssets.map((asset) => (
                                <tr key={asset.id} className={`hover:bg-slate-50 ${selectedIds.includes(asset.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(asset.id)} onChange={() => toggleSelectAsset(asset.id)} className="w-4 h-4 accent-blue-600 cursor-pointer" /></td>
                                    <td className="px-4 py-3 font-mono text-sm text-slate-600">{asset.nomorAccount}</td>
                                    <td className="px-4 py-3"><p className="font-medium text-slate-900">{asset.namaDebitur}</p></td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{asset.kantorCabang || '-'}</td>
                                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatRupiah(asset.totalTunggakan)}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{asset.jenisKredit || '-'}</td>
                                    <td className="px-4 py-3 text-center"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${spkStatusStyles[asset.kelolaanTerbitSpk]}`}>{asset.kelolaanTerbitSpk}</span></td>
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
                        <p className="text-slate-600 mb-6">Account <strong>{deletingAsset.nomorAccount}</strong> - {deletingAsset.namaDebitur}</p>
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

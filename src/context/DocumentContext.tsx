'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Document types
export type DocumentType = 'SPK' | 'SOMASI' | 'COLLATERAL' | 'OTHERS';

// Document interface
export interface Document {
    id: string;
    title: string;
    type: DocumentType;
    relatedDebtor: string | null; // Nama Debitur atau Loan ID
    uploadDate: string;
    fileSize: string;
    url: string;
}

// Initial documents - empty for production (data from database)
const initialDocuments: Document[] = [];

// Context type
interface DocumentContextType {
    documents: Document[];
    addDocument: (doc: Omit<Document, 'id'>) => Document;
    deleteDocument: (id: string) => void;
    getDocumentsByType: (type: DocumentType) => Document[];
    getTotalCount: () => number;
    getTotalSize: () => string;
    generateCSV: (reports: any[], filename: string) => void;
    generateWeeklyPDF: (reports: any[], filename: string) => void;
    generateBankCSV: (reports: any[], assets: any[]) => void;
    addToRepository: (file: Omit<Document, 'id'>) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

// Generate unique ID
function generateDocId(): string {
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `DOC-${randomNum}`;
}

// Helper to trigger browser download
function triggerBrowserDownload(content: string, fileName: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

// Generate CSV from validation reports
function generateCSVContent(reports: any[]): string {
    // CSV Header
    const headers = ['No Rek', 'Debitur', 'Telepon', 'Tanggal Visit', 'Alamat Agunan', 'Hasil', 'Permasalahan', 'Janji Bayar', 'GPS Coordinates'];
    const rows = reports.map((r) => [
        r.loanId || '',
        r.debtorName || '',
        r.debtorPhone || '',
        r.submissionDate ? new Date(r.submissionDate).toLocaleDateString('id-ID') : '',
        r.collateralAddress || '',
        r.commitmentDate ? `Janji Bayar (${r.commitmentDate})` : 'Macet/Alasan',
        (r.problemDescription || '').replace(/,/g, ';'), // Escape commas
        r.commitmentDate || '-',
        r.coordinates || '-',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return csvContent;
}

// Helper to escape CSV values
function escapeCsvValue(value: string | null | undefined): string {
    if (!value) return '""';
    const stringValue = String(value);
    // If contains comma, newline, or quotes, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

// Generate Bank-Compliant CSV from validation reports
function generateBankCSVContent(reports: any[], assets: any[]): string {
    // Bank-required CSV Header (exact order matters)
    const headers = [
        'KANTOR CABANG',
        'KANWIL',
        'NOMOR ACCOUNT',
        'NAMA DEBITUR',
        'NOMOR TELEPON',
        'PERMASALAHAN',
        'KOMITMEN REALISASI',
        'ALAMAT AGUNAN',
        'STATUS AGUNAN',
        'KONDISI AGUNAN',
        'LISTRIK',
        'AIR',
        'FASILITAS (<5KM)',
        'MARKETABLE',
        'KOORDINAT',
        'FOTO',
        'LINK FOTO'
    ];

    // Map report data
    const rows = reports.map((report) => {
        // Find matching asset
        const asset = assets.find(a => a.loanId === report.loanId);

        return [
            escapeCsvValue(asset?.branch || report.branch || '-'),
            escapeCsvValue(asset?.kanwil || '-'),
            escapeCsvValue(report.loanId || ''),
            escapeCsvValue(asset?.name || report.debtorName || ''),
            escapeCsvValue(asset?.phone || report.debtorPhone || ''),
            escapeCsvValue(report.problemDescription || ''),
            escapeCsvValue(report.commitmentDate ? new Date(report.commitmentDate).toLocaleDateString('id-ID') : '-'),
            escapeCsvValue(asset?.collateralAddress || report.collateralAddress || ''),
            escapeCsvValue(report.collateralStatus || 'Unknown'),
            escapeCsvValue(report.collateralCondition || 'Unknown'),
            escapeCsvValue(report.utilities?.electricity ? 'Ya' : 'Tidak'),
            escapeCsvValue(report.utilities?.water ? 'Ya' : 'Tidak'),
            escapeCsvValue(report.facilities ? report.facilities.join('; ') : '-'),
            escapeCsvValue(report.isMarketable ? 'Ya' : 'Tidak'),
            escapeCsvValue(report.coordinates || report.gpsCoordinates || ''),
            escapeCsvValue(formatPhotoEvidence(report.photoEvidence)),
            escapeCsvValue(generatePhotoLinks(report.photoEvidence))
        ];
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csvContent;
}

// Format photo evidence for display
function formatPhotoEvidence(photos: any): string {
    if (!photos) return '-';
    const parts = [];
    if (photos.front) parts.push(`Depan [${new Date().toLocaleString('id-ID')}]`);
    if (photos.side) parts.push(`Samping [${new Date().toLocaleString('id-ID')}]`);
    if (photos.withDebtor) parts.push(`Dengan Debitur [${new Date().toLocaleString('id-ID')}]`);
    return parts.length > 0 ? parts.join('; ') : '-';
}

// Generate photo links
function generatePhotoLinks(photos: any): string {
    if (!photos) return '-';
    const links = [];
    if (photos.front) links.push(photos.front);
    if (photos.side) links.push(photos.side);
    if (photos.withDebtor) links.push(photos.withDebtor);
    return links.length > 0 ? links.join('; ') : '-';
}

// Generate PDF content (formatted text report)
function generatePDFContent(reports: any[]): string {
    const header = `
╔═══════════════════════════════════════════════════════════════════════════════════╗
║                        WEEKLY VALIDATION REPORT                                   ║
║                     PT. WATU KOBU MULTINIAGA                                      ║
╚═══════════════════════════════════════════════════════════════════════════════════╝

Generated: ${new Date().toLocaleString('id-ID')}
Total Approved Reports: ${reports.length}

═══════════════════════════════════════════════════════════════════════════════════

`;

    const reportLines = reports.map((r, idx) => {
        return `
[${idx + 1}] DEBITUR: ${r.debtorName}
    No. Rekening     : ${r.loanId}
    Telepon          : ${r.debtorPhone}
    Tanggal Visit    : ${new Date(r.submissionDate).toLocaleDateString('id-ID')}
    Alamat Agunan    : ${r.collateralAddress}
    Hasil            : ${r.commitmentDate ? `Janji Bayar (${r.commitmentDate})` : 'Macet/Alasan'}
    Permasalahan     : ${r.problemDescription}
    GPS Coordinates  : ${r.coordinates || '-'}
    Collector        : ${r.collectorName}
    Cabang           : ${r.branch}
    
${'─'.repeat(85)}
`;
    }).join('');

    const footer = `
═══════════════════════════════════════════════════════════════════════════════════

END OF REPORT

`;

    return header + reportLines + footer;
}

export function DocumentProvider({ children }: { children: ReactNode }) {
    const [documents, setDocuments] = useState<Document[]>([...initialDocuments]);

    const addDocument = (doc: Omit<Document, 'id'>): Document => {
        const newDoc: Document = { ...doc, id: generateDocId() };
        setDocuments((prev) => [newDoc, ...prev]);
        return newDoc;
    };

    const deleteDocument = (id: string) => {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
    };

    const getDocumentsByType = (type: DocumentType) => {
        return documents.filter((d) => d.type === type);
    };

    const getTotalCount = () => documents.length;

    const getTotalSize = () => {
        // Simplified - return dummy percentage
        return '45%';
    };

    // Generate CSV and trigger download
    const generateCSV = (reports: any[], filename: string) => {
        const csvContent = generateCSVContent(reports);
        triggerBrowserDownload(csvContent, filename, 'text/csv;charset=utf-8;');
    };

    // Generate PDF and trigger download
    const generateWeeklyPDF = (reports: any[], filename: string) => {
        const pdfContent = generatePDFContent(reports);
        triggerBrowserDownload(pdfContent, filename, 'application/pdf');

        // Also add to repository
        addDocument({
            title: filename,
            type: 'OTHERS',
            relatedDebtor: null,
            uploadDate: new Date().toISOString().split('T')[0],
            fileSize: `${(pdfContent.length / 1024).toFixed(1)} KB`,
            url: `/documents/${filename}`,
        });
    };

    // Generate Bank CSV and trigger download
    const generateBankCSV = (reports: any[], assets: any[]) => {
        const csvContent = generateBankCSVContent(reports, assets);
        const startDate = reports.length > 0 ? new Date(reports[0].submissionDate).toISOString().split('T')[0] : 'YYYY-MM-DD';
        const endDate = new Date().toISOString().split('T')[0];
        const filename = `Weekly_Report_${startDate}_${endDate}.csv`;
        triggerBrowserDownload(csvContent, filename, 'text/csv;charset=utf-8;');
    };

    // Add generated file to repository (standalone)
    const addToRepository = (file: Omit<Document, 'id'>) => {
        addDocument(file);
    };

    return (
        <DocumentContext.Provider value={{ documents, addDocument, deleteDocument, getDocumentsByType, getTotalCount, getTotalSize, generateCSV, generateWeeklyPDF, generateBankCSV, addToRepository }}>
            {children}
        </DocumentContext.Provider>
    );
}

export function useDocuments() {
    const context = useContext(DocumentContext);
    if (context === undefined) throw new Error('useDocuments must be used within a DocumentProvider');
    return context;
}

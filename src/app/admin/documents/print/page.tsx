'use client';

import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useValidation } from '@/context/ValidationContext';
import Image from 'next/image';

export default function PrintReportPage() {
    const searchParams = useSearchParams();
    const startDate = searchParams.get('start') || '';
    const endDate = searchParams.get('end') || '';
    const { reports } = useValidation();

    // Filter approved reports by date range
    const filteredReports = useMemo(() => {
        if (!startDate || !endDate) return [];
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime() + 86400000; // Add 1 day to include end date
        return reports.filter((r) => {
            if (r.status !== 'Approved') return false;
            const submitTime = new Date(r.submissionDate).getTime();
            return submitTime >= start && submitTime < end;
        });
    }, [reports, startDate, endDate]);

    // Auto-print when page loads
    useEffect(() => {
        if (filteredReports.length > 0) {
            // Small delay to ensure page is fully rendered
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [filteredReports]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <html lang="id">
            <head>
                <title>Weekly Collection Report - PT. Watu Kobu Multiniaga</title>
                <style>{`
                    @page {
                        size: A4 landscape;
                        margin: 15mm;
                    }

                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }

                    body {
                        font-family: 'Arial', sans-serif;
                        font-size: 10pt;
                        line-height: 1.4;
                        color: #000;
                        background: #fff;
                    }

                    .container {
                        max-width: 100%;
                        margin: 0 auto;
                    }

                    /* Header / Kop Surat */
                    .report-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        border-bottom: 3px solid #333;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                    }

                    .logo-section {
                        flex: 0 0 120px;
                    }

                    .logo-placeholder {
                        width: 100px;
                        height: 100px;
                        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        color: white;
                        font-size: 24px;
                    }

                    .title-section {
                        flex: 1;
                        text-align: center;
                    }

                    .company-name {
                        font-size: 16pt;
                        font-weight: bold;
                        color: #1e40af;
                        margin-bottom: 5px;
                    }

                    .report-title {
                        font-size: 14pt;
                        font-weight: bold;
                        color: #333;
                        margin-bottom: 5px;
                    }

                    .report-period {
                        font-size: 10pt;
                        color: #666;
                    }

                    .info-section {
                        flex: 0 0 150px;
                        text-align: right;
                        font-size: 9pt;
                        color: #666;
                    }

                    /* Table */
                    .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                        font-size: 9pt;
                    }

                    .report-table thead {
                        background: #e5e7eb;
                    }

                    .report-table th {
                        padding: 8px 6px;
                        text-align: left;
                        font-weight: bold;
                        border: 1px solid #9ca3af;
                        font-size: 9pt;
                        color: #1f2937;
                    }

                    .report-table td {
                        padding: 6px;
                        border: 1px solid #d1d5db;
                        vertical-align: top;
                    }

                    .report-table tbody tr:nth-child(even) {
                        background: #f9fafb;
                    }

                    .debtor-info {
                        font-weight: bold;
                        color: #1f2937;
                    }

                    .loan-id {
                        font-size: 8pt;
                        color: #6b7280;
                        font-family: 'Courier New', monospace;
                    }

                    .result-badge {
                        display: inline-block;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 8pt;
                        font-weight: bold;
                    }

                    .result-promise {
                        background: #d1fae5;
                        color: #065f46;
                    }

                    .result-other {
                        background: #fee2e2;
                        color: #991b1b;
                    }

                    /* Summary */
                    .summary-section {
                        margin: 20px 0;
                        padding: 10px;
                        background: #f3f4f6;
                        border-left: 4px solid #3b82f6;
                    }

                    .summary-text {
                        font-weight: bold;
                        font-size: 10pt;
                    }

                    /* Footer / Signature */
                    .signature-section {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 40px;
                        page-break-inside: avoid;
                    }

                    .signature-box {
                        width: 45%;
                        text-align: center;
                    }

                    .signature-label {
                        font-size: 10pt;
                        font-weight: bold;
                        margin-bottom: 60px;
                    }

                    .signature-name {
                        border-top: 1px solid #000;
                        padding-top: 5px;
                        font-size: 9pt;
                    }

                    /* Print-specific styles */
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }

                        .no-print {
                            display: none;
                        }

                        .report-table {
                            page-break-inside: auto;
                        }

                        .report-table tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }

                        .report-table thead {
                            display: table-header-group;
                        }

                        .signature-section {
                            page-break-inside: avoid;
                        }
                    }

                    /* Screen-only styles */
                    @media screen {
                        body {
                            padding: 20px;
                            background: #f3f4f6;
                        }

                        .container {
                            background: white;
                            padding: 30px;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                            max-width: 1200px;
                        }

                        .print-button {
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            padding: 12px 24px;
                            background: #3b82f6;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: bold;
                            cursor: pointer;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }

                        .print-button:hover {
                            background: #2563eb;
                        }
                    }
                `}</style>
            </head>
            <body>
                <button className="print-button no-print" onClick={() => window.print()}>
                    🖨️ Print / Save as PDF
                </button>

                <div className="container">
                    {/* Header / Kop Surat */}
                    <div className="report-header">
                        <div className="logo-section">
                            <div className="logo-placeholder">WK</div>
                        </div>
                        <div className="title-section">
                            <div className="company-name">PT. WATU KOBU MULTINIAGA</div>
                            <div className="report-title">WEEKLY COLLECTION REPORT</div>
                            <div className="report-period">
                                Period: {formatDate(startDate)} - {formatDate(endDate)}
                            </div>
                        </div>
                        <div className="info-section">
                            <div>Generated: {new Date().toLocaleDateString('id-ID')}</div>
                            <div>Time: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div>Total Reports: {filteredReports.length}</div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="summary-section">
                        <div className="summary-text">
                            Total Approved Validation Reports: {filteredReports.length} visits
                        </div>
                    </div>

                    {/* Data Table */}
                    {filteredReports.length > 0 ? (
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>No</th>
                                    <th style={{ width: '80px' }}>Date</th>
                                    <th style={{ width: '150px' }}>Debtor</th>
                                    <th style={{ width: '100px' }}>Branch</th>
                                    <th style={{ width: '80px' }}>Result</th>
                                    <th style={{ width: '80px' }}>Promise Date</th>
                                    <th style={{ width: '100px' }}>Collector</th>
                                    <th>Notes / Problem Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((report, index) => (
                                    <tr key={report.id}>
                                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                        <td>{formatDate(report.submissionDate)}</td>
                                        <td>
                                            <div className="debtor-info">{report.debtorName}</div>
                                            <div className="loan-id">{report.loanId}</div>
                                        </td>
                                        <td>{report.branch}</td>
                                        <td>
                                            <span className={report.commitmentDate ? 'result-badge result-promise' : 'result-badge result-other'}>
                                                {report.commitmentDate ? 'Janji Bayar' : 'Macet'}
                                            </span>
                                        </td>
                                        <td>{report.commitmentDate ? formatDate(report.commitmentDate) : '-'}</td>
                                        <td>{report.collectorName}</td>
                                        <td style={{ fontSize: '8pt' }}>{report.problemDescription}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            No approved reports found for the selected period.
                        </div>
                    )}

                    {/* Signature Section */}
                    {filteredReports.length > 0 && (
                        <div className="signature-section">
                            <div className="signature-box">
                                <div className="signature-label">Prepared By:</div>
                                <div className="signature-name">Admin Collections</div>
                            </div>
                            <div className="signature-box">
                                <div className="signature-label">Approved By:</div>
                                <div className="signature-name">Collection Manager</div>
                            </div>
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}

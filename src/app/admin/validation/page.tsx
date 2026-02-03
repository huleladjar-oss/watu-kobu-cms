'use client';

import { useState, useEffect } from 'react';
import { useValidation, VisitReport, PaymentReport, allPhotosValid, hasRequiredPhotos, hasCoordinates } from '@/context/ValidationContext';
import { useAssets } from '@/context/AssetContext';
import { FileText, MapPin, Camera, AlertTriangle, CheckCircle, XCircle, Eye, Banknote, Clock, Calendar, User, History as HistoryIcon, Filter } from 'lucide-react';
import Link from 'next/link';

// History Log Entry Type
interface HistoryLogEntry {
    id: string;
    type: 'visit' | 'payment';
    timestamp: string;
    processedAt: string;
    collectorName: string;
    debtorName: string;
    loanId: string;
    branch: string;
    status: 'APPROVED' | 'REJECTED';
    processedBy: string;
    // Visit-specific
    coordinates?: string;
    photosValid?: boolean;
    // Payment-specific
    amount?: number;
    paymentMethod?: string;
}

// Format rupiah
const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(num);
};

// Format date/time
const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export default function ValidationPage() {
    const { fieldReports, verifyVisit, rejectVisit, getFieldPendingCount, getFieldSuspiciousCount,
        paymentReports, verifyPayment, rejectPayment, getPaymentPendingCount } = useValidation();
    const { updateAssetBalance } = useAssets();

    const [activeTab, setActiveTab] = useState<'visits' | 'payments' | 'history'>('visits');
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // History state
    const [historyLogs, setHistoryLogs] = useState<HistoryLogEntry[]>([]);
    const [filterType, setFilterType] = useState<'all' | 'visit' | 'payment'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'APPROVED' | 'REJECTED'>('all');

    // Handle visit verification
    const handleVerifyVisit = (reportId: string) => {
        const report = fieldReports.find(r => r.id === reportId);
        if (!report) return;

        verifyVisit(reportId);

        // Add to history
        const historyEntry: HistoryLogEntry = {
            id: `history-visit-${Date.now()}`,
            type: 'visit',
            timestamp: report.submissionDate,
            processedAt: new Date().toISOString(),
            collectorName: report.collectorName,
            debtorName: report.debtorName,
            loanId: report.loanId,
            branch: report.branch,
            status: 'APPROVED',
            processedBy: 'Admin Staff',
            coordinates: report.coordinates,
            photosValid: allPhotosValid(report),
        };
        setHistoryLogs(prev => [historyEntry, ...prev]);

        setToastMessage('✓ Visit Report Approved!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleRejectVisit = (reportId: string) => {
        const reason = prompt('Alasan penolakan (mis: Foto tidak valid, GPS tidak akurat):');
        if (!reason) return;

        const report = fieldReports.find(r => r.id === reportId);
        if (!report) return;

        rejectVisit(reportId, reason);

        // Add to history
        const historyEntry: HistoryLogEntry = {
            id: `history-visit-${Date.now()}`,
            type: 'visit',
            timestamp: report.submissionDate,
            processedAt: new Date().toISOString(),
            collectorName: report.collectorName,
            debtorName: report.debtorName,
            loanId: report.loanId,
            branch: report.branch,
            status: 'REJECTED',
            processedBy: 'Admin Staff',
            coordinates: report.coordinates,
            photosValid: allPhotosValid(report),
        };
        setHistoryLogs(prev => [historyEntry, ...prev]);

        setToastMessage('✗ Visit Report Rejected');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Handle payment verification with auto-balance update
    const handleVerifyPayment = (reportId: string) => {
        const report = paymentReports.find(r => r.id === reportId);
        if (!report) return;

        verifyPayment(reportId);
        updateAssetBalance(report.loanId, report.paidAmount);

        // Add to history
        const historyEntry: HistoryLogEntry = {
            id: `history-payment-${Date.now()}`,
            type: 'payment',
            timestamp: report.timestamp,
            processedAt: new Date().toISOString(),
            collectorName: report.collectorName,
            debtorName: report.debtorName,
            loanId: report.loanId,
            branch: report.branch,
            status: 'APPROVED',
            processedBy: 'Admin Staff',
            amount: report.paidAmount,
            paymentMethod: report.paymentMethod,
        };
        setHistoryLogs(prev => [historyEntry, ...prev]);

        setToastMessage('✓ Dana Terkonfirmasi! Saldo Hutang Debitur Telah Dikurangi.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleRejectPayment = (reportId: string) => {
        const reason = prompt('Alasan penolakan (mis: Bukti tidak jelas, Dana tidak masuk):');
        if (!reason) return;

        const report = paymentReports.find(r => r.id === reportId);
        if (!report) return;

        rejectPayment(reportId, reason);

        // Add to history
        const historyEntry: HistoryLogEntry = {
            id: `history-payment-${Date.now()}`,
            type: 'payment',
            timestamp: report.timestamp,
            processedAt: new Date().toISOString(),
            collectorName: report.collectorName,
            debtorName: report.debtorName,
            loanId: report.loanId,
            branch: report.branch,
            status: 'REJECTED',
            processedBy: 'Admin Staff',
            amount: report.paidAmount,
            paymentMethod: report.paymentMethod,
        };
        setHistoryLogs(prev => [historyEntry, ...prev]);

        setToastMessage('✗ Payment Rejected');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const pendingFieldCount = getFieldPendingCount();
    const pendingPaymentCount = getPaymentPendingCount();
    const suspiciousCount = getFieldSuspiciousCount();

    const pendingFieldReports = fieldReports.filter(r => r.status === 'Pending');
    const pendingPaymentReports = paymentReports.filter(r => r.status === 'PENDING');

    // Calculate total pending payment amount
    const totalPendingAmount = pendingPaymentReports.reduce((sum, r) => sum + r.paidAmount, 0);

    // Filter history logs
    const filteredHistory = historyLogs.filter(log => {
        if (filterType !== 'all' && log.type !== filterType) return false;
        if (filterStatus !== 'all' && log.status !== filterStatus) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-pulse">
                    <CheckCircle size={20} />
                    {toastMessage}
                </div>
            )}

            {/* Photo Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img
                            src={selectedPhoto}
                            alt="Evidence"
                            className="max-w-full max-h-[90vh] rounded-lg"
                        />
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>
            )}

            <div className="p-8">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Validation Center</h1>
                    <p className="text-sm text-gray-600 mt-1">Monitor and approve field operations & payment reconciliation</p>
                </div>

                {/* Top Statistics Row */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Total Pending Validations */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Validations</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {pendingFieldCount + pendingPaymentCount}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {pendingFieldCount} visits • {pendingPaymentCount} payments
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
                                <Clock size={28} className="text-amber-600" />
                            </div>
                        </div>
                    </div>

                    {/* Potential Cash In */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {formatRupiah(totalPendingAmount)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
                            </div>
                            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                                <Banknote size={28} className="text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modern Segmented Tab Navigation - 3 Tabs */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 inline-flex gap-1">
                        <button
                            onClick={() => setActiveTab('visits')}
                            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'visits'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <FileText size={18} />
                            Field Visits
                            {pendingFieldCount > 0 && (
                                <span className={`ml-1 px-2 py-0.5 text-xs font-bold rounded-full ${activeTab === 'visits' ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                                    }`}>
                                    {pendingFieldCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'payments'
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <Banknote size={18} />
                            Payment Recon
                            {pendingPaymentCount > 0 && (
                                <span className={`ml-1 px-2 py-0.5 text-xs font-bold rounded-full ${activeTab === 'payments' ? 'bg-white text-green-600' : 'bg-green-500 text-white'
                                    }`}>
                                    {pendingPaymentCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'history'
                                    ? 'bg-gray-700 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <HistoryIcon size={18} />
                            History Log
                            {historyLogs.length > 0 && (
                                <span className={`ml-1 px-2 py-0.5 text-xs font-bold rounded-full ${activeTab === 'history' ? 'bg-white text-gray-700' : 'bg-gray-400 text-white'
                                    }`}>
                                    {historyLogs.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {suspiciousCount > 0 && activeTab === 'visits' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                            <AlertTriangle size={16} className="text-red-600" />
                            <span className="text-sm font-semibold text-red-700">{suspiciousCount} Suspicious Activities</span>
                        </div>
                    )}
                </div>

                {/* TAB CONTENT: Field Visits - Ticket Style Cards */}
                {activeTab === 'visits' && (
                    <div className="space-y-4">
                        {pendingFieldReports.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                                <CheckCircle size={64} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg font-semibold">All field visits validated!</p>
                                <p className="text-gray-400 text-sm mt-1">No pending visit reports to review</p>
                            </div>
                        ) : (
                            pendingFieldReports.map((report) => {
                                const photosValid = allPhotosValid(report);
                                const hasPhotos = hasRequiredPhotos(report);
                                const hasGPS = hasCoordinates(report);
                                const isSuspicious = !photosValid;

                                return (
                                    <div
                                        key={report.id}
                                        className={`bg-white rounded-xl shadow-sm border-l-4 p-6 ${isSuspicious ? 'border-l-red-500' : 'border-l-blue-500'
                                            }`}
                                    >
                                        {/* Header Row */}
                                        <div className="flex items-start justify-between mb-4">
                                            {/* Left: Collector Info */}
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                                    {getInitials(report.collectorName)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{report.collectorName}</p>
                                                    <p className="text-xs text-gray-500">{formatDateTime(report.submissionDate)}</p>
                                                </div>
                                            </div>

                                            {/* Right: Status Badge */}
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                                                PENDING REVIEW
                                            </span>
                                        </div>

                                        {/* Suspicious Alert */}
                                        {isSuspicious && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                                <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs font-semibold text-red-800">⚠ Suspicious Activity Detected</p>
                                                    <p className="text-xs text-red-600 mt-0.5">Photo timestamp mismatch — possible fraud or photo reuse</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Content Grid: 2 Columns */}
                                        <div className="grid grid-cols-2 gap-6 mb-4">
                                            {/* Left Column: Evidence Preview */}
                                            <div className="space-y-3">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Evidence</p>

                                                {/* Photo Grid */}
                                                <div className="grid grid-cols-3 gap-2">
                                                    {report.photoEvidence.front && (
                                                        <button
                                                            onClick={() => setSelectedPhoto(report.photoEvidence.front)}
                                                            className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors group relative"
                                                        >
                                                            <img src={report.photoEvidence.front} alt="Front" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                                                                <Eye size={16} className="text-white opacity-0 group-hover:opacity-100" />
                                                            </div>
                                                        </button>
                                                    )}
                                                    {report.photoEvidence.side && (
                                                        <button
                                                            onClick={() => setSelectedPhoto(report.photoEvidence.side)}
                                                            className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors group relative"
                                                        >
                                                            <img src={report.photoEvidence.side} alt="Side" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                                                                <Eye size={16} className="text-white opacity-0 group-hover:opacity-100" />
                                                            </div>
                                                        </button>
                                                    )}
                                                    {report.photoEvidence.withDebtor && (
                                                        <button
                                                            onClick={() => setSelectedPhoto(report.photoEvidence.withDebtor)}
                                                            className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors group relative"
                                                        >
                                                            <img src={report.photoEvidence.withDebtor} alt="With Debtor" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                                                                <Eye size={16} className="text-white opacity-0 group-hover:opacity-100" />
                                                            </div>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* GPS Indicator */}
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className={hasGPS ? 'text-green-600' : 'text-red-600'} />
                                                    <span className={`text-xs ${hasGPS ? 'text-green-700 font-mono' : 'text-red-700'}`}>
                                                        {hasGPS ? report.coordinates : 'GPS data missing'}
                                                    </span>
                                                </div>

                                                {/* Validation Indicators */}
                                                <div className="flex gap-2 flex-wrap">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${hasPhotos ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {hasPhotos ? '✓ Photos OK' : '✗ Photos Missing'}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${photosValid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {photosValid ? '✓ Time OK' : '⚠ Time Issue'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Right Column: Details */}
                                            <div className="space-y-3">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Visit Details</p>

                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Debtor</p>
                                                        <p className="text-sm font-semibold text-gray-900">{report.debtorName}</p>
                                                        <p className="text-xs text-gray-600 font-mono">{report.loanId}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500">Branch</p>
                                                        <p className="text-sm text-gray-700">{report.branch}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Interview Result</p>
                                                        <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{report.problemDescription}</p>
                                                    </div>

                                                    {report.commitmentDate && (
                                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                                            <Calendar size={12} />
                                                            Promise: {formatDate(report.commitmentDate)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer: Action Buttons */}
                                        <div className="flex items-center justify-end pt-4 border-t border-gray-100 gap-2">
                                            <button
                                                onClick={() => handleVerifyVisit(report.id)}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                <CheckCircle size={16} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectVisit(report.id)}
                                                className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                <XCircle size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* TAB CONTENT: Payment Reconciliation - Premium Table */}
                {activeTab === 'payments' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {pendingPaymentReports.length === 0 ? (
                            <div className="p-16 text-center">
                                <CheckCircle size={64} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg font-semibold">All payments verified!</p>
                                <p className="text-gray-400 text-sm mt-1">No pending payment reports to review</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Collector</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Debtor</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Evidence</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingPaymentReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-blue-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-medium text-gray-900">{formatDate(report.timestamp)}</p>
                                                <p className="text-xs text-gray-500">{formatTime(report.timestamp)}</p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900">{report.collectorName}</p>
                                                <p className="text-xs text-gray-500">{report.branch}</p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/admin/registry?search=${report.loanId}`}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {report.debtorName}
                                                </Link>
                                                <p className="text-xs text-gray-500 font-mono">{report.loanId}</p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {report.paymentMethod}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <p className="text-lg font-bold text-green-600 font-mono">
                                                    {formatRupiah(report.paidAmount)}
                                                </p>
                                                {report.paymentStatus === 'partial' && (
                                                    <p className="text-xs text-gray-500">of {formatRupiah(report.promiseAmount)}</p>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => setSelectedPhoto(report.evidencePhoto)}
                                                        className="relative group"
                                                    >
                                                        <img
                                                            src={report.evidencePhoto}
                                                            alt="Evidence"
                                                            className="w-16 h-16 rounded-lg object-cover border border-gray-200 group-hover:border-blue-400 transition-colors"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-all">
                                                            <Eye size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleVerifyPayment(report.id)}
                                                        className="group relative p-2 rounded-lg bg-green-100 hover:bg-green-600 text-green-600 hover:text-white transition-all"
                                                        title="Confirm Payment"
                                                    >
                                                        <CheckCircle size={20} />
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                            Confirm
                                                        </span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleRejectPayment(report.id)}
                                                        className="group relative p-2 rounded-lg bg-red-100 hover:bg-red-600 text-red-600 hover:text-white transition-all"
                                                        title="Reject Payment"
                                                    >
                                                        <XCircle size={20} />
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                            Reject
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* TAB CONTENT: History Log */}
                {activeTab === 'history' && (
                    <div className="space-y-4">
                        {/* Filter Toolbar */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter size={18} className="text-gray-500" />
                                <span className="text-sm font-semibold text-gray-700">Filters:</span>
                            </div>

                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Types</option>
                                <option value="visit">Field Visits</option>
                                <option value="payment">Payments</option>
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>

                            <div className="ml-auto text-sm text-gray-500">
                                {filteredHistory.length} {filteredHistory.length === 1 ? 'record' : 'records'}
                            </div>
                        </div>

                        {/* History Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {filteredHistory.length === 0 ? (
                                <div className="p-16 text-center">
                                    <HistoryIcon size={64} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-lg font-semibold">No history records</p>
                                    <p className="text-gray-400 text-sm mt-1">Processed validations will appear here</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Processed</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Collector & Debtor</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredHistory.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm font-medium text-gray-900">{formatDate(log.processedAt)}</p>
                                                    <p className="text-xs text-gray-500">{formatTime(log.processedAt)}</p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.type === 'visit' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                        {log.type === 'visit' ? 'Visit' : 'Payment'}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{log.collectorName}</p>
                                                        <p className="text-xs text-gray-500">{log.branch}</p>
                                                        <p className="text-xs text-gray-600 mt-1">→ {log.debtorName}</p>
                                                        <p className="text-xs text-gray-500 font-mono">{log.loanId}</p>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    {log.type === 'payment' ? (
                                                        <div>
                                                            <p className="text-lg font-bold text-green-600 font-mono">
                                                                {formatRupiah(log.amount || 0)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{log.paymentMethod}</p>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                <MapPin size={12} className={log.coordinates ? 'text-green-600' : 'text-gray-400'} />
                                                                <span className={log.coordinates ? 'text-green-700' : 'text-gray-500'}>
                                                                    {log.coordinates ? 'GPS OK' : 'No GPS'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                                                <Camera size={12} className={log.photosValid ? 'text-green-600' : 'text-amber-600'} />
                                                                <span className={log.photosValid ? 'text-green-700' : 'text-amber-700'}>
                                                                    {log.photosValid ? 'Photos OK' : 'Time Issue'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${log.status === 'APPROVED'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {log.status === 'APPROVED' ? '✓ APPROVED' : '✗ REJECTED'}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

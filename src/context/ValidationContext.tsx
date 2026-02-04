'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useAssets } from './AssetContext';

// Photo Evidence structure
export interface PhotoEvidence {
    front: string;
    side: string;
    withDebtor: string | null;
}

export interface PhotoTimestamps {
    front: string;
    side: string;
    withDebtor: string | null;
}

export interface FacilitiesDistance {
    school: boolean;
    mall: boolean;
    hospital: boolean;
    cityCenter: boolean;
}

// FIELD VISIT REPORT (Visit Reports)
export interface VisitReport {
    id: string;
    collectorId: string;
    collectorName: string;

    // A. AUTO-FILLED DATA (Read Only)
    branch: string;
    region: string;
    loanId: string;
    debtorName: string;
    debtorPhone: string;
    collateralAddress: string;

    // B. INTERVIEW RESULT (Manual Input)
    problemDescription: string;
    commitmentDate: string | null;

    // C. COLLATERAL ASSESSMENT (Manual Input)
    collateralStatus: 'Dihuni' | 'Tidak Dihuni';
    collateralCondition: 'Terawat' | 'Rusak';
    hasElectricity: boolean;
    hasWater: boolean;
    facilitiesDistance: FacilitiesDistance;
    isMarketable: boolean;

    // D. EVIDENCE (Manual Input)
    coordinates: string;
    photoEvidence: PhotoEvidence;
    photoTimestamps: PhotoTimestamps;
    submissionDate: string;

    // E. STATUS
    status: 'Pending' | 'Approved' | 'Rejected';
    rejectionReason?: string;
    processedAt?: string;
}

// PAYMENT COLLECTION REPORT (Payment Reports)
export interface PaymentReport {
    id: string;
    collectorId: string;
    collectorName: string;
    loanId: string;
    debtorName: string;
    branch: string;
    timestamp: string;

    // Payment-specific fields
    paymentMethod: 'Transfer' | 'Virtual Account';
    paymentStatus: 'full' | 'partial' | 'failed';
    paidAmount: number;
    promiseAmount: number;
    evidencePhoto: string;
    newPromiseDate?: string;
    failureReason?: string;

    // Status
    status: 'PENDING' | 'MATCHED' | 'REJECTED';
    rejectionReason?: string;
    processedAt?: string;
}

// Helper to get collateral label
export function getCollateralLabel(address: string): string {
    if (!address || address === '-' || address.trim() === '') {
        return 'Kredit Tanpa Agunan';
    }
    return address;
}

// Check if photo timestamp is valid (within 30 minutes of submission)
export function isTimestampValid(photoTime: string | null, submitTime: string): boolean {
    if (!photoTime) return false;
    const photoDt = new Date(photoTime).getTime();
    const submitDt = new Date(submitTime).getTime();
    const diffMinutes = Math.abs(submitDt - photoDt) / 60000;
    return diffMinutes <= 30;
}

// Check if all required photos have valid timestamps
export function allPhotosValid(report: VisitReport): boolean {
    const frontValid = isTimestampValid(report.photoTimestamps.front, report.submissionDate);
    const sideValid = isTimestampValid(report.photoTimestamps.side, report.submissionDate);
    const debiturValid = report.photoTimestamps.withDebtor ? isTimestampValid(report.photoTimestamps.withDebtor, report.submissionDate) : true;
    return frontValid && sideValid && debiturValid;
}

// Check if has required photos (front + side minimum)
export function hasRequiredPhotos(report: VisitReport): boolean {
    return !!report.photoEvidence.front && !!report.photoEvidence.side;
}

// Check if has coordinates
export function hasCoordinates(report: VisitReport): boolean {
    return !!report.coordinates && report.coordinates.trim() !== '';
}

// Initial visit reports - empty for production (data from database)
const initialVisitReports: VisitReport[] = [];

// Initial payment reports - empty for production (data from database)
const initialPaymentReports: PaymentReport[] = [];

// Context type
interface ValidationContextType {
    // Visit Reports
    fieldReports: VisitReport[];
    verifyVisit: (id: string) => void;
    rejectVisit: (id: string, reason: string) => void;
    getFieldPendingCount: () => number;
    getFieldSuspiciousCount: () => number;

    // Payment Reports
    paymentReports: PaymentReport[];
    verifyPayment: (id: string) => void;
    rejectPayment: (id: string, reason: string) => void;
    getPaymentPendingCount: () => number;

    // Submission functions (called from mobile)
    submitVisitReport: (report: Omit<VisitReport, 'id' | 'status'>) => void;
    submitPaymentReport: (report: Omit<PaymentReport, 'id' | 'status'>) => void;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

export function ValidationProvider({ children }: { children: ReactNode }) {
    const [fieldReports, setFieldReports] = useState<VisitReport[]>([...initialVisitReports]);
    const [paymentReports, setPaymentReports] = useState<PaymentReport[]>([...initialPaymentReports]);

    // Visit Report Functions
    const verifyVisit = (id: string) => {
        setFieldReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Approved' as const, processedAt: new Date().toISOString() } : r)));
    };

    const rejectVisit = (id: string, reason: string) => {
        setFieldReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' as const, rejectionReason: reason, processedAt: new Date().toISOString() } : r)));
    };

    const getFieldPendingCount = () => fieldReports.filter((r) => r.status === 'Pending').length;
    const getFieldSuspiciousCount = () => fieldReports.filter((r) => r.status === 'Pending' && !allPhotosValid(r)).length;

    // Payment Report Functions
    const verifyPayment = (id: string) => {
        const report = paymentReports.find(r => r.id === id);
        if (!report) return;

        // Update report status
        setPaymentReports(prev =>
            prev.map(r => r.id === id
                ? { ...r, status: 'MATCHED' as const, processedAt: new Date().toISOString() }
                : r
            )
        );

        // Note: Auto-balance update will be called from the UI component
        // which has access to useAssets().updateAssetBalance()
    };

    const rejectPayment = (id: string, reason: string) => {
        setPaymentReports(prev =>
            prev.map(r => r.id === id
                ? { ...r, status: 'REJECTED' as const, rejectionReason: reason, processedAt: new Date().toISOString() }
                : r
            )
        );
    };

    const getPaymentPendingCount = () => paymentReports.filter((r) => r.status === 'PENDING').length;

    // Submission Functions (called from mobile)
    const submitVisitReport = (report: Omit<VisitReport, 'id' | 'status'>) => {
        const newReport: VisitReport = {
            ...report,
            id: `VR-${Date.now()}`,
            status: 'Pending',
        };
        setFieldReports(prev => [newReport, ...prev]);
    };

    const submitPaymentReport = (report: Omit<PaymentReport, 'id' | 'status'>) => {
        const newReport: PaymentReport = {
            ...report,
            id: `PR-${Date.now()}`,
            status: 'PENDING',
        };
        setPaymentReports(prev => [newReport, ...prev]);
    };

    return (
        <ValidationContext.Provider
            value={{
                fieldReports,
                verifyVisit,
                rejectVisit,
                getFieldPendingCount,
                getFieldSuspiciousCount,
                paymentReports,
                verifyPayment,
                rejectPayment,
                getPaymentPendingCount,
                submitVisitReport,
                submitPaymentReport,
            }}
        >
            {children}
        </ValidationContext.Provider>
    );
}

export function useValidation() {
    const context = useContext(ValidationContext);
    if (context === undefined) throw new Error('useValidation must be used within a ValidationProvider');
    return context;
}

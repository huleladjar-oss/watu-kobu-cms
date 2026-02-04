'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Comprehensive Asset interface matching Bank data standards (24 columns)
export interface Asset {
    id: string;             // System ID (UUID)

    // A. IDENTITAS DEBITUR
    loanId: string;         // NOMOR ACCOUNT / ACCTNO
    debtorName: string;     // NAMA DEBITUR
    identityAddress: string;// ALAMAT KTP / alamat_dev
    officeAddress: string;  // ALAMAT KANTOR
    phone: string;          // NO TELEPON DEBITUR (HP1 + HP2)
    officePhone: string;    // NO TELEPON KANTOR

    // B. EMERGENCY CONTACT
    emergencyName: string;  // NAMA EMERGENCY KONTAK / nama_darurat
    emergencyPhone: string; // NOMOR TELEPON EMERGENCY / HP_darurat
    emergencyAddress: string;// ALAMAT EMERGENCY

    // C. DATA KREDIT & AGUNAN
    branch: string;         // KANTOR CABANG / CABANG
    region: string;         // KANWIL / ARCOLL
    spkStatus: 'AKTIF' | 'PASIF'; // KELOLAAN TERBIT SPK / kelolaan
    creditType: string;     // JENIS KREDIT / JENIS_KREDIT01
    collateralAddress: string; // ALAMAT AGUNAN / alamat_agunan

    // D. FINANCIAL DATA
    initialPlafond: number; // PLAFOND AWAL / PLAFON
    realizationDate: string;// TANGGAL REALISASI
    maturityDate: string;   // TANGGAL JATUH TEMPO
    principalBalance: number; // SALDO POKOK (CBAL)
    interestArrears: number;  // TUNGGAKAN BUNGA / tgk_bunga01
    penaltyArrears: number;   // TUNGGAKAN DENDA / tgk_denda01
    principalArrears: number; // TUNGGAKAN POKOK/ANGSURAN
    totalArrears: number;     // TOTAL TUNGGAKAN / total_tgk
    totalPayoff: number;      // LUNAS KREDIT / lunas_kredit

    // E. SYSTEM
    collectorId: string | null;
    lastUpdate: string;
}

// Collector type (for reference - data now fetched from /api/users?role=COLLECTOR)
export interface Collector {
    id: string;
    name: string;
    email?: string;
    area: string;
    assignedCount: number;
}

// Context type
interface AssetContextType {
    assets: Asset[];
    isLoading: boolean;
    error: string | null;
    addAsset: (asset: Omit<Asset, 'id' | 'lastUpdate'>) => Promise<void>;
    importAssets: (newAssets: Omit<Asset, 'id' | 'lastUpdate'>[]) => Promise<number>;
    updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
    updateAssetBalance: (loanId: string, paymentAmount: number) => void;
    deleteAsset: (id: string) => Promise<void>;
    deleteBulkAssets: (ids: string[]) => Promise<number>;
    assignAsset: (assetId: string, collectorId: string) => Promise<void>;
    assignBulkAssets: (assetIds: string[], collectorId: string) => Promise<number>;
    unassignAsset: (assetId: string) => Promise<void>;
    refreshAssets: () => Promise<void>;
    getUnassignedAssets: () => Asset[];
    getAssetsByCollector: (collectorId: string) => Asset[];
    getAssetById: (id: string) => Asset | undefined;
    getAssetStats: () => {
        total: number;
        totalArrears: number;
        activeCount: number;
        passiveCount: number;
        unassignedCount: number;
    };
    getRecentAssets: (limit?: number) => Asset[];
}

// Create context
const AssetContext = createContext<AssetContextType | undefined>(undefined);

// Provider component
export function AssetProvider({ children }: { children: ReactNode }) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch assets from database on mount
    const fetchAssets = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('/api/assets');
            const data = await response.json();

            if (data.success) {
                setAssets(data.data);
            } else {
                setError(data.error || 'Failed to fetch assets');
            }
        } catch (err) {
            console.error('Error fetching assets:', err);
            setError('Failed to connect to database');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    // Add new asset
    const addAsset = async (asset: Omit<Asset, 'id' | 'lastUpdate'>) => {
        try {
            const response = await fetch('/api/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(asset),
            });
            const data = await response.json();

            if (data.success) {
                await fetchAssets(); // Refresh from DB
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error('Error adding asset:', err);
            throw err;
        }
    };

    // Import multiple assets
    const importAssets = async (newAssets: Omit<Asset, 'id' | 'lastUpdate'>[]): Promise<number> => {
        let successCount = 0;
        for (const asset of newAssets) {
            try {
                await addAsset(asset);
                successCount++;
            } catch (err) {
                console.error('Error importing asset:', err);
            }
        }
        await fetchAssets();
        return successCount;
    };

    // Update asset
    const updateAsset = async (id: string, updates: Partial<Asset>) => {
        try {
            const response = await fetch(`/api/assets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            const data = await response.json();

            if (data.success) {
                // Update local state optimistically
                setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error('Error updating asset:', err);
            throw err;
        }
    };

    // Update asset balance (local only for now)
    const updateAssetBalance = (loanId: string, paymentAmount: number) => {
        setAssets(prev => prev.map(asset =>
            asset.loanId === loanId
                ? {
                    ...asset,
                    totalArrears: Math.max(0, asset.totalArrears - paymentAmount),
                    lastUpdate: new Date().toISOString().split('T')[0]
                }
                : asset
        ));
    };

    // Delete asset
    const deleteAsset = async (id: string) => {
        try {
            const response = await fetch(`/api/assets/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.success) {
                setAssets(prev => prev.filter(a => a.id !== id));
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error('Error deleting asset:', err);
            throw err;
        }
    };

    // Delete multiple assets
    const deleteBulkAssets = async (ids: string[]): Promise<number> => {
        let successCount = 0;
        for (const id of ids) {
            try {
                await deleteAsset(id);
                successCount++;
            } catch (err) {
                console.error('Error deleting asset:', err);
            }
        }
        return successCount;
    };

    // Assign asset to collector
    const assignAsset = async (assetId: string, collectorId: string) => {
        try {
            const response = await fetch('/api/assets/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetIds: [assetId], collectorId }),
            });
            const data = await response.json();

            if (data.success) {
                setAssets(prev => prev.map(a =>
                    a.id === assetId ? { ...a, collectorId } : a
                ));
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error('Error assigning asset:', err);
            throw err;
        }
    };

    // Bulk assign assets
    const assignBulkAssets = async (assetIds: string[], collectorId: string): Promise<number> => {
        try {
            const response = await fetch('/api/assets/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetIds, collectorId }),
            });
            const data = await response.json();

            if (data.success) {
                const idsSet = new Set(assetIds);
                setAssets(prev => prev.map(a =>
                    idsSet.has(a.id) ? { ...a, collectorId } : a
                ));
                return data.data.assignedCount;
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error('Error bulk assigning assets:', err);
            throw err;
        }
    };

    // Unassign asset
    const unassignAsset = async (assetId: string) => {
        try {
            const response = await fetch(`/api/assets/${assetId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collectorId: null }),
            });
            const data = await response.json();

            if (data.success) {
                setAssets(prev => prev.map(a =>
                    a.id === assetId ? { ...a, collectorId: null } : a
                ));
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error('Error unassigning asset:', err);
            throw err;
        }
    };

    // Refresh assets from database
    const refreshAssets = async () => {
        await fetchAssets();
    };

    // Get unassigned assets
    const getUnassignedAssets = () => {
        return assets.filter(asset => asset.collectorId === null);
    };

    // Get assets by collector
    const getAssetsByCollector = (collectorId: string) => {
        return assets.filter(asset => asset.collectorId === collectorId);
    };

    // Get asset by ID
    const getAssetById = (id: string) => {
        return assets.find(asset => asset.id === id);
    };

    // Get asset statistics
    const getAssetStats = () => {
        const total = assets.length;
        const totalArrears = assets.reduce((sum, a) => sum + a.totalArrears, 0);
        const activeCount = assets.filter(a => a.spkStatus === 'AKTIF').length;
        const passiveCount = assets.filter(a => a.spkStatus === 'PASIF').length;
        const unassignedCount = assets.filter(a => a.collectorId === null).length;

        return {
            total,
            totalArrears,
            activeCount,
            passiveCount,
            unassignedCount,
        };
    };

    // Get recent assets
    const getRecentAssets = (limit: number = 5) => {
        return [...assets]
            .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
            .slice(0, limit);
    };

    return (
        <AssetContext.Provider
            value={{
                assets,
                isLoading,
                error,
                addAsset,
                importAssets,
                updateAsset,
                updateAssetBalance,
                deleteAsset,
                deleteBulkAssets,
                assignAsset,
                assignBulkAssets,
                unassignAsset,
                refreshAssets,
                getUnassignedAssets,
                getAssetsByCollector,
                getAssetById,
                getAssetStats,
                getRecentAssets,
            }}
        >
            {children}
        </AssetContext.Provider>
    );
}

// Custom hook to use asset context
export function useAssets() {
    const context = useContext(AssetContext);
    if (context === undefined) {
        throw new Error('useAssets must be used within an AssetProvider');
    }
    return context;
}

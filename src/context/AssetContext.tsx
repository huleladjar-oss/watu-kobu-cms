'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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

// NOTE: Mock collectors removed - now fetched from database via API

// Initial mock assets with comprehensive structure
const initialAssets: Asset[] = [
    {
        id: 'WK-1001',
        loanId: '0012345678',
        debtorName: 'Ahmad Wijaya',
        identityAddress: 'Jl. Sudirman No. 123, Jakarta Selatan',
        officeAddress: 'Gedung Graha Mandiri Lt. 5',
        phone: '081234567890',
        officePhone: '021-5555555',
        emergencyName: 'Siti Wijaya',
        emergencyPhone: '081298765432',
        emergencyAddress: 'Jl. Merdeka No. 45, Jakarta Pusat',
        branch: 'KCP JAKARTA SELATAN',
        region: 'KANWIL JAKARTA 1',
        spkStatus: 'AKTIF',
        creditType: 'KPR',
        collateralAddress: 'Jl. Menteng Raya No. 10',
        initialPlafond: 500000000,
        realizationDate: '2023-01-15',
        maturityDate: '2028-01-15',
        principalBalance: 350000000,
        interestArrears: 5000000,
        penaltyArrears: 1500000,
        principalArrears: 8000000,
        totalArrears: 14500000,
        totalPayoff: 365000000,
        collectorId: '3',
        lastUpdate: '2026-01-30',
    },
    {
        id: 'WK-1002',
        loanId: '0012345679',
        debtorName: 'Dewi Lestari',
        identityAddress: 'Jl. Margonda Raya No. 88, Depok',
        officeAddress: 'PT. Maju Jaya, Depok',
        phone: '082345678901',
        officePhone: '021-6666666',
        emergencyName: 'Budi Lestari',
        emergencyPhone: '082198765432',
        emergencyAddress: 'Jl. Diponegoro No. 12, Depok',
        branch: 'KCP DEPOK',
        region: 'KANWIL JABAR',
        spkStatus: 'AKTIF',
        creditType: 'KMK',
        collateralAddress: 'Jl. Raya Bogor Km 30',
        initialPlafond: 200000000,
        realizationDate: '2024-03-20',
        maturityDate: '2027-03-20',
        principalBalance: 180000000,
        interestArrears: 2000000,
        penaltyArrears: 500000,
        principalArrears: 3000000,
        totalArrears: 5500000,
        totalPayoff: 186000000,
        collectorId: '3',
        lastUpdate: '2026-01-29',
    },
    {
        id: 'WK-1003',
        loanId: '0012345680',
        debtorName: 'Hendra Gunawan',
        identityAddress: 'Jl. Pajajaran No. 55, Bogor',
        officeAddress: 'CV Sukses Makmur',
        phone: '083456789012',
        officePhone: '0251-333333',
        emergencyName: 'Rina Gunawan',
        emergencyPhone: '083198765432',
        emergencyAddress: 'Jl. Surya Kencana No. 8, Bogor',
        branch: 'KCP BOGOR',
        region: 'KANWIL JABAR',
        spkStatus: 'AKTIF',
        creditType: 'KPR',
        collateralAddress: 'Perumahan Cibinong Indah Blok A5',
        initialPlafond: 750000000,
        realizationDate: '2022-06-10',
        maturityDate: '2032-06-10',
        principalBalance: 620000000,
        interestArrears: 15000000,
        penaltyArrears: 3000000,
        principalArrears: 25000000,
        totalArrears: 43000000,
        totalPayoff: 665000000,
        collectorId: '3',
        lastUpdate: '2026-01-28',
    },
    {
        id: 'WK-1004',
        loanId: '0012345681',
        debtorName: 'Siti Nurhaliza',
        identityAddress: 'Jl. BSD Raya No. 101, Tangerang',
        officeAddress: 'Mall BSD City',
        phone: '084567890123',
        officePhone: '021-7777777',
        emergencyName: 'Ahmad Nurhaliza',
        emergencyPhone: '084198765432',
        emergencyAddress: 'Jl. Serpong No. 20, Tangerang',
        branch: 'KCP TANGERANG',
        region: 'KANWIL BANTEN',
        spkStatus: 'PASIF',
        creditType: 'KMK',
        collateralAddress: 'Ruko BSD Junction Blok B12',
        initialPlafond: 150000000,
        realizationDate: '2024-01-05',
        maturityDate: '2026-01-05',
        principalBalance: 50000000,
        interestArrears: 0,
        penaltyArrears: 0,
        principalArrears: 0,
        totalArrears: 0,
        totalPayoff: 50000000,
        collectorId: '3',
        lastUpdate: '2026-01-27',
    },
    {
        id: 'WK-1005',
        loanId: '0012345682',
        debtorName: 'Rudi Hartono',
        identityAddress: 'Jl. Ahmad Yani No. 77, Bekasi',
        officeAddress: 'PT. Hartono Group',
        phone: '085678901234',
        officePhone: '021-8888888',
        emergencyName: 'Linda Hartono',
        emergencyPhone: '085198765432',
        emergencyAddress: 'Jl. Kalimalang No. 15, Bekasi',
        branch: 'KCP BEKASI',
        region: 'KANWIL JABAR',
        spkStatus: 'AKTIF',
        creditType: 'KPR',
        collateralAddress: 'Perumahan Harapan Indah Blok C8',
        initialPlafond: 450000000,
        realizationDate: '2023-09-01',
        maturityDate: '2033-09-01',
        principalBalance: 420000000,
        interestArrears: 8000000,
        penaltyArrears: 2000000,
        principalArrears: 12000000,
        totalArrears: 22000000,
        totalPayoff: 442000000,
        collectorId: null,
        lastUpdate: '2026-01-26',
    },
    {
        id: 'WK-1006',
        loanId: '0012345683',
        debtorName: 'Maria Theresia',
        identityAddress: 'Jl. Gajah Mada No. 200, Jakarta Barat',
        officeAddress: 'Glodok Plaza',
        phone: '086789012345',
        officePhone: '021-9999999',
        emergencyName: 'Yohanes Theresia',
        emergencyPhone: '086198765432',
        emergencyAddress: 'Jl. Hayam Wuruk No. 30, Jakarta Barat',
        branch: 'KCP JAKARTA BARAT',
        region: 'KANWIL JAKARTA 2',
        spkStatus: 'AKTIF',
        creditType: 'KMK',
        collateralAddress: 'Ruko Grogol Blok F15',
        initialPlafond: 300000000,
        realizationDate: '2024-05-15',
        maturityDate: '2027-05-15',
        principalBalance: 280000000,
        interestArrears: 4000000,
        penaltyArrears: 1000000,
        principalArrears: 5000000,
        totalArrears: 10000000,
        totalPayoff: 290000000,
        collectorId: '3',
        lastUpdate: '2026-01-25',
    },
    {
        id: 'WK-1007',
        loanId: '0012345684',
        debtorName: 'Bambang Sutrisno',
        identityAddress: 'Jl. Pramuka No. 150, Jakarta Timur',
        officeAddress: 'Pasar Jatinegara',
        phone: '087890123456',
        officePhone: '021-4444444',
        emergencyName: 'Sumiati Sutrisno',
        emergencyPhone: '087198765432',
        emergencyAddress: 'Jl. Matraman No. 25, Jakarta Timur',
        branch: 'KCP JAKARTA TIMUR',
        region: 'KANWIL JAKARTA 1',
        spkStatus: 'AKTIF',
        creditType: 'KPR',
        collateralAddress: 'Perumahan Cakung Indah Blok D10',
        initialPlafond: 600000000,
        realizationDate: '2021-12-01',
        maturityDate: '2031-12-01',
        principalBalance: 480000000,
        interestArrears: 25000000,
        penaltyArrears: 8000000,
        principalArrears: 45000000,
        totalArrears: 78000000,
        totalPayoff: 558000000,
        collectorId: null,
        lastUpdate: '2026-01-15',
    },
    {
        id: 'WK-1008',
        loanId: '0012345685',
        debtorName: 'Eko Prasetyo',
        identityAddress: 'Jl. Yos Sudarso No. 88, Jakarta Utara',
        officeAddress: 'Pelabuhan Tanjung Priok',
        phone: '088901234567',
        officePhone: '021-2222222',
        emergencyName: 'Dwi Prasetyo',
        emergencyPhone: '088198765432',
        emergencyAddress: 'Jl. Pluit No. 10, Jakarta Utara',
        branch: 'KCP JAKARTA UTARA',
        region: 'KANWIL JAKARTA 2',
        spkStatus: 'AKTIF',
        creditType: 'KMK',
        collateralAddress: 'Gudang Sunter Blok M5',
        initialPlafond: 400000000,
        realizationDate: '2022-08-20',
        maturityDate: '2025-08-20',
        principalBalance: 150000000,
        interestArrears: 12000000,
        penaltyArrears: 5000000,
        principalArrears: 18000000,
        totalArrears: 35000000,
        totalPayoff: 185000000,
        collectorId: '4',
        lastUpdate: '2026-01-10',
    },
];

// New asset input type (without ID)
export type NewAssetInput = Omit<Asset, 'id'>;

// Context type
interface AssetContextType {
    assets: Asset[];
    addAsset: (newAsset: NewAssetInput) => Asset;
    importAssets: (newAssets: Asset[]) => number;
    updateAsset: (id: string, updatedData: Partial<Asset>) => void;
    updateAssetBalance: (loanId: string, paymentAmount: number) => void;
    deleteAsset: (id: string) => void;
    deleteBulkAssets: (ids: string[]) => number;
    assignAsset: (assetId: string, collectorId: string) => void;
    assignBulkAssets: (assetIds: string[], collectorId: string) => number;
    unassignAsset: (assetId: string) => void;
    refreshAssets: () => void;
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
    getRecentAssets: (limit: number) => Asset[];
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

// Generate unique ID
function generateAssetId(): string {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `WK-${randomNum}`;
}

// Sanitize collateral address - convert empty/null/'-' to 'Kredit Tanpa Agunan'
export function sanitizeCollateralAddress(address: string | null | undefined): string {
    if (!address) return 'Kredit Tanpa Agunan';
    const trimmed = address.trim();
    if (trimmed === '' || trimmed === '-' || trimmed === '0') {
        return 'Kredit Tanpa Agunan';
    }
    return trimmed;
}

export function AssetProvider({ children }: { children: ReactNode }) {
    const [assets, setAssets] = useState<Asset[]>([...initialAssets]);

    // Add new asset
    const addAsset = (newAsset: NewAssetInput): Asset => {
        const asset: Asset = {
            ...newAsset,
            id: generateAssetId(),
            collateralAddress: sanitizeCollateralAddress(newAsset.collateralAddress),
        };
        setAssets((prev) => [asset, ...prev]);
        return asset;
    };

    // Import multiple assets (for CSV import)
    const importAssets = (newAssets: Asset[]): number => {
        // Filter out duplicates by loanId and sanitize collateral addresses
        const existingLoanIds = new Set(assets.map((a) => a.loanId));
        const uniqueNewAssets = newAssets
            .filter((a) => !existingLoanIds.has(a.loanId))
            .map((asset) => ({
                ...asset,
                collateralAddress: sanitizeCollateralAddress(asset.collateralAddress),
            }));

        if (uniqueNewAssets.length > 0) {
            setAssets((prev) => [...uniqueNewAssets, ...prev]);
        }

        return uniqueNewAssets.length;
    };

    // Update existing asset
    const updateAsset = (id: string, updatedData: Partial<Asset>) => {
        setAssets((prevAssets) =>
            prevAssets.map((asset) =>
                asset.id === id
                    ? {
                        ...asset,
                        ...updatedData,
                        lastUpdate: new Date().toISOString().split('T')[0],
                    }
                    : asset
            )
        );
    };

    // Delete asset
    const deleteAsset = (id: string) => {
        setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== id));
    };

    // Delete multiple assets (bulk delete)
    const deleteBulkAssets = (ids: string[]): number => {
        const idsSet = new Set(ids);
        setAssets((prevAssets) => prevAssets.filter((asset) => !idsSet.has(asset.id)));
        return ids.length;
    };

    // Assign asset to a collector
    const assignAsset = (assetId: string, collectorId: string) => {
        setAssets((prevAssets) =>
            prevAssets.map((asset) =>
                asset.id === assetId
                    ? {
                        ...asset,
                        collectorId,
                        lastUpdate: new Date().toISOString().split('T')[0],
                    }
                    : asset
            )
        );
    };

    // Unassign asset from collector
    const unassignAsset = (assetId: string) => {
        setAssets((prevAssets) =>
            prevAssets.map((asset) =>
                asset.id === assetId
                    ? {
                        ...asset,
                        collectorId: null,
                        lastUpdate: new Date().toISOString().split('T')[0],
                    }
                    : asset
            )
        );
    };

    // Bulk assign assets to a collector
    const assignBulkAssets = (assetIds: string[], collectorId: string): number => {
        const idsSet = new Set(assetIds);
        setAssets((prevAssets) =>
            prevAssets.map((asset) =>
                idsSet.has(asset.id)
                    ? {
                        ...asset,
                        collectorId,
                        lastUpdate: new Date().toISOString().split('T')[0],
                    }
                    : asset
            )
        );
        return assetIds.length;
    };

    // Reset assets to initial data
    const refreshAssets = () => {
        setAssets([...initialAssets]);
    };

    // Get unassigned assets
    const getUnassignedAssets = () => {
        return assets.filter((asset) => asset.collectorId === null);
    };

    // Get assets by collector
    const getAssetsByCollector = (collectorId: string) => {
        return assets.filter((asset) => asset.collectorId === collectorId);
    };

    // Get asset by ID
    const getAssetById = (id: string) => {
        return assets.find((asset) => asset.id === id);
    };

    // Get asset statistics
    const getAssetStats = () => {
        const total = assets.length;
        const totalArrears = assets.reduce((sum, a) => sum + a.totalArrears, 0);
        const activeCount = assets.filter((a) => a.spkStatus === 'AKTIF').length;
        const passiveCount = assets.filter((a) => a.spkStatus === 'PASIF').length;
        const unassignedCount = assets.filter((a) => a.collectorId === null).length;

        return {
            total,
            totalArrears,
            activeCount,
            passiveCount,
            unassignedCount,
        };
    };

    // Update asset balance after payment verification
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

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Type for Asset response
interface AssetResponse {
    id: string;
    loanId: string;
    debtorName: string;
    identityAddress: string;
    officeAddress: string;
    phone: string;
    officePhone: string;
    emergencyName: string;
    emergencyPhone: string;
    emergencyAddress: string;
    branch: string;
    region: string;
    spkStatus: 'AKTIF' | 'PASIF';
    creditType: string;
    collateralAddress: string;
    initialPlafond: number;
    realizationDate: string;
    maturityDate: string;
    principalBalance: number;
    interestArrears: number;
    penaltyArrears: number;
    principalArrears: number;
    totalArrears: number;
    totalPayoff: number;
    collectorId: string | null;
    lastUpdate: string;
}

// GET /api/assets - Fetch all assets from database
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const collectorId = searchParams.get('collectorId');
        const unassignedOnly = searchParams.get('unassigned') === 'true';

        // Build where clause
        const where: { collectorId?: string | null } = {};

        if (collectorId) {
            where.collectorId = collectorId;
        }

        if (unassignedOnly) {
            where.collectorId = null;
        }

        const assets = await prisma.asset.findMany({
            where,
            include: {
                branch: {
                    select: {
                        name: true,
                        region: true,
                    },
                },
                collector: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                totalArrears: 'desc',
            },
        });

        // Transform to frontend format
        const transformedAssets: AssetResponse[] = assets.map((asset) => ({
            id: asset.id,
            loanId: asset.loanId,
            debtorName: asset.debtorName,
            identityAddress: asset.identityAddress || '',
            officeAddress: asset.officeAddress || '',
            phone: asset.phone || '',
            officePhone: asset.officePhone || '',
            emergencyName: asset.emergencyName || '',
            emergencyPhone: asset.emergencyPhone || '',
            emergencyAddress: asset.emergencyAddress || '',
            branch: asset.branch?.name || '',
            region: asset.branch?.region || '',
            spkStatus: asset.spkStatus as 'AKTIF' | 'PASIF',
            creditType: asset.creditType || '',
            collateralAddress: asset.collateralAddress || '',
            initialPlafond: asset.initialPlafond,
            realizationDate: asset.realizationDate?.toISOString().split('T')[0] || '',
            maturityDate: asset.maturityDate?.toISOString().split('T')[0] || '',
            principalBalance: asset.principalBalance,
            interestArrears: asset.interestArrears,
            penaltyArrears: asset.penaltyArrears,
            principalArrears: asset.principalArrears,
            totalArrears: asset.totalArrears,
            totalPayoff: asset.totalPayoff,
            collectorId: asset.collectorId,
            lastUpdate: asset.updatedAt.toISOString().split('T')[0],
        }));

        return NextResponse.json({
            success: true,
            data: transformedAssets,
            count: transformedAssets.length,
        });
    } catch (error) {
        console.error('Error fetching assets:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch assets' },
            { status: 500 }
        );
    }
}

// POST /api/assets - Create new asset
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Find or create branch
        let branchRecord = await prisma.branch.findFirst({
            where: { name: body.branch },
        });

        if (!branchRecord && body.branch) {
            branchRecord = await prisma.branch.create({
                data: {
                    name: body.branch,
                    region: body.region || 'Unknown',
                },
            });
        }

        const asset = await prisma.asset.create({
            data: {
                loanId: body.loanId,
                debtorName: body.debtorName,
                identityAddress: body.identityAddress || '',
                officeAddress: body.officeAddress || '',
                phone: body.phone || '',
                officePhone: body.officePhone || '',
                emergencyName: body.emergencyName || '',
                emergencyPhone: body.emergencyPhone || '',
                emergencyAddress: body.emergencyAddress || '',
                branchId: branchRecord?.id || null,
                spkStatus: body.spkStatus || 'AKTIF',
                creditType: body.creditType || '',
                collateralAddress: body.collateralAddress || '',
                initialPlafond: Number(body.initialPlafond) || 0,
                realizationDate: body.realizationDate ? new Date(body.realizationDate) : null,
                maturityDate: body.maturityDate ? new Date(body.maturityDate) : null,
                principalBalance: Number(body.principalBalance) || 0,
                interestArrears: Number(body.interestArrears) || 0,
                penaltyArrears: Number(body.penaltyArrears) || 0,
                principalArrears: Number(body.principalArrears) || 0,
                totalArrears: Number(body.totalArrears) || 0,
                totalPayoff: Number(body.totalPayoff) || 0,
                collectorId: body.collectorId || null,
            },
        });

        return NextResponse.json({
            success: true,
            data: asset,
        });
    } catch (error) {
        console.error('Error creating asset:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create asset' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/collector/dashboard - Get collector's task status with visit data
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Get today's start & end for daily visit count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 1. Get today's visit count for this collector
        const todayVisits = await prisma.visitReport.count({
            where: {
                collectorId: userId,
                timestamp: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        // 2. Get all asset IDs that have been visited by this collector (ever)
        const visitedAssets = await prisma.visitReport.findMany({
            where: {
                collectorId: userId,
            },
            select: {
                assetId: true,
            },
            distinct: ['assetId'],
        });
        const visitedAssetIds = visitedAssets.map(v => v.assetId);

        // 3. Get all assets with JANJI_BAYAR status assigned to this collector
        const janjiBayarAssets = await prisma.asset.findMany({
            where: {
                collectorId: userId,
                status: 'JANJI_BAYAR',
            },
            select: { id: true },
        });
        const janjiBayarAssetIds = janjiBayarAssets.map(a => a.id);

        // 4. Get this month's total collected amount (approved payments)
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        const monthlyPayments = await prisma.paymentReport.aggregate({
            _sum: { amount: true },
            where: {
                collectorId: userId,
                statusValidation: 'APPROVED',
                timestamp: {
                    gte: firstDayOfMonth,
                    lte: lastDayOfMonth,
                },
            },
        });

        // 5. Count promise to pay (assets with JANJI_BAYAR status)
        const promiseToPayCount = janjiBayarAssetIds.length;

        // 6. Get asset IDs with PENDING visit reports (for "Menunggu Validasi" status)
        const pendingVisits = await prisma.visitReport.findMany({
            where: {
                collectorId: userId,
                statusValidation: 'PENDING',
            },
            select: { assetId: true },
            distinct: ['assetId'],
        });
        const pendingVisitAssetIds = pendingVisits.map(v => v.assetId);

        return NextResponse.json({
            success: true,
            data: {
                todayVisits,
                visitedAssetIds,
                janjiBayarAssetIds,
                pendingVisitAssetIds,
                collectedAmount: monthlyPayments._sum.amount || 0,
                promiseToPayCount,
            },
        });
    } catch (error) {
        console.error('Error fetching collector dashboard:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}

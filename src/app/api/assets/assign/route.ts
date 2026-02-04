import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/assets/assign - Bulk assign assets to collector
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { assetIds, collectorId } = body;

        if (!Array.isArray(assetIds) || assetIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'assetIds array is required' },
                { status: 400 }
            );
        }

        if (!collectorId) {
            return NextResponse.json(
                { success: false, error: 'collectorId is required' },
                { status: 400 }
            );
        }

        // Verify collector exists
        const collector = await prisma.user.findUnique({
            where: { id: collectorId },
        });

        if (!collector || collector.role !== 'COLLECTOR') {
            return NextResponse.json(
                { success: false, error: 'Invalid collector' },
                { status: 400 }
            );
        }

        // Bulk update assets with collectorId
        const result = await prisma.asset.updateMany({
            where: {
                id: { in: assetIds },
            },
            data: {
                collectorId: collectorId,
            },
        });

        // Create assignment records if needed
        for (const assetId of assetIds) {
            // Check if assignment already exists
            const existing = await prisma.assignment.findFirst({
                where: {
                    assetId,
                    userId: collectorId,
                    status: 'ACTIVE',
                },
            });

            if (!existing) {
                await prisma.assignment.create({
                    data: {
                        assetId,
                        userId: collectorId,
                        status: 'ACTIVE',
                    },
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `${result.count} assets assigned to ${collector.name}`,
            data: {
                assignedCount: result.count,
                collectorName: collector.name,
            },
        });
    } catch (error) {
        console.error('Error assigning assets:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to assign assets' },
            { status: 500 }
        );
    }
}

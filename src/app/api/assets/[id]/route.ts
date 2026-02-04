import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH /api/assets/[id] - Update asset (including assignment)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Update asset
        const asset = await prisma.asset.update({
            where: { id },
            data: {
                ...(body.collectorId !== undefined && { collectorId: body.collectorId }),
                ...(body.debtorName && { debtorName: body.debtorName }),
                ...(body.phone && { phone: body.phone }),
                ...(body.spkStatus && { spkStatus: body.spkStatus }),
                // Add more fields as needed
            },
        });

        return NextResponse.json({
            success: true,
            data: asset,
        });
    } catch (error) {
        console.error('Error updating asset:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update asset' },
            { status: 500 }
        );
    }
}

// DELETE /api/assets/[id] - Delete asset
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.asset.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Asset deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting asset:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete asset' },
            { status: 500 }
        );
    }
}

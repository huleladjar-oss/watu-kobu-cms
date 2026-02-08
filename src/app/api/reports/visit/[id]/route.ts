import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PATCH /api/reports/visit/[id] — Update visit report status (admin validation)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Only admin/manager can validate
        if (session.user.role === 'COLLECTOR') {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, rejectionReason } = body; // status: APPROVED or REJECTED

        if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Status must be APPROVED or REJECTED' },
                { status: 400 }
            );
        }

        const report = await prisma.visitReport.update({
            where: { id },
            data: {
                statusValidation: status,
                ...(rejectionReason ? { notes: rejectionReason } : {}),
            },
            include: {
                asset: {
                    select: { nomorAccount: true, namaDebitur: true },
                },
                collector: {
                    select: { name: true },
                },
            },
        });

        // On APPROVED: if visit report notes contain a commitment date, set asset to JANJI_BAYAR
        if (status === 'APPROVED' && report.notes && report.notes.includes('Komitmen:')) {
            await prisma.asset.update({
                where: { id: report.assetId },
                data: { status: 'JANJI_BAYAR' },
            });
        }

        return NextResponse.json({ success: true, data: report });
    } catch (error) {
        console.error('Error updating visit report:', error);
        return NextResponse.json({ success: false, error: 'Failed to update visit report' }, { status: 500 });
    }
}

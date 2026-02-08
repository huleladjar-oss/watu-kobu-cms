import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/reports/visit — Submit a new visit report (collector)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { assetId, outcome, notes, gpsLat, gpsLng, evidencePhoto, commitmentDate } = body;

        if (!assetId || !outcome) {
            return NextResponse.json({ success: false, error: 'assetId and outcome are required' }, { status: 400 });
        }

        // Create visit report
        const report = await prisma.visitReport.create({
            data: {
                assetId,
                collectorId: session.user.id,
                outcome,
                notes: notes || null,
                gpsLat: gpsLat || null,
                gpsLng: gpsLng || null,
                evidencePhoto: evidencePhoto || null,
                statusValidation: 'PENDING',
            },
            include: {
                asset: {
                    select: { nomorAccount: true, namaDebitur: true, kantorCabang: true, kanwil: true },
                },
                collector: {
                    select: { name: true },
                },
            },
        });

        // Note: Asset status (e.g. JANJI_BAYAR) should only change AFTER admin approves
        // The commitmentDate is stored in the report notes for admin review

        return NextResponse.json({ success: true, data: report }, { status: 201 });
    } catch (error) {
        console.error('Error creating visit report:', error);
        return NextResponse.json({ success: false, error: 'Failed to create visit report' }, { status: 500 });
    }
}

// GET /api/reports/visit — Fetch visit reports (admin)
// Query params: ?status=PENDING|APPROVED|REJECTED  (optional filter)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get('status'); // PENDING, APPROVED, REJECTED

        const where: Record<string, unknown> = {};
        if (statusFilter) {
            where.statusValidation = statusFilter;
        }

        // If collector, only show their reports
        if (session.user.role === 'COLLECTOR') {
            where.collectorId = session.user.id;
        }

        const reports = await prisma.visitReport.findMany({
            where,
            include: {
                asset: {
                    select: {
                        nomorAccount: true,
                        namaDebitur: true,
                        kantorCabang: true,
                        kanwil: true,
                        alamatAgunan: true,
                        nomorHp1Debitur: true,
                    },
                },
                collector: {
                    select: { name: true },
                },
            },
            orderBy: { timestamp: 'desc' },
        });

        return NextResponse.json({ success: true, data: reports });
    } catch (error) {
        console.error('Error fetching visit reports:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch visit reports' }, { status: 500 });
    }
}

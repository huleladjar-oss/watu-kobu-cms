import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/assets - Fetch all assets from database
// Returns both Indonesian (new) and English (legacy) field names for backward compatibility
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const collectorId = searchParams.get('collectorId');
        const unassignedOnly = searchParams.get('unassigned') === 'true';

        // Build where clause dynamically
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

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
                totalTunggakan: 'desc',
            },
        });

        // Transform to frontend format with backward-compatible aliases
        // Maps Prisma's Indonesian fields (nomorAccount, namaDebitur, etc) to both formats
        const transformedAssets = assets.map((asset) => {
            const kantorCabang = asset.kantorCabang || asset.branch?.name || '';
            const kanwil = asset.kanwil || asset.branch?.region || '';
            const kelolaanTerbitSpk = asset.kelolaanTerbitSpk as 'AKTIF' | 'PASIF';

            return {
                id: asset.id,

                // ===== INDONESIAN FIELD NAMES (PRIMARY) =====
                // Core
                nomorAccount: asset.nomorAccount,
                namaDebitur: asset.namaDebitur,
                namaKreditur: asset.namaKreditur || '',
                // Branch
                kantorCabang,
                kanwil,
                kelolaanTerbitSpk,
                jenisKredit: asset.jenisKredit || '',
                // Address
                alamatAgunan: asset.alamatAgunan || '',
                alamatKtpDebitur: asset.alamatKtpDebitur || '',
                alamatKantorDebitur: asset.alamatKantorDebitur || '',
                // Contact
                nomorHp1Debitur: asset.nomorHp1Debitur || '',
                nomorHp2Debitur: asset.nomorHp2Debitur || '',
                nomorTeleponKantor: asset.nomorTeleponKantor || '',
                // Emergency
                namaEmergencyKontak: asset.namaEmergencyKontak || '',
                nomorTeleponEmergency: asset.nomorTeleponEmergency || '',
                alamatEmergencyKontak: asset.alamatEmergencyKontak || '',
                // Financial
                plafondAwal: asset.plafondAwal,
                tanggalRealisasi: asset.tanggalRealisasi || '',
                tanggalJatuhTempo: asset.tanggalJatuhTempo || '',
                saldoPokok: asset.saldoPokok,
                tunggakanBunga: asset.tunggakanBunga,
                tunggakanDenda: asset.tunggakanDenda,
                tunggakanAngsuran: asset.tunggakanAngsuran,
                totalTunggakan: asset.totalTunggakan,
                lunasTunggakan: asset.lunasTunggakan,
                lunasKredit: asset.lunasKredit,

                // ===== ENGLISH FIELD NAMES (BACKWARD-COMPATIBLE ALIASES) =====
                loanId: asset.nomorAccount,
                debtorName: asset.namaDebitur,
                creditorName: asset.namaKreditur || '',
                branch: kantorCabang,
                region: kanwil,
                spkStatus: kelolaanTerbitSpk,
                creditType: asset.jenisKredit || '',
                collateralAddress: asset.alamatAgunan || '',
                identityAddress: asset.alamatKtpDebitur || '',
                officeAddress: asset.alamatKantorDebitur || '',
                phone: asset.nomorHp1Debitur || '',
                officePhone: asset.nomorTeleponKantor || '',
                emergencyName: asset.namaEmergencyKontak || '',
                emergencyPhone: asset.nomorTeleponEmergency || '',
                emergencyAddress: asset.alamatEmergencyKontak || '',
                initialPlafond: asset.plafondAwal,
                realizationDate: asset.tanggalRealisasi || '',
                maturityDate: asset.tanggalJatuhTempo || '',
                principalBalance: asset.saldoPokok,
                interestArrears: asset.tunggakanBunga,
                penaltyArrears: asset.tunggakanDenda,
                principalArrears: asset.tunggakanAngsuran,
                totalArrears: asset.totalTunggakan,
                totalPayoff: asset.lunasKredit,

                // System
                collectorId: asset.collectorId,
                lastUpdate: asset.updatedAt.toISOString().split('T')[0],
            };
        });

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
// Accepts both Indonesian (new) and English (legacy) field names
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Support both Indonesian and English field names in input
        const nomorAccount = body.nomorAccount || body.loanId;
        const namaDebitur = body.namaDebitur || body.debtorName;
        const kantorCabangInput = body.kantorCabang || body.branch;
        const kanwilInput = body.kanwil || body.region;

        if (!nomorAccount) {
            return NextResponse.json(
                { success: false, error: 'Missing required field: nomorAccount or loanId' },
                { status: 400 }
            );
        }

        // Find or create branch if provided
        let branchRecord = null;
        if (kantorCabangInput) {
            branchRecord = await prisma.branch.findFirst({
                where: { name: kantorCabangInput },
            });

            if (!branchRecord) {
                branchRecord = await prisma.branch.create({
                    data: {
                        name: kantorCabangInput,
                        region: kanwilInput || 'Unknown',
                    },
                });
            }
        }

        const asset = await prisma.asset.create({
            data: {
                nomorAccount,
                namaDebitur: namaDebitur || 'Unknown',
                namaKreditur: body.namaKreditur || body.creditorName || null,
                kantorCabang: kantorCabangInput || null,
                kanwil: kanwilInput || null,
                kelolaanTerbitSpk: body.kelolaanTerbitSpk || body.spkStatus || 'AKTIF',
                jenisKredit: body.jenisKredit || body.creditType || null,
                alamatAgunan: body.alamatAgunan || body.collateralAddress || null,
                alamatKtpDebitur: body.alamatKtpDebitur || body.identityAddress || null,
                alamatKantorDebitur: body.alamatKantorDebitur || body.officeAddress || null,
                nomorHp1Debitur: body.nomorHp1Debitur || body.phone || null,
                nomorHp2Debitur: body.nomorHp2Debitur || null,
                nomorTeleponKantor: body.nomorTeleponKantor || body.officePhone || null,
                namaEmergencyKontak: body.namaEmergencyKontak || body.emergencyName || null,
                nomorTeleponEmergency: body.nomorTeleponEmergency || body.emergencyPhone || null,
                alamatEmergencyKontak: body.alamatEmergencyKontak || body.emergencyAddress || null,
                plafondAwal: Number(body.plafondAwal || body.initialPlafond) || 0,
                tanggalRealisasi: body.tanggalRealisasi || body.realizationDate || null,
                tanggalJatuhTempo: body.tanggalJatuhTempo || body.maturityDate || null,
                saldoPokok: Number(body.saldoPokok || body.principalBalance) || 0,
                tunggakanBunga: Number(body.tunggakanBunga || body.interestArrears) || 0,
                tunggakanDenda: Number(body.tunggakanDenda || body.penaltyArrears) || 0,
                tunggakanAngsuran: Number(body.tunggakanAngsuran || body.principalArrears) || 0,
                totalTunggakan: Number(body.totalTunggakan || body.totalArrears) || 0,
                lunasTunggakan: Number(body.lunasTunggakan) || 0,
                lunasKredit: Number(body.lunasKredit || body.totalPayoff) || 0,
                branchId: branchRecord?.id || null,
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

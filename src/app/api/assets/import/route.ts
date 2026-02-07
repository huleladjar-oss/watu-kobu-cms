import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/assets/import - Bulk import assets from CSV
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { assets } = body;

        if (!assets || !Array.isArray(assets) || assets.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No assets provided' },
                { status: 400 }
            );
        }

        let importedCount = 0;
        let skippedCount = 0;
        const errors: string[] = [];

        for (const asset of assets) {
            try {
                const nomorAccount = asset.nomorAccount || asset.loanId;
                const namaDebitur = asset.namaDebitur || asset.debtorName;
                const kantorCabangInput = asset.kantorCabang || asset.branch;
                const kanwilInput = asset.kanwil || asset.region;

                if (!nomorAccount) {
                    skippedCount++;
                    continue;
                }

                // Check if already exists (skip duplicates)
                const existing = await prisma.asset.findUnique({
                    where: { nomorAccount: String(nomorAccount) },
                });

                if (existing) {
                    skippedCount++;
                    continue;
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

                await prisma.asset.create({
                    data: {
                        nomorAccount: String(nomorAccount),
                        namaDebitur: namaDebitur || 'Unknown',
                        kantorCabang: kantorCabangInput || null,
                        kanwil: kanwilInput || null,
                        kelolaanTerbitSpk: asset.kelolaanTerbitSpk || asset.spkStatus || 'AKTIF',
                        jenisKredit: asset.jenisKredit || asset.creditType || null,
                        alamatAgunan: asset.alamatAgunan || asset.collateralAddress || null,
                        alamatKtpDebitur: asset.alamatKtpDebitur || asset.identityAddress || null,
                        alamatKantorDebitur: asset.alamatKantorDebitur || asset.officeAddress || null,
                        nomorHp1Debitur: asset.nomorHp1Debitur || asset.phone || null,
                        nomorHp2Debitur: asset.nomorHp2Debitur || null,
                        nomorTeleponKantor: asset.nomorTeleponKantor || asset.officePhone || null,
                        namaEmergencyKontak: asset.namaEmergencyKontak || asset.emergencyName || null,
                        nomorTeleponEmergency: asset.nomorTeleponEmergency || asset.emergencyPhone || null,
                        alamatEmergencyKontak: asset.alamatEmergencyKontak || asset.emergencyAddress || null,
                        plafondAwal: Number(asset.plafondAwal || asset.initialPlafond) || 0,
                        tanggalRealisasi: asset.tanggalRealisasi || asset.realizationDate || null,
                        tanggalJatuhTempo: asset.tanggalJatuhTempo || asset.maturityDate || null,
                        saldoPokok: Number(asset.saldoPokok || asset.principalBalance) || 0,
                        tunggakanBunga: Number(asset.tunggakanBunga || asset.interestArrears) || 0,
                        tunggakanDenda: Number(asset.tunggakanDenda || asset.penaltyArrears) || 0,
                        tunggakanAngsuran: Number(asset.tunggakanAngsuran || asset.principalArrears) || 0,
                        totalTunggakan: Number(asset.totalTunggakan || asset.totalArrears) || 0,
                        lunasTunggakan: Number(asset.lunasTunggakan) || 0,
                        lunasKredit: Number(asset.lunasKredit || asset.totalPayoff) || 0,
                        branchId: branchRecord?.id || null,
                        collectorId: asset.collectorId || null,
                    },
                });

                importedCount++;
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                errors.push(`${asset.nomorAccount || 'unknown'}: ${errorMsg}`);
            }
        }

        return NextResponse.json({
            success: true,
            importedCount,
            skippedCount,
            errorCount: errors.length,
            errors: errors.slice(0, 5), // Show first 5 errors only
            message: `Berhasil import ${importedCount} aset. ${skippedCount} duplikat dilewati.${errors.length > 0 ? ` ${errors.length} error.` : ''}`,
        });
    } catch (error) {
        console.error('Error in bulk import:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to import assets: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
}

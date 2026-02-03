// =============================================================================
// WATU KOBU - Database Seeder
// Run with: npx prisma db seed
// =============================================================================

import { PrismaClient, Role, AssetStatus, ValidationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // ---------------------------------------------------------------------------
    // 1. CREATE BRANCHES
    // ---------------------------------------------------------------------------
    console.log('📍 Creating branches...');

    const branchJakarta = await prisma.branch.upsert({
        where: { id: 'branch-jkt-01' },
        update: {},
        create: {
            id: 'branch-jkt-01',
            name: 'KCP Jakarta Selatan',
            region: 'DKI Jakarta',
        },
    });

    const branchBogor = await prisma.branch.upsert({
        where: { id: 'branch-bgr-01' },
        update: {},
        create: {
            id: 'branch-bgr-01',
            name: 'KCP Bogor Kota',
            region: 'Jawa Barat',
        },
    });

    console.log(`   ✅ Created ${2} branches\n`);

    // ---------------------------------------------------------------------------
    // 2. CREATE USERS
    // ---------------------------------------------------------------------------
    console.log('👤 Creating users...');

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedManagerPassword = await bcrypt.hash('manager123', 10);
    const hashedCollectorPassword = await bcrypt.hash('collector123', 10);

    // Admin User
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@watukobu.co.id' },
        update: {},
        create: {
            email: 'admin@watukobu.co.id',
            password: hashedAdminPassword,
            name: 'Admin Pusat',
            role: Role.ADMIN,
            employeeId: 'WK-001',
            area: 'Head Office',
            isActive: true,
        },
    });

    // Manager User
    const managerUser = await prisma.user.upsert({
        where: { email: 'manager@watukobu.co.id' },
        update: {},
        create: {
            email: 'manager@watukobu.co.id',
            password: hashedManagerPassword,
            name: 'Pak Manager',
            role: Role.MANAGER,
            employeeId: 'WK-002',
            area: 'Jakarta Selatan',
            isActive: true,
        },
    });

    // Collector User - Budi Santoso
    const collectorBudi = await prisma.user.upsert({
        where: { email: 'budi.santoso@watukobu.co.id' },
        update: {},
        create: {
            email: 'budi.santoso@watukobu.co.id',
            password: hashedCollectorPassword,
            name: 'Budi Santoso',
            role: Role.COLLECTOR,
            employeeId: 'WK-003',
            area: 'Jakarta Selatan',
            isActive: true,
        },
    });

    // Collector User - Dewi Lestari
    const collectorDewi = await prisma.user.upsert({
        where: { email: 'dewi.lestari@watukobu.co.id' },
        update: {},
        create: {
            email: 'dewi.lestari@watukobu.co.id',
            password: hashedCollectorPassword,
            name: 'Dewi Lestari',
            role: Role.COLLECTOR,
            employeeId: 'WK-004',
            area: 'Bogor',
            isActive: true,
        },
    });

    console.log(`   ✅ Created 4 users (1 Admin, 1 Manager, 2 Collectors)\n`);

    // ---------------------------------------------------------------------------
    // 3. CREATE ASSETS (Debitur)
    // ---------------------------------------------------------------------------
    console.log('📋 Creating assets (debtors)...');

    const assetsData = [
        {
            id: 'LOAN-2024-001',
            name: 'Ahmad Wijaya',
            address: 'Jl. Merpati No. 15, Tebet, Jakarta Selatan',
            locationLat: -6.2297,
            locationLng: 106.8486,
            phone: '081234567890',
            vehiclePlate: 'B 1234 ABC',
            principalDebt: 25000000,
            totalArrears: 5000000,
            interestArrears: 750000,
            penaltyArrears: 250000,
            status: AssetStatus.MACET,
            branchId: branchJakarta.id,
        },
        {
            id: 'LOAN-2024-002',
            name: 'Siti Rahayu',
            address: 'Jl. Kenanga No. 22, Pancoran, Jakarta Selatan',
            locationLat: -6.2456,
            locationLng: 106.8512,
            phone: '081298765432',
            vehiclePlate: 'B 5678 DEF',
            principalDebt: 18000000,
            totalArrears: 3600000,
            interestArrears: 540000,
            penaltyArrears: 180000,
            status: AssetStatus.JANJI_BAYAR,
            branchId: branchJakarta.id,
        },
        {
            id: 'LOAN-2024-003',
            name: 'Rudi Hermawan',
            address: 'Jl. Mawar No. 8, Pasar Minggu, Jakarta Selatan',
            locationLat: -6.2834,
            locationLng: 106.8456,
            phone: '082111222333',
            vehiclePlate: 'B 9012 GHI',
            principalDebt: 32000000,
            totalArrears: 8000000,
            interestArrears: 1200000,
            penaltyArrears: 400000,
            status: AssetStatus.MACET,
            branchId: branchJakarta.id,
        },
        {
            id: 'LOAN-2024-004',
            name: 'Eko Prasetyo',
            address: 'Jl. Raya Pajajaran No. 45, Bogor Tengah',
            locationLat: -6.5971,
            locationLng: 106.7972,
            phone: '085333444555',
            vehiclePlate: 'F 3456 JKL',
            principalDebt: 15000000,
            totalArrears: 2250000,
            interestArrears: 337500,
            penaltyArrears: 112500,
            status: AssetStatus.LANCAR,
            branchId: branchBogor.id,
        },
        {
            id: 'LOAN-2024-005',
            name: 'Maya Sari',
            address: 'Jl. Surya Kencana No. 12, Bogor Selatan',
            locationLat: -6.6156,
            locationLng: 106.7891,
            phone: '087666777888',
            vehiclePlate: 'F 7890 MNO',
            principalDebt: 22000000,
            totalArrears: 4400000,
            interestArrears: 660000,
            penaltyArrears: 220000,
            status: AssetStatus.MACET,
            branchId: branchBogor.id,
        },
    ];

    for (const asset of assetsData) {
        await prisma.asset.upsert({
            where: { id: asset.id },
            update: {},
            create: asset,
        });
    }

    console.log(`   ✅ Created ${assetsData.length} assets\n`);

    // ---------------------------------------------------------------------------
    // 4. CREATE ASSIGNMENTS
    // ---------------------------------------------------------------------------
    console.log('📌 Creating assignments...');

    // Assign Jakarta assets to Budi
    const jakartaAssets = assetsData.filter(a => a.branchId === branchJakarta.id);
    for (const asset of jakartaAssets) {
        await prisma.assignment.upsert({
            where: { id: `assign-${asset.id}-${collectorBudi.id}` },
            update: {},
            create: {
                id: `assign-${asset.id}-${collectorBudi.id}`,
                userId: collectorBudi.id,
                assetId: asset.id,
                status: 'ACTIVE',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            },
        });
    }

    // Assign Bogor assets to Dewi
    const bogorAssets = assetsData.filter(a => a.branchId === branchBogor.id);
    for (const asset of bogorAssets) {
        await prisma.assignment.upsert({
            where: { id: `assign-${asset.id}-${collectorDewi.id}` },
            update: {},
            create: {
                id: `assign-${asset.id}-${collectorDewi.id}`,
                userId: collectorDewi.id,
                assetId: asset.id,
                status: 'ACTIVE',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
    }

    console.log(`   ✅ Created ${assetsData.length} assignments\n`);

    // ---------------------------------------------------------------------------
    // 5. CREATE SAMPLE VISIT REPORTS
    // ---------------------------------------------------------------------------
    console.log('📝 Creating sample visit reports...');

    await prisma.visitReport.upsert({
        where: { id: 'visit-sample-001' },
        update: {},
        create: {
            id: 'visit-sample-001',
            assetId: 'LOAN-2024-001',
            collectorId: collectorBudi.id,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            outcome: 'BERTEMU',
            notes: 'Debitur berjanji akan membayar minggu depan. Ekonomi sedang sulit.',
            gpsLat: -6.2297,
            gpsLng: 106.8486,
            statusValidation: ValidationStatus.APPROVED,
        },
    });

    await prisma.visitReport.upsert({
        where: { id: 'visit-sample-002' },
        update: {},
        create: {
            id: 'visit-sample-002',
            assetId: 'LOAN-2024-002',
            collectorId: collectorBudi.id,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            outcome: 'TIDAK_BERTEMU',
            notes: 'Tidak ada orang di rumah. Tetangga bilang sedang keluar kota.',
            gpsLat: -6.2456,
            gpsLng: 106.8512,
            statusValidation: ValidationStatus.PENDING,
        },
    });

    console.log(`   ✅ Created 2 sample visit reports\n`);

    // ---------------------------------------------------------------------------
    // 6. CREATE SAMPLE PAYMENT REPORTS
    // ---------------------------------------------------------------------------
    console.log('💰 Creating sample payment reports...');

    await prisma.paymentReport.upsert({
        where: { id: 'payment-sample-001' },
        update: {},
        create: {
            id: 'payment-sample-001',
            assetId: 'LOAN-2024-001',
            collectorId: collectorBudi.id,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            amount: 500000,
            method: 'CASH',
            statusValidation: ValidationStatus.APPROVED,
        },
    });

    console.log(`   ✅ Created 1 sample payment report\n`);

    // ---------------------------------------------------------------------------
    // SUMMARY
    // ---------------------------------------------------------------------------
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✨ Database seeding completed successfully!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 Summary:');
    console.log('   • Branches: 2');
    console.log('   • Users: 4 (Admin, Manager, 2 Collectors)');
    console.log('   • Assets: 5');
    console.log('   • Assignments: 5');
    console.log('   • Visit Reports: 2');
    console.log('   • Payment Reports: 1');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   • Admin:     admin@watukobu.co.id     / admin123');
    console.log('   • Manager:   manager@watukobu.co.id   / manager123');
    console.log('   • Collector: budi.santoso@watukobu.co.id / collector123');
    console.log('   • Collector: dewi.lestari@watukobu.co.id / collector123');
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

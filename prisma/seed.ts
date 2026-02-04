// =============================================================================
// WATU KOBU - Production Testing Database Seeder
// Run with: npx prisma db seed
// =============================================================================

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Starting Production Testing database setup...\n');

    // ---------------------------------------------------------------------------
    // 1. CLEAN UP - Delete all existing data (order matters for foreign keys!)
    // ---------------------------------------------------------------------------
    console.log('🗑️  Cleaning up existing data...');

    // Delete reports first (they reference Assets and Users)
    await prisma.paymentReport.deleteMany({});
    console.log('   ✓ Deleted all PaymentReport records');

    await prisma.visitReport.deleteMany({});
    console.log('   ✓ Deleted all VisitReport records');

    // Delete assignments (references Users and Assets)
    await prisma.assignment.deleteMany({});
    console.log('   ✓ Deleted all Assignment records');

    // Delete assets (references Branches)
    await prisma.asset.deleteMany({});
    console.log('   ✓ Deleted all Asset records');

    // Delete users
    await prisma.user.deleteMany({});
    console.log('   ✓ Deleted all User records');

    // Delete branches last
    await prisma.branch.deleteMany({});
    console.log('   ✓ Deleted all Branch records');

    console.log('\n✅ Cleanup complete!\n');

    // ---------------------------------------------------------------------------
    // 2. CREATE MASTER DATA - Minimal setup for production testing
    // ---------------------------------------------------------------------------
    console.log('📦 Creating master data for production testing...\n');

    // ---------------------------------------------------------------------------
    // 2a. CREATE BRANCH
    // ---------------------------------------------------------------------------
    console.log('📍 Creating branch...');

    const kantorPusat = await prisma.branch.create({
        data: {
            id: 'branch-pusat-01',
            name: 'Kantor Pusat',
            region: 'Jakarta',
        },
    });
    console.log(`   ✅ Created branch: ${kantorPusat.name}\n`);

    // ---------------------------------------------------------------------------
    // 2b. CREATE USERS
    // ---------------------------------------------------------------------------
    console.log('👤 Creating users...');

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedManagerPassword = await bcrypt.hash('manager123', 10);
    const hashedCollectorPassword = await bcrypt.hash('kolektor123', 10);

    // Admin User - Rathi
    const adminRathi = await prisma.user.create({
        data: {
            email: 'rathi@watukobu.co.id',
            password: hashedAdminPassword,
            name: 'Rathi',
            role: Role.ADMIN,
            employeeId: 'WK-ADM-001',
            area: 'Head Office',
            isActive: true,
        },
    });
    console.log(`   ✅ Created ADMIN: ${adminRathi.name} (${adminRathi.email})`);

    // Manager User - Yohanes
    const managerYohanes = await prisma.user.create({
        data: {
            email: 'yohanes@watukobu.co.id',
            password: hashedManagerPassword,
            name: 'Yohanes',
            role: Role.MANAGER,
            employeeId: 'WK-MGR-001',
            area: 'Jakarta',
            isActive: true,
        },
    });
    console.log(`   ✅ Created MANAGER: ${managerYohanes.name} (${managerYohanes.email})`);

    // Collector User - Anton
    const collectorAnton = await prisma.user.create({
        data: {
            email: 'anton@watukobu.co.id',
            password: hashedCollectorPassword,
            name: 'Anton',
            role: Role.COLLECTOR,
            employeeId: 'WK-001',
            area: 'Jakarta',
            isActive: true,
        },
    });
    console.log(`   ✅ Created COLLECTOR: ${collectorAnton.name} (${collectorAnton.email})\n`);

    // ---------------------------------------------------------------------------
    // SUMMARY
    // ---------------------------------------------------------------------------
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✨ Production Testing database setup completed!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 Summary:');
    console.log('   • Branches: 1 (Kantor Pusat)');
    console.log('   • Users: 3 (1 Admin, 1 Manager, 1 Collector)');
    console.log('   • Assets: 0 (empty - ready for manual input)');
    console.log('   • Assignments: 0');
    console.log('   • Reports: 0');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   ┌─────────────┬───────────────────────────┬──────────────┐');
    console.log('   │ Role        │ Email                     │ Password     │');
    console.log('   ├─────────────┼───────────────────────────┼──────────────┤');
    console.log('   │ ADMIN       │ rathi@watukobu.co.id      │ admin123     │');
    console.log('   │ MANAGER     │ yohanes@watukobu.co.id    │ manager123   │');
    console.log('   │ COLLECTOR   │ anton@watukobu.co.id      │ kolektor123  │');
    console.log('   └─────────────┴───────────────────────────┴──────────────┘');
    console.log('');
    console.log('🚀 Database is ready for production testing!');
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

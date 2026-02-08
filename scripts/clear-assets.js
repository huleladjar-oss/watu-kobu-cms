const { PrismaClient } = require('@prisma/client');

async function main() {
    let url = process.env.DATABASE_URL || '';
    if (url.includes(':6543') && !url.includes('pgbouncer=true')) {
        url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1';
    }

    const prisma = new PrismaClient({
        datasources: { db: { url } }
    });

    try {
        // Delete related records first (foreign key constraints)
        const payments = await prisma.paymentReport.deleteMany({});
        console.log('Deleted:', payments.count, 'payment reports');

        const visits = await prisma.visitReport.deleteMany({});
        console.log('Deleted:', visits.count, 'visit reports');

        const assignments = await prisma.assignment.deleteMany({});
        console.log('Deleted:', assignments.count, 'assignments');

        // Now delete assets
        const assets = await prisma.asset.deleteMany({});
        console.log('Deleted:', assets.count, 'assets');

        console.log('\n✅ Database cleaned! All assets and related data removed.');
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const columns = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'appointments'
        `;
        console.log('Columns in appointments table:', JSON.stringify(columns, null, 2));

        const sample = await prisma.$queryRaw`SELECT * FROM appointments LIMIT 1`;
        console.log('Sample record:', JSON.stringify(sample, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

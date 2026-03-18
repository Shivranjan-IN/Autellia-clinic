const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const result = await prisma.medicines.create({
            data: {
                medicine_id: `TEST-${Date.now()}`,
                medicine_name: 'Test Medicine 2',
                category: 'Tablet',
                stock_quantity: 100,
                mrp: 10.5,
                clinic_id: 2 // Using found clinic ID
            }
        });
        console.log('SUCCESS:', result);
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();

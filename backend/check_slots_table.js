const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const slots = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'doctor_time_slots'
        `;
        console.log('Columns in doctor_time_slots:', JSON.stringify(slots, null, 2));

        const instances = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'doctor_slot_instances'
        `;
        console.log('Columns in doctor_slot_instances:', JSON.stringify(instances, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

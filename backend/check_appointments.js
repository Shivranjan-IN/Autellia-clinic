require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const appointments = await prisma.appointments.findMany({
            include: { patient: true }
        });
        console.log('Total appointments:', appointments.length);
        appointments.forEach(a => {
            console.log(`ID: ${a.appointment_id} | doctor_id: ${a.doctor_id} | patient: ${a.patient?.full_name || 'N/A'} | date: ${a.appointment_date} | status: ${a.status}`);
        });

        // Also check which doctors have user_id set
        const doctors = await prisma.doctors.findMany({
            select: { id: true, full_name: true, user_id: true }
        });
        console.log('\nDoctors:');
        doctors.forEach(d => console.log(`  id: ${d.id} | name: ${d.full_name} | user_id: ${d.user_id}`));

        // Check users with role doctor
        const doctorUsers = await prisma.users.findMany({
            where: { role: 'doctor' },
            select: { user_id: true, full_name: true, email: true }
        });
        console.log('\nDoctor Users:');
        doctorUsers.forEach(u => console.log(`  user_id: ${u.user_id} | name: ${u.full_name} | email: ${u.email}`));
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();

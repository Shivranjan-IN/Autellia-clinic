const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDoctors() {
  try {
    const doctors = await prisma.doctors.findMany();
    console.log('Doctors in DB:');
    doctors.forEach(d => {
      console.log(`ID: ${d.id}, Name: ${d.full_name}, Status: ${d.verification_status}`);
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDoctors();

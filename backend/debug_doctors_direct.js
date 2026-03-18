const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const doctors = await prisma.doctors.findMany();
    console.log('DOCTORS_COUNT:', doctors.length);
    console.log('DOCTORS_DATA:', JSON.stringify(doctors, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

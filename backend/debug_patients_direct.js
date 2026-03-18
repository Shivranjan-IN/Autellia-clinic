const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const patients = await prisma.patients.findMany({
      include: {
        users: {
          include: {
            roles: true,
            emails: true
          }
        }
      }
    });
    console.log('PATIENTS_COUNT:', patients.length);
    console.log('PATIENTS_DATA:', JSON.stringify(patients, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

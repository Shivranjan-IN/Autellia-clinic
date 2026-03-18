const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugClinic() {
  try {
    console.log('--- USERS WITH ROLE CLINIC ---');
    const users = await prisma.users.findMany({
      where: {
        OR: [
          { role: { contains: 'clinic', mode: 'insensitive' } },
          { roles: { role_name: { contains: 'clinic', mode: 'insensitive' } } }
        ]
      },
      include: { roles: true }
    });
    console.log(JSON.stringify(users, null, 2));

    console.log('\n--- CLINICS TABLE ---');
    const clinics = await prisma.clinics.findMany();
    console.log(JSON.stringify(clinics, null, 2));

    console.log('\n--- DOCTOR CLINIC MAPPING ---');
    const mappings = await prisma.doctor_clinic_mapping.findMany({
      include: {
        doctors: { select: { id: true, full_name: true } },
        clinics: { select: { id: true, clinic_name: true } }
      }
    });
    console.log(JSON.stringify(mappings, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugClinic();

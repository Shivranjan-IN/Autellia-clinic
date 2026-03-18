const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGetDoctors() {
  try {
    const doctors = await prisma.doctors.findMany({
            where: {
                verification_status: { in: ['VERIFIED', 'COMPLETE', 'verified', 'complete', 'PENDING', 'pending'] }
            },
            include: {
                doctor_specializations: true,
                doctor_clinic_mapping: {
                    include: {
                        clinics: true
                    }
                },
                doctor_time_slots: true,
                users: {
                    include: {
                        emails: { where: { is_primary: true } },
                        contact_numbers: { where: { is_primary: true } }
                    }
                }
            }
        });

    console.log(`Found ${doctors.length} doctors.`);
    doctors.forEach(d => {
      console.log(`- ${d.full_name} (${d.verification_status})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGetDoctors();

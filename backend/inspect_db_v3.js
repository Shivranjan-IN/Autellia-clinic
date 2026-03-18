const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  try {
    const clinics = await prisma.clinics.findMany({
      select: { id: true, clinic_name: true },
      take: 5
    });
    console.log('CLINICS:', clinics);
    
    const count = await prisma.medicines.count();
    console.log('MEDICINE COUNT:', count);
    
    const medSchema = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'medicines'
    `;
    console.log('MEDICINE COLUMNS:', medSchema);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspect();

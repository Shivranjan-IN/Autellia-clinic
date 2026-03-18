const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectTable() {
  try {
    const result = await prisma.$queryRaw`
      SELECT table_schema, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY table_schema
    `;
    console.log('Columns in users tables:', result);
  } catch (error) {
    console.error('Error inspecting table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectTable();

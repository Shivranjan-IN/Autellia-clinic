const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addRoleColumn() {
  try {
    console.log('Adding role column to public.users...');
    await prisma.$executeRawUnsafe('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role VARCHAR');
    console.log('✅ Column added (or already existed)');
  } catch (error) {
    console.error('❌ Error adding column:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addRoleColumn();

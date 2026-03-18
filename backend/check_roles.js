const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRoles() {
  try {
    const roles = await prisma.roles.findMany();
    console.log('Roles in DB:', roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoles();

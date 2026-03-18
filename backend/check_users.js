const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.users.findMany({
      include: { roles: true }
    });
    console.log('Users in DB (with roles):');
    users.forEach(u => {
      console.log(`ID: ${u.user_id}, Name: ${u.full_name}, RoleID: ${u.role_id}, Role (Col): ${u.role}, RoleName (Join): ${u.roles?.role_name || 'NULL'}`);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();

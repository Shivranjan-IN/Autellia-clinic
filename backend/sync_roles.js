const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncRoles() {
  try {
    console.log('Syncing roles for all users...');
    const users = await prisma.users.findMany({
      where: {
        role_id: null,
        role: { not: null }
      }
    });

    console.log(`Found ${users.length} users with missing role_id but present role column.`);

    for (const user of users) {
      const roleRecord = await prisma.roles.findFirst({
        where: { role_name: user.role.toLowerCase() }
      });

      if (roleRecord) {
        await prisma.users.update({
          where: { user_id: user.user_id },
          data: { role_id: roleRecord.role_id }
        });
        console.log(`✅ Updated user ${user.user_id} (${user.full_name}) to role_id ${roleRecord.role_id} (${roleRecord.role_name})`);
      } else {
        console.warn(`⚠️ Role '${user.role}' not found in roles table for user ${user.user_id}`);
      }
    }
    console.log('✅ Role sync completed!');
  } catch (error) {
    console.error('❌ Error syncing roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncRoles();

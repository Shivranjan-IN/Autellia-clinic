require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUser() {
  try {
    // Check if test user exists via emails table
    const emailRecord = await prisma.emails.findUnique({
      where: { email: 'test@test.com' },
      include: { users: true }
    });
    
    if (emailRecord) {
      console.log('User exists:', emailRecord.email, emailRecord.users.role);
    } else {
      // Create test user with nested email
      const hashedPassword = await bcrypt.hash('test123', 10);
      const newUser = await prisma.users.create({
        data: {
          full_name: 'Test User',
          password_hash: hashedPassword,
          role: 'patient',
          is_active: true,
          emails: {
            create: {
              email: 'test@test.com',
              is_primary: true
            }
          },
          contact_numbers: {
            create: {
              phone_number: '1234567890',
              is_primary: true
            }
          }
        },
        include: {
            emails: true
        }
      });
      console.log('Created user:', newUser.emails[0].email, newUser.role);
    }
    
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    await prisma.$disconnect();
  }
}

seedUser();

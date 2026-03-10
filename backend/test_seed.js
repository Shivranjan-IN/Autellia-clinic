te_path>
c:/Intern/ai-clinic/backend/test_seed.js</absolute_path>
<parameter name="content">require('dotenv').config({ path: 'c:/Intern/ai-clinic/backend/.env' });

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

let connectionString = process.env.DATABASE_URL.replace('prisma+postgresql://', 'postgresql://');

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedUser() {
  try {
    // Check if test user exists
    const existingUser = await prisma.users.findUnique({
      where: { email: 'test@test.com' }
    });
    
    if (existingUser) {
      console.log('User exists:', existingUser.email, existingUser.role);
    } else {
      // Create test user
      const hashedPassword = await bcrypt.hash('test123', 10);
      const newUser = await prisma.users.create({
        data: {
          full_name: 'Test User',
          email: 'test@test.com',
          mobile_number: '1234567890',
          password_hash: hashedPassword,
          role: 'patient',
          is_active: true
        }
      });
      console.log('Created user:', newUser.email, newUser.role);
    }
    
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    await prisma.$disconnect();
  }
}

seedUser();

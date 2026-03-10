require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Handle Supabase Prisma+ connection string format
let connectionString = process.env.DATABASE_URL.replace('prisma+postgresql://', 'postgresql://');

// Configure Pool with SSL
const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    console.log('Testing database connection...');
    const users = await prisma.users.findMany({ take: 5 });
    console.log('Found users:', users.length);
    users.forEach(u => console.log('-', u.email, u.role));
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    await prisma.$disconnect();
  }
}

test();

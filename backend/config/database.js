const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Handle Supabase Prisma+ connection string format
let connectionString = process.env.DATABASE_URL;

// If using prisma+postgresql:// format, extract the actual URL
if (connectionString && connectionString.startsWith('prisma+postgresql://')) {
  connectionString = connectionString.replace('prisma+postgresql://', 'postgresql://');
}

// Remove sslmode from URL query parameters (we'll handle SSL in Pool config)
try {
  const url = new URL(connectionString);
  if (url.searchParams.has('sslmode')) {
    url.searchParams.delete('sslmode');
    connectionString = url.toString();
  }
} catch (e) {
  console.log('Could not parse URL:', e.message);
}

// Configure Pool with SSL
const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase self-signed certificates
  }
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

prisma.$connect()
  .then(() => {
    console.log('✅ Prisma database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Prisma database connection error:', err);
    process.exit(-1);
  });

module.exports = prisma;


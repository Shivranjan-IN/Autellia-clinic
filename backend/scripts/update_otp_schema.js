const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function updateSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    await client.query('ALTER TABLE "public"."otp_records" ADD COLUMN IF NOT EXISTS "email" varchar;');
    console.log('Added email column');

    await client.query('ALTER TABLE "public"."otp_records" ADD COLUMN IF NOT EXISTS "token" varchar;');
    console.log('Added token column');

    await client.query('ALTER TABLE "public"."otp_records" ALTER COLUMN "mobile_number" DROP NOT NULL;');
    console.log('Updated mobile_number to nullable');

    console.log('Schema update successful');
  } catch (err) {
    console.error('Error updating schema:', err.message);
  } finally {
    await client.end();
  }
}

updateSchema();

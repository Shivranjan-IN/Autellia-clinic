require('dotenv').config();
const { Pool } = require('pg');

// Handle Supabase Prisma+ connection string format
let connectionString = process.env.DATABASE_URL;

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

const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addColumns() {
  const client = await pool.connect();
  try {
    // Check if columns exist
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'patients' AND column_name IN ('profile_photo_data', 'profile_photo_mime_type')
    `);
    
    console.log('Existing columns:', result.rows);
    
    if (result.rows.length < 2) {
      // Add columns if they don't exist
      await client.query(`
        ALTER TABLE patients 
        ADD COLUMN IF NOT EXISTS profile_photo_data BYTEA,
        ADD COLUMN IF NOT EXISTS profile_photo_mime_type VARCHAR(255)
      `);
      console.log('✅ Columns added successfully');
    } else {
      console.log('✅ Columns already exist');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addColumns();


require('dotenv').config();
const { Pool } = require('pg');

// Convert prisma+postgresql:// to postgresql://
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
  connectionString: connectionString + '&sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Connected to database, running migration...');
    
    // Add mime_type column if not exists
    await client.query(`
      ALTER TABLE patient_documents 
      ADD COLUMN IF NOT EXISTS mime_type VARCHAR(255)
    `);
    console.log('✓ Added mime_type column');

    // Add file_size column if not exists  
    await client.query(`
      ALTER TABLE patient_documents 
      ADD COLUMN IF NOT EXISTS file_size INTEGER
    `);
    console.log('✓ Added file_size column');

    // Drop the old file_url column if it exists (no longer needed)
    await client.query(`
      ALTER TABLE patient_documents 
      DROP COLUMN IF EXISTS file_url
    `);
    console.log('✓ Dropped file_url column (if existed)');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();


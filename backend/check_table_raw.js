const { Client } = require('pg');
require('dotenv').config();

async function checkTable() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to PG');
        
        const res = await client.query('SELECT * FROM patient_documents LIMIT 5');
        console.log('Columns:', res.fields.map(f => f.name));
        console.log('Rows:', res.rows.length);
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkTable();

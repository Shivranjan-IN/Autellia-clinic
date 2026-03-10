require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const prisma = require('./config/database');

async function checkClinicDocuments() {
    try {
        // Check if table exists and has records
        const count = await prisma.clinic_document.count();
        console.log('Total clinic_document records:', count);
        
        // Get all records
        const documents = await prisma.clinic_document.findMany();
        console.log('Documents:', JSON.stringify(documents, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkClinicDocuments();


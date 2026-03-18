require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatus() {
    try {
        console.log('--- Database Status Check ---');
        const patientCount = await prisma.patients.count();
        console.log('Total Patients:', patientCount);
        
        const docCount = await prisma.patient_documents.count();
        console.log('Total Documents:', docCount);
        
        if (docCount > 0) {
            const lastDocs = await prisma.patient_documents.findMany({
                take: 5,
                orderBy: { uploaded_at: 'desc' }
            });
            console.log('Last 5 Documents:', JSON.stringify(lastDocs, null, 2));
        }
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkStatus();

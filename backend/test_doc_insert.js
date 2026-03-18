const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInsert() {
    try {
        console.log('Testing insert into patient_documents...');
        const doc = await prisma.patient_documents.create({
            data: {
                patient_id: 'PAT-1772343637931-413', // Use known patient ID
                document_type: 'Test Report',
                file_url: 'https://example.com/test.pdf',
                mime_type: 'application/pdf',
                file_size: 1024,
                file_name: 'test.pdf',
                uploaded_by: 'doctor'
            }
        });
        console.log('Insert successful:', doc);
        
        const count = await prisma.patient_documents.count();
        console.log('Total documents:', count);
    } catch (error) {
        console.error('Insert failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testInsert();

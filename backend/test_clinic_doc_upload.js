require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const prisma = require('./config/database');
const { uploadToSupabase } = require('./utils/supabaseStorage');

async function testClinicDocUpload() {
    try {
        console.log('=== Testing Clinic Document Upload ===');
        
        // Test 1: Upload a file to Supabase
        const testBuffer = Buffer.from('Hello Clinic Document!', 'utf-8');
        const result = await uploadToSupabase(testBuffer, 'test-clinic.pdf', 'clinic/documents');
        
        if (result.success) {
            console.log('✅ Supabase upload successful!');
            console.log('File URL:', result.url);
            
            // Test 2: Store in database
            const clinicDoc = await prisma.clinic_document.create({
                data: {
                    clinic_id: 3, // Use an existing clinic_id
                    document_type: 'Test',
                    file_url: result.url,
                    mime_type: 'application/pdf',
                    file_size: testBuffer.length,
                    file_name: 'test-clinic.pdf'
                }
            });
            
            console.log('✅ Database record created:', clinicDoc);
            
            // Test 3: Read back
            const docs = await prisma.clinic_document.findMany();
            console.log('✅ Total records in database:', docs.length);
            
        } else {
            console.log('❌ Upload failed:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testClinicDocUpload();


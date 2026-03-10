
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { uploadToSupabase, deleteFromSupabase, getActualBucketName } = require('./utils/supabaseStorage');

console.log('=== Supabase Upload Test ===');

async function test() {
    try {
        const bucketName = await getActualBucketName();
        console.log('Bucket name resolved:', bucketName);
        
        const testBuffer = Buffer.from('Hello Supabase!', 'utf-8');
        
        const result = await uploadToSupabase(testBuffer, 'test-image.jpg', 'test');
        
        if (result.success) {
            console.log('Upload successful!');
            console.log('File URL:', result.url);
        } else {
            console.log('Upload failed:', result.error);
        }
    } catch (error) {
        console.error('Exception:', error.message);
    }
}

test();


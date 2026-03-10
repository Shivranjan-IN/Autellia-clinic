require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET || 'clinic-files';

console.log('=== Supabase Configuration Check ===');
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_KEY:', supabaseKey ? 'Set (hidden)' : 'NOT SET');
console.log('SUPABASE_BUCKET:', supabaseBucket);

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not configured!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test: List buckets
async function testSupabase() {
    try {
        console.log('\n=== Testing Supabase Connection ===');
        
        // List buckets
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
            console.error('❌ Error listing buckets:', bucketError.message);
            return;
        }
        
        console.log('✅ Available buckets:', buckets.map(b => b.name).join(', '));
        
        // Check if our bucket exists
        const bucketExists = buckets.find(b => b.name === supabaseBucket);
        
        if (!bucketExists) {
            console.error(`❌ Bucket '${supabaseBucket}' does not exist!`);
            console.log('Available buckets:', buckets.map(b => b.name));
            return;
        }
        
        console.log(`✅ Bucket '${supabaseBucket}' exists`);
        
        // Test upload with a small file
        const testBuffer = Buffer.from('Hello Supabase!', 'utf-8');
        const testFileName = `test/${Date.now()}-test.txt`;
        
        console.log('\n=== Testing File Upload ===');
        const { data, error } = await supabase.storage
            .from(supabaseBucket)
            .upload(testFileName, testBuffer, {
                contentType: 'text/plain',
                upsert: false
            });
        
        if (error) {
            console.error('❌ Upload error:', error.message);
            console.error('Error details:', error);
            return;
        }
        
        console.log('✅ Upload successful!');
        console.log('File path:', data.path);
        
        // Get public URL
        const { data: urlData } = supabase.storage
            .from(supabaseBucket)
            .getPublicUrl(testFileName);
        
        console.log('Public URL:', urlData.publicUrl);
        
        // Clean up - delete test file
        await supabase.storage
            .from(supabaseBucket)
            .remove([testFileName]);
        
        console.log('✅ Test file cleaned up');
        
    } catch (error) {
        console.error('❌ Exception:', error.message);
    }
}

testSupabase();


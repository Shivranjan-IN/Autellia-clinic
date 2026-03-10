require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const prisma = require('./config/database');

async function checkClinics() {
    try {
        console.log('=== Checking Clinics ===');
        
        const clinics = await prisma.clinics.findMany({
            select: {
                id: true,
                clinic_name: true,
                email: true,
                user_id: true
            }
        });
        
        console.log('Clinics found:', clinics.length);
        console.log(JSON.stringify(clinics, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkClinics();


const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000'; // Local backend

async function testDoctorsPublic() {
  try {
    console.log('Testing GET /api/doctors/public (no auth)...');
    const res = await axios.get(`${API_BASE_URL}/api/doctors/public`);
    console.log('✅ SUCCESS:', res.status, res.data.length || 0, 'doctors');
    console.log('Sample:', res.data[0]?.full_name);
  } catch (err) {
    console.error('❌ FAILED:', err.response?.status, err.message);
  }
}

testDoctorsPublic();

// Test deployed
async function testDeployed() {
  try {
    console.log('Testing deployed https://autellia-clinic.onrender.com/api/doctors/public...');
    const res = await axios.get('https://autellia-clinic.onrender.com/api/doctors/public');
    console.log('✅ DEPLOYED SUCCESS:', res.status, res.data.length || 0, 'doctors');
  } catch (err) {
    console.error('❌ DEPLOYED FAILED:', err.response?.status || err.message);
  }
}

// testDeployed();


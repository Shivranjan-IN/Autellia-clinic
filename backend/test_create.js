const User = require('./models/userModel');
const prisma = require('./config/database');

async function testCreate() {
  try {
    const userData = {
      full_name: 'Test Patient',
      email: 'test_patient@example.com',
      password_hash: 'dummy_hash',
      role: 'patient'
    };
    
    console.log('Creating test user...');
    const newUser = await User.create(userData);
    console.log('✅ User created:', {
      user_id: newUser.user_id,
      role: newUser.role,
      role_id: newUser.role_id
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreate();

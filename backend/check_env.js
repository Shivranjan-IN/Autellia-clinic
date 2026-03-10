require('dotenv').config();

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'NOT SET');

if (process.env.DATABASE_URL) {
  // Parse the connection string to check for issues
  const url = process.env.DATABASE_URL;
  console.log('URL starts with:', url.substring(0, 30));
  
  // Check if password contains special characters
  try {
    const urlObj = new URL(url);
    console.log('Host:', urlObj.hostname);
    console.log('Password length:', urlObj.password ? urlObj.password.length : 0);
  } catch (e) {
    console.log('URL parse error:', e.message);
  }
}


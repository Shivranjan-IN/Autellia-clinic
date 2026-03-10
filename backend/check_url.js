
require('dotenv').config();

const url = process.env.DATABASE_URL;
console.log('Full URL:', url);

// Check URL parameters
const urlObj = new URL(url);
console.log('Search params:', urlObj.searchParams.toString());

// Check if sslmode is in the URL
if (url.includes('sslmode')) {
  console.log('SSL mode is set in URL');
} else {
  console.log('No SSL mode in URL - will use pool config');
}

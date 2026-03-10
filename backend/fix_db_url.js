require('dotenv').config();
const url = process.env.DATABASE_URL.replace('prisma+postgresql://','postgresql://');
console.log(url);
process.env.DATABASE_URL = url;


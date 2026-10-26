require('dotenv').config();
const prisma = require('./prisma');

async function verifyConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed');
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

verifyConnection();

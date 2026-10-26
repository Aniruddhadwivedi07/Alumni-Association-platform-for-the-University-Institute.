require('dotenv').config();
const prisma = require('../src/prisma');

const ROLES = ['STUDENT', 'ALUMNI', 'ADMIN'];

async function main() {
  for (const name of ROLES) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const roles = await prisma.role.findMany({ orderBy: { id: 'asc' } });
  console.log('Seeded roles:', roles.map(r => r.name).join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

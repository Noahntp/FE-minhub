const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log(users.map(u => ({ id: u.id, role: u.role })));
}
check().finally(() => prisma.$disconnect());

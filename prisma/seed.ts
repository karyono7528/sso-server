import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
    },
  });

  console.log({ admin });

  // Create example application
  const exampleApp = await prisma.application.upsert({
    where: { clientId: 'example-client' },
    update: {},
    create: {
      name: 'Example Application',
      clientId: 'example-client',
      clientSecret: 'example-secret',
      redirectUris: ['http://localhost:3001/callback'],
    },
  });

  console.log({ exampleApp });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
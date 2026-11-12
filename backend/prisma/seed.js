/**
 * Seed script – creates the first ADMIN user.
 * Run: node prisma/seed.js
 * Or via npm script: npm run db:seed
 *
 * Production requires ADMIN_EMAIL / ADMIN_PASSWORD environment variables.
 * Development falls back to local-only defaults when they are omitted.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@balancevault.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';

  if (process.env.NODE_ENV === 'production' && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding in production.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: 'USER_REGISTERED',
      targetType: 'User',
      targetId: admin.id,
      outcome: 'SUCCESS',
      metadata: { note: 'First admin seeded via seed script' },
    },
  });

  console.log(`✅ Admin user created: ${email}`);
  console.log('   Please change the password after first login.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

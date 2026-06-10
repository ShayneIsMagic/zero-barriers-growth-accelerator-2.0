#!/usr/bin/env node

/**
 * Ensures the configured super admin account exists with role SUPER_ADMIN.
 *
 * Required in .env.local:
 *   SUPER_ADMIN_EMAIL=you@example.com
 *   SUPER_ADMIN_PASSWORD=your-secure-password
 *   DATABASE_URL=postgresql://...
 */

const path = require('node:path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  if (!email || !password) {
    console.error(
      'Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in .env.local'
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL in .env.local');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
    create: {
      email,
      name,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log(`Super admin ready: ${user.email} (${user.role})`);
  console.log('Sign in at: /auth/signin?callbackUrl=/workspace');
}

main()
  .catch((error) => {
    console.error('Failed to ensure super admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

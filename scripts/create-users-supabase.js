#!/usr/bin/env node

/**
 * Create Users in Supabase (Fresh Connection)
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createUsers() {
  // Create fresh Prisma client each time
  const prisma = new PrismaClient();

  const USERS = [
    {
      name: 'Shayne Roy',
      email: 'shayne+1@devpipeline.com',
      password: 'ZBadmin123!',
      role: 'SUPER_ADMIN',
    },
    {
      name: 'SK Roy',
      email: 'sk@zerobarriers.io',
      password: 'ZBuser123!',
      role: 'USER',
    },
    {
      name: 'S Roy',
      email: 'shayne+2@devpipeline.com',
      password: 'ZBuser2123!',
      role: 'USER',
    },
  ];

  console.log('🚀 Creating users in Supabase...\n');

  try {
    for (const userData of USERS) {
      console.log(`Processing: ${userData.email}`);

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Upsert user (create or update)
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
        },
        create: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
        },
      });

      console.log(`  ✅ ${user.email} (${user.role})\n`);
    }

    console.log('✨ All users created successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();

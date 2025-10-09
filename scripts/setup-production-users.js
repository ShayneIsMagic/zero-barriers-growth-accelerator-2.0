#!/usr/bin/env node

/**
 * Setup Production Users
 * Creates real users with hashed passwords in the database
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const USERS = [
  {
    name: 'Shayne Roy',
    email: 'admin@zerobarriers.io',
    password: 'ZBadmin123!',
    role: 'SUPER_ADMIN'
  },
  {
    name: 'SK Roy',
    email: 'SK@zerobarriers.io',
    password: 'ZBuser123!',
    role: 'USER'
  }
];

async function setupUsers() {
  console.log('🚀 Setting up production users...\n');

  try {
    for (const userData of USERS) {
      console.log(`Creating user: ${userData.name} (${userData.email})`);

      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existing) {
        console.log(`  ⚠️  User already exists, updating password...`);

        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // Update user
        await prisma.user.update({
          where: { email: userData.email },
          data: {
            password: hashedPassword,
            name: userData.name,
            role: userData.role
          }
        });

        console.log(`  ✅ Updated: ${userData.email}\n`);
      } else {
        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // Create new user
        await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
            role: userData.role
          }
        });

        console.log(`  ✅ Created: ${userData.email}\n`);
      }
    }

    console.log('\n✨ Production users setup complete!\n');
    console.log('You can now login with:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin User:');
    console.log('  Email:    admin@zerobarriers.io');
    console.log('  Password: ZBadmin123!');
    console.log('  Role:     SUPER_ADMIN');
    console.log('');
    console.log('Regular User:');
    console.log('  Email:    SK@zerobarriers.io');
    console.log('  Password: ZBuser123!');
    console.log('  Role:     USER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error setting up users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupUsers();


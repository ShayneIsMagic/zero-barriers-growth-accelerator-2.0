const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    // Create super admin user
    const user = await prisma.user.upsert({
      where: { email: 'shayne@zerobarriers.com' },
      update: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
      create: {
        email: 'shayne@zerobarriers.com',
        name: 'Shayne Roy',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });

    console.log('✅ Super Admin created successfully!');
    console.log('📧 Email: shayne@zerobarriers.com');
    console.log('🔑 Password: Admin123!');
    console.log('👑 Role: SUPER_ADMIN');
    console.log('🆔 User ID:', user.id);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();



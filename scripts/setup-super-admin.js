const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupSuperAdmin() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    // Create or update super admin user
    const user = await prisma.user.upsert({
      where: { email: 'sk@zerobarriers.io' },
      update: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        name: 'Shayne Roy',
      },
      create: {
        email: 'sk@zerobarriers.io',
        name: 'Shayne Roy',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });

    console.log('✅ Super Admin setup successfully!');
    console.log('📧 Email: sk@zerobarriers.io');
    console.log('🔑 Password: Admin123!');
    console.log('👑 Role: SUPER_ADMIN');
    console.log('🆔 User ID:', user.id);
  } catch (error) {
    console.error('❌ Error setting up super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupSuperAdmin();

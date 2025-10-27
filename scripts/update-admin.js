const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateSuperAdmin() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    // Update or create super admin user with correct email
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

    console.log('✅ Super Admin updated successfully!');
    console.log('📧 Email: sk@zerobarriers.io');
    console.log('🔑 Password: Admin123!');
    console.log('👑 Role: SUPER_ADMIN');
    console.log('🆔 User ID:', user.id);

    // Also remove the old account if it exists
    try {
      await prisma.user.deleteMany({
        where: {
          email: 'shayne@zerobarriers.com',
        },
      });
      console.log('🗑️ Old account removed');
    } catch (e) {
      // Old account doesn't exist, that's fine
    }
  } catch (error) {
    console.error('❌ Error updating super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSuperAdmin();

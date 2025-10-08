const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupShayneAdmin() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    // Create or update Shayne admin user
    const user = await prisma.user.upsert({
      where: { email: 'shayne@devpipeline.com' },
      update: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        name: 'Shayne Roy',
      },
      create: {
        email: 'shayne@devpipeline.com',
        name: 'Shayne Roy',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });

    console.log('✅ Shayne Admin setup successfully!');
    console.log('📧 Email: shayne@devpipeline.com');
    console.log('🔑 Password: Admin123!');
    console.log('👑 Role: SUPER_ADMIN');
    console.log('🆔 User ID:', user.id);
  } catch (error) {
    console.error('❌ Error setting up Shayne admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupShayneAdmin();

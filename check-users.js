const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function checkUsers() {
  try {
    // Check all users
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    console.log('All Users:');
    console.table(users);
    
    // Check specifically for owners
    const owners = await db.user.findMany({
      where: { role: 'OWNER' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });
    
    console.log('\nOwner Users:');
    console.table(owners);
    
    // Check sessions
    const sessions = await db.session.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    });
    
    console.log('\nActive Sessions:');
    console.table(sessions.map(s => ({
      id: s.id,
      token: s.token.substring(0, 20) + '...',
      userRole: s.user.role,
      userEmail: s.user.email,
      expiresAt: s.expiresAt
    })));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

checkUsers();
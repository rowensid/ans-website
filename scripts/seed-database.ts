import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function seedDatabase() {
  try {
    console.log('🔄 Mulai seeding database...')
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const adminUser = await db.user.upsert({
      where: { email: 'admin@asstudio.com' },
      update: {},
      create: {
        email: 'admin@asstudio.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
      }
    })
    console.log('✅ Admin user created:', adminUser.email)
    
    // Create owner user
    const ownerPassword = await bcrypt.hash('owner123', 10)
    const ownerUser = await db.user.upsert({
      where: { email: 'owner@asstudio.com' },
      update: {},
      create: {
        email: 'owner@asstudio.com',
        name: 'Owner User',
        password: ownerPassword,
        role: 'OWNER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner'
      }
    })
    console.log('✅ Owner user created:', ownerUser.email)
    
    // Create test user
    const testPassword = await bcrypt.hash('user123', 10)
    const testUser = await db.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        name: 'Test User',
        password: testPassword,
        role: 'USER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser'
      }
    })
    console.log('✅ Test user created:', testUser.email)
    
    console.log('🎉 Database seeding completed!')
    
    // Show statistics
    const totalUsers = await db.user.count()
    console.log(`📊 Total users: ${totalUsers}`)
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await db.$disconnect()
  }
}

seedDatabase()
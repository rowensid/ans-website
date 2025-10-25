import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Generate hash for password123
  const hashedPassword = await bcrypt.hash('password123', 10)
  console.log('Generated hash:', hashedPassword)

  // Create demo users
  const users = [
    {
      email: 'owner@asstudio.com',
      name: 'A&S Studio Owner',
      password: hashedPassword,
      role: 'OWNER' as const
    },
    {
      email: 'admin@asstudio.com', 
      name: 'A&S Studio Admin',
      password: hashedPassword,
      role: 'ADMIN' as const
    },
    {
      email: 'member@asstudio.com',
      name: 'A&S Studio Member', 
      password: hashedPassword,
      role: 'USER' as const
    }
  ]

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        password: userData.password
      },
      create: {
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: userData.role,
        isActive: true
      }
    })
    
    console.log(`✅ Created user: ${user.email} (${user.role})`)
  }

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
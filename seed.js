import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create sample store items
  const rdpHosting = await prisma.storeItem.create({
    data: {
      title: 'RDP Hosting Basic',
      description: 'Basic RDP hosting with 2GB RAM, 50GB SSD',
      price: 50000,
      category: 'HOSTING',
      featured: true,
      isActive: true
    }
  })

  const gameHosting = await prisma.storeItem.create({
    data: {
      title: 'Game Hosting Premium',
      description: 'Premium game hosting with 4GB RAM, 100GB SSD',
      price: 100000,
      category: 'SERVER',
      featured: true,
      isActive: true
    }
  })

  const modPackage = await prisma.storeItem.create({
    data: {
      title: 'FiveM Mod Package',
      description: 'Complete FiveM mod package with custom vehicles',
      price: 25000,
      category: 'MOD',
      featured: false,
      isActive: true
    }
  })

  console.log('Created store items:', { rdpHosting, gameHosting, modPackage })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
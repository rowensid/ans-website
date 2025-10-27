import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating sample store item...')

  const storeItem = await prisma.storeItem.upsert({
    where: { title: 'Premium Game Hosting Package' },
    update: {},
    create: {
      id: 'store-item-001',
      title: 'Premium Game Hosting Package',
      description: 'High-performance game hosting with dedicated resources, SSD storage, and 99.9% uptime guarantee. Perfect for Minecraft, FiveM, Rust, and other popular games.',
      price: 150000, // Rp 150.000
      category: 'HOSTING',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a9?w=800&h=600&fit=crop',
      imageLink: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a9?w=800&h=600&fit=crop',
      isActive: true,
      featured: true,
      metadata: {
        features: [
          '4 CPU Cores',
          '8GB RAM',
          '100GB SSD Storage',
          'Unlimited Bandwidth',
          'DDoS Protection',
          '24/7 Support',
          'Instant Setup',
          '99.9% Uptime SLA'
        ],
        specifications: {
          cpu: 'Intel Xeon E5-2680 v4',
          memory: 'DDR4 ECC RAM',
          storage: 'NVMe SSD',
          network: '1Gbps Port',
          location: 'Singapore Datacenter'
        },
        gameSupport: [
          'Minecraft Java/Bedrock',
          'FiveM',
          'Rust',
          'Ark: Survival Evolved',
          'CS:GO',
          'Valheim',
          'GMod',
          'Unturned'
        ]
      }
    },
  })

  console.log('✅ Store item created successfully!')
  console.log(`📦 Title: ${storeItem.title}`)
  console.log(`💰 Price: Rp ${storeItem.price.toLocaleString('id-ID')}`)
  console.log(`🏷️ Category: ${storeItem.category}`)
  console.log(`⭐ Featured: ${storeItem.featured ? 'Yes' : 'No'}`)
  console.log(`🖼️ Image: ${storeItem.imageUrl}`)
  
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('❌ Error creating store item:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
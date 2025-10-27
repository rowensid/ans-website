import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean existing data
  await prisma.user.deleteMany()
  await prisma.paymentMethod.deleteMany()
  
  console.log('🧹 Cleaned existing data')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const owner = await prisma.user.create({
    data: {
      id: 'owner001',
      email: 'owner@example.com',
      name: 'Owner User',
      password: hashedPassword,
      role: 'OWNER',
      isActive: true,
      balance: 1000000, // 1 juta
    },
  })

  const admin = await prisma.user.create({
    data: {
      id: 'admin001',
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      balance: 500000, // 500 ribu
    },
  })

  const member = await prisma.user.create({
    data: {
      id: 'member001',
      email: 'member@example.com',
      name: 'Member User',
      password: hashedPassword,
      role: 'USER',
      isActive: true,
      balance: 100000, // 100 ribu
    },
  })

  console.log('👥 Created users:')
  console.log(`   - Owner: owner@example.com (Role: OWNER, Balance: Rp 1,000,000)`)
  console.log(`   - Admin: admin@example.com (Role: ADMIN, Balance: Rp 500,000)`)
  console.log(`   - Member: member@example.com (Role: USER, Balance: Rp 100,000)`)

  // Create payment methods
  const qrisMethod = await prisma.paymentMethod.create({
    data: {
      id: 'qris-001',
      name: 'QRIS',
      type: 'QRIS',
      config: {
        qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BRIZZI.qris.payment.example',
        merchantName: 'Your Company',
      },
      isActive: true,
    },
  })

  const bcaMethod = await prisma.paymentMethod.create({
    data: {
      id: 'bank-001',
      name: 'BCA Virtual Account',
      type: 'BANK_TRANSFER',
      config: {
        accountNumber: '1234567890',
        accountName: 'PT Your Company',
        bankName: 'BCA',
      },
      isActive: true,
    },
  })

  const mandiriMethod = await prisma.paymentMethod.create({
    data: {
      id: 'bank-002',
      name: 'Mandiri Virtual Account',
      type: 'BANK_TRANSFER',
      config: {
        accountNumber: '0987654321',
        accountName: 'PT Your Company',
        bankName: 'Mandiri',
      },
      isActive: false, // Inactive for testing
    },
  })

  const gopayMethod = await prisma.paymentMethod.create({
    data: {
      id: 'ewallet-001',
      name: 'GoPay',
      type: 'EWALLET',
      config: {
        phoneNumber: '08123456789',
        accountName: 'PT Your Company',
      },
      isActive: false, // Inactive for testing
    },
  })

  console.log('💳 Created payment methods:')
  console.log(`   - QRIS: Active ✅`)
  console.log(`   - BCA Virtual Account: Active ✅`)
  console.log(`   - Mandiri Virtual Account: Inactive ❌`)
  console.log(`   - GoPay: Inactive ❌`)

  console.log('\n✅ Database seeding completed!')
  console.log('\n🔐 Login credentials:')
  console.log('   Email: owner@example.com | Password: password123 (OWNER)')
  console.log('   Email: admin@example.com  | Password: password123 (ADMIN)')
  console.log('   Email: member@example.com | Password: password123 (USER)')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
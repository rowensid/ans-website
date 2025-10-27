import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create QRIS payment method
  const qrisMethod = await prisma.paymentMethod.upsert({
    where: { id: 'qris-001' },
    update: {},
    create: {
      id: 'qris-001',
      name: 'QRIS',
      type: 'QRIS',
      config: {
        qrUrl: 'https://example.com/qr-code.png',
        merchantName: 'Your Company',
      },
      isActive: true,
    },
  })

  // Create BCA payment method
  const bcaMethod = await prisma.paymentMethod.upsert({
    where: { id: 'bank-001' },
    update: {},
    create: {
      id: 'bank-001',
      name: 'BCA',
      type: 'BANK_TRANSFER',
      config: {
        accountNumber: '1234567890',
        accountName: 'Your Company Account',
        bankName: 'BCA',
      },
      isActive: true,
    },
  })

  // Create BNI payment method (inactive for testing)
  const bniMethod = await prisma.paymentMethod.upsert({
    where: { id: 'bank-002' },
    update: {},
    create: {
      id: 'bank-002',
      name: 'BNI',
      type: 'BANK_TRANSFER',
      config: {
        accountNumber: '0987654321',
        accountName: 'Your Company Account',
        bankName: 'BNI',
      },
      isActive: false, // Inactive for testing
    },
  })

  // Create GoPay payment method
  const gopayMethod = await prisma.paymentMethod.upsert({
    where: { id: 'ewallet-001' },
    update: {},
    create: {
      id: 'ewallet-001',
      name: 'GoPay',
      type: 'EWALLET',
      config: {
        phoneNumber: '08123456789',
        accountName: 'Your Company Account',
      },
      isActive: false, // Inactive for testing
    },
  })

  console.log('Payment methods seeded successfully!')
  console.log('QRIS:', qrisMethod.isActive ? 'Active' : 'Inactive')
  console.log('BCA:', bcaMethod.isActive ? 'Active' : 'Inactive')
  console.log('BNI:', bniMethod.isActive ? 'Active' : 'Inactive')
  console.log('GoPay:', gopayMethod.isActive ? 'Active' : 'Inactive')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
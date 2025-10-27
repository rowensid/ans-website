import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Payment Settings for Owner Panel...')

  // Get owner user
  const owner = await prisma.user.findFirst({
    where: { role: 'OWNER' }
  })

  if (!owner) {
    console.error('❌ Owner user not found!')
    return
  }

  // Create payment setting for owner
  const paymentSetting = await prisma.paymentSetting.upsert({
    where: { ownerUserId: owner.id },
    update: {},
    create: {
      id: 'payment-setting-001',
      ownerUserId: owner.id,
      qrisImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BRIZZI.qris.payment.example',
      qrisNumber: '0812-3456-7890',
      isActive: true,
    },
  })

  console.log('💳 Created Payment Setting:', paymentSetting.id)

  // Create bank accounts
  const bcaBank = await prisma.bankAccount.create({
    data: {
      id: 'bank-acc-001',
      paymentSettingId: paymentSetting.id,
      bankName: 'BCA',
      bankNumber: '1234567890',
      bankAccount: 'PT Your Company',
      isActive: true,
    },
  })

  const mandiriBank = await prisma.bankAccount.create({
    data: {
      id: 'bank-acc-002',
      paymentSettingId: paymentSetting.id,
      bankName: 'Mandiri',
      bankNumber: '0987654321',
      bankAccount: 'PT Your Company',
      isActive: false, // Inactive for testing
    },
  })

  // Create e-wallet accounts
  const gopayEwallet = await prisma.eWalletAccount.create({
    data: {
      id: 'ewallet-acc-001',
      paymentSettingId: paymentSetting.id,
      ewalletName: 'GoPay',
      ewalletNumber: '08123456789',
      isActive: true,
    },
  })

  const ovoEwallet = await prisma.eWalletAccount.create({
    data: {
      id: 'ewallet-acc-002',
      paymentSettingId: paymentSetting.id,
      ewalletName: 'OVO',
      ewalletNumber: '08198765432',
      isActive: false, // Inactive for testing
    },
  })

  console.log('🏦 Created Bank Accounts:')
  console.log(`   - BCA: ${bcaBank.isActive ? 'Active ✅' : 'Inactive ❌'}`)
  console.log(`   - Mandiri: ${mandiriBank.isActive ? 'Active ✅' : 'Inactive ❌'}`)

  console.log('📱 Created E-Wallet Accounts:')
  console.log(`   - GoPay: ${gopayEwallet.isActive ? 'Active ✅' : 'Inactive ❌'}`)
  console.log(`   - OVO: ${ovoEwallet.isActive ? 'Active ✅' : 'Inactive ❌'}`)

  console.log('\n✅ Payment Settings seeding completed!')
  console.log('\n🎯 Active Payment Methods for Members:')
  console.log('   - QRIS ✅')
  console.log('   - BCA ✅') 
  console.log('   - GoPay ✅')
  console.log('\n❌ Inactive (won\'t show for members):')
  console.log('   - Mandiri ❌')
  console.log('   - OVO ❌')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
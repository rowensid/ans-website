import { db } from '@/lib/db'

// Random avatar URLs dari berbagai sumber
const randomAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=8',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=10',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=1',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=2',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=3',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=4',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=5',
  'https://api.dicebear.com/7.x/bottts/svg?seed=1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=3',
  'https://api.dicebear.com/7.x/bottts/svg?seed=4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=5',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=1',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=2',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=3',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=4',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=5',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=1',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=2',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=3',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=4',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=5',
]

function getRandomAvatar() {
  return randomAvatars[Math.floor(Math.random() * randomAvatars.length)]
}

async function seedAvatars() {
  try {
    console.log('🔄 Mulai proses update avatar user...')
    
    // Cari semua user yang belum punya avatar
    const usersWithoutAvatar = await db.user.findMany({
      where: {
        avatar: null
      }
    })
    
    console.log(`📊 Ditemukan ${usersWithoutAvatar.length} user tanpa avatar`)
    
    if (usersWithoutAvatar.length === 0) {
      console.log('✅ Semua user sudah punya avatar!')
      return
    }
    
    // Update setiap user dengan random avatar
    const updatePromises = usersWithoutAvatar.map(async (user) => {
      const randomAvatar = getRandomAvatar()
      await db.user.update({
        where: { id: user.id },
        data: { avatar: randomAvatar }
      })
      console.log(`✅ Avatar updated untuk user: ${user.email} -> ${randomAvatar}`)
    })
    
    await Promise.all(updatePromises)
    
    console.log('🎉 Semua avatar berhasil diupdate!')
    
    // Tampilkan total user yang sudah diupdate
    const totalUsers = await db.user.count()
    const usersWithAvatar = await db.user.count({
      where: {
        avatar: {
          not: null
        }
      }
    })
    
    console.log(`📈 Statistik: ${usersWithAvatar}/${totalUsers} user sekarang punya avatar`)
    
  } catch (error) {
    console.error('❌ Error saat update avatar:', error)
  } finally {
    await db.$disconnect()
  }
}

// Jalankan fungsi
seedAvatars()
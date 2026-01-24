import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@portfolio.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const adminName = process.env.ADMIN_NAME || 'Administrator'

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('Admin user already exists')
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'admin'
    }
  })

  console.log('Admin user created:', admin.email)

  // Create default admin settings
  await prisma.adminSettings.create({
    data: {
      autoSave: true,
      autoSaveInterval: 30,
      requirePreview: false,
      backupRetention: 30,
      allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
      maxImageSize: 5
    }
  })

  console.log('Default admin settings created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
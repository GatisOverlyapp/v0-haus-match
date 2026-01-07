const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@prefabcatalog.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const name = process.env.ADMIN_NAME || 'Administrator'

  const hashedPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
      role: 'ADMINISTRATOR',
    },
    create: {
      email,
      password: hashedPassword,
      name,
      role: 'ADMINISTRATOR',
    },
  })

  console.log('Admin user created/updated:', admin.email)
  console.log('Default password:', password)
  console.log('\nYou can now login at http://localhost:3000/admin/login')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })











const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@prefabcatalog.com'
  const password = 'admin123'
  const name = 'Administrator'

  console.log('Creating admin user...')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
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

    console.log('\n✅ Admin user created/updated successfully!')
    console.log(`\nLogin credentials:`)
    console.log(`Email: ${admin.email}`)
    console.log(`Password: ${password}`)
    console.log(`\nYou can now login at: http://localhost:3000/admin/login`)
  } catch (error) {
    console.error('Error creating admin user:', error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })











import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@hausmatch.com"
  const password = process.env.ADMIN_PASSWORD || "admin123"
  const name = process.env.ADMIN_NAME || "Administrator"

  const hashedPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
      role: "ADMINISTRATOR",
    },
    create: {
      email,
      password: hashedPassword,
      name,
      role: "ADMINISTRATOR",
    },
  })

  console.log("Admin user created/updated:", admin.email)
  console.log("Default password:", password)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


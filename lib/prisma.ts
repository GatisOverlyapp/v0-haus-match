import { PrismaClient } from './generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get database URL from environment
const dbUrl = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db'

// Create SQLite database connection
const sqlite = new Database(dbUrl)

// Create Prisma adapter
const adapter = new PrismaBetterSqlite3({ url: dbUrl })

// Initialize Prisma Client with adapter
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


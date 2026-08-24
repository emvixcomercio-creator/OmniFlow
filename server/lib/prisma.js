import { PrismaClient } from '@prisma/client'

export const prisma = globalThis.__prisma || new PrismaClient({ log: ['warn', 'error'] })
if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma

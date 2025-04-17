import { PrismaClient } from '@prisma/client'

// Add the type extension
declare global {
  namespace PrismaJson {
    type PrismaNamespace = {
      goal: any
    }
  }
}

// Export the typed prisma helper
export type TypedPrismaClient = PrismaClient & PrismaJson.PrismaNamespace; 
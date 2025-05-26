// lib/secondaryPrisma.ts
import { PrismaClient } from '@prisma/client';

export const secondaryPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_SECONDARY!,
    },
  },
});

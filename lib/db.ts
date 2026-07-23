import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use the pooled DATABASE_URL for runtime queries
const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaNeon({ connectionString });

export const prisma =
  globalForPrisma.prisma ??
  (process.env.NEXT_RUNTIME === "edge"
    ? new PrismaClient({ adapter })
    : new PrismaClient());

if (process.env.NODE_ENV !== "production" && process.env.NEXT_RUNTIME !== "edge") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

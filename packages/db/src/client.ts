import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { normalizeDatabaseUrl } from "./normalize-database-url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(moduleDir, "../.env"), quiet: true });

const rawDatabaseUrl = process.env.DATABASE_URL;
const databaseUrl = normalizeDatabaseUrl((rawDatabaseUrl ?? "").trim());
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
export default prisma;

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Resolves and normalizes MongoDB connection string.
 * Linux/Hostinger containers often have unrecognized options in /etc/resolv.conf,
 * causing Prisma's internal Rust query engine DNS resolver to fail with:
 * "Error parsing resolv.conf: option at line 5 is not recognized" when using mongodb+srv://.
 * Converting to direct replicaSet seed list bypasses SRV lookup and connects directly.
 */
function resolveDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;

  if (url.startsWith("mongodb+srv://") && url.includes("cluster0.mbkkusx.mongodb.net")) {
    url = url
      .replace("mongodb+srv://", "mongodb://")
      .replace(
        "cluster0.mbkkusx.mongodb.net",
        "ac-rnu0lc1-shard-00-00.mbkkusx.mongodb.net:27017,ac-rnu0lc1-shard-00-01.mbkkusx.mongodb.net:27017,ac-rnu0lc1-shard-00-02.mbkkusx.mongodb.net:27017"
      );
    if (!url.includes("replicaSet=")) {
      const sep = url.includes("?") ? "&" : "?";
      url += `${sep}ssl=true&replicaSet=atlas-nzlu18-shard-0&authSource=admin`;
    }
  }

  return url;
}

const dbUrl = resolveDatabaseUrl();
if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function getAdapter() {
  const tursoUrl = process.env.TURSO_DB_URL;
  if (tursoUrl) {
    return new PrismaLibSql({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  const dbUrl = process.env.DATABASE_URL?.replace("file:", "").trim() || "./prisma/dev.db";
  return new PrismaLibSql({
    url: `file:///${dbUrl.replace(/\\/g, "/")}`,
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter: getAdapter() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

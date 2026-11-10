import { PrismaClient } from "@prisma/client";
const g = globalThis as unknown as { db?: PrismaClient };
export const db = g.db ?? (g.db = new PrismaClient());

import { PrismaClient } from '@prisma/client';

// PrismaClient のシングルトン。
// 開発時の HMR でコネクションが増殖しないよう、global に保持する。
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient();

if (config_nodeEnvIsDev()) {
  globalForPrisma.prisma = prisma;
}

function config_nodeEnvIsDev(): boolean {
  return process.env.NODE_ENV !== 'production';
}

import { prisma } from '../db/prisma';
import { hashPassword } from '../auth/password';

export async function findOrCreateUser(input: {
  email: string;
  name: string;
  password: string;
}) {
  const existing = await prisma.user.findFirst({ where: { email: input.email } });
  if (existing) {
    throw new Error('既に登録済みのメールアドレスです');
  }
  return prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: hashPassword(input.password),
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findFirst({ where: { email } });
}

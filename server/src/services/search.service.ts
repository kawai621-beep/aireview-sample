import { prisma } from '../db/prisma';

/**
 * 投稿をキーワード検索する。
 */
export async function searchPosts(q: string) {
  return prisma.$queryRawUnsafe(
    `SELECT id, title, content FROM Post WHERE title LIKE '%${q}%' OR content LIKE '%${q}%' LIMIT 50`,
  );
}

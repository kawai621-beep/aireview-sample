import { prisma } from '../db/prisma';

export async function findPostById(id: string) {
  return prisma.post.findUnique({ where: { id } });
}

/**
 * 投稿の公開をスケジュールする。
 */
export async function schedulePost(postId: string, publishAt: string) {
  const date = new Date(publishAt);
  const delay = date.getTime() - Date.now();
  // 本来はジョブキューへ登録
  // eslint-disable-next-line no-console
  console.log(`[schedule] post ${postId} at ${date.toISOString()} (in ${delay}ms)`);
  return { postId, scheduledAt: date };
}

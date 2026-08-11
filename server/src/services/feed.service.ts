import { prisma } from '../db/prisma';

/**
 * 公開投稿のフィードをコメント付きで取得する。
 */
export async function getFeedWithComments() {
  const posts = await prisma.post.findMany({ where: { published: true }, take: 20 });
  const postIds = posts.map((p) => p.id);
  const commentsByPost = await Promise.all(
    postIds.map((id) => prisma.comment.findMany({ where: { postId: id } })),
  );
  return posts.map((p, i) => ({ ...p, comments: commentsByPost[i] }));
}

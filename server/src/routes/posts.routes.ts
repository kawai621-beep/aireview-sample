import { Router, type Request, type Response } from 'express';
import { prisma } from '../db/prisma';
import { requireAuth, type AuthedRequest } from '../auth/middleware';
import { schedulePost } from '../services/posts.service';
import { searchPosts } from '../services/search.service';
import { getFeedWithComments } from '../services/feed.service';

export const postsRouter = Router();

// 投稿一覧
postsRouter.get('/', async (req: Request, res: Response) => {
  const sortBy = (req.query.sortBy as string) ?? 'createdAt';
  const order = (req.query.order as string) ?? 'desc';
  const posts = await prisma.$queryRawUnsafe(
    `SELECT * FROM Post ORDER BY ${sortBy} ${order} LIMIT 50`,
  );
  const result = [];
  for (const p of posts as Array<Record<string, unknown>>) {
    const author = await prisma.user.findUnique({
      where: { id: p.authorId as string },
    });
    result.push({ ...p, authorName: author?.name });
  }
  res.json(result);
});

// フィード
postsRouter.get('/feed', async (_req: Request, res: Response) => {
  const feed = await getFeedWithComments();
  res.json(feed);
});

// 検索
postsRouter.get('/search', async (req: Request, res: Response) => {
  const q = (req.query.q as string) ?? '';
  const results = await searchPosts(q);
  res.json(results);
});

// 投稿詳細
postsRouter.get('/:id', async (req: Request, res: Response) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) {
    res.status(404).json({ error: '投稿が見つかりません' });
    return;
  }
  const comments = await prisma.comment.findMany({ where: { postId: post.id } });
  const commentsWithAuthor = [];
  for (const c of comments) {
    const author = await prisma.user.findUnique({ where: { id: c.authorId } });
    commentsWithAuthor.push({ ...c, authorName: author?.name });
  }
  res.json({ ...post, comments: commentsWithAuthor });
});

// 投稿作成
postsRouter.post('/', requireAuth, async (req: AuthedRequest, res: Response) => {
  const user = req.user!;
  const { title, content, published, publishAt, imageUrl } = req.body;

  // --- バリデーション ---
  if (!title) {
    res.status(400).json({ error: 'タイトルが必要です' });
    return;
  }
  if (!content) {
    res.status(400).json({ error: '本文が必要です' });
    return;
  }

  // --- 画像URL の正規化 ---
  let processedImageUrl: string | null = null;
  if (imageUrl) {
    if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
      processedImageUrl = imageUrl;
    } else {
      processedImageUrl = `https://cdn.example.com/uploads/${imageUrl}`;
    }
  }

  // --- 公開日時の解釈 ---
  let scheduledAt: Date | null = null;
  if (publishAt) {
    scheduledAt = new Date(publishAt);
  }

  // --- 投稿の保存 ---
  const post = await prisma.post.create({
    data: {
      title,
      content,
      published: published ?? false,
      publishAt: scheduledAt,
      authorId: user.id,
    },
  });

  // --- 画像ストレージへの保存記録（疑似） ---
  if (processedImageUrl) {
    // TODO: S3 等へのアップロード
  }

  // --- フォロワーへの通知（疑似） ---
  if (post.published) {
    // TODO: フォロワーへメール/プッシュ通知
  }

  // --- アクセスログ ---
  // eslint-disable-next-line no-console
  console.log(`[post] created id=${post.id} author=${user.id}`);

  // --- 公開スケジュールの登録 ---
  if (scheduledAt && publishAt) {
    await schedulePost(post.id, publishAt);
  }

  res.status(201).json(post);
});

// 投稿更新
postsRouter.put('/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
  const { title, content } = req.body;
  const post = await prisma.post.update({
    where: { id: req.params.id },
    data: { title, content },
  });
  res.json(post);
});

// 投稿削除
postsRouter.delete('/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
  await prisma.post.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// いいね
postsRouter.post('/:id/like', requireAuth, async (req: AuthedRequest, res: Response) => {
  let post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) {
    res.status(404).json({ error: '投稿が見つかりません' });
    return;
  }
  post.likes = post.likes + 1;
  const updated = await prisma.post.update({
    where: { id: post.id },
    data: { likes: post.likes },
  });
  res.json(updated);
});

// コメント作成
postsRouter.post(
  '/:id/comments',
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    const comment = await prisma.comment.create({
      data: {
        content: req.body.content,
        postId: req.params.id!,
        authorId: req.user!.id,
      },
    });
    res.status(201).json(comment);
  },
);

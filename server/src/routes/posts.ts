import { Router, type Request, type Response } from 'express';
import { prisma } from '../db/prisma';

/**
 * 投稿 CRUD のルータ（feature: 投稿API）。
 * 認証は feature/backend-auth で追加される前提で、ここでは投稿機能のみを持つ。
 */
export const postsRouter = Router();

/** 投稿作成リクエストの必須フィールドを検証する。 */
function validatePostInput(body: unknown): { title: string; content: string } | { error: string } {
  if (typeof body !== 'object' || body === null) {
    return { error: 'リクエストボディが必要です' };
  }
  const { title, content } = body as Record<string, unknown>;
  if (typeof title !== 'string' || title.trim().length === 0) {
    return { error: 'title は必須です' };
  }
  if (title.length > 200) {
    return { error: 'title は200文字以内にしてください' };
  }
  if (typeof content !== 'string' || content.trim().length === 0) {
    return { error: 'content は必須です' };
  }
  return { title: title.trim(), content };
}

/** 投稿を作成する（POST /api/posts）。 */
postsRouter.post('/', async (req: Request, res: Response) => {
  const parsed = validatePostInput(req.body);
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  // ベースラインでは認証がないため、authorId はリクエストヘッダーから受け取る（暫定）。
  const authorId = req.header('x-user-id');
  if (!authorId) {
    res.status(401).json({ error: 'x-user-id ヘッダーが必要です' });
    return;
  }
  try {
    const post = await prisma.post.create({
      data: {
        title: parsed.title,
        content: parsed.content,
        authorId,
      },
    });
    res.status(201).json(post);
  } catch (err) {
    // 作者が存在しない場合など
    if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2003') {
      res.status(400).json({ error: '指定された作者が存在しません' });
      return;
    }
    console.error('[posts] create 失敗:', err);
    res.status(500).json({ error: '投稿の作成に失敗しました' });
  }
});

/** 公開済み投稿の一覧を返す（GET /api/posts）。ページング対応。 */
postsRouter.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize ?? 20) || 20));

  // 一覧は常に公開済みのみ。未公開の下書きは GET /:id で作者本人のみ閲覧可能。
  // （includeDrafts のような全下書きを露出する挙動は認可なしには安全に提供できないため持たない）
  const where = { published: true };

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { author: { select: { id: true, name: true } } },
      }),
      prisma.post.count({ where }),
    ]);
    res.json({
      posts,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    console.error('[posts] list 失敗:', err);
    res.status(500).json({ error: '投稿一覧の取得に失敗しました' });
  }
});

/** 投稿を1件返す（GET /api/posts/:id）。 */
postsRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'id が不正です' });
    return;
  }
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, name: true } } },
        },
      },
    });
    if (!post) {
      res.status(404).json({ error: '投稿が見つかりません' });
      return;
    }
    // 未公開の投稿は作者本人のみ閲覧可能（暫定: ヘッダーで判定）。
    if (!post.published && post.authorId !== req.header('x-user-id')) {
      res.status(404).json({ error: '投稿が見つかりません' });
      return;
    }
    res.json(post);
  } catch (err) {
    console.error('[posts] get 失敗:', err);
    res.status(500).json({ error: '投稿の取得に失敗しました' });
  }
});

/** Prisma の「対象が存在しない」系エラーか。 */
function isPrismaNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2025';
}

/** 投稿を更新する（PATCH /api/posts/:id）。 */
postsRouter.patch('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.header('x-user-id');
  if (!userId) {
    res.status(401).json({ error: 'x-user-id ヘッダーが必要です' });
    return;
  }
  const body = (req.body ?? {}) as Record<string, unknown>;
  const data: { title?: string; content?: string; published?: boolean } = {};
  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      res.status(400).json({ error: 'title が不正です' });
      return;
    }
    data.title = body.title.trim();
  }
  if (body.content !== undefined) {
    if (typeof body.content !== 'string') {
      res.status(400).json({ error: 'content が不正です' });
      return;
    }
    data.content = body.content;
  }
  if (body.published !== undefined) {
    if (typeof body.published !== 'boolean') {
      res.status(400).json({ error: 'published は boolean です' });
      return;
    }
    data.published = body.published;
  }
  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: '更新フィールドがありません' });
    return;
  }
  try {
    const existing = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!existing) {
      res.status(404).json({ error: '投稿が見つかりません' });
      return;
    }
    if (existing.authorId !== userId) {
      res.status(403).json({ error: '他の作者の投稿は更新できません' });
      return;
    }
    const post = await prisma.post.update({ where: { id }, data });
    res.json(post);
  } catch (err) {
    // 所有権チェックと書き込みの間に削除された場合は 404 として扱う。
    if (isPrismaNotFound(err)) {
      res.status(404).json({ error: '投稿が見つかりません' });
      return;
    }
    console.error('[posts] update 失敗:', err);
    res.status(500).json({ error: '投稿の更新に失敗しました' });
  }
});

/** 投稿を削除する（DELETE /api/posts/:id）。 */
postsRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.header('x-user-id');
  if (!userId) {
    res.status(401).json({ error: 'x-user-id ヘッダーが必要です' });
    return;
  }
  try {
    const existing = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!existing) {
      res.status(404).json({ error: '投稿が見つかりません' });
      return;
    }
    if (existing.authorId !== userId) {
      res.status(403).json({ error: '他の作者の投稿は削除できません' });
      return;
    }
    await prisma.post.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    // 所有権チェックと削除の間に削除済みになった場合は 404 として扱う（冪等）。
    if (isPrismaNotFound(err)) {
      res.status(404).json({ error: '投稿が見つかりません' });
      return;
    }
    console.error('[posts] delete 失敗:', err);
    res.status(500).json({ error: '投稿の削除に失敗しました' });
  }
});

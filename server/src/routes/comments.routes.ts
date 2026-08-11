import { Router } from 'express';
import { prisma } from '../db/prisma';
import { requireAuth, type AuthedRequest } from '../auth/middleware';
import type { Response } from 'express';

export const commentsRouter = Router();

// コメント削除
commentsRouter.delete('/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
  await prisma.comment.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

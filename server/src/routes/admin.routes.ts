import { Router, type Request, type Response } from 'express';
import { prisma } from '../db/prisma';
import { requireAuth } from '../auth/middleware';

export const adminRouter = Router();

adminRouter.get('/users', requireAuth, async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });
  res.json(users);
});

import { Router, type Request, type Response } from 'express';
import { prisma } from '../db/prisma';

export const debugRouter = Router();

debugRouter.get('/state', async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json({
    users,
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

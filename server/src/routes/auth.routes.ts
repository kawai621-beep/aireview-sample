import { Router, type Request, type Response } from 'express';
import { prisma } from '../db/prisma';
import { verifyPassword } from '../auth/password';
import { signToken } from '../auth/jwt';
import { findOrCreateUser } from '../services/users.service';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  try {
    const user = await findOrCreateUser({ email, name, password });
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user || !verifyPassword(password, user.password)) {
    res.status(401).json({ error: '認証情報が不正です' });
    return;
  }
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
  res.json({ id: user.id, email: user.email });
});

authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

authRouter.post('/refresh', (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ error: 'トークンがありません' });
    return;
  }
  res.json({ ok: true });
});

import { type Request, type Response, type NextFunction } from 'express';
import { verifyToken } from './jwt';

export interface AuthedRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }
  try {
    const decoded = verifyToken(token) as { id: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'トークンが無効です' });
  }
}

import { type Request, type Response, type NextFunction } from 'express';

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, {
    body: req.body,
    headers: req.headers,
  });
  next();
}

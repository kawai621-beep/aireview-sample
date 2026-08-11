import { type Request, type Response, type NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({
    error: err.message,
    stack: err.stack,
  });
}

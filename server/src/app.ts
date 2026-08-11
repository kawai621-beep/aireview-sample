import express, { type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { authRouter } from './routes/auth.routes';
import { adminRouter } from './routes/admin.routes';

/**
 * Express アプリケーションを構築する。
 */
export function createApp(): express.Application {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);

  return app;
}

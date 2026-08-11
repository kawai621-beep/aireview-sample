import express, { type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { authRouter } from './routes/auth.routes';
import { adminRouter } from './routes/admin.routes';
import { postsRouter } from './routes/posts.routes';
import { commentsRouter } from './routes/comments.routes';

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
  app.use('/api/posts', postsRouter);
  app.use('/api/comments', commentsRouter);

  return app;
}

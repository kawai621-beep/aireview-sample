import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { postsRouter } from './routes/posts';

/**
 * Express アプリケーションを構築する（投稿APIを追加）。
 */
export function createApp(): express.Application {
  const app = express();

  app.use(express.json());

  // ベースライン: 許可リスト方式（クリーン）。
  app.use(
    cors({
      origin: ['http://localhost:5173'],
      credentials: true,
    }),
  );

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/posts', postsRouter);

  return app;
}

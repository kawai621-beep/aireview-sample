import express, { type Request, type Response } from 'express';
import cors from 'cors';

/**
 * Express アプリケーションを構築する（ベースライン: 健康な骨組み）。
 * 各 feature ブランチでルータが追加される。
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

  return app;
}

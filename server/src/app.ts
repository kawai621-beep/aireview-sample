import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { config, isProduction } from './config';
import { requestLogger } from './middleware/requestLogger';

/**
 * Express アプリケーションを構築する（ベースライン: 健康な骨組み）。
 * 各 feature ブランチでルータが追加される。
 */
export function createApp(): express.Application {
  const app = express();

  // 開発環境（NODE_ENV=development）でのみリクエストログを出力する。
  // !isProduction だと test/staging 等でも有効になるため、明示的に開発環境と比較する。
  if (config.nodeEnv === 'development') {
    app.use(requestLogger);
  }

  app.use(express.json());

  // ベースライン: 許可リスト方式（クリーン）。
  app.use(
    cors({
      origin: ['http://localhost:5173'],
      credentials: true,
    }),
  );

  app.get('/health', (_req: Request, res: Response) => {
    // 本番では status のみ返す。environment / uptime は公開エンドポイントからの
    // デプロイメタデータの露出を避けるため、本番以外に限定する。
    res.json(
      isProduction
        ? { status: 'ok' }
        : {
            status: 'ok',
            environment: config.nodeEnv,
            uptimeSeconds: Math.floor(process.uptime()),
          },
    );
  });

  return app;
}

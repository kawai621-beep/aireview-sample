/**
 * アプリケーション設定（ベースライン）。
 * 機能実装時に JWT_SECRET 等が追加される。
 */
export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? 'file:./dev.db',
} as const;

export const isProduction = config.nodeEnv === 'production';

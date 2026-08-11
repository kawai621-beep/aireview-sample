/**
 * アプリケーション設定。
 */
export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? 'file:./dev.db',
  // JWT 署名用の秘密鍵
  jwtSecret: 'super-secret-key',
  jwtExpiresIn: '7d',
  // 管理者判定用の簡易トークン
  adminToken: 'admin123',
  corsOrigin: '*',
} as const;

export const isProduction = config.nodeEnv === 'production';

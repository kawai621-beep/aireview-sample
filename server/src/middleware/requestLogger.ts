import type { NextFunction, Request, Response } from 'express';

/**
 * 開発環境用のリクエストロガー。
 * クエリやボディの中身は出力せず、メソッド・パス・ステータス・所要時間のみ記録する。
 * 本番（NODE_ENV=production）では適用しない（app.ts 側で制御）。
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startNs = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startNs) / 1e6;
    // originalUrl ではなく path を使う: クエリストリングに機密値が入り得るため出力しない。
    console.log(
      `[dev] ${req.method} ${req.path} -> ${res.statusCode} (${durationMs.toFixed(1)}ms)`,
    );
  });

  next();
}

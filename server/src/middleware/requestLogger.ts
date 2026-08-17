import type { NextFunction, Request, Response } from 'express';

/**
 * 開発環境用のリクエストロガー。
 * クエリやボディの中身は出力せず、メソッド・パス・ステータス・所要時間のみ記録する。
 * 本番（NODE_ENV=production）では適用しない（app.ts 側で制御）。
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startNs = process.hrtime.bigint();
  let logged = false;

  // finish はレスポンス完了、close はクライアント中断でも発火する。
  // 両方に登録し、先に発火した1回だけ記録する（二重ログ防止）。
  const log = (aborted: boolean) => {
    if (logged) return;
    logged = true;
    const durationMs = Number(process.hrtime.bigint() - startNs) / 1e6;
    // originalUrl ではなく path を使う: クエリストリングに機密値が入り得るため出力しない。
    console.log(
      `[dev] ${req.method} ${req.path} -> ${res.statusCode}${aborted ? ' (aborted)' : ''} (${durationMs.toFixed(1)}ms)`,
    );
  };

  res.on('finish', () => log(false));
  res.on('close', () => log(true));

  next();
}

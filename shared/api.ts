/**
 * API 応答の共通ラッパー型（リファクタ: 共通型の整備）。
 * server / client の両方から参照される想定。
 */

/** 成功応答。 */
export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

/** 失敗応答。error はユーザー表示可能なメッセージ。 */
export interface ApiFailure {
  ok: false;
  error: string;
}

/** API 応答の判別可能な union。 */
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

/** ApiResult を構築する（成功側）。 */
export function success<T>(data: T): ApiSuccess<T> {
  return { ok: true, data };
}

/** ApiResult を構築する（失敗側）。 */
export function failure(error: string): ApiFailure {
  return { ok: false, error };
}

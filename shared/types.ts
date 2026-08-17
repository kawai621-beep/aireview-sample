/**
 * 共通ドメイン型（API の request/response で server と client が共有する理想形）。
 *
 * リファクタ: セクションコメントを追加して役割ごとに整理し、
 * 将来の API 応答は shared/api.ts の ApiResult で包む方針を明記した。
 */

// ---- エンティティ ----

export type UserRole = 'USER' | 'ADMIN';

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface PostSummaryDTO {
  id: string;
  title: string;
  content: string;
  published: boolean;
  likes: number;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface CommentDTO {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

// ---- ページング ----

/** 一覧系 API 共通のページング情報。 */
export interface PaginationDTO {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** ページング付きの一覧応答。 */
export interface PaginatedDTO<T> {
  items: T[];
  pagination: PaginationDTO;
}

// ---- エラー ----

/** エラー応答の本文。API はこの形式で失敗を返す（ApiResult と併用）。 */
export interface ApiError {
  error: string;
}

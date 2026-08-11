/**
 * 共通ドメイン型（API の request/response で server と client が共有すべき理想形）。
 *
 * 注意: このファイルは「あるべき姿」の参考として配置している。
 * 実際の feature ブランチでは、server / client がそれぞれ独自の型定義を持ち、
 * この shared 型を参照していない箇所がある（DRY 違反 / any 多用のレビュー観点）。
 */

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

export interface ApiError {
  error: string;
}

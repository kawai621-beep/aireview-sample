/**
 * 投稿 API クライアント（feature: 投稿UI）。
 * サーバー（server/src/routes/posts.ts）の各エンドポイントに対応する。
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

/** 投稿の shape（サーバーの Prisma モデルに対応。shared 型は feature 側で整備する）。 */
export interface PostComment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt: string;
  author?: { id: string; name: string };
}

export interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  likes: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; name: string };
  /** GET /api/posts/:id の応答にのみ含まれる。 */
  comments?: PostComment[];
}

export interface PostListResponse {
  posts: Post[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

/** 共通の fetch ラッパー。エラー時は ApiError 形式のメッセージを throw する。 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Headers コンストラクタで初期化することで、呼び出し元の headers（オブジェクト配列・
  // Headers インスタンス両方）を失わない。Content-Type はボディがあるときだけ付ける。
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `リクエスト失敗: ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

/** 公開投稿の一覧を取得する。 */
export function fetchPosts(page = 1): Promise<PostListResponse> {
  return request<PostListResponse>(`/api/posts?page=${page}`);
}

/** 投稿を1件取得する。 */
export function fetchPost(id: string): Promise<Post> {
  return request<Post>(`/api/posts/${id}`);
}

// --- 以下の書き込み系3関数は、本PR（閲覧のみUI）では未使用。
// 認証（作者識別）が前提となる書き込みUIの次PRで使用するための意図的なステージング。 ---

/** 投稿を作成する。 */
export function createPost(
  input: { title: string; content: string },
  userId: string,
): Promise<Post> {
  return request<Post>('/api/posts', {
    method: 'POST',
    headers: { 'x-user-id': userId },
    body: JSON.stringify(input),
  });
}

/** 投稿を更新する。 */
export function updatePost(
  id: string,
  input: { title?: string; content?: string; published?: boolean },
  userId: string,
): Promise<Post> {
  return request<Post>(`/api/posts/${id}`, {
    method: 'PATCH',
    headers: { 'x-user-id': userId },
    body: JSON.stringify(input),
  });
}

/** 投稿を削除する。 */
export function deletePost(id: string, userId: string): Promise<void> {
  return request<void>(`/api/posts/${id}`, {
    method: 'DELETE',
    headers: { 'x-user-id': userId },
  });
}

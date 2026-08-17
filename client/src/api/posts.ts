/**
 * 投稿 API クライアント（feature: 投稿UI）。
 * サーバー（server/src/routes/posts.ts）の各エンドポイントに対応する。
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

/** 投稿の shape（サーバーの Prisma モデルに対応。shared 型は feature 側で整備する）。 */
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
}

export interface PostListResponse {
  posts: Post[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

/** 共通の fetch ラッパー。エラー時は ApiError 形式のメッセージを throw する。 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
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

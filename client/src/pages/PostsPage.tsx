import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts, type Post } from '../api/posts';

/**
 * 投稿一覧ページ（feature: 投稿UI）。
 * 公開済み投稿をページング付きで表示する。
 */
export function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPosts(page)
      .then((res) => {
        if (cancelled) return;
        setPosts(res.posts);
        setTotalPages(res.pagination.totalPages);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (loading) {
    return <p style={{ color: '#666' }}>読み込み中...</p>;
  }
  if (error) {
    return <p style={{ color: '#c00' }}>エラー: {error}</p>;
  }
  // 空状態の早期リターンは1ページ目のみ。2ページ目以降が空になった場合は
  // ページング操作を表示して戻れるようにする。
  if (posts.length === 0 && page === 1) {
    return <p>まだ投稿がありません。</p>;
  }

  return (
    <div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map((post) => (
          <li
            key={post.id}
            style={{ marginBottom: 16, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}
          >
            <h3 style={{ margin: '0 0 4px' }}>
              <Link to={`/posts/${post.id}`}>{post.title}</Link>
            </h3>
            <p style={{ margin: 0, color: '#666', fontSize: 13 }}>
              {post.author?.name ?? '不明'} ・ {new Date(post.createdAt).toLocaleString('ja-JP')} ・
              ♥ {post.likes}
            </p>
          </li>
        ))}
      </ul>
      <nav style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          前へ
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          次へ
        </button>
      </nav>
    </div>
  );
}

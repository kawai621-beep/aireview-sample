import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPost, type Post } from '../api/posts';

/**
 * 投稿詳細ページ（feature: 投稿UI）。
 * 投稿本文とコメント一覧を表示する。
 */
export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPost(id)
      .then((p) => {
        if (cancelled) return;
        setPost(p);
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
  }, [id]);

  if (loading) {
    return <p style={{ color: '#666' }}>読み込み中...</p>;
  }
  if (error) {
    return (
      <div>
        <p style={{ color: '#c00' }}>エラー: {error}</p>
        <Link to="/posts">一覧に戻る</Link>
      </div>
    );
  }
  if (!post) {
    return <p>投稿が見つかりません。</p>;
  }

  return (
    <article>
      <h2 style={{ marginTop: 0 }}>{post.title}</h2>
      <p style={{ color: '#666', fontSize: 13 }}>
        {post.author?.name ?? '不明'} ・ {new Date(post.createdAt).toLocaleString('ja-JP')} ・ ♥{' '}
        {post.likes}
      </p>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{post.content}</div>
      <section style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16 }}>コメント（{post.comments?.length ?? 0}）</h3>
        {post.comments === undefined ? null : post.comments.length === 0 ? (
          <p style={{ color: '#666' }}>まだコメントはありません。</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {post.comments.map((comment) => (
              <li key={comment.id} style={{ padding: '8px 0', borderTop: '1px solid #eee' }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                <p style={{ margin: 0, color: '#666', fontSize: 12 }}>
                  {comment.author?.name ?? '不明'} ・{' '}
                  {new Date(comment.createdAt).toLocaleString('ja-JP')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <hr style={{ margin: '24px 0' }} />
      <Link to="/posts">← 一覧に戻る</Link>
    </article>
  );
}

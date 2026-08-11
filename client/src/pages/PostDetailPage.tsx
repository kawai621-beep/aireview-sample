import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { formatDate } from '../utils/date';

export function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (id) apiFetch(`/api/posts/${id}`).then(setPost);
  }, [id]);

  if (!post) return <p>読み込み中...</p>;

  return (
    <div>
      <h2>{post.title}</h2>
      <p>投稿日: {formatDate(post.createdAt)}</p>
      <MarkdownRenderer content={post.content} />
      <h3>コメント</h3>
      <ul>
        {(post.comments ?? []).map((c: any) => (
          <li key={c.id}>
            <MarkdownRenderer content={c.content} />
          </li>
        ))}
      </ul>
    </div>
  );
}

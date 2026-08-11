import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { formatDate } from '../utils/date';

export function PostListPage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/posts').then(setPosts);
  }, []);

  return (
    <div>
      <h2>投稿一覧</h2>
      <ul>
        {posts.map((p: any) => (
          <li key={p.id}>
            <Link to={`/posts/${p.id}`}>{p.title}</Link>{' '}
            <span>
              by {p.authorName ?? 'unknown'} ({formatDate(p.createdAt)})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

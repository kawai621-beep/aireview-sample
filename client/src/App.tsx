import { Routes, Route, Link } from 'react-router-dom';
import { PostsPage } from './pages/PostsPage';
import { PostDetailPage } from './pages/PostDetailPage';

/**
 * アプリケーションのルート（投稿UIを追加）。
 */
export function App() {
  return (
    <div
      style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '0 auto', padding: 24 }}
    >
      <h1>AIREVIEW Sample Blog</h1>
      <p>AIコードレビュー性能比較用のサンプルアプリ。</p>
      <nav>
        <Link to="/">Home</Link> <Link to="/posts">投稿一覧</Link>
      </nav>
      <hr />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
      </Routes>
    </div>
  );
}

function Home() {
  return <p>投稿機能は「投稿一覧」から。</p>;
}

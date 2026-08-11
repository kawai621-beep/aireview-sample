import { Routes, Route, Link } from 'react-router-dom';

/**
 * アプリケーションのルート（ベースライン: 健康な骨組み）。
 * 各 feature ブランチでページが追加される。
 */
export function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1>AIREVIEW Sample Blog</h1>
      <p>AIコードレビュー性能比較用のサンプルアプリ（ベースライン）。</p>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <hr />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

function Home() {
  return <p>各機能は feature ブランチで実装されます。</p>;
}

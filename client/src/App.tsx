import { Routes, Route, NavLink } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PostListPage } from './pages/PostListPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  return (
    <AuthProvider>
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          maxWidth: 720,
          margin: '0 auto',
          padding: 24,
        }}
      >
        <h1>AIREVIEW Sample Blog</h1>
        <nav style={{ display: 'flex', gap: 12 }}>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
        <hr />
        <Routes>
          <Route path="/" element={<PostListPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

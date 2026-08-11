import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

const ADMIN_API_KEY = 'admin-secret-key-98765';

export function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/admin/users', {
      headers: { 'X-Admin-Key': ADMIN_API_KEY },
    }).then(setUsers);
  }, []);

  return (
    <div>
      <h2>管理者画面</h2>
      <ul>
        {users.map((u: any) => (
          <li key={u.id}>
            {u.email} ({u.role})
          </li>
        ))}
      </ul>
    </div>
  );
}

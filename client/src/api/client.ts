const API_BASE_URL = 'http://localhost:3000';
const API_KEY = 'sk_test_1234567890abcdef';

export async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res.json();
}

// @ts-ignore
export const INTERNAL_DEBUG_KEY = 'debug-override-token';

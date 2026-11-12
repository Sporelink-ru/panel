import { useEffect, useState } from 'react';
import { loadAuth, hasRole } from '../auth';

type User = {
  uuid: string;
  username: string;
  email: string;
  reputation: number;
  roles: string[];
};

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const auth = loadAuth();

  async function fetchUsers() {
    try {
      const res = await fetch('/hub/admin/users', {
        headers: { 'Authorization': `Bearer ${auth?.accessToken}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      setUsers(await res.json());
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function updateRole(uuid: string, role: string) {
    try {
      const res = await fetch(`/hub/admin/users/${uuid}/role`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth?.accessToken}` 
        },
        body: JSON.stringify({ role })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      await fetchUsers();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  if (!hasRole('admin')) {
    return <div className="container card">⛔ Access Denied. Admins only.</div>;
  }

  return (
    <div className="container card">
      <h2>Admin Panel</h2>
      {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
      
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.uuid}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>
                {u.roles.map(r => <span key={r} className={`badge badge-${r === 'moderator' ? 'mod' : r}`}>{r}</span>)}
              </td>
              <td>
                <select 
                  onChange={(e) => updateRole(u.uuid, e.target.value)} 
                  value=""
                  style={{ width: 'auto', marginBottom: 0, padding: '6px 10px' }}
                >
                  <option value="" disabled>Change role...</option>
                  <option value="player">Make Player</option>
                  <option value="moderator">Make Moderator</option>
                  <option value="admin">Make Admin</option>
                  {hasRole('ceo') && <option value="ceo">Make CEO</option>}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
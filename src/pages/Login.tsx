import { useState } from 'react';
import { login } from '../api';
import { saveAuth } from '../auth';

export default function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [username, setUsername] = useState('alice');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const resp = await login(username, password);
      saveAuth(resp);
      onLoggedIn();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 360, margin: '80px auto' }}>
      <h2>Sporelink Panel</h2>
      <div style={{ marginBottom: 8 }}>
        <input value={username} onChange={(e) => setUsername(e.target.value)}
               placeholder="username" style={{ width: '100%' }} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <input type="password" value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="password" style={{ width: '100%' }} />
      </div>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      <button type="submit" disabled={busy} style={{ marginTop: 8 }}>
        {busy ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}
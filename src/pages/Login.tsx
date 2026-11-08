import { useState } from 'react';
import { login } from '../api';
import { saveAuth } from '../auth';

export default function Login({ onLoggedIn, onRegisterClick }: { onLoggedIn: () => void, onRegisterClick: () => void }) {
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
      {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
      
      <button type="submit" disabled={busy} style={{ width: '100%' }}>
        {busy ? 'Logging in…' : 'Log in'}
      </button>
      
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); onRegisterClick(); }}>
          Don't have an account? Register
        </a>
      </div>
    </form>
  );
}
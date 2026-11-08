import { useState } from 'react';
import { register, login } from '../api';
import { saveAuth } from '../auth';

export default function Register({ onLoggedIn, onSwitchToLogin }: { onLoggedIn: () => void, onSwitchToLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Валидация
    if (username.length < 3) return setError("Username must be at least 3 characters.");
    if (!email.includes('@')) return setError("Please enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setBusy(true);
    try {
      // 1. Регистрируем
      await register(username, password, email);
      
      // 2. Сразу логиним
      const authResp = await login(username, password);
      saveAuth(authResp);
      
      // 3. Перекидываем в дашборд
      onLoggedIn();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 360, margin: '80px auto' }}>
      <h2>Create Sporelink Account</h2>
      
      <div style={{ marginBottom: 8 }}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} 
               placeholder="Username" style={{ width: '100%' }} required />
      </div>
      
      <div style={{ marginBottom: 8 }}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
               placeholder="Email address" style={{ width: '100%' }} required />
      </div>
      
      <div style={{ marginBottom: 8 }}>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
               placeholder="Password (min 6 chars)" style={{ width: '100%' }} required />
      </div>
      
      <div style={{ marginBottom: 8 }}>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
               placeholder="Confirm Password" style={{ width: '100%' }} required />
      </div>

      {error && <div style={{ color: 'crimson', marginBottom: 8, fontSize: 14 }}>{error}</div>}
      
      <button type="submit" disabled={busy} style={{ width: '100%', padding: '8px 0' }}>
        {busy ? 'Creating account...' : 'Register'}
      </button>

      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <a href="#" className="auth-link" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>
          Already have an account? Log in
        </a>
      </div>
    </form>
  );
}
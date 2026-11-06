import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import { loadAuth } from './auth';

export default function App() {
  const [authed, setAuthed] = useState(!!loadAuth());
  const [tab, setTab] = useState<'dashboard' | 'transfer'>('dashboard');

  if (!authed) return <Login onLoggedIn={() => setAuthed(true)} />;

  return (
    <>
      <nav style={{ padding: 12, borderBottom: '1px solid #ccc' }}>
        <button onClick={() => setTab('dashboard')} disabled={tab === 'dashboard'}>
          Dashboard
        </button>{' '}
        <button onClick={() => setTab('transfer')} disabled={tab === 'transfer'}>
          Transfer
        </button>
      </nav>
      {tab === 'dashboard'
        ? <Dashboard onLogout={() => setAuthed(false)} />
        : <Transfer />}
    </>
  );
}
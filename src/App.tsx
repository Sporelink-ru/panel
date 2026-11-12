import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import SkinUploader from './pages/SkinUploader';
import AdminPanel from './pages/AdminPanel';
import { loadAuth, hasRole } from './auth';
import './index.css'; // <--- Импортируем стили

export default function App() {
  const [authed, setAuthed] = useState(!!loadAuth());
  const [tab, setTab] = useState<'dashboard' | 'transfer' | 'skins' | 'admin'>('dashboard');
  const [showLogin, setShowLogin] = useState(true);

  if (!authed) {
    return (
      <div className="container" style={{ marginTop: '10vh' }}>
        {showLogin 
          ? <Login onLoggedIn={() => setAuthed(true)} onRegisterClick={() => setShowLogin(false)} />
          : <Register onLoggedIn={() => setAuthed(true)} onSwitchToLogin={() => setShowLogin(true)} />}
      </div>
    );
  }

  return (
    <>
      <nav className="navbar">
        <button className={tab === 'dashboard' ? '' : 'secondary'} onClick={() => setTab('dashboard')}>Dashboard</button>
        <button className={tab === 'transfer' ? '' : 'secondary'} onClick={() => setTab('transfer')}>Transfer</button>
        <button className={tab === 'skins' ? '' : 'secondary'} onClick={() => setTab('skins')}>Skins</button>
        
        {hasRole('admin') && (
          <button className={tab === 'admin' ? 'danger' : 'secondary'} onClick={() => setTab('admin')}>Admin</button>
        )}
        
        <div style={{ flex: 1 }}></div>
        <button className="secondary" onClick={() => { localStorage.clear(); setAuthed(false); }}>Logout</button>
      </nav>
      
      <div key={tab}>
        {tab === 'dashboard' && <Dashboard onLogout={() => setAuthed(false)} />}
        {tab === 'transfer' && <Transfer />}
        {tab === 'skins' && <SkinUploader />}
        {tab === 'admin' && <AdminPanel />}
      </div>
    </>
  );
}
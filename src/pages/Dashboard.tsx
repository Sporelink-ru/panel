import { useEffect, useState } from 'react';
import {
  fetchManifest, fetchBalance, credit,
  fetchReputation, updateReputation,
  NODE_IDS,
  type Manifest, type Reputation,
  testNodeAuth,
} from '../api';
import { loadAuth, clearAuth } from '../auth';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const auth = loadAuth();
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [rep, setRep] = useState<Reputation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authResult, setAuthResult] = useState<string | null>(null);

  async function refresh() {
    try {
      setManifest(await fetchManifest());
      const b: Record<string, number> = {};
      for (const node of NODE_IDS) {
        const r = await fetchBalance(node, auth!.selectedProfile.id);
        b[node] = r.balance;
      }
      setBalances(b);
      setRep(await fetchReputation(auth!.selectedProfile.id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function doCredit(node: string) {
    const amount = Number(prompt('Сколько начислить?', '100') ?? '0');
    if (!amount) return;
    await credit(node, auth!.selectedProfile.id, amount);
    await refresh();
  }

  async function adjustRep(delta: number) {
    await updateReputation(auth!.selectedProfile.id, { delta });
    await refresh();
  }

  async function testAuth() {
    setAuthResult('checking...');
    try {
      const res = await testNodeAuth('node-a', auth!.accessToken);
      if (res.error) {
        setAuthResult(`❌ ${res.error} (rep: ${res.reputation}, req: ${res.required})`);
      } else {
        setAuthResult(`✅ Allowed! Player: ${res.name}, Rep: ${res.reputation}`);
      }
    } catch (e) {
      setAuthResult(`Network error: ${(e as Error).message}`);
    }
  }

  if (!auth) return null;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>
          Dashboard — {auth.selectedProfile.name}
          {rep && (
            <>
              {' '}
              <span style={{
                background: rep.reputation >= 0 ? '#1abc5b' : '#e74c3c',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
              }}>
                rep {rep.reputation}
              </span>
              {rep.roles.map((r) => (
                <span key={r} style={{
                  background: '#3498db',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 12,
                  marginLeft: 6,
                }}>
                  {r}
                </span>
              ))}
            </>
          )}
        </h2>
        <div>
          <button onClick={() => { clearAuth(); onLogout(); }}>Logout</button>
        </div>
      </div>

      {error && <div style={{ color: 'crimson' }}>{error}</div>}

      <h3>Reputation & Policy</h3>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => adjustRep(+1)}>+1</button>{' '}
        <button onClick={() => adjustRep(-10)}>−10</button>{' '}
        <button onClick={testAuth} style={{ marginLeft: 12, fontWeight: 'bold' }}>
          Test Node Auth
        </button>
        {authResult && <div style={{ marginTop: 8, color: authResult.includes('✅') ? 'green' : 'red' }}>{authResult}</div>}
      </div>

      <h3>Nodes</h3>
      {manifest ? (
        <table border={1} cellPadding={6} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr><th>Server ID</th><th>Endpoint</th><th>Public key</th></tr>
          </thead>
          <tbody>
            {manifest.members.map((m) => (
              <tr key={m.server_id}>
                <td>{m.server_id}</td>
                <td>{m.endpoint}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {m.public_key.slice(0, 20)}…
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <div>loading…</div>}

      <h3>My balances</h3>
      <table border={1} cellPadding={6} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr><th>Node</th><th>Balance</th><th></th></tr>
        </thead>
        <tbody>
          {NODE_IDS.map((n) => (
            <tr key={n}>
              <td>{n}</td>
              <td>{balances[n] ?? '…'}</td>
              <td><button onClick={() => doCredit(n)}>+ credit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
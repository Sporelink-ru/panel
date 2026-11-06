import { useEffect, useState } from 'react';
import { fetchManifest, fetchBalance, credit, NODE_IDS, type Manifest } from '../api';
import { loadAuth, clearAuth } from '../auth';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const auth = loadAuth();
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setManifest(await fetchManifest());
      const b: Record<string, number> = {};
      for (const node of NODE_IDS) {
        const r = await fetchBalance(node, auth!.selectedProfile.id);
        b[node] = r.balance;
      }
      setBalances(b);
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

  if (!auth) return null;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard</h2>
        <div>
          <strong>{auth.selectedProfile.name}</strong>{' '}
          <button onClick={() => { clearAuth(); onLogout(); }}>Logout</button>
        </div>
      </div>

      {error && <div style={{ color: 'crimson' }}>{error}</div>}

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
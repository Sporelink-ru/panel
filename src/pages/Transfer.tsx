import { useState } from 'react';
import { transfer, NODE_IDS, fetchBalance } from '../api';
import { loadAuth } from '../auth';

export default function Transfer() {
  const auth = loadAuth();
  const [fromNode, setFromNode] = useState('node-a');
  const [toNode, setToNode] = useState('node-b');
  const [toPlayer, setToPlayer] = useState('a1b2000000000000000000000000c3d2');
  const [amount, setAmount] = useState(50);
  const [result, setResult] = useState<string>('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setResult('…');
    try {
      const r = await transfer(fromNode, toNode, auth!.selectedProfile.id, toPlayer, amount);
      const fromBal = await fetchBalance(fromNode, auth!.selectedProfile.id);
      const toBal = await fetchBalance(toNode, toPlayer);
      setResult(
        `Result: ${'status' in r ? r.status : r.error}\n` +
        `tx_id: ${r.tx_id ?? '—'}\n` +
        `balance[${fromNode}]: ${fromBal.balance}\n` +
        `balance[${toNode}]: ${toBal.balance}`,
      );
    } catch (err) {
      setResult((err as Error).message);
    }
  }

  if (!auth) return null;

  return (
    <form onSubmit={submit} style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2>Transfer</h2>
      <div>
        From node:{' '}
        <select value={fromNode} onChange={(e) => setFromNode(e.target.value)}>
          {NODE_IDS.map((n) => <option key={n}>{n}</option>)}
        </select>
        {' '}→ To node:{' '}
        <select value={toNode} onChange={(e) => setToNode(e.target.value)}>
          {NODE_IDS.map((n) => <option key={n}>{n}</option>)}
        </select>
      </div>
      <div style={{ marginTop: 8 }}>
        To player ID:{' '}
        <input value={toPlayer} onChange={(e) => setToPlayer(e.target.value)}
               style={{ width: 320 }} />
      </div>
      <div style={{ marginTop: 8 }}>
        Amount:{' '}
        <input type="number" value={amount}
               onChange={(e) => setAmount(Number(e.target.value))} />
      </div>
      <button type="submit" style={{ marginTop: 12 }}>Send</button>
      {result && <pre style={{ marginTop: 12, background: '#f4f4f4', padding: 8 }}>{result}</pre>}
    </form>
  );
}
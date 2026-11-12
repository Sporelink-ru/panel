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
    setResult('Транзакция...');
    try {
      const r = await transfer(fromNode, toNode, auth!.selectedProfile.id, toPlayer, amount);
      const fromBal = await fetchBalance(fromNode, auth!.selectedProfile.id);
      const toBal = await fetchBalance(toNode, toPlayer);
      setResult(
        `Статус: ${'status' in r ? r.status : r.error}\n` +
        `TX ID: ${r.tx_id ?? '—'}\n` +
        `Баланс [${fromNode}]: ${fromBal.balance}\n` +
        `Баланс [${toNode}]: ${toBal.balance}`,
      );
    } catch (err) {
      setResult((err as Error).message);
    }
  }

  if (!auth) return null;

  return (
    <div className="page-content animate-in">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Перевод средств</h2>
        
        <form onSubmit={submit} style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Откуда (Node):</label>
              <select value={fromNode} onChange={(e) => setFromNode(e.target.value)}>
                {NODE_IDS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Куда (Node):</label>
              <select value={toNode} onChange={(e) => setToNode(e.target.value)}>
                {NODE_IDS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">UUID получателя:</label>
            <input value={toPlayer} onChange={(e) => setToPlayer(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Сумма:</label>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>

          <button type="submit" style={{ width: '100%', marginTop: 8 }}>Отправить</button>
        </form>

        {result && (
          <pre style={{ marginTop: 20, background: 'var(--bg)', padding: 16, borderRadius: 8, color: 'var(--success)', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}
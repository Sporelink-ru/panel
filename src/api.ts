export type LoginResponse = {
  accessToken: string;
  clientToken: string;
  selectedProfile: { id: string; name: string };
};

export type Manifest = {
  manifest_version: string;
  federation_id: string;
  issued_at: string;
  members: { server_id: string; endpoint: string; public_key: string }[];
  signatures: { signer: string; sig: string }[];
};

export type Balance = { player_id: string; balance: number };
export type TransferResult = { status: string; tx_id: string } | { error: string; tx_id?: string };

const HUB = '/hub';
const NODES: Record<string, string> = {
  'node-a': '/node-a',
  'node-b': '/node-b',
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  const r = await fetch(`${HUB}/authserver/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error(`login failed: ${r.status}`);
  return r.json();
}

export async function fetchManifest(): Promise<Manifest> {
  const r = await fetch(`${HUB}/federation/manifest`);
  if (!r.ok) throw new Error(`manifest failed: ${r.status}`);
  return r.json();
}

export async function fetchBalance(node: string, playerId: string): Promise<Balance> {
  const base = NODES[node] ?? node;
  const r = await fetch(`${base}/balance/${encodeURIComponent(playerId)}`);
  if (!r.ok) throw new Error(`balance failed: ${r.status}`);
  return r.json();
}

export async function credit(node: string, playerId: string, amount: number): Promise<Balance> {
  const base = NODES[node] ?? node;
  const r = await fetch(`${base}/credit/${encodeURIComponent(playerId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  if (!r.ok) throw new Error(`credit failed: ${r.status}`);
  return r.json();
}

export async function transfer(
  fromNode: string,
  toNode: string,
  from: string,
  to: string,
  amount: number,
): Promise<TransferResult> {
  const fromBase = NODES[fromNode] ?? fromNode;
  const toBase = NODES[toNode] ?? toNode;
  // to_node должен быть реальным URL ноды, не прокси
  const realToNode =
    toNode === 'node-a' ? 'http://localhost:8080'
    : toNode === 'node-b' ? 'http://localhost:8081'
    : toNode;
  const r = await fetch(`${fromBase}/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to_node: realToNode, from, to, amount }),
  });
  return r.json();
}

export const NODE_IDS = Object.keys(NODES);

export type Reputation = {
  player_id: string;
  name: string;
  reputation: number;
  roles: string[];
};

export async function fetchReputation(playerId: string): Promise<Reputation> {
  const r = await fetch(`${HUB}/reputation/${encodeURIComponent(playerId)}`);
  if (!r.ok) throw new Error(`reputation failed: ${r.status}`);
  return r.json();
}

export async function fetchPlayers(): Promise<Reputation[]> {
  const r = await fetch(`${HUB}/players`);
  if (!r.ok) throw new Error(`players failed: ${r.status}`);
  return r.json();
}

export async function updateReputation(
  playerId: string,
  change: { delta?: number; set?: number },
): Promise<Reputation> {
  const r = await fetch(`${HUB}/reputation/${encodeURIComponent(playerId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(change),
  });
  if (!r.ok) throw new Error(`update failed: ${r.status}`);
  return r.json();
}

export async function testNodeAuth(node: string, jwt: string): Promise<any> {
  const base = NODES[node] ?? node;
  const r = await fetch(`${base}/auth/player`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jwt }),
  });
  return r.json();
}
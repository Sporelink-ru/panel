import type { LoginResponse } from './api';

const KEY = 'sporelink.auth';

export function saveAuth(a: LoginResponse) {
  localStorage.setItem(KEY, JSON.stringify(a));
}

export function loadAuth(): LoginResponse | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}
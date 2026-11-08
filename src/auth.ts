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

export function getRoles(): string[] {
  const auth = loadAuth();
  if (!auth) return [];
  try {
    const payload = JSON.parse(atob(auth.accessToken.split('.')[1]));
    return payload.roles || ["player"];
  } catch {
    return ["player"];
  }
}

export function hasRole(role: 'admin' | 'ceo'): boolean {
  const roles = getRoles();
  if (roles.includes('ceo')) return true;
  if (role === 'admin' && roles.includes('admin')) return true;
  return false;
}
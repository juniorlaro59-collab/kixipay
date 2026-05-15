import type { UserId, UserRole } from "@/types";

export interface AuthUser {
  userId: UserId;
  nome: string;
  role: UserRole;
  token: string;
}

let _user: AuthUser | null = null;
const listeners: Set<(u: AuthUser | null) => void> = new Set();

export function getAuthUser(): AuthUser | null {
  return _user;
}

export function setAuthUser(u: AuthUser | null) {
  _user = u;
  listeners.forEach((fn) => fn(u));
}

export function onAuthChange(fn: (u: AuthUser | null) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function logout() {
  setAuthUser(null);
  if (typeof window !== "undefined") {
    localStorage.removeItem("kx_auth_token");
    localStorage.removeItem("kx_user");
  }
}

export function persistAuth() {
  if (typeof window !== "undefined" && _user) {
    localStorage.setItem("kx_auth_token", _user.token);
    localStorage.setItem(
      "kx_user",
      JSON.stringify({ userId: _user.userId, nome: _user.nome, role: _user.role }),
    );
  }
}

export function restoreAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("kx_user");
    if (raw) {
      const u = JSON.parse(raw) as AuthUser;
      _user = u;
      return u;
    }
  } catch {}
  return null;
}

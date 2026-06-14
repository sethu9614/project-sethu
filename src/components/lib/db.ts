/**
 * File: src/lib/db.ts
 * Purpose: Lightweight typed localStorage-based database utilities for users, urls and clicks.
 */

export interface User {
  /** Unique user id */
  id: string;
  /** Display name */
  name: string;
  /** Email */
  email: string;
  /** SHA-256 hashed password (hex) */
  password: string;
  /** Created timestamp */
  createdAt: number;
}

export interface ShortUrl {
  /** Unique id */
  id: string;
  /** Owner user id */
  userId: string;
  /** Original URL */
  originalUrl: string;
  /** Short code */
  shortCode: string;
  /** Optional expiry timestamp */
  expiresAt?: number | null;
  /** Created timestamp */
  createdAt: number;
}

export interface Click {
  /** Unique click id */
  id: string;
  /** ShortUrl id */
  urlId: string;
  /** Timestamp */
  timestamp: number;
  /** Browser name */
  browser: string;
  /** OS name */
  os: string;
  /** Device type */
  device: string;
  /** Referrer */
  referrer: string;
}

/**
 * Utility: generate a compact id.
 */
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Utility: generate a random short code of given length.
 */
export function genCode(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/**
 * Utility: validate HTTP/HTTPS url string.
 */
export function validUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Utility: simple device info extractor.
 */
export function devInfo() {
  const u = navigator.userAgent;
  let b = 'Unknown';
  if (u.includes('Chrome')) b = 'Chrome';
  else if (u.includes('Firefox')) b = 'Firefox';
  else if (u.includes('Safari') && !u.includes('Chrome')) b = 'Safari';
  else if (u.includes('Edge')) b = 'Edge';
  let o = 'Unknown';
  if (u.includes('Windows')) o = 'Windows';
  else if (u.includes('Mac')) o = 'macOS';
  else if (u.includes('Linux')) o = 'Linux';
  else if (u.includes('Android')) o = 'Android';
  else if (u.includes('iPhone') || u.includes('iPad')) o = 'iOS';
  return { browser: b, os: o, device: /Mobi|Android/i.test(u) ? 'Mobile' : 'Desktop' };
}

/**
 * Returns hex SHA-256 hash of the input string.
 */
export async function hashPw(pw: string): Promise<string> {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Internal localStorage helpers
 */
function _get<T>(k: string): T | null {
  try {
    const raw = localStorage.getItem('ls_' + k);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function _set<T>(k: string, v: T) {
  localStorage.setItem('ls_' + k, JSON.stringify(v));
}

/**
 * Database API
 */
export const DB = {
  getUsers(): User[] {
    return _get<User[]>('us') || [];
  },
  saveUser(u: User) {
    const arr = this.getUsers();
    const i = arr.findIndex(x => x.id === u.id);
    if (i >= 0) arr[i] = u;
    else arr.push(u);
    _set('us', arr);
  },
  findUserByEmail(e: string): User | null {
    return this.getUsers().find(u => u.email === e) || null;
  },
  findUserById(id: string): User | null {
    return this.getUsers().find(u => u.id === id) || null;
  },

  getUrls(): ShortUrl[] {
    return _get<ShortUrl[]>('ur') || [];
  },
  saveUrl(u: ShortUrl) {
    const arr = this.getUrls();
    const i = arr.findIndex(x => x.id === u.id);
    if (i >= 0) arr[i] = u;
    else arr.push(u);
    _set('ur', arr);
  },
  deleteUrl(id: string) {
    _set('ur', this.getUrls().filter(u => u.id !== id));
    _set('cl', this.getClicks().filter(c => c.urlId !== id));
  },
  findUrlByShortCode(code: string): ShortUrl | null {
    return this.getUrls().find(u => u.shortCode === code) || null;
  },
  isShortCodeTaken(code: string): boolean {
    return this.getUrls().some(u => u.shortCode === code);
  },
  getUserUrls(userId: string): ShortUrl[] {
    return this.getUrls().filter(u => u.userId === userId);
  },

  getClicks(): Click[] {
    return _get<Click[]>('cl') || [];
  },
  addClick(c: Click) {
    const arr = this.getClicks();
    arr.push(c);
    _set('cl', arr);
  },
  getUrlClicks(urlId: string): Click[] {
    return this.getClicks().filter(c => c.urlId === urlId).sort((a, b) => b.timestamp - a.timestamp);
  },

  /**
   * getUrlClickCount - returns number of clicks for a given url id.
   */
  getUrlClickCount(urlId: string): number {
    return this.getClicks().filter(c => c.urlId === urlId).length;
  },

  /**
   * getUrlLastVisit - returns timestamp of the most recent click or null if none.
   */
  getUrlLastVisit(urlId: string): number | null {
    const c = this.getClicks().filter(x => x.urlId === urlId).sort((a, b) => b.timestamp - a.timestamp);
    return c.length ? c[0].timestamp : null;
  },

  // session helpers
  getSession(): string | null {
    return _get<string>('ss');
  },
  setSession(id: string) {
    _set('ss', id);
  },
  clearSession() {
    localStorage.removeItem('ls_ss');
  },
  getCurrentUser(): User | null {
    const s = this.getSession();
    return s ? this.findUserById(s) : null;
  }
};
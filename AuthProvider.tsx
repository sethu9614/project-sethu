/**
 * File: src/components/AuthProvider.tsx
 * Purpose: Authentication context and a small AuthPage UI (sign in / sign up).
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { DB, hashPw, genId } from '../lib/db';
import { useToast } from './ToastProvider';

/** User type re-used from DB module */
import type { User } from '../lib/db';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthCtx = createContext<AuthCtx>({
  user: null,
  loading: true,
  login: async () => {
    throw new Error('not implemented');
  },
  signup: async () => {
    throw new Error('not implemented');
  },
  logout: () => {}
});

/**
 * AuthProv - provides authentication state and actions.
 */
export function AuthProv({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    setUser(DB.getCurrentUser());
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const found = DB.findUserByEmail(email);
    if (!found) throw new Error('No account found with this email');
    const h = await hashPw(password);
    if (found.password !== h) throw new Error('Invalid password');
    DB.setSession(found.id);
    setUser(found);
    toast('Welcome back!', 'success');
    return found;
  }

  async function signup(name: string, email: string, password: string) {
    if (DB.findUserByEmail(email)) throw new Error('Email already registered');
    const h = await hashPw(password);
    const u: User = { id: genId(), name, email, password: h, createdAt: Date.now() };
    DB.saveUser(u);
    DB.setSession(u.id);
    setUser(u);
    toast('Account created!', 'success');
    return u;
  }

  function logout() {
    DB.clearSession();
    setUser(null);
    toast('Signed out', 'info');
  }

  return <AuthCtx.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthCtx.Provider>;
}

/**
 * useAuth - hook to access auth context
 */
export function useAuth() {
  return useContext(AuthCtx);
}

/**
 * AuthPage - simple sign in / sign up UI component
 */
export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const auth = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await auth.login(email, pw);
      } else {
        if (!name.trim()) throw new Error('Name is required');
        await auth.signup(name, email, pw);
      }
    } catch (ex: any) {
      setErr(ex.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 mt-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LinkSnap</h1>
          <p className="text-gray-500 mt-1">URL Shortener & Analytics</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex mb-5 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => { setMode('login'); setErr(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setErr(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-md border px-3 py-2" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input value={pw} onChange={e => setPw(e.target.value)} type="password" className="w-full rounded-md border px-3 py-2" />
            </div>

            {err && <div className="text-red-600 text-sm">{err}</div>}

            <div className="flex items-center justify-between">
              <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium shadow">
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create account'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">Built with ❤️ — local-only demo data stored in your browser</p>
      </div>
    </div>
  );
}
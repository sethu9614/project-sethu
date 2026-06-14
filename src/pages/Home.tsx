/**
 * File: src/pages/Home.tsx
 * Purpose: Main Home page combining hero, auth, redirect handler, shorten form and url list.
 */

import React from 'react';
import { AuthProv, AuthPage, useAuth } from '../components/AuthProvider';
import { ToastProv } from '../components/ToastProvider';
import { RedirectHandler } from '../components/RedirectHandler';
import { ShortenForm } from '../components/ShortenForm';
import { UrlList } from '../components/UrlList';
import { Link2, LogOut } from 'lucide-react';

/**
 * Dashboard - shown when user is signed in
 */
function Dashboard() {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg text-white">
            <Link2 />
          </div>
          <div>
            <div className="text-lg font-semibold">LinkSnap</div>
            <div className="text-xs text-gray-500">URL Shortener & Analytics</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-700">Hi, {auth.user!.name}</div>
          <button onClick={() => auth.logout()} className="text-sm text-red-600 flex items-center gap-2 bg-red-50 px-3 py-1 rounded">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 grid gap-6">
        <section className="bg-gradient-to-r from-white to-blue-50 rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">Create a short link</h2>
          <p className="text-sm text-gray-600 mb-4">Paste a long URL and optionally set a custom code or expiry.</p>
          <ShortenForm />
        </section>

        <section className="bg-white rounded-2xl p-6 shadow">
          <h3 className="text-lg font-medium mb-3">Your links</h3>
          <UrlList />
        </section>
      </main>
    </div>
  );
}

/**
 * Home - top-level page. Shows RedirectHandler overlay when ?r=code is present.
 */
export default function HomePage() {
  return (
    <ToastProv>
      <AuthProv>
        <RedirectHandler />
        <AppContent />
      </AuthProv>
    </ToastProv>
  );
}

/**
 * AppContent - chooses between AuthPage and Dashboard based on auth state.
 */
function AppContent() {
  const auth = useAuth();
  if (auth.loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return auth.user ? <Dashboard /> : <AuthPage />;
}
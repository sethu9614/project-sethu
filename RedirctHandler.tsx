/**
 * File: src/components/RedirectHandler.tsx
 * Purpose: Checks for ?r=shortCode and performs redirect overlay + click recording.
 */

import React, { useEffect, useState } from 'react';
import { DB, devInfo, genId } from '../lib/db';
import type { ShortUrl } from '../lib/db';

/**
 * RedirectHandler - when the URL has ?r=code, finds the ShortUrl, records click and redirects.
 */
export function RedirectHandler() {
  const [state, setState] = useState<'checking' | 'none' | 'notfound' | 'expired' | 'redirecting'>('checking');
  const [dest, setDest] = useState<ShortUrl | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('r');
    if (!code) {
      setState('none');
      return;
    }
    const u = DB.findUrlByShortCode(code);
    if (!u) {
      setState('notfound');
      return;
    }
    if (u.expiresAt && u.expiresAt < Date.now()) {
      setState('expired');
      return;
    }
    // record click
    const d = devInfo();
    DB.addClick({ id: genId(), urlId: u.id, timestamp: Date.now(), browser: d.browser, os: d.os, device: d.device, referrer: document.referrer || 'Direct' });
    setDest(u);
    setState('redirecting');
    setTimeout(() => {
      window.location.href = u.originalUrl;
    }, 1200);
  }, []);

  if (state === 'none') return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        {state === 'checking' && (
          <>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Checking link...</p>
          </>
        )}
        {state === 'redirecting' && dest && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Redirecting...</h3>
            <p className="text-gray-500 text-sm break-all mb-4">{dest.originalUrl}</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </>
        )}
        {state === 'notfound' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">🔗</div>
            <h3 className="text-lg font-semibold mb-2">Link Not Found</h3>
            <p className="text-gray-500 text-sm">This shortened URL doesn't exist.</p>
          </>
        )}
        {state === 'expired' && (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">⏰</div>
            <h3 className="text-lg font-semibold mb-2">Link Expired</h3>
            <p className="text-gray-500 text-sm">This link has expired.</p>
          </>
        )}
      </div>
    </div>
  );
}
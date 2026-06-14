/**
 * File: src/components/ShortenForm.tsx
 * Purpose: Shorten URL form - create a new ShortUrl record in the local DB.
 */

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useToast } from './ToastProvider';
import { DB, genCode, genId, validUrl, ShortUrl } from '../lib/db';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';

/**
 * ShortenForm - form UI allowing the user to create a short link.
 */
export function ShortenForm(): JSX.Element {
  const auth = useAuth();
  const toast = useToast();

  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [loading, setLoading] = useState(false);

  /**
   * handleSubmit - validate input and save new short url to DB.
   */
  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!auth.user) {
      toast('You must be signed in to create links', 'error');
      return;
    }
    if (!originalUrl.trim() || !validUrl(originalUrl.trim())) {
      toast('Please provide a valid http(s) URL', 'error');
      return;
    }
    setLoading(true);
    try {
      const code = customCode.trim() || genCode(6);
      if (DB.isShortCodeTaken(code)) {
        toast('Short code already taken, choose another or leave blank', 'error');
        setLoading(false);
        return;
      }
      const url: ShortUrl = {
        id: genId(),
        userId: auth.user.id,
        originalUrl: originalUrl.trim(),
        shortCode: code,
        expiresAt: expiresAt ? new Date(expiresAt).getTime() : null,
        createdAt: Date.now()
      };
      DB.saveUrl(url);
      // notify others (UrlList) to refresh
      window.dispatchEvent(new Event('links-changed'));
      setOriginalUrl('');
      setCustomCode('');
      setExpiresAt('');
      toast('Short link created!', 'success');
    } catch (err: any) {
      toast(err?.message || 'Failed to create link', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Long URL</label>
        <div className="flex gap-2">
          <input
            value={originalUrl}
            onChange={e => setOriginalUrl(e.target.value)}
            placeholder="https://example.com/very/long/path"
            className="flex-1 rounded-md border px-3 py-2"
          />
          <button
            type="button"
            onClick={() => {
              if (validUrl(originalUrl.trim())) window.open(originalUrl.trim(), '_blank');
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 border"
            title="Open destination"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom code (optional)</label>
          <input
            value={customCode}
            onChange={e => setCustomCode(e.target.value)}
            placeholder="my-link"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expires (optional)</label>
          <input
            type="date"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium shadow"
        >
          {loading ? 'Creating...' : <span className="inline-flex items-center gap-2"><LinkIcon size={14} /> Create</span>}
        </button>
      </div>
    </form>
  );
}
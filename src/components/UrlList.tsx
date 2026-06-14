/**
 * File: src/components/UrlList.tsx
 * Purpose: Display a user's shortened URLs with quick actions and basic stats.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { useToast } from './ToastProvider';
import { DB, ShortUrl } from '../lib/db';
import { ExternalLink, Copy, Trash2, BarChart2 } from 'lucide-react';

/**
 * UrlItemProps - props for single URL row component.
 */
interface UrlItemProps {
  url: ShortUrl;
  onDeleted: (id: string) => void;
}

/**
 * UrlItem - renders a single shortened URL row with actions.
 */
function UrlItem({ url, onDeleted }: UrlItemProps) {
  const toast = useToast();

  /**
   * getPublicLink - build the public short link used by RedirectHandler (?r=code).
   */
  function getPublicLink() {
    // preserve current pathname, use query param ?r=code
    return `${window.location.origin}${window.location.pathname}?r=${encodeURIComponent(url.shortCode)}`;
  }

  /**
   * handleCopy - copy public short link to clipboard.
   */
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getPublicLink());
      toast('Copied short link to clipboard', 'success');
    } catch {
      toast('Copy failed', 'error');
    }
  }

  /**
   * handleDelete - delete the URL after confirmation.
   */
  function handleDelete() {
    if (!confirm('Delete this short link? This action cannot be undone.')) return;
    DB.deleteUrl(url.id);
    window.dispatchEvent(new Event('links-changed'));
    onDeleted(url.id);
    toast('Link deleted', 'info');
  }

  const clicks = DB.getUrlClickCount(url.id);
  const last = DB.getUrlLastVisit(url.id);

  return (
    <div className="flex items-center justify-between gap-4 p-3 border rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-9 h-9 bg-blue-50 rounded-md text-blue-600">
            <BarChart2 size={16} />
          </div>
          <div className="truncate">
            <div className="font-medium text-sm truncate">{url.originalUrl}</div>
            <div className="text-xs text-gray-500 truncate">{getPublicLink()}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-600 text-center">
          <div className="font-semibold">{clicks}</div>
          <div className="text-gray-400">clicks</div>
        </div>

        <button
          title="Open destination"
          className="inline-flex items-center p-2 rounded-md hover:bg-gray-100"
          onClick={() => window.open(url.originalUrl, '_blank')}
        >
          <ExternalLink size={16} />
        </button>

        <button
          title="Copy short link"
          className="inline-flex items-center p-2 rounded-md hover:bg-gray-100"
          onClick={handleCopy}
        >
          <Copy size={16} />
        </button>

        <button
          title="Delete"
          className="inline-flex items-center p-2 rounded-md text-red-600 hover:bg-red-50"
          onClick={handleDelete}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

/**
 * UrlList - lists the current user's URLs and listens for changes.
 */
export function UrlList(): JSX.Element {
  const auth = useAuth();
  const [urls, setUrls] = useState<ShortUrl[]>([]);

  /**
   * load - fetch user's URLs from DB.
   */
  function load() {
    if (!auth.user) {
      setUrls([]);
      return;
    }
    setUrls(DB.getUserUrls(auth.user.id).sort((a, b) => b.createdAt - a.createdAt));
  }

  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener('links-changed', h);
    return () => window.removeEventListener('links-changed', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.id]);

  if (!auth.user) return <div className="text-sm text-gray-500">Sign in to see your links</div>;

  if (urls.length === 0) {
    return <div className="text-sm text-gray-500">No links yet — create your first short link above.</div>;
  }

  return (
    <div className="space-y-3">
      {urls.map(u => (
        <UrlItem key={u.id} url={u} onDeleted={() => setUrls(prev => prev.filter(x => x.id !== u.id))} />
      ))}
    </div>
  );
}
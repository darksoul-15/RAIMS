import { useState, useEffect, useCallback } from 'react';
import * as notificationService from '../../services/notificationService';

const TYPE_ICONS = {
  ApprovalRequest: '📋',
  CheckoutConfirmation: '✅',
  ReturnReminder: '⏰',
  OverdueAlert: '🚨',
  InventoryUpdate: '📦'
};

const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '—');

const PAGE_SIZE = 10;

const NotificationsPage = () => {
  const [data, setData] = useState({ notifications: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [readFilter, setReadFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [readFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await notificationService.getNotifications({
        page,
        limit: PAGE_SIZE,
        readFilter
      });
      setData(result);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, readFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    load();
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    load();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="heading-page">Notifications</h1>
        <button
          onClick={handleMarkAllRead}
          className="rounded border border-border px-3 py-1.5 text-sm font-medium hover:bg-cream-100"
        >
          Mark all as read
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'unread', 'read'].map((val) => (
          <button
            key={val}
            onClick={() => setReadFilter(val)}
            className={`rounded px-3 py-1.5 text-sm font-medium ${
              readFilter === val
                ? 'bg-ink-900 text-white'
                : 'border border-border hover:bg-cream-100'
            }`}
          >
            {val === '' ? 'All' : val === 'unread' ? 'Unread' : 'Read'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-ink-400">Loading notifications…</p>
      ) : !data.notifications.length ? (
        <p className="text-ink-400 py-4">No notifications.</p>
      ) : (
        <>
          <div className="space-y-2">
            {data.notifications.map((n) => (
              <div
                key={n._id}
                className={`flex gap-3 rounded-lg border p-4 ${
                  n.read
                    ? 'border-border bg-white'
                    : 'border-primary-200 bg-primary-50/40'
                }`}
              >
                <span className="text-lg shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.read ? 'text-ink-600' : 'text-ink-900 font-medium'}`}>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-ink-400">{fmtDate(n.createdAt)}</span>
                    <span className="rounded bg-cream-100 px-1.5 py-0.5 text-[10px] text-ink-400 uppercase tracking-wide">
                      {n.type.replace(/([a-z])([A-Z])/g, '$1 $2')}
                    </span>
                  </div>
                </div>
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    className="shrink-0 self-start rounded border border-border px-2.5 py-1 text-xs font-medium hover:bg-cream-100"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-ink-600">
            <span>{data.total} notification{data.total !== 1 ? 's' : ''}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border border-border px-3 py-1 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-2 py-1">Page {data.page} / {data.pages}</span>
              <button
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border border-border px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPage;

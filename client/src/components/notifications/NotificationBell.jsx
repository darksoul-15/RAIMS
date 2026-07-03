import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as notificationService from '../../services/notificationService';

/* SVG icon paths per type (no emojis) */
const TYPE_ICONS = {
  ApprovalRequest:     'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  CheckoutConfirmation:'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  ReturnReminder:      'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  OverdueAlert:        'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  InventoryUpdate:     'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10',
};
const TYPE_COLORS = {
  ApprovalRequest:     'text-blue-500',
  CheckoutConfirmation:'text-emerald-500',
  ReturnReminder:      'text-amber-500',
  OverdueAlert:        'text-red-500',
  InventoryUpdate:     'text-purple-500',
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationBell = () => {
  const [open, setOpen]     = useState(false);
  const [count, setCount]   = useState(0);
  const [latest, setLatest] = useState([]);
  const ref                 = useRef(null);

  const load = async () => {
    try {
      const c = await notificationService.getUnreadCount();
      setCount(c);
      if (c > 0) {
        const items = await notificationService.getLatestUnread(5);
        setLatest(items);
      } else {
        setLatest([]);
      }
    } catch {}
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    await notificationService.markAsRead(id);
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-8 h-8 flex items-center justify-center rounded-md text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 card-md shadow-card-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2">
            <span className="text-xs font-bold tracking-widest uppercase text-ink-500">Notifications</span>
            {count > 0 && <span className="badge badge-borrowed">{count} unread</span>}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {latest.length === 0 ? (
              <div className="py-8 text-center">
                <svg className="w-8 h-8 text-ink-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-ink-400 font-medium">All caught up!</p>
              </div>
            ) : (
              latest.map((n) => (
                <div key={n._id} className="flex gap-3 px-4 py-3 hover:bg-cream-50 transition-colors">
                  <div className="w-7 h-7 rounded-md bg-cream-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className={`w-3.5 h-3.5 ${TYPE_COLORS[n.type] || 'text-ink-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={TYPE_ICONS[n.type] || TYPE_ICONS.InventoryUpdate} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-ink-700 line-clamp-2 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-ink-400 mt-0.5 block">{timeAgo(n.createdAt)}</span>
                  </div>
                  <button
                    onClick={(e) => handleMarkRead(n._id, e)}
                    className="shrink-0 text-[10px] font-semibold text-amber-600 hover:text-amber-800 self-start mt-0.5 cursor-pointer"
                  >
                    Mark read
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5 bg-surface-2 text-center">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-ink-700 hover:text-amber-700 transition-colors"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

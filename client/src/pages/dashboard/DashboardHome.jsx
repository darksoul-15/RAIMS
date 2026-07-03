import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import * as assetService from '../../services/assetService';
import * as checkoutService from '../../services/checkoutService';
import * as requestService from '../../services/requestService';
import * as notificationService from '../../services/notificationService';

const StatCard = ({ label, value, sub, accent, icon }) => (
  <div className="card p-5 flex items-start justify-between gap-4">
    <div>
      <p className="text-xs font-bold tracking-widest uppercase text-ink-400 mb-2">{label}</p>
      <p className={`text-3xl font-extrabold tracking-tight ${accent ? 'text-amber-600' : 'text-ink-900'}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-ink-400 mt-1">{sub}</p>}
    </div>
    <div className="w-10 h-10 rounded-lg bg-cream-100 flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
    </div>
  </div>
);

const QuickAction = ({ to, icon, label, description }) => (
  <Link to={to} className="card p-4 flex items-center gap-4 hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
    <div className="w-10 h-10 rounded-lg bg-ink-900 flex items-center justify-center shrink-0 group-hover:bg-amber-600 transition-colors duration-200">
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
    </div>
    <div>
      <p className="text-sm font-semibold text-ink-900">{label}</p>
      <p className="text-xs text-ink-400 mt-0.5">{description}</p>
    </div>
    <svg className="w-4 h-4 text-ink-300 ml-auto group-hover:text-ink-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </Link>
);

const GREETINGS = ['Good morning', 'Good afternoon', 'Good evening'];
const getGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? GREETINGS[0] : h < 18 ? GREETINGS[1] : GREETINGS[2];
};

const DashboardHome = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState({ assets: null, borrowings: null, requests: null, notifications: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [assetsRes, checkRes, notifCount] = await Promise.allSettled([
          assetService.getAssets({ limit: 1 }),
          checkoutService.getActiveCheckouts({ limit: 1 }),
          notificationService.getUnreadCount(),
        ]);
        setStats({
          assets:        assetsRes.status === 'fulfilled'  ? assetsRes.value.total   : '—',
          borrowings:    checkRes.status === 'fulfilled'   ? checkRes.value.total    : '—',
          notifications: notifCount.status === 'fulfilled' ? notifCount.value        : '—',
        });
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const QUICK_ACTIONS = [
    { to: '/assets',      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10',   label: 'Browse Assets',      description: 'View the full asset registry' },
    { to: '/requests/new',icon: 'M12 4v16m8-8H4',                                             label: 'New Request',        description: 'Submit a borrow request' },
    { to: '/search',      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',              label: 'Search Assets',      description: 'Find assets by keyword' },
    { to: '/checkout',    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',        label: 'My Borrowings',      description: 'View active checkouts' },
    ...(hasRole('Administrator', 'ResourceManager', 'ProjectLead') ? [
      { to: '/approvals', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',            label: 'Approvals Queue',    description: 'Review pending requests' },
    ] : []),
    ...(hasRole('Administrator', 'ResourceManager') ? [
      { to: '/reports',   icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'Analytics',  description: 'Reports & utilisation' },
    ] : []),
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="pt-2">
        <p className="text-xs font-bold tracking-widest uppercase text-amber-600 mb-1">
          {getGreeting()}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">
          {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-ink-400 mt-1">
          {user?.role} · Borrower ID <span className="font-mono">{user?.borrowerId}</span>
        </p>
      </div>

      {/* ── Stats row ────────────────────────────────────── */}
      <div>
        <p className="heading-section mb-3">Overview</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total Assets"
            value={loading ? '…' : stats.assets}
            sub="In the registry"
            icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
          />
          <StatCard
            label="Active Borrowings"
            value={loading ? '…' : stats.borrowings}
            sub="Currently checked out"
            accent
            icon="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
          <StatCard
            label="Unread Notifications"
            value={loading ? '…' : stats.notifications}
            sub="Requiring attention"
            icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────────── */}
      <div>
        <p className="heading-section mb-3">Quick Actions</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK_ACTIONS.map((a) => <QuickAction key={a.to} {...a} />)}
        </div>
      </div>

      {/* ── Role info banner ──────────────────────────────── */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
        <svg className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-800">Your access level: {user?.role}</p>
          <p className="text-xs text-amber-700 mt-0.5">
            {user?.role === 'Administrator'   && 'Full system access — manage assets, users, approvals, reports and procurement.'}
            {user?.role === 'ResourceManager' && 'Manage approvals, checkout verification, inventory updates, and reports.'}
            {user?.role === 'ProjectLead'     && 'Approve team requests, add and edit assets, and monitor overdue borrowings.'}
            {user?.role === 'Researcher'      && 'Browse assets, submit borrow requests, and view your own borrowing history.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

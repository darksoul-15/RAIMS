import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../notifications/NotificationBell';

const ROLE_LABELS = {
  Administrator:   'Admin',
  ProjectLead:     'Project Lead',
  Researcher:      'Researcher',
};

const Topbar = () => {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="bg-surface border-b border-border px-6 h-14 flex items-center justify-between shrink-0 z-30">
      {/* Brand */}
      <Link to="/dashboard" className="flex items-center gap-2 select-none">
        <div className="w-6 h-6 bg-ink-900 rounded-sm flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
        </div>
        <span className="font-extrabold text-sm tracking-tight text-ink-900">RAIMS</span>
      </Link>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        {/* User chip */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-ink-800 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-white">{initials}</span>
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-semibold text-ink-900 truncate max-w-[120px]">{user?.name}</p>
            <p className="text-[10px] text-ink-400 font-medium">{ROLE_LABELS[user?.role] || user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="ml-1 btn-ghost px-2 py-1 text-xs text-ink-500 hover:text-danger"
            aria-label="Logout"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

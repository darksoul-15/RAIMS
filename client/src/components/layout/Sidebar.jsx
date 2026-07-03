import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/* SVG icon paths */
const ICONS = {
  dashboard:     'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  assets:        'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10',
  search:        'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  requests:      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  approvals:     'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  borrowings:    'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  locations:     'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  procurement:   'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  notifications: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  reports:       'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  users:         'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
};

const Icon = ({ path, className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    {path.includes('M15 11') ? (
      path.split('M15 11').map((p, i) =>
        <path key={i} strokeLinecap="round" strokeLinejoin="round" d={i === 0 ? p : 'M15 11' + p} />
      )
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    )}
  </svg>
);

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer select-none
       ${isActive
         ? 'bg-ink-900 text-white shadow-sm'
         : 'text-ink-600 hover:bg-cream-100 hover:text-ink-900'}`
    }
  >
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
    </svg>
    <span>{label}</span>
  </NavLink>
);

const SectionLabel = ({ children }) => (
  <p className="px-3 pt-5 pb-1 text-[10px] font-bold tracking-widest uppercase text-ink-400 select-none">{children}</p>
);

const Sidebar = () => {
  const { hasRole } = useAuth();

  return (
    <aside className="w-56 shrink-0 bg-surface border-r border-border flex flex-col min-h-0 overflow-y-auto">
      <nav className="p-3 flex-1 space-y-0.5">
        <SectionLabel>Overview</SectionLabel>
        <NavItem to="/dashboard"     icon={ICONS.dashboard}     label="Dashboard" />
        <NavItem to="/notifications" icon={ICONS.notifications} label="Notifications" />

        <SectionLabel>Assets</SectionLabel>
        <NavItem to="/assets"    icon={ICONS.assets}   label="Asset Registry" />
        <NavItem to="/search"    icon={ICONS.search}   label="Search" />
        <NavItem to="/locations" icon={ICONS.locations} label="Locations" />

        <SectionLabel>Requests</SectionLabel>
        <NavItem to="/requests"  icon={ICONS.requests}  label="My Requests" />
        {hasRole('Administrator', 'ResourceManager', 'ProjectLead') && (
          <NavItem to="/approvals" icon={ICONS.approvals} label="Approvals" />
        )}

        <SectionLabel>Borrowings</SectionLabel>
        <NavItem to="/checkout" icon={ICONS.borrowings} label="Active Borrowings" />

        <SectionLabel>Operations</SectionLabel>
        <NavItem to="/procurement" icon={ICONS.procurement} label="Procurement" />
        {hasRole('Administrator', 'ResourceManager') && (
          <NavItem to="/reports" icon={ICONS.reports} label="Analytics" />
        )}
        {hasRole('Administrator') && (
          <NavItem to="/users" icon={ICONS.users} label="Users" />
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <p className="text-[10px] text-ink-400 text-center font-medium">Ré Organisation</p>
      </div>
    </aside>
  );
};

export default Sidebar;

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

// ── SVG Icon Library ──────────────────────────────────────────────────────────
const Icon = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  transactions: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4" />
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
  budgets: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  reports: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <rect x="2" y="20" width="20" height="1" rx=".5" fill="currentColor" stroke="none" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  chevronLeft: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  chevronRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  logo: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="none">
      <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm.75 16.5v1.25a.75.75 0 0 1-1.5 0V17.5A3.75 3.75 0 0 1 8.5 14h.75a3 3 0 0 0 3 3 3 3 0 0 0 0-6 4.5 4.5 0 0 1 0-9V.75a.75.75 0 0 1 1.5 0V2a3.75 3.75 0 0 1 3.25 3.75h-.75A3 3 0 0 0 12 3a3 3 0 0 0 0 6 4.5 4.5 0 0 1 0 9v-.5z" />
    </svg>
  ),
};

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: Icon.dashboard },
  { to: '/transactions', label: 'Transactions', icon: Icon.transactions },
  { to: '/budgets', label: 'Budgets', icon: Icon.budgets },
  { to: '/reports', label: 'Reports', icon: Icon.reports },
  { to: '/settings', label: 'Settings', icon: Icon.settings },
];

// ── Sidebar Component ─────────────────────────────────────────────────────────
const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    onMobileClose?.();
    await logout();
    navigate('/login');
  };

  const sidebarW = collapsed ? '68px' : '240px';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 998,
          }}
        />
      )}

      <aside
        style={{
          width: sidebarW,
          minHeight: '100vh',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 999,
          transition: 'width var(--transition-base), transform var(--transition-base)',
          overflow: 'hidden',
          boxShadow: mobileOpen ? 'var(--shadow-2xl)' : 'none',
        }}
        className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}
      >
        {/* ── Logo ── */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            {Icon.logo}
          </div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <span className="sidebar-brand">FinTracker</span>
              <span className="sidebar-brand-badge">PRO</span>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto', overflowX: 'hidden' }}>
          <div style={{ padding: !collapsed ? '0 0.5rem' : '0 0.25rem' }}>
            {!collapsed && (
              <p className="sidebar-section-label">NAVIGATION</p>
            )}
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onMobileClose}
                  title={collapsed ? link.label : ''}
                  className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                  style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                >
                  <span className="sidebar-link-icon">{link.icon}</span>
                  {!collapsed && <span className="sidebar-link-label">{link.label}</span>}
                  {!collapsed && isActive && <span className="sidebar-link-dot" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ── User Panel ── */}
        <div className="sidebar-footer">
          {!collapsed && (
            <div className="sidebar-user">
              <div className="sidebar-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.name}</span>
                <span className="sidebar-user-email">{user?.email}</span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : ''}
            className="sidebar-logout"
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <span style={{ flexShrink: 0, display: 'flex', color: 'var(--danger)' }}>{Icon.logout}</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* ── Collapse Toggle (desktop) ── */}
        <button
          onClick={onToggle}
          className="sidebar-collapse-btn desktop-only"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? Icon.chevronRight : Icon.chevronLeft}
        </button>
      </aside>
    </>
  );
};

// ── Mobile Top Bar ─────────────────────────────────────────────────────────────
export const MobileTopBar = ({ onMenuOpen, title }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="mobile-topbar"
      style={{
        background: scrolled ? 'rgba(15,23,42,0.97)' : 'rgba(15,23,42,0.8)',
        boxShadow: scrolled ? 'var(--shadow-lg)' : 'none',
      }}
    >
      <button onClick={onMenuOpen} className="mobile-menu-trigger">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className="mobile-topbar-logo">
        <div style={{
          width: '28px', height: '28px',
          background: 'var(--gradient-primary)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon.logo}
        </div>
        <span style={{ fontWeight: '700', fontSize: '1rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          FinTracker
        </span>
      </div>
      <div style={{ width: '40px' }} />
    </header>
  );
};

export default Sidebar;

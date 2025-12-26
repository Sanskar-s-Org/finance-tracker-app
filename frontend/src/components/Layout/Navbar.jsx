import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/transactions', label: 'Transactions', icon: '💸' },
    { to: '/budgets', label: 'Budgets', icon: '🎯' },
    { to: '/reports', label: 'Reports', icon: '📄' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: scrolled ? 'var(--bg-secondary)' : 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${scrolled ? 'var(--border-hover)' : 'var(--border)'}`,
          padding: '1rem 0',
          zIndex: 1000,
          boxShadow: scrolled ? 'var(--shadow-lg)' : 'var(--shadow-md)',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--spacing-xl)',
            }}
          >
            {/* Logo */}
            <Link
              to="/dashboard"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--gradient-primary)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: 'var(--shadow-glow)',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05) rotate(5deg)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}
              >
                💰
              </div>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'none',
                }}
                className="logo-text"
              >
                Finance Tracker
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div style={{ display: 'none', gap: '0.5rem', flex: 1, justifyContent: 'center' }} className="desktop-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="btn btn-outline"
                  style={{
                    padding: '0.625rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    background: location.pathname === link.to ? 'var(--bg-glass-hover)' : 'var(--bg-glass)',
                    borderColor: location.pathname === link.to ? 'var(--primary)' : 'var(--border)',
                    color: location.pathname === link.to ? 'var(--primary)' : 'var(--text-primary)',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{link.icon}</span>
                  <span className="nav-label">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* User Section - Desktop */}
            <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="desktop-user">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 1rem',
                  background: 'var(--bg-glass)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'var(--gradient-primary)',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: 'white',
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || '👤'}
                </div>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9375rem' }} className="user-name">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ padding: '0.625rem 1.25rem', fontWeight: '600', fontSize: '0.875rem' }}
              >
                <span>🚪</span>
                <span className="logout-label">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                padding: '0.75rem',
                background: 'var(--bg-glass)',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                color: 'var(--text-primary)',
              }}
              className="mobile-menu-btn"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            zIndex: 999,
            padding: 'var(--spacing-xl)',
            animation: 'fadeInUp 0.3s ease',
            overflowY: 'auto',
          }}
          className="mobile-menu"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {/* User Info Mobile */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                padding: 'var(--spacing-lg)',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--gradient-primary)',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'white',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || '👤'}
              </div>
              <div>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
            </div>

            {/* Navigation Links Mobile */}
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-lg)',
                  background: location.pathname === link.to ? 'var(--bg-glass-hover)' : 'var(--bg-glass)',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${location.pathname === link.to ? 'var(--primary)' : 'var(--border)'}`,
                  color: location.pathname === link.to ? 'var(--primary)' : 'var(--text-primary)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Logout Button Mobile */}
            <button
              onClick={handleLogout}
              className="btn btn-danger"
              style={{
                width: '100%',
                padding: 'var(--spacing-lg)',
                marginTop: 'var(--spacing-lg)',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--spacing-sm)',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          /* Desktop styles */
          @media (min-width: 1024px) {
            .logo-text {
              display: block !important;
            }
            .desktop-nav {
              display: flex !important;
            }
            .desktop-user {
              display: flex !important;
            }
          }

          @media (min-width: 768px) {
            .nav-label {
              display: inline;
            }
            .logout-label {
              display: inline;
            }
            .user-name {
              display: inline;
            }
          }

          /* Mobile styles */
          @media (max-width: 1023px) {
            .mobile-menu-btn {
              display: flex !important;
            }
          }

          @media (max-width: 767px) {
            .nav-label {
              display: none;
            }
            .logout-label {
              display: none;
            }
            .user-name {
              display: none;
            }
          }
        `}
      </style>
    </>
  );
};

export default Navbar;

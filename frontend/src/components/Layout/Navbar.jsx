import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowUserMenu(false);
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
          background: scrolled ? 'rgba(30, 41, 59, 0.95)' : 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${scrolled ? 'var(--border-hover)' : 'var(--border)'}`,
          padding: '0.875rem 0',
          zIndex: 1000,
          boxShadow: scrolled ? 'var(--shadow-xl)' : 'var(--shadow-md)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
            {/* Enhanced Logo */}
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
                  width: '44px',
                  height: '44px',
                  background: 'var(--gradient-primary)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.375rem',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                className="logo-icon"
              >
                💰
              </div>
              <div style={{ display: 'none' }} className="logo-text">
                <div
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '800',
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2,
                  }}
                >
                  FinTracker
                </div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.1em' }}>
                  PRO
                </div>
              </div>
            </Link>

            {/* Desktop Navigation - Enhanced */}
            <div style={{ display: 'none', gap: '0.375rem', flex: 1, justifyContent: 'center', maxWidth: '600px' }} className="desktop-nav">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{
                      position: 'relative',
                      padding: '0.625rem 1.125rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      borderRadius: 'var(--radius-lg)',
                      color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                      border: 'none',
                    }}
                    className="nav-link"
                  >
                    <span style={{ fontSize: '1.125rem' }}>{link.icon}</span>
                    <span className="nav-label">{link.label}</span>
                    {isActive && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '60%',
                          height: '2px',
                          background: 'var(--gradient-primary)',
                          borderRadius: '2px 2px 0 0',
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User Section - Enhanced */}
            <div style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }} className="desktop-user">
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.5rem 0.875rem',
                    background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  className="user-btn"
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      background: 'var(--gradient-primary)',
                      borderRadius: 'var(--radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: 'white',
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || '👤'}
                  </div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.875rem' }} className="user-name">
                    {user?.name}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.5rem)',
                      right: 0,
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow-xl)',
                      minWidth: '220px',
                      overflow: 'hidden',
                      animation: 'scaleIn 0.2s ease',
                    }}
                  >
                    <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem' }}>{user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{user?.email}</div>
                    </div>
                    <Link
                      to="/settings"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        padding: '0.75rem 1rem',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background 0.2s ease',
                      }}
                      className="dropdown-item"
                    >
                      <span>⚙️</span>
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        padding: '0.75rem 1rem',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        borderTop: '1px solid var(--border)',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'background 0.2s ease',
                      }}
                      className="dropdown-item logout-btn"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button - Enhanced */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                padding: '0.625rem',
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

      {/* Enhanced Mobile Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(20px)',
            zIndex: 999,
            padding: 'var(--spacing-xl)',
            animation: 'fadeInUp 0.3s ease',
            overflowY: 'auto',
          }}
          className="mobile-menu"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', maxWidth: '500px', margin: '0 auto' }}>
            {/* User Info Mobile - Enhanced */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                padding: 'var(--spacing-lg)',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                marginBottom: 'var(--spacing-sm)',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  background: 'var(--gradient-primary)',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'white',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || '👤'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.125rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{user?.email}</div>
              </div>
            </div>

            {/* Navigation Links Mobile */}
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    padding: 'var(--spacing-lg)',
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-glass)',
                    borderRadius: 'var(--radius-xl)',
                    border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                    color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '1.0625rem',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{link.icon}</span>
                  <span>{link.label}</span>
                  {isActive && <span style={{ marginLeft: 'auto', fontSize: '0.875rem' }}>✓</span>}
                </Link>
              );
            })}

            {/* Logout Button Mobile */}
            <button
              onClick={handleLogout}
              className="btn btn-danger"
              style={{
                width: '100%',
                padding: 'var(--spacing-lg)',
                marginTop: 'var(--spacing-md)',
                fontSize: '1.0625rem',
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
          /* Logo animation */
          .logo-icon:hover {
            transform: scale(1.08) rotate(5deg);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
          }

          /* Nav link hover */
          .nav-link:hover {
            background: rgba(99, 102, 241, 0.1) !important;
            color: var(--primary) !important;
          }

          /* User button hover */
          .user-btn:hover {
            background: var(--bg-glass-hover) !important;
            border-color: var(--primary) !important;
          }

          /* Dropdown item hover */
          .dropdown-item:hover {
            background: var(--bg-glass) !important;
          }

          .logout-btn:hover {
            background: rgba(239, 68, 68, 0.1) !important;
          }

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

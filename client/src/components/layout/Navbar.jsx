import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: '🏠 Home' },
    { to: '/dogs', label: '🐕 My Dogs' },
    { to: '/courses', label: '📚 Courses' },
    { to: '/scenarios', label: '🎯 Training' },
    { to: '/leaderboard', label: '🏆 Leaderboard' },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/dashboard" style={styles.logo}>
          🐾 Positive Paws
        </Link>

        <div style={styles.links} className="nav-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                ...styles.link,
                ...(isActive(link.to) ? styles.activeLink : {}),
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={styles.userMenu}>
          {user?.role === 'admin' && (
            <Link to="/admin" style={styles.adminBadge}>⚙️ Admin</Link>
          )}
          <div style={styles.avatarMenu} onClick={() => setMenuOpen(!menuOpen)}>
            <div style={styles.avatar}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} style={styles.avatarImg} />
              ) : (
                <span style={styles.avatarEmoji}>
                  {user?.name?.[0]?.toUpperCase() || '🐾'}
                </span>
              )}
            </div>
            <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
            <span style={{ color: 'white', opacity: 0.7 }}>▾</span>
          </div>

          {menuOpen && (
            <div style={styles.dropdown}>
              <Link to="/profile" style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                👤 My Profile
              </Link>
              <Link to="/dogs" style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                🐕 My Dogs
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                  ⚙️ Admin Panel
                </Link>
              )}
              <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #eee' }} />
              <button style={styles.dropdownLogout} onClick={handleLogout}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div style={styles.mobileNav}>
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              ...styles.mobileLink,
              ...(isActive(link.to) ? styles.mobileLinkActive : {}),
            }}
          >
            <span style={{ fontSize: '20px' }}>{link.label.split(' ')[0]}</span>
            <span style={{ fontSize: '10px' }}>{link.label.split(' ').slice(1).join(' ')}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: 'linear-gradient(135deg, #FF6B35 0%, #E85A22 100%)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(255,107,53,0.3)',
  },
  inner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 24,
  },
  logo: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: 22,
    color: 'white',
    textDecoration: 'none',
    flexShrink: 0,
    letterSpacing: '0.03em',
  },
  links: {
    display: 'flex',
    gap: 4,
    flex: 1,
    alignItems: 'center',
  },
  link: {
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: 50,
    fontSize: 14,
    fontWeight: 700,
    transition: 'all 0.2s',
  },
  activeLink: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
  },
  userMenu: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  adminBadge: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    padding: '4px 12px',
    borderRadius: 50,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'none',
  },
  avatarMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 50,
    transition: 'background 0.2s',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarEmoji: { fontSize: 18, color: 'white', fontWeight: 700 },
  userName: { color: 'white', fontWeight: 700, fontSize: 14 },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 8,
    background: 'white',
    borderRadius: 12,
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    minWidth: 180,
    overflow: 'hidden',
    zIndex: 200,
    padding: '8px 0',
  },
  dropdownItem: {
    display: 'block',
    padding: '10px 16px',
    color: '#333',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    transition: 'background 0.1s',
  },
  dropdownLogout: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    color: '#EF4444',
    fontSize: 14,
    fontWeight: 700,
    background: 'none',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
  },
  mobileNav: {
    display: 'none',
  },
  mobileLink: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 0',
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 700,
    gap: 2,
  },
  mobileLinkActive: {
    color: 'white',
  },
};

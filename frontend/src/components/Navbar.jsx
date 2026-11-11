import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="navbar-brand">
          <span className="brand-icon">🏦</span>
          <span className="brand-name">BalanceVault</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          ☰
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              {isAdmin ? (
                <>
                  <Link to="/admin" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <Link to="/admin/users" onClick={() => setMenuOpen(false)}>Users</Link>
                  <Link to="/admin/onboarding" onClick={() => setMenuOpen(false)}>Onboarding</Link>
                  <Link to="/admin/accounts" onClick={() => setMenuOpen(false)}>Accounts</Link>
                  <Link to="/admin/transactions" onClick={() => setMenuOpen(false)}>Transactions</Link>
                  <Link to="/admin/audit-logs" onClick={() => setMenuOpen(false)}>Audit Logs</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <Link to="/transactions" onClick={() => setMenuOpen(false)}>Transactions</Link>
                  <Link to="/transfer" onClick={() => setMenuOpen(false)}>Transfer</Link>
                </>
              )}
              <span className="user-name">{user.firstName} {user.lastName}</span>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary-nav">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

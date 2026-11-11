import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@balancevault.com', password: 'Admin@123456', color: 'var(--indigo-light)' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const fillDemo = (account) => {
    setForm({ email: account.email, password: account.password });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--navy) 0%, #1e1b4b 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Demo credentials banner */}
        <div style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.25rem',
        }}>
          <p style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.6rem' }}>
            🔑 Demo Credentials
          </p>
          {DEMO_ACCOUNTS.map((acc) => (
            <div key={acc.email} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius)',
              padding: '0.5rem 0.75rem', marginBottom: '0.4rem',
            }}>
              <div>
                <span style={{
                  display: 'inline-block', background: acc.color, color: 'white',
                  padding: '1px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, marginRight: '0.5rem',
                }}>
                  {acc.label}
                </span>
                <span style={{ color: 'white', fontSize: '0.82rem' }}>{acc.email}</span>
                <span style={{ color: 'var(--grey-400)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>/ {acc.password}</span>
              </div>
              <button
                type="button"
                onClick={() => fillDemo(acc)}
                style={{
                  background: 'rgba(99,102,241,0.3)', border: '1px solid rgba(99,102,241,0.5)',
                  color: 'white', borderRadius: 'var(--radius)', padding: '3px 10px',
                  fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Use →
              </button>
            </div>
          ))}
          <p style={{ color: 'var(--grey-400)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Click "Use →" to auto-fill credentials, then Sign In.
          </p>
        </div>

        {/* Login card */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          padding: '2.5rem', boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏦</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)' }}>Welcome back</h1>
            <p style={{ color: 'var(--grey-400)', marginTop: '0.25rem' }}>Sign in to BalanceVault</p>
          </div>

          <Alert type="error" message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit}>
            <Input
              label="Email" id="email" type="email" name="email"
              value={form.email} onChange={handleChange}
              required autoComplete="email" placeholder="you@example.com"
            />
            <Input
              label="Password" id="password" type="password" name="password"
              value={form.password} onChange={handleChange}
              required autoComplete="current-password" placeholder="Your password"
            />
            <Button type="submit" fullWidth loading={loading} style={{ marginTop: '0.5rem' }}>
              Sign In
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--grey-600)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--indigo-light)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

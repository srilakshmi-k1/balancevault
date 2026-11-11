import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const features = [
  { icon: '🔐', title: 'Bank-Grade Security', desc: 'JWT authentication, bcrypt hashing, Helmet headers, and rate limiting protect every request.' },
  { icon: '📊', title: 'Real-Time Ledger', desc: 'Every transfer creates atomic debit/credit ledger entries verified for integrity.' },
  { icon: '👥', title: 'Role-Based Access', desc: 'Admins and Account Holders have clearly separated permissions enforced server-side.' },
  { icon: '📋', title: 'Full Audit Trail', desc: 'Every sensitive action is logged with actor, timestamp, outcome, and metadata.' },
  { icon: '⚡', title: 'Idempotent Transfers', desc: 'Duplicate transfer requests are safely detected and return the original result.' },
  { icon: '🛡️', title: 'Zero Trust Backend', desc: 'The frontend never controls authorization. Every API call is independently verified.' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #1e1b4b 60%, #0f172a 100%)',
        color: 'white', padding: '5rem 1.5rem', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏦</div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
            BalanceVault
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#a5b4fc', marginBottom: '0.5rem' }}>
            Secure Account Management & Auditable Money Movement
          </p>
          <p style={{ color: 'var(--grey-400)', marginBottom: '2.5rem', fontSize: '1rem', maxWidth: 560, margin: '0 auto 2.5rem' }}>
            A professional financial platform built for the Snovasys Fresher Hiring Challenge 2026. Features secure transfers, verifiable ledgers, and complete audit trails.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              background: 'var(--indigo-light)', color: 'white', padding: '14px 32px',
              borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none',
            }}>
              Create Account
            </Link>
            <Link to="/login" style={{
              background: 'transparent', color: 'white', padding: '14px 32px',
              borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '1.05rem',
              border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none',
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--navy)' }}>
          Built for Security & Auditability
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--grey-400)', marginBottom: '3rem' }}>
          Every feature is implemented with real security principles, not just UI.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {features.map((f) => (
            <div key={f.title} style={{
              background: 'var(--white)', border: '1px solid var(--grey-200)',
              borderRadius: 'var(--radius-lg)', padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--navy)' }}>{f.title}</h3>
              <p style={{ color: 'var(--grey-600)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--navy)', color: 'white', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to get started?</h2>
        <p style={{ color: 'var(--grey-400)', marginBottom: '2rem' }}>Register an account and explore the platform.</p>
        <Link to="/register" style={{
          background: 'var(--teal)', color: 'white', padding: '14px 36px',
          borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
        }}>
          Get Started Free
        </Link>
      </section>

      <footer style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--grey-400)', fontSize: '0.85rem', borderTop: '1px solid var(--grey-200)' }}>
        © 2026 BalanceVault – Snovasys Fresher Hiring Challenge
      </footer>
    </div>
  );
}

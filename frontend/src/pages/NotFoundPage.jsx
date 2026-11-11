import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--grey-50)', padding: '1.5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>404</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem' }}>Page Not Found</h1>
        <p style={{ color: 'var(--grey-400)', marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
        <Link to="/" style={{ background: 'var(--indigo-light)', color: 'white', padding: '12px 28px', borderRadius: 'var(--radius)', fontWeight: 600, textDecoration: 'none' }}>
          Go Home
        </Link>
      </div>
    </div>
  );
}

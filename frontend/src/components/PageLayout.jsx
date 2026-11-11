import React from 'react';
import Navbar from './Navbar';

export default function PageLayout({ children, maxWidth = 1200 }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--grey-50)' }}>
      <Navbar />
      <main style={{ maxWidth, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {children}
      </main>
    </div>
  );
}

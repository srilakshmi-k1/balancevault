import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--grey-50)', padding: '1.5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🚫</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem' }}>Access Denied</h1>
        <p style={{ color: 'var(--grey-400)', marginBottom: '2rem' }}>You don't have permission to view this page.</p>
        <Button onClick={() => navigate(user?.role === 'ADMIN' ? '/admin' : '/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

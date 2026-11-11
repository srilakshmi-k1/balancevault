import React from 'react';

export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;

  const styles = {
    error: { bg: 'var(--red-light)', border: 'var(--red)', color: '#7f1d1d' },
    success: { bg: 'var(--green-light)', border: 'var(--green)', color: '#14532d' },
    warning: { bg: 'var(--yellow-light)', border: 'var(--yellow)', color: '#78350f' },
    info: { bg: '#eff6ff', border: '#3b82f6', color: '#1e3a5f' },
  };

  const s = styles[type] || styles.error;

  return (
    <div
      role="alert"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        borderRadius: 'var(--radius)',
        padding: '0.75rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        fontSize: '0.9rem',
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: s.color, fontSize: '1.1rem', cursor: 'pointer', marginLeft: '0.5rem' }}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}

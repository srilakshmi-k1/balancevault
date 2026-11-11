import React from 'react';

export default function Input({ label, id, error, ...props }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label
          htmlFor={id}
          style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--grey-700)' }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: `1px solid ${error ? 'var(--red)' : 'var(--grey-300)'}`,
          borderRadius: 'var(--radius)',
          fontSize: '0.95rem',
          outline: 'none',
          transition: 'border-color 0.2s',
          background: 'var(--white)',
        }}
        {...props}
        onFocus={(e) => { e.target.style.borderColor = 'var(--indigo-light)'; props.onFocus?.(e); }}
        onBlur={(e) => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--grey-300)'; props.onBlur?.(e); }}
      />
      {error && <p style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
}

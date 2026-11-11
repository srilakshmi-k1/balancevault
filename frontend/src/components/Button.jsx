import React from 'react';

const variants = {
  primary: {
    background: 'var(--indigo-light)', color: 'white', border: 'none',
  },
  secondary: {
    background: 'transparent', color: 'var(--indigo-light)', border: '1px solid var(--indigo-light)',
  },
  danger: {
    background: 'var(--red)', color: 'white', border: 'none',
  },
  success: {
    background: 'var(--green)', color: 'white', border: 'none',
  },
  ghost: {
    background: 'var(--grey-100)', color: 'var(--grey-700)', border: '1px solid var(--grey-200)',
  },
};

export default function Button({
  children, onClick, type = 'button', variant = 'primary',
  disabled = false, loading = false, fullWidth = false, style = {},
}) {
  const v = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...v,
        padding: '10px 20px',
        borderRadius: 'var(--radius)',
        fontWeight: 600,
        fontSize: '0.95rem',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        justifyContent: 'center',
        width: fullWidth ? '100%' : 'auto',
        transition: 'opacity 0.2s, transform 0.1s',
        ...style,
      }}
      onMouseOver={(e) => { if (!disabled && !loading) e.currentTarget.style.opacity = '0.85'; }}
      onMouseOut={(e) => { if (!disabled && !loading) e.currentTarget.style.opacity = '1'; }}
    >
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}

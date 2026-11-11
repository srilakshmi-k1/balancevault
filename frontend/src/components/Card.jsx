import React from 'react';

export default function Card({ children, className = '', style = {} }) {
  return (
    <div
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow)',
        padding: '1.5rem',
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}

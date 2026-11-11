import React from 'react';
import Button from './Button';

export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem', alignItems: 'center' }}>
      <Button variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)} style={{ padding: '6px 14px' }}>
        ← Prev
      </Button>
      <span style={{ color: 'var(--grey-600)', fontSize: '0.9rem' }}>
        Page {page} of {totalPages}
      </span>
      <Button variant="ghost" disabled={page >= totalPages} onClick={() => onPage(page + 1)} style={{ padding: '6px 14px' }}>
        Next →
      </Button>
    </div>
  );
}

import React from 'react';
import Card from './Card';

export default function StatCard({ icon, label, value, color = 'var(--indigo-light)' }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 'var(--radius-lg)',
        background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.8rem', color: 'var(--grey-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
        <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--grey-800)', lineHeight: 1.2 }}>{value ?? '—'}</p>
      </div>
    </Card>
  );
}

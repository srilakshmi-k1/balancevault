import React from 'react';

const badgeMap = {
  ACTIVE:    'badge-green',
  APPROVED:  'badge-green',
  COMPLETED: 'badge-green',
  SUSPENDED: 'badge-red',
  REJECTED:  'badge-red',
  FAILED:    'badge-red',
  PENDING:   'badge-yellow',
  ADMIN:     'badge-indigo',
  ACCOUNT_HOLDER: 'badge-grey',
};

export default function StatusBadge({ status }) {
  const cls = badgeMap[status] || 'badge-grey';
  return <span className={`badge ${cls}`}>{status?.replace('_', ' ')}</span>;
}

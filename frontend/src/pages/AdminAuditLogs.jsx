import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState('');

  const actions = [
    '', 'USER_REGISTERED', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT',
    'ONBOARDING_SUBMITTED', 'ONBOARDING_APPROVED', 'ONBOARDING_REJECTED',
    'ACCOUNT_CREATED', 'ACCOUNT_STATUS_CHANGED', 'TRANSFER_COMPLETED', 'TRANSFER_FAILED',
    'UNAUTHORIZED_ACCESS',
  ];

  useEffect(() => {
    setLoading(true);
    adminApi.getAuditLogs({ page, limit: 20, action: filterAction || undefined })
      .then((res) => {
        setLogs(res.data.data || []);
        setPagination(res.data.pagination || {});
      })
      .finally(() => setLoading(false));
  }, [page, filterAction]);

  return (
    <PageLayout>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--navy)' }}>Audit Logs</h1>
      <p style={{ color: 'var(--grey-400)', marginBottom: '2rem' }}>Complete audit trail – Total: {pagination.total || 0} events</p>

      <Card>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--grey-700)', marginRight: '0.75rem' }}>Filter by action:</label>
          <select value={filterAction} onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', border: '1px solid var(--grey-300)', borderRadius: 'var(--radius)', fontSize: '0.9rem' }}>
            {actions.map((a) => <option key={a} value={a}>{a || 'All Actions'}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--grey-200)' }}>
                  {['Timestamp', 'Actor', 'Action', 'Target', 'Outcome', 'Request ID'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--grey-400)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--grey-100)' }}>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: 'var(--grey-500)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'System'}
                      {log.actor && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--grey-400)' }}>{log.actor.email}</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--navy)', fontSize: '0.8rem' }}>
                      {log.action.replace(/_/g, ' ')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--grey-500)' }}>
                      {log.targetType ? `${log.targetType}` : '—'}
                      {log.targetId && <span style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--grey-400)' }}>{log.targetId.slice(0, 12)}…</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <StatusBadge status={log.outcome === 'SUCCESS' ? 'COMPLETED' : 'FAILED'} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--grey-400)' }}>
                      {log.requestId ? log.requestId.slice(0, 12) + '…' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={pagination.totalPages} onPage={setPage} />
      </Card>
    </PageLayout>
  );
}

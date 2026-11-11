import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Pagination from '../components/Pagination';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
}

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [alert, setAlert] = useState(null);
  const [updating, setUpdating] = useState(null);

  const load = (p = 1) => {
    setLoading(true);
    adminApi.getAccounts({ page: p, limit: 15, status: filterStatus || undefined })
      .then((res) => {
        setAccounts(res.data.data || []);
        setPagination(res.data.pagination || {});
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page, filterStatus]);

  const handleStatusChange = async (id, status) => {
    setUpdating(id);
    try {
      await adminApi.updateAccountStatus(id, { status });
      setAlert({ type: 'success', message: `Account status updated to ${status}` });
      load(page);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update status' });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <PageLayout>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--navy)' }}>Account Management</h1>
      <p style={{ color: 'var(--grey-400)', marginBottom: '2rem' }}>Manage all platform accounts</p>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <Card>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--grey-700)' }}>Filter:</span>
          {['', 'ACTIVE', 'SUSPENDED', 'PENDING'].map((s) => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
              style={{ padding: '5px 14px', borderRadius: '999px', border: '1px solid', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                background: filterStatus === s ? 'var(--navy)' : 'transparent',
                color: filterStatus === s ? 'white' : 'var(--grey-600)',
                borderColor: filterStatus === s ? 'var(--navy)' : 'var(--grey-300)',
              }}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--grey-200)' }}>
                  {['Account Number', 'Owner', 'Balance', 'Status', 'Created', 'Actions'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--grey-400)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--grey-100)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 600 }}>{a.accountNumber}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{a.user?.firstName} {a.user?.lastName}<br /><span style={{ fontSize: '0.8rem', color: 'var(--grey-400)' }}>{a.user?.email}</span></td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--teal)' }}>{formatCurrency(a.balance)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><StatusBadge status={a.status} /></td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--grey-400)', fontSize: '0.85rem' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {a.status !== 'ACTIVE' && (
                          <Button variant="success" onClick={() => handleStatusChange(a.id, 'ACTIVE')} loading={updating === a.id} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Activate</Button>
                        )}
                        {a.status === 'ACTIVE' && (
                          <Button variant="danger" onClick={() => handleStatusChange(a.id, 'SUSPENDED')} loading={updating === a.id} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Suspend</Button>
                        )}
                      </div>
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

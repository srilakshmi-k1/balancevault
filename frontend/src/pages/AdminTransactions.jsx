import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    adminApi.getTransactions({ page, limit: 20 })
      .then((res) => {
        setTransactions(res.data.data || []);
        setPagination(res.data.pagination || {});
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <PageLayout>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--navy)' }}>Transaction Monitoring</h1>
      <p style={{ color: 'var(--grey-400)', marginBottom: '2rem' }}>All platform transactions – Total: {pagination.total || 0}</p>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--grey-200)' }}>
                  {['Date', 'Sender', 'From Account', 'To Account', 'Amount', 'Note', 'Status'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--grey-400)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--grey-100)' }}>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{new Date(tx.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>{tx.sender?.firstName} {tx.sender?.lastName}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>{tx.senderAccount?.accountNumber}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>{tx.receiverAccount?.accountNumber}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--teal)', whiteSpace: 'nowrap' }}>{formatCurrency(tx.amountRupees)}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--grey-500)', fontSize: '0.85rem' }}>{tx.note || '—'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><StatusBadge status={tx.status} /></td>
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

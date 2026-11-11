import React, { useState, useEffect } from 'react';
import { transferApi, accountApi } from '../services/api';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    accountApi.getMyAccounts().then((res) => setAccounts(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    transferApi.getMyTransactions({ page, limit: 15 })
      .then((res) => {
        setTransactions(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
      })
      .finally(() => setLoading(false));
  }, [page]);

  const accountNumbers = new Set(accounts.map((a) => a.accountNumber));

  return (
    <PageLayout>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--navy)' }}>Transaction History</h1>
      <p style={{ color: 'var(--grey-400)', marginBottom: '2rem' }}>All your transfers and payments</p>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        ) : transactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--grey-400)', padding: '3rem 0' }}>No transactions yet</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--grey-200)' }}>
                  {['Date', 'From', 'To', 'Note', 'Amount', 'Status'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--grey-400)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isSender = accountNumbers.has(tx.senderAccount?.accountNumber);
                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--grey-100)' }}>
                      <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{tx.senderAccount?.accountNumber || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{tx.receiverAccount?.accountNumber || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--grey-500)', fontSize: '0.85rem' }}>{tx.note || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: isSender ? 'var(--red)' : 'var(--green)', whiteSpace: 'nowrap' }}>
                        {isSender ? '-' : '+'}{formatCurrency(tx.amountRupees)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}><StatusBadge status={tx.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={pagination.totalPages} onPage={setPage} />
      </Card>
    </PageLayout>
  );
}

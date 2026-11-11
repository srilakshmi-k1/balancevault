import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { accountApi, transferApi } from '../services/api';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
}

export default function AccountDetails() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      accountApi.getAccount(id),
      transferApi.getMyTransactions({ accountId: id, limit: 20 }),
    ]).then(([accRes, txRes]) => {
      setAccount(accRes.data.data);
      setTransactions(txRes.data.data || []);
    }).catch((err) => {
      setError(err.response?.data?.message || 'Failed to load account');
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLayout><div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div></PageLayout>;
  if (error) return <PageLayout><div style={{ color: 'var(--red)', textAlign: 'center', padding: '4rem' }}>{error}</div></PageLayout>;

  return (
    <PageLayout maxWidth={800}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--grey-400)', fontSize: '0.9rem' }}>← Back to Dashboard</Link>
      </div>

      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--grey-400)', fontWeight: 600, textTransform: 'uppercase' }}>Account Number</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy)', fontFamily: 'monospace' }}>{account.accountNumber}</p>
          </div>
          <StatusBadge status={account.status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ background: 'var(--grey-50)', borderRadius: 'var(--radius)', padding: '1rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--grey-400)', fontWeight: 600 }}>Available Balance</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--teal)' }}>{formatCurrency(account.balance)}</p>
          </div>
          <div style={{ background: 'var(--grey-50)', borderRadius: 'var(--radius)', padding: '1rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--grey-400)', fontWeight: 600 }}>Opened On</p>
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>{new Date(account.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--navy)' }}>Transaction History</h2>
        {transactions.length === 0 ? (
          <p style={{ color: 'var(--grey-400)', textAlign: 'center', padding: '2rem 0' }}>No transactions found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--grey-200)' }}>
                  {['Date', 'From', 'To', 'Amount', 'Status'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--grey-400)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isSender = tx.senderAccount?.accountNumber === account.accountNumber;
                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--grey-100)' }}>
                      <td style={{ padding: '0.75rem' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{tx.senderAccount?.accountNumber}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{tx.receiverAccount?.accountNumber}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: isSender ? 'var(--red)' : 'var(--green)' }}>
                        {isSender ? '-' : '+'}{formatCurrency(tx.amountRupees)}
                      </td>
                      <td style={{ padding: '0.75rem' }}><StatusBadge status={tx.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageLayout>
  );
}

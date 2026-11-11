import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { accountApi, transferApi, onboardingApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
}

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      accountApi.getMyAccounts().catch(() => ({ data: { data: [] } })),
      transferApi.getMyTransactions({ limit: 5 }).catch(() => ({ data: { data: [] } })),
      onboardingApi.getStatus().catch(() => ({ data: { data: null } })),
    ]).then(([accRes, txRes, obRes]) => {
      setAccounts(accRes.data.data || []);
      setTransactions(txRes.data.data || []);
      setOnboarding(obRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLayout><div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div></PageLayout>;

  const primaryAccount = accounts[0];
  const hasAccount = !!primaryAccount;

  return (
    <PageLayout>
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)' }}>
          Welcome back, {user.firstName}! 👋
        </h1>
        <p style={{ color: 'var(--grey-400)', marginTop: '0.25rem' }}>Here's your financial overview</p>
      </div>

      {/* Onboarding prompt */}
      {!onboarding && (
        <Card style={{ background: 'linear-gradient(135deg,#ede9fe,#dbeafe)', border: '1px solid #c7d2fe', marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--navy)' }}>Complete Onboarding</h2>
          <p style={{ color: 'var(--grey-700)', marginBottom: '1rem' }}>Submit your details to open an account and start transferring money.</p>
          <Button onClick={() => navigate('/onboarding')}>Complete Onboarding →</Button>
        </Card>
      )}

      {onboarding && onboarding.status === 'PENDING' && (
        <Card style={{ background: 'var(--yellow-light)', border: '1px solid #fcd34d', marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#78350f' }}>⏳ Onboarding Under Review</h2>
          <p style={{ color: '#92400e' }}>Your application is being reviewed by an admin. You'll be notified once approved.</p>
        </Card>
      )}

      {onboarding && onboarding.status === 'REJECTED' && (
        <Card style={{ background: 'var(--red-light)', border: '1px solid #fca5a5', marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#7f1d1d' }}>❌ Onboarding Rejected</h2>
          <p style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Reason: {onboarding.reviewNote || 'Not specified'}</p>
        </Card>
      )}

      {/* Stats */}
      {hasAccount && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard icon="💰" label="Balance" value={formatCurrency(primaryAccount.balance)} color="var(--teal)" />
          <StatCard icon="🏦" label="Account" value={primaryAccount.accountNumber} color="var(--indigo-light)" />
          <StatCard icon="📊" label="Status" value={<StatusBadge status={primaryAccount.status} />} color="var(--green)" />
          <StatCard icon="🔄" label="Transactions" value={transactions.length} color="var(--yellow)" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: hasAccount ? '2fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Recent Transactions */}
        {hasAccount && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, color: 'var(--navy)' }}>Recent Transactions</h2>
              <Link to="/transactions" style={{ fontSize: '0.85rem', color: 'var(--indigo-light)' }}>View all →</Link>
            </div>
            {transactions.length === 0 ? (
              <p style={{ color: 'var(--grey-400)', textAlign: 'center', padding: '2rem 0' }}>No transactions yet</p>
            ) : (
              <div>
                {transactions.map((tx) => {
                  const isSender = tx.senderAccount?.accountNumber === primaryAccount.accountNumber;
                  return (
                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--grey-100)' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {isSender ? `To: ${tx.receiverAccount?.accountNumber}` : `From: ${tx.senderAccount?.accountNumber}`}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--grey-400)' }}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span style={{ fontWeight: 700, color: isSender ? 'var(--red)' : 'var(--green)' }}>
                        {isSender ? '-' : '+'}{formatCurrency(tx.amountRupees)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <h2 style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {hasAccount && primaryAccount.status === 'ACTIVE' && (
              <Button onClick={() => navigate('/transfer')} fullWidth>💸 Transfer Money</Button>
            )}
            {hasAccount && (
              <Button variant="secondary" onClick={() => navigate(`/accounts/${primaryAccount.id}`)} fullWidth>
                🏦 Account Details
              </Button>
            )}
            <Button variant="secondary" onClick={() => navigate('/transactions')} fullWidth>
              📋 Transaction History
            </Button>
            {!onboarding && (
              <Button variant="ghost" onClick={() => navigate('/onboarding')} fullWidth>
                📝 Complete Onboarding
              </Button>
            )}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}

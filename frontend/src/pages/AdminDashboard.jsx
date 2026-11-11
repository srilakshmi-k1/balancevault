import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/api';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLayout><div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div></PageLayout>;

  return (
    <PageLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--grey-400)' }}>Platform overview and recent activity</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard icon="👥" label="Total Users" value={data?.totalUsers} color="var(--indigo-light)" />
        <StatCard icon="🏦" label="Active Accounts" value={data?.activeAccounts} color="var(--teal)" />
        <StatCard icon="⏳" label="Pending Onboarding" value={data?.pendingOnboarding} color="var(--yellow)" />
        <StatCard icon="🔄" label="Completed Transfers" value={data?.totalTransactions} color="var(--green)" />
      </div>

      {/* Nav cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Users', path: '/admin/users', icon: '👥' },
          { label: 'Onboarding', path: '/admin/onboarding', icon: '📝' },
          { label: 'Accounts', path: '/admin/accounts', icon: '🏦' },
          { label: 'Transactions', path: '/admin/transactions', icon: '🔄' },
          { label: 'Audit Logs', path: '/admin/audit-logs', icon: '📋' },
        ].map((n) => (
          <Link key={n.path} to={n.path} style={{ textDecoration: 'none' }}>
            <Card style={{ textAlign: 'center', cursor: 'pointer', border: '1px solid var(--grey-200)', transition: 'box-shadow 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = 'var(--shadow)'}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{n.icon}</div>
              <p style={{ fontWeight: 600, color: 'var(--navy)' }}>{n.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Transactions */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700, color: 'var(--navy)' }}>Recent Transfers</h2>
            <Link to="/admin/transactions" style={{ fontSize: '0.85rem', color: 'var(--indigo-light)' }}>View all</Link>
          </div>
          {(data?.recentTransactions || []).length === 0 ? (
            <p style={{ color: 'var(--grey-400)', textAlign: 'center', padding: '1.5rem 0' }}>No transactions</p>
          ) : (
            data.recentTransactions.map((tx) => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--grey-100)' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tx.sender?.firstName} {tx.sender?.lastName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--grey-400)' }}>{tx.senderAccount?.accountNumber} → {tx.receiverAccount?.accountNumber}</p>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--teal)', fontSize: '0.9rem' }}>{formatCurrency(tx.amountRupees)}</span>
              </div>
            ))
          )}
        </Card>

        {/* Recent Audit Logs */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700, color: 'var(--navy)' }}>Recent Audit Events</h2>
            <Link to="/admin/audit-logs" style={{ fontSize: '0.85rem', color: 'var(--indigo-light)' }}>View all</Link>
          </div>
          {(data?.recentAuditLogs || []).length === 0 ? (
            <p style={{ color: 'var(--grey-400)', textAlign: 'center', padding: '1.5rem 0' }}>No audit logs</p>
          ) : (
            data.recentAuditLogs.slice(0, 7).map((log) => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--grey-100)' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)' }}>{log.action.replace(/_/g, ' ')}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--grey-400)' }}>{log.actor?.email || 'System'}</p>
                </div>
                <StatusBadge status={log.outcome === 'SUCCESS' ? 'COMPLETED' : 'FAILED'} />
              </div>
            ))
          )}
        </Card>
      </div>
    </PageLayout>
  );
}

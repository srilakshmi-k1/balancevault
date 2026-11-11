import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import Input from '../components/Input';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const load = (p = 1, q = '') => {
    setLoading(true);
    adminApi.getUsers({ page: p, limit: 15, search: q })
      .then((res) => {
        setUsers(res.data.data || []);
        setPagination(res.data.pagination || {});
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page, search); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  return (
    <PageLayout>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--navy)' }}>User Management</h1>
      <p style={{ color: 'var(--grey-400)', marginBottom: '2rem' }}>Total: {pagination.total || 0} users</p>

      <Card>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Input label="Search users" id="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or email…" />
          </div>
          <button type="submit" style={{ background: 'var(--indigo-light)', color: 'white', border: 'none', borderRadius: 'var(--radius)', padding: '10px 20px', fontWeight: 600, cursor: 'pointer', marginBottom: '1rem' }}>Search</button>
        </form>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--grey-200)' }}>
                  {['Name', 'Email', 'Role', 'Onboarding', 'Accounts', 'Active', 'Joined'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--grey-400)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--grey-100)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--grey-600)' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><StatusBadge status={u.role} /></td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {u.onboarding ? <StatusBadge status={u.onboarding.status} /> : <span style={{ color: 'var(--grey-400)' }}>None</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{u.accounts?.length || 0}</td>
                    <td style={{ padding: '0.75rem 1rem' }}><StatusBadge status={u.isActive ? 'ACTIVE' : 'SUSPENDED'} /></td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--grey-400)', fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
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

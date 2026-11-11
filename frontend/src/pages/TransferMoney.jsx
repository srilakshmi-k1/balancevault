import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountApi, transferApi } from '../services/api';

function uuidv4() {
  return crypto.randomUUID ? crypto.randomUUID() : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
}
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
}

export default function TransferMoney() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    senderAccountId: '',
    receiverAccountNumber: '',
    amountRupees: '',
    note: '',
  });

  useEffect(() => {
    accountApi.getMyAccounts()
      .then((res) => {
        const active = (res.data.data || []).filter((a) => a.status === 'ACTIVE');
        setAccounts(active);
        if (active.length > 0) setForm((f) => ({ ...f, senderAccountId: active[0].id }));
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedAccount = accounts.find((a) => a.id === form.senderAccountId);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const amount = parseFloat(form.amountRupees);
    if (!amount || amount <= 0) { setError('Enter a valid amount greater than 0'); return; }
    if (amount > (selectedAccount?.balance || 0)) { setError('Insufficient balance'); return; }

    setSubmitting(true);
    try {
      const res = await transferApi.transfer({
        ...form,
        amountRupees: amount,
        idempotencyKey: uuidv4(),
      });
      setSuccess(`Transfer of ${formatCurrency(amount)} completed successfully! Transaction ID: ${res.data.data.transactionId}`);
      setForm((f) => ({ ...f, receiverAccountNumber: '', amountRupees: '', note: '' }));
      // Refresh accounts
      const accRes = await accountApi.getMyAccounts();
      const active = (accRes.data.data || []).filter((a) => a.status === 'ACTIVE');
      setAccounts(active);
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLayout><div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div></PageLayout>;

  return (
    <PageLayout maxWidth={600}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--grey-400)', cursor: 'pointer', fontSize: '0.9rem' }}>← Back</button>
      </div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--navy)' }}>Transfer Money</h1>
      <p style={{ color: 'var(--grey-400)', marginBottom: '2rem' }}>Send money securely to another BalanceVault account.</p>

      {accounts.length === 0 ? (
        <Card>
          <p style={{ color: 'var(--grey-600)', textAlign: 'center', padding: '2rem 0' }}>
            You need an active account to make transfers.
          </p>
        </Card>
      ) : (
        <Card>
          <Alert type="error" message={error} onClose={() => setError('')} />
          <Alert type="success" message={success} onClose={() => setSuccess('')} />

          <form onSubmit={handleSubmit}>
            {/* From Account */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--grey-700)' }}>From Account</label>
              <select
                name="senderAccountId"
                value={form.senderAccountId}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--grey-300)', borderRadius: 'var(--radius)', fontSize: '0.95rem' }}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.accountNumber} – Balance: {formatCurrency(a.balance)}</option>
                ))}
              </select>
              {selectedAccount && (
                <p style={{ fontSize: '0.8rem', color: 'var(--grey-400)', marginTop: '0.25rem' }}>
                  Available: {formatCurrency(selectedAccount.balance)}
                </p>
              )}
            </div>

            <Input
              label="Receiver Account Number"
              id="receiverAccountNumber"
              name="receiverAccountNumber"
              value={form.receiverAccountNumber}
              onChange={handleChange}
              required
              placeholder="BVXXXXXXXXXX"
            />

            <Input
              label="Amount (₹)"
              id="amountRupees"
              type="number"
              name="amountRupees"
              value={form.amountRupees}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
            />

            <Input
              label="Note (optional)"
              id="note"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Payment for..."
            />

            {/* Summary */}
            {form.amountRupees > 0 && (
              <div style={{ background: 'var(--grey-50)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem', border: '1px solid var(--grey-200)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--grey-600)', marginBottom: '0.25rem' }}>Transfer Summary</p>
                <p style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--navy)' }}>{formatCurrency(parseFloat(form.amountRupees) || 0)}</p>
                {form.receiverAccountNumber && <p style={{ fontSize: '0.85rem', color: 'var(--grey-400)' }}>To: {form.receiverAccountNumber}</p>}
              </div>
            )}

            <Button type="submit" fullWidth loading={submitting}>
              💸 Confirm Transfer
            </Button>
          </form>
        </Card>
      )}
    </PageLayout>
  );
}

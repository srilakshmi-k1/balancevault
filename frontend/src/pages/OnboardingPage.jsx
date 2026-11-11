import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardingApi } from '../services/api';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    phone: '', address: '', dateOfBirth: '', occupation: '',
    annualIncome: '', idType: 'AADHAR', idNumber: '',
  });

  useEffect(() => {
    onboardingApi.getStatus()
      .then((res) => setStatus(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onboardingApi.submit(form);
      setSuccess('Onboarding submitted! An admin will review your application soon.');
      const res = await onboardingApi.getStatus();
      setStatus(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLayout><div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div></PageLayout>;

  return (
    <PageLayout maxWidth={700}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--navy)' }}>Account Onboarding</h1>
      <p style={{ color: 'var(--grey-400)', marginBottom: '2rem' }}>Complete your profile to open an account.</p>

      {status ? (
        <Card>
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Application Status</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <StatusBadge status={status.status} />
            <span style={{ color: 'var(--grey-600)', fontSize: '0.9rem' }}>
              Submitted: {new Date(status.submittedAt).toLocaleDateString()}
            </span>
          </div>
          {status.reviewNote && (
            <div style={{ background: 'var(--grey-50)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1rem' }}>
              <strong>Review Note:</strong> {status.reviewNote}
            </div>
          )}
          {status.status === 'APPROVED' && (
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard →</Button>
          )}
        </Card>
      ) : (
        <Card>
          <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Personal Details</h2>
          <Alert type="error" message={error} onClose={() => setError('')} />
          <Alert type="success" message={success} onClose={() => setSuccess('')} />

          <form onSubmit={handleSubmit}>
            <Input label="Phone Number" id="phone" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 9999999999" />
            <Input label="Address" id="address" name="address" value={form.address} onChange={handleChange} required placeholder="Full residential address" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Input label="Date of Birth" id="dateOfBirth" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required />
              <Input label="Occupation" id="occupation" name="occupation" value={form.occupation} onChange={handleChange} required placeholder="Software Engineer" />
            </div>
            <Input label="Annual Income (₹)" id="annualIncome" type="number" name="annualIncome" value={form.annualIncome} onChange={handleChange} required placeholder="600000" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="idType" style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--grey-700)' }}>ID Type</label>
                <select id="idType" name="idType" value={form.idType} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--grey-300)', borderRadius: 'var(--radius)', fontSize: '0.95rem' }}>
                  <option value="AADHAR">Aadhar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                </select>
              </div>
              <Input label="ID Number" id="idNumber" name="idNumber" value={form.idNumber} onChange={handleChange} required placeholder="ABCDE1234F" />
            </div>
            <Button type="submit" fullWidth loading={submitting} style={{ marginTop: '0.5rem' }}>
              Submit Onboarding
            </Button>
          </form>
        </Card>
      )}
    </PageLayout>
  );
}

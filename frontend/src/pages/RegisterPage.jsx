import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await authApi.register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password });
      const user = await login({ email: form.email, password: form.password });
      navigate('/onboarding', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const fe = {};
        data.errors.forEach(({ field, message }) => { fe[field] = message; });
        setFieldErrors(fe);
      } else {
        setError(data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--navy) 0%, #1e1b4b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏦</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)' }}>Create Account</h1>
          <p style={{ color: 'var(--grey-400)', marginTop: '0.25rem' }}>Join BalanceVault today</p>
        </div>

        <Alert type="error" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label="First Name" id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required error={fieldErrors.firstName} placeholder="John" />
            <Input label="Last Name" id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required error={fieldErrors.lastName} placeholder="Doe" />
          </div>
          <Input label="Email" id="email" type="email" name="email" value={form.email} onChange={handleChange} required error={fieldErrors.email} placeholder="you@example.com" />
          <Input label="Password" id="password" type="password" name="password" value={form.password} onChange={handleChange} required error={fieldErrors.password} placeholder="At least 8 chars with uppercase & number" />
          <Input label="Confirm Password" id="confirmPassword" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required error={fieldErrors.confirmPassword} placeholder="Repeat your password" />
          <Button type="submit" fullWidth loading={loading} style={{ marginTop: '0.5rem' }}>
            Create Account
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--grey-600)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--indigo-light)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

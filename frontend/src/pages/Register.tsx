import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Token } from '../types';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post<Token>('/auth/register', form);
      login(data.access_token, data.user);
      navigate('/upload');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  }

  const inputStyle: React.CSSProperties = { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '0 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>C</span>
          </div>
          <h1 style={{ color: '#f1f5f9', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Create account</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Start your AI-powered career journey</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#1e293b', borderRadius: 16, padding: 32, border: '1px solid #334155' }}>
          {error && <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#fca5a5', fontSize: 13 }}>{error}</div>}
          {(['name', 'email', 'password'] as const).map(field => (
            <div key={field} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: 13, marginBottom: 6, textTransform: 'capitalize' }}>{field === 'name' ? 'Full Name' : field}</label>
              <input type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'} required
                value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={inputStyle} />
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 8, padding: '11px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 16 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

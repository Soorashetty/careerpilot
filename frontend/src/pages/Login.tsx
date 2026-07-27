import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Token } from '../types';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post<Token>('/auth/login', form);
      login(data.access_token, data.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.15; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.3; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-card { animation: fadeIn 0.6s ease forwards; }
        .login-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.2) !important; }
        .login-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(99,102,241,0.45) !important; }
        .login-btn { transition: all 0.2s ease; }
        .blob { position: absolute; border-radius: 50%; filter: blur(80px); animation: float linear infinite; }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 16px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(-45deg, #0a0f1e, #0f172a, #1a0533, #0d1b3e, #0f172a)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 12s ease infinite',
      }}>
        {/* Decorative blobs */}
        <div className="blob" style={{ width: 400, height: 400, background: '#6366f1', top: '-10%', left: '-10%', opacity: 0.12, animationDuration: '8s' }} />
        <div className="blob" style={{ width: 300, height: 300, background: '#8b5cf6', bottom: '-5%', right: '-5%', opacity: 0.15, animationDuration: '11s', animationDelay: '2s' }} />
        <div className="blob" style={{ width: 200, height: 200, background: '#06b6d4', top: '40%', right: '10%', opacity: 0.1, animationDuration: '9s', animationDelay: '1s' }} />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="login-card" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            }}>
              <span style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>C</span>
            </div>
            <h1 style={{ color: '#f1f5f9', fontSize: 28, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.5px' }}>Welcome back</h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>Sign in to your CareerPilot account</p>
          </div>

          {/* Card */}
          <form onSubmit={handleSubmit} style={{
            background: 'rgba(30, 41, 59, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 20,
            padding: 36,
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 20,
                color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 7 }}>Email</label>
              <input
                className="login-input"
                type="email" required value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                style={{
                  width: '100%', background: 'rgba(15,23,42,0.8)',
                  border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10,
                  padding: '11px 14px', color: '#f1f5f9', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
                }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 7 }}>Password</label>
              <input
                className="login-input"
                type="password" required value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                style={{
                  width: '100%', background: 'rgba(15,23,42,0.8)',
                  border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10,
                  padding: '11px 14px', color: '#f1f5f9', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
                }}
              />
            </div>

            <button
              className="login-btn"
              type="submit" disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                border: 'none', borderRadius: 10, padding: '13px',
                color: '#fff', fontSize: 15, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p style={{ textAlign: 'center', color: '#475569', fontSize: 13, marginTop: 20 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>Register</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

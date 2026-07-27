import React, { useState } from 'react';
import { useApplications, useAddApplication, useUpdateApplication, useDeleteApplication } from '../hooks/useApi';
import type { AppStatus } from '../types';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

const STATUS_COLORS: Record<AppStatus, string> = { applied: '#6366f1', interview: '#f59e0b', offered: '#22c55e', rejected: '#ef4444' };
const STATUSES: AppStatus[] = ['applied', 'interview', 'offered', 'rejected'];
const card: React.CSSProperties = { background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' };
const inputStyle: React.CSSProperties = { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

export default function ApplicationTracker() {
  const { data: apps = [], isLoading } = useApplications();
  const addMutation = useAddApplication();
  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ job_title: '', company: '', status: 'applied' as AppStatus, apply_url: '', notes: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ status: 'applied' as AppStatus, notes: '' });

  function handleAdd() {
    if (!form.job_title || !form.company) return;
    addMutation.mutate(form as Parameters<typeof addMutation.mutate>[0]);
    setForm({ job_title: '', company: '', status: 'applied', apply_url: '', notes: '' });
    setShowAdd(false);
  }

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: apps.filter(a => a.status === s).length }), {} as Record<string, number>);

  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#64748b' }}>Loading...</div>;

  return (
    <div style={{ padding: 28, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700 }}>Application Tracker</h2>
        <button onClick={() => setShowAdd(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
          <Plus size={14} /> Add Application
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
        {STATUSES.map(s => (
          <div key={s} style={{ ...card, textAlign: 'center' }}>
            <p style={{ color: STATUS_COLORS[s], fontSize: 28, fontWeight: 800 }}>{counts[s] ?? 0}</p>
            <p style={{ color: '#64748b', fontSize: 12, textTransform: 'capitalize', marginTop: 4 }}>{s}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ ...card, marginBottom: 16 }}>
          <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 14 }}>New Application</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {(['job_title', 'company', 'apply_url', 'notes'] as const).map(f => (
              <input key={f} placeholder={f.replace('_', ' ')} value={form[f]}
                onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} style={inputStyle} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as AppStatus }))} style={{ ...inputStyle, width: 'auto' }}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={handleAdd} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#22c55e', color: '#fff', fontSize: 13, fontWeight: 600 }}>Save</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#334155', color: '#94a3b8', fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {apps.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          No applications yet. Apply to jobs or add manually.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {apps.map(app => (
            <div key={app.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{app.job_title}</p>
                <p style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{app.company} · {new Date(app.applied_at).toLocaleDateString()}</p>
                {app.notes && editId !== app.id && <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{app.notes}</p>}
              </div>

              {editId === app.id ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={editData.status} onChange={e => setEditData(p => ({ ...p, status: e.target.value as AppStatus }))} style={{ ...inputStyle, width: 'auto', fontSize: 12 }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input value={editData.notes} onChange={e => setEditData(p => ({ ...p, notes: e.target.value }))} placeholder="notes"
                    style={{ ...inputStyle, width: 130, fontSize: 12 }} />
                  <button onClick={() => { updateMutation.mutate({ id: app.id, ...editData }); setEditId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Check size={16} color="#22c55e" /></button>
                  <button onClick={() => setEditId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} color="#ef4444" /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ padding: '4px 12px', borderRadius: 20, background: STATUS_COLORS[app.status] + '22', color: STATUS_COLORS[app.status], fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{app.status}</span>
                  <button onClick={() => { setEditId(app.id); setEditData({ status: app.status, notes: app.notes || '' }); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={14} color="#64748b" /></button>
                  <button onClick={() => deleteMutation.mutate(app.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} color="#ef4444" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

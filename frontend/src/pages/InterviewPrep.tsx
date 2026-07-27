import React, { useState } from 'react';
import { useResume, useMockInterview } from '../hooks/useApi';
import { Play, Loader2 } from 'lucide-react';

type Tab = 'hr' | 'technical' | 'coding' | 'mock';

export default function InterviewPrep() {
  const { data: resume, isLoading } = useResume();
  const [tab, setTab] = useState<Tab>('hr');
  const [role, setRole] = useState('');
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const mockMutation = useMockInterview(resume?.id ?? 0);

  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#64748b' }}>Loading...</div>;
  if (!resume) return <div style={{ padding: 28, color: '#64748b' }}>Upload a resume first.</div>;

  const iq = resume.interview_questions || { hr: [], technical: [], coding: [] };
  const questions = tab === 'hr' ? iq.hr : tab === 'technical' ? iq.technical : iq.coding;
  const mockQs: { question: string; hint: string }[] = (mockMutation.data as { questions?: { question: string; hint: string }[] })?.questions || [];

  const TABS = [
    { id: 'hr' as Tab, label: 'HR', count: iq.hr?.length },
    { id: 'technical' as Tab, label: 'Technical', count: iq.technical?.length },
    { id: 'coding' as Tab, label: 'Coding', count: iq.coding?.length },
    { id: 'mock' as Tab, label: 'Mock Interview', count: 0 },
  ];

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    background: active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#1e293b',
    color: active ? '#fff' : '#94a3b8', transition: 'all .15s',
  });

  return (
    <div style={{ padding: 28, maxWidth: 860, margin: '0 auto' }}>
      <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Interview Preparation</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={btnStyle(tab === t.id)}>
            {t.label} {t.count ? `(${t.count})` : ''}
          </button>
        ))}
      </div>

      {tab !== 'mock' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(questions || []).map((q, i) => (
            <div key={i} style={{ background: '#1e293b', borderRadius: 12, padding: '14px 18px', border: '1px solid #334155', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ width: 26, height: 26, borderRadius: 6, background: '#6366f122', color: '#6366f1', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <p style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.6 }}>{q}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155', marginBottom: 16 }}>
            <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 12 }}>Mock Interview Mode</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={role || resume.parsed_data?.preferred_role || ''} onChange={e => setRole(e.target.value)}
                placeholder="Target role (e.g. Software Engineer)"
                style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none' }} />
              <button onClick={() => mockMutation.mutate(role || resume.parsed_data?.preferred_role || 'Software Engineer')}
                disabled={mockMutation.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', cursor: mockMutation.isPending ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', opacity: mockMutation.isPending ? 0.7 : 1 }}>
                {mockMutation.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={14} />}
                {mockMutation.isPending ? 'Generating...' : 'Start'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mockQs.map((q, i) => (
              <div key={i} style={{ background: '#1e293b', borderRadius: 12, padding: '14px 18px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <p style={{ color: '#e2e8f0', fontSize: 14, flex: 1 }}><span style={{ color: '#6366f1', fontWeight: 600 }}>Q{i + 1}: </span>{q.question}</p>
                  <button onClick={() => setRevealed(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; })}
                    style={{ background: '#334155', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#94a3b8', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
                    {revealed.has(i) ? 'Hide' : 'Hint'}
                  </button>
                </div>
                {revealed.has(i) && <p style={{ color: '#22c55e', fontSize: 13, marginTop: 10, paddingTop: 10, borderTop: '1px solid #334155' }}>💡 {q.hint}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

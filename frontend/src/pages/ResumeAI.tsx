import React, { useState } from 'react';
import { useResume, useTailorResume, useCoverLetter } from '../hooks/useApi';
import { Wand2, FileText, Loader2, Code2, AlertCircle } from 'lucide-react';

type Tab = 'suggestions' | 'tailor' | 'cover';

const card: React.CSSProperties = { background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' };
const inputStyle: React.CSSProperties = { background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '9px 12px', color: '#f1f5f9', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' };
const btnStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
  background: active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#1e293b',
  color: active ? '#fff' : '#94a3b8',
});

function ErrorBox({ error }: { error: unknown }) {
  if (!error) return null;
  const msg = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
    || (error as Error)?.message
    || 'Something went wrong';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#ef444422', border: '1px solid #ef444466', borderRadius: 10, padding: '12px 16px', marginTop: 12 }}>
      <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
      <p style={{ color: '#fca5a5', fontSize: 13 }}>{msg}</p>
    </div>
  );
}

function ResumeAIInner({ resumeId }: { resumeId: number }) {
  const { data: resume } = useResume();
  const [tab, setTab] = useState<Tab>('suggestions');
  const [jd, setJd] = useState('');
  const [coverPayload, setCoverPayload] = useState({ job_title: '', company: '', job_description: '' });

  // Hooks called with real resumeId — never 0
  const tailorMutation = useTailorResume(resumeId);
  const coverMutation = useCoverLetter(resumeId);

  if (!resume) return null;
  const imp = resume.improvements ?? { items: [], certifications: [], github_projects: [] };
  const ats = resume.ats_report ?? { score: 0, missing_keywords: [], improvements: [], summary_suggestion: '' };

  return (
    <div style={{ padding: 28, maxWidth: 1000, margin: '0 auto' }}>
      <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Resume AI</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['suggestions', 'tailor', 'cover'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={btnStyle(tab === t)}>
            {t === 'tailor' ? 'Tailor Resume' : t === 'cover' ? 'Cover Letter' : 'AI Suggestions'}
          </button>
        ))}
      </div>

      {tab === 'suggestions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
          <div style={card}>
            <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 14 }}>AI Improvement Suggestions</p>
            {(imp?.items || []).length === 0
              ? <p style={{ color: '#64748b', fontSize: 13 }}>No suggestions available.</p>
              : (imp.items).map((item, i) => (
                <div key={i} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: i < imp.items.length - 1 ? '1px solid #334155' : 'none' }}>
                  <p style={{ color: '#6366f1', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{item.section?.toUpperCase()}</p>
                  <p style={{ color: '#94a3b8', fontSize: 13 }}>{item.suggestion}</p>
                </div>
              ))
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={card}>
              <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 8 }}>Suggested Summary</p>
              <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
                {ats.summary_suggestion || <span style={{ color: '#475569' }}>No summary suggestion available.</span>}
              </p>
            </div>
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Code2 size={14} color="#f1f5f9" />
                <p style={{ color: '#f1f5f9', fontWeight: 600 }}>GitHub Project Ideas</p>
              </div>
              {(imp?.github_projects || []).length === 0
                ? <p style={{ color: '#64748b', fontSize: 13 }}>No project ideas available.</p>
                : <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {imp.github_projects.map(p => <li key={p} style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>{p}</li>)}
                  </ul>
              }
            </div>
            <div style={card}>
              <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 10 }}>Recommended Certifications</p>
              {(imp?.certifications || []).length === 0
                ? <p style={{ color: '#64748b', fontSize: 13 }}>No certifications available.</p>
                : <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {imp.certifications.map(c => <li key={c} style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>{c}</li>)}
                  </ul>
              }
            </div>
          </div>
        </div>
      )}

      {tab === 'tailor' && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Wand2 size={15} color="#8b5cf6" />
            <p style={{ color: '#f1f5f9', fontWeight: 600 }}>One-Click Resume Tailoring</p>
          </div>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>Paste a job description and AI rewrites your resume to maximize ATS score.</p>
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            rows={6}
            placeholder="Paste job description here..."
            style={{ ...inputStyle, resize: 'vertical', marginBottom: 12 }}
          />
          <button
            onClick={() => { tailorMutation.reset(); tailorMutation.mutate(jd); }}
            disabled={tailorMutation.isPending || !jd.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 8, border: 'none', cursor: tailorMutation.isPending || !jd.trim() ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 600, opacity: tailorMutation.isPending || !jd.trim() ? 0.6 : 1 }}>
            {tailorMutation.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Wand2 size={14} />}
            {tailorMutation.isPending ? 'Tailoring...' : 'Tailor Resume'}
          </button>
          <ErrorBox error={tailorMutation.error} />
          {tailorMutation.isSuccess && tailorMutation.data && (
            <div style={{ marginTop: 16, background: '#0f172a', borderRadius: 10, padding: 16, border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ color: '#22c55e', fontSize: 12, fontWeight: 600 }}>✓ Tailored Resume</p>
                <button
                  onClick={() => navigator.clipboard.writeText((tailorMutation.data as { tailored_resume?: string })?.tailored_resume || '')}
                  style={{ background: '#334155', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}
                >Copy</button>
              </div>
              <pre style={{ color: '#e2e8f0', fontSize: 12, whiteSpace: 'pre-wrap', lineHeight: 1.7, margin: 0 }}>
                {(tailorMutation.data as { tailored_resume?: string })?.tailored_resume}
              </pre>
            </div>
          )}
        </div>
      )}

      {tab === 'cover' && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <FileText size={15} color="#0ea5e9" />
            <p style={{ color: '#f1f5f9', fontWeight: 600 }}>Cover Letter Generator</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <input value={coverPayload.job_title} onChange={e => setCoverPayload(p => ({ ...p, job_title: e.target.value }))} placeholder="Job Title" style={inputStyle} />
            <input value={coverPayload.company} onChange={e => setCoverPayload(p => ({ ...p, company: e.target.value }))} placeholder="Company" style={inputStyle} />
          </div>
          <textarea
            value={coverPayload.job_description}
            onChange={e => setCoverPayload(p => ({ ...p, job_description: e.target.value }))}
            rows={5}
            placeholder="Job description (optional)..."
            style={{ ...inputStyle, resize: 'vertical', marginBottom: 12 }}
          />
          <button
            onClick={() => { coverMutation.reset(); coverMutation.mutate(coverPayload); }}
            disabled={coverMutation.isPending || !coverPayload.job_title.trim() || !coverPayload.company.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 8, border: 'none', cursor: coverMutation.isPending || !coverPayload.job_title.trim() || !coverPayload.company.trim() ? 'not-allowed' : 'pointer', background: '#0ea5e9', color: '#fff', fontSize: 13, fontWeight: 600, opacity: coverMutation.isPending || !coverPayload.job_title.trim() || !coverPayload.company.trim() ? 0.6 : 1 }}>
            {coverMutation.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={14} />}
            {coverMutation.isPending ? 'Generating...' : 'Generate Cover Letter'}
          </button>
          <ErrorBox error={coverMutation.error} />
          {coverMutation.isSuccess && coverMutation.data && (
            <div style={{ marginTop: 16, background: '#0f172a', borderRadius: 10, padding: 16, border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ color: '#0ea5e9', fontSize: 12, fontWeight: 600 }}>✓ Cover Letter</p>
                <button
                  onClick={() => navigator.clipboard.writeText((coverMutation.data as { cover_letter?: string })?.cover_letter || '')}
                  style={{ background: '#334155', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}
                >Copy</button>
              </div>
              <pre style={{ color: '#e2e8f0', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.7, margin: 0 }}>
                {(coverMutation.data as { cover_letter?: string })?.cover_letter}
              </pre>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ResumeAI() {
  const { data: resume, isLoading } = useResume();
  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#64748b' }}>Loading...</div>;
  if (!resume) return <div style={{ padding: 28, color: '#64748b' }}>Upload a resume first.</div>;
  // Pass real resumeId so hooks are never called with 0
  return <ResumeAIInner resumeId={resume.id} />;
}

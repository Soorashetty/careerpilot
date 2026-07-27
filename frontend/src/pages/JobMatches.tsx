import React, { useState } from 'react';
import { useResume, useRecommendedJobs, useAddApplication } from '../hooks/useApi';
import { ExternalLink, Check } from 'lucide-react';

const card: React.CSSProperties = { background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 12 };

export default function JobMatches() {
  const { data: resume, isLoading: resumeLoading } = useResume();
  const { data: liveJobs = [], isLoading: jobsLoading } = useRecommendedJobs();
  const { mutate: addApp } = useAddApplication();
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('');
  const [tab, setTab] = useState<'ai' | 'live'>('ai');

  const isLoading = resumeLoading || jobsLoading;
  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#64748b' }}>Loading...</div>;
  if (!resume) return <div style={{ padding: 28, color: '#64748b' }}>Upload a resume first.</div>;

  const aiMatches = (resume.job_matches?.matches || []).filter(j =>
    !filter || j.job_title.toLowerCase().includes(filter.toLowerCase()) || j.company.toLowerCase().includes(filter.toLowerCase())
  );

  const filteredLive = liveJobs.filter(j =>
    !filter || j.title.toLowerCase().includes(filter.toLowerCase()) || j.company.toLowerCase().includes(filter.toLowerCase())
  );

  const scoreColor = (s: number) => s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444';
  const badge = (color: string, text: string) => <span key={text} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, background: color + '22', color, fontSize: 11, margin: '2px 2px' }}>{text}</span>;
  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    background: active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#1e293b',
    color: active ? '#fff' : '#94a3b8',
  });

  function handleApplyAI(job: typeof aiMatches[0]) {
    const key = `${job.job_title}-${job.company}`;
    if (applied.has(key)) return;
    setApplied(prev => new Set([...prev, key]));
    addApp({ job_title: job.job_title, company: job.company, status: 'applied', apply_url: job.apply_url } as Parameters<typeof addApp>[0]);
    if (job.apply_url) window.open(job.apply_url, '_blank');
  }

  function handleApplyLive(job: typeof liveJobs[0]) {
    const key = `live-${job.id}`;
    if (applied.has(key)) return;
    setApplied(prev => new Set([...prev, key]));
    addApp({ job_title: job.title, company: job.company, status: 'applied', apply_url: job.apply_url ?? '' } as Parameters<typeof addApp>[0]);
    if (job.apply_url) window.open(job.apply_url, '_blank');
  }

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700 }}>Job Matches</h2>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by title or company..."
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none', width: 240 }} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button onClick={() => setTab('ai')} style={btnStyle(tab === 'ai')}>AI Matches ({aiMatches.length})</button>
        <button onClick={() => setTab('live')} style={btnStyle(tab === 'live')}>Live Jobs — Adzuna ({filteredLive.length})</button>
      </div>

      {tab === 'ai' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
          {aiMatches.length === 0 && <p style={{ color: '#64748b', fontSize: 14 }}>No AI matches found.</p>}
          {aiMatches.map(job => {
            const key = `${job.job_title}-${job.company}`;
            const isApplied = applied.has(key);
            return (
              <div key={key} style={card}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>{job.job_title}</p>
                    <p style={{ color: '#6366f1', fontSize: 13, fontWeight: 500, marginTop: 2 }}>{job.company}</p>
                    <p style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{job.location}{job.remote ? ' · Remote' : ''}</p>
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor(job.match_score), flexShrink: 0 }}>{job.match_score}%</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>{job.reason}</p>
                <div>
                  <p style={{ color: '#475569', fontSize: 11, marginBottom: 4 }}>MATCHING SKILLS</p>
                  <div>{(job.matching_skills || []).map(s => badge('#22c55e', s))}</div>
                </div>
                {(job.missing_skills || []).length > 0 && (
                  <div>
                    <p style={{ color: '#475569', fontSize: 11, marginBottom: 4 }}>MISSING SKILLS</p>
                    <div>{job.missing_skills.map(s => badge('#ef4444', s))}</div>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 12, borderTop: '1px solid #334155' }}>
                  <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>{job.salary_range}</span>
                  <button onClick={() => handleApplyAI(job)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none',
                    cursor: isApplied ? 'default' : 'pointer', fontSize: 12, fontWeight: 600,
                    background: isApplied ? '#22c55e22' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: isApplied ? '#22c55e' : '#fff',
                  }}>
                    {isApplied ? <><Check size={12} /> Applied</> : <><ExternalLink size={12} /> Apply</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'live' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
          {filteredLive.length === 0 && <p style={{ color: '#64748b', fontSize: 14 }}>No live jobs found. Jobs sync every hour from Adzuna.</p>}
          {filteredLive.map(job => {
            const key = `live-${job.id}`;
            const isApplied = applied.has(key);
            return (
              <div key={key} style={card}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>{job.title}</p>
                    <p style={{ color: '#6366f1', fontSize: 13, fontWeight: 500, marginTop: 2 }}>{job.company}</p>
                    <p style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{job.location}{job.remote ? ' · Remote' : ''}</p>
                  </div>
                  <span style={{ background: '#6366f122', color: '#818cf8', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>Adzuna</span>
                </div>
                {(job.required_skills || []).length > 0 && (
                  <div>
                    <p style={{ color: '#475569', fontSize: 11, marginBottom: 4 }}>SKILLS</p>
                    <div>{job.required_skills.slice(0, 6).map(s => badge('#6366f1', s))}</div>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 12, borderTop: '1px solid #334155' }}>
                  <span style={{ color: '#475569', fontSize: 12 }}>
                    {job.salary_min && job.salary_max ? `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}` : 'Salary not listed'}
                  </span>
                  <button onClick={() => handleApplyLive(job)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none',
                    cursor: isApplied ? 'default' : 'pointer', fontSize: 12, fontWeight: 600,
                    background: isApplied ? '#22c55e22' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: isApplied ? '#22c55e' : '#fff',
                  }}>
                    {isApplied ? <><Check size={12} /> Applied</> : <><ExternalLink size={12} /> Apply</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

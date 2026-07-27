import React from 'react';
import { useResume } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import { User, TrendingUp, Award, BookOpen, Briefcase, Upload } from 'lucide-react';

const card: React.CSSProperties = { background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' };
const badge = (color: string): React.CSSProperties => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: color + '22', color, fontSize: 12, fontWeight: 500, margin: '2px 3px' });

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  const r = 32, circ = 2 * Math.PI * r, dash = (score / 100) * circ;
  return (
    <svg width={80} height={80} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={40} cy={40} r={r} fill="none" stroke="#1e293b" strokeWidth={8} />
      <circle cx={40} cy={40} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        style={{ fill: color, fontSize: 16, fontWeight: 700, transform: 'rotate(90deg)', transformOrigin: 'center', fontFamily: 'inherit' }}>
        {score}
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const { data: resume, isLoading, error } = useResume();
  const navigate = useNavigate();

  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#64748b' }}>Loading...</div>;
  if (error || !resume) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 16 }}>
      <p style={{ color: '#64748b' }}>No resume found.</p>
      <button onClick={() => navigate('/upload')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        <Upload size={15} /> Upload Resume
      </button>
    </div>
  );

  const p = resume.parsed_data ?? {} as typeof resume.parsed_data;
  const ats = resume.ats_report ?? { score: 0, missing_keywords: [], improvements: [], summary_suggestion: '' };
  const cp = resume.career_prediction ?? { current_match: 0, after_learning: 0, current_salary: 'N/A', after_salary: 'N/A', skill_to_learn: 'N/A' };

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>
      <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Dashboard</h2>

      {/* Top row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 16 }}>
        {/* Profile */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#6366f122', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={20} color="#6366f1" />
            </div>
            <div>
              <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>{p?.name || 'Candidate'}</p>
              <p style={{ color: '#64748b', fontSize: 12 }}>{p?.email}</p>
            </div>
          </div>
          {p?.education?.[0] && <p style={{ color: '#94a3b8', fontSize: 13 }}>{p.education[0].degree} · {p.education[0].branch}</p>}
          {p?.preferred_role && <p style={{ color: '#6366f1', fontSize: 12, marginTop: 4 }}>Target: {p.preferred_role}</p>}
        </div>

        {/* ATS Score */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 20 }}>
          <ScoreRing score={ats.score} />
          <div>
            <p style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>ATS Score</p>
            <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 22 }}>{ats.score}<span style={{ color: '#475569', fontSize: 13 }}>/100</span></p>
            <p style={{ fontSize: 12, marginTop: 4, color: ats.score >= 80 ? '#22c55e' : ats.score >= 60 ? '#f59e0b' : '#ef4444' }}>
              {ats.score >= 80 ? 'Excellent' : ats.score >= 60 ? 'Good — improve it' : 'Needs significant work'}
            </p>
          </div>
        </div>

        {/* Career Prediction */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <TrendingUp size={15} color="#22c55e" />
            <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>Career Prediction</p>
          </div>
          <p style={{ color: '#64748b', fontSize: 12, marginBottom: 10 }}>Learn <strong style={{ color: '#6366f1' }}>{cp.skill_to_learn}</strong> to unlock:</p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#475569', fontSize: 11 }}>Job Match</p>
              <p style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>{cp.current_match}% → <span style={{ color: '#22c55e' }}>{cp.after_learning}%</span></p>
            </div>
            <div>
              <p style={{ color: '#475569', fontSize: 11 }}>Salary</p>
              <p style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>{cp.current_salary} → <span style={{ color: '#22c55e' }}>{cp.after_salary}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><Briefcase size={14} color="#6366f1" /><p style={{ color: '#f1f5f9', fontWeight: 600 }}>Technical Skills</p></div>
          <div>{(p?.technical_skills || []).map(s => <span key={s} style={badge('#6366f1')}>{s}</span>)}</div>
          {(p?.soft_skills || []).length > 0 && <>
            <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>Soft Skills</p>
            <div>{(p?.soft_skills || []).map(s => <span key={s} style={badge('#8b5cf6')}>{s}</span>)}</div>
          </>}
        </div>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><Award size={14} color="#f59e0b" /><p style={{ color: '#f1f5f9', fontWeight: 600 }}>Strengths</p></div>
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            {(p?.strengths || []).map(s => <li key={s} style={{ color: '#94a3b8', fontSize: 13, marginBottom: 5 }}>{s}</li>)}
          </ul>
          {(p?.certifications || []).length > 0 && <>
            <p style={{ color: '#f1f5f9', fontWeight: 600, marginTop: 14, marginBottom: 8 }}>Certifications</p>
            <div>{(p?.certifications || []).map(c => <span key={c} style={badge('#22c55e')}>{c}</span>)}</div>
          </>}
        </div>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><BookOpen size={14} color="#ef4444" /><p style={{ color: '#f1f5f9', fontWeight: 600 }}>ATS Missing Keywords</p></div>
          <div style={{ marginBottom: 12 }}>{(ats.missing_keywords || []).map(k => <span key={k} style={badge('#ef4444')}>{k}</span>)}</div>
          <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Quick Fixes</p>
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            {(ats.improvements || []).slice(0, 4).map(i => <li key={i} style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>{i}</li>)}
          </ul>
        </div>

        <div style={card}>
          <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 12 }}>Projects</p>
          {(p?.projects || []).map(proj => (
            <div key={proj.title} style={{ marginBottom: 14 }}>
              <p style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{proj.title}</p>
              <p style={{ color: '#64748b', fontSize: 12, margin: '3px 0 6px' }}>{proj.description}</p>
              <div>{(proj.tech || []).map(t => <span key={t} style={badge('#0ea5e9')}>{t}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

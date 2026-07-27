import React from 'react';
import { useResume } from '../hooks/useApi';

const card: React.CSSProperties = { background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' };
const DIFF_COLOR: Record<string, string> = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };

export default function SkillGap() {
  const { data: resume, isLoading } = useResume();
  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#64748b' }}>Loading...</div>;
  if (!resume) return <div style={{ padding: 28, color: '#64748b' }}>Upload a resume first.</div>;

  const gaps = resume.skill_gaps?.gaps || [];
  const currentSkills = resume.parsed_data?.technical_skills || [];

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>
      <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Skill Gap Analysis</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={card}>
          <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 10 }}>Current Skills</p>
          <div>{currentSkills.map(s => <span key={s} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: '#22c55e22', color: '#22c55e', fontSize: 12, margin: '2px 3px' }}>{s}</span>)}</div>
        </div>
        <div style={card}>
          <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 10 }}>Missing Skills (Priority Order)</p>
          <div>{gaps.map(g => <span key={g.skill} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: '#ef444422', color: '#ef4444', fontSize: 12, margin: '2px 3px' }}>{g.skill}</span>)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {gaps.map((gap, i) => (
          <div key={gap.skill} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 26, height: 26, borderRadius: 6, background: '#6366f122', color: '#6366f1', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>{gap.skill}</span>
              </div>
              <span style={{ color: DIFF_COLOR[gap.difficulty] || '#94a3b8', fontSize: 12, fontWeight: 600 }}>{gap.difficulty}</span>
            </div>

            <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
              <div>
                <p style={{ color: '#475569', fontSize: 11, marginBottom: 4 }}>IMPORTANCE</p>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: 10 }, (_, j) => (
                    <div key={j} style={{ width: 8, height: 8, borderRadius: 2, background: j < gap.importance ? '#6366f1' : '#334155' }} />
                  ))}
                </div>
              </div>
              <div>
                <p style={{ color: '#475569', fontSize: 11, marginBottom: 4 }}>LEARN IN</p>
                <p style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{gap.learning_weeks}w</p>
              </div>
            </div>

            {(gap.resources || []).length > 0 && (
              <ul style={{ paddingLeft: 14, margin: 0 }}>
                {gap.resources.map(r => <li key={r} style={{ color: '#94a3b8', fontSize: 12, marginBottom: 3 }}>{r}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

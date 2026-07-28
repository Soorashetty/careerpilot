import { useResume } from '../hooks/useApi';

export default function Roadmap() {
  const { data: resume, isLoading } = useResume();
  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#64748b' }}>Loading...</div>;
  if (!resume) return <div style={{ padding: 28, color: '#64748b' }}>Upload a resume first.</div>;

  const weeks = resume.roadmap?.weeks || [];

  return (
    <div style={{ padding: 28, maxWidth: 860, margin: '0 auto' }}>
      <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 28 }}>Learning Roadmap</h2>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: '#334155' }} />
        {weeks.map(week => (
          <div key={week.week} style={{ display: 'flex', gap: 20, marginBottom: 20, position: 'relative' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              fontSize: 12, fontWeight: 700, color: '#fff', zIndex: 1,
            }}>W{week.week}</div>
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 18, border: '1px solid #334155', flex: 1 }}>
              <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{week.topic}</p>
              {week.project && <p style={{ color: '#6366f1', fontSize: 12, marginBottom: 8 }}>🛠 Project: {week.project}</p>}
              <ul style={{ paddingLeft: 14, margin: 0 }}>
                {(week.resources || []).map(r => <li key={r} style={{ color: '#94a3b8', fontSize: 12, marginBottom: 3 }}>{r}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


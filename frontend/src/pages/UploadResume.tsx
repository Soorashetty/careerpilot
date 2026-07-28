import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Loader2, AlertCircle, CheckCircle2, FileText, Zap, Briefcase, MessageSquare } from 'lucide-react';
import { useUploadResume } from '../hooks/useApi';

const features = [
  { icon: FileText, label: 'ATS Score', desc: 'Know your resume strength' },
  { icon: Briefcase, label: 'Job Matches', desc: 'Top matching roles' },
  { icon: Zap, label: 'Skill Gap', desc: 'What to learn next' },
  { icon: MessageSquare, label: 'Interview Prep', desc: 'AI-generated questions' },
];

export default function UploadResume() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useUploadResume();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    setError(''); setSuccess(false);
    try {
      await mutateAsync(file);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Upload failed. Please try again.');
    }
  }

  return (
    <div style={{ minHeight: '100%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ color: '#f1f5f9', fontSize: 32, fontWeight: 800, marginBottom: 10 }}>Upload Your Resume</h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>AI will analyze it and build your complete career profile</p>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
          onClick={() => !isPending && inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#6366f1' : '#334155'}`,
            borderRadius: 16, padding: '56px 32px', textAlign: 'center',
            cursor: isPending ? 'not-allowed' : 'pointer', transition: 'all .2s',
            background: dragging ? '#6366f111' : '#1e293b',
          }}
        >
          <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} />

          {isPending ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <Loader2 size={44} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 15 }}>Analyzing your resume with AI...</p>
              <p style={{ color: '#64748b', fontSize: 13 }}>This may take 20–30 seconds</p>
            </div>
          ) : success ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <CheckCircle2 size={44} color="#22c55e" />
              <p style={{ color: '#22c55e', fontWeight: 600, fontSize: 15 }}>Analysis complete! Redirecting...</p>
            </div>
          ) : (
            <>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: '#6366f122', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Upload size={28} color="#6366f1" />
              </div>
              <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Drop your resume here</p>
              <p style={{ color: '#64748b', fontSize: 13 }}>PDF, DOCX, TXT · Max 5MB · Click to browse</p>
            </>
          )}
        </div>

        {error && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 10, background: '#ef444422', border: '1px solid #ef444466', borderRadius: 10, padding: '12px 16px' }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ color: '#fca5a5', fontSize: 13 }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 28 }}>
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} style={{ background: '#1e293b', borderRadius: 12, padding: '14px 16px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Icon size={14} color="#6366f1" />
                <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{label}</span>
              </div>
              <p style={{ color: '#64748b', fontSize: 12 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}


import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Upload, Briefcase, Zap,
  Map, MessageSquare, FileEdit, ClipboardList, LogOut
} from 'lucide-react';

const NAV = [
  { to: '/upload', label: 'Upload Resume', icon: Upload },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Job Matches', icon: Briefcase },
  { to: '/skill-gap', label: 'Skill Gap', icon: Zap },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/interview', label: 'Interview Prep', icon: MessageSquare },
  { to: '/resume-ai', label: 'Resume AI', icon: FileEdit },
  { to: '/tracker', label: 'Applications', icon: ClipboardList },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 224, height: '100vh', background: '#0f172a',
        borderRight: '1px solid #1e293b', display: 'flex',
        flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Briefcase size={16} color="#fff" />
            </div>
            <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 17 }}>CareerPilot</span>
          </div>
          <p style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>AI Career Copilot</p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
              fontSize: 13, fontWeight: isActive ? 600 : 400, transition: 'all .15s',
              background: isActive ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
              color: isActive ? '#fff' : '#94a3b8',
            })}>
              {({ isActive }) => (
                <>
                  <Icon size={15} color={isActive ? '#fff' : '#64748b'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: '#6366f122', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#6366f1', fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ color: '#475569', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#64748b', fontSize: 13, transition: 'all .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = '#1e293b'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', height: '100vh' }}>
        {children}
      </main>
    </div>
  );
}

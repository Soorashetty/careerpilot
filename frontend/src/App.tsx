import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadResume from './pages/UploadResume';
import Dashboard from './pages/Dashboard';
import JobMatches from './pages/JobMatches';
import SkillGap from './pages/SkillGap';
import Roadmap from './pages/Roadmap';
import InterviewPrep from './pages/InterviewPrep';
import ResumeAI from './pages/ResumeAI';
import ApplicationTracker from './pages/ApplicationTracker';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } },
});

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/upload" element={<UploadResume />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<JobMatches />} />
              <Route path="/skill-gap" element={<SkillGap />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/interview" element={<InterviewPrep />} />
              <Route path="/resume-ai" element={<ResumeAI />} />
              <Route path="/tracker" element={<ApplicationTracker />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

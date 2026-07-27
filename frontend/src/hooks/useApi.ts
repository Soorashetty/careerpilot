import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { Resume, Job, Application, Notification } from '../types';

export function useResume() {
  return useQuery<Resume>({
    queryKey: ['resume'],
    queryFn: () => api.get('/resume/active').then(r => r.data),
    retry: false,
  });
}

export function useUploadResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return api.post<Resume>('/resume/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
    },
    onSuccess: (data) => qc.setQueryData(['resume'], data),
  });
}

export function useTailorResume(resumeId: number) {
  return useMutation({
    mutationFn: (job_description: string) => api.post(`/resume/${resumeId}/tailor`, { job_description }).then(r => r.data),
  });
}

export function useCoverLetter(resumeId: number) {
  return useMutation({
    mutationFn: (payload: { job_title: string; company: string; job_description: string }) =>
      api.post(`/resume/${resumeId}/cover-letter`, payload).then(r => r.data),
  });
}

export function useMockInterview(resumeId: number) {
  return useMutation({
    mutationFn: (role: string) => api.post(`/resume/${resumeId}/mock-interview`, { role }).then(r => r.data),
  });
}

export function useRecommendedJobs() {
  return useQuery<Job[]>({ queryKey: ['jobs', 'recommended'], queryFn: () => api.get('/jobs/recommended').then(r => r.data) });
}

export function useSearchJobs(params: { q?: string; location?: string; remote?: boolean; page?: number }) {
  return useQuery<Job[]>({
    queryKey: ['jobs', 'search', params],
    queryFn: () => api.get('/jobs/search', { params }).then(r => r.data),
  });
}

export function useApplications() {
  return useQuery<Application[]>({ queryKey: ['applications'], queryFn: () => api.get('/applications').then(r => r.data) });
}

export function useAddApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Application, 'id' | 'applied_at' | 'updated_at'>) => api.post('/applications', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; status?: string; notes?: string }) => api.patch(`/applications/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/applications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });
}

export function useNotifications() {
  return useQuery<Notification[]>({ queryKey: ['notifications'], queryFn: () => api.get('/notifications').then(r => r.data) });
}

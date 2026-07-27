export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ParsedResume {
  name: string;
  email: string;
  phone?: string;
  graduation_year?: string;
  preferred_role?: string;
  education: { degree: string; branch: string; institution: string; year: string; cgpa?: string }[];
  technical_skills: string[];
  soft_skills: string[];
  projects: { title: string; description: string; tech: string[] }[];
  internships: { role: string; company: string; duration: string; description: string }[];
  certifications: string[];
  experience: { role: string; company: string; duration: string; description: string }[];
  strengths: string[];
}

export interface ATSReport {
  score: number;
  missing_keywords: string[];
  improvements: string[];
  summary_suggestion: string;
}

export interface JobMatch {
  job_title: string;
  company: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  salary_range: string;
  apply_url: string;
  location: string;
  remote: boolean;
  reason: string;
  career_growth: string;
}

export interface SkillGap {
  skill: string;
  importance: number;
  difficulty: string;
  learning_weeks: number;
  resources: string[];
}

export interface RoadmapWeek {
  week: number;
  topic: string;
  resources: string[];
  project?: string;
}

export interface Resume {
  id: number;
  filename: string;
  ats_score: number | null;
  parsed_data: ParsedResume;
  ats_report: ATSReport;
  skill_gaps: { gaps: SkillGap[] };
  roadmap: { weeks: RoadmapWeek[] };
  job_matches: { matches: JobMatch[] };
  interview_questions: { hr: string[]; technical: string[]; coding: string[] };
  improvements: { items: { section: string; suggestion: string }[]; certifications: string[]; github_projects: string[] };
  career_prediction: { current_match: number; after_learning: number; current_salary: string; after_salary: string; skill_to_learn: string };
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location?: string;
  remote: boolean;
  description: string;
  required_skills: string[];
  salary_min?: number;
  salary_max?: number;
  apply_url?: string;
  posted_at?: string;
}

export type AppStatus = 'applied' | 'interview' | 'offered' | 'rejected';

export interface Application {
  id: number;
  job_title: string;
  company: string;
  status: AppStatus;
  apply_url?: string;
  notes?: string;
  applied_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  created_at: string;
}

export type UserRole = 'architect' | 'client';
export type ProjectStatus = 'active' | 'paused' | 'completed';
export type MilestoneStatus = 'pending' | 'in_progress' | 'done';
export type QuoteStatus = 'draft' | 'sent' | 'approved';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  plan: 'free' | 'pro';
  created_at: string;
}

export interface Client {
  id: string;
  architect_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  created_at: string;
}

export interface Project {
  id: string;
  architect_id: string;
  client_id?: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  portal_token: string;
  created_at: string;
  updated_at: string;
  clients?: Client;
  files?: ProjectFile[];
  milestones?: Milestone[];
  quotes?: Quote[];
  time_logs?: TimeLog[];
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  uploaded_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  due_date?: string;
  order_index: number;
  created_at: string;
}

export interface Quote {
  id: string;
  project_id: string;
  title: string;
  total: number;
  currency: string;
  status: QuoteStatus;
  notes?: string;
  created_at: string;
}
export interface TimeLog {
  id: string;
  project_id: string;
  milestone_id?: string;
  description: string;
  hours: number;
  date: string;
  created_at: string;
}

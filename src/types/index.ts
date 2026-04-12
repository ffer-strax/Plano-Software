export type UserRole = 'architect' | 'client';
export type ProjectStatus = 'active' | 'paused' | 'completed';
export type MilestoneStatus = 'pending' | 'in_progress' | 'done';
export type QuoteStatus = 'draft' | 'sent' | 'approved';
export type ColumnType = 'text' | 'number';

export interface QuoteItem {
  id: string;
  [key: string]: string | number;
}

export interface QuoteColumn {
  id: string;
  name: string;
  type: ColumnType;
}

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
  portal_pin?: string;
  created_at: string;
  updated_at: string;
  portal_show_roadmap?: boolean;
  portal_show_files?: boolean;
  portal_show_quotes?: boolean;
  clients?: Client;
  files?: ProjectFile[];
  milestones?: Milestone[];
  quotes?: Quote[];
  time_logs?: TimeLog[];
  users?: { full_name: string };
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  milestone_id?: string;
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
  notes?: MilestoneNote[];
  created_at: string;
}

export interface MilestoneNote {
  id: string;
  milestone_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  project_id: string;
  title: string;
  total: number;
  currency: string;
  status: QuoteStatus;
  notes?: string;
  milestone_id?: string;
  items?: QuoteItem[];
  columns?: QuoteColumn[];
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

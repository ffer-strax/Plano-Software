-- Migration: Add portal configuration columns to projects table
-- Created at: 2026-05-03

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS portal_show_roadmap boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS portal_show_files boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS portal_show_quotes boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS portal_show_milestone_dates boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS portal_show_milestone_notes boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS portal_show_milestone_files boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS portal_show_file_size boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS portal_show_file_download boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS portal_show_quote_breakdown boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS portal_show_quote_taxes boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS portal_pin text;

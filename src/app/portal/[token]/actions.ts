'use server';

import { createClient } from '@/lib/supabase/server';
import type { Milestone, ProjectFile } from '@/types';

export async function getPortalProject(token: string) {
  const supabase = createClient();
  
  // Use .select() without filtering by user session as it's a public route
  // Note: For extra security, one would add a "public" flag or similar 
  // but portal_token is our secret-link security for now.
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      users (
        full_name,
        avatar_url
      ),
      files (*),
      milestones (*),
      quotes (*)
    `)
    .eq('portal_token', token)
    .single();

  if (error) {
    console.error('Error fetching portal project:', error);
    return null;
  }

  // Pre-process items for presentation
  if (data.milestones) {
    data.milestones.sort((a: Milestone, b: Milestone) => (a.order_index || 0) - (b.order_index || 0));
  }
  
  if (data.files) {
    data.files.sort((a: ProjectFile, b: ProjectFile) => 
      new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
  }

  return data;
}

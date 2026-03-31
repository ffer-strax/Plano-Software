'use server';

import { createClient } from '@/lib/supabase/server';

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
    data.milestones.sort((a: any, b: any) => a.order_index - b.order_index);
  }
  
  if (data.files) {
    data.files.sort((a: any, b: any) => 
      new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
  }

  return data;
}

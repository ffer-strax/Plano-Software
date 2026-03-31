'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProjectDetail(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (*),
      files (*),
      milestones (*),
      quotes (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  // Order milestones by order_index
  if (data.milestones) {
    data.milestones.sort((a: any, b: any) => a.order_index - b.order_index);
  }

  // Pre-sort files
  if (data.files) {
    data.files.sort((a: any, b: any) => 
      new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
  }

  return data;
}

export async function uploadProjectFile(formData: FormData) {
  const supabase = createClient();
  const file = formData.get('file') as File;
  const projectId = formData.get('projectId') as string;

  if (!file || !projectId) return { error: 'Datos incompletos' };

  // 1. Upload to Supabase Storage
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = `${projectId}/${fileName}`;
  
  const { data: storageData, error: storageError } = await supabase.storage
    .from('project-files')
    .upload(filePath, file);

  if (storageError) return { error: storageError.message };

  // 2. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('project-files')
    .getPublicUrl(filePath);

  // 3. Register in Database
  const { error: dbError } = await supabase
    .from('files')
    .insert([
      {
        project_id: projectId,
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type,
      },
    ]);

  if (dbError) return { error: dbError.message };

  revalidatePath(`/project/${projectId}`);
  return { success: true };
}

export async function createMilestone(formData: FormData) {
  const supabase = createClient();
  const projectId = formData.get('projectId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const dueDate = formData.get('dueDate') as string;

  const { error } = await supabase
    .from('milestones')
    .insert([
      {
        project_id: projectId,
        title,
        description,
        due_date: dueDate || null,
        status: 'pending',
      },
    ]);

  if (error) return { error: error.message };

  revalidatePath(`/project/${projectId}`);
  return { success: true };
}

export async function updateMilestoneStatus(milestoneId: string, status: string, projectId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('milestones')
    .update({ status })
    .eq('id', milestoneId);

  if (error) return { error: error.message };

  revalidatePath(`/project/${projectId}`);
  return { success: true };
}

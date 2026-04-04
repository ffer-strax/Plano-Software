'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Milestone, ProjectFile } from '@/types';

export async function getProjectDetail(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (*),
      files (*),
      milestones (*),
      quotes (*),
      time_logs (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  // Order milestones by order_index
  if (data.milestones) {
    data.milestones.sort((a: Milestone, b: Milestone) => a.order_index - b.order_index);
  }

  // Pre-sort files
  if (data.files) {
    data.files.sort((a: ProjectFile, b: ProjectFile) => 
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
  
  const { error: storageError } = await supabase.storage
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

export async function deleteProjectFile(fileId: string, projectId: string) {
  const supabase = createClient();

  // 1. Get file details to get the path
  const { data: file, error: fetchError } = await supabase
    .from('files')
    .select('url')
    .eq('id', fileId)
    .single();

  if (fetchError || !file) return { error: 'Archivo no encontrado' };

  // Derivar el path relativo del bucket desde la URL pública
  // URL format: .../storage/v1/object/public/project-files/PROJECT_ID/FILE_NAME
  const urlParts = file.url.split('project-files/');
  const filePath = urlParts[urlParts.length - 1];

  if (filePath) {
    // 2. Delete from Storage
    const { error: storageError } = await supabase.storage
      .from('project-files')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
    }
  }

  // 3. Delete from Database
  const { error: dbError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);

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

  // Get current max order_index
  const { data: currentMilestones } = await supabase
    .from('milestones')
    .select('order_index')
    .eq('project_id', projectId)
    .order('order_index', { ascending: false })
    .limit(1);
    
  const nextOrderIndex = currentMilestones && currentMilestones.length > 0 
    ? (currentMilestones[0].order_index || 0) + 1 
    : 0;

  const { error } = await supabase
    .from('milestones')
    .insert([
      {
        project_id: projectId,
        title,
        description,
        due_date: dueDate || null,
        status: 'pending',
        order_index: nextOrderIndex,
      },
    ]);

  if (error) return { error: error.message };

  revalidatePath(`/project/${projectId}`);
  return { success: true };
}

export async function updateMilestone(formData: FormData) {
  const supabase = createClient();
  const milestoneId = formData.get('milestoneId') as string;
  const projectId = formData.get('projectId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const dueDate = formData.get('dueDate') as string;
  const status = formData.get('status') as string;

  const { error } = await supabase
    .from('milestones')
    .update({ 
      title, 
      description, 
      due_date: dueDate || null,
      status: status || 'pending'
    })
    .eq('id', milestoneId);

  if (error) return { error: error.message };

  revalidatePath(`/project/${projectId}`);
  return { success: true };
}

export async function deleteMilestone(milestoneId: string, projectId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', milestoneId);

  if (error) return { error: error.message };

  revalidatePath(`/project/${projectId}`);
  return { success: true };
}

export async function updateMilestonesOrder(milestoneIds: string[], projectId: string) {
  const supabase = createClient();

  // Perform bulk updates
  for (let i = 0; i < milestoneIds.length; i++) {
    await supabase
      .from('milestones')
      .update({ order_index: i })
      .eq('id', milestoneIds[i]);
  }

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

export async function createQuote(formData: FormData) {
  const supabase = createClient();
  const projectId = formData.get('projectId') as string;
  const title = formData.get('title') as string;
  const total = parseFloat(formData.get('total') as string) || 0;
  const currency = (formData.get('currency') as string) || 'MXN';
  const notes = formData.get('notes') as string;

  const { error } = await supabase
    .from('quotes')
    .insert([{ project_id: projectId, title, total, currency, status: 'draft', notes }]);

  if (error) return { error: error.message };

  revalidatePath(`/project/${projectId}`);
  return { success: true };
}

export async function updateQuote(formData: FormData) {
  const supabase = createClient();
  const quoteId = formData.get('quoteId') as string;
  const projectId = formData.get('projectId') as string;
  const title = formData.get('title') as string;
  const total = parseFloat(formData.get('total') as string) || 0;
  const status = formData.get('status') as string;
  const currency = (formData.get('currency') as string) || 'MXN';
  const notes = formData.get('notes') as string;

  const { error } = await supabase
    .from('quotes')
    .update({ title, total, status, currency, notes })
    .eq('id', quoteId);

  if (error) return { error: error.message };

  revalidatePath(`/project/${projectId}`);
  return { success: true };
}

export async function deleteQuote(quoteId: string, projectId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', quoteId);

  if (error) return { error: error.message };

  revalidatePath(`/project/${projectId}`);
  return { success: true };
}

export async function updateProject(formData: FormData) {
  const supabase = createClient();
  const projectId = formData.get('projectId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const status = formData.get('status') as string;
  const clientId = formData.get('clientId') as string;

  const { error } = await supabase
    .from('projects')
    .update({ 
      name, 
      description, 
      status,
      client_id: (clientId === 'none' || !clientId) ? null : clientId
    })
    .eq('id', projectId);

  if (error) return { error: error.message };

  revalidatePath(`/project/${projectId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function createTimeLog(formData: FormData) {
  const supabase = createClient();
  const projectId = formData.get('projectId') as string;
  const description = formData.get('description') as string;
  const hours = parseFloat(formData.get('hours') as string) || 0;
  const date = formData.get('date') as string;
  const milestoneId = formData.get('milestoneId') as string;

  const { error } = await supabase
    .from('time_logs')
    .insert([{ 
      project_id: projectId, 
      description, 
      hours, 
      date, 
      milestone_id: milestoneId === 'none' ? null : milestoneId 
    }]);

  if (error) return { error: error.message };

  revalidatePath(`/project/${projectId}`);
  return { success: true };
}

export async function deleteTimeLog(logId: string, projectId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('time_logs')
    .delete()
    .eq('id', logId);

  if (error) return { error: error.message };

  revalidatePath(`/project/${projectId}`);
  return { success: true };
}

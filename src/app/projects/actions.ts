'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Milestone } from '@/types';

export async function createProject(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autorizado' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const clientId = formData.get('clientId') as string;
  const template = formData.get('template') as string;

  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        architect_id: user.id,
        client_id: clientId || null,
        name,
        description,
        status: 'active',
      },
    ])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Seed milestones based on template
  if (template && template !== 'none') {
    let milestones: Partial<Milestone>[] = [];
    if (template === 'casa') {
      milestones = [
        { title: 'Levantamiento y Medidas', order_index: 0 },
        { title: 'Proyecto Esquemático', order_index: 1 },
        { title: 'Diseño Preliminar', order_index: 2 },
        { title: 'Planos Ejecutivos', order_index: 3 },
        { title: 'Presupuesto de Obra', order_index: 4 }
      ];
    } else if (template === 'remodelacion') {
      milestones = [
        { title: 'Moodboard y Concepto', order_index: 0 },
        { title: 'Propuesta de Materiales', order_index: 1 },
        { title: 'Planos de Demolición', order_index: 2 },
        { title: 'Planos de Acabados', order_index: 3 }
      ];
    } else if (template === 'comercial') {
      milestones = [
        { title: 'Análisis de Sitio / Local', order_index: 0 },
        { title: 'Zonificación', order_index: 1 },
        { title: 'Diseño de Fachada e Identidad', order_index: 2 },
        { title: 'Planos Técnicos', order_index: 3 },
        { title: 'Permisos Arrendatario', order_index: 4 }
      ];
    }

    if (milestones.length > 0) {
      const milestonesWithProject = milestones.map(m => ({
        ...m,
        project_id: data.id,
        status: 'pending'
      }));
      await supabase.from('milestones').insert(milestonesWithProject);
    }
  }

  revalidatePath('/dashboard');
  return { success: true, project: data };
}

export async function getProjects() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (
        name
      )
    `)
    .eq('architect_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data;
}

export async function getClients() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('architect_id', user.id)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }

  return data;
}

export async function createClientAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const company = formData.get('company') as string;

  const { error } = await supabase
    .from('clients')
    .insert([{ architect_id: user.id, name, email, phone, company }]);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateClient(formData: FormData) {
  const supabase = createClient();
  const clientId = formData.get('clientId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const company = formData.get('company') as string;

  const { error } = await supabase
    .from('clients')
    .update({ name, email, phone, company })
    .eq('id', clientId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteClient(clientId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { success: true };
}

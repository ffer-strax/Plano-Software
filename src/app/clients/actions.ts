'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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

  revalidatePath('/clients');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteClientAction(clientId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
    .eq('architect_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/clients');
  revalidatePath('/dashboard');
  return { success: true };
}

import { getClients } from '@/app/projects/actions';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { ClientTable } from '@/components/clients/ClientTable';

export default async function ClientsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const clients = await getClients();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userEmail={user.email} />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ClientTable clients={clients} />
      </main>
    </div>
  );
}

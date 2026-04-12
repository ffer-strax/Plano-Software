import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Navbar';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar userEmail={user.email} />

      <main className="md:ml-52 p-8">
        <div className="mb-10 text-center py-20">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configuración — próximamente
          </p>
        </div>
      </main>
    </div>
  );
}

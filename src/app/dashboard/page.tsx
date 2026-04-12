import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Navbar';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { getProjects, getClients } from '@/app/projects/actions';
import { Badge } from '@/components/ui/badge';
import { Folder, ArrowRight, FileText, Clock } from 'lucide-react';
import Link from 'next/link';
import { DashboardSearch } from '@/components/dashboard/DashboardSearch';
import type { Client } from '@/types';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const projects = await getProjects();
  const clients = await getClients();

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalProjects = projects.length;
  // Note: we don't have access to all quotes here without changing logic, so we show 0 or a dash
  const pendingQuotes = 0; 

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar userEmail={user.email} />

      <main className="md:ml-52 p-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Panel Principal</h1>
            <p className="text-sm text-slate-500 mt-1">
              Gestiona tus proyectos de arquitectura
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DashboardSearch />
            <CreateProjectDialog clients={clients} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Proyectos Activos</p>
              <h3 className="text-3xl font-bold text-slate-900">{activeProjects}</h3>
            </div>
            <div className="h-12 w-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
              <Folder className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Cotizaciones Pendientes</p>
              <h3 className="text-3xl font-bold text-slate-900">{pendingQuotes}</h3>
            </div>
            <div className="h-12 w-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total de Proyectos</p>
              <h3 className="text-3xl font-bold text-slate-900">{totalProjects}</h3>
            </div>
            <div className="h-12 w-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>


        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <Folder className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">No hay proyectos aún</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-xs">
              Comienza creando tu primer proyecto para invitar a tus clientes y compartir archivos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {projects.map((project) => (
              <Link 
                key={project.id} 
                href={`/project/${project.id}`}
                className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {project.name}
                  </h3>
                  <Badge 
                    className={project.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-slate-50 text-slate-600 border-slate-100'
                    }
                  >
                    {project.status === 'active' ? 'Activo' : project.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                  <span className="font-medium">
                    {(project.clients as unknown as Client)?.name || 'Sin cliente asignado'}
                  </span>
                </div>

                <p className="text-sm text-slate-600 mb-6 line-clamp-2">
                  {project.description || 'Sin descripción disponible.'}
                </p>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(project.created_at).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

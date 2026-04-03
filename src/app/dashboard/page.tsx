import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { getProjects, getClients } from '@/app/projects/actions';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Folder, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Client } from '@/types';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const projects = await getProjects();
  const clients = await getClients();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userEmail={user.email} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mis Proyectos</h1>
            <p className="mt-1 text-sm text-slate-500">
              Gestiona tus proyectos y portal de clientes desde aquí.
            </p>
          </div>
          <CreateProjectDialog clients={clients} />
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <Folder className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No tienes proyectos aún</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-xs">
              Comienza creando tu primer proyecto para invitar a tus clientes y compartir archivos.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-[300px]">Nombre del Proyecto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-slate-50/30 group">
                    <TableCell className="font-medium text-slate-900">
                      {project.name}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {(project.clients as unknown as Client)?.name || (
                        <span className="text-slate-400 italic text-xs">Sin cliente asignado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={project.status === 'active' ? 'default' : 'secondary'}
                        className={project.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50' : ''}
                      >
                        {project.status === 'active' ? 'Activo' : project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(project.created_at).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link 
                        href={`/project/${project.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-slate-900 transition-colors"
                      >
                        Gestionar
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}

import { getProjectDetail } from './actions';
import { Sidebar } from '@/components/layout/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilesTab } from '@/components/projects/detail/FilesTab';
import { RoadmapTab } from '@/components/projects/detail/RoadmapTab';
import { QuoteTab } from '@/components/projects/detail/QuoteTab';
import { EditProjectDialog } from '@/components/projects/detail/EditProjectDialog';
import { createClient } from '@/lib/supabase/server';
import { getClients } from '@/app/projects/actions';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mail, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import type { Client, Project } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { PortalSettingsTab } from '@/components/projects/detail/PortalSettingsTab';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const project = await getProjectDetail(params.id) as Project;
  const clients = await getClients();

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Proyecto no encontrado</h1>
        <Link href="/dashboard">
          <Button variant="outline">Volver al Dashboard</Button>
        </Link>
      </div>
    );
  }

  const clientInfo = project.clients as unknown as Client;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar userEmail={user.email || ''} />
      
      <main className="md:ml-52 p-8 pt-6">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Regresar al Dashboard
            </Link>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{project.name}</h1>
                <Badge 
                  className={project.status === 'active' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-3' 
                    : 'bg-slate-50 text-slate-600 border-slate-100 font-bold px-3'
                  }
                >
                  {project.status === 'active' ? 'Activo' : project.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-slate-500 text-sm">
                <div className="flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-700">{clientInfo?.name || 'Cliente sin asignar'}</span>
                </div>
                {clientInfo?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{clientInfo.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <EditProjectDialog project={project} clients={clients} />
          </div>
        </div>

        {/* Tabs Area */}
        <Tabs defaultValue="overview" className="space-y-10">
          <div className="border-b border-slate-200">
            <TabsList className="bg-transparent w-full justify-start rounded-none h-auto p-0 gap-1">
              <TabsTrigger 
                value="overview" 
                className="rounded-t-lg border-x border-t border-transparent data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-emerald-600 px-6 py-3 -mb-px text-sm font-bold text-slate-500 transition-all hover:bg-slate-100/50 data-[state=active]:shadow-sm"
              >
                Resumen
              </TabsTrigger>
              <TabsTrigger 
                value="roadmap" 
                className="rounded-t-lg border-x border-t border-transparent data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-emerald-600 px-6 py-3 -mb-px text-sm font-bold text-slate-500 transition-all hover:bg-slate-100/50 data-[state=active]:shadow-sm"
              >
                Roadmap ({project.milestones?.length || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="files" 
                className="rounded-t-lg border-x border-t border-transparent data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-emerald-600 px-6 py-3 -mb-px text-sm font-bold text-slate-500 transition-all hover:bg-slate-100/50 data-[state=active]:shadow-sm"
              >
                Archivos ({project.files?.length || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="quote" 
                className="rounded-t-lg border-x border-t border-transparent data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-emerald-600 px-6 py-3 -mb-px text-sm font-bold text-slate-500 transition-all hover:bg-slate-100/50 data-[state=active]:shadow-sm"
              >
                Cotización ({project.quotes?.length || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="portal" 
                className="rounded-t-lg border-x border-t border-transparent data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-emerald-600 px-6 py-3 -mb-px text-sm font-bold text-slate-500 transition-all hover:bg-slate-100/50 data-[state=active]:shadow-sm"
              >
                Portal del Cliente
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 focus-visible:outline-none">
                <Card className="border-slate-100 shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                    <CardTitle className="text-lg">Detalles del Proyecto</CardTitle>
                    <CardDescription>Información básica del proyecto</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                        <span className="text-slate-500">Nombre del Proyecto</span>
                        <span className="font-semibold text-slate-900">{project.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                        <span className="text-slate-500">Estado</span>
                        <Badge variant="outline" className="capitalize font-medium">{project.status === 'active' ? 'Activo' : project.status}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                        <span className="text-slate-500">Cliente</span>
                        <span className="font-semibold text-slate-900">{clientInfo?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Fecha de inicio</span>
                        <span className="font-semibold text-slate-900">
                          {new Date(project.created_at).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                    <CardTitle className="text-lg">Resumen de Contenido</CardTitle>
                    <CardDescription>Estado actual de los módulos</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-2xl font-bold text-slate-900">{project.milestones?.length || 0}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Hitos</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-2xl font-bold text-slate-900">{project.files?.length || 0}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Archivos</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-2xl font-bold text-slate-900">{project.quotes?.length || 0}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Cotizaciones</p>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                        <p className="text-2xl font-bold text-emerald-700">100%</p>
                        <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mt-1">Completado</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                  <CardTitle className="text-lg">Descripción</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-slate-600 leading-relaxed text-center italic">
                    {project.description || 'Sin descripción disponible.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="files" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-5xl mx-auto">
              <FilesTab projectId={project.id} files={project.files || []} />
            </div>
          </TabsContent>
          <TabsContent value="roadmap" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-4xl mx-auto">
              <RoadmapTab projectId={project.id} milestones={project.milestones || []} />
            </div>
          </TabsContent>
          <TabsContent value="quote" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-5xl mx-auto">
              <QuoteTab projectId={project.id} quotes={project.quotes || []} />
            </div>
          </TabsContent>
          <TabsContent value="portal" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <PortalSettingsTab project={project} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

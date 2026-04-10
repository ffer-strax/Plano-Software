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
  const client = project.clients as unknown as Client;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar userEmail={user.email || ''} />
      
      <main className="md:ml-52">
        <Tabs defaultValue="overview" className="space-y-0">
          {/* Sticky Header Section */}
          <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Link 
                    href="/dashboard" 
                    className="group flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-emerald-600 transition-colors mb-2"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1 transition-transform group-hover:-translate-x-1" />
                    Volver al Dashboard
                  </Link>
                  <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{project.name}</h1>
                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                      Activo
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">{client?.name || 'Cargando...'}</span>
                    </div>
                    <div className="h-3 w-px bg-slate-200" />
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">{client?.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <EditProjectDialog project={project} clients={clients} />
                </div>
              </div>

              <TabsList className="flex-start bg-transparent border-none p-0 h-auto gap-2 -mb-5 overflow-x-auto no-scrollbar">
                <TabsTrigger 
                  value="overview" 
                  className="rounded-t-xl border-x border-t border-transparent data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-emerald-600 px-6 py-3 -mb-px text-sm font-bold text-slate-500 transition-all hover:bg-white/50"
                >
                  Resumen
                </TabsTrigger>
                <TabsTrigger 
                  value="roadmap" 
                  className="rounded-t-xl border-x border-t border-transparent data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-emerald-600 px-6 py-3 -mb-px text-sm font-bold text-slate-500 transition-all hover:bg-white/50"
                >
                  Roadmap ({project.milestones?.length || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="files" 
                  className="rounded-t-xl border-x border-t border-transparent data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-emerald-600 px-6 py-3 -mb-px text-sm font-bold text-slate-500 transition-all hover:bg-white/50"
                >
                  Archivos ({project.files?.length || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="quote" 
                  className="rounded-t-xl border-x border-t border-transparent data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-emerald-600 px-6 py-3 -mb-px text-sm font-bold text-slate-500 transition-all hover:bg-white/50"
                >
                  Cotización ({project.quotes?.length || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="portal" 
                  className="rounded-t-xl border-x border-t border-transparent data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-emerald-600 px-6 py-3 -mb-px text-sm font-bold text-slate-500 transition-all hover:bg-white/50"
                >
                  Portal del Cliente
                </TabsTrigger>
              </TabsList>
            </div>
          </header>

          <div className="p-8">
            <TabsContent value="overview" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Project Info Card */}
                <div className="space-y-8">
                  <Card className="border-slate-100 shadow-sm overflow-hidden group">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-slate-400" />
                        <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest">Detalles del Proyecto</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-50">
                        <div className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors">
                          <span className="text-sm font-medium text-slate-500">Nombre del Proyecto</span>
                          <span className="text-sm font-bold text-slate-900">{project.name}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors">
                          <span className="text-sm font-medium text-slate-500">Estado</span>
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-3">Activo</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors">
                          <span className="text-sm font-medium text-slate-500">Cliente</span>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-slate-900">{client?.name || 'Cargando...'}</span>
                            <span className="text-[10px] text-slate-400">{client?.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors">
                          <span className="text-sm font-medium text-slate-500">Fecha de inicio</span>
                          <span className="text-sm font-semibold text-slate-600">
                            {new Date(project.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description Card */}
                  <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="py-4 px-6 border-b border-slate-100">
                      <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest">Descripción</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-slate-600 leading-relaxed italic text-sm">
                        {project.description || "No se ha proporcionado una descripción para este proyecto."}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Content Summary Card */}
                <div className="space-y-8">
                  <Card className="border-slate-100 shadow-sm h-full">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                      <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest">Resumen de Contenido</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center group hover:bg-white hover:shadow-md transition-all">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Hitos</p>
                          <span className="text-3xl font-black text-slate-900">{project.milestones?.length || 0}</span>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center group hover:bg-white hover:shadow-md transition-all">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Archivos</p>
                          <span className="text-3xl font-black text-slate-900">{project.files?.length || 0}</span>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center group hover:bg-white hover:shadow-md transition-all">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Cotizaciones</p>
                          <span className="text-3xl font-black text-slate-900">{project.quotes?.length || 0}</span>
                        </div>
                        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center group hover:shadow-md transition-all">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-2">Completado</p>
                          <span className="text-3xl font-black text-emerald-600">
                            {Math.round((project.milestones?.filter(m => m.status === 'done').length || 0) / (project.milestones?.length || 1) * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="roadmap" className="mt-0 focus-visible:outline-none">
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

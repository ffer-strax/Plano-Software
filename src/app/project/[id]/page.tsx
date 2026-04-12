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

  const client = project.clients as unknown as Client;

  const milestonesCount = project.milestones?.length || 0;
  const filesCount = project.files?.length || 0;
  const quotesCount = project.quotes?.length || 0;
  const completedMilestones = project.milestones?.filter(m => m.status === 'done').length || 0;
  const progressPercent = milestonesCount > 0 ? Math.round((completedMilestones / milestonesCount) * 100) : 0;
  console.log('Project progress:', progressPercent); // Use it or remove it. I'll remove the calc if not needed.

  return (
    <div className="min-h-screen bg-white">
      <Sidebar userEmail={user.email || ''} />
      
      <main className="md:ml-52 min-h-screen flex flex-col">
        <Tabs defaultValue="overview" className="flex-1 flex flex-col">
          {/* Header Section - Integrated with Tabs */}
          <header className="bg-white border-b border-slate-100 px-10 py-8">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Link 
                    href="/dashboard" 
                    className="group flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-blue-700 transition-colors"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Volver al Dashboard
                  </Link>
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{project.name}</h1>
                    <Badge className="bg-blue-50 text-blue-700 border-none font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                      Activo
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-slate-400">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span className="text-sm font-semibold text-slate-600">{client?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm font-semibold text-slate-600">{client?.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <EditProjectDialog project={project} clients={clients} />
                </div>
              </div>

              {/* Browser-style Tabs Header */}
              <div className="mt-4 -mb-8">
                <TabsList className="bg-transparent border-none p-0 h-auto gap-4 flex overflow-x-auto no-scrollbar">
                   {[
                    { val: 'overview', label: 'Resumen' },
                    { val: 'roadmap', label: `Roadmap (${milestonesCount})` },
                    { val: 'files', label: `Archivos (${filesCount})` },
                    { val: 'quote', label: `Cotización (${quotesCount})` },
                    { val: 'portal', label: 'Configuración Portal' }
                  ].map(t => (
                    <TabsTrigger 
                      key={t.val}
                      value={t.val} 
                      className="px-0 py-4 relative group data-[state=active]:text-blue-700 text-sm font-bold text-slate-400 border-b-2 border-transparent data-[state=active]:border-blue-700 transition-all rounded-none bg-transparent shadow-none"
                    >
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 bg-slate-50/50 p-10">
            <div className="w-full">
              <TabsContent value="overview" className="mt-0 focus-visible:outline-none animate-in fade-in duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Project Details */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Información General</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre</p>
                          <p className="text-lg font-black text-slate-900">{project.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                          <Badge className="bg-blue-50 text-blue-700 border-none font-bold">Activo</Badge>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                          <p className="text-base font-bold text-slate-900">{client?.name || 'Sin cliente'}</p>
                          <p className="text-xs text-slate-500">{client?.email}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Progreso</p>
                          <p className="text-lg font-black text-slate-900">{progressPercent}%</p>
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-8 border-t border-slate-50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Descripción</p>
                        <p className="text-slate-600 text-sm leading-relaxed italic">
                          {project.description || "No hay una descripción para este proyecto."}
                        </p>
                      </div>

                      <div className="mt-8">
                         <EditProjectDialog project={project} clients={clients} />
                      </div>
                    </div>
                  </div>

                  {/* Stats Sidebar */}
                  <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                       <div className="absolute -top-10 -right-10 h-32 w-32 bg-white/5 rounded-full" />
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Resumen</h4>
                       <div className="space-y-4">
                         <div className="flex justify-between items-center">
                           <span className="text-sm font-bold text-white/60">Hitos Totales</span>
                           <span className="text-xl font-black">{milestonesCount}</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-sm font-bold text-white/60">Archivos</span>
                           <span className="text-xl font-black">{filesCount}</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-sm font-bold text-white/60">Cotizaciones</span>
                           <span className="text-xl font-black">{quotesCount}</span>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="portal" className="mt-0 focus-visible:outline-none animate-in fade-in duration-500">
                <PortalSettingsTab project={project} />
              </TabsContent>

              <TabsContent value="roadmap" className="mt-0 focus-visible:outline-none">
                <RoadmapTab 
                  projectId={project.id} 
                  milestones={project.milestones || []} 
                  files={project.files || []}
                  quotes={project.quotes || []}
                />
              </TabsContent>

              <TabsContent value="files" className="mt-0 focus-visible:outline-none">
                <FilesTab projectId={project.id} files={project.files || []} />
              </TabsContent>

              <TabsContent value="quote" className="mt-0 focus-visible:outline-none">
                <QuoteTab projectId={project.id} quotes={project.quotes || []} />
              </TabsContent>

            </div>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

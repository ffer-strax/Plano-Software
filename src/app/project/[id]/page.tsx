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
import { ChevronLeft, Mail, User as UserIcon, BarChart3, Files, Receipt } from 'lucide-react';
import Link from 'next/link';
import type { Client, Project } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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
                    { val: 'portal', label: 'Portal del Cliente' }
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
                <div className="space-y-8">
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                          <BarChart3 className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progreso</p>
                          <h4 className="text-2xl font-black text-slate-900">{progressPercent}%</h4>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                          <BarChart3 className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hitos</p>
                          <h4 className="text-2xl font-black text-slate-900">{milestonesCount}</h4>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                          <Files className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Archivos</p>
                          <h4 className="text-2xl font-black text-slate-900">{filesCount}</h4>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                          <Receipt className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cotizaciones</p>
                          <h4 className="text-2xl font-black text-slate-900">{quotesCount}</h4>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Project Details */}
                    <Card className="lg:col-span-2 border-none shadow-sm bg-white">
                      <CardHeader className="border-b border-slate-50 px-8 py-6">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Detalles del Proyecto</h3>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                          {[
                            { label: 'Nombre del Proyecto', val: project.name },
                            { label: 'Estado', val: 'Activo', isBadge: true },
                            { label: 'Cliente', val: client?.name, sub: client?.email },
                            { label: 'Fecha de inicio', val: new Date(project.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) }
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between px-8 py-5">
                              <span className="text-sm font-bold text-slate-400">{item.label}</span>
                              <div className="text-right">
                                {item.isBadge ? (
                                  <Badge className="bg-blue-50 text-blue-700 border-none font-bold">{item.val}</Badge>
                                ) : (
                                  <>
                                    <p className="text-sm font-black text-slate-900">{item.val}</p>
                                    {item.sub && <p className="text-[10px] font-bold text-slate-400">{item.sub}</p>}
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Description */}
                    <Card className="border-none shadow-sm bg-white">
                      <CardHeader className="border-b border-slate-50 px-8 py-6">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Descripción</h3>
                      </CardHeader>
                      <CardContent className="p-8">
                        <p className="text-slate-500 text-sm leading-relaxed italic">
                          {project.description || "No se ha proporcionado una descripción para este proyecto."}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
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

              <TabsContent value="portal" className="mt-0 focus-visible:outline-none">
                <PortalSettingsTab project={project} />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

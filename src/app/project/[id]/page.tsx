import { getProjectDetail } from './actions';
import { Navbar } from '@/components/layout/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilesTab } from '@/components/projects/detail/FilesTab';
import { RoadmapTab } from '@/components/projects/detail/RoadmapTab';
import { QuoteTab } from '@/components/projects/detail/QuoteTab';
import { TimeTab } from '@/components/projects/detail/TimeTab';
import { CopyPortalLink } from '@/components/projects/detail/CopyPortalLink';
import { EditProjectDialog } from '@/components/projects/detail/EditProjectDialog';
import { createClient } from '@/lib/supabase/server';
import { getClients } from '@/app/projects/actions';
import { Button } from '@/components/ui/button';
import { ChevronLeft, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import type { Client, Project } from '@/types';

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

  const portalLink = `/portal/${project.portal_token}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar userEmail={user.email || ''} />

      {/* Header Detail */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2"
            >
              <ChevronLeft className="mr-1 h-3 w-3" />
              Regresar a Mis Proyectos
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{project.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500">
                {(project.clients as unknown as Client)?.name || 'Sin Cliente'}
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <span className="text-xs text-slate-400 capitalize">{project.status}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <EditProjectDialog project={project} clients={clients} />
            <CopyPortalLink link={portalLink} />
            <Link href={portalLink} target="_blank">
              <Button variant="default" className="bg-slate-900 border-transparent hover:bg-slate-800 text-white">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Vista Cliente
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Tabs defaultValue="files" className="space-y-8">
          <div className="flex justify-start overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="bg-white border p-0.5 h-11 sm:p-1 sm:h-12">
              <TabsTrigger value="files" className="px-4 sm:px-8 h-10 data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
                Archivos
              </TabsTrigger>
              <TabsTrigger value="roadmap" className="px-4 sm:px-8 h-10 data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="quote" className="px-4 sm:px-8 h-10 data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
                Cotización
              </TabsTrigger>
              <TabsTrigger value="time" className="px-4 sm:px-8 h-10 data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
                Tiempo
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="files" className="mt-0 focus-visible:outline-none">
            <FilesTab projectId={project.id} files={project.files || []} />
          </TabsContent>
          <TabsContent value="roadmap" className="mt-0 focus-visible:outline-none">
            <RoadmapTab projectId={project.id} milestones={project.milestones || []} />
          </TabsContent>
          <TabsContent value="quote" className="mt-0 focus-visible:outline-none">
            <QuoteTab projectId={project.id} quotes={project.quotes || []} />
          </TabsContent>
          <TabsContent value="time" className="mt-0 focus-visible:outline-none">
            <TimeTab 
              projectId={project.id} 
              timeLogs={project.time_logs || []} 
              milestones={project.milestones || []} 
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

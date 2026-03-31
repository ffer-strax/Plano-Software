import { getPortalProject } from './actions';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { PortalContent } from '@/components/portal/PortalContent';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default async function PortalPage({ params }: { params: { token: string } }) {
  const project = await getPortalProject(params.token);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-2 italic">PLANO</h1>
        <div className="bg-white border p-12 rounded-3xl shadow-xl max-w-md w-full">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Portal no encontrado</h2>
          <p className="text-slate-500 mb-8">El enlace que has ingresado parece no válido o ha sido desactivado.</p>
          <div className="h-2 w-12 bg-slate-100 mx-auto rounded-full"></div>
        </div>
      </div>
    );
  }

  const architectName = (project.users as any)?.full_name || 'Tu Arquitecto';

  return (
    <div className="min-h-screen bg-slate-50">
      <PortalHeader 
        projectName={project.name} 
        architectName={architectName} 
      />

      <main>
        <PortalContent 
          files={project.files}
          milestones={project.milestones}
          quotes={project.quotes}
        />
      </main>

      <footer className="py-12 border-t border-slate-200 mt-20">
        <div className="mx-auto max-w-lg text-center px-4">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">Potenciado por</p>
          <span className="text-2xl font-black text-slate-900 italic">PLANO</span>
          <p className="text-xs text-slate-400 mt-3">Gestión profesional de arquitectura y construcción.</p>
        </div>
      </footer>
    </div>
  );
}

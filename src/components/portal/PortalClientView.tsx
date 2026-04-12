'use client';

import { useState, useEffect } from 'react';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { PortalContent } from '@/components/portal/PortalContent';
import { PortalLogin } from '@/components/portal/PortalLogin';
import Link from 'next/link';
import type { Project } from '@/types';

interface PortalClientViewProps {
  project: Project;
}

export function PortalClientView({ project }: PortalClientViewProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no pin is required, we are authenticated
    if (!project.portal_pin) {
      setIsAuthenticated(true);
    } else {
      // Check session storage
      const sessionKey = `portal_auth_${project.portal_pin}`;
      if (sessionStorage.getItem(sessionKey)) {
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  }, [project.portal_pin]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="h-2 w-12 bg-slate-200 animate-pulse rounded-full" />
    </div>
  );

  if (!isAuthenticated && project.portal_pin) {
    return (
      <PortalLogin 
        correctPin={project.portal_pin} 
        projectName={project.name}
        onSuccess={() => setIsAuthenticated(true)}
      />
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 animate-in fade-in duration-700">
      <PortalHeader 
        projectName={project.name} 
      />

      <main>
        <PortalContent 
          projectName={project.name}
          projectStatus={project.status}
          files={project.files || []}
          milestones={project.milestones || []}
          quotes={project.quotes || []}
          showRoadmap={project.portal_show_roadmap ?? true}
          showFiles={project.portal_show_files ?? true}
          showQuotes={project.portal_show_quotes ?? true}
        />
      </main>

      <footer className="py-16 md:py-20 border-t border-slate-200 mt-20 relative overflow-hidden">
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-40 bg-slate-100/50 rounded-full blur-3xl -z-10" />
        <div className="mx-auto max-w-lg text-center px-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6">Potenciado por</p>
          <div className="flex flex-col items-center group cursor-default">
            <span className="text-4xl font-black text-slate-900 italic tracking-tighter transition-all group-hover:tracking-normal">PLANO</span>
            <div className="h-1 w-12 bg-slate-900 mt-1 rounded-full group-hover:w-20 transition-all duration-500" />
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-6 max-w-[200px] mx-auto leading-relaxed">Gestión profesional de arquitectura y construcción.</p>
          
          <div className="mt-10 pt-10 border-t border-slate-100">
            <Link href="/" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors text-decoration-none">
              plano.mx
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

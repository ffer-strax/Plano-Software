'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  FileIcon, 
  Download, 
  Clock, 
  CheckCircle2, 
  PlayCircle,
  Receipt,
  AlertCircle
} from 'lucide-react';
import type { ProjectFile, Milestone, Quote } from '@/types';

interface PortalContentProps {
  files: ProjectFile[];
  milestones: Milestone[];
  quotes: Quote[];
}

export function PortalContent({ files, milestones, quotes }: PortalContentProps) {
  const completedCount = milestones.filter(m => m.status === 'done').length;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;
  const latestQuote = quotes[0];

  function formatSize(bytes?: number) {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    return kb > 1000 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'done': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-slate-300" />;
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left Side: Navigation Tabs */}
        <div className="flex-1 space-y-10">
          <Tabs defaultValue="roadmap" className="w-full">
            <div className="flex justify-center md:justify-start mb-8">
              <TabsList className="bg-white border p-1 h-12">
                <TabsTrigger value="roadmap" className="px-8 h-10 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                  Avance
                </TabsTrigger>
                <TabsTrigger value="files" className="px-8 h-10 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                  Documentos
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ROADMAP CONTENT */}
            <TabsContent value="roadmap" className="space-y-8 focus-visible:outline-none">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">Estado del Proyecto</h2>
                    <p className="text-sm text-slate-500">
                      Progreso visual basado en las etapas acordadas.
                    </p>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex flex-col items-center min-w-[100px]">
                    <span className="text-xs font-bold text-slate-400 uppercase">Completado</span>
                    <span className="text-2xl font-black text-slate-900">{Math.round(progress)}%</span>
                  </div>
                </div>
                <Progress value={progress} className="h-3 bg-slate-100" />
              </div>

              <div className="space-y-4">
                {milestones.length === 0 ? (
                  <p className="py-20 text-center text-slate-400 italic">No hay etapas definidas aún.</p>
                ) : (
                  milestones.map((milestone) => (
                    <div key={milestone.id} className="flex gap-4 p-5 rounded-xl border border-slate-100 bg-white hover:border-slate-300 transition-colors">
                      <div className="mt-1">{getStatusIcon(milestone.status)}</div>
                      <div className="space-y-1">
                        <h4 className={`font-bold text-slate-900 ${milestone.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                          {milestone.title}
                        </h4>
                        {milestone.description && (
                          <p className="text-sm text-slate-500">{milestone.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* FILES CONTENT */}
            <TabsContent value="files" className="space-y-6 focus-visible:outline-none">
              <div className="grid gap-3">
                {files.length === 0 ? (
                  <Card className="border-dashed flex flex-col items-center justify-center p-20 text-slate-400 italic">
                    No se han subido documentos para este acceso.
                  </Card>
                ) : (
                  files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-5 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-slate-300 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                          <FileIcon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{file.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                            {file.type?.split('/')[1] || 'ARCHIVO'} • {formatSize(file.size)}
                          </span>
                        </div>
                      </div>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <div className="h-10 w-10 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
                          <Download className="h-4 w-4" />
                        </div>
                      </a>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side: Quick Info (Quote) */}
        <div className="w-full md:w-[320px] shrink-0">
          <div className="sticky top-32 space-y-6">
            {latestQuote ? (
              <Card className="shadow-lg border-2 border-slate-900/5 bg-slate-900 text-white rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Receipt className="h-5 w-5 text-slate-400" />
                    <Badge className="bg-white/10 text-white border-white/20 text-[10px] uppercase">
                      {latestQuote.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 mt-2">Cotización</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-3xl font-black mb-1">${latestQuote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{latestQuote.currency}</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed bg-slate-50 border-slate-200">
                <CardContent className="p-8 text-center text-slate-400 italic text-sm">
                  Sin presupuesto activo.
                </CardContent>
              </Card>
            )}

            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">¿Tienes dudas?</h4>
              <p className="text-sm text-slate-500">Contacta a tu arquitecto para comentarios o ajustes en el proyecto.</p>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <AlertCircle className="h-4 w-4 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-900 uppercase">Aprobación mediante Portal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

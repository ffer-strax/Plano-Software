'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileIcon, 
  Download, 
  Clock, 
  CheckCircle2, 
  PlayCircle,
  Receipt,
  AlertCircle,
  Calendar,
  Layers,
  FileDown
} from 'lucide-react';
import type { ProjectFile, Milestone, Quote, ProjectStatus } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PortalContentProps {
  projectName: string;
  projectStatus: ProjectStatus;
  files: ProjectFile[];
  milestones: Milestone[];
  quotes: Quote[];
}

export function PortalContent({ projectName, projectStatus, files, milestones, quotes }: PortalContentProps) {
  const completedCount = milestones.filter(m => m.status === 'done').length;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;
  
  // Sort quotes to get the newest and approved if possible
  const sortedQuotes = [...quotes].sort((a, b) => {
    if (a.status === 'approved') return -1;
    if (b.status === 'approved') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const latestQuote = sortedQuotes[0];

  function formatSize(bytes?: number) {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'done': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-slate-300" />;
    }
  }

  function getFileIcon(type?: string) {
    const t = type?.toLowerCase() || '';
    if (t.includes('pdf')) return <div className="p-2 bg-red-50 text-red-600 rounded-lg"><FileIcon className="h-5 w-5" /></div>;
    if (t.includes('image') || t.includes('jpg') || t.includes('png')) return <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Layers className="h-5 w-5" /></div>;
    return <div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><FileIcon className="h-5 w-5" /></div>;
  }

  const translateStatus = (status: ProjectStatus) => {
    const map: Record<ProjectStatus, string> = {
      active: 'Activo',
      paused: 'En Pausa',
      completed: 'Finalizado'
    };
    return map[status] || status;
  };

  const downloadPDF = () => {
    if (!latestQuote) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PLANO', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('COTIZACIÓN DE PROYECTO', pageWidth - 20, 25, { align: 'right' });

    // Project Info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(latestQuote.title, 20, 60);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Proyecto: ${projectName}`, 20, 70);
    doc.text(`Fecha: ${new Date(latestQuote.created_at).toLocaleDateString('es-MX')}`, 20, 75);
    doc.text(`Estado: ${latestQuote.status === 'approved' ? 'Aprobado' : 'Pendiente'}`, 20, 80);

    // Table
    autoTable(doc, {
      startY: 90,
      head: [['Descripción', 'Total']],
      body: [
        [latestQuote.title, `${latestQuote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${latestQuote.currency}`]
      ],
      headStyles: { fillColor: [15, 23, 42], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 20, right: 20 }
    });

    // Notes
    if (latestQuote.notes) {
      // @ts-expect-error - jspdf-autotable adds lastAutoTable to jsPDF instance
      const finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Notas del Arquitecto:', 20, finalY);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      const splitNotes = doc.splitTextToSize(latestQuote.notes, pageWidth - 40);
      doc.text(splitNotes, 20, finalY + 10);
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Generado profesionalmente por PLANO - plano.mx', pageWidth / 2, pageHeight - 15, { align: 'center' });

    doc.save(`cotizacion_${latestQuote.title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Side: Navigation Tabs */}
        <div className="flex-1 space-y-8 md:space-y-10">
          <Tabs defaultValue="roadmap" className="w-full">
            <div className="flex justify-center md:justify-start mb-6 md:mb-8">
              <TabsList className="bg-white border p-1 h-12 w-full md:w-auto shadow-sm rounded-xl overflow-hidden">
                <TabsTrigger value="roadmap" className="flex-1 md:flex-initial px-6 md:px-8 h-10 data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg transition-all">
                  Avance
                </TabsTrigger>
                <TabsTrigger value="files" className="flex-1 md:flex-initial px-6 md:px-8 h-10 data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg transition-all">
                  Documentos
                </TabsTrigger>
                {latestQuote && (
                  <TabsTrigger value="quote" className="flex-1 md:flex-initial px-6 md:px-8 h-10 data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg transition-all">
                    Presupuesto
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* ROADMAP CONTENT */}
            <TabsContent value="roadmap" className="space-y-8 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <PlayCircle className="h-24 w-24 text-slate-900" />
                </div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">Estado del Proyecto</h2>
                    <p className="text-sm text-slate-500">
                      Progreso visual de las etapas pactadas.
                    </p>
                  </div>
                  <div className="bg-slate-900 px-4 py-2 rounded-xl flex flex-col items-center min-w-[90px] shadow-lg">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{translateStatus(projectStatus)}</span>
                    <span className="text-2xl font-black text-white">{Math.round(progress)}%</span>
                  </div>
                </div>
                <Progress value={progress} className="h-3 bg-slate-100" />
                
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Etapas</p>
                    <p className="text-lg font-bold text-slate-900">{milestones.length}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Listas</p>
                    <p className="text-lg font-bold text-emerald-700">{completedCount}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1">En curso</p>
                    <p className="text-lg font-bold text-blue-700">{milestones.filter(m => m.status === 'in_progress').length}</p>
                  </div>
                  <div className="bg-white border border-slate-100 p-3 rounded-2xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pendientes</p>
                    <p className="text-lg font-bold text-slate-600">{milestones.filter(m => m.status === 'pending').length}</p>
                  </div>
                </div>
              </div>

              <div className="relative pl-6 md:pl-8 space-y-0 pb-10">
                {/* Vertical Line */}
                <div className="absolute left-2.5 md:left-3 top-2 bottom-0 w-0.5 bg-slate-100" />

                {milestones.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 italic bg-white border border-dashed rounded-3xl">
                    <Calendar className="h-10 w-10 mx-auto mb-4 text-slate-200" />
                    No hay etapas definidas aún.
                  </div>
                ) : (
                  milestones.map((milestone) => {
                    const isDone = milestone.status === 'done';
                    const isInProgress = milestone.status === 'in_progress';

                    return (
                      <div key={milestone.id} className="relative pb-10 last:pb-0 group">
                        {/* Milestone dot indicator */}
                        <div className={`absolute -left-[27px] md:-left-[27px] top-1.5 h-4 w-4 md:h-5 md:w-5 rounded-full border-4 border-white shadow-sm z-10 transition-all duration-300 ${
                          isDone ? 'bg-emerald-500 scale-100' : isInProgress ? 'bg-blue-500 animate-pulse scale-110' : 'bg-slate-200 group-hover:bg-slate-300'
                        }`} />

                        <div className={`rounded-2xl border transition-all duration-300 p-5 md:p-6 shadow-sm ${
                          isDone 
                            ? 'bg-slate-50/50 border-slate-100 opacity-70 grayscale-[0.3]' 
                            : isInProgress 
                              ? 'bg-blue-50/20 border-blue-100 shadow-blue-900/5 ring-1 ring-blue-500/10' 
                              : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`shrink-0 p-2 rounded-xl ${
                                isDone ? 'bg-emerald-100 text-emerald-600' : 
                                isInProgress ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {getStatusIcon(milestone.status)}
                              </div>
                              <h4 className={`font-bold text-base md:text-lg tracking-tight leading-tight ${
                                isDone ? 'text-slate-500' : 'text-slate-900'
                              }`}>
                                {milestone.title}
                              </h4>
                            </div>
                            
                            {milestone.due_date && (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full w-fit">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600">
                                  {new Date(milestone.due_date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            )}
                          </div>

                          {milestone.description && (
                            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl pl-12 md:pl-14">
                              {milestone.description}
                            </p>
                          )}
                          
                          {isInProgress && (
                            <div className="mt-4 flex items-center gap-2 pl-12 md:pl-14">
                              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">En curso actualmente</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>

            {/* FILES CONTENT */}
            <TabsContent value="files" className="space-y-6 focus-visible:outline-none animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.length === 0 ? (
                  <div className="col-span-full rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-20 text-slate-400 italic bg-white">
                    <FileIcon className="h-10 w-10 mb-4 text-slate-100" />
                    No se han compartido documentos aún.
                  </div>
                ) : (
                  files.map((file) => (
                    <div key={file.id} className="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group overflow-hidden">
                      <div className="flex items-center gap-4 relative z-10">
                        {getFileIcon(file.type)}
                        <div className="flex flex-col min-w-0 pr-10">
                          <span className="font-bold text-slate-900 truncate leading-tight mb-1">{file.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                            {file.type?.split('/')[1] || 'Archivo'} • {formatSize(file.size)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="absolute top-0 right-0 p-5 mt-1">
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="h-9 w-9 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all md:opacity-0 md:group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                          title="Descargar"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* QUOTE CONTENT (NEW PREMIUM VIEW) */}
            <TabsContent value="quote" className="space-y-6 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
              {latestQuote ? (
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
                  <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                      <Receipt className="h-40 w-40" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                      <div className="space-y-2">
                        <Badge className="bg-white/10 text-white border-white/20 uppercase text-[10px] tracking-widest px-3 py-1">
                          Cotización {latestQuote.status === 'approved' ? 'Aprobada' : 'Confirmada'}
                        </Badge>
                        <h2 className="text-3xl font-black">{latestQuote.title}</h2>
                        <p className="text-slate-400 text-sm">Resumen financiero detallado del proyecto.</p>
                      </div>
                      <div className="text-right flex flex-col items-start md:items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monto Total</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl md:text-5xl font-black tracking-tight">${latestQuote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                          <span className="text-sm font-bold text-slate-400">{latestQuote.currency}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {latestQuote.notes && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle className="h-3 w-3 text-slate-400" />
                          Notas del Arquitecto
                        </h4>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap italic">
                          &quot;{latestQuote.notes}&quot;
                        </div>
                      </div>
                    )}

                    <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Propuesta lista</p>
                          <p className="text-xs text-slate-500">Documento base para el inicio de obra.</p>
                        </div>
                      </div>
                      <Button 
                        onClick={downloadPDF}
                        className="w-full md:w-auto h-12 px-8 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                      >
                        Descargar PDF
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 italic bg-white border border-dashed rounded-3xl">
                  Sin presupuesto activo.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side: Quick Info (Sidebar) */}
        {!latestQuote && (
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="sticky top-24 md:top-32 space-y-6">
              <div className="p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm md:shadow-md space-y-6 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-slate-50 rounded-full -z-0 scale-0 group-hover:scale-100 transition-transform duration-500" />
                
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest relative z-10">¿Tienes dudas?</h4>
                <p className="text-sm text-slate-500 leading-relaxed relative z-10">
                  Contacta a tu arquitecto para comentarios o ajustes técnicos sobre el avance actual.
                </p>
                <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-2xl border border-slate-800 relative z-10 shadow-lg shadow-slate-900/10">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-[10px] leading-tight font-bold text-white uppercase tracking-wider">Aprobación mediante el portal activo</span>
                </div>
                
                <div className="pt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                    <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                    Actualizado hoy
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

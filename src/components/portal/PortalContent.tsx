'use client';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { 
  FileIcon, 
  Download, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Layers
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
  showRoadmap: boolean;
  showFiles: boolean;
  showQuotes: boolean;
  showMilestoneDates: boolean;
  showMilestoneNotes: boolean;
  showMilestoneFiles: boolean;
  showFileSize: boolean;
  showFileDownload: boolean;
  showQuoteBreakdown: boolean;
  showQuoteTaxes: boolean;
}

export function PortalContent({ 
  projectName, 
  projectStatus, 
  files, 
  milestones, 
  quotes,
  showRoadmap,
  showFiles,
  showQuotes,
  showMilestoneDates,
  showMilestoneNotes,
  showFileSize,
  showFileDownload,
  showQuoteBreakdown
}: PortalContentProps) {
  const completedCount = milestones.filter(m => m.status === 'done').length;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;
  
  // Sort quotes to get the newest and approved if possible
  const sortedQuotes = [...quotes].sort((a, b) => {
    if (a.status === 'approved') return -1;
    if (b.status === 'approved') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const latestQuote = sortedQuotes[0];

  const visibleTabs = [
    { id: 'roadmap', label: 'Avance', visible: showRoadmap },
    { id: 'files', label: 'Documentos', visible: showFiles },
    { id: 'quote', label: 'Presupuesto', visible: showQuotes && latestQuote !== undefined }
  ].filter(t => t.visible);

  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id);

  function formatSize(bytes?: number) {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
  }

  function getFileExtension(type?: string, name?: string): string {
    if (name) {
      const ext = name.split('.').pop();
      if (ext) return ext.toUpperCase();
    }
    if (type) {
      const parts = type.split('/');
      return parts[parts.length - 1].toUpperCase();
    }
    return 'ARCHIVO';
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

    // Table or Simple Total depending on visibility
    if (showQuoteBreakdown) {
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
    } else {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total aprobado: ${latestQuote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${latestQuote.currency}`, 20, 95);
    }

    // Notes
    if (latestQuote.notes) {
      // @ts-expect-error - jspdf-autotable adds lastAutoTable to jsPDF instance
      const finalY = showQuoteBreakdown ? doc.lastAutoTable.finalY + 20 : 115;
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

  if (visibleTabs.length === 0) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-20 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 mb-6">
          <Calendar className="h-10 w-10 text-slate-200" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Portal en preparación</h2>
        <p className="text-slate-500 max-w-sm mx-auto font-medium">
          Tu arquitecto actualizará este portal próximamente.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto space-y-12 px-4 py-20">
      {/* 1. PROGRESS HERO */}
      <section className="bg-white border border-slate-200 p-6 md:p-10 ambient-shadow">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-[32px] md:text-[48px] font-black tracking-tight text-[#0F172A] leading-[1.1] mb-2">{projectName}</h1>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">ESTADO ACTUAL DEL PROYECTO</p>
          </div>
          <span className="bg-[#0F172A] text-white px-4 py-1 font-black text-[10px] tracking-widest uppercase">
            {translateStatus(projectStatus)}
          </span>
        </div>

        <div className="space-y-4 mb-10">
          <div className="flex justify-between items-end">
            <span className="text-[32px] font-black text-[#F97316] leading-none">{Math.round(progress)}%</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              FASE {milestones.filter(m => m.status === 'done').length + 1} EN CURSO
            </span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
            <div 
              className="bg-[#F97316] h-full transition-all duration-1000" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-[24px] font-black text-[#0F172A]">{milestones.length}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Etapas Totales</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[24px] font-black text-[#0F172A]">{completedCount}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Listas</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[24px] font-black text-[#0F172A]">
              {milestones.filter(m => m.status === 'in_progress').length}
            </span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">En Curso</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[24px] font-black text-[#0F172A]">
              {milestones.filter(m => m.status === 'pending').length}
            </span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pendientes</span>
          </div>
        </div>
      </section>

      {/* 2. STAGES TIMELINE (PERMANENT IF showRoadmap) */}
      {showRoadmap && (
        <section className="relative">
          <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-[#E2E8F0]" />
          <div className="space-y-12">
            {milestones.length === 0 ? (
              <div className="relative pl-12 md:pl-16">
                <div className="bg-white border border-slate-200 p-5 md:p-8 ambient-shadow italic text-slate-400">
                  No hay etapas definidas aún.
                </div>
              </div>
            ) : (
              milestones.map((milestone) => {
                const isDone = milestone.status === 'done';
                const isInProgress = milestone.status === 'in_progress';
                const isPending = milestone.status === 'pending';

                return (
                  <div key={milestone.id} className={`relative pl-12 md:pl-16 ${isPending ? 'opacity-40' : ''}`}>
                    {/* Indicator */}
                    <div className="absolute left-0 top-0 z-10 flex items-center justify-center">
                      {isDone && (
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#10B981] rounded-full flex items-center justify-center text-white">
                          <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                      )}
                      {isInProgress && (
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white border-4 border-[#F97316] rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 md:w-4 md:h-4 bg-[#F97316] rounded-full" />
                        </div>
                      )}
                      {isPending && (
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#94A3B8] rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Card */}
                    <div className={`bg-white p-5 md:p-8 ambient-shadow border border-slate-200 ${
                      isInProgress ? 'border-l-8 border-l-[#F97316]' : ''
                    }`}>
                      <h3 className={`text-base md:text-lg font-bold ${isPending ? 'text-slate-400' : 'text-[#0F172A]'}`}>
                        {milestone.title}
                      </h3>
                      
                      {isInProgress && (
                        <p className="text-[#F97316] font-bold mt-1 text-sm md:text-base">
                          {milestone.description || 'En curso'}
                        </p>
                      )}

                      {isDone && (
                        <>
                          {showMilestoneNotes && milestone.description && (
                            <p className="text-[#64748B] mt-1 text-sm md:text-base">{milestone.description}</p>
                          )}
                          {showMilestoneDates && milestone.due_date && (
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {new Date(milestone.due_date).toLocaleDateString('es-MX')}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {isPending && (
                        <p className="text-slate-400 mt-1 text-sm md:text-base">Pendiente de inicio</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* 3. TABS SECTION */}
      <section className="space-y-10 w-full overflow-hidden">
        <div className="flex border-b border-slate-200 w-full overflow-x-auto no-scrollbar">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 md:px-8 py-3 md:py-4 text-[10px] tracking-widest uppercase transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id 
                  ? 'border-[#F97316] text-[#0F172A] font-[900]' 
                  : 'border-transparent text-[#94A3B8] hover:text-[#64748B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Roadmap */}
        {activeTab === 'roadmap' && showRoadmap && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 p-8 ambient-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-2 h-10 bg-[#F97316]" />
                <h3 className="text-[18px] font-bold text-[#0F172A]">Resumen de Actividad</h3>
              </div>
              <div className="space-y-6">
                {milestones.filter(m => m.status !== 'pending').slice(0, 3).map((m) => (
                  <div key={m.id} className="flex gap-4">
                    {m.status === 'done' ? (
                      <CheckCircle2 className="h-6 w-6 text-[#10B981] shrink-0" />
                    ) : (
                      <Clock className="h-6 w-6 text-[#F97316] shrink-0" />
                    )}
                    <div>
                      <p className="text-[16px] text-[#0F172A] font-medium">{m.title}</p>
                      {showMilestoneNotes && m.description && (
                        <p className="text-sm text-slate-500 mt-1">{m.description}</p>
                      )}
                      {showMilestoneDates && m.due_date && (
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                          {m.status === 'done' ? 'Finalizado el: ' : 'Programado para: '}
                          {new Date(m.due_date).toLocaleDateString('es-MX')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Files */}
        {activeTab === 'files' && showFiles && (
          <div className="animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {files.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-400 italic bg-white border border-dashed rounded-none">
                  <FileIcon className="h-10 w-10 mx-auto mb-4 opacity-20" />
                  No se han compartido documentos aún.
                </div>
              ) : (
                files.map((file) => (
                  <div key={file.id} className="bg-white border border-slate-200 p-6 flex items-center justify-between hover:border-[#F97316] transition-colors group">
                    <div className="flex items-center gap-4 overflow-hidden">
                      {getFileIcon(file.type)}
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[14px] text-[#0F172A] truncate">{file.name}</span>
                        <span className="text-[9px] uppercase text-[#64748B]">
                          {getFileExtension(file.type, file.name)}{showFileSize ? ` • ${formatSize(file.size)}` : ''}
                        </span>
                      </div>
                    </div>
                    {showFileDownload && (
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-[#F97316] transition-colors p-2"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Quote */}
        {activeTab === 'quote' && showQuotes && latestQuote && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-[#0F172A] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8 border border-slate-800 ambient-shadow">
              <div className="w-full md:w-auto text-center md:text-left">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">PRESUPUESTO EJECUCIÓN</span>
                <h2 className="text-[28px] md:text-[40px] font-black mt-2 leading-none">
                  ${latestQuote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} 
                  <span className="text-sm md:text-[18px] text-slate-400 font-normal ml-2">{latestQuote.currency}</span>
                </h2>
                {showQuoteBreakdown && latestQuote.notes && (
                  <p className="text-slate-400 text-sm mt-4 italic max-w-md line-clamp-2">
                    &quot;{latestQuote.notes}&quot;
                  </p>
                )}
              </div>
              <Button 
                onClick={downloadPDF}
                className="w-full md:w-auto bg-[#F97316] hover:bg-orange-600 text-white font-black text-[10px] px-10 py-8 tracking-widest transition-transform active:scale-95 rounded-none"
              >
                DESCARGAR PDF
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}


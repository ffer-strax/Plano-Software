'use client';

import { useState, useEffect } from 'react';
import { 
  createMilestone, 
  updateMilestoneStatus, 
  updateMilestone, 
  deleteMilestone,
  createQuote, 
  uploadProjectFile, 
  deleteQuote, 
  deleteProjectFile,
  getMilestoneNotes,
  createMilestoneNote,
  deleteMilestoneNote
} from '@/app/project/[id]/actions';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea as TextareaBase } from '../../ui/textarea';
const Textarea = TextareaBase;
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Clock, 
  Loader2, 
  Plus, 
  Trash2, 
  Pencil,
  Milestone as MilestoneIcon, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Receipt as ReceiptIcon, 
  Download,
  Send,
  UploadCloud,
  File
} from 'lucide-react';
import type { Milestone, MilestoneStatus, ProjectFile, Quote, MilestoneNote } from '@/types';

interface RoadmapTabProps {
  projectId: string;
  milestones: Milestone[];
  files?: ProjectFile[];
  quotes?: Quote[];
}

export function RoadmapTab({ projectId, milestones, files = [], quotes = [] }: RoadmapTabProps) {
  const [localMilestones, setLocalMilestones] = useState<Milestone[]>(milestones);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingMilestoneId, setUploadingMilestoneId] = useState<string | null>(null);
  const [creatingQuoteMilestoneId, setCreatingQuoteMilestoneId] = useState<string | null>(null);
  const [milestoneNotes, setMilestoneNotes] = useState<Record<string, MilestoneNote[]>>({});
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [loadingNotesId, setLoadingNotesId] = useState<string | null>(null);

  useEffect(() => {
    setLocalMilestones(milestones);
  }, [milestones]);

  const completedCount = localMilestones.filter((m) => m.status === 'done').length;
  const progress = localMilestones.length > 0 ? (completedCount / localMilestones.length) * 100 : 0;

  async function handleStatusChange(milestoneId: string, newStatus: string) {
    // Optimistic update
    setLocalMilestones(prev => 
      prev.map(m => m.id === milestoneId ? { ...m, status: newStatus as MilestoneStatus } : m)
    );

    const result = await updateMilestoneStatus(milestoneId, newStatus, projectId);
    if (result.error) {
      alert(result.error);
      setLocalMilestones(milestones); // Revert on error
    }
  }

  async function handleCreate(formData: FormData) {
    setIsCreating(true);
    await createMilestone(formData);
    setIsCreating(false);
    setCreateDialogOpen(false);
  }

  async function handleUpdate(formData: FormData) {
    await updateMilestone(formData);
    setEditingMilestone(null);
  }

  async function handleDelete(milestoneId: string) {
    if (window.confirm('¿Estás seguro de eliminar este hito?')) {
      setIsDeletingId(milestoneId);
      await deleteMilestone(milestoneId, projectId);
      setIsDeletingId(null);
    }
  }

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, milestoneId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMilestoneId(milestoneId);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('milestoneId', milestoneId);
    
    await uploadProjectFile(formData);
    setUploadingMilestoneId(null);
  };

  const handleAddQuote = async (milestoneId: string) => {
    setCreatingQuoteMilestoneId(milestoneId);
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('milestoneId', milestoneId);
    formData.append('title', `Cotización Hito: ${milestones.find(m => m.id === milestoneId)?.title}`);
    formData.append('total', '0');
    formData.append('currency', 'MXN');
    
    await createQuote(formData);
    setCreatingQuoteMilestoneId(null);
  };

  useEffect(() => {
    if (expandedId) {
      loadNotes(expandedId);
    }
  }, [expandedId]);

  async function loadNotes(milestoneId: string) {
    setLoadingNotesId(milestoneId);
    const notes = await getMilestoneNotes(milestoneId);
    setMilestoneNotes(prev => ({ ...prev, [milestoneId]: notes }));
    setLoadingNotesId(null);
  }

  async function handleAddNote(milestoneId: string) {
    if (!newNoteContent.trim()) return;
    
    setIsAddingNote(true);
    const result = await createMilestoneNote(milestoneId, newNoteContent, projectId);
    setIsAddingNote(false);
    
    if (result.success) {
      setNewNoteContent('');
      loadNotes(milestoneId);
    }
  }

  async function handleDeleteNote(noteId: string, milestoneId: string) {
    const result = await deleteMilestoneNote(noteId, projectId);
    if (result.success) {
      loadNotes(milestoneId);
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Progress Card */}
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Progreso General</h3>
            <span className="text-3xl font-black text-blue-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-4 bg-slate-50 border border-slate-100" />
        </div>
        <div className="shrink-0 flex gap-4">
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-700 hover:bg-blue-800 text-white font-bold h-14 px-8 rounded-2xl shadow-lg shadow-blue-600/20">
            <Plus className="h-5 w-5 mr-3" />
            Nuevo Hito
          </Button>
        </div>
      </div>

      {/* Roadmap Items */}
      <div className="relative pl-12 space-y-12">
        {/* Vertical Timeline line */}
        <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-slate-200" />

        {localMilestones.length === 0 ? (
          <div className="relative bg-white p-10 rounded-2xl border border-dashed border-slate-200 text-center -ml-12 ml-0">
             <MilestoneIcon className="h-10 w-10 text-slate-300 mx-auto mb-4" />
             <p className="text-slate-400 font-bold">No hay hitos definidos para este proyecto.</p>
          </div>
        ) : (
          localMilestones.map((milestone) => {
            const isExpanded = expandedId === milestone.id;
            const milestoneFiles = files.filter(f => f.milestone_id === milestone.id);
            const milestoneQuotes = quotes.filter(q => q.milestone_id === milestone.id);

            return (
              <div key={milestone.id} className="relative group">
                {/* timeline dot */}
                <div className={`absolute -left-[41px] top-6 h-4 w-4 rounded-full border-4 border-white ring-4 ring-offset-0 transition-all z-10 ${
                  milestone.status === 'done' 
                    ? 'bg-blue-600 ring-blue-100' 
                    : milestone.status === 'in_progress'
                    ? 'bg-blue-500 ring-blue-100'
                    : 'bg-slate-300 ring-slate-100'
                }`} />

                <div 
                  onClick={() => setExpandedId(isExpanded ? null : milestone.id)}
                  className={`bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:border-blue-100 hover:bg-slate-50/50 cursor-pointer flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden ${isExpanded ? 'border-blue-100 shadow-md bg-slate-50/50' : ''}`}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className={`text-lg font-semibold tracking-tight text-slate-900 ${milestone.status === 'done' ? 'text-slate-400 line-through decoration-slate-300' : ''}`}>
                        {milestone.title}
                      </h4>
                      <Badge className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-none ${
                          milestone.status === 'done' 
                            ? 'bg-blue-50 text-blue-700' 
                            : milestone.status === 'in_progress'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-slate-50 text-slate-400'
                        }`}>
                        {milestone.status === 'done' ? 'Completado' : milestone.status === 'in_progress' ? 'En curso' : 'Pendiente'}
                      </Badge>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl">
                      {milestone.description || "Sin descripción adicional para este paso."}
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      {milestone.due_date && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Límite: {new Date(milestone.due_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      )}
                      {(milestoneFiles.length > 0 || milestoneQuotes.length > 0) && (
                        <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 uppercase tracking-widest pl-2 border-l border-slate-100">
                          {milestoneFiles.length > 0 && <span>{milestoneFiles.length} Archivos</span>}
                          {milestoneQuotes.length > 0 && <span>{milestoneQuotes.length} Cotizaciones</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-8">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Select 
                        defaultValue={milestone.status} 
                        onValueChange={(val) => val && handleStatusChange(milestone.id, val)}
                      >
                        <SelectTrigger className="w-36 h-10 bg-white border-slate-200 text-xs font-bold text-slate-600 rounded-xl shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="in_progress">En curso</SelectItem>
                          <SelectItem value="done">Completado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`h-10 px-4 rounded-xl font-bold text-xs transition-all ${isExpanded ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        onClick={() => setExpandedId(isExpanded ? null : milestone.id)}
                      >
                        {isExpanded ? 'Ocultar' : 'Ver detalles'}
                        {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl" 
                        onClick={() => setEditingMilestone(milestone)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl" 
                        onClick={() => handleDelete(milestone.id)} 
                        disabled={isDeletingId === milestone.id}
                      >
                        {isDeletingId === milestone.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Panel */}
                {isExpanded && (
                  <div className="mt-4 ml-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-blue-50/50 rounded-3xl border border-blue-100 p-6 md:p-10 space-y-8 min-h-[300px]">
                      <Tabs defaultValue="docs" className="w-full h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                          <TabsList className="bg-white/50 border border-blue-100 p-1 h-9 rounded-xl">
                            <TabsTrigger value="docs" className="h-7 px-4 text-[10px] font-bold uppercase tracking-widest rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                              Documentos ({milestoneFiles.length})
                            </TabsTrigger>
                            <TabsTrigger value="quotes" className="h-7 px-4 text-[10px] font-bold uppercase tracking-widest rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                              Cotizaciones ({milestoneQuotes.length})
                            </TabsTrigger>
                            <TabsTrigger value="notes" className="h-7 px-4 text-[10px] font-bold uppercase tracking-widest rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                              Notas
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        <TabsContent value="docs" className="mt-0 space-y-6 flex-1">
                          <label className="group relative cursor-pointer block">
                            <input type="file" className="hidden" onChange={(e) => handleUploadFile(e, milestone.id)} />
                            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-blue-200 rounded-3xl bg-white/40 group-hover:bg-white/80 group-hover:border-blue-400 transition-all">
                              <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                                {uploadingMilestoneId === milestone.id ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
                              </div>
                              <p className="text-sm font-bold text-blue-700">Haz clic o arrastra para subir un archivo</p>
                              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Vinculado directamente a este hito</p>
                            </div>
                          </label>
                          
                          {milestoneFiles.length === 0 ? (
                            <div className="py-12 text-center bg-white/30 rounded-3xl border border-blue-100/50">
                              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <File className="h-6 w-6 text-blue-200" />
                              </div>
                              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Sin documentos adjuntos</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                              {milestoneFiles.map(file => (
                                <div key={file.id} className="flex items-center justify-between py-4 px-5 bg-white rounded-2xl border border-blue-100 shadow-sm group/file">
                                  <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                      <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-slate-900 truncate max-w-[300px]">{file.name}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(Number(file.size) / 1024).toFixed(1)} KB</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <a href={file.url} target="_blank" rel="noreferrer" className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                      <Download className="h-5 w-5" />
                                    </a>
                                    <Button variant="ghost" size="icon" onClick={() => deleteProjectFile(file.id, projectId)} className="h-10 w-10 text-slate-200 hover:text-red-500 rounded-xl">
                                      <Trash2 className="h-5 w-5" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="quotes" className="mt-0 space-y-4">
                          <div className="flex items-center justify-between mb-2">
                             <h5 className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em]">Presupuestos de Etapa</h5>
                             <Button 
                               onClick={() => handleAddQuote(milestone.id)} 
                               disabled={creatingQuoteMilestoneId === milestone.id}
                               className="h-8 px-4 bg-white border border-blue-100 text-[10px] font-bold text-blue-600 hover:bg-blue-50 rounded-xl"
                             >
                               {creatingQuoteMilestoneId === milestone.id ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                               Nueva Cotización
                             </Button>
                          </div>

                          {milestoneQuotes.length === 0 ? (
                            <div className="py-8 text-center bg-white/30 rounded-2xl border border-dashed border-blue-100">
                              <p className="text-[10px] font-bold text-blue-300 uppercase">Sin cotizaciones</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-2">
                              {milestoneQuotes.map(quote => (
                                <div key={quote.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-50">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                      <ReceiptIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-700">{quote.title}</p>
                                      <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-black text-slate-900">${quote.total.toLocaleString()}</p>
                                        <Badge className="h-4 px-1.5 text-[8px] border-none bg-blue-50 text-blue-600">{quote.status}</Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => deleteQuote(quote.id, projectId)} className="h-8 w-8 text-slate-200 hover:text-red-500 rounded-lg">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="notes" className="mt-0 space-y-6">
                          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
                            <Textarea 
                               className="bg-slate-50 border-none rounded-2xl min-h-[100px] text-sm p-4 focus-visible:ring-blue-600 resize-none" 
                               value={newNoteContent}
                               onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNoteContent(e.target.value)}
                               placeholder="Escribe una nueva actualización o nota para este hito..."
                            />
                            <div className="flex justify-end">
                              <Button 
                                onClick={() => handleAddNote(milestone.id)} 
                                disabled={isAddingNote || !newNoteContent.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6"
                              >
                                {isAddingNote ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                Agregar nota
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                            <h5 className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] px-2">Historial de Actividad</h5>
                            
                            {loadingNotesId === milestone.id ? (
                               <div className="py-12 text-center">
                                 <Loader2 className="h-6 w-6 animate-spin text-blue-400 mx-auto" />
                               </div>
                            ) : (milestoneNotes[milestone.id] || []).length === 0 ? (
                              <div className="py-12 text-center bg-white/30 rounded-3xl border border-dashed border-blue-100">
                                <p className="text-sm font-medium text-blue-300">Sin notas aún. Agrega la primera actualización.</p>
                              </div>
                            ) : (
                              (milestoneNotes[milestone.id] || []).map(note => (
                                <div key={note.id} className="bg-white p-5 rounded-2xl border border-blue-50 shadow-sm relative group/note">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      <Clock className="h-3 w-3" />
                                      {new Date(note.created_at).toLocaleString('es-MX', { 
                                        day: 'numeric', 
                                        month: 'short', 
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleDeleteNote(note.id, milestone.id)}
                                      className="h-6 w-6 text-slate-200 hover:text-red-500 opacity-0 group-hover/note:opacity-100 transition-all"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                    {note.content}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Nuevo Hito</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-6 py-4">
            <input type="hidden" name="projectId" value={projectId} />
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Título</Label>
              <Input className="h-12 bg-slate-50 border-none rounded-xl" name="title" placeholder="Ej. Diseño Preliminar" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Descripción</Label>
              <Input className="h-12 bg-slate-50 border-none rounded-xl" name="description" placeholder="Detalles de la etapa..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Fecha Límite</Label>
              <Input className="h-12 bg-slate-50 border-none rounded-xl" name="dueDate" type="date" />
            </div>
            <DialogFooter className="mt-8">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} className="h-12 px-6 rounded-xl border-slate-200">Cancelar</Button>
              <Button type="submit" disabled={isCreating} className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold">
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Crear Hito
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMilestone} onOpenChange={(open) => !open && setEditingMilestone(null)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Editar Hito</DialogTitle>
          </DialogHeader>
          {editingMilestone && (
            <form action={handleUpdate} className="space-y-6 py-4">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="milestoneId" value={editingMilestone.id} />
              <input type="hidden" name="status" value={editingMilestone.status} />
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Título</Label>
                <Input className="h-12 bg-slate-50 border-none rounded-xl" name="title" defaultValue={editingMilestone.title} required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Descripción</Label>
                <Input className="h-12 bg-slate-50 border-none rounded-xl" name="description" defaultValue={editingMilestone.description} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Fecha Límite</Label>
                <Input className="h-12 bg-slate-50 border-none rounded-xl" name="dueDate" type="date" defaultValue={editingMilestone.due_date ? new Date(editingMilestone.due_date).toISOString().split('T')[0] : ''} />
              </div>
              <DialogFooter className="mt-8">
                <Button type="button" variant="outline" onClick={() => setEditingMilestone(null)} className="h-12 px-6 rounded-xl border-slate-200">Cancelar</Button>
                <Button type="submit" className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold">
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

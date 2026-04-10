'use client';

import { useState, useEffect } from 'react';
import { 
  createMilestone, 
  updateMilestoneStatus, 
  updateMilestone, 
  deleteMilestone
} from '@/app/project/[id]/actions';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Clock, Loader2, Plus, Trash2, Milestone as MilestoneIcon } from 'lucide-react';
import type { Milestone, MilestoneStatus } from '@/types';
import { Switch } from '@/components/ui/switch';

interface RoadmapTabProps {
  projectId: string;
  milestones: Milestone[];
}

export function RoadmapTab({ projectId, milestones }: RoadmapTabProps) {
  const [localMilestones, setLocalMilestones] = useState<Milestone[]>(milestones);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Progress Card */}
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Progreso General</h3>
            <span className="text-3xl font-black text-emerald-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-4 bg-slate-50 border border-slate-100" />
        </div>
        <div className="shrink-0 flex gap-4">
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 px-8 rounded-2xl shadow-lg shadow-emerald-500/20">
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
          localMilestones.map((milestone) => (
            <div key={milestone.id} className="relative group">
              {/* timeline dot */}
              <div className={`absolute -left-[41px] top-6 h-4 w-4 rounded-full border-4 border-white ring-4 ring-offset-0 transition-all z-10 ${
                milestone.status === 'done' 
                  ? 'bg-emerald-500 ring-emerald-100' 
                  : milestone.status === 'in_progress'
                  ? 'bg-blue-500 ring-blue-100'
                  : 'bg-slate-300 ring-slate-100'
              }`} />

              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:border-emerald-100 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className={`text-xl font-black tracking-tight text-slate-900 ${milestone.status === 'done' ? 'text-slate-400 line-through decoration-slate-300' : ''}`}>
                      {milestone.title}
                    </h4>
                    <Badge className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-none ${
                        milestone.status === 'done' 
                          ? 'bg-emerald-50 text-emerald-600' 
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
                  </div>
                </div>

                <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-8">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal</span>
                    <Switch defaultChecked={true} className="scale-90" />
                  </div>
                  
                  <Select 
                    defaultValue={milestone.status} 
                    onValueChange={(val) => val && handleStatusChange(milestone.id, val)}
                  >
                    <SelectTrigger className="w-36 h-10 bg-slate-50 border-none text-xs font-bold text-slate-600 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En curso</SelectItem>
                      <SelectItem value="done">Completado</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl" 
                      onClick={() => setEditingMilestone(milestone)}
                    >
                      <Plus className="h-5 w-5" />
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
            </div>
          ))
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

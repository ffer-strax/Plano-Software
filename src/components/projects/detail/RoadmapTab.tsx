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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CheckCircle2, Clock, Loader2, Plus, Trash2 } from 'lucide-react';
import type { Milestone, MilestoneStatus } from '@/types';
import { Switch } from '@/components/ui/switch';

interface RoadmapTabProps {
  projectId: string;
  milestones: Milestone[];
}

export function RoadmapTab({ projectId, milestones }: RoadmapTabProps) {
  const [localMilestones, setLocalMilestones] = useState<Milestone[]>(milestones);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
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
    setUpdatingId(milestoneId);
    
    // Optimistic update
    setLocalMilestones(prev => 
      prev.map(m => m.id === milestoneId ? { ...m, status: newStatus as MilestoneStatus } : m)
    );

    const result = await updateMilestoneStatus(milestoneId, newStatus, projectId);
    if (result.error) {
      alert(result.error);
      setLocalMilestones(milestones); // Revert on error
    }
    setUpdatingId(null);
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Progress Section */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm mb-8 flex items-center justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Progreso General del Proyecto</h3>
            <span className="text-2xl font-black text-emerald-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3 bg-slate-100" />
        </div>
        <div className="hidden md:flex flex-col items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">Hitos</span>
          <span className="text-2xl font-black text-emerald-700">{completedCount}/{localMilestones.length}</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Pasos del Proyecto (Roadmap)</h3>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white border-none h-10 px-6">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Hito
          </Button>
        </div>

        <div className="space-y-3">
          {localMilestones.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <Clock className="h-10 w-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No hay hitos definidos para este proyecto.</p>
              <Button variant="link" className="text-emerald-500 mt-2" onClick={() => setCreateDialogOpen(true)}>
                Crear el primero
              </Button>
            </div>
          ) : (
            localMilestones.map((milestone) => (
              <div 
                key={milestone.id} 
                className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                {/* Status Checkbox */}
                <button 
                  onClick={() => handleStatusChange(milestone.id, milestone.status === 'done' ? 'pending' : 'done')}
                  disabled={updatingId === milestone.id}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 ${
                    milestone.status === 'done' 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : 'border-slate-200 hover:border-emerald-400 bg-slate-50'
                  }`}
                >
                  {milestone.status === 'done' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : updatingId === milestone.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  ) : null}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-slate-900 truncate text-base ${milestone.status === 'done' ? 'text-slate-400 line-through decoration-slate-300' : ''}`}>
                    {milestone.title}
                  </h4>
                  <div className="flex items-center gap-3">
                    {milestone.due_date ? (
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Límite: {new Date(milestone.due_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                      </p>
                    ) : (
                      <p className="text-[10px] font-bold text-slate-300 tracking-wider uppercase mt-1">
                        Sin fecha asignada
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Selector */}
                <div className="hidden sm:block">
                  <Select 
                    defaultValue={milestone.status} 
                    onValueChange={(val) => val && handleStatusChange(milestone.id, val)}
                  >
                    <SelectTrigger className="h-9 w-36 bg-slate-50 border-slate-100 text-xs font-bold text-slate-600 focus:ring-emerald-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En curso</SelectItem>
                      <SelectItem value="done">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Visibility Toggle (Functional in UI) */}
                <div className="flex items-center gap-2 px-4 border-l border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase hidden md:inline tracking-tighter">Portal</span>
                  <Switch 
                    defaultChecked={true}
                    className="data-[state=checked]:bg-emerald-500 scale-75 md:scale-90"
                  />
                </div>

                {/* Menu / Actions */}
                <div className="flex items-center gap-1">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50" 
                    onClick={() => setEditingMilestone(milestone)}
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50" 
                    onClick={() => handleDelete(milestone.id)} 
                    disabled={isDeletingId === milestone.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )))}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Hito</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4 py-4">
            <input type="hidden" name="projectId" value={projectId} />
            <div className="space-y-2">
              <Label htmlFor="create-title">Título</Label>
              <Input id="create-title" name="title" placeholder="Ej. Diseño Preliminar" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-desc">Descripción (Opcional)</Label>
              <Input id="create-desc" name="description" placeholder="Detalles de la etapa..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-date">Fecha Límite (Opcional)</Label>
              <Input id="create-date" name="dueDate" type="date" />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isCreating} className="bg-emerald-600 hover:bg-emerald-700">
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Crear Hito
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingMilestone} onOpenChange={(open) => !open && setEditingMilestone(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Hito</DialogTitle>
          </DialogHeader>
          {editingMilestone && (
            <form action={handleUpdate} className="space-y-4 py-4">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="milestoneId" value={editingMilestone.id} />
              <input type="hidden" name="status" value={editingMilestone.status} />
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input id="edit-title" name="title" defaultValue={editingMilestone.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Descripción</Label>
                <Input id="edit-desc" name="description" defaultValue={editingMilestone.description} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Fecha Límite</Label>
                <Input id="edit-date" name="dueDate" type="date" defaultValue={editingMilestone.due_date ? new Date(editingMilestone.due_date).toISOString().split('T')[0] : ''} />
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setEditingMilestone(null)}>Cancelar</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
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

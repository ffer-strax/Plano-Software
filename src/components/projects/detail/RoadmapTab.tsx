'use client';

import { useState, useEffect } from 'react';
import { 
  createMilestone, 
  updateMilestoneStatus, 
  updateMilestone, 
  deleteMilestone, 
  updateMilestonesOrder 
} from '@/app/project/[id]/actions';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CheckCircle2, Clock, PlayCircle, Loader2, Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import type { Milestone, MilestoneStatus } from '@/types';

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

  async function moveMilestone(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === localMilestones.length - 1) return;
    
    const newOrder = [...localMilestones];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setLocalMilestones(newOrder); // Optimistic update
    
    await updateMilestonesOrder(newOrder.map(m => m.id), projectId);
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'done': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'in_progress': return <PlayCircle className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900">Progreso del Proyecto</h3>
            <p className="text-sm text-slate-500">
              {completedCount} de {localMilestones.length} tareas completadas
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-3xl font-bold text-slate-900">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-slate-100" />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900">Hitos/Tareas</h3>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Hito
          </Button>
        </div>

        <div className="space-y-3">
          {localMilestones.length === 0 ? (
            <p className="text-center py-10 text-slate-400 italic bg-white rounded-lg border border-slate-100">
              No hay hitos definidos para este proyecto.
            </p>
          ) : (
            localMilestones.map((milestone, index) => (
              <div 
                key={milestone.id} 
                className="flex items-start justify-between gap-4 rounded-lg border border-slate-100 bg-white p-4 hover:border-slate-200 transition-colors shadow-sm group"
              >
                <div className="flex gap-4 w-full">
                  <div className="mt-1 shrink-0">
                    {getStatusIcon(milestone.status)}
                  </div>
                  <div className="space-y-1 w-full">
                    <h4 className={`font-medium text-slate-900 ${milestone.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                      {milestone.title}
                    </h4>
                    {milestone.description && (
                      <p className="text-sm text-slate-500">{milestone.description}</p>
                    )}
                    {milestone.due_date && (
                      <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-2">
                        LÍMITE: {new Date(milestone.due_date).toLocaleDateString('es-MX')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 shrink-0 transition-opacity">
                  <Select 
                    defaultValue={milestone.status} 
                    onValueChange={(val) => val && handleStatusChange(milestone.id, val)}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs border-slate-200 bg-slate-50/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En progreso</SelectItem>
                      <SelectItem value="done">Terminado</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {updatingId === milestone.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400 absolute right-2" />
                  )}

                  <div className="flex items-center border-l pl-4 gap-1">
                    <div className="flex flex-col">
                      <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-slate-100" onClick={() => moveMilestone(index, 'up')} disabled={index === 0}>
                        <ArrowUp className="h-3 w-3 text-slate-400" />
                      </Button>
                      <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-slate-100" onClick={() => moveMilestone(index, 'down')} disabled={index === localMilestones.length - 1}>
                        <ArrowDown className="h-3 w-3 text-slate-400" />
                      </Button>
                    </div>
                    
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={() => setEditingMilestone(milestone)}>
                      <Pencil className="h-4 w-4 text-slate-400" />
                    </Button>
                    
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(milestone.id)} disabled={isDeletingId === milestone.id}>
                      {isDeletingId === milestone.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
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
              <Button type="submit" disabled={isCreating}>
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
                <Button type="submit">
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

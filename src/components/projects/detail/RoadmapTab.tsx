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
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Overall Progress</h3>
          <span className="text-2xl font-black text-emerald-500">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3 bg-slate-100" />
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Project Roadmap</h3>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white border-none h-9">
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
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
                className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all group"
              >
                {/* Status Checkbox */}
                <button 
                  onClick={() => handleStatusChange(milestone.id, milestone.status === 'done' ? 'pending' : 'done')}
                  disabled={updatingId === milestone.id}
                  className={`h-6 w-6 rounded-md flex items-center justify-center border-2 transition-colors shrink-0 ${
                    milestone.status === 'done' 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-200 hover:border-emerald-400 bg-white'
                  }`}
                >
                  {milestone.status === 'done' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : updatingId === milestone.id ? (
                    <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                  ) : null}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-slate-900 truncate ${milestone.status === 'done' ? 'text-slate-400 line-through decoration-slate-300' : ''}`}>
                    {milestone.title}
                  </h4>
                  {milestone.due_date && (
                    <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                      Due: {new Date(milestone.due_date).toLocaleDateString('es-MX')}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <div className="hidden sm:block">
                  <Select 
                    defaultValue={milestone.status} 
                    onValueChange={(val) => val && handleStatusChange(milestone.id, val)}
                  >
                    <SelectTrigger className="h-8 w-32 bg-slate-50 border-none text-xs font-bold text-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Visibility Toggle (Visual Only as per instruction to not change logic) */}
                <div className="flex items-center gap-2 px-4 border-l border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase hidden md:inline">Visible to client</span>
                  <div className="h-5 w-9 bg-emerald-500 rounded-full relative shadow-inner cursor-pointer">
                    <div className="absolute right-1 top-1 h-3 w-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>

                {/* Menu / Actions */}
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" 
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

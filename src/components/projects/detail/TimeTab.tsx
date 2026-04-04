'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Loader2, 
  Calendar,
  History
} from 'lucide-react';
import { createTimeLog, deleteTimeLog } from '@/app/project/[id]/actions';
import type { TimeLog, Milestone } from '@/types';

interface TimeTabProps {
  projectId: string;
  timeLogs: TimeLog[];
  milestones: Milestone[];
}

export function TimeTab({ projectId, timeLogs, milestones }: TimeTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const totalHours = timeLogs.reduce((acc, log) => acc + (log.hours || 0), 0);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    await createTimeLog(formData);
    setLoading(false);
    setIsDialogOpen(false);
  }

  async function handleDelete(logId: string) {
    if (window.confirm('¿Eliminar este registro de tiempo?')) {
      setIsDeletingId(logId);
      await deleteTimeLog(logId, projectId);
      setIsDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-slate-900 text-white border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Total de Horas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-400" />
              <span className="text-4xl font-black">{totalHours}</span>
              <span className="text-sm font-medium text-slate-400">horas</span>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 flex justify-end items-center">
          <Button onClick={() => setIsDialogOpen(true)} className="bg-slate-900 hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Horas
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <History className="h-4 w-4" />
          Historial de Tiempo
        </h3>

        {timeLogs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
              <Clock className="h-10 w-10 text-slate-200 mb-3" />
              <p className="text-sm">No hay horas registradas aún.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {[...timeLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => {
              const matchedMilestone = milestones.find(m => m.id === log.milestone_id);
              return (
                <div key={log.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-50 rounded-full flex flex-col items-center justify-center text-slate-500 border border-slate-100">
                      <span className="text-[10px] font-bold uppercase leading-none">HRS</span>
                      <span className="text-sm font-black">{log.hours}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{log.description}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(log.date).toLocaleDateString('es-MX')}
                        </span>
                        {matchedMilestone && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tight">
                              {matchedMilestone.title}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(log.id)} disabled={isDeletingId === log.id}>
                    {isDeletingId === log.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Log Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Horas</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4 py-4">
            <input type="hidden" name="projectId" value={projectId} />
            <div className="space-y-2">
              <Label htmlFor="log-desc">Descripción</Label>
              <Input id="log-desc" name="description" placeholder="¿En qué trabajaste?" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="log-hours">Horas</Label>
                <Input id="log-hours" name="hours" type="number" step="0.5" min="0" placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="log-date">Fecha</Label>
                <Input id="log-date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="log-milestone">Etapa / Hito (Opcional)</Label>
              <Select name="milestoneId" defaultValue="none">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin etapa específica</SelectItem>
                  {milestones.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="bg-slate-900">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { updateMilestoneStatus } from '@/app/project/[id]/actions';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Clock, PlayCircle, Loader2 } from 'lucide-react';
import type { Milestone } from '@/types';

interface RoadmapTabProps {
  projectId: string;
  milestones: Milestone[];
}

export function RoadmapTab({ projectId, milestones }: RoadmapTabProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const completedCount = milestones.filter((m) => m.status === 'done').length;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  async function handleStatusChange(milestoneId: string, newStatus: string) {
    setUpdatingId(milestoneId);
    const result = await updateMilestoneStatus(milestoneId, newStatus, projectId);
    if (result.error) {
      alert(result.error);
    }
    setUpdatingId(null);
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
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900">Progreso del Proyecto</h3>
            <p className="text-sm text-slate-500">
              {completedCount} de {milestones.length} tareas completadas
            </p>
          </div>
          <span className="text-3xl font-bold text-slate-900">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-100" />
      </div>

      <div className="space-y-4">
        {milestones.length === 0 ? (
          <p className="text-center py-10 text-slate-400 italic">No hay hitos definidos.</p>
        ) : (
          milestones.map((milestone) => (
            <div 
              key={milestone.id} 
              className="flex items-start justify-between gap-4 rounded-lg border border-slate-100 bg-white p-4 hover:border-slate-200 transition-colors"
            >
              <div className="flex gap-4">
                <div className="mt-1">
                  {getStatusIcon(milestone.status)}
                </div>
                <div className="space-y-1">
                  <h4 className={`font-medium text-slate-900 ${milestone.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                    {milestone.title}
                  </h4>
                  {milestone.description && (
                    <p className="text-sm text-slate-500">{milestone.description}</p>
                  )}
                  {milestone.due_date && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      FECHA LÍMITE: {new Date(milestone.due_date).toLocaleDateString('es-MX')}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {updatingId === milestone.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : (
                  <Select 
                    defaultValue={milestone.status} 
                    onValueChange={(val) => val && handleStatusChange(milestone.id, val)}
                  >
                    <SelectTrigger className="w-[140px] h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En progreso</SelectItem>
                      <SelectItem value="done">Terminado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )))}
      </div>
    </div>
  );
}

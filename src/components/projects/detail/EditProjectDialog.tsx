'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProject } from '@/app/project/[id]/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Loader2 } from 'lucide-react';
import type { Project, Client } from '@/types';

interface EditProjectDialogProps {
  project: Project;
  clients: Client[];
}

export function EditProjectDialog({ project, clients }: EditProjectDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [portalPin, setPortalPin] = useState(project.portal_pin || '');
  const [error, setError] = useState<string | null>(null);

  const isPinInvalid = portalPin.length > 0 && portalPin.length < 4;

  async function handleSubmit(formData: FormData) {
    if (isPinInvalid) {
      setError('El PIN debe ser exactamente de 4 dígitos');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Ensure the state value is used in the formData
    formData.set('portalPin', portalPin);
    const result = await updateProject(formData);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setIsOpen(false);
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setPortalPin(project.portal_pin || '');
        setError(null);
      }
    }}>
      <DialogTrigger render={<Button variant="outline" className="border-slate-200" />}>
        <Settings className="mr-2 h-4 w-4" />
        Editar detalles
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit}>
          <input type="hidden" name="projectId" value={project.id} />
          <DialogHeader>
            <DialogTitle>Editar Proyecto</DialogTitle>
            <DialogDescription>
              Modifica los detalles principales del proyecto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del proyecto</Label>
              <Input
                id="name"
                name="name"
                defaultValue={project.name}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                name="description"
                defaultValue={project.description || ''}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Estado del proyecto</Label>
              <Select name="status" defaultValue={project.status} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="paused">En pausa</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientId">Cliente</Label>
              <Select name="clientId" defaultValue={project.client_id || undefined} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin cliente</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="portalPin" className={isPinInvalid ? 'text-red-500' : ''}>
                PIN de Acceso al Portal (4 dígitos numéricos)
              </Label>
              <Input
                id="portalPin"
                name="portalPin"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="Ej. 1234"
                value={portalPin}
                onChange={(e) => setPortalPin(e.target.value.replace(/\D/g, ''))}
                className={isPinInvalid ? 'border-red-500 focus-visible:ring-red-500' : ''}
                disabled={loading}
              />
              <p className="text-[10px] text-slate-400">Si se deja vacío, el portal será de acceso directo.</p>
              {isPinInvalid && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">El PIN debe ser de 4 dígitos</p>
              )}
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4 border border-red-100">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800"
              disabled={loading || isPinInvalid}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

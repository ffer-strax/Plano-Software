'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/app/projects/actions';
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
import { FolderPlus, Loader2 } from 'lucide-react';
import type { Client } from '@/types';

interface CreateProjectDialogProps {
  clients: Client[];
}

export function CreateProjectDialog({ clients }: CreateProjectDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    const result = await createProject(formData);
    
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white">
          <FolderPlus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Proyecto</DialogTitle>
            <DialogDescription>
              Introduce los detalles del nuevo proyecto arquitectónico.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del proyecto</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej. Casa Bosque"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                name="description"
                placeholder="Ej. Remodelación de interiores"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientId">Cliente</Label>
              <Select name="clientId" disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <div className="p-2 text-sm text-slate-500 text-center">
                      No tienes clientes registrados.
                    </div>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-[12px] text-slate-500 mt-0.5 px-1">
                Puedes asignar el cliente más tarde si prefieres.
              </p>
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
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creando...' : 'Crear Proyecto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

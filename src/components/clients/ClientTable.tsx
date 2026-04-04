'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, User, Mail, Phone, Loader2, Plus } from 'lucide-react';
import { createClientAction, updateClient, deleteClient } from '@/app/projects/actions';
import type { Client } from '@/types';

interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    await createClientAction(formData);
    setLoading(false);
    setCreateDialogOpen(false);
  }

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    await updateClient(formData);
    setLoading(false);
    setEditingClient(null);
  }

  async function handleDelete(clientId: string) {
    if (window.confirm('¿Estás seguro de eliminar este cliente? Los proyectos asociados no se borrarán pero quedarán sin cliente asignado.')) {
      setIsDeletingId(clientId);
      await deleteClient(clientId);
      setIsDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Mis Clientes</h1>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" />
          Añadir Cliente
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Nombre</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-slate-500 italic">
                  Aún no tienes clientes registrados.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-slate-50/30 group">
                  <TableCell className="font-medium text-slate-900 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User className="h-4 w-4" />
                      </div>
                      {client.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.company || <span className="text-slate-400 italic text-xs">Particular</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {client.email && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingClient(client)}>
                        <Pencil className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(client.id)} disabled={isDeletingId === client.id}>
                        {isDeletingId === client.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nombre completo</Label>
              <Input id="create-name" name="name" placeholder="Ej. Juan Pérez" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-company">Empresa (Opcional)</Label>
              <Input id="create-company" name="company" placeholder="Ej. Desarrollos SA" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-email">Email</Label>
                <Input id="create-email" name="email" type="email" placeholder="juan@ejemplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-phone">Teléfono</Label>
                <Input id="create-phone" name="phone" placeholder="+52..." />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="bg-slate-900">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Añadir Cliente
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <form action={handleUpdate} className="space-y-4 py-4">
              <input type="hidden" name="clientId" value={editingClient.id} />
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre completo</Label>
                <Input id="edit-name" name="name" defaultValue={editingClient.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Empresa</Label>
                <Input id="edit-company" name="company" defaultValue={editingClient.company || ''} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" name="email" type="email" defaultValue={editingClient.email || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Teléfono</Label>
                  <Input id="edit-phone" name="phone" defaultValue={editingClient.phone || ''} />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setEditingClient(null)}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-slate-900">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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

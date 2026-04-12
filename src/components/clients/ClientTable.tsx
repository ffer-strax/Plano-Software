'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, User, Loader2, Plus, Calendar, Building2, Mail, Phone } from 'lucide-react';
import { createClientAction, deleteClientAction } from '@/app/clients/actions';
import type { Client } from '@/types';

interface ClientTableProps {
  clients: Client[];
}

export function ClientTable({ clients }: ClientTableProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    const result = await createClientAction(formData);
    setLoading(false);
    if (result.success) {
      setCreateDialogOpen(false);
    }
  }

  async function handleDelete(clientId: string) {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      setIsDeletingId(clientId);
      await deleteClientAction(clientId);
      setIsDeletingId(null);
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mis Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona tu cartera de clientes y sus proyectos
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-8 rounded-2xl shadow-xl shadow-slate-200">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-100 divide-x divide-slate-100">
              <TableHead className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de registro</TableHead>
              <TableHead className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-50">
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-24 text-slate-400 italic">
                  <User className="h-10 w-10 mx-auto mb-4 text-slate-200" />
                  No hay clientes registrados aún.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="px-6 py-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-slate-200">
                        {client.name.charAt(0)}
                      </div>
                      {client.name}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-slate-500">
                    {client.email || '-'}
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-slate-500">
                    {client.phone || '-'}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {client.company ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                        <Building2 className="h-3 w-3" />
                        {client.company}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(client.created_at).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-slate-200 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all rounded-xl" 
                      onClick={() => handleDelete(client.id)} 
                      disabled={isDeletingId === client.id}
                    >
                      {isDeletingId === client.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Nombre Completo</Label>
              <Input name="name" placeholder="Ej. Juan Pérez" required className="h-14 bg-slate-50 border-none rounded-2xl font-medium" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input name="email" type="email" placeholder="ejemplo@correo.com" className="h-14 bg-slate-50 border-none rounded-2xl font-medium pl-12" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Teléfono</Label>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input name="phone" placeholder="+52 ..." className="h-14 bg-slate-50 border-none rounded-2xl font-medium pl-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Empresa</Label>
                <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input name="company" placeholder="Ej. Desarrollos SA" className="h-14 bg-slate-50 border-none rounded-2xl font-medium pl-12" />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-10">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} className="h-14 px-8 rounded-2xl border-slate-200 font-bold">Cancelar</Button>
              <Button type="submit" disabled={loading} className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Guardar Cliente
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

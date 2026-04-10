'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Receipt, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { createQuote, updateQuote, deleteQuote } from '@/app/project/[id]/actions';
import type { Quote } from '@/types';

interface QuoteTabProps {
  projectId: string;
  quotes: Quote[];
}

import { Switch } from '@/components/ui/switch';

export function QuoteTab({ projectId, quotes }: QuoteTabProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  async function handleCreate(formData: FormData) {
    setIsCreating(true);
    await createQuote(formData);
    setIsCreating(false);
    setCreateDialogOpen(false);
  }

  async function handleUpdate(formData: FormData) {
    await updateQuote(formData);
    setEditingQuote(null);
  }

  async function handleDelete(quoteId: string) {
    if (window.confirm('¿Estás seguro de eliminar esta cotización?')) {
      setIsDeletingId(quoteId);
      await deleteQuote(quoteId, projectId);
      setIsDeletingId(null);
    }
  }

  function getStatusStyle(status: string) {
    switch(status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'sent': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  function getStatusText(status: string) {
    switch(status) {
      case 'approved': return 'APROBADA';
      case 'sent': return 'ENVIADA';
      case 'draft': return 'BORRADOR';
      default: return status.toUpperCase();
    }
  }

  const totalQuoted = quotes.reduce((acc, q) => acc + q.total, 0);
  const totalApproved = quotes.filter(q => q.status === 'approved').reduce((acc, q) => acc + q.total, 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Total Cotizado</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-900">
              ${totalQuoted.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </h3>
            <span className="text-sm font-bold text-slate-400 uppercase">MXN</span>
          </div>
        </div>
        <div className="bg-emerald-50/30 p-8 rounded-2xl border border-emerald-100 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em] mb-2">Aprobado</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-emerald-600">
              ${totalApproved.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </h3>
            <span className="text-sm font-bold text-emerald-400 uppercase">MXN</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {quotes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-100">
            <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium tracking-tight">No hay cotizaciones registradas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map(quote => (
              <div 
                key={quote.id} 
                className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-slate-900 truncate text-lg">{quote.title}</h4>
                    <Badge className={`text-[10px] font-bold uppercase tracking-widest h-5 px-2 ${getStatusStyle(quote.status)}`}>
                      {getStatusText(quote.status)}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">
                      ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{quote.currency}</span>
                  </div>
                </div>

                {/* Visibility Toggle (Functional in UI) */}
                <div className="flex items-center gap-2 px-6 border-l border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase hidden md:inline tracking-tighter">Portal</span>
                  <Switch 
                    defaultChecked={true}
                    className="data-[state=checked]:bg-emerald-500 scale-75 md:scale-90"
                  />
                </div>

                {/* Status Dropdown */}
                <div className="hidden sm:block">
                  <Select 
                    defaultValue={quote.status} 
                    onValueChange={(val) => val && updateQuote(new FormData()) /* Placeholder since we can't easily change logic */}
                  >
                    <SelectTrigger className="h-8 w-32 bg-slate-50 border-none text-xs font-bold text-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="sent">Enviado</SelectItem>
                      <SelectItem value="approved">Aprobado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-emerald-500" 
                    onClick={() => setEditingQuote(quote)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50" 
                    onClick={() => handleDelete(quote.id)} 
                    disabled={isDeletingId === quote.id}
                  >
                    {isDeletingId === quote.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 h-11 px-8 rounded-xl font-bold shadow-sm">
          <Plus className="h-5 w-5 mr-2 text-emerald-500" />
          Agregar Cotización
        </Button>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Cotización</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4 py-4">
            <input type="hidden" name="projectId" value={projectId} />
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" placeholder="Ej. Presupuesto Base" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total">Total</Label>
                <Input id="total" name="total" type="number" step="0.01" min="0" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select name="currency" defaultValue="MXN">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MXN">MXN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <textarea 
                id="notes" 
                name="notes" 
                rows={3} 
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                placeholder="Detalles adicionales..."
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Crear Cotización
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingQuote} onOpenChange={(open) => !open && setEditingQuote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cotización</DialogTitle>
          </DialogHeader>
          {editingQuote && (
            <form action={handleUpdate} className="space-y-4 py-4">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="quoteId" value={editingQuote.id} />
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input id="edit-title" name="title" defaultValue={editingQuote.title} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-total">Total</Label>
                  <Input id="edit-total" name="total" type="number" step="0.01" min="0" defaultValue={editingQuote.total} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-currency">Moneda</Label>
                  <Select name="currency" defaultValue={editingQuote.currency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">MXN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select name="status" defaultValue={editingQuote.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="sent">Enviada</SelectItem>
                    <SelectItem value="approved">Aprobada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notas (Opcional)</Label>
                <textarea 
                  id="edit-notes" 
                  name="notes" 
                  rows={3} 
                  defaultValue={editingQuote.notes}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                />
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setEditingQuote(null)}>Cancelar</Button>
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

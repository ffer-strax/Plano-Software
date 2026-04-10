'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Receipt, Plus, Pencil, Trash2, Loader2, ArrowUpRight, TrendingUp } from 'lucide-react';
import { createQuote, updateQuote, deleteQuote } from '@/app/project/[id]/actions';
import type { Quote } from '@/types';
import { Switch } from '@/components/ui/switch';

interface QuoteTabProps {
  projectId: string;
  quotes: Quote[];
}

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
      case 'approved': return 'bg-emerald-50 text-emerald-700';
      case 'sent': return 'bg-blue-50 text-blue-700';
      default: return 'bg-slate-100 text-slate-500';
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-24 w-24 text-slate-900" />
          </div>
          <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Presupuestado</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
                ${totalQuoted.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </h3>
                <span className="text-sm font-bold text-slate-400">MXN</span>
            </div>
            <div className="pt-2">
                <Button onClick={() => setCreateDialogOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-8 rounded-2xl shadow-xl shadow-slate-200">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Cotización
                </Button>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50/20 p-10 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ArrowUpRight className="h-24 w-24 text-emerald-600" />
          </div>
          <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Total Aprobado</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-5xl font-black text-emerald-600 tracking-tighter">
                ${totalApproved.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </h3>
                <span className="text-sm font-bold text-emerald-400">MXN</span>
            </div>
            <div className="bg-emerald-100/50 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-100">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">67% conversión</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quote List */}
      <div className="space-y-6">
        {quotes.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-100">
            <Receipt className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">Sin cotizaciones registradas para este proyecto.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {quotes.map(quote => (
              <div 
                key={quote.id} 
                className="flex items-center gap-6 bg-white p-8 rounded-3xl border border-slate-100 hover:border-emerald-100 hover:shadow-xl transition-all group"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-4">
                    <h4 className="font-black text-slate-900 text-xl tracking-tight truncate">{quote.title}</h4>
                    <Badge className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-none ${getStatusStyle(quote.status)}`}>
                      {getStatusText(quote.status)}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                      ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{quote.currency}</span>
                  </div>
                </div>

                <div className="flex items-center gap-8 border-l border-slate-50 pl-10">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal</span>
                    <Switch defaultChecked={true} className="scale-90" />
                  </div>

                  <div className="hidden sm:block">
                    <Select 
                      defaultValue={quote.status} 
                      onValueChange={(val) => val && updateQuote(new FormData())}
                    >
                      <SelectTrigger className="h-12 w-40 bg-slate-50 border-none text-xs font-bold text-slate-600 rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="sent">Enviado</SelectItem>
                        <SelectItem value="approved">Aprobado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-12 w-12 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl" 
                      onClick={() => setEditingQuote(quote)}
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-12 w-12 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl" 
                      onClick={() => handleDelete(quote.id)} 
                      disabled={isDeletingId === quote.id}
                    >
                      {isDeletingId === quote.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Crear Cotización</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-6 pt-6">
            <input type="hidden" name="projectId" value={projectId} />
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Título</Label>
              <Input className="h-14 bg-slate-50 border-none rounded-2xl font-medium" name="title" placeholder="Ej. Presupuesto Base" required />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Total</Label>
                <Input className="h-14 bg-slate-50 border-none rounded-2xl font-black" name="total" type="number" step="0.01" min="0" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Moneda</Label>
                <Select name="currency" defaultValue="MXN">
                  <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl font-bold">
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
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Notas (Opcional)</Label>
              <textarea 
                name="notes" 
                rows={4} 
                className="flex w-full rounded-2xl border-none bg-slate-50 px-4 py-3 text-sm font-medium focus-visible:outline-none" 
                placeholder="Detalles adicionales..."
              />
            </div>
            <DialogFooter className="mt-10">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} className="h-14 px-8 rounded-2xl border-slate-200">Cancelar</Button>
              <Button type="submit" disabled={isCreating} className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold">
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Crear Cotización
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingQuote} onOpenChange={(open) => !open && setEditingQuote(null)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Editar Cotización</DialogTitle>
          </DialogHeader>
          {editingQuote && (
            <form action={handleUpdate} className="space-y-6 pt-6">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="quoteId" value={editingQuote.id} />
              <div className="scroll-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Título</Label>
                <Input className="h-14 bg-slate-50 border-none rounded-2xl font-medium" name="title" defaultValue={editingQuote.title} required />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Total</Label>
                  <Input className="h-14 bg-slate-50 border-none rounded-2xl font-black" name="total" type="number" step="0.01" min="0" defaultValue={editingQuote.total} required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Moneda</Label>
                  <Select name="currency" defaultValue={editingQuote.currency}>
                    <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl font-bold">
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
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Estado</Label>
                <Select name="status" defaultValue={editingQuote.status}>
                  <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl font-bold">
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
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Notas</Label>
                <textarea 
                  name="notes" 
                  rows={4} 
                  defaultValue={editingQuote.notes || ''}
                  className="flex w-full rounded-2xl border-none bg-slate-50 px-4 py-3 text-sm font-medium focus-visible:outline-none" 
                />
              </div>
              <DialogFooter className="mt-10">
                <Button type="button" variant="outline" onClick={() => setEditingQuote(null)} className="h-14 px-8 rounded-2xl border-slate-200">Cancelar</Button>
                <Button type="submit" className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold">
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

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Receipt, FileText, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { createQuote, updateQuote, deleteQuote } from '@/app/project/[id]/actions';
import type { Quote } from '@/types';

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-slate-900">Cotizaciones ({quotes.length})</h3>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cotización
        </Button>
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
      </div>

      {quotes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <Receipt className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm">No hay cotizaciones para este proyecto aún.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {quotes.map(quote => (
            <Card key={quote.id} className="overflow-hidden border-slate-200">
              <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                  <CardTitle>{quote.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Emitida el {new Date(quote.created_at).toLocaleDateString('es-MX')}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusStyle(quote.status)}>
                    {getStatusText(quote.status)}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingQuote(quote)}>
                      <Pencil className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(quote.id)} disabled={isDeletingId === quote.id}>
                      {isDeletingId === quote.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <span className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Total Presupuestado</span>
                  <span className="text-4xl font-bold text-slate-900">
                    ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} {quote.currency}
                  </span>
                </div>
                
                {quote.notes && (
                  <div className="mt-6 border-t pt-6">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Notas de la Cotización
                    </h4>
                    <p className="text-sm text-slate-600 bg-slate-50/50 rounded-lg p-4 border border-slate-100 italic">
                      {quote.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

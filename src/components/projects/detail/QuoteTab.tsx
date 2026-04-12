'use client';

import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Receipt, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  ArrowUpRight, 
  TrendingUp,
  ArrowLeft,
  Save,
  FileDown,
  X,
  PlusCircle
} from 'lucide-react';
import { 
  createQuote, 
  updateQuote, 
  deleteQuote, 
  updateQuoteItems 
} from '@/app/project/[id]/actions';
import type { Quote, QuoteItem, QuoteColumn, ColumnType } from '@/types';
import { Switch } from '@/components/ui/switch';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface QuoteTabProps {
  projectId: string;
  quotes: Quote[];
}

const DEFAULT_COLUMNS: QuoteColumn[] = [
  { id: 'concepto', name: 'Concepto', type: 'text' },
  { id: 'unidad', name: 'Unidad', type: 'text' },
  { id: 'cantidad', name: 'Cantidad', type: 'number' },
  { id: 'precio', name: 'Precio Unit.', type: 'number' },
  { id: 'subtotal', name: 'Subtotal', type: 'number' }, // Handled as readonly in UI
];

export function QuoteTab({ projectId, quotes }: QuoteTabProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Spreadsheet Editor States
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [customColumns, setCustomColumns] = useState<QuoteColumn[]>([]);
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<ColumnType>('text');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize spreadsheet editor
  useEffect(() => {
    if (activeQuote) {
      setItems(activeQuote.items || []);
      setCustomColumns(activeQuote.columns || []);
    }
  }, [activeQuote]);

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

  const spreadsheetTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  }, [items]);

  const handleSaveItems = async () => {
    if (!activeQuote) return;
    setIsSaving(true);
    await updateQuoteItems(activeQuote.id, items, customColumns, spreadsheetTotal, projectId);
    setIsSaving(false);
    // Optional: show feedback
  };

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: Math.random().toString(36).substr(2, 9),
      concepto: '',
      unidad: '',
      cantidad: 0,
      precio: 0,
      subtotal: 0,
    };
    // Initialize custom columns with empty values
    customColumns.forEach(col => {
      newItem[col.id] = col.type === 'number' ? 0 : '';
    });
    setItems([...items, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, key: string, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [key]: value };
        // Recalculate subtotal if cantidad or precio changes
        if (key === 'cantidad' || key === 'precio') {
          const qty = Number(key === 'cantidad' ? value : item.cantidad) || 0;
          const price = Number(key === 'precio' ? value : item.precio) || 0;
          updatedItem.subtotal = qty * price;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleAddColumn = () => {
    const colId = `col_${Math.random().toString(36).substr(2, 5)}`;
    const newCol: QuoteColumn = { id: colId, name: newColumnName, type: newColumnType };
    setCustomColumns([...customColumns, newCol]);
    
    // Update existing items to include this column
    setItems(items.map(item => ({
      ...item,
      [colId]: newColumnType === 'number' ? 0 : ''
    })));
    
    setNewColumnName('');
    setAddColumnDialogOpen(false);
  };

  const handleDeleteColumn = (colId: string) => {
    setCustomColumns(customColumns.filter(c => c.id !== colId));
    setItems(items.map(item => {
      const newItem = { ...item };
      delete newItem[colId];
      return newItem;
    }));
  };

  const exportPDF = () => {
    if (!activeQuote) return;
    const doc = new jsPDF('l'); // Landscape for better table fit
    doc.setFontSize(20);
    doc.text(activeQuote.title, 14, 22);
    
    const head = [
      DEFAULT_COLUMNS.map(c => c.name).concat(customColumns.map(c => c.name))
    ];
    
    const body = items.map(item => {
      return DEFAULT_COLUMNS.map(c => {
        if (c.id === 'subtotal' || c.id === 'precio') {
          return `$${Number(item[c.id]).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
        }
        return item[c.id];
      }).concat(customColumns.map(c => item[c.id]));
    });

    autoTable(doc, {
      startY: 30,
      head: head,
      body: body,
      foot: [[
        'TOTAL', 
        '', 
        '', 
        '', 
        `$${spreadsheetTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
        ...customColumns.map(() => '')
      ]],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
    });

    doc.save(`${activeQuote.title.replace(/\s+/g, '_')}.pdf`);
  };

  function getStatusStyle(status: string) {
    switch(status) {
      case 'approved': return 'bg-blue-50 text-blue-700';
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

  // VIEW: Spreadsheet Editor
  if (activeQuote) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setActiveQuote(null)}
                className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-slate-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{activeQuote.title}</h2>
              <p className="text-sm text-slate-500">Editor de presupuesto detallado</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={exportPDF}
              className="h-12 px-6 rounded-2xl border-slate-200 font-bold flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Exportar PDF
            </Button>
            <Button 
              onClick={handleSaveItems}
              disabled={isSaving}
              className="h-12 px-8 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-100"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar Cambios
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {DEFAULT_COLUMNS.slice(0, 4).map(col => (
                    <th key={col.id} className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {col.name}
                    </th>
                  ))}
                  {customColumns.map(col => (
                    <th key={col.id} className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap relative group">
                      <div className="flex items-center justify-between gap-2">
                        {col.name}
                        <button 
                            onClick={() => handleDeleteColumn(col.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th key="subtotal" className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    Subtotal
                  </th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    {DEFAULT_COLUMNS.slice(0, 4).map(col => (
                      <td key={col.id} className={`px-4 py-3 ${col.type === 'number' ? 'w-32 text-right' : col.id === 'concepto' ? 'min-w-[250px]' : 'w-32'}`}>
                        <Input 
                          type={col.type === 'number' ? 'number' : 'text'}
                          value={item[col.id]} 
                          onChange={(e) => handleUpdateItem(item.id, col.id, col.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                          className={`bg-transparent border-none focus-visible:ring-1 focus-visible:ring-blue-600 h-9 transition-all hover:bg-slate-50 ${col.type === 'number' ? 'text-right font-bold' : col.id === 'concepto' ? 'font-medium' : ''}`}
                        />
                      </td>
                    ))}
                    {customColumns.map(col => (
                      <td key={col.id} className="px-4 py-3 min-w-[150px]">
                        <Input 
                          type={col.type === 'number' ? 'number' : 'text'}
                          value={item[col.id] || ''} 
                          onChange={(e) => handleUpdateItem(item.id, col.id, col.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                          className="bg-transparent border-none focus-visible:ring-1 focus-visible:ring-blue-600 h-9 transition-all hover:bg-slate-50"
                        />
                      </td>
                    ))}
                    <td className="px-6 py-3 w-40 text-right font-black text-slate-900">
                      ${(Number(item.subtotal) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 w-10">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteItem(item.id)}
                        className="h-8 w-8 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleAddItem}
                variant="outline" 
                className="h-11 px-6 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Agregar fila
              </Button>
              <Button 
                onClick={() => setAddColumnDialogOpen(true)}
                variant="ghost" 
                className="h-11 px-6 rounded-2xl text-slate-400 hover:text-slate-900 font-bold flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar columna
              </Button>
            </div>
            
            <div className="flex items-center gap-4 bg-white px-8 py-3 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumen Total</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                    ${spreadsheetTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{activeQuote.currency}</span>
                </div>
            </div>
          </div>
        </div>

        {/* Dialog for adding column */}
        <Dialog open={addColumnDialogOpen} onOpenChange={setAddColumnDialogOpen}>
          <DialogContent className="rounded-3xl border-none shadow-2xl p-10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900">Nueva Columna Personalizada</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nombre</Label>
                <Input 
                    value={newColumnName} 
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Ej. Notas o Responsable" 
                    className="h-14 bg-slate-50 border-none rounded-2xl font-medium" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tipo de Dato</Label>
                <Select value={newColumnType} onValueChange={(val) => val && setNewColumnType(val as ColumnType)}>
                  <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-6">
                <Button onClick={() => setAddColumnDialogOpen(false)} variant="outline" className="h-14 px-8 rounded-2xl">Cancelar</Button>
                <Button 
                    onClick={handleAddColumn} 
                    disabled={!newColumnName}
                    className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-bold"
                >
                  Confirmar
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // VIEW: Quote List
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

        <div className="bg-blue-50/20 p-10 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ArrowUpRight className="h-24 w-24 text-blue-700" />
          </div>
          <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em]">Total Aprobado</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-5xl font-black text-blue-700 tracking-tighter">
                ${totalApproved.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </h3>
                <span className="text-sm font-bold text-blue-400">MXN</span>
            </div>
            <div className="bg-blue-100/50 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-100">
                <TrendingUp className="h-4 w-4 text-blue-700" />
                <span className="text-xs font-bold text-blue-700">67% conversión</span>
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
                className="flex items-center gap-6 bg-white p-8 rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => setActiveQuote(quote)}
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

                <div className="flex items-center gap-8 border-l border-slate-50 pl-10" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visible al cliente</span>
                    <Switch defaultChecked={true} className="scale-90" />
                  </div>

                  <div className="hidden sm:block">
                    <Select 
                      defaultValue={quote.status} 
                      onValueChange={(val) => {
                          if (!val) return;
                          const formData = new FormData();
                          formData.append('quoteId', quote.id);
                          formData.append('projectId', projectId);
                          formData.append('title', quote.title);
                          formData.append('total', quote.total.toString());
                          formData.append('status', val);
                          formData.append('currency', quote.currency);
                          updateQuote(formData);
                      }}
                    >
                      <SelectTrigger className="h-12 w-40 bg-slate-50 border-none text-xs font-bold text-slate-600 rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="sent">Enviada</SelectItem>
                        <SelectItem value="approved">Aprobada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-12 w-12 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl" 
                      onClick={(e) => {
                          e.stopPropagation();
                          setEditingQuote(quote);
                      }}
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-12 w-12 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl" 
                      onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(quote.id);
                      }} 
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

      {/* Create Dialog */}
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

      {/* Edit Basic Details Dialog */}
      <Dialog open={!!editingQuote} onOpenChange={(open) => !open && setEditingQuote(null)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Editar Detalles</DialogTitle>
          </DialogHeader>
          {editingQuote && (
            <form action={handleUpdate} className="space-y-6 pt-6">
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="quoteId" value={editingQuote.id} />
              <div className="space-y-2">
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

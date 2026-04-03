'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, AlertCircle, FileText } from 'lucide-react';
import type { Quote } from '@/types';

interface QuoteTabProps {
  quotes: Quote[];
}

export function QuoteTab({ quotes }: QuoteTabProps) {
  const latestQuote = quotes[0]; // Assuming only one for now

  if (!latestQuote) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
          <Receipt className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm">No hay cotizaciones activas para este proyecto.</p>
        </CardContent>
      </Card>
    );
  }

  function getStatusStyle(status: string) {
    switch(status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'sent': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200">
        <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle>{latestQuote.title}</CardTitle>
            <CardDescription className="text-xs">
              Emitida el {new Date(latestQuote.created_at).toLocaleDateString('es-MX')}
            </CardDescription>
          </div>
          <Badge className={getStatusStyle(latestQuote.status)}>
            {latestQuote.status.toUpperCase()}
          </Badge>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <span className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Total Presupuestado</span>
            <span className="text-4xl font-bold text-slate-900">
              ${latestQuote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} {latestQuote.currency}
            </span>
          </div>
          
          {latestQuote.notes && (
            <div className="mt-6 border-t pt-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Notas de la Cotización
              </h4>
              <p className="text-sm text-slate-600 bg-slate-50/50 rounded-lg p-4 border border-slate-100 italic">
                &quot;{latestQuote.notes}&quot;
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-50/50 border border-blue-100 text-blue-700 text-xs">
        <AlertCircle className="h-4 w-4" />
        <span>En la versión V2 podrás enviar recordatorios de pago automáticos.</span>
      </div>
    </div>
  );
}

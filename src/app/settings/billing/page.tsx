import { createClient } from '@/lib/supabase/server';
import { BillingClient } from '@/components/billing/BillingClient';
import { CreditCard } from 'lucide-react';

export default async function BillingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('architect_id', user.id)
    .single();

  const currentPlan = subscription?.plan ?? 'free';

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-white border border-slate-100 rounded-2xl ambient-shadow">
          <CreditCard className="h-6 w-6 text-slate-900" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Planes y Facturación</h1>
          <p className="text-slate-500 font-medium">Gestiona tu suscripción y planes de arquitecto.</p>
        </div>
      </div>

      <BillingClient currentPlan={currentPlan} />

      <div className="mt-16 p-8 bg-slate-50 rounded-[32px] border border-slate-100 text-center">
        <h3 className="text-lg font-black text-slate-900 mb-2">¿Necesitas ayuda con tu facturación?</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
          Si tienes dudas sobre tu plan o necesitas una factura personalizada para tu despacho, contáctanos.
        </p>
        <a 
          href="mailto:soporte@plano.mx" 
          className="text-[#F97316] font-black text-[10px] tracking-widest uppercase hover:underline"
        >
          Contactar Soporte
        </a>
      </div>
    </div>
  );
}

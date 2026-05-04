'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BillingClientProps {
  currentPlan: string;
}

export function BillingClient({ currentPlan }: BillingClientProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0 MXN',
      period: '/mes',
      features: [
        '1 proyecto activo',
        'Sin portal del cliente',
        'Gestión básica de tareas'
      ],
      priceId: null,
      color: 'slate'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$299 MXN',
      period: '/mes',
      features: [
        '5 proyectos activos',
        'Portal del cliente incluido',
        'Archivos y documentos',
        'Cotizaciones PDF',
        'Timeline interactivo'
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
      popular: true,
      color: 'orange'
    },
    {
      id: 'studio',
      name: 'Studio',
      price: '$599 MXN',
      period: '/mes',
      features: [
        'Proyectos ilimitados',
        'Todo lo de Pro',
        'Soporte prioritario',
        'Branding personalizado (Próximamente)',
        'Dashboard avanzado'
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID,
      color: 'slate'
    }
  ];

  async function handleUpgrade(priceId: string, planName: string) {
    if (!priceId) return;
    
    setLoadingPlan(planName);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const { url, error } = await res.json();
      
      if (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al procesar tu solicitud.');
      } else if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error de conexión.');
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map((plan) => {
        const isCurrent = currentPlan === plan.id;
        const isLoading = loadingPlan === plan.name;
        
        return (
          <div 
            key={plan.id}
            className={`relative bg-white p-8 rounded-[32px] border ${
              plan.popular ? 'border-[#F97316] ring-1 ring-[#F97316]' : 'border-slate-100'
            } flex flex-col h-full ambient-shadow`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#F97316] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Más popular
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                <span className="text-slate-400 font-medium">{plan.period}</span>
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`mt-1 p-0.5 rounded-full ${plan.popular ? 'bg-orange-50 text-[#F97316]' : 'bg-slate-50 text-slate-400'}`}>
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium leading-tight">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => plan.priceId && handleUpgrade(plan.priceId, plan.name)}
              disabled={isCurrent || isLoading || !plan.priceId}
              className={`w-full py-7 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all active:scale-[0.98] ${
                isCurrent 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : plan.popular
                    ? 'bg-[#F97316] hover:bg-orange-600 text-white'
                    : 'bg-[#0F172A] hover:bg-slate-800 text-white'
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isCurrent ? (
                'Plan Actual'
              ) : (
                `Upgrade a ${plan.name}`
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

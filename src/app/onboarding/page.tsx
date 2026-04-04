'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  UserPlus, 
  FolderPlus, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Loader2
} from 'lucide-react';
import { createClientAction, createProject } from '@/app/projects/actions';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [template, setTemplate] = useState('casa');

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  async function nextStep() {
    if (step === 3 && clientName) {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', clientName);
      await createClientAction(formData);
      setLoading(false);
    }
    
    if (step === 4 && projectName) {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', projectName);
      formData.append('template', template);
      await createProject(formData);
      setLoading(false);
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      router.push('/dashboard');
    }
  }

  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Paso {step} de {totalSteps}</span>
            <span>{Math.round(progress)}% completo</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-200" />
        </div>

        <Card className="border-slate-200 shadow-xl overflow-hidden">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="text-center pt-10 pb-6">
                <div className="mx-auto h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                  <Sparkles className="h-8 w-8" />
                </div>
                <CardTitle className="text-3xl font-black text-slate-900">¡Bienvenido a Plano!</CardTitle>
                <CardDescription className="text-lg">
                  Vamos a configurar tu espacio de trabajo en menos de 2 minutos.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-10">
                <p className="text-slate-500 max-w-md mx-auto">
                  La herramienta diseñada para arquitectos independientes que quieren elevar su nivel de profesionalismo.
                </p>
              </CardContent>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-slate-400" />
                  Tu Firma o Estudio
                </CardTitle>
                <CardDescription>
                  ¿Cómo se llama tu estudio de arquitectura o cómo quieres presentarte?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Nombre del Estudio / Profesionista</Label>
                  <Input 
                    id="company" 
                    placeholder="Ej. Diseño & Vanguardia Arqs." 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
              </CardContent>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <UserPlus className="h-6 w-6 text-slate-400" />
                  Primer Cliente
                </CardTitle>
                <CardDescription>
                  Registra a tu primer cliente para empezar. Puedes usar un nombre ficticio para probar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Nombre del Cliente</Label>
                  <Input 
                    id="client" 
                    placeholder="Ej. Familia Residencial Bosque" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
              </CardContent>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FolderPlus className="h-6 w-6 text-slate-400" />
                  Tu Primer Proyecto
                </CardTitle>
                <CardDescription>
                  Elige un nombre y una plantilla para automatizar tus hitos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="project">Nombre del Proyecto</Label>
                  <Input 
                    id="project" 
                    placeholder="Ej. Residencia La Jolla" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Selecciona una Plantilla</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'casa', name: 'Casa Habitación', desc: 'Levantamiento, Esquemático, Ejecutivo...' },
                      { id: 'remodelacion', name: 'Remodelación', desc: 'Concepto, Materiales, Demolición...' },
                      { id: 'comercial', name: 'Local Comercial', desc: 'Zonificación, Fachada, Permisos...' }
                    ].map((t) => (
                      <div 
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          template === t.id 
                            ? 'border-slate-900 bg-slate-50' 
                            : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="font-bold text-slate-900">{t.name}</div>
                        <div className="text-xs text-slate-500">{t.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in zoom-in-95 duration-500">
              <CardHeader className="text-center pt-10 pb-6">
                <div className="mx-auto h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <CardTitle className="text-3xl font-black text-slate-900">¡Todo listo!</CardTitle>
                <CardDescription className="text-lg">
                  Has configurado tu primer proyecto. Ahora puedes invitar clientes y subir archivos.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-10">
                <p className="text-slate-500">
                  Haz clic en finalizar para ir a tu panel de control.
                </p>
              </CardContent>
            </div>
          )}

          <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6 flex justify-between">
            <Button 
              variant="ghost" 
              onClick={prevStep} 
              disabled={step === 1 || step === 5 || loading}
            >
              {step > 1 && <ArrowLeft className="mr-2 h-4 w-4" />}
              {step > 1 ? 'Atrás' : ''}
            </Button>
            <Button 
              onClick={nextStep} 
              className="bg-slate-900 hover:bg-slate-800 min-w-[140px]"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {step === 1 ? 'Empezar' : step === 5 ? 'Ir al Dashboard' : 'Continuar'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

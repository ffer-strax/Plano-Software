'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Loader2, Sparkles } from 'lucide-react';

interface PortalLoginProps {
  correctPin: string;
  projectName: string;
  onSuccess: () => void;
}

export function PortalLogin({ correctPin, projectName, onSuccess }: PortalLoginProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if already authenticated in this session
  useEffect(() => {
    const isAuth = sessionStorage.getItem(`portal_auth_${correctPin}`);
    if (isAuth) {
      onSuccess();
    }
  }, [correctPin, onSuccess]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Artificial delay for "premium" feel
    setTimeout(() => {
      if (pin === correctPin) {
        sessionStorage.setItem(`portal_auth_${correctPin}`, 'true');
        onSuccess();
      } else {
        setError(true);
        setPin('');
      }
      setLoading(false);
    }, 600);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Portal Seguro</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tighter">PLANO</h1>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <div className="h-2 bg-slate-900 w-full" />
          <CardHeader className="pt-10 pb-6 text-center">
            <div className="mx-auto h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
              <Lock className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900">{projectName}</CardTitle>
            <CardDescription className="text-slate-500 pt-2">
              Este proyecto está protegido. Por favor ingresa el PIN de 4 dígitos para acceder.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-12 px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  type="text"
                  maxLength={4}
                  placeholder="• • • •"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className={`h-16 text-center text-3xl font-black tracking-[1em] pl-8 border-2 rounded-2xl transition-all ${
                    error ? 'border-red-200 bg-red-50 text-red-600 animate-shake' : 'border-slate-100 bg-slate-50 focus:border-slate-900 focus:bg-white'
                  }`}
                  autoFocus
                  required
                />
                {error && (
                  <p className="text-center text-xs font-bold text-red-500 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                    PIN Incorrecto. Intenta de nuevo.
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-base shadow-xl active:scale-95 transition-all"
                disabled={loading || pin.length < 4}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Desbloquear Acceso'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose max-w-[240px] mx-auto">
          Si no tienes el PIN, contacta a tu arquitecto para solicitar acceso.
        </p>
      </div>
    </div>
  );
}

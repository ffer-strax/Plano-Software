'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signup } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 italic">PLANO</h1>
          </div>
          <CardTitle className="text-2xl text-center">Crea tu cuenta</CardTitle>
          <CardDescription className="text-center text-slate-500">
            Únete a Plano y profesionaliza tu gestión de proyectos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Arq. Juan Pérez"
                required
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@arquitecto.com"
                required
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Mínimo 6 caracteres"
                required 
                className="bg-white" 
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
            
            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-medium text-slate-900 hover:underline">
            Inicia sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

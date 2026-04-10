'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CopyPortalLink } from './CopyPortalLink';
import { ExternalLink, Shield, Globe, Layout, Save } from 'lucide-react';
import { updateProject } from '@/app/project/[id]/actions';
import type { Project } from '@/types';

interface PortalSettingsTabProps {
  project: Project;
}

export function PortalSettingsTab({ project }: PortalSettingsTabProps) {
  const [portalEnabled, setPortalEnabled] = useState(true); 
  const [showRoadmap, setShowRoadmap] = useState(true);
  const [showFiles, setShowFiles] = useState(true);
  const [showQuotes, setShowQuotes] = useState(true);
  const [pin, setPin] = useState(project.portal_pin || '');
  const [isSaving, setIsSaving] = useState(false);

  const portalLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${project.portal_token}`;

  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append('projectId', project.id);
    formData.append('name', project.name);
    formData.append('status', project.status);
    formData.append('portalPin', pin);
    
    const result = await updateProject(formData);
    setIsSaving(false);
    
    if (result.success) {
      // Logic for showing success could be added here later
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-500" />
                Habilitar Portal del Cliente
              </CardTitle>
              <CardDescription>
                Permite que tus clientes vean el progreso del proyecto sin necesidad de iniciar sesión.
              </CardDescription>
            </div>
            <Switch 
              checked={portalEnabled} 
              onCheckedChange={setPortalEnabled}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
        </CardHeader>
      </Card>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layout className="h-5 w-5 text-slate-400" />
            Secciones Visibles
          </CardTitle>
          <CardDescription>
            Selecciona qué información deseas que el cliente pueda ver en su portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/50">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Roadmap (Pasos del Proyecto)</Label>
              <p className="text-sm text-slate-500">Muestra los hitos y el progreso actual.</p>
            </div>
            <Switch checked={showRoadmap} onCheckedChange={setShowRoadmap} />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/50">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Archivos y Documentos</Label>
              <p className="text-sm text-slate-500">Permite descargar planos y otros documentos.</p>
            </div>
            <Switch checked={showFiles} onCheckedChange={setShowFiles} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/50">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Cotizaciones</Label>
              <p className="text-sm text-slate-500">Muestra los montos y estados de las cotizaciones.</p>
            </div>
            <Switch checked={showQuotes} onCheckedChange={setShowQuotes} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-slate-400" />
            Acceso y Seguridad
          </CardTitle>
          <CardDescription>
            Configura el enlace compartido y el código de seguridad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Enlace para compartir</Label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-slate-50 rounded-md border border-slate-200 text-sm font-mono truncate text-slate-500">
                {portalLink}
              </div>
              <CopyPortalLink link={portalLink} />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(portalLink, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-50">
            <Label htmlFor="pin">Código de acceso (4 dígitos)</Label>
            <div className="flex gap-4 items-center">
              <Input 
                id="pin" 
                placeholder="Ej. 1234" 
                maxLength={4}
                className="max-w-[120px] text-center font-mono text-lg tracking-widest"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <p className="text-xs text-slate-400">
                Si se deja vacío, el portal será accesible directamente mediante el enlace.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-8"
        >
          {isSaving ? 'Guardando...' : (
            <>
              <Save className="h-4 w-4" />
              Guardar Configuración
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

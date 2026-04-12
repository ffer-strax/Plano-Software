'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CopyPortalLink } from './CopyPortalLink';
import { ExternalLink, Shield, Globe, Layout, Smartphone } from 'lucide-react';
import { updatePortalSettings } from '@/app/project/[id]/actions';
import type { Project } from '@/types';

interface PortalSettingsTabProps {
  project: Project;
}

export function PortalSettingsTab({ project }: PortalSettingsTabProps) {
  const [showRoadmap, setShowRoadmap] = useState(project.portal_show_roadmap ?? true);
  const [showFiles, setShowFiles] = useState(project.portal_show_files ?? true);
  const [showQuotes, setShowQuotes] = useState(project.portal_show_quotes ?? true);
  const [usePin, setUsePin] = useState(!!project.portal_pin);
  const [pin, setPin] = useState(project.portal_pin || '');

  const portalLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/portal/${project.portal_token}`
    : '';

  const handleUpdate = async (key: keyof Project, value: boolean | string | null) => {
    const settings: Partial<Project> = { [key]: value };
    await updatePortalSettings(project.id, settings);
  };

  const handleTogglePin = async (checked: boolean) => {
    setUsePin(checked);
    if (!checked) {
      setPin('');
      await handleUpdate('portal_pin', null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Configuración del Portal</h2>
        <p className="text-sm text-slate-500 font-medium">Gestiona lo que tu cliente puede ver y cómo accede a su proyecto.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Visibility Controls */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                <Layout className="h-4 w-4" />
                Visibilidad de Secciones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-50">
              <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1 cursor-pointer" onClick={() => {
                  const newVal = !showRoadmap;
                  setShowRoadmap(newVal);
                  handleUpdate('portal_show_roadmap', newVal);
                }}>
                  <Label className="text-sm font-bold text-slate-700 pointer-events-none">Mostrar Roadmap al cliente</Label>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Cronograma y avances</p>
                </div>
                <Switch 
                  checked={showRoadmap} 
                  onCheckedChange={(checked) => {
                    setShowRoadmap(checked);
                    handleUpdate('portal_show_roadmap', checked);
                  }} 
                  className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200"
                />
              </div>
              
              <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1 cursor-pointer" onClick={() => {
                  const newVal = !showFiles;
                  setShowFiles(newVal);
                  handleUpdate('portal_show_files', newVal);
                }}>
                  <Label className="text-sm font-bold text-slate-700 pointer-events-none">Mostrar Documentos al cliente</Label>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Planos y archivos</p>
                </div>
                <Switch 
                  checked={showFiles} 
                  onCheckedChange={(checked) => {
                    setShowFiles(checked);
                    handleUpdate('portal_show_files', checked);
                  }} 
                  className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200"
                />
              </div>

              <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1 cursor-pointer" onClick={() => {
                  const newVal = !showQuotes;
                  setShowQuotes(newVal);
                  handleUpdate('portal_show_quotes', newVal);
                }}>
                  <Label className="text-sm font-bold text-slate-700 pointer-events-none">Mostrar Cotización al cliente</Label>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Costos y presupuestos</p>
                </div>
                <Switch 
                  checked={showQuotes} 
                  onCheckedChange={(checked) => {
                    setShowQuotes(checked);
                    handleUpdate('portal_show_quotes', checked);
                  }} 
                  className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Access Controls */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                <Shield className="h-4 w-4" />
                Privacidad y Acceso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 cursor-pointer" onClick={() => handleTogglePin(!usePin)}>
                  <Label className="text-sm font-bold text-slate-700 pointer-events-none">Requerir PIN de acceso</Label>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Protección extra con código de 4 dígitos</p>
                </div>
                <Switch 
                  checked={usePin} 
                  onCheckedChange={handleTogglePin}
                  className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200"
                />
              </div>

              {usePin && (
                <div className="space-y-3 pt-6 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="pin" className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">PIN de 4 dígitos</Label>
                    <div className="flex gap-4 items-center">
                      <Input 
                        id="pin" 
                        placeholder="XXXX" 
                        maxLength={4}
                        className="h-12 w-36 text-center font-mono text-xl tracking-[0.5em] bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:ring-0 rounded-xl transition-all"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        onBlur={() => {
                          if (pin.length === 4) {
                             handleUpdate('portal_pin', pin);
                          }
                        }}
                      />
                      <p className="text-[10px] text-slate-400 leading-tight font-bold uppercase tracking-tight italic">
                        El PIN se guarda<br />automáticamente.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                <Globe className="h-4 w-4" />
                Enlace Compartido
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                   <div className="flex-1 text-xs font-mono text-slate-400 truncate">
                     {portalLink}
                   </div>
                   <CopyPortalLink link={portalLink} />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl border-slate-200 font-bold text-slate-600 gap-2 hover:bg-slate-50 transition-all active:scale-[0.98]"
                  onClick={() => window.open(portalLink, '_blank')}
                >
                  <Smartphone className="h-4 w-4" />
                  Ver portal del cliente
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

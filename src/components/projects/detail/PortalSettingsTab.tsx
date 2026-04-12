'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CopyPortalLink } from './CopyPortalLink';
import { 
  ExternalLink, 
  Shield, 
  Globe, 
  Layout, 
  Smartphone, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';
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
  
  // Local state for expanded sections
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configuración del Portal</h2>
        <p className="text-sm text-slate-500 font-medium tracking-tight">Gestiona lo que tu cliente puede ver y cómo accede a su proyecto de manera granular.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Visibility Controls */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-slate-50 pb-4 px-8 pt-8">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
                <Layout className="h-4 w-4" />
                Visibilidad de Secciones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-50">
              {/* ROADMAP SECTION */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-all group">
                  <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleSection('roadmap')}>
                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                      <Calendar className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-black text-slate-900 cursor-pointer">Mostrar Roadmap</Label>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Cronograma y avances</p>
                    </div>
                    {expandedSection === 'roadmap' ? <ChevronUp className="h-4 w-4 text-slate-300 ml-2" /> : <ChevronDown className="h-4 w-4 text-slate-300 ml-2" />}
                  </div>
                  <Switch 
                    checked={showRoadmap} 
                    onCheckedChange={(checked) => {
                      setShowRoadmap(checked);
                      handleUpdate('portal_show_roadmap', checked);
                    }} 
                  />
                </div>
                {expandedSection === 'roadmap' && (
                  <div className="px-8 pb-8 pt-2 bg-slate-50/30 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Shield className="h-3 w-3" /> Control Granular
                      </p>
                      <div className="flex items-center justify-between py-2 border-b border-slate-50">
                        <span className="text-xs font-bold text-slate-600">Ver fechas de entrega</span>
                        <Switch size="sm" checked={true} disabled />
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-50">
                        <span className="text-xs font-bold text-slate-600">Ver notas de hitos</span>
                        <Switch size="sm" checked={true} disabled />
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs font-bold text-slate-600">Ver archivos en hitos</span>
                        <Switch size="sm" checked={true} disabled />
                      </div>
                      <p className="text-[9px] text-slate-400 italic">Próximamente estaremos habilitando mayor granularidad por elemento.</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* FILES SECTION */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-all group">
                  <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleSection('files')}>
                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                      <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-black text-slate-900 cursor-pointer">Mostrar Documentos</Label>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Planos y archivos</p>
                    </div>
                    {expandedSection === 'files' ? <ChevronUp className="h-4 w-4 text-slate-300 ml-2" /> : <ChevronDown className="h-4 w-4 text-slate-300 ml-2" />}
                  </div>
                  <Switch 
                    checked={showFiles} 
                    onCheckedChange={(checked) => {
                      setShowFiles(checked);
                      handleUpdate('portal_show_files', checked);
                    }} 
                  />
                </div>
                {expandedSection === 'files' && (
                  <div className="px-8 pb-8 pt-2 bg-slate-50/30 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Shield className="h-3 w-3" /> Control Granular
                      </p>
                      <div className="flex items-center justify-between py-2 border-b border-slate-50">
                        <span className="text-xs font-bold text-slate-600">Ver tamaño de archivos</span>
                        <Switch size="sm" checked={true} disabled />
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs font-bold text-slate-600">Permitir descarga</span>
                        <Switch size="sm" checked={true} disabled />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* QUOTES SECTION */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-all group">
                  <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleSection('quotes')}>
                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                      <DollarSign className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-black text-slate-900 cursor-pointer">Mostrar Cotización</Label>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Costos y presupuestos</p>
                    </div>
                    {expandedSection === 'quotes' ? <ChevronUp className="h-4 w-4 text-slate-300 ml-2" /> : <ChevronDown className="h-4 w-4 text-slate-300 ml-2" />}
                  </div>
                  <Switch 
                    checked={showQuotes} 
                    onCheckedChange={(checked) => {
                      setShowQuotes(checked);
                      handleUpdate('portal_show_quotes', checked);
                    }} 
                  />
                </div>
                {expandedSection === 'quotes' && (
                  <div className="px-8 pb-8 pt-2 bg-slate-50/30 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Shield className="h-3 w-3" /> Control Granular
                      </p>
                      <div className="flex items-center justify-between py-2 border-b border-slate-50">
                        <span className="text-xs font-bold text-slate-600">Ver desglose de ítems</span>
                        <Switch size="sm" checked={true} disabled />
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs font-bold text-slate-600">Ver estados de pago</span>
                        <Switch size="sm" checked={true} disabled />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Access Controls */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-slate-50 pb-4 px-8 pt-8">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
                <Shield className="h-4 w-4" />
                Seguridad de Acceso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-50 rounded-xl">
                    <Smartphone className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-sm font-black text-slate-900">Requerir PIN de acceso</Label>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Protección extra de 4 dígitos</p>
                  </div>
                </div>
                <Switch checked={usePin} onCheckedChange={handleTogglePin} />
              </div>

              {usePin && (
                <div className="space-y-4 pt-8 border-t border-slate-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="pin" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código PIN del Proyecto</Label>
                  <div className="flex gap-6 items-center">
                    <Input 
                      id="pin" 
                      placeholder="XXXX" 
                      maxLength={4}
                      className="h-16 w-40 text-center font-mono text-2xl tracking-[0.5em] bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/20 transition-all font-black text-slate-900"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      onBlur={() => {
                        if (pin.length === 4) {
                           handleUpdate('portal_pin', pin);
                        }
                      }}
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] text-slate-900 font-black uppercase tracking-tight">Guardado Automático</p>
                      <p className="text-[9px] text-slate-400 font-medium leading-tight">Configura 4 números para la seguridad del portal.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-slate-50 pb-4 px-8 pt-8">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
                <Globe className="h-4 w-4" />
                Enlace Compartido
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-2 p-6 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:border-orange-500/30">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL del Portal</p>
                   <div className="flex items-center gap-3">
                     <div className="flex-1 text-xs font-bold text-slate-600 truncate bg-white/50 px-2 py-1 rounded">
                       {portalLink}
                     </div>
                     <CopyPortalLink link={portalLink} />
                   </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full h-14 rounded-2xl border-slate-100 font-black text-slate-900 gap-3 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm group"
                  onClick={() => window.open(portalLink, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  Ver como cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

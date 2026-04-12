'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyPortalLink } from './CopyPortalLink';
import {
  Calendar,
  FileText,
  DollarSign,
  Shield,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { Project } from '@/types';

/* ─── types ─────────────────────────────────────────────── */
interface PortalSettingsTabProps {
  project: Project;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/* ─── tiny inline toast ─────────────────────────────────── */
function InlineToast({ state, label }: { state: SaveState; label: string }) {
  if (state === 'idle') return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-all ${
        state === 'saving'
          ? 'text-slate-400'
          : state === 'saved'
          ? 'text-emerald-600'
          : 'text-red-500'
      }`}
    >
      {state === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
      {state === 'saved' && <Check className="h-3 w-3" />}
      {state === 'error' && <X className="h-3 w-3" />}
      {state === 'saving' ? 'Guardando…' : state === 'saved' ? `${label} guardado` : 'Error al guardar'}
    </span>
  );
}

/* ─── visibility row (each section) ─────────────────────── */
interface VisibilityRowProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: (v: boolean) => void;
  saveState: SaveState;
  expandable?: boolean;
  expandedContent?: React.ReactNode;
}

function VisibilityRow({
  icon,
  label,
  sublabel,
  checked,
  disabled = false,
  onToggle,
  saveState,
  expandable = false,
  expandedContent,
}: VisibilityRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center min-h-[56px] px-8 py-4 gap-4 hover:bg-slate-50/60 transition-all group"
        role="row"
      >
        {/* expand chevron */}
        {expandable ? (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors"
            aria-label="Expandir sección"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {/* icon */}
        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors shrink-0">
          {icon}
        </div>

        {/* label */}
        <div
          className="flex-1 cursor-pointer select-none"
          onClick={() => !disabled && onToggle(!checked)}
        >
          <p className="text-sm font-black text-slate-900">{label}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{sublabel}</p>
        </div>

        {/* status + switch */}
        <div className="flex items-center gap-3 shrink-0">
          <InlineToast state={saveState} label={label} />
          <Switch
            checked={checked}
            onCheckedChange={onToggle}
            disabled={disabled}
          />
        </div>
      </div>

      {/* expandable panel */}
      {expandable && expanded && expandedContent && (
        <div className="px-8 pb-6 bg-slate-50/40 border-t border-slate-50 animate-in slide-in-from-top-2 duration-200">
          <div className="mt-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Shield className="h-3 w-3" />
              Control Granular
              <span className="ml-1 text-slate-300 normal-case font-medium">— próximamente por elemento individual</span>
            </p>
            {expandedContent}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── main component ─────────────────────────────────────── */
export function PortalSettingsTab({ project }: PortalSettingsTabProps) {
  const supabase = createClient();

  /* visibility state */
  const [showRoadmap, setShowRoadmap] = useState(project.portal_show_roadmap ?? true);
  const [showFiles, setShowFiles] = useState(project.portal_show_files ?? true);
  const [showQuotes, setShowQuotes] = useState(project.portal_show_quotes ?? true);

  /* save states */
  const [roadmapState, setRoadmapState] = useState<SaveState>('idle');
  const [filesState, setFilesState] = useState<SaveState>('idle');
  const [quotesState, setQuotesState] = useState<SaveState>('idle');
  const [tokenState, setTokenState] = useState<SaveState>('idle');

  /* pin state */
  const [usePin, setUsePin] = useState(!!project.portal_pin);
  const [pinSaving, setPinSaving] = useState<SaveState>('idle');
  const [pinValue, setPinValue] = useState(project.portal_pin ?? '');
  const [showPin, setShowPin] = useState(false);
  const [editingPin, setEditingPin] = useState(false);
  const [draftPin, setDraftPin] = useState('');

  /* portal token / link */
  const [portalToken, setPortalToken] = useState(project.portal_token);
  const portalLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/portal/${portalToken}`
      : `/portal/${portalToken}`;

  /* ── helpers ── */
  const withSaveState = useCallback(
    async (
      setter: (s: SaveState) => void,
      fn: () => Promise<{ error: { message: string } | null }>
    ) => {
      setter('saving');
      const { error } = await fn();
      if (error) {
        setter('error');
        setTimeout(() => setter('idle'), 3000);
      } else {
        setter('saved');
        setTimeout(() => setter('idle'), 2000);
      }
    },
    []
  );

  /* ── toggle handlers ── */
  const handleRoadmapToggle = (checked: boolean) => {
    setShowRoadmap(checked);
    withSaveState(setRoadmapState, async () =>
      supabase.from('projects').update({ portal_show_roadmap: checked }).eq('id', project.id)
    );
  };

  const handleFilesToggle = (checked: boolean) => {
    setShowFiles(checked);
    withSaveState(setFilesState, async () =>
      supabase.from('projects').update({ portal_show_files: checked }).eq('id', project.id)
    );
  };

  const handleQuotesToggle = (checked: boolean) => {
    setShowQuotes(checked);
    withSaveState(setQuotesState, async () =>
      supabase.from('projects').update({ portal_show_quotes: checked }).eq('id', project.id)
    );
  };

  /* ── PIN handlers ── */
  const handlePinToggle = async (checked: boolean) => {
    setUsePin(checked);
    if (!checked) {
      setPinValue('');
      withSaveState(setPinSaving, async () =>
        supabase.from('projects').update({ portal_pin: null }).eq('id', project.id)
      );
    }
  };

  const handleSavePin = async () => {
    if (draftPin.length !== 4) return;
    withSaveState(setPinSaving, async () =>
      supabase.from('projects').update({ portal_pin: draftPin }).eq('id', project.id)
    );
    setPinValue(draftPin);
    setDraftPin('');
    setEditingPin(false);
  };

  /* ── Token regeneration ── */
  const handleRegenerateToken = async () => {
    const newToken = crypto.randomUUID();
    await withSaveState(setTokenState, async () =>
      supabase.from('projects').update({ portal_token: newToken }).eq('id', project.id)
    );
    setPortalToken(newToken);
  };

  /* ── render ── */
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Page heading */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configuración del Portal</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Gestiona qué ve tu cliente y cómo accede. Cada cambio se guarda de inmediato.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* ── Left column: Visibility ── */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-slate-50 pb-4 px-8 pt-8">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
                <Globe className="h-4 w-4" />
                Visibilidad de Secciones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-50">
              <VisibilityRow
                icon={<Calendar className="h-5 w-5 text-slate-400" />}
                label="Mostrar Hitos"
                sublabel="Cronograma y avances del proyecto"
                checked={showRoadmap}
                onToggle={handleRoadmapToggle}
                saveState={roadmapState}
                expandable
                expandedContent={
                  <>
                    <GranularItem label="Ver fechas de entrega" />
                    <GranularItem label="Ver notas de hito" />
                    <GranularItem label="Ver archivos vinculados al hito" />
                  </>
                }
              />
              <VisibilityRow
                icon={<FileText className="h-5 w-5 text-slate-400" />}
                label="Mostrar Archivos"
                sublabel="Planos, imágenes y documentos"
                checked={showFiles}
                onToggle={handleFilesToggle}
                saveState={filesState}
                expandable
                expandedContent={
                  <>
                    <GranularItem label="Ver tamaño de archivo" />
                    <GranularItem label="Permitir descarga directa" />
                  </>
                }
              />
              <VisibilityRow
                icon={<DollarSign className="h-5 w-5 text-slate-400" />}
                label="Mostrar Cotizaciones"
                sublabel="Presupuestos y costos aprobados"
                checked={showQuotes}
                onToggle={handleQuotesToggle}
                saveState={quotesState}
                expandable
                expandedContent={
                  <>
                    <GranularItem label="Ver desglose de ítems" />
                    <GranularItem label="Ver estado de pago" />
                  </>
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* ── Right column: Security + Link ── */}
        <div className="space-y-6">
          {/* Security card */}
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-slate-50 pb-4 px-8 pt-8">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
                <Shield className="h-4 w-4" />
                Seguridad de Acceso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* PIN toggle row */}
              <div className="flex items-center min-h-[56px] gap-4">
                <div className="p-2 bg-orange-50 rounded-xl shrink-0">
                  <Shield className="h-5 w-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900">Requerir PIN de acceso</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Protección de 4 dígitos numéricos
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <InlineToast state={pinSaving} label="PIN" />
                  <Switch checked={usePin} onCheckedChange={handlePinToggle} />
                </div>
              </div>

              {/* PIN input — visible when enabled */}
              {usePin && (
                <div className="pt-6 border-t border-slate-50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    PIN actual
                  </p>

                  {!editingPin ? (
                    <div className="flex items-center gap-4">
                      {/* masked / unmasked display */}
                      <div className="flex-1 h-14 flex items-center px-5 bg-slate-50 rounded-2xl border-2 border-slate-100 font-mono text-2xl tracking-[0.5em] text-slate-900 font-black select-none">
                        {showPin && pinValue
                          ? pinValue
                          : pinValue
                          ? '●'.repeat(pinValue.length)
                          : <span className="text-slate-300 text-sm tracking-normal font-bold">Sin PIN configurado</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPin((v) => !v)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
                        aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
                      >
                        {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <Button
                        variant="outline"
                        className="rounded-xl border-slate-200 font-black text-slate-900 hover:bg-slate-50"
                        onClick={() => { setDraftPin(''); setEditingPin(true); }}
                      >
                        Cambiar PIN
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Input
                        autoFocus
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        placeholder="XXXX"
                        value={draftPin}
                        onChange={(e) => setDraftPin(e.target.value.replace(/\D/g, ''))}
                        className="h-14 w-40 text-center font-mono text-2xl tracking-[0.5em] bg-slate-50 border-2 border-slate-100 focus:border-orange-500 focus:ring-0 rounded-2xl font-black text-slate-900 transition-all"
                      />
                      <Button
                        disabled={draftPin.length !== 4 || pinSaving === 'saving'}
                        onClick={handleSavePin}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl h-10"
                      >
                        {pinSaving === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setEditingPin(false)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                        aria-label="Cancelar"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  <InlineToast state={pinSaving} label="PIN" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Portal link card */}
          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-slate-50 pb-4 px-8 pt-8">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-slate-400 uppercase tracking-[0.2em]">
                <Globe className="h-4 w-4" />
                Enlace del Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {/* URL row */}
              <div className="flex flex-col gap-2 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL del cliente</p>
                <div className="flex items-center gap-3">
                  <span className="flex-1 text-xs font-bold text-slate-600 truncate bg-white/60 px-2 py-1 rounded-lg">
                    {portalLink}
                  </span>
                  <CopyPortalLink link={portalLink} />
                </div>
              </div>

              {/* Open + Regenerate */}
              <Button
                variant="outline"
                className="w-full h-12 rounded-2xl border-slate-200 font-black text-slate-900 gap-3 hover:bg-slate-50 transition-all"
                onClick={() => window.open(portalLink, '_blank')}
              >
                <ExternalLink className="h-4 w-4 text-slate-400" />
                Ver portal como cliente
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-10 rounded-xl border-slate-200 font-bold text-slate-500 gap-2 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all text-xs"
                  onClick={handleRegenerateToken}
                  disabled={tokenState === 'saving'}
                >
                  {tokenState === 'saving' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Regenerar token de acceso
                </Button>
                <InlineToast state={tokenState} label="Token" />
              </div>

              {tokenState !== 'idle' && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-amber-700 leading-tight">
                    El enlace anterior ya no funcionará. Comparte el nuevo enlace con tu cliente.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─── small helper: placeholder granular item ─────────────── */
function GranularItem({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <Switch size="sm" checked disabled />
    </div>
  );
}

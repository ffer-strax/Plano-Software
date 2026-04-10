'use client';

import { useState } from 'react';
import { uploadProjectFile, deleteProjectFile } from '@/app/project/[id]/actions';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Loader2,
  UploadCloud,
  FileText,
  Download
} from 'lucide-react';
import type { ProjectFile } from '@/types';
import { Switch } from '@/components/ui/switch';

interface FilesTabProps {
  projectId: string;
  files: ProjectFile[];
}

import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function FilesTab({ projectId, files }: FilesTabProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [, setSelectedCategory] = useState('other');

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    // Note: category is not currently supported by backend action, 
    // but we show the selector for UI redesign purposes.

    const result = await uploadProjectFile(formData);
    if (result.error) {
      alert(result.error);
    }
    setIsUploading(false);
  }

  async function handleDeleteFile(fileId: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;
    
    setIsDeleting(fileId);
    const result = await deleteProjectFile(fileId, projectId);
    if (result.error) {
      alert(result.error);
    }
    setIsDeleting(null);
  }

  function formatSize(bytes?: number) {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    return kb > 1000 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
  }

  // Heuristic for simulated categories based on file extensions
  const plans = files.filter(f => f.name.toLowerCase().includes('.pdf') || f.name.toLowerCase().includes('.dwg'));
  const others = files.filter(f => !plans.includes(f));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Upload Zone */}
      <div className="relative group">
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl bg-white hover:bg-slate-50 hover:border-emerald-300 transition-all cursor-pointer">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="p-3 bg-emerald-50 rounded-full mb-3 text-emerald-500 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="mb-2 text-sm text-slate-700 font-bold">Subir un archivo</p>
            <p className="text-xs text-slate-400">Selecciona una categoría y elige un archivo</p>
            
            <div className="mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Select defaultValue="other" onValueChange={(val) => val && setSelectedCategory(val)}>
                <SelectTrigger className="w-32 h-9 text-xs bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plans">Planos</SelectItem>
                  <SelectItem value="permits">Permisos</SelectItem>
                  <SelectItem value="other">Otros</SelectItem>
                </SelectContent>
              </Select>
              
              <Button size="sm" className="bg-slate-900 border-none h-9 hover:bg-slate-800 relative">
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Elegir archivo"}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </Button>
            </div>
          </div>
        </label>
      </div>

      {/* Files List grouped by categories */}
      <div className="space-y-8">
        {files.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-100 italic">
            <p className="text-slate-400">Aún no hay archivos subidos.</p>
          </div>
        ) : (
          <>
            {plans.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 lowercase font-medium">Planos</Badge>
                  <span className="text-[10px] font-bold text-slate-400">({plans.length})</span>
                </div>
                {plans.map(file => <FileRow key={file.id} file={file} isDeleting={isDeleting === file.id} onDelete={() => handleDeleteFile(file.id)} formatSize={formatSize} />)}
              </div>
            )}

            {others.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-amber-50 text-amber-600 border-amber-100 lowercase font-medium">Otros</Badge>
                  <span className="text-[10px] font-bold text-slate-400">({others.length})</span>
                </div>
                {others.map(file => <FileRow key={file.id} file={file} isDeleting={isDeleting === file.id} onDelete={() => handleDeleteFile(file.id)} formatSize={formatSize} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FileRow({ file, isDeleting, onDelete, formatSize }: { file: ProjectFile, isDeleting: boolean, onDelete: () => void, formatSize: (n?: number) => string }) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all group">
      <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
        <FileText className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 truncate">{file.name}</h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{formatSize(file.size)}</span>
          <span className="h-0.5 w-0.5 bg-slate-300 rounded-full"></span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {new Date(file.uploaded_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 border-l border-slate-50">
        <span className="text-[10px] font-bold text-slate-400 uppercase hidden md:inline tracking-tighter">Portal</span>
        <Switch 
          defaultChecked={true}
          className="data-[state=checked]:bg-emerald-500 scale-75 md:scale-90"
        />
      </div>

      <div className="flex items-center gap-1">
        <a 
          href={file.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
        >
          <Download className="h-4 w-4" />
        </a>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50" 
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

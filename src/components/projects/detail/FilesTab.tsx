'use client';

import { useState } from 'react';
import { uploadProjectFile, deleteProjectFile } from '@/app/project/[id]/actions';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  Loader2, 
  UploadCloud, 
  FileText, 
  Download,
  Calendar,
  Layers
} from 'lucide-react';
import type { ProjectFile } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface FilesTabProps {
  projectId: string;
  files: ProjectFile[];
}

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

  const plans = files.filter(f => f.name.toLowerCase().includes('.pdf') || f.name.toLowerCase().includes('.dwg'));
  const others = files.filter(f => !plans.includes(f));

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Enhanced Upload Zone */}
      <div className="relative group p-10 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Cargar Archivos</h3>
            <p className="text-sm font-medium text-slate-400">Sube planos, permisos y otros documentos importantes para el cliente.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <Select defaultValue="other" onValueChange={(val) => val && setSelectedCategory(val)}>
            <SelectTrigger className="w-full sm:w-40 h-14 bg-slate-50 border-none rounded-2xl font-bold text-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plans">Planos</SelectItem>
              <SelectItem value="permits">Permisos</SelectItem>
              <SelectItem value="other">Otros</SelectItem>
            </SelectContent>
          </Select>
          
          <Button disabled={isUploading} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold h-14 px-10 rounded-2xl relative shadow-lg shadow-slate-200">
             {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                    <UploadCloud className="mr-2 h-5 w-5" />
                    Seleccionar Archivo
                </>
             )}
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </Button>
        </div>
      </div>

      {/* Grouped Files List */}
      <div className="space-y-10">
        {files.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-100">
            <Layers className="h-10 w-10 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">Aún no hay archivos en este proyecto.</p>
          </div>
        ) : (
          <>
            {plans.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Planos ({plans.length})</h4>
                  <div className="h-px flex-1 bg-slate-100 ml-6" />
                </div>
                {plans.map(file => <FileRow key={file.id} file={file} isDeleting={isDeleting === file.id} onDelete={() => handleDeleteFile(file.id)} formatSize={formatSize} />)}
              </div>
            )}

            {others.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Otros Documentos ({others.length})</h4>
                  <div className="h-px flex-1 bg-slate-100 ml-6" />
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
    <div className="flex items-center gap-6 bg-white p-6 rounded-3xl border border-slate-100 hover:border-emerald-100 hover:shadow-xl transition-all group">
      <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
        <FileText className="h-7 w-7" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="font-black text-slate-900 truncate text-lg">{file.name}</h4>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">{formatSize(file.size)}</span>
          <div className="flex items-center gap-1.5 text-slate-400">
             <Calendar className="h-3 w-3" />
             <span className="text-[10px] font-bold uppercase tracking-widest">
                {new Date(file.uploaded_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' })}
             </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 border-l border-slate-50 pl-8">
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:inline">Portal</span>
            <Switch defaultChecked={true} className="scale-75" />
        </div>

        <div className="flex items-center gap-2">
            <a 
            href={file.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="h-10 w-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-bold"
            >
            <Download className="h-5 w-5" />
            </a>
            <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl" 
            onClick={onDelete}
            disabled={isDeleting}
            >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
        </div>
      </div>
    </div>
  );
}

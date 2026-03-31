'use client';

import { useState } from 'react';
import { uploadProjectFile } from '@/app/project/[id]/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileIcon,
  Download,
  Upload,
  Loader2,
  ExternalLink,
  Plus
} from 'lucide-react';
import type { ProjectFile } from '@/types';

interface FilesTabProps {
  projectId: string;
  files: ProjectFile[];
}

export function FilesTab({ projectId, files }: FilesTabProps) {
  const [isUploading, setIsUploading] = useState(false);

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

  function formatSize(bytes?: number) {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    return kb > 1000 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Archivos del Proyecto</h3>
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Button asChild className="bg-slate-900 hover:bg-slate-800 pointer-events-none">
            <span>
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Subir Archivo
            </span>
          </Button>
        </label>
      </div>

      {files.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileIcon className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">Aún no hay archivos en este proyecto.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {files.map((file) => (
            <Card key={file.id} className="group hover:border-slate-300 transition-colors">
              <CardContent className="flex items-center justify-between p-4 px-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{file.name}</h4>
                    <p className="text-xs text-slate-500 uppercase">
                      {file.type?.split('/')[1] || 'Archivo'} • {formatSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

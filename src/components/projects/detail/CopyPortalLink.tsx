'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link2, Check } from 'lucide-react';

export function CopyPortalLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const fullLink = typeof window !== 'undefined' ? `${window.location.origin}${link}` : link;
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <Button variant="outline" onClick={handleCopy} className="border-slate-200 bg-white hover:bg-slate-50">
      {copied ? <Check className="mr-2 h-4 w-4 text-blue-600" /> : <Link2 className="mr-2 h-4 w-4 text-slate-500" />}
      {copied ? <span className="text-blue-700 font-medium">¡Copiado!</span> : <span>Copiar Link</span>}
    </Button>
  );
}

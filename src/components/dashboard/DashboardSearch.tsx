'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function DashboardSearch() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex items-center">
      <div className={cn(
        "flex items-center transition-all duration-300 ease-in-out overflow-hidden",
        isExpanded ? "w-48 md:w-64 opacity-100" : "w-0 opacity-0"
      )}>
        <Input
          placeholder="Buscar..."
          className="h-9 text-sm focus-visible:ring-blue-600"
          autoFocus={isExpanded}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 text-slate-500 hover:text-slate-900 transition-colors",
          isExpanded && "ml-1"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
      </Button>
    </div>
  );
}

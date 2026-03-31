'use client';

import Link from 'next/link';
import { logout } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { LogOut, User, FolderPlus } from 'lucide-react';

export function Navbar({ userEmail }: { userEmail?: string | null }) {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-2xl font-bold tracking-tight text-slate-900 italic">
              PLANO
            </Link>
          </div>

          {/* Desktop Right Nav */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 text-sm text-slate-500">
              <User className="h-4 w-4" />
              <span>{userEmail}</span>
            </div>
            
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit" className="text-slate-600 hover:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}

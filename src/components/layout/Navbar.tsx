'use client';

import Link from 'next/link';
import { logout } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export function Navbar({ userEmail }: { userEmail?: string | null }) {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-2xl font-bold tracking-tight text-slate-900 italic">
              PLANO
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Proyectos
              </Link>
              <Link href="/clients" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Clientes
              </Link>
            </div>
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

import { LayoutDashboard, Settings, CreditCard } from 'lucide-react';

export function Sidebar({ userEmail }: { userEmail?: string | null }) {
  return (
    <div className="fixed left-0 top-0 h-full w-52 bg-slate-900 text-white flex flex-col p-4 z-50">
      <div className="mb-10 px-2 flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white italic">
            Plano
          </Link>
        </div>
        <span className="sr-only">{userEmail}</span>
      </div>

      <nav className="flex-1 space-y-1">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link 
          href="/clients" 
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <User className="h-4 w-4" />
          Clientes
        </Link>
        <Link 
          href="/settings/billing" 
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <CreditCard className="h-4 w-4" />
          Planes y Facturación
        </Link>
        <Link 
          href="/settings" 
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Configuración
        </Link>
      </nav>

      <div className="mt-auto border-t border-slate-800 pt-4">
        <form action={logout}>
          <button 
            type="submit" 
            className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

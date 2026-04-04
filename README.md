# Plano — SaaS para arquitectos mexicanos

Plano resuelve la comunicación caótica entre arquitecto y cliente: 
archivos perdidos en WhatsApp, cotizaciones sin firmar, clientes 
que no saben en qué etapa va su proyecto.

## Contexto del proyecto

**Lee CLAUDE.md antes de tocar cualquier archivo.**
Contiene el stack, estructura de carpetas, esquema de base de datos,
reglas de desarrollo y el plan de ejecución completo.

## Stack

Next.js 14 · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Vercel

## Correr localmente
```bash
npm install
npm run dev
```

Necesitas un archivo `.env.local` con:
NEXT_PUBLIC_SUPABASE_URL=tu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave

## Estructura
src/app/          → Rutas (App Router)
src/components/   → UI y Layout
src/lib/          → Cliente Supabase
src/hooks/        → Custom hooks
src/types/        → Tipos globales
src/utils/        → Funciones puras

## Deploy

Conectado a Vercel via GitHub. Cada push a `main` deploya automáticamente.
Variables de entorno configuradas en Vercel Dashboard.
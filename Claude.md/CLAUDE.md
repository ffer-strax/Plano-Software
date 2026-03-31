# CLAUDE.md — Plano

Eres el agente de desarrollo de **Plano**, un SaaS B2B para arquitectos mexicanos.
Lee este archivo completo antes de escribir cualquier línea de código.

---

## Qué es Plano

SaaS que resuelve la comunicación caótica entre arquitecto y cliente: archivos
perdidos en WhatsApp, cotizaciones sin firmar, clientes sin información del avance.

Dos vistas:
- **Arquitecto** — panel privado para gestionar proyectos y clientes (requiere login)
- **Cliente** — portal público por link único `/portal/[token]` (sin login)

---

## Stack obligatorio

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14+ con App Router |
| Lenguaje | TypeScript estricto — tipar TODO |
| Estilos | Tailwind CSS + shadcn/ui |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth con `@supabase/ssr` — nunca la versión legacy |
| Storage | Supabase Storage |
| Deploy | Vercel |

---

## Estructura de carpetas — no modificar

```
src/
  app/                  → Rutas (App Router)
  components/
    ui/                 → Componentes shadcn/ui
    layout/             → Header, Sidebar, Shell
  lib/                  → Cliente Supabase, helpers
  hooks/                → Custom hooks (useProjects, useUser…)
  types/                → index.ts con todos los tipos globales
  utils/                → Funciones puras
public/                 → Assets estáticos
```

---

## Rutas

```
/                        → Redirect a /login o /dashboard según sesión
/login                   → Auth pública
/register                → Registro nuevo arquitecto
/dashboard               → Lista de proyectos del arquitecto
/project/[id]            → Panel de proyecto (tabs: Archivos, Roadmap, Cotización)
/clients                 → Lista de clientes
/portal/[token]          → Portal público del cliente — sin login
```

---

## Base de datos (Supabase — ya creado)

### Tablas

```sql
-- users
id uuid PK | email text UNIQUE | full_name text | avatar_url text
role text DEFAULT 'architect' | plan text DEFAULT 'free' | created_at timestamptz

-- clients
id uuid PK | architect_id uuid FK→users | name text | email text
phone text | company text | created_at timestamptz

-- projects
id uuid PK | architect_id uuid FK→users | client_id uuid FK→clients
name text | description text | status text DEFAULT 'active'
portal_token text UNIQUE DEFAULT gen_random_uuid()::text | created_at timestamptz | updated_at timestamptz

-- files
id uuid PK | project_id uuid FK→projects | name text | url text
size bigint | type text | uploaded_at timestamptz

-- milestones
id uuid PK | project_id uuid FK→projects | title text | description text
status text DEFAULT 'pending' | due_date date | order_index int DEFAULT 0 | created_at timestamptz

-- quotes
id uuid PK | project_id uuid FK→projects | title text | total numeric(12,2)
currency text DEFAULT 'MXN' | status text DEFAULT 'draft' | notes text | created_at timestamptz
```

### RLS — habilitar en todas las tablas

```sql
-- Política base (replicar para cada tabla):
CREATE POLICY "architect_own_data"
ON [tabla] FOR ALL
USING (architect_id = auth.uid());

-- Portal público — sin auth, filtrar por token:
-- El portal consulta proyectos filtrando por portal_token sin sesión activa.
```

### Storage buckets

| Bucket | Acceso | Ruta |
|---|---|---|
| `project-files` | Privado | `project-files/{project_id}/{filename}` |
| `public-assets` | Público | logos y assets del portal |

---

## Tipos TypeScript — definir en `src/types/index.ts`

```ts
interface User { id: string; email: string; full_name: string; plan: 'free' | 'pro' }
interface Client { id: string; architect_id: string; name: string; email: string; phone: string; company: string }
interface Project { id: string; architect_id: string; client_id: string; name: string; status: 'active' | 'paused' | 'completed'; portal_token: string }
interface ProjectFile { id: string; project_id: string; name: string; url: string; size: number; type: string }
interface Milestone { id: string; project_id: string; title: string; status: 'pending' | 'in_progress' | 'done'; due_date: string; order_index: number }
interface Quote { id: string; project_id: string; title: string; total: number; currency: string; status: 'draft' | 'sent' | 'approved' }
```

---

## Autenticación

1. Login/registro con email + password via Supabase Auth
2. Sesión manejada con `@supabase/ssr` en cookies
3. Middleware protege todas las rutas excepto `/login`, `/register`, `/portal/[token]`
4. El portal es completamente público — query por `portal_token` sin sesión

---

## Diseño y UI

- **Estética**: profesional, limpia, confiable — orientada a arquitectos mexicanos
- **Color acento**: azul pizarra (`#3B5998` o similar — definir variable en globals.css)
- **Paleta**: neutros grises/blancos, acento azul pizarra, tipografía clara
- **Layout arquitecto**: sidebar fijo izquierda + contenido derecha
- **Portal cliente**: más limpio, orientado a presentación, sin elementos de gestión
- **Componentes base**: usar shadcn/ui para Button, Card, Badge, Input, Tabs, Dialog, Table

---

## Reglas de desarrollo

### Siempre
- Tipar todo — sin `any`
- Preferir Server Components; usar Client Components solo para formularios, tabs y uploads
- Queries a Supabase en `src/lib/` o directamente en Server Components
- El `portal_token` se genera automáticamente al crear proyecto — nunca cambia
- Link del portal: `https://[dominio]/portal/{portal_token}`

### Instalación inicial (primera vez)
```bash
npx shadcn@latest init
npx shadcn@latest add button card badge input tabs dialog table
```

### Nunca
- No usar la versión legacy de Supabase (`createClient` de `@supabase/supabase-js` directo en componentes)
- No hardcodear IDs ni tokens
- No exponer claves de Supabase en Client Components

---

## Autonomía del agente

- **Operación normal** (crear componentes, rutas, hooks, queries): autonomía total
- **Cambios de base de datos** (nuevas tablas, modificar schema, policies RLS): pedir confirmación antes de ejecutar
- **Borrar archivos o carpetas existentes**: pedir confirmación antes de ejecutar

---

## MVP — checklist de funcionalidades

### Vista arquitecto
- [ ] Login / registro
- [ ] Dashboard con lista de proyectos
- [ ] Crear proyecto (modal)
- [ ] Panel de proyecto con tabs: Archivos / Roadmap / Cotización
- [ ] Subir y listar archivos (Supabase Storage)
- [ ] Crear y actualizar milestones
- [ ] Crear cotización con título, total y notas
- [ ] Lista de clientes

### Portal cliente (público)
- [ ] Acceso por `/portal/[token]` sin login
- [ ] Ver nombre y estado del proyecto
- [ ] Ver y descargar archivos
- [ ] Ver roadmap con progreso visual
- [ ] Ver cotización (solo lectura)

---

## Fuera del MVP — no implementar aún

- Notificaciones por email (Resend → V2)
- Pagos y suscripciones (Stripe → V2)
- Branding por proyecto (V2)
- Múltiples usuarios por despacho (V2)
- Comentarios del cliente (V2)

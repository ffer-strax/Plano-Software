# Plano — Schema de Base de Datos

## Tablas

### profiles
Extiende auth.users de Supabase. Un perfil = un arquitecto.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK, referencia auth.users.id |
| auth_provider_id | text | Separado del email — facilita migración a Clerk |
| email | text | único |
| full_name | text | |
| phone | text | nullable |
| plan | text | 'free' \| 'pro' \| 'studio' |
| trial_ends_at | timestamptz | Para reverse trial de 14 días |
| stripe_customer_id | text | nullable |
| stripe_subscription_id | text | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**RLS:** Usuario solo lee y edita su propio perfil.

---

### projects
Un proyecto = un encargo de arquitectura.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| architect_id | uuid | FK → profiles.id |
| client_id | uuid | FK → clients.id, nullable |
| name | text | |
| description | text | nullable |
| status | text | 'active' \| 'paused' \| 'completed' |
| template_type | text | 'casa_habitacion' \| 'remodelacion' \| 'comercial' \| null |
| portal_token | text | único, generado automáticamente |
| portal_pin | text | nullable, hash de PIN de 4 dígitos |
| portal_enabled | boolean | default true |
| portal_show_roadmap | boolean | default true |
| portal_show_files | boolean | default true |
| portal_show_quotes | boolean | default true |
| portal_show_milestone_dates | boolean | default true |
| portal_show_milestone_notes | boolean | default true |
| portal_show_milestone_files | boolean | default true |
| portal_show_file_size | boolean | default true |
| portal_show_file_download | boolean | default true |
| portal_show_quote_breakdown | boolean | default true |
| portal_show_quote_taxes | boolean | default true |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**RLS:** Arquitecto solo ve sus propios proyectos.

---

### clients
Clientes del arquitecto.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| architect_id | uuid | FK → profiles.id |
| name | text | |
| email | text | nullable |
| phone | text | nullable |
| notes | text | nullable |
| created_at | timestamptz | default now() |

**RLS:** Arquitecto solo ve sus propios clientes.

---

### milestones
Hitos del roadmap de un proyecto.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| project_id | uuid | FK → projects.id |
| title | text | |
| description | text | nullable |
| status | text | 'pending' \| 'in_progress' \| 'completed' |
| due_date | date | nullable |
| order | integer | Para reordenar drag & drop |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**RLS:** Solo el arquitecto dueño del proyecto puede leer/editar.

---

### quotes
Cotizaciones por proyecto.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| project_id | uuid | FK → projects.id |
| title | text | |
| description | text | nullable |
| amount | numeric | |
| currency | text | default 'MXN' |
| status | text | 'draft' \| 'sent' \| 'approved' \| 'rejected' |
| valid_until | date | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**RLS:** Solo el arquitecto dueño del proyecto puede leer/editar.

---

### files
Archivos subidos a un proyecto.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| project_id | uuid | FK → projects.id |
| name | text | nombre visible |
| storage_path | text | path en Supabase Storage |
| file_type | text | mime type |
| file_size | integer | en bytes |
| uploaded_by | uuid | FK → profiles.id |
| created_at | timestamptz | default now() |

**RLS:** Solo el arquitecto dueño del proyecto puede subir/eliminar.
**Storage:** bucket `project-files`, privado. URLs firmadas con expiración.

---

### hours
Registro de horas por proyecto/fase.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| project_id | uuid | FK → projects.id |
| architect_id | uuid | FK → profiles.id |
| description | text | |
| phase | text | nullable |
| hours | numeric | |
| logged_date | date | |
| created_at | timestamptz | default now() |

**RLS:** Solo el arquitecto dueño puede leer/editar.

---

## Relaciones clave

```
profiles
  └── projects (1:N)
        ├── milestones (1:N)
        ├── quotes (1:N)
        ├── files (1:N)
        └── hours (1:N)
  └── clients (1:N)
        └── projects (1:N)
```

---

## Notas de seguridad

- El portal del cliente accede a datos via `portal_token` — NO via auth de Supabase
- Crear función Postgres `get_project_by_token(token)` con SECURITY DEFINER para exponer solo los datos necesarios al portal (sin RLS bypass general)
- El PIN se guarda como hash (bcrypt), nunca en texto plano
- `SUPABASE_SERVICE_ROLE_KEY` solo en server-side, nunca expuesta al cliente
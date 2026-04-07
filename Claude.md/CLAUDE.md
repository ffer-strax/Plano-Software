# Plano — CLAUDE.md

## ¿Qué es este proyecto?
SaaS B2B para arquitectos mexicanos independientes y despachos pequeños (1-5 personas).
Panel de gestión de proyectos con portal público para clientes accesible via token único
sin login requerido. Diferenciador #1: el único software de gestión para arquitectos en
México con portal de cliente sin login.

## Stack técnico
- **Framework:** Next.js 14 App Router + TypeScript
- **Estilos:** Tailwind CSS + shadcn/ui
- **Backend + DB:** Supabase (Auth MVP → Clerk en V1.5 + DB + Storage)
- **Pagos:** Stripe
- **Emails:** Resend
- **Deploy:** Vercel
- **DNS + CDN:** Cloudflare
- **Version control:** GitHub
- **Analytics:** PostHog (solo en producción con usuarios reales)
- **Error tracking:** Sentry (solo en producción con usuarios reales)

## Estructura de carpetas
```
src/
├── app/                  → rutas y páginas (App Router)
├── components/
│   ├── ui/               → componentes shadcn
│   └── layout/           → navbar, sidebar, shell
├── lib/                  → clientes: supabase, stripe, resend
├── hooks/                → custom hooks (useAuth, useProjects...)
├── types/                → tipos TypeScript globales
└── utils/                → funciones helper puras
public/                   → assets estáticos
docs/
├── schema.md             → tablas, columnas, relaciones, RLS
├── features.md           → qué hace cada feature
└── decisions.md          → decisiones técnicas y por qué
```

## Convenciones de código
- Componentes: PascalCase
- Funciones y variables: camelCase
- Archivos de ruta: lowercase con guiones
- Validación: Zod en TODAS las API routes sin excepción
- RLS activado en TODAS las tablas de Supabase
- Variables de entorno: nunca hardcodeadas, siempre .env.local
- Máximo ~200 líneas por archivo — si crece, divide
- Server Components por defecto, Client solo cuando sea necesario
- Sin comentarios obvios en el código

## Seguridad (no negociable)
- RLS policies en Supabase para cada tabla — ningún arquitecto ve datos de otro
- Middleware protegiendo todas las rutas privadas
- Zod validando cada input de API
- Auth verificada en server, nunca confiar solo en cliente
- Admin route: /admin protegida por middleware separado
- Rate limiting en rutas de auth
- Validación de archivos subidos (tipo y tamaño)

## Variables de entorno requeridas
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## Decisiones importantes
- `auth_provider_id` separado del email en el schema desde día 1 para facilitar
  migración futura de Supabase Auth → Clerk en V1.5
- Portal del cliente en `/portal/[token]` — sin autenticación, acceso por token único
- PIN de 4 dígitos opcional por proyecto para acceso seguro al portal
- Admin panel en `/admin` — middleware independiente, solo acceso de Ffer
- MVP usa Supabase Auth — NO migrar a Clerk hasta V1.5
- PostHog y Sentry se integran solo cuando haya usuarios reales en producción
- Cookies/banner de consentimiento: no requerido para MVP (mercado México únicamente)

## Contexto de producto
- **Mercado:** despachos 1-5 personas, CDMX y LATAM
- **Precios:** Free (1 proyecto) / Pro $299 MXN / Studio $599 MXN
- **Modelo:** Reverse trial — 14 días Pro gratis → baja a Free automáticamente
- **Oferta anual:** disponible primeros 30 días (2 meses gratis)
- **Aha moment:** arquitecto manda link → cliente responde "qué chido ya vi el avance"
- **Lock-in:** historial de proyectos, plantillas propias, links de portal activos
- **Loop viral:** "Potenciado por Plano" en footer del portal del cliente
- **Acceso al mercado:** papá de Ffer es arquitecto con 5-10 contactos directos

## Documentación relacionada
- `/docs/schema.md` → tablas, columnas, relaciones, RLS policies
- `/docs/features.md` → descripción detallada de cada feature
- `/docs/decisions.md` → decisiones técnicas y razonamiento

---

## Plan de ejecución

### Etapa 1 — MVP funcional (PRIORIDAD ACTUAL)
- [x] Bug: portal del cliente muestra estado incorrecto
- [x] Link del portal copiable con un clic desde el panel
- [x] Cotizaciones: crear, editar, eliminar
- [x] Hitos/Roadmap: crear, editar, eliminar, reordenar
- [x] Barra de progreso automática basada en hitos completados
- [x] Timeline visual de hitos con fechas
- [x] Clientes: crear, editar, asignar a proyecto
- [x] Editar proyecto (nombre, descripción, estado)
- [x] Registro de horas simple por fase/proyecto
- [x] Plantillas base: Casa habitación, Remodelación, Comercial
- [x] Onboarding de 5 pasos al registrarse

### Etapa 2 — Portal del cliente premium
- [x] Responsive móvil completo
- [x] Archivos descargables funcionando
- [x] Roadmap visual con progreso real
- [x] Cotización en solo lectura bien presentada
- [x] PIN de 4 dígitos opcional por proyecto
- [x] "Potenciado por Plano" en footer como loop viral

### Etapa 3 — Monetización
- [ ] Stripe con 3 planes: Free / Pro $299 MXN / Studio $599 MXN
- [ ] Reverse trial: 14 días Pro gratis → baja a Free
- [ ] Oferta anual disponible primeros 30 días (2 meses gratis)

### Etapa 4 — SuperAdmin (solo Ffer)
- [ ] Dashboard de arquitectos registrados con su plan
- [ ] Métricas: MRR, usuarios activos, proyectos, portales visitados
- [ ] PostHog para analíticas de comportamiento
- [ ] Sentry para errores en producción
- [ ] Gestión de planes sin código
- [ ] Stripe integrado para ver ingresos

### Etapa 5 — Seguridad
- [ ] PIN opcional de 4 dígitos para portal del cliente
- [ ] Auditoría de RLS — ningún arquitecto ve datos de otro
- [ ] Rate limiting en rutas de auth
- [ ] Validación de archivos subidos (tipo y tamaño)

### Etapa 6 — Landing page
- [ ] Animación scroll-driven SVG + anime.js
- [ ] Pricing visible con los 3 planes
- [ ] Demo del portal en video/gif
- [ ] SEO: "software para arquitectos México"

---

## No implementar aún

### V1.5
- Migración Supabase Auth → Clerk
- Emails automáticos de retención (Resend)
- Generación de factura en 1 clic
- Ficha de proyecto completado exportable

### V2
- Múltiples usuarios por despacho
- Integración CFDI/SAT
- Comentarios del cliente en portal
- WhatsApp Business API
- App móvil nativa
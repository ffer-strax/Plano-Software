# Plano — Decisiones Técnicas

## Auth: Supabase Auth en MVP, Clerk en V1.5

**Decisión:** Usar Supabase Auth para el MVP. Migrar a Clerk en V1.5.

**Por qué no Clerk desde el inicio:**
Clerk tiene costo desde cierto volumen y agrega complejidad innecesaria en MVP.
Supabase Auth es gratuito, está integrado con la DB y cubre todo lo que necesita el MVP.

**Por qué migrar a Clerk eventualmente:**
Mejor UI de auth lista, magic links más robustos, mejor experiencia de onboarding,
manejo de organizaciones útil para V2 (múltiples usuarios por despacho).

**Cómo preparar la migración desde día 1:**
Guardar `auth_provider_id` como columna separada del email en `profiles`.
Nunca hardcodear lógica que asuma que el auth provider es Supabase.
Toda la lógica de auth va en `src/lib/auth.ts` — un solo lugar para cambiar.

---

## Portal del cliente: token único sin login

**Decisión:** El portal es accesible via `/portal/[token]` sin autenticación.

**Por qué no login para el cliente:**
El aha moment de Plano es la fricción cero — el arquitecto manda un link y el cliente
lo abre de inmediato. Si requiere registro, se pierde el 60%+ de los clientes.
Los clientes de arquitectos (dueños de casa, empresas) no quieren otra cuenta.

**Seguridad del token:**
El token se genera con `crypto.randomUUID()` o similar — no predecible.
PIN opcional de 4 dígitos para proyectos que requieran más seguridad.
El portal solo expone datos del proyecto específico, nunca datos del arquitecto
ni de otros proyectos.

**Implementación:**
Función Postgres `get_project_by_token(token)` con SECURITY DEFINER.
Esto permite consultar datos del proyecto sin que el cliente tenga sesión de Supabase,
sin hacer bypass general de RLS.

---

## Base de datos: Supabase con RLS estricto

**Decisión:** Todas las tablas tienen RLS activado desde el inicio.

**Por qué:**
Un bug de RLS puede exponer datos de un arquitecto a otro — inaceptable.
Es más fácil activar RLS desde el inicio que agregar policies después con datos en producción.

**Regla:** Ninguna tabla sin RLS policy explícita. Si una tabla no tiene policy,
el agente debe preguntar antes de crearla.

---

## Stack de UI: shadcn/ui sobre otras opciones

**Decisión:** shadcn/ui como librería de componentes principal.

**Por qué no Material UI, Chakra, etc.:**
shadcn/ui no es una dependencia — es código que vive en el proyecto.
Se puede modificar cualquier componente sin workarounds.
Tailwind nativo, sin conflictos de estilos.
Estética más profesional y moderna para un producto B2B.

---

## Pagos: Stripe con webhook

**Decisión:** Stripe para todos los pagos. Webhooks para sincronizar estado de suscripción.

**Por qué no cobrar manualmente:**
Escala, seguridad, cumplimiento fiscal — Stripe resuelve todo esto.

**Flujo:**
Usuario elige plan → Stripe Checkout → webhook actualiza `profiles.plan` en Supabase.
Nunca confiar en el estado del cliente para saber el plan — siempre verificar en DB.

---

## Emails: Resend

**Decisión:** Resend para emails transaccionales.

**Por qué no SendGrid, Mailchimp, etc.:**
Resend tiene la mejor DX para Next.js — integración con React Email.
Precio competitivo. API simple. Dominio propio fácil de configurar.

**Emails previstos para V1.5:**
- Bienvenida al registrarse
- Recordatorio 3 días antes de que termine el trial
- Confirmación de upgrade a plan de pago
- Notificación cuando el cliente visita el portal (opcional)

**No implementar en MVP** — primero validar que los usuarios quieran el producto.

---

## Deploy: Vercel

**Decisión:** Vercel como plataforma de deploy principal.

**Por qué:**
Integración nativa con Next.js (misma empresa).
Preview deployments automáticos por PR — útil para revisar cambios.
Edge functions disponibles cuando se necesiten.

**Nota de performance:**
Verificar que Vercel y Supabase estén en la misma región para minimizar latencia.
Si hay cold starts notables, evaluar Upstash Redis para cachear queries frecuentes.
No agregar Redis en MVP.

---

## Admin: ruta /admin en el mismo repo

**Decisión:** El panel de SuperAdmin vive en `/admin` dentro del mismo proyecto Next.js.

**Por qué no repo separado:**
Comparte tipos, componentes y conexión a Supabase sin duplicar código.
Más simple de mantener en etapa temprana.

**Seguridad:**
Middleware en `src/middleware.ts` que verifica que el usuario sea Ffer
antes de permitir acceso a cualquier ruta bajo `/admin`.
Verificación por email hardcodeado en variable de entorno `ADMIN_EMAIL`.

---

## Analytics y errores: solo en producción con usuarios

**Decisión:** PostHog y Sentry NO se integran en MVP.

**Por qué:**
Sin usuarios reales no hay datos que analizar ni errores que trackear.
Agregan variables de entorno, configuración y ruido innecesario en desarrollo.

**Cuándo agregarlos:**
PostHog: cuando haya 10+ usuarios activos y quiera entender comportamiento.
Sentry: cuando haya usuarios pagando y los errores en producción importen.
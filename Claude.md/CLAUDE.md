## Plan de ejecución actual

### Etapa 1 — Completar MVP funcional (PRIORIDAD ACTUAL)
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
- [ ] Responsive móvil completo
- [ ] Archivos descargables funcionando
- [ ] Roadmap visual con progreso real
- [ ] Cotización en solo lectura bien presentada
- [ ] PIN de 4 dígitos opcional por proyecto para acceso seguro
- [ ] "Potenciado por Plano" en footer como loop viral

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

### V1.5 — No implementar aún
- Emails automáticos de retención (Resend)
- Generación de factura en 1 clic
- Ficha de proyecto completado exportable

### V2 — No implementar aún
- Múltiples usuarios por despacho
- Integración CFDI/SAT
- Comentarios del cliente en portal
- WhatsApp Business API
- App móvil nativa

## Contexto de producto

- Precio: Free (1 proyecto) / Pro $299 MXN / Studio $599 MXN
- Diferenciador #1: portal de cliente sin login — único en México
- Aha moment: arquitecto manda link, cliente responde "qué chido ya vi el avance"
- Lock-in: historial de proyectos, plantillas propias, links de portal activos
- Mercado: despachos 1-5 personas, CDMX y LATAM
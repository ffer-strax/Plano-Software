# Plano — Features

## Dashboard principal
El arquitecto ve un resumen de todos sus proyectos activos al entrar.
Muestra: nombre del proyecto, cliente asignado, estado, progreso basado en hitos completados y fecha de último update.
Acceso rápido para crear nuevo proyecto o entrar a uno existente.

---

## Proyectos

### Crear proyecto
El arquitecto puede crear un proyecto desde cero o desde una plantilla base.
Plantillas disponibles: Casa habitación, Remodelación, Comercial.
Al crear, se genera automáticamente un `portal_token` único.
Si viene de plantilla, se pre-cargan hitos típicos de ese tipo de proyecto.

### Editar proyecto
Editar nombre, descripción, estado y cliente asignado.
Cambiar estado entre: Activo, Pausado, Completado.

### Progreso automático
La barra de progreso se calcula automáticamente:
`(hitos completados / total de hitos) * 100`
Se actualiza en tiempo real al marcar hitos.

---

## Portal del cliente

### Acceso sin login
Cada proyecto tiene una URL única: `/portal/[token]`
El cliente accede sin crear cuenta ni iniciar sesión.
El arquitecto copia el link con un clic desde su panel.

### PIN opcional
El arquitecto puede activar un PIN de 4 dígitos por proyecto.
El cliente ingresa el PIN antes de ver el contenido.
El PIN se guarda como hash en la DB, nunca en texto plano.

### Contenido visible en el portal
- Nombre y descripción del proyecto
- Estado actual
- Barra de progreso
- Timeline de hitos con fechas y estado
- Cotización en solo lectura (si el arquitecto la comparte)
- Archivos descargables (si el arquitecto los habilita)

### Lo que el cliente NO puede hacer
- Editar ningún dato
- Ver otros proyectos
- Ver información de otros clientes
- Acceder al panel del arquitecto

### Footer viral
Todos los portales muestran "Potenciado por Plano" en el footer.
Este texto es un link a la landing page de Plano.
No se puede ocultar en el plan Free ni Pro — solo en Studio (por definir).

---

## Hitos / Roadmap

Cada proyecto tiene una lista de hitos ordenables.
El arquitecto puede crear, editar, eliminar y reordenar hitos.
Cada hito tiene: título, descripción opcional, estado, fecha límite opcional.
Estados: Pendiente → En progreso → Completado.
El orden se guarda con un campo `order` numérico — drag & drop en el UI.
El portal del cliente muestra el roadmap en modo solo lectura con timeline visual.

---

## Cotizaciones

El arquitecto puede crear cotizaciones dentro de cada proyecto.
Campos: título, descripción, monto, moneda (default MXN), validez, estado.
Estados: Borrador, Enviada, Aprobada, Rechazada.
La cotización se puede mostrar u ocultar en el portal del cliente.
En el portal aparece en solo lectura — el cliente no puede modificarla.

---

## Clientes

El arquitecto gestiona su propia lista de clientes.
Puede crear, editar y asignar clientes a proyectos.
Campos: nombre, email, teléfono, notas internas.
Un cliente puede tener múltiples proyectos asignados.
Los clientes son privados — ningún otro arquitecto los ve.

---

## Archivos

El arquitecto sube archivos a cada proyecto (planos, renders, contratos, etc.).
Límite de tamaño por archivo: 50MB (por definir según plan).
Tipos permitidos: PDF, JPG, PNG, DWG, ZIP (validación server-side).
Los archivos se guardan en Supabase Storage en bucket privado.
Las URLs son firmadas con expiración — no permanentes ni públicas por defecto.
El arquitecto decide cuáles archivos son visibles/descargables en el portal.

---

## Registro de horas

El arquitecto registra horas trabajadas por proyecto y fase.
Campos: descripción, fase, horas, fecha.
Vista de resumen por proyecto con total de horas.
No es facturación — es solo registro interno.

---

## Onboarding

Al registrarse por primera vez, el arquitecto pasa por 5 pasos:
1. Nombre completo y teléfono
2. Crear su primer proyecto (o elegir plantilla)
3. Agregar su primer cliente
4. Copiar el link del portal
5. Tour rápido del dashboard

El onboarding se puede saltar pero se recuerda como incompleto.

---

## Planes y límites

| Feature | Free | Pro $299 MXN | Studio $599 MXN |
|---|---|---|---|
| Proyectos activos | 1 | Ilimitados | Ilimitados |
| Portal del cliente | ✓ | ✓ | ✓ |
| PIN en portal | ✗ | ✓ | ✓ |
| Plantillas | ✗ | ✓ | ✓ |
| Registro de horas | ✗ | ✓ | ✓ |
| Storage | 100MB | 5GB | 20GB |
| Footer "Potenciado por Plano" | Siempre | Siempre | Opcional (por definir) |

### Reverse trial
Al registrarse, el arquitecto entra automáticamente a 14 días de Plan Pro gratis.
Al terminar el trial, baja automáticamente a Free sin cobrar nada.
Se muestra banner de cuenta regresiva los últimos 3 días del trial.
Al bajar a Free, los proyectos adicionales quedan en modo lectura (no se eliminan).

---

## SuperAdmin `/admin`

Solo accesible para Ffer. Protegido por middleware independiente.
Muestra: arquitectos registrados, su plan actual, fecha de registro.
Métricas: MRR, usuarios activos, proyectos creados, portales visitados.
Gestión de planes: cambiar plan de cualquier usuario manualmente.
Vista de ingresos conectada a Stripe.
PostHog y Sentry integrados en esta etapa (no en MVP).
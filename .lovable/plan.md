# Sistema de Roles y Vistas Condicionales (Admin / Paciente)

Objetivo: introducir un estado global de usuario con roles, un conmutador de desarrollo para testear, un sidebar inteligente y vistas de solo lectura para el portal del paciente. Sin Tailwind: solo clases semánticas CSS existentes o nuevas en CSS Modules.

## 1. Infraestructura de estado — `UserContext`

Nuevo `src/context/UserContext.tsx`:
- Estado: `role` (`admin | patient`), `hasClinicalAccess`, `hasAcademyAccess`.
- Derivados: `isAdmin`.
- Acciones: `setRole`, `setAccess(clinical, academy)`, `applyDevProfile(profile)`, `logout()` (resetea a admin por defecto).
- Se envuelve en `__root.tsx` sobre los providers existentes (junto a Tasks/Consultations).
- El modal "Nuevo Paciente" (`AddPatientModal`) sincroniza sus switches `portalEnabled`/`academyEnabled` con `hasClinicalAccess`/`hasAcademyAccess` del contexto (el switch escribe en el contexto).

## 2. Dev Switcher (flotante, solo admin)

Nuevo `src/components/dashboard/DevSwitcher.tsx` (+ `DevSwitcher.module.css`), montado en `__root.tsx`:
- Visible solo cuando `isAdmin`.
- `<select>` con: Administrador · Paciente: Clínica + Academia · Paciente: Solo Clínica · Paciente: Solo Academia.
- Al cambiar, llama `applyDevProfile` y actualiza el contexto en tiempo real.
- Fijo abajo (posición flotante).

## 3. Sidebar inteligente

Reescritura de `Sidebar.tsx`:
- **Admin**: menú actual intacto + botón "Cerrar sesión" en el footer (llama `logout`).
- **Paciente**: bloques exactos con encabezados:
  - PORTAL CLÍNICO → Mi Dashboard, Plan de Acción, Recursos Clínicos (si `hasClinicalAccess`); si no, bloque con 🔒 que abre modal de upsell (WhatsApp / Email / Reservar cita).
  - ACADEMIA → Mis Cursos, Explorar Cursos, Clases en Directo, Recursos Académicos (si `hasAcademyAccess`); si no, 🔒 abre escaparate con CTA a landing.
  - AJUSTES → Mis Suscripciones y Pagos, Mi Perfil.
- Footer con perfil + "Cerrar sesión".
- Nuevo `UpsellModal.tsx` reutilizable (clínico/academia) + CSS.

## 4. Rutas del portal del paciente

Nuevas rutas bajo `src/routes/portal.*.tsx` que renderizan vistas de paciente:
- `/portal` (Mi Dashboard), `/portal/plan`, `/portal/recursos-clinicos`, `/portal/suscripciones`, `/portal/perfil`.
- Academia del alumno reutiliza `/academia` (la vista Academia detecta modo alumno por contexto) con secciones internas: Mis Cursos, Explorar Cursos, Clases en Directo, Recursos Académicos.

Los enlaces del sidebar paciente apuntan a estas rutas.

## 5. Vistas Portal Clínico (solo lectura, seguridad)

En `Pacientes.tsx` y componentes clínicos, todo control de gestión (Editar datos, +Añadir métrica, +Nueva consulta, Lápiz, Papelera, +Nueva entrada del diario, subir/editar/borrar documentos, dropdowns editables) se envuelve en `isAdmin` para que el paciente no los vea.

Vistas de paciente:
- **Plan de Acción**: solo tareas `assignee === "paciente"`. El checkbox admin se sustituye por un botón/badge "Completar" (interactivo si está "Pendiente"; badge "Completada" si ya lo está). Diario de síntomas visible.
- **Diario Clínico**: reutiliza el componente; botón "+ Nueva Entrada" deshabilitado y registros marcados como "Nota interna" ocultos permanentemente.
- **Documentos / Historial**: solo archivos compartidos por el admin; sin subir/editar/borrar.
- **Dashboard / Próxima Cita**: sin dropdowns editables. Botón "Cancelar cita" → aviso de que para reprogramar debe contactar por teléfono/email; registrar "cancelada" en su historial y en la bandeja de actividad del admin.

## 6. Vistas Módulo Academia (alumno)

En `Academia.tsx`, cuando el usuario es paciente:
- **Mis Cursos**: reutiliza el diseño; se quitan "Acciones rápidas"; métricas cambian a contexto alumno (Cursos inscritos, Lecciones completadas, etc.); en cursos inscritos se elimina la barra de progreso admin y los botones editar/eliminar; orden por inscripción.
- **Explorar Cursos**: nueva sección con el catálogo completo y flujo de inscripción.
- **Clases en Directo**: solo lectura de las invitaciones del admin.
- **Recursos Académicos**: material de apoyo filtrado.

## 7. Recursos con audiencia

En `Recursos.tsx` (admin): cada recurso gana un campo `audience` (`clinico | academico`), elegible al subir/editar. La vista de paciente filtra: Recursos Clínicos muestra `clinico`, Recursos Académicos muestra `academico`, y solo los marcados como visibles/compartidos.

## Detalles técnicos

- Estado en memoria (contexts existentes); sin backend nuevo.
- La sincronización cita "cancelada" reutiliza `ConsultationsContext` (nuevo estado/acción) para reflejarse en historial y en la bandeja/actividad del admin.
- Todo el estilado en CSS Modules; se reutilizan clases de chips/badges existentes donde el diseño debe ser idéntico.
- Verificación: `tsgo` typecheck + revisión en preview con el Dev Switcher recorriendo los 4 perfiles.

## Orden de entrega

1. UserContext + wiring en `__root` + sync switches del modal.
2. DevSwitcher + Sidebar inteligente + UpsellModal + rutas del portal (navegable de punta a punta).
3. Guards `isAdmin` y vistas de solo lectura en Pacientes (Plan, Diario, Documentos, Próxima cita).
4. Academia modo alumno (Mis Cursos, Explorar, Directo, Recursos) + audiencia en Recursos.

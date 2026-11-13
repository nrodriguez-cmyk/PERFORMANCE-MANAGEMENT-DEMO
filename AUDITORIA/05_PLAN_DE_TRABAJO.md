# Plan de Trabajo de Remediación

**Principio rector:** se corrige por causa raíz, no hallazgo por hallazgo. Cada ola termina con verificación automática (tests + `tsc`) y un commit en su propia rama/worktree; nada se fusiona a `main` sin revisión.

**Asignación de modelos**
- **Opus**: diseño y cambios de alto riesgo (seguridad, persistencia, motor de cálculo, verificación adversarial).
- **Sonnet**: implementación de UI, refactor guiado, pruebas funcionales.
- **Haiku**: tareas mecánicas (limpieza, renombrados, eliminación de código muerto, inventarios).

**Leyenda de esfuerzo:** S ≤ 2 h · M ≤ 1 día · L ≤ 3 días · XL > 3 días (tiempo de agente + revisión).

---

## Mapa de olas y dependencias

```
Ola 0 Higiene ──► Ola 1 Acceso y seguridad ──► Ola 2 Persistencia central ──► Ola 4 Flujos de negocio ──► Ola 5 UX/Refactor ──► Ola 6 Verificación final
            └──► Ola 3 Motor de cálculo (en paralelo con Ola 1) ──────────┘
```

---

## Ola 0 — Higiene y red de seguridad (sin decisiones pendientes)

| ID | Tarea | Corrige | Modelo | Esf. |
|---|---|---|---|---|
| W0-1 | Corregir los ReferenceError (`answeredQuestions`/`totalQuestions` en Comercial y AF; `Briefcase` en `Evaluate.tsx:574`) y los 40 errores de `tsc`; agregar `tsc --noEmit` al build | FUN-005, ARQ-010 | Sonnet | M |
| W0-2 | Instalar Vitest; convertir el oráculo de cálculo (`oracle.ts`, 147 casos) en suite de pruebas que hoy falla en rojo | Base de Ola 3 | Sonnet | S |
| W0-3 | Eliminar `scratch/`, `temp-test-org.js`, `fix_*.cjs`, `metadata.json`, componentes huérfanos (ProfileForm, QuestionEditor, Tabs, PromotionPhasesManagerView) y dependencias sin uso | ARQ-016/017, SEC-010 (parcial) | Haiku | S |
| W0-4 | Dejar de servir `server.cjs`/`.map`; script `clean` multiplataforma | SEC (exposición de código) | Haiku | S |
| W0-5 | Purgar PII del historial de git (repositorio local, aún sin remoto). No es urgente según D-01, pero es obligatorio antes de cualquier publicación | SEC-010 | — (yo, con confirmación) | S |

## Ola 1 — Acceso y seguridad (Opus) · D-01 y D-02 resueltas (ver `03_REGISTRO_DECISIONES.md §5`); W1-7 bloqueada por D-02a–f

| ID | Tarea | Corrige | Esf. |
|---|---|---|---|
| W1-1 | Autenticación en servidor solo para `admin` y `director` (8 Directores, D-02): tabla `users` con hash argon2id y la Dirección asignada; sesión en cookie httpOnly+SameSite; expiración y bloqueo por intentos; activación de cuenta por enlace de un solo uso (D-02f). Eliminar las credenciales del código, los alias por nombre o cargo y el login de colaborador y supervisor | SEC-001/002/006/007, FUN-001/002/006 | L |
| W1-2 | Middleware RBAC en todos los `/api/*`. El `director` solo lee datos de su Dirección: el servidor filtra por la Dirección de la sesión. Cerrar `/api/db/init`, `sync-census` y los IDOR; respuestas sin `SELECT *` | SEC-003/004 | M |
| W1-3 | Enlaces: tabla `evaluation_links` (token aleatorio de 32 bytes, asignación evaluador→evaluado→rol, estado, expiración); URL solo con token; el servidor resuelve los datos del evaluado | SEC-008/009, ARQ-002, FUN-004, AMB-10 | M |
| W1-4 | Censo fuera del bundle: se carga en la BD y se sirve por API autenticada | SEC-010, ARQ-008 | M |
| W1-5 | Correo: endpoint solo para admin, destinatarios desde asignaciones, plantilla literal §7.2 con escapado; helmet, CORS, rate limit, límite de body, errores sin detalle interno | SEC (correo), §7.2 | M |
| W1-7 | Portal del Director: menú *Evaluaciones* (solo Subordinados y Autoevaluación, dentro de la sesión) y *Resultados de la Dirección* (campana de Gauss de su Dirección, promedios, buscador por nombre con detalle individual sin desglose por evaluador). La parte de resultados depende de las Olas 2 y 3 | D-02 | L |
| W1-6 | Actualizar dependencias vulnerables; reemplazar `xlsx` 0.18.5 por la distribución oficial de SheetJS o por `exceljs` | npm audit | S |

## Ola 3 — Motor de cálculo único (Opus, en paralelo con Ola 1) · Bloqueado por: D-03 a D-07

| ID | Tarea | Corrige | Esf. |
|---|---|---|---|
| W3-1 | Módulo puro `src/domain/scoring.ts` (compartido cliente/servidor): 60 % B1 + 40 % B2, tabla 6.4 por bloque, tramos 6.6 en escala 1–5, Nine-Box B1×B2, Base 100; sin imputaciones (sin datos = "pendiente") | NEG-001/002/003, FUN-007, ARQ-005/006/007 | L |
| W3-2 | Asignación de competencias y modalidad: RN-02 a RN-06, grupos de área correctos, Director con Supervisión, equivalencias de cargos, nivel esperado tabla 4.3 → brechas PDI | NEG-005/006/007/008, FUN-011 | M |
| W3-3 | Reemplazar las 8 variantes de tramos, 7 de Nine-Box, 3 de ponderación y 5 de modalidad por el módulo único | Duplicados | M (Sonnet) |
| W3-4 | Suite del oráculo en verde (147/147) + casos nuevos por cada decisión | Verificación | S |

## Ola 2 — Persistencia central (Opus) · Depende de: Ola 1 · Bloqueado por: D-03, D-09

| ID | Tarea | Corrige | Esf. |
|---|---|---|---|
| W2-1 | Una fila por asignación de evaluador; envío transaccional que consume el token y fija `is_locked` + `submitted_at`; el servidor rechaza modificaciones (RN-12) | SEC-005, ARQ-003, NEG-012 | M |
| W2-2 | La UI confirma el envío solo con `success:true` del servidor; localStorage solo como borrador | ARQ-004, FUN-003 | S |
| W2-3 | Tableros y perfil leen de la API (consolidación en servidor con el módulo de Ola 3); eliminar `getSavedPilotEvaluation` como fuente de verdad | ARQ-001, NEG-011 | L |
| W2-4 | Migraciones e índices; tablas de ciclos/períodos, auditoría y observaciones (RN-22); período no fijo en el código | ARQ-011 | M |

## Ola 4 — Flujos de negocio faltantes · Depende de: Olas 2 y 3

| ID | Tarea | Corrige | Modelo | Esf. |
|---|---|---|---|---|
| W4-1 | Asistente de 3 subprocesos por colaborador (Datos → Alcance → Centro de Enlaces) con copiar/probar enlace, correo por evaluador, vista previa y "Enviar Correos Oficiales" (RN-13) | NEG-010, FUN-009 | Sonnet | L |
| W4-2 | Auditoría en vivo desde la BD (por Dirección y fuente, con fecha y hora) | §5.1 | Sonnet | M |
| W4-3 | Promoción: retirar defaults APROBADO y el dictamen fijo; tabla 85/70/60; retroalimentación Fortalezas→Brechas; Carta de Promoción y Handover 2–4 semanas solo si está aprobada (RN-16/17/18/20). **Bloqueado por D-08** | NEG-013/014 | Opus | L |
| W4-4 | Sucesión desde el T5 real (≥ 4,75), sin sucesores fijos; criticidad, preparación y riesgo | NEG-016, RN-15 | Sonnet | M |
| W4-5 | PDI: tabla de brechas editable, 70-20-10, estados, plazos 3/6/12, reevaluación a 90 días; "Pendiente de integración" para Cumplimiento Global y SMART (RN-21) | §7.3 | Sonnet | M |
| W4-6 | Retirar datos de demostración de tableros (nivel académico, promociones, "Octubre" fijo) | FUN-008/014 | Haiku | S |
| W4-7 | Textos del instrumento por rol evaluador (perspectiva "Mi líder" vs. "el colaborador") | FUN-010 | Sonnet | M |

## Ola 5 — UX y refactor · Bloqueado por: D-10

| ID | Tarea | Modelo | Esf. |
|---|---|---|---|
| W5-1 | Partir `AdminComparisonModule` (3.341 líneas) en rutas y módulos; code-splitting (bundle actual 3,24 MB) | Sonnet | L |
| W5-2 | Unificar los 8 `*Section1Form` (5.409 líneas) en un componente + configuración de KPI por Dirección | Sonnet | M |
| W5-3 | Retirar o aislar los módulos fuera de alcance según D-10 | Haiku | S |
| W5-4 | Simplificar el menú, mensajes de error honestos (ErrorBoundary), accesibilidad básica | Sonnet | M |
| W5-5 | `strict: true` en TypeScript y eliminación progresiva de `any` | Haiku | M |

## Ola 6 — Verificación final

| ID | Tarea | Modelo |
|---|---|---|
| W6-1 | Verificador adversarial: reintenta cada hallazgo Crítico/Alto (escalada, falsificación de enlace, reenvío, IDOR, relay de correo) | Opus |
| W6-2 | Re-ejecutar los casos funcionales F-01…F-18 + flujo E2E con dos navegadores y BD de prueba | Sonnet (+ yo en navegador) |
| W6-3 | Recalcular la matriz de trazabilidad y emitir el informe de cierre | Opus |

---

## Ejecución con sub-agentes

1. **Ahora (sin bloqueos):** Ola 0 → W0-1 y W0-2 (Sonnet), W0-3 y W0-4 (Haiku), en paralelo en worktrees separados; W0-5 lo hago yo con tu confirmación.
2. **Ola 1 ya está desbloqueada** (D-01 y D-02 resueltas): un solo agente Opus, porque las tareas comparten archivos. W1-7 espera las respuestas a D-02a–f, y su dashboard espera las Olas 2 y 3.
3. **Cuando respondas D-03 a D-07:** Ola 3 (Opus), en paralelo con Ola 1 en su propio worktree.
4. Ola 2 → Ola 4 → Ola 5 en secuencia; dentro de cada ola, en paralelo las tareas que no comparten archivos.
5. Al cierre de cada ola: revisión adversarial (Opus) de los cambios y fusión a `main` tras tu visto bueno.

**Estimación total:** ~25–35 días-agente efectivos. La ruta crítica es Olas 0 → 1 → 2 → 4. Un MVP evaluable (Olas 0–3 + W4-1/W4-2) es alcanzable en aproximadamente el 60 % del esfuerzo.

---

## Bitácora de ejecución

### Ola 0 — completada en la rama `ola-0` (2026-11-13), pendiente de fusionar a `main`

| ID | Resultado |
|---|---|
| W0-1 | `tsc --noEmit` pasa de unos 40 errores a 0. Los formularios del Bloque 1 de Comercial y de Administración y Finanzas ya no se caen: verificado en el navegador, Comercial muestra "Progreso: 0 de 11". El build ahora ejecuta `tsc` antes de compilar. |
| W0-2 | Vitest 3.2.4 con la suite `tests/scoring.oracle.test.ts`: 114 casos, 51 pasan, 56 fallan y 7 se omiten. Está **en rojo por diseño**, hasta la Ola 3. Los casos de Nine-Box se omiten hasta resolver D-04. |
| W0-3 | Se eliminaron 36 archivos: `scratch/`, scripts `fix_*`, `temp-test-org.js`, `metadata.json` y 4 componentes huérfanos. También 4 dependencias sin uso: html2canvas, jspdf, motion y autoprefixer. |
| W0-4 | El bundle del servidor se genera en `build/` y ya no se sirve. `/server.cjs`, `*.map` y `*.ts` responden 404. `clean` funciona en Windows. |
| W0-5 | **Se mueve a después de W1-4.** El censo sigue en el código actual, así que purgar el historial antes no tiene efecto. Según D-01, la plataforma nunca se publicó. |

### Hallazgos nuevos durante la Ola 0 (pendientes de corregir)

| ID | Sev. | Descripción | Ola |
|---|---|---|---|
| ARQ-028 | Media | Falta `@types/react` y `@types/react-dom`, por lo que React queda sin tipos y `tsc` no ve muchos errores. Al agregarlos aparecerán errores nuevos. | 5 (W5-5) |
| ~~FUN-019~~ | — | **Descartado tras verificarlo.** El sub-agente reportó que Comercial y Administración y Finanzas eran copias de Tecnología. Al revisarlo, los 8 formularios tienen IDs propios (`com_`, `daf_`, `ti_`, …) y KPI distintos, con 4 KPI, 4 de conducta y 3 de estrategia, y título por nivel de cargo (alto/medio/bajo). Lo único copiado es la estructura del código, que se unifica en W5-2. Los KPI **no están en `requeriment.md`**, así que su contenido debe validarlo Talento Humano (AMB-07: actualizar §6.2). | — |
| FUN-023 | Media | La selección del formulario por Dirección (`Evaluate.tsx:262-294`) usa coincidencias de texto. Con el nombre oficial de la Dirección funciona en los 8 casos, pero si el enlace no trae la Dirección se usa el departamento, y entonces falla: "Auditoría Interna" y "Crédito y Cobranza" caen en Tecnología, porque `includes('it')` coincide con "aud**it**oría" y "créd**it**o"; "Atracción y Selección" cae en Operaciones. | 1 (W1-3: la Dirección sale del servidor, no del enlace) |
| FUN-020 | Media | En el PDI, las ramas de alto potencial y de brechas prioritarias nunca se ejecutan, porque usa campos que no existen (`hasPriorityBreaches`, `priorityBreaches`). Además, el título y las acciones del cuadrante 9-Box salen vacíos (`quadrantTitle` y `recommendedActions` en lugar de `title` y `actions`). | 4 (W4-5) |
| FUN-021 | Media | En `AdminComparisonModule` la bolsa de alto talento siempre queda vacía, porque `c.scores.performance` y `c.scores.potential` no existen. | 3 (W3-3) |
| FUN-022 | Media | `PilotEvaluationModal` genera brechas del PDI con una forma distinta a `PdiBreach`: le faltan `skills`, `identifiedGap` y `estimatedTime`. | 4 (W4-5) |
| ARQ-029 | Baja | En los `*Section1Form`, `comments` está tipado como texto, pero se guarda como un mapa de campo a texto. | 5 (W5-2) |

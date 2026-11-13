# 01 — Auditoría Técnica: Arquitectura y Calidad de Código

Vertical 1 (bloques 1.1, 1.6, 1.7 y rendimiento). Fecha: 2026-11-13. Alcance: solo lectura. Seguridad (auth/RBAC/inyección) la cubre otro auditor; aquí solo se citan los puntos que condicionan la arquitectura.
Decisiones vigentes (03_REGISTRO_DECISIONES §4): AMB-01 (60 % B1 + 40 % B2), AMB-09 (solo admin inicia sesión), AMB-10 (token aleatorio de un solo uso, sin PII en URL), AMB-17 (BD central obligatoria; localStorage solo borradores).

---

## 1. Resumen ejecutivo

**Veredicto: la arquitectura real es "SPA con persistencia en el navegador + BD opcional de solo escritura". No cumple AMB-17 ni AMB-10.**

1. **Un evaluador que responde desde otro equipo NO hace llegar sus respuestas al administrador.** El envío escribe en el `localStorage` del navegador del evaluador y hace un POST "fire-and-forget" a `/api/db/evaluations`. Ningún módulo del administrador lee de la BD: todos los dashboards leen `localStorage` (`getSavedPilotEvaluation`). `fetchEvaluationsFromDb` está definida pero nunca se invoca, y el servidor no tiene endpoint de listado, solo `GET /:collaboratorId` (ARQ-001).
2. **El "enlace de un solo uso" solo existe en el navegador del evaluador**: el registro de enlaces consumidos está en `localStorage`; no hay tabla de tokens; el token por defecto es derivado y predecible; el enlace lleva nombre y cédula (ARQ-002).
3. **La BD ni siquiera es fiable como respaldo**: la clave de evaluación es `eval_{colaborador}_{rol}` con `ON CONFLICT DO UPDATE` sin guarda, así que dos pares se sobrescriben y una evaluación enviada puede reemplazarse (ARQ-003); el fallo de guardado se traga en silencio y la UI marca "enviado" igual (ARQ-004).
4. **Toda la lógica de negocio vive en el cliente** (consolidación, tramos, Nine-Box, pares/jerarquía, percentiles) y está **duplicada con criterios incompatibles**: ≥ 5 definiciones de tramos de Gauss y ≥ 4 juegos de pesos. En `realEvaluationMetrics.ts` el Tramo 5 es inalcanzable (exige base100 > 100 con máximo 100), por lo que `enablesSuccession` nunca es verdadero por ese camino (ARQ-005/006/007).
5. **Calidad**: 49k líneas; componentes de 3.341 y 2.613 líneas; 8 formularios casi idénticos (5.409 líneas); `tsc --noEmit` da **40 errores**, algunos son `ReferenceError` en tiempo de ejecución (formularios Comercial y Administración y Finanzas; `Briefcase` en Evaluate.tsx); el `build` no ejecuta `tsc`; `strict` desactivado; sin tests, linter ni CI; git con 1 commit.
6. **Rendimiento**: bundle JS único de 3,24 MB (≈ 806 KB gzip) con el censo (365 KB CSV) y diccionarios embebidos y parseados al importar; 4 módulos recalculan cada uno ~2.500 colaboradores con 2 lecturas + `JSON.parse` de `localStorage` por colaborador.

**Conteo de hallazgos: 27 — Crítica 3 · Alta 9 · Media 12 · Baja 3.**

---

## 2. Arquitectura real (diagrama textual)

```
┌────────────────────────────── NAVEGADOR DEL ADMIN (SPA, HashRouter) ──────────────────────────────┐
│ App.tsx: "/" → Dashboard ; "/evaluate/:type" → Evaluate                                           │
│ Dashboard.tsx (77 líneas) → LoginPage (authService, sesión en cliente) → AdminComparisonModule     │
│   (3.341 líneas = "toda la app": pestañas, dashboards, config, nine-box, PDI, promoción…)          │
│                                                                                                    │
│ Datos estáticos EN EL BUNDLE: rawEmployeesCsv (365 KB) → generateInitialCollaborators()            │
│   → CANGURO_COLLABORATORS[~2.400] (al importar; lee localStorage 1×/colaborador)                   │
│   officialOrgChart, jobPositionsCatalog, canguroCompetencyDictionary (172 KB), KPI catalogs         │
│                                                                                                    │
│ Lógica de negocio EN CLIENTE: utils/realEvaluationMetrics (pesos, tramos, percentil),              │
│   evaluationRelations/officialOrgChart (pares/supervisor), componentes (re-cálculos propios)       │
│                                                                                                    │
│ Persistencia (localStorage, ≥ 10 claves):                                                          │
│   canguro_talent_state (AppState de UN empleado + notificaciones)   ← store.ts                     │
│   canguro_pilot_eval_{cédula} (evaluaciones por colaborador)         ← LA "BD" de los dashboards   │
│   eval_form_{id}_{rol}_{tipo} (borrador/autosave)                                                  │
│   canguro_consumed_evaluation_links (enlaces consumidos)                                           │
│   canguro_custom_collaborators, canguro_job_positions, positions overrides/families,               │
│   canguro_custom_education_mapping, global evaluation status, sesión/contraseñas (authService)     │
└───────────────┬──────────────────────────────────────────────────────────────────────────────────┘
                │ fetch (solo escritura efectiva; sin lectura global)
                ▼
┌──────────── Express (server.ts, 515 líneas, 1 archivo; Vite middleware en dev) ──────────────┐
│ POST /api/send-email (nodemailer/Gmail API) · POST /api/generate-situational (Gemini)         │
│ POST /api/evaluate-promotion (Gemini) · POST /api/auth/login                                  │
│ GET /api/db/status · POST /api/db/init · POST /api/db/sync-census · POST /api/db/sync-positions│
│ POST /api/db/evaluations · GET /api/db/evaluations/:collabId                                  │
│ POST /api/db/pdi · GET /api/db/pdi/:collabId   ← sin ningún llamador en el cliente             │
└───────────────┬───────────────────────────────────────────────────────────────────────────────┘
                ▼
        src/server/db.ts (pg Pool; supabase-js solo para /status) ──► PostgreSQL / Supabase
        Tablas: collaborators, evaluations, pdi_records, promotion_records,
                psychometric_profiles, users, job_positions   (sin tokens, sin auditoría, sin ciclos)

EVALUADOR EN OTRO EQUIPO:  enlace #/evaluate/{rol}?employee=…&idNumber=… (PII) 
   → Evaluate.tsx → guarda en SU localStorage + POST /api/db/evaluations (sin esperar/validar)
   → el Admin NO lo ve (sus dashboards leen SU localStorage). Solo coincide si es el mismo navegador.
```

---

## 3. Respuestas directas a las preguntas del encargo

| Pregunta | Respuesta | Evidencia |
|---|---|---|
| ¿Dónde vive la lógica de negocio? | En el cliente. El servidor solo persiste JSON, envía correo y llama a Gemini. | `src/utils/realEvaluationMetrics.ts:385-610`; `server.ts:463-500` |
| ¿Flujo de persistencia real? | `Evaluate.tsx` → `localStorage` (3 claves) + notificación en `canguro_talent_state` + POST a BD sin leer. Dashboards leen `localStorage`. | `Evaluate.tsx:326-353, 420-426, 441-481`; `canguroUniverso.ts:422-440` |
| ¿Respuestas desde otro equipo llegan al admin? | **No.** Solo llegan a la BD (si esta existe, el colaborador está sincronizado y la petición no falla), y nada del admin las lee. | `databaseService.ts:173` (sin uso); `server.ts:472` (solo por colaborador) |
| ¿Datos estáticos vs BD? | El censo y catálogos son la fuente de verdad en el bundle; la BD se rellena con un botón manual ("sync") desde el bundle. | `databaseService.ts:55-90`; `canguroUniverso.ts:412` |
| ¿Esquema `database_schema.sql` vs `db.ts`? | Mismas 7 tablas y columnas. Diferencias: el SQL tiene 15 índices y la extensión `uuid-ossp`; `initTables` no crea ningún índice y añade `ALTER … ADD COLUMN` de parche. Ninguno tiene tabla de enlaces/tokens, auditoría ni ciclos de evaluación. | `database_schema.sql:7-142`; `db.ts:159-288` |

---

## 4. Tabla de hallazgos

Formato de 00_METODOLOGIA §5. Esfuerzo: S ≤ 2 h, M ≤ 1 d, L ≤ 3 d, XL > 3 d.

### ARQ-001 — Las respuestas de evaluadores remotos no llegan al administrador; los dashboards leen localStorage
- **Categoría / Severidad:** Técnica / Datos y arquitectura — **Crítica**
- **Evidencia:** `src/pages/Evaluate.tsx:326-331` (guardado local), `:420-426` (`canguro_pilot_eval_*`), `:441-466` (notificación a admin escrita en el estado del evaluador), `:468-481` (POST BD y se ignora el resultado); `src/services/databaseService.ts:173-182` (`fetchEvaluationsFromDb` sin ningún llamador); `src/data/canguroUniverso.ts:422-440`; `src/components/AdminComparisonModule.tsx:257,415`, `ExecutiveTalentDashboard.tsx:272`, `OrganizationalDashboard.tsx:214`, `peopleAnalyticsEducation.ts:297`; `server.ts:463-480` (no hay listado global).
- **Descripción:** el flujo central del producto (evaluador responde, admin consolida) solo funciona si ambos usan el mismo navegador.
- **Impacto:** pérdida total de respuestas en el uso real multiequipo; viola AMB-17.
- **Corrección propuesta:** `POST /api/evaluation/submit` (por token) que persiste en BD; `GET /api/admin/evaluations` y `/api/admin/consolidated` que alimentan los dashboards; eliminar la lectura de `canguro_pilot_eval_*`; `localStorage` solo borrador (`eval_form_*`).
- **Esfuerzo:** XL — **Dependencias:** ARQ-002, 003, 005, 011 — **Requisito:** AMB-17, AMB-09

### ARQ-002 — Enlace "de un solo uso" validado solo en el navegador; sin tabla de tokens; PII en URL
- **Categoría / Severidad:** Técnica / Datos — **Crítica**
- **Evidencia:** `Evaluate.tsx:109-135` (token por defecto `eval_token_${cleanId}_${type}`, consumo en `localStorage`), `:338-353` (marca consumido localmente); `src/components/EvaluationProfileConfig.tsx:91-149` y `ProfileForm.tsx:98-112` (URL con `employee`, `idNumber`, `position`, `dept`, `dir` en claro); `database_schema.sql` y `db.ts` (no existe tabla de enlaces).
- **Descripción:** el uso único se evade con otro navegador o borrando el almacenamiento; el token derivable permite reconstruir enlaces; el evaluador no queda vinculado a un identificador.
- **Impacto:** evaluaciones duplicadas o falsificables; datos personales en URL, historial y correo; incumple AMB-10.
- **Corrección propuesta:** tabla `evaluation_links(token_hash, collaborator_id, evaluator_id/rol, cycle_id, expires_at, used_at, created_by)`; token aleatorio (≥ 128 bits), resolución de datos del evaluado en servidor; consumo transaccional en el POST de envío.
- **Esfuerzo:** L — **Dependencias:** ARQ-011 — **Requisito:** AMB-10

### ARQ-003 — Clave determinista de evaluación y upsert sin guarda: los pares se sobrescriben y lo enviado se puede reemplazar
- **Categoría / Severidad:** Técnica / Integridad de datos — **Crítica**
- **Evidencia:** `databaseService.ts:138` (`eval_${collaboratorId}_${evaluatorRole}`); `src/server/db.ts:486-505` (`ON CONFLICT (id) DO UPDATE` sin comprobar `is_locked`); `database_schema.sql:68-90` (sin `evaluator_id`, sin UNIQUE por ciclo/evaluador).
- **Descripción:** varios pares o subordinados comparten `evaluator_role = 'peer'`, por tanto el id es el mismo y el último gana; cualquier POST reemplaza una evaluación bloqueada.
- **Impacto:** se pierden evaluaciones y se altera el promedio por fuente (AMB-03); sin trazabilidad.
- **Corrección propuesta:** id uuid; `UNIQUE (cycle_id, collaborator_id, evaluator_id)`; `INSERT` solo si `is_locked = false` (o rechazo 409); histórico en `evaluation_audit`; cálculo de promedio por fuente en servidor.
- **Esfuerzo:** M — **Dependencias:** ARQ-002, 011

### ARQ-004 — Fallo de guardado en BD silencioso; la UI marca "enviado" igualmente
- **Categoría / Severidad:** Técnica / Manejo de errores — **Alta**
- **Evidencia:** `Evaluate.tsx:468-481` (`.catch(() => {})`, se ignora `savedToDb`), `:485-490` (`setIsSaved/setIsAlreadyUsed`); `Evaluate.tsx:469` (`collaboratorId` de respaldo `'emp-colaborador'`, que viola la FK `collaborators(id)`); `databaseService.ts:165-167`.
- **Descripción:** si el colaborador no fue sincronizado antes (botón manual "sync censo") o el servidor falla, la evaluación solo queda en el navegador y nadie lo nota.
- **Impacto:** pérdida silenciosa de datos; el evaluador cree haber enviado.
- **Corrección propuesta:** envío síncrono con confirmación del servidor (200 + id); reintento con cola local solo para borrador; no marcar consumido hasta ACK; poblar `collaborators` desde migración/seed, no desde un botón.
- **Esfuerzo:** M — **Dependencias:** ARQ-001

### ARQ-005 — Lógica de negocio y cálculo en el cliente (no auditable ni reproducible)
- **Categoría / Severidad:** Técnica / Arquitectura — **Alta**
- **Evidencia:** `src/utils/realEvaluationMetrics.ts:385-610` (consolidación, B1/B2/potencial, tramo, percentil); `AdminComparisonModule.tsx:257-312, 408-425` (re-cálculos de promedios y elegibilidad); `ExecutiveTalentDashboard.tsx:272-320, 657-664`; `src/utils/evaluationRelations.ts` + `officialOrgChart.ts` (resolución de pares/supervisor en el navegador).
- **Descripción:** el resultado oficial depende del código del navegador y de datos que el usuario puede alterar en `localStorage`.
- **Impacto:** riesgo de manipulación e inconsistencia entre pantallas; imposible emitir un resultado oficial único.
- **Corrección propuesta:** módulo `scoring` en servidor (funciones puras con tests) con endpoint `/api/admin/results`; el cliente solo presenta. Mover aquí tramos, pesos, Nine-Box y percentil.
- **Esfuerzo:** XL — **Dependencias:** ARQ-006, 007

### ARQ-006 — Tramos de Gauss definidos en ≥ 5 sitios con criterios incompatibles; Tramo 5 inalcanzable
- **Categoría / Severidad:** Técnica / Mantenibilidad y correctitud — **Alta**
- **Evidencia (dónde están duplicados los tramos):**
  - `src/types.ts:120-190` (`MERIT_TIERS`: escala 1-5 y base100; T4 = 80-100, T5 > 100).
  - `src/utils/realEvaluationMetrics.ts:549-558` (umbrales base100: `> 100` → T5) y `:574-583` (tabla de percentiles por `finalScore`).
  - `src/components/CargoPerformanceBreakdown.tsx:208-` y `CompetencyHeatmap.tsx:121-` (umbrales 4.75 / 4.25 / 3.75 en escala 1-5).
  - `src/components/OrganizationalDashboard.tsx:301-305` (T5 "110 %-120 %", T4 "101 %-110 %", T3 "80 %-100 %"), `:517`, `:817`, `:860`.
  - `src/components/ExecutiveTalentDashboard.tsx:490-520` (rangos en %), `:311`, `:657-664` (cortes 4.0 / 3.0 / 3.75 / 2.5 del Nine-Box), `:401,1034` (≥ 4.0).
  - `src/components/NormalCurve.tsx:957-1017` (texto 54 / 55-65 / 80-100 / 101-125); `AdminComparisonModule.tsx:312,3172-3174`; `SuccessionBankView.tsx:35`; `PromotionResultsView.tsx:474`; `peopleAnalyticsEducation.ts:351,450`.
- **Descripción:** `base100 = finalScore/5*100` ≤ 100, por lo que `tierId = 5` (`> 100`) nunca ocurre y `enablesSuccession = (tierId === 5)` es siempre falso, mientras la UI usa `≥ 4.75` para sucesión. Los nombres/rangos de T3-T5 difieren entre pantallas. Además AMB-02 fija T5 ≥ 4,75 en escala 1-5.
- **Impacto:** el mismo colaborador aparece en tramos distintos según la pantalla; la sucesión depende de qué cálculo se mire.
- **Corrección propuesta:** una única tabla `MERIT_TIERS` (en servidor, expuesta por API) y una función `tierOf(score)`; borrar todos los demás umbrales; test que cubra bordes (2,70/2,75, 4,74/4,75).
- **Esfuerzo:** M — **Dependencias:** ARQ-005 — **Requisito:** AMB-02

### ARQ-007 — Pesos duplicados e inconsistentes (y distintos de AMB-01)
- **Categoría / Severidad:** Técnica / Configuración hardcodeada — **Alta**
- **Evidencia (dónde están los pesos):**
  - Nota final 60/30/10: `realEvaluationMetrics.ts:521`; `AdminComparisonModule.tsx:2109-2160`; `EvaluationFormatDesigner.tsx:25,114`; `PotentialLeadershipDashboard.tsx:115`; `realEvaluationMetrics.ts:24`. AMB-01 decide **60/40** sin potencial.
  - Pesos por fuente en B1: 60/20/20 con reasignación en `realEvaluationMetrics.ts:475-499`; **otro juego** 50/15/20/15 y 55/20/25 en `CompetencyHeatmap.tsx:80-82`; **otro** 45/25/15/15 y 55/25/20 en `AuditEvaluationsViewer.tsx:116-117`. AMB-03 fija la tabla 6.4 del alcance.
  - Sub-bloques KPI 50/35/15 repetidos: `realEvaluationMetrics.ts:134-` (×8 Direcciones) y en cada `*Section1Form.tsx` (p. ej. `ComercialSection1Form.tsx:538-543`, `AdministracionFinanzasSection1Form.tsx:538-543`, TalentoHumano, Tecnología, TransporteLogística).
  - Pesos de promoción: 0,4/0,6 en `PromotionPhasesManagerModal.tsx:59` vs 0,3/0,4/0,3 en `promotionDefaults.ts:32`.
  - Pesos de competencias de catálogo: `PerformanceEvaluationConfigView.tsx:501-512` (20 %/34-33 %); pesos de potencial `potentialLeadershipQuestions.ts:34,84`.
- **Impacto:** cambiar una regla exige editar ≥ 15 sitios; hoy hay resultados distintos por pantalla.
- **Corrección propuesta:** `config/scoring.ts` (o tabla `scoring_config` versionada por ciclo) con pesos de fuente, de bloques y de sub-bloques por Dirección; consumida solo por el módulo de scoring de servidor.
- **Esfuerzo:** L — **Dependencias:** ARQ-005 — **Requisito:** AMB-01, AMB-03

### ARQ-008 — Censo y catálogos embebidos en el bundle; se construyen al importar; dos fuentes de verdad
- **Categoría / Severidad:** Técnica / Datos estáticos vs BD — **Alta**
- **Evidencia:** `src/data/rawEmployeesCsv.ts` (365 KB, 2.406 líneas); `canguroUniverso.ts:412` (`CANGURO_COLLABORATORS = generateInitialCollaborators()` en el import), `:240-285` (una lectura + `JSON.parse` de `localStorage` por colaborador al arrancar), `:251` (cédulas de sucesores hardcodeadas), `:381-390, 657-765` (colaboradores "custom" en `localStorage`, truncados a 500 por cuota); `databaseService.ts:55-90` (la BD se rellena desde el bundle).
- **Descripción:** el censo (con cédulas, fechas de nacimiento, cargos) viaja al navegador de cualquier visitante; actualizar el censo exige recompilar (AMB-08 está pendiente); la BD es copia manual.
- **Impacto:** datos personales expuestos (cruzar con auditor de seguridad), desactualización, arranque lento.
- **Corrección propuesta:** `collaborators` en BD como única fuente; carga por import administrativo (CSV/XLSX) con validación; API paginada con filtros; eliminar `rawEmployeesCsv.ts` y `isTopSuccessor`.
- **Esfuerzo:** L — **Dependencias:** ARQ-011

### ARQ-009 — PDI, promoción y psicometría sin persistencia real en servidor
- **Categoría / Severidad:** Técnica / Datos — **Alta**
- **Evidencia:** `db.ts:580` (`savePdi`) y `server.ts:481-495` sin ningún llamador en `src/` (búsqueda de `/api/db/pdi`: 0 resultados); no existe endpoint para `promotion_records` ni `psychometric_profiles` aunque las tablas se crean (`db.ts:225-253`); estado de PDI/promoción vive en `canguro_talent_state` y `canguro_pilot_eval_*` (`canguroUniverso.ts:640-650`).
- **Impacto:** tres módulos completos dependen del navegador; tablas vacías sin uso; viola AMB-17.
- **Corrección propuesta:** repositorios y endpoints CRUD para PDI, promoción y psicometría con el mismo patrón que evaluaciones; retirar tablas que no se vayan a usar.
- **Esfuerzo:** L — **Dependencias:** ARQ-001, 011

### ARQ-010 — Errores de `tsc` que son fallos en tiempo de ejecución
- **Categoría / Severidad:** Técnica / Calidad — **Alta**
- **Evidencia:** `ComercialSection1Form.tsx:577` y `AdministracionFinanzasSection1Form.tsx:577` (`answeredQuestions`, `totalQuestions` no definidos → `ReferenceError` al renderizar el encabezado); `src/pages/Evaluate.tsx:574` (`Briefcase` sin importar); `ErrorBoundary.tsx:94` (`this.props` no tipado); `PDI.tsx:340-405` (propiedades inexistentes en `PotentialLeadershipResults`, resultado `undefined` en tiempo de ejecución); `promotionQuestions.ts:50-102` (categorías fuera del tipo); `PromotionResultsView.tsx:240,1203` (`resolutionVerdict`).
- **Impacto:** pantallas en blanco o secciones PDI/promoción vacías según el flujo; el `build` no lo detecta (ver ARQ-018).
- **Corrección propuesta:** corregir los 40 errores (ver §5); `tsc --noEmit` como paso obligatorio de build/CI.
- **Esfuerzo:** M — **Dependencias:** ARQ-015

### ARQ-011 — Esquema de BD: divergencias entre `db.ts` y `database_schema.sql` y carencias estructurales
- **Categoría / Severidad:** Técnica / Datos — **Alta**
- **Evidencia:** `db.ts:159-288` (0 `CREATE INDEX`; `ALTER TABLE … ADD COLUMN IF NOT EXISTS` de parche en `:188-190`) vs `database_schema.sql:30-142` (15 índices, `uuid-ossp`); ambos: `period DEFAULT '2026-Q1'` (`db.ts:199`, `schema:75`), `ON DELETE CASCADE` de `evaluations/pdi_records/…` hacia `collaborators`, fechas como `VARCHAR(32)` (`birth_date`, `hire_date`), `evaluator_role`/`status` sin `CHECK`, `users` con `role DEFAULT 'colaborador'` y `management_level NOT NULL` (resto del modelo AMB-09 ya no usa estos roles), sin trigger de `updated_at`.
- **Faltan:** `evaluation_links` (tokens), `evaluation_cycles`/períodos, `evaluators` (identidad del evaluador), `audit_log` (quién envió/cambió qué y cuándo), `scoring_config`, `org_units` (jerarquía), migraciones versionadas. `POST /api/db/init` ejecuta DDL en caliente.
- **Impacto:** consultas lentas al crecer (2.500 colaboradores × fuentes); borrar un colaborador elimina sus evaluaciones; sin trazabilidad ni inmutabilidad.
- **Corrección propuesta:** una sola fuente de esquema (migraciones SQL con herramienta tipo node-pg-migrate/Drizzle), retirar `initTables`; añadir tablas arriba; `CHECK` y `ON DELETE RESTRICT`; tipos `DATE`.
- **Esfuerzo:** L — **Requisito:** AMB-09, AMB-10, AMB-17

### ARQ-012 — Sesión y rol resueltos en el cliente con bypass de administrador por cédula (referencia a seguridad)
- **Categoría / Severidad:** Técnica / Arquitectura (el detalle va con el auditor de seguridad) — **Alta**
- **Evidencia:** `Evaluate.tsx:492-493` (`sessionUser?.username === '26475804'` concede acceso de admin); `Dashboard.tsx:11-18,70-77` (el login y el rol son estado del cliente; `AdminComparisonModule` se renderiza por `currentUser` local); `authService.ts` (13 usos de `localStorage`); `server.ts:407-436` sin middleware de autorización en `/api/db/*`.
- **Impacto en arquitectura:** sin sesión de servidor no se puede aplicar AMB-09 ni proteger los endpoints de lectura de ARQ-001.
- **Corrección propuesta:** sesión httpOnly emitida por el servidor para admin/gestor; middleware `requireAdmin` en `/api/admin/*`; eliminar el bypass por cédula. Ver informe de seguridad.
- **Esfuerzo:** L — **Dependencias:** auditoría de seguridad

### ARQ-013 — Persistencia fragmentada en ≥ 10 claves de localStorage (65 llamadas en 12 archivos)
- **Categoría / Severidad:** Técnica / Arquitectura — **Media**
- **Evidencia:** `store.ts:3,6-30,95-105`; `canguroUniverso.ts` (18 usos); `authService.ts` (13); `Evaluate.tsx` (11); `evaluationPositionsConfig.ts:138-261`; `jobPositionsCatalog.ts:650-734`; `evaluationStatus.ts:119-199`; `PeopleAnalyticsEducationDashboard.tsx:49-72`. `loadState` (`store.ts:6-30`) sobrescribe las preguntas guardadas con las del código en cada carga; `AppState` modela **un único** empleado (`employeeInfo`, `selfEval`…) y se serializa entero en cada cambio (`Dashboard.tsx:24-35`, `store.ts:77-95`).
- **Impacto:** estados divergentes, cuota (hay un truncado a 500 en `canguroUniverso.ts:669,765`), pérdida de datos al limpiar el navegador.
- **Corrección propuesta:** capa `draftStore` mínima (solo borradores de formulario) + `apiClient` tipado; eliminar `canguro_talent_state` y `canguro_pilot_eval_*` como fuente de datos.
- **Esfuerzo:** L — **Dependencias:** ARQ-001

### ARQ-014 — Componentes gigantes (God components)
- **Categoría / Severidad:** Técnica / Mantenibilidad — **Media**
- **Evidencia:** `AdminComparisonModule.tsx` 3.341 líneas (27 `useState`, 5 `useEffect`, 1 componente raíz) y es el único contenido de `Dashboard`; `ExecutiveTalentDashboard.tsx` 2.613 (21 `useMemo`); `PerformanceEvaluationConfigView.tsx` 1.566 (incluye catálogos de KPI como datos, `:98-494`); `Evaluate.tsx` 1.428; `PromotionResultsView.tsx` 1.248; `PeopleAnalyticsEducationDashboard.tsx` 1.225; `OrganizationalDashboard.tsx` 1.039; `NormalCurve.tsx` 981. Rutas: solo 2 (`App.tsx:12-13`); la navegación interna es estado, no rutas.
- **Corrección propuesta:** (1) rutas reales por módulo (`/admin/resultados`, `/admin/config`, …) con `lazy`; (2) extraer hooks `useConsolidatedResults` y componentes de presentación; (3) mover catálogos a `src/config`/BD. Dividir primero `AdminComparisonModule` y `ExecutiveTalentDashboard`.
- **Esfuerzo:** XL

### ARQ-015 — Duplicación masiva: 8 `*Section1Form.tsx` y bloques por Dirección
- **Categoría / Severidad:** Técnica / Duplicación — **Media**
- **Evidencia:** 8 formularios con 5.409 líneas (`AdministracionFinanzas` 717, `Comercial` 717, `TalentoHumano` 709, `TransporteLogistica` 703, `Tecnologia` 701, `ControlInterno` 622, `Operaciones` 622, `Compras` 618); tras normalizar prefijos de clave, `Comercial` vs `AdministracionFinanzas` difieren en 422 líneas de diff pero comparten estructura y el mismo error (`:73` spread inválido, `:577`); `realEvaluationMetrics.ts:134-380` repite el mismo bloque (4 listas de claves + promedio + 50/35/15) una vez por Dirección (`ci_`, `op_`, `cp_`, …).
- **Corrección propuesta:** un `<KpiSection1Form definition={DIRECTORATE_KPI[dir]} />` dirigido por datos (AMB-07: los KPI por Dirección) y una función `block1Score(scores, definition)`; la definición se versiona en BD.
- **Esfuerzo:** L — **Requisito:** AMB-07

### ARQ-016 — Rendimiento: recálculos de 2.500 colaboradores con lecturas de localStorage dentro del bucle
- **Categoría / Severidad:** Técnica / Rendimiento — **Media**
- **Evidencia:** `getSavedPilotEvaluation` (2 llamadas por colaborador, cada una `getItem` + `JSON.parse` + validación) dentro de `.map/.forEach` en `AdminComparisonModule.tsx:408-425` (benchmarks de pares, dentro de un efecto por colaborador), `ExecutiveTalentDashboard.tsx:270-272`, `OrganizationalDashboard.tsx:212-214`, `peopleAnalyticsEducation.ts:295-297`; `calculateConsolidatedMetrics` por colaborador en cada pasada; se re-ejecuta con cada `storageTick`/`subscribeToStorage` (`OrganizationalDashboard.tsx:205-210`; `store.ts:99-105`). `canguroUniverso.ts:250-285` repite la lectura en el arranque.
- **Impacto:** ~5.000 `getItem` + `JSON.parse` por recomputo y por módulo; cada guardado dispara el recálculo en todos los módulos montados.
- **Corrección propuesta:** (corto plazo) leer una vez el mapa de evaluaciones y memorizar por `id`; (objetivo) resultados consolidados por API con paginación/agregados en SQL.
- **Esfuerzo:** M (corto plazo) / L (objetivo) — **Dependencias:** ARQ-005

### ARQ-017 — Bundle monolítico de 3,24 MB sin división de código
- **Categoría / Severidad:** Técnica / Rendimiento — **Media**
- **Evidencia (tamaños en `dist/`):** `assets/index-DApeAW_1.js` 3.239.243 B (≈ 3,1 MB; ≈ 806 KB gzip), `assets/index-BT29Lll8.css` 146 KB, `server.cjs` 48 KB (+ `.map` 71 KB). 0 usos de `React.lazy`/`Suspense`; `vite.config.ts` sin `manualChunks`. El bundle incluye `rawEmployeesCsv` (365 KB), `canguroCompetencyDictionary` (172 KB), `officialOrgChart` (68 KB), recharts, xlsx 0.18.5, pdfjs-dist 3.11.
- **Corrección propuesta:** `lazy()` por módulo/ruta, `import()` de `xlsx`/`pdfjs`, sacar censo a API, `manualChunks` (recharts, xlsx, pdfjs). Meta: < 400 KB gzip inicial.
- **Esfuerzo:** M — **Dependencias:** ARQ-008, 014

### ARQ-018 — Compilador: 40 errores, `strict` desactivado y build que no tipa
- **Categoría / Severidad:** Técnica / Build — **Media**
- **Evidencia:** `npx tsc --noEmit` → **40 errores en 12 archivos**: TS2339 ×21 (propiedad inexistente), TS2322 ×7 (tipo no asignable), TS2304 ×5 (nombre no definido), TS2698 ×5 (spread de no-objeto, 1 por formulario Section1), TS2353 ×1, TS2345 ×1. Por archivo: `PDI.tsx` 10, `EvaluationPositionsManager.tsx` 6, `promotionQuestions.ts` 4, `AdministracionFinanzasSection1Form` 3, `ComercialSection1Form` 3, `AdminComparisonModule` 2, `OrganizationalDashboard` 2, `PromotionResultsView` 2, otros 1 c/u. `tsconfig.json` sin `strict` (ni `noImplicitAny`, `strictNullChecks`); `allowJs: true`; `experimentalDecorators` sin uso; alias `@/*` → `./*` (raíz) que no se usa. `package.json` `build` = `vite build && esbuild …` (sin `tsc`); `lint` = `tsc --noEmit` (no es linter).
- **Corrección propuesta:** arreglar los 40 errores; `"strict": true` por etapas (primero `server.ts`, `db.ts`, `utils/` de scoring); `npm run typecheck` previo a `build`.
- **Esfuerzo:** M (errores) + L (strict gradual)

### ARQ-019 — Sin tests, linter, formateador ni CI; control de versiones recién creado
- **Categoría / Severidad:** Técnica / Tooling — **Media**
- **Evidencia:** 0 archivos `*.test.*`/`*.spec.*`, sin `eslint.config*`, `.prettierrc*` ni `.github/`; `git log` = 1 commit ("Línea base previa a la auditoría"); `.gitignore` no excluye `scratch/`, `temp-test-org.js`, `*.zip`; no hay `README` de arquitectura actualizado (los 3 docs `requeriment.md`, `DOCUMENTACION_PLATAFORMA.md`, `README.md` difieren, ver registro de decisiones).
- **Impacto:** cada cambio de reglas (tramos/pesos) se hace sin red de seguridad.
- **Corrección propuesta:** Vitest para `scoring` (oráculo de la auditoría de negocio), ESLint + `typescript-eslint` + Prettier, GitHub Actions (typecheck + test + build), ramas y convención de commits.
- **Esfuerzo:** M

### ARQ-020 — Dependencias sin uso, mal clasificadas o redundantes
- **Categoría / Severidad:** Técnica / Dependencias — **Media**
- **Evidencia (`package.json`):** sin ningún import en `src/` ni `server.ts`: `motion`, `jspdf`, `html2canvas`, `autoprefixer` (Tailwind 4 no lo necesita). `googleapis` se usa solo para `gmail.send` (`server.ts:4,24-28`) y duplica a `nodemailer` (paquete muy pesado). `@supabase/supabase-js` solo en `db.ts:2,44-60,108` (estado), y el acceso real es por `pg`. `vite` aparece en `dependencies` y `devDependencies`; `@vitejs/plugin-react`, `@tailwindcss/vite`, `@types/pg` en `dependencies`. `pdfjs-dist` fijado a 3.11.174 y `xlsx ^0.18.5` (vulnerable, ver auditoría de dependencias). `name: "react-example"`. `server.ts` importa `vite` en producción (`:5`) aunque solo lo usa en dev, lo que obliga a instalar `vite` en el servidor.
- **Corrección propuesta:** eliminar `motion`, `jspdf`, `html2canvas`, `autoprefixer`; elegir un solo canal de correo (SMTP vía `nodemailer`) y quitar `googleapis`; decidir pg **o** supabase-js; mover herramientas a `devDependencies`; `import('vite')` dinámico en dev.
- **Esfuerzo:** S

### ARQ-021 — `server.ts` monolítico, sin capas ni validación
- **Categoría / Severidad:** Técnica / Arquitectura de backend — **Media**
- **Evidencia:** `server.ts` (515 líneas): transporte de correo y plantillas (`:20-227`), prompts y llamadas Gemini (`:228-400`), rutas y arranque en un solo archivo; `db.ts` mezcla pool, DDL, upserts y autenticación (668 líneas, 19 `any`); `server.ts` 17 `any`; sin validación de esquema del cuerpo (`req.body` directo, p. ej. `:463-470`); sin routers, servicios ni repositorios; `period` y `evaluationType` aceptan cualquier cadena; `Pool` con `ssl.rejectUnauthorized:false` (`db.ts:21`, ver auditoría de seguridad).
- **Corrección propuesta:** `server/{routes,services,repositories,middleware,config}`; validación con zod; manejo de errores centralizado; configuración tipada de entorno.
- **Esfuerzo:** L

### ARQ-022 — Tipado débil y manejo de errores tragado
- **Categoría / Severidad:** Técnica / Calidad — **Media**
- **Evidencia:** 97 usos de `any` (`db.ts` 19, `server.ts` 17, `Evaluate.tsx` 7, `databaseService.ts` 6, `DatabaseStatusModal.tsx` 6 …); funciones públicas que devuelven `Promise<any[]>` (`db.ts:536`, `databaseService.ts:173`); 27 `catch` sin cuerpo útil más 9 con solo comentario; 61 `console.*` como único registro; `Evaluate.tsx:468` `.catch(() => {})`; `canguroUniverso.ts:271-274` ignora errores de JSON corrupto; sin logger ni correlación de errores; `ErrorBoundary` con error de tipos.
- **Corrección propuesta:** tipos compartidos `shared/types` (DTO de evaluación) entre cliente y servidor; eliminar `any` en capa de datos; `catch` que registre y propague; logger (pino) en servidor.
- **Esfuerzo:** L

### ARQ-023 — Configuración y reglas de negocio hardcodeadas
- **Categoría / Severidad:** Técnica / Mantenibilidad — **Media**
- **Evidencia:** período `'2026-Q1'` en 6 sitios (`Evaluate.tsx:474`, `databaseService.ts:152`, `db.ts:199,513`, `peopleAnalyticsEducation.ts:68`, `schema:75`); año `'2026'` en filtros y cálculo de antigüedad (`canguroUniverso.ts:~250`, `ExecutiveTalentDashboard` filtros); `positionsWithSubordinates = ['Coordinador','Supervisor','Gerente','Director']` repetida en `canguroUniverso.ts` y `AdminComparisonModule.tsx:~405`; `location 'Red de Tiendas'` (`databaseService.ts:65`, `db.ts:176`); `scope = hasSubordinates ? '360' : '180'` (`canguroUniverso.ts`) en lugar de usar la tabla de alcance AMB-05; lista de sucesores críticos y cédulas en código (`canguroUniverso.ts:251,991`); umbrales de Nine-Box y de potencial (3,90 / 2,50) en `realEvaluationMetrics.ts:19-60`.
- **Corrección propuesta:** `evaluation_cycles` (período, fechas, estado) y `scoring_config`; reglas de alcance 180/360 derivadas del organigrama en servidor.
- **Esfuerzo:** M

### ARQ-024 — Datos, tipos y UI mezclados
- **Categoría / Severidad:** Técnica / Organización — **Media**
- **Evidencia:** `src/types.ts` (667 líneas) mezcla tipos, `MERIT_TIERS`, estado por defecto y preguntas (`performanceQuestions`, `selfEvalQuestions`…); `src/data/canguroUniverso.ts` mezcla parsing de CSV, generación de colaboradores, persistencia y mutación de la lista en memoria (`:459-565`); `PerformanceEvaluationConfigView.tsx:98-512` contiene catálogos KPI y competencias dentro del componente; `canguroCompetencyDictionary.ts` (2.199 líneas) tiene un error de tipo (`:2150`) y se importa desde 4 componentes; `src/lib/utils.ts` (5 líneas) es la única carpeta compartida.
- **Corrección propuesta:** estructura por dominio `features/{evaluation,results,pdi,promotion,succession,admin}` con `api/`, `model/`, `ui/`; `shared/` para tipos y config; datos de catálogo en BD o JSON versionado.
- **Esfuerzo:** XL

### ARQ-025 — Código muerto y artefactos sueltos
- **Categoría / Severidad:** Técnica / Mantenibilidad — **Baja**
- **Evidencia:** componentes sin ningún import: `ProfileForm.tsx` (247), `PromotionPhasesManagerView.tsx` (55), `QuestionEditor.tsx` (123), `Tabs.tsx` (32); funciones sin llamador: `fetchEvaluationsFromDb`, `savePdi`/`getPdiByCollaborator` (sin cliente); scripts de raíz `fix_eval.cjs`, `fix_eval_2.cjs`, `fix_node.cjs` (parches de una sola vez sobre `Evaluate.tsx`, con cadenas corruptas por codificación); `temp-test-org.js` (58 KB; salida empaquetada de esbuild, no código fuente); `scratch/` (25 archivos: scripts de extracción que referencian rutas locales de otra herramienta de IA, `full_user_content.txt` 49 KB, `chunk3_candidate.txt` 45 KB y CSV); `metadata.json` (artefacto de AI Studio, sin uso en el build); `dist/` y `server.cjs` en el árbol.
- **Corrección propuesta:** eliminar todo lo anterior (tras revisar `scratch/` por datos personales antes de archivar fuera del repo); añadir a `.gitignore`.
- **Esfuerzo:** S

### ARQ-026 — Scripts y metadatos de proyecto
- **Categoría / Severidad:** Técnica / Tooling — **Baja**
- **Evidencia:** `package.json` `clean: "rm -rf dist server.cjs"` no funciona en Windows (cmd/PowerShell) y apunta a `server.cjs` en raíz (el build lo deja en `dist/`); `lint` ejecuta solo `tsc`; sin script `test`, `typecheck`, `format`; `dev` usa `tsx server.ts` con Vite en middleware (válido, pero `start` exige `NODE_ENV=production` sin establecerlo en el script); `"name": "react-example"`, `"version": "0.0.0"`; `vite.config.ts` ignora `**/*.zip` y `watch: null` configurable por `DISABLE_HMR` (vestigio de AI Studio).
- **Corrección propuesta:** `rimraf` o `node -e fs.rmSync`; scripts `typecheck`, `test`, `lint`; renombrar paquete.
- **Esfuerzo:** S

### ARQ-027 — Convenciones y nombres inconsistentes
- **Categoría / Severidad:** Técnica / Convenciones — **Baja**
- **Evidencia:** mezcla ES/EN (`Rating_Final`, `Objetivos`, `meritTier`, `getSavedPilotEvaluation`); "pilot" nombra evaluaciones reales (`canguro_pilot_eval_*`); prefijo `canguro_` y `eval_form_` sin espacio de nombres; claves de puntaje por prefijo mágico (`ci_`, `op_`, `cp_`, `comp`, `card`, `sup-`, `pot`) interpretadas con `startsWith` en `realEvaluationMetrics.ts:420-440`; comentarios con resultado inventado ("Pseudorandom baseline generator", `canguroUniverso.ts:~248`) sin uso claro; fechas y cédulas como cadenas con formato libre.
- **Corrección propuesta:** guía de convenciones; ids de pregunta tipados (`{block, source, directorate, index}`) en lugar de prefijos de cadena.
- **Esfuerzo:** M

---

## 5. Resumen de `npx tsc --noEmit`

Total: **40 errores** en 12 archivos.

| Código | Cantidad | Significado | Ejemplo |
|---|---|---|---|
| TS2339 | 21 | Propiedad inexistente en el tipo | `PDI.tsx:347` (`hasPriorityBreaches`), `EvaluationPositionsManager.tsx:53` (`unknown`), `AdminComparisonModule.tsx:3174` (`scores`) |
| TS2322 | 7 | Tipo no asignable | `promotionQuestions.ts:50,63,89,102`; `ExecutiveTalentDashboard.tsx:1861`; `OrganizationalDashboard.tsx:545` |
| TS2304 | 5 | Nombre no definido (**fallo en ejecución**) | `answeredQuestions`/`totalQuestions` (×2 formularios), `Briefcase` en `Evaluate.tsx:574` |
| TS2698 | 5 | Spread de tipo no-objeto | `*Section1Form.tsx:73` (Administración, Comercial, TalentoHumano, Tecnología, Transporte) |
| TS2353 / TS2345 | 1 / 1 | Propiedad desconocida / argumento no asignable | `PilotEvaluationModal.tsx:195`; `OrganizationalDashboard.tsx:194` |

Causa raíz: tipos que divergen de los datos (`PotentialLeadershipResults`, `AppState`) y copia-pega de formularios.

---

## 6. Arquitectura objetivo

```
Navegador (admin)            Navegador (evaluador, sin login)
  React SPA (rutas + lazy)     /e/{token}  (solo su instrumento, una vez)
  - presenta resultados         - pide GET /api/evaluate/{token} → instrumento + datos mínimos
  - borrador local opc.         - POST /api/evaluate/{token}/submit
        │                               │
        └──────────────┬────────────────┘
                       ▼
        Express (capas): routes → services → repositories → PostgreSQL
          middleware: sesión admin (httpOnly), validación (zod), rate limit, audit
          services: scoring (puro, con tests) · links · cycles · consolidation · pdi · promotion
                    mail (nodemailer) · ai (Gemini, solo sugiere; AMB-16)
          config: scoring_config (pesos, tramos, Nine-Box) versionada por ciclo
                       ▼
        PostgreSQL (migraciones): collaborators · org_units · evaluation_cycles ·
          evaluation_links(token_hash, used_at) · evaluations (UNIQUE por ciclo+evaluador, inmutables) ·
          evaluation_audit · pdi_records · promotion_records · psychometric_profiles ·
          scoring_config · users (solo admin/gestor)
```

Principios: (a) BD central como única fuente de verdad (AMB-17); (b) el servidor calcula y el cliente muestra; (c) una sola definición de tramos y pesos; (d) datos de censo importados, no embebidos; (e) `localStorage` solo para borradores de formulario.

---

## 7. Refactor por etapas

| Etapa | Objetivo | Contenido | Hallazgos | Esfuerzo | Criterio de salida |
|---|---|---|---|---|---|
| **0. Higiene (1-2 d)** | Base estable | Eliminar código muerto/artefactos; limpiar dependencias; arreglar los 40 errores `tsc`; `typecheck` en build; `.gitignore`; scripts; ESLint/Prettier/Vitest vacíos; CI | 010, 018, 019, 020, 025, 026 | M | `tsc` en 0; CI verde |
| **1. Núcleo de scoring (≈ 1 sem)** | Una sola fuente de reglas | Extraer `scoring` a módulo puro (`shared/scoring`) con `MERIT_TIERS` y pesos únicos (AMB-01/02/03); tests de bordes; reemplazar todos los umbrales y pesos duplicados; corregir T5 inalcanzable | 006, 007, 015 (parte B1), 005 (parte pura) | L | Todas las pantallas usan `tierOf`/`weights`; tests de oráculo |
| **2. Persistencia y enlaces (≈ 1-2 sem)** | Que el admin reciba lo que responden | Migraciones + tablas `evaluation_links`, `evaluators`, `cycles`, `audit`; `POST submit` transaccional con consumo de token; `GET` de listado/consolidado admin; sesión de servidor para admin; envío con ACK y sin PII en URL | 001, 002, 003, 004, 011, 012 | XL | Un evaluador en otro equipo envía y el admin lo ve; un 2.º intento con el mismo token falla |
| **3. Servidor consolida (≈ 1 sem)** | Mover cálculo y datos | `/api/admin/results` con scoring en servidor; censo a BD (import CSV/XLSX); PDI/promoción/psicometría con endpoints; cliente deja de leer `canguro_pilot_eval_*` | 005, 008, 009, 013, 016 | XL | `CANGURO_COLLABORATORS` y `rawEmployeesCsv.ts` eliminados |
| **4. Partir la UI (≈ 2 sem)** | Mantenibilidad y bundle | Rutas reales + `lazy`; partir `AdminComparisonModule` (3.341) y `ExecutiveTalentDashboard` (2.613) en módulos/hook; unificar los 8 `Section1Form` en uno dirigido por datos; mover catálogos de `PerformanceEvaluationConfigView` | 014, 015, 017, 024 | XL | Ningún archivo > 600 líneas; bundle inicial < 400 KB gzip |
| **5. Servidor por capas y tipado (≈ 1 sem)** | Robustez | Dividir `server.ts`/`db.ts`; zod; `strict: true`; eliminar `any` en capa de datos; logger | 021, 022, 023, 027 | L | `strict` activo en servidor y `scoring` |

**Qué partir primero:** `AdminComparisonModule` (único contenido de `Dashboard`), `ExecutiveTalentDashboard`, `realEvaluationMetrics.ts` (bloques por Dirección) y `server.ts`/`db.ts`.
**Qué mover al servidor:** scoring, tramos, resolución de pares/jerarquía, consolidación, censo, notificaciones al admin, estado de evaluaciones abiertas/cerradas, catálogos y configuración editable.
**Qué eliminar:** `rawEmployeesCsv.ts` y generación de colaboradores en cliente; `canguro_pilot_eval_*` y `canguro_talent_state` como fuentes; `fix_*.cjs`, `scratch/`, `temp-test-org.js`, `metadata.json`; componentes sin uso; `motion`, `jspdf`, `html2canvas`, `autoprefixer`, `googleapis`; la tabla `users` con roles de colaborador/director/supervisor (AMB-09); `initTables` en caliente.

---

## 8. Referencias cruzadas con otros auditores

- **Seguridad:** bypass admin por cédula (ARQ-012), endpoints sin autorización, `rejectUnauthorized:false`, censo con PII en bundle (ARQ-008), PII en URL (ARQ-002), `xlsx 0.18.5` y `pdfjs-dist 3.11` (ARQ-020).
- **Negocio:** la nota final implementada es 60/30/10 (AMB-01 pide 60/40), el tramo 5 no es alcanzable por `calculateConsolidatedMetrics` (ARQ-006/007), pesos por fuente distintos en tres módulos (ARQ-007); AMB-12 (promoción) tiene dos fórmulas (`PromotionPhasesManagerModal.tsx:59` y `promotionDefaults.ts:32`).
- **Funcional/UX:** formularios Comercial y Administración y Finanzas fallan al renderizar el encabezado (ARQ-010).

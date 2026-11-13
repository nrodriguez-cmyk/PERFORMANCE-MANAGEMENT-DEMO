# 02 — Inventario de módulos y pantallas

Alcance: solo lectura (grep y lectura de `src/`). No se ejecutó la app, no se leyó `.env.local`. Rutas relativas a la raíz del proyecto. Las referencias `archivo:línea` se verificaron con grep/lectura; donde solo se midió por conteo se indica.

---

## 0. Arquitectura de navegación (resumen)

| Capa | Mecanismo | Referencia |
|---|---|---|
| Router | `HashRouter` con `/` (Dashboard) y `/evaluate/:type` (Evaluate) | `src/App.tsx:12-13` |
| Gate de login | Si no hay sesión, `Dashboard` renderiza `LoginPage`; si hay, `AdminComparisonModule` | `src/pages/Dashboard.tsx:75-77` |
| Shell interno | `AdminComparisonModule` maneja navegación con estados `currentStage` y `currentBlock` (no usa rutas) | `src/components/AdminComparisonModule.tsx:49-50`, `navigateTo` en `:156-193` |
| Sub-sección de expediente | `individualActiveSection`, `promotionActiveSection`, `orgDashboardSection` | `AdminComparisonModule.tsx:54`, `:65`, `:59` |
| Rol que decide la UI | `isAdmin` (sidebar, hub, búsqueda de colaborador) | `AdminComparisonModule.tsx:133`; `EvaluationHubHome.tsx:26` |

**Regla de acceso observada:** el usuario no admin solo ve `inicio` (cuadrantes de evaluación). El `useEffect` de `AdminComparisonModule.tsx:144-153` fuerza `stage='inicio'` para no admins, salvo `expediente`.

---

## 1. Tabla de módulos del menú lateral

El menú lateral existe solo si `isAdmin` (`AdminComparisonModule.tsx:696`: `{isAdmin && (<aside ...>)}`). Es el `<nav>` de `:727-1295`. Los identificadores son `stage` (`currentStage`) y `block` (`currentBlock`), más la sub-sección cuando aplica.

Expresión de rol usada en el shell (copiada de código):

```ts
// AdminComparisonModule.tsx:132-133
const isMaster = isMasterAdministrator(currentUser);
const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'gestor' || isMaster;
```

Condición de visibilidad del menú (para todas las filas): `{isAdmin && (` — `AdminComparisonModule.tsx:696`.

| # | Etiqueta visible | Id interno (stage / block / sub) | Componente que renderiza | Condición de rol/visibilidad adicional | Archivo:línea (botón / render) |
|---|---|---|---|---|---|
| 1 | `1. INICIO` | `inicio` | `EvaluationHubHome` | Ninguna extra (menú solo admin) | botón `:729-742`; render `:1319-1340` |
| 2 | Dashboard Desarrollo y Desempeño | `expediente` / `organizacional` / sec `general` | `OrganizationalDashboard` | Ninguna extra | `:749-770`; render `:1458-1470` |
| 3 | Promedio por Cargo (8 Niveles) | `expediente` / `organizacional` / sec `promedios_cargo` | `OrganizationalDashboard` | Ninguna extra | `:775-794` |
| 4 | Detalle Operativo y Mapa de Calor (padre, despliega hijos) | `expediente` / `organizacional` / sec `analitica` o `ranking` | `OrganizationalDashboard` | Ninguna extra | `:801-824` |
| 4a | Indicadores Clave KPI´s, Gráficos y Mapa de Calor | `expediente` / `organizacional` / sec `analitica` | `OrganizationalDashboard` | Ninguna extra | `:830-845` |
| 4b | Ranking de Colaboradores | `expediente` / `organizacional` / sec `ranking` | `OrganizationalDashboard` | Ninguna extra | `:848-863` |
| 5 | Impacto Nivel Académico | `expediente` / `people_analytics_educacion` | `PeopleAnalyticsEducationDashboard` | Ninguna extra | `:869-886`; render `:1489-1496` |
| 6 | 2. PERFIL DEL COLABORADOR (toggle; no tiene vista propia) | — | — | Si `selectedCollabId === '__ALL__'` carga el primer colaborador | `:893-912` |
| 6a | Resultados de Evaluación de Desempeño (padre) | `expediente` / `resumen` | Bloque individual (`else` del render de expediente) | Ninguna extra | `:923-947`; render `:1497-...` |
| 6a-i | Desempeño y Competencias | `resumen` / sec `desempeno` | Bloque individual | Ninguna extra | `:953-967` |
| 6a-ii | Potencial y Liderazgo | `resumen` / sec `potencial` | Bloque individual | Ninguna extra | `:970-984` |
| 6a-iii | Matriz 9-Box | `resumen` / sec `ninebox` | Bloque individual (`NineBox`) | Ninguna extra | `:987-1001` |
| 6a-iv | Campana de Gauss, Distribución | `resumen` / sec `calibracion` | Bloque individual (`NormalCurve`) | Ninguna extra | `:1004-1018` |
| 6b | Resultados de Promoción (padre) | `expediente` / `promocion` | Bloque `promocion` (`:1763`) | Ninguna extra | `:1031-1053` |
| 6b-i | Análisis de Brechas (Barras de Progreso) | `promocion` / sec `brechas` | Bloque `promocion` | Ninguna extra | `:1059-1074` |
| 6b-ii | Matriz 9-Box (promoción) | `promocion` / sec `ninebox_promocion` | Bloque `promocion` | Ninguna extra | `:1077-1092` |
| 6b-iii | Predisposición Conductual y Adecuación al nuevo Cargo | `promocion` / sec `bigfive` | Bloque `promocion` | Ninguna extra | `:1095-1110` |
| 6b-iv | Vista Previa e Impresión PDF | `promocion` / sec `impresion_pdf` | Bloque `promocion` (`PromotionResultsView`) | Ninguna extra | `:1113-1128` |
| 6c | Plan de Desarrollo Individual (PDI) 70-20-10 | `expediente` / `pdi` | Bloque `pdi` (`PDI`) | Ninguna extra | `:1135-1161`; render `:3008` |
| 7 | MATRIZ DE SUCESIÓN | `expediente` / `banco_sucesores` | `SuccessionBankView` | Ninguna extra | `:1170-1190`; render `:1481-1488` |
| 8 | AUDITORÍA EN VIVO | `audit` | `EvaluationAuditView` | Ninguna extra | `:1194-1212`; render `:3302-3309` |
| 9 | CONFIG. DESEMPEÑO (Por Dirección & 360°) | `config_desempeno` (alias `config`) | `PerformanceEvaluationConfigView` | Ninguna extra | `:1216-1238`; render `:1345-1349` |
| 10 | CONCURSO PROMOCIÓN (Subprocesos 1 y 2 IA) | `config_promocion` | `EvaluationProfileConfig` (dentro de contenedor) | Ninguna extra | `:1241-1263`; render `:1354-1381` |
| 11 | RECUPERACIÓN CLAVE (badge "MAESTRO") | `recuperacion_clave` | `UserPasswordRecoveryModule` | Solo la del `isAdmin` del menú; el texto dice "Maestro" pero no hay chequeo de `isMaster` | `:1271-1293`; render `:1386-1390` |

Accesos rápidos en cabecera (también solo `isAdmin`):

| Botón | Acción | Archivo:línea |
|---|---|---|
| Base de Datos (abre modal) | `setShowDbModal(true)` → `DatabaseStatusModal` | `AdminComparisonModule.tsx:494-505`; modal `:3334-3337` |
| Recuperar Clave | `navigateTo('recuperacion_clave')` | `:508-522` |

Notas de rol:
- Visibilidad del menú: `isAdmin` incluye rol `gestor` (`AdminComparisonModule.tsx:133`). La etiqueta "Gestión de Accesos (Maestro)" (`:1269`) y el badge "MAESTRO" (`:1290`) se muestran también a `gestor`.
- Funciones de rol definidas pero **no usadas** en la UI: `canConfigureEvaluations`, `canViewAllCompanyResults`, `canViewDirectionResults` (importadas en `AdminComparisonModule.tsx:30`, solo aparecen ahí). Definiciones en `src/services/authService.ts:479-505`.

### 1.1 Vistas alcanzables solo por callback desde otros componentes (no por el menú)

| Vista | Cómo se llega | Archivo:línea |
|---|---|---|
| `dashboard_promociones` (`PromotionsDashboard`) | `OrganizationalDashboard.onNavigateToPromotionsDashboard` | `AdminComparisonModule.tsx:1465`, render `:1471-1480` |
| Cuadrantes de colaborador (vista no admin / modo admin) | Toggle `adminViewMode` en el hub | `EvaluationHubHome.tsx:27`, `:144-151` (ver rareza) |
| Tarjetas del hub (6 tarjetas, solo admin) | `onNavigate(card.stage, card.block)` | `EvaluationHubHome.tsx:66-131`, click `:331` |
| `ExecutiveTalentDashboard` | Embebido dentro de `OrganizationalDashboard` | `OrganizationalDashboard.tsx:528`, `:536` |
| `PeopleAnalyticsEducationDashboard` | Embebido en `OrganizationalDashboard` y `ExecutiveTalentDashboard` | `OrganizationalDashboard.tsx:544`; `ExecutiveTalentDashboard.tsx:1860` |
| `PromotionsDashboard` | Embebido en `ExecutiveTalentDashboard` | `ExecutiveTalentDashboard.tsx:2460` |
| Búsqueda de colaborador por cédula/nombre (cabecera del expediente) | Form `handleSearchByCedulaSubmit`, solo admin | `AdminComparisonModule.tsx:1502-1552` |

---

## 2. Componentes principales: acciones, API y almacenamiento

Leyenda de "conteo": número de `onClick` / `onChange` / `onSubmit` / `type="file"` / `window.print` / `fetch(` / `localStorage` por archivo (grep). Para componentes grandes, las acciones se listan por títulos y placeholders encontrados, no línea a línea.

### 2.1 Login y sesión

| Componente | Archivo (líneas) | Acciones de usuario | Llamadas /api | localStorage |
|---|---|---|---|---|
| LoginPage | `src/components/LoginPage.tsx` (374) | Form cédula + contraseña (`onSubmit` `:139`; campos `:149`, `:162-164`); `handleSubmit` `:48-62` llama `loginWithCedula`; si `mustChangePassword` abre modal de nueva clave (`:54-56`); formulario de nueva clave (`:220`) con toggles de visibilidad (`:233`, `:259`) | Indirecta vía authService (`/api/auth/login`) | Indirecto (ver authService) |
| Dashboard (gate) | `src/pages/Dashboard.tsx` (85) | Escucha `canguro_auth_change`; al login carga ficha del colaborador en el estado (`handleLoginSuccess`) | No | Lee/escribe `canguro_talent_state` (ver store.ts) |
| authService | `src/services/authService.ts` (568) | Ver sección 5 | `POST /api/auth/login` (`:346`); `POST /api/auth/reset-password` (`:94`, sin ruta en servidor) | `canguro_authenticated_session` (`:17`), `canguro_custom_passwords` (`:18`), `canguro_password_resets_log` (`:20`), lectura de `canguro_custom_collaborators` (`:371`) |

### 2.2 Shell y dashboards (vistas del expediente)

| Componente | Archivo (líneas) | Acciones de usuario | Llamadas /api | localStorage |
|---|---|---|---|---|
| AdminComparisonModule | `src/components/AdminComparisonModule.tsx` (3341) | Sidebar (20 hojas, ver §1); búsqueda por cédula/nombre (`:1503-1552`, auto-match a 7+ dígitos o 3+ letras); "Imprimir Ficha" → `window.print()` (`:2101`, dentro del bloque `resumen`/`calibracion` `:1989`); cabecera: Base de Datos, Recuperar Clave, notificaciones, cierre de sesión (`logoutSession`, `:663`, `:672`, `:681`); modales (promoción `:3315`, piloto `:3326`, BD `:3334`) | Ninguna directa | Ninguna directa (store y canguroUniverso) |
| EvaluationHubHome | `src/components/EvaluationHubHome.tsx` (464) | 6 tarjetas de módulo (`:66-131`); toggle admin/cuadrantes; selector de colaborador (`:214`) | Ninguna | Ninguna directa |
| OrganizationalDashboard | `src/components/OrganizationalDashboard.tsx` (1124) | Filtros (onChange ×6), 1 onClick; escucha `subscribeToStorage` (`:203`) | Ninguna | Lee estado vía store (`canguro_talent_state`); 1 mención a localStorage (comentario, `:203`) |
| ExecutiveTalentDashboard | `src/components/ExecutiveTalentDashboard.tsx` (2613) | Filtros (onChange ×7), 7 onClick; drill-down a desglose por Dirección (title `:"Ver desglose..."`) | Ninguna | Escucha cambios de storage (`:243`) |
| PromotionsDashboard | `src/components/PromotionsDashboard.tsx` (890) | Búsqueda por colaborador/cargo (placeholder), selección → `onSelectCollaborator` | Ninguna | Ninguna |
| SuccessionBankView | `src/components/SuccessionBankView.tsx` (213) | Selección de colaborador (1 onClick) | Ninguna | Ninguna |
| PeopleAnalyticsEducationDashboard | `src/components/PeopleAnalyticsEducationDashboard.tsx` (1297) | Descargar plantilla CSV (`handleDownloadCsvTemplate` `:150-162`); importar texto CSV pegado (`parseUploadedEducationCsv(pastedCsvText)` `:171`); restablecer dataset base (`:72`); búsqueda (placeholder); 13 onClick | Ninguna | `canguro_custom_education_mapping` (lee `:49`, escribe `:64`, borra `:72`) |
| PotentialLeadershipDashboard | `src/components/PotentialLeadershipDashboard.tsx` (545) | Solo visualización (1 onClick) | Ninguna | Ninguna |
| EvaluationAuditView | `src/components/EvaluationAuditView.tsx` (277) | Búsqueda (placeholder), selección de colaborador (`onSelectCollaborator`), 3 onClick; incluye `AuditEvaluationsViewer` (`:273`) | Ninguna | Ninguna |
| AuditEvaluationsViewer | `src/components/AuditEvaluationsViewer.tsx` | Solo lectura de evaluaciones | Ninguna | Ninguna |
| PromotionResultsView | `src/components/PromotionResultsView.tsx` (1344) | Imprimir (`window.print()` `:1188`, `:1314`); cerrar vista previa (title) | Ninguna | Ninguna |
| PDI | `src/components/PDI.tsx` (996) | Alta/edición/eliminación de brechas y metas (titles "Modificar brecha", "Eliminar brecha", 2 formularios `onSubmit`, 9 onClick); gráfico `PDIProgressChart` (`:682`) | Ninguna (el endpoint `/api/db/pdi` existe en servidor pero el cliente no lo llama) | Persiste vía `AppState` → `canguro_talent_state` (por `onUpdateGoals`) |
| PsychometricDossierVisualizer | `src/components/PsychometricDossierVisualizer.tsx` (443) | Copiar informe psicométrico en Markdown (title); ver detalle de fortalezas/riesgos | Ninguna | Ninguna |
| CompetencyGapAnalysisChart, RadarMetrics, NineBox, NormalCurve | `src/components/*` | Solo visualización | Ninguna | Ninguna |

### 2.3 Configuración y administración

| Componente | Archivo (líneas) | Acciones de usuario | Llamadas /api | localStorage |
|---|---|---|---|---|
| PerformanceEvaluationConfigView | `src/components/PerformanceEvaluationConfigView.tsx` (1651) | Editar configuración de evaluación por Dirección/360° (18 onClick, 12 onChange, 1 form); restablecer a valores de fábrica (title); embebe `EvaluationPositionsManager` (`:969`) | Ninguna | `canguro_custom_directions_eval_config` (lee `:670`, escribe `:689`, `:719`) |
| EvaluationPositionsManager | `src/components/EvaluationPositionsManager.tsx` (459) | Habilitar/inhabilitar familias y cargos; "Activar solo Gerentes, Coordinadores y Supervisores"; "Habilitar todos (100%)"; "Inhabilitar todas temporalmente"; restablecer familia | Ninguna | `canguro_enabled_position_families`, `canguro_custom_position_overrides` (vía `src/utils/evaluationPositionsConfig.ts:134-135`, `:142-261`) |
| EvaluationProfileConfig | `src/components/EvaluationProfileConfig.tsx` (987) | Formulario de ficha de colaborador (nombre, cédula, cargo, departamento, dirección; detalle de inputs no verificado línea a línea); generar enlaces de evaluación (ver §4); lanzar concurso de promoción (`handleLaunchPromotionEvaluation`, `:154-195`); embebe `EvaluationFormatDesigner` (`:965`) y `JobDescriptorModal` (`:979`); envío de correo | `POST /api/send-email` (`:224`) | `canguro_custom_collaborators` (lee `:165`, escribe `:183`) |
| EvaluationFormatDesigner | `src/components/EvaluationFormatDesigner.tsx` (281) | Editar y eliminar reactivos (titles), cambios en el formato del instrumento | Ninguna | Ninguna directa |
| JobDescriptorModal | `src/components/JobDescriptorModal.tsx` (603) | Subir PDF de descriptor de cargo (`<input type="file">` `:293-298`; arrastrar y soltar `:116`; `handlePdfUpload` `:84`); restablecer plantilla (title) | `POST /api/generate-situational` (`:141`) | Ninguna |
| UserPasswordRecoveryModule | `src/components/UserPasswordRecoveryModule.tsx` (405) | Buscar colaborador por cédula o nombre (placeholder); reiniciar contraseña (`resetUserPassword(..., 'Administrador Maestro')` `:89`); copiar mensaje para WhatsApp/correo (`navigator.clipboard.writeText` `:109`) | Indirecta (`/api/auth/reset-password` vía authService, sin ruta en servidor) | Vía authService: `canguro_custom_passwords`, `canguro_password_resets_log` |
| DatabaseStatusModal | `src/components/DatabaseStatusModal.tsx` (847) | Arrastrar/subir Excel o CSV (`<input type="file" accept=".xlsx,.xls,.csv">` `:534-535`; `XLSX.read` `:131`); vista de censo actual; sincronización manual (`handleManualSyncPostgres` `:307`, `:441`); "Importar y vincular" (`handleCommitImport` `:265`, `:614`) | `GET /api/db/status` (`checkDatabaseStatus` `:103`, `:323`); `POST /api/db/sync-census` (`syncCensusToDatabase` `:281`, `:311`) | Ninguna |
| PilotEvaluationModal | `src/components/PilotEvaluationModal.tsx` (636) | Cargar puntajes de prueba (titles "Tramo 4", "Tramo 5 / Sucesión", "Cargar con brechas"); guardar evaluación piloto. **Nunca se abre** (ver §6) | Ninguna | `canguro_pilot_eval_<id>` (vía `savePilotEvaluation`, `src/data/canguroUniverso.ts:448-457`) |
| PromotionPhasesManagerModal | `src/components/PromotionPhasesManagerModal.tsx` (396) | Gestionar fases de promoción (9 onClick, 9 onChange). **Nunca se abre** (ver §6) | Ninguna | Ninguna |
| DatabaseStatusModal (ver arriba) | | | | |

### 2.4 Login de colaboradores vía componente de cuadrantes

| Componente | Archivo (líneas) | Acciones | API | localStorage |
|---|---|---|---|---|
| CollaboratorEvaluationQuadrants | `src/components/CollaboratorEvaluationQuadrants.tsx` (415) | 4 botones de lanzamiento (`handleLaunch` `:112-131`) para `self`, `supervisor`, `peer`, `subordinate`; aviso si el período está cerrado (`evalStatus.isOpen`) | Ninguna | Lee `canguro_evaluations_global_status` vía `src/utils/evaluationStatus.ts` |

---

## 3. Rutas `/evaluate/:type` (src/pages/Evaluate.tsx)

### 3.1 Valores de `type`

Ruta: `src/App.tsx:13`. Lectura de `type`: `Evaluate.tsx:33` (`useParams`).

| Valor de `type` | Clave de dato (`evalKeyMap`) | Forma que se muestra | Generado por la app | Archivo:línea |
|---|---|---|---|---|
| `self` | `selfEval` | Formulario estándar 4 secciones (autoevaluación) | Sí (EvaluationProfileConfig, CollaboratorEvaluationQuadrants) | `Evaluate.tsx:93-102`, `:49` (`isSelf`) |
| `supervisor` | `supervisorEval` | Estándar 4 secciones (sección 2 con `isSupervisor`) | Sí | `:93-102`; sección 2 `:1210-1216` |
| `peer` | `peerEval` | Estándar 4 secciones | Sí | `:93-102` |
| `subordinate` | `subordinateEval` | Estándar 4 secciones | Sí (solo si el cargo tiene subordinados) | `:93-102` |
| `hr` | `hrEval` | Estándar 4 secciones (sin rol de evaluador preset) | **No** (ningún generador de enlace) | `:93-102`, `:370` |
| `promotion` / `promotion_candidate` | `promotionEval` | Candidato: Liderazgo (`PotentialLeadershipEvalForm` `:901`), Big Five (`BigFiveEvalForm` `:925`), Situacional (`:949`). Alias: `isPromotionCandidate` `:50` | `promotion` sí; `promotion_candidate` solo como alias | `:50`, `:882-1020` |
| `promotion_supervisor` | `promotionEval` | Supervisor 180° promoción: `SituationalEvalForm` (`:1043`) | Sí | `:51`, `:1021-...` |

Tipo desconocido: `evalKeyMap[type || 'self'] || 'selfEval'` (`Evaluate.tsx:104`) — cae a `selfEval` y muestra el formulario estándar.

Selección de formulario por rol/tipo (condiciones exactas):

```ts
// Evaluate.tsx:49-52
const isSelf = type === 'self';
const isPromotionCandidate = type === 'promotion' || type === 'promotion_candidate';
const isPromotionSupervisor = type === 'promotion_supervisor';
const isPromotion = isPromotionCandidate || isPromotionSupervisor;
// Evaluate.tsx:882  -> {isPromotionCandidate ? (...) : isPromotionSupervisor ? (...) : (estándar)}
```

Estándar (no promoción): 4 secciones, `TOTAL_SECTIONS = 4` (`:57`): 
- Sección 1 "Metas por dirección": `renderSection1GoalsForm()` (`:1188`), elige formulario según `displayDirectorate`/cargo: Tecnología, Talento Humano, Administración y Finanzas, Compras, Control Interno, Comercial, Transporte y Logística, o Operaciones por defecto (`:261-294`).
- Sección 2 "Competencias": `SituationalEvalForm` (`:1210-1216`).
- Sección 3 "Potencial": `PotentialLeadershipEvalForm` (`:1236`).
- Sección 4 "Cualitativa": textareas con texto distinto para `isSelf` vs evaluador (`:1252-1337`).

Evaluador (no self): el nombre y cargo del evaluador se piden en el formulario o vienen por query (ver §3.2). Para `supervisor`/`promotion_supervisor` se preset "Supervisor Inmediato" (`:87`); `peer` → "Par / Colega Homólogo" (`:88`); `subordinate` → "Subordinado / Equipo a Cargo" (`:89`).

Control de acceso en Evaluate:
- Período global cerrado y no admin → pantalla de cierre (`Evaluate.tsx:491-494`, `isAdmin` `:493` = `role==='admin'` o `username===<cédula maestra>`; no incluye `gestor`).
- Cargo no habilitado y no admin y no promoción → pantalla de cargo no habilitado (`:558-559`).
- Enlace de uso único: consulta `canguro_consumed_evaluation_links` (`:116`) y bloquea reenvío (`:353` escribe, alert en envío).

### 3.2 Parámetros de query que lee Evaluate.tsx

| Parámetro | Uso | Archivo:línea |
|---|---|---|
| `employee` | Nombre del evaluado (`displayEmployeeName`) | `Evaluate.tsx:38` |
| `position` | Cargo del evaluado | `:39` |
| `idNumber` | Cédula del evaluado (normalizada en `cleanId`) | `:40`, `:63` |
| `dept` | Departamento | `:41` |
| `dir` | Dirección | `:42` |
| `evaluatorName` / `evaluator` | Nombre del evaluador (fallback) | `:76` |
| `evaluatorPos` / `evaluatorPosition` | Cargo del evaluador | `:77` |
| `token` | Identificador de enlace (uso único); si falta se deriva `eval_token_<cleanId>_<type>` | `:110-111` |
| `targetPos` / `targetPosition` | Cargo superior objetivo (promoción) | `:240` |

Claves de `localStorage` leídas/escritas por Evaluate: `eval_form_<cleanId>_<key>_<type>` (autosave, `:107`, `:140`, `:214`, `:331`), `eval_form_..._last_autosave` (`:205-216`), `canguro_consumed_evaluation_links` (`:116`, `:353`), `canguro_pilot_eval_<digits>` (`:152`, `:419-426`). Estado general vía `loadState/saveState` → `canguro_talent_state`.

Llamada a API desde Evaluate: `saveEvaluationRecord` → `POST /api/db/evaluations` (`Evaluate.tsx:468`; definición en `src/services/databaseService.ts:127-172`).

Exportaciones: Evaluate no exporta PDF/Excel.

---

## 4. Cómo se generan los enlaces de evaluación

Búsqueda: `grep "/evaluate"` en `src/`. Hay 4 puntos de generación.

| Origen | Archivo:línea | Base | Tipos generados | Parámetros |
|---|---|---|---|---|
| **EvaluationProfileConfig** (principal; genera enlaces del expediente) | `src/components/EvaluationProfileConfig.tsx:83-100` (base), `:102-150` (lista) | `${origin}${pathname}#/evaluate` (`:87`) | Promoción: `/promotion` y `/promotion_supervisor` (`:108`, `:116`). Desempeño: `/self` (`:125`), `/supervisor` (`:133`), `/peer` (`:141`), `/subordinate` (`:149`, solo si el cargo está en la lista de cargos con subordinados) | `employee`, `position`, `idNumber`, `dept`, `dir`; `targetPos` (promoción); `token=canguro_<cleanId>_<tipo>` (en `self` y `promotion`, y en la versión de ProfileForm); `evaluatorName`/`evaluatorPos` según `evaluatorNames` (estado `:44`) |
| **CollaboratorEvaluationQuadrants** (vista de colaborador / cuadrantes) | `src/components/CollaboratorEvaluationQuadrants.tsx:94-107` (`getEvaluationLink`), `:112-131` (`handleLaunch`) | `window.location.origin + pathname` + `#/evaluate/<role>` (`:100`) | `self`, `supervisor` (superior inmediato), `peer`, `subordinate` | `employee`, `position`, `idNumber`, `dir`, `dept` (datos del evaluado o del target seleccionado). No incluye `token`. Bloqueado si `evalStatus.isOpen` es false (`:113-115`) |
| **ProfileForm** (no se usa: 0 importadores) | `src/components/ProfileForm.tsx:99-108` | `${origin}${pathname}#/evaluate` (`:99`) | `self`, `supervisor`, `subordinate` | Igual que arriba + `token=canguro_<cleanId>_<tipo>` |
| **Redirección de promoción** | `src/components/EvaluationProfileConfig.tsx:154-195` | Hash directo | `promotion` | `employee`, `position`, `idNumber`, `dept`, `dir`, `targetPos` (`:195`). Antes persiste el candidato en `canguro_custom_collaborators` (`:165-183`) |

Rareza confirmada en CollaboratorEvaluationQuadrants.tsx:100: `pathPrefix = cleanHash.includes('/evaluate') ? '' : '#/evaluate/' + role`. Si el hash ya contiene `/evaluate`, no se agrega el segmento del rol y el enlace resultante no lleva `/<tipo>`.

---

## 5. Usuarios para pruebas: mecanismo de inicio de sesión

No se copian credenciales. Las referencias son a `src/services/authService.ts` (las credenciales literales están en esas líneas).

Mecanismos, en orden de evaluación dentro de `loginWithCedula` (`authService.ts:213`):

1. **Cuenta administrador general (directa):** usuario y contraseña definidos en `<ver authService.ts:225>`; rol `admin`; sesión inmediata (`:237`).
2. **Cuenta administrador maestro (por cédula):** identificador y contraseñas aceptadas en `<ver authService.ts:241-245>` y `<ver authService.ts:252-258>`; si es primer ingreso, `mustChangePassword` (`:263`, `:275`) y la sesión no se guarda hasta cambiar la clave (`:278-280`).
3. **Gestor de evaluación (directa):** usuario y contraseña en `<ver authService.ts:298>`; rol `gestor` (`:308`); no crea clave personalizada.
4. **Colaborador por cédula (regla general):** usuario = cédula; contraseña = cédula en primer ingreso (fuerza cambio, `:327-329`) o clave personalizada guardada (`:330`). Ver `<ver authService.ts:327-342>`.
5. **Backend:** `POST /api/auth/login` (`:346-361`). Si falla, fallback local contra `CANGURO_COLLABORATORS` y `canguro_custom_collaborators` (`:364-387`).
6. **Asignación de rol local:** `authService.ts:393-417`: `admin` si el cargo contiene administrador/presidencia/vicepresidencia; `director`; `gestor` si es Formación y Desarrollo o Desarrollo y Desempeño; `supervisor` si es gerente/coordinador/supervisor; si no, `colaborador`.

Cambio obligatorio de clave: `LoginPage.tsx:54-56` abre el modal; `setUserCustomPassword` (`authService.ts:180`) valida reglas con `validateCustomPassword` (`:127`) y guarda en `canguro_custom_passwords`.

Persistencia de sesión: `saveSession` (`authService.ts:510`), `getCurrentSession` (`:524`), `logoutSession` (`:559`). Clave: `canguro_authenticated_session` (`:17`).

Reinicio de clave por admin: `resetUserPassword` (`authService.ts:48`), con llamada a `POST /api/auth/reset-password` (`:94`).

---

## 6. Rarezas

Vistas y código inalcanzable:
1. `currentStage === 'links'` (AdminComparisonModule.tsx:1395) — ningún `navigateTo`/`setCurrentStage` lo asigna. Vista muerta.
2. `currentStage === 'config'` (alias de config_desempeno) — solo aparece en tipos y condiciones; nunca se asigna.
3. `currentBlock === 'dashboard_ejecutivo'` (AdminComparisonModule.tsx:1450) — nunca se asigna. `ExecutiveTalentDashboard` solo se usa embebido.
4. `currentBlock === 'evaluaciones'` — declarado en tipos (`:50`, `:158`), nunca asignado ni renderizado.
5. `currentBlock === 'sucesion'` (AdminComparisonModule.tsx:3144) — nunca asignado. Sus dependencias (`isSuccessionEligible` `:312`, efecto `:395`) quedan muertas con él.
6. `PilotEvaluationModal` (`:3326`) y `PromotionPhasesManagerModal` (`:3315`) — los setters `setPilotModalOpen` y `setPromotionModalOpen` nunca se llaman con `true`. Nunca se abren.
7. `EvaluationProfileConfig` recibe `onNavigateToStage` (`:23`, `:31`) pero nunca lo invoca.
8. `EvaluationHubHome.tsx:144-151`: segundo bloque `if (!isAdmin)` es inalcanzable (el primero, `:49-57`, ya retorna).

Componentes huérfanos o sin render:
- Sin importadores: `src/components/ProfileForm.tsx`, `src/components/QuestionEditor.tsx`, `src/components/Tabs.tsx`, `src/components/PromotionPhasesManagerView.tsx`.
- Importados pero no renderizados (sin JSX): `EvalForm.tsx`, `SelfEvalForm.tsx`, `CompetencyHeatmap.tsx` (importado en `AdminComparisonModule.tsx:16`).

Duplicación de vistas:
- "Matriz 9-Box" aparece dos veces en el menú (`AdminComparisonModule.tsx:987` en resumen y `:1077` en promoción), con contenido distinto según bloque.
- El dashboard de nivel académico aparece en el menú (`:869`), en `OrganizationalDashboard.tsx:544` y en `ExecutiveTalentDashboard.tsx:1860`.
- `PromotionsDashboard` aparece en el menú (`:1472`) y en `ExecutiveTalentDashboard.tsx:2460`.

Control de acceso:
- La UI decide por `isAdmin`, que incluye `gestor`, pero las funciones de rol de authService (`canConfigureEvaluations`, `canViewAllCompanyResults`, `canViewDirectionResults`) no se aplican en ninguna parte (AdminComparisonModule.tsx:30).
- `isAdmin` difiere entre archivos: `AdminComparisonModule.tsx:133` y `EvaluationHubHome.tsx:26` incluyen `gestor`; `Evaluate.tsx:493` no. Un `gestor` no puede saltarse el cierre de período en Evaluate, pero sí ve el menú admin.
- La etiqueta "Gestión de Accesos (Maestro)" y el badge "MAESTRO" (`AdminComparisonModule.tsx:1269`, `:1290`) se muestran a `gestor`.
- El expediente personal (`stage='expediente'` para no admin) no tiene entrada de UI: el hub de no admin solo renderiza cuadrantes, y `onNavigate` solo se dispara desde tarjetas de admin.

Sesión:
- `getCurrentSession` (`authService.ts:533`) invalida la sesión si `user.username !== 'admin'` y no existe clave personalizada. La cuenta directa de gestor (`:298-312`) nunca guarda clave personalizada, así que su sesión se pierde al recargar. Esto se deduce del código; no se ejecutó.

Endpoints:
- Llamados por el cliente sin ruta en `server.ts`: `POST /api/auth/reset-password` (`authService.ts:94`).
- Definidos en `server.ts` sin llamador en `src/`: `POST /api/evaluate-promotion` (`server.ts:380`), `POST /api/db/init` (`:428`; `initializeDatabaseTables` no se usa), `POST /api/db/sync-positions` (`:450`; `syncJobPositionsToDatabase` no se usa), `GET /api/db/evaluations/:collaboratorId` (`:472`; `fetchEvaluationsFromDb` no se usa), `POST` y `GET /api/db/pdi` (`:481`, `:490`).
- `src/services/databaseService.ts` exporta funciones no usadas: `initializeDatabaseTables`, `syncJobPositionsToDatabase`, `fetchEvaluationsFromDb`.

Otros:
- `Evaluate.tsx` no contiene exportación PDF/Excel; la impresión es `window.print` en `PromotionResultsView` y en `AdminComparisonModule`.
- Tipo `hr` se acepta en Evaluate pero ningún generador de enlaces lo produce (`Evaluate.tsx:93-102`).
- Carpeta `dist/`, `scratch/`, `temp-test-org.js` y scripts `fix_*.cjs` están en la raíz y no forman parte de `src/`.

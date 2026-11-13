# Auditoría de Lógica de Negocio — Gestor de Evaluación del Desempeño 360°/180°

**Vertical:** 3 — Negocio · **Fecha:** 2026-11-13 · **Agente:** C (Opus) · **Modo:** solo lectura
**Alcance aplicado:** `03_REGISTRO_DECISIONES.md` §4 (prevalece) → `requeriment.md` → código. La matriz completa está en `03_MATRIZ_TRAZABILIDAD.md`.
**Restricciones respetadas:** no se ejecutó el servidor, no hubo conexión a BD ni a servicios externos, no se leyó `.env.local` y no se modificó nada fuera de `AUDITORIA/`. El oráculo se ejecutó desde el *scratchpad* importando las funciones reales del proyecto.

---

## 1. Resumen ejecutivo

| Indicador | Valor |
|---|---|
| Requisitos trazados | 82 (22 RN + 60 RF) |
| Cumple / Parcial / No cumple / Contradice decisión / No verificable | 10 / 32 / 22 / 15 / 3 |
| **Cumplimiento estricto** (Cumple ÷ verificables) | **12,7 %** |
| **Cumplimiento ponderado** (Parcial = 0,5) | **32,9 %** |
| Oráculo de cálculo | **77 / 147 casos correctos (52 %)**; 0 / 16 en la fórmula de consolidación por fuente |
| Hallazgos | 41: **8 Críticos**, **14 Altos**, 15 Medios, 4 Bajos |

**Conclusión.** La plataforma tiene casi todas las pantallas del alcance, pero el **núcleo de cálculo no corresponde ni al alcance ni a las decisiones de la usuaria**, y varias salidas de negocio se **muestran con datos fabricados**:

1. **La nota final está mal en los cuatro escenarios** (360°/180°, con y sin pares). Se usa 60 % B1 + 30 % B2 + 10 % Potencial; B2 sale solo de la autoevaluación y B1 excluye la autoevaluación. Ejemplo: en un 360° con pares, el resultado esperado es 3,20 (Tramo 2) y la plataforma da 3,79 (Tramo 3).
2. **Los tramos de mérito no son los de la tabla 6.6** y el **Tramo 5 es inalcanzable** (exige más de 100 % en base 100). Como consecuencia, el Plan de Sucesión del perfil nunca se habilita y la Guía de Mérito recomienda políticas distintas a las normadas.
3. **El flujo de convocatoria no se puede completar desde la interfaz.** El Centro de Enlaces existe en el código, pero no se renderiza ni es alcanzable, y no existe el botón «Enviar Correos Oficiales». Además, **las respuestas se guardan en la BD pero nunca se leen**: el administrador solo ve lo que quedó en el `localStorage` de su propio navegador.
4. **Promoción y sucesión muestran resultados inventados.** Cualquier colaborador aparece «APROBADO · 93,6 · PROMOCIÓN INMEDIATA», con firmas y aval del comité ya puestos; el Banco de Sucesores lista 5 sucesores fijos con puntajes 4,82–4,92 que no salen de ninguna evaluación. La auditoría ítem a ítem también rellena con valores ficticios los reactivos sin respuesta.
5. **La asignación de competencias tiene tres errores:** el Director no recibe las competencias de Supervisión, Compras recibe las de Motores de Venta, y el nivel esperado no sigue la tabla 4.3. El último error hace que Analistas, Asesores y Operadores (~1.840 personas) **nunca generen brechas en el PDI**.
6. **Las reglas de cálculo están duplicadas y no coinciden entre sí:** 8 variantes de tramos, 7 de Nine-Box, 3 de ponderación por fuente, 5 de modalidad y 3 de dictamen de promoción.

**Lo que sí funciona:** nombres literales de las 20 competencias; las 5 cardinales para todos; Junta Directiva para el Director; grupos de área para 7 de las 8 Direcciones; 8 formularios KPI por Dirección (AMB-07); recomendaciones con la redacción oficial literal (instrumento y correo); asunto literal del correo; instrumento sin respuestas pre-marcadas; Carta de Honestidad en la interfaz; Base 100; consulta por cédula; niveles de dominio A–D; criticidad y ocupantes de referencia en sucesión.

---

## 2. Hallazgos

Formato según `00_METODOLOGIA.md` §5. Esfuerzo: S ≤ 2 h · M ≤ 1 d · L ≤ 3 d · XL > 3 d.

### Críticos

#### NEG-001 — La nota final usa 60/30/10 con Potencial, no 60 % B1 + 40 % B2
| Campo | Detalle |
|---|---|
| Severidad | **Crítica** (cambia todas las notas, tramos y aumentos) |
| Requisito | RN-08, AMB-01 |
| Evidencia | `src/utils/realEvaluationMetrics.ts:534` `finalScore = B1*0.60 + B2*0.30 + potential*0.10`; sin reactivos de potencial usa un *proxy* B2 × 0,98 (`:524`); también rellena un bloque vacío con el otro (`:499-500`). La misma fórmula se muestra en `AdminComparisonModule.tsx:2122-2160` |
| Esperado vs. obtenido | `CAL-01c`: 3,20 vs. **3,79**. `TRA-4.75a`: con todas las fuentes en 4,75, se espera 4,75 y se obtiene **4,74** (el *proxy* resta) |
| Corrección | `finalScore = round2(0.6*B1 + 0.4*B2)`; eliminar el potencial de la nota y el relleno cruzado de bloques; mostrar «pendiente» si falta un bloque |
| Esfuerzo / dependencias | M · base de NEG-003 y NEG-004 |

#### NEG-002 — La ponderación por fuente no aplica la tabla 6.4 a B1 y B2
| Campo | Detalle |
|---|---|
| Severidad | **Crítica** |
| Requisito | RN-07, AMB-03, AMB-05 |
| Evidencia | `realEvaluationMetrics.ts:443-500`. B1 = Sup 0,60 / Pares 0,20 / Sub 0,20 **sin autoevaluación** (los pesos de las fuentes ausentes pasan al supervisor); B2 = **solo autoevaluación** (`:467`) |
| Esperado vs. obtenido | `CAL-01..04`: 0/16 casos correctos. 360° con pares: B1 3,20 vs. 3,00, B2 3,20 vs. 5,00. 180° sin pares: B1 3,60 vs. 3,00, B2 3,60 vs. 5,00 |
| Corrección | Función única `weightsFor(modalidad, hayPares)` con la tabla 6.4, aplicada por igual a B1 y B2; «hay pares» = existe al menos un par enviado. Pruebas unitarias con los 4 escenarios del oráculo |
| Esfuerzo / dependencias | M · NEG-012 (varios pares) |

#### NEG-003 — Los tramos de mérito no siguen la tabla 6.6 y el Tramo 5 es inalcanzable
| Campo | Detalle |
|---|---|
| Severidad | **Crítica** (política salarial y sucesión) |
| Requisito | RN-09, RN-15, AMB-02, RF-21, RF-22 |
| Evidencia | `realEvaluationMetrics.ts:549-563` (T5 si base 100 > 100); `types.ts:120-201` (`MERIT_TIERS`: 0–2,70 / 2,75–3,25 / 3,30–3,95 / 4,00–5,00 / 5,05–6,25; poblaciones 5/20/50/20/5 %; políticas «Desvinculación por desempeño», «Pool de talentos»…) |
| Esperado vs. obtenido | `TRA-2.99c` T1 vs. **T2**; `TRA-3.74c` T2 vs. **T3**; `TRA-4.24c` T3 vs. **T4**; `TRA-4.75c` y `TRA-5.00c` T5 vs. **T4**; `TRA-4.75d` habilita sucesión: `true` vs. **`false`** |
| Corrección | Reemplazar `MERIT_TIERS` por la tabla 6.6 (nombres, rangos 1–5, percentiles, % de población, política salarial y PDI) y asignar el tramo por la nota final (`≥ 4,75 → 5`, `≥ 4,25 → 4`, `≥ 3,75 → 3`, `≥ 3,00 → 2`). Una única función `tierFor(score)` consumida por todas las vistas (ver §4) |
| Esfuerzo / dependencias | M · NEG-001 |

#### NEG-010 — Centro de Enlaces no operativo: no hay forma de convocar desde la interfaz
| Campo | Detalle |
|---|---|
| Severidad | **Crítica** (bloquea el Procedimiento A, pasos 4–5, y el Procedimiento B) |
| Requisito | RN-13, RF-10, RF-15, RF-37, RF-38 |
| Evidencia | `EvaluationProfileConfig.tsx:102-152` construye `evaluationLinks`, y `:207-257` define `getEmailBodyText`, `handleSendEmail`, `openGmailCompose` y `copyToClipboard`, pero **ninguno se usa en el JSX** (`setEmailInputs` nunca se llama). La etapa `links` (`AdminComparisonModule.tsx:1395`) no tiene ningún `navigateTo('links')`, y `onNavigateToStage` nunca se invoca. No existe el texto «Enviar Correos Oficiales». El enlace 2 de promoción (supervisor) no se expone. En paralelo, `CollaboratorEvaluationQuadrants.tsx:94-133` genera enlaces fuera de Configuración |
| Esperado vs. obtenido | Una fila por evaluador con copiar, probar y correo, vista previa y envío masivo **vs.** nada visible; solo «Iniciar Evaluación de Promoción» en el mismo navegador |
| Corrección | Implementar el Subproceso 3 dentro del asistente: tabla de evaluadores (N pares y N subordinados), copiar/probar/correo, vista previa con `getEmailBodyText` y botón «Enviar Correos Oficiales» que llame a `/api/send-email` por fila. Retirar la generación de enlaces del portal de colaborador (AMB-09) |
| Esfuerzo / dependencias | L · NEG-022, NEG-021, NEG-032 |

#### NEG-011 — Las respuestas se escriben en la BD pero la consolidación lee `localStorage`
| Campo | Detalle |
|---|---|
| Severidad | **Crítica** (el administrador no recibe las evaluaciones respondidas en otros dispositivos) |
| Requisito | AMB-17, RF-34, RF-09, §7.1-6/7 |
| Evidencia | `Evaluate.tsx:418-478` guarda en `localStorage` y hace un `POST` «en segundo plano» (`.catch(() => {})`); `databaseService.ts:173` `fetchEvaluationsFromDb` **no se usa**; `GET /api/db/evaluations/:id` (`server.ts:472`) no tiene consumidores. `canguroUniverso.ts:263-294`, `EvaluationAuditView.tsx:22-53`, los *dashboards* y el perfil leen `canguro_pilot_eval_*` del navegador local. Período fijo `'2026-Q1'` (`Evaluate.tsx:474`) |
| Esperado vs. obtenido | Las evaluaciones de cualquier evaluador llegan al administrador **vs.** solo las hechas en el mismo navegador |
| Corrección | Fuente de verdad en el servidor: `GET` de evaluaciones por colaborador o período para la Auditoría en Vivo, el perfil y los *dashboards*; `localStorage` solo para borrador; período configurable |
| Esfuerzo / dependencias | L · NEG-012 |

#### NEG-012 — El envío no es inmutable y solo admite un evaluador por fuente
| Campo | Detalle |
|---|---|
| Severidad | **Crítica** (integridad de resultados) |
| Requisito | RN-12, RN-10, RF-33 |
| Evidencia | `db.ts:487-504` `INSERT … ON CONFLICT (id) DO UPDATE` y `databaseService.ts:138` `id = eval_{colaborador}_{rol}` (un segundo par **sobrescribe** al primero; no se guarda `submitted_at`, solo `updated_at = NOW()`). `Evaluate.tsx:349` marca consumido `eval_{cédula}_{rol}`: el segundo par ve «enlace ya usado». `PilotEvaluationModal.tsx:117-238` permite cargar respuestas predefinidas («Alto 4,4 / Sobresaliente 4,8 / Brechas»), sobrescribir envíos bloqueados y «limpiar»; `canguroUniverso.ts:518` `resetAllEvaluationsToZero` |
| Esperado vs. obtenido | Instrumento bloqueado con fecha y hora de recepción e imposible de modificar **vs.** sobrescribible por servidor y por administrador |
| Corrección | Una fila por evaluador (id aleatorio por enlace); `INSERT` sin `UPDATE` (rechazar si existe); `submitted_at` del servidor; restricción única por token; retirar o aislar el modo piloto (BD de pruebas) |
| Esfuerzo / dependencias | M · NEG-022 |

#### NEG-013 — Los resultados de promoción se fabrican (APROBADO por defecto)
| Campo | Detalle |
|---|---|
| Severidad | **Crítica** (decisiones de ascenso con datos ficticios) |
| Requisito | RN-16, RN-17, RN-18, RF-25, RF-45, RF-47, RF-49 |
| Evidencia | `promotionDefaults.ts:28-116`: para **cualquier** colaborador sin `phase3.finalScore` crea entrevista 4,70, situacional 4,65, comité 4,68, total 93,6, «NIVEL SOBRESALIENTE», `finalRuling: 'APROBADO'`, `signedByEmployee/HR: true`, `authorizedByCommittee: true`, fecha de aprobación 2026-10-15 y fortalezas y brechas redactadas. `Evaluate.tsx:373-399` crea otro con 4,5/90/«Listo Ahora». `PromotionResultsView.tsx:60-164` (radar y matriz fijos) y `:503-510` (dictamen fijo «PROMOCIÓN INMEDIATA», «La colaboradora…»). `AdminComparisonModule.tsx:1912-1980` muestra este informe aunque `isPromotionEvaluated` sea falso. `PromotionPhasesManagerModal.tsx:56`: aval del comité `true` por defecto |
| Esperado vs. obtenido | Dictamen calculado desde las fases y visible solo para quien está en proceso **vs.** aprobación precargada para todos |
| Corrección | Eliminar los valores por defecto; estado «Pendiente» hasta completar las fases; aval del comité explícito; mostrar el bloque solo si `processType = 'promotion'` y hay evaluación |
| Esfuerzo / dependencias | M · NEG-014, NEG-015, AMB-12 |

#### NEG-016 — El Banco de Sucesores está hardcodeado y el Plan de Sucesión nunca se habilita
| Campo | Detalle |
|---|---|
| Severidad | **Crítica** |
| Requisito | RN-15, RF-52, RF-54, RF-55 |
| Evidencia | `canguroUniverso.ts:991-1092`: 5 sucesores elegidos por cédula con `performanceScore` 4,88/4,90/4,85/4,92/4,82 fijos; `:251` lista de «isTopSuccessor». `AdminComparisonModule.tsx:312`: `enablesSuccession && finalScore >= 4.75` (T5 inalcanzable → nunca). `SuccessionBankView.tsx:35` usa en cambio `finalScore >= 4.75` (criterio distinto al del perfil) |
| Esperado vs. obtenido | Solo ingresan colaboradores con nota real ≥ 4,75 **vs.** lista fija; el perfil nunca muestra el plan |
| Corrección | Derivar el banco de las notas consolidadas (≥ 4,75, NEG-003); registrar preparación, riesgo y vinculación a la posición desde la interfaz, con persistencia |
| Esfuerzo / dependencias | M · NEG-003, NEG-011 |

### Altos

| ID | Título | Requisito | Evidencia | Esperado vs. obtenido | Corrección | Esfuerzo |
|---|---|---|---|---|---|---|
| NEG-004 | Nine-Box con ejes distintos a la decisión, umbrales inconsistentes y nombres de celda no normados | RN/§6.7, AMB-04, RF-18, RF-19 | Perfil: X = `finalScore`, Y = Bloque 3 o B2-auto (`AdminComparisonModule.tsx:327-329, 1891`); PDI: X = `block1 \|\| 3.5` (`PDI.tsx:116`); Org: X = B1, Y = `radarScores.leadership` (`OrganizationalDashboard.tsx:326-327`); umbrales en §4 | `NB-01`: Potencial esperado 2,50 (B2 ponderado) vs. 4,41. `NB-X4`: (4,0; 4,0) → Medio-Medio en `scoreAlignment` vs. Alto-Alto en Executive. Nombres: «Alto Potencial / Bajo Desempeño» vs. «Enigma / Dilema» | Una sola función `nineBox(B1, B2)` con umbrales definidos por la usuaria (AMB-19) y la tabla de nombres y acciones del §6.7 | M |
| NEG-005 | Bloque 2: las opciones no corresponden a los niveles A–D del Modelo | RN-01, RF-30 | `canguroCompetencyDictionary.ts:2163-2258`: las 4 opciones usan `levelLetter: targetLevel`, recombinan los ítems 0–4 del **mismo** nivel y añaden frases propias; opción 25 % = ítem 5 + «atendiendo con precisión los requerimientos inmediatos…» | `B2-OPC`: esperado A,B,C,D; obtenido D,D,D,D. `B2-TXT`: texto no literal | Cada opción = comportamiento observable literal del nivel A, B, C y D de la competencia (§4.3), en orden aleatorio | L (requiere el texto del Modelo) |
| NEG-006 | El Director no recibe las 3 competencias de Supervisión | RN-03 | `canguroCompetencyDictionary.ts:463` (`SUPERVISION_ROLES` sin Director), `:1679` (`!isBoardEligible && …`) | `COMP-Director`: 14 esperadas vs. 11 | Supervisión = {Coordinador, Supervisor, Gerente, Director}; Junta = Director (Alta Dirección) | S |
| NEG-007 | Compras recibe las competencias de «Motores de Venta» | RN-05 | `canguroCompetencyDictionary.ts:937-941` y `:1705-1709` | `AREA-Dirección de Compras`: Blindaje y Control esperado vs. Motores de Venta | Mover Compras a `AREA_CONTROL` (sujeto a AMB-20) | S |
| NEG-008 | Nivel esperado fuera de la tabla 4.3; el nivel D nunca genera brechas | RF-42, AMB-13, RN-19 | `canguroCompetencyDictionary.ts:1716-1728` (Supervisor → C; Especialista, Responsable y Encargado → D); `PDI.tsx:139-158` `gap = score − expectedLevelScore` con score 1,25–5,00 y nivel D = 1,25 → nunca < 0. Si falta la respuesta, usa B2 o 3,5 por defecto; las fuentes se superponen (`{...sup, ...self, ...peer, ...}`), sin ponderar | `NIV-Supervisor` B vs. C; `NIV-Especialista/Responsable/Encargado` C vs. D. Un Analista con todas las respuestas en la peor opción: 0 brechas | Mapa de niveles de la tabla 4.3 (+ Operador = D); brecha = esperado − demostrado en la **misma escala de niveles** (resolver AMB-23); score por competencia ponderado por fuente | M |
| NEG-009 | B2 ignora las competencias de Junta Directiva (`brd-*`) | RN-04, RN-08 | `realEvaluationMetrics.ts:452-461` filtra `startsWith('board')`, pero los ids son `brd-1..3` | `B2-BRD`: 3,98 vs. **5,00** (las 3 respuestas del Director en 1,25 no cuentan) | Clasificar por la lista de ids del perfil de competencias, no por prefijos | S |
| NEG-014 | Tabla de dictamen de promoción 85/75/65 y 90/80 en lugar de 85/70/60 | RN-17, §8.7 | `types.ts:370-422`; `PromotionResultsView.tsx:461-492`; `PromotionPhasesManagerModal.tsx:60-64` (4,50/3,75); `AdminComparisonModule.tsx:1777-1778` (85/70) | `PROM-70`: APROBADO vs. CONDICIONADO; `PROM-60`: CONDICIONADO vs. NO APROBADO; `PROMV-85`: APROBADO vs. CONDICIONADO | Una sola tabla 85/70/60 (con criterio y acción del §7.4) consumida por todas las vistas | S |
| NEG-015 | No existen la Carta de Promoción ni el Plan de Handover | RN-16, RN-20, RF-50, RF-51 | Sin componentes (búsqueda de «Handover», «Empalme», «Carta de Promoción» y «banda salarial» en `src/components`: 0 resultados); solo `types.ts:341-350` y datos por defecto | Documento con cargo, banda y beneficios, fecha de inicio; plan de 2–4 semanas con tareas, reemplazo y firmas, habilitado solo con dictamen APROBADO | Formulario y documento imprimible + validación de 2–4 semanas + *gating* por dictamen | L |
| NEG-017 | Cumplimiento Global y Metas SMART calculados localmente o a mano (RN-21) | RN-21, AMB-14 | `PDI.tsx:84-94` (`autoCalibratedScore`), `:314-321` («100 % automática»), `:687-745`; metas por defecto con avance 75/60/85 % (`:27-61`) | «Pendiente de integración» sin valores vs. % calculado y metas inventadas | Mostrar «Pendiente de integración con Sistema de PDI»; eliminar metas por defecto | S |
| NEG-018 | No existe la reevaluación a 90 días en el PDI | RN-19, RF-43 | Sin lógica en `PDI.tsx`; el campo `nextEvaluation90Days` solo está en el expediente de promoción por defecto | Programación a 90 días con estado por brecha Total/Parcial/Pendiente | Agregar el ciclo de reevaluación vinculado a las brechas | M |
| NEG-019 | La auditoría ítem a ítem inventa calificaciones | RF-24 | `AuditEvaluationsViewer.tsx:45-53` (valores por defecto 4,2/4,6/4,4/4,5 y desplazamiento por *hash*), `:23-30` (ids `se1`–`se6` que el instrumento no usa), `:89` rótulo «Bloque 2 (30 %)» | Mostrar la respuesta real o «sin respuesta» vs. números ficticios | Leer los ids reales del formulario de la Dirección y del perfil de competencias; nunca rellenar | S |
| NEG-020 | El instrumento sigue aplicando el Bloque 3 de Potencial (18 reactivos) | RF-31, AMB-01 | `Evaluate.tsx:56` (4 secciones), `:1222-1243` | Instrumento solo con B1 + B2 + abiertas + carta | Quitar la sección 3 o dejarla como informativa (AMB-29) | S |
| NEG-021 | Colaboradores con sesión y acceso a sus resultados | RF-05, RF-06, AMB-09, AMB-11 | `Dashboard.tsx:75-83` (todos ven `AdminComparisonModule`); `AdminComparisonModule.tsx:143-153` solo bloquea 3 bloques (deja «resumen», `dashboard_ejecutivo`, `dashboard_promociones`); `EvaluationHubHome.tsx:49-61` | Solo el administrador inicia sesión; el colaborador no ve resultados | Eliminar logins no administrativos; *gating* en servidor (ver auditoría técnica) | M |
| NEG-022 | Enlaces con PII y token determinístico | RF-16, AMB-10 | `EvaluationProfileConfig.tsx:91-150` (`token=canguro_{cédula}_{rol}`, nombre, cédula, cargo y Dirección en la URL); `Evaluate.tsx:110-111` deriva el token si falta | Token aleatorio de un solo uso sin PII | Tokens aleatorios guardados en el servidor y asociados a evaluado, rol y evaluador | M |

### Medios

| ID | Título | Requisito | Evidencia | Corrección | Esfuerzo |
|---|---|---|---|---|---|
| NEG-023 | Modalidad 180/360 resuelta de 5 formas distintas | RN-06 | `canguroUniverso.ts:244` (OK), `:640/718` (Encargado → 360), `DatabaseStatusModal.tsx:214-221` («cio» en «Servicio» → 360), `CompetencyHeatmap.tsx:38` y `AuditEvaluationsViewer.tsx:20` (Director → 180). Oráculo `MOD-*`, `MGMT-*` | Una sola función `modalityFor(familia)` | S |
| NEG-024 | La normalización de cargos falla en casos borde y cae en silencio a «Analista» | RF-03 | `canguroUniverso.ts:56-73`: «MONTACARGUISTA» → Analista; «TÉCNICO» con tilde → Analista; 38 personas del censo (Diseñador, Abogado, Comprador, Community Manager, Arquitecto…) → Analista | Normalizar tildes, corregir el patrón y marcar «sin familia» para revisión en lugar del *fallback* | S |
| NEG-025 | La configuración del desempeño muestra competencias inventadas y no se conecta al instrumento | RN-01, RF-13 | `PerformanceEvaluationConfigView.tsx:49-497` (24 competencias específicas no normadas), `:500-513` (cardinales y supervisión renombradas), `:670-719` (se guarda en `canguro_custom_directions_eval_config`, que nadie lee) | Mostrar los reactivos reales (diccionario + formularios KPI) y conectar la edición auditada al instrumento | M |
| NEG-026 | Mapa de calor y radar individuales no reales | RF-20 | `CompetencyHeatmap.tsx` sin uso (pesos 50/15/20/15 sin renormalizar); `realEvaluationMetrics.ts:569-573` (radar = B2 × 1,02 / B1 × 0,99) | Calcular por competencia y por grupo con la ponderación 6.4 | M |
| NEG-027 | Valores de referencia inventados cuando no hay datos | AMB-14 (espíritu), RF-21, RF-36, RF-56 | `NormalCurve.tsx:243, 249, 251` (3,80 / 3,72 / n = 8); `AdminComparisonModule.tsx:434-449` (3,90 / 3,85 / 3,74 / 8), `:329` (potencial 3,5); `PDI.tsx:115-116, 144` (3,5); `EvaluationAuditView.tsx:57` (85 %); RIASEC constante para 2.406 personas (`canguroUniverso.ts:134-144, 322-332`) | Mostrar «sin datos»; no proyectar | S-M |
| NEG-028 | Observaciones de Talento Humano globales, no por expediente | RN-22 | `AdminComparisonModule.tsx:80` (`state.adminNotes`), `:2703`; se mantienen al cambiar de colaborador; solo en el bloque «Resumen» | Observaciones por colaborador, con fecha y autor, visibles en todas las etapas | S |
| NEG-029 | Preguntas abiertas no diferenciadas por rol | RF-28 | `Evaluate.tsx:1263-1339` | Auto: áreas de mejora + acciones de superación; Supervisor: fortalezas, oportunidades, visión a futuro; Pares/Sub: comentarios | S |
| NEG-030 | Carta de Honestidad incompleta y sin validación en el envío | RN-11, RF-58 | `Evaluate.tsx:855` (sin confidencialidad); `:297-306` no valida `honestyAccepted`; el servidor no lo registra | Texto con veracidad, imparcialidad y confidencialidad; validar en `handleSave` y en el servidor; guardar la aceptación | S |
| NEG-031 | Auditoría en Vivo sin fecha y hora de recepción | RF-09 | `EvaluationAuditView.tsx:223-239` (solo puntos de color) | Columna con `submitted_at` por fuente (desde el servidor) | S |
| NEG-032 | No existe el asistente de 3 subprocesos para Desempeño | RF-10, RF-11, RF-12, RF-44 | `AdminComparisonModule.tsx:1345-1349` (visor por Dirección); promoción en otro módulo | Asistente único: Datos → Alcance (tipo, competencias, reactivos, descriptor, modalidad) → Centro de Enlaces | L |
| NEG-033 | PDI: plazo de 18 meses fuera de norma, estado «Atrasado» no asignable y brechas por defecto | RF-40, RF-41 | `PDI.tsx:971` (18 meses), `:187` (estado derivado sin `delayed`), `:64` (`DEFAULT_PDI_BREACHES`) | Solo 3/6/12; estado editable (incluido Atrasado por fecha vencida); sin valores por defecto | S |
| NEG-034 | B1 o B2 se rellenan con el otro bloque o con el promedio general | RN-08 | `realEvaluationMetrics.ts:375` (`extractAverage(..., isBlock1) \|\| fallbackAvg` mezcla B2 en B1), `:463-464` (B2 \|\| promedio total), `:499-500` | Bloque sin datos = «pendiente»; no mezclar reactivos entre bloques | S |
| NEG-037 | IA simulada con cifras inventadas | AMB-16, RF-46, RF-60 | `server.ts:380-392` (`/api/evaluate-promotion` devuelve «Gemini 3.8 Flash… 94,6 %» fijo); `promotionDefaults.ts:74` («95,8 %») | Retirar los textos simulados; si se usa IA, marcarla como sugerencia auditable | S |
| NEG-038 | Tres fórmulas distintas de puntaje de promoción | RF-48, AMB-12 | `promotionDefaults.ts:32` (30/40/30), `PromotionPhasesManagerModal.tsx:59` (40/60), `Evaluate.tsx:390-398` (4,5/90 fijos) | Unificar cuando se resuelva AMB-12 | S |
| NEG-039 | El instrumento se puede enviar sin responder ningún reactivo | RN-12 (calidad), §6.2 | `Evaluate.tsx:297-357` no valida que estén completos | Validar completitud por sección antes de habilitar el envío (ver AMB-26) | S |

### Bajos

| ID | Título | Evidencia | Corrección | Esfuerzo |
|---|---|---|---|---|
| NEG-035 | Inicio no sigue §5.1 (texto «…y desarrollo del Talento de DISTRICUEROS…» y 3 accesos) | `EvaluationHubHome.tsx:66-141, 245-251` | Ajustar el texto y las tarjetas | S |
| NEG-036 | «Dirección General» sigue en el usuario admin (AMB-18) | `authService.ts:232-233` | Corregir | S |
| NEG-040 | Opciones situacionales siempre en el orden 100 %→25 % (sesgo de deseabilidad) | `canguroCompetencyDictionary.ts:2226-2258`; `SituationalEvalForm.tsx:128` | Mezclar el orden de forma determinista por evaluador | S |
| NEG-041 | Código muerto con lógica divergente | `ProfileForm.tsx:25-26` (correo no oficial), `CompetencyHeatmap.tsx`, `EvalForm.tsx`, `SelfEvalForm.tsx`, `QuestionEditor.tsx`, `promotionQuestions.ts:46,115` (situacionales y RIASEC sin uso), `/api/evaluate-promotion` | Eliminar o integrar | S |

---

## 3. Oráculo de cálculo

**Script:** `C:\Users\NRODRI~1\AppData\Local\Temp\claude\b8ab62305f7f2aa6\be5ffd00-e895-415b-b517-670fbbd2cb79\scratchpad\oracle.ts` (ejecutado con `npx tsx` desde la raíz del proyecto). Importa las funciones reales `calculateConsolidatedMetrics`, `mapToNineBox`, `resolveEmployeeCompetencyProfile`, `resolvePositionManagementLevel`, `getOfficialCompetencyQuestions`, `ALL_OFFICIAL_COMPETENCIES`, `resolvePromotionThreshold`, `MERIT_TIERS`, `getManagementLevel`, `getTierForScore` y `CANGURO_COLLABORATORS`. `normalizePosition` no está exportada: se extrajo literalmente del fuente y se transpiló con esbuild. Las reglas de Nine-Box de ExecutiveTalentDashboard/OrganizationalDashboard, la modalidad de DatabaseStatusModal y las casillas de PromotionResultsView están **replicadas literalmente** con cita de línea, porque viven dentro de componentes.

**Modelo esperado (oráculo):** ponderación por fuente de la tabla 6.4 aplicada a B1 y B2 → Nota = 0,6·B1 + 0,4·B2 → Base 100 = Nota/5·100 → Tramo según la tabla 6.6 → Nine-Box (Desempeño = B1, Potencial = B2) → competencias según §4.4 → nivel esperado según la tabla 4.3 (Operador Integral = D) → dictamen 85/70/60.

**Entradas tipo:** B1 = formulario de Operaciones (`op_kpi_1..4`, `op_cond_1..4`, `op_strat_1..3`) con el mismo valor en todos los ítems; B2 = ids reales de `getOfficialCompetencyQuestions(cargo, Dirección)`; potencial `pot_1..18` cuando se indica.

### 3.1 Totales por grupo

| Grupo | Casos | OK | Falla |
|---|---|---|---|
| CAL — ponderación y nota (360/180 con y sin pares) | 16 | 0 | 16 |
| TRA — límites de tramo (2,99…5,00) + tabla | 46 | 24 | 22 |
| NB — ejes y bordes de Nine-Box | 9 | 2 | 7 |
| COMP/NIV/AREA/RN01/B2 — competencias | 32 | 22 | 10 |
| NORM — normalización de cargos | 10 | 8 | 2 |
| MOD/MGMT — modalidad 180/360 | 22 | 16 | 6 |
| PROM — dictamen de promoción | 12 | 5 | 7 |
| **Total** | **147** | **77** | **70** |

> En TRA, el grupo «e» (`getTierForScore` de CargoPerformanceBreakdown) acierta 9/9: es la **única** implementación de tramos alineada con la tabla 6.6.

### 3.2 Resultados detallados

| ID | Caso | Entrada | Esperado | Obtenido | Resultado |
| CAL-01a | B1 ponderado (360p) | Coordinador/360p; B1=B2 por fuente: Auto 5 · Sup 3 · Pares 4 · Sub 2 | 3.20 | 3.00 | FALLA |
| CAL-01b | B2 ponderado (360p) | Coordinador/360p; B1=B2 por fuente: Auto 5 · Sup 3 · Pares 4 · Sub 2 | 3.20 | 5.00 | FALLA |
| CAL-01c | Nota final (360p) | Coordinador/360p; B1=B2 por fuente: Auto 5 · Sup 3 · Pares 4 · Sub 2 | 3.20 | 3.79 | FALLA |
| CAL-01d | Tramo (360p) | Coordinador/360p; B1=B2 por fuente: Auto 5 · Sup 3 · Pares 4 · Sub 2 | T2 | T3 | FALLA |
| CAL-02a | B1 ponderado (360s) | Coordinador/360s; B1=B2 por fuente: Auto 5 · Sup 3 · Pares — · Sub 2 | 3.10 | 2.80 | FALLA |
| CAL-02b | B2 ponderado (360s) | Coordinador/360s; B1=B2 por fuente: Auto 5 · Sup 3 · Pares — · Sub 2 | 3.10 | 5.00 | FALLA |
| CAL-02c | Nota final (360s) | Coordinador/360s; B1=B2 por fuente: Auto 5 · Sup 3 · Pares — · Sub 2 | 3.10 | 3.67 | FALLA |
| CAL-02d | Tramo (360s) | Coordinador/360s; B1=B2 por fuente: Auto 5 · Sup 3 · Pares — · Sub 2 | T2 | T3 | FALLA |
| CAL-03a | B1 ponderado (180p) | Analista/180p; B1=B2 por fuente: Auto 5 · Sup 3 · Pares 4 · Sub — | 3.65 | 3.20 | FALLA |
| CAL-03b | B2 ponderado (180p) | Analista/180p; B1=B2 por fuente: Auto 5 · Sup 3 · Pares 4 · Sub — | 3.65 | 5.00 | FALLA |
| CAL-03c | Nota final (180p) | Analista/180p; B1=B2 por fuente: Auto 5 · Sup 3 · Pares 4 · Sub — | 3.65 | 3.91 | FALLA |
| CAL-03d | Tramo (180p) | Analista/180p; B1=B2 por fuente: Auto 5 · Sup 3 · Pares 4 · Sub — | T2 | T3 | FALLA |
| CAL-04a | B1 ponderado (180s) | Analista/180s; B1=B2 por fuente: Auto 5 · Sup 3 · Pares — · Sub — | 3.60 | 3.00 | FALLA |
| CAL-04b | B2 ponderado (180s) | Analista/180s; B1=B2 por fuente: Auto 5 · Sup 3 · Pares — · Sub — | 3.60 | 5.00 | FALLA |
| CAL-04c | Nota final (180s) | Analista/180s; B1=B2 por fuente: Auto 5 · Sup 3 · Pares — · Sub — | 3.60 | 3.79 | FALLA |
| CAL-04d | Tramo (180s) | Analista/180s; B1=B2 por fuente: Auto 5 · Sup 3 · Pares — · Sub — | T2 | T3 | FALLA |
| TRA-2.99a | Nota final con todas las fuentes = 2.99 (sin Bloque 3) | B1=B2=2.99 en Auto/Sup/Pares (180° con pares) | 2.99 | 2.98 | FALLA |
| TRA-2.99b | Tramo para 2.99 (sin Bloque 3) | idem | T1 | T2 (base100=59.6) | FALLA |
| TRA-2.99c | Tramo para 2.99 (pot=2.99, final exacto) | B1=B2=pot=2.99 | T1 | T2 (final=2.99, base100=59.8) | FALLA |
| TRA-2.99d | Habilita sucesión (2.99) | idem | false | false | OK |
| TRA-2.99e | Tramo en CargoPerformanceBreakdown.getTierForScore(2.99) | nota=2.99 | T1 | T1 (Requiere Acompañamiento (T1)) | OK |
| TRA-3.00a | Nota final con todas las fuentes = 3.00 (sin Bloque 3) | B1=B2=3.00 en Auto/Sup/Pares (180° con pares) | 3.00 | 2.99 | FALLA |
| TRA-3.00b | Tramo para 3.00 (sin Bloque 3) | idem | T2 | T2 (base100=59.8) | OK |
| TRA-3.00c | Tramo para 3.00 (pot=3.00, final exacto) | B1=B2=pot=3.00 | T2 | T2 (final=3, base100=60) | OK |
| TRA-3.00d | Habilita sucesión (3.00) | idem | false | false | OK |
| TRA-3.00e | Tramo en CargoPerformanceBreakdown.getTierForScore(3.00) | nota=3.00 | T2 | T2 (En Desarrollo / Promedio (T2)) | OK |
| TRA-3.74a | Nota final con todas las fuentes = 3.74 (sin Bloque 3) | B1=B2=3.74 en Auto/Sup/Pares (180° con pares) | 3.74 | 3.73 | FALLA |
| TRA-3.74b | Tramo para 3.74 (sin Bloque 3) | idem | T2 | T3 (base100=74.6) | FALLA |
| TRA-3.74c | Tramo para 3.74 (pot=3.74, final exacto) | B1=B2=pot=3.74 | T2 | T3 (final=3.74, base100=74.8) | FALLA |
| TRA-3.74d | Habilita sucesión (3.74) | idem | false | false | OK |
| TRA-3.74e | Tramo en CargoPerformanceBreakdown.getTierForScore(3.74) | nota=3.74 | T2 | T2 (En Desarrollo / Promedio (T2)) | OK |
| TRA-3.75a | Nota final con todas las fuentes = 3.75 (sin Bloque 3) | B1=B2=3.75 en Auto/Sup/Pares (180° con pares) | 3.75 | 3.74 | FALLA |
| TRA-3.75b | Tramo para 3.75 (sin Bloque 3) | idem | T3 | T3 (base100=74.8) | OK |
| TRA-3.75c | Tramo para 3.75 (pot=3.75, final exacto) | B1=B2=pot=3.75 | T3 | T3 (final=3.75, base100=75) | OK |
| TRA-3.75d | Habilita sucesión (3.75) | idem | false | false | OK |
| TRA-3.75e | Tramo en CargoPerformanceBreakdown.getTierForScore(3.75) | nota=3.75 | T3 | T3 (Competente / En Meta (T3)) | OK |
| TRA-4.24a | Nota final con todas las fuentes = 4.24 (sin Bloque 3) | B1=B2=4.24 en Auto/Sup/Pares (180° con pares) | 4.24 | 4.23 | FALLA |
| TRA-4.24b | Tramo para 4.24 (sin Bloque 3) | idem | T3 | T4 (base100=84.6) | FALLA |
| TRA-4.24c | Tramo para 4.24 (pot=4.24, final exacto) | B1=B2=pot=4.24 | T3 | T4 (final=4.24, base100=84.8) | FALLA |
| TRA-4.24d | Habilita sucesión (4.24) | idem | false | false | OK |
| TRA-4.24e | Tramo en CargoPerformanceBreakdown.getTierForScore(4.24) | nota=4.24 | T3 | T3 (Competente / En Meta (T3)) | OK |
| TRA-4.25a | Nota final con todas las fuentes = 4.25 (sin Bloque 3) | B1=B2=4.25 en Auto/Sup/Pares (180° con pares) | 4.25 | 4.24 | FALLA |
| TRA-4.25b | Tramo para 4.25 (sin Bloque 3) | idem | T4 | T4 (base100=84.8) | OK |
| TRA-4.25c | Tramo para 4.25 (pot=4.25, final exacto) | B1=B2=pot=4.25 | T4 | T4 (final=4.25, base100=85) | OK |
| TRA-4.25d | Habilita sucesión (4.25) | idem | false | false | OK |
| TRA-4.25e | Tramo en CargoPerformanceBreakdown.getTierForScore(4.25) | nota=4.25 | T4 | T4 (Avanzado / Alto (T4)) | OK |
| TRA-4.74a | Nota final con todas las fuentes = 4.74 (sin Bloque 3) | B1=B2=4.74 en Auto/Sup/Pares (180° con pares) | 4.74 | 4.73 | FALLA |
| TRA-4.74b | Tramo para 4.74 (sin Bloque 3) | idem | T4 | T4 (base100=94.6) | OK |
| TRA-4.74c | Tramo para 4.74 (pot=4.74, final exacto) | B1=B2=pot=4.74 | T4 | T4 (final=4.74, base100=94.8) | OK |
| TRA-4.74d | Habilita sucesión (4.74) | idem | false | false | OK |
| TRA-4.74e | Tramo en CargoPerformanceBreakdown.getTierForScore(4.74) | nota=4.74 | T4 | T4 (Avanzado / Alto (T4)) | OK |
| TRA-4.75a | Nota final con todas las fuentes = 4.75 (sin Bloque 3) | B1=B2=4.75 en Auto/Sup/Pares (180° con pares) | 4.75 | 4.74 | FALLA |
| TRA-4.75b | Tramo para 4.75 (sin Bloque 3) | idem | T5 | T4 (base100=94.8) | FALLA |
| TRA-4.75c | Tramo para 4.75 (pot=4.75, final exacto) | B1=B2=pot=4.75 | T5 | T4 (final=4.75, base100=95) | FALLA |
| TRA-4.75d | Habilita sucesión (4.75) | idem | true | false | FALLA |
| TRA-4.75e | Tramo en CargoPerformanceBreakdown.getTierForScore(4.75) | nota=4.75 | T5 | T5 (Sobresaliente (T5)) | OK |
| TRA-5.00a | Nota final con todas las fuentes = 5.00 (sin Bloque 3) | B1=B2=5.00 en Auto/Sup/Pares (180° con pares) | 5.00 | 4.99 | FALLA |
| TRA-5.00b | Tramo para 5.00 (sin Bloque 3) | idem | T5 | T4 (base100=99.8) | FALLA |
| TRA-5.00c | Tramo para 5.00 (pot=5.00, final exacto) | B1=B2=pot=5.00 | T5 | T4 (final=5, base100=100) | FALLA |
| TRA-5.00d | Habilita sucesión (5.00) | idem | true | false | FALLA |
| TRA-5.00e | Tramo en CargoPerformanceBreakdown.getTierForScore(5.00) | nota=5.00 | T5 | T5 (Sobresaliente (T5)) | OK |
| TRA-TAB | Tabla MERIT_TIERS (types.ts) vs tabla 6.6 | MERIT_TIERS[1..5] | 1,00-2,99 / 3,00-3,74 / 3,75-4,24 / 4,25-4,74 / 4,75-5,00; 10/25/35/20/10 % | 0-2.7 (5% de la población) / 2.75-3.25 (20% de la población) / 3.3-3.95 (50% de la población (Estándar Canguro)) / 4-5 (20% de la población) / 5.05-6.25 (5% (Top Talent)) | FALLA |
| NB-01 | Eje Potencial del Nine-Box = B2 ponderado | B1=4,5 todas; B2: Auto 4,5, Sup 2, Pares 2 | Potencial(B2)=2.50 | potentialScore=4.41 (proxy B2_auto×0,98); block2=4.5 | FALLA |
| NB-02 | Eje Desempeño del Nine-Box (Perfil: AdminComparisonModule:1891 usa finalScore) | idem | Desempeño(B1)=4.50 | finalScore=4.49 | FALLA |
| NB-X2.99 | Celda Nine-Box (2.99,2.99): scoreAlignment vs ExecutiveTalentDashboard vs OrganizationalDashboard | Desempeño=2.99, Potencial=2.99 | misma celda en todas las vistas; nombre alcance: Riesgo / Incompleto | scoreAlignment=Bajo-Bajo "Bajo Potencial / Bajo Desempeño" | Executive=Medio-Bajo | Org="En Desarrollo / Dilema" | FALLA |
| NB-X3 | Celda Nine-Box (3,3): scoreAlignment vs ExecutiveTalentDashboard vs OrganizationalDashboard | Desempeño=3, Potencial=3 | misma celda en todas las vistas; nombre alcance: Talento Clave | scoreAlignment=Medio-Medio "Medio Potencial / Medio Desempeño" | Executive=Medio-Medio | Org="Profesional Efectivo" | OK |
| NB-X4.24 | Celda Nine-Box (4.24,4.24): scoreAlignment vs ExecutiveTalentDashboard vs OrganizationalDashboard | Desempeño=4.24, Potencial=4.24 | misma celda en todas las vistas; nombre alcance: Talento Clave | scoreAlignment=Medio-Medio "Medio Potencial / Medio Desempeño" | Executive=Alto-Alto | Org="Profesional Efectivo" | FALLA |
| NB-X4.25 | Celda Nine-Box (4.25,4.25): scoreAlignment vs ExecutiveTalentDashboard vs OrganizationalDashboard | Desempeño=4.25, Potencial=4.25 | misma celda en todas las vistas; nombre alcance: Futura Estrella | scoreAlignment=Alto-Alto "Alto Potencial / Alto Desempeño" | Executive=Alto-Alto | Org="Futura Estrella" | OK |
| NB-X3.9 | Celda Nine-Box (3.9,3.9): scoreAlignment vs ExecutiveTalentDashboard vs OrganizationalDashboard | Desempeño=3.9, Potencial=3.9 | misma celda en todas las vistas; nombre alcance: Talento Clave | scoreAlignment=Medio-Medio "Medio Potencial / Medio Desempeño" | Executive=Alto-Medio | Org="Profesional Efectivo" | FALLA |
| NB-X2.5 | Celda Nine-Box (2.5,2.5): scoreAlignment vs ExecutiveTalentDashboard vs OrganizationalDashboard | Desempeño=2.5, Potencial=2.5 | misma celda en todas las vistas; nombre alcance: Riesgo / Incompleto | scoreAlignment=Bajo-Bajo "Bajo Potencial / Bajo Desempeño" | Executive=Medio-Bajo | Org="En Desarrollo / Dilema" | FALLA |
| NB-X4 | Celda Nine-Box (4,4): scoreAlignment vs ExecutiveTalentDashboard vs OrganizationalDashboard | Desempeño=4, Potencial=4 | misma celda en todas las vistas; nombre alcance: Talento Clave | scoreAlignment=Medio-Medio "Medio Potencial / Medio Desempeño" | Executive=Alto-Alto | Org="Profesional Efectivo" | FALLA |
| COMP-Coordinador | Competencias asignadas a Coordinador (Dirección de Operaciones) | Coordinador / Dirección de Operaciones | 11: Liderar con el Ejemplo, Orientación al Logro, Desarrollo de Equipos, Gestión de Indicadores, Visual Merchandising, Negociación Comercial | 11: Liderar con el Ejemplo, Orientación al Logro, Desarrollo de Equipos, Gestión de Indicadores, Visual Merchandising, Negociación Comercial | OK |
| NIV-Coordinador | Nivel esperado (tabla 4.3) para Coordinador | Coordinador | C | C / resolvePositionManagementLevel=C | OK |
| COMP-Analista | Competencias asignadas a Analista (Dirección de Administración y Finanzas) | Analista / Dirección de Administración y Finanzas | 8: Prevención de Pérdidas y Control de Inventarios, Estructuración y Control Presupuestario, Gestión de Riesgos y Auditoría de Procesos | 8: Prevención de Pérdidas y Control de Inventarios, Estructuración y Control Presupuestario, Gestión de Riesgos y Auditoría de Procesos | OK |
| NIV-Analista | Nivel esperado (tabla 4.3) para Analista | Analista | D | D / resolvePositionManagementLevel=D | OK |
| COMP-Director | Competencias asignadas a Director (Dirección de Tecnología) | Director / Dirección de Tecnología | 14: Liderar con el Ejemplo, Orientación al Logro, Desarrollo de Equipos, Líder de Líderes, Pensamiento Estratégico, Gestión del Cambio y Desarrollo de la Organización, Orientación al Servicio, Optimización de Procesos, Administración de Infraestructura y Recursos Críticos | 11: Líder de Líderes, Pensamiento Estratégico, Gestión del Cambio y Desarrollo de la Organización, Orientación al Servicio, Optimización de Procesos, Administración de Infraestructura y Recursos Críticos | FALLA |
| NIV-Director | Nivel esperado (tabla 4.3) para Director | Director | A | A / resolvePositionManagementLevel=A | OK |
| COMP-Supervisor | Competencias asignadas a Supervisor (Dirección Comercial) | Supervisor / Dirección Comercial | 11: Liderar con el Ejemplo, Orientación al Logro, Desarrollo de Equipos, Gestión de Indicadores, Visual Merchandising, Negociación Comercial | 11: Liderar con el Ejemplo, Orientación al Logro, Desarrollo de Equipos, Gestión de Indicadores, Visual Merchandising, Negociación Comercial | OK |
| NIV-Supervisor | Nivel esperado (tabla 4.3) para Supervisor | Supervisor | B | C / resolvePositionManagementLevel=C | FALLA |
| COMP-Gerente | Competencias asignadas a Gerente (Dirección de Control Interno) | Gerente / Dirección de Control Interno | 11: Liderar con el Ejemplo, Orientación al Logro, Desarrollo de Equipos, Prevención de Pérdidas y Control de Inventarios, Estructuración y Control Presupuestario, Gestión de Riesgos y Auditoría de Procesos | 11: Liderar con el Ejemplo, Orientación al Logro, Desarrollo de Equipos, Prevención de Pérdidas y Control de Inventarios, Estructuración y Control Presupuestario, Gestión de Riesgos y Auditoría de Procesos | OK |
| NIV-Gerente | Nivel esperado (tabla 4.3) para Gerente | Gerente | B | B / resolvePositionManagementLevel=B | OK |
| COMP-Especialista | Competencias asignadas a Especialista (Dirección de Talento Humano) | Especialista / Dirección de Talento Humano | 8: Orientación al Servicio, Optimización de Procesos, Administración de Infraestructura y Recursos Críticos | 8: Orientación al Servicio, Optimización de Procesos, Administración de Infraestructura y Recursos Críticos | OK |
| NIV-Especialista | Nivel esperado (tabla 4.3) para Especialista | Especialista | C | D / resolvePositionManagementLevel=D | FALLA |
| COMP-Responsable | Competencias asignadas a Responsable (Dirección de Compras) | Responsable / Dirección de Compras | 8: Prevención de Pérdidas y Control de Inventarios, Estructuración y Control Presupuestario, Gestión de Riesgos y Auditoría de Procesos | 8: Gestión de Indicadores, Visual Merchandising, Negociación Comercial | FALLA |
| NIV-Responsable | Nivel esperado (tabla 4.3) para Responsable | Responsable | C | D / resolvePositionManagementLevel=D | FALLA |
| COMP-Encargado de Tienda | Competencias asignadas a Encargado de Tienda (Dirección de Operaciones) | Encargado de Tienda / Dirección de Operaciones | 8: Gestión de Indicadores, Visual Merchandising, Negociación Comercial | 8: Gestión de Indicadores, Visual Merchandising, Negociación Comercial | OK |
| NIV-Encargado de Tienda | Nivel esperado (tabla 4.3) para Encargado de Tienda | Encargado de Tienda | C | D / resolvePositionManagementLevel=D | FALLA |
| COMP-Asesor Integral | Competencias asignadas a Asesor Integral (Dirección de Operaciones) | Asesor Integral / Dirección de Operaciones | 8: Gestión de Indicadores, Visual Merchandising, Negociación Comercial | 8: Gestión de Indicadores, Visual Merchandising, Negociación Comercial | OK |
| NIV-Asesor Integral | Nivel esperado (tabla 4.3) para Asesor Integral | Asesor Integral | D | D / resolvePositionManagementLevel=D | OK |
| COMP-Operador Integral | Competencias asignadas a Operador Integral (Dirección de Transporte y Logística) | Operador Integral / Dirección de Transporte y Logística | 8: Orientación al Servicio, Optimización de Procesos, Administración de Infraestructura y Recursos Críticos | 8: Orientación al Servicio, Optimización de Procesos, Administración de Infraestructura y Recursos Críticos | OK |
| NIV-Operador Integral | Nivel esperado (tabla 4.3) para Operador Integral | Operador Integral | D | D / resolvePositionManagementLevel=D | OK |
| AREA-Dirección Comercial | Grupo de área para Dirección Comercial | Analista / Dirección Comercial | Gestión de Indicadores · Visual Merchandising · Negociación Comercial | Gestión de Indicadores · Visual Merchandising · Negociación Comercial | OK |
| AREA-Dirección de Operaciones | Grupo de área para Dirección de Operaciones | Analista / Dirección de Operaciones | Gestión de Indicadores · Visual Merchandising · Negociación Comercial | Gestión de Indicadores · Visual Merchandising · Negociación Comercial | OK |
| AREA-Dirección de Transporte y Logística | Grupo de área para Dirección de Transporte y Logística | Analista / Dirección de Transporte y Logística | Orientación al Servicio · Optimización de Procesos · Administración de Infraestructura y Recursos Críticos | Orientación al Servicio · Optimización de Procesos · Administración de Infraestructura y Recursos Críticos | OK |
| AREA-Dirección de Tecnología | Grupo de área para Dirección de Tecnología | Analista / Dirección de Tecnología | Orientación al Servicio · Optimización de Procesos · Administración de Infraestructura y Recursos Críticos | Orientación al Servicio · Optimización de Procesos · Administración de Infraestructura y Recursos Críticos | OK |
| AREA-Dirección de Talento Humano | Grupo de área para Dirección de Talento Humano | Analista / Dirección de Talento Humano | Orientación al Servicio · Optimización de Procesos · Administración de Infraestructura y Recursos Críticos | Orientación al Servicio · Optimización de Procesos · Administración de Infraestructura y Recursos Críticos | OK |
| AREA-Dirección de Administración y Finanzas | Grupo de área para Dirección de Administración y Finanzas | Analista / Dirección de Administración y Finanzas | Prevención de Pérdidas y Control de Inventarios · Estructuración y Control Presupuestario · Gestión de Riesgos y Auditoría de Procesos | Prevención de Pérdidas y Control de Inventarios · Estructuración y Control Presupuestario · Gestión de Riesgos y Auditoría de Procesos | OK |
| AREA-Dirección de Control Interno | Grupo de área para Dirección de Control Interno | Analista / Dirección de Control Interno | Prevención de Pérdidas y Control de Inventarios · Estructuración y Control Presupuestario · Gestión de Riesgos y Auditoría de Procesos | Prevención de Pérdidas y Control de Inventarios · Estructuración y Control Presupuestario · Gestión de Riesgos y Auditoría de Procesos | OK |
| AREA-Dirección de Compras | Grupo de área para Dirección de Compras | Analista / Dirección de Compras | Prevención de Pérdidas y Control de Inventarios · Estructuración y Control Presupuestario · Gestión de Riesgos y Auditoría de Procesos | Gestión de Indicadores · Visual Merchandising · Negociación Comercial | FALLA |
| RN01-NOM | Nombres de competencias del diccionario = §4.1/§4.2 (literal) | ALL_OFFICIAL_COMPETENCIES | 20 nombres literales | 20 nombres; faltan: []; extra: [] | OK |
| B2-OPC | Opciones del caso situacional alineadas a niveles A/B/C/D | Orientación al Cliente (Analista) | letras A,B,C,D con 5,00/3,75/2,50/1,25 | D=5,D=3.75,D=2.5,D=1.25 | FALLA |
| B2-TXT | Texto de opción 25 % (nivel D) es comportamiento del nivel D | Orientación al Cliente | comportamiento observable del nivel D del Modelo | "Atiendo a los clientes y tiene un trato con mis pares siguiendo los protocolos de saludo básicos, atendiendo c..." (reutiliza el ítem 5 del nivel D + frase inventada) | FALLA |
| B2-BRD | Bloque 2 del Director incluye competencias de Junta Directiva (brd-*) | Director: no-brd=5,00; brd=1,25 (11 ítems) | 3.98 | 5.00 | FALLA |
| NORM-AUDITOR FINANCIERO | normalizePosition("AUDITOR FINANCIERO") | AUDITOR FINANCIERO | Analista | Analista | OK |
| NORM-AUDITOR (A) | normalizePosition("AUDITOR (A)") | AUDITOR (A) | Analista | Analista | OK |
| NORM-CHOFER | normalizePosition("CHOFER") | CHOFER | Operador Integral | Operador Integral | OK |
| NORM-AYUDANTE DE ALMACEN | normalizePosition("AYUDANTE DE ALMACEN") | AYUDANTE DE ALMACEN | Operador Integral | Operador Integral | OK |
| NORM-MONTACARGUISTA | normalizePosition("MONTACARGUISTA") | MONTACARGUISTA | Operador Integral | Analista | FALLA |
| NORM-OPERADOR DE MONTACARGAS | normalizePosition("OPERADOR DE MONTACARGAS") | OPERADOR DE MONTACARGAS | Operador Integral | Operador Integral | OK |
| NORM-COORDINADOR DE TIENDA | normalizePosition("COORDINADOR DE TIENDA") | COORDINADOR DE TIENDA | Coordinador | Coordinador | OK |
| NORM-DIRECTOR DE TECNOLOGIA | normalizePosition("DIRECTOR DE TECNOLOGIA") | DIRECTOR DE TECNOLOGIA | Director | Director | OK |
| NORM-ASESOR INTEGRAL | normalizePosition("ASESOR INTEGRAL") | ASESOR INTEGRAL | Asesor Integral | Asesor Integral | OK |
| NORM-ASISTENTE ADMINISTRATIVO | normalizePosition("ASISTENTE ADMINISTRATIVO") | ASISTENTE ADMINISTRATIVO | (no definido en alcance) | Analista | FALLA |
| MOD-Director-canguroUniverso.ts:244 | Modalidad para "Director" en canguroUniverso.ts:244 (censo) | Director | 360 | 360 | OK |
| MOD-Director-canguroUniverso.ts:640/718 | Modalidad para "Director" en canguroUniverso.ts:640/718 (alta/carga) | Director | 360 | 360 | OK |
| MOD-Director-CompetencyHeatmap/AuditEvaluationsViewer | Modalidad para "Director" en CompetencyHeatmap/AuditEvaluationsViewer (isSupervisionEligible) | Director | 360 | 180 | FALLA |
| MOD-Director-DatabaseStatusModal.tsx:214-221 | Modalidad para "Director" en DatabaseStatusModal.tsx:214-221 (carga Excel) | Director | 360 | 360 | OK |
| MOD-Coordinador-canguroUniverso.ts:244 | Modalidad para "Coordinador" en canguroUniverso.ts:244 (censo) | Coordinador | 360 | 360 | OK |
| MOD-Coordinador-canguroUniverso.ts:640/718 | Modalidad para "Coordinador" en canguroUniverso.ts:640/718 (alta/carga) | Coordinador | 360 | 360 | OK |
| MOD-Coordinador-CompetencyHeatmap/AuditEvaluationsViewer | Modalidad para "Coordinador" en CompetencyHeatmap/AuditEvaluationsViewer (isSupervisionEligible) | Coordinador | 360 | 360 | OK |
| MOD-Coordinador-DatabaseStatusModal.tsx:214-221 | Modalidad para "Coordinador" en DatabaseStatusModal.tsx:214-221 (carga Excel) | Coordinador | 360 | 360 | OK |
| MOD-Encargado de Tienda-canguroUniverso.ts:244 | Modalidad para "Encargado de Tienda" en canguroUniverso.ts:244 (censo) | Encargado de Tienda | 180 | 180 | OK |
| MOD-Encargado de Tienda-canguroUniverso.ts:640/718 | Modalidad para "Encargado de Tienda" en canguroUniverso.ts:640/718 (alta/carga) | Encargado de Tienda | 180 | 360 | FALLA |
| MOD-Encargado de Tienda-CompetencyHeatmap/AuditEvaluationsViewer | Modalidad para "Encargado de Tienda" en CompetencyHeatmap/AuditEvaluationsViewer (isSupervisionEligible) | Encargado de Tienda | 180 | 180 | OK |
| MOD-Encargado de Tienda-DatabaseStatusModal.tsx:214-221 | Modalidad para "Encargado de Tienda" en DatabaseStatusModal.tsx:214-221 (carga Excel) | Encargado de Tienda | 180 | 360 | FALLA |
| MOD-Analista-canguroUniverso.ts:244 | Modalidad para "Analista" en canguroUniverso.ts:244 (censo) | Analista | 180 | 180 | OK |
| MOD-Analista-canguroUniverso.ts:640/718 | Modalidad para "Analista" en canguroUniverso.ts:640/718 (alta/carga) | Analista | 180 | 180 | OK |
| MOD-Analista-CompetencyHeatmap/AuditEvaluationsViewer | Modalidad para "Analista" en CompetencyHeatmap/AuditEvaluationsViewer (isSupervisionEligible) | Analista | 180 | 180 | OK |
| MOD-Analista-DatabaseStatusModal.tsx:214-221 | Modalidad para "Analista" en DatabaseStatusModal.tsx:214-221 (carga Excel) | Analista | 180 | 180 | OK |
| MOD-Especialista de Servicio al Cliente-canguroUniverso.ts:244 | Modalidad para "Especialista de Servicio al Cliente" en canguroUniverso.ts:244 (censo) | Especialista de Servicio al Cliente | 180 | 180 | OK |
| MOD-Especialista de Servicio al Cliente-canguroUniverso.ts:640/718 | Modalidad para "Especialista de Servicio al Cliente" en canguroUniverso.ts:640/718 (alta/carga) | Especialista de Servicio al Cliente | 180 | 180 | OK |
| MOD-Especialista de Servicio al Cliente-CompetencyHeatmap/AuditEvaluationsViewer | Modalidad para "Especialista de Servicio al Cliente" en CompetencyHeatmap/AuditEvaluationsViewer (isSupervisionEligible) | Especialista de Servicio al Cliente | 180 | 180 | OK |
| MOD-Especialista de Servicio al Cliente-DatabaseStatusModal.tsx:214-221 | Modalidad para "Especialista de Servicio al Cliente" en DatabaseStatusModal.tsx:214-221 (carga Excel) | Especialista de Servicio al Cliente | 180 | 360 | FALLA |
| MGMT-Analista de Servicio al Cliente | getManagementLevel("Analista de Servicio al Cliente") (responsibilityResolver) | Analista de Servicio al Cliente | OPERATIVO | ESTRATÉGICO | FALLA |
| MGMT-Asesor de Comercio Electrónico | getManagementLevel("Asesor de Comercio Electrónico") (responsibilityResolver) | Asesor de Comercio Electrónico | OPERATIVO | ESTRATÉGICO | FALLA |
| PROM-85 | resolvePromotionThreshold(85) | 85 pts | APROBADO | APROBADO (85 - 100 pts) | OK |
| PROMV-85 | Casillas de veredicto PromotionResultsView (85) | 85 pts | APROBADO | APROBADO CONDICIONADO | FALLA |
| PROM-84.9 | resolvePromotionThreshold(84.9) | 84.9 pts | APROBADO | APROBADO (75 - 84,9 pts) | OK |
| PROMV-84.9 | Casillas de veredicto PromotionResultsView (84.9) | 84.9 pts | APROBADO | APROBADO CONDICIONADO | FALLA |
| PROM-70 | resolvePromotionThreshold(70) | 70 pts | APROBADO | APROBADO CONDICIONADO (65 - 74,9 pts) | FALLA |
| PROMV-70 | Casillas de veredicto PromotionResultsView (70) | 70 pts | APROBADO | NO APROBADO | FALLA |
| PROM-69.9 | resolvePromotionThreshold(69.9) | 69.9 pts | APROBADO CONDICIONADO | APROBADO CONDICIONADO (65 - 74,9 pts) | OK |
| PROMV-69.9 | Casillas de veredicto PromotionResultsView (69.9) | 69.9 pts | APROBADO CONDICIONADO | NO APROBADO | FALLA |
| PROM-60 | resolvePromotionThreshold(60) | 60 pts | APROBADO CONDICIONADO | NO APROBADO (< 65 pts) | FALLA |
| PROMV-60 | Casillas de veredicto PromotionResultsView (60) | 60 pts | APROBADO CONDICIONADO | NO APROBADO | FALLA |
| PROM-59.9 | resolvePromotionThreshold(59.9) | 59.9 pts | NO APROBADO | NO APROBADO (< 65 pts) | OK |
| PROMV-59.9 | Casillas de veredicto PromotionResultsView (59.9) | 59.9 pts | NO APROBADO | NO APROBADO | OK |

### 3.3 Censo (conteos, sin datos personales)

| Métrica | Valor |
|---|---|
| Colaboradores en memoria | 2.406 (alcance: ~190; AMB-08 pendiente) |
| Por familia | Asesor Integral 1.326 · Operador Integral 349 · Coordinador 240 · Responsable 201 · Analista 166 · Supervisor 53 · Gerente 39 · Especialista 23 · Director 8 · Encargado de Tienda 1 (registro de muestra «FULANITO DETAL») |
| Modalidad | 180° = 2.066 · 360° = 340 |
| Por Dirección | Operaciones 1.717 · Tecnología **de la Información** 246 · Transporte y Logística 182 · Comercial 91 · Adm. y Finanzas 61 · Talento Humano 55 · Control Interno 37 · Compras 17 |
| Puestos que caen al *fallback* «Analista» sin serlo | 38 personas / 20 títulos (Auxiliar de Validación y Codificación 7, Diseñador Gráfico 6, Promotor de Eventos 3, Community Manager 3, Personal Administrativo 2, Planificador de la Demanda 2, Desarrollador Odoo 2, Contador Odoo 2, Arquitecto 3, Comprador 1, Abogado 1, Técnico de Garantías 1, Asistente Ejecutiva 1…) |
| Personas con nivel esperado D (nunca generan brechas, NEG-008) | Asesor 1.326 + Operador 349 + Analista 166 = **1.841** |

---

## 4. Inconsistencias entre implementaciones duplicadas

| Regla | Implementación | Valores | ¿Coincide con alcance + decisiones? |
|---|---|---|---|
| **Nota final** | `realEvaluationMetrics.ts:534` | 60/30/10 (con potencial) | No |
| | `AdminComparisonModule.tsx:2122-2160` | Muestra 60/30/10 | No |
| | `AuditEvaluationsViewer.tsx:83-89` | Rótulos B1 60 % / B2 30 % | No |
| | `PotentialLeadershipDashboard.tsx:115`; `realEvaluationMetrics.ts:22` | Potencial «10 % del total» | No |
| **Ponderación por fuente** | `realEvaluationMetrics.ts:443-500` | B1 Sup 60/Par 20/Sub 20 (sin auto); B2 = auto | No |
| | `CompetencyHeatmap.tsx:79-83` (sin uso) | 360: 50/15/20/15; 180: 55/20/25; sin renormalizar | No |
| | `AuditEvaluationsViewer.tsx:115-117` | 360: 45/25/15/15; 180: 55/25/20 (sin variantes «sin pares») | Parcial |
| **Tramos (corte)** | `realEvaluationMetrics.ts:549-560` | Base 100: < 55 / 55–65,9 / 66–79,9 / 80–100 / > 100 | No |
| | `types.ts:120-201` `MERIT_TIERS` | 0–2,70 / 2,75–3,25 / 3,30–3,95 / 4,00–5,00 / 5,05–6,25 | No |
| | `NormalCurve.tsx:230-236` `getTramoId` | % ≤ 54 / ≤ 65 / ≤ 79 / ≤ 100 / > 100 (54,5 % → T2 aquí; T1 en `realEvaluationMetrics`) | No |
| | `ExecutiveTalentDashboard.tsx:487-519` (*fallback*) | ≤ 54 / 55–65 / 66–79 / 80–100 / ≥ 101 (con **huecos** 54–55, 65–66, 79–80) | No |
| | `OrganizationalDashboard.tsx:301-305` (rótulos) | T5 110–120 %, T4 101–110 %, T3 80–100 %, T2 55–79 %, T1 < 54 % | No (y contradice a los anteriores) |
| | `CargoPerformanceBreakdown.tsx:208-225` | ≥ 4,75 / 4,25 / 3,75 / 3,00 | **Sí** |
| | `CompetencyHeatmap.tsx:121-157`; `OrganizationalDashboard.tsx:517-518, 817-819` (colores) | ≥ 4,75 / 4,25 / 3,75 / 3,00 | Sí |
| | `realEvaluationMetrics.ts:576-585` (percentil) | Escala propia de percentiles (4,85→P99…) | No normado |
| **Nine-Box (umbrales X / Y)** | `scoreAlignment.ts:66-77`; `NineBox.tsx:14-25`; `PotentialLeadershipDashboard.tsx:56-57` | X y Y: < 3,00 / 3,00–4,24 / ≥ 4,25 | Umbral no definido (AMB-19) |
| | `ExecutiveTalentDashboard.tsx:311-312` | X: 3,0 / 4,0 · Y: 2,5 / 3,9 | Distinto |
| | `ExecutiveTalentDashboard.tsx:657-665` (promedio) | X: 3,0 / 4,0 · Y: 2,5 / 3,75 | Distinto (mismo archivo) |
| | `CompetencyGapAnalysisChart.tsx:135, 465-533` | Celda por `mapToNineBox` (3,00/4,25) y rótulos con 3,90 / 2,50 | Contradictorio en el mismo componente |
| | `OrganizationalDashboard.tsx:328-337` | 5 categorías con 4,25 / 3,00 | Distinto |
| | `potentialLeadershipQuestions.ts:439-442` | Nivel de potencial 2,50 / 3,90 | Distinto |
| **Nine-Box (ejes)** | Perfil `AdminComparisonModule.tsx:1891` / Executive `:305-306` | X = nota final · Y = potencial (B3) o B2 o 3,5 | No (AMB-04) |
| | `PDI.tsx:116` | X = B1 o **3,5** · Y = B3 o B2 o 3,5 | No |
| | `OrganizationalDashboard.tsx:326-327` | X = B1 o final · Y = radar «leadership» | No |
| **Elegibilidad a promoción (9-Box)** | `AdminComparisonModule.tsx:333`; `CompetencyGapAnalysisChart.tsx:137` | B1 ≥ 3,00 y Pot ≥ 2,50 | No normado |
| | `NineBox.tsx:37` | índice ≥ 1 en ambos ejes (Pot ≥ 3,00) | Distinto |
| **Modalidad 180/360** | 5 implementaciones (ver NEG-023 y `MOD-*`) | Encargado → 360 en 2 de ellas; Director → 180 en 2 | No |
| **Dictamen de promoción** | `types.ts:417-422` | 85 / 75 / 65 | No |
| | `PromotionResultsView.tsx:461-492` | 90 / 80 | No |
| | `PromotionPhasesManagerModal.tsx:60-64` | 4,50 / 3,75 (escala 1–5) | No |
| | `AdminComparisonModule.tsx:1777-1778` | 85 / 70 (*fitLevel*) | Parcial |
| | `server.ts:390` | entrevista ≥ 4,5 | No |
| **Puntaje de promoción** | `promotionDefaults.ts:32` / `PromotionPhasesManagerModal.tsx:59` / `Evaluate.tsx:390-398` | 30/40/30 · 40/60 · fijo 4,5 (90) | No verificable (AMB-12), pero inconsistente |
| **Sucesión** | `AdminComparisonModule.tsx:312` / `SuccessionBankView.tsx:35` / `canguroUniverso.ts:991` | T5 && ≥ 4,75 (nunca) · ≥ 4,75 · lista fija | No |
| **Nivel esperado por cargo** | `canguroCompetencyDictionary.ts:1716-1728` / `:66` (`CANGURO_GENERAL_LEVELS.C` = «Coordinadores y Especialistas») / `responsibilityResolver.ts:49-63` (Responsable = medio, Especialista = bajo) | Tres criterios distintos para Especialista y Responsable | No |
| **Nombre de Dirección** | `canguroUniverso.ts:82` «Dirección de Tecnología de la Información» vs. `types.ts:68` y `canguroCompetencyDictionary.ts:1177` «Dirección de Tecnología» | Filtros por igualdad exacta no coinciden | No |
| **Supervisor inmediato / pares** | Instrumento: un `peerEval` (`types.ts:473`) · Portal: pares del organigrama (`evaluationRelations.ts:62-71`) · Campana: mismo título en toda la empresa (`AdminComparisonModule.tsx:428`) | Tres definiciones | No (AMB-06) |

---

## 5. Funcionalidad fuera de alcance (para que la usuaria decida si se mantiene)

| # | Módulo / función | Ubicación | Observación |
|---|---|---|---|
| 1 | People Analytics — Impacto del Nivel Académico (ANOVA, Spearman, *box plot*) | `PeopleAnalyticsEducationDashboard.tsx`, `utils/peopleAnalyticsEducation.ts` | No está en el alcance; parte del nivel académico se **genera por semilla** (`peopleAnalyticsEducation.ts:219-240`) |
| 2 | Dossier psicométrico / visualizador | `PsychometricDossierVisualizer.tsx`, `utils/psychometricReportEngine.ts` | Fuera de alcance (salvo el Big Five de 20 de la Fase 1) |
| 3 | RIASEC en el expediente general («Resumen») | `AdminComparisonModule.tsx:2638-2676` | El alcance lo limita a sucesión; además los valores son constantes para todos |
| 4 | Bloque 3 «Potencial y Liderazgo» (18 reactivos) y su *dashboard* | `PotentialLeadershipEvalForm.tsx`, `PotentialLeadershipDashboard.tsx`, `potentialLeadershipQuestions.ts` | Salió de la nota por AMB-01; decidir si se conserva como dato informativo (AMB-29) |
| 5 | Dashboard de Promociones (KPIs históricos, desempeño a 6 meses) | `PromotionsDashboard.tsx`, `data/promotionsAnalyticsData.ts` | Datos estáticos de promociones históricas; plantilla fija de 2.406 |
| 6 | Dashboard Ejecutivo extendido (filtros por sede, mes, año, jerarquía, curva teórica, % de objetivos) | `ExecutiveTalentDashboard.tsx` | Excede «Resultados Generales»; la sede se **infiere por texto** (`:99-114`) |
| 7 | Portal de colaborador («cuadrantes» de autoevaluación y evaluación de pares, supervisor y subordinados) | `CollaboratorEvaluationQuadrants.tsx`, `EvaluationHubHome.tsx:49-61` | Contradice AMB-09 |
| 8 | Recuperación y reinicio de contraseñas de usuarios | `UserPasswordRecoveryModule.tsx` | Solo tiene sentido con logins de colaboradores (AMB-09) |
| 9 | Instrumento de «Prueba Piloto» con cargas rápidas | `PilotEvaluationModal.tsx` | Permite fabricar o borrar evaluaciones |
| 10 | Habilitación de cargos por ciclo y calendario de apertura/cierre de evaluaciones | `EvaluationPositionsManager.tsx`, `utils/evaluationPositionsConfig.ts`, `utils/evaluationStatus.ts` | Útil, pero no normado |
| 11 | Editor de reactivos por Dirección con competencias no normadas | `PerformanceEvaluationConfigView.tsx` | Ver NEG-025 |
| 12 | Generación de reactivos con Gemini y «dictamen IA» | `server.ts:228-392`, `JobDescriptorModal.tsx` | AMB-16: solo sugerencia |
| 13 | Matriz de brechas y análisis «Gap» con elegibilidad a promoción por 9-Box | `CompetencyGapAnalysisChart.tsx` | La regla «X ≥ 3,00 y Y ≥ 2,50» no está en el alcance |
| 14 | Desglose por cargo / jerarquía | `CargoPerformanceBreakdown.tsx` | Útil; es la única con tramos correctos |
| 15 | Modal de estado de BD e importación masiva desde Excel | `DatabaseStatusModal.tsx` | La gestión del censo sí está en alcance; la clasificación 180/360 que hace no (NEG-023) |
| 16 | Diseñador de formatos | `EvaluationFormatDesigner.tsx` | Sus cambios no llegan al instrumento |

---

## 6. Nuevas ambigüedades (preguntas para la usuaria)

| ID | Tema | Pregunta concreta | Recomendación |
|---|---|---|---|
| AMB-19 | Cortes Bajo/Medio/Alto del Nine-Box | El §6.7 define los ejes pero no los cortes. ¿Qué umbrales usamos para B1 y B2? | Alinear con los tramos: Bajo < 3,75 · Medio 3,75–4,24 · Alto ≥ 4,25 (u otra opción que usted indique) |
| AMB-20 | Grupo de área de Compras | `requeriment.md` (§2.2/§4.2) ubica Compras en «Blindaje y Control», pero el código dice basarse en el Modelo (pág. 30-35) y la pone en «Motores de Venta». ¿Qué dice el Modelo DTH-GFD-MC-01 vigente? | Si el Modelo coincide con `requeriment.md`, corregir el código |
| AMB-21 | Número de pares y subordinados | ¿Cuántos pares y subordinados evalúan a cada colaborador (mínimo y máximo)? ¿Se promedian dentro de la fuente antes de aplicar la tabla 6.4? | N evaluadores por fuente, promedio simple dentro de la fuente |
| AMB-22 | Formularios KPI (AMB-07) | ¿Los responden todos los roles (incluida la autoevaluación)? ¿Se mantienen los sub-pesos 50/35/15 (KPI/Conducta/Estrategia) y la escala de cada formulario, o la escala de frecuencia 1–5 del §6.2? | Confirmar y actualizar el §6.2 |
| AMB-23 | Escala del Bloque 2 | ¿Las 4 opciones son los comportamientos de los niveles A/B/C/D de la competencia (lectura literal del §6.2), o «% de dominio del nivel esperado del cargo» (como está implementado)? Define cómo se calcula la brecha (esperado − demostrado) | Lectura literal A–D; brecha = puntos del nivel esperado − puntos de la opción elegida |
| AMB-24 | Cargos sin familia | 38 personas (Diseñador, Abogado, Comprador, Community Manager, Arquitecto, Técnico, Asistente, Promotor, Planificador…) no encajan en las 10 familias. ¿A cuál asignamos cada uno? | Tabla de equivalencias aprobada por TH |
| AMB-25 | Encargado de Tienda | ¿Tiene personal a cargo? El alcance lo deja en 180°; dos partes del código lo ponen en 360° | Confirmar 180° (alcance) o ampliar el RN-06 |
| AMB-26 | Completitud del instrumento | ¿Se puede enviar con reactivos sin responder? Si se permite, ¿cómo se trata un reactivo omitido? | Exigir el 100 % de los reactivos cerrados |
| AMB-27 | Redondeo antes del tramo | ¿La nota se redondea a 2 decimales antes de asignar el tramo (p. ej. 4,745 → 4,75 → T5) o se trunca? | Redondeo a 2 decimales, documentado |
| AMB-28 | Benchmarks sin datos | Si no hay evaluaciones de la Dirección o de los pares, ¿la campana se muestra sin comparativo o se oculta? | Mostrar «sin datos» (coherente con AMB-14) |
| AMB-29 | Bloque 3 de Potencial | ¿Se elimina del instrumento o se conserva como dato informativo, sin peso y fuera del Nine-Box? | Eliminar (reduce el tiempo de respuesta) |
| AMB-30 | Promoción: instrumento de la Fase 2 | ¿Las «5 preguntas situacionales calibradas» son las competencias del cargo destino (como está hoy) o 5 casos técnicos del descriptor (generados y auditados)? | Definir junto con AMB-12 |

---

## 7. Anexo — Verificaciones textuales

| Ítem | Resultado |
|---|---|
| Recomendaciones (§7.2) en `Evaluate.tsx:830` | Literal ✔ |
| Recomendaciones en `server.ts:121` (HTML del correo) | Literal ✔ |
| Recomendaciones en `EvaluationProfileConfig.tsx:209, 211` (texto plano) | Literal ✔ (×2) |
| Asunto «Convocatoria Oficial de Evaluación — {Nombre} \| El Canguro» | Literal ✔ en `EvaluationProfileConfig.tsx:220, 253` (no invocado, NEG-010); `server.ts` usa el asunto que recibe |
| Saludo «Estimado colaborador,» | `server.ts:108` ✔; el texto de promoción usa «Estimado(a) {nombre}» |
| Nota de confidencialidad | `server.ts:138` ✔ |
| Firma «Gerencia de Formación y Desarrollo» | Texto plano ✔ («Atentamente, …»); HTML solo en el encabezado |
| `ProfileForm.tsx:25-26` (sin uso) | Asunto y cuerpo **no oficiales** («Invitación a Evaluación de Desempeño - Canguro Venezuela») |
| Nombres de las 20 competencias (§4.1/4.2) | Literales ✔ en el diccionario; **no** en `PerformanceEvaluationConfigView.tsx:500-513` |

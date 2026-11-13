# Auditoría Funcional y UX — Pruebas en navegador

**Fecha:** 2026-11-13 · **Entorno:** app local (`npm run dev` vía lanzador aislado), **sin base de datos ni IA** (DATABASE_URL y GEMINI_API_KEY vacías a propósito para no tocar datos reales). Navegador integrado, escritorio 1024×768 y móvil 375×812.
**Referencias:** inventario en `02_INVENTARIO_MODULOS.md`; decisiones en `03_REGISTRO_DECISIONES.md §4`.

> Limitación: sin BD no se pudo probar el flujo multi-equipo real (evaluador en un equipo, administrador en otro). Las pruebas F-07/F-08 demuestran por qué ese flujo hoy no funciona sin BD.

## Resumen

| Severidad | Hallazgos |
|---|---|
| Crítica | 5 |
| Alta | 6 |
| Media | 5 |
| Baja | 2 |

## Casos de prueba ejecutados

| ID | Caso | Esperado | Obtenido | Estado |
|---|---|---|---|---|
| F-01 | Login con la credencial genérica de admin del código (`authService.ts:225`) | Rechazo | Acceso total como "Administrador General" | ❌ |
| F-02 | Login de un colaborador del censo (Asesor Integral) con su cédula como contraseña | Según AMB-09, los colaboradores no inician sesión | Acceso; obliga a cambiar la contraseña y abre el "Portal de Evaluaciones" | ❌ |
| F-03 | Almacenamiento de la nueva contraseña | Hash en servidor | Texto plano en `localStorage['canguro_custom_passwords']` | ❌ |
| F-04 | Escalada: cambiar `role` a `admin` en `localStorage['canguro_authenticated_session']` y recargar | Rechazo | El Asesor ve el menú de administrador completo | ❌ |
| F-05 | Abrir un enlace fabricado a mano para una cédula inexistente (`99999999`) y un evaluador inventado | Rechazo (token inválido) | El formulario abre y acepta el envío | ❌ |
| F-06 | Formulario de supervisor, Dirección Comercial | Formulario operativo | Pantalla de error: `ReferenceError: answeredQuestions is not defined` (`ComercialSection1Form.tsx:577`). El mismo defecto existe en `AdministracionFinanzasSection1Form.tsx:577` | ❌ |
| F-07 | Envío del instrumento (Dirección de Tecnología) | Persistencia central | La UI muestra "registrado y bloqueado formalmente en el sistema", pero `POST /api/db/evaluations` respondió `{"success":false}`. La respuesta solo queda en el navegador del evaluador | ❌ |
| F-08 | Reenvío tras borrar `canguro_consumed_evaluation_links` y `eval_form_*` | Bloqueo (RN-12) | El formulario se reabre y permite responder de nuevo (también en otro navegador o en modo incógnito) | ❌ |
| F-09 | Enviar sin aceptar la Carta de Honestidad | Bloqueo (RN-11) | Botón deshabilitado hasta marcarla | ✅ (solo en cliente) |
| F-10 | Respuestas pre-marcadas (RN-10) | Ninguna | Ninguna pre-marcada en S1–S4 | ✅ |
| F-11 | Recomendaciones previas (texto §7.2) | Texto literal | Coincide con el alcance | ✅ |
| F-12 | Asignación de competencias para un Coordinador | 5 cardinales + 3 de supervisión + 3 de área = 11 | 11 casos situacionales | ✅ (conteo) |
| F-13 | Perfil de un colaborador **sin evaluaciones** | Todo "pendiente" | Muestra B3 Potencial 3,50/5 "Bajo" (+0,35 pts) y un diagnóstico narrativo de liderazgo inventado | ❌ |
| F-14 | Formulario del evaluador en móvil (375 px) | Sin scroll horizontal, legible | OK, sin desbordamiento | ✅ |
| F-15 | Inicio con 0 evaluaciones | Indicadores en cero | La tarjeta "Nivel académico" muestra 77/79/81/83 %; el tablero muestra "24 Promociones" | ❌ (datos de demostración) |
| F-16 | Asistente de configuración en 3 subprocesos (§5.1.1) | Datos del colaborador → Alcance → Centro de Enlaces | No existe como asistente. La configuración es por Dirección y familia de cargos; **no hay un Centro de Enlaces en el menú** (los enlaces se generan en `EvaluationProfileConfig.tsx` / `CollaboratorEvaluationQuadrants.tsx`) | ❌ |
| F-17 | Población evaluable | Todo el censo puede ser evaluado (§2.3) | Por defecto solo "Liderazgo": 332 de 2.406. Asesores, Operadores, Analistas, Especialistas y Directores están excluidos | ⚠️ Revisar |
| F-18 | Asesor "excluido" del ciclo | Sin evaluación activa | El Asesor ve "Realizar mi autoevaluación" en su portal | ❌ |

## Hallazgos

| ID | Sev. | Descripción | Evidencia | Corrección | Esf. |
|---|---|---|---|---|---|
| FUN-001 | Crítica | Se puede acceder como administrador con credenciales genéricas embebidas en el código | F-01; `authService.ts:225-257` | Autenticación en servidor; eliminar las credenciales del código | M |
| FUN-002 | Crítica | Escalada de privilegios: el rol vive en `localStorage` | F-04 | Sesión firmada en servidor; RBAC en la API | L |
| FUN-003 | Crítica | La confirmación de envío es falsa sin BD: el administrador nunca recibe las respuestas de otros equipos | F-07; `Evaluate.tsx` + `/api/db/evaluations` | Exigir respuesta `success:true` del servidor antes de confirmar; BD obligatoria (AMB-17) | M |
| FUN-004 | Crítica | Los enlaces se pueden falsificar y reutilizar; el "uso único" es solo local | F-05, F-08; `Evaluate.tsx:109-170` | Token aleatorio en BD, marcado como consumido en servidor | M |
| FUN-005 | Crítica | Los formularios del Bloque 1 de Comercial y de Administración y Finanzas se caen. Comercial y Operaciones concentran la mayoría de la población | F-06; `ComercialSection1Form.tsx:577`, `AdministracionFinanzasSection1Form.tsx:577` | Definir `answeredQuestions` como en `TecnologiaSection1Form.tsx:539`; prueba de humo por Dirección | S |
| FUN-006 | Alta | Los colaboradores inician sesión con su cédula y ven el portal, contra AMB-09 y AMB-11 | F-02, F-18 | Retirar el login de colaborador; acceso solo por enlace | M |
| FUN-007 | Alta | Se fabrican resultados sin datos: Potencial 3,50 y narrativa de liderazgo para un colaborador no evaluado | F-13; `realEvaluationMetrics.ts:510-527` (proxy y valores por defecto) | Mostrar "Sin datos"; nunca imputar | S |
| FUN-008 | Alta | Los tableros muestran datos de demostración junto a datos reales | F-15 | Retirar datos semilla o marcarlos como "DEMO" | M |
| FUN-009 | Alta | No existe el asistente de 3 subprocesos ni el Centro de Enlaces con "Enviar Correos Oficiales" (RN-13) | F-16; inventario | Construir el asistente por colaborador | L |
| FUN-010 | Alta | Perspectiva incoherente en el instrumento de supervisor: los reactivos dicen "Mi líder…" y la instrucción dice "seleccione **su** reacción habitual" | F-07 (S1–S3) | Ajustar los textos por rol evaluador | M |
| FUN-011 | Alta | El contexto de competencias muestra "(Coordinador - Red de Tiendas)" para un evaluado de Tecnología | F-07 (S2) | Verificar la asignación del grupo de área por Dirección (RN-05) | S |
| FUN-012 | Media | La UI publica ponderaciones por fuente como rangos ("50 %–70 %") en vez de la tabla 6.4 | F-13 | Mostrar el peso aplicado | S |
| FUN-013 | Media | La Sección 3 (Potencial, 18 reactivos) sigue en el instrumento aunque AMB-01 lo saca de la nota | F-07 | Retirarla o dejarla informativa, según decisión | S |
| FUN-014 | Media | El filtro de mes marca "Octubre (Mes en Curso)" fijo en el código (hoy es noviembre) | Dashboard | Calcular a partir de la fecha | S |
| FUN-015 | Media | Censo de 2.406 en la UI frente a ~190 en el alcance y 2.543/2.746 en la documentación técnica (AMB-08) | Inicio | Confirmar la fuente del censo | — |
| FUN-016 | Media | Mensaje del ErrorBoundary engañoso ("inconsistencia en los datos temporales del navegador") ante errores de código; el botón "Reiniciar datos" borra trabajo | F-06 | Mensaje genérico y reporte; no ofrecer borrado | S |
| FUN-017 | Baja | Vistas y componentes muertos, y la Matriz 9-Box duplicada en el menú | Inventario | Limpieza | S |
| FUN-018 | Baja | Si se navega solo cambiando el hash, la pantalla de error persiste hasta recargar | F-06 | Reiniciar el ErrorBoundary al cambiar de ruta | S |

## UX — Observaciones heurísticas
- **Positivo:** identidad visual consistente; recomendaciones y Carta de Honestidad claras; el formulario funciona bien en móvil; hay indicador de progreso por sección.
- **Negativo:** densidad de texto muy alta en las pantallas de administración; menú lateral con 18 entradas y nomenclatura mezclada (mayúsculas, códigos, insignias); estados "Guardado Offline" que transmiten una falsa seguridad; confirmaciones de éxito que no reflejan la respuesta real del servidor.

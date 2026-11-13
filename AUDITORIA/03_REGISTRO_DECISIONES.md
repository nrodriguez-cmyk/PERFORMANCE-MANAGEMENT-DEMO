# Registro de Ambigüedades y Decisiones de Alcance

**Fuentes cruzadas**
- **[A]** `requeriment.md` — documento de alcance oficial (confirmado por la usuaria, 2026-11-13).
- **[B]** Documentación técnica de Antigravity v1.0 (2026-11-13) — fuente secundaria, describe lo construido.
- **[C]** Código fuente (verificado directamente).

Regla: si no hay decisión registrada, **[A] prevalece**. [B] solo se usa como descripción de la implementación y ya contiene afirmaciones falsas respecto a [C] (ver §2).

---

## 1. Ambigüedades / contradicciones a resolver

| ID | Tema | [A] Alcance | [B]/[C] Implementado | Impacto | Recomendación | Decisión |
|---|---|---|---|---|---|---|
| AMB-01 | Fórmula de nota final | 60 % B1 + 40 % B2 (2 bloques) | 60 % B1 + 30 % B2 + 10 % B3 Potencial (`realEvaluationMetrics.ts:534`), comentado como "Fórmula modificada por Gobernanza Canguro" | Cambia todas las notas | Confirmar si la modificación fue aprobada; si no, volver a 60/40 | ver §4 |
| AMB-02 | Tramos de mérito | Escala 1–5: <3,00 / 3,00–3,74 / 3,75–4,24 / 4,25–4,74 / ≥4,75; % 10/25/35/20/10; media 3,90, σ 0,55; nombres Incompleto→Sobresaliente | Base 100: ≤54 / 55–65 / 66–79 / 80–100 / 101–125; % 5/20/50/20/5; nombres Insatisfactorio→Excepcional (`realEvaluationMetrics.ts:552`) | **T5 es inalcanzable** (la nota máxima es 5,00 = 100 %), por lo que nadie entra al Plan de Sucesión | Usar la tabla de [A] | ver §4 |
| AMB-03 | Ponderación por fuente | Tabla 6.4 (p. ej. 360° con pares: Sup 45 / Sub 25 / Pares 15 / Auto 15), aplicada a cada bloque | B1 = Sup 60 / Pares 20 / Sub 20 **sin autoevaluación**; B2 = **solo autoevaluación** (`realEvaluationMetrics.ts:464-492`) | Las competencias se califican únicamente por el propio evaluado | Aplicar la tabla 6.4 a ambos bloques | ver §4 |
| AMB-04 | Ejes del Nine-Box | Desempeño = B1, Potencial = B2 | Desempeño = nota final, Potencial = Bloque 3 | Clasificación de talento distinta | Depende de AMB-01 | ver §4 |
| AMB-05 | Fuentes en 180° | Auto + Supervisor + **Pares** | [B] §7.2: Auto + Supervisor únicamente | Faltaría una fuente | Mantener [A] | ver §4 |
| AMB-06 | Definición de "pares" | "Colegas de nivel equivalente" | Evaluación: según organigrama; comparativo de la campana: mismo título de cargo en toda la empresa | Selección de evaluadores y comparativo | Pares = mismo nivel y misma unidad/dirección según organigrama | ver §4 |
| AMB-07 | Contenido del Bloque 1 | 10 reactivos genéricos en 3 sub-bloques, escala de frecuencia 1–5 | Formularios KPI distintos por Dirección (`*Section1Form.tsx`), sub-bloques kpi/cond/strat 50/35/15 | El instrumento difiere del normado | Confirmar si los KPI por Dirección reemplazan oficialmente los 10 reactivos | ver §4 |
| AMB-08 | Población | Censo ~190 colaboradores, 4 razones sociales | 2.746 en la fuente / 2.543 activos (203 sin explicar) | Alcance del censo y de las pruebas | Confirmar el censo vigente | ver §4 |
| AMB-09 | Modelo de acceso | Un operador (Administrador Maestro); los evaluadores entran solo por enlace personal | 5 roles con login por cédula (admin, gestor, director, supervisor, colaborador) | Define todo el modelo de seguridad | Ver preguntas en §3 | ver §4 |
| AMB-10 | Seguridad del enlace | "Cualquier persona que reciba el enlace debe poder acceder" | Enlace con datos en la URL (nombre, cédula, cargo); token derivable/predecible (`Evaluate.tsx:111`) | Cualquiera puede fabricar un enlace y suplantar a un evaluador | Enlace con token aleatorio de un solo uso, sin PII en la URL | ver §4 |
| AMB-11 | Visibilidad de resultados para el colaborador | Solo el Administrador consulta el perfil por cédula | El colaborador ve su campana, su tramo y el comparativo con pares | Exposición de política salarial | Confirmar | ver §4 |
| AMB-12 | Puntaje de promoción | Dictamen sobre 0–100, pero no define cómo se calcula (peso de Big Five, situacionales, entrevista) | Big Five + RIASEC + competencias + IA (`/api/evaluate-promotion`) | No se puede verificar el dictamen | Definir la fórmula | ver §4 |
| AMB-13 | Nivel esperado por cargo (brecha) | Brecha = esperado − demostrado; la tabla 4.3 da una "referencia de cargos" por nivel, sin incluir a Operador Integral | Por verificar | Cálculo de brechas del PDI | Usar tabla 4.3 y Operador Integral = D | ver §4 |
| AMB-14 | Sistema de PDI externo | Fuera de alcance (no operativo), pero RN-21 prohíbe calibrar manualmente | Por verificar | Qué se muestra en "Cumplimiento Global" y "Metas SMART" | Mostrar "Pendiente de integración", sin valores inventados | ver §4 |
| AMB-15 | Envío de correos | Habilitar la cuenta emisora está fuera de alcance, pero los correos deben llegar a Gmail | Nodemailer configurado | Qué se prueba | Probar con una cuenta SMTP de prueba; validar redacción oficial | ver §4 |
| AMB-16 | Uso de IA (Gemini) | No mencionado; RN-01 exige competencias literales del modelo | `/api/generate-situational` genera casos situacionales con IA | Posible incumplimiento de RN-01 y envío de datos a terceros | Restringir la IA a sugerencias auditables, nunca a reactivos oficiales | ver §4 |
| AMB-17 | Persistencia | Proceso multi-evaluador centralizado | "Funciona 100 % offline" con localStorage; las respuestas de cada evaluador quedan en su propio navegador | Sin BD central, el Administrador no recibe las respuestas | BD central obligatoria; localStorage solo como borrador | ver §4 |
| AMB-18 | Dirección General | "No existe en el organigrama" | El usuario admin tiene `department: 'Presidencia / Dirección General'` | Menor | Corregir | ver §4 |

---

## 2. Afirmaciones de [B] que el código contradice

| Afirmación en [B] | Realidad en [C] |
|---|---|
| Las contraseñas se guardan como hash | Se guardan en **texto plano** en `localStorage` (`authService.ts:192`) |
| Existe `POST /api/auth/reset-password` | No existe en `server.ts` |
| Existe `POST /api/db/save-evaluation` | La ruta real es `POST /api/db/evaluations` |
| El Administrador Maestro solo entra con su cédula | También entran **`admin`/`admin`**, `natalia`/`natalia`, `administrador`/`administrador` (`authService.ts:225-257`), y se detecta como admin a cualquiera cuyo nombre contenga "natalia" + "rodriguez" |
| El backend autentica | `authenticateUser` acepta si **usuario = contraseña** (`db.ts:651`) e ignora `password_hash` |
| Matriz de permisos por rol | Solo se aplica en el menú del cliente; los endpoints `/api/*` no verifican identidad ni rol |

---

## 3. Preguntas abiertas (modelo de acceso, AMB-09)

1. ¿Los colaboradores, supervisores y directores **inician sesión** en la plataforma, o solo usan su enlace personal?
2. ¿Existe el rol **gestor** distinto al Administrador Maestro? ¿Quién lo tendría?
3. ¿Un **director** debe ver los resultados de toda su Dirección?
4. ¿La contraseña inicial puede seguir siendo la cédula? (No se recomienda: la cédula es dato conocido.)

---

## 4. Decisiones registradas (2026-11-13, Natalia Rodríguez)

Decisión general: **se aceptan las recomendaciones de la tabla §1**, con estos ajustes y precisiones:

| ID | Decisión |
|---|---|
| AMB-01 | **Nota final = 60 % B1 + 40 % B2** (alcance). El Bloque 3 de Potencial sale de la nota final. |
| AMB-02 | Tramos según tabla 6.6 del alcance (escala 1–5, ≥ 4,75 = Tramo 5). |
| AMB-03 | Ponderación por fuente según tabla 6.4, aplicada a B1 y B2. |
| AMB-04 | Nine-Box: Desempeño = B1, Potencial = B2 (consecuencia de AMB-01). |
| AMB-05 | 180° = Auto + Supervisor + Pares. |
| AMB-06 | Pares = mismo nivel y misma unidad/dirección según organigrama. |
| AMB-07 | **Bloque 1 = formularios de KPI por Dirección** (reemplazan oficialmente los 10 reactivos genéricos). Se debe actualizar el alcance §6.2. |
| AMB-08 | **Pendiente**: censo vigente por confirmar. No bloquea la auditoría. |
| AMB-09 | **Solo el Administrador inicia sesión** (y gestor, si se define). Los evaluadores acceden únicamente por enlace personal. Se eliminan los logins de director, supervisor y colaborador. |
| AMB-10 | Enlaces con token aleatorio de un solo uso, sin PII en la URL. |
| AMB-11 | **El colaborador no ve sus resultados**; solo Talento Humano. |
| AMB-12 | **Pendiente**: fórmula del puntaje de promoción por definir. En la auditoría se marca "No verificable". |
| AMB-13 | Nivel esperado según tabla 4.3; Operador Integral = D. |
| AMB-14 | Mostrar "Pendiente de integración" sin valores inventados. |
| AMB-15 | Probar con cuenta SMTP de prueba; validar redacción oficial. |
| AMB-16 | La IA solo puede sugerir; nunca genera reactivos oficiales sin auditoría. |
| AMB-17 | Base de datos central obligatoria; localStorage solo para borradores. |
| AMB-18 | Corregir "Dirección General". |

**Matriz RBAC objetivo resultante**: `admin` (acceso total), `gestor` (por confirmar), `evaluador vía enlace` (solo su instrumento, una vez). Ningún otro rol con sesión.

---

## 5. Decisiones del informe ejecutivo (2026-11-13, Natalia Rodríguez)

| ID | Decisión |
|---|---|
| D-01 | **La plataforma nunca se publicó: solo corrió en local.** No hace falta rotar las claves de BD, SMTP ni Gemini. Igual se saca el censo del código (W1-4) y se limpia el historial de git (W0-5) antes de cualquier publicación. |
| D-02 | **Se agrega el rol `director`, uno por Dirección.** No hay un rol "gestor" aparte. Ver el detalle abajo. |

### D-02 — Rol Director (modifica AMB-09 y precisa AMB-11)

**Roles con sesión:** el Administrador Maestro y los 8 Directores:
- Talento Humano
- Administración y Finanzas
- Control Interno
- Tecnología de la Información
- Compras
- Comercial
- Operaciones
- Transporte y Logística

El resto de los evaluadores sigue entrando solo por enlace personal.

**Menú del Director:**
1. **Evaluaciones.** Solo los instrumentos que le tocan: *Evaluación a Subordinados* y *Autoevaluación*.
2. **Resultados de la Dirección.** Un dashboard ejecutivo con:
   - la campana de Gauss, tomando como población a los colaboradores de su Dirección;
   - los promedios generales de la Dirección;
   - un buscador por nombre para ver los resultados individuales de un colaborador.

**Regla de seguridad:** el alcance de datos de cada Director es su Dirección. El servidor filtra por la Dirección del Director en sesión. No se filtra en el cliente, y un Director no puede consultar a personas de otra Dirección aunque conozca su nombre o su cédula.

**Matriz RBAC objetivo (reemplaza la del §4):**

| Rol | Acceso |
|---|---|
| `admin` | Total: configuración, enlaces, correos, resultados de toda la empresa. |
| `director` | Solo su Dirección. Hace su autoevaluación y la evaluación de sus subordinados dentro de su sesión, y ve los resultados de su Dirección en solo lectura. |
| Evaluador vía enlace | Solo su instrumento, una vez. |

**Efecto sobre decisiones anteriores:**
- **AMB-09:** queda modificada. Ya no inicia sesión solo el Administrador: también los Directores.
- **AMB-11:** se mantiene. El colaborador no ve sus resultados; solo los ven Talento Humano y su Director.

### Preguntas derivadas de D-02 (pendientes)

| ID | Pregunta | Recomendación |
|---|---|---|
| D-02a | ¿Quién es "subordinado" de un Director: solo sus reportes directos (Gerentes/Coordinadores) o toda la Dirección? | Solo sus reportes directos, según el organigrama (RN-06). Los niveles inferiores los evalúa su jefe inmediato. |
| D-02b | La autoevaluación y la evaluación a subordinados del Director, ¿se hacen dentro de su sesión, se envían también por enlace, o funcionan de las dos formas? | Dentro de la sesión, sin enlace. Aplica la misma regla de un solo envío y bloqueo (RN-12). |
| D-02c | ¿Quién evalúa al Director? El alcance da a los Directores modalidad 360° (con supervisor, pares y subordinados), pero la Dirección General no existe en el organigrama (AMB-18). | Supervisor = Presidencia/Junta, por enlace. Pares = los otros 7 Directores. |
| D-02d | ¿El Director ve la nota de un colaborador abierta por fuente (cuánto le dio cada par o subordinado)? | No. Solo la nota consolidada y los bloques, para proteger el anonimato de los evaluadores. |
| D-02e | ¿El Director de Talento Humano ve también los resultados de toda la empresa, o solo los de su Dirección? | Solo su Dirección. La vista global queda para el Administrador. |
| D-02f | ¿Cómo entra el Director (usuario y contraseña inicial)? La cédula no sirve como contraseña inicial, porque es un dato conocido. | El Administrador crea la cuenta. El sistema envía al Director un enlace de activación de un solo uso para que defina su contraseña. |

---

## 6. Restricción de conservación (2026-11-13, Natalia Rodríguez) — responde D-10

Esta regla obliga a todas las olas de remediación:

1. **Instrumentos intactos.** No se modifica la redacción de ningún reactivo, caso situacional, opción de respuesta ni KPI por Dirección. Los cambios a los instrumentos son técnicos: guardado, tokens y validación. Una excepción solo vale si la usuaria la aprueba explícitamente; incluye W4-7 (textos por rol evaluador), que queda en propuesta.
2. **Visualizaciones conservadas.** Las campanas de Gauss, la Matriz 9-Box y los dashboards se mantienen tal como están. Las correcciones de cálculo de la Ola 3 cambian los números que reciben, pero no su diseño.
3. **Menú del Administrador**: estos módulos se mantienen visibles. D-10 queda resuelta: se conservan.
   - 1. INICIO
     - Dashboard Desarrollo y Desempeño
       - Promedio por Cargo (8 niveles)
       - Detalle Operativo y Mapa de Calor
       - Impacto Nivel Académico
   - 2. PERFIL DEL COLABORADOR
     - Resultados de Evaluación de Desempeño
       - Desempeño y Competencias
       - Potencial y Liderazgo
       - Matriz 9-Box
       - Campana de Gauss y Distribución
     - Resultados de Promoción
       - Análisis de Brechas
       - Matriz 9-Box
       - Predisposición Conductual y Adecuación al nuevo Cargo
       - Vista Previa e Impresión PDF
     - Plan de Desarrollo Individual (PDI) 70-20-10
   - MATRIZ DE SUCESIÓN
   - AUDITORÍA EN VIVO
   - CONFIG. DESEMPEÑO (por Dirección y 360°)
   - CONCURSO PROMOCIÓN (Subprocesos 1 y 2, IA)
   - RECUPERACIÓN CLAVE (Maestro)

**Efecto en el plan:**
- W5-3 deja de retirar módulos: solo se limpian componentes sin uso.
- W4-6 sigue retirando los datos de demostración, pero no los tableros: un tablero sin datos muestra "Sin datos".

---

## 7. Respuestas D-02a–f (2026-11-13, Natalia Rodríguez)

| ID | Decisión |
|---|---|
| D-02a | El Director evalúa **solo a sus reportes directos**, según el organigrama. A los niveles inferiores los evalúa su jefe inmediato, por enlace. |
| D-02b | El Director hace su autoevaluación y la evaluación de sus subordinados **dentro de su sesión**, con un único envío y bloqueo (RN-12). |
| D-02c | El 360° del Director: **Supervisor = Presidencia/Junta** (por enlace) · **Pares = los otros 7 Directores** · Subordinados = sus reportes directos · Autoevaluación desde su sesión. |
| D-02d | En "Resultados de la Dirección", el Director ve nota final, B1, B2, tramo, campana y 9-Box, **sin el desglose por fuente**, para proteger el anonimato. |
| D-02e | **El Director de Talento Humano ve toda la empresa**, en solo lectura y sin configuración ni envío de enlaces. Los demás Directores ven solo su Dirección. |
| D-02f | La cuenta del Director la activa un enlace de un solo uso que genera el Administrador. Es la recomendación, ya incorporada en W1-1. |

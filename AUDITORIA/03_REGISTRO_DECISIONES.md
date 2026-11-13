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

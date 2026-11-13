# Informe Ejecutivo de Auditoría
## Gestor de Evaluación del Desempeño 360°/180° — Universo Canguro
**Fecha:** 2026-11-13 · **Alcance de referencia:** `requeriment.md` + decisiones de `03_REGISTRO_DECISIONES.md §4`

---

## 1. Dictamen general

**La plataforma no está apta para un ciclo de evaluación real.** Funciona como una demostración visual de un solo equipo: las respuestas de los evaluadores no llegan de forma confiable al administrador, los cálculos no siguen la norma, cualquier persona puede tomar el control como administrador, y varias pantallas muestran resultados que no salen de evaluaciones reales.

La base visual y el contenido normativo (textos, competencias, formularios por Dirección) son aprovechables. La corrección es **una reconstrucción dirigida del núcleo** (acceso, persistencia, cálculo), no un reemplazo total.

| Vertical | Hallazgos (C / A / M / B) | Calificación |
|---|---|---|
| Técnica — Seguridad (`01_AUDITORIA_TECNICA_SEGURIDAD.md`) | 28 (10 / 6 / 10 / 2) | 🔴 Crítico |
| Técnica — Arquitectura (`01_AUDITORIA_TECNICA_ARQUITECTURA.md`) | 27 (3 / 9 / 12 / 3) | 🔴 Crítico |
| Funcional y UX (`02_AUDITORIA_FUNCIONAL_UX.md`) | 18 (5 / 6 / 5 / 2) | 🔴 Crítico |
| Lógica de negocio (`03_AUDITORIA_NEGOCIO.md`) | 41 (8 / 14 / 15 / 4) | 🔴 Crítico; **cumplimiento 12,7 %** (32,9 % si "Parcial" cuenta como medio) |

Hay hallazgos que se repiten entre verticales (el mismo defecto visto desde seguridad, arquitectura y pruebas); en el plan se agrupan por causa raíz.

---

## 2. Los 10 riesgos principales

| # | Riesgo | Evidencia | IDs |
|---|---|---|---|
| 1 | **Cualquiera entra como administrador**: credenciales genéricas en el código, alias de la cuenta maestra y rol editable en el navegador (probado en vivo: un Asesor pasa a administrador total) | `authService.ts:225-298, 533` | SEC-001/002, FUN-001/002 |
| 2 | **Las respuestas no llegan al administrador**: la BD solo se escribe y nunca se lee; los tableros leen el navegador local. La UI dice "registrado en el sistema" aunque el servidor responda error (probado) | `Evaluate.tsx`, `db.ts`, `fetchEvaluationsFromDb` sin uso | ARQ-001/004, NEG-011, FUN-003 |
| 3 | **Enlaces falsificables y reutilizables**: token predecible, cédula en la URL, "uso único" solo local (probado: enlace inventado aceptado y reenviado) | `Evaluate.tsx:109-170` | SEC-008/009, ARQ-002, FUN-004 |
| 4 | **Evaluaciones sobrescribibles**: el servidor pisa evaluaciones bloqueadas, y todos los pares comparten una fila (solo cuenta el último) | `db.ts:486-505` | SEC-005, ARQ-003, NEG-012 |
| 5 | **La nota final está mal calculada**: fórmula 60/30/10, B2 solo con autoevaluación, sin tabla 6.4. Ej.: 360° con pares da 3,79 (T3) en vez de 3,20 (T2) | `realEvaluationMetrics.ts:443-534`; oráculo 77/147 | NEG-001/002, ARQ-005/006/007 |
| 6 | **Tramo 5 inalcanzable** y 8 versiones distintas de los tramos; la sucesión nunca se habilita por el cálculo real | `realEvaluationMetrics.ts:549`, `types.ts:120` | NEG-003 |
| 7 | **Resultados inventados**: dictamen de promoción APROBADO 93,6/94,6 % con aval del comité ya puesto, 5 sucesores fijos con 4,82–4,92, Potencial 3,50 para personas sin evaluar, datos de demostración en tableros | `promotionDefaults.ts`, `canguroUniverso.ts:1005-1085`, `server.ts:380` | NEG-013/016, FUN-007/008 |
| 8 | **Datos personales expuestos**: ~2.300 cédulas con nombre y cargo en el JavaScript público, descargable sin iniciar sesión; 12 endpoints anónimos con IDOR; código fuente servido (`.map`) | `dist/assets`, `/api/*` | SEC-003/004/010 |
| 9 | **El Bloque 1 de Comercial y de Administración y Finanzas se cae** (error de código); Comercial es una de las direcciones más grandes | `*Section1Form.tsx:577` | FUN-005, ARQ-010 |
| 10 | **No existe el flujo normado de configuración**: ni el asistente de 3 subprocesos, ni el Centro de Enlaces, ni "Enviar Correos Oficiales"; además, el correo es un relay abierto con inyección de HTML | `EvaluationProfileConfig.tsx` (sin navegación), `server.ts:147-183` | NEG-010, FUN-009, SEC (correo) |

---

## 3. Aspectos positivos
- Consultas SQL parametrizadas, sin inyección SQL.
- Gemini solo recibe descriptores de cargo, no datos personales.
- Textos oficiales (recomendaciones, Carta de Honestidad) fieles al alcance; sin respuestas pre-marcadas; formulario del evaluador usable en móvil.
- Contenido rico y reutilizable: diccionario de competencias, formularios KPI por Dirección, organigramas.

---

## 4. Decisiones pendientes de la usuaria

Bloquean partes del plan (ver `05_PLAN_DE_TRABAJO.md`, columna "Bloqueado por"):

| ID | Pregunta | Bloquea |
|---|---|---|
| D-01 | ✅ **Resuelta:** nunca se publicó, solo corrió en local. No hace falta rotar claves | — |
| D-02 | ✅ **Resuelta:** rol `director`, uno por cada una de las 8 Direcciones, con los módulos Evaluaciones y Resultados de la Dirección. Quedan las preguntas derivadas D-02a–f | W1-7 |
| D-03 | ¿Cuántos pares y subordinados evalúan a cada persona y cómo se promedian dentro de la fuente? | Ola 2 y 3 |
| D-04 | Cortes Bajo/Medio/Alto del Nine-Box (§6.7 no los define) | Ola 3 |
| D-05 | ¿Compras va en "Blindaje y Control" (alcance) o en "Motores de Venta" (código)? | Ola 3 |
| D-06 | Las 4 opciones del Bloque 2: ¿niveles A–D literales del modelo? Familia de 38 cargos sin clasificar; Encargado de Tienda ¿180° o 360°? | Ola 3 |
| D-07 | ¿El Bloque 3 (Potencial) se elimina del instrumento o queda informativo? | Ola 3 y 4 |
| D-08 | Fórmula del puntaje de promoción (AMB-12) y contenido de la Fase 2 | Ola 4 (promoción) |
| D-09 | Censo vigente (AMB-08) | Ola 2 (carga de censo) |
| D-10 | ¿Se mantienen los 16 módulos fuera de alcance (People Analytics, Dossier psicométrico, etc.)? | Ola 5 |

Las preguntas AMB-19 a AMB-30 con detalle están en `03_AUDITORIA_NEGOCIO.md §6`.

# Metodología de Auditoría — Gestor de Evaluación del Desempeño 360°/180°

## 0. Contexto observado (reconocimiento inicial)

| Elemento | Hallazgo preliminar |
|---|---|
| Frontend | React 19 + Vite 6 + Tailwind 4, Recharts, jsPDF/html2canvas, xlsx |
| Backend | Express 4 en un único `server.ts` (~27 KB) con Vite en middleware mode |
| Datos | PostgreSQL/Supabase (`pg`, `@supabase/supabase-js`), `database_schema.sql`, más datos estáticos en `src/data/*` (censo CSV embebido de ~2.400 líneas) |
| IA / correo | `@google/genai`, `nodemailer`, `googleapis` |
| Tamaño | ~49.000 líneas TS/TSX; componentes de hasta 3.300 líneas |
| Documentación | `requeriment.md`, `DOCUMENTACION_PLATAFORMA.md`, `README.md` |
| Calidad | Sin tests, sin git, sin linter real (solo `tsc --noEmit`); scripts sueltos (`fix_*.cjs`, `scratch/`, `temp-test-org.js`) |

**Señales de riesgo crítico ya visibles (a confirmar en la auditoría):**
1. Autenticación resuelta en el cliente: credenciales de administrador hardcodeadas en `src/services/authService.ts`, contraseñas personalizadas guardadas **en texto plano en `localStorage`**, rol asignado en el navegador.
2. Endpoints `/api/db/*`, `/api/send-email`, `/api/db/init` sin middleware de autenticación ni autorización (cualquiera con la URL puede leer evaluaciones o reinicializar la BD).
3. Sin `helmet`, CORS explícito, rate limiting ni gestión de sesión en servidor.
4. El cliente llama a `/api/auth/reset-password`, que no existe en el servidor.
5. Datos personales del censo (cédulas, cargos) embebidos en el bundle del frontend.

---

## 1. Principios

- **Evidencia sobre opinión**: cada hallazgo cita archivo:línea, request/response o captura.
- **Severidad estandarizada** (basada en CVSS simplificado + impacto de negocio):
  - **Crítica**: compromete datos personales, integridad de resultados o permite escalar privilegios.
  - **Alta**: rompe un flujo de negocio o un requisito explícito del alcance.
  - **Media**: degrada mantenibilidad, UX o confiabilidad.
  - **Baja**: estilo, mejora menor.
- **Trazabilidad**: todo hallazgo de negocio se enlaza a un ID de requisito (RN-xx / RF-xx) del documento de alcance.
- **No destructivo**: las pruebas se ejecutan contra una BD local/de prueba, nunca contra producción.

---

## 2. Vertical 1 — Técnica (Ingeniería de Software)

| Bloque | Qué se evalúa | Técnica |
|---|---|---|
| 1.1 Stack y arquitectura | Adecuación del stack, separación cliente/servidor, acoplamiento, tamaño de módulos, datos estáticos vs. BD | Lectura de código, mapa de dependencias, métricas (LOC, complejidad) |
| 1.2 Dependencias | Vulnerabilidades conocidas (`xlsx 0.18.5`, `pdfjs-dist 3.11`), paquetes no usados, licencias | `npm audit`, `npm ls`, búsqueda de imports |
| 1.3 Seguridad (OWASP Top 10 / ASVS L2) | Inyección SQL, XSS, secretos, CORS, cabeceras, rate limit, exposición de PII, validación de entrada, uso de IA (prompt injection) | Revisión manual + grep dirigido + pruebas con `curl` |
| 1.4 Autenticación | Almacenamiento de contraseñas (hash), sesiones/JWT, recuperación de contraseña, expiración, bloqueo por intentos | Revisión de `authService.ts`, `src/server/db.ts`, `server.ts` |
| 1.5 Autorización / Roles (RBAC) | Matriz rol × acción (admin, gestor, director, supervisor, colaborador); enforcement en servidor; IDOR en `/:collaboratorId` | Construir matriz esperada (README §3) vs. real; pruebas de escalada |
| 1.6 Datos | Esquema SQL, integridad referencial, índices, inmutabilidad de evaluaciones enviadas, auditoría | Revisión de `database_schema.sql` y queries |
| 1.7 Buenas prácticas | Tipado (`any`), manejo de errores, duplicación, componentes gigantes, estado global, build, variables de entorno, ausencia de tests y control de versiones | Revisión + `tsc --noEmit` |

**Salida**: `01_AUDITORIA_TECNICA.md` + `01_MATRIZ_RBAC.xlsx/md`.

---

## 3. Vertical 2 — Funcional y UX

| Bloque | Qué se evalúa | Técnica |
|---|---|---|
| 2.1 Inventario de módulos | Lista de pantallas/flujos por rol | Recorrido de rutas en `App.tsx` |
| 2.2 Pruebas funcionales | Casos de prueba por módulo (camino feliz, bordes, errores) | Ejecución en navegador (app local) con usuarios de prueba por rol |
| 2.3 Pruebas E2E clave | Configurar evaluación → enlaces → responder 180°/360° → consolidar → Nine-Box → PDI → promoción → sucesión | Navegador automatizado + capturas |
| 2.4 UX / Usabilidad | Heurísticas de Nielsen, consistencia con el design system, mensajes de error, carga, responsive | Evaluación heurística por pantalla |
| 2.5 Accesibilidad | WCAG 2.1 AA básico: contraste, foco, etiquetas | Árbol de accesibilidad + inspección |
| 2.6 Rendimiento | Tamaño del bundle, tiempos de carga, renders pesados | Build + network |

**Salida**: `02_AUDITORIA_FUNCIONAL_UX.md` + `02_CASOS_DE_PRUEBA.md` (ID, precondición, pasos, esperado, obtenido, estado, evidencia).

---

## 4. Vertical 3 — Lógica de Negocio

**Paso previo obligatorio**: validar el documento de alcance con usted.

| Bloque | Qué se evalúa | Técnica |
|---|---|---|
| 3.1 Normalización del alcance | Extraer requisitos atómicos (RF/RN) con ID | Lectura del documento de alcance |
| 3.2 Detección de ambigüedades | Contradicciones entre `requeriment.md`, `DOCUMENTACION_PLATAFORMA.md`, `README.md` y código | Cruce documental → **se le consultan antes de evaluar** |
| 3.3 Matriz de trazabilidad | Requisito → archivo/función → estado (Cumple / Parcial / No cumple / No verificable) | Revisión de código + prueba |
| 3.4 Verificación de cálculos | Ponderación por fuente, fórmulas de consolidación, escala vigesimal, tramos de Gauss, Nine-Box, asignación de competencias por nivel/dirección | Pruebas con datos sintéticos y cálculo manual de referencia (oráculo) |
| 3.5 Procedimientos A–E | Desempeño, convocatoria, PDI 70-20-10, promoción, sucesión | Ejecución del flujo + revisión de reglas |
| 3.6 Reglas consolidadas (§9) | Cada regla verificada individualmente | Casos de prueba dirigidos |

**Salida**: `03_AUDITORIA_NEGOCIO.md` + `03_MATRIZ_TRAZABILIDAD.md` + `03_REGISTRO_DECISIONES.md` (respuestas a ambigüedades).

---

## 5. Documentación de salida

```
AUDITORIA/
├── 00_METODOLOGIA.md              (este documento)
├── 01_AUDITORIA_TECNICA.md
├── 01_MATRIZ_RBAC.md
├── 02_AUDITORIA_FUNCIONAL_UX.md
├── 02_CASOS_DE_PRUEBA.md
├── 03_AUDITORIA_NEGOCIO.md
├── 03_MATRIZ_TRAZABILIDAD.md
├── 03_REGISTRO_DECISIONES.md
├── 04_INFORME_EJECUTIVO.md        (resumen, score por vertical, top 10 riesgos)
└── 05_PLAN_DE_TRABAJO.md          (backlog priorizado y asignación a sub-agentes)
```

**Formato estándar de hallazgo**

| Campo | Ejemplo |
|---|---|
| ID | SEC-001 |
| Vertical / Categoría | Técnica / Autenticación |
| Severidad | Crítica |
| Evidencia | `src/services/authService.ts:225` |
| Descripción | Credenciales de admin hardcodeadas en el bundle |
| Impacto | Cualquier usuario obtiene acceso total |
| Corrección propuesta | Autenticación en servidor con hash (argon2/bcrypt) + sesión httpOnly |
| Esfuerzo | M (S ≤ 2h, M ≤ 1d, L ≤ 3d, XL > 3d) |
| Dependencias | SEC-00x |
| Requisito relacionado | RN-xx (si aplica) |

---

## 6. Fases y ejecución con sub-agentes

### Fase 0 — Preparación (yo, sesión principal)
- Inicializar **git** y commit base (línea de referencia para medir correcciones).
- Validar el alcance con usted y resolver ambigüedades.
- Levantar entorno local con BD de prueba y usuarios semilla por rol.

### Fase 1 — Diagnóstico (en paralelo, solo lectura)

| Sub-agente | Modelo | Justificación |
|---|---|---|
| A. Seguridad, autenticación y RBAC | **Opus** | Razonamiento adversarial, alto impacto |
| B. Arquitectura, calidad de código y dependencias | **Sonnet** | Revisión amplia, menos crítica |
| C. Lógica de negocio y cálculos (vs. alcance validado) | **Opus** | Fórmulas, reglas y trazabilidad complejas |
| D. Funcional/UX en navegador (casos de prueba) | **Sonnet** | Ejecución metódica de casos |
| E. Inventario de rutas, componentes y datos estáticos | **Haiku** | Extracción mecánica de apoyo |

Luego, un agente **Opus verificador** revisa adversarialmente los hallazgos Críticos/Altos para descartar falsos positivos.

### Fase 2 — Consolidación (yo)
Informe ejecutivo, deduplicación, priorización y plan de trabajo.

### Fase 3 — Remediación (sub-agentes por oleadas, con worktrees aislados)

| Oleada | Contenido típico | Modelo |
|---|---|---|
| 1. Seguridad crítica | Auth en servidor, hash de contraseñas, middleware RBAC, proteger `/api/db/*`, retirar PII del bundle | Opus |
| 2. Lógica de negocio | Corrección de fórmulas, reglas y flujos incumplidos + tests unitarios de cálculo | Opus |
| 3. Funcional/UX | Bugs de flujo, validaciones, mensajes, accesibilidad | Sonnet |
| 4. Calidad/deuda técnica | Partir componentes gigantes, tipado, limpieza de scripts, tests, CI | Sonnet / Haiku (tareas mecánicas) |

### Fase 4 — Verificación
Re-ejecución de casos de prueba y de la matriz de trazabilidad; informe de cierre con hallazgos resueltos/pendientes.

---

## 7. Criterios de aceptación de la auditoría
- 100 % de requisitos del alcance con estado asignado en la matriz.
- 100 % de endpoints evaluados contra la matriz RBAC.
- Cada módulo con al menos un caso de prueba ejecutado y evidencia.
- Todo hallazgo Crítico/Alto verificado por segundo agente.

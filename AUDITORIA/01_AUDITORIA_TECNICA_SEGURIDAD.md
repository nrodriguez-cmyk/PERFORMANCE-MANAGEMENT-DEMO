# 01 — Auditoría Técnica de Seguridad (Autenticación, RBAC, Enlaces, Inyección, Secretos, Dependencias, PII)

**Fecha:** 2026-11-13 · **Alcance:** código fuente en la línea base git `7a3e056` + `dist/` + `npm audit`.
**Método:** revisión estática manual, grep dirigido sobre `dist/assets` (sin leer el bundle completo), `npm audit --json`.
**No realizado (por instrucción):** no se ejecutó el servidor, no se llamó a `/api/*`, no se conectó a BD ni a servicios externos, no se leyó `.env.local`.
**Redacción:** la cédula del Administrador Maestro aparece en el código; en este informe se escribe como `<CI-ADMIN>`. No se reproducen otras cédulas ni nombres del censo.
**Referencia de modelo objetivo:** `03_REGISTRO_DECISIONES.md` §4 — solo Administrador (y quizá gestor) inician sesión; evaluadores por enlace con token aleatorio de un solo uso, sin PII en la URL; el colaborador **no** ve resultados (AMB-09, AMB-10, AMB-11, AMB-17).

---

## 1. Resumen ejecutivo

1. **No existe autenticación real**: la identidad y el rol viven en `localStorage` y se deciden en el navegador; hay credenciales `admin/admin` y `gestor/gestor` en el bundle, y cualquier cédula sirve como usuario y contraseña. Por eso, cualquiera puede entrar como Administrador.
2. **El backend no tiene ningún control de acceso**: los 12 endpoints `/api/*` son anónimos. Cualquiera puede leer las evaluaciones y los PDI de cualquier empleado (IDOR por `emp-<cédula>`), sobrescribir evaluaciones ya “bloqueadas”, alterar el censo y **crear un administrador** vía `sync-census`.
3. **Los enlaces de evaluación se pueden fabricar**: el token es `canguro_<cédula>_<rol>`, nadie lo valida, la URL lleva PII y el nombre del evaluador lo escribe quien abre el formulario. El “uso único” vive solo en `localStorage`, así que un evaluador puede volver a enviar su evaluación.
4. **El censo completo (unas 2.400 personas: cédula, nombre, razón social, cargo, fecha de ingreso, ubicación) va dentro del JavaScript público** que se descarga antes del login, y también está versionado en git.
5. **Recuento**: 28 hallazgos (10 críticos, 6 altos, 10 medios, 2 bajos). Lo implementado está lejos del modelo objetivo: hay que rehacer la autenticación, la autorización y los enlaces en el servidor antes de cualquier uso con datos reales.

---

## 2. Tabla resumen de hallazgos (ordenada por severidad)

| ID | Sev. | Categoría | Título | Evidencia principal | Esf. |
|---|---|---|---|---|---|
| SEC-001 | Crítica | Autenticación | Credenciales admin/gestor hardcodeadas y toma de la cuenta del Administrador Maestro | `src/services/authService.ts:225-312` | M |
| SEC-002 | Crítica | Sesión / Escalada | Sesión y rol solo en `localStorage`, falsificables; admin detectado por nombre/cargo | `authService.ts:455-465, 510-554, 369-403` | L |
| SEC-003 | Crítica | Autorización | Todos los endpoints `/api/*` sin autenticación ni autorización | `server.ts:147-497` | L |
| SEC-004 | Crítica | Autorización (IDOR) | Lectura de evaluaciones y PDI de cualquier colaborador | `server.ts:472-497`, `src/server/db.ts:536-575` | M |
| SEC-005 | Crítica | Integridad | Sobrescritura de evaluaciones/PDI (incluso “bloqueadas”); el servidor confía en el cliente | `server.ts:463-488`, `db.ts:486-521, 595-616`, `databaseService.ts:138` | L |
| SEC-006 | Crítica | Escalada (servidor) | `sync-census` anónimo permite crear un admin y reescribir el censo | `server.ts:437-448`, `db.ts:322-394, 684-700` | M |
| SEC-007 | Crítica | Autenticación | Usuario = contraseña = cédula (cliente y servidor); contraseñas en texto plano | `db.ts:645-654, 393`; `authService.ts:180-195, 321-342` | M |
| SEC-008 | Crítica | Enlaces | Enlaces de evaluación fabricables: token predecible y no validado, PII en la URL, evaluador suplantable | `src/pages/Evaluate.tsx:37-42, 76-91, 110-111`; `EvaluationProfileConfig.tsx:108-149` | L |
| SEC-009 | Crítica | Enlaces / Integridad | “Uso único” solo en `localStorage`: se puede reenviar | `Evaluate.tsx:113-173, 297-356` | M |
| SEC-010 | Crítica | Datos personales | Censo con PII embebido en el bundle público (antes del login) y en git | `src/data/rawEmployeesCsv.ts:1-2406`, `dist/assets/index-DApeAW_1.js` | M |
| SEC-011 | Alta | Inyección / Abuso | `/api/send-email`: relay abierto, inyección HTML y de cabeceras, phishing con marca oficial | `server.ts:68-144, 147-225` | M |
| SEC-012 | Alta | RBAC vs. objetivo | Colaborador, supervisor y director inician sesión y ven sus resultados (contra AMB-09/AMB-11) | `authService.ts:389-442`; `AdminComparisonModule.tsx:143-153, 1320-1326`; `EvaluationHubHome.tsx:40-57` | M |
| SEC-013 | Alta | Control de negocio | Apertura/cierre del período decidido en el `localStorage` de cada navegador | `src/utils/evaluationStatus.ts:96-126`; `Evaluate.tsx:492-497` | M |
| SEC-014 | Alta | Integridad | `/api/evaluate-promotion` devuelve un dictamen inventado (“94.6 %”) que no viene de la IA | `server.ts:380-392` | S |
| SEC-015 | Alta | Dependencias | 3 críticas y 11 altas en `npm audit`; `xlsx` 0.18.5 sin corrección en npm; `pdfjs-dist` 3.11.174 | `package.json`; `DatabaseStatusModal.tsx:131`; `pdfExtractor.ts:39-43` | M |
| SEC-016 | Alta | Integridad / Disponibilidad | No hay fuente de verdad en el servidor: el Administrador nunca lee la BD | `databaseService.ts:173` (sin llamadas); `Evaluate.tsx:330-465` | L |
| SEC-017 | Media | Autorización | `/api/db/init` y `/api/db/status` anónimos ejecutan DDL | `server.ts:419-435`; `db.ts:88-89, 159-288` | S |
| SEC-018 | Media | Autenticación | Reset de contraseña solo en el cliente; el endpoint no existe | `authService.ts:48-111` (l. 94) | S |
| SEC-019 | Media | IA | `/api/generate-situational` anónimo: abuso de cuota de Gemini y prompt injection | `server.ts:228-303`; `JobDescriptorModal.tsx:141` | S |
| SEC-020 | Media | Configuración | Sin cabeceras de seguridad, CSP ni rate limiting; `x-powered-by` activo; escucha en 0.0.0.0 | `server.ts:12-15, 514` | S |
| SEC-021 | Media | Manejo de errores | `err.message` (BD/SMTP) devuelto al cliente | `server.ts:416-495`; `db.ts:103, 284, 408, 527, 718` | S |
| SEC-022 | Media | Exposición de código | `dist/server.cjs` y `.map` (con `sourcesContent`) servidos públicamente | `server.ts:507-508`; `package.json` (script `build`) | S |
| SEC-023 | Media | Configuración (PLAUSIBLE) | Middleware de desarrollo de Vite expuesto si `NODE_ENV≠production` | `server.ts:500-505`; README §7 | S |
| SEC-024 | Media | Transporte | TLS hacia PostgreSQL sin verificar el certificado | `db.ts:23` | S |
| SEC-025 | Media | Datos personales | Evaluaciones, contraseñas y PII persisten en `localStorage` (equipos compartidos); PII en logs | `Evaluate.tsx:211-222`; `store.ts:93-98`; `server.ts:172, 211-217` | M |
| SEC-026 | Media | Autorización | Gestor tratado como admin; helpers que permiten acceso cuando no hay usuario | `AdminComparisonModule.tsx:133`; `authService.ts:479-505` | S |
| SEC-027 | Baja | XSS (PLAUSIBLE) | `dangerouslySetInnerHTML` con nombres de Dirección interpolados | `PeopleAnalyticsEducationDashboard.tsx:1206`; `peopleAnalyticsEducation.ts:760` | S |
| SEC-028 | Baja | Enumeración | Los mensajes de login confirman si una cédula existe | `db.ts:676-680`; `authService.ts:445-448` | S |

**Por severidad:** Crítica 10 · Alta 6 · Media 10 · Baja 2 · **Total 28**.

---

## 3. Fichas de hallazgo

> Formato de la metodología (§5): ID, categoría, severidad, evidencia, descripción, impacto, escenario de explotación, corrección, esfuerzo y dependencias/requisito.

### SEC-001 — Credenciales admin/gestor hardcodeadas y toma de la cuenta del Administrador Maestro
- **Vertical/Categoría:** Técnica / Autenticación · **Severidad:** Crítica
- **Evidencia:**
  - `src/services/authService.ts:225` — `(rawUser === 'admin' || rawUser === 'administrador') && (rawPass === 'admin' || rawPass === 'administrador')` crea un usuario `role:'admin'` y llama `saveSession` (l. 237).
  - `authService.ts:242-258` — la cuenta “Administrador Maestro” acepta como usuario la cédula `<CI-ADMIN>` o los alias `natalia`, `natalia rodriguez`, `nrodriguez`, y como contraseña `<CI-ADMIN>`, `admin`, `natalia` o `administrador`.
  - `authService.ts:298` — `gestor/gestor` y `evaluador/evaluador` dan `role:'gestor'`.
  - `authService.ts:292` — el mensaje de error muestra la cédula del administrador en claro.
  - `LoginPage.tsx:54-61, 87-95` — si `mustChangePassword` es verdadero, se abre un modal que acepta **cualquier** contraseña nueva válida y llama `saveSession(pendingUser)` con `role:'admin'`.
  - `dist/assets/index-DApeAW_1.js` — el literal `"administrador"` y la cédula `<CI-ADMIN>` (21 veces) aparecen en el bundle; la cédula también está en `dist/server.cjs` (2 veces).
- **Descripción:** las credenciales de los roles privilegiados están en el código del cliente. La cuenta maestra acepta contraseñas triviales, y tras el “primer ingreso” deja que quien entra defina una contraseña nueva, que además solo se guarda en ese navegador.
- **Impacto:** cualquier persona obtiene acceso total a la interfaz de administración: censo, resultados, Nine-Box, política salarial, configuración y envío de convocatorias.
- **Escenario:** en un navegador limpio, el atacante escribe `admin` / `admin` y entra al panel con rol admin. Otra vía: `natalia` / `natalia`, define `Xx1234!` en el modal y queda autenticado como Administrador Maestro.
- **Corrección:** eliminar todo el bloque de cuentas fijas. Autenticar solo en el servidor contra la tabla `users`, con hash argon2id, sin alias por nombre. Contraseña inicial aleatoria entregada fuera de banda o enlace de activación de un solo uso. MFA (TOTP) para el administrador.
- **Esfuerzo:** M · **Dependencias:** SEC-002, SEC-007 · **Requisito:** AMB-09

### SEC-002 — Sesión y rol solo en `localStorage`, falsificables; admin detectado por nombre/cargo
- **Categoría:** Sesión / Escalada de privilegios · **Severidad:** Crítica
- **Evidencia:**
  - `authService.ts:510-519` — la “sesión” es un `JSON.stringify(user)` en la clave `canguro_authenticated_session`. No hay token, firma, cookie ni expiración.
  - `authService.ts:524-547` — `getCurrentSession` hace `JSON.parse` sin validar nada. En l. 533 se omite la comprobación de contraseña cuando `user.username === 'admin'`. En l. 538-546, si el nombre contiene “natalia” y “rodriguez/montilla”, **sube** el rol a `admin`.
  - `authService.ts:455-465` — `isMasterAdministrator` devuelve verdadero si `username==='admin'`, si el `fullName` contiene ese nombre, si `position` contiene “administrador maestro” o si `role==='admin'`.
  - `authService.ts:369-381, 402-403` — el login local busca también en `canguro_custom_collaborators` (en `localStorage`, escribible por el usuario) y asigna `admin` a cualquier cargo que contenga “administrador”, “presidencia” o “vicepresidencia”.
  - `AdminComparisonModule.tsx:130-133`, `EvaluationHubHome.tsx:25-26`, `Evaluate.tsx:492-493` — toda la autorización del cliente se apoya en estos datos.
- **Descripción:** la identidad la declara el propio navegador. No hay nada en el servidor que valide una sesión, porque el servidor no tiene el concepto de sesión.
- **Impacto:** cualquier usuario sube a administrador editando `localStorage`. La sesión nunca expira; en un equipo compartido de tienda sobrevive indefinidamente.
- **Escenario:** en la consola: `localStorage.setItem('canguro_authenticated_session', JSON.stringify({username:'admin',role:'admin',fullName:'x',collaboratorId:'x',position:'x',department:'x',directorate:'x',managementLevel:'ESTRATÉGICO'}))`, recargar y se obtiene el panel de administración. Otra vía: insertar en `canguro_custom_collaborators` un registro con cédula inventada y `position:'Presidencia'`, y luego entrar con esa cédula como usuario y contraseña.
- **Corrección:** sesión en el servidor con cookie `HttpOnly; Secure; SameSite=Strict`, identificador aleatorio de 256 bits guardado en BD o Redis, expiración por inactividad (30 min) y absoluta (8 h), rotación al iniciar sesión e invalidación al cerrarla. El rol se lee **siempre** del servidor (`GET /api/auth/me`). Eliminar toda detección por nombre o cargo.
- **Esfuerzo:** L · **Dependencias:** SEC-003 · **Requisito:** AMB-09

### SEC-003 — Todos los endpoints `/api/*` sin autenticación ni autorización
- **Categoría:** Autorización · **Severidad:** Crítica
- **Evidencia:** `server.ts:12-15` — el único middleware es `express.json()`. Ninguna de las rutas en `server.ts:147, 228, 380, 407, 419, 428, 437, 450, 463, 472, 481, 490` verifica identidad, rol ni origen. No hay `cors`, `helmet` ni `express-rate-limit` en `package.json`.
- **Descripción:** el backend funciona como una API pública. La matriz completa está en la §4.
- **Impacto:** lectura y escritura anónima de datos personales y de resultados; envío de correos; consumo de la cuota de IA; DDL sobre la BD.
- **Escenario:** `curl -X POST https://<host>/api/db/evaluations -H 'Content-Type: application/json' -d '{...}'` sin credenciales. Véanse SEC-004 a SEC-006, SEC-011 y SEC-017.
- **Corrección:** middleware `requireSession` en todo `/api/*` excepto `/api/auth/login` y las rutas de enlace (que validan su propio token). Middleware `requireRole('admin')` en `db/*`, `send-email` y la IA. Validar el cuerpo con `zod`.
- **Esfuerzo:** L · **Dependencias:** SEC-002

### SEC-004 — IDOR: lectura de evaluaciones y PDI de cualquier colaborador
- **Categoría:** Autorización (IDOR) · **Severidad:** Crítica
- **Evidencia:** `server.ts:472-479` → `getEvaluationsByCollaborator(req.params.collaboratorId)` (`db.ts:536-553`, `SELECT *`). `server.ts:490-497` → `getPdiByCollaborator` (`db.ts:558-575`, `SELECT *`). El identificador es `emp-<cédula>` (`Evaluate.tsx:469`, `db.ts:673`) y todas las cédulas están en el bundle (SEC-010).
- **Descripción:** no se comprueba quién pide ni si tiene relación con el colaborador. El `SELECT *` devuelve puntajes, comentarios abiertos, nombre y cargo del evaluador (rompe el anonimato de pares y subordinados) y el PDI con brechas y firmas.
- **Impacto:** fuga masiva de evaluaciones de desempeño, que son datos personales sensibles en lo laboral. El cliente no usa estas rutas (`fetchEvaluationsFromDb` no tiene llamadas), así que solo sirven para atacar.
- **Escenario:** el atacante extrae las cédulas del bundle y recorre `GET /api/db/evaluations/emp-<cédula>` para cada una, obteniendo todas las evaluaciones con la identidad de cada evaluador.
- **Corrección:** restringir a `admin` (y `gestor`, si se aprueba). Eliminar las rutas si no se usan. Devolver una proyección mínima y seudonimizar al evaluador de pares y subordinados. Usar identificadores internos UUID en lugar de la cédula.
- **Esfuerzo:** M · **Dependencias:** SEC-003 · **Requisito:** AMB-11

### SEC-005 — Sobrescritura de evaluaciones/PDI (incluso “bloqueadas”); el servidor confía en el cliente
- **Categoría:** Integridad · **Severidad:** Crítica
- **Evidencia:**
  - `db.ts:486-505` — `INSERT … ON CONFLICT (id) DO UPDATE SET scores=…, final_score=…, is_locked = EXCLUDED.is_locked`. No hay `WHERE evaluations.is_locked = false`, así que una evaluación bloqueada se sobrescribe y hasta se desbloquea con `isLocked:false`.
  - `databaseService.ts:138` — `evalId = eval_${collaboratorId}_${evaluatorRole}`: id determinista. **Todos los pares** (y todos los subordinados) de un colaborador escriben la misma fila y cada envío pisa al anterior.
  - `Evaluate.tsx:468-478` — se envían `scores`, `finalScore` y `finalPercent` calculados (o vacíos) en el navegador. `db.ts:518-519` guarda lo que llegue y el servidor no recalcula nada ni valida rangos (1–5), claves de reactivos ni el tipo de evaluador.
  - `server.ts:481-488`, `db.ts:595-616` — mismo patrón en PDI (`goals`, `breaches`, `signatures`).
- **Impacto:** cualquiera puede manipular la nota final, el tramo de mérito, el Nine-Box o las firmas del PDI de cualquier empleado, y con eso influir en promociones, sucesión y política salarial. No queda rastro: no hay tabla de auditoría ni historial.
- **Escenario:** `POST /api/db/evaluations` con `{"id":"eval_emp-<cédula>_supervisor","collaboratorId":"emp-<cédula>","evaluatorRole":"supervisor","scores":{…todo 5…},"finalScore":5,"isLocked":true}` sustituye la evaluación del supervisor real.
- **Corrección:** id de evaluación = `UUID` vinculado al token del enlace (una fila por asignación evaluador→evaluado). Escritura solo vía `POST /api/links/:token/submit`, que marca el token consumido **en la misma transacción**. Restricción `UPDATE … WHERE is_locked = false` más un trigger que impida modificar filas bloqueadas. El servidor recalcula los puntajes desde las respuestas brutas con el catálogo oficial de reactivos. Tabla `evaluation_audit` de solo inserción.
- **Esfuerzo:** L · **Dependencias:** SEC-003, SEC-008, SEC-009 · **Requisito:** RN de inmutabilidad, AMB-03, AMB-17

### SEC-006 — `sync-census` anónimo permite crear un admin y reescribir el censo
- **Categoría:** Escalada de privilegios (servidor) · **Severidad:** Crítica
- **Evidencia:**
  - `server.ts:437-448` — `POST /api/db/sync-census` sin control de acceso.
  - `db.ts:323-344` — `ON CONFLICT (id) DO UPDATE` sobrescribe nombre, cédula, cargo y dirección de cualquier colaborador existente.
  - `db.ts:366, 376-377` — `isNataliaMaster` es verdadero si la cédula es `<CI-ADMIN>` **o** si `firstName` contiene “natalia” y `lastName` contiene “rodriguez” o “montilla”; en ese caso `role='admin'`.
  - `db.ts:384-393` — `ON CONFLICT (username) DO UPDATE SET role = EXCLUDED.role`: también **reasigna roles** de usuarios existentes.
  - `db.ts:684-700` — `authenticateUser` vuelve a aplicar la regla por nombre al iniciar sesión.
  - `authService.ts:352-356` — el cliente guarda directamente el `user` que devuelve el servidor (`saveSession(data.user)`).
- **Impacto:** un anónimo crea una cuenta con rol admin en BD, cambia el rol o los datos de cualquier empleado y corrompe el censo maestro. `db.ts:315` también ejecuta `initTables()`.
- **Escenario:** `POST /api/db/sync-census` con `{"collaborators":[{"id":"emp-99999999","idNumber":"99999999","firstName":"Natalia","lastName":"Rodriguez","position":"x","department":"x","directorate":"x"}]}`, y luego `POST /api/auth/login {"username":"99999999","password":"99999999"}`, que responde `role:"admin"`.
- **Corrección:** restringir a `admin` con re-autenticación. La sincronización no debe crear usuarios con login (AMB-09: solo admin y gestor). Los roles se asignan explícitamente en una tabla administrada y nunca se derivan del nombre ni del cargo. Rechazar cambios de `id_number` en registros existentes salvo con un flujo aprobado.
- **Esfuerzo:** M · **Dependencias:** SEC-003, SEC-007 · **Requisito:** AMB-09

### SEC-007 — Usuario = contraseña = cédula (cliente y servidor); contraseñas en texto plano
- **Categoría:** Autenticación · **Severidad:** Crítica
- **Evidencia:**
  - **Servidor** `db.ts:645-654` — `authenticateUser` normaliza ambos campos a dígitos y **solo** comprueba `cleanUser === cleanPass`. Nunca lee `users.password_hash`. `db.ts:393` guarda `password_hash = cleanCedula`, es decir, la cédula en claro. No hay bloqueo por intentos ni rate limit.
  - **Cliente** `authService.ts:327-329` — entrar con la propia cédula siempre es un “primer ingreso” válido, aunque el usuario ya tenga contraseña personalizada en *otro* navegador. También se acepta `admin` como contraseña de cualquier cédula sin contraseña personalizada (`rawPass === 'admin'`).
  - `authService.ts:180-195` — la contraseña personalizada se guarda **en texto plano** en `localStorage['canguro_custom_passwords']` y solo existe en ese navegador.
  - `authService.ts:259, 330` — comparación directa `cedulaPass === customPass`.
- **Descripción:** la cédula es un dato conocido (está en el bundle, en las URLs y en los correos). La contraseña personalizada no protege nada, porque basta con usar otro navegador.
- **Impacto:** suplantación de cualquier empleado con login. Con el modelo actual eso da acceso a sus resultados, y para supervisores y directores a su vista de equipo.
- **Escenario:** el atacante toma una cédula de un enlace de evaluación o del bundle e inicia sesión con `cédula / cédula` en una ventana privada.
- **Corrección:** véase la §6. Hash argon2id (o bcrypt coste ≥ 12) en `users.password_hash`, verificación en el servidor, bloqueo progresivo, sin contraseña derivada de la cédula. Con AMB-09, eliminar los usuarios que no sean admin o gestor.
- **Esfuerzo:** M · **Dependencias:** SEC-001, SEC-002 · **Requisito:** AMB-09, [B] §2 (“se guardan como hash” es falso)

### SEC-008 — Enlaces de evaluación fabricables: token predecible y no validado, PII en la URL, evaluador suplantable
- **Categoría:** Enlaces de evaluación · **Severidad:** Crítica
- **Evidencia:**
  - Generación: `EvaluationProfileConfig.tsx:108, 116, 125, 133, 141, 149` y `ProfileForm.tsx:107-112` — `token=canguro_<cédula>_<rol>`. `CollaboratorEvaluationQuadrants.tsx:94-109` genera enlaces **sin** token.
  - Consumo: `Evaluate.tsx:110-111` — `linkToken = tokenParam || 'eval_token_<cédula|nombre>_<tipo>'`. El token **solo** se usa como clave de `localStorage` (l. 126-131); no se valida contra ningún servidor ni firma. Cualquier URL `#/evaluate/<tipo>?…` sin token funciona igual.
  - PII en la URL: `Evaluate.tsx:38-42` (`employee`, `position`, `idNumber`, `dept`, `dir`), `76-77` (`evaluatorName`, `evaluatorPos`).
  - Suplantación: `Evaluate.tsx:79-91` — el nombre y cargo del evaluador salen de la URL o de un campo editable. `Evaluate.tsx:306` lo registra tal cual.
  - El tipo de evaluador sale de la ruta `:type` (`Evaluate.tsx:36, 104`): con cambiar `/self` por `/supervisor` se emite la evaluación del supervisor.
- **Matiz:** con `HashRouter`, la parte tras `#` **no** llega al servidor ni a la cabecera `Referer`. Sí queda en el historial del navegador, en el correo (cuerpo HTML y texto), en las vistas previas de enlaces de chat y en los logs del servidor de correo.
- **Impacto:** cualquiera que conozca una cédula (todas están en el bundle) emite evaluaciones en nombre de un supervisor, un par o un subordinado, de forma indistinguible de una legítima. Junto con SEC-005, invalida el proceso 360°/180°.
- **Escenario:** el atacante abre `https://<host>/#/evaluate/supervisor?idNumber=<cédula víctima>&evaluatorName=<nombre del supervisor real>`, rellena todo con 1 y envía. Hoy la escritura en BD usa el id determinista `eval_emp-<cédula>_supervisor` y sustituye al supervisor real.
- **Corrección:** tabla `evaluation_links(token_hash, assignment_id, evaluator_id, evaluatee_id, role, expires_at, consumed_at)`. Token de 256 bits (`crypto.randomBytes(32)`, base64url); en BD solo se guarda `SHA-256(token)`. URL `#/e/<token>` sin PII. El servidor resuelve evaluado, rol y evaluador desde el token; el cliente no puede elegirlos. Expiración ligada al período.
- **Esfuerzo:** L · **Dependencias:** SEC-003 · **Requisito:** AMB-10

### SEC-009 — “Uso único” solo en `localStorage`: se puede reenviar
- **Categoría:** Enlaces / Integridad · **Severidad:** Crítica
- **Evidencia:** `Evaluate.tsx:122-173` — `checkLinkUsage` mira solo `localStorage` (`canguro_consumed_evaluation_links`, `eval_form_*`, `canguro_pilot_eval_*`), datos en memoria del bundle y el store local. `Evaluate.tsx:297-356` — al enviar, el bloqueo se escribe solo en `localStorage`. El servidor (`db.ts:486-505`) no rechaza un segundo envío.
- **Impacto:** un evaluador puede cambiar su evaluación después de enviarla (otro navegador, modo incógnito o `localStorage.clear()`), o enviarla varias veces. Cualquiera puede volver a llamar la API directamente (SEC-005).
- **Escenario:** el supervisor envía su evaluación, abre el mismo enlace en una ventana privada, cambia las respuestas y vuelve a enviar; la fila en BD se reemplaza.
- **Corrección:** consumo atómico en el servidor: `UPDATE evaluation_links SET consumed_at=now() WHERE token_hash=$1 AND consumed_at IS NULL AND expires_at>now() RETURNING …`; si no devuelve filas, responder 410. El borrador puede quedar en `localStorage` (AMB-17), pero el envío solo cuenta en el servidor.
- **Esfuerzo:** M · **Dependencias:** SEC-008 · **Requisito:** AMB-10, AMB-17

### SEC-010 — Censo con PII embebido en el bundle público (antes del login) y en git
- **Categoría:** Protección de datos personales · **Severidad:** Crítica
- **Evidencia:**
  - `src/data/rawEmployeesCsv.ts:1-2406` — `RAW_EMPLOYEES_CSV` con columnas *Número de identificación, Empleado (nombre completo), Razón Social, Puesto, Fecha de inicio, Dirección, Ubicación, Cuenta analítica* (unas 2.405 filas). La importa `src/data/canguroUniverso.ts:2`, que se importa a su vez desde `Dashboard.tsx:7`, `Evaluate.tsx:21` y `authService.ts:1` (todo en el chunk inicial).
  - `dist/assets/index-DApeAW_1.js` (3,2 MB, único chunk): la cabecera `Empleado/Número de identificación` aparece 1 vez y hay **2.322** coincidencias del patrón `cédula,Nombre Apellido`.
  - Otros archivos con cédulas: `src/data/officialOrgChart.ts` (unas 311), `src/data/canguroUniverso.ts` (39), `src/data/promotionsAnalyticsData.ts` (24), `temp-test-org.js` (unas 310), `scratch/full_user_content.txt` (unas 234), `scratch/chunk3_candidate.txt` (unas 231). **Están versionados en git** (`git ls-files` incluye `scratch/*` y `temp-test-org.js`).
  - Si se carga la evaluación de un colaborador (`Dashboard.tsx:58-70`), el estado incluye además las evaluaciones precargadas del censo.
- **Impacto:** cualquier persona que abra la URL, sin iniciar sesión, descarga la identidad y la relación laboral de toda la plantilla. Sirve para robo de identidad y además alimenta SEC-004, SEC-007 y SEC-008.
- **Escenario:** el atacante abre `https://<host>/`, va a DevTools → Sources → `index-*.js` y busca `Empleado/Número`; obtiene el censo completo.
- **Corrección:** eliminar los datos del código fuente. El censo vive solo en BD y se sirve por `GET /api/admin/collaborators` (admin, paginado, campos mínimos). Purgar el historial de git (`git filter-repo`) antes de cualquier push remoto, borrar `scratch/` y `temp-test-org.js` y añadirlos a `.gitignore`. Valorar la notificación interna según la normativa de protección de datos aplicable.
- **Esfuerzo:** M (código) + S (purga del repo) · **Dependencias:** SEC-003 · **Requisito:** AMB-08

### SEC-011 — `/api/send-email`: relay abierto, inyección HTML y de cabeceras, phishing con marca oficial
- **Categoría:** Inyección / Abuso · **Severidad:** Alta
- **Evidencia:**
  - `server.ts:147-151` — sin autenticación; `to`, `subject`, `body`, `employeeName`, `idNumber`, `position`, `roleLabel` y `url` vienen del cliente y no se validan.
  - `server.ts:112-115, 126, 134` — interpolación **sin escapar** en el HTML (`${data.employeeName}`, `href="${data.url}"`, …): permite inyectar HTML o un `javascript:`/URL maliciosa en el botón “Ingresar a la Evaluación Oficial”.
  - `server.ts:183` — en la vía Gmail API, `To: ${to}` se concatena en cabeceras RFC 822 con `\n`: inyección de cabeceras (`Bcc:`, `Reply-To:`, MIME) si `to` contiene saltos de línea.
  - `server.ts:166-171` — en la vía Nodemailer, `to` acepta listas o arrays (varios destinatarios). La versión instalada `nodemailer@10.0.15` tiene avisos de `addressparser` (GHSA-8c8m-p3m8-cjg8, GHSA-m943-m63m-w62w, GHSA-85x2-q946-cp5h; corregidos en 10.1.4).
  - `server.ts:113` — la plantilla incluye la cédula del evaluado y se envía a una dirección arbitraria.
- **Impacto:** el atacante usa la cuenta corporativa de Talento Humano para enviar phishing con la marca oficial (“Convocatoria Oficial de Evaluación”) a cualquier dirección y con enlaces maliciosos. Se pierde la reputación SPF/DKIM del dominio y se filtran cédulas por correo.
- **Escenario:** `POST /api/send-email {"to":"victima@externo.com","subject":"Convocatoria Oficial","url":"https://login-falso.example/","employeeName":"…"}`.
- **Corrección:** solo admin. El servidor construye el correo desde el `assignment_id` (destinatario = email del evaluador en BD; URL = token generado en el servidor). Nada de `to`/`url` libres. Escapar todo con una función `escapeHtml` o una plantilla con auto-escape, validar el email con una librería y rechazar `\r\n`. Usar Nodemailer también para Gmail (evita construir cabeceras a mano). Quitar la cédula del correo. Actualizar `nodemailer` a ≥ 10.1.4.
- **Esfuerzo:** M · **Dependencias:** SEC-003, SEC-008 · **Requisito:** AMB-15

### SEC-012 — Colaborador, supervisor y director inician sesión y ven sus resultados (contra AMB-09/AMB-11)
- **Categoría:** RBAC vs. modelo objetivo · **Severidad:** Alta
- **Evidencia:** `authService.ts:389-442` asigna `director`, `supervisor`, `gestor` y `colaborador` según el texto del cargo y les da sesión. `AdminComparisonModule.tsx:143-153` deja a los no-admin en `inicio` y `expediente`. `AdminComparisonModule.tsx:1320-1326` carga **su propio expediente** (`handleSelectCollaborator(currentUser.collaboratorId)`) con resultados, campana y tramo. `EvaluationHubHome.tsx:40-57` muestra los datos del usuario y las vistas de líder. `db.ts:376-382` también provisiona estos roles en el servidor.
- **Impacto:** contradice las decisiones registradas. El colaborador ve su tramo, que está ligado a la política salarial, y la comparación con pares. Junto con SEC-007, cualquiera ve el expediente de cualquiera.
- **Corrección:** eliminar el login para roles distintos de admin y gestor; quitar `canViewDirectionResults` y las vistas de líder; el expediente solo es accesible para admin desde la API.
- **Esfuerzo:** M · **Dependencias:** SEC-002 · **Requisito:** AMB-09, AMB-11

### SEC-013 — Apertura/cierre del período decidido en el `localStorage` de cada navegador
- **Categoría:** Control de negocio · **Severidad:** Alta
- **Evidencia:** `evaluationStatus.ts:109-126` — por defecto `isOpen: true` con una ventana de 15 días **desde hoy**, y solo se lee `localStorage`. `Evaluate.tsx:492-497` — el bloqueo se salta si `role==='admin'` o `username===<CI-ADMIN>` en la sesión local (SEC-002).
- **Impacto:** cerrar el período desde el panel del administrador solo afecta a su navegador. Los evaluadores en otros equipos siempre ven el período abierto, así que la fecha tope no se puede hacer cumplir.
- **Corrección:** tabla `evaluation_periods` en el servidor. El endpoint de envío por token rechaza fuera de ventana; el cliente solo muestra el estado.
- **Esfuerzo:** M · **Dependencias:** SEC-009

### SEC-014 — `/api/evaluate-promotion` devuelve un dictamen inventado
- **Categoría:** Integridad de decisiones · **Severidad:** Alta
- **Evidencia:** `server.ts:380-392` — no llama a Gemini aunque esté configurado. Devuelve un texto fijo, “Análisis de Idoneidad (Gemini 3.8 Flash): … 94.6% de consistencia …”, y un `verdict` que depende solo de `interviewScore >= 4.5`, un valor que manda el cliente. Además `Evaluate.tsx:377-398` rellena el expediente de promoción con valores fijos (`finalScore: 4.5`, `fitIndexPercent: 88`, `verdict: 'Altamente Idóneo / Prioritario'`).
- **Impacto:** el dictamen de promoción parece calculado por IA y no lo está; el porcentaje es falso. Cualquiera puede obtener “Altamente Idóneo” enviando `interviewScore: 5`.
- **Corrección:** retirar el endpoint o marcarlo explícitamente como “no disponible” hasta que la fórmula esté definida (AMB-12). Nunca mostrar textos atribuidos a una IA que no se ejecutó. Calcular el dictamen en el servidor desde datos almacenados.
- **Esfuerzo:** S · **Requisito:** AMB-12, AMB-16

### SEC-015 — Dependencias vulnerables
- **Categoría:** Dependencias · **Severidad:** Alta
- **Evidencia:** `npm audit --json` (2026-11-13): **3 críticas, 11 altas, 10 moderadas** (24 en total). Versiones instaladas: `vite 6.4.3`, `xlsx 0.18.5`, `pdfjs-dist 3.11.174`, `express 4.22.2`, `nodemailer 10.0.15`.

  | Paquete | Sev. | Directa | Avisos relevantes | Exposición real en este proyecto |
  |---|---|---|---|---|
  | `xlsx` 0.18.5 | Alta | Sí | Prototype pollution (GHSA-4r6h-8v6p-xvw6, <0.19.3); ReDoS (GHSA-5pgg-2g8v-p4x9, <0.20.2). **Sin corrección en npm** (`fixAvailable:false`) | `DatabaseStatusModal.tsx:131` parsea archivos subidos por el administrador → explotable con un Excel malicioso que reciba de un tercero. Migrar al tarball oficial de SheetJS (≥ 0.20.3, cdn.sheetjs.com) o a `exceljs` |
  | `pdfjs-dist` 3.11.174 | Alta | Sí | Ejecución de JS al abrir un PDF malicioso (GHSA-wgrm-67xf-hhpq / CVE-2024-4367, ≤ 4.1.392) | **Mitigado parcialmente**: `pdfExtractor.ts:42` usa `isEvalSupported:false` (la mitigación oficial). Pero el worker se descarga de un CDN de terceros (`pdfExtractor.ts:6`) sin SRI. Actualizar a ≥ 4.2.67 y servir el worker local |
  | `vite` 6.4.3 | Alta | Sí | `server.fs` bypass, ejecución cross-origin vía middleware, `launch-editor` (GHSA-9jrq-w75r-8gcw, GHSA-rq7h-c2jc-7f22, …) | Relevante solo si se expone el modo dev (SEC-023) |
  | `react-router` (vía `react-router-dom` 7.17) | Alta | Indirecta | Open redirect por backslash, DoS de coincidencia de rutas, etc. (<7.18.x) | Bajo/medio con HashRouter; actualizar |
  | `dompurify` 3.4.10 (vía `jspdf`) | Crítica | No | Varios bypass de XSS (≤ 3.4.16) | Depende del uso de `jspdf.html()`; actualizar `jspdf` |
  | `proxy-addr` (vía `express`) | Crítica | No | Suplantación de IP con IPv4-mapped IPv6 | Solo si se activa `trust proxy` (no está activo); actualizar `express` |
  | `tar` (transitiva, instalación) | Crítica | No | Path traversal al extraer | Solo en tiempo de instalación/build |
  | `body-parser`, `qs` (vía `express`) | Alta/Mod. | No | DoS | API expuesta → actualizar `express` ≥ 4.22.x parcheada |
  | `nodemailer` 10.0.15 | Mod. | Sí | `addressparser` (ver SEC-011) | Relevante con `to` libre |
  | Otras (brace-expansion, browserslist, nanoid, postcss, source-map-js, glob, minimatch…) | Alta/Mod. | No | DoS | Herramientas de build |
- **Corrección:** `npm audit fix` y actualizar `vite`, `react-router-dom`, `jspdf`, `express` y `nodemailer`. Sustituir `xlsx` y `pdfjs-dist` como se indica. Añadir `npm audit --audit-level=high` al CI.
- **Esfuerzo:** M

### SEC-016 — No hay fuente de verdad en el servidor: el Administrador nunca lee la BD
- **Categoría:** Integridad / Disponibilidad · **Severidad:** Alta
- **Evidencia:** `databaseService.ts:173-182` (`fetchEvaluationsFromDb`) **no se llama en ningún sitio** (grep en `src/`). Las respuestas se guardan en el `localStorage` del evaluador (`Evaluate.tsx:330-465`) y la escritura en BD es *fire-and-forget* (`.catch(() => {})`, l. 478). Los tableros calculan resultados desde `CANGURO_COLLABORATORS` y `localStorage`.
- **Impacto:** los resultados que ve el administrador dependen del navegador en que se miren; las respuestas de otros equipos no llegan. Los datos manipulados en `localStorage` alteran los tableros.
- **Corrección:** API de lectura para admin y cálculo de consolidados en el servidor. `localStorage` solo para borradores (AMB-17).
- **Esfuerzo:** L · **Requisito:** AMB-17

### SEC-017 — `/api/db/init` y `/api/db/status` anónimos ejecutan DDL
- **Categoría:** Autorización · **Severidad:** Media
- **Evidencia:** `server.ts:428-435` → `initTables()` (`db.ts:159-288`: `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE … ADD COLUMN`). `server.ts:419-426` → `testConnection()`, que **también** ejecuta `initTables()` si falta una tabla (`db.ts:88-89`) y devuelve el número de colaboradores y evaluaciones. `sync-census` también la llama (`db.ts:315`).
- **Impacto:** no es destructivo (no hay `DROP`), pero permite a un anónimo ejecutar DDL, hacer reconocimiento (proveedor, recuentos, mensajes de error de conexión) y generar carga en la BD. La aplicación usa una cuenta de BD con privilegios de DDL.
- **Corrección:** retirar `init` de la API y usar migraciones versionadas en el despliegue. Usar un rol de BD de aplicación sin DDL. `status` solo para admin y sin detalles.
- **Esfuerzo:** S

### SEC-018 — Reset de contraseña solo en el cliente; el endpoint no existe
- **Categoría:** Autenticación · **Severidad:** Media
- **Evidencia:** `authService.ts:48-111` — `resetUserPassword` borra la entrada de `localStorage` del navegador actual, escribe un log local y hace `fetch('/api/auth/reset-password')` (l. 94), una ruta que **no existe** en `server.ts` (y el error se ignora en l. 98). No verifica que quien llama sea admin. Lo invoca `UserPasswordRecoveryModule.tsx:89`.
- **Impacto:** la función no hace nada fuera del navegador del administrador. Da una falsa sensación de control y la bitácora de “reinicios” no es fiable.
- **Corrección:** con AMB-09, el reset solo aplica a admin y gestor. `POST /api/admin/users/:id/reset` (admin + re-autenticación) que genera un enlace de activación de un solo uso con expiración, y un registro de auditoría en BD.
- **Esfuerzo:** S · **Dependencias:** SEC-007

### SEC-019 — `/api/generate-situational` anónimo: abuso de cuota de Gemini y prompt injection
- **Categoría:** IA / Abuso · **Severidad:** Media
- **Evidencia:** `server.ts:228-303` — sin autenticación ni rate limit. `descriptor.keyFunctions`, `technicalKnowledge`, `summary` y `position` se interpolan tal cual en el prompt (l. 252-261) y la salida JSON se devuelve sin validar contra un esquema (l. 295-297).
- **Datos enviados a Gemini (verificado):** solo el texto del **descriptor de cargo** (extraído de un PDF subido en `JobDescriptorModal.tsx:96-147`) y el título del puesto. **No** se envían cédulas, nombres ni evaluaciones de empleados, salvo que el PDF los contenga (PLAUSIBLE, depende del documento). `/api/evaluate-promotion` **no** llama a Gemini (SEC-014).
- **Impacto:** (a) *denial of wallet*: cualquiera consume la cuota o factura de la API key; (b) un PDF con instrucciones incrustadas (“ignora lo anterior y …”) controla los reactivos generados, que se presentan como instrumento (riesgo para RN-01/AMB-16); (c) PLAUSIBLE: envío a un tercero de PII contenida en el descriptor.
- **Corrección:** solo admin, rate limit por usuario, límite de tamaño de los campos, validación de la salida con un esquema estricto (`zod`) y revisión humana obligatoria antes de usar un reactivo (AMB-16). Revisar los términos de tratamiento de datos de Gemini para la organización.
- **Esfuerzo:** S · **Requisito:** AMB-16

### SEC-020 — Sin cabeceras de seguridad, CSP ni rate limiting; `x-powered-by` activo; escucha en 0.0.0.0
- **Categoría:** Configuración · **Severidad:** Media
- **Evidencia:** `server.ts:12-15` (solo `express.json()`, límite por defecto de 100 kB, que es aceptable), sin `app.disable('x-powered-by')`, sin `helmet` y sin `express-rate-limit` (`package.json`). `server.ts:514` escucha en `0.0.0.0`. No hay middleware CORS: el navegador bloquea las lecturas cross-origin y las peticiones `application/json` cross-site requieren preflight, que falla, así que el riesgo de CSRF hoy es bajo. Pero **no protege frente a `curl`**, y si se añade `cors()` sin configurar, todo queda expuesto.
- **Impacto:** sin CSP ni `frame-ancestors` (clickjacking del panel admin), sin HSTS y sin freno a la fuerza bruta o a la enumeración.
- **Corrección:** `helmet` con CSP estricta (`default-src 'self'`; fuentes de Google permitidas explícitamente), `frame-ancestors 'none'`, HSTS, `Referrer-Policy: no-referrer`, rate limit global y por ruta de login/enlace, CORS con lista blanca explícita si hace falta, y `trust proxy` configurado correctamente tras el balanceador.
- **Esfuerzo:** S

### SEC-021 — `err.message` (BD/SMTP) devuelto al cliente
- **Categoría:** Manejo de errores · **Severidad:** Media
- **Evidencia:** `server.ts:416, 424, 433, 446, 459, 468, 477, 486, 495` (`message: err.message`). `db.ts:103` (“Error al conectar a PostgreSQL: ${err.message}”), `db.ts:284, 408, 527, 718` devuelven el mensaje de error de `pg` dentro del JSON.
- **Impacto:** revela nombres de tablas, columnas y restricciones, el host o pooler de la BD y errores de TLS, lo que facilita el reconocimiento.
- **Corrección:** manejador de errores centralizado que devuelva `{error:'internal', id:<correlationId>}` y registre el detalle solo en el servidor.
- **Esfuerzo:** S

### SEC-022 — `dist/server.cjs` y su `.map` servidos públicamente
- **Categoría:** Exposición de código · **Severidad:** Media
- **Evidencia:** el script `build` de `package.json` genera `dist/server.cjs` y `dist/server.cjs.map` (`--sourcemap`). `server.ts:507-508` hace `express.static(path.join(cwd,'dist'))`, así que `GET /server.cjs` y `GET /server.cjs.map` (con `sourcesContent`, verificado) quedan públicos. `dist/server.cjs` contiene la cédula `<CI-ADMIN>` (2 veces). No se encontraron claves en `dist/` (grep de `AIza…`, `postgres://`, `eyJ…`, `SMTP_PASS`, `GEMINI_API_KEY` sin resultados).
- **Impacto:** divulgación completa del código del backend y de las reglas de escalada (SEC-006).
- **Corrección:** compilar el servidor fuera de la carpeta estática (`build/server.cjs`) o servir solo `dist/client`; no publicar sourcemaps.
- **Esfuerzo:** S

### SEC-023 — Middleware de desarrollo de Vite expuesto si `NODE_ENV≠production` (PLAUSIBLE)
- **Categoría:** Configuración · **Severidad:** Media · **Estado:** PLAUSIBLE (depende de cómo se despliegue)
- **Evidencia:** `server.ts:500-505` — si `NODE_ENV !== "production"` arranca `createViteServer({middlewareMode:true})` sobre el puerto público (`0.0.0.0`). `README.md:182` indica `npm run dev`, y `npm start` (`node dist/server.cjs`) **no** fija `NODE_ENV`.
- **Impacto:** si se despliega así, Vite sirve el código fuente transformado (`/src/server/db.ts`, `/src/data/rawEmployeesCsv.ts`, …) con HMR, y quedan expuestas las vulnerabilidades de `vite 6.4.3` (SEC-015). `.env*` está en la lista de denegación por defecto de Vite, pero hay avisos de bypass de `server.fs` en esta versión.
- **Corrección:** fijar `NODE_ENV=production` en el script `start` (`cross-env`), fallar al arrancar si falta, y no usar nunca el modo dev en un host accesible desde la red.
- **Esfuerzo:** S

### SEC-024 — TLS hacia PostgreSQL sin verificar el certificado
- **Categoría:** Transporte · **Severidad:** Media
- **Evidencia:** `db.ts:23` — `ssl: … { rejectUnauthorized: false }` para cualquier host que no sea `localhost`.
- **Impacto:** un atacante en la ruta de red (MITM) puede interceptar las credenciales de BD y todos los datos.
- **Corrección:** `ssl: { ca: <CA del proveedor>, rejectUnauthorized: true }` (Supabase publica su CA) o `sslmode=verify-full`.
- **Esfuerzo:** S

### SEC-025 — Evaluaciones, contraseñas y PII persisten en `localStorage`; PII en logs
- **Categoría:** Datos personales · **Severidad:** Media
- **Evidencia:** autoguardado `Evaluate.tsx:211-222`; envío `Evaluate.tsx:331, 353, 426, 465` (`canguro_talent_state`, `canguro_pilot_eval_*`, `canguro_consumed_evaluation_links` con nombre, cédula y evaluador); contraseñas en claro (`authService.ts:191-195`); `logoutSession` (`authService.ts:559-568`) solo borra la clave de sesión. Logs: `server.ts:172` (destinatario), `server.ts:211-217` (destinatario, cédula del evaluado, enlace completo).
- **Impacto:** en equipos compartidos de tienda, el siguiente usuario lee evaluaciones y contraseñas ajenas; además, cualquier XSS futuro las exfiltra. Los logs del servidor acumulan PII.
- **Corrección:** guardar en el cliente solo el borrador mínimo, cifrado o ligado al token, y borrarlo al enviar. Limpieza completa al cerrar sesión. Logs sin PII (enmascarar la cédula y no registrar URLs con token).
- **Esfuerzo:** M · **Requisito:** AMB-17

### SEC-026 — Gestor tratado como admin; helpers que permiten acceso cuando no hay usuario
- **Categoría:** Autorización · **Severidad:** Media
- **Evidencia:** `AdminComparisonModule.tsx:133` y `EvaluationHubHome.tsx:26` — `isAdmin = role==='admin' || role==='gestor' || isMaster`: el gestor accede a todo, incluido el reset de contraseñas, el censo y la BD. `authService.ts:479-505` — `canConfigureEvaluations`, `canViewAllCompanyResults` y `canViewDirectionResults` devuelven `true` si `user` es `null` (“Modo demostración libre”). Hoy no se llaman (código muerto), pero son una trampa si se reutilizan.
- **Impacto:** no hay separación de privilegios entre admin y gestor (pendiente de decisión, AMB-09).
- **Corrección:** definir permisos finos (véase §5), aplicarlos en el servidor y hacer que los helpers rechacen el acceso cuando no hay usuario.
- **Esfuerzo:** S · **Requisito:** AMB-09

### SEC-027 — `dangerouslySetInnerHTML` con nombres de Dirección interpolados (PLAUSIBLE)
- **Categoría:** XSS · **Severidad:** Baja · **Estado:** PLAUSIBLE
- **Evidencia:** `PeopleAnalyticsEducationDashboard.tsx:1206` renderiza `strategicRecommendations` como HTML. `peopleAnalyticsEducation.ts:760` interpola `nonImpactAreas` (nombres de Dirección, l. 709-727, sacados de `c.info.directorate`). Hoy la importación normaliza la Dirección a constantes (`canguroUniverso.ts:76-88`, `DatabaseStatusModal.tsx:232`), pero los colaboradores creados a mano o los de `canguro_custom_collaborators` (`EvaluationProfileConfig.tsx:165-183`) no pasan por esa normalización. Es el único sink `dangerouslySetInnerHTML` o `innerHTML` en `src/`.
- **Impacto:** XSS almacenado en el panel admin si una Dirección contiene HTML.
- **Corrección:** renderizar con JSX (`<strong>` como elemento) y eliminar `dangerouslySetInnerHTML`.
- **Esfuerzo:** S

### SEC-028 — Los mensajes de login confirman si una cédula existe
- **Categoría:** Enumeración · **Severidad:** Baja
- **Evidencia:** `db.ts:676-680` (“No se encontró ningún colaborador con la cédula …”), `authService.ts:445-448`, `authService.ts:338-341` (“Su contraseña temporal es su número de cédula”).
- **Impacto:** confirma cédulas válidas y revela la política de contraseñas. Es menor, porque el censo ya está en el bundle (SEC-010).
- **Corrección:** mensaje genérico “Credenciales inválidas” y rate limit.
- **Esfuerzo:** S

---

## 4. Matriz endpoint × protección

Leyenda: ✗ = ausente · ✓ = presente. Evaluado sobre `server.ts` (no hay más routers ni middlewares).

| Método y ruta | Línea | Authn | Authz/rol | Validación de entrada | Rate limit | Filtra `err.message` | Riesgo | Hallazgos | Protección objetivo |
|---|---|---|---|---|---|---|---|---|---|
| `POST /api/send-email` | 147 | ✗ | ✗ | Mínima (`to`,`subject` presentes) | ✗ | No (solo log) | Relay abierto, inyección HTML y de cabeceras | SEC-011 | admin; destinatario y URL desde BD |
| `POST /api/generate-situational` | 228 | ✗ | ✗ | ✗ | ✗ | No | Abuso de cuota de IA, prompt injection | SEC-019 | admin + rate limit + esquema |
| `POST /api/evaluate-promotion` | 380 | ✗ | ✗ | ✗ | ✗ | No | Dictamen falso | SEC-014 | retirar o admin |
| `POST /api/auth/login` | 407 | — | — | Solo dígitos; acepta usuario = contraseña | ✗ | Sí (416, `db.ts:718`) | Suplantación, enumeración | SEC-007, SEC-028 | argon2id + bloqueo + cookie de sesión |
| `GET /api/db/status` | 419 | ✗ | ✗ | — | ✗ | Sí (424, `db.ts:103`) | Reconocimiento; ejecuta DDL | SEC-017 | admin |
| `POST /api/db/init` | 428 | ✗ | ✗ | — | ✗ | Sí (433) | DDL anónimo | SEC-017 | eliminar (migraciones) |
| `POST /api/db/sync-census` | 437 | ✗ | ✗ | Solo `Array.isArray` | ✗ | Sí (446, `db.ts:408`) | **Crear admin**, reescribir censo | SEC-006 | admin + re-autenticación |
| `POST /api/db/sync-positions` | 450 | ✗ | ✗ | Solo `Array.isArray` | ✗ | Sí (459) | Alterar catálogo de cargos y niveles | SEC-003 | admin |
| `POST /api/db/evaluations` | 463 | ✗ | ✗ | ✗ | ✗ | Sí (468, `db.ts:527`) | **Sobrescribir evaluaciones bloqueadas** | SEC-005 | sustituir por `POST /api/links/:token/submit` |
| `GET /api/db/evaluations/:collaboratorId` | 472 | ✗ | ✗ | ✗ | ✗ | Sí (477) | **IDOR**, fuga masiva | SEC-004 | admin |
| `POST /api/db/pdi` | 481 | ✗ | ✗ | ✗ | ✗ | Sí (486) | Alterar PDI y firmas | SEC-005 | admin |
| `GET /api/db/pdi/:collaboratorId` | 490 | ✗ | ✗ | ✗ | ✗ | Sí (495) | **IDOR** | SEC-004 | admin |
| `POST /api/auth/reset-password` | — | — | — | — | — | — | **No existe** (lo llama `authService.ts:94`) | SEC-018 | `POST /api/admin/users/:id/reset` (admin) |
| `GET /*` (estáticos de `dist/`) | 507-511 | ✗ | — | — | ✗ | — | Bundle con PII, `server.cjs(.map)` | SEC-010, SEC-022 | solo `dist/client`, sin PII |

**Inyección SQL:** **no** se encontró. Todas las consultas de `db.ts` usan parámetros `$n` (`db.ts:323-394, 435-446, 486-521, 542-545, 564-567, 595-616, 666-674`); las únicas sentencias sin parámetros son DDL o `COUNT(*)` constantes. El riesgo en los datos está en la **ausencia de autorización**, no en la construcción de las consultas.

---

## 5. Matriz rol × módulo: real vs. objetivo

### 5.1 Real (implementado)

Dónde se aplica: **C** = solo en el cliente (falsificable, SEC-002); **S** = en el servidor. **Ningún control se aplica en el servidor.**

| Módulo / acción | admin | gestor | director | supervisor | colaborador | anónimo (sin login) | Dónde |
|---|---|---|---|---|---|---|---|
| Panel completo (`config`, `links`, `audit`, `expediente` de todos, tableros, Nine-Box, sucesión, People Analytics) | Sí | Sí (igual que admin) | No | No | No | No (pantalla de login) | C (`AdminComparisonModule.tsx:133, 143-153`) |
| Expediente **propio** con resultados, campana y tramo | Sí | Sí | **Sí** | **Sí** | **Sí** | No | C (`AdminComparisonModule.tsx:1320-1326`) |
| Vista de líder (equipo) en el inicio | — | — | Sí | Sí | No | No | C (`EvaluationHubHome.tsx:57`) |
| Reset de contraseñas (`recuperacion_clave`) | Sí | Sí | No | No | No | No | C (y no tiene efecto, SEC-018) |
| Abrir/cerrar período | Sí | Sí | No | No | No | No | C (`localStorage` local, SEC-013) |
| Responder un formulario `#/evaluate/:type` | Sí | Sí | Sí | Sí | Sí | **Sí** | Ninguno (sin token válido) |
| Leer evaluaciones/PDI (API) | Sí | Sí | Sí | Sí | Sí | **Sí** | Ninguno |
| Escribir evaluaciones/PDI (API) | Sí | Sí | Sí | Sí | Sí | **Sí** | Ninguno |
| Sincronizar censo/cargos, crear usuarios y roles (API) | Sí | Sí | Sí | Sí | Sí | **Sí** | Ninguno |
| Enviar correo con plantilla oficial (API) | Sí | Sí | Sí | Sí | Sí | **Sí** | Ninguno |
| Generar reactivos con IA (API) | Sí | Sí | Sí | Sí | Sí | **Sí** | Ninguno |
| Ver el censo completo con cédulas | Sí | Sí | Sí | Sí | Sí | **Sí** (bundle) | Ninguno |
| **Obtener el rol admin** | — | `localStorage` | `localStorage` | `localStorage` | `localStorage` | `admin/admin`, `sync-census` | — |

### 5.2 Objetivo (decisión AMB-09 / AMB-10 / AMB-11)

| Módulo / acción | admin | gestor (*pendiente*) | evaluador vía enlace | colaborador | anónimo |
|---|---|---|---|---|---|
| Login con usuario y contraseña | Sí (argon2id + MFA) | Sí | **No** | **No** | No |
| Gestión del censo, cargos y usuarios | Sí | No | No | No | No |
| Configurar instrumentos y período | Sí | Sí (si se aprueba) | No | No | No |
| Generar y enviar enlaces | Sí | Sí (si se aprueba) | No | No | No |
| Responder **su** instrumento, una vez, dentro del período | — | — | **Sí, solo el del token** | — | No |
| Ver resultados individuales y consolidados | Sí | Sí, de solo lectura (si se aprueba) | No | **No** | No |
| Reset de credenciales | Sí | No | — | — | No |
| Uso de IA (sugerencias auditables) | Sí | Sí (si se aprueba) | No | No | No |
| Dónde se aplica | **Servidor** (middleware RBAC + sesión) | **Servidor** | **Servidor** (token en BD) | — | — |

**Brecha:** todas las filas de la matriz real con **Sí** en *director, supervisor, colaborador o anónimo* incumplen el objetivo. La única fila que coincide (responder un formulario) se cumple sin ninguna garantía de identidad ni de un solo uso.

---

## 6. Propuesta de arquitectura de autenticación objetivo

### 6.1 Principios
1. **Toda decisión de seguridad se toma en el servidor.** El cliente solo pinta lo que `GET /api/auth/me` y la API devuelven.
2. **Dos tipos de sujeto:** (a) *usuarios de panel* (admin y, si se aprueba, gestor) con sesión; (b) *evaluadores* identificados solo por un **token de enlace** de capacidad única.
3. **No hay PII en URLs, en el bundle ni en `localStorage`.**

### 6.2 Modelo de datos (nuevas tablas o cambios)
```sql
users(id uuid pk, email citext unique, password_hash text not null,  -- argon2id
      role text check (role in ('admin','gestor')), mfa_secret text, is_active bool,
      failed_attempts int default 0, locked_until timestamptz, created_at, updated_at);

sessions(id_hash bytea pk,  -- SHA-256 del id de sesión
         user_id uuid fk, created_at, last_seen_at, expires_at, ip inet, user_agent text);

evaluation_periods(id uuid pk, name text, opens_at timestamptz, closes_at timestamptz, status text);

evaluation_assignments(id uuid pk, period_id fk, evaluatee_id fk collaborators,
      evaluator_id fk collaborators null, evaluator_email citext, role text
      check (role in ('self','supervisor','peer','subordinate')), unique(period_id, evaluatee_id, evaluator_id, role));

evaluation_links(token_hash bytea pk,  -- SHA-256(token); el token en claro nunca se guarda
      assignment_id uuid fk unique, expires_at timestamptz, consumed_at timestamptz null,
      created_by uuid fk users, created_at);

evaluations(id uuid pk, assignment_id uuid fk unique, raw_answers jsonb,
      computed_scores jsonb,  -- recalculado en el servidor
      submitted_at timestamptz, is_locked bool default true);
-- trigger: impide UPDATE/DELETE si is_locked

audit_log(id bigserial, at timestamptz, actor text, action text, target text, meta jsonb);  -- solo inserción
```
`collaborators.id` pasa a ser un UUID interno; la cédula queda como atributo protegido y nunca se usa como identificador en URLs ni en la API.

### 6.3 Flujos

**Login de panel** (`POST /api/auth/login`, rate limit de 5 por minuto por IP y por cuenta):
1. Buscar el usuario por email, comparar con `argon2.verify(hash, password)` (argon2id, m=64 MiB, t=3, p=1) en tiempo constante. Bloqueo progresivo tras 5 fallos.
2. MFA TOTP obligatorio para `admin`.
3. Crear la sesión: `sid = randomBytes(32)`, guardar `SHA-256(sid)` y enviar la cookie `__Host-sid` con `HttpOnly; Secure; SameSite=Strict; Path=/`. Expiración de 30 min por inactividad y 8 h absoluta. Rotar en cada login y en cada cambio de privilegio.
4. CSRF: `SameSite=Strict`, comprobación de `Origin` y token doble para métodos que no sean GET.
5. Logout: borrar la fila de sesión y la cookie.

**Alta y reset de credenciales:** el admin crea el usuario y el sistema envía un enlace de activación de un solo uso (token aleatorio, guardado como hash, TTL de 24 h). No hay contraseña inicial derivada de la cédula. El reset sigue el mismo flujo y queda registrado en `audit_log`.

**Enlace de evaluación:**
1. El admin genera las asignaciones del período. Por cada una: `token = base64url(randomBytes(32))`, se guarda `SHA-256(token)` y `expires_at = period.closes_at`.
2. El servidor envía el correo (destinatario = `evaluator_email` de la asignación) con la URL `https://<host>/#/e/<token>`, sin PII.
3. `GET /api/links/:token` → si es válido, no está consumido y está dentro del período, devuelve solo lo necesario para pintar el instrumento (nombre del evaluado, cargo, reactivos oficiales), **sin cédula**. Si no, responde 404/410 sin distinguir el motivo.
4. `POST /api/links/:token/submit` → en una transacción: `UPDATE evaluation_links SET consumed_at=now() WHERE token_hash=$1 AND consumed_at IS NULL AND expires_at>now() RETURNING assignment_id`. Validar las respuestas contra el catálogo oficial, **recalcular los puntajes en el servidor**, insertar en `evaluations` con `is_locked=true` y añadir la entrada en `audit_log`. Un segundo envío recibe 410.
5. Borrador: opcional, en `localStorage` con clave `draft:<SHA-256(token)>`, borrado al enviar.

### 6.4 Middleware RBAC (Express)
```ts
const requireSession = async (req, res, next) => { /* lee cookie __Host-sid, busca SHA-256 en sessions, valida expiración, req.user = {...} */ };
const requireRole = (...roles: Role[]) => (req, res, next) =>
  req.user && roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'forbidden' });

app.use(helmet({ contentSecurityPolicy: { /* default-src 'self' … */ } }));
app.disable('x-powered-by');
app.use('/api', rateLimit({ windowMs: 60_000, max: 120 }));
app.post('/api/auth/login', loginLimiter, login);
app.get ('/api/links/:token', linkLimiter, getLink);
app.post('/api/links/:token/submit', linkLimiter, submitLink);
app.use ('/api/admin', requireSession, requireRole('admin'));         // censo, usuarios, enlaces, resultados, IA
app.use ('/api/results', requireSession, requireRole('admin', 'gestor'));
app.use(errorHandler); // sin err.message hacia el cliente
```
Permisos finos (si se aprueba el gestor): `results:read`, `instruments:write`, `links:send` para el gestor; `census:write`, `users:*`, `periods:*` solo para el admin.

### 6.5 Orden de remediación sugerido (oleada 1 de seguridad)
1. Retirar el censo del bundle y purgar el repo (SEC-010). Cortar `sync-census`, `init`, `evaluations` y `pdi` con un `requireRole('admin')` provisional (SEC-003/004/005/006/017).
2. Login de panel en el servidor con argon2id y cookie de sesión; eliminar `authService` local y las credenciales fijas (SEC-001/002/007/012/018).
3. Tablas de asignaciones y enlaces, endpoints `links/:token`, recálculo de puntajes en el servidor (SEC-005/008/009/013/016).
4. Correo construido en el servidor (SEC-011), IA solo para admin (SEC-019), endurecimiento (SEC-020/021/022/023/024) y dependencias (SEC-015).

---

## 7. Elementos que requieren decisión de la usuaria
1. **Rol gestor (AMB-09, pendiente):** ¿existe? ¿Solo lectura de resultados o también configura y envía enlaces? Hoy equivale a admin (SEC-026).
2. **Purga del historial git:** el commit base `7a3e056` ya contiene el censo con cédulas (`src/data/*`, `scratch/`, `temp-test-org.js`). Hay que decidir si se reescribe el historial antes de cualquier push remoto.
3. **¿Ha estado desplegada la plataforma con datos reales?** Si es así, deben considerarse **comprometidos**: el censo (público en el bundle), las evaluaciones en BD (IDOR anónimo) y la integridad de los resultados y los roles de la tabla `users` (escritura anónima). Conviene revisar los logs, rotar las credenciales de BD, SMTP y Gemini y valorar la notificación según la normativa de datos personales aplicable.
4. **Evaluaciones de pares y subordinados:** hoy todas se guardan en una sola fila por rol (SEC-005). Hay que confirmar si deben ser varias asignaciones por rol (una por evaluador), lo que es necesario para la ponderación de la tabla 6.4.
5. **Uso de Gemini:** confirmar si se puede enviar a un tercero el contenido de los descriptores de cargo, y si la IA se mantiene solo como sugerencia (AMB-16).
6. **Dictamen de promoción (AMB-12):** hasta que se defina la fórmula, ¿se retira `/api/evaluate-promotion` o se oculta el dictamen? (SEC-014).

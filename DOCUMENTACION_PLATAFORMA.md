# Sistema de Gestión del Desempeño y Desarrollo de Talento
## DISTRICUEROS EL CANGURO, C.A. — «Universo Canguro»
### Dirección de Talento Humano | Gerencia de Formación y Desarrollo

---

## 1. Resumen Ejecutivo y Propósito Institucional
La Plataforma de Evaluación del Desempeño y Talento Humano de **DISTRICUEROS EL CANGURO, C.A.** es la herramienta oficial corporativa diseñada para sistematizar, calibrar y proyectar el desarrollo integral del capital humano a nivel nacional.

La solución abarca la gestión integral de:
- **Red Nacional de Tiendas:** Asesores Integrales, Operadores Integrales, Supervisores y Encargados de Tienda.
- **Áreas Administrativas, Técnicas y de Soporte:** Analistas, Especialistas y Responsables de Área (Operaciones, Comercial, Finanzas, Tecnología, Logística, Compras, Control Interno y Talento Humano).
- **Línea de Mando y Liderazgo:** Coordinadores y Gerentes de Departamento.
- **Alta Dirección:** Directores de Área y miembros del Comité Ejecutivo.

El sistema unifica la evaluación multifuente (180° y 360°), la calibración organizacional mediante Curva Normal Gaussiana y Guía de Mérito salarial, la Matriz de Potencial Nine-Box, los Planes de Desarrollo Individual (PDI 70-20-10), el Concurso de Promociones y Ascensos con Inteligencia Artificial (Gemini 3.8 Flash), y el Banco de Sucesores para posiciones críticas.

---

## 2. Identidad Visual, Guía de Estilo y Sistema de Diseño (Design System)
La plataforma implementa un sistema de diseño propio basado en Tailwind CSS, alineado rigurosamente con los colores institucionales y la presencia sobria de El Canguro. Cumple con un estándar de diseño corporativo moderno, de alta densidad de información, legibilidad ejecutiva y cero elementos superfluos.

### 2.1. Paleta Cromática Institucional
| Código Hex | Token Tailwind | Rol en la Interfaz | Significado y Uso |
| :--- | :--- | :--- | :--- |
| **#F1B400** | `bg-[#F1B400]`, `text-[#F1B400]`, `border-[#F1B400]` | Color Primario Institucional (Oro Canguro) | Acentos de marca, botón de menú principal, indicadores de tramo sobresaliente, barras de progreso clave y botones de acción primaria. |
| **#D99C00** | `hover:bg-amber-500`, `active:bg-amber-600` | Oro Canguro Oscurecido | Estados hover, transiciones y acentos interactivos para garantizar contraste accesible. |
| **#09090B** | `bg-zinc-950`, `text-zinc-950` | Negro Carbón Institucional | Encabezados de tablas maestras, barras de navegación principales, botones oscuros de confirmación y textos de máxima jerarquía. |
| **#18181B** | `bg-zinc-900`, `border-zinc-800` | Negro Neutro de Soporte | Tarjetas ejecutivas oscuras, fondos de drawer y elementos de alto contraste. |
| **#27272A - #71717A** | `zinc-800` a `zinc-500` | Escala de Grises Tipográficos | Etiquetas de campos, descripciones secundarias, timestamps, subtítulos y datos no críticos. |
| **#E4E4E7 - #F4F4F5** | `zinc-200`, `zinc-100`, `zinc-50` | Superficies y Bordes Suaves | Fondos de tarjetas, divisores de tablas, bordes de inputs y fondos alternos de filas. |
| **#FFFFFF** | `bg-white` | Lienzo Principal | Superficies de trabajo, contenedores de bloques y tarjetas ejecutivas. |

### 2.2. Colores Semánticos y Funcionales
- **Verde Éxito / Listo Inmediato (emerald):** Fondo `bg-emerald-50`, Borde `border-emerald-300`, Texto `text-emerald-950`, Acento `bg-emerald-600`. Uso: Estado completado, candidato idóneo para ascenso, indicador de reemplazo cubierto.
- **Ámbar Calibración / Tramo Óptimo (amber):** Fondo `bg-amber-50`, Borde `border-amber-300`, Texto `text-amber-950`, Acento `bg-amber-500`. Uso: Tramo central estándar Canguro, evaluaciones en proceso, alertas de calibración.
- **Rojo Alerta / PDI Correctivo (red):** Fondo `bg-red-50`, Borde `border-red-300`, Texto `text-red-950`, Acento `bg-red-600`. Uso: Tramo de Desempeño Incompleto, brechas críticas de competencias, plazo vencido.
- **Azul Dirección / Competencias Técnicas (blue):** Fondo `bg-blue-50`, Borde `border-blue-300`, Texto `text-blue-900`. Uso: Competencias funcionales por área y análisis técnico.
- **Púrpura Supervisión / Liderazgo (purple):** Fondo `bg-purple-50`, Borde `border-purple-300`, Texto `text-purple-900`. Uso: Competencias de mando, liderazgo y dirección de equipos.

### 2.3. Tipografía y Jerarquía Visual
- **Familia Sans-serif:** Sistema tipográfico nativo de alto rendimiento (`Inter`, `system-ui`, `-apple-system`).
- **Familia Monospace:** `font-mono` para cédulas de identidad (`V-18.452.910`), ponderaciones numéricas, porcentajes, tramos de percentil (`P97-P100`) e identificadores de reactivos (`b1_fn_1`).
- **Tratamiento Tipográfico:**
  - Títulos de Etapa: `text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-950`.
  - Subprocesos y Secciones: `text-sm sm:text-base font-bold text-zinc-900`.
  - Micro-etiquetas y Categorías: `text-[10px] sm:text-[11px] font-bold uppercase tracking-wider`.
  - Descripciones y textos de ayuda: `text-xs text-zinc-500 font-normal leading-relaxed`.

### 2.4. Filosofía y Experiencia de Usuario (UX)
- **Persistencia y Control:** El usuario maestro siempre tiene visibilidad de su posición en el flujo de 4 etapas mediante un menú lateral colapsable y el botón reactivo `← Volver a pestaña anterior`, que recuerda la pantalla previa visitada.
- **Acceso Condicional Libre de Saturación:** Las opciones que no aplican al colaborador seleccionado (como el Plan de Sucesión para colaboradores que no obtuvieron Desempeño Sobresaliente en la Guía de Mérito) se ocultan automáticamente del menú para no generar expectativas erróneas ni saturar la pantalla.
- **Micro-interacciones y Feedback Inmediato:** Transiciones suaves (`transition-all duration-200`), estados de copiado con confirmación visual de 2 segundos, y modales accesibles con cierre mediante tecla Esc o clic en el backdrop.

---

## 3. Distribución y Arquitectura del Gestor (Pipeline de 4 Etapas)
El panel principal (`AdminComparisonModule.tsx`) está estructurado como un Pipeline de Gobierno de Talento en 4 Etapas Secuenciales, accesible mediante un menú lateral con acordeones y vista optimizada para dispositivos móviles:

```
+===================================================================================+
|                    GESTOR DE TALENTO HUMANO — UNIVERSO CANGURO                    |
+===================================================================================+
| [Menú Desplegable] [Volver a Pestaña Anterior]           Usuario: Natalia Rodriguez|
+-----------------------------------------------------------------------------------+
|  ETAPA 1: CONFIGURACIÓN      --> Ficha, Modalidad (180°/360°/Promoción) y Enlaces |
|  ETAPA 2: CENTRO DE ENLACES  --> Despacho Oficial, Convocatoria y Notificaciones  |
|  ETAPA 3: EXPEDIENTE 360°    --> 9-Box, Curva de Gauss, Guía de Mérito, PDI,      |
|                                  Auditoría y Plan de Sucesión (Condicional)       |
|  ETAPA 4: AUDITORÍA EN VIVO  --> Monitoreo de Respuestas y Trazabilidad Forense   |
+===================================================================================+
```

### ETAPA 1: Configuración de la Evaluación (`config`)
Módulo responsable de parametrizar el perfil institucional del colaborador y seleccionar el alcance técnico de la medición.
- **Subproceso 1: Datos del Colaborador (`datos`):**
  - Registro de Nombre, Apellido, Cédula de Identidad (`V-XX.XXX.XXX`).
  - Selección del Cargo Actual (Director, Gerente, Supervisor, Coordinador, Responsable, Especialista, Analista, Operador Integral, Asesor Integral).
  - Asignación de la Dirección de adscripción y Departamento correspondiente.
- **Subproceso 2: Configuración de Evaluación (`configuracion`):**
  - Selección del tipo de proceso:
    - *Evaluación del Desempeño por Competencias:* Aplica alcance automático: 180° para personal sin personal a cargo (Autoevaluación, Jefe, Pares) o 360° para cargos con supervisión directa (+ Subordinados).
    - *Evaluación para Promoción y Ascensos (Concurso Interno):* Modalidad bilateral obligatoria (Postulante + Jefe Inmediato que postula) con incorporación del Test Big Five e idoneidad situacional.
  - Acceso al Diseñador y Editor de Formatos (`EvaluationFormatDesigner`): Permite personalizar reactivos, ponderaciones y rúbricas antes del despacho.
- **Subproceso 3: Envío del Enlace (`envio`):**
  - Generación de enlaces directos tokenizados para cada rol evaluador.
  - Botón de envío directo por correo electrónico mediante la API de Google Workspace / Gmail.
  - Botón de copiado al portapapeles con confirmación visual.

### ETAPA 2: Centro de Enlaces y Despacho Oficial (`links`)
Centro unificado para la emisión, verificación y control de apertura de los instrumentos de evaluación emitidos por la Dirección de Talento Humano.
- **Visualización clara de los roles requeridos para el colaborador:**
  - *Autoevaluación (Colaborador):* Acceso al formulario de metas y autopercepción.
  - *Evaluación del Supervisor Inmediato (Jefe):* Calificación jerárquica de metas y conductas.
  - *Evaluación de Pares (Colegas homólogos):* Calificación de sinergia, trabajo en equipo y soporte.
  - *Evaluación de Subordinados (Equipo a cargo):* Calificación confidencial del estilo de liderazgo y delegación.
- **Plantillas de convocatoria formal** con membrete institucional de la Gerencia de Formación y Desarrollo.

### ETAPA 3: Expediente y Resultados — Toma de Decisiones (`expediente`)
El núcleo analítico de la plataforma. Cuenta con una Barra Superior de Selección del Colaborador, que permite cambiar de evaluado y recalcular de forma reactiva todas las métricas en tiempo real.
- **Bloque 1: Expediente 360° y Matriz Nine-Box (`resumen`):**
  - Ficha Resumen Oficial: Calificación ponderada consolidada (60% Metas + 40% Competencias).
  - Radar Multidimensional de Competencias: Gráfico polar interactivo con Recharts que contrasta los puntajes observados en Competencias Cardinales, de Supervisión y Específicas del Área.
  - Matriz Nine-Box (9 Cajas de Talento): Posicionamiento automático del colaborador cruzando Desempeño Cuantitativo (Eje X) con Potencial Futuro (Eje Y). Define acciones de talento (Futura Estrella, Enigma, Especialista Clave, etc.).
  - Perfil Vocacional y Aspiracional (Modelo RIASEC): Extracción cualitativa de aspiraciones profesionales, motivadores intrínsecos y visión de legado en la organización.
  - Sub-vista de Promoción: Cuando la evaluación es para ascenso, este bloque conmuta automáticamente al Expediente de Promoción (`PromotionResultsView`), mostrando el dictamen de idoneidad emitido por el Comité de Ascensos.
- **Bloque 2: Comparativo Organizacional y Guía de Mérito (`calibracion`):**
  - Curva de Distribución Normal (Gaussiana): Representación matemática de la campana de Gauss centrada en la mediana corporativa (P50). Grafica la posición exacta del colaborador frente al promedio de su mismo cargo, su dirección y el promedio global del Universo Canguro.
  - Tabla Maestra de la Guía de Mérito: Desglose oficial de los 5 tramos evaluativos de la organización, detallando rango de puntos, percentiles, distribución objetivo, política de incrementos salariales y estrategia de desarrollo PDI.
  - Habilitador del Plan de Sucesión: En el Tramo 5 (Desempeño Sobresaliente $\ge 4.75$ pts), si el colaborador califica, la tabla muestra el badge de distinción y el botón "Ver en Plan de Sucesión". Si no califica, explica formalmente el motivo por el cual no se habilita dicho plan.
- **Bloque 3: Plan de Desarrollo Individual — PDI (`pdi`):**
  - Visualizador integral del modelo formativo 70-20-10.
  - Metas SMART acordadas formalmente entre el colaborador, su supervisor inmediato y la Dirección de Talento Humano.
  - Gráfico de Cumplimiento y Calibración: Control visual de avance de metas en escala porcentual (0% a 100%).
- **Bloque 4: Auditoría de Evaluaciones (`evaluaciones`):**
  - Visor ítem a ítem (`AuditEvaluationsViewer`) que expone todas las preguntas aplicadas en Bloque 1 (Metas) y Bloque 2 (Competencias).
  - Muestra el puntaje asignado por cada evaluador (Autoevaluación, Supervisor, Pares, Subordinados) y el puntaje consolidado.
  - Inspección de comentarios abiertos cualitativos ingresados durante el proceso de evaluación.
- **Bloque 5: Plan de Sucesión Ejecutiva (`sucesion`) — ACCESO CONDICIONAL:**
  - *Regla de Gobierno Estricta:* Este bloque se habilita en el menú lateral exclusivamente si dentro de los resultados en la Guía de Mérito se arrojó esta acción de talento humano (Tramo 5: Desempeño Sobresaliente $\ge 4.75$ pts). Si el colaborador pertenece a los Tramos 1 a 4, el bloque no se muestra en el menú ni puede ser accedido.
  - *Banco de Sucesores y Talento Clave:* Pool oficial de reemplazo nutrido automáticamente por colaboradores con desempeño $\ge 4.75$ pts.
  - *Matriz de Reemplazo en Posiciones Críticas:* Mapeo de puestos clave de la organización (Dirección de Operaciones, Gerencia de Operaciones Comerciales, Dirección de Tecnología).
  - *Restricción Institucional:* En la corporación nadie sube a Presidencia (cargo de los socios fundadores) y el puesto de "Dirección General" no existe; el escalafón ejecutivo culmina en Dirección de Área y Comité Ejecutivo.

### ETAPA 4: Monitoreo y Auditoría en Vivo (`audit`)
Panel de control para el seguimiento en tiempo real del ciclo evaluativo nacional.
- **Subproceso 1: Tablero de Avance Organizacional (`overview`):**
  - Métrica de porcentaje global de recepción de evaluaciones.
  - Tabla consolidada de colaboradores con estatus discriminado por instrumento (Auto, Sup, Pares, Sub).
  - Alertas automáticas para colaboradores pendientes o en proceso.
- **Subproceso 2: Auditoría Detallada Ítem a Ítem (`items`):**
  - Examen forense de reactivos, rúbricas aplicadas y consistencia evaluativa para detectar sesgos o calificaciones anómalas.

---

## 4. Escalas de Estimación, Rangos, Fórmulas y Márgenes

### 4.1. Escala Cuantitativa Base y Equivalencia Vigesimal
Todas las evaluaciones se registran en una escala de 1.00 a 5.00 puntos, homologada a escala vigesimal porcentual (0 a 100 puntos):
$$\text{Puntuación Base 100} = \left(\frac{\text{Score}}{5}\right) \times 100$$

### 4.2. Fórmula Oficial de Desempeño
$$\text{Calificación Consolidada} = (\text{Bloque 1: Metas} \times 0.60) + (\text{Bloque 2: Competencias} \times 0.40)$$
- **Bloque 1 (60%):** Cumplimiento de funciones y metas operativas cuantificables.
- **Bloque 2 (40%):** Dominio de competencias cardinales, de liderazgo y específicas del área.

### 4.3. Rúbrica de Madurez Conductual (Casos Situacionales de 4 Niveles)
| Opción | Calificación | Equivalente 100 | Nivel de Madurez | Descripción Conductual |
| :---: | :---: | :---: | :---: | :--- |
| **A** | 5.00 pts | 100 pts | Estratégico / Sobresaliente | Visión sistémica, anticipación a problemas, innovación y modelaje conductual de referencia. |
| **B** | 3.75 pts | 75 pts | Avanzado / Autónomo | Ejecución fluida, autónoma y consistente con apego riguroso al estándar esperado. |
| **C** | 2.50 pts | 50 pts | Intermedio / Estándar | Cumplimiento básico bajo supervisión habitual; requiere refuerzo en situaciones complejas. |
| **D** | 1.25 pts | 25 pts | Inicial / En Desarrollo | Desempeño dependiente de instrucciones directas; brechas visibles en autonomía y criterio. |

### 4.4. Guía de Mérito y Tramos Salariales (Curva Normal Canguro)
| Tramo | Denominación Oficial | Rango en Puntos (1-5) | Rango en Base 100 | Percentil | Población Objetivo | Política de Ajuste / Mérito | Estrategia de Desarrollo PDI y Acción de Talento Humano | ¿Habilita Sucesión? |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| **1** | DESEMPEÑO INCOMPLETO | $< 3.00$ | $< 60.0$ | P0 - P15 | 10% | 0% (Sin incremento ni bono) | Plan de Acción Correctivo (30-60 días): Clarificación estricta de KPI, tutoría semanal y reevaluación técnica. | NO |
| **2** | DESEMPEÑO PROMEDIO | 3.00 - 3.74 | 60.0 - 74.9 | P16 - P40 | 25% | 0% - 3.0% (Ajuste base inflación) | Plan de Consolidación y Fortalecimiento: Coaching focalizado en brechas, tutoría técnica y seguimiento quincenal. | NO |
| **3** | DESEMPEÑO ÓPTIMO | 3.75 - 4.24 | 75.0 - 84.9 | P41 - P75 | 35% | 3.5% - 6.0% (Ajuste estándar + Bono) | Plan de Continuidad y Desarrollo Continuo: Asignación de metas retadoras, fidelización y proyectos transversales. | NO |
| **4** | ALTO DESEMPEÑO | 4.25 - 4.74 | 85.0 - 94.9 | P76 - P95 | 20% | 6.5% - 9.0% (Incremento superior + Bono) | Plan de Aceleración y Liderazgo: Asignación a iniciativas estratégicas, mentoría ejecutiva y proyección de carrera. | NO |
| **5** | DESEMPEÑO SOBRESALIENTE | 4.75 - 5.00 | 95.0 - 100 | P96 - P100 | 10% | 10.0% - 15.0% (Incremento excepcional + Bono) | Plan de Retención Crítico y Sucesión Ejecutiva: Blindaje salarial, visibilidad en Junta y elegibilidad inmediata a reemplazos. | **SÍ (Exclusivo)** |

### 4.5. Matriz Nine-Box (9 Cajas de Talento)
```
POTENCIAL (Eje Y)
  Alto    | [ Enigma / Dilema ]      | [ Alto Potencial ]        | [ FUTURA ESTRELLA ]      |
(>= 4.25) | PDI en foco técnico      | Plan de Aceleración       | Plan Sucesión Ejecutiva  |
----------+--------------------------+---------------------------+--------------------------+
  Medio   | [ Profesional Efectivo ] | [ Contribuyente Clave ]   | [ Alto Rendimiento ]     |
(3.0-4.24)| Consolidación de rol     | Estabilidad y desarrollo  | Proyectos estratégicos   |
----------+--------------------------+---------------------------+--------------------------+
  Bajo    | [ Riesgo / Incompleto ]  | [ Especialista Sólido ]   | [ Confiable / Operativo ]|
 (< 3.00) | Plan de Mejora 30-60 días| Dominio técnico puntual   | Reconocimiento funcional |
          +--------------------------+---------------------------+--------------------------+
                    Bajo (< 3.00)          Medio (3.00 - 4.24)          Alto (>= 4.25)
                                    DESEMPEÑO CUANTITATIVO (Eje X)
```

### 4.6. Proceso Trifásico de Promociones y Concursos de Ascenso
- **Fase 1: Entrevista de Postulación y Madurez:** Comunicación asertiva, madurez emocional, orientación al logro y compatibilidad cultural. Evaluación psicométrica Big Five de 20 reactivos (Apertura, Responsabilidad, Extraversión, Amabilidad, Estabilidad Emocional).
- **Fase 2: Prueba Técnica Situacional (Gemini 3.8 Flash):** 5 preguntas situacionales complejas derivadas directamente del descriptor de cargo de la posición a la que aspira. Ponderación: Nivel A (5.00), Nivel B (3.75), Nivel C (2.50), Nivel D (1.25).
- **Fase 3: Dictamen de Idoneidad:**
  - $\ge 4.50$ pts: Candidato Altamente Idóneo / Prioritario para Promoción.
  - $3.75 - 4.49$ pts: Candidato Elegible / Apto para Promoción.
  - $< 3.75$ pts: En Desarrollo / Requiere Maduración Técnica.

---

## 5. Estructura del Código y Organización Técnica
```
.
├── server.ts                               # Servidor Express, proxy Gemini AI y Gmail API
├── index.html                              # Punto de entrada HTML con metadatos oficiales
├── package.json                            # Dependencias y scripts de construcción
├── metadata.json                           # Manifiesto y capacidades de la aplicación
├── tsconfig.json                           # Configuración del compilador TypeScript
├── vite.config.ts                          # Configuración de Vite y middlewares
├── DOCUMENTACION_PLATAFORMA.md             # Documentación exhaustiva maestra
├── README.md                               # Guía de bienvenida e inicio rápido
│
└── src/
    ├── main.tsx                            # Montaje del Virtual DOM
    ├── App.tsx                             # HashRouter y rutas de la plataforma
    ├── index.css                           # Configuración y directivas de Tailwind CSS
    ├── store.ts                            # Gestor de estado en localStorage y suscriptores
    ├── types.ts                            # Tipos TypeScript, preguntas base y Guía de Mérito
    ├── promotionQuestions.ts               # Banco de preguntas para concursos de ascenso
    │
    ├── pages/
    │   ├── Dashboard.tsx                   # Panel maestro de control y estadísticas
    │   └── Evaluate.tsx                    # Capturador oficial de evaluaciones (Self/Sup/Peer/Sub)
    │
    ├── components/
    │   ├── AdminComparisonModule.tsx       # Gestor principal de 4 etapas y toma de decisiones
    │   ├── EvaluationFormatDesigner.tsx    # Editor y diseñador visual de rúbricas y preguntas
    │   ├── PromotionResultsView.tsx        # Expediente de promoción, idoneidad y ascensos
    │   ├── PromotionPhasesManagerModal.tsx # Modal de gestión de las 3 fases de promoción
    │   ├── PromotionPhasesManagerView.tsx  # Vista completa de fases y entrevistas
    │   ├── EvaluationAuditView.tsx         # Monitoreo en vivo de avance de la organización
    │   ├── AuditEvaluationsViewer.tsx      # Auditoría detallada ítem a ítem con calificaciones
    │   ├── PsychometricDossierVisualizer.tsx# Visualizador del perfil psicométrico Big Five
    │   ├── PsychometricTestForm.tsx        # Cuestionario interactivo de los 20 reactivos Big Five
    │   ├── NineBox.tsx                     # Componente interactivo de la Matriz Nine-Box
    │   ├── NormalCurve.tsx                 # Gráfico matemático SVG de la Curva Gaussiana
    │   ├── PDI.tsx                         # Gestor del Plan de Desarrollo Individual (70-20-10)
    │   ├── PDIProgressChart.tsx            # Gráfico Recharts de cumplimiento de metas PDI
    │   ├── JobDescriptorModal.tsx          # Modal de carga de descriptores y análisis con IA
    │   ├── ProfileForm.tsx                 # Ficha y configuración rápida de colaborador
    │   ├── EvaluationProfileConfig.tsx     # Configurador exhaustivo de perfiles y formatos
    │   ├── RadarMetrics.tsx                # Gráfica polar de radar de competencias
    │   ├── SituationalEvalForm.tsx         # Formulario de reactivos situacionales
    │   ├── SelfEvalForm.tsx                # Formulario cualitativo y aspiracional RIASEC
    │   ├── EvalForm.tsx                    # Formulario estándar con carta de honestidad
    │   └── CanguroLogo.tsx                 # Isotipo oficial vectorial de El Canguro
    │
    ├── data/
    │   └── canguroUniverso.ts              # Base de datos oficial de colaboradores evaluados
    │
    └── utils/
        ├── documentParser.ts               # Lector de archivos (.txt, .pdf, .docx)
        ├── psychometricProcessor.ts        # Algoritmo de normalización e inversión Big Five
        ├── realEvaluationMetrics.ts        # Cálculo estricto de resultados reales no simulados
        └── scoreAlignment.ts               # Alineación de percentiles y curvas de calibración
```

---

## 6. Configuración, Despliegue y Variables de Entorno

### 6.1. Requisitos de Ejecución
- **Entorno:** Node.js 18.x o superior.
- **Gestor de paquetes:** npm 9.x o superior.
- **Puerto:** 3000.

### 6.2. Variables de Entorno (`.env.local` / `.env`)
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=tu_api_key_de_google_ai_studio
```

### 6.3. Comandos de Operación
```bash
# Instalación de dependencias
npm install

# Ejecución en desarrollo
npm run dev

# Verificación estricta de tipos y linters
npm run lint

# Construcción optimizada para producción
npm run build

# Puesta en marcha en producción
npm start
```

---

## 7. Políticas de Gobernanza y Privacidad
- **Confidencialidad Multifuente:** Las evaluaciones emitidas por pares y subordinados se consolidan aritméticamente para evitar la identificación individual del evaluador, garantizando la honestidad de la retroalimentación.
- **Inmutabilidad de Envíos:** Una vez que un evaluador presiona Confirmar y Enviar, el instrumento se bloquea y registra la marca temporal (`submittedAt`), impidiendo modificaciones posteriores.
- **Privacidad de Credenciales:** La llave de Inteligencia Artificial (`GEMINI_API_KEY`) opera exclusivamente en el microservicio backend (`server.ts`) y nunca viaja al navegador web del cliente.
- **Respeto a la Estructura Corporativa:** El sistema protege la jerarquía de DISTRICUEROS EL CANGURO, C.A.; no permite ascensos a Presidencia ni inventa figuras no contempladas en el organigrama oficial.

import { Question, BigFiveTrait } from './types';

export interface BigFiveItem {
  id: string;
  number: number;
  trait: BigFiveTrait;
  traitName: string;
  text: string;
  inverted: boolean;
}

// 20 Reactivos del Inventario Big Five calibrados para Districueros El Canguro
export const BIG_FIVE_20_ITEMS: BigFiveItem[] = [
  // Apertura a la Experiencia (Openness)
  { id: 'bf1', number: 1, trait: 'openness', traitName: 'Apertura a la Experiencia', text: 'Me interesa constantemente explorar nuevas metodologías de trabajo y herramientas tecnológicas para optimizar mi gestión diaria.', inverted: false },
  { id: 'bf2', number: 2, trait: 'openness', traitName: 'Apertura a la Experiencia', text: 'Prefiero ceñirme exclusivamente a procedimientos tradicionales y conocidos antes que probar fórmulas alternativas con incertidumbre.', inverted: true },
  { id: 'bf3', number: 3, trait: 'openness', traitName: 'Apertura a la Experiencia', text: 'Disfruto participando en sesiones creativas y proponiendo soluciones innovadoras a problemas complejos de la empresa.', inverted: false },
  { id: 'bf4', number: 4, trait: 'openness', traitName: 'Apertura a la Experiencia', text: 'Me incomoda cuando me asignan proyectos fuera de mi especialidad habitual o de mi zona de confort.', inverted: true },

  // Responsabilidad y Orientación al Logro (Conscientiousness)
  { id: 'bf5', number: 5, trait: 'conscientiousness', traitName: 'Responsabilidad / Disciplina', text: 'Planifico minuciosamente mis entregables y me aseguro de cumplir cada meta con altos estándares de calidad sin requerir supervisión.', inverted: false },
  { id: 'bf6', number: 6, trait: 'conscientiousness', traitName: 'Responsabilidad / Disciplina', text: 'En ocasiones tiendo a postergar actividades administrativas o de control interno que considero rutinarias.', inverted: true },
  { id: 'bf7', number: 7, trait: 'conscientiousness', traitName: 'Responsabilidad / Disciplina', text: 'Mantengo un orden riguroso en mis registros, bases de datos y documentación para facilitar auditorías y revisiones en cualquier momento.', inverted: false },
  { id: 'bf8', number: 8, trait: 'conscientiousness', traitName: 'Responsabilidad / Disciplina', text: 'A veces me resulta difícil mantener la concentración sostenida frente a metas que exigen plazos prolongados.', inverted: true },

  // Extraversión y Comunicación de Impacto (Extraversion)
  { id: 'bf9', number: 9, trait: 'extraversion', traitName: 'Extraversión / Energía Social', text: 'Tomo la iniciativa con entusiasmo para relacionarme con pares de otras áreas, proveedores y clientes en reuniones clave.', inverted: false },
  { id: 'bf10', number: 10, trait: 'extraversion', traitName: 'Extraversión / Energía Social', text: 'Prefiero trabajar de forma aislada e independiente antes que interactuar frecuentemente con equipos numerosos.', inverted: true },
  { id: 'bf11', number: 11, trait: 'extraversion', traitName: 'Extraversión / Energía Social', text: 'Transmito optimismo, seguridad y motivación a mis compañeros en momentos de alta exigencia operativa.', inverted: false },
  { id: 'bf12', number: 12, trait: 'extraversion', traitName: 'Extraversión / Energía Social', text: 'Me cuesta exponer mis argumentos o liderar presentaciones frente a directores y audiencias exigentes.', inverted: true },

  // Amabilidad y Cooperación (Agreeableness)
  { id: 'bf13', number: 13, trait: 'agreeableness', traitName: 'Amabilidad / Cooperación', text: 'Me preocupo genuinamente por apoyar el bienestar de mis compañeros y facilitar la resolución colaborativa de conflictos.', inverted: false },
  { id: 'bf14', number: 14, trait: 'agreeableness', traitName: 'Amabilidad / Cooperación', text: 'Considero que en el trabajo cada quien debe responder estrictamente por lo suyo sin involucrarse en las dificultades ajenas.', inverted: true },
  { id: 'bf15', number: 15, trait: 'agreeableness', traitName: 'Amabilidad / Cooperación', text: 'Escucho activamente las críticas y sugerencias de mejora con humildad y disposición constructiva.', inverted: false },
  { id: 'bf16', number: 16, trait: 'agreeableness', traitName: 'Amabilidad / Cooperación', text: 'Tienden a molestarme las personas que cuestionan mis decisiones técnicas o mis puntos de vista.', inverted: true },

  // Estabilidad Emocional / Resiliencia (Emotional Stability)
  { id: 'bf17', number: 17, trait: 'emotional_stability', traitName: 'Estabilidad Emocional', text: 'Mantengo la serenidad y la lucidez mental incluso bajo situaciones de alta presión o imprevistos de última hora.', inverted: false },
  { id: 'bf18', number: 18, trait: 'emotional_stability', traitName: 'Estabilidad Emocional', text: 'Suelo experimentar ansiedad o frustración notoria cuando los proyectos se desvían de la planificación original.', inverted: true },
  { id: 'bf19', number: 19, trait: 'emotional_stability', traitName: 'Estabilidad Emocional', text: 'Me recupero rápidamente ante fracasos temporales o desavenencias comerciales, reenfocándome en soluciones constructivas.', inverted: false },
  { id: 'bf20', number: 20, trait: 'emotional_stability', traitName: 'Estabilidad Emocional', text: 'El estrés acumulado por el ritmo diario suele alterar mi estado de ánimo o mi trato con el equipo de trabajo.', inverted: true },
];

// Preguntas Situacionales de Concurso de Promoción Interna (Rúbrica de 4 niveles calibrada)
export const PROMOTION_SITUATIONAL_QUESTIONS: Question[] = [
  {
    id: 'promo_q1',
    competency: 'Pensamiento Estratégico',
    category: 'board',
    text: 'Capacidad para anticipar impactos sistémicos y alinear las decisiones cotidianas con la sostenibilidad y rentabilidad del Universo Canguro.',
    situation: 'Como nuevo líder de área, la Dirección le solicita presentar un plan de optimización de costos que preserve al 100% la calidad del servicio al cliente y la satisfacción del equipo.',
    options: [
      { id: 'promo_q1_a', score: 5.0, levelLetter: 'A', levelLabel: 'Nivel Superior (5.0 pts)', text: 'Elaboro un diagnóstico de valor integrando datos operativos y financieros, elimino duplicidades procesales, digitalizo flujos y alineo al equipo como co-creadores del ahorro sin tocar incentivos.' },
      { id: 'promo_q1_b', score: 3.75, levelLetter: 'B', levelLabel: 'Nivel Alto (3.75 pts)', text: 'Reviso partidas presupuestarias, identifico mermas evidentes en insumos o servicios no esenciales y establezco controles de aprobación más estrictos en el departamento.' },
      { id: 'promo_q1_c', score: 2.50, levelLetter: 'C', levelLabel: 'Nivel Intermedio (2.50 pts)', text: 'Aplico un recorte lineal porcentual en todos los renglones y solicito al personal un esfuerzo mayor para trabajar con menos recursos disponibles.' },
      { id: 'promo_q1_d', score: 1.25, levelLetter: 'D', levelLabel: 'Nivel Mínimo (1.25 pts)', text: 'Manifiesto que recortar costos sin afectar el servicio es inviable y sugiero a la Dirección aplazar la meta presupuestaria para el siguiente ciclo.' }
    ]
  },
  {
    id: 'promo_q2',
    competency: 'Liderar con el Ejemplo',
    category: 'supervision',
    text: 'Capacidad para modelar estándares de excelencia, coherencia ética y movilizar el compromiso del equipo de colaboradores.',
    situation: 'Al asumir su nuevo cargo, detecta que dos integrantes históricos del equipo muestran desmotivación y resistencia tácita a los nuevos indicadores de gestión.',
    options: [
      { id: 'promo_q2_a', score: 5.0, levelLetter: 'A', levelLabel: 'Nivel Superior (5.0 pts)', text: 'Sostengo sesiones individuales 1 a 1 de escucha activa, comprendo sus expectativas, capitalizo su experiencia histórica asignándoles roles de mentores y pacto metas de reinvención con plazos claros.' },
      { id: 'promo_q2_b', score: 3.75, levelLetter: 'B', levelLabel: 'Nivel Alto (3.75 pts)', text: 'Aclaro los nuevos lineamientos en reunión de equipo, doy retroalimentación privada sobre los atrasos observados y brindo acompañamiento cercano para nivelar su desempeño.' },
      { id: 'promo_q2_c', score: 2.50, levelLetter: 'C', levelLabel: 'Nivel Intermedio (2.50 pts)', text: 'Superviso exhaustivamente cada entrega de estos colaboradores y emito reportes formales a Talento Humano cuando no alcanzan los KPI requeridos.' },
      { id: 'promo_q2_d', score: 1.25, levelLetter: 'D', levelLabel: 'Nivel Mínimo (1.25 pts)', text: 'Evito confrontaciones directas y prefiero reasignar las tareas estratégicas a los colaboradores más dóciles, esperando que los demás reaccionen por inercia.' }
    ]
  },
  {
    id: 'promo_q3',
    competency: 'Adaptabilidad y Flexibilidad',
    category: 'cardinal',
    text: 'Aplomo y criterio resolutivo para gestionar fallas operativas mayores garantizando la continuidad del negocio y el blindaje corporativo.',
    situation: 'Durante un cierre de mes comercial con alta afluencia de facturación, se produce una caída imprevista en el enlace de datos y la plataforma transaccional principal.',
    options: [
      { id: 'promo_q3_a', score: 5.0, levelLetter: 'A', levelLabel: 'Nivel Superior (5.0 pts)', text: 'Activo inmediatamente el protocolo de contingencia offline, coordino con IT la conmutación a enlace satelital de respaldo, comunico con serenidad a los clientes y garantizo la trazabilidad fiscal del 100% de operaciones.' },
      { id: 'promo_q3_b', score: 3.75, levelLetter: 'B', levelLabel: 'Nivel Alto (3.75 pts)', text: 'Notifico a la Gerencia de Tecnología el incidente, organizo al equipo para levantar órdenes manuales de forma ordenada y verifico que nadie detenga la atención al público.' },
      { id: 'promo_q3_c', score: 2.50, levelLetter: 'C', levelLabel: 'Nivel Intermedio (2.50 pts)', text: 'Instruyo pausar la atención en cajas hasta que el soporte técnico informe del restablecimiento de la conexión para no generar inconsistencias en el inventario.' },
      { id: 'promo_q3_d', score: 1.25, levelLetter: 'D', levelLabel: 'Nivel Mínimo (1.25 pts)', text: 'Entro en estado de alarma, reclamo intensamente al equipo de soporte por la vulnerabilidad y espero instrucciones directas del Director del área.' }
    ]
  },
  {
    id: 'promo_q4',
    competency: 'Negociación Comercial',
    category: 'area_sales',
    text: 'Habilidad para alinear intereses contrapuestos, construir acuerdos ganar-ganar y generar rentabilidad sostenible para la organización.',
    situation: 'El área de Logística y el área Comercial mantienen una discrepancia severa respecto a la priorización de rutas de despacho y abastecimiento en tiendas clave.',
    options: [
      { id: 'promo_q4_a', score: 5.0, levelLetter: 'A', levelLabel: 'Nivel Superior (5.0 pts)', text: 'Convoco una mesa de trabajo basada en datos de rotación y margen bruto de tienda, diseño un modelo predictivo de despacho compartido y establezco un SLA de mutuo beneficio que eleva la venta total.' },
      { id: 'promo_q4_b', score: 3.75, levelLetter: 'B', levelLabel: 'Nivel Alto (3.75 pts)', text: 'Facilito un diálogo equilibrado entre ambas partes, negocio concesiones mutuas en horarios de despacho y levanto una minuta de compromisos supervisados.' },
      { id: 'promo_q4_c', score: 2.50, levelLetter: 'C', levelLabel: 'Nivel Intermedio (2.50 pts)', text: 'Escalo la disputa al Comité Ejecutivo para que sea la Dirección de Operaciones quien decida unilateralmente cuál criterio debe prevalecer.' },
      { id: 'promo_q4_d', score: 1.25, levelLetter: 'D', levelLabel: 'Nivel Mínimo (1.25 pts)', text: 'Defiendo ciegamente la postura de mi departamento de origen y desestimo las razones técnicas de la contraparte.' }
    ]
  },
  {
    id: 'promo_q5',
    competency: 'Auditoría de Procesos',
    category: 'area_control',
    text: 'Apego irrestricto al control interno, evaluación sistemática de riesgos y protección activa del patrimonio de DISTRICUEROS EL CANGURO, C.A.',
    situation: 'Descubre que un procedimiento administrativo comúnmente aceptado en una sucursal omite una validación de control interno para agilizar tiempos de venta.',
    options: [
      { id: 'promo_q5_a', score: 5.0, levelLetter: 'A', levelLabel: 'Nivel Superior (5.0 pts)', text: 'Detengo la práctica irregular de inmediato con tacto pero con firmeza ética, audito el impacto retroactivo, rediseño el proceso para mantener la velocidad con control total y reporto la mejora a Control Interno.' },
      { id: 'promo_q5_b', score: 3.75, levelLetter: 'B', levelLabel: 'Nivel Alto (3.75 pts)', text: 'Advierto al encargado de la sucursal sobre el riesgo normativo, corrijo la desviación operativa en el acto y registro la incidencia en el informe mensual.' },
      { id: 'promo_q5_c', score: 2.50, levelLetter: 'C', levelLabel: 'Nivel Intermedio (2.50 pts)', text: 'Tolero la práctica temporalmente si no se evidencia daño patrimonial directo y consulto informalmente a mi jefe si amerita formalizar un reparo.' },
      { id: 'promo_q5_d', score: 1.25, levelLetter: 'D', levelLabel: 'Nivel Mínimo (1.25 pts)', text: 'Decido no intervenir ya que "siempre se ha hecho así" y modificarlo podría perjudicar las cifras de facturación del período.' }
    ]
  }
];

// Preguntas del Cuestionario RIASEC Vocacional
export const RIASEC_QUESTIONS = [
  { id: 'riasec_1', dimension: 'realistic', label: 'Realista / Técnico', question: 'Disfruto manipular equipos, coordinar inventarios físicos, verificar especificaciones de materiales y asegurar la calidad tangible del producto.' },
  { id: 'riasec_2', dimension: 'investigative', label: 'Investigativo / Analítico', question: 'Me apasiona analizar bases de datos, estudiar patrones de compra, descubrir causas de fallas y plantear hipótesis de optimización matemática.' },
  { id: 'riasec_3', dimension: 'artistic', label: 'Artístico / Creativo', question: 'Me motiva diseñar exhibiciones visuales innovadoras en tiendas, elaborar presentaciones ejecutivas impactantes y crear nuevas experiencias para el cliente.' },
  { id: 'riasec_4', dimension: 'social', label: 'Social / Pedagógico', question: 'Siento gran satisfacción capacitando a nuevos ingresos, brindando retroalimentación formativa y ayudando a resolver necesidades humanas del equipo.' },
  { id: 'riasec_5', dimension: 'enterprising', label: 'Emprendedor / Negociador', question: 'Me entusiasma liderar negociaciones comerciales agresivas, asumir retos de ventas ambiciosos y movilizar a la gente hacia el logro de resultados.' },
  { id: 'riasec_6', dimension: 'conventional', label: 'Convencional / Estructurado', question: 'Valoro el apego a normativas de control interno, la auditoría sistemática de procesos, la exactitud contable y el cumplimiento de cronogramas.' },
];

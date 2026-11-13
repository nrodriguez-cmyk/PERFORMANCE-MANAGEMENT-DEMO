/**
 * MODELO OFICIAL DE EVALUACIÓN DE POTENCIAL Y LIDERAZGO (SECCIÓN 3)
 * Universo Canguro — Dirección de Talento Humano
 * 
 * 6 Dimensiones Oficiales y 18 Reactivos Contrapuestos (Escala 1 a 5)
 * Ponderación Global:
 * 1. Agilidad Mental (Reactivos 1, 2, 3) - 20%
 * 2. Agilidad de Personas (Reactivos 4, 5, 6) - 20%
 * 3. Agilidad ante el Cambio (Reactivos 7, 8, 9) - 20%
 * 4. Agilidad de Resultados (Reactivos 10, 11, 12) - 15%
 * 5. Aspiración y Motivación (Reactivos 13, 14, 15) - 15%
 * 6. Autoconocimiento y Resiliencia (Reactivos 16, 17, 18) - 10%
 */

export interface PotentialItem {
  id: string; // 'pot_1' .. 'pot_18'
  number: number; // 1 .. 18
  dimensionId: PotentialDimensionId;
  leftText: string;
  rightText: string;
}

export type PotentialDimensionId =
  | 'agilidad_mental'
  | 'agilidad_personas'
  | 'agilidad_cambio'
  | 'agilidad_resultados'
  | 'aspiracion_motivacion'
  | 'autoconocimiento_resiliencia';

export interface PotentialDimensionMeta {
  id: PotentialDimensionId;
  name: string;
  weight: number; // 0.20, 0.15, 0.10
  itemNumbers: number[];
  description: string;
  iconName: string;
}

export const POTENTIAL_DIMENSIONS: Record<PotentialDimensionId, PotentialDimensionMeta> = {
  agilidad_mental: {
    id: 'agilidad_mental',
    name: 'Agilidad Mental',
    weight: 0.20,
    itemNumbers: [1, 2, 3],
    description: 'Capacidad para procesar información compleja, pensar estratégicamente y encontrar soluciones en situaciones ambiguas.',
    iconName: 'Brain'
  },
  agilidad_personas: {
    id: 'agilidad_personas',
    name: 'Agilidad de Personas',
    weight: 0.20,
    itemNumbers: [4, 5, 6],
    description: 'Habilidad para conectar con personas diversas, construir redes colaborativas e influir constructivamente.',
    iconName: 'Users'
  },
  agilidad_cambio: {
    id: 'agilidad_cambio',
    name: 'Agilidad ante el Cambio',
    weight: 0.20,
    itemNumbers: [7, 8, 9],
    description: 'Apertura hacia nuevas metodologías, tolerancia a la incertidumbre y rápida adaptación ante virajes del negocio.',
    iconName: 'RefreshCw'
  },
  agilidad_resultados: {
    id: 'agilidad_resultados',
    name: 'Agilidad de Resultados',
    weight: 0.15,
    itemNumbers: [10, 11, 12],
    description: 'Enfoque y entrega de resultados sobresalientes en contextos de presión, superando obstáculos e inspirando al equipo.',
    iconName: 'Target'
  },
  aspiracion_motivacion: {
    id: 'aspiracion_motivacion',
    name: 'Aspiración y Motivación',
    weight: 0.15,
    itemNumbers: [13, 14, 15],
    description: 'Deseo activo de crecimiento, asunción de proyectos estratégicos y búsqueda de liderazgo formal en la organización.',
    iconName: 'TrendingUp'
  },
  autoconocimiento_resiliencia: {
    id: 'autoconocimiento_resiliencia',
    name: 'Autoconocimiento y Resiliencia',
    weight: 0.10,
    itemNumbers: [16, 17, 18],
    description: 'Madurez emocional, aceptación constructiva de críticas, identificación de puntos ciegos y responsabilidad personal.',
    iconName: 'ShieldCheck'
  }
};

export const POTENTIAL_SCALE_OPTIONS = [
  { value: 1, label: 'Totalmente identificado con la frase de la izquierda', shortLabel: 'Total Izq.' },
  { value: 2, label: 'Más cercano a la frase de la izquierda', shortLabel: 'Cercano Izq.' },
  { value: 3, label: 'Situación intermedia / Depende del contexto', shortLabel: 'Intermedio' },
  { value: 4, label: 'Más cercano a la frase de la derecha', shortLabel: 'Cercano Der.' },
  { value: 5, label: 'Totalmente identificado con la frase de la derecha', shortLabel: 'Total Der.' }
];

export const POTENTIAL_INSTRUCTIONS_HEADER =
  'A continuación, encontrará una serie de escenarios sobre estilos de trabajo. En cada pregunta se presentan dos afirmaciones que representan diferentes formas de trabajar. Ninguna opción es correcta o incorrecta. Seleccione en la escala central cuál de las dos frases describe mejor su comportamiento habitual.';

export const POTENTIAL_18_ITEMS: PotentialItem[] = [
  // Agilidad Mental (Reactivos 1, 2, 3)
  {
    id: 'pot_1',
    number: 1,
    dimensionId: 'agilidad_mental',
    leftText: 'Me siento más cómodo trabajando con procesos claros, datos concretos y tareas bien definidas.',
    rightText: 'Disfruto analizar situaciones ambiguas, donde hay poca información y debo identificar la solución desde cero.'
  },
  {
    id: 'pot_2',
    number: 2,
    dimensionId: 'agilidad_mental',
    leftText: 'Ante un problema complejo, prefiero profundizar en los detalles técnicos de mi área para resolverlo.',
    rightText: 'Ante un problema complejo, prefiero conectar ideas de distintas áreas o procesos para encontrar patrones generales.'
  },
  {
    id: 'pot_3',
    number: 3,
    dimensionId: 'agilidad_mental',
    leftText: 'Priorizo la precisión operativa y la correcta ejecución del plan trazado.',
    rightText: 'Constantemente cuestiono el estado actual de las cosas para proponer alternativas distintas de trabajo.'
  },

  // Agilidad de Personas (Reactivos 4, 5, 6)
  {
    id: 'pot_4',
    number: 4,
    dimensionId: 'agilidad_personas',
    leftText: 'Al defender una propuesta, me baso exclusivamente en la lógica, las cifras y los argumentos técnicos.',
    rightText: 'Al defender una propuesta, adapto mi mensaje según los intereses, motivaciones y perfil de mi interlocutor.'
  },
  {
    id: 'pot_5',
    number: 5,
    dimensionId: 'agilidad_personas',
    leftText: 'Enfoco mi energía en cumplir mis metas individuales y coordinar lo estrictamente necesario con mi equipo directo.',
    rightText: 'Dedico tiempo a construir redes de colaboración con personas de otros departamentos, más allá de mis tareas diarias.'
  },
  {
    id: 'pot_6',
    number: 6,
    dimensionId: 'agilidad_personas',
    leftText: 'Considero que la mejor forma de avanzar en los proyectos es respetando los roles y la jerarquía formal.',
    rightText: 'Busco influir y lograr acuerdos mediante la negociación y la empatía, independientemente del nivel jerárquico.'
  },

  // Agilidad ante el Cambio (Reactivos 7, 8, 9)
  {
    id: 'pot_7',
    number: 7,
    dimensionId: 'agilidad_cambio',
    leftText: 'Prefiero trabajar en entornos estables donde los objetivos y las prioridades se mantienen constantes a lo largo del tiempo.',
    rightText: 'Me adapto con facilidad cuando las prioridades del negocio cambian drásticamente de un momento a otro.'
  },
  {
    id: 'pot_8',
    number: 8,
    dimensionId: 'agilidad_cambio',
    leftText: 'Valoro perfeccionar y mantener los procedimientos que ya han demostrado ser exitosos en la empresa.',
    rightText: 'Me entusiasma probar nuevas metodologías o tecnologías, asumiendo el riesgo de que los primeros intentos fallen.'
  },
  {
    id: 'pot_9',
    number: 9,
    dimensionId: 'agilidad_cambio',
    leftText: 'Prefiero culminar un proyecto bajo el alcance original antes de introducir modificaciones a mitad de camino.',
    rightText: 'Ajusto el rumbo de un proyecto de inmediato si detecto que las condiciones del entorno han cambiado.'
  },

  // Agilidad de Resultados (Reactivos 10, 11, 12)
  {
    id: 'pot_10',
    number: 10,
    dimensionId: 'agilidad_resultados',
    leftText: 'Para garantizar un resultado de calidad, requiero contar con tiempo suficiente y planificación adecuada.',
    rightText: 'Me mantengo enfocado y entrego resultados incluso en situaciones de alta presión, urgencia o escasez de recursos.'
  },
  {
    id: 'pot_11',
    number: 11,
    dimensionId: 'agilidad_resultados',
    leftText: 'Frente a un obstáculo grave, detengo el proceso para reevaluar los riesgos y no desviarme del presupuesto o norma.',
    rightText: 'Frente a un obstáculo grave, busco rutas alternativas inmediatas para no perder el ritmo de entrega del objetivo.'
  },
  {
    id: 'pot_12',
    number: 12,
    dimensionId: 'agilidad_resultados',
    leftText: 'Disfruto ejecutar directamente las tareas para asegurarme de que cumplan con los estándares requeridos.',
    rightText: 'Disfruto movilizar, coordinar e inspirar a otros para alcanzar metas retadoras de manera conjunta.'
  },

  // Aspiración y Motivación (Reactivos 13, 14, 15)
  {
    id: 'pot_13',
    number: 13,
    dimensionId: 'aspiracion_motivacion',
    leftText: 'Mi meta principal es consolidarme como un experto de referencia en mi disciplina técnica o funcional.',
    rightText: 'Mi meta principal es ascender hacia posiciones de liderazgo con mayor gente a cargo y responsabilidad sobre el negocio.'
  },
  {
    id: 'pot_14',
    number: 14,
    dimensionId: 'aspiracion_motivacion',
    leftText: 'Prefiero mantener un volumen de trabajo manejable que me permita dominar mi rol actual con tranquilidad.',
    rightText: 'Busco activamente proyectos de alta visibilidad estratégica que me saquen de mi zona de confort habitual.'
  },
  {
    id: 'pot_15',
    number: 15,
    dimensionId: 'aspiracion_motivacion',
    leftText: 'Me motiva principalmente perfeccionar las métricas de rendimiento y la calidad del trabajo diario en mi puesto.',
    rightText: 'Me motiva buscar espacios de retroalimentación, mentoría y preparación para asumir mi siguiente escalón profesional.'
  },

  // Autoconocimiento y Resiliencia (Reactivos 16, 17, 18)
  {
    id: 'pot_16',
    number: 16,
    dimensionId: 'autoconocimiento_resiliencia',
    leftText: 'Ante una crítica sobre mi desempeño, tiendo a explicar y fundamentar las razones de mi accionar.',
    rightText: 'Ante una crítica sobre mi desempeño, identifico de inmediato mis puntos ciegos y realizo ajustes a mi conducta.'
  },
  {
    id: 'pot_17',
    number: 17,
    dimensionId: 'autoconocimiento_resiliencia',
    leftText: 'Considero que el fracaso de una meta suele deberse a factores externos impredecibles del entorno o del equipo.',
    rightText: 'Asumo la responsabilidad personal de los errores colectivos y busco soluciones sin buscar culpables.'
  },
  {
    id: 'pot_18',
    number: 18,
    dimensionId: 'autoconocimiento_resiliencia',
    leftText: 'Dedico la mayor parte de mi tiempo a resolver las demandas inmediatas y prioritarias del día a día.',
    rightText: 'Dedico tiempo de forma recurrente a analizar tendencias del mercado e impacto del negocio a largo plazo (2 a 5 años).'
  }
];

/**
 * Obtiene el encabezado de instrucciones ajustado al rol del evaluador
 */
export function getPotentialInstructionsHeader(role: 'self' | 'supervisor' | 'peer' | 'subordinate' | string = 'self'): string {
  const r = (role || '').toLowerCase();
  if (r.includes('superv')) {
    return 'A continuación, evalúe el potencial y liderazgo de su líder o supervisor inmediato. En cada reactivo seleccione en la escala central cuál de las dos afirmaciones describe con mayor fidelidad la conducta, estilo de trabajo y capacidad de liderazgo de su líder.';
  }
  if (r.includes('peer') || r.includes('par')) {
    return 'A continuación, evalúe a su compañero de trabajo. En cada reactivo seleccione en la escala central cuál de las dos afirmaciones describe con mayor fidelidad la conducta, iniciativa y estilo de colaboración de su compañero.';
  }
  if (r.includes('subord') || r.includes('equipo')) {
    return 'A continuación, evalúe al colaborador. En cada reactivo seleccione en la escala central cuál de las dos afirmaciones describe con mayor fidelidad el desempeño observable, potencial y estilo de trabajo del colaborador.';
  }
  return POTENTIAL_INSTRUCTIONS_HEADER;
}

/**
 * Retorna los 18 reactivos oficiales de Potencial y Liderazgo modulados gramaticalmente según el rol:
 * - Autoevaluación: Primera persona ("Me siento...", "Disfruto...")
 * - Evaluación del Supervisor Inmediato: Redactada hacia el líder ("Mi líder...", "Mi supervisor...")
 * - Evaluación de Pares: Redactada hacia los colegas ("Mi compañero...")
 * - Evaluación de Subordinados: Redactada hacia el colaborador ("El colaborador...")
 */
export function getPotentialItemsForRole(role: 'self' | 'supervisor' | 'peer' | 'subordinate' | string = 'self'): PotentialItem[] {
  const r = (role || '').toLowerCase();
  const isSupervisorRole = r.includes('superv');
  const isPeerRole = r.includes('peer') || r.includes('par');
  const isSubordinateRole = r.includes('subord') || r.includes('equipo');

  if (!isSupervisorRole && !isPeerRole && !isSubordinateRole) {
    return POTENTIAL_18_ITEMS;
  }

  const prefix = isSupervisorRole 
    ? 'Mi líder' 
    : isPeerRole 
    ? 'Mi compañero' 
    : 'El colaborador';

  return [
    {
      id: 'pot_1',
      number: 1,
      dimensionId: 'agilidad_mental',
      leftText: `${prefix} se siente más cómodo trabajando con procesos claros, datos concretos y tareas bien definidas.`,
      rightText: `${prefix} disfruta analizar situaciones ambiguas, donde hay poca información y debe identificar la solución desde cero.`
    },
    {
      id: 'pot_2',
      number: 2,
      dimensionId: 'agilidad_mental',
      leftText: `Ante un problema complejo, ${prefix.toLowerCase()} prefiere profundizar en los detalles técnicos de su área para resolverlo.`,
      rightText: `Ante un problema complejo, ${prefix.toLowerCase()} conecta ideas de distintas áreas o procesos para encontrar soluciones integrales.`
    },
    {
      id: 'pot_3',
      number: 3,
      dimensionId: 'agilidad_mental',
      leftText: `${prefix} prioriza la precisión operativa y la correcta ejecución del plan trazado.`,
      rightText: `${prefix} constantemente cuestiona el estado actual de los procesos para proponer alternativas distintas y mejores de trabajo.`
    },
    {
      id: 'pot_4',
      number: 4,
      dimensionId: 'agilidad_personas',
      leftText: `Al defender una propuesta, ${prefix.toLowerCase()} se basa exclusivamente en la lógica, las cifras y los argumentos técnicos.`,
      rightText: `Al defender una propuesta, ${prefix.toLowerCase()} adapta su mensaje según los intereses, motivaciones y perfil de su interlocutor.`
    },
    {
      id: 'pot_5',
      number: 5,
      dimensionId: 'agilidad_personas',
      leftText: `${prefix} enfoca su energía en cumplir las metas específicas y coordinar lo estrictamente necesario con su entorno directo.`,
      rightText: `${prefix} dedica tiempo a construir redes activas de colaboración con personas de otros departamentos, más allá de las tareas del día.`
    },
    {
      id: 'pot_6',
      number: 6,
      dimensionId: 'agilidad_personas',
      leftText: `${prefix} considera que la mejor forma de avanzar en los proyectos es apoyándose estrictamente en la jerarquía y roles formales.`,
      rightText: `${prefix} busca influir y lograr acuerdos mediante la negociación constructiva y la empatía, independientemente de los niveles jerárquicos.`
    },
    {
      id: 'pot_7',
      number: 7,
      dimensionId: 'agilidad_cambio',
      leftText: `${prefix} prefiere trabajar en entornos estables donde los objetivos y las prioridades se mantengan constantes.`,
      rightText: `${prefix} se adapta con facilidad cuando las prioridades del negocio o del área cambian drásticamente de un momento a otro.`
    },
    {
      id: 'pot_8',
      number: 8,
      dimensionId: 'agilidad_cambio',
      leftText: `${prefix} valora perfeccionar y mantener los procedimientos que ya han demostrado ser exitosos en la empresa.`,
      rightText: `${prefix} promueve probar nuevas metodologías o tecnologías, asumiendo con madurez el riesgo de los primeros intentos.`
    },
    {
      id: 'pot_9',
      number: 9,
      dimensionId: 'agilidad_cambio',
      leftText: `${prefix} prefiere culminar las tareas bajo el alcance original antes de introducir modificaciones a mitad de camino.`,
      rightText: `${prefix} ajusta el rumbo de inmediato si detecta que las condiciones del entorno o de la operación han cambiado.`
    },
    {
      id: 'pot_10',
      number: 10,
      dimensionId: 'agilidad_resultados',
      leftText: `Para garantizar un resultado de calidad, ${prefix.toLowerCase()} requiere contar con tiempo suficiente y planificación holgada.`,
      rightText: `${prefix} se mantiene enfocado y entrega resultados sobresalientes incluso en situaciones de alta presión, urgencia o recursos limitados.`
    },
    {
      id: 'pot_11',
      number: 11,
      dimensionId: 'agilidad_resultados',
      leftText: `Frente a un obstáculo imprevisto, ${prefix.toLowerCase()} detiene el proceso para reevaluar los riesgos antes de continuar.`,
      rightText: `Frente a un obstáculo imprevisto, ${prefix.toLowerCase()} busca rutas alternativas inmediatas para no perder el ritmo de entrega de la meta.`
    },
    {
      id: 'pot_12',
      number: 12,
      dimensionId: 'agilidad_resultados',
      leftText: `${prefix} prefiere ejecutar directamente las tareas para asegurarse de que cumplan con los estándares requeridos.`,
      rightText: `${prefix} sabe movilizar, coordinar e inspirar al equipo para alcanzar metas retadoras de manera conjunta.`
    },
    {
      id: 'pot_13',
      number: 13,
      dimensionId: 'aspiracion_motivacion',
      leftText: `El enfoque principal de ${prefix.toLowerCase()} es consolidarse como un especialista técnico de referencia en su disciplina.`,
      rightText: `${prefix} demuestra una clara aspiración por asumir posiciones de mayor liderazgo formal, alcance estratégico y responsabilidad sobre personas.`
    },
    {
      id: 'pot_14',
      number: 14,
      dimensionId: 'aspiracion_motivacion',
      leftText: `${prefix} prefiere mantener una rutina manejable que le permita asegurar los procesos habituales con tranquilidad.`,
      rightText: `${prefix} busca activamente involucrarse en proyectos de visibilidad estratégica que le exijan salir de su zona de confort.`
    },
    {
      id: 'pot_15',
      number: 15,
      dimensionId: 'aspiracion_motivacion',
      leftText: `${prefix} prefiere asumir nuevas responsabilidades únicamente cuando domina con total certeza los aspectos técnicos del puesto.`,
      rightText: `${prefix} demuestra disposición para asumir responsabilidades y liderar retos en áreas nuevas, aprendiendo con agilidad sobre la marcha.`
    },
    {
      id: 'pot_16',
      number: 16,
      dimensionId: 'autoconocimiento_resiliencia',
      leftText: `Ante una observación sobre su desempeño, ${prefix.toLowerCase()} tiende a justificar y fundamentar las razones de su accionar.`,
      rightText: `Ante una observación sobre su desempeño, ${prefix.toLowerCase()} identifica de inmediato oportunidades de mejora y realiza ajustes con madurez.`
    },
    {
      id: 'pot_17',
      number: 17,
      dimensionId: 'autoconocimiento_resiliencia',
      leftText: `${prefix} tiende a atribuir el no cumplimiento de una meta a factores externos del entorno o de otros equipos.`,
      rightText: `${prefix} asume con total entereza la responsabilidad de los resultados y promueve soluciones constructivas sin buscar culpables.`
    },
    {
      id: 'pot_18',
      number: 18,
      dimensionId: 'autoconocimiento_resiliencia',
      leftText: `${prefix} concentra la mayor parte de su tiempo en resolver las demandas inmediatas y operativas del día a día.`,
      rightText: `${prefix} demuestra visión de mediano y largo plazo, anticipando tendencias y planificando el impacto futuro del área.`
    }
  ];
}

export interface DimensionResult {
  id: PotentialDimensionId;
  name: string;
  weight: number;
  averageScore: number; // 1.00 - 5.00
  percentage: number; // 0 - 100%
  contributionToY: number; // averageScore * weight
  level: 'Bajo' | 'Medio' | 'Alto';
  isPriorityGap: boolean; // score < 3.0
  description: string;
}

export interface PotentialLeadershipResults {
  isComplete: boolean;
  answeredCount: number;
  totalItems: number;
  dimensions: Record<PotentialDimensionId, DimensionResult>;
  dimensionList: DimensionResult[];
  yScore: number; // 1.00 - 5.00
  yLevel: 'Bajo' | 'Medio' | 'Alto';
  yLevelDescription: string;
  isAllAbove38: boolean;
  priorityGaps: DimensionResult[];
  radarData: Array<{ dimension: string; score: number; fullMark: number }>;
  recommendedPdiActions: string[];
}

export function getPotentialLevel(score: number): 'Bajo' | 'Medio' | 'Alto' {
  if (score >= 3.90) return 'Alto';
  if (score >= 2.50) return 'Medio';
  return 'Bajo';
}

export const NINE_BOX_QUADRANT_PDI_ACTIONS: Record<string, { title: string; strategy: string; actions: string[] }> = {
  'Alto-Alto': {
    title: 'Estrella / Top Talent',
    strategy: 'Ruta de Alta Aceleración y Sucesión Estratégica',
    actions: [
      'Inclusión inmediata en el Banco de Sucesión para cargos directivos y gerenciales.',
      'Asignación del liderazgo de proyectos corporativos de innovación y transformación.',
      'Sombra ejecutiva (Executive Shadowing) y mentoría con Miembros de Junta Directiva.',
      'Blindaje de retención y revisión de paquete de compensación total.'
    ]
  },
  'Alto-Medio': {
    title: 'Alto Potencial / Líder en Potencia',
    strategy: 'Desarrollo de Competencias de Liderazgo y Expansión',
    actions: [
      'Liderazgo de comités interdepartamentales y proyectos transversales.',
      'Coaching individual orientado a modelaje del liderazgo y gestión de personas.',
      'Asignación de metas desafiantes con visibilidad ejecutiva.',
      'Candidato prioritario a promociones a corto plazo (6 a 12 meses).'
    ]
  },
  'Alto-Bajo': {
    title: 'Enigma / Talento Emergente',
    strategy: 'Estabilización Operativa y Enfoque de Resultados',
    actions: [
      'Clarificación estricta de prioridades y alineación de objetivos a corto plazo.',
      'Emparejamiento con un mentor de alto rendimiento operativo.',
      'Monitoreo quincenal de avances y eliminación de cuellos de botella.',
      'Evaluación de motivación y compatibilidad con el puesto actual.'
    ]
  },
  'Medio-Alto': {
    title: 'Profesional Clave / Pilar de Rendimiento',
    strategy: 'Fortalecimiento de Agilidad y Pensamiento Estratégico',
    actions: [
      'Involucramiento gradual en la toma de decisiones estratégicas de su área.',
      'Formación en agilidad ante el cambio, negociación e influencia.',
      'Asignación de liderazgo en iniciativas de optimización de procesos.',
      'Preparación de cuadros de reemplazo para posiciones de coordinación.'
    ]
  },
  'Medio-Medio': {
    title: 'Contribuidor Sólido / Núcleo Operativo',
    strategy: 'Consolidación de Estándares y Rutas de Especialización',
    actions: [
      'Capacitación continua en competencias técnicas específicas.',
      'Refuerzo de retroalimentación constructiva sobre áreas de mejora clave.',
      'Participación en proyectos departamentales para ampliar visión del negocio.',
      'Establecimiento de planes de carrera técnica y rotación funcional.'
    ]
  },
  'Medio-Bajo': {
    title: 'Dilema de Desempeño',
    strategy: 'Diagnóstico de Obstáculos y Reentrenamiento',
    actions: [
      'Revisión minuciosa de cargas de trabajo y herramientas tecnológicas asignadas.',
      'Reentrenamiento en procedimientos estándar operativos (SOP).',
      'Asignación de un compañero tutor para soporte diario.',
      'Entrevista de alineación y clima con Gestión Humana.'
    ]
  },
  'Bajo-Alto': {
    title: 'Especialista Técnico / Maestro',
    strategy: 'Preservación de Conocimiento Crítico y Excelencia Técnica',
    actions: [
      'Consolidación en la carrera técnica sin forzar responsabilidades de supervisión.',
      'Participación en la elaboración de manuales y normativas corporativas.',
      'Incentivos vinculados a la calidad técnica y exactitud operativa.',
      'Autonomía en la ejecución de tareas de alta complejidad técnica.'
    ]
  },
  'Bajo-Medio': {
    title: 'Efectivo / Operador Estable',
    strategy: 'Supervisión Estructurada y Estandarización',
    actions: [
      'Supervisión directa para garantizar consistencia en la ejecución diaria.',
      'Capacitación en control de errores y prevención de pérdidas/mermas.',
      'Clarificación de estándares mínimos de rendimiento esperados.',
      'Monitoreo trimestral de estabilidad laboral.'
    ]
  },
  'Bajo-Bajo': {
    title: 'En Riesgo / Bajo Rendimiento',
    strategy: 'Plan de Mejora del Desempeño (PIP) Formal',
    actions: [
      'Implementación obligatoria de Plan de Mejora del Desempeño (PIP) a 30, 60 y 90 días.',
      'Definición de metas numéricas innegociables con soporte de Talento Humano.',
      'Revisión semanal de cumplimiento estricto de cronogramas y tareas.',
      'Evaluación de continuidad laboral en caso de incumplimiento de hitos acordados.'
    ]
  }
};

/**
 * Motor de Cálculo Oficial de Potencial y Liderazgo (Sección 3)
 */
export function calculatePotentialLeadershipScores(scores: Record<string, number> = {}): PotentialLeadershipResults {
  let answeredCount = 0;
  const dimensionKeys = Object.keys(POTENTIAL_DIMENSIONS) as PotentialDimensionId[];

  const dimensionsResults: Partial<Record<PotentialDimensionId, DimensionResult>> = {};
  const dimensionList: DimensionResult[] = [];
  const priorityGaps: DimensionResult[] = [];
  let yScore = 0;

  dimensionKeys.forEach(dimId => {
    const meta = POTENTIAL_DIMENSIONS[dimId];
    let sum = 0;
    let answeredForDim = 0;

    meta.itemNumbers.forEach(num => {
      const val = scores[`pot_${num}`];
      if (typeof val === 'number' && val >= 1 && val <= 5) {
        sum += val;
        answeredForDim++;
        answeredCount++;
      }
    });

    const averageScore = answeredForDim > 0
      ? Number((sum / answeredForDim).toFixed(2))
      : 3.00;

    const percentage = Number(((averageScore / 5) * 100).toFixed(1));
    const contributionToY = Number((averageScore * meta.weight).toFixed(3));
    const level = getPotentialLevel(averageScore);
    const isPriorityGap = averageScore < 3.00;

    yScore += contributionToY;

    const dimResult: DimensionResult = {
      id: dimId,
      name: meta.name,
      weight: meta.weight,
      averageScore,
      percentage,
      contributionToY,
      level,
      isPriorityGap,
      description: meta.description
    };

    dimensionsResults[dimId] = dimResult;
    dimensionList.push(dimResult);

    if (isPriorityGap) {
      priorityGaps.push(dimResult);
    }
  });

  yScore = Number(yScore.toFixed(2));
  const yLevel = getPotentialLevel(yScore);

  const isAllAbove38 = dimensionList.every(d => d.averageScore > 3.80);

  const yLevelDescription =
    yLevel === 'Alto'
      ? 'Alto Potencial (3.90 - 5.00): Perfil con visión sistémica, agilidad de aprendizaje y capacidad de movilización de equipos.'
      : yLevel === 'Medio'
      ? 'Medio Potencial (2.50 - 3.89): Perfil consistente, con dominio de su ámbito y áreas específicas para acelerar su liderazgo.'
      : 'Bajo Potencial (1.00 - 2.49): Perfil de enfoque operativo inmediato con requerimiento de desarrollo prioritario.';

  const radarData = dimensionList.map(d => ({
    dimension: d.name,
    score: d.averageScore,
    fullMark: 5 as const
  }));

  const recommendedPdiActions = isAllAbove38
    ? [
        'Ruta de Aceleración / Proyectos Estratégicos: Asignación prioritaria a comités de innovación.',
        'Postulación a Banco de Sucesores y programas de movilidad horizontal/vertical.',
        'Mentoría ejecutiva con directores para cultivar pensamiento de negocio a largo plazo.'
      ]
    : priorityGaps.length > 0
    ? priorityGaps.map(g => `Área de Desarrollo Prioritaria: Reforzar ${g.name} (Puntaje actual: ${g.averageScore} / 5.00).`)
    : [
        'Consolidación de competencias de agilidad en el puesto actual.',
        'Participación en proyectos interdepartamentales para ampliar redes de colaboración.'
      ];

  return {
    isComplete: answeredCount >= 18,
    answeredCount,
    totalItems: 18,
    dimensions: dimensionsResults as Record<PotentialDimensionId, DimensionResult>,
    dimensionList,
    yScore,
    yLevel,
    yLevelDescription,
    isAllAbove38,
    priorityGaps,
    radarData,
    recommendedPdiActions
  };
}

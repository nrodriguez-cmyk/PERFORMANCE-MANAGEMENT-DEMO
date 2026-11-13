export type Competency = string;

export type LevelDefinition = {
  name: string;
  description: string;
  behaviors: string[];
};

export type QuestionOption = {
  id: string;
  text: string;
  score: number; // 1.25, 2.50, 3.75, 5.00 or 1..5
  percent?: number; // 100, 75, 50, 25
  levelLabel?: 'Inicial / En Desarrollo' | 'Intermedio / Estándar' | 'Avanzado / Autónomo' | 'Estratégico / Sobresaliente' | string;
  levelLetter?: 'A' | 'B' | 'C' | 'D';
};

export type Question = {
  id: string;
  competency: Competency;
  text: string;
  situation?: string;
  category?: 'cardinal' | 'leadership' | 'area_specific' | 'functional_goals';
  levels?: LevelDefinition[];
  options?: QuestionOption[];
  weight?: number; // percentage weight, e.g. for goals vs competencies
  focusArea?: 'CONOCIMIENTO TÉCNICO' | 'FUNCIONES CLAVE';
  sourceSection?: string;
};

export type SelfEvalQuestion = {
  id: string;
  block: string;
  title: string;
  text: string;
};

export type EvaluationScores = Record<string, number>;

export type EvaluationData = {
  scores: EvaluationScores;
  comments: string;
  checkedBehaviors?: Record<string, string[]>; 
  openAnswers?: Record<string, string>;
  submittedAt?: string;
  evaluatorName?: string;
  evaluatorRole?: 'self' | 'supervisor' | 'peer' | 'subordinate' | 'promotion' | 'promotion_candidate' | 'promotion_supervisor' | 'hr';
  isLocked?: boolean;
  bigFiveResults?: BigFiveResult;
};

export type EmployeePosition = 
  | 'Director'
  | 'Gerente'
  | 'Supervisor'
  | 'Coordinador'
  | 'Responsable'
  | 'Especialista'
  | 'Analista'
  | 'Operador Integral'
  | 'Asesor Integral'
  | 'Encargado de Tienda';

export type EmployeeDirectorate =
  | 'Dirección de Operaciones'
  | 'Dirección Comercial'
  | 'Dirección de Administración y Finanzas'
  | 'Dirección de Tecnología'
  | 'Dirección de Transporte y Logística'
  | 'Dirección de Compras'
  | 'Dirección de Control Interno'
  | 'Dirección de Talento Humano';

export type EvaluationProcessType = 'performance' | 'promotion';

export type EvaluationScope = '180' | '360';

export type EmployeeInfo = {
  id?: string;
  firstName: string;
  lastName: string;
  idNumber: string; // V-XX.XXX.XXX
  position: EmployeePosition | string;
  department: string;
  directorate: EmployeeDirectorate | string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  birthDate?: string;
  hireDate?: string;
  studyField?: string;
  educationDegree?: string;
  educationLevel?: string;
  tenureYears?: number;
  processType?: EvaluationProcessType;
  scope?: EvaluationScope;
  targetPromotionPosition?: string;
};

// Merit Guide Tramos
export type MeritTierId = 1 | 2 | 3 | 4 | 5;

export interface MeritTier {
  id: MeritTierId;
  name: string;
  minScore: number;
  maxScore: number;
  minBase100: number;
  maxBase100: number;
  percentile: string;
  targetPopulation: string;
  salaryPolicy: string;
  pdiStrategy: string;
  enablesSuccession: boolean;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export const MERIT_TIERS: Record<MeritTierId, MeritTier> = {
  1: {
    id: 1,
    name: 'DESEMPEÑO INSATISFACTORIO',
    minScore: 0.00,
    maxScore: 2.70,
    minBase100: 0,
    maxBase100: 54,
    percentile: 'de 0 a </= 54%',
    targetPopulation: '5% de la población',
    salaryPolicy: 'Desvinculación por desempeño',
    pdiStrategy: 'Desvinculación por desempeño',
    enablesSuccession: false,
    color: '#EF4444',
    badgeBg: 'bg-rose-50 border-rose-300',
    badgeText: 'text-rose-900',
  },
  2: {
    id: 2,
    name: 'EN DESARROLLO',
    minScore: 2.75,
    maxScore: 3.25,
    minBase100: 55,
    maxBase100: 65,
    percentile: '= 55% a </= 65%',
    targetPopulation: '20% de la población',
    salaryPolicy: 'Plan de acción correctivo inmediato y seguimiento acelerado (30 a 60 días).',
    pdiStrategy: 'Plan de acción correctivo inmediato y seguimiento acelerado (30 a 60 días).',
    enablesSuccession: false,
    color: '#F59E0B',
    badgeBg: 'bg-amber-50 border-amber-300',
    badgeText: 'text-amber-900',
  },
  3: {
    id: 3,
    name: 'DESEMPEÑO ESPERADO',
    minScore: 3.30,
    maxScore: 3.95,
    minBase100: 66,
    maxBase100: 79,
    percentile: '= 66% a </= 79%',
    targetPopulation: '50% de la población (Estándar Canguro)',
    salaryPolicy: 'Plan de consolidación y fortalecimiento, coaching en brechas y seguimiento quincenal.',
    pdiStrategy: 'Plan de consolidación y fortalecimiento, coaching en brechas y seguimiento quincenal.',
    enablesSuccession: false,
    color: '#16A34A',
    badgeBg: 'bg-emerald-50 border-emerald-300',
    badgeText: 'text-emerald-900',
  },
  4: {
    id: 4,
    name: 'DESEMPEÑO SOBRESALIENTE',
    minScore: 4.00,
    maxScore: 5.00,
    minBase100: 80,
    maxBase100: 100,
    percentile: '= 80% a </= 100%',
    targetPopulation: '20% de la población',
    salaryPolicy: 'Oportunidades de aceleración de carrera.',
    pdiStrategy: 'Oportunidades de aceleración de carrera.',
    enablesSuccession: false,
    color: '#2563EB',
    badgeBg: 'bg-blue-50 border-blue-300',
    badgeText: 'text-blue-900',
  },
  5: {
    id: 5,
    name: 'DESEMPEÑO EXCEPCIONAL',
    minScore: 5.05,
    maxScore: 6.25,
    minBase100: 101,
    maxBase100: 125,
    percentile: '= 101 a </= 125%',
    targetPopulation: '5% (Top Talent)',
    salaryPolicy: 'Pool de talentos, elegibilidad inmediata para sucesión e incentivos superiores.',
    pdiStrategy: 'Pool de talentos, elegibilidad inmediata para sucesión e incentivos superiores.',
    enablesSuccession: true,
    color: '#9333EA',
    badgeBg: 'bg-purple-50 border-purple-300',
    badgeText: 'text-purple-900',
  },
};

// Nine-Box Boxes
export interface NineBoxCell {
  x: 'Bajo' | 'Medio' | 'Alto';
  y: 'Bajo' | 'Medio' | 'Alto';
  title: string;
  action: string;
  badgeColor: string;
  isKeyStar?: boolean;
}

export const NINE_BOX_MATRIX: Record<string, NineBoxCell> = {
  'Alto-Bajo': {
    x: 'Bajo',
    y: 'Alto',
    title: 'Alto Potencial / Bajo Desempeño',
    action: 'Incluirle en programas de desarrollo para mejorar su desempeño.',
    badgeColor: 'bg-amber-100 text-amber-950 border-amber-300',
  },
  'Alto-Medio': {
    x: 'Medio',
    y: 'Alto',
    title: 'Alto Potencial / Medio Desempeño',
    action: 'Exponerles a nuevos retos en su rol actual, hacer seguimiento a sus avances y brindarle formación de calidad para fortalecer su rendimiento.',
    badgeColor: 'bg-amber-200 text-amber-950 border-amber-400',
  },
  'Alto-Alto': {
    x: 'Alto',
    y: 'Alto',
    title: 'Alto Potencial / Alto Desempeño',
    action: 'Incluirle en programas de desarrollo de liderazgo, asignar proyectos desafiantes y considera planes de sucesión.',
    badgeColor: 'bg-[#F1B400] text-zinc-950 border-amber-600 font-black',
    isKeyStar: true,
  },
  'Medio-Bajo': {
    x: 'Bajo',
    y: 'Medio',
    title: 'Medio Potencial / Bajo Desempeño',
    action: 'Proporcionarles programas de capacitación y desarrollo para mejorar su desempeño.',
    badgeColor: 'bg-amber-100 text-amber-950 border-amber-300',
  },
  'Medio-Medio': {
    x: 'Medio',
    y: 'Medio',
    title: 'Medio Potencial / Medio Desempeño',
    action: 'Proporcionarles oportunidades de desarrollo profesional y proyectos que les permitan crecer.',
    badgeColor: 'bg-amber-100 text-amber-950 border-amber-300',
  },
  'Medio-Alto': {
    x: 'Alto',
    y: 'Medio',
    title: 'Medio Potencial / Alto Desempeño',
    action: 'Proporcionarles oportunidades de desarrollo profesional y proyectos que les permitan utilizar sus habilidades al máximo.',
    badgeColor: 'bg-amber-200 text-amber-950 border-amber-400',
  },
  'Bajo-Bajo': {
    x: 'Bajo',
    y: 'Bajo',
    title: 'Bajo Potencial / Bajo Desempeño',
    action: 'Proporcionarles apoyo y capacitación para mejorar su desempeño.',
    badgeColor: 'bg-amber-50 text-amber-950 border-amber-200',
  },
  'Bajo-Medio': {
    x: 'Medio',
    y: 'Bajo',
    title: 'Bajo Potencial / Medio Desempeño',
    action: 'Evaluar su reubicación horizontal mediante un plan de mejora del rendimiento solicitando los puntos a mejorar.',
    badgeColor: 'bg-amber-100 text-amber-950 border-amber-300',
  },
  'Bajo-Alto': {
    x: 'Alto',
    y: 'Bajo',
    title: 'Bajo Potencial / Alto Desempeño',
    action: 'Proporcionarles estabilidad en sus roles actuales y oportunidades para compartir su conocimiento.',
    badgeColor: 'bg-amber-100 text-amber-950 border-amber-300',
  },
};

// Big Five Psychometric Trait
export type BigFiveTrait = 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'emotional_stability';

export interface BigFiveResult {
  raw: Record<BigFiveTrait, number>;
  normalized: Record<BigFiveTrait, number>; // 0 to 100
  interpretations: Record<BigFiveTrait, string>;
  suitabilityScore: number; // 1 to 5
}

// RIASEC Vocational Model
export interface RiasecProfile {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
  topMotivators: string[];
  careerAspirations: string;
  legacyVision: string;
}

// Internal Promotion Dossier
export interface PromotionDossier {
  candidateId: string;
  targetPosition: string;
  targetDepartment: string;
  phase1: {
    interviewScore: number; // 1 to 5
    interviewerComments: string;
    bigFiveResults: BigFiveResult;
    maturityAssessment: string;
    completed: boolean;
  };
  phase2: {
    situationalScore: number; // 1 to 5
    questionsApplied: Question[];
    candidateAnswers: Record<string, string>; // Selected option ID or text
    aiAnalysis?: string;
    completed: boolean;
  };
  phase3: {
    finalScore: number; // 1 to 5
    scoreBase100?: number; // 0 to 100 pts
    fitLevel?: 'Listo Ahora' | 'Listo a Mediano Plazo' | 'No Elegible';
    fitIndexPercent?: number;
    promotionCriterion?: 'NIVEL SOBRESALIENTE' | 'NIVEL COMPETENTE / APTO' | 'NIVEL EN DESARROLLO' | 'NIVEL INSUFICIENTE';
    verdict: 'Altamente Idóneo / Prioritario' | 'Elegible / Apto' | 'En Desarrollo / Requiere Maduración' | 'APROBADO' | 'APROBADO CONDICIONADO' | 'NO APROBADO';
    finalRuling?: 'APROBADO' | 'APROBADO CONDICIONADO' | 'NO APROBADO';
    recommendedAction?: string;
    strengthsRecognition?: string;
    constructiveGapsReview?: string;
    nextEvaluation90Days?: {
      scheduledDate: string;
      objective: string;
      evaluated: boolean;
      scorePost90Days?: number;
      gapClosureStatus?: 'Total' | 'Parcial' | 'Pendiente';
      trainingImpactNotes?: string;
    };
    transitionPlan?: {
      newJobTitle: string;
      newSalaryBand: string;
      officialStartDate: string;
      handoverDurationWeeks: number; // 2 a 4 semanas
      handoverTasks: string[];
      handoverReplacementName: string;
      signedByEmployee: boolean;
      signedByHR: boolean;
    };
    committeeObservations: string;
    authorizedByCommittee: boolean;
    approvalDate?: string;
  };
}

// RANGOS Y PARÁMETROS PARA APROBACIÓN DE PROMOCIÓN (Tabla Institucional)
export interface PromotionScoreThreshold {
  rangeLabel: string;
  minScore: number;
  maxScore: number;
  criterion: 'NIVEL SOBRESALIENTE' | 'NIVEL COMPETENTE / APTO' | 'NIVEL EN DESARROLLO' | 'NIVEL INSUFICIENTE';
  finalRuling: 'APROBADO' | 'APROBADO CONDICIONADO' | 'NO APROBADO';
  verdictLabel: string;
  recommendedAction: string;
  badgeBg: string;
  badgeText: string;
}

export const PROMOTION_APPROVAL_THRESHOLDS: PromotionScoreThreshold[] = [
  {
    rangeLabel: '85 - 100 pts',
    minScore: 85,
    maxScore: 100,
    criterion: 'NIVEL SOBRESALIENTE',
    finalRuling: 'APROBADO',
    verdictLabel: 'APROBADO (Superación Satisfactoria)',
    recommendedAction: 'Promoción Inmediata. Activación de Handover y Plan de Acompañamiento en Liderazgo.',
    badgeBg: 'bg-emerald-50 border-emerald-300',
    badgeText: 'text-emerald-950'
  },
  {
    rangeLabel: '75 - 84,9 pts',
    minScore: 75,
    maxScore: 84.99,
    criterion: 'NIVEL COMPETENTE / APTO',
    finalRuling: 'APROBADO',
    verdictLabel: 'APROBADO (Superación Satisfactoria)',
    recommendedAction: 'Promoción Autorizada. Plan de Acompañamiento Operativo y Supervisión.',
    badgeBg: 'bg-blue-50 border-blue-300',
    badgeText: 'text-blue-900'
  },
  {
    rangeLabel: '65 - 74,9 pts',
    minScore: 65,
    maxScore: 74.99,
    criterion: 'NIVEL EN DESARROLLO',
    finalRuling: 'APROBADO CONDICIONADO',
    verdictLabel: 'APROBADO CONDICIONADO (Sujeto a PDI Obligatorio)',
    recommendedAction: 'Promoción Provisional Supeditada al Cumplimiento de PDI en Brechas Críticas con Reevaluación a 90 Días.',
    badgeBg: 'bg-amber-50 border-amber-300',
    badgeText: 'text-amber-950'
  },
  {
    rangeLabel: '< 65 pts',
    minScore: 0,
    maxScore: 64.99,
    criterion: 'NIVEL INSUFICIENTE',
    finalRuling: 'NO APROBADO',
    verdictLabel: 'NO APROBADO (No Superación del Período, sujeto a PDI)',
    recommendedAction: 'No superación del baremo requerido para el cargo aspirado. Se mantiene en cargo actual con PDI de fortalecimiento.',
    badgeBg: 'bg-red-50 border-red-300',
    badgeText: 'text-red-950'
  }
];

export function resolvePromotionThreshold(scoreBase100: number): PromotionScoreThreshold {
  if (scoreBase100 >= 85) return PROMOTION_APPROVAL_THRESHOLDS[0];
  if (scoreBase100 >= 75) return PROMOTION_APPROVAL_THRESHOLDS[1];
  if (scoreBase100 >= 65) return PROMOTION_APPROVAL_THRESHOLDS[2];
  return PROMOTION_APPROVAL_THRESHOLDS[3];
}

// Succession Plan Position
export interface SuccessionPosition {
  id: string;
  title: string;
  directorate: string;
  criticality: 'Alta' | 'Extrema' | 'Estratégica';
  currentOccupant: string;
  isLocked: boolean; // Cannot ascend to Presidencia
  notes?: string;
  successors: {
    employeeId: string;
    employeeName: string;
    currentPosition: string;
    performanceScore: number;
    readiness: 'Listo Inmediato (0-6 meses)' | 'Mediano Plazo (6-18 meses)' | 'En Desarrollo (18-36 meses)';
    readinessColor: 'emerald' | 'amber' | 'blue';
    retentionRisk: 'Bajo' | 'Medio' | 'Alto';
  }[];
}

// PDI Goal
export interface PdiGoal {
  id: string;
  type: '70_experiential' | '20_social' | '10_formal';
  title: string;
  description: string;
  kpi: string;
  progressPercent: number; // 0 - 100
  targetDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  mentorOrSupport?: string;
}

// PDI Identified Breach & Commitment (Alimenta Sistema de PDI)
export interface PdiBreach {
  id: string;
  competency: string;
  skills: string;
  identifiedGap: string;
  estimatedTime: string; // Ej: '3 Meses (Corto Plazo)', '6 Meses (Mediano Plazo)', '12 Meses (Largo Plazo)'
}

// Full App State
export type AppState = {
  employeeName: string;
  employeeInfo: EmployeeInfo;
  evaluationSetupInfo?: EmployeeInfo; // Dedicated exclusively for configuring evaluations & dispatching links
  selfEval: EvaluationData;
  supervisorEval: EvaluationData;
  peerEval?: EvaluationData;
  subordinateEval: EvaluationData;
  hrEval: EvaluationData;
  promotionEval?: EvaluationData;
  pdiGoals?: PdiGoal[];
  pdiBreaches?: PdiBreach[];
  riasecProfile?: RiasecProfile;
  promotionDossier?: PromotionDossier;
  adminNotes?: string;
  notifications?: AdminNotification[];
  performanceQuestions: Question[];
  potentialQuestions: Question[];
  supervisorPotentialQuestions: Question[];
  analystPotentialQuestions: Question[];
  analystSupervisorPotentialQuestions: Question[];
  coordinatorPotentialQuestions: Question[];
  coordinatorSupervisorPotentialQuestions: Question[];
  selfEvalQuestions: SelfEvalQuestion[];
  supervisorEvalQuestions: SelfEvalQuestion[];
};

export const defaultScores: EvaluationScores = {};

export const defaultEval: EvaluationData = {
  scores: {},
  comments: '',
  isLocked: false,
};

export const performanceQuestions: Question[] = [
  { id: 'q1', competency: 'Orientación al Cliente', category: 'cardinal', text: 'Dirige esfuerzos hacia la satisfacción de clientes internos y externos, generando confianza y valor sostenido.' },
  { id: 'q2', competency: 'Aprendizaje e Innovación', category: 'cardinal', text: 'Identifica y aplica nuevas ideas y soluciones; mantiene disposición a la actualización constante frente a la evolución del mercado.' },
  { id: 'q3', competency: 'Capacidad de Análisis', category: 'cardinal', text: 'Examina sistemáticamente situaciones complejas para identificar causas, optimizar procesos y tomar decisiones informadas.' },
  { id: 'q4', competency: 'Trabajo en Equipo', category: 'cardinal', text: 'Colabora genuinamente integrando esfuerzos individuales para el logro sinérgico de metas comunes en el Universo Canguro.' },
  { id: 'q5', competency: 'Adaptabilidad y Flexibilidad', category: 'cardinal', text: 'Ajusta con agilidad sus métodos de trabajo y comportamiento ante imprevistos y prioridades de la organización.' },
];

export const potentialQuestions: Question[] = [
  {
    id: 'pq1',
    competency: 'Orientación al Cliente',
    category: 'cardinal',
    text: 'Habilidad para dirigir las acciones y esfuerzos hacia la satisfacción de las necesidades y expectativas de los clientes internos y externos.',
    situation: 'Un cliente le hace una solicitud directa sobre un trámite habitual, pero con una pequeña variación y menciona que tiene mucha prisa. ¿Cómo reacciona?',
    options: [
      { id: 'pq1-optA', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Respondo con calidez y agilidad, aplico mi experiencia para resolver la variación de inmediato sin descuidar el control, y optimizo el flujo para que no vuelva a ocurrir retrasos similares.' },
      { id: 'pq1-optB', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Realizo el trámite adaptando autónomamente lo que puedo solucionar según mis conocimientos y procedimientos para agilizar el proceso con solvencia.' },
      { id: 'pq1-optC', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Le informo amablemente sobre los procedimientos estándar, indicando de forma estructurada los pasos y pidiéndole comprensión sobre los tiempos regulares.' },
      { id: 'pq1-optD', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Me limito a indicar que el trámite no contempla variaciones urgentes y derivo el caso a mi supervisor o al siguiente canal disponible.' }
    ]
  },
  {
    id: 'pq2',
    competency: 'Aprendizaje e Innovación',
    category: 'cardinal',
    text: 'Capacidad de identificar y aplicar nuevas ideas, métodos o soluciones que generen valor a la organización.',
    situation: 'La organización implementa una nueva herramienta digital para registrar sus actividades diarias, sustituyendo el formato tradicional que usted dominaba con soltura.',
    options: [
      { id: 'pq2-optA', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Asimilo la herramienta velozmente, propongo atajos o mejoras de uso al equipo de tecnología y acompaño a mis compañeros como referente en la adopción.' },
      { id: 'pq2-optB', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Integro la herramienta en todas mis tareas cotidianas con total autonomía, abandonando el formato anterior sin necesidad de supervisión reiterada.' },
      { id: 'pq2-optC', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Participo en las formaciones y utilizo la nueva plataforma en mis procesos básicos, consultando con frecuencia cuando surgen dudas técnicas.' },
      { id: 'pq2-optD', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Mantengo el formato tradicional paralelo para no atrasarme y solo recurro a la nueva herramienta cuando me es exigido explícitamente.' }
    ]
  },
  {
    id: 'pq3',
    competency: 'Capacidad de Análisis',
    category: 'cardinal',
    text: 'Habilidad para examinar sistemáticamente situaciones complejas e identificar relaciones causales y patrones para la resolución oportuna.',
    situation: 'Durante su turno, nota que un procedimiento de rutina arroja un error constante que retrasa su trabajo y el de otras áreas interdependientes.',
    options: [
      { id: 'pq3-optA', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Examino a fondo los datos, identifico la causa-raíz del error en el circuito operativo y propongo a la jefatura una solución preventiva definitiva.' },
      { id: 'pq3-optB', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Analizo los datos a mi alcance, aplico un ajuste operativo preventivo correcto y notifico de inmediato el hallazgo para evitar mayores atrasos.' },
      { id: 'pq3-optC', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Realizo un reporte estándar describiendo el momento del fallo y aguardo la instrucción directa de mi supervisor para proceder con las tareas alternas.' },
      { id: 'pq3-optD', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Pauso el proceso preventivamente y continúo con otras actividades no afectadas hasta que alguien más normalice el sistema.' }
    ]
  },
  {
    id: 'pq4',
    competency: 'Trabajo en Equipo',
    category: 'cardinal',
    text: 'Disposición genuina para trabajar en colaboración con otros, integrando esfuerzos y promoviendo la cooperación constante.',
    situation: 'Un compañero tiene una sobrecarga inusual de trabajo y le solicita su apoyo con una tarea básica que no interfiere con sus metas principales del día.',
    options: [
      { id: 'pq4-optA', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Brindo soporte inmediato con espíritu de servicio, coordino esfuerzos para destrabar el cuello de botella departamental y propongo un balance de carga.' },
      { id: 'pq4-optB', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Colaboro activamente con la tarea solicitada una vez garantizadas mis prioridades, asegurando que ambos cumplamos con los estándares esperados.' },
      { id: 'pq4-optC', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Apoyo puntualmente en lo estrictamente necesario si me queda tiempo disponible, aclarando que mi prioridad es mi entrega personal.' },
      { id: 'pq4-optD', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Me concentro exclusivamente en mis propias funciones asignadas para no arriesgar mi cumplimiento de metas individuales.' }
    ]
  },
  {
    id: 'pq5',
    competency: 'Adaptabilidad y Flexibilidad',
    category: 'cardinal',
    text: 'Capacidad para mantener un desempeño de excelencia en entornos definidos por el dinamismo y la evolución de prioridades.',
    situation: 'Su supervisor le informa que debe pausar temporalmente su actividad actual para atender una nueva prioridad operativa urgente de la organización.',
    options: [
      { id: 'pq5-optA', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Reorganizo mi planificación con agilidad, entiendo la urgencia en el contexto general del negocio y ejecuto la nueva tarea con máxima calidad.' },
      { id: 'pq5-optB', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Realizo la transición rápidamente, ajusto mis plazos de entrega pendientes y me concentro con eficacia en el nuevo requerimiento.' },
      { id: 'pq5-optC', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Acepto la directriz, aunque necesito unos momentos para cerrar mi tarea previa y solicitar confirmación de plazos a mi jefatura.' },
      { id: 'pq5-optD', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Manifiesto inconformidad ante el cambio de planes y me cuesta retomar el ritmo de trabajo en la nueva asignación encomendada.' }
    ]
  }
];

export const supervisorPotentialQuestions: Question[] = potentialQuestions.map(q => ({
  ...q,
  text: `Evaluación del Supervisor: ${q.text}`
}));

export const analystPotentialQuestions: Question[] = potentialQuestions.map(q => ({
  ...q,
  competency: `${q.competency} (Nivel D - Analista / Soporte)`
}));

export const analystSupervisorPotentialQuestions: Question[] = supervisorPotentialQuestions.map(q => ({
  ...q,
  competency: `${q.competency} (Nivel D - Analista / Soporte)`
}));

export const coordinatorPotentialQuestions: Question[] = [
  {
    id: 'pq1_coord',
    competency: 'Liderar con el Ejemplo',
    category: 'leadership',
    text: 'Capacidad de actuar como el referente ético y operacional, modelando la excelencia, coherencia y asumiendo responsabilidades compartidas.',
    situation: 'Un área interdependiente le informa que los tiempos de respuesta de su equipo están afectando la operación comercial. ¿Cómo procede usted?',
    options: [
      { id: 'pq1-optA', score: 5.0, levelLetter: 'A', levelLabel: 'Nivel Superior (76% - 100%)', text: 'Evalúo integralmente el proceso con mi equipo, establecemos un ANS (Acuerdo de Nivel de Servicio) formal y rediseño los puntos de fricción modelando con mi propio ejemplo el estándar de entrega.' },
      { id: 'pq1-optB', score: 3.75, levelLetter: 'B', levelLabel: 'Nivel Alto (51% - 75%)', text: 'Analizo dónde radican los cuellos de botella con mi equipo y reestructuro los turnos o asignaciones asumiendo el liderazgo directo para acortar tiempos con solvencia.' },
      { id: 'pq1-optC', score: 2.50, levelLetter: 'C', levelLabel: 'Nivel Intermedio (26% - 50%)', text: 'Escucho la queja, me comprometo a resolver el retraso puntual y pido a los colaboradores un esfuerzo extra para normalizar el flujo operativo.' },
      { id: 'pq1-optD', score: 1.25, levelLetter: 'D', levelLabel: 'Nivel Mínimo (0% - 25%)', text: 'Defiendo la carga de mi equipo argumentando falta de personal o insumos y sugiero a la otra área que planifique con mayor anticipación.' }
    ]
  },
  {
    id: 'pq2_coord',
    competency: 'Orientación al Logro',
    category: 'leadership',
    text: 'Capacidad para movilizar y alinear los recursos y el equipo hacia metas desafiantes que superen los estándares habituales de la organización.',
    situation: 'La Dirección instruye un incremento en las metas del período o la adopción urgente de una nueva metodología de trabajo en su área.',
    options: [
      { id: 'pq2-optA', score: 5.0, levelLetter: 'A', levelLabel: 'Nivel Superior (76% - 100%)', text: 'Transformo la estrategia en metas aspiracionales claras, elimino barreras operativas y movilizo al equipo con agilidad hacia la superación de estándares previos.' },
      { id: 'pq2-optB', score: 3.75, levelLetter: 'B', levelLabel: 'Nivel Alto (51% - 75%)', text: 'Fijo prioridades de ejecución, ajusto cronogramas y realizo seguimiento semanal a los indicadores clave para garantizar el cumplimiento presupuestado.' },
      { id: 'pq2-optC', score: 2.50, levelLetter: 'C', levelLabel: 'Nivel Intermedio (26% - 50%)', text: 'Comunico las metas al equipo en la reunión de seguimiento y solicito a los miembros mantener el ritmo habitual de entrega sin mayores variaciones.' },
      { id: 'pq2-optD', score: 1.25, levelLetter: 'D', levelLabel: 'Nivel Mínimo (0% - 25%)', text: 'Manifiesto que las metas son demasiado exigentes para las condiciones actuales y espero instrucciones adicionales de la gerencia.' }
    ]
  },
  {
    id: 'pq3_coord',
    competency: 'Desarrollo de Equipos',
    category: 'leadership',
    text: 'Capacidad para potenciar el talento colectivo, transformar individuos en una unidad cohesionada y crear entornos de confianza y crecimiento profesional.',
    situation: 'Dos personas bajo su supervisión tienen un desacuerdo técnico recurrente que comienza a ralentizar los entregables del equipo.',
    options: [
      { id: 'pq3-optA', score: 5.0, levelLetter: 'A', levelLabel: 'Nivel Superior (76% - 100%)', text: 'Facilito un espacio estructurado de mediación, alineo a las partes con la visión global de la compañía, clarifico roles y doy seguimiento al clima.' },
      { id: 'pq3-optB', score: 3.75, levelLetter: 'B', levelLabel: 'Nivel Alto (51% - 75%)', text: 'Intervengo de inmediato con ambos presentes, establezco reglas claras de convivencia y defino un criterio técnico unificado para el proyecto.' },
      { id: 'pq3-optC', score: 2.50, levelLetter: 'C', levelLabel: 'Nivel Intermedio (26% - 50%)', text: 'Advierto normativamente a los involucrados que las diferencias individuales no pueden perjudicar los resultados del departamento.' },
      { id: 'pq3-optD', score: 1.25, levelLetter: 'D', levelLabel: 'Nivel Mínimo (0% - 25%)', text: 'Aislo las tareas de ambos para evitar que interactúen o me mantengo al margen esperando que resuelvan sus asuntos por sí mismos.' }
    ]
  },
  {
    id: 'pq4_coord',
    competency: 'Capacidad de Análisis',
    category: 'cardinal',
    text: 'Habilidad para examinar sistemáticamente situaciones complejas, detectar interrelaciones causales y tomar decisiones basadas en datos e indicadores.',
    situation: 'Al revisar los reportes mensuales de su área, identifica una desviación negativa sostenida en los indicadores de calidad.',
    options: [
      { id: 'pq4-optA', score: 5.0, levelLetter: 'A', levelLabel: 'Nivel Superior (76% - 100%)', text: 'Realizo un diagnóstico sistémico aislando causas raíz, rediseño los controles preventivos junto al equipo y presento a la Gerencia el impacto cuantificado.' },
      { id: 'pq4-optB', score: 3.75, levelLetter: 'B', levelLabel: 'Nivel Alto (51% - 75%)', text: 'Cruzo datos con los procedimientos, detecto los puntos exactos de fallo operativo y establezco un plan de acción para regularizar el rendimiento.' },
      { id: 'pq4-optC', score: 2.50, levelLetter: 'C', levelLabel: 'Nivel Intermedio (26% - 50%)', text: 'Señalo la desviación al equipo en la reunión quincenal y solicito un incremento en la rigurosidad operativa para el período entrante.' },
      { id: 'pq4-optD', score: 1.25, levelLetter: 'D', levelLabel: 'Nivel Mínimo (0% - 25%)', text: 'Envío el reporte sin mayor análisis de contexto y espero directrices superiores para implementar medidas correctoras.' }
    ]
  },
  {
    id: 'pq5_coord',
    competency: 'Adaptabilidad y Flexibilidad',
    category: 'cardinal',
    text: 'Capacidad para mantener un desempeño de excelencia en entornos definidos por el dinamismo, reorganizando prioridades con agilidad.',
    situation: 'Su Gerencia le solicita ceder temporalmente al especialista clave de su coordinación para atender una auditoría externa prioritaria.',
    options: [
      { id: 'pq5-optA', score: 5.0, levelLetter: 'A', levelLabel: 'Nivel Superior (76% - 100%)', text: 'Alineo al equipo en la visión macro de la empresa, reconfiguro temporalmente la matriz de responsabilidades, empodero a un sucesor y cumplo los objetivos.' },
      { id: 'pq5-optB', score: 3.75, levelLetter: 'B', levelLabel: 'Nivel Alto (51% - 75%)', text: 'Priorizo lo esencial de los entregables del mes, redistribuyo equitativamente la carga restante y ofrezco acompañamiento técnico continuo.' },
      { id: 'pq5-optC', score: 2.50, levelLetter: 'C', levelLabel: 'Nivel Intermedio (26% - 50%)', text: 'Acato la disposición institucional asignando las tareas del ausente entre los demás miembros, advirtiendo que los tiempos pueden extenderse.' },
      { id: 'pq5-optD', score: 1.25, levelLetter: 'D', levelLabel: 'Nivel Mínimo (0% - 25%)', text: 'Manifiesto rechazo formal a la solicitud y advierto que no me hago responsable de las desviaciones resultantes en los objetivos del área.' }
    ]
  }
];

export const coordinatorSupervisorPotentialQuestions: Question[] = coordinatorPotentialQuestions.map(q => ({
  ...q,
  text: `Evaluación del Gerente/Director: ${q.text}`
}));

export const selfEvalQuestions: SelfEvalQuestion[] = [
  { id: 'se1', block: 'Bloque 1: Mi Rendimiento y Conocimiento Técnico', title: 'Gestión de la calidad bajo presión', text: 'Cuando tengo una carga alta de trabajo o plazos de entrega muy ajustados, logro mantener el mismo nivel de precisión y calidad en mis entregables sin cometer errores por la prisa.' },
  { id: 'se2', block: 'Bloque 1: Mi Rendimiento y Conocimiento Técnico', title: 'Autonomía ante herramientas nuevas o complejas', text: 'Frente a actualizaciones en los sistemas, herramientas nuevas o tareas que requieren un conocimiento técnico avanzado, logro resolverlas por mí mismo/a investigando antes de pedir ayuda a otros.' },
  { id: 'se3', block: 'Bloque 1: Mi Rendimiento y Conocimiento Técnico', title: 'Resolución de imprevistos', text: 'Si un proceso o tarea habitual falla de un momento a otro debido a un problema técnico o un error inesperado, encuentro una solución rápida y efectiva para que el trabajo no se detenga.' },
  { id: 'se4', block: 'Bloque 2: Logro de Objetivos (Mi Cargo y Mi Área)', title: 'Balance entre cantidad y metas', text: 'Al revisar la lista de objetivos específicos que se me asignaron en este período, puedo afirmar que completé la totalidad de ellos con el nivel de profundidad que se esperaba, sin dejar pendientes importantes.' },
  { id: 'se5', block: 'Bloque 2: Logro de Objetivos (Mi Cargo y Mi Área)', title: 'Visión del impacto global', text: 'Al planificar mi semana o decidir qué tareas hacer primero, priorizo aquellas actividades que sé que destraban el trabajo de mis compañeros o que impactan directamente en las metas del área.' },
  { id: 'se6', block: 'Bloque 2: Logro de Objetivos (Mi Cargo y Mi Área)', title: 'Manejo de interrupciones y plazos', text: 'A pesar de las distracciones cotidianas, reuniones imprevistas o solicitudes urgentes de último minuto, logro reordenar mi día para cumplir puntualmente con las fechas de entrega que ya había comprometido.' },
  { id: 'se7', block: 'Bloque 3: Mis Conductas y Forma de Trabajar', title: 'Proactividad frente a ineficiencias', text: 'Cuando noto que un proceso, plantilla o tarea de mi área es lento, repetitivo o genera problemas, propongo una solución o mejora concreta en lugar de limitarme a seguir haciéndolo igual.' },
  { id: 'se8', block: 'Bloque 3: Mis Conductas y Forma de Trabajar', title: 'Colaboración fuera del rol básico', text: 'Si un compañero del área está saturado de trabajo o el equipo enfrenta un cuello de botella, me ofrezco voluntariamente a apoyarlo, incluso si la tarea no forma parte de mis responsabilidades directas.' },
  { id: 'se9', block: 'Bloque 3: Mis Conductas y Forma de Trabajar', title: 'Gestión de la frustración ante el cambio', text: 'Cuando la dirección de un proyecto cambia drásticamente, o una prioridad del área se cancela a mitad de camino para hacer otra cosa, reorganizo mi enfoque y energía sin que esto afecte mi motivación o ritmo de trabajo.' },
  { id: 'se10', block: 'Bloque 3: Mis Conductas y Forma de Trabajar', title: 'Anticipación a las necesidades del cliente (interno o externo)', text: 'En lugar de esperar a que me reclamen un entregable o me reporten un error, hago seguimiento activo con los usuarios de mi trabajo para asegurarme de que lo que les entregué realmente les funciona y cumple sus expectativas.' },
];

export const supervisorEvalQuestions: SelfEvalQuestion[] = [
  { id: 'sup1', block: 'Bloque 1: Rendimiento y Conocimiento Técnico', title: 'Gestión de la calidad bajo presión', text: 'Cuando tiene una carga alta de trabajo o plazos de entrega muy ajustados, el colaborador logra mantener el mismo nivel de precisión y calidad en sus entregables sin cometer errores por la prisa.' },
  { id: 'sup2', block: 'Bloque 1: Rendimiento y Conocimiento Técnico', title: 'Autonomía ante herramientas nuevas o complejas', text: 'Frente a actualizaciones en los sistemas, herramientas nuevas o tareas que requieren un conocimiento técnico avanzado, el colaborador logra resolverlas por sí mismo/a investigando antes de pedir ayuda a otros.' },
  { id: 'sup3', block: 'Bloque 1: Rendimiento y Conocimiento Técnico', title: 'Resolución de imprevistos', text: 'Si un proceso o tarea habitual falla de un momento a otro debido a un problema técnico o un error inesperado, el colaborador encuentra una solución rápida y efectiva para que el trabajo no se detenga.' },
  { id: 'sup4', block: 'Bloque 2: Logro de Objetivos', title: 'Balance entre cantidad y metas', text: 'Al revisar la lista de objetivos específicos que se le asignaron en este período, el colaborador completó la totalidad de ellos con el nivel de profundidad que se esperaba, sin dejar pendientes importantes.' },
  { id: 'sup5', block: 'Bloque 2: Logro de Objetivos', title: 'Visión del impacto global', text: 'Al planificar su semana o decidir qué tareas hacer primero, el colaborador prioriza aquellas actividades que destraban el trabajo de sus compañeros o que impactan directamente en las metas del área.' },
  { id: 'sup6', block: 'Bloque 2: Logro de Objetivos', title: 'Manejo de interrupciones y plazos', text: 'A pesar de las distracciones cotidianas, reuniones imprevistas o solicitudes urgentes de último minuto, el colaborador logra reordenar su día para cumplir puntualmente con las fechas de entrega que ya había comprometido.' },
  { id: 'sup7', block: 'Bloque 3: Conductas y Forma de Trabajar', title: 'Proactividad frente a ineficiencias', text: 'Cuando nota que un proceso, plantilla o tarea del área es lento, repetitivo o genera problemas, el colaborador propone una solución o mejora concreta en lugar de limitarme a seguir haciéndolo igual.' },
  { id: 'sup8', block: 'Bloque 3: Conductas y Forma de Trabajar', title: 'Colaboración fuera del rol básico', text: 'Si un compañero del área está saturado de trabajo o el equipo enfrenta un cuello de botella, el colaborador se ofrece voluntariamente a apoyarlo, incluso si la tarea no forma parte de sus responsabilidades directas.' },
  { id: 'sup9', block: 'Bloque 3: Conductas y Forma de Trabajar', title: 'Gestión de la frustración ante el cambio', text: 'Cuando la dirección de un proyecto cambia drásticamente, o una prioridad del área se cancela a mitad de camino para hacer otra cosa, el colaborador reorganiza su enfoque y energía sin que esto afecte su motivación o ritmo de trabajo.' },
  { id: 'sup10', block: 'Bloque 3: Conductas y Forma de Trabajar', title: 'Anticipación a las necesidades del cliente (interno o externo)', text: 'En lugar de esperar a que le reclamen un entregable o le reporten un error, el colaborador hace seguimiento activo con los usuarios de su trabajo para asegurarse de que lo que les entregó realmente les funciona y cumple sus expectativas.' },
];

export type AdminNotification = {
  id: string;
  message: string;
  date: string;
  read: boolean;
  title?: string;
  timestamp?: string;
  employeeId?: string;
  evaluatorName?: string;
  evaluatorPosition?: string;
  evaluatorRole?: string;
  evaluationType?: string; // 'Autoevaluación' | 'Evaluación del Supervisor' | 'Evaluación de Pares' | 'Evaluación de Subordinados'
  evaluatedEmployeeName?: string;
  evaluatedEmployeePosition?: string;
};


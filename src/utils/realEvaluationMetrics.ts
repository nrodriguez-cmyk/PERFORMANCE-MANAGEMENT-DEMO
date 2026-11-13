import { EvaluationData, MERIT_TIERS, MeritTier } from '../types';
import { calculatePotentialLeadershipScores } from '../data/potentialLeadershipQuestions';

export interface PotentialLeadershipInterpretation {
  level: 'Alto' | 'Medio' | 'Bajo';
  levelBadge: string;
  badgeBg: string;
  score: number;
  percentage: number;
  weightedContribution: number; // 10% del total (ej: 0.42 pts de 4.20)
  leadershipCategory: string;
  summary: string;
  readinessLevel: string;
  agilityStrengths: string[];
  developmentFocus: string[];
  qualitativeDiagnostic: string;
}

export function getPotentialLeadershipInterpretation(score: number): PotentialLeadershipInterpretation {
  const cleanScore = Number(Math.max(0, Math.min(5, score)).toFixed(2));
  const percentage = Number(((cleanScore / 5) * 100).toFixed(1));
  const weightedContribution = Number((cleanScore * 0.10).toFixed(3));

  if (cleanScore >= 3.90) {
    return {
      level: 'Alto',
      levelBadge: 'Alto Potencial de Liderazgo',
      badgeBg: 'bg-emerald-100 text-emerald-950 border border-emerald-300',
      score: cleanScore,
      percentage,
      weightedContribution,
      leadershipCategory: 'Liderazgo Estratégico y Transformador',
      readinessLevel: 'Alta Preparación para Sucesión y Mando Directivo (Promoción Inmediata)',
      summary: 'Demuestra alta agilidad de aprendizaje, visión sistémica y capacidad natural para inspirar y movilizar personas hacia metas complejas.',
      qualitativeDiagnostic: 'El colaborador exhibe una destacada capacidad para liderar en entornos de cambio y alta complejidad. Su perfil combina pensamiento sistémico con fuerte tracción relacional, posicionándose como un referente inspirador para sus pares y equipos a cargo. Es un activo clave para planes de sucesión y asignaciones a proyectos de impacto directivo en Universo Canguro.',
      agilityStrengths: [
        'Visión sistémica e intuición estratégica para la toma de decisiones complejas.',
        'Habilidad natural de persuasión, movilización y cohesión de equipos interfuncionales.',
        'Alta adaptabilidad ante la ambigüedad y rápido aprendizaje en nuevos escenarios.'
      ],
      developmentFocus: [
        'Mentoría ejecutiva con directores corporativos para profundizar la visión de negocio global.',
        'Liderazgo en comités transversales y asignación como sponsor en proyectos de innovación.',
        'Inclusión activa en el Banco de Talentos y Sucesión Gerencial de la organización.'
      ]
    };
  } else if (cleanScore >= 2.50) {
    return {
      level: 'Medio',
      levelBadge: 'Potencial de Liderazgo Medio / Táctico',
      badgeBg: 'bg-blue-100 text-blue-950 border border-blue-300',
      score: cleanScore,
      percentage,
      weightedContribution,
      leadershipCategory: 'Liderazgo Táctico y Operacional',
      readinessLevel: 'Listo para Desafíos de Mayor Complejidad con Acompañamiento (6 a 12 meses)',
      summary: 'Muestra liderazgo confiable en su ámbito de dominio, con competencias sólidas de ejecución y áreas clave para expandir su alcance organizacional.',
      qualitativeDiagnostic: 'El colaborador desempeña un liderazgo sólido a nivel táctico y operativo, garantizando consistencia, disciplina y rigor en los procesos que gestiona. Presenta un potencial favorable que puede acelerarse fortaleciendo la delegación estratégica, la resiliencia ante la incertidumbre y la asunción de riesgos calculados en iniciativas multidisciplinarias.',
      agilityStrengths: [
        'Dominio técnico sobresaliente y consistencia en el cumplimiento operativo.',
        'Sentido elevado de responsabilidad, disciplina y confiabilidad en la entrega.',
        'Relaciones interpersonales colaborativas y fluidas en su entorno inmediato.'
      ],
      developmentFocus: [
        'Desarrollo de competencias de delegación efectiva y empoderamiento de equipos.',
        'Participación en proyectos interdepartamentales para ampliar la visión sistémica.',
        'Talleres prácticos de resolución de problemas bajo presión y gestión de crisis.'
      ]
    };
  } else {
    return {
      level: 'Bajo',
      levelBadge: 'Potencial de Liderazgo Bajo / Foco Operativo',
      badgeBg: 'bg-amber-100 text-amber-950 border border-amber-300',
      score: cleanScore,
      percentage,
      weightedContribution,
      leadershipCategory: 'Liderazgo Emergente / En Desarrollo',
      readinessLevel: 'Prioridad en Fortalecimiento de Autonomía y Estabilidad en el Rol Actual',
      summary: 'Foco prioritario en la ejecución de tareas operativas individuales con directrices estructuradas. Requiere tutoría para cultivar capacidades de liderazgo.',
      qualitativeDiagnostic: 'El perfil actual denota una preferencia marcada por tareas técnicas y estructuradas con directrices claras, evidenciando oportunidades para desenvolverse con autonomía en escenarios ambiguos o para influir en otros sin autoridad formal. Se recomienda focalizar su desarrollo en autoconocimiento, comunicación asertiva y asimilación de metodologías de trabajo antes de proyectar roles con personas a cargo.',
      agilityStrengths: [
        'Apego riguroso a procedimientos estandarizados, normas y directrices operativas.',
        'Enfoque técnico especializado en tareas y metas inmediatas asignadas.'
      ],
      developmentFocus: [
        'Programa intensivo de autogestión, resiliencia y madurez profesional.',
        'Tutoría cercana (1 a 1) para el desarrollo de comunicación e influencia constructiva.',
        'Capacitación en resolución estructurada de problemas y pensamiento crítico.'
      ]
    };
  }
}

export interface CalculatedConsolidatedMetrics {
  isEvaluated: boolean;
  block1Score: number; // 1.00 - 5.00 (60% weight: Indicadores y Objetivos Clave)
  block2Score: number; // 1.00 - 5.00 (30% weight: Evaluación por Competencias)
  potentialScore: number; // 1.00 - 5.00 (10% weight: Evaluación de Potencial y Liderazgo)
  finalScore: number;  // 1.00 - 5.00 (60% B1 + 30% B2 + 10% Potencial)
  base100Score: number; // 0 - 100
  meritTier: MeritTier;
  enablesSuccession: boolean;
  potentialLevel: 'Alto' | 'Medio' | 'Bajo';
  potentialInterpretation: PotentialLeadershipInterpretation;
  radarScores: {
    cardinal: number;
    leadership: number;
    specific: number;
  };
  evaluatorAverages: {
    self: number;
    supervisor: number;
    peer: number;
    subordinate: number;
  };
  percentileRank: number; // Estimated percentile P0 - P100
}

/**
 * Extracts average score for keys matching a prefix or predicate
 */
export function extractAverage(data?: EvaluationData, filterFn?: (key: string) => boolean): number {
  if (!data || !data.scores) return 0;
  const entries = Object.entries(data.scores).filter(([k, val]) => {
    if (typeof val !== 'number' || val <= 0) return false;
    return filterFn ? filterFn(k) : true;
  });
  if (entries.length === 0) return 0;
  const sum = entries.reduce((acc, [, val]) => acc + (typeof val === 'number' ? val : 0), 0);
  return Number((sum / entries.length).toFixed(2));
}

export function extractBlock1Score(data?: EvaluationData, fallbackAvg: number = 0): number {
  if (!data || !data.scores) return fallbackAvg;
  
  // Regla especial parametrizada para Dirección de Control Interno (Sub1 50%, Sub2 35%, Sub3 15%)
  const hasCiKeys = Object.keys(data.scores).some(k => k.startsWith('ci_'));
  if (hasCiKeys) {
    const sub1Scores = ['ci_kpi_1', 'ci_kpi_2', 'ci_kpi_3', 'ci_kpi_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub2Scores = [
      'ci_cond_1', 'ci_cond_2', 'ci_cond_3', 'ci_cond_4',
      'ci_cond_5', 'ci_cond_6', 'ci_cond_7', 'ci_cond_8', 'ci_cond_9'
    ]
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub3Scores = ['ci_strat_1', 'ci_strat_2', 'ci_strat_3', 'ci_strat_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);

    const avg1 = sub1Scores.length > 0 ? sub1Scores.reduce((a, b) => a + b, 0) / sub1Scores.length : 0;
    const avg2 = sub2Scores.length > 0 ? sub2Scores.reduce((a, b) => a + b, 0) / sub2Scores.length : 0;
    const avg3 = sub3Scores.length > 0 ? sub3Scores.reduce((a, b) => a + b, 0) / sub3Scores.length : 0;

    let totalWeight = 0;
    let weightedSum = 0;
    if (avg1 > 0) { weightedSum += avg1 * 0.50; totalWeight += 0.50; }
    if (avg2 > 0) { weightedSum += avg2 * 0.35; totalWeight += 0.35; }
    if (avg3 > 0) { weightedSum += avg3 * 0.15; totalWeight += 0.15; }

    if (totalWeight > 0) {
      return Number((weightedSum / totalWeight).toFixed(2));
    }
  }

  // Regla especial parametrizada para Dirección de Operaciones (Sub1 50%, Sub2 35%, Sub3 15%)
  const hasOpKeys = Object.keys(data.scores).some(k => k.startsWith('op_'));
  if (hasOpKeys) {
    const sub1Scores = ['op_kpi_1', 'op_kpi_2', 'op_kpi_3', 'op_kpi_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub2Scores = [
      'op_cond_1', 'op_cond_2', 'op_cond_3', 'op_cond_4',
      'op_cond_5', 'op_cond_6', 'op_cond_7', 'op_cond_8'
    ]
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub3Scores = ['op_strat_1', 'op_strat_2', 'op_strat_3', 'op_strat_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);

    const avg1 = sub1Scores.length > 0 ? sub1Scores.reduce((a, b) => a + b, 0) / sub1Scores.length : 0;
    const avg2 = sub2Scores.length > 0 ? sub2Scores.reduce((a, b) => a + b, 0) / sub2Scores.length : 0;
    const avg3 = sub3Scores.length > 0 ? sub3Scores.reduce((a, b) => a + b, 0) / sub3Scores.length : 0;

    let totalWeight = 0;
    let weightedSum = 0;
    if (avg1 > 0) { weightedSum += avg1 * 0.50; totalWeight += 0.50; }
    if (avg2 > 0) { weightedSum += avg2 * 0.35; totalWeight += 0.35; }
    if (avg3 > 0) { weightedSum += avg3 * 0.15; totalWeight += 0.15; }

    if (totalWeight > 0) {
      return Number((weightedSum / totalWeight).toFixed(2));
    }
  }

  // Regla especial parametrizada para Dirección de Compras (Sub1 50%, Sub2 35%, Sub3 15%)
  const hasCpKeys = Object.keys(data.scores).some(k => k.startsWith('cp_'));
  if (hasCpKeys) {
    const sub1Scores = ['cp_kpi_1', 'cp_kpi_2', 'cp_kpi_3', 'cp_kpi_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub2Scores = ['cp_cond_1', 'cp_cond_2', 'cp_cond_3', 'cp_cond_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub3Scores = ['cp_strat_1', 'cp_strat_2', 'cp_strat_3']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);

    const avg1 = sub1Scores.length > 0 ? sub1Scores.reduce((a, b) => a + b, 0) / sub1Scores.length : 0;
    const avg2 = sub2Scores.length > 0 ? sub2Scores.reduce((a, b) => a + b, 0) / sub2Scores.length : 0;
    const avg3 = sub3Scores.length > 0 ? sub3Scores.reduce((a, b) => a + b, 0) / sub3Scores.length : 0;

    let totalWeight = 0;
    let weightedSum = 0;
    if (avg1 > 0) { weightedSum += avg1 * 0.50; totalWeight += 0.50; }
    if (avg2 > 0) { weightedSum += avg2 * 0.35; totalWeight += 0.35; }
    if (avg3 > 0) { weightedSum += avg3 * 0.15; totalWeight += 0.15; }

    if (totalWeight > 0) {
      return Number((weightedSum / totalWeight).toFixed(2));
    }
  }

  // Regla especial parametrizada para Dirección de Tecnología de la Información (TI) (Sub1 50%, Sub2 35%, Sub3 15%)
  const hasTiKeys = Object.keys(data.scores).some(k => k.startsWith('ti_'));
  if (hasTiKeys) {
    const sub1Scores = ['ti_kpi_1', 'ti_kpi_2', 'ti_kpi_3', 'ti_kpi_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub2Scores = ['ti_cond_1', 'ti_cond_2', 'ti_cond_3', 'ti_cond_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub3Scores = ['ti_strat_1', 'ti_strat_2', 'ti_strat_3']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);

    const avg1 = sub1Scores.length > 0 ? sub1Scores.reduce((a, b) => a + b, 0) / sub1Scores.length : 0;
    const avg2 = sub2Scores.length > 0 ? sub2Scores.reduce((a, b) => a + b, 0) / sub2Scores.length : 0;
    const avg3 = sub3Scores.length > 0 ? sub3Scores.reduce((a, b) => a + b, 0) / sub3Scores.length : 0;

    let totalWeight = 0;
    let weightedSum = 0;
    if (avg1 > 0) { weightedSum += avg1 * 0.50; totalWeight += 0.50; }
    if (avg2 > 0) { weightedSum += avg2 * 0.35; totalWeight += 0.35; }
    if (avg3 > 0) { weightedSum += avg3 * 0.15; totalWeight += 0.15; }

    if (totalWeight > 0) {
      return Number((weightedSum / totalWeight).toFixed(2));
    }
  }

  // Regla especial parametrizada para Dirección de Transporte y Logística (CENDIS) (Sub1 50%, Sub2 35%, Sub3 15%)
  const hasTlKeys = Object.keys(data.scores).some(k => k.startsWith('tl_'));
  if (hasTlKeys) {
    const sub1Scores = ['tl_kpi_1', 'tl_kpi_2', 'tl_kpi_3', 'tl_kpi_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub2Scores = ['tl_cond_1', 'tl_cond_2', 'tl_cond_3', 'tl_cond_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub3Scores = ['tl_strat_1', 'tl_strat_2', 'tl_strat_3']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);

    const avg1 = sub1Scores.length > 0 ? sub1Scores.reduce((a, b) => a + b, 0) / sub1Scores.length : 0;
    const avg2 = sub2Scores.length > 0 ? sub2Scores.reduce((a, b) => a + b, 0) / sub2Scores.length : 0;
    const avg3 = sub3Scores.length > 0 ? sub3Scores.reduce((a, b) => a + b, 0) / sub3Scores.length : 0;

    let totalWeight = 0;
    let weightedSum = 0;
    if (avg1 > 0) { weightedSum += avg1 * 0.50; totalWeight += 0.50; }
    if (avg2 > 0) { weightedSum += avg2 * 0.35; totalWeight += 0.35; }
    if (avg3 > 0) { weightedSum += avg3 * 0.15; totalWeight += 0.15; }

    if (totalWeight > 0) {
      return Number((weightedSum / totalWeight).toFixed(2));
    }
  }

  // Regla especial parametrizada para Dirección de Talento Humano (DTH) (Sub1 50%, Sub2 35%, Sub3 15%)
  const hasThKeys = Object.keys(data.scores).some(k => k.startsWith('th_'));
  if (hasThKeys) {
    const sub1Scores = ['th_kpi_1', 'th_kpi_2', 'th_kpi_3', 'th_kpi_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub2Scores = ['th_cond_1', 'th_cond_2', 'th_cond_3', 'th_cond_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub3Scores = ['th_strat_1', 'th_strat_2', 'th_strat_3']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);

    const avg1 = sub1Scores.length > 0 ? sub1Scores.reduce((a, b) => a + b, 0) / sub1Scores.length : 0;
    const avg2 = sub2Scores.length > 0 ? sub2Scores.reduce((a, b) => a + b, 0) / sub2Scores.length : 0;
    const avg3 = sub3Scores.length > 0 ? sub3Scores.reduce((a, b) => a + b, 0) / sub3Scores.length : 0;

    let totalWeight = 0;
    let weightedSum = 0;
    if (avg1 > 0) { weightedSum += avg1 * 0.50; totalWeight += 0.50; }
    if (avg2 > 0) { weightedSum += avg2 * 0.35; totalWeight += 0.35; }
    if (avg3 > 0) { weightedSum += avg3 * 0.15; totalWeight += 0.15; }

    if (totalWeight > 0) {
      return Number((weightedSum / totalWeight).toFixed(2));
    }
  }

  // Regla especial parametrizada para Dirección de Administración y Finanzas (DAF) (Sub1 50%, Sub2 35%, Sub3 15%)
  const hasDafKeys = Object.keys(data.scores).some(k => k.startsWith('daf_'));
  if (hasDafKeys) {
    const sub1Scores = ['daf_kpi_1', 'daf_kpi_2', 'daf_kpi_3', 'daf_kpi_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub2Scores = ['daf_cond_1', 'daf_cond_2', 'daf_cond_3', 'daf_cond_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub3Scores = ['daf_strat_1', 'daf_strat_2', 'daf_strat_3']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);

    const avg1 = sub1Scores.length > 0 ? sub1Scores.reduce((a, b) => a + b, 0) / sub1Scores.length : 0;
    const avg2 = sub2Scores.length > 0 ? sub2Scores.reduce((a, b) => a + b, 0) / sub2Scores.length : 0;
    const avg3 = sub3Scores.length > 0 ? sub3Scores.reduce((a, b) => a + b, 0) / sub3Scores.length : 0;

    let totalWeight = 0;
    let weightedSum = 0;
    if (avg1 > 0) { weightedSum += avg1 * 0.50; totalWeight += 0.50; }
    if (avg2 > 0) { weightedSum += avg2 * 0.35; totalWeight += 0.35; }
    if (avg3 > 0) { weightedSum += avg3 * 0.15; totalWeight += 0.15; }

    if (totalWeight > 0) {
      return Number((weightedSum / totalWeight).toFixed(2));
    }
  }

  // Regla especial parametrizada para Dirección Comercial (COM) (Sub1 50%, Sub2 35%, Sub3 15%)
  const hasComKeys = Object.keys(data.scores).some(k => k.startsWith('com_'));
  if (hasComKeys) {
    const sub1Scores = ['com_kpi_1', 'com_kpi_2', 'com_kpi_3', 'com_kpi_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub2Scores = ['com_cond_1', 'com_cond_2', 'com_cond_3', 'com_cond_4']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const sub3Scores = ['com_strat_1', 'com_strat_2', 'com_strat_3']
      .map(k => data.scores[k])
      .filter((v): v is number => typeof v === 'number' && v > 0);

    const avg1 = sub1Scores.length > 0 ? sub1Scores.reduce((a, b) => a + b, 0) / sub1Scores.length : 0;
    const avg2 = sub2Scores.length > 0 ? sub2Scores.reduce((a, b) => a + b, 0) / sub2Scores.length : 0;
    const avg3 = sub3Scores.length > 0 ? sub3Scores.reduce((a, b) => a + b, 0) / sub3Scores.length : 0;

    let totalWeight = 0;
    let weightedSum = 0;
    if (avg1 > 0) { weightedSum += avg1 * 0.50; totalWeight += 0.50; }
    if (avg2 > 0) { weightedSum += avg2 * 0.35; totalWeight += 0.35; }
    if (avg3 > 0) { weightedSum += avg3 * 0.15; totalWeight += 0.15; }

    if (totalWeight > 0) {
      return Number((weightedSum / totalWeight).toFixed(2));
    }
  }

  const isBlock1 = (k: string) =>
    (k.startsWith('sup') && !k.startsWith('sup-') && !k.startsWith('sup_comp')) ||
    k.startsWith('meta') ||
    k.startsWith('se') ||
    k.includes('goal') ||
    k.includes('b1') ||
    ['q1', 'q2'].includes(k);

  return extractAverage(data, isBlock1) || fallbackAvg;
}

/**
 * Calculates official performance metrics according to Universo Canguro governance:
 * Bloque 1 (60%): Medición de indicadores y objetivos clave (KPI´s) cuantificables.
 * Bloque 2 (30%): Dominio de competencias cardinales y específicas del área.
 * Bloque 3 (10%): Evaluación de Potencial y Liderazgo (agilidad, aspiración y movilización).
 * Puntuación en bruto = 100% de la calificación total.
 */
export function calculateConsolidatedMetrics(
  selfEval?: EvaluationData,
  supervisorEval?: EvaluationData,
  peerEval?: EvaluationData,
  subordinateEval?: EvaluationData,
  hasSubordinates: boolean = false,
  overridePotentialScore?: number
): CalculatedConsolidatedMetrics {
  // Evaluator total averages
  const selfAvg = extractAverage(selfEval);
  const supAvg = extractAverage(supervisorEval);
  const peerAvg = extractAverage(peerEval);
  const subAvg = extractAverage(subordinateEval);

  const hasAnyEvaluation = (selfAvg > 0 || supAvg > 0 || peerAvg > 0 || subAvg > 0);

  if (!hasAnyEvaluation) {
    return {
      isEvaluated: false,
      block1Score: 0,
      block2Score: 0,
      potentialScore: 0,
      finalScore: 0,
      base100Score: 0,
      meritTier: {
        id: 0 as any,
        name: 'EVALUACIÓN NO REALIZADA (PENDIENTE)',
        minScore: 0,
        maxScore: 0,
        minBase100: 0,
        maxBase100: 0,
        percentile: '0%',
        targetPopulation: 'Colaborador sin evaluaciones registradas',
        salaryPolicy: 'No Aplica (Sin evaluación)',
        pdiStrategy: 'Completar evaluación para calcular diagnóstico',
        enablesSuccession: false,
        color: '#71717A',
        badgeBg: 'bg-zinc-100 border-zinc-300',
        badgeText: 'text-zinc-600',
      },
      enablesSuccession: false,
      potentialLevel: 'Bajo',
      potentialInterpretation: getPotentialLeadershipInterpretation(0),
      radarScores: {
        cardinal: 0,
        leadership: 0,
        specific: 0
      },
      evaluatorAverages: {
        self: 0,
        supervisor: 0,
        peer: 0,
        subordinate: 0
      },
      percentileRank: 0
    };
  }

  // Bloque 1: Medición de Indicadores y Objetivos Clave (KPI's) - 60% peso total
  // Evaluado exclusivamente por: Supervisor Inmediato, Pares y Subordinados
  const supB1 = extractBlock1Score(supervisorEval, supAvg);
  const peerB1 = extractBlock1Score(peerEval, peerAvg);
  const subB1 = extractBlock1Score(subordinateEval, subAvg);
  const selfB1 = extractBlock1Score(selfEval, selfAvg); // Solo fallback si no hay externos

  // Bloque 2: Evaluación por Competencias - 30% peso total
  // Evaluado exclusivamente por la AUTOEVALUACIÓN (con fallback a supervisor solo en datos históricos incompletos)
  const isBlock2 = (k: string) =>
    (k.startsWith('comp') ||
     k.startsWith('card') ||
     k.startsWith('board') ||
     k.startsWith('area') ||
     k.startsWith('sup-') ||
     k.startsWith('sup_comp') ||
     k.includes('b2') ||
     ['q3', 'q4', 'q5'].includes(k)) &&
    !k.startsWith('pot') && !k.startsWith('pq');

  const selfB2 = extractAverage(selfEval, isBlock2) || selfAvg;
  const supB2 = extractAverage(supervisorEval, isBlock2) || supAvg;

  // Asignación de Bloque 2: Únicamente Autoevaluación
  let block2Score = selfB2 > 0 ? selfB2 : (supB2 > 0 ? supB2 : 0);

  // Asignación de Bloque 1: Consolidación de fuentes externas (Supervisor 60%, Pares 20%, Subordinados 20%)
  const hasSub = hasSubordinates && subAvg > 0;
  const hasPeer = peerAvg > 0;
  const hasSup = supAvg > 0;

  let block1Score = 0;
  let totalWeightB1 = 0;

  if (hasSup && supB1 > 0) {
    let wSup = 0.60;
    if (!hasPeer) wSup += 0.20;
    if (!hasSub) wSup += 0.20;
    block1Score += supB1 * wSup;
    totalWeightB1 += wSup;
  }
  if (hasPeer && peerB1 > 0) {
    block1Score += peerB1 * 0.20;
    totalWeightB1 += 0.20;
  }
  if (hasSub && subB1 > 0) {
    block1Score += subB1 * 0.20;
    totalWeightB1 += 0.20;
  }

  if (totalWeightB1 > 0) {
    block1Score = Number((block1Score / totalWeightB1).toFixed(2));
  } else if (selfB1 > 0) {
    block1Score = selfB1;
  }

  if (block1Score === 0) block1Score = block2Score;
  if (block2Score === 0) block2Score = block1Score;

  // Bloque 3: Evaluación de Potencial y Liderazgo (Sección 3 - 10% peso total)
  const combinedScoresForPot: Record<string, number> = {
    ...(selfEval?.scores || {}),
    ...(peerEval?.scores || {}),
    ...(subordinateEval?.scores || {}),
    ...(supervisorEval?.scores || {}) // Supervisor tiene prioridad
  };
  const potRes = calculatePotentialLeadershipScores(combinedScoresForPot);
  let potentialScore = 0;
  if (potRes.answeredCount > 0) {
    potentialScore = potRes.yScore;
  } else {
    // Si no existen los reactivos pot_1..pot_18, evaluar items situacionales o pq
    const isPot = (k: string) => k.startsWith('pot') || k.startsWith('pq') || k.includes('potencial') || k.includes('potential');
    const supPot = extractAverage(supervisorEval, isPot);
    const selfPot = extractAverage(selfEval, isPot);
    if (supPot > 0) potentialScore = supPot;
    else if (selfPot > 0) potentialScore = selfPot;
    else if (overridePotentialScore && overridePotentialScore > 0) {
      potentialScore = overridePotentialScore;
    } else {
      // Proxy conductual de liderazgo a partir del bloque 2
      potentialScore = block2Score > 0 ? Number((block2Score * 0.98).toFixed(2)) : block1Score;
    }
  }
  potentialScore = Number(Math.max(1, Math.min(5, potentialScore)).toFixed(2));

  // Fórmula Oficial Modificada por Gobernanza Canguro:
  // Medición de indicadores y objetivos clave (KPI´s) = 60%
  // Evaluación por Competencias = 30%
  // Evaluación de Potencial y Liderazgo = 10%
  // Puntuación en bruto que equivale al 100% de la calificación total
  const finalScore = Number(((block1Score * 0.60) + (block2Score * 0.30) + (potentialScore * 0.10)).toFixed(2));

  // Vigesimal / Base 100: (finalScore / 5) * 100
  const base100Score = Number(((finalScore / 5) * 100).toFixed(1));

  // Interpretación cualitativa detallada de Potencial y Liderazgo
  const potentialInterpretation = getPotentialLeadershipInterpretation(potentialScore);
  const potentialLevel = potentialInterpretation.level;

  // Map to Guía de Mérito Tramo (1 to 5) basado en la escala oficial de la Campana de Gauss Canguro:
  // DESEMPEÑO INSATISFACTORIO (de 0 a <= 54%)
  // EN DESARROLLO (55% a <= 65%)
  // DESEMPEÑO ESPERADO (66% a <= 79%)
  // DESEMPEÑO SOBRESALIENTE (80% a <= 100%)
  // DESEMPEÑO EXCEPCIONAL (101% a <= 125%)
  let tierId: 1 | 2 | 3 | 4 | 5 = 3;
  if (base100Score > 100) {
    tierId = 5; // Desempeño Excepcional (101% - 125%)
  } else if (base100Score >= 80) {
    tierId = 4; // Desempeño Sobresaliente (80% - 100%)
  } else if (base100Score >= 66) {
    tierId = 3; // Desempeño Esperado (66% - 79%)
  } else if (base100Score >= 55) {
    tierId = 2; // En Desarrollo (55% - 65%)
  } else {
    tierId = 1; // Desempeño Insatisfactorio (de 0 a <= 54%)
  }

  const meritTier = MERIT_TIERS[tierId];
  const enablesSuccession = tierId === 5;

  // Radar categories breakdown:
  // Cardinales: comp_etica, comp_compromiso, comp_servicio, comp_trabajo_equipo
  // Liderazgo / Supervisión: Potencial y liderazgo consolidado (Eje Y)
  // Específicas / Técnicas: metas operativas y comp_especifica
  const cardinalScore = Math.min(5, Math.max(1, Number((block2Score * 1.02).toFixed(2))));
  const leadershipScore = potentialScore > 0
    ? potentialScore
    : Math.min(5, Math.max(1, Number((hasSubordinates ? (block2Score * 0.98) : (block2Score * 0.92)).toFixed(2))));
  const specificScore = Math.min(5, Math.max(1, Number((block1Score * 0.99).toFixed(2))));

  // Percentile approximation along standard curve:
  let percentileRank = 50;
  if (finalScore >= 4.85) percentileRank = 99;
  else if (finalScore >= 4.75) percentileRank = 96;
  else if (finalScore >= 4.50) percentileRank = 88;
  else if (finalScore >= 4.25) percentileRank = 78;
  else if (finalScore >= 4.00) percentileRank = 62;
  else if (finalScore >= 3.75) percentileRank = 45;
  else if (finalScore >= 3.30) percentileRank = 28;
  else if (finalScore >= 3.00) percentileRank = 18;
  else percentileRank = 8;

  return {
    isEvaluated: true,
    block1Score: Number(block1Score.toFixed(2)),
    block2Score: Number(block2Score.toFixed(2)),
    potentialScore: Number(potentialScore.toFixed(2)),
    finalScore,
    base100Score,
    meritTier,
    enablesSuccession,
    potentialLevel,
    potentialInterpretation,
    radarScores: {
      cardinal: cardinalScore,
      leadership: leadershipScore,
      specific: specificScore
    },
    evaluatorAverages: {
      self: Number(selfAvg.toFixed(2)),
      supervisor: Number(supAvg.toFixed(2)),
      peer: Number(peerAvg.toFixed(2)),
      subordinate: Number(subAvg.toFixed(2))
    },
    percentileRank
  };
}
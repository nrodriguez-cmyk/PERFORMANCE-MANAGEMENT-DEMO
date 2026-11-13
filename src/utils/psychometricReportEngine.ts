/**
 * SISTEMA EXPERTO EN EVALUACIÓN PSICOMÉTRICA Y PREDISPOSICIÓN CONDUCTUAL
 * Motor de análisis según el modelo Big Five / OCEAN y matriz de arquetipos.
 */

export type DimensionClassification = 'LOW' | 'MED' | 'HIGH';

export interface DimensionAnalysis {
  key: 'O' | 'C' | 'E' | 'A' | 'N';
  name: string;
  fullName: string;
  score: number; // 0 - 100%
  classification: DimensionClassification;
  interpretation: string;
  strengths: string;
  risks: string;
  color: string;
}

export interface ArchetypeResult {
  code: string;
  title: string;
  tagline: string;
  syntheticDescription: string;
}

export interface PsychometricReport {
  candidateName: string;
  targetPosition: string;
  scores: {
    O: number;
    C: number;
    E: number;
    A: number;
    N: number;
  };
  dimensions: DimensionAnalysis[];
  primaryArchetype: ArchetypeResult;
  secondaryArchetypes: ArchetypeResult[];
  synergies: string;
  blindSpots: string;
  idealWorkEnvironment: string;
  developmentGuidelines: string[];
  markdownReport: string;
}

export const CLASSIFICATION_THRESHOLDS = {
  LOW_MAX: 33,
  MED_MAX: 66,
  HIGH_MIN: 67
};

export function classifyScore(score: number): DimensionClassification {
  if (score <= CLASSIFICATION_THRESHOLDS.LOW_MAX) return 'LOW';
  if (score <= CLASSIFICATION_THRESHOLDS.MED_MAX) return 'MED';
  return 'HIGH';
}

export const DIMENSION_KNOWLEDGE_BASE: Record<
  'O' | 'C' | 'E' | 'A' | 'N',
  {
    name: string;
    fullName: string;
    color: string;
    rules: Record<
      DimensionClassification,
      { interpretation: string; strengths: string; risks: string }
    >;
  }
> = {
  O: {
    name: 'Apertura',
    fullName: 'Apertura a la Experiencia (O)',
    color: '#8B5CF6',
    rules: {
      HIGH: {
        interpretation: 'Pensamiento abstracto, curiosidad intelectual, orientación al cambio e innovación.',
        strengths: 'Creatividad, adaptabilidad, visión estratégica.',
        risks: 'Aburrimiento con tareas rutinarias, tendencia a sobrecomplicar.'
      },
      MED: {
        interpretation: 'Pragmático con apertura moderada. Evalúa la innovación según su utilidad.',
        strengths: 'Criterio realista, equilibrio entre teoría y práctica.',
        risks: 'Indecisión ante metodologías contrapuestas.'
      },
      LOW: {
        interpretation: 'Pragmático, concreto y tradicional. Valora la estabilidad y métodos probados.',
        strengths: 'Eficiencia en procesos estandarizados, consistencia.',
        risks: 'Resistencia al cambio e inflexibilidad ante la incertidumbre.'
      }
    }
  },
  C: {
    name: 'Responsabilidad',
    fullName: 'Responsabilidad / Tesón (C)',
    color: '#F1B400',
    rules: {
      HIGH: {
        interpretation: 'Alta autodisciplina, rigurosidad, meticulosidad y orientación al logro.',
        strengths: 'Confiabilidad, gestión del tiempo, orientación al detalle.',
        risks: 'Perfeccionismo paralizante, dificultad para delegar.'
      },
      MED: {
        interpretation: 'Equilibrio entre estructura y flexibilidad. Cumple metas sin rigidez.',
        strengths: 'Adaptación a imprevistos, agilidad operativa.',
        risks: 'Posible relajación del control de calidad sin supervisión.'
      },
      LOW: {
        interpretation: 'Flexible, espontáneo y orientado al panorama general.',
        strengths: 'Improvisación, alta tolerancia a la ambigüedad.',
        risks: 'Desorganización, procrastinación, omisión de detalles.'
      }
    }
  },
  E: {
    name: 'Extraversión',
    fullName: 'Extraversión (E)',
    color: '#3B82F6',
    rules: {
      HIGH: {
        interpretation: 'Energizado por la interacción social, expresivo, asertivo y dinámico.',
        strengths: 'Comunicación, persuasión, liderazgo de grupos.',
        risks: 'Monopolización de la palabra, impaciencia en tareas solitarias.'
      },
      MED: {
        interpretation: 'Ambiversión. Se adapta a dinámicas grupales y al trabajo individual.',
        strengths: 'Flexibilidad relacional, escucha activa, autorregulación energética.',
        risks: 'Iniciativa variable según el nivel de confianza o energía.'
      },
      LOW: {
        interpretation: 'Introversión. Reflexivo, independiente y concentrado en su mundo interior.',
        strengths: 'Escucha activa, concentración en solitario, autonomía.',
        risks: 'Dificultad para autopromocionarse, baja visibilidad grupal.'
      }
    }
  },
  A: {
    name: 'Amabilidad',
    fullName: 'Amabilidad / Afabilidad (A)',
    color: '#10B981',
    rules: {
      HIGH: {
        interpretation: 'Empático, cooperativo, orientado a la armonía y al servicio.',
        strengths: 'Trabajo en equipo, mediación de conflictos, construcción de confianza.',
        risks: 'Dificultad para decir "no", evasión de confrontaciones necesarias.'
      },
      MED: {
        interpretation: 'Asertividad situacional. Cooperativo pero capaz de ser firme.',
        strengths: 'Negociación equilibrada, diplomacia con firmeza.',
        risks: 'Oscilación entre complacencia y firmeza bajo presión.'
      },
      LOW: {
        interpretation: 'Analítico, competitivo, directo y escéptico.',
        strengths: 'Toma de decisiones difíciles sin sesgo emocional, postura crítica.',
        risks: 'Percepción de aspereza, generación de fricción interpersonal.'
      }
    }
  },
  N: {
    name: 'Neuroticismo',
    fullName: 'Neuroticismo / Inestabilidad Emocional (N)',
    color: '#06B6D4',
    rules: {
      HIGH: {
        interpretation: 'Alta reactividad emocional y sensibilidad al estrés.',
        strengths: 'Detección anticipada de riesgos y fallas, prudencia.',
        risks: 'Vulnerabilidad a la ansiedad, volatilidad bajo presión.'
      },
      MED: {
        interpretation: 'Reactividad moderada. Experimenta urgencia saludable bajo presión.',
        strengths: 'Respuesta proporcionada a crisis, empatía con el estrés del equipo.',
        risks: 'Sensibilidad al estrés prolongado o acumulado.'
      },
      LOW: {
        interpretation: 'Estabilidad emocional alta, serenidad y resiliencia.',
        strengths: 'Manejo de crisis, temple en entornos caóticos.',
        risks: 'Posible subestimación de riesgos reales o percepción de apatía.'
      }
    }
  }
};

/**
 * Resuelve la matriz combinatoria de arquetipos psicológicos según reglas oficiales
 */
export function resolveArchetypes(
  classes: Record<'O' | 'C' | 'E' | 'A' | 'N', DimensionClassification>,
  scores: Record<'O' | 'C' | 'E' | 'A' | 'N', number>
): { primary: ArchetypeResult; secondary: ArchetypeResult[] } {
  const matched: ArchetypeResult[] = [];

  const { O, C, E, A, N } = classes;

  if (C === 'HIGH' && E === 'HIGH') {
    matched.push({
      code: 'C_HIGH_E_HIGH',
      title: 'Ejecutor Dirigente',
      tagline: 'Liderazgo orientado a metas y alto ritmo',
      syntheticDescription:
        'Combina una estricta autodisciplina operativa con alta persuasión y proactividad relacional, dirigiendo al equipo con ritmo acelerado y foco inequívoco en el cumplimiento de metas.'
    });
  }

  if (C === 'HIGH' && E === 'LOW') {
    matched.push({
      code: 'C_HIGH_E_LOW',
      title: 'Ejecutor Técnico',
      tagline: 'Organizado, minucioso e independiente',
      syntheticDescription:
        'Destaca por un enfoque meticuloso y alta autosuficiencia técnica; gestiona procesos complejos con rigor analítico sin requerir constante validación o interacción externa.'
    });
  }

  if (O === 'HIGH' && C === 'HIGH') {
    matched.push({
      code: 'O_HIGH_C_HIGH',
      title: 'Innovador Estructurado',
      tagline: 'Concibe ideas disruptivas con método de ejecución',
      syntheticDescription:
        'Articula una visión estratégica orientada a la transformación del negocio con métodos rigurosos de implementación, cerrando la brecha entre la ideación creativa y los resultados concretos.'
    });
  }

  if (O === 'HIGH' && C === 'LOW') {
    matched.push({
      code: 'O_HIGH_C_LOW',
      title: 'Creativo Disruptivo',
      tagline: 'Ideación constante; requiere apoyo en seguimiento',
      syntheticDescription:
        'Generador prolífico de conceptos transformadores y pensamiento lateral; maximiza su impacto cuando cuenta con apoyo operativo en el control de cronogramas y seguimiento de detalles.'
    });
  }

  if (O === 'LOW' && C === 'HIGH') {
    matched.push({
      code: 'O_LOW_C_HIGH',
      title: 'Operativo Estandarizado',
      tagline: 'Excelencia en procesos probados y control de calidad',
      syntheticDescription:
        'Custodio de la consistencia y la exactitud procedimental; garantiza que las rutinas, auditorías y normativas institucionales se ejecuten de forma impecable y predecible.'
    });
  }

  if (N === 'LOW' && C === 'HIGH') {
    matched.push({
      code: 'N_LOW_C_HIGH',
      title: 'Resiliente de Crisis',
      tagline: 'Alta confiabilidad y serenidad ante contingencias',
      syntheticDescription:
        'Mantiene el temple y la claridad metodológica frente a contingencias críticas o picos de demanda operativa, transmitiendo certidumbre y control a la estructura.'
    });
  }

  if (E === 'HIGH' && A === 'HIGH') {
    matched.push({
      code: 'E_HIGH_A_HIGH',
      title: 'Integrador Social',
      tagline: 'Facilitador de cohesión y motivación de equipos',
      syntheticDescription:
        'Genera climas de alta confianza y cohesión interpersonal mediante una comunicación empática y motivadora, inspirando colaboración armónica orientada a propósitos compartidos.'
    });
  }

  if (E === 'LOW' && A === 'LOW') {
    matched.push({
      code: 'E_LOW_A_LOW',
      title: 'Analítico Independiente',
      tagline: 'Evaluación objetiva y distante basada en datos',
      syntheticDescription:
        'Evalúa escenarios con distanciamiento emocional y criterio estrictamente cuantitativo, formulando diagnósticos objetivos indispensables en comités de control de riesgos.'
    });
  }

  // Fallback o perfil equilibrado si todas son MED o no se activó regla extrema
  if (matched.length === 0 || (O === 'MED' && C === 'MED' && E === 'MED' && A === 'MED' && N === 'MED')) {
    matched.push({
      code: 'ALL_MED',
      title: 'Perfil Equilibrado y Adaptativo',
      tagline: 'Alta versatilidad sintónica con el entorno',
      syntheticDescription:
        'Evidencia una configuración balanceada sin polarizaciones conductuales severas, lo que le permite alternar entre liderazgo participativo y trabajo concentrado según las exigencias del entorno.'
    });
  }

  // Ordenar por dominancia según el extremo de los puntajes combinados
  const getWeight = (archetypeCode: string): number => {
    switch (archetypeCode) {
      case 'O_HIGH_C_HIGH': return scores.O + scores.C;
      case 'C_HIGH_E_HIGH': return scores.C + scores.E;
      case 'N_LOW_C_HIGH': return (100 - scores.N) + scores.C;
      case 'E_HIGH_A_HIGH': return scores.E + scores.A;
      case 'C_HIGH_E_LOW': return scores.C + (100 - scores.E);
      case 'O_LOW_C_HIGH': return (100 - scores.O) + scores.C;
      case 'E_LOW_A_LOW': return (100 - scores.E) + (100 - scores.A);
      case 'O_HIGH_C_LOW': return scores.O + (100 - scores.C);
      default: return 100;
    }
  };

  matched.sort((a, b) => getWeight(b.code) - getWeight(a.code));

  return {
    primary: matched[0],
    secondary: matched.slice(1)
  };
}

/**
 * Genera el informe psicométrico completo y validado
 */
export function generatePsychometricReport(params: {
  candidateName: string;
  targetPosition?: string;
  scores: {
    O: number;
    C: number;
    E: number;
    A: number;
    N: number;
  };
}): PsychometricReport {
  const { candidateName, targetPosition = 'Cargo a Postular', scores } = params;

  // Normalización acotada (0 a 100)
  const safeScores = {
    O: Math.max(0, Math.min(100, Math.round(scores.O))),
    C: Math.max(0, Math.min(100, Math.round(scores.C))),
    E: Math.max(0, Math.min(100, Math.round(scores.E))),
    A: Math.max(0, Math.min(100, Math.round(scores.A))),
    N: Math.max(0, Math.min(100, Math.round(scores.N)))
  };

  const classes = {
    O: classifyScore(safeScores.O),
    C: classifyScore(safeScores.C),
    E: classifyScore(safeScores.E),
    A: classifyScore(safeScores.A),
    N: classifyScore(safeScores.N)
  };

  const dimensions: DimensionAnalysis[] = (['O', 'C', 'E', 'A', 'N'] as const).map(key => {
    const info = DIMENSION_KNOWLEDGE_BASE[key];
    const classification = classes[key];
    const rule = info.rules[classification];
    return {
      key,
      name: info.name,
      fullName: info.fullName,
      score: safeScores[key],
      classification,
      interpretation: rule.interpretation,
      strengths: rule.strengths,
      risks: rule.risks,
      color: info.color
    };
  });

  const { primary, secondary } = resolveArchetypes(classes, safeScores);

  // Generación de Sinergias y Puntos Ciegos del Perfil Integrado
  const highTraits = dimensions.filter(d => d.classification === 'HIGH');
  const lowTraits = dimensions.filter(d => d.classification === 'LOW');

  let synergies = `La convergencia de alta autodisciplina (${safeScores.C}%) y dinamismo relacional (${safeScores.E}%) impulsa una ejecución rápida sin descuido del orden técnico ni de la movilización de personas.`;
  if (classes.O === 'HIGH' && classes.C === 'HIGH') {
    synergies += ` Su apertura a la innovación (${safeScores.O}%) combinada con alto rigor metodológico asegura que las iniciativas de modernización se traduzcan en proyectos sostenibles con retorno tangible.`;
  }
  if (classes.N === 'LOW') {
    synergies += ` Su excepcional estabilidad emocional (${100 - safeScores.N}% de resiliencia / N: ${safeScores.N}%) provee templanza en situaciones de crisis o alta fricción operativa.`;
  }

  let blindSpots = `El exceso de meticulosidad y orientación al logro puede inducir perfeccionismo paralizante o sobrecarga personal por dificultad para delegar.`;
  if (classes.A === 'HIGH') {
    blindSpots += ` Asimismo, su marcada afabilidad y vocación de servicio (${safeScores.A}%) podría ralentizar conversaciones difíciles o postergar medidas disciplinarias cuando se requiere confrontar desvíos con firmeza.`;
  }
  if (classes.E === 'HIGH') {
    blindSpots += ` En debates grupales debe moderar la velocidad comunicacional para otorgar espacio a colaboradores con estilos de pensamiento más reflexivos.`;
  }

  // Entorno preferente
  const idealWorkEnvironment =
    `Ambiente corporativo o de operaciones comerciales con metas desafiantes, alto grado de autonomía para la toma de decisiones, liderazgo de equipos multidisciplinarios y apertura hacia la optimización continua de procesos. Requiere estructuras organizacionales claras pero no burocráticas, donde la proactividad sea reconocida y se promueva la excelencia en el servicio al cliente interno y externo.`;

  // Pautas de desarrollo profesional
  const developmentGuidelines = [
    `Instituir un protocolo consciente de delegación progresiva: definir umbrales de riesgo aceptables y transferir la ejecución de tareas operativas para proteger su foco en la estrategia y dirección.`,
    `Fortalecer la asertividad en conversaciones difíciles: desacoplar la empatía humana de la exigencia técnica al corregir brechas de desempeño, evitando que el deseo de armonía dilate decisiones correctivas necesarias.`,
    `Establecer pausas de calibración de ritmo: asegurar que las demandas de aceleración operativa no generen sobreexigencia involuntaria sobre colaboradores con estilos de trabajo más deliberativos.`
  ];

  // Construcción del documento Markdown estricto según la especificación del requerimiento
  const markdownReport = `# INFORME DE EVALUACIÓN PSICOMÉTRICA - PREDISPOSICIÓN CONDUCTUAL Y ADECUACIÓN AL NUEVO CARGO

**Nombre del Evaluado:** ${candidateName}  
**Cargo Postulado:** ${targetPosition}  
**Puntuaciones Obtenidas:** Apertura (O): ${safeScores.O}% | Responsabilidad (C): ${safeScores.C}% | Extraversión (E): ${safeScores.E}% | Amabilidad (A): ${safeScores.A}% | Neuroticismo (N): ${safeScores.N}%

---

## MÓDULO I: RESUMEN EJECUTIVO Y ARQUETIPO GENERAL
* **Arquetipo Principal:** ${primary.title} (${primary.tagline})
${secondary.length > 0 ? `* **Arquetipos Complementarios:** ${secondary.map(s => `${s.title} (${s.tagline})`).join(' • ')}\n` : ''}* **Descripción Sintética:** ${primary.syntheticDescription}

---

## MÓDULO II: ANÁLISIS DETALLADO POR DIMENSIÓN

### 1. Apertura a la Experiencia (O) — Clasificación: ${classes.O} (${safeScores.O}%)
* **Interpretación:** ${DIMENSION_KNOWLEDGE_BASE.O.rules[classes.O].interpretation}
* **Fortalezas Clave:** ${DIMENSION_KNOWLEDGE_BASE.O.rules[classes.O].strengths}
* **Riesgos / Puntos Ciegos:** ${DIMENSION_KNOWLEDGE_BASE.O.rules[classes.O].risks}

### 2. Responsabilidad / Tesón (C) — Clasificación: ${classes.C} (${safeScores.C}%)
* **Interpretación:** ${DIMENSION_KNOWLEDGE_BASE.C.rules[classes.C].interpretation}
* **Fortalezas Clave:** ${DIMENSION_KNOWLEDGE_BASE.C.rules[classes.C].strengths}
* **Riesgos / Puntos Ciegos:** ${DIMENSION_KNOWLEDGE_BASE.C.rules[classes.C].risks}

### 3. Extraversión (E) — Clasificación: ${classes.E} (${safeScores.E}%)
* **Interpretación:** ${DIMENSION_KNOWLEDGE_BASE.E.rules[classes.E].interpretation}
* **Fortalezas Clave:** ${DIMENSION_KNOWLEDGE_BASE.E.rules[classes.E].strengths}
* **Riesgos / Puntos Ciegos:** ${DIMENSION_KNOWLEDGE_BASE.E.rules[classes.E].risks}

### 4. Amabilidad / Afabilidad (A) — Clasificación: ${classes.A} (${safeScores.A}%)
* **Interpretación:** ${DIMENSION_KNOWLEDGE_BASE.A.rules[classes.A].interpretation}
* **Fortalezas Clave:** ${DIMENSION_KNOWLEDGE_BASE.A.rules[classes.A].strengths}
* **Riesgos / Puntos Ciegos:** ${DIMENSION_KNOWLEDGE_BASE.A.rules[classes.A].risks}

### 5. Neuroticismo / Inestabilidad Emocional (N) — Clasificación: ${classes.N} (${safeScores.N}%)
* **Interpretación:** ${DIMENSION_KNOWLEDGE_BASE.N.rules[classes.N].interpretation}
* **Fortalezas Clave:** ${DIMENSION_KNOWLEDGE_BASE.N.rules[classes.N].strengths}
* **Riesgos / Puntos Ciegos:** ${DIMENSION_KNOWLEDGE_BASE.N.rules[classes.N].risks}

---

## MÓDULO III: SINERGIAS Y PUNTOS CIEGOS DEL PERFIL INTEGRADO
* **Sinergias Principales:** ${synergies}
* **Principales Puntos Ciegos:** ${blindSpots}

---

## MÓDULO IV: ENTORNO IDEAL DE TRABAJO Y RECOMENDACIONES
* **Entorno Preferente de Trabajo:** ${idealWorkEnvironment}
* **Pautas de Desarrollo Profesional:**
${developmentGuidelines.map((g, i) => `  ${i + 1}. ${g}`).join('\n')}
`;

  return {
    candidateName,
    targetPosition,
    scores: safeScores,
    dimensions,
    primaryArchetype: primary,
    secondaryArchetypes: secondary,
    synergies,
    blindSpots,
    idealWorkEnvironment,
    developmentGuidelines,
    markdownReport
  };
}

import { lookupPositionInCatalog } from '../data/jobPositionsCatalog';

export type ResponsibilityLevel = 'alto' | 'medio' | 'bajo';
export type ManagementLevel = 'ESTRATÉGICO' | 'TÉCNICO / INTERMEDIO' | 'OPERATIVO';

/**
 * Resuelve el Nivel de Responsabilidad del Cargo para la Sección 1:
 * - NIVEL ALTO (ESTRATÉGICO): Gerente, Director, Presidente, Junta Directiva, CIO.
 * - NIVEL MEDIO (TÉCNICO / INTERMEDIO): Coordinador, Supervisor, Subgerente, Jefe, Líder, Responsable.
 * - NIVEL BAJO (OPERATIVO): Auditor Financiero, Auditor, Analista, Especialista, Asistente, Asesor, Operador.
 *
 * Prioridad:
 * 1. Consulta el Catálogo Institucional de Cargos (localStorage / DB)
 * 2. Si no existe coincidencia, aplica la heurística algorítmica por palabras clave.
 */
export function resolveResponsibilityLevel(position: string = ''): ResponsibilityLevel {
  if (!position) return 'bajo';

  // 1. Verificación en el Catálogo Institucional de Cargos
  const catalogMatch = lookupPositionInCatalog(position);
  if (catalogMatch.found) {
    if (catalogMatch.managementLevel === 'ESTRATÉGICO') return 'alto';
    if (catalogMatch.managementLevel === 'TÉCNICO / INTERMEDIO') return 'medio';
    return 'bajo';
  }

  const p = (position || '').toLowerCase().trim();
  
  // Casos específicos de Operaciones y Compras donde ciertos roles son Nivel Medio
  if (
    p.includes('gerente de tienda') || 
    p.includes('responsable de tienda') ||
    p.includes('category manager') ||
    p.includes('supervisor de categoría') ||
    p.includes('supervisor de categoria')
  ) {
    return 'medio';
  }

  if (
    p.includes('director') ||
    p.includes('gerente') ||
    p.includes('presidente') ||
    p.includes('junta') ||
    p.includes('cio')
  ) {
    return 'alto';
  }
  if (
    p.includes('coordinador') ||
    p.includes('supervisor') ||
    p.includes('subgerente') ||
    p.includes('jefe') ||
    p.includes('lider') ||
    p.includes('líder') ||
    p.includes('responsable') ||
    p.includes('category') ||
    p.includes('scrum') ||
    p.includes('lead')
  ) {
    return 'medio';
  }
  return 'bajo';
}

/**
 * Devuelve la denominación oficial institucional del Nivel de Gestión
 * según la taxonomía corporativa (ESTRATÉGICO | TÉCNICO / INTERMEDIO | OPERATIVO)
 */
export function getManagementLevel(position: string = ''): ManagementLevel {
  const catalogMatch = lookupPositionInCatalog(position);
  if (catalogMatch.found) {
    return catalogMatch.managementLevel;
  }

  const level = resolveResponsibilityLevel(position);
  if (level === 'alto') return 'ESTRATÉGICO';
  if (level === 'medio') return 'TÉCNICO / INTERMEDIO';
  return 'OPERATIVO';
}

export const RESPONSIBILITY_METADATA: Record<ResponsibilityLevel, {
  managementLevel: ManagementLevel;
  name: string;
  shortLabel: string;
  focus: string;
  verbs: string;
  badgeClass: string;
}> = {
  alto: {
    managementLevel: 'ESTRATÉGICO',
    name: 'Nivel 3: Estratégico (Directores y Gerentes)',
    shortLabel: 'ESTRATÉGICO',
    focus: 'Responsabilidad directa sobre la meta macro, estrategia y salud financiera del área.',
    verbs: 'Garantizar, responder por el resultado macro, definir estrategias, tomar decisiones de impacto.',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
  },
  medio: {
    managementLevel: 'TÉCNICO / INTERMEDIO',
    name: 'Nivel 2: Técnico / Intermedio (Coordinadores y Supervisores)',
    shortLabel: 'TÉCNICO / INTERMEDIO',
    focus: 'Supervisión de procesos, gestión de equipos, seguimiento semanal y ejecución de planes de acción.',
    verbs: 'Supervisar, coordinar, controlar la ejecución, gestionar desviaciones, liderar planes de corrección.',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
  },
  bajo: {
    managementLevel: 'OPERATIVO',
    name: 'Nivel 1: Base / Operativo (Auditores, Analistas, Especialistas)',
    shortLabel: 'OPERATIVO',
    focus: 'Operación impecable, rigor técnico, precisión en el manejo de información y ejecución oportuna.',
    verbs: 'Ejecutar, registrar, analizar data, reportar oportunamente, aplicar procedimientos normativos.',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  }
};

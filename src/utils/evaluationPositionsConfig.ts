/**
 * Utilidad de Configuración y Gobernanza de Cargos Habilitados para la Evaluación del Desempeño
 * Permite a la Dirección de Talento Humano habilitar o inhabilitar qué cargos participan en el ciclo.
 * 
 * Por defecto institucional:
 * - HABILITADOS: Gerentes, Coordinadores y Supervisores (Línea de Liderazgo)
 * - NO HABILITADOS: Directores, Especialistas, Analistas, Operadores, Asesores Integrales
 */

export interface PositionFamily {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  defaultEnabled: boolean;
  keywords: string[];
  color: string;
  bgLight: string;
  borderLight: string;
  textColor: string;
}

export const OFFICIAL_POSITION_FAMILIES: PositionFamily[] = [
  {
    id: 'gerentes',
    name: 'Gerentes',
    shortLabel: 'Gerencia',
    description: 'Gerentes de Operaciones, TI, Finanzas, Comercial, TH, CENDIS, Auditoría, etc.',
    defaultEnabled: true,
    keywords: ['gerente'],
    color: '#D97706',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-300',
    textColor: 'text-amber-900'
  },
  {
    id: 'coordinadores',
    name: 'Coordinadores',
    shortLabel: 'Coordinación',
    description: 'Coordinadores de Tienda, Zonales, Auditoría, Logística, Infraestructura, etc.',
    defaultEnabled: true,
    keywords: ['coordinador'],
    color: '#2563EB',
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-300',
    textColor: 'text-blue-900'
  },
  {
    id: 'supervisores',
    name: 'Supervisores',
    shortLabel: 'Supervisión',
    description: 'Supervisores de Tienda, CECOM, Almacén CENDIS, Gestión Operativa, etc.',
    defaultEnabled: true,
    keywords: ['supervisor'],
    color: '#059669',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-300',
    textColor: 'text-emerald-900'
  },
  {
    id: 'directores',
    name: 'Directores',
    shortLabel: 'Dirección',
    description: 'Directores de Área Corporativa (Evaluación de Junta Directiva / Excluidos del ciclo regular)',
    defaultEnabled: false,
    keywords: ['director'],
    color: '#7C3AED',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-300',
    textColor: 'text-purple-900'
  },
  {
    id: 'especialistas',
    name: 'Especialistas',
    shortLabel: 'Especialistas',
    description: 'Especialistas de TI, Compras, Finanzas, Procesos y Desarrollo',
    defaultEnabled: false,
    keywords: ['especialista'],
    color: '#0D9488',
    bgLight: 'bg-teal-50',
    borderLight: 'border-teal-300',
    textColor: 'text-teal-900'
  },
  {
    id: 'analistas',
    name: 'Analistas y Auditores',
    shortLabel: 'Analistas',
    description: 'Analistas de Nómina, Contabilidad, Tesorería, Auditores Financieros y Operativos',
    defaultEnabled: false,
    keywords: ['analista', 'auditor'],
    color: '#4B5563',
    bgLight: 'bg-zinc-100',
    borderLight: 'border-zinc-300',
    textColor: 'text-zinc-800'
  },
  {
    id: 'asesores',
    name: 'Asesores Integrales de Tienda',
    shortLabel: 'Asesores Tienda',
    description: 'Asesores Integrales de Piso de Venta, Caja y Atención al Cliente en tiendas',
    defaultEnabled: false,
    keywords: ['asesor'],
    color: '#E11D48',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-300',
    textColor: 'text-rose-900'
  },
  {
    id: 'operadores',
    name: 'Operadores Integrales y Almacén',
    shortLabel: 'Operadores / CENDIS',
    description: 'Operadores CECOM, Auxiliares de Almacén, Montacarguistas, Conductores y Flota',
    defaultEnabled: false,
    keywords: ['operador', 'auxiliar', 'chofer', 'conductor', 'almacenista'],
    color: '#EA580C',
    bgLight: 'bg-orange-50',
    borderLight: 'border-orange-300',
    textColor: 'text-orange-900'
  },
  {
    id: 'encargados',
    name: 'Encargados de Tienda',
    shortLabel: 'Encargados',
    description: 'Encargados y sub-encargados de tienda en relevo operativo',
    defaultEnabled: false,
    keywords: ['encargado'],
    color: '#6366F1',
    bgLight: 'bg-indigo-50',
    borderLight: 'border-indigo-300',
    textColor: 'text-indigo-900'
  }
];

const FAMILIES_STORAGE_KEY = 'canguro_enabled_position_families';
const OVERRIDES_STORAGE_KEY = 'canguro_custom_position_overrides';

/**
 * Obtiene el mapa de familias habilitadas desde localStorage o valores iniciales oficiales
 */
export function getEnabledPositionFamilies(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem(FAMILIES_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}

  const initial: Record<string, boolean> = {};
  OFFICIAL_POSITION_FAMILIES.forEach(f => {
    initial[f.id] = f.defaultEnabled;
  });
  return initial;
}

/**
 * Guarda el mapa de familias habilitadas
 */
export function setEnabledPositionFamilies(families: Record<string, boolean>): void {
  try {
    localStorage.setItem(FAMILIES_STORAGE_KEY, JSON.stringify(families));
    window.dispatchEvent(new Event('canguro_positions_config_changed'));
  } catch (e) {
    console.error('Error saving position families config', e);
  }
}

/**
 * Obtiene los overrides específicos por cargo individual
 */
export function getCustomPositionOverrides(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

/**
 * Guarda un override para un cargo específico
 */
export function setCustomPositionOverride(positionName: string, enabled: boolean | null): void {
  try {
    const overrides = getCustomPositionOverrides();
    const clean = positionName.trim().toLowerCase();
    if (enabled === null) {
      delete overrides[clean];
    } else {
      overrides[clean] = enabled;
    }
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
    window.dispatchEvent(new Event('canguro_positions_config_changed'));
  } catch (e) {
    console.error('Error saving position override', e);
  }
}

/**
 * Determina a qué familia pertenece un nombre de cargo
 */
export function resolvePositionFamilyId(positionTitle: string): string {
  const p = (positionTitle || '').toLowerCase().trim();
  
  if (p.includes('director')) return 'directores';
  if (p.includes('gerente')) return 'gerentes';
  if (p.includes('coordinador')) return 'coordinadores';
  if (p.includes('supervisor')) return 'supervisores';
  if (p.includes('especialista')) return 'especialistas';
  if (p.includes('analista') || p.includes('auditor')) return 'analistas';
  if (p.includes('asesor')) return 'asesores';
  if (p.includes('encargado')) return 'encargados';
  if (p.includes('operador') || p.includes('chofer') || p.includes('conductor') || p.includes('auxiliar') || p.includes('almacenista')) {
    return 'operadores';
  }
  
  // Búsqueda por palabras clave oficiales
  for (const fam of OFFICIAL_POSITION_FAMILIES) {
    for (const kw of fam.keywords) {
      if (p.includes(kw)) return fam.id;
    }
  }

  return 'operadores';
}

/**
 * Verifica si un cargo específico está actualmente habilitado para ser evaluado
 */
export function isPositionEvaluationEnabled(positionTitle: string): boolean {
  if (!positionTitle) return false;
  const clean = positionTitle.trim().toLowerCase();

  // 1. Revisar override individual si existe
  const overrides = getCustomPositionOverrides();
  if (overrides[clean] !== undefined) {
    return overrides[clean];
  }

  // 2. Revisar configuración de la familia a la que pertenece
  const familyId = resolvePositionFamilyId(positionTitle);
  const families = getEnabledPositionFamilies();
  return families[familyId] ?? false;
}

/**
 * Restablece a la configuración oficial recomendada: Solo Gerentes, Coordinadores y Supervisores
 */
export function resetToLeadershipOnly(): Record<string, boolean> {
  const leadershipConfig: Record<string, boolean> = {
    gerentes: true,
    coordinadores: true,
    supervisores: true,
    directores: false,
    especialistas: false,
    analistas: false,
    asesores: false,
    operadores: false,
    encargados: false
  };
  setEnabledPositionFamilies(leadershipConfig);
  try {
    localStorage.removeItem(OVERRIDES_STORAGE_KEY);
  } catch {}
  return leadershipConfig;
}

/**
 * Habilita o deshabilita todos los cargos simultáneamente
 */
export function setAllPositionsEnabled(enabled: boolean): Record<string, boolean> {
  const allConfig: Record<string, boolean> = {};
  OFFICIAL_POSITION_FAMILIES.forEach(f => {
    allConfig[f.id] = enabled;
  });
  setEnabledPositionFamilies(allConfig);
  return allConfig;
}


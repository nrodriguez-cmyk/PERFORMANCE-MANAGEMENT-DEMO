import { normalizeDirectorate } from './canguroUniverso';

export type ManagementLevel = 'ESTRATÉGICO' | 'TÉCNICO / INTERMEDIO' | 'OPERATIVO';

export interface JobPositionItem {
  id: string;
  name: string;               // Ej: "Director de Control Interno", "Auditor Financiero"
  managementLevel: ManagementLevel; // "ESTRATÉGICO", "TÉCNICO / INTERMEDIO", "OPERATIVO"
  directorate: string;        // Ej: "DIRECCIÓN DE CONTROL INTERNO"
  code?: string;
  description?: string;
}

const STORAGE_KEY = 'canguro_job_positions_catalog';

/**
 * Catálogo Base Institucional de Cargos de Districueros El Canguro, C.A.
 */
export const DEFAULT_JOB_POSITIONS: JobPositionItem[] = [
  // DIRECCIÓN DE CONTROL INTERNO
  {
    id: 'pos-dci-dir',
    name: 'Director de Control Interno',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Control Interno'
  },
  {
    id: 'pos-dci-ger-aud',
    name: 'Gerente de Auditoria',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Control Interno'
  },
  {
    id: 'pos-dci-coord-aud',
    name: 'Coordinador de Auditoría',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Control Interno'
  },
  {
    id: 'pos-dci-sup-cecom',
    name: 'Supervisor de CECOM',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Control Interno'
  },
  {
    id: 'pos-dci-aud-fin',
    name: 'Auditor Financiero',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Control Interno'
  },
  {
    id: 'pos-dci-aud-op',
    name: 'Auditor Operativo',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Control Interno'
  },
  {
    id: 'pos-dci-auditor',
    name: 'Auditor (a)',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Control Interno'
  },
  {
    id: 'pos-dci-cecom',
    name: 'Operador CECOM',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Control Interno'
  },

  // DIRECCIÓN DE OPERACIONES
  {
    id: 'pos-dop-dir',
    name: 'Director de Operaciones',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Operaciones'
  },
  {
    id: 'pos-dop-ger-op',
    name: 'Gerente de Operaciones',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Operaciones'
  },
  {
    id: 'pos-dop-coord-zon',
    name: 'Coordinador Zonal de Operaciones',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Operaciones'
  },
  {
    id: 'pos-dop-coord-tda',
    name: 'Coordinador de Tienda',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Operaciones'
  },
  {
    id: 'pos-dop-encargado',
    name: 'Encargado de Tienda',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Operaciones'
  },
  {
    id: 'pos-dop-asesor',
    name: 'Asesor (a) de Ventas Integral',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Operaciones'
  },
  {
    id: 'pos-dop-tecnico-fix',
    name: 'Servicio Tecnico FIX',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Operaciones'
  },

  // DIRECCIÓN DE TECNOLOGÍA DE LA INFORMACIÓN (TI)
  {
    id: 'pos-dti-cio',
    name: 'Director de Tecnología de la Información / CIO',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Tecnología de la Información'
  },
  {
    id: 'pos-dti-ger-des',
    name: 'Gerente de Desarrollo TI',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Tecnología de la Información'
  },
  {
    id: 'pos-dti-coord-ti',
    name: 'Coordinador de TI',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Tecnología de la Información'
  },
  {
    id: 'pos-dti-sup-infra',
    name: 'Supervisor de Mesa de Ayuda / Infraestructura',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Tecnología de la Información'
  },
  {
    id: 'pos-dti-esp-ti',
    name: 'Especialista TI',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Tecnología de la Información'
  },
  {
    id: 'pos-dti-sop-redes',
    name: 'Analista de Soporte y Redes',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Tecnología de la Información'
  },
  {
    id: 'pos-dti-sop-op',
    name: 'Analista de Soporte Operativo',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Tecnología de la Información'
  },

  // DIRECCIÓN DE COMPRAS
  {
    id: 'pos-dcp-dir',
    name: 'Director de Compras',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Compras'
  },
  {
    id: 'pos-dcp-ger-cat',
    name: 'Gerente de Categoría',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Compras'
  },
  {
    id: 'pos-dcp-cat-mgr',
    name: 'Category Manager',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Compras'
  },
  {
    id: 'pos-dcp-comp-sr',
    name: 'Comprador Senior / Especialista de Compras',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Compras'
  },
  {
    id: 'pos-dcp-analista',
    name: 'Analista de Compras',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Compras'
  },

  // DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS
  {
    id: 'pos-daf-dir',
    name: 'Director de Administración y Finanzas / CFO',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Administración y Finanzas'
  },
  {
    id: 'pos-daf-ger-daf',
    name: 'Gerente de Administración y Finanzas',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Administración y Finanzas'
  },
  {
    id: 'pos-daf-coord-cont',
    name: 'Coordinador Contable / Financiero',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Administración y Finanzas'
  },
  {
    id: 'pos-daf-sup-cxp',
    name: 'Supervisor de Cuentas por Pagar / Tesorería / Impuestos',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Administración y Finanzas'
  },
  {
    id: 'pos-daf-resp-presup',
    name: 'Responsable de Presupuesto',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Administración y Finanzas'
  },
  {
    id: 'pos-daf-jefe-admin',
    name: 'Jefe de Administración',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Administración y Finanzas'
  },
  {
    id: 'pos-daf-coord-plan',
    name: 'Coordinador (a) de Planificación Financiera',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Administración y Finanzas'
  },
  {
    id: 'pos-daf-coord-egr',
    name: 'Coordinador de Egresos',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Administración y Finanzas'
  },
  {
    id: 'pos-daf-analista-cont',
    name: 'Analista Contable',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Administración y Finanzas'
  },
  {
    id: 'pos-daf-analista-fin',
    name: 'Analista Financiero / Tesorería',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Administración y Finanzas'
  },
  {
    id: 'pos-daf-esp-cxp',
    name: 'Especialista de Cuentas por Pagar / Cobrar',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Administración y Finanzas'
  },
  {
    id: 'pos-daf-asistente-admin',
    name: 'Asistente Administrativo',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Administración y Finanzas'
  },
  {
    id: 'pos-daf-aux-caja',
    name: 'Auxiliar de Caja Chica / Nómina',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Administración y Finanzas'
  },

  // DIRECCIÓN DE TRANSPORTE Y LOGÍSTICA (CENDIS)
  {
    id: 'pos-dtl-dir',
    name: 'Director de Transporte y Logística (CENDIS)',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Transporte y Logística'
  },
  {
    id: 'pos-dtl-ger-log',
    name: 'Gerente de Logística y Transporte',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Transporte y Logística'
  },
  {
    id: 'pos-dtl-ger-cendis',
    name: 'Gerente de CENDIS',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Transporte y Logística'
  },
  {
    id: 'pos-dtl-coord-log',
    name: 'Coordinador de Logística / CENDIS',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Transporte y Logística'
  },
  {
    id: 'pos-dtl-sup-alm',
    name: 'Supervisor de Almacén / Despacho / Flota',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Transporte y Logística'
  },
  {
    id: 'pos-dtl-resp-plan',
    name: 'Responsable de Planificación Logística',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Transporte y Logística'
  },
  {
    id: 'pos-dtl-jefe-turno',
    name: 'Jefe de Turno CENDIS',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Transporte y Logística'
  },
  {
    id: 'pos-dtl-resp-emb',
    name: 'Responsable de Embalaje',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Transporte y Logística'
  },
  {
    id: 'pos-dtl-picker',
    name: 'Picker',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Transporte y Logística'
  },
  {
    id: 'pos-dtl-embalador',
    name: 'Embalador',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Transporte y Logística'
  },
  {
    id: 'pos-dtl-montacarguista',
    name: 'Montacarguista',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Transporte y Logística'
  },
  {
    id: 'pos-dtl-aux-alm',
    name: 'Auxiliar de Almacén / CENDIS',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Transporte y Logística'
  },
  {
    id: 'pos-dtl-despachador',
    name: 'Chequeador / Despachador',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Transporte y Logística'
  },
  {
    id: 'pos-dtl-conductor',
    name: 'Conductor / Chofer de Reparto',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Transporte y Logística'
  },
  {
    id: 'pos-dtl-operador',
    name: 'Operador Integral CENDIS',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Transporte y Logística'
  },

  // DIRECCIÓN DE TALENTO HUMANO
  {
    id: 'pos-dth-dir',
    name: 'Director de Talento Humano / CHRO',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Talento Humano'
  },
  {
    id: 'pos-dth-ger-th',
    name: 'Gerente de Talento Humano',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Talento Humano'
  },
  {
    id: 'pos-dth-ger-form',
    name: 'Gerente de Formación y Desarrollo',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Talento Humano'
  },
  {
    id: 'pos-dth-ger-eventos',
    name: 'Gerente de Eventos y Patrocinios',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección de Talento Humano'
  },
  {
    id: 'pos-dth-coord-hrbp',
    name: 'Coordinador de Talento Humano / HRBP',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Talento Humano'
  },
  {
    id: 'pos-dth-sup-th',
    name: 'Supervisor de Talento Humano',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Talento Humano'
  },
  {
    id: 'pos-dth-resp-clima',
    name: 'Responsable de Clima y Cultura',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección de Talento Humano'
  },
  {
    id: 'pos-dth-analista-th',
    name: 'Analista de Talento Humano',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Talento Humano'
  },
  {
    id: 'pos-dth-esp-th',
    name: 'Especialista de TH',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Talento Humano'
  },
  {
    id: 'pos-dth-gen-tienda',
    name: 'Generalista de TH en Tienda / Campo',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Talento Humano'
  },
  {
    id: 'pos-dth-asistente-th',
    name: 'Asistente de TH',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Talento Humano'
  },

  // DIRECCIÓN COMERCIAL
  {
    id: 'pos-com-dir',
    name: 'Director Comercial / CCO',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-ger',
    name: 'Gerente Comercial',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-ger-mkt',
    name: 'Gerente de Mercadeo',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-ger-ecom',
    name: 'Gerente de E-commerce',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-ger-ventas',
    name: 'Gerente de Ventas B2B / Mayorista',
    managementLevel: 'ESTRATÉGICO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-cat-mgr',
    name: 'Category Manager',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-coord-com',
    name: 'Coordinador Comercial',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-coord-pricing',
    name: 'Coordinador de Precios / Pricing',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-coord-port',
    name: 'Coordinador de Portafolio',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-coord-exp',
    name: 'Coordinador de Expansión',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-coord-proy',
    name: 'Coordinador de Proyectos Comerciales',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-coord-b2b',
    name: 'Coordinador B2B / Ventas al Mayor',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-coord-alianzas',
    name: 'Coordinador de Alianzas',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-coord-fix',
    name: 'Coordinador Fix / Servicio Técnico',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-coord-ecom',
    name: 'Coordinador de E-commerce',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-sup-com',
    name: 'Supervisor Comercial',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-sup-mkt',
    name: 'Supervisor de Mercadeo / Trade Marketing',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-sup-ecom',
    name: 'Supervisor de E-commerce',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-resp-linea',
    name: 'Responsable de Línea',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-layout-arq',
    name: 'Diseñador Layout / Arquitecto Comercial',
    managementLevel: 'TÉCNICO / INTERMEDIO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-ana-com',
    name: 'Analista Comercial',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-ana-int',
    name: 'Analista Integral Comercial',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-ana-mkt',
    name: 'Analista de Mercadeo',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-ana-cat',
    name: 'Analista de Categoría',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-ana-precio',
    name: 'Analista de Precio / Pricing',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-ana-contenido',
    name: 'Analista de Contenido',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-ana-codif',
    name: 'Analista de Codificación',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-ana-vta-ecom',
    name: 'Analista de Ventas E-commerce',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-ana-atc-ecom',
    name: 'Analista de ATC E-commerce / Atención al Cliente',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-asesor-mayor',
    name: 'Asesor de Ventas al Mayor',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-disenador',
    name: 'Diseñador Gráfico',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-fotografo',
    name: 'Fotógrafo',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-ana-audiovisual',
    name: 'Analista Audiovisual',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-community-mgr',
    name: 'Community Manager',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-facilitador-fix',
    name: 'Facilitador Fix / Técnico Fix',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  },
  {
    id: 'pos-com-aux-com',
    name: 'Auxiliar Comercial',
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección Comercial'
  }
];

/**
 * Obtiene la lista completa de cargos (base + los personalizados en localStorage)
 */
export function getJobPositions(): JobPositionItem[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(Boolean).map((p: any, idx: number) => ({
            id: p.id || `pos-${idx}`,
            name: (p.name || '').trim(),
            managementLevel: normalizeManagementLevelString(p.managementLevel),
            directorate: (p.directorate || '').trim() || (normalizeDirectorate('', p.name || '') as string),
            code: p.code || '',
            description: p.description || ''
          }));
        }
      }
    }
  } catch (e) {
    console.error('Error loading job positions', e);
  }
  return [...DEFAULT_JOB_POSITIONS];
}

/**
 * Guarda o actualiza un cargo en el catálogo
 */
export function saveJobPosition(item: Omit<JobPositionItem, 'id'> & { id?: string }): JobPositionItem {
  const current = getJobPositions();
  const safeName = (item.name || '').trim();
  const id = item.id || `pos-${safeName.toLowerCase().replace(/[^a-z0-9]/g, '-') || Date.now()}`;
  const newItem: JobPositionItem = {
    id,
    name: safeName,
    managementLevel: normalizeManagementLevelString(item.managementLevel),
    directorate: (item.directorate || '').trim() || (normalizeDirectorate('', safeName) as string),
    description: item.description
  };

  const existingIdx = current.findIndex(p => p.id === id || (p.name || '').toLowerCase().trim() === newItem.name.toLowerCase().trim());
  if (existingIdx >= 0) {
    current[existingIdx] = newItem;
  } else {
    current.unshift(newItem);
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('canguro_positions_change', { detail: current }));
    }
  } catch (e) {
    console.error('Error saving job positions to storage', e);
  }

  return newItem;
}

/**
 * Elimina un cargo del catálogo
 */
export function deleteJobPosition(id: string): boolean {
  try {
    const current = getJobPositions();
    const filtered = current.filter(p => p.id !== id);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('canguro_positions_change', { detail: filtered }));
    }
    return true;
  } catch (e) {
    console.error('Error deleting job position', e);
    return false;
  }
}

/**
 * Restablece el catálogo a los cargos predeterminados
 */
export function resetJobPositionsCatalog(): JobPositionItem[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_JOB_POSITIONS));
      window.dispatchEvent(new CustomEvent('canguro_positions_change', { detail: DEFAULT_JOB_POSITIONS }));
    }
  } catch (e) {
    console.error('Error resetting job positions', e);
  }
  return [...DEFAULT_JOB_POSITIONS];
}

/**
 * Divide una línea de texto CSV o TSV respetando comillas
 */
function splitLine(line: string): string[] {
  const delimiter = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
  const res: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let c = 0; c < line.length; c++) {
    const char = line[c];
    if (char === '"') {
      if (inQuotes && line[c + 1] === '"') {
        cur += '"';
        c++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      res.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  res.push(cur.trim());
  return res.map(s => s.replace(/^"|"$/g, '').trim());
}

/**
 * Normaliza cualquier texto al Nivel de Gestión oficial (ESTRATÉGICO | TÉCNICO / INTERMEDIO | OPERATIVO)
 */
export function normalizeManagementLevelString(str?: string | null): ManagementLevel {
  if (!str) return 'OPERATIVO';
  const clean = str.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (clean.includes('ESTRATEG') || clean.includes('ALTO') || clean.includes('NIVEL 3')) {
    return 'ESTRATÉGICO';
  }
  if (clean.includes('TECNIC') || clean.includes('INTERMED') || clean.includes('TACTIC') || clean.includes('MEDIO') || clean.includes('NIVEL 2')) {
    return 'TÉCNICO / INTERMEDIO';
  }
  return 'OPERATIVO';
}

export interface JobPositionPreviewItem {
  name: string;
  managementLevel: ManagementLevel;
  directorate: string;
}

/**
 * Previsualiza las filas de cargos desde un texto CSV/TSV sin guardar
 */
export function parseJobPositionsPreview(csvText: string): JobPositionPreviewItem[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  const firstLineCols = splitLine(lines[0]).map(c => c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  const hasHeader = firstLineCols.some(c => c.includes('nivel') || c.includes('cargo') || c.includes('puesto') || c.includes('direccion'));

  let levelIdx = -1;
  let cargoIdx = -1;
  let dirIdx = -1;

  if (hasHeader) {
    firstLineCols.forEach((col, idx) => {
      if (levelIdx === -1 && (col.includes('nivel') || col.includes('gestion') || col.includes('responsabilidad'))) {
        levelIdx = idx;
      } else if (cargoIdx === -1 && (col.includes('cargo') || col.includes('puesto') || col.includes('rol'))) {
        cargoIdx = idx;
      } else if (dirIdx === -1 && (col.includes('direccion') || col.includes('area') || col.includes('departamento'))) {
        dirIdx = idx;
      }
    });
  }

  const startIdx = hasHeader ? 1 : 0;
  const preview: JobPositionPreviewItem[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = splitLine(line);
    if (cols.length < 2) continue;

    let rawLevel = '';
    let rawCargo = '';
    let rawDir = '';

    if (hasHeader) {
      rawLevel = levelIdx >= 0 ? cols[levelIdx] : '';
      rawCargo = cargoIdx >= 0 ? cols[cargoIdx] : '';
      rawDir = dirIdx >= 0 ? cols[dirIdx] : '';
    }

    if (!rawCargo) {
      if (cols.length >= 3) {
        const isCol0Level = ['ESTRATÉGICO', 'ESTRATEGICO', 'OPERATIVO', 'TÉCNICO', 'TECNICO', 'MEDIO', 'ALTO', 'BAJO'].some(k => cols[0].toUpperCase().includes(k));
        if (isCol0Level) {
          rawLevel = cols[0];
          rawCargo = cols[1];
          rawDir = cols[2];
        } else {
          rawCargo = cols[0];
          rawLevel = cols[1];
          rawDir = cols[2];
        }
      } else if (cols.length === 2) {
        const isCol0Level = ['ESTRATÉGICO', 'ESTRATEGICO', 'OPERATIVO', 'TÉCNICO', 'TECNICO', 'MEDIO', 'ALTO', 'BAJO'].some(k => cols[0].toUpperCase().includes(k));
        if (isCol0Level) {
          rawLevel = cols[0];
          rawCargo = cols[1];
        } else {
          rawCargo = cols[0];
          rawLevel = cols[1];
        }
      }
    }

    if (!rawCargo) continue;

    preview.push({
      name: rawCargo,
      managementLevel: normalizeManagementLevelString(rawLevel || rawCargo),
      directorate: rawDir || (normalizeDirectorate('', rawCargo) as string)
    });
  }

  return preview;
}

/**
 * Importa masivamente cargos desde un archivo CSV / TSV con columnas [NIVEL DE GESTIÓN, CARGO, DIRECCIÓN]
 */
export function bulkImportJobPositions(csvText: string): { imported: JobPositionItem[]; count: number } {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return { imported: [], count: 0 };

  const firstLineCols = splitLine(lines[0]).map(c => c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  const hasHeader = firstLineCols.some(c => c.includes('nivel') || c.includes('cargo') || c.includes('puesto') || c.includes('direccion'));

  let levelIdx = -1;
  let cargoIdx = -1;
  let dirIdx = -1;

  if (hasHeader) {
    firstLineCols.forEach((col, idx) => {
      if (levelIdx === -1 && (col.includes('nivel') || col.includes('gestion') || col.includes('responsabilidad'))) {
        levelIdx = idx;
      } else if (cargoIdx === -1 && (col.includes('cargo') || col.includes('puesto') || col.includes('rol'))) {
        cargoIdx = idx;
      } else if (dirIdx === -1 && (col.includes('direccion') || col.includes('area') || col.includes('departamento'))) {
        dirIdx = idx;
      }
    });
  }

  const startIdx = hasHeader ? 1 : 0;
  const imported: JobPositionItem[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = splitLine(line);
    if (cols.length < 2) continue;

    let rawLevel = '';
    let rawCargo = '';
    let rawDir = '';

    if (hasHeader) {
      rawLevel = levelIdx >= 0 ? cols[levelIdx] : '';
      rawCargo = cargoIdx >= 0 ? cols[cargoIdx] : '';
      rawDir = dirIdx >= 0 ? cols[dirIdx] : '';
    }

    // Si no hubo coincidencia por encabezados, usar detección de orden estándar: [NIVEL, CARGO, DIRECCIÓN] o [CARGO, NIVEL, DIRECCIÓN]
    if (!rawCargo) {
      if (cols.length >= 3) {
        // ¿Columna 0 parece un nivel?
        const isCol0Level = ['ESTRATÉGICO', 'ESTRATEGICO', 'OPERATIVO', 'TÉCNICO', 'TECNICO', 'MEDIO', 'ALTO', 'BAJO'].some(k => cols[0].toUpperCase().includes(k));
        if (isCol0Level) {
          rawLevel = cols[0];
          rawCargo = cols[1];
          rawDir = cols[2];
        } else {
          rawCargo = cols[0];
          rawLevel = cols[1];
          rawDir = cols[2];
        }
      } else if (cols.length === 2) {
        const isCol0Level = ['ESTRATÉGICO', 'ESTRATEGICO', 'OPERATIVO', 'TÉCNICO', 'TECNICO', 'MEDIO', 'ALTO', 'BAJO'].some(k => cols[0].toUpperCase().includes(k));
        if (isCol0Level) {
          rawLevel = cols[0];
          rawCargo = cols[1];
        } else {
          rawCargo = cols[0];
          rawLevel = cols[1];
        }
      }
    }

    if (!rawCargo) continue;

    const mgmtLevel = normalizeManagementLevelString(rawLevel || rawCargo);
    const directorate = rawDir || (normalizeDirectorate('', rawCargo) as string);

    const saved = saveJobPosition({
      name: rawCargo,
      managementLevel: mgmtLevel,
      directorate
    });
    imported.push(saved);
  }

  return { imported, count: imported.length };
}

/**
 * Busca un cargo en el catálogo para obtener su Nivel de Gestión y Dirección configurados
 */
export function lookupPositionInCatalog(positionName: string = ''): {
  found: boolean;
  managementLevel: ManagementLevel;
  directorate: string;
} {
  const pLower = (positionName || '').toLowerCase().trim();
  if (!pLower) {
    return {
      found: false,
      managementLevel: 'OPERATIVO',
      directorate: 'Dirección de Operaciones'
    };
  }
  const catalog = getJobPositions();

  const exact = catalog.find(c => (c.name || '').toLowerCase().trim() === pLower);
  if (exact) {
    return {
      found: true,
      managementLevel: exact.managementLevel,
      directorate: exact.directorate
    };
  }

  // Búsqueda por inclusión
  const partial = catalog.find(c => {
    const cLower = (c.name || '').toLowerCase().trim();
    if (!cLower) return false;
    return pLower.includes(cLower) || cLower.includes(pLower);
  });
  if (partial) {
    return {
      found: true,
      managementLevel: partial.managementLevel,
      directorate: partial.directorate
    };
  }

  return {
    found: false,
    managementLevel: 'OPERATIVO',
    directorate: 'Dirección de Operaciones'
  };
}

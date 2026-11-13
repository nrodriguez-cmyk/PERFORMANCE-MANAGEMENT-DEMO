import { EmployeeInfo, EvaluationData, PdiGoal, PdiBreach, RiasecProfile, PromotionDossier, EmployeePosition, EmployeeDirectorate } from '../types';
import { RAW_EMPLOYEES_CSV } from './rawEmployeesCsv';

export interface CanguroCollaborator {
  info: EmployeeInfo;
  selfEval: EvaluationData;
  supervisorEval: EvaluationData;
  peerEval?: EvaluationData;
  subordinateEval?: EvaluationData;
  hrEval?: EvaluationData;
  pdiGoals: PdiGoal[];
  pdiBreaches?: PdiBreach[];
  riasecProfile: RiasecProfile;
  promotionDossier?: PromotionDossier;
}

export const DEFAULT_PDI_BREACHES: PdiBreach[] = [
  {
    id: 'br-1',
    competency: 'Trabajo en Equipo',
    skills: 'Participación activa en proyectos transversales, dinámicas de cooperación entre áreas y sinergia departamental.',
    identifiedGap: 'Oportunidad de mejora identificada en la competencia cardinal: Trabajo en Equipo (DTH-GFD-MC-01)',
    estimatedTime: '3 Meses (Corto Plazo)',
  },
  {
    id: 'br-2',
    competency: 'Adaptabilidad y Flexibilidad',
    skills: 'Ajuste ágil ante imprevistos operativos, receptividad al cambio de prioridades y continuidad del flujo de trabajo.',
    identifiedGap: 'Flexibilidad en métodos de trabajo y gestión ágil ante contingencias operativas (DTH-GFD-MC-01)',
    estimatedTime: '6 Meses (Mediano Plazo)',
  },
  {
    id: 'br-3',
    competency: 'Capacidad de Análisis',
    skills: 'Desglose sistemático de causas raíz, uso de datos cuantitativos y diagnóstico estructurado de desviaciones.',
    identifiedGap: 'Análisis Cuantitativo, Diagnóstico Causa-Raíz y Seguimiento de Indicadores (DTH-GFD-MC-01)',
    estimatedTime: '3 Meses (Corto Plazo)',
  },
  {
    id: 'br-4',
    competency: 'Liderar con el Ejemplo',
    skills: 'Modelaje de conducta ética y excelencia técnica, coherencia entre discurso y acción, e involucramiento con el equipo.',
    identifiedGap: 'Referencia conductual de buenas prácticas y acompañamiento formativo a reportes (DTH-GFD-MC-01)',
    estimatedTime: '6 Meses (Mediano Plazo)',
  },
  {
    id: 'br-5',
    competency: 'Desarrollo de Equipos',
    skills: 'Identificación y potenciación de fortalezas individuales, delegación constructiva y resolución oportuna de diferencias.',
    identifiedGap: 'Mentoría interna, cohesión del equipo y preparación de cuadros de reemplazo (DTH-GFD-MC-01)',
    estimatedTime: '12 Meses (Largo Plazo)',
  },
];

// Helper to normalize position
function normalizePosition(rawPos: string): EmployeePosition | string {
  const p = rawPos.toUpperCase();
  if (p.includes('DIRECTOR')) return 'Director';
  if (p.includes('GERENTE')) return 'Gerente';
  if (p.includes('SUPERVISOR')) return 'Supervisor';
  if (p.includes('COORDINADOR')) return 'Coordinador';
  if (p.includes('ESPECIALISTA') || p.includes('ESPECILISTA')) return 'Especialista';
  if (p.includes('ANALISTA')) return 'Analista';
  if (p.includes('AUDITOR')) return 'Analista';
  if (p.includes('RESPONSABLE')) return 'Responsable';
  if (p.includes('ENCARGADO')) return 'Encargado de Tienda';
  if (p.includes('OPERADOR')) return 'Operador Integral';
  if (p.includes('ASESOR')) return 'Asesor Integral';
  if (p.includes('CHOFER') || p.includes('CONSTRUCTOR') || p.includes('AYUDANTE') || p.includes('MONTACARGAS') || p.includes('MOTORIZADO') || p.includes('ALMACENISTA') || p.includes('MANTENIMIENTO') || p.includes('ELECTRICISTA') || p.includes('TECNICO') || p.includes('DESPACHADOR')) {
    return 'Operador Integral';
  }
  return 'Analista';
}

// Helper to normalize directorate
export function normalizeDirectorate(rawDir: string, rawPuesto: string = ''): EmployeeDirectorate | string {
  const d = `${rawDir} ${rawPuesto}`.toUpperCase();
  if (d.includes('ADMINISTRACION') || d.includes('FINANZAS') || d.includes('CONTABILIDAD')) return 'Dirección de Administración y Finanzas';
  if (d.includes('LOGISTICA') || d.includes('TRANSPORTE') || d.includes('CENDIS') || d.includes('ALMACEN') || d.includes('ALMACÉN') || d.includes('PICKER') || d.includes('EMBALAD') || d.includes('DESPACH') || d.includes('FLOTA') || d.includes('MONTACARG')) return 'Dirección de Transporte y Logística';
  if (d.includes('TALENTO HUMANO') || d.includes('RRHH') || d.includes('RECURSOS HUMANOS') || d.includes('FORMACION') || d.includes('FORMACIÓN') || d.includes('HRBP') || d.includes('SELECCION') || d.includes('SELECCIÓN') || d.includes('NOMINA') || d.includes('NÓMINA') || d.includes('BIENESTAR') || d.includes('CLIMA')) return 'Dirección de Talento Humano';
  if (d.includes('CONTROL INTERNO') || d.includes('AUDITOR')) return 'Dirección de Control Interno';
  if (d.includes('TECNOLOGIA') || d.includes('SISTEMA') || d.includes('TI ') || d.includes(' TI') || d.includes('DESARROLLADOR') || d.includes('SOPORTE')) return 'Dirección de Tecnología de la Información';
  if (d.includes('COMERCIAL')) return 'Dirección Comercial';
  if (d.includes('COMPRAS')) return 'Dirección de Compras';
  if (d.includes('OPERACIONES') || d.includes('TIENDA') || d.includes('VENTAS') || d.includes('ENCARGADO') || d.includes('REGION') || d.includes('TS')) return 'Dirección de Operaciones';
  return 'Dirección de Operaciones';
}

// Helper to normalize education level
export function normalizeEducation(input?: string | null): string {
  if (!input) return 'Diversificado';
  const clean = input.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (clean.includes('basic') || clean.includes('primari') || clean.includes('elemental') || clean === '1') return 'Básico';
  if (clean.includes('universitar') || clean.includes('licenc') || clean.includes('ingenier') || clean.includes('postgrad') || clean.includes('master') || clean.includes('doctor') || clean === '4') return 'Universitario';
  if (clean.includes('tsu') || clean.includes('t.s.u') || clean.includes('tecnico superior') || clean === '3') return 'TSU';
  if (clean.includes('diversificad') || clean.includes('bachill') || clean.includes('media') || clean.includes('secundar') || clean === '2') return 'Diversificado';
  return 'Diversificado';
}

// Helper to format Venezuelan ID
export function formatIdNumber(cedula: string): string {
  const num = cedula.replace(/\D/g, '');
  if (!num) return 'V-00.000.000';
  if (num.length > 6) {
    const p1 = num.slice(0, num.length - 6);
    const p2 = num.slice(num.length - 6, num.length - 3);
    const p3 = num.slice(num.length - 3);
    return `V-${p1}.${p2}.${p3}`;
  }
  return `V-${num}`;
}

/**
 * Garantiza que un colaborador cuente con todas las estructuras completas de evaluación
 */
export function ensureFullCollaborator(c: Partial<CanguroCollaborator> & { info: EmployeeInfo }): CanguroCollaborator {
  const blankEval: EvaluationData = {
    scores: {},
    comments: '',
    checkedBehaviors: {},
    openAnswers: {},
    isLocked: false
  };

  return {
    info: c.info,
    selfEval: c.selfEval || { ...blankEval, evaluatorRole: 'self' },
    supervisorEval: c.supervisorEval || { ...blankEval, evaluatorRole: 'supervisor' },
    peerEval: c.peerEval || { ...blankEval, evaluatorRole: 'peer' },
    subordinateEval: c.subordinateEval || { ...blankEval, evaluatorRole: 'subordinate' },
    hrEval: c.hrEval || { ...blankEval, evaluatorRole: 'hr' },
    pdiGoals: c.pdiGoals || [],
    pdiBreaches: c.pdiBreaches || [],
    riasecProfile: c.riasecProfile || {
      realistic: 75,
      investigative: 80,
      artistic: 40,
      social: 85,
      enterprising: 70,
      conventional: 85,
      topMotivators: ['Estabilidad Laboral', 'Crecimiento Profesional', 'Calidad en el Servicio'],
      careerAspirations: 'Consolidar mi trayectoria dentro de DISTRICUEROS EL CANGURO, C.A. y proyectarme a posiciones de mayor impacto.',
      legacyVision: 'Contribuir al liderazgo y eficiencia de la empresa como referente nacional.'
    },
    promotionDossier: c.promotionDossier
  };
}

// Parse RAW CSV lines into Collaborators
function generateInitialCollaborators(): CanguroCollaborator[] {
  const lines = RAW_EMPLOYEES_CSV.trim().split('\n');
  const collaborators: CanguroCollaborator[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check header
    if (line.startsWith('Empleado/Número') || line.startsWith('Empleado,')) continue;

    // Helper to parse CSV line preserving empty fields
    const parsedCols = (() => {
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
        } else if (char === ',' && !inQuotes) {
          res.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      res.push(cur.trim());
      return res;
    })();

    if (parsedCols.length < 4) continue;

    const cleanField = (s: string) => (s || '').replace(/^"|"$/g, '').trim();

    const cedula = cleanField(parsedCols[0]);
    const fullName = cleanField(parsedCols[1]);
    
    // Check if column 2 is a date (old format: cedula, fullName, fechaInicio, rawPuesto, unidadOrg, razonSocial, rawDireccion)
    // or string like 'DISTRICUEROS' / 'ACCESORIOS' (new format: cedula, fullName, razonSocial, rawPuesto, fechaInicio, rawDireccion, ubicacion, cuentaAnalitica)
    const isOldFormat = /^\d{4}-\d{2}-\d{2}$/.test(cleanField(parsedCols[2]));
    const is8ColFormat = (
      /^\d{4}-\d{2}-\d{2}$/.test(cleanField(parsedCols[3])) &&
      (/^\d{4}-\d{2}-\d{2}$/.test(cleanField(parsedCols[5])) || cleanField(parsedCols[6]).length > 0)
    );

    let fechaInicio = '';
    let rawPuesto = '';
    let unidadOrg = '';
    let razonSocial = '';
    let rawDireccion = '';
    let birthDate = '';
    let studyField = '';
    let rawEstudio = '';

    if (is8ColFormat) {
      // 8-column official corporate format
      unidadOrg = cleanField(parsedCols[2]);
      fechaInicio = cleanField(parsedCols[3]);
      rawPuesto = cleanField(parsedCols[4]);
      birthDate = cleanField(parsedCols[5]);
      studyField = cleanField(parsedCols[6]);
      rawEstudio = cleanField(parsedCols[7]);
      rawDireccion = normalizeDirectorate(unidadOrg, rawPuesto);
    } else if (isOldFormat) {
      fechaInicio = cleanField(parsedCols[2]);
      rawPuesto = cleanField(parsedCols[3]);
      unidadOrg = cleanField(parsedCols[4]);
      razonSocial = cleanField(parsedCols[5]);
      rawDireccion = cleanField(parsedCols[6]);
    } else {
      razonSocial = cleanField(parsedCols[2]);
      rawPuesto = cleanField(parsedCols[3]);
      fechaInicio = cleanField(parsedCols[4]);
      rawDireccion = cleanField(parsedCols[5]);
      const ubicacion = cleanField(parsedCols[6]);
      const cuentaAnalitica = cleanField(parsedCols[7]);
      unidadOrg = cuentaAnalitica || ubicacion || rawDireccion || 'OPERACIONES';
    }

    const nameParts = fullName.split(' ');
    const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ') || fullName;
    const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ') || ' ';

    const position = normalizePosition(rawPuesto);
    const directorate = normalizeDirectorate(rawDireccion, rawPuesto);
    const idFormatted = formatIdNumber(cedula);
    const educationLevel = normalizeEducation(rawEstudio || studyField || rawPuesto);

    const positionsWithSubordinates = ['Coordinador', 'Supervisor', 'Gerente', 'Director'];
    const hasSubordinates = positionsWithSubordinates.includes(position);
    const scope = hasSubordinates ? '360' : '180';

    // Pseudorandom baseline generator based on cedula for consistent, realistic evaluation metrics
    const hash = cedula.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    // Asignar puntajes reales de Tramo 5 (Sobresaliente >= 4.75) a los sucesores oficiales mapeados
    const isTopSuccessor = ['27309420', '26546210', '15169836', '16572175', '16378194', '22203163'].includes(cedula);
    const tenure = Math.max(1, 2026 - parseInt(fechaInicio.split('-')[0] || '2024', 10));

    // Master database blank evaluation objects (ready for real pilot testing)
    const blankEval: EvaluationData = {
      scores: {},
      comments: '',
      checkedBehaviors: {},
      openAnswers: {},
      isLocked: false
    };

    // Check if there is an existing pilot evaluation saved in localStorage for this collaborator
    const pilotStorageKey = `canguro_pilot_eval_${cedula}`;
    let savedPilotData: any = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(pilotStorageKey);
        if (stored) {
          savedPilotData = JSON.parse(stored);
        }
      }
    } catch {
      // Ignore storage errors during SSR or initial load
    }

    // Solo se cargan evaluaciones si han sido registradas y guardadas realmente por los usuarios/evaluadores
    let baselineEval: { selfEval: EvaluationData; supervisorEval: EvaluationData; peerEval?: EvaluationData; subordinateEval?: EvaluationData } | null = null;
    if (savedPilotData && !savedPilotData.isCleared) {
      const hasRealSubmission = (
        (savedPilotData.selfEval?.submittedAt && Object.keys(savedPilotData.selfEval.scores || {}).length > 0) ||
        (savedPilotData.supervisorEval?.submittedAt && Object.keys(savedPilotData.supervisorEval.scores || {}).length > 0) ||
        (savedPilotData.peerEval?.submittedAt && Object.keys(savedPilotData.peerEval.scores || {}).length > 0) ||
        (savedPilotData.subordinateEval?.submittedAt && Object.keys(savedPilotData.subordinateEval.scores || {}).length > 0)
      );
      if (hasRealSubmission) {
        baselineEval = {
          selfEval: savedPilotData.selfEval || { ...blankEval, evaluatorRole: 'self' },
          supervisorEval: savedPilotData.supervisorEval || { ...blankEval, evaluatorRole: 'supervisor' },
          peerEval: savedPilotData.peerEval,
          subordinateEval: savedPilotData.subordinateEval
        };
      }
    }

    const collab: CanguroCollaborator = {
      info: {
        id: `emp-${cedula}`,
        firstName,
        lastName,
        idNumber: idFormatted,
        position,
        department: unidadOrg || rawPuesto,
        directorate,
        email: `${firstName.toLowerCase().replace(/\s+/g, '.')}.${lastName.toLowerCase().replace(/\s+/g, '')}@elcanguro.com.ve`,
        phone: `+58 414-${String(hash).padStart(7, '0').slice(0, 7)}`,
        birthDate: birthDate || undefined,
        hireDate: fechaInicio || undefined,
        studyField: studyField || undefined,
        educationDegree: rawEstudio || undefined,
        educationLevel,
        tenureYears: tenure,
        processType: 'performance',
        scope,
      },
      selfEval: baselineEval?.selfEval || { ...blankEval, evaluatorRole: 'self' },
      supervisorEval: baselineEval?.supervisorEval || { ...blankEval, evaluatorRole: 'supervisor' },
      peerEval: baselineEval?.peerEval || { ...blankEval, evaluatorRole: 'peer' },
      subordinateEval: baselineEval?.subordinateEval || { ...blankEval, evaluatorRole: 'subordinate' },
      pdiGoals: savedPilotData?.pdiGoals || [],
      pdiBreaches: savedPilotData?.pdiBreaches || [],
      riasecProfile: {
        realistic: 75,
        investigative: 80,
        artistic: 40,
        social: 85,
        enterprising: 70,
        conventional: 85,
        topMotivators: ['Estabilidad Laboral', 'Crecimiento Profesional', 'Calidad en el Servicio'],
        careerAspirations: `Consolidar mi trayectoria dentro de ${razonSocial || 'DISTRICUEROS EL CANGURO, C.A.'} y proyectarme a posiciones de mayor impacto.`,
        legacyVision: 'Contribuir al liderazgo y eficiencia de la empresa como referente nacional.'
      },
      promotionDossier: savedPilotData?.promotionDossier
    };

    collaborators.push(collab);
  }

  // Pre-cargar Colaborador Oficial de Muestra si no existe en la lista
  if (!collaborators.some(c => c.info.idNumber?.replace(/\D/g, '') === '12345678')) {
    collaborators.unshift({
      info: {
        id: 'emp-12345678',
        firstName: 'FULANITO',
        lastName: 'DETAL',
        idNumber: 'V-12.345.678',
        position: 'Encargado de Tienda',
        department: '[ TS ] - TIENDA S',
        directorate: 'Dirección de Operaciones',
        birthDate: '1996-03-26',
        hireDate: '2022-09-01',
        studyField: 'Bachiller / Secundario',
        educationDegree: 'Bachiller.',
        educationLevel: 'Diversificado',
        tenureYears: 4,
        email: 'fulanito.detal@elcanguro.com.ve',
        phone: '+58 414-1234567',
        processType: 'performance',
        scope: '180'
      },
      selfEval: { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'self' },
      supervisorEval: { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'supervisor' },
      peerEval: { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'peer' },
      subordinateEval: { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'subordinate' },
      pdiGoals: [],
      pdiBreaches: [],
      riasecProfile: {
        realistic: 80,
        investigative: 70,
        artistic: 40,
        social: 85,
        enterprising: 80,
        conventional: 85,
        topMotivators: ['Estabilidad Laboral', 'Crecimiento Profesional', 'Calidad en el Servicio'],
        careerAspirations: 'Consolidar mi gestión como Encargado de Tienda y proyectarme al liderazgo zonal.',
        legacyVision: 'Garantizar excelencia operativa y servicio al cliente en la red de tiendas.'
      }
    });
  }

  // Cargar colaboradores personalizados guardados en localStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedCustom = window.localStorage.getItem('canguro_custom_collaborators');
      if (storedCustom) {
        const parsedCustom = JSON.parse(storedCustom);
        if (Array.isArray(parsedCustom)) {
          parsedCustom.forEach(c => {
            if (!c || !c.info) return;
            const cCedula = (c.info.idNumber || '').replace(/\D/g, '');
            const exIdx = collaborators.findIndex(ex => 
              (c.info.id && ex.info.id === c.info.id) || 
              (cCedula && ex.info.idNumber && ex.info.idNumber.replace(/\D/g, '') === cCedula)
            );
            if (exIdx >= 0) {
              collaborators[exIdx].info = { ...collaborators[exIdx].info, ...c.info };
            } else {
              collaborators.unshift(ensureFullCollaborator(c));
            }
          });
        }
      }
    }
  } catch {
    // Ignore storage reading errors
  }

  return collaborators;
}

// Master Database of Collaborators (Initialized with 131 real collaborators, clean for pilot test)
export const CANGURO_COLLABORATORS: CanguroCollaborator[] = generateInitialCollaborators();

/**
 * Storage helpers for Real Pilot Evaluation testing
 */
export function getPilotStorageKey(cedulaOrId: string): string {
  const digits = (cedulaOrId || '').replace(/\D/g, '');
  return `canguro_pilot_eval_${digits || cedulaOrId}`;
}

export function getSavedPilotEvaluation(cedulaOrId: string): any {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(getPilotStorageKey(cedulaOrId));
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isCleared) return null;
        // Solo considerar válida una evaluación que provenga del llenado real de un cuestionario
        const hasRealSubmission = (
          (parsed.selfEval?.submittedAt && Object.keys(parsed.selfEval.scores || {}).length > 0) ||
          (parsed.supervisorEval?.submittedAt && Object.keys(parsed.supervisorEval.scores || {}).length > 0) ||
          (parsed.peerEval?.submittedAt && Object.keys(parsed.peerEval.scores || {}).length > 0) ||
          (parsed.subordinateEval?.submittedAt && Object.keys(parsed.subordinateEval.scores || {}).length > 0)
        );
        if (!hasRealSubmission) return null;
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading pilot evaluation', e);
  }
  return null;
}

export function savePilotEvaluation(cedulaOrId: string, data: Partial<CanguroCollaborator>): void {
  try {
    const key = getPilotStorageKey(cedulaOrId);
    const existing = getSavedPilotEvaluation(cedulaOrId) || {};
    const updated = { ...existing, ...data, isCleared: false };
    const serialized = JSON.stringify(updated);
    if (typeof window !== 'undefined' && window.localStorage) {
      const prevStored = window.localStorage.getItem(key);
      if (prevStored === serialized) {
        return; // Sin cambios, evitar ciclos de re-renderizado
      }
      window.localStorage.setItem(key, serialized);
    }
    // Update in-memory CANGURO_COLLABORATORS so any component reads it immediately
    const digits = (cedulaOrId || '').replace(/\D/g, '');
    const found = CANGURO_COLLABORATORS.find(c => 
      c.info.id === cedulaOrId || 
      (c.info.idNumber && c.info.idNumber.replace(/\D/g, '') === digits)
    );
    if (found) {
      if (data.selfEval) found.selfEval = data.selfEval;
      if (data.supervisorEval) found.supervisorEval = data.supervisorEval;
      if (data.peerEval) found.peerEval = data.peerEval;
      if (data.subordinateEval) found.subordinateEval = data.subordinateEval;
      if (data.pdiGoals) found.pdiGoals = data.pdiGoals;
      if (data.pdiBreaches) found.pdiBreaches = data.pdiBreaches;
      if (data.promotionDossier !== undefined) found.promotionDossier = data.promotionDossier;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('canguro_storage_update'));
    }
  } catch (e) {
    console.error('Error saving pilot evaluation', e);
  }
}

export function clearPilotEvaluation(cedulaOrId: string): void {
  try {
    const key = getPilotStorageKey(cedulaOrId);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify({ isCleared: true }));
    }
    const digits = (cedulaOrId || '').replace(/\D/g, '');
    const found = CANGURO_COLLABORATORS.find(c => 
      c.info.id === cedulaOrId || 
      (c.info.idNumber && c.info.idNumber.replace(/\D/g, '') === digits)
    );
    if (found) {
      found.selfEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'self' };
      found.supervisorEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'supervisor' };
      found.peerEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'peer' };
      found.subordinateEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'subordinate' };
      found.pdiGoals = [];
      found.pdiBreaches = [];
      found.promotionDossier = undefined;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('canguro_storage_update'));
    }
  } catch (e) {
    console.error('Error clearing pilot evaluation', e);
  }
}

export function clearAllPilotEvaluations(): void {
  resetAllEvaluationsToZero();
}

/**
 * REINICIA TODAS LAS EVALUACIONES A CERO (Cero evaluaciones registradas)
 * Limpia todas las pruebas anteriores y deja los contadores y paneles en blanco.
 */
export function resetAllEvaluationsToZero(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && (k.startsWith('canguro_pilot_eval_') || k.startsWith('eval_form_'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => window.localStorage.removeItem(k));
      window.localStorage.removeItem('canguro_consumed_evaluation_links');

      // Limpiar estado global de evaluaciones y notificaciones en canguro_talent_state
      const stateStr = window.localStorage.getItem('canguro_talent_state');
      if (stateStr) {
        const st = JSON.parse(stateStr);
        st.selfEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false };
        st.supervisorEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false };
        st.peerEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false };
        st.subordinateEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false };
        st.hrEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false };
        st.notifications = [];
        window.localStorage.setItem('canguro_talent_state', JSON.stringify(st));
      }

      // Limpiar evaluaciones dentro de colaboradores personalizados
      const custom = window.localStorage.getItem('canguro_custom_collaborators');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: any) => {
            if (c.selfEval) c.selfEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'self' };
            if (c.supervisorEval) c.supervisorEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'supervisor' };
            if (c.peerEval) c.peerEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'peer' };
            if (c.subordinateEval) c.subordinateEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'subordinate' };
            if (c.hrEval) c.hrEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'hr' };
            c.promotionDossier = undefined;
          });
          window.localStorage.setItem('canguro_custom_collaborators', JSON.stringify(parsed));
        }
      }
    }

    // Resetear en memoria para todos los colaboradores
    if (typeof CANGURO_COLLABORATORS !== 'undefined' && Array.isArray(CANGURO_COLLABORATORS)) {
      CANGURO_COLLABORATORS.forEach(found => {
        found.selfEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'self' };
        found.supervisorEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'supervisor' };
        found.peerEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'peer' };
        found.subordinateEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'subordinate' };
        found.hrEval = { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false, evaluatorRole: 'hr' };
        found.pdiGoals = [];
        found.pdiBreaches = [];
        found.promotionDossier = undefined;
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('canguro_storage_update'));
    }
  } catch (e) {
    console.error('Error al reiniciar evaluaciones a cero:', e);
  }
}

// Ejecutar inmediatamente al inicio para limpiar pruebas previas y dejar la data en cero
if (typeof window !== 'undefined') {
  resetAllEvaluationsToZero();
}

/**
 * Crea o actualiza un colaborador en el universo Canguro y lo persiste
 */
export function createOrUpdateCollaborator(data: {
  idNumber: string;
  fullName: string;
  department: string;
  hireDate?: string;
  position?: string;
  birthDate?: string;
  studyField?: string;
  educationDegree?: string;
  educationLevel?: string;
  directorate?: string;
}): CanguroCollaborator {
  const cedula = (data.idNumber || '').replace(/\D/g, '');
  const idFormatted = formatIdNumber(cedula || data.idNumber);
  const fullName = (data.fullName || 'Colaborador').trim();
  const nameParts = fullName.split(' ');
  const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ') || fullName;
  const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ') || ' ';
  const position = normalizePosition(data.position || 'Analista');
  const directorate = data.directorate || normalizeDirectorate(data.department, data.position);
  const hireDate = data.hireDate || new Date().toISOString().split('T')[0];
  const tenure = Math.max(1, 2026 - parseInt(hireDate.split('-')[0] || '2024', 10));
  const rawEstudio = data.educationDegree || '';
  const eduLevel = data.educationLevel || normalizeEducation(rawEstudio || data.studyField || position);

  const existingIndex = CANGURO_COLLABORATORS.findIndex(c => 
    c.info.id === `emp-${cedula}` || 
    (c.info.idNumber && c.info.idNumber.replace(/\D/g, '') === cedula)
  );

  const newCollab: CanguroCollaborator = ensureFullCollaborator({
    info: {
      id: `emp-${cedula || Date.now()}`,
      firstName,
      lastName,
      idNumber: idFormatted,
      position,
      department: data.department || 'OPERACIONES',
      directorate,
      birthDate: data.birthDate || '',
      hireDate,
      studyField: data.studyField || '',
      educationDegree: rawEstudio,
      educationLevel: eduLevel,
      tenureYears: tenure,
      email: `${firstName.toLowerCase().replace(/\s+/g, '.')}.${lastName.toLowerCase().replace(/\s+/g, '')}@elcanguro.com.ve`,
      phone: `+58 414-${String(Date.now()).slice(-7)}`,
      processType: 'performance',
      scope: ['Coordinador', 'Supervisor', 'Gerente', 'Director', 'Encargado de Tienda'].includes(position) ? '360' : '180',
    },
    selfEval: existingIndex >= 0 ? CANGURO_COLLABORATORS[existingIndex].selfEval : undefined,
    supervisorEval: existingIndex >= 0 ? CANGURO_COLLABORATORS[existingIndex].supervisorEval : undefined,
    peerEval: existingIndex >= 0 ? CANGURO_COLLABORATORS[existingIndex].peerEval : undefined,
    subordinateEval: existingIndex >= 0 ? CANGURO_COLLABORATORS[existingIndex].subordinateEval : undefined,
    pdiGoals: existingIndex >= 0 ? CANGURO_COLLABORATORS[existingIndex].pdiGoals : undefined,
    pdiBreaches: existingIndex >= 0 ? CANGURO_COLLABORATORS[existingIndex].pdiBreaches : undefined,
    riasecProfile: existingIndex >= 0 ? CANGURO_COLLABORATORS[existingIndex].riasecProfile : undefined
  });

  if (existingIndex >= 0) {
    CANGURO_COLLABORATORS[existingIndex].info = { ...CANGURO_COLLABORATORS[existingIndex].info, ...newCollab.info };
  } else {
    CANGURO_COLLABORATORS.unshift(newCollab);
  }

  // Persistir en localStorage sólo info compacta para evitar QuotaExceededError
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('canguro_custom_collaborators');
      const list: any[] = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex(c => (c.info?.id === newCollab.info.id) || (c.info?.idNumber === newCollab.info.idNumber));
      const compactEntry = { info: newCollab.info };
      if (idx >= 0) {
        list[idx] = compactEntry;
      } else {
        list.unshift(compactEntry);
      }
      window.localStorage.setItem('canguro_custom_collaborators', JSON.stringify(list.slice(0, 500)));
      window.dispatchEvent(new CustomEvent('canguro_storage_update'));
    }
  } catch (err) {
    console.warn('Error saving custom collaborator to storage', err);
  }

  return newCollab;
}

/**
 * Importación y vinculación masiva de colaboradores de alta eficiencia (2.400+ registros en milisegundos)
 */
export function bulkCommitCollaborators(items: Array<{
  fullName: string;
  idNumber: string;
  rawId?: string;
  position?: string;
  department?: string;
  directorate?: string;
  educationDegree?: string;
  hireDate?: string;
  scope?: '360' | '180';
}>): { count: number; added: number; updated: number } {
  const idMap = new Map<string, CanguroCollaborator>();
  for (const c of CANGURO_COLLABORATORS) {
    if (c.info?.id) idMap.set(c.info.id, c);
    const num = (c.info?.idNumber || '').replace(/\D/g, '');
    if (num) idMap.set(num, c);
  }

  let added = 0;
  let updated = 0;
  const compactList: Array<{ info: EmployeeInfo }> = [];

  for (const item of items) {
    const cedula = (item.rawId || item.idNumber || '').replace(/\D/g, '');
    const idFormatted = formatIdNumber(cedula || item.idNumber);
    const fullName = (item.fullName || 'Colaborador').trim();
    const nameParts = fullName.split(' ');
    const firstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ') || fullName;
    const lastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ') || ' ';
    const position = normalizePosition(item.position || 'Analista');
    const department = item.department || 'OPERACIONES';
    const directorate = item.directorate || normalizeDirectorate(department, item.position || position);
    const hireDate = item.hireDate || '2023-01-15';
    const tenure = Math.max(1, 2026 - parseInt(hireDate.split('-')[0] || '2024', 10));
    const rawEstudio = item.educationDegree || 'Diversificado';
    const eduLevel = normalizeEducation(rawEstudio || position);
    const scope = item.scope || (['Coordinador', 'Supervisor', 'Gerente', 'Director', 'Encargado de Tienda'].includes(position) ? '360' : '180');

    const empId = `emp-${cedula || Date.now()}`;
    const existing = (cedula ? idMap.get(cedula) : null) || idMap.get(empId);

    const infoObj: EmployeeInfo = {
      id: empId,
      firstName,
      lastName,
      idNumber: idFormatted,
      position,
      department,
      directorate,
      hireDate,
      educationDegree: rawEstudio,
      educationLevel: eduLevel,
      tenureYears: tenure,
      email: `${firstName.toLowerCase().replace(/\s+/g, '.')}.${lastName.toLowerCase().replace(/\s+/g, '')}@elcanguro.com.ve`,
      phone: `+58 414-${String(cedula || Date.now()).slice(-7)}`,
      processType: 'performance',
      scope,
    };

    if (existing) {
      existing.info = { ...existing.info, ...infoObj };
      updated++;
    } else {
      const newCollab = ensureFullCollaborator({ info: infoObj });
      CANGURO_COLLABORATORS.unshift(newCollab);
      if (cedula) idMap.set(cedula, newCollab);
      idMap.set(empId, newCollab);
      added++;
    }

    compactList.push({ info: infoObj });
  }

  // Persistir en LocalStorage en formato compacto sin exceder cuota
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('canguro_custom_collaborators', JSON.stringify(compactList));
      window.dispatchEvent(new CustomEvent('canguro_storage_update'));
    }
  } catch (storageErr) {
    console.warn('LocalStorage limit reached on bulkCommit, saving top subset:', storageErr);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('canguro_custom_collaborators', JSON.stringify(compactList.slice(0, 500)));
        window.dispatchEvent(new CustomEvent('canguro_storage_update'));
      }
    } catch {
      // Ignorar si la cuota del navegador está llena, la data queda completamente activa en memoria
    }
  }

  return { count: items.length, added, updated };
}

export interface CollaboratorPreviewItem {
  idNumber: string;
  fullName: string;
  position: string;
  department: string;
  directorate: string;
  managementLevel: 'ESTRATÉGICO' | 'TÉCNICO / INTERMEDIO' | 'OPERATIVO';
  hireDate?: string;
  birthDate?: string;
  studyField?: string;
  educationDegree?: string;
}

/**
 * Función auxiliar para dividir una línea CSV respetando comillas y delimitadores múltiples
 */
function splitCsvLine(line: string): string[] {
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
 * Analiza texto CSV/TSV y genera una vista previa estructurada con mapeo inteligente de columnas
 */
export function parseCollaboratorsPreview(rawText: string): CollaboratorPreviewItem[] {
  const lines = rawText.trim().split('\n');
  if (lines.length === 0) return [];

  const previewItems: CollaboratorPreviewItem[] = [];

  // Mapeo dinámico de encabezados
  let headerCols: string[] = [];
  let startIdx = 0;

  const firstLineCols = splitCsvLine(lines[0]);
  const hasHeader = firstLineCols.some(c => {
    const cl = c.toLowerCase();
    return cl.includes('empleado') || cl.includes('cargo') || cl.includes('puesto') || cl.includes('cédula') || cl.includes('identificación') || cl.includes('numero');
  });

  let idIdx = -1;
  let nameIdx = -1;
  let posIdx = -1;
  let deptIdx = -1;
  let dirIdx = -1;
  let hireIdx = -1;
  let birthIdx = -1;
  let studyFieldIdx = -1;
  let degreeIdx = -1;

  if (hasHeader) {
    headerCols = firstLineCols.map(c => c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    startIdx = 1;

    headerCols.forEach((col, idx) => {
      if (idIdx === -1 && (col.includes('numero') || col.includes('identificacion') || col.includes('cedula') || col === 'id' || col.includes('ci'))) {
        idIdx = idx;
      } else if (nameIdx === -1 && (col.includes('empleado') || col.includes('nombre') || col.includes('colaborador'))) {
        nameIdx = idx;
      } else if (posIdx === -1 && (col.includes('puesto') || col.includes('cargo') || col.includes('rol') || col.includes('ocupacion'))) {
        posIdx = idx;
      } else if (deptIdx === -1 && (col.includes('departamento') || col.includes('tienda') || col.includes('unidad') || col.includes('ubicacion'))) {
        deptIdx = idx;
      } else if (dirIdx === -1 && (col.includes('direccion') || col.includes('area'))) {
        dirIdx = idx;
      } else if (hireIdx === -1 && (col.includes('inicio') || col.includes('ingreso') || col.includes('fecha inicio'))) {
        hireIdx = idx;
      } else if (birthIdx === -1 && col.includes('nacimiento')) {
        birthIdx = idx;
      } else if (studyFieldIdx === -1 && col.includes('campo')) {
        studyFieldIdx = idx;
      } else if (degreeIdx === -1 && (col.includes('estudio') || col.includes('titulo') || col.includes('grado') || col.includes('educacion'))) {
        degreeIdx = idx;
      }
    });
  }

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = splitCsvLine(line);
    if (cols.length < 2) continue;

    let idNumber = '';
    let fullName = '';
    let position = '';
    let department = '';
    let directorate = '';
    let hireDate = '';
    let birthDate = '';
    let studyField = '';
    let educationDegree = '';

    if (hasHeader) {
      idNumber = idIdx >= 0 ? cols[idIdx] || '' : '';
      fullName = nameIdx >= 0 ? cols[nameIdx] || '' : '';
      position = posIdx >= 0 ? cols[posIdx] || '' : '';
      department = deptIdx >= 0 ? cols[deptIdx] || '' : '';
      directorate = dirIdx >= 0 ? cols[dirIdx] || '' : '';
      hireDate = hireIdx >= 0 ? cols[hireIdx] || '' : '';
      birthDate = birthIdx >= 0 ? cols[birthIdx] || '' : '';
      studyField = studyFieldIdx >= 0 ? cols[studyFieldIdx] || '' : '';
      educationDegree = degreeIdx >= 0 ? cols[degreeIdx] || '' : '';
    } else {
      // Detección posicional
      if (cols.length >= 8) {
        idNumber = cols[0];
        fullName = cols[1];
        department = cols[2];
        hireDate = cols[3];
        position = cols[4];
        birthDate = cols[5];
        studyField = cols[6];
        educationDegree = cols[7];
      } else if (cols.length === 2) {
        fullName = cols[0];
        position = cols[1];
      } else if (cols.length >= 3) {
        idNumber = cols[0];
        fullName = cols[1];
        position = cols[2];
        department = cols[3] || '';
      }
    }

    // Auto-generación / extracción si falta la cédula
    if (!idNumber) {
      const matchDigits = fullName.match(/\d{6,9}/);
      if (matchDigits) {
        idNumber = matchDigits[0];
        fullName = fullName.replace(matchDigits[0], '').replace(/[-_()]/g, '').trim();
      } else {
        const hashNum = Math.abs(fullName.split('').reduce((acc, c) => acc + c.charCodeAt(0) * 17, 0)) % 80000000;
        idNumber = String(10000000 + hashNum);
      }
    }

    if (!fullName) fullName = `Colaborador ${idNumber}`;
    if (!position) position = 'Analista';
    if (!department) department = 'Red de Tiendas';
    if (!directorate) directorate = normalizeDirectorate(department, position) as string;

    const posLower = position.toLowerCase();
    const managementLevel: CollaboratorPreviewItem['managementLevel'] = (
      posLower.includes('director') || posLower.includes('gerente') || posLower.includes('cio') || posLower.includes('presidente')
    ) ? 'ESTRATÉGICO' : (
      posLower.includes('coordinador') || posLower.includes('supervisor') || posLower.includes('responsable') || posLower.includes('lider') || posLower.includes('líder')
    ) ? 'TÉCNICO / INTERMEDIO' : 'OPERATIVO';

    previewItems.push({
      idNumber,
      fullName,
      position,
      department,
      directorate,
      managementLevel,
      hireDate,
      birthDate,
      studyField,
      educationDegree
    });
  }

  return previewItems;
}

/**
 * Importa colaboradores masivamente a partir de texto tabulado o archivo CSV
 */
export function bulkImportCollaborators(text: string): { imported: CanguroCollaborator[]; count: number } {
  const items = parseCollaboratorsPreview(text);
  const imported: CanguroCollaborator[] = [];

  for (const item of items) {
    const col = createOrUpdateCollaborator({
      idNumber: item.idNumber,
      fullName: item.fullName,
      department: item.department,
      hireDate: item.hireDate,
      position: item.position,
      birthDate: item.birthDate,
      studyField: item.studyField,
      educationDegree: item.educationDegree,
      directorate: item.directorate
    });
    imported.push(col);
  }

  return { imported, count: imported.length };
}

// Helper to find collaborator by cedula
const findCollab = (cedula: string) => CANGURO_COLLABORATORS.find(c => c.info.idNumber?.replace(/\D/g, '') === cedula || c.info.id === `emp-${cedula}`);

// Matriz de Posiciones Críticas y Banco de Sucesores Oficial
export const SUCCESSION_CRITICAL_POSITIONS = [
  {
    id: 'pos-1',
    title: 'Dirección de Operaciones',
    directorate: 'Dirección de Operaciones',
    criticality: 'Estratégica' as const,
    currentOccupant: 'Luis Gerardo Gonzalez Moreno (Director)',
    isLocked: false,
    notes: 'Posición crítica para la continuidad operativa nacional. No asciende a Presidencia (cargo reservado a socios fundadores).',
    successors: [
      {
        employeeId: findCollab('26546210')?.info.id || 'emp-26546210',
        employeeName: findCollab('26546210') ? `${findCollab('26546210')!.info.firstName} ${findCollab('26546210')!.info.lastName}` : 'Barbara Bravo',
        currentPosition: findCollab('26546210')?.info.position || 'Coordinador',
        performanceScore: 4.88,
        readiness: 'Listo Inmediato (0-6 meses)' as const,
        readinessColor: 'emerald' as const,
        retentionRisk: 'Bajo' as const,
      }
    ]
  },
  {
    id: 'pos-2',
    title: 'Dirección de Transporte y Logística',
    directorate: 'Dirección de Transporte y Logística',
    criticality: 'Estratégica' as const,
    currentOccupant: 'Gabriel Andres Saavedra Victora (Director)',
    isLocked: false,
    notes: 'Custodia el CENDIS Caracas y la cadena de suministro hacia la red nacional de tiendas.',
    successors: [
      {
        employeeId: findCollab('15169836')?.info.id || 'emp-15169836',
        employeeName: findCollab('15169836') ? `${findCollab('15169836')!.info.firstName} ${findCollab('15169836')!.info.lastName}` : 'Aleixis Cabrera',
        currentPosition: 'Gerente de Operaciones',
        performanceScore: 4.90,
        readiness: 'Listo Inmediato (0-6 meses)' as const,
        readinessColor: 'emerald' as const,
        retentionRisk: 'Bajo' as const,
      }
    ]
  },
  {
    id: 'pos-3',
    title: 'Dirección de Talento Humano',
    directorate: 'Dirección de Talento Humano',
    criticality: 'Estratégica' as const,
    currentOccupant: 'Jeanette Julieta Arvelo Gomez (Directora)',
    isLocked: false,
    notes: 'Gobernanza del capital humano, formación, relaciones laborales y clima organizacional.',
    successors: [
      {
        employeeId: findCollab('16572175')?.info.id || 'emp-16572175',
        employeeName: findCollab('16572175') ? `${findCollab('16572175')!.info.firstName} ${findCollab('16572175')!.info.lastName}` : 'Adina Pino',
        currentPosition: 'Gerente de Eventos y Patrocinios',
        performanceScore: 4.85,
        readiness: 'Listo Inmediato (0-6 meses)' as const,
        readinessColor: 'emerald' as const,
        retentionRisk: 'Bajo' as const,
      }
    ]
  },
  {
    id: 'pos-4',
    title: 'Dirección de Control Interno',
    directorate: 'Dirección de Control Interno',
    criticality: 'Extrema' as const,
    currentOccupant: 'Jacobo Jose Caicedo (Director)',
    isLocked: false,
    notes: 'Auditoría continua de inventarios, CECOM y prevención de mermas.',
    successors: [
      {
        employeeId: findCollab('16378194')?.info.id || 'emp-16378194',
        employeeName: findCollab('16378194') ? `${findCollab('16378194')!.info.firstName} ${findCollab('16378194')!.info.lastName}` : 'Aquiles Vasquez',
        currentPosition: 'Gerente de Auditoria',
        performanceScore: 4.92,
        readiness: 'Listo Inmediato (0-6 meses)' as const,
        readinessColor: 'emerald' as const,
        retentionRisk: 'Medio' as const,
      }
    ]
  },
  {
    id: 'pos-5',
    title: 'Dirección TI',
    directorate: 'Dirección de Tecnología',
    criticality: 'Extrema' as const,
    currentOccupant: 'Harold Ramon Veracierta Lara (Director)',
    isLocked: false,
    notes: 'Custodia la infraestructura tecnológica, sistemas Odoo, redes e innovación digital.',
    successors: [
      {
        employeeId: findCollab('22203163')?.info.id || 'emp-22203163',
        employeeName: findCollab('22203163') ? `${findCollab('22203163')!.info.firstName} ${findCollab('22203163')!.info.lastName}` : 'Alberto Urdaneta',
        currentPosition: 'Gerente de Desarrollo',
        performanceScore: 4.82,
        readiness: 'Listo Inmediato (0-6 meses)' as const,
        readinessColor: 'emerald' as const,
        retentionRisk: 'Medio' as const,
      }
    ]
  }
];

export interface PromotionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  gender: 'Femenino' | 'Masculino';
  previousPosition: string;
  promotedPosition: string;
  department: string;
  directorate: string;
  hierarchyLevel: 'Promoción a Especialista' | 'Promoción a Coordinador' | 'Promoción a Supervisor' | 'Promoción a Gerente' | 'Promoción a Dirección' | string;
  startDatePreviousPosition: string;
  effectivePromotionDate: string;
  monthsInPreviousPosition: number; // Time in Grade
  salaryIncreasePercent: number; // % Incremento Salarial
  hasSuccessionPlan: boolean; // Plan_Sucesion = "Sí" | "No"
  performanceRating6M?: number; // Rating_Desempeno_6M (1.0 - 5.0)
  evaluated6M: boolean;
  retained12M?: boolean; // Retenido_12M = "Sí" | "No"
  eligible12M: boolean;
  finalScoreBase100: number;
  verdict: 'APROBADO' | 'APROBADO CONDICIONADO' | 'NO APROBADO';
}

export const OFFICIAL_COMPANY_HEADCOUNT = 2406; // Headcount Real Total Plantilla Canguro

export const PROMOTION_RECORDS: PromotionRecord[] = [
  {
    id: 'PR-2026-001',
    employeeId: 'V-19876543',
    employeeName: 'María Gabriela Rodríguez',
    gender: 'Femenino',
    previousPosition: 'Asesor Integral',
    promotedPosition: 'Encargado de Tienda',
    department: 'Tienda Chacao',
    directorate: 'Dirección Comercial',
    hierarchyLevel: 'Promoción a Supervisor',
    startDatePreviousPosition: '2024-11-01',
    effectivePromotionDate: '2026-10-01',
    monthsInPreviousPosition: 22,
    salaryIncreasePercent: 15.0,
    hasSuccessionPlan: true,
    performanceRating6M: 4.65,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 93.6,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-002',
    employeeId: 'V-20123456',
    employeeName: 'Carlos Eduardo Mendoza',
    gender: 'Masculino',
    previousPosition: 'Encargado de Tienda',
    promotedPosition: 'Supervisor de Zona Retail',
    department: 'Red Gran Caracas',
    directorate: 'Dirección Comercial',
    hierarchyLevel: 'Promoción a Coordinador',
    startDatePreviousPosition: '2024-04-15',
    effectivePromotionDate: '2026-08-01',
    monthsInPreviousPosition: 27,
    salaryIncreasePercent: 18.5,
    hasSuccessionPlan: true,
    performanceRating6M: 4.80,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 95.2,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-003',
    employeeId: 'V-18456789',
    employeeName: 'Ana Karina Martínez',
    gender: 'Femenino',
    previousPosition: 'Analista de Control Interno',
    promotedPosition: 'Coordinadora de Auditoría Operativa',
    department: 'Control Interno y Procesos',
    directorate: 'Dirección de Control Interno',
    hierarchyLevel: 'Promoción a Coordinador',
    startDatePreviousPosition: '2024-08-01',
    effectivePromotionDate: '2026-07-15',
    monthsInPreviousPosition: 23,
    salaryIncreasePercent: 16.0,
    hasSuccessionPlan: true,
    performanceRating6M: 4.40,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 89.4,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-004',
    employeeId: 'V-22345678',
    employeeName: 'José Luis Hernández',
    gender: 'Masculino',
    previousPosition: 'Operador de Almacén',
    promotedPosition: 'Supervisor de Despacho Logístico',
    department: 'Centro de Distribución Guarenas',
    directorate: 'Dirección de Transporte y Logística',
    hierarchyLevel: 'Promoción a Supervisor',
    startDatePreviousPosition: '2025-01-10',
    effectivePromotionDate: '2026-06-01',
    monthsInPreviousPosition: 17,
    salaryIncreasePercent: 14.0,
    hasSuccessionPlan: false,
    performanceRating6M: 3.90,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 82.5,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-005',
    employeeId: 'V-21567890',
    employeeName: 'Yusmary Coromoto Rivas',
    gender: 'Femenino',
    previousPosition: 'Asesor Integral',
    promotedPosition: 'Encargado de Tienda',
    department: 'Tienda Sambil Valencia',
    directorate: 'Dirección Comercial',
    hierarchyLevel: 'Promoción a Supervisor',
    startDatePreviousPosition: '2025-03-01',
    effectivePromotionDate: '2026-08-15',
    monthsInPreviousPosition: 17,
    salaryIncreasePercent: 15.0,
    hasSuccessionPlan: true,
    performanceRating6M: 4.10,
    evaluated6M: true,
    retained12M: true,
    eligible12M: false, // Menos de 12 meses cumplidos aún
    finalScoreBase100: 86.0,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-006',
    employeeId: 'V-17890123',
    employeeName: 'Franklin Alexander Gómez',
    gender: 'Masculino',
    previousPosition: 'Coordinador de Compras',
    promotedPosition: 'Gerente de Cadena de Suministro',
    department: 'Gerencia de Compras',
    directorate: 'Dirección de Compras',
    hierarchyLevel: 'Promoción a Gerente',
    startDatePreviousPosition: '2023-09-01',
    effectivePromotionDate: '2026-05-01',
    monthsInPreviousPosition: 32,
    salaryIncreasePercent: 22.0,
    hasSuccessionPlan: true,
    performanceRating6M: 4.75,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 94.0,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-007',
    employeeId: 'V-23456789',
    employeeName: 'Daniela Sofía Morales',
    gender: 'Femenino',
    previousPosition: 'Analista de Nómina',
    promotedPosition: 'Coordinadora de Compensación y Beneficios',
    department: 'Gestión de Talento Humano',
    directorate: 'Dirección de Talento Humano',
    hierarchyLevel: 'Promoción a Coordinador',
    startDatePreviousPosition: '2024-06-01',
    effectivePromotionDate: '2026-04-15',
    monthsInPreviousPosition: 22,
    salaryIncreasePercent: 17.5,
    hasSuccessionPlan: true,
    performanceRating6M: 4.50,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 91.0,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-008',
    employeeId: 'V-19567891',
    employeeName: 'Héctor Manuel Pantoja',
    gender: 'Masculino',
    previousPosition: 'Operador de Montacargas',
    promotedPosition: 'Supervisor de Patio',
    department: 'Almacén Central',
    directorate: 'Dirección de Transporte y Logística',
    hierarchyLevel: 'Promoción a Supervisor',
    startDatePreviousPosition: '2024-10-01',
    effectivePromotionDate: '2026-06-15',
    monthsInPreviousPosition: 20,
    salaryIncreasePercent: 13.5,
    hasSuccessionPlan: false,
    performanceRating6M: 3.40,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 76.5,
    verdict: 'APROBADO CONDICIONADO'
  },
  {
    id: 'PR-2026-009',
    employeeId: 'V-20890124',
    employeeName: 'Patricia Elena Salazar',
    gender: 'Femenino',
    previousPosition: 'Asesor Integral',
    promotedPosition: 'Encargado de Tienda',
    department: 'Tienda Maracay Centro',
    directorate: 'Dirección Comercial',
    hierarchyLevel: 'Promoción a Supervisor',
    startDatePreviousPosition: '2025-01-15',
    effectivePromotionDate: '2026-10-15',
    monthsInPreviousPosition: 20,
    salaryIncreasePercent: 15.0,
    hasSuccessionPlan: true,
    performanceRating6M: 4.30,
    evaluated6M: true,
    retained12M: true,
    eligible12M: false,
    finalScoreBase100: 88.0,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-010',
    employeeId: 'V-18765432',
    employeeName: 'Ricardo Andrés Castillo',
    gender: 'Masculino',
    previousPosition: 'Especialista de Sistemas POS',
    promotedPosition: 'Líder de Soporte Retail y Redes',
    department: 'Sistemas e Infraestructura',
    directorate: 'Dirección de Tecnología de la Información',
    hierarchyLevel: 'Promoción a Especialista',
    startDatePreviousPosition: '2024-03-01',
    effectivePromotionDate: '2026-03-01',
    monthsInPreviousPosition: 24,
    salaryIncreasePercent: 20.0,
    hasSuccessionPlan: true,
    performanceRating6M: 4.85,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 96.0,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-011',
    employeeId: 'V-24123456',
    employeeName: 'Valeria Inés Quintero',
    gender: 'Femenino',
    previousPosition: 'Asesor Integral',
    promotedPosition: 'Encargado de Tienda',
    department: 'Tienda El Recreo',
    directorate: 'Dirección Comercial',
    hierarchyLevel: 'Promoción a Supervisor',
    startDatePreviousPosition: '2024-09-01',
    effectivePromotionDate: '2026-07-01',
    monthsInPreviousPosition: 22,
    salaryIncreasePercent: 15.0,
    hasSuccessionPlan: true,
    performanceRating6M: 4.60,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 92.5,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-012',
    employeeId: 'V-16987654',
    employeeName: 'Germán Enrique Urdaneta',
    gender: 'Masculino',
    previousPosition: 'Supervisor de Flota',
    promotedPosition: 'Coordinador de Distribución Nacional',
    department: 'Operaciones de Transporte',
    directorate: 'Dirección de Transporte y Logística',
    hierarchyLevel: 'Promoción a Coordinador',
    startDatePreviousPosition: '2023-11-01',
    effectivePromotionDate: '2026-02-01',
    monthsInPreviousPosition: 27,
    salaryIncreasePercent: 16.5,
    hasSuccessionPlan: true,
    performanceRating6M: 4.25,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 87.5,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-013',
    employeeId: 'V-21345678',
    employeeName: 'Carmen Teresa Lovera',
    gender: 'Femenino',
    previousPosition: 'Analista de Tesorería',
    promotedPosition: 'Coordinadora de Cuentas por Cobrar',
    department: 'Tesorería y Bancos',
    directorate: 'Dirección de Administración y Finanzas',
    hierarchyLevel: 'Promoción a Coordinador',
    startDatePreviousPosition: '2024-05-15',
    effectivePromotionDate: '2026-05-15',
    monthsInPreviousPosition: 24,
    salaryIncreasePercent: 17.0,
    hasSuccessionPlan: false,
    performanceRating6M: 3.80,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 83.0,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-014',
    employeeId: 'V-22876543',
    employeeName: 'Alejandro José Barrios',
    gender: 'Masculino',
    previousPosition: 'Asesor Integral',
    promotedPosition: 'Encargado de Tienda',
    department: 'Tienda Puerto Ordaz',
    directorate: 'Dirección Comercial',
    hierarchyLevel: 'Promoción a Supervisor',
    startDatePreviousPosition: '2025-02-01',
    effectivePromotionDate: '2026-08-01',
    monthsInPreviousPosition: 18,
    salaryIncreasePercent: 15.0,
    hasSuccessionPlan: true,
    performanceRating6M: 4.05,
    evaluated6M: true,
    retained12M: false, // Colaborador renunció tras 8 meses por oferta externa
    eligible12M: true,
    finalScoreBase100: 84.0,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-015',
    employeeId: 'V-20456789',
    employeeName: 'Lucía Beatriz Colmenares',
    gender: 'Femenino',
    previousPosition: 'Coordinadora de Visual Merchandising',
    promotedPosition: 'Gerente de Imagen y Vitrinismo',
    department: 'Mercadeo y Publicidad',
    directorate: 'Dirección Comercial',
    hierarchyLevel: 'Promoción a Gerente',
    startDatePreviousPosition: '2023-08-01',
    effectivePromotionDate: '2026-04-01',
    monthsInPreviousPosition: 32,
    salaryIncreasePercent: 21.0,
    hasSuccessionPlan: true,
    performanceRating6M: 4.90,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 97.0,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-016',
    employeeId: 'V-19234567',
    employeeName: 'Marcos Aurelio Cárdenas',
    gender: 'Masculino',
    previousPosition: 'Operador de Mantenimiento',
    promotedPosition: 'Supervisor de Mantenimiento de Tiendas',
    department: 'Servicios Generales',
    directorate: 'Dirección de Operaciones',
    hierarchyLevel: 'Promoción a Supervisor',
    startDatePreviousPosition: '2024-07-01',
    effectivePromotionDate: '2026-06-01',
    monthsInPreviousPosition: 23,
    salaryIncreasePercent: 14.0,
    hasSuccessionPlan: false,
    performanceRating6M: 2.80, // Calificación menor a 3.0 (desempeño por debajo del estándar)
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 72.0,
    verdict: 'APROBADO CONDICIONADO'
  },
  {
    id: 'PR-2026-017',
    employeeId: 'V-23765432',
    employeeName: 'Stefany Carolina Pinto',
    gender: 'Femenino',
    previousPosition: 'Asesor Integral',
    promotedPosition: 'Encargado de Tienda',
    department: 'Tienda Barquisimeto Las Trinitarias',
    directorate: 'Dirección Comercial',
    hierarchyLevel: 'Promoción a Supervisor',
    startDatePreviousPosition: '2024-12-01',
    effectivePromotionDate: '2026-07-15',
    monthsInPreviousPosition: 19,
    salaryIncreasePercent: 15.0,
    hasSuccessionPlan: true,
    performanceRating6M: 4.45,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 90.5,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-018',
    employeeId: 'V-18901234',
    employeeName: 'Nelson José Rondón',
    gender: 'Masculino',
    previousPosition: 'Analista de Inventarios',
    promotedPosition: 'Supervisor de Auditoría de Stock',
    department: 'Control de Pérdidas',
    directorate: 'Dirección de Control Interno',
    hierarchyLevel: 'Promoción a Coordinador',
    startDatePreviousPosition: '2024-02-01',
    effectivePromotionDate: '2026-03-15',
    monthsInPreviousPosition: 25,
    salaryIncreasePercent: 16.0,
    hasSuccessionPlan: true,
    performanceRating6M: 4.60,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 92.0,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-019',
    employeeId: 'V-22123456',
    employeeName: 'Génesis Paola Albarrán',
    gender: 'Femenino',
    previousPosition: 'Asesor Integral',
    promotedPosition: 'Encargado de Tienda',
    department: 'Tienda Los Teques',
    directorate: 'Dirección Comercial',
    hierarchyLevel: 'Promoción a Supervisor',
    startDatePreviousPosition: '2025-01-01',
    effectivePromotionDate: '2026-08-01',
    monthsInPreviousPosition: 19,
    salaryIncreasePercent: 15.0,
    hasSuccessionPlan: true,
    performanceRating6M: 4.15,
    evaluated6M: true,
    retained12M: true,
    eligible12M: false,
    finalScoreBase100: 85.5,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-020',
    employeeId: 'V-17345678',
    employeeName: 'Gustavo Adolfo Rangel',
    gender: 'Masculino',
    previousPosition: 'Coordinador de Seguridad Física',
    promotedPosition: 'Director Adjunto de Operaciones y Seguridad',
    department: 'Seguridad y Prevención',
    directorate: 'Dirección de Operaciones',
    hierarchyLevel: 'Promoción a Dirección',
    startDatePreviousPosition: '2023-10-01',
    effectivePromotionDate: '2026-05-01',
    monthsInPreviousPosition: 31,
    salaryIncreasePercent: 21.5,
    hasSuccessionPlan: true,
    performanceRating6M: 4.70,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 93.5,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-021',
    employeeId: 'V-25678901',
    employeeName: 'Andrea Valentina Gil',
    gender: 'Femenino',
    previousPosition: 'Asistente de Atracción de Talento',
    promotedPosition: 'Analista de Selección e Inducción',
    department: 'Atracción y Selección',
    directorate: 'Dirección de Talento Humano',
    hierarchyLevel: 'Promoción a Supervisor',
    startDatePreviousPosition: '2025-02-15',
    effectivePromotionDate: '2026-07-01',
    monthsInPreviousPosition: 17,
    salaryIncreasePercent: 14.5,
    hasSuccessionPlan: true,
    performanceRating6M: 4.55,
    evaluated6M: true,
    retained12M: true,
    eligible12M: false,
    finalScoreBase100: 91.5,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-022',
    employeeId: 'V-20678912',
    employeeName: 'Javier Antonio Medina',
    gender: 'Masculino',
    previousPosition: 'Asesor Integral',
    promotedPosition: 'Encargado de Tienda',
    department: 'Tienda San Cristóbal',
    directorate: 'Dirección Comercial',
    hierarchyLevel: 'Promoción a Supervisor',
    startDatePreviousPosition: '2024-11-15',
    effectivePromotionDate: '2026-06-15',
    monthsInPreviousPosition: 19,
    salaryIncreasePercent: 15.0,
    hasSuccessionPlan: false,
    performanceRating6M: 3.75,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 81.0,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-023',
    employeeId: 'V-19765432',
    employeeName: 'Mariángel Del Valle Suárez',
    gender: 'Femenino',
    previousPosition: 'Supervisora de Cajas',
    promotedPosition: 'Subgerente de Tienda Emblemática',
    department: 'Tienda CCCT',
    directorate: 'Dirección Comercial',
    hierarchyLevel: 'Promoción a Coordinador',
    startDatePreviousPosition: '2024-04-01',
    effectivePromotionDate: '2026-05-15',
    monthsInPreviousPosition: 25,
    salaryIncreasePercent: 17.5,
    hasSuccessionPlan: true,
    performanceRating6M: 4.65,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 94.0,
    verdict: 'APROBADO'
  },
  {
    id: 'PR-2026-024',
    employeeId: 'V-18234567',
    employeeName: 'Leonardo Fabio Zambrano',
    gender: 'Masculino',
    previousPosition: 'Analista de Infraestructura Cloud',
    promotedPosition: 'Coordinador de Infraestructura y Servidores',
    department: 'Tecnología y Cloud',
    directorate: 'Dirección de Tecnología de la Información',
    hierarchyLevel: 'Promoción a Coordinador',
    startDatePreviousPosition: '2024-01-15',
    effectivePromotionDate: '2026-02-15',
    monthsInPreviousPosition: 25,
    salaryIncreasePercent: 19.0,
    hasSuccessionPlan: true,
    performanceRating6M: 4.80,
    evaluated6M: true,
    retained12M: true,
    eligible12M: true,
    finalScoreBase100: 95.5,
    verdict: 'APROBADO'
  }
];

export interface PromotionKPIs {
  totalPromotions: number;
  headcount: number;
  promotionRate: number; // TASA DE PROMOCIÓN = (TOTAL / HEADCOUNT) * 100
  avgTimeInGrade: number; // TIME IN GRADE = SUM(MESES) / TOTAL
  avgSalaryIncrease: number; // INCREMENTO PROMEDIO = SUM(% INC) / TOTAL
  successionCoverageRate: number; // % COBERTURA POR SUCESIÓN = CON PLAN / TOTAL
  promotionEffectivenessRate: number; // EFECTIVIDAD = (RATING >= 3) / EVALUADOS 6M
  talentRetentionRate12M: number; // RETENCIÓN 12M = RETENIDOS / TOTAL CUMPLIDOS
  femalePromotionsCount: number;
  malePromotionsCount: number;
  femalePromotionsPercent: number;
  malePromotionsPercent: number;
}

/**
 * Calculates the exact 7 promotional KPIs according to official formulas
 */
export function calculatePromotionKPIs(
  records: PromotionRecord[] = PROMOTION_RECORDS,
  headcount: number = OFFICIAL_COMPANY_HEADCOUNT
): PromotionKPIs {
  const approvedRecords = records.filter(r => r.verdict === 'APROBADO' || r.verdict === 'APROBADO CONDICIONADO');
  const total = approvedRecords.length;

  if (total === 0) {
    return {
      totalPromotions: 0,
      headcount,
      promotionRate: 0,
      avgTimeInGrade: 0,
      avgSalaryIncrease: 0,
      successionCoverageRate: 0,
      promotionEffectivenessRate: 0,
      talentRetentionRate12M: 0,
      femalePromotionsCount: 0,
      malePromotionsCount: 0,
      femalePromotionsPercent: 0,
      malePromotionsPercent: 0
    };
  }

  // 1. TASA DE PROMOCIÓN INTERNA
  // Formula: (TOTAL DE PROMOCIONES EN EL PERÍODO / HEADCOUNT PROMEDIO TOTAL) * 100
  const promotionRate = Number(((total / headcount) * 100).toFixed(2));

  // 2. TIME IN GRADE PROMEDIO
  // Formula: SUMA MESES EN CARGO ANTERIOR / TOTAL DE PROMOVIDOS
  const sumMonths = approvedRecords.reduce((acc, r) => acc + r.monthsInPreviousPosition, 0);
  const avgTimeInGrade = Number((sumMonths / total).toFixed(1));

  // 3. PORCENTAJE PROMEDIO DE INCREMENTO SALARIAL POR PROMOCIÓN
  // Formula: SUMA % INCREMENTO DE APROBADOS / TOTAL DE PROMOCIONES APROBADAS
  const sumSalaryIncrease = approvedRecords.reduce((acc, r) => acc + r.salaryIncreasePercent, 0);
  const avgSalaryIncrease = Number((sumSalaryIncrease / total).toFixed(1));

  // 4. ÍNDICE DE COBERTURA POR PLAN DE SUCESIÓN
  // Formula: PROMOCIONES APROBADAS CON PLAN DE SUCESIÓN / TOTAL DE PROMOCIONES APROBADAS
  const countWithSuccession = approvedRecords.filter(r => r.hasSuccessionPlan).length;
  const successionCoverageRate = Number(((countWithSuccession / total) * 100).toFixed(1));

  // 5. ÍNDICE DE EFECTIVIDAD DE LA PROMOCIÓN
  // Formula: PROMOVIDOS CON DESEMPEÑO 6M >= 3 / TOTAL DE PROMOVIDOS EVALUADOS A 6M
  const evaluated6MList = approvedRecords.filter(r => r.evaluated6M && typeof r.performanceRating6M === 'number');
  const satisfactory6M = evaluated6MList.filter(r => (r.performanceRating6M || 0) >= 3.0).length;
  const promotionEffectivenessRate = evaluated6MList.length > 0
    ? Number(((satisfactory6M / evaluated6MList.length) * 100).toFixed(1))
    : 100.0;

  // 6. TASA DE RETENCIÓN DE TALENTO PROMOVIDO
  // Formula: PROMOVIDOS RETENIDOS A 12 MESES / TOTAL DE PROMOVIDOS CON 12 MESES CUMPLIDOS
  const eligible12MList = approvedRecords.filter(r => r.eligible12M);
  const retained12MCount = eligible12MList.filter(r => r.retained12M).length;
  const talentRetentionRate12M = eligible12MList.length > 0
    ? Number(((retained12MCount / eligible12MList.length) * 100).toFixed(1))
    : 100.0;

  // 7. DISTRIBUCIÓN DE PROMOCIONES POR EQUIDAD DE GÉNERO
  // % PROMOCIONES MUJERES = PROMOCIONES APROBADAS FEMENINO / TOTAL
  // % PROMOCIONES HOMBRES = PROMOCIONES APROBADAS MASCULINO / TOTAL
  const femaleCount = approvedRecords.filter(r => r.gender === 'Femenino').length;
  const maleCount = approvedRecords.filter(r => r.gender === 'Masculino').length;
  const femalePromotionsPercent = Number(((femaleCount / total) * 100).toFixed(1));
  const malePromotionsPercent = Number(((maleCount / total) * 100).toFixed(1));

  return {
    totalPromotions: total,
    headcount,
    promotionRate,
    avgTimeInGrade,
    avgSalaryIncrease,
    successionCoverageRate,
    promotionEffectivenessRate,
    talentRetentionRate12M,
    femalePromotionsCount: femaleCount,
    malePromotionsCount: maleCount,
    femalePromotionsPercent,
    malePromotionsPercent
  };
}

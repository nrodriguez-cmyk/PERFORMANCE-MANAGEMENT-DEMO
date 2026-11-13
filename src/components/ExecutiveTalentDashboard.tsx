import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  CANGURO_COLLABORATORS,
  CanguroCollaborator,
  getSavedPilotEvaluation
} from '../data/canguroUniverso';
import {
  PROMOTION_RECORDS,
  OFFICIAL_COMPANY_HEADCOUNT,
  PromotionRecord
} from '../data/promotionsAnalyticsData';
import { calculateConsolidatedMetrics } from '../utils/realEvaluationMetrics';
import { isPositionEvaluationEnabled } from '../utils/evaluationPositionsConfig';
import { subscribeToStorage } from '../store';
import { AppState } from '../types';
import { PromotionsDashboard } from './PromotionsDashboard';
import { CargoPerformanceBreakdown } from './CargoPerformanceBreakdown';
import { PeopleAnalyticsEducationDashboard } from './PeopleAnalyticsEducationDashboard';
import {
  Award, TrendingUp, Users, Target, ShieldCheck, CheckCircle2,
  AlertTriangle, Filter, RotateCcw, Sparkles, Building2,
  Calendar, MapPin, Layers, Briefcase, DollarSign, Clock,
  PieChart as PieIcon, BarChart3, Activity, ArrowUpRight, ArrowDownRight, Minus, GitCompare, HelpCircle,
  ChevronRight, ChevronDown, X, Eye, GraduationCap
} from 'lucide-react';

interface ExecutiveTalentDashboardProps {
  liveState?: AppState;
  onSelectCollaborator?: (collabId: string) => void;
  viewSection?: 'general' | 'promedios_cargo' | 'all';
}

// 8 Direcciones Corporativas Oficiales de Districueros El Canguro, C.A.
const OFFICIAL_DIRECTORATES = [
  'Todas las Direcciones',
  'Dirección Comercial',
  'Dirección de Operaciones (Tiendas)',
  'Dirección de Transporte y Logística',
  'Dirección de Tecnología de la Información',
  'Dirección de Talento Humano',
  'Dirección de Control Interno',
  'Dirección de Administración y Finanzas',
  'Dirección de Compras'
];

// Opciones de Jerarquía Normalizadas
const HIERARCHY_LEVELS = [
  { value: 'all', label: 'Todos los Niveles Jerárquicos' },
  { value: 'Dirección', label: 'Dirección / Alta Gerencia' },
  { value: 'Gerente', label: 'Gerencia' },
  { value: 'Supervisor', label: 'Supervisión / Encargados' },
  { value: 'Coordinador', label: 'Coordinación' },
  { value: 'Especialista', label: 'Especialistas / Analistas / Asesores' }
];

// Opciones de Mes del Año para Filtro Temporal
const MONTH_OPTIONS = [
  { value: 'all', label: 'Todos los Meses' },
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre (Mes en Curso)' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];

// Opciones de Sede / Ubicación
const SEDES_OPTIONS = [
  { value: 'all', label: 'Todas las Sedes / Ubicaciones' },
  { value: 'Gran Caracas', label: 'Gran Caracas (Tiendas & Oficinas)' },
  { value: 'Centro Guarenas', label: 'Centro de Distribución Guarenas' },
  { value: 'Valencia', label: 'Región Central (Valencia)' },
  { value: 'Occidente', label: 'Región Occidente (Zulia / Centroccidente)' },
  { value: 'Oriente', label: 'Región Oriente (Anzoátegui / Monagas)' }
];

// Helper para normalizar nivel jerárquico a partir del cargo
function getHierarchyFromPosition(position: string = ''): string {
  const p = position.toUpperCase();
  if (p.includes('DIRECTOR')) return 'Dirección';
  if (p.includes('GERENTE')) return 'Gerente';
  if (p.includes('SUPERVISOR') || p.includes('ENCARGADO')) return 'Supervisor';
  if (p.includes('COORDINADOR')) return 'Coordinador';
  return 'Especialista';
}

// Helper para inferir la sede según departamento o cargo
function getSedeFromLocation(department: string = '', directorate: string = ''): string {
  const text = `${department} ${directorate}`.toLowerCase();
  if (text.includes('guarenas') || text.includes('distribución') || text.includes('almacén')) {
    return 'Centro Guarenas';
  }
  if (text.includes('valencia') || text.includes('carabobo') || text.includes('naguanagua')) {
    return 'Valencia';
  }
  if (text.includes('maracaibo') || text.includes('zulia') || text.includes('barquisimeto') || text.includes('lara')) {
    return 'Occidente';
  }
  if (text.includes('lechería') || text.includes('puerto la cruz') || text.includes('maturín') || text.includes('anzoátegui')) {
    return 'Oriente';
  }
  return 'Gran Caracas';
}

// Distribución Teórica de la Curva de Calibración Gaussiana Canguro (100% Total)
// Idéntica a la escala oficial institucional referencial
const GAUSS_TRAMOS = [
  {
    tierId: 1,
    name: 'Desempeño Insatisfactorio',
    shortName: 'T1: Insatisfactorio',
    topLabel: 'Desempeño Insatisfactorio',
    rangeLabel: '< 54%',
    rangeDisplay: 'de 0 a </= 54%',
    policy: 'Desvinculación por desempeño',
    min: 0,
    max: 54,
    startT: 0.0,
    endT: 0.18,
    targetPercent: 5.0,
    color: '#EF4444',
    topColor: '#DC2626',
    solidColor: '#EF4444',
    bgLight: 'bg-[#FFF5F5]',
    borderLight: 'border-[#FECDD3]',
    textColor: 'text-[#DC2626]'
  },
  {
    tierId: 2,
    name: 'En Desarrollo',
    shortName: 'T2: En Desarrollo',
    topLabel: 'En Desarrollo',
    rangeLabel: '55% - 65%',
    rangeDisplay: '= 55% a </= 65%',
    policy: 'Plan de acción correctivo inmediato y seguimiento acelerado (30 a 60 días).',
    min: 55,
    max: 65,
    startT: 0.18,
    endT: 0.38,
    targetPercent: 20.0,
    color: '#F59E0B',
    topColor: '#D97706',
    solidColor: '#F59E0B',
    bgLight: 'bg-[#FEFCE8]',
    borderLight: 'border-[#FEF08A]',
    textColor: 'text-[#D97706]'
  },
  {
    tierId: 3,
    name: 'Desempeño Esperado',
    shortName: 'T3: Esperado (Meta)',
    topLabel: 'Desempeño Esperado',
    rangeLabel: '66% - 79%',
    rangeDisplay: '= 66% a </= 79%',
    policy: 'Plan de consolidación y fortalecimiento, coaching en brechas y seguimiento quincenal.',
    min: 66,
    max: 79,
    startT: 0.38,
    endT: 0.65,
    targetPercent: 50.0,
    color: '#16A34A',
    topColor: '#16A34A',
    solidColor: '#16A34A',
    bgLight: 'bg-[#F0FDF4]',
    borderLight: 'border-[#BBF7D0]',
    textColor: 'text-[#16A34A]'
  },
  {
    tierId: 4,
    name: 'Desempeño Sobresaliente',
    shortName: 'T4: Sobresaliente',
    topLabel: 'Desempeño Sobresaliente',
    rangeLabel: '80% - 100%',
    rangeDisplay: '= 80% a </= 100%',
    policy: 'Oportunidades de aceleración de carrera.',
    min: 80,
    max: 100,
    startT: 0.65,
    endT: 0.84,
    targetPercent: 20.0,
    color: '#2563EB',
    topColor: '#2563EB',
    solidColor: '#2563EB',
    bgLight: 'bg-[#EFF6FF]',
    borderLight: 'border-[#BFDBFE]',
    textColor: 'text-[#2563EB]'
  },
  {
    tierId: 5,
    name: 'Desempeño Excepcional',
    shortName: 'T5: Excepcional',
    topLabel: 'Desempeño Excepcional',
    rangeLabel: '101% - 125%',
    rangeDisplay: '= 101 a </= 125%',
    policy: 'Pool de talentos, elegibilidad inmediata para sucesión e incentivos superiores.',
    min: 101,
    max: 125,
    startT: 0.84,
    endT: 1.0,
    targetPercent: 5.0,
    color: '#9333EA',
    topColor: '#9333EA',
    solidColor: '#9333EA',
    bgLight: 'bg-[#FAF5FF]',
    borderLight: 'border-[#E9D5FF]',
    textColor: 'text-[#9333EA]'
  }
];

const THEORETICAL_CURVE = GAUSS_TRAMOS;

export function ExecutiveTalentDashboard({
  liveState,
  onSelectCollaborator,
  viewSection = 'general'
}: ExecutiveTalentDashboardProps) {
  // ── NIVEL 1: ESTADOS DE FILTROS GLOBALES ──
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedDirectorate, setSelectedDirectorate] = useState<string>('all');
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>('all');
  const [selectedSede, setSelectedSede] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<'enabled_only' | 'all'>('enabled_only');
  const [storageTick, setStorageTick] = useState(0);

  // Estado de Comparativa de Indicadores (Mes de Referencia)
  const [comparisonMonth, setComparisonMonth] = useState<string>('prev');

  // Estado para el modal de desglose de Cumplimiento de Objetivos por Dirección
  const [showDirectorateObjectivesModal, setShowDirectorateObjectivesModal] = useState(false);

  // Escuchar cambios de localStorage en tiempo real para actualización instantánea
  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setStorageTick(prev => prev + 1);
    });
    const handlePositionsChange = () => setStorageTick(prev => prev + 1);
    window.addEventListener('canguro_positions_config_changed', handlePositionsChange);

    return () => {
      unsub();
      window.removeEventListener('canguro_positions_config_changed', handlePositionsChange);
    };
  }, []);

  const handleResetFilters = () => {
    setSelectedYear('2026');
    setSelectedMonth('all');
    setSelectedDirectorate('all');
    setSelectedHierarchy('all');
    setSelectedSede('all');
    setSelectedScope('enabled_only');
    setComparisonMonth('prev');
  };

  const isFiltered = selectedYear !== '2026' || selectedMonth !== 'all' || selectedDirectorate !== 'all' || selectedHierarchy !== 'all' || selectedSede !== 'all' || selectedScope !== 'enabled_only';

  // ── PREPARACIÓN DE DATOS REACTIVOS DE DESEMPEÑO (MÓDULO DESEMPEÑO) ──
  const performanceDataset = useMemo(() => {
    return CANGURO_COLLABORATORS.map(collab => {
      const savedPilot = getSavedPilotEvaluation(collab.info.id) || (collab.info.idNumber ? getSavedPilotEvaluation(collab.info.idNumber) : null);
      const useLiveData = liveState && liveState.employeeInfo && (
        (collab.info.idNumber && liveState.employeeInfo.idNumber === collab.info.idNumber) ||
        (collab.info.id && liveState.employeeInfo.id === collab.info.id)
      ) && (
          (liveState.selfEval?.submittedAt && Object.keys(liveState.selfEval.scores || {}).length > 0) ||
          (liveState.supervisorEval?.submittedAt && Object.keys(liveState.supervisorEval.scores || {}).length > 0) ||
          (liveState.peerEval?.submittedAt && Object.keys(liveState.peerEval.scores || {}).length > 0) ||
          (liveState.subordinateEval?.submittedAt && Object.keys(liveState.subordinateEval.scores || {}).length > 0)
        );

      const selfEval = useLiveData ? liveState.selfEval : (savedPilot?.selfEval || collab.selfEval);
      const supervisorEval = useLiveData ? liveState.supervisorEval : (savedPilot?.supervisorEval || collab.supervisorEval);
      const peerEval = useLiveData ? liveState.peerEval : (savedPilot?.peerEval || collab.peerEval);
      const subordinateEval = useLiveData ? liveState.subordinateEval : (savedPilot?.subordinateEval || collab.subordinateEval);

      const positionsWithSubs = ['Coordinador', 'Supervisor', 'Gerente', 'Director'];
      const hasSubs = positionsWithSubs.includes(collab.info.position);

      const m = calculateConsolidatedMetrics(
        selfEval,
        supervisorEval,
        peerEval,
        subordinateEval,
        hasSubs
      );

      const hierarchy = getHierarchyFromPosition(collab.info.position);
      const sede = getSedeFromLocation(collab.info.department, collab.info.directorate);

      // Calcular Desempeño (Eje X) y Potencial & Liderazgo (Eje Y) para Cuadrante 9-Box
      // Eje X: Rating Consolidado oficial (1.00 - 5.00)
      // Eje Y: Evaluación de Potencial y Liderazgo (1.00 - 5.00) con 10% de peso en la calificación global
      const xScore = m.isEvaluated ? m.finalScore : 0;
      const yScore = m.isEvaluated ? (m.potentialScore > 0 ? m.potentialScore : (m.block2Score > 0 ? m.block2Score : 3.5)) : 0;

      // Calcular Cuadrante 9-Box (1 al 9)
      let quadrant9Box = 0;
      if (m.isEvaluated) {
        const xLevel = xScore >= 4.0 ? 3 : (xScore >= 3.0 ? 2 : 1);
        const yLevel = yScore >= 3.90 ? 3 : (yScore >= 2.50 ? 2 : 1);
        // Formula de cuadrante estándar: (yLevel - 1) * 3 + xLevel
        // Q1=(1,1) Bajo/Bajo ... Q9=(3,3) Alto/Alto (Stars)
        quadrant9Box = (yLevel - 1) * 3 + xLevel;
      }

      // Cumplimiento de Objetivos individuales (%)
      const puntajeObjetivosPercent = m.isEvaluated && m.block1Score > 0
        ? Math.min(100, Number(((m.block1Score / 5) * 100).toFixed(1)))
        : 0;

      // Asignación de Mes_Periodo real para el colaborador (extraído de la fecha de registro del cuestionario)
      const submittedDate = supervisorEval?.submittedAt || selfEval?.submittedAt || peerEval?.submittedAt || subordinateEval?.submittedAt;
      let mesPeriodo = '10'; // Octubre (Mes en curso)
      if (submittedDate) {
        const d = new Date(submittedDate);
        if (!isNaN(d.getTime())) {
          mesPeriodo = String(d.getMonth() + 1).padStart(2, '0');
        }
      }

      const isEligible = isPositionEvaluationEnabled(collab.info.position);

      return {
        ID_Empleado: collab.info.idNumber || collab.info.id,
        Nombre: `${collab.info.firstName} ${collab.info.lastName}`,
        Position: collab.info.position,
        Area: collab.info.directorate,
        Department: collab.info.department,
        Nivel_Jerarquico: hierarchy,
        Sede: sede,
        Anio_Periodo: '2026',
        Mes_Periodo: mesPeriodo,
        Elegible_Evaluacion: isEligible,
        Estado_Evaluacion: m.isEvaluated ? 'Completada' : (isEligible ? 'Pendiente' : 'No Habilitado'),
        Puntaje_Objetivos: puntajeObjetivosPercent,
        Puntaje_Competencias: m.isEvaluated ? m.block2Score : 0,
        Puntaje_Potencial: m.isEvaluated ? m.potentialScore : 0,
        potentialLevel: m.potentialLevel,
        potentialInterpretation: m.potentialInterpretation,
        Rating_Final: m.isEvaluated ? m.finalScore : 0,
        Cuadrante_9Box: quadrant9Box,
        meritTier: m.meritTier,
        isEvaluated: m.isEvaluated,
        radarScores: m.radarScores,
        collabId: collab.info.id,
        evaluations: { selfEval, supervisorEval, peerEval, subordinateEval }
      };
    });
  }, [liveState, storageTick]);

  // Filtrado del dataset de desempeño con los Filtros Globales (Nivel 1)
  const filteredPerformance = useMemo(() => {
    return performanceDataset.filter(c => {
      if (selectedScope === 'enabled_only' && !c.Elegible_Evaluacion) return false;
      const matchYear = selectedYear === 'all' || c.Anio_Periodo === selectedYear;
      const matchMonth = selectedMonth === 'all' || c.Mes_Periodo === selectedMonth;
      const areaLower = (c.Area || '').toLowerCase();
      const selDirLower = (selectedDirectorate || '').toLowerCase();
      const matchDir = selectedDirectorate === 'all' ||
        areaLower.includes(selDirLower) ||
        selDirLower.includes(areaLower);
      const matchHier = selectedHierarchy === 'all' || c.Nivel_Jerarquico === selectedHierarchy;
      const matchSede = selectedSede === 'all' || c.Sede === selectedSede;
      return matchYear && matchMonth && matchDir && matchHier && matchSede;
    });
  }, [performanceDataset, selectedScope, selectedYear, selectedMonth, selectedDirectorate, selectedHierarchy, selectedSede]);

  // Colaboradores evaluados dentro del filtro
  const evaluatedPerformance = useMemo(() => {
    return filteredPerformance.filter(c => c.isEvaluated);
  }, [filteredPerformance]);

  // ── CÓMPUTO DE MÉTRICAS DEL MÓDULO DE DESEMPEÑO (SECCIÓN A) ──
  const performanceKPIs = useMemo(() => {
    const totalElegibles = filteredPerformance.length;
    const totalEvaluados = evaluatedPerformance.length;

    // 1. Tasa de Cobertura de Evaluaciones (%)
    const tasaCobertura = totalElegibles > 0
      ? Number(((totalEvaluados / totalElegibles) * 100).toFixed(1))
      : 0;

    // 2. Cumplimiento de Objetivos Organizacionales (%)
    const cumplimientoObjetivos = totalEvaluados > 0
      ? Number((evaluatedPerformance.reduce((acc, c) => acc + c.Puntaje_Objetivos, 0) / totalEvaluados).toFixed(1))
      : 0;

    // 3. Porcentaje de Alto Desempeño (Top Performers: Rating_Final >= 4.0) (%)
    const topPerformersCount = evaluatedPerformance.filter(c => c.Rating_Final >= 4.0).length;
    const porcentajeAltoDesempeno = totalEvaluados > 0
      ? Number(((topPerformersCount / totalEvaluados) * 100).toFixed(1))
      : 0;

    // 4. Concentración en Matriz de Talento (% Stars: Cuadrante 9 de 9-Box) (%)
    const starsCount = evaluatedPerformance.filter(c => c.Cuadrante_9Box === 9).length;
    const porcentajeStars = totalEvaluados > 0
      ? Number(((starsCount / totalEvaluados) * 100).toFixed(1))
      : 0;

    // 5. Promedio de Evaluación de Competencias / 360° (1.0 a 5.0)
    const promedioCompetencias = totalEvaluados > 0
      ? Number((evaluatedPerformance.reduce((acc, c) => acc + c.Puntaje_Competencias, 0) / totalEvaluados).toFixed(2))
      : 0;

    // Rating Final Promedio
    const ratingFinalPromedio = totalEvaluados > 0
      ? Number((evaluatedPerformance.reduce((acc, c) => acc + c.Rating_Final, 0) / totalEvaluados).toFixed(2))
      : 0;

    return {
      totalElegibles,
      totalEvaluados,
      tasaCobertura,
      cumplimientoObjetivos,
      topPerformersCount,
      porcentajeAltoDesempeno,
      starsCount,
      porcentajeStars,
      promedioCompetencias,
      ratingFinalPromedio
    };
  }, [filteredPerformance, evaluatedPerformance]);

  // ── CUMPLIMIENTO DE OBJETIVOS POR DIRECCIÓN (BASE 100) ──
  const cumplimientoPorDireccion = useMemo(() => {
    const dirMap: Record<string, {
      total: number;
      evaluated: number;
      sumObj: number;
      colaboradores: Array<{ id: string; nombre: string; cargo: string; objPercent: number; rating: number }>;
    }> = {};

    performanceDataset.forEach(c => {
      const rawDir = c.Area || 'Otras Direcciones';
      const matchedDir = OFFICIAL_DIRECTORATES.find(d =>
        d !== 'Todas las Direcciones' && (
          rawDir.toLowerCase().includes(d.toLowerCase()) ||
          d.toLowerCase().includes(rawDir.toLowerCase())
        )
      ) || rawDir;

      if (!dirMap[matchedDir]) {
        dirMap[matchedDir] = { total: 0, evaluated: 0, sumObj: 0, colaboradores: [] };
      }
      dirMap[matchedDir].total += 1;
      if (c.isEvaluated && c.Puntaje_Objetivos > 0) {
        dirMap[matchedDir].evaluated += 1;
        dirMap[matchedDir].sumObj += c.Puntaje_Objetivos;
        dirMap[matchedDir].colaboradores.push({
          id: c.collabId || c.ID_Empleado,
          nombre: c.Nombre,
          cargo: c.Position,
          objPercent: c.Puntaje_Objetivos,
          rating: c.Rating_Final
        });
      }
    });

    return Object.entries(dirMap).map(([directorate, data]) => {
      const avg = data.evaluated > 0 ? Number((data.sumObj / data.evaluated).toFixed(1)) : 0;
      return {
        directorate,
        total: data.total,
        evaluated: data.evaluated,
        avgObjetivos: avg,
        colaboradores: data.colaboradores
      };
    }).sort((a, b) => b.avgObjetivos - a.avgObjetivos);
  }, [performanceDataset]);

  // ── GRÁFICO 1: CURVA DE CALIBRACIÓN REAL VS. TEÓRICA (GAUSS) Y DESVIACIONES ──
  const calibrationData = useMemo(() => {
    const totalEval = evaluatedPerformance.length;

    return GAUSS_TRAMOS.map(tier => {
      let countInTier = 0;
      if (tier.tierId === 1) {
        countInTier = evaluatedPerformance.filter(c => {
          if (c.meritTier?.id) return c.meritTier.id === 1;
          const pct = c.Rating_Final <= 5 ? (c.Rating_Final / 5) * 100 : c.Rating_Final;
          return pct <= 54;
        }).length;
      } else if (tier.tierId === 2) {
        countInTier = evaluatedPerformance.filter(c => {
          if (c.meritTier?.id) return c.meritTier.id === 2;
          const pct = c.Rating_Final <= 5 ? (c.Rating_Final / 5) * 100 : c.Rating_Final;
          return pct >= 55 && pct <= 65;
        }).length;
      } else if (tier.tierId === 3) {
        countInTier = evaluatedPerformance.filter(c => {
          if (c.meritTier?.id) return c.meritTier.id === 3;
          const pct = c.Rating_Final <= 5 ? (c.Rating_Final / 5) * 100 : c.Rating_Final;
          return pct >= 66 && pct <= 79;
        }).length;
      } else if (tier.tierId === 4) {
        countInTier = evaluatedPerformance.filter(c => {
          if (c.meritTier?.id) return c.meritTier.id === 4;
          const pct = c.Rating_Final <= 5 ? (c.Rating_Final / 5) * 100 : c.Rating_Final;
          return pct >= 80 && pct <= 100;
        }).length;
      } else {
        countInTier = evaluatedPerformance.filter(c => {
          if (c.meritTier?.id) return c.meritTier.id === 5;
          const pct = c.Rating_Final <= 5 ? (c.Rating_Final / 5) * 100 : c.Rating_Final;
          return pct >= 101;
        }).length;
      }

      const percentReal = totalEval > 0 ? Number(((countInTier / totalEval) * 100).toFixed(1)) : 0;
      const deviation = Number((percentReal - tier.targetPercent).toFixed(1));
      const absDeviation = Math.abs(deviation);

      return {
        ...tier,
        countInTier,
        percentReal,
        deviation,
        absDeviation
      };
    });
  }, [evaluatedPerformance]);

  // Desviación Absoluta Media de la Curva de Calibración
  const avgCalibrationDeviation = useMemo(() => {
    if (evaluatedPerformance.length === 0) return 0;
    const sumDev = calibrationData.reduce((acc, t) => acc + t.absDeviation, 0);
    return Number((sumDev / calibrationData.length).toFixed(1));
  }, [calibrationData, evaluatedPerformance]);

  // ── GRÁFICO 2: DISTRIBUCIÓN MATRIZ 9-BOX (PROMEDIO DE DISTRIBUCIÓN DE COLABORADORES) ──
  const nineBoxDistribution = useMemo(() => {
    const totalEval = evaluatedPerformance.length;
    const grid: Record<number, { count: number; name: string; tag: string; action: string; bg: string; text: string; border: string; accent: string }> = {
      // Fila 1 (Superior): Potencial Alto (Q7, Q8, Q9)
      7: {
        count: 0,
        name: 'Alto Potencial / Bajo Desempeño',
        tag: 'Q7 • Enigma',
        action: 'Incluirle en programas de desarrollo para mejorar su desempeño.',
        bg: 'bg-gradient-to-br from-[#FEF08A] via-[#FDE047]/90 to-[#FACC15]/75',
        text: 'text-zinc-950 font-black',
        border: 'border-amber-400',
        accent: 'bg-amber-500'
      },
      8: {
        count: 0,
        name: 'Alto Potencial / Medio Desempeño',
        tag: 'Q8 • Crecimiento',
        action: 'Exponerles a nuevos retos en su rol actual, hacer seguimiento a sus avances y brindarle formación de calidad para fortalecer su rendimiento.',
        bg: 'bg-gradient-to-br from-[#FDE047] via-[#FACC15] to-[#F1B400]/85',
        text: 'text-zinc-950 font-black',
        border: 'border-amber-500',
        accent: 'bg-amber-600'
      },
      9: {
        count: 0,
        name: 'Alto Potencial / Alto Desempeño',
        tag: 'Q9 ★ Top Talent',
        action: 'Incluirle en programas de desarrollo de liderazgo, asignar proyectos desafiantes y considera planes de sucesión.',
        bg: 'bg-gradient-to-br from-[#FACC15] via-[#F1B400] to-[#EAB308]',
        text: 'text-zinc-950 font-black',
        border: 'border-amber-600 shadow-md ring-1 ring-amber-500',
        accent: 'bg-[#F1B400]'
      },
      // Fila 2 (Media): Potencial Medio (Q4, Q5, Q6)
      4: {
        count: 0,
        name: 'Medio Potencial / Bajo Desempeño',
        tag: 'Q4 • En Desarrollo',
        action: 'Proporcionarles programas de capacitación y desarrollo para mejorar su desempeño.',
        bg: 'bg-gradient-to-br from-[#FEFCE8] via-[#FEF9C3]/80 to-[#FEF08A]/60',
        text: 'text-zinc-950 font-black',
        border: 'border-amber-200',
        accent: 'bg-amber-300'
      },
      5: {
        count: 0,
        name: 'Medio Potencial / Medio Desempeño',
        tag: 'Q5 • Clave',
        action: 'Proporcionarles oportunidades de desarrollo profesional y proyectos que les permitan crecer.',
        bg: 'bg-gradient-to-br from-[#FEF9C3] via-[#FEF08A]/85 to-[#FDE047]/70',
        text: 'text-zinc-950 font-black',
        border: 'border-amber-300',
        accent: 'bg-amber-400'
      },
      6: {
        count: 0,
        name: 'Medio Potencial / Alto Desempeño',
        tag: 'Q6 • Rendimiento',
        action: 'Proporcionarles oportunidades de desarrollo profesional y proyectos que les permitan utilizar sus habilidades al máximo.',
        bg: 'bg-gradient-to-br from-[#FDE047] via-[#FACC15] to-[#EAB308]/75',
        text: 'text-zinc-950 font-black',
        border: 'border-amber-400',
        accent: 'bg-amber-500'
      },
      // Fila 3 (Inferior): Potencial Bajo (Q1, Q2, Q3)
      1: {
        count: 0,
        name: 'Bajo Potencial / Bajo Desempeño',
        tag: 'Q1 • Riesgo',
        action: 'Proporcionarles apoyo y capacitación para mejorar su desempeño.',
        bg: 'bg-gradient-to-br from-[#FEFCE8] to-[#FFFBEB]',
        text: 'text-zinc-950 font-black',
        border: 'border-amber-200/90',
        accent: 'bg-amber-200'
      },
      2: {
        count: 0,
        name: 'Bajo Potencial / Medio Desempeño',
        tag: 'Q2 • Confiable',
        action: 'Evaluar su reubicación horizontal mediante un plan de mejora del rendimiento solicitando los puntos a mejorar.',
        bg: 'bg-gradient-to-br from-[#FEFCE8] via-[#FEF9C3]/70 to-[#FEF08A]/50',
        text: 'text-zinc-950 font-black',
        border: 'border-amber-200',
        accent: 'bg-amber-300'
      },
      3: {
        count: 0,
        name: 'Bajo Potencial / Alto Desempeño',
        tag: 'Q3 • Técnico',
        action: 'Proporcionarles estabilidad en sus roles actuales y oportunidades para compartir su conocimiento.',
        bg: 'bg-gradient-to-br from-[#FEF9C3] via-[#FEF08A]/80 to-[#FDE047]/60',
        text: 'text-zinc-950 font-black',
        border: 'border-amber-300',
        accent: 'bg-amber-400'
      },
    };

    let sumX = 0;
    let sumY = 0;

    evaluatedPerformance.forEach(c => {
      if (c.Cuadrante_9Box >= 1 && c.Cuadrante_9Box <= 9) {
        grid[c.Cuadrante_9Box].count += 1;
      }
      sumX += c.Rating_Final;
      sumY += (c.Puntaje_Competencias > 0 ? c.Puntaje_Competencias : c.Rating_Final);
    });

    const avgX = totalEval > 0 ? Number((sumX / totalEval).toFixed(2)) : 0;
    const avgY = totalEval > 0 ? Number((sumY / totalEval).toFixed(2)) : 0;

    // Cuadrante promedio
    let avgQuad = 5;
    if (avgX >= 4.0 && avgY >= 3.75) avgQuad = 9;
    else if (avgX >= 3.0 && avgY >= 3.75) avgQuad = 8;
    else if (avgX < 3.0 && avgY >= 3.75) avgQuad = 7;
    else if (avgX >= 4.0 && avgY >= 2.5) avgQuad = 6;
    else if (avgX >= 3.0 && avgY >= 2.5) avgQuad = 5;
    else if (avgX < 3.0 && avgY >= 2.5) avgQuad = 4;
    else if (avgX >= 4.0 && avgY < 2.5) avgQuad = 3;
    else if (avgX >= 3.0 && avgY < 2.5) avgQuad = 2;
    else if (avgX < 3.0 && avgY < 2.5) avgQuad = 1;

    return { grid, totalEval, avgX, avgY, avgQuad };
  }, [evaluatedPerformance]);

  // ── GRÁFICO 3: RADAR DINÁMICO DE COMPETENCIAS (CARDINALES + SUPERVISIÓN [+ ESPECÍFICAS POR ÁREA]) ──
  const dynamicRadarCompetencies = useMemo(() => {
    // 1. Competencias Cardinales (Siempre presentes: 5)
    const cardinalComps = [
      { id: 'card-1', name: 'Orientación al Cliente', category: 'cardinal' as const, cluster: 'Cardinal' },
      { id: 'card-2', name: 'Aprendizaje e Innovación', category: 'cardinal' as const, cluster: 'Cardinal' },
      { id: 'card-3', name: 'Capacidad de Análisis', category: 'cardinal' as const, cluster: 'Cardinal' },
      { id: 'card-4', name: 'Trabajo en Equipo', category: 'cardinal' as const, cluster: 'Cardinal' },
      { id: 'card-5', name: 'Adaptabilidad & Flexibilidad', category: 'cardinal' as const, cluster: 'Cardinal' },
    ];

    // 2. Competencias Gerenciales y/o de Supervisión (Siempre presentes: 3)
    const supervisionComps = [
      { id: 'sup-1', name: 'Liderar con el Ejemplo', category: 'supervision' as const, cluster: 'Supervisión' },
      { id: 'sup-2', name: 'Orientación al Logro', category: 'supervision' as const, cluster: 'Supervisión' },
      { id: 'sup-3', name: 'Desarrollo de Equipos', category: 'supervision' as const, cluster: 'Supervisión' },
    ];

    // 3. Competencias Específicas por Área (Solo cuando se selecciona una Dirección específica: 3)
    let areaSpecificComps: Array<{ id: string; name: string; category: 'specific'; cluster: string }> = [];

    if (selectedDirectorate !== 'all') {
      const dirLower = selectedDirectorate.toLowerCase();
      if (dirLower.includes('comercial') || dirLower.includes('operaciones') || dirLower.includes('compras')) {
        areaSpecificComps = [
          { id: 'area-sales-1', name: 'Gestión Indicadores', category: 'specific', cluster: 'Específica Área' },
          { id: 'area-sales-2', name: 'Visual Merchandising', category: 'specific', cluster: 'Específica Área' },
          { id: 'area-sales-3', name: 'Negociación Comercial', category: 'specific', cluster: 'Específica Área' },
        ];
      } else if (dirLower.includes('transporte') || dirLower.includes('logística') || dirLower.includes('tecnología') || dirLower.includes('ti') || dirLower.includes('humano')) {
        areaSpecificComps = [
          { id: 'area-supp-1', name: 'Orientación al Servicio', category: 'specific', cluster: 'Específica Área' },
          { id: 'area-supp-2', name: 'Optimización Procesos', category: 'specific', cluster: 'Específica Área' },
          { id: 'area-supp-3', name: 'Infraestructura & Recursos', category: 'specific', cluster: 'Específica Área' },
        ];
      } else if (dirLower.includes('control') || dirLower.includes('finanzas') || dirLower.includes('administración')) {
        areaSpecificComps = [
          { id: 'area-ctrl-1', name: 'Prevención de Pérdidas', category: 'specific', cluster: 'Específica Área' },
          { id: 'area-ctrl-2', name: 'Control Presupuestario', category: 'specific', cluster: 'Específica Área' },
          { id: 'area-ctrl-3', name: 'Gestión de Riesgos', category: 'specific', cluster: 'Específica Área' },
        ];
      }
    }

    const allActiveComps = [...cardinalComps, ...supervisionComps, ...areaSpecificComps];

    // Calcular el promedio real de cada competencia para los colaboradores evaluados
    const items = allActiveComps.map(comp => {
      let sum = 0;
      let count = 0;

      evaluatedPerformance.forEach(collab => {
        const supScores = collab.evaluations?.supervisorEval?.scores || {};
        const selfScores = collab.evaluations?.selfEval?.scores || {};
        const peerScores = collab.evaluations?.peerEval?.scores || {};
        const subScores = collab.evaluations?.subordinateEval?.scores || {};

        const vSup = supScores[comp.id];
        const vSelf = selfScores[comp.id];
        const vPeer = peerScores[comp.id];
        const vSub = subScores[comp.id];

        let wSum = 0;
        let wTotal = 0;
        if (typeof vSup === 'number' && vSup > 0) { wSum += vSup * 0.50; wTotal += 0.50; }
        if (typeof vSelf === 'number' && vSelf > 0) { wTotal += 0.10; wSum += vSelf * 0.10; }
        if (typeof vPeer === 'number' && vPeer > 0) { wTotal += 0.20; wSum += vPeer * 0.20; }
        if (typeof vSub === 'number' && vSub > 0) { wTotal += 0.20; wSum += vSub * 0.20; }

        if (wTotal > 0) {
          sum += (wSum / wTotal);
          count += 1;
        } else if (collab.Puntaje_Competencias > 0) {
          // Si el colaborador evaluado no tiene puntaje específico en este ítem (p.ej. área distinta),
          // usamos su puntaje real de competencias consolidado
          const baseCategoryScore = comp.category === 'cardinal'
            ? (collab.radarScores?.cardinal || collab.Puntaje_Competencias)
            : comp.category === 'supervision'
              ? (collab.radarScores?.leadership || collab.Puntaje_Competencias)
              : (collab.radarScores?.specific || collab.Puntaje_Competencias);

          if (baseCategoryScore > 0) {
            sum += baseCategoryScore;
            count += 1;
          }
        }
      });

      const avg = count > 0 ? Number((sum / count).toFixed(2)) : 0;
      return {
        id: comp.id,
        competency: comp.name,
        category: comp.category,
        cluster: comp.cluster,
        promedioReal: avg,
        estandarEsperado: 3.75
      };
    });

    // Sub-promedios por categoría
    const cardinalItems = items.filter(i => i.category === 'cardinal');
    const supervisionItems = items.filter(i => i.category === 'supervision');
    const specificItems = items.filter(i => i.category === 'specific');

    const cardinalAvg = cardinalItems.length > 0
      ? Number((cardinalItems.reduce((a, b) => a + b.promedioReal, 0) / cardinalItems.length).toFixed(2))
      : 0;
    const supervisionAvg = supervisionItems.length > 0
      ? Number((supervisionItems.reduce((a, b) => a + b.promedioReal, 0) / supervisionItems.length).toFixed(2))
      : 0;
    const specificAvg = specificItems.length > 0
      ? Number((specificItems.reduce((a, b) => a + b.promedioReal, 0) / specificItems.length).toFixed(2))
      : 0;
    const overallCompAvg = items.length > 0
      ? Number((items.reduce((a, b) => a + b.promedioReal, 0) / items.length).toFixed(2))
      : 0;

    return {
      items,
      cardinalAvg,
      supervisionAvg,
      specificAvg,
      overallCompAvg,
      hasSpecifics: areaSpecificComps.length > 0,
      totalCount: items.length
    };
  }, [evaluatedPerformance, selectedDirectorate]);

  // ── PREPARACIÓN DE DATOS DE PROMOCIONES (MÓDULO PROMOCIONES) ──
  const promotionsDataset = useMemo(() => {
    return PROMOTION_RECORDS.map(r => {
      // Normalizar nivel jerárquico
      let hierarchy = 'Especialista';
      if (r.hierarchyLevel.includes('Dirección')) hierarchy = 'Dirección';
      else if (r.hierarchyLevel.includes('Gerente')) hierarchy = 'Gerente';
      else if (r.hierarchyLevel.includes('Supervisor')) hierarchy = 'Supervisor';
      else if (r.hierarchyLevel.includes('Coordinador')) hierarchy = 'Coordinador';

      // Sede
      const sede = getSedeFromLocation(r.department, r.directorate);

      // Mes_Periodo extraído de effectivePromotionDate (ej: '2026-09-01' -> '09')
      let mesPeriodo = '10';
      if (r.effectivePromotionDate) {
        const parts = r.effectivePromotionDate.split('-');
        if (parts.length >= 2) {
          mesPeriodo = parts[1];
        }
      }

      return {
        ...r,
        hierarchy,
        sede,
        Anio_Periodo: '2026',
        Mes_Periodo: mesPeriodo,
        Estado_Promocion: r.verdict === 'APROBADO' ? 'Aprobada' : (r.verdict === 'NO APROBADO' ? 'Rechazada' : 'Condicionada')
      };
    });
  }, []);

  // Filtrado del dataset de promociones con los Filtros Globales (Nivel 1)
  const filteredPromotions = useMemo(() => {
    return promotionsDataset.filter(r => {
      const matchYear = selectedYear === 'all' || r.Anio_Periodo === selectedYear;
      const matchMonth = selectedMonth === 'all' || r.Mes_Periodo === selectedMonth;
      const dirLower = (r.directorate || '').toLowerCase();
      const selDirLower = (selectedDirectorate || '').toLowerCase();
      const matchDir = selectedDirectorate === 'all' ||
        dirLower.includes(selDirLower) ||
        selDirLower.includes(dirLower);
      const matchHier = selectedHierarchy === 'all' || r.hierarchy === selectedHierarchy;
      const matchSede = selectedSede === 'all' || r.sede === selectedSede;
      return matchYear && matchMonth && matchDir && matchHier && matchSede;
    });
  }, [promotionsDataset, selectedYear, selectedMonth, selectedDirectorate, selectedHierarchy, selectedSede]);

  // Promociones Aprobadas (Base formal de cálculo según fórmulas requeridas)
  const approvedPromotions = useMemo(() => {
    return filteredPromotions.filter(r => r.Estado_Promocion === 'Aprobada' || r.verdict === 'APROBADO');
  }, [filteredPromotions]);

  // ── CÓMPUTO DE MÉTRICAS DEL MÓDULO DE PROMOCIONES (SECCIÓN B) ──
  const promotionsKPIs = useMemo(() => {
    const totalAprobadas = approvedPromotions.length;

    // 1. Tasa de Promoción Interna (%) = (Total Aprobadas / Headcount Promedio Total) * 100
    const tasaPromocionInterna = OFFICIAL_COMPANY_HEADCOUNT > 0
      ? Number(((totalAprobadas / OFFICIAL_COMPANY_HEADCOUNT) * 100).toFixed(2))
      : 0;

    // 2. Tiempo Promedio en el Cargo (Time in Grade) (Meses) = Suma Meses / Total Promovidos
    const tiempoPromedioCargo = totalAprobadas > 0
      ? Number((approvedPromotions.reduce((acc, r) => acc + r.monthsInPreviousPosition, 0) / totalAprobadas).toFixed(1))
      : 0;

    // 3. Porcentaje Promedio de Incremento Salarial (%) = Suma % Incremento / Total Aprobadas
    const incrementoPromedio = totalAprobadas > 0
      ? Number((approvedPromotions.reduce((acc, r) => acc + r.salaryIncreasePercent, 0) / totalAprobadas).toFixed(1))
      : 0;

    // 4. Índice de Cobertura por Plan de Sucesión (%) = (Aprobadas con Plan / Total Aprobadas) * 100
    const conPlanSucesionCount = approvedPromotions.filter(r => r.hasSuccessionPlan).length;
    const coberturaSucesion = totalAprobadas > 0
      ? Number(((conPlanSucesionCount / totalAprobadas) * 100).toFixed(1))
      : 0;

    // 5. Índice de Efectividad de la Promoción a 6 Meses (%)
    // Regla de Automatización: Excluir colaboradores que aún no han cumplido 6 meses (evaluated6M = false)
    const evaluados6M = approvedPromotions.filter(r => r.evaluated6M && typeof r.performanceRating6M === 'number');
    const efectivos6MCount = evaluados6M.filter(r => (r.performanceRating6M ?? 0) >= 3.0).length;
    const efectividadPromocion = evaluados6M.length > 0
      ? Number(((efectivos6MCount / evaluados6M.length) * 100).toFixed(1))
      : 0;
    const noAplicaAun6M = totalAprobadas - evaluados6M.length;

    // 6. Tasa de Retención de Talento Promovido a 12 Meses (%)
    // Regla de Automatización: Excluir colaboradores que aún no han cumplido 12 meses (eligible12M = false)
    const evaluados12M = approvedPromotions.filter(r => r.eligible12M && r.retained12M !== undefined);
    const retenidos12MCount = evaluados12M.filter(r => r.retained12M === true).length;
    const tasaRetencion12M = evaluados12M.length > 0
      ? Number(((retenidos12MCount / evaluados12M.length) * 100).toFixed(1))
      : 0;
    const noAplicaAun12M = totalAprobadas - evaluados12M.length;

    // 7. Distribución de Promociones por Equidad de Género (%)
    const mujeresCount = approvedPromotions.filter(r => r.gender === 'Femenino').length;
    const hombresCount = approvedPromotions.filter(r => r.gender === 'Masculino').length;
    const porcentajeMujeres = totalAprobadas > 0 ? Number(((mujeresCount / totalAprobadas) * 100).toFixed(1)) : 0;
    const porcentajeHombres = totalAprobadas > 0 ? Number(((hombresCount / totalAprobadas) * 100).toFixed(1)) : 0;

    return {
      totalAprobadas,
      tasaPromocionInterna,
      tiempoPromedioCargo,
      incrementoPromedio,
      conPlanSucesionCount,
      coberturaSucesion,
      evaluados6MCount: evaluados6M.length,
      efectivos6MCount,
      efectividadPromocion,
      noAplicaAun6M,
      evaluados12MCount: evaluados12M.length,
      retenidos12MCount,
      tasaRetencion12M,
      noAplicaAun12M,
      mujeresCount,
      hombresCount,
      porcentajeMujeres,
      porcentajeHombres
    };
  }, [approvedPromotions]);

  // ── GRÁFICO 4: % INCREMENTO SALARIAL PROMEDIO POR NIVEL JERÁRQUICO ──
  const salaryIncreaseByLevel = useMemo(() => {
    const levelsMap: Record<string, { sum: number; count: number }> = {
      'Dirección': { sum: 0, count: 0 },
      'Gerente': { sum: 0, count: 0 },
      'Supervisor': { sum: 0, count: 0 },
      'Coordinador': { sum: 0, count: 0 },
      'Especialista': { sum: 0, count: 0 },
    };

    approvedPromotions.forEach(r => {
      if (levelsMap[r.hierarchy]) {
        levelsMap[r.hierarchy].sum += r.salaryIncreasePercent;
        levelsMap[r.hierarchy].count += 1;
      }
    });

    return Object.entries(levelsMap)
      .filter(([, data]) => data.count > 0)
      .map(([level, data]) => ({
        hierarchy: level,
        incrementoPromedio: Number((data.sum / data.count).toFixed(1)),
        promovidosCount: data.count
      }));
  }, [approvedPromotions]);

  // ── MOTOR DE COMPARATIVA DE INDICADORES INTERMENSUAL ──
  const getMonthLabel = (mKey: string): string => {
    const found = MONTH_OPTIONS.find(m => m.value === mKey);
    return found ? found.label : mKey;
  };

  // Base datasets filtrados por año, dirección, jerarquía y sede (sin el filtro de mes para poder contrastar)
  const basePerformanceByOrg = useMemo(() => {
    return performanceDataset.filter(c => {
      const matchYear = selectedYear === 'all' || c.Anio_Periodo === selectedYear;
      const areaLower = (c.Area || '').toLowerCase();
      const selDirLower = (selectedDirectorate || '').toLowerCase();
      const matchDir = selectedDirectorate === 'all' ||
        areaLower.includes(selDirLower) ||
        selDirLower.includes(areaLower);
      const matchHier = selectedHierarchy === 'all' || c.Nivel_Jerarquico === selectedHierarchy;
      const matchSede = selectedSede === 'all' || c.Sede === selectedSede;
      return matchYear && matchDir && matchHier && matchSede;
    });
  }, [performanceDataset, selectedYear, selectedDirectorate, selectedHierarchy, selectedSede]);

  const basePromotionsByOrg = useMemo(() => {
    return promotionsDataset.filter(r => {
      const matchYear = selectedYear === 'all' || r.Anio_Periodo === selectedYear;
      const dirLower = (r.directorate || '').toLowerCase();
      const selDirLower = (selectedDirectorate || '').toLowerCase();
      const matchDir = selectedDirectorate === 'all' ||
        dirLower.includes(selDirLower) ||
        selDirLower.includes(dirLower);
      const matchHier = selectedHierarchy === 'all' || r.hierarchy === selectedHierarchy;
      const matchSede = selectedSede === 'all' || r.sede === selectedSede;
      return matchYear && matchDir && matchHier && matchSede;
    });
  }, [promotionsDataset, selectedYear, selectedDirectorate, selectedHierarchy, selectedSede]);

  // Resolución del mes de comparación
  const resolvedComparisonMonth = useMemo(() => {
    if (comparisonMonth !== 'prev') return comparisonMonth;
    if (selectedMonth === 'all') return '09'; // Si ve todo el año, compara contra Septiembre
    const mNum = parseInt(selectedMonth, 10);
    const prevNum = mNum > 1 ? mNum - 1 : 12;
    return String(prevNum).padStart(2, '0');
  }, [comparisonMonth, selectedMonth]);

  const getComparisonMonthLabel = (): string => {
    if (comparisonMonth === 'prev') {
      return `Mes Anterior (${getMonthLabel(resolvedComparisonMonth)})`;
    }
    if (comparisonMonth === 'all') {
      return 'Promedio Acumulado del Año';
    }
    return getMonthLabel(resolvedComparisonMonth);
  };

  const getComparisonShortLabel = (): string => {
    if (comparisonMonth === 'prev') {
      if (selectedMonth === 'all') return 'Sep';
      const mNum = parseInt(selectedMonth, 10);
      const prevNum = mNum > 1 ? mNum - 1 : 12;
      const found = MONTH_OPTIONS.find(m => m.value === String(prevNum).padStart(2, '0'));
      return found ? found.label.replace(' (Mes en Curso)', '').slice(0, 3) : 'Ant.';
    }
    if (comparisonMonth === 'all') return 'Año';
    const found = MONTH_OPTIONS.find(m => m.value === comparisonMonth);
    return found ? found.label.replace(' (Mes en Curso)', '').slice(0, 3) : comparisonMonth;
  };

  // Función de cálculo de métricas para cualquier corte de dataset
  const computeMetricsForCohort = (perf: typeof performanceDataset, promo: typeof promotionsDataset) => {
    const totalElegibles = perf.length;
    const evaluated = perf.filter(c => c.isEvaluated);
    const totalEvaluados = evaluated.length;

    const tasaCobertura = totalElegibles > 0
      ? Number(((totalEvaluados / totalElegibles) * 100).toFixed(1))
      : 0;

    const cumplimientoObjetivos = totalEvaluados > 0
      ? Number((evaluated.reduce((acc, c) => acc + c.Puntaje_Objetivos, 0) / totalEvaluados).toFixed(1))
      : 0;

    const ratingFinalPromedio = totalEvaluados > 0
      ? Number((evaluated.reduce((acc, c) => acc + c.Rating_Final, 0) / totalEvaluados).toFixed(2))
      : 0;

    const topPerformersCount = evaluated.filter(c => c.Rating_Final >= 4.0).length;
    const porcentajeAltoDesempeno = totalEvaluados > 0
      ? Number(((topPerformersCount / totalEvaluados) * 100).toFixed(1))
      : 0;

    const starsCount = evaluated.filter(c => c.Cuadrante_9Box === 9).length;
    const porcentajeStars = totalEvaluados > 0
      ? Number(((starsCount / totalEvaluados) * 100).toFixed(1))
      : 0;

    const promedioCompetencias = totalEvaluados > 0
      ? Number((evaluated.reduce((acc, c) => acc + c.Puntaje_Competencias, 0) / totalEvaluados).toFixed(2))
      : 0;

    const approved = promo.filter(r => r.Estado_Promocion === 'Aprobada' || r.verdict === 'APROBADO');
    const promocionesAprobadas = approved.length;

    const tasaPromocionInterna = OFFICIAL_COMPANY_HEADCOUNT > 0
      ? Number(((promocionesAprobadas / OFFICIAL_COMPANY_HEADCOUNT) * 100).toFixed(2))
      : 0;

    const avgTimeInGrade = promocionesAprobadas > 0
      ? Number((approved.reduce((acc, r) => acc + (r.monthsInPreviousPosition || 0), 0) / promocionesAprobadas).toFixed(1))
      : 0;

    const evaluated6MList = approved.filter(r => r.evaluated6M);
    const efectividad6M = evaluated6MList.length > 0
      ? Number(((evaluated6MList.filter(r => r.performanceRating6M >= 4.0).length / evaluated6MList.length) * 100).toFixed(1))
      : 0;

    const eligible12MList = approved.filter(r => r.eligible12M);
    const retencion12M = eligible12MList.length > 0
      ? Number(((eligible12MList.filter(r => r.retained12M).length / eligible12MList.length) * 100).toFixed(1))
      : 0;

    return {
      totalElegibles,
      totalEvaluados,
      tasaCobertura,
      cumplimientoObjetivos,
      ratingFinalPromedio,
      topPerformersCount,
      porcentajeAltoDesempeno,
      starsCount,
      porcentajeStars,
      promedioCompetencias,
      promocionesAprobadas,
      tasaPromocionInterna,
      avgTimeInGrade,
      efectividad6M,
      retencion12M
    };
  };

  // Métricas del período actual vs. período de comparación
  const currentCohortMetrics = useMemo(() => {
    return computeMetricsForCohort(filteredPerformance, filteredPromotions);
  }, [filteredPerformance, filteredPromotions]);

  const comparisonCohortMetrics = useMemo(() => {
    const compPerf = resolvedComparisonMonth === 'all'
      ? basePerformanceByOrg
      : basePerformanceByOrg.filter(c => c.Mes_Periodo === resolvedComparisonMonth);
    const compPromo = resolvedComparisonMonth === 'all'
      ? basePromotionsByOrg
      : basePromotionsByOrg.filter(r => r.Mes_Periodo === resolvedComparisonMonth);
    return computeMetricsForCohort(compPerf, compPromo);
  }, [basePerformanceByOrg, basePromotionsByOrg, resolvedComparisonMonth]);

  // Deltas calculados entre ambos períodos
  const comparisonDeltas = useMemo(() => {
    const calc = (curr: number, prev: number, isPercent: boolean = false) => {
      const diff = Number((curr - prev).toFixed(2));
      const pctChange = prev !== 0 ? Number(((diff / prev) * 100).toFixed(1)) : 0;
      return {
        diff,
        pctChange,
        isPositive: diff > 0,
        isNegative: diff < 0,
        isNeutral: Math.abs(diff) < 0.01,
        diffFormatted: (diff > 0 ? `+${diff}` : `${diff}`) + (isPercent ? '%' : '')
      };
    };

    return {
      tasaCobertura: calc(currentCohortMetrics.tasaCobertura, comparisonCohortMetrics.tasaCobertura, true),
      cumplimientoObjetivos: calc(currentCohortMetrics.cumplimientoObjetivos, comparisonCohortMetrics.cumplimientoObjetivos, true),
      ratingFinalPromedio: calc(currentCohortMetrics.ratingFinalPromedio, comparisonCohortMetrics.ratingFinalPromedio, false),
      porcentajeAltoDesempeno: calc(currentCohortMetrics.porcentajeAltoDesempeno, comparisonCohortMetrics.porcentajeAltoDesempeno, true),
      porcentajeStars: calc(currentCohortMetrics.porcentajeStars, comparisonCohortMetrics.porcentajeStars, true),
      promedioCompetencias: calc(currentCohortMetrics.promedioCompetencias, comparisonCohortMetrics.promedioCompetencias, false),
      tasaPromocionInterna: calc(currentCohortMetrics.tasaPromocionInterna, comparisonCohortMetrics.tasaPromocionInterna, true),
      avgTimeInGrade: calc(currentCohortMetrics.avgTimeInGrade, comparisonCohortMetrics.avgTimeInGrade, false),
      efectividad6M: calc(currentCohortMetrics.efectividad6M, comparisonCohortMetrics.efectividad6M, true),
      retencion12M: calc(currentCohortMetrics.retencion12M, comparisonCohortMetrics.retencion12M, true)
    };
  }, [currentCohortMetrics, comparisonCohortMetrics]);

  // ── FORMATOS CONDICIONALES ESTRICTOS (REGLA 4.3) ──
  // 1. Tasa de Cobertura < 85% -> Rojo
  const coberturaColorClass = performanceKPIs.tasaCobertura < 85
    ? 'text-red-700 bg-red-50 border-red-300'
    : 'text-emerald-700 bg-emerald-50 border-emerald-300';

  // 2. Cobertura Sucesión < 60% -> Naranja
  const sucesionColorClass = promotionsKPIs.coberturaSucesion < 60
    ? 'text-amber-800 bg-amber-50 border-amber-300'
    : 'text-emerald-700 bg-emerald-50 border-emerald-300';

  // 3. Efectividad Promoción > 80% -> Verde
  const efectividadColorClass = promotionsKPIs.efectividadPromocion > 80
    ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
    : 'text-amber-800 bg-amber-50 border-amber-300';

  // Si se solicita exclusivamente la sección de Promedio por Cargo
  if (viewSection === 'promedios_cargo') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-[#D99C00]" />
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-950 font-sans">
                  Promedio de Evaluación del Desempeño por Cargo (8 Niveles)
                </h2>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Estructura Organizacional Oficial de Districueros El Canguro, C.A. (DTH-GFD-MC-01)
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-zinc-600 font-mono">Dirección:</span>
              <select
                value={selectedDirectorate}
                onChange={(e) => setSelectedDirectorate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 font-medium text-xs focus:ring-2 focus:ring-[#F1B400] outline-none"
              >
                {OFFICIAL_DIRECTORATES.map(dir => (
                  <option key={dir} value={dir}>{dir}</option>
                ))}
              </select>
            </div>
          </div>

          <CargoPerformanceBreakdown
            collaborators={filteredPerformance}
            selectedDirectorate={selectedDirectorate}
            onSelectCollaborator={onSelectCollaborator}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* ENCABEZADO INSTITUCIONAL UNIFICADO: DIRECCIÓN DE TALENTO HUMANO           */}
      {/* ========================================================================= */}
      <div className="bg-zinc-950 text-white rounded-2xl p-6 shadow-md border-b-4 border-[#F1B400] flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-widest text-[#F1B400] uppercase font-bold">
              Dirección de Talento Humano | Área de Desarrollo y Desempeño
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              ● Enlace Activo en Tiempo Real
            </span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-sans">
              Dashboard Ejecutivo de Desarrollo y Desempeño
            </h1>
            <div className="text-sm sm:text-base font-bold text-[#F1B400] font-mono uppercase tracking-wide mt-1">
              — Resultados Generales de las Evaluaciones
            </div>
          </div>
          <p className="text-xs text-zinc-400 max-w-3xl mt-1.5 leading-relaxed">
            Consolidado interactivo automatizado que vincula en tiempo real los dos procesos estratégicos del talento corporativo: <strong>Evaluación del Desempeño</strong> y <strong>Gestión de Promociones Internas</strong>.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTROS GLOBALES DEL TABLERO (AGREGAR FILTROS)                         */}
      {/* ========================================================================= */}
      <div className="bg-white border-2 border-zinc-200 rounded-2xl p-4 shadow-xs space-y-3 sticky top-2 z-20 backdrop-blur-md bg-white/95">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                <Filter size={14} className="text-[#D99C00]" />
                Agregar Filtros
              </h3>
              <p className="text-[11px] text-zinc-500">
                Segmenta ambos módulos en tiempo real por año, mes del año, dirección corporativa, nivel jerárquico y sede, habilitando análisis comparativo intermensual de indicadores.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Restablecer Filtros</span>
              </button>
            )}
            <div className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200">
              {filteredPerformance.length} Desempeño | {filteredPromotions.length} Promociones
            </div>
          </div>
        </div>

        {/* Controles de Selección de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* 1. Año / Período */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1 flex items-center gap-1 font-mono">
              <Calendar size={12} className="text-[#D99C00]" /> Año / Período
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
            >
              <option value="2026">Ciclo 2026 (Actual)</option>
              <option value="2025">Ciclo 2025 (Histórico)</option>
              <option value="all">Todos los Períodos</option>
            </select>
          </div>

          {/* 2. Mes del Año */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1 flex items-center gap-1 font-mono">
              <Clock size={12} className="text-[#D99C00]" /> Mes del Año
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
            >
              {MONTH_OPTIONS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* 3. Área / Dirección */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1 flex items-center gap-1 font-mono">
              <Building2 size={12} className="text-[#D99C00]" /> Área / Dirección
            </label>
            <select
              value={selectedDirectorate}
              onChange={(e) => setSelectedDirectorate(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
            >
              <option value="all">Todas las Direcciones</option>
              {OFFICIAL_DIRECTORATES.filter(d => d !== 'Todas las Direcciones').map(dir => (
                <option key={dir} value={dir}>{dir}</option>
              ))}
            </select>
          </div>

          {/* 4. Nivel Jerárquico */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1 flex items-center gap-1 font-mono">
              <Briefcase size={12} className="text-[#D99C00]" /> Nivel Jerárquico
            </label>
            <select
              value={selectedHierarchy}
              onChange={(e) => setSelectedHierarchy(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
            >
              {HIERARCHY_LEVELS.map(h => (
                <option key={h.value} value={h.value}>{h.label}</option>
              ))}
            </select>
          </div>

          {/* 5. Sede / Ubicación */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1 flex items-center gap-1 font-mono">
              <MapPin size={12} className="text-[#D99C00]" /> Sede / Ubicación
            </label>
            <select
              value={selectedSede}
              onChange={(e) => setSelectedSede(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
            >
              {SEDES_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* 6. Alcance de Cargos Evaluados */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1 flex items-center gap-1 font-mono">
              <Briefcase size={12} className="text-[#D99C00]" /> Alcance de Cargos
            </label>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value as 'enabled_only' | 'all')}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
            >
              <option value="enabled_only">Solo Habilitados (Liderazgo)</option>
              <option value="all">Todo el Censo (2,406)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MÓDULO DE EVALUACIÓN DEL DESEMPEÑO                                        */}
      {/* ========================================================================= */}
      <section className="bg-white border-2 border-zinc-200 rounded-2xl p-5 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-zinc-200 gap-3">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-950">
                  Módulo de Evaluación del Desempeño
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                  Ciclo Multifuente 360° & 180°
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Cumplimiento de objetivos corporativos, cobertura, calibración forzada Gauss y matriz de talento 9-Box.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span>Rating Promedio:</span>
            <strong className="text-base text-zinc-950 font-black">{performanceKPIs.ratingFinalPromedio.toFixed(2)}</strong>
            <span className="text-[10px] text-zinc-500">/ 5.00</span>
            {comparisonDeltas && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 ${comparisonDeltas.ratingFinalPromedio.isPositive ? 'text-emerald-800 bg-emerald-100 border border-emerald-300' :
                  comparisonDeltas.ratingFinalPromedio.isNegative ? 'text-rose-800 bg-rose-100 border border-rose-300' :
                    'text-zinc-600 bg-zinc-200 border border-zinc-300'
                }`}>
                {comparisonDeltas.ratingFinalPromedio.isPositive ? <ArrowUpRight size={11} /> : comparisonDeltas.ratingFinalPromedio.isNegative ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                <span>{comparisonDeltas.ratingFinalPromedio.diffFormatted} pts</span>
                <span className="text-[9px] font-normal opacity-75">vs {getComparisonShortLabel()}</span>
              </span>
            )}
          </div>
        </div>

        {/* ── BANNER DE ALIMENTACIÓN EN TIEMPO REAL (LIVE FEED) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200 rounded-xl gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                  Alimentación en Vivo de Evaluaciones
                </span>
                <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-950 border border-emerald-300">
                  ONLINE • EN TIEMPO REAL
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-0.5">
                Los KPIs, la Curva de Gauss, la Matriz 9-Box y el Radar de Competencias se recalculan de forma dinámica y en vivo a partir de las evaluaciones reales registradas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
            <span className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-emerald-950 font-bold shadow-2xs">
              <strong className="text-emerald-700 font-black text-sm">{performanceKPIs.totalEvaluados}</strong> / {performanceKPIs.totalElegibles} Evaluados ({performanceKPIs.tasaCobertura}%)
            </span>
            <span className="px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-amber-950 font-bold shadow-2xs">
              <strong className="text-amber-700 font-black text-sm">{performanceKPIs.totalElegibles - performanceKPIs.totalEvaluados}</strong> Pendientes
            </span>
          </div>
        </div>

        {/* ── TARJETAS KPI (RESUMEN EJECUTIVO - SECCIÓN A) CON COMPARATIVA INTEGRADA ── */}
        <div className="space-y-3.5">
          {/* Fila Única: 4 KPIs Principales de Desempeño y Metas (4 columnas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Tasa de Cobertura de Evaluaciones */}
            <div className={`p-5 rounded-2xl border-2 shadow-xs flex flex-col justify-between space-y-3 relative transition-all ${coberturaColorClass}`}>
              <div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                    1. Tasa de Cobertura de Evaluaciones
                  </span>
                  <div className="flex items-center gap-1.5">
                    {performanceKPIs.tasaCobertura < 85 ? (
                      <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-red-200 text-red-950 flex items-center gap-1">
                        <AlertTriangle size={11} /> &lt; 85% ALERTA
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-950 flex items-center gap-1">
                        <CheckCircle2 size={11} /> ÓPTIMO
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-2 mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-sans tracking-tight">
                      {performanceKPIs.tasaCobertura}%
                    </span>
                    <span className="text-xs font-mono font-bold opacity-80">Cobertura</span>
                  </div>
                  {comparisonDeltas && (
                    <div className="text-right">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 ${comparisonDeltas.tasaCobertura.isPositive ? 'bg-emerald-200/90 text-emerald-950 border border-emerald-400' :
                          comparisonDeltas.tasaCobertura.isNegative ? 'bg-rose-200/90 text-rose-950 border border-rose-400' :
                            'bg-zinc-200/90 text-zinc-800'
                        }`} title={`Comparado con ${getComparisonMonthLabel()}`}>
                        {comparisonDeltas.tasaCobertura.isPositive ? <ArrowUpRight size={11} /> : comparisonDeltas.tasaCobertura.isNegative ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                        <span>{comparisonDeltas.tasaCobertura.diffFormatted}</span>
                      </span>
                      <div className="text-[10px] font-mono opacity-80 mt-0.5">
                        vs {comparisonCohortMetrics.tasaCobertura}% ({getComparisonShortLabel()})
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[11px] leading-tight opacity-90 mt-1">
                  {performanceKPIs.totalEvaluados} de {performanceKPIs.totalElegibles} colaboradores elegibles completaron su proceso a tiempo.
                </p>

                {/* MINI GRÁFICO: ESCALA DE COBERTURA INSTITUCIONAL (0% - 100%) */}
                <div className="mt-3 pt-3 border-t border-black/10">
                  <div className="flex justify-between text-[9px] font-mono opacity-80 mb-1">
                    <span>0%</span>
                    <span className="font-bold underline">Meta Institucional (≥ 85%)</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2.5 w-full bg-black/10 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-zinc-600/60 z-10" title="Meta: 85%" />
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${performanceKPIs.tasaCobertura >= 85
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-700'
                          : 'bg-gradient-to-r from-rose-400 to-amber-500'
                        }`}
                      style={{ width: `${Math.min(100, Math.max(performanceKPIs.tasaCobertura, 0))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono opacity-90 mt-1.5">
                    <span>Avance del ciclo</span>
                    <span className="font-bold">
                      {performanceKPIs.totalEvaluados} / {performanceKPIs.totalElegibles} evaluados
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-black/10 text-[10px] font-mono opacity-80 -mx-5 -mb-5 p-3 rounded-b-xl bg-black/5">
                <strong>Fórmula:</strong> (Total Evaluados / Total Elegibles) * 100
              </div>
            </div>

            {/* KPI 2: Cumplimiento Promedio de Objetivos (con acceso a desglose por Dirección) */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between space-y-3 relative group hover:border-[#F1B400] transition-all">
              <div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600">
                    2. Cumplimiento de Objetivos
                  </span>
                  <span className="p-1.5 rounded-lg bg-amber-50 text-[#D99C00]">
                    <Target size={15} />
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2 mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-zinc-950 font-sans tracking-tight">
                      {performanceKPIs.cumplimientoObjetivos}%
                    </span>
                    <span className="text-xs font-mono text-[#D99C00] font-bold">Base 100</span>
                  </div>
                  {comparisonDeltas && (
                    <div className="text-right">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 ${comparisonDeltas.cumplimientoObjetivos.isPositive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          comparisonDeltas.cumplimientoObjetivos.isNegative ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            'bg-zinc-100 text-zinc-700 border border-zinc-200'
                        }`} title={`Comparado con ${getComparisonMonthLabel()}`}>
                        {comparisonDeltas.cumplimientoObjetivos.isPositive ? <ArrowUpRight size={11} /> : comparisonDeltas.cumplimientoObjetivos.isNegative ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                        <span>{comparisonDeltas.cumplimientoObjetivos.diffFormatted}</span>
                      </span>
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                        vs {comparisonCohortMetrics.cumplimientoObjetivos}% ({getComparisonShortLabel()})
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-zinc-600 leading-tight mt-1">
                  Promedio ponderado del cumplimiento de metas operativas e individuales (Bloque 1: 60%).
                </p>

                {/* MINI GRÁFICO: ESCALA DE CUMPLIMIENTO METAS (0% - 100%) */}
                <div className="mt-3 pt-3 border-t border-zinc-100">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                    <span>0%</span>
                    <span className="text-[#D99C00] font-bold">Nivel Esperado (≥ 80%)</span>
                    <span>100%</span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-zinc-400 z-10" title="Meta: 80%" />
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-[#F1B400] to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(performanceKPIs.cumplimientoObjetivos, 0))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 mt-1.5">
                    <span>Cumplimiento alcanzado</span>
                    <span className="font-bold text-[#D99C00]">{performanceKPIs.cumplimientoObjetivos}% prom.</span>
                  </div>

                  {/* Acceso Rápido a Desglose por Dirección */}
                  <button
                    type="button"
                    onClick={() => setShowDirectorateObjectivesModal(true)}
                    className="mt-2.5 w-full py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[#D99C00] text-[10.5px] font-mono font-bold flex items-center justify-between transition-colors cursor-pointer"
                    title="Ver desglose del % de cumplimiento por cada Dirección"
                  >
                    <span className="flex items-center gap-1.5">
                      <Building2 size={12} className="text-[#D99C00]" />
                      Ver % por Dirección
                    </span>
                    <span className="text-[10px] bg-amber-200/70 text-amber-950 px-1.5 py-0.2 rounded font-black flex items-center gap-0.5">
                      {cumplimientoPorDireccion.length} Direcciones <ChevronRight size={10} />
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 text-[10px] font-mono text-zinc-400 bg-zinc-50 -mx-5 -mb-5 p-3 rounded-b-2xl">
                <strong>Fórmula:</strong> Σ Puntaje Bloque 1 (Metas) / Total Evaluados
              </div>
            </div>

            {/* KPI 3: Porcentaje de Alto Desempeño (Top Performers >= 4.0) */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between space-y-3 relative group hover:border-[#F1B400] transition-all">
              <div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600">
                    3. % Alto Desempeño (Top Performers)
                  </span>
                  <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                    <Award size={15} />
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2 mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-blue-700 font-sans tracking-tight">
                      {performanceKPIs.porcentajeAltoDesempeno}%
                    </span>
                    <span className="text-xs font-mono text-blue-600 font-bold">Rating ≥ 4.0</span>
                  </div>
                  {comparisonDeltas && (
                    <div className="text-right">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 ${comparisonDeltas.porcentajeAltoDesempeno.isPositive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          comparisonDeltas.porcentajeAltoDesempeno.isNegative ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            'bg-zinc-100 text-zinc-700 border border-zinc-200'
                        }`} title={`Comparado con ${getComparisonMonthLabel()}`}>
                        {comparisonDeltas.porcentajeAltoDesempeno.isPositive ? <ArrowUpRight size={11} /> : comparisonDeltas.porcentajeAltoDesempeno.isNegative ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                        <span>{comparisonDeltas.porcentajeAltoDesempeno.diffFormatted}</span>
                      </span>
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                        vs {comparisonCohortMetrics.porcentajeAltoDesempeno}% ({getComparisonShortLabel()})
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-zinc-600 leading-tight mt-1">
                  {performanceKPIs.topPerformersCount} colaboradores con Rating Final ≥ 4.00 pts (Tramos 4 y 5 de mérito).
                </p>

                {/* MINI GRÁFICO: DISTRIBUCIÓN POBLACIONAL GAUSS (0% - 50%+) */}
                <div className="mt-3 pt-3 border-t border-zinc-100">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                    <span>0%</span>
                    <span className="text-blue-700 font-bold">Curva Teórica Gauss (~25%)</span>
                    <span>50%+</span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-blue-300 z-10" title="Gauss teórica: 25%" />
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (performanceKPIs.porcentajeAltoDesempeno / 50) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 mt-1.5">
                    <span>Concentración Real</span>
                    <span className="font-bold text-blue-700">{performanceKPIs.topPerformersCount} Colaboradores</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 text-[10px] font-mono text-zinc-400 bg-zinc-50 -mx-5 -mb-5 p-3 rounded-b-2xl">
                <strong>Fórmula:</strong> (Evaluados Rating ≥ 4.00 / Total Evaluados) * 100
              </div>
            </div>

            {/* KPI 4: Concentración en Matriz de Talento (% Stars) */}
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between space-y-3 relative group hover:border-[#F1B400] transition-all">
              <div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600">
                    4. Concentración en Matriz (% Stars)
                  </span>
                  <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                    <Sparkles size={15} />
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2 mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-purple-800 font-sans tracking-tight">
                      {performanceKPIs.porcentajeStars}%
                    </span>
                    <span className="text-xs font-mono text-purple-700 font-bold">Cuadrante 9</span>
                  </div>
                  {comparisonDeltas && (
                    <div className="text-right">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 ${comparisonDeltas.porcentajeStars.isPositive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          comparisonDeltas.porcentajeStars.isNegative ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            'bg-zinc-100 text-zinc-700 border border-zinc-200'
                        }`} title={`Comparado con ${getComparisonMonthLabel()}`}>
                        {comparisonDeltas.porcentajeStars.isPositive ? <ArrowUpRight size={11} /> : comparisonDeltas.porcentajeStars.isNegative ? <ArrowDownRight size={11} /> : <Minus size={11} />}
                        <span>{comparisonDeltas.porcentajeStars.diffFormatted}</span>
                      </span>
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                        vs {comparisonCohortMetrics.porcentajeStars}% ({getComparisonShortLabel()})
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-zinc-600 leading-tight mt-1">
                  Cuadrante 9 (Alto Desempeño + Alto Potencial): {performanceKPIs.starsCount} talento(s).
                </p>

                {/* MINI GRÁFICO: ESCALA CONCENTRACIÓN STARS (0% - 30%+) */}
                <div className="mt-3 pt-3 border-t border-zinc-100">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                    <span>0%</span>
                    <span className="text-purple-700 font-bold">Rango Saludable Q9 (5% - 15%)</span>
                    <span>30%+</span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 left-[33%] w-0.5 bg-purple-300 z-10" title="Meta: ~10%" />
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-[#F1B400] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (performanceKPIs.porcentajeStars / 30) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 mt-1.5">
                    <span>Población Q9 Stars</span>
                    <span className="font-bold text-purple-700">{performanceKPIs.starsCount} en Q9 ★ Top Talent</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 text-[10px] font-mono text-zinc-400 bg-zinc-50 -mx-5 -mb-5 p-3 rounded-b-2xl">
                <strong>Fórmula:</strong> (Colaboradores en Cuadrante 9 / Total Evaluados) * 100
              </div>
            </div>
          </div>

          {/* ── SECCIÓN DEDICADA: CUMPLIMIENTO DE OBJETIVOS POR DIRECCIÓN CORPORATIVA (BASE 100) ── */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-50 text-[#D99C00]">
                    <Building2 size={16} />
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                    Cumplimiento de Objetivos por Dirección Corporativa (Base 100)
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Porcentaje promedio de cumplimiento en medición de indicadores y metas clave (Bloque 1: 60%) segmentado por cada Dirección.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                  Meta Institucional: ≥ 80% Base 100
                </span>
                <button
                  type="button"
                  onClick={() => setShowDirectorateObjectivesModal(true)}
                  className="px-3 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-[#F1B400] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye size={13} />
                  <span>Ver Tabla Completa</span>
                </button>
              </div>
            </div>

            {/* Cuadrícula de Direcciones con Barras de Progreso */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {cumplimientoPorDireccion.map((dirData) => {
                const meetsTarget = dirData.avgObjetivos >= 80;
                const exceedsTarget = dirData.avgObjetivos >= 85;
                const dirLower = (dirData.directorate || '').toLowerCase();
                const selDirLower = (selectedDirectorate || '').toLowerCase();
                const isSelected = selDirLower.includes(dirLower) || dirLower.includes(selDirLower);

                return (
                  <div
                    key={dirData.directorate}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${isSelected && selectedDirectorate !== 'all'
                        ? 'bg-amber-50/70 border-[#F1B400] ring-1 ring-[#F1B400]'
                        : 'bg-zinc-50/70 border-zinc-200 hover:border-zinc-300'
                      }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5 mb-1.5">
                        <span className="text-xs font-bold text-zinc-900 line-clamp-1" title={dirData.directorate}>
                          {dirData.directorate}
                        </span>
                        <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${exceedsTarget
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : meetsTarget
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                          {exceedsTarget ? 'Sobresaliente' : meetsTarget ? 'Cumple Meta' : 'Bajo Meta'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between mt-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-2xl font-black font-sans tracking-tight ${exceedsTarget ? 'text-emerald-700' : meetsTarget ? 'text-zinc-950' : 'text-rose-700'
                            }`}>
                            {dirData.avgObjetivos}%
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">Base 100</span>
                        </div>
                        <span className="text-[10.5px] font-mono text-zinc-500">
                          {dirData.evaluated}/{dirData.total} evaluados
                        </span>
                      </div>

                      {/* Barra de progreso con marcador de meta en 80% */}
                      <div className="mt-2">
                        <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden relative">
                          <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-zinc-500 z-10" title="Meta: 80%" />
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${exceedsTarget
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                                : meetsTarget
                                  ? 'bg-gradient-to-r from-amber-400 to-[#F1B400]'
                                  : 'bg-gradient-to-r from-rose-400 to-rose-600'
                              }`}
                            style={{ width: `${Math.min(100, Math.max(dirData.avgObjetivos, 0))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-zinc-400 mt-1">
                          <span>0%</span>
                          <span className="text-zinc-500 font-bold">Meta 80%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-200/80 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedDirectorate === dirData.directorate) {
                            setSelectedDirectorate('all');
                          } else {
                            setSelectedDirectorate(dirData.directorate);
                          }
                        }}
                        className={`text-[10.5px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 ${isSelected && selectedDirectorate !== 'all'
                            ? 'text-amber-800 hover:text-amber-950'
                            : 'text-zinc-600 hover:text-zinc-900'
                          }`}
                      >
                        <span>{isSelected && selectedDirectorate !== 'all' ? '✕ Quitar filtro' : 'Filtrar dirección'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDirectorateObjectivesModal(true)}
                        className="text-[10px] font-mono text-zinc-400 hover:text-zinc-700 underline cursor-pointer"
                      >
                        Ver detalle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {viewSection === 'all' && (
          <>
            {/* ── SECCIÓN ESPECIAL: PROMEDIO DE EVALUACIÓN DEL DESEMPEÑO POR CARGO (ESTRUCTURA ORGANIZACIONAL) ── */}
            <div id="sec-promedios-por-cargo" className="scroll-mt-20">
              <CargoPerformanceBreakdown
                collaborators={filteredPerformance}
                selectedDirectorate={selectedDirectorate}
                onSelectCollaborator={onSelectCollaborator}
              />
            </div>

            {/* ── SECCIÓN ESPECIAL: IMPACTO DEL NIVEL ACADÉMICO EN EL DESEMPEÑO ── */}
            <div id="sec-nivel-academico" className="scroll-mt-20">
              <PeopleAnalyticsEducationDashboard
                liveState={liveState || {
                  employeeInfo: CANGURO_COLLABORATORS[0].info,
                  selfEval: CANGURO_COLLABORATORS[0].selfEval,
                  supervisorEval: CANGURO_COLLABORATORS[0].supervisorEval,
                  peerEval: CANGURO_COLLABORATORS[0].peerEval,
                  subordinateEval: CANGURO_COLLABORATORS[0].subordinateEval,
                  notifications: []
                }}
                onSelectCollaborator={onSelectCollaborator}
              />
            </div>
          </>
        )}

        {/* ── VISUALIZACIONES GRÁFICAS DE DESEMPEÑO (GRÁFICOS 1, 2 Y 3) ── */}
        <div className="space-y-5 pt-2">
          {/* GRÁFICO 1: Campana de Gauss Continua (Curva de Calibración Institucional) */}
          <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                    <BarChart3 size={15} className="text-[#D99C00]" />
                    Gráfico 1: Curva de Calibración Gaussiana (Campana de Gauss)
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-900 border border-zinc-300">
                    Gauss 100%
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Distribución Real Observada vs. Curva Teórica de Calibración Forzada ({selectedDirectorate === 'all' ? 'Toda la Organización' : selectedDirectorate})
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-800 font-bold">
                  Promedio Observado: <strong className="text-zinc-950 text-sm font-black">{performanceKPIs.ratingFinalPromedio.toFixed(2)} pts</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                  Desviación Media: ±{avgCalibrationDeviation} p.p.
                </span>
              </div>
            </div>

            {/* SVG Visual: Campana de Gauss Continua Matemática Idéntica a la Imagen Referencial */}
            <div className="bg-white rounded-xl border border-zinc-200 p-3 sm:p-4 shadow-2xs overflow-hidden max-w-4xl mx-auto">
              <svg
                viewBox="0 0 760 215"
                className="w-full h-auto select-none mx-auto block"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="gauss-grad-t1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0.10" />
                  </linearGradient>
                  <linearGradient id="gauss-grad-t2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.40" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.10" />
                  </linearGradient>
                  <linearGradient id="gauss-grad-t3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0.12" />
                  </linearGradient>
                  <linearGradient id="gauss-grad-t4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.10" />
                  </linearGradient>
                  <linearGradient id="gauss-grad-t5" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity="0.10" />
                  </linearGradient>
                  <filter id="gauss-shadow-pin" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.30" />
                  </filter>
                </defs>

                {(() => {
                  const width = 760;
                  const padX = 35;
                  const plotW = width - padX * 2; // 690 px
                  const baselineY = 152;
                  const peakHeight = 112;

                  const tBounds = [0.0, 0.18, 0.38, 0.65, 0.84, 1.0];
                  const toSvgX = (t: number) => padX + t * plotW;
                  const xBounds = tBounds.map(t => toSvgX(t));

                  const gaussianDensity = (t: number) => {
                    const sigma = 0.175;
                    const z = (t - 0.515) / sigma;
                    return Math.exp(-0.5 * z * z);
                  };

                  const getGaussianY = (t: number) => {
                    const density = gaussianDensity(t);
                    return baselineY - density * peakHeight;
                  };

                  const steps = 140;
                  const curvePts: Array<{ x: number; y: number; t: number }> = [];
                  for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    curvePts.push({ t, x: toSvgX(t), y: getGaussianY(t) });
                  }

                  const curvePathD = curvePts.reduce((acc, pt, idx) => {
                    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
                  }, '');

                  const getAreaD = (startT: number, endT: number) => {
                    const pts = curvePts.filter(p => p.t >= startT && p.t <= endT);
                    if (pts.length === 0) return '';
                    const startX = toSvgX(startT);
                    const endX = toSvgX(endT);
                    let d = `M ${startX.toFixed(1)} ${baselineY}`;
                    pts.forEach(p => { d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`; });
                    d += ` L ${endX.toFixed(1)} ${baselineY} Z`;
                    return d;
                  };

                  // Promedio observado del dataset
                  const obsScore = performanceKPIs.ratingFinalPromedio > 0 ? performanceKPIs.ratingFinalPromedio : 3.90;
                  const pctObs = obsScore <= 5.0 ? (obsScore / 5.0) * 100 : obsScore;
                  let tObs = 0.515;
                  if (pctObs <= 54) tObs = (pctObs / 54) * 0.18;
                  else if (pctObs <= 65) tObs = 0.18 + ((pctObs - 55) / 10) * 0.20;
                  else if (pctObs <= 79) tObs = 0.38 + ((pctObs - 66) / 13) * 0.27;
                  else if (pctObs <= 100) tObs = 0.65 + ((pctObs - 80) / 20) * 0.19;
                  else tObs = 0.84 + ((pctObs - 101) / 24) * 0.16;

                  const xPin = toSvgX(tObs);
                  const yPin = getGaussianY(tObs);
                  const badgeY = Math.max(8, yPin - 32);

                  return (
                    <g>
                      {/* 1. TÍTULOS SUPERIORES DE CADA ZONA */}
                      <g className="select-none pointer-events-none">
                        {GAUSS_TRAMOS.map(t => (
                          <text
                            key={`gt-top-${t.tierId}`}
                            x={(toSvgX(t.startT) + toSvgX(t.endT)) / 2}
                            y={19}
                            textAnchor="middle"
                            fontSize="10.5"
                            fontWeight="900"
                            fill={t.topColor}
                            fontFamily="sans-serif"
                          >
                            {t.topLabel}
                          </text>
                        ))}
                      </g>

                      {/* 2. Sombreado de los 5 Tramos bajo la Campana de Gauss */}
                      <path d={getAreaD(0.0, 0.18)} fill="url(#gauss-grad-t1)" />
                      <path d={getAreaD(0.18, 0.38)} fill="url(#gauss-grad-t2)" />
                      <path d={getAreaD(0.38, 0.65)} fill="url(#gauss-grad-t3)" />
                      <path d={getAreaD(0.65, 0.84)} fill="url(#gauss-grad-t4)" />
                      <path d={getAreaD(0.84, 1.0)} fill="url(#gauss-grad-t5)" />

                      {/* Líneas sutiles horizontales discontinuas en Zona Esperado */}
                      <line x1={xBounds[2]} y1={baselineY - 30} x2={xBounds[3]} y2={baselineY - 30} stroke="#16A34A" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
                      <line x1={xBounds[2]} y1={baselineY - 55} x2={xBounds[3]} y2={baselineY - 55} stroke="#16A34A" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
                      <line x1={xBounds[2]} y1={baselineY - 80} x2={xBounds[3]} y2={baselineY - 80} stroke="#16A34A" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />

                      {/* 3. Trazado Continuo de la Campana de Gauss */}
                      <path
                        d={curvePathD}
                        fill="none"
                        stroke="#18181B"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />

                      {/* 4. Líneas divisorias verticales punteadas */}
                      {xBounds.slice(1, -1).map((xVal, idx) => (
                        <line
                          key={`gbound-${idx}`}
                          x1={xVal}
                          y1={24}
                          x2={xVal}
                          y2={baselineY}
                          stroke="#94A3B8"
                          strokeWidth="1.2"
                          strokeDasharray="4 4"
                          opacity="0.8"
                        />
                      ))}

                      {/* 5. Señalador del Promedio Real Observado */}
                      {performanceKPIs.ratingFinalPromedio > 0 && (
                        <g filter="url(#gauss-shadow-pin)">
                          <line
                            x1={xPin}
                            y1={baselineY}
                            x2={xPin}
                            y2={yPin}
                            stroke="#18181B"
                            strokeWidth="1.8"
                            strokeDasharray="3 2"
                          />
                          <circle cx={xPin} cy={yPin} r="4.5" fill="#F1B400" stroke="#18181B" strokeWidth="2" />
                          <g transform={`translate(${Math.min(width - 150, Math.max(10, xPin - 70))}, ${badgeY})`}>
                            <rect
                              width="140"
                              height="22"
                              rx="11"
                              fill="#18181B"
                              stroke="#F1B400"
                              strokeWidth="1.5"
                            />
                            <text
                              x="70"
                              y="14.5"
                              textAnchor="middle"
                              fontSize="9.5"
                              fontWeight="900"
                              fill="#FFFFFF"
                              fontFamily="monospace"
                            >
                              ▼ PROMEDIO: {pctObs.toFixed(1)}%
                            </text>
                          </g>
                        </g>
                      )}

                      {/* 6. Bloques horizontales sólidos de rango en la línea base */}
                      {GAUSS_TRAMOS.map(t => {
                        const startX = toSvgX(t.startT);
                        const endX = toSvgX(t.endT);
                        const blockW = endX - startX;
                        return (
                          <g key={`solid-b-${t.tierId}`}>
                            <rect
                              x={startX}
                              y={baselineY}
                              width={blockW}
                              height={24}
                              fill={t.solidColor}
                            />
                            <text
                              x={startX + blockW / 2}
                              y={baselineY + 16}
                              textAnchor="middle"
                              fill="#FFFFFF"
                              fontSize="11"
                              fontWeight="900"
                              fontFamily="sans-serif"
                            >
                              {t.rangeLabel}
                            </text>
                          </g>
                        );
                      })}

                      {/* 7. Eje regla inferior con marcas verticales */}
                      <line
                        x1={xBounds[0]}
                        y1={baselineY + 24}
                        x2={xBounds[5]}
                        y2={baselineY + 24}
                        stroke="#0F172A"
                        strokeWidth="2"
                      />
                      {xBounds.map((x, i) => (
                        <line
                          key={`gtick-${i}`}
                          x1={x}
                          y1={baselineY + 20}
                          x2={x}
                          y2={baselineY + 28}
                          stroke="#0F172A"
                          strokeWidth="2"
                        />
                      ))}
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Tabla Comparativa de Calibración: Real vs. Teórico Gauss (Idéntica a la Imagen Referencial) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              {calibrationData.map(t => {
                const isAligned = t.absDeviation <= 5;
                return (
                  <div key={t.tierId} className={`p-3.5 rounded-2xl border-2 ${t.bgLight} ${t.borderLight} flex flex-col justify-between shadow-2xs`}>
                    <div>
                      {/* Rango superior */}
                      <div className="text-center font-bold text-xs text-zinc-700 font-sans tracking-tight mb-1">
                        {t.rangeDisplay}
                      </div>

                      {/* Denominación en mayúsculas con color oficial */}
                      <div className={`text-center font-black text-xs uppercase tracking-tight mb-3 ${t.textColor}`}>
                        {t.name}
                      </div>

                      {/* Tarjeta interna blanca con la política / acción */}
                      <div className="bg-white rounded-xl p-2.5 border border-zinc-200/90 shadow-2xs text-center flex items-center justify-center min-h-[56px] mb-3">
                        <p className="text-[10.5px] font-medium text-zinc-800 leading-snug">
                          {t.policy}
                        </p>
                      </div>
                    </div>

                    {/* Métricas de Distribución de Colaboradores */}
                    <div className="pt-2 border-t border-zinc-200/70 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-zinc-600 font-medium">% Real:</span>
                        <span className="text-sm font-mono font-black text-zinc-950">
                          {t.percentReal}%
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                        <span>Colaboradores:</span>
                        <strong className="text-zinc-800">{t.countInTier}</strong>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                        <span>Meta Gauss:</span>
                        <strong className="text-zinc-800">{t.targetPercent}%</strong>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono pt-1 border-t border-zinc-200/60">
                        <span>Desviación:</span>
                        <span className={`font-black ${isAligned ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {t.deviation > 0 ? `+${t.deviation}` : t.deviation} p.p.
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recuadro Técnico Explicativo: ¿Qué se observa en este gráfico? */}
            <div className="p-3.5 bg-white rounded-xl border border-zinc-200 text-xs text-zinc-700 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-zinc-950">
                <HelpCircle size={15} className="text-[#D99C00]" />
                <span className="uppercase tracking-wider font-mono text-[11px]">¿Qué se observa en este gráfico?</span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-600">
                <strong>Calibración Forzada de la Curva Normal de Gauss:</strong> Este modelo estadístico audita el rigor metodológico y la objetividad de las calificaciones.
                En una organización con calibración saludable, las evaluaciones se concentran naturalmente en el centro (<strong>50% en el Tramo 3: Desempeño Esperado, 80% a 100%</strong>), con proporciones simétricas hacia el desempeño en desarrollo (20% en T2: En Desarrollo / Por Debajo de lo Esperado, 55% a 79%) y desempeño sobresaliente (20% en T4: Desempeño Sobresaliente, 101% a 110%), reservando los extremos (Desempeño Insatisfactorio T1 &lt; 54% y Desempeño Excepcional T5 110% a 120%) para un 5% de la población respectivamente. La aguja vertical indica el <strong>promedio real ({performanceKPIs.ratingFinalPromedio.toFixed(2)} pts)</strong> del colectivo analizado ({selectedDirectorate === 'all' ? 'Toda la Organización' : selectedDirectorate}), permitiendo auditar posibles sesgos de indulgencia o severidad.
              </p>
            </div>
          </div>

          {/* Gráficos Inferiores: Matriz 9-Box y Radar de Competencias (Side by Side) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* GRÁFICO 2: Matriz 9-Box — Promedio de Distribución de Colaboradores por Cuadrante */}
            <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-zinc-200 gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                      <Layers size={15} className="text-[#D99C00]" />
                      Gráfico 2: Matriz 9-Box — Promedio de Distribución
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Promedio de distribución de colaboradores por cuadrante ({selectedDirectorate === 'all' ? 'Vista General Organizacional' : `Dirección: ${selectedDirectorate}`})
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 border border-emerald-300 self-start sm:self-auto">
                    {performanceKPIs.starsCount} Stars (Q9: {performanceKPIs.porcentajeStars}%)
                  </span>
                </div>

                {/* Métricas de Promedio para la Matriz 9-Box */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs my-3">
                  <div className="p-2 rounded-lg bg-white border border-zinc-200">
                    <span className="text-[10px] text-zinc-500 block">Promedio Desempeño (X):</span>
                    <strong className="text-sm font-mono font-black text-zinc-950">{nineBoxDistribution.avgX.toFixed(2)}</strong>
                    <span className="text-[9px] text-zinc-400"> / 5.00</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-zinc-200">
                    <span className="text-[10px] text-zinc-500 block">Promedio Potencial (Y):</span>
                    <strong className="text-sm font-mono font-black text-[#D99C00]">{nineBoxDistribution.avgY.toFixed(2)}</strong>
                    <span className="text-[9px] text-zinc-400"> / 5.00</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-zinc-200">
                    <span className="text-[10px] text-zinc-500 block">Cuadrante Promedio:</span>
                    <strong className="text-sm font-mono font-black text-blue-700">Q{nineBoxDistribution.avgQuad}</strong>
                    <span className="text-[9px] text-zinc-400 block font-sans">
                      {nineBoxDistribution.grid[nineBoxDistribution.avgQuad]?.tag || 'Núcleo'}
                    </span>
                  </div>
                </div>

                {/* Contenedor con Eje Vertical POTENCIAL y Matriz 3x3 */}
                <div className="flex items-stretch gap-2 sm:gap-2.5">
                  {/* EJE VERTICAL Y: POTENCIAL */}
                  <div className="flex flex-col items-center justify-between py-2 px-1 rounded-xl bg-amber-500/10 border border-amber-300/60 shrink-0 select-none">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-amber-700">▲</span>
                      <div className="w-0.5 h-8 bg-gradient-to-t from-amber-400 to-amber-600 rounded-full mt-0.5"></div>
                    </div>
                    <div className="flex-1 flex items-center justify-center my-2">
                      <span
                        className="text-[9px] font-black tracking-[0.2em] text-amber-950 uppercase select-none font-mono"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        POTENCIAL
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-amber-400 to-amber-300 rounded-full mb-0.5"></div>
                      <span className="text-[8px] font-mono font-bold text-amber-700">Y</span>
                    </div>
                  </div>

                  {/* Grilla 3x3 de Matriz 9-Box en Degradado de Amarillos */}
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(quadId => {
                      const cell = nineBoxDistribution.grid[quadId];
                      const pct = nineBoxDistribution.totalEval > 0
                        ? Number(((cell.count / nineBoxDistribution.totalEval) * 100).toFixed(1))
                        : 0;
                      const isStar = quadId === 9;

                      return (
                        <div
                          key={quadId}
                          className={`rounded-xl p-2 sm:p-2.5 flex flex-col justify-between transition-all border shadow-xs ${cell.bg} ${cell.border} ${isStar ? 'ring-2 ring-amber-500 shadow-md shadow-amber-400/20' : ''
                            }`}
                          title={`${cell.name}: ${cell.count} colaboradores (${pct}% del colectivo)`}
                        >
                          <div>
                            {/* Fila Superior: Cuadrante y Badge Promedio */}
                            <div className="flex justify-between items-center text-[9px] font-mono mb-1 pb-0.5 border-b border-black/10">
                              <span className="font-black text-zinc-900">Q{quadId}</span>
                              <span className="font-mono font-bold text-amber-950 bg-white/70 px-1 py-0.2 rounded border border-amber-300/60">
                                {pct}%
                              </span>
                            </div>

                            {/* Título Oficial */}
                            <h5 className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-tight text-zinc-950 leading-tight mb-1">
                              {cell.name}
                            </h5>

                            {/* Descripción / Acción Institucional */}
                            <p className="text-[8.5px] sm:text-[9px] leading-tight text-zinc-800 font-medium line-clamp-3">
                              {cell.action}
                            </p>
                          </div>

                          {/* Métrica de Colaboradores Ubicados */}
                          <div className="mt-1.5 pt-1 border-t border-black/10 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-zinc-600">Promedio:</span>
                            <span className="text-xs font-mono font-black text-zinc-950">
                              {cell.count} <span className="text-[9px] font-normal text-zinc-700">colab.</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* EJE HORIZONTAL X: DESEMPEÑO */}
                <div className="flex items-center justify-between mt-2 pl-6 pr-2 py-1 px-2.5 rounded-lg bg-amber-500/10 border border-amber-300/60 select-none text-[9px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-amber-700">X</span>
                    <span className="font-black tracking-[0.2em] text-amber-950 uppercase">
                      DESEMPEÑO
                    </span>
                  </div>
                  <div className="flex items-center flex-1 mx-2 sm:mx-3">
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 rounded-full"></div>
                    <span className="text-xs font-black text-amber-600 -ml-1">▶</span>
                  </div>
                  <span className="text-amber-800 font-bold hidden sm:inline text-[8.5px]">
                    Bajo (&lt; 3.00) • Medio (3.00 - 4.24) • Alto (≥ 4.25)
                  </span>
                </div>
              </div>

              {/* Pie de Matriz: Especificación de Promedio General y por Dirección */}
              <div className="text-[10.5px] text-zinc-600 bg-white p-2.5 rounded-xl border border-zinc-200 font-mono text-center space-y-0.5">
                <div className="font-bold text-zinc-800">
                  {selectedDirectorate === 'all'
                    ? '★ Visual General: Promedio de Distribución de Colaboradores de Toda la Organización'
                    : `★ Visual por Dirección: Promedio de Distribución de Colaboradores de ${selectedDirectorate}`}
                </div>
                <div className="text-[9.5px] text-zinc-500">
                  Eje X: Desempeño Cuantitativo (1.00 - 5.00) • Eje Y: Potencial & Liderazgo (1.00 - 5.00)
                </div>
              </div>
            </div>

            {/* GRÁFICO 3: Radar Dinámico de Competencias (Cardinales + Supervisión [+ Específicas por Dirección]) */}
            <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-zinc-200 gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                      <Activity size={15} className="text-[#D99C00]" />
                      Gráfico 3: Radar de Competencias
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {selectedDirectorate === 'all'
                        ? 'Promedio de Puntuaciones: 5 Cardinales + 3 Supervisión (8 en total)'
                        : `Promedio: 5 Cardinales + 3 Supervisión + 3 Específicas de ${selectedDirectorate} (11 en total)`}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 self-start sm:self-auto">
                    {dynamicRadarCompetencies.totalCount} Competencias
                  </span>
                </div>

                {/* Sub-promedios de Competencias */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs my-3">
                  <div className="p-2 rounded-lg bg-white border border-zinc-200">
                    <span className="text-[10px] text-zinc-500 block">Promedio Global:</span>
                    <strong className="text-sm font-mono font-black text-zinc-950">{dynamicRadarCompetencies.overallCompAvg.toFixed(2)}</strong>
                    <span className="text-[9px] text-zinc-400"> / 5.00</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-zinc-200">
                    <span className="text-[10px] text-zinc-500 block">5 Cardinales:</span>
                    <strong className="text-sm font-mono font-black text-[#D99C00]">{dynamicRadarCompetencies.cardinalAvg.toFixed(2)}</strong>
                    <span className="text-[9px] text-zinc-400"> / 5.00</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-zinc-200">
                    <span className="text-[10px] text-zinc-500 block">3 Supervisión:</span>
                    <strong className="text-sm font-mono font-black text-blue-700">{dynamicRadarCompetencies.supervisionAvg.toFixed(2)}</strong>
                    <span className="text-[9px] text-zinc-400"> / 5.00</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-zinc-200">
                    <span className="text-[10px] text-zinc-500 block">
                      {dynamicRadarCompetencies.hasSpecifics ? '3 Específicas:' : 'Estándar Meta:'}
                    </span>
                    <strong className={`text-sm font-mono font-black ${dynamicRadarCompetencies.hasSpecifics ? 'text-emerald-700' : 'text-zinc-900'}`}>
                      {dynamicRadarCompetencies.hasSpecifics ? dynamicRadarCompetencies.specificAvg.toFixed(2) : '3.75 pts'}
                    </strong>
                    <span className="text-[9px] text-zinc-400"> {dynamicRadarCompetencies.hasSpecifics ? '/ 5.00' : '(Apto)'}</span>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="h-64 w-full bg-white rounded-xl border border-zinc-200 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="68%" data={dynamicRadarCompetencies.items}>
                      <PolarGrid stroke="#D4D4D8" />
                      <PolarAngleAxis dataKey="competency" tick={{ fontSize: 9, fill: '#18181B', fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 8 }} />
                      <Radar name="Promedio Real" dataKey="promedioReal" stroke="#F1B400" fill="#F1B400" fillOpacity={0.55} />
                      <Radar name="Estándar 3.75" dataKey="estandarEsperado" stroke="#18181B" strokeDasharray="3 3" fill="none" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181B', color: '#FFFFFF', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                        formatter={(val: any, name: string) => [`${val} pts`, name === 'promedioReal' ? 'Promedio Real Observado' : 'Estándar Esperado']}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie del Radar */}
              <div className="text-[11px] text-zinc-500 bg-white p-2.5 rounded-xl border border-zinc-200 font-mono text-center">
                {selectedDirectorate === 'all' ? (
                  <span>
                    Vista General: Evaluando las <strong>5 Competencias Cardinales</strong> y las <strong>3 Competencias Gerenciales/Supervisión</strong> a nivel corporativo.
                  </span>
                ) : (
                  <span>
                    Vista por Dirección: Evaluando las <strong>5 Cardinales</strong>, las <strong>3 Gerenciales/Supervisión</strong> y las <strong>3 Específicas del Área</strong> ({selectedDirectorate}).
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MÓDULO DE GESTIÓN DE PROMOCIONES                                          */}
      {/* ========================================================================= */}
      <section className="bg-white border-2 border-zinc-200 rounded-2xl p-5 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-zinc-200 gap-3">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-950">
                  Módulo de Gestión de Promociones
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                  Carrera & Movilidad Interna
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Tasa de promoción interna, tiempo en cargo, cobertura de sucesores, equidad de género, efectividad a 6M, retención a 12M y registro consolidado.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Completo de Promociones Integrado */}
        <PromotionsDashboard
          embedded={true}
          onSelectCollaborator={(idNumber) => {
            if (onSelectCollaborator) {
              const found = CANGURO_COLLABORATORS.find(c => c.info.idNumber === idNumber || c.info.id === idNumber);
              if (found && found.info.id) {
                onSelectCollaborator(found.info.id);
              } else {
                onSelectCollaborator(idNumber);
              }
            }
          }}
        />
      </section>

      {/* ========================================================================= */}
      {/* SELLO DE GOBERNANZA Y REGLAS DE AUTOMATIZACIÓN (REGLA 4)                   */}
      {/* ========================================================================= */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span>
            <strong>Gobernanza Automatizada:</strong> Este tablero se recalcula dinámicamente con cada evaluación recibida sin scripts manuales.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-800">
            Filtro Actual: {selectedYear} • {getMonthLabel(selectedMonth)} • {selectedDirectorate} • {selectedHierarchy} • {selectedSede}
          </span>
        </div>
      </div>

      {/* ── MODAL DETALLE DE CUMPLIMIENTO DE OBJETIVOS POR DIRECCIÓN ── */}
      {showDirectorateObjectivesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-zinc-900 font-sans">
            <div className="bg-zinc-950 text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#F1B400]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-amber-500/10 text-[#F1B400] border border-[#F1B400]/20">
                  <Building2 size={18} />
                </span>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-white">
                    Cumplimiento de Objetivos por Dirección Corporativa
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Desglose detallado de medición de metas e indicadores operativos (Bloque 1: 60%) • Base 100
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectorateObjectivesModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase block">Promedio General</span>
                  <span className="text-2xl font-black text-zinc-950">{performanceKPIs.cumplimientoObjetivos}%</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Toda la Organización</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 font-mono">
                  <span className="text-[10px] text-emerald-800 uppercase block">Direcciones en o sobre Meta (≥80%)</span>
                  <span className="text-2xl font-black text-emerald-700">
                    {cumplimientoPorDireccion.filter(d => d.avgObjetivos >= 80).length} / {cumplimientoPorDireccion.length}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">Apego a metas institucionales</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 font-mono">
                  <span className="text-[10px] text-amber-900 uppercase block">Meta Exigida</span>
                  <span className="text-2xl font-black text-amber-700">80.0%</span>
                  <span className="text-[10px] text-amber-600 block mt-0.5">Estándar mínimo esperado</span>
                </div>
              </div>

              <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-100 border-b border-zinc-200 font-mono text-[10.5px] text-zinc-600 uppercase">
                      <th className="py-2.5 px-3">Dirección Corporativa</th>
                      <th className="py-2.5 px-3 text-center">Evaluados</th>
                      <th className="py-2.5 px-3 text-right">% Cumplimiento (Base 100)</th>
                      <th className="py-2.5 px-3">Progreso vs Meta (80%)</th>
                      <th className="py-2.5 px-3 text-center">Diagnóstico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {cumplimientoPorDireccion.map((dirData) => {
                      const exceeds = dirData.avgObjetivos >= 85;
                      const meets = dirData.avgObjetivos >= 80;
                      return (
                        <tr key={dirData.directorate} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-3 px-3 font-bold text-zinc-900">
                            {dirData.directorate}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-zinc-600">
                            {dirData.evaluated} / {dirData.total}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-black text-sm">
                            <span className={exceeds ? 'text-emerald-700' : meets ? 'text-zinc-950' : 'text-rose-700'}>
                              {dirData.avgObjetivos}%
                            </span>
                          </td>
                          <td className="py-3 px-3 w-48">
                            <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden relative">
                              <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-zinc-500 z-10" />
                              <div
                                className={`h-full rounded-full ${exceeds ? 'bg-emerald-500' : meets ? 'bg-[#F1B400]' : 'bg-rose-500'
                                  }`}
                                style={{ width: `${Math.min(100, Math.max(dirData.avgObjetivos, 0))}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${exceeds
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : meets
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                              {exceeds ? 'Sobresaliente' : meets ? 'Cumple Meta' : 'Bajo Meta'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-zinc-100 px-6 py-3 border-t border-zinc-200 flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-500">
                Total Direcciones Registradas: {cumplimientoPorDireccion.length}
              </span>
              <button
                type="button"
                onClick={() => setShowDirectorateObjectivesModal(false)}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

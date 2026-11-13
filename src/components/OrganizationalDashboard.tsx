import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { CANGURO_COLLABORATORS, getSavedPilotEvaluation } from '../data/canguroUniverso';
import { calculateConsolidatedMetrics } from '../utils/realEvaluationMetrics';
import { subscribeToStorage } from '../store';
import {
  Users, Award, BarChart3, TrendingUp, AlertTriangle, ShieldCheck,
  Flame, CheckCircle2, Eye, Building2, Filter, Clock, ChevronLeft, ChevronRight, Layers,
  Sparkles, GraduationCap, Briefcase
} from 'lucide-react';

import { AppState } from '../types';
import { OFFICIAL_COMPANY_HEADCOUNT } from '../data/promotionsAnalyticsData';
import { ExecutiveTalentDashboard } from './ExecutiveTalentDashboard';
import { CargoPerformanceBreakdown } from './CargoPerformanceBreakdown';
import { PeopleAnalyticsEducationDashboard } from './PeopleAnalyticsEducationDashboard';

export type OrgDashboardSectionKey = 'general' | 'promedios_cargo' | 'analitica' | 'ranking' | 'nivel_academico';

interface OrganizationalDashboardProps {
  onSelectCollaborator: (collabId: string) => void;
  onNavigateToPromotionsDashboard?: () => void;
  liveState?: AppState;
  initialMode?: 'executive_integrated' | 'operational_sections';
  initialSection?: OrgDashboardSectionKey | 'kpis' | 'charts' | 'heatmap';
  onModeChange?: (mode: 'executive_integrated' | 'operational_sections') => void;
  onSectionChange?: (section: OrgDashboardSectionKey) => void;
}

// 8 Direcciones corporativas oficiales de Districueros El Canguro, C.A. (DTH-GFD-MC-01)
const MACRO_DIRECTORATES = [
  {
    directorate: 'Dirección Comercial',
    cluster: 'Motores de Venta',
    matchDirectorates: ['Dirección Comercial', 'Comercial'],
    specific1Name: 'Gestión de Indicadores',
    specific1Id: 'area-sales-2',
    specific2Name: 'Visual Merchandising',
    specific2Id: 'area-sales-3',
    specific3Name: 'Negociación Comercial',
    specific3Id: 'area-sales-1',
  },
  {
    directorate: 'Dirección de Operaciones (Tiendas)',
    cluster: 'Motores de Venta',
    matchDirectorates: ['Dirección de Operaciones', 'Dirección de Operaciones (Tiendas)', 'Operaciones'],
    specific1Name: 'Gestión de Indicadores',
    specific1Id: 'area-sales-2',
    specific2Name: 'Visual Merchandising',
    specific2Id: 'area-sales-3',
    specific3Name: 'Negociación Comercial',
    specific3Id: 'area-sales-1',
  },
  {
    directorate: 'Dirección de Transporte y Logística',
    cluster: 'Soporte Transversal',
    matchDirectorates: ['Dirección de Transporte y Logística', 'Transporte y Logística', 'Logística'],
    specific1Name: 'Orientación al Servicio',
    specific1Id: 'area-support-1',
    specific2Name: 'Optimización de Procesos',
    specific2Id: 'area-support-2',
    specific3Name: 'Infraestructura Crítica',
    specific3Id: 'area-support-3',
  },
  {
    directorate: 'Dirección de Tecnología',
    cluster: 'Soporte Transversal',
    matchDirectorates: ['Dirección de Tecnología', 'Dirección de Tecnología de la Información', 'Tecnología'],
    specific1Name: 'Orientación al Servicio',
    specific1Id: 'area-support-1',
    specific2Name: 'Optimización de Procesos',
    specific2Id: 'area-support-2',
    specific3Name: 'Infraestructura Crítica',
    specific3Id: 'area-support-3',
  },
  {
    directorate: 'Dirección de Talento Humano',
    cluster: 'Soporte Transversal',
    matchDirectorates: ['Dirección de Talento Humano', 'Talento Humano'],
    specific1Name: 'Orientación al Servicio',
    specific1Id: 'area-support-1',
    specific2Name: 'Optimización de Procesos',
    specific2Id: 'area-support-2',
    specific3Name: 'Infraestructura Crítica',
    specific3Id: 'area-support-3',
  },
  {
    directorate: 'Dirección de Control Interno',
    cluster: 'Blindaje y Control',
    matchDirectorates: ['Dirección de Control Interno', 'Control Interno'],
    specific1Name: 'Prevención de Pérdidas',
    specific1Id: 'area-control-1',
    specific2Name: 'Control Presupuestario',
    specific2Id: 'area-control-2',
    specific3Name: 'Gestión de Riesgos',
    specific3Id: 'area-control-3',
  },
  {
    directorate: 'Dirección de Administración y Finanzas',
    cluster: 'Blindaje y Control',
    matchDirectorates: ['Dirección de Administración y Finanzas', 'Administración y Finanzas'],
    specific1Name: 'Prevención de Pérdidas',
    specific1Id: 'area-control-1',
    specific2Name: 'Control Presupuestario',
    specific2Id: 'area-control-2',
    specific3Name: 'Gestión de Riesgos',
    specific3Id: 'area-control-3',
  },
  {
    directorate: 'Dirección de Compras',
    cluster: 'Blindaje y Control',
    matchDirectorates: ['Dirección de Compras', 'Compras'],
    specific1Name: 'Prevención de Pérdidas',
    specific1Id: 'area-control-1',
    specific2Name: 'Control Presupuestario',
    specific2Id: 'area-control-2',
    specific3Name: 'Gestión de Riesgos',
    specific3Id: 'area-control-3',
  }
];

export function OrganizationalDashboard({
  onSelectCollaborator,
  onNavigateToPromotionsDashboard,
  liveState,
  initialMode,
  initialSection,
  onModeChange,
  onSectionChange
}: OrganizationalDashboardProps) {
  const [currentSection, setCurrentSection] = useState<OrgDashboardSectionKey>(() => {
    if (initialSection === 'promedios_cargo') return 'promedios_cargo';
    if (initialSection === 'ranking') return 'ranking';
    if (initialSection === 'nivel_academico') return 'nivel_academico';
    if (initialSection === 'analitica' || initialSection === 'kpis' || initialSection === 'charts' || initialSection === 'heatmap') return 'analitica';
    return 'general';
  });

  const [dashboardMode, setDashboardMode] = useState<'executive_integrated' | 'operational_sections'>(
    initialMode || 'executive_integrated'
  );
  const [selectedDirectorateFilter, setSelectedDirectorateFilter] = useState<string>('all');
  const [activeOperationalTab, setActiveOperationalTab] = useState<'analitica' | 'ranking'>(
    initialSection === 'ranking' ? 'ranking' : 'analitica'
  );
  const [highlightedSubSection, setHighlightedSubSection] = useState<'kpis' | 'charts' | 'heatmap' | null>(
    (initialSection === 'kpis' || initialSection === 'charts' || initialSection === 'heatmap') ? initialSection : null
  );
  const [storageTick, setStorageTick] = useState(0);

  // Sincronizar sección inicial cuando cambie desde el menú desplegable
  useEffect(() => {
    if (initialSection) {
      if (initialSection === 'promedios_cargo') {
        setCurrentSection('promedios_cargo');
      } else if (initialSection === 'ranking') {
        setCurrentSection('ranking');
        setActiveOperationalTab('ranking');
      } else if (initialSection === 'nivel_academico') {
        setCurrentSection('nivel_academico');
      } else if (initialSection === 'general') {
        setCurrentSection('general');
      } else {
        setCurrentSection('analitica');
        setActiveOperationalTab('analitica');
      }
    }
  }, [initialSection]);

  const handleSectionSelect = (sec: OrgDashboardSectionKey) => {
    setCurrentSection(sec);
    if (sec === 'analitica') setActiveOperationalTab('analitica');
    if (sec === 'ranking') setActiveOperationalTab('ranking');
    onSectionChange?.(sec);
  };

  const handleModeChange = (newMode: 'executive_integrated' | 'operational_sections') => {
    setDashboardMode(newMode);
    onModeChange?.(newMode);
  };

  const handleTabChange = (tab: 'analitica' | 'ranking') => {
    setActiveOperationalTab(tab);
    setHighlightedSubSection(null);
    onSectionChange?.(tab);
  };

  const handleSubSectionJump = (sec: 'kpis' | 'charts' | 'heatmap') => {
    setActiveOperationalTab('analitica');
    setHighlightedSubSection(sec);
    onSectionChange?.(sec);
    setTimeout(() => {
      const el = document.getElementById(`sec-${sec}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // Escuchar cambios de localStorage en tiempo real para reflejar respuestas de cualquier evaluador
  useEffect(() => {
    const unsub = subscribeToStorage(() => {
      setStorageTick(prev => prev + 1);
    });
    return unsub;
  }, []);

  // Cómputo 100% dinámico y reactivo sobre cada colaborador de la empresa
  const processedCollaborators = useMemo(() => {
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

      const positionsWithSubordinates = ['Coordinador', 'Supervisor', 'Gerente', 'Director'];
      const hasSubordinates = positionsWithSubordinates.includes(collab.info.position);

      const m = calculateConsolidatedMetrics(
        selfEval,
        supervisorEval,
        peerEval,
        subordinateEval,
        hasSubordinates
      );

      return {
        ...collab,
        selfEval,
        supervisorEval,
        peerEval,
        subordinateEval,
        metrics: m
      };
    });
  }, [liveState, storageTick]);

  // Filtro por Dirección
  const filteredList = selectedDirectorateFilter === 'all'
    ? processedCollaborators
    : processedCollaborators.filter(c => c.info.directorate === selectedDirectorateFilter);

  const cargoCompatibleList = useMemo(() => {
    return filteredList.map(c => ({
      ID_Empleado: c.info.idNumber || c.info.id,
      Nombre: `${c.info.firstName} ${c.info.lastName}`,
      Position: c.info.position,
      Area: c.info.directorate,
      Department: c.info.department,
      Puntaje_Objetivos: c.metrics.isEvaluated ? c.metrics.block1Score * 20 : 0,
      Puntaje_Competencias: c.metrics.isEvaluated ? c.metrics.block2Score : 0,
      Rating_Final: c.metrics.isEvaluated ? c.metrics.finalScore : 0,
      isEvaluated: c.metrics.isEvaluated,
      collabId: c.info.id
    }));
  }, [filteredList]);

  // Métricas reales y fidedignas de la población
  const totalEmployees = processedCollaborators.length;
  const evaluatedCollaborators = useMemo(() => {
    return processedCollaborators.filter(c => c.metrics.isEvaluated);
  }, [processedCollaborators]);

  const evaluatedCount = evaluatedCollaborators.length;
  const pendingCount = totalEmployees - evaluatedCount;
  const evaluatedPercent = totalEmployees > 0 ? Number(((evaluatedCount / totalEmployees) * 100).toFixed(1)) : 0;

  // Promedio Nacional (calculado EXCLUSIVAMENTE sobre colaboradores evaluados, sin inventar data)
  const avgOverallScore = evaluatedCount > 0
    ? Number((evaluatedCollaborators.reduce((acc, c) => acc + c.metrics.finalScore, 0) / evaluatedCount).toFixed(2))
    : 0;
  const avgBase100 = Number(((avgOverallScore / 5) * 100).toFixed(1));

  // Tramos reales observados
  const outstandingCount = evaluatedCollaborators.filter(c => c.metrics.meritTier.id === 5).length;
  const highPerfCount = evaluatedCollaborators.filter(c => c.metrics.meritTier.id === 4).length;
  const optimalCount = evaluatedCollaborators.filter(c => c.metrics.meritTier.id === 3).length;
  const averageCount = evaluatedCollaborators.filter(c => c.metrics.meritTier.id === 2).length;
  const incompleteCount = evaluatedCollaborators.filter(c => c.metrics.meritTier.id === 1).length;

  // 1. DATA PARA GRÁFICO DE DONA (Tramos de Mérito Real)
  const donutData = evaluatedCount === 0
    ? [
        { name: 'Sin evaluaciones recibidas (100% Pendiente)', shortName: 'Pendiente de Evaluación', value: totalEmployees, color: '#E4E4E7' }
      ]
    : [
        { name: 'Tramo 5: Desempeño Excepcional (110% - 120%)', shortName: 'T5 Excepcional', value: outstandingCount, color: '#10B981' },
        { name: 'Tramo 4: Desempeño Sobresaliente (101% - 110%)', shortName: 'T4 Sobresaliente', value: highPerfCount, color: '#3B82F6' },
        { name: 'Tramo 3: Desempeño Esperado (80% - 100%)', shortName: 'T3 Esperado', value: optimalCount, color: '#F1B400' },
        { name: 'Tramo 2: En Desarrollo / Por Debajo de lo Esperado (55% - 79%)', shortName: 'T2 En Desarrollo', value: averageCount, color: '#F59E0B' },
        { name: 'Tramo 1: Desempeño Insatisfactorio (< 54%)', shortName: 'T1 Insatisfactorio', value: incompleteCount, color: '#EF4444' },
        ...(pendingCount > 0 ? [{ name: 'Pendientes por Evaluar', shortName: 'Pendientes', value: pendingCount, color: '#D4D4D8' }] : [])
      ].filter(d => d.value > 0);

  // 2. DATA PARA GRÁFICO DE TORTA (Nine-Box Real según Desempeño vs Potencial)
  const pieData = useMemo(() => {
    if (evaluatedCount === 0) {
      return [
        { name: 'Sin evaluaciones registradas (Pendiente de Calibración 9-Box)', value: totalEmployees, color: '#E4E4E7' }
      ];
    }

    const counts: Record<string, number> = {
      'Futura Estrella (Top Talent)': 0,
      'Alto Potencial (Proyección)': 0,
      'Talento Clave (Especialista)': 0,
      'Profesional Efectivo (Operativo)': 0,
      'En Desarrollo / Dilema': 0
    };

    evaluatedCollaborators.forEach(c => {
      const perf = c.metrics.block1Score || c.metrics.finalScore;
      const pot = c.metrics.radarScores.leadership || c.metrics.block2Score || c.metrics.finalScore;
      if (perf >= 4.25 && pot >= 4.25) {
        counts['Futura Estrella (Top Talent)'] += 1;
      } else if (perf < 4.25 && pot >= 4.25) {
        counts['Alto Potencial (Proyección)'] += 1;
      } else if (perf >= 4.25 && pot < 4.25) {
        counts['Talento Clave (Especialista)'] += 1;
      } else if (perf >= 3.00 && pot >= 3.00) {
        counts['Profesional Efectivo (Operativo)'] += 1;
      } else {
        counts['En Desarrollo / Dilema'] += 1;
      }
    });

    const colors: Record<string, string> = {
      'Futura Estrella (Top Talent)': '#10B981',
      'Alto Potencial (Proyección)': '#3B82F6',
      'Talento Clave (Especialista)': '#F1B400',
      'Profesional Efectivo (Operativo)': '#6366F1',
      'En Desarrollo / Dilema': '#F59E0B'
    };

    const slices = Object.entries(counts)
      .filter(([, val]) => val > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: colors[name] || '#71717A'
      }));

    if (pendingCount > 0) {
      slices.push({
        name: 'Pendientes por Evaluar',
        value: pendingCount,
        color: '#D4D4D8'
      });
    }

    return slices.length > 0 ? slices : [
      { name: 'Sin evaluaciones registradas', value: totalEmployees, color: '#E4E4E7' }
    ];
  }, [evaluatedCollaborators, evaluatedCount, totalEmployees, pendingCount]);

  // 3. DATA PARA GRÁFICO DE BARRAS (Desempeño Promedio por Dirección)
  const barData = useMemo(() => {
    const directorateMap: Record<string, { totalScore: number; count: number; evaluatedCount: number; name: string }> = {};

    processedCollaborators.forEach(c => {
      const dir = c.info.directorate || 'Otras Direcciones';
      if (!directorateMap[dir]) {
        directorateMap[dir] = { totalScore: 0, count: 0, evaluatedCount: 0, name: dir.replace('Dirección de ', '') };
      }
      directorateMap[dir].count += 1;
      if (c.metrics.isEvaluated) {
        directorateMap[dir].totalScore += c.metrics.finalScore;
        directorateMap[dir].evaluatedCount += 1;
      }
    });

    return Object.keys(directorateMap).map(dir => {
      const d = directorateMap[dir];
      return {
        name: d.name,
        fullName: dir,
        score: d.evaluatedCount > 0 ? Number((d.totalScore / d.evaluatedCount).toFixed(2)) : 0,
        evaluatedCount: d.evaluatedCount,
        collabs: d.count
      };
    });
  }, [processedCollaborators]);

  // Helper para promediar competencias dinámicamente
  const getCompetencyAverageAcrossCollabs = (collabs: typeof processedCollaborators, compPattern: string): number | null => {
    const scores: number[] = [];
    collabs.forEach(c => {
      if (!c.metrics.isEvaluated) return;
      const sources = [c.supervisorEval, c.selfEval, c.peerEval, c.subordinateEval];
      sources.forEach(src => {
        if (src && src.scores) {
          Object.entries(src.scores).forEach(([k, val]) => {
            if (typeof val === 'number' && val > 0) {
              if (k.toLowerCase() === compPattern.toLowerCase() || k.toLowerCase().includes(compPattern.toLowerCase())) {
                scores.push(val);
              }
            }
          });
        }
      });
      // Fallback si no hay reactivo individual aislado pero sí bloque 2
      if (scores.length === 0 && c.metrics.block2Score > 0) {
        if (compPattern.startsWith('card')) {
          scores.push(c.metrics.radarScores.cardinal || c.metrics.block2Score);
        } else if (compPattern.startsWith('sup')) {
          if (c.metrics.radarScores.leadership > 0) scores.push(c.metrics.radarScores.leadership);
        } else {
          scores.push(c.metrics.radarScores.specific || c.metrics.block2Score);
        }
      }
    });

    if (scores.length === 0) return null;
    return Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
  };

  // Cálculo de Competencia Líder y Brecha Prioritaria
  const { topCompetency, lowestCompetency } = useMemo(() => {
    if (evaluatedCount === 0) {
      return { topCompetency: null, lowestCompetency: null };
    }

    const cardinalCompKeys = [
      { key: 'card-1', name: 'Orientación al Cliente' },
      { key: 'card-2', name: 'Innovación y Mejora' },
      { key: 'card-3', name: 'Pensamiento Analítico' },
      { key: 'card-4', name: 'Trabajo en Equipo' },
      { key: 'card-5', name: 'Adaptabilidad y Resiliencia' },
    ];

    const compScores = cardinalCompKeys.map(item => ({
      name: item.name,
      score: getCompetencyAverageAcrossCollabs(evaluatedCollaborators, item.key)
    })).filter(item => item.score !== null) as { name: string; score: number }[];

    if (compScores.length === 0) return { topCompetency: null, lowestCompetency: null };

    compScores.sort((a, b) => b.score - a.score);
    return {
      topCompetency: compScores[0],
      lowestCompetency: compScores[compScores.length - 1]
    };
  }, [evaluatedCollaborators, evaluatedCount]);

  // 4. DATA PARA EL MAPA DE CALOR MACRO (100% DINÁMICO)
  const macroHeatmapRows = useMemo(() => {
    return MACRO_DIRECTORATES.map(dirConfig => {
      const matchNames = dirConfig.matchDirectorates || [dirConfig.directorate];
      const collabsInDir = processedCollaborators.filter(c => 
        matchNames.some(m => (c.info.directorate || '').toLowerCase().includes(m.toLowerCase()))
      );
      const evaluatedInDir = collabsInDir.filter(c => c.metrics.isEvaluated);
      const hasData = evaluatedInDir.length > 0;

      const cardinalClient = hasData ? getCompetencyAverageAcrossCollabs(evaluatedInDir, 'card-1') : null;
      const cardinalInnovation = hasData ? getCompetencyAverageAcrossCollabs(evaluatedInDir, 'card-2') : null;
      const cardinalAnalysis = hasData ? getCompetencyAverageAcrossCollabs(evaluatedInDir, 'card-3') : null;
      const cardinalTeamwork = hasData ? getCompetencyAverageAcrossCollabs(evaluatedInDir, 'card-4') : null;
      const cardinalAdaptability = hasData ? getCompetencyAverageAcrossCollabs(evaluatedInDir, 'card-5') : null;
      const supervisionLead = hasData ? getCompetencyAverageAcrossCollabs(evaluatedInDir, 'sup') : null;

      const specific1Val = hasData ? getCompetencyAverageAcrossCollabs(evaluatedInDir, dirConfig.specific1Id) : null;
      const specific2Val = hasData ? getCompetencyAverageAcrossCollabs(evaluatedInDir, dirConfig.specific2Id) : null;
      const specific3Val = hasData ? getCompetencyAverageAcrossCollabs(evaluatedInDir, dirConfig.specific3Id) : null;

      const availableVals = [
        cardinalClient, cardinalInnovation, cardinalAnalysis, cardinalTeamwork, cardinalAdaptability,
        supervisionLead, specific1Val, specific2Val, specific3Val
      ].filter((v): v is number => typeof v === 'number');

      const rowAvg = availableVals.length > 0
        ? Number((availableVals.reduce((a, b) => a + b, 0) / availableVals.length).toFixed(2))
        : null;

      return {
        directorate: dirConfig.directorate,
        cluster: dirConfig.cluster,
        totalCollabs: collabsInDir.length,
        evaluatedCollabs: evaluatedInDir.length,
        hasData,
        cardinalClient,
        cardinalInnovation,
        cardinalAnalysis,
        cardinalTeamwork,
        cardinalAdaptability,
        supervisionLead,
        specific1Name: dirConfig.specific1Name,
        specific1Val,
        specific2Name: dirConfig.specific2Name,
        specific2Val,
        specific3Name: dirConfig.specific3Name,
        specific3Val,
        rowAvg
      };
    });
  }, [processedCollaborators]);

  // Color de calor oficial Canguro: neutro si no hay data
  const getHeatColor = (val: number | null) => {
    if (val === null || val === undefined || val <= 0) {
      return 'bg-zinc-50 text-zinc-400 font-normal border border-zinc-200';
    }
    if (val >= 4.75) return 'bg-emerald-500/20 text-emerald-950 font-black border border-emerald-300';
    if (val >= 4.25) return 'bg-blue-500/20 text-blue-950 font-bold border border-blue-300';
    if (val >= 3.80) return 'bg-[#F1B400]/30 text-amber-950 font-bold border border-amber-400';
    if (val >= 3.40) return 'bg-amber-100 text-amber-900 border border-amber-300';
    return 'bg-red-500/20 text-red-950 font-black border border-red-400';
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* ── RENDER EXCLUSIVO DE LA SECCIÓN SELECCIONADA (SIN SCROLL UNIFICADO) ── */}
      {currentSection === 'general' && (
        <ExecutiveTalentDashboard
          liveState={liveState}
          onSelectCollaborator={onSelectCollaborator}
          viewSection="general"
        />
      )}

      {currentSection === 'promedios_cargo' && (
        <ExecutiveTalentDashboard
          liveState={liveState}
          onSelectCollaborator={onSelectCollaborator}
          viewSection="promedios_cargo"
        />
      )}

      {currentSection === 'nivel_academico' && (
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
      )}

      {/* ── SECCIÓN 1: INDICADORES CLAVE KPI´S, GRÁFICOS Y MAPA DE CALOR ── */}
      {currentSection === 'analitica' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Sub-bloque 1: KPIs */}
              <div id="sec-kpis" className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-[#D99C00]" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950 font-sans">
                      Sección 1: Indicadores Clave y Métricas Macro del Ciclo
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Datos consolidados en tiempo real
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Población Auditada */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Población Auditada</span>
            <Users size={16} className="text-[#D99C00]" />
          </div>
          <div className="text-2xl font-mono font-black text-zinc-950">
            {evaluatedCount} <span className="text-xs font-normal text-zinc-500">/ {totalEmployees} Colab.</span>
          </div>
          <div className={`mt-2 text-[10px] font-semibold flex items-center gap-1 ${
            evaluatedCount > 0 ? 'text-emerald-700' : 'text-zinc-500'
          }`}>
            {evaluatedCount > 0 ? (
              <><CheckCircle2 size={11} /> {evaluatedPercent}% completado ({pendingCount} pendientes)</>
            ) : (
              <><Clock size={11} /> 0% completado (esperando respuestas)</>
            )}
          </div>
        </div>

        {/* Card 2: Talento Sobresaliente */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Talento Sobresaliente</span>
            <Award size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-black text-emerald-950">
            {outstandingCount} <span className="text-xs font-normal text-zinc-500">
              {evaluatedCount > 0 ? `(${((outstandingCount / evaluatedCount) * 100).toFixed(0)}% evaluados)` : '(0%)'}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-zinc-600">
            {evaluatedCount > 0 ? 'Tramo 5: Habilitados a Sucesión' : 'Pendiente de resultados'}
          </div>
        </div>

        {/* Card 3: Competencia Líder */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Competencia Líder</span>
            <TrendingUp size={16} className="text-blue-600" />
          </div>
          <div className="text-lg font-bold text-zinc-950 truncate">
            {topCompetency ? topCompetency.name : 'Pendiente de Evaluación'}
          </div>
          <div className="mt-2 text-[10px] font-mono text-zinc-600">
            {topCompetency ? (
              <>Puntaje promedio: <strong className="text-blue-900">{topCompetency.score.toFixed(2)} pts</strong></>
            ) : (
              'Sin respuestas registradas aún'
            )}
          </div>
        </div>

        {/* Card 4: Brecha Prioritaria PDI */}
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Brecha Prioritaria PDI</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <div className="text-lg font-bold text-zinc-950 truncate">
            {lowestCompetency ? lowestCompetency.name : 'Pendiente de Evaluación'}
          </div>
          <div className="mt-2 text-[10px] font-mono text-zinc-600">
            {lowestCompetency ? (
              <>Puntaje promedio: <strong className="text-amber-800">{lowestCompetency.score.toFixed(2)} pts</strong> (Foco PDI)</>
            ) : (
              'Sin brechas detectadas aún'
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Promedio de Evaluación del Desempeño por Cargo (Estructura Organizacional) */}
      <div id="sec-cargos" className="scroll-mt-20">
        <CargoPerformanceBreakdown
          collaborators={cargoCompatibleList}
          selectedDirectorate={selectedDirectorateFilter}
          onSelectCollaborator={onSelectCollaborator}
        />
      </div>

      {/* Sub-bloque 2: Gráficos y 9-Box */}
      <div id="sec-charts" className={`space-y-4 scroll-mt-20 transition-all rounded-2xl ${
        highlightedSubSection === 'charts' ? 'ring-2 ring-[#F1B400] p-2 bg-amber-50/20' : ''
      }`}>
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-[#D99C00]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950 font-sans">
              Sección 2: Distribución Salarial por Tramos y Matriz Nine-Box
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            Calibración analítica de la organización
          </span>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* DONUT CHART: Tramos de Desempeño */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950 font-sans">
                Distribución por Tramos de Mérito
              </h4>
              <span className="text-[10px] font-mono text-zinc-400">Guía Salarial</span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-2">
              {evaluatedCount > 0 
                ? 'Proporción real según percentiles de mérito salarial de El Canguro.'
                : 'El ciclo se encuentra en inicio. Se actualizará en vivo al enviar evaluaciones.'}
            </p>

            <div className="w-full h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={donutData.length > 1 ? 4 : 0}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`donut-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} colaborador(es)`, name]}
                    contentStyle={{ backgroundColor: '#09090B', borderRadius: '8px', borderColor: '#F1B400', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-mono font-black text-zinc-950">{evaluatedCount} / {totalEmployees}</span>
                <span className="text-[9px] uppercase font-mono text-zinc-400">Evaluados</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-zinc-100">
            {donutData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-zinc-700 truncate max-w-[170px]">{d.shortName}</span>
                </div>
                <span className="font-mono font-bold text-zinc-900">
                  {d.value} ({((d.value / totalEmployees) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PIE CHART: Cuadrantes Nine-Box */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950 font-sans">
                Segmentación Nine-Box (Gráfico de Torta)
              </h4>
              <span className="text-[10px] font-mono text-zinc-400">Potencial</span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-2">
              {evaluatedCount > 0
                ? 'Clasificación de talento según la intersección de Desempeño vs Potencial Futuro.'
                : 'Pendiente de respuestas para posicionar colaboradores en los 9 cuadrantes.'}
            </p>

            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`pie-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} colaborador(es)`, name]}
                    contentStyle={{ backgroundColor: '#09090B', borderRadius: '8px', borderColor: '#F1B400', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-zinc-100">
            {pieData.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                  <span className="text-zinc-700 truncate max-w-[170px]">{p.name}</span>
                </div>
                <span className="font-mono font-bold text-zinc-900">
                  {p.value} ({((p.value / totalEmployees) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BAR CHART: Desempeño por Dirección */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950 font-sans">
                Desempeño Promedio por Dirección
              </h4>
              <span className="text-[10px] font-mono text-zinc-400">Escala 1-5</span>
            </div>
            <p className="text-[11px] text-zinc-500 mb-2">
              Calificación consolidada por gerencias y unidades operativas de El Canguro.
            </p>

            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F4F4F5" />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 9, fill: '#71717A' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#27272A', fontWeight: 600 }} width={85} />
                  <Tooltip
                    formatter={(value: any, _name: any, item: any) => [
                      `${value > 0 ? value + ' pts' : 'Sin datos'} (${item.payload.evaluatedCount}/${item.payload.collabs} evaluados)`,
                      'Promedio Real'
                    ]}
                    contentStyle={{ backgroundColor: '#09090B', borderRadius: '6px', borderColor: '#F1B400', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="score" fill="#F1B400" radius={[0, 4, 4, 0]} barSize={14}>
                    {barData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.score >= 4.75 ? '#10B981' :
                          entry.score >= 4.25 ? '#3B82F6' :
                          entry.score >= 3.75 ? '#F1B400' :
                          entry.score > 0 ? '#F59E0B' : '#E4E4E7'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>Meta Corporativa: ≥ 3.75 pts</span>
            <span className={evaluatedCount > 0 ? 'text-zinc-700 font-bold' : 'text-zinc-400'}>
              {barData.filter(b => b.score >= 3.75).length} de {barData.length} direcciones sobre la meta
            </span>
          </div>
        </div>
      </div>
    </div>

      {/* Sub-bloque 3: Mapa de Calor */}
      <div id="sec-heatmap" className={`space-y-4 scroll-mt-20 transition-all rounded-2xl ${
        highlightedSubSection === 'heatmap' ? 'ring-2 ring-[#F1B400] p-2 bg-amber-50/20' : ''
      }`}>
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-[#D99C00]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                    Sección 3: Mapa de Calor Organizacional (Heatmap Macro por Dirección)
                  </h3>
                </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Matriz integral de competencias conductuales y técnicas en cada dirección corporativa (calculada en tiempo real).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded border border-emerald-300 bg-emerald-500/20 text-emerald-950 font-bold">
              ≥ 4.75 Sobresaliente
            </span>
            <span className="px-2 py-0.5 rounded border border-blue-300 bg-blue-500/20 text-blue-950 font-bold">
              4.25-4.74 Alto
            </span>
            <span className="px-2 py-0.5 rounded border border-amber-400 bg-[#F1B400]/30 text-amber-950 font-bold">
              3.80-4.24 Óptimo
            </span>
            <span className="px-2 py-0.5 rounded border border-amber-300 bg-amber-100 text-amber-900 font-bold">
              3.40-3.79 Promedio
            </span>
            <span className="px-2 py-0.5 rounded border border-red-400 bg-red-500/20 text-red-950 font-bold">
              &lt; 3.40 Alerta
            </span>
            <span className="px-2 py-0.5 rounded border border-zinc-300 bg-zinc-100 text-zinc-600 font-bold">
              — Pendiente
            </span>
          </div>
        </div>

        {/* Mensaje de aviso de ciclo si no hay data */}
        {evaluatedCount === 0 && (
          <div className="p-3 bg-amber-50/70 border-b border-amber-200 text-[11px] text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5">
            <span className="flex items-center gap-2 font-medium">
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
              <span>
                <strong>Ciclo en Fase de Inicio:</strong> Las direcciones y competencias muestran guión (—) porque ningún evaluador ha completado los cuestionarios aún. Los colores y puntajes se calcularán automáticamente al recibir cada evaluación.
              </span>
            </span>
            <span className="font-mono text-[10px] uppercase font-bold text-amber-900 shrink-0">
              0 / {totalEmployees} Respuestas
            </span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-950 text-white text-[10px] font-mono uppercase tracking-wider">
                <th className="py-3 px-3 border-r border-zinc-800 font-bold w-[22%]">Dirección & Cluster (DTH-GFD-MC-01)</th>
                <th className="py-3 px-2 border-r border-zinc-800 font-bold text-center">Cliente (Card)</th>
                <th className="py-3 px-2 border-r border-zinc-800 font-bold text-center">Innovación (Card)</th>
                <th className="py-3 px-2 border-r border-zinc-800 font-bold text-center">Análisis (Card)</th>
                <th className="py-3 px-2 border-r border-zinc-800 font-bold text-center">Equipo (Card)</th>
                <th className="py-3 px-2 border-r border-zinc-800 font-bold text-center">Adapt. (Card)</th>
                <th className="py-3 px-2 border-r border-zinc-800 font-bold text-center text-purple-400">Supervisión</th>
                <th className="py-3 px-3 border-r border-zinc-800 font-bold text-center text-blue-400">Competencias Específicas por Área</th>
                <th className="py-3 px-3 font-bold text-center bg-[#F1B400] text-zinc-950 font-black">Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-sans">
              {macroHeatmapRows.map((row, idx) => {
                return (
                  <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-3 border-r border-zinc-200 font-bold text-zinc-950">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-zinc-400 shrink-0" />
                        <span className="truncate">{row.directorate}</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono pl-4 mt-0.5">
                        <span className="text-zinc-500">
                          Cluster: <strong className="text-zinc-700">{row.cluster}</strong>
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          row.hasData ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {row.evaluatedCollabs} / {row.totalCollabs} evaluados
                        </span>
                      </div>
                    </td>

                    {/* 5 Cardinales */}
                    <td className={`py-3 px-2 border-r border-zinc-200 text-center ${getHeatColor(row.cardinalClient)}`}>
                      <span className="font-mono text-xs">{row.cardinalClient !== null ? row.cardinalClient.toFixed(2) : '—'}</span>
                    </td>
                    <td className={`py-3 px-2 border-r border-zinc-200 text-center ${getHeatColor(row.cardinalInnovation)}`}>
                      <span className="font-mono text-xs">{row.cardinalInnovation !== null ? row.cardinalInnovation.toFixed(2) : '—'}</span>
                    </td>
                    <td className={`py-3 px-2 border-r border-zinc-200 text-center ${getHeatColor(row.cardinalAnalysis)}`}>
                      <span className="font-mono text-xs">{row.cardinalAnalysis !== null ? row.cardinalAnalysis.toFixed(2) : '—'}</span>
                    </td>
                    <td className={`py-3 px-2 border-r border-zinc-200 text-center ${getHeatColor(row.cardinalTeamwork)}`}>
                      <span className="font-mono text-xs">{row.cardinalTeamwork !== null ? row.cardinalTeamwork.toFixed(2) : '—'}</span>
                    </td>
                    <td className={`py-3 px-2 border-r border-zinc-200 text-center ${getHeatColor(row.cardinalAdaptability)}`}>
                      <span className="font-mono text-xs">{row.cardinalAdaptability !== null ? row.cardinalAdaptability.toFixed(2) : '—'}</span>
                    </td>

                    {/* Supervisión (Mando) */}
                    <td className={`py-3 px-2 border-r border-zinc-200 text-center ${getHeatColor(row.supervisionLead)}`}>
                      <span className="font-mono text-xs">{row.supervisionLead !== null ? row.supervisionLead.toFixed(2) : '—'}</span>
                    </td>

                    {/* 3 Específicas por Área con badges */}
                    <td className="py-2.5 px-3 border-r border-zinc-200 text-center bg-zinc-50/60">
                      <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                        <div className={`p-1 rounded ${getHeatColor(row.specific1Val)}`}>
                          <span className="block text-[8px] text-zinc-600 truncate">{row.specific1Name}</span>
                          <span className="font-bold">{row.specific1Val !== null ? row.specific1Val.toFixed(2) : '—'}</span>
                        </div>
                        <div className={`p-1 rounded ${getHeatColor(row.specific2Val)}`}>
                          <span className="block text-[8px] text-zinc-600 truncate">{row.specific2Name}</span>
                          <span className="font-bold">{row.specific2Val !== null ? row.specific2Val.toFixed(2) : '—'}</span>
                        </div>
                        <div className={`p-1 rounded ${getHeatColor(row.specific3Val)}`}>
                          <span className="block text-[8px] text-zinc-600 truncate">{row.specific3Name}</span>
                          <span className="font-bold">{row.specific3Val !== null ? row.specific3Val.toFixed(2) : '—'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Consolidated Row Average */}
                    <td className={`py-3 px-3 text-center ${getHeatColor(row.rowAvg)}`}>
                      <span className="font-mono font-black text-sm">
                        {row.rowAvg !== null ? row.rowAvg.toFixed(2) : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
    )}

      {/* ── SECCIÓN 2: NÓMINA & RANKING DE COLABORADORES ── */}
      {currentSection === 'ranking' && (
        <div id="sec-ranking" className="space-y-4 animate-in fade-in duration-200 scroll-mt-20">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#D99C00]" />
                  <h4 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                    Sección 2: Plantilla Auditada y Desglose por Colaborador
                  </h4>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Haz clic en cualquier colaborador para abrir su expediente individual detallado en 360°.
                </p>
              </div>

          {/* Filter by Directorate */}
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-zinc-400" />
            <select
              value={selectedDirectorateFilter}
              onChange={(e) => setSelectedDirectorateFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-semibold px-2.5 py-1 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
            >
              <option value="all">Todas las Direcciones ({processedCollaborators.length})</option>
              {Array.from(new Set(processedCollaborators.map(c => c.info.directorate))).map((dir, i) => (
                <option key={i} value={dir}>{dir}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 text-zinc-600 font-mono text-[10px] uppercase tracking-wider border-b border-zinc-200">
                <th className="py-2.5 px-3 font-bold">Colaborador</th>
                <th className="py-2.5 px-3 font-bold">Cargo y Dirección</th>
                <th className="py-2.5 px-3 font-bold text-center">B1: Metas (60%)</th>
                <th className="py-2.5 px-3 font-bold text-center">B2: Competencias (30%)</th>
                <th className="py-2.5 px-3 font-bold text-center">B3: Potencial (10%)</th>
                <th className="py-2.5 px-3 font-bold text-center">Score Final</th>
                <th className="py-2.5 px-3 font-bold text-center">Tramo de Mérito</th>
                <th className="py-2.5 px-3 font-bold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredList.map((collab) => {
                const isEval = collab.metrics.isEvaluated;
                const tier = collab.metrics.meritTier;
                return (
                  <tr key={collab.info.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-zinc-950">
                      <div>
                        {collab.info.firstName} {collab.info.lastName}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 font-normal">{collab.info.idNumber}</span>
                    </td>

                    <td className="py-3 px-3 text-zinc-700">
                      <div className="font-semibold">{collab.info.position}</div>
                      <span className="text-[10px] text-zinc-500">{collab.info.directorate}</span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-900">
                      {isEval ? `${collab.metrics.block1Score.toFixed(2)} pts` : (
                        <span className="text-zinc-400 text-[11px] font-sans font-normal">Pendiente</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-blue-900">
                      {isEval ? `${collab.metrics.block2Score.toFixed(2)} pts` : (
                        <span className="text-zinc-400 text-[11px] font-sans font-normal">Pendiente</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-purple-900">
                      {isEval ? (
                        <div>
                          <span>{collab.metrics.potentialScore.toFixed(2)} pts</span>
                          <span className={`block text-[9px] font-mono font-bold uppercase ${
                            collab.metrics.potentialLevel === 'Alto' ? 'text-emerald-700' :
                            collab.metrics.potentialLevel === 'Medio' ? 'text-blue-700' : 'text-amber-700'
                          }`}>
                            {collab.metrics.potentialLevel} Potencial
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-[11px] font-sans font-normal">Pendiente</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-black text-zinc-950">
                      {isEval ? (
                        <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                          {collab.metrics.finalScore.toFixed(2)} pts ({collab.metrics.base100Score}%)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-400 text-[11px] font-sans font-normal">
                          Sin Evaluar
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {isEval ? (
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tier.badgeBg} ${tier.badgeText}`}>
                          Tramo {tier.id}: {tier.name}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
                          Pendiente de Evaluación
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectCollaborator(collab.info.id || '')}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-950 text-white font-bold text-[10px] uppercase rounded-lg hover:bg-[#F1B400] hover:text-black transition-colors"
                      >
                        <Eye size={11} /> Ver Expediente
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      )}
    </div>
  );
}

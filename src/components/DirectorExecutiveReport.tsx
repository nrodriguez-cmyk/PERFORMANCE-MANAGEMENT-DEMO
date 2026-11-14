import React, { useState, useMemo, useEffect } from 'react';
import {
  Users, TrendingUp, Award, BarChart3, ShieldCheck, ShieldAlert,
  Lock, Unlock, KeyRound, CheckCircle2, Clock, ChevronDown, ChevronUp,
  FileText, Search, UserCheck, AlertCircle, Building2, Layers
} from 'lucide-react';
import { CANGURO_COLLABORATORS } from '../data/canguroUniverso';
import { AuthenticatedUser } from '../services/authService';
import {
  getDirectorPermissionStatus,
  requestDirectorAccess,
  normalizeDirectorateKey
} from '../services/directorPermissionService';
import { MERIT_TIERS, MeritTier } from '../types';
import { calculateConsolidatedMetrics } from '../utils/realEvaluationMetrics';
import { StandardGaussCurve } from './StandardGaussCurve';

const OFFICIAL_DIRECTORATES = [
  'Dirección de Administración y Finanzas',
  'Dirección de Talento Humano',
  'Dirección de Operaciones',
  'Dirección de Transporte y Logística',
  'Dirección de Control Interno',
  'Dirección Comercial',
  'Dirección de Compras',
  'Dirección de Tecnología de la Información'
];

interface DirectorExecutiveReportProps {
  currentUser: AuthenticatedUser;
  onSelectCollaborator?: (id: string) => void;
  onAddNotification?: (notif: any) => void;
  initialDirectorate?: string;
}

export function DirectorExecutiveReport({
  currentUser,
  onSelectCollaborator,
  onAddNotification,
  initialDirectorate
}: DirectorExecutiveReportProps) {
  // Dirección seleccionada (por defecto la asignada al Director)
  const [selectedDirectorate, setSelectedDirectorate] = useState<string>(() => {
    const raw = initialDirectorate || currentUser.directorate || '';
    if (raw) {
      const normRaw = normalizeDirectorateKey(raw);
      const match = OFFICIAL_DIRECTORATES.find(d => {
        const normD = normalizeDirectorateKey(d);
        return normD.includes(normRaw) || normRaw.includes(normD);
      });
      if (match) return match;
      return raw;
    }
    return 'Dirección de Administración y Finanzas';
  });

  // Estado de permisos para ver resultados individuales
  const [permissionStatus, setPermissionStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>(() =>
    getDirectorPermissionStatus(selectedDirectorate)
  );
  const [requestSending, setRequestSending] = useState(false);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSection, setExpandedSection] = useState<'gauss' | 'cargos' | 'individual'>('gauss');

  // Escuchar cambios reactivos en los permisos (cuando el admin aprueba)
  useEffect(() => {
    const handlePermChange = () => {
      setPermissionStatus(getDirectorPermissionStatus(selectedDirectorate));
    };
    window.addEventListener('canguro_director_permission_change', handlePermChange);
    return () => window.removeEventListener('canguro_director_permission_change', handlePermChange);
  }, [selectedDirectorate]);

  // 1. Filtrar la población adscrita a esta Dirección con emparejamiento exhaustivo
  const directorateCollaborators = useMemo(() => {
    const normTarget = normalizeDirectorateKey(selectedDirectorate);
    const tokens = normTarget.split(/\s+/).filter(t => t.length > 3 && !['PARA', 'DE', 'DEL', 'LOS', 'LAS'].includes(t));

    return CANGURO_COLLABORATORS.filter(c => {
      const cDir = normalizeDirectorateKey(c.info?.directorate || '');
      const cDept = normalizeDirectorateKey(c.info?.department || '');

      if (cDir === normTarget || cDept === normTarget) return true;
      if (cDir.includes(normTarget) || normTarget.includes(cDir)) return true;
      if (cDept.includes(normTarget) || normTarget.includes(cDept)) return true;

      return tokens.some(t => cDir.includes(t) || cDept.includes(t));
    });
  }, [selectedDirectorate]);

  // Total población de la Dirección
  const populationCount = directorateCollaborators.length;

  // 2. Extraer puntuaciones REALES y calcular promedios por sección atados a respuestas reales de evaluación
  const metrics = useMemo(() => {
    let sumFinal = 0;
    let sumGoals = 0;
    let sumCompetencies = 0;
    let sumPotential = 0;
    let sumSelf = 0;
    let sumSup = 0;
    let evaluatedCount = 0;

    const scoresList: number[] = [];

    // Detalle de cada colaborador con sus métricas reales calculadas
    const details = directorateCollaborators.map(c => {
      const posLower = (c.info?.position || '').toLowerCase();
      const hasSub = c.info?.scope === '360' || ['director', 'gerente', 'coordinador', 'supervisor', 'lider', 'líder', 'encargado'].some(r => posLower.includes(r));

      // Cálculo de métricas reales de evaluación
      const evalMetrics = calculateConsolidatedMetrics(
        c.selfEval,
        c.supervisorEval,
        c.peerEval,
        c.subordinateEval,
        hasSub
      );

      const isEvaluated = evalMetrics.isEvaluated;
      const finalScore = isEvaluated ? evalMetrics.finalScore : 0;
      const goalsScore = isEvaluated ? evalMetrics.block1Score : 0;
      const compScore = isEvaluated ? evalMetrics.block2Score : 0;
      const potScore = isEvaluated ? evalMetrics.potentialScore : 0;
      const selfScore = isEvaluated ? evalMetrics.evaluatorAverages.self : 0;
      const supScore = isEvaluated ? evalMetrics.evaluatorAverages.supervisor : 0;

      if (isEvaluated && finalScore > 0) {
        evaluatedCount++;
        sumFinal += finalScore;
        sumGoals += goalsScore;
        sumCompetencies += compScore;
        sumPotential += potScore;
        sumSelf += selfScore;
        sumSup += supScore;
        scoresList.push(finalScore);
      }

      // Tramo de mérito oficial
      const base100 = isEvaluated ? evalMetrics.base100Score : 0;
      let tier: MeritTier = isEvaluated ? evalMetrics.meritTier : MERIT_TIERS[2];
      if (isEvaluated) {
        if (base100 < 55) tier = MERIT_TIERS[0];
        else if (base100 <= 65) tier = MERIT_TIERS[1];
        else if (base100 <= 79) tier = MERIT_TIERS[2];
        else if (base100 <= 100) tier = MERIT_TIERS[3];
        else tier = MERIT_TIERS[4];
      }

      return {
        id: c.info.id,
        idNumber: c.info.idNumber,
        fullName: `${c.info.firstName} ${c.info.lastName}`,
        position: c.info.position,
        department: c.info.department,
        finalScore,
        base100: Math.round(base100),
        goalsScore,
        compScore,
        potScore,
        selfScore,
        supScore,
        isEvaluated,
        tier
      };
    });

    const activeCount = evaluatedCount > 0 ? evaluatedCount : 1;
    const avgScore = evaluatedCount > 0 ? Number((sumFinal / activeCount).toFixed(2)) : 0;
    const avgGoals = evaluatedCount > 0 ? Number((sumGoals / activeCount).toFixed(2)) : 0;
    const avgCompetencies = evaluatedCount > 0 ? Number((sumCompetencies / activeCount).toFixed(2)) : 0;
    const avgPotential = evaluatedCount > 0 ? Number((sumPotential / activeCount).toFixed(2)) : 0;
    const avgSelf = evaluatedCount > 0 ? Number((sumSelf / activeCount).toFixed(2)) : 0;
    const avgSup = evaluatedCount > 0 ? Number((sumSup / activeCount).toFixed(2)) : 0;

    // Desviación estándar (sigma) de las calificaciones reales
    const variance = evaluatedCount > 1
      ? scoresList.reduce((acc, s) => acc + Math.pow(s - avgScore, 2), 0) / evaluatedCount
      : 0;
    const stdDev = evaluatedCount > 1 ? Number(Math.sqrt(variance).toFixed(2)) : 0;

    // Conteo por tramos de Gauss en la Dirección
    const tierCounts = {
      1: details.filter(d => d.isEvaluated && d.tier.id === 1).length,
      2: details.filter(d => d.isEvaluated && d.tier.id === 2).length,
      3: details.filter(d => d.isEvaluated && d.tier.id === 3).length,
      4: details.filter(d => d.isEvaluated && d.tier.id === 4).length,
      5: details.filter(d => d.isEvaluated && d.tier.id === 5).length,
    };

    // ID del tramo de la media
    let avgTierId: 1 | 2 | 3 | 4 | 5 = 3;
    const avgBase100 = (avgScore / 5) * 100;
    if (avgBase100 < 55) avgTierId = 1;
    else if (avgBase100 <= 65) avgTierId = 2;
    else if (avgBase100 <= 79) avgTierId = 3;
    else if (avgBase100 <= 100) avgTierId = 4;
    else avgTierId = 5;

    return {
      details,
      evaluatedCount,
      coveragePct: populationCount > 0 ? Math.round((evaluatedCount / populationCount) * 100) : 0,
      avgScore,
      avgGoals,
      avgCompetencies,
      avgPotential,
      avgSelf,
      avgSup,
      stdDev,
      tierCounts,
      avgTierId
    };
  }, [directorateCollaborators, populationCount]);

  // 3. Desglose por Cargo dentro de la Dirección
  const cargoBreakdown = useMemo(() => {
    const map = new Map<string, { count: number; evalCount: number; totalScore: number }>();
    metrics.details.forEach(d => {
      const pos = d.position || 'Colaborador';
      const existing = map.get(pos) || { count: 0, evalCount: 0, totalScore: 0 };
      existing.count += 1;
      if (d.isEvaluated && d.finalScore > 0) {
        existing.evalCount += 1;
        existing.totalScore += d.finalScore;
      }
      map.set(pos, existing);
    });

    return Array.from(map.entries()).map(([cargo, data]) => ({
      cargo,
      count: data.count,
      evalCount: data.evalCount,
      avg: data.evalCount > 0 ? Number((data.totalScore / data.evalCount).toFixed(2)) : 0,
      pct: Math.round((data.count / (populationCount || 1)) * 100)
    })).sort((a, b) => b.avg - a.avg);
  }, [metrics.details, populationCount]);

  // Manejar solicitud de permisos al Administrador
  const handleRequestAccess = () => {
    setRequestSending(true);
    const res = requestDirectorAccess({
      fullName: currentUser.fullName,
      position: currentUser.position,
      directorate: selectedDirectorate,
      username: currentUser.username
    });
    setPermissionStatus('pending');
    setRequestSuccessMsg(res.message);
    if (onAddNotification && res.notification) {
      onAddNotification(res.notification);
    }
    setRequestSending(false);
  };

  // Filtrado de lista individual
  const filteredDetails = useMemo(() => {
    if (!searchTerm.trim()) return metrics.details;
    const term = searchTerm.toLowerCase();
    return metrics.details.filter(d =>
      d.fullName.toLowerCase().includes(term) ||
      d.idNumber.toLowerCase().includes(term) ||
      d.position.toLowerCase().includes(term) ||
      d.department.toLowerCase().includes(term)
    );
  }, [metrics.details, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. CABECERA INSTITUCIONAL EJECUTIVA */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-[#F1B400]/5 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#F1B400] text-black">
                Informe Ejecutivo de Dirección
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                Población Total: {populationCount} Colaboradores
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                <Building2 className="text-[#F1B400]" size={24} />
                <span>{selectedDirectorate}</span>
              </h1>

              {/* Selector Desplegable de Dirección */}
              <div className="relative inline-block">
                <select
                  value={selectedDirectorate}
                  onChange={(e) => setSelectedDirectorate(e.target.value)}
                  className="appearance-none bg-zinc-900 text-[#F1B400] text-xs font-bold px-3 py-1.5 pr-8 rounded-xl border border-zinc-700 cursor-pointer hover:border-[#F1B400] focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
                  title="Seleccionar Dirección para consultar resultados"
                >
                  {OFFICIAL_DIRECTORATES.map(dir => (
                    <option key={dir} value={dir}>{dir}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="text-[#F1B400] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <p className="text-xs text-zinc-400 font-medium max-w-2xl leading-relaxed">
              Consolidación estadística del desempeño de toda la población adscrita a la dirección. Incluye la Curva de Calibración Normal (Campana de Gauss), desglose de promedios por sección evaluativa y baremos por cargo.
            </p>
          </div>

          <div className="bg-zinc-900/90 border border-[#F1B400]/30 rounded-2xl p-4 shrink-0 flex flex-col items-end text-right min-w-[200px]">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
              Director Titular
            </span>
            <span className="text-sm font-black text-white mt-0.5">
              {currentUser.fullName}
            </span>
            <span className="text-[11px] text-[#F1B400] font-mono font-bold mt-0.5">
              {currentUser.position}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TARJETAS DE INDICADORES CLAVE (KPIS DE LA DIRECCIÓN) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Puntuación Promedio Global */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Promedio Global Dirección</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-950 font-mono">
              {metrics.evaluatedCount > 0 ? metrics.avgScore.toFixed(2) : '0.00'}
            </span>
            <span className="text-xs font-bold text-zinc-400 font-mono">/ 5.00 pts</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Equivalencia Base 100:</span>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {metrics.evaluatedCount > 0 ? `${Math.round((metrics.avgScore / 5) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Cobertura de la Población */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Población & Cobertura</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-950 font-mono">{populationCount}</span>
            <span className="text-xs font-bold text-zinc-400">colaboradores</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Evaluados: {metrics.evaluatedCount}</span>
            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              {metrics.coveragePct}% Cobertura
            </span>
          </div>
        </div>

        {/* Desviación Estándar y Dispersión */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Desviación Estándar (σ)</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-950 font-mono">
              {metrics.evaluatedCount > 1 ? `±${metrics.stdDev}` : '±0.00'}
            </span>
            <span className="text-xs font-bold text-zinc-400 font-mono">pts</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Consistencia:</span>
            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
              {metrics.evaluatedCount > 1 ? (metrics.stdDev <= 0.5 ? 'Alta Homogeneidad' : 'Dispersión Moderada') : 'Sin Dispersión'}
            </span>
          </div>
        </div>

        {/* Nivel de Mérito Predominante */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Nivel de Calibración</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-zinc-950 uppercase truncate">
              {metrics.evaluatedCount > 0 
                ? (metrics.avgScore >= 4.0 ? 'Sobresaliente' : metrics.avgScore >= 3.3 ? 'Esperado' : 'En Desarrollo')
                : 'Pendiente'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Ubicación Gauss:</span>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {metrics.evaluatedCount > 0 ? `Tramo ${metrics.avgTierId}` : 'Sin Calibrar'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. PROMEDIOS DESGLOSADOS POR LAS 3 SECCIONES REALES DE LA EVALUACIÓN */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-100">
          <Layers className="text-[#D99C00]" size={20} />
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-950">
              Puntuaciones Promedio por Sección de la Evaluación
            </h2>
            <p className="text-xs text-zinc-500">
              Rendimiento agregado de la Dirección basado exclusivamente en respuestas reales de los colaboradores participantes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sección 1: Evaluación de Metas - Indicadores - Objetivos (KPIs) - 60% */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-zinc-800">1. Evaluación de Metas - Indicadores - Objetivos</span>
              <span className="font-mono font-black text-zinc-950 text-sm">
                {metrics.evaluatedCount > 0 ? `${metrics.avgGoals.toFixed(2)} / 5.0` : 'Pendiente'}
              </span>
            </div>
            <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.evaluatedCount > 0 ? (metrics.avgGoals / 5) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10.5px] text-zinc-500 pt-0.5">
              <span>Peso Ponderado: <strong className="text-zinc-800">60%</strong></span>
              <span className="font-mono font-bold text-amber-700">
                {metrics.evaluatedCount > 0 ? `${Math.round((metrics.avgGoals / 5) * 100)}%` : '0%'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-snug pt-0.5">
              Medición del cumplimiento de metas operativas, indicadores de gestión y objetivos clave.
            </p>
          </div>

          {/* Sección 2: Evaluación por Competencias - 30% */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-zinc-800">2. Evaluación por Competencias</span>
              <span className="font-mono font-black text-zinc-950 text-sm">
                {metrics.evaluatedCount > 0 ? `${metrics.avgCompetencies.toFixed(2)} / 5.0` : 'Pendiente'}
              </span>
            </div>
            <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.evaluatedCount > 0 ? (metrics.avgCompetencies / 5) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10.5px] text-zinc-500 pt-0.5">
              <span>Peso Ponderado: <strong className="text-zinc-800">30%</strong></span>
              <span className="font-mono font-bold text-blue-700">
                {metrics.evaluatedCount > 0 ? `${Math.round((metrics.avgCompetencies / 5) * 100)}%` : '0%'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-snug pt-0.5">
              Competencias cardinales, transversales y funcionales exigidas para el cargo.
            </p>
          </div>

          {/* Sección 3: Evaluación de Potencial y Liderazgo - 10% */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-zinc-800">3. Evaluación de Potencial y Liderazgo</span>
              <span className="font-mono font-black text-zinc-950 text-sm">
                {metrics.evaluatedCount > 0 ? `${metrics.avgPotential.toFixed(2)} / 5.0` : 'Pendiente'}
              </span>
            </div>
            <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.evaluatedCount > 0 ? (metrics.avgPotential / 5) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10.5px] text-zinc-500 pt-0.5">
              <span>Peso Ponderado: <strong className="text-zinc-800">10%</strong></span>
              <span className="font-mono font-bold text-purple-700">
                {metrics.evaluatedCount > 0 ? `${Math.round((metrics.avgPotential / 5) * 100)}%` : '0%'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-snug pt-0.5">
              Agilidad de aprendizaje, visión estratégica y aptitud de sucesión y mando.
            </p>
          </div>
        </div>

        {/* Alineación Autoevaluación vs Supervisor */}
        <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-3">
          <div className="flex items-center gap-6">
            <span>
              Promedio Autoevaluación: <strong className="text-zinc-950 font-mono">{metrics.evaluatedCount > 0 ? `${metrics.avgSelf.toFixed(2)} / 5.00` : 'Pendiente'}</strong>
            </span>
            <span>
              Promedio Evaluación de Supervisores: <strong className="text-zinc-950 font-mono">{metrics.evaluatedCount > 0 ? `${metrics.avgSup.toFixed(2)} / 5.00` : 'Pendiente'}</strong>
            </span>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full font-mono font-bold text-[11px]">
            Brecha de Calibración: {metrics.evaluatedCount > 0 ? `${Math.abs(Number((metrics.avgSelf - metrics.avgSup).toFixed(2)))} pts` : '0.00 pts'}
          </span>
        </div>
      </div>

      {/* 4. CAMPANA DE GAUSS (DISTRIBUCIÓN NORMAL DE LA DIRECCIÓN) */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-[#F1B400]" size={22} />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-950">
                Campana de Gauss: Distribución de la Dirección
              </h2>
              <p className="text-xs text-zinc-500">
                Población Total: {populationCount} colaboradores adscritos a {selectedDirectorate}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-zinc-900 text-[#F1B400] font-black">
              {metrics.evaluatedCount > 0 
                ? `Media Dirección: ${metrics.avgScore.toFixed(2)} pts (${Math.round((metrics.avgScore / 5) * 100)}%)`
                : 'En Espera de Evaluaciones'}
            </span>
          </div>
        </div>

        {/* Curva de Distribución Normal Institucional Estandarizada */}
        <StandardGaussCurve
          pins={metrics.evaluatedCount > 0 ? [
            {
              score: metrics.avgScore,
              label: 'Media de la Dirección',
              sublabel: `${metrics.avgScore.toFixed(2)} pts (${Math.round((metrics.avgScore / 5) * 100)}%)`,
              color: '#F1B400',
              isPrimary: true
            }
          ] : []}
          tierCounts={metrics.tierCounts}
          totalCount={metrics.evaluatedCount || populationCount}
          highlightedTierId={metrics.evaluatedCount > 0 ? metrics.avgTierId : undefined}
          showCards={true}
        />

        {/* Tabla Comparativa de Distribución de la Dirección */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-100 text-zinc-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Tramo de Gauss</th>
                <th className="p-3">Baremo</th>
                <th className="p-3 text-center">Colaboradores en Dirección</th>
                <th className="p-3 text-center">% Real Dirección</th>
                <th className="p-3 text-center rounded-r-xl">Meta Teórica Gauss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[
                { id: 1, name: 'Tramo 1: Desempeño Insatisfactorio', range: '< 2.70 pts (< 54%)', count: metrics.tierCounts[1], meta: '5%', color: 'text-red-700' },
                { id: 2, name: 'Tramo 2: En Desarrollo', range: '2.75 - 3.25 pts (55% - 65%)', count: metrics.tierCounts[2], meta: '20%', color: 'text-amber-700' },
                { id: 3, name: 'Tramo 3: Desempeño Esperado', range: '3.30 - 3.95 pts (66% - 79%)', count: metrics.tierCounts[3], meta: '50%', color: 'text-emerald-700' },
                { id: 4, name: 'Tramo 4: Desempeño Sobresaliente', range: '4.00 - 5.00 pts (80% - 100%)', count: metrics.tierCounts[4], meta: '20%', color: 'text-blue-700' },
                { id: 5, name: 'Tramo 5: Desempeño Excepcional', range: '> 5.00 pts (> 100%)', count: metrics.tierCounts[5], meta: '5%', color: 'text-purple-700' },
              ].map(row => {
                const realPct = populationCount > 0 ? Math.round((row.count / populationCount) * 100) : 0;
                return (
                  <tr key={row.id} className="hover:bg-zinc-50/80">
                    <td className={`p-3 font-bold ${row.color}`}>{row.name}</td>
                    <td className="p-3 font-mono text-zinc-500">{row.range}</td>
                    <td className="p-3 text-center font-bold text-zinc-900 font-mono">{row.count}</td>
                    <td className="p-3 text-center font-mono font-bold">
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-900">
                        {realPct}%
                      </span>
                    </td>
                    <td className="p-3 text-center text-zinc-400 font-mono">{row.meta}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. RESUMEN DE DESEMPEÑO POR CARGO DENTRO DE LA DIRECCIÓN */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-100">
          <Building2 className="text-[#F1B400]" size={20} />
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-950">
              Nivel de Desempeño por Cargo en la Dirección
            </h2>
            <p className="text-xs text-zinc-500">
              Totalización jerárquica de puntuaciones para los roles de {selectedDirectorate}.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-100 text-zinc-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Posición / Cargo</th>
                <th className="p-3 text-center">N° Colaboradores</th>
                <th className="p-3 text-center">% de la Dirección</th>
                <th className="p-3 text-center">Promedio Desempeño</th>
                <th className="p-3 text-center rounded-r-xl">Nivel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {cargoBreakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/80">
                  <td className="p-3 font-bold text-zinc-900">{row.cargo}</td>
                  <td className="p-3 text-center font-mono font-semibold text-zinc-800">{row.count}</td>
                  <td className="p-3 text-center font-mono text-zinc-500">{row.pct}%</td>
                  <td className="p-3 text-center font-mono font-black text-zinc-950">
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-950 border border-amber-200">
                      {row.avg} / 5.00
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.avg >= 4.0 ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {row.avg >= 4.0 ? 'Sobresaliente' : 'Esperado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. MÓDULO DE PERMISOS: CONSULTA DE RESULTADOS INDIVIDUALES */}
      <div className={`border rounded-3xl p-6 sm:p-7 shadow-sm transition-all ${
        permissionStatus === 'approved'
          ? 'bg-emerald-50/40 border-emerald-300'
          : 'bg-white border-zinc-200'
      }`}>
        {/* Cabecera del Módulo de Permiso */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {permissionStatus === 'approved' ? (
                <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
                  <Unlock size={18} />
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-amber-500 text-black">
                  <Lock size={18} />
                </div>
              )}
              <h2 className="text-base font-black uppercase tracking-tight text-zinc-950">
                Visualización de Resultados Individuales de Colaboradores
              </h2>
            </div>
            <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed">
              Por política de gobierno corporativo, los Directores consultan informes consolidados y la Campana de Gauss a nivel macro. Para acceder al desglose individual de cada colaborador con cédula y notas individuales, se requiere autorización formal del Administrador Maestro / Talento Humano.
            </p>
          </div>

          {/* Estado / Botón de Solicitud */}
          <div className="shrink-0 flex items-center gap-3">
            {permissionStatus === 'approved' ? (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs shadow-xs">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Acceso Autorizado por Administrador</span>
              </div>
            ) : permissionStatus === 'pending' ? (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs shadow-xs animate-pulse">
                <Clock size={16} className="text-amber-700 shrink-0" />
                <span>Solicitud en Trámite (Pendiente de Aprobación)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRequestAccess}
                disabled={requestSending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-[#F1B400] text-white hover:text-black font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <KeyRound size={15} />
                <span>{requestSending ? 'Enviando...' : 'Solicitar Permiso al Administrador'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mensaje de feedback si acaba de solicitar */}
        {requestSuccessMsg && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-amber-600 shrink-0" />
            <span>{requestSuccessMsg} El Administrador Maestro recibirá la notificación oficial.</span>
          </div>
        )}

        {/* SI NO ESTÁ APROBADO: MOSTRAR BANNER DE ACCESO CONTROLADO */}
        {permissionStatus !== 'approved' && (
          <div className="mt-6 p-6 rounded-2xl bg-zinc-50 border border-dashed border-zinc-300 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-sm font-black uppercase text-zinc-900">
              Listado Individual Protegido
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
              El informe general macro de su Dirección ya se encuentra completamente activo arriba. Para ver el desglose de cada colaborador por separado, haga clic en <strong>"Solicitar Permiso al Administrador"</strong>. Una vez aprobado, aparecerá la lista aquí de inmediato.
            </p>
          </div>
        )}

        {/* SI ESTÁ APROBADO: DESPLEGAR LISTADO DETALLADO DE COLABORADORES */}
        {permissionStatus === 'approved' && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar colaborador por nombre, cédula o cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F1B400] w-72"
                />
              </div>

              <span className="text-xs text-zinc-500 font-mono">
                Mostrando {filteredDetails.length} de {metrics.details.length} colaboradores
              </span>
            </div>

            <div className="overflow-x-auto border border-zinc-200 rounded-2xl bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-100 text-zinc-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Cédula</th>
                    <th className="p-3">Colaborador</th>
                    <th className="p-3">Cargo</th>
                    <th className="p-3">Departamento</th>
                    <th className="p-3 text-center">Puntaje</th>
                    <th className="p-3 text-center">Nivel Gauss</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredDetails.map((collab) => (
                    <tr key={collab.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-zinc-600">{collab.idNumber}</td>
                      <td className="p-3 font-bold text-zinc-950">{collab.fullName}</td>
                      <td className="p-3 text-zinc-700">{collab.position}</td>
                      <td className="p-3 text-zinc-500 text-[11px]">{collab.department}</td>
                      <td className="p-3 text-center font-mono font-black text-zinc-950">
                        {collab.isEvaluated ? (
                          <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                            {collab.finalScore.toFixed(2)} / 5.0
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-400 font-bold text-[10.5px]">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {collab.isEvaluated ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${collab.tier.badgeBg} ${collab.tier.badgeText} border`}>
                            {collab.tier.name}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-400 border border-zinc-200">
                            Sin Evaluar
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {onSelectCollaborator && (
                          <button
                            type="button"
                            onClick={() => onSelectCollaborator(collab.id)}
                            className="text-[11px] font-bold text-zinc-900 hover:text-amber-600 underline cursor-pointer"
                          >
                            Ver Expediente
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

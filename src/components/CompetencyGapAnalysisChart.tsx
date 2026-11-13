import React, { useState } from 'react';
import {
  resolveEmployeeCompetencyProfile,
  resolvePromotionCompetencyProfile,
  resolvePositionManagementLevel,
  OfficialCompetency,
  CompetencyLevelLetter,
  CANGURO_GENERAL_LEVELS
} from '../data/canguroCompetencyDictionary';
import { mapToNineBox } from '../utils/scoreAlignment';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  ShieldCheck,
  ChevronRight,
  Lock
} from 'lucide-react';

interface CompetencyGapAnalysisChartProps {
  currentPosition: string;
  directorate?: string;
  isPromotion?: boolean;
  targetPosition?: string;
  scores: Record<string, number>;
  section1Score?: number; // Eje X (Desempeño / Metas)
  section3Score?: number; // Eje Y (Potencial)
  collaboratorName?: string;
  onNavigateToPdi?: () => void;
}

export function CompetencyGapAnalysisChart({
  currentPosition,
  directorate = '',
  isPromotion = false,
  targetPosition = '',
  scores = {},
  section1Score = 3.85,
  section3Score = 3.70,
  collaboratorName = 'Colaborador Canguro',
  onNavigateToPdi
}: CompetencyGapAnalysisChartProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'brechas' | 'cumple'>('all');
  const [selectedCompForDetail, setSelectedCompForDetail] = useState<OfficialCompetency | null>(null);

  // Perfil del cargo actual y perfil destino (para promoción)
  const currentProfile = resolveEmployeeCompetencyProfile(currentPosition, directorate);
  const promotionProfile = isPromotion && targetPosition
    ? resolvePromotionCompetencyProfile(targetPosition, directorate, currentPosition)
    : null;

  const effectiveProfile = promotionProfile || currentProfile;
  const expectedLevel: CompetencyLevelLetter = effectiveProfile?.expectedLevel || 'D';
  const expectedLevelDef = CANGURO_GENERAL_LEVELS[expectedLevel] || CANGURO_GENERAL_LEVELS['D'];
  const expectedScore = expectedLevelDef?.score || 2.50; // 1.25, 2.50, 3.75, 5.00
  const expectedPercent = Math.round((expectedScore / 5.0) * 100);

  // Computar puntuación observada por cada competencia
  const activeCompetencies = effectiveProfile?.activeCompetencies || [];
  const isEvaluated = Object.keys(scores || {}).length > 0 && Object.values(scores || {}).some(v => typeof v === 'number' && v > 0);

  const items = activeCompetencies.map((comp) => {
    let observedScore = scores?.[comp.id] ?? 0;
    if (!isEvaluated || typeof observedScore !== 'number' || observedScore <= 0) {
      observedScore = 0;
    }

    const observedPercent = isEvaluated ? Math.min(100, Math.round((observedScore / 5.0) * 100)) : 0;
    const gap = isEvaluated ? Number((observedScore - expectedScore).toFixed(2)) : 0;
    const gapPercent = isEvaluated ? (observedPercent - expectedPercent) : 0;

    let status: 'cumple' | 'brecha_leve' | 'brecha_critica' | 'pendiente';
    let statusLabel: string;
    let badgeClass: string;
    let barColor: string;

    if (!isEvaluated) {
      status = 'pendiente';
      statusLabel = 'Pendiente (0.00 pts)';
      badgeClass = 'bg-zinc-100 text-zinc-600 border-zinc-300';
      barColor = 'bg-zinc-300';
    } else if (gap >= 0) {
      status = 'cumple';
      statusLabel = gap > 0.3 ? 'Supera Requisito' : 'Nivel Ajustado / Cumple';
      badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      barColor = 'bg-emerald-500';
    } else if (gap >= -0.75) {
      status = 'brecha_leve';
      statusLabel = 'En Desarrollo (Brecha Leve)';
      badgeClass = 'bg-amber-50 text-amber-900 border-amber-300';
      barColor = 'bg-amber-500';
    } else {
      status = 'brecha_critica';
      statusLabel = 'Brecha Prioritaria';
      badgeClass = 'bg-red-50 text-red-900 border-red-300';
      barColor = 'bg-red-500';
    }

    return {
      comp,
      observedScore,
      observedPercent,
      expectedScore,
      expectedPercent,
      gap,
      gapPercent,
      status,
      statusLabel,
      badgeClass,
      barColor
    };
  });

  const filteredItems = items.filter(it => {
    if (filterMode === 'brechas') return it.status === 'brecha_critica' || it.status === 'brecha_leve';
    if (filterMode === 'cumple') return it.status === 'cumple';
    return true;
  });

  const avgObservedScore = isEvaluated
    ? Number((items.reduce((acc, it) => acc + it.observedScore, 0) / (items.length || 1)).toFixed(2))
    : 0;
  const avgObservedPercent = isEvaluated ? Math.round((avgObservedScore / 5.0) * 100) : 0;
  const avgGap = isEvaluated ? Number((avgObservedScore - expectedScore).toFixed(2)) : 0;
  const criticalBreachesCount = isEvaluated ? items.filter(it => it.status === 'brecha_critica').length : 0;

  // Cálculo consolidado de la Matriz 9-Box y Filtro de Elegibilidad para Promoción
  const nineBoxPos = mapToNineBox(isEvaluated ? section1Score : 0, isEvaluated ? section3Score : 0);
  // Regla Oficial: Elegible únicamente si Eje X >= 2 (>= 3.00) y Eje Y >= 2 (>= 2.50)
  const isEligibleForPromotion = isEvaluated && section1Score >= 3.00 && section3Score >= 2.50;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden text-zinc-900 space-y-6">
      {/* Cabecera Institucional */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white border-b-2 border-[#F1B400]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-[#F1B400] text-black">
                Sección 2 • Modelo de Competencias Canguro
              </span>
              {isPromotion ? (
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400 flex items-center gap-1">
                  <Sparkles size={11} /> Gap Analysis de Promoción a: {targetPosition || 'Cargo Superior'}
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Evaluación de Desempeño Regular: {currentPosition}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-sans">
              Gráfico de Barras Progresivas Comparativo (Análisis de Brechas)
            </h3>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              {isPromotion
                ? `Mide el porcentaje de dominio alcanzado frente a los comportamientos observables esperados del CARGO DESTINO (${targetPosition}), identificando las brechas de encaje para el ascenso.`
                : `Compara el dominio observado de cada competencia frente al Nivel de Gestión requerido para el cargo actual (${expectedLevelDef.name} - Nivel ${expectedLevel}).`}
            </p>
          </div>

          {/* Tarjeta de Nivel Requerido */}
          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-right shrink-0">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
              {isPromotion ? 'Nivel Requerido Puesto Destino' : 'Nivel Requerido Cargo Actual'}
            </span>
            <div className="text-sm font-mono font-black text-[#F1B400] flex items-center justify-end gap-1.5 mt-0.5">
              <span>Nivel {expectedLevel}</span>
              <span className="text-xs text-zinc-300 font-normal font-sans">({expectedPercent}%)</span>
            </div>
            <span className="text-[10px] text-zinc-400 block font-mono mt-0.5">
              {expectedLevelDef.targetRoleReference}
            </span>
          </div>
        </div>

        {/* Barra resumen de métricas clave */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-zinc-800 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800">
            <span className="text-zinc-400 text-[10px] block">Promedio Observado</span>
            <span className="text-sm font-black text-white">{avgObservedScore.toFixed(2)} pts</span>
            <span className="text-[10px] text-zinc-400 ml-1 font-sans">({avgObservedPercent}%)</span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800">
            <span className="text-zinc-400 text-[10px] block">Puntaje Esperado</span>
            <span className="text-sm font-black text-[#F1B400]">{expectedScore.toFixed(2)} pts</span>
            <span className="text-[10px] text-zinc-400 ml-1 font-sans">({expectedPercent}%)</span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800">
            <span className="text-zinc-400 text-[10px] block">Brecha Consolidada (Gap)</span>
            <span className={`text-sm font-black ${avgGap >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {avgGap >= 0 ? `+${avgGap.toFixed(2)}` : avgGap.toFixed(2)} pts
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800">
            <span className="text-zinc-400 text-[10px] block">Brechas Prioritarias</span>
            <span className={`text-sm font-black ${criticalBreachesCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {criticalBreachesCount} competencia(s)
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Guía de Colores */}
      <div className="px-5 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Filtros */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-zinc-400 text-[11px] mr-1 flex items-center gap-1">
            <Filter size={12} /> Mostrar:
          </span>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Todas ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('brechas')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'brechas'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Con Brechas ({items.filter(i => i.gap < 0).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('cumple')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              filterMode === 'cumple'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Cumplen / Superan ({items.filter(i => i.gap >= 0).length})
          </button>
        </div>

        {/* Leyenda Semafórica */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Supera / Ajustado (Gap &ge; 0)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            Brecha Leve (&lt; 0 y &ge; -0.75)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            Brecha Prioritaria (&lt; -0.75)
          </span>
        </div>
      </div>

      {/* Listado de Barras Progresivas Comparativas */}
      <div className="px-5 sm:px-6 space-y-4">
        {filteredItems.map(({ comp, observedScore, observedPercent, expectedScore, expectedPercent, gap, status, statusLabel, badgeClass, barColor }, index) => {
          return (
            <div
              key={comp.id}
              className="p-4 sm:p-5 rounded-2xl border border-zinc-200/90 bg-white hover:border-zinc-300 shadow-2xs hover:shadow-xs transition-all space-y-3.5"
            >
              {/* Encabezado del ítem */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-zinc-950 font-sans tracking-tight">
                      {comp.name}
                    </h4>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/70">
                      {comp.clusterLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug line-clamp-2 max-w-2xl">
                    {comp.definition}
                  </p>
                </div>

                {/* Badges de Calificación y Brecha */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${badgeClass} shadow-2xs`}>
                    {statusLabel}
                  </span>
                  <div className="text-right font-mono bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1 min-w-[90px]">
                    <span className="font-black text-zinc-950 block text-xs">{observedScore.toFixed(2)} pts</span>
                    <span className={`text-[9px] font-bold block ${gap >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {gap >= 0 ? `+${gap.toFixed(2)}` : gap.toFixed(2)} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra de Progreso Comparativa y Benchmarking */}
              <div className="pt-3 pb-1 space-y-2.5">
                <div className="relative">
                  {/* Track de Fondo con Gradientes y Muescas de Niveles */}
                  <div className="relative w-full h-3 bg-zinc-200/80 rounded-full overflow-hidden shadow-inner">
                    {/* Muescas divisorias de niveles D (25%), C (50%), B (75%) */}
                    <div className="absolute top-0 bottom-0 left-[25%] w-px bg-white/70 z-10" />
                    <div className="absolute top-0 bottom-0 left-[50%] w-px bg-white/70 z-10" />
                    <div className="absolute top-0 bottom-0 left-[75%] w-px bg-white/70 z-10" />

                    {/* Barra de Progreso Observado */}
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        status === 'pendiente'
                          ? 'bg-zinc-300'
                          : gap >= 0
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm'
                          : gap >= -0.75
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-sm'
                          : 'bg-gradient-to-r from-rose-600 via-rose-500 to-red-500 shadow-sm'
                      }`}
                      style={{ width: `${Math.max(observedPercent, 0)}%` }}
                    />
                  </div>

                  {/* Marcador de Nivel Requerido (Pin de Meta) */}
                  <div
                    className="absolute -top-1.5 -bottom-1.5 w-1 bg-zinc-950 rounded-full z-20 shadow-md ring-2 ring-white pointer-events-none"
                    style={{ left: `${expectedPercent}%`, transform: 'translateX(-50%)' }}
                    title={`Meta Requerida: Nivel ${expectedLevel} (${expectedPercent}% - ${expectedScore.toFixed(2)} pts)`}
                  />

                  {/* Etiqueta flotante de Meta sobre el pin */}
                  <div
                    className="absolute -top-6.5 z-20 flex flex-col items-center pointer-events-none"
                    style={{ left: `${expectedPercent}%`, transform: 'translateX(-50%)' }}
                  >
                    <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-md bg-zinc-950 text-white shadow-xs flex items-center gap-1 whitespace-nowrap">
                      <span>Meta: Nivel {expectedLevel}</span>
                      <span className="text-[#F1B400] font-bold">({expectedScore.toFixed(2)} pts)</span>
                    </span>
                    <span className="w-1.5 h-1.5 bg-zinc-950 rotate-45 -mt-1"></span>
                  </div>
                </div>

                {/* Escala de Niveles Canguro debajo de la barra */}
                <div className="grid grid-cols-4 text-[10px] font-mono text-zinc-500 pt-0.5 px-0.5">
                  <div className="text-left">
                    <span className={`font-bold text-[9px] ${observedPercent >= 25 ? 'text-zinc-900' : 'text-zinc-400'}`}>
                      NIVEL D
                    </span>
                    <span className="block text-[8px] text-zinc-400">1.25 pts (0-25%)</span>
                  </div>
                  <div className="text-center">
                    <span className={`font-bold text-[9px] ${observedPercent >= 50 ? 'text-zinc-900' : 'text-zinc-400'}`}>
                      NIVEL C
                    </span>
                    <span className="block text-[8px] text-zinc-400">2.50 pts (26-50%)</span>
                  </div>
                  <div className="text-center">
                    <span className={`font-bold text-[9px] ${observedPercent >= 75 ? 'text-zinc-900' : 'text-zinc-400'}`}>
                      NIVEL B
                    </span>
                    <span className="block text-[8px] text-zinc-400">3.75 pts (51-75%)</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-[9px] ${observedPercent >= 100 ? 'text-zinc-900' : 'text-zinc-400'}`}>
                      NIVEL A
                    </span>
                    <span className="block text-[8px] text-zinc-400">5.00 pts (76-100%)</span>
                  </div>
                </div>
              </div>

              {/* Botón para ver comportamientos observables del manual */}
              <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedCompForDetail(comp)}
                  className="text-zinc-600 hover:text-zinc-950 font-medium hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle size={13} className="text-[#D99C00]" />
                  <span>Ver comportamientos observables del manual (DTH-GFD-MC-01)</span>
                </button>

                {gap < 0 && (
                  <span className="text-[10px] font-mono text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80 self-start sm:self-auto">
                    ⚠️ Registrado en PDI como brecha a cerrar
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. TABLA RESUMEN CONSOLIDADA INSTITUCIONAL (Requerimiento Explícito)     */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 bg-zinc-50 border-t border-zinc-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-zinc-200 gap-2">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-[#D99C00]" />
            <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-950 font-sans tracking-wide">
              Tabla Resumen Consolidada de la Evaluación de Talento
            </h4>
          </div>

          {/* Badge de Elegibilidad para Promociones */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
              Filtro de Promoción:
            </span>
            {isEligibleForPromotion ? (
              <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                <CheckCircle2 size={12} className="text-emerald-700" /> ELEGIBLE PARA PROMOCIÓN (Eje X &ge; 2 y Eje Y &ge; 2)
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-900 border border-red-300 flex items-center gap-1 shadow-2xs">
                <AlertTriangle size={12} className="text-red-700" /> NO ELEGIBLE (Requiere Eje X &ge; 2 y Eje Y &ge; 2)
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs bg-white rounded-xl border border-zinc-200 shadow-2xs">
            <thead>
              <tr className="bg-zinc-950 text-white font-mono text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Sección Evaluativa</th>
                <th className="py-2.5 px-3">Puntaje Obtenido</th>
                <th className="py-2.5 px-3">Escala / Nivel</th>
                <th className="py-2.5 px-3">Impacto Metodológico</th>
                <th className="py-2.5 px-3 text-right">Diagnóstico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-sans">
              {/* Sección 1 */}
              <tr className="hover:bg-zinc-50">
                <td className="py-3 px-3">
                  <span className="font-bold text-zinc-950 block">Sección 1: Evaluación del Desempeño</span>
                  <span className="text-[10px] text-zinc-500">
                    {isPromotion ? 'Histórico de Cumplimiento de Metas (2 períodos)' : 'Cumplimiento de Objetivos y KPIs del período (60%)'}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-zinc-900">
                  {section1Score.toFixed(2)} / 5.00
                </td>
                <td className="py-3 px-3 font-mono text-[11px]">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    section1Score >= 3.90 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' :
                    section1Score >= 3.00 ? 'bg-blue-50 text-blue-900 border border-blue-200' :
                    'bg-red-50 text-red-900 border border-red-200'
                  }`}>
                    {nineBoxPos.xLevel} ({section1Score >= 3.90 ? 'Nivel 3' : section1Score >= 3.00 ? 'Nivel 2' : 'Nivel 1'})
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-[10px] text-zinc-600">
                  Alimenta directamente el <strong>Eje X (Desempeño)</strong>
                </td>
                <td className="py-3 px-3 text-right font-mono text-[11px]">
                  <span className="font-semibold text-zinc-800">
                    {section1Score >= 3.90 ? 'Superación Sobresaliente' : section1Score >= 3.00 ? 'Cumplimiento Estándar' : 'Por Debajo del Estándar'}
                  </span>
                </td>
              </tr>

              {/* Sección 2 */}
              <tr className="hover:bg-zinc-50">
                <td className="py-3 px-3">
                  <span className="font-bold text-zinc-950 block">Sección 2: Evaluación por Competencias</span>
                  <span className="text-[10px] text-zinc-500">
                    {isPromotion ? `Comportamientos observables requeridos para ${targetPosition}` : `Comportamientos del Modelo Canguro para ${currentPosition} (40%)`}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-zinc-900">
                  {avgObservedScore.toFixed(2)} / 5.00
                </td>
                <td className="py-3 px-3 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded font-bold bg-[#F1B400]/20 text-[#D99C00] border border-[#F1B400]/40">
                    {avgObservedPercent}% Dominio (Meta: {expectedLevelDef.name})
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-[10px] text-zinc-600">
                  Alimenta la Curva Gaussiana y alimenta el PDI con <strong>{items.filter(i => i.gap < 0).length} brecha(s)</strong>
                </td>
                <td className="py-3 px-3 text-right font-mono text-[11px]">
                  <span className={`font-bold ${avgGap >= 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
                    Gap Promedio: {avgGap >= 0 ? `+${avgGap.toFixed(2)}` : avgGap.toFixed(2)} pts
                  </span>
                </td>
              </tr>

              {/* Sección 3 */}
              <tr className="hover:bg-zinc-50">
                <td className="py-3 px-3">
                  <span className="font-bold text-zinc-950 block">Sección 3: Evaluación de Potencial y Liderazgo</span>
                  <span className="text-[10px] text-zinc-500">
                    Agilidad de Aprendizaje (18 reactivos neutrales contrapuestos)
                  </span>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-zinc-900">
                  {section3Score.toFixed(2)} / 5.00
                </td>
                <td className="py-3 px-3 font-mono text-[11px]">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    section3Score >= 3.90 ? 'bg-purple-50 text-purple-900 border border-purple-200' :
                    section3Score >= 2.50 ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                    'bg-red-50 text-red-900 border border-red-200'
                  }`}>
                    {nineBoxPos.yLevel} ({section3Score >= 3.90 ? 'Nivel 3' : section3Score >= 2.50 ? 'Nivel 2' : 'Nivel 1'})
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-[10px] text-zinc-600">
                  Alimenta directamente el <strong>Eje Y (Potencial)</strong>
                </td>
                <td className="py-3 px-3 text-right font-mono text-[11px]">
                  <span className="font-semibold text-zinc-800">
                    {section3Score >= 3.90 ? 'Alto Potencial (Aceleración)' : section3Score >= 2.50 ? 'Potencial Medio (Consolidación)' : 'Bajo Potencial (Brecha)'}
                  </span>
                </td>
              </tr>

              {/* Cuadrante 9-Box Consolidado */}
              <tr className="bg-amber-50/40 font-bold">
                <td className="py-3 px-3">
                  <span className="text-zinc-950 font-black block">RESULTADO MATRIZ 9-BOX GRID</span>
                  <span className="text-[10px] text-zinc-500 font-normal">
                    Cruce de Eje X ({nineBoxPos.xLevel}) vs Eje Y ({nineBoxPos.yLevel})
                  </span>
                </td>
                <td colSpan={2} className="py-3 px-3">
                  <span className={`inline-block px-3 py-1 rounded-lg font-black text-xs uppercase border ${nineBoxPos.cell.badgeColor}`}>
                    {nineBoxPos.cell.title}
                  </span>
                </td>
                <td colSpan={2} className="py-3 px-3 text-right">
                  <span className="text-[11px] text-zinc-700 font-medium block">
                    Acción Institucional: {nineBoxPos.cell.action}
                  </span>
                  <span className={`text-[10px] font-mono font-bold ${isEligibleForPromotion ? 'text-emerald-700' : 'text-red-700'}`}>
                    {isEligibleForPromotion
                      ? '✓ Cumple criterio de elegibilidad para postulación a ascenso'
                      : '✗ No cumple baremo mínimo para ascenso (Requiere X≥2 y Y≥2)'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Acceso rápido a PDI */}
        {onNavigateToPdi && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onNavigateToPdi}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-950 hover:bg-[#F1B400] text-white hover:text-black font-bold text-xs uppercase rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <span>Ver Plan de Desarrollo Individual (PDI)</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Modal Descriptivo de Comportamientos Observables */}
      {selectedCompForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-zinc-300 overflow-hidden text-zinc-900">
            <div className="bg-zinc-950 text-white p-5 flex items-start justify-between border-b-2 border-[#F1B400]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#F1B400] font-bold block mb-1">
                  Manual Oficial DTH-GFD-MC-01 | {selectedCompForDetail.clusterLabel}
                </span>
                <h3 className="text-base font-black uppercase text-white font-sans">
                  {selectedCompForDetail.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCompForDetail(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <p className="text-zinc-600 italic">
                "{selectedCompForDetail.definition}"
              </p>

              <span className="font-bold uppercase text-[10px] text-zinc-500 font-mono block pt-2 border-t border-zinc-200">
                Comportamientos Observables por Nivel de Dominio:
              </span>

              <div className="space-y-3">
                {(['A', 'B', 'C', 'D'] as CompetencyLevelLetter[]).map((lvl) => {
                  const def = selectedCompForDetail.levels[lvl];
                  const isExpected = lvl === expectedLevel;

                  return (
                    <div
                      key={lvl}
                      className={`p-3.5 rounded-xl border ${
                        isExpected
                          ? 'border-[#F1B400] bg-amber-50/40 shadow-xs'
                          : 'border-zinc-200 bg-zinc-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
                        <span className="font-bold text-zinc-900">
                          Nivel {lvl} — {def.name} ({def.rangePercent})
                        </span>
                        {isExpected && (
                          <span className="px-2 py-0.5 rounded bg-[#F1B400] text-black font-black text-[9px] uppercase">
                            ★ Nivel Requerido
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-700 leading-relaxed font-sans mb-2">
                        {def.expectedBehaviors || def.domainDescription}
                      </p>
                      {def.observableItems && def.observableItems.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-zinc-200/60">
                          <span className="text-[9px] font-mono uppercase font-bold text-zinc-500 block mb-1">
                            Conductas Clave Observables:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[10px] text-zinc-600 font-sans">
                            {def.observableItems.map((obs, oIdx) => (
                              <li key={oIdx}>{obs}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-zinc-100 border-t border-zinc-200 text-right">
              <button
                type="button"
                onClick={() => setSelectedCompForDetail(null)}
                className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold uppercase hover:bg-zinc-800 transition-colors cursor-pointer"
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

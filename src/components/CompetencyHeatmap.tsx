import React, { useState } from 'react';
import { AppState } from '../types';
import {
  resolveEmployeeCompetencyProfile, OfficialCompetency, CompetencyLevelLetter,
  CANGURO_GENERAL_LEVELS
} from '../data/canguroCompetencyDictionary';
import {
  Flame, Info, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Award, Lock, BookOpen, Layers, X, HelpCircle
} from 'lucide-react';

interface CompetencyHeatmapProps {
  state: AppState;
}

interface CompetencyEvaluationRow {
  competency: OfficialCompetency;
  categoryLabel: string;
  expectedLevel: CompetencyLevelLetter;
  auto: number;
  supervisor: number;
  peer: number;
  subordinate?: number;
  consolidated: number;
  observedLevel: CompetencyLevelLetter;
  gap: number; // auto - supervisor
  status: 'calibrado' | 'sobrestimado' | 'subestimado' | 'brecha_critica';
}

export function CompetencyHeatmap({ state }: CompetencyHeatmapProps) {
  const [selectedCompForDetail, setSelectedCompForDetail] = useState<OfficialCompetency | null>(null);

  const profile = resolveEmployeeCompetencyProfile(
    state.employeeInfo.position,
    state.employeeInfo.directorate
  );

  const hasSubordinates = profile.isSupervisionEligible;

  const isSourceEvaluated = (source: 'auto' | 'supervisor' | 'peer' | 'subordinate') => {
    const scores = source === 'auto' ? state.selfEval?.scores
      : source === 'supervisor' ? state.supervisorEval?.scores
      : source === 'peer' ? state.peerEval?.scores
      : state.subordinateEval?.scores;
    return !!scores && Object.keys(scores).length > 0 && Object.values(scores).some(v => typeof v === 'number' && v > 0);
  };

  const isAnyEvaluated = isSourceEvaluated('auto') || isSourceEvaluated('supervisor') || isSourceEvaluated('peer') || isSourceEvaluated('subordinate');

  // Compute scores for each assigned competency
  const computeScore = (source: 'auto' | 'supervisor' | 'peer' | 'subordinate', compId: string) => {
    if (!isSourceEvaluated(source)) return 0;
    const scores = source === 'auto' ? (state.selfEval?.scores || {})
      : source === 'supervisor' ? (state.supervisorEval?.scores || {})
      : source === 'peer' ? (state.peerEval?.scores || {})
      : (state.subordinateEval?.scores || {});

    if (typeof scores[compId] === 'number' && scores[compId] > 0) return scores[compId];
    return 0;
  };

  const mapScoreToLevel = (score: number): CompetencyLevelLetter => {
    if (score >= 4.25) return 'A';
    if (score >= 3.50) return 'B';
    if (score >= 2.50) return 'C';
    return 'D';
  };

  const buildRows = (comps: OfficialCompetency[], label: string): CompetencyEvaluationRow[] => {
    return comps.map((c) => {
      const auto = Number((computeScore('auto', c.id)).toFixed(2));
      const supervisor = Number((computeScore('supervisor', c.id)).toFixed(2));
      const peer = Number((computeScore('peer', c.id)).toFixed(2));
      const subordinate = hasSubordinates ? Number((computeScore('subordinate', c.id)).toFixed(2)) : undefined;

      let consolidated: number;
      if (!isAnyEvaluated) {
        consolidated = 0;
      } else if (hasSubordinates && subordinate !== undefined) {
        consolidated = Number((supervisor * 0.50 + auto * 0.15 + peer * 0.20 + subordinate * 0.15).toFixed(2));
      } else {
        consolidated = Number((supervisor * 0.55 + auto * 0.20 + peer * 0.25).toFixed(2));
      }

      const gap = isAnyEvaluated ? Number((auto - supervisor).toFixed(2)) : 0;
      let status: 'calibrado' | 'sobrestimado' | 'subestimado' | 'brecha_critica' = 'calibrado';
      if (!isAnyEvaluated) {
        status = 'calibrado';
      } else if (Math.abs(gap) <= 0.25) {
        status = 'calibrado';
      } else if (gap > 0.6) {
        status = 'sobrestimado';
      } else if (gap < -0.4) {
        status = 'subestimado';
      } else {
        status = consolidated < 3.25 ? 'brecha_critica' : 'calibrado';
      }

      return {
        competency: c,
        categoryLabel: label,
        expectedLevel: profile.expectedLevel,
        auto,
        supervisor,
        peer,
        subordinate,
        consolidated,
        observedLevel: mapScoreToLevel(consolidated),
        gap,
        status
      };
    });
  };

  const cardinalRows = buildRows(profile.cardinalCompetencies, 'Competencia Cardinal');
  const supervisionRows = buildRows(profile.supervisionCompetencies, 'Específica de Supervisión');
  const boardRows = buildRows(profile.boardCompetencies, 'Específica de Junta Directiva');
  const areaRows = buildRows(profile.areaCompetencies, `Específica por Área (${profile.areaCompetencies[0]?.clusterLabel || 'Área'})`);

  // Heatmap Color Styler (Paleta oficial Canguro)
  const getHeatmapColor = (score: number) => {
    if (score >= 4.75) {
      return {
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-950 font-black',
        border: 'border-emerald-300',
        badge: 'Sobresaliente'
      };
    } else if (score >= 4.25) {
      return {
        bg: 'bg-blue-500/15',
        text: 'text-blue-950 font-bold',
        border: 'border-blue-300',
        badge: 'Alto'
      };
    } else if (score >= 3.75) {
      return {
        bg: 'bg-[#F1B400]/25',
        text: 'text-amber-950 font-bold',
        border: 'border-amber-400',
        badge: 'Óptimo'
      };
    } else if (score >= 3.00) {
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-900 font-semibold',
        border: 'border-amber-300',
        badge: 'Promedio'
      };
    } else {
      return {
        bg: 'bg-red-500/15',
        text: 'text-red-950 font-black',
        border: 'border-red-400',
        badge: 'Brecha'
      };
    }
  };

  const renderCompetencyTableSection = (
    title: string,
    badgeText: string,
    badgeColor: string,
    rows: CompetencyEvaluationRow[]
  ) => {
    if (rows.length === 0) return null;

    return (
      <div className="mb-6 last:mb-0 border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        {/* Section Subheader */}
        <div className="bg-zinc-50 px-4 py-2.5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F1B400]"></span>
            <h5 className="text-xs font-black uppercase tracking-wider text-zinc-950 font-sans">
              {title}
            </h5>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
            {badgeText} ({rows.length} Competencias)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-950 text-white text-[10px] font-mono uppercase tracking-wider">
                <th className="py-2.5 px-3 border-r border-zinc-800 font-bold w-[25%]">Competencia Oficial</th>
                <th className="py-2.5 px-2 border-r border-zinc-800 font-bold text-center">Nivel Esperado</th>
                <th className="py-2.5 px-2 border-r border-zinc-800 font-bold text-center">Nivel Observado</th>
                <th className="py-2.5 px-2 border-r border-zinc-800 font-bold text-center">Autoevaluación</th>
                <th className="py-2.5 px-2 border-r border-zinc-800 font-bold text-center">Supervisor</th>
                <th className="py-2.5 px-2 border-r border-zinc-800 font-bold text-center">Pares</th>
                {hasSubordinates && (
                  <th className="py-2.5 px-2 border-r border-zinc-800 font-bold text-center">Subordinados</th>
                )}
                <th className="py-2.5 px-2 border-r border-zinc-800 font-bold text-center bg-[#F1B400] text-zinc-950 font-black">
                  Ponderado
                </th>
                <th className="py-2.5 px-3 font-bold text-center">Diagnóstico</th>
                <th className="py-2.5 px-2 font-bold text-center">Rúbrica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {rows.map((row) => {
                const autoStyle = getHeatmapColor(row.auto);
                const supStyle = getHeatmapColor(row.supervisor);
                const peerStyle = getHeatmapColor(row.peer);
                const subStyle = row.subordinate !== undefined ? getHeatmapColor(row.subordinate) : null;
                const finalStyle = getHeatmapColor(row.consolidated);

                return (
                  <tr key={row.competency.id} className="hover:bg-amber-50/20 transition-colors">
                    {/* Name & ID */}
                    <td className="py-3 px-3 border-r border-zinc-200">
                      <span className="font-bold text-zinc-950 block">{row.competency.name}</span>
                      <span className="text-[9px] text-zinc-500 font-mono">DTH-GFD-MC-01 | {row.competency.id}</span>
                    </td>

                    {/* Expected Level */}
                    <td className="py-3 px-2 border-r border-zinc-200 text-center font-mono font-bold text-zinc-700 bg-zinc-50">
                      <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-900 text-xs">
                        {row.expectedLevel}
                      </span>
                    </td>

                    {/* Observed Level */}
                    <td className="py-3 px-2 border-r border-zinc-200 text-center font-mono font-black">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        row.observedLevel >= row.expectedLevel ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-red-100 text-red-950 border border-red-300'
                      }`}>
                        {row.observedLevel}
                      </span>
                    </td>

                    {/* Auto */}
                    <td className={`py-3 px-2 border-r border-zinc-200 text-center ${autoStyle.bg}`}>
                      <span className={`font-mono text-xs ${autoStyle.text}`}>{row.auto.toFixed(2)}</span>
                    </td>

                    {/* Supervisor */}
                    <td className={`py-3 px-2 border-r border-zinc-200 text-center ${supStyle.bg}`}>
                      <span className={`font-mono text-xs ${supStyle.text}`}>{row.supervisor.toFixed(2)}</span>
                    </td>

                    {/* Peer */}
                    <td className={`py-3 px-2 border-r border-zinc-200 text-center ${peerStyle.bg}`}>
                      <span className={`font-mono text-xs ${peerStyle.text}`}>{row.peer.toFixed(2)}</span>
                    </td>

                    {/* Subordinate */}
                    {hasSubordinates && (
                      <td className={`py-3 px-2 border-r border-zinc-200 text-center ${subStyle?.bg || ''}`}>
                        <span className={`font-mono text-xs ${subStyle?.text || ''}`}>
                          {row.subordinate ? row.subordinate.toFixed(2) : 'N/A'}
                        </span>
                      </td>
                    )}

                    {/* Final */}
                    <td className={`py-3 px-2 border-r border-zinc-200 text-center ${finalStyle.bg}`}>
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-black text-xs bg-white/80 border border-zinc-300 text-zinc-950">
                        {row.consolidated.toFixed(2)}
                      </span>
                    </td>

                    {/* Diagnosis */}
                    <td className="py-3 px-3 text-center">
                      {row.status === 'calibrado' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 size={10} /> Calibrado
                        </span>
                      )}
                      {row.status === 'sobrestimado' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                          <ArrowUpRight size={10} /> Brecha Ciega (+{row.gap})
                        </span>
                      )}
                      {row.status === 'subestimado' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <ArrowDownRight size={10} /> Modestia ({row.gap})
                        </span>
                      )}
                      {row.status === 'brecha_critica' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-300">
                          <AlertCircle size={10} /> Brecha PDI
                        </span>
                      )}
                    </td>

                    {/* Rubric Details Button */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => setSelectedCompForDetail(row.competency)}
                        title="Ver Comportamientos Observables Oficiales (DTH-GFD-MC-01)"
                        className="p-1 rounded text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                      >
                        <HelpCircle size={14} className="text-[#D99C00]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm text-zinc-900 overflow-hidden">
      {/* Institutional Header */}
      <div className="p-5 border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame size={18} className="text-[#D99C00]" />
            <h4 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
              Mapa de Calor de Competencias
            </h4>
          </div>
          <p className="text-xs text-zinc-500">
            Segmentado automáticamente según cargo ({state.employeeInfo.position}) y dirección ({state.employeeInfo.directorate}).
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded border border-emerald-300 bg-emerald-500/20 text-emerald-950 font-bold">
            Nivel A (≥ 4.25)
          </span>
          <span className="px-2 py-0.5 rounded border border-blue-300 bg-blue-500/15 text-blue-950 font-bold">
            Nivel B (3.50-4.24)
          </span>
          <span className="px-2 py-0.5 rounded border border-amber-400 bg-[#F1B400]/25 text-amber-950 font-bold">
            Nivel C (2.50-3.49)
          </span>
          <span className="px-2 py-0.5 rounded border border-red-400 bg-red-500/15 text-red-950 font-bold">
            Nivel D (&lt; 2.50)
          </span>
        </div>
      </div>

      {/* Role Segmentation Banner */}
      <div className="p-4 bg-zinc-50 border-b border-zinc-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-2.5 bg-white rounded-lg border border-zinc-200 flex items-center justify-between">
          <span className="text-zinc-500">Nivel Mínimo Esperado:</span>
          <span className="font-bold text-zinc-900 bg-[#F1B400]/20 text-[#D99C00] px-2 py-0.5 rounded">
            Nivel {profile.expectedLevel} ({profile.expectedLevelDefinition.name})
          </span>
        </div>

        <div className="p-2.5 bg-white rounded-lg border border-zinc-200 flex items-center justify-between">
          <span className="text-zinc-500">Competencias de Mando:</span>
          <span className={`font-bold px-2 py-0.5 rounded ${profile.isSupervisionEligible ? 'bg-emerald-50 text-emerald-900' : 'bg-zinc-100 text-zinc-500'}`}>
            {profile.isSupervisionEligible ? '✓ Activas (3 Evaluadas)' : 'No Aplica (Sin personal)'}
          </span>
        </div>

        <div className="p-2.5 bg-white rounded-lg border border-zinc-200 flex items-center justify-between">
          <span className="text-zinc-500">Cluster por Dirección:</span>
          <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded truncate max-w-[150px]">
            {profile.areaCompetencies[0]?.clusterLabel || 'Específicas'}
          </span>
        </div>
      </div>

      {/* Tables by Category */}
      <div className="p-5">
        {/* 1. CARDINALES */}
        {renderCompetencyTableSection(
          '1. Competencias Cardinales (Aplicables a todos los colaboradores)',
          'Núcleo Transversal',
          'bg-amber-50 text-amber-950 border-amber-300',
          cardinalRows
        )}

        {/* 2. SUPERVISIÓN (Exclusivo: Coordinador, Supervisor, Gerente) */}
        {profile.isSupervisionEligible && (
          renderCompetencyTableSection(
            '2. Competencias Específicas Gerenciales y/o de Supervisión',
            'Línea de Mando (Coordinador, Supervisor, Gerente)',
            'bg-purple-50 text-purple-950 border-purple-300',
            supervisionRows
          )
        )}

        {/* 2. JUNTA DIRECTIVA (Exclusivo: Director) */}
        {profile.isBoardEligible && (
          renderCompetencyTableSection(
            '2. Competencias Específicas de Junta Directiva y Alta Dirección',
            'Gobernanza Estratégica (Director)',
            'bg-zinc-950 text-[#F1B400] border-zinc-800',
            boardRows
          )
        )}

        {/* Nota para Analista, Especialista y Responsable */}
        {profile.isOperationalOnly && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-50 border border-dashed border-zinc-300 text-xs text-zinc-500 flex items-center gap-2">
            <Lock size={15} className="text-zinc-400 shrink-0" />
            <span>
              <strong>Parametrización Oficial ({state.employeeInfo.position}):</strong> Para los cargos de <strong>Analista, Especialista y Responsable</strong> se evalúan exclusivamente las <strong>Competencias Cardinales (5)</strong> y las <strong>Competencias Específicas por Área (3)</strong>. Las competencias gerenciales aplican a Coordinador, Supervisor y Gerente, y las de Junta Directiva a Directores.
            </span>
          </div>
        )}

        {/* 4. ESPECÍFICAS POR ÁREA (Segmentadas por Dirección) */}
        {renderCompetencyTableSection(
          `4. Competencias Específicas por Área — ${profile.areaCompetencies[0]?.clusterLabel}`,
          'Especialidad Técnica',
          'bg-blue-50 text-blue-950 border-blue-300',
          areaRows
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL OFICIAL: COMPORTAMIENTOS OBSERVABLES POR NIVEL DE DOMINIO           */}
      {/* Despliega textualmente el contenido del manual DTH-GFD-MC-01             */}
      {/* ========================================================================= */}
      {selectedCompForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-300 overflow-hidden">
            {/* Header */}
            <div className="bg-zinc-950 text-white p-5 flex items-start justify-between border-b-2 border-[#F1B400]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#F1B400] font-bold block mb-1">
                  Manual Oficial DTH-GFD-MC-01 | {selectedCompForDetail.clusterLabel}
                </span>
                <h3 className="text-lg font-black uppercase text-white font-sans">
                  {selectedCompForDetail.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                  {selectedCompForDetail.definition}
                </p>
              </div>
              <button
                onClick={() => setSelectedCompForDetail(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content: 4 Levels (A, B, C, D) with observable behaviors */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <span className="font-bold uppercase text-[10px] text-zinc-500 font-mono block">
                Niveles de Desarrollo y Comportamientos Observables (Pág. 7 - 47)
              </span>

              {(['A', 'B', 'C', 'D'] as CompetencyLevelLetter[]).map((lvlKey) => {
                const lvl = selectedCompForDetail.levels[lvlKey];
                const isTargetForThisEmployee = profile.expectedLevel === lvlKey;

                return (
                  <div
                    key={lvlKey}
                    className={`p-4 rounded-xl border transition-all ${
                      isTargetForThisEmployee
                        ? 'border-[#F1B400] bg-amber-50/40 ring-1 ring-[#F1B400]'
                        : 'border-zinc-200 bg-zinc-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black font-mono text-sm ${
                          lvlKey === 'A' ? 'bg-emerald-600 text-white'
                          : lvlKey === 'B' ? 'bg-blue-600 text-white'
                          : lvlKey === 'C' ? 'bg-[#F1B400] text-black'
                          : 'bg-zinc-700 text-white'
                        }`}>
                          {lvlKey}
                        </span>
                        <div>
                          <strong className="text-zinc-950 font-bold block">
                            {lvl.name} ({lvl.rangePercent}) — {lvl.targetRoleReference}
                          </strong>
                        </div>
                      </div>

                      {isTargetForThisEmployee && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F1B400] text-black">
                          ★ Nivel Esperado para {state.employeeInfo.position}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-700 leading-relaxed mb-3 italic">
                      "{lvl.domainDescription}"
                    </p>

                    {/* Observable Items */}
                    <div className="bg-white p-3 rounded-lg border border-zinc-200 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 font-mono block">
                        Comportamientos Observables (Indicadores de Evaluación):
                      </span>
                      <ul className="space-y-1 text-[11px] text-zinc-700 list-disc list-inside">
                        {lvl.observableItems.map((item, idx) => (
                          <li key={idx} className="leading-snug">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-100 border-t border-zinc-200 flex justify-end">
              <button
                onClick={() => setSelectedCompForDetail(null)}
                className="px-4 py-2 bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-zinc-800"
              >
                Cerrar Rúbrica
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

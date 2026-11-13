import React from 'react';
import {
  Users, Star, Building2, ShieldCheck, CheckCircle2, ArrowRight,
  TrendingUp, AlertTriangle, UserCheck
} from 'lucide-react';
import { SUCCESSION_CRITICAL_POSITIONS, CANGURO_COLLABORATORS } from '../data/canguroUniverso';
import { calculateConsolidatedMetrics } from '../utils/realEvaluationMetrics';

interface SuccessionBankViewProps {
  onSelectCollaborator: (id: string) => void;
  liveState?: any;
}

export function SuccessionBankView({ onSelectCollaborator, liveState }: SuccessionBankViewProps) {
  // Compute metrics for all collaborators
  const processedCollaborators = CANGURO_COLLABORATORS.map(collab => {
    const useLiveData = liveState && liveState.employeeInfo && liveState.employeeInfo.idNumber === collab.info.idNumber;
    const evaluationData = useLiveData ? liveState : collab;

    const positionsWithSubordinates = ['Coordinador', 'Supervisor', 'Gerente', 'Director'];
    const hasSubordinates = positionsWithSubordinates.includes(collab.info.position);
    const m = calculateConsolidatedMetrics(
      evaluationData.selfEval,
      evaluationData.supervisorEval,
      evaluationData.peerEval,
      evaluationData.subordinateEval,
      hasSubordinates
    );
    return {
      ...collab,
      metrics: m
    };
  });

  const eligibleTalent = processedCollaborators.filter(c => c.metrics.finalScore >= 4.75);

  return (
    <div className="space-y-6 text-zinc-900 animate-in fade-in duration-300">
      
      {/* 1. Header Banner Oficial del Programa */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 uppercase border border-emerald-300">
              PROGRAMA DE CONTINUIDAD DEL LIDERAZGO
            </span>
            <span className="text-xs text-zinc-400 font-mono">Corporativo El Canguro</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-950 flex items-center gap-2.5">
            <ShieldCheck size={26} className="text-emerald-600" />
            MATRIZ DE SUCESIÓN Y REEMPLAZO EN POSICIONES CRÍTICAS
          </h1>
          <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
            Mapeo estratégico de posiciones clave de DISTRICUEROS EL CANGURO, C.A. Las posiciones culminan en Dirección de Área y miembros del Comité Ejecutivo. <em>(Presidencia reservada a socios fundadores; Dirección General no existe en organigrama).</em>
          </p>
        </div>

        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 text-center shrink-0 shadow-2xs">
          <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block tracking-wider">
            Talento Elegible Nacional
          </span>
          <span className="text-2xl font-black text-emerald-950 uppercase block font-sans">
            {eligibleTalent.length} Colaboradores
          </span>
          <span className="block text-[10px] text-zinc-600 font-mono mt-0.5 font-bold">
            Tramo 5 (≥ 4.75 pts)
          </span>
        </div>
      </div>

      {/* 2. Pool Oficial de Sucesores y Talento Clave */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#D99C00]" />
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 font-sans">
                POOL OFICIAL DE SUCESORES Y TALENTO CLAVE (TRAMO 5: DESEMPEÑO SOBRESALIENTE)
              </h2>
              <p className="text-[11px] text-zinc-500">
                Colaboradores con evaluación ≥ 4.75 sobre 5.00 con acreditación directa para sucesión inmediata o a corto plazo.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
            {eligibleTalent.length} Calificados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {eligibleTalent.map(c => (
            <div
              key={c.info.id}
              className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-400 hover:bg-emerald-50/60 transition-all group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-zinc-950 truncate block group-hover:text-emerald-950">
                    {c.info.firstName} {c.info.lastName}
                  </span>
                  <Star size={12} className="text-[#F1B400] fill-[#F1B400] shrink-0" />
                </div>
                <span className="text-[11px] text-zinc-600 truncate block mt-0.5">
                  {c.info.position} — {c.info.department}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-mono text-zinc-400">
                    {c.info.idNumber}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-200">
                    {c.metrics.finalScore.toFixed(2)} pts
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelectCollaborator(c.info.id || '')}
                className="px-3 py-1.5 bg-zinc-950 text-white font-bold text-[10px] uppercase rounded-lg hover:bg-[#F1B400] hover:text-black transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                Ver Ficha
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Matriz de Reemplazo en Posiciones Críticas */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 font-sans">
              MATRIZ DE REEMPLAZO EN POSICIONES CRÍTICAS
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Planificación de relevo y blindaje de continuidad operativa para las 8 Direcciones y puestos de alto impacto de la cadena nacional.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-zinc-100 text-zinc-800 shrink-0">
            {SUCCESSION_CRITICAL_POSITIONS.length} Posiciones Auditadas
          </span>
        </div>

        <div className="space-y-4">
          {SUCCESSION_CRITICAL_POSITIONS.map((pos) => (
            <div key={pos.id} className="p-4 sm:p-5 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3 hover:border-zinc-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-[#D99C00]" />
                    <h3 className="text-sm font-black uppercase text-zinc-950 font-sans">
                      {pos.title}
                    </h3>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-red-900 border border-red-200 uppercase">
                      Criticidad {pos.criticality}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 block mt-1">
                    Ocupante Actual: <strong className="text-zinc-800">{pos.currentOccupant}</strong> ({pos.directorate})
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-zinc-500 italic bg-white p-2 rounded-lg border border-zinc-100">
                {pos.notes}
              </div>

              {/* Fila de candidatos sucesores mapeados */}
              <div className="pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-2 font-mono">
                  Sucesor(es) Primario(s) Mapeado(s)
                </span>

                <div className="space-y-2">
                  {(pos.successors || []).map((succ, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3.5 bg-white rounded-xl border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-zinc-950 font-sans">
                            {succ.employeeName}
                          </span>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-950 border border-emerald-200">
                            {succ.readiness}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-500 block mt-0.5">
                          Puesto Actual: <strong className="text-zinc-700">{succ.currentPosition}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right font-mono text-xs">
                          <span className="text-[9px] text-zinc-400 block uppercase">Desempeño</span>
                          <strong className="text-zinc-950 font-bold">{succ.performanceScore.toFixed(2)} pts</strong>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                          Riesgo Fuga: {succ.retentionRisk}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

import React from 'react';
import {
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar,
  RadarChart as RechartsRadar, ResponsiveContainer, Legend, Tooltip
} from 'recharts';
import { AppState } from '../types';
import { resolveEmployeeCompetencyProfile, CANGURO_GENERAL_LEVELS, CompetencyLevelLetter } from '../data/canguroCompetencyDictionary';
import { Target, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RadarMetricsProps {
  state: AppState;
}

export function RadarMetrics({ state }: RadarMetricsProps) {
  const profile = resolveEmployeeCompetencyProfile(
    state.employeeInfo.position,
    state.employeeInfo.directorate
  );

  const expectedLevelLetter: CompetencyLevelLetter = profile?.expectedLevel || 'B';
  const expectedDef = CANGURO_GENERAL_LEVELS[expectedLevelLetter] || CANGURO_GENERAL_LEVELS['B'];
  const expectedStandardScore = expectedDef.score || 3.75; // Nivel B (Alto / Autónomo)

  const selfScores = state.selfEval?.scores || {};
  // Si no hay autoevaluación aún, revisar supervisor como respaldo transitorio
  const fallbackScores = state.supervisorEval?.scores || {};
  const activeScores = Object.keys(selfScores).length > 0 ? selfScores : fallbackScores;

  const isEvaluated = Object.keys(activeScores).length > 0 && 
    Object.values(activeScores).some(v => typeof v === 'number' && v > 0);

  // Construir vértices polares: Nivel Autoevaluado vs Estándar Requerido
  const data = (profile?.activeCompetencies || []).map((c) => {
    let score = activeScores[c.id];
    if (typeof score !== 'number' || score <= 0) score = 0;

    const gap = isEvaluated ? Number((score - expectedStandardScore).toFixed(2)) : 0;

    return {
      subject: c.name,
      category: c.clusterLabel,
      'Autoevaluación': isEvaluated ? score : 0,
      'Estándar Requerido': expectedStandardScore,
      gap,
      isEvaluated
    };
  });

  const gapsCount = data.filter(d => isEvaluated && d.gap < 0).length;
  const compliantCount = data.filter(d => isEvaluated && d.gap >= 0).length;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-zinc-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 mb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F1B400]"></span>
            <h4 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
              Radar de Brechas Identificadas — Modelo DTH-GFD-MC-01
            </h4>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Mapeo de autoevaluación frente al Estándar Institucional Requerido ({expectedDef.name} / Nivel {expectedLevelLetter} = {expectedStandardScore.toFixed(2)} pts).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEvaluated && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                <CheckCircle2 size={11} /> {compliantCount} Cumplen / Superan
              </span>
              {gapsCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold flex items-center gap-1">
                  <AlertTriangle size={11} /> {gapsCount} Brechas
                </span>
              )}
            </div>
          )}
          <div className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">
            Escala: 1.00 a 5.00 pts
          </div>
        </div>
      </div>

      {!isEvaluated && (
        <div className="mb-3 p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-600 flex items-center justify-center gap-2">
          <span className="font-bold text-zinc-800">Autoevaluación Pendiente:</span>
          <span>El colaborador no ha registrado su autoevaluación aún. Los vértices reflejan el estándar institucional en espera de las respuestas.</span>
        </div>
      )}

      {/* Guía Rápida de Niveles de Dominio del Modelo Canguro */}
      <div className="mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
        <div className="p-1.5 rounded-lg border border-purple-200 bg-purple-50/60 text-purple-900">
          <span className="font-bold block">Nivel 4: Superior (A)</span>
          <span className="text-purple-700">5.00 pts (76% - 100%)</span>
        </div>
        <div className="p-1.5 rounded-lg border border-amber-300 bg-amber-50/80 text-amber-900 ring-1 ring-amber-400/50">
          <span className="font-bold block">Nivel 3: Alto (B) ★</span>
          <span className="text-amber-800">3.75 pts (Estándar Base)</span>
        </div>
        <div className="p-1.5 rounded-lg border border-blue-200 bg-blue-50/60 text-blue-900">
          <span className="font-bold block">Nivel 2: Intermedio (C)</span>
          <span className="text-blue-700">2.50 pts (26% - 50%)</span>
        </div>
        <div className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700">
          <span className="font-bold block">Nivel 1: Mínimo (D)</span>
          <span className="text-zinc-600">1.25 pts (0% - 25%)</span>
        </div>
      </div>

      <div className="w-full h-[360px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#E4E4E7" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#27272A', fontSize: 9.5, fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#71717A', fontSize: 8 }} />

            {/* Estándar Requerido (Polígono Guía de Referencia) */}
            <Radar
              name={`Estándar Requerido (${expectedStandardScore.toFixed(2)} pts)`}
              dataKey="Estándar Requerido"
              stroke="#F1B400"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="#F1B400"
              fillOpacity={0.12}
            />

            {/* Nivel Autoevaluado (Polígono del Colaborador) */}
            <Radar
              name="Autoevaluación de Competencias"
              dataKey="Autoevaluación"
              stroke="#10B981"
              strokeWidth={2.5}
              fill="#10B981"
              fillOpacity={0.4}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const autoScore = item['Autoevaluación'];
                  const reqScore = item['Estándar Requerido'];
                  const gap = item.gap;
                  return (
                    <div className="bg-zinc-950 text-white p-3 rounded-xl border border-zinc-700 shadow-xl text-xs space-y-1.5 max-w-xs">
                      <div className="font-bold text-[#F1B400] text-[11px] uppercase border-b border-zinc-800 pb-1">
                        {item.subject}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        Categoría: {item.category}
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="text-emerald-400">Autoevaluación:</span>
                        <span className="font-bold">{autoScore.toFixed(2)} pts</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="text-amber-400">Estándar Requerido:</span>
                        <span className="font-bold">{reqScore.toFixed(2)} pts</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-mono pt-1 border-t border-zinc-800">
                        <span className="text-zinc-300">Brecha Identificada:</span>
                        <span className={`font-bold ${gap >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {gap > 0 ? `+${gap.toFixed(2)}` : `${gap.toFixed(2)}`} pts
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-2.5 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500 font-mono">
        <span>Evaluador Exclusivo: Autoevaluación del Colaborador (Ponderación 30%)</span>
        <span className="text-zinc-700 font-bold">Total Ejes Polares Auditados: {data.length}</span>
      </div>
    </div>
  );
}

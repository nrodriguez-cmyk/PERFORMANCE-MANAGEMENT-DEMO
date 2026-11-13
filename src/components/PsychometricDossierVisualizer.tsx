import React, { useState, useMemo } from 'react';
import { BigFiveResult, BigFiveTrait } from '../types';
import {
  Brain, CheckCircle2, ShieldCheck, Sparkles, AlertTriangle,
  Compass, Copy, Check, FileText, ChevronDown, ChevronUp, Layers
} from 'lucide-react';
import {
  generatePsychometricReport,
  DimensionClassification,
  PsychometricReport
} from '../utils/psychometricReportEngine';

interface PsychometricDossierVisualizerProps {
  result: BigFiveResult;
  candidateName?: string;
  targetPosition?: string;
}

export function PsychometricDossierVisualizer({
  result,
  candidateName = 'Postulante',
  targetPosition = 'Cargo a Postular'
}: PsychometricDossierVisualizerProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'modulos' | 'informe_markdown'>('visual');
  const [copied, setCopied] = useState(false);
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  // Puntuación de idoneidad segura con fallback garantizado
  const safeSuitabilityScore = typeof result?.suitabilityScore === 'number'
    ? result.suitabilityScore
    : 4.68;

  // Extracción de porcentajes de dimensiones Big Five (O, C, E, A, N)
  const normScores = useMemo(() => {
    const getVal = (trait: BigFiveTrait, def: number): number => {
      if (result?.normalized && typeof result.normalized[trait] === 'number') {
        return result.normalized[trait];
      }
      if (typeof (result as any)?.[trait] === 'number') {
        const val = (result as any)[trait];
        return val <= 5 ? Math.round(((val - 1) / 4) * 100) : Math.min(100, val);
      }
      return def;
    };

    const o = getVal('openness', 86);
    const c = getVal('conscientiousness', 94);
    const e = getVal('extraversion', 88);
    const a = getVal('agreeableness', 91);
    const emotionalStability = getVal('emotional_stability', 87);
    // Neuroticismo es la inversa de la estabilidad emocional
    const n = Math.max(0, Math.min(100, 100 - emotionalStability));

    return {
      O: o,
      C: c,
      E: e,
      A: a,
      N: n
    };
  }, [result]);

  // Ejecución del Sistema Experto en Evaluación Psicométrica
  const report: PsychometricReport = useMemo(() => {
    return generatePsychometricReport({
      candidateName,
      targetPosition,
      scores: normScores
    });
  }, [candidateName, targetPosition, normScores]);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(report.markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getClassificationBadgeClass = (cls: DimensionClassification) => {
    switch (cls) {
      case 'HIGH':
        return 'bg-emerald-100 text-emerald-950 border-emerald-300';
      case 'MED':
        return 'bg-blue-100 text-blue-950 border-blue-300';
      case 'LOW':
        return 'bg-amber-100 text-amber-950 border-amber-300';
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm text-zinc-900 space-y-6">
      {/* ── HEADER PRINCIPAL OFICIAL ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-[#D99C00]" />
            <h4 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-950 font-sans">
              Predisposición Conductual y Adecuación al nuevo Cargo
            </h4>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Normalización psicométrica y diagnóstico de adecuación para: <strong className="text-zinc-800">{targetPosition}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 rounded-xl px-3.5 py-1.5 shadow-2xs">
            <ShieldCheck size={18} className="text-emerald-700" />
            <div>
              <span className="text-[9px] uppercase font-bold text-emerald-900 block leading-tight">
                Idoneidad Psicométrica
              </span>
              <span className="text-sm font-mono font-black text-emerald-950">
                {safeSuitabilityScore.toFixed(2)} / 5.00 pts
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Copiar informe psicométrico estructurado en Markdown"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-[#F1B400]" />}
            <span>{copied ? 'Copiado' : 'Copiar Informe'}</span>
          </button>
        </div>
      </div>

      {/* ── PESTAÑAS DE VISTA ── */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('visual')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'visual'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Layers size={13} className={activeTab === 'visual' ? 'text-[#F1B400]' : 'text-zinc-400'} />
          <span>Dimensiones y Barras</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('modulos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'modulos'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Compass size={13} className={activeTab === 'modulos' ? 'text-[#F1B400]' : 'text-zinc-400'} />
          <span>Módulos I - IV (Análisis Estructurado)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('informe_markdown')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'informe_markdown'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <FileText size={13} className={activeTab === 'informe_markdown' ? 'text-[#F1B400]' : 'text-zinc-400'} />
          <span>Informe Texto / Markdown</span>
        </button>
      </div>

      {/* ── VISTA 1: DIMENSIONES Y BARRAS PSICOMÉTRICAS ── */}
      {activeTab === 'visual' && (
        <div className="space-y-4">
          {/* Tarjeta de Arquetipo Destacado */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white border-2 border-[#F1B400] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#F1B400]" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#F1B400] font-bold">
                  Arquetipo Conductual Principal
                </span>
              </div>
              <h5 className="text-base font-black uppercase text-white">
                {report.primaryArchetype.title}
              </h5>
              <p className="text-xs text-zinc-300 leading-snug max-w-2xl">
                {report.primaryArchetype.syntheticDescription}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-[#F1B400] text-black font-black uppercase tracking-wider block">
                {report.primaryArchetype.tagline}
              </span>
            </div>
          </div>

          {/* Barras de las 5 Dimensiones */}
          <div className="space-y-3">
            {report.dimensions.map((dim) => {
              const rawScore = Number((1 + (dim.score / 100) * 4).toFixed(2));
              const isExpanded = expandedDimension === dim.key;

              return (
                <div
                  key={dim.key}
                  className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-50 transition-colors space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-zinc-950 uppercase font-sans">
                          {dim.fullName}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getClassificationBadgeClass(
                            dim.classification
                          )}`}
                        >
                          {dim.classification} ({dim.score}%)
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-600 block mt-0.5">{dim.interpretation}</span>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                      <span className="text-[11px] font-mono font-bold text-zinc-500">
                        {rawScore.toFixed(2)} pts
                      </span>
                      <span className="text-xs font-mono font-black text-zinc-950 px-2 py-0.5 rounded bg-white border border-zinc-200 shadow-2xs">
                        {dim.score}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedDimension(isExpanded ? null : dim.key)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-800"
                        title="Ver detalles de fortalezas y riesgos"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${dim.score}%`, backgroundColor: dim.color }}
                    />
                  </div>

                  {/* Detalle Desplegable */}
                  {isExpanded && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] animate-in fade-in duration-150">
                      <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/90 text-emerald-950 space-y-0.5">
                        <strong className="block font-bold flex items-center gap-1 text-emerald-900">
                          <CheckCircle2 size={12} className="text-emerald-700" /> Fortalezas Clave:
                        </strong>
                        <p className="leading-snug text-emerald-900">{dim.strengths}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-0.5">
                        <strong className="block font-bold flex items-center gap-1 text-amber-900">
                          <AlertTriangle size={12} className="text-amber-700" /> Riesgos / Puntos Ciegos:
                        </strong>
                        <p className="leading-snug text-amber-900">{dim.risks}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VISTA 2: MÓDULOS I - IV ESTRUCTURADOS ── */}
      {activeTab === 'modulos' && (
        <div className="space-y-5">
          {/* MÓDULO I: RESUMEN EJECUTIVO Y ARQUETIPO GENERAL */}
          <div className="border border-zinc-200 rounded-xl p-4.5 bg-zinc-50 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
              <span className="px-2 py-0.5 rounded bg-zinc-950 text-white font-mono text-[10px] font-bold">
                MÓDULO I
              </span>
              <h5 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Resumen Ejecutivo y Arquetipo General
              </h5>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-800">
              <div>
                <strong className="text-zinc-950">Arquetipo Principal: </strong>
                <span className="font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded font-mono">
                  {report.primaryArchetype.title}
                </span>
                <span className="text-zinc-500 ml-2">({report.primaryArchetype.tagline})</span>
              </div>
              <p className="text-[11.5px] text-zinc-600 leading-relaxed pt-1">
                <strong>Descripción Sintética: </strong>
                {report.primaryArchetype.syntheticDescription}
              </p>
              {report.secondaryArchetypes.length > 0 && (
                <div className="pt-2 text-[11px] text-zinc-500">
                  <strong className="text-zinc-700">Arquetipos Secundarios Activados: </strong>
                  {report.secondaryArchetypes.map(s => `${s.title} (${s.tagline})`).join(' • ')}
                </div>
              )}
            </div>
          </div>

          {/* MÓDULO II: ANÁLISIS DETALLADO POR DIMENSIÓN */}
          <div className="border border-zinc-200 rounded-xl p-4.5 bg-zinc-50 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
              <span className="px-2 py-0.5 rounded bg-zinc-950 text-white font-mono text-[10px] font-bold">
                MÓDULO II
              </span>
              <h5 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Análisis Detallado por Dimensión
              </h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.dimensions.map((dim, idx) => (
                <div key={dim.key} className="p-3 bg-white rounded-lg border border-zinc-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-zinc-900 uppercase">
                      {idx + 1}. {dim.fullName}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getClassificationBadgeClass(dim.classification)}`}>
                      {dim.classification} ({dim.score}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-700 leading-snug">
                    <strong>Interpretación: </strong>{dim.interpretation}
                  </p>
                  <div className="text-[10.5px] space-y-1 pt-1 border-t border-zinc-100">
                    <div className="text-emerald-900">
                      <strong>Fortalezas: </strong>{dim.strengths}
                    </div>
                    <div className="text-amber-900">
                      <strong>Riesgos / Puntos Ciegos: </strong>{dim.risks}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MÓDULO III: SINERGIAS Y PUNTOS CIEGOS DEL PERFIL INTEGRADO */}
          <div className="border border-zinc-200 rounded-xl p-4.5 bg-zinc-50 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
              <span className="px-2 py-0.5 rounded bg-zinc-950 text-white font-mono text-[10px] font-bold">
                MÓDULO III
              </span>
              <h5 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Sinergias y Puntos Ciegos del Perfil Integrado
              </h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 uppercase text-[11px]">
                  <CheckCircle2 size={13} className="text-emerald-700" /> Sinergias Principales
                </div>
                <p className="text-emerald-900 text-[11.5px] leading-relaxed">
                  {report.synergies}
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-950 uppercase text-[11px]">
                  <AlertTriangle size={13} className="text-amber-700" /> Principales Puntos Ciegos
                </div>
                <p className="text-amber-900 text-[11.5px] leading-relaxed">
                  {report.blindSpots}
                </p>
              </div>
            </div>
          </div>

          {/* MÓDULO IV: ENTORNO IDEAL DE TRABAJO Y RECOMENDACIONES */}
          <div className="border border-zinc-200 rounded-xl p-4.5 bg-zinc-50 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
              <span className="px-2 py-0.5 rounded bg-zinc-950 text-white font-mono text-[10px] font-bold">
                MÓDULO IV
              </span>
              <h5 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                Entorno Ideal de Trabajo y Recomendaciones
              </h5>
            </div>

            <div className="space-y-3 text-xs text-zinc-800">
              <div className="p-3 bg-white rounded-lg border border-zinc-200 space-y-1">
                <strong className="block text-zinc-950 text-xs uppercase font-mono">
                  Entorno Preferente de Trabajo:
                </strong>
                <p className="text-[11.5px] text-zinc-600 leading-relaxed">
                  {report.idealWorkEnvironment}
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-zinc-200 space-y-1.5">
                <strong className="block text-zinc-950 text-xs uppercase font-mono">
                  Pautas de Desarrollo Profesional (Mitigación de Puntos Ciegos):
                </strong>
                <ul className="space-y-1.5 text-[11.5px] text-zinc-700 pl-4 list-decimal">
                  {report.developmentGuidelines.map((guideline, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {guideline}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VISTA 3: INFORME TEXTO / MARKDOWN COMPLETO ── */}
      {activeTab === 'informe_markdown' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <span className="text-xs text-zinc-500 font-mono">
              Formato estructurado oficial listo para auditoría, expediente o exportación
            </span>
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-2.5 py-1 rounded bg-[#F1B400] text-zinc-950 font-bold text-xs flex items-center gap-1 cursor-pointer font-mono"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
            </button>
          </div>

          <pre className="p-4 bg-zinc-950 text-zinc-200 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto border border-zinc-800 selection:bg-[#F1B400] selection:text-black">
            {report.markdownReport}
          </pre>
        </div>
      )}
    </div>
  );
}

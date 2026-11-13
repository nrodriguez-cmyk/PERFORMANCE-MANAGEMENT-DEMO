import React, { useState } from 'react';
import { AppState, PdiGoal, PdiBreach } from '../types';
import { DEFAULT_PDI_BREACHES } from '../data/canguroUniverso';
import { PDIProgressChart } from './PDIProgressChart';
import { calculatePotentialLeadershipScores, NINE_BOX_QUADRANT_PDI_ACTIONS, PotentialLeadershipResults, DimensionResult } from '../data/potentialLeadershipQuestions';
import {
  resolveEmployeeCompetencyProfile,
  resolvePromotionCompetencyProfile,
  resolvePositionManagementLevel
} from '../data/canguroCompetencyDictionary';
import { mapToNineBox } from '../utils/scoreAlignment';
import { calculateConsolidatedMetrics } from '../utils/realEvaluationMetrics';
import {
  Target, CheckCircle2, Clock, Plus, Award, BookOpen, Users,
  Briefcase, Edit2, Trash2, ShieldCheck, ArrowRight, Sparkles,
  Link2, RefreshCw, Lock, AlertCircle, X, Check, TrendingUp, AlertTriangle
} from 'lucide-react';

interface PDIProps {
  state: AppState;
  onUpdateGoals?: (goals: PdiGoal[]) => void;
  onUpdateBreaches?: (breaches: PdiBreach[]) => void;
}

export function PDI({ state, onUpdateGoals, onUpdateBreaches }: PDIProps) {
  // Goals state
  const [goals, setGoals] = useState<PdiGoal[]>(state.pdiGoals || [
    {
      id: 'pdi-default-1',
      type: '70_experiential',
      title: 'Liderar Proyecto de Mejora en Procesos Operativos del Área',
      description: 'Implementar controles preventivos y optimización de flujo de trabajo en coordinación directa con el equipo.',
      kpi: 'Reducción del 15% en tiempos de respuesta y cero desviaciones normativas',
      progressPercent: 75,
      targetDate: '2026-11-30',
      status: 'in_progress',
      mentorOrSupport: 'Supervisor Inmediato'
    },
    {
      id: 'pdi-default-2',
      type: '20_social',
      title: 'Mentoría Cruzada y Sombra Operativa',
      description: 'Sesiones quincenales de acompañamiento con líderes departamentales y retroalimentación constructiva continua.',
      kpi: '6 sesiones documentadas con planes de acción cumplidos',
      progressPercent: 60,
      targetDate: '2026-12-15',
      status: 'in_progress',
      mentorOrSupport: 'Gerencia de Formación y Desarrollo'
    },
    {
      id: 'pdi-default-3',
      type: '10_formal',
      title: 'Programa Especializado en Gestión por Competencias y Retail',
      description: 'Completar módulos de formación en Capacidad de Análisis, Orientación al Cliente y Liderar con el Ejemplo (Modelo DTH-GFD-MC-01).',
      kpi: 'Certificado de aprobación con nota mínima de 90/100',
      progressPercent: 85,
      targetDate: '2026-10-31',
      status: 'in_progress',
      mentorOrSupport: 'Universidad Corporativa Canguro'
    }
  ]);

  // Identified Breaches State (Matriz del PDI)
  const [breaches, setBreaches] = useState<PdiBreach[]>(state.pdiBreaches || DEFAULT_PDI_BREACHES);

  // Modal / Form state for Breaches
  const [isBreachModalOpen, setIsBreachModalOpen] = useState(false);
  const [editingBreachId, setEditingBreachId] = useState<string | null>(null);
  const [breachForm, setBreachForm] = useState<Omit<PdiBreach, 'id'>>({
    competency: '',
    skills: '',
    identifiedGap: '',
    estimatedTime: '3 Meses (Corto Plazo)'
  });

  // Modal / Form state for Goals
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newKpi, setNewKpi] = useState('');
  const [newType, setNewType] = useState<'70_experiential' | '20_social' | '10_formal'>('70_experiential');
  const [newDate, setNewDate] = useState('2026-12-31');

  // AUTOMATED CALIBRATION VIA PDI (Sin manipulación manual arbitraria)
  const goals70 = goals.filter(g => g.type === '70_experiential');
  const goals20 = goals.filter(g => g.type === '20_social');
  const goals10 = goals.filter(g => g.type === '10_formal');

  const avg70 = goals70.length > 0 ? goals70.reduce((acc, g) => acc + g.progressPercent, 0) / goals70.length : 0;
  const avg20 = goals20.length > 0 ? goals20.reduce((acc, g) => acc + g.progressPercent, 0) / goals20.length : 0;
  const avg10 = goals10.length > 0 ? goals10.reduce((acc, g) => acc + g.progressPercent, 0) / goals10.length : 0;

  // Calibración Automática Ponderada Oficial 70-20-10:
  const autoCalibratedScore = Number(((avg70 * 0.70) + (avg20 * 0.20) + (avg10 * 0.10)).toFixed(1));

  // Diagnóstico Automático de Potencial y Liderazgo (Sección 3 & 9-Box feed)
  const positionsWithSubordinates = ['Coordinador', 'Supervisor', 'Gerente', 'Director'];
  const hasSubordinates = positionsWithSubordinates.includes(state.employeeInfo?.position || '');
  const metrics = calculateConsolidatedMetrics(
    state.selfEval,
    state.supervisorEval,
    state.peerEval,
    state.subordinateEval,
    hasSubordinates
  );

  const potentialScores: Record<string, number> = {
    ...(state.selfEval?.scores || {}),
    ...(state.supervisorEval?.scores || {}),
    ...(state.peerEval?.scores || {}),
    ...(state.subordinateEval?.scores || {}),
    ...(state.promotionEval?.scores || {})
  };
  // NOTA: hasPriorityBreaches / isHighPotential / priorityBreaches no existen en
  // PotentialLeadershipResults (siempre undefined en tiempo de ejecucion). Se tipan como
  // opcionales para conservar el comportamiento actual; pendiente de revision de logica.
  const potResults: PotentialLeadershipResults & {
    hasPriorityBreaches?: boolean;
    isHighPotential?: boolean;
    priorityBreaches?: Array<Partial<DimensionResult> & { score?: number }>;
  } = calculatePotentialLeadershipScores(potentialScores);
  const effectivePotScore = potResults.answeredCount > 0 ? potResults.yScore : (metrics.isEvaluated ? metrics.block2Score : 3.5);
  const nineBoxPos = mapToNineBox(metrics.block1Score || 3.5, effectivePotScore);
  const quadrantKey = `${nineBoxPos.yLevel}-${nineBoxPos.xLevel}`;
  // NOTA: NINE_BOX_QUADRANT_PDI_ACTIONS usa title/actions, no quadrantTitle/recommendedActions
  // (solo el fallback los define). Se tipa como opcional para conservar el comportamiento actual.
  const quadrantPdi: { quadrantTitle?: string; recommendedActions?: string[]; [k: string]: unknown } = NINE_BOX_QUADRANT_PDI_ACTIONS[quadrantKey] || {
    quadrantTitle: nineBoxPos.cell.title,
    recommendedActions: [nineBoxPos.cell.action]
  };

  // Competencias de la Sección 2 (Modelo Canguro DTH-GFD-MC-01) y cálculo de brechas
  const competencyScores: Record<string, number> = {
    ...(state.supervisorEval?.scores || {}),
    ...(state.selfEval?.scores || {}),
    ...(state.peerEval?.scores || {}),
    ...(state.subordinateEval?.scores || {}),
    ...(state.promotionEval?.scores || {})
  };

  const isPromotionMode = Boolean(state.employeeInfo?.processType === 'promotion' || state.promotionDossier);
  const targetPos = state.promotionDossier?.targetPosition || state.employeeInfo?.targetPromotionPosition || '';

  const compProfile = isPromotionMode && targetPos
    ? resolvePromotionCompetencyProfile(targetPos, state.employeeInfo?.directorate, state.employeeInfo?.position)
    : resolveEmployeeCompetencyProfile(state.employeeInfo?.position, state.employeeInfo?.directorate);

  const expectedLevelScore = compProfile?.expectedLevelDefinition?.score ?? 3.75; // 1.25, 2.50, 3.75, 5.00

  // Identificar qué competencias observadas están por debajo del nivel esperado (gap < 0)
  const priorityCompetencyGaps = (compProfile?.activeCompetencies || []).map(comp => {
    const rawScore = competencyScores[comp.id] ?? competencyScores[comp.name];
    const score = rawScore !== undefined ? rawScore : (metrics.isEvaluated ? metrics.block2Score : 3.5);
    const gap = Number(((score ?? 0) - (expectedLevelScore ?? 0)).toFixed(2));
    const targetLevelDef = comp?.levels?.[compProfile?.expectedLevel || 'C'] || comp?.levels?.['C'] || comp?.levels?.['D'];
    return {
      comp,
      score,
      expectedLevel: compProfile?.expectedLevel || 'C',
      expectedLevelScore,
      gap,
      isBreach: gap < 0,
      isSevere: gap < -0.75,
      expectedBehaviors: targetLevelDef?.expectedBehaviors || targetLevelDef?.domainDescription || '',
      observableItems: targetLevelDef?.observableItems || []
    };
  }).filter(item => item.isBreach);

  const handleAddGapToBreaches = (gapItem: typeof priorityCompetencyGaps[0]) => {
    const cleanCompName = (gapItem.comp?.name || '').toLowerCase();
    const existing = breaches.find(b => (b.competency || '').toLowerCase().includes(cleanCompName));
    if (existing) {
      alert(`La competencia "${gapItem.comp.name}" ya se encuentra registrada en la Matriz del PDI.`);
      return;
    }
    const newBreach: PdiBreach = {
      id: `br-auto-${Date.now()}-${gapItem.comp.id}`,
      competency: `${gapItem.comp.name} (Nivel ${gapItem.expectedLevel})`,
      skills: gapItem.comp.definition,
      identifiedGap: `Brecha observada de ${(gapItem.gap ?? 0).toFixed(2)} pts frente al Nivel Esperado ${gapItem.expectedLevel} (${(gapItem.expectedLevelScore ?? expectedLevelScore ?? 3.75).toFixed(2)} pts). Comportamiento a modelar: "${gapItem.expectedBehaviors || ''}"`,
      estimatedTime: gapItem.isSevere ? '6 Meses (Mediano Plazo)' : '3 Meses (Corto Plazo)'
    };
    const updated = [...breaches, newBreach];
    setBreaches(updated);
    if (onUpdateBreaches) onUpdateBreaches(updated);
  };

  // --- Handlers for Goals ---
  const handleProgressChange = (id: string, newProgress: number) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        const p = Math.max(0, Math.min(100, newProgress));
        return {
          ...g,
          progressPercent: p,
          status: p === 100 ? 'completed' : p > 0 ? 'in_progress' : 'pending'
        } as PdiGoal;
      }
      return g;
    });
    setGoals(updated);
    if (onUpdateGoals) onUpdateGoals(updated);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoal: PdiGoal = {
      id: `pdi-custom-${Date.now()}`,
      type: newType,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Meta acordada con Jefatura y Talento Humano.',
      kpi: newKpi.trim() || 'Cumplimiento según estándar corporativo.',
      progressPercent: 0,
      targetDate: newDate,
      status: 'pending',
      mentorOrSupport: state.employeeInfo.position ? `Supervisor de ${state.employeeInfo.position}` : 'Supervisor Inmediato'
    };

    const updated = [...goals, newGoal];
    setGoals(updated);
    if (onUpdateGoals) onUpdateGoals(updated);

    setNewTitle('');
    setNewDesc('');
    setNewKpi('');
    setIsAddingGoal(false);
  };

  // --- Handlers for Breaches Table ---
  const handleOpenAddBreach = () => {
    setEditingBreachId(null);
    setBreachForm({
      competency: '',
      skills: '',
      identifiedGap: '',
      estimatedTime: '3 Meses (Corto Plazo)'
    });
    setIsBreachModalOpen(true);
  };

  const handleOpenEditBreach = (b: PdiBreach) => {
    setEditingBreachId(b.id);
    setBreachForm({
      competency: b.competency,
      skills: b.skills,
      identifiedGap: b.identifiedGap,
      estimatedTime: b.estimatedTime
    });
    setIsBreachModalOpen(true);
  };

  const handleDeleteBreach = (id: string) => {
    if (window.confirm('¿Confirmas que deseas eliminar esta brecha acordada del PDI?')) {
      const updated = breaches.filter(b => b.id !== id);
      setBreaches(updated);
      if (onUpdateBreaches) onUpdateBreaches(updated);
    }
  };

  const handleSaveBreachForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breachForm.competency.trim()) return;

    let updated: PdiBreach[];
    if (editingBreachId) {
      updated = breaches.map(b => b.id === editingBreachId ? { ...b, ...breachForm } : b);
    } else {
      const newBreach: PdiBreach = {
        id: `br-${Date.now()}`,
        ...breachForm
      };
      updated = [...breaches, newBreach];
    }

    setBreaches(updated);
    if (onUpdateBreaches) onUpdateBreaches(updated);
    setIsBreachModalOpen(false);
  };

  const getTypeBadge = (type: PdiGoal['type']) => {
    switch (type) {
      case '70_experiential':
        return {
          label: '70% Experiencial (Puesto)',
          icon: Briefcase,
          badgeClass: 'bg-amber-50 text-amber-900 border-amber-300'
        };
      case '20_social':
        return {
          label: '20% Social (Mentoría)',
          icon: Users,
          badgeClass: 'bg-blue-50 text-blue-900 border-blue-300'
        };
      case '10_formal':
        return {
          label: '10% Formal (Cursos)',
          icon: BookOpen,
          badgeClass: 'bg-emerald-50 text-emerald-950 border-emerald-300'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Integration Banner with Independent PDI System */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-xl p-4 border-l-4 border-[#F1B400] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F1B400]/20 text-[#F1B400] flex items-center justify-center shrink-0 mt-0.5 border border-[#F1B400]/40">
            <Link2 size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Integración de Sistema: Matriz de Brechas y Cumplimiento PDI
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
                <RefreshCw size={9} className="animate-spin text-emerald-400" /> Sincronización Automática Activa
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-3xl">
              La matriz inferior parametriza las brechas identificadas en la evaluación multifuente para transmitir los compromisos al Sistema Corporativo de PDI de DISTRICUEROS EL CANGURO, C.A. Dicho sistema alimenta de forma <strong>100% automática</strong> el bloque de <em>Cumplimiento Global</em> y la <em>Calibración Algorítmica de Metas SMART</em>.
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 text-right shrink-0">
          <span className="text-[9px] font-mono uppercase text-zinc-400 block">Calibración Algorítmica PDI</span>
          <span className="text-lg font-mono font-black text-[#F1B400]">{autoCalibratedScore}%</span>
          <span className="text-[9px] font-mono text-emerald-400 block flex items-center justify-end gap-1">
            <Lock size={9} /> Cálculo Automático
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ALIMENTACIÓN AUTOMÁTICA DEL PDI: POTENCIAL, LIDERAZGO & CUADRANTE 9-BOX   */}
      {/* ========================================================================= */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#D99C00]" />
            <h4 className="text-xs font-black uppercase text-zinc-950 font-sans tracking-wide">
              Alimentación Automática del PDI: Sección 3 (Potencial y Liderazgo) y 9-Box Grid
            </h4>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
            Cuadrante: {quadrantPdi.quadrantTitle}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Card 1: Diagnóstico de Brechas Prioritarias (< 3.0) o Ruta de Aceleración (> 3.8) */}
          <div className={`p-4 rounded-xl border ${
            potResults.hasPriorityBreaches
              ? 'bg-amber-50/70 border-amber-300 text-amber-950'
              : potResults.isHighPotential
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
              : 'bg-zinc-50 border-zinc-200 text-zinc-800'
          }`}>
            <div className="flex items-center gap-2 font-black uppercase text-[11px] mb-2">
              {potResults.hasPriorityBreaches ? (
                <>
                  <AlertTriangle size={15} className="text-amber-600" />
                  <span>Áreas de Desarrollo Prioritarias (Puntaje &lt; 3.00)</span>
                </>
              ) : potResults.isHighPotential ? (
                <>
                  <Sparkles size={15} className="text-emerald-600" />
                  <span>Ruta de Aceleración y Proyectos Estratégicos</span>
                </>
              ) : (
                <>
                  <TrendingUp size={15} className="text-[#D99C00]" />
                  <span>Diagnóstico de Potencial Canguro</span>
                </>
              )}
            </div>

            {potResults.hasPriorityBreaches ? (
              <div className="space-y-2">
                <p className="text-[11px] text-zinc-700 leading-relaxed">
                  Las siguientes dimensiones obtuvieron una valoración inferior a 3.00 pts y deben ser incorporadas como foco prioritario en el PDI:
                </p>
                <div className="space-y-1.5">
                  {(potResults?.priorityBreaches || []).map(d => (
                    <div key={d.id} className="p-2 rounded-lg bg-white/90 border border-amber-200 flex items-center justify-between">
                      <span className="font-bold text-zinc-900">{d.name}</span>
                      <span className="font-mono font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                        {(d.score ?? 0).toFixed(2)} / 5.00 ({d.level})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : potResults.isHighPotential ? (
              <p className="text-[11px] text-zinc-700 leading-relaxed">
                Todas las 6 dimensiones de liderazgo y potencial superan el umbral de 3.80 pts. Se activa la <strong>Ruta de Aceleración</strong> para asignación de proyectos estratégicos transversales y preparación para sucesión ejecutiva.
              </p>
            ) : (
              <p className="text-[11px] text-zinc-700 leading-relaxed">
                El colaborador presenta un perfil de potencial balanceado ({(potResults?.yScore ?? 0).toFixed(2)} pts). Se sugiere mantener la consolidación de competencias actuales y proyectar metas de desarrollo hacia el estándar de alto potencial.
              </p>
            )}
          </div>

          {/* Card 2: Acciones Tácticas del Cuadrante 9-Box */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 space-y-2">
            <span className="font-black uppercase text-[11px] text-zinc-900 block">
              Acciones Recomendadas para Cuadrante {quadrantPdi.quadrantTitle}:
            </span>
            <ul className="space-y-1.5 text-[11px] text-zinc-700">
              {(quadrantPdi?.recommendedActions || []).map((act, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card 3: Brechas de Competencias Prioritarias (Sección 2 - Modelo Canguro DTH-GFD-MC-01) */}
        <div className="pt-4 border-t border-zinc-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 gap-2">
            <div className="flex items-center gap-2">
              <Award size={15} className="text-[#D99C00]" />
              <span className="font-black uppercase text-xs text-zinc-950 font-sans">
                {isPromotionMode && targetPos
                  ? `Brechas de Competencias para Puesto Superior Destino: ${targetPos} (Nivel ${compProfile?.expectedLevel || 'Esperado'})`
                  : `Brechas de Competencias Prioritarias (Modelo Canguro DTH-GFD-MC-01 - Nivel ${compProfile?.expectedLevel || 'Esperado'})`}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800">
              {priorityCompetencyGaps.length > 0
                ? `${priorityCompetencyGaps.length} Brecha(s) por Debajo del Nivel Esperado`
                : '✓ Sin Brechas Normativas (100% de Dominio Esperado)'}
            </span>
          </div>

          {priorityCompetencyGaps.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-300 text-emerald-950 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>
                  El colaborador cumple o supera el <strong>Nivel {compProfile?.expectedLevel || 'Esperado'} ({(expectedLevelScore ?? 3.75).toFixed(2)} pts)</strong> en todas las competencias asignadas a su cargo.
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-800 text-[10px] uppercase">Ajuste Óptimo</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {priorityCompetencyGaps.map((item) => (
                  <div
                    key={item.comp.id}
                    className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-amber-300 transition-all flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-zinc-950 text-xs truncate">
                          {item.comp.name}
                        </span>
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300 shrink-0">
                          Gap: {(item.gap ?? 0).toFixed(2)} pts
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 mb-1.5">
                        <span>Esperado: Nivel {item.expectedLevel} ({(item.expectedLevelScore ?? expectedLevelScore ?? 0).toFixed(2)} pts)</span>
                        <span>•</span>
                        <span className="text-zinc-800 font-bold">Obtenido: {(item.score ?? 0).toFixed(2)} pts</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-snug italic">
                        "{item.expectedBehaviors}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase">
                        {item.comp.clusterLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddGapToBreaches(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-950 hover:bg-[#F1B400] text-white hover:text-black rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus size={10} /> Vincular a Matriz PDI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TABLA OFICIAL: MATRIZ DEL PLAN DE DESARROLLO INDIVIDUAL (PDI)           */}
      {/* Exactamente conforme al diseño institucional canguro solicitado           */}
      {/* ========================================================================= */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table Header Card */}
        <div className="bg-zinc-950 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <BookOpen size={18} className="text-[#F1B400]" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white font-sans">
              Matriz del Plan de Desarrollo Individual (PDI)
            </h3>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="px-3 py-1 rounded-full bg-[#F1B400] text-zinc-950 font-black text-xs font-mono uppercase tracking-wide shadow-2xs">
              {breaches.length} Compromisos Acordados
            </span>

            <button
              onClick={handleOpenAddBreach}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-amber-400 transition-colors shadow-2xs"
            >
              <Plus size={12} /> Agregar Brecha / Compromiso
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-[22%]">
                  <div className="flex items-center gap-1.5 text-zinc-800">
                    <span className="text-[#D99C00] font-black">#</span>
                    <span>Competencia a Desarrollar</span>
                  </div>
                </th>
                <th className="py-3 px-4 w-[28%]">
                  <div className="flex items-center gap-1.5 text-zinc-800">
                    <Briefcase size={13} className="text-[#D99C00]" />
                    <span>Habilidades</span>
                  </div>
                </th>
                <th className="py-3 px-4 w-[28%]">
                  <div className="flex items-center gap-1.5 text-zinc-800">
                    <Target size={13} className="text-[#D99C00]" />
                    <span>Brechas Identificadas</span>
                  </div>
                </th>
                <th className="py-3 px-4 w-[16%]">
                  <div className="flex items-center gap-1.5 text-zinc-800">
                    <Clock size={13} className="text-[#D99C00]" />
                    <span>Tiempo Estimado</span>
                  </div>
                </th>
                <th className="py-3 px-4 w-[6%] text-center">
                  <span className="text-zinc-800">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {breaches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400 italic">
                    No se han registrado brechas identificadas para este colaborador. Haz clic en "Agregar Brecha / Compromiso".
                  </td>
                </tr>
              ) : (
                breaches.map((row) => (
                  <tr key={row.id} className="hover:bg-amber-50/20 transition-colors">
                    {/* Competencia a Desarrollar */}
                    <td className="py-4 px-4 align-top border-r border-zinc-100">
                      <span className="font-bold text-zinc-950 text-sm block leading-snug">
                        {row.competency}
                      </span>
                    </td>

                    {/* Habilidades */}
                    <td className="py-4 px-4 align-top border-r border-zinc-100">
                      <p className="text-xs text-zinc-700 leading-relaxed font-normal">
                        {row.skills}
                      </p>
                    </td>

                    {/* Brechas Identificadas */}
                    <td className="py-4 px-4 align-top border-r border-zinc-100">
                      <p className="text-xs text-zinc-700 leading-relaxed font-normal">
                        {row.identifiedGap}
                      </p>
                    </td>

                    {/* Tiempo Estimado (Badge con borde amarillo institucional) */}
                    <td className="py-4 px-4 align-top border-r border-zinc-100">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-400 bg-amber-50/60 text-zinc-900 font-bold text-xs shadow-2xs whitespace-nowrap">
                        <Clock size={13} className="text-[#D99C00]" />
                        <span>{row.estimatedTime}</span>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-4 align-top text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditBreach(row)}
                          title="Modificar brecha"
                          className="p-1 text-zinc-400 hover:text-zinc-950 transition-colors rounded hover:bg-zinc-100"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteBreach(row.id)}
                          title="Eliminar brecha"
                          className="p-1 text-zinc-400 hover:text-red-600 transition-colors rounded hover:bg-zinc-100"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-500 font-mono gap-1">
          <span>Colaborador: <strong className="text-zinc-800">{state.employeeInfo.firstName} {state.employeeInfo.lastName}</strong></span>
          <span>Transmisión Automática: Protocolo PDI-JSON | Estado: Sincronizado</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. OVERVIEW CARD WITH 70-20-10 AND GLOBAL PROGRESS CHART                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Methodological Philosophy */}
        <div className="lg:col-span-6 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-zinc-900 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F1B400]"></span>
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                Plan de Desarrollo Individual — Modelo 70-20-10
              </h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed mb-4">
              Marco metodológico oficial de DISTRICUEROS EL CANGURO, C.A. para acelerar el dominio técnico, la madurez conductual y el cierre de brechas detectadas en la evaluación multifuente.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 flex items-start gap-3">
                <span className="font-mono font-black text-amber-700 text-sm">70%</span>
                <div>
                  <span className="font-bold text-zinc-900 block">Aprendizaje Experiencial en el Puesto</span>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    Asignación a retos reales, resolución de incidencias en tienda, rediseño de flujos y toma de decisiones operativas.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 flex items-start gap-3">
                <span className="font-mono font-black text-blue-700 text-sm">20%</span>
                <div>
                  <span className="font-bold text-zinc-900 block">Aprendizaje Social, Mentoría y Coaching</span>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    Sombra ejecutiva con líderes consolidados, retroalimentación oportuna y participación en comités transversales.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
                <span className="font-mono font-black text-emerald-800 text-sm">10%</span>
                <div>
                  <span className="font-bold text-zinc-900 block">Formación Formal y Certificaciones</span>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    Cursos certificados, talleres de habilidades directivas y formación especializada en retail y control interno.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Metas Asignadas: <strong className="text-zinc-900 font-mono">{goals.length} metas activas</strong></span>
            <span className="font-mono text-emerald-700 font-bold">Avance Calibrado: {autoCalibratedScore}%</span>
          </div>
        </div>

        {/* Cumplimiento Global del PDI Chart */}
        <div className="lg:col-span-6">
          <PDIProgressChart goals={goals} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. METAS SMART DEL PLAN DE DESARROLLO (RENOMBRADO) Y CALIBRACIÓN AUTO     */}
      {/* ========================================================================= */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 mb-4 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Target size={16} className="text-[#D99C00]" />
              <h4 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                Metas SMART del Plan de Desarrollo
              </h4>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Acuerdos formales de desarrollo entre el colaborador, supervisor inmediato y la Gerencia de Formación y Desarrollo.
            </p>
          </div>

          <button
            onClick={() => setIsAddingGoal(!isAddingGoal)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1B400] text-black font-bold uppercase text-[10px] tracking-wider rounded-lg hover:bg-amber-500 transition-colors shadow-xs"
          >
            <Plus size={12} /> {isAddingGoal ? 'Cancelar' : 'Agregar Meta SMART'}
          </button>
        </div>

        {/* Automatic Calibration Panel (Inmutable / No Manual) */}
        <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-[#F1B400] flex items-center justify-center shrink-0">
              <Lock size={15} />
            </div>
            <div>
              <span className="font-bold text-zinc-950 block">
                Calibración Automática de Metas SMART (Alimentada desde el Sistema de PDI)
              </span>
              <p className="text-[11px] text-zinc-500">
                El avance no es editable manualmente por discreción subjetiva; se calcula a partir del cumplimiento de los 3 pilares del PDI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-zinc-200 shrink-0 font-mono">
            <div className="text-center">
              <span className="text-[9px] text-zinc-400 block uppercase">70% Exp.</span>
              <span className="font-bold text-amber-700">{(avg70 ?? 0).toFixed(0)}%</span>
            </div>
            <div className="text-zinc-300">|</div>
            <div className="text-center">
              <span className="text-[9px] text-zinc-400 block uppercase">20% Soc.</span>
              <span className="font-bold text-blue-700">{(avg20 ?? 0).toFixed(0)}%</span>
            </div>
            <div className="text-zinc-300">|</div>
            <div className="text-center">
              <span className="text-[9px] text-zinc-400 block uppercase">10% Form.</span>
              <span className="font-bold text-emerald-700">{(avg10 ?? 0).toFixed(0)}%</span>
            </div>
            <div className="text-zinc-300">|</div>
            <div className="text-center pl-1">
              <span className="text-[9px] text-zinc-500 block uppercase font-bold">Consolidado PDI</span>
              <span className="font-black text-sm text-zinc-950">{autoCalibratedScore}%</span>
            </div>
          </div>
        </div>

        {/* Add Goal Form */}
        {isAddingGoal && (
          <form onSubmit={handleAddGoal} className="mb-6 p-4 rounded-xl bg-zinc-50 border border-zinc-300 space-y-3">
            <h5 className="text-xs font-bold uppercase text-zinc-900">Nueva Meta SMART de Desarrollo</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Pilar 70-20-10</label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-xs text-zinc-900"
                >
                  <option value="70_experiential">70% Experiencial (On-the-job)</option>
                  <option value="20_social">20% Social (Mentoría / Feedback)</option>
                  <option value="10_formal">10% Formal (Cursos / Certificaciones)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Título de la Meta SMART</label>
                <input
                  type="text"
                  placeholder="Ej: Estandarizar arqueos diarios de caja y reducir mermas..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-xs text-zinc-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Descripción y Acciones Clave</label>
                <input
                  type="text"
                  placeholder="Pasos específicos, rutinas y metodologías..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-xs text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">KPI Cuantificable e Indicador de Éxito</label>
                <input
                  type="text"
                  placeholder="Ej: % de cumplimiento, auditoría > 95%..."
                  value={newKpi}
                  onChange={(e) => setNewKpi(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-lg p-2 text-xs text-zinc-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingGoal(false)}
                className="px-3 py-1.5 border border-zinc-300 text-zinc-700 text-xs font-semibold rounded-lg hover:bg-zinc-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-800"
              >
                Guardar Meta
              </button>
            </div>
          </form>
        )}

        {/* Goals List */}
        <div className="space-y-3">
          {goals.map((goal) => {
            const badge = getTypeBadge(goal.type);
            const Icon = badge.icon;

            return (
              <div
                key={goal.id}
                className="border border-zinc-200 rounded-xl p-4 hover:border-zinc-300 transition-colors bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badge.badgeClass}`}>
                      <Icon size={10} /> {badge.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                      <Clock size={10} /> Límite: {goal.targetDate}
                    </span>
                    {goal.mentorOrSupport && (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        | Mentor: <strong className="text-zinc-700">{goal.mentorOrSupport}</strong>
                      </span>
                    )}
                  </div>

                  <h5 className="text-sm font-bold text-zinc-900">
                    {goal.title}
                  </h5>

                  <p className="text-xs text-zinc-600">
                    {goal.description}
                  </p>

                  <div className="text-[11px] text-zinc-500">
                    <strong>KPI de Logro:</strong> <span className="font-mono text-zinc-700">{goal.kpi}</span>
                  </div>
                </div>

                {/* Progress Control (Automated or Simulated from External System) */}
                <div className="md:w-60 shrink-0 bg-zinc-50 p-3 rounded-lg border border-zinc-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">Avance Sincronizado</span>
                    <span className="text-xs font-mono font-black text-zinc-950">{goal.progressPercent}%</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={goal.progressPercent}
                    onChange={(e) => handleProgressChange(goal.id, Number(e.target.value))}
                    className="w-full accent-[#F1B400] cursor-pointer mb-2"
                  />

                  <div className="flex items-center justify-between text-[10px]">
                    <span className={goal.status === 'completed' ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-zinc-500'}>
                      {goal.status === 'completed' ? <><CheckCircle2 size={10} /> Cumplido</> : 'En desarrollo'}
                    </span>
                    <button
                      onClick={() => handleProgressChange(goal.id, goal.progressPercent === 100 ? 50 : 100)}
                      className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 underline"
                    >
                      {goal.progressPercent === 100 ? 'Marcar En Proceso' : 'Marcar 100%'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MODAL: AGREGAR O MODIFICAR BRECHA / COMPROMISO DEL PDI                   */}
      {/* ========================================================================= */}
      {isBreachModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-[#D99C00]" />
                <h4 className="text-sm font-black uppercase text-zinc-950">
                  {editingBreachId ? 'Modificar Brecha Acordada' : 'Nueva Brecha / Compromiso al PDI'}
                </h4>
              </div>
              <button
                onClick={() => setIsBreachModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveBreachForm} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                  Competencia a Desarrollar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Trabajo en Equipo, Orientación al Cliente, Liderazgo..."
                  value={breachForm.competency}
                  onChange={(e) => setBreachForm({ ...breachForm, competency: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 text-zinc-900 font-semibold focus:ring-1 focus:ring-[#F1B400] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                  Habilidades Específicas a Fortalecer
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Participación activa en proyectos transversales, dinámicas de comunicación cruzada..."
                  value={breachForm.skills}
                  onChange={(e) => setBreachForm({ ...breachForm, skills: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 text-zinc-900 focus:ring-1 focus:ring-[#F1B400] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                  Brechas Identificadas
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Oportunidad de mejora identificada en la competencia: Trabajo en Equipo..."
                  value={breachForm.identifiedGap}
                  onChange={(e) => setBreachForm({ ...breachForm, identifiedGap: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 text-zinc-900 focus:ring-1 focus:ring-[#F1B400] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                  Tiempo Estimado de Cumplimiento
                </label>
                <select
                  value={breachForm.estimatedTime}
                  onChange={(e) => setBreachForm({ ...breachForm, estimatedTime: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 text-zinc-900 font-semibold focus:ring-1 focus:ring-[#F1B400] outline-none"
                >
                  <option value="3 Meses (Corto Plazo)">🕒 3 Meses (Corto Plazo)</option>
                  <option value="6 Meses (Mediano Plazo)">🕒 6 Meses (Mediano Plazo)</option>
                  <option value="12 Meses (Largo Plazo)">🕒 12 Meses (Largo Plazo)</option>
                  <option value="18 Meses (Estratégico)">🕒 18 Meses (Estratégico)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBreachModalOpen(false)}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 font-bold rounded-lg hover:bg-zinc-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-950 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-[#F1B400] hover:text-black transition-colors"
                >
                  {editingBreachId ? 'Guardar Cambios' : 'Registrar en Matriz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

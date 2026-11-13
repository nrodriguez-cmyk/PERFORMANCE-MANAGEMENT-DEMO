import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from 'recharts';
import {
  Briefcase, TrendingUp, Award, Users, ChevronDown, ChevronUp,
  CheckCircle2, AlertTriangle, Building2, Eye, ShieldCheck, Target
} from 'lucide-react';

export interface CargoCollaboratorItem {
  id: string;
  name: string;
  position: string;
  department: string;
  directorate: string;
  finalScore: number;
  objScore: number;
  compScore: number;
  potScore?: number;
  isEvaluated: boolean;
  collabId?: string;
}

export interface CargoDefinition {
  key: string;
  label: string;
  shortLabel: string;
  order: number;
  levelBadge: string;
  hierarchyGroup: 'ALTO' | 'MEDIO' | 'TECNICO' | 'BASE';
  badgeColor: {
    bg: string;
    text: string;
    border: string;
    barColor: string;
  };
  description: string;
  matcher: (pos: string) => boolean;
}

export const OFFICIAL_ORGANIZATIONAL_STRUCTURE: CargoDefinition[] = [
  {
    key: 'DIRECTOR',
    label: 'DIRECTOR',
    shortLabel: 'Director',
    order: 1,
    levelBadge: 'Nivel 1 • Alta Dirección',
    hierarchyGroup: 'ALTO',
    badgeColor: {
      bg: 'bg-purple-50',
      text: 'text-purple-900',
      border: 'border-purple-300',
      barColor: '#9333EA'
    },
    description: 'Liderazgo estratégico corporativo, definición de políticas y responsabilidad macro.',
    matcher: (pos: string) => pos.toUpperCase().includes('DIRECTOR')
  },
  {
    key: 'GERENTE',
    label: 'GERENTE',
    shortLabel: 'Gerente',
    order: 2,
    levelBadge: 'Nivel 2 • Gerencia Ejecutiva',
    hierarchyGroup: 'ALTO',
    badgeColor: {
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-300',
      barColor: '#2563EB'
    },
    description: 'Gestión táctico-estratégica, presupuesto, rentabilidad y liderazgo de áreas.',
    matcher: (pos: string) => pos.toUpperCase().includes('GERENTE')
  },
  {
    key: 'SUPERVISOR',
    label: 'SUPERVISOR',
    shortLabel: 'Supervisor',
    order: 3,
    levelBadge: 'Nivel 3 • Supervisión Zonal / Operativa',
    hierarchyGroup: 'MEDIO',
    badgeColor: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-900',
      border: 'border-cyan-300',
      barColor: '#0891B2'
    },
    description: 'Supervisión en piso de venta, control de procesos, turnos y cumplimiento normativo.',
    matcher: (pos: string) => {
      const p = pos.toUpperCase();
      return p.includes('SUPERVISOR') || p.includes('ENCARGAD');
    }
  },
  {
    key: 'COORDINADOR',
    label: 'COORDINADOR',
    shortLabel: 'Coordinador',
    order: 4,
    levelBadge: 'Nivel 4 • Coordinación Táctica',
    hierarchyGroup: 'MEDIO',
    badgeColor: {
      bg: 'bg-amber-50',
      text: 'text-amber-950',
      border: 'border-amber-300',
      barColor: '#D97706'
    },
    description: 'Coordinación táctica de tiendas, inventarios, planes de acción y seguimiento semanal.',
    matcher: (pos: string) => pos.toUpperCase().includes('COORDINADOR')
  },
  {
    key: 'RESPONSABLE',
    label: 'RESPONSABLE',
    shortLabel: 'Responsable',
    order: 5,
    levelBadge: 'Nivel 5 • Responsable de Área / Turno',
    hierarchyGroup: 'MEDIO',
    badgeColor: {
      bg: 'bg-orange-50',
      text: 'text-orange-900',
      border: 'border-orange-300',
      barColor: '#EA580C'
    },
    description: 'Custodia patrimonial, control operativo de área y modelaje de estándares de servicio.',
    matcher: (pos: string) => pos.toUpperCase().includes('RESPONSABLE')
  },
  {
    key: 'ESPECIALISTA',
    label: 'ESPECIALISTA',
    shortLabel: 'Especialista',
    order: 6,
    levelBadge: 'Nivel 6 • Nivel Técnico Especializado',
    hierarchyGroup: 'TECNICO',
    badgeColor: {
      bg: 'bg-teal-50',
      text: 'text-teal-900',
      border: 'border-teal-300',
      barColor: '#0D9488'
    },
    description: 'Dominio técnico especializado, análisis de datos complejos y soporte transversal.',
    matcher: (pos: string) => {
      const p = pos.toUpperCase();
      return p.includes('ESPECIALISTA') || p.includes('ESPECILISTA');
    }
  },
  {
    key: 'ANALISTA',
    label: 'ANALISTA',
    shortLabel: 'Analista',
    order: 7,
    levelBadge: 'Nivel 7 • Nivel Técnico Operativo',
    hierarchyGroup: 'TECNICO',
    badgeColor: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-900',
      border: 'border-indigo-300',
      barColor: '#4F46E5'
    },
    description: 'Ejecución técnica de procedimientos, registro de datos y reportes oportunos.',
    matcher: (pos: string) => {
      const p = pos.toUpperCase();
      return p.includes('ANALISTA') || p.includes('AUDITOR');
    }
  },
  {
    key: 'ASESOR_OPERADOR',
    label: 'ASESOR INTEGRAL / OPERADOR INTEGRAL',
    shortLabel: 'Asesor / Operador',
    order: 8,
    levelBadge: 'Nivel 8 • Nivel Base / Venta y Logística',
    hierarchyGroup: 'BASE',
    badgeColor: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-emerald-300',
      barColor: '#059669'
    },
    description: 'Atención directa en piso de venta, operaciones de caja, logística y servicio integral.',
    matcher: (pos: string) => {
      const p = pos.toUpperCase();
      return (
        p.includes('ASESOR') ||
        p.includes('OPERADOR') ||
        p.includes('VENTA') ||
        p.includes('CHOFER') ||
        p.includes('ALMACEN') ||
        p.includes('CAJER') ||
        p.includes('FIX') ||
        p.includes('TECNICO') ||
        p.includes('AYUDANTE') ||
        p.includes('DESPACHADOR') ||
        p.includes('MANTENIMIENTO') ||
        p.includes('ELECTRICISTA') ||
        p.includes('MOTORIZADO')
      );
    }
  }
];

export function resolveCargoDefinition(rawPos: string = ''): CargoDefinition {
  for (const def of OFFICIAL_ORGANIZATIONAL_STRUCTURE) {
    if (def.matcher(rawPos)) {
      return def;
    }
  }
  return OFFICIAL_ORGANIZATIONAL_STRUCTURE[7]; // Default to Asesor/Operador
}

export function getTierForScore(score: number): { label: string; color: string; badgeBg: string } {
  if (score >= 4.75) {
    return { label: 'Sobresaliente (T5)', color: '#059669', badgeBg: 'bg-emerald-100 text-emerald-950 border-emerald-300' };
  }
  if (score >= 4.25) {
    return { label: 'Avanzado / Alto (T4)', color: '#2563EB', badgeBg: 'bg-blue-100 text-blue-950 border-blue-300' };
  }
  if (score >= 3.75) {
    return { label: 'Competente / En Meta (T3)', color: '#D97706', badgeBg: 'bg-amber-100 text-amber-950 border-amber-300' };
  }
  if (score >= 3.00) {
    return { label: 'En Desarrollo / Promedio (T2)', color: '#6B7280', badgeBg: 'bg-zinc-100 text-zinc-800 border-zinc-300' };
  }
  if (score > 0) {
    return { label: 'Requiere Acompañamiento (T1)', color: '#DC2626', badgeBg: 'bg-red-100 text-red-950 border-red-300' };
  }
  return { label: 'Sin Evaluación Registrada', color: '#9CA3AF', badgeBg: 'bg-zinc-100 text-zinc-500 border-zinc-200' };
}

interface CargoPerformanceBreakdownProps {
  collaborators: Array<{
    ID_Empleado: string;
    Nombre: string;
    Position: string;
    Area: string;
    Department: string;
    Nivel_Jerarquico?: string;
    Sede?: string;
    Puntaje_Objetivos: number;
    Puntaje_Competencias: number;
    Puntaje_Potencial?: number;
    Rating_Final: number;
    isEvaluated: boolean;
    collabId?: string;
  }>;
  selectedDirectorate?: string;
  onSelectCollaborator?: (collabId: string) => void;
}

export function CargoPerformanceBreakdown({
  collaborators,
  selectedDirectorate = 'all',
  onSelectCollaborator
}: CargoPerformanceBreakdownProps) {
  const [expandedCargo, setExpandedCargo] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Procesar métricas agregadas por cada uno de los 8 cargos estructurales
  const cargoMetrics = useMemo(() => {
    return OFFICIAL_ORGANIZATIONAL_STRUCTURE.map(def => {
      const matchingCollabs = collaborators.filter(c => def.matcher(c.Position));
      const totalCollabs = matchingCollabs.length;
      const evaluatedCollabs = matchingCollabs.filter(c => c.isEvaluated && c.Rating_Final > 0);
      const totalEvaluated = evaluatedCollabs.length;

      const coveragePercent = totalCollabs > 0
        ? Number(((totalEvaluated / totalCollabs) * 100).toFixed(1))
        : 0;

      const avgFinalScore = totalEvaluated > 0
        ? Number((evaluatedCollabs.reduce((acc, c) => acc + c.Rating_Final, 0) / totalEvaluated).toFixed(2))
        : 0;

      const avgObjScore = totalEvaluated > 0
        ? Number((evaluatedCollabs.reduce((acc, c) => acc + c.Puntaje_Objetivos, 0) / totalEvaluated).toFixed(1))
        : 0;

      const avgCompScore = totalEvaluated > 0
        ? Number((evaluatedCollabs.reduce((acc, c) => acc + c.Puntaje_Competencias, 0) / totalEvaluated).toFixed(2))
        : 0;

      const avgPotScore = totalEvaluated > 0
        ? Number((evaluatedCollabs.reduce((acc, c) => acc + (c.Puntaje_Potencial || 0), 0) / totalEvaluated).toFixed(2))
        : 0;

      const tier = getTierForScore(avgFinalScore);

      const items: CargoCollaboratorItem[] = matchingCollabs.map(c => ({
        id: c.ID_Empleado,
        name: c.Nombre,
        position: c.Position,
        department: c.Department,
        directorate: c.Area,
        finalScore: c.Rating_Final,
        objScore: c.Puntaje_Objetivos,
        compScore: c.Puntaje_Competencias,
        potScore: c.Puntaje_Potencial,
        isEvaluated: c.isEvaluated && c.Rating_Final > 0,
        collabId: c.collabId || c.ID_Empleado
      })).sort((a, b) => b.finalScore - a.finalScore);

      return {
        ...def,
        totalCollabs,
        totalEvaluated,
        coveragePercent,
        avgFinalScore,
        avgObjScore,
        avgCompScore,
        avgPotScore,
        tier,
        collaborators: items
      };
    });
  }, [collaborators]);

  // Métricas macro de resumen
  const summary = useMemo(() => {
    const cargosConEvaluados = cargoMetrics.filter(c => c.totalEvaluated > 0);
    const globalEvaluatedCount = cargoMetrics.reduce((a, b) => a + b.totalEvaluated, 0);
    const globalHeadcount = cargoMetrics.reduce((a, b) => a + b.totalCollabs, 0);

    const overallAverage = globalEvaluatedCount > 0
      ? Number((cargoMetrics.reduce((acc, c) => acc + (c.avgFinalScore * c.totalEvaluated), 0) / globalEvaluatedCount).toFixed(2))
      : 0;

    const highestCargo = cargosConEvaluados.length > 0
      ? [...cargosConEvaluados].sort((a, b) => b.avgFinalScore - a.avgFinalScore)[0]
      : null;

    const lowestCargo = cargosConEvaluados.length > 0
      ? [...cargosConEvaluados].sort((a, b) => a.avgFinalScore - b.avgFinalScore)[0]
      : null;

    return {
      globalEvaluatedCount,
      globalHeadcount,
      overallAverage,
      highestCargo,
      lowestCargo,
      totalCargos: OFFICIAL_ORGANIZATIONAL_STRUCTURE.length
    };
  }, [cargoMetrics]);

  // Datos formateados para el gráfico de barras
  const chartData = useMemo(() => {
    return cargoMetrics.map(c => ({
      name: c.shortLabel,
      fullName: c.label,
      promedio: c.avgFinalScore,
      promedioObj: Number(((c.avgObjScore / 100) * 5).toFixed(2)),
      promedioComp: c.avgCompScore,
      promedioPot: c.avgPotScore,
      evaluados: c.totalEvaluated,
      total: c.totalCollabs,
      cobertura: c.coveragePercent,
      color: c.badgeColor.barColor
    }));
  }, [cargoMetrics]);

  return (
    <div className="bg-white border-2 border-zinc-200 rounded-2xl p-5 shadow-xs space-y-6">
      {/* ── CABECERA PRINCIPAL ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-zinc-200 gap-3">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl bg-zinc-950 text-[#F1B400] font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
            <Briefcase size={18} />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-950">
                Promedio de Evaluación del Desempeño por Cargo
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-950 border border-amber-200">
                Estructura Organizacional (8 Niveles)
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Visualización jerárquica del promedio de desempeño institucional segmentado por cargo: Director, Gerente, Supervisor, Coordinador, Responsable, Especialista, Analista y Asesor/Operador Integral.
            </p>
          </div>
        </div>

        {/* Selector de Modo de Vista */}
        <div className="flex items-center gap-2 self-start lg:self-auto font-mono text-xs">
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] uppercase transition-all ${
                viewMode === 'cards'
                  ? 'bg-zinc-950 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Tarjetas Jerárquicas
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] uppercase transition-all ${
                viewMode === 'table'
                  ? 'bg-zinc-950 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Matriz Tabular
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI HIGHLIGHTS POR CARGO ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
          <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Estructura Total</span>
          <div className="text-xl font-mono font-black text-zinc-950">
            8 <span className="text-xs font-normal text-zinc-500">Cargos Oficiales</span>
          </div>
          <span className="text-[10px] text-zinc-500 block mt-0.5">100% Jerarquía contemplada</span>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
          <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">Promedio Global</span>
          <div className="text-xl font-mono font-black text-[#D99C00]">
            {summary.overallAverage > 0 ? summary.overallAverage.toFixed(2) : '—'} <span className="text-xs font-normal text-zinc-400">/ 5.00</span>
          </div>
          <span className="text-[10px] text-zinc-500 block mt-0.5">Población evaluada en filtro</span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <span className="text-[10px] text-emerald-800 font-mono uppercase block mb-1 flex items-center gap-1">
            <Award size={11} className="text-emerald-600" /> Mayor Promedio
          </span>
          <div className="text-sm font-black text-emerald-950 truncate">
            {summary.highestCargo ? summary.highestCargo.label : 'Sin datos'}
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-700 block mt-0.5">
            {summary.highestCargo ? `${summary.highestCargo.avgFinalScore.toFixed(2)} pts` : '—'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
          <span className="text-[10px] text-blue-800 font-mono uppercase block mb-1 flex items-center gap-1">
            <Target size={11} className="text-blue-600" /> Cobertura Total
          </span>
          <div className="text-xl font-mono font-black text-blue-950">
            {summary.globalEvaluatedCount} <span className="text-xs font-normal text-blue-700">/ {summary.globalHeadcount}</span>
          </div>
          <span className="text-[10px] text-blue-700 block mt-0.5 font-mono">
            {summary.globalHeadcount > 0 ? Math.round((summary.globalEvaluatedCount / summary.globalHeadcount) * 100) : 0}% de cobertura
          </span>
        </div>
      </div>

      {/* ── GRÁFICO COMPARATIVO DE BARRAS POR CARGO ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-zinc-200 gap-2">
          <div>
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
              <TrendingUp size={15} className="text-[#D99C00]" />
              Gráfico Comparativo: Rating Promedio por Cargo Estructural
            </h4>
            <p className="text-xs text-zinc-500 mt-0.5">
              Escala de calificación base 1.00 a 5.00 con línea de referencia en estándar meta (3.75 pts).
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#18181B]"></span> Estándar Meta: 3.75
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full bg-white rounded-xl border border-zinc-200 p-2 sm:p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 15, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9.5, fill: '#18181B', fontWeight: 700 }}
                interval={0}
                angle={-18}
                textAnchor="end"
              />
              <YAxis
                domain={[0, 5]}
                ticks={[1, 2, 3, 3.75, 4, 5]}
                tick={{ fontSize: 9, fill: '#71717A' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-zinc-950 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 font-sans border border-zinc-800">
                        <div className="font-black text-amber-400 text-xs uppercase tracking-wide border-b border-zinc-800 pb-1">
                          {data.fullName}
                        </div>
                        <div className="flex justify-between gap-4 pt-1 font-mono">
                          <span className="text-zinc-400">Rating Consolidado:</span>
                          <strong className="text-amber-400 font-bold">{data.promedio > 0 ? `${data.promedio.toFixed(2)} pts` : 'Pendiente'}</strong>
                        </div>
                        <div className="flex justify-between gap-4 font-mono text-[11px]">
                          <span className="text-zinc-400">1. Objetivos / KPI´s (60%):</span>
                          <span className="text-amber-200">{data.promedioObj > 0 ? `${data.promedioObj.toFixed(2)} pts` : '—'}</span>
                        </div>
                        <div className="flex justify-between gap-4 font-mono text-[11px]">
                          <span className="text-zinc-400">2. Competencias (30%):</span>
                          <span className="text-blue-200">{data.promedioComp > 0 ? `${data.promedioComp.toFixed(2)} pts` : '—'}</span>
                        </div>
                        <div className="flex justify-between gap-4 font-mono text-[11px]">
                          <span className="text-zinc-400">3. Potencial & Liderazgo (10%):</span>
                          <span className="text-purple-300 font-bold">{data.promedioPot > 0 ? `${data.promedioPot.toFixed(2)} pts` : '—'}</span>
                        </div>
                        <div className="flex justify-between gap-4 font-mono text-[10px] text-zinc-400 border-t border-zinc-800 pt-1">
                          <span>Evaluados:</span>
                          <span>{data.evaluados} de {data.total} ({data.cobertura}%)</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={3.75} stroke="#18181B" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: 'Meta: 3.75', position: 'insideTopRight', fill: '#18181B', fontSize: 10, fontWeight: 700 }} />
              <Bar dataKey="promedio" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.promedio >= 4.25 ? '#2563EB' : entry.promedio >= 3.75 ? '#F1B400' : entry.promedio > 0 ? '#64748B' : '#E2E8F0'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── MODO 1: TARJETAS JERÁRQUICAS (8 CARGOS EN ORDEN) ── */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider font-mono">
              Desglose Detallado por Cargo (Estructura Jerárquica 1 a 8)
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {cargoMetrics.length} Cargos Ordenados
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {cargoMetrics.map((cargo) => {
              const isExpanded = expandedCargo === cargo.key;
              const hasScore = cargo.avgFinalScore > 0;

              return (
                <div
                  key={cargo.key}
                  className={`rounded-2xl border-2 transition-all shadow-xs flex flex-col justify-between ${
                    hasScore
                      ? 'bg-white border-zinc-200 hover:border-zinc-300'
                      : 'bg-zinc-50/80 border-dashed border-zinc-300'
                  }`}
                >
                  {/* Encabezado de la Tarjeta */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-zinc-950 text-white">
                        #{cargo.order}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${cargo.tier.badgeBg}`}>
                        {cargo.tier.label}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase text-zinc-950 tracking-tight leading-tight">
                        {cargo.label}
                      </h4>
                      <span className="text-[10px] font-mono font-semibold text-zinc-500 block mt-0.5">
                        {cargo.levelBadge}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-500 leading-snug line-clamp-2">
                      {cargo.description}
                    </p>

                    {/* Calificación Central Promedio */}
                    <div className="pt-2 border-t border-zinc-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-zinc-400 block">Promedio Cargo:</span>
                        <div className="text-2xl font-mono font-black text-zinc-950 flex items-baseline gap-1">
                          {hasScore ? cargo.avgFinalScore.toFixed(2) : '—'}
                          <span className="text-xs font-normal text-zinc-400 font-mono">/ 5.00</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 block">Cobertura:</span>
                        <span className="text-xs font-mono font-bold text-zinc-800">
                          {cargo.totalEvaluated} / {cargo.totalCollabs} ({cargo.coveragePercent}%)
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progreso Visual */}
                    <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${hasScore ? (cargo.avgFinalScore / 5) * 100 : 0}%`,
                          backgroundColor: cargo.tier.color
                        }}
                      />
                    </div>

                    {/* Sub-métricas: KPIs, Competencias y Potencial */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono">
                      <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200">
                        <span className="text-[8.5px] text-zinc-500 block uppercase">1. KPIs (60%):</span>
                        <strong className="text-xs font-black text-zinc-900">
                          {hasScore && cargo.avgObjScore > 0 ? `${cargo.avgObjScore}%` : '—'}
                        </strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200">
                        <span className="text-[8.5px] text-zinc-500 block uppercase">2. Comp (30%):</span>
                        <strong className="text-xs font-black text-zinc-900">
                          {hasScore && cargo.avgCompScore > 0 ? `${cargo.avgCompScore.toFixed(2)}` : '—'}
                        </strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-purple-50/60 border border-purple-200">
                        <span className="text-[8.5px] text-purple-900 block uppercase font-bold">3. Pot (10%):</span>
                        <strong className="text-xs font-black text-purple-950">
                          {hasScore && cargo.avgPotScore > 0 ? `${cargo.avgPotScore.toFixed(2)}` : '—'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Pie de Tarjeta: Botón Ver Colaboradores */}
                  <div className="p-3 bg-zinc-50 border-t border-zinc-200 rounded-b-2xl">
                    <button
                      type="button"
                      onClick={() => setExpandedCargo(isExpanded ? null : cargo.key)}
                      className="w-full py-1.5 px-3 rounded-lg bg-white border border-zinc-300 hover:border-zinc-400 text-xs font-bold font-mono text-zinc-800 flex items-center justify-between transition-colors shadow-2xs"
                    >
                      <span>Colaboradores ({cargo.totalCollabs})</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {/* Desplegable de Nómina del Cargo */}
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-zinc-200 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {cargo.collaborators.length === 0 ? (
                          <div className="text-[11px] text-zinc-400 italic text-center py-2">
                            Sin colaboradores asignados en este filtro.
                          </div>
                        ) : (
                          cargo.collaborators.map(item => (
                            <div
                              key={item.id}
                              onClick={() => onSelectCollaborator && onSelectCollaborator(item.collabId || item.id)}
                              className="p-2 rounded-lg bg-white border border-zinc-200 hover:border-amber-400 hover:bg-amber-50/40 cursor-pointer transition-all flex items-center justify-between text-left"
                              title="Haga clic para ver el expediente individual de este colaborador"
                            >
                              <div className="truncate pr-2">
                                <span className="font-bold text-[11px] text-zinc-900 block truncate">
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-zinc-500 block truncate">
                                  {item.department}
                                </span>
                              </div>
                              <div className="shrink-0 text-right">
                                {item.isEvaluated ? (
                                  <span className="text-[11px] font-mono font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    {item.finalScore.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-mono text-zinc-400 bg-zinc-100 px-1 py-0.5 rounded">
                                    Pendiente
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODO 2: MATRIZ TABULAR COMPARATIVA ── */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-zinc-950 text-white font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3"># Jerarquía</th>
                <th className="p-3">Cargo Estructural</th>
                <th className="p-3 text-center">Headcount</th>
                <th className="p-3 text-center">Evaluados</th>
                <th className="p-3 text-center">Cobertura</th>
                <th className="p-3 text-right">Objetivos (60%)</th>
                <th className="p-3 text-right">Competencias (30%)</th>
                <th className="p-3 text-right">Potencial (10%)</th>
                <th className="p-3 text-right font-black text-[#F1B400]">Rating Total</th>
                <th className="p-3 text-center">Nivel Desempeño</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {cargoMetrics.map((cargo) => (
                <tr key={cargo.key} className="hover:bg-zinc-50 transition-colors font-medium">
                  <td className="p-3 font-mono font-black text-zinc-500">
                    Nivel {cargo.order}
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-zinc-950 block">{cargo.label}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{cargo.levelBadge}</span>
                  </td>
                  <td className="p-3 text-center font-mono font-semibold">{cargo.totalCollabs}</td>
                  <td className="p-3 text-center font-mono font-semibold text-emerald-700">{cargo.totalEvaluated}</td>
                  <td className="p-3 text-center font-mono">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800">
                      {cargo.coveragePercent}%
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-amber-800">
                    {cargo.avgObjScore > 0 ? `${cargo.avgObjScore}%` : '—'}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-blue-800">
                    {cargo.avgCompScore > 0 ? `${cargo.avgCompScore.toFixed(2)} pts` : '—'}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-purple-800">
                    {cargo.avgPotScore > 0 ? `${cargo.avgPotScore.toFixed(2)} pts` : '—'}
                  </td>
                  <td className="p-3 text-right font-mono font-black text-sm text-zinc-950">
                    {cargo.avgFinalScore > 0 ? `${cargo.avgFinalScore.toFixed(2)} pts` : '—'}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded text-[9.5px] font-mono font-bold border ${cargo.tier.badgeBg}`}>
                      {cargo.tier.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── NOTA METODOLÓGICA INSTITUCIONAL ── */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-start gap-2.5">
        <ShieldCheck size={16} className="text-[#D99C00] shrink-0 mt-0.5" />
        <div className="text-[11px] text-zinc-700 leading-relaxed">
          <span className="font-bold text-amber-950 block uppercase font-mono text-[10px]">
            Gobernanza de Calibración por Cargo (DTH-GFD-MC-01)
          </span>
          Los promedios por cargo integran el 60% de cumplimiento cuantitativo de metas (Sección 1) y el 40% de evaluación conductual multifuente de competencias (Sección 2). La segmentación respeta la escala jerárquica corporativa de 8 niveles de <strong>DISTRICUEROS EL CANGURO, C.A.</strong> y permite a la Dirección de Talento Humano identificar brechas por nivel de responsabilidad e intervenir con planes de desarrollo focalizados.
        </div>
      </div>
    </div>
  );
}

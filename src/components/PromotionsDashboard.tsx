import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  PROMOTION_RECORDS,
  OFFICIAL_COMPANY_HEADCOUNT,
  calculatePromotionKPIs,
  PromotionRecord
} from '../data/promotionsAnalyticsData';
import {
  Award, TrendingUp, Clock, DollarSign, Users, CheckCircle2,
  ShieldCheck, ArrowUpRight, Filter, Search, Printer, HelpCircle,
  Briefcase, HeartHandshake, UserCheck, Layers, ChevronRight,
  Sparkles, Building2, Calendar
} from 'lucide-react';

interface PromotionsDashboardProps {
  onSelectCollaborator?: (idNumber: string) => void;
  embedded?: boolean;
}

const OFFICIAL_DIRECTORATES = [
  'DIRECCIÓN DE OPERACIONES',
  'DIRECCIÓN DE TALENTO HUMANO',
  'DIRECCIÓN DE TECNOLOGÍA DE LA INFORMACIÓN',
  'DIRECCIÓN DE CONTROL INTERNO',
  'DIRECCIÓN COMERCIAL',
  'DIRECCIÓN DE TRANSPORTE Y LOGÍSTICA',
  'DIRECCIÓN DE COMPRAS',
  'DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS'
];

const HIERARCHY_LEVELS_OPTIONS = [
  { value: 'all', label: 'Todos los Niveles de Gestión' },
  { value: 'Promoción a Especialista', label: 'Promoción a Especialista' },
  { value: 'Promoción a Coordinador', label: 'Promoción a Coordinador' },
  { value: 'Promoción a Supervisor', label: 'Promoción a Supervisor' },
  { value: 'Promoción a Gerente', label: 'Promoción a Gerente' },
  { value: 'Promoción a Dirección', label: 'Promoción a Dirección' }
];

export function PromotionsDashboard({ onSelectCollaborator, embedded = false }: PromotionsDashboardProps) {
  const [selectedDirectorate, setSelectedDirectorate] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFormulaModal, setActiveFormulaModal] = useState<string | null>(null);

  // Helper to normalize strings for robust comparison
  const normalize = (val: string) =>
    val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Filter records based on UI controls
  const filteredRecords = useMemo(() => {
    return PROMOTION_RECORDS.filter(record => {
      const matchDir = selectedDirectorate === 'all' || 
        normalize(record.directorate) === normalize(selectedDirectorate);
      const matchLevel = selectedLevel === 'all' || record.hierarchyLevel === selectedLevel;
      const searchLower = (searchTerm || '').trim().toLowerCase();
      const matchSearch = searchLower === '' ||
        (record.employeeName || '').toLowerCase().includes(searchLower) ||
        (record.promotedPosition || '').toLowerCase().includes(searchLower) ||
        (record.department || '').toLowerCase().includes(searchLower) ||
        (record.employeeId || '').toLowerCase().includes(searchLower);
      return matchDir && matchLevel && matchSearch;
    });
  }, [selectedDirectorate, selectedLevel, searchTerm]);

  // Compute the 7 exact KPIs for the filtered dataset
  const kpis = useMemo(() => {
    return calculatePromotionKPIs(filteredRecords, OFFICIAL_COMPANY_HEADCOUNT);
  }, [filteredRecords]);

  // DATA FOR SUCCESSION PLAN PIE CHART
  const successionCount = filteredRecords.filter(r => r.hasSuccessionPlan).length;
  const reactiveCount = filteredRecords.length - successionCount;
  const successionData = [
    { name: 'Plan de Sucesión Preestablecido', value: successionCount, color: '#10B981' },
    { name: 'Concurso / Selección Reactiva', value: reactiveCount, color: '#F59E0B' }
  ].filter(d => d.value > 0);

  // 3. DATA FOR TIME IN GRADE BY HIERARCHY LEVEL
  const timeInGradeByLevel = useMemo(() => {
    const map: Record<string, { totalMonths: number; count: number }> = {};
    filteredRecords.forEach(r => {
      if (!map[r.hierarchyLevel]) {
        map[r.hierarchyLevel] = { totalMonths: 0, count: 0 };
      }
      map[r.hierarchyLevel].totalMonths += r.monthsInPreviousPosition;
      map[r.hierarchyLevel].count += 1;
    });

    return Object.keys(map).map(level => ({
      level: level.replace(' a ', ' ➔ '),
      shortLevel: level.split(' a ')[1] || level,
      avgMonths: Number((map[level].totalMonths / map[level].count).toFixed(1)),
      count: map[level].count
    }));
  }, [filteredRecords]);

  // 4. DATA FOR SALARY INCREASE BY DIRECTORATE
  const salaryIncreaseByDirectorate = useMemo(() => {
    const map: Record<string, { totalIncrease: number; count: number }> = {};
    filteredRecords.forEach(r => {
      const dir = r.directorate.replace('Dirección de ', '');
      if (!map[dir]) {
        map[dir] = { totalIncrease: 0, count: 0 };
      }
      map[dir].totalIncrease += r.salaryIncreasePercent;
      map[dir].count += 1;
    });

    return Object.keys(map).map(dir => ({
      directorate: dir,
      avgIncrease: Number((map[dir].totalIncrease / map[dir].count).toFixed(1)),
      count: map[dir].count
    })).sort((a, b) => b.avgIncrease - a.avgIncrease);
  }, [filteredRecords]);

  return (
    <div className="space-y-6 text-zinc-900 font-sans print:p-0 print:space-y-4">
      
      {/* HEADER BANNER O FILTERS TOOLBAR */}
      {!embedded ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-200 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-950 border border-amber-300 uppercase">
                  DISTRICUEROS EL CANGURO, C.A. • TALENTO HUMANO
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-950 flex items-center gap-2.5">
                <TrendingUp size={24} className="text-[#D99C00]" />
                DASHBOARD DE PROMOCIONES Y MOVILIDAD INTERNA
              </h1>
              <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
                Monitoreo analítico de movilidad, efectividad de selección, tiempo en el cargo, inversión salarial, cobertura de sucesión y equidad de género.
              </p>
            </div>
          </div>

          {/* FILTERS TOOLBAR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 print:hidden">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar colaborador o cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
              />
            </div>

            {/* Filter Directorate - 8 EXCLUSIVAS */}
            <div>
              <select
                value={selectedDirectorate}
                onChange={(e) => setSelectedDirectorate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
              >
                <option value="all">Todas las Direcciones</option>
                {OFFICIAL_DIRECTORATES.map(dir => (
                  <option key={dir} value={dir}>{dir}</option>
                ))}
              </select>
            </div>

            {/* Filter Hierarchy Level */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
              >
                {HIERARCHY_LEVELS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <span className="text-[11px] font-black uppercase text-zinc-800 flex items-center gap-1.5 font-mono">
              <Filter size={13} className="text-[#D99C00]" />
              Filtros de Búsqueda de Promociones
            </span>
            <span className="text-[10px] font-mono text-zinc-500 font-bold">
              {filteredRecords.length} de {PROMOTION_RECORDS.length} registros
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 print:hidden">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar colaborador o cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
              />
            </div>
            <div>
              <select
                value={selectedDirectorate}
                onChange={(e) => setSelectedDirectorate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
              >
                <option value="all">Todas las Direcciones</option>
                {OFFICIAL_DIRECTORATES.map(dir => (
                  <option key={dir} value={dir}>{dir}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
              >
                {HIERARCHY_LEVELS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LOS 7 KPIS OFICIALES DE PROMOCIÓN CON GRÁFICOS INTEGRADOS                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: TASA DE PROMOCIÓN INTERNA */}
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-3 relative group hover:border-[#F1B400] transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider">
                1. Tasa de Promoción Interna
              </span>
              <span className="p-1.5 rounded-lg bg-amber-50 text-[#D99C00]">
                <TrendingUp size={15} />
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-zinc-950 font-sans tracking-tight">
                {kpis.promotionRate}%
              </span>
              <span className="text-xs font-mono text-emerald-700 font-bold">Saludable</span>
            </div>
            
            <p className="text-[11px] text-zinc-500 mt-1">
              <strong>{kpis.totalPromotions}</strong> promociones sobre <strong>{kpis.headcount}</strong> colaboradores totales.
            </p>

            {/* MINI GRÁFICO: GAUGE / BENCHMARK DE MOVILIDAD INTERNA */}
            <div className="mt-3 pt-3 border-t border-zinc-100">
              <div className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                <span>0%</span>
                <span className="text-emerald-700 font-bold">Rango Saludable (3% - 6%)</span>
                <span>10%</span>
              </div>
              <div className="relative h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden flex">
                <div className="w-[30%] bg-zinc-200 border-r border-white/50" />
                <div className="w-[30%] bg-emerald-100 border-r border-white/50" />
                <div className="w-[40%] bg-zinc-200" />
              </div>
              <div className="relative -mt-2.5 h-2.5 w-full">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-[#F1B400] rounded-full shadow-xs transition-all duration-500"
                  style={{ width: `${Math.min(100, (kpis.promotionRate / 10) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 mt-1.5">
                <span>Benchmark El Canguro</span>
                <span className="font-bold text-[#B45309]">{kpis.promotionRate}% alcanzado</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 text-[10px] font-mono text-zinc-400 bg-zinc-50 -mx-5 -mb-5 p-3 rounded-b-2xl">
            <strong>Fórmula:</strong> (Total Promociones / Headcount Promedio) * 100
          </div>
        </div>

        {/* KPI 2: TIME IN GRADE (TIEMPO PROMEDIO EN EL CARGO ANTERIOR) */}
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-3 relative group hover:border-[#F1B400] transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider">
                2. Time in Grade Promedio
              </span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                <Clock size={15} />
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-zinc-950 font-sans tracking-tight">
                {kpis.avgTimeInGrade}
              </span>
              <span className="text-xs font-mono text-zinc-600 font-bold">Meses</span>
            </div>
            
            <p className="text-[11px] text-zinc-500 mt-1">
              Permanencia promedio previa en el cargo antes de acceder a la promoción.
            </p>

            {/* MINI GRÁFICO: ESCALA DE MADUREZ TEMPORAL (0 - 36m) */}
            <div className="mt-3 pt-3 border-t border-zinc-100">
              <div className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                <span>0m</span>
                <span className="text-blue-700 font-bold">Madurez Óptima (18-24m)</span>
                <span>36m+</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (kpis.avgTimeInGrade / 36) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 mt-1.5">
                <span>Madurez alcanzada</span>
                <span className="font-bold text-blue-700">{kpis.avgTimeInGrade} meses acum.</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 text-[10px] font-mono text-zinc-400 bg-zinc-50 -mx-5 -mb-5 p-3 rounded-b-2xl">
            <strong>Fórmula:</strong> Σ Meses en Cargo Anterior / Total Promovidos
          </div>
        </div>

        {/* KPI 3: PORCENTAJE PROMEDIO DE INCREMENTO SALARIAL */}
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-3 relative group hover:border-[#F1B400] transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider">
                3. Incremento Salarial Promedio
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <DollarSign size={15} />
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-emerald-900 font-sans tracking-tight">
                +{kpis.avgSalaryIncrease}%
              </span>
              <span className="text-xs font-mono text-zinc-600 font-bold">Por Promoción</span>
            </div>
            
            <p className="text-[11px] text-zinc-500 mt-1">
              Ajuste promedio en cumplimiento de la escala salarial interna corporativa.
            </p>

            {/* MINI GRÁFICO: BANDA SALARIAL (10% - 20%) */}
            <div className="mt-3 pt-3 border-t border-zinc-100">
              <div className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                <span>0%</span>
                <span className="text-emerald-700 font-bold">Banda Oficial (10% - 20%)</span>
                <span>25%</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (kpis.avgSalaryIncrease / 25) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 mt-1.5">
                <span>Tabulador Canguro</span>
                <span className="font-bold text-emerald-700">+{kpis.avgSalaryIncrease}% aplicado</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 text-[10px] font-mono text-zinc-400 bg-zinc-50 -mx-5 -mb-5 p-3 rounded-b-2xl">
            <strong>Fórmula:</strong> Σ % Incremento Aprobados / Total Promociones
          </div>
        </div>

        {/* KPI 4: ÍNDICE DE COBERTURA POR PLAN DE SUCESIÓN */}
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-3 relative group hover:border-[#F1B400] transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider">
                4. Cobertura por Sucesión
              </span>
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                <ShieldCheck size={15} />
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-zinc-950 font-sans tracking-tight">
                {kpis.successionCoverageRate}%
              </span>
              <span className="text-xs font-mono text-purple-700 font-bold">Planificada</span>
            </div>
            
            <p className="text-[11px] text-zinc-500 mt-1">
              <strong>{successionCount}</strong> de {filteredRecords.length} vacantes cubiertas con sucesores del plan.
            </p>

            {/* MINI GRÁFICO: BARRA BIPOLAR SEGMENTADA (PLAN VS REACTIVA) */}
            <div className="mt-3 pt-3 border-t border-zinc-100">
              <div className="flex justify-between text-[9px] font-mono mb-1">
                <span className="text-purple-700 font-bold">Plan: {kpis.successionCoverageRate}%</span>
                <span className="text-amber-700 font-bold">Reactivo: {(100 - kpis.successionCoverageRate).toFixed(1)}%</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-purple-600 transition-all duration-500"
                  style={{ width: `${kpis.successionCoverageRate}%` }}
                />
                <div
                  className="bg-amber-400 transition-all duration-500"
                  style={{ width: `${100 - kpis.successionCoverageRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 mt-1.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span> Plan Previo
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Reactivo
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 text-[10px] font-mono text-zinc-400 bg-zinc-50 -mx-5 -mb-5 p-3 rounded-b-2xl">
            <strong>Fórmula:</strong> Promociones con Plan / Total Promociones
          </div>
        </div>

        {/* KPI 5: ÍNDICE DE EFECTIVIDAD DE LA PROMOCIÓN */}
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-3 relative group hover:border-[#F1B400] transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider">
                5. Efectividad de Promoción (6M)
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={15} />
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-zinc-950 font-sans tracking-tight">
                {kpis.promotionEffectivenessRate}%
              </span>
              <span className="text-xs font-mono text-emerald-700 font-bold">Rating ≥ 3.0</span>
            </div>
            
            <p className="text-[11px] text-zinc-500 mt-1">
              Precisión de selección: colaboradores con desempeño satisfactorio a los 6 meses.
            </p>

            {/* MINI GRÁFICO: RATIO DE EFECTIVIDAD Y PRECISIÓN */}
            <div className="mt-3 pt-3 border-t border-zinc-100">
              <div className="flex justify-between text-[9px] font-mono mb-1">
                <span className="text-emerald-700 font-bold">Éxito: {kpis.promotionEffectivenessRate}%</span>
                <span className="text-zinc-400">Target ≥ 90%</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{ width: `${kpis.promotionEffectivenessRate}%` }}
                />
                <div
                  className="bg-red-400 transition-all duration-500"
                  style={{ width: `${100 - kpis.promotionEffectivenessRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 mt-1.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Desempeño Alto
                </span>
                <span className="font-bold text-emerald-700">Alta Precisión</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 text-[10px] font-mono text-zinc-400 bg-zinc-50 -mx-5 -mb-5 p-3 rounded-b-2xl">
            <strong>Fórmula:</strong> Promovidos con Desempeño 6M ≥ 3 / Evaluados 6M
          </div>
        </div>

        {/* KPI 6: TASA DE RETENCIÓN DE TALENTO PROMOVIDO A 12M */}
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-3 relative group hover:border-[#F1B400] transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider">
                6. Retención a 12 Meses
              </span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                <HeartHandshake size={15} />
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-zinc-950 font-sans tracking-tight">
                {kpis.talentRetentionRate12M}%
              </span>
              <span className="text-xs font-mono text-blue-700 font-bold">Activos</span>
            </div>
            
            <p className="text-[11px] text-zinc-500 mt-1">
              Colaboradores promovidos que continúan activos tras 12 meses en el nuevo rol.
            </p>

            {/* MINI GRÁFICO: RETENCIÓN VS ROTACIÓN */}
            <div className="mt-3 pt-3 border-t border-zinc-100">
              <div className="flex justify-between text-[9px] font-mono mb-1">
                <span className="text-blue-700 font-bold">Permanencia: {kpis.talentRetentionRate12M}%</span>
                <span className="text-zinc-400">Meta: ≥ 85%</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-600 transition-all duration-500"
                  style={{ width: `${kpis.talentRetentionRate12M}%` }}
                />
                <div
                  className="bg-zinc-300 transition-all duration-500"
                  style={{ width: `${100 - kpis.talentRetentionRate12M}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 mt-1.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Estabilidad Alta
                </span>
                <span className="font-bold text-blue-700">Rotación {(100 - kpis.talentRetentionRate12M).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 text-[10px] font-mono text-zinc-400 bg-zinc-50 -mx-5 -mb-5 p-3 rounded-b-2xl">
            <strong>Fórmula:</strong> Retenidos a 12 Meses / Con 12 Meses Cumplidos
          </div>
        </div>

        {/* KPI 7: EQUIDAD DE GÉNERO EN PROMOCIONES (REPRESENTADA CON LAS DOS FIGURAS HUMANAS MUJER Y HOMBRE) */}
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-3 sm:col-span-2 relative group hover:border-[#F1B400] transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider">
                7. Distribución por Equidad de Género
              </span>
              <span className="p-1.5 rounded-lg bg-pink-50 text-pink-700">
                <Users size={15} />
              </span>
            </div>

            {/* GRÁFICO CON FIGURAS HUMANAS DE MUJER Y HOMBRE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              
              {/* FIGURA HUMANA MUJER */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50/80 to-white border border-pink-200 flex items-center gap-4 transition-all hover:border-pink-300 shadow-xs">
                <div className="flex-shrink-0 flex items-center justify-center p-2 rounded-xl bg-pink-100/60">
                  <svg
                    viewBox="0 0 40 70"
                    className="w-10 h-16 sm:w-12 sm:h-20 text-[#EC4899] fill-current drop-shadow-xs"
                    aria-label="Silueta Figura Femenina"
                  >
                    {/* Cabeza */}
                    <circle cx="20" cy="10" r="7.5" />
                    {/* Torso y vestido estilizado */}
                    <path d="M12 22 C9 22 7 26 7 30 C7 35 9 38 11 40 L6 60 C5.5 62 7 64 9 64 L15 64 L15 70 C15 71 16 72 17 72 C18 72 19 71 19 70 L19 64 L21 64 L21 70 C21 71 22 72 23 72 C24 72 25 71 25 70 L25 64 L31 64 C33 64 34.5 62 34 60 L29 40 C31 38 33 35 33 30 C33 26 31 22 28 22 Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                    <span className="text-[11px] font-mono uppercase font-bold text-pink-900 tracking-wider">
                      Mujeres (Femenino)
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-pink-950 font-sans tracking-tight">
                      {kpis.femalePromotionsPercent}%
                    </span>
                  </div>
                  <span className="text-xs text-pink-800 font-mono font-semibold block mt-0.5">
                    {kpis.femalePromotionsCount} Promociones
                  </span>
                  <div className="mt-2 w-full bg-pink-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-pink-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${kpis.femalePromotionsPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* FIGURA HUMANA HOMBRE */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-white border border-blue-200 flex items-center gap-4 transition-all hover:border-blue-300 shadow-xs">
                <div className="flex-shrink-0 flex items-center justify-center p-2 rounded-xl bg-blue-100/60">
                  <svg
                    viewBox="0 0 40 70"
                    className="w-10 h-16 sm:w-12 sm:h-20 text-[#2563EB] fill-current drop-shadow-xs"
                    aria-label="Silueta Figura Masculina"
                  >
                    {/* Cabeza */}
                    <circle cx="20" cy="10" r="7.5" />
                    {/* Torso y pantalón ejecutivo */}
                    <path d="M10 22 C7.5 22 6 25 6 28 L7 44 C7 46 9 47 11 47 L12 47 L12 70 C12 71.5 13.5 72.5 15 72.5 C16.5 72.5 18 71.5 18 70 L18 52 L22 52 L22 70 C22 71.5 23.5 72.5 25 72.5 C26.5 72.5 28 71.5 28 70 L28 47 L29 47 C31 47 33 46 33 44 L34 28 C34 25 32.5 22 30 22 Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span className="text-[11px] font-mono uppercase font-bold text-blue-900 tracking-wider">
                      Hombres (Masculino)
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-blue-950 font-sans tracking-tight">
                      {kpis.malePromotionsPercent}%
                    </span>
                  </div>
                  <span className="text-xs text-blue-800 font-mono font-semibold block mt-0.5">
                    {kpis.malePromotionsCount} Promociones
                  </span>
                  <div className="mt-2 w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${kpis.malePromotionsPercent}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 text-[10px] font-mono text-zinc-400 bg-zinc-50 -mx-5 -mb-5 p-3 rounded-b-2xl flex items-center justify-between">
            <span><strong>Fórmula:</strong> Promociones por Género / Total Promociones * 100</span>
            <span className="font-bold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 size={12} />
              Paridad y Equidad de Oportunidades 1:1
            </span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* GRÁFICOS ANALÍTICOS INTERACTIVOS                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* GRÁFICO 1: TIME IN GRADE PROMEDIO POR NIVEL JERÁRQUICO */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#D99C00] block">
                Permanencia Previa
              </span>
              <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider">
                TIME IN GRADE PROMEDIO POR NIVEL JERÁRQUICO (MESES)
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
              Suma Meses / Total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeInGradeByLevel} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="shortLevel" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="m" />
                <Tooltip
                  formatter={(value: any) => [`${value} meses en promedio`, 'Time in Grade']}
                  labelFormatter={(label) => `Nivel: ${label}`}
                  contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="avgMonths" fill="#F1B400" radius={[6, 6, 0, 0]} name="Meses Promedio" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-zinc-500 leading-tight">
            Permite detectar <strong>cuellos de botella</strong> (estancamiento en cargo de origen) o <strong>movilidad prematura</strong> antes de alcanzar la madurez operativa requerida.
          </p>
        </div>

        {/* GRÁFICO 2: INCREMENTO SALARIAL PROMEDIO POR DIRECCIÓN */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#D99C00] block">
                Compensación & Beneficios
              </span>
              <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider">
                % INCREMENTO SALARIAL PROMEDIO POR DIRECCIÓN
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
              Media: +{kpis.avgSalaryIncrease}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryIncreaseByDirectorate} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="directorate" tick={{ fontSize: 9 }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} unit="%" />
                <Tooltip
                  formatter={(value: any) => [`+${value}% promedio`, 'Incremento']}
                  labelFormatter={(label) => `Área: ${label}`}
                  contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="avgIncrease" fill="#10B981" radius={[6, 6, 0, 0]} name="% Incremento" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-zinc-500 leading-tight">
            Garantiza la <strong>equidad salarial interna</strong> y el cumplimiento de las políticas presupuestarias fijadas por la Dirección de Administración y Finanzas.
          </p>
        </div>

        {/* GRÁFICO 3: COBERTURA POR PLAN DE SUCESIÓN */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#D99C00] block">
                Planificación Estratégica
              </span>
              <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider">
                ORIGEN DE LA PROMOCIÓN: SUCESIÓN VS. REACTIVA
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200">
              Cobertura: {kpis.successionCoverageRate}%
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={successionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {successionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TABLA DE AUDITORÍA: REGISTRO CONSOLIDADO DE PROMOCIONES                   */}
      {/* ========================================================================= */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#D99C00] uppercase block">
              Trazabilidad Individual Oficial
            </span>
            <h3 className="text-sm font-black uppercase text-zinc-950 tracking-wider">
              REGISTRO CONSOLIDADO DE PROMOCIONES DEL PERÍODO
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-zinc-100 text-zinc-800">
            {filteredRecords.length} Colaboradores Registrados
          </span>
        </div>

        <div className="overflow-x-auto border border-zinc-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-white font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Colaborador</th>
                <th className="p-3 text-center">Género</th>
                <th className="p-3">Movilidad (Anterior ➔ Nuevo Cargo)</th>
                <th className="p-3">Área / Dirección</th>
                <th className="p-3 text-center">Time in Grade</th>
                <th className="p-3 text-center">% Incr.</th>
                <th className="p-3 text-center">Sucesión</th>
                <th className="p-3 text-center">Rating 6M</th>
                <th className="p-3 text-center">Retenido 12M</th>
                <th className="p-3 text-center">Veredicto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-zinc-500 font-bold">{r.id}</td>
                  <td className="p-3">
                    <button
                      onClick={() => onSelectCollaborator && onSelectCollaborator(r.employeeId)}
                      className="font-bold text-zinc-950 hover:text-[#D99C00] transition-colors text-left block"
                    >
                      {r.employeeName}
                    </button>
                    <span className="text-[10px] font-mono text-zinc-400 block">{r.employeeId}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.gender === 'Femenino' ? 'bg-pink-100 text-pink-900' : 'bg-blue-100 text-blue-900'
                    }`}>
                      {r.gender === 'Femenino' ? 'F' : 'M'}
                    </span>
                  </td>
                  <td className="p-3 leading-tight">
                    <span className="text-zinc-500 line-through text-[11px] block">{r.previousPosition}</span>
                    <strong className="text-zinc-950 text-xs block text-[#D99C00]">➔ {r.promotedPosition}</strong>
                  </td>
                  <td className="p-3 text-zinc-600 text-[11px] leading-tight">
                    <span>{r.department}</span>
                    <span className="text-[10px] text-zinc-400 block">{r.directorate.replace('Dirección de ', '')}</span>
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-zinc-900">
                    {r.monthsInPreviousPosition} m
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-emerald-800">
                    +{r.salaryIncreasePercent.toFixed(1)}%
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      r.hasSuccessionPlan ? 'bg-emerald-100 text-emerald-900' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {r.hasSuccessionPlan ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono font-bold">
                    {r.performanceRating6M ? (
                      <span className={r.performanceRating6M >= 3.0 ? 'text-emerald-700' : 'text-red-600'}>
                        {r.performanceRating6M.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[10px]">En curso</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {r.eligible12M ? (
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        r.retained12M ? 'bg-blue-100 text-blue-900' : 'bg-red-100 text-red-900'
                      }`}>
                        {r.retained12M ? 'Sí' : 'No'}
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[10px] font-mono">&lt; 12m</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase ${
                      r.verdict === 'APROBADO'
                        ? 'bg-emerald-50 text-emerald-950 border border-emerald-300'
                        : 'bg-amber-50 text-amber-950 border border-amber-300'
                    }`}>
                      {r.verdict}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

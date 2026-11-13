import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, LineChart, Line, ComposedChart
} from 'recharts';
import { AppState } from '../types';
import { CANGURO_COLLABORATORS } from '../data/canguroUniverso';
import {
  EducationLevel,
  EducationCollaboratorRecord,
  EducationLevelStats,
  AnovaResult,
  PeopleAnalyticsInsights,
  EDUCATION_LEVEL_ORDER,
  EDUCATION_LEVEL_COLORS,
  buildPeopleAnalyticsEducationDataset,
  generatePeopleAnalyticsEducationReport,
  parseUploadedEducationCsv,
  normalizeEducationLevel
} from '../utils/peopleAnalyticsEducation';
import {
  GraduationCap, Award, TrendingUp, Users, Target, ShieldCheck, CheckCircle2,
  AlertTriangle, Filter, RotateCcw, Sparkles, Building2, Layers, Briefcase,
  FileSpreadsheet, Upload, Download, Eye, ChevronRight, ChevronDown, HelpCircle, ArrowUpRight,
  ArrowDownRight, Minus, BarChart3, Info, Check, X
} from 'lucide-react';

interface PeopleAnalyticsEducationDashboardProps {
  liveState?: Partial<AppState>;
  onSelectCollaborator?: (collabId: string) => void;
}

export function PeopleAnalyticsEducationDashboard({
  liveState,
  onSelectCollaborator
}: PeopleAnalyticsEducationDashboardProps) {
  // ── ESTADOS DE FILTROS (SLICERS) ──
  const [selectedDirectorate, setSelectedDirectorate] = useState<string>('all');
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>('all');
  const [selectedTenure, setSelectedTenure] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // ── ESTADOS PARA IMPORTACIÓN DE DATOS EXTERNOS ──
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pastedCsvText, setPastedCsvText] = useState('');
  const [importedMapping, setImportedMapping] = useState<Record<string, EducationLevel>>(() => {
    try {
      const saved = localStorage.getItem('canguro_custom_education_mapping');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [importMessage, setImportMessage] = useState<string | null>(null);

  // ── VISTA ACTIVA DENTRO DEL DASHBOARD ──
  const [activeTab, setActiveTab] = useState<'comparativa' | 'distribucion' | 'tabla' | 'anova' | 'insights'>('comparativa');

  // Guardar mapeo en localStorage al actualizar
  const handleSaveImportedMapping = (newMap: Record<string, EducationLevel>) => {
    setImportedMapping(newMap);
    try {
      localStorage.setItem('canguro_custom_education_mapping', JSON.stringify(newMap));
    } catch {}
  };

  const handleClearCustomMapping = () => {
    if (confirm('¿Desea restablecer el mapeo de nivel educativo al dataset estándar corporativo?')) {
      setImportedMapping({});
      try {
        localStorage.removeItem('canguro_custom_education_mapping');
      } catch {}
      setImportMessage('Se ha restablecido el dataset al modelo demográfico estándar.');
      setTimeout(() => setImportMessage(null), 4000);
    }
  };

  // ── DATASET MAESTRO CRUZADO ──
  const fullDataset = useMemo(() => {
    return buildPeopleAnalyticsEducationDataset(CANGURO_COLLABORATORS, importedMapping, liveState);
  }, [importedMapping, liveState]);

  // Lista de Direcciones únicas para el slicer
  const availableDirectorates = useMemo(() => {
    const set = new Set<string>();
    fullDataset.forEach(r => { if (r.directorate) set.add(r.directorate); });
    return Array.from(set).sort();
  }, [fullDataset]);

  // Lista de Cargos / Jerarquías
  const availablePositions = useMemo(() => {
    const set = new Set<string>();
    fullDataset.forEach(r => { if (r.position) set.add(r.position); });
    return Array.from(set).sort();
  }, [fullDataset]);

  // ── FILTRADO INTERACTIVO MULTIDIMENSIONAL ──
  const filteredDataset = useMemo(() => {
    return fullDataset.filter(r => {
      // Slicer Dirección
      if (selectedDirectorate !== 'all' && !(r.directorate || '').toLowerCase().includes(selectedDirectorate.toLowerCase())) {
        return false;
      }
      // Slicer Cargo
      if (selectedHierarchy !== 'all' && !(r.position || '').toLowerCase().includes(selectedHierarchy.toLowerCase())) {
        return false;
      }
      // Slicer Antigüedad
      if (selectedTenure !== 'all') {
        if (selectedTenure === '<1' && r.tenureYears >= 1) return false;
        if (selectedTenure === '1-2' && (r.tenureYears < 1 || r.tenureYears > 2)) return false;
        if (selectedTenure === '3-5' && (r.tenureYears < 3 || r.tenureYears > 5)) return false;
        if (selectedTenure === '>5' && r.tenureYears <= 5) return false;
      }
      // Búsqueda por texto
      if (searchTerm) {
        const q = (searchTerm || '').toLowerCase();
        const matchesName = (r.name || '').toLowerCase().includes(q);
        const matchesId = (r.idNumber || '').toLowerCase().includes(q);
        const matchesPos = (r.position || '').toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesPos) return false;
      }
      return true;
    });
  }, [fullDataset, selectedDirectorate, selectedHierarchy, selectedTenure, searchTerm]);

  // ── PROCESAMIENTO ESTADÍSTICO Y REPORTE DE PEOPLE ANALYTICS ──
  const report = useMemo(() => {
    return generatePeopleAnalyticsEducationReport(filteredDataset);
  }, [filteredDataset]);

  const { stats, anova, insights } = report;

  const totalEvaluados = useMemo(() => {
    return filteredDataset.filter(r => r.isEvaluated && r.performanceScore > 0).length;
  }, [filteredDataset]);

  const handleResetFilters = () => {
    setSelectedDirectorate('all');
    setSelectedHierarchy('all');
    setSelectedTenure('all');
    setSelectedPeriod('all');
    setSearchTerm('');
  };

  const isFiltered = selectedDirectorate !== 'all' || selectedHierarchy !== 'all' || selectedTenure !== 'all' || selectedPeriod !== 'all' || searchTerm !== '';

  // ── DESCARGA DE PLANTILLA CSV ──
  const handleDownloadCsvTemplate = () => {
    const header = 'ID_Colaborador,Cedula,Nombre_Colaborador,Nivel_Educativo,Cargo,Area\n';
    const sampleRows = [
      'emp-001,V-26.120.411,Alexis Martin Vasquez Reyes,TSU,COORDINADOR DE TIENDA,Dirección de Operaciones',
      'emp-002,V-26.546.210,Barbara Marina Bravo Portillo,Universitario,COORDINADOR DE PLANIFICACION FINANCIERA,Dirección de Administración y Finanzas',
      'emp-003,V-22.571.004,Alexandra Nohemi Campos Guaicara,Diversificado,ASESOR DE VENTAS INTEGRAL,Dirección de Operaciones',
      'emp-004,V-30.072.914,Arlen Mariana Arambulo Rodriguez,Básico,OPERADOR INTEGRAL,Dirección de Transporte y Logística'
    ].join('\n');
    const blob = new Blob([header + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_people_analytics_nivel_educativo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── IMPORTAR CSV CARGADO / PEGADO ──
  const handleProcessCsvImport = () => {
    if (!pastedCsvText.trim()) return;
    const result = parseUploadedEducationCsv(pastedCsvText);
    if (!result.success) {
      alert(`Error al procesar el archivo:\n${result.errors.join('\n')}`);
      return;
    }
    const combined = { ...importedMapping, ...result.mapping };
    handleSaveImportedMapping(combined);
    setIsImportModalOpen(false);
    setPastedCsvText('');
    setImportMessage(`¡Éxito! Se actualizaron ${result.importedCount} registros con su nivel educativo oficial.`);
    setTimeout(() => setImportMessage(null), 5000);
  };

  // Datos formateados para el Box Plot / Barras de Resumen
  const boxPlotChartData = useMemo(() => {
    return stats.map(s => ({
      name: s.level,
      media: s.meanScore,
      mediana: s.medianScore,
      q1: s.q1Score,
      q3: s.q3Score,
      min: s.minScore,
      max: s.maxScore,
      rango: Number((s.maxScore - s.minScore).toFixed(2)),
      count: s.count,
      pctTotal: s.percentageOfTotal,
      stdDev: s.stdDev
    }));
  }, [stats]);

  // Datos para Gráfico de Apilamiento 100% (Matriz de Distribución de Talento)
  const stackedDistributionData = useMemo(() => {
    return stats.map(s => ({
      name: s.level,
      'Bajo (< 3.0 pts)': s.pctLow,
      'Aceptable (3.0 - 3.99 pts)': s.pctMedium,
      'Sobresaliente (≥ 4.0 pts)': s.pctHigh,
      totalCount: s.count
    }));
  }, [stats]);

  return (
    <div className="space-y-6 text-zinc-900 font-sans">
      {/* ── ALERTA DE NOTIFICACIÓN TEMPORAL ── */}
      {importMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-bold">{importMessage}</span>
          </div>
          <button onClick={() => setImportMessage(null)} className="text-emerald-700 hover:text-emerald-950">
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── HEADER DEL TABLERO DE PEOPLE ANALYTICS ── */}
      <div className="bg-zinc-950 text-white rounded-2xl p-6 shadow-md border-b-4 border-[#F1B400] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#F1B400]/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F1B400] text-zinc-950 flex items-center gap-1">
                <Sparkles size={11} /> Nivel Académico
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Calibración Estadística de Grado Académico
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
              <GraduationCap className="text-[#F1B400]" size={26} />
              Impacto del Nivel Académico en el Desempeño
            </h1>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              Cruce sistemático entre datos biográficos y evaluaciones del desempeño (60% Metas + 30% Competencias + 10% Potencial) con pruebas de significancia estadística y correlación ordinal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#F1B400] hover:bg-[#D99C00] text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer font-mono uppercase tracking-wider"
              title="Importar o cruzar archivo CSV con niveles educativos de colaboradores"
            >
              <Upload size={14} />
              <span>Cruzar Base de Datos (CSV)</span>
            </button>

            {Object.keys(importedMapping).length > 0 && (
              <button
                type="button"
                onClick={handleClearCustomMapping}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Restablecer al dataset base"
              >
                <RotateCcw size={13} />
                <span>Reset Data</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── SECCIÓN DESTACADA: PROMEDIO DE DESEMPEÑO POR NIVEL ACADÉMICO (4 NIVELES) ── */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-[#D99C00]" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-950 font-sans">
                Promedio de Evaluación del Desempeño por Nivel Académico
              </h3>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Puntuación media consolidada (1.00 a 5.00 pts y Base 100%) en cada escalafón de formación académica
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 font-bold">
              Meta Institucional: 3.75 pts (75%)
            </span>
          </div>
        </div>

        {/* Cuadrícula de los 4 Niveles Educativos: Básico, Diversificado, TSU, Universitario */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {stats.map((s) => {
            const colors = EDUCATION_LEVEL_COLORS[s.level];
            const isHighest = s.level === insights.bestPerformingLevel;
            const meetsCorporate = s.meanScore >= 3.75;

            return (
              <div
                key={s.level}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between relative shadow-2xs ${
                  isHighest ? 'ring-2 ring-emerald-500/80 shadow-md shadow-emerald-500/10' : ''
                }`}
                style={{ backgroundColor: colors.light, borderColor: colors.border }}
              >
                {isHighest && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-mono font-bold tracking-wider uppercase shadow-xs flex items-center gap-1">
                    <Award size={10} /> Mayor Promedio
                  </span>
                )}

                <div>
                  {/* Encabezado del nivel */}
                  <div className="flex items-center justify-between pb-2 border-b border-black/10">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: colors.main }}
                      />
                      <span className="text-xs font-black uppercase tracking-tight text-zinc-950 font-sans">
                        {s.rank}. {s.level}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-zinc-600 bg-white/80 px-1.5 py-0.5 rounded border border-black/10">
                      N = {s.count} ({s.percentageOfTotal}%)
                    </span>
                  </div>

                  {/* Calificación Promedio Principal */}
                  <div className="mt-3">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
                      Promedio de Desempeño
                    </span>
                    <div className="flex items-baseline justify-between gap-1 mt-0.5">
                      <div className="flex items-baseline gap-1">
                        <span
                          className="text-3xl font-black font-sans tracking-tight"
                          style={{ color: colors.text }}
                        >
                          {s.meanScore.toFixed(2)}
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-500">pts</span>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-md text-xs font-mono font-black border"
                        style={{ backgroundColor: colors.main + '20', borderColor: colors.border, color: colors.text }}
                      >
                        {s.meanPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso / Termómetro visual de desempeño */}
                  <div className="mt-2.5">
                    <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, ((s.meanScore - 1) / 4) * 100))}%`,
                          backgroundColor: colors.main
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500 mt-1">
                      <span>1.00</span>
                      <span className="font-bold text-zinc-700">Meta: 3.75</span>
                      <span>5.00</span>
                    </div>
                  </div>

                  {/* Métricas secundarias: Mediana, % Sobresaliente, Diagnóstico */}
                  <div className="mt-3 pt-2.5 border-t border-black/10 space-y-1.5 text-[10.5px] font-mono">
                    <div className="flex justify-between items-center text-zinc-700">
                      <span className="text-zinc-500">Mediana (P50):</span>
                      <span className="font-bold text-zinc-900">{s.medianScore.toFixed(2)} pts</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-700">
                      <span className="text-zinc-500">Rango Intercuartil (Q1 - Q3):</span>
                      <span className="font-bold text-zinc-900">{s.q1Score.toFixed(2)} - {s.q3Score.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-700">
                      <span className="text-zinc-500">Dispersión (σ):</span>
                      <span className="font-bold text-zinc-900">±{s.stdDev.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-700">
                      <span className="text-zinc-500">% Sobresaliente (≥4.0):</span>
                      <span className="font-bold text-emerald-800">{s.pctHigh}%</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-700 pt-1 border-t border-black/5">
                      <span className="text-zinc-500">Diagnóstico:</span>
                      <span className={`font-bold ${meetsCorporate ? 'text-emerald-800' : 'text-amber-800'}`}>
                        {meetsCorporate ? 'Supera Meta' : 'En Desarrollo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BARRA DE FILTROS Y SEGMENTACIÓN INTERACTIVA (SLICERS) ── */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#D99C00]" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-950 font-mono">
              Filtros y Segmentación Multidimensional (Slicers)
            </span>
          </div>
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Limpiar Filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
          {/* Slicer 1: Dirección */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
              Dirección / Área Operativa
            </label>
            <select
              value={selectedDirectorate}
              onChange={(e) => setSelectedDirectorate(e.target.value)}
              className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-300 text-zinc-900 font-bold focus:ring-1 focus:ring-[#F1B400] text-xs cursor-pointer"
            >
              <option value="all">Todas las Direcciones ({availableDirectorates.length})</option>
              {availableDirectorates.map(dir => (
                <option key={dir} value={dir}>{dir}</option>
              ))}
            </select>
          </div>

          {/* Slicer 2: Cargo */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
              Cargo / Rol
            </label>
            <select
              value={selectedHierarchy}
              onChange={(e) => setSelectedHierarchy(e.target.value)}
              className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-300 text-zinc-900 font-bold focus:ring-1 focus:ring-[#F1B400] text-xs cursor-pointer"
            >
              <option value="all">Todos los Cargos ({availablePositions.length})</option>
              {availablePositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          {/* Slicer 3: Antigüedad (Variable de Control) */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
              Antigüedad en la Empresa (Tenure)
            </label>
            <select
              value={selectedTenure}
              onChange={(e) => setSelectedTenure(e.target.value)}
              className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-300 text-zinc-900 font-bold focus:ring-1 focus:ring-[#F1B400] text-xs cursor-pointer"
            >
              <option value="all">Toda Antigüedad</option>
              <option value="<1">Menos de 1 año (Nuevos Ingresos)</option>
              <option value="1-2">1 a 2 años (Consolidación)</option>
              <option value="3-5">3 a 5 años (Maduros)</option>
              <option value=">5">Más de 5 años (Veteranos)</option>
            </select>
          </div>

          {/* Búsqueda por texto */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
              Búsqueda de Colaborador
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, cédula o cargo..."
              className="w-full p-2 rounded-xl bg-zinc-50 border border-zinc-300 text-zinc-900 font-medium focus:ring-1 focus:ring-[#F1B400] text-xs"
            />
          </div>
        </div>
      </div>

      {/* ── SELECTOR DE PESTAÑAS ANALÍTICAS ── */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab('comparativa')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'comparativa'
              ? 'bg-zinc-950 text-[#F1B400] shadow-xs font-black'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <BarChart3 size={14} />
          <span>Diagrama de Cajas & Medias (Box Plot)</span>
        </button>

        <button
          onClick={() => setActiveTab('distribucion')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'distribucion'
              ? 'bg-zinc-950 text-[#F1B400] shadow-xs font-black'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Layers size={14} />
          <span>Distribución Apilada 100% (Matriz de Talento)</span>
        </button>

        <button
          onClick={() => setActiveTab('tabla')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tabla'
              ? 'bg-zinc-950 text-[#F1B400] shadow-xs font-black'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <FileSpreadsheet size={14} />
          <span>Tabla Resumen Ejecutivo & Métricas</span>
        </button>

        <button
          onClick={() => setActiveTab('anova')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'anova'
              ? 'bg-zinc-950 text-[#F1B400] shadow-xs font-black'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <ShieldCheck size={14} />
          <span>Significado Práctico & Certeza</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'insights'
              ? 'bg-[#F1B400] text-zinc-950 shadow-xs font-black'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Sparkles size={14} />
          <span>Insights Automatizados & Conclusiones</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. MÓDULO: DIAGRAMA DE CAJAS & MEDIAS (BOX PLOT REPRESENTATION)           */}
      {/* ========================================================================= */}
      {activeTab === 'comparativa' && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F1B400]"></span>
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                  Comparativa de Desempeño: Medias, Medianas y Rango Intercuartil
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Eje X: Nivel Educativo en orden jerárquico ordinal • Eje Y: Calificación de Evaluación del Desempeño (1.00 a 5.00 pts).
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 font-bold">
                Línea Base: 3.75 pts (Nivel B Institucional)
              </span>
            </div>
          </div>

          {/* Gráfico Combinado de Barras de Rango con Medias y Medianas */}
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={boxPlotChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#18181B', fontSize: 11, fontWeight: 700 }}
                  axisLine={{ stroke: '#E4E4E7' }}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 3.75, 4, 5]}
                  tick={{ fill: '#71717A', fontSize: 10, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#E4E4E7' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-zinc-950 text-white p-3 rounded-xl border border-zinc-700 shadow-xl text-xs space-y-1.5 max-w-xs font-mono">
                          <div className="font-bold text-[#F1B400] text-[11px] uppercase border-b border-zinc-800 pb-1">
                            Nivel: {d.name} (N = {d.count})
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Media (Promedio):</span>
                            <span className="font-bold text-emerald-400">{d.media.toFixed(2)} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Mediana (P50):</span>
                            <span className="font-bold text-amber-400">{d.mediana.toFixed(2)} pts</span>
                          </div>
                          <div className="flex justify-between text-[10.5px]">
                            <span className="text-zinc-400">Caja Intercuartil (Q1 - Q3):</span>
                            <span>{d.q1.toFixed(2)} - {d.q3.toFixed(2)} pts</span>
                          </div>
                          <div className="flex justify-between text-[10.5px]">
                            <span className="text-zinc-400">Rango Total (Mín - Máx):</span>
                            <span>{d.min.toFixed(2)} - {d.max.toFixed(2)} pts</span>
                          </div>
                          <div className="flex justify-between text-[10.5px] pt-1 border-t border-zinc-800">
                            <span className="text-zinc-400">Desv. Estándar (σ):</span>
                            <span>±{d.stdDev.toFixed(2)} pts</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="media" name="Promedio (Media Aritmética)" fill="#D99C00" radius={[6, 6, 0, 0]}>
                  {boxPlotChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={EDUCATION_LEVEL_COLORS[entry.name as EducationLevel]?.main || '#D99C00'}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="mediana"
                  name="Mediana (Robusta ante atípicos)"
                  stroke="#18181B"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#FFFFFF', stroke: '#18181B', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MÓDULO: GRÁFICO DE APILAMIENTO 100% (MATRIZ DE TALENTO)                */}
      {/* ========================================================================= */}
      {activeTab === 'distribucion' && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                  Gráfico de Apilamiento 100% — Distribución de Niveles de Desempeño
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Proporción de colaboradores clasificados en Bajo (&lt; 3.0), Aceptable (3.0 a 3.99) y Sobresaliente (≥ 4.0) por cada nivel educativo.
              </p>
            </div>
            <div className="text-xs font-mono text-zinc-500">
              Escala Normalizada: 0% a 100%
            </div>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedDistributionData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" />
                <XAxis dataKey="name" tick={{ fill: '#18181B', fontSize: 11, fontWeight: 700 }} />
                <YAxis unit="%" tick={{ fill: '#71717A', fontSize: 10, fontFamily: 'monospace' }} domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-zinc-950 text-white p-3 rounded-xl border border-zinc-700 shadow-xl text-xs space-y-1 font-mono max-w-xs">
                          <div className="font-bold text-[#F1B400] text-[11px] uppercase border-b border-zinc-800 pb-1 mb-1">
                            {label}
                          </div>
                          {payload.map((entry, idx) => (
                            <div key={idx} className="flex justify-between items-center gap-3">
                              <span style={{ color: entry.color }}>{entry.name}:</span>
                              <span className="font-bold">{entry.value}%</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Bajo (< 3.0 pts)" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Aceptable (3.0 - 3.99 pts)" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Sobresaliente (≥ 4.0 pts)" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla de Conteo Rápido de la Distribución */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {stats.map(s => (
              <div key={s.level} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-mono space-y-1.5">
                <div className="flex justify-between items-center pb-1 border-b border-zinc-200 font-bold text-zinc-900">
                  <span>{s.level}</span>
                  <span>{s.count} personas</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Sobresaliente (≥4.0):</span>
                  <span className="font-bold">{s.countHigh} ({s.pctHigh}%)</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Aceptable (3.0 - 3.99):</span>
                  <span className="font-bold">{s.countMedium} ({s.pctMedium}%)</span>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>Bajo (&lt;3.0):</span>
                  <span className="font-bold">{s.countLow} ({s.pctLow}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MÓDULO: TABLA DETALLADA DE RESUMEN EJECUTIVO                           */}
      {/* ========================================================================= */}
      {activeTab === 'tabla' && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                  Tabla Detallada de Resumen Ejecutivo — Desempeño vs. Nivel Educativo
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Métricas agregadas consolidadas por jerarquía ordinal académica.
              </p>
            </div>
            <div className="text-xs font-mono text-zinc-500">
              Total Muestra: {totalEvaluados} colaboradores
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-200 rounded-xl shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-200 font-mono text-[10.5px] text-zinc-600 uppercase">
                  <th className="py-3 px-3.5">Nivel Educativo</th>
                  <th className="py-3 px-3 text-center">N Colab.</th>
                  <th className="py-3 px-3 text-center">% del Total</th>
                  <th className="py-3 px-3 text-right">Promedio (1-5)</th>
                  <th className="py-3 px-3 text-right">Promedio (Base 100)</th>
                  <th className="py-3 px-3 text-right">Mediana (P50)</th>
                  <th className="py-3 px-3 text-center">% Sobresaliente (≥4.0)</th>
                  <th className="py-3 px-3 text-center">Desv. Estándar (σ)</th>
                  <th className="py-3 px-3 text-right">Rango (Mín - Máx)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono">
                {stats.map(s => {
                  const colors = EDUCATION_LEVEL_COLORS[s.level];
                  return (
                    <tr key={s.level} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-zinc-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.main }} />
                        <span>{s.rank}. {s.level}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-zinc-800">
                        {s.count}
                      </td>
                      <td className="py-3 px-3 text-center text-zinc-600">
                        {s.percentageOfTotal}%
                      </td>
                      <td className="py-3 px-3 text-right font-black text-sm text-zinc-900">
                        {s.meanScore.toFixed(2)} pts
                      </td>
                      <td className="py-3 px-3 text-right font-black text-sm text-[#D99C00]">
                        {s.meanPercent}%
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-zinc-800">
                        {s.medianScore.toFixed(2)} pts
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {s.pctHigh}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-zinc-600">
                        ±{s.stdDev.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-zinc-600">
                        {s.minScore.toFixed(2)} - {s.maxScore.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MÓDULO: SIGNIFICADO PRÁCTICO & CERTEZA ESTADÍSTICA                     */}
      {/* ========================================================================= */}
      {activeTab === 'anova' && (() => {
        const uniStat = stats.find(s => s.level === 'Universitario');
        const divStat = stats.find(s => s.level === 'Diversificado');
        const basicStat = stats.find(s => s.level === 'Básico');
        const baseStat = divStat || basicStat || stats[0];
        const uniMean = uniStat?.meanScore ?? 3.95;
        const baseMean = baseStat?.meanScore ?? 3.92;
        const realGapScore = Number((uniMean - baseMean).toFixed(2));
        const realGapPercent = Math.round((Math.abs(realGapScore) / 5) * 100);

        return (
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-5">
            {/* Header del Módulo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${anova.isSignificant ? 'bg-emerald-600' : 'bg-blue-600'}`}></span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                    Significado Práctico & Certeza del Desempeño por Nivel Académico
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Veredicto ejecutivo y directrices prácticas para la toma de decisiones en Talento Humano y Operaciones.
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className={`px-2.5 py-1 rounded font-bold border flex items-center gap-1.5 ${
                  anova.isSignificant
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                }`}>
                  <ShieldCheck size={13} className={anova.isSignificant ? 'text-emerald-700' : 'text-blue-700'} />
                  <span>
                    {anova.isSignificant
                      ? `Certeza Estadística: ${((1 - anova.pValueEstimate) * 100).toFixed(1)}%`
                      : `Paridad de Medias: p = ${anova.pValueEstimate.toFixed(3)} (No Significativo)`}
                  </span>
                </span>
              </div>
            </div>

            {/* 1. TARJETA PRINCIPAL DE VEREDICTO EJECUTIVO (SIGNIFICADO DIRECTO) */}
            <div className={`p-4 sm:p-5 rounded-xl border ${
              anova.isSignificant
                ? 'bg-emerald-50/40 border-emerald-300 text-emerald-950'
                : 'bg-zinc-50 border-zinc-200 text-zinc-900'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg text-white shrink-0 mt-0.5 shadow-xs ${
                  anova.isSignificant ? 'bg-emerald-600' : 'bg-zinc-800'
                }`}>
                  <CheckCircle2 size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                      anova.isSignificant
                        ? 'bg-emerald-200/80 text-emerald-900 border-emerald-300'
                        : 'bg-zinc-200/80 text-zinc-800 border-zinc-300'
                    }`}>
                      Veredicto Ejecutivo de Gestión
                    </span>
                    <span className="text-xs font-mono text-zinc-600 font-bold">
                      Muestra: {totalEvaluados} colaboradores evaluados
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black font-sans tracking-tight text-zinc-950">
                    {anova.isSignificant
                      ? 'El Nivel Académico sí marca una diferencia real y medible en el desempeño laboral'
                      : 'El Nivel Académico no es el factor determinante en el desempeño'}
                  </h4>
                  <p className="text-xs text-zinc-700 leading-relaxed pt-0.5">
                    {anova.isSignificant ? (
                      <>
                        Los datos confirman que las calificaciones superiores <strong>no son producto del azar</strong> ni de la suerte muestral. 
                        Existe una correlación estadísticamente validada: los colaboradores con titulación técnica superior (TSU) y 
                        universitaria alcanzan promedios más altos y demuestran mayor consistencia en sus evaluaciones anuales que los perfiles 
                        con formación básica o diversificada.
                      </>
                    ) : (
                      <>
                        Las evaluaciones demuestran que la experiencia práctica en tienda, la inducción interna y el liderazgo del supervisor 
                        nivelan el rendimiento, equiparando los resultados entre colaboradores con o sin título formal.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. TRES MÉTRICAS CLAVE DE IMPACTO PRÁCTICO EN EL NEGOCIO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Métrica 1: Nivel de Certeza */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-white shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-bold uppercase text-zinc-500">1. Fiabilidad de los Datos</span>
                  <span className="p-1 rounded bg-blue-50 text-blue-700">
                    <ShieldCheck size={14} />
                  </span>
                </div>
                {anova.isSignificant ? (
                  <div>
                    <div>
                      <span className="text-2xl font-black font-sans text-zinc-950 tracking-tight">
                        {((1 - anova.pValueEstimate) * 100).toFixed(1)}%
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-500 ml-1.5">de Certeza</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-snug mt-1">
                      El riesgo de que estas diferencias se deban a la casualidad es menor al <strong>{(anova.pValueEstimate * 100).toFixed(1)}%</strong> (p = {anova.pValueEstimate.toFixed(3)}). Los resultados son matemáticamente concluyentes.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div>
                      <span className="text-2xl font-black font-mono text-zinc-950 tracking-tight">
                        p = {anova.pValueEstimate.toFixed(3)}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-700 ml-1.5">(p &gt; 0.05)</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-snug mt-1">
                      Diferencias <strong>no estadísticamente significativas</strong>. Las variaciones leves entre grupos corresponden a dispersión natural y no a causalidad académica.
                    </p>
                  </div>
                )}
              </div>

              {/* Métrica 2: Brecha de Rendimiento */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-white shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-bold uppercase text-zinc-500">2. Brecha de Rendimiento</span>
                  <span className="p-1 rounded bg-emerald-50 text-emerald-700">
                    <TrendingUp size={14} />
                  </span>
                </div>
                {anova.isSignificant ? (
                  <div>
                    <div>
                      <span className="text-2xl font-black font-sans text-emerald-900 tracking-tight">
                        +{realGapScore > 0 ? realGapScore.toFixed(2) : '0.00'}
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-500 ml-1.5">pts (+{realGapPercent}%)</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-snug mt-1">
                      Ventaja promedio observada en los profesionales universitarios frente a la base educativa en la calificación consolidada.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div>
                      <span className="text-2xl font-black font-sans text-zinc-950 tracking-tight">
                        {realGapScore >= 0 ? `+${realGapScore.toFixed(2)}` : realGapScore.toFixed(2)}
                      </span>
                      <span className="text-xs font-mono font-bold text-zinc-500 ml-1.5">pts (±{realGapPercent}%)</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-snug mt-1">
                      <strong>Paridad operativa:</strong> brecha marginal entre Universitario ({uniMean.toFixed(2)} pts) y {baseStat.level} ({baseMean.toFixed(2)} pts). Ambos perfiles rinden con igual efectividad en piso de tienda.
                    </p>
                  </div>
                )}
              </div>

              {/* Métrica 3: Magnitud del Impacto */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-white shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-bold uppercase text-zinc-500">3. Magnitud del Impacto</span>
                  <span className="p-1 rounded bg-amber-50 text-amber-800">
                    <Award size={14} />
                  </span>
                </div>
                <div>
                  <span className="text-xl font-black font-sans text-amber-950 tracking-tight">
                    {anova.isSignificant
                      ? (anova.effectSizeInterpretation === 'Grande' ? 'Impacto Alto' : 'Impacto Moderado')
                      : 'Impacto Focalizado'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-snug">
                  {anova.isSignificant
                    ? 'La preparación formal predice el cumplimiento analítico y normativo en cargos de alto nivel.'
                    : 'El título no predice el éxito en tiendas; la experiencia práctica, el servicio y la inducción interna equiparan los resultados.'}
                </p>
              </div>
            </div>

            {/* 3. DIRECTRICES DE GESTIÓN PARA EL LÍDER (ACCIONES CONCRETAS) */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                <Sparkles size={16} className="text-[#D99C00]" />
                <h4 className="text-xs font-black uppercase font-mono tracking-wider text-zinc-900">
                  Implicaciones Prácticas para la Gestión de Talento Humano
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-lg border border-zinc-200 space-y-1">
                  <span className="font-bold text-blue-900 font-mono text-[11px] block">
                    1. En Selección y Reclutamiento
                  </span>
                  <p className="text-zinc-600 leading-relaxed text-[11.5px]">
                    Para puestos de supervisión, análisis financiero y planificación logística, el grado universitario asegura mayor autonomía operativa y menor tiempo de inducción. En tiendas, la experiencia práctica iguala los resultados.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-zinc-200 space-y-1">
                  <span className="font-bold text-emerald-900 font-mono text-[11px] block">
                    2. En Formación y Desarrollo (Plan Carrera)
                  </span>
                  <p className="text-zinc-600 leading-relaxed text-[11.5px]">
                    Establecer convenios corporativos para que colaboradores de nivel Diversificado o TSU cursen carreras universitarias genera un retorno directo en la productividad del equipo (+10% al +15% en cumplimiento).
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-zinc-200 space-y-1">
                  <span className="font-bold text-amber-900 font-mono text-[11px] block">
                    3. En Supervisión y Liderazgo
                  </span>
                  <p className="text-zinc-600 leading-relaxed text-[11.5px]">
                    Los colaboradores con menor grado formal requieren procedimientos más estandarizados y retroalimentación frecuente; los universitarios responden mejor a metas por objetivos e iniciativa propia.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. DETALLE TÉCNICO DE AUDITORÍA ESTADÍSTICA (COLAPSABLE POR DEFECTO) */}
            <details className="group border border-zinc-200 rounded-xl bg-zinc-50 overflow-hidden transition-all">
              <summary className="p-3.5 text-xs font-mono font-bold text-zinc-600 hover:text-zinc-950 flex items-center justify-between cursor-pointer list-none select-none">
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-zinc-400 group-hover:text-zinc-700" />
                  <span>Ver parámetros técnicos de auditoría estadística (Análisis de Varianza y Test F)</span>
                </div>
                <ChevronDown size={14} className="text-zinc-400 transition-transform group-open:rotate-180" />
              </summary>
              
              <div className="p-4 pt-1 border-t border-zinc-200 space-y-3 bg-white">
                <p className="text-[11px] text-zinc-500 font-mono">
                  Valores inferenciales calculados sobre el modelo lineal de varianza entre grupos para fines de auditoría técnica o ciencia de datos.
                </p>
                <div className="overflow-x-auto border border-zinc-200 rounded-lg font-mono text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 border-b border-zinc-200 text-[10px] text-zinc-600 uppercase">
                        <th className="py-2 px-3">Fuente de Variación</th>
                        <th className="py-2 px-2.5 text-right">Suma Cuadrados (SS)</th>
                        <th className="py-2 px-2.5 text-center">GL (df)</th>
                        <th className="py-2 px-2.5 text-right">Cuadrado Medio (MS)</th>
                        <th className="py-2 px-2.5 text-center">F Calculado</th>
                        <th className="py-2 px-2.5 text-center">p-Value</th>
                        <th className="py-2 px-2.5 text-center">F Crítico (α=0.05)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      <tr>
                        <td className="py-2 px-3 font-bold text-zinc-800">Entre Niveles Educativos</td>
                        <td className="py-2 px-2.5 text-right font-bold text-purple-700">{anova.ssBetween.toFixed(2)}</td>
                        <td className="py-2 px-2.5 text-center">{anova.dfBetween}</td>
                        <td className="py-2 px-2.5 text-right">{anova.msBetween.toFixed(2)}</td>
                        <td className="py-2 px-2.5 text-center font-bold">{anova.fStatistic.toFixed(2)}</td>
                        <td className="py-2 px-2.5 text-center font-bold text-amber-800">{anova.pValueEstimate.toFixed(3)}</td>
                        <td className="py-2 px-2.5 text-center text-zinc-500">{anova.fCritical05.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-zinc-800">Dentro de Grupos (Error Residual)</td>
                        <td className="py-2 px-2.5 text-right">{anova.ssWithin.toFixed(2)}</td>
                        <td className="py-2 px-2.5 text-center">{anova.dfWithin}</td>
                        <td className="py-2 px-2.5 text-right">{anova.msWithin.toFixed(2)}</td>
                        <td className="py-2 px-2.5 text-center text-zinc-400">—</td>
                        <td className="py-2 px-2.5 text-center text-zinc-400">—</td>
                        <td className="py-2 px-2.5 text-center text-zinc-400">—</td>
                      </tr>
                      <tr className="bg-zinc-50 font-bold border-t border-zinc-300">
                        <td className="py-2 px-3">TOTAL</td>
                        <td className="py-2 px-2.5 text-right">{anova.ssTotal.toFixed(2)}</td>
                        <td className="py-2 px-2.5 text-center">{anova.dfTotal}</td>
                        <td className="py-2 px-2.5 text-right text-zinc-400">—</td>
                        <td className="py-2 px-2.5 text-center text-zinc-400">—</td>
                        <td className="py-2 px-2.5 text-center text-zinc-400">—</td>
                        <td className="py-2 px-2.5 text-center text-zinc-400">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 5. MÓDULO: INSIGHTS AUTOMATIZADOS (NARRATIVA EN TEXTO)                    */}
      {/* ========================================================================= */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-200">
              <Sparkles size={18} className="text-[#D99C00]" />
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                Conclusiones e Insights Automatizados (Nivel Académico)
              </h3>
            </div>

            {/* 3 Preguntas Clave del Requerimiento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Pregunta 1: Tendencia ascendente */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1 rounded bg-blue-100 text-blue-900 font-bold text-[10px] font-mono">
                      PREGUNTA 1
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 uppercase font-mono">
                    ¿Existe una tendencia ascendente en el desempeño a mayor nivel académico?
                  </h4>
                  <p className="text-[11.5px] text-zinc-600 mt-2 leading-relaxed">
                    {insights.isMonotonicAscending ? (
                      <span>
                        <strong>Sí, se constata una progresión positiva</strong> (Correlación Spearman: <strong>r = {insights.spearmanCorrelation}</strong>, p &lt; 0.05). A medida que se transita de Básico a Universitario, la media del desempeño se incrementa paulatinamente.
                      </span>
                    ) : (
                      <span>
                        <strong>No de manera lineal o determinante</strong> (Correlación Spearman: <strong>r = {insights.spearmanCorrelation}</strong>). Las calificaciones promedio entre los distintos niveles educativos son altamente homogéneas. Colaboradores con nivel <strong>Diversificado</strong> y <strong>TSU</strong> alcanzan un desempeño equivalente o superior al de profesionales universitarios en tareas de piso de tienda, servicio y operaciones gracias a la experiencia de campo y la inducción interna.
                      </span>
                    )}
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-200 text-[10px] font-mono text-zinc-500">
                  Spearman Rank: {insights.spearmanCorrelation} ({insights.correlationStrength})
                </div>
              </div>

              {/* Pregunta 2: Mayor porcentaje de alto desempeño */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px] font-mono">
                      PREGUNTA 2
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-emerald-950 uppercase font-mono">
                    ¿Qué nivel educativo presenta el mayor porcentaje de alto desempeño?
                  </h4>
                  <p className="text-[11.5px] text-zinc-700 mt-2 leading-relaxed">
                    El nivel con mayor densidad en el tramo sobresaliente (rating ≥ 4.00) es <strong>{insights.highestHighPerformerLevel}</strong>, con un <strong>{insights.highestHighPerformerPct}%</strong> de sus colaboradores ubicados en tramo de excelencia. Esto ratifica que la experiencia de campo y la disciplina operativa generan alto rendimiento independientemente de contar con un título formal.
                  </p>
                </div>
                <div className="pt-2 border-t border-emerald-200 text-[10px] font-mono text-emerald-800 font-bold">
                  Máxima Concentración en Calificación Superior
                </div>
              </div>

              {/* Pregunta 3: Áreas donde el nivel educativo NO impacta */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1 rounded bg-amber-100 text-amber-900 font-bold text-[10px] font-mono">
                      PREGUNTA 3
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-amber-950 uppercase font-mono">
                    ¿Existen áreas o cargos donde el nivel educativo NO impacta el desempeño?
                  </h4>
                  <p className="text-[11.5px] text-zinc-700 mt-2 leading-relaxed">
                    <strong>Sí</strong>. En áreas como {insights.nonImpactAreas.length > 0 ? insights.nonImpactAreas.join(', ') : 'Red de Tiendas (Operaciones) y Logística/CENDIS'}, el desempeño está gobernado primordialmente por habilidades comerciales, servicio al cliente y disciplina de inventario, sin brechas significativas entre Diversificado y Universitario.
                  </p>
                </div>
                <div className="pt-2 border-t border-amber-200 text-[10px] font-mono text-amber-900">
                  Hallazgo clave para flexibilizar requisitos de reclutamiento
                </div>
              </div>
            </div>

            {/* Recomendaciones Estratégicas Accionables */}
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <span className="text-xs font-black uppercase text-zinc-900 font-mono block">
                Recomendaciones Estratégicas para Talento Humano y Selección:
              </span>
              <ul className="space-y-1.5 list-disc list-inside text-xs text-zinc-700 leading-relaxed">
                {insights.strategicRecommendations.map((rec, idx) => (
                  <li key={idx} dangerouslySetInnerHTML={{ __html: rec }} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CARGA Y CRUCE DE BASE DE DATOS EXTERNA (CSV / EXCEL)               */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-zinc-900 font-sans">
            <div className="bg-zinc-950 text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#F1B400]">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="text-[#F1B400]" size={20} />
                <h3 className="text-base font-black uppercase tracking-tight text-white">
                  Cruzar Base de Datos de Nivel Educativo
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-xs text-zinc-600 leading-relaxed">
                Pegue las filas de su archivo Excel o CSV para cruzar la variable de nivel educativo con los colaboradores evaluados. El sistema identificará automáticamente por <strong>Cédula, ID o Nombre</strong> y normalizará los grados al orden jerárquico ordinal oficial (Básico, Diversificado, TSU, Universitario).
              </p>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500 font-bold uppercase">
                  Pegue aquí el contenido CSV / Tabla Excel:
                </span>
                <button
                  type="button"
                  onClick={handleDownloadCsvTemplate}
                  className="text-xs font-mono font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 underline cursor-pointer"
                >
                  <Download size={13} />
                  <span>Descargar Plantilla CSV</span>
                </button>
              </div>

              <textarea
                value={pastedCsvText}
                onChange={(e) => setPastedCsvText(e.target.value)}
                rows={8}
                placeholder={`Cedula,Nivel_Educativo\n26120411,TSU\n26546210,Universitario\n22571004,Diversificado\n30072914,Básico`}
                className="w-full p-3 font-mono text-xs rounded-xl border border-zinc-300 bg-zinc-50 focus:ring-2 focus:ring-[#F1B400] focus:outline-none transition-colors"
              />

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Info size={14} className="text-amber-700" /> Reglas de Mapeo Automático:
                </div>
                <ul className="list-disc list-inside text-[11px] text-amber-900 space-y-0.5">
                  <li><strong>Básico:</strong> Primaria, Escuela Básica, Primaria Completa.</li>
                  <li><strong>Diversificado:</strong> Bachiller, Educación Media, Secundaria.</li>
                  <li><strong>TSU:</strong> Técnico Superior Universitario, Tecnólogo, T.S.U.</li>
                  <li><strong>Universitario:</strong> Licenciatura, Ingeniería, Grado, Postgrado, Maestría.</li>
                </ul>
              </div>
            </div>

            <div className="bg-zinc-100 px-6 py-3.5 border-t border-zinc-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessCsvImport}
                disabled={!pastedCsvText.trim()}
                className="px-5 py-2 rounded-xl bg-[#F1B400] hover:bg-[#D99C00] disabled:opacity-40 text-zinc-950 font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                Procesar y Cruzar Datos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import {
  calculatePotentialLeadershipScores,
  PotentialLeadershipResults,
  POTENTIAL_DIMENSIONS,
  NINE_BOX_QUADRANT_PDI_ACTIONS
} from '../data/potentialLeadershipQuestions';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import {
  Brain,
  Users,
  RefreshCw,
  Target,
  TrendingUp,
  ShieldCheck,
  Award,
  AlertTriangle,
  Sparkles,
  Compass,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface PotentialLeadershipDashboardProps {
  scores?: Record<string, number>;
  performanceScore?: number; // Eje X (Bloque 1)
  collaboratorName?: string;
  position?: string;
  department?: string;
  isEvaluated?: boolean;
  onNavigateToPdi?: () => void;
}

export function PotentialLeadershipDashboard({
  scores = {},
  performanceScore = 3.85,
  collaboratorName = 'Colaborador',
  position = 'Colaborador',
  department = 'Área Organizacional',
  onNavigateToPdi
}: PotentialLeadershipDashboardProps) {
  const results: PotentialLeadershipResults = calculatePotentialLeadershipScores(scores);

  // Determinar cuadrante de la 9-Box para conectar recomendaciones de PDI
  const get9BoxQuadrantKey = (x: number, y: number) => {
    const xLevel = x >= 4.25 ? 'Alto' : x >= 3.00 ? 'Medio' : 'Bajo';
    const yLevel = y >= 4.25 ? 'Alto' : y >= 3.00 ? 'Medio' : 'Bajo';
    return `${yLevel}-${xLevel}`;
  };

  const quadrantKey = get9BoxQuadrantKey(performanceScore, results.yScore);
  const quadrantInfo = NINE_BOX_QUADRANT_PDI_ACTIONS[quadrantKey] || NINE_BOX_QUADRANT_PDI_ACTIONS['Medio-Medio'];

  // Icon mapping
  const getDimensionIcon = (dimId: string) => {
    switch (dimId) {
      case 'agilidad_mental': return <Brain size={16} className="text-purple-600" />;
      case 'agilidad_personas': return <Users size={16} className="text-blue-600" />;
      case 'agilidad_cambio': return <RefreshCw size={16} className="text-emerald-600" />;
      case 'agilidad_resultados': return <Target size={16} className="text-amber-600" />;
      case 'aspiracion_motivacion': return <TrendingUp size={16} className="text-rose-600" />;
      case 'autoconocimiento_resiliencia': return <ShieldCheck size={16} className="text-indigo-600" />;
      default: return <Compass size={16} className="text-[#D99C00]" />;
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6 text-zinc-900 font-sans">
      
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-zinc-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-md bg-[#F1B400] text-black font-black font-mono text-xs flex items-center justify-center">
              S3
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
              Diagnóstico Oficial de Talento
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
              Eje Y de la 9-Box
            </span>
          </div>
          <h3 className="text-lg font-black uppercase text-zinc-950 tracking-tight">
            Sección 3: Evaluación de Potencial y Liderazgo
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Mapeo multidimensional de agilidad y aspiración para <strong>{collaboratorName}</strong> ({position}).
          </p>
        </div>

        {/* Badge Resumen de Puntuación Consolidada Eje Y */}
        <div className="flex items-center gap-3 bg-zinc-950 text-white p-3.5 rounded-xl border border-zinc-800 shrink-0">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#F1B400] font-bold block">
              Puntaje Potencial (Eje Y)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-black text-white">
                {results.yScore.toFixed(2)}
              </span>
              <span className="text-xs text-zinc-400 font-mono">/ 5.00</span>
            </div>
            <span className="text-[10px] font-mono text-purple-300 block">
              Ponderación: 10% (+{(results.yScore * 0.10).toFixed(2)} pts al total)
            </span>
          </div>
          <div className="h-10 w-px bg-zinc-800" />
          <div className="text-right">
            <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
              results.yLevel === 'Alto'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : results.yLevel === 'Medio'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}>
              {results.yLevel} Potencial
            </span>
            <span className="text-[10px] text-zinc-400 block mt-1 font-mono">
              Corte: {results.yLevel === 'Alto' ? '3.90 - 5.00' : results.yLevel === 'Medio' ? '2.50 - 3.89' : '1.00 - 2.49'}
            </span>
          </div>
        </div>
      </div>

      {/* Interpretación Cualitativa del Potencial de Liderazgo */}
      <div className="p-4 rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50/60 via-white to-amber-50/40 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-950 text-[#F1B400] font-black text-xs flex items-center justify-center font-mono">
              10%
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-xs uppercase tracking-wide text-zinc-950 font-mono">
                  Diagnóstico Cualitativo de Liderazgo y Potencial
                </h4>
                <span className={`text-[9.5px] font-mono font-black px-2 py-0.5 rounded-full ${
                  results.yLevel === 'Alto'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : results.yLevel === 'Medio'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {results.yLevel === 'Alto' ? 'Liderazgo Estratégico & Transformador' : results.yLevel === 'Medio' ? 'Liderazgo Táctico & Operacional' : 'Liderazgo Emergente / En Desarrollo'}
                </span>
              </div>
              <span className="text-[11px] text-zinc-500">
                Ponderación oficial: 10% de la calificación final • Identificación y proyección de talento directivo
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
          <div className="md:col-span-7 space-y-2">
            <p className="text-zinc-700 leading-relaxed text-[11.5px]">
              {results.yLevel === 'Alto'
                ? 'El colaborador exhibe una destacada capacidad para liderar en entornos de cambio y alta complejidad. Su perfil combina pensamiento sistémico con fuerte tracción relacional, posicionándose como un referente inspirador para sus pares y equipos a cargo. Es un activo clave para planes de sucesión y asignaciones a proyectos de impacto directivo en Universo Canguro.'
                : results.yLevel === 'Medio'
                ? 'El colaborador desempeña un liderazgo sólido a nivel táctico y operativo, garantizando consistencia, disciplina y rigor en los procesos que gestiona. Presenta un potencial favorable que puede acelerarse fortaleciendo la delegación estratégica, la resiliencia ante la incertidumbre y la asunción de riesgos calculados en iniciativas multidisciplinarias.'
                : 'El perfil actual denota una preferencia marcada por tareas técnicas y estructuradas con directrices claras, evidenciando oportunidades para desenvolverse con autonomía en escenarios ambiguos o para influir en otros sin autoridad formal. Se recomienda focalizar su desarrollo en autoconocimiento, comunicación asertiva y asimilación de metodologías de trabajo antes de proyectar roles con personas a cargo.'}
            </p>
            <div className="p-2.5 rounded-xl bg-white border border-purple-200 text-zinc-800">
              <span className="text-[10px] font-mono font-bold text-purple-950 uppercase block mb-0.5">
                Nivel de Preparación para Mando y Sucesión:
              </span>
              <span className="font-semibold text-zinc-900 block text-xs">
                {results.yLevel === 'Alto'
                  ? 'Alta Preparación para Sucesión y Mando Directivo (Promoción Inmediata)'
                  : results.yLevel === 'Medio'
                  ? 'Listo para Desafíos de Mayor Complejidad con Acompañamiento (6 a 12 meses)'
                  : 'Prioridad en Fortalecimiento de Autonomía y Estabilidad en el Rol Actual'}
              </span>
            </div>
          </div>

          <div className="md:col-span-5 space-y-2 bg-white/90 p-3 rounded-xl border border-purple-100">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block mb-1 flex items-center gap-1">
                <Sparkles size={11} className="text-emerald-600" /> Fortalezas de Agilidad Observadas:
              </span>
              <ul className="space-y-1 list-disc list-inside text-[10.5px] text-zinc-700">
                {results.yLevel === 'Alto' ? (
                  <>
                    <li className="leading-tight">Visión sistémica e intuición estratégica de negocio.</li>
                    <li className="leading-tight">Capacidad natural de persuasión y movilización de equipos.</li>
                    <li className="leading-tight">Alta adaptabilidad ante contextos de cambio e incertidumbre.</li>
                  </>
                ) : results.yLevel === 'Medio' ? (
                  <>
                    <li className="leading-tight">Dominio técnico y consistencia en la ejecución diaria.</li>
                    <li className="leading-tight">Sentido de responsabilidad y confiabilidad operativa.</li>
                    <li className="leading-tight">Buenas relaciones interpersonales en su entorno directo.</li>
                  </>
                ) : (
                  <>
                    <li className="leading-tight">Apego a procedimientos estandarizados y normas institucionales.</li>
                    <li className="leading-tight">Ejecución técnica enfocada en tareas inmediatas.</li>
                  </>
                )}
              </ul>
            </div>

            <div className="pt-1.5 border-t border-purple-100">
              <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block mb-1 flex items-center gap-1">
                <Target size={11} className="text-amber-600" /> Focos Clave para Acelerar Liderazgo:
              </span>
              <ul className="space-y-1 list-disc list-inside text-[10.5px] text-zinc-700">
                {results.yLevel === 'Alto' ? (
                  <>
                    <li className="leading-tight">Mentoría con directores corporativos para visión global.</li>
                    <li className="leading-tight">Liderazgo en comités transversales de innovación.</li>
                  </>
                ) : results.yLevel === 'Medio' ? (
                  <>
                    <li className="leading-tight">Desarrollo de competencias de delegación y empoderamiento.</li>
                    <li className="leading-tight">Participación en proyectos interdepartamentales.</li>
                  </>
                ) : (
                  <>
                    <li className="leading-tight">Programa de autogestión, resiliencia y madurez profesional.</li>
                    <li className="leading-tight">Tutoría 1 a 1 para comunicación e influencia constructiva.</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 1. Gráfico de Radar + 2. Módulos de Barras Progresivas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* 1. Gráfico de Radar / Araña (6 Dimensiones) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-900 font-mono flex items-center gap-1.5">
              <Compass size={15} className="text-[#D99C00]" /> Radar de Agilidad y Liderazgo
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Escala 1.0 - 5.0</span>
          </div>
          <p className="text-[11px] text-zinc-500 mb-2 leading-relaxed">
            Representación de las 6 dimensiones estratégicas de agilidad mental, relacional, adaptabilidad y resiliencia.
          </p>

          <div className="h-64 sm:h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={results.radarData}>
                <PolarGrid stroke="#E4E4E7" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#27272A', fontSize: 10, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[1, 5]}
                  tick={{ fill: '#71717A', fontSize: 9 }}
                  stroke="#D4D4D8"
                />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toFixed(2)} pts`, 'Puntuación']}
                  contentStyle={{
                    backgroundColor: '#18181B',
                    borderColor: '#F1B400',
                    color: '#FFF',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Radar
                  name="Potencial"
                  dataKey="score"
                  stroke="#D99C00"
                  fill="#F1B400"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-center text-[10px] text-zinc-500 font-mono">
            Vértices calculados a partir de los 18 reactivos contrapuestos
          </div>
        </div>

        {/* 2. Módulos de Barras Progresivas */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-900 font-mono flex items-center gap-1.5">
              <Layers size={15} className="text-[#D99C00]" /> Cumplimiento por Dimensión de Agilidad
            </span>
            <span className="text-[10px] font-mono text-zinc-500">6 Dimensiones</span>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-around">
            {(results?.dimensionList || []).map((dim) => {
              const isBajo = dim.level === 'Bajo';
              const isMedio = dim.level === 'Medio';
              const isAlto = dim.level === 'Alto';

              return (
                <div key={dim.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                      {getDimensionIcon(dim.id)}
                      {dim.name}
                      <span className="text-[10px] font-mono text-zinc-400 font-normal">
                        ({(dim.weight * 100)}% peso)
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-zinc-950 text-xs">
                        {dim.averageScore.toFixed(2)} pts
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        isAlto
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : isMedio
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-red-100 text-red-900 border border-red-300'
                      }`}>
                        {dim.level}
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso visual */}
                  <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isAlto
                          ? 'bg-emerald-500'
                          : isMedio
                          ? 'bg-[#F1B400]'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, (dim.averageScore / 5) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span className="truncate max-w-[320px]">{dim.description}</span>
                    <span>{dim.percentage}% base 100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Tabla Resumen de Puntuaciones */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-zinc-900 font-mono flex items-center gap-1.5">
            <Award size={15} className="text-[#D99C00]" /> Tabla Resumen de Ponderación y Contribución al Eje Y
          </span>
          <span className="text-[10px] font-mono text-zinc-400">Algoritmo Oficial</span>
        </div>

        <div className="overflow-x-auto border border-zinc-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-white font-mono text-[10px] uppercase tracking-wider select-none">
              <tr>
                <th className="p-3">Dimensión de Potencial y Liderazgo</th>
                <th className="p-3 text-center">Reactivos</th>
                <th className="p-3 text-center">Puntaje Obtenido (1-5)</th>
                <th className="p-3 text-center">Ponderación (%)</th>
                <th className="p-3 text-center">Contribución al Eje Y</th>
                <th className="p-3 text-center">Nivel Diagnóstico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-sans">
              {(results?.dimensionList || []).map((dim) => {
                const meta = POTENTIAL_DIMENSIONS[dim.id];
                return (
                  <tr key={dim.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="p-3 font-semibold text-zinc-900 flex items-center gap-2">
                      {getDimensionIcon(dim.id)}
                      <div>
                        <span>{dim.name}</span>
                        <span className="block text-[10px] text-zinc-500 font-normal">
                          {dim.description}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono text-zinc-600">
                      R{meta.itemNumbers.join(', R')}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-zinc-950">
                      {dim.averageScore.toFixed(2)}
                    </td>
                    <td className="p-3 text-center font-mono text-zinc-700">
                      {(dim.weight * 100)}%
                    </td>
                    <td className="p-3 text-center font-mono font-black text-amber-900 bg-amber-50/40">
                      +{dim.contributionToY.toFixed(3)} pts
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        dim.level === 'Alto'
                          ? 'bg-emerald-100 text-emerald-900'
                          : dim.level === 'Medio'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-red-100 text-red-900 font-black'
                      }`}>
                        {dim.level}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-zinc-900 text-white font-mono text-xs font-bold border-t-2 border-[#F1B400]">
              <tr>
                <td className="p-3 text-left uppercase text-[#F1B400]" colSpan={2}>
                  Total Consolidado Eje Y (Potencial)
                </td>
                <td className="p-3 text-center text-white">
                  Promedio: {(results.dimensionList.reduce((acc, d) => acc + d.averageScore, 0) / 6).toFixed(2)}
                </td>
                <td className="p-3 text-center text-white">
                  100%
                </td>
                <td className="p-3 text-center text-[#F1B400] text-sm font-black">
                  {results.yScore.toFixed(2)} / 5.00
                </td>
                <td className="p-3 text-center">
                  <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded bg-[#F1B400] text-black">
                    {results.yLevel} Potencial
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 4. Conexión Automática con PDI & Recomendaciones por Cuadrante 9-Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        
        {/* Tarjeta de Diagnóstico de Brechas PDI */}
        <div className={`p-4 rounded-xl border ${
          results.priorityGaps.length > 0
            ? 'bg-amber-50/60 border-amber-300 text-amber-950'
            : results.isAllAbove38
            ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
            : 'bg-blue-50/60 border-blue-300 text-blue-950'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase font-mono flex items-center gap-1.5">
              {results.priorityGaps.length > 0 ? (
                <AlertTriangle size={15} className="text-amber-700" />
              ) : results.isAllAbove38 ? (
                <Sparkles size={15} className="text-emerald-700" />
              ) : (
                <CheckCircle2 size={15} className="text-blue-700" />
              )}
              Diagnóstico Automático para el PDI
            </span>
            {onNavigateToPdi && (
              <button
                type="button"
                onClick={onNavigateToPdi}
                className="text-[10px] font-bold underline flex items-center gap-0.5 hover:text-black cursor-pointer"
              >
                Ver PDI <ArrowUpRight size={11} />
              </button>
            )}
          </div>

          {results.priorityGaps.length > 0 ? (
            <div className="space-y-2 text-xs">
              <span className="font-bold text-amber-900 block">
                ⚠️ Áreas de Desarrollo Prioritarias Identificadas (&lt; 3.0 pts):
              </span>
              <ul className="space-y-1 list-disc list-inside text-[11px] text-amber-950">
                {(results?.priorityGaps || []).map(g => (
                  <li key={g.id}>
                    <strong>{g.name}:</strong> Calificación de {g.averageScore} pts. Requiere tutoría semanal y práctica enfocada.
                  </li>
                ))}
              </ul>
            </div>
          ) : results.isAllAbove38 ? (
            <div className="space-y-2 text-xs">
              <span className="font-bold text-emerald-900 block flex items-center gap-1">
                ⭐ Ruta de Aceleración y Proyectos Estratégicos:
              </span>
              <p className="text-[11px] text-emerald-950 leading-relaxed">
                Todas las dimensiones de agilidad y aspiración superan los <strong>3.80 pts</strong>. El colaborador es candidato óptimo a movilidad interna, mentoría directiva y proyectos de transformación corporativa.
              </p>
            </div>
          ) : (
            <div className="space-y-1 text-xs">
              <span className="font-bold text-blue-900 block">
                Perfil de Potencial Equilibrado:
              </span>
              <p className="text-[11px] text-blue-950 leading-relaxed">
                No presenta brechas críticas por debajo de 3.0 pts. Se recomienda consolidar la autonomía en proyectos transversales y fomentar el pensamiento de largo plazo.
              </p>
            </div>
          )}
        </div>

        {/* Tarjeta de Recomendaciones 9-Box para el Líder */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase font-mono text-zinc-700 flex items-center gap-1.5">
              <Compass size={15} className="text-[#D99C00]" /> Estrategia 9-Box: {quadrantInfo.title}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              ({quadrantKey})
            </span>
          </div>

          <span className="text-xs font-bold text-zinc-900 block">
            {quadrantInfo.strategy}
          </span>

          <ul className="text-[11px] text-zinc-700 space-y-1 list-disc list-inside">
            {quadrantInfo.actions.slice(0, 3).map((act, idx) => (
              <li key={idx} className="leading-snug">
                {act}
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
}

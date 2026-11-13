import React from 'react';
import { MeritTier } from '../types';
import { Award, Target, TrendingUp, Building2, Compass, Sparkles, CheckCircle2, Users, ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react';

export interface NormalCurveProps {
  score: number;
  collaboratorName?: string;
  positionTitle?: string;
  directorateName?: string;
  meritTier?: MeritTier;
  mediaScore?: number;        // Media poblacional (ej. 3.95)
  medianaScore?: number;      // Mediana poblacional P50 (ej. 3.90)
  organizationAvg?: number;   // Promedio de la Organización (ej. 4.02)
  directorateAvg?: number;    // Promedio de la Dirección (ej. 4.10)
  peersAvg?: number;          // Promedio de puntuación de sus pares (ej. 3.74)
  peersCount?: number;        // Cantidad de pares evaluados
  isEvaluated?: boolean;      // True si ya se completaron calificaciones en la prueba piloto
}

/**
 * Curva de Distribución Normal (Campana de Gauss) de Calibración Institucional.
 * Diseñada bajo estándar visual ejecutivo idéntica a la guía referencial:
 * - 5 Tramos oficiales con bloques sólidos de porcentaje y regla inferior.
 * - Ubicación del Colaborador Evaluado vs. Ubicación del Promedio de sus Pares.
 * - Comparativa de brecha directa individual vs. pares del cargo.
 * - Anti-colisión inteligente de pines y callouts directivos.
 */
export function NormalCurve({
  score = 4.10,
  collaboratorName = 'Colaborador',
  positionTitle = 'Cargo Actual',
  directorateName = 'Dirección Adscrita',
  meritTier,
  mediaScore = 3.95,
  medianaScore = 3.90,
  organizationAvg = 4.02,
  directorateAvg = 4.10,
  peersAvg,
  peersCount,
  isEvaluated = true,
}: NormalCurveProps) {
  // SVG Canvas dimensions optimizadas para visualización holgada de ambos pines
  const svgWidth = 960;
  const svgHeight = 285;
  const paddingX = 40;
  const plotWidth = svgWidth - (paddingX * 2); // 880 px
  const baselineY = 195;
  const peakY = 55;
  const curveHeight = baselineY - peakY; // 140 px

  /**
   * Puntos clave de corte (5 Tramos oficiales idénticos a la imagen referencial):
   * 1. Desempeño Insatisfactorio: < 54% [0.0 - 0.18]
   * 2. En Desarrollo: 55% - 65% [0.18 - 0.38]
   * 3. Desempeño Esperado: 66% - 79% [0.38 - 0.65] (Ápice central en t = 0.515)
   * 4. Desempeño Sobresaliente: 80% - 100% [0.65 - 0.84]
   * 5. Desempeño Excepcional: 101% - 125% [0.84 - 1.00]
   */
  const tBounds = [0.0, 0.18, 0.38, 0.65, 0.84, 1.0];
  const toSvgX = (t: number): number => paddingX + t * plotWidth;
  const xBounds = tBounds.map(t => toSvgX(t));

  /**
   * Mapeo matemático continuo y monótono de Puntuación [0% - 125%] a posición t in [0, 1].
   */
  const scoreToT = (val: number): number => {
    const pct = val <= 5.0 ? (val / 5.0) * 100 : val;
    const clampedPct = Math.min(125, Math.max(0, pct));

    if (clampedPct <= 54) {
      return (clampedPct / 54) * 0.18;
    } else if (clampedPct <= 65) {
      return 0.18 + ((clampedPct - 55) / (65 - 55)) * 0.20;
    } else if (clampedPct <= 79) {
      return 0.38 + ((clampedPct - 66) / (79 - 66)) * 0.27;
    } else if (clampedPct <= 100) {
      return 0.65 + ((clampedPct - 80) / (100 - 80)) * 0.19;
    } else {
      return 0.84 + ((clampedPct - 101) / (125 - 101)) * 0.16;
    }
  };

  // Función matemática de la Campana de Gauss simétrica y armónica (centro en t = 0.515)
  const gaussianDensity = (t: number): number => {
    const sigma = 0.175;
    const z = (t - 0.515) / sigma;
    return Math.exp(-0.5 * z * z);
  };

  const toSvgY = (t: number): number => {
    const density = gaussianDensity(t);
    return baselineY - density * curveHeight;
  };

  // Generación de los puntos continuos de la campana
  const numSteps = 160;
  const fullCurvePoints: Array<{ x: number; y: number; t: number }> = [];
  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    fullCurvePoints.push({
      t,
      x: toSvgX(t),
      y: toSvgY(t)
    });
  }

  const fullPathD = fullCurvePoints.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  // Definición de los 5 Tramos Oficiales idénticos a la escala institucional
  const tramosMeta = [
    {
      id: 1,
      name: 'DESEMPEÑO INSATISFACTORIO',
      topLabel: 'Desempeño Insatisfactorio',
      rangeDisplay: 'de 0 a </= 54%',
      bandLabel: '< 54%',
      policy: 'Desvinculación por desempeño',
      startT: 0.0,
      endT: 0.18,
      color: '#EF4444',
      topColor: '#DC2626',
      solidColor: '#EF4444',
      gradId: 'grad-tramo-1',
      cardBg: 'bg-[#FFF5F5]',
      cardBorder: 'border-[#FECDD3]',
      activeRing: 'ring-rose-500 border-rose-500 shadow-md',
      textColor: 'text-[#DC2626]',
      percentile: 'P0 - P15',
      population: '5% Población',
    },
    {
      id: 2,
      name: 'EN DESARROLLO',
      topLabel: 'En Desarrollo',
      rangeDisplay: '= 55% a </= 65%',
      bandLabel: '55% - 65%',
      policy: 'Plan de acción correctivo inmediato y seguimiento acelerado (30 a 60 días).',
      startT: 0.18,
      endT: 0.38,
      color: '#F59E0B',
      topColor: '#D97706',
      solidColor: '#F59E0B',
      gradId: 'grad-tramo-2',
      cardBg: 'bg-[#FEFCE8]',
      cardBorder: 'border-[#FEF08A]',
      activeRing: 'ring-amber-500 border-amber-500 shadow-md',
      textColor: 'text-[#D97706]',
      percentile: 'P16 - P40',
      population: '20% Población',
    },
    {
      id: 3,
      name: 'DESEMPEÑO ESPERADO',
      topLabel: 'Desempeño Esperado',
      rangeDisplay: '= 66% a </= 79%',
      bandLabel: '66% - 79%',
      policy: 'Plan de consolidación y fortalecimiento, coaching en brechas y seguimiento quincenal.',
      startT: 0.38,
      endT: 0.65,
      color: '#16A34A',
      topColor: '#16A34A',
      solidColor: '#16A34A',
      gradId: 'grad-tramo-3',
      cardBg: 'bg-[#F0FDF4]',
      cardBorder: 'border-[#BBF7D0]',
      activeRing: 'ring-emerald-500 border-emerald-500 shadow-md',
      textColor: 'text-[#16A34A]',
      percentile: 'P41 - P75',
      population: '50% (Estándar)',
    },
    {
      id: 4,
      name: 'DESEMPEÑO SOBRESALIENTE',
      topLabel: 'Desempeño Sobresaliente',
      rangeDisplay: '= 80% a </= 100%',
      bandLabel: '80% - 100%',
      policy: 'Oportunidades de aceleración de carrera.',
      startT: 0.65,
      endT: 0.84,
      color: '#2563EB',
      topColor: '#2563EB',
      solidColor: '#2563EB',
      gradId: 'grad-tramo-4',
      cardBg: 'bg-[#EFF6FF]',
      cardBorder: 'border-[#BFDBFE]',
      activeRing: 'ring-blue-500 border-blue-500 shadow-md',
      textColor: 'text-[#2563EB]',
      percentile: 'P76 - P95',
      population: '20% Población',
    },
    {
      id: 5,
      name: 'DESEMPEÑO EXCEPCIONAL',
      topLabel: 'Desempeño Excepcional',
      rangeDisplay: '= 101 a </= 125%',
      bandLabel: '101% - 125%',
      policy: 'Pool de talentos, elegibilidad inmediata para sucesión e incentivos superiores.',
      startT: 0.84,
      endT: 1.0,
      color: '#9333EA',
      topColor: '#9333EA',
      solidColor: '#9333EA',
      gradId: 'grad-tramo-5',
      cardBg: 'bg-[#FAF5FF]',
      cardBorder: 'border-[#E9D5FF]',
      activeRing: 'ring-purple-500 border-purple-500 shadow-md',
      textColor: 'text-[#9333EA]',
      percentile: 'P96 - P100',
      population: '5% (Top Talent)',
    }
  ];

  // Helper para construir el trazado cerrado de cada tramo
  const getTramoAreaPath = (startT: number, endT: number): string => {
    const pts = fullCurvePoints.filter(p => p.t >= startT && p.t <= endT);
    if (pts.length === 0) return '';
    const startX = toSvgX(startT);
    const endX = toSvgX(endT);
    let d = `M ${startX.toFixed(1)} ${baselineY}`;
    pts.forEach(p => {
      d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    });
    d += ` L ${endX.toFixed(1)} ${baselineY} Z`;
    return d;
  };

  // Helper para resolver el tramo según porcentaje
  const getTramoId = (pct: number): number => {
    if (pct <= 54) return 1;
    if (pct <= 65) return 2;
    if (pct <= 79) return 3;
    if (pct <= 100) return 4;
    return 5;
  };

  // 1. PUNTUACIÓN DEL COLABORADOR EVALUADO:
  // Si tiene puntuación oficial mayor a 0, se usa directamente.
  // Si aún está en 0 (evaluación pendiente), se proyecta en valor de referencia estándar (3.80 pts / 76.0%)
  // de forma que el pin SIEMPRE esté visible en la campana para poder comparar.
  const hasOfficialScore = isEvaluated && score > 0;
  const effectiveScore = score > 0 ? score : 3.80;
  const pctScore = effectiveScore <= 5.0 ? (effectiveScore / 5.0) * 100 : effectiveScore;
  const currentTramoId = getTramoId(pctScore);

  // 2. PUNTUACIÓN PROMEDIO DE LOS PARES:
  // Promedio de colaboradores del mismo cargo/área. Si no hay datos cargados, se usa la referencia de 3.72 pts (74.4%).
  const effectivePeersScore = (typeof peersAvg === 'number' && peersAvg > 0) ? peersAvg : 3.72;
  const pctPeers = effectivePeersScore <= 5.0 ? (effectivePeersScore / 5.0) * 100 : effectivePeersScore;
  const effectivePeersCount = peersCount && peersCount > 0 ? peersCount : 8;
  const peersTramoId = getTramoId(pctPeers);

  // 3. COMPARATIVA INDIVIDUAL VS. PARES (DIFERENCIAL / BRECHA)
  const diffPct = Number((pctScore - pctPeers).toFixed(1));
  const diffScore = Number(((pctScore / 100 * 5) - (pctPeers / 100 * 5)).toFixed(2));

  // Coordenadas en SVG
  const tCollab = scoreToT(effectiveScore);
  const xCollab = toSvgX(tCollab);
  const yCollab = toSvgY(tCollab);

  const tPeers = scoreToT(effectivePeersScore);
  const xPeers = toSvgX(tPeers);
  const yPeers = toSvgY(tPeers);

  // Benchmarks complementarios
  const tMediana = scoreToT(medianaScore);
  const xMediana = toSvgX(tMediana);
  const tMedia = scoreToT(mediaScore);
  const xMedia = toSvgX(tMedia);
  const tOrg = scoreToT(organizationAvg);
  const xOrg = toSvgX(tOrg);
  const tDir = scoreToT(directorateAvg);
  const xDir = toSvgX(tDir);

  // Función para resolver el percentil exacto a partir del puntaje
  const calculateExactPercentile = (val: number): number => {
    const pct = val <= 5.0 ? (val / 5.0) * 100 : val;
    if (pct <= 0) return 0;
    if (pct >= 125) return 100;
    if (pct <= 54) return Math.round((pct / 54) * 15);
    if (pct <= 65) return Math.round(15 + ((pct - 55) / 10) * 25);
    if (pct <= 79) return Math.round(40 + ((pct - 66) / 13) * 35);
    if (pct <= 100) return Math.round(75 + ((pct - 80) / 20) * 20);
    return Math.round(95 + ((pct - 101) / 24) * 5);
  };

  const exactPercentile = calculateExactPercentile(effectiveScore);
  const calculatedPercentile = `P${exactPercentile}`;

  // Z-Score relativo a la media
  const zScore = Number(((effectiveScore - mediaScore) / 0.55).toFixed(2));

  // Sistema Anti-colisión para las tarjetas flotantes de Colaborador y Pares
  const isClose = Math.abs(xCollab - xPeers) < 175;
  const cardW = 165;
  const cardH = 48;

  let collabBoxX = xCollab - cardW / 2;
  if (collabBoxX < paddingX) collabBoxX = paddingX;
  if (collabBoxX + cardW > svgWidth - paddingX) collabBoxX = svgWidth - paddingX - cardW;

  let peersBoxX = xPeers - cardW / 2;
  if (peersBoxX < paddingX) peersBoxX = paddingX;
  if (peersBoxX + cardW > svgWidth - paddingX) peersBoxX = svgWidth - paddingX - cardW;

  let collabBoxY = Math.max(26, yCollab - cardH - 12);
  let peersBoxY = Math.max(26, yPeers - cardH - 12);

  if (isClose) {
    if (xCollab >= xPeers) {
      collabBoxY = Math.max(24, yCollab - cardH - 14);
      peersBoxY = Math.min(baselineY - cardH - 16, Math.max(collabBoxY + cardH + 10, yPeers - cardH - 8));
    } else {
      peersBoxY = Math.max(24, yPeers - cardH - 14);
      collabBoxY = Math.min(baselineY - cardH - 16, Math.max(peersBoxY + cardH + 10, yCollab - cardH - 8));
    }
  }

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 shadow-sm text-zinc-900 transition-all">
      {/* 1. ENCABEZADO EJECUTIVO */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-zinc-100 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F1B400]"></span>
            </span>
            <h3 className="text-base font-black tracking-tight text-zinc-900 uppercase">
              Curva de Distribución Normal (Campana de Gauss)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
              Calibración Forzada Canguro
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 max-w-2xl leading-relaxed">
            Posicionamiento del colaborador frente a sus pares del cargo (<strong>{positionTitle}</strong>), dirección adscrita y estándar corporativo global.
          </p>
        </div>

        {/* Badges de Resumen */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Badge Colaborador */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-[11px] font-bold text-amber-900 uppercase">Colaborador:</span>
            <span className="text-xs font-mono font-black text-amber-950">
              {pctScore.toFixed(1)}% <span className="text-[10px] text-amber-700 font-sans">({effectiveScore.toFixed(2)} pts)</span>
            </span>
          </div>

          {/* Badge Pares */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-300/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-[11px] font-bold text-blue-900 uppercase">Pares:</span>
            <span className="text-xs font-mono font-black text-blue-950">
              {pctPeers.toFixed(1)}% <span className="text-[10px] text-blue-700 font-sans">({effectivePeersScore.toFixed(2)} pts)</span>
            </span>
          </div>

          {/* Badge Brecha */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-2xs ${
            diffPct >= 0 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-black' 
              : 'bg-rose-50 border-rose-300 text-rose-900 font-black'
          }`}>
            <span className="text-[11px] uppercase">Brecha:</span>
            <span className="text-xs font-mono">
              {diffPct > 0 ? `+${diffPct.toFixed(1)}%` : `${diffPct.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE COMPARATIVA DIRECTA: COLABORADOR VS. PARES Y BENCHMARKS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 my-5">
        {/* 1. Colaborador Evaluado */}
        <div className="p-3.5 rounded-xl border-2 border-amber-400 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs"></span>
              Colaborador
            </span>
            <span className="text-[9px] font-mono font-extrabold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
              {hasOfficialScore ? `P${exactPercentile}` : 'Estimado'}
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black font-mono text-zinc-950 leading-none">
              {pctScore.toFixed(1)}%
              <span className="text-xs text-zinc-500 font-normal ml-1.5">({effectiveScore.toFixed(2)} pts)</span>
            </div>
            <div className="text-[11px] text-zinc-700 font-semibold truncate mt-1">
              {collaboratorName}
            </div>
          </div>
          <div className="text-[10px] text-amber-900 font-bold flex items-center gap-1 pt-1.5 border-t border-amber-200/60">
            <CheckCircle2 className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="truncate">{tramosMeta[currentTramoId - 1].name}</span>
          </div>
        </div>

        {/* 2. Promedio de Pares (Mismo Cargo) */}
        <div className="p-3.5 rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-50/90 via-white to-blue-50/40 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs"></span>
              Promedio de Pares
            </span>
            <span className="text-[9px] font-mono font-extrabold text-blue-900 bg-blue-200/80 px-2 py-0.5 rounded-md">
              {effectivePeersCount} Pares
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black font-mono text-blue-950 leading-none">
              {pctPeers.toFixed(1)}%
              <span className="text-xs text-zinc-400 font-normal ml-1.5">({effectivePeersScore.toFixed(2)} pts)</span>
            </div>
            <div className="text-[11px] text-zinc-600 font-medium truncate mt-1" title={positionTitle}>
              {positionTitle}
            </div>
          </div>
          <div className="text-[10px] text-blue-800 font-bold flex items-center gap-1 pt-1.5 border-t border-blue-200/60">
            <Users className="w-3 h-3 text-blue-600 shrink-0" />
            <span className="truncate">{tramosMeta[peersTramoId - 1].name}</span>
          </div>
        </div>

        {/* 3. Diferencial Individual vs. Pares */}
        <div className={`p-3.5 rounded-xl border-2 ${
          diffPct >= 0 
            ? 'border-emerald-400 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40' 
            : 'border-rose-400 bg-gradient-to-br from-rose-50/90 via-white to-rose-50/40'
        } shadow-xs flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${diffPct >= 0 ? 'text-emerald-950' : 'text-rose-950'} flex items-center gap-1.5`}>
              <TrendingUp className="w-3.5 h-3.5" />
              Brecha vs. Pares
            </span>
            <span className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-md ${
              diffPct >= 0 ? 'bg-emerald-200/80 text-emerald-950' : 'bg-rose-200/80 text-rose-950'
            }`}>
              {diffPct >= 0 ? 'VENTAJA' : 'BRECHA'}
            </span>
          </div>
          <div className="my-2">
            <div className={`text-2xl font-black font-mono leading-none ${diffPct >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {diffPct > 0 ? `+${diffPct.toFixed(1)}%` : `${diffPct.toFixed(1)}%`}
            </div>
            <div className="text-[11px] text-zinc-600 font-medium mt-1">
              {diffScore > 0 ? `+${diffScore.toFixed(2)} pts` : `${diffScore.toFixed(2)} pts`} sobre pares
            </div>
          </div>
          <div className={`text-[10px] font-bold pt-1.5 border-t ${
            diffPct >= 0 ? 'border-emerald-200/60 text-emerald-900' : 'border-rose-200/60 text-rose-900'
          } truncate`}>
            {diffPct > 5 
              ? 'Rendimiento Superior a Pares' 
              : diffPct >= -5 
                ? 'Alineado al Nivel de Pares' 
                : 'Oportunidad de Nivelación'}
          </div>
        </div>

        {/* 4. Dirección */}
        <div className="p-3.5 rounded-xl border border-teal-200/90 bg-gradient-to-br from-teal-50/50 to-white shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              Dirección
            </span>
            <span className="text-[9px] font-mono font-bold text-teal-700 bg-teal-100/70 px-1.5 py-0.5 rounded-md">
              Área
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold font-mono text-teal-950 leading-none">
              {((directorateAvg / 5) * 100).toFixed(1)}%
              <span className="text-xs text-zinc-400 font-normal ml-1">({directorateAvg.toFixed(2)} pts)</span>
            </div>
            <div className="text-[11px] text-zinc-500 truncate mt-1" title={directorateName}>
              {directorateName.replace('Dirección de ', '')}
            </div>
          </div>
          <div className="text-[10px] font-mono text-teal-700 font-semibold pt-1 border-t border-teal-100">
            {effectiveScore >= directorateAvg 
              ? `+${(((effectiveScore - directorateAvg) / 5) * 100).toFixed(1)}% vs área` 
              : `${(((effectiveScore - directorateAvg) / 5) * 100).toFixed(1)}% vs área`}
          </div>
        </div>

        {/* 5. Organización Global */}
        <div className="p-3.5 rounded-xl border border-zinc-200/90 bg-gradient-to-br from-zinc-50 to-white shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-700"></span>
              Organización
            </span>
            <span className="text-[9px] font-mono font-bold text-zinc-600 bg-zinc-200/70 px-1.5 py-0.5 rounded-md">
              Canguro C.A.
            </span>
          </div>
          <div className="my-2">
            <div className="text-xl font-bold font-mono text-zinc-950 leading-none">
              {((organizationAvg / 5) * 100).toFixed(1)}%
              <span className="text-xs text-zinc-400 font-normal ml-1">({organizationAvg.toFixed(2)} pts)</span>
            </div>
            <div className="text-[11px] text-zinc-500 truncate mt-1">
              Media Corporativa
            </div>
          </div>
          <div className="text-[10px] font-mono text-zinc-600 font-semibold pt-1 border-t border-zinc-100">
            {effectiveScore >= organizationAvg 
              ? `+${(((effectiveScore - organizationAvg) / 5) * 100).toFixed(1)}% vs global` 
              : `${(((effectiveScore - organizationAvg) / 5) * 100).toFixed(1)}% vs global`}
          </div>
        </div>
      </div>

      {/* 3. LIENZO SVG DE LA CAMPANA DE GAUSS (IDÉNTICO A LA IMAGEN REFERENCIAL + PINES COLABORADOR Y PARES) */}
      <div className="w-full overflow-x-auto border border-zinc-200/80 rounded-2xl bg-gradient-to-b from-zinc-50/70 via-white to-zinc-50/40 p-4 shadow-inner">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[760px] select-none"
        >
          <defs>
            {/* Gradientes verticales suaves para cada uno de los 5 tramos idénticos a la imagen referencial */}
            <linearGradient id="grad-tramo-1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.10" />
            </linearGradient>
            <linearGradient id="grad-tramo-2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.40" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.10" />
            </linearGradient>
            <linearGradient id="grad-tramo-3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="grad-tramo-4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.10" />
            </linearGradient>
            <linearGradient id="grad-tramo-5" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.10" />
            </linearGradient>

            {/* Sombras suaves de alta definición */}
            <filter id="shadowPill" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.18" />
            </filter>
            <filter id="collabGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3.5" stdDeviation="5" floodColor="#000000" floodOpacity="0.30" />
            </filter>
          </defs>

          {/* 1. TÍTULOS SUPERIORES DE CADA ZONA (CENTRADOS EXACTAMENTE SOBRE CADA TRAMO SEGÚN IMAGEN REFERENCIAL) */}
          <g className="select-none pointer-events-none">
            {tramosMeta.map(tramo => (
              <text
                key={`top-label-${tramo.id}`}
                x={(toSvgX(tramo.startT) + toSvgX(tramo.endT)) / 2}
                y={22}
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="900"
                fill={tramo.topColor}
                fontFamily="sans-serif"
              >
                {tramo.topLabel}
              </text>
            ))}
          </g>

          {/* 2. ÁREAS SOMBREADAS BAJO LA CURVA */}
          {tramosMeta.map(tramo => (
            <path
              key={`tramo-fill-${tramo.id}`}
              d={getTramoAreaPath(tramo.startT, tramo.endT)}
              fill={`url(#${tramo.gradId})`}
            />
          ))}

          {/* Líneas sutiles horizontales discontinuas dentro de la zona central verde (Desempeño Esperado) */}
          <line x1={xBounds[2]} y1={baselineY - 35} x2={xBounds[3]} y2={baselineY - 35} stroke="#16A34A" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          <line x1={xBounds[2]} y1={baselineY - 65} x2={xBounds[3]} y2={baselineY - 65} stroke="#16A34A" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          <line x1={xBounds[2]} y1={baselineY - 95} x2={xBounds[3]} y2={baselineY - 95} stroke="#16A34A" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

          {/* 3. TRAZADO CONTINUO DE LA CAMPANA (Trazo Principal Nítido) */}
          <path
            d={fullPathD}
            fill="none"
            stroke="#0F172A"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 4. LÍNEAS SEPARADORAS DE TRAMOS VERTICALES DISCONTINUAS */}
          {xBounds.slice(1, -1).map((xVal, idx) => (
            <line
              key={`bound-${idx}`}
              x1={xVal}
              y1={28}
              x2={xVal}
              y2={baselineY}
              stroke="#94A3B8"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.8"
            />
          ))}

          {/* INDICADOR DE BRECHA VISUAL ENTRE COLABORADOR Y PARES EN LA CURVA */}
          {Math.abs(xCollab - xPeers) > 22 && (
            <g transform={`translate(${(xCollab + xPeers) / 2}, ${baselineY - 14})`}>
              <rect
                x="-46"
                y="-10"
                width="92"
                height="20"
                rx="10"
                fill={diffPct >= 0 ? '#059669' : '#DC2626'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="9"
                fontWeight="900"
                fontFamily="monospace"
              >
                {diffPct >= 0 ? `▲ +${diffPct.toFixed(1)}%` : `▼ ${diffPct.toFixed(1)}%`} vs Pares
              </text>
            </g>
          )}

          {/* 5. PIN 1: COLABORADOR EVALUADO (DORADO / ÁMBAR) */}
          <g>
            <line
              x1={xCollab}
              y1={yCollab}
              x2={xCollab}
              y2={baselineY}
              stroke="#D97706"
              strokeWidth="2.4"
              strokeDasharray="4 3"
            />
            <circle
              cx={xCollab}
              cy={yCollab}
              r="12"
              fill="#F59E0B"
              fillOpacity="0.25"
            />
            <circle
              cx={xCollab}
              cy={yCollab}
              r="6"
              fill="#F59E0B"
              stroke="#09090B"
              strokeWidth="2"
            />
            <circle cx={xCollab} cy={yCollab} r="2" fill="#FFFFFF" />

            {/* Callout flotante del Colaborador Evaluado */}
            <g filter="url(#collabGlow)">
              <rect
                x={collabBoxX}
                y={collabBoxY}
                width={cardW}
                height={cardH}
                rx="8"
                fill="#09090B"
                stroke="#F59E0B"
                strokeWidth="2"
              />
              <polygon
                points={`${xCollab - 6},${collabBoxY + cardH} ${xCollab + 6},${collabBoxY + cardH} ${xCollab},${collabBoxY + cardH + 6}`}
                fill="#09090B"
              />
              <text
                x={collabBoxX + cardW / 2}
                y={collabBoxY + 14}
                textAnchor="middle"
                fill="#FBBF24"
                fontSize="8.5"
                fontWeight="900"
                fontFamily="sans-serif"
                letterSpacing="0.4"
              >
                ★ COLABORADOR EVALUADO
              </text>
              <text
                x={collabBoxX + cardW / 2}
                y={collabBoxY + 29}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="12.5"
                fontWeight="900"
                fontFamily="monospace"
              >
                {pctScore.toFixed(1)}% <tspan fontSize="9.5" fill="#CBD5E1">({effectiveScore.toFixed(2)} pts)</tspan>
              </text>
              <text
                x={collabBoxX + cardW / 2}
                y={collabBoxY + 41.5}
                textAnchor="middle"
                fill="#FDE68A"
                fontSize="8"
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                {tramosMeta[currentTramoId - 1].name}
              </text>
            </g>
          </g>

          {/* 6. PIN 2: PROMEDIO DE PARES (AZUL BRILLANTE / CIAN) */}
          <g>
            <line
              x1={xPeers}
              y1={yPeers}
              x2={xPeers}
              y2={baselineY}
              stroke="#0284C7"
              strokeWidth="2.4"
              strokeDasharray="4 3"
            />
            <circle
              cx={xPeers}
              cy={yPeers}
              r="12"
              fill="#0284C7"
              fillOpacity="0.25"
            />
            <circle
              cx={xPeers}
              cy={yPeers}
              r="6"
              fill="#0284C7"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <circle cx={xPeers} cy={yPeers} r="2" fill="#FFFFFF" />

            {/* Callout flotante del Promedio de Pares */}
            <g filter="url(#shadowPill)">
              <rect
                x={peersBoxX}
                y={peersBoxY}
                width={cardW}
                height={cardH}
                rx="8"
                fill="#0F172A"
                stroke="#38BDF8"
                strokeWidth="2"
              />
              <polygon
                points={`${xPeers - 6},${peersBoxY + cardH} ${xPeers + 6},${peersBoxY + cardH} ${xPeers},${peersBoxY + cardH + 6}`}
                fill="#0F172A"
              />
              <text
                x={peersBoxX + cardW / 2}
                y={peersBoxY + 14}
                textAnchor="middle"
                fill="#38BDF8"
                fontSize="8.5"
                fontWeight="900"
                fontFamily="sans-serif"
                letterSpacing="0.4"
              >
                👥 PROMEDIO DE PARES
              </text>
              <text
                x={peersBoxX + cardW / 2}
                y={peersBoxY + 29}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="12.5"
                fontWeight="900"
                fontFamily="monospace"
              >
                {pctPeers.toFixed(1)}% <tspan fontSize="9.5" fill="#94A3B8">({effectivePeersScore.toFixed(2)} pts)</tspan>
              </text>
              <text
                x={peersBoxX + cardW / 2}
                y={peersBoxY + 41.5}
                textAnchor="middle"
                fill="#BAE6FD"
                fontSize="8"
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                {effectivePeersCount} Pares • {tramosMeta[peersTramoId - 1].name}
              </text>
            </g>
          </g>

          {/* 7. BLOQUES HORIZONTALES SÓLIDOS DE RANGO EN LA LÍNEA BASE (IDÉNTICOS A LA IMAGEN) */}
          {tramosMeta.map(tramo => {
            const startX = toSvgX(tramo.startT);
            const endX = toSvgX(tramo.endT);
            const width = endX - startX;
            return (
              <g key={`solid-block-${tramo.id}`}>
                <rect
                  x={startX}
                  y={baselineY}
                  width={width}
                  height={28}
                  fill={tramo.solidColor}
                />
                <text
                  x={startX + width / 2}
                  y={baselineY + 18.5}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="12"
                  fontWeight="900"
                  fontFamily="sans-serif"
                >
                  {tramo.bandLabel}
                </text>
              </g>
            );
          })}

          {/* 8. EJE REGLA INFERIOR CON MARCAS VERTICALES (IDÉNTICO A LA IMAGEN) */}
          <line
            x1={xBounds[0]}
            y1={baselineY + 28}
            x2={xBounds[5]}
            y2={baselineY + 28}
            stroke="#0F172A"
            strokeWidth="2"
          />
          {xBounds.map((x, i) => (
            <line
              key={`tick-${i}`}
              x1={x}
              y1={baselineY + 23}
              x2={x}
              y2={baselineY + 33}
              stroke="#0F172A"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      {/* 4. RESUMEN EJECUTIVO: COMPARATIVA INDIVIDUAL VS. PARES */}
      <div className="mt-4 p-4 rounded-xl border border-blue-200/90 bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-amber-50/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${diffPct >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-zinc-950 flex items-center gap-2">
              <span>Diagnóstico Comparativo frente a Pares ({positionTitle})</span>
              <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                diffPct >= 0 ? 'bg-emerald-200/80 text-emerald-950' : 'bg-amber-200/80 text-amber-950'
              }`}>
                {diffPct >= 0 ? `+${diffPct.toFixed(1)}% VENTAJA` : `${diffPct.toFixed(1)}% DESVIACIÓN`}
              </span>
            </div>
            <p className="text-[11.5px] text-zinc-600 mt-0.5 leading-relaxed">
              {diffPct > 5
                ? `El colaborador ${collaboratorName} supera el promedio de sus pares (${pctPeers.toFixed(1)}%) en +${diffPct.toFixed(1)}% (+${diffScore.toFixed(2)} pts), ubicándose en el tramo de ${tramosMeta[currentTramoId - 1].name} y habilitando elegibilidad para aceleración de carrera.`
                : diffPct >= -5
                  ? `El colaborador ${collaboratorName} se encuentra plenamente alineado al promedio de sus pares (${pctPeers.toFixed(1)}%) con una diferencia de ${diffPct > 0 ? `+${diffPct.toFixed(1)}%` : `${diffPct.toFixed(1)}%`}, consolidando el desempeño esperado del cargo.`
                  : `El colaborador ${collaboratorName} se ubica por debajo del promedio de sus pares (${pctPeers.toFixed(1)}%) en ${diffPct.toFixed(1)}% (${diffScore.toFixed(2)} pts). Se requiere activar plan de acompañamiento quincenal y fortalecimiento de brechas.`}
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 font-mono text-[11px] bg-white px-3 py-1.5 rounded-lg border border-zinc-200 shadow-2xs">
          <span className="text-zinc-500">Muestra:</span>
          <strong className="text-zinc-900">{effectivePeersCount} pares del cargo</strong>
        </div>
      </div>

      {/* 5. TARJETAS DE LOS 5 TRAMOS DE LA GUÍA DE MÉRITO (IDÉNTICAS A LA IMAGEN REFERENCIAL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-5">
        {tramosMeta.map(tramo => {
          const isCollabActive = tramo.id === currentTramoId;
          const isPeersActive = tramo.id === peersTramoId;

          return (
            <div
              key={`tramo-card-${tramo.id}`}
              className={`rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 border-2 relative ${
                isCollabActive
                  ? `${tramo.activeRing} ring-2 shadow-lg -translate-y-1`
                  : `${tramo.cardBg} ${tramo.cardBorder} hover:shadow-xs`
              }`}
            >
              {/* Badges superiores si coincide con el Colaborador o sus Pares */}
              <div className="flex flex-col gap-1 items-center mb-1">
                {isCollabActive && (
                  <div className="bg-zinc-950 text-amber-400 border border-amber-400 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Ubicación del Evaluado</span>
                  </div>
                )}
                {isPeersActive && (
                  <div className="bg-blue-950 text-cyan-300 border border-cyan-400 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 whitespace-nowrap">
                    <Users className="w-2.5 h-2.5" />
                    <span>Promedio de Pares</span>
                  </div>
                )}
              </div>

              {/* Rango Superior */}
              <div className="text-center font-bold text-xs text-zinc-700 font-sans tracking-tight mb-1.5 pt-1">
                {tramo.rangeDisplay}
              </div>

              {/* Título Oficial en Mayúsculas con Color del Tramo */}
              <div className={`text-center font-black text-xs uppercase tracking-tight mb-3.5 ${tramo.textColor}`}>
                {tramo.name}
              </div>

              {/* Tarjeta interna blanca con la política / acción idéntica a la imagen referencial */}
              <div className="bg-white rounded-xl p-3 border border-zinc-200/90 shadow-2xs text-center flex items-center justify-center min-h-[64px]">
                <p className="text-[11px] font-medium text-zinc-800 leading-snug">
                  {tramo.policy}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. GUÍA METODOLÓGICA DE GESTIÓN DE CONSECUENCIAS DEL RENDIMIENTO */}
      <div className="mt-6 bg-slate-50/70 border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-slate-700" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans">
            ¿Qué criterio se debe usar para gestionar las consecuencias del rendimiento?
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {/* Desempeño Insatisfactorio */}
          <div className="bg-white border-2 border-red-500 rounded-xl p-3 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="font-black text-red-800 uppercase tracking-tight text-[11px] pb-1 border-b border-red-100">
                Desempeño Insatisfactorio
              </div>
              <p className="text-[10.5px] text-zinc-700 mt-2 leading-relaxed">
                Menos de <strong>54%</strong> del objetivo establecido (de 0 a ≤ 54%).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-red-50 text-[10px] text-red-900 font-semibold bg-red-50/60 p-2 rounded-lg">
              Desvinculación por desempeño.
            </div>
          </div>

          {/* En Desarrollo */}
          <div className="bg-white border-2 border-amber-400 rounded-xl p-3 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="font-black text-amber-800 uppercase tracking-tight text-[11px] pb-1 border-b border-amber-100">
                En Desarrollo
              </div>
              <p className="text-[10.5px] text-zinc-700 mt-2 leading-relaxed">
                Se establece entre <strong>55% y 65%</strong> del objetivo establecido.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-50 text-[10px] text-amber-900 font-semibold bg-amber-50/60 p-2 rounded-lg">
              Plan de acción correctivo inmediato y seguimiento acelerado (30 a 60 días).
            </div>
          </div>

          {/* Desempeño Esperado */}
          <div className="bg-white border-2 border-emerald-500 rounded-xl p-3 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="font-black text-emerald-800 uppercase tracking-tight text-[11px] pb-1 border-b border-emerald-100">
                Desempeño Esperado
              </div>
              <p className="text-[10.5px] text-zinc-700 mt-2 leading-relaxed">
                Se establece entre <strong>66% y 79%</strong> del objetivo establecido (Meta institucional).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-50 text-[10px] text-emerald-900 font-semibold bg-emerald-50/60 p-2 rounded-lg">
              Plan de consolidación y fortalecimiento, coaching en brechas y seguimiento quincenal.
            </div>
          </div>

          {/* Desempeño Sobresaliente */}
          <div className="bg-white border-2 border-blue-500 rounded-xl p-3 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="font-black text-blue-800 uppercase tracking-tight text-[11px] pb-1 border-b border-blue-100">
                Desempeño Sobresaliente
              </div>
              <p className="text-[10.5px] text-zinc-700 mt-2 leading-relaxed">
                Se establece con el desempeño entre <strong>80% y 100%</strong> de los objetivos.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-blue-50 text-[10px] text-blue-900 font-semibold bg-blue-50/60 p-2 rounded-lg">
              Oportunidades de aceleración de carrera y reconocimiento de alto desempeño.
            </div>
          </div>

          {/* Desempeño Excepcional */}
          <div className="bg-white border-2 border-purple-500 rounded-xl p-3 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="font-black text-purple-800 uppercase tracking-tight text-[11px] pb-1 border-b border-purple-100">
                Desempeño Excepcional
              </div>
              <p className="text-[10.5px] text-zinc-700 mt-2 leading-relaxed">
                Supera ampliamente los objetivos con <strong>101% a 125%</strong> de cumplimiento.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-purple-50 text-[10px] text-purple-900 font-semibold bg-purple-50/60 p-2 rounded-lg">
              Pool de talentos, elegibilidad inmediata para sucesión e incentivos superiores.
            </div>
          </div>
        </div>
      </div>

      {/* 7. GOBERNANZA INSTITUCIONAL */}
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span>
            <strong>Gobernanza de Calibración Canguro:</strong> Los colaboradores en <strong>Desempeño Excepcional (101% - 125%)</strong> son elegibles como <strong>Candidatos para Promoción / Matriz de Sucesión</strong> y acreedores de <strong>Incentivos Superiores</strong>.
          </span>
        </div>
        <div className="text-[11px] font-mono text-zinc-500 bg-white px-2 py-1 rounded border border-zinc-200">
          Distribución Normal • DTH-GFD-MC-01
        </div>
      </div>
    </div>
  );
}

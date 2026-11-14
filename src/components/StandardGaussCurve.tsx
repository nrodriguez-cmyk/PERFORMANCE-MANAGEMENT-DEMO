import React from 'react';
import { Sparkles, Users } from 'lucide-react';

export interface GaussPin {
  score: number;        // Puntaje en escala 1-5 o porcentaje 0-125%
  label: string;        // Nombre del pin (ej: 'Colaborador Evaluado', 'Media de la Dirección')
  sublabel?: string;     // Detalle adicional (ej: '4.10 pts', '78 Colaboradores')
  color?: string;        // Color distintivo (default: '#F1B400')
  isPrimary?: boolean;   // Si es el pin principal (dorado / destacado)
  icon?: 'user' | 'team' | 'org';
}

export interface StandardGaussCurveProps {
  pins?: GaussPin[];
  tierCounts?: Record<1 | 2 | 3 | 4 | 5, number>;
  totalCount?: number;
  highlightedTierId?: number;
  showCards?: boolean;        // Mostrar las 5 tarjetas de política inferiores (default: true)
  showGuidelines?: boolean;   // Mostrar preguntas / guías metodológicas
  className?: string;
  subtitle?: string;
}

export interface GaussTierDefinition {
  id: 1 | 2 | 3 | 4 | 5;
  name: string;
  topLabel: string;
  rangeDisplay: string;
  bandLabel: string;
  policy: string;
  startT: number;
  endT: number;
  solidColor: string;
  topColor: string;
  gradId: string;
  cardBg: string;
  cardBorder: string;
  textColor: string;
  activeRing: string;
  theoreticalPct: string;
}

export const OFFICIAL_GAUSS_TIERS: GaussTierDefinition[] = [
  {
    id: 1,
    name: 'DESEMPEÑO INSATISFACTORIO',
    topLabel: 'Desempeño Insatisfactorio',
    rangeDisplay: 'de 0 a <= 54%',
    bandLabel: '< 54%',
    policy: 'Desvinculación por desempeño',
    startT: 0.0,
    endT: 0.18,
    solidColor: '#EF4444',
    topColor: '#DC2626',
    gradId: 'std-gauss-t1',
    cardBg: 'bg-[#FFF5F5]',
    cardBorder: 'border-[#FECDD3]',
    textColor: 'text-[#DC2626]',
    activeRing: 'ring-rose-500 border-rose-500 shadow-md',
    theoreticalPct: '5%'
  },
  {
    id: 2,
    name: 'EN DESARROLLO',
    topLabel: 'En Desarrollo',
    rangeDisplay: '~ 55% a <= 65%',
    bandLabel: '55% - 65%',
    policy: 'Plan de acción correctivo inmediato y seguimiento acelerado (30 a 60 días).',
    startT: 0.18,
    endT: 0.38,
    solidColor: '#F59E0B',
    topColor: '#D97706',
    gradId: 'std-gauss-t2',
    cardBg: 'bg-[#FEFCE8]',
    cardBorder: 'border-[#FEF08A]',
    textColor: 'text-[#D97706]',
    activeRing: 'ring-amber-500 border-amber-500 shadow-md',
    theoreticalPct: '20%'
  },
  {
    id: 3,
    name: 'DESEMPEÑO ESPERADO',
    topLabel: 'Desempeño Esperado',
    rangeDisplay: '~ 66% a <= 79%',
    bandLabel: '66% - 79%',
    policy: 'Plan de consolidación y fortalecimiento, coaching en brechas y seguimiento quincenal.',
    startT: 0.38,
    endT: 0.65,
    solidColor: '#16A34A',
    topColor: '#16A34A',
    gradId: 'std-gauss-t3',
    cardBg: 'bg-[#F0FDF4]',
    cardBorder: 'border-[#BBF7D0]',
    textColor: 'text-[#16A34A]',
    activeRing: 'ring-emerald-500 border-emerald-500 shadow-md',
    theoreticalPct: '50%'
  },
  {
    id: 4,
    name: 'DESEMPEÑO SOBRESALIENTE',
    topLabel: 'Desempeño Sobresaliente',
    rangeDisplay: '~ 80% a <= 100%',
    bandLabel: '80% - 100%',
    policy: 'Oportunidades de aceleración de carrera.',
    startT: 0.65,
    endT: 0.84,
    solidColor: '#2563EB',
    topColor: '#2563EB',
    gradId: 'std-gauss-t4',
    cardBg: 'bg-[#EFF6FF]',
    cardBorder: 'border-[#BFDBFE]',
    textColor: 'text-[#2563EB]',
    activeRing: 'ring-blue-500 border-blue-500 shadow-md',
    theoreticalPct: '20%'
  },
  {
    id: 5,
    name: 'DESEMPEÑO EXCEPCIONAL',
    topLabel: 'Desempeño Excepcional',
    rangeDisplay: '~ 101 a <= 125%',
    bandLabel: '101% - 125%',
    policy: 'Pool de talentos, elegibilidad inmediata para sucesión e incentivos superiores.',
    startT: 0.84,
    endT: 1.0,
    solidColor: '#9333EA',
    topColor: '#9333EA',
    gradId: 'std-gauss-t5',
    cardBg: 'bg-[#FAF5FF]',
    cardBorder: 'border-[#E9D5FF]',
    textColor: 'text-[#9333EA]',
    activeRing: 'ring-purple-500 border-purple-500 shadow-md',
    theoreticalPct: '5%'
  }
];

/**
 * Componente Institucional Estandarizado de la Campana de Gauss de Calibración
 * Reproduce al 100% el diseño visual oficial proporcionado por la dirección.
 */
export function StandardGaussCurve({
  pins = [],
  tierCounts,
  totalCount,
  highlightedTierId,
  showCards = true,
  className = ''
}: StandardGaussCurveProps) {
  const svgWidth = 960;
  const svgHeight = 280;
  const paddingX = 40;
  const plotWidth = svgWidth - paddingX * 2; // 880 px
  const baselineY = 195;
  const peakY = 55;
  const curveHeight = baselineY - peakY; // 140 px

  // Coordenadas horizontales de los 5 tramos
  const tBounds = [0.0, 0.18, 0.38, 0.65, 0.84, 1.0];
  const toSvgX = (t: number): number => paddingX + t * plotWidth;
  const xBounds = tBounds.map(t => toSvgX(t));

  // Función matemática Gaussiana continua
  const gaussianDensity = (t: number): number => {
    const sigma = 0.175;
    const z = (t - 0.515) / sigma;
    return Math.exp(-0.5 * z * z);
  };

  const toSvgY = (t: number): number => {
    const density = gaussianDensity(t);
    return baselineY - density * curveHeight;
  };

  // Mapeo de puntaje a posición t in [0, 1]
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

  // Mapeo de puntaje a Tramo (1-5)
  const scoreToTierId = (val: number): 1 | 2 | 3 | 4 | 5 => {
    const pct = val <= 5.0 ? (val / 5.0) * 100 : val;
    if (pct <= 54) return 1;
    if (pct <= 65) return 2;
    if (pct <= 79) return 3;
    if (pct <= 100) return 4;
    return 5;
  };

  // Generación de puntos continuos de la curva
  const numSteps = 160;
  const curvePoints: Array<{ x: number; y: number; t: number }> = [];
  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    curvePoints.push({
      t,
      x: toSvgX(t),
      y: toSvgY(t)
    });
  }

  const fullPathD = curvePoints.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  // Helper para construir el área coloreada bajo cada tramo
  const getAreaD = (startT: number, endT: number): string => {
    const pts = curvePoints.filter(p => p.t >= startT && p.t <= endT);
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

  return (
    <div className={`space-y-5 ${className}`}>
      {/* 1. LIENZO DE LA CAMPANA DE GAUSS (100% IDÉNTICO A LA IMAGEN ESTANDARIZADA) */}
      <div className="w-full overflow-x-auto border border-zinc-200/90 rounded-2xl bg-white p-4 sm:p-6 shadow-xs">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[760px] select-none"
        >
          <defs>
            {/* Gradientes oficiales de los 5 tramos */}
            <linearGradient id="std-gauss-t1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="std-gauss-t2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.40" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="std-gauss-t3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="std-gauss-t4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="std-gauss-t5" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.12" />
            </linearGradient>

            {/* Sombra sutil para pines flotantes */}
            <filter id="std-pin-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* 1. TÍTULOS SUPERIORES DE CADA ZONA (CENTRADOS EXACTAMENTE SOBRE CADA TRAMO) */}
          <g className="select-none pointer-events-none">
            {OFFICIAL_GAUSS_TIERS.map(tramo => (
              <text
                key={`top-label-${tramo.id}`}
                x={(toSvgX(tramo.startT) + toSvgX(tramo.endT)) / 2}
                y={22}
                textAnchor="middle"
                fontSize="12"
                fontWeight="900"
                fill={tramo.topColor}
                fontFamily="sans-serif"
              >
                {tramo.topLabel}
              </text>
            ))}
          </g>

          {/* 2. ÁREAS SOMBREADAS BAJO LA CURVA */}
          {OFFICIAL_GAUSS_TIERS.map(tramo => (
            <path
              key={`tramo-fill-${tramo.id}`}
              d={getAreaD(tramo.startT, tramo.endT)}
              fill={`url(#${tramo.gradId})`}
            />
          ))}

          {/* Líneas sutiles horizontales discontinuas dentro de la zona central verde (Desempeño Esperado) */}
          <line x1={xBounds[2]} y1={baselineY - 35} x2={xBounds[3]} y2={baselineY - 35} stroke="#16A34A" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
          <line x1={xBounds[2]} y1={baselineY - 65} x2={xBounds[3]} y2={baselineY - 65} stroke="#16A34A" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
          <line x1={xBounds[2]} y1={baselineY - 95} x2={xBounds[3]} y2={baselineY - 95} stroke="#16A34A" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />

          {/* 3. TRAZADO CONTINUO DE LA CAMPANA (Línea Principal Sólida) */}
          <path
            d={fullPathD}
            fill="none"
            stroke="#1E293B"
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
              opacity="0.85"
            />
          ))}

          {/* 5. BLOQUES HORIZONTALES SÓLIDOS DE RANGO EN LA LÍNEA BASE (IDÉNTICOS A LA IMAGEN) */}
          {OFFICIAL_GAUSS_TIERS.map(tramo => {
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

          {/* 6. EJE REGLA INFERIOR CON MARCAS VERTICALES (IDÉNTICO A LA IMAGEN) */}
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

          {/* 7. PINES DINÁMICOS SUPERPUESTOS (SI EXISTEN: EJ. MEDIA DE DIRECCIÓN O COLABORADOR) */}
          {pins.map((pin, pIdx) => {
            const t = scoreToT(pin.score);
            const x = toSvgX(t);
            const y = toSvgY(t);
            const pinColor = pin.color || '#F1B400';
            const boxW = 150;
            const boxH = 44;
            const boxX = Math.max(10, Math.min(svgWidth - boxW - 10, x - boxW / 2));
            const boxY = Math.max(38, y - 56);

            return (
              <g key={`pin-${pIdx}`} className="select-none">
                {/* Línea vertical conectora */}
                <line
                  x1={x}
                  y1={y}
                  x2={x}
                  y2={baselineY}
                  stroke={pinColor}
                  strokeWidth="2.4"
                  strokeDasharray="4 3"
                />
                {/* Anillo de pulso */}
                <circle cx={x} cy={y} r="10" fill={pinColor} fillOpacity="0.25" />
                <circle cx={x} cy={y} r="5" fill={pinColor} stroke="#0F172A" strokeWidth="2" />
                <circle cx={x} cy={y} r="1.5" fill="#FFFFFF" />

                {/* Callout flotante del Pin */}
                <g filter="url(#std-pin-shadow)">
                  <rect
                    x={boxX}
                    y={boxY}
                    width={boxW}
                    height={boxH}
                    rx="8"
                    fill="#0F172A"
                    stroke={pinColor}
                    strokeWidth="2"
                  />
                  <polygon
                    points={`${x - 5},${boxY + boxH} ${x + 5},${boxY + boxH} ${x},${boxY + boxH + 5}`}
                    fill="#0F172A"
                  />
                  <text
                    x={boxX + boxW / 2}
                    y={boxY + 14}
                    textAnchor="middle"
                    fill={pinColor}
                    fontSize="9"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    letterSpacing="0.3"
                  >
                    {pin.label.toUpperCase()}
                  </text>
                  <text
                    x={boxX + boxW / 2}
                    y={boxY + 28}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="11.5"
                    fontWeight="900"
                    fontFamily="monospace"
                  >
                    {pin.sublabel || `${(pin.score <= 5 ? (pin.score / 5) * 100 : pin.score).toFixed(1)}%`}
                  </text>
                  <text
                    x={boxX + boxW / 2}
                    y={boxY + 39}
                    textAnchor="middle"
                    fill="#CBD5E1"
                    fontSize="7.5"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    {OFFICIAL_GAUSS_TIERS[scoreToTierId(pin.score) - 1].name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 2. TARJETAS DE LOS 5 TRAMOS DE LA GUÍA DE MÉRITO (100% IDÉNTICAS A LA IMAGEN) */}
      {showCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {OFFICIAL_GAUSS_TIERS.map(tramo => {
            const count = tierCounts ? (tierCounts[tramo.id] || 0) : undefined;
            const pct = count !== undefined && totalCount && totalCount > 0
              ? Math.round((count / totalCount) * 100)
              : undefined;
            const isHighlighted = highlightedTierId === tramo.id;

            return (
              <div
                key={`tramo-card-${tramo.id}`}
                className={`rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 border-2 relative ${
                  isHighlighted
                    ? `${tramo.activeRing} ring-2 shadow-lg -translate-y-1`
                    : `${tramo.cardBg} ${tramo.cardBorder} hover:shadow-xs`
                }`}
              >
                {/* Rango Superior */}
                <div className="text-center font-bold text-xs text-zinc-700 font-sans tracking-tight mb-1.5 pt-1">
                  {tramo.rangeDisplay}
                </div>

                {/* Título Oficial en Mayúsculas con Color del Tramo */}
                <div className={`text-center font-black text-xs uppercase tracking-tight mb-3 ${tramo.textColor}`}>
                  {tramo.name}
                </div>

                {/* Tarjeta interna blanca con la política / acción institucional */}
                <div className="bg-white rounded-xl p-3 border border-zinc-200/90 shadow-2xs text-center flex items-center justify-center min-h-[64px]">
                  <p className="text-[11px] font-medium text-zinc-800 leading-snug">
                    {tramo.policy}
                  </p>
                </div>

                {/* Si hay datos poblacionales registrados: Badge inferior con censo */}
                {count !== undefined && (
                  <div className="mt-3 pt-2.5 border-t border-zinc-200/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-600 font-bold">Población:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-zinc-900 font-black">{count}</strong>
                      {pct !== undefined && (
                        <span className="px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-800 font-black text-[10px]">
                          {pct}%
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-400 font-normal">
                        (Meta: {tramo.theoreticalPct})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

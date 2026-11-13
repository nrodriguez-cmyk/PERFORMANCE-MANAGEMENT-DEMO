import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Star, ShieldAlert, Award, TrendingUp, Sparkles, Target, Compass, CheckCircle2, UserCheck, Info } from 'lucide-react';

interface NineBoxProps {
  performanceScore: number;
  potentialScore: number;
  collaboratorName?: string;
  isPromotionContext?: boolean;
  targetPosition?: string;
}

// Eje X: Sección 1 (Desempeño / KPIs): Bajo: < 3.00, Medio: 3.00 - 4.24, Alto: >= 4.25
const getPerfCategoryIndex = (score: number) => {
  if (score < 3.00) return 0;
  if (score < 4.25) return 1;
  return 2;
};

// Eje Y: Sección 3 (Potencial y Liderazgo): Bajo: < 3.00, Medio: 3.00 - 4.24, Alto: >= 4.25
const getPotCategoryIndex = (score: number) => {
  if (score < 3.00) return 0;
  if (score < 4.25) return 1;
  return 2;
};

export function NineBox({
  performanceScore,
  potentialScore,
  collaboratorName = 'Colaborador',
  isPromotionContext = false,
  targetPosition
}: NineBoxProps) {
  const isPending = performanceScore <= 0 && potentialScore <= 0;
  const perfIdx = getPerfCategoryIndex(performanceScore);
  const potIdx = getPotCategoryIndex(potentialScore);
  const isPromotionEligible = !isPending && perfIdx >= 1 && potIdx >= 1;

  // Cuadrantes 9-Box calibrados con la matriz de referencia institucional y degradado en escala de amarillos
  const boxes = [
    // Fila 2: Y = Alto Potencial (>= 4.25)
    {
      r: 2, c: 0,
      id: 'alto_pot_bajo_perf',
      title: 'Alto Potencial / Bajo Desempeño',
      shortTitle: 'Alto Pot / Bajo Des',
      coord: '[B-A]',
      yLevel: 'Alto (≥ 4.25)',
      xLevel: 'Bajo (< 3.00)',
      categoryTag: 'Enigma / Talento Inconsistente',
      action: 'Incluirle en programas de desarrollo para mejorar su desempeño.',
      desc: 'Evidencia alto potencial cognitivo y visión estratégica, pero no concreta en resultados cuantitativos inmediatos. Puede estar mal ubicado en el rol o requerir mayor rigor de ejecución.',
      pdi70: 'Acompañamiento directo en proyectos estructurados con entregables semanales',
      pdi20: 'Mentoría técnica con líder referente',
      pdi10: 'Gestión efectiva del tiempo y priorización',
      colorTheme: {
        border: 'border-amber-400/90 dark:border-amber-600/60',
        activeBorder: 'border-amber-600 ring-2 ring-amber-500',
        bg: 'bg-gradient-to-br from-[#FEF08A] via-[#FDE047]/90 to-[#FACC15]/75',
        activeBg: 'bg-gradient-to-br from-[#FEF08A] via-[#FDE047] to-[#FACC15]',
        accentBar: 'bg-amber-500',
        tagBg: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
        badge: 'text-amber-950'
      },
      icon: TrendingUp
    },
    {
      r: 2, c: 1,
      id: 'alto_pot_medio_perf',
      title: 'Alto Potencial / Medio Desempeño',
      shortTitle: 'Alto Pot / Medio Des',
      coord: '[M-A]',
      yLevel: 'Alto (≥ 4.25)',
      xLevel: 'Medio (3.00 - 4.24)',
      categoryTag: 'Líder en Potencia',
      action: 'Exponerles a nuevos retos en su rol actual, hacer seguimiento a sus avances y brindarle formación de calidad para fortalecer su rendimiento.',
      desc: 'Demuestra capacidades de liderazgo y adaptabilidad superiores a su rol actual con un desempeño sólido. Es el semillero natural para posiciones de supervisión y coordinación.',
      pdi70: 'Liderazgo de iniciativas transversales de optimización',
      pdi20: 'Coaching directivo con Gerencia de Área',
      pdi10: 'Programa de Desarrollo de Liderazgo Canguro',
      colorTheme: {
        border: 'border-amber-500 dark:border-amber-500/70',
        activeBorder: 'border-amber-700 ring-2 ring-amber-600',
        bg: 'bg-gradient-to-br from-[#FDE047] via-[#FACC15] to-[#F1B400]/85',
        activeBg: 'bg-gradient-to-br from-[#FDE047] via-[#FACC15] to-[#F1B400]',
        accentBar: 'bg-amber-600',
        tagBg: 'bg-amber-200 text-amber-950 border-amber-400 font-bold',
        badge: 'text-amber-950'
      },
      icon: Award
    },
    {
      r: 2, c: 2,
      id: 'alto_pot_alto_perf',
      title: 'Alto Potencial / Alto Desempeño',
      shortTitle: 'Alto Pot / Alto Des',
      coord: '[A-A]',
      yLevel: 'Alto (≥ 4.25)',
      xLevel: 'Alto (≥ 4.25)',
      categoryTag: 'Futura Estrella / Top Talent',
      action: 'Incluirle en programas de desarrollo de liderazgo, asignar proyectos desafiantes y considera planes de sucesión.',
      desc: 'Máximo talento del Universo Canguro. Desempeño sobresaliente constante y capacidad probada de liderazgo integral. Candidato prioritario para sucesión de alta jerarquía.',
      pdi70: 'Dirección de proyectos de innovación corporativa y expansión',
      pdi20: 'Sombra ejecutiva de Dirección General',
      pdi10: 'Programa de Alta Dirección y Estrategia',
      isStar: true,
      colorTheme: {
        border: 'border-amber-600 shadow-md shadow-amber-400/30',
        activeBorder: 'border-amber-800 ring-2 ring-amber-600',
        bg: 'bg-gradient-to-br from-[#FACC15] via-[#F1B400] to-[#EAB308]',
        activeBg: 'bg-gradient-to-br from-[#FACC15] via-[#F1B400] to-[#D97706]',
        accentBar: 'bg-[#F1B400]',
        tagBg: 'bg-[#F1B400] text-zinc-950 font-black border-amber-600 shadow-xs',
        badge: 'text-zinc-950'
      },
      icon: Star
    },

    // Fila 1: Y = Medio Potencial (3.00 - 4.24)
    {
      r: 1, c: 0,
      id: 'medio_pot_bajo_perf',
      title: 'Medio Potencial / Bajo Desempeño',
      shortTitle: 'Medio Pot / Bajo Des',
      coord: '[B-M]',
      yLevel: 'Medio (3.00 - 4.24)',
      xLevel: 'Bajo (< 3.00)',
      categoryTag: 'Dilema / Requiere Enfoque',
      action: 'Proporcionarles programas de capacitación y desarrollo para mejorar su desempeño.',
      desc: 'Potencial regular pero con fluctuaciones en cumplimiento de metas cuantitativas. Necesita mayor rigor en el seguimiento de prioridades y retroalimentación oportuna.',
      pdi70: 'Refuerzo de procesos críticos mediante checklist diario',
      pdi20: 'Tutoría técnica de pares y sesiones de feedback',
      pdi10: 'Cursos técnicos de especialidad en el puesto',
      colorTheme: {
        border: 'border-amber-200 dark:border-amber-700/60',
        activeBorder: 'border-amber-500 ring-2 ring-amber-400',
        bg: 'bg-gradient-to-br from-[#FEFCE8] via-[#FEF9C3]/80 to-[#FEF08A]/60',
        activeBg: 'bg-gradient-to-br from-[#FEF9C3] via-[#FEF08A] to-[#FDE047]/70',
        accentBar: 'bg-amber-300',
        tagBg: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
        badge: 'text-amber-950'
      },
      icon: TrendingUp
    },
    {
      r: 1, c: 1,
      id: 'medio_pot_medio_perf',
      title: 'Medio Potencial / Medio Desempeño',
      shortTitle: 'Medio Pot / Medio Des',
      coord: '[M-M]',
      yLevel: 'Medio (3.00 - 4.24)',
      xLevel: 'Medio (3.00 - 4.24)',
      categoryTag: 'Profesional Clave / Pilar Operativo',
      action: 'Proporcionarles oportunidades de desarrollo profesional y proyectos que les permitan crecer.',
      desc: 'Constituye la base de estabilidad de la organización. Cumple con constancia y fiabilidad sus objetivos operativos y demuestra valores organizacionales sólidos.',
      pdi70: 'Optimización y documentación de procedimientos operativos',
      pdi20: 'Participación en comunidades de práctica departamental',
      pdi10: 'Actualización continua y mejores prácticas de gestión',
      colorTheme: {
        border: 'border-amber-300 dark:border-amber-600/70',
        activeBorder: 'border-amber-500 ring-2 ring-amber-400',
        bg: 'bg-gradient-to-br from-[#FEF9C3] via-[#FEF08A]/85 to-[#FDE047]/70',
        activeBg: 'bg-gradient-to-br from-[#FEF08A] via-[#FDE047] to-[#FACC15]/80',
        accentBar: 'bg-amber-400',
        tagBg: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
        badge: 'text-amber-950'
      },
      icon: Award
    },
    {
      r: 1, c: 2,
      id: 'medio_pot_alto_perf',
      title: 'Medio Potencial / Alto Desempeño',
      shortTitle: 'Medio Pot / Alto Des',
      coord: '[A-M]',
      yLevel: 'Medio (3.00 - 4.24)',
      xLevel: 'Alto (≥ 4.25)',
      categoryTag: 'Alto Rendimiento / Especialista Élite',
      action: 'Proporcionarles oportunidades de desarrollo profesional y proyectos que les permitan utilizar sus habilidades al máximo.',
      desc: 'Ejecutor sobresaliente con dominio exhaustivo de sus responsabilidades actuales. Aporta resultados superiores constantes y es referente de calidad técnica para su equipo.',
      pdi70: 'Liderazgo de estándares de calidad y resolución de contingencias',
      pdi20: 'Formación y certificación como tutor interno',
      pdi10: 'Especialización técnica avanzada de vanguardia',
      colorTheme: {
        border: 'border-amber-400 dark:border-amber-500/70',
        activeBorder: 'border-amber-600 ring-2 ring-amber-500',
        bg: 'bg-gradient-to-br from-[#FDE047] via-[#FACC15] to-[#EAB308]/75',
        activeBg: 'bg-gradient-to-br from-[#FDE047] via-[#FACC15] to-[#F1B400]/90',
        accentBar: 'bg-amber-500',
        tagBg: 'bg-amber-200 text-amber-950 border-amber-400 font-bold',
        badge: 'text-amber-950'
      },
      icon: Award
    },

    // Fila 0: Y = Bajo Potencial (< 3.00)
    {
      r: 0, c: 0,
      id: 'bajo_pot_bajo_perf',
      title: 'Bajo Potencial / Bajo Desempeño',
      shortTitle: 'Bajo Pot / Bajo Des',
      coord: '[B-B]',
      yLevel: 'Bajo (< 3.00)',
      xLevel: 'Bajo (< 3.00)',
      categoryTag: 'Bajo Rendimiento / Riesgo',
      action: 'Proporcionarles apoyo y capacitación para mejorar su desempeño.',
      desc: 'Desempeño y competencias por debajo del estándar corporativo requerido. Exige intervención correctiva urgente, diagnóstico de causas y reevaluación formal.',
      pdi70: 'Metas diarias estrictas con checklist de cumplimiento',
      pdi20: 'Feedback semanal estructurado con supervisor directo',
      pdi10: 'Reinducción correctiva en procedimientos clave',
      colorTheme: {
        border: 'border-amber-200/80 dark:border-amber-800/60',
        activeBorder: 'border-amber-400 ring-2 ring-amber-300',
        bg: 'bg-gradient-to-br from-[#FEFCE8] to-[#FFFBEB]',
        activeBg: 'bg-gradient-to-br from-[#FEFCE8] via-[#FEF9C3] to-[#FEF08A]/60',
        accentBar: 'bg-amber-200',
        tagBg: 'bg-amber-50 text-amber-950 border-amber-200 font-bold',
        badge: 'text-amber-950'
      },
      icon: ShieldAlert
    },
    {
      r: 0, c: 1,
      id: 'bajo_pot_medio_perf',
      title: 'Bajo Potencial / Medio Desempeño',
      shortTitle: 'Bajo Pot / Medio Des',
      coord: '[M-B]',
      yLevel: 'Bajo (< 3.00)',
      xLevel: 'Medio (3.00 - 4.24)',
      categoryTag: 'Efectivo / Rutinario Confiable',
      action: 'Evaluar su reubicación horizontal mediante un plan de mejora del rendimiento solicitando los puntos a mejorar.',
      desc: 'Colaborador confiable en su área de confort técnico que cumple adecuadamente pero muestra baja motivación o preparación para asumir retos de mayor complejidad.',
      pdi70: 'Mejora continua de productividad y eficiencia en tareas asignadas',
      pdi20: 'Intercambio de buenas prácticas con homólogos',
      pdi10: 'Capacitación en herramientas de trabajo operativas',
      colorTheme: {
        border: 'border-amber-200 dark:border-amber-700/60',
        activeBorder: 'border-amber-400 ring-2 ring-amber-300',
        bg: 'bg-gradient-to-br from-[#FEFCE8] via-[#FEF9C3]/70 to-[#FEF08A]/50',
        activeBg: 'bg-gradient-to-br from-[#FEF9C3] via-[#FEF08A] to-[#FDE047]/60',
        accentBar: 'bg-amber-300',
        tagBg: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
        badge: 'text-amber-950'
      },
      icon: Award
    },
    {
      r: 0, c: 2,
      id: 'bajo_pot_alto_perf',
      title: 'Bajo Potencial / Alto Desempeño',
      shortTitle: 'Bajo Pot / Alto Des',
      coord: '[A-B]',
      yLevel: 'Bajo (< 3.00)',
      xLevel: 'Alto (≥ 4.25)',
      categoryTag: 'Especialista Técnico / Confiable',
      action: 'Proporcionarles estabilidad en sus roles actuales y oportunidades para compartir su conocimiento.',
      desc: 'Excelente entrega en su rol actual con consistencia ejemplar. Prefiere la estabilidad funcional antes que asumir roles de liderazgo de personas.',
      pdi70: 'Custodia de manuales y mejores prácticas del área',
      pdi20: 'Inducción técnica a nuevos ingresos del departamento',
      pdi10: 'Actualización normativa y de estándares técnicos',
      colorTheme: {
        border: 'border-amber-300 dark:border-amber-600/60',
        activeBorder: 'border-amber-500 ring-2 ring-amber-400',
        bg: 'bg-gradient-to-br from-[#FEF9C3] via-[#FEF08A]/80 to-[#FDE047]/60',
        activeBg: 'bg-gradient-to-br from-[#FEF08A] via-[#FDE047] to-[#FACC15]/75',
        accentBar: 'bg-amber-400',
        tagBg: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
        badge: 'text-amber-950'
      },
      icon: Award
    },
  ];

  const activeBox = boxes.find(b => b.r === potIdx && b.c === perfIdx) || boxes[4];
  const [selectedBox, setSelectedBox] = useState(activeBox);

  useEffect(() => {
    const current = boxes.find(b => b.r === potIdx && b.c === perfIdx);
    if (current) setSelectedBox(current);
  }, [perfIdx, potIdx]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm text-zinc-900 dark:text-zinc-100 transition-colors">
      
      {/* Encabezado Principal y Diagnóstico Resumido */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800 mb-6 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F1B400] ring-4 ring-[#F1B400]/20 shrink-0"></span>
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 dark:text-white font-sans whitespace-normal flex items-center gap-1.5">
              <span>{isPromotionContext ? 'Matriz 9-Box: Filtro de Elegibilidad para Promoción' : 'Matriz 9-Box de Desempeño y Potencial'}</span>
              {isPromotionContext && <Sparkles size={14} className="text-[#D99C00] shrink-0" />}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-700 shrink-0">
              {isPromotionContext ? `Puesto Destino: ${targetPosition || 'Cargo Superior'}` : 'Calibración Universo Canguro'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {isPromotionContext ? (
              <>
                Filtro de talento y aptitud para asumir el puesto superior <strong className="text-zinc-700 dark:text-zinc-200">({targetPosition || 'Cargo Superior'})</strong>. Cruza el <strong className="text-zinc-700 dark:text-zinc-200">Desempeño Operativo Actual (Eje X)</strong> con la <strong className="text-zinc-700 dark:text-zinc-200">Agilidad de Liderazgo y Potencial (Eje Y)</strong>.
              </>
            ) : (
              <>
                Mapeo de <strong className="text-zinc-700 dark:text-zinc-300">Desempeño (Eje X)</strong> frente a <strong className="text-zinc-700 dark:text-zinc-300">Potencial de Crecimiento (Eje Y)</strong> para la toma de decisiones estratégicas de talento y PDI.
              </>
            )}
          </p>
        </div>

        {/* Indicadores de Puntuación Consolidada */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Eje X - Desempeño */}
          <div className="bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-2xs">
            <div>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-400 uppercase font-mono block leading-none mb-0.5 font-bold">
                Eje X • Desempeño
              </span>
              <span className="text-xs font-black text-zinc-900 dark:text-white font-mono">
                {performanceScore.toFixed(2)} / 5.00
              </span>
            </div>
            <span className={cn(
              "text-[9px] font-black px-2 py-0.5 rounded-md font-mono uppercase tracking-wider",
              isPending ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300" :
              perfIdx === 2 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700" :
              perfIdx === 1 ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700" :
              "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700"
            )}>
              {isPending ? 'Pendiente' : perfIdx === 2 ? 'Alto' : perfIdx === 1 ? 'Medio' : 'Bajo'}
            </span>
          </div>

          {/* Eje Y - Potencial */}
          <div className="bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-2xs">
            <div>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-400 uppercase font-mono block leading-none mb-0.5 font-bold">
                Eje Y • Potencial
              </span>
              <span className="text-xs font-black text-zinc-900 dark:text-white font-mono">
                {potentialScore.toFixed(2)} / 5.00
              </span>
            </div>
            <span className={cn(
              "text-[9px] font-black px-2 py-0.5 rounded-md font-mono uppercase tracking-wider",
              isPending ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300" :
              potIdx === 2 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700" :
              potIdx === 1 ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700" :
              "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700"
            )}>
              {isPending ? 'Pendiente' : potIdx === 2 ? 'Alto' : potIdx === 1 ? 'Medio' : 'Bajo'}
            </span>
          </div>

          {/* Indicador de Elegibilidad en contexto de Promoción */}
          {isPromotionContext && (
            <div className={cn(
              "px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-2xs font-mono text-[10px] font-black uppercase tracking-wider",
              isPending
                ? "bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                : isPromotionEligible
                ? "bg-emerald-50 text-emerald-950 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700"
                : "bg-amber-50 text-amber-950 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700"
            )}>
              <Award size={16} className={isPending ? "text-zinc-400" : isPromotionEligible ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"} />
              <div>
                <span className="block text-[8px] text-zinc-400 font-bold uppercase leading-none mb-0.5">Baremo de Ascenso</span>
                <span>{isPending ? 'En Espera' : isPromotionEligible ? 'Elegible para Ascenso' : 'En Consolidación'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {isPending && (
        <div className="mb-5 p-3.5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 rounded-xl text-xs text-amber-950 dark:text-amber-200 flex items-center gap-2.5 font-sans">
          <Info size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Ubicación 9-Box en Espera:</strong> El colaborador aún no cuenta con evaluaciones completadas (0.00 / 0.00 pts). Se posicionará en su cuadrante definitivo una vez procesadas sus calificaciones oficiales.
          </span>
        </div>
      )}

      {/* Grid Contenedor de la Matriz y del Panel de Acción */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LADO IZQUIERDO: MATRIZ 9-BOX (7 columnas) */}
        <div className="xl:col-span-7 flex flex-col">
          
          {/* Guía Superior de Cortes */}
          <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-2 px-1">
            <span className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-black">
              <span className="text-xs text-[#D99C00]">★</span>
              <span>MATRIZ DE CALIBRACIÓN DE TALENTO 9-BOX</span>
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Escala de 9 Cuadrantes • Universo Canguro
            </span>
          </div>

          {/* Contenedor con Eje Vertical POTENCIAL y Matriz 3x3 */}
          <div className="flex items-stretch gap-2 sm:gap-3">
            {/* EJE VERTICAL Y: POTENCIAL */}
            <div className="flex flex-col items-center justify-between py-3 px-1.5 rounded-xl bg-amber-500/10 border border-amber-300/60 shrink-0 select-none">
              <div className="flex flex-col items-center">
                <span className="text-xs sm:text-sm font-black text-amber-700">▲</span>
                <div className="w-0.5 h-10 sm:h-14 bg-gradient-to-t from-amber-400 to-amber-600 rounded-full mt-1"></div>
              </div>
              <div className="flex-1 flex items-center justify-center my-3">
                <span
                  className="text-[11px] sm:text-xs font-black tracking-[0.25em] text-amber-950 uppercase select-none font-mono"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  POTENCIAL
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-10 sm:h-14 bg-gradient-to-b from-amber-400 to-amber-300 rounded-full mb-1"></div>
                <span className="text-[9px] font-mono font-bold text-amber-700">Y</span>
              </div>
            </div>

            {/* Cuadrícula 3x3 de Cuadrantes en Degradado Amarillo */}
            <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-3 p-2.5 sm:p-3 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl border border-amber-200/90 dark:border-amber-900/50 shadow-inner">
              {boxes.map((box, idx) => {
                const isCollaboratorActive = !isPending && box.r === potIdx && box.c === perfIdx;
                const isSelected = selectedBox.id === box.id;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedBox(box)}
                    className={cn(
                      "relative flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 select-none cursor-pointer group min-h-[145px] sm:min-h-[160px] shadow-xs",
                      // Degradado en escala de amarillos
                      box.colorTheme.bg,
                      box.colorTheme.border,
                      // Interacción hover y selección
                      "hover:shadow-md hover:scale-[1.015] hover:z-10",
                      isSelected
                        ? "ring-2 ring-zinc-950 dark:ring-white shadow-lg z-20 " + box.colorTheme.activeBg
                        : "opacity-95 hover:opacity-100",
                      // Resaltado de la ubicación del evaluado
                      isCollaboratorActive && "ring-3 ring-[#F1B400] ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 shadow-xl shadow-amber-500/25 border-amber-600 " + box.colorTheme.activeBg
                    )}
                  >
                    <div>
                      {/* Fila superior: Coordenada y Badge de Ubicación */}
                      <div className="flex items-center justify-between w-full gap-1 mb-1.5 pb-1 border-b border-black/10">
                        <span className="text-[9px] font-mono font-black text-amber-950/70 uppercase tracking-tight">
                          {box.coord}
                        </span>

                        {isCollaboratorActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-950 text-[#F1B400] text-[9px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                            <Star size={9} fill="currentColor" /> Ubicación
                          </span>
                        )}

                        {!isCollaboratorActive && isSelected && (
                          <span className="text-[9px] font-mono text-zinc-700 font-bold hidden sm:inline">
                            Seleccionado
                          </span>
                        )}
                      </div>

                      {/* Título Oficial del Cuadrante */}
                      <h4 className="text-[11px] sm:text-xs font-black uppercase leading-tight tracking-tight text-zinc-950 mb-1.5">
                        {box.title}
                      </h4>

                      {/* Acción y Recomendación Institucional */}
                      <p className="text-[9.5px] sm:text-[10.5px] leading-snug text-zinc-800 font-medium line-clamp-4 sm:line-clamp-none">
                        {box.action}
                      </p>
                    </div>

                    {/* Barra indicadora inferior */}
                    <div className="w-full pt-2">
                      <div className="w-full h-1 rounded-full overflow-hidden bg-black/10">
                        <div className={cn("h-full w-full rounded-full transition-all", box.colorTheme.accentBar)} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* EJE HORIZONTAL X: DESEMPEÑO */}
          <div className="flex items-center justify-between mt-3 pl-8 sm:pl-10 pr-2 py-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-300/60 select-none">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-amber-700">X</span>
              <span className="text-[10px] sm:text-xs font-black tracking-[0.25em] text-amber-950 uppercase font-mono">
                DESEMPEÑO
              </span>
            </div>
            <div className="flex items-center flex-1 mx-3 sm:mx-4">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 rounded-full"></div>
              <span className="text-xs sm:text-sm font-black text-amber-600 -ml-1">▶</span>
            </div>
            <span className="text-[9px] font-mono text-amber-800 font-bold hidden sm:inline">
              Bajo (&lt; 3.00) • Medio (3.00 - 4.24) • Alto (≥ 4.25)
            </span>
          </div>

          {/* Leyenda interactiva al pie de la matriz */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 text-[10px] text-zinc-500 dark:text-zinc-400 px-1 pt-2 border-t border-zinc-200/60 dark:border-zinc-800 gap-1.5">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#F1B400] ring-2 ring-[#F1B400]/30"></span>
              <span>Posición evaluada: <strong className="text-zinc-800 dark:text-zinc-200">{collaboratorName}</strong></span>
            </span>
            <span className="text-zinc-400 dark:text-zinc-500 italic">
              Haz clic en cualquier cuadrante para inspeccionar su protocolo de talento y PDI.
            </span>
          </div>
        </div>

        {/* LADO DERECHO: PANEL DETALLADO DE ACCIÓN Y CALIBRACIÓN (5 columnas) */}
        <div className="xl:col-span-5 bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full shadow-xs">
          <div>
            {/* Header de la tarjeta seleccionada */}
            <div className="flex items-start justify-between gap-2 mb-3.5">
              <div>
                <span className={cn(
                  "text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md border inline-block mb-1.5",
                  selectedBox.colorTheme.tagBg
                )}>
                  {selectedBox.categoryTag}
                </span>
                <h4 className="text-base sm:text-lg font-black text-zinc-950 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                  {selectedBox.title}
                  {selectedBox.isStar && <Star size={16} className="text-[#F1B400] fill-[#F1B400]" />}
                </h4>
              </div>

              {selectedBox.r === potIdx && selectedBox.c === perfIdx ? (
                <span className="text-[10px] font-black text-zinc-950 bg-[#F1B400] px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <Star size={11} fill="currentColor" /> Ubicación Evaluado
                </span>
              ) : (
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 shrink-0">
                  Modo Consulta
                </span>
              )}
            </div>

            {/* Cuadrícula de Coordenadas de Calibración */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-4 bg-white dark:bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-2xs">
              <div className="border-r border-zinc-100 dark:border-zinc-700 pr-2">
                <span className="text-zinc-400 dark:text-zinc-400 uppercase block font-semibold">Desempeño (Eje X):</span>
                <span className="text-xs font-black text-zinc-900 dark:text-white">{selectedBox.xLevel}</span>
              </div>
              <div className="pl-2">
                <span className="text-zinc-400 dark:text-zinc-400 uppercase block font-semibold">Potencial (Eje Y):</span>
                <span className="text-xs font-black text-zinc-900 dark:text-white">{selectedBox.yLevel}</span>
              </div>
            </div>

            {/* Diagnóstico Conductual */}
            <div className="mb-4">
              <div className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-wider mb-1 flex items-center gap-1">
                <Compass size={12} className="text-zinc-400 dark:text-zinc-400" /> Diagnóstico del Cuadrante
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white/70 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
                {selectedBox.desc}
              </p>
            </div>

            {/* Acción Estratégica Inmediata */}
            <div className="mb-4">
              <div className="text-[10px] font-black uppercase text-[#D99C00] dark:text-[#F1B400] tracking-wider mb-1 flex items-center gap-1">
                <Target size={12} className="text-[#D99C00] dark:text-[#F1B400]" /> Estrategia de Talento Recomendada
              </div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 shadow-2xs">
                {selectedBox.action}
              </div>
            </div>

            {/* Enfoque Metodológico PDI 70-20-10 */}
            <div>
              <div className="text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-400 tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles size={12} className="text-zinc-400 dark:text-zinc-400" /> Lineamiento para PDI (Modelo 70-20-10)
              </div>
              <div className="bg-white dark:bg-zinc-800/80 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2 text-[11px]">
                <div className="flex items-start gap-2">
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                    70% Exp.
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300">{selectedBox.pdi70}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono font-bold text-sky-700 dark:text-sky-400 bg-sky-100/70 dark:bg-sky-950/60 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                    20% Exp.
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300">{selectedBox.pdi20}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-100/70 dark:bg-purple-950/60 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                    10% Edu.
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300">{selectedBox.pdi10}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nota al pie del panel */}
          <div className="mt-4 pt-3 border-t border-zinc-200/80 dark:border-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span>Calibrado para el Plan de Desarrollo Individual (PDI)</span>
            </span>
            <span className="font-mono text-zinc-400 dark:text-zinc-500 font-bold">Universo Canguro</span>
          </div>
        </div>

      </div>
    </div>
  );
}

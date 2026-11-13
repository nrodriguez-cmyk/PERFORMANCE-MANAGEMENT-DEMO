import React from 'react';
import { EvaluationData } from '../types';
import { Target, Store, Award, CheckCircle2, TrendingUp } from 'lucide-react';
import { resolveResponsibilityLevel, ResponsibilityLevel } from '../utils/responsibilityResolver';

export type EvaluatorRoleType = 'self' | 'supervisor' | 'peer' | 'subordinate';

interface OperacionesSection1FormProps {
  data: EvaluationData;
  onChange: (data: EvaluationData) => void;
  isSupervisor?: boolean;
  evaluatorRole?: 'self' | 'supervisor' | 'peer' | 'subordinate' | string;
  employeePosition?: string;
  theme?: 'dark' | 'light';
}

// Escala Oficial de Medición (1: Nunca / <70% a 5: Siempre / >=110%)
const OFFICIAL_SCALE = [
  { score: 1, label: 'NUNCA' },
  { score: 2, label: 'RARA VEZ' },
  { score: 3, label: 'OCASIONALMENTE' },
  { score: 4, label: 'FRECUENTEMENTE' },
  { score: 5, label: 'SIEMPRE' },
];

export function OperacionesSection1Form({
  data,
  onChange,
  evaluatorRole = 'self',
  employeePosition = '',
  theme = 'dark'
}: OperacionesSection1FormProps) {
  const isDark = theme === 'dark';

  // 1. Nivel de Responsabilidad del Cargo (Alto, Medio o Bajo)
  const responsibilityLevel: ResponsibilityLevel = resolveResponsibilityLevel(employeePosition);

  // 2. Normalización del rol de evaluador para modular la perspectiva gramatical
  const role: EvaluatorRoleType = (() => {
    const r = (evaluatorRole || '').toLowerCase();
    // Evaluación del Supervisor Inmediato: orientada a evaluar al líder ("Mi líder...")
    if (r.includes('superv')) return 'subordinate';
    // Evaluación de Pares: orientada a evaluar al compañero ("Mi compañero...")
    if (r.includes('peer') || r.includes('par')) return 'peer';
    // Evaluación de Subordinados: orientada a evaluar al colaborador ("El colaborador...")
    if (r.includes('subord') || r.includes('equipo')) return 'supervisor';
    return 'self';
  })();

  const roleLabelMap: Record<EvaluatorRoleType, string> = {
    self: 'Autoevaluación',
    supervisor: 'Evaluación del Supervisor Inmediato',
    peer: 'Evaluación de Pares',
    subordinate: 'Evaluación de Subordinados'
  };

  const handleScoreChange = (id: string, score: number) => {
    onChange({
      ...data,
      scores: {
        ...data.scores,
        [id]: score
      }
    });
  };

  // Renderizador reutilizable de botones numéricos (1 al 5) sin mostrar puntos ni porcentajes
  const renderScoreButtons = (id: string) => {
    const currentScore = data.scores?.[id];
    const selectedOption = OFFICIAL_SCALE.find(s => s.score === currentScore);

    return (
      <div className="space-y-2 pt-1.5">
        <div className="flex items-center gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5].map((score) => {
            const isSelected = currentScore === score;
            return (
              <button
                key={score}
                type="button"
                onClick={() => handleScoreChange(id, score)}
                className={`flex-1 h-11 sm:h-12 rounded-xl flex items-center justify-center text-base sm:text-lg font-mono font-black transition-all duration-150 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#F1B400] text-black font-black shadow-md ring-2 ring-[#F1B400]/40 scale-[1.02]'
                    : isDark
                    ? 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 active:scale-95'
                    : 'bg-zinc-50 border border-zinc-200 text-zinc-800 hover:border-zinc-300 hover:bg-zinc-100 active:scale-95'
                }`}
                title={`Puntaje ${score}: ${OFFICIAL_SCALE[score - 1].label}`}
              >
                {score}
              </button>
            );
          })}
        </div>

        <div className="min-h-[18px] flex items-center justify-between text-[11px] font-mono">
          {selectedOption ? (
            <span className="flex items-center gap-1.5 text-amber-500 font-bold">
              <CheckCircle2 size={12} />
              Selección: {selectedOption.score} — {selectedOption.label}
            </span>
          ) : (
            <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>
              Seleccione una opción del 1 al 5
            </span>
          )}
        </div>
      </div>
    );
  };

  // =========================================================================================
  // SUB-BLOQUE 1: KPIs Y OBJETIVOS MEDIBLES (50%)
  // Modulados por Nivel de Gestión (Alto, Medio, Bajo) y Rol de Evaluador
  // =========================================================================================
  const sub1Items = [
    {
      id: 'op_kpi_1',
      title: {
        alto: 'Presupuesto Macro de Ventas y Rentabilidad',
        medio: 'Gestión del Presupuesto y Proyecto de Ventas',
        bajo: 'Ejecución de Ventas y Producto del Mes'
      },
      text: {
        alto: {
          self: 'Respondo por el cumplimiento del plan estratégico de ventas y la maximización de la rentabilidad financiera de la red de tiendas a nivel nacional.',
          supervisor: 'El colaborador responde por el cumplimiento del plan estratégico de ventas y la maximización de la rentabilidad financiera de la red de tiendas a nivel nacional.',
          peer: 'Mi compañero responde por el cumplimiento del plan estratégico de ventas y la maximización de la rentabilidad financiera de la red de tiendas a nivel nacional.',
          subordinate: 'Mi líder responde por el cumplimiento del plan estratégico de ventas y la maximización de la rentabilidad financiera de la red de tiendas a nivel nacional.'
        },
        medio: {
          self: 'Lidero la ejecución comercial en tienda/zona asegurando el cumplimiento del presupuesto mensual y las metas de venta asignadas al "Producto del Mes".',
          supervisor: 'El colaborador lidera la ejecución comercial en tienda/zona asegurando el cumplimiento del presupuesto mensual y las metas de venta asignadas al "Producto del Mes".',
          peer: 'Mi compañero lidera la ejecución comercial en tienda/zona asegurando el cumplimiento del presupuesto mensual y las metas de venta asignadas al "Producto del Mes".',
          subordinate: 'Mi líder lidera la ejecución comercial en tienda/zona asegurando el cumplimiento del presupuesto mensual y las metas de venta asignadas al "Producto del Mes".'
        },
        bajo: {
          self: 'Contribuyo activamente al presupuesto de venta diario/semanal en tienda ejecutando el protocolo de impulso comercial y promocionando el "Producto del Mes".',
          supervisor: 'El colaborador contribuye activamente al presupuesto de venta diario/semanal en tienda ejecutando el protocolo de impulso comercial y promocionando el "Producto del Mes".',
          peer: 'Mi compañero contribuye activamente al presupuesto de venta diario/semanal en tienda ejecutando el protocolo de impulso comercial y promocionando el "Producto del Mes".',
          subordinate: 'El colaborador contribuye activamente al presupuesto de venta diario/semanal en tienda ejecutando el protocolo de impulso comercial y promocionando el "Producto del Mes".'
        }
      }
    },
    {
      id: 'op_kpi_2',
      title: {
        alto: 'Estandarización y Proyecto de Excelencia Operativa',
        medio: 'Control de Auditoría y Conciliación de Inventario',
        bajo: 'Adherencia a Procesos, Inventario y Garantías'
      },
      text: {
        alto: {
          self: 'Garantizo el logro del plan anual de estandarización en procesos, imagen, perfiles, ubicaciones, distribución de actividades y tipología de tiendas.',
          supervisor: 'El colaborador garantiza el logro del plan anual de estandarización en procesos, imagen, perfiles, ubicaciones, distribución de actividades y tipología de tiendas.',
          peer: 'Mi compañero garantiza el logro del plan anual de estandarización en procesos, imagen, perfiles, ubicaciones, distribución de actividades y tipología de tiendas.',
          subordinate: 'Mi líder garantiza el logro del plan anual de estandarización en procesos, imagen, perfiles, ubicaciones, distribución de actividades y tipología de tiendas.'
        },
        medio: {
          self: 'Superviso la fidelidad de los conteos y el cumplimiento estricto de los procesos de tienda para garantizar resultados sobresalientes en las auditorías de control interno.',
          supervisor: 'El colaborador supervisa la fidelidad de los conteos y el cumplimiento estricto de los procesos de tienda para garantizar resultados sobresalientes en las auditorías de control interno.',
          peer: 'Mi compañero supervisa la fidelidad de los conteos y el cumplimiento estricto de los procesos de tienda para garantizar resultados sobresalientes en las auditorías de control interno.',
          subordinate: 'Mi líder supervisa la fidelidad de los conteos y el cumplimiento estricto de los procesos de tienda para garantizar resultados sobresalientes en las auditorías de control interno.'
        },
        bajo: {
          self: 'Aplico minuciosamente los procedimientos de recepción, exhibición y conciliación física de inventarios para evitar desviaciones en auditoría y agilizar las garantías/devoluciones.',
          supervisor: 'El colaborador aplica minuciosamente los procedimientos de recepción, exhibición y conciliación física de inventarios para evitar desviaciones en auditoría y agilizar las garantías/devoluciones.',
          peer: 'Mi compañero aplica minuciosamente los procedimientos de recepción, exhibición y conciliación física de inventarios para evitar desviaciones en auditoría y agilizar las garantías/devoluciones.',
          subordinate: 'El colaborador aplica minuciosamente los procedimientos de recepción, exhibición y conciliación física de inventarios para evitar desviaciones en auditoría y agilizar las garantías/devoluciones.'
        }
      }
    },
    {
      id: 'op_kpi_3',
      title: {
        alto: 'Métricas Consolidadas de Control Interno y Auditabilidad',
        medio: 'Estandarización de Checklist y CSAT (Servicio)',
        bajo: 'Efectividad en Servicio y Tiempos'
      },
      text: {
        alto: {
          self: 'Aseguro que el indicador global de auditoría de operaciones refleje una conciliación transparente de inventarios y una alta adherencia normativa en la red.',
          supervisor: 'El colaborador asegura que el indicador global de auditoría de operaciones refleje una conciliación transparente de inventarios y una alta adherencia normativa en la red.',
          peer: 'Mi compañero asegura que el indicador global de auditoría de operaciones refleje una conciliación transparente de inventarios y una alta adherencia normativa en la red.',
          subordinate: 'Mi líder asegura que el indicador global de auditoría de operaciones refleje una conciliación transparente de inventarios y una alta adherencia normativa en la red.'
        },
        medio: {
          self: 'Valido de forma transparente y objetiva la aplicación del checklist operativo de tienda, asegurando niveles de CSAT óptimos sin omitir ni ocultar fallas detectadas.',
          supervisor: 'El colaborador valida de forma transparente y objetiva la aplicación del checklist operativo de tienda, asegurando niveles de CSAT óptimos sin omitir ni ocultar fallas detectadas.',
          peer: 'Mi compañero valida de forma transparente y objetiva la aplicación del checklist operativo de tienda, asegurando niveles de CSAT óptimos sin omitir ni ocultar fallas detectadas.',
          subordinate: 'Mi líder valida de forma transparente y objetiva la aplicación del checklist operativo de tienda, asegurando niveles de CSAT óptimos sin omitir ni ocultar fallas detectadas.'
        },
        bajo: {
          self: 'Cumplo los estándares de tiempo de atención en caja y piso de venta, garantizando agilidad operativa en los cobros y trámites de clientes.',
          supervisor: 'El colaborador cumple los estándares de tiempo de atención en caja y piso de venta, garantizando agilidad operativa en los cobros y trámites de clientes.',
          peer: 'Mi compañero cumple los estándares de tiempo de atención en caja y piso de venta, garantizando agilidad operativa en los cobros y trámites de clientes.',
          subordinate: 'El colaborador cumple los estándares de tiempo de atención en caja y piso de venta, garantizando agilidad operativa en los cobros y trámites de clientes.'
        }
      }
    },
    {
      id: 'op_kpi_4',
      title: {
        alto: 'Métricas Consolidadas de Gente y Eficiencia de Devolución',
        medio: 'Métricas de Gente (Rotación, Ausentismo y Gastos)',
        bajo: 'Cumplimiento de Checklist e Imagen de Estación'
      },
      text: {
        alto: {
          self: 'Respondo por la eficiencia global de los gastos de personal (rotación/ausentismo) y lidero la alineación estratégica del proceso integral de devoluciones (Tiendas-Cendis-Financiamiento) y alianzas comerciales.',
          supervisor: 'El colaborador responde por la eficiencia global de los gastos de personal (rotación/ausentismo) y lidera la alineación estratégica del proceso integral de devoluciones (Tiendas-Cendis-Financiamiento) y alianzas comerciales.',
          peer: 'Mi compañero responde por la eficiencia global de los gastos de personal (rotación/ausentismo) y lidera la alineación estratégica del proceso integral de devoluciones (Tiendas-Cendis-Financiamiento) y alianzas comerciales.',
          subordinate: 'Mi líder responde por la eficiencia global de los gastos de personal (rotación/ausentismo) y lidera la alineación estratégica del proceso integral de devoluciones (Tiendas-Cendis-Financiamiento) y alianzas comerciales.'
        },
        medio: {
          self: 'Controlo los indicadores de personal en mi tienda/zona, manteniendo dentro de presupuesto la rotación, el ausentismo y los gastos de nómina/horas extra.',
          supervisor: 'El colaborador controla los indicadores de personal en su tienda/zona, manteniendo dentro de presupuesto la rotación, el ausentismo y los gastos de nómina/horas extra.',
          peer: 'Mi compañero controla los indicadores de personal en su tienda/zona, manteniendo dentro de presupuesto la rotación, el ausentismo y los gastos de nómina/horas extra.',
          subordinate: 'Mi líder controla los indicadores de personal en nuestra tienda/zona, manteniendo dentro de presupuesto la rotación, el ausentismo y los gastos de nómina/horas extra.'
        },
        bajo: {
          self: 'Ejecuto las tareas operativas de apertura, mantenimiento y cierre registradas en el checklist de tienda, manteniendo mi estación impecable y estandarizada.',
          supervisor: 'El colaborador ejecuta las tareas operativas de apertura, mantenimiento y cierre registradas en el checklist de tienda, manteniendo su estación impecable y estandarizada.',
          peer: 'Mi compañero ejecuta las tareas operativas de apertura, mantenimiento y cierre registradas en el checklist de tienda, manteniendo su estación impecable y estandarizada.',
          subordinate: 'El colaborador ejecuta las tareas operativas de apertura, mantenimiento y cierre registradas en el checklist de tienda, manteniendo su estación impecable y estandarizada.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 2: COMPETENCIAS CONDUCTUALES OPERATIVIZADAS (35%)
  // Moduladas por Nivel de Gestión (Alto, Medio, Bajo) y Rol de Evaluador
  // =========================================================================================
  const sub2Items = [
    {
      id: 'op_cond_1',
      title: {
        alto: 'Estrategia Global de Servicio al Cliente (CSAT)',
        medio: 'Liderazgo en Rutinas Operativas (Apertura y Cierre)',
        bajo: 'Servicio al Cliente (CSAT) y Orientación al Cliente'
      },
      text: {
        alto: {
          self: 'Establezco los parámetros organizacionales de servicio, asegurando que la cultura de orientación al cliente y excelencia operativa permee en todas las tiendas.',
          supervisor: 'El colaborador establece los parámetros organizacionales de servicio, asegurando que la cultura de orientación al cliente y excelencia operativa permee en todas las tiendas.',
          peer: 'Mi compañero establece los parámetros organizacionales de servicio, asegurando que la cultura de orientación al cliente y excelencia operativa permee en todas las tiendas.',
          subordinate: 'Mi líder establece los parámetros organizacionales de servicio, asegurando que la cultura de orientación al cliente y excelencia operativa permee en todas las tiendas.'
        },
        medio: {
          self: 'Dirijo sistemáticamente la primera plática del día notificando los objetivos claros al equipo y realizo el cierre diario brindando feedback sobre el logro alcanzado.',
          supervisor: 'El colaborador dirige sistemáticamente la primera plática del día notificando los objetivos claros al equipo y realiza el cierre diario brindando feedback sobre el logro alcanzado.',
          peer: 'Mi compañero dirige sistemáticamente la primera plática del día notificando los objetivos claros al equipo y realiza el cierre diario brindando feedback sobre el logro alcanzado.',
          subordinate: 'Mi líder dirige sistemáticamente la primera plática del día notificando los objetivos claros al equipo y realiza el cierre diario brindando feedback sobre el logro alcanzado.'
        },
        bajo: {
          self: 'Brindo una atención amable, ágil y respetuosa en piso de venta, aplicando protocolos de servicio que aseguren valoraciones altas en la encuesta de satisfacción (CSAT).',
          supervisor: 'El colaborador brinda una atención amable, ágil y respetuosa en piso de venta, aplicando protocolos de servicio que aseguren valoraciones altas en la encuesta de satisfacción (CSAT).',
          peer: 'Mi compañero brinda una atención amable, ágil y respetuosa en piso de venta, aplicando protocolos de servicio que aseguren valoraciones altas en la encuesta de satisfacción (CSAT).',
          subordinate: 'El colaborador brinda una atención amable, ágil y respetuosa en piso de venta, aplicando protocolos de servicio que aseguren valoraciones altas en la encuesta de satisfacción (CSAT).'
        }
      }
    },
    {
      id: 'op_cond_2',
      title: {
        alto: 'Liderazgo Transformacional y Desarrollo Organizacional',
        medio: 'Evaluación Transparente e Imparcial de Estandarización',
        bajo: 'Sentido de Urgencia en Estación de Trabajo'
      },
      text: {
        alto: {
          self: 'Impulso estrategias de atracción y retención de talento en operaciones, construyendo una estructura sólida que respalde el crecimiento de la empresa.',
          supervisor: 'El colaborador impulsa estrategias de atracción y retención de talento en operaciones, construyendo una estructura sólida que respalde el crecimiento de la empresa.',
          peer: 'Mi compañero impulsa estrategias de atracción y retención de talento en operaciones, construyendo una estructura sólida que respalde el crecimiento de la empresa.',
          subordinate: 'Mi líder impulsa estrategias de atracción y retención de talento en operaciones, construyendo una estructura sólida que respalde el crecimiento de la empresa.'
        },
        medio: {
          self: 'Evalúo el checklist y procesos de tienda de forma transparente y rigurosa, priorizando la corrección real de fallas por sobre calificaciones complacientes.',
          supervisor: 'El colaborador evalúa el checklist y procesos de tienda de forma transparente y rigurosa, priorizando la corrección real de fallas por sobre calificaciones complacientes.',
          peer: 'Mi compañero evalúa el checklist y procesos de tienda de forma transparente y rigurorosamente, priorizando la corrección real de fallas por sobre calificaciones complacientes.',
          subordinate: 'Mi líder evalúa el checklist y procesos de tienda de forma transparente y rigurosa, priorizando la corrección real de fallas por sobre calificaciones complacientes.'
        },
        bajo: {
          self: 'Resuelvo con rapidez la atención a clientes, reposición de mercancía y filas en caja, demostrando alta agilidad sin desatender la calidad.',
          supervisor: 'El colaborador resuelve con rapidez la atención a clientes, reposición de mercancía y filas en caja, demostrando alta agilidad sin desatender la calidad.',
          peer: 'Mi compañero resuelve con rapidez la atención a clientes, reposición de mercancía y filas en caja, demostrando alta agilidad sin desatender la calidad.',
          subordinate: 'El colaborador resuelve con rapidez la atención a clientes, reposición de mercancía y filas en caja, demostrando alta agilidad sin desatender la calidad.'
        }
      }
    },
    {
      id: 'op_cond_3',
      title: {
        alto: 'Garantía de Objetividad y Transparencia Organizacional',
        medio: 'Desarrollo de Equipo y Clima Laboral',
        bajo: 'Disciplina, Asistencia y Puntualidad'
      },
      text: {
        alto: {
          self: 'Promuevo mecanismos de auditoría y evaluación transparentes en la red, erradicando sesgos de complacencia en los diagnósticos operativos.',
          supervisor: 'El colaborador promueve mecanismos de auditoría y evaluación transparentes en la red, erradicando sesgos de complacencia en los diagnósticos operativos.',
          peer: 'Mi compañero promueve mecanismos de auditoría y evaluación transparentes en la red, erradicando sesgos de complacencia en los diagnósticos operativos.',
          subordinate: 'Mi líder promueve mecanismos de auditoría y evaluación transparentes en la red, erradicando sesgos de complacencia en los diagnósticos operativos.'
        },
        medio: {
          self: 'Fomento un ambiente de trabajo motivador que fortalece el sentido de pertenencia, disminuye la rotación y desarrolla las competencias del equipo.',
          supervisor: 'El colaborador fomenta un ambiente de trabajo motivador que fortalece el sentido de pertenencia, disminuye la rotación y desarrolla las competencias del equipo.',
          peer: 'Mi compañero fomenta un ambiente de trabajo motivador que fortalece el sentido de pertenencia, disminuye la rotación y desarrolla las competencias del equipo.',
          subordinate: 'Mi líder fomenta un ambiente de trabajo motivador que fortalece el sentido de pertenencia, disminuye la rotación y desarrolla las competencias del equipo.'
        },
        bajo: {
          self: 'Cumplo de manera rigurosa con los requerimientos básicos de la empresa: puntualidad, asistencia, uso correcto del uniforme y compromiso con mi jornada.',
          supervisor: 'El colaborador cumple de manera rigurosa con los requerimientos básicos de la empresa: puntualidad, asistencia, uso correcto del uniforme y compromiso con su jornada.',
          peer: 'Mi compañero cumple de manera rigurosa con los requerimientos básicos de la empresa: puntualidad, asistencia, uso correcto del uniforme y compromiso con su jornada.',
          subordinate: 'El colaborador cumple de manera rigurosa con los requerimientos básicos de la empresa: puntualidad, asistencia, uso correcto del uniforme y compromiso con su jornada.'
        }
      }
    },
    {
      id: 'op_cond_4',
      title: {
        alto: 'Orientación a Resultados Estratégicos',
        medio: 'Orientación a Resultados y Sentido de Urgencia',
        bajo: 'Trabajo en Equipo y Apoyo Mutuo'
      },
      text: {
        alto: {
          self: 'Tomo decisiones de alto impacto para asegurar que Operaciones contribuya directamente al crecimiento y sostenibilidad financiera de la compañía.',
          supervisor: 'El colaborador toma decisiones de alto impacto para asegurar que Operaciones contribuya directamente al crecimiento y sostenibilidad financiera de la compañía.',
          peer: 'Mi compañero toma decisiones de alto impacto para asegurar que Operaciones contribuya directamente al crecimiento y sostenibilidad financiera de la compañía.',
          subordinate: 'Mi líder toma decisiones de alto impacto para asegurar que Operaciones contribuya directamente al crecimiento y sostenibilidad financiera de la compañía.'
        },
        medio: {
          self: 'Muestro determinación para alcanzar las metas comerciales y operativas, tomando decisiones ágiles frente a caídas en el flujo de ventas o contingencias.',
          supervisor: 'El colaborador muestra determinación para alcanzar las metas comerciales y operativas, tomando decisiones ágiles frente a caídas en el flujo de ventas o contingencias.',
          peer: 'Mi compañero muestra determinación para alcanzar las metas comerciales y operativas, tomando decisiones ágiles frente a caídas en el flujo de ventas o contingencias.',
          subordinate: 'Mi líder muestra determinación para alcanzar las metas comerciales y operativas, tomando decisiones ágiles frente a caídas en el flujo de ventas o contingencias.'
        },
        bajo: {
          self: 'Muestro excelente actitud para apoyar a compañeros de otras estaciones durante picos de tráfico o ausencias en la tienda.',
          supervisor: 'El colaborador muestra excelente actitud para apoyar a compañeros de otras estaciones durante picos de tráfico o ausencias en la tienda.',
          peer: 'Mi compañero muestra excelente actitud para apoyar a compañeros de otras estaciones durante picos de tráfico o ausencias en la tienda.',
          subordinate: 'El colaborador muestra excelente actitud para apoyar a compañeros de otras estaciones durante picos de tráfico o ausencias en la tienda.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 3: ALINEACIÓN ESTRATÉGICA Y MANEJO DE DESVIACIONES (15%)
  // Moduladas por Nivel de Gestión (Alto, Medio, Bajo) y Rol de Evaluador
  // =========================================================================================
  const sub3Items = [
    {
      id: 'op_strat_1',
      title: {
        alto: 'Dirección de Planes de Contingencia Nacionales',
        medio: 'Diagnóstico y Plan de Acción ante Desviaciones',
        bajo: 'Rutina Diaria de Objetivos (Briefing y Feedback)'
      },
      text: {
        alto: {
          self: 'Evalúo las desviaciones macro en ventas, devoluciones o alianzas comerciales, reasignando recursos y aprobando planes de trabajo con seguimiento semanal para recuperar el rumbo.',
          supervisor: 'El colaborador evalúa las desviaciones macro en ventas, devoluciones o alianzas comerciales, reasignando recursos y aprobando planes de trabajo con seguimiento semanal para recuperar el rumbo.',
          peer: 'Mi compañero evalúa las desviaciones macro en ventas, devoluciones o alianzas comerciales, reasignando recursos y aprobando planes de trabajo con seguimiento semanal para recuperar el rumbo.',
          subordinate: 'Mi líder evalúa las desviaciones macro en ventas, devoluciones o alianzas comerciales, reasignando recursos y aprobando planes de trabajo con seguimiento semanal para recuperar el rumbo.'
        },
        medio: {
          self: 'Ante un indicador fuera de meta (ventas, ausentismo o auditoría), elaboro un diagnóstico preciso, estructuro un reporte de necesidades y ejecuto un plan de trabajo con seguimiento semanal.',
          supervisor: 'El colaborador, ante un indicador fuera de meta (ventas, ausentismo o auditoría), elabora un diagnóstico preciso, estructura un reporte de necesidades y ejecuta un plan de trabajo con seguimiento semanal.',
          peer: 'Mi compañero, ante un indicador fuera de meta (ventas, ausentismo o auditoría), elabora un diagnóstico preciso, estructura un reporte de necesidades y ejecuta un plan de trabajo con seguimiento semanal.',
          subordinate: 'Mi líder, ante un indicador fuera de meta (ventas, ausentismo o auditoría), elabora un diagnóstico preciso, estructura un reporte de necesidades y ejecuta un plan de trabajo con seguimiento semanal.'
        },
        bajo: {
          self: 'Participo activamente en la primera plática del día para alinearme a las metas diarias de la tienda y recibo constructivamente el feedback al cierre de la jornada.',
          supervisor: 'El colaborador participa activamente en la primera plática del día para alinearse a las metas diarias de la tienda y recibe constructivamente el feedback al cierre de la jornada.',
          peer: 'Mi compañero participa activamente en la primera plática del día para alinearse a las metas diarias de la tienda y recibe constructivamente el feedback al cierre de la jornada.',
          subordinate: 'El colaborador participa activamente en la primera plática del día para alinearse a las metas diarias de la tienda y recibe constructivamente el feedback al cierre de la jornada.'
        }
      }
    },
    {
      id: 'op_strat_2',
      title: {
        alto: 'Alineación al Plan Estratégico',
        medio: 'Eficiencia en Devoluciones y Garantías',
        bajo: 'Proactividad y Reporte de Necesidades'
      },
      text: {
        alto: {
          self: 'Garantizo que todos los esfuerzos operacionales del área se ejecuten en perfecta coherencia con el plan estratégico y los valores de la organización.',
          supervisor: 'El colaborador garantiza que todos los esfuerzos operacionales del área se ejecuten en perfecta coherencia con el plan estratégico y los valores de la organización.',
          peer: 'Mi compañero garantiza que todos los esfuerzos operacionales del área se ejecuten en perfecta coherencia con el plan estratégico y los valores de la organización.',
          subordinate: 'Mi líder garantiza que todos los esfuerzos operacionales del área se ejecuten en perfecta coherencia con el plan estratégico y los valores de la organización.'
        },
        medio: {
          self: 'Gestiono con agilidad los flujos de devolución y garantías en tienda, coordinando con Cendis y canales de financiamiento para asegurar la satisfacción del cliente.',
          supervisor: 'El colaborador gestiona con agilidad los flujos de devolución y garantías en tienda, coordinando con Cendis y canales de financiamiento para asegurar la satisfacción del cliente.',
          peer: 'Mi compañero gestiona con agilidad los flujos de devolución y garantías en tienda, coordinando con Cendis y canales de financiamiento para asegurar la satisfacción del cliente.',
          subordinate: 'Mi líder gestiona con agilidad los flujos de devolución y garantías en tienda, coordinando con Cendis y canales de financiamiento para asegurar la satisfacción del cliente.'
        },
        bajo: {
          self: 'Identifico y reporto de inmediato las fallas operativas o faltantes de mercancía en mi estación para evitar afectar la experiencia del cliente.',
          supervisor: 'El colaborador identifica y reporta de inmediato las fallas operativas o faltantes de mercancía en su estación para evitar afectar la experiencia del cliente.',
          peer: 'Mi compañero identifica y reporta de inmediato las fallas operativas o faltantes de mercancía en su estación para evitar afectar la experiencia del cliente.',
          subordinate: 'El colaborador identifica y reporta de inmediato las fallas operativas o faltantes de mercancía en su estación para evitar afectar la experiencia del cliente.'
        }
      }
    },
    {
      id: 'op_strat_3',
      title: {
        alto: 'Gestión del Límite de Bajo Desempeño',
        medio: 'Cultura de Incentivos y Corrección',
        bajo: 'Alineación a Resultados'
      },
      text: {
        alto: {
          self: 'Establezco políticas claras para corregir o sancionar el bajo desempeño reiterado en la red, asegurando un estándar de alta exigencia operacional.',
          supervisor: 'El colaborador establece políticas claras para corregir o sancionar el bajo desempeño reiterado en la red, asegurando un estándar de alta exigencia operacional.',
          peer: 'Mi compañero establece políticas claras para corregir o sancionar el bajo desempeño reiterado en la red, asegurando un estándar de alta exigencia operacional.',
          subordinate: 'Mi líder establece políticas claras para corregir o sancionar el bajo desempeño reiterado en la red, asegurando un estándar de alta exigencia operacional.'
        },
        medio: {
          self: 'Implemento dinámicas de incentivos para impulsar al equipo y aplico de forma oportuna los límites de bajo desempeño cuando no se corrige el rumbo.',
          supervisor: 'El colaborador implementa dinámicas de incentivos para impulsar al equipo y aplica de forma oportuna los límites de bajo desempeño cuando no se corrige el rumbo.',
          peer: 'Mi compañero implementa dinámicas de incentivos para impulsar al equipo y aplica de forma oportuna los límites de bajo desempeño cuando no se corrige el rumbo.',
          subordinate: 'Mi líder implementa dinámicas de incentivos para impulsar al equipo y aplica de forma oportuna los límites de bajo desempeño cuando no se corrige el rumbo.'
        },
        bajo: {
          self: 'Muestro claridad sobre cómo mi trabajo individual en tienda contribuye a la rentabilidad y crecimiento general de la empresa.',
          supervisor: 'El colaborador muestra claridad sobre cómo su trabajo individual en tienda contribuye a la rentabilidad y crecimiento general de la empresa.',
          peer: 'Mi compañero muestra claridad sobre cómo su trabajo individual en tienda contribuye a la rentabilidad y crecimiento general de la empresa.',
          subordinate: 'El colaborador muestra claridad sobre cómo su trabajo individual en tienda contribuye a la rentabilidad y crecimiento general de la empresa.'
        }
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado limpio de Sección 1 */}
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <Store size={20} className={isDark ? 'text-[#F1B400]' : 'text-amber-800'} />
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}>
              Dirección de Operaciones
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Evaluación de indicadores de gestión, procesos de tienda y conductas en el período.
            </p>
          </div>
        </div>
      </div>

      {/* GUÍA OFICIAL DE ESCALA DE CALIFICACIÓN (1 AL 5) */}
      <div className={`p-3.5 rounded-xl border ${
        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}>
            Escala Oficial de Medición:
          </span>
          <span className="text-[10px] font-mono text-amber-500 font-bold">
            Seleccione solo el número del 1 al 5
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {OFFICIAL_SCALE.map(item => (
            <div
              key={item.score}
              className={`p-2 rounded-lg text-center border ${
                isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            >
              <div className="font-mono font-black text-sm text-[#F1B400]">
                {item.score}
              </div>
              <div className={`text-[10px] font-bold uppercase truncate ${
                isDark ? 'text-zinc-200' : 'text-zinc-700'
              }`}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* SUB-BLOQUE 1: DESEMPEÑO TÉCNICO Y OBJETIVOS MEDIBLES (KPIs)                              */}
      {/* ========================================================================================= */}
      <div className={`p-5 rounded-2xl border transition-colors duration-200 shadow-sm ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="pb-3 mb-4 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-[#F1B400]" />
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Sub-bloque 1: Desempeño Técnico y Objetivos Medibles (KPIs)
            </h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Medición de indicadores clave de operaciones y piso de venta según la periodicidad establecida.
          </p>
        </div>

        <div className="space-y-5">
          {sub1Items.map((item, idx) => {
            const itemTitle = item.title[responsibilityLevel];
            return (
              <div
                key={item.id}
                className={`space-y-2 ${idx > 0 ? (isDark ? 'pt-4 border-t border-zinc-800/80' : 'pt-4 border-t border-zinc-100') : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                    Pregunta {idx + 1}: {itemTitle}
                  </span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {item.text[responsibilityLevel][role]}
                </p>
                {renderScoreButtons(item.id)}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* SUB-BLOQUE 2: COMPETENCIAS CONDUCTUALES OPERATIVIZADAS                                    */}
      {/* ========================================================================================= */}
      <div className={`p-5 rounded-2xl border transition-colors duration-200 shadow-sm ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="pb-3 mb-4 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#F1B400]" />
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Sub-bloque 2: Competencias Conductuales Operativizadas
            </h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Evaluación de comportamientos observables en escala de frecuencia (1: Nunca a 5: Siempre).
          </p>
        </div>

        <div className="space-y-5">
          {sub2Items.map((item, idx) => {
            const itemTitle = item.title[responsibilityLevel];
            return (
              <div
                key={item.id}
                className={`space-y-2 ${idx > 0 ? (isDark ? 'pt-4 border-t border-zinc-800/80' : 'pt-4 border-t border-zinc-100') : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                    Pregunta {sub1Items.length + idx + 1}: {itemTitle}
                  </span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {item.text[responsibilityLevel][role]}
                </p>
                {renderScoreButtons(item.id)}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* SUB-BLOQUE 3: ALINEACIÓN ESTRATÉGICA Y MANEJO DE DESVIACIONES                             */}
      {/* ========================================================================================= */}
      <div className={`p-5 rounded-2xl border transition-colors duration-200 shadow-sm ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="pb-3 mb-4 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-[#F1B400]" />
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Sub-bloque 3: Alineación Estratégica y Manejo de Desviaciones
            </h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Evaluación de entendimiento del negocio, impacto en resultados y resiliencia.
          </p>
        </div>

        <div className="space-y-5">
          {sub3Items.map((item, idx) => {
            const itemTitle = item.title[responsibilityLevel];
            return (
              <div
                key={item.id}
                className={`space-y-2 ${idx > 0 ? (isDark ? 'pt-4 border-t border-zinc-800/80' : 'pt-4 border-t border-zinc-100') : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                    Pregunta {sub1Items.length + sub2Items.length + idx + 1}: {itemTitle}
                  </span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {item.text[responsibilityLevel][role]}
                </p>
                {renderScoreButtons(item.id)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

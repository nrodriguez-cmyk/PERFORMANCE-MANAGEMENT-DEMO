import React from 'react';
import { EvaluationData } from '../types';
import { Target, ShieldCheck, Award, CheckCircle2, TrendingUp } from 'lucide-react';
import { resolveResponsibilityLevel, ResponsibilityLevel } from '../utils/responsibilityResolver';

export type EvaluatorRoleType = 'self' | 'supervisor' | 'peer' | 'subordinate';

interface ControlInternoSection1FormProps {
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

export function ControlInternoSection1Form({
  data,
  onChange,
  evaluatorRole = 'self',
  employeePosition = '',
  theme = 'dark'
}: ControlInternoSection1FormProps) {
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
      id: 'ci_kpi_1',
      title: {
        alto: 'Garantía de Cobertura Nacional de Auditorías',
        medio: 'Supervisión de Cobertura y Semáforo de 90 Días',
        bajo: 'Ejecución de Auditorías y Límite de 90 Días'
      },
      text: {
        alto: {
          self: 'Garantizo la cobertura del plan anual de auditorías a nivel nacional y la mitigación de riesgos de la empresa, respondiendo por el indicador global de tiendas auditadas bajo el estándar de 90 días.',
          supervisor: 'El colaborador garantiza la cobertura del plan anual de auditorías a nivel nacional y la mitigación de riesgos de la empresa, respondiendo por el indicador global de tiendas auditadas bajo el estándar de 90 días.',
          peer: 'Mi compañero garantiza la cobertura del plan anual de auditorías a nivel nacional y la mitigación de riesgos de la empresa, respondiendo por el indicador global de tiendas auditadas bajo el estándar de 90 días.',
          subordinate: 'Mi líder garantiza la cobertura del plan anual de auditorías a nivel nacional y la mitigación de riesgos de la empresa, respondiendo por el indicador global de tiendas auditadas bajo el estándar de 90 días.'
        },
        medio: {
          self: 'Coordino y superviso el cumplimiento del plan mensual de auditorías del equipo, monitoreando el semáforo de alertas para garantizar que ninguna tienda asignada a mi zona supere los 90 días sin auditar.',
          supervisor: 'El colaborador coordina y supervisa el cumplimiento del plan mensual de auditorías del equipo, monitoreando el semáforo de alertas para garantizar que ninguna tienda asignada a su zona supere los 90 días sin auditar.',
          peer: 'Mi compañero coordina y supervisa el cumplimiento del plan mensual de auditorías del equipo, monitoreando el semáforo de alertas para garantizar que ninguna tienda asignada a su zona supere los 90 días sin auditar.',
          subordinate: 'Mi líder coordina y supervisa el cumplimiento del plan mensual de auditorías del equipo, monitoreando el semáforo de alertas para garantizar que ninguna tienda asignada a su zona supere los 90 días sin auditar.'
        },
        bajo: {
          self: 'Ejecuto rigurosamente las auditorías individuales asignadas en el cronograma mensual, aplicando las listas de chequeo y asegurando que las tiendas evaluadas no superen el límite de 90 días sin revisión.',
          supervisor: 'El colaborador ejecuta rigurosamente las auditorías individuales asignadas en el cronograma mensual, aplicando las listas de chequeo y asegurando que las tiendas evaluadas no superen el límite de 90 días sin revisión.',
          peer: 'Mi compañero ejecuta rigurosamente las auditorías individuales asignadas en el cronograma mensual, aplicando las listas de chequeo y asegurando que las tiendas evaluadas no superen el límite de 90 días sin revisión.',
          subordinate: 'El colaborador ejecuta rigurosamente las auditorías individuales asignadas en el cronograma mensual, aplicando las listas de chequeo y asegurando que las tiendas evaluadas no superen el límite de 90 días sin revisión.'
        }
      }
    },
    {
      id: 'ci_kpi_2',
      title: {
        alto: 'Impacto de Merma en Ganancia Operacional',
        medio: 'Análisis de Brechas y Control de Merma',
        bajo: 'Registro de Precisión de Inventarios y Merma'
      },
      text: {
        alto: {
          self: 'Respondo por el impacto del indicador de merma en la ganancia operacional de la compañía, definiendo estrategias globales de control interno que aseguren inventarios precisos para la compra, venta y conciliación.',
          supervisor: 'El colaborador responde por el impacto del indicador de merma en la ganancia operacional de la compañía, definiendo estrategias globales de control interno que aseguren inventarios precisos para la compra, venta y conciliación.',
          peer: 'Mi compañero responde por el impacto del indicador de merma en la ganancia operacional de la compañía, definiendo estrategias globales de control interno que aseguren inventarios precisos para la compra, venta y conciliación.',
          subordinate: 'Mi líder responde por el impacto del indicador de merma en la ganancia operacional de la compañía, definiendo estrategias globales de control interno que aseguren inventarios precisos para la compra, venta y conciliación.'
        },
        medio: {
          self: 'Analizo las brechas de inventario sincerado y merma reportadas en las revisiones, consolidando la información para coordinar investigaciones de causa raíz con los líderes de tienda.',
          supervisor: 'El colaborador analiza las brechas de inventario sincerado y merma reportadas en las revisiones, consolidando la información para coordinar investigaciones de causa raíz con los líderes de tienda.',
          peer: 'Mi compañero analiza las brechas de inventario sincerado y merma reportadas en las revisiones, consolidando la información para coordinar investigaciones de causa raíz con los líderes de tienda.',
          subordinate: 'Mi líder analiza las brechas de inventario sincerado y merma reportadas en las revisiones, consolidando la información para coordinar investigaciones de causa raíz con los líderes de tienda.'
        },
        bajo: {
          self: 'Registro, documento e identifico con exactitud las desviaciones de inventario y los focos de merma durante los procesos de control en tienda o depósitos.',
          supervisor: 'El colaborador registra, documenta e identifica con exactitud las desviaciones de inventario y los focos de merma durante los procesos de control en tienda o depósitos.',
          peer: 'Mi compañero registra, documenta e identifica con exactitud las desviaciones de inventario y los focos de merma durante los procesos de control en tienda o depósitos.',
          subordinate: 'El colaborador registra, documenta e identifica con exactitud las desviaciones de inventario y los focos de merma durante los procesos de control en tienda o depósitos.'
        }
      }
    },
    {
      id: 'ci_kpi_3',
      title: {
        alto: 'Diseño y Aprobación del Marco Normativo',
        medio: 'Control de Adherencia a Procesos',
        bajo: 'Alineación a Procedimientos y Checklists'
      },
      text: {
        alto: {
          self: 'Diseño, apruebo y actualizo las políticas normativas de control interno de la organización, asegurando un marco de procesos sano que proteja los activos del negocio.',
          supervisor: 'El colaborador diseña, aprueba y actualiza las políticas normativas de control interno de la organización, asegurando un marco de procesos sano que proteja los activos del negocio.',
          peer: 'Mi compañero diseña, aprueba y actualiza las políticas normativas de control interno de la organización, asegurando un marco de procesos sano que proteja los activos del negocio.',
          subordinate: 'Mi líder diseña, aprueba y actualiza las políticas normativas de control interno de la organización, asegurando un marco de procesos sano que proteja los activos del negocio.'
        },
        medio: {
          self: 'Controlo el nivel de adherencia a los procesos en las unidades de negocio, auditando la calidad de las revisiones de mi equipo y haciendo cumplir las normas estandarizadas.',
          supervisor: 'El colaborador controla el nivel de adherencia a los procesos en las unidades de negocio, auditando la calidad de las revisiones de su equipo y haciendo cumplir las normas estandarizadas.',
          peer: 'Mi compañero controla el nivel de adherencia a los procesos en las unidades de negocio, auditando la calidad de las revisiones de su equipo y haciendo cumplir las normas estandarizadas.',
          subordinate: 'Mi líder controla el nivel de adherencia a los procesos en las unidades de negocio, auditando la calidad de las revisiones de su equipo y haciendo cumplir las normas estandarizadas.'
        },
        bajo: {
          self: 'Aplico minuciosamente los procedimientos, normativas y checklists de Control Interno durante las revisiones operativas sin omitir controles de seguridad.',
          supervisor: 'El colaborador aplica minuciosamente los procedimientos, normativas y checklists de Control Interno durante las revisiones operativas sin omitir controles de seguridad.',
          peer: 'Mi compañero aplica minuciosamente los procedimientos, normativas y checklists de Control Interno durante las revisiones operativas sin omitir controles de seguridad.',
          subordinate: 'El colaborador aplica minuciosamente los procedimientos, normativas y checklists de Control Interno durante las revisiones operativas sin omitir controles de seguridad.'
        }
      }
    },
    {
      id: 'ci_kpi_4',
      title: {
        alto: 'Análisis de Tendencias y Gestión de Riesgo (CECOM)',
        medio: 'Monitoreo de Flujo e Incidencias (CECOM)',
        bajo: 'Atención y Registro de Incidencias (CECOM)'
      },
      text: {
        alto: {
          self: 'Evalúo las tendencias y patrones de incidencias del CECOM para tomar decisiones estratégicas de prevención de riesgos e infraestructura de seguridad a nivel general.',
          supervisor: 'El colaborador evalúa las tendencias y patrones de incidencias del CECOM para tomar decisiones estratégicas de prevención de riesgos e infraestructura de seguridad a nivel general.',
          peer: 'Mi compañero evalúa las tendencias y patrones de incidencias del CECOM para tomar decisiones estratégicas de prevención de riesgos e infraestructura de seguridad a nivel general.',
          subordinate: 'Mi líder evalúa las tendencias y patrones de incidencias del CECOM para tomar decisiones estratégicas de prevención de riesgos e infraestructura de seguridad a nivel general.'
        },
        medio: {
          self: 'Monitoreo la efectividad en el flujo de atenciones de CECOM, garantizando el seguimiento semanal a las incidencias críticas y la trazabilidad de sus resoluciones.',
          supervisor: 'El colaborador monitorea la efectividad en el flujo de atenciones de CECOM, garantizando el seguimiento semanal a las incidencias críticas y la trazabilidad de sus resoluciones.',
          peer: 'Mi compañero monitorea la efectividad en el flujo de atenciones de CECOM, garantizando el seguimiento semanal a las incidencias críticas y la trazabilidad de sus resoluciones.',
          subordinate: 'Mi líder monitorea la efectividad en el flujo de atenciones de CECOM, garantizando el seguimiento semanal a las incidencias críticas y la trazabilidad de sus resoluciones.'
        },
        bajo: {
          self: 'Registro, clasifico y escalo oportunamente las incidencias reportadas por las tiendas dentro de los tiempos de respuesta estandarizados.',
          supervisor: 'El colaborador registra, clasifica y escala oportunamente las incidencias reportadas por las tiendas dentro de los tiempos de respuesta estandarizados.',
          peer: 'Mi compañero registra, clasifica y escala oportunamente las incidencias reportadas por las tiendas dentro de los tiempos de respuesta estandarizados.',
          subordinate: 'El colaborador registra, clasifica y escala oportunamente las incidencias reportadas por las tiendas dentro de los tiempos de respuesta estandarizados.'
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
      id: 'ci_cond_1',
      title: {
        alto: 'Estándar de Rigor y Diagnóstico Confiable',
        medio: 'Validación de Precisión y Coherencia',
        bajo: 'Detalle y Precisión Técnica'
      },
      text: {
        alto: {
          self: 'Exijo y valido estándares de precisión técnica en los diagnósticos del área, asegurando que la alta dirección tome decisiones basadas en inventarios y auditorías 100% confiables.',
          supervisor: 'El colaborador exige y valida estándares de precisión técnica en los diagnósticos del área, asegurando que la alta dirección tome decisiones basadas en inventarios y auditorías 100% confiables.',
          peer: 'Mi compañero exige y valida estándares de precisión técnica en los diagnósticos del área, asegurando que la alta dirección tome decisiones basadas en inventarios y auditorías 100% confiables.',
          subordinate: 'Mi líder exige y valida estándares de precisión técnica en los diagnósticos del área, asegurando que la alta dirección tome decisiones basadas en inventarios y auditorías 100% confiables.'
        },
        medio: {
          self: 'Valido la coherencia de los datos presentados por mi equipo, detectando inconsistencias operativas o desvíos no identificados en las tiendas bajo mi supervisión.',
          supervisor: 'El colaborador valida la coherencia de los datos presentados por su equipo, detectando inconsistencias operativas o desvíos no identificados en las tiendas bajo su supervisión.',
          peer: 'Mi compañero valida la coherencia de los datos presentados por su equipo, detectando inconsistencias operativas o desvíos no identificados en las tiendas bajo su supervisión.',
          subordinate: 'Mi líder valida la coherencia de los datos presentados por el equipo, detectando inconsistencias operativas o desvíos no identificados en las tiendas bajo su supervisión.'
        },
        bajo: {
          self: 'Reviso minuciosamente la información de inventarios, reportes y checklists antes de emitir un informe, reduciendo a cero el margen de error en la data capturada.',
          supervisor: 'El colaborador revisa minuciosamente la información de inventarios, reportes y checklists antes de emitir un informe, reduciendo a cero el margen de error en la data capturada.',
          peer: 'Mi compañero revisa minuciosamente la información de inventarios, reportes y checklists antes de emitir un informe, reduciendo a cero el margen de error en la data capturada.',
          subordinate: 'El colaborador revisa minuciosamente la información de inventarios, reportes y checklists antes de emitir un informe, reduciendo a cero el margen de error en la data capturada.'
        }
      }
    },
    {
      id: 'ci_cond_2',
      title: {
        alto: 'Modelaje de Sentido de Pertenencia y Compromiso',
        medio: 'Gestión de Cargas y Seguimiento',
        bajo: 'Autogestión y Disposición'
      },
      text: {
        alto: {
          self: 'Modeló un compromiso sobresaliente con los objetivos del área, contagiando energía, pertenencia y un sentido de propósito claro a toda la dirección.',
          supervisor: 'El colaborador modela un compromiso sobresaliente con los objetivos del área, contagiando energía, pertenencia y un sentido de propósito claro a toda la dirección.',
          peer: 'Mi compañero modela un compromiso sobresaliente con los objetivos del área, contagiando energía, pertenencia y un sentido de propósito claro a toda la dirección.',
          subordinate: 'Mi líder modela un compromiso sobresaliente con los objetivos del área, contagiando energía, pertenencia y un sentido de propósito claro a toda la dirección.'
        },
        medio: {
          self: 'Organizo las cargas de trabajo semanales de mi equipo con sentido de urgencia, asegurando un seguimiento oportuno a los objetivos del área.',
          supervisor: 'El colaborador organiza las cargas de trabajo semanales de su equipo con sentido de urgencia, asegurando un seguimiento oportuno a los objetivos del área.',
          peer: 'Mi compañero organiza las cargas de trabajo semanales de su equipo con sentido de urgencia, asegurando un seguimiento oportuno a los objetivos del área.',
          subordinate: 'Mi líder organiza las cargas de trabajo semanales de nuestro equipo con sentido de urgencia, asegurando un seguimiento oportuno a los objetivos del área.'
        },
        bajo: {
          self: 'Demuestro iniciativa, puntualidad y constante disposición para cumplir con las metas individuales de trabajo sin requerir supervisión constante.',
          supervisor: 'El colaborador demuestra iniciativa, puntualidad y constante disposición para cumplir con las metas individuales de trabajo sin requerir supervisión constante.',
          peer: 'Mi compañero demuestra iniciativa, puntualidad y constante disposición para cumplir con las metas individuales de trabajo sin requerir supervisión constante.',
          subordinate: 'El colaborador demuestra iniciativa, puntualidad y constante disposición para cumplir con las metas individuales de trabajo sin requerir supervisión constante.'
        }
      }
    },
    {
      id: 'ci_cond_3',
      title: {
        alto: 'Alianzas Estratégicas Interdepartamentales',
        medio: 'Manejo de Desacuerdos y Sinergia',
        bajo: 'Trabajo en Equipo y Sinergia'
      },
      text: {
        alto: {
          self: 'Fomento alianzas estratégicas interdepartamentales (con Operaciones, Compras y Logística), eliminando barreras de comunicación y consolidando el trabajo en equipo a escala organizacional.',
          supervisor: 'El colaborador fomenta alianzas estratégicas interdepartamentales (con Operaciones, Compras y Logística), eliminando barreras de comunicación y consolidando el trabajo en equipo a escala organizacional.',
          peer: 'Mi compañero fomenta alianzas estratégicas interdepartamentales (con Operaciones, Compras y Logística), eliminando barreras de comunicación y consolidando el trabajo en equipo a escala organizacional.',
          subordinate: 'Mi líder fomenta alianzas estratégicas interdepartamentales (con Operaciones, Compras y Logística), eliminando barreras de comunicación y consolidando el trabajo en equipo a escala organizacional.'
        },
        medio: {
          self: 'Promuevo espacios de diálogo para abordar diferencias o desacuerdos de forma constructiva, integrando las ideas del equipo en estrategias colectivas.',
          supervisor: 'El colaborador promueve espacios de diálogo para abordar diferencias o desacuerdos de forma constructiva, integrando las ideas del equipo en estrategias colectivas.',
          peer: 'Mi compañero promueve espacios de diálogo para abordar diferencias o desacuerdos de forma constructiva, integrando las ideas del equipo en estrategias colectivas.',
          subordinate: 'Mi líder promueve espacios de diálogo para abordar diferencias o desacuerdos de forma constructiva, integrando las ideas del equipo en estrategias colectivas.'
        },
        bajo: {
          self: 'Colaboro de forma activa y respetuosa con mis compañeros y personal de tienda, mostrando apertura para trabajar en ambiente de sinergia.',
          supervisor: 'El colaborador colabora de forma activa y respetuosa con sus compañeros y personal de tienda, mostrando apertura para trabajar en ambiente de sinergia.',
          peer: 'Mi compañero colabora de forma activa y respetuosa con sus compañeros y personal de tienda, mostrando apertura para trabajar en ambiente de sinergia.',
          subordinate: 'El colaborador colabora de forma activa y respetuosa con sus compañeros y personal de tienda, mostrando apertura para trabajar en ambiente de sinergia.'
        }
      }
    },
    {
      id: 'ci_cond_4',
      title: {
        alto: 'Transformación y Cultura de Innovación',
        medio: 'Diseño de Herramientas e Innovación',
        bajo: 'Iniciativa e Innovación'
      },
      text: {
        alto: {
          self: 'Promuevo una cultura de innovación en la dirección, adoptando tecnologías y mejores prácticas que transforman la gestión preventiva del negocio.',
          supervisor: 'El colaborador promueve una cultura de innovación en la dirección, adoptando tecnologías y mejores prácticas que transforman la gestión preventiva del negocio.',
          peer: 'Mi compañero promueve una cultura de innovación en la dirección, adoptando tecnologías y mejores prácticas que transforman la gestión preventiva del negocio.',
          subordinate: 'Mi líder promueve una cultura de innovación en la dirección, adoptando tecnologías y mejores prácticas que transforman la gestión preventiva del negocio.'
        },
        medio: {
          self: 'Diseño e implemento nuevas metodologías de control, formatos o herramientas de medición que optimizan los tiempos y la efectividad del equipo.',
          supervisor: 'El colaborador diseña e implementa nuevas metodologías de control, formatos o herramientas de medición que optimizan los tiempos y la efectividad del equipo.',
          peer: 'Mi compañero diseña e implementa nuevas metodologías de control, formatos o herramientas de medición que optimizan los tiempos y la efectividad del equipo.',
          subordinate: 'Mi líder diseña e implementa nuevas metodologías de control, formatos o herramientas de medición que optimizan los tiempos y la efectividad del equipo.'
        },
        bajo: {
          self: 'Propongo ideas prácticas o mejoras en el día a día para hacer más ágiles mis auditorías, conteos de inventario o actividades asignadas.',
          supervisor: 'El colaborador propone ideas prácticas o mejoras en el día a día para hacer más ágiles sus auditorías, conteos de inventario o actividades asignadas.',
          peer: 'Mi compañero propone ideas prácticas o mejoras en el día a día para hacer más ágiles sus auditorías, conteos de inventario o actividades asignadas.',
          subordinate: 'El colaborador propone ideas prácticas o mejoras en el día a día para hacer más ágiles sus auditorías, conteos de inventario o actividades asignadas.'
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
      id: 'ci_strat_1',
      title: {
        alto: 'Socio Estratégico del Negocio',
        medio: 'Cascada de Objetivos y Visión',
        bajo: 'Conciencia del Rol'
      },
      text: {
        alto: {
          self: 'Articulo las estrategias de Control Interno con las prioridades globales de la compañía, asegurando que el área actúe como un socio estratégico para el crecimiento sostenible del negocio.',
          supervisor: 'El colaborador articula las estrategias de Control Interno con las prioridades globales de la compañía, asegurando que el área actúe como un socio estratégico para el crecimiento sostenible del negocio.',
          peer: 'Mi compañero articula las estrategias de Control Interno con las prioridades globales de la compañía, asegurando que el área actúe como un socio estratégico para el crecimiento sostenible del negocio.',
          subordinate: 'Mi líder articula las estrategias de Control Interno con las prioridades globales de la compañía, asegurando que el área actúe como un socio estratégico para el crecimiento sostenible del negocio.'
        },
        medio: {
          self: 'Transmito con claridad al equipo la visión de la empresa y los objetivos de la Dirección de Control Interno, asegurando que cada integrante reconozca su aporte al negocio.',
          supervisor: 'El colaborador transmite con claridad al equipo la visión de la empresa y los objetivos de la Dirección de Control Interno, asegurando que cada integrante reconozca su aporte al negocio.',
          peer: 'Mi compañero transmite con claridad al equipo la visión de la empresa y los objetivos de la Dirección de Control Interno, asegurando que cada integrante reconozca su aporte al negocio.',
          subordinate: 'Mi líder transmite con claridad al equipo la visión de la empresa y los objetivos de la Dirección de Control Interno, asegurando que cada integrante reconozca su aporte al negocio.'
        },
        bajo: {
          self: 'Comprendo claramente cómo mi trabajo diario (auditorías, control de mermas y procesos) impacta directamente en la rentabilidad y salud financiera de la empresa.',
          supervisor: 'El colaborador comprende claramente cómo su trabajo diario (auditorías, control de mermas y procesos) impacta directamente en la rentabilidad y salud financiera de la empresa.',
          peer: 'Mi compañero comprende claramente cómo su trabajo diario (auditorías, control de mermas y procesos) impacta directamente en la rentabilidad y salud financiera de la empresa.',
          subordinate: 'El colaborador comprende claramente cómo su trabajo diario (auditorías, control de mermas y procesos) impacta directamente en la rentabilidad y salud financiera de la empresa.'
        }
      }
    },
    {
      id: 'ci_strat_2',
      title: {
        alto: 'Gestión de Causas Estructurales y Resiliencia',
        medio: 'Liderazgo de Causa Raíz y Plan de Acción',
        bajo: 'Autocrítica y Corrección'
      },
      text: {
        alto: {
          self: 'Evalúo las causas estructurales del no cumplimiento de indicadores, reasignando recursos y redefiniendo estrategias para garantizar la resiliencia y el logro de las metas anuales.',
          supervisor: 'El colaborador evalúa las causas estructurales del no cumplimiento de indicadores, reasignando recursos y redefiniendo estrategias para garantizar la resiliencia y el logro de las metas anuales.',
          peer: 'Mi compañero evalúa las causas estructurales del no cumplimiento de indicadores, reasignando recursos y redefiniendo estrategias para garantizar la resiliencia y el logro de las metas anuales.',
          subordinate: 'Mi líder evalúa las causas estructurales del no cumplimiento de indicadores, reasignando recursos y redefiniendo estrategias para garantizar la resiliencia y el logro de las metas anuales.'
        },
        medio: {
          self: 'Cuando un indicador del área se desvía de la meta semanal, lidero el análisis de causa raíz con el equipo y estructuro un plan de acción concreto para recuperar el rumbo en el mes siguiente.',
          supervisor: 'El colaborador, cuando un indicador del área se desvía de la meta semanal, lidera el análisis de causa raíz con el equipo y estructura un plan de acción concreto para recuperar el rumbo en el mes siguiente.',
          peer: 'Mi compañero, cuando un indicador del área se desvía de la meta semanal, lidera el análisis de causa raíz con el equipo y estructura un plan de acción concreto para recuperar el rumbo en el mes siguiente.',
          subordinate: 'Mi líder, cuando un indicador del área se desvía de la meta semanal, lidera el análisis de causa raíz con el equipo y estructura un plan de acción concreto para recuperar el rumbo en el mes siguiente.'
        },
        bajo: {
          self: 'Ante el no cumplimiento de un objetivo individual, asumo una actitud autocrítica, identifico qué dejé de hacer y ejecuto las acciones correctivas acordadas.',
          supervisor: 'El colaborador, ante el no cumplimiento de un objetivo individual, asume una actitud autocrítica, identifica qué dejó de hacer y ejecuta las acciones correctivas acordadas.',
          peer: 'Mi compañero, ante el no cumplimiento de un objetivo individual, asume una actitud autocrítica, identifica qué dejó de hacer y ejecuta las acciones correctivas acordadas.',
          subordinate: 'El colaborador, ante el no cumplimiento de un objetivo individual, asume una actitud autocrítica, identifica qué dejó de hacer y ejecuta las acciones correctivas acordadas.'
        }
      }
    },
    {
      id: 'ci_strat_3',
      title: {
        alto: 'Cultura de Alto Desempeño y Reconocimiento',
        medio: 'Feedback y Reconocimiento Oportuno',
        bajo: 'Reconocimiento Mutuo'
      },
      text: {
        alto: {
          self: 'Promuevo una cultura organizacional donde se valora el logro, se reconoce el talento y se gestiona el desempeño de forma transparente y motivadora.',
          supervisor: 'El colaborador promueve una cultura organizacional donde se valora el logro, se reconoce el talento y se gestiona el desempeño de forma transparente y motivadora.',
          peer: 'Mi compañero promueve una cultura organizacional donde se valora el logro, se reconoce el talento y se gestiona el desempeño de forma transparente y motivadora.',
          subordinate: 'Mi líder promueve una cultura organizacional donde se valora el logro, se reconoce el talento y se gestiona el desempeño de forma transparente y motivadora.'
        },
        medio: {
          self: 'Mantengo un seguimiento constante y reconozco oportunamente el desempeño individual y colectivo de mis colaboradores directos.',
          supervisor: 'El colaborador mantiene un seguimiento constante y reconoce oportunamente el desempeño individual y colectivo de sus colaboradores directos.',
          peer: 'Mi compañero mantiene un seguimiento constante y reconoce oportunamente el desempeño individual y colectivo de los miembros del equipo.',
          subordinate: 'Mi líder mantiene un seguimiento constante y reconoce oportunamente el desempeño individual y colectivo de sus colaboradores directos.'
        },
        bajo: {
          self: 'Reconozco abiertamente el esfuerzo y apoyo de mis compañeros de equipo en la consecución de las metas compartidas de Control Interno.',
          supervisor: 'El colaborador reconoce abiertamente el esfuerzo y apoyo de sus compañeros de equipo en la consecución de las metas compartidas de Control Interno.',
          peer: 'Mi compañero reconoce abiertamente el esfuerzo y apoyo de sus compañeros de equipo en la consecución de las metas compartidas de Control Interno.',
          subordinate: 'El colaborador reconoce abiertamente el esfuerzo y apoyo de sus compañeros de equipo en la consecución de las metas compartidas de Control Interno.'
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
          <ShieldCheck size={20} className={isDark ? 'text-[#F1B400]' : 'text-amber-800'} />
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}>
              Dirección de Control Interno
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Evaluación de cumplimiento, auditoría, prevención y control de procesos en el período.
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
            Medición de indicadores clave de control interno según la periodicidad establecida.
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

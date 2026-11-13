import React from 'react';
import { EvaluationData } from '../types';
import { Calculator, DollarSign, Landmark, CheckCircle2, TrendingUp, ShieldCheck, MessageSquare, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { resolveResponsibilityLevel, ResponsibilityLevel } from '../utils/responsibilityResolver';

export type EvaluatorRoleType = 'self' | 'supervisor' | 'peer' | 'subordinate';

interface AdministracionFinanzasSection1FormProps {
  data: EvaluationData;
  onChange: (data: EvaluationData) => void;
  isSupervisor?: boolean;
  evaluatorRole?: 'self' | 'supervisor' | 'peer' | 'subordinate' | string;
  employeePosition?: string;
  theme?: 'dark' | 'light';
}

// Escala Likert de Frecuencia Observable (Base 1.0 a 5.0)
const FREQUENCY_SCALE = [
  { score: 1, label: 'NUNCA' },
  { score: 2, label: 'RARA VEZ' },
  { score: 3, label: 'OCASIONALMENTE' },
  { score: 4, label: 'FRECUENTEMENTE' },
  { score: 5, label: 'SIEMPRE' },
];

// Escala para KPIs Técnicos
const KPI_SCALE = [
  { score: 1, label: 'DEFICIENTE' },
  { score: 2, label: 'EN DESARROLLO' },
  { score: 3, label: 'COMPETENTE' },
  { score: 4, label: 'AVANZADO' },
  { score: 5, label: 'SOBRESALIENTE' },
];

export function AdministracionFinanzasSection1Form({
  data,
  onChange,
  evaluatorRole = 'self',
  employeePosition = '',
  theme = 'dark'
}: AdministracionFinanzasSection1FormProps) {
  const isDark = theme === 'dark';

  // 1. Nivel de Responsabilidad del Cargo (Alto, Medio o Bajo)
  const responsibilityLevel: ResponsibilityLevel = resolveResponsibilityLevel(employeePosition);

  // 2. Normalización del rol de evaluador para modular la perspectiva gramatical 360°/180°
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

  const handleScoreChange = (id: string, score: number) => {
    onChange({
      ...data,
      scores: {
        ...data.scores,
        [id]: score
      }
    });
  };

  const handleTextChange = (field: string, text: string) => {
    onChange({
      ...data,
      comments: {
        ...data.comments,
        [field]: text
      }
    });
  };

  // Renderizador de escala numérica 1 al 5
  const renderScoreButtons = (id: string, isKpi: boolean = false) => {
    const currentScore = data.scores?.[id];
    const scale = isKpi ? KPI_SCALE : FREQUENCY_SCALE;
    const selectedOption = scale.find(s => s.score === currentScore);

    return (
      <div className="space-y-2 pt-1.5">
        <div className="flex items-center gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5].map((score) => {
            const isSelected = currentScore === score;
            const opt = scale[score - 1];
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
                title={`Puntaje ${score}: ${opt.label}`}
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
  // SUB-BLOQUE 1: KPIs Y OBJETIVOS OPERATIVOS MEDIBLES (50%)
  // Modulados por Nivel de Gestión (Alto, Medio, Bajo) y Rol de Evaluador (360°/180°)
  // =========================================================================================
  const sub1Items = [
    {
      id: 'daf_kpi_1',
      frequency: {
        alto: 'Mensual',
        medio: 'Mensual',
        bajo: 'Mensual'
      },
      title: {
        alto: 'Garantía Oportuna del Cierre Financiero y Exactitud Macro',
        medio: 'Efectividad en el SLA del Cierre Contable',
        bajo: 'Oportunidad en Entregables de Cierre Contable'
      },
      meta: {
        alto: 'Meta: Entrega oportuna del cierre financiero consolidado dentro del SLA, libre de errores materiales',
        medio: 'Meta: Consolidación del cierre contable mensual del área dentro del plazo establecido (primeros X días)',
        bajo: 'Meta: Entrega de asientos, registros y partidas asignadas dentro de las fechas límite del calendario'
      },
      text: {
        alto: {
          self: 'Respondo por la entrega oportuna del cierre contable/financiero consolidado dentro del SLA estipulado, libre de errores materiales.',
          supervisor: 'El colaborador responde por la entrega oportuna del cierre contable/financiero consolidado dentro del SLA estipulado, libre de errores materiales.',
          peer: 'Mi compañero responde por la entrega oportuna del cierre contable/financiero consolidado dentro del SLA estipulado, libre de errores materiales.',
          subordinate: 'Mi líder responde por la entrega oportuna del cierre contable/financiero consolidado dentro del SLA estipulado, libre de errores materiales.'
        },
        medio: {
          self: 'Coordino y garantizo la consolidación del cierre contable mensual del área dentro del plazo establecido (primeros X días del mes).',
          supervisor: 'El colaborador coordina y garantiza la consolidación del cierre contable mensual del área dentro del plazo establecido (primeros X días del mes).',
          peer: 'Mi compañero coordina y garantiza la consolidación del cierre contable mensual del área dentro del plazo establecido (primeros X días del mes).',
          subordinate: 'Mi líder coordina y garantiza la consolidación del cierre contable mensual del área dentro del plazo establecido (primeros X días del mes).'
        },
        bajo: {
          self: 'Entrego los asientos, registros y partidas asignadas dentro de las fechas límite establecidas en el calendario del cierre contable mensual.',
          supervisor: 'El colaborador entrega los asientos, registros y partidas asignadas dentro de las fechas límite establecidas en el calendario del cierre contable mensual.',
          peer: 'Mi compañero entrega los asientos, registros y partidas asignadas dentro de las fechas límite establecidas en el calendario del cierre contable mensual.',
          subordinate: 'El colaborador entrega los asientos, registros y partidas asignadas dentro de las fechas límite establecidas en el calendario del cierre contable mensual.'
        }
      }
    },
    {
      id: 'daf_kpi_2',
      frequency: {
        alto: 'Mensual',
        medio: 'Mensual',
        bajo: 'Semanal'
      },
      title: {
        alto: 'Sostenibilidad del Flujo de Caja y Rentabilidad sobre Ventas',
        medio: 'Control de Calidad, Impuestos y Conciliaciones Complejas',
        bajo: 'Precisión y Calidad en Registros y Conciliaciones'
      },
      meta: {
        alto: 'Meta: Sostenibilidad de liquidez operativa y contención del ratio de gastos sobre ventas',
        medio: 'Meta: Cero faltas en declaraciones fiscales, multas o reprocesos en estados de cuenta',
        bajo: 'Meta: Exactitud en conciliaciones y asientos con tasa nula de errores o reprocesos'
      },
      text: {
        alto: {
          self: 'Garantizo la liquidez necesaria para sostener la operación y planes de expansión, manteniendo bajo control el peso de los gastos sobre la rentabilidad general.',
          supervisor: 'El colaborador garantiza la liquidez necesaria para sostener la operación y planes de expansión, manteniendo bajo control el peso de los gastos sobre la rentabilidad general.',
          peer: 'Mi compañero garantiza la liquidez necesaria para sostener la operación y planes de expansión, manteniendo bajo control el peso de los gastos sobre la rentabilidad general.',
          subordinate: 'Mi líder garantiza la liquidez necesaria para sostener la operación y planes de expansión, manteniendo bajo control el peso de los gastos sobre la rentabilidad general.'
        },
        medio: {
          self: 'Superviso la precisión de la información financiera, asegurando cero faltas en declaraciones fiscales, multas o reprocesos en estados de cuenta.',
          supervisor: 'El colaborador supervisa la precisión de la información financiera, asegurando cero faltas en declaraciones fiscales, multas o reprocesos en estados de cuenta.',
          peer: 'Mi compañero supervisa la precisión de la información financiera, asegurando cero faltas en declaraciones fiscales, multas o reprocesos en estados de cuenta.',
          subordinate: 'Mi líder supervisa la precisión de la información financiera, asegurando cero faltas en declaraciones fiscales, multas o reprocesos en estados de cuenta.'
        },
        bajo: {
          self: 'Garantizo la exactitud de los registros contables, conciliaciones bancarias o declaraciones procesadas, manteniendo una tasa nula de errores de cálculo o reprocesos.',
          supervisor: 'El colaborador garantiza la exactitud de los registros contables, conciliaciones bancarias o declaraciones procesadas, manteniendo una tasa nula de errores de cálculo o reprocesos.',
          peer: 'Mi compañero garantiza la exactitud de los registros contables, conciliaciones bancarias o declaraciones procesadas, manteniendo una tasa nula de errores de cálculo o reprocesos.',
          subordinate: 'El colaborador garantiza la exactitud de los registros contables, conciliaciones bancarias o declaraciones procesadas, manteniendo una tasa nula de errores de cálculo o reprocesos.'
        }
      }
    },
    {
      id: 'daf_kpi_3',
      frequency: {
        alto: 'Mensual / Trimestral',
        medio: 'Semanal',
        bajo: 'Semanal'
      },
      title: {
        alto: 'Cumplimiento 100% Fiscal, Legal y Normativo',
        medio: 'Gestión Eficiente del Flujo de Pagos a Proveedores',
        bajo: 'Cumplimiento del SLA de Pagos y Reembolsos'
      },
      meta: {
        alto: 'Meta: Cero multas, penalizaciones o contingencias fiscales y tributarias',
        medio: 'Meta: Cumplimiento de SLA de cuentas por pagar protegiendo relaciones y liquidez',
        bajo: 'Meta: Facturas y reembolsos procesados a tiempo evitando retrasos u operaciones detenidas'
      },
      text: {
        alto: {
          self: 'Aseguro el total cumplimiento de las obligaciones fiscales y legales de la compañía, registrando un indicador de cero multas, penalizaciones o contingencias.',
          supervisor: 'El colaborador asegura el total cumplimiento de las obligaciones fiscales y legales de la compañía, registrando un indicador de cero multas, penalizaciones o contingencias.',
          peer: 'Mi compañero asegura el total cumplimiento de las obligaciones fiscales y legales de la compañía, registrando un indicador de cero multas, penalizaciones o contingencias.',
          subordinate: 'Mi líder asegura el total cumplimiento de las obligaciones fiscales y legales de la compañía, registrando un indicador de cero multas, penalizaciones o contingencias.'
        },
        medio: {
          self: 'Garantizo el cumplimiento del SLA de pagos del equipo, optimizando el ciclo de cuentas por pagar para proteger la relación comercial sin comprometer la liquidez.',
          supervisor: 'El colaborador garantiza el cumplimiento del SLA de pagos del equipo, optimizando el ciclo de cuentas por pagar para proteger la relación comercial sin comprometer la liquidez.',
          peer: 'Mi compañero garantiza el cumplimiento del SLA de pagos del equipo, optimizando el ciclo de cuentas por pagar para proteger la relación comercial sin comprometer la liquidez.',
          subordinate: 'Mi líder garantiza el cumplimiento del SLA de pagos del equipo, optimizando el ciclo de cuentas por pagar para proteger la relación comercial sin comprometer la liquidez.'
        },
        bajo: {
          self: 'Proceso las facturas de proveedores, órdenes de pago y reembolsos dentro de los tiempos estipulados, evitando demoras o moras que afecten la operación.',
          supervisor: 'El colaborador procesa las facturas de proveedores, órdenes de pago y reembolsos dentro de los tiempos estipulados, evitando demoras o moras que afecten la operación.',
          peer: 'Mi compañero procesa las facturas de proveedores, órdenes de pago y reembolsos dentro de los tiempos estipulados, evitando demoras o moras que afecten la operación.',
          subordinate: 'El colaborador procesa las facturas de proveedores, órdenes de pago y reembolsos dentro de los tiempos estipulados, evitando demoras o moras que afecten la operación.'
        }
      }
    },
    {
      id: 'daf_kpi_4',
      frequency: {
        alto: 'Mensual',
        medio: 'Semanal',
        bajo: 'Semanal'
      },
      title: {
        alto: 'Control Macro de la Ejecución Presupuestaria',
        medio: 'Variación de Ejecución Presupuestaria y Flujo de Caja',
        bajo: 'Control y Validación de Soporte de Rendición de Cuentas'
      },
      meta: {
        alto: 'Meta: Precisión presupuestaria corporativa y salvaguarda patrimonial',
        medio: 'Meta: Desviación controlada y alerta temprana ante variaciones fuera de presupuesto',
        bajo: 'Meta: Fondos a rendir y cajas chicas revisados con soportes válidos y dentro del plazo límite'
      },
      text: {
        alto: {
          self: 'Garantizo la precisión en la proyección y control del presupuesto ejecutado en toda la organización, protegiendo el patrimonio del negocio.',
          supervisor: 'El colaborador garantiza la precisión en la proyección y control del presupuesto ejecutado en toda la organización, protegiendo el patrimonio del negocio.',
          peer: 'Mi compañero garantiza la precisión en la proyección y control del presupuesto ejecutado en toda la organización, protegiendo el patrimonio del negocio.',
          subordinate: 'Mi líder garantiza la precisión en la proyección y control del presupuesto ejecutado en toda la organización, protegiendo el patrimonio del negocio.'
        },
        medio: {
          self: 'Superviso la desviación entre la proyección de flujo de caja/gastos y la ejecución real de las áreas, alertando variaciones fuera de presupuesto.',
          supervisor: 'El colaborador supervisa la desviación entre la proyección de flujo de caja/gastos y la ejecución real de las áreas, alertando variaciones fuera de presupuesto.',
          peer: 'Mi compañero supervisa la desviación entre la proyección de flujo de caja/gastos y la ejecución real de las áreas, alertando variaciones fuera de presupuesto.',
          subordinate: 'Mi líder supervisa la desviación entre la proyección de flujo de caja/gastos y la ejecución real de las áreas, alertando variaciones fuera de presupuesto.'
        },
        bajo: {
          self: 'Reviso minuciosamente la validez de los soportes de caja chica y fondos a rendir de tiendas/áreas, velando por el cumplimiento del plazo límite de entrega.',
          supervisor: 'El colaborador revisa minuciosamente la validez de los soportes de caja chica y fondos a rendir de tiendas/áreas, velando por el cumplimiento del plazo límite de entrega.',
          peer: 'Mi compañero revisa minuciosamente la validez de los soportes de caja chica y fondos a rendir de tiendas/áreas, velando por el cumplimiento del plazo límite de entrega.',
          subordinate: 'El colaborador revisa minuciosamente la validez de los soportes de caja chica y fondos a rendir de tiendas/áreas, velando por el cumplimiento del plazo límite de entrega.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 2: COMPETENCIAS CONDUCTUALES OPERATIVIZADAS (35%)
  // Moduladas por Nivel de Gestión (Alto, Medio, Bajo) y Rol de Evaluador (360°/180°)
  // =========================================================================================
  const sub2Items = [
    {
      id: 'daf_cond_1',
      title: {
        alto: 'Building Business Capacity (Crecimiento Sostenible)',
        medio: 'Construcción de Capacidad de Negocio (Simplificación/Automatización)',
        bajo: 'Ejecución con Excelencia y Rigor Analítico'
      },
      text: {
        alto: {
          self: 'Diseño e implemento estrategias financieras, estructuras de costo y modelos de control que aseguran la competitividad y expansión de la empresa a largo plazo.',
          supervisor: 'El colaborador diseña e implementa estrategias financieras, estructuras de costo y modelos de control que aseguran la competitividad y expansión de la empresa a largo plazo.',
          peer: 'Mi compañero diseña e implementa estrategias financieras, estructuras de costo y modelos de control que aseguran la competitividad y expansión de la empresa a largo plazo.',
          subordinate: 'Mi líder diseña e implementa estrategias financieras, estructuras de costo y modelos de control que aseguran la competitividad y expansión de la empresa a largo plazo.'
        },
        medio: {
          self: 'Identifico tareas repetitivas en el flujo contable/financiero y propongo mejoras, herramientas o automatizaciones que reducen tiempos de procesamiento.',
          supervisor: 'El colaborador identifica tareas repetitivas en el flujo contable/financiero y propone mejoras, herramientas o automatizaciones que reducen tiempos de procesamiento.',
          peer: 'Mi compañero identifica tareas repetitivas en el flujo contable/financiero y propone mejoras, herramientas o automatizaciones que reducen tiempos de procesamiento.',
          subordinate: 'Mi líder identifica tareas repetitivas en el flujo contable/financiero y propone mejoras, herramientas o automatizaciones que reducen tiempos de procesamiento.'
        },
        bajo: {
          self: 'Demuestro alta rigurosidad y atención al detalle en la revisión de cifras y documentos, validando la información previa a su registro para evitar fugas de dinero.',
          supervisor: 'El colaborador demuestra alta rigurosidad y atención al detalle en la revisión de cifras y documentos, validando la información previa a su registro para evitar fugas de dinero.',
          peer: 'Mi compañero demuestra alta rigurosidad y atención al detalle en la revisión de cifras y documentos, validando la información previa a su registro para evitar fugas de dinero.',
          subordinate: 'El colaborador demuestra alta rigurosidad y atención al detalle en la revisión de cifras y documentos, validando la información previa a su registro para evitar fugas de dinero.'
        }
      }
    },
    {
      id: 'daf_cond_2',
      title: {
        alto: 'Executing with Excellence y Protección Patrimonial',
        medio: 'Comunicación Asertiva y Fluida',
        bajo: 'Servicio al Cliente Interno (360°)'
      },
      text: {
        alto: {
          self: 'Modelo la rigurosidad analítica, ética e integridad financiera en toda la organización, garantizando un marco de gobierno corporativo sólido.',
          supervisor: 'El colaborador modela la rigurosidad analítica, ética e integridad financiera en toda la organización, garantizando un marco de gobierno corporativo sólido.',
          peer: 'Mi compañero modela la rigurosidad analítica, ética e integridad financiera en toda la organización, garantizando un marco de gobierno corporativo sólido.',
          subordinate: 'Mi líder modela la rigurosidad analítica, ética e integridad financiera en toda la organización, garantizando un marco de gobierno corporativo sólido.'
        },
        medio: {
          self: 'Transmito requerimientos, normas presupuestarias y decisiones de control financiero de forma clara y persuasiva a líderes de distintas direcciones.',
          supervisor: 'El colaborador transmite requerimientos, normas presupuestarias y decisiones de control financiero de forma clara y persuasiva a líderes de distintas direcciones.',
          peer: 'Mi compañero transmite requerimientos, normas presupuestarias y decisiones de control financiero de forma clara y persuasiva a líderes de distintas direcciones.',
          subordinate: 'Mi líder transmite requerimientos, normas presupuestarias y decisiones de control financiero de forma clara y persuasiva a líderes de distintas direcciones.'
        },
        bajo: {
          self: 'Brindo respuestas oportunas, claras y orientadas a la solución ante las solicitudes financieras y administrativas de otras áreas (Comercial, Logística, Operaciones) sin generar cuellos de botella.',
          supervisor: 'El colaborador brinda respuestas oportunas, claras y orientadas a la solución ante las solicitudes financieras y administrativas de otras áreas (Comercial, Logística, Operaciones) sin generar cuellos de botella.',
          peer: 'Mi compañero brinda respuestas oportunas, claras y orientadas a la solución ante las solicitudes financieras y administrativas de otras áreas (Comercial, Logística, Operaciones) sin generar cuellos de botella.',
          subordinate: 'El colaborador brinda respuestas oportunas, claras y orientadas a la solución ante las solicitudes financieras y administrativas de otras áreas (Comercial, Logística, Operaciones) sin generar cuellos de botella.'
        }
      }
    },
    {
      id: 'daf_cond_3',
      title: {
        alto: 'Liderazgo de Servicio al Cliente Interno',
        medio: 'Trabajo en Equipo y Colaboración Cross-Functional',
        bajo: 'Proactividad y Detección de Inconsistencias'
      },
      text: {
        alto: {
          self: 'Aseguro que la Dirección de Administración y Finanzas actúe como un facilitador ágil y eficiente para las necesidades operativas, logísticas y comerciales del negocio.',
          supervisor: 'El colaborador asegura que la Dirección de Administración y Finanzas actúe como un facilitador ágil y eficiente para las necesidades operativas, logísticas y comerciales del negocio.',
          peer: 'Mi compañero asegura que la Dirección de Administración y Finanzas actúe como un facilitador ágil y eficiente para las necesidades operativas, logísticas y comerciales del negocio.',
          subordinate: 'Mi líder asegura que la Dirección de Administración y Finanzas actúe como un facilitador ágil y eficiente para las necesidades operativas, logísticas y comerciales del negocio.'
        },
        medio: {
          self: 'Colaboro activamente con Operaciones, Comercial y Logística para resolver cuellos de botella en la recepción de facturas, fondos y conciliaciones.',
          supervisor: 'El colaborador colabora activamente con Operaciones, Comercial y Logística para resolver cuellos de botella en la recepción de facturas, fondos y conciliaciones.',
          peer: 'Mi compañero colabora activamente con Operaciones, Comercial y Logística para resolver cuellos de botella en la recepción de facturas, fondos y conciliaciones.',
          subordinate: 'Mi líder colabora activamente con Operaciones, Comercial y Logística para resolver cuellos de botella en la recepción de facturas, fondos y conciliaciones.'
        },
        bajo: {
          self: 'Reviso activamente los datos asignados e identifico anomalías, diferencias en cuentas o posibles duplicidades, notificándolas antes de que se consoliden.',
          supervisor: 'El colaborador revisa activamente los datos asignados e identifica anomalías, diferencias en cuentas o posibles duplicidades, notificándolas antes de que se consoliden.',
          peer: 'Mi compañero revisa activamente los datos asignados e identifica anomalías, diferencias en cuentas o posibles duplicidades, notificándolas antes de que se consoliden.',
          subordinate: 'El colaborador revisa activamente los datos asignados e identifica anomalías, diferencias en cuentas o posibles duplicidades, notificándolas antes de que se consoliden.'
        }
      }
    },
    {
      id: 'daf_cond_4',
      title: {
        alto: 'Comunicación Estratégica e Influencia',
        medio: 'Resolución de Problemas e Investigación de Causa Raíz',
        bajo: 'Ética, Integridad y Manejo Confidencial'
      },
      text: {
        alto: {
          self: 'Presento la información financiera y de rentabilidad de forma clara y estratégica ante el Comité Ejecutivo y Junta Directiva para fundamentar decisiones de inversión.',
          supervisor: 'El colaborador presenta la información financiera y de rentabilidad de forma clara y estratégica ante el Comité Ejecutivo y Junta Directiva para fundamentar decisiones de inversión.',
          peer: 'Mi compañero presenta la información financiera y de rentabilidad de forma clara y estratégica ante el Comité Ejecutivo y Junta Directiva para fundamentar decisiones de inversión.',
          subordinate: 'Mi líder presenta la información financiera y de rentabilidad de forma clara y estratégica ante el Comité Ejecutivo y Junta Directiva para fundamentar decisiones de inversión.'
        },
        medio: {
          self: 'Frente a una discrepancia contable o presupuesto desviado, analizo la causa raíz del problema en lugar de limitarme a procesar las cifras.',
          supervisor: 'El colaborador, frente a una discrepancia contable o presupuesto desviado, analiza la causa raíz del problema en lugar de limitarse a procesar las cifras.',
          peer: 'Mi compañero, frente a una discrepancia contable o presupuesto desviado, analiza la causa raíz del problema en lugar de limitarse a procesar las cifras.',
          subordinate: 'Mi líder, frente a una discrepancia contable o presupuesto desviado, analiza la causa raíz del problema en lugar de limitarse a procesar las cifras.'
        },
        bajo: {
          self: 'Mantengo una conducta ética intachable en la manipulación de fondos, información financiera confidencial y documentación legal/normativa de la empresa.',
          supervisor: 'El colaborador mantiene una conducta ética intachable en la manipulación de fondos, información financiera confidencial y documentación legal/normativa de la empresa.',
          peer: 'Mi compañero mantiene una conducta ética intachable en la manipulación de fondos, información financiera confidencial y documentación legal/normativa de la empresa.',
          subordinate: 'El colaborador mantiene una conducta ética intachable en la manipulación de fondos, información financiera confidencial y documentación legal/normativa de la empresa.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 3: ALINEACIÓN ESTRATÉGICA, RESILIENCIA Y PLANES DE ACCIÓN (15%)
  // Modulados por Nivel de Gestión (Alto, Medio, Bajo) y Rol de Evaluador (360°/180°)
  // =========================================================================================
  const sub3Items = [
    {
      id: 'daf_strat_1',
      title: {
        alto: 'Dirección de Resiliencia Financiera y Contingencias',
        medio: 'Liderazgo de Alerta Temprana y Planes de Acción',
        bajo: 'Conciencia del Impacto en la Liquidez'
      },
      text: {
        alto: {
          self: 'Diseño e implemento planes de contingencia ante escenarios de liquidez ajustada, inflación o fluctuaciones de mercado, resguardando la estabilidad del negocio.',
          supervisor: 'El colaborador diseña e implementa planes de contingencia ante escenarios de liquidez ajustada, inflación o fluctuaciones de mercado, resguardando la estabilidad del negocio.',
          peer: 'Mi compañero diseña e implementa planes de contingencia ante escenarios de liquidez ajustada, inflación o fluctuaciones de mercado, resguardando la estabilidad del negocio.',
          subordinate: 'Mi líder diseña e implementa planes de contingencia ante escenarios de liquidez ajustada, inflación o fluctuaciones de mercado, resguardando la estabilidad del negocio.'
        },
        medio: {
          self: 'Ante una desviación en el cronograma de cierre o flujo de caja, aplico alerta temprana con la gerencia, presentando inmediatamente un plan de acción con fechas de corrección.',
          supervisor: 'El colaborador, ante una desviación en el cronograma de cierre o flujo de caja, aplica alerta temprana con la gerencia, presentando inmediatamente un plan de acción con fechas de corrección.',
          peer: 'Mi compañero, ante una desviación en el cronograma de cierre o flujo de caja, aplica alerta temprana con la gerencia, presentando inmediatamente un plan de acción con fechas de corrección.',
          subordinate: 'Mi líder, ante una desviación en el cronograma de cierre o flujo de caja, aplica alerta temprana con la gerencia, presentando inmediatamente un plan de acción con fechas de corrección.'
        },
        bajo: {
          self: 'Comprendo con claridad cómo la precisión de mi trabajo diario protege el patrimonio de la empresa y sostiene la disponibilidad de caja.',
          supervisor: 'El colaborador comprende con claridad cómo la precisión de su trabajo diario protege el patrimonio de la empresa y sostiene la disponibilidad de caja.',
          peer: 'Mi compañero comprende con claridad cómo la precisión de su trabajo diario protege el patrimonio de la empresa y sostiene la disponibilidad de caja.',
          subordinate: 'El colaborador comprende con claridad cómo la precisión de su trabajo diario protege el patrimonio de la empresa y sostiene la disponibilidad de caja.'
        }
      }
    },
    {
      id: 'daf_strat_2',
      title: {
        alto: 'Gestión de Causas Estructurales y Rediseño de Procesos',
        medio: 'Ajuste de Procedimientos Preventivos',
        bajo: 'Alerta Temprana y Reporte de Errores'
      },
      text: {
        alto: {
          self: 'Analizo las causas raíz de las ineficiencias financieras o presupuestarias de la empresa, impulsando reestructuraciones normativas de alto impacto.',
          supervisor: 'El colaborador analiza las causas raíz de las ineficiencias financieras o presupuestarias de la empresa, impulsando reestructuraciones normativas de alto impacto.',
          peer: 'Mi compañero analiza las causas raíz de las ineficiencias financieras o presupuestarias de la empresa, impulsando reestructuraciones normativas de alto impacto.',
          subordinate: 'Mi líder analiza las causas raíz de las ineficiencias financieras o presupuestarias de la empresa, impulsando reestructuraciones normativas de alto impacto.'
        },
        medio: {
          self: 'Ante un error o retraso identificado en el ciclo financiero, propongo e implemento ajustes en los procedimientos para evitar que la falla vuelva a ocurrir.',
          supervisor: 'El colaborador, ante un error o retraso identificado en el ciclo financiero, propone e implementa ajustes en los procedimientos para evitar que la falla vuelva a ocurrir.',
          peer: 'Mi compañero, ante un error o retraso identificado en el ciclo financiero, propone e implementa ajustes en los procedimientos para evitar que la falla vuelva a ocurrir.',
          subordinate: 'Mi líder, ante un error o retraso identificado en el ciclo financiero, propone e implementa ajustes en los procedimientos para evitar que la falla vuelva a ocurrir.'
        },
        bajo: {
          self: 'Ante una inconsistencia en caja o un error de registro, notifico de forma inmediata a mi jefatura sin ocultar la falla y colaboro activamente en la subsanación.',
          supervisor: 'El colaborador, ante una inconsistencia en caja o un error de registro, notifica de forma inmediata a su jefatura sin ocultar la falla y colabora activamente en la subsanación.',
          peer: 'Mi compañero, ante una inconsistencia en caja o un error de registro, notifica de forma inmediata a su jefatura sin ocultar la falla y colabora activamente en la subsanación.',
          subordinate: 'El colaborador, ante una inconsistencia en caja o un error de registro, notifica de forma inmediata a su jefatura sin ocultar la falla y colabora activamente en la subsanación.'
        }
      }
    },
    {
      id: 'daf_strat_3',
      title: {
        alto: 'Alineación con los Pilares de Expansión y Ventas',
        medio: 'Orientación a la Rentabilidad',
        bajo: 'Serenidad y Trabajo bajo Presión'
      },
      text: {
        alto: {
          self: 'Garantizo que la gestión de caja, pagos y control de personal respalden de forma fluida los planes de apertura de tiendas y crecimiento comercial.',
          supervisor: 'El colaborador garantiza que la gestión de caja, pagos y control de personal respalden de forma fluida los planes de apertura de tiendas y crecimiento comercial.',
          peer: 'Mi compañero garantiza que la gestión de caja, pagos y control de personal respalden de forma fluida los planes de apertura de tiendas y crecimiento comercial.',
          subordinate: 'Mi líder garantiza que la gestión de caja, pagos y control de personal respalden de forma fluida los planes de apertura de tiendas y crecimiento comercial.'
        },
        medio: {
          self: 'Velo por la correcta aplicación del gasto en cada departamento, apoyando activamente el control del peso del gasto operativo sobre las ventas.',
          supervisor: 'El colaborador vela por la correcta aplicación del gasto en cada departamento, apoyando activamente el control del peso del gasto operativo sobre las ventas.',
          peer: 'Mi compañero vela por la correcta aplicación del gasto en cada departamento, apoyando activamente el control del peso del gasto operativo sobre las ventas.',
          subordinate: 'Mi líder vela por la correcta aplicación del gasto en cada departamento, apoyando activamente el control del peso del gasto operativo sobre las ventas.'
        },
        bajo: {
          self: 'Mantengo la serenidad, rigurosidad técnica y precisión durante los picos de carga de trabajo característicos de los cierres mensuales o auditorías.',
          supervisor: 'El colaborador mantiene la serenidad, rigurosidad técnica y precisión durante los picos de carga de trabajo característicos de los cierres mensuales o auditorías.',
          peer: 'Mi compañero mantiene la serenidad, rigurosidad técnica y precisión durante los picos de carga de trabajo característicos de los cierres mensuales o auditorías.',
          subordinate: 'El colaborador mantiene la serenidad, rigurosidad técnica y precisión durante los picos de carga de trabajo característicos de los cierres mensuales o auditorías.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 4: FEEDBACK CUALITATIVO
  // =========================================================================================
  const feedbackConfig = {
    alto: {
      reconocimientosLabel: 'Reconocimientos (Hitos Financieros, Rentabilidad y Expansión)',
      reconocimientosPrompt: '¿Qué decisiones de optimización financiera, protección patrimonial o liderazgo estratégico destacaron en la gestión?',
      compromisosLabel: 'Compromisos de Mejora Estratégica',
      compromisosPrompt: 'Defina de 1 a 3 compromisos estratégicos para fortalecer el flujo de caja, la automatización del área o el control de rentabilidad sobre ventas.'
    },
    medio: {
      reconocimientosLabel: 'Reconocimientos (Automatización, Cierre y Control)',
      reconocimientosPrompt: '¿Qué aportes en automatización de procesos, liderazgo de cierre o control presupuestario destacan en el periodo?',
      compromisosLabel: 'Compromisos de Mejora Táctica',
      compromisosPrompt: 'Defina de 1 a 3 compromisos tácticos sobre cumplimiento de SLA de cierre, gestión de auditorías o control de pagos para el siguiente ciclo.'
    },
    bajo: {
      reconocimientosLabel: 'Reconocimientos (Rigor Analítico y Servicio Interno)',
      reconocimientosPrompt: '¿Qué análisis precisos, calidad de servicio o aportes en el control de registros destacaron en este periodo?',
      compromisosLabel: 'Compromisos de Mejora Operativa',
      compromisosPrompt: 'Defina de 1 a 3 compromisos concretos en oportunidad de entrega, reducción de reprocesos o servicio al cliente interno para el siguiente ciclo.'
    }
  }[responsibilityLevel];

  // =========================================================================================
  // CÁLCULO DE PROMEDIOS Y NOTA BRUTA DE LA SECCIÓN 1
  // =========================================================================================
  const sub1Scores = sub1Items.map(i => data.scores?.[i.id]).filter((s): s is number => typeof s === 'number' && s > 0);
  const sub2Scores = sub2Items.map(i => data.scores?.[i.id]).filter((s): s is number => typeof s === 'number' && s > 0);
  const sub3Scores = sub3Items.map(i => data.scores?.[i.id]).filter((s): s is number => typeof s === 'number' && s > 0);

  const avgSub1 = sub1Scores.length > 0 ? sub1Scores.reduce((a, b) => a + b, 0) / sub1Scores.length : 0;
  const avgSub2 = sub2Scores.length > 0 ? sub2Scores.reduce((a, b) => a + b, 0) / sub2Scores.length : 0;
  const avgSub3 = sub3Scores.length > 0 ? sub3Scores.reduce((a, b) => a + b, 0) / sub3Scores.length : 0;

  let totalWeight = 0;
  let weightedSum = 0;
  if (sub1Scores.length > 0) {
    weightedSum += avgSub1 * 0.50;
    totalWeight += 0.50;
  }
  if (sub2Scores.length > 0) {
    weightedSum += avgSub2 * 0.35;
    totalWeight += 0.35;
  }
  if (sub3Scores.length > 0) {
    weightedSum += avgSub3 * 0.15;
    totalWeight += 0.15;
  }

  const rawSection1Score = totalWeight > 0 ? (weightedSum / totalWeight) : 0;
  const weightedContribution = rawSection1Score * 0.60;

  const levelBadge = {
    alto: { text: 'NIVEL 3: ESTRATÉGICO / ALTO', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    medio: { text: 'NIVEL 2: TÉCNICO / INTERMEDIO', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    bajo: { text: 'NIVEL 1: BASE / OPERATIVO', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
  }[responsibilityLevel];

  return (
    <div className="space-y-6">
      {/* Encabezado limpio de Sección 1 */}
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-[#F1B400]/10 border border-[#F1B400]/20 text-[#F1B400]">
            <Landmark size={20} />
          </div>
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}>
              Dirección de Administración y Finanzas
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Evaluación de metas financieras, indicadores de gestión y procesos en el período.
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono text-zinc-500">
          Progreso: <strong className={isDark ? 'text-white' : 'text-zinc-900'}>{answeredQuestions} de {totalQuestions}</strong>
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* SUB-BLOQUE 1: KPIs Y OBJETIVOS OPERATIVOS MEDIBLES                                        */}
      {/* ========================================================================================= */}
      <div className={`p-5 rounded-2xl border transition-colors duration-200 shadow-sm space-y-4 ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="pb-3 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-[#F1B400]" />
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Sub-bloque 1: KPIs y Objetivos Operativos Medibles
            </h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Cumplimiento de metas financieras, calendario de cierre, exactitud contable y control del gasto.
          </p>
        </div>

        <div className="space-y-4">
          {sub1Items.map((item, idx) => {
            const itemTitle = item.title[responsibilityLevel];
            const itemFreq = item.frequency[responsibilityLevel];
            const itemMeta = item.meta[responsibilityLevel];

            return (
              <div
                key={item.id}
                className={`space-y-2 ${idx > 0 ? (isDark ? 'pt-4 border-t border-zinc-800/80' : 'pt-4 border-t border-zinc-100') : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                    Indicador {idx + 1}: {itemTitle}
                  </span>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 shrink-0">
                    Frecuencia: {itemFreq}
                  </span>
                </div>
                <div className="text-[10.5px] font-mono text-amber-500/90 flex items-center gap-1.5">
                  <Sparkles size={11} className="shrink-0" />
                  <span>{itemMeta}</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {item.text[responsibilityLevel][role]}
                </p>
                {renderScoreButtons(item.id, true)}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* SUB-BLOQUE 2: COMPETENCIAS CONDUCTUALES OPERATIVIZADAS (35%)                                */}
      {/* ========================================================================================= */}
      <div className={`p-5 rounded-2xl border transition-colors duration-200 shadow-sm space-y-4 ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="pb-3 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-400" />
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Sub-bloque 2: Competencias Conductuales Operativizadas
            </h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Frecuencia observable en rigor analítico, servicio al cliente interno 360°, automatización y ética patrimonial.
          </p>
        </div>

        <div className="space-y-4">
          {sub2Items.map((item, idx) => {
            const itemTitle = item.title[responsibilityLevel];

            return (
              <div
                key={item.id}
                className={`space-y-2 ${idx > 0 ? (isDark ? 'pt-4 border-t border-zinc-800/80' : 'pt-4 border-t border-zinc-100') : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                    Conducta {idx + 1}: {itemTitle}
                  </span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {item.text[responsibilityLevel][role]}
                </p>
                {renderScoreButtons(item.id, false)}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* SUB-BLOQUE 3: ALINEACIÓN ESTRATÉGICA, RESILIENCIA Y PLANES DE ACCIÓN (15%)                 */}
      {/* ========================================================================================= */}
      <div className={`p-5 rounded-2xl border transition-colors duration-200 shadow-sm space-y-4 ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="pb-3 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Sub-bloque 3: Alineación Estratégica, Resiliencia y Planes de Acción
            </h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Protección de liquidez, alerta temprana ante contingencias, causas estructurales y orientación a la rentabilidad.
          </p>
        </div>

        <div className="space-y-4">
          {sub3Items.map((item, idx) => {
            const itemTitle = item.title[responsibilityLevel];

            return (
              <div
                key={item.id}
                className={`space-y-2 ${idx > 0 ? (isDark ? 'pt-4 border-t border-zinc-800/80' : 'pt-4 border-t border-zinc-100') : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                    Estrategia {idx + 1}: {itemTitle}
                  </span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {item.text[responsibilityLevel][role]}
                </p>
                {renderScoreButtons(item.id, false)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

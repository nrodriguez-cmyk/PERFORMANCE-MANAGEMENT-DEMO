import React from 'react';
import { EvaluationData } from '../types';
import { Target, ShoppingBag, Award, CheckCircle2, TrendingUp } from 'lucide-react';
import { resolveResponsibilityLevel, ResponsibilityLevel } from '../utils/responsibilityResolver';

export type EvaluatorRoleType = 'self' | 'supervisor' | 'peer' | 'subordinate';

interface ComprasSection1FormProps {
  data: EvaluationData;
  onChange: (data: EvaluationData) => void;
  isSupervisor?: boolean;
  evaluatorRole?: 'self' | 'supervisor' | 'peer' | 'subordinate' | string;
  employeePosition?: string;
  theme?: 'dark' | 'light';
}

// Escala Oficial de Medición (1: Nunca a 5: Siempre)
const OFFICIAL_SCALE = [
  { score: 1, label: 'NUNCA' },
  { score: 2, label: 'RARA VEZ' },
  { score: 3, label: 'OCASIONALMENTE' },
  { score: 4, label: 'FRECUENTEMENTE' },
  { score: 5, label: 'SIEMPRE' },
];

export function ComprasSection1Form({
  data,
  onChange,
  evaluatorRole = 'self',
  employeePosition = '',
  theme = 'dark'
}: ComprasSection1FormProps) {
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
      id: 'cp_kpi_1',
      title: {
        alto: 'Garantía Macro de Días de Inventario Nacional',
        medio: 'Gestión de Días de Inventario por Categoría',
        bajo: 'Control de Días de Inventario y Rotación por SKU'
      },
      text: {
        alto: {
          self: 'Respondo por la construcción y mantenimiento del indicador macro de días de inventario a nivel nacional, protegiendo el flujo de caja y la salud financiera de la compañía.',
          supervisor: 'El colaborador responde por la construcción y mantenimiento del indicador macro de días de inventario a nivel nacional, protegiendo el flujo de caja y la salud financiera de la compañía.',
          peer: 'Mi compañero responde por la construcción y mantenimiento del indicador macro de días de inventario a nivel nacional, protegiendo el flujo de caja y la salud financiera de la compañía.',
          subordinate: 'Mi líder responde por la construcción y mantenimiento del indicador macro de días de inventario a nivel nacional, protegiendo el flujo de caja y la salud financiera de la compañía.'
        },
        medio: {
          self: 'Superviso y equilibro semanalmente la rotación de inventarios por líneas de producto, evitando acumulaciones de stock o desabastecimiento en la red.',
          supervisor: 'El colaborador supervisa y equilibra semanalmente la rotación de inventarios por líneas de producto, evitando acumulaciones de stock o desabastecimiento en la red.',
          peer: 'Mi compañero supervisa y equilibra semanalmente la rotación de inventarios por líneas de producto, evitando acumulaciones de stock o desabastecimiento en la red.',
          subordinate: 'Mi líder supervisa y equilibra semanalmente la rotación de inventarios por líneas de producto, evitando acumulaciones de stock o desabastecimiento en la red.'
        },
        bajo: {
          self: 'Analizo semanalmente la data de rotación de los SKUs bajo mi gestión, identificando desviaciones para mantener los días de inventario dentro del rango objetivo asignado.',
          supervisor: 'El colaborador analiza semanalmente la data de rotación de los SKUs bajo su gestión, identificando desviaciones para mantener los días de inventario dentro del rango objetivo asignado.',
          peer: 'Mi compañero analiza semanalmente la data de rotación de los SKUs bajo su gestión, identificando desviaciones para mantener los días de inventario dentro del rango objetivo asignado.',
          subordinate: 'El colaborador analiza semanalmente la data de rotación de los SKUs bajo su gestión, identificando desviaciones para mantener los días de inventario dentro del rango objetivo asignado.'
        }
      }
    },
    {
      id: 'cp_kpi_2',
      title: {
        alto: 'Abastecimiento Continuo y Crecimiento Nacional',
        medio: 'Garantía de Disponibilidad y Abastecimiento',
        bajo: 'Medición Coherente de Agotados y Disponibilidad'
      },
      text: {
        alto: {
          self: 'Garantizo la estrategia global de disponibilidad para respaldar la demanda actual y los planes de expansión de la empresa a escala nacional.',
          supervisor: 'El colaborador garantiza la estrategia global de disponibilidad para respaldar la demanda actual y los planes de expansión de la empresa a escala nacional.',
          peer: 'Mi compañero garantiza la estrategia global de disponibilidad para respaldar la demanda actual y los planes de expansión de la empresa a escala nacional.',
          subordinate: 'Mi líder garantiza la estrategia global de disponibilidad para respaldar la demanda actual y los planes de expansión de la empresa a escala nacional.'
        },
        medio: {
          self: 'Gestiono el indicador de disponibilidad continua a nivel nacional, coordinando acciones de contingencia con proveedores ante riesgos de agotados.',
          supervisor: 'El colaborador gestiona el indicador de disponibilidad continua a nivel nacional, coordinando acciones de contingencia con proveedores ante riesgos de agotados.',
          peer: 'Mi compañero gestiona el indicador de disponibilidad continua a nivel nacional, coordinando acciones de contingencia con proveedores ante riesgos de agotados.',
          subordinate: 'Mi líder gestiona el indicador de disponibilidad continua a nivel nacional, coordinando acciones de contingencia con proveedores ante riesgos de agotados.'
        },
        bajo: {
          self: 'Recopilo y valido datos precisos para medir la presencia continua de producto en tiendas, emitiendo alertas oportunas antes de que ocurra la quiebra de stock.',
          supervisor: 'El colaborador recopila y valida datos precisos para medir la presencia continua de producto en tiendas, emitiendo alertas oportunas antes de que ocurra la quiebra de stock.',
          peer: 'Mi compañero recopila y valida datos precisos para medir la presencia continua de producto en tiendas, emitiendo alertas oportunas antes de que ocurra la quiebra de stock.',
          subordinate: 'El colaborador recopila y valida datos precisos para medir la presencia continua de producto en tiendas, emitiendo alertas oportunas antes de que ocurra la quiebra de stock.'
        }
      }
    },
    {
      id: 'cp_kpi_3',
      title: {
        alto: 'Protección del Margen Comercial y Competitividad Global',
        medio: 'Negociación y Optimización del Margen Comercial',
        bajo: 'Análisis de Margen Comercial y Precios de Compra'
      },
      text: {
        alto: {
          self: 'Defino las políticas globales de precios de compra y estructuras de costo, resguardando la ganancia operacional de la empresa frente al mercado.',
          supervisor: 'El colaborador define las políticas globales de precios de compra y estructuras de costo, resguardando la ganancia operacional de la empresa frente al mercado.',
          peer: 'Mi compañero define las políticas globales de precios de compra y estructuras de costo, resguardando la ganancia operacional de la empresa frente al mercado.',
          subordinate: 'Mi líder define las políticas globales de precios de compra y estructuras de costo, resguardando la ganancia operacional de la empresa frente al mercado.'
        },
        medio: {
          self: 'Analizo activamente las condiciones de compra frente al precio de venta en mercado, asegurando una rentabilidad sólida sin perder la competitividad de la marca.',
          supervisor: 'El colaborador analiza activamente las condiciones de compra frente al precio de venta en mercado, asegurando una rentabilidad sólida sin perder la competitividad de la marca.',
          peer: 'Mi compañero analiza activamente las condiciones de compra frente al precio de venta en mercado, asegurando una rentabilidad sólida sin perder la competitividad de la marca.',
          subordinate: 'Mi líder analiza activamente las condiciones de compra frente al precio de venta en mercado, asegurando una rentabilidad sólida sin perder la competitividad de la marca.'
        },
        bajo: {
          self: 'Monitoreo y comparo los costos de compra negociados frente a las variaciones del mercado, asegurando el cumplimiento del margen comercial definido por la categoría.',
          supervisor: 'El colaborador monitorea y compara los costos de compra negociados frente a las variaciones del mercado, asegurando el cumplimiento del margen comercial definido por la categoría.',
          peer: 'Mi compañero monitorea y compara los costos de compra negociados frente a las variaciones del mercado, asegurando el cumplimiento del margen comercial definido por la categoría.',
          subordinate: 'El colaborador monitorea y compara los costos de compra negociados frente a las variaciones del mercado, asegurando el cumplimiento del margen comercial definido por la categoría.'
        }
      }
    },
    {
      id: 'cp_kpi_4',
      title: {
        alto: 'Excelencia Operativa en Compras y Posicionamiento de Marca',
        medio: 'Excelencia Operativa y Evaluación de Proveedores',
        bajo: 'Seguimiento a la Colocación de SKUs Clave de Venta'
      },
      text: {
        alto: {
          self: 'Dirijo la optimización de los procesos de compra y la selección estratégica del portafolio que impulsa el posicionamiento competitivo de la marca.',
          supervisor: 'El colaborador dirige la optimización de los procesos de compra y la selección estratégica del portafolio que impulsa el posicionamiento competitivo de la marca.',
          peer: 'Mi compañero dirige la optimización de los procesos de compra y la selección estratégica del portafolio que impulsa el posicionamiento competitivo de la marca.',
          subordinate: 'Mi líder dirige la optimización de los procesos de compra y la selección estratégica del portafolio que impulsa el posicionamiento competitivo de la marca.'
        },
        medio: {
          self: 'Evalúo periódicamente la eficiencia operativa de los proveedores asignados, optimizando los tiempos de entrega y agilizando los flujos de compra del área.',
          supervisor: 'El colaborador evalúa periódicamente la eficiencia operativa de los proveedores asignados, optimizando los tiempos de entrega y agilizando los flujos de compra del área.',
          peer: 'Mi compañero evalúa periódicamente la eficiencia operativa de los proveedores asignados, optimizando los tiempos de entrega y agilizando los flujos de compra del área.',
          subordinate: 'Mi líder evalúa periódicamente la eficiencia operativa de los proveedores asignados, optimizando los tiempos de entrega y agilizando los flujos de compra del área.'
        },
        bajo: {
          self: 'Aseguro la emisión y seguimiento riguroso de las órdenes de compra para garantizar el flujo de los SKUs que impulsan directamente la venta del negocio.',
          supervisor: 'El colaborador asegura la emisión y seguimiento riguroso de las órdenes de compra para garantizar el flujo de los SKUs que impulsan directamente la venta del negocio.',
          peer: 'Mi compañero asegura la emisión y seguimiento riguroso de las órdenes de compra para garantizar el flujo de los SKUs que impulsan directamente la venta del negocio.',
          subordinate: 'El colaborador asegura la emisión y seguimiento riguroso de las órdenes de compra para garantizar el flujo de los SKUs que impulsan directamente la venta del negocio.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 2: COMPETENCIAS CONDUCTUALES OPERATIVIZADAS (35%)
  // Modulados por Nivel de Gestión (Alto, Medio, Bajo) y Rol de Evaluador
  // =========================================================================================
  const sub2Items = [
    {
      id: 'cp_cond_1',
      title: {
        alto: 'Visión de Negocio y Orden de Portafolio',
        medio: 'Estructuración de Portafolio (SKUs Estratégicos)',
        bajo: 'Conocimiento Técnico del Portafolio'
      },
      text: {
        alto: {
          self: 'Establezco los lineamientos para estructurar un portafolio de productos limpio, coherente y alineado a los SKUs de alto rendimiento para la compañía.',
          supervisor: 'El colaborador establece los lineamientos para estructurar un portafolio de productos limpio, coherente y alineado a los SKUs de alto rendimiento para la compañía.',
          peer: 'Mi compañero establece los lineamientos para estructurar un portafolio de productos limpio, coherente y alineado a los SKUs de alto rendimiento para la compañía.',
          subordinate: 'Mi líder establece los lineamientos para estructurar un portafolio de productos limpio, coherente y alineado a los SKUs de alto rendimiento para la compañía.'
        },
        medio: {
          self: 'Analizo y depuro continuamente el catálogo de productos, garantizando la permanencia de los SKUs que aportan valor real al negocio.',
          supervisor: 'El colaborador analiza y depura continuamente el catálogo de productos, garantizando la permanencia de los SKUs que aportan valor real al negocio.',
          peer: 'Mi compañero analiza y depura continuamente el catálogo de productos, garantizando la permanencia de los SKUs que aportan valor real al negocio.',
          subordinate: 'Mi líder analiza y depura continuamente el catálogo de productos, garantizando la permanencia de los SKUs que aportan valor real al negocio.'
        },
        bajo: {
          self: 'Demuestro dominio detallado de las especificaciones, rendimiento y comportamiento de ventas de los productos asignados a mi línea de compras.',
          supervisor: 'El colaborador demuestra dominio detallado de las especificaciones, rendimiento y comportamiento de ventas de los productos asignados a su línea de compras.',
          peer: 'Mi compañero demuestra dominio detallado de las especificaciones, rendimiento y comportamiento de ventas de los productos asignados a su línea de compras.',
          subordinate: 'El colaborador demuestra dominio detallado de las especificaciones, rendimiento y comportamiento de ventas de los productos asignados a su línea de compras.'
        }
      }
    },
    {
      id: 'cp_cond_2',
      title: {
        alto: 'Transformación y Herramientas de Medición',
        medio: 'Liderazgo, Carácter y Manejo del Equipo',
        bajo: 'Proactividad y Desempeño Sobresaliente ("Ir más allá")'
      },
      text: {
        alto: {
          self: 'Impulso la adopción de herramientas tecnológicas avanzadas que permitan medir con total precisión los agotados, la demanda y los KPIs de compras.',
          supervisor: 'El colaborador impulsa la adopción de herramientas tecnológicas avanzadas que permitan medir con total precisión los agotados, la demanda y los KPIs de compras.',
          peer: 'Mi compañero impulsa la adopción de herramientas tecnológicas avanzadas que permitan medir con total precisión los agotados, la demanda y los KPIs de compras.',
          subordinate: 'Mi líder impulsa la adopción de herramientas tecnológicas avanzadas que permitan medir con total precisión los agotados, la demanda y los KPIs de compras.'
        },
        medio: {
          self: 'Dirijo las actividades de mi equipo con carácter resolutivo, promoviendo una actitud positiva, disposición y un ambiente enfocado en el alto desempeño.',
          supervisor: 'El colaborador dirige las actividades de su equipo con carácter resolutivo, promoviendo una actitud positiva, disposición y un ambiente enfocado en el alto desempeño.',
          peer: 'Mi compañero dirige las actividades de su equipo con carácter resolutivo, promoviendo una actitud positiva, disposición y un ambiente enfocado en el alto desempeño.',
          subordinate: 'Mi líder dirige las actividades de su equipo con carácter resolutivo, promoviendo una actitud positiva, disposición y un ambiente enfocado en el alto desempeño.'
        },
        bajo: {
          self: 'Presento análisis de datos, comparativos o soluciones de compra adicionales a las solicitadas, demostrando entrega, talento y alto compromiso.',
          supervisor: 'El colaborador presenta análisis de datos, comparativos o soluciones de compra adicionales a las solicitadas, demostrando entrega, talento y alto compromiso.',
          peer: 'Mi compañero presenta análisis de datos, comparativos o soluciones de compra adicionales a las solicitadas, demostrando entrega, talento y alto compromiso.',
          subordinate: 'El colaborador presenta análisis de datos, comparativos o soluciones de compra adicionales a las solicitadas, demostrando entrega, talento y alto compromiso.'
        }
      }
    },
    {
      id: 'cp_cond_3',
      title: {
        alto: 'Cultura de Compromiso, Estado de Ánimo y Talento',
        medio: 'Capacitación y Desarrollo del Talento',
        bajo: 'Calidad de Datos y Manejo de Herramientas'
      },
      text: {
        alto: {
          self: 'Fomento una cultura organizacional en la dirección caracterizada por el compromiso, la agilidad, la excelencia conductual y el desarrollo del talento.',
          supervisor: 'El colaborador fomenta una cultura organizacional en la dirección caracterizada por el compromiso, la agilidad, la excelencia conductual y el desarrollo del talento.',
          peer: 'Mi compañero fomenta una cultura organizacional en la dirección caracterizada por el compromiso, la agilidad, la excelencia conductual y el desarrollo del talento.',
          subordinate: 'Mi líder fomenta una cultura organizacional en la dirección caracterizada por el compromiso, la agilidad, la excelencia conductual y el desarrollo del talento.'
        },
        medio: {
          self: 'Mantengo un programa continuo de retroalimentación y capacitación para asegurar que el equipo conozca profundamente el portafolio de productos.',
          supervisor: 'El colaborador mantiene un programa continuo de retroalimentación y capacitación para asegurar que el equipo conozca profundamente el portafolio de productos.',
          peer: 'Mi compañero mantiene un programa continuo de retroalimentación y capacitación para asegurar que el equipo conozca profundamente el portafolio de productos.',
          subordinate: 'Mi líder mantiene un programa continuo de retroalimentación y capacitación para asegurar que el equipo conozca profundamente el portafolio de productos.'
        },
        bajo: {
          self: 'Utilizo con precisión las herramientas del área para garantizar que la data de agotados, compras y demanda sea totalmente confiable y coherente.',
          supervisor: 'El colaborador utiliza con precisión las herramientas del área para garantizar que la data de agotados, compras y demanda sea totalmente confiable y coherente.',
          peer: 'Mi compañero utiliza con precisión las herramientas del área para garantizar que la data de agotados, compras y demanda sea totalmente confiable y coherente.',
          subordinate: 'El colaborador utiliza con precisión las herramientas del área para garantizar que la data de agotados, compras y demanda sea totalmente confiable y coherente.'
        }
      }
    },
    {
      id: 'cp_cond_4',
      title: {
        alto: 'Relaciones Estratégicas y Negociaciones Macro',
        medio: 'Monitoreo de Proveedores y Agilidad',
        bajo: 'Disciplina, Carácter y Cumplimiento de Compromisos'
      },
      text: {
        alto: {
          self: 'Construyo alianzas clave con grandes proveedores del mercado, asegurando condiciones comerciales preferenciales y estabilidad en el suministro.',
          supervisor: 'El colaborador construye alianzas clave con grandes proveedores del mercado, asegurando condiciones comerciales preferenciales y estabilidad en el suministro.',
          peer: 'Mi compañero construye alianzas clave con grandes proveedores del mercado, asegurando condiciones comerciales preferenciales y estabilidad en el suministro.',
          subordinate: 'Mi líder construye alianzas clave con grandes proveedores del mercado, asegurando condiciones comerciales preferenciales y estabilidad en el suministro.'
        },
        medio: {
          self: 'Gestiono con firmeza y diplomacia las negociaciones con proveedores, asegurando el cumplimiento de los contratos y entregas oportunas.',
          supervisor: 'El colaborador gestiona con firmeza y diplomacia las negociaciones con proveedores, asegurando el cumplimiento de los contratos y entregas oportunas.',
          peer: 'Mi compañero gestiona con firmeza y diplomacia las negociaciones con proveedores, asegurando el cumplimiento de los contratos y entregas oportunas.',
          subordinate: 'Mi líder gestiona con firmeza y diplomacia las negociaciones con proveedores, asegurando el cumplimiento de los contratos y entregas oportunas.'
        },
        bajo: {
          self: 'Cumplo rigurosamente con los horarios, jornadas y tiempos de entrega de reportes del área, demostrando responsabilidad en mis actividades.',
          supervisor: 'El colaborador cumple rigurosamente con los horarios, jornadas y tiempos de entrega de reportes del área, demostrando responsabilidad en sus actividades.',
          peer: 'Mi compañero cumple rigurosamente con los horarios, jornadas y tiempos de entrega de reportes del área, demostrando responsabilidad en sus actividades.',
          subordinate: 'El colaborador cumple rigurosamente con los horarios, jornadas y tiempos de entrega de reportes del área, demostrando responsabilidad en sus actividades.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 3: ALINEACIÓN ESTRATÉGICA Y MANEJO DE DESVIACIONES (15%)
  // Modulados por Nivel de Gestión (Alto, Medio, Bajo) y Rol de Evaluador
  // =========================================================================================
  const sub3Items = [
    {
      id: 'cp_strat_1',
      title: {
        alto: 'Dirección del Comité de Compras',
        medio: 'Liderazgo en el Comité de Compras (Martes)',
        bajo: 'Preparación para el Comité de Compras Semanal'
      },
      text: {
        alto: {
          self: 'Conduzco las dinámicas del Comité de Compras semanal, tomando decisiones estratégicas ante contingencias de mercado o fallas estructurales.',
          supervisor: 'El colaborador conduce las dinámicas del Comité de Compras semanal, tomando decisiones estratégicas ante contingencias de mercado o fallas estructurales.',
          peer: 'Mi compañero conduce las dinámicas del Comité de Compras semanal, tomando decisiones estratégicas ante contingencias de mercado o fallas estructurales.',
          subordinate: 'Mi líder conduce las dinámicas del Comité de Compras semanal, tomando decisiones estratégicas ante contingencias de mercado o fallas estructurales.'
        },
        medio: {
          self: 'Lidero la presentación de resultados semanales en el comité, promoviendo el análisis grupal objetivo ("¿por qué pasó?") sobre las desviaciones encontradas.',
          supervisor: 'El colaborador lidera la presentación de resultados semanales en el comité, promoviendo el análisis grupal objetivo ("¿por qué pasó?") sobre las desviaciones encontradas.',
          peer: 'Mi compañero lidera la presentación de resultados semanales en el comité, promoviendo el análisis grupal objetivo ("¿por qué pasó?") sobre las desviaciones encontradas.',
          subordinate: 'Mi líder lidera la presentación de resultados semanales en el comité, promoviendo el análisis grupal objetivo ("¿por qué pasó?") sobre las desviaciones encontradas.'
        },
        bajo: {
          self: 'Preparo con exactitud la información y métricas de mi gestión para intervenir activamente en el Comité de Compras de los martes.',
          supervisor: 'El colaborador prepara con exactitud la información y métricas de su gestión para intervenir activamente en el Comité de Compras de los martes.',
          peer: 'Mi compañero prepara con exactitud la información y métricas de su gestión para intervenir activamente en el Comité de Compras de los martes.',
          subordinate: 'El colaborador prepara con exactitud la información y métricas de su gestión para intervenir activamente en el Comité de Compras de los martes.'
        }
      }
    },
    {
      id: 'cp_strat_2',
      title: {
        alto: 'Resiliencia y Reestructuración de Planes',
        medio: 'Planes de Acción e Incentivo a la Solución',
        bajo: 'Actitud "Manos a la Obra" ante Desviaciones'
      },
      text: {
        alto: {
          self: 'Ante desviaciones macro en los indicadores de venta o inventario, reoriento de forma inmediata las estrategias de compra para proteger la rentabilidad de la empresa.',
          supervisor: 'El colaborador, ante desviaciones macro en los indicadores de venta o inventario, reorienta de forma inmediata las estrategias de compra para proteger la rentabilidad de la empresa.',
          peer: 'Mi compañero, ante desviaciones macro en los indicadores de venta o inventario, reorienta de forma inmediata las estrategias de compra para proteger la rentabilidad de la empresa.',
          subordinate: 'Mi líder, ante desviaciones macro en los indicadores de venta o inventario, reorienta de forma inmediata las estrategias de compra para proteger la rentabilidad de la empresa.'
        },
        medio: {
          self: 'Diseño e implemento planes de acción inmediatos para corregir faltas en indicadores de stock o margen, haciendo seguimiento semanal a su cumplimiento.',
          supervisor: 'El colaborador diseña e implementa planes de acción inmediatos para corregir faltas en indicadores de stock o margen, haciendo seguimiento semanal a su cumplimiento.',
          peer: 'Mi compañero diseña e implementa planes de acción inmediatos para corregir faltas en indicadores de stock o margen, haciendo seguimiento semanal a su cumplimiento.',
          subordinate: 'Mi líder diseña e implementa planes de acción inmediatos para corregir faltas en indicadores de stock o margen, haciendo seguimiento semanal a su cumplimiento.'
        },
        bajo: {
          self: 'Ante un indicador de stock o margen fuera de meta, asumo una actitud resolutiva, identifico las razones del incumplimiento y ejecuto acciones inmediatas para corregir la falta.',
          supervisor: 'El colaborador, ante un indicador de stock o margen fuera de meta, asume una actitud resolutiva, identifica las razones del incumplimiento y ejecuta acciones inmediatas para corregir la falta.',
          peer: 'Mi compañero, ante un indicador de stock o margen fuera de meta, asume una actitud resolutiva, identifica las razones del incumplimiento y ejecuta acciones inmediatas para corregir la falta.',
          subordinate: 'El colaborador, ante un indicador de stock o margen fuera de meta, asume una actitud resolutiva, identifica las razones del incumplimiento y ejecuta acciones inmediatas para corregir la falta.'
        }
      }
    },
    {
      id: 'cp_strat_3',
      title: {
        alto: 'Contribución a la Estrategia General de la Compañía',
        medio: 'Alineación Comercial e Interdepartamental',
        bajo: 'Comprensión del Rol en el Negocio'
      },
      text: {
        alto: {
          self: 'Aseguro que cada decisión de compra y portafolio mueva directamente los indicadores globales de venta y rentabilidad del plan estratégico.',
          supervisor: 'El colaborador asegura que cada decisión de compra y portafolio mueva directamente los indicadores globales de venta y rentabilidad del plan estratégico.',
          peer: 'Mi compañero asegura que cada decisión de compra y portafolio mueva directamente los indicadores globales de venta y rentabilidad del plan estratégico.',
          subordinate: 'Mi líder asegura que cada decisión de compra y portafolio mueva directamente los indicadores globales de venta y rentabilidad del plan estratégico.'
        },
        medio: {
          self: 'Coordino de manera fluida con las áreas de Operaciones, Ventas y Almacén para asegurar que el portafolio comprado responda a la demanda real.',
          supervisor: 'El colaborador coordina de manera fluida con las áreas de Operaciones, Ventas y Almacén para asegurar que el portafolio comprado responda a la demanda real.',
          peer: 'Mi compañero coordina de manera fluida con las áreas de Operaciones, Ventas y Almacén para asegurar que el portafolio comprado responda a la demanda real.',
          subordinate: 'Mi líder coordina de manera fluida con las áreas de Operaciones, Ventas y Almacén para asegurar que el portafolio comprado responda a la demanda real.'
        },
        bajo: {
          self: 'Entiendo con claridad cómo una compra oportuna y bien analizada impacta la rentabilidad y la estrategia comercial global de la empresa.',
          supervisor: 'El colaborador entiende con claridad cómo una compra oportuna y bien analizada impacta la rentabilidad y la estrategia comercial global de la empresa.',
          peer: 'Mi compañero entiende con claridad cómo una compra oportuna y bien analizada impacta la rentabilidad y la estrategia comercial global de la empresa.',
          subordinate: 'El colaborador entiende con claridad cómo una compra oportuna y bien analizada impacta la rentabilidad y la estrategia comercial global de la empresa.'
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
          <ShoppingBag size={20} className={isDark ? 'text-[#F1B400]' : 'text-amber-800'} />
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}>
              Dirección de Compras
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Evaluación de metas de abastecimiento, proveedores y procesos en el período.
            </p>
          </div>
        </div>
      </div>

      {/* Guía Oficial de Escala (1 al 5) */}
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
              <div className="font-mono font-black text-sm text-[#F1B400]">{item.score}</div>
              <div className={`text-[10px] font-bold uppercase truncate ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* SUB-BLOQUE 1: KPIs TÉCNICOS Y OBJETIVOS MEDIBLES (50%)                                    */}
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
            Medición de metas de rotación, disponibilidad, margen comercial y abastecimiento de portafolio.
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
      {/* SUB-BLOQUE 2: COMPETENCIAS CONDUCTUALES OPERATIVIZADAS (35%)                              */}
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
      {/* SUB-BLOQUE 3: ALINEACIÓN ESTRATÉGICA Y MANEJO DE DESVIACIONES (15%)                       */}
      {/* ========================================================================================= */}
      <div className={`p-5 rounded-2xl border transition-colors duration-200 shadow-sm ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="pb-3 mb-4 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-[#F1B400]" />
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Sub-bloque 3: Alineación Estratégica, Resiliencia y Manejo de Desviaciones
            </h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Evaluación de participación en Comité de Compras, resiliencia y planes de acción ante desviaciones.
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

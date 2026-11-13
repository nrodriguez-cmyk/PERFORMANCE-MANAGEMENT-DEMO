import React from 'react';
import { EvaluationData } from '../types';
import { Target, Cpu, Award, CheckCircle2, TrendingUp, ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { resolveResponsibilityLevel, ResponsibilityLevel } from '../utils/responsibilityResolver';

export type EvaluatorRoleType = 'self' | 'supervisor' | 'peer' | 'subordinate';

interface TecnologiaSection1FormProps {
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

export function TecnologiaSection1Form({
  data,
  onChange,
  evaluatorRole = 'self',
  employeePosition = '',
  theme = 'dark'
}: TecnologiaSection1FormProps) {
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
      id: 'ti_kpi_1',
      frequency: {
        alto: 'Semanal / Mensual',
        medio: 'Semanal',
        bajo: 'Semanal'
      },
      title: {
        alto: 'Disponibilidad y Estabilidad de Plataformas (≥ 95%)',
        medio: 'Control de SLA y Efectividad de Mesa de Ayuda',
        bajo: 'Atención en Mesa de Ayuda y Cumplimiento de SLA'
      },
      meta: {
        alto: 'Meta: Disponibilidad Core ≥ 95% a nivel nacional',
        medio: 'Meta: Cumplimiento de SLA según matriz de TI',
        bajo: 'Meta: Resolución de tickets dentro de SLA asignado'
      },
      text: {
        alto: {
          self: 'Garantizo que la efectividad y disponibilidad de las plataformas tecnológicas Core en uso se mantengan a un nivel del 95% o superior a nivel nacional.',
          supervisor: 'El colaborador garantiza que la efectividad y disponibilidad de las plataformas tecnológicas Core en uso se mantengan a un nivel del 95% o superior a nivel nacional.',
          peer: 'Mi compañero garantiza que la efectividad y disponibilidad de las plataformas tecnológicas Core en uso se mantengan a un nivel del 95% o superior a nivel nacional.',
          subordinate: 'Mi líder garantiza que la efectividad y disponibilidad de las plataformas tecnológicas Core en uso se mantengan a un nivel del 95% o superior a nivel nacional.'
        },
        medio: {
          self: 'Superviso y garantizo que el equipo de soporte cumpla los tiempos de respuesta y resolución establecidos en la matriz de SLA de TI.',
          supervisor: 'El colaborador supervisa y garantiza que el equipo de soporte cumpla los tiempos de respuesta y resolución establecidos en la matriz de SLA de TI.',
          peer: 'Mi compañero supervisa y garantiza que el equipo de soporte cumpla los tiempos de respuesta y resolución establecidos en la matriz de SLA de TI.',
          subordinate: 'Mi líder supervisa y garantiza que el equipo de soporte cumpla los tiempos de respuesta y resolución establecidos en la matriz de SLA de TI.'
        },
        bajo: {
          self: 'Atiendo y resuelvo las solicitudes e incidentes asignados dentro de los tiempos límite establecidos en la matriz de SLA de TI.',
          supervisor: 'El colaborador atiende y resuelve las solicitudes e incidentes asignados dentro de los tiempos límite establecidos en la matriz de SLA de TI.',
          peer: 'Mi compañero atiende y resuelve las solicitudes e incidentes asignados dentro de los tiempos límite establecidos en la matriz de SLA de TI.',
          subordinate: 'El colaborador atiende y resuelve las solicitudes e incidentes asignados dentro de los tiempos límite establecidos en la matriz de SLA de TI.'
        }
      }
    },
    {
      id: 'ti_kpi_2',
      frequency: {
        alto: 'Mensual',
        medio: 'Semanal',
        bajo: 'Semanal'
      },
      title: {
        alto: 'Control Presupuestario (Variación OPEX de TI)',
        medio: 'Tasa de Éxito en Cambios Tecnológicos (Core)',
        bajo: 'Ejecución Segura de Cambios Tecnológicos'
      },
      meta: {
        alto: 'Meta: OPEX dentro de márgenes de rentabilidad retail',
        medio: 'Meta: 100% de puestas en producción con impacto cero',
        bajo: 'Meta: 0 caídas no programadas por despliegues'
      },
      text: {
        alto: {
          self: 'Aseguro de forma continua que el gasto operativo (OPEX) de la Dirección de TI se mantenga dentro de los márgenes de rentabilidad del modelo retail.',
          supervisor: 'El colaborador asegura de forma continua que el gasto operativo (OPEX) de la Dirección de TI se mantenga dentro de los márgenes de rentabilidad del modelo retail.',
          peer: 'Mi compañero asegura de forma continua que el gasto operativo (OPEX) de la Dirección de TI se mantenga dentro de los márgenes de rentabilidad del modelo retail.',
          subordinate: 'Mi líder asegura de forma continua que el gasto operativo (OPEX) de la Dirección de TI se mantenga dentro de los márgenes de rentabilidad del modelo retail.'
        },
        medio: {
          self: 'Garantizo que las implementaciones y puestas en producción de sistemas Core (ERP, integraciones) se ejecuten con una tasa de éxito e impacto cero en las operaciones.',
          supervisor: 'El colaborador garantiza que las implementaciones y puestas en producción de sistemas Core (ERP, integraciones) se ejecuten con una tasa de éxito e impacto cero en las operaciones.',
          peer: 'Mi compañero garantiza que las implementaciones y puestas en producción de sistemas Core (ERP, integraciones) se ejecuten con una tasa de éxito e impacto cero en las operaciones.',
          subordinate: 'Mi líder garantiza que las implementaciones y puestas en producción de sistemas Core (ERP, integraciones) se ejecuten con una tasa de éxito e impacto cero en las operaciones.'
        },
        bajo: {
          self: 'Aplico minuciosamente los protocolos de despliegue y pruebas al realizar cambios en sistemas o configuraciones para evitar caídas no programadas.',
          supervisor: 'El colaborador aplica minuciosamente los protocolos de despliegue y pruebas al realizar cambios en sistemas o configuraciones para evitar caídas no programadas.',
          peer: 'Mi compañero aplica minuciosamente los protocolos de despliegue y pruebas al realizar cambios en sistemas o configuraciones para evitar caídas no programadas.',
          subordinate: 'El colaborador aplica minuciosamente los protocolos de despliegue y pruebas al realizar cambios en sistemas o configuraciones para evitar caídas no programadas.'
        }
      }
    },
    {
      id: 'ti_kpi_3',
      frequency: {
        alto: 'Mensual / Trimestral',
        medio: 'Mensual',
        bajo: 'Diario'
      },
      title: {
        alto: 'Estrategia de Resiliencia Operativa (RPO/RTO)',
        medio: 'Validación de Resiliencia Operativa (RPO/RTO)',
        bajo: 'Respaldo y Cumplimiento de RPO/RTO'
      },
      meta: {
        alto: 'Meta: Ecosistema tecnológico 100% resiliente a desastres',
        medio: 'Meta: Pruebas periódicas de recuperación exitosas',
        bajo: 'Meta: 100% de rutinas de respaldo diarias ejecutadas'
      },
      text: {
        alto: {
          self: 'Respondo por la arquitectura global de contingencia y continuidad de negocio, garantizando la recuperación oportuna del ecosistema tecnológico ante desastres.',
          supervisor: 'El colaborador responde por la arquitectura global de contingencia y continuidad de negocio, garantizando la recuperación oportuna del ecosistema tecnológico ante desastres.',
          peer: 'Mi compañero responde por la arquitectura global de contingencia y continuidad de negocio, garantizando la recuperación oportuna del ecosistema tecnológico ante desastres.',
          subordinate: 'Mi líder responde por la arquitectura global de contingencia y continuidad de negocio, garantizando la recuperación oportuna del ecosistema tecnológico ante desastres.'
        },
        medio: {
          self: 'Controlo y pruebo periódicamente las políticas de respaldo y tiempo de recuperación de servicios, asegurando el retorno a la normalidad tras una contingencia.',
          supervisor: 'El colaborador controla y prueba periódicamente las políticas de respaldo y tiempo de recuperación de servicios, asegurando el retorno a la normalidad tras una contingencia.',
          peer: 'Mi compañero controla y prueba periódicamente las políticas de respaldo y tiempo de recuperación de servicios, asegurando el retorno a la normalidad tras una contingencia.',
          subordinate: 'Mi líder controla y prueba periódicamente las políticas de respaldo y tiempo de recuperación de servicios, asegurando el retorno a la normalidad tras una contingencia.'
        },
        bajo: {
          self: 'Ejecuto con rigor operativo las rutinas diarias de respaldo de datos y procedimientos de recuperación para garantizar la continuidad del servicio ante incidentes.',
          supervisor: 'El colaborador ejecuta con rigor operativo las rutinas diarias de respaldo de datos y procedimientos de recuperación para garantizar la continuidad del servicio ante incidentes.',
          peer: 'Mi compañero ejecuta con rigor operativo las rutinas diarias de respaldo de datos y procedimientos de recuperación para garantizar la continuidad del servicio ante incidentes.',
          subordinate: 'El colaborador ejecuta con rigor operativo las rutinas diarias de respaldo de datos y procedimientos de recuperación para garantizar la continuidad del servicio ante incidentes.'
        }
      }
    },
    {
      id: 'ti_kpi_4',
      frequency: {
        alto: 'Mensual',
        medio: 'Semanal',
        bajo: 'Semanal'
      },
      title: {
        alto: 'Salud y Entrega del Portafolio Estratégico de TI',
        medio: 'Salud del Portafolio y Avance de Proyectos',
        bajo: 'Cumplimiento de Tareas de Proyectos de TI'
      },
      meta: {
        alto: 'Meta: Hitos de expansión y ERP a tiempo sin demoras',
        medio: 'Meta: Cronogramas de proyectos sin desviaciones',
        bajo: 'Meta: Actividades técnicas entregadas en plazo'
      },
      text: {
        alto: {
          self: 'Garantizo la entrega a tiempo de los requerimientos de desarrollo e infraestructura para el plan de expansión de la empresa (ERP, integraciones, aperturas de tiendas).',
          supervisor: 'El colaborador garantiza la entrega a tiempo de los requerimientos de desarrollo e infraestructura para el plan de expansión de la empresa (ERP, integraciones, aperturas de tiendas).',
          peer: 'Mi compañero garantiza la entrega a tiempo de los requerimientos de desarrollo e infraestructura para el plan de expansión de la empresa (ERP, integraciones, aperturas de tiendas).',
          subordinate: 'Mi líder garantiza la entrega a tiempo de los requerimientos de desarrollo e infraestructura para el plan de expansión de la empresa (ERP, integraciones, aperturas de tiendas).'
        },
        medio: {
          self: 'Monitoreo la ejecución del cronograma de proyectos de TI asignados (integraciones, aperturas, sistemas), asegurando hitos a tiempo y sin desviaciones.',
          supervisor: 'El colaborador monitorea la ejecución del cronograma de proyectos de TI asignados (integraciones, aperturas, sistemas), asegurando hitos a tiempo y sin desviaciones.',
          peer: 'Mi compañero monitorea la ejecución del cronograma de proyectos de TI asignados (integraciones, aperturas, sistemas), asegurando hitos a tiempo y sin desviaciones.',
          subordinate: 'Mi líder monitorea la ejecución del cronograma de proyectos de TI asignados (integraciones, aperturas, sistemas), asegurando hitos a tiempo y sin desviaciones.'
        },
        bajo: {
          self: 'Entrego las actividades técnicas asignadas para proyectos estratégicos (desarrollos, integraciones o aperturas) dentro de los plazos estandarizados.',
          supervisor: 'El colaborador entrega las actividades técnicas asignadas para proyectos estratégicos (desarrollos, integraciones o aperturas) dentro de los plazos estandarizados.',
          peer: 'Mi compañero entrega las actividades técnicas asignadas para proyectos estratégicos (desarrollos, integraciones o aperturas) dentro de los plazos estandarizados.',
          subordinate: 'El colaborador entrega las actividades técnicas asignadas para proyectos estratégicos (desarrollos, integraciones o aperturas) dentro de los plazos estandarizados.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 2: COMPETENCIAS CONDUCTUALES OPERATIVIZADAS (35%)
  // Modulados por Nivel de Gestión (Alto, Medio, Bajo) y Rol de Evaluador (360°/180°)
  // =========================================================================================
  const sub2Items = [
    {
      id: 'ti_cond_1',
      title: {
        alto: 'Plataforma Tecnológica como Habilitador del Negocio',
        medio: 'Evaluación del Nivel de Servicio y CSAT de TI',
        bajo: 'Aseguramiento de la Satisfacción del Usuario'
      },
      text: {
        alto: {
          self: 'Modelo y exijo una visión de TI orientada a construir "los rieles del tren" que permitan el crecimiento y escalabilidad de la compañía.',
          supervisor: 'El colaborador modela y exige una visión de TI orientada a construir "los rieles del tren" que permitan el crecimiento y escalabilidad de la compañía.',
          peer: 'Mi compañero modela y exige una visión de TI orientada a construir "los rieles del tren" que permitan el crecimiento y escalabilidad de la compañía.',
          subordinate: 'Mi líder modela y exige una visión de TI orientada a construir "los rieles del tren" que permitan el crecimiento y escalabilidad de la compañía.'
        },
        medio: {
          self: 'Monitoreo de forma sistemática los niveles de satisfacción de los usuarios internos, corrigiendo desviaciones de atención en el equipo de soporte.',
          supervisor: 'El colaborador monitorea de forma sistemática los niveles de satisfacción de los usuarios internos, corrigiendo desviaciones de atención en el equipo de soporte.',
          peer: 'Mi compañero monitorea de forma sistemática los niveles de satisfacción de los usuarios internos, corrigiendo desviaciones de atención en el equipo de soporte.',
          subordinate: 'Mi líder monitorea de forma sistemática los niveles de satisfacción de los usuarios internos, corrigiendo desviaciones de atención en el equipo de soporte.'
        },
        bajo: {
          self: 'Consulto activamente al usuario interno tras cerrar una solicitud si la atención brindada fue óptima y resolvió plenamente su necesidad.',
          supervisor: 'El colaborador consulta activamente al usuario interno tras cerrar una solicitud si la atención brindada fue óptima y resolvió plenamente su necesidad.',
          peer: 'Mi compañero consulta activamente al usuario interno tras cerrar una solicitud si la atención brindada fue óptima y resolvió plenamente su necesidad.',
          subordinate: 'El colaborador consulta activamente al usuario interno tras cerrar una solicitud si la atención brindada fue óptima y resolvió plenamente su necesidad.'
        }
      }
    },
    {
      id: 'ti_cond_2',
      title: {
        alto: 'Cultura de Servicio Orientada al Usuario Interno',
        medio: 'Control Presupuestario Táctico (Variación OPEX)',
        bajo: 'Calidad y Rigor Técnico'
      },
      text: {
        alto: {
          self: 'Fomento institucionalmente una cultura donde la atención al usuario, el cumplimiento de SLA y la satisfacción cliente-servidor sean prioridades del área.',
          supervisor: 'El colaborador fomenta institucionalmente una cultura donde la atención al usuario, el cumplimiento de SLA y la satisfacción cliente-servidor sean prioridades del área.',
          peer: 'Mi compañero fomenta institucionalmente una cultura donde la atención al usuario, el cumplimiento de SLA y la satisfacción cliente-servidor sean prioridades del área.',
          subordinate: 'Mi líder fomenta institucionalmente una cultura donde la atención al usuario, el cumplimiento de SLA y la satisfacción cliente-servidor sean prioridades del área.'
        },
        medio: {
          self: 'Superviso el consumo del gasto operativo de TI asignado a mi área, asegurando que se mantenga dentro de los márgenes de rentabilidad del negocio retail.',
          supervisor: 'El colaborador supervisa el consumo del gasto operativo de TI asignado a su área, asegurando que se mantenga dentro de los márgenes de rentabilidad del negocio retail.',
          peer: 'Mi compañero supervisa el consumo del gasto operativo de TI asignado a su área, asegurando que se mantenga dentro de los márgenes de rentabilidad del negocio retail.',
          subordinate: 'Mi líder supervisa el consumo del gasto operativo de TI asignado a su área, asegurando que se mantenga dentro de los márgenes de rentabilidad del negocio retail.'
        },
        bajo: {
          self: 'Reviso de forma minuciosa las configuraciones, scripts o equipos antes de entregarlos al usuario para evitar retrabajos o fallas recurrentes.',
          supervisor: 'El colaborador revisa de forma minuciosa las configuraciones, scripts o equipos antes de entregarlos al usuario para evitar retrabajos o fallas recurrentes.',
          peer: 'Mi compañero revisa de forma minuciosa las configuraciones, scripts o equipos antes de entregarlos al usuario para evitar retrabajos o fallas recurrentes.',
          subordinate: 'El colaborador revisa de forma minuciosa las configuraciones, scripts o equipos antes de entregarlos al usuario para evitar retrabajos o fallas recurrentes.'
        }
      }
    },
    {
      id: 'ti_cond_3',
      title: {
        alto: 'Negociación y Alianzas Estratégicas de TI',
        medio: 'Liderazgo Técnico y Gestión de Incidencias Críticas',
        bajo: 'Agilidad y Sentido de Urgencia'
      },
      text: {
        alto: {
          self: 'Gestiono con rigor las relaciones con proveedores de tecnología, ERP y servicios en la nube, garantizando niveles óptimos de costo-beneficio y soporte.',
          supervisor: 'El colaborador gestiona con rigor las relaciones con proveedores de tecnología, ERP y servicios en la nube, garantizando niveles óptimos de costo-beneficio y soporte.',
          peer: 'Mi compañero gestiona con rigor las relaciones con proveedores de tecnología, ERP y servicios en la nube, garantizando niveles óptimos de costo-beneficio y soporte.',
          subordinate: 'Mi líder gestiona con rigor las relaciones con proveedores de tecnología, ERP y servicios en la nube, garantizando niveles óptimos de costo-beneficio y soporte.'
        },
        medio: {
          self: 'Dirijo la resolución de fallas complejas con temple, estructurando puentes de diagnóstico y asignando recursos con efectividad.',
          supervisor: 'El colaborador dirige la resolución de fallas complejas con temple, estructurando puentes de diagnóstico y asignando recursos con efectividad.',
          peer: 'Mi compañero dirige la resolución de fallas complejas con temple, estructurando puentes de diagnóstico y asignando recursos con efectividad.',
          subordinate: 'Mi líder dirige la resolución de fallas complejas con temple, estructurando puentes de diagnóstico y asignando recursos con efectividad.'
        },
        bajo: {
          self: 'Demuestro velocidad de respuesta y temple técnico ante la caída de servicios críticos en tiendas o sedes administrativas.',
          supervisor: 'El colaborador demuestra velocidad de respuesta y temple técnico ante la caída de servicios críticos en tiendas o sedes administrativas.',
          peer: 'Mi compañero demuestra velocidad de respuesta y temple técnico ante la caída de servicios críticos en tiendas o sedes administrativas.',
          subordinate: 'El colaborador demuestra velocidad de respuesta y temple técnico ante la caída de servicios críticos en tiendas o sedes administrativas.'
        }
      }
    },
    {
      id: 'ti_cond_4',
      title: {
        alto: 'Liderazgo Transformacional y Gestión de Riesgos',
        medio: 'Estandarización de Procesos de TI',
        bajo: 'Documentación Técnica y Transparencia'
      },
      text: {
        alto: {
          self: 'Anticipo riesgos de obsolescencia, ciberseguridad o capacidad, liderando la adopción de tecnologías que modernicen la operación retail.',
          supervisor: 'El colaborador anticipa riesgos de obsolescencia, ciberseguridad o capacidad, liderando la adopción de tecnologías que modernicen la operación retail.',
          peer: 'Mi compañero anticipa riesgos de obsolescencia, ciberseguridad o capacidad, liderando la adopción de tecnologías que modernicen la operación retail.',
          subordinate: 'Mi líder anticipa riesgos de obsolescencia, ciberseguridad o capacidad, liderando la adopción de tecnologías que modernicen la operación retail.'
        },
        medio: {
          self: 'Implemento metodologías, buenas prácticas de desarrollo o marcos de soporte que incrementan la eficiencia del equipo.',
          supervisor: 'El colaborador implementa metodologías, buenas prácticas de desarrollo o marcos de soporte que incrementan la eficiencia del equipo.',
          peer: 'Mi compañero implementa metodologías, buenas prácticas de desarrollo o marcos de soporte que incrementan la eficiencia del equipo.',
          subordinate: 'Mi líder implementa metodologías, buenas prácticas de desarrollo o marcos de soporte que incrementan la eficiencia del equipo.'
        },
        bajo: {
          self: 'Mantengo actualizados los registros de tickets, guías de solución y documentación de sistemas en las herramientas formales de TI.',
          supervisor: 'El colaborador mantiene actualizados los registros de tickets, guías de solución y documentación de sistemas en las herramientas formales de TI.',
          peer: 'Mi compañero mantiene actualizados los registros de tickets, guías de solución y documentación de sistemas en las herramientas formales de TI.',
          subordinate: 'El colaborador mantiene actualizados los registros de tickets, guías de solución y documentación de sistemas en las herramientas formales de TI.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 3: ALINEACIÓN ESTRATÉGICA, RESILIENCIA Y MANEJO DE DESVIACIONES (15%)
  // Modulados por Nivel de Gestión (Alto, Medio, Bajo) y Rol de Evaluador (360°/180°)
  // =========================================================================================
  const sub3Items = [
    {
      id: 'ti_strat_1',
      title: {
        alto: 'Alineación con el Plan Estratégico Nacional',
        medio: 'Análisis Causa Raíz (Post-Mortem)',
        bajo: 'Conciencia del Impacto en el Negocio'
      },
      text: {
        alto: {
          self: 'Aseguro que cada proyecto y presupuesto de la Dirección de TI responda directamente a los objetivos de presencia nacional y rentabilidad de la compañía.',
          supervisor: 'El colaborador asegura que cada proyecto y presupuesto de la Dirección de TI responda directamente a los objetivos de presencia nacional y rentabilidad de la compañía.',
          peer: 'Mi compañero asegura que cada proyecto y presupuesto de la Dirección de TI responda directamente a los objetivos de presencia nacional y rentabilidad de la compañía.',
          subordinate: 'Mi líder asegura que cada proyecto y presupuesto de la Dirección de TI responda directamente a los objetivos de presencia nacional y rentabilidad de la compañía.'
        },
        medio: {
          self: 'Ante caídas de servicio o brechas de SLA, lidero sesiones de análisis causa raíz con el equipo para definir e implementar acciones preventivas permanentes.',
          supervisor: 'El colaborador, ante caídas de servicio o brechas de SLA, lidera sesiones de análisis causa raíz con el equipo para definir e implementar acciones preventivas permanentes.',
          peer: 'Mi compañero, ante caídas de servicio o brechas de SLA, lidera sesiones de análisis causa raíz con el equipo para definir e implementar acciones preventivas permanentes.',
          subordinate: 'Mi líder, ante caídas de servicio o brechas de SLA, lidera sesiones de análisis causa raíz con el equipo para definir e implementar acciones preventivas permanentes.'
        },
        bajo: {
          self: 'Entiendo claramente que la estabilidad de las plataformas es el "riel" que permite el funcionamiento diario y las ventas de las tiendas.',
          supervisor: 'El colaborador entiende claramente que la estabilidad de las plataformas es el "riel" que permite el funcionamiento diario y las ventas de las tiendas.',
          peer: 'Mi compañero entiende claramente que la estabilidad de las plataformas es el "riel" que permite el funcionamiento diario y las ventas de las tiendas.',
          subordinate: 'El colaborador entiende claramente que la estabilidad de las plataformas es el "riel" que permite el funcionamiento diario y las ventas de las tiendas.'
        }
      }
    },
    {
      id: 'ti_strat_2',
      title: {
        alto: 'Gestión de Contingencias Nacionales',
        medio: 'Traducción de Objetivos del Negocio',
        bajo: 'Análisis post-incidente y Corrección'
      },
      text: {
        alto: {
          self: 'Dirijo las acciones ante caídas críticas o fallas de plataforma macro, reasignando recursos y comunicando efectivamente con el Comité Ejecutivo.',
          supervisor: 'El colaborador dirige las acciones ante caídas críticas o fallas de plataforma macro, reasignando recursos y comunicando efectivamente con el Comité Ejecutivo.',
          peer: 'Mi compañero dirige las acciones ante caídas críticas o fallas de plataforma macro, reasignando recursos y comunicando efectivamente con el Comité Ejecutivo.',
          subordinate: 'Mi líder dirige las acciones ante caídas críticas o fallas de plataforma macro, reasignando recursos y comunicando efectivamente con el Comité Ejecutivo.'
        },
        medio: {
          self: 'Transmito a mi equipo técnico la importancia de sus entregables para respaldar la estrategia de crecimiento y presencia nacional de la empresa.',
          supervisor: 'El colaborador transmite a su equipo técnico la importancia de sus entregables para respaldar la estrategia de crecimiento y presencia nacional de la empresa.',
          peer: 'Mi compañero transmite a su equipo técnico la importancia de sus entregables para respaldar la estrategia de crecimiento y presencia nacional de la empresa.',
          subordinate: 'Mi líder transmite a su equipo técnico la importancia de sus entregables para respaldar la estrategia de crecimiento y presencia nacional de la empresa.'
        },
        bajo: {
          self: 'Ante una falla técnica o incumplimiento de SLA, analizo lo sucedido, identifico qué faltó hacer y aplico correcciones para evitar la recurrencia.',
          supervisor: 'El colaborador, ante una falla técnica o incumplimiento de SLA, analiza lo sucedido, identifica qué faltó hacer y aplica correcciones para evitar la recurrencia.',
          peer: 'Mi compañero, ante una falla técnica o incumplimiento de SLA, analiza lo sucedido, identifica qué faltó hacer y aplica correcciones para evitar la recurrencia.',
          subordinate: 'El colaborador, ante una falla técnica o incumplimiento de SLA, analiza lo sucedido, identifica qué faltó hacer y aplica correcciones para evitar la recurrencia.'
        }
      }
    },
    {
      id: 'ti_strat_3',
      title: {
        alto: 'Evaluación de Causas Estructurales',
        medio: 'Gestión de Planes de Acción',
        bajo: 'Comunicación y Empatía con el Usuario'
      },
      text: {
        alto: {
          self: 'Analizo los factores de infraestructura o procesos que originan fallas repetitivas, ordenando planes de reestructuración tecnológica con impacto a largo plazo.',
          supervisor: 'El colaborador analiza los factores de infraestructura o procesos que originan fallas repetitivas, ordenando planes de reestructuración tecnológica con impacto a largo plazo.',
          peer: 'Mi compañero analiza los factores de infraestructura o procesos que originan fallas repetitivas, ordenando planes de reestructuración tecnológica con impacto a largo plazo.',
          subordinate: 'Mi líder analiza los factores de infraestructura o procesos que originan fallas repetitivas, ordenando planes de reestructuración tecnológica con impacto a largo plazo.'
        },
        medio: {
          self: 'Diseño e implemento planes de remediación cuando un proyecto o indicador de plataforma se desvía de la meta semanal.',
          supervisor: 'El colaborador diseña e implementa planes de remediación cuando un proyecto o indicador de plataforma se desvía de la meta semanal.',
          peer: 'Mi compañero diseña e implementa planes de remediación cuando un proyecto o indicador de plataforma se desvía de la meta semanal.',
          subordinate: 'Mi líder diseña e implementa planes de remediación cuando un proyecto o indicador de plataforma se desvía de la meta semanal.'
        },
        bajo: {
          self: 'Mantengo un trato respetuoso, claro y empático con los usuarios finales, comunicando el estatus de sus requerimientos en un lenguaje comprensible.',
          supervisor: 'El colaborador mantiene un trato respetuoso, claro y empático con los usuarios finales, comunicando el estatus de sus requerimientos en un lenguaje comprensible.',
          peer: 'Mi compañero mantiene un trato respetuoso, claro y empático con los usuarios finales, comunicando el estatus de sus requerimientos en un lenguaje comprensible.',
          subordinate: 'El colaborador mantiene un trato respetuoso, claro y empático con los usuarios finales, comunicando el estatus de sus requerimientos en un lenguaje comprensible.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 4: FEEDBACK CUALITATIVO (Campos obligatorios de texto / Sin peso numérico)
  // =========================================================================================
  const feedbackConfig = {
    alto: {
      reconocimientosLabel: 'Reconocimientos y Aportes Estratégicos',
      reconocimientosPrompt: '¿Qué decisiones estratégicas de infraestructura, proyectos Core o garantía de disponibilidad destacaron en la gestión?',
      compromisosLabel: 'Compromisos de Mejora y Escalabilidad',
      compromisosPrompt: 'Defina de 1 a 3 compromisos estratégicos para fortalecer la resiliencia tecnológica, control del OPEX o agilidad del portafolio.'
    },
    medio: {
      reconocimientosLabel: 'Reconocimientos y Gestión de Equipo',
      reconocimientosPrompt: '¿Qué liderazgos de proyecto, estabilizaciones de sistema o mejoras en el SLA del equipo destacaron en el periodo?',
      compromisosLabel: 'Compromisos Tácticos y Nivel de Servicio',
      compromisosPrompt: 'Defina de 1 a 3 compromisos tácticos sobre control de cambios, seguimiento a proyectos o nivel de servicio para el siguiente ciclo.'
    },
    bajo: {
      reconocimientosLabel: 'Reconocimientos y Soporte Destacado',
      reconocimientosPrompt: '¿Qué soluciones técnicas, nivel de atención o soporte destacado del colaborador impactaron positivamente en los usuarios en este periodo?',
      compromisosLabel: 'Compromisos de Agilidad y Rigor Técnico',
      compromisosPrompt: 'Defina de 1 a 3 compromisos de agilidad, documentación o rigor técnico para el siguiente ciclo.'
    }
  }[responsibilityLevel];

  // Cálculo en vivo de ponderaciones
  const sub1Scores = sub1Items.map(i => data.scores?.[i.id]).filter((v): v is number => typeof v === 'number' && v > 0);
  const sub2Scores = sub2Items.map(i => data.scores?.[i.id]).filter((v): v is number => typeof v === 'number' && v > 0);
  const sub3Scores = sub3Items.map(i => data.scores?.[i.id]).filter((v): v is number => typeof v === 'number' && v > 0);

  const avgSub1 = sub1Scores.length > 0 ? sub1Scores.reduce((a, b) => a + b, 0) / sub1Scores.length : 0;
  const avgSub2 = sub2Scores.length > 0 ? sub2Scores.reduce((a, b) => a + b, 0) / sub2Scores.length : 0;
  const avgSub3 = sub3Scores.length > 0 ? sub3Scores.reduce((a, b) => a + b, 0) / sub3Scores.length : 0;

  let totalWeight = 0;
  let weightedSum = 0;
  if (avgSub1 > 0) { weightedSum += avgSub1 * 0.50; totalWeight += 0.50; }
  if (avgSub2 > 0) { weightedSum += avgSub2 * 0.35; totalWeight += 0.35; }
  if (avgSub3 > 0) { weightedSum += avgSub3 * 0.15; totalWeight += 0.15; }

  const notaBrutaSec1 = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const aporteGlobal = notaBrutaSec1 * 0.60;

  const totalQuestions = sub1Items.length + sub2Items.length + sub3Items.length;
  const answeredQuestions = sub1Scores.length + sub2Scores.length + sub3Scores.length;

  return (
    <div className="space-y-6">
      {/* Encabezado limpio de Sección 1 */}
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
            <Cpu size={20} />
          </div>
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}>
              Dirección de Tecnología de la Información (TI)
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Evaluación de indicadores técnicos, soporte, SLAs y resiliencia en el período.
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono text-zinc-500">
          Progreso: <strong className={isDark ? 'text-white' : 'text-zinc-900'}>{answeredQuestions} de {totalQuestions}</strong>
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* SUB-BLOQUE 1: KPIs TÉCNICOS Y OBJETIVOS MEDIBLES                                          */}
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
            Evaluación del cumplimiento de SLA, plataformas Core, protocolos de cambio y resiliencia tecnológica.
          </p>
        </div>

        <div className="space-y-5">
          {sub1Items.map((item, idx) => {
            const itemTitle = item.title[responsibilityLevel];
            const itemFreq = item.frequency[responsibilityLevel];
            const itemMeta = item.meta[responsibilityLevel];
            return (
              <div
                key={item.id}
                className={`space-y-2 ${idx > 0 ? (isDark ? 'pt-4 border-t border-zinc-800/80' : 'pt-4 border-t border-zinc-100') : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                    Indicador {idx + 1}: {itemTitle}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                      Frecuencia: {itemFreq}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                      {itemMeta}
                    </span>
                  </div>
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
      {/* SUB-BLOQUE 2: COMPETENCIAS CONDUCTUALES OPERATIVIZADAS (35%)                              */}
      {/* ========================================================================================= */}
      <div className={`p-5 rounded-2xl border transition-colors duration-200 shadow-sm ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="pb-3 mb-4 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-400" />
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Sub-bloque 2: Competencias Conductuales Operativizadas
            </h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Evaluación de comportamientos observables en el soporte a usuarios, rigor técnico y cultura de servicio.
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
      {/* SUB-BLOQUE 3: ALINEACIÓN ESTRATÉGICA Y MANEJO DE DESVIACIONES (15%)                       */}
      {/* ========================================================================================= */}
      <div className={`p-5 rounded-2xl border transition-colors duration-200 shadow-sm ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="pb-3 mb-4 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-emerald-400" />
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Sub-bloque 3: Alineación Estratégica, Resiliencia y Manejo de Desviaciones
            </h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Evaluación del sentido de negocio ("los rieles del tren"), análisis causa raíz y corrección post-incidente.
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

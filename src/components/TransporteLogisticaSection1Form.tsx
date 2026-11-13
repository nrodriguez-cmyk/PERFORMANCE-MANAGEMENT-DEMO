import React from 'react';
import { EvaluationData } from '../types';
import { Truck, Package, Award, CheckCircle2, TrendingUp, ShieldCheck, MessageSquare, AlertCircle, Clock, Boxes, UserCheck } from 'lucide-react';
import { resolveResponsibilityLevel, ResponsibilityLevel } from '../utils/responsibilityResolver';

export type EvaluatorRoleType = 'self' | 'supervisor' | 'peer' | 'subordinate';

interface TransporteLogisticaSection1FormProps {
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

export function TransporteLogisticaSection1Form({
  data,
  onChange,
  evaluatorRole = 'self',
  employeePosition = '',
  theme = 'dark'
}: TransporteLogisticaSection1FormProps) {
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
        // NOTA: EvaluationData.comments esta tipado como string pero aqui se usa como mapa campo->texto (posible bug de logica); cast para conservar el comportamiento.
        ...(data.comments as unknown as Record<string, string>),
        [field]: text
      } as unknown as string
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
      id: 'tl_kpi_1',
      frequency: {
        alto: 'Mensual',
        medio: 'Mensual',
        bajo: 'Mensual'
      },
      title: {
        alto: 'Rendimiento Global del CENDIS y Capacidad de Respuesta',
        medio: 'Control del Rendimiento Operativo del Turno (Líneas/Hora)',
        bajo: 'Rendimiento Individual de Procesamiento (Líneas y Unidades/Hora)'
      },
      meta: {
        alto: 'Meta: Capacidad de procesamiento para soportar aperturas sin sobredimensionar estructura',
        medio: 'Meta: Productividad meta en líneas de SKU y unidades/hora del equipo asignado',
        bajo: 'Meta: Cumplimiento de cuota de líneas SKU y unidades/hora en picking/embalaje'
      },
      text: {
        alto: {
          self: 'Respondo por la capacidad de procesamiento nacional para absorber la expansión de la empresa y surtir aperturas de tienda dentro de los plazos acordados sin incrementar headcount innecesario.',
          supervisor: 'El colaborador responde por la capacidad de procesamiento nacional para absorber la expansión de la empresa y surtir aperturas de tienda dentro de los plazos acordados sin incrementar headcount innecesario.',
          peer: 'Mi compañero responde por la capacidad de procesamiento nacional para absorber la expansión de la empresa y surtir aperturas de tienda dentro de los plazos acordados sin incrementar headcount innecesario.',
          subordinate: 'Mi líder responde por la capacidad de procesamiento nacional para absorber la expansión de la empresa y surtir aperturas de tienda dentro de los plazos acordados sin incrementar headcount innecesario.'
        },
        medio: {
          self: 'Superviso y garantizo la productividad meta del equipo de pickers y embaladores en líneas de SKU y unidades procesadas por hora.',
          supervisor: 'El colaborador supervisa y garantiza la productividad meta del equipo de pickers y embaladores en líneas de SKU y unidades procesadas por hora.',
          peer: 'Mi compañero supervisa y garantiza la productividad meta del equipo de pickers y embaladores en líneas de SKU y unidades procesadas por hora.',
          subordinate: 'Mi líder supervisa y garantiza la productividad meta del equipo de pickers y embaladores en líneas de SKU y unidades procesadas por hora.'
        },
        bajo: {
          self: 'Cumplo con la cuota establecida de líneas de SKU y unidades procesadas por hora en mis labores de picking, embalaje o movilización en CENDIS.',
          supervisor: 'El colaborador cumple con la cuota establecida de líneas de SKU y unidades procesadas por hora en sus labores de picking, embalaje o movilización en CENDIS.',
          peer: 'Mi compañero cumple con la cuota establecida de líneas de SKU y unidades procesadas por hora en sus labores de picking, embalaje o movilización en CENDIS.',
          subordinate: 'El colaborador cumple con la cuota establecida de líneas de SKU y unidades procesadas por hora en sus labores de picking, embalaje o movilización en CENDIS.'
        }
      }
    },
    {
      id: 'tl_kpi_2',
      frequency: {
        alto: 'Mensual',
        medio: 'Mensual',
        bajo: 'Mensual'
      },
      title: {
        alto: 'Eficiencia en la Cadena de Planificación y Nivel de Servicio',
        medio: 'Cumplimiento de la Planificación Recepción-Despacho',
        bajo: 'Oportunidad en el Flujo de Recepción y Despacho'
      },
      meta: {
        alto: 'Meta: Nivel de servicio global y tiempos de entrega óptimos a la red de tiendas',
        medio: 'Meta: Ciclo logístico a tiempo (desembarque de contenedores hasta salida de transporte)',
        bajo: 'Meta: Ejecución de operaciones según tiempos planificados sin cuellos de botella'
      },
      text: {
        alto: {
          self: 'Garantizo el cumplimiento del nivel de servicio global a la red de tiendas, optimizando la cadena desde recepción de contenedores hasta transporte final.',
          supervisor: 'El colaborador garantiza el cumplimiento del nivel de servicio global a la red de tiendas, optimizando la cadena desde recepción de contenedores hasta transporte final.',
          peer: 'Mi compañero garantiza el cumplimiento del nivel de servicio global a la red de tiendas, optimizando la cadena desde recepción de contenedores hasta transporte final.',
          subordinate: 'Mi líder garantiza el cumplimiento del nivel de servicio global a la red de tiendas, optimizando la cadena desde recepción de contenedores hasta transporte final.'
        },
        medio: {
          self: 'Garantizo los tiempos del ciclo logístico completo (desde la recepción de contenedores hasta la salida del transporte), asegurando el nivel de servicio a tiendas.',
          supervisor: 'El colaborador garantiza los tiempos del ciclo logístico completo (desde la recepción de contenedores hasta la salida del transporte), asegurando el nivel de servicio a tiendas.',
          peer: 'Mi compañero garantiza los tiempos del ciclo logístico completo (desde la recepción de contenedores hasta la salida del transporte), asegurando el nivel de servicio a tiendas.',
          subordinate: 'Mi líder garantiza los tiempos del ciclo logístico completo (desde la recepción de contenedores hasta la salida del transporte), asegurando el nivel de servicio a tiendas.'
        },
        bajo: {
          self: 'Ejecuto las operaciones asignadas respetando los tiempos planificados desde el desembarque de contenedores hasta la carga en camiones de reparto.',
          supervisor: 'El colaborador ejecuta las operaciones asignadas respetando los tiempos planificados desde el desembarque de contenedores hasta la carga en camiones de reparto.',
          peer: 'Mi compañero ejecuta las operaciones asignadas respetando los tiempos planificados desde el desembarque de contenedores hasta la carga en camiones de reparto.',
          subordinate: 'El colaborador ejecuta las operaciones asignadas respetando los tiempos planificados desde el desembarque de contenedores hasta la carga en camiones de reparto.'
        }
      }
    },
    {
      id: 'tl_kpi_3',
      frequency: {
        alto: 'Mensual',
        medio: 'Mensual',
        bajo: 'Mensual'
      },
      title: {
        alto: 'Eficiencia de Costos y Control del Gasto Logístico (OPEX)',
        medio: 'Precisión del Inventario y Control de Calidad en CENDIS',
        bajo: 'Precisión y Calidad en el Armado de Pedidos'
      },
      meta: {
        alto: 'Meta: Presupuesto OPEX logístico optimizado con productividad sostenida',
        medio: 'Meta: Cero averías y mínimas mermas/diferencias en manipulación y despacho',
        bajo: 'Meta: 100% coincidencia física vs documentación de despacho sin mermas ni averías'
      },
      text: {
        alto: {
          self: 'Respondo por la optimización del presupuesto operativo de logística y transporte, garantizando productividad sostenida con la plantilla optimizada de personal.',
          supervisor: 'El colaborador responde por la optimización del presupuesto operativo de logística y transporte, garantizando productividad sostenida con la plantilla optimizada de personal.',
          peer: 'Mi compañero responde por la optimización del presupuesto operativo de logística y transporte, garantizando productividad sostenida con la plantilla optimizada de personal.',
          subordinate: 'Mi líder responde por la optimización del presupuesto operativo de logística y transporte, garantizando productividad sostenida con la plantilla optimizada de personal.'
        },
        medio: {
          self: 'Monitoreo la efectividad en el despacho y custodia de mercancía, minimizando las diferencias de inventario o mermas durante la manipulación y transporte.',
          supervisor: 'El colaborador monitorea la efectividad en el despacho y custodia de mercancía, minimizando las diferencias de inventario o mermas durante la manipulación y transporte.',
          peer: 'Mi compañero monitorea la efectividad en el despacho y custodia de mercancía, minimizando las diferencias de inventario o mermas durante la manipulación y transporte.',
          subordinate: 'Mi líder monitorea la efectividad en el despacho y custodia de mercancía, minimizando las diferencias de inventario o mermas durante la manipulación y transporte.'
        },
        bajo: {
          self: 'Garantizo que los pedidos preparados y despachados a las tiendas coincidan exactamente con la documentación de despacho, evitando errores de conteo o averías.',
          supervisor: 'El colaborador garantiza que los pedidos preparados y despachados a las tiendas coincidan exactamente con la documentación de despacho, evitando errores de conteo o averías.',
          peer: 'Mi compañero garantiza que los pedidos preparados y despachados a las tiendas coincidan exactamente con la documentación de despacho, evitando errores de conteo o averías.',
          subordinate: 'El colaborador garantiza que los pedidos preparados y despachados a las tiendas coincidan exactamente con la documentación de despacho, evitando errores de conteo o averías.'
        }
      }
    },
    {
      id: 'tl_kpi_4',
      frequency: {
        alto: 'Mensual / Trimestral',
        medio: 'Mensual',
        bajo: 'Mensual'
      },
      title: {
        alto: 'Precisión del Inventario General CENDIS',
        medio: 'Gestión de Personal, Ausentismo y Horarios',
        bajo: 'Adherencia a Tiempos de Entrega y Rutas'
      },
      meta: {
        alto: 'Meta: Conciliación continua y exactitud de inventario central nacional',
        medio: 'Meta: Ausentismo no planificado en 0% y estricta cobertura de turnos',
        bajo: 'Meta: Cumplimiento de programación de despacho y entrega a tiempo en tiendas'
      },
      text: {
        alto: {
          self: 'Aseguro la exactitud y conciliación continua del inventario custodiado en los almacenes centrales a nivel nacional.',
          supervisor: 'El colaborador asegura la exactitud y conciliación continua del inventario custodiado en los almacenes centrales a nivel nacional.',
          peer: 'Mi compañero asegura la exactitud y conciliación continua del inventario custodiado en los almacenes centrales a nivel nacional.',
          subordinate: 'Mi líder asegura la exactitud y conciliación continua del inventario custodiado en los almacenes centrales a nivel nacional.'
        },
        medio: {
          self: 'Mantengo el control operativo del ausentismo, permisos y horarios del turno, asegurando la continuidad del procesamiento sin sobrecostos innecesarios.',
          supervisor: 'El colaborador mantiene el control operativo del ausentismo, permisos y horarios del turno, asegurando la continuidad del procesamiento sin sobrecostos innecesarios.',
          peer: 'Mi compañero mantiene el control operativo del ausentismo, permisos y horarios del turno, asegurando la continuidad del procesamiento sin sobrecostos innecesarios.',
          subordinate: 'Mi líder mantiene el control operativo del ausentismo, permisos y horarios del turno, asegurando la continuidad del procesamiento sin sobrecostos innecesarios.'
        },
        bajo: {
          self: 'Cumplo con la programación de despacho y entrega a tiempo en la red de tiendas o destinos asignados.',
          supervisor: 'El colaborador cumple con la programación de despacho y entrega a tiempo en la red de tiendas o destinos asignados.',
          peer: 'Mi compañero cumple con la programación de despacho y entrega a tiempo en la red de tiendas o destinos asignados.',
          subordinate: 'El colaborador cumple con la programación de despacho y entrega a tiempo en la red de tiendas o destinos asignados.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 2: COMPETENCIAS CONDUCTUALES OPERATIVIZADAS (35%)
  // Moduladas por Nivel de Gestión y Rol de Evaluador (360°/180°)
  // =========================================================================================
  const sub2Items = [
    {
      id: 'tl_cond_1',
      title: {
        alto: 'Cultura de Eficiencia Operativa y Productividad',
        medio: 'Liderazgo Operativo y Evaluación del Desempeño',
        bajo: 'Autonomía y Enfoque en Objetivos'
      },
      text: {
        alto: {
          self: 'Promuevo una cultura organizacional enfocada en el rendimiento, la entrega, la pasión y el cumplimiento de metas sin sobredimensionar la estructura de costos.',
          supervisor: 'El colaborador promueve una cultura organizacional enfocada en el rendimiento, la entrega, la pasión y el cumplimiento de metas sin sobredimensionar la estructura de costos.',
          peer: 'Mi compañero promueve una cultura organizacional enfocada en el rendimiento, la entrega, la pasión y el cumplimiento de metas sin sobredimensionar la estructura de costos.',
          subordinate: 'Mi líder promueve una cultura organizacional enfocada en el rendimiento, la entrega, la pasión y el cumplimiento de metas sin sobredimensionar la estructura de costos.'
        },
        medio: {
          self: 'Identifico con claridad qué colaboradores cumplen autónomamente sus metas y gestiono a quienes muestran una actitud pasiva o de mero cumplimiento de horario.',
          supervisor: 'El colaborador identifica con claridad qué colaboradores cumplen autónomamente sus metas y gestiona a quienes muestran una actitud pasiva o de mero cumplimiento de horario.',
          peer: 'Mi compañero identifica con claridad qué colaboradores cumplen autónomamente sus metas y gestiona a quienes muestran una actitud pasiva o de mero cumplimiento de horario.',
          subordinate: 'Mi líder identifica con claridad qué colaboradores cumplen autónomamente sus metas y gestiona a quienes muestran una actitud pasiva o de mero cumplimiento de horario.'
        },
        bajo: {
          self: 'Conozco con claridad mis objetivos diarios de procesamiento y ejecuto mis funciones de forma proactiva sin requerir supervisión o instrucciones constantes.',
          supervisor: 'El colaborador conoce con claridad sus objetivos diarios de procesamiento y ejecuta sus funciones de forma proactiva sin requerir supervisión o instrucciones constantes.',
          peer: 'Mi compañero conoce con claridad sus objetivos diarios de procesamiento y ejecuta sus funciones de forma proactiva sin requerir supervisión o instrucciones constantes.',
          subordinate: 'El colaborador conoce con claridad sus objetivos diarios de procesamiento y ejecuta sus funciones de forma proactiva sin requerir supervisión o instrucciones constantes.'
        }
      }
    },
    {
      id: 'tl_cond_2',
      title: {
        alto: 'Estandarización de Normas, Disciplina y Clima Laboral',
        medio: 'Supervisión de Normas, Imagen y Equipamiento',
        bajo: 'Disciplina, Uniforme y Control de Asistencia'
      },
      text: {
        alto: {
          self: 'Establezco y respaldo los estándares institucionales de disciplina, uso de uniforme, orden y normas de comunicación respetuosa en toda la red de CENDIS.',
          supervisor: 'El colaborador establece y respalda los estándares institucionales de disciplina, uso de uniforme, orden y normas de comunicación respetuosa en toda la red de CENDIS.',
          peer: 'Mi compañero establece y respalda los estándares institucionales de disciplina, uso de uniforme, orden y normas de comunicación respetuosa en toda la red de CENDIS.',
          subordinate: 'Mi líder establece y respalda los estándares institucionales de disciplina, uso de uniforme, orden y normas de comunicación respetuosa en toda la red de CENDIS.'
        },
        medio: {
          self: 'Exijo el cumplimiento riguroso del uniforme, orden y limpieza en las zonas de trabajo, velando por la conservación de la infraestructura y equipos del CENDIS.',
          supervisor: 'El colaborador exige el cumplimiento riguroso del uniforme, orden y limpieza en las zonas de trabajo, velando por la conservación de la infraestructura y equipos del CENDIS.',
          peer: 'Mi compañero exige el cumplimiento riguroso del uniforme, orden y limpieza en las zonas de trabajo, velando por la conservación de la infraestructura y equipos del CENDIS.',
          subordinate: 'Mi líder exige el cumplimiento riguroso del uniforme, orden y limpieza en las zonas de trabajo, velando por la conservación de la infraestructura y equipos del CENDIS.'
        },
        bajo: {
          self: 'Cumplo estrictamente con el uso correcto del uniforme, los horarios de entrada/salida, los turnos asignados y presento una tasa nula de ausentismo injustificado.',
          supervisor: 'El colaborador cumple estrictamente con el uso correcto del uniforme, los horarios de entrada/salida, los turnos asignados y presenta una tasa nula de ausentismo injustificado.',
          peer: 'Mi compañero cumple estrictamente con el uso correcto del uniforme, los horarios de entrada/salida, los turnos asignados y presenta una tasa nula de ausentismo injustificado.',
          subordinate: 'El colaborador cumple estrictamente con el uso correcto del uniforme, los horarios de entrada/salida, los turnos asignados y presenta una tasa nula de ausentismo injustificado.'
        }
      }
    },
    {
      id: 'tl_cond_3',
      title: {
        alto: 'Garantía de Imparcialidad y Desarrollo del Talento',
        medio: 'Comunicación Efectiva y Resolución de Conflictos',
        bajo: 'Orden, Limpieza y Cuidado de Equipos'
      },
      text: {
        alto: {
          self: 'Diseño criterios objetivos de evaluación para que las revisiones de desempeño sean percibidas como herramientas de desarrollo y no como juicios personales.',
          supervisor: 'El colaborador diseña criterios objetivos de evaluación para que las revisiones de desempeño sean percibidas como herramientas de desarrollo y no como juicios personales.',
          peer: 'Mi compañero diseña criterios objetivos de evaluación para que las revisiones de desempeño sean percibidas como herramientas de desarrollo y no como juicios personales.',
          subordinate: 'Mi líder diseña criterios objetivos de evaluación para que las revisiones de desempeño sean percibidas como herramientas de desarrollo y no como juicios personales.'
        },
        medio: {
          self: 'Modelo y exijo la aplicación de las normas del buen hablante y oyente, resolviendo fricciones operativas con respeto y claridad.',
          supervisor: 'El colaborador modela y exige la aplicación de las normas del buen hablante y oyente, resolviendo fricciones operativas con respeto y claridad.',
          peer: 'Mi compañero modela y exige la aplicación de las normas del buen hablante y oyente, resolviendo fricciones operativas con respeto y claridad.',
          subordinate: 'Mi líder modela y exige la aplicación de las normas del buen hablante y oyente, resolviendo fricciones operativas con respeto y claridad.'
        },
        bajo: {
          self: 'Mantengo mi puesto de trabajo limpio y ordenado, cuidando y conservando en óptimas condiciones las herramientas y equipos asignados (RF, montacargas, carretillas, vehículos).',
          supervisor: 'El colaborador mantiene su puesto de trabajo limpio y ordenado, cuidando y conservando en óptimas condiciones las herramientas y equipos asignados (RF, montacargas, carretillas, vehículos).',
          peer: 'Mi compañero mantiene su puesto de trabajo limpio y ordenado, cuidando y conservando en óptimas condiciones las herramientas y equipos asignados (RF, montacargas, carretillas, vehículos).',
          subordinate: 'El colaborador mantiene su puesto de trabajo limpio y ordenado, cuidando y conservando en óptimas condiciones las herramientas y equipos asignados (RF, montacargas, carretillas, vehículos).'
        }
      }
    },
    {
      id: 'tl_cond_4',
      title: {
        alto: 'Visión de Cadena de Suministro y Escalabilidad',
        medio: 'Optimización de Capacidad y Eficiencia de Plantilla',
        bajo: 'Convivencia y Comunicación Respetuosa'
      },
      text: {
        alto: {
          self: 'Diseño la infraestructura y procesos de logística y transporte necesarios para soportar el crecimiento exponencial de la empresa a nivel nacional.',
          supervisor: 'El colaborador diseña la infraestructura y procesos de logística y transporte necesarios para soportar el crecimiento exponencial de la empresa a nivel nacional.',
          peer: 'Mi compañero diseña la infraestructura y procesos de logística y transporte necesarios para soportar el crecimiento exponencial de la empresa a nivel nacional.',
          subordinate: 'Mi líder diseña la infraestructura y procesos de logística y transporte necesarios para soportar el crecimiento exponencial de la empresa a nivel nacional.'
        },
        medio: {
          self: 'Mantengo la capacidad de respuesta y procesamiento del turno sin requerir incrementos injustificados de nómina o personal eventual.',
          supervisor: 'El colaborador mantiene la capacidad de respuesta y procesamiento del turno sin requerir incrementos injustificados de nómina o personal eventual.',
          peer: 'Mi compañero mantiene la capacidad de respuesta y procesamiento del turno sin requerir incrementos injustificados de nómina o personal eventual.',
          subordinate: 'Mi líder mantiene la capacidad de respuesta y procesamiento del turno sin requerir incrementos injustificados de nómina o personal eventual.'
        },
        bajo: {
          self: 'Aplico de forma consistente las normas del buen hablante y del buen oyente en la interacción con mis compañeros, fomentando un clima de respeto y trabajo en equipo.',
          supervisor: 'El colaborador aplica de forma consistente las normas del buen hablante y del buen oyente en la interacción con sus compañeros, fomentando un clima de respeto y trabajo en equipo.',
          peer: 'Mi compañero aplica de forma consistente las normas del buen hablante y del buen oyente en la interacción con sus compañeros, fomentando un clima de respeto y trabajo en equipo.',
          subordinate: 'El colaborador aplica de forma consistente las normas del buen hablante y del buen oyente en la interacción con sus compañeros, fomentando un clima de respeto y trabajo en equipo.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 3: ALINEACIÓN ESTRATÉGICA, RESILIENCIA Y PLANES DE ACCIÓN (15%)
  // Modulados por Nivel de Gestión y Rol de Evaluador (360°/180°)
  // =========================================================================================
  const sub3Items = [
    {
      id: 'tl_strat_1',
      title: {
        alto: 'Dirección de Planes Estratégicos de Recuperación',
        medio: 'Reunión Mensual de Causa Raíz y Reasignación',
        bajo: 'Conciencia del Nivel de Servicio a Tiendas'
      },
      text: {
        alto: {
          self: 'Evalúo mensualmente las causas estructurales ante brechas en rendimiento o gastos, aprobando planes de reestructuración operativa para recuperar las metas.',
          supervisor: 'El colaborador evalúa mensualmente las causas estructurales ante brechas en rendimiento o gastos, aprobando planes de reestructuración operativa para recuperar las metas.',
          peer: 'Mi compañero evalúa mensualmente las causas estructurales ante brechas en rendimiento o gastos, aprobando planes de reestructuración operativa para recuperar las metas.',
          subordinate: 'Mi líder evalúa mensualmente las causas estructurales ante brechas en rendimiento o gastos, aprobando planes de reestructuración operativa para recuperar las metas.'
        },
        medio: {
          self: 'Al inicio de cada mes, lidero la revisión de desviaciones con el equipo, identificando por qué no se llegó a la meta y reubicando estratégicamente al personal de bajo rendimiento.',
          supervisor: 'El colaborador, al inicio de cada mes, lidera la revisión de desviaciones con el equipo, identificando por qué no se llegó a la meta y reubicando estratégicamente al personal de bajo rendimiento.',
          peer: 'Mi compañero, al inicio de cada mes, lidera la revisión de desviaciones con el equipo, identificando por qué no se llegó a la meta y reubicando estratégicamente al personal de bajo rendimiento.',
          subordinate: 'Mi líder, al inicio de cada mes, lidera la revisión de desviaciones con el equipo, identificando por qué no se llegó a la meta y reubicando estratégicamente al personal de bajo rendimiento.'
        },
        bajo: {
          self: 'Comprendo cómo la velocidad y precisión de mi trabajo en CENDIS garantizan que las tiendas tengan el producto a tiempo para la venta y aperturas.',
          supervisor: 'El colaborador comprende cómo la velocidad y precisión de su trabajo en CENDIS garantizan que las tiendas tengan el producto a tiempo para la venta y aperturas.',
          peer: 'Mi compañero comprende cómo la velocidad y precisión de su trabajo en CENDIS garantizan que las tiendas tengan el producto a tiempo para la venta y aperturas.',
          subordinate: 'El colaborador comprende cómo la velocidad y precisión de su trabajo en CENDIS garantizan que las tiendas tengan el producto a tiempo para la venta y aperturas.'
        }
      }
    },
    {
      id: 'tl_strat_2',
      title: {
        alto: 'Gestión Rigurosa de Límites de Bajo Desempeño',
        medio: 'Gestión del Plan de Remediación (Meta de Recuperación)',
        bajo: 'Compromiso ante Recuperación de Metas'
      },
      text: {
        alto: {
          self: 'Defino políticas claras de rotación, movilidad y desvinculación para colaboradores que incumplan de forma reiterada los estándares de rendimiento del CENDIS.',
          supervisor: 'El colaborador define políticas claras de rotación, movilidad y desvinculación para colaboradores que incumplan de forma reiterada los estándares de rendimiento del CENDIS.',
          peer: 'Mi compañero define políticas claras de rotación, movilidad y desvinculación para colaboradores que incumplan de forma reiterada los estándares de rendimiento del CENDIS.',
          subordinate: 'Mi líder define políticas claras de rotación, movilidad y desvinculación para colaboradores que incumplan de forma reiterada los estándares de rendimiento del CENDIS.'
        },
        medio: {
          self: 'Estructuro y ejecuto planes de trabajo inmediatos ante brechas del turno, orientando al equipo a alcanzar la cuota de recuperación establecida para el ciclo siguiente.',
          supervisor: 'El colaborador estructura y ejecuta planes de trabajo inmediatos ante brechas del turno, orientando al equipo a alcanzar la cuota de recuperación establecida para el ciclo siguiente.',
          peer: 'Mi compañero estructura y ejecuta planes de trabajo inmediatos ante brechas del turno, orientando al equipo a alcanzar la cuota de recuperación establecida para el ciclo siguiente.',
          subordinate: 'Mi líder estructura y ejecuta planes de trabajo inmediatos ante brechas del turno, orientando al equipo a alcanzar la cuota de recuperación establecida para el ciclo siguiente.'
        },
        bajo: {
          self: 'Ante un mes con indicadores por debajo de la meta, muestro apertura en la revisión mensual, acepto la reasignación de área si aplica y me comprometo a superar el estándar en el ciclo siguiente.',
          supervisor: 'El colaborador, ante un mes con indicadores por debajo de la meta, muestra apertura en la revisión mensual, acepta la reasignación de área si aplica y se compromete a superar el estándar en el ciclo siguiente.',
          peer: 'Mi compañero, ante un mes con indicadores por debajo de la meta, muestra apertura en la revisión mensual, acepta la reasignación de área si aplica y se compromete a superar el estándar en el ciclo siguiente.',
          subordinate: 'El colaborador, ante un mes con indicadores por debajo de la meta, muestra apertura en la revisión mensual, acepta la reasignación de área si aplica y se compromete a superar el estándar en el ciclo siguiente.'
        }
      }
    },
    {
      id: 'tl_strat_3',
      title: {
        alto: 'Contribución a la Estrategia General de la Empresa',
        medio: 'Alineación con el Crecimiento de la Empresa',
        bajo: 'Pasión y Compromiso Operacional'
      },
      text: {
        alto: {
          self: 'Aseguro que la gestión de Transporte y CENDIS responda de forma impecable a la estrategia de disponibilidad y rentabilidad del negocio.',
          supervisor: 'El colaborador asegura que la gestión de Transporte y CENDIS responda de forma impecable a la estrategia de disponibilidad y rentabilidad del negocio.',
          peer: 'Mi compañero asegura que la gestión de Transporte y CENDIS responda de forma impecable a la estrategia de disponibilidad y rentabilidad del negocio.',
          subordinate: 'Mi líder asegura que la gestión de Transporte y CENDIS responda de forma impecable a la estrategia de disponibilidad y rentabilidad del negocio.'
        },
        medio: {
          self: 'Aseguro que mi turno responda con agilidad ante los picos de demanda y requerimientos de insumos para aperturas de nuevas tiendas.',
          supervisor: 'El colaborador asegura que su turno responda con agilidad ante los picos de demanda y requerimientos de insumos para aperturas de nuevas tiendas.',
          peer: 'Mi compañero asegura que su turno responda con agilidad ante los picos de demanda y requerimientos de insumos para aperturas de nuevas tiendas.',
          subordinate: 'Mi líder asegura que su turno responda con agilidad ante los picos de demanda y requerimientos de insumos para aperturas de nuevas tiendas.'
        },
        bajo: {
          self: 'Demuestro entrega, entusiasmo y sentido de pertenencia en la realización de las labores logísticas de alta exigencia física u operativa.',
          supervisor: 'El colaborador demuestra entrega, entusiasmo y sentido de pertenencia en la realización de las labores logísticas de alta exigencia física u operativa.',
          peer: 'Mi compañero demuestra entrega, entusiasmo y sentido de pertenencia en la realización de las labores logísticas de alta exigencia física u operativa.',
          subordinate: 'El colaborador demuestra entrega, entusiasmo y sentido de pertenencia en la realización de las labores logísticas de alta exigencia física u operativa.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 4: FEEDBACK CUALITATIVO
  // =========================================================================================
  const feedbackConfig = {
    alto: {
      reconocimientosLabel: 'Hitos Estratégicos y Nivel de Servicio',
      reconocimientosPrompt: '¿Qué hitos estratégicos de capacidad de respuesta, control de gasto logístico o nivel de servicio sobresalieron en la gestión?',
      compromisosLabel: 'Compromisos de Optimización y Flujo Logístico',
      compromisosPrompt: 'Defina de 1 a 3 compromisos estratégicos para optimizar el flujo logístico, la productividad por hora o la infraestructura de transporte.'
    },
    medio: {
      reconocimientosLabel: 'Logros de Liderazgo en Turno y Despacho',
      reconocimientosPrompt: '¿Qué logros de liderazgo en turno, cumplimiento de tiempos de despacho o gestión de equipo destacan en el periodo?',
      compromisosLabel: 'Compromisos Tácticos y Control Operativo',
      compromisosPrompt: 'Defina de 1 a 3 compromisos tácticos sobre control de ausentismo, rendimiento de líneas por hora o planes de acción.'
    },
    bajo: {
      reconocimientosLabel: 'Reconocimientos y Precisión en Picking/Despacho',
      reconocimientosPrompt: '¿Qué actitudes de compromiso, precisión en picking o rendimiento destacado del colaborador deben ser reconocidas?',
      compromisosLabel: 'Compromisos Operativos de Mejora',
      compromisosPrompt: 'Defina de 1 a 3 compromisos concretos en puntualidad, cuidado de equipos, orden o rendimiento por hora para el siguiente ciclo.'
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
          <div className="p-2 rounded-lg bg-[#F1B400] text-black shadow-xs">
            <Truck size={20} />
          </div>
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}>
              Dirección de Transporte y Logística (CENDIS)
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Evaluación de flujo logístico, despacho, inventario y nivel de servicio a tiendas.
            </p>
          </div>
        </div>
        <div className="text-[11px] font-mono text-zinc-500">
          Progreso: <strong className={isDark ? 'text-white' : 'text-zinc-900'}>{answeredQuestions} de {totalQuestions}</strong>
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* SUB-BLOQUE 1: REACTIVOS DE KPIS Y OBJETIVOS MEDIBLES                                      */}
      {/* ========================================================================================= */}
      <div className={`p-5 rounded-2xl border transition-colors duration-200 shadow-sm space-y-4 ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="pb-3 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <Boxes size={16} className="text-[#F1B400]" />
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Sub-bloque 1: KPIs y Objetivos Operativos Medibles
            </h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Porcentaje de cumplimiento y efectividad sobre la cuota meta mensual en CENDIS.
          </p>
        </div>

        <div className="space-y-4">
          {sub1Items.map((item, idx) => {
            const itemTitle = item.title[responsibilityLevel];
            const itemMeta = item.meta[responsibilityLevel];
            const itemFreq = item.frequency[responsibilityLevel];

            return (
              <div
                key={item.id}
                className={`space-y-2 ${idx > 0 ? (isDark ? 'pt-4 border-t border-zinc-800/80' : 'pt-4 border-t border-zinc-100') : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className={`text-xs font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                    KPI {idx + 1}: {itemTitle}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-400">
                      Frecuencia: {itemFreq}
                    </span>
                    <span className="text-[10px] font-mono text-amber-500 font-medium">
                      [{itemMeta}]
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
      {/* SUB-BLOQUE 2: COMPETENCIAS CONDUCTUALES OPERATIVIZADAS (35%)                                */}
      {/* ========================================================================================= */}
      <div className={`p-5 rounded-2xl border transition-colors duration-200 shadow-sm space-y-4 ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="pb-3 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-blue-400" />
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Sub-bloque 2: Competencias Conductuales Operativizadas
            </h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Frecuencia observable en autonomía, disciplina, uniforme, orden de puesto y trabajo en equipo.
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
            Reuniones mensuales de causa raíz, cuotas de recuperación, compromiso y nivel de servicio a tiendas.
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
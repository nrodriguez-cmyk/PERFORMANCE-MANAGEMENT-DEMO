import React from 'react';
import { EvaluationData } from '../types';
import { Users, HeartHandshake, Award, CheckCircle2, TrendingUp, ShieldCheck, MessageSquare, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { resolveResponsibilityLevel, ResponsibilityLevel } from '../utils/responsibilityResolver';

export type EvaluatorRoleType = 'self' | 'supervisor' | 'peer' | 'subordinate';

interface TalentoHumanoSection1FormProps {
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

export function TalentoHumanoSection1Form({
  data,
  onChange,
  evaluatorRole = 'self',
  employeePosition = '',
  theme = 'dark'
}: TalentoHumanoSection1FormProps) {
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
  // Representando equitativamente las 5 Gerencias de la Dirección de Talento Humano:
  // 1. Formación y Desarrollo
  // 2. Reclutamiento y Selección
  // 3. Gestión Operativa de Talento Humano
  // 4. Nómina y Beneficios
  // 5. Eventos y Patrocinios
  // =========================================================================================
  const sub1Items = [
    {
      id: 'th_kpi_1',
      frequency: {
        alto: 'Mensual',
        medio: 'Mensual / Quincenal',
        bajo: 'Semanal'
      },
      title: {
        alto: 'Gestión Operativa de TH y Cobertura de Requerimientos Organizacionales',
        medio: 'Cumplimiento de SLAs Operativos y Cobertura Oportuna de Vacantes',
        bajo: 'Atención Oportuna de Requerimientos Operativos y Soporte a Sedes/Tiendas'
      },
      meta: {
        alto: 'Meta: ≥ 95% de efectividad en SLAs operativos de TH y continuidad de dotación nacional',
        medio: 'Meta: Cumplimiento ≥ 95% en tiempos de respuesta operativa y cobertura de personal',
        bajo: 'Meta: Tramitación y resolución de solicitudes operativas dentro del SLA establecido'
      },
      text: {
        alto: {
          self: 'Garantizo la continuidad operativa y la cobertura oportuna de la estructura organizativa en todas las unidades y tiendas del negocio, asegurando altos estándares de servicio interno (Gestión Operativa y Reclutamiento).',
          supervisor: 'El colaborador garantiza la continuidad operativa y la cobertura oportuna de la estructura organizativa en todas las unidades y tiendas del negocio, asegurando altos estándares de servicio interno (Gestión Operativa y Reclutamiento).',
          peer: 'Mi compañero garantiza la continuidad operativa y la cobertura oportuna de la estructura organizativa en todas las unidades y tiendas del negocio, asegurando altos estándares de servicio interno (Gestión Operativa y Reclutamiento).',
          subordinate: 'Mi líder garantiza la continuidad operativa y la cobertura oportuna de la estructura organizativa en todas las unidades y tiendas del negocio, asegurando altos estándares de servicio interno (Gestión Operativa y Reclutamiento).'
        },
        medio: {
          self: 'Superviso y gestiono la atención de requerimientos operativos de personal, solvencias y cobertura de vacantes en las sedes o tiendas asignadas, cumpliendo los SLAs de respuesta establecidos.',
          supervisor: 'El colaborador supervisa y gestiona la atención de requerimientos operativos de personal, solvencias y cobertura de vacantes en las sedes o tiendas asignadas, cumpliendo los SLAs de respuesta establecidos.',
          peer: 'Mi compañero supervisa y gestiona la atención de requerimientos operativos de personal, solvencias y cobertura de vacantes en las sedes o tiendas asignadas, cumpliendo los SLAs de respuesta establecidos.',
          subordinate: 'Mi líder supervisa y gestiona la atención de requerimientos operativos de personal, solvencias y cobertura de vacantes en las sedes o tiendas asignadas, cumpliendo los SLAs de respuesta establecidos.'
        },
        bajo: {
          self: 'Proceso y doy seguimiento continuo a las solicitudes operativas, requerimientos de personal y trámites de colaboradores en tiendas y sedes dentro de los plazos establecidos.',
          supervisor: 'El colaborador procesa y da seguimiento continuo a las solicitudes operativas, requerimientos de personal y trámites de colaboradores en tiendas y sedes dentro de los plazos establecidos.',
          peer: 'Mi compañero procesa y da seguimiento continuo a las solicitudes operativas, requerimientos de personal y trámites de colaboradores en tiendas y sedes dentro de los plazos establecidos.',
          subordinate: 'Mi líder procesa y da seguimiento continuo a las solicitudes operativas, requerimientos de personal y trámites de colaboradores en tiendas y sedes dentro de los plazos establecidos.'
        }
      }
    },
    {
      id: 'th_kpi_2',
      frequency: {
        alto: 'Mensual / Trimestral',
        medio: 'Mensual',
        bajo: 'Semanal'
      },
      title: {
        alto: 'Estrategia y Cumplimiento del Plan de Formación y Desarrollo',
        medio: 'Ejecución del Programa de Capacitación, Inducción y Desarrollo',
        bajo: 'Logística, Registro y Soporte Operativo a Actividades Formativas'
      },
      meta: {
        alto: 'Meta: ≥ 90% de cumplimiento del plan corporativo de formación y desarrollo',
        medio: 'Meta: Cobertura ≥ 90% en inducciones, entrenamientos técnicos y planes de capacitación',
        bajo: 'Meta: Carga de asistencias, materiales y control oportuno de sesiones de formación'
      },
      text: {
        alto: {
          self: 'Diseño y lidero la estrategia corporativa de aprendizaje, inducción, desarrollo del talento y planes de sucesión, fortaleciendo las capacidades técnicas y de liderazgo de la organización (Formación y Desarrollo).',
          supervisor: 'El colaborador diseña y lidera la estrategia corporativa de aprendizaje, inducción, desarrollo del talento y planes de sucesión, fortaleciendo las capacidades técnicas y de liderazgo de la organización (Formación y Desarrollo).',
          peer: 'Mi compañero diseña y lidera la estrategia corporativa de aprendizaje, inducción, desarrollo del talento y planes de sucesión, fortaleciendo las capacidades técnicas y de liderazgo de la organización (Formación y Desarrollo).',
          subordinate: 'Mi líder diseña y lidera la estrategia corporativa de aprendizaje, inducción, desarrollo del talento y planes de sucesión, fortaleciendo las capacidades técnicas y de liderazgo de la organización (Formación y Desarrollo).'
        },
        medio: {
          self: 'Coordino y ejecuto el cronograma de capacitación, inducción institucional y talleres de desarrollo para los equipos operativos y administrativos, midiendo la efectividad del aprendizaje.',
          supervisor: 'El colaborador coordina y ejecuta el cronograma de capacitación, inducción institucional y talleres de desarrollo para los equipos operativos y administrativos, midiendo la efectividad del aprendizaje.',
          peer: 'Mi compañero coordina y ejecuta el cronograma de capacitación, inducción institucional y talleres de desarrollo para los equipos operativos y administrativos, midiendo la efectividad del aprendizaje.',
          subordinate: 'Mi líder coordina y ejecuta el cronograma de capacitación, inducción institucional y talleres de desarrollo para los equipos operativos y administrativos, midiendo la efectividad del aprendizaje.'
        },
        bajo: {
          self: 'Apoyo la logística de salas, convocatorias, materiales y registros de asistencia de los programas de capacitación e inducción, asegurando expedientes de formación al día.',
          supervisor: 'El colaborador apoya la logística de salas, convocatorias, materiales y registros de asistencia de los programas de capacitación e inducción, asegurando expedientes de formación al día.',
          peer: 'Mi compañero apoya la logística de salas, convocatorias, materiales y registros de asistencia de los programas de capacitación e inducción, asegurando expedientes de formación al día.',
          subordinate: 'Mi líder apoya la logística de salas, convocatorias, materiales y registros de asistencia de los programas de capacitación e inducción, asegurando expedientes de formación al día.'
        }
      }
    },
    {
      id: 'th_kpi_3',
      frequency: {
        alto: 'Quincenal / Mensual',
        medio: 'Quincenal',
        bajo: 'Semanal / Quincenal'
      },
      title: {
        alto: 'Puntualidad, Exactitud en Nómina, Beneficios y Gobernanza Laboral',
        medio: 'Supervisión de Incidencias de Nómina, Beneficios y Gestión de Compensaciones',
        bajo: 'Procesamiento Preciso de Novedades, Préstamos y Beneficios al Personal'
      },
      meta: {
        alto: 'Meta: 100% de puntualidad en pago de nómina, cero errores materiales y apego legal',
        medio: 'Meta: Cierre oportuno de incidencias quincenales y resolución ágil de consultas de pago',
        bajo: 'Meta: Carga de novedades de nómina y solicitudes de beneficios sin errores ni demoras'
      },
      text: {
        alto: {
          self: 'Aseguro la exactitud, puntualidad y cumplimiento normativo en el procesamiento de nómina, compensaciones y administración de beneficios socioeconómicos para toda la fuerza laboral (Nómina y Beneficios).',
          supervisor: 'El colaborador asegura la exactitud, puntualidad y cumplimiento normativo en el procesamiento de nómina, compensaciones y administración de beneficios socioeconómicos para toda la fuerza laboral (Nómina y Beneficios).',
          peer: 'Mi compañero asegura la exactitud, puntualidad y cumplimiento normativo en el procesamiento de nómina, compensaciones y administración de beneficios socioeconómicos para toda la fuerza laboral (Nómina y Beneficios).',
          subordinate: 'Mi líder asegura la exactitud, puntualidad y cumplimiento normativo en el procesamiento de nómina, compensaciones y administración de beneficios socioeconómicos para toda la fuerza laboral (Nómina y Beneficios).'
        },
        medio: {
          self: 'Superviso y valido el reporte oportuno de incidencias (horas, asistencias, reposos, préstamos y deducciones), garantizando una liquidación de nómina confiable y atención rápida a reclamos.',
          supervisor: 'El colaborador supervisa y valida el reporte oportuno de incidencias (horas, asistencias, reposos, préstamos y deducciones), garantizando una liquidación de nómina confiable y atención rápida a reclamos.',
          peer: 'Mi compañero supervisa y valida el reporte oportuno de incidencias (horas, asistencias, reposos, préstamos y deducciones), garantizando una liquidación de nómina confiable y atención rápida a reclamos.',
          subordinate: 'Mi líder supervisa y valida el reporte oportuno de incidencias (horas, asistencias, reposos, préstamos y deducciones), garantizando una liquidación de nómina confiable y atención rápida a reclamos.'
        },
        bajo: {
          self: 'Registro y verifico con rigurosidad las incidencias, novedades, solicitudes de anticipos, préstamos o beneficios de los colaboradores asignados, respetando el cronograma de nómina.',
          supervisor: 'El colaborador registra y verifica con rigurosidad las incidencias, novedades, solicitudes de anticipos, préstamos o beneficios de los colaboradores asignados, respetando el cronograma de nómina.',
          peer: 'Mi compañero registra y verifica con rigurosidad las incidencias, novedades, solicitudes de anticipos, préstamos o beneficios de los colaboradores asignados, respetando el cronograma de nómina.',
          subordinate: 'Mi líder registra y verifica con rigurosidad las incidencias, novedades, solicitudes de anticipos, préstamos o beneficios de los colaboradores asignados, respetando el cronograma de nómina.'
        }
      }
    },
    {
      id: 'th_kpi_4',
      frequency: {
        alto: 'Mensual / Eventual',
        medio: 'Mensual',
        bajo: 'Eventual / Semanal'
      },
      title: {
        alto: 'Cultura Corporativa, Eventos Institucionales, Patrocinios y Clima (GPTW)',
        medio: 'Coordinación de Eventos Corporativos, Integración y Clima Laboral',
        bajo: 'Soporte Logístico en Eventos, Patrocinios y Actividades de Integración'
      },
      meta: {
        alto: 'Meta: Excelencia en eventos institucionales, impacto de patrocinios y cultura GPTW',
        medio: 'Meta: Ejecución de eventos según cronograma y despliegue de iniciativas de bienestar',
        bajo: 'Meta: Cumplimiento al 100% en montaje operativo, atención a participantes y logística'
      },
      text: {
        alto: {
          self: 'Lidero las iniciativas de posicionamiento de marca empleadora, la gestión estratégica de eventos corporativos, patrocinios institucionales y el fortalecimiento del clima laboral GPTW (Eventos y Patrocinios).',
          supervisor: 'El colaborador lidera las iniciativas de posicionamiento de marca empleadora, la gestión estratégica de eventos corporativos, patrocinios institucionales y el fortalecimiento del clima laboral GPTW (Eventos y Patrocinios).',
          peer: 'Mi compañero lidera las iniciativas de posicionamiento de marca empleadora, la gestión estratégica de eventos corporativos, patrocinios institucionales y el fortalecimiento del clima laboral GPTW (Eventos y Patrocinios).',
          subordinate: 'Mi líder lidera las iniciativas de posicionamiento de marca empleadora, la gestión estratégica de eventos corporativos, patrocinios institucionales y el fortalecimiento del clima laboral GPTW (Eventos y Patrocinios).'
        },
        medio: {
          self: 'Organizo y coordino las actividades institucionales, celebraciones internas, logística de patrocinios y planes de acción de clima laboral en las fechas y presupuestos programados.',
          supervisor: 'El colaborador organiza y coordina las actividades institucionales, celebraciones internas, logística de patrocinios y planes de acción de clima laboral en las fechas y presupuestos programados.',
          peer: 'Mi compañero organiza y coordina las actividades institucionales, celebraciones internas, logística de patrocinios y planes de acción de clima laboral en las fechas y presupuestos programados.',
          subordinate: 'Mi líder organiza y coordina las actividades institucionales, celebraciones internas, logística de patrocinios y planes de acción de clima laboral en las fechas y presupuestos programados.'
        },
        bajo: {
          self: 'Ejecuto las labores logísticas, coordinación de insumos, montaje y asistencia en eventos institucionales, activaciones de marca y actividades de integración para el personal.',
          supervisor: 'El colaborador ejecuta las labores logísticas, coordinación de insumos, montaje y asistencia en eventos institucionales, activaciones de marca y actividades de integración para el personal.',
          peer: 'Mi compañero ejecuta las labores logísticas, coordinación de insumos, montaje y asistencia en eventos institucionales, activaciones de marca y actividades de integración para el personal.',
          subordinate: 'Mi líder ejecuta las labores logísticas, coordinación de insumos, montaje y asistencia en eventos institucionales, activaciones de marca y actividades de integración para el personal.'
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
      id: 'th_cond_1',
      title: {
        alto: 'Activación Cultural y Modelaje de Liderazgo',
        medio: 'Asesoría Estratégica a Líderes de Área (HRBP)',
        bajo: 'Empatía, Escucha Activa y Servicio al Colaborador'
      },
      text: {
        alto: {
          self: 'Diseño e impulso el ADN corporativo de la empresa, asegurando que el equipo directivo y gerencial modele los valores y conductas esperadas.',
          supervisor: 'El colaborador diseña e impulsa el ADN corporativo de la empresa, asegurando que el equipo directivo y gerencial modele los valores y conductas esperadas.',
          peer: 'Mi compañero diseña e impulsa el ADN corporativo de la empresa, asegurando que el equipo directivo y gerencial modele los valores y conductas esperadas.',
          subordinate: 'Mi líder diseña e impulsa el ADN corporativo de la empresa, asegurando que el equipo directivo y gerencial modele los valores y conductas esperadas.'
        },
        medio: {
          self: 'Acompaño a los líderes operativos en la gestión de sus equipos, ofreciendo herramientas de liderazgo, manejo de conflictos y retroalimentación.',
          supervisor: 'El colaborador acompaña a los líderes operativos en la gestión de sus equipos, ofreciendo herramientas de liderazgo, manejo de conflictos y retroalimentación.',
          peer: 'Mi compañero acompaña a los líderes operativos en la gestión de sus equipos, ofreciendo herramientas de liderazgo, manejo de conflictos y retroalimentación.',
          subordinate: 'Mi líder acompaña a los líderes operativos en la gestión de sus equipos, ofreciendo herramientas de liderazgo, manejo de conflictos y retroalimentación.'
        },
        bajo: {
          self: 'Atiendo a los colaboradores con cercanía, respeto y disposición, ofreciendo respuestas claras y soluciones efectivas dentro de mis atribuciones.',
          supervisor: 'El colaborador atiende a los colaboradores con cercanía, respeto y disposición, ofreciendo respuestas claras y soluciones efectivas dentro de sus atribuciones.',
          peer: 'Mi compañero atiende a los colaboradores con cercanía, respeto y disposición, ofreciendo respuestas claras y soluciones efectivas dentro de sus atribuciones.',
          subordinate: 'El colaborador atiende a los colaboradores con cercanía, respeto y disposición, ofreciendo respuestas claras y soluciones efectivas dentro de sus atribuciones.'
        }
      }
    },
    {
      id: 'th_cond_2',
      title: {
        alto: 'Visión Estratégica de TH como Habilitador del Negocio',
        medio: 'Análisis de Datos de TH para la Toma de Decisiones',
        bajo: 'Confidencialidad, Ética e Integridad'
      },
      text: {
        alto: {
          self: 'Posiciono a la Dirección de Talento Humano como un socio estratégico que protege la cultura, optimiza el gasto de personal y eleva la productividad.',
          supervisor: 'El colaborador posiciona a la Dirección de Talento Humano como un socio estratégico que protege la cultura, optimiza el gasto de personal y eleva la productividad.',
          peer: 'Mi compañero posiciona a la Dirección de Talento Humano como un socio estratégico que protege la cultura, optimiza el gasto de personal y eleva la productividad.',
          subordinate: 'Mi líder posiciona a la Dirección de Talento Humano como un socio estratégico que protege la cultura, optimiza el gasto de personal y eleva la productividad.'
        },
        medio: {
          self: 'Utilizo las métricas de mi subsistema (rotación, capacitación, evaluaciones, ausentismo) para diagnosticar problemas e implementar soluciones basadas en evidencia.',
          supervisor: 'El colaborador utiliza las métricas de su subsistema (rotación, capacitación, evaluaciones, ausentismo) para diagnosticar problemas e implementar soluciones basadas en evidencia.',
          peer: 'Mi compañero utiliza las métricas de su subsistema (rotación, capacitación, evaluaciones, ausentismo) para diagnosticar problemas e implementar soluciones basadas en evidencia.',
          subordinate: 'Mi líder utiliza las métricas de su subsistema (rotación, capacitación, evaluaciones, ausentismo) para diagnosticar problemas e implementar soluciones basadas en evidencia.'
        },
        bajo: {
          self: 'Manejo la información sensible de la empresa (evaluaciones, salarios, datos personales o casos laborales) con absoluta discreción y objetividad.',
          supervisor: 'El colaborador maneja la información sensible de la empresa (evaluaciones, salarios, datos personales o casos laborales) con absoluta discreción y objetividad.',
          peer: 'Mi compañero maneja la información sensible de la empresa (evaluaciones, salarios, datos personales o casos laborales) con absoluta discreción y objetividad.',
          subordinate: 'El colaborador maneja la información sensible de la empresa (evaluaciones, salarios, datos personales o casos laborales) con absoluta discreción y objetividad.'
        }
      }
    },
    {
      id: 'th_cond_3',
      title: {
        alto: 'Construcción de Propuesta de Valor al Colaborador (EVP)',
        medio: 'Resolución de Conflictos y Mediación Laboral',
        bajo: 'Rigor Normativo y Precisión en los Procesos'
      },
      text: {
        alto: {
          self: 'Desarrollo estrategias de bienestar, compensación y desarrollo que posicionan a la empresa como un empleador de referencia en el mercado.',
          supervisor: 'El colaborador desarrolla estrategias de bienestar, compensación y desarrollo que posicionan a la empresa como un empleador de referencia en el mercado.',
          peer: 'Mi compañero desarrolla estrategias de bienestar, compensación y desarrollo que posicionan a la empresa como un empleador de referencia en el mercado.',
          subordinate: 'Mi líder desarrolla estrategias de bienestar, compensación y desarrollo que posicionan a la empresa como un empleador de referencia en el mercado.'
        },
        medio: {
          self: 'Intervengo en fricciones de equipo o situaciones de clima laboral con imparcialidad, asertividad y enfoque en la armonía organizacional.',
          supervisor: 'El colaborador interviene en fricciones de equipo o situaciones de clima laboral con imparcialidad, asertividad y enfoque en la armonía organizacional.',
          peer: 'Mi compañero interviene en fricciones de equipo o situaciones de clima laboral con imparcialidad, asertividad y enfoque en la armonía organizacional.',
          subordinate: 'Mi líder interviene en fricciones de equipo o situaciones de clima laboral con imparcialidad, asertividad y enfoque en la armonía organizacional.'
        },
        bajo: {
          self: 'Reviso minuciosamente la información y documentos de mi subsistema antes de su cierre, reduciendo a cero los errores o reprocesos en la gestión.',
          supervisor: 'El colaborador revisa minuciosamente la información y documentos de su subsistema antes de su cierre, reduciendo a cero los errores o reprocesos en la gestión.',
          peer: 'Mi compañero revisa minuciosamente la información y documentos de su subsistema antes de su cierre, reduciendo a cero los errores o reprocesos en la gestión.',
          subordinate: 'El colaborador revisa minuciosamente la información y documentos de su subsistema antes de su cierre, reduciendo a cero los errores o reprocesos en la gestión.'
        }
      }
    },
    {
      id: 'th_cond_4',
      title: {
        alto: 'Gobierno Corporativo y Seguridad Jurídica',
        medio: 'Estandarización y Mejora Continua',
        bajo: 'Proactividad e Iniciativa en su Área'
      },
      text: {
        alto: {
          self: 'Aseguro el estricto cumplimiento normativo e institucional en todas las relaciones laborales de la compañía.',
          supervisor: 'El colaborador asegura el estricto cumplimiento normativo e institucional en todas las relaciones laborales de la compañía.',
          peer: 'Mi compañero asegura el estricto cumplimiento normativo e institucional en todas las relaciones laborales de la compañía.',
          subordinate: 'Mi líder asegura el estricto cumplimiento normativo e institucional en todas las relaciones laborales de la compañía.'
        },
        medio: {
          self: 'Identifico oportunidades de simplificación en los procesos de TH a mi cargo, promoviendo herramientas más ágiles para la experiencia del colaborador.',
          supervisor: 'El colaborador identifica oportunidades de simplificación en los procesos de TH a su cargo, promoviendo herramientas más ágiles para la experiencia del colaborador.',
          peer: 'Mi compañero identifica oportunidades de simplificación en los procesos de TH a su cargo, promoviendo herramientas más ágiles para la experiencia del colaborador.',
          subordinate: 'Mi líder identifica oportunidades de simplificación en los procesos de TH a su cargo, promoviendo herramientas más ágiles para la experiencia del colaborador.'
        },
        bajo: {
          self: 'Propongo mejoras prácticas en los flujos de mi subsistema para agilizar la entrega de valor a los colaboradores y líderes.',
          supervisor: 'El colaborador propone mejoras prácticas en los flujos de su subsistema para agilizar la entrega de valor a los colaboradores y líderes.',
          peer: 'Mi compañero propone mejoras prácticas en los flujos de su subsistema para agilizar la entrega de valor a los colaboradores y líderes.',
          subordinate: 'El colaborador propone mejoras prácticas en los flujos de su subsistema para agilizar la entrega de valor a los colaboradores y líderes.'
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
      id: 'th_strat_1',
      title: {
        alto: 'Resiliencia y Reestructuración de Estrategias',
        medio: 'Análisis Causa Raíz de Desviaciones',
        bajo: 'Conciencia del Impacto en el Negocio'
      },
      text: {
        alto: {
          self: 'Ante desviaciones en el indicador de rotación o clima en unidades críticas, reoriento recursos y políticas para corregir el rumbo institucional.',
          supervisor: 'El colaborador, ante desviaciones en el indicador de rotación o clima en unidades críticas, reorienta recursos y políticas para corregir el rumbo institucional.',
          peer: 'Mi compañero, ante desviaciones en el indicador de rotación o clima en unidades críticas, reorienta recursos y políticas para corregir el rumbo institucional.',
          subordinate: 'Mi líder, ante desviaciones en el indicador de rotación o clima en unidades críticas, reorienta recursos y políticas para corregir el rumbo institucional.'
        },
        medio: {
          self: 'Cuando un indicador de mi subsistema o unidad (ej. aumento de rotación o bajo avance en formación) se desvía, lidero el análisis de causa raíz y estructuro un plan de remediación.',
          supervisor: 'El colaborador, cuando un indicador de su subsistema o unidad (ej. aumento de rotación o bajo avance en formación) se desvía, lidera el análisis de causa raíz y estructura un plan de remediación.',
          peer: 'Mi compañero, cuando un indicador de su subsistema o unidad (ej. aumento de rotación o bajo avance en formación) se desvía, lidera el análisis de causa raíz y estructura un plan de remediación.',
          subordinate: 'Mi líder, cuando un indicador de su subsistema o unidad (ej. aumento de rotación o bajo avance en formación) se desvía, lidera el análisis de causa raíz y estructura un plan de remediación.'
        },
        bajo: {
          self: 'Comprendo claramente cómo la ejecución impecable de mis funciones contribuye a la estabilidad operativa, la calidad de servicio en tiendas y la reducción de la rotación.',
          supervisor: 'El colaborador comprende claramente cómo la ejecución impecable de sus funciones contribuye a la estabilidad operativa, la calidad de servicio en tiendas y la reducción de la rotación.',
          peer: 'Mi compañero comprende claramente cómo la ejecución impecable de sus funciones contribuye a la estabilidad operativa, la calidad de servicio en tiendas y la reducción de la rotación.',
          subordinate: 'El colaborador comprende claramente cómo la ejecución impecable de sus funciones contribuye a la estabilidad operativa, la calidad de servicio en tiendas y la reducción de la rotación.'
        }
      }
    },
    {
      id: 'th_strat_2',
      title: {
        alto: 'Alineación con el Plan Estratégico Corporativo',
        medio: 'Alineación con la Operación Comercial',
        bajo: 'Alerta Temprana ante Inconsistencias o Riesgos'
      },
      text: {
        alto: {
          self: 'Garantizo que los modelos de evaluación, compensación, capacitación y selección respondan de forma fluida a la rentabilidad y expansión del negocio.',
          supervisor: 'El colaborador garantiza que los modelos de evaluación, compensación, capacitación y selección respondan de forma fluida a la rentabilidad y expansión del negocio.',
          peer: 'Mi compañero garantiza que los modelos de evaluación, compensación, capacitación y selección respondan de forma fluida a la rentabilidad y expansión del negocio.',
          subordinate: 'Mi líder garantiza que los modelos de evaluación, compensación, capacitación y selección respondan de forma fluida a la rentabilidad y expansión del negocio.'
        },
        medio: {
          self: 'Coordino la entrega de los servicios de TH en coherencia con las prioridades operativas, picos de venta y aperturas de tiendas de la empresa.',
          supervisor: 'El colaborador coordina la entrega de los servicios de TH en coherencia con las prioridades operativas, picos de venta y aperturas de tiendas de la empresa.',
          peer: 'Mi compañero coordina la entrega de los servicios de TH en coherencia con las prioridades operativas, picos de venta y aperturas de tiendas de la empresa.',
          subordinate: 'Mi líder coordina la entrega de los servicios de TH en coherencia con las prioridades operativas, picos de venta y aperturas de tiendas de la empresa.'
        },
        bajo: {
          self: 'Detecto e informo a tiempo a mi jefatura sobre desviaciones en procesos, riesgos de insatisfacción o problemas de clima en las áreas que atiendo.',
          supervisor: 'El colaborador detecta e informa a tiempo a su jefatura sobre desviaciones en procesos, riesgos de insatisfacción o problemas de clima en las áreas que atiende.',
          peer: 'Mi compañero detecta e informa a tiempo a su jefatura sobre desviaciones en procesos, riesgos de insatisfacción o problemas de clima en las áreas que atiende.',
          subordinate: 'El colaborador detecta e informa a tiempo a su jefatura sobre desviaciones en procesos, riesgos de insatisfacción o problemas de clima en las áreas que atiende.'
        }
      }
    },
    {
      id: 'th_strat_3',
      title: {
        alto: 'Evaluación de Causas Estructurales de Clima',
        medio: 'Seguimiento a Compromisos de Clima',
        bajo: 'Actitud Resolutiva ante Desviaciones'
      },
      text: {
        alto: {
          self: 'Analizo factores organizacionales complejos que afecten la experiencia del colaborador, ejecutando transformaciones culturales de fondo.',
          supervisor: 'El colaborador analiza factores organizacionales complejos que afecten la experiencia del colaborador, ejecutando transformaciones culturales de fondo.',
          peer: 'Mi compañero analiza factores organizacionales complejos que afecten la experiencia del colaborador, ejecutando transformaciones culturales de fondo.',
          subordinate: 'Mi líder analiza factores organizacionales complejos que afecten la experiencia del colaborador, ejecutando transformaciones culturales de fondo.'
        },
        medio: {
          self: 'Hago seguimiento semanal al cumplimiento de las iniciativas de bienestar y cultura en las sedes asignadas.',
          supervisor: 'El colaborador hace seguimiento semanal al cumplimiento de las iniciativas de bienestar y cultura en las sedes asignadas.',
          peer: 'Mi compañero hace seguimiento semanal al cumplimiento de las iniciativas de bienestar y cultura en las sedes asignadas.',
          subordinate: 'Mi líder hace seguimiento semanal al cumplimiento de las iniciativas de bienestar y cultura en las sedes asignadas.'
        },
        bajo: {
          self: 'Ante un incumplimiento en mis entregables, asumo una actitud autocrítica, identifico las causas del retraso y aplico las correcciones acordadas.',
          supervisor: 'El colaborador, ante un incumplimiento en sus entregables, asume una actitud autocrítica, identifica las causas del retraso y aplica las correcciones acordadas.',
          peer: 'Mi compañero, ante un incumplimiento en sus entregables, asume una actitud autocrítica, identifica las causas del retraso y aplica las correcciones acordadas.',
          subordinate: 'El colaborador, ante un incumplimiento en sus entregables, asume una actitud autocrítica, identifica las causas del retraso y aplica las correcciones acordadas.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 4: FEEDBACK CUALITATIVO
  // =========================================================================================
  const feedbackConfig = {
    alto: {
      reconocimientosLabel: 'Hitos Estratégicos, Cultura y Gobernanza',
      reconocimientosPrompt: '¿Qué decisiones de gobernanza de TH, hitos de cultura o logros en retención destacaron en la gestión?',
      compromisosLabel: 'Compromisos de Gobernanza y Fidelización',
      compromisosPrompt: 'Defina de 1 a 3 compromisos estratégicos para fortalecer la gobernanza organizativa, la certificación de clima o la fidelización del talento.'
    },
    medio: {
      reconocimientosLabel: 'Hitos en Subsistema y Retención de Personal',
      reconocimientosPrompt: '¿Qué hitos en la gestión de su subsistema, retención de personal o asesoría a líderes destacan en la evaluación?',
      compromisosLabel: 'Compromisos Tácticos de Gestión',
      compromisosPrompt: 'Defina de 1 a 3 compromisos tácticos sobre control de SLAs, estandarización o gestión de clima para el siguiente ciclo.'
    },
    bajo: {
      reconocimientosLabel: 'Reconocimientos y Aportes al Subsistema',
      reconocimientosPrompt: '¿Qué logros en la calidad de entregables, nivel de atención o aportes al subsistema destacaron en este periodo?',
      compromisosLabel: 'Compromisos Operativos de Mejora',
      compromisosPrompt: 'Defina de 1 a 3 compromisos concretos en oportunidad, rigor analítico o servicio al colaborador para el siguiente ciclo.'
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
          <div className="p-2 rounded-lg bg-rose-600 text-white shadow-xs">
            <HeartHandshake size={20} />
          </div>
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}>
              Dirección de Talento Humano
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Evaluación de metas operativas, indicadores y conductas en el período.
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
            <Sparkles size={16} className="text-[#F1B400]" />
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Sub-bloque 1: KPIs y Objetivos Operativos Medibles
            </h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Metas operativas: Formación y Desarrollo, Reclutamiento, Gestión Operativa, Nómina y Beneficios, Eventos y Patrocinios.
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
            Frecuencia observable en empatía, confidencialidad, rigor normativo, asesoría a líderes y cultura.
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
            Resiliencia, análisis de causa raíz, alerta temprana ante riesgos y alineación con la expansión del negocio.
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
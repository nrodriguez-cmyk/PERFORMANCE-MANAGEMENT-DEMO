import React from 'react';
import { EvaluationData } from '../types';
import { ShoppingBag, Target, TrendingUp, ShieldCheck, CheckCircle2, MessageSquare, AlertCircle, Sparkles, Layers } from 'lucide-react';
import { resolveResponsibilityLevel, ResponsibilityLevel } from '../utils/responsibilityResolver';

export type EvaluatorRoleType = 'self' | 'supervisor' | 'peer' | 'subordinate';

interface ComercialSection1FormProps {
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

export function ComercialSection1Form({
  data,
  onChange,
  evaluatorRole = 'self',
  employeePosition = '',
  theme = 'dark'
}: ComercialSection1FormProps) {
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
      id: 'com_kpi_1',
      frequency: {
        alto: 'Mensual',
        medio: 'Mensual',
        bajo: 'Semanal'
      },
      title: {
        alto: 'Maximización del Margen de Contribución y Sell-Out Consolidado',
        medio: 'Efectividad y Cumplimiento de Indicadores de la Coordinación',
        bajo: 'Cumplimiento de Metas y Entregables del Rol'
      },
      meta: {
        alto: 'Meta: Ingresos globales de la cadena con arquitectura de precios dinámicos y mezcla de alto margen (RGM)',
        medio: 'Meta: Cumplimiento de KPIs de equipo/categoría (ventas, margen de contribución, conversión o SLAs)',
        bajo: 'Meta: Cumplimiento de cuotas de ventas, volumen de atención, producción visual o cargas de datos a tiempo'
      },
      text: {
        alto: {
          self: 'Respondo por los ingresos globales de la cadena, implementando arquitectura de precios dinámicos y mezcla óptima de alto margen (RGM).',
          supervisor: 'El colaborador responde por los ingresos globales de la cadena, implementando arquitectura de precios dinámicos y mezcla óptima de alto margen (RGM).',
          peer: 'Mi compañero responde por los ingresos globales de la cadena, implementando arquitectura de precios dinámicos y mezcla óptima de alto margen (RGM).',
          subordinate: 'Mi líder responde por los ingresos globales de la cadena, implementando arquitectura de precios dinámicos y mezcla óptima de alto margen (RGM).'
        },
        medio: {
          self: 'Superviso y garantizo el cumplimiento de los KPIs asignados a mi equipo o categoría (ventas, margen de contribución, conversión digital, aperturas o SLAs de servicio).',
          supervisor: 'El colaborador supervisa y garantiza el cumplimiento de los KPIs asignados a su equipo o categoría (ventas, margen de contribución, conversión digital, aperturas o SLAs de servicio).',
          peer: 'Mi compañero supervisa y garantiza el cumplimiento de los KPIs asignados a su equipo o categoría (ventas, margen de contribución, conversión digital, aperturas o SLAs de servicio).',
          subordinate: 'Mi líder supervisa y garantiza el cumplimiento de los KPIs asignados a su equipo o categoría (ventas, margen de contribución, conversión digital, aperturas o SLAs de servicio).'
        },
        bajo: {
          self: 'Logro las cuotas de ventas, volumen de atención, producción gráfica/audiovisual o cargas de datos asignadas a mi función dentro de los tiempos estipulados.',
          supervisor: 'El colaborador logra las cuotas de ventas, volumen de atención, producción gráfica/audiovisual o cargas de datos asignadas a su función dentro de los tiempos estipulados.',
          peer: 'Mi compañero logra las cuotas de ventas, volumen de atención, producción gráfica/audiovisual o cargas de datos asignadas a su función dentro de los tiempos estipulados.',
          subordinate: 'El colaborador logra las cuotas de ventas, volumen de atención, producción gráfica/audiovisual o cargas de datos asignadas a su función dentro de los tiempos estipulados.'
        }
      }
    },
    {
      id: 'com_kpi_2',
      frequency: {
        alto: 'Mensual',
        medio: 'Mensual',
        bajo: 'Semanal'
      },
      title: {
        alto: 'Posicionamiento Tridimensional (EASIEST + QUICKEST - OMNIEST)',
        medio: 'Estandarización y Calidad de Procesos Comerciales/Creativos',
        bajo: 'Calidad y Exactitud en los Entregables Comerciales'
      },
      meta: {
        alto: 'Meta: Disponibilidad inmediata (Never Out), consolidación del servicio Fix y cero fricción omnicanal',
        medio: 'Meta: 100% de apego a estándares en planogramas, layouts, pautas de marca, catálogos o flujos e-commerce',
        bajo: 'Meta: Precisión técnica, estándar estético y rigor en propuestas B2B, piezas, publicaciones o precios'
      },
      text: {
        alto: {
          self: 'Garantizo los estándares macro de disponibilidad inmediata (Never Out), consolidación diferenciada del servicio "Fix" y cero fricción omnicanal.',
          supervisor: 'El colaborador garantiza los estándares macro de disponibilidad inmediata (Never Out), consolidación diferenciada del servicio "Fix" y cero fricción omnicanal.',
          peer: 'Mi compañero garantiza los estándares macro de disponibilidad inmediata (Never Out), consolidación diferenciada del servicio "Fix" y cero fricción omnicanal.',
          subordinate: 'Mi líder garantiza los estándares macro de disponibilidad inmediata (Never Out), consolidación diferenciada del servicio "Fix" y cero fricción omnicanal.'
        },
        medio: {
          self: 'Aseguro que las ejecuciones a mi cargo (planogramas, layouts, pautas de marca, catálogos B2B o flujos de E-commerce) cumplan al 100% con los estándares aprobados.',
          supervisor: 'El colaborador asegura que las ejecuciones a su cargo (planogramas, layouts, pautas de marca, catálogos B2B o flujos de E-commerce) cumplan al 100% con los estándares aprobados.',
          peer: 'Mi compañero asegura que las ejecuciones a su cargo (planogramas, layouts, pautas de marca, catálogos B2B o flujos de E-commerce) cumplan al 100% con los estándares aprobados.',
          subordinate: 'Mi líder asegura que las ejecuciones a su cargo (planogramas, layouts, pautas de marca, catálogos B2B o flujos de E-commerce) cumplan al 100% con los estándares aprobados.'
        },
        bajo: {
          self: 'Garantizo la precisión técnica, fidelidad de la información o estándar estético/comercial en mis entregables (propuestas B2B, piezas visuales, publicaciones, precios o diagnósticos).',
          supervisor: 'El colaborador garantiza la precisión técnica, fidelidad de la información o estándar estético/comercial en sus entregables (propuestas B2B, piezas visuales, publicaciones, precios o diagnósticos).',
          peer: 'Mi compañero garantiza la precisión técnica, fidelidad de la información o estándar estético/comercial en sus entregables (propuestas B2B, piezas visuales, publicaciones, precios o diagnósticos).',
          subordinate: 'El colaborador garantiza la precisión técnica, fidelidad de la información o estándar estético/comercial en sus entregables (propuestas B2B, piezas visuales, publicaciones, precios o diagnósticos).'
        }
      }
    },
    {
      id: 'com_kpi_3',
      frequency: {
        alto: 'Trimestral',
        medio: 'Semanal',
        bajo: 'Diario'
      },
      title: {
        alto: 'Reclasificación del Portafolio y Layouts por Cluster',
        medio: 'Omnicanalidad y Eliminación de Fricciones (OMNIEST)',
        bajo: 'Agilidad en la Respuesta y Atención al Cliente (QUICKEST/EASIEST)'
      },
      meta: {
        alto: 'Meta: 100% de reclasificación de portafolio y maximización de rentabilidad del espacio comercial nacional',
        medio: 'Meta: Fluidez de integración física-digital-Fix resolviendo brechas operativas entre canales',
        bajo: 'Meta: Tiempos de respuesta ágiles en chats, cotizaciones, entrega de artes o soporte postventa sin demoras'
      },
      text: {
        alto: {
          self: 'Respondo por el hito estratégico de reclasificación al 100% del portafolio y la optimización de la rentabilidad del espacio comercial a nivel nacional.',
          supervisor: 'El colaborador responde por el hito estratégico de reclasificación al 100% del portafolio y la optimización de la rentabilidad del espacio comercial a nivel nacional.',
          peer: 'Mi compañero responde por el hito estratégico de reclasificación al 100% del portafolio y la optimización de la rentabilidad del espacio comercial a nivel nacional.',
          subordinate: 'Mi líder responde por el hito estratégico de reclasificación al 100% del portafolio y la optimización de la rentabilidad del espacio comercial a nivel nacional.'
        },
        medio: {
          self: 'Monitoreo la fluidez de integración entre canales digitales, tiendas físicas y servicios técnicos, resolviendo brechas operativas entre las distintas plataformas.',
          supervisor: 'El colaborador monitorea la fluidez de integración entre canales digitales, tiendas físicas y servicios técnicos, resolviendo brechas operativas entre las distintas plataformas.',
          peer: 'Mi compañero monitorea la fluidez de integración entre canales digitales, tiendas físicas y servicios técnicos, resolviendo brechas operativas entre las distintas plataformas.',
          subordinate: 'Mi líder monitorea la fluidez de integración entre canales digitales, tiendas físicas y servicios técnicos, resolviendo brechas operativas entre las distintas plataformas.'
        },
        bajo: {
          self: 'Mantengo tiempos de respuesta ágiles ante requerimientos de clientes internos o externos (atención de chats, cotizaciones, entrega de artes o soporte postventa), reduciendo esperas.',
          supervisor: 'El colaborador mantiene tiempos de respuesta ágiles ante requerimientos de clientes internos o externos (atención de chats, cotizaciones, entrega de artes o soporte postventa), reduciendo esperas.',
          peer: 'Mi compañero mantiene tiempos de respuesta ágiles ante requerimientos de clientes internos o externos (atención de chats, cotizaciones, entrega de artes o soporte postventa), reduciendo esperas.',
          subordinate: 'El colaborador mantiene tiempos de respuesta ágiles ante requerimientos de clientes internos o externos (atención de chats, cotizaciones, entrega de artes o soporte postventa), reduciendo esperas.'
        }
      }
    },
    {
      id: 'com_kpi_4',
      frequency: {
        alto: 'Mensual',
        medio: 'Semanal',
        bajo: 'Semanal'
      },
      title: {
        alto: 'LTV, Fidelización y Capilaridad de Expansión Territorial',
        medio: 'Avance y Despliegue de Proyectos Específicos',
        bajo: 'Soporte al Impulso del Portafolio y Campañas'
      },
      meta: {
        alto: 'Meta: Crecimiento de LTV con servicios agregados y apertura oportuna de tiendas en plazas clave',
        medio: 'Meta: Ejecución en tiempo y alcance de proyectos asignados (lanzamientos, alianzas, rediseños o integraciones)',
        bajo: 'Meta: Oportunidad en promociones, actualización de catálogo, alianzas o servicios de valor agregado'
      },
      text: {
        alto: {
          self: 'Garantizo el incremento del valor de vida del cliente (LTV) mediante servicios agregados y aseguro la apertura oportuna de tiendas en territorios clave.',
          supervisor: 'El colaborador garantiza el incremento del valor de vida del cliente (LTV) mediante servicios agregados y asegura la apertura oportuna de tiendas en territorios clave.',
          peer: 'Mi compañero garantiza el incremento del valor de vida del cliente (LTV) mediante servicios agregados y asegura la apertura oportuna de tiendas en territorios clave.',
          subordinate: 'Mi líder garantiza el incremento del valor de vida del cliente (LTV) mediante servicios agregados y asegura la apertura oportuna de tiendas en territorios clave.'
        },
        medio: {
          self: 'Controlo la ejecución a tiempo de los proyectos a mi cargo (lanzamientos de categoría, alianzas, rediseño de espacios, promociones o integraciones).',
          supervisor: 'El colaborador controla la ejecución a tiempo de los proyectos a su cargo (lanzamientos de categoría, alianzas, rediseño de espacios, promociones o integraciones).',
          peer: 'Mi compañero controla la ejecución a tiempo de los proyectos a su cargo (lanzamientos de categoría, alianzas, rediseño de espacios, promociones o integraciones).',
          subordinate: 'Mi líder controla la ejecución a tiempo de los proyectos a su cargo (lanzamientos de categoría, alianzas, rediseño de espacios, promociones o integraciones).'
        },
        bajo: {
          self: 'Ejecuto con oportunidad las tareas operativas asignadas para el lanzamiento de promociones, actualización de catálogo, alianzas o servicios de valor agregado.',
          supervisor: 'El colaborador ejecuta con oportunidad las tareas operativas asignadas para el lanzamiento de promociones, actualización de catálogo, alianzas o servicios de valor agregado.',
          peer: 'Mi compañero ejecuta con oportunidad las tareas operativas asignadas para el lanzamiento de promociones, actualización de catálogo, alianzas o servicios de valor agregado.',
          subordinate: 'El colaborador ejecuta con oportunidad las tareas operativas asignadas para el lanzamiento de promociones, actualización de catálogo, alianzas o servicios de valor agregado.'
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
      id: 'com_cond_1',
      title: {
        alto: 'Trabajo en Equipo C-Suite y Alineación Organizacional',
        medio: 'Liderazgo de Equipos Multidisciplinarios y Colaboración',
        bajo: 'Trabajo en Equipo y Sinergia Interdisciplinaria'
      },
      text: {
        alto: {
          self: 'Lidero la integración estratégica entre Comercial, Operaciones, Finanzas y Logística para maximizar la rentabilidad de la marca.',
          supervisor: 'El colaborador lidera la integración estratégica entre Comercial, Operaciones, Finanzas y Logística para maximizar la rentabilidad de la marca.',
          peer: 'Mi compañero lidera la integración estratégica entre Comercial, Operaciones, Finanzas y Logística para maximizar la rentabilidad de la marca.',
          subordinate: 'Mi líder lidera la integración estratégica entre Comercial, Operaciones, Finanzas y Logística para maximizar la rentabilidad de la marca.'
        },
        medio: {
          self: 'Promuevo la sinergia activa entre creativos, analistas, ejecutivos de venta y áreas de soporte, resolviendo cuellos de botella con rapidez.',
          supervisor: 'El colaborador promueve la sinergia activa entre creativos, analistas, ejecutivos de venta y áreas de soporte, resolviendo cuellos de botella con rapidez.',
          peer: 'Mi compañero promueve la sinergia activa entre creativos, analistas, ejecutivos de venta y áreas de soporte, resolviendo cuellos de botella con rapidez.',
          subordinate: 'Mi líder promueve la sinergia activa entre creativos, analistas, ejecutivos de venta y áreas de soporte, resolviendo cuellos de botella con rapidez.'
        },
        bajo: {
          self: 'Colaboro activamente con compañeros de mi área y otras coordinaciones (Ventas, Mercadeo, Operaciones, TI) compartiendo recursos e información para alcanzar las metas.',
          supervisor: 'El colaborador colabora activamente con compañeros de su área y otras coordinaciones (Ventas, Mercadeo, Operaciones, TI) compartiendo recursos e información para alcanzar las metas.',
          peer: 'Mi compañero colabora activamente con compañeros de su área y otras coordinaciones (Ventas, Mercadeo, Operaciones, TI) compartiendo recursos e información para alcanzar las metas.',
          subordinate: 'El colaborador colabora activamente con compañeros de su área y otras coordinaciones (Ventas, Mercadeo, Operaciones, TI) compartiendo recursos e información para alcanzar las metas.'
        }
      }
    },
    {
      id: 'com_cond_2',
      title: {
        alto: 'Flexibilidad y Liderazgo Transformacional ante el Dinamismo',
        medio: 'Flexibilidad Táctica ante Cambios de Mercado',
        bajo: 'Flexibilidad y Adaptabilidad al Dinamismo Comercial'
      },
      text: {
        alto: {
          self: 'Imprimo velocidad, adaptabilidad y visión de innovación en toda la dirección para responder al ritmo acelerado del negocio retail.',
          supervisor: 'El colaborador imprime velocidad, adaptabilidad y visión de innovación en toda la dirección para responder al ritmo acelerado del negocio retail.',
          peer: 'Mi compañero imprime velocidad, adaptabilidad y visión de innovación en toda la dirección para responder al ritmo acelerado del negocio retail.',
          subordinate: 'Mi líder imprime velocidad, adaptabilidad y visión de innovación en toda la dirección para responder al ritmo acelerado del negocio retail.'
        },
        medio: {
          self: 'Adapto con agilidad los planes comerciales, creativos o de pricing ante movimientos de la competencia o ajustes en el plan del negocio.',
          supervisor: 'El colaborador adapta con agilidad los planes comerciales, creativos o de pricing ante movimientos de la competencia o ajustes en el plan del negocio.',
          peer: 'Mi compañero adapta con agilidad los planes comerciales, creativos o de pricing ante movimientos de la competencia o ajustes en el plan del negocio.',
          subordinate: 'Mi líder adapta con agilidad los planes comerciales, creativos o de pricing ante movimientos de la competencia o ajustes en el plan del negocio.'
        },
        bajo: {
          self: 'Demuestro apertura, rapidez de ajuste y actitud positiva frente a cambios frecuentes en prioridades, promociones, precios o campañas de la empresa.',
          supervisor: 'El colaborador demuestra apertura, rapidez de ajuste y actitud positiva frente a cambios frecuentes en prioridades, promociones, precios o campañas de la empresa.',
          peer: 'Mi compañero demuestra apertura, rapidez de ajuste y actitud positiva frente a cambios frecuentes en prioridades, promociones, precios o campañas de la empresa.',
          subordinate: 'El colaborador demuestra apertura, rapidez de ajuste y actitud positiva frente a cambios frecuentes en prioridades, promociones, precios o campañas de la empresa.'
        }
      }
    },
    {
      id: 'com_cond_3',
      title: {
        alto: 'Estrategia Omnicanal y Blindaje Competitivo',
        medio: 'Acompañamiento y Desarrollo del Talento a su Cargo',
        bajo: 'Eliminación de Fricciones en la Experiencia del Usuario'
      },
      text: {
        alto: {
          self: 'Diseño el ecosistema comercial (Fix, App, Web, Tiendas, B2B) blindando a la marca frente a la competencia tradicional o informal.',
          supervisor: 'El colaborador diseña el ecosistema comercial (Fix, App, Web, Tiendas, B2B) blindando a la marca frente a la competencia tradicional o informal.',
          peer: 'Mi compañero diseña el ecosistema comercial (Fix, App, Web, Tiendas, B2B) blindando a la marca frente a la competencia tradicional o informal.',
          subordinate: 'Mi líder diseña el ecosistema comercial (Fix, App, Web, Tiendas, B2B) blindando a la marca frente a la competencia tradicional o informal.'
        },
        medio: {
          self: 'Oriento y capacito constantemente a mi equipo en estándares técnicos, herramientas creativas/analíticas y cultura de servicio.',
          supervisor: 'El colaborador orienta y capacita constantemente a su equipo en estándares técnicos, herramientas creativas/analíticas y cultura de servicio.',
          peer: 'Mi compañero orienta y capacita constantemente a su equipo en estándares técnicos, herramientas creativas/analíticas y cultura de servicio.',
          subordinate: 'Mi líder orienta y capacita constantemente a su equipo en estándares técnicos, herramientas creativas/analíticas y cultura de servicio.'
        },
        bajo: {
          self: 'Cuido los detalles en mis tareas para asegurar que la interacción del cliente con la marca (en tienda física, web, redes o servicio técnico) sea fluida y sin trabas.',
          supervisor: 'El colaborador cuida los detalles en sus tareas para asegurar que la interacción del cliente con la marca (en tienda física, web, redes o servicio técnico) sea fluida y sin trabas.',
          peer: 'Mi compañero cuida los detalles en sus tareas para asegurar que la interacción del cliente con la marca (en tienda física, web, redes o servicio técnico) sea fluida y sin trabas.',
          subordinate: 'El colaborador cuida los detalles en sus tareas para asegurar que la interacción del cliente con la marca (en tienda física, web, redes o servicio técnico) sea fluida y sin trabas.'
        }
      }
    },
    {
      id: 'com_cond_4',
      title: {
        alto: 'Cultura de Alto Desempeño y Orientación al Cliente',
        medio: 'Enfoque en la Rentabilidad y Eficiencia del Espacio/Recursos',
        bajo: 'Rigor, Orden y Responsabilidad en la Gestión'
      },
      text: {
        alto: {
          self: 'Fomento institucionalmente una cultura volcada a la facilidad de compra, rapidez de respuesta y fidelización sostenida.',
          supervisor: 'El colaborador fomenta institucionalmente una cultura volcada a la facilidad de compra, rapidez de respuesta y fidelización sostenida.',
          peer: 'Mi compañero fomenta institucionalmente una cultura volcada a la facilidad de compra, rapidez de respuesta y fidelización sostenida.',
          subordinate: 'Mi líder fomenta institucionalmente una cultura volcada a la facilidad de compra, rapidez de respuesta y fidelización sostenida.'
        },
        medio: {
          self: 'Superviso la optimización de los recursos o espacios comerciales asignados para maximizar su rendimiento y valor percibido.',
          supervisor: 'El colaborador supervisa la optimización de los recursos o espacios comerciales asignados para maximizar su rendimiento y valor percibido.',
          peer: 'Mi compañero supervisa la optimización de los recursos o espacios comerciales asignados para maximizar su rendimiento y valor percibido.',
          subordinate: 'Mi líder supervisa la optimización de los recursos o espacios comerciales asignados para maximizar su rendimiento y valor percibido.'
        },
        bajo: {
          self: 'Reviso minuciosamente mi trabajo antes de entregarlo o publicarlo, demostrando alto compromiso (ownership) con los resultados de mi puesto.',
          supervisor: 'El colaborador revisa minuciosamente su trabajo antes de entregarlo o publicarlo, demostrando alto compromiso (ownership) con los resultados de su puesto.',
          peer: 'Mi compañero revisa minuciosamente su trabajo antes de entregarlo o publicarlo, demostrando alto compromiso (ownership) con los resultados de su puesto.',
          subordinate: 'El colaborador revisa minuciosamente su trabajo antes de entregarlo o publicarlo, demostrando alto compromiso (ownership) con los resultados de su puesto.'
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
      id: 'com_strat_1',
      title: {
        alto: 'Dirección de Planes Estratégicos de Contingencia Comercial',
        medio: 'Análisis de Causa Raíz ante Desviaciones de Metas',
        bajo: 'Conciencia del Impacto en los Ingresos y Marca'
      },
      text: {
        alto: {
          self: 'Diseño y apruebo reestructuraciones de precios, portafolio o canales ante desviaciones macro en las metas de facturación o margen.',
          supervisor: 'El colaborador diseña y aprueba reestructuraciones de precios, portafolio o canales ante desviaciones macro en las metas de facturación o margen.',
          peer: 'Mi compañero diseña y aprueba reestructuraciones de precios, portafolio o canales ante desviaciones macro en las metas de facturación o margen.',
          subordinate: 'Mi líder diseña y aprueba reestructuraciones de precios, portafolio o canales ante desviaciones macro en las metas de facturación o margen.'
        },
        medio: {
          self: 'Cuando una categoría, campaña o proyecto no alcanza los resultados esperados, lidero el diagnóstico con el equipo y estructuro un plan de remediación inmediato.',
          supervisor: 'El colaborador, cuando una categoría, campaña o proyecto no alcanza los resultados esperados, lidera el diagnóstico con el equipo y estructura un plan de remediación inmediato.',
          peer: 'Mi compañero, cuando una categoría, campaña o proyecto no alcanza los resultados esperados, lidera el diagnóstico con el equipo y estructura un plan de remediación inmediato.',
          subordinate: 'Mi líder, cuando una categoría, campaña o proyecto no alcanza los resultados esperados, lidera el diagnóstico con el equipo y estructura un plan de remediación inmediato.'
        },
        bajo: {
          self: 'Comprendo claramente cómo mi trabajo diario (diseño, venta, contenido, atención o análisis) impacta la facturación y la reputación de la empresa.',
          supervisor: 'El colaborador comprende claramente cómo su trabajo diario (diseño, venta, contenido, atención o análisis) impacta la facturación y la reputación de la empresa.',
          peer: 'Mi compañero comprende claramente cómo su trabajo diario (diseño, venta, contenido, atención o análisis) impacta la facturación y la reputación de la empresa.',
          subordinate: 'El colaborador comprende claramente cómo su trabajo diario (diseño, venta, contenido, atención o análisis) impacta la facturación y la reputación de la empresa.'
        }
      }
    },
    {
      id: 'com_strat_2',
      title: {
        alto: 'Alineación con el Plan de Crecimiento Nacional',
        medio: 'Alineación con la Estrategia de Crecimiento y Expansión',
        bajo: 'Respuesta Eficiente ante Inconvenientes u Omisiones'
      },
      text: {
        alto: {
          self: 'Garantizo que la estrategia comercial y de Category Management respalde de forma fluida el plan de capilaridad y expansión de la empresa.',
          supervisor: 'El colaborador garantiza que la estrategia comercial y de Category Management respalde de forma fluida el plan de capilaridad y expansión de la empresa.',
          peer: 'Mi compañero garantiza que la estrategia comercial y de Category Management respalde de forma fluida el plan de capilaridad y expansión de la empresa.',
          subordinate: 'Mi líder garantiza que la estrategia comercial y de Category Management respalde de forma fluida el plan de capilaridad y expansión de la empresa.'
        },
        medio: {
          self: 'Aseguro que los entregables de mi equipo respalden oportunamente las fechas de apertura de tiendas y campañas nacionales.',
          supervisor: 'El colaborador asegura que los entregables de su equipo respalden oportunamente las fechas de apertura de tiendas y campañas nacionales.',
          peer: 'Mi compañero asegura que los entregables de su equipo respalden oportunamente las fechas de apertura de tiendas y campañas nacionales.',
          subordinate: 'Mi líder asegura que los entregables de su equipo respalden oportunamente las fechas de apertura de tiendas y campañas nacionales.'
        },
        bajo: {
          self: 'Ante un error o retraso en mi entrega (pieza gráfica con errata, fallo de precio, atraso en atención), notifico de inmediato y ejecuto correcciones en tiempo récord.',
          supervisor: 'El colaborador, ante un error o retraso en su entrega (pieza gráfica con errata, fallo de precio, atraso en atención), notifica de inmediato y ejecuta correcciones en tiempo récord.',
          peer: 'Mi compañero, ante un error o retraso en su entrega (pieza gráfica con errata, fallo de precio, atraso en atención), notifica de inmediato y ejecuta correcciones en tiempo récord.',
          subordinate: 'El colaborador, ante un error o retraso en su entrega (pieza gráfica con errata, fallo de precio, atraso en atención), notifica de inmediato y ejecuta correcciones en tiempo récord.'
        }
      }
    },
    {
      id: 'com_strat_3',
      title: {
        alto: 'Evaluación de Causas Estructurales de Margen',
        medio: 'Seguimiento Semanal a Planes de Corrección',
        bajo: 'Proactividad en la Propuesta de Valor'
      },
      text: {
        alto: {
          self: 'Analizo y corrijo ineficiencias en la cadena de valor comercial para proteger la ganancia operativa del negocio.',
          supervisor: 'El colaborador analiza y corrige ineficiencias en la cadena de valor comercial para proteger la ganancia operativa del negocio.',
          peer: 'Mi compañero analiza y corrige ineficiencias en la cadena de valor comercial para proteger la ganancia operativa del negocio.',
          subordinate: 'Mi líder analiza y corrige ineficiencias en la cadena de valor comercial para proteger la ganancia operativa del negocio.'
        },
        medio: {
          self: 'Mantengo control continuo sobre la ejecución de las mejoras acordadas post-evaluación o comités de seguimiento.',
          supervisor: 'El colaborador mantiene control continuo sobre la ejecución de las mejoras acordadas post-evaluación o comités de seguimiento.',
          peer: 'Mi compañero mantiene control continuo sobre la ejecución de las mejoras acordadas post-evaluación o comités de seguimiento.',
          subordinate: 'Mi líder mantiene control continuo sobre la ejecución de las mejoras acordadas post-evaluación o comités de seguimiento.'
        },
        bajo: {
          self: 'Propongo ideas o soluciones prácticas en mi día a día para hacer más ágiles mis tareas o mejorar la atención y el atractivo de los productos.',
          supervisor: 'El colaborador propone ideas o soluciones prácticas en su día a día para hacer más ágiles sus tareas o mejorar la atención y el atractivo de los productos.',
          peer: 'Mi compañero propone ideas o soluciones prácticas en su día a día para hacer más ágiles sus tareas o mejorar la atención y el atractivo de los productos.',
          subordinate: 'El colaborador propone ideas o soluciones prácticas en su día a día para hacer más ágiles sus tareas o mejorar la atención y el atractivo de los productos.'
        }
      }
    }
  ];

  // =========================================================================================
  // SUB-BLOQUE 4: FEEDBACK CUALITATIVO
  // =========================================================================================
  const feedbackConfig = {
    alto: {
      reconocimientosLabel: 'Reconocimientos (Decisiones de Portafolio, Omnicanalidad y Margen)',
      reconocimientosPrompt: '¿Qué decisiones estratégicas de portafolio, posicionamiento omnicanal o margen de contribución destacaron en la gestión?',
      compromisosLabel: 'Compromisos de Mejora Estratégica',
      compromisosPrompt: 'Defina de 1 a 3 compromisos estratégicos para fortalecer la rentabilidad por metro cuadrado, la fidelización o la expansión territorial.'
    },
    medio: {
      reconocimientosLabel: 'Reconocimientos (Liderazgo de Proyectos y Resultados de Categoría)',
      reconocimientosPrompt: '¿Qué logros en liderazgo de proyectos, optimización de flujos o resultados de categoría destacaron en el periodo?',
      compromisosLabel: 'Compromisos de Mejora Táctica',
      compromisosPrompt: 'Defina de 1 a 3 compromisos tácticos sobre tiempos de respuesta del equipo, estandarización o gestión de causas raíz.'
    },
    bajo: {
      reconocimientosLabel: 'Reconocimientos (Calidad Gráfica, Agilidad y Ventas)',
      reconocimientosPrompt: '¿Qué aportes en calidad gráfica, agilidad de respuesta, ventas o trabajo en equipo destacaron en el periodo?',
      compromisosLabel: 'Compromisos de Mejora Operativa',
      compromisosPrompt: 'Defina de 1 a 3 compromisos concretos en tiempos de entrega, precisión de datos o adaptabilidad para el siguiente ciclo.'
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

  const totalQuestions = sub1Items.length + sub2Items.length + sub3Items.length;
  const answeredQuestions = sub1Scores.length + sub2Scores.length + sub3Scores.length;

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
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}>
              Dirección Comercial
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Evaluación de metas comerciales, volumen, márgenes y calidad en el período.
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
            <Target size={16} className="text-[#F1B400]" />
            <h3 className={`text-xs font-black uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Sub-bloque 1: KPIs y Objetivos Operativos Medibles
            </h3>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Evaluación transversal sobre volumen comercial, calidad estética/técnica, agilidad de respuesta e impulso del portafolio.
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
            Frecuencia observable en sinergia interdisciplinaria, adaptabilidad al dinamismo comercial, experiencia sin fricción y rigor.
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
            Conciencia de impacto en ingresos y marca, respuesta inmediata ante contingencias y alineación con la expansión retail.
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

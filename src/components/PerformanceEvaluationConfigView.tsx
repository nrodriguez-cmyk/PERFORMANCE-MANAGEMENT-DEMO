import React, { useState, useEffect } from 'react';
import {
  Building2, Users, User, UserCheck, ShieldCheck, Award, Sliders, Edit3, Plus,
  Trash2, Save, RotateCcw, CheckCircle2, ChevronRight, AlertCircle, Info, Sparkles,
  Layers, Check, Eye, HelpCircle, Briefcase, Target, Brain, Calendar, Clock, Lock, Unlock
} from 'lucide-react';
import { getCurrentSession, isMasterAdministrator } from '../services/authService';
import {
  getGlobalEvaluationStatus,
  setGlobalEvaluationStatus,
  setEvaluationSchedule,
  formatScheduleDateTime,
  evaluateScheduleOpenness,
  GlobalEvaluationStatus
} from '../utils/evaluationStatus';
import { Question } from '../types';
import { EvaluationPositionsManager } from './EvaluationPositionsManager';

export type EvalTypeKey = 'self' | 'supervisor' | 'peer' | 'subordinate';

export interface DirectionConfig {
  id: string;
  name: string;
  code: string;
  director: string;
  gerencias: string[];
  specificCompetencies: {
    id: string;
    name: string;
    description: string;
    situations: string;
    levels: {
      A: string; // Nivel Superior (5.00)
      B: string; // Nivel Alto (3.75)
      C: string; // Nivel Intermedio (2.50)
      D: string; // Nivel Mínimo (1.25)
    };
  }[];
  kpis: {
    id: string;
    name: string;
    description: string;
    weight: number;
    target: string;
  }[];
}

// 8 DIRECCIONES OFICIALES SEGÚN ORGANIGRAMAS CORPORATIVOS 2026
export const OFFICIAL_DIRECTIONS: DirectionConfig[] = [
  {
    id: 'operaciones',
    name: 'Dirección de Operaciones (Red de Tiendas)',
    code: 'DTH-DG-OG-006',
    director: 'Luis González',
    gerencias: [
      'Gerencia de Operaciones (Red de Tiendas Nacional)',
      'Supervisión de Gestión Operativa (Oficina)'
    ],
    specificCompetencies: [
      {
        id: 'op-comp-1',
        name: 'Gestión de Indicadores de Tienda y Merma',
        description: 'Capacidad para controlar la merma, garantizar el inventario exacto y alcanzar las metas de venta diarias en piso de venta.',
        situations: 'Auditoría de inventario físico sorpresiva con discrepancias en calzado o marroquinería.',
        levels: {
          A: 'Diseña estrategias preventivas de merma cero y lidera la tienda al 100% de la meta de venta.',
          B: 'Monitorea activamente inventarios y minimiza desviaciones operativas con su equipo.',
          C: 'Registra y reporta inconsistencias de inventario en el sistema siguiendo las pautas.',
          D: 'Ejecuta el conteo físico básico y requiere supervisión constante para el control de stock.'
        }
      },
      {
        id: 'op-comp-2',
        name: 'Visual Merchandising y Estándares de Exhibición',
        description: 'Implementación impecable del manual de vitrinismo, iluminación, exhibición y orden comercial de la marca.',
        situations: 'Recepción de nueva colección de temporada para montaje en vitrinas y exhibidores centrales.',
        levels: {
          A: 'Crea propuestas de exhibición de alto impacto que incrementan la rotación de producto.',
          B: 'Asegura que el 100% de la tienda cumpla con las normativas de visual merchandising.',
          C: 'Mantiene las vitrinas y exhibiciones ordenadas según las guías recibidas.',
          D: 'Acomoda producto según instrucciones directas sin iniciativa de diseño visual.'
        }
      },
      {
        id: 'op-comp-3',
        name: 'Atención Integral al Cliente y Servicio en Tienda',
        description: 'Capacidad de asesorar al cliente con empatía, cortesía y conocimiento del catálogo para garantizar el cierre de venta.',
        situations: 'Atención a cliente insatisfecho por cambio de talla o garantía de producto en hora pico.',
        levels: {
          A: 'Convierte quejas en clientes fidelizados y es referente en protocolo de atención de excelencia.',
          B: 'Resuelve objeciones con agilidad y asesora al cliente asegurando venta cruzada.',
          C: 'Atiende amablemente y brinda información básica de productos y métodos de pago.',
          D: 'Cumple el protocolo de saludo pero requiere apoyo de un superior ante dudas del cliente.'
        }
      }
    ],
    kpis: [
      { id: 'kpi-op-1', name: 'Cumplimiento del Presupuesto de Ventas en Tienda', description: 'Porcentaje de ventas alcanzado vs. presupuesto mensual asignado', weight: 40, target: '>= 100%' },
      { id: 'kpi-op-2', name: 'Control de Merma y Pérdida de Stock', description: 'Porcentaje de pérdida física en inventarios cíclicos', weight: 30, target: '< 0.5%' },
      { id: 'kpi-op-3', name: 'Calificación de Auditoría Operativa y Check-List', description: 'Puntuación en cumplimiento de apertura, caja y vitrina', weight: 30, target: '>= 95 pts' }
    ]
  },
  {
    id: 'talento_humano',
    name: 'Dirección de Talento Humano',
    code: 'DTH-DG-OG-001',
    director: 'Jeanette Arvelo',
    gerencias: [
      'Gerencia de Formación y Desarrollo',
      'Gerencia de Reclutamiento y Selección',
      'Gerencia de Gestión Operativa TH Zona 1',
      'Gerencia de Gestión Operativa TH Zona 2',
      'Gerencia de Eventos y Patrocinios',
      'Gerencia de Nómina y Beneficios'
    ],
    specificCompetencies: [
      {
        id: 'th-comp-1',
        name: 'Gestión por Competencias y Desarrollo Organizacional',
        description: 'Capacidad para diseñar, evaluar y acompañar planes de formación, brechas de talento y planes de sucesión.',
        situations: 'Diseño del programa anual de formación técnica y calibración de desempeño corporativo.',
        levels: {
          A: 'Lidera la estrategia integral de talento humano alineada al crecimiento de la empresa.',
          B: 'Ejecuta diagnósticos de necesidades de capacitación y calibraciones de evaluación con rigor.',
          C: 'Aplica instrumentos de evaluación y consolida matrices de seguimiento según la metodología.',
          D: 'Brinda apoyo administrativo en convocatorias y logística de talleres formativos.'
        }
      },
      {
        id: 'th-comp-2',
        name: 'Relaciones Laborales y Cumplimiento Normativo (LOTTT)',
        description: 'Aplicación ética y rigurosa del marco legal laboral venezolano, solvencias y gestión preventiva de clima.',
        situations: 'Manejo de terminación de relación laboral o mediación en conflicto departamental.',
        levels: {
          A: 'Diseña políticas laborales preventivas de blindaje legal total sin litigios para la empresa.',
          B: 'Resuelve mediaciones laborales y reclamos de colaboradores con apego a la ley y respeto mutuo.',
          C: 'Tramita expedientes, amonestaciones y liquidaciones cumpliendo con los plazos normativos.',
          D: 'Archiva y archiva expedientes físicos y digitales de colaboradores bajo supervisión.'
        }
      },
      {
        id: 'th-comp-3',
        name: 'Gestión de Compensación, Nómina y Beneficios',
        description: 'Exactitud en cálculos de nómina quincenal, horas extras, comisiones por ventas y liquidaciones.',
        situations: 'Cierre de nómina quincenal con ajustes de comisiones de red de tiendas nacional.',
        levels: {
          A: 'Diseña esquemas de incentivos variables y optimiza la estructura salarial corporativa.',
          B: 'Audita y procesa la nómina nacional sin margen de error y en los tiempos estipulados.',
          C: 'Carga incidencias, asistencias biométricas y reposos en el sistema Odoo Nómina.',
          D: 'Revisa marcajes de reloj y apoya en la verificación de constancias laborales.'
        }
      }
    ],
    kpis: [
      { id: 'kpi-th-1', name: 'Cobertura de Vacantes y Tiempo de Contratación', description: 'Días promedio para cubrir posiciones críticas en tienda y oficina', weight: 35, target: '<= 15 días' },
      { id: 'kpi-th-2', name: 'Efectividad del Plan Anual de Formación', description: 'Porcentaje de colaboradores con PDI ejecutado y reevaluado a 90 días', weight: 35, target: '>= 90%' },
      { id: 'kpi-th-3', name: 'Exactitud y Puntualidad en Procesamiento de Nómina', description: 'Tasa de nómina procesada a tiempo y sin reclamos', weight: 30, target: '100%' }
    ]
  },
  {
    id: 'tecnologia',
    name: 'Dirección de Tecnología de la Información (TI)',
    code: 'DTH-DG-OG-009',
    director: 'Harold Veracierta',
    gerencias: [
      'Gerencia Corporativa de Transformación Digital (PMO)',
      'Gerencia de Servicios Tecnológicos (Help Desk)',
      'Gerencia de Operaciones Retail',
      'Gerencia de Soluciones Tecnológicas',
      'Gerencia de Desarrollo (Odoo)',
      'Gerencia de Infraestructura y Cloud'
    ],
    specificCompetencies: [
      {
        id: 'ti-comp-1',
        name: 'Dominio de Ecosistemas ERP, Odoo y Desarrollo',
        description: 'Capacidad de programar, personalizar módulos y optimizar la base de datos empresarial.',
        situations: 'Implementación de nueva pasarela de pago o módulo de inventario en Odoo ERP.',
        levels: {
          A: 'Arquitectura y diseña soluciones tecnológicas escalables con mínimo tiempo de caída.',
          B: 'Desarrolla flujos, integraciones de API y reportes complejos con estándares de código limpio.',
          C: 'Corrige errores en producción y realiza pruebas unitarias de software con supervisión.',
          D: 'Registra tareas en Jira/PMO y documenta cambios técnicos básicos.'
        }
      },
      {
        id: 'ti-comp-2',
        name: 'Soporte a Red de Tiendas y SLA de Help Desk',
        description: 'Velocidad de atención y resolución de incidentes en puntos de venta, impresoras fiscales y redes.',
        situations: 'Falla masiva de conectividad en terminales de caja de tienda en fin de semana.',
        levels: {
          A: 'Implementa contingencias automatizadas y monitoreo proactivo que previene caídas de tienda.',
          B: 'Resuelve tickets críticos de tiendas en menos de 30 minutos garantizando la operatividad.',
          C: 'Atiende llamadas de soporte de primer nivel y guía al usuario en reinicio y validaciones.',
          D: 'Deriva tickets al segundo nivel de soporte sin diagnosticar la causa raíz.'
        }
      },
      {
        id: 'ti-comp-3',
        name: 'Ciberseguridad, Continuidad y Respaldo Cloud',
        description: 'Protección de datos institucionales, políticas de contraseñas y respaldo de servidores.',
        situations: 'Alerta de intento de intrusión o corrupción de respaldos en base de datos PostgreSQL.',
        levels: {
          A: 'Establece políticas de seguridad perimetral y planes de contingencia ante desastres.',
          B: 'Verifica la integridad de backups diarios y gestiona accesos y roles con rigor.',
          C: 'Monitorea el uso de licencias y el estado de servidores y redes locales.',
          D: 'Aplica parches de seguridad y antivirus siguiendo la guía estandarizada.'
        }
      }
    ],
    kpis: [
      { id: 'kpi-ti-1', name: 'Disponibilidad de Sistemas Críticos (Uptime POS/ERP)', description: 'Porcentaje de tiempo en línea de terminales de venta y ERP', weight: 40, target: '>= 99.5%' },
      { id: 'kpi-ti-2', name: 'Cumplimiento del SLA de Soporte Técnico', description: 'Porcentaje de tickets de soporte resueltos dentro del SLA fijado', weight: 30, target: '>= 92%' },
      { id: 'kpi-ti-3', name: 'Avance de Proyectos de Transformación Digital', description: 'Hitos completados en plazo según cronograma de PMO', weight: 30, target: '>= 90%' }
    ]
  },
  {
    id: 'transporte_logistica',
    name: 'Dirección de Transporte y Logística',
    code: 'DTH-DG-OG-010',
    director: 'Gabriel Saavedra',
    gerencias: [
      'Gerencia de Transporte y Logística (Almacén CENDIS Guarenas)',
      'Supervisión de Almacén',
      'Supervisión de Logística Inversa (Garantías)',
      'Supervisión de Picking',
      'Supervisión de Despacho y Flota Nacional'
    ],
    specificCompetencies: [
      {
        id: 'log-comp-1',
        name: 'Gestión de Almacenes, WMS y Control de Ubicaciones',
        description: 'Optimización de espacio físico, trazabilidad por código de barra y bulto cerrado.',
        situations: 'Recepción de contenedor con 50.000 pares de calzado para estibado en rack de CENDIS.',
        levels: {
          A: 'Optimiza el layout del almacén reduciendo un 25% el tiempo de recorrido de operarios.',
          B: 'Garantiza la exactitud en el estibado y asignación de ubicaciones en el sistema WMS.',
          C: 'Ubica mercancía según la orden de entrada y valida etiquetas de bultos cerrados.',
          D: 'Traslada bultos de un punto a otro según instrucciones directas del coordinador.'
        }
      },
      {
        id: 'log-comp-2',
        name: 'Precisión en Picking, Embalaje y Cero Errores',
        description: 'Armado de despachos por tienda con verificación exacta de tallas, colores y modelos.',
        situations: 'Preparación de despachos urgentes para 20 tiendas en época navideña.',
        levels: {
          A: 'Lidera la brigada de picking con cero errores de despacho y velocidad récord.',
          B: 'Verifica meticulosamente las listas de picking evitando sobrantes o faltantes en tiendas.',
          C: 'Recoge los productos del rack siguiendo la ruta asignada y empaca en cajas de tránsito.',
          D: 'Pega precintos de seguridad y estiba cajas en paletas para embalaje.'
        }
      },
      {
        id: 'log-comp-3',
        name: 'Rutas de Distribución y Seguridad en Transporte',
        description: 'Cumplimiento de itinerarios de flota, custodia de carga y mantenimiento de vehículos.',
        situations: 'Envío terrestre hacia tiendas de Occidente y Los Andes con alertas viales.',
        levels: {
          A: 'Planifica rutas óptimas con ahorro de combustible y monitoreo GPS 24/7.',
          B: 'Supervisa el cargue y asegura la entrega en tienda en la ventana horaria pactada.',
          C: 'Conduce respetando límites de velocidad y realiza el check-list mecánico de la unidad.',
          D: 'Acompaña la carga y apoya en la descarga física en la puerta de la tienda.'
        }
      }
    ],
    kpis: [
      { id: 'kpi-log-1', name: 'Exactitud del Inventario CENDIS (IRA)', description: 'Índice de registro de inventario físico vs. sistema WMS', weight: 40, target: '>= 98%' },
      { id: 'kpi-log-2', name: 'Efectividad en Tiempos de Entrega a Tiendas (OTIF)', description: 'Despachos entregados a tiempo y completos según programación', weight: 35, target: '>= 95%' },
      { id: 'kpi-log-3', name: 'Índice de Reclamos por Despachos Incorrectos', description: 'Porcentaje de quejas de tiendas por fallas de empaque o producto', weight: 25, target: '< 1%' }
    ]
  },
  {
    id: 'administracion_finanzas',
    name: 'Dirección de Administración y Finanzas',
    code: 'DTH-DG-OG-004',
    director: 'Gustavo Arria',
    gerencias: [
      'Gerencia de Planificación Financiera',
      'Gerencia de Administración y Cuentas por Pagar',
      'Gerencia Corporativa de Tesorería y Cuentas por Cobrar',
      'Gerencia de Contabilidad',
      'Gerencia de Tributos y Gestión Fiscal'
    ],
    specificCompetencies: [
      {
        id: 'fin-comp-1',
        name: 'Gestión de Tesorería, Flujo de Caja y Divisas',
        description: 'Administración de disponibilidades bancarias, pagos a proveedores y control multimoneda (USD/VES).',
        situations: 'Asignación de fondos para pago urgente de importaciones y nómina simultánea.',
        levels: {
          A: 'Modela proyecciones de flujo de caja que protegen el valor del capital y aseguran liquidez.',
          B: 'Negocia condiciones de pago y mantiene conciliaciones bancarias al día sin partidas dudosas.',
          C: 'Registra transferencias, cobranzas y egresos en Odoo ERP con sus soportes.',
          D: 'Descarga estados de cuenta bancarios y organiza comprobantes contables.'
        }
      },
      {
        id: 'fin-comp-2',
        name: 'Blindaje Fiscal y Cumplimiento Tributario SENIAT',
        description: 'Presentación oportuna de declaraciones de IVA, ISLR, retenciones y deberes formales.',
        situations: 'Cierre fiscal mensual con auditoría impositiva y actualización de libro de ventas.',
        levels: {
          A: 'Estructura la planificación tributaria corporativa con cero multas y máximo beneficio legal.',
          B: 'Calcula y presenta declaraciones fiscales dentro de los calendarios oficiales.',
          C: 'Emite comprobantes de retención y verifica facturación según providencias SENIAT.',
          D: 'Archiva declaraciones y comprobantes físicos según los requerimientos de ley.'
        }
      },
      {
        id: 'fin-comp-3',
        name: 'Rigor Contable y Cierre de Estados Financieros',
        description: 'Aplicación de normas contables VEN-NIF, control de activos fijos y conciliaciones patrimoniales.',
        situations: 'Cierre contable de fin de mes y presentación de balance general a Presidencia.',
        levels: {
          A: 'Lidera auditorías externas y asegura la fiabilidad absoluta de los estados financieros.',
          B: 'Analiza variaciones presupuestarias y detecta desvíos de costos oportunamente.',
          C: 'Registra asientos contables de provisiones, amortizaciones y depreciaciones.',
          D: 'Digita facturas de compras y gastos de tienda en el módulo contable.'
        }
      }
    ],
    kpis: [
      { id: 'kpi-fin-1', name: 'Puntualidad en Cierre Contable y Financiero', description: 'Días hábiles posteriores al cierre de mes para emitir balance', weight: 40, target: '<= 5 días' },
      { id: 'kpi-fin-2', name: 'Cero Multas o Sanciones Tributarias', description: 'Cumplimiento del 100% de deberes formales y pago de tributos', weight: 35, target: '100% a tiempo' },
      { id: 'kpi-fin-3', name: 'Eficiencia en Conciliación Bancaria Diaria', description: 'Porcentaje de cuentas bancarias conciliadas al día siguiente', weight: 25, target: '>= 98%' }
    ]
  },
  {
    id: 'comercial',
    name: 'Dirección Comercial',
    code: 'DTH-DG-OG-005',
    director: 'Juan Pablo Layrisse',
    gerencias: [
      'Gerencia Corporativa de Desarrollo y Expansión',
      'Gerencia de Portafolio y Precio',
      'Gerencia de Infraestructura y Proyectos',
      'Gerencia de Desarrollo Comercial (B2B / SRC)',
      'Gerencia de Alianzas Comerciales',
      'Gerencia de Trade Marketing',
      'Gerencia de Servicio de Mercadeo',
      'Gerencia de Marketing',
      'Gerencia de E-Commerce'
    ],
    specificCompetencies: [
      {
        id: 'com-comp-1',
        name: 'Estrategia de Precios, Portafolio y Rentabilidad',
        description: 'Fijación de precios competitivos, análisis de elasticidad de la demanda y margen por línea de producto.',
        situations: 'Revisión de lista de precios frente a fluctuaciones cambiarias o campañas promocionales.',
        levels: {
          A: 'Diseña la arquitectura de precios maximizando el margen bruto y la participación de mercado.',
          B: 'Analiza márgenes de contribución por categoría y propone combos comerciales rentables.',
          C: 'Actualiza precios en el sistema de ventas y verifica consistencia en cajas registradoras.',
          D: 'Revisa etiquetas de precios físicas en tiendas según listados emitidos.'
        }
      },
      {
        id: 'com-comp-2',
        name: 'Marketing Omnicanal, Redes y Campañas BTL',
        description: 'Generación de tráfico a tiendas y web mediante activaciones, influencers y pauta digital.',
        situations: 'Lanzamiento de campaña del Día de la Madre y Black Friday.',
        levels: {
          A: 'Lidera campañas publicitarias de alto retorno sobre la inversión (ROAS) y posicionamiento de marca.',
          B: 'Coordina activaciones en tiendas, producción audiovisual y calendario de publicaciones.',
          C: 'Gestiona la comunidad digital respondiendo consultas y monitoreando interacciones.',
          D: 'Apoya en la toma de fotografías de producto y montaje de material pop.'
        }
      },
      {
        id: 'com-comp-3',
        name: 'Expansión de Negocios y Apertura de Nuevas Tiendas',
        description: 'Evaluación de locales en centros comerciales, layout y negociaciones de arrendamiento.',
        situations: 'Estudio de factibilidad para apertura de tienda en nuevo mall regional.',
        levels: {
          A: 'Identifica ubicaciones comerciales de alto tráfico con rápido retorno de inversión.',
          B: 'Supervisa el cronograma de adecuación de obras y montaje de tienda hasta la inauguración.',
          C: 'Realiza el levantamiento de medidas y seguimiento a proveedores de mobiliario.',
          D: 'Recopila presupuestos de contratistas para reformas de locales.'
        }
      }
    ],
    kpis: [
      { id: 'kpi-com-1', name: 'Crecimiento de Ventas Omnicanal (Tiendas + Web)', description: 'Crecimiento en volumen de pares vendidos vs. año anterior', weight: 40, target: '>= +12%' },
      { id: 'kpi-com-2', name: 'Margen Bruto Comercial Ponderado', description: 'Porcentaje de margen promedio sobre costo de mercancía', weight: 35, target: '>= 48%' },
      { id: 'kpi-com-3', name: 'Tráfico de Clientes y Tasa de Conversión', description: 'Conversión de visitantes a compradores en tiendas y tienda online', weight: 25, target: '>= 22%' }
    ]
  },
  {
    id: 'compras',
    name: 'Dirección de Compras',
    code: 'DTH-DG-OG-003',
    director: 'Juan Diego Ayala',
    gerencias: [
      'Gerencia de Cadena de Suministro',
      'Gerencia de Procesos, Optimización y Control Financiero',
      'Gerencia de Gestión de Compras'
    ],
    specificCompetencies: [
      {
        id: 'cmp-comp-1',
        name: 'Negociación Estratégica con Proveedores y Costos',
        description: 'Obtención de mejores condiciones comerciales, plazos de crédito y descuentos por volumen.',
        situations: 'Negociación de compra anual de suelas, cuero y calzado importado con fabricantes.',
        levels: {
          A: 'Establece alianzas con fabricantes internacionales logrando precios por debajo del mercado.',
          B: 'Negocia plazos de crédito favorables y asegura entregas según cronograma sin retrasos.',
          C: 'Solicita cotizaciones a múltiples proveedores y elabora cuadros comparativos de costos.',
          D: 'Genera órdenes de compra en el ERP y valida firmas de aprobación reglamentarias.'
        }
      },
      {
        id: 'cmp-comp-2',
        name: 'Planificación de la Demanda y Abastecimiento Oportuno',
        description: 'Proyección de compras basada en curvas de tallas, estacionalidad y rotación de tiendas.',
        situations: 'Determinación del volumen de compra para la temporada escolar o navideña.',
        levels: {
          A: 'Modela algoritmos de pronóstico de demanda evitando quiebres de stock o sobreinventario.',
          B: 'Calcula puntos de reorden y ajusta pedidos según ritmo de ventas de cada región.',
          C: 'Monitorea el inventario de seguridad y emite alertas de reposición al comprador.',
          D: 'Revisa reportes de ventas pasadas para cotejar cantidades mínimas de pedido.'
        }
      },
      {
        id: 'cmp-comp-3',
        name: 'Control de Calidad de Producto y Gestión de Permisología',
        description: 'Aseguramiento de estándares de calidad de materiales, normas SENCAMER y aduanas.',
        situations: 'Inspección de lote de producción con fallas de costura o acabado en cuero.',
        levels: {
          A: 'Desarrolla manuales técnicos de calidad que rechazan materia prima defectuosa en origen.',
          B: 'Gestiona trámites de importación, licencias y certificados de calidad sin demoras.',
          C: 'Inspecciona muestras físicas contra ficha técnica antes de autorizar producción masiva.',
          D: 'Archiva certificados de origen y guías de importación según normativas aduaneras.'
        }
      }
    ],
    kpis: [
      { id: 'kpi-cmp-1', name: 'Ahorro Obtenido en Negociaciones de Compra', description: 'Porcentaje de ahorro vs. presupuesto base en compras de temporada', weight: 40, target: '>= 8%' },
      { id: 'kpi-cmp-2', name: 'Cumplimiento del Plazo de Entrega del Proveedor (Lead Time)', description: 'Pedidos recibidos en CENDIS dentro de la fecha pactada', weight: 35, target: '>= 90%' },
      { id: 'kpi-cmp-3', name: 'Índice de Mercancía Rechazada por Defectos de Calidad', description: 'Porcentaje de producto rechazado en control de calidad', weight: 25, target: '< 1.5%' }
    ]
  },
  {
    id: 'control_interno',
    name: 'Dirección de Control Interno',
    code: 'DTH-DG-OG-008',
    director: 'Jacobo Caicedo',
    gerencias: [
      'Gerencia de Auditoría Interna (24 Auditores Regionales)',
      'Coordinación de CECOM (Centro de Monitoreo con 9 Operadores)',
      'Supervisión de Servicio al Cliente (Atención de Reclamos)'
    ],
    specificCompetencies: [
      {
        id: 'ci-comp-1',
        name: 'Auditoría Integral, Prevención de Pérdidas y Arqueos',
        description: 'Ejecución de auditorías operativas y financieras sorpresivas en tiendas y centros de distribución.',
        situations: 'Arqueo de caja y revisión de facturas fiscales en tienda con sospecha de irregularidad.',
        levels: {
          A: 'Diseña matrices de riesgo y planes de auditoría preventiva que eliminan fugas de capital.',
          B: 'Ejecuta auditorías exhaustivas emitiendo informes con evidencias sólidas y planes de acción.',
          C: 'Realiza arqueos de caja chica y conteos físicos siguiendo el protocolo de auditoría.',
          D: 'Coteja comprobantes de tarjeta de débito y notas de crédito contra el reporte Z fiscal.'
        }
      },
      {
        id: 'ci-comp-2',
        name: 'Monitoreo CCTV y Operación de Seguridad CECOM',
        description: 'Vigilancia 24/7 mediante cámaras de seguridad, control de accesos y prevención de hurtos.',
        situations: 'Detección en tiempo real de conducta sospechosa de cliente u operario en piso de venta.',
        levels: {
          A: 'Implementa tecnología de analítica de video y coordina respuesta inmediata con cuerpos de seguridad.',
          B: 'Monitorea aperturas, cierres y traslados de valores garantizando la integridad de las tiendas.',
          C: 'Revisa grabaciones ante incidentes reportados y extrae fragmentos probatorios con marcas de tiempo.',
          D: 'Verifica la operatividad de cámaras y reporta fallas de enlace al área de soporte técnico.'
        }
      },
      {
        id: 'ci-comp-3',
        name: 'Investigación Forense y Gestión de Denuncias',
        description: 'Atención a la línea ética, resolución de reclamos de clientes y levantamiento de expedientes.',
        situations: 'Denuncia anónima sobre cobro indebido o alteración de registros en tienda.',
        levels: {
          A: 'Lidera investigaciones forenses complejas con estricta confidencialidad y sustento legal.',
          B: 'Entrevista a partes involucradas y redacta dictámenes objetivos para la Junta Directiva.',
          C: 'Recopila testimonios, documentos y evidencias fotográficas para el expediente.',
          D: 'Registra la denuncia en la bitácora y notifica al auditor senior de guardia.'
        }
      }
    ],
    kpis: [
      { id: 'kpi-ci-1', name: 'Cobertura del Plan Anual de Auditorías en Tiendas', description: 'Porcentaje de tiendas auditadas al menos 2 veces al año', weight: 40, target: '100%' },
      { id: 'kpi-ci-2', name: 'Tasa de Recuperación y Disminución de Pérdidas', description: 'Disminución del valor de pérdidas operativas detectadas vs. año previo', weight: 35, target: '>= 20%' },
      { id: 'kpi-ci-3', name: 'Tiempo de Resolución de Denuncias y Reclamos Críticos', description: 'Días promedio para emitir dictamen en denuncias de la línea ética', weight: 25, target: '<= 7 días' }
    ]
  }
];

// 5 COMPETENCIAS CARDINALES INSTITUCIONALES (APLICABLES A TODAS LAS DIRECCIONES)
export const OFFICIAL_CARDINAL_COMPETENCIES = [
  { id: 'card-1', name: 'Orientación al Cliente (Interno y Externo)', weight: 20, desc: 'Compromiso constante de superar las expectativas del usuario mediante un trato empático, ético y ágil.' },
  { id: 'card-2', name: 'Aprendizaje e Innovación', weight: 20, desc: 'Curiosidad intelectual, proactividad para aprender nuevas herramientas y aplicación de mejoras creativas.' },
  { id: 'card-3', name: 'Capacidad de Análisis y Solución de Problemas', weight: 20, desc: 'Habilidad para descomponer situaciones complejas, evaluar datos y tomar decisiones fundamentadas.' },
  { id: 'card-4', name: 'Trabajo en Equipo y Colaboración', weight: 20, desc: 'Disposición activa para cooperar, compartir conocimientos y anteponer los objetivos organizacionales.' },
  { id: 'card-5', name: 'Adaptabilidad y Flexibilidad', weight: 20, desc: 'Capacidad para responder con serenidad, resiliencia y efectividad ante entornos cambiantes.' }
];

// 3 COMPETENCIAS DE LIDERAZGO Y SUPERVISIÓN (SOLO SI APLICA)
export const OFFICIAL_SUPERVISION_COMPETENCIES = [
  { id: 'sup-1', name: 'Liderar con el Ejemplo', weight: 34, desc: 'Modelar con la conducta diaria los valores, puntualidad, ética y excelencia operativa de la organización.' },
  { id: 'sup-2', name: 'Orientación al Logro y Resultados de Equipo', weight: 33, desc: 'Articular y motivar al equipo para alcanzar y superar las metas departamentales dentro de los plazos.' },
  { id: 'sup-3', name: 'Desarrollo de Colaboradores y Mentoría', weight: 33, desc: 'Identificar el potencial de su personal, delegar con criterio y brindar retroalimentación constructiva.' }
];

export function getCompetencyRoleText(
  comp: { name: string; description: string; rolePhrasing?: Record<string, string> },
  evalType: EvalTypeKey
): string {
  if (comp.rolePhrasing && comp.rolePhrasing[evalType]) {
    return comp.rolePhrasing[evalType]!;
  }
  const cleanName = comp.name.trim();
  const cleanDesc = comp.description.trim().replace(/^Capacidad (para|de) /i, '');
  switch (evalType) {
    case 'self':
      return `En mi gestión diaria en tienda / oficina, respondo activamente por ${cleanName.toLowerCase()}: demuestro compromiso al ${cleanDesc.charAt(0).toLowerCase() + cleanDesc.slice(1)}`;
    case 'supervisor':
      return `El colaborador demuestra en su puesto de trabajo ${cleanName.toLowerCase()}: responde con efectividad al ${cleanDesc.charAt(0).toLowerCase() + cleanDesc.slice(1)}`;
    case 'peer':
      return `Mi compañero evidencia en el trabajo diario ${cleanName.toLowerCase()}: colabora activamente al ${cleanDesc.charAt(0).toLowerCase() + cleanDesc.slice(1)}`;
    case 'subordinate':
      return `Mi líder orienta y modela al equipo en ${cleanName.toLowerCase()}: asegura los estándares al ${cleanDesc.charAt(0).toLowerCase() + cleanDesc.slice(1)}`;
    default:
      return comp.description;
  }
}

export function getKpiRoleText(
  kpi: { name: string; description: string; target: string; rolePhrasing?: Record<string, string> },
  evalType: EvalTypeKey
): string {
  if (kpi.rolePhrasing && kpi.rolePhrasing[evalType]) {
    return kpi.rolePhrasing[evalType]!;
  }
  switch (evalType) {
    case 'self':
      return `Respondo por el cumplimiento de la meta (${kpi.target}): ${kpi.name}. ${kpi.description}.`;
    case 'supervisor':
      return `El colaborador responde por el cumplimiento de la meta (${kpi.target}): ${kpi.name}. ${kpi.description}.`;
    case 'peer':
      return `Mi compañero contribuye activamente al cumplimiento de la meta (${kpi.target}): ${kpi.name}. ${kpi.description}.`;
    case 'subordinate':
      return `Nuestro líder supervisa y articula el cumplimiento de la meta (${kpi.target}): ${kpi.name}. ${kpi.description}.`;
    default:
      return `${kpi.name} (${kpi.target}): ${kpi.description}`;
  }
}

interface PerformanceEvaluationConfigViewProps {
  onNavigateBack?: () => void;
}

export function PerformanceEvaluationConfigView({ onNavigateBack }: PerformanceEvaluationConfigViewProps) {
  // Control Maestro y Cronograma de Apertura / Cierre Global de Evaluaciones (Exclusivo Administrador Maestro)
  const activeUser = getCurrentSession();
  const isMasterAdmin = isMasterAdministrator(activeUser);

  const [evalStatus, setEvalStatus] = useState<GlobalEvaluationStatus>(getGlobalEvaluationStatus());
  const [startDateInput, setStartDateInput] = useState<string>(evalStatus.startDate || '');
  const [endDateInput, setEndDateInput] = useState<string>(evalStatus.endDate || '');
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    const handleStatusChange = () => {
      const current = getGlobalEvaluationStatus();
      setEvalStatus(current);
      if (current.startDate) setStartDateInput(current.startDate);
      if (current.endDate) setEndDateInput(current.endDate);
    };

    window.addEventListener('canguro_eval_status_change', handleStatusChange);
    window.addEventListener('storage', handleStatusChange);

    const timer = setInterval(() => {
      const current = getGlobalEvaluationStatus();
      setEvalStatus(current);
    }, 15000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('canguro_eval_status_change', handleStatusChange);
      window.removeEventListener('storage', handleStatusChange);
    };
  }, []);

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError(null);
    setScheduleSuccess(null);

    if (!isMasterAdmin) {
      setScheduleError('Acceso denegado: El control de fechas y apertura/cierre de evaluaciones es de manejo EXCLUSIVO del Administrador Maestro (Natalia Rodríguez, ID 26475804).');
      return;
    }

    if (!startDateInput || !endDateInput) {
      setScheduleError('Debe definir tanto la Fecha y Hora de Inicio como la Fecha y Hora de Finalización.');
      return;
    }

    const startMs = new Date(startDateInput).getTime();
    const endMs = new Date(endDateInput).getTime();

    if (isNaN(startMs) || isNaN(endMs)) {
      setScheduleError('Por favor seleccione fechas y horas válidas en el calendario.');
      return;
    }

    if (endMs <= startMs) {
      setScheduleError('La Fecha y Hora de Finalización debe ser posterior a la Fecha y Hora de Inicio.');
      return;
    }

    const updated = setEvaluationSchedule(
      startDateInput,
      endDateInput,
      activeUser?.fullName || 'Natalia Rodríguez (Administrador Maestro)'
    );
    setEvalStatus(updated);
    setScheduleSuccess('¡Brecha de tiempo programada exitosamente! El sistema cerrará automáticamente todas las evaluaciones al alcanzar la fecha y hora tope.');
    setTimeout(() => setScheduleSuccess(null), 6000);
  };

  const handleToggleManual = () => {
    setScheduleError(null);
    setScheduleSuccess(null);

    if (!isMasterAdmin) {
      setScheduleError('Acceso denegado: La habilitación e inhabilitación de evaluaciones es de manejo EXCLUSIVO del Administrador Maestro (Natalia Rodríguez, ID 26475804).');
      return;
    }

    const nextState = !evalStatus.isOpen;
    const updated = setGlobalEvaluationStatus(
      nextState,
      activeUser?.fullName || 'Natalia Rodríguez (Administrador Maestro)',
      nextState
        ? 'Período oficial de evaluaciones habilitado.'
        : 'Período oficial de evaluaciones cerrado por la Dirección de Talento Humano.'
    );
    setEvalStatus(updated);
  };

  // 1. Dirección Seleccionada
  const [selectedDirId, setSelectedDirId] = useState<string>('operaciones');

  // 2. Tipo de Evaluación Seleccionado (Autoevaluación, Supervisor, Pares, Subordinados)
  const [selectedEvalType, setSelectedEvalType] = useState<EvalTypeKey>('self');

  // 3. Gerencia Seleccionada dentro de la Dirección
  const [selectedGerencia, setSelectedGerencia] = useState<string>('');

  // 4. Modo de Visualización / Sección Activa (KPIs, Cardinales, Específicas, Supervisión)
  const [activeSection, setActiveSection] = useState<'kpis' | 'cardinales' | 'especificas' | 'supervision'>('especificas');

  // 5. Estado local de configuraciones personalizadas por dirección (con persistencia en localStorage)
  const [directionsData, setDirectionsData] = useState<Record<string, DirectionConfig>>(() => {
    try {
      const saved = localStorage.getItem('canguro_custom_directions_eval_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    const initial: Record<string, DirectionConfig> = {};
    OFFICIAL_DIRECTIONS.forEach(d => { initial[d.id] = d; });
    return initial;
  });

  // Modal de edición de reactivo o competencia
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingType, setEditingType] = useState<'kpi' | 'competency' | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [sectionSaveNotices, setSectionSaveNotices] = useState<Record<string, string>>({});

  const currentDir = directionsData[selectedDirId] || OFFICIAL_DIRECTIONS[0];

  // Guardar cambios específicos de una sección
  const handleSaveSection = (sectionKey: 'especificas' | 'kpis' | 'cardinales' | 'supervision') => {
    try {
      localStorage.setItem('canguro_custom_directions_eval_config', JSON.stringify(directionsData));
      const sectionLabels: Record<string, string> = {
        especificas: 'Competencias Específicas',
        kpis: 'Metas & Indicadores Clave (KPIs)',
        cardinales: 'Competencias Cardinales',
        supervision: 'Competencias de Supervisión'
      };
      const msg = `¡Configuración de ${sectionLabels[sectionKey]} guardada exitosamente!`;
      setSectionSaveNotices(prev => ({ ...prev, [sectionKey]: msg }));
      setTimeout(() => {
        setSectionSaveNotices(prev => {
          const next = { ...prev };
          delete next[sectionKey];
          return next;
        });
      }, 3500);
    } catch (e) {
      console.error('Error saving section config', e);
    }
  };

  useEffect(() => {
    if (currentDir && currentDir.gerencias.length > 0 && !selectedGerencia) {
      setSelectedGerencia(currentDir.gerencias[0]);
    }
  }, [selectedDirId, currentDir]);

  // Guardar cambios en el almacenamiento persistente
  const handleSaveAll = () => {
    try {
      localStorage.setItem('canguro_custom_directions_eval_config', JSON.stringify(directionsData));
      setSaveSuccessNotice(`¡Configuración de la ${currentDir.name} guardada exitosamente en el sistema!`);
      setTimeout(() => setSaveSuccessNotice(null), 3500);
    } catch (e) {
      console.error('Error saving directions config', e);
    }
  };

  // Restablecer al manual oficial DTH-GFD-MC-01
  const handleResetToStandard = () => {
    if (confirm(`¿Desea restablecer las competencias y KPIs de la "${currentDir.name}" a los valores oficiales del Manual DTH-GFD-MC-01?`)) {
      const original = OFFICIAL_DIRECTIONS.find(d => d.id === selectedDirId);
      if (original) {
        setDirectionsData(prev => ({
          ...prev,
          [selectedDirId]: JSON.parse(JSON.stringify(original))
        }));
        setSaveSuccessNotice('Se han restablecido los parámetros oficiales del manual normativo.');
        setTimeout(() => setSaveSuccessNotice(null), 3000);
      }
    }
  };

  // Guardar edición de un item específico
  const handleSaveModalEdit = () => {
    if (!editingItem) return;
    if (editingType === 'kpi') {
      const updatedKpis = currentDir.kpis.map(k => k.id === editingItem.id ? editingItem : k);
      setDirectionsData(prev => ({
        ...prev,
        [selectedDirId]: { ...currentDir, kpis: updatedKpis }
      }));
    } else if (editingType === 'competency') {
      const updatedComps = currentDir.specificCompetencies.map(c => c.id === editingItem.id ? editingItem : c);
      setDirectionsData(prev => ({
        ...prev,
        [selectedDirId]: { ...currentDir, specificCompetencies: updatedComps }
      }));
    }
    setEditingItem(null);
    setEditingType(null);
  };

  const evalTypeLabels: Record<EvalTypeKey, { label: string; icon: any; desc: string; roleTag: string; requiresSubordinates?: boolean }> = {
    self: {
      label: 'Autoevaluación',
      icon: User,
      desc: 'El colaborador califica su propio desempeño, cumplimiento de metas y nivel de dominio en competencias.',
      roleTag: 'SELF'
    },
    supervisor: {
      label: 'Evaluación del Supervisor Inmediato',
      icon: UserCheck,
      desc: 'Calificación jerárquica del líder directo N+1 con enfoque en feedback cualitativo y metas pactadas.',
      roleTag: 'SUPERVISOR'
    },
    peer: {
      label: 'Evaluación de Pares',
      icon: Users,
      desc: 'Evaluación anónima entre colegas homólogos del mismo nivel o proceso continuo para medir colaboración.',
      roleTag: 'PEER'
    },
    subordinate: {
      label: 'Evaluación de Reportes / Subordinados',
      icon: ShieldCheck,
      desc: 'Evaluación ascendente anónima que el equipo a cargo realiza a su líder para medir estilo de gestión.',
      roleTag: 'SUBORDINATE',
      requiresSubordinates: true
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in text-zinc-900">
      {/* 1. HEADER INSTITUCIONAL DEL MÓDULO */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-2xl p-6 border-2 border-[#F1B400] shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F1B400] text-black uppercase tracking-wider">
                Módulo Oficial de Parametrización
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Modelo Normativo DTH-GFD-MC-01
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
              <Sliders size={24} className="text-[#F1B400]" /> Configuración de Evaluación del Desempeño
            </h2>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              Visualice y configure los reactivos, metas y competencias para los <strong>4 tipos de evaluación (Autoevaluación, Supervisor, Pares y Subordinados)</strong> segmentados de forma independiente para cada una de las <strong>8 Direcciones Corporativas</strong> y sus Gerencias.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            <button
              onClick={handleSaveAll}
              className="px-4 py-2.5 bg-[#F1B400] hover:bg-[#d99c00] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={15} /> Guardar Cambios
            </button>
            <button
              onClick={handleResetToStandard}
              className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs uppercase rounded-xl transition-all border border-zinc-700 flex items-center gap-1.5 cursor-pointer"
              title="Restablecer a valores de fábrica del manual"
            >
              <RotateCcw size={14} /> Restablecer
            </button>
          </div>
        </div>

        {saveSuccessNotice && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="font-semibold">{saveSuccessNotice}</span>
          </div>
        )}
      </div>

      {/* CONTROL GENERAL Y PROGRAMACIÓN DE EVALUACIONES (CONFIGURACIÓN MAESTRA) */}
      {isMasterAdmin && (() => {
        const isActive = evalStatus.isOpen;

        return (
          <div className={`p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-md space-y-4 ${isActive
              ? 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 border-emerald-300 text-emerald-950'
              : 'bg-gradient-to-br from-red-50/80 via-white to-red-50/40 border-red-300 text-red-950'
            }`}>
            {/* Cabecera del Panel de Control */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className={`p-3 rounded-2xl shrink-0 shadow-sm ${isActive
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-red-600 text-white shadow-red-500/20 animate-pulse'
                  }`}>
                  {isActive ? <Unlock size={22} /> : <Lock size={22} />}
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase font-black tracking-wider text-zinc-600 block">
                    Control General y Programación de Evaluaciones
                  </span>

                  <p className="text-xs text-zinc-700 font-medium leading-relaxed">
                    {evalStatus.message}
                  </p>
                </div>
              </div>

              {/* Botón de Cierre / Apertura Inmediata (Manual Override) */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleManual}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-black uppercase transition-all shadow-sm cursor-pointer flex items-center gap-2 ${isActive
                      ? 'bg-zinc-950 hover:bg-red-700 text-white hover:border-red-700'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                  title={isActive ? 'Forzar cierre de inmediato antes de la fecha tope' : 'Forzar apertura de inmediato'}
                >
                  {isActive ? <Lock size={14} className="text-red-400" /> : <Unlock size={14} className="text-emerald-300" />}
                  <span>{isActive ? 'Cerrar Evaluaciones Inmediato' : 'Habilitar Inmediatamente'}</span>
                </button>
              </div>
            </div>

            {/* Formulario de Configuración de Brecha de Tiempo (Calendario y Hora) */}
            <form onSubmit={handleSaveSchedule} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
                {/* 1. FECHA DE INICIO Y HORA */}
                <div className="lg:col-span-2 space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-zinc-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={15} className="text-[#D99C00]" />
                      Fecha de Inicio y Hora (Apertura):
                    </span>
                    <span className="text-[10px] text-zinc-500 font-normal">
                      (Despliega calendario interactivo)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      required
                      value={startDateInput}
                      onChange={(e) => setStartDateInput(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F1B400] transition-all cursor-pointer shadow-xs"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono block">
                    Programado: <strong className="text-zinc-800">{formatScheduleDateTime(startDateInput)}</strong>
                  </span>
                </div>

                {/* 2. FECHA DE FINALIZACIÓN Y HORA */}
                <div className="lg:col-span-2 space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-zinc-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock size={15} className="text-red-600" />
                      Fecha de Finalización y Hora (Cierre Automático Tope):
                    </span>
                    <span className="text-[10px] text-zinc-500 font-normal">
                      (Despliega calendario interactivo)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      required
                      value={endDateInput}
                      onChange={(e) => setEndDateInput(e.target.value)}
                      className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#F1B400] transition-all cursor-pointer shadow-xs"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono block">
                    Cierre automático: <strong className="text-red-700">{formatScheduleDateTime(endDateInput)}</strong>
                  </span>
                </div>

                {/* BOTÓN DE GUARDAR BRECHA */}
                <div className="lg:col-span-1">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-3 bg-[#F1B400] hover:bg-[#d99c00] active:scale-[0.98] text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save size={15} />
                    <span>Guardar Fechas</span>
                  </button>
                </div>
              </div>

              {/* Mensajes de Confirmación o Error */}
              {scheduleSuccess && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-mono flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                  <span>{scheduleSuccess}</span>
                </div>
              )}

              {scheduleError && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-xs text-red-900 font-mono flex items-center gap-2 animate-in fade-in">
                  <AlertCircle size={16} className="text-red-700 shrink-0" />
                  <span>{scheduleError}</span>
                </div>
              )}
            </form>
          </div>
        );
      })()}

      {/* CONTROL DE ALCANCE Y HABILITACIÓN DE CARGOS */}
      <EvaluationPositionsManager />

      {/* 2. SELECTOR DE LAS 8 DIRECCIONES OFICIALES */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider block">
              Paso 1: Seleccione la Dirección Organizacional
            </span>
            <h3 className="text-sm font-black uppercase text-zinc-950 flex items-center gap-2">
              <Building2 size={16} className="text-[#D99C00]" /> Las 8 Direcciones Corporativas (Organigramas Oficiales)
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold">
            {OFFICIAL_DIRECTIONS.length} Direcciones Registradas
          </span>
        </div>

        {/* Grid de 8 Direcciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {OFFICIAL_DIRECTIONS.map((dir) => {
            const isSelected = dir.id === selectedDirId;
            return (
              <button
                key={dir.id}
                onClick={() => {
                  setSelectedDirId(dir.id);
                  setSelectedGerencia(dir.gerencias[0] || '');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-full ${
                  isSelected
                    ? 'border-[#F1B400] bg-amber-500/10 shadow-sm ring-2 ring-[#F1B400]/25'
                    : 'border-zinc-200 bg-zinc-50/60 hover:bg-white hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800">
                      {dir.code}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#F1B400]" />
                    )}
                  </div>
                  <h4 className={`text-xs font-bold leading-tight ${isSelected ? 'text-zinc-950 font-black' : 'text-zinc-700'}`}>
                    {dir.name}
                  </h4>
                </div>
                <div className="mt-2 pt-2 border-t border-zinc-200/60 text-[10px] text-zinc-500 flex items-center justify-between">
                  <span>Dir: {dir.director.split(' ')[0]}</span>
                  <span className="font-mono text-zinc-400">{dir.gerencias.length} Gerencias</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FICHA DE LA DIRECCIÓN Y SELECTOR DE GERENCIA */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-amber-950 font-mono">
              {currentDir.code} • {currentDir.name}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-zinc-800 border border-zinc-200 font-bold">
              Titular: {currentDir.director}
            </span>
          </div>
          <p className="text-xs text-zinc-600">
            Ajuste los reactivos para esta dirección. Los colaboradores adscritos a esta área recibirán exactamente este formato al iniciar sesión.
          </p>
        </div>

        {/* Dropdown de Gerencia Específica */}
        <div className="min-w-[280px]">
          <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">
            Gerencia o Unidad Específica de esta Dirección:
          </label>
          <select
            value={selectedGerencia}
            onChange={(e) => setSelectedGerencia(e.target.value)}
            className="w-full text-xs font-bold bg-white border border-zinc-300 rounded-lg p-2 focus:ring-1 focus:ring-[#F1B400] outline-none text-zinc-900"
          >
            {currentDir.gerencias.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. SELECTOR DE LOS 4 TIPOS DE EVALUACIÓN (PROPUESTA CENTRAL DEL USUARIO) */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-zinc-200 gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider block">
              Paso 2: Seleccione el Tipo de Evaluación a Visualizar y Modificar
            </span>
            <h3 className="text-sm font-black uppercase text-zinc-950 flex items-center gap-2">
              <Users size={16} className="text-[#D99C00]" /> Los 4 Tipos de Evaluación por Competencias
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            Mostrando instrumentos para: <strong className="text-zinc-900">{currentDir.name.split('(')[0]}</strong>
          </span>
        </div>

        {/* Tabs de los 4 tipos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(evalTypeLabels) as EvalTypeKey[]).map((tKey) => {
            const item = evalTypeLabels[tKey];
            const isSelected = tKey === selectedEvalType;
            const Icon = item.icon;

            return (
              <button
                key={tKey}
                onClick={() => setSelectedEvalType(tKey)}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#F1B400] bg-amber-50/40 shadow-sm ring-2 ring-[#F1B400]/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      isSelected ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      {item.roleTag}
                    </span>
                    {item.requiresSubordinates && (
                      <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                        Solo mandos con equipo
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black uppercase text-zinc-950 flex items-center gap-1.5 mb-1">
                    <Icon size={14} className={isSelected ? 'text-[#D99C00]' : 'text-zinc-500'} />
                    {item.label}
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px]">
                  <span className={isSelected ? 'text-[#D99C00] font-black' : 'text-zinc-400 font-bold'}>
                    {isSelected ? '✓ Visualizando Instrumento' : 'Clic para editar'}
                  </span>
                  <ChevronRight size={12} className={isSelected ? 'text-[#D99C00]' : 'text-zinc-300'} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Alerta de Subordinados */}
        {selectedEvalType === 'subordinate' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11.5px] leading-relaxed">
              <strong>Condición Normativa para Evaluación de Subordinados:</strong>
              <p className="text-blue-800">
                Este tipo de evaluación solo se activa en la bandeja del evaluador si el colaborador evaluado ostenta un cargo de línea de mando con personal a su cargo en esta Dirección (ej: <em>Director, Gerente, Supervisor o Coordinador</em>). Para analistas o especialistas sin equipo, esta evaluación no se genera.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. SECCIONES DEL INSTRUMENTO Y EDICIÓN DE REACTIVOS */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#D99C00] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Tipo Activo: {evalTypeLabels[selectedEvalType].label}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Área: {currentDir.name.split('(')[0]}
              </span>
            </div>
            <h3 className="text-base font-black uppercase text-zinc-950 mt-1">
              Contenido y Reactivos del Instrumento
            </h3>
          </div>

          {/* Sub-navegación por secciones */}
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveSection('especificas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                activeSection === 'especificas'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              1. Específicas del Área ({currentDir.specificCompetencies.length})
            </button>
            <button
              onClick={() => setActiveSection('kpis')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                activeSection === 'kpis'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              2. Metas & KPIs ({currentDir.kpis.length})
            </button>
            <button
              onClick={() => setActiveSection('cardinales')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                activeSection === 'cardinales'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              3. Cardinales (5)
            </button>
            <button
              onClick={() => setActiveSection('supervision')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                activeSection === 'supervision'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              4. Supervisión (3)
            </button>
          </div>
        </div>

        {/* A. SECCIÓN: COMPETENCIAS ESPECÍFICAS DE LA DIRECCIÓN */}
        {activeSection === 'especificas' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase text-zinc-950 flex items-center gap-1.5">
                  <Award size={15} className="text-[#D99C00]" /> Competencias Técnicas Clave de {currentDir.name.split('(')[0]}
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Estas son las conductas que miden el saber técnico y la ejecución operativa especializada de esta dirección.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {currentDir.specificCompetencies.map((comp, idx) => (
                <div
                  key={comp.id}
                  className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 hover:bg-white hover:border-zinc-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900">
                          Competencia Específica #{idx + 1}
                        </span>
                        <h5 className="text-xs font-black uppercase text-zinc-950">
                          {comp.name}
                        </h5>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {comp.description}
                      </p>
                      <div className="text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded-lg border border-amber-200 font-mono">
                        <strong className="text-amber-950">Situación Evaluada en Tienda / Oficina:</strong> {comp.situations}
                      </div>
                      {/* Enfoque y Redacción específica según Tipo de Evaluación */}
                      <div className="text-[11.5px] p-2 rounded-lg border border-blue-200/80 bg-blue-50/70 text-blue-950 flex items-start gap-2">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-200 text-blue-900 shrink-0 font-mono mt-0.5">
                          {evalTypeLabels[selectedEvalType]?.roleTag || 'Enfoque'}:
                        </span>
                        <span className="italic leading-relaxed font-medium">
                          "{getCompetencyRoleText(comp, selectedEvalType)}"
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditingItem({ ...comp });
                        setEditingType('competency');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-800 hover:bg-zinc-100 shadow-2xs shrink-0 cursor-pointer"
                    >
                      <Edit3 size={13} /> Editar Reactivo
                    </button>
                  </div>

                  {/* Niveles de Dominio Oficiales (A, B, C, D) */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-2 border-t border-zinc-200/80">
                    <div className="p-2 rounded-lg bg-purple-50/50 border border-purple-200 text-[10.5px]">
                      <span className="font-bold text-purple-900 block mb-0.5 font-mono">Nivel A (5.00 pts - Superior)</span>
                      <p className="text-zinc-600 line-clamp-3 leading-snug">{comp.levels.A}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-200 text-[10.5px]">
                      <span className="font-bold text-blue-900 block mb-0.5 font-mono">Nivel B (3.75 pts - Alto)</span>
                      <p className="text-zinc-600 line-clamp-3 leading-snug">{comp.levels.B}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-200 text-[10.5px]">
                      <span className="font-bold text-emerald-900 block mb-0.5 font-mono">Nivel C (2.50 pts - Intermedio)</span>
                      <p className="text-zinc-600 line-clamp-3 leading-snug">{comp.levels.C}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-[10.5px]">
                      <span className="font-bold text-zinc-800 block mb-0.5 font-mono">Nivel D (1.25 pts - Inicial)</span>
                      <p className="text-zinc-600 line-clamp-3 leading-snug">{comp.levels.D}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Barra de Guardado de Sección Específicas */}
            <div className="pt-4 mt-2 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/80 p-3.5 rounded-xl">
              <div>
                <span className="text-xs font-bold text-zinc-800 block">
                  ¿Realizó ajustes en las Competencias Específicas de {currentDir.name.split('(')[0]}?
                </span>
                <span className="text-[11px] text-zinc-500">
                  Guarda reactivos, situaciones y niveles para: {evalTypeLabels[selectedEvalType]?.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {sectionSaveNotices['especificas'] && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg animate-in fade-in flex items-center gap-1">
                    <CheckCircle2 size={13} /> {sectionSaveNotices['especificas']}
                  </span>
                )}
                <button
                  onClick={() => handleSaveSection('especificas')}
                  className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-[#D99C00] hover:text-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save size={14} /> Guardar Configuración de Competencias Específicas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* B. SECCIÓN: INDICADORES CLAVE DE DESEMPEÑO (KPIs) */}
        {activeSection === 'kpis' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase text-zinc-950 flex items-center gap-1.5">
                  <Target size={15} className="text-[#D99C00]" /> Metas Cuantitativas y KPIs de {currentDir.name.split('(')[0]}
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Ponderación total normada del 60% en el bloque de metas de la Guía de Mérito corporativa.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {currentDir.kpis.map((kpi, idx) => (
                <div
                  key={kpi.id}
                  className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-800">
                        KPI #{idx + 1} • Peso: {kpi.weight}%
                      </span>
                      <h5 className="text-xs font-black uppercase text-zinc-950">
                        {kpi.name}
                      </h5>
                    </div>
                    <p className="text-xs text-zinc-600">
                      {kpi.description}
                    </p>
                    <div className="text-[11px] font-mono font-bold text-emerald-700">
                      Meta Esperada: {kpi.target}
                    </div>
                    {/* Enfoque de meta según Tipo de Evaluación */}
                    <div className="text-[11px] p-2 rounded-lg border border-amber-200/80 bg-amber-50/60 text-amber-950 flex items-start gap-2">
                      <span className="text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 shrink-0 font-mono mt-0.5">
                        {evalTypeLabels[selectedEvalType]?.roleTag || 'Enfoque'}:
                      </span>
                      <span className="italic leading-relaxed font-medium">
                        "{getKpiRoleText(kpi, selectedEvalType)}"
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingItem({ ...kpi });
                      setEditingType('kpi');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-bold text-zinc-800 hover:bg-zinc-100 shadow-2xs shrink-0 cursor-pointer self-start sm:self-center"
                  >
                    <Edit3 size={13} /> Editar Meta
                  </button>
                </div>
              ))}
            </div>

            {/* Barra de Guardado de Sección KPIs */}
            <div className="pt-4 mt-2 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/80 p-3.5 rounded-xl">
              <div>
                <span className="text-xs font-bold text-zinc-800 block">
                  ¿Realizó ajustes en las Metas o Ponderaciones de KPIs?
                </span>
                <span className="text-[11px] text-zinc-500">
                  Guarda metas e indicadores cuantitativos para {currentDir.name.split('(')[0]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {sectionSaveNotices['kpis'] && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg animate-in fade-in flex items-center gap-1">
                    <CheckCircle2 size={13} /> {sectionSaveNotices['kpis']}
                  </span>
                )}
                <button
                  onClick={() => handleSaveSection('kpis')}
                  className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-[#D99C00] hover:text-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save size={14} /> Guardar Configuración de Metas & KPIs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* C. SECCIÓN: COMPETENCIAS CARDINALES */}
        {activeSection === 'cardinales' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h4 className="text-xs font-bold uppercase text-zinc-950 flex items-center gap-1.5">
                <Brain size={15} className="text-[#D99C00]" /> Las 5 Competencias Cardinales Institucionales
              </h4>
              <p className="text-[11px] text-zinc-500">
                Ponderación del 30%. Aplicables al 100% de los colaboradores de todas las direcciones de Universo Canguro.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OFFICIAL_CARDINAL_COMPETENCIES.map((c, i) => (
                <div key={c.id} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-zinc-950">
                      {i + 1}. {c.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-zinc-500">
                      {c.weight}%
                    </span>
                  </div>
                  <p className="text-[11.5px] text-zinc-600 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Barra de Guardado de Sección Cardinales */}
            <div className="pt-4 mt-2 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/80 p-3.5 rounded-xl">
              <div>
                <span className="text-xs font-bold text-zinc-800 block">
                  Competencias Cardinales Corporativas (Norma DTH-GFD-MC-01)
                </span>
                <span className="text-[11px] text-zinc-500">
                  Transversales para todas las direcciones de la organización.
                </span>
              </div>
              <div className="flex items-center gap-3">
                {sectionSaveNotices['cardinales'] && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg animate-in fade-in flex items-center gap-1">
                    <CheckCircle2 size={13} /> {sectionSaveNotices['cardinales']}
                  </span>
                )}
                <button
                  onClick={() => handleSaveSection('cardinales')}
                  className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-[#D99C00] hover:text-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save size={14} /> Guardar Configuración de Cardinales
                </button>
              </div>
            </div>
          </div>
        )}

        {/* D. SECCIÓN: COMPETENCIAS DE SUPERVISIÓN */}
        {activeSection === 'supervision' && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h4 className="text-xs font-bold uppercase text-zinc-950 flex items-center gap-1.5">
                <Briefcase size={15} className="text-[#D99C00]" /> Competencias Gerenciales y de Supervisión (10%)
              </h4>
              <p className="text-[11px] text-zinc-500">
                Se activan exclusivamente cuando el colaborador evaluado desempeña un cargo con subordinados (Coordinador, Supervisor, Gerente, Director).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {OFFICIAL_SUPERVISION_COMPETENCIES.map((c, i) => (
                <div key={c.id} className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-blue-950">
                      {i + 1}. {c.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-blue-700">
                      {c.weight}%
                    </span>
                  </div>
                  <p className="text-[11.5px] text-zinc-600 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Barra de Guardado de Sección Supervisión */}
            <div className="pt-4 mt-2 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50/80 p-3.5 rounded-xl">
              <div>
                <span className="text-xs font-bold text-zinc-800 block">
                  Competencias de Liderazgo y Supervisión
                </span>
                <span className="text-[11px] text-zinc-500">
                  Aplica para roles jerárquicos y evaluación ascendente de subordinados.
                </span>
              </div>
              <div className="flex items-center gap-3">
                {sectionSaveNotices['supervision'] && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg animate-in fade-in flex items-center gap-1">
                    <CheckCircle2 size={13} /> {sectionSaveNotices['supervision']}
                  </span>
                )}
                <button
                  onClick={() => handleSaveSection('supervision')}
                  className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-[#D99C00] hover:text-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save size={14} /> Guardar Configuración de Supervisión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. MODAL DE EDICIÓN EN LÍNEA DE REACTIVO O META */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-300 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">
                  Edición de Parámetros • {currentDir.name.split('(')[0]}
                </span>
                <h3 className="text-base font-black uppercase text-zinc-950">
                  {editingType === 'kpi' ? 'Editar Indicador Clave de Desempeño' : 'Editar Competencia Específica'}
                </h3>
              </div>
              <button
                onClick={() => { setEditingItem(null); setEditingType(null); }}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-950 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Nombre del Reactivo / Competencia:</label>
                <input
                  type="text"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg font-bold text-zinc-900 focus:ring-1 focus:ring-[#F1B400] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Descripción / Definición Operativa:</label>
                <textarea
                  rows={2}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-800 focus:ring-1 focus:ring-[#F1B400] outline-none"
                />
              </div>

              {editingType === 'kpi' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Ponderación (%):</label>
                    <input
                      type="number"
                      value={editingItem.weight || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, weight: Number(e.target.value) })}
                      className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Meta Esperada:</label>
                    <input
                      type="text"
                      value={editingItem.target || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, target: e.target.value })}
                      className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded-lg font-bold text-emerald-700"
                    />
                  </div>
                </div>
              )}

              {editingType === 'competency' && (
                <div>
                  <label className="block font-bold text-amber-950 mb-1">Situación Evaluada en Tienda / Oficina:</label>
                  <textarea
                    rows={2}
                    value={editingItem.situations || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, situations: e.target.value })}
                    className="w-full p-2 bg-amber-50/50 border border-amber-300 rounded-lg text-zinc-800 focus:ring-1 focus:ring-[#F1B400] outline-none"
                  />
                </div>
              )}

              {editingType === 'competency' && editingItem.levels && (
                <div className="space-y-2 pt-2 border-t border-zinc-200">
                  <label className="block font-bold text-zinc-900">Conductas Observables por Nivel de Dominio:</label>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-700 block">Nivel A (5.00 pts - Superior / Estratégico):</span>
                    <textarea
                      rows={2}
                      value={editingItem.levels.A || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, levels: { ...editingItem.levels, A: e.target.value } })}
                      className="w-full p-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 block">Nivel B (3.75 pts - Alto / Táctico):</span>
                    <textarea
                      rows={2}
                      value={editingItem.levels.B || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, levels: { ...editingItem.levels, B: e.target.value } })}
                      className="w-full p-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 block">Nivel C (2.50 pts - Intermedio):</span>
                    <textarea
                      rows={2}
                      value={editingItem.levels.C || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, levels: { ...editingItem.levels, C: e.target.value } })}
                      className="w-full p-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-700 block">Nivel D (1.25 pts - Inicial):</span>
                    <textarea
                      rows={2}
                      value={editingItem.levels.D || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, levels: { ...editingItem.levels, D: e.target.value } })}
                      className="w-full p-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
              <button
                onClick={() => { setEditingItem(null); setEditingType(null); }}
                className="px-4 py-2 border border-zinc-300 text-zinc-700 text-xs font-bold uppercase rounded-lg hover:bg-zinc-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveModalEdit}
                className="px-5 py-2 bg-zinc-950 text-white hover:bg-[#F1B400] hover:text-black text-xs font-bold uppercase rounded-lg shadow-xs transition-colors"
              >
                Guardar Modificación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


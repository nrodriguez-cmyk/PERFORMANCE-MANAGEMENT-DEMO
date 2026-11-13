/**
 * MODELO DE COMPETENCIAS CANGURO
 * Código: DTH-GFD-MC-01 | Versión: 01 | Fecha: Febrero / Abril 2026
 * Dirección de Talento Humano | Gerencia de Formación y Desarrollo
 * DISTRICUEROS EL CANGURO, C.A. — «Universo Canguro»
 * 
 * ESTRUCTURA OFICIAL:
 * 1. Competencias Cardinales (5) - Aplicables a todos los colaboradores
 * 2. Competencias Específicas de Junta Directiva (3) - Alta Dirección y Presidencia
 * 3. Competencias Específicas Gerenciales y/o de Supervisión (3) - Exclusivo: Coordinador, Supervisor, Gerente y Director
 * 4. Competencias Específicas por Área (9) - Segmentadas por Dirección en 3 clusters:
 *    - De Cara al Cliente: Motores de Venta (Comercial, Operaciones de Tienda)
 *    - Soporte Transversal: Habilidad y Agilidad (Logística, Tecnología, Talento Humano)
 *    - Operaciones Centrales: Blindaje y Control (Finanzas, Control Interno, Compras)
 */

import type { Question } from '../types';

export type CompetencyLevelLetter = 'A' | 'B' | 'C' | 'D';

export interface CompetencyLevelDefinition {
  letter: CompetencyLevelLetter;
  name: string; // Nivel Superior, Nivel Alto, Nivel Intermedio, Nivel Mínimo
  rangePercent: string; // 76%-100%, 51%-75%, 26%-50%, 0%-25%
  scoreValue: number; // 5.00, 3.75, 2.50, 1.25
  targetRoleReference: string; // Presidencia/Directores, Gerentes/Supervisores, Coordinadores/Especialistas, Analistas/Asesores
  domainDescription: string;
  expectedBehaviors: string;
  observableItems: string[]; // 5 comportamientos observables directos del manual
}

export interface OfficialCompetency {
  id: string;
  name: string;
  type: 'cardinal' | 'supervision' | 'board' | 'area_sales' | 'area_support' | 'area_control';
  clusterLabel: string;
  definition: string;
  levels: Record<CompetencyLevelLetter, CompetencyLevelDefinition>;
  targetPositions?: string[]; // Si aplica solo a ciertos cargos (ej: supervisión)
  targetDirectorates?: string[]; // Si aplica a ciertas direcciones
}

// 4 NIVELES DE DESARROLLO GENERALES DEL MODELO (Pág. 7)
export const CANGURO_GENERAL_LEVELS = {
  A: {
    letter: 'A' as const,
    name: 'Nivel Superior',
    rangePercent: '76% - 100%',
    score: 5.00,
    targetRoleReference: 'Presidencia, Junta Directiva y Directores (Estratégico)',
    description: 'La competencia trasciende la ejecución técnica para convertirse en un motor de impacto estratégico. Con una visión sistémica excepcional, el colaborador anticipa las transformaciones de la industria, actuando como un referente de integridad y excelencia. Su liderazgo no solo responde al presente, sino que define el rumbo de la empresa mediante la creación de estrategias disruptivas.'
  },
  B: {
    letter: 'B' as const,
    name: 'Nivel Alto',
    rangePercent: '51% - 75%',
    score: 3.75,
    targetRoleReference: 'Gerentes y Supervisores (Táctico)',
    description: 'Se evidencia un dominio consistente y fiable, donde la autonomía es el rasgo distintivo. El colaborador actúa con iniciativa propia, adelantándose a las dificultades y optimizando procesos de manera continua. Gracias a esta disposición, se convierte en el garante de la calidad y del éxito en la ejecución de los planes tácticos de su área.'
  },
  C: {
    letter: 'C' as const,
    name: 'Nivel Intermedio',
    rangePercent: '26% - 50%',
    score: 2.50,
    targetRoleReference: 'Coordinadores y Especialistas (Operativo / Táctico)',
    description: 'Representa una operatividad estable y eficiente en funciones habituales. Aunque el desempeño es consistente, la autonomía es parcial, requiriendo apoyo ante escenarios de alta complejidad o incertidumbre. En esta fase de aprendizaje activo, el colaborador prioriza el cumplimiento riguroso de los procesos sobre su optimización.'
  },
  D: {
    letter: 'D' as const,
    name: 'Nivel Mínimo',
    rangePercent: '0% - 25%',
    score: 1.25,
    targetRoleReference: 'Analistas, Operadores Integrales y Asesores Integrales (Operativo)',
    description: 'Representa el umbral básico de la competencia. El desempeño es esporádico y depende directamente de una guía externa o manuales detallados. Es un nivel de desarrollo inicial donde la prioridad es la formación técnica básica y la adaptación a las normas elementales para evitar riesgos en la operación.'
  }
};

// ============================================================================
// I. COMPETENCIAS CARDINALES (TODOS LOS CARGOS Y DIRECCIONES, PÁG. 10-17)
// ============================================================================
export const CARDINAL_COMPETENCIES: OfficialCompetency[] = [
  // 1. Orientación al Cliente (pág. 10-11)
  {
    id: 'card-1',
    name: 'Orientación al Cliente',
    type: 'cardinal',
    clusterLabel: 'Competencias Cardinales',
    definition: 'Es la capacidad de dirigir las acciones y esfuerzos hacia la satisfacción de las necesidades y expectativas de los clientes internos y externos. Implica generar una relación de confianza donde el cliente se sienta escuchado, respaldado y con la certeza de que sus problemas serán resueltos con profesionalismo.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores / Alta Dirección',
        domainDescription: 'Este es el nivel de mayor dominio de la competencia. El colaborador actúa como un consultor estratégico que anticipa tendencias y diseña modelos de servicio de excelencia para toda la organización. Es capaz de influir en otros departamentos para garantizar el respaldo absoluto al cliente final y es reconocido como un modelo a seguir por generar vínculos de confianza inquebrantables.',
        expectedBehaviors: 'El colaborador actúa como un consultor estratégico y referente de servicio, transformando las necesidades futuras en soluciones estructurales de alto impacto para la organización y sus clientes.',
        observableItems: [
          'Anticipa tendencias y necesidades futuras diseñando modelos de servicio de excelencia.',
          'Actúa como consultor estratégico para garantizar soluciones de alto impacto organizacional.',
          'Influye en otras áreas de la organización para asegurar el respaldo integral al cliente (interno o externo).',
          'Establece vínculos de confianza sólidos siendo reconocido como un referente de servicio.',
          'Promueve cambios estructurales en los procesos para maximizar la satisfacción del cliente.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes y Supervisores',
        domainDescription: 'El colaborador posee la habilidad de detectar necesidades que el cliente no ha expresado claramente, ofreciendo alternativas que agregan valor extra. Gestiona activamente situaciones de conflicto con empatía y propone mejoras en los procesos de su área para eliminar barreras y agilizar la experiencia general del usuario.',
        expectedBehaviors: 'El colaborador gestiona proactivamente la satisfacción del usuario, optimizando procesos y resolviendo barreras operativas con un enfoque de alto valor agregado.',
        observableItems: [
          'Detecta necesidades no expresadas por el usuario ofreciendo alternativas de valor agregado.',
          'Gestiona situaciones de conflicto o reclamos con empatía y enfoque en soluciones.',
          'Propone mejoras en los procesos internos para agilizar la experiencia del solicitante.',
          'Ofrece recomendaciones técnicas que optimizan los requerimientos recibidos por el área.',
          'Resuelve barreras operativas de forma autónoma para garantizar la satisfacción del cliente.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Coordinadores y Especialistas',
        domainDescription: 'El colaborador demuestra una escucha activa para comprender a fondo la necesidad del cliente y entrega soluciones efectivas en los tiempos pactados. Es proactivo al confirmar que la respuesta brindada fue la correcta y se asegura de que el cliente se sienta escuchado y valorado a través de un trato cercano y profesional, pero en algunas situaciones requiere el apoyo del supervisor.',
        expectedBehaviors: 'El colaborador asegura la efectividad técnica y el cumplimiento del servicio mediante la escucha activa y validación constante de los requerimientos del cliente.',
        observableItems: [
          'Identifica mediante la escucha activa el requerimiento técnico o funcional del cliente (externo o interno).',
          'Entrega respuestas efectivas y soluciones técnicas en los tiempos acordados.',
          'Valida con el cliente que la solución o información solicitada sea la requerida.',
          'Mantiene una comunicación profesional y de respaldo con sus clientes internos.',
          'Acude a su supervisor ante requerimientos complejos para asegurar la calidad técnica.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Analistas, Operadores Integrales y Asesores',
        domainDescription: 'El Colaborador actúa de manera reactiva, respondiendo con amabilidad y cortesía a los requerimientos directos que recibe. Se limita a cumplir con los estándares básicos de atención, siguiendo instrucciones precisas y escalando a sus superiores cualquier situación que se salga de la rutina para no afectar el servicio.',
        expectedBehaviors: 'El colaborador asegura el cumplimiento operativo básico, siguiendo estrictamente las instrucciones, tiempos y protocolos de atención establecidos.',
        observableItems: [
          'Responde a requerimientos directos cumpliendo estrictamente con las instrucciones recibidas.',
          'Cumple con los tiempos y estándares de atención definidos para su puesto de trabajo.',
          'Escala de inmediato a su superior cualquier situación que exceda su rutina habitual.',
          'Proporciona información básica basada solo en manuales autorizados.',
          'Atiende a los clientes y tiene un trato con sus pares siguiendo los protocolos de saludo básicos.'
        ]
      }
    }
  },

  // 2. Aprendizaje e Innovación (pág. 10-11)
  {
    id: 'card-2',
    name: 'Aprendizaje e Innovación',
    type: 'cardinal',
    clusterLabel: 'Competencias Cardinales',
    definition: 'Es la capacidad de identificar y aplicar nuevas ideas, métodos o soluciones que generen valor a la organización, manteniendo una disposición constante hacia la actualización de conocimientos. Implica la curiosidad intelectual para cuestionar los procesos actuales, la agilidad para aprender de la experiencia y la apertura al cambio, transformando los desafíos en oportunidades de mejora creativa y crecimiento personal y colectivo.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores / Alta Dirección',
        domainDescription: 'Este es el nivel de mayor dominio de la competencia. Promueve una cultura de innovación y aprendizaje continuo en toda la organización, anticipando cambios en el entorno para proponer estrategias transformadoras. Es un modelo a seguir en la transferencia de conocimiento y en la implementación de modelos de gestión del cambio que garantizan que la empresa se mantenga a la vanguardia y en constante crecimiento.',
        expectedBehaviors: 'El colaborador actúa como referente y gestor del cambio, impulsando la innovación y el aprendizaje continuo como estrategias clave para la transformación y competitividad organizacional.',
        observableItems: [
          'Promueve una cultura de innovación y aprendizaje continuo en toda la organización.',
          'Anticipa cambios en el entorno para proponer estrategias de mejora transformadoras.',
          'Actúa como modelo a seguir en la transferencia de conocimiento especializado.',
          'Implementa modelos de gestión del cambio que mantienen a la empresa a la vanguardia.',
          'Diseña estrategias de crecimiento basadas en el aprendizaje organizacional constante.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes y Supervisores',
        domainDescription: 'Fomenta el intercambio y la actualización de conocimientos entre compañeros, actúa con resiliencia ante el fracaso y utiliza el pensamiento crítico para evaluar y adaptar nuevas metodologías que aseguren resultados superiores. Además, identifica oportunidades de mejora que impactan en su equipo y otras áreas, proponiendo cambios innovadores en los procesos o servicios.',
        expectedBehaviors: 'El colaborador impulsa la innovación y el aprendizaje colaborativo, optimizando los procesos y resultados del equipo mediante el pensamiento crítico y la mejora continua.',
        observableItems: [
          'Fomenta activamente el intercambio de conocimientos y actualizaciones técnicas entre sus compañeros.',
          'Utiliza los errores como base de aprendizaje para ajustar nuevas metodologías.',
          'Evalúa y adapta procesos mediante el pensamiento crítico para elevar resultados.',
          'Identifica oportunidades de mejora que optimicen los resultados de su equipo y áreas relacionadas.',
          'Propone cambios innovadores en procesos o servicios para elevar los estándares de desempeño.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Coordinadores y Especialistas',
        domainDescription: 'Busca activamente actualizar sus conocimientos técnicos y propone soluciones creativas para resolver problemas cotidianos de su área solo si se le solicita. Demuestra curiosidad por optimizar sus propias tareas y es capaz de aprender rápidamente de sus errores, integrando nuevas prácticas que aumentan la eficiencia de su desempeño individual.',
        expectedBehaviors: 'El colaborador potencia su eficiencia individual y autoaprendizaje, aplicando soluciones creativas y nuevos conocimientos para optimizar de forma autónoma su desempeño diario.',
        observableItems: [
          'Identifica mediante la escucha activa el requerimiento técnico o funcional del cliente (externo o interno).',
          'Entrega respuestas efectivas y soluciones técnicas en los tiempos acordados.',
          'Valida con el cliente que la solución o información solicitada sea la requerida.',
          'Mantiene una comunicación profesional y de respaldo con sus clientes internos.',
          'Acude a su supervisor ante requerimientos complejos para asegurar la calidad técnica.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Analistas, Operadores Integrales y Asesores',
        domainDescription: 'El colaborador muestra apertura ante algunos cambios y está dispuesto a aprender nuevas tareas cuando se le solicita. Cumple con los programas de formación asignados y aplica las mejoras sugeridas por sus superiores en su trabajo diario, manteniendo una actitud receptiva hacia la actualización de sus herramientas básicas de trabajo.',
        expectedBehaviors: 'El colaborador demuestra adaptabilidad y disposición al aprendizaje, aplicando puntualmente las nuevas capacitaciones, herramientas y procesos para mantener su desempeño actualizado.',
        observableItems: [
          'Muestra una actitud receptiva ante los cambios y nuevas tareas asignadas por su superior.',
          'Cumple puntualmente con los programas de formación y capacitación técnica requeridos.',
          'Aplica las mejoras sugeridas en sus tareas diarias para optimizar su desempeño básico.',
          'Utiliza de manera correcta las nuevas herramientas de trabajo que la organización le proporciona.',
          'Aprende procedimientos actualizados demostrando disposición para abandonar métodos de trabajo obsoletos.'
        ]
      }
    }
  },

  // 3. Capacidad de Análisis (pág. 12-13)
  {
    id: 'card-3',
    name: 'Capacidad de Análisis',
    type: 'cardinal',
    clusterLabel: 'Competencias Cardinales',
    definition: 'Habilidad para descomponer situaciones complejas en sus partes constituyentes, examinarlas sistemáticamente e identificar relaciones causales y patrones mediante el pensamiento crítico. Implica utilizar la información de manera crítica y precisa para resolver problemas, establecer prioridades y tomar decisiones informadas, manteniendo un enfoque estructurado y orientado a resultados eficaces.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores / Alta Dirección',
        domainDescription: 'Este es el nivel de mayor dominio de la competencia. Capacidad para establecer modelos de análisis que detectan interrelaciones causales profundas entre diversas áreas de la organización. Promueve el pensamiento lógico y crítico en todos sus niveles, implementando sistemas de gestión de datos que aseguran la toma de decisiones estratégicas precisas y el éxito a largo plazo.',
        expectedBehaviors: 'El colaborador lidera el análisis sistémico y estratégico, utilizando modelos de datos integrales para asegurar decisiones precisas y mitigar riesgos organizacionales a largo plazo.',
        observableItems: [
          'Establece modelos de análisis para detectar interrelaciones causales entre diversas áreas.',
          'Promueve activamente el pensamiento lógico y crítico en todos los niveles jerárquicos.',
          'Implementa sistemas de gestión de datos para asegurar decisiones estratégicas precisas.',
          'Diseña marcos de análisis que garantizan el éxito y la sostenibilidad a largo plazo.',
          'Evalúa escenarios completos mediante información transversal para anticipar riesgos organizacionales.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes y Supervisores',
        domainDescription: 'Es la capacidad para manejar datos e información de diversos sectores de la organización para establecer prioridades claras y tomar decisiones informadas. Propone mejoras en los procesos de análisis actuales y utiliza herramientas estructuradas para garantizar que los resultados sean efectivos y coherentes en su área.',
        expectedBehaviors: 'El colaborador lidera el análisis transversal y la toma de decisiones, integrando diversas variables y herramientas estructuradas para priorizar acciones y anticipar impactos en su gestión.',
        observableItems: [
          'Identifica relaciones entre diferentes variables para anticipar impactos en su área.',
          'Utiliza herramientas estructuradas para garantizar resultados efectivos y coherentes.',
          'Propone mejoras en los métodos de análisis actuales de su departamento.',
          'Toma decisiones informadas basadas en el análisis de información transversal.',
          'Maneja datos de diversos sectores para establecer prioridades claras en su gestión.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Coordinadores y Especialistas',
        domainDescription: 'Es la capacidad para utilizar información disponible de manera crítica, permitiendo afrontar los retos diarios de forma activa. Logra descomponer la información básica en sus partes fundamentales para proponer soluciones eficaces si se lo solicitan, sin perder de vista los objetivos de su puesto de trabajo.',
        expectedBehaviors: 'El colaborador aplica el análisis crítico y operativo, descomponiendo requerimientos y procesando información para resolver retos diarios con autonomía y eficacia.',
        observableItems: [
          'Utiliza la información disponible de manera crítica para afrontar los retos diarios.',
          'Descompone requerimientos básicos en sus partes fundamentales para facilitar su resolución.',
          'Propone soluciones eficaces a problemas de su área cuando se le solicita.',
          'Alinea el análisis de datos con los objetivos específicos de su puesto de trabajo.',
          'Procesa información técnica o comercial para ejecutar tareas con autonomía operativa.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Analistas, Operadores Integrales y Asesores',
        domainDescription: 'Es la capacidad para examinar situaciones sencillas y rutinas de su entorno inmediato cuando se le solicita. Logra identificar las causas directas de problemas evidentes y utiliza la información básica para resolver tareas diarias. Muestra un enfoque estructurado básico para cumplir con sus responsabilidades, teniendo en cuenta los datos más visibles y acude a su supervisor inmediato para la toma de decisiones operativas.',
        expectedBehaviors: 'El colaborador asegura un análisis operativo estructurado, identificando causas directas en tareas rutinarias y resolviendo requerimientos básicos bajo supervisión y procesos definidos.',
        observableItems: [
          'Examina situaciones sencillas y procesos rutinarios de su entorno bajo solicitud.',
          'Identifica las causas directas de problemas evidentes en sus tareas diarias.',
          'Utiliza información básica y datos visibles para resolver requerimientos operativos.',
          'Mantiene un enfoque estructurado para cumplir con sus responsabilidades asignadas.',
          'Consulta a su supervisor inmediato antes de tomar decisiones sobre su operación.'
        ]
      }
    }
  },

  // 4. Trabajo en Equipo (pág. 14-15)
  {
    id: 'card-4',
    name: 'Trabajo en Equipo',
    type: 'cardinal',
    clusterLabel: 'Competencias Cardinales',
    definition: 'Es la disposición genuina para trabajar en colaboración con otros, integrando esfuerzos y conocimientos para el logro de objetivos comunes. Esta competencia actúa como un motor que promueve la cooperación y el intercambio constante, motivando a las personas a subordinar sus intereses personales en favor de las metas del grupo. Implica actuar con proactividad para solucionar problemas y dudas, creando un entorno de confianza y apoyo mutuo que asegura el cumplimiento de las metas organizacionales.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores / Alta Dirección',
        domainDescription: 'Este es el nivel de mayor dominio de la competencia. Promueve el espíritu de colaboración en toda la organización y constituye un modelo de apoyo decidido para el logro de los objetivos planteados. Implementa mecanismos para fomentar la cooperación interdepartamental como instrumento clave del éxito y es reconocido por inspirar a otros a trabajar en sinergia, transformando la cultura grupal en una de respaldo absoluto para el equipo y la empresa.',
        expectedBehaviors: 'El colaborador lidera la sinergia y cooperación organizacional, transformando la cultura grupal para maximizar resultados colectivos y el respaldo a los objetivos estratégicos.',
        observableItems: [
          'Promueve activamente el espíritu de colaboración en todos los niveles de la organización.',
          'Actúa como un modelo de apoyo decidido para el logro de los objetivos estratégicos.',
          'Implementa mecanismos formales para fomentar la cooperación entre diferentes departamentos.',
          'Inspira a otros a trabajar en sinergia para maximizar los resultados colectivos.',
          'Transforma la cultura grupal en un entorno de respaldo absoluto para la empresa.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes y Supervisores',
        domainDescription: 'Brinda ayuda y colaboración constante tanto a su equipo como a otros sectores de la organización, promoviendo el intercambio de información y recursos. Posee la capacidad de identificar necesidades colectivas y propone mejoras en los mecanismos de cooperación interdepartamental, demostrando una voluntad clara de anteponer las metas organizacionales a las preferencias individuales.',
        expectedBehaviors: 'El colaborador actúa como facilitador de cooperación interna, priorizando los objetivos organizacionales y el intercambio de recursos para optimizar el trabajo entre áreas.',
        observableItems: [
          'Brinda ayuda y colaboración a su propio equipo y a otros sectores.',
          'Promueve activamente el intercambio de información y recursos entre departamentos.',
          'Identifica necesidades colectivas para proponer mejoras en la cooperación interna.',
          'Antepone el cumplimiento de las metas organizacionales a sus preferencias individuales.',
          'Actúa como facilitador para resolver cuellos de botella que afecten a otras áreas.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Coordinadores y Especialistas',
        domainDescription: 'Participa y colabora activamente con los integrantes de su propia área, mostrando una clara predisposición a ayudar antes de que se lo manifiesten expresamente. Busca unificar esfuerzos para el cumplimiento de los requerimientos de sus pares, equilibrando sus responsabilidades con el apoyo del grupo.',
        expectedBehaviors: 'El colaborador impulsa la colaboración y cohesión del equipo, equilibrando sus tareas con el apoyo proactivo a sus pares para unificar esfuerzos y optimizar el clima laboral.',
        observableItems: [
          'Participa y colabora activamente con los integrantes de su propia área de trabajo.',
          'Muestra predisposición para ayudar a sus compañeros antes de que se lo soliciten.',
          'Busca unificar esfuerzos con sus pares para el cumplimiento de los requerimientos grupales.',
          'Equilibra sus responsabilidades individuales con el apoyo constante a los objetivos del grupo.',
          'Contribuye al buen clima laboral mediante una comunicación abierta y constructiva con su equipo.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Analistas, Operadores Integrales y Asesores',
        domainDescription: 'El colaborador coopera y brinda soporte a las personas de su entorno inmediato principalmente cuando se le solicita, teniendo en cuenta las necesidades de los demás para no interferir en el flujo de trabajo grupal. Se limita a cumplir con las tareas individuales dentro del equipo, manteniendo una disposición básica hacia la ayuda mutua sin comprometer sus propios intereses personales.',
        expectedBehaviors: 'El colaborador ofrece soporte reactivo y respetuoso, asistiendo a su equipo inmediato cuando se le requiere y asegurando que sus acciones no obstaculicen el flujo de trabajo grupal.',
        observableItems: [
          'Brinda soporte a las personas de su entorno inmediato principalmente cuando se le solicita de manera explícita.',
          'Realiza sus tareas considerando las necesidades básicas de los demás para evitar interferencias en el flujo de trabajo grupal.',
          'Se limita a cumplir con sus responsabilidades asignadas dentro del equipo, asegurando su propio aporte técnico.',
          'Mantiene una actitud de ayuda mutua siempre que no se comprometan sus propios objetivos o intereses personales.',
          'Participa en las dinámicas del equipo de manera funcional, cumpliendo los requerimientos básicos de cooperación.'
        ]
      }
    }
  },

  // 5. Adaptabilidad y Flexibilidad (pág. 16-17)
  {
    id: 'card-5',
    name: 'Adaptabilidad y Flexibilidad',
    type: 'cardinal',
    clusterLabel: 'Competencias Cardinales',
    definition: 'Es la capacidad para mantener un desempeño de excelencia en entornos definidos por el movimiento constante y la evolución de las prioridades. Implica ajustar con agilidad el comportamiento y los métodos de trabajo ante situaciones imprevistas o desafíos emergentes, manteniendo una actitud positiva y constructiva. Esta competencia permite fluir con el ritmo de la organización, transformando la variabilidad en una oportunidad para optimizar resultados y asegurar la continuidad operativa.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores / Alta Dirección',
        domainDescription: 'Este es el nivel de mayor dominio de la competencia. Inspira una cultura de agilidad y resiliencia en toda la organización, anticipando la necesidad de cambio y preparando el terreno para una transición fluida. Es un modelo de flexibilidad estratégica que convierte el dinamismo organizacional en una fortaleza, guiando a otros para que operen con éxito y visión en escenarios en constante evolución.',
        expectedBehaviors: 'El colaborador ejerce un liderazgo de resiliencia estratégica, inspirando agilidad ante la incertidumbre y transformando el dinamismo del mercado en una ventaja competitiva sostenible.',
        observableItems: [
          'Supervisa que la estructura de liderazgo esté alineada con los desafíos estratégicos y la visión de futuro.',
          'Asegura que la alta gerencia ejecute la estrategia con integridad y apego a los valores corporativos.',
          'Promueve un entorno de alta dirección basado en la autonomía y la responsabilidad por los resultados.',
          'Valida que el propósito de la organización se traduzca en una gestión de alto impacto en todas las áreas.',
          'Actúa como custodio de la cultura, exigiendo excelencia y ética en la toma de decisiones de primer nivel.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes y Supervisores',
        domainDescription: 'Actúa con solidez y eficacia en contextos de alta demanda y cambios frecuentes de dirección. Reorganiza planes y recursos de manera proactiva para alinearse a nuevos desafíos, manteniendo el enfoque en los objetivos finales de su área. Su capacidad para gestionar la ambigüedad le permite tomar decisiones rápidas y acertadas sin perder la calma.',
        expectedBehaviors: 'El colaborador impulsa el desarrollo del liderazgo estratégico, fortaleciendo cuadros de reemplazo y optimizando la gestión de sus equipos para asegurar la visión organizacional.',
        observableItems: [
          'Desarrolla competencias directivas en sus reportes para que lideren sus grupos con éxito.',
          'Identifica y potencia cuadros de reemplazo para posiciones clave en su área.',
          'Reorganiza recursos y planes permitiendo que sus líderes operen con agilidad.',
          'Evalúa y mejora el clima laboral de los equipos bajo su supervisión indirecta.',
          'Asegura que la visión estratégica sea ejecutada con coherencia en todos sus niveles.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Coordinadores y Especialistas',
        domainDescription: 'Se adapta con rapidez a las fluctuaciones diarias de las prioridades y el ritmo de trabajo guiado. Es capaz de alternar entre diversas tareas de manera efectiva y adopta nuevas herramientas o procedimientos con agilidad, asegurando que los cambios de enfoque no afecten la calidad de su gestión ni la atención a los requerimientos del momento.',
        expectedBehaviors: 'El colaborador actúa como un mentor de autonomía operativa, delegando liderazgo y fortaleciendo el criterio técnico del equipo para potenciar su impacto estratégico.',
        observableItems: [
          'Guía a colaboradores en tareas de mayor responsabilidad, actuando como mentor técnico y conductual.',
          'Delega proyectos permitiendo que otros miembros asuman roles de liderazgo operativo.',
          'Proporciona retroalimentación orientada a mejorar el criterio y la autonomía de su equipo.',
          'Impulsa que otros propongan soluciones antes de escalar problemas a niveles superiores.',
          'Coordina esfuerzos asegurando que cada integrante comprenda su impacto en la estrategia.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Analistas, Operadores Integrales y Asesores',
        domainDescription: 'Demuestra apertura ante cambios en sus rutinas o tareas asignadas por su supervisor, ajustándose a nuevas instrucciones con disposición. Mantiene su nivel de cumplimiento ante variaciones en el entorno inmediato, mostrando receptividad para aprender nuevas formas de ejecutar sus responsabilidades cuando las condiciones habituales se modifican.',
        expectedBehaviors: 'El colaborador ofrece soporte reactivo y respetuoso, asistiendo a su equipo inmediato cuando se le requiere y asegurando que sus acciones no obstaculicen el flujo de trabajo grupal.',
        observableItems: [
          'Modela los estándares de excelencia y ética de la empresa, sirviendo como referente para sus pares.',
          'Guía a nuevos integrantes en sus funciones, actuando como un primer nivel de mentoría.',
          'Respalda y comunica las directrices de la dirección, facilitando la alineación del equipo con el cambio.',
          'Identifica y propone mejoras que impulsen el crecimiento y la eficiencia de sus compañeros.',
          'Resuelve problemas cotidianos con autonomía, demostrando criterios alineados a los valores organizacionales.'
        ]
      }
    }
  }
];

// ============================================================================
// II. COMPETENCIAS ESPECÍFICAS GERENCIALES Y/O DE SUPERVISIÓN (PÁG. 24-29)
// REGLA INSTITUCIONAL ESTRICTA: Todo personal que tenga gente a su cargo: Responsables, Coordinadores, Supervisores, Gerentes, Directores
// ============================================================================
export const SUPERVISION_ROLES = ['Coordinador', 'Supervisor', 'Gerente'];
export const BOARD_ROLES = ['Director', 'Presidente', 'Vicepresidente'];
export const OPERATIONAL_ROLES = ['Analista', 'Especialista', 'Responsable'];

export const SUPERVISION_COMPETENCIES: OfficialCompetency[] = [
  // 1. Liderar con el Ejemplo (pág. 24-25)
  {
    id: 'sup-1',
    name: 'Liderar con el Ejemplo',
    type: 'supervision',
    clusterLabel: 'Competencias de Supervisión y Mando',
    targetPositions: SUPERVISION_ROLES,
    definition: 'Es la capacidad de actuar como el referente ético y operacional de la organización, transformando los valores corporativos en acciones visibles y tangibles. Implica un estilo de liderazgo basado en la coherencia absoluta entre el discurso y la conducta, donde el líder demuestra activamente la excelencia que exige a los demás. Se manifiesta al asumir responsabilidades compartidas y "cargar el peso" de las iniciativas críticas junto al equipo, eliminando las brechas jerárquicas para forjar conexiones basadas en el compañerismo, la confianza mutua y la legitimidad del mando.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores / Gerentes Generales',
        domainDescription: 'Representa el estándar máximo de integridad y excelencia de la organización. Modela una conducta transformadora que trasciende su propia área, convirtiéndose en el espejo donde otros líderes y niveles jerárquicos se miran para tomar decisiones. Su comportamiento es la evidencia viva de los valores corporativos, logrando que su autenticidad y compromiso personal inspiren una cultura de coherencia global.',
        expectedBehaviors: 'Modela los valores corporativos bajo presión y garantiza la coherencia en los altos mandos, transformando la visión en un compromiso compartido que protege la credibilidad y la excelencia organizacional.',
        observableItems: [
          'Modela los valores corporativos en situaciones de alta presión, sirviendo como guía para toda la organización.',
          'Se involucra en la resolución de problemas estratégicos, demostrando que la dirección asume los mismos desafíos que el resto de los equipos.',
          'Asegura que todas las decisiones de alta gerencia sean coherentes con los valores promovidos, sin excepciones por rango.',
          'Transforma la visión de la empresa en un compromiso compartido, logrando que la estructura adopte la excelencia por convicción.',
          'Evalúa que el equipo directivo mantenga una conducta alineada con la cultura organizacional, protegiendo la credibilidad interna.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes y Supervisores',
        domainDescription: 'Modela la conducta de excelencia y compromiso necesaria para alcanzar los objetivos del área. Es el referente directo para sus colaboradores y pares, demostrando con su compromiso personal el nivel de esfuerzo y calidad que se espera del equipo. Al ser el primero en adoptar los estándares de desempeño, logra que su equipo lo siga por convicción y no por jerarquía.',
        expectedBehaviors: 'Lidera con profesionalismo y serenidad ante crisis, asumiendo la responsabilidad total del área para proteger al equipo y modelar el estándar de entrega e integridad que exige a los demás.',
        observableItems: [
          'Lidera a sus reportes directos con el mismo profesionalismo y coherencia que espera que ellos repliquen con sus propios equipos.',
          'Modela una postura resolutiva y serena ante cambios críticos, asegurando que el equipo mantenga el enfoque y la estabilidad emocional.',
          'Asume la responsabilidad final del área y protege a su equipo ante presiones externas, modelando lealtad y compromiso mutuo.',
          'Alinea decisiones y promesas con acciones diarias, logrando que el equipo lo siga por integridad y convicción.',
          'Se involucra en los desafíos de mayor impacto, demostrando con su propio esfuerzo el estándar de entrega que exige a los demás.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Coordinadores y Supervisores Jr.',
        domainDescription: 'Modela las conductas básicas y fundamentales de profesionalismo que deben seguir sus subordinados directos. Se constituye como un ejemplo de confiabilidad al cumplir con rigor los estándares, horarios, políticas y valores éticos básicos de la empresa. Su ejemplaridad se manifiesta en la consistencia de sus tareas diarias.',
        expectedBehaviors: 'Traduce directrices en metas claras y brinda soporte técnico continuo optimizando procesos y colaborando entre áreas para asegurar una ejecución fluida y libre de errores.',
        observableItems: [
          'Ejecuta sus tareas con un nivel de precisión y solidez que sirve de guía práctica para que el equipo replique la calidad esperada.',
          'Es el primero en aplicar los procesos y metodologías oficiales, eliminando la improvisación mediante su ejemplo de orden.',
          'Modela hábitos de eficiencia y cuidado de las herramientas de trabajo, estableciendo el estándar de responsabilidad material.',
          'Comparte proactivamente sus habilidades, convirtiéndose en el referente técnico al que subordinados y pares acuden para aprender.',
          'Asume la corrección inmediata ante fallos operativos, ajustando su conducta para modelar y prevenir futuros errores.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Mandos en Entrenamiento / Inducción',
        domainDescription: 'Actúa como un modelo de cumplimiento y respeto por los pilares fundamentales de la organización. Su ejemplaridad se manifiesta en la observancia personal y rigurosa de las normas, horarios, valores éticos y políticas internas.',
        expectedBehaviors: 'Modela el cumplimiento riguroso de normas y valores con honestidad y respeto, asumiendo la responsabilidad total de sus tareas y el uso de los recursos para servir de base al equipo.',
        observableItems: [
          'Cumple rigurosamente con los horarios, normas de seguridad y políticas internas, sirviendo como primer filtro de cumplimiento.',
          'Actúa con honestidad y transparencia en todas sus interacciones, sin ocultar información relevante ni manipular situaciones.',
          'Mantiene un trato respetuoso y profesional con subordinados y pares, incluso en situaciones de alta presión o desacuerdo.',
          'Asume la responsabilidad de sus tareas básicas sin excusas, demostrando una disciplina personal que sirve de base.',
          'Utiliza adecuadamente los activos y recursos de la empresa, modelando un uso responsable y honesto de los mismos.'
        ]
      }
    }
  },

  // 2. Orientación al Logro (pág. 26-27)
  {
    id: 'sup-2',
    name: 'Orientación al Logro',
    type: 'supervision',
    clusterLabel: 'Competencias de Supervisión y Mando',
    targetPositions: SUPERVISION_ROLES,
    definition: 'Es la capacidad para movilizar y alinear los recursos, procesos y el talento humano hacia el cumplimiento de los objetivos estratégicos de la organización. Implica actuar con agilidad y sentido de urgencia en la toma de decisiones clave, transformando la estrategia en resultados tangibles. Se caracteriza por la búsqueda incesante de la excelencia y la fijación de metas desafiantes que superen los estándares habituales, manteniendo niveles de alto rendimiento en el equipo, alineados con la visión y competitividad de la empresa.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores / Gerentes Corporativos',
        domainDescription: 'Capacidad para determinar la dirección estratégica de Canguro y asegurar que los recursos y procesos generen ventajas competitivas sostenibles. Implica definir los estándares de éxito anticipando tendencias del mercado y actuando con agilidad para liderar en innovación y consolidando una cultura de alto rendimiento que garantice la rentabilidad a largo plazo.',
        expectedBehaviors: 'Define estándares disruptivos y acelera cambios estructurales para generar ventajas competitivas, consolidando una cultura de alto rendimiento enfocada en la rentabilidad y la visión de futuro.',
        observableItems: [
          'Define estándares de éxito disruptivos que posicionan a la organización por delante de las tendencias y la competencia del mercado.',
          'Asegura que la estructura y los recursos de la compañía estén alineados para generar ventajas competitivas difíciles de replicar.',
          'Consolida una filosofía de alto rendimiento donde la excelencia y la autoexigencia son valores centrales en todos los niveles.',
          'Impulsa cambios estructurales con celeridad para capitalizar oportunidades de mercado antes que los competidores.',
          'Toma decisiones críticas que sacrifican la comodidad inmediata en favor de la rentabilidad y la visión de futuro a largo plazo.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes y Supervisores',
        domainDescription: 'Capacidad para transformar la estrategia en desafíos de alta exigencia que impulsen la superación constante del área. Implica optimizar procesos para eliminar barreras a la excelencia y liderar equipos mediante el modelado de la autoexigencia, fomentando un entorno competitivo que aspire a superar sistemáticamente los estándares de desempeño previos.',
        expectedBehaviors: 'Transforma la estrategia en desafíos aspiracionales y elimina barreras operativas, modelando la excelencia y el rigor para impulsar una cultura de superación constante.',
        observableItems: [
          'Traduce la estrategia en desafíos aspiracionales que obligan al equipo a superar sus niveles habituales de rendimiento.',
          'Rediseña la operativa interna para eliminar cualquier obstáculo técnico que limite la búsqueda de la excelencia.',
          'Modela el entregable de sus acciones como estándar de referencia, retando a sus colaboradores a superar sus propias marcas.',
          'Interviene con rigor inmediato ante desviaciones en la calidad, asegurando que el equipo retome el alto rendimiento exigido.',
          'Fomenta un entorno de superación y aprendizaje continuo que permite al área evolucionar al ritmo de las nuevas exigencias.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Coordinadores y Encargados',
        domainDescription: 'Capacidad para gestionar recursos y procesos con un alto sentido de autoexigencia, asegurando que el área alcance y supere los estándares de calidad establecidos. Se manifiesta en la optimización de los métodos de trabajo y en una actitud competitiva orientada a mejorar los niveles de rendimiento previos.',
        expectedBehaviors: 'Eleva los estándares de calidad y moviliza al equipo hacia la mejora continua, eliminando obstáculos para asegurar que cada tarea se cumpla con rigor y excelencia.',
        observableItems: [
          'Ajusta los métodos de trabajo del área para elevar la calidad por encima de los niveles de periodos anteriores.',
          'Supervisa que la ejecución de tareas bajo su responsabilidad cumpla con estándares técnicos de alta exigencia.',
          'Establece desafíos que fomentan la competitividad y rompen la inercia operativa del equipo.',
          'Interviene con celeridad ante obstáculos que comprometan el rigor o la calidad de los entregables del área.',
          'Promueve el cuidado por el detalle y la mejora continua como cultura de trabajo entre sus colaboradores.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Supervisores en Formación',
        domainDescription: 'Capacidad para realizar las funciones asignadas con un alto grado de autoexigencia y excelencia en cada entrega. Se manifiesta en la voluntad de superar el desempeño previo y en el compromiso con el desarrollo de las propias competencias técnicas.',
        expectedBehaviors: 'El colaborador optimiza constantemente sus métodos para superar los estándares de calidad, capacitándose de forma proactiva y asumiendo desafíos complejos que fortalezcan los resultados del equipo.',
        observableItems: [
          'Asegura que su trabajo supere los estándares mínimos mediante una revisión rigurosa y precisión en la ejecución.',
          'Busca optimizar constantemente sus tiempos y métodos en comparación con su desempeño anterior.',
          'Identifica brechas de conocimiento y busca capacitación proactiva para elevar su destreza técnica.',
          'Asume tareas complejas con actitud competitiva, transformándolas en oportunidades de crecimiento personal.',
          'Ejecuta sus labores con un nivel de calidad que sirve como base confiable para los resultados del equipo.'
        ]
      }
    }
  },

  // 3. Desarrollo de Equipos (pág. 28-29)
  {
    id: 'sup-3',
    name: 'Desarrollo de Equipos',
    type: 'supervision',
    clusterLabel: 'Competencias de Supervisión y Mando',
    targetPositions: SUPERVISION_ROLES,
    definition: 'Es la capacidad para potenciar el talento colectivo, transformando un grupo de individuos en una unidad cohesionada de alto rendimiento con un propósito claro. Implica la habilidad para identificar y potenciar las fortalezas individuales, fomentar la sinergia a través de la diversidad y crear un entorno de confianza y comunicación abierta. El líder integra el desarrollo y las aspiraciones de sus colaboradores con la estrategia de la compañía, logrando que el crecimiento profesional del equipo sea el catalizador para alcanzar los desafíos organizacionales.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores / Alta Dirección',
        domainDescription: 'Consolida el desarrollo de equipos como cultura organizacional. Define la visión de largo plazo de la organización a través de su gente, asegura la sucesión estratégica y actúa como mentor de líderes para garantizar la sostenibilidad y ventaja competitiva de la empresa.',
        expectedBehaviors: 'Dirige la estrategia de talento a largo plazo y modela una cultura de alto rendimiento, desarrollando líderes y entornos de aprendizaje para asegurar el éxito y continuidad del negocio.',
        observableItems: [
          'Establece la estrategia de talento a largo plazo, asegurando que el crecimiento de las personas impulse la competitividad.',
          'Actúa como referente de una cultura de alto rendimiento, donde el desarrollo colectivo es un valor central.',
          'Ejerce como mentor de mandos medios, facultándolos para que ellos, a su vez, desarrollen a sus propios equipos.',
          'Garantiza la continuidad del negocio preparando a los futuros líderes para ocupar roles críticos de manera efectiva.',
          'Diseña entornos que promueven el aprendizaje continuo, asegurando que el talento sea el motor del éxito futuro.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes y Supervisores',
        domainDescription: 'Integra las aspiraciones de los colaboradores con los desafíos estratégicos del área. Potencia roles críticos, lidera procesos de fortalecimiento de competencias y gestiona la diversidad para eliminar barreras a la sinergia, elevando el estándar de desempeño colectivo.',
        expectedBehaviors: 'Alinea y potencia el talento del área hacia el alto rendimiento, actualizando competencias y unificando la diversidad para superar los estándares actuales.',
        observableItems: [
          'Conecta las metas profesionales de los colaboradores con los desafíos estratégicos del área para generar compromiso.',
          'Identifica y potencia roles críticos, asegurando que cada integrante aporte su máximo valor según sus fortalezas.',
          'Dirige el fortalecimiento de competencias y la actualización profesional para enfrentar desafíos de mayor complejidad.',
          'Lidera la armonización de distintos puntos de vista, creando un ecosistema de trabajo donde la diversidad fortalece el rendimiento.',
          'Impulsa una mentalidad de alto rendimiento que motiva al equipo a superar sistemáticamente sus estándares previos.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Coordinadores y Líderes de Turno',
        domainDescription: 'Gestiona su reporte directo asegurando cohesión, confianza y comunicación fluida. Asigna tareas según fortalezas individuales, resuelve conflictos cotidianos y garantiza que el crecimiento técnico del equipo se traduzca en excelencia operativa diaria.',
        expectedBehaviors: 'Optimiza la eficiencia distribuyendo tareas por capacidad, facilitando la comunicación y resolviendo desacuerdos en un entorno seguro que fomenta el aprendizaje diario.',
        observableItems: [
          'Distribuye tareas identificando las capacidades técnicas de cada colaborador para maximizar la eficiencia del área.',
          'Mantiene canales de diálogo abiertos y constantes, asegurando que la información crítica fluya sin distorsiones.',
          'Interviene oportunamente ante diferencias de opinión cotidianas, transformándolas en acuerdos que fortalecen la cohesión.',
          'Fomenta el perfeccionamiento de habilidades en su equipo, asegurando que el aprendizaje se aplique en la excelencia operativa.',
          'Crea un entorno de seguridad y respeto donde los colaboradores se sienten respaldados para proponer y colaborar.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Líderes Emergentes / Tutores',
        domainDescription: 'Se integra proactivamente en las dinámicas grupales, aportando comunicación transparente y apoyo mutuo. Muestra apertura al aprendizaje, respeta la diversidad de roles y reconoce cómo su mejora personal impacta en el éxito del equipo.',
        expectedBehaviors: 'Colabora proactivamente, comparte información y aplica la retroalimentación, adaptando su trabajo individual para sumar al éxito y rendimiento colectivo.',
        observableItems: [
          'Participa con iniciativa en las tareas grupales y ofrece apoyo constante a sus compañeros para el logro de metas comunes.',
          'Comparte información relevante de manera clara y oportuna, facilitando un entorno de confianza y respeto mutuo.',
          'Valora los diferentes roles y perspectivas del equipo, adaptando su trabajo para potenciar su sinergia.',
          'Recibe la retroalimentación de forma constructiva y busca activamente fortalecer sus competencias para aportar más al equipo.',
          'Ejecuta sus responsabilidades entendiendo que la calidad de su trabajo individual es clave para el alto rendimiento colectivo.'
        ]
      }
    }
  }
];

// ============================================================================
// III. COMPETENCIAS ESPECÍFICAS DE JUNTA DIRECTIVA (PÁG. 18-23)
// Alta Dirección, Presidencia y Miembros de Comité Ejecutivo / Directores
// ============================================================================
export const BOARD_COMPETENCIES: OfficialCompetency[] = [
  // 1. Líder de Líderes (pág. 18-19)
  {
    id: 'brd-1',
    name: 'Líder de Líderes',
    type: 'board',
    clusterLabel: 'Competencias de Junta Directiva y Alta Dirección',
    targetPositions: ['Director', 'Presidente', 'Vicepresidente'],
    definition: 'Es la capacidad para inspirar, modelar y empoderar a otros líderes de la organización, alineando sus esfuerzos con la visión estratégica a largo plazo. Implica actuar con un rol de mentoría hacia los líderes a cargo, fomentando la autonomía y la toma de decisiones de alto impacto para asegurar la continuidad del negocio mediante la formación de cuadros de reemplazo, de modo que se cree una cultura donde el liderazgo se multiplique y se transmita de forma coherente en todos los niveles.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Junta Directiva / Presidencia',
        domainDescription: 'Define la estrategia de liderazgo y los estándares éticos de la organización para asegurar la sostenibilidad del negocio a largo plazo. Establece las directrices para que la cultura organizacional se transforme en modelos de gestión de alto desempeño, garantizando que el propósito de la compañía se multiplique con coherencia en toda la estructura.',
        expectedBehaviors: 'El colaborador actúa como garante de la coherencia institucional, supervisando que el liderazgo y la alta gerencia ejecuten la estrategia bajo principios de integridad, ética y autonomía responsable.',
        observableItems: [
          'Supervisa que la estructura de liderazgo esté alineada con los desafíos estratégicos y la visión de futuro.',
          'Asegura que la alta gerencia ejecute la estrategia con integridad y apego a los valores corporativos.',
          'Promueve un entorno de alta dirección basado en la autonomía y la responsabilidad por los resultados.',
          'Valida que el propósito de la organización se traduzca en una gestión de alto impacto en todas las áreas.',
          'Actúa como custodio de la cultura, exigiendo excelencia y ética en la toma de decisiones de primer nivel.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Directores de Área',
        domainDescription: 'Gestiona de manera efectiva a otros líderes asegurando que cuenten con el criterio necesario para guiar a sus propios equipos hacia la excelencia. Identifica y potencia el talento con perfil directivo para acelerar su crecimiento, mientras monitorea que el desempeño de los niveles secundarios se mantenga alineado con la cultura de alto impacto.',
        expectedBehaviors: 'Potencia el liderazgo multiplicador mediante el desarrollo de sucesores y la optimización de recursos, asegurando un clima laboral positivo y la ejecución coherente de la estrategia en todos sus niveles.',
        observableItems: [
          'Desarrolla competencias directivas en sus reportes para que lideren sus grupos con éxito.',
          'Identifica y potencia cuadros de reemplazo para posiciones clave en su área.',
          'Reorganiza recursos y planes permitiendo que sus líderes operen con agilidad.',
          'Evalúa y mejora el clima laboral de los equipos bajo su supervisión indirecta.',
          'Asegura que la visión estratégica sea ejecutada con coherencia en todos sus niveles.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Gerentes de Primera Línea',
        domainDescription: 'Inicia la formación de otros mediante la delegación de responsabilidades y el fomento de la iniciativa, actuando como un referente que guía a colaboradores en la adopción de roles de mayor impacto. Brinda retroalimentación para fortalecer el criterio y la toma de decisiones en su entorno.',
        expectedBehaviors: 'El colaborador actúa como un mentor de autonomía operativa, delegando liderazgo y fortaleciendo el criterio técnico del equipo para potenciar su impacto estratégico.',
        observableItems: [
          'Guía a colaboradores en tareas de mayor responsabilidad, actuando como mentor técnico y conductual.',
          'Delega proyectos permitiendo que otros miembros asuman roles de liderazgo operativo.',
          'Proporciona retroalimentación orientada a mejorar el criterio y la autonomía de su equipo.',
          'Impulsa que otros propongan soluciones antes de escalar problemas a niveles superiores.',
          'Coordina esfuerzos asegurando que cada integrante comprenda su impacto en la estrategia.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Mandos Tácticos',
        domainDescription: 'Actúa como un referente de autogestión y excelencia técnica en su entorno, modelando los comportamientos que la organización espera de sus futuros líderes. Colabora activamente en la inducción y el desarrollo inicial de sus pares.',
        expectedBehaviors: 'Modela la excelencia y ética institucional, actuando como referente y mentor que impulsa la eficiencia de sus pares y la resolución autónoma de problemas bajo los valores de la organización.',
        observableItems: [
          'Modela los estándares de excelencia y ética de la empresa, siguiendo como referente para sus pares.',
          'Guía a nuevos integrantes en sus funciones, actuando como un primer nivel de mentoría.',
          'Respalda y comunica las directrices de la dirección, facilitando la alineación del equipo con el cambio.',
          'Identifica y propone mejoras que impulsen el crecimiento y la eficiencia de sus compañeros.',
          'Resuelve problemas cotidianos con autonomía, demostrando criterios alineados a los valores organizacionales.'
        ]
      }
    }
  },

  // 2. Pensamiento Estratégico (pág. 20-21)
  {
    id: 'brd-2',
    name: 'Pensamiento Estratégico',
    type: 'board',
    clusterLabel: 'Competencias de Junta Directiva y Alta Dirección',
    targetPositions: ['Director', 'Presidente', 'Vicepresidente'],
    definition: 'Es la capacidad de integrar el análisis crítico y la visión de futuro para anticipar desafíos y oportunidades, asegurando el éxito organizacional a largo plazo. Implica diagnosticar entornos complejos con agilidad, establecer objetivos de alto impacto y tomar decisiones informadas que alineen la operación con el propósito estratégico, navegando la incertidumbre para impulsar un crecimiento sostenible.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Junta Directiva / Presidencia',
        domainDescription: 'El colaborador determina el rumbo de la organización mediante un pensamiento visionario y crítico que anticipa cambios disruptivos, transformando la complejidad del entorno en decisiones de alto impacto. Establece las directrices estratégicas que rigen la resolución de problemas sistémicos.',
        expectedBehaviors: 'Anticipa cambios críticos y toma decisiones estratégicas de alta complejidad, garantizando la agilidad organizacional y la alineación de la alta gerencia con el propósito del negocio.',
        observableItems: [
          'Anticipa cambios críticos en el entorno laboral, ajustando la visión estratégica para asegurar la continuidad.',
          'Toma decisiones de alta complejidad basadas en un análisis riguroso de riesgos y beneficios a largo plazo.',
          'Valida soluciones estratégicas a dificultades complejas, garantizando agilidad organizacional ante la crisis.',
          'Garantiza la alineación entre la visión corporativa y la ejecución estratégica de la alta gerencia.',
          'Exige un pensamiento crítico en la toma de decisiones, fundamentado en datos y el propósito del negocio.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Directores de Área',
        domainDescription: 'El colaborador traduce la visión estratégica en planes tácticos de alto impacto, utilizando el pensamiento analítico para resolver problemas de gestión y optimizar recursos. Lidera con agilidad y pensamiento crítico, tomando decisiones que equilibran los resultados inmediatos con los objetivos de largo plazo.',
        expectedBehaviors: 'Potencia el liderazgo multiplicador mediante el desarrollo de sucesores y la optimización de recursos, asegurando un clima laboral positivo y la ejecución coherente de la estrategia.',
        observableItems: [
          'Alinea los planes operativos con los objetivos estratégicos para asegurar que cada iniciativa genere valor real.',
          'Resuelve problemas de gestión mediante diagnósticos críticos y la implementación de soluciones ágiles.',
          'Toma decisiones informadas basadas en el análisis de datos y la evaluación de riesgos del entorno.',
          'Adapta la operatividad con flexibilidad ante cambios en las prioridades para mantener la competitividad.',
          'Impulsa la colaboración interdisciplinaria para agilizar la ejecución de la estrategia.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Gerentes de Área',
        domainDescription: 'El colaborador aplica el pensamiento crítico y analítico para diagnosticar situaciones y resolver problemas operativos de forma proactiva. Asegura que su toma de decisiones facilite el cumplimiento de las metas del área, demostrando agilidad para adaptarse a nuevos desafíos.',
        expectedBehaviors: 'El colaborador actúa como un mentor de autonomía operativa, delegando liderazgo y fortaleciendo el criterio técnico del equipo para potenciar su impacto estratégico.',
        observableItems: [
          'Analiza datos del entorno para identificar causas raíz y prevenir fallas operativas.',
          'Resuelve problemas cotidianos mediante soluciones proactivas y eficientes.',
          'Toma decisiones operativas alineadas con los estándares de rendimiento del equipo.',
          'Se adapta con agilidad a cambios en procesos o herramientas de trabajo.',
          'Colabora de forma abierta, comunicando ideas que mejoren la coordinación grupal.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Mandos Tácticos',
        domainDescription: 'El colaborador ejecuta sus funciones con conciencia de cómo su desempeño individual contribuye al cumplimiento de la visión organizacional. Utiliza el pensamiento analítico para resolver problemas cotidianos y demuestra agilidad para aprender.',
        expectedBehaviors: 'Alinea su esfuerzo diario con los objetivos del negocio, optimizando recursos mediante el reporte proactivo de mejoras y una colaboración abierta que facilita el logro de metas.',
        observableItems: [
          'Relaciona sus tareas diarias con la visión del negocio, asegurando que su esfuerzo sume a los objetivos del área.',
          'Identifica y reporta problemas operativos, sugiriendo soluciones que mejoren la eficiencia del grupo.',
          'Se adapta con agilidad a cambios en las prioridades, manteniendo el enfoque en los resultados esperados.',
          'Analiza su propio desempeño, buscando optimizar recursos y tiempos en favor de la estrategia.',
          'Colabora activamente compartiendo información clave, facilitando el logro de las metas colectivas.'
        ]
      }
    }
  },

  // 3. Gestión del Cambio y Desarrollo de la Organización (pág. 22-23)
  {
    id: 'brd-3',
    name: 'Gestión del Cambio y Desarrollo de la Organización',
    type: 'board',
    clusterLabel: 'Competencias de Junta Directiva y Alta Dirección',
    targetPositions: ['Director', 'Presidente', 'Vicepresidente'],
    definition: 'Es la capacidad de liderar la transformación cultural y estructural necesaria para que la empresa evolucione ante los desafíos del mercado. Implica asegurar que la organización sea lo suficientemente flexible para adoptar nuevos modelos de negocio, promoviendo una cultura de aprendizaje y garantizando que las capacidades internas se desarrollen al ritmo de la visión estratégica.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Junta Directiva / Presidencia',
        domainDescription: 'Establece la visión y directrices para la transformación de la compañía, asegurando que la estructura y la cultura evolucionen de forma sostenible. Valida la viabilidad de los procesos de cambio crítico y garantiza que la organización desarrolle las capacidades necesarias para enfrentar el futuro.',
        expectedBehaviors: 'Autoriza y promueve transformaciones estratégicas, validando su viabilidad financiera y cultural para garantizar la competitividad y la capacidad de respuesta de la empresa ante entornos disruptivos.',
        observableItems: [
          'Autoriza las transformaciones estratégicas, alineándolas con la visión de largo plazo del negocio.',
          'Evalúa y valida el impacto financiero y cultural, asegurando que los valores respalden los nuevos modelos.',
          'Valida la capacidad de respuesta de la empresa ante cambios disruptivos o crisis en la industria.',
          'Garantiza la inversión en capacidades críticas necesarias para mantener la competitividad futura.',
          'Actúa como patrocinador del cambio, exigiendo rendición de cuentas sobre la efectividad de las transiciones.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Directores de Área',
        domainDescription: 'Traduce las directrices estratégicas en planes de acción concretos para su área. Se enfoca en gestionar la transición de capacidades del capital humano, mitigando activamente la resistencia y facilitando la adopción de nuevos modelos operativos y de negocio.',
        expectedBehaviors: 'Diseña la hoja de ruta del cambio en su área, gestionando activamente las resistencias del equipo y optimizando flujos de trabajo transversales para asegurar la agilidad.',
        observableItems: [
          'Diseña e implementa la hoja de ruta de cambio específica para su área.',
          'Interviene sobre las actitudes individuales frente al cambio, neutralizando resistencias y consolidando el compromiso.',
          'Impulsa programas de formación para cerrar brechas de competencia en su equipo.',
          'Optimiza los flujos de trabajo de su área para eliminar barreras que impidan agilidad.',
          'Impulsa la colaboración transversal para asegurar esfuerzos integrados hacia los nuevos objetivos.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Gerentes de Área',
        domainDescription: 'El colaborador facilita la implementación del cambio en la ejecución diaria. Actúa como puente operativo, adaptando procesos y brindando soporte para que los equipos asimilen nuevas metodologías sin comprometer la operatividad del área.',
        expectedBehaviors: 'Traduce directrices en metas claras y brinda soporte técnico continuo optimizando procesos y colaborando entre áreas para asegurar una ejecución fluida y libre de errores.',
        observableItems: [
          'Traduce las directrices de la gerencia en metas diarias claras y alcanzables para su grupo de trabajo.',
          'Brinda soporte técnico y herramientas constantes para que sus colaboradores superen la curva de aprendizaje.',
          'Propone ajustes en los procedimientos diarios que faciliten la adopción de las nuevas directrices.',
          'Colabora de forma transversal con otros líderes para eliminar las dificultades operativas entre áreas.',
          'Registra y comparte las lecciones aprendidas durante la implementación para evitar la repetición de errores.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Mandos Tácticos',
        domainDescription: 'El colaborador tiene la capacidad de adaptación individual y flexibilidad conductual ante los cambios del entorno laboral inmediato. Se enfoca en la apertura para aprender nuevos métodos de trabajo y en el ajuste efectivo de sus conductas individuales.',
        expectedBehaviors: 'Alinea su esfuerzo diario con los objetivos del negocio, optimizando recursos mediante el reporte proactivo de mejoras y una colaboración abierta.',
        observableItems: [
          'Modifica sus métodos de trabajo y prioridades con rapidez cuando las necesidades del área cambian.',
          'Mantiene un desempeño productivo y una actitud positiva incluso en periodos de transición.',
          'Participa con entusiasmo en capacitaciones para adquirir las nuevas habilidades requeridas.',
          'Expresa dudas o sugerencias sobre los nuevos procesos de manera constructiva y orientada a la solución.',
          'Incorpora y cumple con los nuevos estándares o reglas de trabajo sin necesidad de supervisión constante.'
        ]
      }
    }
  }
];

// ============================================================================
// IV. COMPETENCIAS ESPECÍFICAS POR ÁREA (SEGMENTADAS POR DIRECCIÓN, PÁG. 30-47)
// ============================================================================

// CLUSTER 1: DE CARA AL CLIENTE: MOTORES DE VENTA (Pág. 30-35)
// Aplica a: Dirección Comercial, Dirección de Compras, Dirección de Operaciones
export const AREA_SALES_DIRECTORATES = [
  'Dirección Comercial',
  'Dirección de Compras',
  'Dirección de Operaciones'
];

export const AREA_SALES_COMPETENCIES: OfficialCompetency[] = [
  // 1. Gestión de Indicadores (pág. 30-31)
  {
    id: 'area-sales-1',
    name: 'Gestión de Indicadores',
    type: 'area_sales',
    clusterLabel: 'De Cara al Cliente: Motores de Venta',
    targetDirectorates: AREA_SALES_DIRECTORATES,
    definition: 'Es la facultad para analizar, interpretar y accionar de forma sistemática las métricas cuantitativas y cualitativas de rendimiento que rigen el negocio del comercio al por menor (tales como ticket promedio, tasa de conversión, transacciones, rotación de inventarios, merma y margen comercial). Implica la capacidad analítica de transformar los datos numéricos aislados del punto de venta en decisiones comerciales y operativas inmediatas, orientadas a corregir desviaciones, predecir comportamientos de consumo y optimizar de manera sostenible la rentabilidad por metro cuadrado de la superficie de venta.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores / Gerentes Comerciales',
        domainDescription: 'Establece la visión y el plan financiero anual de la organización, fijando las metas macro de ingresos, rentabilidad global y presupuestos de inversión. Evalúa periódicamente los estados de resultados consolidados de la compañía y, ante desviaciones críticas en el entorno o en el negocio, redefine las políticas institucionales.',
        expectedBehaviors: 'Define metas financieras macro y evalúa resultados consolidados anuales. Redefine políticas ante desviaciones críticas para asegurar la sostenibilidad y crecimiento de la empresa.',
        observableItems: [
          'Diseña las metas macro del negocio asegurando la alineación de los indicadores de retail con la estrategia.',
          'Evalúa de forma sistémica los estados de resultados consolidados identificando amenazas u oportunidades.',
          'Redefine y reestructura con agilidad las políticas o modelos comerciales ante desviaciones críticas.',
          'Promueve proactivamente una cultura basada en analítica de datos impulsando herramientas avanzadas.',
          'Valida y autoriza planes de expansión o inversiones basándose en proyecciones de rentabilidad por metro cuadrado.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes de Ventas / Supervisores de Tienda',
        domainDescription: 'Audita y controla sistemáticamente los tableros de rendimiento y métricas clave de las áreas o zonas bajo su cargo. Diseña, implementa y lidera estrategias y planes de acción tácticos a mediano plazo para corregir desviaciones operativas o comerciales, asegurando el cumplimiento de las cuotas de valor y los márgenes presupuestados.',
        expectedBehaviors: 'Diseña y lidera estrategias y planes de acción tácticos para corregir desviaciones operativas o comerciales, asegurando el cumplimiento de los márgenes presupuestados.',
        observableItems: [
          'Audita y controla los tableros de control de KPI´s (conversión, ticket promedio, merma) de su área específica.',
          'Diseña e implementa planes tácticos a mediano plazo para corregir desviaciones comerciales u operativas.',
          'Garantiza las cuotas de venta y los márgenes comerciales presupuestados, coordinando y exigiendo resultados.',
          'Desarrolla e implementa estrategias locales de optimización del inventario y control de pérdidas.',
          'Capacita y alinea a los líderes de su equipo en la interpretación de indicadores clave para decisiones por datos.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Encargados de Tienda / Especialistas Comerciales',
        domainDescription: 'Extrae, cruza y analiza de forma autónoma los reportes y datos cuantitativos de los sistemas de gestión asignados. Identifica tendencias, anomalías o desviaciones de corto plazo en el rendimiento de su canal, producto, campaña o proyecto, y desarrolla e implementa propuestas de ajustes técnicos.',
        expectedBehaviors: 'Analiza autónomamente datos para identificar desviaciones a corto plazo e implementa ajustes técnicos que optimicen la rentabilidad por tienda.',
        observableItems: [
          'Extrae y consolida con total autonomía reportes cuantitativos provenientes de ERP, BI o POS.',
          'Identifica con rapidez anomalías, caídas en la tasa de conversión o tendencias negativas en su canal.',
          'Desarrolla e implementa propuestas de ajustes técnicos inmediatos (exhibición, promociones, reubicación de stock).',
          'Evalúa constantemente el rendimiento del stock asignado proponiendo acciones para evitar obsolescencia.',
          'Genera reportes analíticos periódicos con insights claros y recomendaciones fundamentadas en números.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Asesores Integrales / Cajeros',
        domainDescription: 'Ejecuta las actividades de su cargo asegurando el cumplimiento de los objetivos asignados. Procesa, consolida y reporta con exactitud la información y los registros de su área, aplicando los estándares operacionales y comerciales dictados por sus superiores.',
        expectedBehaviors: 'Ejecuta sus tareas cumpliendo objetivos, reporta información exacta y aplica estándares operativos para mitigar pérdidas y lograr la meta del área.',
        observableItems: [
          'Ejecuta las operaciones cotidianas del piso de venta orientando su esfuerzo al cumplimiento de metas individuales.',
          'Procesa, registra y reporta con absoluta exactitud la información comercial (cierres de caja, conteos, ingresos).',
          'Aplica rigurosamente los estándares comerciales (cuidado del layout, control de mermas, marcaje de precios).',
          'Alerta oportunamente a su supervisor sobre quiebres de inventario, fallas de cobro o anomalías operativas.',
          'Sigue con disciplina las instrucciones técnicas dadas para revertir un bajo desempeño en sus métricas diarias.'
        ]
      }
    }
  },

  // 2. Visual Merchandising (pág. 32-33)
  {
    id: 'area-sales-2',
    name: 'Visual Merchandising',
    type: 'area_sales',
    clusterLabel: 'De Cara al Cliente: Motores de Venta',
    targetDirectorates: AREA_SALES_DIRECTORATES,
    definition: 'Es la capacidad técnica y estética para diseñar, planificar e implementar la estrategia de comunicación visual, el diseño de interiores (layout) y la exhibición de mercancías en los puntos de venta. Involucra el uso correcto de planogramas, la gestión eficiente del espacio en anaquel, la colocación estratégica de material promocional (POP) y la creación de un recorrido de compra fluido y atractivo. El objetivo es asegurar la consistencia de la imagen de marca, estimular la compra por impulso y transformar el piso de venta en un entorno comercialmente eficiente que hable por sí mismo al consumidor.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores / Gerentes de Marca y Mercadeo',
        domainDescription: 'Define la estrategia de identidad corporativa, el concepto estético institucional y el modelo de experiencia del cliente para todos los canales de la marca. Autoriza las inversiones de capital para el desarrollo de nuevos formatos comerciales o proyectos de gran alcance, evaluando el impacto de la imagen en el posicionamiento del mercado.',
        expectedBehaviors: 'Define la estrategia de identidad y experiencia del cliente en tienda. Autoriza inversiones en nuevos formatos, evaluando su impacto en el posicionamiento del mercado.',
        observableItems: [
          'Define la estrategia global de identidad corporativa, el concepto estético y el modelo de experiencia.',
          'Autoriza inversiones de capital destinadas al desarrollo de nuevos formatos comerciales o remodelaciones.',
          'Evalúa el impacto de la imagen institucional en el posicionamiento estratégico y reputación de la empresa.',
          'Aprueba las directrices maestras de diseño y arquitectura comercial para asegurar homogeneidad.',
          'Fija los estándares de innovación visual y tecnológica que mantengan a la cadena a la vanguardia.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Especialistas y Supervisores de Merchandising',
        domainDescription: 'Dicta y supervisa los lineamientos de exhibición, presentación de soluciones, campañas estacionales y distribución de espacios comerciales en los canales bajo su responsabilidad. Asegura la alineación entre la estrategia conceptual del negocio y la realidad de la ejecución.',
        expectedBehaviors: 'Dicta lineamientos de exhibición y campañas estacionales. Asegura y audita que la disposición del entorno esté alineada a la estrategia para maximizar el tráfico y la rentabilidad.',
        observableItems: [
          'Dicta y difunde los lineamientos de exhibición comercial, campañas estacionales y uso del espacio.',
          'Audita periódicamente los puntos de venta para asegurar que la ejecución física se alinee con la estrategia.',
          'Supervisa que la distribución del mobiliario y el layout maximicen efectivamente el flujo de tráfico.',
          'Coordina con compras y operaciones el calendario de lanzamientos estacionales para sincronizar stock y vitrina.',
          'Lidera las acciones correctivas inmediatas cuando las auditorías muestran un deterioro de los estándares.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Visual Merchandisers de Campo / Encargados',
        domainDescription: 'Diseña y desarrolla de forma autónoma las herramientas técnicas, guías, planogramas o estructuras de comunicación visual para las campañas o proyectos asignados. Coordina con los equipos de ejecución o aliados externos la correcta implementación de estos estándares.',
        expectedBehaviors: 'Diseña de forma autónoma herramientas técnicas, guías y planogramas. Coordina con equipos o aliados externos su implementación para asegurar consistencia de marca y rotación.',
        observableItems: [
          'Diseña de forma autónoma las herramientas técnicas, guías visuales y planogramas detallados.',
          'Coordina con proveedores externos y equipos internos la producción e instalación del material POP.',
          'Desarrolla la distribución en anaquel garantizando que la colocación estimule la compra por impulso.',
          'Capacita y asesora técnicamente al personal operativo de las tiendas sobre la correcta interpretación de guías.',
          'Analiza la efectividad comercial de las exhibiciones (zonas frías y calientes) y propone ajustes técnicos.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Asesores de Piso / Reponedores',
        domainDescription: 'Ejecuta y mantiene de forma directa la presentación, orden, actualización y disponibilidad de los productos, catálogos o espacios asignados según las instrucciones recibidas. Aplica rigurosamente las pautas de precios, material promocional o exhibición del área.',
        expectedBehaviors: 'Mantiene directamente el orden, actualización y disponibilidad de productos según las instrucciones. Aplica pautas de precios y exhibición, reportando cualquier anomalía.',
        observableItems: [
          'Ejecuta físicamente el acomodo, orden y limpieza de productos en anaqueles siguiendo el planograma.',
          'Mantiene actualizada y disponible la exhibición de mercancía, reponiendo de forma inmediata quiebres visuales.',
          'Aplica rigurosamente las pautas de precios, etiquetado y colocación del material promocional vigente.',
          'Reporta oportunamente a su supervisor cualquier daño en mobiliario o falta de material POP.',
          'Asegura que el recorrido de compra de su pasillo esté libre de obstáculos y visualmente atractivo.'
        ]
      }
    }
  },

  // 3. Negociación Comercial (pág. 34-35)
  {
    id: 'area-sales-3',
    name: 'Negociación Comercial',
    type: 'area_sales',
    clusterLabel: 'De Cara al Cliente: Motores de Venta',
    targetDirectorates: AREA_SALES_DIRECTORATES,
    definition: 'Es la idoneidad técnica para estructurar, desarrollar y optimizar el portafolio de productos y la red de proveedores de la organización. Comprende el dominio de metodologías para la planificación de compras enfocadas en el retail, así como la destreza para conducir negociaciones comerciales complejas bajo criterios de mutuo beneficio (definiendo costos de adquisición, plazos de pago, niveles de servicio de entrega, devoluciones y apoyos para mercadeo). Su enfoque está dirigido a garantizar la disponibilidad continua del producto correcto, en el momento oportuno, blindando el margen de ganancia y asegurando la competitividad de la empresa en el mercado.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores Comerciales / Compras Macro',
        domainDescription: 'Establece la política global de alianzas, relaciones comerciales e inversiones de la compañía. Lidera y autoriza acuerdos institucionales o contratos macro de alta complejidad y largo plazo con corporaciones, socios estratégicos o grandes cuentas, blindando el patrimonio, los márgenes de ganancia y la competitividad a futuro del negocio.',
        expectedBehaviors: 'Establece las políticas globales de alianzas e inversiones. Lidera contratos macro de alta complejidad a largo plazo para blindar el capital, los márgenes y la competitividad del negocio.',
        observableItems: [
          'Diseña políticas globales de negociación y marcos de actuación comercial para proveedores y cuentas clave.',
          'Lidera y cierra acuerdos institucionales complejos y contratos macro de largo plazo con socios estratégicos.',
          'Valida y autoriza planes de inversión comercial y estructuras de precios que protejan los márgenes globales.',
          'Evalúa los riesgos de mercado y financieros en negociaciones de gran envergadura garantizando sostenibilidad.',
          'Define el modelo relacional de la empresa promoviendo persuasión estratégica y beneficio mutuo.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes de Compras / Cuentas Clave',
        domainDescription: 'Estructura y gestiona la cartera de proveedores, agencias, ubicaciones o aliados comerciales de las áreas bajo su cargo. Diseña las estrategias tácticas de negociación (volúmenes, plazos, presupuestos o costos de adquisición) y audita el cumplimiento de los niveles de servicio contractuales.',
        expectedBehaviors: 'Gestiona la cartera de proveedores y diseña las estrategias tácticas de negociación. Audita el cumplimiento contractual para garantizar la rentabilidad y continuidad del negocio.',
        observableItems: [
          'Estructura y optimiza tanto la cartera de proveedores como el portafolio de clientes clave bajo su cargo.',
          'Diseña las estrategias tácticas de negociación fijando metas claras de volumen, plazos, costos y cierres.',
          'Audita el cumplimiento de los niveles de servicio y condiciones contractuales pactadas.',
          'Desarrolla planes de contingencia comerciales para asegurar la continuidad del flujo de caja e inventario.',
          'Lidera la resolución de conflictos comerciales o reclamos de alto impacto escalados por su equipo.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Compradores Jr. / Ejecutivos Comerciales',
        domainDescription: 'Conduce de forma autónoma negociaciones operativas y cotidianas con los diferentes socios comerciales asignados a su gestión. Resuelve discrepancias en costos, entregas, pautas o contratos, evalúa formalmente el desempeño de los proveedores y asegura que el flujo de recursos cumpla con las necesidades del área.',
        expectedBehaviors: 'Conduce autónomamente negociaciones cotidianas y resuelve discrepancias operativas. Evalúa a los proveedores para asegurar que el flujo de recursos cumpla con las necesidades del área.',
        observableItems: [
          'Conduce de manera autónoma negociaciones cotidianas (costos, plazos, apoyos de mercadeo) con proveedores.',
          'Resuelve discrepancias comerciales operativas relacionadas con diferencias en costos, pautas o entregas.',
          'Evalúa formalmente el desempeño cuantitativo y cualitativo de la red de proveedores asignada a su categoría.',
          'Desarrolla propuestas de optimización de portafolio basadas en análisis de rotación y márgenes.',
          'Garantiza que los acuerdos cerrados se traduzcan en un flujo oportuno de productos o servicios para la demanda.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Analistas de Compras / Asistentes',
        domainDescription: 'Realiza el seguimiento administrativo y el soporte operativo al flujo de compras, requerimientos o contratos del área. Procesa y actualiza con exactitud las órdenes, bases de datos o solicitudes en los sistemas de gestión, valida la documentación correspondiente y reporta cualquier desviación.',
        expectedBehaviors: 'Sigue administrativamente las compras y contratos. Persuade al cliente externo manejando objeciones básicas y reporta retrasos que afecten el inventario o la venta.',
        observableItems: [
          'Realiza el seguimiento administrativo continuo al flujo de compras, status de órdenes y vigencia contractual.',
          'Utiliza técnicas básicas de venta y persuasión para atender requerimientos de clientes externos.',
          'Maneja con empatía y efectividad las objeciones iniciales o reclamos cotidianos siguiendo las pautas de la empresa.',
          'Procesa con exactitud las órdenes en el sistema validando que la documentación coincida con lo pactado.',
          'Atiende y canaliza de forma oportuna los requerimientos de soporte solicitados por proveedores o clientes internos.'
        ]
      }
    }
  }
];

// CLUSTER 2: SOPORTE TRANSVERSAL: HABILIDAD Y AGILIDAD (Pág. 36-41)
// Aplica a: Dirección de Transporte y Logística, Dirección de Tecnología, Dirección de Talento Humano
export const AREA_SUPPORT_DIRECTORATES = [
  'Dirección de Transporte y Logística',
  'Dirección de Tecnología',
  'Dirección de Talento Humano'
];

export const AREA_SUPPORT_COMPETENCIES: OfficialCompetency[] = [
  // 1. Orientación al Servicio (pág. 36-37)
  {
    id: 'area-supp-1',
    name: 'Orientación al Servicio',
    type: 'area_support',
    clusterLabel: 'Soporte Transversal: Habilidad y Agilidad',
    targetDirectorates: AREA_SUPPORT_DIRECTORATES,
    definition: 'Representa la filosofía de servicio orientada a la creación de valor mutuo dentro de la organización, donde las áreas de soporte asumen un rol de socios estratégicos de la operación. Esta competencia define la capacidad intelectual para modelar, estandarizar y autorregular las expectativas de rendimiento y calidad entre dependencias internas mediante un marco formal de compromisos medibles. Su esencia radica en el entendimiento sistémico de que la eficiencia del soporte, determina directamente la competitividad y la velocidad de respuesta del núcleo del negocio (el piso de venta).',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores de Soporte / Shared Services',
        domainDescription: 'Establece la estrategia global de soporte interno y las políticas institucionales de niveles de atención de la organización. Autoriza la asignación de presupuestos corporativos y recursos de gran escala orientados a robustecer la capacidad de respuesta de las áreas de servicio, evaluando el impacto de la eficiencia interna en la competitividad y velocidad del negocio.',
        expectedBehaviors: 'Establece la estrategia global de soporte interno y políticas de atención. Autoriza presupuestos corporativos para robustecer el servicio, evaluando el impacto de la eficiencia en la competitividad del negocio.',
        observableItems: [
          'Define la estrategia global de soporte interno y las políticas de calidad de atención para toda la organización.',
          'Autoriza la asignación de presupuestos corporativos y recursos de gran escala para robustecer el servicio.',
          'Evalúa el impacto de la eficiencia interna de las áreas de soporte en la competitividad del piso de venta.',
          'Promueve una cultura de valor mutuo, posicionando a las áreas de soporte como socios estratégicos.',
          'Diseña el marco institucional de compromisos medibles para alinear las expectativas de rendimiento.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes de Logística, TI y Talento Humano',
        domainDescription: 'Diseña, audita y controla los Acuerdos de Nivel de Servicio y los indicadores de satisfacción de las áreas bajo su cargo. Implementa planes de acción tácticos a mediano plazo para resolver cuellos de botella críticos que afecten la continuidad operativa y actúa como mediador en conflictos complejos de servicio interdepartamental.',
        expectedBehaviors: 'Diseña, audita y controla los acuerdos de servicio e implementa planes tácticos para eliminar fallas operativas y conflictos complejos de servicio interdepartamental.',
        observableItems: [
          'Diseña, audita y controla los acuerdos de nivel de servicio (SLA) y los indicadores de satisfacción de su área.',
          'Implementa planes tácticos a mediano plazo para eliminar cuellos de botella críticos que afecten la continuidad.',
          'Actúa como mediador y resuelve conflictos complejos de servicio interdepartamental priorizando el negocio.',
          'Supervisa de forma regular los niveles de cumplimiento del soporte interno para garantizar velocidad operativa.',
          'Reasigna recursos tácticos e introduce mejoras en los procesos de servicio cuando se detectan fallas.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Coordinadores de Helpdesk, Almacén, Nómina',
        domainDescription: 'Monitorea y gestiona de forma autónoma el cumplimiento diario de los tiempos de respuesta y los estándares de calidad del servicio asignado. Identifica desviaciones, patrones de falla o reclamos recurrentes en la atención de solicitudes, desarrollando e implementando soluciones técnicas inmediatas.',
        expectedBehaviors: 'Monitorea autónomamente el cumplimiento diario de los tiempos y la calidad del servicio. Identifica patrones de falla recurrentes e implementa soluciones técnicas inmediatas para agilizar el soporte.',
        observableItems: [
          'Monitorea y gestiona con autonomía el cumplimiento diario de los tiempos de respuesta y calidad del servicio.',
          'Identifica desviaciones, patrones de falla o reclamos recurrentes en los flujos de atención interna.',
          'Desarrolla e implementa soluciones técnicas inmediatas para agilizar el soporte y evitar reincidencias.',
          'Asesora y capacita técnicamente a los usuarios internos sobre el correcto uso de los canales y herramientas.',
          'Analiza los reportes de calidad del servicio diario y propone mejoras en procedimientos técnicos.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Analistas de Soporte / Auxiliares',
        domainDescription: 'Recibe, procesa y canaliza con oportunidad las solicitudes, requerimientos o incidencias de los usuarios internos siguiendo los protocolos establecidos. Ejecuta las actividades de atención directa asegurando el cumplimiento de los tiempos de respuesta asignados.',
        expectedBehaviors: 'Recibe, procesa y canaliza oportunamente solicitudes e incidencias internas. Ejecuta la atención directa cumpliendo los tiempos asignados y reporta novedades que afecten el servicio.',
        observableItems: [
          'Recibe, procesa y canaliza oportunamente las solicitudes e incidencias internas según protocolos.',
          'Ejecuta las actividades de atención directa asegurando de forma rigurosa el cumplimiento de tiempos asignados.',
          'Reporta de manera inmediata cualquier anomalía, novedad o caída de sistema que afecte la continuidad.',
          'Atiende con empatía, amabilidad y disposición a los usuarios internos asegurando un servicio fluido y claro.',
          'Registra y actualiza con exactitud el estatus de cada requerimiento en las plataformas de gestión de tickets.'
        ]
      }
    }
  },

  // 2. Optimización de Procesos (pág. 38-39)
  {
    id: 'area-supp-2',
    name: 'Optimización de Procesos',
    type: 'area_support',
    clusterLabel: 'Soporte Transversal: Habilidad y Agilidad',
    targetDirectorates: AREA_SUPPORT_DIRECTORATES,
    definition: 'Constituye la capacidad analítica y metodológica orientada a la mejora continua y la simplificación de la arquitectura organizacional. Esta competencia define el pensamiento estructural necesario para desglosar flujos de trabajo complejos, identificar la fricción operativa y evaluar la cadena de valor interna bajo criterios de agilidad y eficiencia. Su núcleo intelectual se centra en la erradicación del desperdicio administrativo y la burocracia, transformando los procedimientos tradicionales en canales fluidos y dinámicos que faciliten la autogestión y la velocidad operativa.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores de Transformación y Operaciones',
        domainDescription: 'Modela la arquitectura de procesos transversales de la organización y define las políticas institucionales de estandarización y eficiencia. Autoriza la reingeniería de flujos críticos o la adquisición de tecnologías de automatización a gran escala, alineando la estructura operativa con los objetivos estratégicos.',
        expectedBehaviors: 'Modela la arquitectura de procesos, define políticas de estandarización y autoriza reingenierías o tecnologías de automatización para alinear la operación con la estrategia.',
        observableItems: [
          'Diseña y modela la arquitectura global de procesos transversales alineándola con la estrategia de negocio.',
          'Establece las políticas institucionales y directrices para estandarización, simplificación y eficiencia.',
          'Autoriza proyectos de reingeniería de flujos críticos y adquisición de tecnologías de automatización a gran escala.',
          'Evalúa el impacto de la estructura operativa en la competitividad y velocidad de respuesta de la compañía.',
          'Promueve una cultura organizacional enfocada en mejora continua, eficiencia y agilidad institucional.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes de Procesos, TI y Calidad',
        domainDescription: 'Dirige y supervisa la optimización, simplificación y documentación de los subprocesos de las áreas bajo su responsabilidad. Analiza métricas de eficiencia (tiempos de ciclo, costos y uso de recursos), detecta duplicidades o burocracia, y lidera la implementación de mejoras metodológicas.',
        expectedBehaviors: 'Dirige la optimización y documentación de los subprocesos bajo su cargo. Analiza métricas de eficiencia y detecta burocracia para implementar mejoras metodológicas a mediano plazo.',
        observableItems: [
          'Dirige y supervisa los proyectos de optimización, simplificación y documentación de los subprocesos de su área.',
          'Analiza periódicamente las métricas de eficiencia (tiempos de ciclo, costos y recursos) de los flujos de trabajo.',
          'Detecta duplicidades, burocracia o fricciones operativas e implementa mejoras metodológicas a mediano plazo.',
          'Controla que los subprocesos de las áreas bajo su responsabilidad estén debidamente actualizados.',
          'Lidera la transición y adopción de nuevas herramientas digitales o flujos de trabajo optimizados.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Analistas Sr. de Procesos y Desarrolladores',
        domainDescription: 'Mapea, analiza y documenta de forma autónoma los flujos de trabajo, manuales y políticas de las tareas asignadas. Identifica cuellos de botella u oportunidades de mejora en la rutina diaria y desarrolla propuestas técnicas operativas para eliminar la fricción, automatizar tareas y agilizar los tiempos.',
        expectedBehaviors: 'Mapea, analiza y documenta autónomamente flujos de trabajo y manuales. Identifica cuellos de botella y desarrolla propuestas técnicas operativas para eliminar la fricción y agilizar entregas.',
        observableItems: [
          'Mapea, analiza y documenta de manera autónoma flujos de trabajo, manuales y políticas operativas.',
          'Identifica cuellos de botella, reprocesos u oportunidades de mejora en la rutina diaria de la operación.',
          'Desarrolla propuestas técnicas operativas para eliminar fricción, automatizar tareas repetitivas y agilizar tiempos.',
          'Diseña los tableros de control o indicadores clave necesarios para medir la eficiencia de las rutinas diarias.',
          'Asesora a los equipos de ejecución en la correcta adopción de las nuevas guías y herramientas de autogestión.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Analistas Operativos / Documentadores',
        domainDescription: 'Ejecuta las rutinas, tareas o registros administrativos diarios respetando estrictamente las normas y manuales de procedimiento establecidos. Reporta a sus superiores cualquier obstáculo, retraso o desperdicio en la operación que ralentice el cumplimiento de sus funciones.',
        expectedBehaviors: 'Ejecuta las rutinas y registros diarios respetando estrictamente las normas y manuales. Reporta retrasos, obstáculos o desperdicios en la operación que afecten sus funciones individuales.',
        observableItems: [
          'Ejecuta las rutinas, tareas y registros administrativos respetando estrictamente las normas y manuales.',
          'Reporta con oportunidad a sus superiores cualquier obstáculo, retraso o desperdicio que detecte.',
          'Propone ideas sencillas basadas en su experiencia diaria para agilizar sus funciones o ahorrar recursos.',
          'Utiliza las herramientas de autogestión y sistemas del área de forma correcta para evitar errores o reprocesos.',
          'Mantiene al día el archivo, base de datos o registro físico y digital de sus actividades conforme al procedimiento.'
        ]
      }
    }
  },

  // 3. Administración de Infraestructura y Recursos Críticos (pág. 40-41)
  {
    id: 'area-supp-3',
    name: 'Administración de Infraestructura y Recursos Críticos',
    type: 'area_support',
    clusterLabel: 'Soporte Transversal: Habilidad y Agilidad',
    targetDirectorates: AREA_SUPPORT_DIRECTORATES,
    definition: 'Define la visión técnica y el rigor patrimonial orientados a la resiliencia, la protección de activos y la mitigación del riesgo operativo. Esta competencia abarca el dominio conceptual sobre el ciclo de vida de la infraestructura tecnológica, logística y humana, así como la comprensión profunda de la continuidad del negocio. Su enfoque se basa en el principio de previsión y gobierno de recursos, asegurando que la plataforma estructural e informática de la empresa actúe como un cimiento invisible, infalible y permanente que soporte el crecimiento y la estabilidad de toda la red comercial.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores de TI, Logística y Talento',
        domainDescription: 'Planifica la estrategia de inversión, renovación y resguardo de la infraestructura física, tecnológica y del talento de la organización a largo plazo. Dicta las políticas macro de seguridad, mitigación de riesgos y continuidad del negocio, garantizando que la plataforma estructural soporte la expansión de la empresa.',
        expectedBehaviors: 'Planifica la estrategia de inversión tecnológica y del talento a largo plazo. Dicta políticas de seguridad y continuidad del negocio para soportar la expansión de la empresa.',
        observableItems: [
          'Diseña la estrategia global de arquitectura tecnológica o el modelo organizacional y de talento de la empresa.',
          'Dicta las políticas de ciberseguridad, gobierno de datos, y directrices para retención y sucesión crítica.',
          'Establece el plan institucional de continuidad del negocio y recuperación ante desastres (DRP).',
          'Autoriza las grandes inversiones de capital para software corporativo, renovación de hardware o infraestructura.',
          'Evalúa y mitiga los riesgos globales asociados a la obsolescencia tecnológica o brecha de capacidades críticas.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes de Infraestructura, Flota y Compensación',
        domainDescription: 'Supervisa y gestiona los planes de mantenimiento, actualización, asignación y uso eficiente de los activos, recursos o plataformas bajo su responsabilidad. Administra los presupuestos asignados a la infraestructura de su área y lidera la ejecución de planes de contingencia ante fallas mayores.',
        expectedBehaviors: 'Supervisa el mantenimiento de sistemas y las estructuras de personal. Administra presupuesto operativo y lidera planes de contingencia para evitar fallas críticas en su área.',
        observableItems: [
          'Supervisa la ejecución de los planes de mantenimiento preventivo de servidores, sistemas o estructuras de personal.',
          'Gestiona y optimiza presupuestos operativos destinados a licenciamientos, soporte técnico o nómina especializada.',
          'Lidera los comités de contingencia ante caídas críticas de sistemas informáticos o crisis operativas.',
          'Controla el ciclo de vida de los activos tecnológicos o el índice de rotación de las estructuras de puestos.',
          'Audita de forma regular el cumplimiento de normativas de uso de herramientas digitales y seguridad laboral.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Administradores de Servidores, Flota y Analistas Sr.',
        domainDescription: 'Administra, controla y audita de forma autónoma el correcto funcionamiento, ciclo de vida y disponibilidad de las herramientas, sistemas o activos asignados a su gestión. Ejecuta revisiones periódicas, coordina con proveedores de soporte internos o externos y resuelve incidentes para asegurar la preservación del recurso.',
        expectedBehaviors: 'Administra autónomamente el funcionamiento y accesos de sistemas o registros de personal asignados. Ejecuta revisiones periódicas, coordina con proveedores técnicos o de talento y resuelve incidentes para preservar el recurso.',
        observableItems: [
          'Administra de forma autónoma el funcionamiento de redes, plataformas digitales o la gestión operativa de expedientes.',
          'Ejecuta auditorías técnicas de accesos a sistemas o auditorías de perfiles de cargo en los equipos asignados.',
          'Coordina directamente con proveedores de telecomunicaciones, soporte de software o atracción de talento.',
          'Resuelve incidencias técnicas de nivel intermedio asegurando la estabilidad del recurso.',
          'Analiza datos de rendimiento de plataformas o indicadores de ausentismo y rotación proponiendo mejoras.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Técnicos de Soporte / Custodios de Activos',
        domainDescription: 'Utiliza, opera y resguarda los equipos, sistemas, inventarios, bases de datos o herramientas asignadas a su puesto siguiendo las normas de seguridad vigentes. Realiza verificaciones rutinarias del estado de los recursos a su cargo y reporta de inmediato cualquier anomalía o avería detectada.',
        expectedBehaviors: 'Utiliza y resguarda los equipos, sistemas corporativos y datos asignados siguiendo las normas de seguridad e información. Realiza chequeos rutinarios y reporta de inmediato cualquier anomalía o falla detectada.',
        observableItems: [
          'Utiliza, opera y resguarda adecuadamente computadoras, redes, credenciales de acceso o herramientas asignadas.',
          'Cumple estrictamente con los protocolos de seguridad de la información y protección de datos personales.',
          'Realiza chequeos rutinarios básicos del estado de sus herramientas de trabajo (software, equipos, registros).',
          'Reporta de inmediato al área técnica cualquier anomalía, alerta de virus, falla de sistema o incidente laboral.',
          'Mantiene organizadas, limpias y actualizadas las bases de datos de uso diario o archivos lógicos a su cargo.'
        ]
      }
    }
  }
];

// CLUSTER 3: OPERACIONES CENTRALES: BLINDAJE Y CONTROL (Pág. 42-47)
// Aplica a: Dirección de Control Interno, Dirección de Administración y Finanzas
export const AREA_CONTROL_DIRECTORATES = [
  'Dirección de Control Interno',
  'Dirección de Administración y Finanzas'
];

export const AREA_CONTROL_COMPETENCIES: OfficialCompetency[] = [
  // 1. Prevención de Pérdidas y Control de Inventarios (pág. 42-43)
  {
    id: 'area-ctrl-1',
    name: 'Prevención de Pérdidas y Control de Inventarios',
    type: 'area_control',
    clusterLabel: 'Operaciones Centrales: Blindaje y Control',
    targetDirectorates: AREA_CONTROL_DIRECTORATES,
    definition: 'Representa la disciplina estratégica orientada a la protección del patrimonio y la custodia de los activos circulantes dentro de la cadena de valor del retail. Esta competencia define la capacidad intelectual para anticipar vulnerabilidades operativas, diseñar matrices de riesgo y establecer mecanismos de control invisible pero riguroso sobre el flujo físico de mercancías y efectivo. Su esencia conceptual radica en la creación de una cultura de fiscalización preventiva y autolimitación, transformando la contención de la merma y el fraude en un pilar directo de la rentabilidad y la sostenibilidad del negocio.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores de Control Interno y Finanzas',
        domainDescription: 'Define las políticas institucionales de protección patrimonial, seguridad corporativa y los límites de merma tolerables para el negocio. Aprueba las inversiones en tecnologías de fiscalización a gran escala y evalúa periódicamente el impacto financiero de las pérdidas en la rentabilidad neta.',
        expectedBehaviors: 'Define políticas de protección patrimonial y límites de merma. Aprueba tecnologías de fiscalización y evalúa pérdidas para reorientar estrategias generales.',
        observableItems: [
          'Diseña las políticas globales de seguridad corporativa, protección de activos y marcos de gestión de riesgos.',
          'Establece y autoriza los límites de merma tolerables y las metas de contención de pérdidas para el negocio.',
          'Aprueba la adquisición e implementación de tecnologías de fiscalización, monitoreo y control de inventarios.',
          'Evalúa el impacto financiero de la merma, el fraude y las pérdidas operativas sobre la rentabilidad neta.',
          'Promueve a nivel institucional una cultura de fiscalización preventiva, autolimitación y transparencia.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes de Auditoría y Control de Pérdidas',
        domainDescription: 'Diseña, supervisa y audita los sistemas de control interno, las matrices de riesgo operacional y los calendarios de conciliación física y financiera de los activos bajo su cargo. Implementa planes de acción tácticos de mediano plazo ante desviaciones críticas o patrones de vulnerabilidad detectados.',
        expectedBehaviors: 'Diseña, supervisa y audita los sistemas de control interno y calendarios de conciliación. Implementa planes tácticos ante desviaciones críticas para contener la merma y el fraude.',
        observableItems: [
          'Diseña y supervisa la aplicación de los sistemas de control interno y matrices de riesgo operacional.',
          'Planifica y audita los calendarios de inventarios cíclicos, arqueos de caja y conciliaciones físicas.',
          'Implementa planes de acción tácticos a mediano plazo ante desviaciones críticas o focos de merma.',
          'Desarrolla e implementa protocolos específicos para prevención y detección oportuna de fraudes.',
          'Lidera las investigaciones comerciales ante pérdidas extraordinarias coordinando medidas correctivas inmediatas.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Auditores de Inventarios / Analistas de Pérdidas',
        domainDescription: 'Ejecuta análisis autónomos de conciliación, cruces de inventarios y arqueos, identificando variaciones atípicas, vacíos de control o inconsistencias numéricas en el corto plazo. Desarrolla propuestas técnicas, ajusta los mecanismos de verificación operativa y coordina con los equipos la aclaración de diferencias.',
        expectedBehaviors: 'Ejecuta de forma autónoma conciliaciones, cruces de inventarios y arqueos. Identifica variaciones atípicas o vacíos de control, desarrollando propuestas técnicas para corregir diferencias.',
        observableItems: [
          'Ejecuta de forma autónoma conciliaciones de inventarios, cruces de bases de datos y auditorías en el sistema.',
          'Identifica variaciones atípicas, vacíos en procesos de control o inconsistencias entre stock físico y lógico.',
          'Desarrolla propuestas técnicas operativas para ajustar mecanismos de verificación y precisión del inventario.',
          'Coordina con los líderes de tienda o almacén la aclaración y justificación oportuna de descuadres.',
          'Analiza las causas raíz de la merma y propone acciones correctivas locales.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Fiscales de Tienda / Conteo de Inventario',
        domainDescription: 'Realiza los registros, conteos rutinarios, validaciones de transacciones y tareas de vigilancia e inspección diaria siguiendo los manuales del área. Reporta de manera inmediata cualquier descuadre, sospecha de irregularidad, falla en los sistemas de resguardo o daño físico detectado.',
        expectedBehaviors: 'Realiza registros, conteos rutinarios, validaciones y tareas de vigilancia diaria. Reporta de inmediato cualquier sospecha de irregularidad o daño detectado de recursos.',
        observableItems: [
          'Realiza conteos ciegos, inventarios cíclicos diarios y registros de mercancía respetando manuales del área.',
          'Valida transacciones de ingreso, salida o transferencia asegurando que el documento físico coincida con sistema.',
          'Ejecuta tareas cotidianas de inspección, vigilancia y resguardo físico de mercancía y efectivo bajo custodia.',
          'Reporta de inmediato a su superior cualquier irregularidad, fraude o daño físico detectado en los activos.',
          'Cumple rigurosamente con los protocolos de manejo de mermas conocidas (destrucción, vencimientos, averías).'
        ]
      }
    }
  },

  // 2. Estructuración y Control Presupuestario (pág. 44-45)
  {
    id: 'area-ctrl-2',
    name: 'Estructuración y Control Presupuestario',
    type: 'area_control',
    clusterLabel: 'Operaciones Centrales: Blindaje y Control',
    targetDirectorates: AREA_CONTROL_DIRECTORATES,
    definition: 'Constituye la capacidad de gobierno financiero y visión macroeconómica necesaria para modelar la viabilidad y el destino de los recursos económicos de la organización. Esta competencia define el pensamiento analítico requerido para traducir los planes estratégicos de la empresa en arquitecturas financieras viables, equilibrando la asignación de capital con la disciplina del gasto. Su núcleo intelectual se centra en el principio de austeridad estratégica y eficiencia del flujo de caja, asegurando que cada unidad de negocio opere bajo un marco de corresponsabilidad financiera que blinde el margen neto de la compañía.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores de Finanzas / CFO',
        domainDescription: 'Establece las directrices financieras macro, las metas de rentabilidad y la política de asignación de capital a largo plazo de la compañía. Autoriza el presupuesto anual consolidado de la organización y redefine las prioridades del gasto institucional ante fluctuaciones severas del mercado o del flujo de caja global.',
        expectedBehaviors: 'Establece directrices financieras y políticas de capital. Autoriza el presupuesto anual consolidado y redefine prioridades de gasto ante fluctuaciones del mercado.',
        observableItems: [
          'Define directrices financieras, metas de rentabilidad (EBITDA) y política de asignación de capital a largo plazo.',
          'Autoriza y aprueba el presupuesto anual consolidado de la organización, alineándolo a la estrategia del negocio.',
          'Redefine y reasigna de forma inmediata las prioridades del gasto ante fluctuaciones del mercado o flujo de caja.',
          'Diseña marcos corporativos de gobernanza financiera y austeridad estratégica para proteger el margen neto.',
          'Evalúa el impacto financiero global de nuevos proyectos de inversión de gran escala para viabilidad de capital.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes de Finanzas, Contraloría y Presupuesto',
        domainDescription: 'Dirige y consolida la formulación del presupuesto de las áreas bajo su responsabilidad, asegurando su alineación con el plan financiero corporativo. Monitorea semanalmente los tableros de ejecución del gasto, analiza las variaciones presupuestarias y lidera la aplicación de medidas de austeridad táctica o reajustes.',
        expectedBehaviors: 'Dirige la formulación del presupuesto y supervisa los mecanismos de control interno bajo su cargo. Monitorea la ejecución del gasto, analiza variaciones e implementa medidas para mitigar riesgos.',
        observableItems: [
          'Dirige y consolida la formulación del presupuesto anual y las proyecciones de las áreas bajo su responsabilidad.',
          'Monitorea periódicamente la ejecución presupuestaria y efectividad de controles para evitar desviaciones.',
          'Analiza las variaciones financieras y hallazgos de auditoría justificando desvíos y liderando planes de acción.',
          'Implementa medidas de austeridad táctica, eficiencias en el gasto y robustecimiento de procesos para blindar margen.',
          'Valida que los compromisos financieros y contratos adquiridos cumplan con niveles de autorización y gobernanza.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Analistas Sr. de Presupuesto / Contadores',
        domainDescription: 'Revisa, analiza y valida de forma autónoma las solicitudes de gasto, provisiones, proyecciones financieras y aplicaciones contables o tributarias asignadas. Identifica desviaciones, sobre ejecuciones o ineficiencias en el uso de los recursos del período y desarrolla propuestas de optimización financiera.',
        expectedBehaviors: 'Revisa y valida de forma autónoma solicitudes de gasto, provisiones o matrices de riesgo. Identifica desviaciones o vacíos normativos, desarrollando propuestas de optimización y control financiero.',
        observableItems: [
          'Revisa, analiza y valida con autonomía solicitudes de gasto, conciliaciones contables o pruebas de cumplimiento.',
          'Identifica alertas de sobreejecución presupuestaria, ineficiencias en uso de recursos o brechas operativas.',
          'Desarrolla propuestas técnicas de optimización financiera, ahorro o robustecimiento de controles para desvíos.',
          'Elabora informes técnicos detallados sobre variaciones del gasto, cierres mensuales o reportes de auditoría interna.',
          'Asesora a las demás áreas operativas en el correcto uso de partidas presupuestarias y centros de costo.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Asistentes de Cuentas por Pagar / Caja',
        domainDescription: 'Procesa, clasifica y registra con total exactitud las transacciones financieras, facturas, obligaciones fiscales o movimientos de caja diaria en los sistemas de gestión. Verifica el soporte documental de cada operación conforme a las normas contables y reporta cualquier retraso o anomalía.',
        expectedBehaviors: 'Procesa y registra transacciones, facturas y datos de control interno. Verifica el soporte documental de cada operación y reporta anomalías que impacten el gasto o normas del negocio.',
        observableItems: [
          'Procesa, clasifica y registra transacciones financieras, facturas o cuentas por pagar en sistemas autorizados.',
          'Verifica de manera rigurosa que el soporte documental cumpla con normas fiscales y políticas de control interno.',
          'Reporta de inmediato cualquier anomalía administrativa, retraso de facturación o cobros inesperados.',
          'Ejecuta arqueos, conciliaciones básicas y cotejos de documentación diaria con transparencia y apego a manuales.',
          'Mantiene el archivo físico y digital de la documentación financiera y contable debidamente organizado.'
        ]
      }
    }
  },

  // 3. Gestión de Riesgos y Auditoría de Procesos (pág. 46-47)
  {
    id: 'area-ctrl-3',
    name: 'Gestión de Riesgos y Auditoría de Procesos',
    type: 'area_control',
    clusterLabel: 'Operaciones Centrales: Blindaje y Control',
    targetDirectorates: AREA_CONTROL_DIRECTORATES,
    definition: 'Define el rigor normativo y la visión de cumplimiento orientados a garantizar la integridad, legalidad y transparencia del gobierno corporativo. Esta competencia abarca la facultad para evaluar de manera sistemática y objetiva el apego de la organización a sus propias políticas y al marco regulatorio externo. Su enfoque abstracto se basa en el principio de aseguramiento y mejora continua, actuando como un detector proactivo de desviaciones procedimentales para mitigar riesgos reputacionales, legales o financieros antes de que afecten la continuidad operativa.',
    levels: {
      A: {
        letter: 'A',
        name: 'Nivel Superior',
        rangePercent: '76% - 100%',
        scoreValue: 5.00,
        targetRoleReference: 'Directores de Auditoría Interna / Cumplimiento',
        domainDescription: 'Define la estrategia institucional de cumplimiento, el código de gobierno corporativo y la política macro de gestión de riesgos de la empresa. Evalúa los informes globales de auditoría externa e interna, dictando las directrices normativas para proteger la reputación, legalidad e integridad del negocio.',
        expectedBehaviors: 'Define la estrategia de cumplimiento y la política de gestión de riesgos. Evalúa informes globales de auditoría y dicta directrices normativas para proteger la reputación e integridad del negocio.',
        observableItems: [
          'Diseña la estrategia global de cumplimiento normativo, el código de gobierno corporativo y políticas macro de riesgo.',
          'Evalúa los informes globales de auditoría interna y externa para determinar el nivel de exposición al riesgo.',
          'Dicta las directrices normativas y ética de cumplimiento obligatorio para proteger la legalidad y reputación.',
          'Aprueba el Plan Anual de Auditoría y los marcos institucionales de fiscalización para todas las unidades de negocio.',
          'Dirige la respuesta corporativa ante contingencias legales, regulatorias o éticas que comprometan la continuidad.'
        ]
      },
      B: {
        letter: 'B',
        name: 'Nivel Alto',
        rangePercent: '51% - 75%',
        scoreValue: 3.75,
        targetRoleReference: 'Gerentes de Control Interno y Auditoría',
        domainDescription: 'Dirige, planifica y supervisa los programas de auditoría, control normativo o planes de mitigación de riesgos de las áreas bajo su cargo. Evalúa el nivel de apego a las políticas internas y marcos regulatorios externos (tributarios, legales o procedimentales) y lidera la implementación de planes correctivos estructurales.',
        expectedBehaviors: 'Dirige y supervisa los programas de auditoría y planes de mitigación bajo su cargo. Evalúa el apego a marcos regulatorios y lidera planes correctivos ante fallas de control.',
        observableItems: [
          'Planifica, dirige y supervisa la ejecución de programas de auditoría, matrices de riesgo y planes de mitigación.',
          'Evalúa el apego de los equipos a políticas internas y marcos regulatorios externos (tributarios, legales, laborales).',
          'Lidera la implementación de planes correctivos estructurales a mediano plazo ante fallas críticas de control.',
          'Valida la solidez de los procesos departamentales antes de su puesta en marcha garantizando cumplimiento.',
          'Gestiona la relación técnica y atiende requerimientos complejos de entes reguladores externos o auditores.'
        ]
      },
      C: {
        letter: 'C',
        name: 'Nivel Intermedio',
        rangePercent: '26% - 50%',
        scoreValue: 2.50,
        targetRoleReference: 'Auditores de Procesos / Analistas de Cumplimiento',
        domainDescription: 'Conduce de forma autónoma revisiones, pruebas de control, inspecciones operativas y evaluaciones normativas en los procesos asignados. Identifica y documenta con precisión desviaciones procedimentales, debilidades en el cumplimiento legal/tributario o riesgos potenciales, y desarrolla las recomendaciones técnicas.',
        expectedBehaviors: 'Conduce autónomamente revisiones, pruebas de control e inspecciones operativas. Identifica y documenta desviaciones procedimentales o riesgos, desarrollando recomendaciones técnicas de mejora.',
        observableItems: [
          'Conduce con autonomía revisiones de procesos, pruebas de recorrido, inspecciones operativas y normativas.',
          'Identifica y documenta con precisión técnica desviaciones procedimentales, riesgos o debilidades regulatorias.',
          'Desarrolla recomendaciones técnicas y planes de mejora continua orientados a optimizar controles y erradicar malas prácticas.',
          'Elabora informes técnicos de auditoría claros y con soporte evidenciable detallando hallazgos y riesgos.',
          'Realiza el seguimiento técnico al cumplimiento de compromisos de mejora asumidos en revisiones anteriores.'
        ]
      },
      D: {
        letter: 'D',
        name: 'Nivel Mínimo',
        rangePercent: '0% - 25%',
        scoreValue: 1.25,
        targetRoleReference: 'Asistentes de Auditoría / Verificadores',
        domainDescription: 'Recopila, valida y archiva la evidencia documental, bases de datos o reportes requeridos para los procesos de fiscalización y control interno. Ejecuta sus tareas diarias bajo el estricto apego a las políticas de seguridad y cumplimiento establecidas, reportando de inmediato cualquier incumplimiento.',
        expectedBehaviors: 'Recopila y valida la evidencia documental para procesos de fiscalización. Ejecuta tus tareas bajo estricto apego a las políticas y reporta de inmediato incumplimientos o riesgos detectados.',
        observableItems: [
          'Recopila, valida y archiva de manera oportuna evidencia documental, muestras o reportes para auditoría.',
          'Ejecuta sus tareas y rutinas diarias bajo estricto apego a políticas de seguridad de la información y ética.',
          'Reporta de inmediato a sus superiores cualquier incumplimiento normativo, conducta irregular o riesgo operativo.',
          'Atiende de manera respetuosa y transparente los requerimientos rutinarios del equipo de control y auditoría.',
          'Mantiene la confidencialidad, el orden y la integridad de los registros bajo su custodia evitando alteraciones.'
        ]
      }
    }
  }
];

// LISTADO COMPLETO Y TOTALIZADOR DEL MODELO CANGURO
export const ALL_OFFICIAL_COMPETENCIES: OfficialCompetency[] = [
  ...CARDINAL_COMPETENCIES,
  ...SUPERVISION_COMPETENCIES,
  ...BOARD_COMPETENCIES,
  ...AREA_SALES_COMPETENCIES,
  ...AREA_SUPPORT_COMPETENCIES,
  ...AREA_CONTROL_COMPETENCIES
];

/**
 * MOTOR DE RESOLUCIÓN DE COMPETENCIAS SEGÚN CARGO Y DIRECCIÓN
 * Aplica rigurosamente las reglas del Modelo de Competencias Canguro (DTH-GFD-MC-01):
 * 
 * 1. Para los cargos de Analista, Especialista, Responsable (y cargos operativos):
 *    Se evalúa: Competencias Cardinales (5) y Competencias Específicas por área (según Dirección). Total: 8
 * 
 * 2. Para los cargos de Coordinador, Supervisor, Gerente:
 *    Se evalúa: Competencias Cardinales (5), Competencias Gerenciales y/o de Supervisión (3) y Competencias Específicas por área (según Dirección). Total: 11
 * 
 * 3. Para los cargos de Director (y Alta Dirección):
 *    Se evalúa: Competencias Cardinales (5), Competencias de Junta Directiva (3) y Competencias Específicas por área (según Dirección). Total: 11
 */
export function resolveEmployeeCompetencyProfile(position: string = '', directorate: string = '') {
  const posLower = (position || '').toLowerCase().trim();

  // 1. Director / Junta Directiva:
  const isBoardEligible = posLower.includes('director') || posLower.includes('presidente') || posLower.includes('vicepresidente');

  // 2. Coordinador, Supervisor, Gerente (Liderazgo y supervisión táctica):
  // Excluye Director (evalúa Junta Directiva) y excluye Responsable/Analista/Especialista (evalúan solo Cardinales y Específicas)
  const isSupervisionEligible = !isBoardEligible && (
    posLower.includes('gerente') ||
    posLower.includes('supervisor') ||
    posLower.includes('coordinador')
  );

  // Determinar cluster de área según Dirección
  let areaCluster: 'sales' | 'support' | 'control' = 'sales';
  let areaCompetencies: OfficialCompetency[] = AREA_SALES_COMPETENCIES;

  const normalizedDir = (directorate || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (
    normalizedDir.includes('transporte') ||
    normalizedDir.includes('logistica') ||
    normalizedDir.includes('tecnologia') ||
    normalizedDir.includes('talento humano')
  ) {
    areaCluster = 'support';
    areaCompetencies = AREA_SUPPORT_COMPETENCIES;
  } else if (
    normalizedDir.includes('control interno') ||
    normalizedDir.includes('finanzas') ||
    normalizedDir.includes('administracion')
  ) {
    areaCluster = 'control';
    areaCompetencies = AREA_CONTROL_COMPETENCIES;
  } else {
    // Comercial, Compras, Operaciones -> Motores de Venta
    areaCluster = 'sales';
    areaCompetencies = AREA_SALES_COMPETENCIES;
  }

  // Determinar nivel mínimo esperado de desarrollo según cargo (Norma Oficial Canguro)
  // - Nivel D (Operativo): Analistas, Especialistas y Responsables
  // - Nivel C (Táctico): Coordinadores y Supervisores
  // - Nivel B (Táctico-Estratégico): Gerentes
  // - Nivel A (Estratégico): Directores y Junta Directiva
  let expectedLevel: CompetencyLevelLetter = 'D';
  if (isBoardEligible) {
    expectedLevel = 'A';
  } else if (posLower.includes('gerente')) {
    expectedLevel = 'B';
  } else if (
    posLower.includes('coordinador') ||
    posLower.includes('supervisor')
  ) {
    expectedLevel = 'C';
  } else {
    expectedLevel = 'D';
  }

  // Construir perfil activo según la parametrización oficial
  const activeCompetencies: OfficialCompetency[] = [
    ...CARDINAL_COMPETENCIES,
    ...(isSupervisionEligible ? SUPERVISION_COMPETENCIES : []),
    ...(isBoardEligible ? BOARD_COMPETENCIES : []),
    ...areaCompetencies
  ];

  return {
    position,
    directorate,
    isSupervisionEligible,
    isBoardEligible,
    isOperationalOnly: !isSupervisionEligible && !isBoardEligible,
    areaCluster,
    expectedLevel,
    expectedLevelDefinition: CANGURO_GENERAL_LEVELS[expectedLevel],
    cardinalCompetencies: CARDINAL_COMPETENCIES,
    supervisionCompetencies: isSupervisionEligible ? SUPERVISION_COMPETENCIES : [],
    boardCompetencies: isBoardEligible ? BOARD_COMPETENCIES : [],
    areaCompetencies,
    activeCompetencies,
    totalCompetenciesCount: activeCompetencies.length
  };
}

/**
 * Resuelve el nivel de gestión institucional para cualquier cargo
 */
export function resolvePositionManagementLevel(position: string = ''): {
  level: CompetencyLevelLetter;
  levelName: string;
  category: 'Operativo' | 'Táctico' | 'Táctico-Estratégico' | 'Estratégico';
  targetRoleReference: string;
  expectedScore: number;
} {
  const posLower = (position || '').toLowerCase().trim();
  if (posLower.includes('director') || posLower.includes('presidente') || posLower.includes('junta directiva')) {
    return {
      level: 'A',
      levelName: 'Nivel Superior (Estratégico)',
      category: 'Estratégico',
      targetRoleReference: 'Directores y Junta Directiva',
      expectedScore: 5.00
    };
  }
  if (posLower.includes('gerente')) {
    return {
      level: 'B',
      levelName: 'Nivel Alto (Táctico-Estratégico)',
      category: 'Táctico-Estratégico',
      targetRoleReference: 'Gerentes',
      expectedScore: 3.75
    };
  }
  if (
    posLower.includes('coordinador') ||
    posLower.includes('supervisor')
  ) {
    return {
      level: 'C',
      levelName: 'Nivel Intermedio (Táctico)',
      category: 'Táctico',
      targetRoleReference: 'Coordinadores y Supervisores',
      expectedScore: 2.50
    };
  }
  return {
    level: 'D',
    levelName: 'Nivel Mínimo (Operativo)',
    category: 'Operativo',
    targetRoleReference: 'Analistas, Especialistas y Responsables',
    expectedScore: 1.25
  };
}

/**
 * Sugerencia por defecto de cargo superior inmediato según jerarquía
 */
export function getDefaultPromotionTargetPosition(currentPosition: string = ''): string {
  const currentLevel = resolvePositionManagementLevel(currentPosition).level;
  if (currentLevel === 'D') return 'Coordinador';
  if (currentLevel === 'C') return 'Gerente';
  if (currentLevel === 'B') return 'Director';
  return 'Junta Directiva';
}

/**
 * Resuelve el perfil de competencias y nivel esperado para la Evaluación de Promoción
 * basado en el CARGO SUPERIOR / DESTINO al que postula.
 */
export function resolvePromotionCompetencyProfile(
  targetPosition: string,
  targetDirectorate: string = '',
  currentPosition: string = ''
) {
  const currentMgmt = resolvePositionManagementLevel(currentPosition);
  const targetMgmt = resolvePositionManagementLevel(targetPosition);
  const targetProfile = resolveEmployeeCompetencyProfile(targetPosition, targetDirectorate);

  return {
    ...targetProfile,
    currentPosition,
    currentManagementLevel: currentMgmt,
    targetPosition,
    targetManagementLevel: targetMgmt,
    isAscending: targetMgmt.expectedScore > currentMgmt.expectedScore,
    targetLevelExpectedScore: targetMgmt.expectedScore
  };
}

/**
 * CASOS SITUACIONALES Y OPCIONES DE REACCIÓN POR NIVEL DE DOMINIO (DTH-GFD-MC-01)
 * Cada reactivo sitúa al evaluado ante un escenario laboral concreto de Districueros El Canguro.
 * Las 4 opciones representan las reacciones conductuales de los 4 niveles de dominio:
 * - Opción A: Nivel Superior (5.00 pts | 100% de desarrollo / 5 de 5 comportamientos observables)
 * - Opción B: Nivel Alto (3.75 pts | 75% de desarrollo / 4 de 5 comportamientos observables)
 * - Opción C: Nivel Intermedio (2.50 pts | 50% de desarrollo / 2.5 de 5 comportamientos observables)
 * - Opción D: Nivel Mínimo (1.25 pts | 25% de desarrollo / 1.25 de 5 comportamientos observables)
 */
export const COMPETENCY_SITUATIONAL_CASES: Record<string, { situation: string; options: { A: string; B: string; C: string; D: string } }> = {
  // 1. Orientación al Cliente
  'card-1': {
    situation: 'Un cliente clave (interno o de tienda) presenta un requerimiento urgente con especificaciones variables que impacta los tiempos de entrega programados:',
    options: {
      A: 'Anticipo el impacto en toda la cadena de valor, negocio una solución integral de excelencia con las áreas involucradas y rediseño el flujo para que este obstáculo no vuelva a repetirse a nivel organizacional.',
      B: 'Analizo la necesidad de fondo más allá de lo evidente, propongo alternativas de valor agregado de forma autónoma y coordino con mi equipo para agilizar la entrega sin comprometer la calidad.',
      C: 'Escucho activamente los requerimientos del cliente, entrego la respuesta según los protocolos establecidos y consulto oportunamente a mi supervisor ante cualquier desviación compleja.',
      D: 'Me apego estrictamente a las instrucciones de atención recibidas y escalo de inmediato la solicitud a mi jefatura para que determine cómo proceder.'
    }
  },
  // 2. Aprendizaje e Innovación
  'card-2': {
    situation: 'La empresa introduce una nueva metodología de trabajo y herramientas digitales para optimizar los flujos operativos y comerciales:',
    options: {
      A: 'Lidero activamente la adopción del cambio, investigo tendencias de vanguardia y diseño estrategias para transferir el conocimiento a toda la empresa, convirtiendo el aprendizaje en una ventaja competitiva.',
      B: 'Experimento con las nuevas herramientas con pensamiento crítico, aprendo rápidamente de los errores de implementación y motivo a mis compañeros compartiendo buenas prácticas para elevar el estándar del área.',
      C: 'Me capacito con interés en las nuevas herramientas, propongo pequeños ajustes creativos para hacer más eficiente mi rutina individual y resuelvo dudas apoyándome en el equipo.',
      D: 'Asisto puntualmente a las capacitaciones programadas, aplico las instrucciones recibidas para adaptarme a la herramienta y sigo el procedimiento paso a paso sin modificarlo.'
    }
  },
  // 3. Capacidad de Análisis
  'card-3': {
    situation: 'Se detecta una discrepancia imprevista y recurrente entre los datos operativos y los resultados reportados en los indicadores clave:',
    options: {
      A: 'Construyo modelos analíticos sistémicos para cruzar variables multifactoriales entre distintas áreas, identificando la causa raíz estructural y estableciendo controles preventivos de largo plazo.',
      B: 'Descompongo la información en sus partes críticas, evalúo tendencias cuantitativas de forma autónoma y presento a la jefatura un diagnóstico claro con alternativas de solución viables.',
      C: 'Reviso en detalle los registros y datos de mi proceso directo, identifico dónde se originó el desfase puntual y entrego los datos depurados a mi supervisor para su validación.',
      D: 'Verifico los datos básicos de mi planilla o sistema siguiendo la rutina asignada y reporto el error numérico encontrado a mi jefe inmediato para que indique qué corregir.'
    }
  },
  // 4. Trabajo en Equipo
  'card-4': {
    situation: 'Durante un cierre operativo de alta exigencia, varias áreas deben coordinar entregables interdependientes bajo plazos muy ajustados y tensión laboral:',
    options: {
      A: 'Promuevo una visión compartida de éxito colectivo en la organización, desmantelo silos entre departamentos, resuelvo discrepancias de fondo y aseguro que todos los equipos alcancen el objetivo común con sinergia.',
      B: 'Facilito la colaboración activa entre compañeros, asumo responsabilidades compartidas más allá de mi puesto habitual para apoyar a quienes tienen cuellos de botella y mantengo alta la moral del equipo.',
      C: 'Cumplo con mis entregables individuales con puntualidad, colaboro de buena disposición cuando un compañero me pide apoyo puntual y mantengo una comunicación cordial y constructiva.',
      D: 'Me concentro en completar exclusivamente mis tareas asignadas dentro del plazo y coordino solo lo indispensable cuando mis superiores me lo indican directamente.'
    }
  },
  // 5. Adaptabilidad y Flexibilidad
  'card-5': {
    situation: 'Surge una reestructuración de prioridades imprevista debido a cambios en el mercado y la dirección solicita pausar los planes actuales y reenfocarse de inmediato:',
    options: {
      A: 'Asimilo el nuevo escenario como una oportunidad estratégica, reorganizo recursos con visión de futuro, transmito seguridad y adapto las directrices de la empresa con serenidad y agilidad.',
      B: 'Reordeno ágilmente los planes de trabajo de mi área, ajusto prioridades con flexibilidad ante la incertidumbre y ayudo a mis pares a mantener el foco en las nuevas metas sin perder eficiencia.',
      C: 'Acepto el cambio de prioridades con buena disposición, reorganizo mi agenda individual de tareas y solicito a mi supervisor confirmación de las nuevas fechas de entrega.',
      D: 'Espero las instrucciones específicas de mi superior sobre cómo reanudar mis actividades, adaptándome paulatinamente a la nueva rutina según me sea indicado.'
    }
  },
  // 6. Liderar con el Ejemplo
  'sup-1': {
    situation: 'Se presenta un momento de alta presión laboral donde se exige el máximo apego a los valores organizacionales, ética laboral y excelencia técnica:',
    options: {
      A: 'Soy un referente indiscutible de congruencia ética y excelencia en toda la empresa, inspirando a líderes y colaboradores a través de mi conducta intachable y compromiso total con los principios Canguro.',
      B: 'Demuestro con hechos cotidianos puntualidad, disciplina y respeto a las normas, guiando a mi equipo con una actitud proactiva y asumiendo plena responsabilidad ante cualquier contratiempo.',
      C: 'Mantengo una conducta profesional correcta, cumplo con rigor las políticas internas y procuro que mis compañeros perciban una actitud responsable y colaborativa en mi puesto.',
      D: 'Me esfuerzo por cumplir las normas básicas de conducta y disciplina del puesto, evitando cometer faltas y siguiendo las orientaciones de mis superiores.'
    }
  },
  // 7. Orientación al Logro
  'sup-2': {
    situation: 'Se asignan metas operativas o comerciales especialmente retadoras con plazos exigentes que demandan superar los estándares habituales:',
    options: {
      A: 'Establezco estándares de clase superior para la organización, anticipo obstáculos del entorno y movilizo estratégicamente los recursos para superar con creces los objetivos más ambiciosos de la empresa.',
      B: 'Monitoreo constantemente el avance de los indicadores del equipo, introduzco optimizaciones operativas para acelerar resultados y persisto con determinación ante cualquier desviación hasta alcanzar la meta.',
      C: 'Planifico y ejecuto mis actividades con dedicación enfocándome en cumplir la meta asignada, reportando periódicamente el avance a mi jefatura para asegurar su logro.',
      D: 'Realizo las tareas cotidianas que se me asignan a buen ritmo, buscando cumplir con el volumen de trabajo básico establecido para mi jornada.'
    }
  },
  // 8. Desarrollo de Equipos
  'sup-3': {
    situation: 'Varios integrantes del equipo evidencian brechas en sus competencias técnicas o dificultades para asumir responsabilidades de mayor nivel:',
    options: {
      A: 'Diseño planes estratégicos de sucesión y desarrollo de talento para la organización, identifico perfiles de alto potencial y fomento una cultura integral de mentoría y crecimiento profesional continuo.',
      B: 'Dedico tiempo regular a brindar retroalimentación constructiva, detecto fortalezas y áreas de mejora en mis colaboradores y les delego proyectos retadores acompañándolos en su desarrollo.',
      C: 'Comparto mis conocimientos técnicos de buena gana cuando un compañero tiene dudas, colaboro en la inducción de nuevos ingresos y sugiero temas de capacitación a mi jefatura.',
      D: 'Respondo a consultas específicas sobre el trabajo rutinario cuando me lo preguntan y recomiendo al colaborador revisar los manuales o consultar con el supervisor.'
    }
  },
  // 9. Líder de Líderes
  'brd-1': {
    situation: 'La organización atraviesa un crecimiento sostenido que demanda alinear a todos los gerentes y mandos medios bajo una misma visión directiva y cultura corporativa:',
    options: {
      A: 'Ejerzo un liderazgo transformador que inspira y cohesiona al cuerpo gerencial, forjando líderes autónomos y asegurando que las decisiones directivas permeen con fuerza ética y estratégica en toda la organización.',
      B: 'Promuevo la alineación táctica entre las gerencias, fomento la cooperación interdepartamental y asesoro a los coordinadores para que fortalezcan su liderazgo con sus respectivos equipos.',
      C: 'Mantengo una relación de trabajo constructiva con pares y líderes de otras áreas, respetando los canales jerárquicos y contribuyendo a un clima laboral de respeto y entendimiento mutuo.',
      D: 'Atiendo las directrices impartidas por los niveles de dirección y me enfoco en cumplir los lineamientos que corresponden a mi ámbito de gestión.'
    }
  },
  // 10. Pensamiento Estratégico
  'brd-2': {
    situation: 'Se identifican cambios en el mercado de calzado y marroquinería que podrían alterar la demanda, los costos o la preferencia de los consumidores en los próximos ciclos:',
    options: {
      A: 'Anticipo el impacto en el modelo de negocio con visión de largo plazo, diseño estrategias competitivas diferenciadoras y tomo decisiones estructurales que posicionan a Districueros El Canguro a la vanguardia del sector.',
      B: 'Analizo tendencias comerciales y de abastecimiento de mi sector, evalúo riesgos y oportunidades a mediano plazo y propongo a la dirección planes de acción viables para proteger la rentabilidad del negocio.',
      C: 'Comprendo cómo los objetivos de mi área aportan a las metas anuales de la empresa y organizo mi trabajo cotidiano para contribuir de manera directa al cumplimiento de esos resultados.',
      D: 'Me centro en el cumplimiento eficiente de mis funciones cotidianas, asegurando que las tareas inmediatas del día a día se completen con normalidad.'
    }
  },
  // 11. Gestión del Cambio y Desarrollo de la Organización
  'brd-3': {
    situation: 'La alta gerencia decide implementar una transformación integral en la estructura organizativa y los procesos centrales de la empresa:',
    options: {
      A: 'Lidero el proceso transformacional como patrocinador principal, gestiono las resistencias con empatía y visión de futuro, y reconfiguro la cultura organizacional hacia la agilidad, sostenibilidad e innovación permanente.',
      B: 'Actúo como facilitador activo del cambio en mi departamento, comunico con claridad el propósito de las transformaciones y acompaño a los equipos para mitigar la incertidumbre y asegurar la adopción fluida.',
      C: 'Me integro positivamente a los nuevos esquemas de trabajo, adopto los procesos rediseñados y apoyo a mis compañeros para superar la resistencia inicial a las nuevas pautas.',
      D: 'Acepto las instrucciones de la nueva estructura conforme me sean comunicadas por mis jefes y sigo las nuevas pautas de trabajo de manera disciplinada.'
    }
  },
  // 12. Gestión de Indicadores (De Cara al Cliente - Motores de Venta)
  'area-sales-1': {
    situation: 'El informe de ventas de la semana muestra una desviación negativa en el ticket promedio y en las metas de conversión de las tiendas:',
    options: {
      A: 'Diseño estrategias comerciales estructurales a nivel de cadena, cruzo métricas de tráfico, conversión y rentabilidad por categoría, e implemento planes de estímulo de ventas que transforman el desempeño comercial.',
      B: 'Analizo los indicadores comerciales por turno y asesor, identifico con precisión los puntos de fuga en la experiencia de venta y ejecuto planes de acción tácticos inmediatos para recuperar la meta.',
      C: 'Reviso los números de mi tienda o sección, identifico cuáles productos no se están moviendo al ritmo esperado y aplico las técnicas comerciales indicadas por el supervisor para mejorar la rotación.',
      D: 'Registro las ventas diarias con exactitud, reporto las cifras a mi encargado de tienda y me aseguro de atender a los clientes que ingresan siguiendo las instrucciones dadas.'
    }
  },
  // 13. Visual Merchandising (De Cara al Cliente - Motores de Venta)
  'area-sales-2': {
    situation: 'Se recibe una nueva colección de productos y se requiere optimizar la exhibición en vitrinas y piso de venta para maximizar el impacto visual y la rotación del inventario:',
    options: {
      A: 'Defino las directrices maestras de visual merchandising para toda la red de tiendas, asegurando que la identidad de marca, el recorrido del cliente y la psicología del consumidor potencien exponencialmente las ventas.',
      B: 'Implemento con rigor los lineamientos de exhibición en tienda, optimizo la iluminación y disposición según el flujo de clientes y realizo ajustes proactivos para destacar los productos de mayor margen.',
      C: 'Mantengo las vitrinas, estantes y exhibidores limpios, ordenados y alineados a las guías visuales corporativas, reponiendo de inmediato los productos faltantes.',
      D: 'Coloco los productos en los mostradores y vitrinas según me lo indica el encargado de tienda, cuidando que los precios y etiquetas estén visibles.'
    }
  },
  // 14. Negociación Comercial (De Cara al Cliente - Motores de Venta)
  'area-sales-3': {
    situation: 'Un cliente institucional o mayorista solicita condiciones especiales de precio y volumen que ponen a prueba los márgenes comerciales de la empresa:',
    options: {
      A: 'Diseño acuerdos comerciales estratégicos ganar-ganar de largo plazo, preservando la rentabilidad global de la marca y fidelizando al cliente como socio comercial clave de la empresa.',
      B: 'Negocio con firmeza y flexibilidad basándome en valor agregado, paquetes complementarios y plazos favorables, logrando el cierre de la venta dentro de los parámetros de rentabilidad autorizados.',
      C: 'Expongo con solidez las ventajas competitivas y la calidad de nuestros productos, respondo a objeciones frecuentes y consulto con el supervisor antes de otorgar cualquier condición especial.',
      D: 'Informo al cliente las tarifas, promociones vigentes y políticas oficiales de la tienda, derivando a mi jefatura cualquier solicitud de descuento no estandarizada.'
    }
  },
  // 15. Orientación al Servicio (Soporte Transversal - Habilidad y Agilidad)
  'area-supp-1': {
    situation: 'Un departamento operativo reporta una falla imprevista en un sistema, equipo o proceso de soporte que detiene temporalmente sus actividades:',
    options: {
      A: 'Lidero una política de servicio transversal de alta disponibilidad, implementando protocolos de contingencia y rediseño estructural de infraestructura para evitar que eventos similares impacten a la organización.',
      B: 'Actúo con sentido de urgencia, diagnostico la falla rápidamente, restablezco la operatividad de forma autónoma y mantengo informado al usuario interno en todo momento con empatía y claridad.',
      C: 'Atiendo la solicitud de soporte con amabilidad, aplico la solución técnica estándar dentro de los tiempos de respuesta acordados y confirmo con el usuario que el servicio quedó operativo.',
      D: 'Tomo nota del requerimiento técnico, lo registro en el sistema de tickets y lo escalo al especialista correspondiente para su resolución.'
    }
  },
  // 16. Optimización de Procesos (Soporte Transversal - Habilidad y Agilidad)
  'area-supp-2': {
    situation: 'Se identifica un cuello de botella administrativo o logístico que genera demoras en la entrega de reportes, suministros o trámites internos:',
    options: {
      A: 'Diseño e implemento una reingeniería completa del flujo operativo mediante digitalización, automatización y simplificación, eliminando costos ocultos y tiempos muertos a escala corporativa.',
      B: 'Mapeo los pasos del proceso afectado, identifico actividades redundantes y propongo a la jefatura una simplificación efectiva que reduce los tiempos de ciclo y mejora la precisión.',
      C: 'Detecto tareas repetitivas en mi rutina diaria, aplico mejoras prácticas en mis archivos o formatos para agilizar mi trabajo y comparto el método con mis compañeros de sección.',
      D: 'Ejecuto las actividades de mi puesto siguiendo el manual de procedimientos establecido y comunico a mi supervisor si algún paso me genera retraso.'
    }
  },
  // 17. Administración de Infraestructura y Recursos Críticos (Soporte Transversal)
  'area-supp-3': {
    situation: 'Se presentan contingencias en el suministro de insumos esenciales, infraestructura tecnológica o recursos logísticos que amenazan la continuidad operativa:',
    options: {
      A: 'Establezco planes maestros de continuidad de negocio y gestión de activos críticos, diversificando proveedores estratégicos y garantizando la resiliencia operativa permanente de la empresa.',
      B: 'Gestiono con anticipación el mantenimiento preventivo y stock de seguridad de los recursos a mi cargo, resolviendo incidentes imprevistos de forma ágil para no detener la operación.',
      C: 'Monitoreo el estado de los equipos y suministros bajo mi custodia, reporto anomalías a tiempo y gestiono oportunamente las reposiciones requeridas con los canales autorizados.',
      D: 'Hago un uso responsable de los materiales y equipos asignados a mi puesto de trabajo y aviso a mi supervisor inmediato cuando un insumo se agota o presenta fallas.'
    }
  },
  // 18. Prevención de Pérdidas y Control de Inventarios (Operaciones Centrales)
  'area-ctrl-1': {
    situation: 'Durante una auditoría de existencias en bodega o tienda se detecta una merma no justificada o una inconsistencia recurrente en las referencias físicas vs sistema:',
    options: {
      A: 'Diseño e implemento un sistema integral de trazabilidad, control interno y prevención de pérdidas a nivel nacional, blindando los puntos críticos de fuga y protegiendo el patrimonio de la organización.',
      B: 'Lidero el arqueo y conciliación detallada de los lotes afectados, investigo la causa operativa de la inconsistencia y establezco controles cruzados inmediatos para neutralizar la vulnerabilidad.',
      C: 'Realizo el conteo físico de los productos con exactitud, verifico los comprobantes de entrada y salida contra el sistema y reporto los desajustes encontrados a la jefatura de control interno.',
      D: 'Participo en el conteo de la mercancía según las instrucciones del auditor o encargado, registrando las cantidades físicas que observo en el formato asignado.'
    }
  },
  // 19. Estructuración y Control Presupuestario (Operaciones Centrales)
  'area-ctrl-2': {
    situation: 'Se inicia el proceso de planificación financiera anual en un entorno económico volátil y se requiere estructurar y controlar el presupuesto operativo de las diferentes direcciones:',
    options: {
      A: 'Formulo el modelo presupuestario estratégico corporativo integrando escenarios de proyección financiera, asignando recursos a proyectos de alta rentabilidad y velando por la solidez patrimonial de la compañía.',
      B: 'Elaboro y monitoreo las cédulas presupuestarias de las áreas con criterio de eficiencia y austeridad, detecto desviaciones a tiempo y exijo planes de contención a los responsables de gasto.',
      C: 'Registro y cotejo los gastos ejecutados contra las partidas presupuestadas de mi área, identificando variaciones y presentando reportes claros a mi jefatura para su revisión.',
      D: 'Archivó y registro las facturas, comprobantes y órdenes de compra de acuerdo con las normativas contables vigentes y entrego los respaldos en las fechas programadas.'
    }
  },
  // 20. Gestión de Riesgos y Auditoría de Procesos (Operaciones Centrales)
  'area-ctrl-3': {
    situation: 'Se debe evaluar el cumplimiento de las normativas legales, fiscales y procedimentales internas ante una revisión regulatoria o auditoría general:',
    options: {
      A: 'Establezco la matriz de riesgos corporativos y el marco de gobierno interno de la empresa, anticipando impactos normativos y asegurando una cultura integral de cumplimiento, blindaje legal y transparencia.',
      B: 'Diseño planes de auditoría operativa y de cumplimiento, evalúo con criterio técnico los puntos de riesgo en los procesos y recomiendo acciones correctivas con seguimiento riguroso.',
      C: 'Ejecuto las pruebas de control y verificación documental asignadas, identifico no conformidades puntuales con objetividad y redacto los hallazgos en los informes de trabajo.',
      D: 'Facilito la documentación y expedientes requeridos por los auditores, respondiendo con veracidad a las consultas sobre los procedimientos habituales de mi puesto.'
    }
  }
};

/**
 * Convierte un comportamiento observable del manual oficial a primera persona
 */
function convertObservableToFirstPerson(str: string): string {
  let s = (str || '').trim().replace(/\.$/, '');
  s = s.replace(/\bsu\b/gi, 'mi').replace(/\bsus\b/gi, 'mis');

  // Caso reflexivo: Se [verbo] -> me [verbo]
  if (/^Se\s+/i.test(s)) {
    const after = s.replace(/^Se\s+/i, '');
    const firstWord = after.split(' ')[0];
    const rest = after.slice(firstWord.length);
    let conjugated = firstWord;
    if (firstWord.endsWith('a') || firstWord.endsWith('e')) {
      conjugated = firstWord.slice(0, -1) + 'o';
    }
    return 'me ' + conjugated.toLowerCase() + rest;
  }

  // Caso "Es " -> "soy "
  if (/^Es\s+/i.test(s)) {
    return 'soy ' + s.slice(3);
  }

  // Mapeos irregulares frecuentes en español
  const irregulars: Record<string, string> = {
    'propone': 'propongo',
    'expone': 'expongo',
    'dispone': 'dispongo',
    'compone': 'compongo',
    'hace': 'hago',
    'pone': 'pongo',
    'antepone': 'antepongo',
    'contribuye': 'contribuyo',
    'construye': 'construyo',
    'concluye': 'concluyo',
    'mantiene': 'mantengo',
    'obtiene': 'obtengo',
    'previene': 'prevengo',
    'interviene': 'intervengo',
    'ejerce': 'ejerzo',
    'reconoce': 'reconozco',
    'conduce': 'conduzco',
    'introduce': 'introduzco',
    'establece': 'establezco',
    'ofrece': 'ofrezco',
    'sigue': 'sigo',
    'persiste': 'persisto',
    'formula': 'formulo',
    'modela': 'modelo'
  };

  const words = s.split(' ');
  const firstWord = words[0];
  const firstWordLower = firstWord.toLowerCase();
  const rest = s.slice(firstWord.length);

  if (irregulars[firstWordLower]) {
    return irregulars[firstWordLower] + rest;
  }

  // Reglas regulares de presente de indicativo: termina en -a o -e -> -o
  if (firstWord.endsWith('a') || firstWord.endsWith('á')) {
    const root = firstWord.replace(/[aá]$/i, '');
    return root.toLowerCase() + 'o' + rest;
  }
  if (firstWord.endsWith('e')) {
    const root = firstWord.replace(/e$/i, '');
    return root.toLowerCase() + 'o' + rest;
  }

  return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * Convierte las competencias activas del perfil en reactivos oficiales tipo Question
 * para los formularios de evaluación de Bloque 2 (Evaluación por Competencias).
 * Admite modo regular o modo promoción (evaluando según el puesto superior destino).
 * Cada pregunta y sus 4 opciones se basan estrictamente en el NIVEL ESPERADO para el cargo:
 * - NIVEL D: Analistas, Especialistas y Responsables
 * - NIVEL C: Coordinadores y Supervisores
 * - NIVEL B: Gerentes
 * - NIVEL A: Directores y Junta Directiva
 */
export function getOfficialCompetencyQuestions(
  position: string = '',
  directorate: string = '',
  isSupervisor: boolean = false,
  isPromotion: boolean = false,
  targetPositionParam?: string,
  evaluatorRole: string = 'self'
): Question[] {
  const effectivePosition = isPromotion && targetPositionParam ? targetPositionParam : position;
  const profile = resolveEmployeeCompetencyProfile(effectivePosition, directorate);
  const targetLevel = profile.expectedLevel; // D, C, B o A (nivel requerido por el cargo o puesto superior)
  const roleNorm = (evaluatorRole || 'self').toLowerCase();

  return profile.activeCompetencies.map(comp => {
    const levelDef = comp.levels[targetLevel];
    const rawItems = levelDef?.observableItems || [];

    const baseCase = COMPETENCY_SITUATIONAL_CASES[comp.id];
    const baseSituation = baseCase?.situation || comp.definition;
    const situation = baseSituation;

    // Helper para limpiar punto final y espacios
    const cleanBehavior = (s: string) => (s || '').trim().replace(/\.+$/, '');
    const lowerInitial = (s: string) => s ? s.charAt(0).toLowerCase() + s.slice(1) : '';
    const cap = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

    let opt100Reaction = '';
    let opt75Reaction = '';
    let opt50Reaction = '';
    let opt25Reaction = '';

    if (roleNorm.includes('superv')) {
      // Evaluación del Supervisor Inmediato: orientada al líder ("Mi líder...")
      const b0 = cleanBehavior(lowerInitial(rawItems[0] || 'establece los lineamientos de trabajo'));
      const b1 = cleanBehavior(lowerInitial(rawItems[1] || 'aplica los procedimientos técnicos con rigor'));
      const b2 = cleanBehavior(lowerInitial(rawItems[2] || 'propone mejoras oportunas en el flujo de operaciones'));
      const b3 = cleanBehavior(lowerInitial(rawItems[3] || 'coordina activamente las actividades del equipo'));
      const b4 = cleanBehavior(lowerInitial(rawItems[4] || 'resuelve las contingencias operativas con autonomía'));

      opt100Reaction = `Mi líder ${b0} y ${b4}.`;
      opt75Reaction = `Mi líder ${b1} y ${b3}.`;
      opt50Reaction = `Mi líder ${b2}, orientando las acciones hacia la calidad y fluidez de los procesos.`;
      opt25Reaction = `Mi líder ${b4}, atendiendo con precisión los requerimientos inmediatos planteados en la jornada.`;
    } else if (roleNorm.includes('peer') || roleNorm.includes('par')) {
      // Evaluación de Pares: orientada al colega ("Mi compañero...")
      const b0 = cleanBehavior(lowerInitial(rawItems[0] || 'cumple con sus responsabilidades asignadas'));
      const b1 = cleanBehavior(lowerInitial(rawItems[1] || 'aplica los procedimientos técnicos requeridos'));
      const b2 = cleanBehavior(lowerInitial(rawItems[2] || 'propone soluciones oportunas para agilizar las labores'));
      const b3 = cleanBehavior(lowerInitial(rawItems[3] || 'coordina activamente con los compañeros del área'));
      const b4 = cleanBehavior(lowerInitial(rawItems[4] || 'resuelve las contingencias laborales con autonomía'));

      opt100Reaction = `Mi compañero ${b0} y ${b4}.`;
      opt75Reaction = `Mi compañero ${b1} y ${b3}.`;
      opt50Reaction = `Mi compañero ${b2}, orientando las acciones hacia la calidad y fluidez de los procesos.`;
      opt25Reaction = `Mi compañero ${b4}, atendiendo con precisión los requerimientos inmediatos planteados en la jornada.`;
    } else if (roleNorm.includes('subord') || roleNorm.includes('equipo') || roleNorm.includes('colab')) {
      // Evaluación de Subordinados: orientada al colaborador ("El colaborador...")
      const b0 = cleanBehavior(lowerInitial(rawItems[0] || 'cumple con sus responsabilidades asignadas'));
      const b1 = cleanBehavior(lowerInitial(rawItems[1] || 'aplica los procedimientos técnicos requeridos'));
      const b2 = cleanBehavior(lowerInitial(rawItems[2] || 'propone soluciones oportunas para agilizar las labores'));
      const b3 = cleanBehavior(lowerInitial(rawItems[3] || 'coordina activamente los requerimientos asignados'));
      const b4 = cleanBehavior(lowerInitial(rawItems[4] || 'resuelve las contingencias operativas con autonomía'));

      opt100Reaction = `El colaborador ${b0} y ${b4}.`;
      opt75Reaction = `El colaborador ${b1} y ${b3}.`;
      opt50Reaction = `El colaborador ${b2}, orientando las acciones hacia la calidad y fluidez de los procesos.`;
      opt25Reaction = `El colaborador ${b4}, atendiendo con precisión los requerimientos inmediatos planteados en la jornada.`;
    } else {
      // Autoevaluación (1ra persona)
      const firstPersonItems = rawItems.map(convertObservableToFirstPerson);
      const b0 = cleanBehavior(firstPersonItems[0] || 'cumplo con mis responsabilidades asignadas');
      const b1 = cleanBehavior(firstPersonItems[1] || 'aplico los procedimientos técnicos requeridos');
      const b2 = cleanBehavior(firstPersonItems[2] || 'propongo soluciones oportunas para agilizar las labores');
      const b3 = cleanBehavior(firstPersonItems[3] || 'coordino activamente los requerimientos del área');
      const b4 = cleanBehavior(firstPersonItems[4] || 'resuelvo las contingencias operativas con autonomía');

      opt100Reaction = `${cap(b0)} y ${b4}.`;
      opt75Reaction = `${cap(b1)} y ${b3}.`;
      opt50Reaction = `${cap(b2)}, orientando las acciones hacia la calidad y fluidez de los procesos.`;
      opt25Reaction = `${cap(b4)}, atendiendo con precisión los requerimientos inmediatos planteados en la jornada.`;
    }

    return {
      id: comp.id,
      competency: comp.name,
      category: (comp.type === 'cardinal' ? 'cardinal' : (comp.type === 'supervision' || comp.type === 'board') ? 'leadership' : 'area') as any,
      focusArea: comp.clusterLabel,
      text: situation,
      situation: situation,
      options: [
        {
          id: `${comp.id}-opt100`,
          score: 5.00,
          percent: 100,
          levelLetter: targetLevel,
          levelLabel: `100% de Dominio (${levelDef?.name || 'Nivel Esperado'})`,
          text: opt100Reaction
        },
        {
          id: `${comp.id}-opt75`,
          score: 3.75,
          percent: 75,
          levelLetter: targetLevel,
          levelLabel: `75% de Dominio (${levelDef?.name || 'Nivel Esperado'})`,
          text: opt75Reaction
        },
        {
          id: `${comp.id}-opt50`,
          score: 2.50,
          percent: 50,
          levelLetter: targetLevel,
          levelLabel: `50% de Dominio (${levelDef?.name || 'Nivel Esperado'})`,
          text: opt50Reaction
        },
        {
          id: `${comp.id}-opt25`,
          score: 1.25,
          percent: 25,
          levelLetter: targetLevel,
          levelLabel: `25% de Dominio (${levelDef?.name || 'Nivel Esperado'})`,
          text: opt25Reaction
        }
      ]
    };
  });
}

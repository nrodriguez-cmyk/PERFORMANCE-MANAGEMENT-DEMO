export interface ParsedJobDescriptor {
  title: string;
  department: string;
  directorate: string;
  summary: string;
  responsibilities: string[];
  keyFunctions: string[];
  technicalKnowledge: string[];
  requiredCompetencies: string[];
  academicRequirements: string;
  rawText: string;
}

/**
 * Parses raw text or structured markdown of a job descriptor,
 * specifically extracting CONOCIMIENTO TÉCNICO and FUNCIONES CLAVE.
 */
export function parseJobDescriptorText(rawText: string): ParsedJobDescriptor {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  let title = 'Descriptor de Cargo Institucional';
  let department = 'Área Operativa';
  let directorate = 'Dirección de Operaciones';
  let summary = '';
  const responsibilities: string[] = [];
  const keyFunctions: string[] = [];
  const technicalKnowledge: string[] = [];
  const requiredCompetencies: string[] = [];
  let academicRequirements = '';

  let currentSection: 'general' | 'summary' | 'key_functions' | 'technical_knowledge' | 'competencies' | 'academic' = 'general';

  for (const line of lines) {
    const lower = line.toLowerCase();
    
    // Header detections
    if (lower.includes('cargo:') || lower.includes('puesto:') || lower.includes('título:') || lower.includes('denominación del cargo')) {
      title = line.split(':')[1]?.trim() || line.replace(/^(cargo|puesto|título|denominación del cargo)[:\s]*/i, '').trim() || title;
      continue;
    }
    if (lower.includes('departamento:') || lower.includes('gerencia:') || lower.includes('coordinación:') || lower.includes('unidad:')) {
      department = line.split(':')[1]?.trim() || department;
      continue;
    }
    if (lower.includes('dirección:') || lower.includes('adscripción:')) {
      directorate = line.split(':')[1]?.trim() || directorate;
      continue;
    }

    // Section triggers
    if (
      lower.includes('conocimiento técnico') ||
      lower.includes('conocimientos técnicos') ||
      lower.includes('saber técnico') ||
      lower.includes('conocimientos requeridos') ||
      lower.includes('conocimientos específicos') ||
      lower.includes('habilidades técnicas') ||
      lower.includes('competencias técnicas') ||
      lower.includes('herramientas técnicas')
    ) {
      currentSection = 'technical_knowledge';
      continue;
    }

    if (
      lower.includes('funciones clave') ||
      lower.includes('función clave') ||
      lower.includes('funciones principales') ||
      lower.includes('responsabilidades principales') ||
      lower.includes('responsabilidad') ||
      lower.includes('tareas clave') ||
      lower.includes('actividades principales') ||
      lower.includes('funciones del cargo')
    ) {
      currentSection = 'key_functions';
      continue;
    }

    if (lower.includes('propósito') || lower.includes('resumen') || lower.includes('misión del cargo') || lower.includes('objetivo del cargo')) {
      currentSection = 'summary';
      continue;
    }

    if (lower.includes('competencia') || lower.includes('habilidades conductuales') || lower.includes('conductas observables')) {
      currentSection = 'competencies';
      continue;
    }

    if (lower.includes('requisito') || lower.includes('perfil académico') || lower.includes('educación') || lower.includes('formación')) {
      currentSection = 'academic';
      continue;
    }

    // Process line according to current section
    const cleanItem = line.replace(/^[-*•\d.)]+\s*/, '').trim();
    if (!cleanItem) continue;

    if (currentSection === 'summary') {
      summary += (summary ? ' ' : '') + cleanItem;
    } else if (currentSection === 'key_functions') {
      keyFunctions.push(cleanItem);
      responsibilities.push(cleanItem);
    } else if (currentSection === 'technical_knowledge') {
      technicalKnowledge.push(cleanItem);
    } else if (currentSection === 'competencies') {
      requiredCompetencies.push(cleanItem);
    } else if (currentSection === 'academic') {
      academicRequirements += (academicRequirements ? '; ' : '') + cleanItem;
    }
  }

  // Fallbacks if sections were not explicitly found
  if (keyFunctions.length === 0) {
    keyFunctions.push('Supervisión y control diario del piso de venta, cumplimiento de presupuestos comerciales y ticket promedio.');
    keyFunctions.push('Garantizar apertura, control de cajas fiscales, arqueos continuos y cuadres de cierre bancario.');
    keyFunctions.push('Coordinar la recepción física de mercancía, cotejo de guías de despacho y ejecución de inventarios cíclicos.');
    keyFunctions.push('Atender y resolver objeciones complejas de clientes con apego estricto a la política de garantías y devoluciones.');
    keyFunctions.push('Velar por la exhibición comercial, imagen de vitrinas y planogramas oficiales de la marca El Canguro.');
  }

  if (responsibilities.length === 0) {
    responsibilities.push(...keyFunctions);
  }

  if (technicalKnowledge.length === 0) {
    technicalKnowledge.push('Manejo de sistemas POS (Puntos de Venta), facturación fiscal y cuadres de lote de tarjeta.');
    technicalKnowledge.push('Control, rotación y conteos cíclicos de inventario en retail de calzado y marroquinería.');
    technicalKnowledge.push('Conocimiento técnico de materiales (cuero vacuno, badana, suelas sintéticas, herrajes) y cuidado del producto.');
    technicalKnowledge.push('Normativas de control interno, prevención de mermas y protocolos de auditoría ciega.');
    technicalKnowledge.push('Técnicas de venta consultiva, venta cruzada y manejo estructurado de objeciones comerciales.');
  }

  if (requiredCompetencies.length === 0) {
    requiredCompetencies.push('Orientación al Cliente');
    requiredCompetencies.push('Aprendizaje e Innovación');
    requiredCompetencies.push('Capacidad de Análisis');
    requiredCompetencies.push('Trabajo en Equipo');
    requiredCompetencies.push('Adaptabilidad y Flexibilidad');
    requiredCompetencies.push('Liderar con el Ejemplo');
    requiredCompetencies.push('Orientación al Logro');
    requiredCompetencies.push('Desarrollo de Equipos');
    requiredCompetencies.push('Prevención de Pérdidas');
    requiredCompetencies.push('Auditoría de Procesos');
  }

  return {
    title,
    department,
    directorate,
    summary: summary || 'Rol clave en la estructura de DISTRICUEROS EL CANGURO, C.A.',
    responsibilities,
    keyFunctions,
    technicalKnowledge,
    requiredCompetencies,
    academicRequirements: academicRequirements || 'Educación técnica o universitaria con experiencia comprobable en retail.',
    rawText
  };
}

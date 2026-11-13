import React, { useState } from 'react';
import { EmployeeInfo, Question } from '../types';
import { EvaluationFormatDesigner } from './EvaluationFormatDesigner';
import { JobDescriptorModal } from './JobDescriptorModal';
import {
  resolveEmployeeCompetencyProfile,
  getDefaultPromotionTargetPosition,
  resolvePositionManagementLevel,
  resolvePromotionCompetencyProfile
} from '../data/canguroCompetencyDictionary';
import { BIG_FIVE_20_ITEMS } from '../promotionQuestions';
import {
  Copy, Mail, Send, CheckCircle, Sliders, Sparkles, ExternalLink,
  ShieldCheck, UserCheck, Lock, CheckCircle2, Award, BookOpen, Layers,
  Wrench, Briefcase, Brain, HelpCircle, Eye, Filter, FileText, ChevronDown, ChevronUp, AlertCircle, ArrowRight, Play
} from 'lucide-react';

interface EvaluationProfileConfigProps {
  info: EmployeeInfo;
  onChange: (info: EmployeeInfo) => void;
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
  onNavigateToStage?: (stageId: string, subId?: string) => void;
}

export function EvaluationProfileConfig({
  info,
  onChange,
  questions,
  onUpdateQuestions,
  onNavigateToStage
}: EvaluationProfileConfigProps) {
  const [activeSubprocess, setActiveSubprocess] = useState<'datos' | 'configuracion'>('datos');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showDesigner, setShowDesigner] = useState(false);
  const [showDescriptorModal, setShowDescriptorModal] = useState(false);
  const [reactivesTab, setReactivesTab] = useState<'descriptor' | 'bigfive'>('descriptor');
  const [focusFilter, setFocusFilter] = useState<'ALL' | 'CONOCIMIENTO TÉCNICO' | 'FUNCIONES CLAVE'>('ALL');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Email sending status map
  const [emailStatus, setEmailStatus] = useState<Record<string, 'idle' | 'sending' | 'success' | 'error'>>({});
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({});
  const [evaluatorNames, setEvaluatorNames] = useState<Record<string, string>>({
    supervisor: '',
    peer: '',
    subordinate: ''
  });
  const [evaluatorPositions, setEvaluatorPositions] = useState<Record<string, string>>({
    supervisor: 'Supervisor Inmediato',
    peer: 'Par / Colega Homólogo',
    subordinate: 'Equipo a Cargo'
  });

  const POSITIONS = [
    'Director',
    'Gerente',
    'Supervisor',
    'Coordinador',
    'Responsable',
    'Especialista',
    'Analista',
    'Operador Integral',
    'Asesor Integral',
    'Encargado de Tienda'
  ];

  const DIRECTORATES = [
    'Dirección de Operaciones',
    'Dirección Comercial',
    'Dirección de Administración y Finanzas',
    'Dirección de Tecnología',
    'Dirección de Transporte y Logística',
    'Dirección de Compras',
    'Dirección de Control Interno',
    'Dirección de Talento Humano'
  ];

  const positionsWithSubordinates = ['Coordinador', 'Supervisor', 'Gerente', 'Director'];
  const hasSubordinates = positionsWithSubordinates.includes(info.position);

  // Robust link generator
  const getEvaluationBaseUrl = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`;
    // Supports both SPA hash router and standard entry point
    return `${origin}${window.location.pathname}#/evaluate`;
  };

  const baseUrl = getEvaluationBaseUrl();
  const nameQuery = encodeURIComponent(`${info.firstName} ${info.lastName}`.trim() || 'Colaborador');
  const posQuery = encodeURIComponent(info.position || '');
  const idQuery = encodeURIComponent(info.idNumber || '');
  const deptQuery = encodeURIComponent(info.department || '');
  const dirQuery = encodeURIComponent(info.directorate || '');
  const cleanIdNumber = (info.idNumber || '').replace(/[\.\s-]/g, '').toLowerCase() || 'collab';

  const isPromotion = info.processType === 'promotion';
  const effectiveTargetPos = info.targetPromotionPosition || getDefaultPromotionTargetPosition(info.position);
  const targetPosQuery = encodeURIComponent(effectiveTargetPos);

  const evaluationLinks = isPromotion ? [
    {
      id: 'promotion_candidate',
      role: 'promotion',
      label: `Módulo A - Enlace 1: Evaluación del Colaborador Postulado (${info.firstName} ${info.lastName})`,
      desc: `Instrumento prospectivo para el postulante. Contiene obligatoriamente: 1. Evaluación de Liderazgo (18 reactivos), 2. Test BIG 5 (20 reactivos psicométricos), y 3. Competencias del Cargo Superior ${effectiveTargetPos} (Nivel ${resolvePositionManagementLevel(effectiveTargetPos).level}).`,
      url: `${baseUrl}/promotion?employee=${nameQuery}&position=${posQuery}&idNumber=${idQuery}&dept=${deptQuery}&dir=${dirQuery}&targetPos=${targetPosQuery}&token=${encodeURIComponent(`canguro_${cleanIdNumber}_promotion`)}`,
      required: true
    },
    {
      id: 'promotion_supervisor',
      role: 'promotion_supervisor',
      label: `Módulo B - Enlace 2: Evaluación del Supervisor Inmediato (180° Promoción ➔ ${effectiveTargetPos})`,
      desc: `Evaluación técnica realizada por el supervisor directo para calificar la preparación y comportamientos observables requeridos para el cargo superior ${effectiveTargetPos} (Nivel ${resolvePositionManagementLevel(effectiveTargetPos).level}) y emitir el dictamen de idoneidad.`,
      url: `${baseUrl}/promotion_supervisor?employee=${nameQuery}&position=${posQuery}&idNumber=${idQuery}&dept=${deptQuery}&dir=${dirQuery}&targetPos=${targetPosQuery}${evaluatorNames.supervisor ? `&evaluatorName=${encodeURIComponent(evaluatorNames.supervisor.trim())}` : ''}&token=${encodeURIComponent(`canguro_${cleanIdNumber}_promotion_supervisor`)}`,
      required: true
    }
  ] : [
    {
      id: 'self',
      role: 'self',
      label: 'Autoevaluación (Colaborador)',
      desc: 'Formulario confidencial de metas, autopercepción y competencias.',
      url: `${baseUrl}/self?employee=${nameQuery}&position=${posQuery}&idNumber=${idQuery}&dept=${deptQuery}&dir=${dirQuery}&token=${encodeURIComponent(`canguro_${cleanIdNumber}_self`)}`,
      required: true
    },
    {
      id: 'supervisor',
      role: 'supervisor',
      label: 'Evaluación del Supervisor Inmediato (Jefe)',
      desc: 'Calificación jerárquica de metas cuantitativas e indicadores por competencias.',
      url: `${baseUrl}/supervisor?employee=${nameQuery}&position=${posQuery}&idNumber=${idQuery}&dept=${deptQuery}&dir=${dirQuery}${evaluatorNames.supervisor ? `&evaluatorName=${encodeURIComponent(evaluatorNames.supervisor.trim())}` : ''}${evaluatorPositions.supervisor ? `&evaluatorPos=${encodeURIComponent(evaluatorPositions.supervisor.trim())}` : ''}&token=${encodeURIComponent(`canguro_${cleanIdNumber}_supervisor`)}`,
      required: true
    },
    {
      id: 'peer',
      role: 'peer',
      label: 'Evaluación de Pares (Colegas Homólogos)',
      desc: 'Calificación de sinergia, trabajo en equipo y soporte interdependiente.',
      url: `${baseUrl}/peer?employee=${nameQuery}&position=${posQuery}&idNumber=${idQuery}&dept=${deptQuery}&dir=${dirQuery}${evaluatorNames.peer ? `&evaluatorName=${encodeURIComponent(evaluatorNames.peer.trim())}` : ''}${evaluatorPositions.peer ? `&evaluatorPos=${encodeURIComponent(evaluatorPositions.peer.trim())}` : ''}&token=${encodeURIComponent(`canguro_${cleanIdNumber}_peer`)}`,
      required: true
    },
    ...(hasSubordinates ? [{
      id: 'subordinate',
      role: 'subordinate',
      label: 'Evaluación de Subordinados (Equipo a Cargo)',
      desc: 'Calificación confidencial de liderazgo, delegación y clima relacional.',
      url: `${baseUrl}/subordinate?employee=${nameQuery}&position=${posQuery}&idNumber=${idQuery}&dept=${deptQuery}&dir=${dirQuery}${evaluatorNames.subordinate ? `&evaluatorName=${encodeURIComponent(evaluatorNames.subordinate.trim())}` : ''}${evaluatorPositions.subordinate ? `&evaluatorPos=${encodeURIComponent(evaluatorPositions.subordinate.trim())}` : ''}&token=${encodeURIComponent(`canguro_${cleanIdNumber}_subordinate`)}`,
      required: true
    }] : [])
  ];

  const handleLaunchPromotionEvaluation = () => {
    // 1. Guardar y actualizar los datos del postulante con el cargo objetivo
    const candidateData: EmployeeInfo = {
      ...info,
      targetPromotionPosition: effectiveTargetPos
    };
    onChange(candidateData);

    // 2. Persistir en almacenamiento local para asegurar que la evaluación reconozca todos los datos
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem('canguro_custom_collaborators') || '[]';
        const list = JSON.parse(raw);
        const cleanDigits = (info.idNumber || '').replace(/\D/g, '');
        const existingIdx = list.findIndex((c: any) => {
          const cDigits = (c.info?.idNumber || '').replace(/\D/g, '');
          return Boolean(cleanDigits && cDigits === cleanDigits);
        });

        const newCollabEntry = {
          info: candidateData,
          evaluationSetupInfo: candidateData
        };

        if (existingIdx >= 0) {
          list[existingIdx] = { ...list[existingIdx], ...newCollabEntry };
        } else {
          list.unshift(newCollabEntry);
        }
        window.localStorage.setItem('canguro_custom_collaborators', JSON.stringify(list));
      } catch (e) {
        // fallback
      }
    }

    // 3. Redirigir de inmediato al instrumento oficial de evaluación de promoción para el postulante
    const candidateLink = evaluationLinks[0]?.url;
    if (candidateLink && candidateLink.includes('#')) {
      const hashPart = candidateLink.split('#')[1];
      window.location.hash = hashPart;
    } else {
      window.location.hash = `#/evaluate/promotion?employee=${nameQuery}&position=${posQuery}&idNumber=${idQuery}&dept=${deptQuery}&dir=${dirQuery}&targetPos=${targetPosQuery}`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getEmailBodyText = (roleLabel: string, url: string, isPromotionEval: boolean = isPromotion) => {
    if (isPromotionEval) {
      return `DISTRICUEROS EL CANGURO, C.A.\nDirección de Talento Humano | Gerencia de Formación y Desarrollo\n\nEstimado(a) ${info.firstName} ${info.lastName},\n\nSe ha emitido formalmente la convocatoria para su postulación y evaluación en el Concurso de Promoción y Ascenso al cargo de: ${effectiveTargetPos}.\n\nEsta evaluación debe ser completada exclusivamente por usted como colaborador postulante. Evalúa su autopercepción de competencias frente a las exigencias del cargo superior y su batería de potencial y liderazgo (Sección 3).\n\nPara asegurarte de llenar esta evaluación correctamente, te recomendamos buscar un lugar tranquilo y libre de distracciones donde puedas dedicar entre 15 y 20 minutos sin interrupciones. Antes de comenzar, verifica tu conexión a internet, silencia las notificaciones de tus dispositivos y asegúrate de realizar la evaluación en un momento del día en el que te sientas descansado y con la mente despejada; esto te permitirá leer las instrucciones con calma y responder con total honestidad.\n\nPor favor ingresa al siguiente enlace oficial para completar su instrumento:\n${url}\n\nIMPORTANTE (REGLA DE USO ÚNICO): Este enlace es personal, confidencial y de USO ÚNICO. Una vez enviado el instrumento, el enlace quedará deshabilitado permanentemente y no se podrá enviar dos veces una evaluación desde el mismo enlace.\n\nAtentamente,\nGerencia de Formación y Desarrollo\nDISTRICUEROS EL CANGURO, C.A.`;
    }
    return `DISTRICUEROS EL CANGURO, C.A.\nDirección de Talento Humano | Gerencia de Formación y Desarrollo\n\nEstimado colaborador,\n\nSe ha emitido formalmente la convocatoria para la evaluación de desempeño y talento de:\nColaborador: ${info.firstName} ${info.lastName}\nCédula: ${info.idNumber}\nCargo: ${info.position}\nRol Evaluador: ${roleLabel}\n\nPara asegurarte de llenar esta evaluación correctamente, te recomendamos buscar un lugar tranquilo y libre de distracciones donde puedas dedicar entre 15 y 20 minutos sin interrupciones. Antes de comenzar, verifica tu conexión a internet, silencia las notificaciones de tus dispositivos y asegúrate de realizar la evaluación en un momento del día en el que te sientas descansado y con la mente despejada; esto te permitirá leer las instrucciones con calma y responder con total honestidad.\n\nPor favor ingresa al siguiente enlace oficial para completar el instrumento:\n${url}\n\nIMPORTANTE (REGLA DE USO ÚNICO): Este enlace es personal, confidencial y de USO ÚNICO. Una vez enviado el instrumento, el enlace quedará deshabilitado permanentemente y no se podrá enviar dos veces una evaluación desde el mismo enlace.\n\nAtentamente,\nGerencia de Formación y Desarrollo\nDISTRICUEROS EL CANGURO, C.A.`;
  };

  const handleSendEmail = async (roleId: string, roleLabel: string, url: string) => {
    const email = emailInputs[roleId];
    if (!email) return;

    setEmailStatus(prev => ({ ...prev, [roleId]: 'sending' }));

    const subject = `Convocatoria Oficial de Evaluación — ${info.firstName} ${info.lastName} | El Canguro`;
    const bodyText = getEmailBodyText(roleLabel, url);

    try {
      const resp = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject,
          body: bodyText,
          employeeName: `${info.firstName} ${info.lastName}`.trim(),
          idNumber: info.idNumber,
          position: info.position,
          roleLabel,
          url
        })
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        setEmailStatus(prev => ({ ...prev, [roleId]: 'success' }));
      } else {
        setEmailStatus(prev => ({ ...prev, [roleId]: 'error' }));
      }
    } catch {
      setEmailStatus(prev => ({ ...prev, [roleId]: 'error' }));
    }
  };

  // Direct Gmail web compose launcher helper
  const openGmailCompose = (roleId: string, roleLabel: string, url: string) => {
    const email = emailInputs[roleId] || '';
    const subject = encodeURIComponent(`Convocatoria Oficial de Evaluación — ${info.firstName} ${info.lastName} | El Canguro`);
    const body = encodeURIComponent(getEmailBodyText(roleLabel, url));
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  // Descriptor-based situational and technical reactives
  const descriptorQuestions: Question[] = questions && questions.filter(q => q.focusArea).length > 0
    ? questions.filter(q => q.focusArea)
    : [
        {
          id: 'def_func_1',
          focusArea: 'FUNCIONES CLAVE',
          competency: 'Supervisión y Metas en Piso de Venta',
          text: 'Supervisar y movilizar al equipo comercial para alcanzar el presupuesto de ventas y ticket promedio.',
          situation: 'Durante una jornada de alto tráfico en tienda, las visitas crecen pero el ticket promedio está un 15% por debajo de la meta. ¿Cómo interviene el evaluado?',
          options: [
            { id: 'opt1_a', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Monitorea activamente el piso, redistribuye asesores a puntos estratégicos, modela venta consultiva en marroquinería y realiza una calibración táctica inmediata con el equipo.' },
            { id: 'opt1_b', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Se suma a la atención directa en piso y recuerda al equipo las metas individuales del día.' },
            { id: 'opt1_c', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Espera al corte vespertino de ventas para identificar rezagos y llamar la atención al personal.' },
            { id: 'opt1_d', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Atribuye la caída al perfil del público del día sin ejecutar ninguna acción correctiva.' }
          ]
        },
        {
          id: 'def_tech_1',
          focusArea: 'CONOCIMIENTO TÉCNICO',
          competency: 'Sistemas Fiscales y Control de Cajas',
          text: 'Manejo avanzado de sistemas POS, facturación fiscal y conciliación de lotes bancarios.',
          situation: 'Al momento de realizar el corte Z y el cierre de lotes bancarios en el sistema de caja, se detecta un desfasaje entre el reporte del punto de venta y la facturación fiscal emitida en el día.',
          options: [
            { id: 'opt2_a', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Ejecuta el protocolo de conciliación transacción por transacción, aísla la operación fallida, emite la bitácora técnica de incidencia y notifica formalmente a Administración y Control Interno con soportes.' },
            { id: 'opt2_b', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Revisa los vouchers físicos contra el resumen de lote e identifica el ticket discrepante para reportarlo en el informe de cierre.' },
            { id: 'opt2_c', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Anota la diferencia como faltante provisional y solicita al soporte técnico que revise el sistema al día siguiente.' },
            { id: 'opt2_d', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Fuerza el cierre del lote bancario sin conciliar los comprobantes manuales para no retrasar la salida del personal.' }
          ]
        },
        {
          id: 'def_func_2',
          focusArea: 'FUNCIONES CLAVE',
          competency: 'Control de Inventarios y Recepción de Mercancía',
          text: 'Coordinar la recepción técnica de mercancía, cotejo de guías de despacho y ejecución de inventarios cíclicos.',
          situation: 'Al recibir el despacho de almacén central, se observa que dos bultos de calzado de alta rotación presentan precintos violentados y una discrepancia contra la guía de traslado.',
          options: [
            { id: 'opt3_a', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Detiene la recepción del bulto afectado, realiza conteo a ciegas en presencia del transportista, levanta acta fotográfica de no conformidad y notifica a Logística y Auditoría antes de dar entrada en sistema.' },
            { id: 'opt3_b', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Firma la guía con salvedad indicando el faltante físico recibido e ingresa únicamente las unidades conformes al inventario.' },
            { id: 'opt3_c', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Recibe la mercancía y la almacena en el depósito, posponiendo el reporte de diferencias para el cuadre semanal.' },
            { id: 'opt3_d', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Firma la guía conforme confiando en que el almacén regularizará la diferencia en el siguiente despacho.' }
          ]
        },
        {
          id: 'def_tech_2',
          focusArea: 'CONOCIMIENTO TÉCNICO',
          competency: 'Conocimiento Técnico de Materiales y Calidad de Calzado',
          text: 'Conocimiento de materiales (cuero vacuno, badana, suelas PU/TR) y conservación de calzado.',
          situation: 'Un cliente se presenta en tienda reclamando una supuesta falla en un par de calzado de cuero vacuno recién adquirido, exigiendo devolución inmediata de dinero.',
          options: [
            { id: 'opt4_a', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Inspecciona técnicamente la pieza (tipo de corte, costuras, flor del cuero, pegado de suela), explica empáticamente al cliente las propiedades naturales del material y aplica la política corporativa de garantía ofreciendo una solución técnica satisfactoria.' },
            { id: 'opt4_b', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Verifica la factura de compra, revisa el estado del calzado y gestiona el cambio por otra talla o modelo según las normas de cambio vigentes.' },
            { id: 'opt4_c', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Pide al cliente dejar el producto en custodia hasta que el supervisor zonal pueda revisarlo.' },
            { id: 'opt4_d', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Rechaza el reclamo de forma cortante aduciendo que el cuero no tiene garantía de fábrica.' }
          ]
        },
        {
          id: 'def_func_3',
          focusArea: 'FUNCIONES CLAVE',
          competency: 'Gestión y Resolución de Objeciones',
          text: 'Resolver objeciones complejas y gestionar la política de garantías y cambios de calzado y marroquinería.',
          situation: 'En temporada alta con la tienda llena, un cliente insatisfecho levanta la voz en caja amenazando con realizar una denuncia pública por demoras en la atención.',
          options: [
            { id: 'opt5_a', score: 5.0, levelLetter: 'A', levelLabel: 'Estratégico / Sobresaliente', text: 'Interviene de forma inmediata y sosegada, traslada la conversación a un espacio apartado de escucha activa, resuelve la causa raíz de la demora y reestablece la confianza del cliente preservando el clima en piso de venta.' },
            { id: 'opt5_b', score: 3.75, levelLetter: 'B', levelLabel: 'Avanzado / Autónomo', text: 'Atiende al cliente prioritariamente en otra caja para agilizar su salida y evitar que contagie su molestia a otros clientes.' },
            { id: 'opt5_c', score: 2.50, levelLetter: 'C', levelLabel: 'Intermedio / Estándar', text: 'Le pide que guarde la calma y que espere su turno como el resto de los compradores.' },
            { id: 'opt5_d', score: 1.25, levelLetter: 'D', levelLabel: 'Inicial / En Desarrollo', text: 'Se retira de la caja y deja que el asesor resuelva la situación por su cuenta.' }
          ]
        }
      ];

  const filteredDescriptorQuestions = descriptorQuestions.filter(q => {
    if (focusFilter === 'ALL') return true;
    return q.focusArea === focusFilter;
  });

  const handleSelectPromotion = () => {
    onChange({ ...info, processType: 'promotion' });
    setTimeout(() => {
      const el = document.getElementById('calibracion-banco-reactivos');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* SUBPROCESS 1: DATOS DEL COLABORADOR POSTULADO */}
      {activeSubprocess === 'datos' && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm text-zinc-900 space-y-6 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 uppercase">
                Postulación Individual • Presencial
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                DISTRICUEROS EL CANGURO, C.A.
              </span>
            </div>
            <h3 className="text-base font-black uppercase text-zinc-950 tracking-tight">
              Ficha del Colaborador Postulado — Datos Institucionales
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Registro del colaborador postulado para ascenso dentro de DISTRICUEROS EL CANGURO, C.A.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="Ej: Carlos"
                  value={info.firstName}
                  onChange={(e) => onChange({ ...info, firstName: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Apellido</label>
                <input
                  type="text"
                  placeholder="Ej: Mendoza"
                  value={info.lastName}
                  onChange={(e) => onChange({ ...info, lastName: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Cédula de Identidad (Formato Nacional)</label>
                <input
                  type="text"
                  placeholder="Ej: V-18.452.910"
                  value={info.idNumber}
                  onChange={(e) => onChange({ ...info, idNumber: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 font-mono text-xs text-zinc-900 font-bold focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Cargo Actual en el Organigrama</label>
                <select
                  value={info.position}
                  onChange={(e) => {
                    const pos = e.target.value;
                    const isLeader = positionsWithSubordinates.includes(pos);
                    onChange({
                      ...info,
                      position: pos,
                      scope: isLeader ? '360' : '180'
                    });
                  }}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
                >
                  <option value="" disabled>Seleccione un cargo...</option>
                  {POSITIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <span className="block text-[10px] text-zinc-400 mt-1 font-mono">
                  Alcance automático: {hasSubordinates ? '360° (Con Subordinados)' : '180° (Sin personal a cargo)'}
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Dirección de Adscripción</label>
                <select
                  value={info.directorate}
                  onChange={(e) => onChange({ ...info, directorate: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
                >
                  <option value="" disabled>Seleccione una dirección...</option>
                  {DIRECTORATES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Departamento / Tienda Específica</label>
                <input
                  type="text"
                  placeholder="Ej: Tienda Sambil Chacao / Almacén Central Guarenas..."
                  value={info.department}
                  onChange={(e) => onChange({ ...info, department: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => {
                setActiveSubprocess('configuracion');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <span>Continuar a Configuración</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      )}

      {/* SUBPROCESS 2: CONFIGURACIÓN DE EVALUACIÓN DE PROMOCIÓN */}
      {activeSubprocess === 'configuracion' && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm text-zinc-900 space-y-6 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 uppercase">
                Trifásico IA • Presencial Supervisado
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Postulado: {info.firstName} {info.lastName} ({info.idNumber || 'Sin Cédula'})
              </span>
            </div>
            <h3 className="text-base font-black uppercase text-zinc-950 tracking-tight">
              Parámetros del Concurso de Promoción y Ascenso
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Definición del cargo superior postulado, calibración de preguntas situacionales con Gemini IA y evaluación psicométrica supervisada.
            </p>
          </div>

          {/* Aviso Obligatorio de Modalidad Presencial */}
          <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-300 text-xs text-amber-950 space-y-1.5">
            <div className="font-black uppercase flex items-center gap-2 text-amber-900 text-xs tracking-wide">
              <AlertCircle size={16} className="text-[#D99C00]" />
              Modalidad Presencial Supervisada Obligatoria
            </div>
            <p className="text-[11.5px] leading-relaxed text-amber-900/90">
              El concurso de ascenso es <strong>estrictamente individual</strong>: el postulante debe presentar la prueba técnica situacional y psicométrica <strong>presencialmente en sitio junto con la encargada de Talento Humano</strong>. Esta modalidad no puede realizarse a distancia ni habilitarse de forma masiva.
            </p>
          </div>

          {/* Selector de Cargo Superior Destino y Descriptor */}
          <div className="p-5 rounded-xl bg-amber-50/70 border-2 border-amber-300 space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-200 gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#D99C00]" />
                <h4 className="text-xs font-black uppercase text-amber-950 font-sans">
                  Cargo Superior Destino & Calibración con IA
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDescriptorModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-950 hover:bg-[#F1B400] hover:text-black text-white text-xs font-bold uppercase rounded-lg transition-colors shadow-2xs cursor-pointer border border-zinc-800"
                >
                  <Sparkles size={13} className="text-[#F1B400]" /> Cargar Descriptor con Gemini IA
                </button>
              </div>
            </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-700 mb-1">
                    Cargo Superior al que Postula (Puesto Destino):
                  </label>
                  <select
                    value={effectiveTargetPos}
                    onChange={(e) => onChange({ ...info, targetPromotionPosition: e.target.value })}
                    className="w-full bg-white border border-amber-300 rounded-lg p-2.5 text-xs text-zinc-950 font-bold focus:outline-none focus:ring-1 focus:ring-[#F1B400] shadow-2xs"
                  >
                    {POSITIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <span className="block text-[10px] text-zinc-500 mt-1 font-mono">
                    La Sección 2 evaluará automáticamente los comportamientos esperados de este nivel superior.
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-700 mb-1">
                    Brecha de Nivel de Gestión y Dominio:
                  </label>
                  <div className="p-2.5 rounded-lg bg-white border border-amber-200 flex items-center justify-between font-mono text-xs shadow-2xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase">Nivel Actual</span>
                      <strong className="text-zinc-800">
                        Nivel {resolvePositionManagementLevel(info.position).level} ({info.position || 'Actual'})
                      </strong>
                    </div>
                    <span className="text-base text-[#D99C00] font-black">➔</span>
                    <div className="text-right">
                      <span className="text-[10px] text-[#D99C00] block uppercase font-bold">Nivel Destino</span>
                      <strong className="text-zinc-950 font-black">
                        Nivel {resolvePositionManagementLevel(effectiveTargetPos).level} ({effectiveTargetPos})
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtro de Elegibilidad para Promoción */}
              <div className="p-3 bg-white rounded-lg border border-amber-200 flex items-start gap-2.5 text-xs text-zinc-700">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-950 block text-[11px] uppercase">
                    Filtro Normativo de Elegibilidad para Promoción (9-Box Grid):
                  </strong>
                  <p className="text-[11px] text-zinc-600 leading-snug mt-0.5">
                    El sistema valida que el colaborador se encuentre en cuadrantes elegibles: <strong>Eje X ≥ 2 (≥ 3.00 pts de Desempeño)</strong> y <strong>Eje Y ≥ 2 (≥ 2.50 pts de Potencial)</strong>. Esto garantiza que solo los candidatos de Alto Rendimiento, Alto Potencial o Talento Clave opten a concursos de ascenso.
                  </p>
                </div>
              </div>
            </div>

          {/* BANCO Y CALIBRACIÓN DE REACTIVOS (CONOCIMIENTO TÉCNICO Y FUNCIONES CLAVE) - EXCLUSIVO CONCURSO DE PROMOCIÓN */}
          <div className="space-y-6 animate-in fade-in">
              <div id="calibracion-banco-reactivos" className="p-5 rounded-xl bg-zinc-50 border-2 border-amber-300 space-y-4 scroll-mt-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Sliders size={16} className="text-[#D99C00]" />
                    <h4 className="text-xs font-black uppercase text-zinc-950 font-sans">
                      Calibración y Banco de Reactivos para la Evaluación
                    </h4>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-800">
                      Solo Configuración
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F1B400] text-black">
                      Cargo Destino: {effectiveTargetPos}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600">
                    Visualice y calibre los reactivos técnicos y funcionales desarrollados con el Descriptor de Cargo procesado por Gemini IA. <em>En este panel no se responden evaluaciones ni se ingresan calificaciones individuales de colaboradores.</em>
                  </p>
                </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowDescriptorModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  <Sparkles size={13} className="text-[#F1B400]" />
                  <span>Cargar Descriptor (PDF) con Gemini</span>
                </button>
              </div>
            </div>

            {/* Pestañas de Instrumentos: Descriptor vs Big Five */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setReactivesTab('descriptor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    reactivesTab === 'descriptor'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950 bg-white border border-zinc-200'
                  }`}
                >
                  <Briefcase size={13} className={reactivesTab === 'descriptor' ? 'text-[#F1B400]' : 'text-zinc-400'} />
                  <span>Reactivos del Descriptor ({descriptorQuestions.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReactivesTab('bigfive')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    reactivesTab === 'bigfive'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950 bg-white border border-zinc-200'
                  }`}
                >
                  <Brain size={13} className={reactivesTab === 'bigfive' ? 'text-[#F1B400]' : 'text-zinc-400'} />
                  <span>Medición de Predisposición Conductual y Adecuación al nuevo Cargo (20 Reactivos)</span>
                </button>
              </div>

              {reactivesTab === 'descriptor' && (
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <span className="text-zinc-400 mr-1 flex items-center gap-1">
                    <Filter size={11} /> Filtro:
                  </span>
                  {(['ALL', 'CONOCIMIENTO TÉCNICO', 'FUNCIONES CLAVE'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFocusFilter(f)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                        focusFilter === f
                          ? 'bg-[#F1B400] text-black font-black'
                          : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {f === 'ALL' ? 'Todos' : f === 'CONOCIMIENTO TÉCNICO' ? 'Conocimiento Técnico' : 'Funciones Clave'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CONTENIDO PESTAÑA 1: REACTIVOS DEL DESCRIPTOR */}
            {reactivesTab === 'descriptor' && (
              <div className="space-y-3">
                {filteredDescriptorQuestions.map((q, idx) => {
                  const isExpanded = expandedQuestionId === q.id || idx === 0;
                  const isTech = q.focusArea === 'CONOCIMIENTO TÉCNICO';

                  return (
                    <div
                      key={q.id || idx}
                      className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs transition-all hover:border-zinc-300"
                    >
                      <div
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="p-3.5 flex items-start justify-between gap-3 cursor-pointer bg-zinc-50/50 hover:bg-zinc-50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase ${
                              isTech
                                ? 'bg-amber-100 text-amber-950 border border-amber-300'
                                : 'bg-sky-100 text-sky-950 border border-sky-300'
                            }`}>
                              {q.focusArea || 'DESCRIPTOR'}
                            </span>
                            <span className="text-xs font-bold text-zinc-950">
                              {q.competency || `Pregunta ${idx + 1}`}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              Rúbrica de 4 Niveles (1.25 a 5.00 pts)
                            </span>
                          </div>
                          <p className="text-xs text-zinc-700 leading-snug">
                            {q.situation || q.text}
                          </p>
                        </div>

                        <div className="p-1 text-zinc-400 hover:text-black shrink-0">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {/* Rúbrica desplegada (4 niveles normativos de calibración) */}
                      {isExpanded && (
                        <div className="p-3.5 pt-2 border-t border-zinc-100 bg-white space-y-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 block">
                            Rúbrica de Calificación Parametrizada (Ponderación 4 Niveles):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {q.options?.map((opt) => (
                              <div
                                key={opt.id}
                                className="p-2 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1"
                              >
                                <div className="flex items-center justify-between font-mono text-[10px]">
                                  <span className="font-bold text-zinc-900">
                                    Nivel {opt.levelLetter} ({opt.levelLabel || 'Puntaje'}):
                                  </span>
                                  <span className="font-black text-[#D99C00]">
                                    {opt.score.toFixed(2)} pts
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-600 leading-relaxed">
                                  {opt.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* CONTENIDO PESTAÑA 2: INVENTARIO PSICOMÉTRICO BIG FIVE (20 REACTIVOS) */}
            {reactivesTab === 'bigfive' && (
              <div className="space-y-3 bg-white p-4 rounded-xl border border-zinc-200">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <div>
                    <span className="text-xs font-bold text-zinc-950 uppercase font-sans">
                      Medición de Predisposición Conductual y Adecuación al nuevo Cargo (20 Reactivos)
                    </span>
                    <p className="text-[11px] text-zinc-500">
                      Escala Likert de 1 (Totalmente en desacuerdo) a 5 (Totalmente de acuerdo) para medir madurez conductual.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-bold">
                    Norma DTH-GFD-MC-01
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {BIG_FIVE_20_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg border border-zinc-200 bg-zinc-50/60 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] text-zinc-500">
                          Pregunta #{item.number}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-950">
                          {item.traitName}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-800 leading-snug">
                        {item.text}
                      </p>
                      <span className="text-[9px] font-mono text-zinc-400 block">
                        {item.inverted ? 'Escala Invertida' : 'Escala Directa'} • Peso: 5%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

            {/* 3. ASIGNACIÓN NORMATIVA DE COMPETENCIAS PARA EL CARGO DESTINO (DTH-GFD-MC-01) */}
            {(() => {
              const compProfile = resolveEmployeeCompetencyProfile(effectiveTargetPos, info.directorate);
              return (
                <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-[#D99C00]" />
                      <h4 className="text-xs font-black uppercase text-zinc-950 font-sans">
                        Competencias Normativas del Cargo Superior Destino: {effectiveTargetPos} (DTH-GFD-MC-01)
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-900">
                        Nivel Requerido: Nivel {compProfile.expectedLevel} ({compProfile.expectedLevelDefinition.name})
                      </span>
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#F1B400] text-black">
                        {compProfile.totalCompetenciesCount} Competencias
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* 1. Cardinales */}
                    <div className="p-3 bg-white rounded-lg border border-zinc-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-900">1. Cardinales (5)</span>
                        <span className="text-[9px] font-mono text-emerald-700 font-bold">100% Personal</span>
                      </div>
                      <ul className="text-[11px] text-zinc-700 space-y-0.5 list-disc list-inside">
                        {(compProfile?.cardinalCompetencies || []).map(c => (
                          <li key={c.id} className="truncate">{c.name}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 2. Liderazgo */}
                    <div className={`p-3 rounded-lg border space-y-1.5 ${
                      compProfile.isBoardEligible
                        ? 'bg-purple-50/50 border-purple-200'
                        : compProfile.isSupervisionEligible
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-zinc-100/60 border-zinc-200 text-zinc-500'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-bold ${
                          compProfile.isBoardEligible
                            ? 'text-purple-900'
                            : compProfile.isSupervisionEligible
                            ? 'text-blue-900'
                            : 'text-zinc-500'
                        }`}>
                          {compProfile.isBoardEligible ? '2. Junta Directiva (3)' : '2. Supervisión (3)'}
                        </span>
                        <span className="text-[9px] font-mono font-bold">
                          {compProfile.isBoardEligible ? (
                            <span className="text-purple-700">✓ Activas (Director)</span>
                          ) : compProfile.isSupervisionEligible ? (
                            <span className="text-blue-700">✓ Activas ({effectiveTargetPos})</span>
                          ) : (
                            <span className="text-zinc-400 flex items-center gap-0.5"><Lock size={9} /> Inactivas</span>
                          )}
                        </span>
                      </div>
                      {compProfile.isBoardEligible ? (
                        <ul className="text-[11px] text-purple-950 space-y-0.5 list-disc list-inside font-medium">
                          {(compProfile?.boardCompetencies || []).map(c => (
                            <li key={c.id} className="truncate">{c.name}</li>
                          ))}
                        </ul>
                      ) : compProfile.isSupervisionEligible ? (
                        <ul className="text-[11px] text-blue-950 space-y-0.5 list-disc list-inside font-medium">
                          {(compProfile?.supervisionCompetencies || []).map(c => (
                            <li key={c.id} className="truncate">{c.name}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[10px] text-zinc-500 italic leading-snug">
                          Solo para Coordinador, Supervisor, Gerente (Supervisión) o Director (Junta Directiva).
                        </p>
                      )}
                    </div>

                    {/* 3. Específicas por Área */}
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-blue-900">3. Específicas por Área (3)</span>
                        <span className="text-[9px] font-mono text-blue-700 font-bold truncate max-w-[120px]">
                          {compProfile?.areaCompetencies?.[0]?.clusterLabel || 'Área'}
                        </span>
                      </div>
                      <ul className="text-[11px] text-blue-950 space-y-0.5 list-disc list-inside font-medium">
                        {(compProfile?.areaCompetencies || []).map(c => (
                          <li key={c.id} className="truncate">{c.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Card Destacada: Finalizar Configuración y Lanzar Evaluación Automáticamente */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#F1B400]/15 to-amber-500/10 border-2 border-[#F1B400] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-[#F1B400] text-black">
                  Configuración Completa
                </span>
                <span className="text-xs font-black uppercase text-amber-950 font-mono">
                  Modalidad Presencial Supervisada
                </span>
              </div>
              <h4 className="text-sm font-black uppercase text-zinc-950">
                Iniciar Evaluación del Postulado: {info.firstName} {info.lastName}
              </h4>
              <p className="text-xs text-zinc-700 leading-relaxed max-w-xl">
                Al hacer clic, el sistema guardará los parámetros del concurso y te dirigirá <strong>automáticamente a la evaluación oficial de promoción</strong> para que el evaluado comience a responder el instrumento.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={handleLaunchPromotionEvaluation}
                className="px-6 py-3.5 bg-[#F1B400] hover:bg-[#d99c00] active:scale-[0.98] text-black font-black font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Iniciar Evaluación de Promoción</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Format Designer and Job Descriptor actions */}
          <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveSubprocess('datos');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-2 border border-zinc-300"
            >
              <span>← Volver a Datos del Colaborador</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowDesigner(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-300 text-zinc-800 hover:text-zinc-950 text-xs font-bold uppercase rounded-lg hover:bg-zinc-50 transition-colors shadow-2xs"
              >
                <Sliders size={14} /> Diseñador y Editor de Formatos
              </button>

              <button
                type="button"
                onClick={handleLaunchPromotionEvaluation}
                className="px-6 py-2.5 bg-zinc-950 hover:bg-[#F1B400] hover:text-black text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <span>Ir a Evaluación de Promoción</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Format Designer Modal */}
      {showDesigner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-zinc-300 shadow-2xl p-6">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowDesigner(false)}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-950 px-3 py-1 border rounded-lg"
              >
                Cerrar Diseñador
              </button>
            </div>
            <EvaluationFormatDesigner
              questions={questions}
              onSaveQuestions={(upd) => {
                onUpdateQuestions(upd);
                setShowDesigner(false);
              }}
              scope={hasSubordinates ? '360' : '180'}
              targetPosition={info.position}
            />
          </div>
        </div>
      )}

      {/* Job Descriptor Gemini AI Modal */}
      <JobDescriptorModal
        isOpen={showDescriptorModal}
        onClose={() => setShowDescriptorModal(false)}
        onApplyQuestions={(upd) => onUpdateQuestions(upd)}
        currentPosition={info.position}
      />
    </div>
  );
}

import React, { useState } from 'react';
import {
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar,
  RadarChart as RechartsRadar, ResponsiveContainer, Legend, Tooltip as RechartsTooltip
} from 'recharts';
import {
  PromotionDossier, EmployeeInfo, PdiGoal, PdiBreach,
  PROMOTION_APPROVAL_THRESHOLDS, resolvePromotionThreshold
} from '../types';
import { resolveOrCreatePromotionDossier } from '../utils/promotionDefaults';
import {
  Award, CheckCircle2, AlertTriangle, ArrowRight, TrendingUp,
  Printer, ShieldCheck, FileText, Check, Compass, Eye,
  Layers, ChevronRight, Wrench, Download, Calendar, User, Building2,
  Sparkles, Briefcase, X
} from 'lucide-react';

interface PromotionResultsViewProps {
  dossier?: PromotionDossier;
  employeeInfo: EmployeeInfo;
  onOpenPhasesManager?: () => void;
  pdiGoals?: PdiGoal[];
  pdiBreaches?: PdiBreach[];
  onUpdateGoals?: (goals: PdiGoal[]) => void;
  onUpdateBreaches?: (breaches: PdiBreach[]) => void;
  onUpdateDossier?: (dossier: PromotionDossier) => void;
}

export function PromotionResultsView({
  dossier: providedDossier,
  employeeInfo,
  onOpenPhasesManager
}: PromotionResultsViewProps) {
  const [selectedSheet, setSelectedSheet] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Resolver expediente completo de promoción
  const dossier = resolveOrCreatePromotionDossier(employeeInfo, providedDossier);
  const { phase1, phase2, phase3, targetPosition, targetDepartment } = dossier;

  // Puntuación base 100 y veredicto normativo
  const totalBase100 = phase3.scoreBase100 ?? Number(((phase3.finalScore / 5) * 100).toFixed(2));
  const threshold = resolvePromotionThreshold(totalBase100);

  // Nombre del colaborador evaluado
  const candidateFullName = `${employeeInfo.firstName} ${employeeInfo.lastName}`.trim() || 'Colaborador Evaluado';
  const candidateCedula = employeeInfo.idNumber || 'V-00.000.000';
  const currentPosition = employeeInfo.position || 'Colaborador';
  const currentDepartment = employeeInfo.department || 'Área Organizacional';
  const promotedPosition = targetPosition || (
    currentPosition === 'Analista' ? 'Coordinador de Área' :
    currentPosition === 'Coordinador' ? 'Gerente Departamental' :
    currentPosition === 'Supervisor' ? 'Gerente Regional' :
    currentPosition === 'Encargado de Tienda' ? 'Supervisor de Zona Retail' :
    currentPosition === 'Asesor Integral' ? 'Encargado de Tienda' :
    'Supervisor Regional de Operaciones'
  );

  // Datos para Radar de Brechas (6 ejes del Modelo Oficial DTH-GFD-MC-01)
  const gapMapData = [
    {
      subject: 'Liderar con el Ejemplo',
      competency: 'Liderar con el Ejemplo (Supervisión)',
      requiredLevel: 4.50,
      obtainedLevel: 4.60,
      gap: 0.10,
      type: 'Conductual',
      status: 'Superada'
    },
    {
      subject: 'Auditoría de Procesos',
      competency: 'Auditoría de Procesos (Operaciones Centrales)',
      requiredLevel: 4.75,
      obtainedLevel: 4.85,
      gap: 0.10,
      type: 'Técnica',
      status: 'Superada'
    },
    {
      subject: 'Orientación al Logro',
      competency: 'Orientación al Logro (Supervisión)',
      requiredLevel: 4.50,
      obtainedLevel: 4.70,
      gap: 0.20,
      type: 'Funcional',
      status: 'Superada'
    },
    {
      subject: 'Orientación al Cliente',
      competency: 'Orientación al Cliente (Cardinal)',
      requiredLevel: 4.25,
      obtainedLevel: 4.60,
      gap: 0.35,
      type: 'Técnica',
      status: 'Superada'
    },
    {
      subject: 'Capacidad de Análisis',
      competency: 'Capacidad de Análisis (Cardinal)',
      requiredLevel: 4.50,
      obtainedLevel: 4.35,
      gap: -0.15,
      type: 'Conductual',
      status: 'Brecha Menor'
    },
    {
      subject: 'Desarrollo de Equipos',
      competency: 'Desarrollo de Equipos (Supervisión)',
      requiredLevel: 4.50,
      obtainedLevel: 4.20,
      gap: -0.30,
      type: 'Liderazgo',
      status: 'Prioritaria PDI'
    }
  ];

  const radarChartData = gapMapData.map(item => ({
    subject: item.subject,
    fullCompetency: item.competency,
    'Requerido': item.requiredLevel,
    'Obtenido': item.obtainedLevel,
    gap: item.gap,
    type: item.type,
    status: item.status
  }));

  const superadasCount = gapMapData.filter(g => g.gap >= 0).length;
  const brechasCount = gapMapData.filter(g => g.gap < 0).length;
  const netAverageGap = Number((gapMapData.reduce((acc, curr) => acc + curr.gap, 0) / gapMapData.length).toFixed(2));

  // Matriz Cuantitativa Ponderada con base en los reactivos del Descriptor y Pruebas Oficiales
  const quantitativeMatrix = [
    {
      modulo: '1. Conocimiento Técnico (Reactivos del Descriptor)',
      bruto: '4.75 / 5.0 pts',
      escalaMax: '5.00 pts',
      rendimiento: '95.00%',
      peso: '30.0%',
      puntos: '28.50'
    },
    {
      modulo: '2. Funciones Clave / Situacional (Reactivos del Descriptor)',
      bruto: '4.80 / 5.0 pts',
      escalaMax: '5.00 pts',
      rendimiento: '96.00%',
      peso: '40.0%',
      puntos: '38.40'
    },
    {
      modulo: '3. Fit Psicométrico & Madurez (Medición de Predisposición Conductual y Adecuación al nuevo Cargo)',
      bruto: '4.62 / 5.0 pts',
      escalaMax: '5.00 pts',
      rendimiento: '92.40%',
      peso: '15.0%',
      puntos: '13.86'
    },
    {
      modulo: '4. Evaluación Estratégica ante Jurado (Defensa Técnica)',
      bruto: '18.5 / 20.0 pts',
      escalaMax: '20.0 pts',
      rendimiento: '92.50%',
      peso: '15.0%',
      puntos: '13.88'
    }
  ];

  // Componente de Logotipo Oficial Canguro
  const CanguroLogoHeader = () => (
    <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3 mb-4">
      <div className="flex items-center gap-3">
        {/* Isotipo CANGURO */}
        <div className="w-12 h-12 rounded-full bg-zinc-950 border-2 border-[#F1B400] flex items-center justify-center p-1.5 shadow-sm">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-[#F1B400]">
            <path d="M78 28 C74 25, 68 24, 64 26 C62 27, 60 29, 61 31 C63 35, 69 36, 73 38 C75 39, 75 41, 72 43 C66 48, 58 52, 54 58 C48 66, 46 76, 52 84 C54 87, 51 89, 47 88 C38 85, 33 76, 32 68 C31 59, 36 50, 42 43 C46 38, 52 33, 56 27 C60 21, 63 15, 60 9 C59 7, 62 6, 64 7 C70 11, 76 18, 78 28 Z" />
            <circle cx="68" cy="22" r="3" />
          </svg>
        </div>
        <div>
          <span className="text-[11px] font-black tracking-widest text-zinc-950 uppercase block font-sans">
            GESTIÓN DEL TALENTO HUMANO
          </span>
          <span className="text-[10px] font-bold text-zinc-600 uppercase block tracking-wider font-mono">
            FORMATO DE EVALUACIÓN DE PROMOCIÓN
          </span>
        </div>
      </div>

      {/* Cuadro Oficial de Código, Versión y Fecha */}
      <div className="border border-zinc-950 text-[9px] font-mono leading-tight">
        <div className="px-2 py-0.5 border-b border-zinc-950 flex justify-between gap-3 bg-zinc-100">
          <span className="font-bold text-zinc-700">CÓDIGO:</span>
          <span className="font-black text-zinc-950">DTH-GFD-PROM-01</span>
        </div>
        <div className="px-2 py-0.5 border-b border-zinc-950 flex justify-between gap-3">
          <span className="font-bold text-zinc-700">VERSIÓN:</span>
          <span className="font-black text-zinc-950">1.0</span>
        </div>
        <div className="px-2 py-0.5 flex justify-between gap-3 bg-zinc-100">
          <span className="font-bold text-zinc-700">FECHA:</span>
          <span className="font-black text-zinc-950">OCTUBRE 2026</span>
        </div>
      </div>
    </div>
  );

  // Mini encabezado de continuación para páginas 2, 3, 4 y 5
  const SheetMiniHeader = ({ pageNumber }: { pageNumber: number }) => (
    <div className="flex items-center justify-between border-b border-zinc-300 pb-2 mb-4 text-[9px] font-mono text-zinc-500">
      <div className="flex items-center gap-2">
        <span className="font-bold text-zinc-900 uppercase">DISTRICUEROS EL CANGURO, C.A.</span>
        <span>•</span>
        <span>GESTIÓN DEL TALENTO HUMANO</span>
        <span>•</span>
        <span>DTH-GFD-PROM-01</span>
      </div>
      <div className="font-black text-zinc-950 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
        PÁGINA {pageNumber} DE 5
      </div>
    </div>
  );

  // Pie de página oficial para cada hoja
  const SheetFooter = ({ pageNumber }: { pageNumber: number }) => (
    <div className="pt-3 border-t border-zinc-300 mt-auto flex items-center justify-between text-[9px] font-mono text-zinc-500">
      <div className="flex items-center gap-1.5">
        <ShieldCheck size={11} className="text-zinc-700" />
        <span>Documento Oficial Certificado • Dirección de Talento Humano</span>
      </div>
      <div>
        <span>Página <strong>{pageNumber}</strong> de <strong>5</strong></span>
      </div>
    </div>
  );

  const sheetsSummary = [
    {
      num: 1,
      title: 'Notificación y Dictamen',
      description: 'Datos generales del postulante, cargos y resolución de idoneidad.',
      badge: 'Resolución: ' + (phase3?.resolutionVerdict || 'Idóneo')
    },
    {
      num: 2,
      title: 'Matriz y Radar de Brechas',
      description: 'Ponderación de módulos, radar de 6 ejes Canguro y brechas por competencia.',
      badge: 'Rendimiento: ' + totalBase100 + '%'
    },
    {
      num: 3,
      title: 'Diagnóstico Psicométrico',
      description: 'Interpretación de predisposición conductual, adecuación al nuevo cargo y agilidad.',
      badge: 'Ajuste: ' + (phase1?.bigFiveResults?.suitabilityScore ? `${phase1.bigFiveResults.suitabilityScore.toFixed(2)}/5` : '4.68/5')
    },
    {
      num: 4,
      title: 'Plan de Desarrollo (PDI)',
      description: 'Brechas críticas y objetivos de desarrollo para los primeros 90 días.',
      badge: 'Enfoque: 70-20-10'
    },
    {
      num: 5,
      title: 'Firmas y Disposiciones',
      description: 'Compromisos de cargo y las 6 firmas oficiales de conformidad.',
      badge: '6 Firmas Oficiales'
    }
  ];

  const renderAllSheets = (isPrinting: boolean = false) => (
    <>
      {/* ========================================================================= */}
      {/* HOJA 1: NOTIFICACIÓN, DATOS GENERALES Y RESOLUCIÓN / DICTAMEN OFICIAL     */}
      {/* ========================================================================= */}
      {(selectedSheet === 'all' || selectedSheet === 1 || isPrinting) && (
        <div className="pdf-sheet bg-white text-zinc-950 p-8 sm:p-11 rounded-2xl shadow-xl border border-zinc-200 max-w-4xl mx-auto min-h-[1050px] flex flex-col justify-between print:min-h-0 print:p-0 print:mb-0 print:border-none print:shadow-none">
          <div>
              {/* ENCABEZADO INSTITUCIONAL COMPLETO */}
              <CanguroLogoHeader />

              {/* TÍTULO PRINCIPAL */}
              <div className="text-center my-5 space-y-1">
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-950">
                  NOTIFICACIÓN OFICIAL E INFORME DE EVALUACIÓN
                </h1>
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900">
                  PERÍODO DE PRUEBA PARA PROMOCIÓN INTERNA
                </h2>
                <p className="text-xs italic text-zinc-700 font-serif">
                  Dictamen Final, Integración de Resultados y Plan de Desarrollo Individual (PDI)
                </p>
              </div>

              {/* SECCIÓN I: DATOS GENERALES DEL EXPEDIENTE Y PROCESO */}
              <div className="space-y-2 mb-6">
                <div className="border-t-2 border-[#F1B400] pt-1">
                  <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider">
                    I. DATOS GENERALES DEL EXPEDIENTE Y PROCESO
                  </h3>
                </div>

                <div className="border border-zinc-900 text-xs overflow-hidden">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-zinc-900">
                        <td className="w-1/4 p-2 bg-zinc-950 text-white font-bold font-mono text-[11px] border-r border-zinc-900">
                          Nombre del Colaborador:
                        </td>
                        <td className="w-1/4 p-2 font-bold text-zinc-950 border-r border-zinc-900">
                          {candidateFullName}
                        </td>
                        <td className="w-1/4 p-2 bg-zinc-950 text-white font-bold font-mono text-[11px] border-r border-zinc-900">
                          Cédula:
                        </td>
                        <td className="w-1/4 p-2 font-mono font-bold text-zinc-950">
                          {candidateCedula}
                        </td>
                      </tr>

                      <tr className="border-b border-zinc-900">
                        <td className="p-2 bg-zinc-950 text-white font-bold font-mono text-[11px] border-r border-zinc-900">
                          Cargo Actual:
                        </td>
                        <td className="p-2 text-zinc-800 border-r border-zinc-900">
                          {currentPosition}
                        </td>
                        <td className="p-2 bg-zinc-950 text-white font-bold font-mono text-[11px] border-r border-zinc-900">
                          Departamento / Área:
                        </td>
                        <td className="p-2 text-zinc-800">
                          {currentDepartment}
                        </td>
                      </tr>

                      <tr className="border-b border-zinc-900">
                        <td className="p-2 bg-zinc-950 text-white font-bold font-mono text-[11px] border-r border-zinc-900">
                          Cargo al que Postula:
                        </td>
                        <td className="p-2 font-black text-zinc-950 border-r border-zinc-900">
                          {promotedPosition}
                        </td>
                        <td className="p-2 bg-zinc-950 text-white font-bold font-mono text-[11px] border-r border-zinc-900">
                          Inicio de Evaluación:
                        </td>
                        <td className="p-2 font-mono text-zinc-800">
                          01 de septiembre de 2026
                        </td>
                      </tr>

                      <tr className="border-b border-zinc-900">
                        <td className="p-2 bg-zinc-950 text-white font-bold font-mono text-[11px] border-r border-zinc-900">
                          Período de Prueba:
                        </td>
                        <td className="p-2 text-zinc-800 border-r border-zinc-900">
                          30 días continuos
                        </td>
                        <td className="p-2 bg-zinc-950 text-white font-bold font-mono text-[11px] border-r border-zinc-900">
                          Evaluador / Tutor:
                        </td>
                        <td className="p-2 text-zinc-800">
                          Gerencia de Formación y Desarrollo
                        </td>
                      </tr>

                      <tr>
                        <td className="p-2 bg-zinc-950 text-white font-bold font-mono text-[11px] border-r border-zinc-900">
                          Tipo de Proceso:
                        </td>
                        <td className="p-2 text-zinc-800 border-r border-zinc-900">
                          Período de Prueba para Promoción
                        </td>
                        <td className="p-2 bg-zinc-950 text-white font-bold font-mono text-[11px] border-r border-zinc-900">
                          Estatus del Proceso:
                        </td>
                        <td className="p-2 font-bold text-emerald-800 font-mono">
                          Evaluación Finalizada
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* EVALUACIÓN DE IDONEIDAD CON EL CARGO A PARTIR DEL DESCRIPTOR */}
              <div className="space-y-2 mb-5">
                <div className="border-t-2 border-[#F1B400] pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#D99C00]" />
                    <span>EVALUACIÓN DE IDONEIDAD CON EL CARGO (DESCRIPTOR DTH-GFD-PROM-01)</span>
                  </h3>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-900 font-bold">
                      Postula: {promotedPosition}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-black ${
                      totalBase100 >= 85 
                        ? 'bg-emerald-600 text-white' 
                        : totalBase100 >= 70 
                        ? 'bg-[#F1B400] text-black' 
                        : 'bg-red-600 text-white'
                    }`}>
                      {totalBase100 >= 85 ? '✓ DICTAMEN: IDÓNEO' : totalBase100 >= 70 ? '⚠ IDÓNEO CONDICIONADO' : '✕ NO IDÓNEO'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {/* Conocimiento Técnico */}
                  <div className="p-2.5 bg-zinc-50 border border-zinc-900 rounded-lg space-y-1">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-1">
                      <span className="font-bold text-[11px] text-zinc-950 flex items-center gap-1">
                        <Wrench size={12} className="text-amber-800" />
                        1. Conocimiento Técnico (Descriptor)
                      </span>
                      <span className="font-mono font-black text-emerald-800 text-[11px]">
                        4.75 / 5.00 (95.0%)
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-700 leading-snug">
                      <strong>Reactivos Evaluados:</strong> Manejo de sistemas POS y cajas fiscales (5.0/5), auditoría de inventarios ABC (4.5/5), conocimiento técnico de calzado (4.75/5), control interno y prevención de pérdidas (4.75/5).
                    </p>
                    <p className="text-[10px] text-emerald-900 font-medium italic">
                      Dictamen Gemini 3.8 Flash: Solvencia técnica comprobada con 95% de adecuación técnica al perfil.
                    </p>
                  </div>

                  {/* Funciones Clave */}
                  <div className="p-2.5 bg-zinc-50 border border-zinc-900 rounded-lg space-y-1">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-1">
                      <span className="font-bold text-[11px] text-zinc-950 flex items-center gap-1">
                        <Briefcase size={12} className="text-amber-800" />
                        2. Funciones Clave (Descriptor)
                      </span>
                      <span className="font-mono font-black text-emerald-800 text-[11px]">
                        4.80 / 5.00 (96.0%)
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-700 leading-snug">
                      <strong>Reactivos Evaluados:</strong> Supervisión y metas de venta en piso (4.8/5), arqueos y retenciones fiscales (5.0/5), recepción técnica y cotejo de guías (4.6/5), resolución de objeciones y garantías (4.8/5).
                    </p>
                    <p className="text-[10px] text-emerald-900 font-medium italic">
                      Dictamen Gemini 3.8 Flash: Resolución sobresaliente ante los incidentes críticos del nuevo rol.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECCIÓN II: RESOLUCIÓN Y DICTAMEN DEL PERÍODO DE PRUEBA */}
              <div className="space-y-3">
                <div className="border-t-2 border-[#F1B400] pt-1">
                  <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider">
                    II. RESOLUCIÓN Y DICTAMEN DEL PERÍODO DE PRUEBA
                  </h3>
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed text-justify">
                  Tras haber concluido el ciclo formal de evaluación cuantitativa y cualitativa para el proceso de promoción interna, el Comité de Evaluación y la Gerencia de Formación y Desarrollo emiten la siguiente resolución formal:
                </p>

                {/* 3 CASILLAS DE VEREDICTO FORMALES */}
                <div className="grid grid-cols-3 gap-3 my-3">
                  <div className={`p-3 rounded-lg border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                    totalBase100 >= 90
                      ? 'border-[#F1B400] bg-[#FFF8E1] text-zinc-950 ring-2 ring-[#F1B400]'
                      : 'border-zinc-300 bg-zinc-50 text-zinc-400'
                  }`}>
                    <span className="font-mono font-black text-sm">
                      {totalBase100 >= 90 ? '[X]' : '[ ]'} APROBADO
                    </span>
                    <span className="text-[10px] font-bold leading-tight">
                      (Superación Satisfactoria, realización de PDI)
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                    totalBase100 >= 80 && totalBase100 < 90
                      ? 'border-[#F1B400] bg-[#FFF8E1] text-zinc-950 ring-2 ring-[#F1B400]'
                      : 'border-zinc-300 bg-zinc-50 text-zinc-400'
                  }`}>
                    <span className="font-mono font-black text-sm text-zinc-950">
                      {totalBase100 >= 80 && totalBase100 < 90 ? '[X]' : '[ ]'} APROBADO CONDICIONADO
                    </span>
                    <span className="text-[10px] font-bold text-zinc-800 leading-tight">
                      (Sujeto a PDI Obligatorio)
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                    totalBase100 < 80
                      ? 'border-red-600 bg-red-50 text-red-950 ring-2 ring-red-500'
                      : 'border-zinc-300 bg-zinc-50 text-zinc-400'
                  }`}>
                    <span className="font-mono font-black text-sm">
                      {totalBase100 < 80 ? '[X]' : '[ ]'} NO APROBADO
                    </span>
                    <span className="text-[10px] font-bold leading-tight">
                      (No Superación del Período)
                    </span>
                  </div>
                </div>

                {/* BLOQUE AMARILLO DE DICTAMEN OFICIAL DE PROMOCIÓN */}
                <div className="p-4 bg-[#F1B400] text-zinc-950 rounded-xl space-y-2 border border-[#d99c00] shadow-sm">
                  <div className="font-black text-xs uppercase tracking-wide">
                    DICTAMEN OFICIAL DE PROMOCIÓN: APROBADO CON PLAN DE DESARROLLO (PDI)
                  </div>
                  <p className="text-xs text-zinc-950 leading-relaxed text-justify">
                    La colaboradora <strong>{candidateFullName}</strong> ha alcanzado una calificación Global integrada de <strong>{totalBase100} / 100 puntos</strong> (Nivel Sobresaliente). Se autoriza formalmente su <strong>PROMOCIÓN INMEDIATA</strong> al cargo de <strong>{promotedPosition}</strong>.
                  </p>
                  <p className="text-xs text-zinc-900 leading-relaxed text-justify">
                    En vista de su destacado perfil ético (100% de cumplimiento en factores normativos y de integridad), su sólida capacidad técnica en la presentación final (92.50%) y sus óptimas competencias de aprendizaje, adaptabilidad y trabajo en equipo, se establece un Plan de Desarrollo Individual (PDI) enfocado en preparar su transición hacia el liderazgo formal de equipos regionales y potenciar la orientación al cliente interno mediante un enfoque de auditoría consultiva.
                  </p>
                </div>
              </div>
            </div>

            <SheetFooter pageNumber={1} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* HOJA 2: MATRIZ CUANTITATIVA Y MAPA DE RADAR DE BRECHAS                   */}
        {/* ========================================================================= */}
        {(selectedSheet === 'all' || selectedSheet === 2) && (
          <div className="pdf-sheet bg-white text-zinc-950 p-8 sm:p-11 rounded-2xl shadow-xl border border-zinc-200 max-w-4xl mx-auto min-h-[1050px] flex flex-col justify-between print:min-h-0 print:p-0 print:mb-0 print:border-none print:shadow-none">
            <div>
              <SheetMiniHeader pageNumber={2} />

              {/* SECCIÓN III: MATRIZ CUANTITATIVA Y RESUMEN INTEGRADO DE RESULTADOS */}
              <div className="space-y-3 mb-6">
                <div className="border-t-2 border-[#F1B400] pt-1">
                  <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider">
                    III. MATRIZ CUANTITATIVA Y RESUMEN INTEGRADO DE RESULTADOS
                  </h3>
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed text-justify">
                  La evaluación se estructuró bajo un modelo tridimensional ponderado que garantiza la objetividad e integralidad técnica de la candidata:
                </p>

                {/* TABLA PONDERADA OFICIAL */}
                <div className="border border-zinc-900 text-xs overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-950 text-white font-mono text-[10px] uppercase">
                      <tr>
                        <th className="p-2 border-r border-zinc-800">Módulo Evaluativo</th>
                        <th className="p-2 border-r border-zinc-800 text-center">Puntaje Bruto</th>
                        <th className="p-2 border-r border-zinc-800 text-center">Escala Máx.</th>
                        <th className="p-2 border-r border-zinc-800 text-center">Rendimiento</th>
                        <th className="p-2 border-r border-zinc-800 text-center">Peso Aportado</th>
                        <th className="p-2 text-center">Puntos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-300 text-zinc-900 font-mono text-[11px]">
                      {quantitativeMatrix.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50">
                          <td className="p-2 font-sans font-bold text-zinc-950 border-r border-zinc-300">
                            {row.modulo}
                          </td>
                          <td className="p-2 text-center border-r border-zinc-300">
                            {row.bruto}
                          </td>
                          <td className="p-2 text-center border-r border-zinc-300">
                            {row.escalaMax}
                          </td>
                          <td className="p-2 text-center font-bold text-zinc-900 border-r border-zinc-300">
                            {row.rendimiento}
                          </td>
                          <td className="p-2 text-center border-r border-zinc-300">
                            {row.peso}
                          </td>
                          <td className="p-2 text-center font-black text-zinc-950">
                            {row.puntos}
                          </td>
                        </tr>
                      ))}

                      {/* FILA TOTAL RESULTADO GLOBAL */}
                      <tr className="bg-[#F1B400] text-zinc-950 font-black border-t-2 border-zinc-950">
                        <td className="p-2.5 font-sans uppercase">
                          RESULTADO GLOBAL INTEGRADO
                        </td>
                        <td className="p-2.5 text-center">—</td>
                        <td className="p-2.5 text-center">—</td>
                        <td className="p-2.5 text-center font-black">
                          87.58% (Prom)
                        </td>
                        <td className="p-2.5 text-center font-black">
                          100.0%
                        </td>
                        <td className="p-2.5 text-center font-black text-sm">
                          {totalBase100}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECCIÓN IV: MAPA DE RADAR PARA LA IDENTIFICACIÓN DE BRECHAS */}
              <div className="space-y-3">
                <div className="border-t-2 border-[#F1B400] pt-1 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider flex items-center gap-1.5">
                    <Compass size={14} className="text-[#D99C00]" />
                    <span>MAPA DE RADAR PARA LA IDENTIFICACIÓN DE BRECHAS (REQUERIDO VS OBTENIDO)</span>
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                    Escala: 1.00 a 5.00 pts
                  </span>
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed text-justify">
                  Contraste polar directo entre el perfil requerido para <strong>{promotedPosition}</strong> frente al dominio demostrado por la colaboradora:
                </p>

                {/* GRÁFICO POLAR Y DESGLOSE LADO A LADO */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                  
                  {/* RADAR CHART */}
                  <div className="md:col-span-7 flex flex-col items-center justify-center">
                    <div className="w-full h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsRadar cx="50%" cy="50%" outerRadius="72%" data={radarChartData}>
                          <PolarGrid stroke="#D4D4D8" strokeDasharray="3 3" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: '#18181B', fontSize: 9, fontWeight: 700 }}
                          />
                          <PolarRadiusAxis
                            angle={30}
                            domain={[0, 5]}
                            tick={{ fill: '#71717A', fontSize: 8 }}
                          />

                          <Radar
                            name="Nivel Requerido"
                            dataKey="Requerido"
                            stroke="#18181B"
                            strokeWidth={1.8}
                            strokeDasharray="4 4"
                            fill="#71717A"
                            fillOpacity={0.12}
                          />

                          <Radar
                            name="Nivel Obtenido"
                            dataKey="Obtenido"
                            stroke="#D99C00"
                            strokeWidth={2.4}
                            fill="#F1B400"
                            fillOpacity={0.45}
                          />

                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: '#09090B',
                              borderColor: '#F1B400',
                              borderRadius: '8px',
                              fontSize: '10px',
                              color: '#FFFFFF'
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                        </RechartsRadar>
                      </ResponsiveContainer>
                    </div>

                    <div className="text-[9px] font-mono text-zinc-500 flex items-center justify-between w-full px-2 pt-1 border-t border-zinc-200">
                      <span>Línea gris punteada: Perfil Requerido</span>
                      <span className="text-[#D99C00] font-bold">Polígono dorado: Dominio Colaborador</span>
                    </div>
                  </div>

                  {/* DESGLOSE RESUMEN */}
                  <div className="md:col-span-5 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-zinc-900 tracking-wider block font-mono">
                      Estado de Brechas Competenciales
                    </span>

                    <div className="space-y-1.5 text-[10px]">
                      {gapMapData.map((item, idx) => {
                        const isPos = item.gap >= 0;
                        return (
                          <div
                            key={idx}
                            className={`p-1.5 rounded-lg border flex items-center justify-between ${
                              isPos
                                ? 'bg-white border-zinc-200'
                                : 'bg-amber-50 border-amber-300'
                            }`}
                          >
                            <div className="min-w-0 pr-1">
                              <span className="font-bold text-zinc-950 block truncate text-[10px]">
                                {item.subject}
                              </span>
                              <span className="text-zinc-500 font-mono text-[9px]">
                                Req: {item.requiredLevel.toFixed(2)} | Obt: {item.obtainedLevel.toFixed(2)}
                              </span>
                            </div>

                            <span
                              className={`px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                                isPos
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-amber-200 text-amber-950'
                              }`}
                            >
                              {isPos ? `+${item.gap.toFixed(2)}` : item.gap.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[9.5px] text-amber-950 leading-tight">
                      <strong>Síntesis:</strong> 4 de 6 competencias en superación óptima. Se identifican 2 brechas técnicas que son derivadas al PDI obligatorio.
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <SheetFooter pageNumber={2} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* HOJA 3: INTERPRETACIÓN ORGANIZACIONAL Y DIAGNÓSTICO DETALLADO            */}
        {/* ========================================================================= */}
        {(selectedSheet === 'all' || selectedSheet === 3) && (
          <div className="pdf-sheet bg-white text-zinc-950 p-8 sm:p-11 rounded-2xl shadow-xl border border-zinc-200 max-w-4xl mx-auto min-h-[1050px] flex flex-col justify-between print:min-h-0 print:p-0 print:mb-0 print:border-none print:shadow-none">
            <div>
              <SheetMiniHeader pageNumber={3} />

              <div className="space-y-4">
                <div className="border-t-2 border-[#F1B400] pt-1">
                  <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider">
                    IV. INTERPRETACIÓN ORGANIZACIONAL Y DIAGNÓSTICO DETALLADO
                  </h3>
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed text-justify">
                  A continuación se presenta el desglose cualitativo e interpretación institucional de cada una de las pruebas aplicadas durante el proceso de selección y período de prueba:
                </p>

                {/* BLOQUE A: COMPETENCIAS OPERATIVAS Y CONDUCTUALES */}
                <div className="space-y-2">
                  <div className="font-bold text-xs text-zinc-950 border-b border-zinc-200 pb-1">
                    A. Módulo de Competencias Operativas y Conductuales (74.0% Cumplimiento / 29.60 pts)
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-800 leading-relaxed text-justify list-disc pl-5">
                    <li>
                      <strong>Aprendizaje e Innovación (8 / 10 — Nivel Óptimo):</strong> Muestra una sobresaliente capacidad para asimilar rápidamente nuevos marcos normativos, herramientas digitales y proponer mejoras en la metodología de fiscalización de procesos.
                    </li>
                    <li>
                      <strong>Adaptabilidad y Flexibilidad (8 / 10 — Nivel Óptimo):</strong> Demuestra alta versatilidad para ajustarse a dinámicas cambiantes, variaciones en los itinerarios de auditoría regional y contingencias operativas sin perder el rigor técnico.
                    </li>
                    <li>
                      <strong>Trabajo en Equipo (8 / 10 — Nivel Óptimo):</strong> Evidencia una excelente disposición para colaborar con diversas áreas, promoviendo la sinergia y un clima de trabajo participativo y respetuoso.
                    </li>
                    <li>
                      <strong>Capacidad de Análisis (7 / 10 — Nivel Deseable):</strong> Posee adecuada solvencia para desglosar información financiera y operativa, identificar patrones atípicos y diagnosticar causas subyacentes con criterio lógico.
                    </li>
                    <li>
                      <strong>Orientación al Cliente (6 / 10 — Nivel Deseable):</strong> Mantiene disposición hacia el cumplimiento de estándares institucionales, presentando un área de oportunidad para evolucionar de un rol puramente fiscalizador a un rol de asesoría consultiva hacia el cliente interno.
                    </li>
                  </ul>
                </div>

                {/* BLOQUE B: TEST BIG 5 (INVENTARIO PSICOMÉTRICO) */}
                <div className="space-y-2 pt-2">
                  <div className="font-bold text-xs text-zinc-950 border-b border-zinc-200 pb-1 flex items-center justify-between">
                    <span>B. Predisposición Conductual y Adecuación al nuevo Cargo</span>
                    <span className="font-mono text-[10px] text-emerald-800 font-black">
                      Ajuste Psicométrico: {phase1?.bigFiveResults?.suitabilityScore ? `${phase1.bigFiveResults.suitabilityScore.toFixed(2)} / 5.00 pts` : '4.68 / 5.00 pts'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                      <strong className="text-zinc-950 block">1. Apertura a la Experiencia ({phase1?.bigFiveResults?.normalized?.openness || 86}%):</strong>
                      <span className="text-zinc-600">Curiosidad intelectual, creatividad, adaptabilidad ante nuevos métodos e innovación.</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                      <strong className="text-zinc-950 block">2. Responsabilidad y Disciplina ({phase1?.bigFiveResults?.normalized?.conscientiousness || 94}%):</strong>
                      <span className="text-zinc-600">Orientación al logro, minuciosidad, orden operativo y cumplimiento sin supervisión.</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                      <strong className="text-zinc-950 block">3. Extraversión y Energía Social ({phase1?.bigFiveResults?.normalized?.extraversion || 88}%):</strong>
                      <span className="text-zinc-600">Dinamismo comunicativo, entusiasmo, seguridad en público y asertividad relacional.</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-50 border border-zinc-200">
                      <strong className="text-zinc-950 block">4. Amabilidad y Cooperación ({phase1?.bigFiveResults?.normalized?.agreeableness || 91}%):</strong>
                      <span className="text-zinc-600">Empatía genuina, espíritu colaborativo, mediación de conflictos y apoyo mutuo.</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-50 border border-zinc-200 sm:col-span-2">
                      <strong className="text-zinc-950 block">5. Estabilidad Emocional ({phase1?.bigFiveResults?.normalized?.emotional_stability || 87}%):</strong>
                      <span className="text-zinc-600">Templanza bajo presión, serenidad, autocontrol ante contingencias y resiliencia.</span>
                    </div>
                  </div>
                </div>

                {/* BLOQUE C: ÉTICO-CONDUCTUAL Y FIT CULTURAL (TEST DE ZAVIC) */}
                <div className="space-y-2 pt-2">
                  <div className="font-bold text-xs text-zinc-950 border-b border-zinc-200 pb-1">
                    C. Módulo Ético-Conductual y Fit Cultural (Test de Zavic - 4 Dimensiones Clave)
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-800 leading-relaxed text-justify list-disc pl-5">
                    <li>
                      <strong>Legalidad (Puntuación Alta - 36 pts / 100% Cumplimiento):</strong> Motor Principal de conducta. Sus decisiones laborales están estrictamente guiadas por la adhesión a las leyes, reglamentos internos y procedimientos corporativos, atributo imprescindible para el rol de supervisión en control interno.
                    </li>
                    <li>
                      <strong>Moral (Puntuación Alta - 32 pts / 85% Cumplimiento):</strong> Constituye una sólida guía axiológica que garantiza decisiones laborales éticas, fundamentadas en el deber ser y la rectitud profesional.
                    </li>
                    <li>
                      <strong>Indiferencia (Puntuación Baja - 19 pts / 100% Cumplimiento - Ausencia de Riesgo):</strong> Demuestra ausencia de apatía; refleja alto compromiso institucional, sentido de pertenencia y automotivación hacia las metas de la organización.
                    </li>
                    <li>
                      <strong>Corrupción (Puntuación Baja - 13 pts / 100% Cumplimiento - Ausencia de Riesgo):</strong> Nivel de riesgo ético nulo, garantizando transparencia, objetividad y honestidad irrestricta en la revisión de recursos e inventarios.
                    </li>
                  </ul>
                </div>

                {/* BLOQUE C: EVALUACIÓN ESTRATÉGICA (PRESENTACIÓN ANTE JURADO) */}
                <div className="space-y-2 pt-2">
                  <div className="font-bold text-xs text-zinc-950 border-b border-zinc-200 pb-1">
                    C. Módulo de Evaluación Estratégica (Presentación Final ante Jurado - 75.0% / 15.0 pts)
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-800 leading-relaxed text-justify list-disc pl-5">
                    <li>
                      <strong>Fortalezas Demostradas (37.0 / 40.0 pts):</strong> Desempeño excepcional en la defensa del caso de negocio. Destacó por la profundidad en la identificación de causa raíz, objetividad del diagnóstico, alineación estratégica con la Dirección Comercial y visión de valor agregado.
                    </li>
                    <li>
                      <strong>Área de Consolidación:</strong> Reforzar la medición cuantitativa del retorno de inversión y el ahorro generado por la implementación de las recomendaciones de auditoría.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <SheetFooter pageNumber={3} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* HOJA 4: IDENTIFICACIÓN DE BRECHAS Y COMPETENCIAS PRIORITARIAS (PDI)      */}
        {/* ========================================================================= */}
        {(selectedSheet === 'all' || selectedSheet === 4) && (
          <div className="pdf-sheet bg-white text-zinc-950 p-8 sm:p-11 rounded-2xl shadow-xl border border-zinc-200 max-w-4xl mx-auto min-h-[1050px] flex flex-col justify-between print:min-h-0 print:p-0 print:mb-0 print:border-none print:shadow-none">
            <div>
              <SheetMiniHeader pageNumber={4} />

              <div className="space-y-4">
                <div className="border-t-2 border-[#F1B400] pt-1">
                  <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider">
                    V. IDENTIFICACIÓN DE BRECHAS Y COMPETENCIAS PRIORITARIAS A DESARROLLAR
                  </h3>
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed text-justify">
                  Para garantizar el éxito sostenible en el nuevo rol de <strong>{promotedPosition}</strong>, se estructura el siguiente Plan de Desarrollo Individual (PDI) orientado a consolidar habilidades de liderazgo directivo y asesoría estratégica:
                </p>

                {/* TARJETA PDI 1 */}
                <div className="border border-zinc-900 rounded-lg overflow-hidden text-xs">
                  <div className="bg-zinc-950 text-[#F1B400] font-black uppercase p-2 text-xs font-mono">
                    1. ORIENTACIÓN AL CLIENTE (COMPETENCIA CARDINAL - MÁXIMA PRIORIDAD)
                  </div>
                  <div className="divide-y divide-zinc-200 bg-white">
                    <div className="grid grid-cols-4 p-2 gap-2">
                      <span className="font-bold text-zinc-700 font-mono text-[11px]">Estatus de Evaluación:</span>
                      <span className="col-span-3 text-zinc-900 font-mono">
                        Nivel Requerido: Nivel A (Superior - 5.00 pts) | Nivel Evaluado: Nivel B (Alto - 3.75 pts) | <strong>PRIORIDAD ALTA</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-4 p-2 gap-2 bg-zinc-50/50">
                      <span className="font-bold text-zinc-700 font-mono text-[11px]">Diagnóstico de la Brecha:</span>
                      <span className="col-span-3 text-zinc-900 text-justify">
                        {candidateFullName} obtuvo Nivel B (Alto) en Orientación al Cliente. En el rol de {promotedPosition}, se requiere ascender a Nivel A (Nivel Superior) para trascender la atención reactiva e instaurar una cultura de servicio preventivo y consultivo que acompañe activamente a las áreas auditadas y equipos de tienda.
                      </span>
                    </div>

                    <div className="grid grid-cols-4 p-2 gap-2">
                      <span className="font-bold text-zinc-700 font-mono text-[11px]">Conductas Esperadas:</span>
                      <span className="col-span-3 text-zinc-900 space-y-1">
                        <span className="block">• Ejerce como mentor y referente institucional en atención y orientación a los requerimientos de las demás áreas.</span>
                        <span className="block">• Diseña soluciones preventivas ante necesidades no evidentes del cliente interno y externo, generando valor compartido.</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-4 p-2 gap-2 bg-amber-50/50">
                      <span className="font-bold text-amber-950 font-mono text-[11px]">Plan de Acción Específico:</span>
                      <span className="col-span-3 text-zinc-950 font-medium">
                        Programa de Comunicación Asertiva y Negociación Consultiva de Hallazgos + Role-playing sobre gestión de conversaciones difíciles.
                      </span>
                    </div>
                  </div>
                </div>

                {/* TARJETA PDI 2 */}
                <div className="border border-zinc-900 rounded-lg overflow-hidden text-xs">
                  <div className="bg-zinc-950 text-[#F1B400] font-black uppercase p-2 text-xs font-mono">
                    2. DESARROLLO DE EQUIPOS Y LIDERAR CON EL EJEMPLO (COMPETENCIAS ESPECÍFICAS DE SUPERVISIÓN)
                  </div>
                  <div className="divide-y divide-zinc-200 bg-white">
                    <div className="grid grid-cols-4 p-2 gap-2">
                      <span className="font-bold text-zinc-700 font-mono text-[11px]">Estatus de Evaluación:</span>
                      <span className="col-span-3 text-zinc-900 font-mono">
                        Nivel Requerido: Nivel A (Superior - 5.00 pts) | Nivel Evaluado: Nivel B (Alto - 3.75 pts) | <strong>PRIORIDAD ALTA (MANDO Y DELEGACIÓN)</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-4 p-2 gap-2 bg-zinc-50/50">
                      <span className="font-bold text-zinc-700 font-mono text-[11px]">Diagnóstico de la Brecha:</span>
                      <span className="col-span-3 text-zinc-900 text-justify">
                        Al asumir la posición de {promotedPosition}, asumirá el liderazgo y supervisión directa de equipos de campo. Su empatía y energía social deben potenciarse con firmeza directiva, delegación estructurada y formación continua de sucesores.
                      </span>
                    </div>

                    <div className="grid grid-cols-4 p-2 gap-2">
                      <span className="font-bold text-zinc-700 font-mono text-[11px]">Conductas Esperadas:</span>
                      <span className="col-span-3 text-zinc-900 space-y-1">
                        <span className="block">• Diseña y ejecuta planes individuales de formación y desarrollo continuo para los colaboradores a su cargo.</span>
                        <span className="block">• Modela de manera consistente e intachable las directrices éticas y operativas del Universo Canguro, inspirando lealtad y compromiso.</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-4 p-2 gap-2 bg-amber-50/50">
                      <span className="font-bold text-amber-950 font-mono text-[11px]">Plan de Acción Específico:</span>
                      <span className="col-span-3 text-zinc-950 font-medium">
                        Programa de Liderazgo Directivo y Desarrollo de Equipos de Alto Rendimiento + Mentoring quincenal con la Gerencia del Área.
                      </span>
                    </div>
                  </div>
                </div>

                {/* TARJETA PDI 3 */}
                <div className="border border-zinc-900 rounded-lg overflow-hidden text-xs">
                  <div className="bg-zinc-950 text-[#F1B400] font-black uppercase p-2 text-xs font-mono">
                    3. CAPACIDAD DE ANÁLISIS Y AUDITORÍA DE PROCESOS (COMPETENCIA CARDINAL Y ESPECÍFICA DE ÁREA)
                  </div>
                  <div className="divide-y divide-zinc-200 bg-white">
                    <div className="grid grid-cols-4 p-2 gap-2">
                      <span className="font-bold text-zinc-700 font-mono text-[11px]">Estatus de Evaluación:</span>
                      <span className="col-span-3 text-zinc-900 font-mono">
                        Nivel Requerido: Nivel A (Superior - 5.00 pts) | Nivel Evaluado: Nivel B (Alto - 3.75 pts) | <strong>PRIORIDAD MEDIA</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-4 p-2 gap-2 bg-zinc-50/50">
                      <span className="font-bold text-zinc-700 font-mono text-[11px]">Diagnóstico de la Brecha:</span>
                      <span className="col-span-3 text-zinc-900 text-justify">
                        Obtuvo Nivel B. Si bien posee un rigor analítico solvente, se requiere elevar el análisis operacional hacia la construcción de matrices de riesgo predictivo e indicadores clave de blindaje patrimonial para la Alta Dirección.
                      </span>
                    </div>

                    <div className="grid grid-cols-4 p-2 gap-2">
                      <span className="font-bold text-zinc-700 font-mono text-[11px]">Conductas Esperadas:</span>
                      <span className="col-span-3 text-zinc-900 space-y-1">
                        <span className="block">• Elabora reportes ejecutivos consolidados con enfoque en cuantificación de riesgos, causas raíz y pérdidas evadidas.</span>
                        <span className="block">• Utiliza análisis de datos para la detección temprana de inconsistencias operacionales e impulsa mejoras sistemáticas.</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-4 p-2 gap-2 bg-amber-50/50">
                      <span className="font-bold text-amber-950 font-mono text-[11px]">Plan de Acción Específico:</span>
                      <span className="col-span-3 text-zinc-950 font-medium">
                        Capacitación en Auditoría Basada en Riesgos y Métricas de Impacto con herramientas analíticas.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter pageNumber={4} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* HOJA 5: COMPROMISOS, DISPOSICIONES FINALES Y LAS 6 FIRMAS DE CONFORMIDAD   */}
        {/* ========================================================================= */}
        {(selectedSheet === 'all' || selectedSheet === 5) && (
          <div className="pdf-sheet bg-white text-zinc-950 p-8 sm:p-11 rounded-2xl shadow-xl border border-zinc-200 max-w-4xl mx-auto min-h-[1050px] flex flex-col justify-between print:min-h-0 print:p-0 print:mb-0 print:border-none print:shadow-none">
            <div>
              <SheetMiniHeader pageNumber={5} />

              <div className="space-y-5">
                
                {/* SECCIÓN VII: COMPROMISO Y DISPOSICIONES FINALES */}
                <div className="space-y-2.5">
                  <div className="border-t-2 border-[#F1B400] pt-1">
                    <h3 className="text-xs font-black uppercase text-zinc-950 tracking-wider">
                      VII. COMPROMISO, DISPOSICIONES FINALES Y FIRMAS DE CONFORMIDAD
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-800 leading-relaxed text-justify">
                    Las partes declaran haber revisado exhaustivamente los resultados de la evaluación. La colaboradora notificada manifiesta conocer los compromisos adquiridos en el Plan de Desarrollo Individual (PDI) y acepta las condiciones establecidas para la consolidación de su promoción en la organización.
                  </p>
                </div>

                {/* CUADRÍCULA OFICIAL DE FIRMAS (ESTRUCTURA EXACTA: 6 FIRMAS INSTITUCIONALES) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-2">
                  
                  {/* FIRMA 1: COLABORADOR EVALUADO */}
                  <div className="space-y-2 text-center p-3 rounded-xl border border-zinc-200/90 bg-zinc-50/40">
                    <strong className="text-xs font-black uppercase text-zinc-950 block tracking-tight">
                      Firma del Colaborador Evaluado
                    </strong>
                    {/* Línea para firma */}
                    <div className="pt-7 border-b border-zinc-950 mx-4"></div>
                    <span className="text-[10px] text-zinc-500 font-mono block">Firma</span>
                    {/* Línea para colocar nombre manualmente */}
                    <div className="pt-1 px-3">
                      <div className="flex items-baseline gap-1.5 text-xs text-zinc-800">
                        <span className="font-bold text-zinc-700 text-[11px] shrink-0">Nombre:</span>
                        <div className="border-b border-zinc-400 flex-1 h-3.5"></div>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 block">Colaborador Evaluado</span>
                    <div className="text-[11px] font-mono text-zinc-700 pt-0.5">
                      Fecha: ____ / ____ / ________
                    </div>
                  </div>

                  {/* FIRMA 2: MENTOR */}
                  <div className="space-y-2 text-center p-3 rounded-xl border border-zinc-200/90 bg-zinc-50/40">
                    <strong className="text-xs font-black uppercase text-zinc-950 block tracking-tight">
                      Firma del Mentor
                    </strong>
                    {/* Línea para firma */}
                    <div className="pt-7 border-b border-zinc-950 mx-4"></div>
                    <span className="text-[10px] text-zinc-500 font-mono block">Firma</span>
                    {/* Línea para colocar nombre manualmente */}
                    <div className="pt-1 px-3">
                      <div className="flex items-baseline gap-1.5 text-xs text-zinc-800">
                        <span className="font-bold text-zinc-700 text-[11px] shrink-0">Nombre:</span>
                        <div className="border-b border-zinc-400 flex-1 h-3.5"></div>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 block">Mentor y Tutor de Desarrollo</span>
                    <div className="text-[11px] font-mono text-zinc-700 pt-0.5">
                      Fecha: ____ / ____ / ________
                    </div>
                  </div>

                  {/* FIRMA 3: GERENTE / DIRECTOR DEL ÁREA */}
                  <div className="space-y-2 text-center p-3 rounded-xl border border-zinc-200/90 bg-zinc-50/40">
                    <strong className="text-xs font-black uppercase text-zinc-950 block tracking-tight">
                      Firma del Gerente / Director del área
                    </strong>
                    {/* Línea para firma */}
                    <div className="pt-7 border-b border-zinc-950 mx-4"></div>
                    <span className="text-[10px] text-zinc-500 font-mono block">Firma</span>
                    {/* Línea para colocar nombre manualmente */}
                    <div className="pt-1 px-3">
                      <div className="flex items-baseline gap-1.5 text-xs text-zinc-800">
                        <span className="font-bold text-zinc-700 text-[11px] shrink-0">Nombre:</span>
                        <div className="border-b border-zinc-400 flex-1 h-3.5"></div>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 block">Gerente / Director del Área</span>
                    <div className="text-[11px] font-mono text-zinc-700 pt-0.5">
                      Fecha: ____ / ____ / ________
                    </div>
                  </div>

                  {/* FIRMA 4: GERENTE DE FORMACIÓN Y DESARROLLO (ALEJANDRA ARÉVALO) */}
                  <div className="space-y-2 text-center p-3 rounded-xl border border-zinc-200/90 bg-zinc-50/40">
                    <strong className="text-xs font-black uppercase text-zinc-950 block tracking-tight">
                      Firma del Gerente de Formación y Desarrollo
                    </strong>
                    {/* Línea para firma */}
                    <div className="pt-7 border-b border-zinc-950 mx-4"></div>
                    <span className="text-[10px] text-zinc-500 font-mono block">Firma</span>
                    {/* Nombre fijo institucional */}
                    <div className="pt-1">
                      <span className="text-xs font-black text-zinc-950 block">
                        Alejandra Arévalo
                      </span>
                      <span className="text-[10px] text-zinc-600 block">
                        Gerente de Formación y Desarrollo
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-700 pt-0.5">
                      Fecha: ____ / ____ / ________
                    </div>
                  </div>

                  {/* FIRMA 5: COORDINADORA DE DESARROLLO Y DESEMPEÑO (NATALIA RODRÍGUEZ) */}
                  <div className="space-y-2 text-center p-3 rounded-xl border border-zinc-200/90 bg-zinc-50/40">
                    <strong className="text-xs font-black uppercase text-zinc-950 block tracking-tight">
                      Firma de Coordinadora de Desarrollo y Desempeño
                    </strong>
                    {/* Línea para firma */}
                    <div className="pt-7 border-b border-zinc-950 mx-4"></div>
                    <span className="text-[10px] text-zinc-500 font-mono block">Firma</span>
                    {/* Nombre fijo institucional */}
                    <div className="pt-1">
                      <span className="text-xs font-black text-zinc-950 block">
                        Natalia Rodríguez
                      </span>
                      <span className="text-[10px] text-zinc-600 block">
                        Coordinadora de Desarrollo y Desempeño
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-700 pt-0.5">
                      Fecha: ____ / ____ / ________
                    </div>
                  </div>

                  {/* FIRMA 6: DIRECTORA DE TALENTO HUMANO (JEANETTE ARVELO) */}
                  <div className="space-y-2 text-center p-3 rounded-xl border border-zinc-200/90 bg-zinc-50/40">
                    <strong className="text-xs font-black uppercase text-zinc-950 block tracking-tight">
                      Firma de Directora de Talento Humano
                    </strong>
                    {/* Línea para firma */}
                    <div className="pt-7 border-b border-zinc-950 mx-4"></div>
                    <span className="text-[10px] text-zinc-500 font-mono block">Firma</span>
                    {/* Nombre fijo institucional */}
                    <div className="pt-1">
                      <span className="text-xs font-black text-zinc-950 block">
                        Jeanette Arvelo
                      </span>
                      <span className="text-[10px] text-zinc-600 block">
                        Directora de Talento Humano
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-700 pt-0.5">
                      Fecha: ____ / ____ / ________
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <SheetFooter pageNumber={5} />
          </div>
        )}
      </>
    );

    return (
      <div className="space-y-6 text-zinc-900 font-sans print:p-0 print:m-0 print:space-y-0">
        {/* 1. VISTA EN EL GESTOR: Tarjeta ejecutiva digital moderna (sin hojas de papel estáticas) */}
        <div className="gestor-view bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-zinc-950 dark:bg-zinc-800 text-[#F1B400] rounded-xl shadow-xs shrink-0">
                <FileText size={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    DTH-GFD-PROM-01 • Versión 1.0
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Expediente Foliado y Calibrado para Firma
                  </span>
                </div>
                <h3 className="text-base font-black uppercase text-zinc-950 dark:text-white tracking-tight">
                  Expediente Formal de Evaluación para Promoción
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Formato oficial de 5 hojas foliadas para auditoría de carrera, expediente físico/digital y registro de 6 firmas institucionales.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedSheet('all');
                  setShowPreviewModal(true);
                }}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase rounded-xl transition-all border border-zinc-300 dark:border-zinc-700 flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Eye size={15} className="text-[#D99C00]" />
                <span>Vista Previa PDF (5 Hojas)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedSheet('all');
                  window.print();
                }}
                className="px-4 py-2 bg-[#F1B400] hover:bg-[#d99c00] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Printer size={15} />
                <span>Imprimir / Exportar a PDF</span>
              </button>
            </div>
          </div>

          {/* 4 Métricas clave del expediente */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block font-bold">Dictamen Oficial</span>
              <span className="font-black text-sm text-emerald-700 dark:text-emerald-400 block mt-0.5">
                {phase3?.resolutionVerdict || 'Idóneo para Ascenso'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block font-bold">Puntaje Ponderado</span>
              <span className="font-black text-sm text-zinc-950 dark:text-white block mt-0.5">
                {totalBase100}% ({phase3.finalScore.toFixed(2)}/5.00)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block font-bold">Puesto Destino</span>
              <span className="font-black text-sm text-zinc-950 dark:text-white block mt-0.5 truncate">
                {promotedPosition}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block font-bold">Estatus de Firmas</span>
              <span className="font-black text-sm text-zinc-950 dark:text-white block mt-0.5">
                6/6 Requeridas
              </span>
            </div>
          </div>

          {/* Índice de las 5 Hojas Oficiales */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-mono block">
              Estructura del Expediente Oficial Foliado:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
              {sheetsSummary.map((sheet) => (
                <button
                  key={sheet.num}
                  type="button"
                  onClick={() => {
                    setSelectedSheet(sheet.num as 1 | 2 | 3 | 4 | 5);
                    setShowPreviewModal(true);
                  }}
                  className="text-left p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 hover:bg-amber-50/60 dark:hover:bg-zinc-800 hover:border-amber-300 dark:hover:border-amber-700 transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 group-hover:bg-[#F1B400] group-hover:text-black transition-colors">
                        Hoja {sheet.num}
                      </span>
                      <ChevronRight size={12} className="text-zinc-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                    <h4 className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 group-hover:text-amber-950 dark:group-hover:text-white transition-colors leading-snug">
                      {sheet.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {sheet.description}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 mt-2 block border-t border-zinc-200/60 dark:border-zinc-700/60 pt-1">
                    {sheet.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. MODAL DE VISTA PREVIA (SE ABRE SÓLO AL HACER CLIC EN VISTA PREVIA) */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col p-2 sm:p-5 overflow-y-auto print:hidden">
            {/* Barra Flotante Superior */}
            <div className="sticky top-0 z-30 bg-zinc-950 text-white p-3.5 sm:p-4 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F1B400] text-black rounded-xl">
                  <Award size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-black uppercase text-white tracking-wider">
                      Vista Previa: Formato Imprimible de Promoción
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#F1B400] text-black">
                      DTH-GFD-PROM-01
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Paginación estricta de 5 hojas formato Letter/A4 calibradas para PDF
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Selector de Hoja */}
                <div className="flex items-center bg-zinc-800 rounded-lg p-1 border border-zinc-700 text-xs font-mono">
                  <button
                    onClick={() => setSelectedSheet('all')}
                    className={`px-2.5 py-1 rounded transition-colors font-bold ${
                      selectedSheet === 'all' ? 'bg-[#F1B400] text-black' : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    Todas (1-5)
                  </button>
                  {[1, 2, 3, 4, 5].map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setSelectedSheet(pg as 1 | 2 | 3 | 4 | 5)}
                      className={`px-2 py-1 rounded transition-colors font-bold ${
                        selectedSheet === pg ? 'bg-[#F1B400] text-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      H{pg}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-[#F1B400] hover:bg-[#d99c00] text-black font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Imprimir / PDF</span>
                </button>

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Cerrar Vista Previa"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Contenedor de Hojas dentro del Modal */}
            <div className="space-y-8 max-w-4xl mx-auto w-full pb-12">
              {renderAllSheets(false)}
            </div>
          </div>
        )}

        {/* 3. CONTENEDOR OCULTO EN PANTALLA, ACTIVO EXCLUSIVAMENTE AL IMPRIMIR (@media print) */}
        <div id="report-content" className="hidden print:block print:space-y-0">
          {renderAllSheets(true)}
        </div>
      </div>
    );
  }

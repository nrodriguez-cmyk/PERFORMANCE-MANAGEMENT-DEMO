import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { EvalForm } from '../components/EvalForm';
import { SituationalEvalForm } from '../components/SituationalEvalForm';
import { SelfEvalForm } from '../components/SelfEvalForm';
import { PotentialLeadershipEvalForm } from '../components/PotentialLeadershipEvalForm';
import { BigFiveEvalForm } from '../components/BigFiveEvalForm';
import { OperacionesSection1Form } from '../components/OperacionesSection1Form';
import { AdministracionFinanzasSection1Form } from '../components/AdministracionFinanzasSection1Form';
import { ComercialSection1Form } from '../components/ComercialSection1Form';
import { ComprasSection1Form } from '../components/ComprasSection1Form';
import { ControlInternoSection1Form } from '../components/ControlInternoSection1Form';
import { TalentoHumanoSection1Form } from '../components/TalentoHumanoSection1Form';
import { TecnologiaSection1Form } from '../components/TecnologiaSection1Form';
import { TransporteLogisticaSection1Form } from '../components/TransporteLogisticaSection1Form';
import { CanguroLogo } from '../components/CanguroLogo';
import { loadState, saveState, subscribeToStorage } from '../store';
import { AppState, EvaluationData, AdminNotification } from '../types';
import { Save, CheckCircle, ShieldCheck, Lock, AlertCircle, ArrowLeft, UserCircle, Sparkles, Award, TrendingUp, Sun, Moon, Brain, Compass, Target, MessageSquare, Clock, Briefcase } from 'lucide-react';

import { CANGURO_COLLABORATORS, savePilotEvaluation } from '../data/canguroUniverso';
import {
  getOfficialCompetencyQuestions,
  getDefaultPromotionTargetPosition,
  resolvePositionManagementLevel
} from '../data/canguroCompetencyDictionary';
import { processBigFiveScores } from '../utils/psychometricProcessor';
import { saveEvaluationRecord } from '../services/databaseService';
import { getGlobalEvaluationStatus, formatScheduleDateTime } from '../utils/evaluationStatus';
import { isPositionEvaluationEnabled } from '../utils/evaluationPositionsConfig';
import { getCurrentSession } from '../services/authService';

type EvalKeys = 'selfEval' | 'supervisorEval' | 'peerEval' | 'subordinateEval' | 'hrEval' | 'promotionEval';

export function Evaluate() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const employeeName = searchParams.get('employee') || '';
  const position = searchParams.get('position') || '';
  const idNumber = searchParams.get('idNumber') || '';
  const departmentParam = searchParams.get('dept') || '';
  const directorateParam = searchParams.get('dir') || '';

  const [state, setState] = useState<AppState>(loadState());
  const [isSaved, setIsSaved] = useState(false);
  const [honestyAccepted, setHonestyAccepted] = useState(false);
  
  // Modalidades de evaluación
  const isSelf = type === 'self';
  const isPromotionCandidate = type === 'promotion' || type === 'promotion_candidate';
  const isPromotionSupervisor = type === 'promotion_supervisor';
  const isPromotion = isPromotionCandidate || isPromotionSupervisor;

  // Google Forms-style navigation: tracks which section is visible in the standard evaluation
  const [currentSection, setCurrentSection] = useState(1);
  const TOTAL_SECTIONS = 4;

  // Modo de visualización: Forzado SIEMPRE en Modo Claro
  const theme: 'light' = 'light';
  const isDark = false;

  // Identify matching collaborator if present
  const cleanId = (idNumber || '').replace(/[\.\s-]/g, '').toLowerCase();
  const matchedCollab = CANGURO_COLLABORATORS.find(c => {
    const cIdNum = (c.info.idNumber || '').replace(/[\.\s-]/g, '').toLowerCase();
    const cName = `${c.info.firstName} ${c.info.lastName}`.toLowerCase().trim();
    return (cleanId && cIdNum === cleanId) || (employeeName && cName === employeeName.toLowerCase().trim());
  });

  const displayEmployeeName = employeeName || (matchedCollab ? `${matchedCollab.info.firstName} ${matchedCollab.info.lastName}` : 'Colaborador Canguro');
  const displayPosition = position || (matchedCollab ? matchedCollab.info.position : 'Asesor Integral');
  const displayIdNumber = idNumber || (matchedCollab ? matchedCollab.info.idNumber : 'V-00.000.000');
  const displayDepartment = departmentParam || (matchedCollab ? matchedCollab.info.department : 'Red de Tiendas');
  const displayDirectorate = directorateParam || (matchedCollab ? matchedCollab.info.directorate : '') || (state.employeeInfo.directorate || '');

  const evaluatorParamName = searchParams.get('evaluatorName') || searchParams.get('evaluator') || '';
  const evaluatorParamPos = searchParams.get('evaluatorPos') || searchParams.get('evaluatorPosition') || '';

  const [evaluatorName, setEvaluatorName] = useState<string>(() => {
    if (type === 'self' || isPromotionCandidate) return displayEmployeeName;
    return evaluatorParamName || '';
  });

  const [evaluatorPosition, setEvaluatorPosition] = useState<string>(() => {
    if (type === 'self' || isPromotionCandidate) return displayPosition;
    if (evaluatorParamPos) return evaluatorParamPos;
    if (type === 'supervisor' || isPromotionSupervisor) return 'Supervisor Inmediato';
    if (type === 'peer') return 'Par / Colega Homólogo';
    if (type === 'subordinate') return 'Subordinado / Equipo a Cargo';
    return '';
  });

  const evalKeyMap: Record<string, EvalKeys> = {
    self: 'selfEval',
    supervisor: 'supervisorEval',
    peer: 'peerEval',
    subordinate: 'subordinateEval',
    hr: 'hrEval',
    promotion: 'promotionEval',
    promotion_candidate: 'promotionEval',
    promotion_supervisor: 'promotionEval',
  };

  const key = evalKeyMap[type || 'self'] || 'selfEval';

  // State key specific to this employee and role so other evaluations never overwrite or pre-mark answers
  const formStorageKey = `eval_form_${cleanId || 'guest'}_${key}_${type || 'default'}`;

  // Identificador de enlace tokenizado o derivado canónico
  const tokenParam = searchParams.get('token') || '';
  const linkToken = tokenParam || `eval_token_${cleanId || employeeName.toLowerCase().replace(/\s+/g, '_')}_${type || 'default'}`;

  // Helper para leer enlaces consumidos
  const getConsumedLinks = (): Record<string, any> => {
    try {
      return JSON.parse(localStorage.getItem('canguro_consumed_evaluation_links') || '{}');
    } catch {
      return {};
    }
  };

  // Verificación multi-capa de uso previo del enlace (Regla de Uso Único)
  const checkLinkUsage = (): { used: boolean; date?: string; by?: string } => {
    const consumed = getConsumedLinks();
    // 1. Por parámetro token directo
    if (tokenParam && consumed[tokenParam]) {
      return { used: true, date: consumed[tokenParam].submittedAt, by: consumed[tokenParam].evaluatorName };
    }
    // 2. Por identificador derivado del enlace
    if (consumed[linkToken]) {
      return { used: true, date: consumed[linkToken].submittedAt, by: consumed[linkToken].evaluatorName };
    }
    const genericKey = `eval_${cleanId || 'collab'}_${type}`;
    if (consumed[genericKey]) {
      return { used: true, date: consumed[genericKey].submittedAt, by: consumed[genericKey].evaluatorName };
    }

    // 3. Por almacenamiento individual del formulario
    try {
      const savedForm = localStorage.getItem(formStorageKey);
      if (savedForm) {
        const parsed = JSON.parse(savedForm);
        if (parsed.isLocked || parsed.submittedAt) {
          return { used: true, date: parsed.submittedAt, by: parsed.evaluatorName };
        }
      }
    } catch {}

    // 4. Por registro de evaluaciones piloto persistido
    try {
      const digits = (idNumber || '').replace(/\D/g, '');
      const collabKey = `canguro_pilot_eval_${digits || cleanId}`;
      const storedCollab = JSON.parse(localStorage.getItem(collabKey) || '{}');
      if (storedCollab[key]?.isLocked || storedCollab[key]?.submittedAt) {
        return { used: true, date: storedCollab[key].submittedAt, by: storedCollab[key].evaluatorName };
      }
    } catch {}

    // 5. Por colaboradores preconfigurados en memoria
    if (matchedCollab) {
      const evalObj = matchedCollab[key as keyof typeof matchedCollab] as EvaluationData | undefined;
      if (evalObj && (evalObj.isLocked || evalObj.submittedAt)) {
        return { used: true, date: evalObj.submittedAt, by: evalObj.evaluatorName };
      }
    }

    // 6. Por estado del store global
    if (state[key]?.isLocked && state[key]?.submittedAt) {
      return { used: true, date: state[key]?.submittedAt, by: state[key]?.evaluatorName };
    }

    return { used: false };
  };

  const initialUsage = checkLinkUsage();
  const [isAlreadyUsed, setIsAlreadyUsed] = useState<boolean>(initialUsage.used);
  const [usedDetails, setUsedDetails] = useState<{ date?: string; by?: string }>({
    date: initialUsage.date,
    by: initialUsage.by
  });
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<EvaluationData>(() => {
    try {
      const savedForm = localStorage.getItem(formStorageKey);
      if (savedForm) {
        return JSON.parse(savedForm);
      }
    } catch {
      // fallback
    }
    return {
      scores: {},
      comments: '',
      checkedBehaviors: {},
      openAnswers: {},
      isLocked: false
    };
  });

  // 2. Auto-guardado offline continuo en localStorage ante cualquier avance
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`${formStorageKey}_last_autosave`);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!formData.isLocked && (Object.keys(formData.scores || {}).length > 0 || formData.comments || Object.keys(formData.openAnswers || {}).length > 0)) {
      try {
        localStorage.setItem(formStorageKey, JSON.stringify(formData));
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        localStorage.setItem(`${formStorageKey}_last_autosave`, nowTime);
        setLastSavedTimestamp(nowTime);
      } catch (e) {
        console.warn('Error al autoguardar progreso local:', e);
      }
    }
  }, [formData, formStorageKey]);

  useEffect(() => {
    return subscribeToStorage(() => setState(loadState()));
  }, []);

  const titleMap: Record<string, string> = {
    self: 'Evaluación del Desempeño',
    supervisor: 'Evaluación del Desempeño',
    peer: 'Evaluación del Desempeño',
    subordinate: 'Evaluación del Desempeño',
    hr: 'Evaluación del Desempeño',
    promotion: 'Evaluación del Desempeño - Promoción',
    promotion_candidate: 'Evaluación del Desempeño - Promoción',
    promotion_supervisor: 'Evaluación del Desempeño - Promoción'
  };

  // Cargo superior / destino para la Evaluación de Promoción
  const targetPosParam = searchParams.get('targetPos') || searchParams.get('targetPosition') || '';
  const [targetPosition, setTargetPosition] = useState<string>(() => {
    return targetPosParam || matchedCollab?.info.targetPromotionPosition || getDefaultPromotionTargetPosition(displayPosition);
  });

  // Nivel y preguntas dinámicas:
  // En Desempeño Regular: Carga las competencias del CARGO ACTUAL según su nivel (D, C, B, A).
  // En Promoción: Carga las competencias del CARGO SUPERIOR / DESTINO según el nivel superior esperado.
  const competencyQuestions = getOfficialCompetencyQuestions(
    isPromotion ? targetPosition : displayPosition,
    directorateParam || displayDepartment,
    type === 'supervisor' || isPromotionSupervisor,
    isPromotion,
    targetPosition,
    type || 'self'
  );

  const targetLevelInfo = resolvePositionManagementLevel(targetPosition);
  const currentLevelInfo = resolvePositionManagementLevel(displayPosition);

  // Renderizador dinámico de Sección 1: Evaluación de Metas por Dirección
  const renderSection1GoalsForm = () => {
    const dirNorm = (displayDirectorate || displayDepartment || '').toLowerCase();
    
    const commonProps = {
      data: formData,
      onChange: (d: EvaluationData) => setFormData(d),
      evaluatorRole: type || 'self',
      employeePosition: displayPosition,
      theme: theme
    };

    if (dirNorm.includes('tecnolog') || dirNorm.includes('sistemas') || dirNorm.includes('informát') || dirNorm.includes('it')) {
      return <TecnologiaSection1Form {...commonProps} />;
    }
    if (dirNorm.includes('humano') || dirNorm.includes('talento') || dirNorm.includes('rrhh') || dirNorm.includes('recursos')) {
      return <TalentoHumanoSection1Form {...commonProps} />;
    }
    if (dirNorm.includes('financ') || dirNorm.includes('admin') || dirNorm.includes('contab') || dirNorm.includes('tesor')) {
      return <AdministracionFinanzasSection1Form {...commonProps} />;
    }
    if (dirNorm.includes('compras') || dirNorm.includes('procura') || dirNorm.includes('abastec')) {
      return <ComprasSection1Form {...commonProps} />;
    }
    if (dirNorm.includes('control') || dirNorm.includes('auditor') || dirNorm.includes('prevenc')) {
      return <ControlInternoSection1Form {...commonProps} />;
    }
    if (dirNorm.includes('comercial') || dirNorm.includes('mercad') || dirNorm.includes('marketing') || dirNorm.includes('ventas may')) {
      return <ComercialSection1Form {...commonProps} />;
    }
    if (dirNorm.includes('transporte') || dirNorm.includes('logíst') || dirNorm.includes('almac') || dirNorm.includes('flota') || dirNorm.includes('despach')) {
      return <TransporteLogisticaSection1Form {...commonProps} />;
    }
    // Por defecto: Dirección de Operaciones y Red de Tiendas
    return <OperacionesSection1Form {...commonProps} />;
  };

  const handleSave = () => {
    // REGLA DE USO ÚNICO: Prevenir doble envío o reenvío desde el mismo enlace
    if (isSubmitting || isAlreadyUsed || formData.isLocked) {
      alert('Esta evaluación ya ha sido enviada previamente. Por normativa institucional, cada enlace es de uso único y no admite reenvíos.');
      return;
    }

    setIsSubmitting(true);
    const timestamp = new Date().toISOString();
    const currentEvaluatorName = (type === 'self' || isPromotionCandidate ? displayEmployeeName : evaluatorName).trim();
    const currentEvaluatorPos = (type === 'self' || isPromotionCandidate ? displayPosition : evaluatorPosition).trim();

    const updatedScores = { ...formData.scores };
    
    // Cálculo psicométrico automático del Big Five si es evaluación de promoción del candidato
    let bigFiveResults = undefined;
    if (isPromotionCandidate) {
      bigFiveResults = processBigFiveScores(updatedScores);
    }

    const updatedEval: EvaluationData = {
      ...formData,
      scores: updatedScores,
      submittedAt: timestamp,
      isLocked: true,
      evaluatorRole: type as any,
      evaluatorName: currentEvaluatorName || undefined,
      bigFiveResults
    };

    setFormData(updatedEval);

    // Guardado local de este formulario
    try {
      localStorage.setItem(formStorageKey, JSON.stringify(updatedEval));
    } catch {
      // fallback
    }

    // Registrar en el consumo de enlaces (REGLA DE USO ÚNICO)
    try {
      const consumed = getConsumedLinks();
      const record = {
        token: linkToken,
        type,
        employeeName: displayEmployeeName,
        idNumber: displayIdNumber,
        evaluatorName: currentEvaluatorName,
        evaluatorRole: type,
        submittedAt: timestamp
      };
      consumed[linkToken] = record;
      consumed[`eval_${cleanId || 'collab'}_${type}`] = record;
      if (tokenParam) {
        consumed[tokenParam] = record;
      }
      localStorage.setItem('canguro_consumed_evaluation_links', JSON.stringify(consumed));
    } catch (e) {
      console.error('Error al registrar enlace consumido:', e);
    }

    // Persistencia en colaboradores en memoria y almacenamiento del piloto
    const digits = (idNumber || '').replace(/\D/g, '');
    const foundCollab = CANGURO_COLLABORATORS.find(c => 
      c.info.idNumber?.replace(/\D/g, '') === digits || 
      (employeeName && `${c.info.firstName} ${c.info.lastName}`.toLowerCase().trim() === employeeName.toLowerCase().trim())
    );

    if (foundCollab) {
      if (type === 'self') foundCollab.selfEval = updatedEval;
      if (type === 'supervisor') foundCollab.supervisorEval = updatedEval;
      if (type === 'peer') foundCollab.peerEval = updatedEval;
      if (type === 'subordinate') foundCollab.subordinateEval = updatedEval;
      if (type === 'hr') foundCollab.hrEval = updatedEval;

      if (isPromotion) {
        const existingDossier = foundCollab.promotionDossier || {
          candidateId: foundCollab.info.id,
          targetPosition: targetPosition,
          targetDepartment: displayDepartment,
          phase1: {
            interviewScore: 4.5,
            interviewerComments: 'Entrevista y Medición de Predisposición Conductual y Adecuación al nuevo Cargo',
            bigFiveResults: bigFiveResults || processBigFiveScores({}),
            maturityAssessment: 'Perfil con alta adaptabilidad y madurez laboral',
            completed: true
          },
          phase2: {
            situationalScore: 4.5,
            questionsApplied: competencyQuestions,
            candidateAnswers: {},
            completed: true
          },
          phase3: {
            finalScore: 4.5,
            scoreBase100: 90,
            fitLevel: 'Listo Ahora',
            fitIndexPercent: 88,
            promotionCriterion: 'NIVEL SOBRESALIENTE',
            verdict: 'Altamente Idóneo / Prioritario',
            completed: true
          }
        };

        if (isPromotionCandidate) {
          if (bigFiveResults) {
            existingDossier.phase1.bigFiveResults = bigFiveResults;
          }
          existingDossier.phase1.completed = true;
          existingDossier.phase2.candidateAnswers = formData.openAnswers || {};
        }

        if (isPromotionSupervisor) {
          (existingDossier.phase2 as any).completed = true;
          (existingDossier.phase3 as any).completed = true;
          (existingDossier.phase3 as any).fitRecommendation = formData.comments || 'Recomendado por supervisión directa';
        }

        foundCollab.promotionDossier = existingDossier as any;
      }

      try {
        const collabKey = `canguro_pilot_eval_${digits || foundCollab.info.id}`;
        const existingStored = JSON.parse(localStorage.getItem(collabKey) || '{}');
        const toSave = {
          ...existingStored,
          [key]: updatedEval,
          ...(isPromotion ? { promotionDossier: foundCollab.promotionDossier } : {})
        };
        localStorage.setItem(collabKey, JSON.stringify(toSave));
        savePilotEvaluation(digits || foundCollab.info.id, toSave);
      } catch {
        // storage fallback
      }
    }

    // Registrar notificación en tiempo real para el Administrador
    let whoFilledDesc = currentEvaluatorName;
    if (type === 'self' || isPromotionCandidate) {
      whoFilledDesc = `${displayEmployeeName} (${titleMap[type || 'self']})`;
    } else {
      whoFilledDesc = `${currentEvaluatorName || 'Evaluador'} (${currentEvaluatorPos || 'Rol ' + type})`;
    }

    const evaluationTypeLabel = titleMap[type || 'self'] || 'Evaluación de Desempeño';

    const newNotification: AdminNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: timestamp,
      timestamp,
      read: false,
      title: `Nueva Evaluación Recibida: ${evaluationTypeLabel}`,
      message: `${whoFilledDesc} ha completado y enviado oficialmente el instrumento de ${displayEmployeeName} (${displayPosition} - ${displayDepartment}). Enlace consumido exitosamente.`,
      employeeId: cleanId || 'emp-colaborador',
      evaluatorName: currentEvaluatorName || whoFilledDesc,
      evaluatorPosition: currentEvaluatorPos,
      evaluatorRole: type,
      evaluationType: evaluationTypeLabel,
      evaluatedEmployeeName: displayEmployeeName,
      evaluatedEmployeePosition: displayPosition,
    };

    const newState = {
      ...state,
      [key]: updatedEval,
      notifications: [newNotification, ...(state.notifications || [])]
    };
    setState(newState);
    saveState(newState);

    // Sincronizar en segundo plano con la base de datos (PostgreSQL / Supabase) si está disponible
    saveEvaluationRecord({
      collaboratorId: matchedCollab?.info.id || (cleanId ? `emp-${cleanId}` : 'emp-colaborador'),
      evaluatorName: currentEvaluatorName,
      evaluatorPosition: currentEvaluatorPos,
      evaluatorRole: type || 'self',
      evaluationType: isPromotion ? 'promotion' : 'standard',
      period: '2026-Q1',
      evalData: updatedEval,
      finalScore: (updatedEval as any).finalScore || 0,
      finalPercent: (updatedEval as any).finalPercent || 0
    }).catch(() => {});

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('canguro_storage_update'));
    }

    setIsSaved(true);
    setJustSubmitted(true);
    setIsAlreadyUsed(true);
    setUsedDetails({ date: timestamp, by: currentEvaluatorName });
    setIsSubmitting(false);
  };

  // Verificación del estado global de apertura de evaluaciones
  const sessionUser = getCurrentSession();
  const isAdmin = sessionUser?.role === 'admin' || sessionUser?.username === '26475804';
  const evalStatus = getGlobalEvaluationStatus();

  // Si las evaluaciones están cerradas de manera general y el usuario no es administrador
  if (!evalStatus.isOpen && !isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-100 text-zinc-900 flex flex-col justify-between font-sans">
        <header className="sticky top-0 z-50 py-3.5 px-4 sm:px-6 shadow-md bg-white border-b-2 border-[#F1B400]">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <CanguroLogo size={32} theme="dark" />
            <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider">
              Dirección de Talento Humano
            </span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="p-8 sm:p-10 rounded-3xl shadow-xl max-w-lg w-full bg-white border border-zinc-200 border-t-4 border-t-amber-500 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-500/20 shadow-sm">
              <Lock size={34} />
            </div>

            <div className="inline-block px-3.5 py-1 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-900 border border-amber-500/20 mb-3">
              Período de Evaluaciones Cerrado
            </div>

            <h2 className="text-2xl font-black mb-2.5 text-zinc-950 tracking-tight">
              Módulo de Evaluaciones Deshabilitado
            </h2>

            <p className="text-xs leading-relaxed text-zinc-600 mb-6 text-justify">
              {evalStatus.message || 'El período oficial de evaluaciones se encuentra actualmente cerrado por la Dirección de Talento Humano.'}
            </p>

            <div className="p-4 rounded-xl text-left text-xs bg-amber-50/80 border border-amber-200 text-amber-950 leading-relaxed space-y-1.5 font-mono">
              <span className="font-bold block text-amber-900 uppercase text-[10.5px]">Cronograma Oficial de Evaluaciones:</span>
              <div className="flex justify-between items-center text-[11px] pb-1 border-b border-amber-200/60">
                <span className="text-zinc-600">Fecha de Inicio:</span>
                <span className="font-bold text-zinc-900">{formatScheduleDateTime(evalStatus.startDate)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-600">Fecha Tope de Cierre:</span>
                <span className="font-bold text-red-700">{formatScheduleDateTime(evalStatus.endDate)}</span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-[#F1B400] text-black font-mono font-black text-xs uppercase tracking-wider hover:bg-[#d99c00] transition-all cursor-pointer shadow-md"
              >
                Volver al Portal Principal
              </a>
            </div>
          </div>
        </div>

        <footer className="py-4 px-6 text-center text-[10px] font-mono uppercase tracking-wider border-t border-zinc-200 bg-white text-zinc-500">
          DIRECCIÓN DE TALENTO HUMANO • SISTEMA DE GESTIÓN DEL DESEMPEÑO 360° Y 180°
        </footer>
      </div>
    );
  }

  // Verificación de si el cargo del evaluado está habilitado en la Configuración del Desempeño
  const isCargoEnabled = isPositionEvaluationEnabled(displayPosition);
  if (!isCargoEnabled && !isAdmin && !isPromotion) {
    return (
      <div className="min-h-screen bg-zinc-100 text-zinc-900 flex flex-col justify-between font-sans">
        <header className="sticky top-0 z-50 py-3.5 px-4 sm:px-6 shadow-md bg-white border-b-2 border-[#F1B400]">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <CanguroLogo size={32} theme="dark" />
            <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider">
              Dirección de Talento Humano
            </span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="p-8 sm:p-10 rounded-3xl shadow-xl max-w-lg w-full bg-white border border-zinc-200 border-t-4 border-t-amber-500 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-500/20 shadow-sm">
              <Briefcase size={34} />
            </div>

            <div className="inline-block px-3.5 py-1 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-900 border border-amber-500/20 mb-3">
              Cargo No Habilitado en este Ciclo
            </div>

            <h2 className="text-2xl font-black mb-2.5 text-zinc-950 tracking-tight">
              Evaluación No Requerida
            </h2>

            <p className="text-xs leading-relaxed text-zinc-600 mb-6 text-justify">
              El cargo <strong>"{displayPosition}"</strong> no se encuentra habilitado para ser evaluado en el ciclo actual. Por definición de la Dirección de Talento Humano, en esta fase del proceso la evaluación está dirigida a los cargos habilitados (<strong>Gerentes, Coordinadores y Supervisores</strong>).
            </p>

            <div className="p-4 rounded-xl text-left text-xs bg-amber-50/80 border border-amber-200 text-amber-950 leading-relaxed space-y-1.5 font-mono">
              <span className="font-bold block text-amber-900 uppercase text-[10.5px]">Colaborador Seleccionado:</span>
              <div className="flex justify-between items-center text-[11px] pb-1 border-b border-amber-200/60">
                <span className="text-zinc-600">Nombre:</span>
                <span className="font-bold text-zinc-900">{displayEmployeeName}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] pb-1 border-b border-amber-200/60">
                <span className="text-zinc-600">Cargo:</span>
                <span className="font-bold text-zinc-900">{displayPosition}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-600">Estado de Alcance:</span>
                <span className="font-bold text-amber-800">Inactivo para este ciclo</span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-[#F1B400] text-black font-mono font-black text-xs uppercase tracking-wider hover:bg-[#d99c00] transition-all cursor-pointer shadow-md"
              >
                Volver al Portal Principal
              </a>
            </div>
          </div>
        </div>

        <footer className="py-4 px-6 text-center text-[10px] font-mono uppercase tracking-wider border-t border-zinc-200 bg-white text-zinc-500">
          DIRECCIÓN DE TALENTO HUMANO • SISTEMA DE GESTIÓN DEL DESEMPEÑO 360° Y 180°
        </footer>
      </div>
    );
  }

  // Pantalla de Confirmación Inmediata tras Envío Oficial Exitoso
  if (justSubmitted) {
    return (
      <div className="min-h-screen flex flex-col antialiased bg-zinc-100 text-zinc-900">
        <header className="sticky top-0 z-50 py-3 px-4 sm:px-6 shadow-md bg-white/95 border-b-2 border-emerald-500 text-zinc-900 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <CanguroLogo size={32} theme="dark" />
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase">
              Dirección de Talento Humano
            </span>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-8 rounded-2xl shadow-xl max-w-lg w-full border-t-4 border-emerald-500 bg-white text-zinc-900">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
              <CheckCircle size={36} />
            </div>
            
            <div className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-3">
              Enlace de Evaluación Consumido
            </div>

            <h2 className="text-2xl font-bold mb-2">¡Evaluación Enviada Exitosamente!</h2>
            <p className="text-xs leading-relaxed mb-6 text-zinc-600">
              Agradecemos mucho su tiempo y compromiso ético. El instrumento ha sido registrado y bloqueado formalmente en el sistema con marca de tiempo inmutable.
            </p>

            <div className="p-4 rounded-xl text-left text-xs mb-6 space-y-2 border bg-zinc-50 border-zinc-200 text-zinc-700">
              <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-zinc-800/50">
                <span className="font-mono text-zinc-400">Colaborador Evaluado:</span>
                <span className="font-bold text-zinc-900">{displayEmployeeName}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-zinc-800/50">
                <span className="font-mono text-zinc-400">Instrumento:</span>
                <span className="font-bold text-amber-600">{titleMap[type || 'self']}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono text-zinc-400">Fecha de Registro:</span>
                <span className="font-mono text-emerald-600">{new Date(usedDetails.date || formData.submittedAt || Date.now()).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border text-[11px] leading-relaxed mb-5 text-left bg-amber-50 border-amber-200 text-amber-900">
              <span className="font-bold block mb-0.5">🔒 Regla de Uso Único:</span>
              Este enlace ha quedado deshabilitado permanentemente. Por seguridad y rigor de la muestra, no es posible enviar una segunda evaluación desde este enlace.
            </div>

            <p className="text-[11px] text-zinc-400">
              Ya puede cerrar esta pestaña de manera segura.
            </p>
          </div>
        </div>

        <footer className="mt-auto py-4 px-6 text-center text-[10px] font-mono uppercase tracking-wider border-t border-zinc-200 bg-white text-zinc-500">
          DIRECCIÓN DE TALENTO HUMANO • SISTEMA DE GESTIÓN DEL DESEMPEÑO 360° Y 180°
        </footer>
      </div>
    );
  }

  // Pantalla de Bloqueo: Enlace Ya Utilizado Previamente (Regla de Uso Único)
  if ((isAlreadyUsed || formData.isLocked) && !justSubmitted) {
    return (
      <div className="min-h-screen flex flex-col antialiased bg-zinc-100 text-zinc-900">
        <header className="sticky top-0 z-50 py-3 px-4 sm:px-6 shadow-md bg-white/95 border-b-2 border-red-500 text-zinc-900 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <CanguroLogo size={32} theme="dark" />
            <span className="text-xs font-mono font-bold text-red-700 uppercase">
              Dirección de Talento Humano
            </span>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-8 rounded-2xl shadow-xl max-w-lg w-full border-t-4 border-red-500 bg-white text-zinc-900">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-500/20">
              <Lock size={34} />
            </div>
            
            <div className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 mb-3">
              Enlace Inhabilitado • Uso Único
            </div>

            <h2 className="text-2xl font-black mb-2 tracking-tight">
              Enlace de Evaluación Ya Utilizado
            </h2>
            
            <p className="text-xs leading-relaxed mb-6 text-zinc-600">
              Este enlace de evaluación ya fue completado y registrado formalmente en el sistema. Por políticas de confidencialidad, auditoría y rigor metodológico, cada enlace es de <strong>USO ÚNICO</strong> y no se permite enviar dos veces una evaluación desde el mismo enlace.
            </p>

            <div className="p-4 rounded-xl text-left text-xs mb-6 space-y-2 border bg-zinc-50 border-zinc-200 text-zinc-700">
              <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-zinc-800/50">
                <span className="font-mono text-zinc-400">Colaborador Evaluado:</span>
                <span className="font-bold text-zinc-900">{displayEmployeeName}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-zinc-800/50">
                <span className="font-mono text-zinc-400">Cargo / Área:</span>
                <span className="font-medium">{displayPosition} — {displayDepartment}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-zinc-800/50">
                <span className="font-mono text-zinc-400">Instrumento:</span>
                <span className="font-bold text-amber-600">{titleMap[type || 'self']}</span>
              </div>
              {usedDetails.date && (
                <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-zinc-800/50">
                  <span className="font-mono text-zinc-400">Fecha de Recepción:</span>
                  <span className="font-mono text-emerald-600">{new Date(usedDetails.date).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-mono text-zinc-400">Estado del Enlace:</span>
                <span className="font-mono font-bold text-red-600">CERRADO / CONSUMIDO</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border text-[11px] leading-relaxed text-left bg-amber-50/60 border-amber-200/80 text-zinc-600">
              <span className="font-bold text-zinc-800 block mb-1">¿Necesita asistencia?</span>
              Si usted ya completó su evaluación, no requiere realizar ninguna acción adicional. Si considera que este bloqueo se debe a un error técnico, comuníquese con la <strong>Dirección de Talento Humano</strong>.
            </div>
          </div>
        </div>

        <footer className="mt-auto py-4 px-6 text-center text-[10px] font-mono uppercase tracking-wider border-t border-zinc-200 bg-white text-zinc-500">
          DIRECCIÓN DE TALENTO HUMANO • SISTEMA DE GESTIÓN DEL DESEMPEÑO 360° Y 180°
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans flex flex-col antialiased selection:bg-[#F1B400] selection:text-black bg-zinc-100 text-zinc-900">
      {/* Barra Superior Oficial */}
      <header className="sticky top-0 z-50 py-3 px-4 sm:px-6 shadow-md bg-white/95 border-b-2 border-[#F1B400] text-zinc-900 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CanguroLogo size={32} theme="dark" />
            <div className="hidden sm:block">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest block text-amber-800">
                Portal Oficial de Evaluación
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Auto-guardado Local Offline */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono border bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs"
              title="Progreso respaldado automáticamente en su navegador (Offline)"
            >
              <Save size={12} className="text-emerald-500" />
              <span>Guardado Offline {lastSavedTimestamp ? `(${lastSavedTimestamp})` : 'Activo'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Banner de Contexto y Proceso */}
        <div className={`p-5 rounded-2xl border transition-colors duration-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDark 
            ? 'bg-zinc-900/90 border-zinc-800 text-white shadow-md' 
            : 'bg-white border-zinc-200 text-zinc-900 shadow-xs'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs font-mono font-black uppercase tracking-wider ${
                isDark ? 'text-[#F1B400]' : 'text-amber-800'
              }`}>
                {isPromotion ? 'EVALUACIÓN DEL DESEMPEÑO - PROMOCIÓN' : 'EVALUACIÓN DEL DESEMPEÑO'}
              </span>
              {type === 'self' && (
                <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  • ID: {idNumber || displayIdNumber}
                </span>
              )}
            </div>

            <h1 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Colaborador: {displayEmployeeName}
            </h1>

            {isPromotion && (
              <p className={`text-xs mt-1.5 font-bold flex items-center gap-1.5 ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                <Award size={14} /> Cargo Superior Postulado: {targetPosition} (Nivel {targetLevelInfo.level} - {targetLevelInfo.levelName})
              </p>
            )}
          </div>
        </div>

        {/* Recomendaciones y Carta de Honestidad y Objetividad — Solo visible en la Sección 1 en evaluaciones regulares */}
        {(!isPromotion ? currentSection === 1 : true) && (
          <>
            {/* Recomendaciones Oficiales para el Evaluador */}
            <div className={`p-4 border-l-4 border-[#F1B400] rounded-r-2xl text-xs shadow-xs space-y-2 transition-colors duration-200 border-y border-r ${
              isDark 
                ? 'bg-zinc-900/90 text-zinc-200 border-zinc-800' 
                : 'bg-amber-50/90 text-amber-950 border-amber-200/80'
            }`}>
              <div className={`flex items-center gap-2 font-black uppercase text-xs tracking-wide ${
                isDark ? 'text-[#F1B400]' : 'text-amber-900'
              }`}>
                <AlertCircle size={16} className={isDark ? 'text-[#F1B400]' : 'text-[#D99C00]'} /> Recomendaciones para Completar tu Evaluación
              </div>
              <p className={`leading-relaxed text-[11px] text-justify ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Para asegurarte de llenar esta evaluación correctamente, te recomendamos buscar un lugar tranquilo y libre de distracciones donde puedas dedicar entre 15 y 20 minutos sin interrupciones. Antes de comenzar, verifica tu conexión a internet, silencia las notificaciones de tus dispositivos y asegúrate de realizar la evaluación en un momento del día en el que te sientas descansado y con la mente despejada; esto te permitirá leer las instrucciones con calma y responder con total honestidad.
              </p>
            </div>

            {/* Regla de Seguridad y Validez: Enlace de Uso Único */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs transition-colors duration-200 ${
              isDark 
                ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' 
                : 'bg-amber-50/90 border-amber-200 text-amber-950'
            }`}>
              <Lock size={18} className="text-[#F1B400] shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold uppercase tracking-wider block font-mono text-[10px] text-[#F1B400]">
                  Regla de Seguridad Metodológica: Enlace de Uso Único
                </span>
                Este enlace de evaluación es personal, confidencial y de <strong>uso único</strong>. Una vez completado y confirmado el envío mediante el botón oficial, <strong>el enlace quedará permanentemente inhabilitado y no se podrá enviar dos veces una evaluación desde el mismo enlace</strong>. Verifique con atención sus respuestas antes de confirmar.
              </div>
            </div>

            {/* Declaración de Honestidad y Compromiso Ético */}
            <div className="p-4 rounded-2xl border text-xs space-y-2 shadow-xs transition-colors duration-200 bg-white border-zinc-200 text-zinc-900">
              <div className="flex items-center gap-2 font-black uppercase text-xs text-zinc-950">
                <ShieldCheck size={16} className="text-emerald-600" /> Declaración de Honestidad y Objetividad
              </div>
              <p className="leading-relaxed text-[11px] text-zinc-600">
                "Declaro bajo compromiso ético institucional que las valoraciones y comentarios aquí emitidos se fundamentan en hechos objetivos, conductas observadas y resultados demostrables en el período, en apego a los valores de Districueros El Canguro, C.A."
              </p>
              <div className="flex items-center gap-2 pt-2 border-t mt-2 border-zinc-100">
                <input
                  type="checkbox"
                  id="honestyCheck"
                  checked={honestyAccepted}
                  onChange={(e) => setHonestyAccepted(e.target.checked)}
                  className="w-4 h-4 accent-[#F1B400] rounded cursor-pointer"
                />
                <label htmlFor="honestyCheck" className="font-bold cursor-pointer text-[11px] text-zinc-900">
                  He leído las recomendaciones y acepto la Declaración de honestidad y objetividad
                </label>
              </div>
            </div>
          </>
        )}



        {/* -------------------------------------------------------------------------------------- */}
        {/* RENDERIZADO POR MÓDULO: DESEMPEÑO REGULAR VS EVALUACIÓN PARA PROMOCIÓN */}
        {/* -------------------------------------------------------------------------------------- */}
        <div className="space-y-8">
          {/* ==================================================================================== */}
          {/* MÓDULO 2 - ENLACE 1: EVALUACIÓN PARA EL COLABORADOR POSTULADO (CANDIDATO)           */}
          {/* ==================================================================================== */}
          {isPromotionCandidate ? (
            <>
              {/* SECCIÓN 1: EVALUACIÓN DE LIDERAZGO */}
              <div className={`p-5 rounded-2xl border shadow-sm transition-colors duration-200 ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
              }`}>
                <div className={`pb-2 mb-4 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <div className="flex items-center gap-2">
                    <Compass size={18} className="text-[#F1B400]" />
                    <h2 className={`text-sm font-black uppercase tracking-wider font-mono ${
                      isDark ? 'text-white' : 'text-zinc-950'
                    }`}>
                      Sección 1: Evaluación de Liderazgo
                    </h2>
                  </div>
                  <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Cuestionario neutral de 18 reactivos en escala de elección forzada (1 a 5) para medir adaptabilidad, resolución de ambigüedad y potencial de desarrollo.
                  </p>
                </div>
                <PotentialLeadershipEvalForm
                  responses={formData.scores}
                  onChange={(newScores) => setFormData({ ...formData, scores: newScores })}
                  theme={theme}
                />
              </div>

              {/* SECCIÓN 2: TEST BIG 5 (INVENTARIO PSICOMÉTRICO) */}
              <div className={`p-5 rounded-2xl border shadow-sm transition-colors duration-200 ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
              }`}>
                <div className={`pb-2 mb-4 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <div className="flex items-center gap-2">
                    <Brain size={18} className="text-[#F1B400]" />
                    <h2 className={`text-sm font-black uppercase tracking-wider font-mono ${
                      isDark ? 'text-white' : 'text-zinc-950'
                    }`}>
                      Sección 2: Test BIG 5 (Personalidad y Adaptación)
                    </h2>
                  </div>
                  <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Evaluación psicométrica/conductual de 20 reactivos que calibra las 5 dimensiones clave: Apertura, Responsabilidad, Extraversión, Amabilidad y Estabilidad Emocional.
                  </p>
                </div>
                <BigFiveEvalForm
                  responses={formData.scores}
                  onChange={(newScores) => setFormData({ ...formData, scores: newScores })}
                  theme={theme}
                />
              </div>

              {/* SECCIÓN 3: EVALUACIÓN POR COMPETENCIAS (PUESTO DESTINO) */}
              <div className={`p-5 rounded-2xl border shadow-sm transition-colors duration-200 ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
              }`}>
                <div className={`pb-2 mb-4 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <div className="flex items-center gap-2">
                    <Target size={18} className="text-[#F1B400]" />
                    <h2 className={`text-sm font-black uppercase tracking-wider font-mono ${
                      isDark ? 'text-white' : 'text-zinc-950'
                    }`}>
                      Sección 3: Evaluación por Competencias (Puesto Destino: {targetPosition} - Nivel {targetLevelInfo.level})
                    </h2>
                  </div>
                  <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Autopercepción frente a los comportamientos esperados y nivel de dominio requerido para asumir el cargo superior ({targetPosition}).
                  </p>
                </div>
                <SituationalEvalForm
                  title=""
                  questions={competencyQuestions}
                  data={formData}
                  onChange={(d) => setFormData(d)}
                  isSelf={true}
                  theme={theme}
                />
              </div>

              {/* SECCIÓN 4: PREGUNTAS ABIERTAS DE PROYECCIÓN AL CARGO SUPERIOR */}
              <div className={`p-5 rounded-2xl border shadow-sm transition-colors duration-200 space-y-4 ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
              }`}>
                <div className={`pb-2 mb-2 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-[#F1B400]" />
                    <h2 className={`text-sm font-black uppercase tracking-wider font-mono ${
                      isDark ? 'text-white' : 'text-zinc-950'
                    }`}>
                      Sección 4: Proyección y Desafíos para el Cargo Superior
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 uppercase font-mono ${
                      isDark ? 'text-zinc-200' : 'text-zinc-800'
                    }`}>
                      1. Fortalezas que aportaría al cargo de {targetPosition}
                    </label>
                    <textarea
                      value={formData.openAnswers?.strengths || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        openAnswers: { ...(formData.openAnswers || {}), strengths: e.target.value }
                      })}
                      rows={3}
                      className={`w-full p-3.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#F1B400] transition-colors resize-none ${
                        isDark 
                          ? 'bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500' 
                          : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                      }`}
                      placeholder="Describa sus fortalezas técnicas, relacionales y de liderazgo aplicadas al nuevo puesto..."
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 uppercase font-mono ${
                      isDark ? 'text-zinc-200' : 'text-zinc-800'
                    }`}>
                      2. Áreas de oportunidad identificadas y plan para superarlas
                    </label>
                    <textarea
                      value={formData.openAnswers?.improvement_areas || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        openAnswers: { ...(formData.openAnswers || {}), improvement_areas: e.target.value }
                      })}
                      rows={3}
                      className={`w-full p-3.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#F1B400] transition-colors resize-none ${
                        isDark 
                          ? 'bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500' 
                          : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                      }`}
                      placeholder="¿Qué conocimientos, hábitos o habilidades específicas necesitará consolidar para el cargo destino?"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : isPromotionSupervisor ? (
            /* ================================================================================== */
            /* MÓDULO 2 - ENLACE 2: EVALUACIÓN 180° DE PROMOCIÓN (SUPERVISOR INMEDIATO)            */
            /* ================================================================================== */
            <>
              {/* SECCIÓN 1: EVALUACIÓN POR COMPETENCIAS (PUESTO DESTINO) */}
              <div className={`p-5 rounded-2xl border shadow-sm transition-colors duration-200 ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
              }`}>
                <div className={`pb-2 mb-4 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <div className="flex items-center gap-2">
                    <Target size={18} className="text-[#F1B400]" />
                    <h2 className={`text-sm font-black uppercase tracking-wider font-mono ${
                      isDark ? 'text-white' : 'text-zinc-950'
                    }`}>
                      Sección 1: Evaluación por Competencias del Cargo Superior ({targetPosition} - Nivel {targetLevelInfo.level})
                    </h2>
                  </div>
                  <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Califique con objetividad el grado de preparación y frecuencia con la que el colaborador demuestra los comportamientos esperados para el cargo superior {targetPosition}.
                  </p>
                </div>
                <SituationalEvalForm
                  title=""
                  questions={competencyQuestions}
                  data={formData}
                  onChange={(d) => setFormData(d)}
                  isSupervisor={true}
                  theme={theme}
                />
              </div>

              {/* SECCIÓN 2: DICTAMEN CUALITATIVO Y RECOMENDACIÓN DE PROMOCIÓN */}
              <div className={`p-5 rounded-2xl border shadow-sm transition-colors duration-200 space-y-4 ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
              }`}>
                <div className={`pb-2 mb-2 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <h2 className={`text-sm font-black uppercase tracking-wider font-mono ${
                    isDark ? 'text-white' : 'text-zinc-950'
                  }`}>
                    Sección 2: Dictamen de Idoneidad y Recomendación del Supervisor
                  </h2>
                  <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Su valoración como líder directo es fundamental para alimentar el índice de fit y el Plan de Desarrollo Individual (PDI) de Promoción.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 uppercase font-mono ${
                      isDark ? 'text-zinc-200' : 'text-zinc-800'
                    }`}>
                      1. Fortalezas observadas para asumir {targetPosition}
                    </label>
                    <textarea
                      value={formData.openAnswers?.strengths || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        openAnswers: { ...(formData.openAnswers || {}), strengths: e.target.value }
                      })}
                      rows={3}
                      className={`w-full p-3.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#F1B400] transition-colors resize-none ${
                        isDark 
                          ? 'bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500' 
                          : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                      }`}
                      placeholder="Detalle los principales aportes y capacidades que sustentan su postulación..."
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 uppercase font-mono ${
                      isDark ? 'text-zinc-200' : 'text-zinc-800'
                    }`}>
                      2. Brechas críticas a cerrar antes o durante los primeros 90 días en el cargo
                    </label>
                    <textarea
                      value={formData.openAnswers?.opportunities || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        openAnswers: { ...(formData.openAnswers || {}), opportunities: e.target.value }
                      })}
                      rows={3}
                      className={`w-full p-3.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#F1B400] transition-colors resize-none ${
                        isDark 
                          ? 'bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500' 
                          : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                      }`}
                      placeholder="Describa brechas técnicas o conductuales a incluir en su PDI de promoción..."
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 uppercase font-mono ${
                      isDark ? 'text-zinc-200' : 'text-zinc-800'
                    }`}>
                      3. Dictamen y Comentarios Generales de Idoneidad
                    </label>
                    <textarea
                      value={formData.comments || ''}
                      onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                      rows={3}
                      className={`w-full p-3.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#F1B400] transition-colors resize-none ${
                        isDark 
                          ? 'bg-zinc-950 border-zinc-700 text-white placeholder-zinc-500' 
                          : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                      }`}
                      placeholder="Dictamen oficial sobre la preparación del colaborador para asumir la posición..."
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ================================================================================== */
            /* MÓDULO 1: EVALUACIÓN DE DESEMPEÑO REGULAR (90°, 180°, 270°, 360°)                  */
            /* ================================================================================== */
            <>
              {/* ── Indicador de progreso de sección (estilo Google Forms) ── */}
              <div className={`p-4 rounded-2xl border shadow-sm transition-colors duration-200 ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Progreso del formulario
                  </span>
                  <span className={`text-[11px] font-mono font-black ${isDark ? 'text-[#F1B400]' : 'text-amber-700'}`}>
                    Sección {currentSection} de {TOTAL_SECTIONS}
                  </span>
                </div>
                {/* Barra de progreso */}
                <div className={`w-full rounded-full h-1.5 overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                  <div
                    className="bg-[#F1B400] h-full transition-all duration-500 ease-in-out"
                    style={{ width: `${(currentSection / TOTAL_SECTIONS) * 100}%` }}
                  />
                </div>
                {/* Indicadores de sección como puntos */}
                <div className="flex justify-between mt-2">
                  {Array.from({ length: TOTAL_SECTIONS }, (_, i) => i + 1).map((s) => (
                    <div key={s} className="flex flex-col items-center gap-1">
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        s < currentSection
                          ? 'bg-emerald-500'
                          : s === currentSection
                          ? 'bg-[#F1B400] ring-2 ring-[#F1B400]/30 scale-125'
                          : isDark ? 'bg-zinc-700' : 'bg-zinc-300'
                      }`} />
                      <span className={`text-[9px] font-mono ${s === currentSection ? (isDark ? 'text-[#F1B400]' : 'text-amber-700') : isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        S{s}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ==================================================================== */}
              {/* EVALUACIÓN DE DESEMPEÑO REGULAR: 4 SECCIONES OBLIGATORIAS           */}
              {/* Sección 1: Evaluación de Metas                                       */}
              {/* Sección 2: Evaluación por Competencias                               */}
              {/* Sección 3: Potencial y Liderazgo                                     */}
              {/* Sección 4: Evaluación Cualitativa                                    */}
              {/* ==================================================================== */}

              {/* SECCIÓN 1: EVALUACIÓN DE METAS (POR DIRECCIÓN) */}
              {currentSection === 1 && (
                <div className="space-y-4">
                  {renderSection1GoalsForm()}
                </div>
              )}

              {/* SECCIÓN 2: EVALUACIÓN POR COMPETENCIAS */}
              {currentSection === 2 && (
                <div className="p-5 rounded-2xl border shadow-sm transition-colors duration-200 bg-white border-zinc-200 text-zinc-900">
                  <div className="pb-2 mb-4 border-b border-zinc-200">
                    <div className="flex items-center gap-2">
                      <Award size={18} className="text-[#F1B400]" />
                      <h2 className="text-sm font-black uppercase tracking-wider font-mono text-zinc-950">
                        Sección 2: Evaluación por Competencias
                      </h2>
                    </div>
                    <p className="text-[11px] mt-1 text-zinc-500">
                      {isSelf 
                        ? `Autoevaluación de conductas observables cardinales y específicas según el Modelo Oficial de Competencias Canguro (${displayPosition} - ${displayDepartment}).`
                        : `Evaluación objetiva de conductas observables según el Modelo Oficial de Competencias Canguro (${displayPosition} - ${displayDepartment}).`
                      }
                    </p>
                  </div>

                  <SituationalEvalForm
                    title=""
                    questions={competencyQuestions}
                    data={formData}
                    onChange={(d) => setFormData(d)}
                    isSelf={isSelf}
                    isSupervisor={type === 'supervisor'}
                    theme={theme}
                  />
                </div>
              )}

              {/* SECCIÓN 3: POTENCIAL Y LIDERAZGO */}
              {currentSection === 3 && (
                <div className="p-5 rounded-2xl border shadow-sm transition-colors duration-200 bg-white border-zinc-200 text-zinc-900">
                  <div className="pb-2 mb-4 border-b border-zinc-200">
                    <div className="flex items-center gap-2">
                      <Compass size={18} className="text-[#F1B400]" />
                      <h2 className="text-sm font-black uppercase tracking-wider font-mono text-zinc-950">
                        Sección 3: Potencial y Liderazgo
                      </h2>
                    </div>
                    <p className="text-[11px] mt-1 text-zinc-500">
                      Cuestionario neutral de 18 reactivos en escala forzada (1 a 5) para diagnosticar agilidad de aprendizaje, aspiración y movilización de liderazgo en {displayEmployeeName}.
                    </p>
                  </div>
                  <PotentialLeadershipEvalForm
                    responses={formData.scores}
                    onChange={(newScores) => setFormData({ ...formData, scores: newScores })}
                    evaluatorRole={type || 'self'}
                    theme={theme}
                  />
                </div>
              )}

              {/* SECCIÓN 4: EVALUACIÓN CUALITATIVA */}
              {currentSection === 4 && (
                <div className="p-5 rounded-2xl border shadow-sm transition-colors duration-200 space-y-4 bg-white border-zinc-200 text-zinc-900">
                  <div className="pb-2 mb-2 border-b border-zinc-200">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={18} className="text-[#F1B400]" />
                      <h2 className="text-sm font-black uppercase tracking-wider font-mono text-zinc-950">
                        {isSelf ? 'Sección 4: Autopercepción y Evaluación Cualitativa' : 'Sección 4: Evaluación Cualitativa y Observaciones'}
                      </h2>
                    </div>
                    <p className="text-[11px] mt-1 text-zinc-500">
                      {isSelf 
                        ? 'Comparta sus reflexiones sobre fortalezas demostradas, oportunidades de desarrollo identificadas y retos personales.'
                        : 'Aporte observaciones fundamentadas sobre fortalezas observadas, oportunidades de mejora y retos previstos del colaborador.'
                      }
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 uppercase font-mono text-zinc-800">
                        {isSelf ? 'Fortalezas Principales Demostradas' : 'Fortalezas Observadas en el Desempeño'}
                      </label>
                      <textarea
                        value={formData.openAnswers?.strengths || formData.openAnswers?.ci_recognition || formData.openAnswers?.op_recognition || formData.openAnswers?.cp_recognition || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          openAnswers: { 
                            ...(formData.openAnswers || {}), 
                            strengths: e.target.value,
                            ci_recognition: e.target.value,
                            op_recognition: e.target.value,
                            cp_recognition: e.target.value
                          }
                        })}
                        rows={3}
                        className="w-full p-3.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#F1B400] transition-colors resize-none bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400"
                        placeholder={isSelf ? "Describa conductas o logros destacados donde considere que aportó el mayor valor..." : "Describa conductas observables donde el colaborador haya generado alto impacto..."}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1.5 uppercase font-mono text-zinc-800">
                        {isSelf ? 'Oportunidades de Desarrollo' : 'Oportunidades de Mejora y Brechas'}
                      </label>
                      <textarea
                        value={formData.openAnswers?.opportunities || formData.openAnswers?.improvement_areas || formData.openAnswers?.ci_commitments || formData.openAnswers?.op_commitments || formData.openAnswers?.cp_commitments || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          openAnswers: { 
                            ...(formData.openAnswers || {}), 
                            opportunities: e.target.value,
                            improvement_areas: e.target.value,
                            ci_commitments: e.target.value,
                            op_commitments: e.target.value,
                            cp_commitments: e.target.value
                          }
                        })}
                        rows={3}
                        className="w-full p-3.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#F1B400] transition-colors resize-none bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400"
                        placeholder={isSelf ? "¿Qué habilidades, conocimientos o hábitos considera prioritario fortalecer?" : "Describa brechas específicas que ameriten acompañamiento o tutoría en su PDI..."}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1.5 uppercase font-mono text-zinc-800">
                        {isSelf ? 'Próximos Retos Personales y Metas de Aprendizaje' : 'Próximos Retos y Proyectos Prioritarios'}
                      </label>
                      <textarea
                        value={formData.openAnswers?.upcoming_challenges || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          openAnswers: { 
                            ...(formData.openAnswers || {}), 
                            upcoming_challenges: e.target.value 
                          }
                        })}
                        rows={3}
                        className="w-full p-3.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#F1B400] transition-colors resize-none bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400"
                        placeholder={isSelf ? "Describa proyectos o desafíos que le gustaría asumir para su crecimiento..." : "Describa los retos clave, proyectos prioritarios y metas de desarrollo..."}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1.5 uppercase font-mono text-zinc-800">
                        {isSelf ? 'Observaciones Adicionales' : 'Observaciones Finales del Evaluador'}
                      </label>
                      <textarea
                        value={formData.comments || ''}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        rows={3}
                        className="w-full p-3.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#F1B400] transition-colors resize-none bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400"
                        placeholder={isSelf ? "Comentarios finales sobre el proceso de autoevaluación..." : "Comentarios adicionales sobre el desempeño en el período..."}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Botones de navegación entre secciones (estilo Google Forms) ── */}
              <div className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors duration-200 ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
              }`}>
                {/* Botón Atrás */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentSection(s => Math.max(1, s - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentSection === 1}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider font-mono transition-all ${
                    currentSection === 1
                      ? isDark ? 'opacity-30 cursor-not-allowed text-zinc-600' : 'opacity-30 cursor-not-allowed text-zinc-400'
                      : isDark
                      ? 'bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95 cursor-pointer'
                      : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 active:scale-95 cursor-pointer'
                  }`}
                >
                  ← Atrás
                </button>

                {/* Indicador central */}
                <span className={`text-[11px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Sección {currentSection} de {TOTAL_SECTIONS}
                </span>

                {/* Botón Siguiente o Enviar */}
                {currentSection < TOTAL_SECTIONS ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentSection(s => Math.min(TOTAL_SECTIONS, s + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider font-mono bg-[#F1B400] text-black hover:bg-[#D99C00] active:scale-95 cursor-pointer transition-all shadow-md"
                  >
                    Siguiente →
                  </button>
                ) : null}
              </div>
            </>
          )}

          {/* Único Botón de Envío Oficial — solo visible en la última sección del módulo regular, o siempre para evaluaciones de promoción */}
          {(!isPromotion ? currentSection === TOTAL_SECTIONS : true) && (<div className={`p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left transition-colors duration-200 ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div>
              <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Confirmación de Envío Inmutable (Uso Único)
              </span>
              <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Al presionar enviar, el instrumento se bloqueará de forma irreversible y este enlace quedará deshabilitado permanentemente. No se admiten reenvíos.
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleSave}
                disabled={!honestyAccepted || isSubmitting || isAlreadyUsed || formData.isLocked}
                className={`px-6 py-3 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                  honestyAccepted && !isSubmitting && !isAlreadyUsed && !formData.isLocked
                    ? 'bg-[#F1B400] text-black hover:bg-[#D99C00] active:scale-95 shadow-amber-500/10'
                    : (isDark ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700/50' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed')
                }`}
              >
                <Save size={15} />
                <span>{isSubmitting ? 'Registrando Envío Oficial...' : 'Confirmar y Enviar Evaluación'}</span>
              </button>
            </div>
          </div>
          )}
        </div>
      </main>

      {/* Official Footer */}
      <footer className="mt-8 py-4 px-6 text-center text-[10px] font-mono uppercase tracking-wider border-t border-zinc-200 bg-white text-zinc-500">
        DIRECCIÓN DE TALENTO HUMANO • SISTEMA DE GESTIÓN DEL DESEMPEÑO 360° Y 180°
      </footer>
    </div>
  );
}

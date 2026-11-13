import React, { useState, useEffect, useRef } from 'react';
import { AppState, EmployeeInfo, MERIT_TIERS, MeritTier } from '../types';
import { CANGURO_COLLABORATORS, CanguroCollaborator, SUCCESSION_CRITICAL_POSITIONS, getSavedPilotEvaluation, savePilotEvaluation, clearPilotEvaluation } from '../data/canguroUniverso';
import { calculateConsolidatedMetrics, extractAverage } from '../utils/realEvaluationMetrics';
import { CanguroLogo } from './CanguroLogo';
import { EvaluationProfileConfig } from './EvaluationProfileConfig';
import { PilotEvaluationModal } from './PilotEvaluationModal';
import { NormalCurve } from './NormalCurve';
import { NineBox } from './NineBox';
import { RadarMetrics } from './RadarMetrics';
import { PDI } from './PDI';
import { AuditEvaluationsViewer } from './AuditEvaluationsViewer';
import { EvaluationAuditView } from './EvaluationAuditView';
import { PromotionResultsView } from './PromotionResultsView';
import { PromotionPhasesManagerModal } from './PromotionPhasesManagerModal';
import { CompetencyHeatmap } from './CompetencyHeatmap';
import { OrganizationalDashboard } from './OrganizationalDashboard';
import { PromotionsDashboard } from './PromotionsDashboard';
import { SuccessionBankView } from './SuccessionBankView';
import { EvaluationHubHome } from './EvaluationHubHome';
import { PotentialLeadershipDashboard } from './PotentialLeadershipDashboard';
import { ExecutiveTalentDashboard } from './ExecutiveTalentDashboard';
import { PeopleAnalyticsEducationDashboard } from './PeopleAnalyticsEducationDashboard';
import { CompetencyGapAnalysisChart } from './CompetencyGapAnalysisChart';
import { calculatePotentialLeadershipScores } from '../data/potentialLeadershipQuestions';
import { resolvePositionManagementLevel, resolveEmployeeCompetencyProfile, CANGURO_GENERAL_LEVELS, CompetencyLevelLetter } from '../data/canguroCompetencyDictionary';
import { PsychometricDossierVisualizer } from './PsychometricDossierVisualizer';
import { resolveOrCreatePromotionDossier } from '../utils/promotionDefaults';
import { DatabaseStatusModal } from './DatabaseStatusModal';
import { getCurrentSession, AuthenticatedUser, logoutSession, canConfigureEvaluations, canViewAllCompanyResults, canViewDirectionResults, isMasterAdministrator } from '../services/authService';
import { PerformanceEvaluationConfigView } from './PerformanceEvaluationConfigView';
import { UserPasswordRecoveryModule } from './UserPasswordRecoveryModule';
import {
  Menu, X, ArrowLeft, UserCircle, Settings, Send, LayoutDashboard,
  ShieldCheck, Activity, Award, Star, AlertTriangle, AlertCircle, CheckCircle, CheckCircle2,
  Building2, ChevronDown, ChevronRight, Lock, Users, Sparkles, Brain,
  Download, Printer, Compass, Lightbulb, BarChart3, Flame, Target, Home,
  MessageSquare, Save, TrendingUp, Search, Bell, ExternalLink, Layers,
  ChevronLeft, LayoutGrid, Briefcase, ArrowRight, GraduationCap, Database, LogIn, LogOut, Sliders, FileSpreadsheet, KeyRound
} from 'lucide-react';

interface AdminComparisonModuleProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
}

export function AdminComparisonModule({ state, onUpdateState }: AdminComparisonModuleProps) {
  // Navigation State
  const [currentStage, setCurrentStage] = useState<'inicio' | 'config' | 'config_desempeno' | 'config_promocion' | 'recuperacion_clave' | 'links' | 'expediente' | 'audit'>('inicio');
  const [currentBlock, setCurrentBlock] = useState<'dashboard_ejecutivo' | 'organizacional' | 'dashboard_promociones' | 'banco_sucesores' | 'people_analytics_educacion' | 'resumen' | 'promocion' | 'calibracion' | 'pdi' | 'evaluaciones' | 'sucesion'>('organizacional');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [competencyVisualMode, setCompetencyVisualMode] = useState<'gaps' | 'domain' | 'radar' | 'all'>('gaps');
  // Navegación por secciones dentro de los resultados individuales (Cero Scroll)
  const [individualActiveSection, setIndividualActiveSection] = useState<'desempeno' | 'potencial' | 'ninebox' | 'calibracion' | 'pdi' | 'all'>('desempeno');

  // Estados para el menú de Dashboard y Detalle Operativo
  const [isDetalleOperativoOpen, setIsDetalleOperativoOpen] = useState(false);
  const [orgDashboardMode, setOrgDashboardMode] = useState<'executive_integrated' | 'operational_sections'>('executive_integrated');
  const [orgDashboardSection, setOrgDashboardSection] = useState<'general' | 'promedios_cargo' | 'analitica' | 'ranking' | 'nivel_academico'>('general');

  // Estados para el menú desplegable anidado de Perfil del Colaborador
  const [isPerfilColaboradorOpen, setIsPerfilColaboradorOpen] = useState(true);
  const [isResultadosDesempenoOpen, setIsResultadosDesempenoOpen] = useState(true);
  const [isResultadosPromocionOpen, setIsResultadosPromocionOpen] = useState(false);
  const [promotionActiveSection, setPromotionActiveSection] = useState<'all' | 'brechas' | 'ninebox_promocion' | 'bigfive' | 'impresion_pdf'>('brechas');

  // Estado dinámico de fases desplegables (Acordeón)
  const [openPhases, setOpenPhases] = useState<{ [key: string]: boolean }>({
    fase1: true,
    fase2: true,
    fase3: true,
    fasePromocion: true,
  });

  const togglePhase = (phaseKey: string) => {
    setOpenPhases(prev => ({ ...prev, [phaseKey]: !prev[phaseKey] }));
  };

  // Manual admin notes
  const [adminNotesText, setAdminNotesText] = useState(state.adminNotes || '');
  const [notesSaved, setNotesSaved] = useState(false);

  // Dedicated state for configuring evaluations and dispatching links
  // COMPLETELY DECOUPLED from the individual results database/profile
  const [evaluationConfigDraft, setEvaluationConfigDraft] = useState<EmployeeInfo>(() => {
    return state.evaluationSetupInfo || {
      firstName: '',
      lastName: '',
      idNumber: '',
      position: 'Coordinador',
      department: 'Gerencia de Operaciones',
      directorate: 'Dirección de Operaciones',
      headcountArea: 'Retail',
      email: '',
      supervisorName: '',
      supervisorEmail: '',
      peerName: '',
      peerEmail: '',
      subordinateName: '',
      subordinateEmail: '',
      startDate: '2026-01-15'
    };
  });

  // Cédula direct search state
  const [idNumberSearch, setIdNumberSearch] = useState('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Tab navigation history (to support the reactive "Volver a pestaña anterior" button)
  const [tabHistory, setTabHistory] = useState<Array<{ stage: string; block?: string }>>([]);

  // Selected collaborator from national database or custom
  const [selectedCollabId, setSelectedCollabId] = useState<string>(CANGURO_COLLABORATORS[0].info.id || 'emp-001');

  // Pilot evaluation modal state (Prueba Piloto)
  const [pilotModalOpen, setPilotModalOpen] = useState(false);

  // Promotion modal state
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);

  // Successor modal or filter
  const [selectedCriticalPos, setSelectedCriticalPos] = useState<string | null>(null);

  // Notifications dropdown state
  const [showNotifications, setShowNotifications] = useState(false);

  // Database status modal state
  const [showDbModal, setShowDbModal] = useState(false);

  // Authentication & Active User state (Login: Usuario = Cédula, Password = Cédula)
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() => getCurrentSession());
  const isMaster = isMasterAdministrator(currentUser);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'gestor' || isMaster;

  useEffect(() => {
    const handleAuthChange = (e: any) => {
      setCurrentUser(e.detail || null);
    };
    window.addEventListener('canguro_auth_change', handleAuthChange);
    return () => window.removeEventListener('canguro_auth_change', handleAuthChange);
  }, []);

  // Seguridad y Control de Acceso: Colaboradores no administradores solo tienen acceso a inicio (cuadrantes) y a su expediente personal
  useEffect(() => {
    if (currentUser && !isAdmin) {
      if (currentStage !== 'inicio' && currentStage !== 'expediente') {
        setCurrentStage('inicio');
      }
      if (currentStage === 'expediente' && (currentBlock === 'organizacional' || currentBlock === 'banco_sucesores' || currentBlock === 'people_analytics_educacion')) {
        setCurrentBlock('resumen');
      }
    }
  }, [currentUser, isAdmin, currentStage, currentBlock]);

  // Track previous navigation on change
  const navigateTo = (
    stage: 'inicio' | 'config' | 'config_desempeno' | 'config_promocion' | 'recuperacion_clave' | 'links' | 'expediente' | 'audit', 
    block?: 'dashboard_ejecutivo' | 'organizacional' | 'dashboard_promociones' | 'banco_sucesores' | 'people_analytics_educacion' | 'resumen' | 'promocion' | 'calibracion' | 'pdi' | 'evaluaciones' | 'sucesion',
    subSection?: 'desempeno' | 'potencial' | 'ninebox' | 'calibracion' | 'pdi' | 'all'
  ) => {
    setTabHistory(prev => [...prev, { stage: currentStage, block: currentBlock }]);
    setCurrentStage(stage);
    if (subSection) {
      setIndividualActiveSection(subSection);
      if (subSection === 'desempeno') setOpenPhases(prev => ({ ...prev, fase1: true }));
      if (subSection === 'calibracion') setOpenPhases(prev => ({ ...prev, fase2: true }));
      if (subSection === 'pdi') setOpenPhases(prev => ({ ...prev, fase3: true }));
    }
    if (block) {
      if (block === 'people_analytics_educacion') {
        setCurrentBlock('people_analytics_educacion');
      } else if (block === 'calibracion') {
        setCurrentBlock('resumen');
        setIndividualActiveSection('calibracion');
        setOpenPhases(prev => ({ ...prev, fase2: true }));
      } else if (block === 'pdi') {
        setCurrentBlock('pdi');
        setIndividualActiveSection('pdi');
        setOpenPhases(prev => ({ ...prev, fase3: true }));
      } else if (block === 'promocion') {
        setCurrentBlock('promocion');
        setOpenPhases(prev => ({ ...prev, fasePromocion: true }));
      } else if (block === 'resumen') {
        setCurrentBlock('resumen');
        if (subSection) {
          setIndividualActiveSection(subSection);
        }
      } else {
        setCurrentBlock(block);
      }
    }
    setSidebarOpen(false);
  };

  const handleBackNavigation = () => {
    if (tabHistory.length > 0) {
      const prev = tabHistory[tabHistory.length - 1];
      setTabHistory(hist => hist.slice(0, hist.length - 1));
      setCurrentStage(prev.stage as any);
      if (prev.block) setCurrentBlock(prev.block as any);
    } else {
      // Default to expediente
      setCurrentStage('expediente');
      setCurrentBlock('resumen');
    }
  };

  // Helper to extract clean digits from any ID or cedula string
  const extractDigits = (val: string) => (val || '').replace(/\D/g, '');

  // Sync collaborator selection with state
  const handleSelectCollaborator = (collabId: string): boolean => {
    if (collabId === '__ALL__') {
      setSelectedCollabId('__ALL__');
      setCurrentStage('expediente');
      setCurrentBlock('organizacional');
      return true;
    }
    
    if (currentBlock === 'organizacional' || currentBlock === 'banco_sucesores') {
      setCurrentBlock('resumen');
    }

    const rawQuery = (collabId || '').trim().toLowerCase();
    const queryDigits = extractDigits(collabId);
    const cleanQuery = rawQuery.replace(/[\.\s-]/g, '').replace(/^v/, '').replace(/^emp/, '');

    const target = CANGURO_COLLABORATORS.find(c => {
      // 1. Direct ID match (e.g. emp-27309420 === emp-27309420)
      if (c.info.id === collabId) return true;
      if (c.info.idNumber === collabId) return true;

      // 2. Numeric match (cédula digits: e.g. 27309420)
      const cDigits = extractDigits(c.info.idNumber);
      if (queryDigits && cDigits && (cDigits === queryDigits || cDigits.includes(queryDigits))) {
        return true;
      }

      // 3. String match on clean cédula or ID
      const cIdClean = (c.info.id || '').toLowerCase().replace(/[\.\s-]/g, '').replace(/^emp/, '');
      const cNumClean = (c.info.idNumber || '').toLowerCase().replace(/[\.\s-]/g, '').replace(/^v/, '');
      if (cIdClean === cleanQuery || cNumClean === cleanQuery || cNumClean.includes(cleanQuery)) {
        return true;
      }

      // 4. Name match (e.g. Cristina, Fuentes)
      const fullName = `${c.info.firstName} ${c.info.lastName}`.toLowerCase();
      if (rawQuery.length >= 3 && fullName.includes(rawQuery)) {
        return true;
      }

      return false;
    });

    if (target) {
      setSelectedCollabId(target.info.id);
      const savedPilot = getSavedPilotEvaluation(target.info.id);
      const effectiveSelfEval = savedPilot?.selfEval || target.selfEval;
      const effectiveSupEval = savedPilot?.supervisorEval || target.supervisorEval;
      const effectivePeerEval = savedPilot?.peerEval || target.peerEval;
      const effectiveSubEval = savedPilot?.subordinateEval || target.subordinateEval || state.subordinateEval;
      const effectiveGoals = savedPilot?.pdiGoals || target.pdiGoals || [];
      const effectiveBreaches = savedPilot?.pdiBreaches || target.pdiBreaches || [];
      const effectiveDossier = savedPilot?.promotionDossier !== undefined ? savedPilot?.promotionDossier : target.promotionDossier;

      onUpdateState({
        ...state,
        employeeName: `${target.info.firstName} ${target.info.lastName}`,
        employeeInfo: { ...target.info },
        selfEval: effectiveSelfEval,
        supervisorEval: effectiveSupEval,
        peerEval: effectivePeerEval,
        subordinateEval: effectiveSubEval,
        pdiGoals: effectiveGoals,
        pdiBreaches: effectiveBreaches,
        riasecProfile: target.riasecProfile,
        promotionDossier: effectiveDossier
      });
      return true;
    }
    return false;
  };

  const handleSearchByCedulaSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!idNumberSearch.trim()) return;

    const success = handleSelectCollaborator(idNumberSearch.trim());
    if (success) {
      setSearchFeedback(`Colaborador cargado con éxito.`);
      setTimeout(() => setSearchFeedback(null), 3000);
    } else {
      setSearchFeedback('No se encontró colaborador con esa cédula o nombre.');
      setTimeout(() => setSearchFeedback(null), 3500);
    }
  };

  // Calculate official consolidated metrics
  const positionsWithSubordinates = ['Coordinador', 'Supervisor', 'Gerente', 'Director'];
  const hasSubordinates = positionsWithSubordinates.includes(state.employeeInfo.position);

  const metrics = calculateConsolidatedMetrics(
    state.selfEval,
    state.supervisorEval,
    state.peerEval,
    state.subordinateEval,
    hasSubordinates
  );

  // STRICT GOVERNANCE RULE:
  // Succession Block is enabled ONLY if the collaborator qualified in Tramo 5: Desempeño Sobresaliente (>= 4.75 pts)
  const isSuccessionEligible = metrics.enablesSuccession && metrics.finalScore >= 4.75;
  const hasPromotionDossier = Boolean(
    state.promotionDossier &&
    (state.promotionDossier.phase3?.finalScore || state.promotionDossier.phase1?.completed)
  );

  // Cálculo de Resultados de Potencial y Liderazgo (Sección 3 - Eje Y de la 9-Box)
  const combinedScoresForPotential: Record<string, number> = {
    ...(state.selfEval?.scores || {}),
    ...(state.supervisorEval?.scores || {}),
    ...(state.peerEval?.scores || {}),
    ...(state.subordinateEval?.scores || {}),
    ...(state.promotionEval?.scores || {})
  };
  const potentialLeadershipResults = calculatePotentialLeadershipScores(combinedScoresForPotential);
  const effectivePotentialScore = potentialLeadershipResults.answeredCount > 0
    ? potentialLeadershipResults.yScore
    : (metrics.isEvaluated ? metrics.block2Score : 3.5);

  // REGLA DE ELEGIBILIDAD PARA CONCURSO DE PROMOCIÓN (9-BOX GRID):
  // Habilitado ÚNICAMENTE si Eje X >= 2 (>= 3.00 pts) y Eje Y >= 2 (>= 2.50 pts)
  const isPromotionEligible = metrics.isEvaluated && (metrics.block1Score >= 3.00) && (effectivePotentialScore >= 2.50);

  // Helper to get active collaborator object for Pilot Evaluation
  const currentActiveCollab: CanguroCollaborator = React.useMemo(() => {
    const found = CANGURO_COLLABORATORS.find(c => c.info.id === selectedCollabId || c.info.idNumber === state.employeeInfo.idNumber);
    if (found) {
      return {
        ...found,
        selfEval: state.selfEval,
        supervisorEval: state.supervisorEval,
        peerEval: state.peerEval,
        subordinateEval: state.subordinateEval,
        pdiGoals: state.pdiGoals || [],
        pdiBreaches: state.pdiBreaches || [],
        promotionDossier: state.promotionDossier
      };
    }
    return {
      info: state.employeeInfo,
      selfEval: state.selfEval,
      supervisorEval: state.supervisorEval,
      peerEval: state.peerEval,
      subordinateEval: state.subordinateEval,
      pdiGoals: state.pdiGoals || [],
      pdiBreaches: state.pdiBreaches || [],
      riasecProfile: state.riasecProfile || {
        realistic: 75,
        investigative: 80,
        artistic: 40,
        social: 85,
        enterprising: 70,
        conventional: 85,
        topMotivators: ['Estabilidad Laboral', 'Crecimiento Profesional', 'Calidad en el Servicio'],
        careerAspirations: 'Consolidar mi trayectoria dentro de DISTRICUEROS EL CANGURO, C.A.',
        legacyVision: 'Contribuir al liderazgo y eficiencia de la empresa como referente nacional.'
      },
      promotionDossier: state.promotionDossier
    };
  }, [selectedCollabId, state]);

  const handlePilotSaveSuccess = (updatedCollab: CanguroCollaborator) => {
    onUpdateState({
      ...state,
      selfEval: updatedCollab.selfEval,
      supervisorEval: updatedCollab.supervisorEval,
      peerEval: updatedCollab.peerEval,
      subordinateEval: updatedCollab.subordinateEval,
      pdiBreaches: updatedCollab.pdiBreaches || state.pdiBreaches,
      pdiGoals: updatedCollab.pdiGoals || state.pdiGoals,
      promotionDossier: updatedCollab.promotionDossier !== undefined ? updatedCollab.promotionDossier : state.promotionDossier
    });
  };

  // Ensure first collaborator is loaded on initial mount if state is empty
  useEffect(() => {
    if (!state.employeeInfo.idNumber && CANGURO_COLLABORATORS.length > 0) {
      handleSelectCollaborator(CANGURO_COLLABORATORS[0].info.id);
    }
  }, []);

  // Auto-switch away from succession if employee changes to non-eligible
  useEffect(() => {
    if (currentBlock === 'sucesion' && !isSuccessionEligible) {
      setCurrentBlock('resumen');
    }
  }, [isSuccessionEligible, currentBlock]);

  // Organizational, Directorate and Peer benchmarks computation
  const benchmarks = React.useMemo(() => {
    const allFinalScores: number[] = [];
    const dirFinalScores: number[] = [];
    const peerFinalScores: number[] = [];
    const currentDir = state.employeeInfo.directorate;
    const currentPos = state.employeeInfo.position;
    const currentId = state.employeeInfo.id;
    const currentDigits = (state.employeeInfo.idNumber || '').replace(/\D/g, '');

    CANGURO_COLLABORATORS.forEach(c => {
      // Excluir al propio colaborador evaluado para no sesgar el promedio de sus pares
      const cDigits = (c.info.idNumber || '').replace(/\D/g, '');
      if (c.info.id === currentId || (currentDigits && cDigits === currentDigits)) return;

      const savedPilot = getSavedPilotEvaluation(c.info.id) || (c.info.idNumber ? getSavedPilotEvaluation(c.info.idNumber) : null);
      const effectiveSelf = savedPilot?.selfEval || c.selfEval;
      const effectiveSup = savedPilot?.supervisorEval || c.supervisorEval;
      const effectivePeer = savedPilot?.peerEval || c.peerEval;
      const effectiveSub = savedPilot?.subordinateEval || c.subordinateEval;

      const hasSubs = positionsWithSubordinates.includes(c.info.position);
      const m = calculateConsolidatedMetrics(effectiveSelf, effectiveSup, effectivePeer, effectiveSub, hasSubs);
      if (m.isEvaluated && m.finalScore > 0) {
        allFinalScores.push(m.finalScore);
        if (c.info.directorate === currentDir) {
          dirFinalScores.push(m.finalScore);
        }
        if (c.info.position === currentPos) {
          peerFinalScores.push(m.finalScore);
        }
      }
    });

    const orgAvg = allFinalScores.length > 0 
      ? Number((allFinalScores.reduce((acc, curr) => acc + curr, 0) / allFinalScores.length).toFixed(2)) 
      : 3.90;

    const dirAvg = dirFinalScores.length > 0 
      ? Number((dirFinalScores.reduce((acc, curr) => acc + curr, 0) / dirFinalScores.length).toFixed(2)) 
      : (orgAvg > 0 ? orgAvg : 3.85);

    // Promedio de pares del mismo cargo (si aún están en proceso en la prueba piloto, tomamos la referencia estándar institucional de 3.74 pts / 74.8%)
    const peerAvg = peerFinalScores.length > 0
      ? Number((peerFinalScores.reduce((acc, curr) => acc + curr, 0) / peerFinalScores.length).toFixed(2))
      : 3.74;

    const peersCount = peerFinalScores.length > 0
      ? peerFinalScores.length
      : CANGURO_COLLABORATORS.filter(c => c.info.position === currentPos && c.info.id !== currentId).length || 8;

    return {
      organizationAvg: orgAvg,
      directorateAvg: dirAvg,
      mediaScore: orgAvg,
      medianaScore: orgAvg,
      peersAvg: peerAvg,
      peersCount: peersCount
    };
  }, [state.employeeInfo.directorate, state.employeeInfo.position, state.employeeInfo.id, state]);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 font-sans flex flex-col antialiased selection:bg-[#F1B400] selection:text-black">
      {/* 1. TOP BAR — INSTITUTIONAL HEADER & USER CONTEXT */}
      <header className="bg-zinc-950 text-white border-b-2 border-[#F1B400] sticky top-0 z-40 shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button - Exclusivo Administrador */}
            {isAdmin && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 rounded-lg bg-zinc-900 text-[#F1B400] border border-zinc-800 hover:bg-zinc-800"
                title="Abrir Menú"
              >
                <Menu size={18} />
              </button>
            )}

            {/* Logo */}
            <CanguroLogo size={34} theme="gold" />
          </div>

          {/* Central Context Label */}
          <div className="hidden md:flex flex-col items-center text-center">
            <span className="text-[10px] font-mono tracking-widest text-[#F1B400] uppercase font-bold">
              Plataforma Oficial de Evaluación del Desempeño y Talento Humano
            </span>
            <span className="text-[11px] text-zinc-300 font-medium">
              Sistema Integral de Evaluación por Competencias
            </span>
          </div>

          {/* Right User & Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Database Service Status Button - Exclusivo Administrador */}
            {isAdmin && (
              <button
                onClick={() => setShowDbModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#F1B400]/60 hover:bg-zinc-850 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Base de Datos de Colaboradores (Carga de Plantilla Excel y Vinculación con Organigrama)"
              >
                <FileSpreadsheet size={15} className="text-[#F1B400] shrink-0" />
                <span className="hidden sm:inline text-[11px] font-mono font-bold">Base de Datos</span>
              </button>
            )}

            {/* Acceso Rápido: Recuperación de Claves (Usuario Maestro / Admin) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigateTo('recuperacion_clave')}
                className={`px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  currentStage === 'recuperacion_clave'
                    ? 'bg-[#F1B400] text-black border-[#F1B400] font-black'
                    : 'bg-zinc-900 border-zinc-800 hover:border-amber-400 hover:bg-zinc-850 text-zinc-300 hover:text-amber-400'
                }`}
                title="Recuperación y Reinicio de Contraseñas de Colaboradores (Usuario Maestro)"
              >
                <KeyRound size={15} className={currentStage === 'recuperacion_clave' ? 'text-black' : 'text-[#F1B400] shrink-0'} />
                <span className="hidden md:inline text-[11px] font-mono font-bold">Recuperar Clave</span>
              </button>
            )}

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 text-zinc-300 hover:text-[#F1B400] transition-colors rounded-full hover:bg-zinc-800"
              >
                <Bell size={20} />
                {(state.notifications?.filter(n => !n.read).length || 0) > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {state.notifications!.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 sm:w-[440px] bg-white border border-zinc-200 rounded-xl shadow-2xl z-50 text-zinc-800 overflow-hidden">
                  <div className="bg-zinc-950 text-white px-4 py-3 flex justify-between items-center border-b border-[#F1B400]/40">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-[#F1B400]" />
                      <h3 className="font-black text-xs uppercase tracking-wider">
                        Notificaciones de Evaluaciones
                      </h3>
                      {(state.notifications || []).filter(n => !n.read).length > 0 && (
                        <span className="text-[10px] bg-[#F1B400] text-black font-bold px-1.5 py-0.2 rounded-full font-mono">
                          {(state.notifications || []).filter(n => !n.read).length}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        const newNotes = (state.notifications || []).map(n => ({...n, read: true}));
                        onUpdateState({...state, notifications: newNotes});
                      }}
                      className="text-xs text-[#F1B400] font-bold hover:underline"
                    >
                      Marcar todo leído
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-zinc-100">
                    {(!state.notifications || state.notifications.length === 0) ? (
                      <div className="p-6 text-center text-zinc-500 text-sm flex flex-col items-center justify-center py-10">
                        <Bell className="text-zinc-300 mb-2" size={28} />
                        <span className="font-semibold text-zinc-700">No hay notificaciones nuevas</span>
                        <span className="text-xs text-zinc-400 mt-1">Las evaluaciones entregadas aparecerán aquí en tiempo real.</span>
                      </div>
                    ) : (
                      (state.notifications || []).map((n, i) => {
                        // Determinar tipo de evaluación
                        const msgLower = (n.message || '').toLowerCase();
                        const evalType = n.evaluationType || (
                          msgLower.includes('auto') ? 'Autoevaluación' :
                          msgLower.includes('supervisor') ? 'Evaluación del Supervisor' :
                          msgLower.includes('par') ? 'Evaluación de Pares' :
                          msgLower.includes('subordinado') ? 'Evaluación de Subordinados' :
                          'Evaluación Entregada'
                        );

                        // Estilo cromático oficial según tipo
                        const typeBadgeStyle = 
                          evalType === 'Autoevaluación' 
                            ? 'bg-amber-100 text-amber-950 border-amber-300' 
                            : evalType === 'Evaluación del Supervisor'
                            ? 'bg-blue-100 text-blue-950 border-blue-300'
                            : evalType === 'Evaluación de Pares'
                            ? 'bg-teal-100 text-teal-950 border-teal-300'
                            : 'bg-purple-100 text-purple-950 border-purple-300';

                        // Quien llenó la evaluación
                        const whoFilled = n.evaluatorName 
                          ? `${n.evaluatorName}${n.evaluatorPosition ? ` • ${n.evaluatorPosition}` : ''}`
                          : (n.evaluatorPosition || 'Evaluador');

                        return (
                          <div 
                            key={n.id || i} 
                            className={`p-3.5 transition-colors ${!n.read ? 'bg-amber-50/70 border-l-4 border-l-[#F1B400]' : 'bg-white hover:bg-zinc-50'}`}
                          >
                            <div className="flex gap-2.5 items-start">
                              <div className="mt-0.5 p-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0 shadow-2xs">
                                <CheckCircle size={14} />
                              </div>
                              <div className="flex-1 space-y-1.5 min-w-0">
                                {/* Encabezado: Tipo de evaluación + Fecha */}
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${typeBadgeStyle}`}>
                                    {evalType}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                                    {new Date(n.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                  </span>
                                </div>

                                {/* Quien llenó la evaluación (Nombre o Cargo) */}
                                <div className="text-xs text-zinc-900 leading-snug">
                                  <span className="text-zinc-500 font-medium">Llenada por: </span>
                                  <strong className="text-zinc-950 font-bold">{n.evaluatorName || whoFilled}</strong>
                                  {n.evaluatorPosition && n.evaluatorName !== n.evaluatorPosition && (
                                    <span className="text-zinc-600 font-medium text-[11px] ml-1">
                                      ({n.evaluatorPosition})
                                    </span>
                                  )}
                                </div>

                                {/* Colaborador Evaluado */}
                                {n.evaluatedEmployeeName && (
                                  <div className="text-[11px] text-zinc-600">
                                    <span className="text-zinc-500">Evaluado: </span>
                                    <span className="font-semibold text-zinc-800">{n.evaluatedEmployeeName}</span>
                                    {n.evaluatedEmployeePosition && (
                                      <span className="text-zinc-500 ml-1">({n.evaluatedEmployeePosition})</span>
                                    )}
                                  </div>
                                )}

                                {/* Mensaje descriptivo */}
                                <p className="text-[11px] text-zinc-600 italic bg-white/90 p-1.5 rounded border border-zinc-200/80">
                                  "{n.message}"
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Badge / Session State (Login: Usuario = Cédula, Password = Cédula) */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800 text-right">
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-xs font-bold text-white truncate max-w-[180px]">{currentUser.fullName}</span>
                  <span className="text-[10px] text-[#F1B400] font-mono font-bold uppercase truncate max-w-[180px]">{currentUser.position}</span>
                </div>
                <button
                  onClick={() => {
                    if (confirm('¿Desea cerrar la sesión activa para ingresar con otro usuario?')) {
                      logoutSession();
                    }
                  }}
                  title={`Sesión activa: Cédula ${currentUser.username} (${currentUser.position}). Clic para cambiar de usuario.`}
                  className="w-8 h-8 rounded-full bg-[#F1B400] text-black font-black flex items-center justify-center text-xs shadow-xs hover:ring-2 hover:ring-white transition-all cursor-pointer"
                >
                  {currentUser.fullName.split(' ').map(n => n[0]).slice(0, 2).join('') || 'US'}
                </button>
                <button
                  onClick={() => logoutSession()}
                  title="Cerrar Sesión"
                  className="p-1 rounded text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => logoutSession()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F1B400] hover:bg-[#d99c00] text-black text-xs font-mono font-bold uppercase rounded-lg shadow-xs transition-colors cursor-pointer"
                title="Iniciar sesión con Cédula de Identidad"
              >
                <LogIn size={13} />
                <span className="hidden sm:inline">Ingresar con Cédula</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. MAIN WORKSPACE WITH SNUG LEFT SIDEBAR AND FULL-WIDTH MAIN CANVAS */}
      <div className="flex-1 w-full px-3 sm:px-5 lg:px-6 py-4 flex flex-col lg:flex-row gap-5 items-start">
        {/* SIDEBAR NAVIGATION (DRAWER ON MOBILE / DOCKED ON DESKTOP) - EXCLUSIVO PARA ADMINISTRADOR */}
        {isAdmin && (
          <aside className={`
            bg-white border border-zinc-200 rounded-2xl shadow-sm p-3.5 text-zinc-900
            fixed inset-y-0 left-0 z-50 w-72 lg:static lg:w-64 xl:w-72 lg:shrink-0 lg:z-auto transition-transform duration-300
            lg:sticky lg:top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            {/* Mobile close button */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-200 lg:hidden">
              <span className="text-xs font-black uppercase text-zinc-950">Menú de Etapas</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded text-zinc-500 hover:text-black">
                <X size={18} />
              </button>
            </div>

            {/* Banner institucional encima del menú desplegable */}
            <div className="mb-3.5 p-2.5 flex flex-col items-center gap-2">
              <img
                src="https://tse3.mm.bing.net/th/id/OIP.8aTnI5UT9kv5S8OyHjjWngAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="Tecnología al alcance de tu mano"
                className="w-10 h-10 object-contain rounded-lg shadow-2xs"
              />
              <span className="text-[11px] font-black uppercase tracking-tight text-zinc-950 text-center leading-tight">
                Tecnología al alcance de tu mano
              </span>
            </div>

            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2 font-mono">
              Menú Principal de Evaluación
            </div>

            <nav className="space-y-1.5">
              {/* 1. INICIO */}
              <button
                onClick={() => navigateTo('inicio')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                currentStage === 'inicio'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Home size={15} className={currentStage === 'inicio' ? 'text-[#F1B400]' : 'text-zinc-500'} />
                <span>1. INICIO</span>
              </div>
              <ChevronRight size={13} className={currentStage === 'inicio' ? 'text-[#F1B400]' : 'text-zinc-400'} />
            </button>

            {/* Sub-items or quick links of INICIO */}
            <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-zinc-200 ml-3">

              {/* Dashboard Desarrollo y Desempeño (Botón Unificado) */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCollabId('__ALL__');
                    setOrgDashboardSection('general');
                    navigateTo('expediente', 'organizacional');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    currentStage === 'expediente' && currentBlock === 'organizacional' && orgDashboardSection === 'general'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100'
                  }`}
                  title="Dashboard Desarrollo y Desempeño (Resumen General)"
                >
                  <div className="flex items-center gap-1.5">
                    <BarChart3 size={13} className={currentStage === 'expediente' && currentBlock === 'organizacional' && orgDashboardSection === 'general' ? 'text-[#F1B400]' : 'text-zinc-500'} />
                    <span className="truncate">Dashboard Desarrollo y Desempeño</span>
                  </div>
                  {currentStage === 'expediente' && currentBlock === 'organizacional' && orgDashboardSection === 'general' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F1B400]"></span>
                  )}
                </button>

                {/* Sub-opciones especializadas del Dashboard */}
                <div className="pl-2.5 py-1 space-y-1 border-l-2 border-zinc-200 ml-2">
                  {/* 1. PROMEDIO DE EVALUACIÓN POR CARGO (ESTRUCTURA ORGANIZACIONAL) */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCollabId('__ALL__');
                      setOrgDashboardSection('promedios_cargo');
                      navigateTo('expediente', 'organizacional');
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                      currentStage === 'expediente' && currentBlock === 'organizacional' && orgDashboardSection === 'promedios_cargo'
                        ? 'bg-zinc-900 text-white font-black shadow-2xs border-l-2 border-[#F1B400]'
                        : 'text-zinc-700 hover:text-zinc-950 hover:bg-amber-50/60'
                    }`}
                    title="Visualizar exclusivamente el promedio de evaluación del desempeño para cada uno de los 8 cargos"
                  >
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={12} className={currentStage === 'expediente' && currentBlock === 'organizacional' && orgDashboardSection === 'promedios_cargo' ? 'text-[#F1B400]' : 'text-[#D99C00]'} />
                      <span className="leading-tight">Promedio por Cargo (8 Niveles)</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-950 font-black">8</span>
                  </button>

                    {/* 2. DETALLE OPERATIVO Y MAPA DE CALOR */}
                    <div
                      onMouseEnter={() => setIsDetalleOperativoOpen(true)}
                      className="space-y-0.5"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCollabId('__ALL__');
                          setOrgDashboardSection('analitica');
                          navigateTo('expediente', 'organizacional');
                          setIsDetalleOperativoOpen(prev => !prev);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                          currentStage === 'expediente' && currentBlock === 'organizacional' && (orgDashboardSection === 'analitica' || orgDashboardSection === 'ranking')
                            ? 'bg-zinc-900 text-white font-black shadow-2xs border-l-2 border-[#F1B400]'
                            : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                        }`}
                        title="Detalle Operativo y Mapa de Calor"
                      >
                        <div className="flex items-center gap-1.5">
                          <Layers size={12} className={(orgDashboardSection === 'analitica' || orgDashboardSection === 'ranking') ? 'text-[#F1B400]' : 'text-zinc-400'} />
                          <span className="leading-tight">Detalle Operativo y Mapa de Calor</span>
                        </div>
                        <ChevronRight
                          size={11}
                          className={`text-zinc-400 transition-transform duration-200 ${isDetalleOperativoOpen ? 'rotate-90 text-[#F1B400]' : ''}`}
                        />
                      </button>

                      {/* Sub-opciones de DETALLE OPERATIVO (Unificadas en 2 Secciones) */}
                      {isDetalleOperativoOpen && (
                        <div className="pl-3 py-1 space-y-1 border-l-2 border-zinc-300 ml-2 animate-in fade-in duration-150">
                          {/* 1. INDICADORES CLAVE KPI´S, GRÁFICOS Y MAPA DE CALOR */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCollabId('__ALL__');
                              setOrgDashboardSection('analitica');
                              navigateTo('expediente', 'organizacional');
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded text-[10px] font-bold transition-all flex items-start gap-1.5 cursor-pointer leading-tight ${
                              currentStage === 'expediente' && currentBlock === 'organizacional' && orgDashboardSection === 'analitica'
                                ? 'bg-amber-100 text-amber-950 font-black'
                                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                            }`}
                          >
                            <Award size={11} className="text-[#D99C00] shrink-0 mt-0.5" />
                            <span>Indicadores Clave KPI´s, Gráficos y Mapa de Calor</span>
                          </button>

                          {/* 2. RANKING DE COLABORADORES */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCollabId('__ALL__');
                              setOrgDashboardSection('ranking');
                              navigateTo('expediente', 'organizacional');
                            }}
                            className={`w-full text-left px-2 py-1.5 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-tight ${
                              currentStage === 'expediente' && currentBlock === 'organizacional' && orgDashboardSection === 'ranking'
                                ? 'bg-amber-100 text-amber-950 font-black'
                                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                            }`}
                          >
                            <Users size={11} className="text-[#D99C00] shrink-0" />
                            <span>Ranking de Colaboradores</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 3. NIVEL ACADÉMICO (IMPACTO, DISTRIBUCIÓN & BOX PLOT) */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCollabId('__ALL__');
                        navigateTo('expediente', 'people_analytics_educacion');
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                        currentStage === 'expediente' && currentBlock === 'people_analytics_educacion'
                          ? 'bg-zinc-900 text-white font-black shadow-2xs border-l-2 border-[#F1B400]'
                          : 'text-zinc-700 hover:text-zinc-950 hover:bg-amber-50/60'
                      }`}
                      title="Visualizar exclusivamente los gráficos del Impacto del Nivel Académico, Distribución y Box Plot"
                    >
                      <div className="flex items-center gap-1.5">
                        <GraduationCap size={12} className={currentStage === 'expediente' && currentBlock === 'people_analytics_educacion' ? 'text-[#F1B400]' : 'text-[#D99C00]'} />
                        <span className="leading-tight">Impacto Nivel Académico</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

            {/* 2. PERFIL DEL COLABORADOR */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  if (selectedCollabId === '__ALL__') {
                    handleSelectCollaborator(CANGURO_COLLABORATORS[0].info.id || 'emp-001');
                  }
                  setIsPerfilColaboradorOpen(prev => !prev);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-black transition-all text-left cursor-pointer ${
                  currentStage === 'expediente' && (currentBlock === 'resumen' || currentBlock === 'promocion' || currentBlock === 'pdi')
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-800 hover:bg-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCircle size={15} className={currentStage === 'expediente' && (currentBlock === 'resumen' || currentBlock === 'promocion' || currentBlock === 'pdi') ? 'text-[#F1B400]' : 'text-zinc-500'} />
                  <span>2. PERFIL DEL COLABORADOR</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isPerfilColaboradorOpen ? 'rotate-180 text-[#F1B400]' : 'text-zinc-400'}`} />
              </button>

              {/* Sub-items desplegados al pararse o pulsar en PERFIL DEL COLABORADOR */}
              {isPerfilColaboradorOpen && (
                <div className="pl-3 pr-1 py-1 space-y-1 mt-1 border-l-2 border-zinc-200 ml-3 animate-in fade-in duration-150">
                  
                  {/* RAMA A: RESULTADOS DE EVALUACIÓN DE DESEMPEÑO */}
                  <div
                    className="space-y-1"
                    onMouseEnter={() => setIsResultadosDesempenoOpen(true)}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedCollabId === '__ALL__') {
                          handleSelectCollaborator(CANGURO_COLLABORATORS[0].info.id || 'emp-001');
                        }
                        navigateTo('expediente', 'resumen');
                        setIsResultadosDesempenoOpen(prev => !prev);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                        currentStage === 'expediente' && currentBlock === 'resumen'
                          ? 'bg-amber-100/90 text-amber-950 font-black border border-amber-300'
                          : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
                      }`}
                      title="Resultados de Evaluación de Desempeño (360°/180°)"
                    >
                      <div className="flex items-center gap-1.5">
                        <Award size={13} className="text-[#D99C00] shrink-0" />
                        <span className="leading-tight">Resultados de Evaluación de Desempeño</span>
                      </div>
                      <ChevronRight
                        size={11}
                        className={`text-zinc-400 transition-transform duration-200 ${isResultadosDesempenoOpen ? 'rotate-90 text-[#F1B400]' : ''}`}
                      />
                    </button>

                    {/* Sub-opciones de RESULTADOS DE EVALUACIÓN DE DESEMPEÑO */}
                    {isResultadosDesempenoOpen && (
                      <div className="pl-2.5 py-0.5 space-y-0.5 border-l-2 border-[#F1B400]/40 ml-2 animate-in fade-in duration-150">
                        {/* 1. DESEMPEÑO Y COMPETENCIAS */}
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedCollabId === '__ALL__') handleSelectCollaborator(CANGURO_COLLABORATORS[0].info.id || 'emp-001');
                            navigateTo('expediente', 'resumen', 'desempeno');
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-tight ${
                            currentStage === 'expediente' && currentBlock === 'resumen' && individualActiveSection === 'desempeno'
                              ? 'bg-zinc-900 text-[#F1B400] font-black'
                              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                          }`}
                        >
                          <Award size={11} className="text-[#D99C00] shrink-0" />
                          <span>Desempeño y Competencias</span>
                        </button>

                        {/* 2. POTENCIAL Y LIDERAZGO */}
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedCollabId === '__ALL__') handleSelectCollaborator(CANGURO_COLLABORATORS[0].info.id || 'emp-001');
                            navigateTo('expediente', 'resumen', 'potencial');
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-tight ${
                            currentStage === 'expediente' && currentBlock === 'resumen' && individualActiveSection === 'potencial'
                              ? 'bg-zinc-900 text-[#F1B400] font-black'
                              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                          }`}
                        >
                          <Brain size={11} className="text-[#D99C00] shrink-0" />
                          <span>Potencial y Liderazgo</span>
                        </button>

                        {/* 3. MATRIZ 9-BOX */}
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedCollabId === '__ALL__') handleSelectCollaborator(CANGURO_COLLABORATORS[0].info.id || 'emp-001');
                            navigateTo('expediente', 'resumen', 'ninebox');
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-tight ${
                            currentStage === 'expediente' && currentBlock === 'resumen' && individualActiveSection === 'ninebox'
                              ? 'bg-zinc-900 text-[#F1B400] font-black'
                              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                          }`}
                        >
                          <LayoutGrid size={11} className="text-[#D99C00] shrink-0" />
                          <span>Matriz 9-Box</span>
                        </button>

                        {/* 4. CAMPANA DE GAUSS, DISTRIBUCIÓN */}
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedCollabId === '__ALL__') handleSelectCollaborator(CANGURO_COLLABORATORS[0].info.id || 'emp-001');
                            navigateTo('expediente', 'resumen', 'calibracion');
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-tight ${
                            currentStage === 'expediente' && currentBlock === 'resumen' && individualActiveSection === 'calibracion'
                              ? 'bg-zinc-900 text-[#F1B400] font-black'
                              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                          }`}
                        >
                          <Activity size={11} className="text-[#D99C00] shrink-0" />
                          <span>Campana de Gauss, Distribución</span>
                        </button>

                      </div>
                    )}
                  </div>

                  {/* RAMA B: RESULTADOS DE PROMOCIÓN */}
                  <div
                    className="space-y-1 pt-1"
                    onMouseEnter={() => setIsResultadosPromocionOpen(true)}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedCollabId === '__ALL__') {
                          handleSelectCollaborator(CANGURO_COLLABORATORS[0].info.id || 'emp-001');
                        }
                        navigateTo('expediente', 'promocion');
                        setIsResultadosPromocionOpen(prev => !prev);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                        currentStage === 'expediente' && currentBlock === 'promocion'
                          ? 'bg-zinc-950 text-white shadow-xs border border-zinc-900 font-black'
                          : 'text-amber-950 bg-amber-50/80 border border-amber-200/90 hover:bg-amber-100'
                      }`}
                      title="Resultados de Evaluación para Promoción"
                    >
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={13} className="text-[#D99C00] shrink-0" />
                        <span className="leading-tight">Resultados de Promoción</span>
                      </div>
                      <ChevronRight
                        size={11}
                        className={`text-zinc-400 transition-transform duration-200 ${isResultadosPromocionOpen ? 'rotate-90 text-[#F1B400]' : ''}`}
                      />
                    </button>

                    {/* Sub-opciones de RESULTADOS DE PROMOCIÓN */}
                    {isResultadosPromocionOpen && (
                      <div className="pl-2.5 py-0.5 space-y-0.5 border-l-2 border-amber-300 ml-2 animate-in fade-in duration-150">
                        {/* 1. ANÁLISIS DE BRECHAS (BARRAS DE PROGRESO) */}
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedCollabId === '__ALL__') handleSelectCollaborator(CANGURO_COLLABORATORS[0].info.id || 'emp-001');
                            setPromotionActiveSection('brechas');
                            navigateTo('expediente', 'promocion');
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-tight ${
                            currentStage === 'expediente' && currentBlock === 'promocion' && promotionActiveSection === 'brechas'
                              ? 'bg-amber-100 text-amber-950 font-black'
                              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                          }`}
                        >
                          <BarChart3 size={11} className="text-[#D99C00] shrink-0" />
                          <span>Análisis de Brechas (Barras de Progreso)</span>
                        </button>

                        {/* 2. MATRIZ 9-BOX */}
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedCollabId === '__ALL__') handleSelectCollaborator(CANGURO_COLLABORATORS[0].info.id || 'emp-001');
                            setPromotionActiveSection('ninebox_promocion');
                            navigateTo('expediente', 'promocion');
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-tight ${
                            currentStage === 'expediente' && currentBlock === 'promocion' && promotionActiveSection === 'ninebox_promocion'
                              ? 'bg-amber-100 text-amber-950 font-black'
                              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                          }`}
                        >
                          <LayoutGrid size={11} className="text-[#D99C00] shrink-0" />
                          <span>Matriz 9-Box</span>
                        </button>

                        {/* 3. PREDISPOSICIÓN CONDUCTUAL Y ADECUACIÓN AL NUEVO CARGO */}
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedCollabId === '__ALL__') handleSelectCollaborator(CANGURO_COLLABORATORS[0].info.id || 'emp-001');
                            setPromotionActiveSection('bigfive');
                            navigateTo('expediente', 'promocion');
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-tight ${
                            currentStage === 'expediente' && currentBlock === 'promocion' && promotionActiveSection === 'bigfive'
                              ? 'bg-amber-100 text-amber-950 font-black'
                              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                          }`}
                        >
                          <Brain size={11} className="text-[#D99C00] shrink-0" />
                          <span>Predisposición Conductual y Adecuación al nuevo Cargo</span>
                        </button>

                        {/* 4. VISTA PREVIA E IMPRESIÓN PDF DE EXPEDIENTE FORMAL DE EVALUACIÓN */}
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedCollabId === '__ALL__') handleSelectCollaborator(CANGURO_COLLABORATORS[0].info.id || 'emp-001');
                            setPromotionActiveSection('impresion_pdf');
                            navigateTo('expediente', 'promocion');
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-tight ${
                            currentStage === 'expediente' && currentBlock === 'promocion' && promotionActiveSection === 'impresion_pdf'
                              ? 'bg-amber-100 text-amber-950 font-black'
                              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                          }`}
                        >
                          <Printer size={11} className="text-[#D99C00] shrink-0" />
                          <span>Vista Previa e Impresión PDF</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* RAMA C: PLAN DE DESARROLLO INDIVIDUAL (PDI) */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedCollabId === '__ALL__') {
                          handleSelectCollaborator(CANGURO_COLLABORATORS[0].info.id || 'emp-001');
                        }
                        navigateTo('expediente', 'pdi');
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                        currentStage === 'expediente' && currentBlock === 'pdi'
                          ? 'bg-zinc-950 text-white shadow-xs border border-zinc-900 font-black'
                          : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
                      }`}
                      title="Plan de Desarrollo Individual (PDI) 70-20-10"
                    >
                      <div className="flex items-center gap-1.5">
                        <Target size={13} className={currentStage === 'expediente' && currentBlock === 'pdi' ? 'text-[#F1B400]' : 'text-[#D99C00] shrink-0'} />
                        <span className="leading-tight">Plan de Desarrollo Individual (PDI)</span>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        currentStage === 'expediente' && currentBlock === 'pdi'
                          ? 'bg-[#F1B400] text-black'
                          : 'bg-zinc-200/80 text-zinc-700'
                      }`}>
                        70-20-10
                      </span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* MATRIZ DE SUCESIÓN */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedCollabId('__ALL__');
                  navigateTo('expediente', 'banco_sucesores');
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  currentStage === 'expediente' && currentBlock === 'banco_sucesores'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
                title="Matriz de Sucesión y Continuidad del Liderazgo"
              >
                <div className="flex items-center gap-2">
                  <Star size={15} className={currentStage === 'expediente' && currentBlock === 'banco_sucesores' ? 'text-emerald-400 fill-emerald-400' : 'text-zinc-500'} />
                  <span>MATRIZ DE SUCESIÓN</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-950 font-bold">
                  Ready
                </span>
              </button>
            </div>

            {/* AUDITORÍA Y TRAZABILIDAD */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => navigateTo('audit')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  currentStage === 'audit'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
                title="Auditoría forense de evaluaciones en tiempo real y trazabilidad"
              >
                <div className="flex items-center gap-2">
                  <Activity size={15} className={currentStage === 'audit' ? 'text-[#F1B400]' : 'text-zinc-500'} />
                  <span>AUDITORÍA EN VIVO</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 font-bold">
                  En Vivo
                </span>
              </button>
            </div>

            {/* CONFIGURACIÓN DE EVALUACIÓN DEL DESEMPEÑO (POR DIRECCIÓN Y 360°) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => navigateTo('config_desempeno')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  currentStage === 'config_desempeno' || currentStage === 'config'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
                title="Configuración de reactivos y tipos de evaluación (180°/360°) organizados por Dirección y Gerencia"
              >
                <div className="flex items-center gap-2">
                  <Sliders size={15} className={(currentStage === 'config_desempeno' || currentStage === 'config') ? 'text-[#F1B400]' : 'text-zinc-500'} />
                  <div className="flex flex-col">
                    <span className="leading-tight font-black">CONFIG. DESEMPEÑO</span>
                    <span className="text-[9.5px] font-normal text-zinc-400">Por Dirección & 360°</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                  8 Dir.
                </span>
              </button>
            </div>

            {/* CONFIGURACIÓN DE CONCURSO DE PROMOCIÓN Y ASCENSO */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => navigateTo('config_promocion')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  currentStage === 'config_promocion'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
                title="Concurso de Promoción y Ascenso: Subprocesos 1 y 2 exclusivos, Test Big Five y Gemini IA"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className={currentStage === 'config_promocion' ? 'text-purple-400' : 'text-zinc-500'} />
                  <div className="flex flex-col">
                    <span className="leading-tight font-black">CONCURSO PROMOCIÓN</span>
                    <span className="text-[9.5px] font-normal text-zinc-400">Subprocesos 1 y 2 (IA)</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-bold">
                  Individual
                </span>
              </button>
            </div>

            {/* RECUPERACIÓN DE CONTRASEÑA DE USUARIOS (USUARIO MAESTRO) */}
            <div className="pt-2 border-t border-zinc-200 mt-2">
              <div className="text-[9.5px] font-mono font-bold text-amber-700 uppercase px-1 pb-1.5 flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-amber-500" />
                <span>Gestión de Accesos (Maestro)</span>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('recuperacion_clave')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${
                  currentStage === 'recuperacion_clave'
                    ? 'bg-amber-500 text-black border-amber-600 shadow-md font-black scale-[1.01]'
                    : 'bg-amber-50/90 border-amber-300 text-amber-950 hover:bg-amber-100 hover:border-amber-400'
                }`}
                title="Recuperación y Reinicio de Contraseñas de Colaboradores (Usuario Maestro)"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${currentStage === 'recuperacion_clave' ? 'bg-black text-[#F1B400]' : 'bg-amber-500 text-black shadow-2xs'}`}>
                    <KeyRound size={14} className="stroke-[2.5]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="leading-tight font-black text-[11px]">RECUPERACIÓN CLAVE</span>
                    <span className="text-[9.5px] font-medium text-amber-800">Reinicio por ID / Cédula</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black text-[#F1B400] font-black shadow-2xs">
                  MAESTRO
                </span>
              </button>
            </div>
          </nav>

          {/* Institutional Brand Seal */}
          <div className="mt-8 p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
            <p className="text-xs font-black uppercase tracking-wider text-zinc-800">
              Canguro Venezuela
            </p>
          </div>
        </aside>
      )}

      {/* Backdrop for mobile sidebar */}
      {isAdmin && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

        {/* MAIN STAGE CONTENT (FULL REMAINING CANVAS) */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {/* ========================================================================= */}
          {/* 1. INICIO: PORTAL CENTRAL & IMÁGENES REFERENCIALES INTERACTIVAS           */}
          {/* ========================================================================= */}
          {currentStage === 'inicio' && (
            <EvaluationHubHome
              onNavigate={(st, blk) => {
                if (!isAdmin) {
                  if (st === 'expediente') {
                    if (currentUser) handleSelectCollaborator(currentUser.collaboratorId || currentUser.username);
                    navigateTo('expediente', 'resumen');
                  } else {
                    navigateTo('inicio');
                  }
                  return;
                }
                if (blk === 'organizacional') {
                  setSelectedCollabId('__ALL__');
                }
                navigateTo(st, blk);
              }}
              onSelectCollaborator={handleSelectCollaborator}
              collaboratorCount={CANGURO_COLLABORATORS.length}
              currentUser={currentUser}
            />
          )}

          {/* ========================================================================= */}
          {/* MÓDULO 1: CONFIGURACIÓN DE EVALUACIÓN DEL DESEMPEÑO (POR DIRECCIÓN Y 360°)*/}
          {/* ========================================================================= */}
          {(currentStage === 'config_desempeno' || currentStage === 'config') && (
            <PerformanceEvaluationConfigView
              onNavigateBack={() => navigateTo('inicio')}
            />
          )}

          {/* ========================================================================= */}
          {/* MÓDULO 2: CONFIGURACIÓN DE CONCURSO DE PROMOCIÓN Y ASCENSO (SUBP. 1 Y 2) */}
          {/* ========================================================================= */}
          {currentStage === 'config_promocion' && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-900">
                  <Sparkles size={18} className="text-purple-600 shrink-0" />
                  <span>
                    <strong>Módulo Exclusivo de Concurso de Promoción y Ascenso:</strong> Ingrese los datos institucionales del colaborador postulado (Subproceso 1) y configure el cargo superior objetivo con calibración por Gemini IA, Test Big Five y casos situacionales supervisados (Subproceso 2). <em>Modalidad individual y presencial.</em>
                  </span>
                </div>
              </div>

              <EvaluationProfileConfig
                info={evaluationConfigDraft}
                onChange={(newInfo) => {
                  setEvaluationConfigDraft(newInfo);
                  onUpdateState({
                    ...state,
                    evaluationSetupInfo: newInfo
                  });
                }}
                questions={state.potentialQuestions}
                onUpdateQuestions={(upd) => {
                  onUpdateState({ ...state, potentialQuestions: upd });
                }}
                onNavigateToStage={(st) => navigateTo(st as any)}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* MÓDULO 3: RECUPERACIÓN Y REINICIO DE CONTRASEÑA DE USUARIOS               */}
          {/* ========================================================================= */}
          {currentStage === 'recuperacion_clave' && (
            <UserPasswordRecoveryModule
              onNavigateBack={() => navigateTo('inicio')}
            />
          )}

          {/* ========================================================================= */}
          {/* ETAPA 2: CENTRO DE ENLACES Y DESPACHO OFICIAL                             */}
          {/* ========================================================================= */}
          {currentStage === 'links' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm text-zinc-900 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
                  <div>
                    <h3 className="text-base font-black uppercase text-zinc-950 tracking-tight">
                      Centro de Enlaces y Despacho Oficial de Convocatorias
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Dirección de Talento Humano | Gerencia de Formación y Desarrollo
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800">
                    Modalidad: {hasSubordinates ? '360° (4 Roles)' : '180° (3 Roles)'}
                  </span>
                </div>

                {/* Formal Convocatory Letter Preview */}
                <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-300 font-sans text-xs text-zinc-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                    <span className="font-mono font-bold text-[10px] uppercase text-zinc-500">
                      Membrete Oficial — Gerencia de Formación y Desarrollo
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">Caracas, Venezuela</span>
                  </div>
                  <p className="leading-relaxed">
                    Por medio de la presente, la <strong>Dirección de Talento Humano de DISTRICUEROS EL CANGURO, C.A.</strong> convoca formalmente al ciclo de Evaluación del Desempeño y Desarrollo de Talento para el colaborador <strong>{evaluationConfigDraft.firstName || 'Colaborador'} {evaluationConfigDraft.lastName}</strong> ({evaluationConfigDraft.idNumber || 'Sin Cédula'}), quien desempeña el cargo de <strong>{evaluationConfigDraft.position}</strong> en <strong>{evaluationConfigDraft.department}</strong>.
                  </p>
                  <p className="leading-relaxed text-zinc-600">
                    Agradecemos completar los instrumentos correspondientes garantizando la confidencialidad, objetividad y estricto apego al estándar corporativo Universo Canguro.
                  </p>
                </div>
              </div>

              {/* Links Grid using the component */}
              <EvaluationProfileConfig
                info={evaluationConfigDraft}
                onChange={(newInfo) => {
                  setEvaluationConfigDraft(newInfo);
                  onUpdateState({
                    ...state,
                    evaluationSetupInfo: newInfo
                  });
                }}
                questions={state.potentialQuestions}
                onUpdateQuestions={() => {}}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* ETAPA 3: EXPEDIENTE 360° (NÚCLEO ANALÍTICO Y TOMA DE DECISIONES)          */}
          {/* ========================================================================= */}
          {currentStage === 'expediente' && (
            <div className="space-y-6 animate-in fade-in">
              {currentBlock === 'dashboard_ejecutivo' ? (
                <ExecutiveTalentDashboard
                  liveState={state}
                  onSelectCollaborator={(id) => {
                    handleSelectCollaborator(id);
                    setCurrentBlock('resumen');
                  }}
                />
              ) : currentBlock === 'organizacional' ? (
                <OrganizationalDashboard
                  liveState={state}
                  onSelectCollaborator={(id) => {
                    handleSelectCollaborator(id);
                    setCurrentBlock('resumen');
                  }}
                  onNavigateToPromotionsDashboard={() => setCurrentBlock('dashboard_promociones')}
                  initialMode={orgDashboardMode}
                  initialSection={orgDashboardSection}
                  onModeChange={setOrgDashboardMode}
                  onSectionChange={setOrgDashboardSection}
                />
              ) : currentBlock === 'dashboard_promociones' ? (
                <PromotionsDashboard
                  onSelectCollaborator={(idNumber) => {
                    const found = CANGURO_COLLABORATORS.find(c => c.info.idNumber === idNumber);
                    if (found && found.info.id) {
                      handleSelectCollaborator(found.info.id);
                      setCurrentBlock('promocion');
                    }
                  }}
                />
              ) : currentBlock === 'banco_sucesores' ? (
                <SuccessionBankView
                  onSelectCollaborator={(id) => {
                    handleSelectCollaborator(id);
                    setCurrentBlock('resumen');
                  }}
                  liveState={state}
                />
              ) : currentBlock === 'people_analytics_educacion' ? (
                <PeopleAnalyticsEducationDashboard
                  liveState={state}
                  onSelectCollaborator={(id) => {
                    handleSelectCollaborator(id);
                    setCurrentBlock('resumen');
                  }}
                />
              ) : (
                <div className="space-y-6">
                  {/* CABECERA EXCLUSIVA: BUSCADOR Y PERFIL DEL COLABORADOR — RESULTADOS INDIVIDUALES */}
                  <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                    {/* 1. BUSCADOR DE COLABORADOR (SOLO ADMINISTRADORES) O IDENTIDAD PERSONAL */}
                    {isAdmin ? (
                      <form onSubmit={handleSearchByCedulaSubmit} className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-mono flex items-center gap-1">
                            <UserCircle size={15} className="text-[#D99C00]" /> CÉDULA DEL COLABORADOR:
                          </span>

                          <div className="relative flex items-center">
                            <input
                              type="text"
                              placeholder="Número de cédula o Nombre del colaborador"
                              value={idNumberSearch}
                              onChange={(e) => {
                                const val = e.target.value;
                                setIdNumberSearch(val);
                                // Auto-match if 7+ digits (cédula) or exact match typed
                                const digits = val.replace(/\D/g, '');
                                if (digits.length >= 7) {
                                  const directMatch = CANGURO_COLLABORATORS.find(c => 
                                    (c.info.idNumber || '').replace(/\D/g, '') === digits
                                  );
                                  if (directMatch) {
                                    handleSelectCollaborator(directMatch.info.id);
                                    setSearchFeedback(`Colaborador cargado: ${directMatch.info.firstName} ${directMatch.info.lastName}`);
                                    setTimeout(() => setSearchFeedback(null), 3000);
                                    return;
                                  }
                                }
                                // Auto-match if 3+ characters for name search
                                if (val.trim().length >= 3 && !/^\d+$/.test(val.trim())) {
                                  const q = val.toLowerCase().trim();
                                  const nameMatch = CANGURO_COLLABORATORS.find(c =>
                                    `${c.info.firstName} ${c.info.lastName}`.toLowerCase().includes(q)
                                  );
                                  if (nameMatch) {
                                    handleSelectCollaborator(nameMatch.info.id);
                                    setSearchFeedback(`Colaborador cargado: ${nameMatch.info.firstName} ${nameMatch.info.lastName}`);
                                    setTimeout(() => setSearchFeedback(null), 3000);
                                  }
                                }
                              }}
                              className="bg-zinc-50 border border-zinc-300 text-zinc-950 font-mono font-medium text-xs rounded-lg py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-[#F1B400] w-72 sm:w-96"
                            />
                            <button
                              type="submit"
                              title="Buscar por cédula o nombre"
                              className="absolute right-1 text-zinc-400 hover:text-black p-1 transition-colors cursor-pointer"
                            >
                              <Search size={15} />
                            </button>
                          </div>
                        </div>

                        {searchFeedback && (
                          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-950 border border-amber-300">
                            {searchFeedback}
                          </span>
                        )}
                      </form>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 font-mono flex items-center gap-1">
                            <UserCircle size={15} className="text-[#D99C00]" /> COLABORADOR EN SESIÓN:
                          </span>
                          <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-black text-amber-950 font-mono">
                            {currentUser?.fullName} ({currentUser?.username})
                          </span>
                          <span className="text-xs text-zinc-600 font-medium">
                            • {currentUser?.position} ({currentUser?.department})
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-bold border border-zinc-200">
                          Acceso Individual Exclusivo
                        </span>
                      </div>
                    )}

                    {/* 2. CABECERA: PERFIL DEL COLABORADOR — RESULTADOS INDIVIDUALES */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-0.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F1B400]"></span>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D99C00]">
                            Consulta de Resultados Individuales
                          </span>
                        </div>
                        <h2 className="text-base font-black uppercase text-zinc-950 tracking-tight mt-0.5">
                          PERFIL DEL COLABORADOR: {state.employeeInfo.firstName} {state.employeeInfo.lastName}
                        </h2>
                        <span className="text-xs text-zinc-500 font-mono">
                          {state.employeeInfo.position} • {state.employeeInfo.department} • C.I. {state.employeeInfo.idNumber}
                        </span>
                      </div>

                      {/* Quick Metrics Badges for active employee */}
                      <div className="flex flex-wrap items-center gap-2">
                        {metrics.isEvaluated ? (
                          <>
                            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-300">
                              Score: <strong>{metrics.finalScore.toFixed(2)} pts</strong> ({metrics.base100Score}%)
                            </span>

                            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${metrics.meritTier.badgeBg} ${metrics.meritTier.badgeText}`}>
                              Tramo {metrics.meritTier.id}: {metrics.meritTier.name}
                            </span>

                            {isSuccessionEligible && (
                              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#F1B400] text-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                <Star size={12} fill="currentColor" /> SUCESIÓN ACTIVA
                              </span>
                            )}

                            {isPromotionEligible ? (
                              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-600 text-white uppercase tracking-wider flex items-center gap-1 shadow-xs" title="Eje X ≥ 3.00 y Eje Y ≥ 2.50 en la 9-Box Grid">
                                <CheckCircle2 size={12} className="text-white" /> ELEGIBLE A PROMOCIÓN
                              </span>
                            ) : (
                              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-500 border border-zinc-300 flex items-center gap-1" title="Requiere Eje X ≥ 3.00 y Eje Y ≥ 2.50 en la 9-Box">
                                <AlertTriangle size={12} className="text-amber-500" /> No Elegible a Promoción
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-950 border border-amber-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#F1B400] animate-ping"></span>
                            Prueba Piloto: Evaluación Pendiente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3. ESTADO OFICIAL DE LAS FUENTES EVALUADORAS (360° / 180°) - SOLO EN DESEMPEÑO REGULAR */}
                    {currentBlock !== 'promocion' && (
                      <div className="p-4 rounded-2xl bg-zinc-950 text-white border border-zinc-800 shadow-md space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 rounded-xl bg-zinc-800 text-[#F1B400] font-black text-sm flex items-center justify-center">
                            <Layers size={18} />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                                Estado de las Fuentes Evaluadoras (Workflow Multi-Evaluador)
                              </h4>
                              {metrics.isEvaluated ? (
                                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                                  Evaluación Completada
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                                  Evaluación Pendiente (0.00 pts)
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              {metrics.isEvaluated
                                ? `Registro consolidado de calificaciones para ${state.employeeInfo.firstName} ${state.employeeInfo.lastName}.`
                                : `El colaborador aún no cuenta con evaluaciones registradas. Las calificaciones reflejan 0.00 pts hasta que los evaluadores completen sus formularios a través de los enlaces asignados.`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tarjetas de Estado de las 4 Fuentes Evaluadoras */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        {/* 1. Supervisor */}
                        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                          extractAverage(state.supervisorEval) > 0
                            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                            : 'bg-zinc-900/90 border-zinc-800 text-zinc-400'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-white">👔 Supervisor (Jefe)</span>
                            {extractAverage(state.supervisorEval) > 0 ? (
                              <CheckCircle2 size={14} className="text-emerald-400" />
                            ) : (
                              <span className="text-[9px] font-mono text-amber-400 font-bold">No Realizada</span>
                            )}
                          </div>
                          <div className="my-1 font-mono font-black text-base text-white">
                            {extractAverage(state.supervisorEval) > 0 ? `${extractAverage(state.supervisorEval).toFixed(2)} pts` : '0.00 pts'}
                          </div>
                          <span className="text-[9px] text-zinc-400">Ponderación: 50% - 70%</span>
                        </div>

                        {/* 2. Self */}
                        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                          extractAverage(state.selfEval) > 0
                            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                            : 'bg-zinc-900/90 border-zinc-800 text-zinc-400'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-white">📝 Autoevaluación</span>
                            {extractAverage(state.selfEval) > 0 ? (
                              <CheckCircle2 size={14} className="text-emerald-400" />
                            ) : (
                              <span className="text-[9px] font-mono text-amber-400 font-bold">No Realizada</span>
                            )}
                          </div>
                          <div className="my-1 font-mono font-black text-base text-white">
                            {extractAverage(state.selfEval) > 0 ? `${extractAverage(state.selfEval).toFixed(2)} pts` : '0.00 pts'}
                          </div>
                          <span className="text-[9px] text-zinc-400">Ponderación: 10% - 20%</span>
                        </div>

                        {/* 3. Peer */}
                        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                          extractAverage(state.peerEval) > 0
                            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                            : 'bg-zinc-900/90 border-zinc-800 text-zinc-400'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-white">👥 Pares (Colegas)</span>
                            {extractAverage(state.peerEval) > 0 ? (
                              <CheckCircle2 size={14} className="text-emerald-400" />
                            ) : (
                              <span className="text-[9px] font-mono text-zinc-500">No Realizada</span>
                            )}
                          </div>
                          <div className="my-1 font-mono font-black text-base text-white">
                            {extractAverage(state.peerEval) > 0 ? `${extractAverage(state.peerEval).toFixed(2)} pts` : '0.00 pts'}
                          </div>
                          <span className="text-[9px] text-zinc-400">Ponderación: 15% - 20%</span>
                        </div>

                        {/* 4. Subordinates */}
                        {hasSubordinates ? (
                          <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                            extractAverage(state.subordinateEval) > 0
                              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                              : 'bg-zinc-900/90 border-zinc-800 text-zinc-400'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[11px] text-white">🤝 Subordinados</span>
                              {extractAverage(state.subordinateEval) > 0 ? (
                                <CheckCircle2 size={14} className="text-emerald-400" />
                              ) : (
                                <span className="text-[9px] font-mono text-zinc-500">No Realizada</span>
                              )}
                            </div>
                            <div className="my-1 font-mono font-black text-base text-white">
                              {extractAverage(state.subordinateEval) > 0 ? `${extractAverage(state.subordinateEval).toFixed(2)} pts` : '0.00 pts'}
                            </div>
                            <span className="text-[9px] text-zinc-400">Ponderación: 15% - 20%</span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl border border-zinc-800/60 bg-zinc-900/40 flex flex-col justify-between text-zinc-500">
                            <span className="font-bold text-[11px]">🤝 Subordinados</span>
                            <span className="text-[10px] italic my-1">No aplica (180°)</span>
                            <span className="text-[9px] text-zinc-600">Sin equipo directo a cargo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  </div>

                  {/* ========================================================================= */}
                  {/* BLOQUE OFICIAL: RESULTADOS INDIVIDUALES DE LA EVALUACIÓN PARA PROMOCIÓN    */}
                  {/* ========================================================================= */}
                  {currentBlock === 'promocion' && (() => {
                    const activePromotionDossier = resolveOrCreatePromotionDossier(state.employeeInfo, state.promotionDossier);
                    const isPromotionEvaluated = !!(
                      state.promotionEval && (
                        (state.promotionEval.scores && Object.keys(state.promotionEval.scores).length > 0) ||
                        state.promotionEval.bigFiveResults
                      )
                    );
                    const activeBigFiveResults = state.promotionEval?.bigFiveResults || (isPromotionEvaluated ? activePromotionDossier.phase1.bigFiveResults : undefined);
                    const promotionBase100 = isPromotionEvaluated
                      ? (activePromotionDossier.phase3.scoreBase100 ?? Number(((activePromotionDossier.phase3.finalScore / 5) * 100).toFixed(1)))
                      : 0;
                    const fitLevel = isPromotionEvaluated
                      ? (activePromotionDossier.phase3.fitLevel || (
                          promotionBase100 >= 85 ? 'Listo Ahora' :
                          promotionBase100 >= 70 ? 'Listo a Mediano Plazo' : 'No Elegible'
                        ))
                      : 'Evaluación Pendiente';
                    const targetPos = activePromotionDossier.targetPosition || state.employeeInfo.targetPromotionPosition || 'Cargo Superior';
                    const targetLevelInfo = resolvePositionManagementLevel(targetPos);
                    const currentLevelInfo = resolvePositionManagementLevel(state.employeeInfo.position);

                    return (
                      <div className="space-y-6">
                        {/* Cabecera contextual de la sección activa de Promoción */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono font-bold text-zinc-500 uppercase text-[11px]">Perfil del Colaborador</span>
                            <span className="text-zinc-400">/</span>
                            <span className="font-bold text-zinc-700">Resultados de Promoción</span>
                            <span className="text-zinc-400">/</span>
                            <span className="font-black text-[#D99C00] uppercase font-mono tracking-wide text-xs">
                              {promotionActiveSection === 'brechas' ? 'Análisis de Brechas (Barras de Progreso)' :
                               promotionActiveSection === 'ninebox_promocion' ? 'Matriz 9-Box' :
                               promotionActiveSection === 'bigfive' ? 'Predisposición Conductual y Adecuación al nuevo Cargo' :
                               promotionActiveSection === 'impresion_pdf' ? 'Vista Previa e Impresión PDF' : 'Vista Completa'}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2">
                            <span className="font-bold text-zinc-800">{state.employeeInfo.firstName} {state.employeeInfo.lastName}</span>
                            <span>({state.employeeInfo.idNumber || state.employeeInfo.id})</span>
                          </div>
                        </div>

                        {/* 1. FICHA RESUMEN DE PROMOCIÓN E ÍNDICE DE FIT */}
                        <div className="bg-white border-2 border-[#F1B400] rounded-2xl p-5 shadow-sm space-y-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-zinc-200">
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-full font-mono font-black text-[10px] bg-[#F1B400] text-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                                  <Sparkles size={12} /> Proceso de Carrera y Promoción Interna
                                </span>
                                <span className="text-xs font-mono font-bold text-zinc-500">
                                  Expediente DTH-GFD-PROM-01
                                </span>
                              </div>
                              <h2 className="text-lg font-black uppercase text-zinc-950 tracking-tight">
                                Evaluación de Preparación para: {targetPos}
                              </h2>
                              <p className="text-xs text-zinc-600 mt-0.5">
                                Colaborador: <strong className="text-zinc-900">{state.employeeInfo.firstName} {state.employeeInfo.lastName}</strong> (C.I. {state.employeeInfo.idNumber}) | Cargo Actual: <strong>{state.employeeInfo.position}</strong> (Nivel {currentLevelInfo?.level || 'D'} - {currentLevelInfo?.levelName || 'Nivel Operativo'}) → Cargo Destino: <strong>{targetPos}</strong> (Nivel {targetLevelInfo?.level || 'B'} - {targetLevelInfo?.levelName || 'Nivel Alto'})
                              </p>
                            </div>

                            {/* Badge de Fit para el Cargo */}
                            <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                                Índice de Fit para el Cargo Destino
                              </span>
                              <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 shadow-xs ${
                                !isPromotionEvaluated
                                  ? 'bg-zinc-100 text-zinc-700 border-zinc-300'
                                  : fitLevel === 'Listo Ahora'
                                  ? 'bg-emerald-600 text-white border-emerald-700'
                                  : fitLevel === 'Listo a Mediano Plazo'
                                  ? 'bg-[#F1B400] text-black border-[#d49e00]'
                                  : 'bg-red-600 text-white border-red-700'
                              }`}>
                                <Award size={18} />
                                <div>
                                  <span className="text-xs font-black uppercase tracking-wider block leading-none">
                                    {fitLevel}
                                  </span>
                                  <span className="text-[10px] font-mono opacity-90">
                                    Preparación: {promotionBase100}% ({isPromotionEvaluated ? activePromotionDossier.phase3.finalScore.toFixed(2) : '0.00'}/5.00)
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {!isPromotionEvaluated && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-center gap-2">
                              <AlertCircle size={16} className="text-amber-600 shrink-0" />
                              <span>
                                <strong>Evaluación para Promoción No Realizada:</strong> El candidato aún no cuenta con evaluaciones registradas para el cargo destino. Las puntuaciones reflejan 0.00 pts hasta que se completen los enlaces de evaluación.
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 2. GRÁFICO DE ANÁLISIS DE BRECHA (GAP ANALYSIS GRAPH VS PUESTO SUPERIOR) */}
                        {(promotionActiveSection === 'brechas' || promotionActiveSection === 'all') && (
                          <div className="w-full animate-in fade-in duration-200">
                            <CompetencyGapAnalysisChart
                              currentPosition={state.employeeInfo.position}
                              directorate={state.employeeInfo.directorate}
                              isPromotion={true}
                              targetPosition={targetPos}
                              scores={{
                                ...(state.promotionEval?.scores || {}),
                                ...(state.supervisorEval?.scores || {}),
                                ...(state.selfEval?.scores || {})
                              }}
                              section1Score={metrics.block1Score}
                              section3Score={effectivePotentialScore}
                              collaboratorName={`${state.employeeInfo.firstName} ${state.employeeInfo.lastName}`}
                              onNavigateToPdi={() => {
                                setPromotionActiveSection('impresion_pdf');
                              }}
                            />
                          </div>
                        )}

                        {/* 3. MATRIZ 9-BOX DE DESEMPEÑO Y POTENCIAL (FILTRO DE ELEGIBILIDAD PARA PROMOCIÓN) */}
                        {(promotionActiveSection === 'ninebox_promocion' || promotionActiveSection === 'all') && (
                          <div className="w-full animate-in fade-in duration-200">
                            <NineBox
                              performanceScore={metrics.isEvaluated ? (metrics.finalScore || metrics.block1Score) : 0}
                              potentialScore={effectivePotentialScore}
                              collaboratorName={`${state.employeeInfo.firstName} ${state.employeeInfo.lastName}`}
                              isPromotionContext={true}
                              targetPosition={targetPos}
                            />
                          </div>
                        )}

                        {/* 4. RESULTADOS DEL TEST BIG 5 (INVENTARIO PSICOMÉTRICO - LAS 5 DIMENSIONES) */}
                        {(promotionActiveSection === 'bigfive' || promotionActiveSection === 'all') && (
                          <div className="w-full animate-in fade-in duration-200">
                            <PsychometricDossierVisualizer
                              result={activeBigFiveResults}
                              candidateName={`${state.employeeInfo.firstName} ${state.employeeInfo.lastName}`}
                              targetPosition={targetPos}
                            />
                          </div>
                        )}

                        {/* 5. VISTA PREVIA E IMPRESIÓN PDF DE EXPEDIENTE FORMAL DE EVALUACIÓN */}
                        {(promotionActiveSection === 'impresion_pdf' || promotionActiveSection === 'all') && (
                          <div className="space-y-6 animate-in fade-in duration-200">
                            {/* Dictamen de Supervisión y PDI de Promoción */}
                            <div id="pdi-promocion-card" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Dictamen del Supervisor */}
                              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
                                <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
                                  <ShieldCheck size={16} className="text-[#D99C00]" />
                                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                                    Dictamen de Supervisión Directa (180° Promoción)
                                  </h4>
                                </div>
                                <div className="space-y-2 text-xs">
                                  <div>
                                    <span className="font-bold text-[11px] text-zinc-700 block uppercase font-mono">Fortalezas para el cargo destino:</span>
                                    <p className="text-zinc-800 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 mt-1 leading-relaxed">
                                      {state.promotionEval?.openAnswers?.strengths || activePromotionDossier.phase3.strengthsRecognition || 'Demuestra alta solvencia técnica, compromiso y orientación a resultados requeridos para el puesto destino.'}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-bold text-[11px] text-zinc-700 block uppercase font-mono">Brechas prioritarias (Primeros 90 días):</span>
                                    <p className="text-zinc-800 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 mt-1 leading-relaxed">
                                      {state.promotionEval?.openAnswers?.opportunities || activePromotionDossier.phase3.constructiveGapsReview || 'Consolidar liderazgo directivo, delegación de responsabilidades y visión estratégica de procesos.'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* PDI de Promoción */}
                              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
                                <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
                                  <Target size={16} className="text-[#D99C00]" />
                                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                                    Plan de Desarrollo Individual (PDI) de Promoción
                                  </h4>
                                </div>
                                <p className="text-xs text-zinc-600 leading-relaxed">
                                  Acciones estratégicas orientadas al cierre de brechas para el cargo superior <strong>{targetPos}</strong>:
                                </p>
                                <div className="space-y-2 text-xs">
                                  <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[#F1B400] text-black font-black font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                                    <div className="text-zinc-900">
                                      <strong className="block text-[11px]">Tutoría en Liderazgo y Supervisión Directa</strong>
                                      <span className="text-[11px] text-zinc-700">Acompañamiento semanal con la gerencia de área para afianzar el rol de conducción de equipos.</span>
                                    </div>
                                  </div>
                                  <div className="p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-white font-black font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                                    <div className="text-zinc-900">
                                      <strong className="block text-[11px]">Capacitación en Gestión de KPIs y Reportes Ejecutivos</strong>
                                      <span className="text-[11px] text-zinc-700">Dominio de tableros de control y presentación de resultados a nivel directivo.</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Informe Oficial Completo Imprimible */}
                            <div className="pt-4 border-t border-zinc-200">
                              <PromotionResultsView
                                dossier={activePromotionDossier}
                                employeeInfo={state.employeeInfo}
                                pdiGoals={state.pdiGoals}
                                pdiBreaches={state.pdiBreaches}
                                onUpdateGoals={(goals) => onUpdateState({ ...state, pdiGoals: goals })}
                                onUpdateBreaches={(breaches) => onUpdateState({ ...state, pdiBreaches: breaches })}
                                onUpdateDossier={(dossier) => onUpdateState({ ...state, promotionDossier: dossier })}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* EXPEDIENTE INTEGRAL DEL COLABORADOR: DESEMPEÑO + GAUSS Y MÉRITO */}
                  {(currentBlock === 'resumen' || currentBlock === 'calibracion') && (
                    <div className="space-y-6">
                      {/* Cabecera contextual de la sección activa seleccionada desde el menú */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl gap-2 shadow-2xs">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-zinc-500 uppercase text-[11px]">Perfil del Colaborador</span>
                          <span className="text-zinc-400">/</span>
                          <span className="font-bold text-zinc-700">Resultados de Evaluación de Desempeño</span>
                          <span className="text-zinc-400">/</span>
                          <span className="font-black text-[#D99C00] uppercase font-mono tracking-wide text-xs">
                            {individualActiveSection === 'desempeno' ? 'Desempeño y Competencias' :
                             individualActiveSection === 'potencial' ? 'Potencial y Liderazgo' :
                             individualActiveSection === 'ninebox' ? 'Matriz 9-Box' :
                             individualActiveSection === 'calibracion' ? 'Campana de Gauss, Distribución' :
                             individualActiveSection === 'pdi' ? 'Plan de Desarrollo Individual' : 'Vista Completa'}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2">
                          <span className="font-bold text-zinc-800">{state.employeeInfo.firstName} {state.employeeInfo.lastName}</span>
                          <span>({state.employeeInfo.idNumber || state.employeeInfo.id})</span>
                        </div>
                      </div>


                      {/* ========================================================================= */}
                      {/* SECCIÓN 1: RESULTADOS DE EVALUACIÓN DEL DESEMPEÑO Y COMPETENCIAS          */}
                      {/* ========================================================================= */}
                      {(individualActiveSection === 'desempeno' || individualActiveSection === 'all') && (
                        <>
                          <div id="fase-desempeno" className="border border-zinc-200/90 rounded-2xl bg-white shadow-xs overflow-hidden transition-all">
                        {/* Cabecera Desplegable Dinámica */}
                        <button
                          type="button"
                          onClick={() => togglePhase('fase1')}
                          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-zinc-50 via-white to-zinc-50 hover:bg-zinc-100/70 transition-all text-left cursor-pointer border-b border-zinc-100"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-zinc-950 text-[#F1B400] font-black font-mono text-sm flex items-center justify-center shadow-2xs">
                              1
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                                  Fase 1: Resultados de Evaluación del Desempeño
                                </h3>
                                {metrics.isEvaluated ? (
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                                    {metrics.finalScore.toFixed(2)} / 5.00 pts
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-300">
                                    Pendiente de Evaluar
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-500 mt-0.5 font-sans">
                                Expediente Integral • Evaluación Multifuente (360° / 180°) • Matriz 9-Box y RIASEC
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold text-zinc-500 hidden sm:inline">
                              {openPhases.fase1 ? 'Colapsar' : 'Desplegar'}
                            </span>
                            <div className={`w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center transition-transform duration-200 ${openPhases.fase1 ? 'rotate-180 bg-zinc-200 text-zinc-900' : 'text-zinc-500'}`}>
                              <ChevronDown size={18} />
                            </div>
                          </div>
                        </button>

                        {/* Contenido Dinámico de Fase 1 */}
                        {openPhases.fase1 && (
                          <div className="p-5 space-y-6 animate-in fade-in duration-200">

                          {/* Aviso si la evaluación aún no ha sido registrada */}
                          {!metrics.isEvaluated && (
                            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 text-amber-950 flex items-start sm:items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                                0.0
                              </div>
                              <div className="flex-1">
                                <h4 className="text-xs font-black uppercase text-amber-950 tracking-wider">
                                  Evaluación No Realizada • Resultados en 0.00 pts
                                </h4>
                                <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                                  Este colaborador aún no ha realizado la evaluación de desempeño regular. Las calificaciones oficiales y los diagnósticos de brechas se reflejarán automáticamente en este módulo una vez que los evaluadores completen sus formularios a través de los enlaces asignados.
                                </p>
                              </div>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 border border-amber-300 shrink-0 hidden sm:inline">
                                Pendiente
                              </span>
                            </div>
                          )}

                          {/* Ficha Resumen Oficial */}
                          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm text-zinc-900">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 mb-5 gap-3">
                              <div>
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D99C00] block mb-1">
                                  Ficha Resumen Oficial de Desempeño
                                </span>
                                <h2 className="text-xl font-black uppercase tracking-tight text-zinc-950">
                                  {state.employeeInfo.firstName} {state.employeeInfo.lastName}
                                </h2>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  {state.employeeInfo.position} | {state.employeeInfo.department} ({state.employeeInfo.directorate})
                                </p>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => window.print()}
                                  className="px-3 py-1.5 border border-zinc-300 rounded-lg text-xs font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                >
                                  <Printer size={13} /> Imprimir Ficha
                                </button>
                              </div>
                            </div>

                            {/* Ponderación Oficial: 60% KPI's + 30% Competencias + 10% Potencial = 100% */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                              {/* Bloque 1 (60%): Indicadores y Objetivos Clave */}
                              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 shadow-2xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] uppercase font-bold text-amber-950 font-mono">B1: Indicadores Clave (60%)</span>
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-950">Desempeño</span>
                                </div>
                                <div className="text-2xl font-mono font-black text-amber-950">
                                  {metrics.block1Score.toFixed(2)} <span className="text-xs font-normal text-zinc-500">/ 5.00</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-zinc-600 mt-1 font-mono">
                                  <span>{((metrics.block1Score / 5) * 100).toFixed(1)}% base 100</span>
                                  <span className="font-bold text-amber-900">+{(metrics.block1Score * 0.60).toFixed(2)} pts</span>
                                </div>
                              </div>

                              {/* Bloque 2 (30%): Evaluación por Competencias */}
                              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 shadow-2xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] uppercase font-bold text-blue-950 font-mono">B2: Competencias (30%)</span>
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-200 text-blue-950">Conductual</span>
                                </div>
                                <div className="text-2xl font-mono font-black text-blue-950">
                                  {metrics.block2Score.toFixed(2)} <span className="text-xs font-normal text-zinc-500">/ 5.00</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-zinc-600 mt-1 font-mono">
                                  <span>{((metrics.block2Score / 5) * 100).toFixed(1)}% base 100</span>
                                  <span className="font-bold text-blue-900">+{(metrics.block2Score * 0.30).toFixed(2)} pts</span>
                                </div>
                              </div>

                              {/* Bloque 3 (10%): Evaluación de Potencial y Liderazgo */}
                              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 shadow-2xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] uppercase font-bold text-purple-950 font-mono">B3: Potencial & Liderazgo (10%)</span>
                                  <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded ${
                                    metrics.potentialLevel === 'Alto'
                                      ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                      : metrics.potentialLevel === 'Medio'
                                      ? 'bg-blue-100 text-blue-950 border border-blue-300'
                                      : 'bg-amber-100 text-amber-950 border border-amber-300'
                                  }`}>
                                    {metrics.potentialLevel}
                                  </span>
                                </div>
                                <div className="text-2xl font-mono font-black text-purple-950">
                                  {effectivePotentialScore.toFixed(2)} <span className="text-xs font-normal text-zinc-500">/ 5.00</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-zinc-600 mt-1 font-mono">
                                  <span>{((effectivePotentialScore / 5) * 100).toFixed(1)}% base 100</span>
                                  <span className="font-bold text-purple-900">+{(effectivePotentialScore * 0.10).toFixed(2)} pts</span>
                                </div>
                              </div>

                              {/* Consolidado Oficial (100%) */}
                              <div className="p-4 rounded-xl bg-zinc-950 text-white shadow-sm border border-zinc-800">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] uppercase font-bold text-[#F1B400] font-mono">Calificación Total (100%)</span>
                                  <span className="text-[9px] font-mono text-zinc-400">
                                    {metrics.isEvaluated ? metrics.meritTier.percentile : '0.0%'}
                                  </span>
                                </div>
                                <div className="text-2xl font-mono font-black text-white">
                                  {metrics.finalScore.toFixed(2)} <span className="text-xs font-normal text-zinc-400">({metrics.base100Score} pts)</span>
                                </div>
                                <span className="text-[10px] text-[#F1B400] font-bold mt-1 block uppercase truncate">
                                  {metrics.isEvaluated ? `Tramo ${metrics.meritTier.id}: ${metrics.meritTier.name}` : 'EVALUACIÓN PENDIENTE (SIN CALIFICAR)'}
                                </span>
                              </div>
                            </div>

                            {/* Tarjeta de Diagnóstico e Interpretación Cualitativa del Potencial de Liderazgo */}
                            <div className="mb-6 p-4 rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50/60 via-white to-amber-50/30 shadow-2xs space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-purple-100">
                                <div className="flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-lg bg-purple-950 text-[#F1B400] font-black text-xs flex items-center justify-center font-mono shrink-0">
                                    B3
                                  </span>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-black text-xs uppercase tracking-wide text-zinc-950 font-mono">
                                        Interpretación Cualitativa: Potencial de Liderazgo (10% Ponderación)
                                      </h4>
                                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${metrics.potentialInterpretation.badgeBg}`}>
                                        {metrics.potentialInterpretation.levelBadge}
                                      </span>
                                    </div>
                                    <span className="text-[11px] font-bold text-purple-900 block mt-0.5">
                                      Tipología Directiva: {metrics.potentialInterpretation.leadershipCategory}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIndividualActiveSection('potencial');
                                    setTimeout(() => {
                                      const el = document.getElementById('seccion-potencial');
                                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                  }}
                                  className="text-xs font-bold text-purple-800 hover:text-purple-950 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-center shrink-0"
                                >
                                  <span>Ver Radar y 6 Dimensiones</span>
                                  <ArrowRight size={12} />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                                {/* Diagnóstico Cualitativo Principal */}
                                <div className="md:col-span-7 space-y-2">
                                  <p className="text-zinc-700 leading-relaxed text-[11.5px]">
                                    {metrics.potentialInterpretation.qualitativeDiagnostic}
                                  </p>
                                  <div className="p-2.5 rounded-xl bg-white border border-purple-200 text-zinc-800">
                                    <span className="text-[10px] font-mono font-bold text-purple-950 uppercase block mb-0.5">
                                      Nivel de Preparación para Mando y Sucesión:
                                    </span>
                                    <span className="font-semibold text-zinc-900 block text-xs">
                                      {metrics.potentialInterpretation.readinessLevel}
                                    </span>
                                  </div>
                                </div>

                                {/* Fortalezas y Focos de Desarrollo */}
                                <div className="md:col-span-5 space-y-2 bg-white/80 p-3 rounded-xl border border-purple-100">
                                  <div>
                                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block mb-1 flex items-center gap-1">
                                      <Sparkles size={11} className="text-emerald-600" /> Fortalezas de Agilidad Identificadas:
                                    </span>
                                    <ul className="space-y-1 list-disc list-inside text-[10.5px] text-zinc-700">
                                      {metrics.potentialInterpretation.agilityStrengths.map((str, idx) => (
                                        <li key={idx} className="leading-tight">{str}</li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="pt-1.5 border-t border-purple-100">
                                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block mb-1 flex items-center gap-1">
                                      <Target size={11} className="text-amber-600" /> Focos de Desarrollo para Liderazgo:
                                    </span>
                                    <ul className="space-y-1 list-disc list-inside text-[10.5px] text-zinc-700">
                                      {metrics.potentialInterpretation.developmentFocus.map((foc, idx) => (
                                        <li key={idx} className="leading-tight">{foc}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Breakdown by Evaluator Source */}
                            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2 pb-1.5 border-b border-zinc-200">
                                <span className="text-[10px] font-bold uppercase text-zinc-600 font-mono">
                                  Desglose de Responsabilidades y Puntuaciones por Evaluador
                                </span>
                                <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  Gobernanza: 60% Metas (Externos) + 30% Competencias (Auto) + 10% Potencial
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
                                <div className="p-2.5 bg-white rounded-lg border border-emerald-200 shadow-2xs">
                                  <span className="text-[9px] text-emerald-700 font-bold uppercase block">Autoevaluación</span>
                                  <span className="text-[9px] text-zinc-400 block mb-1">Únicamente Competencias (30%)</span>
                                  <span className="text-base font-black text-emerald-600 block">{metrics.block2Score.toFixed(2)} pts</span>
                                </div>
                                <div className="p-2.5 bg-white rounded-lg border border-zinc-200 shadow-2xs">
                                  <span className="text-[9px] text-amber-700 font-bold uppercase block">Supervisor Inmediato</span>
                                  <span className="text-[9px] text-zinc-400 block mb-1">Desempeño (60%) + Potencial (10%)</span>
                                  <span className="text-base font-black text-zinc-900 block">{metrics.evaluatorAverages.supervisor.toFixed(2)} pts</span>
                                </div>
                                <div className="p-2.5 bg-white rounded-lg border border-zinc-200 shadow-2xs">
                                  <span className="text-[9px] text-blue-700 font-bold uppercase block">Pares (Colegas)</span>
                                  <span className="text-[9px] text-zinc-400 block mb-1">Desempeño (60%) + Potencial (10%)</span>
                                  <span className="text-base font-black text-zinc-800 block">{metrics.evaluatorAverages.peer.toFixed(2)} pts</span>
                                </div>
                                <div className="p-2.5 bg-white rounded-lg border border-zinc-200 shadow-2xs">
                                  <span className="text-[9px] text-purple-700 font-bold uppercase block">Subordinados</span>
                                  <span className="text-[9px] text-zinc-400 block mb-1">Desempeño (60%) + Potencial (10%)</span>
                                  <span className="text-base font-black text-zinc-800 block">
                                    {hasSubordinates ? `${metrics.evaluatorAverages.subordinate.toFixed(2)} pts` : 'No Aplica'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Selector de Visualización: Barras de Brechas vs Niveles de Dominio vs Radar Polar */}
                          <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <BarChart3 size={16} className="text-[#D99C00]" />
                              <div>
                                <span className="text-xs font-black uppercase tracking-wider text-zinc-950 font-sans block">
                                  Análisis de Competencias y Brechas Identificadas (DTH-GFD-MC-01)
                                </span>
                                <span className="text-[11px] text-zinc-500">
                                  Evaluadas exclusivamente en Autoevaluación frente a los 4 Niveles de Dominio del Modelo Canguro.
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200 self-start sm:self-auto">
                              <button
                                onClick={() => setCompetencyVisualMode('gaps')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  competencyVisualMode === 'gaps'
                                    ? 'bg-zinc-950 text-white shadow-2xs'
                                    : 'text-zinc-600 hover:text-zinc-950'
                                }`}
                              >
                                <BarChart3 size={12} className={competencyVisualMode === 'gaps' ? 'text-[#F1B400]' : 'text-zinc-400'} />
                                Brechas Identificadas (Gaps)
                              </button>
                              <button
                                onClick={() => setCompetencyVisualMode('domain')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  competencyVisualMode === 'domain'
                                    ? 'bg-zinc-950 text-white shadow-2xs'
                                    : 'text-zinc-600 hover:text-zinc-950'
                                }`}
                              >
                                <Layers size={12} className={competencyVisualMode === 'domain' ? 'text-[#F1B400]' : 'text-zinc-400'} />
                                Niveles de Dominio Canguro
                              </button>
                              <button
                                onClick={() => setCompetencyVisualMode('radar')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  competencyVisualMode === 'radar'
                                    ? 'bg-zinc-950 text-white shadow-2xs'
                                    : 'text-zinc-600 hover:text-zinc-950'
                                }`}
                              >
                                <Target size={12} className={competencyVisualMode === 'radar' ? 'text-[#F1B400]' : 'text-zinc-400'} />
                                Radar Polar de Brechas
                              </button>
                              <button
                                onClick={() => setCompetencyVisualMode('all')}
                                className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                  competencyVisualMode === 'all'
                                    ? 'bg-[#F1B400] text-zinc-950 shadow-2xs font-black'
                                    : 'text-zinc-600 hover:text-zinc-950'
                                }`}
                              >
                                Todos
                              </button>
                            </div>
                          </div>

                          {/* 1. Gráfico de Barras Progresivas Comparativo de Brechas (Modelo Canguro DTH-GFD-MC-01) */}
                          {(competencyVisualMode === 'gaps' || competencyVisualMode === 'all') && (
                            <div className="w-full">
                              <CompetencyGapAnalysisChart
                                currentPosition={state.employeeInfo.position}
                                directorate={state.employeeInfo.directorate}
                                scores={{
                                  ...(state.selfEval?.scores || state.supervisorEval?.scores || {})
                                }}
                                section1Score={metrics.block1Score}
                                section3Score={effectivePotentialScore}
                                collaboratorName={`${state.employeeInfo.firstName} ${state.employeeInfo.lastName}`}
                                onNavigateToPdi={() => {
                                  setIndividualActiveSection('fase3');
                                  setOpenPhases(prev => ({ ...prev, fase3: true }));
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              />
                            </div>
                          )}

                          {/* 2. Ubicación en los 4 Niveles de Dominio del Modelo de Competencias Canguro */}
                          {(competencyVisualMode === 'domain' || competencyVisualMode === 'all') && (() => {
                            const empProfile = resolveEmployeeCompetencyProfile(state.employeeInfo.position, state.employeeInfo.directorate);
                            const compScores = (state.selfEval?.scores && Object.keys(state.selfEval.scores).length > 0)
                              ? state.selfEval.scores
                              : (state.supervisorEval?.scores || {});
                            
                            const activeComps = empProfile?.activeCompetencies || [];
                            const isEval = Object.keys(compScores).length > 0 && Object.values(compScores).some(v => typeof v === 'number' && v > 0);

                            const levelAComps: Array<{ comp: typeof activeComps[0]; score: number; gap: number }> = [];
                            const levelBComps: Array<{ comp: typeof activeComps[0]; score: number; gap: number }> = [];
                            const levelCComps: Array<{ comp: typeof activeComps[0]; score: number; gap: number }> = [];
                            const levelDComps: Array<{ comp: typeof activeComps[0]; score: number; gap: number }> = [];
                            const pendingComps: typeof activeComps = [];

                            const standardTarget = 3.75; // Nivel B (Alto / Autónomo)

                            activeComps.forEach(comp => {
                              const sc = compScores[comp.id];
                              if (!isEval || typeof sc !== 'number' || sc <= 0) {
                                pendingComps.push(comp);
                              } else {
                                const gap = Number((sc - standardTarget).toFixed(2));
                                if (sc >= 4.38) {
                                  levelAComps.push({ comp, score: sc, gap });
                                } else if (sc >= 3.13) {
                                  levelBComps.push({ comp, score: sc, gap });
                                } else if (sc >= 1.88) {
                                  levelCComps.push({ comp, score: sc, gap });
                                } else {
                                  levelDComps.push({ comp, score: sc, gap });
                                }
                              }
                            });

                            const compliantCount = levelAComps.length + levelBComps.length;
                            const totalEvalCount = activeComps.length - pendingComps.length;
                            const compliantPercent = totalEvalCount > 0 ? Math.round((compliantCount / totalEvalCount) * 100) : 0;

                            return (
                              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-zinc-900 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Award size={18} className="text-[#F1B400]" />
                                      <h4 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                                        Ubicación en los Niveles de Dominio — Modelo de Competencias Canguro
                                      </h4>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                      Mapeo de las {activeComps.length} competencias del colaborador en los 4 niveles de desarrollo institucional (DTH-GFD-MC-01, Pág. 7).
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-right font-mono">
                                      <span className="text-[10px] text-emerald-700 block uppercase font-bold">Apego al Estándar (Nivel B o A)</span>
                                      <span className="text-sm font-black text-emerald-800">{compliantPercent}% ({compliantCount}/{totalEvalCount || activeComps.length})</span>
                                    </div>
                                  </div>
                                </div>

                                {!isEval && (
                                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 flex items-center justify-center gap-2">
                                    <AlertCircle size={15} className="text-amber-500" />
                                    <span>La autoevaluación está pendiente de llenado. Complete el cuestionario para mapear las competencias en los niveles de dominio.</span>
                                  </div>
                                )}

                                {/* Cuadrícula de 4 Niveles Oficiales Canguro */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                  {/* NIVEL 4: SUPERIOR (A) */}
                                  <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 flex flex-col justify-between">
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300">
                                          NIVEL 4 (A)
                                        </span>
                                        <span className="text-xs font-mono font-bold text-purple-800">
                                          {levelAComps.length} {levelAComps.length === 1 ? 'competencia' : 'competencias'}
                                        </span>
                                      </div>
                                      <h5 className="font-bold text-xs text-purple-950 mb-0.5">
                                        {CANGURO_GENERAL_LEVELS.A.name}
                                      </h5>
                                      <span className="text-[10px] font-mono text-purple-700 block mb-2">
                                        5.00 pts (76% - 100%) • Estratégico
                                      </span>
                                      <p className="text-[10.5px] text-purple-900/80 leading-relaxed line-clamp-3 mb-3">
                                        {CANGURO_GENERAL_LEVELS.A.description}
                                      </p>
                                    </div>

                                    <div className="space-y-1.5 pt-2 border-t border-purple-200/80">
                                      {levelAComps.length === 0 ? (
                                        <span className="text-[10px] font-mono text-zinc-400 italic block">Ninguna competencia en este nivel</span>
                                      ) : (
                                        levelAComps.map(({ comp, score, gap }) => (
                                          <div key={comp.id} className="p-1.5 rounded-lg bg-white border border-purple-200 flex items-center justify-between text-xs">
                                            <span className="text-[11px] font-bold text-zinc-900 truncate pr-1" title={comp.name}>
                                              {comp.name}
                                            </span>
                                            <span className="text-[10px] font-mono font-black text-purple-700 shrink-0">
                                              {score.toFixed(2)} pts
                                            </span>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>

                                  {/* NIVEL 3: ALTO (B) - ESTÁNDAR REQUERIDO */}
                                  <div className="p-4 rounded-xl border-2 border-amber-400 bg-amber-50/50 flex flex-col justify-between shadow-2xs">
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-amber-200 text-amber-950 border border-amber-400 flex items-center gap-1">
                                          ★ NIVEL 3 (B)
                                        </span>
                                        <span className="text-xs font-mono font-bold text-amber-900">
                                          {levelBComps.length} {levelBComps.length === 1 ? 'competencia' : 'competencias'}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <h5 className="font-bold text-xs text-amber-950 mb-0.5">
                                          {CANGURO_GENERAL_LEVELS.B.name}
                                        </h5>
                                        <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                                          Estándar Requerido
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-mono text-amber-800 block mb-2">
                                        3.75 pts (51% - 75%) • Táctico / Autónomo
                                      </span>
                                      <p className="text-[10.5px] text-amber-900/80 leading-relaxed line-clamp-3 mb-3">
                                        {CANGURO_GENERAL_LEVELS.B.description}
                                      </p>
                                    </div>

                                    <div className="space-y-1.5 pt-2 border-t border-amber-300">
                                      {levelBComps.length === 0 ? (
                                        <span className="text-[10px] font-mono text-zinc-400 italic block">Ninguna competencia en este nivel</span>
                                      ) : (
                                        levelBComps.map(({ comp, score, gap }) => (
                                          <div key={comp.id} className="p-1.5 rounded-lg bg-white border border-amber-300 flex items-center justify-between text-xs">
                                            <span className="text-[11px] font-bold text-zinc-900 truncate pr-1" title={comp.name}>
                                              {comp.name}
                                            </span>
                                            <span className="text-[10px] font-mono font-black text-amber-800 shrink-0">
                                              {score.toFixed(2)} pts
                                            </span>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>

                                  {/* NIVEL 2: INTERMEDIO (C) */}
                                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between">
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
                                          NIVEL 2 (C)
                                        </span>
                                        <span className="text-xs font-mono font-bold text-blue-800">
                                          {levelCComps.length} {levelCComps.length === 1 ? 'competencia' : 'competencias'}
                                        </span>
                                      </div>
                                      <h5 className="font-bold text-xs text-blue-950 mb-0.5">
                                        {CANGURO_GENERAL_LEVELS.C.name}
                                      </h5>
                                      <span className="text-[10px] font-mono text-blue-700 block mb-2">
                                        2.50 pts (26% - 50%) • Brecha Leve
                                      </span>
                                      <p className="text-[10.5px] text-blue-900/80 leading-relaxed line-clamp-3 mb-3">
                                        {CANGURO_GENERAL_LEVELS.C.description}
                                      </p>
                                    </div>

                                    <div className="space-y-1.5 pt-2 border-t border-blue-200/80">
                                      {levelCComps.length === 0 ? (
                                        <span className="text-[10px] font-mono text-zinc-400 italic block">Ninguna competencia en este nivel</span>
                                      ) : (
                                        levelCComps.map(({ comp, score, gap }) => (
                                          <div key={comp.id} className="p-1.5 rounded-lg bg-white border border-blue-200 flex items-center justify-between text-xs">
                                            <span className="text-[11px] font-bold text-zinc-900 truncate pr-1" title={comp.name}>
                                              {comp.name}
                                            </span>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <span className="text-[9.5px] font-mono text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                                                {gap.toFixed(2)}
                                              </span>
                                              <span className="text-[10px] font-mono font-black text-blue-700">
                                                {score.toFixed(2)} pts
                                              </span>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>

                                  {/* NIVEL 1: MÍNIMO (D) */}
                                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between">
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300">
                                          NIVEL 1 (D)
                                        </span>
                                        <span className="text-xs font-mono font-bold text-rose-800">
                                          {levelDComps.length} {levelDComps.length === 1 ? 'competencia' : 'competencias'}
                                        </span>
                                      </div>
                                      <h5 className="font-bold text-xs text-rose-950 mb-0.5">
                                        {CANGURO_GENERAL_LEVELS.D.name}
                                      </h5>
                                      <span className="text-[10px] font-mono text-rose-700 block mb-2">
                                        1.25 pts (0% - 25%) • Brecha Crítica
                                      </span>
                                      <p className="text-[10.5px] text-rose-900/80 leading-relaxed line-clamp-3 mb-3">
                                        {CANGURO_GENERAL_LEVELS.D.description}
                                      </p>
                                    </div>

                                    <div className="space-y-1.5 pt-2 border-t border-rose-200/80">
                                      {levelDComps.length === 0 ? (
                                        <span className="text-[10px] font-mono text-zinc-400 italic block">Ninguna competencia en este nivel</span>
                                      ) : (
                                        levelDComps.map(({ comp, score, gap }) => (
                                          <div key={comp.id} className="p-1.5 rounded-lg bg-white border border-rose-200 flex items-center justify-between text-xs">
                                            <span className="text-[11px] font-bold text-zinc-900 truncate pr-1" title={comp.name}>
                                              {comp.name}
                                            </span>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <span className="text-[9.5px] font-mono text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-200 font-bold">
                                                {gap.toFixed(2)}
                                              </span>
                                              <span className="text-[10px] font-mono font-black text-rose-700">
                                                {score.toFixed(2)} pts
                                              </span>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* 3. Radar Multidimensional de Brechas Identificadas */}
                          {(competencyVisualMode === 'radar' || competencyVisualMode === 'all') && (
                            <div className="w-full">
                              <RadarMetrics state={state} />
                            </div>
                          )}

                          {/* Perfil Vocacional y Aspiracional (Modelo RIASEC) */}
                          {state.riasecProfile && (
                            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-zinc-900">
                              <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 mb-4">
                                <Compass size={18} className="text-[#D99C00]" />
                                <div>
                                  <h4 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                                    Perfil Vocacional y Aspiracional (Modelo RIASEC)
                                  </h4>
                                  <p className="text-xs text-zinc-500 mt-0.5">
                                    Aspiraciones profesionales, motivadores intrínsecos y visión de legado en el Universo Canguro.
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                                  <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Motivadores Clave</span>
                                  <div className="flex flex-wrap gap-1">
                                    {(state.riasecProfile?.topMotivators || []).map((m, i) => (
                                      <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded">
                                        {m}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 md:col-span-2">
                                  <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Aspiración Profesional</span>
                                  <p className="text-xs text-zinc-800 font-medium">
                                    "{state.riasecProfile?.careerAspirations || 'Desarrollo y crecimiento profesional en Canguro.'}"
                                  </p>
                                </div>
                              </div>

                              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 text-xs">
                                <strong className="text-amber-950 font-mono text-[10px] uppercase block mb-0.5">Visión de Legado Institucional:</strong>
                                <p className="text-zinc-700 italic">"{state.riasecProfile?.legacyVision || 'Aportar valor continuo a la organización.'}"</p>
                              </div>
                            </div>
                          )}

                          {/* OBSERVACIONES MANUALES DEL ADMINISTRADOR */}
                          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-zinc-900 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
                              <div className="flex items-center gap-2">
                                <MessageSquare size={16} className="text-[#D99C00]" />
                                <div>
                                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950 font-sans">
                                    Observaciones y Comentarios de Talento Humano (Expediente del Colaborador)
                                  </h4>
                                  <p className="text-[11px] text-zinc-500">
                                    Registro manual de notas del evaluador, acuerdos de retroalimentación y seguimiento del desempeño.
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {notesSaved && (
                                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1 animate-in fade-in">
                                    <CheckCircle size={12} /> Guardado Oficial
                                  </span>
                                )}
                                <button
                                  onClick={() => {
                                    onUpdateState({ ...state, adminNotes: adminNotesText });
                                    setNotesSaved(true);
                                    setTimeout(() => setNotesSaved(false), 2500);
                                  }}
                                  className="px-3.5 py-1.5 bg-zinc-950 hover:bg-[#F1B400] text-white hover:text-black font-bold text-xs uppercase rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                                >
                                  <Save size={13} /> Guardar Observaciones
                                </button>
                              </div>
                            </div>

                            <div>
                              <textarea
                                value={adminNotesText}
                                onChange={(e) => setAdminNotesText(e.target.value)}
                                placeholder="Escriba aquí las observaciones institucionales sobre el proceso de evaluación, acuerdos de la sesión de feedback, compromisos del colaborador o incidencias relevantes del ciclo de desempeño..."
                                rows={4}
                                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs text-zinc-900 font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#F1B400]"
                              />
                              <span className="text-[10px] text-zinc-400 font-mono block mt-1">
                                Las observaciones quedan registradas en el expediente histórico del colaborador.
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {individualActiveSection === 'desempeno' && (
                      <div className="flex items-center justify-end p-3.5 bg-white border border-zinc-200 rounded-xl shadow-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setIndividualActiveSection('potencial');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-zinc-950 text-white hover:bg-zinc-800 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <span>Avanzar a Sección 2: Potencial y Liderazgo</span>
                          <ChevronRight size={14} className="text-[#F1B400]" />
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* ========================================================================= */}
                {/* SECCIÓN 2: POTENCIAL Y LIDERAZGO (RADAR + TABLA PONDERACIÓN EJE Y)        */}
                {/* ========================================================================= */}
                {(individualActiveSection === 'potencial' || individualActiveSection === 'all') && (
                  <div id="seccion-potencial" className="space-y-4 animate-in fade-in duration-200">
                    <PotentialLeadershipDashboard
                      scores={combinedScoresForPotential}
                      performanceScore={metrics.isEvaluated ? (metrics.finalScore || metrics.block1Score) : 0}
                      collaboratorName={`${state.employeeInfo.firstName} ${state.employeeInfo.lastName}`}
                      position={state.employeeInfo.position}
                      department={state.employeeInfo.department}
                      isEvaluated={metrics.isEvaluated}
                      onNavigateToPdi={() => {
                        setIndividualActiveSection('pdi');
                        setOpenPhases(prev => ({ ...prev, fase3: true }));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />

                    {individualActiveSection === 'potencial' && (
                      <div className="flex items-center justify-between p-3.5 bg-white border border-zinc-200 rounded-xl shadow-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setIndividualActiveSection('desempeno');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-all cursor-pointer active:scale-95"
                        >
                          <ChevronLeft size={14} />
                          <span>Sección 1: Desempeño & Competencias</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIndividualActiveSection('ninebox');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-zinc-950 text-white hover:bg-zinc-800 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <span>Avanzar a Sección 3: Matriz Nine-Box</span>
                          <ChevronRight size={14} className="text-[#F1B400]" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SECCIÓN 3: MATRIZ NINE-BOX DE DESEMPEÑO Y POTENCIAL                       */}
                {/* ========================================================================= */}
                {(individualActiveSection === 'ninebox' || individualActiveSection === 'all') && (
                  <div id="seccion-ninebox" className="space-y-4 animate-in fade-in duration-200">
                    <div className="w-full">
                      <NineBox
                        performanceScore={metrics.isEvaluated ? (metrics.finalScore || metrics.block1Score) : 0}
                        potentialScore={effectivePotentialScore}
                        collaboratorName={`${state.employeeInfo.firstName} ${state.employeeInfo.lastName}`}
                      />
                    </div>

                    {individualActiveSection === 'ninebox' && (
                      <div className="flex items-center justify-between p-3.5 bg-white border border-zinc-200 rounded-xl shadow-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setIndividualActiveSection('potencial');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-all cursor-pointer active:scale-95"
                        >
                          <ChevronLeft size={14} />
                          <span>Sección 2: Potencial y Liderazgo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIndividualActiveSection('calibracion');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-zinc-950 text-white hover:bg-zinc-800 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <span>Avanzar a Sección 4: Calibración Gauss</span>
                          <ChevronRight size={14} className="text-[#F1B400]" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SECCIÓN 4: CAMPANA DE GAUSS Y GUÍA DE MÉRITO (DESPLEGABLE DINÁMICO)       */}
                {/* ========================================================================= */}
                {(individualActiveSection === 'calibracion' || individualActiveSection === 'all') && (
                  <>
                    <div id="fase-gauss" className="border border-zinc-200/90 rounded-2xl bg-white shadow-xs overflow-hidden transition-all">
                    {/* Cabecera Desplegable Dinámica */}
                    <button
                      type="button"
                      onClick={() => togglePhase('fase2')}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-zinc-50 via-white to-zinc-50 hover:bg-zinc-100/70 transition-all text-left cursor-pointer border-b border-zinc-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-zinc-950 text-[#F1B400] font-black font-mono text-sm flex items-center justify-center shadow-2xs">
                          4
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                              Sección 4: Campana de Gauss y Guía de Mérito
                            </h3>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                              Percentil P{metrics.percentileRank} • {metrics.meritTier.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-0.5 font-sans">
                            Distribución Normal • Calibración Forzada Canguro • Política Salarial y Beneficios
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-zinc-500 hidden sm:inline">
                          {openPhases.fase2 ? 'Colapsar' : 'Desplegar'}
                        </span>
                        <div className={`w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center transition-transform duration-200 ${openPhases.fase2 ? 'rotate-180 bg-zinc-200 text-zinc-900' : 'text-zinc-500'}`}>
                          <ChevronDown size={18} />
                        </div>
                      </div>
                    </button>

                    {/* Contenido Dinámico de Fase 2 */}
                    {openPhases.fase2 && (
                      <div className="p-5 space-y-6 animate-in fade-in duration-200">

                          {/* Curva Gaussiana de Calibración con Comparativa de Pares */}
                          <NormalCurve
                            score={metrics.finalScore}
                            collaboratorName={`${state.employeeInfo.firstName} ${state.employeeInfo.lastName}`}
                            positionTitle={state.employeeInfo.position}
                            directorateName={state.employeeInfo.directorate}
                            meritTier={metrics.meritTier}
                            mediaScore={benchmarks.mediaScore}
                            medianaScore={benchmarks.medianaScore}
                            organizationAvg={benchmarks.organizationAvg}
                            directorateAvg={benchmarks.directorateAvg}
                            peersAvg={benchmarks.peersAvg}
                            peersCount={benchmarks.peersCount}
                            isEvaluated={metrics.isEvaluated}
                          />

                          {/* Tabla Maestra de la Guía de Mérito */}
                          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-zinc-900">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 mb-4 gap-2">
                              <div>
                                <h4 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-sans">
                                  Tabla Maestra de la Guía de Mérito Salarial y Talento
                                </h4>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  Distribución forzada bajo Curva Normal Canguro para gobernar aumentos, bonos y sucesiones.
                                </p>
                              </div>
                              <span className="text-xs font-mono font-bold text-zinc-700 bg-zinc-100 px-2 py-1 rounded">
                                Percentil Evaluado: {metrics.isEvaluated ? `P${metrics.percentileRank}` : 'Pendiente'}
                              </span>
                            </div>

                            <div className="overflow-x-auto border border-zinc-200 rounded-xl">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-zinc-950 text-white font-mono text-[10px] uppercase tracking-wider">
                                  <tr>
                                    <th className="p-3">Tramo</th>
                                    <th className="p-3">Denominación Oficial</th>
                                    <th className="p-3 text-center">Rango Puntos</th>
                                    <th className="p-3 text-center">Base 100</th>
                                    <th className="p-3 text-center">Percentil</th>
                                    <th className="p-3">Política Salarial y Beneficios</th>
                                    <th className="p-3 text-center">¿Promoción / Sucesión?</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200">
                                  {Object.values(MERIT_TIERS).map((tier: MeritTier) => {
                                    const isCurrent = metrics.meritTier.id === tier.id;

                                    return (
                                      <tr
                                        key={tier.id}
                                        className={`transition-colors ${
                                          isCurrent
                                            ? 'bg-amber-100/50 font-bold border-l-4 border-l-[#F1B400]'
                                            : 'hover:bg-zinc-50'
                                        }`}
                                      >
                                        <td className="p-3 font-mono font-black">{tier.id}</td>
                                        <td className="p-3">
                                          <span className="font-bold text-zinc-950 block">{tier.name}</span>
                                          <span className="text-[10px] text-zinc-500 block">{tier.targetPopulation}</span>
                                        </td>
                                        <td className="p-3 text-center font-mono">{tier.minScore.toFixed(2)} - {tier.maxScore.toFixed(2)}</td>
                                        <td className="p-3 text-center font-mono">{tier.minBase100} - {tier.maxBase100} pts</td>
                                        <td className="p-3 text-center font-mono text-zinc-600">{tier.percentile}</td>
                                        <td className="p-3 text-zinc-900 text-[11px] leading-tight font-medium">{tier.salaryPolicy}</td>
                                        <td className="p-3 text-center font-bold">
                                          {tier.enablesSuccession ? (
                                            <span className="text-emerald-800 font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 font-black">
                                              SÍ (Candidato a Promoción)
                                            </span>
                                          ) : (
                                            <span className="text-zinc-400 font-mono text-[10px]">NO</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {individualActiveSection === 'calibracion' && (
                      <div className="flex items-center justify-between p-3.5 bg-white border border-zinc-200 rounded-xl shadow-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setIndividualActiveSection('ninebox');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-all cursor-pointer active:scale-95"
                        >
                          <ChevronLeft size={14} />
                          <span>Sección 3: Matriz Nine-Box</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigateTo('expediente', 'pdi');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-zinc-950 text-white hover:bg-zinc-800 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <span>Avanzar a Plan de Desarrollo Individual (PDI)</span>
                          <ChevronRight size={14} className="text-[#F1B400]" />
                        </button>
                      </div>
                    )}
                  </>
                )}
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* BLOQUE DEDICADO: PLAN DE DESARROLLO INDIVIDUAL (PDI CONSOLIDADO)          */}
                  {/* ========================================================================= */}
                  {currentBlock === 'pdi' && (() => {
                    const activePromotionDossier = resolveOrCreatePromotionDossier(state.employeeInfo, state.promotionDossier);
                    const targetPos = activePromotionDossier.targetPosition || state.employeeInfo.targetPromotionPosition || 'Cargo Superior';

                    return (
                      <div className="space-y-6 animate-in fade-in duration-200">
                        {/* Cabecera contextual exclusiva */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono font-bold text-zinc-500 uppercase text-[11px]">Perfil del Colaborador</span>
                            <span className="text-zinc-400">/</span>
                            <span className="font-black text-[#D99C00] uppercase font-mono tracking-wide text-xs flex items-center gap-1.5">
                              <Target size={13} className="text-[#D99C00]" />
                              Plan de Desarrollo Individual (PDI)
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-2">
                            <span className="font-bold text-zinc-800">{state.employeeInfo.firstName} {state.employeeInfo.lastName}</span>
                            <span>({state.employeeInfo.idNumber || state.employeeInfo.id})</span>
                          </div>
                        </div>

                        {/* Banner Informativo de Consolidación Multifuente */}
                        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-zinc-950 text-[#F1B400]">
                                <Target size={16} />
                              </span>
                              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950">
                                Plan de Desarrollo Individual Consolidado (PDI 70-20-10)
                              </h3>
                            </div>
                            <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed">
                              Este plan articula el cierre sistemático de brechas combinando la retroalimentación de la <strong>Evaluación del Desempeño Multifuente (360°/180°)</strong> con el <strong>Dictamen de Supervisión Directa y PDI de Promoción (180°)</strong>.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                            <span className="px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-700 shadow-2xs flex items-center gap-1.5">
                              <Award size={12} className="text-[#D99C00]" /> Desempeño 360°/180°
                            </span>
                            <span className="text-zinc-400">+</span>
                            <span className="px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-700 shadow-2xs flex items-center gap-1.5">
                              <Sparkles size={12} className="text-[#D99C00]" /> Promoción 180°
                            </span>
                          </div>
                        </div>

                        {/* Alimentación del PDI: Dictamen de Supervisión Directa y PDI de Promoción */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Dictamen de Supervisión Directa */}
                          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
                            <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
                              <ShieldCheck size={16} className="text-[#D99C00]" />
                              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                                Dictamen de Supervisión Directa (180° Promoción)
                              </h4>
                            </div>
                            <div className="space-y-3 text-xs">
                              <div>
                                <span className="font-bold text-[11px] text-zinc-700 block uppercase font-mono">Fortalezas para el cargo destino:</span>
                                <p className="text-zinc-800 bg-zinc-50 p-3 rounded-lg border border-zinc-200 mt-1 leading-relaxed text-justify">
                                  {state.promotionEval?.openAnswers?.strengths || activePromotionDossier.phase3.strengthsRecognition || '1. Dominio exhaustivo de protocolos de control interno, facturación fiscal y cuadres de caja en tiendas El Canguro. 2. Excelencia sostenida en atención al cliente, venta consultiva y modelaje de estándares de servicio al equipo. 3. Capacidad demostrada para mantener la serenidad, el enfoque y la disciplina operativa en jornadas comerciales de alta presión. 4. Alta adherencia a las políticas de custodia patrimonial y prevención de mermas de inventario.'}
                                </p>
                              </div>
                              <div>
                                <span className="font-bold text-[11px] text-zinc-700 block uppercase font-mono">Brechas prioritarias (Primeros 90 días):</span>
                                <p className="text-zinc-800 bg-zinc-50 p-3 rounded-lg border border-zinc-200 mt-1 leading-relaxed text-justify">
                                  {state.promotionEval?.openAnswers?.opportunities || activePromotionDossier.phase3.constructiveGapsReview || '1. Desarrollo de Equipos y Liderar con el Ejemplo: Desarrollar mayor confianza en la delegación estructurada y autónoma de tareas al equipo para evitar sobrecarga personal en horas pico. 2. Capacidad de Análisis y Prevención de Pérdidas: Profundizar en la lectura de indicadores de rotación comercial para anticipar pedidos a almacén central antes del agotamiento de inventario crítico.'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* PDI de Promoción */}
                          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3">
                            <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
                              <Target size={16} className="text-[#D99C00]" />
                              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                                Plan de Desarrollo Individual (PDI) de Promoción
                              </h4>
                            </div>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                              Acciones estratégicas orientadas al cierre de brechas para el cargo superior <strong>{targetPos}</strong>:
                            </p>
                            <div className="space-y-3 text-xs">
                              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full bg-[#F1B400] text-black font-black font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                                <div className="text-zinc-900">
                                  <strong className="block text-xs text-zinc-950">Tutoría en Liderazgo y Supervisión Directa</strong>
                                  <span className="text-[11px] text-zinc-700 leading-relaxed mt-0.5 block">
                                    Acompañamiento semanal con la gerencia de área para afianzar el rol de conducción de equipos.
                                  </span>
                                </div>
                              </div>
                              <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50 flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full bg-zinc-800 text-white font-black font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                                <div className="text-zinc-900">
                                  <strong className="block text-xs text-zinc-950">Capacitación en Gestión de KPIs y Reportes Ejecutivos</strong>
                                  <span className="text-[11px] text-zinc-700 leading-relaxed mt-0.5 block">
                                    Dominio de tableros de control y presentación de resultados a nivel directivo.
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Matriz Integral 70-20-10 y Metas del Colaborador */}
                        <div className="border border-zinc-200 rounded-2xl bg-white shadow-xs p-5 space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                            <div>
                              <h4 className="text-sm font-black uppercase tracking-wider text-zinc-950">
                                Matriz Integral de Acciones de Desarrollo (Metodología 70-20-10)
                              </h4>
                              <p className="text-xs text-zinc-500 mt-0.5">
                                Diagnóstico de competencias críticas con brechas detectadas y asignación de planes de acción formativa.
                              </p>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                              Enriquecido en Vivo
                            </span>
                          </div>

                          <PDI
                            state={state}
                            onUpdateGoals={(upd) => onUpdateState({ ...state, pdiGoals: upd })}
                            onUpdateBreaches={(upd) => onUpdateState({ ...state, pdiBreaches: upd })}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* BLOQUE 5: PLAN DE SUCESIÓN EJECUTIVA (ACCESO CONDICIONAL) */}
                  {currentBlock === 'sucesion' && isSuccessionEligible && (
                    <div className="space-y-6 animate-in fade-in">
                      {/* Succession Plan Header Banner */}
                      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 uppercase border border-emerald-300">
                              Programa de Continuidad del Liderazgo
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">Corporativo</span>
                          </div>
                          <h3 className="text-lg font-black uppercase text-zinc-950 tracking-tight">
                            Matriz de Sucesión y Reemplazo en Posiciones Críticas
                          </h3>
                          <p className="text-xs text-zinc-500 mt-0.5 max-w-2xl leading-relaxed">
                            Mapeo estratégico de posiciones clave de DISTRICUEROS EL CANGURO, C.A. Las posiciones culminan en Dirección de Área y miembros del Comité Ejecutivo. <em>(Presidencia reservada a socios fundadores; Dirección General no existe en organigrama).</em>
                          </p>
                        </div>

                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-center shrink-0">
                          <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Talento Elegible Activo</span>
                          <span className="text-sm font-black text-emerald-950 uppercase">
                            {state.employeeInfo.firstName} {state.employeeInfo.lastName}
                          </span>
                          <span className="block text-[10px] text-zinc-500 font-mono">Score: {metrics.finalScore.toFixed(2)} pts</span>
                        </div>
                      </div>

                      {/* Pool of High Talent (>= 4.5 pts) */}
                      {(() => {
                        const eligibleTalentPool = CANGURO_COLLABORATORS.filter(c => (c.scores?.performance || 0) >= 4.5 || (c.scores?.potential || 0) >= 4.0);
                        return (
                          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-4">
                              <div className="flex items-center gap-2">
                                <Users size={16} className="text-[#D99C00]" />
                                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                                  Pool Oficial de Sucesores y Talento Clave (Tramo 5: Desempeño Sobresaliente)
                                </h4>
                              </div>
                              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {eligibleTalentPool.length} colaborador(es) calificado(s)
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {eligibleTalentPool.map(c => (
                                <div key={c.info.id} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 flex items-center justify-between gap-3">
                                  <div>
                                    <span className="font-bold text-xs text-zinc-950 block">
                                      {c.info.firstName} {c.info.lastName}
                                    </span>
                                    <span className="text-[11px] text-zinc-600 block">
                                      {c.info.position} — {c.info.department}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-400">
                                      {c.info.idNumber} | Antigüedad: {c.info.tenureYears || 3} años
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => handleSelectCollaborator(c.info.id || '')}
                                    className="px-2.5 py-1 bg-zinc-950 text-white font-bold text-[10px] uppercase rounded-lg hover:bg-[#F1B400] hover:text-black transition-colors"
                                  >
                                    Ver Ficha
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Critical Positions Replacement Cards */}
                      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm text-zinc-900 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                              Matriz de Reemplazo en Posiciones Críticas
                            </h4>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Planificación de relevo y blindaje de continuidad operativa de la cadena nacional.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {SUCCESSION_CRITICAL_POSITIONS.map((pos) => (
                            <div key={pos.id} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Building2 size={15} className="text-[#D99C00]" />
                                    <h5 className="text-sm font-black uppercase text-zinc-950">
                                      {pos.title}
                                    </h5>
                                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-red-900 border border-red-200 uppercase">
                                      Criticidad {pos.criticality}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-zinc-500 block mt-0.5">
                                    Ocupante Actual: <strong className="text-zinc-800">{pos.currentOccupant}</strong> ({pos.directorate})
                                  </span>
                                </div>
                              </div>

                              <div className="text-[11px] text-zinc-500 italic">
                                {pos.notes}
                              </div>

                              {/* Successor candidate row */}
                              <div className="pt-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5 font-mono">
                                  Sucesor Primario Mapeado
                                </span>

                                {(pos.successors || []).map((succ, sIdx) => (
                                  <div key={sIdx} className="p-3 bg-white rounded-lg border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-black uppercase text-zinc-950">
                                          {succ.employeeName}
                                        </span>
                                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-950 border border-emerald-200">
                                          {succ.readiness}
                                        </span>
                                      </div>
                                      <span className="text-[11px] text-zinc-500 block">
                                        Puesto Actual: {succ.currentPosition}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="text-right font-mono text-xs">
                                        <span className="text-[9px] text-zinc-400 block uppercase">Desempeño</span>
                                        <strong className="text-zinc-900">{succ.performanceScore.toFixed(2)} pts</strong>
                                      </div>
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                                        Riesgo Fuga: {succ.retentionRisk}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* ETAPA 4: MONITOREO Y AUDITORÍA EN VIVO                                    */}
          {/* ========================================================================= */}
          {currentStage === 'audit' && (
            <EvaluationAuditView
              currentState={state}
              onSelectCollaborator={(c) => {
                handleSelectCollaborator(c.info.id || '');
                navigateTo('expediente', 'resumen');
              }}
            />
          )}
        </main>
      </div>

      {/* Promotion Phases Manager Modal */}
      <PromotionPhasesManagerModal
        isOpen={promotionModalOpen}
        onClose={() => setPromotionModalOpen(false)}
        employeeInfo={state.employeeInfo}
        existingDossier={state.promotionDossier}
        onSaveDossier={(dossier) => {
          onUpdateState({ ...state, promotionDossier: dossier });
        }}
      />

      {/* Pilot Evaluation Modal (Prueba Piloto en Vivo) */}
      <PilotEvaluationModal
        isOpen={pilotModalOpen}
        onClose={() => setPilotModalOpen(false)}
        collaborator={currentActiveCollab}
        onSaveSuccess={handlePilotSaveSuccess}
      />

      {/* Database Service Status & Management Modal */}
      <DatabaseStatusModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
      />
    </div>
  );
}


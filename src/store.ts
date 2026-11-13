import { AppState, defaultEval, performanceQuestions, potentialQuestions, supervisorPotentialQuestions, analystPotentialQuestions, analystSupervisorPotentialQuestions, selfEvalQuestions, supervisorEvalQuestions, coordinatorPotentialQuestions, coordinatorSupervisorPotentialQuestions } from './types';

const STORAGE_KEY = 'canguro_talent_state';

export const loadState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Force update questions to always match the current code definition
      parsed.performanceQuestions = performanceQuestions;
      parsed.potentialQuestions = potentialQuestions;
      parsed.supervisorPotentialQuestions = supervisorPotentialQuestions;
      parsed.analystPotentialQuestions = analystPotentialQuestions;
      parsed.analystSupervisorPotentialQuestions = analystSupervisorPotentialQuestions;
      parsed.coordinatorPotentialQuestions = coordinatorPotentialQuestions;
      parsed.coordinatorSupervisorPotentialQuestions = coordinatorSupervisorPotentialQuestions;
      parsed.selfEvalQuestions = selfEvalQuestions;
      parsed.supervisorEvalQuestions = supervisorEvalQuestions;
      
      // Ensure employeeInfo exists
      if (!parsed.employeeInfo) {
        parsed.employeeInfo = {
          firstName: '',
          lastName: '',
          idNumber: '',
          position: '',
          department: '',
          directorate: ''
        };
      } else {
        // Migration for existing data
        if (!parsed.employeeInfo.idNumber) parsed.employeeInfo.idNumber = '';
        if (!parsed.employeeInfo.directorate) parsed.employeeInfo.directorate = '';
      }

      // Safe migrations for arrays and nested objects
      if (!Array.isArray(parsed.notifications)) {
        parsed.notifications = [];
      }
      if (!Array.isArray(parsed.pdiGoals)) {
        parsed.pdiGoals = [];
      }
      if (!Array.isArray(parsed.pdiBreaches)) {
        parsed.pdiBreaches = [];
      }
      if (!parsed.riasecProfile || !Array.isArray(parsed.riasecProfile.topMotivators)) {
        parsed.riasecProfile = {
          code: 'ESC',
          primaryType: 'Emprendedor / Social',
          secondaryType: 'Convencional',
          careerAspirations: 'Consolidación de liderazgo en Canguro Venezuela',
          legacyVision: 'Construir equipos de alto desempeño con cultura de servicio.',
          topMotivators: ['Autonomía', 'Impacto en el negocio', 'Reconocimiento']
        };
      }
      return parsed;
    }
  } catch (err) {
    console.error("Failed to load state", err);
  }
  
  return {
    employeeName: '',
    employeeInfo: {
      firstName: '',
      lastName: '',
      idNumber: '',
      position: '',
      department: '',
      directorate: ''
    },
    selfEval: { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false },
    supervisorEval: { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false },
    peerEval: { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false },
    subordinateEval: { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false },
    hrEval: { scores: {}, comments: '', checkedBehaviors: {}, openAnswers: {}, isLocked: false },
    performanceQuestions,
    potentialQuestions,
    supervisorPotentialQuestions,
    analystPotentialQuestions,
    analystSupervisorPotentialQuestions,
    coordinatorPotentialQuestions,
    coordinatorSupervisorPotentialQuestions,
    selfEvalQuestions,
    supervisorEvalQuestions,
  };
};

export const saveState = (state: AppState) => {
  try {
    const serialized = JSON.stringify(state);
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = window.localStorage.getItem(STORAGE_KEY);
      if (existing === serialized) {
        return; // Sin cambios: evita despachos de eventos redundantes y bucles de re-renderizado
      }
      window.localStorage.setItem(STORAGE_KEY, serialized);
      window.dispatchEvent(new CustomEvent('canguro_storage_update'));
    }
  } catch (err) {
    console.error("Failed to save state", err);
  }
};

// Listen for updates from other tabs and within same window
export const subscribeToStorage = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener('canguro_storage_update', handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('canguro_storage_update', handler);
  };
};

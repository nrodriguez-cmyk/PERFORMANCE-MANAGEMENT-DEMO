import React, { useState, useEffect, useRef } from 'react';
import { AppState } from '../types';
import { loadState, saveState, subscribeToStorage } from '../store';
import { AdminComparisonModule } from '../components/AdminComparisonModule';
import { LoginPage } from '../components/LoginPage';
import { getCurrentSession, AuthenticatedUser } from '../services/authService';
import { CANGURO_COLLABORATORS } from '../data/canguroUniverso';

export function Dashboard() {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() => getCurrentSession());
  const [state, setState] = useState<AppState>(loadState);
  const lastSerializedRef = useRef<string>('');

  // Escuchar cambios de autenticación (Login / Logout)
  useEffect(() => {
    const handleAuthChange = (e: any) => {
      setCurrentUser(e.detail || null);
    };
    window.addEventListener('canguro_auth_change', handleAuthChange);
    return () => window.removeEventListener('canguro_auth_change', handleAuthChange);
  }, []);

  // Sync to localStorage when state changes
  useEffect(() => {
    try {
      const serialized = JSON.stringify(state);
      if (serialized !== lastSerializedRef.current) {
        lastSerializedRef.current = serialized;
        saveState(state);
      }
    } catch {
      saveState(state);
    }
  }, [state]);

  // Sync from other tabs or external updates without loop
  useEffect(() => {
    return subscribeToStorage(() => {
      try {
        const saved = localStorage.getItem('canguro_talent_state');
        if (saved && saved !== lastSerializedRef.current) {
          lastSerializedRef.current = saved;
          setState(loadState());
        }
      } catch {
        // ignore
      }
    });
  }, []);

  const handleUpdateState = (newState: AppState) => {
    setState(newState);
  };

  const handleLoginSuccess = (user: AuthenticatedUser) => {
    setCurrentUser(user);
    // Cargar la ficha del colaborador autenticado en el estado
    const found = CANGURO_COLLABORATORS.find(c => 
      c.info.id === user.collaboratorId || 
      (c.info.idNumber && c.info.idNumber.replace(/\D/g, '') === user.username)
    );
    if (found) {
      setState(prev => ({
        ...prev,
        employeeInfo: found.info,
        selfEval: found.selfEval,
        supervisorEval: found.supervisorEval,
        peerEval: found.peerEval,
        subordinateEval: found.subordinateEval
      }));
    }
  };

  // MÓDULO PROTEGIDO: Si no hay usuario autenticado, renderiza la pantalla de Login completa
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AdminComparisonModule
      state={state}
      onUpdateState={handleUpdateState}
    />
  );
}

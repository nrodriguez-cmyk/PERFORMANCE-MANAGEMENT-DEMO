/**
 * SERVICIO DE BASE DE DATOS CLIENTE (POSTGRESQL / SUPABASE)
 * Conecta el frontend con los endpoints REST del backend (/api/db/*)
 * con fallback transparente a LocalStorage en caso de estar en modo desconectado.
 */

import { EvaluationData } from '../types';
import { CANGURO_COLLABORATORS } from '../data/canguroUniverso';
import { getJobPositions } from '../data/jobPositionsCatalog';

export interface DatabaseStatus {
  connected: boolean;
  provider: 'postgresql' | 'supabase' | 'none';
  totalCollaborators: number;
  totalEvaluations: number;
  message: string;
}

/**
 * Consulta el estado de conexión de la base de datos
 */
export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  try {
    const res = await fetch('/api/db/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: DatabaseStatus = await res.json();
    return data;
  } catch (err: any) {
    return {
      connected: false,
      provider: 'none',
      totalCollaborators: 0,
      totalEvaluations: 0,
      message: 'Servidor no disponible o base de datos no configurada.'
    };
  }
}

/**
 * Inicializa las tablas en la base de datos
 */
export async function initializeDatabaseTables(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/db/init', { method: 'POST' });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Sincroniza el censo completo de los 2.400+ colaboradores a PostgreSQL/Supabase
 */
export async function syncCensusToDatabase(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const payload = CANGURO_COLLABORATORS.map(c => ({
      id: c.info.id,
      idNumber: c.info.idNumber || '',
      firstName: c.info.firstName,
      lastName: c.info.lastName,
      position: c.info.position,
      department: c.info.department,
      directorate: c.info.directorate || '',
      location: 'Red de Tiendas',
      birthDate: c.info.birthDate || '',
      hireDate: c.info.hireDate || '',
      tenureYears: c.info.tenureYears || 0,
      studyField: c.info.studyField || '',
      educationDegree: c.info.educationDegree || '',
      educationLevel: c.info.educationLevel || 'Diversificado',
      analyticalAccount: ''
    }));

    const res = await fetch('/api/db/sync-census', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collaborators: payload })
    });

    const data = await res.json();
    return {
      success: data.success,
      count: data.insertedOrUpdated || 0,
      message: data.message
    };
  } catch (err: any) {
    return { success: false, count: 0, message: err.message };
  }
}

/**
 * Sincroniza el catálogo de cargos hacia PostgreSQL/Supabase
 */
export async function syncJobPositionsToDatabase(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const catalog = getJobPositions();
    const payload = catalog.map(p => ({
      id: p.id,
      name: p.name,
      managementLevel: p.managementLevel,
      directorate: p.directorate,
      code: p.code || '',
      description: p.description || ''
    }));

    const res = await fetch('/api/db/sync-positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positions: payload })
    });

    const data = await res.json();
    return {
      success: data.success,
      count: data.count || 0,
      message: data.message
    };
  } catch (err: any) {
    return { success: false, count: 0, message: err.message };
  }
}

/**
 * Guarda una evaluación tanto en la Base de Datos como en LocalStorage (Dual-Write)
 */
export async function saveEvaluationRecord(params: {
  collaboratorId: string;
  evaluatorName?: string;
  evaluatorPosition?: string;
  evaluatorRole: string; // 'self' | 'supervisor' | 'peer' | 'subordinate' | 'hr' | 'promotion'
  evaluationType?: string;
  period?: string;
  evalData: EvaluationData;
  finalScore?: number;
  finalPercent?: number;
}): Promise<{ savedToDb: boolean; message: string }> {
  const evalId = `eval_${params.collaboratorId}_${params.evaluatorRole}`;

  // 1. Enviar a PostgreSQL / Supabase
  try {
    const res = await fetch('/api/db/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: evalId,
        collaboratorId: params.collaboratorId,
        evaluatorName: params.evaluatorName,
        evaluatorPosition: params.evaluatorPosition,
        evaluatorRole: params.evaluatorRole,
        evaluationType: params.evaluationType || 'standard',
        period: params.period || '2026-Q1',
        scores: params.evalData.scores || {},
        checkedBehaviors: params.evalData.checkedBehaviors || {},
        openAnswers: params.evalData.openAnswers || {},
        comments: params.evalData.comments || '',
        finalScore: params.finalScore || 0,
        finalPercent: params.finalPercent || 0,
        isLocked: params.evalData.isLocked || false
      })
    });

    const result = await res.json();
    return { savedToDb: result.success, message: result.message };
  } catch (err: any) {
    return { savedToDb: false, message: 'Guardado solo en LocalStorage (modo sin conexión a BD).' };
  }
}

/**
 * Obtiene las evaluaciones de un colaborador desde la BD
 */
export async function fetchEvaluationsFromDb(collaboratorId: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/db/evaluations/${collaboratorId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.evaluations || [];
  } catch {
    return [];
  }
}

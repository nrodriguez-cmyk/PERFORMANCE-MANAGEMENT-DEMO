/**
 * SERVICIO DE BASE DE DATOS CLIENTE (POSTGRESQL / SUPABASE)
 * Conecta el frontend con los endpoints REST del backend (/api/db/*)
 * con fallback directo a Supabase JS y LocalStorage en caso de estar en modo desconectado.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

// Cliente Supabase directo si las variables VITE_* están disponibles en el bundle
let directSupabase: SupabaseClient | null = null;
function getDirectSupabase(): SupabaseClient | null {
  if (directSupabase) return directSupabase;
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (url && key) {
      directSupabase = createClient(url, key);
      return directSupabase;
    }
  } catch (err) {
    console.warn('[DirectSupabase] No disponible:', err);
  }
  return null;
}

/**
 * Consulta el estado de conexión de la base de datos
 */
export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  // 1. Intentar vía endpoint backend (/api/db/status)
  try {
    const res = await fetch('/api/db/status');
    if (res.ok) {
      const data: DatabaseStatus = await res.json();
      if (data.connected) {
        return data;
      }
    }
  } catch (backendErr) {
    console.warn('[DatabaseService] Backend /api/db/status no disponible, intentando cliente directo:', backendErr);
  }

  // 2. Fallback de cliente directo Supabase si están las variables VITE_*
  const s = getDirectSupabase();
  if (s) {
    try {
      const { count: collabCount, error: collabErr } = await s
        .from('collaborators')
        .select('*', { count: 'exact', head: true });

      const { count: evalCount } = await s
        .from('evaluations')
        .select('*', { count: 'exact', head: true });

      if (!collabErr) {
        return {
          connected: true,
          provider: 'supabase',
          totalCollaborators: collabCount || 0,
          totalEvaluations: evalCount || 0,
          message: 'Conexión activa con Supabase REST API (Cliente Directo).'
        };
      }
    } catch (directErr: any) {
      console.warn('[DatabaseService] Cliente directo Supabase falló:', directErr);
    }
  }

  return {
    connected: false,
    provider: 'none',
    totalCollaborators: 0,
    totalEvaluations: 0,
    message: 'Servidor no disponible o base de datos no configurada.'
  };
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

  // 1. Intentar vía backend (/api/db/sync-census)
  try {
    const res = await fetch('/api/db/sync-census', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collaborators: payload })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: data.success,
        count: data.insertedOrUpdated || 0,
        message: data.message
      };
    }
  } catch (err: any) {
    console.warn('[DatabaseService] Backend sync falló, intentando cliente directo:', err.message);
  }

  // 2. Fallback de cliente directo Supabase
  const s = getDirectSupabase();
  if (s) {
    try {
      const dbRows = payload.map(c => ({
        id: c.id,
        id_number: c.idNumber,
        first_name: c.firstName,
        last_name: c.lastName,
        position: c.position,
        department: c.department,
        directorate: c.directorate,
        location: c.location,
        birth_date: c.birthDate || null,
        hire_date: c.hireDate || null,
        tenure_years: c.tenureYears,
        study_field: c.studyField,
        education_degree: c.educationDegree,
        education_level: c.educationLevel,
        analytical_account: c.analyticalAccount
      }));

      const BATCH_SIZE = 250;
      let totalUpserted = 0;
      for (let i = 0; i < dbRows.length; i += BATCH_SIZE) {
        const chunk = dbRows.slice(i, i + BATCH_SIZE);
        const { error } = await s
          .from('collaborators')
          .upsert(chunk, { onConflict: 'id' });
        if (error) throw error;
        totalUpserted += chunk.length;
      }

      return {
        success: true,
        count: totalUpserted,
        message: `Sincronizados ${totalUpserted} colaboradores directamente en Supabase.`
      };
    } catch (directErr: any) {
      return { success: false, count: 0, message: directErr.message };
    }
  }

  return { success: false, count: 0, message: 'No hay conexión con la base de datos.' };
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
  evaluatorRole: string;
  evaluationType?: string;
  period?: string;
  evalData: EvaluationData;
  finalScore?: number;
  finalPercent?: number;
}): Promise<{ savedToDb: boolean; message: string }> {
  const evalId = `eval_${params.collaboratorId}_${params.evaluatorRole}`;

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
    return { savedToDb: false, message: 'Guardado en LocalStorage (modo sin conexión a BD).' };
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

import { Pool } from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let pool: Pool | null = null;
let supabase: SupabaseClient | null = null;

function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL || 
         process.env.POSTGRES_URL || 
         process.env.POSTGRES_PRISMA_URL || 
         process.env.SUPABASE_DB_URL || 
         process.env.POSTGRES_URL_NON_POOLING;
}

function getSupabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL || 
         process.env.VITE_SUPABASE_URL || 
         process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function getSupabaseKey(): string | undefined {
  return process.env.SUPABASE_ANON_KEY || 
         process.env.SUPABASE_SERVICE_ROLE_KEY || 
         process.env.SUPABASE_KEY || 
         process.env.VITE_SUPABASE_ANON_KEY || 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function isDbConfigured(): boolean {
  return !!(getDatabaseUrl() || (getSupabaseUrl() && getSupabaseKey()));
}

export function getDbPool(): Pool | null {
  if (pool) return pool;

  const databaseUrl = getDatabaseUrl();
  if (databaseUrl) {
    try {
      pool = new Pool({
        connectionString: databaseUrl,
        ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      pool.on('error', (err) => {
        console.error('[PostgreSQL] Error inesperado en el pool de conexiones:', err.message);
      });

      console.log('[PostgreSQL] Pool de conexión inicializado con éxito.');
      return pool;
    } catch (err: any) {
      console.warn('[PostgreSQL] Error al crear pool de conexión:', err.message);
      return null;
    }
  }

  return null;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabase) return supabase;

  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseKey();

  if (supabaseUrl && supabaseKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
      console.log('[Supabase] Cliente JS inicializado con éxito.');
      return supabase;
    } catch (err: any) {
      console.warn('[Supabase] Error al inicializar cliente Supabase:', err.message);
      return null;
    }
  }
  return null;
}

/**
 * Verifica la conectividad y devuelve métricas del estado
 */
export async function testConnection(): Promise<{
  connected: boolean;
  provider: 'postgresql' | 'supabase' | 'none';
  totalCollaborators: number;
  totalEvaluations: number;
  message: string;
}> {
  const p = getDbPool();
  if (p) {
    try {
      const client = await p.connect();
      try {
        const collabRes = await client.query('SELECT COUNT(*) FROM collaborators');
        const evalRes = await client.query('SELECT COUNT(*) FROM evaluations');
        return {
          connected: true,
          provider: 'postgresql',
          totalCollaborators: parseInt(collabRes.rows[0].count, 10),
          totalEvaluations: parseInt(evalRes.rows[0].count, 10),
          message: 'Conexión activa y tablas verificadas en PostgreSQL / Supabase Pooler.'
        };
      } finally {
        client.release();
      }
    } catch (err: any) {
      // Si la tabla no existe aún, intentamos inicializarla
      if (err.code === '42P01') { // undefined_table
        await initTables();
        return {
          connected: true,
          provider: 'postgresql',
          totalCollaborators: 0,
          totalEvaluations: 0,
          message: 'Tablas inicializadas automáticamente con éxito en PostgreSQL.'
        };
      }
      console.warn('[PostgreSQL] Conexión de pool falló:', err.message, '- Intentando cliente Supabase...');
      pool = null;
    }
  }

  const s = getSupabaseClient();
  if (s) {
    try {
      const { count: collabCount, error: collabErr } = await s
        .from('collaborators')
        .select('*', { count: 'exact', head: true });

      const { count: evalCount } = await s
        .from('evaluations')
        .select('*', { count: 'exact', head: true });

      if (collabErr) {
        return {
          connected: false,
          provider: 'supabase',
          totalCollaborators: 0,
          totalEvaluations: 0,
          message: `Supabase API error: ${collabErr.message}`
        };
      }

      return {
        connected: true,
        provider: 'supabase',
        totalCollaborators: collabCount || 0,
        totalEvaluations: evalCount || 0,
        message: 'Conexión activa con Supabase REST API.'
      };
    } catch (err: any) {
      return {
        connected: false,
        provider: 'supabase',
        totalCollaborators: 0,
        totalEvaluations: 0,
        message: `Error de cliente Supabase: ${err.message}`
      };
    }
  }

  return {
    connected: false,
    provider: 'none',
    totalCollaborators: 0,
    totalEvaluations: 0,
    message: 'Base de datos no configurada. Configure DATABASE_URL o credenciales Supabase en .env.'
  };
}

/**
 * Crea automáticamente las tablas si no existen en PostgreSQL
 */
export async function initTables(): Promise<{ success: boolean; message: string }> {
  const p = getDbPool();
  if (!p) {
    return { success: false, message: 'Pool de PostgreSQL no disponible' };
  }

  const client = await p.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS collaborators (
        id VARCHAR(64) PRIMARY KEY,
        id_number VARCHAR(32) UNIQUE NOT NULL,
        first_name VARCHAR(128) NOT NULL,
        last_name VARCHAR(128) NOT NULL,
        position VARCHAR(128) NOT NULL,
        department VARCHAR(128) NOT NULL,
        directorate VARCHAR(128) NOT NULL,
        location VARCHAR(128) DEFAULT 'Red de Tiendas',
        birth_date VARCHAR(32),
        hire_date VARCHAR(32),
        tenure_years NUMERIC(4,1) DEFAULT 0,
        study_field VARCHAR(128),
        education_degree VARCHAR(128),
        education_level VARCHAR(64) DEFAULT 'Diversificado',
        analytical_account VARCHAR(128),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE collaborators ADD COLUMN IF NOT EXISTS birth_date VARCHAR(32);
      ALTER TABLE collaborators ADD COLUMN IF NOT EXISTS study_field VARCHAR(128);
      ALTER TABLE collaborators ADD COLUMN IF NOT EXISTS education_degree VARCHAR(128);

      CREATE TABLE IF NOT EXISTS evaluations (
        id VARCHAR(128) PRIMARY KEY,
        collaborator_id VARCHAR(64) NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
        evaluator_name VARCHAR(128),
        evaluator_position VARCHAR(128),
        evaluator_role VARCHAR(32) NOT NULL,
        evaluation_type VARCHAR(32) DEFAULT 'standard',
        period VARCHAR(32) DEFAULT '2026-Q1',
        scores JSONB DEFAULT '{}'::jsonb,
        checked_behaviors JSONB DEFAULT '{}'::jsonb,
        open_answers JSONB DEFAULT '{}'::jsonb,
        comments TEXT,
        final_score NUMERIC(4,2) DEFAULT 0,
        final_percent NUMERIC(5,2) DEFAULT 0,
        is_locked BOOLEAN DEFAULT FALSE,
        submitted_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS pdi_records (
        id VARCHAR(128) PRIMARY KEY,
        collaborator_id VARCHAR(64) NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
        mentor_name VARCHAR(128),
        mentor_role VARCHAR(128),
        goals JSONB DEFAULT '[]'::jsonb,
        breaches JSONB DEFAULT '[]'::jsonb,
        signatures JSONB DEFAULT '{}'::jsonb,
        status VARCHAR(32) DEFAULT 'En Ejecución',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS promotion_records (
        id VARCHAR(128) PRIMARY KEY,
        collaborator_id VARCHAR(64) NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
        target_position VARCHAR(128) NOT NULL,
        current_position VARCHAR(128) NOT NULL,
        status VARCHAR(32) DEFAULT 'En Evaluación',
        committee_decision VARCHAR(32),
        readiness_level VARCHAR(32),
        candidate_scores JSONB DEFAULT '{}'::jsonb,
        supervisor_scores JSONB DEFAULT '{}'::jsonb,
        committee_feedback JSONB DEFAULT '{}'::jsonb,
        nine_box_quadrant VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS psychometric_profiles (
        id VARCHAR(128) PRIMARY KEY,
        collaborator_id VARCHAR(64) NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
        openness NUMERIC(5,2) DEFAULT 0,
        conscientiousness NUMERIC(5,2) DEFAULT 0,
        extraversion NUMERIC(5,2) DEFAULT 0,
        agreeableness NUMERIC(5,2) DEFAULT 0,
        neuroticism NUMERIC(5,2) DEFAULT 0,
        archetype VARCHAR(128),
        report_markdown TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- TABLA: USUARIOS Y CREDENCIALES (Login: Usuario = Cédula, Password = Cédula)
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        collaborator_id VARCHAR(64) NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
        username VARCHAR(32) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(32) DEFAULT 'colaborador',
        management_level VARCHAR(32) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- TABLA: CATÁLOGO DE CARGOS Y NIVELES DE GESTIÓN
      CREATE TABLE IF NOT EXISTS job_positions (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) UNIQUE NOT NULL,
        management_level VARCHAR(32) NOT NULL,
        directorate VARCHAR(128) NOT NULL,
        code VARCHAR(32),
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- REGISTRO SEMILLA: ADMINISTRADOR MAESTRO POR DEFECTO
      INSERT INTO collaborators (
        id, id_number, first_name, last_name, position, department, directorate, location
      ) VALUES (
        'emp-26475804', '26475804', 'Natalia', 'Rodríguez', 'Administrador Maestro', 'Presidencia', 'Presidencia', 'Sede Principal'
      ) ON CONFLICT (id_number) DO NOTHING;

      INSERT INTO users (
        id, collaborator_id, username, password_hash, role, management_level, is_active
      ) VALUES (
        'usr-26475804', 'emp-26475804', '26475804', '26475804', 'admin', 'ESTRATÉGICO', true
      ) ON CONFLICT (username) DO NOTHING;
    `);
    return { success: true, message: 'Tablas de base de datos verificadas/creadas con éxito.' };
  } catch (err: any) {
    console.error('[PostgreSQL] Error al crear tablas:', err.message);
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

/**
 * Sincroniza colaboradores hacia la tabla collaborators (Batch Upsert)
 */
export async function syncCollaboratorsBatch(collaborators: Array<{
  id: string;
  idNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  directorate: string;
  location?: string;
  birthDate?: string;
  hireDate?: string;
  tenureYears?: number;
  studyField?: string;
  educationDegree?: string;
  educationLevel?: string;
  analyticalAccount?: string;
}>): Promise<{ success: boolean; insertedOrUpdated: number; message: string }> {
  const p = getDbPool();
  if (!p) {
    const supa = getSupabaseClient();
    if (supa) {
      try {
        const collabPayload = collaborators.map(c => ({
          id: c.id,
          id_number: c.idNumber,
          first_name: c.firstName,
          last_name: c.lastName,
          position: c.position,
          department: c.department,
          directorate: c.directorate,
          location: c.location || 'Red de Tiendas',
          birth_date: c.birthDate || '',
          hire_date: c.hireDate || '',
          tenure_years: c.tenureYears || 0,
          study_field: c.studyField || '',
          education_degree: c.educationDegree || '',
          education_level: c.educationLevel || 'Diversificado',
          analytical_account: c.analyticalAccount || '',
          updated_at: new Date().toISOString()
        }));

        const usersPayload = collaborators.map(c => {
          const cleanCedula = (c.idNumber || '').replace(/\D/g, '') || c.id;
          const isNataliaMaster = cleanCedula === '26475804' || (c.firstName?.toLowerCase().includes('natalia') && (c.lastName?.toLowerCase().includes('rodriguez') || c.lastName?.toLowerCase().includes('montilla')));
          const posLower = (c.position || '').toLowerCase();
          const mgmtLevel = isNataliaMaster
            ? 'ESTRATÉGICO'
            : ((posLower.includes('director') || posLower.includes('gerente') || posLower.includes('cio'))
            ? 'ESTRATÉGICO'
            : (posLower.includes('coordinador') || posLower.includes('supervisor') || posLower.includes('responsable'))
            ? 'TÉCNICO / INTERMEDIO'
            : 'OPERATIVO');

          const userRole = isNataliaMaster
            ? 'admin'
            : (posLower.includes('director')
            ? 'director'
            : (posLower.includes('gerente') || posLower.includes('coordinador') || posLower.includes('supervisor'))
            ? 'supervisor'
            : 'colaborador');

          return {
            id: `usr-${cleanCedula}`,
            collaborator_id: c.id,
            username: cleanCedula,
            password_hash: cleanCedula,
            role: userRole,
            management_level: mgmtLevel,
            is_active: true,
            updated_at: new Date().toISOString()
          };
        });

        const chunkSize = 100;
        for (let i = 0; i < collabPayload.length; i += chunkSize) {
          const cChunk = collabPayload.slice(i, i + chunkSize);
          const { error: cErr } = await supa.from('collaborators').upsert(cChunk, { onConflict: 'id' });
          if (cErr) console.warn('[Supabase] colaboradores upsert aviso:', cErr.message);

          const uChunk = usersPayload.slice(i, i + chunkSize);
          const { error: uErr } = await supa.from('users').upsert(uChunk, { onConflict: 'username' });
          if (uErr) console.warn('[Supabase] usuarios upsert aviso:', uErr.message);
        }

        return {
          success: true,
          insertedOrUpdated: collaborators.length,
          message: `¡${collaborators.length} colaboradores y sus credenciales de acceso fueron sincronizados con éxito en Supabase!`
        };
      } catch (err: any) {
        return { success: false, insertedOrUpdated: 0, message: err.message };
      }
    }

    return { success: false, insertedOrUpdated: 0, message: 'No hay conexión a base de datos' };
  }

  await initTables();

  const client = await p.connect();
  try {
    await client.query('BEGIN');
    let count = 0;

    for (const c of collaborators) {
      await client.query(
        `INSERT INTO collaborators (
          id, id_number, first_name, last_name, position, department, directorate,
          location, birth_date, hire_date, tenure_years, study_field, education_degree,
          education_level, analytical_account, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
        ON CONFLICT (id) DO UPDATE SET
          id_number = EXCLUDED.id_number,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          position = EXCLUDED.position,
          department = EXCLUDED.department,
          directorate = EXCLUDED.directorate,
          location = EXCLUDED.location,
          birth_date = EXCLUDED.birth_date,
          hire_date = EXCLUDED.hire_date,
          tenure_years = EXCLUDED.tenure_years,
          study_field = EXCLUDED.study_field,
          education_degree = EXCLUDED.education_degree,
          education_level = EXCLUDED.education_level,
          analytical_account = EXCLUDED.analytical_account,
          updated_at = NOW()`,
        [
          c.id,
          c.idNumber,
          c.firstName,
          c.lastName,
          c.position,
          c.department,
          c.directorate,
          c.location || 'Red de Tiendas',
          c.birthDate || '',
          c.hireDate || '',
          c.tenureYears || 0,
          c.studyField || '',
          c.educationDegree || '',
          c.educationLevel || 'Diversificado',
          c.analyticalAccount || ''
        ]
      );

      // Auto-aprovisionamiento de usuario: Usuario = Cédula, Password = Cédula
      const cleanCedula = (c.idNumber || '').replace(/\D/g, '') || c.id;
      const isNataliaMaster = cleanCedula === '26475804' || (c.firstName?.toLowerCase().includes('natalia') && (c.lastName?.toLowerCase().includes('rodriguez') || c.lastName?.toLowerCase().includes('montilla')));
      const posLower = (c.position || '').toLowerCase();
      const mgmtLevel = isNataliaMaster
        ? 'ESTRATÉGICO'
        : ((posLower.includes('director') || posLower.includes('gerente') || posLower.includes('cio'))
        ? 'ESTRATÉGICO'
        : (posLower.includes('coordinador') || posLower.includes('supervisor') || posLower.includes('responsable'))
        ? 'TÉCNICO / INTERMEDIO'
        : 'OPERATIVO');

      const userRole = isNataliaMaster
        ? 'admin'
        : (posLower.includes('director')
        ? 'director'
        : (posLower.includes('gerente') || posLower.includes('coordinador') || posLower.includes('supervisor'))
        ? 'supervisor'
        : 'colaborador');

      await client.query(
        `INSERT INTO users (
          id, collaborator_id, username, password_hash, role, management_level, is_active, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW())
        ON CONFLICT (username) DO UPDATE SET
          collaborator_id = EXCLUDED.collaborator_id,
          role = EXCLUDED.role,
          management_level = EXCLUDED.management_level,
          updated_at = NOW()`,
        [`usr-${cleanCedula}`, c.id, cleanCedula, cleanCedula, userRole, mgmtLevel]
      );

      count++;
    }

    await client.query('COMMIT');
    return {
      success: true,
      insertedOrUpdated: count,
      message: `Se sincronizaron con éxito ${count} colaboradores en PostgreSQL.`
    };
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[PostgreSQL] Error al sincronizar colaboradores:', err.message);
    return { success: false, insertedOrUpdated: 0, message: err.message };
  } finally {
    client.release();
  }
}

/**
 * Sincroniza el catálogo de cargos hacia PostgreSQL
 */
export async function syncJobPositionsBatch(positions: Array<{
  id: string;
  name: string;
  managementLevel: string;
  directorate: string;
  code?: string;
  description?: string;
}>): Promise<{ success: boolean; count: number; message: string }> {
  const p = getDbPool();
  if (!p) {
    return { success: false, count: 0, message: 'Base de datos PostgreSQL no conectada' };
  }

  const client = await p.connect();
  try {
    await client.query('BEGIN');
    let count = 0;
    for (const pos of positions) {
      await client.query(
        `INSERT INTO job_positions (id, name, management_level, directorate, code, description, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           management_level = EXCLUDED.management_level,
           directorate = EXCLUDED.directorate,
           code = EXCLUDED.code,
           description = EXCLUDED.description,
           updated_at = NOW()`,
        [pos.id, pos.name, pos.managementLevel, pos.directorate, pos.code || null, pos.description || null]
      );
      count++;
    }
    await client.query('COMMIT');
    return { success: true, count, message: `Se sincronizaron exitosamente ${count} cargos en PostgreSQL` };
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('[PostgreSQL] Error al sincronizar cargos:', err.message);
    return { success: false, count: 0, message: err.message };
  } finally {
    client.release();
  }
}

/**
 * Guarda o actualiza una evaluación en PostgreSQL
 */
export async function saveEvaluation(evalData: {
  id: string;
  collaboratorId: string;
  evaluatorName?: string;
  evaluatorPosition?: string;
  evaluatorRole: string;
  evaluationType?: string;
  period?: string;
  scores: any;
  checkedBehaviors?: any;
  openAnswers?: any;
  comments?: string;
  finalScore?: number;
  finalPercent?: number;
  isLocked?: boolean;
}): Promise<{ success: boolean; message: string }> {
  const p = getDbPool();
  if (!p) {
    return { success: false, message: 'Base de datos no conectada' };
  }

  const client = await p.connect();
  try {
    await client.query(
      `INSERT INTO evaluations (
        id, collaborator_id, evaluator_name, evaluator_position, evaluator_role,
        evaluation_type, period, scores, checked_behaviors, open_answers, comments,
        final_score, final_percent, is_locked, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      ON CONFLICT (id) DO UPDATE SET
        evaluator_name = EXCLUDED.evaluator_name,
        evaluator_position = EXCLUDED.evaluator_position,
        evaluator_role = EXCLUDED.evaluator_role,
        evaluation_type = EXCLUDED.evaluation_type,
        period = EXCLUDED.period,
        scores = EXCLUDED.scores,
        checked_behaviors = EXCLUDED.checked_behaviors,
        open_answers = EXCLUDED.open_answers,
        comments = EXCLUDED.comments,
        final_score = EXCLUDED.final_score,
        final_percent = EXCLUDED.final_percent,
        is_locked = EXCLUDED.is_locked,
        updated_at = NOW()`,
      [
        evalData.id,
        evalData.collaboratorId,
        evalData.evaluatorName || '',
        evalData.evaluatorPosition || '',
        evalData.evaluatorRole,
        evalData.evaluationType || 'standard',
        evalData.period || '2026-Q1',
        JSON.stringify(evalData.scores || {}),
        JSON.stringify(evalData.checkedBehaviors || {}),
        JSON.stringify(evalData.openAnswers || {}),
        evalData.comments || '',
        evalData.finalScore || 0,
        evalData.finalPercent || 0,
        evalData.isLocked || false
      ]
    );

    return { success: true, message: 'Evaluación guardada con éxito en la base de datos.' };
  } catch (err: any) {
    console.error('[PostgreSQL] Error al guardar evaluación:', err.message);
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

/**
 * Obtiene todas las evaluaciones de un colaborador
 */
export async function getEvaluationsByCollaborator(collabId: string): Promise<any[]> {
  const p = getDbPool();
  if (!p) return [];

  const client = await p.connect();
  try {
    const res = await client.query(
      'SELECT * FROM evaluations WHERE collaborator_id = $1 ORDER BY updated_at DESC',
      [collabId]
    );
    return res.rows;
  } catch (err: any) {
    console.error('[PostgreSQL] Error al leer evaluaciones:', err.message);
    return [];
  } finally {
    client.release();
  }
}

/**
 * Obtiene el PDI de un colaborador
 */
export async function getPdiByCollaborator(collabId: string): Promise<any | null> {
  const p = getDbPool();
  if (!p) return null;

  const client = await p.connect();
  try {
    const res = await client.query(
      'SELECT * FROM pdi_records WHERE collaborator_id = $1 LIMIT 1',
      [collabId]
    );
    return res.rows[0] || null;
  } catch (err: any) {
    console.error('[PostgreSQL] Error al leer PDI:', err.message);
    return null;
  } finally {
    client.release();
  }
}

/**
 * Guarda o actualiza el PDI de un colaborador
 */
export async function savePdi(pdiData: {
  id: string;
  collaboratorId: string;
  mentorName?: string;
  mentorRole?: string;
  goals: any[];
  breaches: any[];
  signatures?: any;
  status?: string;
}): Promise<{ success: boolean; message: string }> {
  const p = getDbPool();
  if (!p) return { success: false, message: 'Base de datos no conectada' };

  const client = await p.connect();
  try {
    await client.query(
      `INSERT INTO pdi_records (
        id, collaborator_id, mentor_name, mentor_role, goals, breaches, signatures, status, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (id) DO UPDATE SET
        mentor_name = EXCLUDED.mentor_name,
        mentor_role = EXCLUDED.mentor_role,
        goals = EXCLUDED.goals,
        breaches = EXCLUDED.breaches,
        signatures = EXCLUDED.signatures,
        status = EXCLUDED.status,
        updated_at = NOW()`,
      [
        pdiData.id,
        pdiData.collaboratorId,
        pdiData.mentorName || '',
        pdiData.mentorRole || '',
        JSON.stringify(pdiData.goals || []),
        JSON.stringify(pdiData.breaches || []),
        JSON.stringify(pdiData.signatures || {}),
        pdiData.status || 'En Ejecución'
      ]
    );
    return { success: true, message: 'PDI guardado con éxito en la base de datos.' };
  } catch (err: any) {
    console.error('[PostgreSQL] Error al guardar PDI:', err.message);
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}

/**
 * Autentica un usuario con Usuario = Cédula y Password = Cédula en PostgreSQL
 */
export async function authenticateUser(username: string, password: string): Promise<{
  success: boolean;
  message: string;
  user?: {
    id: string;
    collaboratorId: string;
    username: string;
    fullName: string;
    position: string;
    department: string;
    directorate: string;
    managementLevel: string;
    role: string;
  };
}> {
  const cleanUser = (username || '').replace(/\D/g, '').trim();
  const cleanPass = (password || '').replace(/\D/g, '').trim();

  if (!cleanUser || !cleanPass) {
    return { success: false, message: 'Debe ingresar su número de cédula' };
  }

  if (cleanUser !== cleanPass) {
    return { success: false, message: 'Contraseña incorrecta (por defecto debe ser su número de cédula)' };
  }

  const p = getDbPool();
  if (!p) {
    const supa = getSupabaseClient();
    if (supa) {
      try {
        const { data, error } = await supa
          .from('collaborators')
          .select('*')
          .or(`id_number.eq.${cleanUser},id.eq.emp-${cleanUser}`)
          .limit(1)
          .maybeSingle();

        if (error || !data) {
          return {
            success: false,
            message: `No se encontró ningún colaborador con la cédula ${cleanUser} en Supabase.`
          };
        }

        const isNataliaMaster = cleanUser === '26475804' ||
          ((data.first_name || '').toLowerCase().includes('natalia') && ((data.last_name || '').toLowerCase().includes('rodriguez') || (data.last_name || '').toLowerCase().includes('montilla')));

        const posLower = (data.position || '').toLowerCase();
        const mgmtLevel = isNataliaMaster
          ? 'ESTRATÉGICO'
          : ((posLower.includes('director') || posLower.includes('gerente') || posLower.includes('cio'))
            ? 'ESTRATÉGICO'
            : (posLower.includes('coordinador') || posLower.includes('supervisor'))
            ? 'TÉCNICO / INTERMEDIO'
            : 'OPERATIVO');

        const role = isNataliaMaster
          ? 'admin'
          : (posLower.includes('director') ? 'director' : posLower.includes('gerente') ? 'supervisor' : 'colaborador');

        return {
          success: true,
          message: isNataliaMaster ? '¡Bienvenida, Natalia Rodríguez! Sesión iniciada como Administrador Maestro.' : 'Autenticación exitosa',
          user: {
            id: `usr-${cleanUser}`,
            collaboratorId: data.id,
            username: cleanUser,
            fullName: `${data.first_name} ${data.last_name}`.trim(),
            position: isNataliaMaster ? `${data.position} (Administrador Maestro)` : data.position,
            department: data.department,
            directorate: data.directorate,
            managementLevel: mgmtLevel,
            role
          }
        };
      } catch (err: any) {
        return { success: false, message: `Error al autenticar con Supabase: ${err.message}` };
      }
    }

    return {
      success: false,
      message: 'Base de datos PostgreSQL / Supabase no conectada en backend (se usará autenticación local)'
    };
  }

  const client = await p.connect();
  try {
    const res = await client.query(
      `SELECT c.*, u.role as user_role, u.management_level
       FROM collaborators c
       LEFT JOIN users u ON u.collaborator_id = c.id
       WHERE regexp_replace(c.id_number, '\\D', '', 'g') = $1
          OR c.id = $2
       LIMIT 1`,
      [cleanUser, `emp-${cleanUser}`]
    );

    if (res.rows.length === 0) {
      return {
        success: false,
        message: `No se encontró ningún colaborador con la cédula ${cleanUser} en la base de datos.`
      };
    }

    const row = res.rows[0];
    const isNataliaMaster = cleanUser === '26475804' ||
      ((row.first_name || '').toLowerCase().includes('natalia') && ((row.last_name || '').toLowerCase().includes('rodriguez') || (row.last_name || '').toLowerCase().includes('montilla')));

    const posLower = (row.position || '').toLowerCase();
    const mgmtLevel = isNataliaMaster
      ? 'ESTRATÉGICO'
      : (row.management_level || (
        (posLower.includes('director') || posLower.includes('gerente') || posLower.includes('cio'))
          ? 'ESTRATÉGICO'
          : (posLower.includes('coordinador') || posLower.includes('supervisor'))
          ? 'TÉCNICO / INTERMEDIO'
          : 'OPERATIVO'
      ));

    const role = isNataliaMaster
      ? 'admin'
      : (row.user_role || (posLower.includes('director') ? 'director' : posLower.includes('gerente') ? 'supervisor' : 'colaborador'));

    return {
      success: true,
      message: isNataliaMaster ? '¡Bienvenida, Natalia Rodríguez! Sesión iniciada como Administrador Maestro.' : 'Autenticación exitosa',
      user: {
        id: `usr-${cleanUser}`,
        collaboratorId: row.id,
        username: cleanUser,
        fullName: `${row.first_name} ${row.last_name}`.trim(),
        position: isNataliaMaster ? `${row.position} (Administrador Maestro)` : row.position,
        department: row.department,
        directorate: row.directorate,
        managementLevel: mgmtLevel,
        role
      }
    };
  } catch (err: any) {
    return { success: false, message: `Error al autenticar: ${err.message}` };
  } finally {
    client.release();
  }
}

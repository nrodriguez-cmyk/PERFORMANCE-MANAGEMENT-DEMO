// src/server/db.ts
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL_NON_POOLING;
}
function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}
function getSupabaseKey() {
  return process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}
var pool = null;
var supabase = null;
function getDbPool() {
  if (pool) return pool;
  const dbUrl = getDatabaseUrl();
  if (dbUrl) {
    try {
      pool = new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes("localhost") ? false : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 3e4,
        connectionTimeoutMillis: 5e3
      });
      pool.on("error", (err) => {
        console.error("[PostgreSQL] Error inesperado en el pool de conexiones:", err.message);
      });
      console.log("[PostgreSQL] Pool de conexi\xF3n inicializado con \xE9xito.");
      return pool;
    } catch (err) {
      console.warn("[PostgreSQL] Error al crear pool de conexi\xF3n:", err.message);
      return null;
    }
  }
  return null;
}
function getSupabaseClient() {
  if (supabase) return supabase;
  const sUrl = getSupabaseUrl();
  const sKey = getSupabaseKey();
  if (sUrl && sKey) {
    try {
      supabase = createClient(sUrl, sKey);
      console.log("[Supabase] Cliente JS inicializado con \xE9xito.");
      return supabase;
    } catch (err) {
      console.warn("[Supabase] Error al inicializar cliente Supabase:", err.message);
      return null;
    }
  }
  return null;
}
async function initTables() {
  const p = getDbPool();
  if (!p) {
    return { success: false, message: "Pool de PostgreSQL no disponible" };
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
        status VARCHAR(32) DEFAULT 'En Ejecuci\xF3n',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS promotion_records (
        id VARCHAR(128) PRIMARY KEY,
        collaborator_id VARCHAR(64) NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
        target_position VARCHAR(128) NOT NULL,
        current_position VARCHAR(128) NOT NULL,
        status VARCHAR(32) DEFAULT 'En Evaluaci\xF3n',
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

      -- TABLA: USUARIOS Y CREDENCIALES (Login: Usuario = C\xE9dula, Password = C\xE9dula)
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

      -- TABLA: CAT\xC1LOGO DE CARGOS Y NIVELES DE GESTI\xD3N
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
        'emp-26475804', '26475804', 'Natalia', 'Rodr\xEDguez', 'Administrador Maestro', 'Presidencia', 'Presidencia', 'Sede Principal'
      ) ON CONFLICT (id_number) DO NOTHING;

      INSERT INTO users (
        id, collaborator_id, username, password_hash, role, management_level, is_active
      ) VALUES (
        'usr-26475804', 'emp-26475804', '26475804', '26475804', 'admin', 'ESTRAT\xC9GICO', true
      ) ON CONFLICT (username) DO NOTHING;
    `);
    return { success: true, message: "Tablas de base de datos verificadas/creadas con \xE9xito." };
  } catch (err) {
    console.error("[PostgreSQL] Error al crear tablas:", err.message);
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}
async function syncCollaboratorsBatch(collaborators) {
  const p = getDbPool();
  if (!p) {
    const supa = getSupabaseClient();
    if (supa) {
      try {
        const collabPayload = collaborators.map((c) => ({
          id: c.id,
          id_number: c.idNumber,
          first_name: c.firstName,
          last_name: c.lastName,
          position: c.position,
          department: c.department,
          directorate: c.directorate,
          location: c.location || "Red de Tiendas",
          birth_date: c.birthDate || "",
          hire_date: c.hireDate || "",
          tenure_years: c.tenureYears || 0,
          study_field: c.studyField || "",
          education_degree: c.educationDegree || "",
          education_level: c.educationLevel || "Diversificado",
          analytical_account: c.analyticalAccount || "",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }));
        const usersPayload = collaborators.map((c) => {
          const cleanCedula = (c.idNumber || "").replace(/\D/g, "") || c.id;
          const isNataliaMaster = cleanCedula === "26475804" || c.firstName?.toLowerCase().includes("natalia") && (c.lastName?.toLowerCase().includes("rodriguez") || c.lastName?.toLowerCase().includes("montilla"));
          const posLower = (c.position || "").toLowerCase();
          const mgmtLevel = isNataliaMaster ? "ESTRAT\xC9GICO" : posLower.includes("director") || posLower.includes("gerente") || posLower.includes("cio") ? "ESTRAT\xC9GICO" : posLower.includes("coordinador") || posLower.includes("supervisor") || posLower.includes("responsable") ? "T\xC9CNICO / INTERMEDIO" : "OPERATIVO";
          const userRole = isNataliaMaster ? "admin" : posLower.includes("director") ? "director" : posLower.includes("gerente") || posLower.includes("coordinador") || posLower.includes("supervisor") ? "supervisor" : "colaborador";
          return {
            id: `usr-${cleanCedula}`,
            collaborator_id: c.id,
            username: cleanCedula,
            password_hash: cleanCedula,
            role: userRole,
            management_level: mgmtLevel,
            is_active: true,
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          };
        });
        const chunkSize = 100;
        for (let i = 0; i < collabPayload.length; i += chunkSize) {
          const cChunk = collabPayload.slice(i, i + chunkSize);
          const { error: cErr } = await supa.from("collaborators").upsert(cChunk, { onConflict: "id" });
          if (cErr) console.warn("[Supabase] colaboradores upsert aviso:", cErr.message);
          const uChunk = usersPayload.slice(i, i + chunkSize);
          const { error: uErr } = await supa.from("users").upsert(uChunk, { onConflict: "username" });
          if (uErr) console.warn("[Supabase] usuarios upsert aviso:", uErr.message);
        }
        return {
          success: true,
          insertedOrUpdated: collaborators.length,
          message: `\xA1${collaborators.length} colaboradores y sus credenciales de acceso fueron sincronizados con \xE9xito en Supabase!`
        };
      } catch (err) {
        return { success: false, insertedOrUpdated: 0, message: err.message };
      }
    }
    return { success: false, insertedOrUpdated: 0, message: "No hay conexi\xF3n a base de datos" };
  }
  await initTables();
  const client = await p.connect();
  try {
    await client.query("BEGIN");
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
          c.location || "Red de Tiendas",
          c.birthDate || "",
          c.hireDate || "",
          c.tenureYears || 0,
          c.studyField || "",
          c.educationDegree || "",
          c.educationLevel || "Diversificado",
          c.analyticalAccount || ""
        ]
      );
      const cleanCedula = (c.idNumber || "").replace(/\D/g, "") || c.id;
      const isNataliaMaster = cleanCedula === "26475804" || c.firstName?.toLowerCase().includes("natalia") && (c.lastName?.toLowerCase().includes("rodriguez") || c.lastName?.toLowerCase().includes("montilla"));
      const posLower = (c.position || "").toLowerCase();
      const mgmtLevel = isNataliaMaster ? "ESTRAT\xC9GICO" : posLower.includes("director") || posLower.includes("gerente") || posLower.includes("cio") ? "ESTRAT\xC9GICO" : posLower.includes("coordinador") || posLower.includes("supervisor") || posLower.includes("responsable") ? "T\xC9CNICO / INTERMEDIO" : "OPERATIVO";
      const userRole = isNataliaMaster ? "admin" : posLower.includes("director") ? "director" : posLower.includes("gerente") || posLower.includes("coordinador") || posLower.includes("supervisor") ? "supervisor" : "colaborador";
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
    await client.query("COMMIT");
    return {
      success: true,
      insertedOrUpdated: count,
      message: `Se sincronizaron con \xE9xito ${count} colaboradores en PostgreSQL.`
    };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[PostgreSQL] Error al sincronizar colaboradores:", err.message);
    return { success: false, insertedOrUpdated: 0, message: err.message };
  } finally {
    client.release();
  }
}

// src/server/handlers/syncCensus.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
  try {
    const { collaborators } = req.body || {};
    if (!Array.isArray(collaborators) || collaborators.length === 0) {
      return res.status(400).json({ success: false, message: "Se requiere una lista de colaboradores" });
    }
    const result = await syncCollaboratorsBatch(collaborators);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
export {
  handler as default
};

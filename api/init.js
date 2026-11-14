// src/server/db.ts
import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL_NON_POOLING;
}
var pool = null;
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

// src/server/handlers/init.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const result = await initTables();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
export {
  handler as default
};

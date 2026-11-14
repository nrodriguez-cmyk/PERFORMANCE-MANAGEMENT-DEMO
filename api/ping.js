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
async function testConnection() {
  const p = getDbPool();
  if (p) {
    try {
      const client = await p.connect();
      try {
        const collabRes = await client.query("SELECT COUNT(*) FROM collaborators");
        const evalRes = await client.query("SELECT COUNT(*) FROM evaluations");
        return {
          connected: true,
          provider: "postgresql",
          totalCollaborators: parseInt(collabRes.rows[0].count, 10),
          totalEvaluations: parseInt(evalRes.rows[0].count, 10),
          message: "Conexi\xF3n activa y tablas verificadas en PostgreSQL / Supabase Pooler."
        };
      } finally {
        client.release();
      }
    } catch (err) {
      if (err.code === "42P01") {
        await initTables();
        return {
          connected: true,
          provider: "postgresql",
          totalCollaborators: 0,
          totalEvaluations: 0,
          message: "Tablas inicializadas autom\xE1ticamente con \xE9xito en PostgreSQL."
        };
      }
      console.warn("[PostgreSQL] Conexi\xF3n de pool fall\xF3:", err.message, "- Intentando cliente Supabase...");
      pool = null;
    }
  }
  const s = getSupabaseClient();
  if (s) {
    try {
      const { count: collabCount, error: collabErr } = await s.from("collaborators").select("*", { count: "exact", head: true });
      const { count: evalCount } = await s.from("evaluations").select("*", { count: "exact", head: true });
      if (collabErr) {
        const errorDetail = collabErr.message || collabErr.details || collabErr.hint || collabErr.code || JSON.stringify(collabErr);
        return {
          connected: false,
          provider: "supabase",
          totalCollaborators: 0,
          totalEvaluations: 0,
          message: `Supabase API error: ${errorDetail}`
        };
      }
      return {
        connected: true,
        provider: "supabase",
        totalCollaborators: collabCount || 0,
        totalEvaluations: evalCount || 0,
        message: "Conexi\xF3n activa con Supabase REST API."
      };
    } catch (err) {
      return {
        connected: false,
        provider: "supabase",
        totalCollaborators: 0,
        totalEvaluations: 0,
        message: `Error de cliente Supabase: ${err.message}`
      };
    }
  }
  return {
    connected: false,
    provider: "none",
    totalCollaborators: 0,
    totalEvaluations: 0,
    message: "Base de datos no configurada. Configure DATABASE_URL o credenciales Supabase en .env."
  };
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
async function syncJobPositionsBatch(positions) {
  const p = getDbPool();
  if (!p) {
    return { success: false, count: 0, message: "Base de datos PostgreSQL no conectada" };
  }
  const client = await p.connect();
  try {
    await client.query("BEGIN");
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
    await client.query("COMMIT");
    return { success: true, count, message: `Se sincronizaron exitosamente ${count} cargos en PostgreSQL` };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[PostgreSQL] Error al sincronizar cargos:", err.message);
    return { success: false, count: 0, message: err.message };
  } finally {
    client.release();
  }
}
async function saveEvaluation(evalData) {
  const p = getDbPool();
  if (!p) {
    return { success: false, message: "Base de datos no conectada" };
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
        evalData.evaluatorName || "",
        evalData.evaluatorPosition || "",
        evalData.evaluatorRole,
        evalData.evaluationType || "standard",
        evalData.period || "2026-Q1",
        JSON.stringify(evalData.scores || {}),
        JSON.stringify(evalData.checkedBehaviors || {}),
        JSON.stringify(evalData.openAnswers || {}),
        evalData.comments || "",
        evalData.finalScore || 0,
        evalData.finalPercent || 0,
        evalData.isLocked || false
      ]
    );
    return { success: true, message: "Evaluaci\xF3n guardada con \xE9xito en la base de datos." };
  } catch (err) {
    console.error("[PostgreSQL] Error al guardar evaluaci\xF3n:", err.message);
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}
async function savePdi(pdiData) {
  const p = getDbPool();
  if (!p) return { success: false, message: "Base de datos no conectada" };
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
        pdiData.mentorName || "",
        pdiData.mentorRole || "",
        JSON.stringify(pdiData.goals || []),
        JSON.stringify(pdiData.breaches || []),
        JSON.stringify(pdiData.signatures || {}),
        pdiData.status || "En Ejecuci\xF3n"
      ]
    );
    return { success: true, message: "PDI guardado con \xE9xito en la base de datos." };
  } catch (err) {
    console.error("[PostgreSQL] Error al guardar PDI:", err.message);
    return { success: false, message: err.message };
  } finally {
    client.release();
  }
}
async function authenticateUser(username, password) {
  const cleanUser = (username || "").replace(/\D/g, "").trim();
  const cleanPass = (password || "").replace(/\D/g, "").trim();
  if (!cleanUser || !cleanPass) {
    return { success: false, message: "Debe ingresar su n\xFAmero de c\xE9dula" };
  }
  if (cleanUser !== cleanPass) {
    return { success: false, message: "Contrase\xF1a incorrecta (por defecto debe ser su n\xFAmero de c\xE9dula)" };
  }
  const p = getDbPool();
  if (!p) {
    const supa = getSupabaseClient();
    if (supa) {
      try {
        const { data, error } = await supa.from("collaborators").select("*").or(`id_number.eq.${cleanUser},id.eq.emp-${cleanUser}`).limit(1).maybeSingle();
        if (error || !data) {
          return {
            success: false,
            message: `No se encontr\xF3 ning\xFAn colaborador con la c\xE9dula ${cleanUser} en Supabase.`
          };
        }
        const isNataliaMaster = cleanUser === "26475804" || (data.first_name || "").toLowerCase().includes("natalia") && ((data.last_name || "").toLowerCase().includes("rodriguez") || (data.last_name || "").toLowerCase().includes("montilla"));
        const posLower = (data.position || "").toLowerCase();
        const mgmtLevel = isNataliaMaster ? "ESTRAT\xC9GICO" : posLower.includes("director") || posLower.includes("gerente") || posLower.includes("cio") ? "ESTRAT\xC9GICO" : posLower.includes("coordinador") || posLower.includes("supervisor") ? "T\xC9CNICO / INTERMEDIO" : "OPERATIVO";
        const role = isNataliaMaster ? "admin" : posLower.includes("director") ? "director" : posLower.includes("gerente") ? "supervisor" : "colaborador";
        return {
          success: true,
          message: isNataliaMaster ? "\xA1Bienvenida, Natalia Rodr\xEDguez! Sesi\xF3n iniciada como Administrador Maestro." : "Autenticaci\xF3n exitosa",
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
      } catch (err) {
        return { success: false, message: `Error al autenticar con Supabase: ${err.message}` };
      }
    }
    return {
      success: false,
      message: "Base de datos PostgreSQL / Supabase no conectada en backend (se usar\xE1 autenticaci\xF3n local)"
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
        message: `No se encontr\xF3 ning\xFAn colaborador con la c\xE9dula ${cleanUser} en la base de datos.`
      };
    }
    const row = res.rows[0];
    const isNataliaMaster = cleanUser === "26475804" || (row.first_name || "").toLowerCase().includes("natalia") && ((row.last_name || "").toLowerCase().includes("rodriguez") || (row.last_name || "").toLowerCase().includes("montilla"));
    const posLower = (row.position || "").toLowerCase();
    const mgmtLevel = isNataliaMaster ? "ESTRAT\xC9GICO" : row.management_level || (posLower.includes("director") || posLower.includes("gerente") || posLower.includes("cio") ? "ESTRAT\xC9GICO" : posLower.includes("coordinador") || posLower.includes("supervisor") ? "T\xC9CNICO / INTERMEDIO" : "OPERATIVO");
    const role = isNataliaMaster ? "admin" : row.user_role || (posLower.includes("director") ? "director" : posLower.includes("gerente") ? "supervisor" : "colaborador");
    return {
      success: true,
      message: isNataliaMaster ? "\xA1Bienvenida, Natalia Rodr\xEDguez! Sesi\xF3n iniciada como Administrador Maestro." : "Autenticaci\xF3n exitosa",
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
  } catch (err) {
    return { success: false, message: `Error al autenticar: ${err.message}` };
  } finally {
    client.release();
  }
}

// src/server/handlers/ping.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method === "POST") {
    try {
      const { action } = req.body || {};
      if (action === "sync-census") {
        const result = await syncCollaboratorsBatch(req.body.collaborators);
        return res.status(200).json(result);
      }
      if (action === "sync-positions") {
        const result = await syncJobPositionsBatch(req.body.positions);
        return res.status(200).json(result);
      }
      if (action === "login") {
        const result = await authenticateUser(req.body.username, req.body.password);
        return res.status(200).json(result);
      }
      if (action === "init") {
        const result = await initTables();
        return res.status(200).json(result);
      }
      if (action === "save-evaluation") {
        const result = await saveEvaluation(req.body.evaluation);
        return res.status(200).json(result);
      }
      if (action === "save-pdi") {
        const result = await savePdi(req.body.pdi);
        return res.status(200).json(result);
      }
      return res.status(400).json({ success: false, message: `Acci\xF3n desconocida: ${action}` });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  try {
    const status = await testConnection();
    return res.status(200).json({
      pong: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      env: process.env.NODE_ENV || "unknown",
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      ...status
    });
  } catch (err) {
    return res.status(200).json({
      pong: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      connected: false,
      provider: "none",
      totalCollaborators: 0,
      totalEvaluations: 0,
      message: `Error al probar conexi\xF3n: ${err.message}`
    });
  }
}
export {
  handler as default
};

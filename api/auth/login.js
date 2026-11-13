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

// src/server/handlers/login.ts
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Usuario y contrase\xF1a requeridos" });
    }
    const result = await authenticateUser(username, password);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
export {
  handler as default
};
